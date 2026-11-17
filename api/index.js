// server.ts
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import fs2 from "fs";
import helmet from "helmet";
import path2 from "path";
import pino from "pino";

// src/server/compiler.ts
import { spawn } from "child_process";
import crypto from "crypto";
import fs from "fs";
import fsPromises from "fs/promises";
import { LRUCache } from "lru-cache";
import os from "os";
import PQueue from "p-queue";
import path from "path";
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
var HarvardLayoutSettingsSchema = z.object({
  paperSize: z.enum(["a4", "letter"]).default("a4"),
  fontSize: z.enum(["10pt", "10.5pt", "11pt", "11.5pt"]).default("11pt"),
  margin: z.enum(["normal", "narrow", "compact"]).default("normal"),
  sectionSpacing: z.enum(["compact", "normal", "relaxed"]).default("normal"),
  fontFamily: z.enum(["tgtermes", "libertinus", "ebgaramond"]).default("tgtermes"),
  showLinksIcon: z.boolean().default(false),
  dateFormat: z.enum(["short", "numeric", "long"]).default("short"),
  cvLanguage: z.enum(["id", "en"]).default("id"),
  templatePreset: z.enum(["classic", "compact", "academic"]).default("classic")
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
  signOff: z.string().max(100).default("")
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
  signOff: ""
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
      date: "16 November 2026",
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
      signOff: "Hormat saya,"
    };
  }
  return {
    enabled: true,
    date: "November 16, 2026",
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
    signOff: "Sincerely,"
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
function buildCoverLetterBodyBlock(cv, headerSizeMacro, headerName, headlineLine, contactLine) {
  const rawCl = cv.coverLetter;
  const hasContent = Boolean(
    rawCl && (rawCl.openingParagraph?.trim() || rawCl.bodyParagraphs?.some((p) => p.trim()) || rawCl.closingParagraph?.trim())
  );
  const cl = hasContent ? rawCl : createDefaultCoverLetter(cv);
  const isId = cv.settings.cvLanguage === "id";
  const dateLine = escapeLatex(
    cl.date.trim() || (isId ? "16 November 2026" : "November 16, 2026")
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
  const subjectPrefix = isId ? "Perihal:" : "Re:";
  const subjectBlock = cl.subjectLine.trim() ? `\\vspace{10pt}
\\noindent\\textbf{${subjectPrefix} ${escapeLatex(cl.subjectLine.trim())}}\\par
` : "";
  const salutation = escapeLatex(
    cl.salutation.trim() || (isId ? "Yth. Bapak/Ibu Tim Rekrutmen," : "Dear Hiring Manager,")
  );
  const paragraphs = [];
  if (cl.openingParagraph.trim()) {
    paragraphs.push(formatRichBulletLatex(cl.openingParagraph.trim()));
  }
  for (const bodyP of cl.bodyParagraphs) {
    if (bodyP.trim()) {
      paragraphs.push(formatRichBulletLatex(bodyP.trim()));
    }
  }
  if (cl.closingParagraph.trim()) {
    paragraphs.push(formatRichBulletLatex(cl.closingParagraph.trim()));
  }
  const signOff = escapeLatex(
    cl.signOff.trim() || (isId ? "Hormat saya," : "Sincerely,")
  );
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
${paragraphs.map((p) => `\\noindent ${p}\\par`).join("\n\\vspace{8pt}\n")}
\\vspace{14pt}
\\noindent ${signOff}\\par
\\vspace{22pt}
\\noindent\\textbf{${headerName}}\\par`;
}
function buildHarvardLatex(cv, mode = "cv") {
  const { settings, personalInfo } = cv;
  const lang = settings.cvLanguage;
  const dateFormat = settings.dateFormat;
  const paperOption = settings.paperSize === "letter" ? "letterpaper" : "a4paper";
  const baseDocFontPt = settings.fontSize === "10pt" || settings.fontSize === "10.5pt" ? "10pt" : "11pt";
  let marginIn = "0.72in";
  if (settings.margin === "narrow" || settings.templatePreset === "compact") {
    marginIn = "0.52in";
  } else if (settings.margin === "compact") {
    marginIn = "0.45in";
  }
  let fontPackageLatex = "\\usepackage{tgtermes}";
  if (settings.fontFamily === "libertinus") {
    fontPackageLatex = "\\usepackage{libertinus}";
  } else if (settings.fontFamily === "ebgaramond") {
    fontPackageLatex = "\\usepackage{ebgaramond}";
  }
  const isCompact = settings.sectionSpacing === "compact" || settings.templatePreset === "compact";
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
  const contactLine = contactParts.join(" \\enspace$\\cdot$\\enspace ");
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
  const resumeBodyBlock = `% === SECTION: personalInfo ===
\\begin{center}
  {${headerSizeMacro}\\scshape\\bfseries ${headerName}}\\\\[3pt]
  ${headlineLine}{\\small ${contactLine}}
\\end{center}
\\vspace{-2pt}
${renderedSections.join("\n\n")}`;
  const coverLetterBlock = buildCoverLetterBodyBlock(
    cv,
    headerSizeMacro,
    headerName,
    headlineLine,
    contactLine
  );
  let documentBody = resumeBodyBlock;
  if (mode === "cover-letter") {
    documentBody = coverLetterBlock;
  } else if (mode === "combined") {
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
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
function sanitizeWinAnsi(input) {
  if (!input) return "";
  return input.replace(/[\u2018\u2019\u02BC]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\u2014/g, " -- ").replace(/\u2013/g, " - ").replace(/\u2192/g, " -> ").replace(/\u2026/g, "...").replace(/\u00A0/g, " ").replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
}
function parseRichTextSpans(raw) {
  const cleaned = sanitizeWinAnsi(raw.trim().replace(/^[-•*]\s+/, ""));
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
var SECTION_LABELS2 = {
  id: {
    summary: "RINGKASAN PROFESIONAL",
    education: "PENDIDIKAN",
    experience: "PENGALAMAN KERJA",
    leadership: "ORGANISASI & KEPEMIMPINAN",
    projects: "PROYEK TEKNIS & RISET",
    awards: "PENGHARGAAN & PRESTASI",
    certifications: "SERTIFIKASI & LISENSI",
    publications: "PUBLIKASI ILMIAH",
    skills: "KEAHLIAN, BAHASA & MINAT",
    custom: "INFORMASI TAMBAHAN"
  },
  en: {
    summary: "PROFESSIONAL SUMMARY",
    education: "EDUCATION",
    experience: "EXPERIENCE",
    leadership: "LEADERSHIP & ACTIVITIES",
    projects: "SELECTED PROJECTS",
    awards: "HONORS & AWARDS",
    certifications: "CERTIFICATIONS & LICENSES",
    publications: "PUBLICATIONS",
    skills: "SKILLS, LANGUAGES & INTERESTS",
    custom: "ADDITIONAL INFORMATION"
  }
};
async function compileHarvardVectorPdf(cv, mode = "cv") {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(sanitizeWinAnsi(cv.title || cv.personalInfo.fullName || "Harvard OCS Resume"));
  pdfDoc.setAuthor(sanitizeWinAnsi(cv.personalInfo.fullName || "Candidate"));
  pdfDoc.setCreator("Buat CV Kuy \u2014 Harvard OCS Native Vector LaTeX Engine");
  const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const fontBoldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);
  const isLetter = cv.settings.paperSize === "letter";
  const pageWidth = isLetter ? 612 : 595.28;
  const pageHeight = isLetter ? 792 : 841.89;
  const marginPt = cv.settings.margin === "compact" ? 36 : cv.settings.margin === "narrow" ? 43.2 : 51.84;
  const baseSize = cv.settings.fontSize === "10pt" ? 10 : cv.settings.fontSize === "10.5pt" ? 10.4 : cv.settings.fontSize === "11.5pt" ? 11.2 : 10.8;
  const lineMultiplier = cv.settings.sectionSpacing === "compact" ? 1.18 : cv.settings.sectionSpacing === "relaxed" ? 1.32 : 1.24;
  const lineHeight = baseSize * lineMultiplier;
  const contentWidth = pageWidth - marginPt * 2;
  const lang = cv.settings.cvLanguage === "en" ? "en" : "id";
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
  const drawCenteredText = (text, size, font, color = rgb(0.05, 0.05, 0.05)) => {
    const safe = sanitizeWinAnsi(text);
    if (!safe) return;
    ensureSpace(size * 1.3);
    const textWidth = font.widthOfTextAtSize(safe, size);
    const x = Math.max(marginPt, (pageWidth - textWidth) / 2);
    currentPage.drawText(safe, {
      x,
      y: cursorY - size,
      size,
      font,
      color
    });
    cursorY -= size * 1.32;
  };
  const drawHeaderBlock = () => {
    const p = cv.personalInfo;
    const fullName = sanitizeWinAnsi((p.fullName || "NAMA LENGKAP").toUpperCase());
    drawCenteredText(fullName, baseSize + 6.5, fontBold, rgb(0, 0, 0));
    if (p.headline && p.headline.trim()) {
      cursorY += 1.5;
      drawCenteredText(p.headline.trim(), baseSize + 0.2, fontItalic, rgb(0.18, 0.18, 0.18));
    }
    const contacts = [];
    if (p.location?.trim()) contacts.push(sanitizeWinAnsi(p.location.trim()));
    if (p.email?.trim()) contacts.push(sanitizeWinAnsi(p.email.trim()));
    if (p.phone?.trim()) contacts.push(sanitizeWinAnsi(p.phone.trim()));
    if (p.linkedin?.trim()) {
      contacts.push(sanitizeWinAnsi(p.linkedin.trim().replace(/^https?:\/\/(www\.)?/i, "")));
    }
    if (p.github?.trim()) {
      contacts.push(sanitizeWinAnsi(p.github.trim().replace(/^https?:\/\/(www\.)?/i, "")));
    }
    if (p.portfolio?.trim()) {
      contacts.push(sanitizeWinAnsi(p.portfolio.trim().replace(/^https?:\/\/(www\.)?/i, "")));
    }
    for (const custom of p.customLinks || []) {
      if (custom.label?.trim()) {
        contacts.push(sanitizeWinAnsi(custom.label.trim()));
      }
    }
    if (contacts.length > 0) {
      cursorY += 1.5;
      const contactLine = contacts.join("  .  ");
      drawCenteredText(contactLine, baseSize - 0.8, fontRegular, rgb(0.12, 0.12, 0.12));
    }
    cursorY -= 3;
  };
  const drawSectionHeading = (title) => {
    const safeTitle = sanitizeWinAnsi(title.toUpperCase());
    const headingSize = baseSize + 0.8;
    ensureSpace(headingSize + lineHeight * 2.1 + 8);
    cursorY -= cv.settings.sectionSpacing === "compact" ? 3.5 : 5.5;
    currentPage.drawText(safeTitle, {
      x: marginPt,
      y: cursorY - headingSize,
      size: headingSize,
      font: fontBold,
      color: rgb(0, 0, 0)
    });
    cursorY -= headingSize + 2.2;
    currentPage.drawRectangle({
      x: marginPt,
      y: cursorY,
      width: contentWidth,
      height: 0.65,
      color: rgb(0, 0, 0)
    });
    cursorY -= cv.settings.sectionSpacing === "compact" ? 4 : 5.5;
  };
  const drawTwoColRow = (leftText, rightText, leftFont, rightFont, size = baseSize) => {
    const safeLeft = sanitizeWinAnsi(leftText);
    const safeRight = sanitizeWinAnsi(rightText);
    if (!safeLeft && !safeRight) return;
    ensureSpace(lineHeight);
    const rightWidth = safeRight ? rightFont.widthOfTextAtSize(safeRight, size) : 0;
    const maxLeftWidth = Math.max(120, contentWidth - rightWidth - 12);
    let displayLeft = safeLeft;
    while (displayLeft.length > 10 && leftFont.widthOfTextAtSize(displayLeft, size) > maxLeftWidth) {
      displayLeft = `${displayLeft.slice(0, -4)}...`;
    }
    if (displayLeft) {
      currentPage.drawText(displayLeft, {
        x: marginPt,
        y: cursorY - size,
        size,
        font: leftFont,
        color: rgb(0, 0, 0)
      });
    }
    if (safeRight) {
      currentPage.drawText(safeRight, {
        x: pageWidth - marginPt - rightWidth,
        y: cursorY - size,
        size,
        font: rightFont,
        color: rgb(0.08, 0.08, 0.08)
      });
    }
    cursorY -= lineHeight;
  };
  const drawRichParagraph = (spans, options) => {
    const size = options?.size ?? baseSize;
    const indentPt = options?.indentPt ?? 0;
    const bulletChar = options?.bulletChar;
    const rowHeight = size * (options?.lineGapMultiplier ?? lineMultiplier);
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
        lines.push(currentLine);
        currentLine = word.text === " " ? [] : [word];
        currentWidth = word.text === " " ? 0 : word.width;
      } else {
        currentLine.push(word);
        currentWidth += word.width;
      }
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      ensureSpace(rowHeight);
      const yPos = cursorY - size;
      if (lineIdx === 0 && bulletChar) {
        currentPage.drawText(bulletChar, {
          x: marginPt + 3.5,
          y: yPos,
          size,
          font: fontBold,
          color: rgb(0, 0, 0)
        });
      }
      let xPos = marginPt + indentPt;
      const lineTokens = lines[lineIdx] ?? [];
      for (const tok of lineTokens) {
        const tokFont = pickFont(tok.bold, tok.italic);
        if (tok.text !== " ") {
          currentPage.drawText(tok.text, {
            x: xPos,
            y: yPos,
            size,
            font: tokFont,
            color: rgb(0.05, 0.05, 0.05)
          });
          if (tok.underline) {
            currentPage.drawRectangle({
              x: xPos,
              y: yPos - 1.2,
              width: tok.width,
              height: 0.45,
              color: rgb(0.1, 0.1, 0.1)
            });
          }
        }
        xPos += tok.width;
      }
      cursorY -= rowHeight;
    }
  };
  const drawBullets = (bullets) => {
    const nonEmpty = bullets.map((b) => b.trim()).filter(Boolean);
    if (nonEmpty.length === 0) return;
    for (const b of nonEmpty) {
      const spans = parseRichTextSpans(b);
      if (spans.length > 0) {
        drawRichParagraph(spans, { indentPt: 13.5, bulletChar: "-" });
      }
    }
    cursorY -= cv.settings.sectionSpacing === "compact" ? 1.5 : 2.8;
  };
  const drawDateRange = (start, end, isCurrent) => {
    const presentLabel = lang === "id" ? "Sekarang" : "Present";
    const right = isCurrent ? presentLabel : end?.trim() || "";
    if (start?.trim() && right) return `${start.trim()} -- ${right}`;
    return start?.trim() || right || "";
  };
  const renderCoverLetter = () => {
    drawHeaderBlock();
    currentPage.drawRectangle({
      x: marginPt,
      y: cursorY + 1,
      width: contentWidth,
      height: 0.55,
      color: rgb(0.15, 0.15, 0.15)
    });
    cursorY -= 14;
    const cl = cv.coverLetter ?? createDefaultCoverLetter(cv);
    if (cl.date?.trim()) {
      drawRichParagraph([{ text: sanitizeWinAnsi(cl.date.trim()) }]);
      cursorY -= 8;
    }
    const recipientLines = [
      cl.recipientName?.trim(),
      cl.recipientTitle?.trim(),
      cl.companyName?.trim(),
      cl.companyAddress?.trim()
    ].filter((x) => Boolean(x));
    for (const line of recipientLines) {
      drawRichParagraph([{ text: sanitizeWinAnsi(line) }]);
    }
    cursorY -= 10;
    if (cl.subjectLine?.trim()) {
      const prefix = lang === "id" ? "Perihal: " : "Re: ";
      const text = cl.subjectLine.trim().toLowerCase().startsWith("perihal") || cl.subjectLine.trim().toLowerCase().startsWith("re:") ? cl.subjectLine.trim() : `${prefix}${cl.subjectLine.trim()}`;
      drawRichParagraph([{ text: sanitizeWinAnsi(text), bold: true }]);
      cursorY -= 8;
    }
    const salutation = cl.salutation?.trim() || (lang === "id" ? "Dengan hormat," : "Dear Hiring Manager,");
    drawRichParagraph([{ text: sanitizeWinAnsi(salutation) }]);
    cursorY -= 8;
    const paragraphs = [
      cl.openingParagraph,
      ...cl.bodyParagraphs || [],
      cl.closingParagraph
    ].map((p) => p?.trim()).filter((p) => Boolean(p));
    for (const para of paragraphs) {
      const subParas = para.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
      for (const sp of subParas) {
        drawRichParagraph(parseRichTextSpans(sp), { lineGapMultiplier: 1.32 });
        cursorY -= 8;
      }
    }
    cursorY -= 6;
    const signOff = cl.signOff?.trim() || (lang === "id" ? "Hormat saya," : "Sincerely,");
    drawRichParagraph([{ text: sanitizeWinAnsi(signOff) }]);
    cursorY -= 20;
    drawRichParagraph([
      { text: sanitizeWinAnsi(cv.personalInfo.fullName || "Candidate"), bold: true }
    ]);
  };
  const renderCVBody = () => {
    drawHeaderBlock();
    const defaultLabels = SECTION_LABELS2[lang];
    const renderSectionByKey = (key, customTitle) => {
      const sectionHeadingText = customTitle?.trim() || defaultLabels[key];
      switch (key) {
        case "summary": {
          if (!cv.summary?.content?.trim()) return;
          drawSectionHeading(sectionHeadingText);
          drawRichParagraph(parseRichTextSpans(cv.summary.content.trim()));
          cursorY -= 3;
          break;
        }
        case "education": {
          if (cv.education.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (const item of cv.education) {
            const degLine = [item.degree, item.fieldOfStudy].filter(Boolean).join(", ");
            drawTwoColRow(item.institution, item.location, fontBold, fontItalic);
            drawTwoColRow(
              degLine,
              drawDateRange(item.startDate, item.endDate, item.isCurrent),
              fontItalic,
              fontRegular
            );
            const extraBullets = [];
            if (item.gpa?.trim() || item.honors?.trim()) {
              const parts = [];
              if (item.gpa?.trim()) {
                parts.push(`${lang === "id" ? "IPK" : "GPA"}: **${item.gpa.trim()}**`);
              }
              if (item.honors?.trim()) {
                parts.push(item.honors.trim());
              }
              extraBullets.push(parts.join(" . "));
            }
            if (item.coursework?.trim()) {
              const cwLabel = lang === "id" ? "*Mata Kuliah Relevan*:" : "*Relevant Coursework*:";
              extraBullets.push(`${cwLabel} ${item.coursework.trim()}`);
            }
            if (item.thesis?.trim()) {
              const thLabel = lang === "id" ? "*Tesis / Tugas Akhir*:" : "*Thesis*:";
              extraBullets.push(`${thLabel} ${item.thesis.trim()}`);
            }
            drawBullets([...extraBullets, ...item.bullets]);
          }
          break;
        }
        case "experience": {
          if (cv.experience.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (const item of cv.experience) {
            drawTwoColRow(item.company, item.location, fontBold, fontItalic);
            drawTwoColRow(
              item.position,
              drawDateRange(item.startDate, item.endDate, item.isCurrent),
              fontItalic,
              fontRegular
            );
            drawBullets(item.bullets);
          }
          break;
        }
        case "leadership": {
          if (cv.leadership.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (const item of cv.leadership) {
            drawTwoColRow(item.organization, item.location, fontBold, fontItalic);
            drawTwoColRow(
              item.role,
              drawDateRange(item.startDate, item.endDate, item.isCurrent),
              fontItalic,
              fontRegular
            );
            drawBullets(item.bullets);
          }
          break;
        }
        case "projects": {
          if (cv.projects.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (const item of cv.projects) {
            const dateStr = drawDateRange(item.startDate, item.endDate, false);
            drawTwoColRow(item.name, dateStr, fontBold, fontRegular);
            if (item.techStack?.trim()) {
              drawRichParagraph([{ text: sanitizeWinAnsi(item.techStack.trim()), italic: true }]);
            }
            drawBullets(item.bullets);
          }
          break;
        }
        case "awards": {
          if (cv.awards.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (const item of cv.awards) {
            drawTwoColRow(
              `${item.title}${item.issuer ? ` -- ${item.issuer}` : ""}`,
              item.date,
              fontBold,
              fontRegular
            );
            if (item.description?.trim()) {
              drawBullets([item.description.trim()]);
            }
          }
          break;
        }
        case "certifications": {
          if (cv.certifications.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (const item of cv.certifications) {
            const left = [
              item.name,
              item.issuer ? `-- ${item.issuer}` : "",
              item.credentialId ? `(ID: ${item.credentialId})` : ""
            ].filter(Boolean).join(" ");
            drawTwoColRow(left, item.date, fontBold, fontRegular);
          }
          cursorY -= 2;
          break;
        }
        case "publications": {
          if (cv.publications.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (const item of cv.publications) {
            drawTwoColRow(item.title, item.date, fontBold, fontRegular);
            const sub = [item.authors, item.venue].filter(Boolean).join(" -- ");
            if (sub) {
              drawRichParagraph([{ text: sanitizeWinAnsi(sub), italic: true }]);
            }
          }
          cursorY -= 2;
          break;
        }
        case "skills": {
          const s = cv.skills;
          const hasAny = s.categories.length > 0 || s.languages.length > 0 || Boolean(s.interests?.trim());
          if (!hasAny) return;
          drawSectionHeading(sectionHeadingText);
          for (const cat of s.categories) {
            if (!cat.category?.trim() && !cat.items?.trim()) continue;
            drawRichParagraph([
              { text: `${sanitizeWinAnsi(cat.category.trim())}: `, bold: true },
              { text: sanitizeWinAnsi(cat.items.trim()) }
            ]);
          }
          if (s.languages.length > 0) {
            const lbl = lang === "id" ? "Bahasa: " : "Languages: ";
            const langItems = s.languages.map((l) => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ""}`).join(", ");
            drawRichParagraph([
              { text: lbl, bold: true },
              { text: sanitizeWinAnsi(langItems) }
            ]);
          }
          if (s.interests?.trim()) {
            const lbl = lang === "id" ? "Minat: " : "Interests: ";
            drawRichParagraph([
              { text: lbl, bold: true },
              { text: sanitizeWinAnsi(s.interests.trim()) }
            ]);
          }
          break;
        }
        case "custom": {
          if (cv.customSections.length === 0) return;
          for (const sec of cv.customSections) {
            if (!sec.sectionTitle?.trim() || sec.entries.length === 0) continue;
            drawSectionHeading(sec.sectionTitle.trim());
            for (const entry of sec.entries) {
              drawTwoColRow(entry.title, entry.location, fontBold, fontItalic);
              if (entry.subtitle?.trim() || entry.date?.trim()) {
                drawTwoColRow(entry.subtitle, entry.date, fontItalic, fontRegular);
              }
              drawBullets(entry.bullets);
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
  if (mode === "cover-letter") {
    renderCoverLetter();
  } else if (mode === "combined") {
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
  const localTectonic = path.resolve(process.cwd(), "bin", "tectonic");
  const tmpTectonic = path.join(os.tmpdir(), "tectonic");
  const candidates = [];
  for (const candidatePath of [localTectonic, tmpTectonic]) {
    if (fs.existsSync(candidatePath)) {
      try {
        fs.chmodSync(candidatePath, 493);
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
    const localBinDir = path.resolve(process.cwd(), "bin");
    let targetDir = localBinDir;
    try {
      await fsPromises.mkdir(localBinDir, { recursive: true });
      fs.accessSync(localBinDir, fs.constants.W_OK);
    } catch {
      targetDir = os.tmpdir();
    }
    const targetBin = path.join(targetDir, "tectonic");
    if (fs.existsSync(targetBin)) {
      try {
        fs.chmodSync(targetBin, 493);
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
        if (code === 0 && fs.existsSync(targetBin)) {
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
  if (cachedEngineInfo && cachedEngineInfo.name !== "none" && cachedEngineInfo.binPath !== "internal" && fs.existsSync(cachedEngineInfo.binPath)) {
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
    return fs.existsSync(dir) && fs.readdirSync(dir).some((f) => f.endsWith(".fmt"));
  } catch {
    return false;
  }
}
function resolveWritableCacheEnv() {
  const defaultHome = process.env.HOME || "/root";
  const workspaceCacheDir = path.resolve(process.cwd(), ".cache");
  const rootCacheDir = path.join(defaultHome, ".cache");
  const tmpCacheDir = path.join(os.tmpdir(), "tectonic-cache");
  if (!process.env.VERCEL) {
    for (const candidateCache of [
      workspaceCacheDir,
      rootCacheDir,
      "/tmp/empty_cache",
      tmpCacheDir
    ]) {
      const fmtDir = path.join(candidateCache, "Tectonic", "formats");
      if (hasFmtFiles(fmtDir)) {
        return { home: defaultHome, xdgCache: candidateCache, isWarm: true };
      }
    }
    try {
      fs.mkdirSync(workspaceCacheDir, { recursive: true });
      fs.accessSync(workspaceCacheDir, fs.constants.W_OK);
      return { home: defaultHome, xdgCache: workspaceCacheDir, isWarm: false };
    } catch {
    }
  }
  try {
    fs.mkdirSync(tmpCacheDir, { recursive: true });
  } catch {
  }
  const tmpWarm = hasFmtFiles(path.join(tmpCacheDir, "Tectonic", "formats"));
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
      const tempDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "buatcvkuy-warmup-"));
      const texFilePath = path.join(tempDir, "warmup.tex");
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
    const tempDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "buatcvkuy-"));
    const texFilePath = path.join(tempDir, "resume.tex");
    const pdfFilePath = path.join(tempDir, "resume.pdf");
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
      if (proc.code !== 0 || !fs.existsSync(pdfFilePath)) {
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
  const distPath = path2.resolve(process.cwd(), "dist");
  if (process.env.NODE_ENV === "production" && fs2.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path2.join(distPath, "index.html"));
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
