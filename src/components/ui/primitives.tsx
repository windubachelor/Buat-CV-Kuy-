import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { clsx, type ClassValue } from 'clsx';
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ============================================================================
 * BUTTON (Variants: default/primary, gradient, soft, secondary, outline, ghost, mint, peach, destructive)
 * ========================================================================== */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'gradient'
    | 'soft'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'destructive'
    | 'mint'
    | 'peach';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => {
    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      default:
        'btn-lavender-gradient font-semibold border border-[#9E8CE8]/40 hover:-translate-y-[1px]',
      primary:
        'btn-lavender-gradient font-semibold border border-[#9E8CE8]/40 hover:-translate-y-[1px]',
      gradient:
        'btn-lavender-gradient font-semibold border border-[#9E8CE8]/50 hover:-translate-y-[1px]',
      soft:
        'bg-[#B8A9F5]/20 text-[#2A2150] hover:bg-[#B8A9F5]/30 dark:bg-[#B8A9F5]/15 dark:text-[#D9D0FA] dark:hover:bg-[#B8A9F5]/25 font-semibold border border-[#B8A9F5]/30',
      secondary:
        'bg-[#F3F0FC] text-[#2A2150] hover:bg-[#E7E1FA] dark:bg-[#1E1A30] dark:text-[#F4F2FA] dark:hover:bg-[#28233F] font-medium border border-[var(--border)] shadow-[var(--shadow-1)]',
      mint:
        'bg-[#BFEBD7] text-[#133A29] hover:bg-[#AAE3C9] dark:bg-[#214033] dark:text-[#D5F6E7] font-semibold border border-[#96D7BA]/60 shadow-[var(--shadow-1)] hover:-translate-y-[1px]',
      peach:
        'bg-[#FFD3B6] text-[#4A2511] hover:bg-[#FFC49E] dark:bg-[#3B281D] dark:text-[#FFE5D4] font-semibold border border-[#F5B78E]/60 shadow-[var(--shadow-1)] hover:-translate-y-[1px]',
      outline:
        'bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border-strong)] hover:bg-[#F3F0FC]/60 dark:hover:bg-[#1E1A30] font-medium shadow-[var(--shadow-1)]',
      ghost:
        'bg-transparent text-[var(--foreground)] hover:bg-[#F3F0FC] dark:hover:bg-[#1E1A30] font-medium',
      destructive:
        'bg-red-600 text-white hover:bg-red-700 font-semibold shadow-sm hover:-translate-y-[1px]',
    };

    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'min-h-[38px] h-9 px-3.5 text-xs rounded-[12px] gap-1.5',
      md: 'min-h-[40px] h-10 px-4 py-2 text-sm rounded-[12px] gap-2',
      lg: 'min-h-[46px] h-12 px-6 text-base rounded-[16px] gap-2.5',
      icon: 'min-h-[40px] min-w-[40px] h-10 w-10 rounded-[12px] p-0 flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'group inline-flex items-center justify-center whitespace-nowrap shrink-0 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8A9F5] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.97]',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

