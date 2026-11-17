import {
  ArrowDown,
  ArrowUp,
  Building2,
  CheckCircle2,
  FileText,
  Mail,
  Paperclip,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  type CVData,
  type DocumentMode,
  isCoverLetterTemplatePreset,
} from '../../shared/schema';
import { createDefaultCoverLetter } from '../../shared/templates';
import {
  Badge,
  Button,
  Input,
  Label,
  Textarea,
  Tooltip,
  cn,
} from '../ui/primitives';

interface CoverLetterPanelProps {
  cv: CVData;
  documentMode: DocumentMode;
  onChangeDocumentMode: (mode: DocumentMode) => void;
  updateCV: (updater: (draft: CVData) => CVData) => void;
}

const COVER_LETTER_PRESETS = {
  id: [
    {
      id: 'tech',
      label: 'Software & Engineering',
      subject: 'Lamaran Posisi Senior Software Engineer',
      opening:
        'Melalui surat ini, saya menyampaikan ketertarikan mendalam untuk melamar posisi **Senior Software Engineer**. Dengan pengalaman membangun sistem terdistribusi berkinerja tinggi dan arsitektur layanan mikro (*microservices*), saya siap berkontribusi langsung dalam meningkatkan skalabilitas serta keandalan platform teknologi perusahaan Bapak/Ibu.',
      body: [
        'Pada peran terakhir saya, saya memimpin perancangan sistem pemrosesan transaksi berkecepatan tinggi yang melayani jutaan permintaan harian dengan tingkat ketersediaan **99,99% SLA** serta memangkas biaya infrastruktur cloud sebesar **30%** melalui optimasi kueri dan *caching*.',
        'Selain keahlian teknis, saya aktif membimbing anggota tim lintas fungsi dan menerapkan standar pengujian otomatis (*CI/CD*) yang mempercepat siklus rilis fitur hingga **25%** tanpa mengorbankan kualitas kode.',
      ],
      closing:
        'Bersama surat ini saya lampirkan Resume/CV standar Harvard OCS saya. Saya sangat menghargai kesempatan wawancara untuk mendiskusikan bagaimana pengalaman teknis saya dapat mendukung target rekayasa tim Bapak/Ibu. Terima kasih atas waktu dan pertimbangannya.',
    },
    {
      id: 'consulting',
      label: 'Management Consulting & Bisnis',
      subject: 'Lamaran Posisi Management Consultant / Business Analyst',
      opening:
        'Saya menulis surat ini untuk mengajukan lamaran pada posisi **Management Consultant**. Kombinasi latar belakang akademik yang kuat dan pengalaman memimpin proyek transformasi strategis membekali saya dengan kemampuan pemecahan masalah terstruktur berbasis data.',
      body: [
        'Selama menangani berbagai inisiatif strategis dan operasional, saya berhasil merancang model optimasi harga dan efisiensi proses yang menghasilkan peningkatan margin kotor sebesar **310 bps** serta mempercepat akuisisi pelanggan baru secara signifikan.',
        'Saya terbiasa memfasilitasi penyelarasan keputusan di tingkat eksekutif (C-level), menyusun pemodelan finansial yang presisi, serta menerjemahkan rekomendasi strategi menjadi peta jalan implementasi yang terukur.',
      ],
      closing:
        'Saya sangat antusias dengan kesempatan untuk membawa ketajaman analitis dan dedikasi kerja saya ke dalam tim Bapak/Ibu. Terima kasih atas waktu dan perhatian yang diberikan terhadap lamaran saya.',
    },
    {
      id: 'academic',
      label: 'Riset, Akademik & Beasiswa',
      subject: 'Pernyataan Minat Riset & Lamaran Peneliti / Beasiswa',
      opening:
        'Melalui surat pengantar ini, saya mengajukan permohonan untuk bergabung dalam program riset dan akademik di institusi Bapak/Ibu. Rekam jejak publikasi ilmiah dan penelitian saya berfokus pada pengembangan metode komputasi yang memiliki dampak terapan luas.',
      body: [
        'Penelitian tesis dan publikasi terindeks saya telah mengeksplorasi optimasi algoritma pada sistem berskala besar, yang dipresentasikan pada konferensi internasional dan memperoleh pengakuan akademik.',
        'Pengalaman saya sebagai asisten peneliti dan pengajar telah membentuk kedisiplinan metodologi ilmiah, kemampuan penulisan naskah akademik berbahasa Inggris, serta kolaborasi riset multidisiplin.',
      ],
      closing:
        'Terlampir CV Akademik lengkap beserta daftar publikasi saya. Besar harapan saya untuk dapat mendiskusikan kontribusi riset yang dapat saya jalankan di laboratorium Bapak/Ibu. Terima kasih atas perhatiannya.',
    },
    {
      id: 'moderncv_dosen',
      label: 'Cover Letter #1 — Dosen & Pengajar (ID)',
      subject:
        'Lamaran untuk Posisi Dosen Tamu (Aplikasi Komputer) di Program Studi Pendidikan Matematika Fakultas Keguruan dan Ilmu Pendidikan Universitas Sriwijaya',
      opening:
        'Sehubungan dengan informasi pembukaan rekrutmen **Dosen Tamu (Aplikasi Komputer)** di Program Studi Pendidikan Matematika, Fakultas Keguruan dan Ilmu Pendidikan, Universitas Sriwijaya, bersama surat ini saya bermaksud mengajukan diri untuk mengisi posisi tersebut.',
      body: [
        'Saya telah menyelesaikan studi **Magister Ilmu Komputer (M.Kom.)** di Fakultas Ilmu Komputer Universitas Sriwijaya pada Oktober 2024 dengan konsentrasi penelitian di bidang *Artificial Intelligence*, *Machine Learning*, dan *Deep Learning*. Selama menempuh pendidikan Sarjana dan Magister, saya secara konsisten mendalami pengembangan perangkat lunak, algoritma pemrograman, dan pengolahan citra medis serta memiliki komitmen tinggi terhadap dunia pengajaran dan pembimbingan mahasiswa.',
        '• **Asisten Laboratorium & Pengajar Praktikum**: Berpengalaman membimbing mahasiswa dalam mata kuliah Pemrograman Dasar, Struktur Data, serta Aplikasi Komputer dan Pengolahan Data Ilmiah.\n• **Publikasi & Riset Terapan**: Memiliki rekam jejak publikasi ilmiah pada jurnal nasional terakreditasi dan konferensi internasional IEEE di bidang kecerdasan buatan dan komputasi terapan.\n• **Penguasaan Perangkat Lunak Akademik & Pemrograman**: Menguasai pengajaran paket aplikasi perkantoran akademik, LaTeX, Python, MATLAB, SPSS, serta pembuatan modul pembelajaran interaktif berbasis proyek.\n• **Dedikasi Tridharma Perguruan Tinggi**: Siap berkontribusi penuh dalam kegiatan pengajaran, pembimbingan praktikum mahasiswa Pendidikan Matematika, penelitian kolaboratif lintas jurusan, dan pengabdian kepada masyarakat.',
      ],
      closing:
        'Sebagai bahan pertimbangan Bapak/Ibu, bersama surat lamaran ini saya lampirkan daftar riwayat hidup (Curriculum Vitae), ijazah, transkrip akademik, serta dokumen pendukung lainnya. Besar harapan saya untuk diberikan kesempatan mengikuti tahapan seleksi dan wawancara lebih lanjut. Atas perhatian dan kesempatan yang Bapak/Ibu berikan, saya ucapkan terima kasih.',
      enclosures: [
        'Pasfoto Terbaru (Latar Belakang Merah)',
        'Kartu Tanda Penduduk (KTP)',
        'Daftar Riwayat Hidup (Curriculum Vitae)',
        'Ijazah S1 & S2 (Legalisir)',
        'Transkrip Akademik S1 & S2 (Legalisir)',
        'Sertifikat Kemampuan Bahasa Inggris (TOEFL / USEPT)',
        'Sertifikat Pelatihan & Kompetensi Pendukung',
        'Bukti Publikasi Artikel Ilmiah Terindeks',
        'Surat Keterangan Sehat Jasmani & Rohani',
        'Surat Pernyataan Kesediaan Mengajar',
      ],
    },
  ],
  en: [
    {
      id: 'tech',
      label: 'Software & Product Engineering',
      subject: 'Application for Senior Software Engineer',
      opening:
        'I am writing to express my strong interest in the **Senior Software Engineer** position. With a proven track record of architecting high-throughput distributed systems and mission-critical backend infrastructure, I am eager to help scale your engineering platform.',
      body: [
        'In my current role, I spearheaded the design and rollout of a real-time transaction processing pipeline handling **18,500+ TPS** at sub-30ms tail latency while reducing annual cloud infrastructure expenditure by **34%**.',
        'Beyond technical execution, I partner closely with product and data teams to translate ambiguous business requirements into resilient, well-tested architectures and mentor junior engineers to accelerate delivery velocity.',
      ],
      closing:
        'Enclosed is my Harvard OCS resume for your review. I would welcome the opportunity to discuss how my systems engineering background aligns with your upcoming technical roadmap. Thank you for your time and consideration.',
    },
    {
      id: 'consulting',
      label: 'Strategy, Consulting & Product',
      subject: 'Application for Product Manager / Strategy Associate',
      opening:
        'I am writing to apply for the **Product & Strategy** role. Combining rigorous quantitative analysis with cross-functional product leadership, I have consistently scaled B2B and consumer platforms across competitive markets.',
      body: [
        'During my recent tenure, I led end-to-end product launches that drove **$420M+ in annualized volume** and redesigned customer onboarding workflows to improve conversion by **64%**.',
        'My prior management consulting experience equipped me with structured problem-solving frameworks, executive communication skills, and the ability to align engineering, design, and commercial stakeholders around measurable KPIs.',
      ],
      closing:
        'I look forward to the possibility of discussing how my blend of strategic rigor and product execution can contribute to your team’s continued growth. Thank you very much for your consideration.',
    },
    {
      id: 'academic',
      label: 'Academic, Fellowship & Research',
      subject: 'Application for Research Fellowship / Doctoral Program',
      opening:
        'I am writing to submit my application for the **Research Fellowship**. My academic training and peer-reviewed publications focus on advancing computational methods with direct real-world impact.',
      body: [
        'Throughout my graduate and undergraduate studies, I have led empirical research projects resulting in peer-reviewed publications and competitive national merit fellowships.',
        'My experience mentoring students and collaborating across interdisciplinary research groups has prepared me to contribute immediately to your institution’s scholarly community.',
      ],
      closing:
        'Please find my curriculum vitae enclosed. I would be honored to discuss my research agenda and potential contributions with your committee. Thank you for your time and consideration.',
    },
  ],
};

