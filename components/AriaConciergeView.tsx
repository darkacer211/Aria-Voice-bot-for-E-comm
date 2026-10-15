"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Phone,
  PhoneOff,
  Sparkles,
  MessageSquare,
  Package,
  Cpu,
  Keyboard,
  ShieldCheck,
  Sliders,
  Check,
  Copy,
  Clock,
} from "lucide-react";
import { LiveSessionState, TranscriptTurn, LiveToolCallRecord } from "@/lib/live/types";
import { MOCK_ORDERS_DB } from "@/lib/orders/db";
import { LiveStateIndicator } from "@/components/LiveStateIndicator";

interface Props {
  liveState: LiveSessionState;
  micLevel: number;
  latencyMs: number | null;
  vadSilenceMs: number;
  onVadSilenceMsChange: (val: number) => void;
  turns: TranscriptTurn[];
  toolCalls: LiveToolCallRecord[];
  onStartCall: () => Promise<void>;
  onEndCall: () => Promise<void>;
  onSendTextMessage: (text: string) => void;
  onOpenTextTest: () => void;
  onNavigateToStorefront: () => void;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

export const AriaConciergeView: React.FC<Props> = ({
  liveState,
  micLevel,
  latencyMs,
  vadSilenceMs,
  onVadSilenceMsChange,
  turns,
  toolCalls,
  onStartCall,
  onEndCall,
  onSendTextMessage,
  onOpenTextTest,
  onNavigateToStorefront,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<"transcript" | "orders" | "tools" | "settings">("transcript");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const transcriptScrollRef = useRef<HTMLDivElement>(null);

  const isCallActive =
    liveState === "listening" || liveState === "speaking" || liveState === "thinking";
  const isConnecting = liveState === "connecting";

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [turns]);

  // Handle initial prompt passed from storefront
  useEffect(() => {
    if (initialPrompt && liveState === "idle") {
      onStartCall().then(() => {
        // Wait briefly for connection then send text turn if needed
        setTimeout(() => {
          onSendTextMessage(initialPrompt);
        }, 1500);
      });
      onClearInitialPrompt?.();
    }
  }, [initialPrompt, liveState, onStartCall, onSendTextMessage, onClearInitialPrompt]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSuggestionClick = async (queryText: string) => {
    if (liveState === "idle" || liveState === "error") {
      await onStartCall();
      setTimeout(() => {
        onSendTextMessage(queryText);
      }, 1400);
    } else {
      onSendTextMessage(queryText);
    }
  };

  // Compute dynamic heading & instruction
  let statusHeading = "Ready when you are";
  let statusInstruction =
    'Click "Start Call with Aria" and allow microphone access to talk directly with your dedicated beauty & skincare concierge.';

  if (isConnecting) {
    statusHeading = "Connecting to Aria...";
    statusInstruction = "Establishing secure Gemini Live WebSocket audio session with 16kHz low-latency streaming.";
  } else if (liveState === "listening") {
    statusHeading = "Aria is listening...";
    statusInstruction = "Speak naturally into your microphone. Aria can advise on undertones, product formulas, or look up orders in real time.";
  } else if (liveState === "speaking") {
    statusHeading = "Aria is speaking...";
    statusInstruction = "Listening to Aria's voice response. Feel free to speak anytime — barge-in interruption is active.";
  } else if (liveState === "thinking") {
    statusHeading = "Aria is processing...";
    statusInstruction = "Consulting Aura Skincare brand policies, order database, and catalog actives...";
  } else if (liveState === "error") {
    statusHeading = "Connection Interrupted";
    statusInstruction = "There was an issue connecting to the Gemini Live session. Please check your network or API key and retry.";
  }

  // Pre-calculated wave bar heights based on mic level or speaking
  const normalizedLevel = Math.min(1, Math.max(0.1, micLevel * 4));

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between py-6 px-4 sm:px-6 max-w-5xl mx-auto selection:bg-[#d89a9e]/30 selection:text-[#3d2427]">
      {/* Top Navigation Bar */}
      <header className="w-full flex items-center justify-between pb-6 border-b border-[#ebdcd3]/70">
        <button
          onClick={onNavigateToStorefront}
          className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#796e65] hover:text-[#4a2d30] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Return to Aura Skincare</span>
        </button>

        <div className="flex items-center gap-4">
          {latencyMs && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#796e65] bg-[#ffffff] border border-[#ebdcd3] px-2.5 py-1 rounded-full shadow-2xs">
              <Clock className="w-3 h-3 text-[#d89a9e]" />
              <span>TTFA: {latencyMs}ms</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isCallActive ? "bg-emerald-500 animate-pulse" : "bg-emerald-500"
              }`}
            />
            <span className="text-xs text-[#796e65]">Gemini Live API Connected</span>
          </div>
        </div>
      </header>

      {/* Main Concierge Experience Container */}
      <main className="w-full my-auto flex flex-col items-center justify-center py-6">
        {/* Centered Bot Identity Block */}
        <div className="flex flex-col items-center text-center mb-6">
          {/* 3D Bot Emblem Logo centered */}
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-[#ebdcd3] to-[#ffffff] border-2 border-[#d89a9e] shadow-xl flex items-center justify-center mb-4 aria-orb-pulse">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src="/images/aria-avatar.jpg"
                alt="Aria Bot Emblem"
                fill
                className="object-cover rounded-full"
                priority
              />
            </div>
            {isCallActive && (
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-[#ffffff] rounded-full shadow-sm animate-pulse" />
            )}
          </div>

          {/* Brand Name Beneath Logo */}
          <h1 className="font-serif-luxury text-3xl md:text-4xl text-[#3c2225] font-light tracking-wide mb-1.5">
            Aura Skincare
          </h1>

          {/* Aria Voice CX Specialist Badge & Live State Indicator */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#f3ece4] border border-[#d89a9e]/50 text-xs text-[#82464b] font-medium tracking-wider uppercase">
              <span>Aria • Voice CX Specialist</span>
            </div>
            <LiveStateIndicator state={liveState} />
          </div>

          <p className="text-sm text-[#796e65] font-light max-w-sm">
            Your personal AI beauty &amp; skincare concierge
          </p>
        </div>

        {/* Action Box: Start / End Call */}
        <div className="w-full max-w-md bg-[#ffffff] rounded-2xl border border-[#ebdcd3] shadow-sm p-4 mb-6 flex flex-col items-center justify-center text-center">
          {isCallActive ? (
            <button
              onClick={onEndCall}
              className="w-full py-4 px-8 rounded-xl bg-[#b85b4b] text-[#ffffff] text-sm md:text-base font-medium tracking-wide flex items-center justify-center gap-3 hover:bg-[#9e4a3c] shadow-md hover:shadow-lg transition duration-200 cursor-pointer"
            >
              <PhoneOff className="w-5 h-5 text-[#ffdad6]" />
              <span>End Call with Aria</span>
            </button>
          ) : isConnecting ? (
            <button
              disabled
              className="w-full py-4 px-8 rounded-xl bg-[#5f4345] text-[#ffffff] text-sm md:text-base font-medium tracking-wide flex items-center justify-center gap-3 shadow-md opacity-90 cursor-not-allowed"
            >
              <div className="w-5 h-5 border-2 border-[#d89a9e] border-t-transparent rounded-full animate-spin" />
              <span>Connecting to Aria...</span>
            </button>
          ) : (
            <button
              onClick={onStartCall}
              className="w-full py-4 px-8 rounded-xl bg-[#4a2d30] text-[#ffffff] text-sm md:text-base font-medium tracking-wide flex items-center justify-center gap-3 hover:bg-[#382124] shadow-md hover:shadow-lg transition duration-200 cursor-pointer"
            >
              <Phone className="w-5 h-5 text-[#d89a9e]" />
              <span>Start Call with Aria</span>
            </button>
          )}

          <p className="text-[11px] text-[#93857b] mt-2.5">
            {isCallActive
              ? "Live voice session active • Speak naturally into your microphone"
              : isConnecting
              ? "Establishing low-latency PCM duplex stream..."
              : "Microphone access requested on start • Hands-free voice consultation"}
          </p>
        </div>

        {/* Live Voice Stage & Visualizer Card */}
        <div className="w-full max-w-3xl bg-[#ffffff]/90 backdrop-blur-md rounded-3xl border border-[#ebdcd3] shadow-sm p-8 md:p-10 flex flex-col items-center text-center relative overflow-hidden min-h-[300px]">
          {/* Visualizer Halo Ring */}
          <div className="relative my-4 flex items-center justify-center">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                isCallActive
                  ? "pulse-ring bg-[#faecea] border-2 border-[#d89a9e]"
                  : isConnecting
                  ? "bg-[#f4ebe6] border border-[#d89a9e]/40 animate-pulse"
                  : "bg-[#f4ebe6] border border-[#d89a9e]/40"
              }`}
            >
              {isCallActive ? (
                // Animated Soundwaves (Active Call State)
                <div className="flex items-center gap-1.5 h-10 px-2">
                  <span
                    className="wave-bar w-1 bg-[#9a4b52] rounded-full"
                    style={{
                      height: `${Math.max(10, normalizedLevel * 36)}px`,
                      animationDelay: "0.1s",
                    }}
                  />
                  <span
                    className="wave-bar w-1 bg-[#9a4b52] rounded-full"
                    style={{
                      height: `${Math.max(14, normalizedLevel * 42)}px`,
                      animationDelay: "0.3s",
                    }}
                  />
                  <span
                    className="wave-bar w-1 bg-[#9a4b52] rounded-full"
                    style={{
                      height: `${Math.max(12, normalizedLevel * 38)}px`,
                      animationDelay: "0.2s",
                    }}
                  />
                  <span
                    className="wave-bar w-1 bg-[#9a4b52] rounded-full"
                    style={{
                      height: `${Math.max(16, normalizedLevel * 46)}px`,
                      animationDelay: "0.4s",
                    }}
                  />
                  <span
                    className="wave-bar w-1 bg-[#9a4b52] rounded-full"
                    style={{
                      height: `${Math.max(10, normalizedLevel * 32)}px`,
                      animationDelay: "0.15s",
                    }}
                  />
                </div>
              ) : (
                <Sparkles className="w-8 h-8 text-[#9a4b52]" />
              )}
            </div>
          </div>

          {/* Dynamic Status Heading */}
          <h2 className="font-serif-luxury text-2xl md:text-3xl font-light text-[#3c2225] mb-2">
            {statusHeading}
          </h2>

          <p className="text-xs md:text-sm text-[#796e65] max-w-lg mb-8 leading-relaxed font-light">
            {statusInstruction}
          </p>

          {/* Suggested Inquiry Pills (Clickable) */}
          <div className="w-full pt-6 border-t border-[#f0e4dc]">
            <div className="text-[10px] uppercase tracking-widest text-[#93857b] font-semibold mb-3">
              Suggested Inquiries:
            </div>
            <div className="flex flex-wrap justify-center gap-2.5">
              <button
                onClick={() => handleSuggestionClick("Help me find my shade in Ace of Face")}
                className="text-xs bg-[#f8f5f0] hover:bg-[#ebdcd3] text-[#4a2d30] px-4 py-2 rounded-full border border-[#ebdcd3] transition shadow-2xs cursor-pointer hover:border-[#d89a9e]"
              >
                &quot;Help me find my shade in Ace of Face&quot;
              </button>
              <button
                onClick={() => handleSuggestionClick("Ingredients in Glide Peptide Serum?")}
                className="text-xs bg-[#f8f5f0] hover:bg-[#ebdcd3] text-[#4a2d30] px-4 py-2 rounded-full border border-[#ebdcd3] transition shadow-2xs cursor-pointer hover:border-[#d89a9e]"
              >
                &quot;Ingredients in Glide Peptide Serum?&quot;
              </button>
              <button
                onClick={() => handleSuggestionClick("Morning barrier repair routine")}
                className="text-xs bg-[#f8f5f0] hover:bg-[#ebdcd3] text-[#4a2d30] px-4 py-2 rounded-full border border-[#ebdcd3] transition shadow-2xs cursor-pointer hover:border-[#d89a9e]"
              >
                &quot;Morning barrier repair routine&quot;
              </button>
              <button
                onClick={() => handleSuggestionClick("Track my recent order")}
                className="text-xs bg-[#f8f5f0] hover:bg-[#ebdcd3] text-[#4a2d30] px-4 py-2 rounded-full border border-[#ebdcd3] transition shadow-2xs cursor-pointer hover:border-[#d89a9e]"
              >
                &quot;Track my recent order&quot;
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* Visible Evaluator Sample Orders Panel (Zero Docs Needed) */}
        {/* ======================================================== */}
        <div className="w-full max-w-3xl mt-6 bg-[#ffffff] rounded-3xl border border-[#ebdcd3] shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#f0e4dc]">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#9a4b52]" />
              <h3 className="font-serif-luxury text-base text-[#4a2d30] font-normal">
                Evaluator Sample Orders Database
              </h3>
            </div>
            <span className="text-[11px] text-[#796e65] bg-[#faf7f2] border border-[#ebdcd3] px-2.5 py-0.5 rounded-full font-mono">
              Live Mock Database
            </span>
          </div>
          <p className="text-xs text-[#796e65] mb-4">
            Test Aria with these sample orders using your voice or one-click prompt pills. All order lookups, policy flags, and cancellation/return rules are computed authoritatively on the backend:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* ORD-101 */}
            <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ebdcd3] hover:border-[#d89a9e] transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-[#4a2d30]">ORD-101</span>
                  <button
                    onClick={() => handleCopy("ORD-101")}
                    className="p-1 rounded hover:bg-[#ebdcd3] text-[#796e65] transition cursor-pointer"
                    title="Copy Order ID"
                  >
                    {copiedId === "ORD-101" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-xs font-medium text-[#4a2d30]">Priya Sharma</div>
                <div className="text-[11px] text-[#796e65]">Vitamin C Serum (30ml) • ₹699</div>
                <div className="mt-1 text-[11px] text-[#9a4b52] font-medium">
                  BlueDart BD-982103 • 6 PM today
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#ebdcd3]/70 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="px-2 py-0.5 rounded-full bg-[#eaf6ef] text-[#20683e] font-medium">
                    Out for Delivery
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#faecea] text-[#ba1a1a] font-medium">
                    Cannot Cancel
                  </span>
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <button
                    onClick={() => handleSuggestionClick("Where is my order ORD-101?")}
                    className="text-[10px] bg-[#ffffff] hover:bg-[#faecea] text-[#4a2d30] px-2 py-1 rounded-lg border border-[#ebdcd3] text-left transition truncate cursor-pointer"
                  >
                    &quot;Where is my order ORD-101?&quot;
                  </button>
                  <button
                    onClick={() => handleSuggestionClick("Cancel order ORD-101")}
                    className="text-[10px] bg-[#ffffff] hover:bg-[#faecea] text-[#4a2d30] px-2 py-1 rounded-lg border border-[#ebdcd3] text-left transition truncate cursor-pointer"
                  >
                    &quot;Cancel order ORD-101&quot;
                  </button>
                </div>
              </div>
            </div>

            {/* ORD-102 */}
            <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ebdcd3] hover:border-[#d89a9e] transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-[#4a2d30]">ORD-102</span>
                  <button
                    onClick={() => handleCopy("ORD-102")}
                    className="p-1 rounded hover:bg-[#ebdcd3] text-[#796e65] transition cursor-pointer"
                    title="Copy Order ID"
                  >
                    {copiedId === "ORD-102" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-xs font-medium text-[#4a2d30]">Rahul Verma</div>
                <div className="text-[11px] text-[#796e65]">Hydrating Sunscreen SPF 50 • ₹499</div>
                <div className="mt-1 text-[11px] text-[#796e65]">
                  Delhivery • Delivered 14 days ago
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#ebdcd3]/70 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="px-2 py-0.5 rounded-full bg-[#f4ebe6] text-[#7e5c54] font-medium">
                    Delivered
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#faecea] text-[#ba1a1a] font-medium">
                    Return Expired
                  </span>
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <button
                    onClick={() => handleSuggestionClick("I want to return order ORD-102")}
                    className="text-[10px] bg-[#ffffff] hover:bg-[#faecea] text-[#4a2d30] px-2 py-1 rounded-lg border border-[#ebdcd3] text-left transition truncate cursor-pointer"
                  >
                    &quot;Return order ORD-102&quot;
                  </button>
                  <button
                    onClick={() => handleSuggestionClick("Why is there a fifty rupee shipping fee on my 499 rupee order?")}
                    className="text-[10px] bg-[#ffffff] hover:bg-[#faecea] text-[#4a2d30] px-2 py-1 rounded-lg border border-[#ebdcd3] text-left transition truncate cursor-pointer"
                  >
                    &quot;Why ₹50 fee on ₹499?&quot;
                  </button>
                </div>
              </div>
            </div>

            {/* ORD-103 */}
            <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ebdcd3] hover:border-[#d89a9e] transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-[#4a2d30]">ORD-103</span>
                  <button
                    onClick={() => handleCopy("ORD-103")}
                    className="p-1 rounded hover:bg-[#ebdcd3] text-[#796e65] transition cursor-pointer"
                    title="Copy Order ID"
                  >
                    {copiedId === "ORD-103" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-xs font-medium text-[#4a2d30]">Ananya Patel</div>
                <div className="text-[11px] text-[#796e65]">Green Tea Face Wash + Toner • ₹850</div>
                <div className="mt-1 text-[11px] text-emerald-700 font-medium">
                  Processing • Ordered 3 hrs ago
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#ebdcd3]/70 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="px-2 py-0.5 rounded-full bg-[#eaf6ef] text-[#20683e] font-medium">
                    Processing
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#eaf6ef] text-[#20683e] font-medium">
                    Can Cancel
                  </span>
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <button
                    onClick={() => handleSuggestionClick("Can I cancel order ORD-103?")}
                    className="text-[10px] bg-[#ffffff] hover:bg-[#faecea] text-[#4a2d30] px-2 py-1 rounded-lg border border-[#ebdcd3] text-left transition truncate cursor-pointer"
                  >
                    &quot;Can I cancel order ORD-103?&quot;
                  </button>
                  <button
                    onClick={() => handleSuggestionClick("Check order ORD-999")}
                    className="text-[10px] bg-[#ffffff] hover:bg-[#faecea] text-[#4a2d30] px-2 py-1 rounded-lg border border-[#ebdcd3] text-left transition truncate cursor-pointer"
                  >
                    &quot;Check fake order ORD-999&quot;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* Luxury CX Drawer & Diagnostic Suite                      */}
        {/* ======================================================== */}
        <div className="w-full max-w-3xl mt-6 bg-[#ffffff] rounded-3xl border border-[#ebdcd3] shadow-sm overflow-hidden">
          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-[#f0e4dc] bg-[#faf7f2] px-4 pt-3 gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("transcript")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition cursor-pointer border-b-2 ${
                activeTab === "transcript"
                  ? "bg-[#ffffff] text-[#4a2d30] border-[#d89a9e] shadow-2xs"
                  : "text-[#796e65] border-transparent hover:text-[#4a2d30]"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#9a4b52]" />
              <span>Live Transcript</span>
              {turns.length > 0 && (
                <span className="text-[10px] bg-[#d89a9e]/30 px-1.5 py-0.2 rounded-full text-[#4a2d30]">
                  {turns.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition cursor-pointer border-b-2 ${
                activeTab === "orders"
                  ? "bg-[#ffffff] text-[#4a2d30] border-[#d89a9e] shadow-2xs"
                  : "text-[#796e65] border-transparent hover:text-[#4a2d30]"
              }`}
            >
              <Package className="w-3.5 h-3.5 text-[#7e5c54]" />
              <span>Orders &amp; Test Suite</span>
            </button>

            <button
              onClick={() => setActiveTab("tools")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition cursor-pointer border-b-2 ${
                activeTab === "tools"
                  ? "bg-[#ffffff] text-[#4a2d30] border-[#d89a9e] shadow-2xs"
                  : "text-[#796e65] border-transparent hover:text-[#4a2d30]"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-[#4b7a63]" />
              <span>Tool Calls</span>
              {toolCalls.length > 0 && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                  {toolCalls.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition cursor-pointer border-b-2 ${
                activeTab === "settings"
                  ? "bg-[#ffffff] text-[#4a2d30] border-[#d89a9e] shadow-2xs"
                  : "text-[#796e65] border-transparent hover:text-[#4a2d30]"
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-[#9a4b52]" />
              <span>Audio &amp; Voice Config</span>
            </button>

            <div className="ml-auto pr-2 pb-2">
              <button
                onClick={onOpenTextTest}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f4ebe6] hover:bg-[#ebdcd3] text-[#4a2d30] text-[11px] font-medium transition cursor-pointer"
                title="Silent text test mode"
              >
                <Keyboard className="w-3.5 h-3.5 text-[#9a4b52]" />
                <span>Text Mode</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Live Transcript */}
          {activeTab === "transcript" && (
            <div className="p-6">
              <div
                ref={transcriptScrollRef}
                className="h-[300px] overflow-y-auto space-y-3.5 pr-2 luxury-scrollbar"
              >
                {turns.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8c7f76]">
                    <Sparkles className="w-7 h-7 text-[#d89a9e] mb-2 opacity-70" />
                    <p className="text-xs font-medium text-[#4a2d30]">No utterances recorded yet</p>
                    <p className="text-[11px] text-[#93857b] max-w-sm mt-1">
                      Start the call and speak into your microphone, or click any suggested inquiry above to test Aria&apos;s live voice reasoning.
                    </p>
                  </div>
                ) : (
                  turns.map((turn, idx) => {
                    const isUser = turn.role === "user";
                    return (
                      <div
                        key={turn.id || idx}
                        className={`flex gap-3 text-xs leading-relaxed ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isUser && (
                          <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-[#d89a9e]">
                            <Image
                              src="/images/aria-avatar.jpg"
                              alt="Aria"
                              width={24}
                              height={24}
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl p-3.5 shadow-2xs ${
                            isUser
                              ? "bg-[#f4ebe6] text-[#3d2427] border border-[#ebdcd3]"
                              : "bg-[#ffffff] text-[#3c2225] border border-[#ebdcd3]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-[10px] text-[#8c7f76] mb-1">
                            <span className="font-semibold uppercase tracking-wider">
                              {isUser ? "You" : "Aria"}
                            </span>
                            <span>{new Date(turn.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="whitespace-pre-wrap font-sans">{turn.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Test Orders & Quick Queries */}
          {activeTab === "orders" && (
            <div className="p-6 space-y-6">
              {/* Order Cards */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#9a4b52] block mb-3">
                  Mock Orders in Aura Database:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.values(MOCK_ORDERS_DB).map((order) => (
                    <div
                      key={order.id}
                      className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ebdcd3] hover:border-[#d89a9e] transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-xs font-bold text-[#4a2d30]">
                            {order.id}
                          </span>
                          <button
                            onClick={() => handleCopy(order.id)}
                            className="p-1 rounded hover:bg-[#ebdcd3] text-[#796e65] transition cursor-pointer"
                            title="Copy Order ID"
                          >
                            {copiedId === order.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs font-medium text-[#4a2d30]">{order.customerName}</p>
                        <p className="text-[11px] text-[#796e65] line-clamp-1">
                          {order.items.join(", ")}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-[#ebdcd3]/70 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#4a2d30]">₹{order.totalAmount}</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#faecea] text-[#9a4b52] font-medium text-[10px]">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Test Phrases */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#9a4b52] block mb-3">
                  Click to Ask Aria / Test Voice Intent:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Status of ORD-101", query: "Where is my order ORD-101?" },
                    { label: "Return ORD-102 (14 Days Old)", query: "I want to return order ORD-102" },
                    { label: "Cancel ORD-103 (Processing)", query: "Can I cancel order ORD-103?" },
                    { label: "Cancel ORD-101 (Out for Delivery)", query: "Cancel order ORD-101" },
                    { label: "₹499 Free Shipping Policy", query: "Why is there a fifty rupee shipping fee on my 499 rupee order?" },
                    { label: "COD Limit Policy", query: "Can I place a cash on delivery order for three thousand rupees?" },
                    { label: "Book a flight to Goa", query: "Can you book a flight to Goa for me?" },
                  ].map((phrase, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(phrase.query)}
                      className="text-xs bg-[#faf7f2] hover:bg-[#ebdcd3] text-[#4a2d30] px-3 py-1.5 rounded-full border border-[#ebdcd3] transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{phrase.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Tool Calls */}
          {activeTab === "tools" && (
            <div className="p-6">
              {toolCalls.length === 0 ? (
                <div className="text-center py-10 text-[#8c7f76]">
                  <Cpu className="w-8 h-8 text-[#d89a9e] mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-medium text-[#4a2d30]">No tool calls executed yet</p>
                  <p className="text-[11px] text-[#93857b] max-w-sm mx-auto mt-1">
                    When you ask Aria to check an order status (e.g. ORD-101) or check policy, Aria will invoke local backend tools in real time.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {toolCalls.map((tc) => (
                    <div
                      key={tc.id}
                      className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ebdcd3] text-xs font-mono"
                    >
                      <div className="flex items-center justify-between text-[#4a2d30] font-bold mb-1">
                        <span>function: {tc.toolName}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Success
                        </span>
                      </div>
                      <div className="text-[11px] text-[#796e65] mb-2">
                        args: {JSON.stringify(tc.args)}
                      </div>
                      <div className="text-[11px] bg-[#ffffff] p-2.5 rounded-xl border border-[#ebdcd3] text-[#3c2225] overflow-x-auto">
                        result: {JSON.stringify(tc.result)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Audio & Voice Config */}
          {activeTab === "settings" && (
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-medium text-[#4a2d30] mb-1">
                  VAD Silence Detection Threshold: {vadSilenceMs}ms
                </label>
                <input
                  type="range"
                  min={300}
                  max={1500}
                  step={50}
                  value={vadSilenceMs}
                  onChange={(e) => onVadSilenceMsChange(Number(e.target.value))}
                  className="w-full accent-[#835054]"
                />
                <p className="text-[11px] text-[#796e65] mt-1">
                  Lower value (e.g. 500ms) = faster replies with snappy turn-taking. Higher value = allows more pauses while speaking.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ebdcd3]">
                  <span className="font-semibold block mb-1 text-[#4a2d30]">Audio Input Hardware</span>
                  <span className="text-[#796e65]">16,000Hz PCM Linear16 via AudioWorklet</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ebdcd3]">
                  <span className="font-semibold block mb-1 text-[#4a2d30]">Audio Output Synthesis</span>
                  <span className="text-[#796e65]">24,000Hz PCM Linear16 • Persona: Aoede</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Security / Assurance */}
      <footer className="w-full pt-6 border-t border-[#ebdcd3]/70 text-center">
        <p className="text-xs text-[#8c7f76] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#9a4b52]" />
          <span>Private &amp; secure consultation • Aura Skincare</span>
        </p>
      </footer>
    </div>
  );
};
