import React, { useState } from 'react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { FileSummaryPanel } from './components/FileSummaryPanel';
import { ImageModeSelector } from './components/ImageModeSelector';
import { AdvancedOptionsDrawer } from './components/AdvancedOptionsDrawer';
import { ConversionProgress } from './components/ConversionProgress';
import { PreviewWorkspace } from './components/PreviewWorkspace';
import { ConversionReportModal } from './components/ConversionReportModal';

import { DocxParser } from './core/docxParser';
import { ImageProcessor, ProcessedImageResult } from './core/imageProcessor';
import { MarkdownRenderer } from './core/markdownRenderer';
import { Exporter } from './core/exporter';
import { OutputValidator } from './core/validator';

import { DocumentAST, ConversionWarning } from './types/ast';
import { ConversionConfig, DEFAULT_CONFIG } from './types/config';
import { ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    docx2mdApi?: any;
  }
}

export const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
    modified?: string;
    buffer: ArrayBuffer;
  } | null>(null);

  const [config, setConfig] = useState<ConversionConfig>(() => {
    try {
      const saved = localStorage.getItem('docx2md_config');
      if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch {
      // Fallback
    }
    return DEFAULT_CONFIG;
  });

  const handleUpdateConfig = (newConfig: ConversionConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('docx2md_config', JSON.stringify(newConfig));
    } catch {
      // Ignore
    }
  };
  const [ast, setAst] = useState<DocumentAST | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Conversion state
  const [isConverting, setIsConverting] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

  // Results state
  const [renderedMarkdown, setRenderedMarkdown] = useState<string | null>(null);
  const [processedImages, setProcessedImages] = useState<Map<string, ProcessedImageResult>>(new Map());
  const [warnings, setWarnings] = useState<ConversionWarning[]>([]);
  const [durationMs, setDurationMs] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Process File Selection
  const handleFileSelect = async (file: File) => {
    setErrorMessage(null);
    setRenderedMarkdown(null);
    const buffer = await file.arrayBuffer();

    setSelectedFile({
      name: file.name,
      size: file.size,
      modified: new Date(file.lastModified).toISOString(),
      buffer,
    });

    // Parse AST
    try {
      setIsParsing(true);
      const parser = new DocxParser();
      const docAst = await parser.parseDocx(buffer, file.name);
      setAst(docAst);
    } catch (err: any) {
      setErrorMessage(`Gagal membaca file Word: ${err.message || 'File rusak atau terenkripsi.'}`);
      setAst(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleNativeOpen = async () => {
    if (window.docx2mdApi) {
      const res = await window.docx2mdApi.openFile();
      if (res) {
        setErrorMessage(null);
        setRenderedMarkdown(null);
        const uint8 = new Uint8Array(res.buffer);
        const buffer = uint8.buffer;

        setSelectedFile({
          name: res.name,
          size: res.size,
          modified: res.modified,
          buffer,
        });

        try {
          setIsParsing(true);
          const parser = new DocxParser();
          const docAst = await parser.parseDocx(buffer, res.name);
          setAst(docAst);
        } catch (err: any) {
          setErrorMessage(`Gagal membaca file Word: ${err.message || 'File rusak atau terenkripsi.'}`);
          setAst(null);
        } finally {
          setIsParsing(false);
        }
      }
    }
  };

  const handleStartConversion = async () => {
    if (!ast || !selectedFile) return;

    setIsConverting(true);
    setErrorMessage(null);
    const startTime = performance.now();

    try {
      // Stage 1
      setProgressStage('Membaca dokumen Word...');
      setProgressPercent(15);
      await delay(100);

      // Stage 2
      setProgressStage('Menganalisis struktur & heading...');
      setProgressPercent(35);
      await delay(100);

      // Stage 3
      setProgressStage('Memproses gambar & caption...');
      setProgressPercent(60);
      const imgResults = ImageProcessor.processImages(ast.images, config);
      setProcessedImages(imgResults);
      await delay(100);

      // Stage 4
      setProgressStage('Rendering Markdown GFM...');
      setProgressPercent(85);
      const renderRes = MarkdownRenderer.render(ast, imgResults, config);
      await delay(100);

      // Stage 5
      setProgressStage('Memvalidasi hasil konversi...');
      setProgressPercent(100);
      const validationIssues = OutputValidator.validate(renderRes.markdown, imgResults, config);
      const combinedWarnings = [
        ...renderRes.warnings,
        ...validationIssues.map((v) => ({
          code: 'VALIDATION_ISSUE',
          message: v.message,
        })),
      ];

      const endTime = performance.now();
      setDurationMs(Math.round(endTime - startTime));

      setRenderedMarkdown(renderRes.markdown);
      setWarnings(combinedWarnings);
    } catch (err: any) {
      setErrorMessage(`Terjadi kesalahan saat konversi: ${err.message}`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setAst(null);
    setRenderedMarkdown(null);
    setErrorMessage(null);
    setConfig(DEFAULT_CONFIG);
  };

  // Export Save Handlers
  const handleSaveMd = async (content: string) => {
    const defaultName = selectedFile ? selectedFile.name.replace(/\.(docx|doc)$/i, '.md') : 'document.md';
    if (window.docx2mdApi) {
      const savedPath = await window.docx2mdApi.saveFile({
        defaultName,
        content,
      });
      if (savedPath) {
        alert(`File Markdown berhasil disimpan di:\n${savedPath}`);
      }
    } else {
      // Web Download fallback
      downloadFile(defaultName, content, 'text/markdown');
    }
  };

  const handleSavePackageFolder = async (content: string) => {
    if (!selectedFile) return;
    const baseName = selectedFile.name.replace(/\.(docx|doc)$/i, '');
    const markdownName = `${baseName}.md`;

    if (window.docx2mdApi) {
      const folderPath = await window.docx2mdApi.selectFolder();
      if (folderPath) {
        const imagesList = Array.from(processedImages.values())
          .filter((i) => i.buffer && i.filename)
          .map((i) => ({
            filename: i.filename!,
            buffer: Array.from(i.buffer!),
          }));

        const reportData = {
          sourceFile: selectedFile.name,
          outputFile: markdownName,
          imageMode: config.imageMode,
          statistics: ast?.statistics,
          warnings: warnings,
        };

        const target = await window.docx2mdApi.exportFolderPackage({
          targetFolder: folderPath,
          markdownName,
          markdownContent: content,
          images: imagesList,
          imageFolder: config.imageDirectory || 'images',
          report: config.includeConversionReport ? reportData : undefined,
        });

        alert(`Paket folder berhasil disimpan di:\n${target}`);
      }
    } else {
      alert('Ekspor folder langsung membutuhkan aplikasi desktop Electron. Silakan gunakan opsi Ekspor ZIP.');
    }
  };

  const handleSaveZip = async (content: string) => {
    if (!selectedFile) return;
    const baseName = selectedFile.name.replace(/\.(docx|doc)$/i, '');
    const markdownName = `${baseName}.md`;
    const zipName = `${baseName}.zip`;

    const reportData = {
      sourceFile: selectedFile.name,
      outputFile: markdownName,
      imageMode: config.imageMode,
      statistics: ast?.statistics,
      warnings: warnings,
    };

    const zipBuffer = await Exporter.createZipPackage(
      markdownName,
      content,
      processedImages,
      config.imageDirectory || 'images',
      config.includeConversionReport ? reportData : undefined
    );

    if (window.docx2mdApi) {
      const savedPath = await window.docx2mdApi.saveBinary({
        defaultName: zipName,
        buffer: Array.from(zipBuffer),
      });
      if (savedPath) {
        alert(`Paket ZIP berhasil disimpan di:\n${savedPath}`);
      }
    } else {
      downloadBinary(zipName, zipBuffer, 'application/zip');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      <Header onReset={handleReset} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Error Alert */}
        {errorMessage && (
          <div className="w-full p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-white"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Workspace state 1: Preview View */}
        {renderedMarkdown ? (
          <PreviewWorkspace
            initialMarkdown={renderedMarkdown}
            warnings={warnings}
            onSaveMd={handleSaveMd}
            onSavePackageFolder={handleSavePackageFolder}
            onSaveZip={handleSaveZip}
            onOpenReport={() => setShowReportModal(true)}
            imageMode={config.imageMode}
          />
        ) : isConverting ? (
          /* Workspace state 2: Progress Bar */
          <ConversionProgress stage={progressStage} percent={progressPercent} />
        ) : (
          /* Workspace state 3: Input & Setup Form */
          <div className="w-full flex flex-col gap-6">
            {!selectedFile ? (
              <DropZone onFileSelect={handleFileSelect} onNativeOpen={handleNativeOpen} />
            ) : (
              <FileSummaryPanel
                fileName={selectedFile.name}
                fileSize={selectedFile.size}
                fileModified={selectedFile.modified}
                ast={ast}
                onChangeFile={() => setSelectedFile(null)}
                onClearFile={handleReset}
              />
            )}

            {selectedFile && (
              <>
                <ImageModeSelector
                  currentMode={config.imageMode}
                  onSelectMode={(mode) => handleUpdateConfig({ ...config, imageMode: mode })}
                  imageCount={ast?.statistics.images || 0}
                />

                <AdvancedOptionsDrawer config={config} onChangeConfig={handleUpdateConfig} />

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleStartConversion}
                    disabled={isParsing || !ast}
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-brand-600/30 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                  >
                    <span>Mulai Konversi ke Markdown</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Report Modal */}
      <ConversionReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        ast={ast}
        warnings={warnings}
        durationMs={durationMs}
        imageMode={config.imageMode}
      />
    </div>
  );
};

export default App;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadBinary(filename: string, buffer: Uint8Array, mimeType: string) {
  const blob = new Blob([buffer.buffer as ArrayBuffer], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
