import React, { useMemo, useState, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { ClipboardList, Users, Upload, Download, X, ArrowRight, Search, FileSpreadsheet } from 'lucide-react';
import { parseCsvStudents, downloadDistribution } from '../utils/distributeStudents';

// Vue "Évaluations" : liste centralisée de toutes les grilles créées dans
// toutes les séquences, avec bouton "Distribuer multi-élèves" qui prend un
// CSV de noms et génère un fichier HTML autonome (une grille par élève).
const EvaluationsView = () => {
  const { data, setActiveView, prefs } = useApp();
  const [filter, setFilter] = useState('');
  const [distribModal, setDistribModal] = useState(null); // { grille, sequenceTitle, sequenceId }

  // Aplatit toutes les grilles trouvées dans les séquences, avec leur contexte
  const allGrilles = useMemo(() => {
    const out = [];
    (data.sequences || []).forEach(seq => {
      (seq.grilles || []).forEach(g => {
        out.push({
          grille: g,
          sequenceId: seq.id,
          sequenceTitle: seq.title || '(sans titre)',
          niveau: seq.niveau || '',
          axe: seq.axe || '',
          createdAt: seq.updatedAt || 0
        });
      });
    });
    return out.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [data.sequences]);

  const filtered = useMemo(() => {
    if (!filter.trim()) return allGrilles;
    const q = filter.toLowerCase();
    return allGrilles.filter(({ grille, sequenceTitle, niveau }) =>
      (grille.name || '').toLowerCase().includes(q) ||
      (grille.competence || '').toLowerCase().includes(q) ||
      sequenceTitle.toLowerCase().includes(q) ||
      niveau.toLowerCase().includes(q)
    );
  }, [allGrilles, filter]);

  const openInSequence = (item) => {
    // Bascule vers la vue Séquences (le prof retrouve sa séquence dans la liste).
    setActiveView('seq');
  };

  return (
    <div className="app-view" style={{ display: 'block', overflowY: 'auto' }}>
      <div className="dash">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 className="dash-title" style={{ margin: 0 }}>Évaluations</h1>
            <p className="dash-sub" style={{ margin: '4px 0 0' }}>
              Toutes tes grilles, prêtes à imprimer ou à distribuer à une classe entière via un fichier HTML annexe.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '6px 10px' }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              data-testid="eval-search"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Rechercher (grille, séquence, niveau…)"
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, minWidth: 220 }}
            />
          </div>
        </div>

      {allGrilles.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--card)', border: '1px dashed var(--border)', borderRadius: 14 }}>
          <ClipboardList size={48} color="var(--text-muted)" style={{ marginBottom: 14 }} />
          <h3 style={{ margin: '0 0 6px' }}>Aucune grille pour l'instant</h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13 }}>
            Crée une grille dans une séquence (onglet « Évaluations & Grilles ») et elle apparaîtra ici.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Aucun résultat pour « {filter} ».
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {filtered.map((item) => (
            <GrilleCard
              key={item.sequenceId + '-' + item.grille.id}
              item={item}
              onDistribute={() => setDistribModal(item)}
              onOpen={() => openInSequence(item)}
            />
          ))}
        </div>
      )}

      {distribModal && (
        <DistributeModal
          item={distribModal}
          profName={prefs?.profName || ''}
          onClose={() => setDistribModal(null)}
        />
      )}
      </div>
    </div>
  );
};

const GrilleCard = ({ item, onDistribute, onOpen }) => {
  const { grille, sequenceTitle, niveau } = item;
  const nRows = (grille.rows || []).length;
  const nCols = (grille.cols || []).length;
  const nCells = nRows * nCols;
  const isOff = !!grille.officiel;
  return (
    <div
      data-testid={`grille-card-${grille.id}`}
      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: isOff ? '#b45309' : 'var(--primary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
            {isOff ? '🏛️ Grille officielle BAC' : (grille.competence || 'Grille')}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', lineHeight: 1.3 }}>{grille.name || 'Grille sans titre'}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {sequenceTitle}{niveau ? ' · ' + niveau : ''}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, padding: '8px 0', fontSize: 11, color: 'var(--text-muted)', borderTop: '1px dashed var(--border)' }}>
        <div><b style={{ color: 'var(--fg)' }}>{nRows}</b> lignes</div>
        <div><b style={{ color: 'var(--fg)' }}>{nCols}</b> colonnes</div>
        <div><b style={{ color: 'var(--fg)' }}>{nCells}</b> cases</div>
        <div style={{ marginLeft: 'auto' }}>/{grille.totalPoints || '?'} pts</div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
        <button data-testid={`open-grille-${grille.id}`} className="btn btn-ghost btn-sm" onClick={onOpen} style={{ flex: 1 }}>
          <ArrowRight size={12} /> Ouvrir
        </button>
        <button data-testid={`distribute-${grille.id}`} className="btn btn-violet btn-sm" onClick={onDistribute} style={{ flex: 1.4 }}>
          <Users size={12} /> Distribuer
        </button>
      </div>
    </div>
  );
};

