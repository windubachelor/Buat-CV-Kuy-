import { create } from 'zustand';
import i18n from '../i18n/config';
import {
  type CVData,
  CVDataSchema,
  type HarvardLayoutSettings,
} from '../shared/schema';
import {
  createBlankCV,
  createSampleCVAcademic,
  createSampleCVEnglish,
  createSampleCVIndonesian,
} from '../shared/templates';

const STORAGE_KEY_CVS = 'buatcvkuy_cvs_v1';
const STORAGE_KEY_ACTIVE = 'buatcvkuy_active_id_v1';
const STORAGE_KEY_SETTINGS = 'buatcvkuy_app_prefs_v1';
const STORAGE_KEY_ACTIVITIES = 'buatcvkuy_activities_v1';

export interface ActivityLogItem {
  id: string;
  cvId: string;
  cvTitle: string;
  action: 'created' | 'edited' | 'exported_pdf' | 'imported_json' | 'duplicated';
  timestamp: string;
}

export interface AppPreferences {
  theme: 'light' | 'dark';
  uiLanguage: 'id' | 'en';
  defaultPaperSize: 'a4' | 'letter';
  defaultFontFamily: 'tgtermes' | 'libertinus' | 'ebgaramond';
  defaultFontSize: '10pt' | '10.5pt' | '11pt' | '11.5pt';
}

const DEFAULT_PREFS: AppPreferences = {
  theme: 'light',
  uiLanguage: 'id',
  defaultPaperSize: 'a4',
  defaultFontFamily: 'tgtermes',
  defaultFontSize: '11pt',
};

// Repository Layer (ready to swap with API/DB repository in the future)
export const cvRepository = {
  loadAll(): CVData[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CVS);
      if (!raw) {
        const initial = [
          createSampleCVIndonesian('sample-harvard-id'),
          createSampleCVEnglish('sample-harvard-en'),
        ];
        localStorage.setItem(STORAGE_KEY_CVS, JSON.stringify(initial));
        return initial;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((item) => {
          const check = CVDataSchema.safeParse(item);
          return check.success ? check.data : null;
        })
        .filter((item): item is CVData => item !== null);
    } catch {
      return [createSampleCVIndonesian('sample-harvard-id')];
    }
  },

  saveAll(cvs: CVData[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_CVS, JSON.stringify(cvs));
  },

  loadPrefs(): AppPreferences {
    if (typeof window === 'undefined') return DEFAULT_PREFS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!raw) return DEFAULT_PREFS;
      return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_PREFS;
    }
  },

  savePrefs(prefs: AppPreferences): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(prefs));
    localStorage.setItem('buatcvkuy_ui_lang', prefs.uiLanguage);
  },

  loadActivities(): ActivityLogItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveActivities(items: ActivityLogItem[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(items.slice(0, 15)));
  },
};

interface CVStoreState {
  cvs: CVData[];
  activeCvId: string | null;
  past: CVData[];
  future: CVData[];
  saveStatus: 'saved' | 'saving';
  prefs: AppPreferences;
  activities: ActivityLogItem[];

  // Actions
  setActiveCv: (id: string) => void;
  getActiveCv: () => CVData | undefined;
  updateActiveCv: (updater: (draft: CVData) => CVData, recordHistory?: boolean) => void;
  undo: () => void;
  redo: () => void;
  createCV: (mode: 'blank' | 'sample-id' | 'sample-en' | 'sample-academic', customSettings?: Partial<HarvardLayoutSettings>) => CVData;
  duplicateCV: (id: string) => CVData | undefined;
  renameCV: (id: string, newTitle: string) => void;
  deleteCV: (id: string) => void;
  incrementExportCount: (id: string) => void;
  importCVFromJson: (jsonString: string) => CVData;
  autoFitOnePage: () => void;
  updatePrefs: (partial: Partial<AppPreferences>) => void;
  resetAllLocalData: () => void;
}

let autosaveTimer: ReturnType<typeof setTimeout> | null = null;

