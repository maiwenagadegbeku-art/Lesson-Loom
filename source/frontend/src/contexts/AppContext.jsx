import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const AppContext = createContext(null);

const STORAGE_KEY = 'le-sequenceur-data-v2';
const PREFS_KEY = 'le-sequenceur-prefs-v1';
const LEGACY_KEY = 'le-sequenceur-data-v1';

const defaultData = {
  sequences: [],
  progressions: [],
  calendar: { events: [], workSaturday: false },
  library: {
    strategies: [],
    supports: [],
    grilles: []
  }
};

const defaultPrefs = { theme: 'light', welcomed: false };

const loadJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
};

const migrate = () => {
  const v2raw = localStorage.getItem(STORAGE_KEY);
  if (v2raw) return loadJSON(STORAGE_KEY, defaultData);
  const v1raw = localStorage.getItem(LEGACY_KEY);
  if (v1raw) {
    try {
      const v1 = JSON.parse(v1raw);
      return { ...defaultData, ...v1, library: defaultData.library };
    } catch {
      return defaultData;
    }
  }
  return defaultData;
};

export const AppProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const d = migrate();
    if (!d.library) d.library = defaultData.library;
    return d;
  });
  const [prefs, setPrefs] = useState(() => loadJSON(PREFS_KEY, defaultPrefs));
  const [activeView, setActiveView] = useState('seq');
  // Cible de navigation : si on clique "Séances" depuis l'éditeur d'une séquence,
  // on stocke l'ID ici pour que SeancesView ouvre directement les séances de cette séquence.
  const [targetSeqId, setTargetSeqId] = useState(null);
  // État de l'import partagé (depuis #import=… dans l'URL)
  const [sharedImport, setSharedImport] = useState(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }, [data]);
  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    document.documentElement.setAttribute('data-theme', prefs.theme);
    document.body.setAttribute('data-theme', prefs.theme);
  }, [prefs]);

  // Au chargement : si l'URL contient #import=<base64>, on décode la séquence
  // partagée et on prépare une demande de confirmation à l'utilisateur.
  // Le hash peut être temporairement vidé par d'autres scripts (preview Emergent…)
  // avant d'être restauré : on re-vérifie quelques fois si nécessaire.
  useEffect(() => {
    let cancelled = false;
    const tryImport = () => {
      if (cancelled) return false;
      try {
        const hash = (typeof window !== 'undefined' && window.__LESSON_LOOM_INITIAL_HASH)
          || (typeof window !== 'undefined' && window.location.hash)
          || '';
        const m = hash.match(/[#&]import=([^&]+)/);
        if (!m) return false;
        const b64 = decodeURIComponent(m[1]);
        const json = decodeURIComponent(escape(atob(b64)));
        const incoming = JSON.parse(json);
        if (incoming && typeof incoming === 'object' && (incoming.id || incoming.titre)) {
          setSharedImport(incoming);
        }
        try {
          window.__LESSON_LOOM_INITIAL_HASH = '';
          const cleanUrl = window.location.pathname + window.location.search;
          window.history.replaceState(null, '', cleanUrl);
        } catch (e) {
          console.warn('[LessonLoom] Impossible de nettoyer le hash :', e);
        }
        return true;
      } catch (e) {
        console.warn('[LessonLoom] Import partagé invalide:', e);
        return false;
      }
    };

    // Essai immédiat
    if (tryImport()) return;

    // Re-essaie quand le hash change (cas où un script externe le restaure)
    const onHashChange = () => { if (tryImport()) window.removeEventListener('hashchange', onHashChange); };
    window.addEventListener('hashchange', onHashChange);

    // Plan B : re-essaie 5×, espacé de 250 ms, au cas où le hash reviendrait
    // sans déclencher d'événement hashchange.
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (tryImport() || attempts > 5) clearInterval(interval);
    }, 250);

    return () => {
      cancelled = true;
      window.removeEventListener('hashchange', onHashChange);
      clearInterval(interval);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setPrefs((p) => ({ ...p, theme: p.theme === 'light' ? 'dark' : 'light' }));
  }, []); // setPrefs est stable (useState setter), aucune dépendance externe

  // Les callbacks ci-dessous utilisent tous setData(d => ...) (forme fonctionnelle).
  // L'état frais est toujours accessible via l'updater, donc PAS BESOIN d'ajouter
  // `data` aux dépendances (ce serait même contre-productif : recréerait la fonction
  // à chaque modification de data, invalidant les références dans les composants enfants).
  const upsertSequence = useCallback((seq) => {
    setData((d) => {
      const idx = d.sequences.findIndex((s) => s.id === seq.id);
      const next = { ...seq, updatedAt: Date.now() };
      const sequences = idx >= 0 ? d.sequences.map((s, i) => (i === idx ? next : s)) : [...d.sequences, next];
      return { ...d, sequences };
    });
  }, []);

  const deleteSequence = useCallback((id) => {
    setData((d) => ({
      ...d,
      sequences: d.sequences.filter((s) => s.id !== id),
      progressions: d.progressions.map((p) => ({ ...p, sequenceIds: p.sequenceIds.filter((sid) => sid !== id) })),
      calendar: { ...d.calendar, events: d.calendar.events.filter((e) => e.sequenceId !== id) }
    }));
  }, []);

  const duplicateSequence = useCallback((id) => {
    setData((d) => {
      const src = d.sequences.find((s) => s.id === id);
      if (!src) return d;
      const copy = { ...src, id: 'seq_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), titre: (src.titre || 'Sans titre') + ' (copie)', updatedAt: Date.now() };
      return { ...d, sequences: [...d.sequences, copy] };
    });
  }, []);

  const upsertProgression = useCallback((prog) => {
    setData((d) => {
      const idx = d.progressions.findIndex((p) => p.id === prog.id);
      const progressions = idx >= 0 ? d.progressions.map((p, i) => (i === idx ? prog : p)) : [...d.progressions, prog];
      return { ...d, progressions };
    });
  }, []);
  const deleteProgression = useCallback((id) => {
    setData((d) => ({ ...d, progressions: d.progressions.filter((p) => p.id !== id) }));
  }, []);

  const upsertCalEvent = useCallback((event) => {
    setData((d) => {
      const idx = d.calendar.events.findIndex((e) => e.id === event.id);
      const events = idx >= 0 ? d.calendar.events.map((e, i) => (i === idx ? event : e)) : [...d.calendar.events, event];
      return { ...d, calendar: { ...d.calendar, events } };
    });
  }, []);
  const deleteCalEvent = useCallback((id) => {
    setData((d) => ({ ...d, calendar: { ...d.calendar, events: d.calendar.events.filter((e) => e.id !== id) } }));
  }, []);
  const setWorkSaturday = useCallback((val) => {
    setData((d) => ({ ...d, calendar: { ...d.calendar, workSaturday: val } }));
  }, []);

  // Library
  const addToLibrary = useCallback((category, item) => {
    setData((d) => {
      const lib = d.library || defaultData.library;
      const newItem = { ...item, id: item.id || 'lib_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5), createdAt: Date.now() };
      return { ...d, library: { ...lib, [category]: [...(lib[category] || []), newItem] } };
    });
  }, []);
  const removeFromLibrary = useCallback((category, id) => {
    setData((d) => {
      const lib = d.library || defaultData.library;
      return { ...d, library: { ...lib, [category]: (lib[category] || []).filter((x) => x.id !== id) } };
    });
  }, []);
  const updateLibraryItem = useCallback((category, id, patch) => {
    setData((d) => {
      const lib = d.library || defaultData.library;
      return { ...d, library: { ...lib, [category]: (lib[category] || []).map((x) => x.id === id ? { ...x, ...patch } : x) } };
    });
  }, []);

  const exportAllData = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sequenceur-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importAllData = useCallback((json) => {
    try {
      const parsed = typeof json === 'string' ? JSON.parse(json) : json;
      setData((d) => ({ ...d, ...parsed, library: { ...defaultData.library, ...(parsed.library || {}) } }));
      return true;
    } catch {
      return false;
    }
  }, []);

  // Confirme l'import d'une séquence partagée reçue via #import=…
  // On lui attribue toujours un nouvel ID pour éviter d'écraser une séquence existante.
  const confirmSharedImport = useCallback(() => {
    setData((d) => {
      if (!sharedImport) return d;
      const newId = 'seq_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
      const imported = { ...sharedImport, id: newId, updatedAt: Date.now() };
      return { ...d, sequences: [...d.sequences, imported] };
    });
    setSharedImport(null);
  }, [sharedImport]);

  const cancelSharedImport = useCallback(() => setSharedImport(null), []);

  const value = {
    data, setData, prefs, setPrefs,
    activeView, setActiveView,
    targetSeqId, setTargetSeqId,
    toggleTheme,
    upsertSequence, deleteSequence, duplicateSequence,
    upsertProgression, deleteProgression,
    upsertCalEvent, deleteCalEvent, setWorkSaturday,
    addToLibrary, removeFromLibrary, updateLibraryItem,
    exportAllData, importAllData,
    sharedImport, confirmSharedImport, cancelSharedImport
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

export const newSequence = () => ({
  id: 'seq_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
  niveau: '',
  lv: 'LVAB',
  dnlLevel: '',
  dnlDiscipline: '',
  annee: '',
  numero: '',
  nbSeances: '',
  sousTitre: '',
  mode: '',
  titre: '',
  axe: '',
  axeMineur: '',
  objectifCulturel: '',
  problematique: '',
  descripteurCible: '',
  imgUrl: '',
  imgShape: 'banner',
  font: "'Plus Jakarta Sans', sans-serif",
  fontSize: 1,
  nomenclatureMode: 'cecrl',
  activitesFR: {
    CE: { niveauCible: '', strategies: '', supports: '' },
    EOC: { niveauCible: '', strategies: '', supports: '' },
    EOI: { niveauCible: '', strategies: '', supports: '' },
    CO: { niveauCible: '', strategies: '', supports: '' },
    EE: { niveauCible: '', strategies: '', supports: '' },
    MED: { niveauCible: '', strategies: '', supports: '' }
  },
  sociolinguistique: '',
  culturelLong: '',
  tice: '',
  tags: {
    culture: [], task: [], inter: [],
    grammar: [], lexique: [], phono: [], pragma: [], docs: [],
    comp_co: [], comp_ce: [],
    comp_po: [], comp_pe: [], comp_io: [], comp_ie: [], comp_med: []
  },
  evaluations: { formatives: [], sommatives: [], notesAttendues: [] },
  grilles: [],
  supportsPlus: [],
  issues: [],
  seances: [],
  updatedAt: Date.now()
});

export const hydrateSequence = (seq) => {
  const blank = newSequence();
  const incomingTags = seq.tags || {};
  // Migration : les anciennes séquences peuvent avoir un `comp_cav` (Compréhension
  // audiovisuelle). On fusionne ces entrées dans `comp_co` puisque la CAV est
  // désormais une sous-compétence de la CO.
  const mergedCompCo = [...(incomingTags.comp_co || []), ...(incomingTags.comp_cav || [])];
  const cleanedTags = { ...incomingTags, comp_co: mergedCompCo };
  delete cleanedTags.comp_cav;
  return {
    ...blank,
    ...seq,
    activitesFR: { ...blank.activitesFR, ...(seq.activitesFR || {}) },
    tags: { ...blank.tags, ...cleanedTags },
    evaluations: { ...blank.evaluations, ...(seq.evaluations || {}) },
    grilles: seq.grilles || [],
    supportsPlus: seq.supportsPlus || [],
    issues: seq.issues || []
  };
};

export const newGrille = (template = 'cecrl') => {
  const id = 'gr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5);
  if (template === 'cecrl') {
    return {
      id,
      name: 'Nouvelle grille CECRL',
      type: 'cecrl',
      competence: 'EE',
      iCan: false,
      totalPoints: 15,
      rows: ['A1', 'A2', 'A2+', 'B1', 'B1+'],
      rowsPoints: [],
      cols: ['Traitement du sujet', 'Cohérence et cohésion', 'Recevabilité linguistique'],
      colsPoints: [5, 4, 5],
      cells: {}
    };
  }
  return {
    id,
    name: 'Nouvelle grille Critères',
    type: 'critere',
    competence: 'EE',
    iCan: true,
    totalPoints: 15,
    rows: ['Vocabulary', 'Language accuracy', 'Handling of the subject', 'Respect of instructions'],
    rowsPoints: [4, 4.5, 5, 1.5],
    cols: ['A2', 'A2+', 'B1'],
    colsPoints: [],
    cells: {}
  };
};