const DistributeModal = ({ item, profName = '', onClose }) => {
  const { grille, sequenceTitle } = item;
  const [csvRaw, setCsvRaw] = useState('');
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_000_000) {
      setError('Fichier trop volumineux (max 1 Mo). Garde uniquement la liste des élèves.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target.result || '');
      setCsvRaw(text);
      try {
        const list = parseCsvStudents(text);
        setStudents(list);
        setError(list.length === 0 ? 'Aucun élève détecté dans le fichier.' : '');
      } catch (err) {
        setError('Impossible de lire ce fichier : ' + err.message);
      }
    };
    reader.onerror = () => setError('Erreur de lecture du fichier.');
    reader.readAsText(file);
  };

  const handleTextChange = (text) => {
    setCsvRaw(text);
    try {
      const list = parseCsvStudents(text);
      setStudents(list);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGenerate = () => {
    if (students.length === 0) {
      setError('Ajoute au moins un élève.');
      return;
    }
    downloadDistribution(grille, students, sequenceTitle, profName);
  };

  return (
    <div className="modal-back" onClick={onClose} data-testid="distribute-modal">
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(139, 92, 246, 0.15)', color: '#5b21b6', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
              <Users size={12} /> Distribution multi-élèves
            </div>
            <div className="modal-title">Distribuer « {grille.name || 'cette grille'} »</div>
            <div className="modal-sub">Importe un CSV avec tes élèves. Je génère un fichier HTML autonome contenant une grille par élève, avec calcul automatique de la note.</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label className="fl">1) Importer un fichier CSV</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                ref={fileRef}
                data-testid="csv-file-input"
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                onChange={handleFile}
                style={{ display: 'none' }}
              />
              <button className="btn btn-violet btn-sm" onClick={() => fileRef.current?.click()}>
                <Upload size={12} /> Choisir un fichier CSV
              </button>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Colonnes auto-détectées : nom, prenom, classe (séparateur «,» «;» ou tabulation).
              </span>
            </div>
          </div>

          <div>
            <label className="fl">… ou coller la liste ici</label>
            <textarea
              data-testid="csv-textarea"
              className="fi field-textarea"
              value={csvRaw}
              onChange={e => handleTextChange(e.target.value)}
              placeholder={`nom,prenom,classe\nDupont,Marie,1ere A\nDurand,Paul,1ere A\n\nOU simplement :\nMarie Dupont\nPaul Durand`}
              style={{ minHeight: 130, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
            />
          </div>

          {error && (
            <div style={{ padding: 10, background: '#fee2e2', border: '1px solid #ef4444', borderRadius: 8, color: '#991b1b', fontSize: 12 }}>
              ⚠️ {error}
            </div>
          )}

          {students.length > 0 && (
            <div data-testid="students-preview" style={{ padding: 10, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span>Aperçu — {students.length} élève(s) détecté(s)</span>
                <button className="btn btn-ghost btn-sm" onClick={() => { setStudents([]); setCsvRaw(''); }}>
                  <X size={10} /> Réinitialiser
                </button>
              </div>
              <div style={{ maxHeight: 140, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 4 }}>
                {students.slice(0, 60).map((s, i) => (
                  <div key={i} style={{ fontSize: 11, padding: '4px 8px', background: 'rgba(139, 92, 246, 0.08)', borderRadius: 4 }}>
                    <b>{s.name}</b>{s.classe && <span style={{ color: 'var(--text-muted)' }}> · {s.classe}</span>}
                  </div>
                ))}
                {students.length > 60 && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>… et {students.length - 60} de plus</div>}
              </div>
            </div>
          )}

          <div style={{ padding: 10, background: 'rgba(108, 99, 255, 0.08)', borderRadius: 8, fontSize: 11, color: 'var(--text-muted)' }}>
            💡 Le fichier généré fonctionne <b>hors ligne</b>. Le prof remplit chaque grille dans son navigateur, la note se calcule en direct, et il peut télécharger la grille individuelle de chaque élève pour la transmettre.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button
            data-testid="generate-distrib-btn"
            className="btn btn-violet"
            onClick={handleGenerate}
            disabled={students.length === 0}
          >
            <Download size={14} /> Générer le fichier ({students.length} élève{students.length > 1 ? 's' : ''})
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationsView;
