// Utilitaire d'impression d'une grille — extrait de GrilleEditor pour pouvoir
// être réutilisé depuis la Bibliothèque (impression rapide sans ouvrir l'éditeur).
// Construction sécurisée du DOM via createElement / textContent → zéro injection.

const PRINT_LAYOUTS = {
  '1_portrait':  { cols: 1, gap: '0',   pad: '14pt', h1: '20pt', h2: '10pt', cell: '9.5pt', cellPad: '6pt 8pt', pts: '8pt' },
  '1_landscape': { cols: 1, gap: '0',   pad: '14pt', h1: '20pt', h2: '10pt', cell: '9.5pt', cellPad: '6pt 8pt', pts: '8pt' },
  '2_portrait':  { cols: 1, gap: '6pt', pad: '10pt', h1: '13pt', h2: '8pt',  cell: '7pt',   cellPad: '3pt 4pt', pts: '6pt' },
  '2_landscape': { cols: 2, gap: '6pt', pad: '10pt', h1: '13pt', h2: '8pt',  cell: '7pt',   cellPad: '3pt 4pt', pts: '6pt' },
  '4_portrait':  { cols: 2, gap: '5pt', pad: '7pt',  h1: '10pt', h2: '7pt',  cell: '5.5pt', cellPad: '2pt 3pt', pts: '5pt' },
  '4_landscape': { cols: 2, gap: '5pt', pad: '7pt',  h1: '10pt', h2: '7pt',  cell: '5.5pt', cellPad: '2pt 3pt', pts: '5pt' },
  '6_portrait':  { cols: 2, gap: '4pt', pad: '5pt',  h1: '8.5pt', h2: '6pt', cell: '4.5pt', cellPad: '1.5pt 2pt', pts: '4pt' },
  '6_landscape': { cols: 3, gap: '4pt', pad: '5pt',  h1: '8.5pt', h2: '6pt', cell: '4.5pt', cellPad: '1.5pt 2pt', pts: '4pt' },
};

export const openPrintGrille = (g, { perPage = 1, orientation = 'portrait', profName = '' } = {}) => {
  if (!g) return;
  const w = window.open('', '_blank');
  if (!w) return;

  const layout = PRINT_LAYOUTS[`${perPage}_${orientation}`] || PRINT_LAYOUTS['1_portrait'];

  const doc = w.document;
  doc.open(); doc.close();
  doc.documentElement.lang = 'fr';

  const head = doc.head;
  const meta = doc.createElement('meta');
  meta.setAttribute('charset', 'utf-8');
  head.appendChild(meta);
  const title = doc.createElement('title');
  title.textContent = (g.name || 'Grille') + (perPage > 1 ? ` ×${perPage}` : '');
  head.appendChild(title);

  const style = doc.createElement('style');
  style.textContent = `
    @page { size: A4 ${orientation}; margin: 6mm; }
    @media print { html, body { margin: 0; padding: 0; } }
    html, body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; color:#1e293b; margin: 0; padding: 0; }
    .sheet {
      display: grid;
      grid-template-columns: repeat(${layout.cols}, 1fr);
      gap: ${layout.gap};
      padding: ${layout.pad};
      box-sizing: border-box;
      width: 100vw;
      align-content: start;
    }
    .grille {
      display: flex; flex-direction: column;
      break-inside: avoid; page-break-inside: avoid;
      overflow: hidden;
      border: ${perPage > 1 ? '0.4pt dashed #cbd5e1' : 'none'};
      padding: ${perPage > 1 ? '4pt' : '0'};
      border-radius: ${perPage > 1 ? '3pt' : '0'};
    }
    .grille h1 { font-family: 'Playfair Display', Georgia, serif; font-size: ${layout.h1}; margin: 0 0 2pt; line-height: 1.1; }
    .grille h2 { font-size: ${layout.h2}; color: #64748b; margin: 0 0 4pt; font-weight: 600; }
    .grille table { width: 100%; border-collapse: collapse; table-layout: auto; }
    .grille th, .grille td { border: 0.4pt solid #94a3b8; padding: ${layout.cellPad}; vertical-align: top; font-size: ${layout.cell}; line-height: 1.25; word-wrap: break-word; }
    .grille th { background: #f1f5f9; font-weight: 700; color: #1e293b; }
    .grille .lvl { background: #6c63ff; color: #fff; padding: 1pt 4pt; border-radius: 3pt; font-weight: 700; font-size: ${layout.cell}; }
    .grille .pts { color: #64748b; font-size: ${layout.pts}; font-weight: 600; }
    .grille .total { margin-top: 3pt; text-align: right; font-size: ${layout.h2}; font-weight: 700; }
    .grille .prof-foot { margin-top: 4pt; font-size: ${layout.pts}; color: #94a3b8; text-align: right; font-style: italic; }
  `;
  head.appendChild(style);

  const appendPointsBreak = (parent, prefix, pts) => {
    if (pts == null || pts === '') return;
    parent.appendChild(doc.createElement('br'));
    const span = doc.createElement('span');
    span.className = 'pts';
    span.textContent = `${prefix}${pts}`;
    parent.appendChild(span);
  };

  const buildOne = () => {
    const wrap = doc.createElement('div');
    wrap.className = 'grille';

    const h1 = doc.createElement('h1');
    h1.textContent = g.name || 'Grille';
    wrap.appendChild(h1);

    const h2 = doc.createElement('h2');
    h2.textContent = `${g.competence || ''}${g.totalPoints ? ' · /' + g.totalPoints : ''}`;
    wrap.appendChild(h2);

    const table = doc.createElement('table');
    const thead = doc.createElement('thead');
    const headRow = doc.createElement('tr');
    headRow.appendChild(doc.createElement('th'));
    (g.cols || []).forEach((col, i) => {
      const th = doc.createElement('th');
      th.textContent = col || '';
      appendPointsBreak(th, '/', g.colsPoints?.[i]);
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = doc.createElement('tbody');
    (g.rows || []).forEach((rowLabel, rIdx) => {
      const tr = doc.createElement('tr');
      const th = doc.createElement('th');
      const lvl = doc.createElement('span');
      lvl.className = 'lvl';
      lvl.textContent = rowLabel || '';
      th.appendChild(lvl);
      appendPointsBreak(th, '/', g.rowsPoints?.[rIdx]);
      tr.appendChild(th);
      (g.cols || []).forEach((_, cIdx) => {
        const td = doc.createElement('td');
        const cell = g.cells?.[`${rIdx}_${cIdx}`] || {};
        td.textContent = cell.text || '';
        appendPointsBreak(td, '', cell.points != null && cell.points !== '' ? `${cell.points} pt(s)` : '');
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);

    if (perPage === 1) {
      const total = doc.createElement('div');
      total.className = 'total';
      total.textContent = `TOTAL : /${g.totalPoints ?? ''}`;
      wrap.appendChild(total);
      if (profName) {
        const pf = doc.createElement('div');
        pf.className = 'prof-foot';
        pf.textContent = '· ' + profName;
        wrap.appendChild(pf);
      }
    }
    return wrap;
  };

  const sheet = doc.createElement('div');
  sheet.className = 'sheet';
  for (let i = 0; i < perPage; i++) sheet.appendChild(buildOne());
  doc.body.appendChild(sheet);

  setTimeout(() => {
    try { w.focus(); w.print(); } catch (e) { console.warn('[Grille] Impression interrompue :', e); }
  }, 300);
};
