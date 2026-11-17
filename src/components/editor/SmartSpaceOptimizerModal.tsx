import {
  AlertTriangle,
  CheckCircle2,
  Minimize2,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import type { CVData, HarvardLayoutSettings } from '../../shared/schema';
import { Badge, Button, ModalDialog, Switch, cn } from '../ui/primitives';

interface SmartSpaceOptimizerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cv: CVData;
  pageCount: number;
  updateCV: (updater: (draft: CVData) => CVData) => void;
}

interface OptimizationPreset {
  id: 'light' | 'balanced' | 'maximum';
  title: string;
  badge: string;
  estSaved: string;
  description: string;
  settings: Partial<HarvardLayoutSettings>;
}

const OPTIMIZATION_PRESETS: OptimizationPreset[] = [
  {
    id: 'light',
    title: 'Level 1 · Optimasi Ringan (Subtle Trim)',
    badge: 'Hemat ~12% Ruang',
    estSaved: '~6–8 baris',
    description:
      'Mempertahankan ukuran font standar 11pt atau 10.5pt dan spasi normal, namun mempersempit margin halaman ke 0.52 inci (Narrow).',
    settings: {
      margin: 'narrow',
      fontSize: '10.5pt',
      sectionSpacing: 'normal',
    },
  },
  {
    id: 'balanced',
    title: 'Level 2 · Optimasi Seimbang (Harvard Compact)',
    badge: 'Hemat ~20% Ruang · Rekomendasi',
    estSaved: '~12–15 baris',
    description:
      'Kombinasi paling ideal: ukuran font 10.5pt proporsional, margin 0.52 inci, dan jarak antar-bagian rapat (Compact) tanpa mengurangi keterbacaan.',
    settings: {
      templatePreset: 'compact',
      margin: 'narrow',
      fontSize: '10.5pt',
      sectionSpacing: 'compact',
    },
  },
  {
    id: 'maximum',
    title: 'Level 3 · Optimasi Maksimal (Strict 1-Page Fit)',
    badge: 'Hemat ~30% Ruang',
    estSaved: '~20+ baris',
    description:
      'Kepadatan maksimum standar investasi/konsultan: font 10pt, margin ekstra kompak 0.45 inci, dan jarak bullet rapat agar seluruh riwayat muat 1 halaman.',
    settings: {
      templatePreset: 'compact',
      margin: 'compact',
      fontSize: '10pt',
      sectionSpacing: 'compact',
    },
  },
];

