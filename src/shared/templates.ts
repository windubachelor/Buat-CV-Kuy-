import {
  type CVData,
  DEFAULT_SECTION_ORDER,
  type HarvardLayoutSettings,
  type TemplatePreset,
} from './schema';

export type SampleCreationMode =
  | 'blank'
  | 'sample-id'
  | 'sample-en'
  | 'sample-academic'
  | 'sample-jakes'
  | 'sample-cover-letter-1'
  | 'sample-simple-letter';

export interface TemplatePresetMeta {
  id: TemplatePreset;
  category: 'harvard' | 'overleaf' | 'cover-letter';
  documentType: 'cv' | 'cover-letter';
  nameId: string;
  nameEn: string;
  badgeId: string;
  badgeEn: string;
  descId: string;
  descEn: string;
  bestForId: string;
  bestForEn: string;
  accentColor: string;
  sampleLang: 'id' | 'en';
  sampleMode: SampleCreationMode;
  latexMacros: string[];
  recommendedSettings: Partial<HarvardLayoutSettings>;
  previewHeaderRule: 'none' | 'single' | 'double';
}

export const TEMPLATE_PRESETS: TemplatePresetMeta[] = [
  {
    id: 'classic',
    category: 'harvard',
    documentType: 'cv',
    nameId: 'Harvard OCS Classic',
    nameEn: 'Harvard OCS Classic',
    badgeId: 'Standar Emas Korporat',
    badgeEn: 'Corporate Gold Standard',
    descId:
      'Format resmi Harvard Office of Career Services (OCS) dengan tipografi serif TeX Gyre Termes 11pt, small-caps header, dan hirarki dua baris yang sangat disukai rekruter MBB, perbankan, dan Big Tech.',
    descEn:
      'Official Harvard Office of Career Services (OCS) layout featuring 11pt TeX Gyre Termes serif typography, small-caps section headers, and crisp two-line entry hierarchy favored by MBB, finance, and Big Tech.',
    bestForId: 'Management Consulting, Corporate, Software Engineering, Fresh Graduate',
    bestForEn: 'Management Consulting, Corporate, Software Engineering, Recent Graduates',
    accentColor: '#B8A9F5',
    sampleLang: 'id',
    sampleMode: 'sample-id',
    latexMacros: ['tgtermes', '\\scshape\\bfseries', '\\titlerule'],
    recommendedSettings: {
      templatePreset: 'classic',
      fontFamily: 'tgtermes',
      fontSize: '11pt',
      margin: 'normal',
      sectionSpacing: 'normal',
      showLinksIcon: false,
    },
    previewHeaderRule: 'none',
  },
  {
    id: 'compact',
    category: 'harvard',
    documentType: 'cv',
    nameId: 'Harvard High-Density 1-Page',
    nameEn: 'Harvard High-Density 1-Page',
    badgeId: 'Maksimal 1 Halaman',
    badgeEn: 'Strict 1-Page Fit',
    descId:
      'Margin presisi 0.52 inci dengan spasi antar-entri rapat dan font Libertinus 10.5pt. Dirancang khusus bagi profesional berpengalaman (3–8 tahun) agar seluruh pencapaian muat dalam 1 halaman penuh tanpa terpotong.',
    descEn:
      'Precision 0.52-inch margins with tight vertical rhythm and 10.5pt Libertinus serif. Engineered for mid-to-senior professionals (3–8 years exp) to fit high-impact achievements cleanly onto a single page.',
    accentColor: '#BFEBD7',
    bestForId: 'Senior Engineer, Product Manager, Data Scientist, Career Switcher',
    bestForEn: 'Senior Engineers, Product Managers, Data Scientists, Career Switchers',
    sampleLang: 'en',
    sampleMode: 'sample-en',
    latexMacros: ['libertinus', 'margin=0.52in', 'itemsep=0.5pt'],
    recommendedSettings: {
      templatePreset: 'compact',
      fontFamily: 'libertinus',
      fontSize: '10.5pt',
      margin: 'narrow',
      sectionSpacing: 'compact',
      showLinksIcon: false,
    },
    previewHeaderRule: 'none',
  },
  {
    id: 'academic',
    category: 'harvard',
    documentType: 'cv',
    nameId: 'Harvard Academic & Research CV',
    nameEn: 'Harvard Academic & Research CV',
    badgeId: 'Riset & Beasiswa',
    badgeEn: 'Academic & Fellowship',
    descId:
      'Tipografi klasik EB Garamond dengan penekanan pada Pendidikan, Publikasi Ilmiah, Tesis, Beasiswa (LPDP/Fulbright/Chevening), dan Pengalaman Riset.',
    descEn:
      'Classical EB Garamond typography emphasizing Education, Peer-Reviewed Publications, Thesis work, Fellowships, and Research Appointments.',
    accentColor: '#BDE0FE',
    bestForId: 'Pendaftar S2/S3, LPDP/Chevening/Fulbright, Dosen, Peneliti R&D',
    bestForEn: 'Master/PhD Applicants, Fellowship Candidates, Researchers, Faculty',
    sampleLang: 'id',
    sampleMode: 'sample-academic',
    latexMacros: ['ebgaramond', '\\LARGE\\scshape', 'Publications'],
    recommendedSettings: {
      templatePreset: 'academic',
      fontFamily: 'ebgaramond',
      fontSize: '11pt',
      margin: 'normal',
      sectionSpacing: 'normal',
      showLinksIcon: false,
    },
    previewHeaderRule: 'none',
  },
  {
    id: 'jakes',
    category: 'overleaf',
    documentType: 'cv',
    nameId: "Jake's Resume — Overleaf SWE (sb2nov)",
    nameEn: "Jake's Resume — Overleaf SWE (sb2nov)",
    badgeId: 'Overleaf .tex · Tech #1',
    badgeEn: 'Overleaf #1 SWE Template',
    descId:
      'Integrasi langsung dari file jake_s_resume.tex (Jake Gutierrez / sb2nov). Menggunakan pemisah kontak vertikal ($|$), tautan bergaris bawah, format \\resumeProjectHeading (Nama Proyek | Tech Stack), dan margin rapat 0.45in.',
    descEn:
      'Direct integration of jake_s_resume.tex (Jake Gutierrez / sb2nov) featuring pipe-separated underlined contact links, \\resumeSubheading, and \\resumeProjectHeading.',
    accentColor: '#FFD3B6',
    bestForId: 'Software Engineer, Computer Science, Full-Stack/Backend, AI/ML Researcher',
    bestForEn: 'Software Engineers, CS Students, Full-Stack/Backend, AI/ML Researchers',
    sampleLang: 'en',
    sampleMode: 'sample-jakes',
    latexMacros: ['\\resumeSubheading', '\\resumeProjectHeading', '$|$ underlined links'],
    recommendedSettings: {
      templatePreset: 'jakes',
      paperSize: 'letter',
      fontFamily: 'tgtermes',
      fontSize: '10.5pt',
      margin: 'compact',
      sectionSpacing: 'compact',
      showLinksIcon: false,
      cvLanguage: 'en',
    },
    previewHeaderRule: 'none',
  },
  {
    id: 'cover_letter_1',
    category: 'cover-letter',
    documentType: 'cover-letter',
    nameId: 'Cover Letter #1 — ModernCV Classic + Lampiran (ID)',
    nameEn: 'Cover Letter #1 — ModernCV Classic + Enclosure (ID)',
    badgeId: 'Overleaf .tex · Surat Lamaran ID',
    badgeEn: 'Overleaf .tex · Cover Letter ID',
    descId:
      'Adaptasi langsung dari file cover_letter_1.tex (gaya ModernCV Classic — Dita Dwi Auliani) dalam Bahasa Indonesia. Dilengkapi blok Daftar Lampiran (Transkrip/Sertifikat/Berkas), Perihal tebal, dan poin-poin pengalaman mengajar/kerja.',
    descEn:
      'Adapted from cover_letter_1.tex (ModernCV Classic style — Dita Dwi Auliani) in formal Indonesian, featuring an itemized Enclosure (Lampiran) header block, bold Subject line, and bulleted experience.',
    accentColor: '#BFEBD7',
    bestForId: 'Lamaran Dosen/Akademisi, CPNS/BUMN, Korporat Formal, Beasiswa (Dengan Lampiran)',
    bestForEn: 'Lecturer/Faculty Applications, Formal Corporate, Government & Fellowships',
    sampleLang: 'id',
    sampleMode: 'sample-cover-letter-1',
    latexMacros: ['moderncv classic', '\\enclosure[Lampiran]', '\\makelettertitle'],
    recommendedSettings: {
      templatePreset: 'cover_letter_1',
      paperSize: 'a4',
      fontFamily: 'tgtermes',
      fontSize: '11pt',
      margin: 'normal',
      sectionSpacing: 'normal',
      cvLanguage: 'id',
    },
    previewHeaderRule: 'single',
  },
  {
    id: 'simple_letter',
    category: 'cover-letter',
    documentType: 'cover-letter',
    nameId: 'Simple Letter — Overleaf Standard Letter + P.S.',
    nameEn: 'Simple Letter — Overleaf Standard Letter + P.S.',
    badgeId: 'Overleaf .tex · Surat Formal',
    badgeEn: 'Overleaf .tex · Standard Letter',
    descId:
      'Adaptasi langsung dari file simple_letter.tex (\\documentclass[a4paper]{letter}). Menampilkan blok alamat pengirim di kanan atas, alamat tujuan di kiri, paragraf surat formal bersih, salam penutup, dan baris P.S. (Postscript).',
    descEn:
      'Direct adaptation of simple_letter.tex (\\documentclass[a4paper]{letter}) with top-right sender return address, recipient address block, clean formal paragraphs, signature, and P.S. postscript.',
    accentColor: '#BDE0FE',
    bestForId: 'Surat Pengantar Lamaran Kerja, Surat Rekomendasi, Korespondensi Resmi Eksekutif',
    bestForEn: 'Job Application Cover Letters, Executive Correspondence, Formal Letters',
    sampleLang: 'id',
    sampleMode: 'sample-simple-letter',
    latexMacros: ['\\documentclass{letter}', '\\longindentation=0pt', '\\ps Postscript'],
    recommendedSettings: {
      templatePreset: 'simple_letter',
      paperSize: 'a4',
      fontFamily: 'tgtermes',
      fontSize: '11pt',
      margin: 'normal',
      sectionSpacing: 'normal',
      cvLanguage: 'id',
    },
    previewHeaderRule: 'none',
  },
  {
    id: 'wharton',
    category: 'overleaf',
    documentType: 'cv',
    nameId: 'Wharton & Wall Street M&A Finance',
    nameEn: 'Wharton & Wall Street M&A Finance',
    badgeId: 'Overleaf Finance · Padat',
    badgeEn: 'Investment Banking & PE',
    descId:
      'Gaya resume LaTeX standar Wharton & Wall Street dengan garis pembatas penuh di bawah kop kontak, penulisan tanggal singkat, dan kepadatan tinggi untuk menonjolkan nilai transaksi & dampak finansial.',
    descEn:
      'Wharton & Wall Street M&A LaTeX layout featuring a full horizontal rule beneath the header contact block and high-density bullet formatting for deal metrics.',
    accentColor: '#FFF1B8',
    bestForId: 'Investment Banking, Private Equity, Corporate Finance, Analis Bisnis',
    bestForEn: 'Investment Banking, Private Equity, Corporate Finance, Business Analysts',
    sampleLang: 'en',
    sampleMode: 'sample-en',
    latexMacros: ['tgtermes 10pt', '\\hrule height 0.6pt', 'Compact Deal List'],
    recommendedSettings: {
      templatePreset: 'wharton',
      fontFamily: 'tgtermes',
      fontSize: '10pt',
      margin: 'narrow',
      sectionSpacing: 'compact',
      dateFormat: 'short',
      showLinksIcon: false,
    },
    previewHeaderRule: 'single',
  },
  {
    id: 'mckinsey',
    category: 'overleaf',
    documentType: 'cv',
    nameId: 'McKinsey & Executive Double-Rule',
    nameEn: 'McKinsey & Executive Double-Rule',
    badgeId: 'Overleaf Executive · MBB',
    badgeEn: 'Executive Consulting Style',
    descId:
      'Modifikasi template LaTeX eksekutif dengan aksen garis ganda (thick-thin rule) di bawah kop nama serta tipografi Libertinus 10.5pt yang tegas untuk peran kepemimpinan & konsultan manajemen.',
    descEn:
      'Modified executive LaTeX template with a classic thick-thin double rule under the header and sharp 10.5pt Libertinus serif typography for strategy & leadership.',
    accentColor: '#FFC8DD',
    bestForId: 'Management Consultant (MBB), Product Lead, Manajer Operasional, Eksekutif',
    bestForEn: 'Management Consultants (MBB), Product Leads, Operations Managers, Executives',
    sampleLang: 'en',
    sampleMode: 'sample-en',
    latexMacros: ['libertinus 10.5pt', '\\hrule 0.9pt + 0.4pt', 'Executive Header'],
    recommendedSettings: {
      templatePreset: 'mckinsey',
      fontFamily: 'libertinus',
      fontSize: '10.5pt',
      margin: 'narrow',
      sectionSpacing: 'normal',
      showLinksIcon: false,
    },
    previewHeaderRule: 'double',
  },
];

