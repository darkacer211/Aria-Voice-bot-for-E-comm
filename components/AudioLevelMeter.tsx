import React from "react";

interface Props {
  level: number; // 0.0 to 1.0
  active: boolean;
}

export const AudioLevelMeter: React.FC<Props> = ({ level, active }) => {
  // Generate 8 equalizer bars with slight height variations
  const bars = [0.4, 0.7, 1.0, 0.8, 0.9, 0.6, 0.8, 0.5];

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/60 border border-slate-800 rounded-lg">
      <span className="text-[11px] font-mono text-slate-400 mr-1">MIC</span>
      <div className="flex items-end gap-1 h-4 w-20">
        {bars.map((barScale, idx) => {
          const scaledHeight = active ? Math.max(15, Math.min(100, level * 100 * barScale)) : 10;
          return (
            <div
              key={idx}
              className="flex-1 rounded-sm transition-all duration-75"
              style={{
                height: `${scaledHeight}%`,
                backgroundColor: active
                  ? level > 0.6
                    ? "#f59e0b" // amber on loud
                    : level > 0.05
                    ? "#10b981" // emerald on active speech
                    : "#334155" // idle slate
                  : "#1e293b",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
