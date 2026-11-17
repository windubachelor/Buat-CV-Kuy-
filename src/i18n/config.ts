import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  id: {
    translation: {
      nav: {
        dashboard: 'Dashboard',
        templates: 'Template & Contoh',
        settings: 'Pengaturan',
        newCv: 'Buat CV Baru',
        startNow: 'Mulai Buat CV',
      },
      landing: {
        kicker: 'Standar Harvard Business School (OCS) · Kompilasi LaTeX Asli',
        heroTitle: 'Bangun CV Gaya Harvard dengan Presisi Tipografi LaTeX Asli.',
        heroDesc:
          'Tanpa konversi HTML ke gambar. Setiap CV dikompilasi langsung di server menggunakan mesin TeX (Tectonic) menjadi dokumen PDF vektor yang bersih, teks dapat diseleksi penuh, dan 100% lolos sistem ATS.',
        ctaPrimary: 'Mulai Buat CV Sekarang',
        ctaSecondary: 'Lihat Template Harvard',
        feature1Title: 'Standar Harvard OCS',
        feature1Desc:
          'Struktur satu kolom bebas distraksi dengan small-caps section header, hirarki dua baris presisi, dan penekanan pada metrik pencapaian.',
        feature2Title: 'Kompilasi LaTeX Native',
        feature2Desc:
          'Menggunakan mesin Tectonic TeX di server dengan font TeX Gyre Termes, Libertinus, dan EB Garamond—bukan hasil tangkapan layar HTML.',
        feature3Title: '100% Lolos Sensor ATS',
        feature3Desc:
          'Metadata Unicode PDF aktif (\\pdfgentounicode), urutan baca linier, tanpa tabel bersarang atau grafik yang membingungkan parser rekruter.',
      },
      dashboard: {
        title: 'Ruang Kerja CV Anda',
        subtitle: 'Kelola seluruh versi CV Harvard Anda, pantau skor kelengkapan, dan unduh PDF LaTeX kapan saja.',
        statTotal: 'Total Dokumen CV',
        statLastEdited: 'Terakhir Diedit',
        statExports: 'Total Ekspor PDF',
        statAvgScore: 'Skor Kelengkapan Rata-rata',
        createBlank: 'CV Kosong Baru',
        createSampleId: 'Contoh Harvard (ID)',
        createSampleEn: 'Contoh Harvard (EN)',
        importJson: 'Impor JSON',
        searchPlaceholder: 'Cari judul CV, nama, atau posisi...',
        sortUpdated: 'Terbaru Diedit',
        sortScore: 'Skor Tertinggi',
        sortTitle: 'Nama (A-Z)',
        openEditor: 'Buka Editor',
        duplicate: 'Duplikat',
        rename: 'Ganti Nama',
        delete: 'Hapus CV',
        downloadPdf: 'Unduh PDF',
        exportJson: 'Ekspor JSON',
        emptyTitle: 'Belum ada dokumen CV',
        emptyDesc: 'Mulai dari kerangka kosong atau gunakan contoh data Harvard yang sudah terisi lengkap.',
        careerTipsTitle: 'Panduan Singkat Resume Harvard OCS',
        tip1: 'Awali setiap poin pengalaman dengan Kata Kerja Aksi kuat (mis. "Merancang", "Meningkatkan", "Memimpin").',
        tip2: 'Sertakan angka terukur (%, Rp/$, waktu, skala pengguna) untuk membuktikan dampak nyata kerja Anda.',
        tip3: 'Pertahankan panjang 1 halaman penuh untuk pengalaman di bawah 8 tahun agar cepat dipindai dalam 6 detik.',
      },
      editor: {
        saved: 'Tersimpan otomatis',
        saving: 'Menyimpan...',
        compiling: 'Mengompilasi LaTeX...',
        compileNow: 'Kompilasi Ulang',
        autoFitOnePage: 'Auto-Fit 1 Halaman',
        downloadPdf: 'Unduh PDF',
        downloadTex: 'Unduh .tex',
        exportJson: 'Ekspor JSON',
        shareJson: 'Salin JSON',
        shortcuts: 'Pintasan Keyboard',
        pageCountWarning: 'Melebihi 1 Halaman (Target Harvard OCS: 1 Halaman)',
        pageCountOk: 'Ideal: 1 Halaman Harvard OCS',
        tabEdit: 'Form Editor',
        tabPreview: 'Pratinjau PDF Asli',
      },
    },
  },
  en: {
    translation: {
      nav: {
        dashboard: 'Dashboard',
        templates: 'Templates & Samples',
        settings: 'Settings',
        newCv: 'Create New CV',
        startNow: 'Build Your CV',
      },
      landing: {
        kicker: 'Harvard Business School (OCS) Standard · Native LaTeX Compilation',
        heroTitle: 'Craft Harvard-Standard Resumes with Native LaTeX Typesetting.',
        heroDesc:
          'Zero HTML-to-canvas hacks. Every resume is compiled server-side via Tectonic TeX into a crisp, selectable, 100% ATS-compliant vector PDF.',
        ctaPrimary: 'Start Building Your CV',
        ctaSecondary: 'Explore Harvard Templates',
        feature1Title: 'Harvard OCS Format',
        feature1Desc:
          'Single-column distraction-free hierarchy with small-caps headers, two-line institutional blocks, and impact-first bullet lists.',
        feature2Title: 'Real Server-Side LaTeX',
        feature2Desc:
          'Powered by Tectonic TeX engine with authentic TeX Gyre Termes, Libertinus, and EB Garamond book typography.',
        feature3Title: '100% ATS Parseable',
        feature3Desc:
          'Embedded Unicode glyph mapping (\\pdfgentounicode), linear reading stream, and zero layout tables that break enterprise parsers.',
      },
      dashboard: {
        title: 'Your Resume Workspace',
        subtitle: 'Manage your tailored Harvard resumes, track completeness scores, and compile native LaTeX PDFs.',
        statTotal: 'Total Resumes',
        statLastEdited: 'Last Edited',
        statExports: 'Total PDF Exports',
        statAvgScore: 'Avg. Completeness Score',
        createBlank: 'New Blank CV',
        createSampleId: 'Harvard Sample (ID)',
        createSampleEn: 'Harvard Sample (EN)',
        importJson: 'Import JSON',
        searchPlaceholder: 'Search resume title, name, or role...',
        sortUpdated: 'Recently Edited',
        sortScore: 'Highest Score',
        sortTitle: 'Title (A-Z)',
        openEditor: 'Open Editor',
        duplicate: 'Duplicate',
        rename: 'Rename',
        delete: 'Delete CV',
        downloadPdf: 'Download PDF',
        exportJson: 'Export JSON',
        emptyTitle: 'No resumes found',
        emptyDesc: 'Start with a clean slate or load a pre-populated Harvard Business School sample.',
        careerTipsTitle: 'Harvard OCS Resume Principles',
        tip1: 'Begin every bullet point with a past-tense Action Verb (e.g., "Spearheaded", "Engineered", "Reduced").',
        tip2: 'Quantify your impact with concrete metrics (%, revenue, latency, headcount) rather(',
        tip3: 'Keep your resume strictly to 1 page unless applying for academic or senior executive roles.',
      },
      editor: {
        saved: 'Autosaved',
        saving: 'Saving...',
        compiling: 'Compiling LaTeX...',
        compileNow: 'Recompile PDF',
        autoFitOnePage: 'Auto-Fit 1 Page',
        downloadPdf: 'Download PDF',
        downloadTex: 'Download .tex',
        exportJson: 'Export JSON',
        shareJson: 'Copy JSON',
        shortcuts: 'Keyboard Shortcuts',
        pageCountWarning: 'Exceeds 1 Page (Harvard OCS Target: 1 Page)',
        pageCountOk: 'Optimal: 1 Page Harvard OCS',
        tabEdit: 'Editor Form',
        tabPreview: 'Native PDF Preview',
      },
    },
  },
};

const savedLang =
  typeof window !== 'undefined'
    ? localStorage.getItem('buatcvkuy_ui_lang') || 'id'
    : 'id';

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: 'id',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
