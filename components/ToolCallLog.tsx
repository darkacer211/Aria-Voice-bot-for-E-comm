import React, { useState } from "react";
import { LiveToolCallRecord } from "@/lib/live/types";
import { Wrench, ChevronDown, ChevronUp, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

interface Props {
  toolCalls: LiveToolCallRecord[];
}

export const ToolCallLog: React.FC<Props> = ({ toolCalls }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (toolCalls.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl transition-all">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-950/40 hover:bg-slate-950/70 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-300">
            Tool Execution Log ({toolCalls.length})
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isOpen ? "Collapse" : "Expand"}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Body */}
      {isOpen && (
        <div className="p-4 pt-2 space-y-3">
          {toolCalls.map((tc) => {
            const isSuccess = tc.result.found === true;
            return (
              <div
                key={tc.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
                    {isSuccess ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>{tc.toolName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {tc.latencyMs}ms
                    </span>
                    <span>{tc.timestamp}</span>
                  </div>
                </div>

                {/* Arguments */}
                <div>
                  <span className="text-slate-500 text-[11px]">Arguments:</span>
                  <pre className="p-2 mt-1 rounded bg-slate-900 border border-slate-800/80 text-[11px] text-amber-200 overflow-x-auto">
                    {JSON.stringify(tc.args, null, 2)}
                  </pre>
                </div>

                {/* Returned Result */}
                <div>
                  <span className="text-slate-500 text-[11px]">Backend Policy Result:</span>
                  <pre className="p-2 mt-1 rounded bg-slate-900 border border-slate-800/80 text-[11px] text-emerald-300 overflow-x-auto">
                    {JSON.stringify(tc.result, null, 2)}
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
