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

/**
 * Normalizes Unicode strings to WinAnsi-compatible characters for PostScript Type-1 serif fonts
 * while preserving all Latin/Indonesian/European accented characters.
 */
function sanitizeWinAnsi(input: string): string {
  if (!input) return '';
  return input
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2014/g, ' -- ')
    .replace(/\u2013/g, ' - ')
    .replace(/\u2192/g, ' -> ')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
}

/**
 * Parses lightweight Markdown (**bold**, *italic*, [label](url)) into styled spans.
 */
export function parseRichTextSpans(raw: string): StyledSpan[] {
  const cleaned = sanitizeWinAnsi(raw.trim().replace(/^[-•*]\s+/, ''));
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

const SECTION_LABELS: Record<'id' | 'en', Record<SectionKey, string>> = {
  id: {
    summary: 'RINGKASAN PROFESIONAL',
    education: 'PENDIDIKAN',
    experience: 'PENGALAMAN KERJA',
    leadership: 'ORGANISASI & KEPEMIMPINAN',
    projects: 'PROYEK TEKNIS & RISET',
    awards: 'PENGHARGAAN & PRESTASI',
    certifications: 'SERTIFIKASI & LISENSI',
    publications: 'PUBLIKASI ILMIAH',
    skills: 'KEAHLIAN, BAHASA & MINAT',
    custom: 'INFORMASI TAMBAHAN',
  },
  en: {
    summary: 'PROFESSIONAL SUMMARY',
    education: 'EDUCATION',
    experience: 'EXPERIENCE',
    leadership: 'LEADERSHIP & ACTIVITIES',
    projects: 'SELECTED PROJECTS',
    awards: 'HONORS & AWARDS',
    certifications: 'CERTIFICATIONS & LICENSES',
    publications: 'PUBLICATIONS',
    skills: 'SKILLS, LANGUAGES & INTERESTS',
    custom: 'ADDITIONAL INFORMATION',
  },
};

/**
 * Compiles CVData into a 100% native vector, selectable, searchable Harvard Business School (OCS) PDF
 * on the backend server using pdf-lib Type-1 Serif fonts.
 */
export async function compileHarvardVectorPdf(
  cv: CVData,
  mode: DocumentMode = 'cv'
): Promise<{ pdfBase64: string; pageCount: number }> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(sanitizeWinAnsi(cv.title || cv.personalInfo.fullName || 'Harvard OCS Resume'));
  pdfDoc.setAuthor(sanitizeWinAnsi(cv.personalInfo.fullName || 'Candidate'));
  pdfDoc.setCreator('Buat CV Kuy — Harvard OCS Native Vector LaTeX Engine');

  const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const fontBoldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);

  const isLetter = cv.settings.paperSize === 'letter';
  const pageWidth = isLetter ? 612.0 : 595.28;
  const pageHeight = isLetter ? 792.0 : 841.89;

  const marginPt =
    cv.settings.margin === 'compact'
      ? 36.0 // 0.5in
      : cv.settings.margin === 'narrow'
        ? 43.2 // 0.6in
        : 51.84; // 0.72in

  const baseSize =
    cv.settings.fontSize === '10pt'
      ? 10.0
      : cv.settings.fontSize === '10.5pt'
        ? 10.4
        : cv.settings.fontSize === '11.5pt'
          ? 11.2
          : 10.8;

  const lineMultiplier =
    cv.settings.sectionSpacing === 'compact'
      ? 1.18
      : cv.settings.sectionSpacing === 'relaxed'
        ? 1.32
        : 1.24;

  const lineHeight = baseSize * lineMultiplier;
  const contentWidth = pageWidth - marginPt * 2;
  const lang = cv.settings.cvLanguage === 'en' ? 'en' : 'id';

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

  const drawCenteredText = (
    text: string,
    size: number,
    font: PDFFont,
    color = rgb(0.05, 0.05, 0.05)
  ) => {
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
      color,
    });
    cursorY -= size * 1.32;
  };

  const drawHeaderBlock = () => {
    const p = cv.personalInfo;
    const fullName = sanitizeWinAnsi((p.fullName || 'NAMA LENGKAP').toUpperCase());
    drawCenteredText(fullName, baseSize + 6.5, fontBold, rgb(0, 0, 0));

    if (p.headline && p.headline.trim()) {
      cursorY += 1.5;
      drawCenteredText(p.headline.trim(), baseSize + 0.2, fontItalic, rgb(0.18, 0.18, 0.18));
    }

    const contacts: string[] = [];
    if (p.location?.trim()) contacts.push(sanitizeWinAnsi(p.location.trim()));
    if (p.email?.trim()) contacts.push(sanitizeWinAnsi(p.email.trim()));
    if (p.phone?.trim()) contacts.push(sanitizeWinAnsi(p.phone.trim()));
    if (p.linkedin?.trim()) {
      contacts.push(sanitizeWinAnsi(p.linkedin.trim().replace(/^https?:\/\/(www\.)?/i, '')));
    }
    if (p.github?.trim()) {
      contacts.push(sanitizeWinAnsi(p.github.trim().replace(/^https?:\/\/(www\.)?/i, '')));
    }
    if (p.portfolio?.trim()) {
      contacts.push(sanitizeWinAnsi(p.portfolio.trim().replace(/^https?:\/\/(www\.)?/i, '')));
    }
    for (const custom of p.customLinks || []) {
      if (custom.label?.trim()) {
        contacts.push(sanitizeWinAnsi(custom.label.trim()));
      }
    }

    if (contacts.length > 0) {
      cursorY += 1.5;
      const contactLine = contacts.join('  .  ');
      drawCenteredText(contactLine, baseSize - 0.8, fontRegular, rgb(0.12, 0.12, 0.12));
    }

    cursorY -= 3;
  };

  const drawSectionHeading = (title: string) => {
    const safeTitle = sanitizeWinAnsi(title.toUpperCase());
    const headingSize = baseSize + 0.8;
    ensureSpace(headingSize + lineHeight * 2.1 + 8);

    cursorY -= cv.settings.sectionSpacing === 'compact' ? 3.5 : 5.5;
    currentPage.drawText(safeTitle, {
      x: marginPt,
      y: cursorY - headingSize,
      size: headingSize,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    cursorY -= headingSize + 2.2;

    // Crisp \titlerule vector line
    currentPage.drawRectangle({
      x: marginPt,
      y: cursorY,
      width: contentWidth,
      height: 0.65,
      color: rgb(0, 0, 0),
    });
    cursorY -= cv.settings.sectionSpacing === 'compact' ? 4.0 : 5.5;
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

    if (displayLeft) {
      currentPage.drawText(displayLeft, {
        x: marginPt,
        y: cursorY - size,
        size,
        font: leftFont,
        color: rgb(0, 0, 0),
      });
    }

    if (safeRight) {
      currentPage.drawText(safeRight, {
        x: pageWidth - marginPt - rightWidth,
        y: cursorY - size,
        size,
        font: rightFont,
        color: rgb(0.08, 0.08, 0.08),
      });
    }

    cursorY -= lineHeight;
  };

  const drawRichParagraph = (
    spans: StyledSpan[],
    options?: {
      indentPt?: number;
      bulletChar?: string;
      size?: number;
      lineGapMultiplier?: number;
    }
  ) => {
    const size = options?.size ?? baseSize;
    const indentPt = options?.indentPt ?? 0;
    const bulletChar = options?.bulletChar;
    const rowHeight = size * (options?.lineGapMultiplier ?? lineMultiplier);
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
        lines.push(currentLine);
        currentLine = word.text === ' ' ? [] : [word];
        currentWidth = word.text === ' ' ? 0 : word.width;
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
          color: rgb(0, 0, 0),
        });
      }

      let xPos = marginPt + indentPt;
      const lineTokens = lines[lineIdx] ?? [];
      for (const tok of lineTokens) {
        const tokFont = pickFont(tok.bold, tok.italic);
        if (tok.text !== ' ') {
          currentPage.drawText(tok.text, {
            x: xPos,
            y: yPos,
            size,
            font: tokFont,
            color: rgb(0.05, 0.05, 0.05),
          });
          if (tok.underline) {
            currentPage.drawRectangle({
              x: xPos,
              y: yPos - 1.2,
              width: tok.width,
              height: 0.45,
              color: rgb(0.1, 0.1, 0.1),
            });
          }
        }
        xPos += tok.width;
      }

      cursorY -= rowHeight;
    }
  };

  const drawBullets = (bullets: string[]) => {
    const nonEmpty = bullets.map((b) => b.trim()).filter(Boolean);
    if (nonEmpty.length === 0) return;
    for (const b of nonEmpty) {
      const spans = parseRichTextSpans(b);
      if (spans.length > 0) {
        drawRichParagraph(spans, { indentPt: 13.5, bulletChar: '-' });
      }
    }
    cursorY -= cv.settings.sectionSpacing === 'compact' ? 1.5 : 2.8;
  };

  const drawDateRange = (start?: string, end?: string, isCurrent?: boolean): string => {
    const presentLabel = lang === 'id' ? 'Sekarang' : 'Present';
    const right = isCurrent ? presentLabel : end?.trim() || '';
    if (start?.trim() && right) return `${start.trim()} -- ${right}`;
    return start?.trim() || right || '';
  };

  const renderCoverLetter = () => {
    drawHeaderBlock();
    currentPage.drawRectangle({
      x: marginPt,
      y: cursorY + 1,
      width: contentWidth,
      height: 0.55,
      color: rgb(0.15, 0.15, 0.15),
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
      cl.companyAddress?.trim(),
    ].filter((x): x is string => Boolean(x));

    for (const line of recipientLines) {
      drawRichParagraph([{ text: sanitizeWinAnsi(line) }]);
    }
    cursorY -= 10;

    if (cl.subjectLine?.trim()) {
      const prefix = lang === 'id' ? 'Perihal: ' : 'Re: ';
      const text = cl.subjectLine.trim().toLowerCase().startsWith('perihal') ||
        cl.subjectLine.trim().toLowerCase().startsWith('re:')
        ? cl.subjectLine.trim()
        : `${prefix}${cl.subjectLine.trim()}`;
      drawRichParagraph([{ text: sanitizeWinAnsi(text), bold: true }]);
      cursorY -= 8;
    }

    const salutation =
      cl.salutation?.trim() || (lang === 'id' ? 'Dengan hormat,' : 'Dear Hiring Manager,');
    drawRichParagraph([{ text: sanitizeWinAnsi(salutation) }]);
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
        drawRichParagraph(parseRichTextSpans(sp), { lineGapMultiplier: 1.32 });
        cursorY -= 8;
      }
    }

    cursorY -= 6;
    const signOff = cl.signOff?.trim() || (lang === 'id' ? 'Hormat saya,' : 'Sincerely,');
    drawRichParagraph([{ text: sanitizeWinAnsi(signOff) }]);
    cursorY -= 20;
    drawRichParagraph([
      { text: sanitizeWinAnsi(cv.personalInfo.fullName || 'Candidate'), bold: true },
    ]);
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
          drawRichParagraph(parseRichTextSpans(cv.summary.content.trim()));
          cursorY -= 3;
          break;
        }
        case 'education': {
          if (cv.education.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (const item of cv.education) {
            const degLine = [item.degree, item.fieldOfStudy].filter(Boolean).join(', ');
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
              extraBullets.push(parts.join(' . '));
            }
            if (item.coursework?.trim()) {
              const cwLabel =
                lang === 'id' ? '*Mata Kuliah Relevan*:' : '*Relevant Coursework*:';
              extraBullets.push(`${cwLabel} ${item.coursework.trim()}`);
            }
            if (item.thesis?.trim()) {
              const thLabel = lang === 'id' ? '*Tesis / Tugas Akhir*:' : '*Thesis*:';
              extraBullets.push(`${thLabel} ${item.thesis.trim()}`);
            }
            drawBullets([...extraBullets, ...item.bullets]);
          }
          break;
        }
        case 'experience': {
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
        case 'leadership': {
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
        case 'projects': {
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
        case 'awards': {
          if (cv.awards.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (const item of cv.awards) {
            drawTwoColRow(
              `${item.title}${item.issuer ? ` -- ${item.issuer}` : ''}`,
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
        case 'certifications': {
          if (cv.certifications.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (const item of cv.certifications) {
            const left = [
              item.name,
              item.issuer ? `-- ${item.issuer}` : '',
              item.credentialId ? `(ID: ${item.credentialId})` : '',
            ]
              .filter(Boolean)
              .join(' ');
            drawTwoColRow(left, item.date, fontBold, fontRegular);
          }
          cursorY -= 2;
          break;
        }
        case 'publications': {
          if (cv.publications.length === 0) return;
          drawSectionHeading(sectionHeadingText);
          for (const item of cv.publications) {
            drawTwoColRow(item.title, item.date, fontBold, fontRegular);
            const sub = [item.authors, item.venue].filter(Boolean).join(' -- ');
            if (sub) {
              drawRichParagraph([{ text: sanitizeWinAnsi(sub), italic: true }]);
            }
          }
          cursorY -= 2;
          break;
        }
        case 'skills': {
          const s = cv.skills;
          const hasAny =
            s.categories.length > 0 ||
            s.languages.length > 0 ||
            Boolean(s.interests?.trim());
          if (!hasAny) return;

          drawSectionHeading(sectionHeadingText);

          for (const cat of s.categories) {
            if (!cat.category?.trim() && !cat.items?.trim()) continue;
            drawRichParagraph([
              { text: `${sanitizeWinAnsi(cat.category.trim())}: `, bold: true },
              { text: sanitizeWinAnsi(cat.items.trim()) },
            ]);
          }
          if (s.languages.length > 0) {
            const lbl = lang === 'id' ? 'Bahasa: ' : 'Languages: ';
            const langItems = s.languages
              .map((l) => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ''}`)
              .join(', ');
            drawRichParagraph([
              { text: lbl, bold: true },
              { text: sanitizeWinAnsi(langItems) },
            ]);
          }
          if (s.interests?.trim()) {
            const lbl = lang === 'id' ? 'Minat: ' : 'Interests: ';
            drawRichParagraph([
              { text: lbl, bold: true },
              { text: sanitizeWinAnsi(s.interests.trim()) },
            ]);
          }
          break;
        }
        case 'custom': {
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
