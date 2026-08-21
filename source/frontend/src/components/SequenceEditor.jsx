import React, { useState, useMemo } from 'react';
import { ChevronLeft, Pencil, Target, CalendarDays, FileDown, Plus, X, ImageIcon, Type as TypeIcon, BookOpen, Library as LibIcon, Settings2, ListChecks, Sparkles, BookText, FileSpreadsheet, Link2, GraduationCap } from 'lucide-react';
import { AXES, GRAMMAR, PHONO, COMPETENCES, CECRL_DESCRIPTORS, PRAG_SUBCOMPS, PRAG_DESCRIPTORS, FONTS, getAllGrammar, getAllPhono } from '../data/sequenceurData';
import { ACTIVITES_FR, NIVEAUX_CIBLES, NOMENCLATURE_OPTIONS, TEST_TYPES, SUPPORT_TYPES } from '../data/sequenceurData2';
import { useApp, newGrille, hydrateSequence } from '../contexts/AppContext';
import ExportModal from './ExportModal';
import GrilleEditor from './GrilleEditor';
import LibraryModal from './LibraryModal';

const hasLvSelector = (niv) => niv === 'Seconde' || niv === 'Première' || niv === 'Terminale';
const isDNL = (niv) => niv === 'DNL';
const grammarKey = (niveau, lv) => hasLvSelector(niveau) ? `${niveau}_${lv}` : niveau;

const TABS = [
  { id: 'identite', label: 'Identité', Icon: Settings2 },
  { id: 'activites', label: 'Activités langagières', Icon: Sparkles },
  { id: 'linguistique', label: 'Linguistique', Icon: BookText },
  { id: 'projet', label: 'Projet & Tâches', Icon: ListChecks },
  { id: 'evaluations', label: 'Évaluations & Grilles', Icon: GraduationCap },
  { id: 'ressources', label: 'Supports & Ressources', Icon: Link2 }
];

