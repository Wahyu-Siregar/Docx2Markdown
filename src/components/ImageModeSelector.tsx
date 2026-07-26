import React from 'react';
import { ImageHandlingMode } from '../types/ast';
import { FileImage, Code2, EyeOff, CheckCircle2 } from 'lucide-react';

interface ImageModeSelectorProps {
  currentMode: ImageHandlingMode;
  onSelectMode: (mode: ImageHandlingMode) => void;
  imageCount: number;
}

export const ImageModeSelector: React.FC<ImageModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  imageCount,
}) => {
  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">Mode Penanganan Gambar</h3>
        <p className="text-xs text-slate-400">
          Pilih bagaimana gambar di dalam dokumen Word akan diproses ke dalam Markdown.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mode C - Folder Terpisah (Recommended / Default) */}
        <div
          onClick={() => onSelectMode('external')}
          className={`relative rounded-xl p-5 border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
            currentMode === 'external'
              ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/30'
              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
          }`}
        >
          {currentMode === 'external' && (
            <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-brand-400" />
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-brand-500/20 text-brand-400">
                <FileImage className="w-5 h-5" />
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-semibold">
                Rekomendasi
              </span>
            </div>

            <h4 className="text-sm font-semibold text-white mb-1">Folder Gambar Terpisah</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Gambar diekstrak ke folder khusus dan dihubungkan menggunakan relative path.
            </p>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800 font-mono">
            ./images/diagram-arsitektur.png
          </div>
        </div>

        {/* Mode B - Base64 */}
        <div
          onClick={() => onSelectMode('base64')}
          className={`relative rounded-xl p-5 border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
            currentMode === 'base64'
              ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/30'
              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
          }`}
        >
          {currentMode === 'base64' && (
            <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-brand-400" />
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Code2 className="w-5 h-5" />
              </div>
            </div>

            <h4 className="text-sm font-semibold text-white mb-1">Gambar Base64</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Gambar disematkan langsung di file Markdown menggunakan Data URI Base64.
            </p>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800 font-mono truncate">
            data:image/png;base64,iVBORw...
          </div>
        </div>

        {/* Mode A - Tanpa Gambar */}
        <div
          onClick={() => onSelectMode('none')}
          className={`relative rounded-xl p-5 border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
            currentMode === 'none'
              ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/30'
              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
          }`}
        >
          {currentMode === 'none' && (
            <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-brand-400" />
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                <EyeOff className="w-5 h-5" />
              </div>
            </div>

            <h4 className="text-sm font-semibold text-white mb-1">Tanpa Gambar</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Gambar tidak dimasukkan ke dalam Markdown. Ukuran file hasil menjadi sangat kecil.
            </p>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800 font-mono">
            Hanya teks & struktur dokumen
          </div>
        </div>
      </div>
    </div>
  );
};