export function createSampleCVIndonesian(id = 'sample-harvard-id'): CVData {
  const now = new Date().toISOString();
  return {
    id,
    title: 'Bagaskara Pratama — Senior Software Engineer (Harvard Classic)',
    createdAt: now,
    updatedAt: now,
    exportCount: 2,
    personalInfo: {
      fullName: 'Bagaskara Adi Pratama',
      headline: 'Senior Backend & Distributed Systems Engineer',
      email: 'bagaskara.pratama@alumni.ui.ac.id',
      phone: '+62 812-8890-4412',
      location: 'Jakarta Selatan, Indonesia',
      linkedin: 'linkedin.com/in/bagaskarapratama',
      github: 'github.com/bagaskara-dev',
      portfolio: 'bagaskara.dev',
      customLinks: [],
    },
    summary: {
      content:
        'Software Engineer dengan pengalaman 5+ tahun membangun sistem pembayaran terdistribusi dan infrastruktur microservice berkinerja tinggi di Asia Tenggara. Terbukti memimpin migrasi arsitektur inti yang melayani **18 juta transaksi harian** dengan tingkat reliabilitas **99,995% SLA**.',
    },
    education: [
      {
        id: 'edu-1',
        institution: 'Universitas Indonesia',
        location: 'Depok, Indonesia',
        degree: 'Sarjana Ilmu Komputer (S.Kom.)',
        fieldOfStudy: 'Ilmu Komputer & Sistem Terdistribusi',
        startDate: '2016-08',
        endDate: '2020-07',
        isCurrent: false,
        gpa: '3.89 / 4.00',
        honors: 'Cum Laude, Lulusan Terbaik Fakultas Ilmu Komputer',
        coursework: 'Sistem Terdistribusi, Struktur Data & Algoritma, Keamanan Jaringan, Komputasi Awan',
        thesis: 'Optimasi Konsensus Raft pada Jaringan Berlatensi Variabel untuk Transaksi Finansial',
        bullets: [
          'Menerima Beasiswa Unggulan Kemendikbud RI selama 8 semester berturut-turut.',
          'Asisten Dosen tetap untuk mata kuliah Sistem Operasi dan Pemrograman Sistem (120+ mahasiswa).',
        ],
      },
    ],
    experience: [
      {
        id: 'exp-1',
        company: 'PT GoTo Gojek Tokopedia Tbk (GoPay)',
        location: 'Jakarta, Indonesia',
        position: 'Senior Software Engineer — Core Ledger Platform',
        startDate: '2022-04',
        endDate: '',
        isCurrent: true,
        bullets: [
          'Merancang dan mengimplementasikan mesin pencatatan transaksi (*double-entry ledger*) berbasis Go dan Apache Kafka yang memproses **18.500+ TPS** pada jam puncak dengan latensi p99 di bawah **28ms**.',
          'Memimpin tim beranggotakan 6 engineer dalam migrasi database monolitik ke PostgreSQL terpartisi tanpa waktu henti (*zero-downtime*), menurunkan biaya infrastruktur cloud sebesar **$145.000 per tahun (34%)**.',
          'Mengotomatisasi rekonsiliasi transaksi harian bersama 14 bank mitra menggunakan *idempotent worker pipeline*, memangkas waktu penyelesaian sengketa dari **3 hari menjadi 15 menit**.',
        ],
      },
      {
        id: 'exp-2',
        company: 'Traveloka',
        location: 'Tangerang, Indonesia',
        position: 'Software Engineer — Flight Search & Pricing Engine',
        startDate: '2020-08',
        endDate: '2022-03',
        isCurrent: false,
        bullets: [
          'Mengembangkan lapisan *distributed caching* multi-tier menggunakan Redis Cluster yang meningkatkan *cache hit ratio* dari **71% menjadi 94%** dan mempercepat waktu muat pencarian tiket sebesar **42%**.',
          'Membangun sistem deteksi anomali harga tiket *real-time* yang mencegah kerugian akibat kesalahan tarif maskapai hingga **Rp 1,8 miliar per kuartal**.',
          'Membimbing 4 *junior engineer* melalui tinjauan kode ketat dan sesi arsitektur mingguan, meningkatkan kecepatan pengiriman fitur tim sebesar **25%**.',
        ],
      },
    ],
    leadership: [
      {
        id: 'lead-1',
        organization: 'Komunitas Go Indonesia (Golang Jakarta)',
        location: 'Jakarta, Indonesia',
        role: 'Co-Organizer & Pembicara Teknis',
        startDate: '2021-01',
        endDate: '',
        isCurrent: true,
        bullets: [
          'Menyelenggarakan 18 sesi lokakarya dan *meetup* bulanan yang dihadiri rata-rata **250+ praktisi rekayasa perangkat lunak** dari berbagai perusahaan teknologi.',
          'Menginisiasi program bimbingan persiapan wawancara kerja gratis bagi **80+ lulusan baru**, dengan tingkat keberhasilan penempatan kerja **78%** dalam 4 bulan.',
        ],
      },
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'NusantaraKV — Distributed Key-Value Store',
        techStack: 'Go, Raft Consensus, gRPC, RocksDB, Docker',
        link: 'github.com/bagaskara-dev/nusantarakv',
        startDate: '2023-05',
        endDate: '2023-11',
        bullets: [
          'Membangun penyimpanan *key-value* terdistribusi tahan-bencana berbasis algoritma konsensus Raft yang meraih **1.200+ bintang di GitHub** dan mencapai *throughput* **85.000 operasi/detik**.',
        ],
      },
    ],
    awards: [
      {
        id: 'awd-1',
        title: 'Juara 1 Nasional Hackathon Finansial OJK & Bank Indonesia',
        issuer: 'Bank Indonesia',
        date: '2023-10',
        description: 'Menyusun purwarupa deteksi penipuan transaksi QRIS lintas-batas dari 340 tim peserta.',
      },
      {
        id: 'awd-2',
        title: 'Finalis ACM-ICPC Asia Jakarta Regional Contest',
        issuer: 'ACM International Collegiate Programming Contest',
        date: '2019-11',
        description: 'Peringkat 8 tim universitas terbaik tingkat nasional.',
      },
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'Google Cloud Professional Cloud Architect',
        issuer: 'Google Cloud',
        date: '2024-02',
        credentialId: 'GCP-PCA-992817',
        url: 'cloud.google.com/certification',
      },
      {
        id: 'cert-2',
        name: 'Certified Kubernetes Administrator (CKA)',
        issuer: 'Cloud Native Computing Foundation (CNCF)',
        date: '2023-06',
        credentialId: 'LF-CKA-441029',
        url: 'cncf.io/certification/cka',
      },
    ],
    publications: [
      {
        id: 'pub-1',
        title: 'Adaptive Quorum Reads in Geo-Distributed Financial Ledgers',
        authors: 'B. A. Pratama, R. Wijaya',
        venue: 'IEEE International Conference on Cloud Engineering (IC2E)',
        date: '2022-09',
        url: 'doi.org/10.1109/IC2E.2022.00042',
      },
    ],
    skills: {
      categories: [
        {
          id: 'sk-1',
          category: 'Bahasa Pemrograman',
          items: 'Go (Golang), TypeScript, Rust, Python, SQL, Java, Bash',
        },
        {
          id: 'sk-2',
          category: 'Infrastruktur & Data',
          items: 'PostgreSQL, Apache Kafka, Redis, Kubernetes, Docker, Terraform, Google Cloud Platform (GCP), AWS, Prometheus, Grafana',
        },
        {
          id: 'sk-3',
          category: 'Arsitektur & Metodologi',
          items: 'Microservices, Event-Driven Architecture, gRPC, RESTful API, High Availability, CI/CD, TDD',
        },
      ],
      languages: [
        { id: 'lg-1', language: 'Bahasa Indonesia', proficiency: 'Penutur Asli (Native)' },
        { id: 'lg-2', language: 'Bahasa Inggris', proficiency: 'Profesional Penuh (IELTS 8.0)' },
      ],
      interests: 'Lari Maraton (Finisher Borobudur Marathon 42K), Kontributor Open-Source, Fotografi Analog',
    },
    customSections: [],
    coverLetter: {
      enabled: true,
      date: '16 November 2026',
      recipientName: 'Komite Rekrutmen Rekayasa Perangkat Lunak',
      recipientTitle: 'VP of Engineering & Talent Acquisition',
      companyName: 'PT GoTo Gojek Tokopedia Tbk',
      companyAddress: 'Gedung Pasaraya Blok M, Jl. Iskandarsyah II No. 2, Jakarta Selatan',
      subjectLine: 'Lamaran Posisi Principal Backend & Distributed Systems Engineer',
      salutation: 'Yth. Bapak/Ibu Tim Rekrutmen GoTo Financial,',
      openingParagraph:
        'Melalui surat ini, saya menyampaikan ketertarikan mendalam untuk melamar posisi **Principal Backend & Distributed Systems Engineer** di PT GoTo Gojek Tokopedia Tbk. Dengan pengalaman lebih dari 5 tahun dalam merancang sistem buku besar transaksi (*double-entry ledger*) berkecepatan tinggi dan infrastruktur pembayaran skala Asia Tenggara, saya antusias untuk mendukung visi GoTo dalam menghadirkan layanan finansial yang andal bagi jutaan pengguna.',
      bodyParagraphs: [
        'Pada peran saya saat ini di GoPay Core Ledger Platform, saya memimpin perancangan arsitektur pemrosesan transaksi berbasis Go dan Apache Kafka yang menangani **18.500+ transaksi per detik (TPS)** pada jam puncak dengan latensi p99 di bawah **28ms**. Selain itu, saya mengkoordinasikan migrasi database monolitik ke PostgreSQL terpartisi tanpa waktu henti (*zero-downtime*) yang menghasilkan penghematan biaya infrastruktur cloud sebesar **$145.000 per tahun (34%)**.',
        'Sebelumnya di Traveloka, saya mengembangkan sistem *distributed caching* multi-tier menggunakan Redis Cluster yang meningkatkan *cache hit ratio* dari **71% menjadi 94%** serta membangun sistem deteksi anomali tarif *real-time* yang mengamankan pendapatan hingga **Rp 1,8 miliar per kuartal**. Kombinasi keahlian teknis mendalam dan kepemimpinan lintas-tim ini menyiapkan saya untuk langsung memberikan dampak terukur sejak hari pertama.',
      ],
      closingParagraph:
        'Saya sangat menghargai kesempatan untuk mendiskusikan bagaimana pengalaman saya dalam rekayasa sistem terdistribusi dan reliabilitas pembayaran dapat mendukung target ekspansi teknis tim Anda. Terima kasih atas waktu dan pertimbangan Bapak/Ibu.',
      signOff: 'Hormat saya,',
      enclosures: [],
      postscript: '',
    },
    sectionOrder: DEFAULT_SECTION_ORDER.map((item) =>
      item.key === 'publications' ? { ...item, visible: true } : item
    ),
    settings: {
      paperSize: 'a4',
      fontSize: '10.5pt',
      margin: 'narrow',
      sectionSpacing: 'compact',
      fontFamily: 'tgtermes',
      showLinksIcon: false,
      dateFormat: 'short',
      cvLanguage: 'id',
      templatePreset: 'classic',
    },
  };
}

