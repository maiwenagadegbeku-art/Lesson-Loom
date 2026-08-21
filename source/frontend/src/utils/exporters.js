import { COMPETENCES } from '../data/sequenceurData';
import { ACTIVITES_FR, SUPPORT_TYPES } from '../data/sequenceurData2';

const sanitize = (s = '') => String(s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

const buildHtml = (seq) => {
  const mode = seq.nomenclatureMode || 'cecrl';
  const lvl = (seq.niveau || '').replace(/_/g, ' ') + (seq.lv && /Seconde|Première|Terminale/.test(seq.niveau) && !seq.niveau.includes('_') ? ' · ' + seq.lv : '');
  const out = [];

  // Header bloc
  out.push(`<div style="margin-bottom:18pt">`);
  out.push(`<div style="float:left;color:#64748b;font-size:10pt;font-weight:600">${sanitize(seq.annee || '')}</div>`);
  out.push(`<div style="float:right;background:#1e3a5f;color:#fff;padding:3pt 10pt;border-radius:12pt;font-size:9pt;font-weight:700;text-transform:uppercase">${sanitize(lvl)}</div>`);
  out.push(`<div style="clear:both;height:18pt"></div>`);
  out.push(`<h1 style="font-family:Georgia,serif;font-size:22pt;text-align:center;margin:8pt 0;color:#1e293b">${sanitize(seq.titre || 'Sans titre')}</h1>`);
  if (seq.axe || seq.axeMineur) {
    out.push(`<div style="text-align:center;font-size:10pt;margin-bottom:6pt">`);
    if (seq.axe) out.push(`<div><b style="color:#4338ca">Majeur :</b> ${sanitize(seq.axe)}</div>`);
    if (seq.axeMineur) out.push(`<div><b style="color:#7c3aed">Mineur :</b> ${sanitize(seq.axeMineur)}</div>`);
    out.push(`</div>`);
  }
  if (seq.objectifCulturel) {
    out.push(`<div style="text-align:center;font-size:10pt;background:#fef9c3;border:1pt solid #fde047;border-radius:4pt;padding:6pt 12pt;margin-bottom:10pt;color:#475569">${sanitize(seq.objectifCulturel)}</div>`);
  }
  if (seq.problematique) {
    out.push(`<div style="text-align:center;font-style:italic;color:#475569;font-size:11pt;padding:6pt 12pt;border-left:3pt solid #6c63ff;border-right:3pt solid #6c63ff;background:#f8fafc;margin-bottom:12pt">${sanitize(seq.problematique)}</div>`);
  }
  out.push(`</div>`);

  // En-tête tableau
  out.push(`<table style="width:100%;border-collapse:collapse;margin-bottom:12pt"><tbody>`);
  out.push(`<tr><td style="background:#fef3c7;color:#92400e;font-weight:800;font-size:11pt;padding:6pt;border:1pt solid #cbd5e1;width:40%">Thème de la séquence<br><span style="font-weight:700;font-size:13pt;font-family:Georgia,serif">${sanitize(seq.titre || '—')}</span></td>`);
  out.push(`<td style="background:#fff;font-weight:700;font-size:10.5pt;padding:6pt;border:1pt solid #cbd5e1">${seq.numero ? `Séquence n°${sanitize(seq.numero)}` : ''} ${seq.nbSeances ? `<span style="color:#64748b;font-weight:400">(${sanitize(seq.nbSeances)})</span>` : ''}</td>`);
  out.push(`<td style="background:#fff;font-size:10pt;color:#475569;font-style:italic;padding:6pt;border:1pt solid #cbd5e1">${sanitize(seq.sousTitre || '')}</td></tr>`);
  if ((seq.tags?.task || []).length > 0) {
    out.push(`<tr><td style="background:#fee2e2;color:#991b1b;font-weight:800;font-size:10pt;padding:6pt;border:1pt solid #cbd5e1">Tâche visée</td><td colspan="2" style="padding:6pt;border:1pt solid #cbd5e1;font-size:10.5pt">${seq.tags.task.map(t => sanitize(t.text)).join(' / ')}</td></tr>`);
  }
  if (seq.descripteurCible) {
    out.push(`<tr><td style="background:#dbeafe;color:#1e40af;font-weight:800;font-size:10pt;padding:6pt;border:1pt solid #cbd5e1">CECRL Visée</td><td colspan="2" style="padding:6pt;border:1pt solid #cbd5e1;font-size:10.5pt;font-style:italic">« ${sanitize(seq.descripteurCible)} »</td></tr>`);
  }
  out.push(`</tbody></table>`);

  // Activités langagières
  if (mode === 'fr') {
    const items = ACTIVITES_FR.filter(a => {
      const d = seq.activitesFR?.[a.code];
      return d && (d.niveauCible || d.strategies || d.supports);
    });
    if (items.length) {
      out.push(`<div style="background:#dcfce7;color:#166534;padding:4pt 10pt;font-size:10pt;font-weight:800;text-transform:uppercase;letter-spacing:1pt;border-radius:4pt;margin-bottom:4pt">Activités langagières</div>`);
      out.push(`<table style="width:100%;border-collapse:collapse;margin-bottom:12pt"><thead><tr style="background:#dcfce7;color:#166534"><th style="border:1pt solid #cbd5e1;padding:4pt;font-size:9pt">Activité</th><th style="border:1pt solid #cbd5e1;padding:4pt;font-size:9pt">Cible</th><th style="border:1pt solid #cbd5e1;padding:4pt;font-size:9pt">Stratégies</th><th style="border:1pt solid #cbd5e1;padding:4pt;font-size:9pt">Supports</th></tr></thead><tbody>`);
      items.forEach(a => {
        const d = seq.activitesFR[a.code];
        out.push(`<tr><td style="border:1pt solid #cbd5e1;padding:5pt;font-weight:800;color:#166534">${a.code}</td><td style="border:1pt solid #cbd5e1;padding:5pt;text-align:center;font-weight:700">${sanitize(d.niveauCible || '—')}</td><td style="border:1pt solid #cbd5e1;padding:5pt;font-size:10pt;white-space:pre-wrap">${sanitize(d.strategies || '—')}</td><td style="border:1pt solid #cbd5e1;padding:5pt;font-size:10pt;white-space:pre-wrap">${sanitize(d.supports || '—')}</td></tr>`);
      });
      out.push(`</tbody></table>`);
    }
  } else {
    const filled = COMPETENCES.filter(c => (seq.tags?.['comp_' + c.code.toLowerCase()] || []).length > 0);
    if (filled.length) {
      out.push(`<div style="background:#dcfce7;color:#166534;padding:4pt 10pt;font-size:10pt;font-weight:800;text-transform:uppercase;letter-spacing:1pt;border-radius:4pt;margin-bottom:4pt">Activités langagières CECRL</div>`);
      out.push(`<table style="width:100%;border-collapse:collapse;margin-bottom:12pt"><tbody>`);
      filled.forEach(c => {
        const items = seq.tags['comp_' + c.code.toLowerCase()];
        out.push(`<tr><td style="border:1pt solid #cbd5e1;padding:5pt;font-weight:800;width:15%;color:#166534">${c.code}<br><span style="font-weight:400;font-size:8pt;color:#64748b">${sanitize(c.label)}</span></td><td style="border:1pt solid #cbd5e1;padding:5pt;font-size:10pt">${items.map(t => `${t.level ? `<span style="background:#6c63ff;color:#fff;padding:1pt 5pt;border-radius:3pt;font-size:8pt;font-weight:800;margin-right:3pt">${t.level}</span>` : ''}${sanitize(t.text)}`).join('<br>')}</td></tr>`);
      });
      out.push(`</tbody></table>`);
    }
  }

  // Composantes
  const lex = (seq.tags?.lexique || []).map(t => sanitize(t.text));
  const gram = (seq.tags?.grammar || []).map(t => sanitize(t.text));
  const phono = (seq.tags?.phono || []).map(t => sanitize(t.text));
  const prag = (seq.tags?.pragma || []).map(t => `${t.level ? `(${t.level}) ` : ''}${sanitize(t.text)}`);
  if (lex.length || gram.length || phono.length || prag.length) {
    out.push(`<table style="width:100%;border-collapse:collapse;margin-bottom:8pt"><thead>`);
    out.push(`<tr><th colspan="3" style="background:#fae8ff;color:#86198f;border:1pt solid #cbd5e1;padding:4pt;font-size:9pt;text-transform:uppercase">Composante linguistique</th><th style="background:#ede9fe;color:#5b21b6;border:1pt solid #cbd5e1;padding:4pt;font-size:9pt;text-transform:uppercase">Composante pragmatique</th></tr>`);
    out.push(`<tr><th style="background:#f8fafc;border:1pt solid #cbd5e1;padding:4pt;font-size:9pt">Lexique</th><th style="background:#f8fafc;border:1pt solid #cbd5e1;padding:4pt;font-size:9pt">Phonologie</th><th style="background:#f8fafc;border:1pt solid #cbd5e1;padding:4pt;font-size:9pt">Grammaire</th><th style="background:#f8fafc;border:1pt solid #cbd5e1;padding:4pt;font-size:9pt">Pragmatique</th></tr></thead><tbody>`);
    out.push(`<tr><td style="border:1pt solid #cbd5e1;padding:5pt;font-size:9.5pt;vertical-align:top">${lex.join(' · ') || '—'}</td><td style="border:1pt solid #cbd5e1;padding:5pt;font-size:9.5pt;vertical-align:top">${phono.join(' · ') || '—'}</td><td style="border:1pt solid #cbd5e1;padding:5pt;font-size:9.5pt;vertical-align:top">${gram.join(' · ') || '—'}</td><td style="border:1pt solid #cbd5e1;padding:5pt;font-size:9.5pt;vertical-align:top">${prag.join(' · ') || '—'}</td></tr></tbody></table>`);
  }
  const rowBox = (bg, fg, label, content) => `<table style="width:100%;border-collapse:collapse;margin-bottom:8pt"><tbody><tr><td style="background:${bg};color:${fg};font-weight:800;font-size:10pt;padding:6pt;border:1pt solid #cbd5e1;width:25%">${label}</td><td style="padding:6pt;border:1pt solid #cbd5e1;font-size:10pt">${sanitize(content)}</td></tr></tbody></table>`;
  if (seq.sociolinguistique) out.push(rowBox('#cffafe', '#155e75', 'Composante sociolinguistique', seq.sociolinguistique));
  if (seq.culturelLong) out.push(rowBox('#ffedd5', '#9a3412', 'Composante culturelle', seq.culturelLong));
  if (seq.tice) out.push(rowBox('#e0e7ff', '#3730a3', 'TICE / Outils', seq.tice));

  // Évaluations
  const ev = seq.evaluations || {};
  const hasForm = (ev.formatives || []).length > 0;
  const hasSomm = (ev.sommatives || []).length > 0;
  if (hasForm || hasSomm) {
    out.push(`<table style="width:100%;border-collapse:collapse;margin-bottom:12pt"><thead><tr><th style="background:#fef9c3;color:#854d0e;border:1pt solid #cbd5e1;padding:5pt;width:50%;font-size:10pt">Évaluations Formatives</th><th style="background:#fce7f3;color:#9f1239;border:1pt solid #cbd5e1;padding:5pt;width:50%;font-size:10pt">Évaluations Sommatives</th></tr></thead><tbody><tr>`);
    out.push(`<td style="border:1pt solid #cbd5e1;padding:6pt;vertical-align:top;font-size:10pt">${hasForm ? ev.formatives.map(f => `▸ ${sanitize(f.text)}`).join('<br>') : '—'}</td>`);
    out.push(`<td style="border:1pt solid #cbd5e1;padding:6pt;vertical-align:top;font-size:10pt">${hasSomm ? ev.sommatives.map(s => `<div style="margin-bottom:4pt"><span style="background:#9f1239;color:#fff;padding:1pt 5pt;border-radius:3pt;font-size:8pt;font-weight:800">TEST ${sanitize(String(s.num))}</span> <b>${sanitize(s.type)}</b> — ${sanitize(s.description)}</div>`).join('') : '—'}</td>`);
    out.push(`</tr></tbody></table>`);
  }
  if ((ev.notesAttendues || []).length) {
    out.push(rowBox('#e0f2fe', '#075985', '🎓 Notes attendues', ev.notesAttendues.map(n => n.label).join(' · ')));
  }

  // Étapes du projet
  if ((seq.seances || []).length) {
    out.push(`<div style="background:#f1f5f9;color:#1e293b;padding:4pt 10pt;font-size:10pt;font-weight:800;text-transform:uppercase;letter-spacing:1pt;border-radius:4pt;margin-bottom:4pt">Étapes du projet</div>`);
    seq.seances.forEach((se, idx) => {
      out.push(`<div style="border:1pt solid #cbd5e1;border-radius:4pt;padding:6pt 8pt;margin-bottom:4pt;font-size:10pt"><b>S${idx + 1} — ${sanitize(se.titre || 'Sans titre')}</b>${se.objectif ? `<br><span style="color:#475569">${sanitize(se.objectif)}</span>` : ''}</div>`);
    });
  }

  // Supports +
  if ((seq.supportsPlus || []).length) {
    out.push(`<div style="background:#ecfccb;color:#3f6212;padding:4pt 10pt;font-size:10pt;font-weight:800;text-transform:uppercase;letter-spacing:1pt;border-radius:4pt;margin:12pt 0 4pt">Supports en +</div>`);
    out.push(`<ol style="margin:0 0 12pt 18pt;padding:0;font-size:10pt">`);
    seq.supportsPlus.forEach(sp => {
      const tInfo = SUPPORT_TYPES.find(t => t.value === sp.type);
      out.push(`<li><b>${sanitize(sp.title || '')}</b>${sp.author ? ` — <i>${sanitize(sp.author)}</i>` : ''}${sp.url ? ` (${sanitize(sp.url)})` : ''}</li>`);
    });
    out.push(`</ol>`);
  }

  // Issues
  if ((seq.issues || []).length) {
    out.push(`<div style="background:#fef2f2;color:#7f1d1d;padding:4pt 10pt;font-size:10pt;font-weight:800;text-transform:uppercase;letter-spacing:1pt;border-radius:4pt;margin-bottom:4pt">Issues / Questions de réflexion</div>`);
    out.push(`<ul style="margin:0 0 12pt 18pt;padding:0;font-size:10pt">`);
    seq.issues.forEach(i => out.push(`<li>${sanitize(i.text)}</li>`));
    out.push(`</ul>`);
  }

  // Grilles d'évaluation
  if ((seq.grilles || []).length) {
    out.push(`<div style="page-break-before:always"><h2 style="font-family:Georgia,serif;font-size:16pt;margin:16pt 0 10pt;color:#1e293b;border-bottom:2pt solid #cbd5e1;padding-bottom:6pt">Grilles d'évaluation</h2>`);
    seq.grilles.forEach(g => {
      out.push(`<div style="margin-bottom:16pt;page-break-inside:avoid"><div style="display:flex;align-items:center;gap:8pt;margin-bottom:6pt"><span style="background:${g.type === 'cecrl' ? '#10b981' : '#3b82f6'};color:#fff;padding:2pt 7pt;border-radius:3pt;font-size:9pt;font-weight:800">${g.competence}</span> <b style="font-size:12pt">${sanitize(g.name)}</b> <span style="margin-left:auto;font-size:9pt;color:#64748b;font-weight:700">Total : /${g.totalPoints}</span></div>`);
      out.push(`<table style="width:100%;border-collapse:collapse"><thead><tr><th style="background:#f1f5f9;border:1pt solid #cbd5e1;padding:4pt;min-width:80pt"></th>`);
      g.cols.forEach((c, i) => {
        out.push(`<th style="background:#f1f5f9;border:1pt solid #cbd5e1;padding:4pt;font-size:9pt">${sanitize(c)}${g.colsPoints?.[i] != null ? `<br><span style="font-size:8pt;color:#64748b">/${g.colsPoints[i]}</span>` : ''}</th>`);
      });
      out.push(`</tr></thead><tbody>`);
      g.rows.forEach((r, rIdx) => {
        out.push(`<tr><th style="background:#f8fafc;border:1pt solid #cbd5e1;padding:4pt">${g.type === 'cecrl' ? `<span style="background:#6c63ff;color:#fff;padding:1pt 5pt;border-radius:3pt;font-weight:800;font-size:9pt">${sanitize(r)}</span>` : `<span style="font-weight:700;font-size:9pt">${sanitize(r)}</span>`}${g.rowsPoints?.[rIdx] != null ? `<br><span style="font-size:8pt;color:#64748b;margin-top:2pt">/${g.rowsPoints[rIdx]}</span>` : ''}</th>`);
        g.cols.forEach((c, cIdx) => {
          const cell = g.cells?.[`${rIdx}_${cIdx}`] || {};
          out.push(`<td style="border:1pt solid #cbd5e1;padding:4pt;font-size:8.5pt;vertical-align:top">${sanitize(cell.text || '')}${cell.points ? `<br><span style="font-size:8pt;color:#64748b;font-weight:700">${sanitize(String(cell.points))}</span>` : ''}</td>`);
        });
        out.push(`</tr>`);
      });
      out.push(`</tbody></table></div>`);
    });
    out.push(`</div>`);
  }

  return out.join('');
};

export const exportPDF = () => {
  window.print();
};

export const exportWord = (seq) => {
  const body = buildHtml(seq);
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;color:#1e293b;margin:2cm">${body}</body></html>`;
  const blob = new Blob([html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(seq.titre || 'sequence').replace(/[^a-z0-9-_]+/gi, '_')}.doc`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportShareHtml = (seq) => {
  const body = buildHtml(seq);
  const title = seq.titre || 'Séquence sans titre';
  const safeTitle = String(title).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  // Encode la séquence en base64 UTF-8 — sera transmise via le fragment d'URL (#)
  // au moment de l'import, ce qui évite toute limite de taille côté serveur et
  // garde les données strictement côté client.
  const seqJson = JSON.stringify(seq);
  const seqB64 = btoa(unescape(encodeURIComponent(seqJson)));
  const appOrigin = window.location.origin;
  const safeOrigin = String(appOrigin).replace(/[<>"]/g, c => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const html = `<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${safeTitle} — Séquence Lesson Loom</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b;
    background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
    line-height: 1.55;
    min-height: 100vh;
  }
  .share-wrap { max-width: 900px; margin: 0 auto; padding: 40px 24px 80px; }
  .share-banner {
    display: flex; align-items: center; gap: 10px;
    background: #0f172a; color: #f1f5f9;
    padding: 10px 18px; border-radius: 14px;
    font-size: 12px; font-weight: 700;
    box-shadow: 0 6px 22px rgba(15, 23, 42, .15);
    margin-bottom: 24px;
  }
  .share-banner b { color: #a7f3d0; }
  .share-banner .ico { font-size: 16px; }
  .share-banner .meta { margin-left: auto; font-weight: 500; opacity: .75; }
  .share-card {
    background: #fff; padding: 36px 44px; border-radius: 18px;
    box-shadow: 0 10px 40px rgba(15, 23, 42, .08), 0 2px 6px rgba(15, 23, 42, .04);
  }
  .share-actions { margin-top: 22px; display: flex; gap: 10px; flex-wrap: wrap; }
  .share-btn {
    display: inline-flex; align-items: center; gap: 6px;
    background: #6c63ff; color: #fff; border: none;
    padding: 10px 18px; border-radius: 999px;
    font-family: inherit; font-size: 13px; font-weight: 700;
    cursor: pointer; box-shadow: 0 4px 14px rgba(108, 99, 255, .35);
    transition: transform .15s ease, box-shadow .15s ease;
    text-decoration: none;
  }
  .share-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(108, 99, 255, .45); }
  .share-btn.primary-import {
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 4px 14px rgba(16, 185, 129, .35);
  }
  .share-btn.primary-import:hover { box-shadow: 0 6px 18px rgba(16, 185, 129, .5); }
  .share-btn.secondary { background: #fff; color: #475569; border: 1px solid #cbd5e1; box-shadow: none; }
  .share-btn.secondary:hover { background: #f1f5f9; }
  .share-footer { margin-top: 28px; text-align: center; color: #64748b; font-size: 12px; }
  .share-footer a { color: #4338ca; text-decoration: none; font-weight: 700; }
  .import-hint {
    margin-top: 14px; padding: 12px 16px; border-radius: 10px;
    background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534;
    font-size: 12.5px; line-height: 1.5;
  }
  .import-hint b { color: #14532d; }
  @media print {
    body { background: #fff; }
    .share-wrap { max-width: none; padding: 0; }
    .share-banner, .share-actions, .share-footer, .import-hint { display: none !important; }
    .share-card { box-shadow: none; padding: 0; border-radius: 0; }
  }
  @media (max-width: 600px) {
    .share-card { padding: 24px 18px; border-radius: 14px; }
    .share-wrap { padding: 18px 12px 60px; }
  }
</style>
</head><body>
  <div class="share-wrap">
    <div class="share-banner">
      <span class="ico">🪄</span>
      <span>Séquence partagée depuis <b>Lesson Loom</b></span>
      <span class="meta">Reçue le ${dateStr}</span>
    </div>
    <main class="share-card">${body}</main>
    <div class="share-actions">
      <button class="share-btn primary-import" id="ll-import-btn" type="button">📥 Importer dans mon Lesson Loom</button>
      <button class="share-btn secondary" id="ll-copy-btn" type="button">📋 Copier la séquence</button>
      <button class="share-btn secondary" onclick="window.print()">🖨️ Imprimer / PDF</button>
    </div>
    <div class="import-hint">
      <b>Comment ça marche&nbsp;?</b> Cliquez sur <b>« Importer dans mon Lesson Loom »</b> : l'application s'ouvrira et vous demandera de confirmer l'ajout de cette séquence à vos propres séquences. Si vous n'avez pas encore Lesson Loom, le bouton vous y emmène — vos données restent privées sur votre appareil.
    </div>
    <div class="share-footer">
      Document autonome — fonctionne hors-ligne. Créé avec <a href="${safeOrigin}" target="_blank" rel="noopener">Lesson Loom</a>, l'outil de séquences pédagogiques pour profs d'anglais lycée.
    </div>
  </div>
<script>
  (function () {
    var SEQ_B64 = ${JSON.stringify(seqB64)};
    var APP_URL = ${JSON.stringify(appOrigin)};
    var btnImport = document.getElementById('ll-import-btn');
    var btnCopy = document.getElementById('ll-copy-btn');
    btnImport && btnImport.addEventListener('click', function () {
      try {
        // Le fragment d'URL (#) reste côté client et accepte des grosses charges.
        var target = APP_URL + '/#import=' + encodeURIComponent(SEQ_B64);
        window.open(target, '_blank', 'noopener');
      } catch (e) {
        alert('Impossible d\\'ouvrir Lesson Loom. Utilisez plutôt le bouton « Copier la séquence ».');
      }
    });
    btnCopy && btnCopy.addEventListener('click', async function () {
      try {
        var json = decodeURIComponent(escape(atob(SEQ_B64)));
        await navigator.clipboard.writeText(json);
        var prev = btnCopy.textContent;
        btnCopy.textContent = '✅ Copié !';
        setTimeout(function () { btnCopy.textContent = prev; }, 1800);
      } catch (e) {
        alert('Copie impossible. Astuce : sélectionnez le texte ci-dessus puis Ctrl+C.');
      }
    });
  })();
${'</' + 'script>'}
</body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sequence-${(seq.titre || 'sans-titre').replace(/[^a-z0-9-_]+/gi, '_').toLowerCase()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

export const exportMarkdown = (seq) => {
  const lines = [];
  const mode = seq.nomenclatureMode || 'cecrl';
  const lvl = (seq.niveau || '').replace(/_/g, ' ') + (seq.lv && /Seconde|Première|Terminale/.test(seq.niveau) && !seq.niveau.includes('_') ? ' · ' + seq.lv : '');
  lines.push(`# ${seq.titre || 'Sans titre'}`);
  lines.push('');
  lines.push(`**Niveau :** ${lvl} ${seq.numero ? `· **Séquence n°${seq.numero}**` : ''} ${seq.nbSeances ? `· ${seq.nbSeances}` : ''}`);
  if (seq.annee) lines.push(`**Année :** ${seq.annee}`);
  if (seq.sousTitre) lines.push(`**Thème :** ${seq.sousTitre}`);
  if (seq.axe) lines.push(`**Axe majeur :** ${seq.axe}`);
  if (seq.axeMineur) lines.push(`**Axe mineur :** ${seq.axeMineur}`);
  if (seq.objectifCulturel) { lines.push(''); lines.push(`> 🎯 ${seq.objectifCulturel}`); }
  if (seq.problematique) { lines.push(''); lines.push(`> ❓ ${seq.problematique}`); }
  if (seq.descripteurCible) { lines.push(''); lines.push(`**🎯 Descripteur CECRL cible :**`); lines.push(`> « ${seq.descripteurCible} »`); }
  if ((seq.tags?.task || []).length) {
    lines.push('');
    lines.push('## 🎯 Tâche finale');
    seq.tags.task.forEach(t => lines.push(`- ${t.text}`));
  }
  if ((seq.tags?.inter || []).length) {
    lines.push('');
    lines.push('## 🏷️ Tâches intermédiaires');
    seq.tags.inter.forEach(t => lines.push(`- ${t.text}`));
  }

  // Activités langagières
  lines.push('');
  lines.push('## 🗣️ Activités langagières');
  if (mode === 'fr') {
    const items = ACTIVITES_FR.filter(a => {
      const d = seq.activitesFR?.[a.code];
      return d && (d.niveauCible || d.strategies || d.supports);
    });
    if (items.length) {
      lines.push('');
      lines.push('| Activité | Cible | Stratégies | Supports |');
      lines.push('|---|---|---|---|');
      items.forEach(a => {
        const d = seq.activitesFR[a.code];
        lines.push(`| **${a.code}** | ${d.niveauCible || '—'} | ${(d.strategies || '—').replace(/\n/g, ' / ')} | ${(d.supports || '—').replace(/\n/g, ' / ')} |`);
      });
    }
  } else {
    const filled = COMPETENCES.filter(c => (seq.tags?.['comp_' + c.code.toLowerCase()] || []).length > 0);
    filled.forEach(c => {
      lines.push('');
      lines.push(`### ${c.code} — ${c.label}`);
      seq.tags['comp_' + c.code.toLowerCase()].forEach(t => lines.push(`- ${t.level ? '`' + t.level + '` ' : ''}${t.text}`));
    });
  }

  // Composantes
  const lex = (seq.tags?.lexique || []).map(t => t.text);
  const gram = (seq.tags?.grammar || []).map(t => t.text);
  const phono = (seq.tags?.phono || []).map(t => t.text);
  const prag = (seq.tags?.pragma || []).map(t => `${t.level ? `(${t.level}) ` : ''}${t.text}`);
  if (lex.length || gram.length || phono.length) {
    lines.push('');
    lines.push('## 📚 Composante linguistique');
    if (lex.length) lines.push(`- **Lexique :** ${lex.join(' · ')}`);
    if (phono.length) lines.push(`- **Phonologie :** ${phono.join(' · ')}`);
    if (gram.length) lines.push(`- **Grammaire :** ${gram.join(' · ')}`);
  }
  if (prag.length) { lines.push(''); lines.push('## 💬 Pragmatique'); prag.forEach(p => lines.push(`- ${p}`)); }
  if (seq.sociolinguistique) { lines.push(''); lines.push('## 🤝 Sociolinguistique'); lines.push(seq.sociolinguistique); }
  if (seq.culturelLong) { lines.push(''); lines.push('## 🌍 Culturelle'); lines.push(seq.culturelLong); }
  if (seq.tice) { lines.push(''); lines.push('## 💻 TICE'); lines.push(seq.tice); }

  // Évaluations
  const ev = seq.evaluations || {};
  if ((ev.formatives || []).length || (ev.sommatives || []).length) {
    lines.push('');
    lines.push('## ✅ Évaluations');
    if ((ev.formatives || []).length) {
      lines.push('');
      lines.push('### Formatives');
      ev.formatives.forEach(f => lines.push(`- ${f.text}`));
    }
    if ((ev.sommatives || []).length) {
      lines.push('');
      lines.push('### Sommatives');
      ev.sommatives.forEach(s => lines.push(`- **TEST ${s.num}** \`${s.type}\` — ${s.description}${s.date ? ` (📅 ${s.date})` : ''}`));
    }
    if ((ev.notesAttendues || []).length) {
      lines.push('');
      lines.push('### 🎓 Notes attendues');
      ev.notesAttendues.forEach(n => lines.push(`- ${n.label}`));
    }
  }

  // Séances
  if ((seq.seances || []).length) {
    lines.push('');
    lines.push('## 📅 Étapes du projet');
    seq.seances.forEach((s, i) => {
      lines.push('');
      lines.push(`### S${i + 1} — ${s.titre || 'Sans titre'}`);
      if (s.objectif) lines.push(`> ${s.objectif}`);
    });
  }

  // Supports +
  if ((seq.supportsPlus || []).length) {
    lines.push('');
    lines.push('## 📎 Supports en +');
    seq.supportsPlus.forEach(sp => {
      lines.push(`- **${sp.title}**${sp.author ? ` — *${sp.author}*` : ''}${sp.url ? ` ([lien](${sp.url}))` : ''}`);
    });
  }

  // Issues
  if ((seq.issues || []).length) {
    lines.push('');
    lines.push('## 💭 Issues / Questions de réflexion');
    seq.issues.forEach(i => lines.push(`- ${i.text}`));
  }

  // Grilles
  if ((seq.grilles || []).length) {
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('# Grilles d\'évaluation');
    seq.grilles.forEach(g => {
      lines.push('');
      lines.push(`## ${g.name} (${g.competence}, /${g.totalPoints} pts)`);
      lines.push('');
      const headerCells = ['', ...g.cols.map((c, i) => `${c}${g.colsPoints?.[i] != null ? ` /${g.colsPoints[i]}` : ''}`)];
      lines.push('| ' + headerCells.join(' | ') + ' |');
      lines.push('|' + headerCells.map(() => '---').join('|') + '|');
      g.rows.forEach((r, rIdx) => {
        const rowLabel = `${r}${g.rowsPoints?.[rIdx] != null ? ` /${g.rowsPoints[rIdx]}` : ''}`;
        const cells = [rowLabel, ...g.cols.map((c, cIdx) => {
          const cell = g.cells?.[`${rIdx}_${cIdx}`] || {};
          return `${(cell.text || '').replace(/\|/g, '\\|').replace(/\n/g, ' ')}${cell.points ? ` (${cell.points})` : ''}`;
        })];
        lines.push('| ' + cells.join(' | ') + ' |');
      });
    });
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(seq.titre || 'sequence').replace(/[^a-z0-9-_]+/gi, '_')}.md`;
  a.click();
  URL.revokeObjectURL(url);
};
