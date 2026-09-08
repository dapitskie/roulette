import React from 'react';
import { Trash2, History as HistoryIcon } from 'lucide-react';
import type { SpinResult } from '../types/roulette';

interface HistoryPanelProps {
  history: SpinResult[];
  onClearHistory: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onClearHistory,
}) => {
  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
        <p className="section-label">Hasil putaran · {history.length}</p>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="h-7 px-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-red-500/10 hover:border-red-400/20 hover:text-red-300 text-slate-400 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-[360px] sm:max-h-[420px]">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center mb-2.5">
              <HistoryIcon className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-300">Belum ada hasil</p>
            <p className="text-xs text-slate-500 mt-1">
              Setiap putaran tercatat di sini.
            </p>
          </div>
        ) : (
          history.map((item, index) => {
            const multi = item.winners && item.winners.length > 1;
            return (
              <div
                key={item.id}
                className="px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-2.5"
              >
                <div className="flex items-baseline gap-2.5 min-w-0">
                  <span className="text-[11px] tabular-nums text-slate-600 shrink-0">
                    {String(history.length - index).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-100 truncate leading-tight">
                      {multi ? item.winners![0].name : item.entryName}
                      {multi && (
                        <span className="ml-1.5 text-[11px] font-medium text-slate-500">
                          +{item.winners!.length - 1} lainnya
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                      {formatTime(item.timestamp)} · {item.mode === 'target' ? 'Target' : 'Acak'}
                      {multi ? ` · ${item.winners!.length} pemenang` : ''}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