export function createSampleCVEnglish(id = 'sample-harvard-en'): CVData {
  const now = new Date().toISOString();
  return {
    id,
    title: 'Clarissa Wijaya — Product Management & MBA (Harvard Compact)',
    createdAt: now,
    updatedAt: now,
    exportCount: 5,
    personalInfo: {
      fullName: 'Clarissa Nadine Wijaya',
      headline: 'Senior Product Manager — Fintech & AI Growth',
      email: 'cwijaya@mba2025.hbs.edu',
      phone: '+1 (617) 555-0194',
      location: 'Boston, MA / Singapore',
      linkedin: 'linkedin.com/in/clarissawijaya',
      github: '',
      portfolio: 'clarissawijaya.com',
      customLinks: [],
    },
    summary: {
      content:
        'Product Leader with 6+ years of experience scaling B2B2C fintech payment ecosystems and data-driven checkout products across APAC. Proven track record of growing annualized TPV by **$420M+** and leading cross-functional squads of 25+ engineers, designers, and data scientists.',
    },
    education: [
      {
        id: 'edu-en-1',
        institution: 'Harvard Business School',
        location: 'Boston, MA',
        degree: 'Master of Business Administration (MBA)',
        fieldOfStudy: 'Strategy & Technology Innovation',
        startDate: '2023-08',
        endDate: '2025-05',
        isCurrent: false,
        gpa: 'Baker Scholar Distinction (Top 5%)',
        honors: 'Fulbright Presidential Fellow, Co-President of Tech Club',
        coursework: 'Scaling Technology Ventures, Data Science for Managers, Corporate Finance',
        thesis: '',
        bullets: [
          'Selected as 1 of 12 Rock Center Summer Fellows to incubate an AI-assisted SME credit underwriting platform.',
        ],
      },
      {
        id: 'edu-en-2',
        institution: 'National University of Singapore (NUS)',
        location: 'Singapore',
        degree: 'Bachelor of Computing (Honours with Highest Distinction)',
        fieldOfStudy: 'Information Systems',
        startDate: '2014-08',
        endDate: '2018-05',
        isCurrent: false,
        gpa: '4.82 / 5.00',
        honors: 'ASEAN Undergraduate Scholar, Dean’s List (All Semesters)',
        coursework: '',
        thesis: '',
        bullets: [],
      },
    ],
    experience: [
      {
        id: 'exp-en-1',
        company: 'Stripe',
        location: 'Singapore',
        position: 'Senior Product Manager — APAC Local Payment Methods',
        startDate: '2021-02',
        endDate: '2023-07',
        isCurrent: false,
        bullets: [
          'Spearheaded end-to-end launch of real-time QR payment integrations (QRIS, PromptPay, PayNow) across 5 SEA markets, driving **$420M in net-new annualized TPV** within 12 months.',
          'Redesigned merchant onboarding and automated KYB verification flow using ML document extraction, reducing merchant activation turnaround from **5.2 days to 18 minutes (+64% conversion)**.',
          'Partnered with 18 enterprise merchants to pilot adaptive smart-retries for recurring subscriptions, recovering **$19.4M in involuntary churn** annually.',
        ],
      },
      {
        id: 'exp-en-2',
        company: 'McKinsey & Company',
        location: 'Jakarta & Singapore',
        position: 'Business Analyst -> Junior Engagement Manager (Digital Practice)',
        startDate: '2018-07',
        endDate: '2021-01',
        isCurrent: false,
        bullets: [
          'Directed a 14-week digital banking launch strategy for a Tier-1 Indonesian commercial bank, acquiring **1.4M retail depositors** within 6 months of rollout.',
          'Built a SKU-level dynamic pricing optimization model for a regional e-commerce marketplace, expanding gross margin by **310 bps ($28M EBITDA impact)**.',
        ],
      },
    ],
    leadership: [
      {
        id: 'lead-en-1',
        organization: 'Women in Product Southeast Asia',
        location: 'Singapore',
        role: 'Regional Chapter Lead',
        startDate: '2020-03',
        endDate: '2023-06',
        isCurrent: false,
        bullets: [
          'Scaled community membership from **400 to 3,200+ product practitioners** and organized an annual mentorship summit featuring 35 VP/CPO speakers.',
        ],
      },
    ],
    projects: [],
    awards: [
      {
        id: 'awd-en-1',
        title: 'Fulbright Master’s Degree Fellowship',
        issuer: 'AMINEF / U.S. Department of State',
        date: '2023-04',
        description: 'Full merit scholarship awarded to top 0.5% of national applicants.',
      },
    ],
    certifications: [],
    publications: [],
    skills: {
      categories: [
        {
          id: 'sk-en-1',
          category: 'Product & Analytics',
          items: 'SQL (BigQuery, Snowflake), Python (Pandas), Amplitude, Mixpanel, Figma, A/B Experimentation, Product Strategy, Financial Modeling',
        },
      ],
      languages: [
        { id: 'lg-en-1', language: 'English', proficiency: 'Native / Bilingual' },
        { id: 'lg-en-2', language: 'Indonesian', proficiency: 'Native' },
        { id: 'lg-en-3', language: 'Mandarin Chinese', proficiency: 'Conversational (HSK 4)' },
      ],
      interests: 'Specialty Coffee Roasting, Scuba Diving (PADI Rescue Diver), Classical Piano',
    },
    customSections: [],
    coverLetter: {
      enabled: true,
      date: 'November 16, 2026',
      recipientName: 'Product Management Hiring Committee',
      recipientTitle: 'Global Payments & Merchant Platform',
      companyName: 'Stripe, Inc.',
      companyAddress: '354 Oyster Point Blvd, South San Francisco, CA 94080',
      subjectLine: 'Application for Group Product Manager — Global Payment Methods',
      salutation: 'Dear Product Management Hiring Committee,',
      openingParagraph:
        'I am writing to express my strong enthusiasm for the **Group Product Manager — Global Payment Methods** role at Stripe. As an MBA graduate with Distinction (Baker Scholar) from Harvard Business School and a former Senior Product Manager at Stripe APAC, I bring over six years of experience scaling high-throughput payment rails and machine-learning-driven merchant onboarding products.',
      bodyParagraphs: [
        'During my tenure leading APAC Local Payment Methods at Stripe in Singapore, I spearheaded the end-to-end launch of real-time QR payment integrations across five Southeast Asian markets, generating **$420M in net-new annualized TPV** within 12 months. In parallel, I collaborated with risk and ML engineering teams to automate merchant KYB verification, cutting activation turnaround from **5.2 days to 18 minutes (+64% conversion)**.',
        'Prior to Stripe, as a Junior Engagement Manager at McKinsey & Company, I directed a digital banking launch that acquired **1.4M retail depositors** in six months and architected a dynamic pricing model delivering **$28M in incremental EBITDA**. This combination of strategic rigor and technical product execution enables me to align complex global regulatory requirements with frictionless merchant experiences.',
      ],
      closingParagraph:
        'I would welcome the opportunity to discuss how my background in cross-border payment orchestration and AI-assisted merchant growth can accelerate Stripe’s global roadmap. Thank you for your time and consideration.',
      signOff: 'Sincerely,',
      enclosures: [],
      postscript: '',
    },
    sectionOrder: DEFAULT_SECTION_ORDER,
    settings: {
      paperSize: 'letter',
      fontSize: '10.5pt',
      margin: 'narrow',
      sectionSpacing: 'compact',
      fontFamily: 'libertinus',
      showLinksIcon: false,
      dateFormat: 'short',
      cvLanguage: 'en',
      templatePreset: 'compact',
    },
  };
}

