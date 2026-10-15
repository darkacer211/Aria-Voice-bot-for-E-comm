import React from "react";
import { Phone, PhoneOff, MessageSquareText, Zap } from "lucide-react";
import { LiveSessionState } from "@/lib/live/types";

interface Props {
  state: LiveSessionState;
  onStartCall: () => void;
  onEndCall: () => void;
  onOpenTextTest: () => void;
  latencyMs: number | null;
  silenceMs?: number;
  onSilenceMsChange?: (ms: number) => void;
}

export const CallControls: React.FC<Props> = ({
  state,
  onStartCall,
  onEndCall,
  onOpenTextTest,
  latencyMs,
  silenceMs = 500,
  onSilenceMsChange,
}) => {
  const isCallActive =
    state === "listening" || state === "speaking" || state === "thinking";
  const isConnecting = state === "connecting" || state === "reconnecting";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Start Call Button */}
      {!isCallActive ? (
        <button
          onClick={onStartCall}
          disabled={isConnecting}
          className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-950/40 hover:shadow-emerald-900/60 active:scale-95 transition-all duration-150 cursor-pointer"
        >
          <Phone className="w-4 h-4" />
          <span>{isConnecting ? "Connecting..." : "Start Call with Aria"}</span>
        </button>
      ) : (
        /* End Call Button */
        <button
          onClick={onEndCall}
          className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-rose-600 via-red-600 to-rose-500 hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-950/40 hover:shadow-rose-900/60 active:scale-95 transition-all duration-150 cursor-pointer"
        >
          <PhoneOff className="w-4 h-4" />
          <span>End Call</span>
        </button>
      )}

      {/* Response Speed / Turn Latency Tuning (Editable when idle) */}
      {!isCallActive && onSilenceMsChange ? (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Response Speed:</span>
          <select
            value={silenceMs}
            onChange={(e) => onSilenceMsChange(Number(e.target.value))}
            className="bg-transparent text-emerald-400 font-semibold focus:outline-none cursor-pointer"
          >
            <option value={500} className="bg-slate-900 text-slate-100">Snappy (500ms)</option>
            <option value={700} className="bg-slate-900 text-slate-100">Balanced (700ms - Default)</option>
            <option value={900} className="bg-slate-900 text-slate-100">Natural (900ms)</option>
            <option value={1200} className="bg-slate-900 text-slate-100">Relaxed (1200ms)</option>
          </select>
        </div>
      ) : (
        /* Active Call VAD Indicator */
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 px-2.5 py-1.5 rounded-full bg-slate-900/70 border border-slate-800">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Turn Delay: <span className="text-emerald-400 font-semibold">{silenceMs}ms</span></span>
        </div>
      )}

      {/* Dev Text Test Mode Button */}
      <button
        onClick={onOpenTextTest}
        title="Open interactive text testing console"
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
      >
        <MessageSquareText className="w-3.5 h-3.5 text-amber-400" />
        <span>Text Test Mode</span>
      </button>

      {/* Latency Debug Pill */}
      {latencyMs !== null && (
        <div className="text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded bg-slate-900/60 border border-slate-800">
          First Audio: <span className="text-emerald-400 font-semibold">{latencyMs}ms</span>
        </div>
      )}
    </div>
  );
};
