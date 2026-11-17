import {
  ArrowUpRight,
  Award,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Edit3,
  FileJson,
  FilePlus2,
  FileText,
  FolderOpen,
  LayoutGrid,
  Lightbulb,
  List,
  Loader2,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Upload,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CreateCVModal } from '../components/dashboard/CreateCVModal';
import { AppShell } from '../components/layout/AppShell';
import {
  Badge,
  Button,
  CountUpNumber,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Kbd,
  ModalDialog,
  RadialProgressRing,
  Tooltip,
  cn,
} from '../components/ui/primitives';
import type { CVData } from '../shared/schema';
import { calculateCVCompleteness } from '../shared/scoring';
import { useCVStore } from '../store/useCVStore';

function formatRelativeTime(isoDate: string, lang: 'id' | 'en' = 'id'): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffSec = Math.max(1, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (lang === 'en') {
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 30) return `${diffDay}d ago`;
    return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (diffSec < 60) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHr < 24) return `${diffHr} jam lalu`;
  if (diffDay < 30) return `${diffDay} hari lalu`;
  return new Date(isoDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function getGreetingByHour(lang: 'id' | 'en'): { greeting: string; sub: string } {
  const hour = new Date().getHours();
  if (lang === 'en') {
    if (hour < 12) return { greeting: 'Good morning 👋', sub: 'Ready to land your dream role today?' };
    if (hour < 18) return { greeting: 'Good afternoon 👋', sub: 'Ready to craft a standout Harvard resume?' };
    return { greeting: 'Good evening 👋', sub: 'Polishing your achievements for tomorrow’s applications?' };
  }
  if (hour < 11) return { greeting: 'Selamat pagi 👋', sub: 'Siap melamar kerja hari ini?' };
  if (hour < 15) return { greeting: 'Selamat siang 👋', sub: 'Siap melamar kerja hari ini?' };
  if (hour < 19) return { greeting: 'Selamat sore 👋', sub: 'Siap menyempurnakan CV Harvard Anda hari ini?' };
  return { greeting: 'Selamat malam 👋', sub: 'Siap melamar kerja impian Anda?' };
}

const MiniSparkline: React.FC<{ points: number[]; stroke: string; fill: string }> = ({
  points,
  stroke,
  fill,
}) => {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = Math.max(max - min, 1);
  const width = 92;
  const height = 28;

  const coords = points.map((pt, idx) => {
    const x = (idx / Math.max(points.length - 1, 1)) * width;
    const y = height - ((pt - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polyline = coords.join(' ');
  const area = `0,${height} ${polyline} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0" aria-hidden="true">
      <polygon points={area} fill={fill} opacity={0.25} />
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polyline}
      />
    </svg>
  );
};

const CAREER_TIPS_CAROUSEL = [
  {
    badge: 'Prinsip #1 · Kata Kerja Aksi',
    title: 'Awali setiap poin dengan Kata Kerja Aksi yang tegas',
    body: 'Hindari frasa pasif seperti "Bertanggung jawab atas...". Gunakan kata kerja aktif seperti "Merancang", "Memimpin", "Mengoptimalkan", atau "Meningkatkan" di awal kalimat.',
    tone: 'bg-[#FFF1B8]/55 dark:bg-[#3A341C]/70 border-[#EAD47A]/60',
  },
  {
    badge: 'Prinsip #2 · Kuantifikasi Dampak',
    title: 'Buktikan pencapaian dengan angka & metrik konkret',
    body: 'Rekruter memindai CV dalam 6 detik. Sertakan persentase (+38% konversi), penghematan biaya ($145K/tahun), latensi (28ms), atau skala pengguna pada setiap pengalaman.',
    tone: 'bg-[#BFEBD7]/55 dark:bg-[#214033]/70 border-[#8CD4B5]/60',
  },
  {
    badge: 'Prinsip #3 · Disiplin 1 Halaman',
    title: 'Pertahankan tepat 1 halaman penuh untuk <8 tahun pengalaman',
    body: 'Format Harvard OCS dirancang satu kolom padat tanpa foto atau grafik batang agar parser ATS dapat mengekstrak 100% riwayat karir Anda tanpa distorsi.',
    tone: 'bg-[#BDE0FE]/55 dark:bg-[#1A3044]/70 border-[#90C7FA]/60',
  },
  {
    badge: 'Prinsip #4 · Kata Kunci Spesifik',
    title: 'Selaraskan terminologi teknis dengan deskripsi pekerjaan',
    body: 'Tulis nama teknologi secara eksplisit (mis. PostgreSQL, Kubernetes, Financial Modeling) di bagian Pengalaman dan Keahlian agar lolos penyaringan ATS otomatis.',
    tone: 'bg-[#FFD3B6]/55 dark:bg-[#3B281D]/70 border-[#F5B78E]/60',
  },
];

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    cvs,
    prefs,
    activities,
    createCV,
    duplicateCV,
    renameCV,
    deleteCV,
    incrementExportCount,
    importCVFromJson,
    setActiveCv,
  } = useCVStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'score' | 'title'>('updated');
  const [langFilter, setLangFilter] = useState<'all' | 'id' | 'en'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Career Tips Carousel state
  const [tipIndex, setTipIndex] = useState(0);
  const [tipPaused, setTipPaused] = useState(false);

  // Dialog states
  const [renameTarget, setRenameTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CVData | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // '/' keyboard shortcut to focus search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Auto-rotate career tips every 5.5s
  useEffect(() => {
    if (tipPaused) return;
    const timer = setInterval(() => {
      setTipIndex((i) => (i + 1) % CAREER_TIPS_CAROUSEL.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [tipPaused]);

  const cvWithScores = useMemo(() => {
    return cvs.map((cv) => ({
      cv,
      report: calculateCVCompleteness(cv, prefs.uiLanguage),
    }));
  }, [cvs, prefs.uiLanguage]);

  const totalExports = useMemo(
    () => cvs.reduce((sum, item) => sum + (item.exportCount || 0), 0),
    [cvs]
  );

  const avgScore = useMemo(() => {
    if (cvWithScores.length === 0) return 0;
    const total = cvWithScores.reduce((acc, item) => acc + item.report.score, 0);
    return Math.round(total / cvWithScores.length);
  }, [cvWithScores]);

  const filteredList = useMemo(() => {
    return cvWithScores
      .filter(({ cv }) => {
        if (langFilter !== 'all' && cv.settings.cvLanguage !== langFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          cv.title.toLowerCase().includes(q) ||
          cv.personalInfo.fullName.toLowerCase().includes(q) ||
          cv.personalInfo.headline.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.report.score - a.report.score;
        if (sortBy === 'title') return a.cv.title.localeCompare(b.cv.title);
        return new Date(b.cv.updatedAt).getTime() - new Date(a.cv.updatedAt).getTime();
      });
  }, [cvWithScores, langFilter, searchQuery, sortBy]);

  const handleOpenCV = (id: string) => {
    setActiveCv(id);
    navigate(`/cv/${id}`);
  };

  const handleDirectDownloadPdf = async (cv: CVData) => {
    try {
      setDownloadingId(cv.id);
      const res = await fetch('/api/compile?format=binary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Gagal mengompilasi PDF' }));
        throw new Error(errData.error || 'Gagal mengompilasi PDF');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(cv.personalInfo.fullName || cv.title).replace(/[^a-zA-Z0-9_-]+/g, '_')}_Harvard_CV.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      incrementExportCount(cv.id);
      toast.success('PDF Harvard berhasil dikompilasi & diunduh!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengunduh PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleExportJson = (cv: CVData) => {
    const blob = new Blob([JSON.stringify(cv, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cv.title.replace(/[^a-zA-Z0-9_-]+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('File JSON CV berhasil diekspor.');
  };

  const handleDeleteWithUndo = (target: CVData) => {
    const backupJson = JSON.stringify(target);
    deleteCV(target.id);
    setDeleteTarget(null);

    toast('Dokumen CV telah dihapus', {
      description: `"${target.title}" dihapus dari ruang kerja.`,
      action: {
        label: 'Urungkan',
        onClick: () => {
          importCVFromJson(backupJson);
          toast.success('Dokumen CV berhasil dipulihkan!');
        },
      },
    });
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = importCVFromJson(text);
      toast.success(`Berhasil mengimpor "${imported.title}"!`);
      navigate(`/cv/${imported.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? `Format JSON tidak valid: ${err.message}`
          : 'Gagal membaca file JSON'
      );
    } finally {
      e.target.value = '';
    }
  };

  const { greeting, sub } = getGreetingByHour(prefs.uiLanguage);
  const currentTip = CAREER_TIPS_CAROUSEL[tipIndex]!;

  return (
    <AppShell onOpenCreateModalProp={() => setCreateModalOpen(true)}>
      <div className="space-y-8">
        {/* Bento Hero Greeting Banner */}
        <div className="relative overflow-hidden rounded-[24px] bg-hero-gradient border border-[var(--border-strong)] p-6 sm:p-8 shadow-[var(--shadow-2)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl z-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#2A2150] dark:text-[#DFD7FC]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#9B86EC]" strokeWidth={2.5} />
              <span>Harvard Business School (OCS) Workspace</span>
            </div>
            <h1 className="text-h1 text-[var(--foreground)]">
              {greeting}{' '}
              <span className="text-[#2A2150] dark:text-[#B8A9F5]">{sub}</span>
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              {t('dashboard.subtitle')}
            </p>
          </div>

          {/* Right Action Cluster + Decorative Floating Pastel Circles */}
          <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
            <div className="hidden xl:flex items-center -space-x-2 mr-2" aria-hidden="true">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-11 h-11 rounded-full bg-[#B8A9F5]/40 border border-white/60 flex items-center justify-center shadow-xs"
              >
                <FileText className="w-5 h-5 text-[#2A2150]" strokeWidth={2.5} />
              </motion.div>
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                className="w-11 h-11 rounded-full bg-[#BFEBD7]/65 border border-white/60 flex items-center justify-center shadow-xs"
              >
                <Award className="w-5 h-5 text-[#133A29]" strokeWidth={2.5} />
              </motion.div>
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                className="w-11 h-11 rounded-full bg-[#FFD3B6]/65 border border-white/60 flex items-center justify-center shadow-xs"
              >
                <Briefcase className="w-5 h-5 text-[#4A2511]" strokeWidth={2.5} />
              </motion.div>
            </div>

            {/* ONE Primary CTA Button + Split Dropdown for Secondary Creation Actions */}
            <div className="inline-flex items-center rounded-[16px] shadow-[var(--shadow-2)]">
              <Button
                variant="gradient"
                size="lg"
                onClick={() => setCreateModalOpen(true)}
                className="rounded-r-none border-r-0"
              >
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
                <span>Buat CV Baru</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Opsi pembuatan CV lainnya"
                    className="h-12 px-3 rounded-r-[16px] btn-lavender-gradient border border-l border-[#9E8CE8]/50 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                  >
                    <MoreHorizontal className="w-4 h-4 text-[#211942]" strokeWidth={2.5} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuItem
                    onSelect={() => {
                      const created = createCV('blank');
                      toast.success('CV kosong baru berhasil dibuat.');
                      navigate(`/cv/${created.id}`);
                    }}
                  >
                    <FilePlus2 className="w-4 h-4 text-[#9B86EC]" strokeWidth={2.5} />
                    <span>{t('dashboard.createBlank')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      const created = createCV('sample-id');
                      toast.success('Contoh CV Harvard (ID) dimuat.');
                      navigate(`/cv/${created.id}`);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                    <span>{t('dashboard.createSampleId')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      const created = createCV('sample-en');
                      toast.success('Harvard MBA/PM Sample (EN) dimuat.');
                      navigate(`/cv/${created.id}`);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-sky-600" strokeWidth={2.5} />
                    <span>{t('dashboard.createSampleEn')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4" strokeWidth={2.5} />
                    <span>{t('dashboard.importJson')} (.json)</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </div>

        {/* 4 Bento Stat Cards with Count-Up, Sparklines & Radial Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total CV */}
          <div className="p-5 surface-card surface-card-hover flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                {t('dashboard.statTotal')}
              </span>
              <div className="w-9 h-9 rounded-full bg-[#B8A9F5]/30 text-[#2A2150] dark:text-[#DFD7FC] flex items-center justify-center">
                <FileText className="w-4 h-4" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-3xl font-bold font-heading text-[var(--foreground)]">
                  <CountUpNumber value={cvs.length} />
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                  <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
                  <span>Siap Ekspor LaTeX</span>
                </span>
              </div>
              <MiniSparkline
                points={[1, 2, 2, 3, Math.max(cvs.length, 2), cvs.length + 1]}
                stroke="#9B86EC"
                fill="#B8A9F5"
              />
            </div>
          </div>

          {/* Card 2: Average Completeness Score with Animated Radial Ring */}
          <div className="p-5 surface-card surface-card-hover flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                {t('dashboard.statAvgScore')}
              </span>
              <RadialProgressRing progress={avgScore} size={42} strokeWidth={4.5} color="#34D399">
                <span className="text-[10px] font-bold font-heading">{avgScore}%</span>
              </RadialProgressRing>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-3xl font-bold font-heading text-[var(--foreground)]">
                  <CountUpNumber value={avgScore} suffix="%" />
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                  <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
                  <span>Standar Harvard OCS</span>
                </span>
              </div>
              <MiniSparkline
                points={[65, 72, 80, 88, 92, avgScore]}
                stroke="#10B981"
                fill="#BFEBD7"
              />
            </div>
          </div>

          {/* Card 3: Total PDF Exports */}
          <div className="p-5 surface-card surface-card-hover flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                {t('dashboard.statExports')}
              </span>
              <div className="w-9 h-9 rounded-full bg-[#FFD3B6]/55 text-[#4A2511] dark:text-[#FFDCC4] flex items-center justify-center">
                <Download className="w-4 h-4" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-3xl font-bold font-heading text-[var(--foreground)]">
                  <CountUpNumber value={totalExports} />
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5B5475] dark:text-[#A69FC2] mt-1">
                  <TrendingUp className="w-3 h-3 text-amber-600" strokeWidth={2.5} />
                  <span>PDF Vektor Asli</span>
                </span>
              </div>
              <MiniSparkline
                points={[1, 3, 2, 5, 6, Math.max(totalExports, 4)]}
                stroke="#F59E0B"
                fill="#FFD3B6"
              />
            </div>
          </div>

          {/* Card 4: Last Edited Relative Time */}
          <div className="p-5 surface-card surface-card-hover flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                {t('dashboard.statLastEdited')}
              </span>
              <div className="w-9 h-9 rounded-full bg-[#BDE0FE]/60 text-[#102E4A] dark:text-[#CBE6FF] flex items-center justify-center">
                <Clock className="w-4 h-4" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-xl font-bold font-heading text-[var(--foreground)] truncate max-w-[150px]">
                  {cvs[0] ? formatRelativeTime(cvs[0].updatedAt, prefs.uiLanguage) : '-'}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-400 mt-1">
                  <span>Autosave Aktif ✓</span>
                </span>
              </div>
              <MiniSparkline
                points={[3, 4, 3, 6, 5, 8]}
                stroke="#38BDF8"
                fill="#BDE0FE"
              />
            </div>
          </div>
        </div>

        {/* Sleek Unified Toolbar (Search with '/' shortcut + Clear + Filter + Sort + Grid/List Toggle) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-1 border-b border-[var(--border)]">
          <div className="relative flex-1 max-w-md">
            <Search
              className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={2.5}
            />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('dashboard.searchPlaceholder')}
              className="pl-10 pr-16 h-10 bg-[var(--surface)]"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Bersihkan pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            ) : (
              <Kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                /
              </Kbd>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Language Filter */}
            <div className="flex items-center p-1 rounded-[12px] bg-[var(--muted)] border border-[var(--border)]">
              {(['all', 'id', 'en'] as const).map((lng) => (
                <button
                  key={lng}
                  type="button"
                  onClick={() => setLangFilter(lng)}
                  className={cn(
                    'px-3 py-1 rounded-[8px] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                    langFilter === lng
                      ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-2xs'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  )}
                >
                  {lng === 'all' ? 'Semua' : lng.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'updated' | 'score' | 'title')}
              aria-label="Urutkan daftar CV"
              className="h-9 rounded-[12px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--foreground)] cursor-pointer"
            >
              <option value="updated">{t('dashboard.sortUpdated')}</option>
              <option value="score">{t('dashboard.sortScore')}</option>
              <option value="title">{t('dashboard.sortTitle')}</option>
            </select>

            {/* Grid / List View Toggle */}
            <div className="flex items-center p-1 rounded-[12px] bg-[var(--muted)] border border-[var(--border)]">
              <Tooltip content="Tampilan Grid">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Tampilan Grid"
                  className={cn(
                    'p-1.5 rounded-[8px] transition-colors cursor-pointer',
                    viewMode === 'grid'
                      ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-2xs'
                      : 'text-[var(--muted-foreground)]'
                  )}
                >
                  <LayoutGrid className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </Tooltip>
              <Tooltip content="Tampilan Tabel">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-label="Tampilan Tabel"
                  className={cn(
                    'p-1.5 rounded-[8px] transition-colors cursor-pointer',
                    viewMode === 'list'
                      ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-2xs'
                      : 'text-[var(--muted-foreground)]'
                  )}
                >
                  <List className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* CV Documents Grid or Table View */}
        {filteredList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 surface-card text-center space-y-5"
          >
            <div className="relative w-20 h-16 mx-auto flex items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-[#B8A9F5]/30 text-[#2A2150] dark:text-[#B8A9F5] flex items-center justify-center shadow-xs">
                <FolderOpen className="w-7 h-7" strokeWidth={2.5} />
              </div>
              <div className="absolute -right-1 -top-1 w-7 h-7 rounded-xl bg-[#BFEBD7] text-[#133A29] flex items-center justify-center shadow-xs">
                <Plus className="w-4 h-4" strokeWidth={2.5} />
              </div>
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h2 className="text-lg font-bold font-heading">{t('dashboard.emptyTitle')}</h2>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {searchQuery
                  ? `Tidak ada CV yang cocok dengan kata kunci "${searchQuery}".`
                  : t('dashboard.emptyDesc')}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {searchQuery ? (
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Reset Pencarian
                </Button>
              ) : (
                <Button variant="gradient" onClick={() => setCreateModalOpen(true)}>
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  <span>Buat CV Harvard Pertama</span>
                </Button>
              )}
            </div>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredList.map(({ cv, report }, index) => {
                const isComplete = report.score >= 85;
                return (
                  <motion.div
                    key={cv.id}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{
                      duration: 0.22,
                      delay: index * 0.04,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="group surface-card surface-card-hover overflow-hidden flex flex-col justify-between"
                  >
                    <div className="p-5 pb-4">
                      {/* A4-Proportioned Miniature Sheet with Zoom & Gradient Hover Overlay */}
                      <div
                        onClick={() => handleOpenCV(cv.id)}
                        className="relative mb-4 rounded-[14px] bg-[#F3F0FC] dark:bg-[#0E0C16] border border-[var(--border)] p-4 overflow-hidden cursor-pointer"
                      >
                        <div className="bg-white text-[#111111] p-4 rounded-[10px] border border-neutral-200/90 shadow-sm font-serif text-[9.5px] leading-snug space-y-2 h-48 overflow-hidden transition-transform duration-300 ease-out group-hover:scale-[1.03]">
                          <div className="text-center border-b border-black/80 pb-1.5">
                            <p className="font-bold uppercase tracking-wider text-[11px] truncate">
                              {cv.personalInfo.fullName || 'NAMA LENGKAP'}
                            </p>
                            <p className="text-[8px] text-neutral-600 truncate mt-0.5">
                              {[cv.personalInfo.location, cv.personalInfo.email, cv.personalInfo.phone]
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          </div>

                          {cv.education[0] && (
                            <div>
                              <p className="font-bold uppercase text-[8px] tracking-wider border-b border-black/75 pb-0.5 mb-1">
                                {cv.settings.cvLanguage === 'id' ? 'Pendidikan' : 'Education'}
                              </p>
                              <div className="flex justify-between font-bold text-[8.5px]">
                                <span className="truncate">{cv.education[0].institution}</span>
                                <span className="italic font-normal shrink-0">
                                  {cv.education[0].location}
                                </span>
                              </div>
                              <p className="italic text-[8px] text-neutral-700 truncate">
                                {cv.education[0].degree}
                              </p>
                            </div>
                          )}

                          {cv.experience[0] && (
                            <div>
                              <p className="font-bold uppercase text-[8px] tracking-wider border-b border-black/75 pb-0.5 mb-1">
                                {cv.settings.cvLanguage === 'id' ? 'Pengalaman Kerja' : 'Experience'}
                              </p>
                              <div className="flex justify-between font-bold text-[8.5px]">
                                <span className="truncate">{cv.experience[0].company}</span>
                                <span className="italic font-normal shrink-0">
                                  {cv.experience[0].location}
                                </span>
                              </div>
                              <p className="italic text-[8px] text-neutral-700 truncate">
                                {cv.experience[0].position}
                              </p>
                              {cv.experience[0].bullets[0] && (
                                <p className="text-[7.5px] text-neutral-600 line-clamp-2 mt-0.5 pl-2 border-l border-neutral-300">
                                  • {cv.experience[0].bullets[0].replace(/\*\*/g, '')}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Hover Action Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1F1B2E]/85 via-[#1F1B2E]/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-4">
                          <Button
                            variant="gradient"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenCV(cv.id);
                            }}
                          >
                            <Edit3 className="w-3.5 h-3.5" strokeWidth={2.5} />
                            <span>Buka Editor</span>
                          </Button>
                          <Button
                            variant="mint"
                            size="sm"
                            disabled={downloadingId === cv.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDirectDownloadPdf(cv);
                            }}
                          >
                            {downloadingId === cv.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} />
                            ) : (
                              <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
                            )}
                            <span>Unduh PDF</span>
                          </Button>
                        </div>
                      </div>

                      {/* Card Header: Title + 3-Dots DropdownMenu */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h2
                            onClick={() => handleOpenCV(cv.id)}
                            className="text-base font-bold font-heading text-[var(--foreground)] hover:text-[#9B86EC] cursor-pointer truncate transition-colors"
                          >
                            {cv.title}
                          </h2>
                          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mt-0.5 font-heading tabular-nums">
                            <span>{formatRelativeTime(cv.updatedAt, prefs.uiLanguage)}</span>
                            <span aria-hidden="true">·</span>
                            <span>{cv.settings.paperSize.toUpperCase()}</span>
                            <span aria-hidden="true">·</span>
                            <span>{cv.settings.cvLanguage.toUpperCase()}</span>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              aria-label="Menu aksi CV"
                              className="p-1.5 rounded-[10px] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer shrink-0"
                            >
                              <MoreHorizontal className="w-4 h-4" strokeWidth={2.5} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleOpenCV(cv.id)}>
                              <Edit3 className="w-3.5 h-3.5 text-[#9B86EC]" strokeWidth={2.5} />
                              <span>{t('dashboard.openEditor')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleDirectDownloadPdf(cv)}>
                              <Download className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
                              <span>{t('dashboard.downloadPdf')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => {
                                duplicateCV(cv.id);
                                toast.success('CV berhasil diduplikasi.');
                              }}
                            >
                              <Copy className="w-3.5 h-3.5" strokeWidth={2.5} />
                              <span>{t('dashboard.duplicate')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => setRenameTarget({ id: cv.id, title: cv.title })}
                            >
                              <Edit3 className="w-3.5 h-3.5" strokeWidth={2.5} />
                              <span>{t('dashboard.rename')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleExportJson(cv)}>
                              <FileJson className="w-3.5 h-3.5" strokeWidth={2.5} />
                              <span>{t('dashboard.exportJson')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              destructive
                              onSelect={() => setDeleteTarget(cv)}
                            >
                              <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                              <span>{t('dashboard.delete')}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Status Badges & Score Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
                        <div className="flex items-center gap-1.5">
                          <Badge variant={isComplete ? 'mint' : 'butter'}>
                            {isComplete ? 'Lengkap ✓' : 'Perlu dilengkapi'}
                          </Badge>
                          <Badge variant="lavender">1 halaman ✓</Badge>
                        </div>
                        <span className="text-xs font-bold font-heading tabular-nums text-[var(--foreground)]">
                          {report.score}%
                        </span>
                      </div>
                    </div>

                    {/* Thin Colored Bottom Progress Bar */}
                    <div className="w-full h-1.5 bg-[var(--muted)] overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all duration-500',
                          isComplete
                            ? 'bg-gradient-to-r from-[#9B86EC] to-[#34D399]'
                            : 'bg-gradient-to-r from-[#FFD3B6] to-[#B8A9F5]'
                        )}
                        style={{ width: `${report.score}%` }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Table / List View */
          <div className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                    <th className="py-3.5 px-5">Judul Dokumen CV</th>
                    <th className="py-3.5 px-4">Kandidat</th>
                    <th className="py-3.5 px-4">Format</th>
                    <th className="py-3.5 px-4">Kelengkapan</th>
                    <th className="py-3.5 px-4">Diubah</th>
                    <th className="py-3.5 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-xs">
                  {filteredList.map(({ cv, report }) => (
                    <tr
                      key={cv.id}
                      onClick={() => handleOpenCV(cv.id)}
                      className="hover:bg-[var(--muted)]/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-5 font-bold font-heading text-[var(--foreground)]">
                        {cv.title}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--muted-foreground)]">
                        {cv.personalInfo.fullName}
                      </td>
                      <td className="py-3.5 px-4 font-heading tabular-nums">
                        {cv.settings.paperSize.toUpperCase()} · {cv.settings.cvLanguage.toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={report.score >= 85 ? 'mint' : 'butter'}>
                          {report.score}%
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-[var(--muted-foreground)] font-heading tabular-nums">
                        {formatRelativeTime(cv.updatedAt, prefs.uiLanguage)}
                      </td>
                      <td
                        className="py-3.5 px-5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            variant="soft"
                            size="sm"
                            onClick={() => handleOpenCV(cv.id)}
                          >
                            Buka
                            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                          </Button>
                          <Button
                            variant="mint"
                            size="sm"
                            disabled={downloadingId === cv.id}
                            onClick={() => handleDirectDownloadPdf(cv)}
                          >
                            <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bento Bottom Row: Career Tips Auto-Carousel & Vertical Activity Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Career Tips Auto-Rotating Carousel */}
          <div
            onMouseEnter={() => setTipPaused(true)}
            onMouseLeave={() => setTipPaused(false)}
            className={cn(
              'lg:col-span-7 p-6 rounded-[20px] border transition-colors duration-300 flex flex-col justify-between gap-4 shadow-[var(--shadow-1)]',
              currentTip.tone
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[12px] bg-white/80 dark:bg-black/25 text-[var(--foreground)] flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                    {currentTip.badge}
                  </span>
                  <h3 className="text-sm font-bold font-heading">{t('dashboard.careerTipsTitle')}</h3>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTipPaused((p) => !p)}
                  aria-label={tipPaused ? 'Putar otomatis' : 'Jeda otomatis'}
                  className="p-1.5 rounded-lg bg-white/60 dark:bg-black/25 hover:bg-white/90 cursor-pointer"
                >
                  {tipPaused ? (
                    <Play className="w-3.5 h-3.5" strokeWidth={2.5} />
                  ) : (
                    <Pause className="w-3.5 h-3.5" strokeWidth={2.5} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTipIndex(
                      (i) => (i - 1 + CAREER_TIPS_CAROUSEL.length) % CAREER_TIPS_CAROUSEL.length
                    )
                  }
                  aria-label="Tips sebelumnya"
                  className="p-1.5 rounded-lg bg-white/60 dark:bg-black/25 hover:bg-white/90 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => setTipIndex((i) => (i + 1) % CAREER_TIPS_CAROUSEL.length)}
                  aria-label="Tips berikutnya"
                  className="p-1.5 rounded-lg bg-white/60 dark:bg-black/25 hover:bg-white/90 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={tipIndex}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-1.5"
              >
                <p className="text-base font-bold font-heading">{currentTip.title}</p>
                <p className="text-xs leading-relaxed opacity-90">{currentTip.body}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-1.5 pt-1">
              {CAREER_TIPS_CAROUSEL.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTipIndex(idx)}
                  aria-label={`Pilih tips ${idx + 1}`}
                  className={cn(
                    'h-1.5 rounded-full transition-all cursor-pointer',
                    tipIndex === idx ? 'w-6 bg-[var(--foreground)]' : 'w-2 bg-[var(--foreground)]/30'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Vertical Activity Timeline */}
          <div className="lg:col-span-5 p-6 surface-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-heading">Aktivitas Terakhir</h3>
              <Badge variant="neutral">{activities.length} Kejadian</Badge>
            </div>

            {activities.length === 0 ? (
              <p className="text-xs text-[var(--muted-foreground)] py-4">
                Belum ada riwayat aktivitas baru pada sesi ini.
              </p>
            ) : (
              <div className="relative pl-5 space-y-3.5 before:content-[''] before:absolute before:left-[7px] before:top-1.5 before:bottom-1.5 before:w-[2px] before:bg-[var(--border-strong)]">
                {activities.slice(0, 4).map((act) => (
                  <div key={act.id} className="relative flex items-start justify-between gap-2 text-xs">
                    <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-[#B8A9F5] ring-4 ring-[var(--surface)]" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--foreground)] truncate">
                        {act.cvTitle}
                      </p>
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        {act.action === 'exported_pdf'
                          ? 'Mengekspor PDF LaTeX'
                          : act.action === 'created'
                            ? 'Membuat dokumen CV baru'
                            : act.action === 'duplicated'
                              ? 'Menduplikasi dokumen CV'
                              : 'Mengimpor file JSON'}
                      </p>
                    </div>
                    <span className="text-[11px] text-[var(--muted-foreground)] font-heading tabular-nums shrink-0">
                      {formatRelativeTime(act.timestamp, prefs.uiLanguage)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create CV Modal */}
      <CreateCVModal open={createModalOpen} onOpenChange={setCreateModalOpen} />

      {/* Rename Modal */}
      <ModalDialog
        open={Boolean(renameTarget)}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        title="Ganti Judul Dokumen CV"
        description="Masukkan nama baru untuk memudahkan identifikasi versi lamaran kerja Anda."
      >
        {renameTarget && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              renameCV(renameTarget.id, renameTarget.title);
              setRenameTarget(null);
              toast.success('Judul CV berhasil diperbarui.');
            }}
            className="space-y-4"
          >
            <Input
              value={renameTarget.title}
              onChange={(e) => setRenameTarget({ ...renameTarget, title: e.target.value })}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRenameTarget(null)}>
                Batal
              </Button>
              <Button variant="primary" type="submit">
                Simpan Nama
              </Button>
            </div>
          </form>
        )}
      </ModalDialog>

      {/* Delete Confirmation Modal with Undo Toast */}
      <ModalDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Dokumen CV?"
        description={`Apakah Anda yakin ingin menghapus "${deleteTarget?.title}"? Anda masih dapat mengurungkannya sesaat setelah dihapus.`}
      >
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (deleteTarget) {
                handleDeleteWithUndo(deleteTarget);
              }
            }}
          >
            Ya, Hapus CV
          </Button>
        </div>
      </ModalDialog>
    </AppShell>
  );
};