export function createSampleCVAcademic(id = 'sample-harvard-academic'): CVData {
  const sample = createSampleCVIndonesian(id);
  sample.title = 'Dr. Nadia Pramesti — Academic & LPDP/PhD Research CV';
  sample.personalInfo.fullName = 'Nadia Maharani Pramesti, M.Sc.';
  sample.personalInfo.headline = 'Peneliti Kecerdasan Buatan Biomedis & Komputasi Klinis';
  sample.personalInfo.email = 'nadia.pramesti@ugm.ac.id';
  sample.personalInfo.location = 'Yogyakarta, Indonesia';
  sample.settings = {
    paperSize: 'a4',
    fontSize: '11pt',
    margin: 'normal',
    sectionSpacing: 'normal',
    fontFamily: 'ebgaramond',
    showLinksIcon: false,
    dateFormat: 'long',
    cvLanguage: 'id',
    templatePreset: 'academic',
  };
  return sample;
}

export function createDefaultCoverLetter(cv: CVData) {
  const isId = cv.settings.cvLanguage === 'id';
  const role = cv.personalInfo.headline || (isId ? 'Posisi Profesional' : 'Target Role');
  const firstCompany =
    cv.experience[0]?.company || (isId ? 'Perusahaan Sebelumnya' : 'Previous Organization');
  const firstEdu = cv.education[0]?.institution || (isId ? 'Universitas' : 'University');

  if (isId) {
    return {
      enabled: true,
      date: '17 November 2026',
      recipientName: 'Tim Rekrutmen & Akuisisi Talenta',
      recipientTitle: 'Divisi Sumber Daya Manusia',
      companyName: 'Nama Perusahaan Tujuan',
      companyAddress: 'Jakarta, Indonesia',
      subjectLine: `Lamaran Posisi ${role}`,
      salutation: 'Yth. Bapak/Ibu Tim Rekrutmen,',
      openingParagraph: `Melalui surat ini, saya bermaksud mengajukan lamaran untuk posisi **${role}**. Sebagai lulusan **${firstEdu}** dengan pengalaman profesional di **${firstCompany}**, saya memiliki rekam jejak terukur dalam mengeksekusi proyek strategis dan meningkatkan efisiensi operasional secara konsisten.`,
      bodyParagraphs: [
        `Dalam peran terakhir saya di ${firstCompany}, saya berfokus pada pengembangan solusi yang berorientasi pada dampak nyata dan kolaborasi lintas fungsi. Saya terbiasa menerjemahkan kebutuhan bisnis yang kompleks menjadi langkah eksekusi terstruktur dengan indikator kinerja utama (KPI) yang jelas.`,
        'Saya sangat mengagumi komitmen perusahaan Bapak/Ibu terhadap inovasi dan keunggulan operasional. Dengan perpaduan kompetensi teknis, kemampuan analitis, dan kepemimpinan tim yang saya miliki, saya yakin dapat memberikan kontribusi positif sejak hari pertama bergabung.',
      ],
      closingParagraph:
        'Sebagai bahan pertimbangan, bersama surat ini saya lampirkan Resume/CV standar Harvard OCS saya. Saya sangat mengharapkan kesempatan wawancara untuk mendiskusikan lebih lanjut bagaimana kualifikasi saya dapat mendukung target tim Bapak/Ibu. Terima kasih atas waktu dan perhatiannya.',
      signOff: 'Hormat saya,',
      enclosures: [
        '1. Ijazah & Transkrip Nilai Akademik',
        '2. Curriculum Vitae (CV) Terbaru',
        '3. Sertifikat Kompetensi & Pelatihan',
        '4. Portofolio & Dokumen Pendukung',
      ],
      postscript: '',
    };
  }

  return {
    enabled: true,
    date: 'November 17, 2026',
    recipientName: 'Hiring Committee',
    recipientTitle: 'Talent Acquisition Team',
    companyName: 'Target Company Name',
    companyAddress: 'Singapore / Remote',
    subjectLine: `Application for ${role}`,
    salutation: 'Dear Hiring Manager,',
    openingParagraph: `I am writing to express my strong interest in the **${role}** position. With an academic foundation from **${firstEdu}** and hands-on professional experience at **${firstCompany}**, I have consistently delivered measurable business outcomes and high-impact execution.`,
    bodyParagraphs: [
      `In my recent role at ${firstCompany}, I spearheaded key initiatives that improved operational efficiency and cross-functional delivery. I thrive in data-driven environments where rigorous problem-solving and clear stakeholder communication directly accelerate product and organizational goals.`,
      'I have closely followed your organization’s growth and commitment to excellence. My combination of technical depth, analytical rigor, and collaborative leadership positions me well to contribute immediately to your team’s objectives.',
    ],
    closingParagraph:
      'Enclosed is my resume detailing my qualifications and achievements. I would welcome the opportunity to discuss how my background aligns with your team’s needs. Thank you very much for your time and consideration.',
    signOff: 'Sincerely,',
    enclosures: [
      '1. Academic Transcripts & Degree Certificates',
      '2. Updated Curriculum Vitae (Resume)',
      '3. Professional Certifications',
    ],
    postscript: '',
  };
}

