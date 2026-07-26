import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  Columns,
  Code,
  Eye,
  Copy,
  Check,
  Save,
  FolderArchive,
  Archive,
  FileCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { ConversionWarning } from '../types/ast';

interface PreviewWorkspaceProps {
  initialMarkdown: string;
  warnings: ConversionWarning[];
  onSaveMd: (content: string) => void;
  onSavePackageFolder: (content: string) => void;
  onSaveZip: (content: string) => void;
  onOpenReport: () => void;
  imageMode: string;
}

export const PreviewWorkspace: React.FC<PreviewWorkspaceProps> = ({
  initialMarkdown,
  warnings,
  onSaveMd,
  onSavePackageFolder,
  onSaveZip,
  onOpenReport,
  imageMode,
}) => {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [viewMode, setViewMode] = useState<'split' | 'source' | 'preview'>('split');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetMarkdown = () => {
    setMarkdown(initialMarkdown);
  };

  return (
    <div className="w-full h-[calc(100vh-140px)] flex flex-col glass-panel rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-3 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'split' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
            <button
              onClick={() => setViewMode('source')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'source' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Source Only</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'preview' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Rendered Preview</span>
            </button>
          </div>

          {markdown !== initialMarkdown && (
            <button
              onClick={handleResetMarkdown}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/20 flex items-center gap-1 transition-colors"
              title="Kembalikan ke hasil konversi awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Edit</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {warnings.length > 0 && (
            <button
              onClick={onOpenReport}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/20 flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{warnings.length} Warning</span>
            </button>
          )}

          <button
            onClick={onOpenReport}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <FileCheck className="w-3.5 h-3.5 text-brand-400" />
            <span>Laporan</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Salin Markdown'}</span>
          </button>

          <button
            onClick={() => onSaveMd(markdown)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-brand-400" />
            <span>Simpan .md</span>
          </button>

          {imageMode === 'external' && (
            <button
              onClick={() => onSavePackageFolder(markdown)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md flex items-center gap-1.5 transition-colors"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Simpan Folder Paket</span>
            </button>
          )}

          <button
            onClick={() => onSaveZip(markdown)}
            className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-md shadow-brand-600/30 flex items-center gap-1.5 transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Ekspor ZIP</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden">
        {/* Left Side: Markdown Source Editor */}
        {(viewMode === 'split' || viewMode === 'source') && (
          <div className={`h-full flex flex-col ${viewMode === 'source' ? 'col-span-2' : ''}`}>
            <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider flex justify-between items-center">
              <span>Markdown Source Code (Dapat Diedit)</span>
              <span>{markdown.length} karakter</span>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full flex-1 p-5 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed focus:outline-none resize-none border-none selection:bg-brand-500 selection:text-white"
              spellCheck={false}
            />
          </div>
        )}

        {/* Right Side: Rendered GFM Preview */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`h-full flex flex-col bg-slate-900/40 ${viewMode === 'preview' ? 'col-span-2' : ''}`}>
            <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider flex justify-between items-center">
              <span>Rendered Markdown Preview (GFM)</span>
              <span>Live Visual</span>
            </div>
            <div className="flex-1 p-6 overflow-y-auto prose prose-invert prose-slate max-w-none prose-headings:text-brand-300 prose-a:text-brand-400 prose-img:rounded-xl prose-img:border prose-img:border-slate-800 prose-table:border-collapse prose-th:border prose-th:border-slate-800 prose-th:p-2 prose-td:border prose-td:border-slate-800 prose-td:p-2 text-sm leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {markdown}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
