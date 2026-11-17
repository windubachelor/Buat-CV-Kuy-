import {
  ArrowLeft,
  Award,
  BookOpen,
  Briefcase,
  Check,
  ClipboardCopy,
  Download,
  Edit3,
  Eye,
  FileBadge,
  FileJson,
  FileText,
  FolderGit2,
  GraduationCap,
  Keyboard,
  Layers,
  Mail,
  PanelRightClose,
  PanelRightOpen,
  Redo2,
  SlidersHorizontal,
  Undo2,
  Upload,
  User,
  Users,
  Wrench,
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CoverLetterPanel } from '../components/editor/CoverLetterPanel';
import { HarvardSettingsPanel } from '../components/editor/HarvardSettingsPanel';
import { type ActiveEditorSection, SectionForms } from '../components/editor/SectionForms';
import { SmartSpaceOptimizerModal } from '../components/editor/SmartSpaceOptimizerModal';
import { NativePdfPreview } from '../components/pdf/NativePdfPreview';
import {
  Badge,
  Button,
  Kbd,
  ModalDialog,
  RadialProgressRing,
  Tooltip,
  TooltipProvider,
  cn,
} from '../components/ui/primitives';
import { buildHarvardLatex } from '../server/latexBuilder';
import type { CompileResponse, DocumentMode } from '../shared/schema';
import { calculateCVCompleteness } from '../shared/scoring';
import { useCVStore } from '../store/useCVStore';

const SECTION_RAIL_ITEMS: Array<{
  id: ActiveEditorSection;
  labelId: string;
  labelEn: string;
  icon: React.ElementType;
  tone: string;
}> = [
  { id: 'personalInfo', labelId: 'Pribadi', labelEn: 'Personal', icon: User, tone: '#9B86EC' },
  { id: 'summary', labelId: 'Profil', labelEn: 'Summary', icon: FileText, tone: '#10B981' },
  { id: 'education', labelId: 'Pendidikan', labelEn: 'Education', icon: GraduationCap, tone: '#38BDF8' },
  { id: 'experience', labelId: 'Pengalaman', labelEn: 'Experience', icon: Briefcase, tone: '#F59E0B' },
  { id: 'leadership', labelId: 'Organisasi', labelEn: 'Leadership', icon: Users, tone: '#EAB308' },
  { id: 'projects', labelId: 'Proyek', labelEn: 'Projects', icon: FolderGit2, tone: '#EC4899' },
  { id: 'awards', labelId: 'Penghargaan', labelEn: 'Awards', icon: Award, tone: '#F59E0B' },
  { id: 'certifications', labelId: 'Sertifikasi', labelEn: 'Certifications', icon: FileBadge, tone: '#10B981' },
  { id: 'publications', labelId: 'Publikasi', labelEn: 'Publications', icon: BookOpen, tone: '#38BDF8' },
  { id: 'skills', labelId: 'Keahlian', labelEn: 'Skills', icon: Wrench, tone: '#9B86EC' },
  { id: 'custom', labelId: 'Kustom', labelEn: 'Custom', icon: Layers, tone: '#F97316' },
  { id: 'coverLetter', labelId: 'Cover Letter', labelEn: 'Cover Letter', icon: Mail, tone: '#EC4899' },
  { id: 'layout', labelId: 'Tampilan PDF', labelEn: 'PDF Layout', icon: SlidersHorizontal, tone: '#9B86EC' },
];

