// Données officielles du Bulletin Officiel (Education Nationale) pour l'anglais lycée
// Source : BO + référentiels CECRL (Volume complémentaire 2018/2020)

export const NIVEAUX_LYCEE = [
  { value: 'Seconde', label: 'Seconde', group: 'Tronc Commun' },
  { value: 'Première', label: 'Première', group: 'Tronc Commun' },
  { value: 'Terminale', label: 'Terminale', group: 'Tronc Commun' },
  { value: 'DNL', label: 'DNL', group: 'Tronc Commun' },
  { value: 'Première_AMC', label: 'Première AMC', group: 'Spécialités' },
  { value: 'Terminale_AMC', label: 'Terminale AMC', group: 'Spécialités' },
  { value: 'Première_LLCER', label: 'Première LLCER', group: 'Spécialités' },
  { value: 'Terminale_LLCER', label: 'Terminale LLCER', group: 'Spécialités' }
];

// AXES & OBJETS D'ÉTUDE (Programmes BO anglais lycée)
export const AXES = {
  Seconde: {
    "Axe 1. Représentation de soi et rapport à autrui": [
      "Les normes en question : conformité, contestation, réappropriation",
      "Identité mouvante : la revendication d'identités multiples à travers les arts",
      "La construction des canons de beauté des Préraphaélites aux beauty pageants",
      "La mode comme outil de revendication et témoignage d'une époque"
    ],
    "Axe 2. Vivre entre générations": [
      "Les relations intergénérationnelles dans la diaspora indienne",
      "L'évolution de la cellule familiale et de ses représentations",
      "Patrimoine immobilier et société de classes au Royaume-Uni",
      "L'écologie : une fracture générationnelle ?"
    ],
    "Axe 3. Le passé dans le présent": [
      "La culture aborigène dans l'Australie contemporaine",
      "Les commissions de réconciliation dans les pays anglophones",
      "Une Couronne britannique inscrite dans le temps",
      "Architecture et sculptures, témoins d'une époque"
    ],
    "Axe 4. Défis et transitions": [
      "Les formes de mobilisation populaire : des trade unions au hashtag",
      "Transports et (re)structuration des espaces",
      "Repenser l'espace urbain face aux évolutions démographiques",
      "Le monde des objets : production, consommation, recyclage"
    ],
    "Axe 5. Créer et recréer": [
      "Évolution d'un mythe : le cowboy",
      "Les réinterprétations d'un conte ou d'une légende au fil du temps",
      "Ces grandes œuvres classiques qui se déclinent au fil des époques",
      "La machine hollywoodienne ou comment Hollywood se met en scène"
    ],
    "Axe 6. Les pays du Commonwealth : héritages, unité, diversité": [
      "La littérature anglophone, témoignage de l'histoire et d'histoires",
      "De l'empire aux indépendances : transitions postcoloniales",
      "Permanence et rupture dans les héritages politiques britanniques",
      "Représenter le Commonwealth de sa conception à aujourd'hui"
    ]
  },
  "Première": {
    "Axe 1. Identités et échanges": [
      "Migrations et politiques d'accueil : le cas du Canada",
      "La Windrush generation et sa contribution à la société du Royaume-Uni",
      "Les frontières, lieux d'échanges ?",
      "La construction de l'identité : la frontière entre l'Irlande et l'Irlande du Nord"
    ],
    "Axe 2. Diversité et inclusion": [
      "Logement et mixité sociale",
      "La Cour Suprême des États-Unis : matrice d'inclusion et d'exclusion",
      "Mobilité sociale et discrimination positive",
      "Représentation politique des Peuples premiers"
    ],
    "Axe 3. Art et pouvoir": [
      "L'art, les artistes et le pouvoir",
      "L'art comme vecteur de résistance ou de reconnaissance",
      "S'engager dans la presse et les médias : dessins, caricatures et photojournalisme",
      "Mise en scène et représentation du pouvoir politique dans le cinéma"
    ],
    "Axe 4. Innovations scientifiques et responsabilité": [
      "À qui appartient l'espace ?",
      "Énergies d'hier et de demain : l'exemple de l'Écosse",
      "La science et la quête de l'homme parfait",
      "Révolutions industrielles, technologiques, numériques et contre-révolutions"
    ],
    "Axe 5. L'être humain et la nature": [
      "Les Parcs Nationaux, outils de préservation de la nature",
      "Vivre avec et vivre de la nature",
      "L'homme face à la nature et aux évènements météorologiques",
      "La sacralisation de la nature dans l'art et dans la fiction"
    ],
    "Axe 6. Les aires anglophones américaines": [
      "Les Caraïbes dans les Amériques et le monde",
      "Porto Rico : le 51e état ?",
      "Le pôle d'attraction nord-américain",
      "Vancouver et Seattle : regards croisés"
    ]
  },
  "Terminale": {
    "Axe 1. Espace privé et espace public": [
      "Le corps des femmes : entre domaine public et sphère privée",
      "Les chasses aux sorcières, de Salem à Hollywood",
      "Les espaces de travail, privés ou publics",
      "Nouvelles formes d'habitat urbain et espaces transitionnels"
    ],
    "Axe 2. Territoire et mémoire": [
      "Histoire et mémoire de l'esclavage et de la colonisation",
      "Les commémorations au sein du Commonwealth",
      "La construction des lieux de mémoire",
      "Territoires autochtones : intégration, assimilation ou appropriation ?"
    ],
    "Axe 3. Fictions et réalités": [
      "La dystopie, une catharsis sociétale ?",
      "La société de classes britannique dans la fiction",
      "Quand la science-fiction nourrit l'innovation scientifique",
      "Le rêve américain à travers la fiction : le questionnement d'un mythe"
    ],
    "Axe 4. Enjeux et formes de la communication": [
      "L'anglophonie, nouvelle Tour de Babel ?",
      "Chacun sa vérité ? Le défi du complotisme",
      "Forme et portée du discours politique",
      "Les précautions sémantiques dans les œuvres"
    ],
    "Axe 5. Citoyenneté et mondes virtuels": [
      "La vie connectée est-elle synonyme de vie exposée ?",
      "Le jeu vidéo comme nouvelle forme du soft power américain ?",
      "Nouvelles modalités d'apprentissage à l'heure de l'IA",
      "La parole sur les réseaux sociaux : portée et limites"
    ],
    "Axe 6. Le Royaume-Uni et ses nations": [
      "Un Royaume toujours uni ?",
      "La BBC, vecteur de soft power britannique ?",
      "Glasgow et Édimbourg : deux visages de l'Écosse en mutation",
      "L'Irlande du Nord : identités plurielles ?"
    ]
  },
  "Première_AMC": {
    "Axe 1. Savoirs, Création & Innovation": [
      "Production & Circulation des Savoirs",
      "Science & techniques ; promesses et défis"
    ],
    "Axe 2. Représentations": [
      "Faire entendre sa voix",
      "Informer et s'informer",
      "Représenter le monde et se représenter"
    ]
  },
  "Terminale_AMC": {
    "Axe 1. Faire Société": [
      "Unité et Pluralité",
      "Libertés Publiques et Individuelles",
      "Égalités et Inégalités"
    ],
    "Axe 2. Environnements en Mutation": [
      "Frontière et espace",
      "Protection de la Nature",
      "Repenser la ville"
    ],
    "Axe 3. Relation au Monde": [
      "Puissance et Influence",
      "Rivalités et Interdépendances",
      "Héritage commun et diversité"
    ]
  },
  "Première_LLCER": {
    "Axe 1. Imaginaire": [
      "L'imagination créatrice et visionnaire",
      "Imaginaires effrayants",
      "Utopies et dystopies"
    ],
    "Axe 2. Rencontres": [
      "L'amour et l'amitié",
      "Relation entre l'individu et le groupe",
      "La confrontation à la différence"
    ]
  },
  "Terminale_LLCER": {
    "Axe 1. Art et Débat d'idées": [
      "Art et Contestation",
      "Art qui fait Débat",
      "L'Art du Débat"
    ],
    "Axe 2. Expression et Construction de Soi": [
      "Expression des émotions",
      "Mise en scène de soi",
      "Initiation, apprentissage"
    ],
    "Axe 3. Voyages, Territoires et Frontières": [
      "Exploration et Aventure",
      "Ancrage et Héritage",
      "Migration et Exil"
    ]
  }
};

