import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Command } from 'cmdk';
import {
  BookOpen,
  CheckCircle2,
  Download,
  FilePlus2,
  FileText,
  Globe,
  Home,
  LayoutDashboard,
  Moon,
  Search,
  Settings,
  Sun,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCVStore } from '../../store/useCVStore';
import { Kbd } from '../ui/primitives';

export const CommandPalette: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenCreateModal?: () => void;
}> = ({ open, onOpenChange, onOpenCreateModal }) => {
  const navigate = useNavigate();
  const { cvs, prefs, updatePrefs, createCV, setActiveCv, getActiveCv, incrementExportCount } =
    useCVStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  const runCommand = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  const handleExportActivePdf = async () => {
    const active = getActiveCv();
    if (!active) return;
    const toastId = toast.loading('Mengompilasi PDF Harvard dengan Tectonic...');
    try {
      const res = await fetch('/api/compile?format=binary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv: active }),
      });
      if (!res.ok) throw new Error('Gagal mengompilasi PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(active.personalInfo.fullName || active.title).replace(/[^a-zA-Z0-9_-]+/g, '_')}_Harvard_CV.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      incrementExportCount(active.id);
      toast.success('PDF Harvard berhasil diunduh!', { id: toastId });
    } catch {
      toast.error('Gagal mengunduh PDF.', { id: toastId });
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150" />
        <DialogPrimitive.Content
          aria-label="Command Palette"
          className="fixed left-1/2 top-[16%] z-50 w-[94vw] max-w-xl -translate-x-1/2 rounded-[20px] bg-[var(--elevated)] border border-[var(--border-strong)] shadow-[var(--shadow-5)] overflow-hidden focus:outline-none animate-in fade-in-0 zoom-in-95 duration-150"
        >
          <DialogPrimitive.Title className="sr-only">
            Command Palette
          </DialogPrimitive.Title>
          <Command className="w-full bg-transparent text-[var(--foreground)]">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)]">
              <Search className="w-4 h-4 text-[#9B86EC] shrink-0" strokeWidth={2.5} />
              <Command.Input
                placeholder="Cari dokumen CV atau jalankan perintah cepat..."
                className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
                autoFocus
              />
              <Kbd>ESC</Kbd>
            </div>

            <Command.List className="max-h-[360px] overflow-y-auto p-2 space-y-2">
              <Command.Empty className="py-8 text-center text-xs text-[var(--muted-foreground)]">
                Tidak ditemukan perintah atau CV yang cocok.
              </Command.Empty>

              <Command.Group
                heading="Aksi Cepat CV"
                className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]"
              >
                <Command.Item
                  onSelect={() =>
                    runCommand(() => {
                      if (onOpenCreateModal) {
                        onOpenCreateModal();
                      } else {
                        const created = createCV('blank');
                        navigate(`/cv/${created.id}`);
                      }
                    })
                  }
                  className="flex items-center justify-between px-3 py-2.5 rounded-[12px] text-xs font-medium text-[var(--foreground)] cursor-pointer data-[selected=true]:bg-[#B8A9F5]/20 data-[selected=true]:text-[#2A2150] dark:data-[selected=true]:text-white transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <FilePlus2 className="w-4 h-4 text-[#9B86EC]" strokeWidth={2.5} />
                    <span>Buat CV Harvard Baru...</span>
                  </div>
                  <Kbd>N</Kbd>
                </Command.Item>

                <Command.Item
                  onSelect={() =>
                    runCommand(() => {
                      const created = createCV('sample-id');
                      toast.success('Contoh CV Harvard Bahasa Indonesia dibuat.');
                      navigate(`/cv/${created.id}`);
                    })
                  }
                  className="flex items-center justify-between px-3 py-2.5 rounded-[12px] text-xs font-medium text-[var(--foreground)] cursor-pointer data-[selected=true]:bg-[#B8A9F5]/20 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                    <span>Buat dari Contoh Data Harvard (Bahasa Indonesia)</span>
                  </div>
                </Command.Item>

                <Command.Item
                  onSelect={() =>
                    runCommand(() => {
                      const created = createCV('sample-en');
                      toast.success('Harvard MBA/PM Sample (English) dibuat.');
                      navigate(`/cv/${created.id}`);
                    })
                  }
                  className="flex items-center justify-between px-3 py-2.5 rounded-[12px] text-xs font-medium text-[var(--foreground)] cursor-pointer data-[selected=true]:bg-[#B8A9F5]/20 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-600" strokeWidth={2.5} />
                    <span>Buat dari Contoh Data Harvard MBA/PM (English)</span>
                  </div>
                </Command.Item>

                <Command.Item
                  onSelect={() => runCommand(handleExportActivePdf)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-[12px] text-xs font-medium text-[var(--foreground)] cursor-pointer data-[selected=true]:bg-[#B8A9F5]/20 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-4 h-4 text-[#9B86EC]" strokeWidth={2.5} />
                    <span>Unduh PDF LaTeX dari CV Terakhir</span>
                  </div>
                  <Kbd>⌘P</Kbd>
                </Command.Item>
              </Command.Group>

              {cvs.length > 0 && (
                <Command.Group
                  heading="Buka Dokumen CV"
                  className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]"
                >
                  {cvs.slice(0, 6).map((cv) => (
                    <Command.Item
                      key={cv.id}
                      value={`cv ${cv.title} ${cv.personalInfo.fullName}`}
                      onSelect={() =>
                        runCommand(() => {
                          setActiveCv(cv.id);
                          navigate(`/cv/${cv.id}`);
                        })
                      }
                      className="flex items-center justify-between px-3 py-2.5 rounded-[12px] text-xs font-medium text-[var(--foreground)] cursor-pointer data-[selected=true]:bg-[#B8A9F5]/20 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" strokeWidth={2.5} />
                        <span className="truncate">{cv.title}</span>
                      </div>
                      <span className="text-[11px] text-[var(--muted-foreground)] font-heading tabular-nums">
                        {cv.settings.cvLanguage.toUpperCase()}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              <Command.Group
                heading="Navigasi & Preferensi"
                className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]"
              >
                <Command.Item
                  onSelect={() => runCommand(() => navigate('/dashboard'))}
                  className="flex items-center justify-between px-3 py-2.5 rounded-[12px] text-xs font-medium text-[var(--foreground)] cursor-pointer data-[selected=true]:bg-[#B8A9F5]/20 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4" strokeWidth={2.5} />
                    <span>Buka Dashboard Ruang Kerja</span>
                  </div>
                  <Kbd>G D</Kbd>
                </Command.Item>

                <Command.Item
                  onSelect={() => runCommand(() => navigate('/templates'))}
                  className="flex items-center justify-between px-3 py-2.5 rounded-[12px] text-xs font-medium text-[var(--foreground)] cursor-pointer data-[selected=true]:bg-[#B8A9F5]/20 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4" strokeWidth={2.5} />
                    <span>Galeri Template & Contoh Harvard</span>
                  </div>
                  <Kbd>G T</Kbd>
                </Command.Item>

                <Command.Item
                  onSelect={() => runCommand(() => navigate('/settings'))}
                  className="flex items-center justify-between px-3 py-2.5 rounded-[12px] text-xs font-medium text-[var(--foreground)] cursor-pointer data-[selected=true]:bg-[#B8A9F5]/20 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4" strokeWidth={2.5} />
                    <span>Pengaturan Aplikasi & Engine LaTeX</span>
                  </div>
                  <Kbd>G S</Kbd>
                </Command.Item>

                <Command.Item
                  onSelect={() => runCommand(() => navigate('/'))}
                  className="flex items-center justify-between px-3 py-2.5 rounded-[12px] text-xs font-medium text-[var(--foreground)] cursor-pointer data-[selected=true]:bg-[#B8A9F5]/20 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Home className="w-4 h-4" strokeWidth={2.5} />
                    <span>Halaman Depan (Landing Page)</span>
                  </div>
                </Command.Item>

                <Command.Item
                  onSelect={() =>
                    runCommand(() => {
                      const next = prefs.theme === 'dark' ? 'light' : 'dark';
                      updatePrefs({ theme: next });
                      toast.success(`Tema diubah ke mode ${next === 'dark' ? 'Gelap' : 'Terang'}.`);
                    })
                  }
                  className="flex items-center justify-between px-3 py-2.5 rounded-[12px] text-xs font-medium text-[var(--foreground)] cursor-pointer data-[selected=true]:bg-[#B8A9F5]/20 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {prefs.theme === 'dark' ? (
                      <Sun className="w-4 h-4 text-[#FFF1B8]" strokeWidth={2.5} />
                    ) : (
                      <Moon className="w-4 h-4 text-[#9B86EC]" strokeWidth={2.5} />
                    )}
                    <span>
                      Ganti Tema ke {prefs.theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                    </span>
                  </div>
                  <Kbd>⌘J</Kbd>
                </Command.Item>

                <Command.Item
                  onSelect={() =>
                    runCommand(() => {
                      const next = prefs.uiLanguage === 'id' ? 'en' : 'id';
                      updatePrefs({ uiLanguage: next });
                      toast.success(
                        next === 'id'
                          ? 'Bahasa diubah ke Bahasa Indonesia.'
                          : 'Language switched to English.'
                      );
                    })
                  }
                  className="flex items-center justify-between px-3 py-2.5 rounded-[12px] text-xs font-medium text-[var(--foreground)] cursor-pointer data-[selected=true]:bg-[#B8A9F5]/20 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4" strokeWidth={2.5} />
                    <span>
                      Ganti Bahasa Antarmuka ({prefs.uiLanguage === 'id' ? 'Ke English' : 'Ke Indonesia'})
                    </span>
                  </div>
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
