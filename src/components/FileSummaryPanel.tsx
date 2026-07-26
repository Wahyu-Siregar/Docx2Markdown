import React from 'react';
import { FileText, Image as ImageIcon, Heading, Table, List, Trash2, RefreshCw } from 'lucide-react';
import { DocumentAST } from '../types/ast';

interface FileSummaryPanelProps {
  fileName: string;
  fileSize: number;
  fileModified?: string;
  ast?: DocumentAST | null;
  onChangeFile: () => void;
  onClearFile: () => void;
}

export const FileSummaryPanel: React.FC<FileSummaryPanelProps> = ({
  fileName,
  fileSize,
  fileModified,
  ast,
  onChangeFile,
  onClearFile,
}) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const stats = ast?.statistics || {
    headings: 0,
    paragraphs: 0,
    lists: 0,
    tables: 0,
    images: 0,
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white truncate max-w-md" title={fileName}>
              {fileName}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span>{formatBytes(fileSize)}</span>
              {fileModified && <span>• Modifikasi: {new Date(fileModified).toLocaleDateString('id-ID')}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onChangeFile}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Ganti File</span>
          </button>
          <button
            onClick={onClearFile}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        </div>
      </div>

      {ast && (
        <div>
          <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
            Ringkasan Struktur Dokumen
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="glass-card rounded-xl p-3 flex flex-col items-center text-center">
              <Heading className="w-4 h-4 text-brand-400 mb-1" />
              <span className="text-lg font-bold text-white">{stats.headings}</span>
              <span className="text-[11px] text-slate-400">Heading</span>
            </div>

            <div className="glass-card rounded-xl p-3 flex flex-col items-center text-center">
              <FileText className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-lg font-bold text-white">{stats.paragraphs}</span>
              <span className="text-[11px] text-slate-400">Paragraf</span>
            </div>

            <div className="glass-card rounded-xl p-3 flex flex-col items-center text-center">
              <List className="w-4 h-4 text-amber-400 mb-1" />
              <span className="text-lg font-bold text-white">{stats.lists}</span>
              <span className="text-[11px] text-slate-400">Daftar</span>
            </div>

            <div className="glass-card rounded-xl p-3 flex flex-col items-center text-center">
              <Table className="w-4 h-4 text-purple-400 mb-1" />
              <span className="text-lg font-bold text-white">{stats.tables}</span>
              <span className="text-[11px] text-slate-400">Tabel</span>
            </div>

            <div className="glass-card rounded-xl p-3 flex flex-col items-center text-center">
              <ImageIcon className="w-4 h-4 text-rose-400 mb-1" />
              <span className="text-lg font-bold text-white">{stats.images}</span>
              <span className="text-[11px] text-slate-400">Gambar</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
