import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, ClipboardList, Shuffle, Users } from 'lucide-react';
import type { RouletteEntry } from '../types/roulette';

interface EntryPanelProps {
  entries: RouletteEntry[];
  onAddEntry: (name: string) => void;
  onUpdateEntry: (id: string, newLabel: string) => void;
  onDeleteEntry: (id: string) => void;
  onClearAll: () => void;
  onShuffle: () => void;
  onBulkAdd: (names: string[]) => void;
  isSpinning: boolean;
}

export const EntryPanel: React.FC<EntryPanelProps> = ({
  entries,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onClearAll,
  onShuffle,
  onBulkAdd,
  isSpinning,
}) => {
  const [newEntryText, setNewEntryText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryText.trim() || isSpinning) return;
    onAddEntry(newEntryText.trim());
    setNewEntryText('');
  };

  const startEdit = (entry: RouletteEntry) => {
    if (isSpinning) return;
    setEditingId(entry.id);
    setEditingText(entry.label);
  };

  const saveEdit = (id: string) => {
    if (editingText.trim()) {
      onUpdateEntry(id, editingText.trim());
    }
    setEditingId(null);
  };

  const handleBulkSubmit = () => {
    const rawLines = bulkText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (rawLines.length > 0) {
      onBulkAdd(rawLines);
      setBulkText('');
      setShowBulkModal(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
        <p className="section-label">Daftar nama · {entries.length}</p>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowBulkModal(true)}
            disabled={isSpinning}
            className="h-7 px-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 text-xs font-medium transition-colors disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
            title="Tempel banyak nama sekaligus"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bulk</span>
          </button>

          <button
            onClick={onShuffle}
            disabled={isSpinning || entries.length <= 1}
            aria-label="Acak urutan"
            className="w-7 h-7 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 transition-colors disabled:opacity-40 flex items-center justify-center cursor-pointer"
            title="Acak urutan"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClearAll}
            disabled={isSpinning || entries.length === 0}
            aria-label="Hapus semua"
            className="w-7 h-7 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-red-500/10 hover:border-red-400/20 hover:text-red-300 text-slate-400 transition-colors disabled:opacity-40 flex items-center justify-center cursor-pointer"
            title="Hapus semua"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-3">
        <input
          type="text"
          value={newEntryText}
          onChange={(e) => setNewEntryText(e.target.value)}
          disabled={isSpinning}
          placeholder="Ketik nama, Enter untuk tambah…"
          className="flex-1 h-9 px-3 rounded-lg text-sm glass-input text-slate-100 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!newEntryText.trim() || isSpinning}
          className="h-9 px-3.5 rounded-lg bg-slate-100 hover:bg-white text-slate-900 font-semibold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah</span>
        </button>
      </form>

      <div className="flex-1 overflow-y-auto pr-1 space-y-1 max-h-[420px] sm:max-h-[500px]">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center mb-2.5">
              <Users className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-300">Belum ada nama</p>
            <p className="text-xs text-slate-500 mt-1">
              Ketik di atas, atau pakai Bulk untuk banyak nama.
            </p>
          </div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center justify-between h-10 pl-2.5 pr-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-colors group"
            >
              {editingId === entry.id ? (
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(entry.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="flex-1 h-7 px-2 text-[13px] rounded-md bg-[#0d1017] border border-indigo-400/60 text-white outline-none"
                  />
                  <button onClick={() => saveEdit(entry.id)} className="p-1.5 text-emerald-400 hover:text-emerald-300 cursor-pointer" title="Simpan">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-500 hover:text-slate-300 cursor-pointer" title="Batal">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="text-[11px] tabular-nums text-slate-600 w-6 shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="text-[13px] font-medium text-slate-200 truncate cursor-pointer hover:text-white transition-colors"
                      onClick={() => startEdit(entry)}
                      title="Klik untuk ubah"
                    >
                      {entry.label}
                    </span>
                  </div>
                  <div className="flex items-center shrink-0">
                    <button
                      onClick={() => startEdit(entry)}
                      disabled={isSpinning}
                      aria-label={`Ubah ${entry.label}`}
                      className="p-1.5 rounded-md text-slate-600 hover:text-slate-200 hover:bg-white/[0.06] transition-colors disabled:opacity-40 cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Ubah nama"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      disabled={isSpinning}
                      aria-label={`Hapus ${entry.label}`}
                      className="p-1.5 rounded-md text-slate-600 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-40 cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md p-5 rounded-2xl bg-[#141821] border border-white/10 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-heading font-bold text-[15px] text-white">
                Tambah banyak nama
              </h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Satu nama per baris, atau pisahkan dengan koma.
            </p>

            <textarea
              rows={8}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`Kevin\nRay\nDavid`}
              className="w-full p-3 rounded-lg glass-input text-slate-100 text-sm font-mono mb-3 resize-none"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 h-9 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleBulkSubmit}
                disabled={!bulkText.trim()}
                className="px-4 h-9 rounded-lg text-sm font-semibold bg-slate-100 hover:bg-white text-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Tambah {bulkText.split(/[\n,]+/).filter(s => s.trim()).length > 0 ? `(${bulkText.split(/[\n,]+/).filter(s => s.trim()).length})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
