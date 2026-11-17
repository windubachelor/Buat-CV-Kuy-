import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Command as CommandIcon,
  FilePlus2,
  FileText,
  Globe,
  LayoutDashboard,
  Moon,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  User,
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCVStore } from '../../store/useCVStore';
import { CreateCVModal } from '../dashboard/CreateCVModal';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Kbd,
  Tooltip,
  TooltipProvider,
  cn,
} from '../ui/primitives';
import { CommandPalette } from './CommandPalette';

export function AppShell({
  children,
  onOpenCreateModalProp,
}: {
  children: React.ReactNode;
  onOpenCreateModalProp?: () => void;
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { prefs, updatePrefs, getActiveCv } = useCVStore();
  const [collapsed, setCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const activeCv = getActiveCv();

  const handleOpenCreate = () => {
    if (onOpenCreateModalProp) {
      onOpenCreateModalProp();
    } else {
      setCreateModalOpen(true);
    }
  };

  const toggleTheme = () => {
    updatePrefs({ theme: prefs.theme === 'dark' ? 'light' : 'dark' });
  };

  const toggleLanguage = () => {
    updatePrefs({ uiLanguage: prefs.uiLanguage === 'id' ? 'en' : 'id' });
  };

  // Breadcrumb calculation
  const currentPageLabel = location.pathname.startsWith('/templates')
    ? t('nav.templates')
    : location.pathname.startsWith('/settings')
      ? t('nav.settings')
      : t('nav.dashboard');

  const workspaceItems = [
    {
      to: '/dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
      active: location.pathname === '/dashboard',
    },
    {
      to: '/templates',
      label: t('nav.templates'),
      icon: BookOpen,
      active: location.pathname.startsWith('/templates'),
    },
  ];

  const configItems = [
    {
      to: '/settings',
      label: t('nav.settings'),
      icon: Settings,
      active: location.pathname.startsWith('/settings'),
    },
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen flex bg-[var(--background)] text-[var(--foreground)] relative">
        {/* Ambient Pastel Mesh Gradient Blobs (Fixed, Low Opacity, Non-Interactive) */}
        <div
          aria-hidden="true"
          className="fixed inset-0 overflow-hidden pointer-events-none z-0"
        >
          <div className="absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full bg-[#B8A9F5]/18 dark:bg-[#B8A9F5]/8 blur-[110px]" />
          <div className="absolute top-1/3 -right-32 w-[480px] h-[480px] rounded-full bg-[#BDE0FE]/22 dark:bg-[#BDE0FE]/7 blur-[120px]" />
          <div className="absolute -bottom-32 left-1/3 w-[440px] h-[440px] rounded-full bg-[#BFEBD7]/16 dark:bg-[#BFEBD7]/6 blur-[110px]" />
        </div>

        {/* Collapsible Sidebar (Desktop) */}
        <aside
          className={cn(
            'hidden md:flex flex-col justify-between border-r border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md transition-all duration-200 shrink-0 z-20 sticky top-0 h-screen',
            collapsed ? 'w-[78px]' : 'w-[264px]'
          )}
        >
          <div className="p-4 space-y-5">
            {/* Brand Header + Collapse Button */}
            <div className="flex items-center justify-between h-11 px-1">
              <Link
                to="/"
                className="flex items-center gap-2.5 text-lg font-bold font-heading tracking-tight text-[var(--foreground)] whitespace-nowrap overflow-hidden"
              >
                <div className="w-9 h-9 rounded-[12px] btn-lavender-gradient flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[#211942]" strokeWidth={2.5} />
                </div>
                {!collapsed && <span>Buat CV Kuy</span>}
              </Link>
              <Tooltip content={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'} side="right">
                <button
                  type="button"
                  onClick={() => setCollapsed((c) => !c)}
                  aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
                  className="p-2 rounded-[10px] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer transition-colors"
                >
                  {collapsed ? (
                    <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                  ) : (
                    <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                  )}
                </button>
              </Tooltip>
            </div>

            {/* Single Primary Action Button */}
            <div>
              {collapsed ? (
                <Tooltip content={t('nav.newCv')} kbd="N" side="right">
                  <Button
                    variant="gradient"
                    onClick={handleOpenCreate}
                    className="w-full px-0 justify-center"
                  >
                    <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                  </Button>
                </Tooltip>
              ) : (
                <Button
                  variant="gradient"
                  onClick={handleOpenCreate}
                  className="w-full justify-between"
                >
                  <span className="inline-flex items-center gap-2">
                    <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                    <span>{t('nav.newCv')}</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-black/10 text-[10px] font-heading">
                    Baru
                  </span>
                </Button>
              )}
            </div>

            {/* Menu Group 1: Workspace */}
            <div className="space-y-1">
              {!collapsed && (
                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Ruang Kerja
                </p>
              )}
              <nav className="space-y-1" aria-label="Ruang Kerja">
                {workspaceItems.map((item) => {
                  const Icon = item.icon;
                  const linkContent = (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        'relative flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-xs font-semibold transition-colors whitespace-nowrap group',
                        item.active
                          ? 'text-[#2A2150] dark:text-white'
                          : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]/60 hover:text-[var(--foreground)]',
                        collapsed && 'justify-center px-0'
                      )}
                    >
                      {item.active && (
                        <motion.div
                          layoutId="sidebar-active-pill"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                          className="absolute inset-0 rounded-[12px] bg-[#B8A9F5]/28 dark:bg-[#B8A9F5]/20 border border-[#B8A9F5]/45 -z-10"
                        />
                      )}
                      <Icon
                        className={cn(
                          'w-4 h-4 shrink-0 transition-transform group-hover:scale-105',
                          item.active ? 'text-[#2A2150] dark:text-[#B8A9F5]' : ''
                        )}
                        strokeWidth={2.5}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );

                  return collapsed ? (
                    <Tooltip key={item.to} content={item.label} side="right">
                      {linkContent}
                    </Tooltip>
                  ) : (
                    linkContent
                  );
                })}
              </nav>
            </div>

            {/* Menu Group 2: Configuration */}
            <div className="space-y-1 pt-2 border-t border-[var(--border)]">
              {!collapsed && (
                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Konfigurasi
                </p>
              )}
              <nav className="space-y-1" aria-label="Konfigurasi">
                {configItems.map((item) => {
                  const Icon = item.icon;
                  const linkContent = (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        'relative flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-xs font-semibold transition-colors whitespace-nowrap group',
                        item.active
                          ? 'text-[#2A2150] dark:text-white'
                          : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]/60 hover:text-[var(--foreground)]',
                        collapsed && 'justify-center px-0'
                      )}
                    >
                      {item.active && (
                        <motion.div
                          layoutId="sidebar-active-pill"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                          className="absolute inset-0 rounded-[12px] bg-[#B8A9F5]/28 dark:bg-[#B8A9F5]/20 border border-[#B8A9F5]/45 -z-10"
                        />
                      )}
                      <Icon className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );

                  return collapsed ? (
                    <Tooltip key={item.to} content={item.label} side="right">
                      {linkContent}
                    </Tooltip>
                  ) : (
                    linkContent
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Bottom Sidebar Section: Harvard Pro Card + App Version Footer */}
          <div className="p-4 space-y-3 border-t border-[var(--border)]">
            {!collapsed && (
              <div className="p-3.5 rounded-[16px] bg-hero-gradient border border-[var(--border-strong)] space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[8px] bg-[#B8A9F5] text-[#2A2150] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-bold font-heading">Standar Harvard OCS</span>
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                  Gunakan maksimal 1 halaman penuh dan awali setiap bullet dengan kata kerja aksi terukur.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/templates')}
                  className="text-[11px] font-bold text-[#2A2150] dark:text-[#B8A9F5] hover:underline cursor-pointer"
                >
                  Pelajari Template →
                </button>
              </div>
            )}

            <div
              className={cn(
                'flex items-center justify-between text-[11px] text-[var(--muted-foreground)] font-heading tabular-nums',
                collapsed && 'justify-center'
              )}
            >
              {!collapsed ? (
                <>
                  <span>Buat CV Kuy v2.4</span>
                  <span>Tectonic TeX</span>
                </>
              ) : (
                <span>v2.4</span>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0 z-10">
          {/* Topbar (NO duplicate nav tabs — only Breadcrumb, Command Palette Trigger, Theme, Language, Avatar Menu) */}
          <header className="h-16 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md px-5 md:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
            {/* Left: Contextual Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--muted-foreground)] truncate">
              <Link
                to="/"
                className="font-bold font-heading text-[var(--foreground)] hover:text-[#9B86EC] transition-colors"
              >
                Buat CV Kuy
              </Link>
              <span aria-hidden="true">/</span>
              <span className="font-semibold text-[var(--foreground)] truncate">
                {currentPageLabel}
              </span>
            </div>

            {/* Center: Command Palette Trigger */}
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="hidden sm:flex items-center justify-between gap-6 w-full max-w-xs lg:max-w-md h-9 px-3.5 rounded-[12px] bg-[var(--muted)]/75 hover:bg-[var(--muted)] border border-[var(--border-strong)] text-xs text-[var(--muted-foreground)] transition-all cursor-pointer shadow-2xs"
            >
              <span className="inline-flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-[#9B86EC] shrink-0" strokeWidth={2.5} />
                <span className="truncate">Cari atau jalankan perintah…</span>
              </span>
              <Kbd>⌘K</Kbd>
            </button>

            {/* Right: Theme Toggle, Language Switcher, Avatar Menu */}
            <div className="flex items-center gap-2 shrink-0">
              <Tooltip content="Command Palette" kbd="⌘K">
                <button
                  type="button"
                  onClick={() => setCmdOpen(true)}
                  aria-label="Buka Command Palette"
                  className="sm:hidden h-9 w-9 rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] flex items-center justify-center cursor-pointer"
                >
                  <CommandIcon className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </Tooltip>

              <Tooltip content="Ganti Bahasa UI (ID / EN)">
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-xs font-bold font-heading border border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-[#9B86EC]" strokeWidth={2.5} />
                  <span>{prefs.uiLanguage.toUpperCase()}</span>
                </button>
              </Tooltip>

              <Tooltip content={prefs.theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'} kbd="⌘J">
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Ganti tema"
                  className="h-9 w-9 rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--muted)] flex items-center justify-center transition-colors cursor-pointer"
                >
                  {prefs.theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-[#FFF1B8]" strokeWidth={2.5} />
                  ) : (
                    <Moon className="w-4 h-4 text-[#2A2150]" strokeWidth={2.5} />
                  )}
                </button>
              </Tooltip>

              {/* User Avatar Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Menu pengguna"
                    className="h-9 pl-1.5 pr-2.5 rounded-[12px] border border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--muted)] flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-[8px] bg-[#B8A9F5] text-[#2A2150] flex items-center justify-center text-xs font-bold font-heading">
                      {(activeCv?.personalInfo.fullName?.[0] || 'U').toUpperCase()}
                    </div>
                    <span className="hidden lg:inline text-xs font-semibold max-w-[110px] truncate">
                      {activeCv?.personalInfo.fullName?.split(' ')[0] || 'Kandidat'}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
                    <p className="text-xs font-bold font-heading truncate">
                      {activeCv?.personalInfo.fullName || 'Pengguna Buat CV Kuy'}
                    </p>
                    <p className="text-[11px] text-[var(--muted-foreground)] truncate">
                      {activeCv?.personalInfo.email || 'Penyimpanan Lokal Aktif'}
                    </p>
                  </div>
                  <DropdownMenuItem onSelect={handleOpenCreate}>
                    <FilePlus2 className="w-3.5 h-3.5 text-[#9B86EC]" strokeWidth={2.5} />
                    <span>Buat CV Baru...</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate('/dashboard')}>
                    <LayoutDashboard className="w-3.5 h-3.5" strokeWidth={2.5} />
                    <span>Dashboard CV</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate('/templates')}>
                    <BookOpen className="w-3.5 h-3.5" strokeWidth={2.5} />
                    <span>Template Harvard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate('/settings')}>
                    <User className="w-3.5 h-3.5" strokeWidth={2.5} />
                    <span>Pengaturan & Data Lokal</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Animated Page Transition Container */}
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 p-5 sm:p-8 max-w-[1380px] w-full mx-auto"
          >
            {children}
          </motion.main>
        </div>

        {/* Global Command Palette & Create CV Modal */}
        <CommandPalette
          open={cmdOpen}
          onOpenChange={setCmdOpen}
          onOpenCreateModal={handleOpenCreate}
        />
        <CreateCVModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      </div>
    </TooltipProvider>
  );
}