/* ============================================================================
 * SOFT PASTEL BADGE & KBD
 * ========================================================================== */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'lavender' | 'mint' | 'peach' | 'sky' | 'butter' | 'rose' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'lavender',
  children,
  ...props
}) => {
  const styles: Record<NonNullable<BadgeProps['variant']>, string> = {
    lavender:
      'bg-[#B8A9F5]/25 text-[#2A2150] dark:bg-[#B8A9F5]/20 dark:text-[#DFD7FC] border-[#B8A9F5]/40',
    mint:
      'bg-[#BFEBD7]/55 text-[#133A29] dark:bg-[#214033] dark:text-[#C5F2DE] border-[#8CD4B5]/50',
    peach:
      'bg-[#FFD3B6]/55 text-[#4A2511] dark:bg-[#3B281D] dark:text-[#FFDCC4] border-[#F5B78E]/50',
    sky:
      'bg-[#BDE0FE]/55 text-[#102E4A] dark:bg-[#1A3044] dark:text-[#CBE6FF] border-[#90C7FA]/50',
    butter:
      'bg-[#FFF1B8]/70 text-[#453E21] dark:bg-[#3A341C] dark:text-[#FFF3C4] border-[#EAD47A]/60',
    rose:
      'bg-[#FFC8DD]/55 text-[#4A152B] dark:bg-[#3E1F2D] dark:text-[#FFD4E5] border-[#F4A6C4]/50',
    neutral:
      'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[8px] text-[11px] font-semibold border whitespace-nowrap shrink-0',
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const Kbd: React.FC<React.HTMLAttributes<HTMLElement>> = ({
  className,
  children,
  ...props
}) => (
  <kbd
    className={cn(
      'inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-heading font-semibold rounded-[6px] bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border-strong)] shadow-2xs tabular-nums',
      className
    )}
    {...props}
  >
    {children}
  </kbd>
);

/* ============================================================================
 * INPUT, TEXTAREA, LABEL, SWITCH
 * ========================================================================== */
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-[12px] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8A9F5] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--background)] focus-visible:border-[#9B86EC] disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-2xs',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[88px] w-full rounded-[12px] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8A9F5] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--background)] focus-visible:border-[#9B86EC] disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-2xs',
      className
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'text-xs font-semibold text-[#2A2150] dark:text-[#E2DDF5] block mb-1.5 tracking-tight',
      className
    )}
    {...props}
  />
));
Label.displayName = 'Label';

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B86EC] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#B8A9F5] data-[state=unchecked]:bg-[#E2DCF5] dark:data-[state=unchecked]:bg-[#2A243D]',
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none block h-5 w-5 rounded-full bg-[#2A2150] dark:bg-white shadow-xs ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = 'Switch';

/* ============================================================================
 * TOOLTIP
 * ========================================================================== */
export const TooltipProvider = TooltipPrimitive.Provider;

export function Tooltip({
  content,
  kbd,
  side = 'top',
  children,
}: {
  content: React.ReactNode;
  kbd?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  children: React.ReactNode;
}) {
  return (
    <TooltipPrimitive.Root delayDuration={180}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className="z-50 inline-flex items-center gap-2 rounded-[10px] bg-[#1F1B2E] dark:bg-[#2A243D] px-2.5 py-1.5 text-xs font-medium text-white shadow-lg border border-white/10 animate-in fade-in-0 zoom-in-95 duration-150"
        >
          <span>{content}</span>
          {kbd && (
            <span className="px-1.5 py-0.2 rounded bg-white/15 text-[10px] font-heading font-semibold">
              {kbd}
            </span>
          )}
          <TooltipPrimitive.Arrow className="fill-[#1F1B2E] dark:fill-[#2A243D]" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

/* ============================================================================
 * DROPDOWN MENU
 * ========================================================================== */
export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[190px] overflow-hidden rounded-[16px] bg-[var(--elevated)] border border-[var(--border-strong)] p-1.5 text-[var(--foreground)] shadow-[var(--shadow-4)] animate-in fade-in-0 zoom-in-95 duration-150',
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = 'DropdownMenuContent';

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    destructive?: boolean;
  }
>(({ className, destructive, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-2.5 rounded-[10px] px-3 py-2 text-xs font-medium outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      destructive
        ? 'text-red-600 dark:text-red-400 focus:bg-red-500/10'
        : 'text-[var(--foreground)] focus:bg-[var(--muted)]',
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-[var(--border)]', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

/* ============================================================================
 * POPOVER & MONTH-YEAR PICKER (For CV Dates YYYY-MM)
 * ========================================================================== */
const MONTHS_SHORT = [
  { num: '01', id: 'Jan', en: 'Jan' },
  { num: '02', id: 'Feb', en: 'Feb' },
  { num: '03', id: 'Mar', en: 'Mar' },
  { num: '04', id: 'Apr', en: 'Apr' },
  { num: '05', id: 'Mei', en: 'May' },
  { num: '06', id: 'Jun', en: 'Jun' },
  { num: '07', id: 'Jul', en: 'Jul' },
  { num: '08', id: 'Agu', en: 'Aug' },
  { num: '09', id: 'Sep', en: 'Sep' },
  { num: '10', id: 'Okt', en: 'Oct' },
  { num: '11', id: 'Nov', en: 'Nov' },
  { num: '12', id: 'Des', en: 'Dec' },
];

export function MonthYearPicker({
  value,
  onChange,
  disabled,
  placeholder = 'YYYY-MM',
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  const [year, setYear] = useState<number>(() =>
    match ? parseInt(match[1]!, 10) : new Date().getFullYear()
  );
  const selectedMonth = match ? match[2] : null;

  return (
    <div className="relative flex items-center gap-1.5">
      <Input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10 tabular-nums"
      />
      <PopoverPrimitive.Root open={open && !disabled} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label="Pilih bulan dan tahun"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-[8px] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-40 cursor-pointer transition-colors"
          >
            <Calendar className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="end"
            sideOffset={6}
            className="z-50 w-64 rounded-[16px] bg-[var(--elevated)] border border-[var(--border-strong)] p-3.5 shadow-[var(--shadow-4)] animate-in fade-in-0 zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border)]">
              <button
                type="button"
                onClick={() => setYear((y) => y - 1)}
                className="p-1 rounded-lg hover:bg-[var(--muted)] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <span className="text-sm font-bold font-heading tabular-nums">{year}</span>
              <button
                type="button"
                onClick={() => setYear((y) => y + 1)}
                className="p-1 rounded-lg hover:bg-[var(--muted)] cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {MONTHS_SHORT.map((m) => {
                const isSelected =
                  selectedMonth === m.num && match && parseInt(match[1]!, 10) === year;
                return (
                  <button
                    key={m.num}
                    type="button"
                    onClick={() => {
                      onChange(`${year}-${m.num}`);
                      setOpen(false);
                    }}
                    className={cn(
                      'py-1.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-[#B8A9F5] text-[#2A2150]'
                        : 'hover:bg-[var(--muted)] text-[var(--foreground)]'
                    )}
                  >
                    {m.id}
                  </button>
                );
              })}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}

/* ============================================================================
 * SKILL TAG / CHIPS INPUT (Enter to add, Backspace/X to remove)
 * ========================================================================== */
export function SkillChipsInput({
  value,
  onChange,
  placeholder = 'Ketik skill lalu tekan Enter (mis. Go, TypeScript, SQL)...',
}: {
  value: string;
  onChange: (nextCommaSeparated: string) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');
  const chips = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const addChip = (raw: string) => {
    const clean = raw.trim().replace(/,+$/, '').trim();
    if (!clean) return;
    if (!chips.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      onChange([...chips, clean].join(', '));
    }
    setDraft('');
  };

  const removeChip = (idx: number) => {
    const next = chips.filter((_, i) => i !== idx);
    onChange(next.join(', '));
  };

  return (
    <div className="rounded-[12px] border border-[var(--border-strong)] bg-[var(--surface)] p-2 focus-within:ring-2 focus-within:ring-[#B8A9F5] transition-all">
      <div className="flex flex-wrap items-center gap-1.5">
        {chips.map((chip, idx) => (
          <span
            key={`${chip}-${idx}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-xs font-semibold bg-[#B8A9F5]/25 text-[#2A2150] dark:bg-[#B8A9F5]/20 dark:text-[#E2DDF5] border border-[#B8A9F5]/40"
          >
            <span>{chip}</span>
            <button
              type="button"
              onClick={() => removeChip(idx)}
              aria-label={`Hapus ${chip}`}
              className="hover:text-red-600 cursor-pointer"
            >
              <X className="w-3 h-3" strokeWidth={2.5} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => {
            const val = e.target.value;
            if (val.endsWith(',')) {
              addChip(val);
            } else {
              setDraft(val);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addChip(draft);
            } else if (e.key === 'Backspace' && !draft && chips.length > 0) {
              removeChip(chips.length - 1);
            }
          }}
          onBlur={() => {
            if (draft.trim()) addChip(draft);
          }}
          placeholder={chips.length === 0 ? placeholder : 'Tambah skill...'}
          className="flex-1 min-w-[140px] h-7 bg-transparent px-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/65 focus:outline-none"
        />
        {draft.trim() && (
          <button
            type="button"
            onClick={() => addChip(draft)}
            className="px-2 py-1 rounded-[8px] text-[11px] font-semibold bg-[#BFEBD7] text-[#133A29] inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" strokeWidth={2.5} />
            Tambah
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
 * ACCORDION (For FAQ & Collapsible Editor Sections)
 * ========================================================================== */
export const Accordion = AccordionPrimitive.Root;
export const AccordionItem = AccordionPrimitive.Item;

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-4 text-left text-sm font-bold font-heading transition-all cursor-pointer [&[data-state=open]>svg]:rotate-180',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className="h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition-transform duration-200"
        strokeWidth={2.5}
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = 'AccordionContent';

/* ============================================================================
 * ANIMATED COUNT-UP NUMBER & RADIAL PROGRESS RING
 * ========================================================================== */
export function CountUpNumber({
  value,
  suffix = '',
  durationMs = 750,
}: {
  value: number;
  suffix?: string;
  durationMs?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let rafId: number;
    const from = 0;
    const to = value;

    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value, durationMs]);

  return (
    <span className="font-heading tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

export function RadialProgressRing({
  progress,
  size = 44,
  strokeWidth = 4.5,
  color = '#9B86EC',
  children,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, progress));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-[#E8E4F8] dark:text-[#2A243D]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * MODAL DIALOG
 * ========================================================================== */
export function ModalDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[94vw] -translate-x-1/2 -translate-y-1/2 rounded-[24px] bg-[var(--elevated)] border border-[var(--border-strong)] p-6 shadow-[var(--shadow-5)] focus:outline-none animate-in fade-in-0 zoom-in-95 duration-200',
            maxWidth
          )}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <DialogPrimitive.Title className="text-lg font-bold font-heading text-[var(--foreground)]">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="text-xs text-[var(--muted-foreground)] mt-1">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Tutup dialog"
                className="rounded-[10px] p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </DialogPrimitive.Close>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/* ============================================================================
 * GLOBAL ERROR BOUNDARY
 * ========================================================================== */
interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message || 'Terjadi kesalahan tidak terduga' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-6">
          <div className="max-w-md w-full surface-elevated p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FFC8DD]/40 text-red-700 dark:text-red-300 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold font-heading text-[var(--foreground)] mb-2">
              Terjadi Gangguan Aplikasi
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">
              {this.state.errorMessage}
            </p>
            <Button
              variant="primary"
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
                window.location.href = '/dashboard';
              }}
            >
              <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
              Muat Ulang Ruang Kerja
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
