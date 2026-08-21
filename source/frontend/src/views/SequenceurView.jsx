import React, { useState, useMemo, useEffect } from 'react';
import { useApp, newSequence } from '../contexts/AppContext';
import { NIVEAUX_LYCEE } from '../data/sequenceurData';
import { Plus, Trash2, Copy, Download, ChevronLeft, BookOpen, GripVertical } from 'lucide-react';
import SequenceEditor from '../components/SequenceEditor';
import ResizableGutter from '../components/ResizableGutter';
import A4Preview from '../components/A4Preview';

const SequenceurView = () => {
  const { data, upsertSequence, deleteSequence, duplicateSequence } = useApp();
  const [stage, setStage] = useState('home'); // home | level | editor
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [sortBy, setSortBy] = useState('recent');

  // Compteur séquences par niveau
  const counts = useMemo(() => {
    const c = {};
    NIVEAUX_LYCEE.forEach(n => { c[n.value] = 0; });
    data.sequences.forEach(s => { if (s.niveau && c[s.niveau] !== undefined) c[s.niveau]++; });
    return c;
  }, [data.sequences]);

  const levelSequences = useMemo(() => {
    if (!selectedLevel) return [];
    let arr = data.sequences.filter(s => s.niveau === selectedLevel);
    arr = [...arr].sort((a, b) => {
      if (sortBy === 'manual') return (a.order ?? 999999) - (b.order ?? 999999);
      if (sortBy === 'recent') return (b.updatedAt || 0) - (a.updatedAt || 0);
      if (sortBy === 'title-asc') return (a.titre || '').localeCompare(b.titre || '');
      if (sortBy === 'year-desc') return (b.annee || '').localeCompare(a.annee || '');
      if (sortBy === 'year-asc') return (a.annee || '').localeCompare(b.annee || '');
      return 0;
    });
    return arr;
  }, [data.sequences, selectedLevel, sortBy]);

  // Drag-and-drop : réordonne les séquences du niveau et met à jour le champ `order`
  // de chaque séquence concernée. Active automatiquement le tri "Manuel".
  const reorderSequences = (fromIdx, toIdx) => {
    if (fromIdx === toIdx) return;
    const arr = [...levelSequences];
    const [moved] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, moved);
    arr.forEach((s, i) => upsertSequence({ ...s, order: i }));
    if (sortBy !== 'manual') setSortBy('manual');
  };

  const editingSeq = useMemo(() => data.sequences.find(s => s.id === editingId), [data.sequences, editingId]);

  const openEditor = (id) => { setEditingId(id); setStage('editor'); };

  const createSequence = (niveau) => {
    const ns = newSequence();
    ns.niveau = niveau;
    upsertSequence(ns);
    openEditor(ns.id);
  };

  useEffect(() => {
    if (stage === 'editor' && !editingSeq) {
      setStage('home');
      setEditingId(null);
    }
  }, [stage, editingSeq]);

  // ============ HOME ============
  if (stage === 'home') {
    const groups = ['Tronc Commun', 'Spécialités'];
    return (
      <div className="app-view" style={{ display: 'block', overflowY: 'auto' }}>
        <div className="dash">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
            <div>
              <h1 className="dash-title">Mes Séquences</h1>
              <p className="dash-sub">Choisissez un niveau pour créer ou retrouver vos séquences — Anglais Lycée.</p>
            </div>
          </div>
          {groups.map(g => (
            <div key={g} style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: 'var(--accent2)', textTransform: 'uppercase', marginBottom: 14 }}>
                {g === 'Tronc Commun' ? '── Tronc Commun ──' : '── Spécialités ──'}
              </div>
              <div className="grid">
                {NIVEAUX_LYCEE.filter(n => n.group === g).map(n => (
                  <div key={n.value} className="pcard" onClick={() => { setSelectedLevel(n.value); setStage('level'); }}>
                    <div className="pcard-ico"><BookOpen size={26} /></div>
                    <div className="pcard-niv">{n.label}</div>
                    <div className="pcard-year">Anglais</div>
                    <div className="pcard-stats">
                      <span>{counts[n.value]} séquence{counts[n.value] > 1 ? 's' : ''}</span>
                      <span style={{ color: 'var(--accent2)', fontWeight: 700 }}>Ouvrir →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============ LEVEL ============
  if (stage === 'level') {
    const levelLabel = NIVEAUX_LYCEE.find(n => n.value === selectedLevel)?.label || selectedLevel;
    return (
      <div className="app-view" style={{ display: 'block', overflowY: 'auto' }}>
        <div className="dash">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setStage('home')}>
              <ChevronLeft size={14} /> Retour
            </button>
            <h1 className="dash-title" style={{ marginBottom: 0 }}>{levelLabel}</h1>
          </div>
          <p className="dash-sub">Vos séquences pour ce niveau.</p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
            <label className="fl" style={{ margin: 0 }}>Trier par :</label>
            <select className="fs" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ maxWidth: 240 }}>
              <option value="manual">Manuel (glisser-déposer)</option>
              <option value="recent">Modification récente</option>
              <option value="title-asc">Titre (A → Z)</option>
              <option value="year-desc">Année (récent → ancien)</option>
              <option value="year-asc">Année (ancien → récent)</option>
            </select>
            {sortBy === 'manual' && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                <GripVertical size={9} style={{ verticalAlign: -1 }} /> Glisse les cartes par leur poignée pour les réordonner
              </span>
            )}
          </div>
          <div className="grid">
            <div className="pcard pcard-new" onClick={() => createSequence(selectedLevel)}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                <Plus size={28} />
              </div>
              <div style={{ fontWeight: 700 }}>Créer une séquence</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Nouvelle fiche de bord</div>
            </div>
            {levelSequences.map((s, idx) => (
              <div
                key={s.id}
                className="pcard"
                draggable={sortBy === 'manual'}
                onDragStart={e => { if (sortBy !== 'manual') { e.preventDefault(); return; } e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(idx)); }}
                onDragOver={e => { if (sortBy !== 'manual') return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = ''; }}
                onDrop={e => {
                  if (sortBy !== 'manual') return;
                  e.preventDefault();
                  e.currentTarget.style.borderColor = '';
                  const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                  if (!isNaN(fromIdx)) reorderSequences(fromIdx, idx);
                }}
                onClick={() => openEditor(s.id)}
                style={{ position: 'relative', cursor: 'pointer' }}
              >
                {sortBy === 'manual' && (
                  <div style={{ position: 'absolute', top: 8, left: 8, color: 'var(--text-muted)', cursor: 'grab' }} title="Glisser pour réordonner" onClick={e => e.stopPropagation()}>
                    <GripVertical size={14} />
                  </div>
                )}
                <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: 'rgba(108,99,255,0.15)', color: 'var(--primary)', letterSpacing: 0.5 }}>N°{idx + 1}</div>
                <div className="pcard-actions" onClick={e => e.stopPropagation()}>
                  <button className="pcard-act" title="Dupliquer" onClick={() => duplicateSequence(s.id)}>
                    <Copy size={12} />
                  </button>
                  <button className="pcard-act danger" title="Supprimer" onClick={() => { if (window.confirm('Supprimer cette séquence ?')) deleteSequence(s.id); }}>
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="pcard-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 800, marginBottom: 6, paddingLeft: sortBy === 'manual' ? 22 : 0, paddingRight: 40 }}>
                  {s.titre || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sans titre</span>}
                </div>
                {s.annee && <div className="pcard-year">{s.annee}</div>}
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, minHeight: 32, lineHeight: 1.4 }}>
                  {s.problematique ? (s.problematique.length > 80 ? s.problematique.slice(0, 80) + '…' : s.problematique) : <i>Pas encore de problématique</i>}
                </div>
                <div className="pcard-stats">
                  <span>{(s.seances || []).length} séance{(s.seances || []).length > 1 ? 's' : ''}</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Éditer →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============ EDITOR ============
  if (stage === 'editor' && editingSeq) {
    return (
      <div className="app-view">
        <div className="seq-layout">
          <SequenceEditor
            sequence={editingSeq}
            onChange={(updated) => upsertSequence(updated)}
            onBack={() => setStage('level')}
          />
          <ResizableGutter />
          <div className="preview-panel">
            <A4Preview sequence={editingSeq} />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SequenceurView;