export function createBlankCV(id: string, lang: 'id' | 'en' = 'id'): CVData {
  const now = new Date().toISOString();
  const base: CVData = {
    id,
    title: lang === 'id' ? 'CV Harvard Baru Tanpa Judul' : 'Untitled Harvard Resume',
    createdAt: now,
    updatedAt: now,
    exportCount: 0,
    personalInfo: {
      fullName: lang === 'id' ? 'Nama Lengkap Anda' : 'Your Full Name',
      headline: lang === 'id' ? 'Judul Profesi / Spesialisasi Utama' : 'Professional Headline / Role',
      email: 'nama@email.com',
      phone: '+62 812-0000-0000',
      location: lang === 'id' ? 'Jakarta, Indonesia' : 'Jakarta, Indonesia',
      linkedin: 'linkedin.com/in/username',
      github: '',
      portfolio: '',
      customLinks: [],
    },
    summary: {
      content: '',
    },
    education: [
      {
        id: `edu-${Date.now()}`,
        institution: lang === 'id' ? 'Nama Universitas / Institusi' : 'University Name',
        location: lang === 'id' ? 'Kota, Negara' : 'City, Country',
        degree: lang === 'id' ? 'Sarjana (S1)' : 'Bachelor of Science',
        fieldOfStudy: lang === 'id' ? 'Program Studi' : 'Major / Field of Study',
        startDate: '2020-08',
        endDate: '2024-07',
        isCurrent: false,
        gpa: '3.85 / 4.00',
        honors: 'Cum Laude',
        coursework: '',
        thesis: '',
        bullets: [],
      },
    ],
    experience: [
      {
        id: `exp-${Date.now()}`,
        company: lang === 'id' ? 'Nama Perusahaan' : 'Company Name',
        location: lang === 'id' ? 'Jakarta, Indonesia' : 'City, Country',
        position: lang === 'id' ? 'Posisi / Jabatan' : 'Job Title',
        startDate: '2024-08',
        endDate: '',
        isCurrent: true,
        bullets: [
          lang === 'id'
            ? 'Mengembangkan fitur baru yang meningkatkan efisiensi operasional tim sebesar **30%** dalam 3 bulan.'
            : 'Developed core product workflows that increased operational efficiency by **30%** within 3 months.',
        ],
      },
    ],
    leadership: [],
    projects: [],
    awards: [],
    certifications: [],
    publications: [],
    skills: {
      categories: [
        {
          id: `sk-${Date.now()}`,
          category: lang === 'id' ? 'Keahlian Teknis' : 'Technical Skills',
          items: 'Python, SQL, TypeScript, Data Analysis, Project Management',
        },
      ],
      languages: [
        {
          id: `lg-${Date.now()}`,
          language: lang === 'id' ? 'Bahasa Indonesia' : 'Indonesian',
          proficiency: lang === 'id' ? 'Penutur Asli' : 'Native',
        },
        {
          id: `lg-${Date.now() + 1}`,
          language: lang === 'id' ? 'Bahasa Inggris' : 'English',
          proficiency: lang === 'id' ? 'Profesional' : 'Fluent',
        },
      ],
      interests: '',
    },
    customSections: [],
    coverLetter: {
      enabled: true,
      date: '',
      recipientName: '',
      recipientTitle: '',
      companyName: '',
      companyAddress: '',
      subjectLine: '',
      salutation: '',
      openingParagraph: '',
      bodyParagraphs: [],
      closingParagraph: '',
      signOff: '',
      enclosures: [],
      postscript: '',
    },
    sectionOrder: DEFAULT_SECTION_ORDER,
    settings: {
      paperSize: 'a4',
      fontSize: '11pt',
      margin: 'normal',
      sectionSpacing: 'normal',
      fontFamily: 'tgtermes',
      showLinksIcon: false,
      dateFormat: 'short',
      cvLanguage: lang,
      templatePreset: 'classic',
    },
  };
  base.coverLetter = createDefaultCoverLetter(base);
  return base;
}

