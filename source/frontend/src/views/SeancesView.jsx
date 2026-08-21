import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { ChevronLeft, Plus, Trash2, Copy, Clock, BookOpen, Image as ImageIcon, Type, Bold, Italic, Underline, List, ListOrdered, Eraser, Link2, FileDown, GripVertical } from 'lucide-react';
import DOMPurify from 'dompurify';

// Configuration DOMPurify : autorise les tags HTML basiques de l'éditeur (b, i, u, ul, ol, li, a, br, p)
// + protège contre XSS (script, iframe, on* event handlers, javascript: urls).
const SANITIZE_OPTS = { ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'br', 'p', 'span', 'div'], ALLOWED_ATTR: ['href', 'target', 'rel', 'style'], ALLOW_DATA_ATTR: false };
const safeHtml = (raw) => DOMPurify.sanitize(raw || '', SANITIZE_OPTS);
import { NIVEAUX_LYCEE, COMPETENCES, CECRL_DESCRIPTORS, PRAG_SUBCOMPS, PRAG_DESCRIPTORS, FONTS, getGrammarFor, getPhonoFor } from '../data/sequenceurData';
import SeancePreview from '../components/SeancePreview';
import ResizableGutter from '../components/ResizableGutter';

const grammarKeyOf = (niveau, lv) => {
  if (!niveau) return '';
  if (/_AMC$|_LLCER$/.test(niveau)) return niveau;
  if (/^(Seconde|Première|Terminale)$/.test(niveau)) return `${niveau}_${lv || 'LVAB'}`;
  return niveau;
};

// Éditeur de texte riche minimal : contentEditable + execCommand (gras/italique/listes)
const RichTextEditor = ({ value, onChange, placeholder, font, fontScale = 1, testId }) => {
  const ref = useRef(null);
  const lastValueRef = useRef(value || '');

  useEffect(() => {
    if (ref.current && (value || '') !== lastValueRef.current) {
      // Sanitize avant injection : protège contre les balises <script>, attrs on*, javascript: urls.
      ref.current.innerHTML = safeHtml(value);
      lastValueRef.current = value || '';
    }
  }, [value]);

  const exec = (cmd, arg) => {
    ref.current?.focus();
    try {
      document.execCommand(cmd, false, arg);
    } catch (e) {
      // execCommand est déprécié et peut throw si l'argument n'est pas reconnu
      // par le navigateur. Pas de fallback nécessaire — on log juste pour debug.
      console.warn('[RichTextEditor] execCommand a échoué :', cmd, e);
    }
    const html = ref.current?.innerHTML || '';
    lastValueRef.current = html;
    onChange(html);
  };

  const onInput = () => {
    const html = ref.current?.innerHTML || '';
    lastValueRef.current = html;
    onChange(html);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, padding: 6, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px 8px 0 0', borderBottom: 'none' }}>
        <button type="button" onClick={() => exec('bold')} title="Gras" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', fontWeight: 700 }}><Bold size={13} /></button>
        <button type="button" onClick={() => exec('italic')} title="Italique" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px' }}><Italic size={13} /></button>
        <button type="button" onClick={() => exec('underline')} title="Souligné" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px' }}><Underline size={13} /></button>
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
        <button type="button" onClick={() => exec('insertUnorderedList')} title="Liste à puces" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px' }}><List size={13} /></button>
        <button type="button" onClick={() => exec('insertOrderedList')} title="Liste numérotée" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px' }}><ListOrdered size={13} /></button>
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
        <button type="button" onClick={() => exec('removeFormat')} title="Retirer le formatage" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px' }}><Eraser size={13} /></button>
      </div>
      <div
        ref={ref}
        data-testid={testId}
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        data-placeholder={placeholder}
        style={{
          minHeight: 80, padding: 10,
          border: '1px solid var(--border)', borderRadius: '0 0 8px 8px',
          background: 'var(--card)', outline: 'none',
          fontFamily: font || 'inherit', fontSize: 14 * fontScale, lineHeight: 1.5
        }}
      />
      <style>{`[contentEditable=true]:empty::before { content: attr(data-placeholder); color: var(--text-muted); pointer-events: none; }`}</style>
    </div>
  );
};

