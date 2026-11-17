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
import {
  AlertCircle,
  Bold,
  Check,
  GripVertical,
  Italic,
  Link2,
  Plus,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { analyzeBullet } from '../../shared/scoring';
import { Badge, Button, Textarea, Tooltip } from '../ui/primitives';

const QUICK_ACTION_VERBS_ID = [
  'Merancang',
  'Mengembangkan',
  'Memimpin',
  'Meningkatkan',
  'Mengoptimalkan',
  'Mengotomatisasi',
];

const QUICK_ACTION_VERBS_EN = [
  'Spearheaded',
  'Engineered',
  'Architected',
  'Accelerated',
  'Optimized',
  'Streamlined',
];

interface SortableBulletRowProps {
  id: string;
  index: number;
  value: string;
  cvLang: 'id' | 'en';
  showQualityAnalysis: boolean;
  onChange: (newVal: string) => void;
  onRemove: () => void;
}

const SortableBulletRow: React.FC<SortableBulletRowProps> = ({
  id,
  index,
  value,
  cvLang,
  showQualityAnalysis,
  onChange,
  onRemove,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
  };

  const wrapSelection = (prefix: string, suffix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || 'teks';
    const next = value.slice(0, start) + prefix + selected + suffix + value.slice(end);
    onChange(next);
  };

  const applyActionVerb = (verb: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      onChange(`${verb} `);
      return;
    }
    // Lowercase first letter of existing sentence if prepending verb
    const rest = trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
    onChange(`${verb} ${rest}`);
  };

  const appendMetricTemplate = () => {
    const trimmed = value.trim().replace(/\.$/, '');
    const suffix =
      cvLang === 'id'
        ? ', meningkatkan efisiensi sebesar **35%** dalam 3 bulan.'
        : ', increasing operational efficiency by **35%** within 3 months.';
    onChange(`${trimmed}${suffix}`);
  };

  const analysis = showQualityAnalysis ? analyzeBullet(value, cvLang) : null;
  const verbs = cvLang === 'id' ? QUICK_ACTION_VERBS_ID : QUICK_ACTION_VERBS_EN;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3.5 rounded-[14px] bg-[var(--background)] border border-[var(--border-strong)] space-y-2.5 transition-shadow hover:shadow-[var(--shadow-1)]"
    >
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Urutkan poin ${index + 1}`}
          className="mt-2 p-1.5 rounded-[8px] text-[var(--muted-foreground)] hover:bg-[var(--muted)] cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" strokeWidth={2.5} />
        </button>

        <div className="flex-1 space-y-2">
          {/* Mini Toolbar + Quality Chips + Saran Perbaikan Button */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 p-0.5 rounded-[10px] bg-[var(--surface)] border border-[var(--border)]">
              <Tooltip content="Tebal (**teks**)">
                <button
                  type="button"
                  onClick={() => wrapSelection('**', '**')}
                  className="px-2 py-1 rounded-[7px] text-xs font-semibold text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1 cursor-pointer"
                >
                  <Bold className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </Tooltip>
              <Tooltip content="Miring (*teks*)">
                <button
                  type="button"
                  onClick={() => wrapSelection('*', '*')}
                  className="px-2 py-1 rounded-[7px] text-xs font-semibold text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1 cursor-pointer"
                >
                  <Italic className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </Tooltip>
              <Tooltip content="Tautan ([label](url))">
                <button
                  type="button"
                  onClick={() => wrapSelection('[', '](https://contoh.com)')}
                  className="px-2 py-1 rounded-[7px] text-xs font-semibold text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1 cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </Tooltip>
            </div>

            {analysis && (
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant={analysis.startsWithActionVerb ? 'mint' : 'butter'}>
                  {analysis.startsWithActionVerb ? (
                    <>
                      <Check className="w-3 h-3" strokeWidth={2.5} />
                      <span>Kata kerja aksi ✓</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" strokeWidth={2.5} />
                      <span>Mulai dgn kata kerja</span>
                    </>
                  )}
                </Badge>

                <Badge variant={analysis.hasMetric ? 'mint' : 'peach'}>
                  {analysis.hasMetric ? (
                    <>
                      <Check className="w-3 h-3" strokeWidth={2.5} />
                      <span>Metrik angka ✓</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" strokeWidth={2.5} />
                      <span>Tambahkan angka</span>
                    </>
                  )}
                </Badge>

                <button
                  type="button"
                  onClick={() => setShowSuggestions((s) => !s)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[8px] text-[11px] font-semibold bg-[#B8A9F5]/25 text-[#2A2150] dark:text-[#DFD7FC] hover:bg-[#B8A9F5]/40 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3 h-3" strokeWidth={2.5} />
                  <span>Saran perbaikan</span>
                </button>
              </div>
            )}
          </div>

          <Textarea
            ref={textareaRef}
            rows={2}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              cvLang === 'id'
                ? 'Contoh: Mengembangkan sistem pembayaran yang meningkatkan transaksi harian sebesar **35%**...'
                : 'e.g., Spearheaded payment pipeline redesign, increasing checkout conversion by **35%**...'
            }
            className="min-h-[64px] text-xs leading-relaxed bg-[var(--surface)]"
          />

          {/* Interactive Harvard OCS Action Verb & Metric Helper Drawer */}
          {showSuggestions && (
            <div className="p-3 rounded-[12px] bg-[var(--surface)] border border-[var(--border-strong)] space-y-2.5 text-xs animate-in fade-in duration-150">
              {analysis && analysis.suggestions.length > 0 && (
                <p className="text-[11px] text-[var(--muted-foreground)] font-medium">
                  💡 {analysis.suggestions.join(' ')}
                </p>
              )}

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-[var(--foreground)] block">
                  Sisipkan Kata Kerja Aksi Harvard OCS:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {verbs.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => applyActionVerb(v)}
                      className="px-2 py-1 rounded-[7px] text-[11px] font-semibold bg-[var(--muted)] hover:bg-[#B8A9F5]/30 text-[var(--foreground)] transition-colors cursor-pointer"
                    >
                      + {v}
                    </button>
                  ))}
                  {!analysis?.hasMetric && (
                    <button
                      type="button"
                      onClick={appendMetricTemplate}
                      className="px-2.5 py-1 rounded-[7px] text-[11px] font-semibold bg-[#BFEBD7]/60 text-[#133A29] hover:bg-[#BFEBD7] transition-colors cursor-pointer"
                    >
                      + Contoh Metrik (+35%)
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <Tooltip content="Hapus poin ini">
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Hapus poin ${index + 1}`}
            className="mt-2 p-1.5 rounded-[8px] text-[var(--muted-foreground)] hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export function BulletListEditor({
  bullets,
  onChange,
  cvLang = 'id',
  showQualityAnalysis = true,
  label = 'Poin Pencapaian (Bullet Points)',
}: {
  bullets: string[];
  onChange: (next: string[]) => void;
  cvLang?: 'id' | 'en';
  showQualityAnalysis?: boolean;
  label?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const itemIds = bullets.map((_, idx) => `bullet-${idx}`);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = itemIds.indexOf(String(active.id));
    const newIndex = itemIds.indexOf(String(over.id));
    if (oldIndex !== -1 && newIndex !== -1) {
      onChange(arrayMove(bullets, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#2A2150] dark:text-[#E2DDF5]">
          {label}
        </span>
        <Button
          variant="soft"
          size="sm"
          onClick={() => onChange([...bullets, ''])}
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span>Tambah Poin</span>
        </Button>
      </div>

      {bullets.length === 0 ? (
        <div className="p-4 rounded-[14px] border border-dashed border-[var(--border-strong)] text-center text-xs text-[var(--muted-foreground)]">
          Belum ada poin pencapaian. Klik &ldquo;Tambah Poin&rdquo; untuk menulis dampak kerja terukur Anda.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2.5">
              {bullets.map((bullet, idx) => (
                <SortableBulletRow
                  key={`bullet-${idx}`}
                  id={`bullet-${idx}`}
                  index={idx}
                  value={bullet}
                  cvLang={cvLang}
                  showQualityAnalysis={showQualityAnalysis}
                  onChange={(val) => {
                    const copy = [...bullets];
                    copy[idx] = val;
                    onChange(copy);
                  }}
                  onRemove={() => {
                    onChange(bullets.filter((_, i) => i !== idx));
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
