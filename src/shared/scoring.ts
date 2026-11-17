import type { CVData } from './schema';

const ACTION_VERBS_ID = [
  'memimpin', 'mengembangkan', 'merancang', 'membangun', 'meningkatkan',
  'mengelola', 'mengoptimalkan', 'menganalisis', 'mengimplementasikan',
  'menciptakan', 'mengurangi', 'mempercepat', 'mengeksekusi', 'menyusun',
  'menginisiasi', 'mengkoordinasikan', 'menghasilkan', 'mengotomatisasi',
  'merestrukturisasi', 'menegosiasikan', 'memfasilitasi', 'mendirikan',
  'meluncurkan', 'menyelenggarakan', 'memodernisasi', 'mengintegrasikan',
  'mencapai', 'membimbing', 'mengawasi', 'mempublikasikan', 'meneliti',
];

const ACTION_VERBS_EN = [
  'led', 'developed', 'designed', 'built', 'increased', 'managed',
  'optimized', 'analyzed', 'implemented', 'created', 'reduced',
  'accelerated', 'executed', 'architected', 'initiated', 'coordinated',
  'generated', 'automated', 'restructured', 'negotiated', 'facilitated',
  'founded', 'launched', 'organized', 'modernized', 'integrated',
  'achieved', 'mentored', 'supervised', 'published', 'researched',
  'spearheaded', 'engineered', 'streamlined', 'delivered', 'scaled',
  'Collaborated'.toLowerCase(), 'orchestrated', 'pioneered', 'transformed',
];

export interface BulletAnalysis {
  startsWithActionVerb: boolean;
  hasMetric: boolean;
  isOptimalLength: boolean;
  score: number; // 0 to 3
  suggestions: string[];
}

export function analyzeBullet(text: string, lang: 'id' | 'en' = 'id'): BulletAnalysis {
  const cleaned = text.trim().replace(/^(\*\*|\*)+/, '').trim();
  if (!cleaned) {
    return {
      startsWithActionVerb: false,
      hasMetric: false,
      isOptimalLength: false,
      score: 0,
      suggestions: [
        lang === 'id'
          ? 'Tulis pencapaian konkret menggunakan format Kata Kerja Aksi + Konteks + Hasil Terukur.'
          : 'Write a concrete achievement using Action Verb + Context + Quantifiable Result.',
      ],
    };
  }

  const firstWord = cleaned.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '') ?? '';
  const allVerbs = new Set([...ACTION_VERBS_ID, ...ACTION_VERBS_EN]);
  // Also accept Indonesian prefixes me-/di-/ber- or English -ed verbs as heuristic fallback
  const startsWithActionVerb =
    allVerbs.has(firstWord) ||
    /^(me|meng|mem|men|meny|mer|mel)[a-z]{3,}$/.test(firstWord) ||
    /^[a-z]{3,}ed$/.test(firstWord);

  // Check for numbers, percentages, currency, multipliers (e.g., 25%, Rp, $, 3x, 10+)
  const hasMetric = /(\d+(\.\d+)?%|\b\d+\b|\$\d+|Rp\s?\d+|\d+x|\d+\+)/i.test(cleaned);

  const isOptimalLength = cleaned.length >= 45 && cleaned.length <= 220;

  const suggestions: string[] = [];
  if (!startsWithActionVerb) {
    suggestions.push(
      lang === 'id'
        ? 'Awali dengan kata kerja aksi kuat (mis. "Mengembangkan", "Meningkatkan", "Memimpin").'
        : 'Start with a strong action verb (e.g., "Spearheaded", "Engineered", "Increased").'
    );
  }
  if (!hasMetric) {
    suggestions.push(
      lang === 'id'
        ? 'Tambahkan angka/metrik dampak (mis. "+35% konversi", "efisiensi 12 jam/minggu", "50.000 pengguna").'
        : 'Add quantifiable metrics or impact numbers (e.g., "+35% conversion", "reduced latency by 40ms").'
    );
  }
  if (!isOptimalLength) {
    if (cleaned.length < 45) {
      suggestions.push(
        lang === 'id'
          ? 'Bullet terlalu pendek; jelaskan metode dan dampak hasil kerja Anda.'
          : 'Bullet is too brief; elaborate on how you achieved the outcome.'
      );
    } else {
      suggestions.push(
        lang === 'id'
          ? 'Bullet terlalu panjang (>220 karakter); pecah menjadi 2 poin agar mudah dipindai ATS & rekruter.'
          : 'Bullet is too long (>220 chars); split into two concise points for readability.'
      );
    }
  }

  const score =
    (startsWithActionVerb ? 1 : 0) +
    (hasMetric ? 1 : 0) +
    (isOptimalLength ? 1 : 0);

  return {
    startsWithActionVerb,
    hasMetric,
    isOptimalLength,
    score,
    suggestions,
  };
}

export interface CompletenessChecklistItem {
  id: string;
  section: string;
  label: string;
  completed: boolean;
  weight: number;
}

export interface CVCompletenessReport {
  score: number;
  checklist: CompletenessChecklistItem[];
  sectionStatus: Record<string, { completed: boolean; count: number }>;
}