// SectionBox & Pill définis AU NIVEAU MODULE pour éviter le re-mount à chaque keystroke
// (sinon l'input perd le focus et la page "saute" quand on tape dans Lexique).
const SectionBox = ({ children, color = 'var(--accent2)', icon, title, defaultOpen = true, compact = false }) => (
  <details open={defaultOpen} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: compact ? '4px 8px' : '10px 14px', marginBottom: compact ? 6 : 12, background: 'var(--card)' }}>
    <summary style={{ cursor: 'pointer', fontSize: compact ? 10 : 11, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color, userSelect: 'none' }}>{icon} {title}</summary>
    <div style={{ paddingTop: compact ? 4 : 10 }}>{children}</div>
  </details>
);

const Pill = ({ text, level, color, onRemove }) => (
  <span className={`tag ${color}`} style={{ marginRight: 4, marginBottom: 4 }}>
    {level && <span className="tag-level">{level}</span>}
    <span className="tl">{text}</span>
    <button onClick={onRemove} style={{ marginLeft: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, padding: 0 }}>×</button>
  </span>
);

const SeancesView = () => {
  const { data, upsertSequence, targetSeqId, setTargetSeqId } = useApp();
  const [stage, setStage] = useState('home');
  const [activeLevel, setActiveLevel] = useState(null);
  const [activeSeqId, setActiveSeqId] = useState(null);
  const [activeSeanceId, setActiveSeanceId] = useState(null);

  // Quand on arrive depuis l'éditeur d'une séquence : on saute directement à ses séances
  React.useEffect(() => {
    if (targetSeqId) {
      const seq = data.sequences.find(s => s.id === targetSeqId);
      if (seq) {
        setActiveLevel(seq.niveau);
        setActiveSeqId(seq.id);
        setActiveSeanceId(null);
        setStage('seance-list');
      }
      setTargetSeqId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetSeqId]);

  // States pour les saisies en cours dans l'éditeur de séance
  const [lexFree, setLexFree] = useState('');
  const [gramSel, setGramSel] = useState('');
  const [gramFree, setGramFree] = useState('');
  const [gramAll, setGramAll] = useState(false);
  const [phonSel, setPhonSel] = useState('');
  const [phonFree, setPhonFree] = useState('');
  const [phonAll, setPhonAll] = useState(false);
  const [pragFree, setPragFree] = useState('');
  const [pragSub, setPragSub] = useState('');
  const [pragDesc, setPragDesc] = useState('');
  const [compCode, setCompCode] = useState('CO');
  const [compSub, setCompSub] = useState('');
  const [compDesc, setCompDesc] = useState('');

  const activeSeq = data.sequences.find(s => s.id === activeSeqId);
  const activeSeance = activeSeq?.seances?.find(se => se.id === activeSeanceId);

  const counts = useMemo(() => {
    const c = {};
    NIVEAUX_LYCEE.forEach(n => c[n.value] = 0);
    data.sequences.forEach(s => { if (s.niveau && c[s.niveau] !== undefined) c[s.niveau] += (s.seances || []).length; });
    return c;
  }, [data.sequences]);

  const newSeance = () => ({
    id: 'sea_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    titre: '', objectif: '',
    imageUrl: '', imageShape: 'banner',
    font: '', fontScale: 1,
    objLex: [], objGram: [], objPhon: [], objPrag: [],
    compActs: [],
    supportsList: [{ id: 's_' + Date.now(), label: '', url: '' }],
    activites: [],
    trace: '', devoirs: '',
    parentObjectives: [],
    createdAt: Date.now()
  });

  const addSeance = () => {
    if (!activeSeq) return;
    const s = newSeance();
    // Titre laissé vide : le N° d'ordre est affiché dans l'étiquette du badge.
    // Le prof peut donner un vrai titre pédagogique (ex : « Découverte du document »).
    upsertSequence({ ...activeSeq, seances: [...(activeSeq.seances || []), s] });
    setActiveSeanceId(s.id);
    setStage('seance');
  };

  const updateSeance = (patch) => {
    if (!activeSeq || !activeSeance) return;
    const seances = activeSeq.seances.map(se => se.id === activeSeance.id ? { ...se, ...patch } : se);
    upsertSequence({ ...activeSeq, seances });
  };

  const deleteSeance = (id) => {
    if (!activeSeq) return;
    upsertSequence({ ...activeSeq, seances: activeSeq.seances.filter(s => s.id !== id) });
  };

  const duplicateSeance = (id) => {
    if (!activeSeq) return;
    const src = activeSeq.seances.find(s => s.id === id);
    if (!src) return;
    const copy = { ...src, id: 'sea_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6), titre: src.titre + ' (copie)', createdAt: Date.now() };
    upsertSequence({ ...activeSeq, seances: [...activeSeq.seances, copy] });
  };

  // ─── Activités chronométrées
  const addActivity = () => {
    if (!activeSeance) return;
    updateSeance({ activites: [...(activeSeance.activites || []), { id: 'a_' + Date.now(), label: '', duree: 5, contenu: '' }] });
  };
  const updateActivity = (idx, patch) => {
    updateSeance({ activites: (activeSeance.activites || []).map((a, i) => i === idx ? { ...a, ...patch } : a) });
  };
  const removeActivity = (idx) => {
    updateSeance({ activites: (activeSeance.activites || []).filter((_, i) => i !== idx) });
  };
  const totalDuration = (activeSeance?.activites || []).reduce((a, b) => a + (parseInt(b.duree, 10) || 0), 0);

  // ─── Objectifs : ajout/suppression dans une liste de la séance + héritage dans la séquence
  // IMPORTANT : on combine la maj `seances` + `tags` dans UN SEUL upsertSequence,
  // sinon le 2e appel écrase le 1er en utilisant un activeSeq stale (bug observé en juin 2026).
  const addToList = (key, text, level) => {
    if (!text || !text.trim()) return;
    if (!activeSeance || !activeSeq) return;
    const list = activeSeance[key] || [];
    if (list.some(x => x.text === text && x.level === level)) return;
    const nextSeance = { ...activeSeance, [key]: [...list, { text, level }] };
    const seances = activeSeq.seances.map(se => se.id === activeSeance.id ? nextSeance : se);
    // Propagation vers la séquence parente (tags) pour héritage
    const parentMap = { objLex: 'lexique', objGram: 'grammar', objPhon: 'phono', objPrag: 'pragma' };
    const pk = parentMap[key];
    let nextTags = activeSeq.tags;
    if (pk) {
      const parentList = (activeSeq.tags || {})[pk] || [];
      if (!parentList.some(x => x.text === text && x.level === level)) {
        nextTags = { ...(activeSeq.tags || {}), [pk]: [...parentList, { text, level }] };
      }
    }
    upsertSequence({ ...activeSeq, seances, tags: nextTags });
  };
  const removeFromList = (key, idx) => {
    updateSeance({ [key]: (activeSeance[key] || []).filter((_, i) => i !== idx) });
  };

  // ─── Supports
  const addSupportLine = () => updateSeance({ supportsList: [...(activeSeance.supportsList || []), { id: 's_' + Date.now(), label: '', url: '' }] });
  const updateSupportLine = (idx, patch) => updateSeance({ supportsList: (activeSeance.supportsList || []).map((s, i) => i === idx ? { ...s, ...patch } : s) });
  const removeSupportLine = (idx) => updateSeance({ supportsList: (activeSeance.supportsList || []).filter((_, i) => i !== idx) });

  // ─── Activités langagières CECRL (séance)
  const compSubcomps = (CECRL_DESCRIPTORS[compCode] || {}).subcomps || [];
  const compDescriptors = ((CECRL_DESCRIPTORS[compCode] || {}).descriptors || []).filter(d => d.sub === compSub);
  const addCompAct = () => {
    if (!compDesc) return;
    const acts = activeSeance.compActs || [];
    const item = { id: 'ca_' + Date.now(), code: compCode, sub: compSub, level: compDesc.split('||')[0], text: compDesc.split('||').slice(1).join('||') };
    if (acts.some(x => x.text === item.text && x.code === item.code && x.level === item.level)) return;
    updateSeance({ compActs: [...acts, item] });
    setCompDesc('');
  };
  const removeCompAct = (idx) => updateSeance({ compActs: (activeSeance.compActs || []).filter((_, i) => i !== idx) });

  // ─── HOME (inchangé)
  if (stage === 'home') {
    return (
      <div className="app-view" style={{ display: 'block', overflowY: 'auto' }}>
        <div className="dash">
          <h1 className="dash-title">Séances par niveau</h1>
          <p className="dash-sub">Choisissez un niveau pour préparer le déroulé de vos cours.</p>
          <div className="grid">
            {NIVEAUX_LYCEE.map(n => (
              <div key={n.value} className="pcard" onClick={() => { setActiveLevel(n.value); setStage('sequence'); }}>
                <div className="pcard-ico"><BookOpen size={26} /></div>
                <div className="pcard-niv">{n.label}</div>
                <div className="pcard-year">{n.group}</div>
                <div className="pcard-stats">
                  <span>{counts[n.value]} séance{counts[n.value] > 1 ? 's' : ''}</span>
                  <span style={{ color: 'var(--accent2)', fontWeight: 700 }}>Ouvrir →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── SEQUENCE LIST (inchangé)
  if (stage === 'sequence') {
    const seqs = data.sequences.filter(s => s.niveau === activeLevel);
    const levelLabel = NIVEAUX_LYCEE.find(n => n.value === activeLevel)?.label;
    return (
      <div className="app-view" style={{ display: 'block', overflowY: 'auto' }}>
        <div className="dash">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setStage('home')}><ChevronLeft size={14} /> Retour</button>
            <h1 className="dash-title" style={{ marginBottom: 0 }}>{levelLabel} — Séquences</h1>
          </div>
          <p className="dash-sub">Sélectionnez une séquence pour ajouter / consulter ses séances.</p>
          <div className="grid">
            {seqs.length === 0 && <div className="pcard" style={{ cursor: 'default' }}><div style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Aucune séquence pour ce niveau.</div></div>}
            {seqs.map(s => (
              <div key={s.id} className="pcard" onClick={() => { setActiveSeqId(s.id); setStage('seance-list'); }}>
                <div className="pcard-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{s.titre || 'Sans titre'}</div>
                {s.annee && <div className="pcard-year">{s.annee}</div>}
                <div className="pcard-stats">
                  <span>{(s.seances || []).length} séance{(s.seances || []).length > 1 ? 's' : ''}</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Ouvrir →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── SEANCE LIST (inchangé)
  if (stage === 'seance-list' && activeSeq) {
    return (
      <div className="app-view" style={{ display: 'block', overflowY: 'auto' }}>
        <div className="dash">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setStage('sequence')}><ChevronLeft size={14} /> Retour</button>
            <h1 className="dash-title" style={{ marginBottom: 0 }}>{activeSeq.titre || 'Sans titre'}</h1>
          </div>
          <p className="dash-sub">Ses séances ({(activeSeq.seances || []).length}) <span style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>· Glisse les cartes par leur poignée <GripVertical size={9} style={{ verticalAlign: -1 }} /> pour les réordonner</span></p>
          <div className="grid">
            <div className="pcard pcard-new" onClick={addSeance}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}><Plus size={28} /></div>
              <div style={{ fontWeight: 700 }}>Créer une séance</div>
            </div>
            {(activeSeq.seances || []).map((se, idx) => (
              <div
                key={se.id}
                className="pcard"
                draggable
                onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(idx)); }}
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = ''; }}
                onDrop={e => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = '';
                  const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                  if (isNaN(fromIdx) || fromIdx === idx) return;
                  const arr = [...(activeSeq.seances || [])];
                  const [moved] = arr.splice(fromIdx, 1);
                  arr.splice(idx, 0, moved);
                  upsertSequence({ ...activeSeq, seances: arr });
                }}
                onClick={() => { setActiveSeanceId(se.id); setStage('seance'); }}
                style={{ position: 'relative', cursor: 'pointer' }}
              >
                <div style={{ position: 'absolute', top: 8, left: 8, color: 'var(--text-muted)', cursor: 'grab' }} title="Glisser pour réordonner" onClick={e => e.stopPropagation()}>
                  <GripVertical size={14} />
                </div>
                <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: 'rgba(236, 72, 153, 0.18)', color: '#be185d', letterSpacing: 0.5 }}>N°{idx + 1}</div>
                <div className="pcard-actions" onClick={e => e.stopPropagation()}>
                  <button className="pcard-act" onClick={() => duplicateSeance(se.id)} title="Dupliquer"><Copy size={12} /></button>
                  <button className="pcard-act danger" onClick={() => { if (window.confirm('Supprimer cette séance ?')) deleteSeance(se.id); }} title="Supprimer"><Trash2 size={12} /></button>
                </div>
                <div className="pcard-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 800, marginBottom: 6, paddingLeft: 22, paddingRight: 40, marginTop: 18 }}>{se.titre || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sans titre</span>}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, minHeight: 32 }}>{se.objectif ? (se.objectif.slice(0, 90) + (se.objectif.length > 90 ? '…' : '')) : <i>Pas d'objectif défini</i>}</div>
                <div className="pcard-stats">
                  <span><Clock size={11} style={{ verticalAlign: -1 }} /> {(se.activites || []).reduce((a, b) => a + (parseInt(b.duree, 10) || 0), 0)} min</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Éditer →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── SEANCE EDITOR — version étendue avec les 8 blocs du repo d'origine
  if (stage === 'seance' && activeSeq && activeSeance) {
    const parentTags = activeSeq.tags || {};
    const allParentItems = [
      ...(parentTags.grammar || []).map(t => ({ ...t, _kind: 'grammar', _color: 'g' })),
      ...(parentTags.phono || []).map(t => ({ ...t, _kind: 'phono', _color: 'o' })),
      ...(parentTags.lexique || []).map(t => ({ ...t, _kind: 'lexique', _color: 'y' })),
      ...(parentTags.pragma || []).map(t => ({ ...t, _kind: 'pragma', _color: 'p' }))
    ];
    const selObjs = activeSeance.parentObjectives || [];
    const togglePill = (item) => {
      const key = item._kind + '::' + item.text;
      const next = selObjs.includes(key) ? selObjs.filter(k => k !== key) : [...selObjs, key];
      updateSeance({ parentObjectives: next });
    };

    const grammarList = getGrammarFor(activeSeq.niveau, activeSeq.lv, gramAll);
    const phonoList = getPhonoFor(activeSeq.niveau, activeSeq.lv, phonAll);
    const pragDescList = PRAG_DESCRIPTORS.filter(d => d.sub === pragSub);
    const font = activeSeance.font || '';
    const fontScale = activeSeance.fontScale || 1;

    const seanceIndex = activeSeq.seances.findIndex(s => s.id === activeSeance.id);

    return (
      <div className="app-view">
        <div className="seq-layout">
          <div className="editor-panel" style={{ fontFamily: font || undefined, fontSize: `${fontScale * 13}px`, paddingBottom: 80 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setStage('seance-list')}><ChevronLeft size={14} /> Retour aux séances</button>
              <h1 className="dash-title" style={{ marginBottom: 0, fontSize: 20 }}>Éditeur de séance</h1>
              <button
                data-testid="export-seance-btn"
                className="btn btn-violet btn-sm"
                style={{ marginLeft: 'auto' }}
                onClick={() => window.print()}
                title="Exporter cette séance en PDF (via l'impression du navigateur)"
              >
                <FileDown size={12} /> Exporter
              </button>
            </div>
            <p className="dash-sub" style={{ marginBottom: 14, fontSize: 11 }}>Séquence : <b>{activeSeq.titre || 'Sans titre'}</b></p>

          {/* ─── BASE : titre + objectif principal ─── */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 14 }}>
            <div className="fg">
              <label className="fl">Titre de la séance <span style={{ color: 'var(--accent-r)' }}>*</span></label>
              <input data-testid="sea-titre" className="fi" value={activeSeance.titre || ''} onChange={e => updateSeance({ titre: e.target.value })} placeholder="Ex : Discovery of the topic" />
            </div>

            {/* Bloc Image */}
            <SectionBox compact color="var(--text-muted)" icon={<ImageIcon size={11} style={{ verticalAlign: -1 }} />} title="Image d'illustration (facultatif)" defaultOpen={!!activeSeance.imageUrl}>
              <div className="fg" style={{ marginBottom: 8 }}>
                <input data-testid="sea-img-url" className="fi" style={{ fontSize: 12 }} value={activeSeance.imageUrl || ''} onChange={e => updateSeance({ imageUrl: e.target.value })} placeholder="https://exemple.com/image.jpg" />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, fontSize: 11 }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Forme :</span>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input type="radio" name="img-shape" checked={(activeSeance.imageShape || 'banner') === 'banner'} onChange={() => updateSeance({ imageShape: 'banner' })} /> Bannière
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input type="radio" name="img-shape" checked={activeSeance.imageShape === 'round'} onChange={() => updateSeance({ imageShape: 'round' })} /> Ronde
                </label>
              </div>
              {activeSeance.imageUrl && (
                <div style={{ marginTop: 6 }}>
                  <img src={activeSeance.imageUrl} alt="" style={(activeSeance.imageShape === 'round') ? { width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' } : { width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 8 }} onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}
              <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '6px 10px', background: 'var(--panel)', borderRadius: 6, borderLeft: '2px solid var(--accent2)', marginTop: 6 }}>
                💡 Clic droit sur une image → « Copier l'adresse de l'image ».
              </div>
            </SectionBox>

            {/* Bloc Police */}
            <SectionBox compact color="var(--text-muted)" icon={<Type size={11} style={{ verticalAlign: -1 }} />} title="Police d'écriture (facultatif)" defaultOpen={!!activeSeance.font}>
              <select className="fs" data-testid="sea-font" style={{ fontSize: 12 }} value={font} onChange={e => updateSeance({ font: e.target.value })}>
                <option value="">— Par défaut —</option>
                {(FONTS || []).map(f => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>)}
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                <label style={{ fontWeight: 600 }}>Taille :</label>
                <input type="range" min="0.85" max="1.5" step="0.05" value={fontScale} onChange={e => updateSeance({ fontScale: parseFloat(e.target.value) })} style={{ flex: 1 }} />
                <span style={{ minWidth: 40, textAlign: 'right' }}>{Math.round(fontScale * 100)}%</span>
              </div>
            </SectionBox>

            <div className="fg">
              <label className="fl">Objectif principal</label>
              <textarea data-testid="sea-obj" className="fi field-textarea" value={activeSeance.objectif || ''} onChange={e => updateSeance({ objectif: e.target.value })} placeholder="Ex : Découvrir le lexique du logement" style={{ minHeight: 55 }} />
            </div>
          </div>

          {/* ─── OBJECTIFS DE LA SÉANCE (lex/gram/phon/prag) ─── */}
          <SectionBox color="#eab308" icon="🎯" title="Objectifs de la séance">
            <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '0 0 10px', lineHeight: 1.5 }}>Saisis ici se rajoutent aussi dans la séquence parente.</p>

            {/* Lexique */}
            <div className="fg" style={{ marginBottom: 10 }}>
              <label className="fl" style={{ color: '#eab308', fontSize: 10 }}>Lexique</label>
              <div style={{ marginBottom: 6 }}>{(activeSeance.objLex || []).map((t, i) => <Pill key={i} text={t.text} color="y" onRemove={() => removeFromList('objLex', i)} />)}</div>
              <div className="swa">
                <input className="fi" value={lexFree} onChange={e => setLexFree(e.target.value)} placeholder="Saisie libre…" onKeyDown={e => { if (e.key === 'Enter' && lexFree.trim()) { addToList('objLex', lexFree.trim()); setLexFree(''); } }} />
                <button className="ba y" onClick={() => { if (lexFree.trim()) { addToList('objLex', lexFree.trim()); setLexFree(''); } }}><Plus size={14} /></button>
              </div>
            </div>

            {/* Grammaire */}
            <div className="fg" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label className="fl" style={{ color: 'var(--accent)', fontSize: 10, margin: 0 }}>Grammaire</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={gramAll} onChange={e => setGramAll(e.target.checked)} style={{ margin: 0, width: 13, height: 13 }} /> Tous niveaux
                </label>
              </div>
              <div style={{ marginBottom: 6 }}>{(activeSeance.objGram || []).map((t, i) => <Pill key={i} text={t.text} color="g" onRemove={() => removeFromList('objGram', i)} />)}</div>
              <div className="swa">
                <select className="fs" style={{ fontSize: 12 }} value={gramSel} onChange={e => setGramSel(e.target.value)}>
                  <option value="">— Choisir dans le référentiel —</option>
                  {grammarList.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <button className="ba g" onClick={() => { if (gramSel) { addToList('objGram', gramSel); setGramSel(''); } }}><Plus size={14} /></button>
              </div>
              <div className="swa" style={{ marginTop: 4 }}>
                <input className="fi" value={gramFree} onChange={e => setGramFree(e.target.value)} placeholder="…ou saisie libre" />
                <button className="ba g" onClick={() => { if (gramFree.trim()) { addToList('objGram', gramFree.trim()); setGramFree(''); } }}><Plus size={14} /></button>
              </div>
            </div>

            {/* Phonologie */}
            <div className="fg" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label className="fl" style={{ color: 'var(--accent3)', fontSize: 10, margin: 0 }}>Phonologie</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={phonAll} onChange={e => setPhonAll(e.target.checked)} style={{ margin: 0, width: 13, height: 13 }} /> Tous niveaux
                </label>
              </div>
              <div style={{ marginBottom: 6 }}>{(activeSeance.objPhon || []).map((t, i) => <Pill key={i} text={t.text} color="o" onRemove={() => removeFromList('objPhon', i)} />)}</div>
              <div className="swa">
                <select className="fs" style={{ fontSize: 12 }} value={phonSel} onChange={e => setPhonSel(e.target.value)}>
                  <option value="">— Choisir dans le référentiel —</option>
                  {phonoList.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <button className="ba o" onClick={() => { if (phonSel) { addToList('objPhon', phonSel); setPhonSel(''); } }}><Plus size={14} /></button>
              </div>
              <div className="swa" style={{ marginTop: 4 }}>
                <input className="fi" value={phonFree} onChange={e => setPhonFree(e.target.value)} placeholder="…ou saisie libre" />
                <button className="ba o" onClick={() => { if (phonFree.trim()) { addToList('objPhon', phonFree.trim()); setPhonFree(''); } }}><Plus size={14} /></button>
              </div>
            </div>

            {/* Pragmatique */}
            <div className="fg">
              <label className="fl" style={{ color: '#ec4899', fontSize: 10 }}>Pragmatique</label>
              <div style={{ marginBottom: 6 }}>{(activeSeance.objPrag || []).map((t, i) => <Pill key={i} text={t.text} level={t.level} color="p" onRemove={() => removeFromList('objPrag', i)} />)}</div>
              <select className="fs" style={{ fontSize: 12, marginBottom: 4 }} value={pragSub} onChange={e => { setPragSub(e.target.value); setPragDesc(''); }}>
                <option value="">— Sous-compétence pragmatique —</option>
                {(PRAG_SUBCOMPS || []).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <div className="swa" style={{ marginBottom: 4 }}>
                <select className="fs" style={{ fontSize: 12 }} value={pragDesc} onChange={e => setPragDesc(e.target.value)} disabled={!pragSub}>
                  <option value="">{pragSub ? '— Descripteur CECRL —' : '— Choisis d\'abord une sous-comp. —'}</option>
                  {pragDescList.map(d => <option key={d.text} value={`${d.level}||${d.text}`}>[{d.level}] {d.text.slice(0, 90)}</option>)}
                </select>
                <button className="ba p" onClick={() => { if (pragDesc) { const [lv, ...rest] = pragDesc.split('||'); addToList('objPrag', rest.join('||'), lv); setPragDesc(''); } }}><Plus size={14} /></button>
              </div>
              <div className="swa">
                <input className="fi" value={pragFree} onChange={e => setPragFree(e.target.value)} placeholder="…ou saisie libre" />
                <button className="ba p" onClick={() => { if (pragFree.trim()) { addToList('objPrag', pragFree.trim()); setPragFree(''); } }}><Plus size={14} /></button>
              </div>
            </div>
          </SectionBox>

          {/* ─── ACTIVITÉS LANGAGIÈRES CECRL ─── */}
          <SectionBox color="var(--accent2)" icon="🎵" title="Activités langagières (CECRL)">
            <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '0 0 8px' }}>Compétence → sous-compétence → descripteur du Volume Complémentaire.</p>
            <div style={{ marginBottom: 8 }}>{(activeSeance.compActs || []).map((a, i) => <Pill key={i} text={`${a.code} · ${a.text}`} level={a.level} color="v" onRemove={() => removeCompAct(i)} />)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 4 }}>
              <select className="fs" style={{ fontSize: 12 }} value={compCode} onChange={e => { setCompCode(e.target.value); setCompSub(''); setCompDesc(''); }}>
                {COMPETENCES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.label}</option>)}
              </select>
              <select className="fs" style={{ fontSize: 12 }} value={compSub} onChange={e => { setCompSub(e.target.value); setCompDesc(''); }}>
                <option value="">— Sous-compétence —</option>
                {compSubcomps.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className="swa">
              <select className="fs" style={{ fontSize: 12 }} value={compDesc} onChange={e => setCompDesc(e.target.value)} disabled={!compSub}>
                <option value="">{compSub ? '— Descripteur —' : '— Choisis sous-comp. d\'abord —'}</option>
                {compDescriptors.map(d => <option key={d.text} value={`${d.level}||${d.text}`}>[{d.level}] {d.text.slice(0, 90)}</option>)}
              </select>
              <button className="ba v" onClick={addCompAct} disabled={!compDesc}><Plus size={14} /></button>
            </div>
          </SectionBox>

          {/* ─── SUPPORTS & DOCUMENTS ─── */}
          <SectionBox color="var(--accent5)" icon={<Link2 size={11} style={{ verticalAlign: -1 }} />} title="Supports & documents">
            <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '0 0 8px' }}>Une ligne par support. Les URLs deviennent cliquables dans la préview.</p>
            {(activeSeance.supportsList || []).map((s, i) => (
              <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 6, marginBottom: 6 }}>
                <input className="fi" style={{ fontSize: 12 }} value={s.label} onChange={e => updateSupportLine(i, { label: e.target.value })} placeholder="Titre / description" />
                <input className="fi" style={{ fontSize: 12 }} value={s.url} onChange={e => updateSupportLine(i, { url: e.target.value })} placeholder="https://… (facultatif)" />
                <button className="btn btn-ghost btn-sm" onClick={() => removeSupportLine(i)} style={{ padding: '4px 8px' }}><Trash2 size={12} /></button>
              </div>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={addSupportLine} style={{ width: '100%', padding: 8, border: '1px dashed var(--border)', fontSize: 11 }}>＋ Ajouter une ligne</button>
          </SectionBox>

          {/* ─── ACTIVITÉS ─── (blocs avec description riche) */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
              <div className="section-label orange" style={{ marginBottom: 0 }}>⏱️ Activités</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent2)' }}>Durée totale : {totalDuration} min</span>
                <button data-testid="add-activity-btn" className="btn btn-green btn-sm" onClick={addActivity}><Plus size={12} /> Ajouter une activité</button>
              </div>
            </div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '0 0 12px', fontStyle: 'italic' }}>
              Une activité par bloc. Cliquez pour modifier. La durée totale s'affiche en haut de la fiche.
            </p>
            {(activeSeance.activites || []).length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', padding: 20, fontSize: 12, background: 'var(--card)', borderRadius: 8, border: '1px dashed var(--border)' }}>
                Aucune activité pour le moment. Clique sur « + Ajouter une activité ».
              </div>
            )}
            {(activeSeance.activites || []).map((act, idx) => (
              <div
                key={act.id}
                data-testid={`activity-${idx}`}
                style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, marginBottom: 10 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: 'rgba(245, 158, 11, 0.15)', color: '#b45309', letterSpacing: 0.5 }}>ACTIVITÉ {idx + 1}</span>
                  <input
                    className="fi"
                    style={{ flex: 1, minWidth: 180, fontWeight: 700 }}
                    value={act.label}
                    onChange={e => updateActivity(idx, { label: e.target.value })}
                    placeholder="Titre de l'activité (ex : Lecture du document)"
                  />
                  <button className="btn btn-ghost btn-sm" onClick={() => removeActivity(idx)} title="Supprimer cette activité" style={{ padding: '6px 8px' }}><Trash2 size={12} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>⏱️ Durée :</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="number"
                      min="0"
                      className="fi"
                      style={{ width: 80, fontSize: 12 }}
                      value={act.duree || ''}
                      onChange={e => updateActivity(idx, { duree: parseInt(e.target.value, 10) || 0 })}
                      placeholder="min"
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>min (facultatif)</span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>📝 Description :</span>
                  <RichTextEditor
                    testId={`activity-desc-${idx}`}
                    value={act.contenu || ''}
                    onChange={html => updateActivity(idx, { contenu: html })}
                    placeholder="Détaille le déroulé de l'activité, les consignes, les supports…"
                    font={font}
                    fontScale={fontScale}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ─── TRACE ÉCRITE (rich text) ─── */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, marginBottom: 14 }}>
            <div className="section-label" style={{ color: 'var(--accent2)' }}>✏️ Trace écrite attendue</div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '0 0 8px' }}>Exemple modélisant à recopier ou reformuler par les élèves.</p>
            <RichTextEditor testId="sea-trace" value={activeSeance.trace || ''} onChange={html => updateSeance({ trace: html })} placeholder="Ex : My house has three bedrooms…" font={font} fontScale={fontScale} />
          </div>

          {/* ─── DEVOIRS (rich text) ─── */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, marginBottom: 14 }}>
            <div className="section-label" style={{ color: 'var(--accent-r)' }}>🏠 Devoirs</div>
            <RichTextEditor testId="sea-devoirs" value={activeSeance.devoirs || ''} onChange={html => updateSeance({ devoirs: html })} placeholder="Exercices, lectures, préparations…" font={font} fontScale={fontScale} />
          </div>

          {/* ─── Objectifs hérités (existant) ─── */}
          {allParentItems.length > 0 && (
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: 18 }}>
              <div className="section-label cyan">Objectifs hérités de la séquence</div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>Clique pour marquer ceux travaillés dans cette séance.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {allParentItems.map((it, i) => {
                  const k = it._kind + '::' + it.text;
                  const selected = selObjs.includes(k);
                  return (
                    <button key={i} type="button" className={`tag ${it._color}`} style={{ cursor: 'pointer', opacity: selected ? 1 : 0.55, border: selected ? '2px solid var(--accent)' : '2px solid transparent', background: selected ? 'var(--ok-bg)' : undefined }} onClick={() => togglePill(it)}>
                      {it.level && <span className="tag-level">{it.level}</span>}
                      <span className="tl">{it.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          </div>
          <ResizableGutter />
          <div className="preview-panel">
            <SeancePreview seance={activeSeance} sequence={activeSeq} seanceIndex={seanceIndex} />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SeancesView;
