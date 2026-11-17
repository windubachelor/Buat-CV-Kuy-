import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, GripVertical, SlidersHorizontal } from 'lucide-react';
import React from 'react';
import type { CVData, SectionConfigItem, SectionKey } from '../../shared/schema';
import { Input, Label, Switch, cn } from '../ui/primitives';

const SECTION_DEFAULT_NAMES: Record<SectionKey, string> = {
  summary: 'Ringkasan Profesional / Summary',
  education: 'Pendidikan / Education',
  experience: 'Pengalaman Kerja / Experience',
  leadership: 'Kepemimpinan & Organisasi / Leadership',
  projects: 'Proyek Terpilih / Projects',
  awards: 'Penghargaan & Beasiswa / Awards',
  certifications: 'Sertifikasi & Pelatihan / Certifications',
  publications: 'Publikasi Ilmiah / Publications',
  skills: 'Keahlian & Minat / Skills & Interests',
  custom: 'Section Kustom / Custom Sections',
};

const SortableSectionRow: React.FC<{
  item: SectionConfigItem;
  onToggleVisible: () => void;
  onCustomTitleChange: (val: string) => void;
}> = ({ item, onToggleVisible, onCustomTitleChange }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.key });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors',
        item.visible
          ? 'bg-white dark:bg-[#1B1828] border-[#E8E4F8] dark:border-[#2E2944]'
          : 'bg-[#FAF9FF]/60 dark:bg-[#151221]/50 border-[#E8E4F8]/50 dark:border-[#2E2944]/50 opacity-70'
      )}
    >
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Geser urutan ${item.key}`}
          className="p-1.5 rounded-lg text-[#5B5475] hover:bg-[#F2EFFC] dark:hover:bg-[#242036] cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <div>
          <p className="text-xs font-bold text-[#1F1B2E] dark:text-[#F4F2FA]">
            {SECTION_DEFAULT_NAMES[item.key]}
          </p>
          <p className="text-[11px] text-[#5B5475] dark:text-[#A69FC2]">
            {item.visible ? 'Ditampilkan di PDF' : 'Disembunyikan dari PDF'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Input
          value={item.customTitle || ''}
          onChange={(e) => onCustomTitleChange(e.target.value)}
          placeholder="Judul kustom di PDF (opsional)"
          className="h-8 text-xs w-48"
        />
        <button
          type="button"
          onClick={onToggleVisible}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors',
            item.visible
              ? 'bg-[#BFEBD7]/50 text-[#133A29] dark:bg-[#264A3B] dark:text-[#D3F5E6]'
              : 'bg-[#E8E4F8] text-[#5B5475] dark:bg-[#242036] dark:text-[#A69FC2]'
          )}
        >
          {item.visible ? (
            <>
              <Eye className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Tampil</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Sembunyi</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const HarvardSettingsPanel: React.FC<{
  cv: CVData;
  updateCV: (updater: (draft: CVData) => CVData) => void;
}> = ({ cv, updateCV }) => {
  const { settings, sectionOrder } = cv;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sectionOrder.findIndex((s) => s.key === active.id);
    const newIdx = sectionOrder.findIndex((s) => s.key === over.id);
    if (oldIdx !== -1 && newIdx !== -1) {
      updateCV((d) => {
        d.sectionOrder = arrayMove(d.sectionOrder, oldIdx, newIdx);
        return d;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-[#B8A9F5]/25 dark:bg-[#28233C] border border-[#B8A9F5]/40 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#B8A9F5] text-[#2A2150] flex items-center justify-center shrink-0">
          <SlidersHorizontal className="w-5 h-5" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-base font-bold font-heading">
            Pengaturan Tipografi LaTeX & Urutan Section Harvard
          </h2>
          <p className="text-xs text-[#5B5475] dark:text-[#A69FC2]">
            Sesuaikan parameter kompilasi LaTeX (kertas, font serif buku, ukuran font, margin, bahasa tanggal) dan urutkan section dengan drag & drop.
          </p>
        </div>
      </div>

      {/* Typography & Geometry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-white dark:bg-[#1B1828] border border-[#E8E4F8] dark:border-[#2E2944]">
        <div>
          <Label>Preset Gaya Harvard OCS</Label>
          <select
            value={settings.templatePreset}
            onChange={(e) =>
              updateCV((d) => {
                const preset = e.target.value as 'classic' | 'compact' | 'academic';
                d.settings.templatePreset = preset;
                if (preset === 'compact') {
                  d.settings.margin = 'narrow';
                  d.settings.sectionSpacing = 'compact';
                  d.settings.fontSize = '10.5pt';
                } else if (preset === 'academic') {
                  d.settings.fontFamily = 'ebgaramond';
                  d.settings.margin = 'normal';
                } else {
                  d.settings.fontFamily = 'tgtermes';
                  d.settings.margin = 'normal';
                }
                return d;
              })
            }
            className="w-full h-10 rounded-xl border border-[#E8E4F8] dark:border-[#2E2944] bg-white dark:bg-[#151221] px-3 text-sm"
          >
            <option value="classic">Classic Harvard OCS (Standar Korporat)</option>
            <option value="compact">Compact 1-Halaman (Padat & Efisien)</option>
            <option value="academic">Academic / Research CV (Riset & Beasiswa)</option>
          </select>
        </div>

        <div>
          <Label>Bahasa Dokumen CV (Label Section & Tanggal)</Label>
          <select
            value={settings.cvLanguage}
            onChange={(e) =>
              updateCV((d) => {
                d.settings.cvLanguage = e.target.value as 'id' | 'en';
                return d;
              })
            }
            className="w-full h-10 rounded-xl border border-[#E8E4F8] dark:border-[#2E2944] bg-white dark:bg-[#151221] px-3 text-sm"
          >
            <option value="id">Bahasa Indonesia (Pendidikan, Pengalaman Kerja...)</option>
            <option value="en">English (Education, Experience, Leadership...)</option>
          </select>
        </div>

        <div>
          <Label>Keluarga Font Serif LaTeX</Label>
          <select
            value={settings.fontFamily}
            onChange={(e) =>
              updateCV((d) => {
                d.settings.fontFamily = e.target.value as 'tgtermes' | 'libertinus' | 'ebgaramond';
                return d;
              })
            }
            className="w-full h-10 rounded-xl border border-[#E8E4F8] dark:border-[#2E2944] bg-white dark:bg-[#151221] px-3 text-sm"
          >
            <option value="tgtermes">TeX Gyre Termes (Times-like Harvard Default)</option>
            <option value="libertinus">Libertinus Serif (Editorial Tajam)</option>
            <option value="ebgaramond">EB Garamond (Klasik Akademik)</option>
          </select>
        </div>

        <div>
          <Label>Ukuran Kertas PDF</Label>
          <select
            value={settings.paperSize}
            onChange={(e) =>
              updateCV((d) => {
                d.settings.paperSize = e.target.value as 'a4' | 'letter';
                return d;
              })
            }
            className="w-full h-10 rounded-xl border border-[#E8E4F8] dark:border-[#2E2944] bg-white dark:bg-[#151221] px-3 text-sm"
          >
            <option value="a4">A4 (210 × 297 mm — Standar Indonesia & Internasional)</option>
            <option value="letter">US Letter (8.5 × 11 in — Standar AS & Kanada)</option>
          </select>
        </div>

        <div>
          <Label>Ukuran Font Dasar</Label>
          <select
            value={settings.fontSize}
            onChange={(e) =>
              updateCV((d) => {
                d.settings.fontSize = e.target.value as '10pt' | '10.5pt' | '11pt' | '11.5pt';
                return d;
              })
            }
            className="w-full h-10 rounded-xl border border-[#E8E4F8] dark:border-[#2E2944] bg-white dark:bg-[#151221] px-3 text-sm"
          >
            <option value="10pt">10 pt (Maksimum Kepadatan 1 Halaman)</option>
            <option value="10.5pt">10.5 pt (Seimbang & Proporsional)</option>
            <option value="11pt">11 pt (Standar Resmi Harvard OCS)</option>
            <option value="11.5pt">11.5 pt (Lega untuk Fresh Graduate)</option>
          </select>
        </div>

        <div>
          <Label>Ukuran Margin Halaman</Label>
          <select
            value={settings.margin}
            onChange={(e) =>
              updateCV((d) => {
                d.settings.margin = e.target.value as 'normal' | 'narrow' | 'compact';
                return d;
              })
            }
            className="w-full h-10 rounded-xl border border-[#E8E4F8] dark:border-[#2E2944] bg-white dark:bg-[#151221] px-3 text-sm"
          >
            <option value="normal">Normal (0.72 in — Standar Harvard)</option>
            <option value="narrow">Sempit (0.52 in — Muat Lebih Banyak)</option>
            <option value="compact">Ekstra Kompak (0.45 in — Auto-Fit 1 Halaman)</option>
          </select>
        </div>

        <div>
          <Label>Jarak Antar Bagian (Section Spacing)</Label>
          <select
            value={settings.sectionSpacing}
            onChange={(e) =>
              updateCV((d) => {
                d.settings.sectionSpacing = e.target.value as 'compact' | 'normal' | 'relaxed';
                return d;
              })
            }
            className="w-full h-10 rounded-xl border border-[#E8E4F8] dark:border-[#2E2944] bg-white dark:bg-[#151221] px-3 text-sm"
          >
            <option value="compact">Rapat (Compact)</option>
            <option value="normal">Normal (Default Harvard)</option>
            <option value="relaxed">Lega (Relaxed)</option>
          </select>
        </div>

        <div>
          <Label>Format Penulisan Tanggal</Label>
          <select
            value={settings.dateFormat}
            onChange={(e) =>
              updateCV((d) => {
                d.settings.dateFormat = e.target.value as 'short' | 'numeric' | 'long';
                return d;
              })
            }
            className="w-full h-10 rounded-xl border border-[#E8E4F8] dark:border-[#2E2944] bg-white dark:bg-[#151221] px-3 text-sm"
          >
            <option value="short">Singkat (Jan 2024 / Agu 2024)</option>
            <option value="numeric">Numerik (01/2024 / 08/2024)</option>
            <option value="long">Lengkap (Januari 2024 / Agustus 2024)</option>
          </select>
        </div>

        <div className="md:col-span-2 pt-2 flex items-center justify-between border-t border-[#E8E4F8] dark:border-[#2E2944]">
          <div>
            <p className="text-xs font-bold">Tampilkan Penanda Tautan di Header ([in], [gh], [web])</p>
            <p className="text-[11px] text-[#5B5475] dark:text-[#A69FC2]">
              Menambahkan label teks bersih sebelum tautan LinkedIn, GitHub, dan Portofolio.
            </p>
          </div>
          <Switch
            checked={settings.showLinksIcon}
            onCheckedChange={(checked) =>
              updateCV((d) => {
                d.settings.showLinksIcon = checked;
                return d;
              })
            }
          />
        </div>
      </div>

      {/* Drag & Drop Section Reordering */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold font-heading">
            Urutan & Visibilitas Section (Drag & Drop)
          </h3>
          <p className="text-xs text-[#5B5475] dark:text-[#A69FC2]">
            Geser ikon pegangan untuk mengubah urutan bagian pada dokumen PDF LaTeX Anda, atau ubah judul section sesuai kebutuhan.
          </p>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sectionOrder.map((s) => s.key)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sectionOrder.map((item, idx) => (
                <SortableSectionRow
                  key={item.key}
                  item={item}
                  onToggleVisible={() =>
                    updateCV((d) => {
                      d.sectionOrder[idx]!.visible = !d.sectionOrder[idx]!.visible;
                      return d;
                    })
                  }
                  onCustomTitleChange={(val) =>
                    updateCV((d) => {
                      d.sectionOrder[idx]!.customTitle = val;
                      return d;
                    })
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