// GRAMMAIRE et PHONOLOGIE — référentiel BO Anglais Lycée
// Repris intégralement du repo d'origine https://forge.apps.education.fr/rollocharlie/le-sequenceur
// (variables DG.en et DP.en — bien plus riches que ce qu'on avait).
// Helpers : getGrammarFor / getPhonoFor (avec option "Tous niveaux").
export { GRAMMAR_BO as GRAMMAR, PHONO_BO as PHONO, getGrammarFor, getPhonoFor, getAllGrammar, getAllPhono, DC_CECRL_BO } from './referentielBO';


// CECRL — Compétences (Volume complémentaire 2018/2020)
// NB : la "Compréhension audiovisuelle" est intégrée à la Compréhension de l'oral
// (sous-compétences "Émissions TV/films" et "Vidéos en ligne") pour simplifier.
export const COMPETENCES = [
  { code: 'CO', label: "Compréhension de l'oral", color: 'g' },
  { code: 'CE', label: "Compréhension de l'écrit", color: 'c' },
  { code: 'PO', label: "Production orale", color: 'p' },
  { code: 'PE', label: "Production écrite", color: 'v' },
  { code: 'IO', label: "Interaction orale", color: 'y' },
  { code: 'IE', label: "Interaction écrite", color: 'r' },
  { code: 'MED', label: "Médiation", color: 'pk' }
];

