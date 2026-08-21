// Export HTML lisible de TOUTES les séquences en un seul document.
// Complémentaire de l'export JSON qui sert de sauvegarde technique.

import { COMPETENCES } from '../data/sequenceurData';
import { ACTIVITES_FR } from '../data/sequenceurData2';

const esc = (s = '') => String(s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

const buildSequenceBlock = (seq, index) => {
  const mode = seq.nomenclatureMode || 'cecrl';
  const niveauTxt = seq.niveau === 'DNL'
    ? (seq.dnlDiscipline ? `DNL ${seq.dnlDiscipline}` : 'DNL')
    : (seq.niveau || '').replace(/_/g, ' ');
  const lvl = niveauTxt + (
    seq.niveau === 'DNL' && seq.dnlLevel
      ? ' · ' + seq.dnlLevel
      : (seq.lv && /Seconde|Première|Terminale/.test(seq.niveau) && !seq.niveau.includes('_') ? ' · ' + seq.lv : '')
  );
  const out = [];

  out.push(`<article class="seq" id="seq-${index}">`);
  out.push(`<header class="seq-head">`);
  out.push(`<div class="seq-meta">${esc(seq.annee || '')}</div>`);
  out.push(`<div class="seq-pill">${esc(lvl)}</div>`);
  out.push(`<h2 class="seq-title">${esc(seq.titre || 'Sans titre')}</h2>`);
  if (seq.sousTitre) out.push(`<div class="seq-sub">${esc(seq.sousTitre)}</div>`);
  if (seq.axe) out.push(`<div><b style="color:#4338ca">Axe majeur :</b> ${esc(seq.axe)}</div>`);
  if (seq.axeMineur) out.push(`<div><b style="color:#7c3aed">Axe mineur :</b> ${esc(seq.axeMineur)}</div>`);
  if (seq.objectifCulturel) out.push(`<div class="seq-box yellow">${esc(seq.objectifCulturel)}</div>`);
  if (seq.problematique) out.push(`<div class="seq-box quote">${esc(seq.problematique)}</div>`);
  if (seq.descripteurCible) out.push(`<div class="seq-box blue"><b>Descripteur CECRL :</b> « ${esc(seq.descripteurCible)} »</div>`);
  out.push(`</header>`);

  // Tâches
  if ((seq.tags?.task || []).length) {
    out.push(`<section><h3>Tâche finale</h3><ul>`);
    seq.tags.task.forEach(t => out.push(`<li>${esc(t.text)}</li>`));
    out.push(`</ul></section>`);
  }
  if ((seq.tags?.inter || []).length) {
    out.push(`<section><h3>Tâches intermédiaires</h3><ul>`);
    seq.tags.inter.forEach(t => out.push(`<li>${esc(t.text)}</li>`));
    out.push(`</ul></section>`);
  }

  // Activités langagières
  if (mode === 'fr') {
    const items = ACTIVITES_FR.filter(a => {
      const d = seq.activitesFR?.[a.code];
      return d && (d.niveauCible || d.strategies || d.supports);
    });
    if (items.length) {
      out.push(`<section><h3>Activités langagières</h3><table><thead><tr><th>Activité</th><th>Cible</th><th>Stratégies</th><th>Supports</th></tr></thead><tbody>`);
      items.forEach(a => {
        const d = seq.activitesFR[a.code];
        out.push(`<tr><td><b>${a.code}</b></td><td>${esc(d.niveauCible || '—')}</td><td>${esc(d.strategies || '—')}</td><td>${esc(d.supports || '—')}</td></tr>`);
      });
      out.push(`</tbody></table></section>`);
    }
  } else {
    const filled = COMPETENCES.filter(c => (seq.tags?.['comp_' + c.code.toLowerCase()] || []).length > 0);
    if (filled.length) {
      out.push(`<section><h3>Activités langagières CECRL</h3>`);
      filled.forEach(c => {
        out.push(`<div class="comp"><b>${c.code}</b> <span class="muted">${esc(c.label)}</span><ul>`);
        seq.tags['comp_' + c.code.toLowerCase()].forEach(t => {
          out.push(`<li>${t.level ? `<span class="lvl">${t.level}</span> ` : ''}${esc(t.text)}</li>`);
        });
        out.push(`</ul></div>`);
      });
      out.push(`</section>`);
    }
  }

  // Composantes
  const lex = (seq.tags?.lexique || []).map(t => esc(t.text));
  const gram = (seq.tags?.grammar || []).map(t => esc(t.text));
  const phono = (seq.tags?.phono || []).map(t => esc(t.text));
  const prag = (seq.tags?.pragma || []).map(t => `${t.level ? `(${t.level}) ` : ''}${esc(t.text)}`);
  if (lex.length || gram.length || phono.length || prag.length) {
    out.push(`<section><h3>Composantes</h3><ul>`);
    if (lex.length) out.push(`<li><b>Lexique :</b> ${lex.join(' · ')}</li>`);
    if (phono.length) out.push(`<li><b>Phonologie :</b> ${phono.join(' · ')}</li>`);
    if (gram.length) out.push(`<li><b>Grammaire :</b> ${gram.join(' · ')}</li>`);
    if (prag.length) out.push(`<li><b>Pragmatique :</b> ${prag.join(' · ')}</li>`);
    out.push(`</ul></section>`);
  }
  if (seq.sociolinguistique) out.push(`<section><h3>Sociolinguistique</h3><p>${esc(seq.sociolinguistique)}</p></section>`);
  if (seq.culturelLong) out.push(`<section><h3>Culturelle</h3><p>${esc(seq.culturelLong)}</p></section>`);
  if (seq.tice) out.push(`<section><h3>TICE</h3><p>${esc(seq.tice)}</p></section>`);

  // Évaluations
  const ev = seq.evaluations || {};
  if ((ev.formatives || []).length || (ev.sommatives || []).length) {
    out.push(`<section><h3>Évaluations</h3>`);
    if ((ev.formatives || []).length) {
      out.push(`<b>Formatives :</b><ul>`);
      ev.formatives.forEach(f => out.push(`<li>${esc(f.text)}</li>`));
      out.push(`</ul>`);
    }
    if ((ev.sommatives || []).length) {
      out.push(`<b>Sommatives :</b><ul>`);
      ev.sommatives.forEach(s => out.push(`<li><b>TEST ${esc(String(s.num))}</b> [${esc(s.type)}] — ${esc(s.description)}${s.date ? ` (${esc(s.date)})` : ''}</li>`));
      out.push(`</ul>`);
    }
    out.push(`</section>`);
  }

  // Séances
  if ((seq.seances || []).length) {
    out.push(`<section><h3>Étapes du projet</h3><ol>`);
    seq.seances.forEach((s) => {
      out.push(`<li><b>${esc(s.titre || 'Sans titre')}</b>${s.objectif ? `<br><span class="muted">${esc(s.objectif)}</span>` : ''}</li>`);
    });
    out.push(`</ol></section>`);
  }

  // Supports en +
  if ((seq.supportsPlus || []).length) {
    out.push(`<section><h3>Supports en +</h3><ul>`);
    seq.supportsPlus.forEach(sp => {
      out.push(`<li><b>${esc(sp.title || '')}</b>${sp.author ? ` — ${esc(sp.author)}` : ''}${sp.url ? ` (${esc(sp.url)})` : ''}</li>`);
    });
    out.push(`</ul></section>`);
  }

  // Issues
  if ((seq.issues || []).length) {
    out.push(`<section><h3>Issues / questions de réflexion</h3><ul>`);
    seq.issues.forEach(i => out.push(`<li>${esc(i.text)}</li>`));
    out.push(`</ul></section>`);
  }

  out.push(`</article>`);
  return out.join('');
};

export const exportAllDataAsHtml = (data) => {
  const sequences = data.sequences || [];
  const progressions = data.progressions || [];
  const calEvents = data.calendar?.events || [];

  const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  const toc = sequences.map((s, i) => `<li><a href="#seq-${i}">${esc(s.titre || 'Sans titre')}</a> <span class="muted">— ${esc((s.niveau || '').replace(/_/g, ' '))}</span></li>`).join('');

  const html = `<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="utf-8">
<title>Sauvegarde Lesson Loom — ${dateStr}</title>
<style>
  *,*::before,*::after { box-sizing: border-box; }
  body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.55; color: #1e293b; max-width: 880px; margin: 40px auto; padding: 0 24px; background: #f8fafc; }
  h1 { font-family: Georgia, 'Times New Roman', serif; font-size: 32px; margin: 0 0 8px; color: #0f172a; }
  h2.seq-title { font-family: Georgia, serif; font-size: 24px; margin: 8px 0; color: #0f172a; }
  h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 1.2px; color: #475569; margin: 18px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }
  .muted { color: #64748b; font-size: 0.9em; }
  .summary { background: #fff; padding: 18px 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.06); margin-bottom: 24px; }
  .summary .stats { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 10px; }
  .stat { background: #6c63ff; color: #fff; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 700; }
  .toc { background: #fff; padding: 18px 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.06); margin-bottom: 24px; }
  .toc ol { margin: 0; padding-left: 22px; }
  .toc a { color: #4338ca; text-decoration: none; font-weight: 600; }
  .toc a:hover { text-decoration: underline; }
  article.seq { background: #fff; padding: 28px 32px; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.06); margin-bottom: 28px; page-break-after: always; }
  .seq-head { border-bottom: 2px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 14px; }
  .seq-meta { color: #64748b; font-size: 12px; font-weight: 600; }
  .seq-pill { display: inline-block; background: #1e3a5f; color: #fff; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; }
  .seq-sub { color: #475569; font-style: italic; font-size: 14px; margin-bottom: 8px; }
  .seq-box { padding: 10px 14px; border-radius: 6px; margin: 8px 0; font-size: 14px; }
  .seq-box.yellow { background: #fef9c3; border: 1px solid #fde047; color: #713f12; }
  .seq-box.blue { background: #dbeafe; border: 1px solid #93c5fd; color: #1e40af; }
  .seq-box.quote { background: #f8fafc; border-left: 4px solid #6c63ff; border-right: 4px solid #6c63ff; font-style: italic; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 13px; }
  th, td { border: 1px solid #cbd5e1; padding: 7px 9px; text-align: left; vertical-align: top; }
  th { background: #f1f5f9; font-weight: 700; }
  .comp { margin-bottom: 8px; }
  .lvl { background: #6c63ff; color: #fff; padding: 1px 6px; border-radius: 3px; font-size: 11px; font-weight: 700; }
  ul, ol { margin: 6px 0; padding-left: 22px; }
  li { margin-bottom: 4px; }
  @media print {
    body { background: #fff; max-width: none; margin: 0; padding: 16mm; }
    article.seq { box-shadow: none; border: 1px solid #cbd5e1; }
    .toc, .summary { box-shadow: none; border: 1px solid #cbd5e1; }
  }
</style>
</head><body>
  <header class="summary">
    <h1>📚 Sauvegarde Lesson Loom</h1>
    <div class="muted">Document généré le ${dateStr}</div>
    <div class="stats">
      <span class="stat">${sequences.length} séquence${sequences.length > 1 ? 's' : ''}</span>
      <span class="stat">${progressions.length} progression${progressions.length > 1 ? 's' : ''}</span>
      <span class="stat">${calEvents.length} événement${calEvents.length > 1 ? 's' : ''} au calendrier</span>
    </div>
  </header>

  ${sequences.length > 0 ? `<nav class="toc">
    <h3 style="margin-top:0">Sommaire</h3>
    <ol>${toc}</ol>
  </nav>` : '<p class="muted">Aucune séquence à afficher pour le moment.</p>'}

  ${sequences.map((s, i) => buildSequenceBlock(s, i)).join('\n')}

  ${progressions.length > 0 ? `<article class="seq">
    <h2 class="seq-title">Progressions enregistrées</h2>
    <ul>${progressions.map(p => `<li><b>${esc(p.titre || p.name || 'Sans titre')}</b>${p.sequenceIds ? ` <span class="muted">(${p.sequenceIds.length} séquences)</span>` : ''}</li>`).join('')}</ul>
  </article>` : ''}
</body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lesson-loom-sauvegarde-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};
