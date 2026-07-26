# PRODUCT REQUIREMENTS DOCUMENT

## Docx2Markdown

**Nama produk:** Docx2Markdown  
**Nama alternatif:** Word2MD, DocxMD Converter  
**Versi PRD:** 1.0  
**Status:** Draft siap pengembangan  
**Jenis aplikasi:** Desktop application, local-first  
**Target platform awal:** Windows 10 dan Windows 11  
**Platform lanjutan:** macOS dan Linux  
**Target pengguna:** Penggunaan pribadi  
**Bahasa antarmuka awal:** Bahasa Indonesia  
**Format input utama:** `.docx`  
**Format input tambahan:** `.doc`  
**Format output:** `.md`, folder aset gambar, atau paket `.zip`

---

# 1. Ringkasan Produk

Docx2Markdown adalah aplikasi untuk mengonversi dokumen Microsoft Word menjadi file Markdown yang rapi, terstruktur, dan mudah digunakan kembali.

Aplikasi harus mempertahankan struktur utama dokumen, seperti:

- Judul dan heading.
- Paragraf.
- Teks tebal, miring, dan coret.
- Daftar bernomor dan bullet.
- Tabel.
- Hyperlink.
- Kutipan.
- Catatan kaki.
- Gambar dan caption.
- Pemisah halaman atau bagian.
- Blok kode apabila dapat dikenali.

Saat melakukan konversi, pengguna dapat memilih salah satu dari tiga mode penanganan gambar:

1. **Tanpa gambar**  
   Gambar tidak dimasukkan ke file Markdown.

2. **Gambar sebagai Base64**  
   Gambar disematkan langsung ke file Markdown menggunakan Data URI Base64.

3. **Gambar sebagai file terpisah**  
   Gambar diekstrak ke folder khusus dan dihubungkan dengan relative path dari file Markdown. File Markdown dan folder gambar menjadi satu paket yang dapat disimpan sebagai folder atau ZIP.

Seluruh proses dilakukan secara lokal di perangkat pengguna agar dokumen tidak perlu diunggah ke server.

---

# 2. Latar Belakang

Dokumen Microsoft Word sering digunakan untuk penulisan laporan, dokumentasi, skripsi, artikel, catatan pribadi, dan materi pembelajaran. Namun, isi dokumen Word sulit digunakan secara langsung pada:

- GitHub.
- GitLab.
- Static site generator.
- Knowledge base.
- Aplikasi pencatat berbasis Markdown.
- Sistem dokumentasi.
- Repository kode.
- Model AI atau sistem RAG.
- CMS berbasis Markdown.

Konversi secara manual membutuhkan banyak waktu karena pengguna harus memperbaiki heading, tabel, daftar, gambar, caption, dan format teks satu per satu.

Tool konversi yang sudah ada juga sering menghasilkan beberapa masalah:

- Struktur heading tidak konsisten.
- Gambar memiliki nama acak.
- Caption gambar hilang.
- Path gambar rusak.
- Tabel tidak rapi.
- Base64 tidak didukung.
- Tidak ada preview hasil konversi.
- Dokumen harus diunggah ke layanan pihak ketiga.
- Hasil Markdown membutuhkan banyak perbaikan manual.

Docx2Markdown dibuat untuk menyediakan proses konversi yang lebih terkendali, privat, dan konsisten.

---

# 3. Pernyataan Masalah

Pengguna membutuhkan aplikasi yang dapat:

1. Mengubah dokumen Word menjadi Markdown secara otomatis.
2. Mempertahankan struktur dokumen sebanyak mungkin.
3. Memberikan kontrol penuh atas cara gambar dikonversi.
4. Menghasilkan nama file gambar yang mudah dibaca.
5. Menghubungkan gambar ke Markdown menggunakan relative path yang benar.
6. Mengemas file Markdown dan gambar dalam satu paket.
7. Memberikan preview sebelum hasil disimpan.
8. Menjelaskan bagian dokumen yang tidak dapat dikonversi secara sempurna.
9. Memproses dokumen secara lokal tanpa mengirim data ke server.

---

# 4. Tujuan Produk

## 4.1 Tujuan utama

Membantu pengguna mengonversi file Word menjadi Markdown yang rapi dengan sedikit atau tanpa perbaikan manual.

## 4.2 Tujuan khusus

- Mendukung input `.docx`.
- Mendukung input `.doc` melalui proses konversi lokal.
- Menghasilkan Markdown yang kompatibel dengan GitHub Flavored Markdown.
- Mempertahankan urutan konten dokumen.
- Mendukung tiga mode penanganan gambar.
- Mengekstrak caption atau alt text untuk nama gambar.
- Menghasilkan nama file gambar yang aman.
- Menghasilkan relative path gambar yang portabel.
- Menyediakan preview Markdown.
- Menampilkan laporan hasil konversi.
- Mendukung drag-and-drop.
- Menyimpan seluruh proses secara lokal.

## 4.3 Indikator keberhasilan

Produk dianggap berhasil apabila:

- Dokumen standar dapat dikonversi tanpa crash.
- Minimal 95% struktur teks dasar berhasil dipertahankan.
- Semua gambar berhasil diproses sesuai mode yang dipilih.
- Tidak ada link gambar rusak pada paket hasil konversi.
- Pengguna dapat menyelesaikan konversi maksimal dalam lima langkah utama.
- Hasil konversi dapat dibuka pada Markdown viewer umum.
- Pengguna mendapatkan peringatan untuk elemen yang tidak dapat dikonversi sempurna.

---

# 5. Bukan Tujuan Produk

Pada versi awal, aplikasi tidak ditujukan untuk:

- Mengedit file Word secara penuh.
- Menggantikan Microsoft Word.
- Menyediakan kolaborasi dokumen.
- Menyimpan dokumen di cloud.
- Mengonversi PDF ke Markdown.
- Mengonversi hasil scan menggunakan OCR.
- Menjamin tampilan Markdown identik secara visual dengan Word.
- Mempertahankan layout berbasis koordinat secara pixel-perfect.
- Mempertahankan macro VBA.
- Menjalankan macro yang terdapat di dokumen.
- Menjadi layanan konversi publik berbasis server.
- Mengonversi elemen interaktif Word secara penuh.

---

# 6. Asumsi Produk

PRD ini menggunakan asumsi berikut:

1. Aplikasi dikembangkan sebagai aplikasi desktop.
2. Semua pemrosesan dilakukan secara lokal.
3. File `.docx` menjadi format utama yang didukung.
4. File `.doc` dikonversi terlebih dahulu ke `.docx` menggunakan LibreOffice headless atau mekanisme lokal lain.
5. Markdown default menggunakan GitHub Flavored Markdown.
6. Pengguna dapat memilih lokasi output.
7. Dokumen tidak disimpan oleh aplikasi setelah konversi selesai.
8. Pengguna utama hanya satu orang pada satu perangkat.
9. Aplikasi tidak membutuhkan akun atau login.
10. Telemetri dinonaktifkan secara default.