export const CECRL_LEVELS = ['Pré-A1', 'A1', 'A2', 'A2+', 'B1', 'B1+', 'B2', 'C1', 'C2'];

// Descripteurs CECRL : structurés par sous-compétence puis descripteur fin avec niveau
export const CECRL_DESCRIPTORS = {
  CO: {
    subcomps: [
      { id: 'conv', label: 'Comprendre une conversation entre tiers' },
      { id: 'public', label: 'Comprendre en tant qu\'auditeur dans le public' },
      { id: 'media', label: 'Comprendre des médias audio et enregistrements' },
      { id: 'announce', label: 'Comprendre des annonces et instructions' },
      { id: 'tv', label: 'Comprendre des émissions de télévision et des films' },
      { id: 'web', label: 'Comprendre des vidéos en ligne' }
    ],
    descriptors: [
      { sub: 'conv', level: 'A2', text: "Peut généralement identifier le sujet d'une discussion menée en sa présence si l'échange est conduit lentement et clairement." },
      { sub: 'conv', level: 'B1', text: "Peut suivre, en règle générale, les points principaux d'une longue discussion se déroulant en sa présence, à condition que la langue soit standard et clairement articulée." },
      { sub: 'conv', level: 'B2', text: "Peut suivre l'essentiel d'une conversation animée entre locuteurs natifs." },
      { sub: 'conv', level: 'C1', text: "Peut suivre facilement des échanges complexes entre des tiers lors d'une discussion ou d'un débat de groupe, même sur des sujets abstraits, complexes et non familiers." },
      { sub: 'public', level: 'A2', text: "Peut suivre le plan général d'exposés courts sur des sujets familiers à condition que la langue en soit standard et clairement articulée." },
      { sub: 'public', level: 'B1', text: "Peut suivre une conférence ou un exposé dans son propre domaine à condition que le sujet soit familier et la présentation directe, simple et clairement structurée." },
      { sub: 'public', level: 'B2', text: "Peut suivre l'essentiel d'une conférence, d'un discours, d'un rapport ou de tout autre type d'exposé éducationnel/professionnel relativement long et complexe." },
      { sub: 'public', level: 'C1', text: "Peut suivre la plupart des conférences, discussions et débats avec une relative aisance." },
      { sub: 'media', level: 'A2', text: "Peut comprendre et extraire l'information essentielle de courts passages enregistrés ayant trait à un sujet courant prévisible." },
      { sub: 'media', level: 'B1', text: "Peut comprendre l'information contenue dans la plupart des documents enregistrés ou radiodiffusés sur des sujets d'intérêt personnel." },
      { sub: 'media', level: 'B2', text: "Peut comprendre la plupart des documentaires radiodiffusés en langue standard et identifier correctement l'humeur et le ton du locuteur." },
      { sub: 'media', level: 'C1', text: "Peut comprendre une gamme étendue de documents enregistrés et radiodiffusés, y compris en langue non standard." },
      { sub: 'announce', level: 'A2', text: "Peut saisir le point essentiel d'une annonce ou d'un message brefs, simples et clairs." },
      { sub: 'announce', level: 'B1', text: "Peut comprendre des informations techniques simples, tels les modes d'emploi pour un équipement d'usage courant." },
      { sub: 'announce', level: 'B2', text: "Peut comprendre des annonces et des messages courants sur des sujets concrets et abstraits." },
      { sub: 'tv', level: 'A2', text: "Peut identifier l'élément principal de nouvelles télévisées si le commentaire est accompagné d'images." },
      { sub: 'tv', level: 'B1', text: "Peut comprendre une grande partie des programmes télévisés sur des sujets d'intérêt personnel." },
      { sub: 'tv', level: 'B2', text: "Peut comprendre la plupart des journaux télévisés et des magazines d'information." },
      { sub: 'tv', level: 'C1', text: "Peut comprendre une gamme étendue de matériel filmé en langue standard et identifier des subtilités, tons et idées exprimés." },
      { sub: 'web', level: 'B1', text: "Peut comprendre les points principaux d'une vidéo si le sujet est familier et la langue claire." },
      { sub: 'web', level: 'B2', text: "Peut comprendre des vidéos sur des sujets variés, y compris d'opinion ou d'analyse, en langue standard." }
    ]
  },
  CE: {
    subcomps: [
      { id: 'corr', label: 'Lire de la correspondance' },
      { id: 'orient', label: "Lire pour s'orienter" },
      { id: 'info', label: "Lire pour s'informer et discuter" },
      { id: 'instr', label: 'Lire des instructions' }
    ],
    descriptors: [
      { sub: 'corr', level: 'A2', text: "Peut comprendre une lettre personnelle simple et brève." },
      { sub: 'corr', level: 'B1', text: "Peut comprendre la description d'événements, de sentiments et de souhaits dans des lettres personnelles." },
      { sub: 'corr', level: 'B2', text: "Peut lire la correspondance courante dans son domaine et saisir l'essentiel du sens." },
      { sub: 'orient', level: 'A2', text: "Peut trouver un renseignement spécifique et prévisible dans des documents simples et courants." },
      { sub: 'orient', level: 'B1', text: "Peut parcourir un texte assez long pour y localiser une information cherchée." },
      { sub: 'orient', level: 'B2', text: "Peut parcourir rapidement de longs textes complexes et en localiser les détails pertinents." },
      { sub: 'info', level: 'A2', text: "Peut identifier l'information pertinente sur la plupart des écrits simples rencontrés." },
      { sub: 'info', level: 'B1', text: "Peut reconnaître les points significatifs d'un article de journal direct et non complexe." },
      { sub: 'info', level: 'B2', text: "Peut comprendre des articles et des rapports sur des questions contemporaines." },
      { sub: 'info', level: 'C1', text: "Peut comprendre en détail une gamme étendue de textes longs et complexes." },
      { sub: 'instr', level: 'A2', text: "Peut comprendre un règlement concernant la sécurité, formulé simplement." },
      { sub: 'instr', level: 'B1', text: "Peut comprendre le mode d'emploi d'un appareil s'il est direct, non complexe et rédigé clairement." },
      { sub: 'instr', level: 'B2', text: "Peut comprendre des instructions longues et complexes dans son domaine." }
    ]
  },
  PO: {
    subcomps: [
      { id: 'mono', label: 'Monologue suivi : décrire une expérience' },
      { id: 'argum', label: 'Monologue suivi : argumenter' },
      { id: 'ann', label: 'Annonces publiques' },
      { id: 'pres', label: "S'adresser à un auditoire" }
    ],
    descriptors: [
      { sub: 'mono', level: 'A2', text: "Peut décrire ou présenter simplement des gens, des conditions de vie, des activités quotidiennes." },
      { sub: 'mono', level: 'B1', text: "Peut faire une description directe et simple de sujets familiers variés dans le cadre de son domaine d'intérêt." },
      { sub: 'mono', level: 'B2', text: "Peut faire des descriptions claires et détaillées sur une gamme étendue de sujets en rapport avec son domaine d'intérêt." },
      { sub: 'argum', level: 'B1', text: "Peut développer une argumentation suffisamment pour être compris." },
      { sub: 'argum', level: 'B2', text: "Peut développer méthodiquement une argumentation en mettant en évidence les points significatifs et les éléments pertinents." },
      { sub: 'argum', level: 'C1', text: "Peut développer une argumentation claire et bien structurée." },
      { sub: 'ann', level: 'A2', text: "Peut faire de très brèves annonces préparées avec un contenu prévisible et appris." },
      { sub: 'ann', level: 'B1', text: "Peut faire de brèves annonces préparées sur un sujet proche de la vie quotidienne." },
      { sub: 'pres', level: 'A2', text: "Peut faire un exposé court et préparé sur un sujet familier." },
      { sub: 'pres', level: 'B1', text: "Peut faire un exposé simple et direct, préparé, sur un sujet familier." },
      { sub: 'pres', level: 'B2', text: "Peut faire un exposé clair, préparé, en avançant des raisons pour ou contre une opinion donnée." }
    ]
  },
  PE: {
    subcomps: [
      { id: 'creat', label: 'Écriture créative' },
      { id: 'essai', label: 'Essais et rapports' }
    ],
    descriptors: [
      { sub: 'creat', level: 'A2', text: "Peut écrire une suite de phrases et d'expressions simples sur sa famille, ses conditions de vie, sa formation, son travail actuel." },
      { sub: 'creat', level: 'B1', text: "Peut écrire des descriptions détaillées simples et directes sur une gamme étendue de sujets familiers." },
      { sub: 'creat', level: 'B2', text: "Peut écrire des descriptions claires et détaillées d'événements et d'expériences réels ou imaginaires." },
      { sub: 'essai', level: 'B1', text: "Peut écrire de courts essais simples sur des sujets d'intérêt général." },
      { sub: 'essai', level: 'B2', text: "Peut écrire un essai ou un rapport qui développe une argumentation." },
      { sub: 'essai', level: 'C1', text: "Peut écrire un exposé ou un rapport pour développer une argumentation de façon méthodique." }
    ]
  },
  IO: {
    subcomps: [
      { id: 'conv', label: 'Conversation' },
      { id: 'discuss', label: 'Discussion informelle/formelle' },
      { id: 'coop', label: 'Coopération à visée fonctionnelle' }
    ],
    descriptors: [
      { sub: 'conv', level: 'A2', text: "Peut établir un contact social : salutations, congé, présentations, remerciements." },
      { sub: 'conv', level: 'B1', text: "Peut aborder sans préparation une conversation sur un sujet familier." },
      { sub: 'conv', level: 'B2', text: "Peut participer activement à une conversation d'une certaine longueur sur la plupart des sujets d'intérêt général." },
      { sub: 'discuss', level: 'B1', text: "Peut exprimer poliment ses opinions, son accord et son désaccord." },
      { sub: 'discuss', level: 'B2', text: "Peut soutenir ses opinions dans une discussion en fournissant explications, arguments et commentaires." },
      { sub: 'discuss', level: 'C1', text: "Peut s'exprimer avec aisance et spontanéité, presque sans effort." },
      { sub: 'coop', level: 'A2', text: "Peut se débrouiller dans la plupart des situations susceptibles de se produire en réservant un voyage." },
      { sub: 'coop', level: 'B1', text: "Peut faire face à la majorité des situations dans la vie courante." }
    ]
  },
  IE: {
    subcomps: [
      { id: 'corr', label: 'Correspondance' },
      { id: 'notes', label: 'Notes, messages, formulaires' }
    ],
    descriptors: [
      { sub: 'corr', level: 'A2', text: "Peut écrire une lettre personnelle très simple, par exemple de remerciements." },
      { sub: 'corr', level: 'B1', text: "Peut écrire des lettres personnelles décrivant en détail expériences, sentiments et événements." },
      { sub: 'corr', level: 'B2', text: "Peut écrire des lettres exprimant différents degrés d'émotion et soulignant ce qui est important." },
      { sub: 'notes', level: 'A2', text: "Peut prendre un message bref et simple à condition de pouvoir faire répéter." },
      { sub: 'notes', level: 'B1', text: "Peut prendre un message comportant une demande d'explication ou expliquant un problème." }
    ]
  },
  MED: {
    subcomps: [
      { id: 'text', label: 'Médier un texte' },
      { id: 'concept', label: 'Médier des concepts' },
      { id: 'commun', label: 'Médier la communication' },
      { id: 'coop', label: 'Coopération' },
      { id: 'soutien', label: 'Soutien' },
      { id: 'culture', label: 'Médiation culturelle' },
      { id: 'langue', label: 'Médiation linguistique' }
    ],
    descriptors: [
      { sub: 'text', level: 'A2', text: "Peut transmettre l'essentiel de ce qui est dit dans des situations sociales courantes." },
      { sub: 'text', level: 'B1', text: "Peut résumer les points principaux de textes courts traitant de sujets familiers." },
      { sub: 'text', level: 'B2', text: "Peut résumer un texte source long et exigeant, sa structure et ses arguments." },
      { sub: 'concept', level: 'B1', text: "Peut collaborer avec des pairs pour réaliser une tâche commune." },
      { sub: 'concept', level: 'B2', text: "Peut faciliter le développement d'idées en posant des questions et en encourageant." },
      { sub: 'commun', level: 'B1', text: "Peut servir d'intermédiaire dans des situations simples et prévisibles." },
      { sub: 'coop', level: 'A2', text: "Peut coopérer dans des tâches pratiques simples en suivant des consignes." },
      { sub: 'coop', level: 'B1', text: "Peut coopérer dans des tâches communes, suivre les contributions et inviter les autres à participer." },
      { sub: 'coop', level: 'B2', text: "Peut diriger un échange en posant des questions et en clarifiant pour parvenir à un consensus." },
      { sub: 'soutien', level: 'A2', text: "Peut reconnaître quand un interlocuteur a des difficultés et reformuler simplement." },
      { sub: 'soutien', level: 'B1', text: "Peut encourager un interlocuteur à développer ses idées et l'aider à formuler ce qu'il veut dire." },
      { sub: 'soutien', level: 'B2', text: "Peut soutenir un interlocuteur en réagissant de manière empathique et en reformulant pour clarifier." },
      { sub: 'culture', level: 'A2', text: "Peut reconnaître des différences culturelles élémentaires entre sa propre culture et la culture cible." },
      { sub: 'culture', level: 'B1', text: "Peut expliquer des particularités culturelles à quelqu'un qui n'est pas familier de la culture cible." },
      { sub: 'culture', level: 'B2', text: "Peut servir d'intermédiaire culturel en explicitant des malentendus et des différences de perspective." },
      { sub: 'langue', level: 'A2', text: "Peut transmettre l'essentiel de courts messages oraux ou écrits sur des sujets familiers d'une langue à l'autre." },
      { sub: 'langue', level: 'B1', text: "Peut transmettre les informations principales d'un texte de la langue cible vers la langue de scolarisation et inversement." },
      { sub: 'langue', level: 'B2', text: "Peut traduire à l'oral comme à l'écrit des textes traitant de sujets variés en restituant le sens et le registre." }
    ]
  }
};

