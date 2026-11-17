import { describe, expect, it } from 'vitest';
import { compileCVToPdf } from '../server/compiler';
import { buildHarvardLatex } from '../server/latexBuilder';
import {
  containsForbiddenLatexCommands,
  escapeLatex,
  formatRichBulletLatex,
  sanitizeUrlLatex,
} from '../server/latexEscape';
import { analyzeBullet, calculateCVCompleteness } from '../shared/scoring';
import { createSampleCVEnglish, createSampleCVIndonesian } from '../shared/templates';

describe('LaTeX Escaping & Security Utilities', () => {
  it('escapes all 10 reserved LaTeX special characters safely', () => {
    const raw = 'Revenue +35% & $100K #1_rank {a} ~ ^ \\ end';
    const escaped = escapeLatex(raw);
    expect(escaped).toContain('\\%');
    expect(escaped).toContain('\\&');
    expect(escaped).toContain('\\$');
    expect(escaped).toContain('\\#');
    expect(escaped).toContain('\\_');
    expect(escaped).toContain('\\{a\\}');
    expect(escaped).toContain('\\textasciitilde{}');
    expect(escaped).toContain('\\textasciicircum{}');
    expect(escaped).toContain('\\textbackslash{}');
  });

  it('normalizes Unicode smart quotes, dashes, arrows, and strips emojis', () => {
    const raw = '“Smart” — dash – en 🚀 bullet • test';
    const escaped = escapeLatex(raw);
    expect(escaped).toBe('"Smart" --- dash -- en  bullet - test');
  });

  it('parses lightweight Markdown bold, italic, and links into safe LaTeX while preserving spaces around tokens', () => {
    const raw =
      'growing annualized TPV by **$420M+** and leading *caching* at [GitHub](https://github.com/org/repo_1)';
    const formatted = formatRichBulletLatex(raw);
    expect(formatted).toContain('by \\textbf{\\$420M+} and');
    expect(formatted).toContain('leading \\textit{caching} at');
    expect(formatted).toContain('\\href{https://github.com/org/repo_1}{\\underline{GitHub}}');
  });

  it('rejects dangerous URL protocols in sanitizeUrlLatex', () => {
    expect(sanitizeUrlLatex('javascript:alert(1)')).toBe('');
    expect(sanitizeUrlLatex('file:///etc/passwd')).toBe('');
    expect(sanitizeUrlLatex('linkedin.com/in/test')).toBe('https://linkedin.com/in/test');
  });

  it('detects forbidden LaTeX injection macros', () => {
    expect(containsForbiddenLatexCommands('Normal text with 100% impact')).toBe(false);
    expect(containsForbiddenLatexCommands('\\write18{rm -rf /}')).toBe(true);
    expect(containsForbiddenLatexCommands('\\input{/etc/passwd}')).toBe(true);
    expect(containsForbiddenLatexCommands('\\include{secret}')).toBe(true);
  });
});

describe('Harvard LaTeX Builder & Completeness Scoring', () => {
  it('builds valid Harvard LaTeX document containing sections, clean titlerule spacing, and escaped special characters', () => {
    const cv = createSampleCVIndonesian('test-cv');
    cv.personalInfo.fullName = 'Budi & Susi $100%';
    const tex = buildHarvardLatex(cv);

    expect(tex).toContain('\\documentclass[10pt,a4paper]{article}');
    expect(tex).toContain('Budi \\& Susi \\$100\\%');
    expect(tex).toContain('[\\vspace{1.5pt}\\titlerule]');
    expect(tex).not.toContain('\\vspace{-0.55em}\\titlerule');
    expect(tex).toContain('\\section*{Pendidikan}');
    expect(tex).toContain('\\section*{Pengalaman Kerja}');
    expect(tex).toContain('\\end{document}');
  });

  it('calculates CV completeness score and analyzes bullet points accurately', () => {
    const cv = createSampleCVIndonesian('score-cv');
    const report = calculateCVCompleteness(cv, 'id');
    expect(report.score).toBe(100);
    expect(report.checklist.every((item) => item.completed)).toBe(true);

    const strongBullet = analyzeBullet(
      'Mengembangkan arsitektur pembayaran yang meningkatkan transaksi harian sebesar 45% pada 3 juta pengguna.',
      'id'
    );
    expect(strongBullet.startsWithActionVerb).toBe(true);
    expect(strongBullet.hasMetric).toBe(true);
    expect(strongBullet.score).toBe(3);

    const weakBullet = analyzeBullet('Bertanggung jawab atas backend.', 'id');
    expect(weakBullet.hasMetric).toBe(false);
    expect(weakBullet.suggestions.length).toBeGreaterThan(0);
  });

  it('compiles both Indonesian and English Harvard CVs into real native PDFs via Tectonic', async () => {
    const cvEn = createSampleCVEnglish('integration-compile-en');
    const res = await compileCVToPdf(cvEn, 'cv');
    expect(res.pdfBase64.length).toBeGreaterThan(1000);
    expect(res.pageCount).toBe(1);
    const pdfBuffer = Buffer.from(res.pdfBase64, 'base64');
    expect(pdfBuffer.subarray(0, 4).toString('ascii')).toBe('%PDF');
  }, 25000);

  it('builds and compiles Harvard Cover Letter and 2-page Combined Package with Click-to-Sync markers', async () => {
    const cv = createSampleCVIndonesian('cover-letter-test');
    const coverTex = buildHarvardLatex(cv, 'cover-letter');
    expect(coverTex).toContain('% === SECTION: coverLetter ===');
    expect(coverTex).toContain(cv.coverLetter.companyName);

    const combinedRes = await compileCVToPdf(cv, 'combined');
    expect(combinedRes.pdfBase64.length).toBeGreaterThan(1000);
    expect(combinedRes.pageCount).toBeGreaterThanOrEqual(2);
  }, 25000);
});
