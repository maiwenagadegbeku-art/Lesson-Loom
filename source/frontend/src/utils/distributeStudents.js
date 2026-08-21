// Distribution multi-élèves : parse un CSV de noms d'élèves et génère
// un fichier HTML autonome contenant N copies d'une grille (une par élève),
// avec calcul automatique du score+bonus → note/20, et possibilité pour le
// prof de télécharger la grille remplie de chaque élève individuellement.

/**
 * Parse un CSV souple : détecte automatiquement les colonnes (nom, prenom, classe).
 * Accepte aussi un fichier brut avec un nom complet par ligne.
 * Retourne [{ name, classe? }, ...].
 */
export const parseCsvStudents = (raw) => {
  if (!raw || !raw.trim()) return [];
  const lines = raw.replace(/^\uFEFF/, '').split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return [];

  // Détecte le séparateur principal (virgule, point-virgule ou tabulation)
  const firstLine = lines[0];
  let sep = ',';
  if (firstLine.includes(';') && (firstLine.match(/;/g) || []).length >= (firstLine.match(/,/g) || []).length) sep = ';';
  else if (firstLine.includes('\t')) sep = '\t';

  // Détecte si la 1ère ligne est un header
  const lower = firstLine.toLowerCase();
  const hasHeader = /(\bnom\b|\bprenom\b|\bprénom\b|\bclasse\b|\bélève\b|\beleve\b|\bstudent\b|\bname\b)/i.test(lower);

  let cols = [];
  let dataLines = lines;
  if (hasHeader) {
    cols = firstLine.split(sep).map(c => c.trim().toLowerCase().replace(/['"]/g, ''));
    dataLines = lines.slice(1);
  }

  const idxOf = (...keys) => {
    for (const k of keys) {
      const i = cols.findIndex(c => c === k || c.includes(k));
      if (i >= 0) return i;
    }
    return -1;
  };

  const nomIdx = hasHeader ? idxOf('nom', 'name', 'eleve', 'élève', 'student') : -1;
  const prenomIdx = hasHeader ? idxOf('prenom', 'prénom', 'firstname', 'first') : -1;
  const classeIdx = hasHeader ? idxOf('classe', 'class', 'groupe') : -1;

  const students = [];
  for (const line of dataLines) {
    const parts = line.split(sep).map(s => s.trim().replace(/^"|"$/g, ''));
    let name = '';
    let classe = '';
    if (hasHeader && nomIdx >= 0) {
      const nom = parts[nomIdx] || '';
      const prenom = prenomIdx >= 0 ? (parts[prenomIdx] || '') : '';
      name = [prenom, nom].filter(Boolean).join(' ').trim();
      classe = classeIdx >= 0 ? (parts[classeIdx] || '') : '';
    } else if (parts.length >= 2 && !hasHeader) {
      // pas de header : on suppose [nom, prenom?, classe?]
      name = parts.slice(0, 2).filter(Boolean).join(' ').trim();
      if (parts.length >= 3) classe = parts[2];
    } else {
      // 1 colonne : tout le contenu = nom complet
      name = parts.join(' ').trim();
    }
    if (name) students.push({ name, classe: classe || '' });
  }
  return students;
};

// Échappe pour insertion sécurisée dans un attribut HTML
const escAttr = (s) => String(s || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Échappe pour insertion dans une chaîne JS littérale entre apostrophes simples
const escJs = (s) => String(s || '')
  .replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r')
  .replace(/<\//g, '<\\/');

// Garde le </script> hors-piège (cf. critical info handoff)
const escScriptEnd = (s) => String(s || '').split('</script>').join('<\\/script>');

/**
 * Génère un fichier HTML autonome (vanilla JS) contenant N grilles éditables,
 * une par élève. Calcul auto du score + bonus → note/20.
 * Bouton "Télécharger" par élève → mini-HTML pour cet élève uniquement.
 */
export const generateDistributionHtml = (grille, students, sequenceTitle = '', profName = '') => {
  const safeGrille = JSON.parse(JSON.stringify(grille || {}));
  const safeStudents = (students || []).map(s => ({ name: String(s.name || '').slice(0, 120), classe: String(s.classe || '').slice(0, 60) }));
  const grilleJsonForJs = escScriptEnd(JSON.stringify(safeGrille));
  const studentsJsonForJs = escScriptEnd(JSON.stringify(safeStudents));

  const title = `${safeGrille.name || 'Grille'} — Distribution ${safeStudents.length} élève(s)`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escAttr(title)}</title>
<script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"></script>
<style>
  :root { --primary:#6c63ff; --accent:#f59e0b; --bg:#f8fafc; --card:#fff; --border:#e2e8f0; --text:#1e293b; --muted:#64748b; }
  * { box-sizing: border-box; }
  html, body { margin:0; padding:0; font-family:'Plus Jakarta Sans', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background:var(--bg); color:var(--text); }
  .page { max-width: 1100px; margin: 0 auto; padding: 24px 20px 80px; }
  header.top { display:flex; flex-direction:column; gap:6px; padding-bottom:18px; border-bottom: 2px solid var(--primary); margin-bottom: 22px; }
  header.top h1 { font-family:'Playfair Display', Georgia, serif; font-size: 28px; margin: 0; color: var(--primary); }
  header.top .sub { color: var(--muted); font-size: 13px; }
  header.top .meta { display:flex; gap:14px; flex-wrap:wrap; margin-top:4px; font-size: 12px; color: var(--muted); }
  header.top .meta b { color: var(--text); }
  .toolbar { position: sticky; top: 0; z-index: 50; background: rgba(248,250,252,0.95); backdrop-filter: blur(8px); padding: 10px 0; margin: 0 -4px 16px; display:flex; gap:8px; flex-wrap:wrap; align-items:center; border-bottom: 1px solid var(--border); }
  .btn { background: var(--primary); color: #fff; border: none; padding: 8px 14px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; display:inline-flex; align-items:center; gap:6px; }
  .btn:hover { filter: brightness(1.08); }
  .btn.ghost { background: #fff; color: var(--text); border: 1px solid var(--border); }
  .btn.amber { background: var(--accent); }
  .btn.green { background: #16a34a; }
  .pill { background: #ede9fe; color: #5b21b6; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
  .student-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 18px 20px; margin-bottom: 22px; box-shadow: 0 2px 6px rgba(0,0,0,0.04); }
  .student-card.collapsed .card-body { display: none; }
  .student-card .student-head { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap: 10px; margin-bottom: 12px; }
  .student-card h2 { font-family:'Playfair Display', Georgia, serif; font-size: 20px; margin: 0; color: var(--primary); }
  .student-card .student-classe { font-size: 12px; color: var(--muted); margin-left: 8px; }
  table.grille { width: 100%; border-collapse: collapse; margin-top: 8px; }
  table.grille th, table.grille td { border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: top; font-size: 11.5px; line-height: 1.4; }
  table.grille th { background: #f1f5f9; font-weight: 700; }
  table.grille thead th { text-align: center; }
  table.grille .lvl { background: var(--primary); color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px; display: inline-block; }
  table.grille .ref { display: block; margin-top: 3px; font-size: 10px; color: var(--muted); font-weight: 600; }
  table.grille td .desc { font-size: 11px; color: #334155; margin-bottom: 4px; max-height: 200px; overflow: auto; }
  table.grille td input.cell-pts { width: 100%; border: 1px solid var(--border); border-radius: 4px; padding: 4px 6px; font-size: 12px; font-weight: 700; text-align: center; color: var(--primary); background: #f8fafc; }
  table.grille td input.cell-pts:focus { outline: 2px solid var(--primary); background: white; }
  .bonus-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; padding: 10px 12px; background: linear-gradient(90deg, #ede9fe, #ddd6fe); border: 1px solid #8b5cf6; border-radius: 10px; margin-top: 12px; }
  .bonus-row label { font-weight: 700; color: #5b21b6; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  .bonus-row input[type=text] { flex: 1 1 200px; padding: 6px 10px; border: 1px solid #c4b5fd; border-radius: 6px; font-size: 12px; background: white; }
  .bonus-row select { padding: 6px 10px; border: 1px solid #c4b5fd; border-radius: 6px; font-size: 12px; font-weight: 700; background: white; }
  .score-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 12px 16px; background: linear-gradient(90deg, #fef3c7, #fde68a); border: 1px solid var(--accent); border-radius: 10px; margin-top: 10px; flex-wrap: wrap; }
  .score-row .info { font-size: 11px; color: #92400e; }
  .score-row .info b { color: #78350f; }
  .score-row .num { display: flex; gap: 16px; }
  .score-row .num > div { text-align: right; }
  .score-row .num .lbl { font-size: 10px; color: #92400e; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .score-row .num .val { font-size: 22px; font-weight: 800; color: #78350f; }
  .score-row .num .val.bonus-positive { color: #16a34a; }
  .actions { margin-top: 12px; display:flex; gap: 8px; flex-wrap: wrap; }
  .empty { text-align: center; padding: 40px; color: var(--muted); font-style: italic; }
  @media print {
    .toolbar, .actions, header.top .meta button { display: none !important; }
    .student-card { page-break-after: always; box-shadow: none; }
    body { background: white; }
  }
</style>
</head>
<body>
<div class="page">
  <header class="top">
    <h1>${escAttr(safeGrille.name || 'Grille')}</h1>
    <div class="sub">${safeGrille.competence ? 'Compétence ' + escAttr(safeGrille.competence) + ' · ' : ''}${sequenceTitle ? 'Séquence : ' + escAttr(sequenceTitle) : ''}</div>
    <div class="meta">
      <span class="pill" id="count-pill"></span>
      <span>Sur <b id="total-pts">${escAttr(safeGrille.totalPoints || '?')}</b> pts</span>
      <span>Bonus : 0–5 pts par paliers de 0.25</span>
    </div>
  </header>
  <div class="toolbar">
    <button class="btn ghost" onclick="window.print()" data-testid="print-all">🖨️ Tout imprimer</button>
    <button class="btn amber" onclick="downloadAllPdfZip()" data-testid="download-all-pdf-zip">📦 Télécharger toutes les notes en PDF (ZIP)</button>
    <button class="btn ghost" onclick="toggleAll(true)">📂 Tout déplier</button>
    <button class="btn ghost" onclick="toggleAll(false)">📁 Tout replier</button>
    <span style="flex:1"></span>
    <span style="font-size:11px; color:var(--muted);">💾 Notes sauvegardées localement.${profName ? ' · <b>' + escAttr(profName) + '</b>' : ''}</span>
  </div>
  <div id="students-list"></div>
</div>

<script>
(function(){
  var GRILLE = ${grilleJsonForJs};
  var STUDENTS = ${studentsJsonForJs};
  var STORAGE_KEY = 'distrib-' + (GRILLE.id || GRILLE.name || 'grille') + '-' + STUDENTS.length;

  // Charge l'état (notes saisies, bonus) depuis localStorage
  function loadState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(e){ return {}; }
  }
  function saveState(s) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch(e){}
  }
  var STATE = loadState();

  function parsePoints(raw) {
    if (raw == null || raw === '') return null;
    var m = String(raw).match(/\\d+(?:[.,]\\d+)?/g);
    if (!m) return null;
    var nums = m.map(function(x){ return parseFloat(x.replace(',', '.')); }).filter(function(n){ return !isNaN(n); });
    if (!nums.length) return null;
    return Math.max.apply(null, nums);
  }

  function computeScore(stIdx) {
    var s = STATE[stIdx] || {};
    var cells = s.cells || {};
    var sum = 0;
    Object.keys(cells).forEach(function(k){
      var p = parsePoints(cells[k]);
      if (p != null) sum += p;
    });
    var bonus = parseFloat(s.bonusPts || 0) || 0;
    var total = parseFloat(GRILLE.totalPoints || 0) || 0;
    var totalScore = sum + bonus;
    var note = total > 0 ? Math.round((totalScore / total) * 20 * 100) / 100 : null;
    return { sum: sum, bonus: bonus, totalScore: totalScore, total: total, note: note };
  }

  function refreshScore(stIdx) {
    var r = computeScore(stIdx);
    var card = document.getElementById('st-' + stIdx);
    if (!card) return;
    card.querySelector('[data-role=sum]').textContent = r.sum;
    card.querySelector('[data-role=bonus]').textContent = r.bonus;
    card.querySelector('[data-role=totalScore]').textContent = r.totalScore;
    card.querySelector('[data-role=total]').textContent = r.total;
    var noteEl = card.querySelector('[data-role=note]');
    noteEl.textContent = (r.note != null ? r.note : '—');
    noteEl.classList.toggle('bonus-positive', r.note != null && r.note > 20);
  }

  function onCellChange(stIdx, key, val) {
    STATE[stIdx] = STATE[stIdx] || {};
    STATE[stIdx].cells = STATE[stIdx].cells || {};
    STATE[stIdx].cells[key] = val;
    saveState(STATE);
    refreshScore(stIdx);
  }
  function onBonusChange(stIdx, field, val) {
    STATE[stIdx] = STATE[stIdx] || {};
    STATE[stIdx][field] = val;
    saveState(STATE);
    refreshScore(stIdx);
  }

  function buildTable(stIdx) {
    var rows = GRILLE.rows || [];
    var cols = GRILLE.cols || [];
    var rowsPoints = GRILLE.rowsPoints || [];
    var colsPoints = GRILLE.colsPoints || [];
    var cells = GRILLE.cells || {};
    var stateCells = (STATE[stIdx] && STATE[stIdx].cells) || {};

    var html = '<table class="grille"><thead><tr><th style="min-width:80px"></th>';
    cols.forEach(function(c, i){
      html += '<th>' + escapeHtml(c || '');
      if (colsPoints[i] != null && colsPoints[i] !== '') html += '<span class="ref">/' + escapeHtml(colsPoints[i]) + '</span>';
      html += '</th>';
    });
    html += '</tr></thead><tbody>';

    rows.forEach(function(r, rIdx){
      html += '<tr><th><span class="lvl">' + escapeHtml(r || '') + '</span>';
      if (rowsPoints[rIdx] != null && rowsPoints[rIdx] !== '') html += '<span class="ref">/' + escapeHtml(rowsPoints[rIdx]) + '</span>';
      html += '</th>';
      cols.forEach(function(_, cIdx){
        var key = rIdx + '_' + cIdx;
        var cell = cells[key] || {};
        var val = (stateCells[key] != null ? stateCells[key] : (cell.points || ''));
        html += '<td>';
        if (cell.text) html += '<div class="desc">' + escapeHtml(cell.text) + '</div>';
        html += '<input class="cell-pts" type="text" placeholder="pts" data-st="' + stIdx + '" data-key="' + key + '" value="' + escapeHtml(val) + '" />';
        html += '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  function escapeHtml(s){
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function renderStudent(student, stIdx) {
    var s = STATE[stIdx] || {};
    var bonus = parseFloat(s.bonusPts || 0) || 0;
    var bonusComment = s.bonusComment || '';
    var bonusOptions = '';
    for (var v = 0; v <= 5; v += 0.25) {
      var sel = Math.abs(v - bonus) < 0.001 ? ' selected' : '';
      bonusOptions += '<option value="' + v + '"' + sel + '>' + (v === 0 ? '— Aucun —' : '+' + v + ' pt' + (v > 1 ? 's' : '')) + '</option>';
    }

    return '<div class="student-card" id="st-' + stIdx + '" data-testid="student-card-' + stIdx + '">' +
      '<div class="student-head">' +
        '<div><h2>' + escapeHtml(student.name) + '</h2>' +
        (student.classe ? '<span class="student-classe">Classe : ' + escapeHtml(student.classe) + '</span>' : '') +
        '</div>' +
        '<div><button class="btn ghost" onclick="toggleCard(' + stIdx + ')">↕️ Replier</button></div>' +
      '</div>' +
      '<div class="card-body">' +
        buildTable(stIdx) +
        '<div class="bonus-row">' +
          '<label>✨ Bonus</label>' +
          '<input type="text" placeholder="Commentaire (ex : effort remarquable…)" value="' + escapeHtml(bonusComment) + '" data-st="' + stIdx + '" data-bonus="comment" />' +
          '<select data-st="' + stIdx + '" data-bonus="points">' + bonusOptions + '</select>' +
        '</div>' +
        '<div class="score-row" data-testid="score-row-' + stIdx + '">' +
          '<div class="info">Score brut <b data-role="sum">0</b>' +
            ' + bonus <b data-role="bonus">' + bonus + '</b>' +
            ' = <b data-role="totalScore">0</b> / <b data-role="total">' + (GRILLE.totalPoints || '?') + '</b></div>' +
          '<div class="num">' +
            '<div><div class="lbl">Note</div><div class="val" data-role="note" data-testid="note-' + stIdx + '">—</div></div>' +
          '</div>' +
        '</div>' +
        '<div class="actions">' +
          '<button class="btn green" onclick="downloadStudent(' + stIdx + ')" data-testid="download-' + stIdx + '">💾 Télécharger sa grille</button>' +
          '<button class="btn ghost" onclick="printStudent(' + stIdx + ')">🖨️ Imprimer</button>' +
          '<button class="btn ghost" onclick="resetStudent(' + stIdx + ')">↺ Effacer ses notes</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function render() {
    document.getElementById('count-pill').textContent = STUDENTS.length + ' élève' + (STUDENTS.length > 1 ? 's' : '');
    var html = '';
    if (STUDENTS.length === 0) {
      html = '<div class="empty">Aucun élève importé.</div>';
    } else {
      STUDENTS.forEach(function(st, i){ html += renderStudent(st, i); });
    }
    // SÉCURITÉ XSS : tout contenu dynamique (noms d'élèves, descripteurs, points saisis)
    // passe par escapeHtml() dans renderStudent/buildTable avant concaténation.
    // Le HTML restant est composé de templates statiques (class names, structure).
    // → safe à injecter via innerHTML.
    document.getElementById('students-list').innerHTML = html;
    STUDENTS.forEach(function(_, i){ refreshScore(i); });
  }

  // Délégation d'événements (input sur cellules + bonus)
  document.addEventListener('input', function(e){
    var t = e.target;
    if (t.matches('.cell-pts')) {
      onCellChange(parseInt(t.dataset.st, 10), t.dataset.key, t.value);
    } else if (t.matches('[data-bonus=comment]')) {
      onBonusChange(parseInt(t.dataset.st, 10), 'bonusComment', t.value);
    }
  });
  document.addEventListener('change', function(e){
    var t = e.target;
    if (t.matches('[data-bonus=points]')) {
      onBonusChange(parseInt(t.dataset.st, 10), 'bonusPts', parseFloat(t.value) || 0);
    }
  });

  window.toggleCard = function(idx) {
    var card = document.getElementById('st-' + idx);
    if (card) card.classList.toggle('collapsed');
  };
  window.toggleAll = function(expand) {
    document.querySelectorAll('.student-card').forEach(function(c){
      if (expand) c.classList.remove('collapsed');
      else c.classList.add('collapsed');
    });
  };
  window.resetStudent = function(idx) {
    if (!confirm('Effacer les notes de ' + STUDENTS[idx].name + ' ?')) return;
    delete STATE[idx];
    saveState(STATE);
    render();
  };
  window.printStudent = function(idx) {
    var orig = document.querySelectorAll('.student-card');
    orig.forEach(function(c, i){ if (i !== idx) c.style.display = 'none'; });
    window.print();
    setTimeout(function(){ orig.forEach(function(c){ c.style.display = ''; }); }, 500);
  };
  window.downloadStudent = function(idx) {
    var student = STUDENTS[idx];
    var r = computeScore(idx);
    var s = STATE[idx] || {};
    // Génère un HTML mono-élève (auto-contenu) à transmettre
    var cells = s.cells || {};
    var rows = GRILLE.rows || [];
    var cols = GRILLE.cols || [];
    var rowsPoints = GRILLE.rowsPoints || [];
    var gridCells = GRILLE.cells || {};
    var rowsHtml = '';
    rows.forEach(function(r, rIdx){
      var tds = '<th><span class="lvl">' + escapeHtml(r) + '</span>' + (rowsPoints[rIdx] != null ? '<span class="ref"> /' + rowsPoints[rIdx] + '</span>' : '') + '</th>';
      cols.forEach(function(_, cIdx){
        var key = rIdx + '_' + cIdx;
        var cell = gridCells[key] || {};
        var val = cells[key] != null ? cells[key] : '';
        tds += '<td>' + (cell.text ? '<div class="desc">' + escapeHtml(cell.text) + '</div>' : '') + (val !== '' ? '<div class="cell-pts">' + escapeHtml(val) + ' pt(s)</div>' : '<div class="cell-pts empty">—</div>') + '</td>';
      });
      rowsHtml += '<tr>' + tds + '</tr>';
    });
    var colsHead = '<th></th>' + cols.map(function(c){ return '<th>' + escapeHtml(c) + '</th>'; }).join('');
    var html = '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/><title>' + escapeHtml(student.name) + ' — ' + escapeHtml(GRILLE.name) + '</title>' +
      '<style>body{font-family:system-ui,sans-serif;padding:24px;color:#1e293b;max-width:900px;margin:0 auto;}h1{font-family:Georgia,serif;color:#6c63ff;}h2{color:#64748b;font-size:14px;font-weight:600;}table{width:100%;border-collapse:collapse;margin-top:14px}th,td{border:1px solid #cbd5e1;padding:6px 8px;font-size:11px;vertical-align:top;line-height:1.35}th{background:#f1f5f9;font-weight:700}.lvl{background:#6c63ff;color:#fff;padding:2px 6px;border-radius:4px;font-weight:700;font-size:10px}.ref{font-size:9px;color:#64748b}.desc{font-size:10px;color:#334155;margin-bottom:4px}.cell-pts{font-size:13px;font-weight:700;color:#16a34a;text-align:center}.cell-pts.empty{color:#cbd5e1}.score{margin-top:20px;padding:14px 18px;background:linear-gradient(90deg,#fef3c7,#fde68a);border:1px solid #f59e0b;border-radius:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}.score .num{font-size:28px;font-weight:800;color:#78350f}.score .bonus{padding:10px 14px;background:#ede9fe;border:1px solid #8b5cf6;border-radius:8px;margin-top:10px;font-size:12px;color:#5b21b6}@media print{body{padding:8px}}</style>' +
      '</head><body>' +
      '<h1>' + escapeHtml(student.name) + '</h1>' +
      '<h2>' + escapeHtml(GRILLE.name || 'Grille') + (student.classe ? ' · Classe : ' + escapeHtml(student.classe) : '') + '</h2>' +
      '<table><thead><tr>' + colsHead + '</tr></thead><tbody>' + rowsHtml + '</tbody></table>' +
      (s.bonusComment || r.bonus > 0 ? '<div class="bonus">✨ Bonus : <b>+' + r.bonus + ' pt(s)</b>' + (s.bonusComment ? ' — ' + escapeHtml(s.bonusComment) : '') + '</div>' : '') +
      '<div class="score"><div>Score : <b>' + r.totalScore + '</b> / ' + r.total + '</div><div class="num">' + (r.note != null ? r.note : '—') + ' / 20</div></div>' +
      '</body></html>';
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (student.name.replace(/[^a-zA-Z0-9-_]+/g, '_') || 'eleve') + '_' + (GRILLE.name || 'grille').replace(/[^a-zA-Z0-9-_]+/g, '_') + '.html';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  };

  window.downloadAllPdfZip = async function() {
    if (typeof window.jspdf === 'undefined' || typeof window.html2canvas === 'undefined' || typeof window.JSZip === 'undefined') {
      alert("⚠️ Les librairies PDF n'ont pas pu être chargées.\\nVérifie ta connexion internet, puis recharge cette page une fois.");
      return;
    }
    var btn = document.querySelector('[data-testid=download-all-pdf-zip]');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Génération…'; }
    try {
      var zip = new JSZip();
      var profFolder = zip.folder('grilles_eleves');
      var jsPDF = window.jspdf.jsPDF;
      var cards = document.querySelectorAll('.student-card');
      // Force expansion of all cards to capture them fully
      cards.forEach(function(c){ c.classList.remove('collapsed'); });
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var student = STUDENTS[i] || { name: 'eleve_' + i };
        var actions = card.querySelector('.actions');
        var head = card.querySelector('.student-head');
        var headerBtns = head ? head.querySelectorAll('button') : [];
        var actionsDisplay = actions ? actions.style.display : null;
        if (actions) actions.style.display = 'none';
        headerBtns.forEach(function(b){ b.style.visibility = 'hidden'; });
        try {
          var canvas = await html2canvas(card, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true });
          var pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
          var imgData = canvas.toDataURL('image/jpeg', 0.85);
          var pdfW = pdf.internal.pageSize.getWidth();
          var pdfH = pdf.internal.pageSize.getHeight();
          var imgRatio = canvas.height / canvas.width;
          var imgW = pdfW - 12;
          var imgH = imgW * imgRatio;
          var y = 6;
          if (imgH > pdfH - 12) {
            // Si l'image dépasse la page, on adapte par hauteur et on multi-pagine en image scrollable
            imgH = pdfH - 12;
            imgW = imgH / imgRatio;
          }
          pdf.addImage(imgData, 'JPEG', (pdfW - imgW) / 2, y, imgW, imgH, undefined, 'FAST');
          // Footer prof name
          ${profName ? `pdf.setFontSize(8); pdf.setTextColor(150); pdf.text(${JSON.stringify('· ' + profName)}, pdfW - 8, pdfH - 4, { align: 'right' });` : ''}
          var blob = pdf.output('blob');
          var safeName = (student.name || ('eleve_' + i)).replace(/[^a-zA-Z0-9-_]+/g, '_');
          profFolder.file(safeName + '.pdf', blob);
        } finally {
          if (actions) actions.style.display = actionsDisplay || '';
          headerBtns.forEach(function(b){ b.style.visibility = ''; });
        }
        if (btn) btn.textContent = '⏳ ' + (i + 1) + ' / ' + cards.length;
      }
      var zipBlob = await zip.generateAsync({ type: 'blob' });
      var url = URL.createObjectURL(zipBlob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'grilles_eleves_' + (GRILLE.name || 'grille').replace(/[^a-zA-Z0-9-_]+/g, '_') + '.zip';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
    } catch (e) {
      console.error('PDF ZIP error:', e);
      alert('❌ Erreur lors de la génération : ' + (e && e.message ? e.message : e));
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '📦 Télécharger toutes les notes en PDF (ZIP)'; }
    }
  };

  render();
})();
</script>
</body>
</html>`;
};

// Helper pour télécharger directement un blob HTML
export const downloadDistribution = (grille, students, sequenceTitle = '', profName = '') => {
  const html = generateDistributionHtml(grille, students, sequenceTitle, profName);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (grille.name || 'grille').replace(/[^a-zA-Z0-9-_]+/g, '_');
  a.download = `Distribution_${safeName}_${students.length}eleves.html`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
