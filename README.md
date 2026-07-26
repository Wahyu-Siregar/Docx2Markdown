# 📝 Docx2Markdown

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()
[![Electron](https://img.shields.io/badge/Electron-34.0.0-4B8BF5.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-emerald.svg)]()

**Docx2Markdown** adalah aplikasi desktop *local-first* modern untuk mengonversi dokumen Microsoft Word (`.docx`) menjadi file **GitHub Flavored Markdown (GFM)** yang rapi, terstruktur, dan siap pakai tanpa perlu perbaikan manual.

Aplikasi ini diproses **100% secara lokal** di perangkat Anda. Dokumen tidak pernah diunggah ke server cloud atau layanan pihak ketiga.

---

## ✨ Fitur Utama

- 🔒 **100% Privat & Lokal:** Seluruh proses ekstraksi XML, penanganan gambar, dan rendering berjalan sepenuhnya di komputer Anda.
- 🎨 **3 Mode Penanganan Gambar:**
  1. **Folder Gambar Terpisah (Default):** Mengekstrak gambar ke folder khusus (`./images/` atau nama kustom) dan dihubungkan via *relative path*.
  2. **Gambar Base64:** Menyematkan gambar langsung ke dalam file Markdown menggunakan Data URI Base64 (menghasilkan 1 file tunggal).
  3. **Tanpa Gambar:** Mengabaikan gambar untuk memperkecil ukuran file, dengan opsi mempertahankan teks caption sebagai *blockquote*.
- 🏷️ **Penamaan Gambar Cerdas dari Caption:** Mengambil nama file gambar otomatis dari Caption Word, Alt Text, atau Title. Dilengkapi pembersihan karakter khusus, slugifikasi, dan pencegahan duplikat nama (`-2`, `-3`).
- ⚡ **Preservation Struktur Dokumen Lengkap:**
  - **Heading:** H1–H6 (`#`..`######`) dengan deteksi peringatan lompatan level.
  - **Formatting Inline:** Bold (`**`), Italic (`*`), Strikethrough (`~~`), Inline code (`` ` ``), Hyperlink, Subscript (`<sub>`), Superscript (`<sup>`).
  - **Daftar (List):** Unordered (`-`), Ordered (`1.`), Nesting bertingkat, dan Checklist (`- [x]` / `- [ ]`).
  - **Tabel & Merged Cells:** Tabel standar dikonversi ke pipe table GFM, sedangkan tabel kompleks dengan sel digabung (*merged cells*) dikonversi otomatis ke tabel HTML (`<table>`).
  - **Footnote & Page Break:** Catatan kaki (`[^1]`), dan pemisah halaman (`---` atau komentar HTML).
  - **Daftar Isi (TOC):** Pembuatan Daftar Isi otomatis yang terhubung ke heading.
- 🎯 **Preset Konversi Siap Pakai:** Preset untuk **GitHub**, **Obsidian** (`./attachments/`), **Single-File**, dan **Text-Only**.
- 🖥️ **Split-View Interactive Workspace:** Editor *source code* Markdown yang dapat diedit langsung di panel kiri dengan *live rendered preview* GFM di panel kanan.
- 🔍 **Pencarian Teks & Edit Live:** Cari kata/frase di preview dan edit Markdown langsung sebelum disimpan.
- 📦 **Ekspor Fleksibel:** Simpan sebagai file tunggal `.md`, folder paket komplit, atau paket arsip `.zip`.
- 💾 **Penyimpanan Preferensi:** Menyimpan preferensi konfigurasi terakhir secara otomatis (*local storage*).

---

## 🚀 Teknologi yang Digunakan

- **Desktop Framework:** Electron 34
- **Frontend Core:** React 18 + TypeScript + Vite 6
- **Styling & UI:** Tailwind CSS + Lucide Icons (Glassmorphic Dark Theme)
- **DOCX & XML Engine:** JSZip + Fast XML Parser
- **Markdown Preview:** React Markdown + Remark GFM + Rehype Raw

---

## 📥 Cara Menginstal & Menjalankan (Development)

### Prasyarat
- **Node.js** v18 atau lebih baru
- **npm** (atau yarn / pnpm)

### Langkah Install

1. **Clone Repositori:**
   ```bash
   git clone https://github.com/Wahyu-Siregar/Docx2Markdown.git
   cd Docx2Markdown
   ```

2. **Install Dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan dalam Mode Development:**
   ```bash
   npm run dev
   ```

4. **Build untuk Produksi:**
   ```bash
   npm run build
   ```

---

## 📂 Struktur Proyek

```text
Docx2Markdown/
├── electron/                  # Electron main & preload IPC scripts
│   ├── main.ts                # Main process (Native Window, IPC, Filesystem)
│   └── preload.ts             # Preload context bridge (window.docx2mdApi)
├── src/
│   ├── components/            # React UI Components
│   │   ├── Header.tsx         # Header bar with privacy badge & reset
│   │   ├── DropZone.tsx       # Drag-and-drop file upload zone
│   │   ├── FileSummaryPanel.tsx # Document metrics overview
│   │   ├── ImageModeSelector.tsx # Mode A, B, C selection cards
│   │   ├── AdvancedOptionsDrawer.tsx # Configuration options & Presets
│   │   ├── ConversionProgress.tsx # Animated progress bar
│   │   ├── PreviewWorkspace.tsx # Split-view live preview & search
│   │   └── ConversionReportModal.tsx # Full report & warning logs
│   ├── core/                  # AST & Conversion Core Logic
│   │   ├── docxParser.ts      # Unzips DOCX XML to Document AST
│   │   ├── imageProcessor.ts  # Slugifies captions & handles image modes
│   │   ├── markdownRenderer.ts# Transforms AST to GFM Markdown & warnings
│   │   ├── exporter.ts        # Exports ZIP packages & folder structures
│   │   └── validator.ts       # Output integrity validator
│   ├── types/                 # TypeScript Types & Interfaces
│   │   ├── ast.ts             # Document AST data structures
│   │   └── config.ts          # Conversion options & preset defaults
│   ├── App.tsx                # Main App Controller
│   ├── main.tsx               # React entrypoint
│   └── index.css              # Tailwind CSS & glassmorphism styles
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 📄 Lisensi

Proyek ini dirilis di bawah lisensi [MIT License](LICENSE).