---

# 7. Persona Pengguna

## 7.1 Pengguna utama

**Nama persona:** Pengguna pribadi

**Karakteristik:**

- Sering menggunakan Microsoft Word.
- Memiliki koleksi catatan, laporan, atau dokumentasi.
- Ingin memindahkan dokumen ke Markdown.
- Tidak ingin memperbaiki hasil konversi secara manual.
- Menginginkan privasi.
- Mungkin tidak memiliki pengetahuan teknis mendalam.

## 7.2 Kebutuhan pengguna

Pengguna ingin:

- Memilih file Word.
- Menentukan cara gambar diproses.
- Melihat hasil sebelum menyimpan.
- Mendapatkan file Markdown yang siap digunakan.
- Mengetahui apabila ada bagian yang tidak berhasil dikonversi.
- Menghasilkan satu paket Markdown beserta gambar.

---

# 8. User Stories

| ID | User story |
|---|---|
| US-001 | Sebagai pengguna, saya ingin memilih file Word agar dapat mengonversinya menjadi Markdown. |
| US-002 | Sebagai pengguna, saya ingin menyeret file ke aplikasi agar proses pemilihan file lebih cepat. |
| US-003 | Sebagai pengguna, saya ingin menghapus semua gambar dari hasil agar ukuran Markdown tetap kecil. |
| US-004 | Sebagai pengguna, saya ingin menyematkan gambar sebagai Base64 agar hanya menghasilkan satu file Markdown. |
| US-005 | Sebagai pengguna, saya ingin menyimpan gambar ke folder terpisah agar Markdown mudah dibaca dan dikelola. |
| US-006 | Sebagai pengguna, saya ingin nama gambar dibuat berdasarkan caption agar file gambar mudah dikenali. |
| US-007 | Sebagai pengguna, saya ingin fallback nama gambar ketika caption tidak tersedia. |
| US-008 | Sebagai pengguna, saya ingin melihat preview hasil sebelum menyimpan. |
| US-009 | Sebagai pengguna, saya ingin mengetahui jumlah gambar, tabel, heading, dan peringatan konversi. |
| US-010 | Sebagai pengguna, saya ingin menyalin hasil Markdown ke clipboard. |
| US-011 | Sebagai pengguna, saya ingin menyimpan hasil ke lokasi tertentu. |
| US-012 | Sebagai pengguna, saya ingin mendapatkan paket ZIP berisi Markdown dan gambar. |
| US-013 | Sebagai pengguna, saya ingin mengonversi beberapa dokumen sekaligus. |
| US-014 | Sebagai pengguna, saya ingin konfigurasi terakhir tetap tersimpan untuk konversi berikutnya. |
| US-015 | Sebagai pengguna, saya ingin semua pemrosesan dilakukan secara lokal untuk menjaga privasi. |

---

# 9. Ruang Lingkup Produk

## 9.1 Ruang lingkup MVP

MVP harus mencakup:

- Input `.docx`.
- Drag-and-drop file.
- Tiga mode penanganan gambar.
- Konversi heading.
- Konversi paragraf.
- Konversi format bold, italic, strikethrough, dan hyperlink.
- Konversi ordered list dan unordered list.
- Konversi tabel standar.
- Ekstraksi gambar.
- Deteksi caption.
- Penamaan gambar otomatis.
- Preview Markdown.
- Pemilihan folder output.
- Ekspor `.md`.
- Ekspor paket `.zip`.
- Laporan konversi.
- Pemrosesan lokal.
- Penyimpanan preferensi pengguna.

## 9.2 Ruang lingkup versi lanjutan

Versi berikutnya dapat mencakup:

- Batch conversion.
- Dukungan `.doc`.
- Dukungan template output.
- YAML front matter.
- Konversi equation ke LaTeX.
- Konversi daftar isi.
- Konversi komentar.
- Penanganan tracked changes.
- Konfigurasi header dan footer.
- Custom rule untuk heading.
- Custom folder gambar.
- Integrasi command-line interface.
- Watch folder otomatis.
- Plugin atau ekstensi.
- Preset untuk GitHub, Obsidian, Hugo, Docusaurus, dan MkDocs.

---

# 10. Mode Penanganan Gambar

## 10.1 Mode A — Tanpa gambar

Pada mode ini:

- Gambar tidak dimasukkan ke file Markdown.
- File gambar tidak diekstrak.
- Caption dapat dihapus atau dipertahankan sebagai teks berdasarkan pengaturan pengguna.
- Aplikasi menampilkan jumlah gambar yang dihapus.

### Contoh hasil

```md
## Diagram Arsitektur

Penjelasan mengenai arsitektur aplikasi.
```

### Pengaturan tambahan

**Pertahankan caption sebagai teks**

Apabila aktif:

```md
*Gambar 1. Diagram Arsitektur Sistem*
```

Apabila tidak aktif, gambar dan caption terkait akan dihapus.

---

## 10.2 Mode B — Gambar sebagai Base64

Pada mode ini:

- Gambar disematkan langsung di file Markdown.
- Tidak ada folder gambar tambahan.
- Setiap gambar menggunakan Data URI.
- MIME type harus sesuai dengan format gambar.
- Caption digunakan sebagai alt text.
- Ukuran file Markdown dapat menjadi sangat besar.

### Contoh hasil

```md
![Diagram Arsitektur](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...)
```

### MIME type yang didukung

| Format | MIME type |
|---|---|
| PNG | `image/png` |
| JPEG | `image/jpeg` |
| GIF | `image/gif` |
| SVG | `image/svg+xml` |
| WebP | `image/webp` |
| BMP | `image/bmp` |
| TIFF | `image/tiff` |

### Peringatan ukuran

Aplikasi harus menampilkan peringatan apabila:

- Total ukuran gambar melebihi 10 MB.
- Satu gambar melebihi 5 MB.
- File Markdown hasil diperkirakan melebihi 25 MB.

Teks peringatan:

> Mode Base64 dapat menghasilkan file Markdown berukuran besar dan tidak didukung oleh semua Markdown viewer.

---

## 10.3 Mode C — Folder gambar terpisah

Pada mode ini:

- Gambar diekstrak sebagai file asli.
- Gambar disimpan di folder khusus.
- Markdown menggunakan relative path.
- Folder Markdown dan gambar menjadi satu paket.
- Pengguna dapat menyimpan paket sebagai folder atau ZIP.

### Struktur default

```text
nama-dokumen/
├── nama-dokumen.md
└── images/
    ├── diagram-arsitektur.png
    ├── alur-proses-login.jpg
    └── tampilan-dashboard.png
```

### Contoh link Markdown

```md
![Diagram Arsitektur](./images/diagram-arsitektur.png)
```

### Pilihan nama folder gambar

Default:

```text
images
```

Pilihan lain:

```text
assets
media
nama-dokumen-assets
```

