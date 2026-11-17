import { ArrowRight, BookOpen, CheckCircle2, FileText } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/primitives';
import { TEMPLATE_PRESETS } from '../shared/templates';
import { useCVStore } from '../store/useCVStore';

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { prefs, createCV } = useCVStore();
  const isId = prefs.uiLanguage === 'id';

  const handleUsePreset = (presetId: 'classic' | 'compact' | 'academic') => {
    const mode =
      presetId === 'compact'
        ? 'sample-en'
        : presetId === 'academic'
          ? 'sample-academic'
          : 'sample-id';

    const created = createCV(mode, { templatePreset: presetId });
    toast.success(`Template ${presetId.toUpperCase()} berhasil dibuat!`);
    navigate(`/cv/${created.id}`);
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#1F1B2E] dark:text-[#F4F2FA]">
            {isId ? 'Galeri Template & Contoh Data Harvard OCS' : 'Harvard OCS Templates & Sample Data'}
          </h1>
          <p className="text-sm text-[#5B5475] dark:text-[#A69FC2] mt-1 max-w-2xl">
            {isId
              ? 'Pilih dari 3 konfigurasi tipografi LaTeX resmi bergaya Harvard Business School. Seluruh template menghasilkan dokumen PDF vektor asli dengan teks yang dapat diseleksi penuh.'
              : 'Choose from 3 official Harvard Business School LaTeX typography presets. Every template compiles to a selectable vector PDF.'}
          </p>
        </div>

        {/* 3 Preset Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {TEMPLATE_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="rounded-2xl bg-white dark:bg-[#1B1828] border border-[#E8E4F8] dark:border-[#2E2944] p-6 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                {/* Visual LaTeX Sheet Miniature */}
                <div
                  className="p-4 rounded-xl border border-[#E8E4F8] dark:border-[#2E2944]"
                  style={{ backgroundColor: `${preset.accentColor}30` }}
                >
                  <div className="bg-white text-black rounded-lg p-4 shadow-xs border border-neutral-200 font-serif space-y-2">
                    <div className="text-center border-b border-black pb-1.5">
                      <p className="font-bold uppercase tracking-wider text-xs">
                        {preset.id === 'compact'
                          ? 'Clarissa Nadine Wijaya'
                          : preset.id === 'academic'
                            ? 'Nadia Maharani Pramesti, M.Sc.'
                            : 'Bagaskara Adi Pratama'}
                      </p>
                      <p className="text-[9px] text-neutral-600">
                        {preset.id === 'compact'
                          ? 'Boston, MA · cwijaya@mba2025.hbs.edu'
                          : 'Jakarta, Indonesia · alumni@ui.ac.id'}
                      </p>
                    </div>
                    <div className="space-y-1 text-[9px]">
                      <p className="font-bold uppercase border-b border-black/60">
                        {preset.id === 'compact' ? 'Education' : 'Pendidikan'}
                      </p>
                      <div className="flex justify-between font-bold">
                        <span>
                          {preset.id === 'compact'
                            ? 'Harvard Business School'
                            : 'Universitas Indonesia'}
                        </span>
                        <span className="italic font-normal">2020 -- 2024</span>
                      </div>
                      <p className="font-bold uppercase border-b border-black/60 pt-1">
                        {preset.id === 'academic'
                          ? 'Publikasi Ilmiah'
                          : preset.id === 'compact'
                            ? 'Experience'
                            : 'Pengalaman Kerja'}
                      </p>
                      <ul className="list-disc pl-3.5 text-[8.5px] text-neutral-700 space-y-0.5">
                        <li>
                          {preset.id === 'compact'
                            ? 'Spearheaded QR payment launch driving $420M TPV.'
                            : 'Merancang arsitektur ledger 18.500+ TPS dengan SLA 99,995%.'}
                        </li>
                        <li>
                          {preset.id === 'compact'
                            ? 'Reduced merchant onboarding turnaround by 64%.'
                            : 'Menghemat biaya infrastruktur cloud sebesar $145.000/tahun.'}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#5B5475] dark:text-[#A69FC2]">
                    {isId ? preset.badgeId : preset.badgeEn}
                  </p>
                  <h2 className="text-xl font-bold font-heading mt-0.5">
                    {isId ? preset.nameId : preset.nameEn}
                  </h2>
                  <p className="text-xs text-[#5B5475] dark:text-[#A69FC2] mt-2 leading-relaxed">
                    {isId ? preset.descId : preset.descEn}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E8E4F8] dark:border-[#2E2944] text-xs space-y-1">
                  <p className="font-semibold text-[#1F1B2E] dark:text-[#F4F2FA]">
                    {isId ? 'Cocok Untuk:' : 'Ideal For:'}
                  </p>
                  <p className="text-[#5B5475] dark:text-[#A69FC2]">
                    {isId ? preset.bestForId : preset.bestForEn}
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={() => handleUsePreset(preset.id)}
              >
                <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                <span>{isId ? 'Gunakan Template & Contoh Ini' : 'Use This Template & Sample'}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Button>
            </div>
          ))}
        </div>

        {/* Comparison / Technical Specs Box */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1B1828] border border-[#E8E4F8] dark:border-[#2E2944] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#BFEBD7] text-[#133A29] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading">
                Spesifikasi Teknis Kompilasi LaTeX Harvard OCS
              </h3>
              <p className="text-xs text-[#5B5475] dark:text-[#A69FC2]">
                Seluruh preset mematuhi pedoman ketat Harvard Office of Career Services.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-4 rounded-xl bg-[#FAF9FF] dark:bg-[#151221] border border-[#E8E4F8] dark:border-[#2E2944] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#1F1B2E] dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                <span>Tipografi & Paket TeX</span>
              </div>
              <p className="text-[#5B5475] dark:text-[#A69FC2]">
                Menggunakan paket <code className="font-mono">microtype</code>, <code className="font-mono">titlesec</code>, <code className="font-mono">enumitem</code>, dan <code className="font-mono">hyperref</code> tanpa warna/foto.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF9FF] dark:bg-[#151221] border border-[#E8E4F8] dark:border-[#2E2944] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#1F1B2E] dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                <span>Bebas Pemenggalan Kata</span>
              </div>
              <p className="text-[#5B5475] dark:text-[#A69FC2]">
                Mengaktifkan <code className="font-mono">\hyphenpenalty=10000</code> agar kata kunci teknis tidak terpotong tanda hubung di ujung baris.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF9FF] dark:bg-[#151221] border border-[#E8E4F8] dark:border-[#2E2944] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#1F1B2E] dark:text-white">
                <FileText className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                <span>Ekspor Kode Sumber .tex</span>
              </div>
              <p className="text-[#5B5475] dark:text-[#A69FC2]">
                Selain PDF siap kirim, Anda dapat mengunduh file <code className="font-mono">.tex</code> murni untuk diedit di Overleaf atau TeXstudio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
