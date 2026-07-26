import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Lock, Sparkles } from 'lucide-react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  onNativeOpen?: () => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelect, onNativeOpen }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        onFileSelect(file);
      } else {
        alert('Format file tidak didukung. Silakan pilih file .docx atau .doc.');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 p-10 flex flex-col items-center justify-center text-center cursor-pointer group ${
        isDragging
          ? 'border-brand-400 bg-brand-500/10 scale-[1.01]'
          : 'border-slate-700/80 bg-slate-900/50 hover:border-brand-500/50 hover:bg-slate-900/80'
      }`}
      onClick={() => {
        if (onNativeOpen) {
          onNativeOpen();
        } else {
          inputRef.current?.click();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".docx,.doc"
        className="hidden"
        onChange={handleInputChange}
      />

      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 shadow-xl group-hover:scale-110 group-hover:border-brand-500/40 transition-all duration-300 mb-4">
        <UploadCloud className="w-10 h-10 text-brand-400 group-hover:text-brand-300" />
      </div>

      <h3 className="text-lg font-semibold text-white mb-1">
        Seret & Lepas file Word di sini
      </h3>
      <p className="text-sm text-slate-400 mb-6 max-w-md">
        Atau klik untuk memilih dokumen Word (<span className="text-slate-300 font-mono">.docx</span> / <span className="text-slate-300 font-mono">.doc</span>) dari perangkat Anda.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          <span>Pilih File Word</span>
        </button>
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-4 py-2 rounded-full border border-slate-800">
        <Lock className="w-3.5 h-3.5 text-emerald-400" />
        <span>Dokumen diproses secara lokal di perangkat Anda tanpa diunggah ke server.</span>
      </div>
    </div>
  );
};
