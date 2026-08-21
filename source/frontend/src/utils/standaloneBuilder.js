// Construit à la volée un fichier HTML autonome (offline)
// contenant toute l'application Lesson Loom (HTML + CSS + JS inlinés).
// Le fichier peut être double-cliqué pour ouvrir l'app sans serveur,
// et fonctionne sur file:// (service worker, backend API et badges ignorés).

const fetchText = async (url) => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Échec téléchargement ${url} (${res.status})`);
  return res.text();
};

const absolutize = (path) => {
  if (/^https?:/i.test(path)) return path;
  return new URL(path, window.location.origin + window.location.pathname).href;
};

// Convertit une URL en data: URI (utilisé pour les icônes/favicon)
const fetchAsDataUri = async (url) => {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

// Réécrit url(/...) dans une feuille CSS pour pointer vers le bon domaine
// (les polices/icônes resteront chargées depuis le CDN distant, ce qui
// est acceptable, le navigateur les met en cache).
const rewriteCssUrls = (css, baseUrl) => {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, u) => {
    if (/^(data:|https?:|\/\/)/i.test(u)) return m;
    try {
      const absolute = new URL(u, baseUrl).href;
      return `url(${q}${absolute}${q})`;
    } catch {
      return m;
    }
  });
};

export const buildStandaloneApp = async ({ onProgress } = {}) => {
  const progress = (msg) => { try { onProgress && onProgress(msg); } catch (e) { console.warn('[LessonLoom] onProgress callback error :', e); } };

  progress('Récupération de la page…');
  const indexUrl = window.location.origin + '/index.html';
  let html = await fetchText(indexUrl);

  // 1) Retirer les badges/scripts spécifiques à la preview Emergent
  progress('Nettoyage de la page…');
  html = html.replace(/<a[^>]*id=["']emergent-badge["'][\s\S]*?<\/a>/gi, '');
  html = html.replace(/<script[^>]*posthog[^>]*><\/script>/gi, '');
  // Supprime tout commentaire HTML (template CRA)
  html = html.replace(/<!--[\s\S]*?-->/g, '');

  // 2) Inliner les CSS
  progress('Intégration des styles…');
  const cssTagRegex = /<link[^>]*rel=["']stylesheet["'][^>]*>/gi;
  const cssLinks = html.match(cssTagRegex) || [];
  for (const tag of cssLinks) {
    const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    const cssUrl = absolutize(hrefMatch[1]);
    try {
      let css = await fetchText(cssUrl);
      css = rewriteCssUrls(css, cssUrl);
      // Utiliser une fonction comme replacement pour éviter l'interprétation
      // de $&, $1, $$ etc. dans la chaîne de remplacement.
      const replacement = `<style data-inlined="${hrefMatch[1]}">${css}</style>`;
      html = html.split(tag).join(replacement);
    } catch (e) {
      html = html.split(tag).join(`<!-- CSS introuvable: ${hrefMatch[1]} -->`);
    }
  }

  // 3) Inliner le manifest et favicon (data URIs)
  progress('Intégration des icônes…');
  // Favicon
  const faviconRegex = /<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*>/gi;
  const faviconTags = html.match(faviconRegex) || [];
  for (const tag of faviconTags) {
    const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    if (/^data:/i.test(hrefMatch[1])) continue;
    const dataUri = await fetchAsDataUri(absolutize(hrefMatch[1]));
    if (dataUri) {
      const newTag = tag.split(hrefMatch[1]).join(dataUri);
      html = html.split(tag).join(newTag);
    } else {
      html = html.split(tag).join('');
    }
  }
  // Manifest : inutile en mode fichier local, on retire
  html = html.replace(/<link[^>]*rel=["']manifest["'][^>]*>/gi, '');

  // 4) Inliner les JS (dans l'ordre)
  progress('Intégration du moteur de l\'application…');
  const scriptTagRegex = /<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi;
  let match;
  const scripts = [];
  while ((match = scriptTagRegex.exec(html)) !== null) {
    const tag = match[0];
    const src = match[1];
    const isDeferred = /\b(defer|async)\b/i.test(tag);
    scripts.push({ tag, src, isDeferred });
  }
  // Les scripts marqués `defer` ou `async` doivent s'exécuter après le parsing
  // du DOM (sinon React ne trouve pas #root). Quand on les inline, on les
  // déplace donc à la fin du body. Les autres restent à leur emplacement.
  const deferredInlined = [];
  for (const s of scripts) {
    try {
      let js = await fetchText(absolutize(s.src));
      // Échappe TOUS les </script…> littéraux côté parser HTML.
      js = js.replace(/<\/script/gi, '<\\/script');
      const inlined = `<script data-src="${s.src}">${js}</script>`;
      if (s.isDeferred) {
        // Retire la balise originale, on le ré-injectera à la fin du body
        html = html.split(s.tag).join(`<!-- (déplacé en fin de body) ${s.src} -->`);
        deferredInlined.push(inlined);
      } else {
        html = html.split(s.tag).join(inlined);
      }
    } catch (e) {
      html = html.split(s.tag).join(`<!-- JS introuvable: ${s.src} -->`);
    }
  }

  // 5) Injecter un flag standalone ET désactiver les fonctionnalités
  // qui ne marchent pas en file://
  progress('Préparation du mode hors-ligne…');
  // Note : on construit les balises script/style avec des concaténations
  // pour qu'aucun '</script>' littéral n'apparaisse dans le code source
  // (sinon, quand ce module est lui-même bundlé puis ré-inliné, ces littéraux
  // ferment prématurément la balise <script> englobante).
  const S_OPEN = '<' + 'script>';
  const S_CLOSE = '<' + '/script>';
  const offlineShim = `
