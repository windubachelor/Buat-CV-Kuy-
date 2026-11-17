import fs from 'fs';
import path from 'path';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, type PDFFont, type PDFPage, rgb, StandardFonts } from 'pdf-lib';
import {
  type CVData,
  type DocumentMode,
  isCoverLetterTemplatePreset,
  type SectionKey,
} from '../shared/schema';
import { createDefaultCoverLetter } from '../shared/templates';

interface StyledSpan {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

interface WordToken {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  width: number;
}

interface CmFontBuffers {
  regular: Uint8Array;
  bold: Uint8Array;
  italic: Uint8Array;
  boldItalic: Uint8Array;
}

let cachedCmFonts: CmFontBuffers | null = null;

const CM_FONT_FILES = {
  regular: 'cmunrm.ttf',
  bold: 'cmunbx.ttf',
  italic: 'cmunti.ttf',
  boldItalic: 'cmunbi.ttf',
} as const;

const CM_CDN_BASE =
  'https://cdn.jsdelivr.net/gh/dreampulse/computer-modern-web-font@master/font/Serif/';

async function loadSingleCmFont(fileName: string): Promise<Uint8Array> {
  const candidatePaths = [
    path.resolve(process.cwd(), 'public', 'fonts', fileName),
    path.resolve(process.cwd(), '..', 'public', 'fonts', fileName),
  ];

  for (const candidate of candidatePaths) {
    try {
      if (fs.existsSync(candidate)) {
        return new Uint8Array(fs.readFileSync(candidate));
      }
    } catch {
      // Fallback to next candidate or CDN
    }
  }

  const res = await fetch(`${CM_CDN_BASE}${fileName}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch Computer Modern font ${fileName}: ${res.status}`);
  }
  const arrayBuf = await res.arrayBuffer();
  return new Uint8Array(arrayBuf);
}

async function getComputerModernFontBuffers(): Promise<CmFontBuffers | null> {
  if (cachedCmFonts) return cachedCmFonts;
  try {
    const [regular, bold, italic, boldItalic] = await Promise.all([
      loadSingleCmFont(CM_FONT_FILES.regular),
      loadSingleCmFont(CM_FONT_FILES.bold),
      loadSingleCmFont(CM_FONT_FILES.italic),
      loadSingleCmFont(CM_FONT_FILES.boldItalic),
    ]);
    cachedCmFonts = { regular, bold, italic, boldItalic };
    return cachedCmFonts;
  } catch {
    return null;
  }
}

const MONTHS_ID_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];
const MONTHS_ID_LONG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const MONTHS_EN_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const MONTHS_EN_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SECTION_LABELS: Record<'id' | 'en', Record<SectionKey, string>> = {
  id: {
    summary: 'Ringkasan Profesional',
    education: 'Pendidikan',
    experience: 'Pengalaman Kerja',
    leadership: 'Kepemimpinan & Organisasi',
    projects: 'Proyek Terpilih',
    awards: 'Penghargaan & Beasiswa',
    certifications: 'Sertifikasi & Pelatihan',
    publications: 'Publikasi',
    skills: 'Keahlian & Minat',
    custom: 'Informasi Tambahan',
  },
  en: {
    summary: 'Professional Summary',
    education: 'Education',
    experience: 'Experience',
    leadership: 'Leadership & Activities',
    projects: 'Selected Projects',
    awards: 'Honors & Awards',
    certifications: 'Certifications & Training',
    publications: 'Publications',
    skills: 'Skills & Interests',
    custom: 'Additional Information',
  },
};

/**
 * Normalizes Unicode strings to clean printable characters for serif fonts.
 * Preserves true en-dash (–), em-dash (—), bullet (•), middot (·), and converts newlines/tabs to spaces
 * so words across line breaks are never glued together.
 */
function sanitizeWinAnsi(input: string): string {
  if (!input) return '';
  return (
    input
      .replace(/[\r\n\t\f\v\u00A0\u1680\u2000-\u200B\u2028\u2029\u202F\u205F\u3000\uFEFF]+/g, ' ')
      .replace(/\u00AD/g, '')
      .replace(/[\u2018\u2019\u201A\u201B\u02BC]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
      .replace(/\s*---\s*/g, ' \u2014 ')
      .replace(/\s*--\s*/g, ' \u2013 ')
      .replace(/\u2212/g, '-')
      .replace(/\s*->\s*/g, ' \u2013 ')
      .replace(/\u2192/g, ' \u2013 ')
      .replace(/\u2026/g, '...')
      .replace(/[^\x20-\x7E\xA0-\xFF\u2013\u2014\u2022]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
  );
}

function formatCVDateNative(
  raw: string,
  format: 'short' | 'numeric' | 'long',
  lang: 'id' | 'en'
): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const isoMatch = /^(\d{4})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    const year = isoMatch[1];
    const monthIndex = parseInt(isoMatch[2] ?? '1', 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      if (format === 'numeric') {
        return `${String(monthIndex + 1).padStart(2, '0')}/${year}`;
      }
      if (format === 'long') {
        return `${lang === 'id' ? MONTHS_ID_LONG[monthIndex] : MONTHS_EN_LONG[monthIndex]} ${year}`;
      }
      return `${lang === 'id' ? MONTHS_ID_SHORT[monthIndex] : MONTHS_EN_SHORT[monthIndex]} ${year}`;
    }
  }

  return sanitizeWinAnsi(trimmed);
}

function cleanDisplayUrl(rawUrl: string): string {
  return rawUrl
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '');
}

/**
 * Parses lightweight Markdown (**bold**, *italic*, [label](url)) into styled spans
 * while ensuring spaces around formatted tokens are preserved.
 */