Pengguna juga dapat memasukkan nama folder sendiri.

---

# 11. Aturan Penamaan Gambar

## 11.1 Prioritas sumber nama

Nama gambar harus ditentukan menggunakan urutan prioritas berikut:

1. Caption Word.
2. Alt text gambar.
3. Title gambar.
4. Nama file media internal.
5. Fallback berdasarkan urutan gambar.

Contoh fallback:

```text
image-001.png
image-002.jpg
image-003.png
```

## 11.2 Deteksi caption

Aplikasi harus mencoba mendeteksi caption dari:

- Fitur Insert Caption Microsoft Word.
- Paragraf tepat di bawah gambar.
- Paragraf tepat di atas gambar.
- Teks dengan style `Caption`.
- Teks dengan pola seperti `Gambar 1`, `Figure 1`, `Fig. 1`, atau `Image 1`.
- Alt text yang tersimpan pada properti gambar.

## 11.3 Normalisasi nama file

Caption:

```text
Gambar 1. Diagram Arsitektur Sistem
```

Nama file:

```text
diagram-arsitektur-sistem.png
```

Aturan normalisasi:

- Mengubah huruf menjadi lowercase.
- Menghapus nomor caption di bagian awal.
- Mengganti spasi dengan tanda hubung.
- Menghapus tanda baca yang tidak aman.
- Menghapus karakter khusus.
- Menghapus tanda hubung berulang.
- Membatasi nama maksimal 100 karakter.
- Mempertahankan ekstensi file asli.
- Menghindari reserved filename pada Windows.

## 11.4 Nama duplikat

Jika dua gambar memiliki caption sama:

```text
diagram-arsitektur.png
diagram-arsitektur-2.png
diagram-arsitektur-3.png
```

## 11.5 Caption kosong

Jika tidak ada caption:

```text
image-001.png
```

Alt text Markdown:

```md
![Image 001](./images/image-001.png)
```

## 11.6 Karakter non-Latin

Pengguna dapat memilih:

- Mempertahankan karakter Unicode.
- Mengubah nama menjadi transliterasi ASCII.
- Menggunakan fallback `image-XXX`.

Default: mempertahankan karakter Unicode yang aman.

---

# 12. Aturan Konversi Dokumen

## 12.1 Heading

| Word | Markdown |
|---|---|
| Title | `#` |
| Heading 1 | `#` |
| Heading 2 | `##` |
| Heading 3 | `###` |
| Heading 4 | `####` |
| Heading 5 | `#####` |
| Heading 6 | `######` |

Heading lebih dari level 6 dikonversi menjadi teks tebal:

```md
**Subbagian Tingkat 7**
```

Aplikasi harus mempertahankan urutan heading dan memperingatkan apabila terdapat lompatan level, misalnya dari Heading 1 langsung ke Heading 4.

---

## 12.2 Format inline

| Format Word | Markdown |
|---|---|
| Bold | `**teks**` |
| Italic | `*teks*` |
| Bold dan italic | `***teks***` |
| Strikethrough | `~~teks~~` |
| Inline code | `` `kode` `` |
| Hyperlink | `[teks](URL)` |
| Superscript | HTML `<sup>` |
| Subscript | HTML `<sub>` |
| Underline | HTML `<u>` atau teks biasa |

Penggunaan HTML dapat dinonaktifkan melalui pengaturan kompatibilitas.

---

## 12.3 Paragraf

- Setiap paragraf dipisahkan oleh satu baris kosong.
- Spasi berulang dinormalisasi.
- Line break manual dikonversi menjadi Markdown line break.
- Paragraf kosong berulang dibatasi maksimal dua baris kosong.
- Indentasi tanpa makna struktural dihapus.

---

## 12.4 Daftar

### Unordered list

```md
- Item pertama
- Item kedua
  - Subitem
```

### Ordered list

```md
1. Item pertama
2. Item kedua
   1. Subitem
```

Aplikasi harus:

- Mempertahankan nesting.
- Mempertahankan urutan.
- Menghindari list yang terputus akibat paragraf kosong.
- Mengenali simbol bullet Word.
- Mengonversi checklist jika dapat dikenali.

Checklist:

```md
- [x] Selesai
- [ ] Belum selesai
```

---

## 12.5 Tabel

Tabel standar dikonversi menjadi GitHub Flavored Markdown:

```md
| Nama | Status |
|---|---|
| Fitur A | Selesai |
| Fitur B | Proses |
```

Aturan:

- Baris pertama digunakan sebagai header apabila style atau formatnya menunjukkan header.
- Jika tidak ada header, aplikasi dapat membuat header kosong.
- Line break dalam cell diganti dengan `<br>`.
- Karakter `|` di-escape menjadi `\|`.
- Tabel dengan merged cell menggunakan fallback HTML.
- Nested table menghasilkan peringatan dan fallback HTML.
- Tabel yang terlalu kompleks dapat dikonversi menjadi HTML table.

---

## 12.6 Kutipan

Paragraf dengan style Quote atau Intense Quote:

```md
> Ini adalah kutipan.
```

Kutipan bertingkat:

```md
> Kutipan utama.
>
>> Kutipan di dalam kutipan.
```

---

## 12.7 Blok kode

Paragraf dianggap sebagai code block apabila:

- Menggunakan style Code.
- Menggunakan font monospace secara konsisten.
- Memiliki shading khusus yang dikenali.
- Pengguna menandainya melalui konfigurasi.

Hasil:

````md
```javascript
function hello() {
  console.log("Hello");
}
```
````

Jika bahasa pemrograman tidak diketahui, fence dibuat tanpa identifier bahasa.

---

## 12.8 Hyperlink

- Hyperlink eksternal dipertahankan.
- Hyperlink internal ke bookmark dipertahankan apabila target dapat dibuat.
- URL yang rusak menghasilkan peringatan.
- Link email dikonversi ke `mailto:`.

---

## 12.9 Catatan kaki

Catatan kaki Word dikonversi ke Markdown footnote:

```md
Kalimat dengan catatan kaki.[^1]

[^1]: Isi catatan kaki.
```

Endnote diperlakukan dengan format serupa.

---

## 12.10 Pemisah halaman

Page break dapat diproses berdasarkan pilihan pengguna:

1. Dihapus.
2. Diubah menjadi horizontal rule.
3. Diubah menjadi komentar HTML.

Default:

```md
---
```

Untuk menghindari konflik dengan YAML front matter, horizontal rule hanya digunakan di bagian isi dokumen.

---

## 12.11 Header dan footer

Default MVP:

- Header diabaikan.
- Footer diabaikan.
- Nomor halaman diabaikan.

Pengaturan lanjutan dapat menyediakan:

- Sertakan header.
- Sertakan footer.
- Sertakan hanya sekali.
- Sertakan di setiap page break.

---

## 12.12 Daftar isi

Daftar isi otomatis Word tidak disalin sebagai teks mentah secara default.

Pilihan:

