import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Printer, BookmarkPlus, Sparkles, Search, Award } from 'lucide-react';
import { GRILLE_LEVELS_FULL, GRILLE_CRITERES_PRESETS, I_CAN_TEMPLATES } from '../data/sequenceurData2';
import { DC_CECRL_BO } from '../data/sequenceurData';
import { GRILLES_OFFICIELLES, NIVEAUX_OFF, POINTS_OFF, splitDescriptor, parsePoints } from '../data/grillesOfficielles';
import { useApp } from '../contexts/AppContext';

// Mapping entre les codes de compétence des grilles et ceux du référentiel CECRL.
// (les grilles utilisent EE/EOC/EOI alors que le référentiel BO utilise PE/PO/PEC/IE…)
const GRILLE_TO_CECRL_CODE = {
  CO: 'CO', CE: 'CE',
  EE: 'PE',   // Expression écrite ↔ Production écrite
  EOC: 'PEC', // Expression orale en continu ↔ Production écrite en continu (le BO utilise PEC pour les deux)
  EOI: 'IE',  // Expression orale interaction ↔ Interaction écrite (proche)
  MED: 'MED'
};
// Ordre DESCENDANT : on veut toujours afficher le niveau le plus haut en haut
// du tableau (C2 d'abord), conformément à la convention BAC.
const CECRL_LEVELS_FOR_PRESET = ['C2', 'C1', 'B2', 'B1+', 'B1', 'A2+', 'A2', 'A1'];