export const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    prefs,
    saveStatus,
    past,
    future,
    setActiveCv,
    getActiveCv,
    updateActiveCv,
    undo,
    redo,
    autoFitOnePage,
    incrementExportCount,
    importCVFromJson,
  } = useCVStore();

  useEffect(() => {
    if (id) {
      setActiveCv(id);
    }
  }, [id, setActiveCv]);

  const activeCv = getActiveCv();

  const [activeSection, setActiveSection] = useState<ActiveEditorSection>('personalInfo');
  const [documentMode, setDocumentMode] = useState<DocumentMode>('cv');
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [spaceOptimizerOpen, setSpaceOptimizerOpen] = useState(false);
  const [syncPulse, setSyncPulse] = useState(false);

  // Resizable & Collapsible right preview pane state
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [previewWidthPct, setPreviewWidthPct] = useState<number>(48);
  const isResizingRef = useRef(false);
  const formViewportRef = useRef<HTMLDivElement | null>(null);

  // Compilation states
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [engineName, setEngineName] = useState<string>('tectonic');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compileError, setCompileError] = useState<string | null>(null);

  const importInputRef = useRef<HTMLInputElement | null>(null);
  const compileTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completeness = useMemo(
    () => (activeCv ? calculateCVCompleteness(activeCv, prefs.uiLanguage) : null),
    [activeCv, prefs.uiLanguage]
  );

  const liveTexSource = useMemo(
    () => (activeCv ? buildHarvardLatex(activeCv, documentMode) : ''),
    [activeCv, documentMode]
  );

  // Bidirectional Click-to-Sync handler (from PDF Preview or Rail)
  const handleSelectSection = useCallback(
    (nextSection: ActiveEditorSection, fromPreview = false) => {
      setActiveSection(nextSection);
      if (nextSection === 'coverLetter' && documentMode === 'cv') {
        setDocumentMode('cover-letter');
      } else if (
        nextSection !== 'coverLetter' &&
        nextSection !== 'layout' &&
        nextSection !== 'personalInfo' &&
        documentMode === 'cover-letter'
      ) {
        setDocumentMode('cv');
      }

      if (fromPreview) {
        setMobileTab('edit');
        setSyncPulse(true);
        setTimeout(() => setSyncPulse(false), 900);
      }

      if (formViewportRef.current) {
        formViewportRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [documentMode]
  );

  // Drag handle resize listener for 3-zone split
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const vw = window.innerWidth;
      const rightWidth = vw - e.clientX;
      const pct = Math.max(30, Math.min(62, Math.round((rightWidth / vw) * 100)));
      setPreviewWidthPct(pct);
    };
    const onMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const triggerCompile = useCallback(
    async (cvToCompile = activeCv, modeToCompile = documentMode) => {
      if (!cvToCompile) return;
      setIsCompiling(true);
      setCompileError(null);

      try {
        const response = await fetch('/api/compile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cv: cvToCompile, mode: modeToCompile }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Gagal mengompilasi dokumen LaTeX');
        }

        const result = data as CompileResponse;
        setPdfBase64(result.pdfBase64);
        setPageCount(result.pageCount);
        setDurationMs(result.durationMs);
        setEngineName(result.engine);
        setWarnings(result.warnings || []);
      } catch (err) {
        setCompileError(
          err instanceof Error ? err.message : 'Gagal menghubungi server kompilasi LaTeX'
        );
      } finally {
        setIsCompiling(false);
      }
    },
    [activeCv, documentMode]
  );

  // Debounced automatic compilation
  useEffect(() => {
    if (!activeCv) return;
    if (compileTimeoutRef.current) clearTimeout(compileTimeoutRef.current);

    compileTimeoutRef.current = setTimeout(() => {
      triggerCompile(activeCv, documentMode);
    }, pdfBase64 ? 950 : 120);

    return () => {
      if (compileTimeoutRef.current) clearTimeout(compileTimeoutRef.current);
    };
  }, [activeCv, documentMode, triggerCompile]);

  // Keyboard shortcuts: Ctrl+S, Ctrl+Z, Ctrl+Y, Ctrl+P
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;

      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        toast.success('CV tersimpan otomatis di penyimpanan lokal.');
      } else if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          undo();
          toast.info('Undo perubahan terakhir');
        }
      } else if (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey)) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          redo();
          toast.info('Redo perubahan');
        }
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        triggerCompile();
        toast.info('Mengompilasi ulang PDF LaTeX...');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, triggerCompile]);

  if (!activeCv) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <p className="text-base font-bold">CV tidak ditemukan.</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleDownloadPdf = () => {
    if (!pdfBase64) {
      toast.error('PDF sedang dikompilasi, silakan tunggu sebentar.');
      return;
    }
    const binary = atob(pdfBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (activeCv.personalInfo.fullName || activeCv.title).replace(
      /[^a-zA-Z0-9_-]+/g,
      '_'
    );
    const suffix =
      documentMode === 'cover-letter'
        ? 'Harvard_Cover_Letter'
        : documentMode === 'combined'
          ? 'Harvard_Application_Package'
          : 'Harvard_CV';
    a.download = `${safeName}_${suffix}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    incrementExportCount(activeCv.id);

    toast.success('PDF Harvard LaTeX berhasil diunduh.');
  };

  const handleDownloadTex = () => {
    const blob = new Blob([liveTexSource], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (activeCv.personalInfo.fullName || activeCv.title).replace(
      /[^a-zA-Z0-9_-]+/g,
      '_'
    );
    const suffix =
      documentMode === 'cover-letter'
        ? 'Harvard_Cover_Letter'
        : documentMode === 'combined'
          ? 'Harvard_Application_Package'
          : 'Harvard_CV';
    a.download = `${safeName}_${suffix}.tex`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('Kode sumber .tex berhasil diunduh.');
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(activeCv, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeCv.title.replace(/[^a-zA-Z0-9_-]+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('Data CV (.json) berhasil diekspor.');
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(activeCv, null, 2));
      toast.success('JSON CV berhasil disalin ke clipboard.');
    } catch {
      toast.error('Gagal menyalin ke clipboard.');
    }
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = importCVFromJson(text);
      toast.success('Data JSON berhasil diimpor.');
      navigate(`/cv/${imported.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Format JSON tidak valid');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {/* Editor Header */}
        <header className="h-16 px-4 lg:px-6 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md flex items-center justify-between gap-4 sticky top-0 z-30">
          {/* Left: Back + Title + Autosave Status */}
          <div className="flex items-center gap-3 min-w-0">
            <Tooltip content="Kembali ke Dashboard">
              <Link
                to="/dashboard"
                className="p-2 rounded-[12px] border border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--muted)] transition-colors shrink-0"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
              </Link>
            </Tooltip>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold font-heading truncate max-w-[160px] sm:max-w-[260px]">
                  {activeCv.title}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                  <span aria-hidden="true">·</span>
                  {saveStatus === 'saved' ? (
                    <motion.span
                      key="saved"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold"
                    >
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      <span>Tersimpan</span>
                    </motion.span>
                  ) : (
                    <span>{t('editor.saving')}</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Undo/Redo + Completeness Stepper */}
          <div className="hidden xl:flex items-center gap-4">
            <div className="flex items-center gap-1 p-1 rounded-[12px] bg-[var(--muted)] border border-[var(--border)]">
              <Tooltip content="Undo" kbd="⌘Z">
                <button
                  type="button"
                  disabled={past.length === 0}
                  onClick={undo}
                  aria-label="Undo"
                  className="p-1.5 rounded-[8px] hover:bg-[var(--surface)] disabled:opacity-40 cursor-pointer transition-colors"
                >
                  <Undo2 className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </Tooltip>
              <Tooltip content="Redo" kbd="⌘Y">
                <button
                  type="button"
                  disabled={future.length === 0}
                  onClick={redo}
                  aria-label="Redo"
                  className="p-1.5 rounded-[8px] hover:bg-[var(--surface)] disabled:opacity-40 cursor-pointer transition-colors"
                >
                  <Redo2 className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </Tooltip>
            </div>

            {completeness && (
              <button
                type="button"
                onClick={() => setChecklistOpen(true)}
                className="flex items-center gap-3 px-3.5 py-1.5 rounded-[12px] bg-[var(--muted)]/80 hover:bg-[var(--muted)] border border-[var(--border-strong)] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  {completeness.checklist.map((item) => (
                    <span
                      key={item.id}
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        item.completed ? 'bg-emerald-500' : 'bg-[var(--border-strong)]'
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold font-heading tabular-nums text-[var(--foreground)]">
                  Skor Harvard: {completeness.score}%
                </span>
              </button>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportJson}
              className="hidden"
            />
            <Tooltip content="Impor dari File JSON">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => importInputRef.current?.click()}
                className="hidden lg:inline-flex"
              >
                <Upload className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span>Impor</span>
              </Button>
            </Tooltip>
            <Tooltip content="Ekspor ke File JSON">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportJson}
                className="hidden sm:inline-flex"
              >
                <FileJson className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span>JSON</span>
              </Button>
            </Tooltip>
            <Tooltip content="Salin JSON ke Clipboard">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyJson}
                className="hidden md:inline-flex"
              >
                <ClipboardCopy className="w-4 h-4" strokeWidth={2.5} />
              </Button>
            </Tooltip>
            <Tooltip content={t('editor.shortcuts')}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShortcutsOpen(true)}
              >
                <Keyboard className="w-4 h-4" strokeWidth={2.5} />
              </Button>
            </Tooltip>
            <Tooltip content={previewCollapsed ? 'Tampilkan Panel Pratinjau PDF' : 'Sembunyikan Panel Pratinjau PDF'}>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPreviewCollapsed((c) => !c)}
                className="hidden lg:inline-flex"
              >
                {previewCollapsed ? (
                  <PanelRightOpen className="w-4 h-4 text-[#9B86EC]" strokeWidth={2.5} />
                ) : (
                  <PanelRightClose className="w-4 h-4" strokeWidth={2.5} />
                )}
              </Button>
            </Tooltip>
            <Button variant="gradient" size="sm" onClick={handleDownloadPdf}>
              <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>{t('editor.downloadPdf')}</span>
            </Button>
          </div>
        </header>

        {/* 3-ZONE DESKTOP WORKSPACE: [1. Narrow Section Rail] | [2. Center Form] | [3. Resizable Right PDF Preview] */}
        <div className="flex-1 flex overflow-hidden h-[calc(100vh-4rem)] pb-14 lg:pb-0">
          {/* ZONE 1: Narrow Left Section Rail (Desktop) */}
          <aside className="hidden lg:flex flex-col items-center py-3 px-2 gap-1.5 border-r border-[var(--border)] bg-[var(--surface)] w-[88px] shrink-0 overflow-y-auto">
            {SECTION_RAIL_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              const secState = completeness?.sectionStatus[item.id];
              const isDone = Boolean(secState?.completed);
              const count = secState?.count ?? 0;
              const label = prefs.uiLanguage === 'id' ? item.labelId : item.labelEn;

              return (
                <Tooltip key={item.id} content={`${label}${count > 0 ? ` (${count})` : ''}`} side="right">
                  <button
                    type="button"
                    onClick={() => handleSelectSection(item.id, false)}
                    className={cn(
                      'relative w-full py-2 px-1 rounded-[14px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group',
                      isActive
                        ? 'bg-[#B8A9F5]/28 dark:bg-[#B8A9F5]/20 text-[#2A2150] dark:text-white font-bold shadow-2xs'
                        : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                    )}
                  >
                    <RadialProgressRing
                      progress={isDone ? 100 : count > 0 ? 50 : 0}
                      size={34}
                      strokeWidth={3}
                      color={isDone ? '#10B981' : item.tone}
                    >
                      <Icon className="w-4 h-4" strokeWidth={2.5} />
                    </RadialProgressRing>
                    <span className="text-[10px] font-medium truncate max-w-[72px]">
                      {label}
                    </span>
                    {count > 0 &&
                      item.id !== 'personalInfo' &&
                      item.id !== 'summary' &&
                      item.id !== 'coverLetter' && (
                        <span className="absolute top-1.5 right-2 px-1 min-w-[16px] h-4 rounded-full bg-[var(--elevated)] border border-[var(--border-strong)] text-[9px] font-bold font-heading flex items-center justify-center">
                          {count}
                        </span>
                      )}
                  </button>
                </Tooltip>
              );
            })}
          </aside>

          {/* ZONE 2: Center Form Area */}
          <div
            style={{
              width:
                !previewCollapsed && typeof window !== 'undefined' && window.innerWidth >= 1024
                  ? `${100 - previewWidthPct}%`
                  : '100%',
            }}
            className={cn(
              'flex-1 flex flex-col h-full overflow-hidden transition-[width] duration-75',
              mobileTab === 'preview' && 'hidden lg:flex'
            )}
          >
            {/* Mobile & Tablet Horizontal Section Selector */}
            <div className="lg:hidden px-3 py-2 bg-[var(--surface)] border-b border-[var(--border)] overflow-x-auto">
              <div className="flex items-center gap-1.5 min-w-max">
                {SECTION_RAIL_ITEMS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeSection === tab.id;
                  const secState = completeness?.sectionStatus[tab.id];
                  const isDone = secState?.completed;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleSelectSection(tab.id, false)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                        isActive
                          ? 'bg-[#B8A9F5] text-[#2A2150]'
                          : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
                      <span>{prefs.uiLanguage === 'id' ? tab.labelId : tab.labelEn}</span>
                      {isDone && !isActive && (
                        <Check className="w-3 h-3 text-emerald-600" strokeWidth={2.5} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Form Viewport with Click-to-Sync Highlight Ring */}
            <div
              ref={formViewportRef}
              className="flex-1 overflow-y-auto p-4 sm:p-7 max-w-3xl w-full mx-auto space-y-6"
            >
              <div
                className={cn(
                  'rounded-[22px] transition-all duration-300',
                  syncPulse && 'ring-2 ring-[#9B86EC] ring-offset-4 ring-offset-[var(--background)]'
                )}
              >
                {activeSection === 'layout' ? (
                  <HarvardSettingsPanel cv={activeCv} updateCV={updateActiveCv} />
                ) : activeSection === 'coverLetter' ? (
                  <CoverLetterPanel
                    cv={activeCv}
                    documentMode={documentMode}
                    onChangeDocumentMode={setDocumentMode}
                    updateCV={updateActiveCv}
                  />
                ) : (
                  <SectionForms
                    cv={activeCv}
                    activeSection={activeSection}
                    updateCV={updateActiveCv}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Interactive Resize Handle (Desktop) */}
          {!previewCollapsed && (
            <div
              onMouseDown={() => {
                isResizingRef.current = true;
                document.body.style.cursor = 'col-resize';
                document.body.style.userSelect = 'none';
              }}
              title="Geser untuk mengubah lebar panel pratinjau PDF"
              className="hidden lg:flex w-2 bg-transparent hover:bg-[#B8A9F5]/40 active:bg-[#9B86EC] cursor-col-resize items-center justify-center transition-colors shrink-0 group"
            >
              <div className="w-0.5 h-10 rounded-full bg-[var(--border-strong)] group-hover:bg-[#9B86EC]" />
            </div>
          )}

          {/* ZONE 3: Right Resizable & Collapsible Native PDF Preview */}
          {(!previewCollapsed || mobileTab === 'preview') && (
            <div
              style={{
                width:
                  typeof window !== 'undefined' && window.innerWidth >= 1024
                    ? `${previewWidthPct}%`
                    : '100%',
              }}
              className={cn(
                'p-2.5 sm:p-4 h-full overflow-hidden flex flex-col shrink-0 bg-[var(--muted)]/30',
                mobileTab === 'edit' && 'hidden lg:flex'
              )}
            >
              <NativePdfPreview
                cv={activeCv}
                documentMode={documentMode}
                onChangeDocumentMode={setDocumentMode}
                activeSection={activeSection}
                onSelectSection={(sec) => handleSelectSection(sec, true)}
                pdfBase64={pdfBase64}
                texSource={liveTexSource}
                pageCount={pageCount}
                durationMs={durationMs}
                engineName={engineName}
                isCompiling={isCompiling}
                compileError={compileError}
                warnings={warnings}
                onManualRecompile={() => triggerCompile(activeCv, documentMode)}
                onDownloadPdf={handleDownloadPdf}
                onDownloadTex={handleDownloadTex}
                onAutoFitOnePage={() => {
                  autoFitOnePage();
                  toast.success('Pengaturan dioptimalkan ke mode Compact 1-Halaman Harvard.');
                }}
                onOpenSpaceOptimizer={() => setSpaceOptimizerOpen(true)}
              />
            </div>
          )}
        </div>

        {/* Sticky Bottom Bar on Mobile: Edit | Preview | Optimizer | Unduh */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 h-14 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border-strong)] px-3 flex items-center justify-between gap-2 z-40">
          <button
            type="button"
            onClick={() => setMobileTab('edit')}
            className={cn(
              'flex-1 h-9 rounded-[10px] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer',
              mobileTab === 'edit'
                ? 'bg-[#B8A9F5] text-[#2A2150]'
                : 'text-[var(--muted-foreground)]'
            )}
          >
            <Edit3 className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={cn(
              'flex-1 h-9 rounded-[10px] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer',
              mobileTab === 'preview'
                ? 'bg-[#B8A9F5] text-[#2A2150]'
                : 'text-[var(--muted-foreground)]'
            )}
          >
            <Eye className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>PDF ({pageCount} Hal)</span>
          </button>
          <button
            type="button"
            onClick={() => setSpaceOptimizerOpen(true)}
            aria-label="Buka Smart Space Optimizer"
            className="h-9 px-2.5 rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] text-xs font-semibold inline-flex items-center justify-center cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
          <Button variant="gradient" size="sm" onClick={handleDownloadPdf}>
            <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Unduh</span>
          </Button>
        </div>

        {/* Smart Space Optimizer Modal */}
        <SmartSpaceOptimizerModal
          open={spaceOptimizerOpen}
          onOpenChange={setSpaceOptimizerOpen}
          cv={activeCv}
          pageCount={pageCount}
          updateCV={updateActiveCv}
        />

        {/* Completeness Checklist Modal */}
        <ModalDialog
          open={checklistOpen}
          onOpenChange={setChecklistOpen}
          title="Checklist Standar Resume Harvard OCS"
          description="Pastikan seluruh kriteria berikut terpenuhi agar CV Anda siap dikirim ke rekruter & sistem ATS."
        >
          {completeness && (
            <div className="space-y-4">
              <div className="p-4 rounded-[14px] bg-[var(--muted)] flex items-center justify-between">
                <span className="text-sm font-bold">Total Skor Kelengkapan CV</span>
                <span className="text-xl font-bold font-heading tabular-nums text-[#2A2150] dark:text-[#B8A9F5]">
                  {completeness.score} / 100
                </span>
              </div>

              <div className="space-y-2">
                {completeness.checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      handleSelectSection(item.section as ActiveEditorSection, false);
                      setChecklistOpen(false);
                    }}
                    className="p-3 rounded-[12px] border border-[var(--border)] flex items-center justify-between gap-3 hover:bg-[var(--muted)]/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 text-xs">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                          item.completed
                            ? 'bg-[#BFEBD7] text-[#133A29]'
                            : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                        )}
                      >
                        <Check className="w-3 h-3" strokeWidth={2.5} />
                      </div>
                      <span className={cn(item.completed && 'font-medium')}>
                        {item.label}
                      </span>
                    </div>
                    <Badge variant={item.completed ? 'mint' : 'neutral'}>
                      +{item.weight}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ModalDialog>

        {/* Keyboard Shortcuts Modal */}
        <ModalDialog
          open={shortcutsOpen}
          onOpenChange={setShortcutsOpen}
          title="Pintasan Keyboard Editor"
          description="Gunakan pintasan berikut untuk mempercepat penyusunan CV & Cover Letter Harvard Anda."
        >
          <div className="space-y-2.5 text-xs">
            {[
              { keys: '⌘K / Ctrl+K', desc: 'Buka Command Palette Global' },
              { keys: '⌘S / Ctrl+S', desc: 'Simpan perubahan sekarang' },
              { keys: '⌘P / Ctrl+P', desc: 'Kompilasi ulang PDF LaTeX sekarang' },
              { keys: '⌘Z / Ctrl+Z', desc: 'Batalkan perubahan (Undo)' },
              { keys: '⌘Y / Ctrl+Y', desc: 'Ulangi perubahan (Redo)' },
            ].map((sc) => (
              <div
                key={sc.keys}
                className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
              >
                <span className="text-[var(--muted-foreground)]">{sc.desc}</span>
                <Kbd>{sc.keys}</Kbd>
              </div>
            ))}
          </div>
        </ModalDialog>
      </div>
    </TooltipProvider>
  );
};