export function calculateCVCompleteness(cv: CVData, uiLang: 'id' | 'en' = 'id'): CVCompletenessReport {
  const { personalInfo, summary, education, experience, leadership, projects, skills } = cv;

  const hasBasicIdentity = Boolean(
    personalInfo.fullName.trim() &&
    personalInfo.email.trim() &&
    personalInfo.phone.trim() &&
    personalInfo.location.trim()
  );

  const hasProfessionalLinks = Boolean(
    personalInfo.linkedin.trim() || personalInfo.github.trim() || personalInfo.portfolio.trim()
  );

  const hasSummary = summary.content.trim().length >= 60;
  const hasEducation = education.length > 0 && Boolean(education[0]?.institution.trim());
  const hasExperience = experience.length > 0 && Boolean(experience[0]?.company.trim());

  const allExpBullets = experience.flatMap((e) => e.bullets).filter((b) => b.trim().length > 0);
  const quantifiedBullets = allExpBullets.filter((b) => analyzeBullet(b, cv.settings.cvLanguage).hasMetric);
  const hasQuantifiedImpact = allExpBullets.length >= 2 && quantifiedBullets.length >= 1;

  const hasLeadershipOrProjects =
    (leadership.length > 0 && Boolean(leadership[0]?.organization.trim())) ||
    (projects.length > 0 && Boolean(projects[0]?.name.trim()));

  const hasSkills =
    skills.categories.some((c) => c.items.trim().length > 0) ||
    skills.languages.length > 0;

  const checklist: CompletenessChecklistItem[] = [
    {
      id: 'identity',
      section: 'personalInfo',
      label:
        uiLang === 'id'
          ? 'Data kontak lengkap (Nama, Email, Telepon, Lokasi)'
          : 'Complete contact details (Name, Email, Phone, Location)',
      completed: hasBasicIdentity,
      weight: 20,
    },
    {
      id: 'links',
      section: 'personalInfo',
      label:
        uiLang === 'id'
          ? 'Tautan profesional (LinkedIn / GitHub / Portofolio)'
          : 'Professional links (LinkedIn / GitHub / Portfolio)',
      completed: hasProfessionalLinks,
      weight: 10,
    },
    {
      id: 'education',
      section: 'education',
      label:
        uiLang === 'id'
          ? 'Minimal 1 riwayat Pendidikan formal'
          : 'At least 1 formal Education entry',
      completed: hasEducation,
      weight: 15,
    },
    {
      id: 'experience',
      section: 'experience',
      label:
        uiLang === 'id'
          ? 'Minimal 1 Pengalaman Kerja relevan'
          : 'At least 1 relevant Work Experience entry',
      completed: hasExperience,
      weight: 20,
    },
    {
      id: 'metrics',
      section: 'experience',
      label:
        uiLang === 'id'
          ? 'Bullet pengalaman memuat angka/metrik terukur (gaya Harvard OCS)'
          : 'Experience bullets include quantifiable metrics (Harvard OCS standard)',
      completed: hasQuantifiedImpact,
      weight: 15,
    },
    {
      id: 'leadership_projects',
      section: 'leadership',
      label:
        uiLang === 'id'
          ? 'Memiliki Kepemimpinan/Organisasi atau Proyek terpilih'
          : 'Includes Leadership/Activities or Selected Projects',
      completed: hasLeadershipOrProjects,
      weight: 10,
    },
    {
      id: 'skills',
      section: 'skills',
      label:
        uiLang === 'id'
          ? 'Daftar Keahlian teknis atau Bahasa terisi'
          : 'Technical Skills or Languages populated',
      completed: hasSkills,
      weight: 10,
    },
  ];

  const totalScore = checklist.reduce((acc, item) => acc + (item.completed ? item.weight : 0), 0);

  const hasCoverLetter = Boolean(
    cv.coverLetter &&
      (cv.coverLetter.openingParagraph?.trim().length > 20 ||
        cv.coverLetter.bodyParagraphs?.some((p) => p.trim().length > 20))
  );

  const sectionStatus: Record<string, { completed: boolean; count: number }> = {
    personalInfo: { completed: hasBasicIdentity, count: hasBasicIdentity ? 1 : 0 },
    summary: { completed: hasSummary, count: summary.content.trim() ? 1 : 0 },
    education: { completed: hasEducation, count: education.length },
    experience: { completed: hasExperience, count: experience.length },
    leadership: { completed: leadership.length > 0, count: leadership.length },
    projects: { completed: projects.length > 0, count: projects.length },
    awards: { completed: cv.awards.length > 0, count: cv.awards.length },
    certifications: { completed: cv.certifications.length > 0, count: cv.certifications.length },
    publications: { completed: cv.publications.length > 0, count: cv.publications.length },
    skills: { completed: hasSkills, count: skills.categories.length + skills.languages.length },
    custom: { completed: cv.customSections.length > 0, count: cv.customSections.length },
    coverLetter: {
      completed: hasCoverLetter,
      count: hasCoverLetter ? (cv.coverLetter.bodyParagraphs?.length || 1) + 2 : 0,
    },
  };

  return {
    score: Math.min(100, totalScore),
    checklist,
    sectionStatus,
  };
}
