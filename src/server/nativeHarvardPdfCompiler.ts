import { PDFDocument, type PDFFont, type PDFPage, rgb, StandardFonts } from 'pdf-lib';
import type { CVData, DocumentMode, SectionKey } from '../shared/schema';
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
 * Normalizes Unicode strings to WinAnsi-compatible characters for PostScript Type-1 serif fonts.
 * Preserves true en-dash (–), em-dash (—), bullet (•), middot (·), and converts newlines/tabs to spaces
 * so words across line breaks are never glued together.
 */
function sanitizeWinAnsi(input: string): string {
  if (!input) return '';
  return (
    input
      // Convert all ASCII and Unicode whitespace/newlines/tabs into a standard space first
      .replace(/[\r\n\t\f\v\u00A0\u1680\u2000-\u200B\u2028\u2029\u202F\u205F\u3000\uFEFF]+/g, ' ')
      // Soft hyphen removal
      .replace(/\u00AD/g, '')
      // Smart quotes
      .replace(/[\u2018\u2019\u201A\u201B\u02BC]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
      // Normalize triple/double hyphens to true em-dash / en-dash
      .replace(/\s*---\s*/g, ' \u2014 ')
      .replace(/\s*--\s*/g, ' \u2013 ')
      .replace(/\u2212/g, '-')
      .replace(/\s*->\s*/g, ' \u2013 ')
      .replace(/\u2192/g, ' \u2013 ')
      .replace(/\u2026/g, '...')
      // Keep standard printable ASCII, Latin-1 supplement (including \u00B7 middot),
      // and WinAnsi punctuation (\u2013 en-dash, \u2014 em-dash, \u2022 bullet)
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
  const cleaned = sanitizeWinAnsi(raw.trim().replace(/^[-•*]\s+/, ''))
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
  // Split by whitespace and preserve short connectors or capitalize words
  return safe
    .split(' ')
    .map((word) => {
      if (!word) return '';
      if (word === '&' || word === '/' || word === '-') return word;
      // If word is already mixed case (e.g. McKinsey, PhD), keep it; if all upper or all lower, capitalize first letter
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
 * Compiles CVData into a 100% native vector, selectable, searchable Harvard Business School (OCS) PDF
 * on the backend server using pdf-lib Type-1 Serif fonts with authentic \scshape Small-Caps,
 * Knuth-style justified paragraphs, true en-dashes (–), middots (·), and round bullets (•).
 */
export async function compileHarvardVectorPdf(
  cv: CVData,
  mode: DocumentMode = 'cv'
): Promise<{ pdfBase64: string; pageCount: number }> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(sanitizeWinAnsi(cv.title || cv.personalInfo.fullName || 'Harvard OCS Resume'));
  pdfDoc.setAuthor(sanitizeWinAnsi(cv.personalInfo.fullName || 'Candidate'));
  pdfDoc.setCreator('Buat CV Kuy - Harvard LaTeX Engine');

  const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const fontBoldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);

  const { settings } = cv;
  const isLetter = settings.paperSize === 'letter';
  const pageWidth = isLetter ? 612.0 : 595.28;
  const pageHeight = isLetter ? 792.0 : 841.89;

  // Match latexBuilder.ts geometry margins: 0.72in (normal), 0.52in (narrow/compact preset), 0.45in (compact)
  let marginIn = 0.72;
  if (settings.margin === 'narrow' || settings.templatePreset === 'compact') {
    marginIn = 0.52;
  } else if (settings.margin === 'compact') {
    marginIn = 0.45;
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
    settings.sectionSpacing === 'compact' || settings.templatePreset === 'compact';
  const isRelaxed = settings.sectionSpacing === 'relaxed';

  // Exact LaTeX spacing tokens matching latexBuilder.ts (accounting for baseline ascent ~0.70*size)
  const lineMultiplier = isCompact ? 1.11 : isRelaxed ? 1.21 : 1.15;
  const lineHeight = Number((baseSize * lineMultiplier).toFixed(2));
  const sectionBeforePt = isCompact ? 3.5 : isRelaxed ? 7.5 : 5.0;
  const sectionAfterPt = isCompact ? 0.4 : isRelaxed ? 2.2 : 1.0;
  const itemSepPt = isCompact ? 0.3 : isRelaxed ? 1.5 : 0.7;
  const topSepPt = isCompact ? 0.2 : isRelaxed ? 1.5 : 0.6;
  const entryGapPt = isCompact ? 2.0 : isRelaxed ? 4.5 : 3.0;

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
    smallCapScale = 0.74
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
    smallCapScale = 0.74
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
    cursorY = yBaseline - 2.5;
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

  const drawHeaderBlock = () => {
    const p = cv.personalInfo;
    const headerCapSize =
      settings.templatePreset === 'academic' ? baseSize + 6.0 : baseSize + 8.5;

    // Candidate Name in authentic LaTeX {\Huge\scshape\bfseries} Small-Caps
    drawCenteredSmallCaps(p.fullName || 'Nama Lengkap', headerCapSize, fontBold, 0.74);

    if (p.headline && p.headline.trim()) {
      drawCenteredText(p.headline.trim(), baseSize, fontItalic, rgb(0.08, 0.08, 0.08));
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
      // Use true centered middot (\u00B7) with \enspace spacing like LaTeX \enspace$\cdot$\enspace
      const contactLine = contacts.join('   \u00B7   ');
      drawCenteredText(contactLine, baseSize - 0.9, fontRegular, rgb(0.06, 0.06, 0.06));
    }

    cursorY -= 1.0;
  };

  /**
   * Matches \titleformat{\section}{\scshape\large\bfseries}{}{0em}{}[\vspace{1.5pt}\titlerule]
   */
  const drawSectionHeading = (title: string) => {
    const headingCapSize = baseSize + 1.2; // \large
    ensureSpace(sectionBeforePt + headingCapSize + sectionAfterPt + lineHeight * 2);

    cursorY -= sectionBeforePt;
    const yBaseline = cursorY - headingCapSize * 0.85;
    drawSmallCapsAt(title, marginPt, yBaseline, headingCapSize, fontBold, 0.74);

    // \vspace{1.5pt}\titlerule right under the section heading baseline
    const ruleY = yBaseline - 2.0;
    currentPage.drawRectangle({
      x: marginPt,
      y: ruleY,
      width: contentWidth,
      height: 0.55,
      color: rgb(0, 0, 0),
    });

    cursorY = ruleY - sectionAfterPt;
  };

  const drawTwoColRow = (
    leftText: string,
    rightText: string,
    leftFont: PDFFont,
    rightFont: PDFFont,
    size = baseSize
  ) => {
    const safeLeft = sanitizeWinAnsi(leftText);
    const safeRight = sanitizeWinAnsi(rightText);
    if (!safeLeft && !safeRight) return;

    ensureSpace(lineHeight);
    const rightWidth = safeRight ? rightFont.widthOfTextAtSize(safeRight, size) : 0;
    const maxLeftWidth = Math.max(120, contentWidth - rightWidth - 12);

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
        x: marginPt,
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

    cursorY -= lineHeight;
  };

  /**
   * Renders a rich-text paragraph or bullet item with optional full LaTeX-style justification
   * (left and right margins aligned on all wrapped lines except the last line).
   */
  const drawRichParagraph = (
    spans: StyledSpan[],
    options?: {
      indentPt?: number;
      bulletChar?: string;
      size?: number;
      lineGapMultiplier?: number;
      justify?: boolean;
    }
  ) => {
    const size = options?.size ?? baseSize;
    const indentPt = options?.indentPt ?? 0;
    const bulletChar = options?.bulletChar;
    const justify = options?.justify ?? true;
    const rowHeight = Number((size * (options?.lineGapMultiplier ?? lineMultiplier)).toFixed(2));
    const availWidth = contentWidth - indentPt;

    // Tokenize into words and spaces while ensuring adjacent spans don't accidentally merge words
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

    // Wrap into lines
    const lines: WordToken[][] = [];
    let currentLine: WordToken[] = [];
    let currentWidth = 0;

    for (const word of words) {
      if (currentLine.length === 0 && word.text === ' ') {
        continue;
      }
      if (currentWidth + word.width > availWidth && currentLine.length > 0) {
        // Trim trailing space token from completed line
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

      if (lineIdx === 0 && bulletChar) {
        // Draw crisp round LaTeX bullet (\textbullet)
        currentPage.drawText(bulletChar, {
          x: marginPt + 4.0,
          y: yPos + 0.3,
          size: size * 0.88,
          font: fontBold,
          color: rgb(0, 0, 0),
        });
      }

      const lineTokens = lines[lineIdx] ?? [];
      const isLastLine = lineIdx === lines.length - 1;
      const spaceCount = lineTokens.filter((t) => t.text === ' ').length;
      const naturalLineWidth = lineTokens.reduce((acc, t) => acc + t.width, 0);
      const slack = availWidth - naturalLineWidth;

      // Distribute slack across spaces for non-final lines (just like TeX justification)
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
  const drawBullets = (bullets: string[]) => {
    const nonEmpty = bullets.map((b) => b.trim()).filter(Boolean);
    if (nonEmpty.length === 0) return;

    cursorY -= topSepPt;
    for (let i = 0; i < nonEmpty.length; i++) {
      const b = nonEmpty[i]!;
      const spans = parseRichTextSpans(b);
      if (spans.length > 0) {
        drawRichParagraph(spans, {
          indentPt: baseSize * 1.35,
          bulletChar: '\u2022', // True round bullet •
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
    drawHeaderBlock();
    currentPage.drawRectangle({
      x: marginPt,
      y: cursorY + 1,
      width: contentWidth,
      height: 0.6,
      color: rgb(0, 0, 0),
    });
    cursorY -= 12;

    const rawCl = cv.coverLetter;
    const hasContent = Boolean(
      rawCl &&
        (rawCl.openingParagraph?.trim() ||
          rawCl.bodyParagraphs?.some((p) => p.trim()) ||
          rawCl.closingParagraph?.trim())
    );
    const cl = hasContent ? rawCl : createDefaultCoverLetter(cv);

    const dateLine = sanitizeWinAnsi(
      cl.date?.trim() || (lang === 'id' ? '16 November 2026' : 'November 16, 2026')
    );
    drawRichParagraph([{ text: dateLine }], { justify: false });
    cursorY -= 9;

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
      const prefix = lang === 'id' ? 'Perihal: ' : 'Re: ';
      const text =
        cl.subjectLine.trim().toLowerCase().startsWith('perihal') ||
        cl.subjectLine.trim().toLowerCase().startsWith('re:')
          ? cl.subjectLine.trim()
          : `${prefix}${cl.subjectLine.trim()}`;
      drawRichParagraph([{ text: sanitizeWinAnsi(text), bold: true }], { justify: false });
      cursorY -= 9;
    }

    const salutation =
      cl.salutation?.trim() ||
      (lang === 'id' ? 'Yth. Bapak/Ibu Tim Rekrutmen,' : 'Dear Hiring Manager,');
    drawRichParagraph([{ text: sanitizeWinAnsi(salutation) }], { justify: false });
    cursorY -= 8;

    const paragraphs = [
      cl.openingParagraph,
      ...(cl.bodyParagraphs || []),
      cl.closingParagraph,
    ]
      .map((p) => p?.trim())
      .filter((p): p is string => Boolean(p));

    for (const para of paragraphs) {
      const subParas = para
        .split(/\n{2,}/)
        .map((s) => s.trim())
        .filter(Boolean);
      for (const sp of subParas) {
        drawRichParagraph(parseRichTextSpans(sp), { lineGapMultiplier: 1.26, justify: true });
        cursorY -= 8;
      }
    }

    cursorY -= 6;
    const signOff = cl.signOff?.trim() || (lang === 'id' ? 'Hormat saya,' : 'Sincerely,');
    drawRichParagraph([{ text: sanitizeWinAnsi(signOff) }], { justify: false });
    cursorY -= 20;
    drawRichParagraph(
      [{ text: sanitizeWinAnsi(cv.personalInfo.fullName || 'Candidate'), bold: true }],
      { justify: false }
    );
  };

  const renderCVBody = () => {
    drawHeaderBlock();

    const defaultLabels = SECTION_LABELS[lang];

    const renderSectionByKey = (key: SectionKey, customTitle?: string) => {
      const sectionHeadingText = customTitle?.trim() || defaultLabels[key];

      switch (key) {
        case 'summary': {
          if (!cv.summary?.content?.trim()) return;
          drawSectionHeading(sectionHeadingText);
          drawRichParagraph(parseRichTextSpans(cv.summary.content.trim()), { justify: true });
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
            drawTwoColRow(item.institution, item.location, fontBold, fontItalic);
            drawTwoColRow(
              degLine,
              drawDateRange(item.startDate, item.endDate, item.isCurrent),
              fontItalic,
              fontRegular
            );
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
            drawBullets([...extraBullets, ...item.bullets]);
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
            drawTwoColRow(item.company, item.location, fontBold, fontItalic);
            drawTwoColRow(
              item.position,
              drawDateRange(item.startDate, item.endDate, item.isCurrent),
              fontItalic,
              fontRegular
            );
            drawBullets(item.bullets);
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
            drawTwoColRow(item.organization, item.location, fontBold, fontItalic);
            drawTwoColRow(
              item.role,
              drawDateRange(item.startDate, item.endDate, item.isCurrent),
              fontItalic,
              fontRegular
            );
            drawBullets(item.bullets);
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
            drawTwoColRow(item.name, linkText, fontBold, fontRegular);
            if (item.techStack?.trim() || dateStr) {
              drawTwoColRow(item.techStack?.trim() || '', dateStr, fontItalic, fontRegular);
            }
            drawBullets(item.bullets);
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
                fontRegular
              );
            } else {
              drawRichParagraph(leftSpans, { justify: false });
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
            drawTwoColRow(left, dateStr, fontBold, fontRegular);
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
            drawRichParagraph(spans, { justify: true });
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

          for (const cat of s.categories) {
            if (!cat.category?.trim() || !cat.items?.trim()) continue;
            drawRichParagraph(
              [
                { text: `${sanitizeWinAnsi(cat.category.trim())}: `, bold: true },
                { text: sanitizeWinAnsi(cat.items.trim()) },
              ],
              { justify: false }
            );
            cursorY -= 1.5;
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
              { justify: false }
            );
            cursorY -= 1.5;
          }
          if (s.interests?.trim()) {
            const lbl = lang === 'id' ? 'Minat: ' : 'Interests: ';
            drawRichParagraph(
              [
                { text: lbl, bold: true },
                { text: sanitizeWinAnsi(s.interests.trim()) },
              ],
              { justify: false }
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
              drawTwoColRow(entry.title, entry.location, fontBold, fontItalic);
              if (entry.subtitle?.trim() || entry.date?.trim()) {
                drawTwoColRow(entry.subtitle, entry.date, fontItalic, fontRegular);
              }
              drawBullets(entry.bullets);
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

  if (mode === 'cover-letter') {
    renderCoverLetter();
  } else if (mode === 'combined') {
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