// SOUS-COMPÉTENCES PRAGMATIQUES (CECRL)
export const PRAG_SUBCOMPS = [
  { id: 'fluence', label: 'Aisance à l\'oral' },
  { id: 'prec', label: 'Précision' },
  { id: 'tour', label: 'Prise de parole / tour de parole' },
  { id: 'theme', label: 'Développement thématique' },
  { id: 'coh', label: 'Cohérence et cohésion' },
  { id: 'soup', label: 'Souplesse' }
];

export const PRAG_DESCRIPTORS = [
  { sub: 'fluence', level: 'A2', text: "Peut se faire comprendre dans un bref bavardage, bien que des pauses, des faux démarrages et des reformulations soient très évidents." },
  { sub: 'fluence', level: 'B1', text: "Peut s'exprimer avec une certaine aisance sur des sujets familiers." },
  { sub: 'fluence', level: 'B2', text: "Peut communiquer avec un degré d'aisance et de spontanéité qui rend une interaction régulière avec des locuteurs natifs possible sans tension." },
  { sub: 'fluence', level: 'C1', text: "Peut s'exprimer avec aisance et spontanéité, presque sans effort." },
  { sub: 'prec', level: 'B1', text: "Peut expliquer les points principaux d'une idée ou d'un problème avec une précision suffisante." },
  { sub: 'prec', level: 'B2', text: "Peut transmettre une information détaillée de manière fiable." },
  { sub: 'tour', level: 'A2', text: "Peut utiliser des techniques simples pour commencer, poursuivre et terminer une brève conversation." },
  { sub: 'tour', level: 'B1', text: "Peut intervenir dans une discussion sur un sujet familier en utilisant une expression appropriée pour prendre la parole." },
  { sub: 'tour', level: 'B2', text: "Peut intervenir de manière adéquate dans une discussion en utilisant les moyens d'expression appropriés." },
  { sub: 'theme', level: 'B1', text: "Peut développer une description ou un récit en une suite linéaire de points." },
  { sub: 'theme', level: 'B2', text: "Peut développer méthodiquement une description ou un récit clair." },
  { sub: 'coh', level: 'A2', text: "Peut relier des groupes de mots avec des connecteurs simples (et, mais, parce que)." },
  { sub: 'coh', level: 'B1', text: "Peut relier une série d'éléments courts, simples et distincts en un discours." },
  { sub: 'coh', level: 'B2', text: "Peut utiliser un nombre limité d'articulateurs pour relier ses phrases." },
  { sub: 'soup', level: 'B1', text: "Peut adapter son expression pour faire face à des situations moins courantes." },
  { sub: 'soup', level: 'B2', text: "Peut s'adapter aux changements de direction, de style et d'insistance dans une conversation." }
];

