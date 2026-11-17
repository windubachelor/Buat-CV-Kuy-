import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Code2,
  Cpu,
  Download,
  FileCheck2,
  FileCode2,
  FileText,
  Globe,
  Layers,
  Moon,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
} from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
} from '../components/ui/primitives';
import { useCVStore } from '../store/useCVStore';

const MARQUEE_ITEMS = [
  'Harvard Business School (OCS) Layout',
  'Native Tectonic LaTeX Engine',
  'Harvard Cover Letter Builder + 2-Page Package',
  'Bidirectional Click-to-Sync (PDF ↔ Form)',
  'Smart Space Optimizer (One-Page Guard)',
  '100% ATS Parseable Unicode PDF',
  'TeX Gyre Termes · Libertinus · EB Garamond',
  'Export .PDF & .TEX Source Code',
];

const FAQ_ITEMS = [
  {
    q: 'Apa perbedaan Buat CV Kuy dengan pembuat CV biasa yang memakai HTML-ke-PDF?',
    a: 'Pembuat CV web biasa mengubah tampilan HTML menjadi gambar atau cetakan browser (jsPDF / html2canvas), yang sering merusak spasi kata dan gagal dibaca mesin ATS. Buat CV Kuy mengompilasi kode sumber LaTeX (.tex) asli di server menggunakan mesin Tectonic TeX menjadi PDF vektor berstandar publikasi buku.',
  },
  {
    q: 'Mengapa format Harvard Business School (OCS) sangat direkomendasikan rekruter?',
    a: 'Format Harvard OCS dirancang satu kolom, hitam-putih, tanpa foto atau grafik batang subjektif. Struktur ini menempatkan nama institusi, posisi, tanggal, dan metrik pencapaian pada posisi konsisten sehingga rekruter dapat memindai kualifikasi inti Anda dalam 6 detik.',
  },
  {
    q: 'Apakah teks di dalam PDF hasil unduhan dapat diseleksi dan dicari (Ctrl+F)?',
    a: 'Ya, 100%. Dokumen PDF dilengkapi pemetaan karakter Unicode (\\pdfgentounicode=1) dan font Type-1/OpenType asli (TeX Gyre Termes, Libertinus, EB Garamond), sehingga seluruh teks dapat disalin dan dipindai oleh sistem ATS perusahaan multinasional.',
  },
  {
    q: 'Bagaimana jika isi CV saya melebihi 1 halaman?',
    a: 'Editor Buat CV Kuy mendeteksi jumlah halaman PDF secara otomatis. Jika lebih dari 1 halaman, tersedia tombol "Auto-Fit 1 Halaman" yang menyesuaikan margin, ukuran font (10pt), dan jarak antar-seksi secara proporsional.',
  },
  {
    q: 'Apakah saya juga bisa mengunduh file kode sumber .tex untuk Overleaf?',
    a: 'Tentu! Di panel pratinjau editor, Anda dapat melihat kode sumber LaTeX secara langsung dan mengunduh file .tex murni kapan saja.',
  },
];

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { prefs, updatePrefs } = useCVStore();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden">
      {/* Ambient Background Pastel Mesh Blobs */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[620px] h-[620px] rounded-full bg-[#B8A9F5]/22 dark:bg-[#B8A9F5]/10 blur-[130px]" />
        <div className="absolute top-1/3 -right-24 w-[540px] h-[540px] rounded-full bg-[#BDE0FE]/25 dark:bg-[#BDE0FE]/10 blur-[130px]" />
      </div>

      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 md:px-12 py-4 border-b border-[var(--border)] bg-[var(--surface)]/85 backdrop-blur-md sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <Link
          to="/"
          className="text-lg font-bold font-heading tracking-tight text-[var(--foreground)] whitespace-nowrap shrink-0"
        >
          Buat CV Kuy
        </Link>

        {/* Zone 2: 4–5 Single-Line Text Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--muted-foreground)]">
          <Link
            to="/dashboard"
            className="hover:text-[var(--foreground)] transition-colors whitespace-nowrap shrink-0"
          >
            {t('nav.dashboard')}
          </Link>
          <Link
            to="/templates"
            className="hover:text-[var(--foreground)] transition-colors whitespace-nowrap shrink-0"
          >
            {t('nav.templates')}
          </Link>
          <a
            href="#cara-kerja"
            className="hover:text-[var(--foreground)] transition-colors whitespace-nowrap shrink-0"
          >
            Cara Kerja
          </a>
          <a
            href="#arsitektur-latex"
            className="hover:text-[var(--foreground)] transition-colors whitespace-nowrap shrink-0"
          >
            Mesin LaTeX
          </a>
          <a
            href="#faq"
            className="hover:text-[var(--foreground)] transition-colors whitespace-nowrap shrink-0"
          >
            FAQ
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="gradient" size="sm" onClick={() => navigate('/dashboard')}>
            <span>{t('nav.startNow')}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
          </Button>
        </div>
      </header>

      <main className="flex-1 z-10">
        {/* HERO SECTION */}
        <section className="max-w-[1280px] mx-auto px-6 md:px-12 pt-10 pb-16 md:py-20">
          {/* Utility Strip Below Topbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--muted-foreground)]">
              <span>Standar Harvard Business School (OCS)</span>
              <span aria-hidden="true">·</span>
              <span>Kompilasi Server Tectonic TeX</span>
              <span aria-hidden="true">·</span>
              <span>100% Lolos ATS</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  updatePrefs({ uiLanguage: prefs.uiLanguage === 'id' ? 'en' : 'id' })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold border border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#9B86EC]" strokeWidth={2.5} />
                <span>{prefs.uiLanguage === 'id' ? 'Bahasa: ID' : 'Lang: EN'}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  updatePrefs({ theme: prefs.theme === 'dark' ? 'light' : 'dark' })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold border border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
              >
                {prefs.theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-[#FFF1B8]" strokeWidth={2.5} />
                    <span>Terang</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[#2A2150]" strokeWidth={2.5} />
                    <span>Gelap</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Pitch */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7 space-y-6"
            >
              <Badge variant="lavender" className="px-3 py-1 text-xs">
                <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span>{t('landing.kicker')}</span>
              </Badge>

              <h1
                className="text-display text-[var(--foreground)]"
                style={{ textWrap: 'balance' }}
              >
                {t('landing.heroTitle')}
              </h1>

              <p className="text-base sm:text-lg text-[var(--muted-foreground)] leading-relaxed max-w-2xl">
                {t('landing.heroDesc')}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button variant="gradient" size="lg" onClick={() => navigate('/dashboard')}>
                  <FileText className="w-5 h-5" strokeWidth={2.5} />
                  <span>{t('landing.ctaPrimary')}</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/templates')}>
                  <BookOpen className="w-5 h-5" strokeWidth={2.5} />
                  <span>{t('landing.ctaSecondary')}</span>
                </Button>
              </div>

              {/* Statistical Proof Strip */}
              <div className="pt-6 grid grid-cols-3 gap-6 border-t border-[var(--border)]">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold font-heading tabular-nums text-[var(--foreground)]">
                    100% Native
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    Kompilasi LaTeX Server
                  </p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold font-heading tabular-nums text-[var(--foreground)]">
                    &lt; 400ms
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    Kecepatan Pratinjau Cache
                  </p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold font-heading tabular-nums text-[var(--foreground)]">
                    3 Preset
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    Classic · Compact · Academic
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Floating Parallax Harvard Resume Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 relative"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="rounded-[24px] bg-hero-gradient p-3 sm:p-4 border border-[var(--border-strong)] shadow-[var(--shadow-5)]"
              >
                <div className="rounded-[16px] bg-white text-[#111111] border border-neutral-200 p-6 sm:p-7 shadow-sm font-serif space-y-3.5">
                  <div className="text-center pb-2">
                    <h2 className="text-lg font-bold tracking-wider uppercase">
                      Clarissa Nadine Wijaya
                    </h2>
                    <p className="text-[11px] italic text-neutral-700">
                      Senior Product Manager — Fintech & AI Growth
                    </p>
                    <p className="text-[10px] text-neutral-600 mt-1">
                      Boston, MA / Singapore · cwijaya@mba2025.hbs.edu · +1 (617) 555-0194
                    </p>
                  </div>

                  {/* Education */}
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                      Education
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span>Harvard Business School</span>
                      <span className="italic font-normal">Boston, MA</span>
                    </div>
                    <div className="flex justify-between text-[10.5px] italic mb-1">
                      <span>Master of Business Administration (MBA)</span>
                      <span className="not-italic">Aug 2023 -- May 2025</span>
                    </div>
                    <p className="text-[10px] text-neutral-800">
                      • GPA: <strong>Baker Scholar Distinction (Top 5%)</strong> · Fulbright Presidential Fellow
                    </p>
                  </div>

                  {/* Experience */}
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                      Experience
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span>Stripe</span>
                      <span className="italic font-normal">Singapore</span>
                    </div>
                    <div className="flex justify-between text-[10.5px] italic mb-1">
                      <span>Senior Product Manager — APAC Local Payment Methods</span>
                      <span className="not-italic">Feb 2021 -- Jul 2023</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-[10px] leading-snug text-neutral-800">
                      <li>
                        Spearheaded end-to-end launch of real-time QR payment integrations across 5 SEA markets, driving <strong>$420M in net-new annualized TPV</strong> within 12 months.
                      </li>
                      <li>
                        Redesigned merchant onboarding flow using ML document extraction, reducing activation turnaround from <strong>5.2 days to 18 minutes (+64% conversion)</strong>.
                      </li>
                    </ul>
                  </div>

                  {/* Bottom Verification Bar */}
                  <div className="pt-3 border-t border-neutral-200 flex items-center justify-between text-[10.5px] font-sans text-neutral-600">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Dikompilasi Tectonic 0.15.0
                    </span>
                    <span className="font-heading font-bold">1 / 1 Halaman · ATS Safe</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* MARQUEE STRIP */}
        <div className="border-y border-[var(--border)] bg-[var(--surface)]/75 py-3.5 overflow-hidden">
          <div className="animate-marquee flex items-center gap-10 text-xs font-semibold text-[var(--muted-foreground)]">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
              <div key={idx} className="inline-flex items-center gap-3 whitespace-nowrap">
                <Award className="w-3.5 h-3.5 text-[#9B86EC]" strokeWidth={2.5} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* "CARA KERJA" (3-STEP WORKFLOW) */}
        <section id="cara-kerja" className="py-20 max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <Badge variant="mint">Alur Kerja Cepat</Badge>
            <h2 className="text-h1 text-[var(--foreground)]">
              Dari Pengisian Terstruktur ke PDF LaTeX dalam 3 Langkah
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Anda tidak perlu menghafal sintaks makro LaTeX. Fokus pada pencapaian karir Anda, dan mesin kami yang merender tipografinya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 surface-card surface-card-hover space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-[16px] bg-[#B8A9F5]/30 text-[#2A2150] dark:text-[#DFD7FC] flex items-center justify-center">
                  <Layers className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <span className="text-2xl font-bold font-heading text-[var(--muted-foreground)]/40">
                  01
                </span>
              </div>
              <h3 className="text-h3">1. Pilih Preset Harvard & Isi Data</h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Mulai dari contoh CV Harvard Bahasa Indonesia/Inggris atau kerangka kosong. Susun 11 bagian lengkap dengan drag & drop.
              </p>
            </div>

            <div className="p-6 surface-card surface-card-hover space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-[16px] bg-[#BFEBD7]/55 text-[#133A29] flex items-center justify-center">
                  <SlidersHorizontal className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <span className="text-2xl font-bold font-heading text-[var(--muted-foreground)]/40">
                  02
                </span>
              </div>
              <h3 className="text-h3">2. Click-to-Sync, Cover Letter & Space Optimizer</h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Klik seksi pada PDF untuk melompat ke form, susun Harvard Cover Letter sepadan, dan atur kepadatan 1 halaman secara opsional dengan Smart Space Optimizer.
              </p>
            </div>

            <div className="p-6 surface-card surface-card-hover space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-[16px] bg-[#FFD3B6]/60 text-[#4A2511] flex items-center justify-center">
                  <Download className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <span className="text-2xl font-bold font-heading text-[var(--muted-foreground)]/40">
                  03
                </span>
              </div>
              <h3 className="text-h3">3. Kompilasi & Unduh PDF Vektor</h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Server mengeksekusi Tectonic LaTeX secara real-time. Unduh hasil PDF yang tajam atau ekspor kode sumber .tex dan .json Anda.
              </p>
            </div>
          </div>
        </section>

        {/* LATEX ENGINE SHOWCASE & 3 ADVANTAGES */}
        <section
          id="arsitektur-latex"
          className="py-20 border-y border-[var(--border)] bg-[var(--surface)]/70"
        >
          <div className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-4">
                <Badge variant="sky">
                  <Cpu className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>Arsitektur LaTeX Server-Side</span>
                </Badge>
                <h2 className="text-h1">
                  Mengapa Kompilasi LaTeX Asli Jauh Mengungguli Konversi HTML?
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  Banyak aplikasi pembuat CV hanya membungkus halaman web dengan <code className="font-semibold">html2canvas</code> atau <code className="font-semibold">window.print()</code>. Hasilnya sering kali buram, spasi karakter berantakan, dan gagal diekstrak oleh sistem rekrutmen otomatis.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                  <div className="p-4 rounded-[16px] bg-[var(--background)] border border-[var(--border)] space-y-2">
                    <FileCheck2 className="w-5 h-5 text-[#9B86EC]" strokeWidth={2.5} />
                    <h3 className="text-sm font-bold font-heading">{t('landing.feature1Title')}</h3>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      {t('landing.feature1Desc')}
                    </p>
                  </div>
                  <div className="p-4 rounded-[16px] bg-[var(--background)] border border-[var(--border)] space-y-2">
                    <FileCode2 className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                    <h3 className="text-sm font-bold font-heading">{t('landing.feature2Title')}</h3>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      {t('landing.feature2Desc')}
                    </p>
                  </div>
                  <div className="p-4 rounded-[16px] bg-[var(--background)] border border-[var(--border)] space-y-2">
                    <ShieldCheck className="w-5 h-5 text-amber-600" strokeWidth={2.5} />
                    <h3 className="text-sm font-bold font-heading">{t('landing.feature3Title')}</h3>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      {t('landing.feature3Desc')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Code Preview Card */}
              <div className="lg:col-span-6">
                <div className="rounded-[20px] bg-[#151221] text-[#E6E1F9] border border-[#2E2944] p-5 shadow-[var(--shadow-4)] space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[#2E2944]">
                    <div className="flex items-center gap-2 text-xs font-bold font-heading text-[#B8A9F5]">
                      <Code2 className="w-4 h-4" strokeWidth={2.5} />
                      <span>resume_harvard_ocs.tex (Generated Server-Side)</span>
                    </div>
                    <Badge variant="mint">Escaped & Sanitized</Badge>
                  </div>
                  <pre className="text-xs leading-relaxed overflow-x-auto text-[#D5CFF0]">
{`\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=0.72in]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{tgtermes}
\\usepackage{microtype}
\\usepackage[hidelinks]{hyperref}
\\titleformat{\\section}{\\scshape\\large\\bfseries}{}{0em}{}[\\vspace{1.5pt}\\titlerule]
\\newcommand{\\entry}[4]{%
  \\noindent\\textbf{#1}\\hfill\\textit{#2}\\\\
  \\textit{#3}\\hfill #4\\par}
\\begin{document}
  \\section*{Pengalaman Kerja}
  \\entry{PT GoTo Gojek Tokopedia Tbk}{Jakarta, Indonesia}
        {Senior Software Engineer}{Apr 2022 -- Sekarang}
\\end{document}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section id="faq" className="py-20 max-w-3xl mx-auto px-6">
          <div className="text-center space-y-2 mb-10">
            <Badge variant="peach">Pertanyaan Umum (FAQ)</Badge>
            <h2 className="text-h1">Semua tentang Format Harvard & LaTeX</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="surface-card px-5 border border-[var(--border)]"
              >
                <AccordionTrigger className="text-sm sm:text-base">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* FINAL CTA BANNER */}
        <section className="max-w-[1200px] mx-auto px-6 pb-20">
          <div className="rounded-[24px] bg-hero-gradient border border-[var(--border-strong)] p-8 sm:p-12 text-center space-y-5 shadow-[var(--shadow-3)]">
            <h2 className="text-h1 max-w-xl mx-auto">
              Siap Menyusun CV Harvard yang Membuka Pintu Wawancara?
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] max-w-lg mx-auto">
              Gratis, tersimpan otomatis di peramban Anda, dan langsung menghasilkan dokumen PDF LaTeX berstandar internasional.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button variant="gradient" size="lg" onClick={() => navigate('/dashboard')}>
                <span>Buka Ruang Kerja Sekarang</span>
                <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/templates')}>
                <span>Lihat 3 Preset Harvard</span>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Complete Footer */}
      <footer className="border-t border-[var(--border)] py-10 px-6 md:px-12 bg-[var(--surface)] z-10">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[8px] btn-lavender-gradient flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#211942]" strokeWidth={2.5} />
            </div>
            <span className="font-bold font-heading text-[var(--foreground)]">
              Buat CV Kuy — Harvard Business School (OCS) LaTeX Resume Builder
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="hover:text-[var(--foreground)] transition-colors">
              Dashboard
            </Link>
            <Link to="/templates" className="hover:text-[var(--foreground)] transition-colors">
              Template Harvard
            </Link>
            <Link to="/settings" className="hover:text-[var(--foreground)] transition-colors">
              Pengaturan
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
