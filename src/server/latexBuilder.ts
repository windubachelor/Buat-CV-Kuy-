import {
  type CVData,
  type DocumentMode,
  isCoverLetterTemplatePreset,
  type SectionKey,
} from '../shared/schema';
import { createDefaultCoverLetter } from '../shared/templates';
import { escapeLatex, formatRichBulletLatex, sanitizeUrlLatex } from './latexEscape';

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

const MONTHS_ID_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTHS_ID_LONG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const MONTHS_EN_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_EN_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatCVDate(
  raw: string,
  format: 'short' | 'numeric' | 'long',
  lang: 'id' | 'en'
): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  // Match YYYY-MM
  const isoMatch = /^(\d{4})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    const year = isoMatch[1];
    const monthIndex = parseInt(isoMatch[2], 10) - 1;
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

  return escapeLatex(trimmed);
}

function formatDateRange(
  startDate: string,
  endDate: string,
  isCurrent: boolean,
  format: 'short' | 'numeric' | 'long',
  lang: 'id' | 'en'
): string {
  const start = formatCVDate(startDate, format, lang);
  const end = isCurrent
    ? lang === 'id'
      ? 'Sekarang'
      : 'Present'
    : formatCVDate(endDate, format, lang);

  if (start && end) return `${start} -- ${end}`;
  return start || end || '';
}

function cleanDisplayUrl(rawUrl: string): string {
  return rawUrl
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '');
}

/**
 * Formats a paragraph that may contain inline bullet lines (starting with • or -) into LaTeX itemize blocks.
 */
function formatCoverLetterParagraphLatex(rawPara: string): string {
  const lines = rawPara
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const bulletLines = lines.filter((l) => /^[•\-*]\s+/.test(l));
  if (bulletLines.length === 0) {
    return `\\noindent ${formatRichBulletLatex(rawPara.trim())}\\par`;
  }

  const introLines = lines.filter((l) => !/^[•\-*]\s+/.test(l));
  const introBlock =
    introLines.length > 0
      ? `\\noindent ${formatRichBulletLatex(introLines.join(' '))}\\par\n\\vspace{3pt}\n`
      : '';
  const itemsBlock = bulletLines
    .map((b) => `  \\item ${formatRichBulletLatex(b.replace(/^[•\-*]\s+/, ''))}`)
    .join('\n');
  return `${introBlock}\\begin{itemize}\n${itemsBlock}\n\\end{itemize}`;
}

