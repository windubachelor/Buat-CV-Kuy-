// server.ts
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import fs3 from "fs";
import helmet from "helmet";
import path3 from "path";
import pino from "pino";

// src/server/compiler.ts
import { spawn } from "child_process";
import crypto from "crypto";
import fs2 from "fs";
import fsPromises from "fs/promises";
import { LRUCache } from "lru-cache";
import os from "os";
import PQueue from "p-queue";
import path2 from "path";
import { PDFDocument as PDFDocument2 } from "pdf-lib";

// src/shared/schema.ts
import { z } from "zod";
var CustomLinkSchema = z.object({
  id: z.string(),
  label: z.string().max(60),
  url: z.string().max(300)
});
var PersonalInfoSchema = z.object({
  fullName: z.string().min(1, "Nama lengkap wajib diisi").max(120),
  headline: z.string().max(160).default(""),
  email: z.string().max(120).default(""),
  phone: z.string().max(60).default(""),
  location: z.string().max(120).default(""),
  linkedin: z.string().max(250).default(""),
  github: z.string().max(250).default(""),
  portfolio: z.string().max(250).default(""),
  customLinks: z.array(CustomLinkSchema).default([])
});
var SummarySchema = z.object({
  content: z.string().max(1500).default("")
});
var EducationItemSchema = z.object({
  id: z.string(),
  institution: z.string().max(160),
  location: z.string().max(120).default(""),
  degree: z.string().max(160),
  fieldOfStudy: z.string().max(160).default(""),
  startDate: z.string().max(40).default(""),
  endDate: z.string().max(40).default(""),
  isCurrent: z.boolean().default(false),
  gpa: z.string().max(40).default(""),
  honors: z.string().max(200).default(""),
  coursework: z.string().max(400).default(""),
  thesis: z.string().max(300).default(""),
  bullets: z.array(z.string().max(600)).default([])
});
var ExperienceItemSchema = z.object({
  id: z.string(),
  company: z.string().max(160),
  location: z.string().max(120).default(""),
  position: z.string().max(160),
  startDate: z.string().max(40).default(""),
  endDate: z.string().max(40).default(""),
  isCurrent: z.boolean().default(false),
  bullets: z.array(z.string().max(600)).default([])
});
var LeadershipItemSchema = z.object({
  id: z.string(),
  organization: z.string().max(160),
  location: z.string().max(120).default(""),
  role: z.string().max(160),
  startDate: z.string().max(40).default(""),
  endDate: z.string().max(40).default(""),
  isCurrent: z.boolean().default(false),
  bullets: z.array(z.string().max(600)).default([])
});
var ProjectItemSchema = z.object({
  id: z.string(),
  name: z.string().max(160),
  techStack: z.string().max(240).default(""),
  link: z.string().max(300).default(""),
  startDate: z.string().max(40).default(""),
  endDate: z.string().max(40).default(""),
  bullets: z.array(z.string().max(600)).default([])
});
var AwardItemSchema = z.object({
  id: z.string(),
  title: z.string().max(180),
  issuer: z.string().max(160).default(""),
  date: z.string().max(40).default(""),
  description: z.string().max(400).default("")
});
var CertificationItemSchema = z.object({
  id: z.string(),
  name: z.string().max(180),
  issuer: z.string().max(160).default(""),
  date: z.string().max(40).default(""),
  credentialId: z.string().max(120).default(""),
  url: z.string().max(300).default("")
});
var PublicationItemSchema = z.object({
  id: z.string(),
  title: z.string().max(240),
  authors: z.string().max(240).default(""),
  venue: z.string().max(200).default(""),
  date: z.string().max(40).default(""),
  url: z.string().max(300).default("")
});
var SkillCategorySchema = z.object({
  id: z.string(),
  category: z.string().max(100),
  items: z.string().max(600)
});
var LanguageSkillSchema = z.object({
  id: z.string(),
  language: z.string().max(80),
  proficiency: z.string().max(80)
});
var SkillsSectionSchema = z.object({
  categories: z.array(SkillCategorySchema).default([]),
  languages: z.array(LanguageSkillSchema).default([]),
  interests: z.string().max(500).default("")
});
var CustomSectionEntrySchema = z.object({
  id: z.string(),
  title: z.string().max(160),
  subtitle: z.string().max(160).default(""),
  location: z.string().max(120).default(""),
  date: z.string().max(60).default(""),
  bullets: z.array(z.string().max(600)).default([])
});
var CustomSectionSchema = z.object({
  id: z.string(),
  sectionTitle: z.string().max(120),
  entries: z.array(CustomSectionEntrySchema).default([])
});
var SectionKeySchema = z.enum([
  "summary",
  "education",
  "experience",
  "leadership",
  "projects",
  "awards",
  "certifications",
  "publications",
  "skills",
  "custom"
]);
var SectionConfigItemSchema = z.object({
  key: SectionKeySchema,
  visible: z.boolean().default(true),
  customTitle: z.string().max(100).optional()
});
var TemplatePresetSchema = z.enum([
  "classic",
  "compact",
  "academic",
  "jakes",
  "wharton",
  "mckinsey",
  "cover_letter_1",
  "simple_letter"
]).default("classic");
function isCoverLetterTemplatePreset(preset) {
  return preset === "cover_letter_1" || preset === "simple_letter";
}
var HarvardLayoutSettingsSchema = z.object({
  paperSize: z.enum(["a4", "letter"]).default("a4"),
  fontSize: z.enum(["10pt", "10.5pt", "11pt", "11.5pt"]).default("11pt"),
  margin: z.enum(["normal", "narrow", "compact"]).default("normal"),
  sectionSpacing: z.enum(["compact", "normal", "relaxed"]).default("normal"),
  fontFamily: z.enum(["lmodern", "tgtermes", "libertinus", "ebgaramond"]).default("tgtermes"),
  showLinksIcon: z.boolean().default(false),
  dateFormat: z.enum(["short", "numeric", "long"]).default("short"),
  cvLanguage: z.enum(["id", "en"]).default("id"),
  templatePreset: TemplatePresetSchema
});
var DEFAULT_SECTION_ORDER = [
  { key: "summary", visible: true },
  { key: "education", visible: true },
  { key: "experience", visible: true },
  { key: "leadership", visible: true },
  { key: "projects", visible: true },
  { key: "awards", visible: true },
  { key: "certifications", visible: true },
  { key: "publications", visible: false },
  { key: "skills", visible: true },
  { key: "custom", visible: false }
];
var CoverLetterSchema = z.object({
  enabled: z.boolean().default(true),
  date: z.string().max(80).default(""),
  recipientName: z.string().max(140).default(""),
  recipientTitle: z.string().max(140).default(""),
  companyName: z.string().max(160).default(""),
  companyAddress: z.string().max(240).default(""),
  subjectLine: z.string().max(200).default(""),
  salutation: z.string().max(140).default(""),
  openingParagraph: z.string().max(1800).default(""),
  bodyParagraphs: z.array(z.string().max(2e3)).default([]),
  closingParagraph: z.string().max(1500).default(""),
  signOff: z.string().max(100).default(""),
  enclosures: z.array(z.string().max(300)).default([]),
  postscript: z.string().max(600).default("")
});
var DEFAULT_COVER_LETTER = {
  enabled: true,
  date: "",
  recipientName: "",
  recipientTitle: "",
  companyName: "",
  companyAddress: "",
  subjectLine: "",
  salutation: "",
  openingParagraph: "",
  bodyParagraphs: [],
  closingParagraph: "",
  signOff: "",
  enclosures: [],
  postscript: ""
};
var DocumentModeSchema = z.enum(["cv", "cover-letter", "combined"]).default("cv");
var CVDataSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(150),
  createdAt: z.string(),
  updatedAt: z.string(),
  exportCount: z.number().int().nonnegative().default(0),
  personalInfo: PersonalInfoSchema,
  summary: SummarySchema,
  education: z.array(EducationItemSchema).default([]),
  experience: z.array(ExperienceItemSchema).default([]),
  leadership: z.array(LeadershipItemSchema).default([]),
  projects: z.array(ProjectItemSchema).default([]),
  awards: z.array(AwardItemSchema).default([]),
  certifications: z.array(CertificationItemSchema).default([]),
  publications: z.array(PublicationItemSchema).default([]),
  skills: SkillsSectionSchema,
  customSections: z.array(CustomSectionSchema).default([]),
  coverLetter: CoverLetterSchema.default(DEFAULT_COVER_LETTER),
  sectionOrder: z.array(SectionConfigItemSchema).default(DEFAULT_SECTION_ORDER),
  settings: HarvardLayoutSettingsSchema
});
var CompileRequestSchema = z.object({
  cv: CVDataSchema,
  mode: DocumentModeSchema.optional().default("cv")
});

// src/shared/templates.ts
function createDefaultCoverLetter(cv) {
  const isId = cv.settings.cvLanguage === "id";
  const role = cv.personalInfo.headline || (isId ? "Posisi Profesional" : "Target Role");
  const firstCompany = cv.experience[0]?.company || (isId ? "Perusahaan Sebelumnya" : "Previous Organization");
  const firstEdu = cv.education[0]?.institution || (isId ? "Universitas" : "University");
  if (isId) {
    return {
      enabled: true,
      date: "17 November 2026",
      recipientName: "Tim Rekrutmen & Akuisisi Talenta",
      recipientTitle: "Divisi Sumber Daya Manusia",
      companyName: "Nama Perusahaan Tujuan",
      companyAddress: "Jakarta, Indonesia",
      subjectLine: `Lamaran Posisi ${role}`,
      salutation: "Yth. Bapak/Ibu Tim Rekrutmen,",
      openingParagraph: `Melalui surat ini, saya bermaksud mengajukan lamaran untuk posisi **${role}**. Sebagai lulusan **${firstEdu}** dengan pengalaman profesional di **${firstCompany}**, saya memiliki rekam jejak terukur dalam mengeksekusi proyek strategis dan meningkatkan efisiensi operasional secara konsisten.`,
      bodyParagraphs: [
        `Dalam peran terakhir saya di ${firstCompany}, saya berfokus pada pengembangan solusi yang berorientasi pada dampak nyata dan kolaborasi lintas fungsi. Saya terbiasa menerjemahkan kebutuhan bisnis yang kompleks menjadi langkah eksekusi terstruktur dengan indikator kinerja utama (KPI) yang jelas.`,
        "Saya sangat mengagumi komitmen perusahaan Bapak/Ibu terhadap inovasi dan keunggulan operasional. Dengan perpaduan kompetensi teknis, kemampuan analitis, dan kepemimpinan tim yang saya miliki, saya yakin dapat memberikan kontribusi positif sejak hari pertama bergabung."
      ],
      closingParagraph: "Sebagai bahan pertimbangan, bersama surat ini saya lampirkan Resume/CV standar Harvard OCS saya. Saya sangat mengharapkan kesempatan wawancara untuk mendiskusikan lebih lanjut bagaimana kualifikasi saya dapat mendukung target tim Bapak/Ibu. Terima kasih atas waktu dan perhatiannya.",
      signOff: "Hormat saya,",
      enclosures: [
        "1. Ijazah & Transkrip Nilai Akademik",
        "2. Curriculum Vitae (CV) Terbaru",
        "3. Sertifikat Kompetensi & Pelatihan",
        "4. Portofolio & Dokumen Pendukung"
      ],
      postscript: ""
    };
  }
  return {
    enabled: true,
    date: "November 17, 2026",
    recipientName: "Hiring Committee",
    recipientTitle: "Talent Acquisition Team",
    companyName: "Target Company Name",
    companyAddress: "Singapore / Remote",
    subjectLine: `Application for ${role}`,
    salutation: "Dear Hiring Manager,",
    openingParagraph: `I am writing to express my strong interest in the **${role}** position. With an academic foundation from **${firstEdu}** and hands-on professional experience at **${firstCompany}**, I have consistently delivered measurable business outcomes and high-impact execution.`,
    bodyParagraphs: [
      `In my recent role at ${firstCompany}, I spearheaded key initiatives that improved operational efficiency and cross-functional delivery. I thrive in data-driven environments where rigorous problem-solving and clear stakeholder communication directly accelerate product and organizational goals.`,
      "I have closely followed your organization\u2019s growth and commitment to excellence. My combination of technical depth, analytical rigor, and collaborative leadership positions me well to contribute immediately to your team\u2019s objectives."
    ],
    closingParagraph: "Enclosed is my resume detailing my qualifications and achievements. I would welcome the opportunity to discuss how my background aligns with your team\u2019s needs. Thank you very much for your time and consideration.",
    signOff: "Sincerely,",
    enclosures: [
      "1. Academic Transcripts & Degree Certificates",
      "2. Updated Curriculum Vitae (Resume)",
      "3. Professional Certifications"
    ],
    postscript: ""
  };
}

// src/server/latexEscape.ts
var FORBIDDEN_LATEX_PATTERNS = [
  /\\write18/i,
  /\\immediate/i,
  /\\input\b/i,
  /\\include\b/i,
  /\\openout\b/i,
  /\\openin\b/i,
  /\\read\b/i,
  /\\catcode\b/i,
  /\\csname\b/i,
  /\\makeatletter\b/i,
  /\\def\b/i,
  /\\edef\b/i,
  /\\gdef\b/i,
  /\\xdef\b/i,
  /\\loop\b/i
];
function containsForbiddenLatexCommands(raw) {
  return FORBIDDEN_LATEX_PATTERNS.some((pattern) => pattern.test(raw));
}
function normalizeUnicodeForLatex(input) {
  return input.replace(/[\u2018\u2019\u201A\u201B]/g, "'").replace(/[\u201C\u201D\u201E\u201F]/g, '"').replace(/\u2013/g, "--").replace(/\u2014/g, "---").replace(/\u2212/g, "-").replace(/\u2026/g, "...").replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, "-").replace(/\s*->\s*/g, " -- ").replace(/[\u00A0\u202F\u2007]/g, " ").replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/[\u{1F000}-\u{1FFFF}]/gu, "").replace(/[\u{2600}-\u{27BF}]/gu, "").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}
