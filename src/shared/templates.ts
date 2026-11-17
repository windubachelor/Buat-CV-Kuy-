import { type CVData, DEFAULT_SECTION_ORDER } from './schema';

export interface TemplatePresetMeta {
  id: 'classic' | 'compact' | 'academic';
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
}

export const TEMPLATE_PRESETS: TemplatePresetMeta[] = [
  {
    id: 'classic',
    nameId: 'Harvard OCS Classic',
    nameEn: 'Harvard OCS Classic',
    badgeId: 'Standar Emas Korporat',
    badgeEn: 'Corporate Gold Standard',
    descId:
      'Format resmi Harvard Office of Career Services (OCS) dengan tipografi serif TeX Gyre Termes 11pt, small-caps header, dan hirarki dua baris yang sangat disukai rekruter MBB, perbankan, dan Big Tech.',
    descEn:
      'Official Harvard Office of Career Services (OCS) layout featuring 11pt TeX Gyre Termes serif typography, small-caps section headers, and crisp two-line entry hierarchy favored by MBB, finance, and Big Tech.',
    bestForId: 'Management Consulting, Finance, Software Engineering, Fresh Graduate',
    bestForEn: 'Management Consulting, Finance, Software Engineering, Recent Graduates',
    accentColor: '#B8A9F5',
    sampleLang: 'id',
  },
  {
    id: 'compact',
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
  },
  {
    id: 'academic',
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
  const firstCompany = cv.experience[0]?.company || (isId ? 'Perusahaan Sebelumnya' : 'Previous Organization');
  const firstEdu = cv.education[0]?.institution || (isId ? 'Universitas' : 'University');

  if (isId) {
    return {
      enabled: true,
      date: '16 November 2026',
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
    };
  }

  return {
    enabled: true,
    date: 'November 16, 2026',
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

