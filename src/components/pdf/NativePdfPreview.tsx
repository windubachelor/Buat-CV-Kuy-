import {
  AlertTriangle,
  Code2,
  Download,
  FileCheck2,
  FileCode,
  Maximize2,
  Minimize2,
  MousePointerClick,
  RefreshCw,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type CVData,
  type DocumentMode,
  isCoverLetterTemplatePreset,
} from '../../shared/schema';
import type { ActiveEditorSection } from '../editor/SectionForms';
import { Badge, Button, Tooltip, cn } from '../ui/primitives';

interface NativePdfPreviewProps {
  cv: CVData;
  documentMode: DocumentMode;
  onChangeDocumentMode: (mode: DocumentMode) => void;
  activeSection: ActiveEditorSection;
  onSelectSection: (section: ActiveEditorSection) => void;
  pdfBase64: string | null;
  texSource: string;
  pageCount: number;
  durationMs: number | null;
  engineName: string;
  isCompiling: boolean;
  compileError: string | null;
  warnings: string[];
  onManualRecompile: () => void;
  onDownloadPdf: () => void;
  onDownloadTex: () => void;
  onAutoFitOnePage: () => void;
  onOpenSpaceOptimizer: () => void;
}

interface PdfSectionHotspot {
  key: ActiveEditorSection;
  labelId: string;
  labelEn: string;
  weight: number;
  summaryText: string;
}

const SECTION_META: Record<
  string,
  { labelId: string; labelEn: string; baseWeight: number }
> = {
  personalInfo: { labelId: 'Header & Kontak', labelEn: 'Header & Contact', baseWeight: 11 },
  summary: { labelId: 'Ringkasan Profil', labelEn: 'Professional Summary', baseWeight: 11 },
  education: { labelId: 'Pendidikan', labelEn: 'Education', baseWeight: 18 },
  experience: { labelId: 'Pengalaman Kerja', labelEn: 'Work Experience', baseWeight: 28 },
  leadership: { labelId: 'Kepemimpinan', labelEn: 'Leadership', baseWeight: 16 },
  projects: { labelId: 'Proyek Terpilih', labelEn: 'Projects', baseWeight: 14 },
  awards: { labelId: 'Penghargaan', labelEn: 'Honors & Awards', baseWeight: 9 },
  certifications: { labelId: 'Sertifikasi', labelEn: 'Certifications', baseWeight: 9 },
  publications: { labelId: 'Publikasi', labelEn: 'Publications', baseWeight: 10 },
  skills: { labelId: 'Keahlian & Bahasa', labelEn: 'Skills & Languages', baseWeight: 12 },
  custom: { labelId: 'Section Kustom', labelEn: 'Custom Section', baseWeight: 12 },
  coverLetter: { labelId: 'Cover Letter Harvard', labelEn: 'Harvard Cover Letter', baseWeight: 100 },
};