/**
 * Sample 4: Jake's Resume (Direct adaptation of attached jake_s_resume.tex by Jake Gutierrez / sb2nov)
 */
export function createSampleJakesResume(id = 'sample-jakes-resume'): CVData {
  const now = new Date().toISOString();
  const cv: CVData = {
    id,
    title: "Jake Ryan — Software Engineer (Jake's Resume Overleaf)",
    createdAt: now,
    updatedAt: now,
    exportCount: 1,
    personalInfo: {
      fullName: 'Jake Ryan',
      headline: '',
      email: 'jake@su.edu',
      phone: '123-456-7890',
      location: 'Georgetown, TX',
      linkedin: 'linkedin.com/in/jake',
      github: 'github.com/jake',
      portfolio: '',
      customLinks: [],
    },
    summary: {
      content: '',
    },
    education: [
      {
        id: 'jakes-edu-1',
        institution: 'Southwestern University',
        location: 'Georgetown, TX',
        degree: 'Bachelor of Arts in Computer Science',
        fieldOfStudy: 'Minor in Business',
        startDate: '2018-08',
        endDate: '2021-05',
        isCurrent: false,
        gpa: '',
        honors: '',
        coursework: '',
        thesis: '',
        bullets: [],
      },
      {
        id: 'jakes-edu-2',
        institution: 'Blinn College',
        location: 'Bryan, TX',
        degree: "Associate's in Liberal Arts",
        fieldOfStudy: '',
        startDate: '2014-08',
        endDate: '2018-05',
        isCurrent: false,
        gpa: '',
        honors: '',
        coursework: '',
        thesis: '',
        bullets: [],
      },
    ],
    experience: [
      {
        id: 'jakes-exp-1',
        company: 'Texas A&M University',
        location: 'College Station, TX',
        position: 'Undergraduate Research Assistant',
        startDate: '2020-06',
        endDate: '',
        isCurrent: true,
        bullets: [
          'Developed a REST API using **FastAPI** and **PostgreSQL** to store data from learning management systems.',
          'Developed a full-stack web application using **Flask, React, PostgreSQL and Docker** to analyze GitHub data.',
          'Explored ways to visualize GitHub collaboration in a classroom setting.',
        ],
      },
      {
        id: 'jakes-exp-2',
        company: 'Southwestern University',
        location: 'Georgetown, TX',
        position: 'Information Technology Support Specialist',
        startDate: '2018-09',
        endDate: '',
        isCurrent: true,
        bullets: [
          'Communicate with managers to set up campus computers used on campus.',
          'Assess and troubleshoot computer problems brought by students, faculty and staff.',
          'Maintain upkeep of computers, classroom equipment, and **200 printers** across campus.',
        ],
      },
      {
        id: 'jakes-exp-3',
        company: 'Southwestern University',
        location: 'Georgetown, TX',
        position: 'Artificial Intelligence Research Assistant',
        startDate: '2019-05',
        endDate: '2019-07',
        isCurrent: false,
        bullets: [
          'Explored methods to generate video game dungeons based off of *The Legend of Zelda*.',
          'Developed a game in **Java** to test the generated dungeons and contributed **50K+ lines of code** via Git.',
          'Conducted a human subject study to determine which video game dungeon generation technique is enjoyable.',
          'Wrote an 8-page paper and presented virtually to the **World Conference on Computational Intelligence**.',
        ],
      },
    ],
    leadership: [],
    projects: [
      {
        id: 'jakes-proj-1',
        name: 'Gitlytics',
        techStack: 'Python, Flask, React, PostgreSQL, Docker',
        link: 'github.com/jake/gitlytics',
        startDate: '2020-06',
        endDate: 'Present',
        bullets: [
          'Developed a full-stack web application using Flask serving a REST API with React as the frontend.',
          'Implemented GitHub OAuth to get data from user repositories and visualized GitHub collaboration.',
          'Used **Celery and Redis** for asynchronous tasks.',
        ],
      },
      {
        id: 'jakes-proj-2',
        name: 'Simple Paintball',
        techStack: 'Spigot API, Java, Maven, TravisCI, Git',
        link: 'github.com/jake/simple-paintball',
        startDate: '2018-05',
        endDate: '2020-05',
        bullets: [
          'Developed a Minecraft server plugin to entertain kids during free time for a previous job.',
          'Published plugin to websites gaining **2K+ downloads** and an average **4.5/5-star review**.',
          'Implemented continuous delivery using TravisCI to build the plugin upon a new release.',
        ],
      },
    ],
    awards: [],
    certifications: [],
    publications: [],
    skills: {
      categories: [
        {
          id: 'jakes-sk-1',
          category: 'Languages',
          items: 'Java, Python, C/C++, SQL (Postgres), JavaScript, HTML/CSS, R',
        },
        {
          id: 'jakes-sk-2',
          category: 'Frameworks',
          items: 'React, Node.js, Flask, JUnit, WordPress, Material-UI, FastAPI',
        },
        {
          id: 'jakes-sk-3',
          category: 'Developer Tools',
          items: 'Git, Docker, TravisCI, Google Cloud Platform, VS Code, Visual Studio, PyCharm, IntelliJ, Eclipse',
        },
        {
          id: 'jakes-sk-4',
          category: 'Libraries',
          items: 'pandas, NumPy, Matplotlib',
        },
      ],
      languages: [],
      interests: '',
    },
    customSections: [],
    coverLetter: {
      enabled: false,
      date: 'November 17, 2026',
      recipientName: 'Software Engineering Hiring Committee',
      recipientTitle: 'Engineering Recruiting',
      companyName: 'Tech Corp',
      companyAddress: 'San Francisco, CA',
      subjectLine: 'Application for Software Engineer',
      salutation: 'Dear Hiring Manager,',
      openingParagraph:
        'I am writing to apply for the Software Engineer role. As a Computer Science undergraduate with full-stack and research experience, I am eager to contribute to your engineering team.',
      bodyParagraphs: [
        'I have developed full-stack web applications using Flask, React, PostgreSQL, and Docker, and explored methods to generate video game dungeons in Java.',
      ],
      closingParagraph:
        'Thank you for your time and consideration. I look forward to speaking with you.',
      signOff: 'Sincerely,',
      enclosures: [],
      postscript: '',
    },
    sectionOrder: [
      { key: 'summary', visible: false },
      { key: 'education', visible: true },
      { key: 'experience', visible: true },
      { key: 'projects', visible: true },
      { key: 'skills', visible: true },
      { key: 'leadership', visible: false },
      { key: 'awards', visible: false },
      { key: 'certifications', visible: false },
      { key: 'publications', visible: false },
      { key: 'custom', visible: false },
    ],
    settings: {
      paperSize: 'letter',
      fontSize: '10.5pt',
      margin: 'compact',
      sectionSpacing: 'compact',
      fontFamily: 'tgtermes',
      showLinksIcon: false,
      dateFormat: 'short',
      cvLanguage: 'en',
      templatePreset: 'jakes',
    },
  };
  cv.coverLetter = createDefaultCoverLetter(cv);
  return cv;
}

