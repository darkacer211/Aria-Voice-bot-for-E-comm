import React, { useEffect, useRef } from "react";
import { TranscriptTurn } from "@/lib/live/types";
import { User, Sparkles, MessageSquare } from "lucide-react";

interface Props {
  turns: TranscriptTurn[];
  liveStatus: string;
}

export const TranscriptView: React.FC<Props> = ({ turns, liveStatus }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new turns or updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns]);

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-300">
            Live Call Transcript
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {turns.length} turn{turns.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Message List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pt-4 pr-1 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-700"
      >
        {turns.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Sparkles className="w-8 h-8 text-slate-600 mb-2 stroke-1" />
            <p className="text-xs font-medium text-slate-400">Ready when you are</p>
            <p className="text-[11px] text-slate-500 max-w-xs mt-1">
              Click &quot;Start Call with Aria&quot; and allow microphone access to talk directly.
            </p>
          </div>
        ) : (
          turns.map((turn, index) => {
            const isUser = turn.role === "user";
            return (
              <div
                key={turn.id || index}
                className={`flex gap-3 text-xs leading-relaxed ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                    isUser
                      ? "bg-emerald-950/40 border border-emerald-800/50 text-emerald-100 rounded-tr-xs"
                      : "bg-slate-950/70 border border-slate-800 text-slate-200 rounded-tl-xs"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        isUser ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {isUser ? "Customer" : "Aria (Aura Skincare)"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {turn.timestamp}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{turn.text}</p>
                </div>

                {isUser && (
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