// POLICES (Bunny Fonts compatibles)
export const FONTS = [
  { value: "'Plus Jakarta Sans', sans-serif", label: 'Plus Jakarta Sans (défaut)' },
  { value: "'Inter', sans-serif", label: 'Inter' },
  { value: "'Lora', serif", label: 'Lora' },
  { value: "'Playfair Display', serif", label: 'Playfair Display' },
  { value: "'Merriweather', serif", label: 'Merriweather' },
  { value: "'Source Sans 3', sans-serif", label: 'Source Sans 3' },
  { value: "'Nunito', sans-serif", label: 'Nunito' },
  { value: "'Poppins', sans-serif", label: 'Poppins' },
  { value: "'Roboto', sans-serif", label: 'Roboto' },
  { value: "'Open Sans', sans-serif", label: 'Open Sans' },
  { value: "'Lato', sans-serif", label: 'Lato' },
  { value: "'Montserrat', sans-serif", label: 'Montserrat' },
  { value: "'Crimson Pro', serif", label: 'Crimson Pro' },
  { value: "'EB Garamond', serif", label: 'EB Garamond' },
  { value: "'PT Serif', serif", label: 'PT Serif' },
  { value: "'Patrick Hand', cursive", label: 'Patrick Hand (manuscrit)' },
  { value: "'Caveat', cursive", label: 'Caveat (manuscrit)' }
];