- Hapus daftar isi.
- Buat ulang sebagai daftar link Markdown.
- Pertahankan sebagai teks.

Default: buat ulang jika struktur heading valid.

---

## 12.13 Equation

Urutan fallback:

1. Konversi Office MathML ke LaTeX.
2. Konversi menjadi MathML atau HTML.
3. Render sebagai gambar.
4. Tampilkan placeholder dan peringatan.

Contoh LaTeX:

```md
$$
E = mc^2
$$
```

Konversi equation penuh dapat ditempatkan pada versi setelah MVP.

---

## 12.14 Shapes, SmartArt, dan chart

Elemen visual nonteks diproses dengan urutan:

1. Gunakan preview gambar yang tersimpan di dokumen.
2. Ekstrak sebagai gambar.
3. Terapkan mode gambar yang dipilih.
4. Jika tidak tersedia, tambahkan placeholder dan peringatan.

Placeholder:

```md
> [Elemen SmartArt tidak dapat dikonversi]
```

---

## 12.15 Komentar dan tracked changes

Default:

- Komentar tidak disertakan.
- Track changes menggunakan versi final dokumen.
- Teks yang dihapus tidak disertakan.
- Teks yang ditambahkan disertakan.

Versi lanjutan dapat menyediakan mode:

- Final.
- Original.
- Tampilkan perubahan.
- Sertakan komentar sebagai footnote.

---

# 13. Kebutuhan Fungsional

## 13.1 Input dokumen

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-001 | Pengguna dapat memilih file melalui file picker. | Must |
| FR-002 | Pengguna dapat drag-and-drop file ke aplikasi. | Must |
| FR-003 | Aplikasi memvalidasi ekstensi dan struktur file. | Must |
| FR-004 | Aplikasi menampilkan nama, ukuran, dan tanggal modifikasi file. | Should |
| FR-005 | Aplikasi dapat membaca `.docx`. | Must |
| FR-006 | Aplikasi dapat membaca `.doc` melalui konversi lokal. | Should |
| FR-007 | Aplikasi menolak file terenkripsi tanpa password. | Must |
| FR-008 | Aplikasi meminta password untuk dokumen yang didukung dan terlindungi. | Could |
| FR-009 | Aplikasi mendeteksi file rusak. | Must |
| FR-010 | Aplikasi dapat membatalkan file yang telah dipilih. | Must |

---

## 13.2 Konfigurasi output

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-011 | Pengguna dapat memilih mode tanpa gambar. | Must |
| FR-012 | Pengguna dapat memilih mode Base64. | Must |
| FR-013 | Pengguna dapat memilih mode folder gambar. | Must |
| FR-014 | Pengguna dapat menentukan nama file Markdown. | Must |
| FR-015 | Pengguna dapat menentukan folder output. | Must |
| FR-016 | Pengguna dapat menentukan nama folder gambar. | Should |
| FR-017 | Pengguna dapat memilih output folder atau ZIP. | Must |
| FR-018 | Pengguna dapat memilih sintaks Markdown. | Should |
| FR-019 | Pengguna dapat mempertahankan caption sebagai teks. | Should |
| FR-020 | Aplikasi menyimpan konfigurasi terakhir. | Should |

---

## 13.3 Proses konversi

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-021 | Aplikasi memproses elemen sesuai urutan dokumen. | Must |
| FR-022 | Aplikasi mengonversi heading. | Must |
| FR-023 | Aplikasi mengonversi paragraf dan inline formatting. | Must |
| FR-024 | Aplikasi mengonversi ordered dan unordered list. | Must |
| FR-025 | Aplikasi mengonversi tabel. | Must |
| FR-026 | Aplikasi mengonversi hyperlink. | Must |
| FR-027 | Aplikasi mengekstrak gambar. | Must |
| FR-028 | Aplikasi mendeteksi caption. | Must |
| FR-029 | Aplikasi membuat nama gambar yang aman. | Must |
| FR-030 | Aplikasi mengubah gambar menjadi Base64. | Must |
| FR-031 | Aplikasi membuat relative path gambar. | Must |
| FR-032 | Aplikasi menangani nama file duplikat. | Must |
| FR-033 | Aplikasi menghasilkan laporan peringatan. | Must |
| FR-034 | Pengguna dapat membatalkan proses konversi. | Should |
| FR-035 | Aplikasi membersihkan temporary file setelah proses selesai. | Must |

---

## 13.4 Preview

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-036 | Aplikasi menampilkan source Markdown. | Must |
| FR-037 | Aplikasi menampilkan rendered preview. | Must |
| FR-038 | Pengguna dapat berpindah antara source dan rendered preview. | Must |
| FR-039 | Pengguna dapat mencari teks pada preview. | Should |
| FR-040 | Pengguna dapat mengedit Markdown sebelum menyimpan. | Should |
| FR-041 | Perubahan manual tidak hilang saat berpindah tab. | Must |
| FR-042 | Pengguna dapat mereset preview ke hasil awal. | Should |

---

## 13.5 Ekspor

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-043 | Pengguna dapat menyimpan file `.md`. | Must |
| FR-044 | Pengguna dapat menyalin Markdown ke clipboard. | Must |
| FR-045 | Pengguna dapat menyimpan folder paket. | Must |
| FR-046 | Pengguna dapat menyimpan paket ZIP. | Must |
| FR-047 | Aplikasi memastikan semua relative path valid. | Must |
| FR-048 | Aplikasi mencegah overwrite tanpa konfirmasi. | Must |
| FR-049 | Pengguna dapat membuka folder hasil. | Should |
| FR-050 | Pengguna dapat membuka file Markdown menggunakan aplikasi default. | Should |

---

## 13.6 Laporan konversi

Setelah konversi, aplikasi menampilkan:

- Status berhasil atau gagal.
- Durasi proses.
- Jumlah heading.
- Jumlah paragraf.
- Jumlah list.
- Jumlah tabel.
- Jumlah hyperlink.
- Jumlah gambar.
- Jumlah gambar yang dihapus.
- Jumlah gambar Base64.
- Jumlah gambar yang diekstrak.
- Jumlah warning.
- Elemen yang menggunakan fallback HTML.
- Elemen yang tidak dapat dikonversi.

Contoh:

```text
Konversi berhasil

Heading              12
Paragraf              84
Daftar                 7
Tabel                   3
Gambar                  9
Gambar diekstrak        9
Peringatan              2
Durasi               1,8 detik
```

---

# 14. Alur Pengguna

## 14.1 Alur utama

1. Pengguna membuka aplikasi.
2. Pengguna memilih atau menyeret file Word.
3. Aplikasi memvalidasi file.
4. Aplikasi menampilkan ringkasan dokumen.
5. Pengguna memilih mode penanganan gambar.
6. Pengguna mengatur opsi konversi.
7. Pengguna menekan tombol **Konversi**.
8. Aplikasi memproses dokumen.
9. Aplikasi menampilkan preview dan laporan.
10. Pengguna menyimpan file atau paket hasil.
11. Aplikasi menampilkan lokasi output.

