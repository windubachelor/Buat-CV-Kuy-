import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Eye,
  FileCode2,
  FilePlus2,
  FileText,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AppShell } from '../components/layout/AppShell';
import { Badge, Button, ModalDialog } from '../components/ui/primitives';
import {
  isCoverLetterTemplatePreset,
  type TemplatePreset,
} from '../shared/schema';
import { TEMPLATE_PRESETS, type TemplatePresetMeta } from '../shared/templates';
import { useCVStore } from '../store/useCVStore';

type CategoryFilter = 'all' | 'harvard' | 'overleaf' | 'cover-letter';

const MINIATURE_DATA: Record<
  TemplatePreset,
  {
    candidateName: string;
    headline: string;
    contact: string;
    sec1Title: string;
    sec1Left: string;
    sec1Sub: string;
    sec1Date: string;
    sec2Title: string;
    bullets: string[];
  }
> = {
  classic: {
    candidateName: 'Bagaskara Adi Pratama',
    headline: 'Senior Backend & Distributed Systems Engineer',
    contact: 'Jakarta, Indonesia · bagaskara@alumni.ui.ac.id · linkedin.com/in/bagaskara',
    sec1Title: 'Pendidikan',
    sec1Left: 'Universitas Indonesia',
    sec1Sub: 'Sarjana Ilmu Komputer (S.Kom.), IPK: 3.89 / 4.00',
    sec1Date: 'Agu 2016 – Jul 2020',
    sec2Title: 'Pengalaman Kerja',
    bullets: [
      'Merancang arsitektur ledger 18.500+ TPS dengan tingkat reliabilitas 99,995% SLA.',
      'Menghemat biaya infrastruktur cloud tahunan sebesar $145.000 melalui optimasi Go.',
    ],
  },
  compact: {
    candidateName: 'Clarissa Nadine Wijaya',
    headline: 'Product Manager — FinTech & Cross-Border Payments',
    contact: 'Boston, MA · cwijaya@mba2025.hbs.edu · linkedin.com/in/clarissawijaya',
    sec1Title: 'Education',
    sec1Left: 'Harvard Business School',
    sec1Sub: 'Master of Business Administration (MBA)',
    sec1Date: 'Aug 2023 – May 2025',
    sec2Title: 'Experience',
    bullets: [
      'Spearheaded cross-border QR payment launch driving $420M TPV in year one.',
      'Reduced merchant onboarding turnaround time by 64% across 5 SEA markets.',
    ],
  },
  academic: {
    candidateName: 'Nadia Maharani Pramesti, M.Sc.',
    headline: 'Computational Biology & Machine Learning Researcher',
    contact: 'Bandung, Indonesia · nadia.pramesti@itb.ac.id · scholar.google.com',
    sec1Title: 'Pendidikan & Riset',
    sec1Left: 'ETH Zürich / Institut Teknologi Bandung',
    sec1Sub: 'M.Sc. in Computational Biology & Bioinformatics (GPA: 5.75 / 6.00)',
    sec1Date: 'Sep 2022 – Agu 2024',
    sec2Title: 'Publikasi Ilmiah',
    bullets: [
      'Pramesti, N.M., et al. "Graph Neural Networks for Protein Binding." Bioinformatics (2024).',
      'Penerima Beasiswa Penuh LPDP & ETH Excellence Scholarship Option.',
    ],
  },
  jakes: {
    candidateName: 'Raka Mahendra Putra',
    headline: 'Full-Stack & Cloud Infrastructure Engineer',
    contact: 'Jakarta · raka@dev.id · [in] linkedin.com/in/rakadev · [gh] github.com/rakadev',
    sec1Title: 'Experience',
    sec1Left: 'GoTo Financial — Core Platform',
    sec1Sub: 'Senior Software Engineer (Go, Kubernetes, Kafka, PostgreSQL)',
    sec1Date: 'Jan 2023 – Present',
    sec2Title: 'Selected Projects',
    bullets: [
      'Built zero-downtime schema migration engine handling 40TB+ sharded Postgres clusters.',
      'Open-sourced high-throughput gRPC rate-limiter with 1.4k+ GitHub stars.',
    ],
  },
  wharton: {
    candidateName: 'kevin alexander tanoto',
    headline: 'Investment Banking Associate — M&A Advisory',
    contact: 'Singapore · kevin.tanoto@wharton.upenn.edu · +65 8123-9901',
    sec1Title: 'Experience',
    sec1Left: 'Morgan Stanley — Southeast Asia M&A',
    sec1Sub: 'Investment Banking Analyst / Associate',
    sec1Date: 'Jul 2021 – Present',
    sec2Title: 'Selected Transaction Experience',
    bullets: [
      'Advised on $1.8B cross-border telecom infrastructure carve-out and LBO financing.',
      'Built 3-statement LBO/DCF operating models for 6 closed deals totaling $4.2B EV.',
    ],
  },
  mckinsey: {
    candidateName: 'Aurelia Prameswari',
    headline: 'Engagement Manager — Digital Transformation & Strategy',
    contact: 'Jakarta & Singapore · aurelia_prameswari@mckinsey.com · linkedin.com/in/aurelia',
    sec1Title: 'Professional Experience',
    sec1Left: 'McKinsey & Company',
    sec1Sub: 'Engagement Manager (promoted from Senior Associate in 18 months)',
    sec1Date: 'Aug 2021 – Present',
    sec2Title: 'Leadership & Impact',
    bullets: [
      'Led 12-consultant workstream delivering $85M EBITDA uplift for top-3 ASEAN bank.',
      'Designed national EV charging network rollout strategy across 14 provinces.',
    ],
  },
  cover_letter_1: {
    candidateName: 'Dita Dwi Auliani, M.Kom.',
    headline: 'Dosen & Peneliti Ilmu Komputer (AI & Aplikasi Komputer)',
    contact: 'Palembang, Sumatera Selatan · (+62) 895-6098-40692 · ditaauliani13@gmail.com',
    sec1Title: 'Kepada Yth. Panitia Seleksi Dosen',
    sec1Left: 'FKIP Universitas Sriwijaya — Pendidikan Matematika',
    sec1Sub: 'Perihal: Lamaran Posisi Dosen Tamu (Aplikasi Komputer)',
    sec1Date: '27 Januari 2025',
    sec2Title: 'Ringkasan Kualifikasi & Lampiran (10 Berkas)',
    bullets: [
      'Lulusan Magister Ilmu Komputer (M.Kom.) Unsri bidang AI, Machine Learning & Deep Learning.',
      'Lampiran: CV, Ijazah S1/S2, Transkrip Akademik, Sertifikat TOEFL/USEPT, Bukti Publikasi.',
    ],
  },
  simple_letter: {
    candidateName: 'Bagaskara Adi Pratama',
    headline: 'Formal Overleaf Standard Letter (\\documentclass{letter})',
    contact: 'Jakarta Selatan, Indonesia · bagaskara.pratama@alumni.ui.ac.id · +62 812-8940-3120',
    sec1Title: 'Yth. Komite Rekrutmen & VP of Engineering',
    sec1Left: 'PT GoTo Gojek Tokopedia Tbk',
    sec1Sub: 'Perihal: Lamaran Posisi Principal Backend & Distributed Systems Engineer',
    sec1Date: '17 November 2026',
    sec2Title: 'Isi Surat Standar & Postscript (P.S.)',
    bullets: [
      'Tata letak surat klasik Overleaf dengan alamat pengirim rata kanan di bagian atas.',
      'Dilengkapi tanda tangan formal dan baris P.S. (Postscript) di bagian bawah surat.',
    ],
  },
};

