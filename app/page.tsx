"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { GeminiLiveClient } from "@/lib/live/gemini-live-client";
import { AudioRecorder } from "@/lib/audio/recorder";
import { AudioPlayer } from "@/lib/audio/player";
import { LiveSessionState, TranscriptTurn, LiveToolCallRecord } from "@/lib/live/types";
import { PostCallSummary as PostCallSummaryType } from "@/lib/summary/types";
import { StorefrontView } from "@/components/StorefrontView";
import { AriaConciergeView } from "@/components/AriaConciergeView";
import { PostCallSummary } from "@/components/PostCallSummary";
import { TextTestModal } from "@/components/TextTestModal";
import { AlertTriangle } from "lucide-react";
import { CONFIG } from "@/lib/config";

export default function Home() {
  const [currentView, setCurrentView] = useState<"storefront" | "aria">("storefront");
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);

  const [liveState, setLiveState] = useState<LiveSessionState>("idle");
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [toolCalls, setToolCalls] = useState<LiveToolCallRecord[]>([]);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [vadSilenceMs, setVadSilenceMs] = useState<number>(CONFIG.VAD.DEFAULT_SILENCE_DURATION_MS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Summary State
  const [summary, setSummary] = useState<PostCallSummaryType | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isSummaryFallback, setIsSummaryFallback] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Text Test Modal
  const [isTextTestOpen, setIsTextTestOpen] = useState(false);

  // Hardware & Network Client Instances
  const liveClientRef = useRef<GeminiLiveClient | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const hasReceivedFirstAudioRef = useRef<boolean>(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recorderRef.current?.stop();
      playerRef.current?.close();
      liveClientRef.current?.disconnect();
    };
  }, []);

  /**
   * Handle End Call: Clean up audio hardware and fetch post-call summary.
   */
  const handleEndCall = useCallback(async () => {
    recorderRef.current?.stop();
    playerRef.current?.stopAll();
    liveClientRef.current?.disconnect();
    setLiveState("idle");
    setMicLevel(0);

    // Fetch Post-Call Structured Summary
    if (turns.length > 0) {
      setIsSummaryLoading(true);
      setShowSummaryModal(true);

      try {
        const resp = await fetch("/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: turns,
            toolCalls: toolCalls,
          }),
        });

        const data = await resp.json();
        setSummary(data.summary || null);
        setIsSummaryFallback(Boolean(data.isFallback));
      } catch (err) {
        console.error("Failed to fetch post-call summary:", err);
      } finally {
        setIsSummaryLoading(false);
      }
    }
  }, [turns, toolCalls]);

  /**
   * Handle Start Call: Pre-warm audio, fetch token, connect WebSocket, start recording.
   */
  const handleStartCall = async () => {
    if (liveState !== "idle" && liveState !== "error") return;

    setErrorMessage(null);
    setLatencyMs(null);
    setTurns([]);
    setToolCalls([]);
    setSummary(null);
    setShowSummaryModal(false);
    hasReceivedFirstAudioRef.current = false;
    callStartTimeRef.current = Date.now();

    try {
      setLiveState("connecting");

      // 1. Pre-warm AudioPlayer in user gesture context (browser autoplay requirement)
      if (!playerRef.current) {
        playerRef.current = new AudioPlayer({
          onPlaybackComplete: () => {
            liveClientRef.current?.onPlaybackComplete();
          },
        });
      }
      await playerRef.current.prewarm();

      // 2. Fetch Ephemeral Token from our secure backend API route
      const tokenResp = await fetch("/api/token", { method: "POST" });
      const tokenData = await tokenResp.json();

      if (!tokenResp.ok || !tokenData.token) {
        throw new Error(
          tokenData.message ||
            tokenData.error ||
            "Failed to obtain session token from /api/token"
        );
      }

      // 3. Initialize Gemini Live Client
      liveClientRef.current = new GeminiLiveClient({
        onStateChange: (state) => {
          setLiveState(state);
        },
        onAudioData: (base64) => {
          // Track time-to-first-audio latency
          if (!hasReceivedFirstAudioRef.current && callStartTimeRef.current) {
            hasReceivedFirstAudioRef.current = true;
            const diff = Date.now() - callStartTimeRef.current;
            setLatencyMs(diff);
          }
          playerRef.current?.playChunk(base64);
        },
        onTranscriptChunk: (turn) => {
          setTurns((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === turn.role) {
              const updated = [...prev];
              const incoming = turn.text.trim();
              let mergedText: string;

              if (incoming.startsWith(last.text)) {
                // Incoming is cumulative transcript containing previous words
                mergedText = incoming;
              } else if (last.text.endsWith(incoming)) {
                // Already includes this incoming chunk
                mergedText = last.text;
              } else {
                mergedText = `${last.text} ${incoming}`.trim();
              }

              updated[updated.length - 1] = {
                ...last,
                text: mergedText,
                timestamp: turn.timestamp,
              };
              return updated;
            }
            return [...prev, turn];
          });
        },
        onToolCall: (record) => {
          setToolCalls((prev) => [...prev, record]);
        },
        onInterrupted: () => {
          // Barge-in: immediately stop all playing audio
          playerRef.current?.stopAll();
        },
        onError: (err) => {
          setErrorMessage(err.message || "An error occurred during the call.");
          handleEndCall();
        },
        onClose: () => {
          setLiveState("idle");
        },
      });

      // 4. Initialize and start microphone recorder
      if (!recorderRef.current) {
        recorderRef.current = new AudioRecorder({
          onChunk: (base64, rms) => {
            liveClientRef.current?.sendAudioChunk(base64, rms);
          },
          onVolume: (rms) => {
            setMicLevel(rms);
          },
          onError: (err) => {
            setErrorMessage(err.message || "Microphone recording error.");
            handleEndCall();
          },
        });
      }
      await recorderRef.current.start();

      // 5. Connect WebSocket to Gemini Live API with configured turn latency
      await liveClientRef.current.connect(tokenData.token, vadSilenceMs);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initiate call session";
      console.error("[StartCall Error]:", msg);
      setErrorMessage(msg);
      setLiveState("error");
      recorderRef.current?.stop();
      playerRef.current?.stopAll();
    }
  };

  /**
   * Send a text message turn (used in Text Test Mode or Suggested Inquiries).
   */
  const handleSendTextMessage = (text: string) => {
    if (liveClientRef.current) {
      liveClientRef.current.sendTextMessage(text);
    }
  };

  const isCallActive =
    liveState === "listening" || liveState === "speaking" || liveState === "thinking";

  const handleNavigateToAria = (prompt?: string) => {
    setCurrentView("aria");
    if (prompt) {
      setInitialPrompt(prompt);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleNavigateToStorefront = () => {
    setCurrentView("storefront");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <div className="w-full min-h-screen bg-[#fcf9f4] text-[#4a2d30] relative overflow-x-hidden">
      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[90%] p-3.5 rounded-2xl bg-[#faecea] border border-[#d89a9e] text-xs text-[#9a4b52] flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#ba1a1a] shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-[#9a4b52] hover:text-[#3c2225] font-semibold cursor-pointer text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Conditionally Render: Storefront OR Dedicated Aria Concierge Screen */}
      {currentView === "storefront" ? (
        <StorefrontView
          onNavigateToAria={handleNavigateToAria}
          isCallActive={isCallActive}
        />
      ) : (
        <AriaConciergeView
          liveState={liveState}
          micLevel={micLevel}
          latencyMs={latencyMs}
          vadSilenceMs={vadSilenceMs}
          onVadSilenceMsChange={setVadSilenceMs}
          turns={turns}
          toolCalls={toolCalls}
          onStartCall={handleStartCall}
          onEndCall={handleEndCall}
          onSendTextMessage={handleSendTextMessage}
          onOpenTextTest={() => setIsTextTestOpen(true)}
          onNavigateToStorefront={handleNavigateToStorefront}
          initialPrompt={initialPrompt}
          onClearInitialPrompt={() => setInitialPrompt(null)}
        />
      )}

      {/* Post-Call Summary Modal */}
      {showSummaryModal && (
        <PostCallSummary
          summary={summary}
          isLoading={isSummaryLoading}
          isFallback={isSummaryFallback}
          transcript={turns}
          toolCalls={toolCalls}
          onClose={() => setShowSummaryModal(false)}
        />
      )}

      {/* Text Test Modal */}
      <TextTestModal
        isOpen={isTextTestOpen}
        onClose={() => setIsTextTestOpen(false)}
        onSendMessage={handleSendTextMessage}
        isCallActive={isCallActive}
        onStartCall={handleStartCall}
      />
    </div>
  );
}
