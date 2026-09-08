import React, { useEffect } from "react";
import { Trophy, X, RotateCw, UserMinus, Check } from "lucide-react";
import confetti from "canvas-confetti";
import type { SpinResult } from "../types/roulette";

interface ResultModalProps {
  result: SpinResult | null;
  isOpen: boolean;
  onClose: () => void;
  onSpinAgain: () => void;
  onRemoveWinner: (entryIds: string[]) => void;
  confettiEnabled: boolean;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  result,
  isOpen,
  onClose,
  onSpinAgain,
  onRemoveWinner,
  confettiEnabled,
}) => {
  useEffect(() => {
    if (isOpen && confettiEnabled) {
      try {
        const count = 160;
        const defaults = {
          origin: { y: 0.65 },
          zIndex: 9999,
          disableForReducedMotion: true,
        };

        const fire = (particleRatio: number, opts: confetti.Options) => {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        };

        fire(0.3, { spread: 55 });
        fire(0.4, { spread: 90, decay: 0.92, scalar: 0.9 });
        fire(0.3, { spread: 120, startVelocity: 32, scalar: 1.1 });
      } catch {
        // Fallback
      }
    }
  }, [isOpen, confettiEnabled]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !result) return null;

  const isMultiWinner = result.winners && result.winners.length > 1;
  const allWinnerIds =
    isMultiWinner && result.winners
      ? result.winners.map((w) => w.id)
      : [result.entryId];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-label="Hasil undian"
    >
      <div
        className={`relative w-full ${isMultiWinner ? "max-w-2xl" : "max-w-xl"} p-8 rounded-2xl bg-[#141821] border border-white/10 text-center shadow-2xl max-h-[90vh] flex flex-col`}
      >
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-3 right-3 p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mx-auto w-10 h-10 rounded-xl bg-amber-400/[0.1] border border-amber-300/20 flex items-center justify-center mb-3 shrink-0">
          <Trophy className="w-5 h-5 text-amber-300" />
        </div>

        <p className="section-label mb-2">
          {isMultiWinner ? `${result.winners?.length} pemenang` : "Pemenang"}
          <span className="text-slate-600">
            {" "}
            · {result.mode === "target" ? "" : "acak"}
          </span>
        </p>

        <div className="overflow-y-auto mb-4 flex-1">
          {isMultiWinner && result.winners ? (
            <ol className="space-y-2 text-left">
              {result.winners.map((winner) => (
                <li
                  key={winner.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                >
                  <span className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-300/20 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-emerald-300" />
                  </span>
                  <span className="text-lg font-semibold text-slate-100 break-words flex-1">
                    {winner.name}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="px-4 py-6 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <h2 className="text-5xl sm:text-6xl font-heading font-bold tracking-tight text-white break-words leading-tight">
                {result.entryName}
              </h2>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={() => {
              onClose();
              onSpinAgain();
            }}
            className="w-full h-10 px-4 rounded-lg bg-slate-100 hover:bg-white text-slate-900 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            <span>Putar lagi</span>
          </button>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                onRemoveWinner(allWinnerIds);
                onClose();
              }}
              className="h-9 px-3 rounded-lg bg-white/[0.04] hover:bg-red-500/10 border border-white/10 hover:border-red-400/20 text-slate-300 hover:text-red-300 text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserMinus className="w-3.5 h-3.5" />
              <span>Keluarkan</span>
            </button>

            <button
              onClick={onClose}
              className="h-9 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 text-[13px] font-medium transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