/**
 * Sample 5: Cover Letter #1 (Direct Indonesian adaptation of attached cover_letter_1.tex — Dita Dwi Auliani)
 */
export function createSampleCoverLetter1Indonesian(id = 'sample-cover-letter-1'): CVData {
  const base = createBlankCV(id, 'id');
  base.title = 'Dita Dwi Auliani — Cover Letter #1 (ModernCV Bahasa Indonesia)';
  base.personalInfo = {
    fullName: 'Dita Dwi Auliani',
    headline: 'Dosen Tamu & Pengajar Ilmu Komputer (Aplikasi Komputer)',
    email: 'dita.ars@gmail.com',
    phone: '+62 812-3456-7890',
    location: 'Jakarta Barat, DKI Jakarta, Indonesia',
    linkedin: 'linkedin.com/in/ditadwiauliani',
    github: '',
    portfolio: '',
    customLinks: [],
  };
  base.settings = {
    ...base.settings,
    templatePreset: 'cover_letter_1',
    cvLanguage: 'id',
    fontFamily: 'tgtermes',
    fontSize: '11pt',
    margin: 'normal',
    sectionSpacing: 'normal',
  };
  base.coverLetter = {
    enabled: true,
    date: '17 November 2026',
    recipientName: 'Ketua Program Studi / Dosen Penanggung Jawab',
    recipientTitle: 'Departemen Aplikasi Komputer & Ilmu Komputer',
    companyName: 'Universitas Indonesia',
    companyAddress: 'Kampus Baru UI Depok, Jawa Barat, Indonesia',
    subjectLine:
      'Lamaran untuk Posisi Dosen Tamu (Aplikasi Komputer) dengan Referensi Pengumuman: XXXX/XX, Tertanggal 04-03-2026',
    salutation: 'Dengan hormat,',
    openingParagraph:
      'Sehubungan dengan perihal yang tercantum di atas, saya **Dita Dwi Auliani**, bermaksud mengajukan permohonan lamaran untuk posisi Dosen Tamu tersebut. Saya memperoleh informasi mengenai pembukaan posisi ini melalui portal karir resmi dan pengumuman pada situs web universitas.',
    bodyParagraphs: [
      'Sebagai lulusan yang memiliki fondasi akademik kuat, saya siap mengampu dan menyusun materi perkuliahan pada mata kuliah **Pemrograman C, Struktur Data, Algoritma, Sistem Operasi, Elektronika Digital, Deep Learning & Jaringan Saraf Tiruan, Aplikasi Web, serta Rekayasa Perangkat Lunak**. Saya menerapkan pendekatan pengajaran yang komunikatif, sistematis, dan logis dalam memecahkan permasalahan mulai dari konsep dasar hingga solusi yang teroptimasi.',
      'Saya memiliki pengalaman dalam bidang pengajaran dan pembimbingan akademik (*teaching & mentoring*) sebagaimana tercantum di bawah ini:\n• Sebagai **Asisten Dosen (Teaching Assistant)** selama menempuh program Magister (S2) Ilmu Komputer.\n• Sebagai **Mentor** pada program pengembangan kepemimpinan digital "Going Online As Leader (GOAL)" yang diselenggarakan bekerja sama dengan Kementerian (2020 – 2021).\n• Sebagai **Pengajar Privat** untuk mata kuliah Matematika Komputasi dan Ilmu Komputer.',
      'Saya yakin bahwa kemampuan saya dalam mengelola kelas serta menjaga standar etika akademik yang tinggi sebagai pengajar akan memberikan manfaat nyata bagi institusi, serta berkontribusi positif terhadap pengembangan kompetensi mahasiswa.',
    ],
    closingParagraph:
      'Besar harapan saya untuk diberikan kesempatan mengabdi sebagai Dosen Tamu pada Departemen Aplikasi Komputer dan dipertimbangkan untuk posisi tersebut. Atas waktu dan perhatian Bapak/Ibu, saya ucapkan terima kasih.',
    signOff: 'Hormat saya,',
    enclosures: [
      '1. Ijazah & Transkrip Nilai SMA/Sederajat',
      '2. Ijazah & Transkrip Nilai Diploma',
      '3. Ijazah & Transkrip Nilai Sarjana (S1)',
      '4. Ijazah & Transkrip Nilai Magister (S2)',
      '5. Sertifikat Kompetensi Akademik (GATE)',
      '6. Sertifikat Kelayakan Dosen (SLET)',
      '7. Sertifikat Kualifikasi Nasional (NET)',
      '8. Surat Keterangan Domisili / Administrasi',
      '9. Bukti Identitas Resmi (KTP)',
      '10. Curriculum Vitae (Resume Lengkap)',
    ],
    postscript: '',
  };
  return base;
}

