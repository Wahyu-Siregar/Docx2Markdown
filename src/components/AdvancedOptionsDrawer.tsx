import React, { useState } from 'react';
import { Sliders, ChevronDown, ChevronUp, Folder, FileType, Bookmark } from 'lucide-react';
import { ConversionConfig, PresetType, PRESETS } from '../types/config';

interface AdvancedOptionsProps {
  config: ConversionConfig;
  onChangeConfig: (newConfig: ConversionConfig) => void;
}

export const AdvancedOptionsDrawer: React.FC<AdvancedOptionsProps> = ({
  config,
  onChangeConfig,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const update = <K extends keyof ConversionConfig>(key: K, val: ConversionConfig[K]) => {
    onChangeConfig({
      ...config,
      preset: 'custom',
      [key]: val,
    });
  };

  const handleSelectPreset = (preset: PresetType) => {
    if (preset === 'custom') return;
    const presetValues = PRESETS[preset];
    onChangeConfig({
      ...config,
      ...presetValues,
      preset,
    });
  };

  return (
    <div className="w-full glass-panel rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-slate-900/40 hover:bg-slate-900/80 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Pengaturan & Preset Konversi</h3>
              {config.preset && config.preset !== 'custom' && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Preset: {config.preset}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Pilih preset (GitHub, Obsidian) atau atur opsi kustom secara manual</p>
          </div>
        </div>

        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-6 border-t border-slate-800 space-y-6 bg-slate-950/40">
          {/* Preset Selector */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-brand-400" />
              <span>Preset Siap Pakai (Section 24 PRD)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleSelectPreset('github')}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                  config.preset === 'github'
                    ? 'bg-brand-600 text-white border-brand-500 shadow'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold">GitHub Preset</div>
                <div className="text-[10px] opacity-80">GFM, ./images/</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('obsidian')}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                  config.preset === 'obsidian'
                    ? 'bg-brand-600 text-white border-brand-500 shadow'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold">Obsidian Preset</div>
                <div className="text-[10px] opacity-80">CommonMark, ./attachments/</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('single-file')}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                  config.preset === 'single-file'
                    ? 'bg-brand-600 text-white border-brand-500 shadow'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold">Single-File</div>
                <div className="text-[10px] opacity-80">Base64 Data URIs</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('text-only')}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                  config.preset === 'text-only'
                    ? 'bg-brand-600 text-white border-brand-500 shadow'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold">Text-Only</div>
                <div className="text-[10px] opacity-80">Tanpa gambar</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Folder Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-brand-400" />
                <span>Nama Folder Gambar (Mode External)</span>
              </label>
              <input
                type="text"
                value={config.imageDirectory}
                onChange={(e) => update('imageDirectory', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                placeholder="images"
              />
            </div>




            {/* Page Break Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Penanganan Pemisah Halaman (Page Break)
              </label>
              <select
                value={config.pageBreakMode}
                onChange={(e) => update('pageBreakMode', e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="horizontal-rule">Garis Horizontal (---)</option>
                <option value="comment">Komentar HTML (&lt;!-- pagebreak --&gt;)</option>
                <option value="ignore">Abaikan (Hapus)</option>
              </select>
            </div>

            {/* Table Fallback */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fallback Tabel Kompleks (Merged Cells)
              </label>
              <select
                value={config.complexTableFallback}
                onChange={(e) => update('complexTableFallback', e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="html">Format HTML (&lt;table&gt;)</option>
                <option value="text">Abaikan Merged Cells</option>
              </select>
            </div>

            {/* Line Ending */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <FileType className="w-3.5 h-3.5 text-indigo-400" />
                <span>Format Line Ending</span>
              </label>
              <select
                value={config.lineEnding}
                onChange={(e) => update('lineEnding', e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="auto">Otomatis Sesuai OS</option>
                <option value="lf">Linux / macOS (LF \n)</option>
                <option value="crlf">Windows (CRLF \r\n)</option>
              </select>
            </div>
          </div>

          {/* Checkbox Options */}
          <div className="space-y-3 pt-2 border-t border-slate-800/60">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.useCaptionAsFilename}
                onChange={(e) => update('useCaptionAsFilename', e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500"
              />
              <span className="text-xs text-slate-300">
                Gunakan Caption Word sebagai nama file gambar
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.removeCaptionNumber}
                onChange={(e) => update('removeCaptionNumber', e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500"
              />
              <span className="text-xs text-slate-300">
                Hapus awalan angka caption dari nama file (misal: "Gambar 1. Diagram" &rarr; "diagram.png")
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.preserveCaptionText}
                onChange={(e) => update('preserveCaptionText', e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500"
              />
              <span className="text-xs text-slate-300">
                Pertahankan teks caption pada mode "Tanpa Gambar"
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.includeTableOfContents}
                onChange={(e) => update('includeTableOfContents', e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500"
              />
              <span className="text-xs text-slate-300">
                Sertakan Daftar Isi (Table of Contents) di bagian atas Markdown
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
