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

export default function Home() {
  const [currentView, setCurrentView] = useState<"storefront" | "aria">("storefront");
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);

  const [liveState, setLiveState] = useState<LiveSessionState>("idle");
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [toolCalls, setToolCalls] = useState<LiveToolCallRecord[]>([]);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [vadSilenceMs, setVadSilenceMs] = useState<number>(700);
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

  // Synchronized refs to avoid stale closures in handleEndCall
  const turnsRef = useRef<TranscriptTurn[]>(turns);
  turnsRef.current = turns;
  const toolCallsRef = useRef<LiveToolCallRecord[]>(toolCalls);
  toolCallsRef.current = toolCalls;

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

    const currentTurns = turnsRef.current;
    const currentToolCalls = toolCallsRef.current;

    // Always display post-call summary modal
    setIsSummaryLoading(true);
    setShowSummaryModal(true);

    try {
      const resp = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: currentTurns,
          toolCalls: currentToolCalls,
        }),
      });

      const data = await resp.json();
      if (data && data.summary) {
        setSummary(data.summary);
        setIsSummaryFallback(Boolean(data.isFallback));
      } else {
        const cancelCall = currentToolCalls.find((t) => t.toolName === "cancel_order");
        const cancelResult = cancelCall?.result as { success?: boolean; order_id?: string } | undefined;
        const cancelSuccess = cancelResult?.success === true;

        const orderCall = currentToolCalls.find((t) => t.toolName === "get_order_details");
        const orderResult = orderCall?.result as { canonical_id?: string; order?: { status?: string } } | undefined;

        const orderId =
          cancelResult?.order_id ||
          (cancelCall?.args as { order_id?: string })?.order_id ||
          orderResult?.canonical_id ||
          (orderCall?.args as { order_id?: string })?.order_id ||
          null;

        let resolution: PostCallSummaryType["resolution_status"] = "RESOLVED";
        let summaryText = "Call concluded with Aria specialist.";
        let policyText = "Aria Brand Policy";

        if (cancelCall) {
          if (cancelSuccess) {
            resolution = "RESOLVED";
            summaryText = `Order ${orderId || "ORD-103"} was successfully cancelled in the database. Full refund initiated.`;
            policyText = "Cancellation Policy: Processing orders eligible for full refund.";
          } else {
            resolution = "OUT_OF_POLICY";
            summaryText = `Customer requested cancellation for order ${orderId || "ORD-101"}. Cancellation was denied because the order is out for delivery. Doorstep refusal recommended.`;
            policyText = "Cancellation Policy: Shipped or Out for Delivery orders cannot be cancelled online.";
          }
        }

        setSummary({
          customer_intent: cancelCall ? "CANCELLATION_REQUEST" : "ORDER_TRACKING",
          order_id: orderId,
          resolution_status: resolution,
          call_summary:
            currentTurns.length > 0 && !cancelCall
              ? "Completed voice interaction with Aria customer concierge."
              : summaryText,
          policy_applied: policyText,
          tools_used: currentToolCalls.map((t) => t.toolName),
          customer_sentiment: "neutral",
          follow_up_needed: false,
        });
      }
    } catch (err) {
      console.error("Failed to fetch post-call summary:", err);
      const cancelCall = currentToolCalls.find((t) => t.toolName === "cancel_order");
      const cancelSuccess = (cancelCall?.result as { success?: boolean })?.success === true;
      setSummary({
        customer_intent: cancelCall ? "CANCELLATION_REQUEST" : "OTHER",
        order_id: (cancelCall?.args as { order_id?: string })?.order_id || null,
        resolution_status: cancelCall ? (cancelSuccess ? "RESOLVED" : "OUT_OF_POLICY") : "RESOLVED",
        call_summary: cancelCall
          ? (cancelSuccess
              ? "Order cancellation completed successfully in database."
              : "Order cancellation denied because order is out for delivery.")
          : "Call completed with Aria.",
        policy_applied: cancelCall ? "Aria Cancellation Policy" : null,
        tools_used: currentToolCalls.map((t) => t.toolName),
        customer_sentiment: "neutral",
        follow_up_needed: false,
      });
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

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
            const existingIdx = prev.findIndex((t) => t.id === turn.id);
            if (existingIdx !== -1) {
              const updated = [...prev];
              const existing = updated[existingIdx];
              const delta = turn.text;
              let merged = existing.text;
              if (delta) {
                if (!merged) {
                  merged = delta;
                } else if (merged.endsWith(" ") || delta.startsWith(" ") || /^[,.?!:;'\-]/.test(delta)) {
                  merged = (merged + delta).replace(/  +/g, " ");
                } else {
                  merged = merged + " " + delta;
                }
              }
              updated[existingIdx] = {
                ...existing,
                text: merged,
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
          onSpeech: (text) => {
            setTurns((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === "user" && (last.text.includes(text) || text.includes(last.text))) {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...last,
                  text: text.length >= last.text.length ? text : last.text,
                  timestamp: new Date().toLocaleTimeString(),
                };
                return updated;
              }
              return [
                ...prev,
                {
                  id: `user_${Date.now()}`,
                  role: "user",
                  text,
                  timestamp: new Date().toLocaleTimeString(),
                },
              ];
            });
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