function buildLatexSnippetPreview(preset: TemplatePresetMeta): string {
  if (preset.id === 'cover_letter_1') {
    return `% Template Preset: ${preset.nameId} (cover_letter_1)
\\documentclass[11pt,a4paper,sans]{moderncv}
\\moderncvstyle{classic}
\\moderncvcolor{blue}
\\usepackage[utf8]{inputenc}
\\usepackage[scale=0.75]{geometry}

\\name{Dita Dwi}{Auliani}
\\address{Palembang, Sumatera Selatan}{Indonesia}
\\phone[mobile]{(+62) 895-6098-40692}
\\email{ditaauliani13@gmail.com}

\\begin{document}
\\recipient{Yth. Panitia Seleksi Dosen}{FKIP Universitas Sriwijaya\\\\Palembang}
\\date{27 Januari 2025}
\\opening{\\textbf{Perihal: Lamaran untuk Posisi Dosen Tamu (Aplikasi Komputer)}\\\\[1em]Dengan hormat,}
\\closing{Hormat saya,}
\\enclosure[Lampiran]{CV, Ijazah S1/S2, Transkrip, Sertifikat TOEFL/USEPT, Publikasi}
\\makelettertitle
% ... Isi Surat Lamaran & Point Kualifikasi ...
\\makeletterclosing
\\end{document}`;
  }

  if (preset.id === 'simple_letter') {
    return `% Template Preset: ${preset.nameId} (simple_letter)
\\documentclass{letter}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{tgtermes}

\\signature{Bagaskara Adi Pratama}
\\address{Jakarta Selatan, Indonesia \\\\ +62 812-8940-3120 \\\\ bagaskara.pratama@alumni.ui.ac.id}

\\begin{document}
\\begin{letter}{Yth. Komite Rekrutmen \\\\ PT GoTo Gojek Tokopedia Tbk \\\\ Jakarta Selatan}
\\opening{Dengan hormat,}
% ... Isi Paragraf Surat Lamaran ...
\\closing{Hormat saya,}
\\ps{P.S. Portofolio arsitektur sistem dapat diakses melalui github.com/bagaskara-dev.}
\\end{letter}
\\end{document}`;
  }

  const rec = preset.recommendedSettings;
  const fontPkg =
    rec.fontFamily === 'libertinus'
      ? '\\usepackage{libertinus}'
      : rec.fontFamily === 'ebgaramond'
        ? '\\usepackage{ebgaramond}'
        : '\\usepackage{tgtermes}';
  const margin =
    rec.margin === 'compact' || preset.id === 'jakes'
      ? '0.45in'
      : rec.margin === 'narrow' || preset.id !== 'classic'
        ? '0.52in'
        : '0.72in';
  const headerRule =
    preset.previewHeaderRule === 'single'
      ? '\\vspace{1pt}\n\\noindent\\rule{\\textwidth}{0.6pt}\n\\vspace{-3pt}'
      : preset.previewHeaderRule === 'double'
        ? '\\vspace{1pt}\n\\noindent\\rule{\\textwidth}{0.9pt}\\\\[-8.5pt]\n\\noindent\\rule{\\textwidth}{0.35pt}\n\\vspace{-2pt}'
        : '\\vspace{-2pt}';

  return `% Template Preset: ${preset.nameEn} (${preset.id})
\\documentclass[${rec.fontSize === '10pt' || rec.fontSize === '10.5pt' ? '10pt' : '11pt'},a4paper]{article}
\\usepackage[margin=${margin}]{geometry}
\\usepackage[T1]{fontenc}
${fontPkg}
\\usepackage{microtype}
\\usepackage{enumitem}
\\usepackage{titlesec}

% Small-Caps Section Heading Rule
\\titleformat{\\section}{\\scshape\\large\\bfseries}{}{0em}{}[\\vspace{1.5pt}\\titlerule]

\\begin{document}
\\begin{center}
  {${preset.id === 'academic' ? '\\LARGE' : '\\Huge'}\\scshape\\bfseries NAMA LENGKAP}\\\\[3pt]
  {\\small Jakarta, Indonesia \\enspace$\\cdot$\\enspace email@domain.com}
\\end{center}
${headerRule}
% ... Isi Section CV ...
\\end{document}`;
}

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { prefs, createCV, getActiveCv, updateActiveCv } = useCVStore();
  const isId = prefs.uiLanguage === 'id';

  const [category, setCategory] = useState<CategoryFilter>('all');
  const [previewPreset, setPreviewPreset] = useState<TemplatePresetMeta | null>(null);

  const activeCv = getActiveCv();

  const filteredPresets = TEMPLATE_PRESETS.filter((p) =>
    category === 'all' ? true : p.category === category
  );

  const handleCreateWithPreset = (preset: TemplatePresetMeta, useBlank = false) => {
    const mode = useBlank ? 'blank' : preset.sampleMode;
    const created = createCV(mode, preset.recommendedSettings);
    toast.success(
      isId
        ? `CV baru dengan template "${preset.nameId}" berhasil dibuat!`
        : `New CV created with "${preset.nameEn}" template!`
    );
    setPreviewPreset(null);
    navigate(`/cv/${created.id}`);
  };

  const handleApplyToActiveCV = (preset: TemplatePresetMeta) => {
    if (!activeCv) {
      handleCreateWithPreset(preset, false);
      return;
    }
    updateActiveCv((draft) => {
      draft.settings = {
        ...draft.settings,
        ...preset.recommendedSettings,
        templatePreset: preset.id,
      };
      return draft;
    });
    toast.success(
      isId
        ? `Gaya template "${preset.nameId}" diterapkan ke CV "${activeCv.title}"!`
        : `Applied "${preset.nameEn}" style to "${activeCv.title}"!`
    );
    setPreviewPreset(null);
    navigate(`/cv/${activeCv.id}`);
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header & Category Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#B8A9F5]/25 text-[#2A2150] dark:text-[#DFD7FC] text-xs font-bold mb-2">
              <Layers className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Harvard OCS & Adaptasi LaTeX Overleaf</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#1F1B2E] dark:text-[#F4F2FA]">
              {isId
                ? 'Galeri Template CV LaTeX & Standar Harvard'
                : 'Harvard OCS & Overleaf LaTeX Template Gallery'}
            </h1>
            <p className="text-sm text-[#5B5475] dark:text-[#A69FC2] mt-1 max-w-2xl">
              {isId
                ? 'Pilih dari 3 template resmi Harvard OCS, 3 adaptasi CV Overleaf (Jake’s Resume SWE, Wharton, McKinsey), serta 2 template khusus Surat Lamaran Overleaf (Cover Letter #1 Bahasa Indonesia & Simple Letter).'
                : 'Choose from 3 official Harvard OCS presets, 3 adapted Overleaf CV templates, and 2 dedicated Overleaf Cover Letter templates.'}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap p-1 rounded-xl bg-white dark:bg-[#1B1828] border border-[#E8E4F8] dark:border-[#2E2944] self-start gap-1">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                category === 'all'
                  ? 'bg-[#B8A9F5] text-[#1E1638] shadow-xs'
                  : 'text-[#5B5475] dark:text-[#A69FC2] hover:text-[#1F1B2E] dark:hover:text-white'
              }`}
            >
              {isId ? 'Semua (8)' : 'All (8)'}
            </button>
            <button
              type="button"
              onClick={() => setCategory('harvard')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                category === 'harvard'
                  ? 'bg-[#BFEBD7] text-[#133A29] shadow-xs'
                  : 'text-[#5B5475] dark:text-[#A69FC2] hover:text-[#1F1B2E] dark:hover:text-white'
              }`}
            >
              {isId ? 'Harvard OCS (3)' : 'Harvard OCS (3)'}
            </button>
            <button
              type="button"
              onClick={() => setCategory('overleaf')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                category === 'overleaf'
                  ? 'bg-[#FFD3B6] text-[#4A2511] shadow-xs'
                  : 'text-[#5B5475] dark:text-[#A69FC2] hover:text-[#1F1B2E] dark:hover:text-white'
              }`}
            >
              {isId ? 'Overleaf CV .tex (3)' : 'Overleaf CV .tex (3)'}
            </button>
            <button
              type="button"
              onClick={() => setCategory('cover-letter')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                category === 'cover-letter'
                  ? 'bg-[#FFC8DD] text-[#4A152B] shadow-xs'
                  : 'text-[#5B5475] dark:text-[#A69FC2] hover:text-[#1F1B2E] dark:hover:text-white'
              }`}
            >
              {isId ? 'Cover Letter .tex (2)' : 'Cover Letter .tex (2)'}
            </button>
          </div>
        </div>

        {/* Active CV Quick Banner */}
        {activeCv && (
          <div className="p-4 rounded-2xl bg-[#FAF8FF] dark:bg-[#1B1828] border border-[#B8A9F5]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#B8A9F5]/35 text-[#2A2150] dark:text-[#DFD7FC] flex items-center justify-center shrink-0">
                <SlidersHorizontal className="w-4 h-4" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1F1B2E] dark:text-[#F4F2FA]">
                  CV Aktif Saat Ini: <span className="text-[#6E56CF] dark:text-[#B8A9F5]">{activeCv.title}</span>
                </p>
                <p className="text-[11px] text-[#5B5475] dark:text-[#A69FC2]">
                  Klik tombol <strong>&ldquo;Terapkan ke CV Aktif&rdquo;</strong> pada kartu mana pun untuk mengganti desain PDF tanpa menghapus isi data CV Anda.
                </p>
              </div>
            </div>
            <Badge variant="lavender">
              Preset Aktif: {activeCv.settings.templatePreset.toUpperCase()}
            </Badge>
          </div>
        )}

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresets.map((preset) => {
            const mini = MINIATURE_DATA[preset.id];
            const isCurrentlyActive = activeCv?.settings.templatePreset === preset.id;

            return (
              <div
                key={preset.id}
                className={`rounded-2xl bg-white dark:bg-[#1B1828] border p-5 flex flex-col justify-between space-y-5 transition-all ${
                  isCurrentlyActive
                    ? 'border-2 border-[#9B86EC] shadow-md'
                    : 'border-[#E8E4F8] dark:border-[#2E2944] hover:border-[#B8A9F5]'
                }`}
              >
                <div className="space-y-4">
                  {/* Visual LaTeX Sheet Miniature */}
                  <div
                    className="p-3.5 rounded-xl border border-[#E8E4F8] dark:border-[#2E2944] relative group cursor-pointer"
                    style={{ backgroundColor: `${preset.accentColor}30` }}
                    onClick={() => setPreviewPreset(preset)}
                  >
                    <div className="bg-white text-black rounded-lg p-3.5 shadow-xs border border-neutral-200 font-serif space-y-2">
                      {/* Header Block with Small-Caps simulation and optional single/double rule */}
                      <div
                        className={`text-center pb-1.5 ${
                          preset.previewHeaderRule === 'single'
                            ? 'border-b border-black'
                            : preset.previewHeaderRule === 'double'
                              ? 'border-b-[3px] border-double border-black'
                              : ''
                        }`}
                      >
                        <p className="font-bold tracking-wider text-[11px] uppercase">
                          {mini.candidateName}
                        </p>
                        <p className="italic text-[8.5px] text-neutral-700">{mini.headline}</p>
                        <p className="text-[7.5px] text-neutral-600 mt-0.5 truncate">
                          {mini.contact}
                        </p>
                      </div>

                      {/* Section 1 */}
                      <div className="space-y-0.5 text-[8.5px]">
                        <p className="font-bold uppercase tracking-wide border-b border-black pb-0.5 text-[8.5px]">
                          {mini.sec1Title}
                        </p>
                        <div className="flex justify-between font-bold pt-0.5">
                          <span className="truncate">{mini.sec1Left}</span>
                          <span className="font-normal shrink-0 ml-1">{mini.sec1Date}</span>
                        </div>
                        <p className="italic text-[8px] text-neutral-700 truncate">{mini.sec1Sub}</p>

                        {/* Section 2 */}
                        <p className="font-bold uppercase tracking-wide border-b border-black pb-0.5 pt-1 text-[8.5px]">
                          {mini.sec2Title}
                        </p>
                        <ul className="list-disc pl-3.5 text-[8px] text-neutral-800 space-y-0.5 pt-0.5">
                          {mini.bullets.map((b, i) => (
                            <li key={i} className="leading-snug line-clamp-2">
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Hover Preview Overlay Button */}
                    <div className="absolute inset-0 rounded-xl bg-[#1F1B2E]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#1F1B2E] text-xs font-bold shadow-md">
                        <Eye className="w-3.5 h-3.5" strokeWidth={2.5} />
                        <span>Lihat Detail & Kode .tex</span>
                      </span>
                    </div>
                  </div>

                  {/* Title & Category Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold text-[#1F1B2E]"
                        style={{ backgroundColor: `${preset.accentColor}75` }}
                      >
                        {isId ? preset.badgeId : preset.badgeEn}
                      </span>
                      {isCurrentlyActive && (
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                          Dipakai
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-bold font-heading mt-2 text-[#1F1B2E] dark:text-[#F4F2FA]">
                      {isId ? preset.nameId : preset.nameEn}
                    </h2>
                    <p className="text-xs text-[#5B5475] dark:text-[#A69FC2] mt-1.5 leading-relaxed">
                      {isId ? preset.descId : preset.descEn}
                    </p>
                  </div>

                  {/* LaTeX Macro Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {preset.latexMacros.map((macro) => (
                      <span
                        key={macro}
                        className="px-2 py-0.5 rounded-md bg-[#FAF9FF] dark:bg-[#151221] border border-[#E8E4F8] dark:border-[#2E2944] font-mono text-[10px] text-[#5B5475] dark:text-[#A69FC2]"
                      >
                        {macro}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#E8E4F8] dark:border-[#2E2944] text-xs space-y-0.5">
                    <p className="font-semibold text-[#1F1B2E] dark:text-[#F4F2FA]">
                      {isId ? 'Cocok Untuk:' : 'Ideal For:'}
                    </p>
                    <p className="text-[#5B5475] dark:text-[#A69FC2] text-[11px]">
                      {isId ? preset.bestForId : preset.bestForEn}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => handleCreateWithPreset(preset, false)}
                  >
                    <FilePlus2 className="w-4 h-4" strokeWidth={2.5} />
                    <span>
                      {isCoverLetterTemplatePreset(preset.id)
                        ? isId
                          ? 'Pakai Template Surat Ini'
                          : 'Use This Cover Letter Template'
                        : isId
                          ? 'Pakai Template Ini (CV Baru)'
                          : 'Use This Template (New CV)'}
                    </span>
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyToActiveCV(preset)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-[#E8E4F8] dark:border-[#2E2944] bg-[#FAF9FF] dark:bg-[#151221] hover:bg-[#B8A9F5]/25 text-[#1F1B2E] dark:text-[#F4F2FA] transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#6E56CF]" strokeWidth={2.5} />
                      <span>Terapkan ke CV Aktif</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewPreset(preset)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-[#E8E4F8] dark:border-[#2E2944] bg-[#FAF9FF] dark:bg-[#151221] hover:bg-[#BFEBD7]/30 text-[#1F1B2E] dark:text-[#F4F2FA] transition-colors cursor-pointer"
                    >
                      <Code2 className="w-3.5 h-3.5 text-[#133A29] dark:text-[#BFEBD7]" strokeWidth={2.5} />
                      <span>Kode .tex</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Overleaf .cls / .tex Extensibility Info Box */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1B1828] border border-[#E8E4F8] dark:border-[#2E2944] space-y-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD3B6] text-[#4A2511] flex items-center justify-center shrink-0">
              <FileCode2 className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading">
                Arsitektur Modular LaTeX Overleaf (.tex / .cls) & Kompatibilitas Penuh
              </h3>
              <p className="text-xs text-[#5B5475] dark:text-[#A69FC2]">
                Seluruh template di atas dikompilasi secara deterministik baik di server pengembangan (Tectonic TeX Live) maupun di Vercel Serverless (Native Type-1 PostScript Vector Engine).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-xs">
            <div className="p-4 rounded-xl bg-[#FAF9FF] dark:bg-[#151221] border border-[#E8E4F8] dark:border-[#2E2944] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#1F1B2E] dark:text-white">
                <BookOpen className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                <span>Small-Caps (\scshape) Asli</span>
              </div>
              <p className="text-[#5B5475] dark:text-[#A69FC2]">
                Nama kandidat dan judul seksi dirender dengan proporsi huruf kapital awal 100% dan huruf kapital kecil 74% yang identik di semua environment.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF9FF] dark:bg-[#151221] border border-[#E8E4F8] dark:border-[#2E2944] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#1F1B2E] dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                <span>Ganti Template Tanpa Kehilangan Data</span>
              </div>
              <p className="text-[#5B5475] dark:text-[#A69FC2]">
                Karena data CV disimpan terstruktur (JSON), Anda bisa berpindah dari Harvard Classic ke Jake&apos;s Resume atau McKinsey kapan saja dalam 1 klik.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF9FF] dark:bg-[#151221] border border-[#E8E4F8] dark:border-[#2E2944] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#1F1B2E] dark:text-white">
                <FileText className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                <span>Ekspor Kode .tex untuk Overleaf</span>
              </div>
              <p className="text-[#5B5475] dark:text-[#A69FC2]">
                Setiap preset menghasilkan kode sumber <code className="font-mono">.tex</code> bersih yang siap diunduh dan dibuka langsung di Overleaf atau TeXstudio.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Preview Detail & Kode .tex */}
      {previewPreset && (
        <ModalDialog
          open={Boolean(previewPreset)}
          onOpenChange={(open) => {
            if (!open) setPreviewPreset(null);
          }}
          title={isId ? previewPreset.nameId : previewPreset.nameEn}
          description={isId ? previewPreset.descId : previewPreset.descEn}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[var(--muted)]">
                <p className="text-[10px] text-[var(--muted-foreground)]">Font LaTeX</p>
                <p className="font-bold mt-0.5">{previewPreset.recommendedSettings.fontFamily}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--muted)]">
                <p className="text-[10px] text-[var(--muted-foreground)]">Ukuran Font</p>
                <p className="font-bold mt-0.5">{previewPreset.recommendedSettings.fontSize}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--muted)]">
                <p className="text-[10px] text-[var(--muted-foreground)]">Margin Kertas</p>
                <p className="font-bold mt-0.5">{previewPreset.recommendedSettings.margin}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--muted)]">
                <p className="text-[10px] text-[var(--muted-foreground)]">Garis Kop Header</p>
                <p className="font-bold mt-0.5 capitalize">{previewPreset.previewHeaderRule}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold mb-1.5 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-[#6E56CF]" strokeWidth={2.5} />
                <span>Struktur Preamble LaTeX (.tex) yang Digunakan:</span>
              </p>
              <pre className="p-3.5 rounded-xl bg-[#151221] text-[#F4F2FA] font-mono text-[11px] overflow-x-auto leading-relaxed border border-[#2E2944]">
                {buildLatexSnippetPreview(previewPreset)}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2 border-t border-[var(--border)]">
              <Button
                variant="secondary"
                onClick={() => handleCreateWithPreset(previewPreset, true)}
              >
                <FilePlus2 className="w-4 h-4" strokeWidth={2.5} />
                <span>Buat CV Kosong dengan Template Ini</span>
              </Button>
              {activeCv && (
                <Button
                  variant="secondary"
                  onClick={() => handleApplyToActiveCV(previewPreset)}
                >
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                  <span>Terapkan ke CV Aktif</span>
                </Button>
              )}
              <Button
                variant="primary"
                onClick={() => handleCreateWithPreset(previewPreset, false)}
              >
                <span>Gunakan dengan Contoh Data</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Button>
            </div>
          </div>
        </ModalDialog>
      )}
    </AppShell>
  );
};
