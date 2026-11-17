/**
 * Strict LaTeX Escaping & Input Sanitization Utility
 * Prevents LaTeX command injection (\write18, \input, \include, etc.)
 * and properly escapes all 10 LaTeX reserved characters + Unicode normalization.
 */

const FORBIDDEN_LATEX_PATTERNS = [
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
  /\\loop\b/i,
];

export function containsForbiddenLatexCommands(raw: string): boolean {
  return FORBIDDEN_LATEX_PATTERNS.some((pattern) => pattern.test(raw));
}

export function normalizeUnicodeForLatex(input: string): string {
  return (
    input
      // Normalize smart quotes
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
      // Normalize dashes
      .replace(/\u2013/g, '--') // en-dash
      .replace(/\u2014/g, '---') // em-dash
      .replace(/\u2212/g, '-') // minus sign
      // Normalize ellipsis & bullets
      .replace(/\u2026/g, '...')
      .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '-')
      // Normalize arrow notations like -> to $\rightarrow$ or --
      .replace(/\s*->\s*/g, ' -- ')
      // Normalize non-breaking spaces and zero-width chars
      .replace(/[\u00A0\u202F\u2007]/g, ' ')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Strip emojis and astral plane symbols that break 8-bit T1 fontenc
      .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
      .replace(/[\u{2600}-\u{27BF}]/gu, '')
      // Strip control characters except newline/tab
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  );
}

/**
 * Escapes all special LaTeX characters in plain text:
 * \ { } $ & # ^ _ % ~
 * Note: preserveWhitespace=true is used by formatRichBulletLatex so spaces
 * adjacent to **bold**, *italic*, or [link](url) tokens are NEVER stripped.
 */
export function escapeLatex(
  input: string | undefined | null,
  preserveEdges = false
): string {
  if (!input) return '';
  const normalized = normalizeUnicodeForLatex(String(input));

  let result = '';
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    switch (ch) {
      case '\\':
        result += '\\textbackslash{}';
        break;
      case '{':
        result += '\\{';
        break;
      case '}':
        result += '\\}';
        break;
      case '$':
        result += '\\$';
        break;
      case '&':
        result += '\\&';
        break;
      case '#':
        result += '\\#';
        break;
      case '^':
        result += '\\textasciicircum{}';
        break;
      case '_':
        result += '\\_';
        break;
      case '%':
        result += '\\%';
        break;
      case '~':
        result += '\\textasciitilde{}';
        break;
      case '<':
        result += '\\textless{}';
        break;
      case '>':
        result += '\\textgreater{}';
        break;
      case '|':
        result += '\\textbar{}';
        break;
      default:
        result += ch;
    }
  }

  const singleLine = result.replace(/\r?\n+/g, ' ');
  return preserveEdges ? singleLine : singleLine.trim();
}

/**
 * Sanitizes a URL for safe inclusion inside \href{URL}{text} or \url{URL}
 */
export function sanitizeUrlLatex(rawUrl: string | undefined | null): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Reject javascript:, data:, vbscript:, file: protocols
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return '';
  }

  const withProtocol =
    /^https?:\/\/|^mailto:|^tel:/i.test(trimmed) ? trimmed : `https://${trimmed}`;

  // Remove characters that break \href{#1} in LaTeX: { } \ % # ~ ^ space
  return withProtocol
    .replace(/[\s{}<>\\^~`"]/g, '')
    .replace(/%/g, '\\%25')
    .replace(/#/g, '\\#')
    .replace(/&/g, '\\&');
}

/**
 * Formats lightweight Markdown inside bullet points into safe LaTeX:
 * Supports:
 * - **bold text** -> \textbf{escaped}
 * - *italic text* -> \textit{escaped}
 * - [label](https://...) -> \href{sanitizedUrl}{\underline{escapedLabel}}
 * Preserves boundary spaces around formatted tokens so words never collide.
 */
export function formatRichBulletLatex(input: string | undefined | null): string {
  if (!input) return '';
  const normalized = normalizeUnicodeForLatex(String(input)).replace(/\r?\n+/g, ' ').trim();
  if (!normalized) return '';

  // Tokenize links, bold, and italic segments while preserving surrounding spaces
  const tokenRegex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;

  let lastIndex = 0;
  let output = '';
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      output += escapeLatex(normalized.slice(lastIndex, match.index), true);
    }

    if (match[2] !== undefined && match[3] !== undefined) {
      // Link: [label](url)
      const label = escapeLatex(match[2], false);
      const safeUrl = sanitizeUrlLatex(match[3]);
      if (safeUrl) {
        output += `\\href{${safeUrl}}{\\underline{${label}}}`;
      } else {
        output += label;
      }
    } else if (match[4] !== undefined) {
      // Bold: **text**
      output += `\\textbf{${escapeLatex(match[4], false)}}`;
    } else if (match[5] !== undefined) {
      // Italic: *text*
      output += `\\textit{${escapeLatex(match[5], false)}}`;
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < normalized.length) {
    output += escapeLatex(normalized.slice(lastIndex), true);
  }

  return output.trim();
}
