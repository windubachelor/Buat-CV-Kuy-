import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FilePlus2,
  Globe,
  GraduationCap,
  LayoutTemplate,
  Upload,
} from 'lucide-react';
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCVStore } from '../../store/useCVStore';
import { Badge, ModalDialog } from '../ui/primitives';

export const CreateCVModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { createCV, importCVFromJson } = useCVStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChoose = (mode: 'blank' | 'sample-id' | 'sample-en' | 'sample-academic') => {
    const created = createCV(mode);
    onOpenChange(false);
    toast.success(`Dokumen "${created.title}" siap diedit!`);
    navigate(`/cv/${created.id}`);
  };

  const handleBrowseTemplates = () => {
    onOpenChange(false);
    navigate('/templates');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = importCVFromJson(text);
      onOpenChange(false);
      toast.success(`Berhasil mengimpor "${imported.title}"!`);
      navigate(`/cv/${imported.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? `Format JSON tidak valid: ${err.message}` : 'Gagal membaca file JSON'
      );
    } finally {
      e.target.value = '';
    }
  };

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Buat Dokumen CV Harvard Baru"
      description="Mulai langsung dari kerangka bersih standar Harvard OCS atau telusuri galeri template LaTeX & Overleaf."
      maxWidth="max-w-2xl"
    >
      {/* Primary 2-Card Choice: Blank Harvard CV vs Browse Other Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        {/* Card 1: Blank Standard Harvard CV */}
        <button
          type="button"
          onClick={() => handleChoose('blank')}
          className="group text-left p-5 rounded-[18px] surface-card surface-card-hover flex flex-col justify-between gap-5 cursor-pointer border-2 border-transparent hover:border-[#9B86EC]/60 transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="w-11 h-11 rounded-[14px] bg-[#B8A9F5]/35 text-[#2A2150] dark:text-[#DFD7FC] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FilePlus2 className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <Badge variant="lavender">Kerangka Bersih</Badge>
          </div>
          <div>
            <h3 className="text-base font-bold font-heading text-[var(--foreground)] flex items-center justify-between gap-2">
              <span>CV Kosong Standar Harvard</span>
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#9B86EC]" />
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1.5 leading-relaxed">
              Mulai dari kerangka bersih 1 halaman dengan struktur bagian resmi Harvard OCS yang siap Anda isi dari nol.
            </p>
          </div>
        </button>

        {/* Card 2: Browse Other Templates (Redirects to /templates) */}
        <button
          type="button"
          onClick={handleBrowseTemplates}
          className="group text-left p-5 rounded-[18px] surface-card surface-card-hover flex flex-col justify-between gap-5 cursor-pointer border-2 border-[#B8A9F5]/45 hover:border-[#9B86EC] bg-[#FAF8FF] dark:bg-[#1E1A2E] transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="w-11 h-11 rounded-[14px] bg-[#BFEBD7]/70 text-[#133A29] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <LayoutTemplate className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <Badge variant="mint">8 Template LaTeX</Badge>
          </div>
          <div>
            <h3 className="text-base font-bold font-heading text-[var(--foreground)] flex items-center justify-between gap-2">
              <span>Telusuri Template yang Lain</span>
              <ArrowRight className="w-4 h-4 text-[#133A29] dark:text-[#BFEBD7] group-hover:translate-x-0.5 transition-transform" />
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1.5 leading-relaxed">
              Buka galeri 3 template Harvard OCS + 5 template LaTeX Overleaf (Jake&apos;s Resume SWE, Cover Letter #1 Bahasa Indonesia, Simple Letter, Wharton &amp; McKinsey).
            </p>
          </div>
        </button>
      </div>

      {/* Quick Start Sample Data Row */}
      <div className="mt-4 pt-3.5 border-t border-[var(--border)]">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2.5">
          Atau mulai cepat dengan contoh data terisi penuh:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => handleChoose('sample-id')}
            className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[#BFEBD7]/20 text-left transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#BFEBD7]/60 text-[#133A29] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-[var(--foreground)]">Contoh SWE (ID)</p>
              <p className="text-[10px] text-[var(--muted-foreground)] truncate">Harvard Classic · 100%</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleChoose('sample-en')}
            className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[#BDE0FE]/20 text-left transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#BDE0FE]/65 text-[#102E4A] flex items-center justify-center shrink-0">
              <Globe className="w-3.5 h-3.5" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-[var(--foreground)]">Contoh MBA (EN)</p>
              <p className="text-[10px] text-[var(--muted-foreground)] truncate">Compact 1-Page · HBS</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleChoose('sample-academic')}
            className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[#FFD3B6]/20 text-left transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#FFD3B6]/65 text-[#4A2511] flex items-center justify-center shrink-0">
              <GraduationCap className="w-3.5 h-3.5" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-[var(--foreground)]">Akademik & Riset</p>
              <p className="text-[10px] text-[var(--muted-foreground)] truncate">LPDP/PhD · Garamond</p>
            </div>
          </button>
        </div>
      </div>

      {/* Import from JSON Footer */}
      <div className="mt-4 pt-3.5 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <BookOpen className="w-4 h-4 text-[#9B86EC]" strokeWidth={2.5} />
          <span>Punya cadangan file JSON dari Buat CV Kuy sebelumnya?</span>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[12px] text-xs font-semibold bg-[var(--muted)] hover:bg-[#B8A9F5]/25 text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Impor File JSON</span>
          </button>
        </div>
      </div>
    </ModalDialog>
  );
};