function applyThemeToDom(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

const initialPrefs = cvRepository.loadPrefs();
applyThemeToDom(initialPrefs.theme);

export const useCVStore = create<CVStoreState>((set, get) => ({
  cvs: cvRepository.loadAll(),
  activeCvId:
    typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY_ACTIVE) || 'sample-harvard-id'
      : 'sample-harvard-id',
  past: [],
  future: [],
  saveStatus: 'saved',
  prefs: initialPrefs,
  activities: cvRepository.loadActivities(),

  setActiveCv: (id) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ACTIVE, id);
    }
    set({ activeCvId: id, past: [], future: [] });
  },

  getActiveCv: () => {
    const { cvs, activeCvId } = get();
    return cvs.find((c) => c.id === activeCvId) ?? cvs[0];
  },

  updateActiveCv: (updater, recordHistory = true) => {
    const current = get().getActiveCv();
    if (!current) return;

    const updated = updater(structuredClone(current));
    updated.updatedAt = new Date().toISOString();

    set((state) => {
      const nextCvs = state.cvs.map((c) => (c.id === current.id ? updated : c));
      const nextPast = recordHistory
        ? [...state.past.slice(-24), structuredClone(current)]
        : state.past;

      return {
        cvs: nextCvs,
        past: nextPast,
        future: recordHistory ? [] : state.future,
        saveStatus: 'saving',
      };
    });

    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      cvRepository.saveAll(get().cvs);
      set({ saveStatus: 'saved' });
    }, 800);
  },

  undo: () => {
    const { past, future } = get();
    const current = get().getActiveCv();
    if (past.length === 0 || !current) return;

    const previous = past[past.length - 1]!;
    const newPast = past.slice(0, past.length - 1);

    set((state) => {
      const nextCvs = state.cvs.map((c) => (c.id === current.id ? previous : c));
      cvRepository.saveAll(nextCvs);
      return {
        cvs: nextCvs,
        past: newPast,
        future: [structuredClone(current), ...future.slice(0, 24)],
        saveStatus: 'saved',
      };
    });
  },

  redo: () => {
    const { past, future } = get();
    const current = get().getActiveCv();
    if (future.length === 0 || !current) return;

    const next = future[0]!;
    const newFuture = future.slice(1);

    set((state) => {
      const nextCvs = state.cvs.map((c) => (c.id === current.id ? next : c));
      cvRepository.saveAll(nextCvs);
      return {
        cvs: nextCvs,
        past: [...past, structuredClone(current)],
        future: newFuture,
        saveStatus: 'saved',
      };
    });
  },

  createCV: (mode, customSettings) => {
    const { prefs } = get();
    const newId = `cv-${Date.now()}`;
    let created: CVData;

    if (mode === 'sample-id') {
      created = createSampleCVIndonesian(newId);
    } else if (mode === 'sample-en') {
      created = createSampleCVEnglish(newId);
    } else if (mode === 'sample-academic') {
      created = createSampleCVAcademic(newId);
    } else {
      created = createBlankCV(newId, prefs.uiLanguage);
      created.settings.paperSize = prefs.defaultPaperSize;
      created.settings.fontFamily = prefs.defaultFontFamily;
      created.settings.fontSize = prefs.defaultFontSize;
    }

    if (customSettings) {
      created.settings = { ...created.settings, ...customSettings };
    }

    const logItem: ActivityLogItem = {
      id: `act-${Date.now()}`,
      cvId: created.id,
      cvTitle: created.title,
      action: 'created',
      timestamp: new Date().toISOString(),
    };

    set((state) => {
      const nextCvs = [created, ...state.cvs];
      const nextActs = [logItem, ...state.activities].slice(0, 15);
      cvRepository.saveAll(nextCvs);
      cvRepository.saveActivities(nextActs);
      return {
        cvs: nextCvs,
        activeCvId: created.id,
        past: [],
        future: [],
        activities: nextActs,
      };
    });

    return created;
  },

  duplicateCV: (id) => {
    const target = get().cvs.find((c) => c.id === id);
    if (!target) return undefined;
    const copy: CVData = {
      ...structuredClone(target),
      id: `cv-${Date.now()}`,
      title: `${target.title} (Salinan)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      exportCount: 0,
    };

    const logItem: ActivityLogItem = {
      id: `act-${Date.now()}`,
      cvId: copy.id,
      cvTitle: copy.title,
      action: 'duplicated',
      timestamp: new Date().toISOString(),
    };

    set((state) => {
      const nextCvs = [copy, ...state.cvs];
      const nextActs = [logItem, ...state.activities].slice(0, 15);
      cvRepository.saveAll(nextCvs);
      cvRepository.saveActivities(nextActs);
      return { cvs: nextCvs, activities: nextActs };
    });

    return copy;
  },

  renameCV: (id, newTitle) => {
    if (!newTitle.trim()) return;
    set((state) => {
      const nextCvs = state.cvs.map((c) =>
        c.id === id
          ? { ...c, title: newTitle.trim(), updatedAt: new Date().toISOString() }
          : c
      );
      cvRepository.saveAll(nextCvs);
      return { cvs: nextCvs };
    });
  },

  deleteCV: (id) => {
    set((state) => {
      const remaining = state.cvs.filter((c) => c.id !== id);
      const finalCvs =
        remaining.length > 0 ? remaining : [createBlankCV(`cv-${Date.now()}`, state.prefs.uiLanguage)];
      cvRepository.saveAll(finalCvs);
      const nextActive =
        state.activeCvId === id ? finalCvs[0]!.id : state.activeCvId;
      return {
        cvs: finalCvs,
        activeCvId: nextActive,
      };
    });
  },

  incrementExportCount: (id) => {
    set((state) => {
      const target = state.cvs.find((c) => c.id === id);
      const nextCvs = state.cvs.map((c) =>
        c.id === id ? { ...c, exportCount: (c.exportCount || 0) + 1 } : c
      );
      const nextActs = target
        ? [
            {
              id: `act-${Date.now()}`,
              cvId: target.id,
              cvTitle: target.title,
              action: 'exported_pdf' as const,
              timestamp: new Date().toISOString(),
            },
            ...state.activities,
          ].slice(0, 15)
        : state.activities;

      cvRepository.saveAll(nextCvs);
      cvRepository.saveActivities(nextActs);
      return { cvs: nextCvs, activities: nextActs };
    });
  },

  importCVFromJson: (jsonString) => {
    const rawObj = JSON.parse(jsonString);
    const candidate = rawObj.cv ? rawObj.cv : rawObj;
    const validated = CVDataSchema.parse({
      ...candidate,
      id: `cv-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    });

    const logItem: ActivityLogItem = {
      id: `act-${Date.now()}`,
      cvId: validated.id,
      cvTitle: validated.title,
      action: 'imported_json',
      timestamp: new Date().toISOString(),
    };

    set((state) => {
      const nextCvs = [validated, ...state.cvs];
      const nextActs = [logItem, ...state.activities].slice(0, 15);
      cvRepository.saveAll(nextCvs);
      cvRepository.saveActivities(nextActs);
      return {
        cvs: nextCvs,
        activeCvId: validated.id,
        activities: nextActs,
      };
    });

    return validated;
  },

  autoFitOnePage: () => {
    get().updateActiveCv((draft) => {
      // Progressive compact adjustments to fit 1 Harvard page
      draft.settings.templatePreset = 'compact';
      draft.settings.margin = 'compact';
      draft.settings.sectionSpacing = 'compact';
      draft.settings.fontSize = '10pt';
      return draft;
    });
  },

  updatePrefs: (partial) => {
    set((state) => {
      const nextPrefs = { ...state.prefs, ...partial };
      cvRepository.savePrefs(nextPrefs);
      applyThemeToDom(nextPrefs.theme);
      if (partial.uiLanguage) {
        i18n.changeLanguage(partial.uiLanguage);
      }
      return { prefs: nextPrefs };
    });
  },

  resetAllLocalData: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_CVS);
      localStorage.removeItem(STORAGE_KEY_ACTIVE);
      localStorage.removeItem(STORAGE_KEY_ACTIVITIES);
      localStorage.removeItem(STORAGE_KEY_SETTINGS);
    }
    const freshCvs = [
      createSampleCVIndonesian('sample-harvard-id'),
      createSampleCVEnglish('sample-harvard-en'),
    ];
    cvRepository.saveAll(freshCvs);
    applyThemeToDom(DEFAULT_PREFS.theme);
    i18n.changeLanguage(DEFAULT_PREFS.uiLanguage);
    set({
      cvs: freshCvs,
      activeCvId: freshCvs[0]!.id,
      past: [],
      future: [],
      prefs: DEFAULT_PREFS,
      activities: [],
    });
  },
}));
