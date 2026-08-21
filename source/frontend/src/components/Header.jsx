import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { NotebookPen, Pencil, Target, CalendarDays, ClipboardList, Search, Sun, Moon, Upload, Download, FileDown, FileJson, FileText, HardDriveDownload, Loader2 } from 'lucide-react';
import { downloadStandaloneApp } from '../utils/standaloneBuilder';
import { exportAllDataAsHtml } from '../utils/backupHtml';

const Header = () => {
  const { activeView, setActiveView, prefs, setPrefs, toggleTheme, exportAllData, importAllData, data } = useApp();
  const fileInputRef = useRef(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [downloadingApp, setDownloadingApp] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const exportMenuRef = useRef(null);

  // Fermer le menu si clic en dehors
  useEffect(() => {
    if (!exportMenuOpen) return;
    const onClick = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [exportMenuOpen]);

  const tabs = [
    { id: 'seq', label: 'Séquences', Icon: NotebookPen },
    { id: 'sea', label: 'Séances', Icon: Pencil },
    { id: 'prog', label: 'Progression', Icon: Target },
    { id: 'cal', label: 'Calendrier', Icon: CalendarDays },
    { id: 'eval', label: 'Évaluations', Icon: ClipboardList }
  ];

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (importAllData(ev.target.result)) {
        alert('Données importées avec succès !');
      } else {
        alert('Erreur lors de l\'import du fichier.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDownloadApp = async () => {
    if (downloadingApp) return;
    setDownloadingApp(true);
    setDownloadProgress('Préparation…');
    try {
      const size = await downloadStandaloneApp({ onProgress: (m) => setDownloadProgress(m) });
      const mb = (size / 1024 / 1024).toFixed(1);
      setDownloadProgress('');
      setTimeout(() => {
        alert(`✅ Application téléchargée (${mb} Mo) !\n\nDouble-cliquez sur le fichier "lesson-loom-${new Date().toISOString().slice(0, 10)}.html" pour l'ouvrir dans votre navigateur.\n\nElle fonctionne 100 % hors-ligne. Vos données restent enregistrées dans chaque navigateur où vous ouvrez le fichier.`);
      }, 150);
    } catch (err) {
      setDownloadProgress('');
      alert('❌ Erreur lors du téléchargement de l\'application :\n\n' + (err?.message || err));
    } finally {
      setDownloadingApp(false);
    }
  };

  const handleExportJson = () => {
    exportAllData();
    setExportMenuOpen(false);
  };

  const handleExportHtmlBackup = () => {
    exportAllDataAsHtml(data);
    setExportMenuOpen(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
    setExportMenuOpen(false);
  };

  return (
    <header className="hdr no-print">
      <div className="logo">
        <div className="logo-ico">
          <NotebookPen size={18} />
        </div>
        <div>
          <div className="logo-txt">🪄 Lesson Loom</div>
          <div className="logo-sub">⚡ Unit Blast</div>
        </div>
      </div>

      <div className="nav-tabs" role="tablist">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            data-testid={`nav-tab-${id}`}
            className={`nav-tab ${activeView === id ? 'active' : ''}`}
            onClick={() => setActiveView(id)}
          >
            <Icon size={14} />
            <span className="label">{label}</span>
          </button>
        ))}
      </div>

      <div className="hdr-actions">
        {/* Champ "Nom du prof" — affiché en pied de page sur tous les documents */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px' }} title="Nom du professeur (affiché sur tous les documents)">
          <span style={{ fontSize: 13 }}>👤</span>
          <input
            data-testid="prof-name-input"
            type="text"
            value={prefs.profName || ''}
            onChange={e => setPrefs(p => ({ ...p, profName: e.target.value }))}
            placeholder="Nom du prof"
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, fontWeight: 600, color: 'var(--fg)', width: 140 }}
          />
        </div>
        {/* NOUVEAU : Télécharger l'app (fichier HTML hors-ligne) */}
        <button
          data-testid="download-app-btn"
          className="btn-download-app"
          onClick={handleDownloadApp}
          disabled={downloadingApp}
          title="Télécharger l'application en un seul fichier HTML hors-ligne (double-clic pour ouvrir)"
        >
          {downloadingApp ? <Loader2 size={13} className="spin" /> : <HardDriveDownload size={13} />}
          <span className="lbl-pwa">{downloadingApp ? (downloadProgress || 'Téléchargement…') : 'Télécharger l\'app'}</span>
        </button>

        <button
          data-testid="search-btn"
          className="btn btn-ghost btn-sm"
          title="Rechercher dans les séquences, séances, grilles"
          onClick={() => setActiveView('search')}
        >
          <Search size={14} />
        </button>

        {/* Menu d'export amélioré */}
        <div className="export-menu-wrap" ref={exportMenuRef}>
          <button
            data-testid="export-menu-btn"
            className="btn btn-ghost btn-sm"
            title="Exporter / Sauvegarder vos données"
            onClick={() => setExportMenuOpen((o) => !o)}
          >
            <Download size={14} />
          </button>
          {exportMenuOpen && (
            <div className="export-menu" data-testid="export-menu">
              <button data-testid="export-json-btn" className="export-menu-item" onClick={handleExportJson}>
                <FileJson size={14} />
                <div>
                  <div className="emi-title">Sauvegarde JSON</div>
                  <div className="emi-sub">Fichier technique pour ré-importer</div>
                </div>
              </button>
              <button data-testid="export-html-backup-btn" className="export-menu-item" onClick={handleExportHtmlBackup}>
                <FileText size={14} />
                <div>
                  <div className="emi-title">Sauvegarde HTML</div>
                  <div className="emi-sub">Document lisible avec toutes vos séquences</div>
                </div>
              </button>
              <div className="export-menu-sep" />
              <button data-testid="import-btn" className="export-menu-item" onClick={handleImportClick}>
                <Upload size={14} />
                <div>
                  <div className="emi-title">Importer une sauvegarde</div>
                  <div className="emi-sub">Restaurer un fichier JSON</div>
                </div>
              </button>
            </div>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleImport} />

        <button data-testid="theme-toggle" className="neo-toggle" onClick={toggleTheme} aria-label="Basculer le thème">
          <span className="knob">
            {prefs.theme === 'light' ? <Sun size={12} /> : <Moon size={12} />}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