// Sous-modale qui propose : compétence + niveaux à charger
const CecrlPresetModal = ({ grilleType, onApply, onClose }) => {
  const initialCode = 'CO';
  const [code, setCode] = useState(initialCode);
  const [selectedLevels, setSelectedLevels] = useState(['A2', 'B1', 'B2']);

  const cecrlData = DC_CECRL_BO[code] || {};
  const subcomps = cecrlData.subcomps || [];
  // Tous les descripteurs aplatis (un par couple sub/level)
  // Structure d'origine : subcomps[i].items[].{level, text}
  const allDescriptors = subcomps.flatMap(sc => (sc.items || []).map(it => ({ subId: sc.id, level: it.level, text: it.text })));

  // Aperçu : nombre de descripteurs disponibles selon les niveaux choisis
  const previewCount = allDescriptors.filter(d => selectedLevels.includes(d.level)).length;

  const toggleLevel = (lv) => {
    setSelectedLevels(s => s.includes(lv) ? s.filter(x => x !== lv) : [...s, lv].sort((a, b) => CECRL_LEVELS_FOR_PRESET.indexOf(a) - CECRL_LEVELS_FOR_PRESET.indexOf(b)));
  };

  const apply = () => {
    if (selectedLevels.length === 0) return;
    // Lignes = niveaux choisis, Colonnes = sous-compétences
    // Cellules = descripteur officiel (s'il existe pour ce {sub, level})
    const rows = [...selectedLevels];
    const cols = subcomps.map(sc => sc.label);
    const cells = {};
    selectedLevels.forEach((lv, rIdx) => {
      subcomps.forEach((sc, cIdx) => {
        const desc = (sc.items || []).find(it => it.level === lv);
        if (desc) cells[`${rIdx}_${cIdx}`] = { text: desc.text };
      });
    });
    onApply({
      rows,
      cols,
      cells,
      // On ne touche pas aux points existants (grille de type "critere")
      // mais on s'assure que la grille est en mode CECRL :
      type: 'cecrl',
      // Compétence affichée — convertir du code BO au code grille si possible
      competence: Object.keys(GRILLE_TO_CECRL_CODE).find(k => GRILLE_TO_CECRL_CODE[k] === code) || code
    });
    onClose();
  };

  return (
    <div className="modal-back" data-testid="cecrl-preset-modal" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(108,99,255,.12)', color: '#4338ca', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              <Sparkles size={12} /> Volume complémentaire 2018
            </div>
            <div className="modal-title">Charger les descripteurs CECRL</div>
            <div className="modal-sub">La grille sera pré-remplie avec les descripteurs officiels — tu pourras toujours modifier chaque case.</div>
          </div>
          <button data-testid="cecrl-preset-close" className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="fg">
          <label className="fl">Compétence</label>
          <select className="fs" data-testid="cecrl-preset-code" value={code} onChange={e => setCode(e.target.value)}>
            {Object.keys(DC_CECRL_BO).filter(k => k !== 'CAV').map(k => (
              <option key={k} value={k}>{k} — {DC_CECRL_BO[k].label}</option>
            ))}
          </select>
        </div>

        <div className="fg">
          <label className="fl">Niveaux CECRL à inclure (1 ligne par niveau)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {CECRL_LEVELS_FOR_PRESET.map(lv => (
              <label key={lv} data-testid={`cecrl-level-${lv}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, cursor: 'pointer', padding: '5px 10px', borderRadius: 999, border: '1px solid var(--border)', background: selectedLevels.includes(lv) ? '#6c63ff' : 'var(--card)', color: selectedLevels.includes(lv) ? '#fff' : 'var(--fg)', fontWeight: 700, transition: 'all .15s' }}>
                <input type="checkbox" checked={selectedLevels.includes(lv)} onChange={() => toggleLevel(lv)} style={{ display: 'none' }} />
                {lv}
              </label>
            ))}
          </div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 14, fontSize: 12 }}>
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Aperçu</div>
          <div style={{ color: '#475569' }}>
            <b>{selectedLevels.length}</b> lignes (niveaux) × <b>{subcomps.length}</b> colonnes (sous-compétences) — <b>{previewCount}</b> descripteurs officiels seront pré-remplis.
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: '#64748b' }}>
            Sous-compétences : {subcomps.map(s => s.label).join(' · ') || '—'}
          </div>
          {grilleType === 'critere' && (
            <div style={{ marginTop: 6, padding: '6px 10px', background: '#fef3c7', borderRadius: 6, color: '#92400e', fontSize: 11 }}>
              ⚠️ La grille passera du type "Critères + points" à "CECRL". Tu peux la rebasculer ensuite.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button data-testid="cecrl-preset-cancel" className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button data-testid="cecrl-preset-apply" className="btn btn-violet" onClick={apply} disabled={selectedLevels.length === 0} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} /> Charger dans la grille
          </button>
        </div>
      </div>
    </div>
  );
};

const GrilleEditor = ({ grille, onChange, onClose, onDelete }) => {
  const { addToLibrary, prefs } = useApp();
  const [g, setG] = useState(grille);
  const [cecrlModalOpen, setCecrlModalOpen] = useState(false);
  const [officielModalOpen, setOfficielModalOpen] = useState(false);
  const [officielInitialId, setOfficielInitialId] = useState(null);
  // Sentence picker : { rIdx, cIdx, sentences: [...], selected: Set, mode: 'append'|'replace' }
  const [phrasesModal, setPhrasesModal] = useState(null);
  // Grille officielle : { id, classe, langue, criteres, niveaux } pour la conversion live
  const [officielMeta, setOfficielMeta] = useState(grille.officiel || null);
  // Menu d'impression (layouts portrait / paysage, 1×/2×/4×/6×)
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const printMenuRef = React.useRef(null);

  // Ferme le menu d'impression en cliquant en dehors
  useEffect(() => {
    if (!printMenuOpen) return;
    const onDocClick = (e) => {
      if (printMenuRef.current && !printMenuRef.current.contains(e.target)) {
        setPrintMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [printMenuOpen]);

  useEffect(() => {
    setG(grille);
    setOfficielMeta(grille.officiel || null);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [grille.id]);

  const commit = (patch) => {
    const next = { ...g, ...patch };
    setG(next);
    onChange(next);
  };

  // Score total de la grille (somme des points des cellules remplies).
  // parsePoints prend automatiquement le MAX si saisie "4-5" / "4 ou 5" / "4/5".
  // Calcul valable pour TOUTES les grilles (officielles BAC + personnalisées).
  const totalScore = React.useMemo(() => {
    let sum = 0;
    Object.values(g.cells || {}).forEach(cell => {
      const p = parsePoints(cell.points);
      if (p != null) sum += p;
    });
    return sum;
  }, [g.cells]);

  // Bonus accordé par le prof (commentaire libre + select 0 à 5 pts par paliers 0.25).
  const bonusPts = parseFloat(g.bonus?.points) || 0;
  const scoreAvecBonus = totalScore + bonusPts;

  // Note /20 — proportionnelle au totalPoints saisi par le prof.
  // Peut dépasser 20/20 (ex : 22/20) si le bonus pousse au-delà du max.
  const totalPts = parseFloat(g.totalPoints) || 0;
  const noteSur20 = totalPts > 0
    ? Math.round((scoreAvecBonus / totalPts) * 20 * 100) / 100
    : null;

  // Niveau CECRL visé (info purement indicative, utile sur grille officielle)
  const niveauVise = React.useMemo(() => {
    if (!g.cells || !g.rows) return null;
    for (let r = 0; r < g.rows.length; r++) {
      for (let c = 0; c < g.cols.length; c++) {
        const cell = g.cells[`${r}_${c}`];
        if (cell?.points != null && String(cell.points).trim() !== '') {
          return g.rows[r];
        }
      }
    }
    return null;
  }, [g.cells, g.rows, g.cols]);

  // On affiche la barre de score dès qu'un totalPoints > 0 existe (= toutes les grilles à barème).
  const showScoreBar = totalPts > 0;

  // Ouvre le sélecteur pour une cellule donnée (Affiner le descripteur)
  const openPhrasesPicker = (rIdx, cIdx) => {
    const cell = g.cells?.[`${rIdx}_${cIdx}`] || {};
    const sentences = splitDescriptor(cell.text || '');
    if (sentences.length <= 1) {
      // Si une seule phrase, ouvrir quand même mais l'utilisateur peut éditer librement après
    }
    setPhrasesModal({
      rIdx, cIdx, mode: 'replace',
      sentences,
      selected: new Set(sentences.map((_, i) => i)) // toutes cochées par défaut
    });
  };

  const applyPhrases = () => {
    if (!phrasesModal) return;
    const kept = phrasesModal.sentences.filter((_, i) => phrasesModal.selected.has(i));
    const newText = kept.join(' ');
    setCell(phrasesModal.rIdx, phrasesModal.cIdx, { text: newText });
    setPhrasesModal(null);
  };

  const setCell = (rIdx, cIdx, patch) => {
    const key = `${rIdx}_${cIdx}`;
    const cells = { ...(g.cells || {}), [key]: { ...(g.cells?.[key] || {}), ...patch } };
    commit({ cells });
  };

  const addRow = () => {
    const rows = [...g.rows, g.type === 'cecrl' ? 'B2' : 'Nouveau critère'];
    const rowsPoints = g.type === 'critere' ? [...(g.rowsPoints || []), 1] : g.rowsPoints;
    commit({ rows, rowsPoints });
  };
  const addCol = () => {
    const cols = [...g.cols, g.type === 'cecrl' ? 'Nouveau critère' : 'B2'];
    const colsPoints = g.type === 'cecrl' ? [...(g.colsPoints || []), 1] : g.colsPoints;
    commit({ cols, colsPoints });
  };
  const removeRow = (idx) => {
    const rows = g.rows.filter((_, i) => i !== idx);
    const rowsPoints = g.rowsPoints ? g.rowsPoints.filter((_, i) => i !== idx) : g.rowsPoints;
    // Reindex cells
    const cells = {};
    Object.entries(g.cells || {}).forEach(([k, v]) => {
      const [r, c] = k.split('_').map(Number);
      if (r === idx) return;
      const newR = r > idx ? r - 1 : r;
      cells[`${newR}_${c}`] = v;
    });
    commit({ rows, rowsPoints, cells });
  };
  const removeCol = (idx) => {
    const cols = g.cols.filter((_, i) => i !== idx);
    const colsPoints = g.colsPoints ? g.colsPoints.filter((_, i) => i !== idx) : g.colsPoints;
    const cells = {};
    Object.entries(g.cells || {}).forEach(([k, v]) => {
      const [r, c] = k.split('_').map(Number);
      if (c === idx) return;
      const newC = c > idx ? c - 1 : c;
      cells[`${r}_${newC}`] = v;
    });
    commit({ cols, colsPoints, cells });
  };

  const applyPreset = (presetKey) => {
    const presets = GRILLE_CRITERES_PRESETS[presetKey];
    if (!presets) return;
    if (g.type === 'cecrl') {
      const cols = presets.map(p => p.label);
      const colsPoints = presets.map(p => p.points);
      const total = colsPoints.reduce((a, b) => a + b, 0);
      commit({ cols, colsPoints, totalPoints: total, competence: presetKey });
    } else {
      const rows = presets.map(p => p.label);
      const rowsPoints = presets.map(p => p.points);
      const total = rowsPoints.reduce((a, b) => a + b, 0);
      commit({ rows, rowsPoints, totalPoints: total, competence: presetKey });
    }
  };

  const fillTemplate = () => {
    const cells = { ...(g.cells || {}) };
    if (g.type === 'critere') {
      // For each row (critère) × each col (level), pre-fill « I can… » template
      g.rows.forEach((row, rIdx) => {
        g.cols.forEach((col, cIdx) => {
          const key = `${rIdx}_${cIdx}`;
          if (!cells[key]?.text) {
            const template = I_CAN_TEMPLATES[col] || '';
            cells[key] = { ...(cells[key] || {}), text: g.iCan ? template : '' };
          }
        });
      });
    }
    commit({ cells });
  };

  const saveToLibrary = () => {
    const name = window.prompt('Nom de la grille pour la bibliothèque ?', g.name);
    if (!name) return;
    addToLibrary('grilles', { name, grille: { ...g, id: undefined } });
    alert('✅ Grille ajoutée à la bibliothèque !');
  };

  // Configurations de layout pour l'impression (perPage × orientation).
  // Chaque preset ajuste taille du texte, padding, marges pour faire tenir N grilles sur une A4.
  const PRINT_LAYOUTS = {
    '1_portrait':  { cols: 1, rows: 1, gap: '0',   pad: '14pt', h1: '20pt', h2: '10pt', cell: '9.5pt', cellPad: '6pt 8pt', pts: '8pt' },
    '1_landscape': { cols: 1, rows: 1, gap: '0',   pad: '14pt', h1: '20pt', h2: '10pt', cell: '9.5pt', cellPad: '6pt 8pt', pts: '8pt' },
    '2_portrait':  { cols: 1, rows: 2, gap: '6pt', pad: '10pt', h1: '13pt', h2: '8pt',  cell: '7pt',   cellPad: '3pt 4pt', pts: '6pt' },
    '2_landscape': { cols: 2, rows: 1, gap: '6pt', pad: '10pt', h1: '13pt', h2: '8pt',  cell: '7pt',   cellPad: '3pt 4pt', pts: '6pt' },
    '4_portrait':  { cols: 2, rows: 2, gap: '5pt', pad: '7pt',  h1: '10pt', h2: '7pt',  cell: '5.5pt', cellPad: '2pt 3pt', pts: '5pt' },
    '4_landscape': { cols: 2, rows: 2, gap: '5pt', pad: '7pt',  h1: '10pt', h2: '7pt',  cell: '5.5pt', cellPad: '2pt 3pt', pts: '5pt' },
    '6_portrait':  { cols: 2, rows: 3, gap: '4pt', pad: '5pt',  h1: '8.5pt', h2: '6pt', cell: '4.5pt', cellPad: '1.5pt 2pt', pts: '4pt' },
    '6_landscape': { cols: 3, rows: 2, gap: '4pt', pad: '5pt',  h1: '8.5pt', h2: '6pt', cell: '4.5pt', cellPad: '1.5pt 2pt', pts: '4pt' },
  };

  const printGrille = (perPage = 1, orientation = 'portrait') => {
    const w = window.open('', '_blank');
    if (!w) return;

    const layout = PRINT_LAYOUTS[`${perPage}_${orientation}`] || PRINT_LAYOUTS['1_portrait'];

    const doc = w.document;
    doc.open();
    doc.close();
    doc.documentElement.lang = 'fr';

    const head = doc.head;
    const meta = doc.createElement('meta');
    meta.setAttribute('charset', 'utf-8');
    head.appendChild(meta);
    const title = doc.createElement('title');
    title.textContent = (g.name || 'Grille') + (perPage > 1 ? ` ×${perPage}` : '');
    head.appendChild(title);
    const style = doc.createElement('style');
    style.textContent = `
      @page { size: A4 ${orientation}; margin: 6mm; }
      @media print { html, body { margin: 0; padding: 0; } }
      html, body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; color:#1e293b; margin: 0; padding: 0; }
      .sheet {
        display: grid;
        grid-template-columns: repeat(${layout.cols}, 1fr);
        gap: ${layout.gap};
        padding: ${layout.pad};
        box-sizing: border-box;
        width: 100vw;
        align-content: start;
      }
      .grille {
        display: flex; flex-direction: column;
        break-inside: avoid; page-break-inside: avoid;
        overflow: hidden;
        border: ${perPage > 1 ? '0.4pt dashed #cbd5e1' : 'none'};
        padding: ${perPage > 1 ? '4pt' : '0'};
        border-radius: ${perPage > 1 ? '3pt' : '0'};
      }
      .grille h1 { font-family: 'Playfair Display', Georgia, serif; font-size: ${layout.h1}; margin: 0 0 2pt; line-height: 1.1; }
      .grille h2 { font-size: ${layout.h2}; color: #64748b; margin: 0 0 4pt; font-weight: 600; }
      .grille table { width: 100%; border-collapse: collapse; table-layout: auto; }
      .grille th, .grille td { border: 0.4pt solid #94a3b8; padding: ${layout.cellPad}; vertical-align: top; font-size: ${layout.cell}; line-height: 1.25; word-wrap: break-word; }
      .grille th { background: #f1f5f9; font-weight: 700; color: #1e293b; }
      .grille .lvl { background: #6c63ff; color: #fff; padding: 1pt 4pt; border-radius: 3pt; font-weight: 700; font-size: ${layout.cell}; }
      .grille .pts { color: #64748b; font-size: ${layout.pts}; font-weight: 600; }
      .grille .total { margin-top: 3pt; text-align: right; font-size: ${layout.h2}; font-weight: 700; }
      .grille .prof-foot { margin-top: 4pt; font-size: ${layout.pts}; color: #94a3b8; text-align: right; font-style: italic; }
    `;
    head.appendChild(style);

    // Construction sécurisée du DOM via createElement / textContent → zéro risque d'injection.
    const appendPointsBreak = (parent, prefix, pts) => {
      if (pts == null || pts === '') return;
      parent.appendChild(doc.createElement('br'));
      const span = doc.createElement('span');
      span.className = 'pts';
      span.textContent = `${prefix}${pts}`;
      parent.appendChild(span);
    };

    const buildOneGrille = () => {
      const wrap = doc.createElement('div');
      wrap.className = 'grille';

      const h1 = doc.createElement('h1');
      h1.textContent = g.name || 'Grille';
      wrap.appendChild(h1);

      const h2 = doc.createElement('h2');
      h2.textContent = `${g.competence || ''}${g.totalPoints ? ' · /' + g.totalPoints : ''}`;
      wrap.appendChild(h2);

      const table = doc.createElement('table');
      const thead = doc.createElement('thead');
      const headRow = doc.createElement('tr');
      headRow.appendChild(doc.createElement('th'));
      g.cols.forEach((col, i) => {
        const th = doc.createElement('th');
        th.textContent = col || '';
        appendPointsBreak(th, '/', g.colsPoints?.[i]);
        headRow.appendChild(th);
      });
      thead.appendChild(headRow);
      table.appendChild(thead);

      const tbody = doc.createElement('tbody');
      g.rows.forEach((rowLabel, rIdx) => {
        const tr = doc.createElement('tr');
        const th = doc.createElement('th');
        const lvl = doc.createElement('span');
        lvl.className = 'lvl';
        lvl.textContent = rowLabel || '';
        th.appendChild(lvl);
        appendPointsBreak(th, '/', g.rowsPoints?.[rIdx]);
        tr.appendChild(th);
        g.cols.forEach((_, cIdx) => {
          const td = doc.createElement('td');
          const cell = g.cells?.[`${rIdx}_${cIdx}`] || {};
          td.textContent = cell.text || '';
          appendPointsBreak(td, '', cell.points != null && cell.points !== '' ? `${cell.points} pt(s)` : '');
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      wrap.appendChild(table);

      if (perPage === 1) {
        const total = doc.createElement('div');
        total.className = 'total';
        total.textContent = `TOTAL : /${g.totalPoints ?? ''}`;
        wrap.appendChild(total);
        if (prefs?.profName) {
          const pf = doc.createElement('div');
          pf.className = 'prof-foot';
          pf.textContent = '· ' + prefs.profName;
          wrap.appendChild(pf);
        }
      }
      return wrap;
    };

    const body = doc.body;
    const sheet = doc.createElement('div');
    sheet.className = 'sheet';
    for (let i = 0; i < perPage; i++) sheet.appendChild(buildOneGrille());
    body.appendChild(sheet);

    setTimeout(() => {
      try { w.focus(); w.print(); } catch (e) { console.warn('[Grille] Impression interrompue :', e); }
    }, 300);
  };

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ minWidth: '80vw', maxWidth: '95vw', maxHeight: '92vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="modal-title">Éditeur de grille d'évaluation</div>
            <div className="modal-sub">Définissez vos critères, niveaux et descripteurs.</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
        </div>

        {/* Settings */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 14, padding: 12, background: 'var(--card)', borderRadius: 10 }}>
          <div className="fg" style={{ margin: 0 }}>
            <label className="fl">Nom</label>
            <input className="fi" value={g.name} onChange={e => commit({ name: e.target.value })} />
          </div>
          <div className="fg" style={{ margin: 0 }}>
            <label className="fl">Compétence</label>
            <select className="fs" value={g.competence} onChange={e => commit({ competence: e.target.value })}>
              <option value="EE">EE — Expression écrite</option>
              <option value="EOC">EOC — Expression orale continu</option>
              <option value="EOI">EOI — Expression orale interaction</option>
              <option value="CE">CE — Compréhension écrite</option>
              <option value="CO">CO — Compréhension orale</option>
              <option value="MED">MED — Médiation</option>
            </select>
          </div>
          <div className="fg" style={{ margin: 0 }}>
            <label className="fl">Type de grille</label>
            <select className="fs" value={g.type} onChange={e => commit({ type: e.target.value })}>
              <option value="cecrl">CECRL (lignes = niveaux)</option>
              <option value="critere">Critères + points (lignes = critères)</option>
            </select>
          </div>
          <div className="fg" style={{ margin: 0 }}>
            <label className="fl">Total sur</label>
            <input className="fi" type="number" min="1" value={g.totalPoints} onChange={e => commit({ totalPoints: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="fg" style={{ margin: 0 }}>
            <label className="fl">Préréglages critères</label>
            <select className="fs" value="" onChange={e => { if (e.target.value) applyPreset(e.target.value); }}>
              <option value="">— Charger un preset —</option>
              {Object.keys(GRILLE_CRITERES_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div className="fg" style={{ margin: 0, display: 'flex', alignItems: 'flex-end' }}>
            <button
              data-testid="cecrl-preset-btn"
              type="button"
              className="btn btn-violet"
              onClick={() => setCecrlModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center' }}
              title="Pré-remplir la grille avec les descripteurs officiels du Volume Complémentaire 2018"
            >
              <Sparkles size={14} /> Descripteurs CECRL
            </button>
          </div>
          <div className="fg" style={{ margin: 0, display: 'flex', alignItems: 'flex-end' }}>
            <button
              data-testid="grille-off-btn"
              type="button"
              className="btn btn-orange"
              onClick={() => { setOfficielInitialId(null); setOfficielModalOpen(true); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center' }}
              title="Charger une grille officielle BAC (Compréhension / Expression écrite / Expression orale) avec conversion auto vers /20"
            >
              <Award size={14} /> Grille officielle
            </button>
          </div>
          <div className="fg" style={{ margin: 0, display: 'flex', alignItems: 'flex-end' }}>
            <button
              data-testid="grille-off-llcer-btn"
              type="button"
              className="btn btn-violet"
              onClick={() => { setOfficielInitialId('LLCER'); setOfficielModalOpen(true); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center' }}
              title="Charger la grille officielle LLCER (Spécialité Langues, Littératures et Cultures Étrangères) — Première & Terminale"
            >
              <Award size={14} /> Grille LLCER
            </button>
          </div>
          <div className="fg" style={{ margin: 0, display: 'flex', alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
              <input type="checkbox" checked={g.iCan} onChange={e => commit({ iCan: e.target.checked })} />
              Mode « I can… » (élève)
            </label>
          </div>
        </div>

        {/* Grid editor */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 10 }}>
          <table className="grille-editor-table">
            <thead>
              <tr>
                <th style={{ background: 'var(--card)', minWidth: 110, padding: 8, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                  {g.type === 'cecrl' ? 'Niveau \\ Critère' : 'Critère \\ Niveau'}
                </th>
                {g.cols.map((c, cIdx) => (
                  <th key={cIdx} style={{ background: 'var(--card)', minWidth: 180, padding: 6, position: 'relative' }}>
                    <input className="fi" style={{ fontSize: 12, padding: '6px 8px', fontWeight: 700, textAlign: 'center' }} value={c} onChange={e => {
                      const cols = [...g.cols]; cols[cIdx] = e.target.value; commit({ cols });
                    }} />
                    {g.type === 'cecrl' && (
                      <input className="fi" style={{ fontSize: 10, padding: '3px 6px', marginTop: 3, textAlign: 'center', color: 'var(--text-muted)' }} type="number" min="0" step="0.5" value={g.colsPoints?.[cIdx] || ''} placeholder="/pts" onChange={e => {
                        const cp = [...(g.colsPoints || [])]; cp[cIdx] = parseFloat(e.target.value) || 0; commit({ colsPoints: cp });
                      }} />
                    )}
                    <button className="btn-x-col" onClick={() => removeCol(cIdx)} title="Supprimer la colonne">×</button>
                  </th>
                ))}
                <th style={{ background: 'var(--card)', width: 50 }}>
                  <button className="btn btn-ghost btn-sm" onClick={addCol} title="Ajouter colonne"><Plus size={12} /></button>
                </th>
              </tr>
            </thead>
            <tbody>
              {g.rows.map((r, rIdx) => (
                <tr key={rIdx}>
                  <th style={{ background: 'var(--card)', padding: 6, position: 'relative' }}>
                    <input className="fi" style={{ fontSize: 12, padding: '6px 8px', fontWeight: 700, textAlign: 'center', background: g.type === 'cecrl' ? 'rgba(108,99,255,0.1)' : undefined }} value={r} onChange={e => {
                      const rows = [...g.rows]; rows[rIdx] = e.target.value; commit({ rows });
                    }} />
                    {(g.type === 'critere' || g.rowsPoints?.[rIdx] != null) && (
                      <input className="fi" style={{ fontSize: 10, padding: '3px 6px', marginTop: 3, textAlign: 'center', color: 'var(--text-muted)' }} type="number" min="0" step="0.5" value={g.rowsPoints?.[rIdx] ?? ''} placeholder="/pts" onChange={e => {
                        const rp = [...(g.rowsPoints || [])]; rp[rIdx] = parseFloat(e.target.value) || 0; commit({ rowsPoints: rp });
                      }} />
                    )}
                    <button className="btn-x-col" onClick={() => removeRow(rIdx)} title="Supprimer la ligne">×</button>
                  </th>
                  {g.cols.map((c, cIdx) => {
                    const cell = g.cells?.[`${rIdx}_${cIdx}`] || {};
                    return (
                      <td key={cIdx} style={{ padding: 4, verticalAlign: 'top', position: 'relative' }}>
                        <textarea
                          className="fi field-textarea"
                          style={{ minHeight: 60, fontSize: 11.5, lineHeight: 1.45 }}
                          value={cell.text || ''}
                          onChange={e => setCell(rIdx, cIdx, { text: e.target.value })}
                          placeholder={g.iCan ? 'I can…' : 'Descripteur…'}
                        />
                        {(cell.text || '').trim().length > 0 && (
                          <button
                            data-testid={`refine-cell-${rIdx}-${cIdx}`}
                            type="button"
                            onClick={() => openPhrasesPicker(rIdx, cIdx)}
                            title="Affiner le descripteur — choisir quelles phrases garder"
                            style={{
                              position: 'absolute', top: 6, right: 6,
                              background: 'rgba(108, 99, 255, 0.12)', color: '#4338ca',
                              border: 'none', borderRadius: 4, padding: '2px 5px',
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3,
                              fontSize: 9, fontWeight: 700
                            }}
                          >
                            <Search size={10} /> Affiner
                          </button>
                        )}
                        <input className="fi" style={{ fontSize: 10, padding: '3px 6px', marginTop: 2, textAlign: 'right', color: 'var(--text-muted)' }} value={cell.points || ''} placeholder="pts (ex: 1-2)" onChange={e => setCell(rIdx, cIdx, { points: e.target.value })} />
                      </td>
                    );
                  })}
                  <td />
                </tr>
              ))}
              <tr>
                <td colSpan={g.cols.length + 2} style={{ padding: 8, textAlign: 'center', background: 'var(--card)' }}>
                  <button className="btn btn-ghost btn-sm" onClick={addRow}><Plus size={12} /> Ajouter une ligne</button>
                  {g.type === 'critere' && (
                    <button className="btn btn-ghost btn-sm" onClick={fillTemplate} style={{ marginLeft: 6 }}>✨ Pré-remplir « I can… »</button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button className="btn btn-danger btn-sm" onClick={() => { if (window.confirm('Supprimer cette grille ?')) { onDelete?.(); onClose(); } }}>
              <Trash2 size={12} /> Supprimer
            </button>
          </div>
      {showScoreBar && (
        <div data-testid="score-bar" style={{ marginTop: 12, display: 'grid', gap: 8 }}>
          {/* Carte BONUS — commentaire libre + dropdown 0 à 5 pts par paliers 0.25 */}
          <div style={{
            padding: '10px 14px',
            background: 'linear-gradient(90deg, #ede9fe, #ddd6fe)',
            border: '1px solid #8b5cf6', borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 100 }}>
              <Sparkles size={16} color="#6d28d9" />
              <div>
                <div style={{ fontSize: 10, color: '#5b21b6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Bonus</div>
                <div style={{ fontSize: 10, color: '#6d28d9' }}>Ajout au score brut</div>
              </div>
            </div>
            <input
              data-testid="bonus-comment"
              className="fi"
              type="text"
              placeholder="Commentaire (ex : effort remarquable, investissement…)"
              value={g.bonus?.comment || ''}
              onChange={e => commit({ bonus: { ...(g.bonus || {}), comment: e.target.value, points: g.bonus?.points ?? 0 } })}
              style={{ flex: '1 1 240px', fontSize: 12, background: 'white', borderColor: '#c4b5fd' }}
            />
            <select
              data-testid="bonus-points"
              className="fs"
              value={String(bonusPts)}
              onChange={e => commit({ bonus: { ...(g.bonus || {}), comment: g.bonus?.comment ?? '', points: parseFloat(e.target.value) } })}
              style={{ width: 110, fontSize: 12, fontWeight: 700, background: 'white', borderColor: '#c4b5fd' }}
            >
              {Array.from({ length: 21 }, (_, i) => i * 0.25).map(v => (
                <option key={v} value={String(v)}>{v === 0 ? '— Aucun —' : `+${v} pt${v > 1 ? 's' : ''}`}</option>
              ))}
            </select>
          </div>

          {/* Barre de conversion : Score + Note + Niveau visé (si applicable) */}
          <div data-testid="conv-bar" style={{
            padding: '12px 16px',
            background: 'linear-gradient(90deg, #fef3c7, #fde68a)',
            border: '1px solid #f59e0b', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={18} color="#b45309" />
              <div>
                <div style={{ fontSize: 11, color: '#92400e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Conversion automatique</div>
                <div style={{ fontSize: 11, color: '#78350f' }}>
                  {officielMeta
                    ? <>Grille officielle {officielMeta.id} · {officielMeta.classe} · {officielMeta.langue} — </>
                    : null
                  }
                  Score brut <b>{totalScore}</b>
                  {bonusPts > 0 && <> + bonus <b>{bonusPts}</b></>}
                  {' = '}
                  <b>{scoreAvecBonus}</b> / {totalPts}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: '#92400e', fontWeight: 700 }}>Score total</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#78350f' }} data-testid="conv-score">
                  {scoreAvecBonus} <span style={{ fontSize: 12, fontWeight: 600 }}>/ {totalPts}</span>
                </div>
              </div>
              <div style={{ width: 1, background: '#f59e0b', alignSelf: 'stretch' }} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: '#92400e', fontWeight: 700 }}>Note</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: noteSur20 > 20 ? '#15803d' : '#78350f' }} data-testid="conv-note">
                  {noteSur20 != null ? noteSur20 : '—'} <span style={{ fontSize: 12, fontWeight: 600 }}>/ 20</span>
                </div>
              </div>
              {niveauVise && (
                <>
                  <div style={{ width: 1, background: '#f59e0b', alignSelf: 'stretch' }} />
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#92400e', fontWeight: 700 }}>Niveau atteint</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#78350f' }} data-testid="conv-niveau">
                      {niveauVise}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button className="btn btn-orange btn-sm" onClick={saveToLibrary}><BookmarkPlus size={12} /> Bibliothèque</button>
            <div ref={printMenuRef} style={{ position: 'relative', display: 'inline-block' }}>
              <button
                data-testid="print-menu-btn"
                className="btn btn-blue btn-sm"
                onClick={() => setPrintMenuOpen(v => !v)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <Printer size={12} /> Imprimer ▾
              </button>
              {printMenuOpen && (
                <div data-testid="print-menu" style={{
                  position: 'absolute', bottom: '100%', right: 0, marginBottom: 6,
                  background: 'white', border: '1px solid var(--border)', borderRadius: 10,
                  padding: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  zIndex: 51, minWidth: 240
                }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>📄 Portrait</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 10 }}>
                    {[1, 2, 4, 6].map(n => (
                      <button
                        key={`p-${n}`}
                        data-testid={`print-${n}-portrait`}
                        className="btn btn-ghost btn-sm"
                        style={{ fontWeight: 700 }}
                        onClick={() => { setPrintMenuOpen(false); printGrille(n, 'portrait'); }}
                      >
                        {n}×
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>🖼️ Paysage</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                    {[1, 2, 4, 6].map(n => (
                      <button
                        key={`l-${n}`}
                        data-testid={`print-${n}-landscape`}
                        className="btn btn-ghost btn-sm"
                        style={{ fontWeight: 700 }}
                        onClick={() => { setPrintMenuOpen(false); printGrille(n, 'landscape'); }}
                      >
                        {n}×
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 10, color: '#64748b', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 6 }}>
                    Astuce : 4× ou 6× pour distribuer plusieurs copies vierges aux élèves.
                  </div>
                </div>
              )}
            </div>
            <button className="btn btn-green btn-sm" onClick={onClose}><Save size={12} /> Fermer</button>
          </div>
        </div>
      </div>
      {cecrlModalOpen && (
        <CecrlPresetModal
          grilleType={g.type}
          onClose={() => setCecrlModalOpen(false)}
          onApply={(patch) => commit(patch)}
        />
      )}
      {officielModalOpen && (
        <GrilleOfficielleModal
          initialId={officielInitialId}
          onClose={() => { setOfficielModalOpen(false); setOfficielInitialId(null); }}
          onApply={(patch, meta) => {
            commit({ ...patch, officiel: meta });
            setOfficielMeta(meta);
          }}
        />
      )}
      {phrasesModal && (
        <SentencePickerModal
          state={phrasesModal}
          onToggle={(idx) => {
            const sel = new Set(phrasesModal.selected);
            if (sel.has(idx)) sel.delete(idx); else sel.add(idx);
            setPhrasesModal({ ...phrasesModal, selected: sel });
          }}
          onSelectAll={() => setPhrasesModal({ ...phrasesModal, selected: new Set(phrasesModal.sentences.map((_, i) => i)) })}
          onSelectNone={() => setPhrasesModal({ ...phrasesModal, selected: new Set() })}
          onApply={applyPhrases}
          onClose={() => setPhrasesModal(null)}
        />
      )}
    </div>
  );
};

// ─── Modale "Grille officielle" : config classe/langue + critères/niveaux
const GrilleOfficielleModal = ({ onClose, onApply, initialId = null }) => {
  const [grilleId, setGrilleId] = useState(initialId && GRILLES_OFFICIELLES[initialId] ? initialId : 'COMP');
  const [classe, setClasse] = useState('Première');
  const [langue, setLangue] = useState('LVA');
  const grilleData = GRILLES_OFFICIELLES[grilleId];
  const allCriteres = Object.keys(grilleData.criteres);
  const [selCrit, setSelCrit] = useState(allCriteres);
  const [selNiv, setSelNiv] = useState([...NIVEAUX_OFF]);

  useEffect(() => { setSelCrit(Object.keys(GRILLES_OFFICIELLES[grilleId].criteres)); }, [grilleId]);

  const toggle = (val, setter, list) => setter(list.includes(val) ? list.filter(x => x !== val) : [...list, val]);

  const apply = () => {
    // Lignes = niveaux ; Colonnes = critères ; Cellules = descripteur officiel + points par niveau
    const niveauxOrdered = NIVEAUX_OFF.filter(n => selNiv.includes(n));
    const rows = [...niveauxOrdered];
    const cols = selCrit.map(k => grilleData.criteres[k].label);
    const cells = {};
    niveauxOrdered.forEach((lv, rIdx) => {
      selCrit.forEach((critKey, cIdx) => {
        const desc = grilleData.criteres[critKey][lv];
        // Cellules pré-remplies UNIQUEMENT avec le descripteur officiel.
        // Les points (cell.points) sont laissés vides : c'est au prof de saisir
        // le score qu'il attribue à l'élève sur chaque critère (avec parsePoints
        // qui gère les plages type "4-5" et computeAdaptiveMax pour le total).
        if (desc) cells[`${rIdx}_${cIdx}`] = { text: desc };
      });
    });
    // Points de référence par ligne (niveau) — affichés en en-tête de ligne
    // pour servir d'indice visuel : C2=30, C1=20, B2=10, B1=5, A2=3, A1=1.
    // Utilise les points spécifiques à la grille (LLCER = 35/30/20/10/5/1, autres = 30/20/10/5/3/1)
    const pointsTable = grilleData.points || POINTS_OFF;
    const rowsPoints = niveauxOrdered.map(lv => pointsTable[lv]);
    onApply(
      { type: 'cecrl', competence: grilleData.label, rows, rowsPoints, cols, colsPoints: [], cells, totalPoints: grilleData.maxPts, name: `${grilleData.label} · ${classe} ${langue}` },
      { id: grilleId, classe, langue }
    );
    onClose();
  };

  return (
    <div className="modal-back" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245, 158, 11, 0.15)', color: '#b45309', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
              <Award size={12} /> Grille officielle BAC
            </div>
            <div className="modal-title">Charger une grille officielle</div>
            <div className="modal-sub">Conversion automatique points → note/20 selon classe + langue.</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="fg">
          <label className="fl">Grille</label>
          <select className="fs" value={grilleId} onChange={e => setGrilleId(e.target.value)}>
            {Object.values(GRILLES_OFFICIELLES).map(gr => <option key={gr.id} value={gr.id}>{`${gr.label} — sur ${gr.maxPts} pts`}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div className="fg" style={{ margin: 0 }}>
            <label className="fl">Classe</label>
            <select className="fs" data-testid="off-classe" value={classe} onChange={e => setClasse(e.target.value)}>
              <option value="Seconde">Seconde (table LVA Première)</option>
              <option value="Première">Première</option>
              <option value="Terminale">Terminale</option>
            </select>
          </div>
          <div className="fg" style={{ margin: 0 }}>
            <label className="fl">Langue</label>
            <select className="fs" value={langue} onChange={e => setLangue(e.target.value)}>
              <option value="LVA">LVA (langue principale)</option>
              <option value="LVB">LVB (langue secondaire)</option>
            </select>
          </div>
        </div>

        <div className="fg">
          <label className="fl">Critères à inclure (colonnes)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {allCriteres.map(k => (
              <label key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '5px 9px', borderRadius: 6, border: '1px solid var(--border)', background: selCrit.includes(k) ? '#fef3c7' : 'var(--card)', cursor: 'pointer', fontWeight: 600 }}>
                <input type="checkbox" checked={selCrit.includes(k)} onChange={() => toggle(k, setSelCrit, selCrit)} style={{ margin: 0 }} />
                {grilleData.criteres[k].label}
              </label>
            ))}
          </div>
        </div>

        <div className="fg">
          <label className="fl">Niveaux CECRL (lignes)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {NIVEAUX_OFF.map(lv => (
              <label key={lv} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '4px 10px', borderRadius: 999, border: '1px solid var(--border)', background: selNiv.includes(lv) ? '#f59e0b' : 'var(--card)', color: selNiv.includes(lv) ? '#fff' : 'var(--fg)', cursor: 'pointer', fontWeight: 700 }}>
                <input type="checkbox" checked={selNiv.includes(lv)} onChange={() => toggle(lv, setSelNiv, selNiv)} style={{ display: 'none' }} />
                {lv} <span style={{ opacity: 0.7, fontSize: 9 }}>({(grilleData?.points || POINTS_OFF)[lv]}pt)</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button data-testid="grille-off-apply" className="btn btn-orange" onClick={apply} disabled={!selCrit.length || !selNiv.length}>
            <Award size={14} /> Charger la grille
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modale "Sentence picker" : cocher les phrases à conserver dans un descripteur
const SentencePickerModal = ({ state, onToggle, onSelectAll, onSelectNone, onApply, onClose }) => {
  return (
    <div className="modal-back" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(108, 99, 255, 0.15)', color: '#4338ca', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
              <Search size={12} /> Affiner le descripteur
            </div>
            <div className="modal-title">Choisir les phrases à conserver</div>
            <div className="modal-sub">Coche uniquement ce que tu évalues dans cette case. Les autres seront retirées.</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={onSelectAll}>Tout cocher</button>
          <button className="btn btn-ghost btn-sm" onClick={onSelectNone}>Tout décocher</button>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 4, maxHeight: 350, overflowY: 'auto' }}>
          {state.sentences.length === 0 && <div style={{ padding: 14, color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', fontSize: 12 }}>Aucune phrase à afficher.</div>}
          {state.sentences.map((s, i) => (
            <label key={i} data-testid={`sentence-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: 10, cursor: 'pointer', borderBottom: i < state.sentences.length - 1 ? '1px solid var(--border)' : 'none', background: state.selected.has(i) ? 'rgba(108, 99, 255, 0.05)' : 'transparent' }}>
              <input type="checkbox" checked={state.selected.has(i)} onChange={() => onToggle(i)} style={{ marginTop: 3, flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, lineHeight: 1.5 }}>{s}</span>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}><b>{state.selected.size}</b> phrase(s) sélectionnée(s) sur {state.sentences.length}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button data-testid="phrases-apply" className="btn btn-violet" onClick={onApply}>
              <Search size={14} /> Appliquer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrilleEditor;
