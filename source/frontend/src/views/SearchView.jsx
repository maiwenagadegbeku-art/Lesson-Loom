import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Search, NotebookPen, Pencil, ClipboardList, Target, X, ArrowRight } from 'lucide-react';

// Recherche globale dans toute l'application :
// titres et contenus de séquences, séances et grilles.
const SearchView = () => {
  const { data, setActiveView } = useApp();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return { sequences: [], seances: [], grilles: [], progressions: [] };

    const matches = (txt) => (txt || '').toLowerCase().includes(q);

    const sequences = [];
    const seances = [];
    const grilles = [];
    const progressions = [];

    (data.sequences || []).forEach(seq => {
      const seqHit = matches(seq.titre) || matches(seq.axe) || matches(seq.axeMineur)
        || matches(seq.objectifCulturel) || matches(seq.problematique) || matches(seq.tache)
        || (seq.tags?.lexique || []).some(t => matches(t.text))
        || (seq.tags?.grammar || []).some(t => matches(t.text))
        || (seq.tags?.phono || []).some(t => matches(t.text))
        || (seq.tags?.culture || []).some(t => matches(t.text));
      if (seqHit) sequences.push(seq);

      (seq.seances || []).forEach(sea => {
        const seaHit = matches(sea.titre) || matches(sea.objectif)
          || (sea.objLex || []).some(t => matches(t.text))
          || (sea.objGram || []).some(t => matches(t.text))
          || (sea.supportsList || []).some(s => matches(s.titre) || matches(s.note))
          || matches(sea.trace) || matches(sea.devoirs);
        if (seaHit) seances.push({ ...sea, sequenceId: seq.id, sequenceTitle: seq.titre });
      });

      (seq.grilles || []).forEach(g => {
        if (matches(g.name) || matches(g.competence)) {
          grilles.push({ ...g, sequenceId: seq.id, sequenceTitle: seq.titre });
        }
      });
    });

    (data.progressions || []).forEach(p => {
      if (matches(p.title)) progressions.push(p);
    });

    return { sequences, seances, grilles, progressions };
  }, [data, query]);

  const totalHits = results.sequences.length + results.seances.length + results.grilles.length + results.progressions.length;

  return (
    <div className="app-view" style={{ display: 'block', overflowY: 'auto' }}>
      <div className="dash">
        <div style={{ marginBottom: 22 }}>
          <h1 className="dash-title" style={{ margin: 0 }}>Recherche</h1>
          <p className="dash-sub" style={{ margin: '4px 0 0' }}>
            Cherche dans tes séquences, séances, grilles et progressions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card)', border: '2px solid var(--primary)', borderRadius: 12, padding: '10px 16px', marginBottom: 20, boxShadow: '0 2px 12px rgba(108, 99, 255, 0.12)' }}>
          <Search size={18} color="var(--primary)" />
          <input
            data-testid="search-input"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tape au moins 2 lettres… (titres, lexique, grammaire, objets d'étude, etc.)"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: 'var(--fg)' }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="btn btn-ghost btn-sm">
              <X size={12} />
            </button>
          )}
        </div>

        {query.trim().length < 2 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Tape au moins 2 caractères pour démarrer la recherche…
          </div>
        ) : totalHits === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Aucun résultat pour <b>« {query} »</b>.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 18 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              <b style={{ color: 'var(--primary)' }}>{totalHits}</b> résultat{totalHits > 1 ? 's' : ''} trouvé{totalHits > 1 ? 's' : ''}
            </div>

            {results.sequences.length > 0 && (
              <ResultGroup
                icon={<NotebookPen size={14} />}
                title="Séquences"
                count={results.sequences.length}
                items={results.sequences}
                renderItem={(s) => (
                  <ResultCard
                    key={s.id}
                    testId={`search-seq-${s.id}`}
                    title={s.titre || '(sans titre)'}
                    subtitle={`${s.niveau || ''} · ${s.lv || ''}${s.axe ? ' · ' + s.axe : ''}`}
                    badge={`${(s.seances || []).length} séance(s) · ${(s.grilles || []).length} grille(s)`}
                    onClick={() => setActiveView('seq')}
                  />
                )}
              />
            )}

            {results.seances.length > 0 && (
              <ResultGroup
                icon={<Pencil size={14} />}
                title="Séances"
                count={results.seances.length}
                items={results.seances}
                renderItem={(s) => (
                  <ResultCard
                    key={s.id}
                    testId={`search-sea-${s.id}`}
                    title={s.titre || '(sans titre)'}
                    subtitle={`Séquence : ${s.sequenceTitle}${s.objectif ? ' · ' + s.objectif.slice(0, 60) : ''}`}
                    onClick={() => setActiveView('sea')}
                  />
                )}
              />
            )}

            {results.grilles.length > 0 && (
              <ResultGroup
                icon={<ClipboardList size={14} />}
                title="Grilles"
                count={results.grilles.length}
                items={results.grilles}
                renderItem={(g) => (
                  <ResultCard
                    key={g.id}
                    testId={`search-gri-${g.id}`}
                    title={g.name || '(sans titre)'}
                    subtitle={`Séquence : ${g.sequenceTitle} · ${g.competence || 'Grille'} · /${g.totalPoints || '?'} pts`}
                    onClick={() => setActiveView('eval')}
                  />
                )}
              />
            )}

            {results.progressions.length > 0 && (
              <ResultGroup
                icon={<Target size={14} />}
                title="Progressions"
                count={results.progressions.length}
                items={results.progressions}
                renderItem={(p) => (
                  <ResultCard
                    key={p.id}
                    testId={`search-prog-${p.id}`}
                    title={p.title || '(sans titre)'}
                    subtitle={`${p.niveau || ''} · ${(p.sequences || []).length} séquence(s)`}
                    onClick={() => setActiveView('prog')}
                  />
                )}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ResultGroup = ({ icon, title, count, items, renderItem }) => (
  <div>
    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
      {icon} {title} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({count})</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
      {items.map(renderItem)}
    </div>
  </div>
);

const ResultCard = ({ title, subtitle, badge, onClick, testId }) => (
  <div
    data-testid={testId}
    onClick={onClick}
    style={{ padding: 12, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
  >
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{subtitle}</div>
      {badge && <div style={{ marginTop: 4, fontSize: 10, color: 'var(--primary)', fontWeight: 700 }}>{badge}</div>}
    </div>
    <ArrowRight size={14} color="var(--text-muted)" />
  </div>
);

export default SearchView;
