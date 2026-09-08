import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Settings as SettingsIcon,
  History as HistoryIcon,
} from "lucide-react";
import type {
  RouletteConfig,
  RouletteEntry,
  SpinResult,
} from "./types/roulette";
import {
  loadConfig,
  loadEntries,
  loadHistory,
  saveConfig,
  saveEntries,
  saveHistory,
} from "./utils/storage";
import { soundManager } from "./utils/audio";
import {
  calculateRandomRotation,
  calculateRotationToTarget,
  getEntryIndexAtRotation,
  calculateMultiWinners,
} from "./utils/rouletteMath";
import { Header } from "./components/Header";
import { RouletteWheel } from "./components/RouletteWheel";
import { SpinButton } from "./components/SpinButton";
import { EntryPanel } from "./components/EntryPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { HistoryPanel } from "./components/HistoryPanel";
import { ResultModal } from "./components/ResultModal";

type ActiveTab = "entries" | "settings" | "history";

export function App() {
  // 1. Persistent States
  const [entries, setEntries] = useState<RouletteEntry[]>(() => loadEntries());
  const [config, setConfig] = useState<RouletteConfig>(() => loadConfig());
  const [history, setHistory] = useState<SpinResult[]>(() => loadHistory());

  // 2. Runtime Animation States
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [pendingResult, setPendingResult] = useState<SpinResult | null>(null);
  const [modalResult, setModalResult] = useState<SpinResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("entries");

  // Sync sound settings with audio manager
  useEffect(() => {
    soundManager.setEnabled(config.soundEnabled);
  }, [config.soundEnabled]);

  // Persist entries
  useEffect(() => {
    saveEntries(entries);
    // If targetId is not in entries, default to first entry
    if (
      entries.length > 0 &&
      (!config.targetId || !entries.some((e) => e.id === config.targetId))
    ) {
      setConfig((prev) => ({ ...prev, targetId: entries[0].id }));
    }
    if (entries.length > 0 && config.winnerCount < 1) {
      setConfig((prev) => ({
        ...prev,
        winnerCount: 1,
      }));
    }
  }, [entries, config.targetId, config.winnerCount]);

  // Persist config
  useEffect(() => {
    saveConfig(config);
  }, [config]);

  // Persist history
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  // 3. Core Spin Logic
  const handleSpin = useCallback(() => {
    if (isSpinning || entries.length === 0 || isModalOpen) return;

    setIsSpinning(true);

    let nextRotation = 0;
    let expectedWinnerIndex = 0;

    if (config.mode === "target" && config.targetId) {
      let targetIdx = entries.findIndex((e) => e.id === config.targetId);
      if (targetIdx === -1) targetIdx = 0;
      expectedWinnerIndex = targetIdx;

      const { finalRotation } = calculateRotationToTarget(
        entries.length,
        targetIdx,
        rotation,
        config.speedDuration,
        true,
      );
      nextRotation = finalRotation;
    } else {
      const { winnerIndex, finalRotation } = calculateRandomRotation(
        entries,
        rotation,
        config.speedDuration,
      );
      expectedWinnerIndex = winnerIndex;
      nextRotation = finalRotation;
    }

    const winnerEntry = entries[expectedWinnerIndex] || entries[0];

    // If multi-winner is active in random mode
    let initialWinners;
    if (config.mode === "random" && config.winnerCount > 1) {
      initialWinners = calculateMultiWinners(
        entries,
        config.winnerCount,
        expectedWinnerIndex,
      );
    }

    const newResult: SpinResult = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      entryId: winnerEntry.id,
      entryName: winnerEntry.label,
      winners: initialWinners,
      mode: config.mode,
      timestamp: Date.now(),
    };

    setPendingResult(newResult);
    setRotation(nextRotation);
  }, [isSpinning, entries, isModalOpen, config, rotation]);

  // 4. Handle Spin Completion (called after CSS transition ends)
  const handleSpinComplete = useCallback(() => {
    setIsSpinning(false);

    // Double check segment at top pointer for 100% geometric accuracy
    const actualIndex = getEntryIndexAtRotation(rotation, entries.length);
    const actualWinner =
      entries[actualIndex] ||
      (pendingResult
        ? { id: pendingResult.entryId, label: pendingResult.entryName }
        : entries[0]);

    if (!actualWinner) return;

    let computedWinners;
    if (config.mode === "random" && config.winnerCount > 1) {
      computedWinners = calculateMultiWinners(
        entries,
        config.winnerCount,
        actualIndex,
      );
    }

    const finalResult: SpinResult = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      entryId: actualWinner.id,
      entryName: actualWinner.label,
      winners: computedWinners,
      mode: config.mode,
      timestamp: Date.now(),
    };

    // Play victory fanfare
    soundManager.playWin();

    // Update history
    setHistory((prev) => [finalResult, ...prev]);
    setModalResult(finalResult);
    setIsModalOpen(true);

    // Auto Remove Winner if option is checked
    if (config.removeWinner) {
      const idsToRemove =
        computedWinners && computedWinners.length > 0
          ? computedWinners.map((w) => w.id)
          : [actualWinner.id];
      setEntries((prev) => prev.filter((e) => !idsToRemove.includes(e.id)));
    }
  }, [
    rotation,
    entries,
    pendingResult,
    config.mode,
    config.winnerCount,
    config.removeWinner,
  ]);

  // Keybind: T = toggle mode target (pakai targetId yang sudah di-set) <-> acak
  const handleToggleTargetMode = useCallback(() => {
    if (isSpinning || isModalOpen) return;
    setConfig((prev) => {
      if (prev.mode === "target") {
        return { ...prev, mode: "random" };
      }
      // Masuk target: paksa 1 pemenang, targetId tetap yang sudah di-set
      // (efek persist otomatis default ke entries[0] kalau targetId kosong)
      return { ...prev, mode: "target", winnerCount: 1 };
    });
  }, [isSpinning, isModalOpen]);

  // Keyboard shortcut handler (Space to spin, T to toggle target mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (
        targetTag === "input" ||
        targetTag === "textarea" ||
        targetTag === "select"
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        handleSpin();
        return;
      }

      // T = aktif/nonaktif mode target yang sudah di-set (abaikan saat spin/modal)
      if (
        e.code === "KeyT" &&
        !e.repeat &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        handleToggleTargetMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSpin, handleToggleTargetMode]);

  // 5. Entry Management Handlers
  const handleAddEntry = (name: string) => {
    const newEntry: RouletteEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: name,
    };
    setEntries((prev) => [...prev, newEntry]);
  };

  const handleUpdateEntry = (id: string, newLabel: string) => {
    setEntries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, label: newLabel } : item,
      ),
    );
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm("Yakin ingin menghapus semua peserta?")) {
      setEntries([]);
    }
  };

  const handleShuffle = () => {
    setEntries((prev) => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  };

  const handleBulkAdd = (names: string[]) => {
    const newItems: RouletteEntry[] = names.map((name) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: name,
    }));
    setEntries((prev) => [...prev, ...newItems]);
  };

  const handleRemoveWinnerManually = (entryIds: string[]) => {
    setEntries((prev) => prev.filter((item) => !entryIds.includes(item.id)));
  };

  const handleToggleSound = () => {
    setConfig((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const handleConfigChange = (newConf: Partial<RouletteConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConf }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d14] text-slate-100">
      {/* 1. Main Header */}
      <Header
        config={config}
        entries={entries}
        onToggleSound={handleToggleSound}
        isSpinning={isSpinning}
      />

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 max-w-[1800px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Roulette Wheel (no panel) */}
        <section className="lg:col-span-8 xl:col-span-9 flex flex-col items-center justify-center px-0 sm:px-2 pt-8 pb-5 relative overflow-visible">
          {/* Wheel Component */}
          <RouletteWheel
            entries={entries}
            config={config}
            rotation={rotation}
            isSpinning={isSpinning}
            onSpinComplete={handleSpinComplete}
          />
        </section>

        {/* Right Column: Control Center & Panels (5 cols) */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
        <section className="flex flex-col rounded-2xl control-panel overflow-hidden">
          {/* Tab Navigation — segmented, satu active */}
          <div
            className="flex gap-1 p-2 border-b border-white/[0.06] bg-black/20"
            role="tablist"
            aria-label="Panel kontrol"
          >
            <TabButton
              active={activeTab === "entries"}
              onClick={() => setActiveTab("entries")}
              icon={<Users className="w-3.5 h-3.5" />}
              label="Peserta"
              count={entries.length}
            />
            <TabButton
              active={activeTab === "settings"}
              onClick={() => setActiveTab("settings")}
              icon={<SettingsIcon className="w-3.5 h-3.5" />}
              label="Aturan main"
              dot={config.mode === "target"}
            />
            <TabButton
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
              icon={<HistoryIcon className="w-3.5 h-3.5" />}
              label="Hasil"
              count={history.length}
            />
          </div>

          {/* Active Tab Content Panel */}
          <div className="p-4 flex-1">
            {activeTab === "entries" && (
              <EntryPanel
                entries={entries}
                onAddEntry={handleAddEntry}
                onUpdateEntry={handleUpdateEntry}
                onDeleteEntry={handleDeleteEntry}
                onClearAll={handleClearAll}
                onShuffle={handleShuffle}
                onBulkAdd={handleBulkAdd}
                isSpinning={isSpinning}
              />
            )}

            {activeTab === "settings" && (
              <SettingsPanel
                config={config}
                entries={entries}
                onChangeConfig={handleConfigChange}
                isSpinning={isSpinning}
              />
            )}

            {activeTab === "history" && (
              <HistoryPanel
                history={history}
                onClearHistory={() => setHistory([])}
              />
            )}
          </div>
        </section>

          {/* Spin Action Button — below entire right panel */}
          <div className="flex flex-col">
            <SpinButton
              isSpinning={isSpinning}
              disabled={isSpinning}
              onSpin={handleSpin}
              entriesCount={entries.length}
              winnerCount={config.winnerCount}
              mode={config.mode}
            />

            {/* Single quiet status line */}
            <p className="mt-3 text-xs text-slate-500 text-center leading-relaxed">
              {config.mode === "target" ? (
                <>
                  Berhenti di{" "}
                  <span className="text-amber-200 font-semibold">
                    {entries.find((e) => e.id === config.targetId)?.label || "—"}
                  </span>{" "}
                  · pemenang tunggal
                </>
              ) : config.winnerCount > 1 ? (
                <>
                  Satu putaran mengeluarkan{" "}
                  <span className="text-slate-300 font-semibold">
                    {config.winnerCount} pemenang
                  </span>{" "}
                  berurutan
                </>
              ) : (
                <></>
              )}
            </p>
          </div>
        </div>
      </main>

      {/* 3. Winner Announcement Modal */}
      <ResultModal
        isOpen={isModalOpen}
        result={modalResult}
        onClose={() => setIsModalOpen(false)}
        onSpinAgain={() => {
          setIsModalOpen(false);
          setTimeout(() => handleSpin(), 200);
        }}
        onRemoveWinner={handleRemoveWinnerManually}
        confettiEnabled={config.confettiEnabled}
      />
    </div>
  );
}

export default App;

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
  dot?: boolean;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex-1 py-2 px-2 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
        active
          ? "bg-white/[0.08] text-white border border-white/10"
          : "text-slate-500 hover:text-slate-300 border border-transparent hover:bg-white/[0.04]"
      }`}
    >
      {icon}
      <span>{label}</span>
      {typeof count === "number" && (
        <span
          className={`text-[11px] tabular-nums px-1.5 py-px rounded-md font-semibold ${active ? "bg-white/10 text-slate-200" : "bg-white/[0.05] text-slate-500"}`}
        >
          {count}
        </span>
      )}
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-amber-300 shrink-0"
          aria-label="Target aktif"
        />
      )}
    </button>
  );
}