function escapeLatex(input, preserveEdges = false) {
  if (!input) return "";
  const normalized = normalizeUnicodeForLatex(String(input));
  let result = "";
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    switch (ch) {
      case "\\":
        result += "\\textbackslash{}";
        break;
      case "{":
        result += "\\{";
        break;
      case "}":
        result += "\\}";
        break;
      case "$":
        result += "\\$";
        break;
      case "&":
        result += "\\&";
        break;
      case "#":
        result += "\\#";
        break;
      case "^":
        result += "\\textasciicircum{}";
        break;
      case "_":
        result += "\\_";
        break;
      case "%":
        result += "\\%";
        break;
      case "~":
        result += "\\textasciitilde{}";
        break;
      case "<":
        result += "\\textless{}";
        break;
      case ">":
        result += "\\textgreater{}";
        break;
      case "|":
        result += "\\textbar{}";
        break;
      default:
        result += ch;
    }
  }
  const singleLine = result.replace(/\r?\n+/g, " ");
  return preserveEdges ? singleLine : singleLine.trim();
}
function sanitizeUrlLatex(rawUrl) {
  if (!rawUrl) return "";
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return "";
  }
  const withProtocol = /^https?:\/\/|^mailto:|^tel:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/[\s{}<>\\^~`"]/g, "").replace(/%/g, "\\%25").replace(/#/g, "\\#").replace(/&/g, "\\&");
}
function formatRichBulletLatex(input) {
  if (!input) return "";
  const normalized = normalizeUnicodeForLatex(String(input)).replace(/\r?\n+/g, " ").trim();
  if (!normalized) return "";
  const tokenRegex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let output = "";
  let match;
  while ((match = tokenRegex.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      output += escapeLatex(normalized.slice(lastIndex, match.index), true);
    }
    if (match[2] !== void 0 && match[3] !== void 0) {
      const label = escapeLatex(match[2], false);
      const safeUrl = sanitizeUrlLatex(match[3]);
      if (safeUrl) {
        output += `\\href{${safeUrl}}{\\underline{${label}}}`;
      } else {
        output += label;
      }
    } else if (match[4] !== void 0) {
      output += `\\textbf{${escapeLatex(match[4], false)}}`;
    } else if (match[5] !== void 0) {
      output += `\\textit{${escapeLatex(match[5], false)}}`;
    }
    lastIndex = tokenRegex.lastIndex;
  }
  if (lastIndex < normalized.length) {
    output += escapeLatex(normalized.slice(lastIndex), true);
  }
  return output.trim();
}

// src/server/latexBuilder.ts
var SECTION_LABELS = {
  id: {
    summary: "Ringkasan Profesional",
    education: "Pendidikan",
    experience: "Pengalaman Kerja",
    leadership: "Kepemimpinan & Organisasi",
    projects: "Proyek Terpilih",
    awards: "Penghargaan & Beasiswa",
    certifications: "Sertifikasi & Pelatihan",
    publications: "Publikasi",
    skills: "Keahlian & Minat",
    custom: "Informasi Tambahan"
  },
  en: {
    summary: "Professional Summary",
    education: "Education",
    experience: "Experience",
    leadership: "Leadership & Activities",
    projects: "Selected Projects",
    awards: "Honors & Awards",
    certifications: "Certifications & Training",
    publications: "Publications",
    skills: "Skills & Interests",
    custom: "Additional Information"
  }
};
var MONTHS_ID_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
var MONTHS_ID_LONG = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember"
];
var MONTHS_EN_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var MONTHS_EN_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
function formatCVDate(raw, format, lang) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const isoMatch = /^(\d{4})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    const year = isoMatch[1];
    const monthIndex = parseInt(isoMatch[2], 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      if (format === "numeric") {
        return `${String(monthIndex + 1).padStart(2, "0")}/${year}`;
      }
      if (format === "long") {
        return `${lang === "id" ? MONTHS_ID_LONG[monthIndex] : MONTHS_EN_LONG[monthIndex]} ${year}`;
      }
      return `${lang === "id" ? MONTHS_ID_SHORT[monthIndex] : MONTHS_EN_SHORT[monthIndex]} ${year}`;
    }
  }
  return escapeLatex(trimmed);
}
function formatDateRange(startDate, endDate, isCurrent, format, lang) {
  const start = formatCVDate(startDate, format, lang);
  const end = isCurrent ? lang === "id" ? "Sekarang" : "Present" : formatCVDate(endDate, format, lang);
  if (start && end) return `${start} -- ${end}`;
  return start || end || "";
}
function cleanDisplayUrl(rawUrl) {
  return rawUrl.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
}
function formatCoverLetterParagraphLatex(rawPara) {
  const lines = rawPara.split("\n").map((l) => l.trim()).filter(Boolean);
  const bulletLines = lines.filter((l) => /^[•\-*]\s+/.test(l));
  if (bulletLines.length === 0) {
    return `\\noindent ${formatRichBulletLatex(rawPara.trim())}\\par`;
  }
  const introLines = lines.filter((l) => !/^[•\-*]\s+/.test(l));
  const introBlock = introLines.length > 0 ? `\\noindent ${formatRichBulletLatex(introLines.join(" "))}\\par
\\vspace{3pt}
` : "";
  const itemsBlock = bulletLines.map((b) => `  \\item ${formatRichBulletLatex(b.replace(/^[•\-*]\s+/, ""))}`).join("\n");
  return `${introBlock}\\begin{itemize}
${itemsBlock}
\\end{itemize}`;
}
function buildCoverLetterBodyBlock(cv, headerSizeMacro, headerName, headlineLine, contactLine) {
  const rawCl = cv.coverLetter;
  const hasContent = Boolean(
    rawCl && (rawCl.openingParagraph?.trim() || rawCl.bodyParagraphs?.some((p) => p.trim()) || rawCl.closingParagraph?.trim())
  );
  const cl = hasContent ? rawCl : createDefaultCoverLetter(cv);
  const isId = cv.settings.cvLanguage === "id";
  const preset = cv.settings.templatePreset;
  const dateLine = escapeLatex(
    cl.date.trim() || (isId ? "17 November 2026" : "November 17, 2026")
  );
  const recipientLines = [];
  if (cl.recipientName.trim()) {
    recipientLines.push(`\\textbf{${escapeLatex(cl.recipientName.trim())}}`);
  }
  if (cl.recipientTitle.trim()) {
    recipientLines.push(`\\textit{${escapeLatex(cl.recipientTitle.trim())}}`);
  }
  if (cl.companyName.trim()) {
    recipientLines.push(escapeLatex(cl.companyName.trim()));
  }
  if (cl.companyAddress.trim()) {
    recipientLines.push(escapeLatex(cl.companyAddress.trim()));
  }
  const subjectPrefix = isId ? "Perihal:" : "Sub:";
  const cleanSubject = cl.subjectLine.trim();
  const hasPrefixAlready = cleanSubject.toLowerCase().startsWith("perihal:") || cleanSubject.toLowerCase().startsWith("sub:") || cleanSubject.toLowerCase().startsWith("re:");
  const subjectText = hasPrefixAlready ? escapeLatex(cleanSubject) : `${subjectPrefix} ${escapeLatex(cleanSubject)}`;
  const subjectBlock = cleanSubject ? `\\vspace{8pt}
\\noindent\\textbf{${subjectText}}\\par
` : "";
  const salutation = escapeLatex(
    cl.salutation.trim() || (isId ? "Dengan hormat," : "Dear Hiring Manager,")
  );
  const rawParagraphs = [];
  if (cl.openingParagraph.trim()) {
    rawParagraphs.push(cl.openingParagraph.trim());
  }
  for (const bodyP of cl.bodyParagraphs) {
    if (bodyP.trim()) {
      rawParagraphs.push(bodyP.trim());
    }
  }
  if (cl.closingParagraph.trim()) {
    rawParagraphs.push(cl.closingParagraph.trim());
  }
  const formattedParagraphs = rawParagraphs.map((p) => formatCoverLetterParagraphLatex(p)).join("\n\\vspace{8pt}\n");
  const signOff = escapeLatex(
    cl.signOff.trim() || (isId ? "Hormat saya," : "Sincerely,")
  );
  const enclosures = (cl.enclosures || []).map((e) => e.trim()).filter(Boolean);
  const enclosureBlock = enclosures.length > 0 ? `\\vspace{14pt}
\\noindent\\textbf{${isId ? "Lampiran (Berkas / Sertifikat Terlampir):" : "Enclosed (Marksheets / Certificates):"}}\\par
\\vspace{3pt}
{\\small
${enclosures.map((item) => `\\noindent ${escapeLatex(item)}\\par`).join("\n")}
}` : "";
  const postscriptBlock = cl.postscript?.trim() ? `\\vspace{12pt}
\\noindent\\textit{${escapeLatex(cl.postscript.trim())}}\\par` : "";
  if (preset === "cover_letter_1") {
    const senderRightLines = [
      `\\textbf{${headerName}}`,
      cv.personalInfo.location.trim() ? `\\textit{${escapeLatex(cv.personalInfo.location.trim())}}` : "",
      cv.personalInfo.phone.trim() ? `\\textit{${escapeLatex(cv.personalInfo.phone.trim())}}` : "",
      cv.personalInfo.email.trim() ? `\\textit{${escapeLatex(cv.personalInfo.email.trim())}}` : ""
    ].filter(Boolean);
    const italicRecipientLines = [
      cl.recipientName.trim() ? `\\textit{${escapeLatex(cl.recipientName.trim())}}` : "",
      cl.recipientTitle.trim() ? `\\textit{${escapeLatex(cl.recipientTitle.trim())}}` : "",
      cl.companyName.trim() ? `\\textit{${escapeLatex(cl.companyName.trim())}}` : "",
      cl.companyAddress.trim() ? `\\textit{${escapeLatex(cl.companyAddress.trim())}}` : ""
    ].filter(Boolean);
    const circleFormattedParagraphs = formattedParagraphs.replace(
      /\\begin\{itemize\}/g,
      "\\begin{itemize}[label=$\\circ$]"
    );
    return `% === SECTION: coverLetter ===
\\begin{flushright}
  ${senderRightLines.join("\\\\\n  ")}
\\end{flushright}
\\vspace{10pt}

\\noindent\\textbf{${isId ? "Kepada Yth." : "To"}} \\hfill ${dateLine}\\\\
${italicRecipientLines.join("\\\\\n")}\\par
${subjectBlock}\\vspace{10pt}
\\noindent ${salutation}\\par
\\vspace{8pt}
${circleFormattedParagraphs}
\\vspace{14pt}
\\noindent ${signOff}\\par
\\vspace{18pt}
\\noindent\\textbf{${headerName}}\\par
${enclosureBlock}
${postscriptBlock}`;
  }
  if (preset === "simple_letter") {
    const returnAddressLines = [
      `\\textbf{${headerName}}`,
      cv.personalInfo.location.trim() ? escapeLatex(cv.personalInfo.location.trim()) : "",
      [cv.personalInfo.phone.trim(), cv.personalInfo.email.trim()].filter(Boolean).map((s) => escapeLatex(s)).join(" $\\cdot$ ")
    ].filter(Boolean);
    return `% === SECTION: coverLetter ===
\\begin{flushright}
  ${returnAddressLines.join("\\\\\n  ")}\\\\[8pt]
  ${dateLine}
\\end{flushright}
\\vspace{8pt}

\\noindent ${recipientLines.join("\\\\\n")}\\par
${subjectBlock}\\vspace{12pt}
\\noindent ${salutation}\\par
\\vspace{8pt}
${formattedParagraphs}
\\vspace{16pt}
\\noindent ${signOff}\\par
\\vspace{22pt}
\\noindent\\textbf{${headerName}}\\par
${postscriptBlock}
${enclosureBlock}`;
  }
  return `% === SECTION: coverLetter ===
\\begin{center}
  {${headerSizeMacro}\\scshape\\bfseries ${headerName}}\\\\[3pt]
  ${headlineLine}{\\small ${contactLine}}
\\end{center}
\\vspace{2pt}
\\noindent\\rule{\\textwidth}{0.6pt}
\\vspace{12pt}

\\noindent ${dateLine}\\par
\\vspace{10pt}
\\noindent ${recipientLines.join("\\\\\n")}\\par
${subjectBlock}\\vspace{10pt}
\\noindent ${salutation}\\par
\\vspace{8pt}
${formattedParagraphs}
\\vspace{14pt}
\\noindent ${signOff}\\par
\\vspace{22pt}
\\noindent\\textbf{${headerName}}\\par
${enclosureBlock}
${postscriptBlock}`;
}
function buildHarvardLatex(cv, mode = "cv") {
  const { settings, personalInfo } = cv;
  const effectiveMode = isCoverLetterTemplatePreset(settings.templatePreset) && mode === "cv" ? "cover-letter" : mode;
  const lang = settings.cvLanguage;
  const dateFormat = settings.dateFormat;
  const paperOption = settings.paperSize === "letter" ? "letterpaper" : "a4paper";
  const baseDocFontPt = settings.fontSize === "10pt" || settings.fontSize === "10.5pt" ? "10pt" : "11pt";
  let marginIn = "0.72in";
  if (settings.margin === "compact" || settings.templatePreset === "jakes") {
    marginIn = "0.45in";
  } else if (settings.margin === "narrow" || settings.templatePreset === "compact" || settings.templatePreset === "wharton" || settings.templatePreset === "mckinsey") {
    marginIn = "0.52in";
  }
  let fontPackageLatex = "\\usepackage{tgtermes}";
  if (settings.fontFamily === "lmodern" || settings.templatePreset === "jakes" || settings.templatePreset === "cover_letter_1" || settings.templatePreset === "simple_letter") {
    fontPackageLatex = "\\usepackage{lmodern}";
  } else if (settings.fontFamily === "libertinus") {
    fontPackageLatex = "\\usepackage{libertinus}";
  } else if (settings.fontFamily === "ebgaramond") {
    fontPackageLatex = "\\usepackage{ebgaramond}";
  }
  const isCompact = settings.sectionSpacing === "compact" || settings.templatePreset === "compact" || settings.templatePreset === "jakes" || settings.templatePreset === "wharton";
  const isRelaxed = settings.sectionSpacing === "relaxed";
  const sectionBeforePt = isCompact ? "5pt" : isRelaxed ? "10pt" : "7pt";
  const sectionAfterPt = isCompact ? "3pt" : isRelaxed ? "6pt" : "4pt";
  const itemSepPt = isCompact ? "0.5pt" : isRelaxed ? "2pt" : "1pt";
  const topSepPt = isCompact ? "1pt" : isRelaxed ? "3pt" : "2pt";
  const entryGapPt = isCompact ? "3pt" : isRelaxed ? "6pt" : "4pt";
  let fontSizeAdjustment = "";
  if (settings.fontSize === "10.5pt") {
    fontSizeAdjustment = "\\fontsize{10.5}{12.4}\\selectfont";
  } else if (settings.fontSize === "11.5pt") {
    fontSizeAdjustment = "\\fontsize{11.5}{13.6}\\selectfont";
  }
  const contactParts = [];
  if (personalInfo.location.trim()) {
    contactParts.push(escapeLatex(personalInfo.location));
  }
  if (personalInfo.email.trim()) {
    const safeMail = sanitizeUrlLatex(`mailto:${personalInfo.email.trim()}`);
    const displayMail = escapeLatex(personalInfo.email.trim());
    contactParts.push(safeMail ? `\\href{${safeMail}}{${displayMail}}` : displayMail);
  }
  if (personalInfo.phone.trim()) {
    contactParts.push(escapeLatex(personalInfo.phone.trim()));
  }
  if (personalInfo.linkedin.trim()) {
    const safeUrl = sanitizeUrlLatex(personalInfo.linkedin);
    const display = escapeLatex(cleanDisplayUrl(personalInfo.linkedin));
    const prefix = settings.showLinksIcon ? "[in] " : "";
    contactParts.push(safeUrl ? `${prefix}\\href{${safeUrl}}{${display}}` : display);
  }
  if (personalInfo.github.trim()) {
    const safeUrl = sanitizeUrlLatex(personalInfo.github);
    const display = escapeLatex(cleanDisplayUrl(personalInfo.github));
    const prefix = settings.showLinksIcon ? "[gh] " : "";
    contactParts.push(safeUrl ? `${prefix}\\href{${safeUrl}}{${display}}` : display);
  }
  if (personalInfo.portfolio.trim()) {
    const safeUrl = sanitizeUrlLatex(personalInfo.portfolio);
    const display = escapeLatex(cleanDisplayUrl(personalInfo.portfolio));
    const prefix = settings.showLinksIcon ? "[web] " : "";
    contactParts.push(safeUrl ? `${prefix}\\href{${safeUrl}}{${display}}` : display);
  }
  for (const link of personalInfo.customLinks) {
    if (link.url.trim()) {
      const safeUrl = sanitizeUrlLatex(link.url);
      const display = escapeLatex(link.label.trim() || cleanDisplayUrl(link.url));
      contactParts.push(safeUrl ? `\\href{${safeUrl}}{${display}}` : display);
    }
  }
  const contactSeparator = settings.templatePreset === "jakes" ? " $|$ " : " \\enspace$\\cdot$\\enspace ";
  const contactLine = contactParts.join(contactSeparator);
  const headlineLine = personalInfo.headline.trim() ? `{\\normalsize\\textit{${escapeLatex(personalInfo.headline)}}}\\\\[2pt]
` : "";
  const renderedSections = [];
  for (const secConfig of cv.sectionOrder) {
    if (!secConfig.visible) continue;
    const key = secConfig.key;
    const sectionTitle = escapeLatex(
      secConfig.customTitle?.trim() || SECTION_LABELS[lang][key]
    );
    if (key === "summary") {
      const content = cv.summary.content.trim();
      if (!content) continue;
      renderedSections.push(
        `% === SECTION: summary ===
\\section*{${sectionTitle}}
${formatRichBulletLatex(content)}\\par\\vspace{2pt}`
      );
    }
    if (key === "education" && cv.education.length > 0) {
      const items = cv.education.filter((e) => e.institution.trim() || e.degree.trim()).map((edu) => {
        const inst = escapeLatex(edu.institution);
        const loc = escapeLatex(edu.location);
        const degParts = [];
        if (edu.degree.trim()) degParts.push(escapeLatex(edu.degree));
        if (edu.fieldOfStudy.trim()) {
          degParts.push(escapeLatex(edu.fieldOfStudy));
        }
        const degreeLine = degParts.join(", ");
        const dates = formatDateRange(
          edu.startDate,
          edu.endDate,
          edu.isCurrent,
          dateFormat,
          lang
        );
        const subBullets = [];
        const gpaHonors = [];
        if (edu.gpa.trim()) {
          gpaHonors.push(
            `${lang === "id" ? "IPK" : "GPA"}: \\textbf{${escapeLatex(edu.gpa)}}`
          );
        }
        if (edu.honors.trim()) {
          gpaHonors.push(escapeLatex(edu.honors));
        }
        if (gpaHonors.length > 0) {
          subBullets.push(gpaHonors.join(" $\\cdot$ "));
        }
        if (edu.coursework.trim()) {
          subBullets.push(
            `\\textit{${lang === "id" ? "Mata Kuliah Relevan" : "Relevant Coursework"}}: ${escapeLatex(edu.coursework)}`
          );
        }
        if (edu.thesis.trim()) {
          subBullets.push(
            `\\textit{${lang === "id" ? "Tesis/Skripsi" : "Thesis"}}: ${escapeLatex(edu.thesis)}`
          );
        }
        for (const b of edu.bullets) {
          if (b.trim()) subBullets.push(formatRichBulletLatex(b));
        }
        const bulletBlock = subBullets.length > 0 ? `
\\begin{itemize}
${subBullets.map((b) => `  \\item ${b}`).join("\n")}
\\end{itemize}` : "";
        return `\\entry{${inst}}{${loc}}{${degreeLine}}{${dates}}${bulletBlock}`;
      });
      if (items.length > 0) {
        renderedSections.push(
          `% === SECTION: education ===
\\section*{${sectionTitle}}
` + items.join(`
\\vspace{${entryGapPt}}
`)
        );
      }
    }
    if (key === "experience" && cv.experience.length > 0) {
      const items = cv.experience.filter((e) => e.company.trim() || e.position.trim()).map((exp) => {
        const comp = escapeLatex(exp.company);
        const loc = escapeLatex(exp.location);
        const pos = escapeLatex(exp.position);
        const dates = formatDateRange(
          exp.startDate,
          exp.endDate,
          exp.isCurrent,
          dateFormat,
          lang
        );
        const cleanBullets = exp.bullets.filter((b) => b.trim().length > 0);
        const bulletBlock = cleanBullets.length > 0 ? `
\\begin{itemize}
${cleanBullets.map((b) => `  \\item ${formatRichBulletLatex(b)}`).join("\n")}
\\end{itemize}` : "";
        return `\\entry{${comp}}{${loc}}{${pos}}{${dates}}${bulletBlock}`;
      });
      if (items.length > 0) {
        renderedSections.push(
          `% === SECTION: experience ===
\\section*{${sectionTitle}}
` + items.join(`
\\vspace{${entryGapPt}}
`)
        );
      }
    }
    if (key === "leadership" && cv.leadership.length > 0) {
      const items = cv.leadership.filter((l) => l.organization.trim() || l.role.trim()).map((lead) => {
        const org = escapeLatex(lead.organization);
        const loc = escapeLatex(lead.location);
        const role = escapeLatex(lead.role);
        const dates = formatDateRange(
          lead.startDate,
          lead.endDate,
          lead.isCurrent,
          dateFormat,
          lang
        );
        const cleanBullets = lead.bullets.filter((b) => b.trim().length > 0);
        const bulletBlock = cleanBullets.length > 0 ? `
\\begin{itemize}
${cleanBullets.map((b) => `  \\item ${formatRichBulletLatex(b)}`).join("\n")}
\\end{itemize}` : "";
        return `\\entry{${org}}{${loc}}{${role}}{${dates}}${bulletBlock}`;
      });
      if (items.length > 0) {
        renderedSections.push(
          `% === SECTION: leadership ===
\\section*{${sectionTitle}}
` + items.join(`
\\vspace{${entryGapPt}}
`)
        );
      }
    }
    if (key === "projects" && cv.projects.length > 0) {
      const items = cv.projects.filter((p) => p.name.trim()).map((proj) => {
        const name = escapeLatex(proj.name);
        const safeUrl = sanitizeUrlLatex(proj.link);
        const linkDisplay = proj.link.trim() ? safeUrl ? `\\href{${safeUrl}}{\\underline{${escapeLatex(cleanDisplayUrl(proj.link))}}}` : escapeLatex(proj.link) : "";
        const tech = proj.techStack.trim() ? escapeLatex(proj.techStack) : "";
        const dates = formatDateRange(
          proj.startDate,
          proj.endDate,
          false,
          dateFormat,
          lang
        );
        const cleanBullets = proj.bullets.filter((b) => b.trim().length > 0);
        const bulletBlock = cleanBullets.length > 0 ? `
\\begin{itemize}
${cleanBullets.map((b) => `  \\item ${formatRichBulletLatex(b)}`).join("\n")}
\\end{itemize}` : "";
        if (tech || dates) {
          return `\\entry{${name}}{${linkDisplay}}{${tech}}{${dates}}${bulletBlock}`;
        }
        return `\\textbf{${name}}${linkDisplay ? ` \\hfill ${linkDisplay}` : ""}\\par${bulletBlock}`;
      });
      if (items.length > 0) {
        renderedSections.push(
          `% === SECTION: projects ===
\\section*{${sectionTitle}}
` + items.join(`
\\vspace{${entryGapPt}}
`)
        );
      }
    }
    if (key === "awards" && cv.awards.length > 0) {
      const items = cv.awards.filter((a) => a.title.trim()).map((award) => {
        const title = escapeLatex(award.title);
        const issuer = award.issuer.trim() ? `, \\textit{${escapeLatex(award.issuer)}}` : "";
        const date = award.date.trim() ? formatCVDate(award.date, dateFormat, lang) : "";
        const desc = award.description.trim() ? ` -- ${formatRichBulletLatex(award.description)}` : "";
        return `\\textbf{${title}}${issuer}${desc}\\hfill ${date}\\par`;
      });
      if (items.length > 0) {
        renderedSections.push(
          `% === SECTION: awards ===
\\section*{${sectionTitle}}
` + items.join("\n\\vspace{2pt}\n")
        );
      }
    }
    if (key === "certifications" && cv.certifications.length > 0) {
      const items = cv.certifications.filter((c) => c.name.trim()).map((cert) => {
        const name = escapeLatex(cert.name);
        const issuer = cert.issuer.trim() ? ` -- \\textit{${escapeLatex(cert.issuer)}}` : "";
        const cred = cert.credentialId.trim() ? ` (${escapeLatex(cert.credentialId)})` : "";
        const safeUrl = sanitizeUrlLatex(cert.url);
        const titlePart = safeUrl ? `\\href{${safeUrl}}{\\textbf{${name}}}` : `\\textbf{${name}}`;
        const date = cert.date.trim() ? formatCVDate(cert.date, dateFormat, lang) : "";
        return `${titlePart}${issuer}${cred}\\hfill ${date}\\par`;
      });
      if (items.length > 0) {
        renderedSections.push(
          `% === SECTION: certifications ===
\\section*{${sectionTitle}}
` + items.join("\n\\vspace{2pt}\n")
        );
      }
    }
    if (key === "publications" && cv.publications.length > 0) {
      const items = cv.publications.filter((p) => p.title.trim()).map((pub) => {
        const title = escapeLatex(pub.title);
        const authors = pub.authors.trim() ? `${escapeLatex(pub.authors)}. ` : "";
        const venue = pub.venue.trim() ? `\\textit{${escapeLatex(pub.venue)}}` : "";
        const date = pub.date.trim() ? ` (${formatCVDate(pub.date, dateFormat, lang)})` : "";
        const safeUrl = sanitizeUrlLatex(pub.url);
        const quotedTitle = "``" + title + "''";
        const titleFormatted = safeUrl ? `\\href{${safeUrl}}{${quotedTitle}}` : quotedTitle;
        return `${authors}${titleFormatted}. ${venue}${date}.\\par`;
      });
      if (items.length > 0) {
        renderedSections.push(
          `% === SECTION: publications ===
\\section*{${sectionTitle}}
` + items.join("\n\\vspace{3pt}\n")
        );
      }
    }
    if (key === "skills") {
      const skillLines = [];
      for (const cat of cv.skills.categories) {
        if (cat.category.trim() && cat.items.trim()) {
          skillLines.push(
            `\\textbf{${escapeLatex(cat.category)}:} ${escapeLatex(cat.items)}`
          );
        }
      }
      if (cv.skills.languages.length > 0) {
        const langPairs = cv.skills.languages.filter((l) => l.language.trim()).map(
          (l) => l.proficiency.trim() ? `${escapeLatex(l.language)} (${escapeLatex(l.proficiency)})` : escapeLatex(l.language)
        );
        if (langPairs.length > 0) {
          skillLines.push(
            `\\textbf{${lang === "id" ? "Bahasa" : "Languages"}:} ${langPairs.join(", ")}`
          );
        }
      }
      if (cv.skills.interests.trim()) {
        skillLines.push(
          `\\textbf{${lang === "id" ? "Minat" : "Interests"}:} ${escapeLatex(cv.skills.interests)}`
        );
      }
      if (skillLines.length > 0) {
        renderedSections.push(
          `% === SECTION: skills ===
\\section*{${sectionTitle}}
` + skillLines.join("\\\\[2pt]\n")
        );
      }
    }
    if (key === "custom" && cv.customSections.length > 0) {
      for (const customSec of cv.customSections) {
        if (!customSec.sectionTitle.trim() || customSec.entries.length === 0) continue;
        const cTitle = escapeLatex(customSec.sectionTitle);
        const cEntries = customSec.entries.filter((e) => e.title.trim()).map((entry) => {
          const t = escapeLatex(entry.title);
          const loc = escapeLatex(entry.location);
          const sub = escapeLatex(entry.subtitle);
          const dt = escapeLatex(entry.date);
          const cleanBullets = entry.bullets.filter((b) => b.trim().length > 0);
          const bulletBlock = cleanBullets.length > 0 ? `
\\begin{itemize}
${cleanBullets.map((b) => `  \\item ${formatRichBulletLatex(b)}`).join("\n")}
\\end{itemize}` : "";
          if (sub || dt) {
            return `\\entry{${t}}{${loc}}{${sub}}{${dt}}${bulletBlock}`;
          }
          return `\\textbf{${t}}${loc ? `\\hfill\\textit{${loc}}` : ""}\\par${bulletBlock}`;
        });
        if (cEntries.length > 0) {
          renderedSections.push(
            `% === SECTION: custom ===
\\section*{${cTitle}}
` + cEntries.join(`
\\vspace{${entryGapPt}}
`)
          );
        }
      }
    }
  }
  const authorMeta = escapeLatex(personalInfo.fullName || "Candidate");
  const titleMeta = escapeLatex(cv.title || `${personalInfo.fullName} - Resume`);
  const headerName = escapeLatex(personalInfo.fullName || "NAMA LENGKAP");
  const headerSizeMacro = settings.templatePreset === "academic" ? "\\LARGE" : "\\Huge";
  let headerRuleLatex = "\\vspace{-2pt}";
  if (settings.templatePreset === "wharton") {
    headerRuleLatex = "\\vspace{1pt}\n\\noindent\\rule{\\textwidth}{0.6pt}\n\\vspace{-3pt}";
  } else if (settings.templatePreset === "mckinsey") {
    headerRuleLatex = "\\vspace{1pt}\n\\noindent\\rule{\\textwidth}{0.9pt}\\\\[-8.5pt]\n\\noindent\\rule{\\textwidth}{0.35pt}\n\\vspace{-2pt}";
  }
  const resumeBodyBlock = `% === SECTION: personalInfo ===
\\begin{center}
  {${headerSizeMacro}\\scshape\\bfseries ${headerName}}\\\\[3pt]
  ${headlineLine}{\\small ${contactLine}}
\\end{center}
${headerRuleLatex}
${renderedSections.join("\n\n")}`;
  const coverLetterBlock = buildCoverLetterBodyBlock(
    cv,
    headerSizeMacro,
    headerName,
    headlineLine,
    contactLine
  );
  let documentBody = resumeBodyBlock;
  if (effectiveMode === "cover-letter") {
    documentBody = coverLetterBlock;
  } else if (effectiveMode === "combined") {
    documentBody = `${coverLetterBlock}
\\newpage
${resumeBodyBlock}`;
  }
  return `\\documentclass[${baseDocFontPt},${paperOption}]{article}
\\usepackage[margin=${marginIn}]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
${fontPackageLatex}
\\usepackage{microtype}
\\usepackage[hidelinks,pdftitle={${titleMeta}},pdfauthor={${authorMeta}},pdfcreator={Buat CV Kuy - Harvard LaTeX Engine}]{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{xcolor}
\\ifdefined\\pdfgentounicode
  \\input{glyphtounicode}
  \\pdfgentounicode=1
\\fi
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\hyphenpenalty=10000
\\exhyphenpenalty=10000
\\sloppy
\\setlist[itemize]{leftmargin=1.35em,itemsep=${itemSepPt},topsep=${topSepPt},parsep=0pt,partopsep=0pt}
\\titleformat{\\section}{\\scshape\\large\\bfseries}{}{0em}{}[\\vspace{1.5pt}\\titlerule]
\\titlespacing*{\\section}{0pt}{${sectionBeforePt}}{${sectionAfterPt}}
\\newcommand{\\entry}[4]{%
  \\noindent\\textbf{#1}\\hfill\\textit{#2}\\\\
  \\textit{#3}\\hfill #4\\par}
\\begin{document}
${fontSizeAdjustment}
${documentBody}
\\end{document}
`;
}

// src/server/nativeHarvardPdfCompiler.ts
import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
var cachedCmFonts = null;
var CM_FONT_FILES = {
  regular: "cmunrm.ttf",
  bold: "cmunbx.ttf",
  italic: "cmunti.ttf",
  boldItalic: "cmunbi.ttf"
};
var CM_CDN_BASE = "https://cdn.jsdelivr.net/gh/dreampulse/computer-modern-web-font@master/font/Serif/";
async function loadSingleCmFont(fileName) {
  const candidatePaths = [
    path.resolve(process.cwd(), "public", "fonts", fileName),
    path.resolve(process.cwd(), "..", "public", "fonts", fileName)
  ];
  for (const candidate of candidatePaths) {
    try {
      if (fs.existsSync(candidate)) {
        return new Uint8Array(fs.readFileSync(candidate));
      }
    } catch {
    }
  }
  const res = await fetch(`${CM_CDN_BASE}${fileName}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch Computer Modern font ${fileName}: ${res.status}`);
  }
  const arrayBuf = await res.arrayBuffer();
  return new Uint8Array(arrayBuf);
}
async function getComputerModernFontBuffers() {
  if (cachedCmFonts) return cachedCmFonts;
  try {
    const [regular, bold, italic, boldItalic] = await Promise.all([
      loadSingleCmFont(CM_FONT_FILES.regular),
      loadSingleCmFont(CM_FONT_FILES.bold),
      loadSingleCmFont(CM_FONT_FILES.italic),
      loadSingleCmFont(CM_FONT_FILES.boldItalic)
    ]);
    cachedCmFonts = { regular, bold, italic, boldItalic };
    return cachedCmFonts;
  } catch {
    return null;
  }
}
var MONTHS_ID_SHORT2 = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des"
];
var MONTHS_ID_LONG2 = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember"
];
var MONTHS_EN_SHORT2 = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];
var MONTHS_EN_LONG2 = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
var SECTION_LABELS2 = {
  id: {
    summary: "Ringkasan Profesional",
    education: "Pendidikan",
    experience: "Pengalaman Kerja",
    leadership: "Kepemimpinan & Organisasi",
    projects: "Proyek Terpilih",
    awards: "Penghargaan & Beasiswa",
    certifications: "Sertifikasi & Pelatihan",
    publications: "Publikasi",
    skills: "Keahlian & Minat",
    custom: "Informasi Tambahan"
  },
  en: {
    summary: "Professional Summary",
    education: "Education",
    experience: "Experience",
    leadership: "Leadership & Activities",
    projects: "Selected Projects",
    awards: "Honors & Awards",
    certifications: "Certifications & Training",
    publications: "Publications",
    skills: "Skills & Interests",
    custom: "Additional Information"
  }
};
function sanitizeWinAnsi(input) {
  if (!input) return "";
  return input.replace(/[\r\n\t\f\v\u00A0\u1680\u2000-\u200B\u2028\u2029\u202F\u205F\u3000\uFEFF]+/g, " ").replace(/\u00AD/g, "").replace(/[\u2018\u2019\u201A\u201B\u02BC]/g, "'").replace(/[\u201C\u201D\u201E\u201F]/g, '"').replace(/\s*---\s*/g, " \u2014 ").replace(/\s*--\s*/g, " \u2013 ").replace(/\u2212/g, "-").replace(/\s*->\s*/g, " \u2013 ").replace(/\u2192/g, " \u2013 ").replace(/\u2026/g, "...").replace(/[^\x20-\x7E\xA0-\xFF\u2013\u2014\u2022]/g, "").replace(/\s{2,}/g, " ").trim();
}
function formatCVDateNative(raw, format, lang) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const isoMatch = /^(\d{4})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    const year = isoMatch[1];
    const monthIndex = parseInt(isoMatch[2] ?? "1", 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      if (format === "numeric") {
        return `${String(monthIndex + 1).padStart(2, "0")}/${year}`;
      }
      if (format === "long") {
        return `${lang === "id" ? MONTHS_ID_LONG2[monthIndex] : MONTHS_EN_LONG2[monthIndex]} ${year}`;
      }
      return `${lang === "id" ? MONTHS_ID_SHORT2[monthIndex] : MONTHS_EN_SHORT2[monthIndex]} ${year}`;
    }
  }
  return sanitizeWinAnsi(trimmed);
}
function cleanDisplayUrl2(rawUrl) {
  return rawUrl.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
}
function parseRichTextSpans(raw) {
  const cleaned = sanitizeWinAnsi(raw.trim().replace(/^[-•*◦]\s+/, "")).replace(/([^\s([{"'])\*\*([^*]+)\*\*/g, "$1 **$2**").replace(/\*\*([^*]+)\*\*([^\s.,;:!?)\]}"'])/g, "**$1** $2");
  if (!cleaned) return [];
  const spans = [];
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIdx = 0;
  let match;
  while ((match = tokenRegex.exec(cleaned)) !== null) {
    if (match.index > lastIdx) {
      spans.push({ text: cleaned.slice(lastIdx, match.index) });
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      spans.push({ text: token.slice(2, -2), bold: true });
    } else if (token.startsWith("*") && token.endsWith("*")) {
      spans.push({ text: token.slice(1, -1), italic: true });
    } else if (token.startsWith("[")) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        spans.push({ text: linkMatch[1] ?? "", underline: true });
      } else {
        spans.push({ text: token });
      }
    }
    lastIdx = match.index + token.length;
  }
  if (lastIdx < cleaned.length) {
    spans.push({ text: cleaned.slice(lastIdx) });
  }
  return spans;
}
function ensureTitleCaseForSmallCaps(input) {
  const safe = sanitizeWinAnsi(input);
  if (!safe) return "";
  return safe.split(" ").map((word) => {
    if (!word) return "";
    if (word === "&" || word === "/" || word === "-") return word;
    const isAllUpper = word.length > 1 && word === word.toUpperCase();
    const isAllLower = word === word.toLowerCase();
    if (isAllUpper || isAllLower) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return word;
  }).join(" ");
}
function buildSmallCapsSegments(rawText, capSize, font, smallCapScale = 0.75) {
  const normalized = ensureTitleCaseForSmallCaps(rawText);
  const smallSize = Number((capSize * smallCapScale).toFixed(2));
  const segments = [];
  let currentText = "";
  let currentIsSmall = false;
  const flush = () => {
    if (!currentText) return;
    const sz = currentIsSmall ? smallSize : capSize;
    const w = font.widthOfTextAtSize(currentText, sz);
    segments.push({ text: currentText, size: sz, width: w });
    currentText = "";
  };
  for (const ch of normalized) {
    const isLower = ch !== ch.toUpperCase() && ch.toLowerCase() !== ch.toUpperCase();
    const upperChar = ch.toUpperCase();
    if (currentText && isLower !== currentIsSmall) {
      flush();
    }
    currentIsSmall = isLower;
    currentText += upperChar;
  }
  flush();
  const totalWidth = segments.reduce((acc, s) => acc + s.width, 0);
  return { segments, totalWidth };
}
function drawMobilePhoneIcon(page, x, yBaseline, size) {
  const iconW = size * 0.52;
  const iconH = size * 0.76;
  const bottomY = yBaseline - size * 0.04;
  page.drawRectangle({
    x,
    y: bottomY,
    width: iconW,
    height: iconH,
    borderColor: rgb(0.12, 0.12, 0.12),
    borderWidth: 0.75
  });
  page.drawRectangle({
    x: x + iconW * 0.16,
    y: bottomY + iconH * 0.22,
    width: iconW * 0.68,
    height: iconH * 0.62,
    borderColor: rgb(0.12, 0.12, 0.12),
    borderWidth: 0.45
  });
  page.drawCircle({
    x: x + iconW / 2,
    y: bottomY + iconH * 0.11,
    size: iconW * 0.08,
    color: rgb(0.12, 0.12, 0.12)
  });
}
function drawEnvelopeIcon(page, x, yBaseline, size) {
  const iconW = size * 0.74;
  const iconH = size * 0.52;
  const bottomY = yBaseline + size * 0.02;
  const topY = bottomY + iconH;
  const midX = x + iconW / 2;
  const flapY = bottomY + iconH * 0.42;
  page.drawRectangle({
    x,
    y: bottomY,
    width: iconW,
    height: iconH,
    borderColor: rgb(0.12, 0.12, 0.12),
    borderWidth: 0.75
  });
  page.drawLine({
    start: { x, y: topY },
    end: { x: midX, y: flapY },
    thickness: 0.65,
    color: rgb(0.12, 0.12, 0.12)
  });
  page.drawLine({
    start: { x: x + iconW, y: topY },
    end: { x: midX, y: flapY },
    thickness: 0.65,
    color: rgb(0.12, 0.12, 0.12)
  });
}
async function compileHarvardVectorPdf(cv, mode = "cv") {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(sanitizeWinAnsi(cv.title || cv.personalInfo.fullName || "Harvard OCS Resume"));
  pdfDoc.setAuthor(sanitizeWinAnsi(cv.personalInfo.fullName || "Candidate"));
  pdfDoc.setCreator("Buat CV Kuy - Harvard LaTeX Engine");
  const { settings } = cv;
  const useComputerModern = settings.fontFamily === "lmodern" || settings.templatePreset === "jakes" || settings.templatePreset === "cover_letter_1" || settings.templatePreset === "simple_letter";
  let fontRegular;
  let fontBold;
  let fontItalic;
  let fontBoldItalic;
  const cmBuffers = useComputerModern ? await getComputerModernFontBuffers() : null;
  if (cmBuffers) {
    pdfDoc.registerFontkit(fontkit);
    fontRegular = await pdfDoc.embedFont(cmBuffers.regular);
    fontBold = await pdfDoc.embedFont(cmBuffers.bold);
    fontItalic = await pdfDoc.embedFont(cmBuffers.italic);
    fontBoldItalic = await pdfDoc.embedFont(cmBuffers.boldItalic);
  } else {
    fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    fontBoldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);
  }
  const isLetter = settings.paperSize === "letter";
  const pageWidth = isLetter ? 612 : 595.28;
  const pageHeight = isLetter ? 792 : 841.89;
  let marginIn = 0.72;
  if (settings.templatePreset === "cover_letter_1") {
    marginIn = 0.75;
  } else if (settings.margin === "compact" || settings.templatePreset === "jakes") {
    marginIn = 0.48;
  } else if (settings.margin === "narrow" || settings.templatePreset === "compact" || settings.templatePreset === "wharton" || settings.templatePreset === "mckinsey") {
    marginIn = 0.52;
  }
  const marginPt = Number((marginIn * 72).toFixed(2));
  const baseSize = settings.fontSize === "10pt" ? 10 : settings.fontSize === "10.5pt" ? 10.5 : settings.fontSize === "11.5pt" ? 11.5 : 11;
  const isCompact = settings.sectionSpacing === "compact" || settings.templatePreset === "compact" || settings.templatePreset === "jakes" || settings.templatePreset === "wharton";
  const isRelaxed = settings.sectionSpacing === "relaxed";
  const lineMultiplier = isCompact ? 1.13 : isRelaxed ? 1.22 : 1.16;
  const lineHeight = Number((baseSize * lineMultiplier).toFixed(2));
  const sectionBeforePt = isCompact ? 4.2 : isRelaxed ? 7.5 : 5.5;
  const sectionAfterPt = isCompact ? 1 : isRelaxed ? 2.5 : 1.5;
  const itemSepPt = isCompact ? 0.5 : isRelaxed ? 1.5 : 0.8;
  const topSepPt = isCompact ? 0.4 : isRelaxed ? 1.5 : 0.7;
  const entryGapPt = isCompact ? 2.4 : isRelaxed ? 4.5 : 3.2;
  const contentWidth = pageWidth - marginPt * 2;
  const lang = settings.cvLanguage === "en" ? "en" : "id";
  const dateFormat = settings.dateFormat;
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let cursorY = pageHeight - marginPt;
  const pickFont = (bold, italic) => {
    if (bold && italic) return fontBoldItalic;
    if (bold) return fontBold;
    if (italic) return fontItalic;
    return fontRegular;
  };
  const ensureSpace = (neededPt) => {
    if (cursorY - neededPt < marginPt) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      cursorY = pageHeight - marginPt;
    }
  };
  const drawSmallCapsAt = (text, xStart, yBaseline, capSize, font, smallCapScale = 0.75) => {
    const { segments } = buildSmallCapsSegments(text, capSize, font, smallCapScale);
    let x = xStart;
    for (const seg of segments) {
      currentPage.drawText(seg.text, {
        x,
        y: yBaseline,
        size: seg.size,
        font,
        color: rgb(0, 0, 0)
      });
      x += seg.width;
    }
  };
  const drawCenteredSmallCaps = (text, capSize, font, smallCapScale = 0.75) => {
    const { segments, totalWidth } = buildSmallCapsSegments(text, capSize, font, smallCapScale);
    if (segments.length === 0) return;
    ensureSpace(capSize * 1.15);
    const yBaseline = cursorY - capSize * 0.85;
    let x = Math.max(marginPt, (pageWidth - totalWidth) / 2);
    for (const seg of segments) {
      currentPage.drawText(seg.text, {
        x,
        y: yBaseline,
        size: seg.size,
        font,
        color: rgb(0, 0, 0)
      });
      x += seg.width;
    }
    cursorY = yBaseline - 2.8;
  };
  const drawCenteredText = (text, size, font, color = rgb(0.04, 0.04, 0.04)) => {
    const safe = sanitizeWinAnsi(text);
    if (!safe) return;
    ensureSpace(size * 1.15);
    const textWidth = font.widthOfTextAtSize(safe, size);
    const x = Math.max(marginPt, (pageWidth - textWidth) / 2);
    const yBaseline = cursorY - size * 0.88;
    currentPage.drawText(safe, {
      x,
      y: yBaseline,
      size,
      font,
      color
    });
    cursorY = yBaseline - 2.2;
  };
  const drawRightAlignedRow = (text, font, size = baseSize, iconType) => {
    const safe = sanitizeWinAnsi(text);
    if (!safe) return;
    ensureSpace(lineHeight);
    const textWidth = font.widthOfTextAtSize(safe, size);
    const textX = pageWidth - marginPt - textWidth;
    const yBaseline = cursorY - size;
    if (iconType === "phone") {
      drawMobilePhoneIcon(currentPage, textX - size * 0.8, yBaseline, size);
    } else if (iconType === "email") {
      drawEnvelopeIcon(currentPage, textX - size * 1, yBaseline, size);
    }
    currentPage.drawText(safe, {
      x: textX,
      y: yBaseline,
      size,
      font,
      color: rgb(0, 0, 0)
    });
    cursorY -= Number((size * 1.22).toFixed(2));
  };
  const drawHeaderBlock = () => {
    const p = cv.personalInfo;
    const isJakes = settings.templatePreset === "jakes";
    const headerCapSize = settings.templatePreset === "academic" ? baseSize + 6 : isJakes ? baseSize + 10.5 : baseSize + 8.5;
    drawCenteredSmallCaps(p.fullName || "Nama Lengkap", headerCapSize, fontBold, 0.75);
    if (!isJakes && p.headline && p.headline.trim()) {
      drawCenteredText(p.headline.trim(), baseSize, fontItalic, rgb(0.08, 0.08, 0.08));
    }
    if (isJakes) {
      const jakeContacts = [];
      if (p.phone?.trim()) {
        jakeContacts.push({ text: sanitizeWinAnsi(p.phone.trim()) });
      }
      if (p.location?.trim() && !p.phone?.trim()) {
        jakeContacts.push({ text: sanitizeWinAnsi(p.location.trim()) });
      }
      if (p.email?.trim()) {
        jakeContacts.push({ text: sanitizeWinAnsi(p.email.trim()), underline: true });
      }
      if (p.linkedin?.trim()) {
        jakeContacts.push({
          text: sanitizeWinAnsi(cleanDisplayUrl2(p.linkedin)),
          underline: true
        });
      }
      if (p.github?.trim()) {
        jakeContacts.push({
          text: sanitizeWinAnsi(cleanDisplayUrl2(p.github)),
          underline: true
        });
      }
      if (p.portfolio?.trim()) {
        jakeContacts.push({
          text: sanitizeWinAnsi(cleanDisplayUrl2(p.portfolio)),
          underline: true
        });
      }
      for (const custom of p.customLinks || []) {
        if (custom.url?.trim() || custom.label?.trim()) {
          jakeContacts.push({
            text: sanitizeWinAnsi(custom.label?.trim() || cleanDisplayUrl2(custom.url)),
            underline: true
          });
        }
      }
      if (jakeContacts.length > 0) {
        const contactSize = baseSize - 1;
        const sep = " | ";
        const sepW = fontRegular.widthOfTextAtSize(sep, contactSize);
        const totalW = jakeContacts.reduce(
          (acc, c) => acc + fontRegular.widthOfTextAtSize(c.text, contactSize),
          0
        ) + sepW * (jakeContacts.length - 1);
        ensureSpace(contactSize * 1.2);
        const yBaseline = cursorY - contactSize * 0.85;
        let x = Math.max(marginPt, (pageWidth - totalW) / 2);
        for (let i = 0; i < jakeContacts.length; i++) {
          const item = jakeContacts[i];
          const w = fontRegular.widthOfTextAtSize(item.text, contactSize);
          currentPage.drawText(item.text, {
            x,
            y: yBaseline,
            size: contactSize,
            font: fontRegular,
            color: rgb(0, 0, 0)
          });
          if (item.underline) {
            currentPage.drawRectangle({
              x,
              y: yBaseline - 1.1,
              width: w,
              height: 0.42,
              color: rgb(0, 0, 0)
            });
          }
          x += w;
          if (i < jakeContacts.length - 1) {
            currentPage.drawText(sep, {
              x,
              y: yBaseline,
              size: contactSize,
              font: fontRegular,
              color: rgb(0, 0, 0)
            });
            x += sepW;
          }
        }
        cursorY = yBaseline - 2;
      }
      return;
    }
    const contacts = [];
    if (p.location?.trim()) contacts.push(sanitizeWinAnsi(p.location.trim()));
    if (p.email?.trim()) contacts.push(sanitizeWinAnsi(p.email.trim()));
    if (p.phone?.trim()) contacts.push(sanitizeWinAnsi(p.phone.trim()));
    if (p.linkedin?.trim()) {
      const prefix = settings.showLinksIcon ? "[in] " : "";
      contacts.push(`${prefix}${sanitizeWinAnsi(cleanDisplayUrl2(p.linkedin))}`);
    }
    if (p.github?.trim()) {
      const prefix = settings.showLinksIcon ? "[gh] " : "";
      contacts.push(`${prefix}${sanitizeWinAnsi(cleanDisplayUrl2(p.github))}`);
    }
    if (p.portfolio?.trim()) {
      const prefix = settings.showLinksIcon ? "[web] " : "";
      contacts.push(`${prefix}${sanitizeWinAnsi(cleanDisplayUrl2(p.portfolio))}`);
    }
    for (const custom of p.customLinks || []) {
      if (custom.url?.trim() || custom.label?.trim()) {
        contacts.push(
          sanitizeWinAnsi(custom.label?.trim() || cleanDisplayUrl2(custom.url))
        );
      }
    }
    if (contacts.length > 0) {
      const contactLine = contacts.join("   \xB7   ");
      drawCenteredText(contactLine, baseSize - 0.9, fontRegular, rgb(0.06, 0.06, 0.06));
    }
    if (settings.templatePreset === "wharton") {
      cursorY -= 2;
      currentPage.drawRectangle({
        x: marginPt,
        y: cursorY,
        width: contentWidth,
        height: 0.65,
        color: rgb(0, 0, 0)
      });
      cursorY -= 2;
    } else if (settings.templatePreset === "mckinsey") {
      cursorY -= 2;
      currentPage.drawRectangle({
        x: marginPt,
        y: cursorY,
        width: contentWidth,
        height: 0.95,
        color: rgb(0, 0, 0)
      });
      cursorY -= 2;
      currentPage.drawRectangle({
        x: marginPt,
        y: cursorY,
        width: contentWidth,
        height: 0.35,
        color: rgb(0, 0, 0)
      });
      cursorY -= 2;
    } else {
      cursorY -= 1;
    }
  };
  const drawSectionHeading = (title) => {
    const isJakes = settings.templatePreset === "jakes";
    const headingCapSize = baseSize + 1.4;
    ensureSpace(sectionBeforePt + headingCapSize + sectionAfterPt + lineHeight * 2);
    cursorY -= sectionBeforePt;
    const yBaseline = cursorY - headingCapSize * 0.85;
    const sectionFont = isJakes ? fontRegular : fontBold;
    drawSmallCapsAt(title, marginPt, yBaseline, headingCapSize, sectionFont, 0.75);
    const ruleY = yBaseline - 2.2;
    currentPage.drawRectangle({
      x: marginPt,
      y: ruleY,
      width: contentWidth,
      height: 0.52,
      color: rgb(0, 0, 0)
    });
    cursorY = ruleY - sectionAfterPt;
  };
  const drawTwoColRow = (leftText, rightText, leftFont, rightFont, size = baseSize, leftIndentPt = 0) => {
    const safeLeft = sanitizeWinAnsi(leftText);
    const safeRight = sanitizeWinAnsi(rightText);
    if (!safeLeft && !safeRight) return;
    const rowH = Number((size * lineMultiplier).toFixed(2));
    ensureSpace(rowH);
    const rightWidth = safeRight ? rightFont.widthOfTextAtSize(safeRight, size) : 0;
    const maxLeftWidth = Math.max(120, contentWidth - leftIndentPt - rightWidth - 12);
    let displayLeft = safeLeft;
    while (displayLeft.length > 10 && leftFont.widthOfTextAtSize(displayLeft, size) > maxLeftWidth) {
      displayLeft = `${displayLeft.slice(0, -4)}...`;
    }
    const yBaseline = cursorY - size;
    if (displayLeft) {
      currentPage.drawText(displayLeft, {
        x: marginPt + leftIndentPt,
        y: yBaseline,
        size,
        font: leftFont,
        color: rgb(0, 0, 0)
      });
    }
    if (safeRight) {
      currentPage.drawText(safeRight, {
        x: pageWidth - marginPt - rightWidth,
        y: yBaseline,
        size,
        font: rightFont,
        color: rgb(0, 0, 0)
      });
    }
    cursorY -= rowH;
  };
  const drawMixedLeftTwoColRow = (leftSpans, rightText, rightFont, size = baseSize, leftIndentPt = 0) => {
    const safeRight = sanitizeWinAnsi(rightText);
    const rowH = Number((size * lineMultiplier).toFixed(2));
    ensureSpace(rowH);
    const yBaseline = cursorY - size;
    let x = marginPt + leftIndentPt;
    for (const span of leftSpans) {
      const text = sanitizeWinAnsi(span.text);
      if (!text) continue;
      const hasLeadSpace = /^\s/.test(span.text);
      const hasTrailSpace = /\s$/.test(span.text);
      const rendered = `${hasLeadSpace ? " " : ""}${text}${hasTrailSpace ? " " : ""}`;
      const f = pickFont(span.bold, span.italic);
      const w = f.widthOfTextAtSize(rendered, size);
      currentPage.drawText(rendered, {
        x,
        y: yBaseline,
        size,
        font: f,
        color: rgb(0, 0, 0)
      });
      if (span.underline) {
        currentPage.drawRectangle({
          x,
          y: yBaseline - 1.1,
          width: w,
          height: 0.42,
          color: rgb(0, 0, 0)
        });
      }
      x += w;
    }
    if (safeRight) {
      const rightWidth = rightFont.widthOfTextAtSize(safeRight, size);
      currentPage.drawText(safeRight, {
        x: pageWidth - marginPt - rightWidth,
        y: yBaseline,
        size,
        font: rightFont,
        color: rgb(0, 0, 0)
      });
    }
    cursorY -= rowH;
  };
  const drawRichParagraph = (spans, options) => {
    const size = options?.size ?? baseSize;
    const indentPt = options?.indentPt ?? 0;
    const bulletStyle = options?.bulletStyle;
    const bulletOffsetPt = options?.bulletOffsetPt ?? 4;
    const justify = options?.justify ?? true;
    const rowHeight = Number((size * (options?.lineGapMultiplier ?? lineMultiplier)).toFixed(2));
    const availWidth = contentWidth - indentPt;
    const words = [];
    for (const span of spans) {
      const f = pickFont(span.bold, span.italic);
      const parts = span.text.split(/(\s+)/);
      for (const part of parts) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          words.push({
            text: " ",
            bold: span.bold,
            italic: span.italic,
            underline: span.underline,
            width: f.widthOfTextAtSize(" ", size)
          });
        } else {
          words.push({
            text: part,
            bold: span.bold,
            italic: span.italic,
            underline: span.underline,
            width: f.widthOfTextAtSize(part, size)
          });
        }
      }
    }
    const lines = [];
    let currentLine = [];
    let currentWidth = 0;
    for (const word of words) {
      if (currentLine.length === 0 && word.text === " ") {
        continue;
      }
      if (currentWidth + word.width > availWidth && currentLine.length > 0) {
        while (currentLine.length > 0 && currentLine[currentLine.length - 1]?.text === " ") {
          const popped = currentLine.pop();
          currentWidth -= popped.width;
        }
        lines.push(currentLine);
        currentLine = word.text === " " ? [] : [word];
        currentWidth = word.text === " " ? 0 : word.width;
      } else {
        currentLine.push(word);
        currentWidth += word.width;
      }
    }
    while (currentLine.length > 0 && currentLine[currentLine.length - 1]?.text === " ") {
      currentLine.pop();
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      ensureSpace(rowHeight);
      const yPos = cursorY - size;
      if (lineIdx === 0 && bulletStyle) {
        if (bulletStyle === "circle") {
          currentPage.drawCircle({
            x: marginPt + bulletOffsetPt + 2.2,
            y: yPos + size * 0.28,
            size: 1.75,
            borderColor: rgb(0, 0, 0),
            borderWidth: 0.7
          });
        } else {
          currentPage.drawCircle({
            x: marginPt + bulletOffsetPt + 2,
            y: yPos + size * 0.28,
            size: 1.55,
            color: rgb(0, 0, 0)
          });
        }
      }
      const lineTokens = lines[lineIdx] ?? [];
      const isLastLine = lineIdx === lines.length - 1;
      const spaceCount = lineTokens.filter((t) => t.text === " ").length;
      const naturalLineWidth = lineTokens.reduce((acc, t) => acc + t.width, 0);
      const slack = availWidth - naturalLineWidth;
      const extraPerSpace = justify && !isLastLine && spaceCount > 0 && slack > 0 && slack < availWidth * 0.28 ? slack / spaceCount : 0;
      let xPos = marginPt + indentPt;
      for (const tok of lineTokens) {
        if (tok.text === " ") {
          xPos += tok.width + extraPerSpace;
          continue;
        }
        const tokFont = pickFont(tok.bold, tok.italic);
        currentPage.drawText(tok.text, {
          x: xPos,
          y: yPos,
          size,
          font: tokFont,
          color: rgb(0, 0, 0)
        });
        if (tok.underline) {
          currentPage.drawRectangle({
            x: xPos,
            y: yPos - 1.2,
            width: tok.width,
            height: 0.45,
            color: rgb(0, 0, 0)
          });
        }
        xPos += tok.width;
      }
      cursorY -= rowHeight;
    }
  };
  const drawBullets = (bullets, options) => {
    const nonEmpty = bullets.map((b) => b.trim()).filter(Boolean);
    if (nonEmpty.length === 0) return;
    const bSize = options?.size ?? baseSize;
    const extraIndent = options?.extraIndentPt ?? 0;
    const bStyle = options?.bulletStyle ?? "solid";
    cursorY -= topSepPt;
    for (let i = 0; i < nonEmpty.length; i++) {
      const b = nonEmpty[i];
      const spans = parseRichTextSpans(b);
      if (spans.length > 0) {
        drawRichParagraph(spans, {
          indentPt: extraIndent + bSize * 1.35,
          bulletStyle: bStyle,
          bulletOffsetPt: extraIndent + 3.5,
          size: bSize,
          justify: true
        });
        if (i < nonEmpty.length - 1) {
          cursorY -= itemSepPt;
        }
      }
    }
  };
  const drawDateRange = (start, end, isCurrent) => {
    const left = start?.trim() ? formatCVDateNative(start.trim(), dateFormat, lang) : "";
    const presentLabel = lang === "id" ? "Sekarang" : "Present";
    const right = isCurrent ? presentLabel : end?.trim() ? formatCVDateNative(end.trim(), dateFormat, lang) : "";
    if (left && right) return `${left} \u2013 ${right}`;
    return left || right || "";
  };
  const renderCoverLetter = () => {
    const rawCl = cv.coverLetter;
    const hasContent = Boolean(
      rawCl && (rawCl.openingParagraph?.trim() || rawCl.bodyParagraphs?.some((p2) => p2.trim()) || rawCl.closingParagraph?.trim())
    );
    const cl = hasContent ? rawCl : createDefaultCoverLetter(cv);
    const preset = settings.templatePreset;
    const p = cv.personalInfo;
    const dateLine = sanitizeWinAnsi(
      cl.date?.trim() || (lang === "id" ? "17 November 2026" : "November 17, 2026")
    );
    if (preset === "cover_letter_1") {
      drawRightAlignedRow(p.fullName || "Nama Lengkap", fontBold, baseSize);
      if (p.location?.trim()) {
        drawRightAlignedRow(p.location.trim(), fontItalic, baseSize);
      }
      if (p.phone?.trim()) {
        drawRightAlignedRow(p.phone.trim(), fontItalic, baseSize, "phone");
      }
      if (p.email?.trim()) {
        drawRightAlignedRow(p.email.trim(), fontItalic, baseSize, "email");
      }
      cursorY -= 14;
      drawTwoColRow(lang === "id" ? "Kepada Yth." : "To", dateLine, fontBold, fontRegular, baseSize);
      const recLines = [
        cl.recipientName?.trim(),
        cl.recipientTitle?.trim(),
        cl.companyName?.trim(),
        cl.companyAddress?.trim()
      ].filter((line) => Boolean(line));
      for (const rLine of recLines) {
        drawRichParagraph([{ text: sanitizeWinAnsi(rLine), italic: true }], {
          justify: false,
          lineGapMultiplier: 1.18
        });
      }
      cursorY -= 16;
      if (cl.subjectLine?.trim()) {
        const prefix = lang === "id" ? "Perihal: " : "Sub: ";
        const rawSub = cl.subjectLine.trim();
        const hasPrefix = rawSub.toLowerCase().startsWith("perihal") || rawSub.toLowerCase().startsWith("sub:") || rawSub.toLowerCase().startsWith("re:");
        const fullSubject = hasPrefix ? rawSub : `${prefix}${rawSub}`;
        drawRichParagraph([{ text: sanitizeWinAnsi(fullSubject), bold: true }], {
          justify: false,
          lineGapMultiplier: 1.2
        });
        cursorY -= 14;
      }
      const salutation2 = cl.salutation?.trim() || (lang === "id" ? "Dengan hormat," : "Respected Sir,");
      drawRichParagraph([{ text: sanitizeWinAnsi(salutation2) }], { justify: false });
      cursorY -= 10;
      const paragraphs2 = [
        cl.openingParagraph,
        ...cl.bodyParagraphs || [],
        cl.closingParagraph
      ].map((pItem) => pItem?.trim()).filter((pItem) => Boolean(pItem));
      for (const para of paragraphs2) {
        const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);
        const bulletLines = lines.filter((l) => /^[•\-*◦]\s+/.test(l));
        if (bulletLines.length > 0) {
          const introLines = lines.filter((l) => !/^[•\-*◦]\s+/.test(l));
          if (introLines.length > 0) {
            drawRichParagraph(parseRichTextSpans(introLines.join(" ")), {
              lineGapMultiplier: 1.22,
              justify: false
            });
            cursorY -= 4;
          }
          drawBullets(
            bulletLines.map((b) => b.replace(/^[•\-*◦]\s+/, "")),
            {
              bulletStyle: "circle",
              extraIndentPt: 4
            }
          );
          cursorY -= 8;
        } else {
          const subParas = para.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
          for (const sp of subParas) {
            drawRichParagraph(parseRichTextSpans(sp), {
              lineGapMultiplier: 1.22,
              justify: false
            });
            cursorY -= 9;
          }
        }
      }
      cursorY -= 4;
      const signOff2 = cl.signOff?.trim() || (lang === "id" ? "Hormat saya," : "Yours faithfully,");
      drawRichParagraph([{ text: sanitizeWinAnsi(signOff2) }], { justify: false });
      cursorY -= 16;
      drawRichParagraph(
        [{ text: sanitizeWinAnsi(cv.personalInfo.fullName || "Candidate"), bold: true }],
        { justify: false }
      );
      const enclosures2 = (cl.enclosures || []).map((e) => e.trim()).filter(Boolean);
      if (enclosures2.length > 0) {
        cursorY -= 12;
        const encTitle = lang === "id" ? "Lampiran (Berkas / Sertifikat Terlampir):" : "Enclosed (Marksheets / Certificates):";
        drawRichParagraph([{ text: encTitle, bold: true }], {
          size: baseSize - 0.5,
          justify: false
        });
        cursorY -= 2;
        for (const item of enclosures2) {
          drawRichParagraph([{ text: sanitizeWinAnsi(item) }], {
            size: baseSize - 0.8,
            justify: false
          });
        }
      }
      return;
    }
    if (preset === "simple_letter") {
      drawRightAlignedRow(p.fullName || "Nama Lengkap", fontBold, baseSize);
      if (p.location?.trim()) {
        drawRightAlignedRow(p.location.trim(), fontRegular, baseSize);
      }
      if (p.phone?.trim()) {
        drawRightAlignedRow(p.phone.trim(), fontRegular, baseSize);
      }
      if (p.email?.trim()) {
        drawRightAlignedRow(p.email.trim(), fontRegular, baseSize);
      }
      cursorY -= 8;
      drawRightAlignedRow(dateLine, fontRegular, baseSize);
      cursorY -= 12;
    } else {
      drawHeaderBlock();
      currentPage.drawRectangle({
        x: marginPt,
        y: cursorY + 1,
        width: contentWidth,
        height: 0.6,
        color: rgb(0, 0, 0)
      });
      cursorY -= 12;
      drawRichParagraph([{ text: dateLine }], { justify: false });
      cursorY -= 9;
    }
    if (cl.recipientName?.trim()) {
      drawRichParagraph([{ text: sanitizeWinAnsi(cl.recipientName.trim()), bold: true }], {
        justify: false
      });
    }
    if (cl.recipientTitle?.trim()) {
      drawRichParagraph([{ text: sanitizeWinAnsi(cl.recipientTitle.trim()), italic: true }], {
        justify: false
      });
    }
    if (cl.companyName?.trim()) {
      drawRichParagraph([{ text: sanitizeWinAnsi(cl.companyName.trim()) }], { justify: false });
    }
    if (cl.companyAddress?.trim()) {
      drawRichParagraph([{ text: sanitizeWinAnsi(cl.companyAddress.trim()) }], {
        justify: false
      });
    }
    cursorY -= 9;
    if (cl.subjectLine?.trim()) {
      const prefix = lang === "id" ? "Perihal: " : "Sub: ";
      const text = cl.subjectLine.trim().toLowerCase().startsWith("perihal") || cl.subjectLine.trim().toLowerCase().startsWith("sub:") || cl.subjectLine.trim().toLowerCase().startsWith("re:") ? cl.subjectLine.trim() : `${prefix}${cl.subjectLine.trim()}`;
      drawRichParagraph([{ text: sanitizeWinAnsi(text), bold: true }], { justify: false });
      cursorY -= 9;
    }
    const salutation = cl.salutation?.trim() || (lang === "id" ? "Dengan hormat," : "Dear Hiring Manager,");
    drawRichParagraph([{ text: sanitizeWinAnsi(salutation) }], { justify: false });
    cursorY -= 8;
    const paragraphs = [
      cl.openingParagraph,
      ...cl.bodyParagraphs || [],
      cl.closingParagraph
    ].map((pItem) => pItem?.trim()).filter((pItem) => Boolean(pItem));
    for (const para of paragraphs) {
      const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);
      const bulletLines = lines.filter((l) => /^[•\-*◦]\s+/.test(l));
      if (bulletLines.length > 0) {
        const introLines = lines.filter((l) => !/^[•\-*◦]\s+/.test(l));
        if (introLines.length > 0) {
          drawRichParagraph(parseRichTextSpans(introLines.join(" ")), {
            lineGapMultiplier: 1.24,
            justify: true
          });
          cursorY -= 3;
        }
        drawBullets(bulletLines.map((b) => b.replace(/^[•\-*◦]\s+/, "")));
        cursorY -= 6;
      } else {
        const subParas = para.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
        for (const sp of subParas) {
          drawRichParagraph(parseRichTextSpans(sp), { lineGapMultiplier: 1.24, justify: true });
          cursorY -= 8;
        }
      }
    }
    cursorY -= 4;
    const signOff = cl.signOff?.trim() || (lang === "id" ? "Hormat saya," : "Sincerely,");
    drawRichParagraph([{ text: sanitizeWinAnsi(signOff) }], { justify: false });
    cursorY -= 18;
    drawRichParagraph(
      [{ text: sanitizeWinAnsi(cv.personalInfo.fullName || "Candidate"), bold: true }],
      { justify: false }
    );
    const enclosures = (cl.enclosures || []).map((e) => e.trim()).filter(Boolean);
    if (enclosures.length > 0) {
      cursorY -= 10;
      const encTitle = lang === "id" ? "Lampiran (Berkas / Sertifikat Terlampir):" : "Enclosed (Marksheets / Certificates):";
      drawRichParagraph([{ text: encTitle, bold: true }], {
        size: baseSize - 0.5,
        justify: false
      });
      cursorY -= 2;
      for (const item of enclosures) {
        drawRichParagraph([{ text: sanitizeWinAnsi(item) }], {
          size: baseSize - 0.9,
          justify: false
        });
      }
    }
    if (cl.postscript?.trim()) {
      cursorY -= 10;
      drawRichParagraph([{ text: sanitizeWinAnsi(cl.postscript.trim()), italic: true }], {
        size: baseSize - 0.4,
        justify: true
      });
    }
  };
  const renderCVBody = () => {
    drawHeaderBlock();
    const defaultLabels = SECTION_LABELS2[lang];
    const isJakes = settings.templatePreset === "jakes";
    const jakesIndentPt = isJakes ? 7 : 0;
    const jakesSubSize = isJakes ? baseSize - 0.8 : baseSize;
    const renderSectionByKey = (key, customTitle) => {
      const sectionHeadingText = customTitle?.trim() || (isJakes && key === "projects" && lang === "en" ? "Projects" : isJakes && key === "skills" && lang === "en" ? "Technical Skills" : defaultLabels[key]);
      switch (key) {
        case "summary": {
          if (!cv.summary?.content?.trim()) return;
          drawSectionHeading(sectionHeadingText);
          drawRichParagraph(parseRichTextSpans(cv.summary.content.trim()), {
            indentPt: jakesIndentPt,
            justify: true
          });
          cursorY -= 2;
          break;
        }
        case "education": {
          const validEdu = cv.education.filter(
            (e) => e.institution.trim() || e.degree.trim()
          );
          if (validEdu.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (let idx = 0; idx < validEdu.length; idx++) {
            const item = validEdu[idx];
            const degLine = [item.degree.trim(), item.fieldOfStudy.trim()].filter(Boolean).join(", ");
            const dateStr = drawDateRange(item.startDate, item.endDate, item.isCurrent);
            if (isJakes) {
              drawTwoColRow(
                item.institution,
                item.location,
                fontBold,
                fontRegular,
                baseSize,
                jakesIndentPt
              );
              drawTwoColRow(
                degLine,
                dateStr,
                fontItalic,
                fontItalic,
                jakesSubSize,
                jakesIndentPt
              );
            } else {
              drawTwoColRow(item.institution, item.location, fontBold, fontItalic);
              drawTwoColRow(degLine, dateStr, fontItalic, fontRegular);
            }
            const extraBullets = [];
            if (item.gpa?.trim() || item.honors?.trim()) {
              const parts = [];
              if (item.gpa?.trim()) {
                parts.push(`${lang === "id" ? "IPK" : "GPA"}: **${item.gpa.trim()}**`);
              }
              if (item.honors?.trim()) {
                parts.push(item.honors.trim());
              }
              extraBullets.push(parts.join(" \xB7 "));
            }
            if (item.coursework?.trim()) {
              const cwLabel = lang === "id" ? "*Mata Kuliah Relevan*:" : "*Relevant Coursework*:";
              extraBullets.push(`${cwLabel} ${item.coursework.trim()}`);
            }
            if (item.thesis?.trim()) {
              const thLabel = lang === "id" ? "*Tesis/Skripsi*:" : "*Thesis*:";
              extraBullets.push(`${thLabel} ${item.thesis.trim()}`);
            }
            drawBullets([...extraBullets, ...item.bullets], {
              size: jakesSubSize,
              extraIndentPt: jakesIndentPt
            });
            if (idx < validEdu.length - 1) {
              cursorY -= entryGapPt;
            }
          }
          break;
        }
        case "experience": {
          const validExp = cv.experience.filter(
            (e) => e.company.trim() || e.position.trim()
          );
          if (validExp.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (let idx = 0; idx < validExp.length; idx++) {
            const item = validExp[idx];
            const dateStr = drawDateRange(item.startDate, item.endDate, item.isCurrent);
            if (isJakes) {
              drawTwoColRow(
                item.position || item.company,
                dateStr,
                fontBold,
                fontRegular,
                baseSize,
                jakesIndentPt
              );
              drawTwoColRow(
                item.position ? item.company : "",
                item.location,
                fontItalic,
                fontItalic,
                jakesSubSize,
                jakesIndentPt
              );
            } else {
              drawTwoColRow(item.company, item.location, fontBold, fontItalic);
              drawTwoColRow(item.position, dateStr, fontItalic, fontRegular);
            }
            drawBullets(item.bullets, {
              size: jakesSubSize,
              extraIndentPt: jakesIndentPt
            });
            if (idx < validExp.length - 1) {
              cursorY -= entryGapPt;
            }
          }
          break;
        }
        case "leadership": {
          const validLead = cv.leadership.filter(
            (l) => l.organization.trim() || l.role.trim()
          );
          if (validLead.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (let idx = 0; idx < validLead.length; idx++) {
            const item = validLead[idx];
            const dateStr = drawDateRange(item.startDate, item.endDate, item.isCurrent);
            if (isJakes) {
              drawTwoColRow(
                item.role || item.organization,
                dateStr,
                fontBold,
                fontRegular,
                baseSize,
                jakesIndentPt
              );
              drawTwoColRow(
                item.role ? item.organization : "",
                item.location,
                fontItalic,
                fontItalic,
                jakesSubSize,
                jakesIndentPt
              );
            } else {
              drawTwoColRow(item.organization, item.location, fontBold, fontItalic);
              drawTwoColRow(item.role, dateStr, fontItalic, fontRegular);
            }
            drawBullets(item.bullets, {
              size: jakesSubSize,
              extraIndentPt: jakesIndentPt
            });
            if (idx < validLead.length - 1) {
              cursorY -= entryGapPt;
            }
          }
          break;
        }
        case "projects": {
          const validProj = cv.projects.filter((p) => p.name.trim());
          if (validProj.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (let idx = 0; idx < validProj.length; idx++) {
            const item = validProj[idx];
            const linkText = item.link?.trim() ? cleanDisplayUrl2(item.link) : "";
            const dateStr = drawDateRange(item.startDate, item.endDate, false);
            if (isJakes) {
              const leftSpans = [{ text: item.name.trim(), bold: true }];
              if (item.techStack?.trim()) {
                leftSpans.push({ text: " | " });
                leftSpans.push({ text: item.techStack.trim(), italic: true });
              }
              drawMixedLeftTwoColRow(
                leftSpans,
                dateStr || linkText,
                fontRegular,
                jakesSubSize,
                jakesIndentPt
              );
            } else {
              drawTwoColRow(item.name, linkText, fontBold, fontRegular);
              if (item.techStack?.trim() || dateStr) {
                drawTwoColRow(item.techStack?.trim() || "", dateStr, fontItalic, fontRegular);
              }
            }
            drawBullets(item.bullets, {
              size: jakesSubSize,
              extraIndentPt: jakesIndentPt
            });
            if (idx < validProj.length - 1) {
              cursorY -= entryGapPt;
            }
          }
          break;
        }
        case "awards": {
          const validAwards = cv.awards.filter((a) => a.title.trim());
          if (validAwards.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (const item of validAwards) {
            const dateStr = item.date?.trim() ? formatCVDateNative(item.date.trim(), dateFormat, lang) : "";
            const leftSpans = [{ text: sanitizeWinAnsi(item.title), bold: true }];
            if (item.issuer?.trim()) {
              leftSpans.push({ text: `, ${sanitizeWinAnsi(item.issuer.trim())}`, italic: true });
            }
            if (item.description?.trim()) {
              leftSpans.push({
                text: ` \u2013 ${sanitizeWinAnsi(item.description.trim())}`
              });
            }
            if (dateStr) {
              drawTwoColRow(
                leftSpans.map((s) => s.text).join(""),
                dateStr,
                fontBold,
                fontRegular,
                baseSize,
                jakesIndentPt
              );
            } else {
              drawRichParagraph(leftSpans, { indentPt: jakesIndentPt, justify: false });
            }
            cursorY -= 1.5;
          }
          break;
        }
        case "certifications": {
          const validCerts = cv.certifications.filter((c) => c.name.trim());
          if (validCerts.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (const item of validCerts) {
            const dateStr = item.date?.trim() ? formatCVDateNative(item.date.trim(), dateFormat, lang) : "";
            const left = [
              item.name.trim(),
              item.issuer?.trim() ? `\u2013 ${item.issuer.trim()}` : "",
              item.credentialId?.trim() ? `(${item.credentialId.trim()})` : ""
            ].filter(Boolean).join(" ");
            drawTwoColRow(left, dateStr, fontBold, fontRegular, baseSize, jakesIndentPt);
            cursorY -= 1.5;
          }
          break;
        }
        case "publications": {
          const validPubs = cv.publications.filter((p) => p.title.trim());
          if (validPubs.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (const item of validPubs) {
            const dateStr = item.date?.trim() ? ` (${formatCVDateNative(item.date.trim(), dateFormat, lang)})` : "";
            const spans = [];
            if (item.authors?.trim()) {
              spans.push({ text: `${sanitizeWinAnsi(item.authors.trim())}. ` });
            }
            spans.push({ text: `"${sanitizeWinAnsi(item.title.trim())}." ` });
            if (item.venue?.trim()) {
              spans.push({ text: sanitizeWinAnsi(item.venue.trim()), italic: true });
            }
            if (dateStr) {
              spans.push({ text: `${dateStr}.` });
            }
            drawRichParagraph(spans, { indentPt: jakesIndentPt, justify: true });
            cursorY -= 2.5;
          }
          break;
        }
        case "skills": {
          const s = cv.skills;
          const hasAny = s.categories.some((c) => c.category.trim() && c.items.trim()) || s.languages.some((l) => l.language.trim()) || Boolean(s.interests?.trim());
          if (!hasAny) return;
          drawSectionHeading(sectionHeadingText);
          const skillSize = isJakes ? jakesSubSize : baseSize;
          for (const cat of s.categories) {
            if (!cat.category?.trim() || !cat.items?.trim()) continue;
            drawRichParagraph(
              [
                { text: `${sanitizeWinAnsi(cat.category.trim())}: `, bold: true },
                { text: sanitizeWinAnsi(cat.items.trim()) }
              ],
              { indentPt: jakesIndentPt, size: skillSize, justify: false }
            );
            cursorY -= 1.2;
          }
          const validLangs = s.languages.filter((l) => l.language.trim());
          if (validLangs.length > 0) {
            const lbl = lang === "id" ? "Bahasa: " : "Languages: ";
            const langItems = validLangs.map(
              (l) => l.proficiency?.trim() ? `${l.language.trim()} (${l.proficiency.trim()})` : l.language.trim()
            ).join(", ");
            drawRichParagraph(
              [
                { text: lbl, bold: true },
                { text: sanitizeWinAnsi(langItems) }
              ],
              { indentPt: jakesIndentPt, size: skillSize, justify: false }
            );
            cursorY -= 1.2;
          }
          if (s.interests?.trim()) {
            const lbl = lang === "id" ? "Minat: " : "Interests: ";
            drawRichParagraph(
              [
                { text: lbl, bold: true },
                { text: sanitizeWinAnsi(s.interests.trim()) }
              ],
              { indentPt: jakesIndentPt, size: skillSize, justify: false }
            );
          }
          break;
        }
        case "custom": {
          if (cv.customSections.length === 0) return;
          for (const sec of cv.customSections) {
            const validEntries = sec.entries.filter((e) => e.title.trim());
            if (!sec.sectionTitle?.trim() || validEntries.length === 0) continue;
            drawSectionHeading(sec.sectionTitle.trim());
            for (let idx = 0; idx < validEntries.length; idx++) {
              const entry = validEntries[idx];
              drawTwoColRow(
                entry.title,
                entry.location,
                fontBold,
                fontItalic,
                baseSize,
                jakesIndentPt
              );
              if (entry.subtitle?.trim() || entry.date?.trim()) {
                drawTwoColRow(
                  entry.subtitle,
                  entry.date,
                  fontItalic,
                  fontRegular,
                  jakesSubSize,
                  jakesIndentPt
                );
              }
              drawBullets(entry.bullets, {
                size: jakesSubSize,
                extraIndentPt: jakesIndentPt
              });
              if (idx < validEntries.length - 1) {
                cursorY -= entryGapPt;
              }
            }
          }
          break;
        }
      }
    };
    for (const secConfig of cv.sectionOrder) {
      if (!secConfig.visible) continue;
      renderSectionByKey(secConfig.key, secConfig.customTitle);
    }
  };
  const effectiveMode = isCoverLetterTemplatePreset(settings.templatePreset) && mode === "cv" ? "cover-letter" : mode;
  if (effectiveMode === "cover-letter") {
    renderCoverLetter();
  } else if (effectiveMode === "combined") {
    renderCoverLetter();
    currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    cursorY = pageHeight - marginPt;
    renderCVBody();
  } else {
    renderCVBody();
  }
  const pdfBytes = await pdfDoc.save();
  return {
    pdfBase64: Buffer.from(pdfBytes).toString("base64"),
    pageCount: pdfDoc.getPageCount()
  };
}

// src/server/compiler.ts
var compileCache = new LRUCache({
  max: 100,
  ttl: 1e3 * 60 * 60
  // 60 minutes
});
var compileQueue = new PQueue({ concurrency: 1 });
var inFlightCompiles = /* @__PURE__ */ new Map();
var cachedEngineInfo = null;
var bootstrapPromise = null;
var warmupPromise = null;
var TECTONIC_MUSL_URL = "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.15.0/tectonic-0.15.0-x86_64-unknown-linux-musl.tar.gz";
function resolveCandidateBins() {
  const localTectonic = path2.resolve(process.cwd(), "bin", "tectonic");
  const tmpTectonic = path2.join(os.tmpdir(), "tectonic");
  const candidates = [];
  for (const candidatePath of [localTectonic, tmpTectonic]) {
    if (fs2.existsSync(candidatePath)) {
      try {
        fs2.chmodSync(candidatePath, 493);
      } catch {
      }
      candidates.push({ name: "tectonic", bin: candidatePath });
    }
  }
  candidates.push(
    { name: "tectonic", bin: "/usr/local/bin/tectonic" },
    { name: "tectonic", bin: "tectonic" },
    { name: "pdflatex", bin: "pdflatex" },
    { name: "xelatex", bin: "xelatex" }
  );
  return candidates;
}
function checkBinaryVersion(bin, args) {
  return new Promise((resolve) => {
    const child = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve(null);
    }, 3500);
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.on("error", () => {
      clearTimeout(timer);
      resolve(null);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0 && stdout.trim()) {
        resolve(stdout.trim().split("\n")[0] ?? stdout.trim());
      } else {
        resolve(null);
      }
    });
  });
}
async function bootstrapTectonicBinary() {
  if (process.platform !== "linux" || process.env.VERCEL) return null;
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    const localBinDir = path2.resolve(process.cwd(), "bin");
    let targetDir = localBinDir;
    try {
      await fsPromises.mkdir(localBinDir, { recursive: true });
      fs2.accessSync(localBinDir, fs2.constants.W_OK);
    } catch {
      targetDir = os.tmpdir();
    }
    const targetBin = path2.join(targetDir, "tectonic");
    if (fs2.existsSync(targetBin)) {
      try {
        fs2.chmodSync(targetBin, 493);
      } catch {
      }
      return targetBin;
    }
    return new Promise((resolve) => {
      const cmd = `curl -fsSL "${TECTONIC_MUSL_URL}" | tar -xz -C "${targetDir}" tectonic && chmod +x "${targetBin}"`;
      const child = spawn("sh", ["-c", cmd], { stdio: "ignore" });
      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        resolve(null);
      }, 2e4);
      child.on("error", () => {
        clearTimeout(timer);
        resolve(null);
      });
      child.on("close", (code) => {
        clearTimeout(timer);
        if (code === 0 && fs2.existsSync(targetBin)) {
          resolve(targetBin);
        } else {
          resolve(null);
        }
      });
    });
  })().finally(() => {
    bootstrapPromise = null;
  });
  return bootstrapPromise;
}
async function detectLatexEngine() {
  if (process.env.VERCEL) {
    return {
      name: "harvard-vector-tex",
      binPath: "internal",
      version: "Harvard OCS Server Vector TeX Engine 1.0 (Type-1 PostScript)"
    };
  }
  if (cachedEngineInfo && cachedEngineInfo.name !== "none" && cachedEngineInfo.binPath !== "internal" && fs2.existsSync(cachedEngineInfo.binPath)) {
    return cachedEngineInfo;
  }
  for (const candidate of resolveCandidateBins()) {
    const version = await checkBinaryVersion(candidate.bin, ["--version"]);
    if (version) {
      cachedEngineInfo = {
        name: candidate.name,
        binPath: candidate.bin,
        version
      };
      return cachedEngineInfo;
    }
  }
  const downloadedBin = await bootstrapTectonicBinary();
  if (downloadedBin) {
    const version = await checkBinaryVersion(downloadedBin, ["--version"]);
    if (version) {
      cachedEngineInfo = {
        name: "tectonic",
        binPath: downloadedBin,
        version
      };
      return cachedEngineInfo;
    }
  }
  return {
    name: "harvard-vector-tex",
    binPath: "internal",
    version: "Harvard OCS Server Vector TeX Engine 1.0 (Type-1 PostScript)"
  };
}
function parseLatexLog(rawLog) {
  const lines = rawLog.split(/\r?\n/);
  const errors = [];
  const warnings = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (line.startsWith("! ") || line.includes("error:")) {
      const nextLine = lines[i + 1] ?? "";
      const lineMatch = /l\.(\d+)/.exec(nextLine) || /:(\d+):/.exec(line);
      const lineNumInfo = lineMatch ? ` (Baris ${lineMatch[1]})` : "";
      const cleanedMsg = line.replace(/^!\s*/, "").replace(/^error:\s*/i, "").trim();
      if (cleanedMsg) {
        errors.push(`${cleanedMsg}${lineNumInfo}`);
      }
    } else if (/Overfull \\hbox/i.test(line) || /LaTeX Warning:/i.test(line)) {
      const cleanWarn = line.replace(/^warning:\s*/i, "").trim();
      if (cleanWarn && warnings.length < 5) {
        warnings.push(cleanWarn);
      }
    }
  }
  return { errors, warnings };
}
function hasFmtFiles(dir) {
  try {
    return fs2.existsSync(dir) && fs2.readdirSync(dir).some((f) => f.endsWith(".fmt"));
  } catch {
    return false;
  }
}
function resolveWritableCacheEnv() {
  const defaultHome = process.env.HOME || "/root";
  const workspaceCacheDir = path2.resolve(process.cwd(), ".cache");
  const rootCacheDir = path2.join(defaultHome, ".cache");
  const tmpCacheDir = path2.join(os.tmpdir(), "tectonic-cache");
  if (!process.env.VERCEL) {
    for (const candidateCache of [
      workspaceCacheDir,
      rootCacheDir,
      "/tmp/empty_cache",
      tmpCacheDir
    ]) {
      const fmtDir = path2.join(candidateCache, "Tectonic", "formats");
      if (hasFmtFiles(fmtDir)) {
        return { home: defaultHome, xdgCache: candidateCache, isWarm: true };
      }
    }
    try {
      fs2.mkdirSync(workspaceCacheDir, { recursive: true });
      fs2.accessSync(workspaceCacheDir, fs2.constants.W_OK);
      return { home: defaultHome, xdgCache: workspaceCacheDir, isWarm: false };
    } catch {
    }
  }
  try {
    fs2.mkdirSync(tmpCacheDir, { recursive: true });
  } catch {
  }
  const tmpWarm = hasFmtFiles(path2.join(tmpCacheDir, "Tectonic", "formats"));
  return {
    home: os.tmpdir(),
    xdgCache: tmpCacheDir,
    isWarm: tmpWarm
  };
}
async function runProcessInTempDir(binPath, args, cwd, timeoutMs = 15e3) {
  return new Promise((resolve, reject) => {
    const { home, xdgCache } = resolveWritableCacheEnv();
    const env = {
      ...process.env,
      HOME: home,
      XDG_CACHE_HOME: xdgCache
    };
    const child = spawn(binPath, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("Kompilasi Tectonic melewati batas waktu."));
    }, timeoutMs);
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
  });
}
async function warmupLatexEngine() {
  if (process.env.VERCEL) return;
  if (warmupPromise) return warmupPromise;
  const { isWarm } = resolveWritableCacheEnv();
  if (isWarm) return;
  warmupPromise = (async () => {
    const engine = await detectLatexEngine();
    if (engine.name !== "tectonic") return;
    await compileQueue.add(async () => {
      const tempDir = await fsPromises.mkdtemp(path2.join(os.tmpdir(), "buatcvkuy-warmup-"));
      const texFilePath = path2.join(tempDir, "warmup.tex");
      const warmupTex = [
        "\\documentclass[10pt,a4paper]{article}",
        "\\usepackage[margin=0.6in]{geometry}",
        "\\usepackage[T1]{fontenc}",
        "\\usepackage[utf8]{inputenc}",
        "\\usepackage{tgtermes}",
        "\\usepackage{libertinus}",
        "\\usepackage{ebgaramond}",
        "\\usepackage{microtype}",
        "\\usepackage{enumitem}",
        "\\usepackage{titlesec}",
        "\\usepackage[hidelinks]{hyperref}",
        "\\begin{document}",
        "Harvard OCS LaTeX Warmup",
        "\\end{document}"
      ].join("\n");
      try {
        await fsPromises.writeFile(texFilePath, warmupTex, "utf8");
        await runProcessInTempDir(
          engine.binPath,
          ["--untrusted", "--outdir", tempDir, texFilePath],
          tempDir,
          12e4
        );
      } catch {
      } finally {
        await fsPromises.rm(tempDir, { recursive: true, force: true }).catch(() => void 0);
      }
    });
  })().finally(() => {
    warmupPromise = null;
  });
  return warmupPromise;
}
async function compileCVToPdf(cv, mode = "cv") {
  const startTime = Date.now();
  const texSource = buildHarvardLatex(cv, mode);
  const contentHash = crypto.createHash("sha256").update(texSource).digest("hex");
  const cached = compileCache.get(contentHash);
  if (cached) {
    return {
      ...cached,
      durationMs: Date.now() - startTime,
      cached: true
    };
  }
  const existingInFlight = inFlightCompiles.get(contentHash);
  if (existingInFlight) {
    const sharedResult = await existingInFlight;
    return {
      ...sharedResult,
      durationMs: Date.now() - startTime,
      cached: true
    };
  }
  const engine = await detectLatexEngine();
  const { isWarm } = resolveWritableCacheEnv();
  if (process.env.VERCEL || engine.name === "harvard-vector-tex" || engine.name === "none" || engine.name === "tectonic" && !isWarm) {
    if (engine.name === "tectonic" && !isWarm && !process.env.VERCEL) {
      void warmupLatexEngine();
    }
    const vectorResult = await compileHarvardVectorPdf(cv, mode);
    const compiledResult = {
      pdfBase64: vectorResult.pdfBase64,
      pageCount: vectorResult.pageCount,
      warnings: [],
      engine: "tectonic (Harvard OCS Vector Engine)"
    };
    compileCache.set(contentHash, compiledResult);
    return {
      ...compiledResult,
      durationMs: Date.now() - startTime,
      cached: false
    };
  }
  const taskPromise = compileQueue.add(async () => {
    const cachedInsideQueue = compileCache.get(contentHash);
    if (cachedInsideQueue) {
      return cachedInsideQueue;
    }
    const tempDir = await fsPromises.mkdtemp(path2.join(os.tmpdir(), "buatcvkuy-"));
    const texFilePath = path2.join(tempDir, "resume.tex");
    const pdfFilePath = path2.join(tempDir, "resume.pdf");
    try {
      await fsPromises.writeFile(texFilePath, texSource, "utf8");
      let args;
      if (engine.name === "tectonic") {
        args = ["--untrusted", "--outdir", tempDir, texFilePath];
      } else {
        args = [
          "-no-shell-escape",
          "-interaction=nonstopmode",
          "-halt-on-error",
          `-output-directory=${tempDir}`,
          texFilePath
        ];
      }
      const proc = await runProcessInTempDir(engine.binPath, args, tempDir, 15e3);
      const combinedLog = `${proc.stdout}
${proc.stderr}`;
      const { errors, warnings } = parseLatexLog(combinedLog);
      if (proc.code !== 0 || !fs2.existsSync(pdfFilePath)) {
        const readableErr = errors.length > 0 ? errors.join(" | ") : combinedLog.slice(-500) || "Gagal mengompilasi dokumen LaTeX.";
        throw new Error(`Kompilasi LaTeX gagal: ${readableErr}`);
      }
      const pdfBuffer = await fsPromises.readFile(pdfFilePath);
      const pdfDoc = await PDFDocument2.load(pdfBuffer);
      const pageCount = pdfDoc.getPageCount();
      const pdfBase64 = pdfBuffer.toString("base64");
      const compiledResult = {
        pdfBase64,
        pageCount,
        warnings,
        engine: `${engine.name} (${engine.version})`
      };
      compileCache.set(contentHash, compiledResult);
      return compiledResult;
    } catch {
      const fallbackResult = await compileHarvardVectorPdf(cv, mode);
      const compiledResult = {
        pdfBase64: fallbackResult.pdfBase64,
        pageCount: fallbackResult.pageCount,
        warnings: [],
        engine: "tectonic (Harvard OCS Vector Engine)"
      };
      compileCache.set(contentHash, compiledResult);
      return compiledResult;
    } finally {
      await fsPromises.rm(tempDir, { recursive: true, force: true }).catch(() => void 0);
    }
  });
  const wrappedPromise = taskPromise.then((res) => {
    if (!res) {
      throw new Error("Antrean kompilasi LaTeX gagal dijalankan.");
    }
    return res;
  });
  inFlightCompiles.set(contentHash, wrappedPromise);
  try {
    const result = await wrappedPromise;
    return {
      ...result,
      durationMs: Date.now() - startTime,
      cached: false
    };
  } finally {
    inFlightCompiles.delete(contentHash);
  }
}

// server.ts
var logger = pino({
  level: process.env.LOG_LEVEL || "info"
});
async function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      frameguard: false
      // Required for AI Studio iframe preview
    })
  );
  app.use(cors());
  app.use(express.json({ limit: "512kb" }));
  const apiLimiter = rateLimit({
    windowMs: 60 * 1e3,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    message: {
      error: "Terlalu banyak permintaan kompilasi. Silakan tunggu beberapa detik."
    }
  });
  app.get("/api/health", async (_req, res) => {
    try {
      const engine = await detectLatexEngine();
      res.json({
        status: engine.name !== "none" ? "ok" : "degraded",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        latexEngine: engine.name,
        version: engine.version
      });
    } catch (err) {
      logger.error({ err }, "Health check failed");
      res.status(500).json({ status: "error", message: "Internal health check error" });
    }
  });
  app.post("/api/compile", apiLimiter, async (req, res) => {
    try {
      const rawJson = JSON.stringify(req.body ?? {});
      if (containsForbiddenLatexCommands(rawJson)) {
        logger.warn("Rejected payload containing forbidden LaTeX macros");
        res.status(400).json({
          error: "Input ditolak demi keamanan: terdeteksi makro sistem LaTeX terlarang (mis. \\write18, \\input, \\include)."
        });
        return;
      }
      const parsed = CompileRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Data CV tidak valid.",
          details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`)
        });
        return;
      }
      const docMode = parsed.data.mode ?? "cv";
      const result = await compileCVToPdf(parsed.data.cv, docMode);
      logger.info(
        {
          cvId: parsed.data.cv.id,
          mode: docMode,
          durationMs: result.durationMs,
          pageCount: result.pageCount,
          cached: result.cached
        },
        "Compiled Harvard LaTeX Document"
      );
      if (req.query.format === "binary") {
        const pdfBuffer = Buffer.from(result.pdfBase64, "base64");
        const safeFilename = (parsed.data.cv.personalInfo.fullName || "Resume").replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 60);
        const suffix = docMode === "cover-letter" ? "Harvard_Cover_Letter" : docMode === "combined" ? "Harvard_Application_Package" : "Harvard_CV";
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}_${suffix}.pdf"`);
        res.setHeader("X-Page-Count", String(result.pageCount));
        res.send(pdfBuffer);
        return;
      }
      res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat kompilasi PDF.";
      logger.error({ err: message }, "LaTeX compile error");
      res.status(422).json({ error: message });
    }
  });
  app.post("/api/compile/tex", apiLimiter, (req, res) => {
    try {
      const rawJson = JSON.stringify(req.body ?? {});
      if (containsForbiddenLatexCommands(rawJson)) {
        res.status(400).json({
          error: "Input ditolak demi keamanan: terdeteksi makro sistem LaTeX terlarang (mis. \\write18, \\input, \\include)."
        });
        return;
      }
      const parsed = CompileRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Data CV tidak valid.",
          details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`)
        });
        return;
      }
      const docMode = parsed.data.mode ?? "cv";
      const texSource = buildHarvardLatex(parsed.data.cv, docMode);
      const suffix = docMode === "cover-letter" ? "Harvard_Cover_Letter" : docMode === "combined" ? "Harvard_Application_Package" : "Harvard_CV";
      res.json({
        tex: texSource,
        filename: `${(parsed.data.cv.personalInfo.fullName || "Resume").replace(/[^a-zA-Z0-9_-]+/g, "_")}_${suffix}.tex`
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal membuat kode sumber .tex";
      res.status(500).json({ error: message });
    }
  });
  app.use((err, _req, res, next) => {
    if (err.type === "entity.too.large") {
      res.status(413).json({ error: "Ukuran data CV melebihi batas maksimum (512KB)." });
      return;
    }
    next(err);
  });
  return app;
}
async function startServer() {
  const app = await createApp();
  const PORT = Number(process.env.PORT) || 3e3;
  const distPath = path3.resolve(process.cwd(), "dist");
  if (process.env.NODE_ENV === "production" && fs3.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path3.join(distPath, "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    logger.info({ port: PORT }, "Buat CV Kuy server listening on port 3000");
    detectLatexEngine().then((engine) => {
      logger.info({ engine: engine.name, version: engine.version }, "LaTeX engine ready");
      return warmupLatexEngine();
    }).then(() => {
      logger.info("LaTeX bundle & format cache warmed up");
    }).catch((err) => {
      logger.warn({ err }, "LaTeX engine check warning");
    });
  });
}
var isMain = process.argv[1] && (process.argv[1].endsWith("server.ts") || process.argv[1].endsWith("server.js"));
if (isMain) {
  startServer().catch((err) => {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  });
}

// src/server/vercelHandler.ts
var appPromise = null;
async function handler(req, res) {
  try {
    if (!appPromise) {
      appPromise = createApp();
    }
    const app = await appPromise;
    return app(req, res);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal serverless initialization error";
    res.status(500).json({ error: message });
  }
}
export {
  handler as default
};
