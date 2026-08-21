// Données complémentaires pour l'enrichissement v2

// Niveaux cibles avec demi-niveaux (style FR enseignants)
export const NIVEAUX_CIBLES = [
  'A1', 'A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2', 'B2+', 'C1', 'C1+', 'C2'
];

// Nomenclature FR (style enseignants français)
export const ACTIVITES_FR = [
  { code: 'CE', label: 'Compréhension écrite', color: 'c', mapCecrl: 'CE' },
  { code: 'EOC', label: 'Expression orale en continu', color: 'p', mapCecrl: 'PO' },
  { code: 'EOI', label: 'Expression orale en interaction', color: 'y', mapCecrl: 'IO' },
  { code: 'CO', label: "Compréhension de l'oral", color: 'g', mapCecrl: 'CO' },
  { code: 'EE', label: 'Expression écrite', color: 'v', mapCecrl: 'PE' },
  { code: 'MED', label: 'Médiation (optionnel)', color: 'pk', mapCecrl: 'MED' }
];

export const NOMENCLATURE_OPTIONS = [
  { value: 'cecrl', label: 'CECRL (7 compétences)', description: 'CO, CE, PO, PE, IO, IE, MED' },
  { value: 'fr', label: 'Style FR (5 activités)', description: 'CE, EOC, EOI, CO, EE' }
];

// Types de tests sommatifs
export const TEST_TYPES = [
  { value: 'CO', label: 'CO — Compréhension orale' },
  { value: 'CE', label: 'CE — Compréhension écrite' },
  { value: 'EE', label: 'EE — Expression écrite' },
  { value: 'EOC', label: 'EOC — Expression orale continu' },
  { value: 'EOI', label: 'EOI — Expression orale interaction' },
  { value: 'EE+EOC', label: 'EE + EOC — Projet combiné' },
  { value: 'MED', label: 'Médiation' },
  { value: 'AUTRE', label: 'Autre…' }
];

// Types de supports complémentaires
export const SUPPORT_TYPES = [
  { value: 'texte', label: '📄 Texte / Article', color: '#3b82f6' },
  { value: 'livre', label: '📚 Livre / Extrait', color: '#a855f7' },
  { value: 'video', label: '🎬 Vidéo', color: '#ef4444' },
  { value: 'audio', label: '🎵 Audio / Podcast', color: '#f59e0b' },
  { value: 'image', label: '🖼️ Image / Visuel', color: '#ec4899' },
  { value: 'site', label: '🌐 Site web', color: '#06b6d4' },
  { value: 'pearltrees', label: '🌳 Pearltrees', color: '#10b981' },
  { value: 'autre', label: '📎 Autre', color: '#6b7280' }
];

// Modalités de séance (cours, demi-groupe, salle info...)
export const MODALITES = [
  'Classe entière',
  'Demi-groupe',
  'Salle info',
  'Salle audio',
  'CDI / Bibliothèque',
  'Co-enseignement',
  'À distance',
  'Sortie scolaire'
];

// Templates de grilles d'évaluation
export const GRILLE_LEVELS_DEFAULT = ['A1', 'A2', 'A2+', 'B1', 'B1+'];
export const GRILLE_LEVELS_FULL = ['A1', 'A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2', 'B2+', 'C1'];

// Critères-types pour grilles (préremplissage)
export const GRILLE_CRITERES_PRESETS = {
  EE: [
    { label: 'Traitement du sujet', points: 5 },
    { label: 'Cohérence et cohésion', points: 4 },
    { label: 'Recevabilité linguistique', points: 5 },
    { label: 'Lexique', points: 4 },
    { label: 'Respect des consignes', points: 2 }
  ],
  EOC: [
    { label: 'Communication / Aisance', points: 4 },
    { label: 'Phonologie / Intonation', points: 4 },
    { label: 'Traitement du sujet', points: 5 },
    { label: 'Recevabilité linguistique', points: 4 },
    { label: 'Lexique', points: 3 }
  ],
  EOI: [
    { label: 'Prise de parole / Interaction', points: 5 },
    { label: 'Phonologie', points: 3 },
    { label: 'Recevabilité linguistique', points: 5 },
    { label: 'Lexique', points: 4 },
    { label: 'Stratégies de communication', points: 3 }
  ],
  CO: [
    { label: 'Information essentielle', points: 5 },
    { label: 'Informations détaillées', points: 5 },
    { label: 'Implicite / inférences', points: 4 },
    { label: 'Stratégies d\'écoute', points: 3 },
    { label: 'Reformulation', points: 3 }
  ],
  CE: [
    { label: 'Information essentielle', points: 5 },
    { label: 'Informations détaillées', points: 5 },
    { label: 'Implicite / inférences', points: 4 },
    { label: 'Stratégies de lecture', points: 3 },
    { label: 'Reformulation / synthèse', points: 3 }
  ]
};

// Templates de descripteurs « I can… » par niveau (style élève-friendly)
export const I_CAN_TEMPLATES = {
  A1: 'I can do this with a lot of help and basic words.',
  'A1+': 'I can do this with some help and very simple sentences.',
  A2: 'I can do this with simple sentences and some hesitation.',
  'A2+': 'I can do this with mostly simple but varied sentences.',
  B1: 'I can do this clearly and with growing autonomy.',
  'B1+': 'I can do this with confidence and developing nuance.',
  B2: 'I can do this fluently with nuanced and structured language.',
  'B2+': 'I can do this with ease, precision and natural flow.',
  C1: 'I can do this with refined, accurate and idiomatic language.'
};

// Couleurs des sections pour A4 (style PDF utilisateur)
export const A4_SECTION_COLORS = {
  header: { bg: '#fef3c7', fg: '#92400e' },          // jaune doré
  taskVisee: { bg: '#fee2e2', fg: '#991b1b' },        // rouge clair
  cecrlCible: { bg: '#dbeafe', fg: '#1e40af' },       // bleu clair
  activites: { bg: '#dcfce7', fg: '#166534' },         // vert clair
  linguistique: { bg: '#fae8ff', fg: '#86198f' },     // mauve clair
  pragmatique: { bg: '#ede9fe', fg: '#5b21b6' },      // violet clair
  sociolinguistique: { bg: '#cffafe', fg: '#155e75' }, // cyan clair
  culturelle: { bg: '#ffedd5', fg: '#9a3412' },       // orange clair
  tice: { bg: '#e0e7ff', fg: '#3730a3' },             // indigo clair
  evalFormative: { bg: '#fef9c3', fg: '#854d0e' },    // jaune
  evalSommative: { bg: '#fce7f3', fg: '#9f1239' },    // rose
  etapes: { bg: '#f1f5f9', fg: '#1e293b' },           // gris bleuté
  supports: { bg: '#ecfccb', fg: '#3f6212' },         // lime clair
  issues: { bg: '#fef2f2', fg: '#7f1d1d' }            // rouge très clair
};
