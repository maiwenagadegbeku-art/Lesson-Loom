import React from 'react';
import { COMPETENCES } from '../data/sequenceurData';
import { ACTIVITES_FR, SUPPORT_TYPES, A4_SECTION_COLORS } from '../data/sequenceurData2';
import { useApp } from '../contexts/AppContext';

const A4Preview = ({ sequence }) => {
  const { prefs } = useApp();
  const s = sequence;
  // Pour DNL on affiche "DNL Histoire" si une discipline est renseignée, puis
  // " · Première" en suffixe selon la classe enseignée.
  const niveauLabel = s.niveau === 'DNL'
    ? (s.dnlDiscipline ? `DNL ${s.dnlDiscipline}` : 'DNL')
    : (s.niveau || 'Niveau').replace(/_/g, ' ');
  const niveauSuffix = s.niveau === 'DNL' && s.dnlLevel
    ? ' · ' + s.dnlLevel
    : (s.lv && /Seconde|Première|Terminale/.test(s.niveau) && !s.niveau.includes('_') ? ' · ' + s.lv : '');
  const C = A4_SECTION_COLORS;
  const mode = s.nomenclatureMode || 'cecrl';
  const imgOk = /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(s.imgUrl || '');

  const contentStyle = {
    fontFamily: s.font || "'Plus Jakarta Sans', sans-serif",
    fontSize: `${(s.fontSize || 1) * 11}px`
  };

  // ---- Header table ----
  const renderHeader = () => (
    <table className="a4-table" style={{ marginBottom: 14, border: 'none' }}>
      <tbody>
        <tr>
          <td style={{ background: C.header.bg, color: C.header.fg, fontWeight: 800, fontSize: 12, width: '40%' }}>
            Thème de la séquence<br />
            <span style={{ fontWeight: 700, fontSize: 14, fontFamily: "'Playfair Display', serif" }}>{s.titre || '—'}</span>
          </td>
          <td style={{ background: '#fff', fontWeight: 700, fontSize: 11, width: '30%' }}>
            {s.numero && <>Séquence n°{s.numero}</>}
            {s.nbSeances && <> <span style={{ fontWeight: 400, color: '#64748b' }}>({s.nbSeances})</span></>}
            {(!s.numero && !s.nbSeances) && <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>—</span>}
          </td>
          <td style={{ background: '#fff', fontSize: 10.5, color: '#475569', fontStyle: 'italic', width: '30%' }}>
            {s.sousTitre || ''}
          </td>
        </tr>
        {(s.tags?.task || []).length > 0 && (
          <tr>
            <td style={{ background: C.taskVisee.bg, color: C.taskVisee.fg, fontWeight: 800, fontSize: 11 }}>Tâche visée</td>
            <td colSpan="2" style={{ fontSize: 11 }}>
              {s.tags.task.map(t => t.text).join(' / ')}
            </td>
          </tr>
        )}
        {s.descripteurCible && (
          <tr>
            <td style={{ background: C.cecrlCible.bg, color: C.cecrlCible.fg, fontWeight: 800, fontSize: 11 }}>CECRL Visée</td>
            <td colSpan="2" style={{ fontSize: 11, fontStyle: 'italic' }}>
              « {s.descripteurCible} »
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  // ---- Activités langagières (style PDF) ----
  const renderActivitesLangagieres = () => {
    if (mode === 'fr') {
      const items = ACTIVITES_FR.filter(a => {
        const d = s.activitesFR?.[a.code];
        return d && (d.niveauCible || d.strategies || d.supports);
      });
      if (items.length === 0) return null;
      return (
        <div style={{ marginBottom: 12 }}>
          <SectionTitle bg={C.activites.bg} fg={C.activites.fg} label="Activités langagières" />
          <table className="a4-table">
            <thead>
              <tr style={{ background: C.activites.bg, color: C.activites.fg }}>
                <th style={{ width: '11%' }}>Activité</th>
                <th style={{ width: '11%' }}>Cible</th>
                <th style={{ width: '44%' }}>Stratégies à développer</th>
                <th style={{ width: '34%' }}>Supports</th>
              </tr>
            </thead>
            <tbody>
              {items.map(a => {
                const d = s.activitesFR[a.code];
                return (
                  <tr key={a.code}>
                    <td style={{ fontWeight: 800, color: C.activites.fg }}>{a.code}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{d.niveauCible || '—'}</td>
                    <td style={{ whiteSpace: 'pre-wrap' }}>{d.strategies || '—'}</td>
                    <td style={{ whiteSpace: 'pre-wrap' }}>{d.supports || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    // CECRL mode
    const filled = COMPETENCES.filter(c => (s.tags?.['comp_' + c.code.toLowerCase()] || []).length > 0);
    if (filled.length === 0) return null;
    return (
      <div style={{ marginBottom: 12 }}>
        <SectionTitle bg={C.activites.bg} fg={C.activites.fg} label="Activités langagières (CECRL)" />
        <table className="a4-table">
          <thead>
            <tr style={{ background: C.activites.bg, color: C.activites.fg }}>
              <th style={{ width: '13%' }}>Comp.</th>
              <th>Descripteurs ciblés</th>
            </tr>
          </thead>
          <tbody>
            {filled.map(comp => {
              const items = s.tags['comp_' + comp.code.toLowerCase()];
              return (
                <tr key={comp.code}>
                  <td style={{ fontWeight: 800, color: C.activites.fg }}>{comp.code}<br /><span style={{ fontWeight: 400, fontSize: 9, color: '#64748b' }}>{comp.label}</span></td>
                  <td>
                    {items.map((t, i) => (
                      <div key={i} style={{ marginBottom: 3, fontSize: 10.5 }}>
                        {t.level && <span className="a4-grille-lvl" style={{ marginRight: 4 }}>{t.level}</span>}
                        {t.text}
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // ---- Composantes (style PDF) ----
  const renderComposantes = () => {
    const lex = (s.tags?.lexique || []).map(t => t.text);
    const gram = (s.tags?.grammar || []).map(t => t.text);
    const phono = (s.tags?.phono || []).map(t => t.text);
    const prag = (s.tags?.pragma || []).map(t => `${t.level ? `(${t.level}) ` : ''}${t.text}`);

    const hasLing = lex.length || gram.length || phono.length;
    const hasPrag = prag.length;

    if (!hasLing && !hasPrag && !s.sociolinguistique && !s.culturelLong && !s.tice) return null;

    return (
      <div style={{ marginBottom: 12 }}>
        {(hasLing || hasPrag) && (
          <table className="a4-table">
            <thead>
              <tr>
                <th colSpan="3" style={{ background: C.linguistique.bg, color: C.linguistique.fg, width: '70%' }}>Composante linguistique</th>
                <th style={{ background: C.pragmatique.bg, color: C.pragmatique.fg, width: '30%' }}>Composante pragmatique</th>
              </tr>
              <tr>
                <th style={{ background: '#f8fafc', width: '23%' }}>Lexique</th>
                <th style={{ background: '#f8fafc', width: '23%' }}>Phonologie</th>
                <th style={{ background: '#f8fafc', width: '24%' }}>Grammaire</th>
                <th style={{ background: '#f8fafc', width: '30%' }}>Pragmatique</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontSize: 10, verticalAlign: 'top' }}>{lex.length ? lex.join(' · ') : '—'}</td>
                <td style={{ fontSize: 10, verticalAlign: 'top' }}>{phono.length ? phono.join(' · ') : '—'}</td>
                <td style={{ fontSize: 10, verticalAlign: 'top' }}>{gram.length ? gram.join(' · ') : '—'}</td>
                <td style={{ fontSize: 10, verticalAlign: 'top' }}>{prag.length ? prag.join(' · ') : '—'}</td>
              </tr>
            </tbody>
          </table>
        )}

        {s.sociolinguistique && (
          <table className="a4-table">
            <tbody>
              <tr>
                <td style={{ background: C.sociolinguistique.bg, color: C.sociolinguistique.fg, fontWeight: 800, fontSize: 10.5, width: '25%' }}>Composante sociolinguistique</td>
                <td style={{ fontSize: 10.5 }}>{s.sociolinguistique}</td>
              </tr>
            </tbody>
          </table>
        )}
        {s.culturelLong && (
          <table className="a4-table">
            <tbody>
              <tr>
                <td style={{ background: C.culturelle.bg, color: C.culturelle.fg, fontWeight: 800, fontSize: 10.5, width: '25%' }}>Composante culturelle</td>
                <td style={{ fontSize: 10.5 }}>{s.culturelLong}</td>
              </tr>
            </tbody>
          </table>
        )}
        {s.tice && (
          <table className="a4-table">
            <tbody>
              <tr>
                <td style={{ background: C.tice.bg, color: C.tice.fg, fontWeight: 800, fontSize: 10.5, width: '25%' }}>TICE / Outils</td>
                <td style={{ fontSize: 10.5 }}>{s.tice}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // ---- Évaluations ----
  const renderEvaluations = () => {
    const ev = s.evaluations || {};
    const hasForm = (ev.formatives || []).length > 0;
    const hasSomm = (ev.sommatives || []).length > 0;
    const hasNotes = (ev.notesAttendues || []).length > 0;
    if (!hasForm && !hasSomm && !hasNotes) return null;

    return (
      <div style={{ marginBottom: 12 }}>
        <table className="a4-table">
          <thead>
            <tr>
              <th style={{ background: C.evalFormative.bg, color: C.evalFormative.fg, width: '50%' }}>Évaluations Formatives</th>
              <th style={{ background: C.evalSommative.bg, color: C.evalSommative.fg, width: '50%' }}>Évaluations Sommatives</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'top', fontSize: 10.5 }}>
                {hasForm ? (
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {ev.formatives.map(f => <li key={f.id} style={{ padding: '2px 0 2px 12px', position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: C.evalFormative.fg }}>▸</span>{f.text}</li>)}
                  </ul>
                ) : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>—</span>}
              </td>
              <td style={{ verticalAlign: 'top', fontSize: 10.5 }}>
                {hasSomm ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {ev.sommatives.map(s2 => (
                        <tr key={s2.id} style={{ borderBottom: '1px dashed #cbd5e1' }}>
                          <td style={{ padding: '2px 4px', verticalAlign: 'top' }}>
                            <span style={{ background: C.evalSommative.fg, color: '#fff', padding: '1px 5px', borderRadius: 3, fontSize: 9, fontWeight: 800 }}>TEST {s2.num}</span>
                          </td>
                          <td style={{ padding: '2px 4px', fontWeight: 700, color: C.evalSommative.fg }}>{s2.type}</td>
                          <td style={{ padding: '2px 4px' }}>{s2.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>—</span>}
              </td>
            </tr>
          </tbody>
        </table>
        {hasNotes && (
          <table className="a4-table">
            <tbody>
              <tr>
                <td style={{ background: '#e0f2fe', color: '#075985', fontWeight: 800, fontSize: 10.5, width: '25%' }}>🎓 Notes attendues</td>
                <td style={{ fontSize: 10.5 }}>{ev.notesAttendues.map(n => n.label).join(' · ')}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // ---- Étapes du projet ----
  const renderEtapes = () => {
    if (!(s.seances || []).length) return null;
    return (
      <div style={{ marginBottom: 12 }}>
        <SectionTitle bg={C.etapes.bg} fg={C.etapes.fg} label="Étapes du projet" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {(s.seances || []).map((se, idx) => (
            <div key={se.id} style={{ border: '1px solid #cbd5e1', borderRadius: 4, padding: '6px 8px', fontSize: 10, background: '#fff' }}>
              <div style={{ fontWeight: 800, color: C.etapes.fg, marginBottom: 2 }}>S{idx + 1} — {se.titre || 'Sans titre'}</div>
              {se.objectif && <div style={{ color: '#475569' }}>{se.objectif}</div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ---- Supports + ----
  const renderSupportsPlus = () => {
    if (!(s.supportsPlus || []).length) return null;
    return (
      <div style={{ marginBottom: 12 }}>
        <SectionTitle bg={C.supports.bg} fg={C.supports.fg} label="Supports en +" />
        <ol style={{ margin: '4px 0 0 18px', padding: 0, fontSize: 10.5, lineHeight: 1.5 }}>
          {s.supportsPlus.map(sp => {
            const tInfo = SUPPORT_TYPES.find(t => t.value === sp.type);
            return (
              <li key={sp.id} style={{ marginBottom: 2 }}>
                <span style={{ background: (tInfo?.color || '#888') + '22', color: tInfo?.color || '#888', padding: '1px 5px', borderRadius: 3, fontSize: 9, fontWeight: 700, marginRight: 6 }}>{(tInfo?.label || sp.type).split(' ')[0]}</span>
                <strong>{sp.title}</strong>
                {sp.author && <span style={{ color: '#64748b' }}> — <i>{sp.author}</i></span>}
              </li>
            );
          })}
        </ol>
      </div>
    );
  };

  // ---- Issues ----
  const renderIssues = () => {
    if (!(s.issues || []).length) return null;
    return (
      <div style={{ marginBottom: 12 }}>
        <SectionTitle bg={C.issues.bg} fg={C.issues.fg} label="Issues / Questions de réflexion" />
        <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: 10.5, lineHeight: 1.5 }}>
          {s.issues.map(i => <li key={i.id} style={{ marginBottom: 2 }}>{i.text}</li>)}
        </ul>
      </div>
    );
  };

  // ---- Grilles d'évaluation ----
  const renderGrilles = () => {
    if (!(s.grilles || []).length) return null;
    return (
      <div style={{ marginTop: 18, pageBreakBefore: 'always' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 800, marginBottom: 12, color: '#1e293b', borderBottom: '2px solid #cbd5e1', paddingBottom: 6 }}>Grilles d'évaluation</h2>
        {s.grilles.map(g => (
          <div key={g.id} style={{ marginBottom: 20, pageBreakInside: 'avoid' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ background: g.type === 'cecrl' ? '#10b981' : '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 800 }}>{g.competence}</span>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#1e293b' }}>{g.name}</h3>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: '#64748b', fontWeight: 700 }}>Total : /{g.totalPoints}</span>
            </div>
            <table className="a4-grille-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 90 }}></th>
                  {g.cols.map((c, i) => (
                    <th key={i}>
                      {c}
                      {g.colsPoints?.[i] != null && <div style={{ fontSize: 9, color: '#64748b', fontWeight: 600 }}>/{g.colsPoints[i]}</div>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {g.rows.map((r, rIdx) => (
                  <tr key={rIdx}>
                    <th style={{ background: '#f8fafc' }}>
                      {g.type === 'cecrl' ? <span className="a4-grille-lvl">{r}</span> : <span style={{ fontSize: 10, fontWeight: 700 }}>{r}</span>}
                      {g.rowsPoints?.[rIdx] != null && <div style={{ fontSize: 9, color: '#64748b', fontWeight: 600, marginTop: 2 }}>/{g.rowsPoints[rIdx]}</div>}
                    </th>
                    {g.cols.map((c, cIdx) => {
                      const cell = g.cells?.[`${rIdx}_${cIdx}`] || {};
                      return (
                        <td key={cIdx} style={{ fontSize: 9.5 }}>
                          {cell.text || ''}
                          {cell.points && <div style={{ fontSize: 9, color: '#64748b', fontWeight: 700, marginTop: 2, textAlign: 'right' }}>{cell.points}</div>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="a4-sheet a4-content" id="a4-preview-root">
      <div className="a4-year">{s.annee || '—'}</div>
      <div className="a4-badge">{niveauLabel}{niveauSuffix}</div>
      <div style={{ height: 26 }} />

      {imgOk && s.imgShape === 'round' && <img src={s.imgUrl} alt="" className="a4-round" onError={(e) => { e.target.style.display = 'none'; }} />}

      <h1 className="a4-title">{s.titre || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Titre de la séquence</span>}</h1>

      {/* Axes */}
      {(s.axe || s.axeMineur) && (
        <div style={{ textAlign: 'center', fontSize: 11, marginBottom: 8 }}>
          {s.axe && <div><b style={{ color: '#4338ca' }}>Majeur :</b> {s.axe}</div>}
          {s.axeMineur && <div><b style={{ color: '#7c3aed' }}>Mineur :</b> {s.axeMineur}</div>}
        </div>
      )}

      {/* Objets d'étude (ancrage culturel) */}
      {(s.tags?.culture || []).length > 0 && (
        <div style={{ textAlign: 'center', fontSize: 11, marginBottom: 8, color: '#475569' }}>
          <b style={{ color: '#7c3aed' }}>Objets d'étude :</b>{' '}
          {(s.tags.culture || []).map(t => t.text).join(' · ')}
        </div>
      )}

      {/* Objectif culturel */}
      {s.objectifCulturel && (
        <div style={{ textAlign: 'center', fontSize: 11, color: '#475569', padding: '6px 12px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: 4, marginBottom: 12 }}>
          {s.objectifCulturel}
        </div>
      )}

      {/* Problématique */}
      {s.problematique && <div className="a4-prob">{s.problematique}</div>}

      {/* Banner image */}
      {imgOk && s.imgShape === 'banner' && <img src={s.imgUrl} alt="" className="a4-banner" onError={(e) => { e.target.style.display = 'none'; }} />}

      <div style={contentStyle}>
        {renderHeader()}
        {renderActivitesLangagieres()}
        {renderComposantes()}
        {renderEvaluations()}
        {renderEtapes()}
        {renderSupportsPlus()}
        {renderIssues()}
        {renderGrilles()}
      </div>

      <div className="a4-footer">
        Lesson Loom — fiche de bord {s.annee || ''}
        {prefs?.profName && <span style={{ marginLeft: 12, fontStyle: 'italic' }}>· {prefs.profName}</span>}
      </div>
    </div>
  );
};

const SectionTitle = ({ bg, fg, label }) => (
  <div style={{ background: bg, color: fg, padding: '5px 10px', fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, borderRadius: 4, marginBottom: 4 }}>
    {label}
  </div>
);

export default A4Preview;
