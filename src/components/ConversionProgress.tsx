import React from 'react';
import { Loader2, XCircle } from 'lucide-react';

interface ConversionProgressProps {
  stage: string;
  percent: number;
  onCancel?: () => void;
}

export const ConversionProgress: React.FC<ConversionProgressProps> = ({
  stage,
  percent,
  onCancel,
}) => {
  return (
    <div className="w-full glass-panel rounded-2xl p-8 border border-slate-800 shadow-2xl flex flex-col items-center justify-center text-center">
      <div className="p-4 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 mb-4 animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>

      <h3 className="text-base font-semibold text-white mb-1">Mengonversi Dokumen...</h3>
      <p className="text-xs text-slate-400 mb-6">{stage}</p>

      <div className="w-full max-w-md bg-slate-900 rounded-full h-3 border border-slate-800 p-0.5 mb-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-brand-500 to-indigo-500 h-full rounded-full transition-all duration-300 shadow-lg shadow-brand-500/50"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between w-full max-w-md text-xs text-slate-400 mb-6">
        <span>{percent}% selesai</span>
        <span>Memproses secara lokal</span>
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <XCircle className="w-4 h-4 text-rose-400" />
          <span>Batalkan Konversi</span>
        </button>
      )}
    </div>
  );
};
