import React, { useState } from 'react';
import { X, BookOpen, Trash2, Plus, Printer } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { SUPPORT_TYPES } from '../data/sequenceurData2';
import { openPrintGrille } from '../utils/printGrille';

const LibraryModal = ({ onClose, onPickStrategy, onPickSupport, onPickGrille }) => {
  const { data, removeFromLibrary, addToLibrary, prefs } = useApp();
  const [tab, setTab] = useState('strategies');
  const lib = data.library || { strategies: [], supports: [], grilles: [] };

  const [draftStrategy, setDraftStrategy] = useState({ name: '', activite: 'CE', niveau: 'B1', text: '' });
  const [draftSupport, setDraftSupport] = useState({ name: '', type: 'texte', title: '', author: '', url: '' });

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ minWidth: 'min(720px, 92vw)', maxHeight: '90vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div className="modal-title"><BookOpen size={20} style={{ display: 'inline', verticalAlign: -3, marginRight: 6 }} /> Bibliothèque</div>
            <div className="modal-sub">Stratégies, supports et grilles à réutiliser dans vos séquences.</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="nav-tabs" style={{ marginBottom: 14 }}>
          <button className={`nav-tab ${tab === 'strategies' ? 'active' : ''}`} onClick={() => setTab('strategies')}>Stratégies ({lib.strategies.length})</button>
          <button className={`nav-tab ${tab === 'supports' ? 'active' : ''}`} onClick={() => setTab('supports')}>Supports ({lib.supports.length})</button>
          <button className={`nav-tab ${tab === 'grilles' ? 'active' : ''}`} onClick={() => setTab('grilles')}>Grilles ({lib.grilles.length})</button>
        </div>

        {tab === 'strategies' && (
          <div>
            <div style={{ background: 'var(--card)', padding: 12, borderRadius: 10, marginBottom: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: 6, marginBottom: 6 }}>
                <input className="fi" placeholder="Nom (ex: Méthodo CO niveau B1)" value={draftStrategy.name} onChange={e => setDraftStrategy({ ...draftStrategy, name: e.target.value })} />
                <select className="fs" value={draftStrategy.activite} onChange={e => setDraftStrategy({ ...draftStrategy, activite: e.target.value })}>
                  {['CE','EOC','EOI','CO','EE','MED'].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <select className="fs" value={draftStrategy.niveau} onChange={e => setDraftStrategy({ ...draftStrategy, niveau: e.target.value })}>
                  {['A1','A2','A2+','B1','B1+','B2','B2+','C1'].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <textarea className="fi field-textarea" rows="2" placeholder="Description de la stratégie…" value={draftStrategy.text} onChange={e => setDraftStrategy({ ...draftStrategy, text: e.target.value })} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <button className="btn btn-green btn-sm" disabled={!draftStrategy.name || !draftStrategy.text} onClick={() => {
                  addToLibrary('strategies', draftStrategy);
                  setDraftStrategy({ name: '', activite: 'CE', niveau: 'B1', text: '' });
                }}><Plus size={12} /> Ajouter</button>
              </div>
            </div>
            {lib.strategies.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>Aucune stratégie enregistrée.</p>}
            {lib.strategies.map(s => (
              <LibCard key={s.id} onPick={onPickStrategy ? () => { onPickStrategy(s); onClose(); } : null} onDelete={() => removeFromLibrary('strategies', s.id)}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                  <span className="tag-level">{s.niveau}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(108,99,255,0.12)', color: '#5b21b6' }}>{s.activite}</span>
                  <strong style={{ fontSize: 13 }}>{s.name}</strong>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.text}</div>
              </LibCard>
            ))}
          </div>
        )}

        {tab === 'supports' && (
          <div>
            <div style={{ background: 'var(--card)', padding: 12, borderRadius: 10, marginBottom: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: 6, marginBottom: 6 }}>
                <input className="fi" placeholder="Nom court (ex: Howl's Moving Castle)" value={draftSupport.name} onChange={e => setDraftSupport({ ...draftSupport, name: e.target.value })} />
                <select className="fs" value={draftSupport.type} onChange={e => setDraftSupport({ ...draftSupport, type: e.target.value })}>
                  {SUPPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
                <input className="fi" placeholder="Titre complet" value={draftSupport.title} onChange={e => setDraftSupport({ ...draftSupport, title: e.target.value })} />
                <input className="fi" placeholder="Auteur / Source" value={draftSupport.author} onChange={e => setDraftSupport({ ...draftSupport, author: e.target.value })} />
              </div>
              <input className="fi" placeholder="URL (optionnel)" value={draftSupport.url} onChange={e => setDraftSupport({ ...draftSupport, url: e.target.value })} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <button className="btn btn-green btn-sm" disabled={!draftSupport.name} onClick={() => {
                  addToLibrary('supports', draftSupport);
                  setDraftSupport({ name: '', type: 'texte', title: '', author: '', url: '' });
                }}><Plus size={12} /> Ajouter</button>
              </div>
            </div>
            {lib.supports.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>Aucun support enregistré.</p>}
            {lib.supports.map(s => {
              const tInfo = SUPPORT_TYPES.find(t => t.value === s.type);
              return (
                <LibCard key={s.id} onPick={onPickSupport ? () => { onPickSupport(s); onClose(); } : null} onDelete={() => removeFromLibrary('supports', s.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: (tInfo?.color || '#888') + '22', color: tInfo?.color || '#888' }}>{tInfo?.label || s.type}</span>
                    <strong style={{ fontSize: 13 }}>{s.name}</strong>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {s.title && <span>{s.title}</span>}
                    {s.author && <span> · <i>{s.author}</i></span>}
                    {s.url && <span> · <a href={s.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent2)' }}>lien</a></span>}
                  </div>
                </LibCard>
              );
            })}
          </div>
        )}

        {tab === 'grilles' && (
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>💡 Les grilles s'enregistrent depuis l'éditeur de grille (icône signet).</p>
            {lib.grilles.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>Aucune grille enregistrée.</p>}
            {lib.grilles.map(g => (
              <LibCard
                key={g.id}
                onPick={onPickGrille ? () => { onPickGrille(g); onClose(); } : null}
                onDelete={() => removeFromLibrary('grilles', g.id)}
                extraActions={
                  <button
                    data-testid={`lib-print-${g.id}`}
                    className="btn btn-blue btn-sm"
                    title="Imprimer / télécharger cette grille"
                    onClick={() => openPrintGrille(g.grille, { perPage: 1, orientation: 'portrait', profName: prefs?.profName || '' })}
                  >
                    <Printer size={12} /> Imprimer
                  </button>
                }
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(62,207,142,0.12)', color: '#059669' }}>{g.grille?.competence || 'EE'}</span>
                  <strong style={{ fontSize: 13 }}>{g.name}</strong>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>· /{g.grille?.totalPoints || '?'} pts · {g.grille?.type === 'cecrl' ? 'CECRL' : 'Critères'}</span>
                </div>
              </LibCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const LibCard = ({ children, onPick, onDelete, extraActions }) => (
  <div style={{ background: 'var(--card)', padding: 10, borderRadius: 8, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
      {extraActions}
      {onPick && <button className="btn btn-green btn-sm" onClick={onPick}>Utiliser</button>}
      <button className="btn btn-ghost btn-sm" onClick={onDelete} title="Supprimer"><Trash2 size={12} /></button>
    </div>
  </div>
);

export default LibraryModal;
