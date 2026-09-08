import React from 'react';
import { Loader2, Play } from 'lucide-react';

interface SpinButtonProps {
  isSpinning: boolean;
  disabled: boolean;
  onSpin: () => void;
  entriesCount: number;
  winnerCount?: number;
  mode?: string;
}

export const SpinButton: React.FC<SpinButtonProps> = ({
  isSpinning,
  disabled,
  onSpin,
  entriesCount,
  winnerCount = 1,
  mode = 'random',
}) => {
  const isDisabled = disabled || isSpinning || entriesCount === 0;

  return (
    <div className="flex flex-col items-stretch gap-2 mt-2 w-full">
      <button
        onClick={onSpin}
        disabled={isDisabled}
        aria-label={isSpinning ? 'Roda sedang berputar' : 'Putar roda sekarang'}
        className={`w-full px-8 py-3.5 rounded-xl font-heading font-bold text-[15px] tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer border ${
          isDisabled
            ? 'bg-white/[0.04] text-slate-600 border-white/[0.06] cursor-not-allowed'
            : 'bg-slate-100 text-slate-900 border-white hover:bg-white active:scale-[0.98] shadow-[0_10px_28px_-10px_rgba(255,255,255,0.25)]'
        }`}
      >
        {isSpinning ? (
          <>
            <Loader2 className="w-[18px] h-[18px] animate-spin" />
            <span>Berputar…</span>
          </>
        ) : (
          <>
            <Play className="w-[18px] h-[18px] fill-current" />
            <span>Putar roda</span>
            {mode === 'random' && winnerCount > 1 && (
              <span className="ml-1 text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-md bg-slate-900 text-slate-100">
                ×{winnerCount}
              </span>
            )}
          </>
        )}
      </button>

      <span className="text-[11px] text-slate-600">
        {entriesCount === 0 ? (
          'Tambahkan nama dulu untuk memutar'
        ) : (
          <>Tekan <kbd className="px-1 py-px rounded border border-white/10 bg-white/[0.05] text-slate-400 text-[10px] font-mono">Space</kbd> untuk memutar</>
        )}
      </span>
    </div>
  );
};
