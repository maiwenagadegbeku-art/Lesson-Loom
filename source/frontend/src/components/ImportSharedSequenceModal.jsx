import React from 'react';
import { useApp } from '../contexts/AppContext';
import { X, Download, CheckCircle2 } from 'lucide-react';

const ImportSharedSequenceModal = () => {
  const { sharedImport, confirmSharedImport, cancelSharedImport } = useApp();

  if (!sharedImport) return null;

  const titre = sharedImport.titre || 'Séquence sans titre';
  const niveau = sharedImport.niveau === 'DNL'
    ? (sharedImport.dnlDiscipline ? `DNL ${sharedImport.dnlDiscipline}` : 'DNL')
    : (sharedImport.niveau || '').replace(/_/g, ' ');
  const lv = sharedImport.lv;
  const dnlLevel = sharedImport.dnlLevel;
  const lvlLine = niveau + (
    sharedImport.niveau === 'DNL' && dnlLevel
      ? ` · ${dnlLevel}`
      : (lv && /Seconde|Première|Terminale/.test(niveau) ? ` · ${lv}` : '')
  );
  const annee = sharedImport.annee || '';
  const sousTitre = sharedImport.sousTitre || '';
  const axe = sharedImport.axe || '';
  const nbSeances = sharedImport.nbSeances || '';
  const nbActivites = ['comp_co','comp_ce','comp_po','comp_pe','comp_io','comp_ie','comp_med']
    .reduce((acc, k) => acc + ((sharedImport.tags && sharedImport.tags[k]) || []).length, 0);
  const nbGrilles = (sharedImport.grilles || []).length;
  const nbSeancesPlanifiees = (sharedImport.seances || []).length;

  return (
    <div className="modal-back" data-testid="shared-import-modal" onClick={cancelSharedImport}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#dcfce7', color: '#166534', padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>
              <Download size={12} /> Séquence partagée reçue
            </div>
            <div className="modal-title">Importer cette séquence&nbsp;?</div>
            <div className="modal-sub">Elle sera ajoutée à vos séquences sans écraser celles existantes.</div>
          </div>
          <button data-testid="shared-import-close" className="btn btn-ghost btn-sm" onClick={cancelSharedImport}><X size={14} /></button>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{titre}</div>
          {sousTitre && <div style={{ fontSize: 13, color: '#475569', fontStyle: 'italic', marginBottom: 8 }}>{sousTitre}</div>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {lvlLine && <span style={{ background: '#1e3a5f', color: '#fff', padding: '3px 10px', borderRadius: 999, fontSize: 10.5, fontWeight: 700 }}>{lvlLine}</span>}
            {annee && <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '3px 10px', borderRadius: 999, fontSize: 10.5, fontWeight: 700 }}>{annee}</span>}
            {nbSeances && <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: 999, fontSize: 10.5, fontWeight: 700 }}>{nbSeances}</span>}
          </div>
          {axe && (
            <div style={{ fontSize: 12, color: '#475569' }}>
              <b style={{ color: '#4338ca' }}>Axe :</b> {axe}
            </div>
          )}
          <div style={{ display: 'flex', gap: 14, marginTop: 12, paddingTop: 10, borderTop: '1px solid #e2e8f0', fontSize: 11.5, color: '#64748b' }}>
            <span>📝 {nbActivites} activité{nbActivites > 1 ? 's' : ''}</span>
            <span>📅 {nbSeancesPlanifiees} étape{nbSeancesPlanifiees > 1 ? 's' : ''}</span>
            <span>🎯 {nbGrilles} grille{nbGrilles > 1 ? 's' : ''}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button data-testid="shared-import-cancel" className="btn btn-ghost" onClick={cancelSharedImport}>
            Annuler
          </button>
          <button data-testid="shared-import-confirm" className="btn btn-share" onClick={confirmSharedImport} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={15} /> Oui, ajouter à mes séquences
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportSharedSequenceModal;
