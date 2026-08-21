import React from 'react';

// Bandeau de bas de page avec mentions légales / crédits.
// Affiché tout en bas de l'application (hors mode impression).
const Footer = () => (
  <footer
    className="app-footer"
    style={{
      marginTop: 'auto',
      padding: '14px 24px',
      borderTop: '1px solid var(--border)',
      background: 'var(--card)',
      fontSize: 11,
      color: 'var(--text-muted)',
      textAlign: 'center',
      lineHeight: 1.6,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4
    }}
  >
    <div>
      <span
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 800,
          background: 'linear-gradient(135deg, var(--accent), var(--accent4))',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        🪄 Lesson Loom
      </span>{' '}
      est une version modifiée de{' '}
      <a
        href="https://forge.apps.education.fr/rollocharlie/le-sequenceur/-/blob/main/CHANGELOG"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}
      >
        Le Séquenceur LV
      </a>{' '}
      développé par{' '}
      <span
        style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}
      >
        Charlie Rollo
      </span>
      , maintenue et enrichie par{' '}
      <a
        href="mailto:contact@lessonloom.fr"
        style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}
      >
        Maïwena Gadegbeku
      </a>
      .
    </div>
    <div style={{ fontSize: 10, opacity: 0.75 }}>Juin 2026</div>
  </footer>
);

export default Footer;