/**
 * Sample 6: Simple Formal Letter (Direct adaptation of attached simple_letter.tex)
 */
export function createSampleSimpleLetter(id = 'sample-simple-letter'): CVData {
  const base = createBlankCV(id, 'id');
  base.title = 'Simple Formal Letter — Surat Lamaran & Korespondensi Resmi';
  base.personalInfo = {
    fullName: 'Bagaskara Adi Pratama',
    headline: 'Senior Software Engineer',
    email: 'bagaskara.pratama@alumni.ui.ac.id',
    phone: '+62 812-8890-4412',
    location: 'Jl. Jenderal Sudirman Kav. 52-53, Jakarta Selatan 12190',
    linkedin: 'linkedin.com/in/bagaskarapratama',
    github: '',
    portfolio: '',
    customLinks: [],
  };
  base.settings = {
    ...base.settings,
    templatePreset: 'simple_letter',
    cvLanguage: 'id',
    fontFamily: 'tgtermes',
    fontSize: '11pt',
    margin: 'normal',
    sectionSpacing: 'normal',
  };
  base.coverLetter = {
    enabled: true,
    date: '17 November 2026',
    recipientName: 'Yth. Bapak/Ibu Pimpinan Rekrutmen',
    recipientTitle: 'Divisi Engineering & Produk Digital',
    companyName: 'PT GoTo Gojek Tokopedia Tbk',
    companyAddress: 'Gedung Pasaraya Blok M, Jl. Iskandarsyah II No. 2, Jakarta Selatan',
    subjectLine: 'Lamaran Posisi Principal Backend Engineer',
    salutation: 'Dengan hormat,',
    openingParagraph:
      'Melalui surat resmi ini, saya menyampaikan ketertarikan untuk bergabung sebagai **Principal Backend Engineer** di PT GoTo Gojek Tokopedia Tbk. Selama lebih dari lima tahun terakhir, saya berfokus merancang dan mengelola arsitektur layanan pembayaran bervolume tinggi dengan tingkat ketersediaan 99,995% SLA.',
    bodyParagraphs: [
      'Dalam peran saya saat ini, saya memimpin tim rekayasa lintas fungsi untuk memodernisasi sistem buku besar (*core ledger*) dan memangkas latensi transaksi secara signifikan. Pengalaman ini membekali saya dengan pemahaman mendalam mengenai keandalan sistem terdistribusi, keamanan finansial, serta efisiensi biaya infrastruktur awan.',
    ],
    closingParagraph:
      'Saya sangat menghargai kesempatan untuk berdiskusi lebih lanjut mengenai bagaimana pengalaman teknis dan kepemimpinan saya dapat mendukung peta jalan produk Bapak/Ibu. Terima kasih atas waktu dan pertimbangan yang diberikan.',
    signOff: 'Terima kasih dan hormat saya,',
    enclosures: [],
    postscript:
      'P.S. Portofolio arsitektur sistem dan kode sumber proyek terbuka saya dapat diakses langsung melalui github.com/bagaskara-dev.',
  };
  return base;
}


