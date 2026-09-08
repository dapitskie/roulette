import React from "react";
import { Disc3, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react";
import type { RouletteConfig, RouletteEntry } from "../types/roulette";

interface HeaderProps {
  config: RouletteConfig;
  entries: RouletteEntry[];
  onToggleSound: () => void;
  isSpinning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  entries,
  onToggleSound,
  isSpinning,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const currentTargetName =
    entries.find((e) => e.id === config.targetId)?.label || "Belum dipilih";
  const isTarget = config.mode === "target";

  return (
    <header className="w-full border-b border-white/[0.06] bg-[#0b0d14] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 h-14">
        {/* Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#1a1f2c] border border-white/10 flex items-center justify-center shrink-0">
            <Disc3
              className={`w-[18px] h-[18px] text-slate-200 ${isSpinning ? "animate-spin" : ""}`}
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-[15px] font-heading font-bold tracking-tight text-slate-100 leading-none truncate">
              Roulette Undian
            </h1>
            <p className="text-[11px] text-slate-500 leading-none mt-1 hidden sm:block">
              {entries.length} peserta ·{" "}
              {isTarget ? `Target: ${currentTargetName}` : "Acak adil"}
            </p>
          </div>
        </div>

        {/* Status — quiet, satu gaya */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onToggleSound}
            aria-label={
              config.soundEnabled ? "Matikan Suara" : "Nyalakan Suara"
            }
            className="p-2 rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.07] transition-colors cursor-pointer"
            title={config.soundEnabled ? "Suara aktif" : "Suara mati"}
          >
            {config.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen"
            className="p-2 rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.07] transition-colors cursor-pointer hidden sm:block"
            title="Layar penuh"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