export const NativePdfPreview: React.FC<NativePdfPreviewProps> = ({
  cv,
  documentMode,
  onChangeDocumentMode,
  activeSection,
  onSelectSection,
  pdfBase64,
  texSource,
  pageCount,
  durationMs,
  isCompiling,
  compileError,
  warnings,
  onManualRecompile,
  onDownloadPdf,
  onDownloadTex,
  onAutoFitOnePage,
  onOpenSpaceOptimizer,
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'pdf' | 'tex'>('pdf');
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [clickSyncEnabled, setClickSyncEnabled] = useState<boolean>(true);
  const [hoveredHotspot, setHoveredHotspot] = useState<ActiveEditorSection | null>(null);
  const texPreRef = useRef<HTMLPreElement | null>(null);

  const isId = cv.settings.cvLanguage === 'id';
  const isDedicatedCoverLetter = isCoverLetterTemplatePreset(cv.settings.templatePreset);

  useEffect(() => {
    if (!pdfBase64) return;
    const binary = atob(pdfBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [pdfBase64]);

  // Compute proportional vertical hotspots for Click-to-Sync overlay on the rendered PDF page
  const sectionHotspots = useMemo<PdfSectionHotspot[]>(() => {
    if (documentMode === 'cover-letter') {
      return [
        {
          key: 'personalInfo',
          labelId: 'Header Kontak Kandidat',
          labelEn: 'Candidate Header',
          weight: 16,
          summaryText: cv.personalInfo.fullName || 'Header',
        },
        {
          key: 'coverLetter',
          labelId: 'Isi Cover Letter Harvard',
          labelEn: 'Harvard Cover Letter Body',
          weight: 84,
          summaryText: cv.coverLetter?.companyName || 'Cover Letter',
        },
      ];
    }

    const list: PdfSectionHotspot[] = [
      {
        key: 'personalInfo',
        labelId: SECTION_META.personalInfo!.labelId,
        labelEn: SECTION_META.personalInfo!.labelEn,
        weight: 12,
        summaryText: cv.personalInfo.fullName,
      },
    ];

    for (const sec of cv.sectionOrder) {
      if (!sec.visible) continue;
      const k = sec.key;
      const meta = SECTION_META[k];
      if (!meta) continue;

      if (k === 'summary' && cv.summary.content.trim()) {
        list.push({
          key: 'summary',
          labelId: meta.labelId,
          labelEn: meta.labelEn,
          weight: 11,
          summaryText: cv.summary.content.slice(0, 48),
        });
      } else if (k === 'education' && cv.education.length > 0) {
        list.push({
          key: 'education',
          labelId: meta.labelId,
          labelEn: meta.labelEn,
          weight: Math.min(28, 12 + cv.education.length * 6),
          summaryText: cv.education[0]?.institution || '',
        });
      } else if (k === 'experience' && cv.experience.length > 0) {
        list.push({
          key: 'experience',
          labelId: meta.labelId,
          labelEn: meta.labelEn,
          weight: Math.min(40, 16 + cv.experience.length * 9),
          summaryText: cv.experience[0]?.company || '',
        });
      } else if (k === 'leadership' && cv.leadership.length > 0) {
        list.push({
          key: 'leadership',
          labelId: meta.labelId,
          labelEn: meta.labelEn,
          weight: Math.min(24, 10 + cv.leadership.length * 6),
          summaryText: cv.leadership[0]?.organization || '',
        });
      } else if (k === 'projects' && cv.projects.length > 0) {
        list.push({
          key: 'projects',
          labelId: meta.labelId,
          labelEn: meta.labelEn,
          weight: Math.min(20, 10 + cv.projects.length * 5),
          summaryText: cv.projects[0]?.name || '',
        });
      } else if (k === 'awards' && cv.awards.length > 0) {
        list.push({
          key: 'awards',
          labelId: meta.labelId,
          labelEn: meta.labelEn,
          weight: 9,
          summaryText: cv.awards[0]?.title || '',
        });
      } else if (k === 'certifications' && cv.certifications.length > 0) {
        list.push({
          key: 'certifications',
          labelId: meta.labelId,
          labelEn: meta.labelEn,
          weight: 9,
          summaryText: cv.certifications[0]?.name || '',
        });
      } else if (k === 'publications' && cv.publications.length > 0) {
        list.push({
          key: 'publications',
          labelId: meta.labelId,
          labelEn: meta.labelEn,
          weight: 10,
          summaryText: cv.publications[0]?.title || '',
        });
      } else if (
        k === 'skills' &&
        (cv.skills.categories.length > 0 || cv.skills.languages.length > 0)
      ) {
        list.push({
          key: 'skills',
          labelId: meta.labelId,
          labelEn: meta.labelEn,
          weight: 13,
          summaryText: cv.skills.categories[0]?.category || 'Skills',
        });
      } else if (k === 'custom' && cv.customSections.length > 0) {
        list.push({
          key: 'custom',
          labelId: cv.customSections[0]?.sectionTitle || meta.labelId,
          labelEn: cv.customSections[0]?.sectionTitle || meta.labelEn,
          weight: 12,
          summaryText: cv.customSections[0]?.sectionTitle || '',
        });
      }
    }

    const totalW = list.reduce((acc, item) => acc + item.weight, 0) || 100;
    return list.map((item) => ({
      ...item,
      weight: Math.round((item.weight / totalW) * 100),
    }));
  }, [cv, documentMode]);

  // Split .tex source by section markers so we can highlight the active section in .tex mode
  const texChunks = useMemo(() => {
    if (!texSource) return [{ section: null as string | null, content: '' }];
    const parts = texSource.split(/(% === SECTION: [a-zA-Z]+ ===)/g);
    const result: Array<{ section: string | null; content: string }> = [];
    let currentSection: string | null = null;

    for (const part of parts) {
      const m = /^% === SECTION: ([a-zA-Z]+) ===$/.exec(part.trim());
      if (m) {
        currentSection = m[1] || null;
      } else if (part) {
        result.push({ section: currentSection, content: part });
      }
    }
    return result;
  }, [texSource]);

  const statusState = compileError ? 'error' : isCompiling ? 'compiling' : 'ready';
  const expectedPages = documentMode === 'combined' ? 2 : 1;
  const isOverflowing = pageCount > expectedPages;

  return (
    <div className="flex flex-col h-full surface-elevated overflow-hidden relative">
      {/* Top Preview Header Bar */}
      <div className="px-3.5 py-2.5 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-2 bg-[var(--surface)]/90 backdrop-blur-md z-10">
        <div className="flex flex-wrap items-center gap-2">
          {/* Document Mode Switcher: hidden when a dedicated Cover Letter template is selected */}
          {isDedicatedCoverLetter ? (
            <div className="px-3 py-1 rounded-[10px] bg-[#B8A9F5]/25 border border-[#B8A9F5]/50 text-xs font-bold text-[#2A2150] dark:text-[#DFD7FC] whitespace-nowrap">
              {cv.settings.templatePreset === 'cover_letter_1'
                ? 'Cover Letter #1 (ModernCV ID)'
                : 'Simple Letter (Overleaf)'}
            </div>
          ) : (
            <div className="flex items-center p-1 rounded-[12px] bg-[var(--muted)] border border-[var(--border)]">
              <button
                type="button"
                onClick={() => onChangeDocumentMode('cv')}
                className={cn(
                  'px-2.5 py-1 rounded-[8px] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                  documentMode === 'cv'
                    ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-2xs'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                )}
              >
                Resume CV
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeDocumentMode('cover-letter');
                  onSelectSection('coverLetter');
                }}
                className={cn(
                  'px-2.5 py-1 rounded-[8px] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                  documentMode === 'cover-letter'
                    ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-2xs'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                )}
              >
                Cover Letter
              </button>
              <button
                type="button"
                onClick={() => onChangeDocumentMode('combined')}
                className={cn(
                  'px-2.5 py-1 rounded-[8px] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                  documentMode === 'combined'
                    ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-2xs'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                )}
              >
                Paket 2-Hal
              </button>
            </div>
          )}

          {/* Segmented View Toggle: Native PDF vs .tex Source */}
          <div className="flex items-center p-1 rounded-[12px] bg-[var(--muted)] border border-[var(--border)]">
            <button
              type="button"
              onClick={() => setViewMode('pdf')}
              className={cn(
                'px-2.5 py-1 rounded-[8px] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap',
                viewMode === 'pdf'
                  ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-2xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              )}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-[#9B86EC]" strokeWidth={2.5} />
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('tex')}
              className={cn(
                'px-2.5 py-1 rounded-[8px] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap',
                viewMode === 'tex'
                  ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-2xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              )}
            >
              <Code2 className="w-3.5 h-3.5 text-[#9B86EC]" strokeWidth={2.5} />
              <span>.tex</span>
            </button>
          </div>

          {/* Live Server Compilation Status */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-heading tabular-nums">
            <span
              className={cn(
                'w-2 h-2 rounded-full shrink-0',
                statusState === 'compiling' && 'bg-amber-400 animate-pulse',
                statusState === 'ready' && 'bg-emerald-500',
                statusState === 'error' && 'bg-red-500'
              )}
            />
            <span className="font-semibold text-[var(--foreground)]">
              {statusState === 'compiling'
                ? t('editor.compiling')
                : statusState === 'error'
                  ? 'Error'
                  : `${pageCount} Hal`}
            </span>
            {durationMs !== null && statusState === 'ready' && (
              <span className="text-[var(--muted-foreground)] text-[11px]">
                · {durationMs}ms
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <Tooltip content="Toggle Click-to-Sync Interaktif antara PDF & Form">
            <button
              type="button"
              onClick={() => setClickSyncEnabled((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap',
                clickSyncEnabled
                  ? 'bg-[#B8A9F5]/25 border-[#9B86EC] text-[#2A2150] dark:text-[#DFD7FC]'
                  : 'bg-[var(--surface)] border-[var(--border-strong)] text-[var(--muted-foreground)]'
              )}
            >
              <MousePointerClick className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span className="hidden xl:inline">Sync</span>
            </button>
          </Tooltip>

          <Tooltip content="Smart Space Optimizer (Pengatur Ruang 1 Halaman Opsional)">
            <Button
              variant={isOverflowing ? 'peach' : 'outline'}
              size="sm"
              onClick={onOpenSpaceOptimizer}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span className="hidden md:inline">Optimizer</span>
            </Button>
          </Tooltip>

          <Tooltip content={t('editor.compileNow')} kbd="⌘P">
            <Button
              variant="outline"
              size="sm"
              onClick={onManualRecompile}
              disabled={isCompiling}
            >
              <RefreshCw
                className={cn('w-3.5 h-3.5', isCompiling && 'animate-spin')}
                strokeWidth={2.5}
              />
            </Button>
          </Tooltip>

          <Tooltip content="Unduh kode sumber .tex">
            <Button variant="outline" size="sm" onClick={onDownloadTex}>
              <FileCode className="w-3.5 h-3.5" strokeWidth={2.5} />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Interactive Bidirectional Click-to-Sync Section Strip */}
      {clickSyncEnabled && (
        <div className="px-3.5 py-1.5 bg-[var(--muted)]/60 border-b border-[var(--border)] flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="inline-flex items-center gap-1 font-bold text-[#2A2150] dark:text-[#B8A9F5] shrink-0 mr-1">
            <MousePointerClick className="w-3 h-3" strokeWidth={2.5} />
            <span>Klik-untuk-Sinkron:</span>
          </span>
          {sectionHotspots.map((spot) => {
            const isActive = activeSection === spot.key || hoveredHotspot === spot.key;
            return (
              <button
                key={spot.key}
                type="button"
                onClick={() => onSelectSection(spot.key)}
                onMouseEnter={() => setHoveredHotspot(spot.key)}
                onMouseLeave={() => setHoveredHotspot(null)}
                className={cn(
                  'px-2 py-0.5 rounded-[7px] font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0',
                  isActive
                    ? 'bg-[#B8A9F5] text-[#2A2150] shadow-2xs'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]'
                )}
              >
                {isId ? spot.labelId : spot.labelEn}
              </button>
            );
          })}
        </div>
      )}

      {/* One-Page Overflow Guard Alert Bar */}
      {isOverflowing && (
        <div className="px-4 py-2 bg-[#FFF1B8]/75 dark:bg-[#3A341C] border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs text-[#3D3408] dark:text-[#FFF1B8]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={2.5} />
            <span>
              <strong>One-Page Overflow Guard ({pageCount} Hal):</strong> Dokumen meluber melebihi{' '}
              {expectedPages} halaman standar Harvard.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenSpaceOptimizer}
              className="font-bold underline hover:no-underline whitespace-nowrap cursor-pointer"
            >
              Pilih Level Optimasi Ruang →
            </button>
            <button
              type="button"
              onClick={onAutoFitOnePage}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#3D3408] text-[#FFF1B8] dark:bg-[#FFF1B8] dark:text-[#3D3408] font-bold whitespace-nowrap cursor-pointer"
            >
              <Minimize2 className="w-3 h-3" strokeWidth={2.5} />
              <span>Auto-Fit Cepat</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Banner (while preserving last valid PDF below) */}
      {compileError && (
        <div className="p-3.5 bg-[#FFC8DD]/45 dark:bg-[#3E1F2D] border-b border-red-300 dark:border-red-800 text-xs text-red-900 dark:text-red-200 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" strokeWidth={2.5} />
            <div>
              <p className="font-bold">Kompilasi LaTeX Gagal (Menampilkan PDF terakhir yang berhasil):</p>
              <p className="mt-1 break-all">{compileError}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onManualRecompile}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Main Viewport: Native PDF or .tex Code with Bidirectional Section Highlight */}
      <div className="flex-1 relative bg-[#E8E4F8]/45 dark:bg-[#0B0912] overflow-auto">
        {viewMode === 'tex' ? (
          <div className="h-full overflow-auto p-5">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="lavender">
                Kode Sumber LaTeX · Klik Bagian untuk Sinkronisasi ke Form Editor
              </Badge>
              <Button variant="secondary" size="sm" onClick={onDownloadTex}>
                <FileCode className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span>Unduh .tex</span>
              </Button>
            </div>
            <pre
              ref={texPreRef}
              className="p-4 rounded-[16px] bg-[#151221] text-[#E2DDF5] text-xs leading-relaxed overflow-x-auto border border-[#2E2944] shadow-inner space-y-1"
            >
              {texChunks.map((chunk, idx) => {
                const isSelected = Boolean(
                  chunk.section && chunk.section === activeSection
                );
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (chunk.section) {
                        onSelectSection(chunk.section as ActiveEditorSection);
                      }
                    }}
                    className={cn(
                      'rounded-[8px] px-2 py-0.5 transition-colors',
                      chunk.section && 'cursor-pointer hover:bg-[#B8A9F5]/15',
                      isSelected &&
                        'bg-[#B8A9F5]/25 ring-1 ring-[#B8A9F5] text-white'
                    )}
                  >
                    {chunk.content}
                  </div>
                );
              })}
            </pre>
            {warnings.length > 0 && (
              <div className="mt-4 p-3 rounded-[12px] bg-[#FFF1B8]/40 dark:bg-[#3A341C]/50 text-xs">
                <p className="font-semibold mb-1">Catatan Mesin TeX:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : blobUrl ? (
          <div className="w-full h-full flex relative">
            {/* Native Vector PDF Iframe */}
            <div
              className="flex-1 h-full flex justify-center transition-all duration-150 relative"
              style={{
                transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
                transformOrigin: 'top center',
              }}
            >
              <iframe
                src={`${blobUrl}#toolbar=0&navpanes=0&view=FitH`}
                title="Pratinjau PDF Harvard LaTeX Asli"
                className="w-full h-full min-h-[620px] border-0"
              />

              {/* Bidirectional Click-to-Sync Interactive Section Map Rail & Highlight Band on PDF */}
              {clickSyncEnabled && (
                <div
                  aria-label="Peta Sinkronisasi Bagian PDF"
                  className="absolute inset-y-4 right-3 w-40 sm:w-44 pointer-events-none flex flex-col gap-1 z-20"
                >
                  {sectionHotspots.map((spot) => {
                    const isSpotActive =
                      activeSection === spot.key || hoveredHotspot === spot.key;
                    return (
                      <button
                        key={spot.key}
                        type="button"
                        style={{ flexGrow: spot.weight }}
                        onClick={() => onSelectSection(spot.key)}
                        onMouseEnter={() => setHoveredHotspot(spot.key)}
                        onMouseLeave={() => setHoveredHotspot(null)}
                        title={`Klik untuk mengedit bagian ${isId ? spot.labelId : spot.labelEn}`}
                        className={cn(
                          'pointer-events-auto w-full rounded-[10px] px-2.5 py-1 text-left transition-all flex flex-col justify-center cursor-pointer border backdrop-blur-xs',
                          isSpotActive
                            ? 'bg-[#B8A9F5]/85 dark:bg-[#9B86EC]/85 text-[#211942] dark:text-white border-[#2A2150]/40 shadow-md translate-x-0 opacity-100'
                            : 'bg-[var(--surface)]/70 hover:bg-[var(--surface)]/95 text-[var(--foreground)] border-[var(--border-strong)] opacity-75 hover:opacity-100'
                        )}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold font-heading truncate">
                            {isId ? spot.labelId : spot.labelEn}
                          </span>
                          {isSpotActive && (
                            <span className="text-[9px] font-bold uppercase px-1 rounded bg-black/15">
                              Aktif
                            </span>
                          )}
                        </div>
                        {spot.summaryText && (
                          <span className="text-[9px] opacity-80 truncate">
                            {spot.summaryText}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Shimmer Skeleton for PDF Loading */
          <div className="h-full min-h-[540px] flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-md rounded-[16px] bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4 shadow-[var(--shadow-2)]">
              <div className="h-6 w-2/3 mx-auto rounded-lg skeleton-shimmer" />
              <div className="h-3 w-1/2 mx-auto rounded-md skeleton-shimmer" />
              <div className="pt-4 space-y-2">
                <div className="h-3.5 w-1/3 rounded-md skeleton-shimmer" />
                <div className="h-3 w-full rounded-md skeleton-shimmer" />
                <div className="h-3 w-5/6 rounded-md skeleton-shimmer" />
              </div>
              <div className="pt-3 space-y-2">
                <div className="h-3.5 w-1/3 rounded-md skeleton-shimmer" />
                <div className="h-3 w-full rounded-md skeleton-shimmer" />
                <div className="h-3 w-4/5 rounded-md skeleton-shimmer" />
                <div className="h-3 w-full rounded-md skeleton-shimmer" />
              </div>
              <p className="text-center text-xs font-semibold text-[var(--muted-foreground)] pt-2">
                Mengompilasi PDF vektor asli dengan Tectonic LaTeX...
              </p>
            </div>
          </div>
        )}

        {/* Floating Bottom Glass Toolbar for PDF Zoom & Page Info */}
        {viewMode === 'pdf' && blobUrl && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1F1B2E]/85 dark:bg-[#1D192E]/90 text-white backdrop-blur-md border border-white/15 shadow-lg text-xs font-heading tabular-nums">
            <Tooltip content="Perkecil">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(75, z - 10))}
                className="p-1 rounded-full hover:bg-white/15 cursor-pointer"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            </Tooltip>
            <span className="px-1.5 font-bold">{zoom}%</span>
            <Tooltip content="Perbesar">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(135, z + 10))}
                className="p-1 rounded-full hover:bg-white/15 cursor-pointer"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            </Tooltip>
            <span className="opacity-30">|</span>
            <Tooltip content="Reset 100% Fit Width">
              <button
                type="button"
                onClick={() => setZoom(100)}
                className="p-1 rounded-full hover:bg-white/15 cursor-pointer"
                aria-label="Fit width"
              >
                <Maximize2 className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            </Tooltip>
            <span className="opacity-30">|</span>
            <span className="px-1.5">
              {pageCount} Hal ·{' '}
              {documentMode === 'cover-letter'
                ? 'Cover Letter'
                : documentMode === 'combined'
                  ? 'Paket Lengkap'
                  : 'Resume'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