## 14.2 Alur mode tanpa gambar

1. Pilih **Jangan sertakan gambar**.
2. Tentukan apakah caption dipertahankan.
3. Jalankan konversi.
4. Preview menampilkan Markdown tanpa gambar.
5. Simpan sebagai `.md`.

## 14.3 Alur mode Base64

1. Pilih **Sematkan gambar sebagai Base64**.
2. Aplikasi menghitung estimasi ukuran hasil.
3. Jika ukuran besar, tampilkan warning.
4. Jalankan konversi.
5. Simpan sebagai satu file `.md`.

## 14.4 Alur mode folder gambar

1. Pilih **Simpan gambar ke folder terpisah**.
2. Tentukan nama folder gambar.
3. Pilih hasil sebagai folder atau ZIP.
4. Jalankan konversi.
5. Aplikasi membuat Markdown dan folder gambar.
6. Aplikasi memvalidasi seluruh relative path.
7. Simpan paket.

---

# 15. Desain Antarmuka

## 15.1 Halaman utama

Komponen:

- Area drag-and-drop.
- Tombol **Pilih File Word**.
- Riwayat konversi lokal opsional.
- Tombol pengaturan.
- Informasi bahwa file diproses secara lokal.

Teks utama:

> Seret file Word ke sini atau pilih file dari perangkat.

Teks privasi:

> Dokumen diproses sepenuhnya di perangkat Anda dan tidak diunggah ke server.

---

## 15.2 Panel informasi file

Menampilkan:

- Nama file.
- Jenis file.
- Ukuran.
- Jumlah halaman jika dapat dihitung.
- Jumlah gambar.
- Jumlah tabel.
- Status perlindungan file.
- Tombol ganti file.
- Tombol hapus file.

---

## 15.3 Panel mode gambar

Tiga pilihan berbentuk card atau radio button:

### Tanpa gambar

Deskripsi:

> Gambar tidak dimasukkan ke hasil Markdown.

### Base64

Deskripsi:

> Gambar disematkan langsung sehingga hasil hanya berupa satu file Markdown.

### Folder gambar

Deskripsi:

> Gambar disimpan ke folder terpisah dan dihubungkan menggunakan relative path.

Mode folder gambar menjadi pilihan default karena paling kompatibel dan mudah dikelola.

---

## 15.4 Panel opsi lanjutan

Opsi:

- Format Markdown.
- Nama file output.
- Nama folder gambar.
- Pertahankan caption.
- Gunakan caption sebagai nama file.
- Hapus nomor caption dari nama file.
- Konversi tabel kompleks ke HTML.
- Konversi page break ke horizontal rule.
- Sertakan daftar isi.
- Izinkan HTML.
- Format line ending.
- Encoding.
- Overwrite behavior.

Default:

```text
Markdown dialect: GitHub Flavored Markdown
Encoding: UTF-8
Line ending: Otomatis sesuai sistem operasi
HTML fallback: Aktif
Image directory: images
Gunakan caption sebagai nama gambar: Aktif
```

---

## 15.5 Halaman progress

Menampilkan tahapan:

1. Membaca dokumen.
2. Menganalisis struktur.
3. Mengonversi teks.
4. Memproses tabel.
5. Memproses gambar.
6. Membuat Markdown.
7. Memvalidasi hasil.

Komponen:

- Progress bar.
- Nama tahap aktif.
- Persentase.
- Waktu berjalan.
- Tombol batal.

---

## 15.6 Halaman preview

Layout dua panel:

- Panel kiri: Markdown source.
- Panel kanan: rendered preview.

Toolbar:

- Source only.
- Preview only.
- Split view.
- Search.
- Copy Markdown.
- Save.
- Export ZIP.
- Open output folder.
- Show warnings.

---

# 16. Struktur Paket Output

## 16.1 Paket folder

```text
hasil-konversi/
├── hasil-konversi.md
├── images/
│   ├── diagram-arsitektur.png
│   ├── proses-autentikasi.png
│   └── tampilan-dashboard.jpg
└── conversion-report.json
```

File `conversion-report.json` bersifat opsional.

Contoh:

```json
{
  "sourceFile": "dokumen.docx",
  "outputFile": "hasil-konversi.md",
  "imageMode": "external",
  "imageDirectory": "images",
  "statistics": {
    "headings": 12,
    "paragraphs": 84,
    "tables": 3,
    "images": 9
  },
  "warnings": [
    {
      "code": "COMPLEX_TABLE_HTML_FALLBACK",
      "message": "Tabel ke-2 dikonversi menggunakan HTML."
    }
  ]
}
```

## 16.2 Paket ZIP

```text
hasil-konversi.zip
└── hasil-konversi/
    ├── hasil-konversi.md
    └── images/
        ├── diagram-arsitektur.png
        └── tampilan-dashboard.jpg
```

ZIP tidak boleh menggunakan absolute path.

---

# 17. Validasi Output

Sebelum hasil dinyatakan berhasil, aplikasi harus memeriksa:

- File Markdown berhasil dibuat.
- Encoding file valid.
- Tidak ada null byte.
- Semua gambar yang direferensikan tersedia.
- Semua relative path berada di dalam paket output.
- Tidak ada nama file duplikat.
- Tidak ada karakter nama file yang dilarang.
- Base64 dapat didekode.
- MIME type sesuai dengan data gambar.
- ZIP dapat dibuka.
- Tidak ada temporary file di dalam paket.
- Markdown tidak memiliki tag internal Word yang tersisa.

Apabila validasi gagal, aplikasi tidak boleh menampilkan status selesai tanpa peringatan.

---

# 18. Penanganan Error

| Kode | Kondisi | Respons aplikasi |
|---|---|---|
| ERR-001 | Format file tidak didukung | Tampilkan format yang didukung. |
| ERR-002 | File rusak | Tampilkan bahwa dokumen tidak dapat dibaca. |
| ERR-003 | File terenkripsi | Minta password atau batalkan proses. |
| ERR-004 | Password salah | Tampilkan error dan izinkan mencoba kembali. |
| ERR-005 | Media gambar rusak | Lewati gambar dan tambahkan warning. |
| ERR-006 | Ruang penyimpanan tidak cukup | Batalkan ekspor tanpa merusak file lama. |
| ERR-007 | Tidak memiliki izin menulis | Minta lokasi output lain. |
| ERR-008 | Nama output tidak valid | Normalisasi atau minta nama baru. |
| ERR-009 | File output sedang digunakan | Minta pengguna menutup file atau memilih nama lain. |
| ERR-010 | Konversi `.doc` gagal | Sarankan menyimpan ulang sebagai `.docx`. |
| ERR-011 | Proses dibatalkan | Hapus temporary file. |
| ERR-012 | ZIP gagal dibuat | Pertahankan hasil folder dan tampilkan warning. |