const SequenceEditor = ({ sequence, onChange, onBack }) => {
  const { setActiveView, setTargetSeqId } = useApp();
  const [exportOpen, setExportOpen] = useState(false);
  const [libOpen, setLibOpen] = useState(false);
  const [libPickerFor, setLibPickerFor] = useState(null); // 'strategy' | 'support' | null
  const [activeTab, setActiveTab] = useState('identite');
  const [grilleEditing, setGrilleEditing] = useState(null);

  const seq = hydrateSequence(sequence);
  const update = (patch) => onChange({ ...seq, ...patch });
  const updateActivite = (code, patch) => {
    const next = { ...(seq.activitesFR || {}), [code]: { ...(seq.activitesFR?.[code] || {}), ...patch } };
    update({ activitesFR: next });
  };

  const setTag = (key, arr) => onChange({ ...seq, tags: { ...seq.tags, [key]: arr } });
  const addTag = (key, item) => {
    if (!item || !item.text) return;
    const list = seq.tags[key] || [];
    if (list.some(x => x.text === item.text && x.level === item.level)) return;
    setTag(key, [...list, item]);
  };
  const removeTag = (key, idx) => {
    const list = [...(seq.tags[key] || [])];
    list.splice(idx, 1);
    setTag(key, list);
  };

  const TagList = ({ tagKey, color = 'v' }) => (
    <div className="added-tags">
      {(seq.tags[tagKey] || []).map((t, i) => (
        <span key={i} className={`tag ${color}`}>
          {t.level && <span className="tag-level">{t.level}</span>}
          <span className="tl">{t.text}</span>
          <button className="tr" onClick={() => removeTag(tagKey, i)} aria-label="Supprimer"><X size={12} /></button>
        </span>
      ))}
    </div>
  );

  const missing = [];
  if (!seq.niveau) missing.push('Niveau');
  if (!/^\d{4}-\d{4}$/.test(seq.annee || '')) missing.push('Année scolaire');
  if (!(seq.titre || '').trim()) missing.push('Titre');

  return (
    <>
      <div className="editor-panel" style={{ fontFamily: seq.font || undefined, fontSize: `${(seq.fontSize || 1) * 13}px` }}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={onBack}>
            <ChevronLeft size={14} /> Mes séquences
          </button>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setLibOpen(true)} title="Bibliothèque">
              <LibIcon size={12} /> Biblio
            </button>
            <button className="btn btn-pink btn-sm" onClick={() => { setTargetSeqId(sequence.id); setActiveView('sea'); }}><Pencil size={12} /> Séances</button>
            <button className="btn btn-orange btn-sm" onClick={() => setActiveView('prog')}><Target size={12} /> Progression</button>
            <button className="btn btn-blue btn-sm" onClick={() => setActiveView('cal')}><CalendarDays size={12} /> Calendrier</button>
            <span style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 4px' }} />
            <button className="btn btn-violet btn-sm" onClick={() => setExportOpen(true)}>
              <FileDown size={12} /> Exporter
            </button>
          </div>
        </div>

        {missing.length > 0 && (
          <div style={{ marginBottom: 12, padding: '8px 11px', background: 'var(--warn-bg)', borderLeft: '3px solid var(--warn-border)', borderRadius: 6, fontSize: 11.5, color: 'var(--warn-text)' }}>
            ⚠️ Champs manquants : <b>{missing.join(', ')}</b>
          </div>
        )}

        {/* Tabs */}
        <div className="editor-tabs">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} className={`editor-tab ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        {activeTab === 'identite' && (
          <IdentiteSection seq={seq} update={update} addTag={addTag} removeTag={removeTag} TagList={TagList} />
        )}
        {activeTab === 'activites' && (
          <ActivitesSection seq={seq} update={update} updateActivite={updateActivite} addTag={addTag} TagList={TagList} onPickStrategy={() => { setLibPickerFor('strategy'); setLibOpen(true); }} />
        )}
        {activeTab === 'linguistique' && (
          <LinguistiqueSection seq={seq} update={update} addTag={addTag} TagList={TagList} />
        )}
        {activeTab === 'projet' && (
          <ProjetSection seq={seq} update={update} addTag={addTag} TagList={TagList} />
        )}
        {activeTab === 'evaluations' && (
          <EvaluationsSection seq={seq} update={update} onEditGrille={(g) => setGrilleEditing(g)} />
        )}
        {activeTab === 'ressources' && (
          <RessourcesSection seq={seq} update={update} addTag={addTag} TagList={TagList} onPickSupport={() => { setLibPickerFor('support'); setLibOpen(true); }} />
        )}
      </div>

      {exportOpen && <ExportModal sequence={seq} onClose={() => setExportOpen(false)} />}
      {grilleEditing && (
        <GrilleEditor
          grille={grilleEditing}
          onChange={(g) => {
            const grilles = (seq.grilles || []).map(x => x.id === g.id ? g : x);
            update({ grilles });
            setGrilleEditing(g);
          }}
          onDelete={() => {
            const grilles = (seq.grilles || []).filter(x => x.id !== grilleEditing.id);
            update({ grilles });
            setGrilleEditing(null);
          }}
          onClose={() => setGrilleEditing(null)}
        />
      )}
      {libOpen && (
        <LibraryModal
          onClose={() => { setLibOpen(false); setLibPickerFor(null); }}
          onPickStrategy={libPickerFor === 'strategy' ? (s) => {
            const code = s.activite || 'CE';
            const cur = seq.activitesFR?.[code] || {};
            const next = (cur.strategies ? cur.strategies + '\n' : '') + s.text;
            updateActivite(code, { strategies: next, niveauCible: cur.niveauCible || s.niveau });
          } : null}
          onPickSupport={libPickerFor === 'support' ? (sup) => {
            const item = { id: 'sup_' + Date.now(), type: sup.type, title: sup.title || sup.name, author: sup.author, url: sup.url, description: '' };
            update({ supportsPlus: [...(seq.supportsPlus || []), item] });
          } : null}
          onPickGrille={(lg) => {
            const fresh = { ...lg.grille, id: 'gr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5), name: lg.name };
            update({ grilles: [...(seq.grilles || []), fresh] });
            setGrilleEditing(fresh);
          }}
        />
      )}
    </>
  );
};

// ============== TAB 1 : IDENTITE ==============
const IdentiteSection = ({ seq, update, addTag, TagList }) => {
  const axesForLevel = AXES[seq.niveau] || {};
  const axisKeys = Object.keys(axesForLevel);
  const objetsForAxe = (seq.axe && axesForLevel[seq.axe]) ? axesForLevel[seq.axe] : [];
  const [objetSel, setObjetSel] = useState('');
  const [objetFree, setObjetFree] = useState('');

  return (
    <>
      <div className="section-label purple">En-tête</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="fg">
          <label className="fl">Niveau <span style={{ color: 'var(--accent-r)' }}>*</span></label>
          <select className="fs" value={seq.niveau} onChange={e => update({ niveau: e.target.value, axe: '', axeMineur: '' })}>
            <option value="">— Choisir —</option>
            <optgroup label="── Lycée Tronc Commun ──">
              <option value="Seconde">Seconde</option>
              <option value="Première">Première</option>
              <option value="Terminale">Terminale</option>
              <option value="DNL">DNL (Discipline Non Linguistique)</option>
            </optgroup>
            <optgroup label="── Lycée Spécialités ──">
              <option value="Première_AMC">Première AMC</option>
              <option value="Terminale_AMC">Terminale AMC</option>
              <option value="Première_LLCER">Première LLCER</option>
              <option value="Terminale_LLCER">Terminale LLCER</option>
            </optgroup>
          </select>
        </div>
        {isDNL(seq.niveau) && (
          <div className="fg">
            <label className="fl">Classe enseignée <span style={{ color: 'var(--accent-r)' }}>*</span></label>
            <select className="fs" value={seq.dnlLevel || ''} onChange={e => update({ dnlLevel: e.target.value })}>
              <option value="">— Choisir —</option>
              <option value="Seconde">Seconde</option>
              <option value="Première">Première</option>
              <option value="Terminale">Terminale</option>
            </select>
          </div>
        )}
        {isDNL(seq.niveau) && (
          <div className="fg">
            <label className="fl">Discipline enseignée <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 10 }}>— saisie libre</span></label>
            <input className="fi" value={seq.dnlDiscipline || ''} onChange={e => update({ dnlDiscipline: e.target.value })} placeholder="Ex : Histoire-Géographie, Mathématiques, SVT, Physique-Chimie…" />
          </div>
        )}
        {hasLvSelector(seq.niveau) && (
          <div className="fg">
            <label className="fl">Type de langue</label>
            <select className="fs" value={seq.lv || 'LVAB'} onChange={e => update({ lv: e.target.value })}>
              <option value="LVAB">LV A / LV B</option>
              <option value="LVC">LV C</option>
            </select>
          </div>
        )}
        <div className="fg">
          <label className="fl">Année scolaire <span style={{ color: 'var(--accent-r)' }}>*</span></label>
          <input className="fi" value={seq.annee || ''} onChange={e => update({ annee: e.target.value })} placeholder="2025-2026" />
        </div>
        <div className="fg">
          <label className="fl">N° séquence</label>
          <input className="fi" value={seq.numero || ''} onChange={e => update({ numero: e.target.value })} placeholder="1, 2, 3..." />
        </div>
        <div className="fg">
          <label className="fl">Nb de séances prévues</label>
          <input className="fi" value={seq.nbSeances || ''} onChange={e => update({ nbSeances: e.target.value })} placeholder="9/10 séances" />
        </div>
      </div>

      <div className="fg">
        <label className="fl">Titre de la séquence <span style={{ color: 'var(--accent-r)' }}>*</span></label>
        <input className="fi" value={seq.titre || ''} onChange={e => update({ titre: e.target.value })} placeholder="Ex : Fairy Tales" />
      </div>

      <div className="fg">
        <label className="fl">Sous-titre / Thème de la séquence</label>
        <input className="fi" value={seq.sousTitre || ''} onChange={e => update({ sousTitre: e.target.value })} placeholder="Ex : Récrire un conte avec contraintes" />
      </div>

      <div className="divider" />
      <div className="section-label">Ancrage Culturel</div>

      {isDNL(seq.niveau) ? (
        <>
          <div className="fg">
            <label className="fl">Axe majeur</label>
            <input className="fi" value={seq.axe || ''} onChange={e => update({ axe: e.target.value })} placeholder="Ex : Pouvoirs et contre-pouvoirs / Migrations / Énergies…" />
          </div>
          <div className="fg">
            <label className="fl">Axe mineur (transversal)</label>
            <input className="fi" value={seq.axeMineur || ''} onChange={e => update({ axeMineur: e.target.value })} placeholder="Ex : Mémoire collective / Innovation / Citoyenneté…" />
          </div>
          <div className="fg">
            <label className="fl">Objet(s) d'étude</label>
            <div className="swa">
              <input className="fi" value={objetFree} onChange={e => setObjetFree(e.target.value)} placeholder="Ex : The Suffragette Movement, World War I propaganda…" onKeyDown={e => { if (e.key === 'Enter' && objetFree.trim()) { addTag('culture', { text: objetFree.trim() }); setObjetFree(''); } }} />
              <button className="ba v" onClick={() => { if (objetFree.trim()) { addTag('culture', { text: objetFree.trim() }); setObjetFree(''); } }}><Plus size={16} /></button>
            </div>
            <TagList tagKey="culture" color="v" />
          </div>
        </>
      ) : (
        <>
          <div className="fg">
            <label className="fl">Axe majeur</label>
            <select className="fs" value={seq.axe || ''} onChange={e => update({ axe: e.target.value })}>
              <option value="">— Choisir un axe —</option>
              {axisKeys.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div className="fg">
            <label className="fl">Axe mineur (transversal)</label>
            <select className="fs" value={seq.axeMineur || ''} onChange={e => update({ axeMineur: e.target.value })}>
              <option value="">— Aucun —</option>
              {axisKeys.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          <div className="fg">
            <label className="fl">Objet(s) d'étude</label>
            <div className="swa">
              <select className="fs" value={objetSel} onChange={e => setObjetSel(e.target.value)} disabled={!seq.axe}>
                <option value="">{seq.axe ? '— Choisir —' : '— Choisir un axe d\'abord —'}</option>
                {objetsForAxe.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <button className="ba v" onClick={() => { if (objetSel) { addTag('culture', { text: objetSel }); setObjetSel(''); } }}><Plus size={16} /></button>
            </div>
            <div className="swa">
              <input className="fi" value={objetFree} onChange={e => setObjetFree(e.target.value)} placeholder="…ou ajoutez un objet libre" />
              <button className="ba v" onClick={() => { if (objetFree.trim()) { addTag('culture', { text: objetFree.trim() }); setObjetFree(''); } }}><Plus size={16} /></button>
            </div>
            <TagList tagKey="culture" color="v" />
          </div>
        </>
      )}

      <div className="fg">
        <label className="fl">Objectif culturel (texte libre)</label>
        <textarea className="fi field-textarea" rows="3" value={seq.objectifCulturel || ''} onChange={e => update({ objectifCulturel: e.target.value })} placeholder="Ex : Faire réfléchir les élèves sur la rencontre avec d'autres cultures…" />
      </div>

      <div className="divider" />
      <div className="section-label cyan">Problématique & Descripteur cible</div>

      <div className="fg">
        <label className="fl">Problématique</label>
        <textarea className="fi field-textarea" rows="2" value={seq.problematique || ''} onChange={e => update({ problematique: e.target.value })} placeholder="Ex : What is still fascinating about old stories?" />
      </div>

      <div className="fg">
        <label className="fl">Descripteur CECRL cible (cité)</label>
        <textarea className="fi field-textarea" rows="3" value={seq.descripteurCible || ''} onChange={e => update({ descripteurCible: e.target.value })} placeholder="Ex : « Je peux écrire des descriptions élaborées d'événements et d'expériences réels ou imaginaires… » (B1)" />
      </div>

      <div className="divider" />
      <div className="section-label orange">Mise en forme</div>

      <details style={{ marginBottom: 12, border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', background: 'var(--card)' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 700, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          <ImageIcon size={11} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} /> Image
        </summary>
        <div style={{ padding: '10px 0 4px' }}>
          <input className="fi" style={{ marginBottom: 8, fontSize: 12 }} value={seq.imgUrl || ''} onChange={e => update({ imgUrl: e.target.value })} placeholder="URL de l'image" />
          <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
            <label><input type="radio" checked={seq.imgShape === 'banner'} onChange={() => update({ imgShape: 'banner' })} /> Bannière</label>
            <label><input type="radio" checked={seq.imgShape === 'round'} onChange={() => update({ imgShape: 'round' })} /> Ronde</label>
          </div>
        </div>
      </details>
      <details style={{ marginBottom: 12, border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', background: 'var(--card)' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 700, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          <TypeIcon size={11} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} /> Police
        </summary>
        <div style={{ padding: '10px 0 4px' }}>
          <select className="fs" value={seq.font} onChange={e => update({ font: e.target.value })} style={{ fontSize: 12 }}>
            {FONTS.map(f => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
            <label style={{ fontWeight: 600 }}>Taille :</label>
            <input type="range" min="0.85" max="1.5" step="0.05" value={seq.fontSize || 1} onChange={e => update({ fontSize: parseFloat(e.target.value) })} style={{ flex: 1 }} />
            <span>{Math.round((seq.fontSize || 1) * 100)}%</span>
          </div>
        </div>
      </details>
    </>
  );
};

// ============== TAB 2 : ACTIVITES LANGAGIERES ==============
const ActivitesSection = ({ seq, update, updateActivite, addTag, TagList, onPickStrategy }) => {
  const mode = seq.nomenclatureMode || 'cecrl';
  const [compSel, setCompSel] = useState({});

  return (
    <>
      <div className="section-label">Activités langagières</div>

      <div className="fg" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label className="fl" style={{ margin: 0, fontWeight: 700, fontSize: 12 }}>Nomenclature :</label>
        {NOMENCLATURE_OPTIONS.map(opt => (
          <button key={opt.value} className={`btn btn-sm ${mode === opt.value ? 'btn-violet' : 'btn-ghost'}`} onClick={() => update({ nomenclatureMode: opt.value })} title={opt.description}>
            {opt.label}
          </button>
        ))}
      </div>

      {mode === 'fr' && (
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>Pour chaque activité : niveau cible + stratégies à développer + supports.</p>
          {ACTIVITES_FR.map(act => {
            const d = seq.activitesFR?.[act.code] || {};
            return (
              <div key={act.code} className="cecrl-block" style={{ borderLeft: `3px solid var(--accent2)` }}>
                <div className="cecrl-head" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={`cecrl-tag`} style={{ background: 'rgba(108,99,255,0.12)', color: 'var(--accent2)' }}>{act.code}</span>
                  <label className="fl" style={{ flex: 1, margin: 0 }}>{act.label}</label>
                  <select className="fs" style={{ width: 90, padding: '4px 8px', fontSize: 11 }} value={d.niveauCible || ''} onChange={e => updateActivite(act.code, { niveauCible: e.target.value })}>
                    <option value="">Niveau…</option>
                    {NIVEAUX_CIBLES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label className="fl" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Stratégies à développer</label>
                    <textarea className="fi field-textarea" rows="3" style={{ fontSize: 12 }} value={d.strategies || ''} onChange={e => updateActivite(act.code, { strategies: e.target.value })} placeholder="Identifier les éléments…, Repérer…" />
                  </div>
                  <div>
                    <label className="fl" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Supports</label>
                    <textarea className="fi field-textarea" rows="3" style={{ fontSize: 12 }} value={d.supports || ''} onChange={e => updateActivite(act.code, { supports: e.target.value })} placeholder="Howl's Moving Castle, LRRH…" />
                  </div>
                </div>
              </div>
            );
          })}
          <button className="btn btn-ghost btn-sm" onClick={onPickStrategy} style={{ marginTop: 4 }}>
            <LibIcon size={12} /> Importer depuis la bibliothèque
          </button>
        </div>
      )}

      {mode === 'cecrl' && (
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>Choisissez un descripteur officiel CECRL par compétence.</p>
          {COMPETENCES.map(comp => {
            const data = CECRL_DESCRIPTORS[comp.code] || { subcomps: [], descriptors: [] };
            const sel = compSel[comp.code] || { sub: '', desc: '' };
            const descs = sel.sub ? data.descriptors.filter(d => d.sub === sel.sub) : [];
            const tagKey = 'comp_' + comp.code.toLowerCase();
            const disabled = data.subcomps.length === 0;
            return (
              <div key={comp.code} className={`cecrl-block ${disabled ? 'disabled' : ''}`}>
                <div className="cecrl-head">
                  <span className="cecrl-tag">{comp.code}</span>
                  <label className="fl">{comp.label}</label>
                </div>
                <select className="fs cecrl-sub" value={sel.sub} onChange={e => setCompSel({ ...compSel, [comp.code]: { sub: e.target.value, desc: '' } })} disabled={disabled}>
                  <option value="">{disabled ? 'Aucun descripteur disponible' : '— Sous-compétence —'}</option>
                  {data.subcomps.map(sc => <option key={sc.id} value={sc.id}>{sc.label}</option>)}
                </select>
                <div className="swa" style={{ marginTop: 6 }}>
                  <select className="fs" value={sel.desc} onChange={e => setCompSel({ ...compSel, [comp.code]: { ...sel, desc: e.target.value } })} disabled={!sel.sub}>
                    <option value="">— Descripteur —</option>
                    {descs.map((d, i) => <option key={i} value={i}>{`(${d.level}) ${d.text.slice(0, 90)}${d.text.length > 90 ? '…' : ''}`}</option>)}
                  </select>
                  <button className={`ba ${comp.color}`} onClick={() => {
                    if (sel.desc !== '') {
                      const d = descs[parseInt(sel.desc, 10)];
                      if (d) {
                        addTag(tagKey, { text: d.text, level: d.level });
                        setCompSel({ ...compSel, [comp.code]: { ...sel, desc: '' } });
                      }
                    }
                  }}><Plus size={16} /></button>
                </div>
                <TagList tagKey={tagKey} color={comp.color} />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

// ============== TAB 3 : LINGUISTIQUE ==============
const LinguistiqueSection = ({ seq, update, addTag, TagList }) => {
  // Cases "Tous niveaux" : si cochées, le dropdown grammaire/phono affiche
  // l'ensemble des items lycée fusionnés (utile en DNL ou pour s'inspirer).
  const [gramAll, setGramAll] = useState(false);
  const [phonAll, setPhonAll] = useState(false);
  const grammarList = gramAll ? getAllGrammar() : (GRAMMAR[grammarKey(seq.niveau, seq.lv)] || []);
  const phonoList = phonAll ? getAllPhono() : (PHONO[grammarKey(seq.niveau, seq.lv)] || []);
  const [gramSel, setGramSel] = useState('');
  const [gramFree, setGramFree] = useState('');
  const [phonSel, setPhonSel] = useState('');
  const [phonFree, setPhonFree] = useState('');
  const [lexFree, setLexFree] = useState('');
  const [pragSubSel, setPragSubSel] = useState('');
  const [pragDescSel, setPragDescSel] = useState('');
  const [pragFree, setPragFree] = useState('');
  const pragDescOptions = pragSubSel ? PRAG_DESCRIPTORS.filter(d => d.sub === pragSubSel) : [];

  return (
    <>
      <div className="section-label cyan">Composante Linguistique</div>

      <div className="fg">
        <label className="fl" style={{ color: '#eab308' }}>Lexique</label>
        <div className="swa">
          <input className="fi" value={lexFree} onChange={e => setLexFree(e.target.value)} placeholder="Champ lexical, expressions…" />
          <button className="ba y" onClick={() => { if (lexFree.trim()) { addTag('lexique', { text: lexFree.trim() }); setLexFree(''); } }}><Plus size={16} /></button>
        </div>
        <TagList tagKey="lexique" color="y" />
      </div>

      <div className="fg">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <label className="fl">Grammaire</label>
          {!isDNL(seq.niveau) && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none', fontWeight: 600 }}>
              <input type="checkbox" checked={gramAll} onChange={e => setGramAll(e.target.checked)} style={{ margin: 0, width: 13, height: 13 }} /> Tous niveaux
            </label>
          )}
        </div>
        {!isDNL(seq.niveau) && (
          <div className="swa">
            <select className="fs" value={gramSel} onChange={e => setGramSel(e.target.value)}>
              <option value="">— Programme BO —</option>
              {grammarList.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <button className="ba g" onClick={() => { if (gramSel) { addTag('grammar', { text: gramSel }); setGramSel(''); } }}><Plus size={16} /></button>
          </div>
        )}
        <div className="swa">
          <input className="fi" value={gramFree} onChange={e => setGramFree(e.target.value)} placeholder={isDNL(seq.niveau) ? 'Saisie libre…' : '…ou saisie libre'} />
          <button className="ba g" onClick={() => { if (gramFree.trim()) { addTag('grammar', { text: gramFree.trim() }); setGramFree(''); } }}><Plus size={16} /></button>
        </div>
        <TagList tagKey="grammar" color="g" />
      </div>

      <div className="fg">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <label className="fl" style={{ color: 'var(--accent3)' }}>Phonologie</label>
          {!isDNL(seq.niveau) && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none', fontWeight: 600 }}>
              <input type="checkbox" checked={phonAll} onChange={e => setPhonAll(e.target.checked)} style={{ margin: 0, width: 13, height: 13 }} /> Tous niveaux
            </label>
          )}
        </div>
        {!isDNL(seq.niveau) && (
          <div className="swa">
            <select className="fs" value={phonSel} onChange={e => setPhonSel(e.target.value)}>
              <option value="">— Programme BO —</option>
              {phonoList.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button className="ba o" onClick={() => { if (phonSel) { addTag('phono', { text: phonSel }); setPhonSel(''); } }}><Plus size={16} /></button>
          </div>
        )}
        <div className="swa">
          <input className="fi" value={phonFree} onChange={e => setPhonFree(e.target.value)} placeholder={isDNL(seq.niveau) ? 'Saisie libre…' : '…ou saisie libre'} />
          <button className="ba o" onClick={() => { if (phonFree.trim()) { addTag('phono', { text: phonFree.trim() }); setPhonFree(''); } }}><Plus size={16} /></button>
        </div>
        <TagList tagKey="phono" color="o" />
      </div>

      <div className="divider" />
      <div className="section-label pink">Composante Pragmatique</div>
      <div className="fg">
        <select className="fs cecrl-sub" value={pragSubSel} onChange={e => { setPragSubSel(e.target.value); setPragDescSel(''); }}>
          <option value="">— Compétence pragmatique CECRL —</option>
          {PRAG_SUBCOMPS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <div className="swa" style={{ marginTop: 6 }}>
          <select className="fs" value={pragDescSel} onChange={e => setPragDescSel(e.target.value)} disabled={!pragSubSel}>
            <option value="">— Descripteur —</option>
            {pragDescOptions.map((d, i) => <option key={i} value={i}>{`(${d.level}) ${d.text.slice(0, 90)}${d.text.length > 90 ? '…' : ''}`}</option>)}
          </select>
          <button className="ba p" onClick={() => {
            if (pragDescSel !== '') {
              const d = pragDescOptions[parseInt(pragDescSel, 10)];
              if (d) { addTag('pragma', { text: d.text, level: d.level }); setPragDescSel(''); }
            }
          }}><Plus size={16} /></button>
        </div>
        <div className="swa" style={{ marginTop: 6 }}>
          <input className="fi" value={pragFree} onChange={e => setPragFree(e.target.value)} placeholder="…ou saisie libre" />
          <button className="ba p" onClick={() => { if (pragFree.trim()) { addTag('pragma', { text: pragFree.trim() }); setPragFree(''); } }}><Plus size={16} /></button>
        </div>
        <TagList tagKey="pragma" color="p" />
      </div>

      <div className="divider" />
      <div className="section-label" style={{ color: 'var(--accent4)' }}>Composante Sociolinguistique</div>
      <div className="fg">
        <textarea className="fi field-textarea" rows="3" value={seq.sociolinguistique || ''} onChange={e => update({ sociolinguistique: e.target.value })} placeholder="Choix du registre, s'adresser aux autres, gestuelle, humour, codes culturels…" />
      </div>

      <div className="divider" />
      <div className="section-label" style={{ color: 'var(--accent3)' }}>Composante Culturelle (paragraphe long)</div>
      <div className="fg">
        <textarea className="fi field-textarea" rows="4" value={seq.culturelLong || ''} onChange={e => update({ culturelLong: e.target.value })} placeholder="Auteurs britanniques, Contes célèbres, Tradition orale…" />
      </div>

      <div className="divider" />
      <div className="section-label" style={{ color: '#3730a3' }}>TICE / Outils numériques</div>
      <div className="fg">
        <textarea className="fi field-textarea" rows="2" value={seq.tice || ''} onChange={e => update({ tice: e.target.value })} placeholder="Pearltrees, tablets, vidéos en ligne, podcasts…" />
      </div>
    </>
  );
};

// ============== TAB 4 : PROJET & TACHES ==============
const ProjetSection = ({ seq, update, addTag, TagList }) => {
  const [taskFree, setTaskFree] = useState('');
  const [interFree, setInterFree] = useState('');
  const [issueText, setIssueText] = useState('');

  const addIssue = () => {
    if (!issueText.trim()) return;
    update({ issues: [...(seq.issues || []), { id: 'iss_' + Date.now(), text: issueText.trim() }] });
    setIssueText('');
  };
  const removeIssue = (id) => update({ issues: (seq.issues || []).filter(i => i.id !== id) });

  return (
    <>
      <div className="section-label red">🎯 Tâche finale / Projet</div>
      <div className="fg">
        <div className="swa">
          <input className="fi" value={taskFree} onChange={e => setTaskFree(e.target.value)} placeholder="Décrire la tâche finale" />
          <button className="ba r" onClick={() => { if (taskFree.trim()) { addTag('task', { text: taskFree.trim() }); setTaskFree(''); } }}><Plus size={16} /></button>
        </div>
        <TagList tagKey="task" color="r" />
      </div>

      <div className="section-label purple">🏷️ Tâches intermédiaires</div>
      <div className="fg">
        <div className="swa">
          <input className="fi" value={interFree} onChange={e => setInterFree(e.target.value)} placeholder="Mini-tâche, entraînement…" />
          <button className="ba v" onClick={() => { if (interFree.trim()) { addTag('inter', { text: interFree.trim() }); setInterFree(''); } }}><Plus size={16} /></button>
        </div>
        <TagList tagKey="inter" color="v" />
      </div>

      <div className="divider" />
      <div className="section-label" style={{ color: '#9333ea' }}>💭 Questions / Issues de réflexion</div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Questions ouvertes pour amorcer le débat avec vos élèves.</p>
      <div className="fg">
        <div className="swa">
          <input className="fi" value={issueText} onChange={e => setIssueText(e.target.value)} placeholder="Ex : What is still fascinating in stories?" onKeyDown={e => e.key === 'Enter' && addIssue()} />
          <button className="ba p" onClick={addIssue}><Plus size={16} /></button>
        </div>
        <div className="added-tags">
          {(seq.issues || []).map(i => (
            <span key={i.id} className="tag p">
              <span className="tl">• {i.text}</span>
              <button className="tr" onClick={() => removeIssue(i.id)}><X size={12} /></button>
            </span>
          ))}
        </div>
      </div>
    </>
  );
};

// ============== TAB 5 : EVALUATIONS & GRILLES ==============
const EvaluationsSection = ({ seq, update, onEditGrille }) => {
  const ev = seq.evaluations || { formatives: [], sommatives: [], notesAttendues: [] };
  const [formText, setFormText] = useState('');
  const [sommDraft, setSommDraft] = useState({ num: '', type: 'CO', description: '', date: '' });
  const [noteText, setNoteText] = useState('');

  const updateEv = (patch) => update({ evaluations: { ...ev, ...patch } });

  const addFormative = () => {
    if (!formText.trim()) return;
    updateEv({ formatives: [...ev.formatives, { id: 'fm_' + Date.now(), text: formText.trim() }] });
    setFormText('');
  };
  const removeFormative = (id) => updateEv({ formatives: ev.formatives.filter(f => f.id !== id) });

  const addSommative = () => {
    if (!sommDraft.description.trim()) return;
    const next = { ...sommDraft, id: 'sm_' + Date.now(), num: sommDraft.num || (ev.sommatives.length + 1) };
    updateEv({ sommatives: [...ev.sommatives, next] });
    setSommDraft({ num: '', type: 'CO', description: '', date: '' });
  };
  const removeSommative = (id) => updateEv({ sommatives: ev.sommatives.filter(s => s.id !== id) });

  const addNote = () => {
    if (!noteText.trim()) return;
    updateEv({ notesAttendues: [...(ev.notesAttendues || []), { id: 'nt_' + Date.now(), label: noteText.trim() }] });
    setNoteText('');
  };
  const removeNote = (id) => updateEv({ notesAttendues: (ev.notesAttendues || []).filter(n => n.id !== id) });

  const addGrille = (template) => {
    const g = newGrille(template);
    update({ grilles: [...(seq.grilles || []), g] });
    onEditGrille(g);
  };

  return (
    <>
      <div className="section-label yellow">📝 Évaluations formatives</div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Auto-éval, inter-éval, checklists, entraînements…</p>
      <div className="fg">
        <div className="swa">
          <input className="fi" value={formText} onChange={e => setFormText(e.target.value)} placeholder="Ex : Auto-évaluation / Écriture en groupe + checklist" onKeyDown={e => e.key === 'Enter' && addFormative()} />
          <button className="ba y" onClick={addFormative}><Plus size={16} /></button>
        </div>
        <div className="added-tags">
          {ev.formatives.map(f => (
            <span key={f.id} className="tag y">
              <span className="tl">{f.text}</span>
              <button className="tr" onClick={() => removeFormative(f.id)}><X size={12} /></button>
            </span>
          ))}
        </div>
      </div>

      <div className="divider" />
      <div className="section-label pink">✅ Évaluations sommatives (TESTS)</div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Tests numérotés : TEST 1, TEST 2…</p>

      <div style={{ background: 'var(--card)', padding: 10, borderRadius: 8, marginBottom: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 110px', gap: 6, marginBottom: 6 }}>
          <input className="fi" placeholder="N°" value={sommDraft.num} onChange={e => setSommDraft({ ...sommDraft, num: e.target.value })} />
          <select className="fs" value={sommDraft.type} onChange={e => setSommDraft({ ...sommDraft, type: e.target.value })}>
            {TEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input className="fi" type="date" value={sommDraft.date} onChange={e => setSommDraft({ ...sommDraft, date: e.target.value })} />
        </div>
        <textarea className="fi field-textarea" rows="2" placeholder="Description du test (consigne, support…)" value={sommDraft.description} onChange={e => setSommDraft({ ...sommDraft, description: e.target.value })} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
          <button className="btn btn-pink btn-sm" onClick={addSommative} disabled={!sommDraft.description.trim()}><Plus size={12} /> Ajouter le test</button>
        </div>
      </div>

      {ev.sommatives.length === 0 && <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: 12 }}>Aucun test sommatif pour le moment.</p>}
      {ev.sommatives.map(s => (
        <div key={s.id} style={{ background: 'var(--card)', padding: 10, borderRadius: 8, marginBottom: 6, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ background: 'linear-gradient(135deg, var(--accent5), #db2777)', color: '#fff', padding: '4px 10px', borderRadius: 6, fontWeight: 800, fontSize: 11, flexShrink: 0 }}>TEST {s.num}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{s.type}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{s.description}</div>
            {s.date && <div style={{ fontSize: 10, color: 'var(--accent2)', marginTop: 3, fontWeight: 600 }}>📅 {s.date}</div>}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => removeSommative(s.id)}><X size={12} /></button>
        </div>
      ))}

      <div className="divider" />
      <div className="section-label" style={{ color: '#059669' }}><FileSpreadsheet size={12} style={{ display: 'inline', verticalAlign: -1 }} /> Grilles d'évaluation</div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Créez des grilles pour vos productions. Imprimables et exportables pour vos élèves.</p>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        <button className="btn btn-green btn-sm" onClick={() => addGrille('cecrl')}><Plus size={12} /> Grille CECRL (lignes = niveaux)</button>
        <button className="btn btn-blue btn-sm" onClick={() => addGrille('critere')}><Plus size={12} /> Grille Critères/points</button>
      </div>

      {(seq.grilles || []).length === 0 && <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: 12 }}>Aucune grille pour cette séquence.</p>}
      {(seq.grilles || []).map(g => (
        <div key={g.id} style={{ background: 'var(--card)', padding: 10, borderRadius: 8, marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <span style={{ background: g.type === 'cecrl' ? 'linear-gradient(135deg, var(--accent), #2ba86e)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', padding: '3px 8px', borderRadius: 5, fontWeight: 700, fontSize: 10 }}>{g.competence}</span>
            <strong style={{ fontSize: 13 }}>{g.name}</strong>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>/{g.totalPoints} pts · {g.type === 'cecrl' ? 'CECRL' : 'Critères'} · {g.rows.length}×{g.cols.length}</span>
          </div>
          <button className="btn btn-violet btn-sm" onClick={() => onEditGrille(g)}><Pencil size={11} /> Éditer</button>
        </div>
      ))}

      <div className="divider" />
      <div className="section-label" style={{ color: 'var(--accent2)' }}>🎓 Notes attendues (récap)</div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Ex : « Fin Octobre : 5 notes — CO, EE, EOC, EE+EOC »</p>
      <div className="fg">
        <div className="swa">
          <input className="fi" value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Note attendue (ex: CO test 1)" onKeyDown={e => e.key === 'Enter' && addNote()} />
          <button className="ba v" onClick={addNote}><Plus size={16} /></button>
        </div>
        <div className="added-tags">
          {(ev.notesAttendues || []).map(n => (
            <span key={n.id} className="tag v">
              <span className="tl">{n.label}</span>
              <button className="tr" onClick={() => removeNote(n.id)}><X size={12} /></button>
            </span>
          ))}
        </div>
      </div>
    </>
  );
};

// ============== TAB 6 : SUPPORTS & RESSOURCES ==============
const RessourcesSection = ({ seq, update, addTag, TagList, onPickSupport }) => {
  const [docFree, setDocFree] = useState('');
  const [draft, setDraft] = useState({ type: 'texte', title: '', author: '', url: '' });

  const addSupport = () => {
    if (!draft.title.trim()) return;
    const item = { id: 'sup_' + Date.now(), ...draft };
    update({ supportsPlus: [...(seq.supportsPlus || []), item] });
    setDraft({ type: 'texte', title: '', author: '', url: '' });
  };
  const removeSupport = (id) => update({ supportsPlus: (seq.supportsPlus || []).filter(s => s.id !== id) });

  return (
    <>
      <div className="section-label" style={{ color: 'var(--accent5)' }}>Documents culturels (tags rapides)</div>
      <div className="fg">
        <div className="swa">
          <input className="fi" value={docFree} onChange={e => setDocFree(e.target.value)} placeholder="Extrait vidéo, article, chanson…" />
          <button className="ba p" onClick={() => { if (docFree.trim()) { addTag('docs', { text: docFree.trim() }); setDocFree(''); } }}><Plus size={16} /></button>
        </div>
        <TagList tagKey="docs" color="pk" />
      </div>

      <div className="divider" />
      <div className="section-label" style={{ color: '#3f6212' }}>📚 Supports en + (détaillés)</div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Ajoutez vos ressources avec titre, auteur, URL et type.</p>

      <div style={{ background: 'var(--card)', padding: 10, borderRadius: 8, marginBottom: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 6, marginBottom: 6 }}>
          <select className="fs" value={draft.type} onChange={e => setDraft({ ...draft, type: e.target.value })}>
            {SUPPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input className="fi" placeholder="Titre" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
          <input className="fi" placeholder="Auteur / Source" value={draft.author} onChange={e => setDraft({ ...draft, author: e.target.value })} />
          <input className="fi" placeholder="URL (optionnel)" value={draft.url} onChange={e => setDraft({ ...draft, url: e.target.value })} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
          <button className="btn btn-ghost btn-sm" onClick={onPickSupport}><LibIcon size={12} /> Depuis la bibliothèque</button>
          <button className="btn btn-green btn-sm" onClick={addSupport} disabled={!draft.title.trim()}><Plus size={12} /> Ajouter</button>
        </div>
      </div>

      {(seq.supportsPlus || []).length === 0 && <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: 12 }}>Aucun support pour le moment.</p>}
      {(seq.supportsPlus || []).map(s => {
        const tInfo = SUPPORT_TYPES.find(t => t.value === s.type);
        return (
          <div key={s.id} style={{ background: 'var(--card)', padding: 10, borderRadius: 8, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 4, background: (tInfo?.color || '#888') + '22', color: tInfo?.color || '#888', flexShrink: 0 }}>{(tInfo?.label || s.type).split(' ')[0]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {s.author && <span><i>{s.author}</i></span>}
                {s.url && <span> · <a href={s.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent2)' }}>lien ↗</a></span>}
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => removeSupport(s.id)}><X size={12} /></button>
          </div>
        );
      })}
    </>
  );
};

export default SequenceEditor;
