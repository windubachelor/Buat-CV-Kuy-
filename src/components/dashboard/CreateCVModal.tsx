import {
  BookOpen,
  CheckCircle2,
  FilePlus2,
  Globe,
  GraduationCap,
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
      description="Pilih titik awal pembuatan CV Anda. Seluruh pilihan menggunakan mesin kompilasi LaTeX Tectonic asli."
      maxWidth="max-w-2xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
        {/* Option 1: Blank Harvard CV */}
        <button
          type="button"
          onClick={() => handleChoose('blank')}
          className="group text-left p-4 rounded-[16px] surface-card surface-card-hover flex flex-col justify-between gap-4 cursor-pointer"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#B8A9F5]/30 text-[#2A2150] dark:text-[#DFD7FC] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FilePlus2 className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <Badge variant="lavender">Kerangka Bersih</Badge>
          </div>
          <div>
            <h3 className="text-sm font-bold font-heading text-[var(--foreground)]">
              CV Kosong Standar Harvard
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
              Mulai dari kerangka bersih 1 halaman dengan struktur bagian Harvard OCS yang siap Anda isi.
            </p>
          </div>
        </button>

        {/* Option 2: Sample Harvard Indonesian */}
        <button
          type="button"
          onClick={() => handleChoose('sample-id')}
          className="group text-left p-4 rounded-[16px] surface-card surface-card-hover flex flex-col justify-between gap-4 cursor-pointer"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#BFEBD7]/60 text-[#133A29] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <Badge variant="mint">Rekomendasi · ID</Badge>
          </div>
          <div>
            <h3 className="text-sm font-bold font-heading text-[var(--foreground)]">
              Contoh Lengkap Harvard (Indonesia)
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
              Terisi penuh dengan studi kasus Senior Software Engineer (GoTo & Traveloka) ber-skor 100%.
            </p>
          </div>
        </button>

        {/* Option 3: Sample Harvard English (Compact MBA/PM) */}
        <button
          type="button"
          onClick={() => handleChoose('sample-en')}
          className="group text-left p-4 rounded-[16px] surface-card surface-card-hover flex flex-col justify-between gap-4 cursor-pointer"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#BDE0FE]/65 text-[#102E4A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <Badge variant="sky">Compact 1-Page · EN</Badge>
          </div>
          <div>
            <h3 className="text-sm font-bold font-heading text-[var(--foreground)]">
              Harvard MBA & Product Manager (EN)
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
              Format padat 1 halaman berbahasa Inggris (HBS, Stripe, McKinsey) dengan font Libertinus.
            </p>
          </div>
        </button>

        {/* Option 4: Academic & Scholarship CV */}
        <button
          type="button"
          onClick={() => handleChoose('sample-academic')}
          className="group text-left p-4 rounded-[16px] surface-card surface-card-hover flex flex-col justify-between gap-4 cursor-pointer"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#FFD3B6]/65 text-[#4A2511] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <Badge variant="peach">Akademik & Beasiswa</Badge>
          </div>
          <div>
            <h3 className="text-sm font-bold font-heading text-[var(--foreground)]">
              CV Akademik, Riset & LPDP/PhD
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
              Tipografi klasik EB Garamond dengan seksi Publikasi Ilmiah, Tesis, dan Beasiswa aktif.
            </p>
          </div>
        </button>
      </div>

      {/* Import from JSON Footer */}
      <div className="mt-4 pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