${S_OPEN}
  // Mode autonome - lance-toi hors-ligne
  window.__LESSON_LOOM_STANDALONE__ = true;

  // Désactive le service worker en mode fichier local
  if (location.protocol === 'file:' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register = function () {
      return Promise.resolve();
    };
  }

  // Désactive les appels backend (aucune API dispo en mode fichier local)
  if (location.protocol === 'file:') {
    const _fetch = window.fetch;
    window.fetch = function (input, init) {
      try {
        const u = typeof input === 'string' ? input : (input && input.url) || '';
        if (/\\/api\\//.test(u) || /preview\\.emergentagent\\.com/.test(u)) {
          return Promise.resolve(new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
        }
      } catch (e) { /* ignore */ }
      return _fetch.apply(this, arguments);
    };
  }
${S_CLOSE}`;
  html = html.replace(/<head([^>]*)>/i, (m, attrs) => `<head${attrs}>${offlineShim}`);

  // 6) Petite bannière "Mode hors-ligne" visible
  const banner = `
<style>
  #__lesson_loom_offline_banner {
    position: fixed; bottom: 12px; left: 12px; z-index: 99999;
    background: #0f172a; color: #f1f5f9;
    padding: 8px 14px; border-radius: 999px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 12px; font-weight: 600;
    box-shadow: 0 6px 22px rgba(0,0,0,.18);
    display: none;
  }
  body[data-standalone="true"] #__lesson_loom_offline_banner { display: inline-flex; align-items: center; gap: 6px; }
</style>
${S_OPEN}
  document.addEventListener('DOMContentLoaded', function () {
    if (location.protocol === 'file:') {
      document.body.setAttribute('data-standalone', 'true');
      var b = document.createElement('div');
      b.id = '__lesson_loom_offline_banner';
      // textContent (et non innerHTML) : aucun risque d'injection HTML
      // même si la chaîne était modifiée plus tard.
      b.textContent = '\u26A1 Lesson Loom — version locale hors-ligne';
      document.body.appendChild(b);
    }
  });
${S_CLOSE}`;
  // Injecte le banner + les scripts différés avant LE DERNIER </body>
  // (le bundle JS peut contenir des chaînes "</body>" en tant que texte).
  const bodyCloseIdx = html.lastIndexOf('</body>');
  const tailBlock = deferredInlined.join('\n') + banner;
  if (bodyCloseIdx >= 0) {
    html = html.slice(0, bodyCloseIdx) + tailBlock + html.slice(bodyCloseIdx);
  } else {
    html += tailBlock;
  }

  progress('Fichier prêt !');
  return html;
};

export const downloadStandaloneApp = async ({ onProgress } = {}) => {
  const html = await buildStandaloneApp({ onProgress });
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lesson-loom-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  return blob.size;
};
