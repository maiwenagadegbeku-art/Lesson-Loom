import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { NIVEAUX_LYCEE, GRAMMAR, PHONO, AXES } from '../data/sequenceurData';
import { ChevronLeft, Plus, Trash2, Target, Settings, Compass } from 'lucide-react';

const hasLvSelector = (niv) => niv === 'Seconde' || niv === 'Première' || niv === 'Terminale';
const grammarKey = (niveau, lv) => hasLvSelector(niveau) ? `${niveau}_${lv}` : niveau;

const ProgressionView = () => {
  const { data, upsertProgression, deleteProgression } = useApp();
  const [stage, setStage] = useState('home');
  const [activeId, setActiveId] = useState(null);

  const active = data.progressions.find(p => p.id === activeId);

  const createProgression = (niveau) => {
    const p = {
      id: 'prog_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      niveau,
      lv: 'LVAB',
      title: `Progression annuelle — ${niveau.replace(/_/g, ' ')}`,
      sequenceIds: []
    };
    upsertProgression(p);
    setActiveId(p.id);
    setStage('editor');
  };

  if (stage === 'home') {
    return (
      <div className="app-view" style={{ display: 'block', overflowY: 'auto' }}>
        <div className="dash">
          <h1 className="dash-title">Progressions annuelles</h1>
          <p className="dash-sub">Planifiez l'enchainement de vos séquences sur l'année.</p>
          <div className="grid">
            {data.progressions.map(p => (
              <div key={p.id} className="pcard" onClick={() => { setActiveId(p.id); setStage('editor'); }}>
                <div className="pcard-actions" onClick={e => e.stopPropagation()}>
                  <button className="pcard-act danger" onClick={() => { if (window.confirm('Supprimer cette progression ?')) deleteProgression(p.id); }}><Trash2 size={12} /></button>
                </div>
                <div className="pcard-ico"><Target size={26} /></div>
                <div className="pcard-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 800 }}>{p.title}</div>
                <div className="pcard-year">{p.niveau.replace(/_/g, ' ')}</div>
                <div className="pcard-stats">
                  <span>{p.sequenceIds.length} séquence{p.sequenceIds.length > 1 ? 's' : ''}</span>
                  <span style={{ color: 'var(--accent2)', fontWeight: 700 }}>Ouvrir →</span>
                </div>
              </div>
            ))}
            <div className="pcard pcard-new" onClick={() => setStage('choose-level')}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                <Plus size={28} />
              </div>
              <div style={{ fontWeight: 700 }}>Nouvelle progression</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'choose-level') {
    return (
      <div className="app-view" style={{ display: 'block', overflowY: 'auto' }}>
        <div className="dash">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setStage('home')}>
              <ChevronLeft size={14} /> Retour
            </button>
            <h1 className="dash-title" style={{ marginBottom: 0 }}>Choisir un niveau</h1>
          </div>
          <div className="grid">
            {NIVEAUX_LYCEE.map(n => (
              <div key={n.value} className="pcard" onClick={() => createProgression(n.value)}>
                <div className="pcard-niv">{n.label}</div>
                <div className="pcard-year">{n.group}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'editor' && active) {
    return <ProgressionEditor progression={active} onBack={() => setStage('home')} />;
  }
  return null;
};

const ProgressionEditor = ({ progression, onBack }) => {
  const { data, upsertProgression } = useApp();
  const p = progression;
  const availSequences = data.sequences.filter(s => s.niveau === p.niveau && !p.sequenceIds.includes(s.id));
  const includedSequences = p.sequenceIds.map(id => data.sequences.find(s => s.id === id)).filter(Boolean);

  const grammarTotal = (GRAMMAR[grammarKey(p.niveau, p.lv)] || []);
  const phonoTotal = (PHONO[grammarKey(p.niveau, p.lv)] || []);
  // Axes officiels selon le niveau (Seconde/Première/Terminale, AXES BO).
  // Pour les filières spé (LLCER), on tombe sur Première/Terminale.
  const axesNiveau = AXES[p.niveau] || AXES[p.niveau?.split('_')[0]] || {};
  const axesAvailable = Object.keys(axesNiveau);

  // Couverture
  const coveredGrammar = new Set();
  const coveredPhono = new Set();
  const coveredAxes = new Set();
  const coveredObjets = new Set();
  includedSequences.forEach(s => {
    (s.tags?.grammar || []).forEach(t => coveredGrammar.add(t.text));
    (s.tags?.phono || []).forEach(t => coveredPhono.add(t.text));
    if (s.axe) coveredAxes.add(s.axe);
    if (s.axeMineur) coveredAxes.add(s.axeMineur);
    (s.tags?.culture || []).forEach(t => coveredObjets.add(t.text));
  });

  const addSeq = (id) => upsertProgression({ ...p, sequenceIds: [...p.sequenceIds, id] });
  const removeSeq = (id) => upsertProgression({ ...p, sequenceIds: p.sequenceIds.filter(x => x !== id) });
  const moveSeq = (id, dir) => {
    const idx = p.sequenceIds.indexOf(id);
    if (idx === -1) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= p.sequenceIds.length) return;
    const arr = [...p.sequenceIds];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    upsertProgression({ ...p, sequenceIds: arr });
  };

  return (
    <div className="app-view">
      <div className="prog-layout">
        <div className="tracker">
          <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 14 }}>
            <ChevronLeft size={14} /> Retour
          </button>

          {/* ─── PARAMÈTRES ─── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--accent2)', marginBottom: 8 }}>
            <Settings size={13} /> Paramètres
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 10, marginBottom: 16 }}>
            <input
              data-testid="prog-title"
              className="fi"
              value={p.title}
              onChange={e => upsertProgression({ ...p, title: e.target.value })}
              style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 800, marginBottom: 10 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontWeight: 700, marginBottom: 2 }}>Niveau</div>
                <div style={{ fontWeight: 700, color: 'var(--fg)' }}>{p.niveau.replace(/_/g, ' ')}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontWeight: 700, marginBottom: 2 }}>Langue</div>
                {/Seconde|Première|Terminale/.test(p.niveau) && !p.niveau.includes('_') ? (
                  <select className="fs" data-testid="prog-lv" value={p.lv} onChange={e => upsertProgression({ ...p, lv: e.target.value })} style={{ fontSize: 11, padding: '2px 6px' }}>
                    <option value="LVAB">LV A / LV B</option>
                    <option value="LVC">LV C</option>
                  </select>
                ) : (
                  <div style={{ fontWeight: 700, color: 'var(--fg)' }}>{p.lv}</div>
                )}
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontWeight: 700, marginBottom: 2 }}>Séquences</div>
                <div style={{ fontWeight: 700, color: 'var(--fg)' }}>{includedSequences.length}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontWeight: 700, marginBottom: 2 }}>Axes vus</div>
                <div style={{ fontWeight: 700, color: 'var(--fg)' }}>{coveredAxes.size} / {axesAvailable.length}</div>
              </div>
            </div>
          </div>

          {/* ─── COUVERTURE PROGRAMME ─── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--accent2)', borderBottom: '1px solid var(--border)', paddingBottom: 6, marginBottom: 12 }}>
            <Target size={13} /> Couverture du programme
          </div>
          <AxesCoverageBlock axes={axesAvailable} covered={coveredAxes} objetsBy={axesNiveau} coveredObjets={coveredObjets} />
          <CoverageBlock title="Grammaire" items={grammarTotal} covered={coveredGrammar} />
          <CoverageBlock title="Phonologie" items={phonoTotal} covered={coveredPhono} />
        </div>
        <div className="timeline">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Séquences de la progression</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>Glissez l'ordre avec les flèches pour planifier l'année.</p>

          {includedSequences.length === 0 && (
            <div style={{ background: 'var(--panel)', border: '1px dashed var(--border)', padding: 24, borderRadius: 14, textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Aucune séquence dans cette progression pour le moment.
            </div>
          )}

          {includedSequences.map((s, idx) => (
            <div key={s.id} className="sc">
              <div className="sc-hdr">
                <span className="sc-num">Séquence {idx + 1}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => moveSeq(s.id, -1)} disabled={idx === 0}>↑</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => moveSeq(s.id, 1)} disabled={idx === includedSequences.length - 1}>↓</button>
                  <button className="btn btn-danger btn-sm" onClick={() => removeSeq(s.id)}><Trash2 size={12} /></button>
                </div>
              </div>
              <div className="sc-title">{s.titre || 'Sans titre'}</div>
              {s.problematique && <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 8 }}>« {s.problematique} »</div>}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(s.tags?.grammar || []).slice(0, 3).map((t, i) => <span key={i} className="tag g"><span className="tl">{t.text}</span></span>)}
                {(s.tags?.phono || []).slice(0, 2).map((t, i) => <span key={i} className="tag o"><span className="tl">{t.text}</span></span>)}
              </div>
            </div>
          ))}

          {availSequences.length > 0 && (
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--accent2)', marginBottom: 10 }}>Ajouter une séquence existante</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {availSequences.map(s => (
                  <button key={s.id} className="btn btn-ghost btn-sm" onClick={() => addSeq(s.id)}>
                    <Plus size={11} /> {s.titre || 'Sans titre'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AxesCoverageBlock = ({ axes, covered, objetsBy, coveredObjets }) => {
  if (!axes || axes.length === 0) return null;
  const okCount = axes.filter(a => covered.has(a)).length;
  const pct = axes.length > 0 ? Math.round((okCount / axes.length) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
        <span><Compass size={11} style={{ verticalAlign: -1, marginRight: 4 }} />Axes BO</span>
        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, background: pct === 100 ? 'var(--ok-bg)' : 'var(--miss)', color: pct === 100 ? 'var(--ok)' : '#ef4444' }}>{okCount}/{axes.length} ({pct}%)</span>
      </div>
      <div style={{ background: 'var(--card)', borderRadius: 20, height: 6, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ width: pct + '%', height: '100%', background: 'linear-gradient(90deg, #7c3aed, #4338ca)', transition: 'width 0.5s' }} />
      </div>
      <div>
        {axes.map((axe, i) => {
          const isCov = covered.has(axe);
          const objets = objetsBy[axe] || [];
          const nObj = objets.length;
          const okObj = objets.filter(o => coveredObjets.has(o)).length;
          return (
            <details
              key={i}
              data-testid={`axe-cov-${i}`}
              style={{ fontSize: 10, padding: '4px 8px', borderRadius: 5, marginBottom: 4, background: 'var(--card)', borderLeft: isCov ? '3px solid #7c3aed' : '3px solid #f87171' }}
            >
              <summary style={{ cursor: 'pointer', color: isCov ? 'var(--text)' : 'var(--text-muted)', listStyle: 'none' }}>
                {isCov ? '✓ ' : '○ '}<b>{axe.length > 60 ? axe.slice(0, 60) + '…' : axe}</b>
                {nObj > 0 && <span style={{ marginLeft: 6, color: 'var(--text-muted)', fontWeight: 500 }}>({okObj}/{nObj} objets)</span>}
              </summary>
              {nObj > 0 && (
                <div style={{ marginTop: 4, paddingLeft: 12 }}>
                  {objets.map((o, oi) => (
                    <div key={oi} style={{ fontSize: 9, padding: '2px 0', color: coveredObjets.has(o) ? '#7c3aed' : 'var(--text-muted)' }}>
                      {coveredObjets.has(o) ? '✓ ' : '○ '}{o}
                    </div>
                  ))}
                </div>
              )}
            </details>
          );
        })}
      </div>
    </div>
  );
};

const CoverageBlock = ({ title, items, covered }) => {
  if (items.length === 0) return null;
  const okCount = items.filter(i => covered.has(i)).length;
  const pct = items.length > 0 ? Math.round((okCount / items.length) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
        <span>{title}</span>
        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, background: pct === 100 ? 'var(--ok-bg)' : 'var(--miss)', color: pct === 100 ? 'var(--ok)' : '#ef4444' }}>{okCount}/{items.length} ({pct}%)</span>
      </div>
      <div style={{ background: 'var(--card)', borderRadius: 20, height: 6, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ width: pct + '%', height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent4))', transition: 'width 0.5s' }} />
      </div>
      <div>
        {items.slice(0, 30).map((it, i) => (
          <div key={i} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 5, marginBottom: 2, background: 'var(--card)', borderLeft: covered.has(it) ? '3px solid var(--ok)' : '3px solid #f87171', color: covered.has(it) ? 'var(--text)' : 'var(--text-muted)' }}>
            {covered.has(it) ? '✓ ' : '○ '}{it.length > 45 ? it.slice(0, 45) + '…' : it}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressionView;
