# Buat CV Kuy — Harvard Business School (OCS) LaTeX Resume Builder

Aplikasi web pembuat CV berstandar **Harvard Business School / Office of Career Services (OCS)** dengan kompilasi **PDF LaTeX Native di server (`Tectonic` / `pdflatex`)**. Seluruh dokumen PDF yang dihasilkan adalah dokumen vektor TeX murni yang teksnya dapat diseleksi penuh (*selectable & searchable*) serta 100% ramah sistem *Applicant Tracking System* (ATS).

---

## Arsitektur & Struktur Folder

```text
/
├── bin/
│   └── tectonic                    # Binary statis Tectonic LaTeX engine
├── public/
│   ├── favicon.svg                 # Ikon aplikasi
│   └── manifest.webmanifest        # Manifest PWA
├── src/
│   ├── __tests__/
│   │   └── latex.test.ts           # Unit & integration test (Vitest) untuk escaping, builder, scoring, & Tectonic
│   ├── components/
│   │   ├── editor/
│   │   │   ├── BulletListEditor.tsx      # Drag & drop bullet + indikator kata kerja aksi & metrik Harvard
│   │   │   ├── HarvardSettingsPanel.tsx  # Pengaturan kertas/font/margin LaTeX & urutan section
│   │   │   └── SectionForms.tsx          # Form 11 section CV lengkap
│   │   ├── layout/
│   │   │   └── AppShell.tsx              # Collapsible sidebar + topbar
│   │   ├── pdf/
│   │   │   └── NativePdfPreview.tsx      # Live viewer PDF LaTeX asli + inspektor sumber .tex
│   │   └── ui/
│   │       └── primitives.tsx            # Komponen UI berbasis Radix + ErrorBoundary
│   ├── i18n/
│   │   └── config.ts               # Konfigurasi dwibahasa (Indonesia & Inggris)
│   ├── pages/
│   │   ├── DashboardPage.tsx       # Statistik, daftar CV, filter, tips karir Harvard
│   │   ├── EditorPage.tsx          # Split-pane editor & live preview PDF LaTeX
│   │   ├── LandingPage.tsx         # Halaman muka
│   │   ├── NotFoundPage.tsx        # Halaman 404
│   │   ├── SettingsPage.tsx        # Pengaturan bahasa, tema, default CV, & diagnostik engine TeX
│   │   └── TemplatesPage.tsx       # Galeri 3 preset Harvard OCS (Classic, Compact, Academic)
│   ├── server/
│   │   ├── compiler.ts             # Eksekutor child_process.spawn Tectonic/pdflatex + LRU Cache + p-queue
│   │   ├── latexBuilder.ts         # Generator dokumen .tex Harvard OCS
│   │   └── latexEscape.ts          # Sanitasi & escaping ketat 10 karakter spesial LaTeX + anti-injeksi
│   ├── shared/
│   │   ├── schema.ts               # Skema validasi Zod bersama (Frontend & Backend)
│   │   ├── scoring.ts              # Kalkulator skor kelengkapan CV & analisis kualitas bullet
│   │   └── templates.ts            # Preset & data contoh realistis (ID & EN)
│   └── store/
│       └── useCVStore.ts           # Zustand state + Undo/Redo + Autosave localStorage (debounce 800ms)
├── Dockerfile                      # Kontainer siap produksi dengan Tectonic & TeX Live
├── docker-compose.yml              # Konfigurasi orkestrasi Docker
└── server.ts                       # Server Express + Vite + endpoint /api/compile, /api/compile/tex, /api/health
```

---

## Fitur Utama

1. **Kompilasi PDF LaTeX Native di Server**: Menggunakan `Tectonic` (`--untrusted`) dengan fallback otomatis ke `pdflatex`/`xelatex` (`-no-shell-escape`). Tanpa konversi HTML/kanvas.
2. **Keamanan Berlapis**:
   - Seluruh input di-escape melalui `escapeLatex()` (`\ { } $ & # ^ _ % ~`).
   - Penolakan eksplisit terhadap makro berbahaya (`\write18`, `\input`, `\include`, `\openout`, `\catcode`).
   - Direktori kerja sementara unik (`fs.mkdtemp`) yang dihapus otomatis seusai kompilasi, batas waktu 20 detik, batas ukuran payload 512KB, `helmet`, `cors`, dan `express-rate-limit`.
3. **11 Section CV Lengkap + Drag & Drop**:
   - Informasi Pribadi, Ringkasan, Pendidikan, Pengalaman Kerja, Kepemimpinan & Organisasi, Proyek, Penghargaan & Beasiswa, Sertifikasi, Publikasi, Keahlian & Minat, serta Section Kustom.
4. **Analisis Kualitas Bullet Harvard OCS**: Memberikan umpan balik langsung apabila poin pencapaian belum diawali kata kerja aksi atau belum mencantumkan angka/metrik dampak.

---

## Menjalankan Secara Lokal

```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan server pengembangan (Express + Vite di port 3000)
npm run dev

# 3. Jalankan pengujian unit & integrasi kompilasi PDF LaTeX
npm test

# 4. Periksa tipe TypeScript & build produksi
npm run lint
npm run build
```

## Menjalankan dengan Docker

```bash
docker compose up --build -d
```
Aplikasi akan berjalan pada `http://localhost:3000`.