export const SmartSpaceOptimizerModal: React.FC<SmartSpaceOptimizerModalProps> = ({
  open,
  onOpenChange,
  cv,
  pageCount,
  updateCV,
}) => {
  const [savedBackup, setSavedBackup] = useState<HarvardLayoutSettings | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'light' | 'balanced' | 'maximum'>('balanced');

  const totalBullets =
    cv.experience.reduce((acc, e) => acc + e.bullets.filter((b) => b.trim()).length, 0) +
    cv.leadership.reduce((acc, l) => acc + l.bullets.filter((b) => b.trim()).length, 0) +
    cv.projects.reduce((acc, p) => acc + p.bullets.filter((b) => b.trim()).length, 0);

  const summaryVisible =
    cv.sectionOrder.find((s) => s.key === 'summary')?.visible ?? true;

  const handleApplyPreset = (preset: OptimizationPreset) => {
    if (!savedBackup) {
      setSavedBackup({ ...cv.settings });
    }
    updateCV((d) => {
      d.settings = {
        ...d.settings,
        ...preset.settings,
      };
      return d;
    });
    toast.success(`${preset.title} diterapkan! Mengompilasi ulang PDF...`);
    onOpenChange(false);
  };

  const handleRestoreOriginal = () => {
    const targetRestore: HarvardLayoutSettings = savedBackup ?? {
      ...cv.settings,
      templatePreset: 'classic',
      margin: 'normal',
      fontSize: '11pt',
      sectionSpacing: 'normal',
    };
    updateCV((d) => {
      d.settings = { ...targetRestore };
      return d;
    });
    setSavedBackup(null);
    toast.info('Pengaturan tata letak dikembalikan ke setelan awal.');
    onOpenChange(false);
  };

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title="One-Page Overflow Guard & Smart Space Optimizer"
      description="Pilih tingkat optimasi tata letak LaTeX secara opsional agar CV Anda pas dalam 1 halaman penuh sesuai standar Harvard OCS."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Current Diagnostic Banner */}
        <div
          className={cn(
            'p-4 rounded-[16px] border flex flex-col sm:flex-row sm:items-center justify-between gap-3',
            pageCount > 1
              ? 'bg-[#FFF1B8]/60 dark:bg-[#3A341C]/80 border-[#EAD47A]'
              : 'bg-[#BFEBD7]/45 dark:bg-[#214033]/75 border-[#8CD4B5]'
          )}
        >
          <div className="flex items-start gap-3">
            {pageCount > 1 ? (
              <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5" strokeWidth={2.5} />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5" strokeWidth={2.5} />
            )}
            <div className="text-xs">
              <p className="font-bold font-heading text-sm text-[var(--foreground)]">
                {pageCount > 1
                  ? `Terdeteksi ${pageCount} Halaman PDF (Meluber ke Halaman ${pageCount})`
                  : 'Dokumen Saat Ini Sudah Pas 1 Halaman PDF ✓'}
              </p>
              <p className="text-[var(--muted-foreground)] mt-0.5">
                Saat ini: Font <strong>{cv.settings.fontSize}</strong> · Margin{' '}
                <strong>{cv.settings.margin}</strong> · Spasi{' '}
                <strong>{cv.settings.sectionSpacing}</strong> · Total{' '}
                <strong>{totalBullets} poin pencapaian</strong>.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRestoreOriginal}
            className="shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Reset ke Standar</span>
          </Button>
        </div>

        {/* 3 Optional Optimization Presets */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            Pilih Tingkat Optimasi Ruang (100% Opsional & Dapat Dibatalkan)
          </p>

          <div className="grid grid-cols-1 gap-3">
            {OPTIMIZATION_PRESETS.map((preset) => {
              const isSelected = selectedLevel === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedLevel(preset.id)}
                  className={cn(
                    'p-4 rounded-[16px] border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4',
                    isSelected
                      ? 'bg-[#B8A9F5]/20 dark:bg-[#B8A9F5]/15 border-[#9B86EC] shadow-2xs'
                      : 'bg-[var(--background)] border-[var(--border-strong)] hover:bg-[var(--muted)]/50'
                  )}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold font-heading text-[var(--foreground)]">
                        {preset.title}
                      </span>
                      <Badge variant={preset.id === 'balanced' ? 'mint' : 'lavender'}>
                        {preset.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      {preset.description}
                    </p>
                  </div>

                  <Button
                    variant={isSelected ? 'gradient' : 'outline'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyPreset(preset);
                    }}
                    className="shrink-0"
                  >
                    <Minimize2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                    <span>Terapkan</span>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fine-Grained Optional Space Toggles */}
        <div className="p-4 rounded-[16px] bg-[var(--muted)]/60 border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold font-heading">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#9B86EC]" strokeWidth={2.5} />
            <span>Opsi Penghematan Ruang Tambahan (Manual)</span>
          </div>

          <div className="flex items-center justify-between gap-4 text-xs pt-1">
            <div>
              <p className="font-semibold text-[var(--foreground)]">
                Tampilkan Bagian Ringkasan Profesional (Summary)
              </p>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Pedoman Harvard OCS menyarankan menyembunyikan Summary jika ruang 1 halaman terbatas (menghemat ~4–5 baris).
              </p>
            </div>
            <Switch
              checked={summaryVisible}
              onCheckedChange={(checked) => {
                updateCV((d) => {
                  const sec = d.sectionOrder.find((s) => s.key === 'summary');
                  if (sec) sec.visible = checked;
                  return d;
                });
                toast.success(
                  checked
                    ? 'Bagian Ringkasan ditampilkan kembali di PDF.'
                    : 'Bagian Ringkasan disembunyikan untuk menghemat ruang 1 halaman.'
                );
              }}
            />
          </div>
        </div>
      </div>
    </ModalDialog>
  );
};