function buildCoverLetterBodyBlock(
  cv: CVData,
  headerSizeMacro: string,
  headerName: string,
  headlineLine: string,
  contactLine: string
): string {
  const rawCl = cv.coverLetter;
  const hasContent = Boolean(
    rawCl &&
      (rawCl.openingParagraph?.trim() ||
        rawCl.bodyParagraphs?.some((p) => p.trim()) ||
        rawCl.closingParagraph?.trim())
  );
  const cl = hasContent ? rawCl : createDefaultCoverLetter(cv);
  const isId = cv.settings.cvLanguage === 'id';
  const preset = cv.settings.templatePreset;

  const dateLine = escapeLatex(
    cl.date.trim() || (isId ? '17 November 2026' : 'November 17, 2026')
  );
  const recipientLines: string[] = [];
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

  const subjectPrefix = isId ? 'Perihal:' : 'Sub:';
  const cleanSubject = cl.subjectLine.trim();
  const hasPrefixAlready =
    cleanSubject.toLowerCase().startsWith('perihal:') ||
    cleanSubject.toLowerCase().startsWith('sub:') ||
    cleanSubject.toLowerCase().startsWith('re:');
  const subjectText = hasPrefixAlready
    ? escapeLatex(cleanSubject)
    : `${subjectPrefix} ${escapeLatex(cleanSubject)}`;

  const subjectBlock = cleanSubject
    ? `\\vspace{8pt}\n\\noindent\\textbf{${subjectText}}\\par\n`
    : '';

  const salutation = escapeLatex(
    cl.salutation.trim() ||
      (isId ? 'Dengan hormat,' : 'Dear Hiring Manager,')
  );

  const rawParagraphs: string[] = [];
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

  const formattedParagraphs = rawParagraphs
    .map((p) => formatCoverLetterParagraphLatex(p))
    .join('\n\\vspace{8pt}\n');

  const signOff = escapeLatex(
    cl.signOff.trim() || (isId ? 'Hormat saya,' : 'Sincerely,')
  );

  const enclosures = (cl.enclosures || []).map((e) => e.trim()).filter(Boolean);
  const enclosureBlock =
    enclosures.length > 0
      ? `\\vspace{14pt}\n\\noindent\\textbf{${
          isId ? 'Lampiran (Berkas / Sertifikat Terlampir):' : 'Enclosed (Marksheets / Certificates):'
        }}\\par\n\\vspace{3pt}\n{\\small\n${enclosures
          .map((item) => `\\noindent ${escapeLatex(item)}\\par`)
          .join('\n')}\n}`
      : '';

  const postscriptBlock = cl.postscript?.trim()
    ? `\\vspace{12pt}\n\\noindent\\textit{${escapeLatex(cl.postscript.trim())}}\\par`
    : '';

  // Style 1: Overleaf cover_letter_1.tex (ModernCV Classic Roman Style — Top-Right Sender Block, Italic Recipient, Open Circle Bullets)
  if (preset === 'cover_letter_1') {
    const senderRightLines = [
      `\\textbf{${headerName}}`,
      cv.personalInfo.location.trim()
        ? `\\textit{${escapeLatex(cv.personalInfo.location.trim())}}`
        : '',
      cv.personalInfo.phone.trim()
        ? `\\textit{${escapeLatex(cv.personalInfo.phone.trim())}}`
        : '',
      cv.personalInfo.email.trim()
        ? `\\textit{${escapeLatex(cv.personalInfo.email.trim())}}`
        : '',
    ].filter(Boolean);

    const italicRecipientLines = [
      cl.recipientName.trim() ? `\\textit{${escapeLatex(cl.recipientName.trim())}}` : '',
      cl.recipientTitle.trim() ? `\\textit{${escapeLatex(cl.recipientTitle.trim())}}` : '',
      cl.companyName.trim() ? `\\textit{${escapeLatex(cl.companyName.trim())}}` : '',
      cl.companyAddress.trim() ? `\\textit{${escapeLatex(cl.companyAddress.trim())}}` : '',
    ].filter(Boolean);

    const circleFormattedParagraphs = formattedParagraphs.replace(
      /\\begin\{itemize\}/g,
      '\\begin{itemize}[label=$\\circ$]'
    );

    return `% === SECTION: coverLetter ===
\\begin{flushright}
  ${senderRightLines.join('\\\\\n  ')}
\\end{flushright}
\\vspace{10pt}

\\noindent\\textbf{${isId ? 'Kepada Yth.' : 'To'}} \\hfill ${dateLine}\\\\
${italicRecipientLines.join('\\\\\n')}\\par
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

  // Style 2: Overleaf simple_letter.tex (Standard \documentclass{letter} Style)
  if (preset === 'simple_letter') {
    const returnAddressLines = [
      `\\textbf{${headerName}}`,
      cv.personalInfo.location.trim() ? escapeLatex(cv.personalInfo.location.trim()) : '',
      [cv.personalInfo.phone.trim(), cv.personalInfo.email.trim()]
        .filter(Boolean)
        .map((s) => escapeLatex(s))
        .join(' $\\cdot$ '),
    ].filter(Boolean);

    return `% === SECTION: coverLetter ===
\\begin{flushright}
  ${returnAddressLines.join('\\\\\n  ')}\\\\[8pt]
  ${dateLine}
\\end{flushright}
\\vspace{8pt}

\\noindent ${recipientLines.join('\\\\\n')}\\par
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

  // Default: Official Harvard OCS Cover Letter Style
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
\\noindent ${recipientLines.join('\\\\\n')}\\par
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

export function buildHarvardLatex(cv: CVData, mode: DocumentMode = 'cv'): string {
  const { settings, personalInfo } = cv;
  const effectiveMode: DocumentMode =
    isCoverLetterTemplatePreset(settings.templatePreset) && mode === 'cv'
      ? 'cover-letter'
      : mode;
  const lang = settings.cvLanguage;
  const dateFormat = settings.dateFormat;

  const paperOption = settings.paperSize === 'letter' ? 'letterpaper' : 'a4paper';

  // Standard LaTeX article supports 10pt, 11pt, 12pt options; we fine-tune leading for 10.5pt and 11.5pt
  const baseDocFontPt =
    settings.fontSize === '10pt' || settings.fontSize === '10.5pt' ? '10pt' : '11pt';

  // Margin configuration
  let marginIn = '0.72in';
  if (settings.margin === 'compact' || settings.templatePreset === 'jakes') {
    marginIn = '0.45in';
  } else if (
    settings.margin === 'narrow' ||
    settings.templatePreset === 'compact' ||
    settings.templatePreset === 'wharton' ||
    settings.templatePreset === 'mckinsey'
  ) {
    marginIn = '0.52in';
  }

  // Font family package selection
  let fontPackageLatex = '\\usepackage{tgtermes}';
  if (
    settings.fontFamily === 'lmodern' ||
    settings.templatePreset === 'jakes' ||
    settings.templatePreset === 'cover_letter_1' ||
    settings.templatePreset === 'simple_letter'
  ) {
    fontPackageLatex = '\\usepackage{lmodern}';
  } else if (settings.fontFamily === 'libertinus') {
    fontPackageLatex = '\\usepackage{libertinus}';
  } else if (settings.fontFamily === 'ebgaramond') {
    fontPackageLatex = '\\usepackage{ebgaramond}';
  }

  // Section spacing and item spacing based on preset & user setting
  const isCompact =
    settings.sectionSpacing === 'compact' ||
    settings.templatePreset === 'compact' ||
    settings.templatePreset === 'jakes' ||
    settings.templatePreset === 'wharton';
  const isRelaxed = settings.sectionSpacing === 'relaxed';

  const sectionBeforePt = isCompact ? '5pt' : isRelaxed ? '10pt' : '7pt';
  const sectionAfterPt = isCompact ? '3pt' : isRelaxed ? '6pt' : '4pt';
  const itemSepPt = isCompact ? '0.5pt' : isRelaxed ? '2pt' : '1pt';
  const topSepPt = isCompact ? '1pt' : isRelaxed ? '3pt' : '2pt';
  const entryGapPt = isCompact ? '3pt' : isRelaxed ? '6pt' : '4pt';

  // Font size scaling override if 10.5pt or 11.5pt
  let fontSizeAdjustment = '';
  if (settings.fontSize === '10.5pt') {
    fontSizeAdjustment = '\\fontsize{10.5}{12.4}\\selectfont';
  } else if (settings.fontSize === '11.5pt') {
    fontSizeAdjustment = '\\fontsize{11.5}{13.6}\\selectfont';
  }

  // Build header contact parts
  const contactParts: string[] = [];
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
    const prefix = settings.showLinksIcon ? '[in] ' : '';
    contactParts.push(safeUrl ? `${prefix}\\href{${safeUrl}}{${display}}` : display);
  }
  if (personalInfo.github.trim()) {
    const safeUrl = sanitizeUrlLatex(personalInfo.github);
    const display = escapeLatex(cleanDisplayUrl(personalInfo.github));
    const prefix = settings.showLinksIcon ? '[gh] ' : '';
    contactParts.push(safeUrl ? `${prefix}\\href{${safeUrl}}{${display}}` : display);
  }
  if (personalInfo.portfolio.trim()) {
    const safeUrl = sanitizeUrlLatex(personalInfo.portfolio);
    const display = escapeLatex(cleanDisplayUrl(personalInfo.portfolio));
    const prefix = settings.showLinksIcon ? '[web] ' : '';
    contactParts.push(safeUrl ? `${prefix}\\href{${safeUrl}}{${display}}` : display);
  }
  for (const link of personalInfo.customLinks) {
    if (link.url.trim()) {
      const safeUrl = sanitizeUrlLatex(link.url);
      const display = escapeLatex(link.label.trim() || cleanDisplayUrl(link.url));
      contactParts.push(safeUrl ? `\\href{${safeUrl}}{${display}}` : display);
    }
  }

  const contactSeparator =
    settings.templatePreset === 'jakes' ? ' $|$ ' : ' \\enspace$\\cdot$\\enspace ';
  const contactLine = contactParts.join(contactSeparator);
  const headlineLine = personalInfo.headline.trim()
    ? `{\\normalsize\\textit{${escapeLatex(personalInfo.headline)}}}\\\\[2pt]\n`
    : '';

  // Build individual sections
  const renderedSections: string[] = [];

  for (const secConfig of cv.sectionOrder) {
    if (!secConfig.visible) continue;
    const key = secConfig.key;
    const sectionTitle = escapeLatex(
      secConfig.customTitle?.trim() || SECTION_LABELS[lang][key]
    );

    if (key === 'summary') {
      const content = cv.summary.content.trim();
      if (!content) continue;
      renderedSections.push(
        `% === SECTION: summary ===\n` +
        `\\section*{${sectionTitle}}\n` +
        `${formatRichBulletLatex(content)}\\par\\vspace{2pt}`
      );
    }

    if (key === 'education' && cv.education.length > 0) {
      const items = cv.education
        .filter((e) => e.institution.trim() || e.degree.trim())
        .map((edu) => {
          const inst = escapeLatex(edu.institution);
          const loc = escapeLatex(edu.location);
          const degParts: string[] = [];
          if (edu.degree.trim()) degParts.push(escapeLatex(edu.degree));
          if (edu.fieldOfStudy.trim()) {
            degParts.push(escapeLatex(edu.fieldOfStudy));
          }
          const degreeLine = degParts.join(', ');
          const dates = formatDateRange(
            edu.startDate,
            edu.endDate,
            edu.isCurrent,
            dateFormat,
            lang
          );

          const subBullets: string[] = [];
          const gpaHonors: string[] = [];
          if (edu.gpa.trim()) {
            gpaHonors.push(
              `${lang === 'id' ? 'IPK' : 'GPA'}: \\textbf{${escapeLatex(edu.gpa)}}`
            );
          }
          if (edu.honors.trim()) {
            gpaHonors.push(escapeLatex(edu.honors));
          }
          if (gpaHonors.length > 0) {
            subBullets.push(gpaHonors.join(' $\\cdot$ '));
          }
          if (edu.coursework.trim()) {
            subBullets.push(
              `\\textit{${lang === 'id' ? 'Mata Kuliah Relevan' : 'Relevant Coursework'}}: ${escapeLatex(edu.coursework)}`
            );
          }
          if (edu.thesis.trim()) {
            subBullets.push(
              `\\textit{${lang === 'id' ? 'Tesis/Skripsi' : 'Thesis'}}: ${escapeLatex(edu.thesis)}`
            );
          }
          for (const b of edu.bullets) {
            if (b.trim()) subBullets.push(formatRichBulletLatex(b));
          }

          const bulletBlock =
            subBullets.length > 0
              ? `\n\\begin{itemize}\n${subBullets.map((b) => `  \\item ${b}`).join('\n')}\n\\end{itemize}`
              : '';

          return `\\entry{${inst}}{${loc}}{${degreeLine}}{${dates}}${bulletBlock}`;
        });

      if (items.length > 0) {
        renderedSections.push(
          `% === SECTION: education ===\n` +
          `\\section*{${sectionTitle}}\n` + items.join(`\n\\vspace{${entryGapPt}}\n`)
        );
      }
    }

    if (key === 'experience' && cv.experience.length > 0) {
      const items = cv.experience
        .filter((e) => e.company.trim() || e.position.trim())
        .map((exp) => {
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
          const bulletBlock =
            cleanBullets.length > 0
              ? `\n\\begin{itemize}\n${cleanBullets.map((b) => `  \\item ${formatRichBulletLatex(b)}`).join('\n')}\n\\end{itemize}`
              : '';
          return `\\entry{${comp}}{${loc}}{${pos}}{${dates}}${bulletBlock}`;
        });

      if (items.length > 0) {
        renderedSections.push(
          `% === SECTION: experience ===\n` +
          `\\section*{${sectionTitle}}\n` + items.join(`\n\\vspace{${entryGapPt}}\n`)
        );
      }
    }

    if (key === 'leadership' && cv.leadership.length > 0) {
      const items = cv.leadership
        .filter((l) => l.organization.trim() || l.role.trim())
        .map((lead) => {
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
          const bulletBlock =
            cleanBullets.length > 0
              ? `\n\\begin{itemize}\n${cleanBullets.map((b) => `  \\item ${formatRichBulletLatex(b)}`).join('\n')}\n\\end{itemize}`
              : '';
          return `\\entry{${org}}{${loc}}{${role}}{${dates}}${bulletBlock}`;
        });

      if (items.length > 0) {
        renderedSections.push(
          `% === SECTION: leadership ===\n` +
          `\\section*{${sectionTitle}}\n` + items.join(`\n\\vspace{${entryGapPt}}\n`)
        );
      }
    }

    if (key === 'projects' && cv.projects.length > 0) {
      const items = cv.projects
        .filter((p) => p.name.trim())
        .map((proj) => {
          const name = escapeLatex(proj.name);
          const safeUrl = sanitizeUrlLatex(proj.link);
          const linkDisplay = proj.link.trim()
            ? safeUrl
              ? `\\href{${safeUrl}}{\\underline{${escapeLatex(cleanDisplayUrl(proj.link))}}}`
              : escapeLatex(proj.link)
            : '';
          const tech = proj.techStack.trim() ? escapeLatex(proj.techStack) : '';
          const dates = formatDateRange(
            proj.startDate,
            proj.endDate,
            false,
            dateFormat,
            lang
          );

          const cleanBullets = proj.bullets.filter((b) => b.trim().length > 0);
          const bulletBlock =
            cleanBullets.length > 0
              ? `\n\\begin{itemize}\n${cleanBullets.map((b) => `  \\item ${formatRichBulletLatex(b)}`).join('\n')}\n\\end{itemize}`
              : '';

          if (tech || dates) {
            return `\\entry{${name}}{${linkDisplay}}{${tech}}{${dates}}${bulletBlock}`;
          }
          return `\\textbf{${name}}${linkDisplay ? ` \\hfill ${linkDisplay}` : ''}\\par${bulletBlock}`;
        });

      if (items.length > 0) {
        renderedSections.push(
          `% === SECTION: projects ===\n` +
          `\\section*{${sectionTitle}}\n` + items.join(`\n\\vspace{${entryGapPt}}\n`)
        );
      }
    }

    if (key === 'awards' && cv.awards.length > 0) {
      const items = cv.awards
        .filter((a) => a.title.trim())
        .map((award) => {
          const title = escapeLatex(award.title);
          const issuer = award.issuer.trim() ? `, \\textit{${escapeLatex(award.issuer)}}` : '';
          const date = award.date.trim() ? formatCVDate(award.date, dateFormat, lang) : '';
          const desc = award.description.trim()
            ? ` -- ${formatRichBulletLatex(award.description)}`
            : '';
          return `\\textbf{${title}}${issuer}${desc}\\hfill ${date}\\par`;
        });

      if (items.length > 0) {
        renderedSections.push(
          `% === SECTION: awards ===\n` +
          `\\section*{${sectionTitle}}\n` + items.join('\n\\vspace{2pt}\n')
        );
      }
    }

    if (key === 'certifications' && cv.certifications.length > 0) {
      const items = cv.certifications
        .filter((c) => c.name.trim())
        .map((cert) => {
          const name = escapeLatex(cert.name);
          const issuer = cert.issuer.trim() ? ` -- \\textit{${escapeLatex(cert.issuer)}}` : '';
          const cred = cert.credentialId.trim()
            ? ` (${escapeLatex(cert.credentialId)})`
            : '';
          const safeUrl = sanitizeUrlLatex(cert.url);
          const titlePart = safeUrl ? `\\href{${safeUrl}}{\\textbf{${name}}}` : `\\textbf{${name}}`;
          const date = cert.date.trim() ? formatCVDate(cert.date, dateFormat, lang) : '';
          return `${titlePart}${issuer}${cred}\\hfill ${date}\\par`;
        });

      if (items.length > 0) {
        renderedSections.push(
          `% === SECTION: certifications ===\n` +
          `\\section*{${sectionTitle}}\n` + items.join('\n\\vspace{2pt}\n')
        );
      }
    }

    if (key === 'publications' && cv.publications.length > 0) {
      const items = cv.publications
        .filter((p) => p.title.trim())
        .map((pub) => {
          const title = escapeLatex(pub.title);
          const authors = pub.authors.trim() ? `${escapeLatex(pub.authors)}. ` : '';
          const venue = pub.venue.trim() ? `\\textit{${escapeLatex(pub.venue)}}` : '';
          const date = pub.date.trim() ? ` (${formatCVDate(pub.date, dateFormat, lang)})` : '';
          const safeUrl = sanitizeUrlLatex(pub.url);
          const quotedTitle = '``' + title + "''";
          const titleFormatted = safeUrl
            ? `\\href{${safeUrl}}{${quotedTitle}}`
            : quotedTitle;
          return `${authors}${titleFormatted}. ${venue}${date}.\\par`;
        });

      if (items.length > 0) {
        renderedSections.push(
          `% === SECTION: publications ===\n` +
          `\\section*{${sectionTitle}}\n` + items.join('\n\\vspace{3pt}\n')
        );
      }
    }

    if (key === 'skills') {
      const skillLines: string[] = [];
      for (const cat of cv.skills.categories) {
        if (cat.category.trim() && cat.items.trim()) {
          skillLines.push(
            `\\textbf{${escapeLatex(cat.category)}:} ${escapeLatex(cat.items)}`
          );
        }
      }
      if (cv.skills.languages.length > 0) {
        const langPairs = cv.skills.languages
          .filter((l) => l.language.trim())
          .map((l) =>
            l.proficiency.trim()
              ? `${escapeLatex(l.language)} (${escapeLatex(l.proficiency)})`
              : escapeLatex(l.language)
          );
        if (langPairs.length > 0) {
          skillLines.push(
            `\\textbf{${lang === 'id' ? 'Bahasa' : 'Languages'}:} ${langPairs.join(', ')}`
          );
        }
      }
      if (cv.skills.interests.trim()) {
        skillLines.push(
          `\\textbf{${lang === 'id' ? 'Minat' : 'Interests'}:} ${escapeLatex(cv.skills.interests)}`
        );
      }

      if (skillLines.length > 0) {
        renderedSections.push(
          `% === SECTION: skills ===\n` +
          `\\section*{${sectionTitle}}\n` + skillLines.join('\\\\[2pt]\n')
        );
      }
    }

    if (key === 'custom' && cv.customSections.length > 0) {
      for (const customSec of cv.customSections) {
        if (!customSec.sectionTitle.trim() || customSec.entries.length === 0) continue;
        const cTitle = escapeLatex(customSec.sectionTitle);
        const cEntries = customSec.entries
          .filter((e) => e.title.trim())
          .map((entry) => {
            const t = escapeLatex(entry.title);
            const loc = escapeLatex(entry.location);
            const sub = escapeLatex(entry.subtitle);
            const dt = escapeLatex(entry.date);
            const cleanBullets = entry.bullets.filter((b) => b.trim().length > 0);
            const bulletBlock =
              cleanBullets.length > 0
                ? `\n\\begin{itemize}\n${cleanBullets.map((b) => `  \\item ${formatRichBulletLatex(b)}`).join('\n')}\n\\end{itemize}`
                : '';

            if (sub || dt) {
              return `\\entry{${t}}{${loc}}{${sub}}{${dt}}${bulletBlock}`;
            }
            return `\\textbf{${t}}${loc ? `\\hfill\\textit{${loc}}` : ''}\\par${bulletBlock}`;
          });

        if (cEntries.length > 0) {
          renderedSections.push(
            `% === SECTION: custom ===\n` +
            `\\section*{${cTitle}}\n` + cEntries.join(`\n\\vspace{${entryGapPt}}\n`)
          );
        }
      }
    }
  }

  const authorMeta = escapeLatex(personalInfo.fullName || 'Candidate');
  const titleMeta = escapeLatex(cv.title || `${personalInfo.fullName} - Resume`);
  const headerName = escapeLatex(personalInfo.fullName || 'NAMA LENGKAP');

  const headerSizeMacro =
    settings.templatePreset === 'academic' ? '\\LARGE' : '\\Huge';

  let headerRuleLatex = '\\vspace{-2pt}';
  if (settings.templatePreset === 'wharton') {
    headerRuleLatex = '\\vspace{1pt}\n\\noindent\\rule{\\textwidth}{0.6pt}\n\\vspace{-3pt}';
  } else if (settings.templatePreset === 'mckinsey') {
    headerRuleLatex =
      '\\vspace{1pt}\n\\noindent\\rule{\\textwidth}{0.9pt}\\\\[-8.5pt]\n\\noindent\\rule{\\textwidth}{0.35pt}\n\\vspace{-2pt}';
  }

  const resumeBodyBlock = `% === SECTION: personalInfo ===
\\begin{center}
  {${headerSizeMacro}\\scshape\\bfseries ${headerName}}\\\\[3pt]
  ${headlineLine}{\\small ${contactLine}}
\\end{center}
${headerRuleLatex}
${renderedSections.join('\n\n')}`;

  const coverLetterBlock = buildCoverLetterBodyBlock(
    cv,
    headerSizeMacro,
    headerName,
    headlineLine,
    contactLine
  );

  let documentBody = resumeBodyBlock;
  if (effectiveMode === 'cover-letter') {
    documentBody = coverLetterBlock;
  } else if (effectiveMode === 'combined') {
    documentBody = `${coverLetterBlock}\n\\newpage\n${resumeBodyBlock}`;
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