---

# 19. Warning yang Tidak Menghentikan Proses

Contoh warning:

- Caption gambar tidak ditemukan.
- Nama gambar menggunakan fallback.
- Tabel kompleks dikonversi ke HTML.
- Equation dikonversi menjadi gambar.
- SmartArt tidak dapat dikonversi.
- Hyperlink internal kehilangan target.
- Heading melompati level.
- Font khusus tidak dapat dipertahankan.
- Header dan footer diabaikan.
- Ukuran Base64 sangat besar.
- Gambar memiliki format yang jarang didukung.
- Bookmark duplikat diganti namanya.

Warning harus menyertakan:

- Kode warning.
- Penjelasan.
- Lokasi atau urutan elemen.
- Dampak terhadap hasil.
- Saran tindakan jika tersedia.

---

# 20. Kebutuhan Nonfungsional

## 20.1 Performa

Target performa:

| Ukuran dokumen | Target waktu |
|---|---|
| Di bawah 5 MB | Maksimal 3 detik |
| 5–25 MB | Maksimal 10 detik |
| 25–100 MB | Maksimal 45 detik |

Target ini bergantung pada perangkat dan jumlah gambar.

Aplikasi harus:

- Menggunakan streaming jika memungkinkan.
- Menghindari memuat seluruh Base64 berkali-kali.
- Menampilkan progress untuk proses lebih dari satu detik.
- Tidak membuat UI freeze.
- Dapat membatalkan proses.

## 20.2 Kapasitas

MVP harus mendukung:

- File hingga 100 MB.
- Maksimal 500 gambar.
- Maksimal 10.000 paragraf.
- Maksimal 1.000 tabel.
- Output Markdown hingga 500 MB pada mode Base64.

Batas dapat dikonfigurasi pada versi lanjutan.

## 20.3 Keandalan

- Proses gagal tidak boleh merusak file sumber.
- Ekspor menggunakan temporary directory.
- Folder final hanya dibuat setelah validasi berhasil.
- Overwrite harus menggunakan konfirmasi.
- Crash recovery tidak boleh menyimpan dokumen secara permanen.

## 20.4 Privasi

- Tidak ada upload file.
- Tidak ada penyimpanan cloud.
- Tidak ada analisis isi melalui server.
- Tidak ada logging isi dokumen.
- Path file tidak dikirim ke layanan eksternal.
- Telemetri harus opt-in.
- Temporary file dihapus setelah selesai atau gagal.

## 20.5 Keamanan

- Macro tidak dijalankan.
- External relationship tidak diunduh otomatis.
- Remote image tidak diunduh tanpa izin.
- Path traversal harus dicegah.
- XML entity expansion harus dibatasi.
- ZIP bomb protection harus tersedia.
- Ukuran decompressed document harus dibatasi.
- HTML preview harus disanitasi.
- JavaScript dalam HTML tidak boleh dijalankan.
- URL berbahaya harus ditampilkan sebagai warning.

## 20.6 Aksesibilitas

- Seluruh fungsi dapat digunakan dengan keyboard.
- Fokus keyboard terlihat.
- Label form dapat dibaca screen reader.
- Kontras memenuhi WCAG 2.1 AA.
- Status progress tidak hanya disampaikan melalui warna.
- Error ditampilkan dengan teks yang jelas.

## 20.7 Kompatibilitas

Markdown hasil harus diuji pada:

- GitHub.
- Visual Studio Code.
- Obsidian.
- Typora.
- MarkText.
- MkDocs.
- Docusaurus.
- Hugo.

Tidak semua fitur HTML atau Base64 akan bekerja pada seluruh viewer. Aplikasi harus memberikan informasi kompatibilitas.

---

# 21. Arsitektur yang Direkomendasikan

## 21.1 Bentuk aplikasi

Rekomendasi:

- Desktop local-first.
- Backend pemrosesan lokal.
- Frontend ringan.
- Tidak membutuhkan database server.

Pilihan teknologi:

### Opsi A — Tauri

- Frontend: React, Vue, atau Svelte.
- Core: Rust.
- Ukuran aplikasi lebih kecil.
- Akses filesystem yang aman.
- Performa baik.

Rekomendasi utama: **Tauri + React + Rust** atau **Tauri + React + sidecar converter**.

---

## 21.2 Komponen sistem

```text
┌──────────────────────────┐
│       Desktop UI         │
│ File picker, settings,   │
│ preview, report          │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│ Conversion Controller    │
│ Job management, progress │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│ DOCX Parser              │
│ XML, styles, relations   │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│ Document AST             │
│ Heading, paragraph,      │
│ table, image, list       │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│ Markdown Renderer        │
│ GFM, HTML fallback       │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│ Image Processor          │
│ Skip, Base64, external   │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│ Validator and Exporter   │
│ MD, folder, ZIP, report  │
└──────────────────────────┘
```

---

## 21.3 Document AST

Dokumen sebaiknya tidak langsung dikonversi dari XML ke string Markdown. Parser terlebih dahulu membentuk struktur perantara atau AST.

Contoh:

```ts
type DocumentNode =
  | HeadingNode
  | ParagraphNode
  | ListNode
  | TableNode
  | ImageNode
  | QuoteNode
  | CodeBlockNode
  | FootnoteNode
  | PageBreakNode;
```

Contoh image node:

```ts
interface ImageNode {
  id: string;
  sourceRelationshipId: string;
  originalFilename?: string;
  mimeType: string;
  caption?: string;
  altText?: string;
  title?: string;
  width?: number;
  height?: number;
  buffer: Uint8Array;
}
```

Keuntungan AST:

- Lebih mudah diuji.
- Dapat mendukung banyak dialect Markdown.
- Penanganan gambar lebih konsisten.
- Preview dan exporter menggunakan sumber yang sama.
- Mudah menambahkan format output baru.

---

# 22. Pipeline Konversi

## Tahap 1 — Validasi input

- Periksa format.
- Periksa signature file.
- Periksa ukuran.
- Periksa enkripsi.
- Periksa struktur ZIP pada `.docx`.

## Tahap 2 — Ekstraksi

- Buka package `.docx`.
- Baca `document.xml`.
- Baca styles.
- Baca numbering.
- Baca relationships.
- Baca footnotes.
- Baca endnotes.
- Baca media.
- Baca properties gambar.

## Tahap 3 — Parsing

- Bentuk AST.
- Tentukan struktur heading.
- Kelompokkan list.
- Parse tabel.
- Pasangkan gambar dengan caption.
- Tentukan urutan elemen.

## Tahap 4 — Normalisasi

- Bersihkan whitespace.
- Normalisasi style.
- Tentukan fallback.
- Normalisasi nama gambar.
- Tangani duplikat.
- Bangun anchor.

## Tahap 5 — Pemrosesan gambar

Berdasarkan mode:

- Skip.
- Encode Base64.
- Tulis ke folder aset.

## Tahap 6 — Rendering Markdown

