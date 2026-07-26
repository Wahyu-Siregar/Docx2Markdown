import React from 'react';
import { X, CheckCircle2, AlertTriangle, Clock, FileText, Image as ImageIcon, Heading, Table, List } from 'lucide-react';
import { DocumentAST, ConversionWarning } from '../types/ast';

interface ConversionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  ast: DocumentAST | null;
  warnings: ConversionWarning[];
  durationMs: number;
  imageMode: string;
}

export const ConversionReportModal: React.FC<ConversionReportModalProps> = ({
  isOpen,
  onClose,
  ast,
  warnings,
  durationMs,
  imageMode,
}) => {
  if (!isOpen || !ast) return null;

  const stats = ast.statistics;
  const durationSec = (durationMs / 1000).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl glass-panel rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Laporan Hasil Konversi</h3>
              <p className="text-xs text-slate-400">Dokumen berhasil dikonversi secara lokal</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Timing & Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="glass-card rounded-xl p-3 flex flex-col items-center text-center">
              <Clock className="w-4 h-4 text-brand-400 mb-1" />
              <span className="text-lg font-bold text-white">{durationSec} s</span>
              <span className="text-[11px] text-slate-400">Durasi Proses</span>
            </div>

            <div className="glass-card rounded-xl p-3 flex flex-col items-center text-center">
              <ImageIcon className="w-4 h-4 text-indigo-400 mb-1" />
              <span className="text-lg font-bold text-white capitalize">{imageMode}</span>
              <span className="text-[11px] text-slate-400">Mode Gambar</span>
            </div>

            <div className="glass-card rounded-xl p-3 flex flex-col items-center text-center col-span-2 sm:col-span-1">
              <AlertTriangle className="w-4 h-4 text-amber-400 mb-1" />
              <span className="text-lg font-bold text-white">{warnings.length}</span>
              <span className="text-[11px] text-slate-400">Peringatan</span>
            </div>
          </div>

          {/* Statistics Detail Table */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Rincian Elemen Terkonversi
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Heading className="w-3.5 h-3.5 text-brand-400" /> Heading
                </span>
                <span className="font-bold text-white">{stats.headings}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" /> Paragraf
                </span>
                <span className="font-bold text-white">{stats.paragraphs}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <List className="w-3.5 h-3.5 text-amber-400" /> Daftar
                </span>
                <span className="font-bold text-white">{stats.lists}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-purple-400" /> Tabel
                </span>
                <span className="font-bold text-white">{stats.tables}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-rose-400" /> Gambar
                </span>
                <span className="font-bold text-white">{stats.images}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Hyperlink</span>
                <span className="font-bold text-white">{stats.hyperlinks}</span>
              </div>
            </div>
          </div>

          {/* Warnings List */}
          {warnings.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Catatan & Peringatan ({warnings.length})
              </h4>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {warnings.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200"
                  >
                    <div className="font-semibold text-amber-300 mb-0.5">{w.message}</div>
                    {w.location && <div className="text-[11px] text-amber-400/80">Lokasi: {w.location}</div>}
                    {w.suggestion && <div className="text-[11px] text-slate-400 mt-1">Saran: {w.suggestion}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-md transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