export function parseRichTextSpans(raw: string): StyledSpan[] {
  const cleaned = sanitizeWinAnsi(raw.trim().replace(/^[-•*◦]\s+/, ''))
    .replace(/([^\s([{"'])\*\*([^*]+)\*\*/g, '$1 **$2**')
    .replace(/\*\*([^*]+)\*\*([^\s.,;:!?)\]}"'])/g, '**$1** $2');
  if (!cleaned) return [];

  const spans: StyledSpan[] = [];
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(cleaned)) !== null) {
    if (match.index > lastIdx) {
      spans.push({ text: cleaned.slice(lastIdx, match.index) });
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      spans.push({ text: token.slice(2, -2), bold: true });
    } else if (token.startsWith('*') && token.endsWith('*')) {
      spans.push({ text: token.slice(1, -1), italic: true });
    } else if (token.startsWith('[')) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        spans.push({ text: linkMatch[1] ?? '', underline: true });
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

/**
 * Converts a string into Title Case if the user typed it in all-lowercase or all-uppercase,
 * so LaTeX \scshape Small-Caps always renders prominent initial capital letters for each word.
 */
function ensureTitleCaseForSmallCaps(input: string): string {
  const safe = sanitizeWinAnsi(input);
  if (!safe) return '';
  return safe
    .split(' ')
    .map((word) => {
      if (!word) return '';
      if (word === '&' || word === '/' || word === '-') return word;
      const isAllUpper = word.length > 1 && word === word.toUpperCase();
      const isAllLower = word === word.toLowerCase();
      if (isAllUpper || isAllLower) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word;
    })
    .join(' ');
}

interface SmallCapSegment {
  text: string;
  size: number;
  width: number;
}

/**
 * Builds segments for authentic LaTeX \scshape (Small Caps):
 * Uppercase letters and numbers render at 100% capSize, while lowercase letters render
 * as uppercase glyphs at `smallCapScale` (0.75 * capSize).
 */
function buildSmallCapsSegments(
  rawText: string,
  capSize: number,
  font: PDFFont,
  smallCapScale = 0.75
): { segments: SmallCapSegment[]; totalWidth: number } {
  const normalized = ensureTitleCaseForSmallCaps(rawText);
  const smallSize = Number((capSize * smallCapScale).toFixed(2));
  const segments: SmallCapSegment[] = [];

  let currentText = '';
  let currentIsSmall = false;

  const flush = () => {
    if (!currentText) return;
    const sz = currentIsSmall ? smallSize : capSize;
    const w = font.widthOfTextAtSize(currentText, sz);
    segments.push({ text: currentText, size: sz, width: w });
    currentText = '';
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

/**
 * Draws a crisp vector Mobile / Telephone icon matching ModernCV's \phone[mobile] glyph.
 */
function drawMobilePhoneIcon(page: PDFPage, x: number, yBaseline: number, size: number) {
  const iconW = size * 0.52;
  const iconH = size * 0.76;
  const bottomY = yBaseline - size * 0.04;
  // Outer phone body
  page.drawRectangle({
    x,
    y: bottomY,
    width: iconW,
    height: iconH,
    borderColor: rgb(0.12, 0.12, 0.12),
    borderWidth: 0.75,
  });
  // Screen area
  page.drawRectangle({
    x: x + iconW * 0.16,
    y: bottomY + iconH * 0.22,
    width: iconW * 0.68,
    height: iconH * 0.62,
    borderColor: rgb(0.12, 0.12, 0.12),
    borderWidth: 0.45,
  });
  // Home button dot
  page.drawCircle({
    x: x + iconW / 2,
    y: bottomY + iconH * 0.11,
    size: iconW * 0.08,
    color: rgb(0.12, 0.12, 0.12),
  });
}

/**
 * Draws a crisp vector Envelope icon matching ModernCV's \email glyph.
 */
function drawEnvelopeIcon(page: PDFPage, x: number, yBaseline: number, size: number) {
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
    borderWidth: 0.75,
  });
  page.drawLine({
    start: { x, y: topY },
    end: { x: midX, y: flapY },
    thickness: 0.65,
    color: rgb(0.12, 0.12, 0.12),
  });
  page.drawLine({
    start: { x: x + iconW, y: topY },
    end: { x: midX, y: flapY },
    thickness: 0.65,
    color: rgb(0.12, 0.12, 0.12),
  });
}

/**
 * Compiles CVData into a 100% native vector, selectable, searchable Harvard OCS & Overleaf LaTeX PDF
 * on the backend server using authentic Computer Modern (`cmun*.ttf`) or Times Type-1 Serif fonts.
 */
export async function compileHarvardVectorPdf(
  cv: CVData,
  mode: DocumentMode = 'cv'
): Promise<{ pdfBase64: string; pageCount: number }> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(sanitizeWinAnsi(cv.title || cv.personalInfo.fullName || 'Harvard OCS Resume'));
  pdfDoc.setAuthor(sanitizeWinAnsi(cv.personalInfo.fullName || 'Candidate'));
  pdfDoc.setCreator('Buat CV Kuy - Harvard LaTeX Engine');

  const { settings } = cv;
  const useComputerModern =
    settings.fontFamily === 'lmodern' ||
    settings.templatePreset === 'jakes' ||
    settings.templatePreset === 'cover_letter_1' ||
    settings.templatePreset === 'simple_letter';

  let fontRegular: PDFFont;
  let fontBold: PDFFont;
  let fontItalic: PDFFont;
  let fontBoldItalic: PDFFont;

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

  const isLetter = settings.paperSize === 'letter';
  const pageWidth = isLetter ? 612.0 : 595.28;
  const pageHeight = isLetter ? 792.0 : 841.89;

  // Match geometry margins: 0.72in (normal/cover_letter_1), 0.52in (narrow/compact/wharton/mckinsey), 0.45in (compact/jakes)
  let marginIn = 0.72;
  if (settings.templatePreset === 'cover_letter_1') {
    marginIn = 0.75; // Matches \usepackage[scale=0.75]{geometry} in cover_letter_1.tex
  } else if (settings.margin === 'compact' || settings.templatePreset === 'jakes') {
    marginIn = 0.48;
  } else if (
    settings.margin === 'narrow' ||
    settings.templatePreset === 'compact' ||
    settings.templatePreset === 'wharton' ||
    settings.templatePreset === 'mckinsey'
  ) {
    marginIn = 0.52;
  }
  const marginPt = Number((marginIn * 72).toFixed(2));

  const baseSize =
    settings.fontSize === '10pt'
      ? 10.0
      : settings.fontSize === '10.5pt'
        ? 10.5
        : settings.fontSize === '11.5pt'
          ? 11.5
          : 11.0;

  const isCompact =
    settings.sectionSpacing === 'compact' ||
    settings.templatePreset === 'compact' ||
    settings.templatePreset === 'jakes' ||
    settings.templatePreset === 'wharton';
  const isRelaxed = settings.sectionSpacing === 'relaxed';

  const lineMultiplier = isCompact ? 1.13 : isRelaxed ? 1.22 : 1.16;
  const lineHeight = Number((baseSize * lineMultiplier).toFixed(2));
  const sectionBeforePt = isCompact ? 4.2 : isRelaxed ? 7.5 : 5.5;
  const sectionAfterPt = isCompact ? 1.0 : isRelaxed ? 2.5 : 1.5;
  const itemSepPt = isCompact ? 0.5 : isRelaxed ? 1.5 : 0.8;
  const topSepPt = isCompact ? 0.4 : isRelaxed ? 1.5 : 0.7;
  const entryGapPt = isCompact ? 2.4 : isRelaxed ? 4.5 : 3.2;

  const contentWidth = pageWidth - marginPt * 2;
  const lang = settings.cvLanguage === 'en' ? 'en' : 'id';
  const dateFormat = settings.dateFormat;

  let currentPage: PDFPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let cursorY = pageHeight - marginPt;

  const pickFont = (bold?: boolean, italic?: boolean): PDFFont => {
    if (bold && italic) return fontBoldItalic;
    if (bold) return fontBold;
    if (italic) return fontItalic;
    return fontRegular;
  };

  const ensureSpace = (neededPt: number) => {
    if (cursorY - neededPt < marginPt) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      cursorY = pageHeight - marginPt;
    }
  };

  const drawSmallCapsAt = (
    text: string,
    xStart: number,
    yBaseline: number,
    capSize: number,
    font: PDFFont,
    smallCapScale = 0.75
  ) => {
    const { segments } = buildSmallCapsSegments(text, capSize, font, smallCapScale);
    let x = xStart;
    for (const seg of segments) {
      currentPage.drawText(seg.text, {
        x,
        y: yBaseline,
        size: seg.size,
        font,
        color: rgb(0, 0, 0),
      });
      x += seg.width;
    }
  };

  const drawCenteredSmallCaps = (
    text: string,
    capSize: number,
    font: PDFFont,
    smallCapScale = 0.75
  ) => {
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
        color: rgb(0, 0, 0),
      });
      x += seg.width;
    }
    cursorY = yBaseline - 2.8;
  };

  const drawCenteredText = (
    text: string,
    size: number,
    font: PDFFont,
    color = rgb(0.04, 0.04, 0.04)
  ) => {
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
      color,
    });
    cursorY = yBaseline - 2.2;
  };

  const drawRightAlignedRow = (
    text: string,
    font: PDFFont,
    size = baseSize,
    iconType?: 'phone' | 'email'
  ) => {
    const safe = sanitizeWinAnsi(text);
    if (!safe) return;
    ensureSpace(lineHeight);
    const textWidth = font.widthOfTextAtSize(safe, size);
    const textX = pageWidth - marginPt - textWidth;
    const yBaseline = cursorY - size;

    if (iconType === 'phone') {
      drawMobilePhoneIcon(currentPage, textX - size * 0.8, yBaseline, size);
    } else if (iconType === 'email') {
      drawEnvelopeIcon(currentPage, textX - size * 1.0, yBaseline, size);
    }

    currentPage.drawText(safe, {
      x: textX,
      y: yBaseline,
      size,
      font,
      color: rgb(0, 0, 0),
    });
    cursorY -= Number((size * 1.22).toFixed(2));
  };

  const drawHeaderBlock = () => {
    const p = cv.personalInfo;
    const isJakes = settings.templatePreset === 'jakes';
    const headerCapSize =
      settings.templatePreset === 'academic'
        ? baseSize + 6.0
        : isJakes
          ? baseSize + 10.5 // Matches \Huge\scshape in Jake's Resume
          : baseSize + 8.5;

    // Candidate Name in authentic LaTeX {\Huge\scshape\bfseries} Small-Caps
    drawCenteredSmallCaps(p.fullName || 'Nama Lengkap', headerCapSize, fontBold, 0.75);

    // Jake's Resume in Overleaf does not have an italic headline row between the name and contact line
    if (!isJakes && p.headline && p.headline.trim()) {
      drawCenteredText(p.headline.trim(), baseSize, fontItalic, rgb(0.08, 0.08, 0.08));
    }

    if (isJakes) {
      // Jake's Resume: Phone | underlined Email | underlined LinkedIn | underlined GitHub
      interface ContactSeg {
        text: string;
        underline?: boolean;
      }
      const jakeContacts: ContactSeg[] = [];
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
          text: sanitizeWinAnsi(cleanDisplayUrl(p.linkedin)),
          underline: true,
        });
      }
      if (p.github?.trim()) {
        jakeContacts.push({
          text: sanitizeWinAnsi(cleanDisplayUrl(p.github)),
          underline: true,
        });
      }
      if (p.portfolio?.trim()) {
        jakeContacts.push({
          text: sanitizeWinAnsi(cleanDisplayUrl(p.portfolio)),
          underline: true,
        });
      }
      for (const custom of p.customLinks || []) {
        if (custom.url?.trim() || custom.label?.trim()) {
          jakeContacts.push({
            text: sanitizeWinAnsi(custom.label?.trim() || cleanDisplayUrl(custom.url)),
            underline: true,
          });
        }
      }

      if (jakeContacts.length > 0) {
        const contactSize = baseSize - 1.0; // \small
        const sep = ' | ';
        const sepW = fontRegular.widthOfTextAtSize(sep, contactSize);
        const totalW =
          jakeContacts.reduce(
            (acc, c) => acc + fontRegular.widthOfTextAtSize(c.text, contactSize),
            0
          ) +
          sepW * (jakeContacts.length - 1);

        ensureSpace(contactSize * 1.2);
        const yBaseline = cursorY - contactSize * 0.85;
        let x = Math.max(marginPt, (pageWidth - totalW) / 2);

        for (let i = 0; i < jakeContacts.length; i++) {
          const item = jakeContacts[i]!;
          const w = fontRegular.widthOfTextAtSize(item.text, contactSize);
          currentPage.drawText(item.text, {
            x,
            y: yBaseline,
            size: contactSize,
            font: fontRegular,
            color: rgb(0, 0, 0),
          });
          if (item.underline) {
            currentPage.drawRectangle({
              x,
              y: yBaseline - 1.1,
              width: w,
              height: 0.42,
              color: rgb(0, 0, 0),
            });
          }
          x += w;
          if (i < jakeContacts.length - 1) {
            currentPage.drawText(sep, {
              x,
              y: yBaseline,
              size: contactSize,
              font: fontRegular,
              color: rgb(0, 0, 0),
            });
            x += sepW;
          }
        }
        cursorY = yBaseline - 2.0;
      }
      return;
    }

    const contacts: string[] = [];
    if (p.location?.trim()) contacts.push(sanitizeWinAnsi(p.location.trim()));
    if (p.email?.trim()) contacts.push(sanitizeWinAnsi(p.email.trim()));
    if (p.phone?.trim()) contacts.push(sanitizeWinAnsi(p.phone.trim()));
    if (p.linkedin?.trim()) {
      const prefix = settings.showLinksIcon ? '[in] ' : '';
      contacts.push(`${prefix}${sanitizeWinAnsi(cleanDisplayUrl(p.linkedin))}`);
    }
    if (p.github?.trim()) {
      const prefix = settings.showLinksIcon ? '[gh] ' : '';
      contacts.push(`${prefix}${sanitizeWinAnsi(cleanDisplayUrl(p.github))}`);
    }
    if (p.portfolio?.trim()) {
      const prefix = settings.showLinksIcon ? '[web] ' : '';
      contacts.push(`${prefix}${sanitizeWinAnsi(cleanDisplayUrl(p.portfolio))}`);
    }
    for (const custom of p.customLinks || []) {
      if (custom.url?.trim() || custom.label?.trim()) {
        contacts.push(
          sanitizeWinAnsi(custom.label?.trim() || cleanDisplayUrl(custom.url))
        );
      }
    }

    if (contacts.length > 0) {
      const contactLine = contacts.join('   \u00B7   ');
      drawCenteredText(contactLine, baseSize - 0.9, fontRegular, rgb(0.06, 0.06, 0.06));
    }

    if (settings.templatePreset === 'wharton') {
      cursorY -= 2.0;
      currentPage.drawRectangle({
        x: marginPt,
        y: cursorY,
        width: contentWidth,
        height: 0.65,
        color: rgb(0, 0, 0),
      });
      cursorY -= 2.0;
    } else if (settings.templatePreset === 'mckinsey') {
      cursorY -= 2.0;
      currentPage.drawRectangle({
        x: marginPt,
        y: cursorY,
        width: contentWidth,
        height: 0.95,
        color: rgb(0, 0, 0),
      });
      cursorY -= 2.0;
      currentPage.drawRectangle({
        x: marginPt,
        y: cursorY,
        width: contentWidth,
        height: 0.35,
        color: rgb(0, 0, 0),
      });
      cursorY -= 2.0;
    } else {
      cursorY -= 1.0;
    }
  };

  /**
   * Matches \titleformat{\section}{\scshape\large\bfseries}{}{0em}{}[\vspace{1.5pt}\titlerule]
   * For Jake's Resume: \titleformat{\section}{\scshape\raggedright\large}{}{0em}{}[\color{black}\titlerule]
   */
  const drawSectionHeading = (title: string) => {
    const isJakes = settings.templatePreset === 'jakes';
    const headingCapSize = baseSize + 1.4; // \large
    ensureSpace(sectionBeforePt + headingCapSize + sectionAfterPt + lineHeight * 2);

    cursorY -= sectionBeforePt;
    const yBaseline = cursorY - headingCapSize * 0.85;
    // Jake's Resume uses regular (unbolded) Computer Modern Small-Caps for section titles
    const sectionFont = isJakes ? fontRegular : fontBold;
    drawSmallCapsAt(title, marginPt, yBaseline, headingCapSize, sectionFont, 0.75);

    const ruleY = yBaseline - 2.2;
    currentPage.drawRectangle({
      x: marginPt,
      y: ruleY,
      width: contentWidth,
      height: 0.52,
      color: rgb(0, 0, 0),
    });

    cursorY = ruleY - sectionAfterPt;
  };

  const drawTwoColRow = (
    leftText: string,
    rightText: string,
    leftFont: PDFFont,
    rightFont: PDFFont,
    size = baseSize,
    leftIndentPt = 0
  ) => {
    const safeLeft = sanitizeWinAnsi(leftText);
    const safeRight = sanitizeWinAnsi(rightText);
    if (!safeLeft && !safeRight) return;

    const rowH = Number((size * lineMultiplier).toFixed(2));
    ensureSpace(rowH);
    const rightWidth = safeRight ? rightFont.widthOfTextAtSize(safeRight, size) : 0;
    const maxLeftWidth = Math.max(120, contentWidth - leftIndentPt - rightWidth - 12);

    let displayLeft = safeLeft;
    while (
      displayLeft.length > 10 &&
      leftFont.widthOfTextAtSize(displayLeft, size) > maxLeftWidth
    ) {
      displayLeft = `${displayLeft.slice(0, -4)}...`;
    }

    const yBaseline = cursorY - size;
    if (displayLeft) {
      currentPage.drawText(displayLeft, {
        x: marginPt + leftIndentPt,
        y: yBaseline,
        size,
        font: leftFont,
        color: rgb(0, 0, 0),
      });
    }

    if (safeRight) {
      currentPage.drawText(safeRight, {
        x: pageWidth - marginPt - rightWidth,
        y: yBaseline,
        size,
        font: rightFont,
        color: rgb(0, 0, 0),
      });
    }

    cursorY -= rowH;
  };

  /**
   * Renders a single-line left-and-right header where the left side contains mixed spans
   * (e.g., Jake's Resume `\resumeProjectHeading{\textbf{Gitlytics} $|$ \emph{Python, Flask...}}{June 2020 -- Present}`).
   */
  const drawMixedLeftTwoColRow = (
    leftSpans: StyledSpan[],
    rightText: string,
    rightFont: PDFFont,
    size = baseSize,
    leftIndentPt = 0
  ) => {
    const safeRight = sanitizeWinAnsi(rightText);
    const rowH = Number((size * lineMultiplier).toFixed(2));
    ensureSpace(rowH);

    const yBaseline = cursorY - size;
    let x = marginPt + leftIndentPt;
    for (const span of leftSpans) {
      const text = sanitizeWinAnsi(span.text);
      if (!text) continue;
      // Preserve leading/trailing space around pipe separator
      const hasLeadSpace = /^\s/.test(span.text);
      const hasTrailSpace = /\s$/.test(span.text);
      const rendered = `${hasLeadSpace ? ' ' : ''}${text}${hasTrailSpace ? ' ' : ''}`;
      const f = pickFont(span.bold, span.italic);
      const w = f.widthOfTextAtSize(rendered, size);
      currentPage.drawText(rendered, {
        x,
        y: yBaseline,
        size,
        font: f,
        color: rgb(0, 0, 0),
      });
      if (span.underline) {
        currentPage.drawRectangle({
          x,
          y: yBaseline - 1.1,
          width: w,
          height: 0.42,
          color: rgb(0, 0, 0),
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
        color: rgb(0, 0, 0),
      });
    }

    cursorY -= rowH;
  };

  /**
   * Renders a rich-text paragraph or bullet item with optional full LaTeX-style justification
   * (left and right margins aligned on all wrapped lines except the last line).
   */
  const drawRichParagraph = (
    spans: StyledSpan[],
    options?: {
      indentPt?: number;
      bulletStyle?: 'solid' | 'circle';
      bulletOffsetPt?: number;
      size?: number;
      lineGapMultiplier?: number;
      justify?: boolean;
    }
  ) => {
    const size = options?.size ?? baseSize;
    const indentPt = options?.indentPt ?? 0;
    const bulletStyle = options?.bulletStyle;
    const bulletOffsetPt = options?.bulletOffsetPt ?? 4.0;
    const justify = options?.justify ?? true;
    const rowHeight = Number((size * (options?.lineGapMultiplier ?? lineMultiplier)).toFixed(2));
    const availWidth = contentWidth - indentPt;

    const words: WordToken[] = [];
    for (const span of spans) {
      const f = pickFont(span.bold, span.italic);
      const parts = span.text.split(/(\s+)/);
      for (const part of parts) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          words.push({
            text: ' ',
            bold: span.bold,
            italic: span.italic,
            underline: span.underline,
            width: f.widthOfTextAtSize(' ', size),
          });
        } else {
          words.push({
            text: part,
            bold: span.bold,
            italic: span.italic,
            underline: span.underline,
            width: f.widthOfTextAtSize(part, size),
          });
        }
      }
    }

    const lines: WordToken[][] = [];
    let currentLine: WordToken[] = [];
    let currentWidth = 0;

    for (const word of words) {
      if (currentLine.length === 0 && word.text === ' ') {
        continue;
      }
      if (currentWidth + word.width > availWidth && currentLine.length > 0) {
        while (currentLine.length > 0 && currentLine[currentLine.length - 1]?.text === ' ') {
          const popped = currentLine.pop()!;
          currentWidth -= popped.width;
        }
        lines.push(currentLine);
        currentLine = word.text === ' ' ? [] : [word];
        currentWidth = word.text === ' ' ? 0 : word.width;
      } else {
        currentLine.push(word);
        currentWidth += word.width;
      }
    }
    while (currentLine.length > 0 && currentLine[currentLine.length - 1]?.text === ' ') {
      currentLine.pop();
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      ensureSpace(rowHeight);
      const yPos = cursorY - size;

      if (lineIdx === 0 && bulletStyle) {
        if (bulletStyle === 'circle') {
          // Open circle bullet (◦) matching ModernCV Classic itemize in Overleaf
          currentPage.drawCircle({
            x: marginPt + bulletOffsetPt + 2.2,
            y: yPos + size * 0.28,
            size: 1.75,
            borderColor: rgb(0, 0, 0),
            borderWidth: 0.7,
          });
        } else {
          // Crisp solid round LaTeX bullet (\textbullet)
          currentPage.drawCircle({
            x: marginPt + bulletOffsetPt + 2.0,
            y: yPos + size * 0.28,
            size: 1.55,
            color: rgb(0, 0, 0),
          });
        }
      }

      const lineTokens = lines[lineIdx] ?? [];
      const isLastLine = lineIdx === lines.length - 1;
      const spaceCount = lineTokens.filter((t) => t.text === ' ').length;
      const naturalLineWidth = lineTokens.reduce((acc, t) => acc + t.width, 0);
      const slack = availWidth - naturalLineWidth;

      const extraPerSpace =
        justify && !isLastLine && spaceCount > 0 && slack > 0 && slack < availWidth * 0.28
          ? slack / spaceCount
          : 0;

      let xPos = marginPt + indentPt;
      for (const tok of lineTokens) {
        if (tok.text === ' ') {
          xPos += tok.width + extraPerSpace;
          continue;
        }
        const tokFont = pickFont(tok.bold, tok.italic);
        currentPage.drawText(tok.text, {
          x: xPos,
          y: yPos,
          size,
          font: tokFont,
          color: rgb(0, 0, 0),
        });
        if (tok.underline) {
          currentPage.drawRectangle({
            x: xPos,
            y: yPos - 1.2,
            width: tok.width,
            height: 0.45,
            color: rgb(0, 0, 0),
          });
        }
        xPos += tok.width;
      }

      cursorY -= rowHeight;
    }
  };

  /**
   * Renders a list of bullet points matching \setlist[itemize]{leftmargin=1.35em,itemsep=...,topsep=...}
   */
  const drawBullets = (
    bullets: string[],
    options?: {
      bulletStyle?: 'solid' | 'circle';
      size?: number;
      extraIndentPt?: number;
    }
  ) => {
    const nonEmpty = bullets.map((b) => b.trim()).filter(Boolean);
    if (nonEmpty.length === 0) return;

    const bSize = options?.size ?? baseSize;
    const extraIndent = options?.extraIndentPt ?? 0;
    const bStyle = options?.bulletStyle ?? 'solid';

    cursorY -= topSepPt;
    for (let i = 0; i < nonEmpty.length; i++) {
      const b = nonEmpty[i]!;
      const spans = parseRichTextSpans(b);
      if (spans.length > 0) {
        drawRichParagraph(spans, {
          indentPt: extraIndent + bSize * 1.35,
          bulletStyle: bStyle,
          bulletOffsetPt: extraIndent + 3.5,
          size: bSize,
          justify: true,
        });
        if (i < nonEmpty.length - 1) {
          cursorY -= itemSepPt;
        }
      }
    }
  };

  /**
   * Formats start and end dates with true en-dash (\u2013) matching LaTeX `Agu 2024 – Sekarang`.
   */
  const drawDateRange = (start?: string, end?: string, isCurrent?: boolean): string => {
    const left = start?.trim() ? formatCVDateNative(start.trim(), dateFormat, lang) : '';
    const presentLabel = lang === 'id' ? 'Sekarang' : 'Present';
    const right = isCurrent
      ? presentLabel
      : end?.trim()
        ? formatCVDateNative(end.trim(), dateFormat, lang)
        : '';

    if (left && right) return `${left} \u2013 ${right}`;
    return left || right || '';
  };

  const renderCoverLetter = () => {
    const rawCl = cv.coverLetter;
    const hasContent = Boolean(
      rawCl &&
        (rawCl.openingParagraph?.trim() ||
          rawCl.bodyParagraphs?.some((p) => p.trim()) ||
          rawCl.closingParagraph?.trim())
    );
    const cl = hasContent ? rawCl : createDefaultCoverLetter(cv);
    const preset = settings.templatePreset;
    const p = cv.personalInfo;

    const dateLine = sanitizeWinAnsi(
      cl.date?.trim() || (lang === 'id' ? '17 November 2026' : 'November 17, 2026')
    );

    if (preset === 'cover_letter_1') {
      // Exact Overleaf cover_letter_1.tex (\documentclass[11pt,a4paper,roman]{moderncv} \moderncvstyle{classic} \moderncvcolor{black})
      // 1. Top-Right Sender Block (Right-aligned: Bold Name, Italic Address, Mobile Icon + Italic Phone, Envelope Icon + Italic Email)
      drawRightAlignedRow(p.fullName || 'Nama Lengkap', fontBold, baseSize);
      if (p.location?.trim()) {
        drawRightAlignedRow(p.location.trim(), fontItalic, baseSize);
      }
      if (p.phone?.trim()) {
        drawRightAlignedRow(p.phone.trim(), fontItalic, baseSize, 'phone');
      }
      if (p.email?.trim()) {
        drawRightAlignedRow(p.email.trim(), fontItalic, baseSize, 'email');
      }

      cursorY -= 14;

      // 2. Recipient Block ("Kepada Yth." / "To" in Bold on left, Date in Regular on right)
      drawTwoColRow(lang === 'id' ? 'Kepada Yth.' : 'To', dateLine, fontBold, fontRegular, baseSize);

      // Italic recipient lines below "Kepada Yth." / "To"
      const recLines = [
        cl.recipientName?.trim(),
        cl.recipientTitle?.trim(),
        cl.companyName?.trim(),
        cl.companyAddress?.trim(),
      ].filter((line): line is string => Boolean(line));

      for (const rLine of recLines) {
        drawRichParagraph([{ text: sanitizeWinAnsi(rLine), italic: true }], {
          justify: false,
          lineGapMultiplier: 1.18,
        });
      }

      cursorY -= 16;

      // 3. Bold Subject Line (\opening{\textbf{Sub: ...}})
      if (cl.subjectLine?.trim()) {
        const prefix = lang === 'id' ? 'Perihal: ' : 'Sub: ';
        const rawSub = cl.subjectLine.trim();
        const hasPrefix =
          rawSub.toLowerCase().startsWith('perihal') ||
          rawSub.toLowerCase().startsWith('sub:') ||
          rawSub.toLowerCase().startsWith('re:');
        const fullSubject = hasPrefix ? rawSub : `${prefix}${rawSub}`;
        drawRichParagraph([{ text: sanitizeWinAnsi(fullSubject), bold: true }], {
          justify: false,
          lineGapMultiplier: 1.2,
        });
        cursorY -= 14;
      }

      // 4. Salutation ("Dengan hormat," / "Respected Sir,")
      const salutation =
        cl.salutation?.trim() || (lang === 'id' ? 'Dengan hormat,' : 'Respected Sir,');
      drawRichParagraph([{ text: sanitizeWinAnsi(salutation) }], { justify: false });
      cursorY -= 10;

      // 5. Body Paragraphs with Open Circle Bullets (◦) for itemize blocks
      const paragraphs = [
        cl.openingParagraph,
        ...(cl.bodyParagraphs || []),
        cl.closingParagraph,
      ]
        .map((pItem) => pItem?.trim())
        .filter((pItem): pItem is string => Boolean(pItem));

      for (const para of paragraphs) {
        const lines = para
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
        const bulletLines = lines.filter((l) => /^[•\-*◦]\s+/.test(l));
        if (bulletLines.length > 0) {
          const introLines = lines.filter((l) => !/^[•\-*◦]\s+/.test(l));
          if (introLines.length > 0) {
            drawRichParagraph(parseRichTextSpans(introLines.join(' ')), {
              lineGapMultiplier: 1.22,
              justify: false,
            });
            cursorY -= 4;
          }
          drawBullets(
            bulletLines.map((b) => b.replace(/^[•\-*◦]\s+/, '')),
            {
              bulletStyle: 'circle',
              extraIndentPt: 4,
            }
          );
          cursorY -= 8;
        } else {
          const subParas = para
            .split(/\n{2,}/)
            .map((s) => s.trim())
            .filter(Boolean);
          for (const sp of subParas) {
            drawRichParagraph(parseRichTextSpans(sp), {
              lineGapMultiplier: 1.22,
              justify: false,
            });
            cursorY -= 9;
          }
        }
      }

      // 6. Closing & Enclosures
      cursorY -= 4;
      const signOff = cl.signOff?.trim() || (lang === 'id' ? 'Hormat saya,' : 'Yours faithfully,');
      drawRichParagraph([{ text: sanitizeWinAnsi(signOff) }], { justify: false });
      cursorY -= 16;
      drawRichParagraph(
        [{ text: sanitizeWinAnsi(cv.personalInfo.fullName || 'Candidate'), bold: true }],
        { justify: false }
      );

      const enclosures = (cl.enclosures || []).map((e) => e.trim()).filter(Boolean);
      if (enclosures.length > 0) {
        cursorY -= 12;
        const encTitle =
          lang === 'id'
            ? 'Lampiran (Berkas / Sertifikat Terlampir):'
            : 'Enclosed (Marksheets / Certificates):';
        drawRichParagraph([{ text: encTitle, bold: true }], {
          size: baseSize - 0.5,
          justify: false,
        });
        cursorY -= 2;
        for (const item of enclosures) {
          drawRichParagraph([{ text: sanitizeWinAnsi(item) }], {
            size: baseSize - 0.8,
            justify: false,
          });
        }
      }
      return;
    }

    if (preset === 'simple_letter') {
      // Overleaf Standard Letter (\documentclass{letter}): Right-aligned sender return address + date
      drawRightAlignedRow(p.fullName || 'Nama Lengkap', fontBold, baseSize);
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
      // Standard Harvard OCS Cover Letter Header
      drawHeaderBlock();
      currentPage.drawRectangle({
        x: marginPt,
        y: cursorY + 1,
        width: contentWidth,
        height: 0.6,
        color: rgb(0, 0, 0),
      });
      cursorY -= 12;
      drawRichParagraph([{ text: dateLine }], { justify: false });
      cursorY -= 9;
    }

    if (cl.recipientName?.trim()) {
      drawRichParagraph([{ text: sanitizeWinAnsi(cl.recipientName.trim()), bold: true }], {
        justify: false,
      });
    }
    if (cl.recipientTitle?.trim()) {
      drawRichParagraph([{ text: sanitizeWinAnsi(cl.recipientTitle.trim()), italic: true }], {
        justify: false,
      });
    }
    if (cl.companyName?.trim()) {
      drawRichParagraph([{ text: sanitizeWinAnsi(cl.companyName.trim()) }], { justify: false });
    }
    if (cl.companyAddress?.trim()) {
      drawRichParagraph([{ text: sanitizeWinAnsi(cl.companyAddress.trim()) }], {
        justify: false,
      });
    }
    cursorY -= 9;

    if (cl.subjectLine?.trim()) {
      const prefix = lang === 'id' ? 'Perihal: ' : 'Sub: ';
      const text =
        cl.subjectLine.trim().toLowerCase().startsWith('perihal') ||
        cl.subjectLine.trim().toLowerCase().startsWith('sub:') ||
        cl.subjectLine.trim().toLowerCase().startsWith('re:')
          ? cl.subjectLine.trim()
          : `${prefix}${cl.subjectLine.trim()}`;
      drawRichParagraph([{ text: sanitizeWinAnsi(text), bold: true }], { justify: false });
      cursorY -= 9;
    }

    const salutation =
      cl.salutation?.trim() ||
      (lang === 'id' ? 'Dengan hormat,' : 'Dear Hiring Manager,');
    drawRichParagraph([{ text: sanitizeWinAnsi(salutation) }], { justify: false });
    cursorY -= 8;

    const paragraphs = [
      cl.openingParagraph,
      ...(cl.bodyParagraphs || []),
      cl.closingParagraph,
    ]
      .map((pItem) => pItem?.trim())
      .filter((pItem): pItem is string => Boolean(pItem));

    for (const para of paragraphs) {
      const lines = para
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      const bulletLines = lines.filter((l) => /^[•\-*◦]\s+/.test(l));
      if (bulletLines.length > 0) {
        const introLines = lines.filter((l) => !/^[•\-*◦]\s+/.test(l));
        if (introLines.length > 0) {
          drawRichParagraph(parseRichTextSpans(introLines.join(' ')), {
            lineGapMultiplier: 1.24,
            justify: true,
          });
          cursorY -= 3;
        }
        drawBullets(bulletLines.map((b) => b.replace(/^[•\-*◦]\s+/, '')));
        cursorY -= 6;
      } else {
        const subParas = para
          .split(/\n{2,}/)
          .map((s) => s.trim())
          .filter(Boolean);
        for (const sp of subParas) {
          drawRichParagraph(parseRichTextSpans(sp), { lineGapMultiplier: 1.24, justify: true });
          cursorY -= 8;
        }
      }
    }

    cursorY -= 4;
    const signOff = cl.signOff?.trim() || (lang === 'id' ? 'Hormat saya,' : 'Sincerely,');
    drawRichParagraph([{ text: sanitizeWinAnsi(signOff) }], { justify: false });
    cursorY -= 18;
    drawRichParagraph(
      [{ text: sanitizeWinAnsi(cv.personalInfo.fullName || 'Candidate'), bold: true }],
      { justify: false }
    );

    const enclosures = (cl.enclosures || []).map((e) => e.trim()).filter(Boolean);
    if (enclosures.length > 0) {
      cursorY -= 10;
      const encTitle =
        lang === 'id'
          ? 'Lampiran (Berkas / Sertifikat Terlampir):'
          : 'Enclosed (Marksheets / Certificates):';
      drawRichParagraph([{ text: encTitle, bold: true }], {
        size: baseSize - 0.5,
        justify: false,
      });
      cursorY -= 2;
      for (const item of enclosures) {
        drawRichParagraph([{ text: sanitizeWinAnsi(item) }], {
          size: baseSize - 0.9,
          justify: false,
        });
      }
    }

    if (cl.postscript?.trim()) {
      cursorY -= 10;
      drawRichParagraph([{ text: sanitizeWinAnsi(cl.postscript.trim()), italic: true }], {
        size: baseSize - 0.4,
        justify: true,
      });
    }
  };

  const renderCVBody = () => {
    drawHeaderBlock();

    const defaultLabels = SECTION_LABELS[lang];
    const isJakes = settings.templatePreset === 'jakes';
    const jakesIndentPt = isJakes ? 7.0 : 0; // Matches \resumeSubHeadingListStart leftmargin=0.15in
    const jakesSubSize = isJakes ? baseSize - 0.8 : baseSize; // Matches \small in Jake's Resume

    const renderSectionByKey = (key: SectionKey, customTitle?: string) => {
      const sectionHeadingText =
        customTitle?.trim() ||
        (isJakes && key === 'projects' && lang === 'en'
          ? 'Projects'
          : isJakes && key === 'skills' && lang === 'en'
            ? 'Technical Skills'
            : defaultLabels[key]);

      switch (key) {
        case 'summary': {
          if (!cv.summary?.content?.trim()) return;
          drawSectionHeading(sectionHeadingText);
          drawRichParagraph(parseRichTextSpans(cv.summary.content.trim()), {
            indentPt: jakesIndentPt,
            justify: true,
          });
          cursorY -= 2;
          break;
        }
        case 'education': {
          const validEdu = cv.education.filter(
            (e) => e.institution.trim() || e.degree.trim()
          );
          if (validEdu.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (let idx = 0; idx < validEdu.length; idx++) {
            const item = validEdu[idx]!;
            const degLine = [item.degree.trim(), item.fieldOfStudy.trim()]
              .filter(Boolean)
              .join(', ');
            const dateStr = drawDateRange(item.startDate, item.endDate, item.isCurrent);

            if (isJakes) {
              // Jake's Resume Education \resumeSubheading:
              // Row 1: Bold Institution (left) | Regular Location (right)
              // Row 2 (\small): Italic Degree (left) | Italic Date (right)
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

            const extraBullets: string[] = [];
            if (item.gpa?.trim() || item.honors?.trim()) {
              const parts: string[] = [];
              if (item.gpa?.trim()) {
                parts.push(`${lang === 'id' ? 'IPK' : 'GPA'}: **${item.gpa.trim()}**`);
              }
              if (item.honors?.trim()) {
                parts.push(item.honors.trim());
              }
              extraBullets.push(parts.join(' \u00B7 '));
            }
            if (item.coursework?.trim()) {
              const cwLabel =
                lang === 'id' ? '*Mata Kuliah Relevan*:' : '*Relevant Coursework*:';
              extraBullets.push(`${cwLabel} ${item.coursework.trim()}`);
            }
            if (item.thesis?.trim()) {
              const thLabel = lang === 'id' ? '*Tesis/Skripsi*:' : '*Thesis*:';
              extraBullets.push(`${thLabel} ${item.thesis.trim()}`);
            }
            drawBullets([...extraBullets, ...item.bullets], {
              size: jakesSubSize,
              extraIndentPt: jakesIndentPt,
            });
            if (idx < validEdu.length - 1) {
              cursorY -= entryGapPt;
            }
          }
          break;
        }
        case 'experience': {
          const validExp = cv.experience.filter(
            (e) => e.company.trim() || e.position.trim()
          );
          if (validExp.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (let idx = 0; idx < validExp.length; idx++) {
            const item = validExp[idx]!;
            const dateStr = drawDateRange(item.startDate, item.endDate, item.isCurrent);

            if (isJakes) {
              // Jake's Resume Experience \resumeSubheading:
              // Row 1: Bold Position/Role (left) | Regular Date (right)
              // Row 2 (\small): Italic Company (left) | Italic Location (right)
              drawTwoColRow(
                item.position || item.company,
                dateStr,
                fontBold,
                fontRegular,
                baseSize,
                jakesIndentPt
              );
              drawTwoColRow(
                item.position ? item.company : '',
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
              extraIndentPt: jakesIndentPt,
            });
            if (idx < validExp.length - 1) {
              cursorY -= entryGapPt;
            }
          }
          break;
        }
        case 'leadership': {
          const validLead = cv.leadership.filter(
            (l) => l.organization.trim() || l.role.trim()
          );
          if (validLead.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (let idx = 0; idx < validLead.length; idx++) {
            const item = validLead[idx]!;
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
                item.role ? item.organization : '',
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
              extraIndentPt: jakesIndentPt,
            });
            if (idx < validLead.length - 1) {
              cursorY -= entryGapPt;
            }
          }
          break;
        }
        case 'projects': {
          const validProj = cv.projects.filter((p) => p.name.trim());
          if (validProj.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (let idx = 0; idx < validProj.length; idx++) {
            const item = validProj[idx]!;
            const linkText = item.link?.trim() ? cleanDisplayUrl(item.link) : '';
            const dateStr = drawDateRange(item.startDate, item.endDate, false);

            if (isJakes) {
              // Jake's Resume \resumeProjectHeading{\textbf{Project Name} $|$ \emph{Tech Stack}}{Date}
              const leftSpans: StyledSpan[] = [{ text: item.name.trim(), bold: true }];
              if (item.techStack?.trim()) {
                leftSpans.push({ text: ' | ' });
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
                drawTwoColRow(item.techStack?.trim() || '', dateStr, fontItalic, fontRegular);
              }
            }

            drawBullets(item.bullets, {
              size: jakesSubSize,
              extraIndentPt: jakesIndentPt,
            });
            if (idx < validProj.length - 1) {
              cursorY -= entryGapPt;
            }
          }
          break;
        }
        case 'awards': {
          const validAwards = cv.awards.filter((a) => a.title.trim());
          if (validAwards.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (const item of validAwards) {
            const dateStr = item.date?.trim()
              ? formatCVDateNative(item.date.trim(), dateFormat, lang)
              : '';
            const leftSpans: StyledSpan[] = [{ text: sanitizeWinAnsi(item.title), bold: true }];
            if (item.issuer?.trim()) {
              leftSpans.push({ text: `, ${sanitizeWinAnsi(item.issuer.trim())}`, italic: true });
            }
            if (item.description?.trim()) {
              leftSpans.push({
                text: ` \u2013 ${sanitizeWinAnsi(item.description.trim())}`,
              });
            }
            if (dateStr) {
              drawTwoColRow(
                leftSpans.map((s) => s.text).join(''),
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
        case 'certifications': {
          const validCerts = cv.certifications.filter((c) => c.name.trim());
          if (validCerts.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (const item of validCerts) {
            const dateStr = item.date?.trim()
              ? formatCVDateNative(item.date.trim(), dateFormat, lang)
              : '';
            const left = [
              item.name.trim(),
              item.issuer?.trim() ? `\u2013 ${item.issuer.trim()}` : '',
              item.credentialId?.trim() ? `(${item.credentialId.trim()})` : '',
            ]
              .filter(Boolean)
              .join(' ');
            drawTwoColRow(left, dateStr, fontBold, fontRegular, baseSize, jakesIndentPt);
            cursorY -= 1.5;
          }
          break;
        }
        case 'publications': {
          const validPubs = cv.publications.filter((p) => p.title.trim());
          if (validPubs.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (const item of validPubs) {
            const dateStr = item.date?.trim()
              ? ` (${formatCVDateNative(item.date.trim(), dateFormat, lang)})`
              : '';
            const spans: StyledSpan[] = [];
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
        case 'skills': {
          const s = cv.skills;
          const hasAny =
            s.categories.some((c) => c.category.trim() && c.items.trim()) ||
            s.languages.some((l) => l.language.trim()) ||
            Boolean(s.interests?.trim());
          if (!hasAny) return;

          drawSectionHeading(sectionHeadingText);
          const skillSize = isJakes ? jakesSubSize : baseSize;

          for (const cat of s.categories) {
            if (!cat.category?.trim() || !cat.items?.trim()) continue;
            drawRichParagraph(
              [
                { text: `${sanitizeWinAnsi(cat.category.trim())}: `, bold: true },
                { text: sanitizeWinAnsi(cat.items.trim()) },
              ],
              { indentPt: jakesIndentPt, size: skillSize, justify: false }
            );
            cursorY -= 1.2;
          }
          const validLangs = s.languages.filter((l) => l.language.trim());
          if (validLangs.length > 0) {
            const lbl = lang === 'id' ? 'Bahasa: ' : 'Languages: ';
            const langItems = validLangs
              .map((l) =>
                l.proficiency?.trim()
                  ? `${l.language.trim()} (${l.proficiency.trim()})`
                  : l.language.trim()
              )
              .join(', ');
            drawRichParagraph(
              [
                { text: lbl, bold: true },
                { text: sanitizeWinAnsi(langItems) },
              ],
              { indentPt: jakesIndentPt, size: skillSize, justify: false }
            );
            cursorY -= 1.2;
          }
          if (s.interests?.trim()) {
            const lbl = lang === 'id' ? 'Minat: ' : 'Interests: ';
            drawRichParagraph(
              [
                { text: lbl, bold: true },
                { text: sanitizeWinAnsi(s.interests.trim()) },
              ],
              { indentPt: jakesIndentPt, size: skillSize, justify: false }
            );
          }
          break;
        }
        case 'custom': {
          if (cv.customSections.length === 0) return;
          for (const sec of cv.customSections) {
            const validEntries = sec.entries.filter((e) => e.title.trim());
            if (!sec.sectionTitle?.trim() || validEntries.length === 0) continue;
            drawSectionHeading(sec.sectionTitle.trim());
            for (let idx = 0; idx < validEntries.length; idx++) {
              const entry = validEntries[idx]!;
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
                extraIndentPt: jakesIndentPt,
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

  const effectiveMode: DocumentMode =
    isCoverLetterTemplatePreset(settings.templatePreset) && mode === 'cv'
      ? 'cover-letter'
      : mode;

  if (effectiveMode === 'cover-letter') {
    renderCoverLetter();
  } else if (effectiveMode === 'combined') {
    renderCoverLetter();
    currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    cursorY = pageHeight - marginPt;
    renderCVBody();
  } else {
    renderCVBody();
  }

  const pdfBytes = await pdfDoc.save();
  return {
    pdfBase64: Buffer.from(pdfBytes).toString('base64'),
    pageCount: pdfDoc.getPageCount(),
  };
}
