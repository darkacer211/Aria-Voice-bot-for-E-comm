"use client";

import React, { useState } from "react";
import { PostCallSummary as PostCallSummaryType } from "@/lib/summary/types";
import { TranscriptTurn, LiveToolCallRecord } from "@/lib/live/types";
import {
  FileText,
  Copy,
  Check,
  Download,
  AlertCircle,
  Sparkles,
  RefreshCw,
  X,
} from "lucide-react";

interface Props {
  summary: PostCallSummaryType | null;
  isLoading: boolean;
  isFallback: boolean;
  transcript: TranscriptTurn[];
  toolCalls: LiveToolCallRecord[];
  onClose: () => void;
}

export const PostCallSummary: React.FC<Props> = ({
  summary,
  isLoading,
  isFallback,
  transcript,
  toolCalls,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"summary" | "json" | "transcript">("summary");
  const [copied, setCopied] = useState(false);

  if (!isLoading && !summary) {
    return null;
  }

  const handleCopyJson = () => {
    if (!summary) return;
    navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const textLines = [
      `ARIA - CALL TRANSCRIPT`,
      `Date: ${new Date().toLocaleString()}`,
      `Agent: Aria (Voice CX Specialist)`,
      `----------------------------------------`,
      ...transcript.map((t) => `[${t.timestamp}] ${t.role.toUpperCase()}: ${t.text}`),
      `----------------------------------------`,
      `CALL SUMMARY:`,
      summary ? JSON.stringify(summary, null, 2) : "Summary pending",
    ];

    const blob = new Blob([textLines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Aria_Transcript_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const data = {
      timestamp: new Date().toISOString(),
      agent: "Aria",
      brand: "Aria",
      summary,
      transcript,
      toolCalls,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Aria_Call_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#3c2225]/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#ffffff] border border-[#ebdcd3] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f0e4dc]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#faecea] flex items-center justify-center text-[#9a4b52]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif-luxury text-xl font-light text-[#4a2d30]">
                Post-Call Summary &amp; Transcript
              </h2>
              <p className="text-xs text-[#796e65]">
                Consultation analyzed via Gemini structured output schema
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {summary && (
              <>
                <button
                  onClick={handleCopyJson}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#4a2d30] bg-[#f8f5f0] hover:bg-[#ebdcd3] border border-[#ebdcd3] transition-colors cursor-pointer"
                  title="Copy JSON to clipboard"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copied ? "Copied" : "Copy JSON"}</span>
                </button>
                <button
                  onClick={handleDownloadJson}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#4a2d30] bg-[#f8f5f0] hover:bg-[#ebdcd3] border border-[#ebdcd3] transition-colors cursor-pointer"
                  title="Download JSON export"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#796e65] hover:text-[#4a2d30] hover:bg-[#f4ebe6] transition-colors cursor-pointer"
              title="Close Summary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        {summary && !isLoading && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#faf7f2] border border-[#ebdcd3] text-xs">
            <button
              onClick={() => setActiveTab("summary")}
              className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition cursor-pointer text-center ${
                activeTab === "summary"
                  ? "bg-[#ffffff] text-[#4a2d30] shadow-2xs font-semibold"
                  : "text-[#796e65] hover:text-[#4a2d30]"
              }`}
            >
              Structured Summary
            </button>
            <button
              onClick={() => setActiveTab("json")}
              className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition cursor-pointer text-center font-mono ${
                activeTab === "json"
                  ? "bg-[#ffffff] text-[#4a2d30] shadow-2xs font-semibold"
                  : "text-[#796e65] hover:text-[#4a2d30]"
              }`}
            >
              JSON Object
            </button>
            <button
              onClick={() => setActiveTab("transcript")}
              className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition cursor-pointer text-center ${
                activeTab === "transcript"
                  ? "bg-[#ffffff] text-[#4a2d30] shadow-2xs font-semibold"
                  : "text-[#796e65] hover:text-[#4a2d30]"
              }`}
            >
              Transcript ({transcript.length})
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#796e65]">
            <RefreshCw className="w-7 h-7 animate-spin text-[#d89a9e]" />
            <p className="text-xs font-medium text-[#4a2d30]">
              Synthesizing structured post-call summary...
            </p>
            <p className="text-[11px] text-[#93857b]">
              Extracting intent, order references, resolution status, and applied policies
            </p>
          </div>
        ) : summary ? (
          <div>
            {/* Tab 1: Structured Summary Cards */}
            {activeTab === "summary" && (
              <div className="space-y-4">
                {isFallback && (
                  <div className="p-2.5 rounded-xl bg-[#faecea] border border-[#d89a9e]/50 flex items-center gap-2 text-xs text-[#9a4b52]">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Generated via local Aria CX policy analyzer fallback.</span>
                  </div>
                )}

                {/* Key Metrics / Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-2xl bg-[#faf7f2] border border-[#ebdcd3]">
                    <span className="text-[10px] uppercase tracking-wider text-[#93857b] font-semibold block mb-1">
                      Customer Intent
                    </span>
                    <span className="text-xs font-semibold text-[#4a2d30] font-mono">
                      {summary.customer_intent}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#faf7f2] border border-[#ebdcd3]">
                    <span className="text-[10px] uppercase tracking-wider text-[#93857b] font-semibold block mb-1">
                      Resolution
                    </span>
                    <span
                      className={`text-xs font-semibold font-mono ${
                        summary.resolution_status === "RESOLVED"
                          ? "text-emerald-700"
                          : summary.resolution_status === "OUT_OF_POLICY"
                          ? "text-amber-700"
                          : "text-[#4a2d30]"
                      }`}
                    >
                      {summary.resolution_status}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#faf7f2] border border-[#ebdcd3]">
                    <span className="text-[10px] uppercase tracking-wider text-[#93857b] font-semibold block mb-1">
                      Order ID
                    </span>
                    <span className="text-xs font-semibold text-[#835054] font-mono">
                      {summary.order_id || "None"}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#faf7f2] border border-[#ebdcd3]">
                    <span className="text-[10px] uppercase tracking-wider text-[#93857b] font-semibold block mb-1">
                      Sentiment
                    </span>
                    <span
                      className={`text-xs font-semibold capitalize ${
                        summary.customer_sentiment === "positive"
                          ? "text-emerald-700"
                          : summary.customer_sentiment === "negative"
                          ? "text-rose-700"
                          : "text-[#4a2d30]"
                      }`}
                    >
                      {summary.customer_sentiment}
                    </span>
                  </div>
                </div>

                {/* Call Summary Paragraph */}
                <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ebdcd3] space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#796e65] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#d89a9e]" />
                    Concierge Summary
                  </span>
                  <p className="text-xs text-[#4a2d30] leading-relaxed">{summary.call_summary}</p>
                </div>

                {/* Prominent Cancellation Status Indicator */}
                {(summary.customer_intent === "CANCELLATION_REQUEST" ||
                  toolCalls.some((t) => t.toolName === "cancel_order")) && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 flex items-center justify-between text-xs text-rose-900">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-600 inline-block animate-ping"></span>
                      <span className="font-bold">Cancellation Status:</span>
                      <span className="text-rose-800 font-medium">
                        {summary.order_id ? `Order ${summary.order_id}` : "Customer Order"}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                        summary.resolution_status === "RESOLVED"
                          ? "bg-rose-100 text-rose-800 border-rose-300"
                          : "bg-amber-100 text-amber-900 border-amber-300"
                      }`}
                    >
                      {summary.resolution_status === "RESOLVED"
                        ? "CANCELLED IN DATABASE"
                        : "NOT CANCELLED (OUT FOR DELIVERY / DELIVERED)"}
                    </span>
                  </div>
                )}

                {/* Policy Applied & Tools Used */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ebdcd3]">
                    <span className="text-[#93857b] text-[11px] block mb-1">Policy Applied:</span>
                    <span className="text-[#4a2d30] font-medium">
                      {summary.policy_applied || "General customer support guidelines"}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ebdcd3]">
                    <span className="text-[#93857b] text-[11px] block mb-1">Tools Invoked:</span>
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {summary.tools_used.length > 0 ? (
                        summary.tools_used.map((tool, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-[#faecea] text-[#82464b] border border-[#d89a9e]/40"
                          >
                            {tool}
                          </span>
                        ))
                      ) : (
                        <span className="text-[#93857b]">None</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Raw Formatted JSON Object */}
            {activeTab === "json" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#796e65]">
                  <span>Structured JSON Schema (`POST /api/summary`)</span>
                  <span className="text-[11px] font-mono text-emerald-700">Validated Schema</span>
                </div>
                <pre className="bg-[#2a1e20] text-[#e8d5d8] p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-[340px] leading-relaxed border border-[#4a2d30]">
                  {JSON.stringify(summary, null, 2)}
                </pre>
              </div>
            )}

            {/* Tab 3: Complete Call Transcript */}
            {activeTab === "transcript" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#796e65]">
                  <span>Full Dialogue Transcript ({transcript.length} turns)</span>
                  <button
                    onClick={handleDownloadTxt}
                    className="text-[11px] text-[#9a4b52] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download .txt</span>
                  </button>
                </div>
                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-2 scrollbar-none">
                  {transcript.length === 0 ? (
                    <p className="text-xs text-[#93857b] text-center py-8">
                      No conversation turns recorded.
                    </p>
                  ) : (
                    transcript.map((turn, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-2xl text-xs ${
                          turn.role === "user"
                            ? "bg-[#faf7f2] border border-[#ebdcd3] text-[#4a2d30]"
                            : "bg-[#faecea] border border-[#d89a9e]/40 text-[#3c2225]"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-[#93857b] mb-1 font-semibold">
                          <span className="uppercase tracking-wider">
                            {turn.role === "user" ? "Customer" : "Aria"}
                          </span>
                          <span>
                            {turn.timestamp && turn.timestamp.includes(":") && !turn.timestamp.includes("T")
                              ? turn.timestamp
                              : (() => {
                                  try {
                                    const d = new Date(turn.timestamp);
                                    return isNaN(d.getTime()) ? turn.timestamp : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                                  } catch {
                                    return turn.timestamp;
                                  }
                                })()}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{turn.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
