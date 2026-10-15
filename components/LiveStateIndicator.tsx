import React from "react";
import { LiveSessionState } from "@/lib/live/types";
import { Radio, Mic, Brain, Volume2, AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  state: LiveSessionState;
}

const STATE_CONFIG: Record<
  LiveSessionState,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode; pulse: boolean }
> = {
  idle: {
    label: "Ready to Call",
    bg: "bg-[#f4ebe6]",
    text: "text-[#796e65]",
    border: "border-[#ebdcd3]",
    icon: <Radio className="w-3.5 h-3.5 text-[#796e65]" />,
    pulse: false,
  },
  connecting: {
    label: "Connecting to Aria...",
    bg: "bg-[#fdf6ed]",
    text: "text-[#aa7932]",
    border: "border-[#f4d7b5]",
    icon: <RefreshCw className="w-3.5 h-3.5 text-[#aa7932] animate-spin" />,
    pulse: true,
  },
  listening: {
    label: "Listening",
    bg: "bg-[#eaf6ef]",
    text: "text-[#20683e]",
    border: "border-[#a3d9b8]",
    icon: <Mic className="w-3.5 h-3.5 text-[#20683e]" />,
    pulse: true,
  },
  thinking: {
    label: "Thinking",
    bg: "bg-[#f3edf7]",
    text: "text-[#5b3b7e]",
    border: "border-[#cfbfe4]",
    icon: <Brain className="w-3.5 h-3.5 text-[#5b3b7e] animate-pulse" />,
    pulse: true,
  },
  speaking: {
    label: "Speaking",
    bg: "bg-[#faecea]",
    text: "text-[#9a4b52]",
    border: "border-[#eab2b6]",
    icon: <Volume2 className="w-3.5 h-3.5 text-[#9a4b52] animate-bounce" />,
    pulse: true,
  },
  error: {
    label: "Connection Error",
    bg: "bg-[#fdeded]",
    text: "text-[#b3261e]",
    border: "border-[#f5b5b5]",
    icon: <AlertCircle className="w-3.5 h-3.5 text-[#b3261e]" />,
    pulse: false,
  },
  reconnecting: {
    label: "Reconnecting...",
    bg: "bg-[#fdf6ed]",
    text: "text-[#aa7932]",
    border: "border-[#f4d7b5]",
    icon: <RefreshCw className="w-3.5 h-3.5 text-[#aa7932] animate-spin" />,
    pulse: true,
  },
};

export const LiveStateIndicator: React.FC<Props> = ({ state }) => {
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.idle;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm transition-all duration-300 ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className="relative flex h-2 w-2">
        {cfg.pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              state === "listening"
                ? "bg-emerald-400"
                : state === "speaking"
                ? "bg-teal-400"
                : state === "thinking"
                ? "bg-indigo-400"
                : "bg-amber-400"
            }`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            state === "listening"
              ? "bg-emerald-500"
              : state === "speaking"
              ? "bg-teal-500"
              : state === "thinking"
              ? "bg-indigo-500"
              : state === "error"
              ? "bg-rose-500"
              : state === "connecting" || state === "reconnecting"
              ? "bg-amber-500"
              : "bg-slate-500"
          }`}
        />
      </span>
      {cfg.icon}
      <span>{cfg.label}</span>
    </div>
  );
};