- Render elemen berdasarkan urutan.
- Terapkan dialect.
- Escape karakter Markdown.
- Gunakan HTML fallback jika diperlukan.

## Tahap 7 — Preview

- Tampilkan source.
- Render Markdown menggunakan sandbox.
- Sanitasi HTML.

## Tahap 8 — Validasi

- Periksa path.
- Periksa media.
- Periksa syntax umum.
- Periksa paket ZIP.

## Tahap 9 — Ekspor

- Tulis ke temporary directory.
- Jalankan validasi final.
- Pindahkan ke lokasi tujuan.
- Bersihkan temporary directory.

---

# 23. Konfigurasi Konversi

Contoh struktur konfigurasi:

```json
{
  "markdownDialect": "gfm",
  "imageMode": "external",
  "imageDirectory": "images",
  "useCaptionAsFilename": true,
  "preserveCaption": true,
  "removeCaptionNumber": true,
  "filenameCase": "lowercase",
  "filenameSeparator": "-",
  "allowHtml": true,
  "complexTableFallback": "html",
  "pageBreakMode": "horizontal-rule",
  "includeTableOfContents": true,
  "includeHeader": false,
  "includeFooter": false,
  "lineEnding": "auto",
  "encoding": "utf-8",
  "outputMode": "zip",
  "includeConversionReport": false
}
```

---

# 24. Preset Konversi

## 24.1 Preset GitHub

```text
Dialect: GFM
Gambar: Folder terpisah
Folder: images
HTML fallback: Aktif
Equation: LaTeX
```

## 24.2 Preset Obsidian

```text
Dialect: CommonMark dengan ekstensi
Gambar: Folder terpisah
Folder: attachments
Wiki link: Opsional
```

## 24.3 Preset single-file

```text
Dialect: GFM
Gambar: Base64
Output: Satu file .md
```

## 24.4 Preset text-only

```text
Dialect: GFM
Gambar: Dihapus
Caption: Dipertahankan sebagai teks
```

---

# 25. Keputusan Produk Default

Untuk menyederhanakan penggunaan, konfigurasi default adalah:

| Pengaturan | Nilai default |
|---|---|
| Dialect | GitHub Flavored Markdown |
| Mode gambar | Folder gambar terpisah |
| Folder gambar | `images` |
| Nama gambar | Berdasarkan caption |
| Caption tidak tersedia | `image-XXX` |
| Caption dalam Markdown | Dipertahankan sebagai alt text |
| Tabel kompleks | HTML fallback |
| Page break | Horizontal rule |
| Header dan footer | Tidak disertakan |
| Encoding | UTF-8 |
| Output | Paket ZIP |
| Conversion report | Tidak disertakan |
| Telemetri | Nonaktif |

---

# 26. Kriteria Penerimaan

## AC-001 — Konversi dokumen dasar

**Given** pengguna memilih file `.docx` yang valid  
**When** pengguna menjalankan konversi  
**Then** aplikasi menghasilkan file `.md` tanpa error.

## AC-002 — Heading

**Given** dokumen memiliki Heading 1, Heading 2, dan Heading 3  
**When** dikonversi  
**Then** hasil menggunakan `#`, `##`, dan `###` sesuai level.

## AC-003 — Gambar dihapus

**Given** dokumen memiliki gambar  
**And** pengguna memilih mode tanpa gambar  
**When** dikonversi  
**Then** tidak ada Data URI atau file gambar di hasil.

## AC-004 — Base64

**Given** pengguna memilih mode Base64  
**When** dikonversi  
**Then** setiap gambar muncul sebagai Data URI yang dapat didekode.

## AC-005 — Folder gambar

**Given** pengguna memilih mode folder gambar  
**When** dikonversi  
**Then** gambar tersedia di folder gambar dan semua link Markdown valid.

## AC-006 — Nama berdasarkan caption

**Given** gambar memiliki caption `Gambar 1. Diagram Arsitektur`  
**When** diekstrak  
**Then** nama file menjadi `diagram-arsitektur.<ext>`.

## AC-007 — Caption tidak tersedia

**Given** gambar tidak memiliki caption, title, atau alt text  
**When** diekstrak  
**Then** nama file menggunakan pola `image-XXX.<ext>`.

## AC-008 — Caption duplikat

**Given** dua gambar memiliki caption sama  
**When** diekstrak  
**Then** file kedua mendapatkan suffix angka dan tidak menimpa file pertama.

## AC-009 — Paket ZIP

**Given** pengguna memilih output ZIP  
**When** proses selesai  
**Then** ZIP berisi file Markdown dan seluruh aset yang dibutuhkan.

## AC-010 — Preview

**Given** konversi selesai  
**When** halaman preview ditampilkan  
**Then** pengguna dapat melihat source dan rendered Markdown.

## AC-011 — File rusak

**Given** file input rusak  
**When** aplikasi mencoba membacanya  
**Then** aplikasi menampilkan pesan error dan tidak crash.

## AC-012 — Privasi

**Given** pengguna mengonversi dokumen  
**When** proses berlangsung  
**Then** tidak ada isi dokumen yang dikirim melalui jaringan.

## AC-013 — Pembatalan

**Given** konversi sedang berjalan  
**When** pengguna menekan batal  
**Then** proses berhenti dan temporary file dihapus.

## AC-014 — Overwrite

**Given** file output sudah ada  
**When** pengguna mengekspor hasil  
**Then** aplikasi meminta konfirmasi sebelum menimpa file.

## AC-015 — Relative path

**Given** hasil dipindahkan ke lokasi lain sebagai satu folder  
**When** Markdown dibuka  
**Then** gambar tetap dapat dimuat melalui relative path.

---

# 27. Skenario Pengujian Utama

## Dokumen teks

- Dokumen satu paragraf.
- Dokumen dengan banyak heading.
- Bold dan italic bertumpuk.
- Karakter khusus Markdown.
- Emoji dan Unicode.
- Bahasa Indonesia dan bahasa lain.

## Daftar

- Bullet sederhana.
- Ordered list.
- Nested list.
- List setelah paragraf.
- List dengan gambar.
- Checklist.

## Tabel

- Tabel sederhana.
- Tabel tanpa header.
- Tabel dengan line break.
- Tabel dengan merged cell.
- Nested table.
- Tabel dengan gambar.

## Gambar

- PNG.
- JPEG.
- GIF.
- SVG.
- BMP.
- TIFF.
- Gambar tanpa caption.
- Caption duplikat.
- Caption dengan karakter khusus.
- Caption sangat panjang.
- Gambar inline.
- Gambar floating.
- Gambar di dalam tabel.
- Gambar dengan hyperlink.
- Gambar rusak.

## Dokumen khusus

- Footnote.
- Endnote.
- Quote.
- Code block.
- Equation.
- SmartArt.
- Chart.
- Bookmark.
- Hyperlink internal.
- Header dan footer.
- Page break.
- Section break.
- Track changes.
- Comment.

