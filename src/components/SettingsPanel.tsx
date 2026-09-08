import React from 'react';
import { Target, Shuffle, Minus, Plus, Zap, Timer, Hourglass } from 'lucide-react';
import type { RouletteConfig, RouletteEntry, SpinMode } from '../types/roulette';

interface SettingsPanelProps {
  config: RouletteConfig;
  entries: RouletteEntry[];
  onChangeConfig: (newConfig: Partial<RouletteConfig>) => void;
  isSpinning: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  config,
  entries,
  onChangeConfig,
  isSpinning,
}) => {
  const handleModeChange = (mode: SpinMode) => {
    if (isSpinning) return;
    if (mode === 'target') {
      onChangeConfig({ mode, winnerCount: 1 });
    } else {
      onChangeConfig({ mode });
    }
  };

  const handleWinnerCountChange = (count: number) => {
    if (isSpinning || config.mode === 'target') return;
    if (!Number.isFinite(count)) return;
    const clamped = Math.max(1, Math.floor(count));
    onChangeConfig({ winnerCount: clamped });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Cara menang */}
      <section>
        <p className="section-label mb-2">Cara menang</p>
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl border border-white/[0.06] bg-black/20">
          <button
            type="button"
            disabled={isSpinning}
            onClick={() => handleModeChange('random')}
            aria-pressed={config.mode === 'random'}
            className={`px-3 py-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
              config.mode === 'random'
                ? 'bg-white/[0.07] border-white/10 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
            }`}
          >
            <span className="flex items-center gap-1.5 text-[13px] font-semibold">
              <Shuffle className="w-3.5 h-3.5" /> Acak
            </span>
            <span className="block text-[11px] mt-0.5 opacity-70">Murni peluang sama</span>
          </button>
          <button
            type="button"
            disabled={isSpinning}
            onClick={() => handleModeChange('target')}
            aria-pressed={config.mode === 'target'}
            className={`px-3 py-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
              config.mode === 'target'
                ? 'bg-amber-400/[0.08] border-amber-300/20 text-amber-100'
                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
            }`}
          >
            <span className="flex items-center gap-1.5 text-[13px] font-semibold">
              <Target className="w-3.5 h-3.5" /> Target
            </span>
            <span className="block text-[11px] mt-0.5 opacity-70">Sudah ditentukan</span>
          </button>
        </div>

        {config.mode === 'target' && (
          <div className="mt-2">
            <select
              value={config.targetId || ''}
              onChange={(e) => onChangeConfig({ targetId: e.target.value })}
              disabled={isSpinning || entries.length === 0}
              className="w-full h-9 px-2.5 rounded-lg bg-[#0d1017] border border-amber-300/20 text-amber-100 text-[13px] font-medium focus:outline-none focus:border-amber-300/50 disabled:opacity-50 cursor-pointer"
            >
              {entries.length === 0 ? (
                <option value="">Tambahkan peserta dulu</option>
              ) : (
                entries.map((entry) => (
                  <option key={entry.id} value={entry.id} className="bg-slate-900 text-white">
                    {entry.label}
                  </option>
                ))
              )}
            </select>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              Roda tetap berputar penuh, lalu berhenti di nama ini.
            </p>
          </div>
        )}
      </section>

      {/* Pemenang */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <p className="section-label">Pemenang sekali putar</p>
          <span className="text-[11px] tabular-nums font-semibold px-1.5 py-0.5 rounded-md bg-white/[0.06] text-slate-300">
            {config.winnerCount}
          </span>
        </div>
        {config.mode === 'target' ? (
          <p className="text-xs text-slate-500 leading-relaxed px-3 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
            Mode target selalu 1 pemenang. Pindah ke Acak untuk banyak pemenang.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSpinning || config.winnerCount <= 1}
                onClick={() => handleWinnerCountChange(config.winnerCount - 1)}
                className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Kurangi"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min={1}
                step={1}
                value={config.winnerCount}
                disabled={isSpinning}
                onChange={(e) => handleWinnerCountChange(Number(e.target.value))}
                className="flex-1 h-9 px-3 text-center rounded-lg bg-[#0d1017] border border-white/10 text-white text-sm font-bold tabular-nums focus:outline-none focus:border-white/25 disabled:opacity-50"
                aria-label="Jumlah pemenang sekali putar"
              />
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => handleWinnerCountChange(config.winnerCount + 1)}
                className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Tambah"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1.5 mt-2">
              {[1, 3, 5, 7].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={isSpinning}
                  onClick={() => handleWinnerCountChange(num)}
                  className={`h-7 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    config.winnerCount === num
                      ? 'bg-white/[0.08] border-white/15 text-white'
                      : 'border-white/[0.06] text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] disabled:opacity-30'
                  }`}
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                disabled={isSpinning || entries.length === 0}
                onClick={() => handleWinnerCountChange(entries.length)}
                className={`h-7 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  entries.length > 0 && config.winnerCount === entries.length
                    ? 'bg-white/[0.08] border-white/15 text-white'
                    : 'border-white/[0.06] text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] disabled:opacity-30'
                }`}
              >
                Semua
              </button>
            </div>
            {entries.length > 0 && config.winnerCount > entries.length && (
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                Melebihi {entries.length} peserta — yang keluar maksimal {entries.length} nama unik.
              </p>
            )}
          </>
        )}
      </section>

      {/* Durasi */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <p className="section-label">Durasi putaran</p>
          <span className="text-[11px] tabular-nums font-semibold px-1.5 py-0.5 rounded-md bg-white/[0.06] text-slate-300">
            {config.speedDuration} dtk
          </span>
        </div>
        <input
          type="range"
          min="2"
          max="15"
          step="1"
          value={config.speedDuration}
          disabled={isSpinning}
          onChange={(e) => onChangeConfig({ speedDuration: Number(e.target.value) })}
          className="w-full cursor-pointer"
          aria-label="Durasi putaran dalam detik"
        />
        <div className="grid grid-cols-3 gap-1.5 mt-2">
          <SpeedPreset icon={<Zap className="w-3.5 h-3.5" />} label="Cepat · 3" active={config.speedDuration <= 4} disabled={isSpinning} onClick={() => !isSpinning && onChangeConfig({ speedDuration: 3 })} />
          <SpeedPreset icon={<Timer className="w-3.5 h-3.5" />} label="Normal · 7" active={config.speedDuration >= 6 && config.speedDuration <= 8} disabled={isSpinning} onClick={() => !isSpinning && onChangeConfig({ speedDuration: 7 })} />
          <SpeedPreset icon={<Hourglass className="w-3.5 h-3.5" />} label="Lambat · 12" active={config.speedDuration >= 10} disabled={isSpinning} onClick={() => !isSpinning && onChangeConfig({ speedDuration: 12 })} />
        </div>
      </section>

      {/* Tampilan + efek */}
      <section className="pt-3 border-t border-white/[0.06]">
        <p className="section-label mb-2">Roda & efek</p>
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {(['vibrant', 'neon', 'pastel', 'sunset'] as const).map((themeName) => (
            <button
              key={themeName}
              type="button"
              disabled={isSpinning}
              onClick={() => onChangeConfig({ theme: themeName })}
              aria-pressed={config.theme === themeName}
              className={`h-8 rounded-lg text-xs font-semibold capitalize border transition-colors cursor-pointer ${
                config.theme === themeName
                  ? 'bg-white/[0.08] border-white/15 text-white'
                  : 'border-white/[0.06] text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
              }`}
            >
              {themeName}
            </button>
          ))}
        </div>
        <div className="space-y-1">
          <ToggleRow label="Keluarkan pemenang dari daftar" checked={config.removeWinner} disabled={isSpinning} onChange={(v) => onChangeConfig({ removeWinner: v })} />
          <ToggleRow label="Suara detik & fanfare" checked={config.soundEnabled} onChange={(v) => onChangeConfig({ soundEnabled: v })} />
          <ToggleRow label="Confetti saat menang" checked={config.confettiEnabled} onChange={(v) => onChangeConfig({ confettiEnabled: v })} />
        </div>
      </section>
    </div>
  );
};

function SpeedPreset({ icon, label, active, disabled, onClick }: { icon: React.ReactNode; label: string; active: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={`h-8 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
        active
          ? 'bg-white/[0.08] border-white/15 text-white'
          : 'border-white/[0.06] text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ToggleRow({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={`flex items-center justify-between py-1.5 cursor-pointer select-none ${disabled ? 'opacity-40' : ''}`}>
      <span className="text-[13px] text-slate-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => { e.preventDefault(); onChange(!checked); }}
        className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${checked ? 'bg-slate-100' : 'bg-white/10'}`}
      >
        <span className={`block w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-4 bg-slate-900' : 'translate-x-0 bg-slate-400'}`} />
      </button>
    </label>
  );
}
