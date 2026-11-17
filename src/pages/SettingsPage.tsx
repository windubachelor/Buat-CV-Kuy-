import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Globe,
  Info,
  Moon,
  RotateCcw,
  Sun,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '../components/layout/AppShell';
import { Button, Label, ModalDialog } from '../components/ui/primitives';
import { useCVStore } from '../store/useCVStore';

interface HealthStatus {
  status: string;
  latexEngine: string;
  version: string;
}

export const SettingsPage: React.FC = () => {
  const { prefs, updatePrefs, resetAllLocalData } = useCVStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data: HealthStatus) => setHealth(data))
      .catch(() =>
        setHealth({ status: 'offline', latexEngine: 'none', version: 'Server unreachable' })
      );
  }, []);

  return (
    <AppShell>
      <div className="max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#1F1B2E] dark:text-[#F4F2FA]">
            Pengaturan Aplikasi & Preferensi Default
          </h1>
          <p className="text-sm text-[#5B5475] dark:text-[#A69FC2] mt-1">
            Atur bahasa antarmuka, tema warna pastel, standar default pembuatan CV baru, dan kelola data lokal Anda.
          </p>
        </div>

        {/* UI Language & Theme */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1B1828] border border-[#E8E4F8] dark:border-[#2E2944] space-y-5">
          <h2 className="text-base font-bold font-heading">Tampilan & Bahasa Antarmuka</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Bahasa Antarmuka (UI Language)</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant={prefs.uiLanguage === 'id' ? 'primary' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    updatePrefs({ uiLanguage: 'id' });
                    toast.success('Bahasa antarmuka diubah ke Bahasa Indonesia.');
                  }}
                >
                  <Globe className="w-4 h-4" strokeWidth={2.5} />
                  <span>Bahasa Indonesia</span>
                </Button>
                <Button
                  variant={prefs.uiLanguage === 'en' ? 'primary' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    updatePrefs({ uiLanguage: 'en' });
                    toast.success('UI Language switched to English.');
                  }}
                >
                  <Globe className="w-4 h-4" strokeWidth={2.5} />
                  <span>English</span>
                </Button>
              </div>
            </div>

            <div>
              <Label>Mode Tema Warna</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant={prefs.theme === 'light' ? 'primary' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => updatePrefs({ theme: 'light' })}
                >
                  <Sun className="w-4 h-4" strokeWidth={2.5} />
                  <span>Terang (Pastel Light)</span>
                </Button>
                <Button
                  variant={prefs.theme === 'dark' ? 'primary' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => updatePrefs({ theme: 'dark' })}
                >
                  <Moon className="w-4 h-4" strokeWidth={2.5} />
                  <span>Gelap (Dark Mode)</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Default New CV Preferences */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1B1828] border border-[#E8E4F8] dark:border-[#2E2944] space-y-5">
          <h2 className="text-base font-bold font-heading">
            Preferensi Default CV Harvard Baru
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Ukuran Kertas Default</Label>
              <select
                value={prefs.defaultPaperSize}
                onChange={(e) => {
                  updatePrefs({ defaultPaperSize: e.target.value as 'a4' | 'letter' });
                  toast.success('Preferensi kertas default disimpan.');
                }}
                className="w-full h-10 rounded-xl border border-[#E8E4F8] dark:border-[#2E2944] bg-white dark:bg-[#151221] px-3 text-xs font-semibold"
              >
                <option value="a4">A4 (210 × 297 mm)</option>
                <option value="letter">US Letter (8.5 × 11 in)</option>
              </select>
            </div>

            <div>
              <Label>Font LaTeX Default</Label>
              <select
                value={prefs.defaultFontFamily}
                onChange={(e) => {
                  updatePrefs({
                    defaultFontFamily: e.target.value as 'tgtermes' | 'libertinus' | 'ebgaramond',
                  });
                  toast.success('Preferensi font default disimpan.');
                }}
                className="w-full h-10 rounded-xl border border-[#E8E4F8] dark:border-[#2E2944] bg-white dark:bg-[#151221] px-3 text-xs font-semibold"
              >
                <option value="tgtermes">TeX Gyre Termes</option>
                <option value="libertinus">Libertinus Serif</option>
                <option value="ebgaramond">EB Garamond</option>
              </select>
            </div>

            <div>
              <Label>Ukuran Font Default</Label>
              <select
                value={prefs.defaultFontSize}
                onChange={(e) => {
                  updatePrefs({
                    defaultFontSize: e.target.value as '10pt' | '10.5pt' | '11pt' | '11.5pt',
                  });
                  toast.success('Ukuran font default disimpan.');
                }}
                className="w-full h-10 rounded-xl border border-[#E8E4F8] dark:border-[#2E2944] bg-white dark:bg-[#151221] px-3 text-xs font-semibold"
              >
                <option value="10pt">10 pt</option>
                <option value="10.5pt">10.5 pt</option>
                <option value="11pt">11 pt (Standar Harvard)</option>
                <option value="11.5pt">11.5 pt</option>
              </select>
            </div>
          </div>
        </div>

        {/* LaTeX Engine Diagnostic Box */}
        <div className="p-6 rounded-2xl bg-[#BFEBD7]/35 dark:bg-[#1E3B2F] border border-[#96D7BA] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-[#133A29] dark:text-[#BFEBD7]" strokeWidth={2.5} />
              <h2 className="text-base font-bold font-heading">
                Status Mesin Kompilasi LaTeX Server
              </h2>
            </div>
            {health?.status === 'ok' && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                Aktif & Siap Kompilasi
              </span>
            )}
          </div>
          <p className="text-xs text-[#133A29] dark:text-[#D3F5E6] font-mono">
            Engine: {health ? `${health.latexEngine} (${health.version})` : 'Memeriksa...'}
          </p>
        </div>

        {/* Danger Zone: Reset Local Storage */}
        <div className="p-6 rounded-2xl bg-[#FFC8DD]/30 dark:bg-[#4A2434]/50 border border-[#FFC8DD] dark:border-[#6B334B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold font-heading text-red-900 dark:text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" strokeWidth={2.5} />
              <span>Atur Ulang & Hapus Semua Data Lokal</span>
            </h2>
            <p className="text-xs text-[#5B5475] dark:text-[#A69FC2]">
              Menghapus semua CV yang tersimpan di peramban ini dan mengembalikan ke 2 contoh bawaan Harvard.
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
            <span>Reset Semua Data</span>
          </Button>
        </div>

        {/* About App */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1B1828] border border-[#E8E4F8] dark:border-[#2E2944] space-y-2 text-xs text-[#5B5475] dark:text-[#A69FC2]">
          <div className="flex items-center gap-2 font-bold text-sm text-[#1F1B2E] dark:text-white mb-1">
            <Info className="w-4 h-4 text-[#B8A9F5]" strokeWidth={2.5} />
            <span>Tentang Buat CV Kuy</span>
          </div>
          <p>
            <strong>Buat CV Kuy</strong> dirancang untuk membantu pencari kerja, mahasiswa, dan profesional di Indonesia maupun internasional menyusun CV berstandar <em>Harvard Business School Office of Career Services (OCS)</em>.
          </p>
          <p>
            Seluruh dokumen PDF dihasilkan murni oleh mesin kompilasi LaTeX di server (<code className="font-mono">Tectonic / pdflatex</code>) dengan pemetaan karakter Unicode penuh agar 100% terbaca oleh sistem Applicant Tracking System (ATS).
          </p>
        </div>
      </div>

      <ModalDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reset Seluruh Data Lokal?"
        description="Seluruh dokumen CV yang telah Anda buat di peramban ini akan dihapus dan dikembalikan ke data contoh awal. Pastikan Anda sudah mengekspor file JSON atau PDF penting Anda."
      >
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setConfirmReset(false)}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              resetAllLocalData();
              setConfirmReset(false);
              toast.success('Seluruh data lokal berhasil direset ke pengaturan awal.');
            }}
          >
            Ya, Hapus & Reset
          </Button>
        </div>
      </ModalDialog>
    </AppShell>
  );
};