## File dan sistem

- File kosong.
- File rusak.
- File terenkripsi.
- File sangat besar.
- Ruang penyimpanan habis.
- Folder output read-only.
- Nama file Unicode.
- Path sangat panjang.
- Output sudah tersedia.
- Konversi dibatalkan.

---

# 28. Metrik Produk

Karena aplikasi digunakan secara pribadi dan local-first, metrik dapat disimpan hanya di perangkat pengguna.

Metrik opsional:

- Jumlah konversi.
- Persentase konversi berhasil.
- Durasi rata-rata.
- Mode gambar yang paling sering digunakan.
- Jumlah warning per dokumen.
- Jumlah dokumen yang membutuhkan edit manual.
- Jumlah crash.
- Ukuran rata-rata input dan output.

Tidak boleh menyimpan:

- Isi dokumen.
- Caption.
- Nama file lengkap.
- Path file.
- Data gambar.
- Teks hasil konversi.

---

# 29. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Struktur Word sangat kompleks | Hasil tidak sempurna | Gunakan AST, HTML fallback, dan warning. |
| Caption sulit dipasangkan dengan gambar | Nama file tidak sesuai | Gunakan beberapa sumber nama dan fallback. |
| Base64 menghasilkan file sangat besar | Aplikasi lambat | Tampilkan estimasi dan warning ukuran. |
| Viewer tidak mendukung Base64 | Gambar tidak tampil | Berikan informasi kompatibilitas. |
| Tabel kompleks tidak cocok dengan GFM | Struktur hilang | Gunakan HTML table fallback. |
| `.doc` membutuhkan dependency tambahan | Konversi gagal | Jadikan fitur opsional dan sarankan `.docx`. |
| Gambar floating memiliki urutan ambigu | Posisi gambar berubah | Gunakan anchor position dan tampilkan warning. |
| Nama file caption tidak aman | Gagal disimpan | Normalisasi dan sanitasi. |
| Dokumen berbahaya | Risiko keamanan | Jangan jalankan macro, batasi ZIP/XML, sanitasi HTML. |
| Preview dan output berbeda | Kepercayaan menurun | Gunakan renderer yang bersumber dari Markdown final. |

---

# 30. Tahapan Pengembangan

## Fase 1 — Fondasi

- Setup aplikasi desktop.
- File picker dan drag-and-drop.
- Parser `.docx`.
- Document AST.
- Konversi paragraf dan heading.
- Ekspor Markdown dasar.

## Fase 2 — Struktur dokumen

- Inline formatting.
- Ordered dan unordered list.
- Hyperlink.
- Quote.
- Tabel.
- Page break.

## Fase 3 — Gambar

- Ekstraksi gambar.
- Mode tanpa gambar.
- Mode Base64.
- Mode folder gambar.
- Deteksi caption.
- Penamaan dan deduplikasi.
- Validasi relative path.

## Fase 4 — Preview dan ekspor

- Markdown source editor.
- Rendered preview.
- Copy clipboard.
- Export folder.
- Export ZIP.
- Conversion report.

## Fase 5 — Stabilitas

- Error handling.
- Progress dan cancellation.
- Security hardening.
- Pengujian dokumen besar.
- Cross-platform testing.
- Packaging dan installer.

## Fase 6 — Fitur lanjutan

- Dukungan `.doc`.
- Batch conversion.
- Preset.
- YAML front matter.
- Equation.
- CLI.
- Watch folder.

---

# 31. Prioritas MoSCoW

## Must Have

- Input `.docx`.
- Heading dan paragraf.
- Format inline.
- List.
- Tabel standar.
- Tiga mode gambar.
- Caption sebagai nama file.
- Relative path.
- Preview.
- Ekspor `.md`.
- Ekspor folder dan ZIP.
- Error dan warning.
- Local-only processing.

## Should Have

- Footnote.
- HTML fallback.
- Konfigurasi nama folder.
- Copy clipboard.
- Pengeditan preview.
- Penyimpanan preferensi.
- Dukungan `.doc`.
- Conversion report.

## Could Have

- Batch conversion.
- CLI.
- Preset Obsidian dan GitHub.
- YAML front matter.
- Equation ke LaTeX.
- Watch folder.
- Custom conversion rule.

## Won’t Have pada MVP

- Cloud sync.
- Kolaborasi.
- OCR.
- PDF conversion.
- Mobile application.
- Word editor lengkap.
- Macro execution.

---

# 32. Definition of Done

Sebuah fitur dianggap selesai apabila:

1. Implementasi sesuai kebutuhan fungsional.
2. Unit test tersedia.
3. Integration test tersedia untuk pipeline terkait.
4. Error state telah ditangani.
5. UI dapat digunakan dengan keyboard.
6. Tidak ada data dokumen yang dikirim melalui jaringan.
7. Dokumentasi pengguna diperbarui.
8. Pengujian dilakukan pada dokumen Word nyata.
9. Tidak ada temporary file yang tertinggal.
10. Acceptance criteria terkait telah lulus.
11. Hasil berjalan pada sistem operasi target.
12. Tidak ada bug severity critical atau high.

Produk MVP dianggap selesai apabila seluruh kebutuhan kategori Must Have telah terpenuhi dan skenario pengujian utama lulus.

---

# 33. Contoh Hasil Akhir

## Input Word

```text
Heading 1: Arsitektur Sistem

Sistem terdiri dari frontend dan backend.

[Gambar]
Gambar 1. Diagram Arsitektur Sistem
```

## Mode tanpa gambar

```md
# Arsitektur Sistem

Sistem terdiri dari frontend dan backend.
```

## Mode Base64

```md
# Arsitektur Sistem

Sistem terdiri dari frontend dan backend.

![Diagram Arsitektur Sistem](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...)
```

## Mode folder gambar

```md
# Arsitektur Sistem

Sistem terdiri dari frontend dan backend.

![Diagram Arsitektur Sistem](./images/diagram-arsitektur-sistem.png)
```

Struktur paket:

```text
arsitektur-sistem/
├── arsitektur-sistem.md
└── images/
    └── diagram-arsitektur-sistem.png
```

---

# 34. Ringkasan Keputusan Utama

Docx2Markdown akan menjadi aplikasi desktop local-first untuk mengonversi dokumen Word menjadi Markdown. Produk menggunakan GitHub Flavored Markdown sebagai format default dan menyediakan tiga pilihan penanganan gambar:

1. Menghapus gambar.
2. Menyematkan gambar sebagai Base64.
3. Mengekstrak gambar ke folder dan menghubungkannya melalui relative path.

Mode folder gambar menjadi mode default. Nama file gambar diambil dari caption, alt text, title, atau fallback berurutan. Hasil dapat disimpan sebagai file Markdown tunggal, folder paket, atau ZIP. Aplikasi menyediakan preview, laporan konversi, validasi output, serta warning untuk elemen yang tidak dapat dikonversi secara sempurna.