import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { create } from 'zustand';
import i18n from '../i18n/config';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  type CVData,
  CVDataSchema,
  type HarvardLayoutSettings,
} from '../shared/schema';
import {
  createBlankCV,
  createSampleCoverLetter1Indonesian,
  createSampleCVAcademic,
  createSampleCVEnglish,
  createSampleCVIndonesian,
  createSampleJakesResume,
  createSampleSimpleLetter,
  type SampleCreationMode,
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

export interface AuthUserSummary {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

const DEFAULT_PREFS: AppPreferences = {
  theme: 'light',
  uiLanguage: 'id',
  defaultPaperSize: 'a4',
  defaultFontFamily: 'tgtermes',
  defaultFontSize: '11pt',
};

function sanitizeDocId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
  return cleaned || `cv-${Date.now()}`;
}

function sanitizeTitle(rawTitle: string): string {
  const trimmed = rawTitle.trim().slice(0, 150);
  return trimmed || 'CV Harvard Tanpa Judul';
}

function serializeCVPayloadForFirestore(cv: CVData): Record<string, unknown> {
  // Convert to plain JSON-compatible map (no undefined values) for Firestore native map storage
  return JSON.parse(
    JSON.stringify({
      personalInfo: cv.personalInfo,
      summary: cv.summary,
      education: cv.education,
      experience: cv.experience,
      leadership: cv.leadership,
      projects: cv.projects,
      awards: cv.awards,
      certifications: cv.certifications,
      publications: cv.publications,
      skills: cv.skills,
      customSections: cv.customSections,
      coverLetter: cv.coverLetter,
      sectionOrder: cv.sectionOrder,
      settings: cv.settings,
    })
  ) as Record<string, unknown>;
}

async function createFirestoreCVDoc(uid: string, cv: CVData): Promise<void> {
  const safeId = sanitizeDocId(cv.id);
  const path = `users/${uid}/cvs/${safeId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'cvs', safeId), {
      id: safeId,
      ownerId: uid,
      title: sanitizeTitle(cv.title),
      templatePreset: cv.settings.templatePreset || 'classic',
      exportCount: Math.max(0, Math.floor(cv.exportCount || 0)),
      payload: serializeCVPayloadForFirestore(cv),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

async function updateFirestoreCVDoc(uid: string, cv: CVData): Promise<void> {
  const safeId = sanitizeDocId(cv.id);
  const path = `users/${uid}/cvs/${safeId}`;
  try {
    await updateDoc(doc(db, 'users', uid, 'cvs', safeId), {
      title: sanitizeTitle(cv.title),
      templatePreset: cv.settings.templatePreset || 'classic',
      exportCount: Math.max(0, Math.floor(cv.exportCount || 0)),
      payload: serializeCVPayloadForFirestore(cv),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    // If the document doesn't exist yet on the server, create it
    if (error instanceof Error && error.message.includes('No document to update')) {
      await createFirestoreCVDoc(uid, cv);
      return;
    }
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

async function deleteFirestoreCVDoc(uid: string, cvId: string): Promise<void> {
  const safeId = sanitizeDocId(cvId);
  const path = `users/${uid}/cvs/${safeId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'cvs', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

async function updateFirestoreUserPrefs(
  uid: string,
  displayName: string,
  prefs: AppPreferences
): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      displayName: (displayName || 'Kandidat').slice(0, 120),
      theme: prefs.theme,
      uiLanguage: prefs.uiLanguage,
      defaultPaperSize: prefs.defaultPaperSize,
      defaultFontFamily: prefs.defaultFontFamily,
      defaultFontSize: prefs.defaultFontSize,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Local Fallback & Cache Repository Layer
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
  currentUser: AuthUserSummary | null;
  authReady: boolean;

  // Actions
  setActiveCv: (id: string) => void;
  getActiveCv: () => CVData | undefined;
  updateActiveCv: (updater: (draft: CVData) => CVData, recordHistory?: boolean) => void;
  undo: () => void;
  redo: () => void;
  createCV: (
    mode: SampleCreationMode,
    customSettings?: Partial<HarvardLayoutSettings>
  ) => CVData;
  duplicateCV: (id: string) => CVData | undefined;
  renameCV: (id: string, newTitle: string) => void;
  deleteCV: (id: string) => void;
  incrementExportCount: (id: string) => void;
  importCVFromJson: (jsonString: string) => CVData;
  autoFitOnePage: () => void;
  updatePrefs: (partial: Partial<AppPreferences>) => void;
  resetAllLocalData: () => void;
  signOutUser: () => Promise<void>;
}

let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
let unsubscribeCvsSnapshot: (() => void) | null = null;

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
  currentUser: null,
  authReady: false,

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
      const state = get();
      cvRepository.saveAll(state.cvs);
      const latestActive = state.cvs.find((c) => c.id === current.id);
      if (state.currentUser && latestActive) {
        void updateFirestoreCVDoc(state.currentUser.uid, latestActive).finally(() => {
          set({ saveStatus: 'saved' });
        });
      } else {
        set({ saveStatus: 'saved' });
      }
    }, 750);
  },

  undo: () => {
    const { past, future, currentUser } = get();
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

    if (currentUser) {
      void updateFirestoreCVDoc(currentUser.uid, previous);
    }
  },

  redo: () => {
    const { past, future, currentUser } = get();
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

    if (currentUser) {
      void updateFirestoreCVDoc(currentUser.uid, next);
    }
  },

  createCV: (mode, customSettings) => {
    const { prefs, currentUser } = get();
    const newId = `cv-${Date.now()}`;
    let created: CVData;

    if (mode === 'sample-id') {
      created = createSampleCVIndonesian(newId);
    } else if (mode === 'sample-en') {
      created = createSampleCVEnglish(newId);
    } else if (mode === 'sample-academic') {
      created = createSampleCVAcademic(newId);
    } else if (mode === 'sample-jakes') {
      created = createSampleJakesResume(newId);
    } else if (mode === 'sample-cover-letter-1') {
      created = createSampleCoverLetter1Indonesian(newId);
    } else if (mode === 'sample-simple-letter') {
      created = createSampleSimpleLetter(newId);
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

    if (currentUser) {
      void createFirestoreCVDoc(currentUser.uid, created);
    }

    return created;
  },

  duplicateCV: (id) => {
    const { currentUser } = get();
    const target = get().cvs.find((c) => c.id === id);
    if (!target) return undefined;
    const copy: CVData = {
      ...structuredClone(target),
      id: `cv-${Date.now()}`,
      title: sanitizeTitle(`${target.title} (Salinan)`),
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

    if (currentUser) {
      void createFirestoreCVDoc(currentUser.uid, copy);
    }

    return copy;
  },

  renameCV: (id, newTitle) => {
    if (!newTitle.trim()) return;
    const safeTitle = sanitizeTitle(newTitle);
    const { currentUser } = get();
    set((state) => {
      const nextCvs = state.cvs.map((c) =>
        c.id === id
          ? { ...c, title: safeTitle, updatedAt: new Date().toISOString() }
          : c
      );
      cvRepository.saveAll(nextCvs);
      const updated = nextCvs.find((c) => c.id === id);
      if (currentUser && updated) {
        void updateFirestoreCVDoc(currentUser.uid, updated);
      }
      return { cvs: nextCvs };
    });
  },

  deleteCV: (id) => {
    const { currentUser } = get();
    set((state) => {
      const remaining = state.cvs.filter((c) => c.id !== id);
      let replacement: CVData | null = null;
      if (remaining.length === 0) {
        replacement = createBlankCV(`cv-${Date.now()}`, state.prefs.uiLanguage);
      }
      const finalCvs = replacement ? [replacement] : remaining;
      cvRepository.saveAll(finalCvs);
      const nextActive =
        state.activeCvId === id ? finalCvs[0]!.id : state.activeCvId;

      if (currentUser) {
        void deleteFirestoreCVDoc(currentUser.uid, id);
        if (replacement) {
          void createFirestoreCVDoc(currentUser.uid, replacement);
        }
      }

      return {
        cvs: finalCvs,
        activeCvId: nextActive,
      };
    });
  },

  incrementExportCount: (id) => {
    const { currentUser } = get();
    set((state) => {
      const target = state.cvs.find((c) => c.id === id);
      const nextCvs = state.cvs.map((c) =>
        c.id === id ? { ...c, exportCount: (c.exportCount || 0) + 1 } : c
      );
      const updated = nextCvs.find((c) => c.id === id);
      if (currentUser && updated) {
        void updateFirestoreCVDoc(currentUser.uid, updated);
      }

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
    const { currentUser } = get();
    const rawObj = JSON.parse(jsonString);
    const candidate = rawObj.cv ? rawObj.cv : rawObj;
    const validated = CVDataSchema.parse({
      ...candidate,
      id: `cv-${Date.now()}`,
      title: sanitizeTitle(candidate.title || 'CV Harvard Impor'),
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

    if (currentUser) {
      void createFirestoreCVDoc(currentUser.uid, validated);
    }

    return validated;
  },

  autoFitOnePage: () => {
    get().updateActiveCv((draft) => {
      draft.settings.templatePreset = 'compact';
      draft.settings.margin = 'compact';
      draft.settings.sectionSpacing = 'compact';
      draft.settings.fontSize = '10pt';
      return draft;
    });
  },

  updatePrefs: (partial) => {
    const { currentUser } = get();
    set((state) => {
      const nextPrefs = { ...state.prefs, ...partial };
      cvRepository.savePrefs(nextPrefs);
      applyThemeToDom(nextPrefs.theme);
      if (partial.uiLanguage) {
        i18n.changeLanguage(partial.uiLanguage);
      }
      if (currentUser) {
        void updateFirestoreUserPrefs(
          currentUser.uid,
          currentUser.displayName || 'Kandidat',
          nextPrefs
        );
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

  signOutUser: async () => {
    if (unsubscribeCvsSnapshot) {
      unsubscribeCvsSnapshot();
      unsubscribeCvsSnapshot = null;
    }
    await firebaseSignOut(auth);
    set({ currentUser: null });
  },
}));

// Initialize Firebase Auth & Real-Time Firestore Listener on Client Boot
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, async (user) => {
    if (unsubscribeCvsSnapshot) {
      unsubscribeCvsSnapshot();
      unsubscribeCvsSnapshot = null;
    }

    if (!user) {
      useCVStore.setState({ currentUser: null, authReady: true });
      return;
    }

    const summary: AuthUserSummary = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Kandidat',
      photoURL: user.photoURL,
    };

    useCVStore.setState({ currentUser: summary, authReady: true });

    // Ensure UserProfile document exists in Firestore (/users/{uid})
    const userDocRef = doc(db, 'users', user.uid);
    const userPath = `users/${user.uid}`;
    try {
      const snap = await getDoc(userDocRef);
      const currentState = useCVStore.getState();

      if (!snap.exists()) {
        // Atomic initial batch: create /users/{uid} + seed initial CVs in /users/{uid}/cvs/{cvId}
        const batch = writeBatch(db);
        batch.set(userDocRef, {
          uid: user.uid,
          displayName: (summary.displayName || 'Kandidat').slice(0, 120),
          theme: currentState.prefs.theme,
          uiLanguage: currentState.prefs.uiLanguage,
          defaultPaperSize: currentState.prefs.defaultPaperSize,
          defaultFontFamily: currentState.prefs.defaultFontFamily,
          defaultFontSize: currentState.prefs.defaultFontSize,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        const seedCvs =
          currentState.cvs.length > 0
            ? currentState.cvs.slice(0, 6)
            : [
                createSampleCVIndonesian('sample-harvard-id'),
                createSampleCVEnglish('sample-harvard-en'),
              ];

        for (const cv of seedCvs) {
          const safeId = sanitizeDocId(cv.id);
          const cvRef = doc(db, 'users', user.uid, 'cvs', safeId);
          batch.set(cvRef, {
            id: safeId,
            ownerId: user.uid,
            title: sanitizeTitle(cv.title),
            templatePreset: cv.settings.templatePreset || 'classic',
            exportCount: Math.max(0, Math.floor(cv.exportCount || 0)),
            payload: serializeCVPayloadForFirestore(cv),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        await batch.commit();
      } else {
        const userData = snap.data();
        if (userData) {
          const syncedPrefs: AppPreferences = {
            theme: userData.theme === 'dark' ? 'dark' : 'light',
            uiLanguage: userData.uiLanguage === 'en' ? 'en' : 'id',
            defaultPaperSize: userData.defaultPaperSize === 'letter' ? 'letter' : 'a4',
            defaultFontFamily:
              userData.defaultFontFamily === 'libertinus' ||
              userData.defaultFontFamily === 'ebgaramond'
                ? userData.defaultFontFamily
                : 'tgtermes',
            defaultFontSize:
              userData.defaultFontSize === '10pt' ||
              userData.defaultFontSize === '10.5pt' ||
              userData.defaultFontSize === '11.5pt'
                ? userData.defaultFontSize
                : '11pt',
          };
          cvRepository.savePrefs(syncedPrefs);
          applyThemeToDom(syncedPrefs.theme);
          i18n.changeLanguage(syncedPrefs.uiLanguage);
          useCVStore.setState({ prefs: syncedPrefs });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, userPath);
    }

    // Subscribe to real-time updates on /users/{uid}/cvs
    const cvsColPath = `users/${user.uid}/cvs`;
    unsubscribeCvsSnapshot = onSnapshot(
      collection(db, 'users', user.uid, 'cvs'),
      (snapshot) => {
        if (snapshot.empty) return;
        const loadedCvs: CVData[] = [];

        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const payload = (d.payload || {}) as Record<string, unknown>;
          const candidate = {
            ...payload,
            id: d.id || docSnap.id,
            title: d.title || 'CV Harvard',
            exportCount: typeof d.exportCount === 'number' ? d.exportCount : 0,
            createdAt:
              d.createdAt && typeof d.createdAt.toDate === 'function'
                ? d.createdAt.toDate().toISOString()
                : new Date().toISOString(),
            updatedAt:
              d.updatedAt && typeof d.updatedAt.toDate === 'function'
                ? d.updatedAt.toDate().toISOString()
                : new Date().toISOString(),
          };
          const parsed = CVDataSchema.safeParse(candidate);
          if (parsed.success) {
            loadedCvs.push(parsed.data);
          }
        });

        if (loadedCvs.length > 0) {
          loadedCvs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
          cvRepository.saveAll(loadedCvs);
          useCVStore.setState((state) => ({
            cvs: loadedCvs,
            activeCvId:
              state.activeCvId && loadedCvs.some((c) => c.id === state.activeCvId)
                ? state.activeCvId
                : loadedCvs[0]!.id,
          }));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, cvsColPath);
      }
    );
  });
}