export const CoverLetterPanel: React.FC<CoverLetterPanelProps> = ({
  cv,
  documentMode,
  onChangeDocumentMode,
  updateCV,
}) => {
  const isId = cv.settings.cvLanguage === 'id';
  const isDedicatedCoverLetter = isCoverLetterTemplatePreset(cv.settings.templatePreset);
  const [newEnclosure, setNewEnclosure] = useState('');

  // Ensure coverLetter object is initialized with fallback if empty
  const rawCl = cv.coverLetter;
  const hasAnyContent = Boolean(
    rawCl &&
      (rawCl.openingParagraph?.trim() ||
        rawCl.bodyParagraphs?.length > 0 ||
        rawCl.companyName?.trim())
  );
  const cl = hasAnyContent ? rawCl : createDefaultCoverLetter(cv);

  const ensureInitialized = (draft: CVData) => {
    if (
      !draft.coverLetter ||
      (!draft.coverLetter.openingParagraph?.trim() &&
        draft.coverLetter.bodyParagraphs.length === 0 &&
        !draft.coverLetter.companyName?.trim())
    ) {
      draft.coverLetter = createDefaultCoverLetter(draft);
    }
    if (!Array.isArray(draft.coverLetter.enclosures)) {
      draft.coverLetter.enclosures = [];
    }
    if (typeof draft.coverLetter.postscript !== 'string') {
      draft.coverLetter.postscript = '';
    }
    return draft.coverLetter;
  };

  const applyPreset = (presetId: string) => {
    const list = isId ? COVER_LETTER_PRESETS.id : COVER_LETTER_PRESETS.en;
    const found = list.find((p) => p.id === presetId) as
      | ((typeof list)[number] & { enclosures?: string[] })
      | undefined;
    if (!found) return;

    updateCV((d) => {
      const target = ensureInitialized(d);
      target.subjectLine = found.subject;
      target.openingParagraph = found.opening;
      target.bodyParagraphs = [...found.body];
      target.closingParagraph = found.closing;
      if (found.enclosures) {
        target.enclosures = [...found.enclosures];
      }
      return d;
    });

    if (documentMode === 'cv') {
      onChangeDocumentMode('cover-letter');
    }
    toast.success(`Template Cover Letter "${found.label}" diterapkan.`);
  };

  const handleResetDefault = () => {
    updateCV((d) => {
      d.coverLetter = createDefaultCoverLetter(d);
      return d;
    });
    toast.success('Cover Letter diselaraskan ulang dengan profil CV Anda.');
  };

  // Calculate total words
  const allText = [
    cl.openingParagraph,
    ...(cl.bodyParagraphs || []),
    cl.closingParagraph,
  ]
    .join(' ')
    .trim();
  const wordCount = allText ? allText.split(/\s+/).length : 0;
  const isIdealWordCount = wordCount >= 180 && wordCount <= 420;

  const presets = isId ? COVER_LETTER_PRESETS.id : COVER_LETTER_PRESETS.en;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-[20px] bg-[#B8A9F5]/22 dark:bg-[#B8A9F5]/12 border border-[#B8A9F5]/45 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[var(--shadow-1)]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-[14px] bg-[#B8A9F5] text-[#2A2150] flex items-center justify-center shrink-0 shadow-xs">
            <Mail className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold font-heading">
                {cv.settings.templatePreset === 'cover_letter_1'
                  ? 'Cover Letter #1 — ModernCV Classic + Lampiran (Bahasa Indonesia)'
                  : cv.settings.templatePreset === 'simple_letter'
                    ? 'Simple Letter — Overleaf Standard Letter + P.S.'
                    : 'Harvard OCS Cover Letter Builder'}
              </h2>
              <span className="text-xs text-[var(--muted-foreground)] font-heading tabular-nums">
                · {wordCount} kata
              </span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              {isDedicatedCoverLetter
                ? 'Dokumen ini menggunakan template khusus Cover Letter Overleaf (.tex). Seluruh perubahan otomatis dirender ke PDF.'
                : 'Menggunakan header nama, kontak, dan tipografi LaTeX yang 100% serasi dengan Resume Anda.'}
            </p>
          </div>
        </div>

        {/* Document Preview Output Switcher: hidden when dedicated cover letter preset is chosen */}
        {isDedicatedCoverLetter ? (
          <Badge variant="mint" className="shrink-0">
            Template Khusus Cover Letter Aktif
          </Badge>
        ) : (
          <div className="flex items-center gap-1 p-1 rounded-[12px] bg-[var(--surface)] border border-[var(--border-strong)] shrink-0">
            <button
              type="button"
              onClick={() => onChangeDocumentMode('cover-letter')}
              className={cn(
                'px-2.5 py-1.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap',
                documentMode === 'cover-letter'
                  ? 'bg-[#B8A9F5] text-[#2A2150]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              )}
            >
              Preview Surat
            </button>
            <button
              type="button"
              onClick={() => onChangeDocumentMode('combined')}
              className={cn(
                'px-2.5 py-1.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap',
                documentMode === 'combined'
                  ? 'bg-[#B8A9F5] text-[#2A2150]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              )}
            >
              Gabungan (Surat + CV)
            </button>
          </div>
        )}
      </div>

      {/* 1-Click Harvard OCS Cover Letter Templates */}
      <div className="p-5 surface-card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Template Cepat Standar Harvard OCS ({isId ? 'Bahasa Indonesia' : 'English'})
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Pilih kerangka surat pengantar berdasarkan bidang industri, atau selaraskan otomatis dengan data CV Anda.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleResetDefault}>
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Sinkronkan dari CV</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className="p-3 rounded-[12px] border border-[var(--border-strong)] bg-[var(--background)] hover:bg-[var(--muted)] text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold font-heading text-[var(--foreground)] group-hover:text-[#2A2150] dark:group-hover:text-[#B8A9F5]">
                  {preset.label}
                </span>
                <FileText className="w-3.5 h-3.5 text-[var(--muted-foreground)] shrink-0" strokeWidth={2.5} />
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1 line-clamp-2">
                {preset.subject}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Recipient & Company Metadata */}
      <div className="p-6 surface-card space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
          <Building2 className="w-4 h-4 text-[#9B86EC]" strokeWidth={2.5} />
          <h3 className="text-sm font-bold font-heading">
            Informasi Penerima & Perusahaan Tujuan
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cl-date">Tanggal Surat</Label>
            <Input
              id="cl-date"
              value={cl.date}
              onChange={(e) =>
                updateCV((d) => {
                  const target = ensureInitialized(d);
                  target.date = e.target.value;
                  return d;
                })
              }
              placeholder={isId ? '16 November 2026' : 'November 16, 2026'}
            />
          </div>

          <div>
            <Label htmlFor="cl-company">Nama Perusahaan / Institusi *</Label>
            <Input
              id="cl-company"
              value={cl.companyName}
              onChange={(e) =>
                updateCV((d) => {
                  const target = ensureInitialized(d);
                  target.companyName = e.target.value;
                  return d;
                })
              }
              placeholder="PT GoTo Gojek Tokopedia Tbk / Stripe, Inc."
            />
          </div>

          <div>
            <Label htmlFor="cl-recipient">Nama Penerima / Komite Rekrutmen</Label>
            <Input
              id="cl-recipient"
              value={cl.recipientName}
              onChange={(e) =>
                updateCV((d) => {
                  const target = ensureInitialized(d);
                  target.recipientName = e.target.value;
                  return d;
                })
              }
              placeholder={isId ? 'Tim Rekrutmen & Akuisisi Talenta' : 'Hiring Committee'}
            />
          </div>

          <div>
            <Label htmlFor="cl-recipient-title">Jabatan Penerima / Divisi</Label>
            <Input
              id="cl-recipient-title"
              value={cl.recipientTitle}
              onChange={(e) =>
                updateCV((d) => {
                  const target = ensureInitialized(d);
                  target.recipientTitle = e.target.value;
                  return d;
                })
              }
              placeholder="VP of Engineering / Talent Acquisition"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="cl-address">Alamat Perusahaan / Kota</Label>
            <Input
              id="cl-address"
              value={cl.companyAddress}
              onChange={(e) =>
                updateCV((d) => {
                  const target = ensureInitialized(d);
                  target.companyAddress = e.target.value;
                  return d;
                })
              }
              placeholder="Gedung Pasaraya Blok M, Jakarta Selatan"
            />
          </div>

          <div>
            <Label htmlFor="cl-subject">Perihal / Posisi yang Dilamar (Subject Line)</Label>
            <Input
              id="cl-subject"
              value={cl.subjectLine}
              onChange={(e) =>
                updateCV((d) => {
                  const target = ensureInitialized(d);
                  target.subjectLine = e.target.value;
                  return d;
                })
              }
              placeholder="Lamaran Posisi Senior Software Engineer"
            />
          </div>

          <div>
            <Label htmlFor="cl-salutation">Salam Pembuka (Salutation)</Label>
            <Input
              id="cl-salutation"
              value={cl.salutation}
              onChange={(e) =>
                updateCV((d) => {
                  const target = ensureInitialized(d);
                  target.salutation = e.target.value;
                  return d;
                })
              }
              placeholder={isId ? 'Yth. Bapak/Ibu Tim Rekrutmen,' : 'Dear Hiring Manager,'}
            />
          </div>
        </div>
      </div>

      {/* 3-Act Harvard Letter Body */}
      <div className="p-6 surface-card space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div>
            <h3 className="text-sm font-bold font-heading">
              Isi Surat Pengantar (Struktur 3 Bagian Harvard OCS)
            </h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Mendukung format <strong>**tebal**</strong> dan <em>*miring*</em> yang otomatis dikompilasi ke makro LaTeX.
            </p>
          </div>
          <Badge variant={isIdealWordCount ? 'mint' : 'butter'}>
            {wordCount} kata · {isIdealWordCount ? 'Panjang Ideal 1 Halaman ✓' : 'Saran: 180–400 kata'}
          </Badge>
        </div>

        {/* Act 1: Opening Paragraph */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="cl-opening" className="mb-0">
              1. Paragraf Pembuka (Posisi yang Dilamar & Ringkasan Kualifikasi Utama)
            </Label>
            {cl.openingParagraph.trim().length > 40 && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
            )}
          </div>
          <Textarea
            id="cl-opening"
            rows={4}
            value={cl.openingParagraph}
            onChange={(e) =>
              updateCV((d) => {
                const target = ensureInitialized(d);
                target.openingParagraph = e.target.value;
                return d;
              })
            }
            placeholder="Nyatakan posisi yang dilamar dan mengapa latar belakang Anda relevan..."
          />
        </div>

        {/* Act 2: Body Paragraphs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="mb-0">
              2. Paragraf Inti & Bukti Pencapaian Terukur ({cl.bodyParagraphs.length} Paragraf)
            </Label>
            <Button
              variant="soft"
              size="sm"
              onClick={() =>
                updateCV((d) => {
                  const target = ensureInitialized(d);
                  target.bodyParagraphs.push('');
                  return d;
                })
              }
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Tambah Paragraf Inti</span>
            </Button>
          </div>

          {cl.bodyParagraphs.map((para, idx) => (
            <div
              key={idx}
              className="p-4 rounded-[14px] bg-[var(--background)] border border-[var(--border-strong)] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-heading text-[var(--muted-foreground)]">
                  Paragraf Inti #{idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <Tooltip content="Pindah ke atas">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() =>
                        updateCV((d) => {
                          const target = ensureInitialized(d);
                          const temp = target.bodyParagraphs[idx - 1]!;
                          target.bodyParagraphs[idx - 1] = target.bodyParagraphs[idx]!;
                          target.bodyParagraphs[idx] = temp;
                          return d;
                        })
                      }
                      className="p-1 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted)] disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                  </Tooltip>
                  <Tooltip content="Pindah ke bawah">
                    <button
                      type="button"
                      disabled={idx === cl.bodyParagraphs.length - 1}
                      onClick={() =>
                        updateCV((d) => {
                          const target = ensureInitialized(d);
                          const temp = target.bodyParagraphs[idx + 1]!;
                          target.bodyParagraphs[idx + 1] = target.bodyParagraphs[idx]!;
                          target.bodyParagraphs[idx] = temp;
                          return d;
                        })
                      }
                      className="p-1 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted)] disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                  </Tooltip>
                  <Tooltip content="Hapus paragraf">
                    <button
                      type="button"
                      disabled={cl.bodyParagraphs.length <= 1}
                      onClick={() =>
                        updateCV((d) => {
                          const target = ensureInitialized(d);
                          target.bodyParagraphs.splice(idx, 1);
                          return d;
                        })
                      }
                      className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-red-600 disabled:opacity-40 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                  </Tooltip>
                </div>
              </div>
              <Textarea
                rows={4}
                value={para}
                onChange={(e) =>
                  updateCV((d) => {
                    const target = ensureInitialized(d);
                    target.bodyParagraphs[idx] = e.target.value;
                    return d;
                  })
                }
                placeholder="Uraikan pencapaian spesifik dengan metrik konkret yang relevan dengan kebutuhan perusahaan..."
                className="bg-[var(--surface)]"
              />
            </div>
          ))}
        </div>

        {/* Act 3: Closing & Sign-Off */}
        <div className="space-y-4 pt-2 border-t border-[var(--border)]">
          <div>
            <Label htmlFor="cl-closing">
              3. Paragraf Penutup & Call-to-Action Wawancara
            </Label>
            <Textarea
              id="cl-closing"
              rows={3}
              value={cl.closingParagraph}
              onChange={(e) =>
                updateCV((d) => {
                  const target = ensureInitialized(d);
                  target.closingParagraph = e.target.value;
                  return d;
                })
              }
              placeholder="Sampaikan apresiasi dan kesiapan untuk berdiskusi lebih lanjut dalam wawancara..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cl-signoff">Salam Penutup (Sign-Off)</Label>
              <Input
                id="cl-signoff"
                value={cl.signOff}
                onChange={(e) =>
                  updateCV((d) => {
                    const target = ensureInitialized(d);
                    target.signOff = e.target.value;
                    return d;
                  })
                }
                placeholder={isId ? 'Hormat saya,' : 'Sincerely,'}
              />
            </div>
            <div>
              <Label>Nama Penanda Tangan (Otomatis dari Header Pengirim)</Label>
              <Input value={cv.personalInfo.fullName} disabled className="opacity-75" />
            </div>
          </div>

          {/* Postscript / P.S. (Used in Simple Letter & Optional in Others) */}
          <div className="pt-2 border-t border-[var(--border)]">
            <Label htmlFor="cl-ps">
              Catatan Tambahan / Postscript (P.S.) — Digunakan pada Simple Letter Overleaf
            </Label>
            <Input
              id="cl-ps"
              value={cl.postscript || ''}
              onChange={(e) =>
                updateCV((d) => {
                  const target = ensureInitialized(d);
                  target.postscript = e.target.value;
                  return d;
                })
              }
              placeholder="Contoh: P.S. Portofolio lengkap dan kode sumber dapat diakses melalui tautan di atas."
            />
          </div>

          {/* Enclosures / Lampiran Berkas (Used in Cover Letter #1 ModernCV & Optional in Others) */}
          <div className="pt-3 border-t border-[var(--border)] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-[#9B86EC]" strokeWidth={2.5} />
                <div>
                  <Label className="mb-0">
                    Daftar Lampiran Berkas (\enclosure — Cover Letter #1 ModernCV)
                  </Label>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Daftar dokumen/sertifikat terlampir yang dirender di bagian bawah surat lamaran.
                  </p>
                </div>
              </div>
              <Badge variant="lavender">{(cl.enclosures || []).length} Lampiran</Badge>
            </div>

            <div className="flex gap-2">
              <Input
                value={newEnclosure}
                onChange={(e) => setNewEnclosure(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newEnclosure.trim()) {
                    e.preventDefault();
                    const val = newEnclosure.trim();
                    updateCV((d) => {
                      const target = ensureInitialized(d);
                      target.enclosures.push(val);
                      return d;
                    });
                    setNewEnclosure('');
                  }
                }}
                placeholder="Tambah item lampiran (mis. Ijazah & Transkrip Akademik S1/S2)..."
              />
              <Button
                type="button"
                variant="soft"
                onClick={() => {
                  if (!newEnclosure.trim()) return;
                  const val = newEnclosure.trim();
                  updateCV((d) => {
                    const target = ensureInitialized(d);
                    target.enclosures.push(val);
                    return d;
                  });
                  setNewEnclosure('');
                }}
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span>Tambah</span>
              </Button>
            </div>

            {(cl.enclosures || []).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(cl.enclosures || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs"
                  >
                    <span className="truncate">
                      <strong>{idx + 1}.</strong> {item}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateCV((d) => {
                          const target = ensureInitialized(d);
                          target.enclosures.splice(idx, 1);
                          return d;
                        })
                      }
                      className="text-[var(--muted-foreground)] hover:text-red-600 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
