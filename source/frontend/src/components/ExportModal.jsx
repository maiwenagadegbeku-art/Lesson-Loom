import React from 'react';
import { X, Printer, FileText, FileDown, Code, Share2 } from 'lucide-react';
import { exportPDF, exportWord, exportMarkdown, exportShareHtml } from '../utils/exporters';

const ExportModal = ({ sequence, onClose }) => {
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div className="modal-title">Exporter la séquence</div>
            <div className="modal-sub">Choisissez le format souhaité.</div>
          </div>
          <button data-testid="export-modal-close" className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <button data-testid="export-pdf-btn" className="btn btn-blue" onClick={() => { exportPDF(sequence); onClose(); }} style={{ padding: 18, flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
            <Printer size={22} />
            <div>PDF (Imprimer)</div>
            <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.85 }}>Via l'imprimante du navigateur</span>
          </button>
          <button data-testid="export-word-btn" className="btn btn-violet" onClick={() => { exportWord(sequence); onClose(); }} style={{ padding: 18, flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
            <FileDown size={22} />
            <div>Word (.doc)</div>
            <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.85 }}>Fichier compatible Word / LibreOffice</span>
          </button>
          <button data-testid="export-markdown-btn" className="btn btn-orange" onClick={() => { exportMarkdown(sequence); onClose(); }} style={{ padding: 18, flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
            <Code size={22} />
            <div>Markdown (.md)</div>
            <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.85 }}>Format texte brut structuré</span>
          </button>
          <button data-testid="export-share-html-btn" className="btn btn-share" onClick={() => { exportShareHtml(sequence); onClose(); }} style={{ padding: 18, flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
            <Share2 size={22} />
            <div>Partager (HTML)</div>
            <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.85 }}>Document à envoyer à un collègue, ouvrable d'un double-clic</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
