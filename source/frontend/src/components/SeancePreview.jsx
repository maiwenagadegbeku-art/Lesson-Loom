import React from 'react';
import { useApp } from '../contexts/AppContext';
import DOMPurify from 'dompurify';

// Configuration DOMPurify pour le rendu d'aperçu : autorise les tags basiques + bloque tout JS.
const SANITIZE_OPTS = { ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'br', 'p', 'span', 'div'], ALLOWED_ATTR: ['href', 'target', 'rel', 'style'], ALLOW_DATA_ATTR: false };
const safeHtml = (raw) => DOMPurify.sanitize(raw || '', SANITIZE_OPTS);

// Aperçu A4 live de la séance — affiche le titre, l'image, les objectifs, les
// activités langagières CECRL, les supports, les activités chronométrées,
// la trace écrite et les devoirs au fil de l'édition.
const SeancePreview = ({ seance, sequence, seanceIndex }) => {
  const { prefs } = useApp();
  if (!seance) return null;
  const font = seance.font || undefined;
  const fontScale = seance.fontScale || 1;
  const totalMin = (seance.activites || []).reduce((a, b) => a + (parseInt(b.duree, 10) || 0), 0);

  const Section = ({ title, color = '#0f172a', children }) => (
    <section style={{ marginBottom: 14 }}>
      <div style={{
        fontSize: 9 * fontScale, fontWeight: 800, letterSpacing: 1.3,
        textTransform: 'uppercase', color, marginBottom: 6,
        paddingBottom: 3, borderBottom: `1px solid ${color}33`
      }}>{title}</div>
      <div style={{ fontSize: 11 * fontScale, lineHeight: 1.5, color: '#334155' }}>{children}</div>
    </section>
  );

  const Pill = ({ text, level, bg = '#e0e7ff', fg = '#3730a3' }) => (
    <span style={{
      display: 'inline-block', background: bg, color: fg,
      padding: '2px 7px', borderRadius: 4, marginRight: 4, marginBottom: 3,
      fontSize: 10 * fontScale, fontWeight: 600
    }}>
      {level && <b style={{ marginRight: 4 }}>{level}</b>}{text}
    </span>
  );

  const hasObjectives = (seance.objLex?.length || 0) + (seance.objGram?.length || 0) + (seance.objPhon?.length || 0) + (seance.objPrag?.length || 0) > 0;
  const niveauLabel = sequence?.niveau === 'DNL'
    ? (sequence.dnlDiscipline ? `DNL ${sequence.dnlDiscipline}` : 'DNL') + (sequence.dnlLevel ? ' · ' + sequence.dnlLevel : '')
    : ((sequence?.niveau || '').replace(/_/g, ' ') + (sequence?.lv && /Seconde|Première|Terminale/.test(sequence?.niveau) && !sequence?.niveau.includes('_') ? ' · ' + sequence.lv : ''));

  return (
    <div style={{
      background: '#fff', width: '100%', maxWidth: 720,
      minHeight: '90vh', padding: '38px 44px',
      boxShadow: '0 4px 24px rgba(15,23,42,.08)',
      borderRadius: 6, fontFamily: font, color: '#1e293b'
    }}>
      {/* Header */}
      <div style={{ borderBottom: '2px solid #6c63ff', paddingBottom: 14, marginBottom: 18 }}>
        <div style={{ fontSize: 10 * fontScale, fontWeight: 800, color: '#6c63ff', textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 4 }}>
          {sequence?.titre || 'Séquence'} {niveauLabel && '· ' + niveauLabel} {seanceIndex != null && '· Séance ' + (seanceIndex + 1)}
        </div>
        {seance.imageUrl && (
          <div style={{ marginBottom: 10, textAlign: seance.imageShape === 'round' ? 'center' : 'left' }}>
            <img
              src={seance.imageUrl} alt=""
              style={seance.imageShape === 'round'
                ? { width: 110, height: 110, borderRadius: '50%', objectFit: 'cover' }
                : { width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 6 }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}
        <h1 style={{ fontSize: 24 * fontScale, fontWeight: 800, margin: 0, fontFamily: font || "'Playfair Display', Georgia, serif", color: '#0f172a' }}>
          {seance.titre || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Titre de la séance…</span>}
        </h1>
        {seance.objectif && (
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 13 * fontScale, fontStyle: 'italic', color: '#475569' }}>
            🎯 {seance.objectif}
          </p>
        )}
      </div>

      {hasObjectives && (
        <Section title="Objectifs de la séance" color="#eab308">
          {seance.objLex?.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              <b style={{ color: '#92400e', fontSize: 10 * fontScale }}>Lexique :</b>{' '}
              {seance.objLex.map((t, i) => <Pill key={i} text={t.text} bg="#fef9c3" fg="#713f12" />)}
            </div>
          )}
          {seance.objGram?.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              <b style={{ color: '#166534', fontSize: 10 * fontScale }}>Grammaire :</b>{' '}
              {seance.objGram.map((t, i) => <Pill key={i} text={t.text} bg="#dcfce7" fg="#166534" />)}
            </div>
          )}
          {seance.objPhon?.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              <b style={{ color: '#9a3412', fontSize: 10 * fontScale }}>Phonologie :</b>{' '}
              {seance.objPhon.map((t, i) => <Pill key={i} text={t.text} bg="#ffedd5" fg="#9a3412" />)}
            </div>
          )}
          {seance.objPrag?.length > 0 && (
            <div>
              <b style={{ color: '#9d174d', fontSize: 10 * fontScale }}>Pragmatique :</b>{' '}
              {seance.objPrag.map((t, i) => <Pill key={i} level={t.level} text={t.text} bg="#fce7f3" fg="#9d174d" />)}
            </div>
          )}
        </Section>
      )}

      {seance.compActs?.length > 0 && (
        <Section title="Activités langagières CECRL" color="#6c63ff">
          {seance.compActs.map((a, i) => (
            <div key={i} style={{ marginBottom: 5 }}>
              <Pill level={a.level} text={`${a.code} · ${a.text}`} bg="#ede9fe" fg="#5b21b6" />
            </div>
          ))}
        </Section>
      )}

      {(seance.supportsList || []).some(s => s.label || s.url) && (
        <Section title="Supports & documents" color="#0891b2">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {seance.supportsList.filter(s => s.label || s.url).map((s, i) => (
              <li key={i} style={{ marginBottom: 3 }}>
                {s.url
                  ? <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0891b2', textDecoration: 'underline' }}>{s.label || s.url}</a>
                  : <span>{s.label}</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {seance.activites?.length > 0 && (
        <Section title={`Activités${totalMin > 0 ? ' (Durée totale : ' + totalMin + ' min)' : ''}`} color="#f59e0b">
          {seance.activites.map((a, i) => (
            <div key={a.id || i} style={{ marginBottom: 10, padding: '8px 12px', background: '#fffbeb', borderLeft: '3px solid #f59e0b', borderRadius: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: a.contenu ? 6 : 0 }}>
                <span style={{ fontSize: 9 * fontScale, fontWeight: 800, padding: '2px 6px', borderRadius: 3, background: '#f59e0b', color: '#fff', letterSpacing: 0.5 }}>ACTIVITÉ {i + 1}</span>
                <span style={{ fontWeight: 700, fontSize: 12 * fontScale, flex: 1 }}>{a.label || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Sans titre</span>}</span>
                {(parseInt(a.duree, 10) || 0) > 0 && <span style={{ fontSize: 11 * fontScale, color: '#92400e', fontWeight: 700 }}>⏱️ {parseInt(a.duree, 10)} min</span>}
              </div>
              {a.contenu && (
                <div
                  style={{ fontSize: 11 * fontScale, lineHeight: 1.5, color: '#475569', fontFamily: font || "'Patrick Hand', cursive" }}
                  dangerouslySetInnerHTML={{ __html: safeHtml(a.contenu) }}
                />
              )}
            </div>
          ))}
        </Section>
      )}

      {seance.trace && (
        <Section title="Trace écrite attendue" color="#6c63ff">
          <div
            style={{ fontFamily: font || "'Patrick Hand', cursive", fontSize: 14 * fontScale, lineHeight: 1.6, color: '#1e293b', background: '#fafafa', padding: '10px 14px', borderRadius: 6, borderLeft: '3px solid #6c63ff' }}
            dangerouslySetInnerHTML={{ __html: safeHtml(seance.trace) }}
          />
        </Section>
      )}

      {seance.devoirs && (
        <Section title="Devoirs à la maison" color="#dc2626">
          <div
            style={{ fontSize: 12 * fontScale, lineHeight: 1.5, background: '#fef2f2', padding: '10px 14px', borderRadius: 6, borderLeft: '3px solid #dc2626' }}
            dangerouslySetInnerHTML={{ __html: safeHtml(seance.devoirs) }}
          />
        </Section>
      )}

      {prefs?.profName && (
        <div style={{ marginTop: 18, paddingTop: 10, borderTop: '1px solid #e2e8f0', textAlign: 'right', fontSize: 10 * fontScale, color: '#94a3b8', fontStyle: 'italic' }}>
          · {prefs.profName}
        </div>
      )}
    </div>
  );
};

export default SeancePreview;
