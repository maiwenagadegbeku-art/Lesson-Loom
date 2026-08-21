// Grilles officielles d'évaluation — Source : grille BAC 2021 (NORME)
// Extraite intégralement de la PDF officielle (LVA/LVB · Première/Terminale)
// Barèmes : C2=30, C1=20, B2=10, B1=5, A2=3, A1=1 (idem pour les 3 grilles)

const NIVEAUX = ['C2', 'C1', 'B2', 'B1', 'A2', 'A1'];
const POINTS_PAR_NIVEAU = { C2: 30, C1: 20, B2: 10, B1: 5, A2: 3, A1: 1 };

// ─── COMPRÉHENSION (oral + écrit) — sur 90 pts (3 critères × 30 max)
const COMP_DESCRIPTORS = {
  ctx: { // Identification du contexte ou de la situation d'énonciation
    label: 'Identification du contexte / situation d\'énonciation',
    C2: 'Peut comprendre sans difficulté à de rares exceptions près les éléments relatifs au contexte et à la situation d\'énonciation.',
    C1: 'Peut identifier les détails fins ou l\'implicite tout en les replaçant dans le contexte.',
    B2: 'Peut identifier la richesse d\'un contexte ou d\'une situation d\'énonciation, y compris en relevant le cas échéant des éléments implicites.',
    B1: 'Peut relever des informations détaillées sur le contexte (objet, enjeux, perspective narrative, expériences relatées, etc.) et établir des liens entre elles.',
    A2: 'Peut relever des informations explicites sur le contexte (thème, lieux, personnes, événements, etc.).',
    A1: 'Peut relever des informations isolées simples et les articuler en partie les unes aux autres.'
  },
  sens: {
    label: 'Identification des réseaux de sens',
    C2: 'Peut comprendre sans difficulté, à de rares exceptions près, les réseaux de sens.',
    C1: 'Peut identifier et analyser la logique interne d\'un document ou dossier en distinguant le cas échéant ce qui est de l\'ordre de la digression.',
    B2: 'Peut identifier la cohérence globale d\'un document ou dossier : identifier les principales raisons pour ou contre une idée. Peut reconstituer une chronologie d\'événements dans un récit. Peut repérer des ruptures chronologiques.',
    B1: 'Peut relever l\'essentiel des éléments porteurs de sens d\'un document ou dossier. Peut reconstituer le plan général d\'un texte. Peut identifier des liens de causalité simples.',
    A2: 'Peut comprendre globalement un document ou dossier : identifier le sujet principal, regrouper des termes d\'un même champ lexical.',
    A1: 'Peut construire une amorce de compréhension en relevant des mots ou expressions.'
  },
  strat: {
    label: 'Identification des stratégies de communication',
    C2: 'Peut comprendre sans difficulté, à de rares exceptions près, les stratégies de communication.',
    C1: 'Peut identifier l\'articulation de documents. Peut identifier la tonalité d\'un propos (ironie, humour, stratégies interpersonnelles, etc.).',
    B2: 'Peut repérer une intention en distinguant l\'expression d\'un point de vue de l\'exposé de faits. Peut identifier des éléments implicites qui sous-tendent l\'articulation des documents entre eux.',
    B1: 'Peut identifier l\'expression de points de vue, souhaits et/ou perspectives. Peut identifier la nature de l\'articulation entre les documents (lien chronologique, illustratif, d\'opposition, etc.).',
    A2: 'Peut identifier la nature du (ou des) documents et la mettre en lien avec quelques éléments du contenu.',
    A1: 'Peut relever quelques données ou caractéristiques évidentes d\'un document (dates, titres, paragraphes, etc.).'
  }
};

// ─── EXPRESSION ÉCRITE — sur 120 pts (4 critères × 30 max)
const EE_DESCRIPTORS = {
  contenu: {
    label: 'Qualité du contenu',
    C2: 'Peut rendre de fines nuances de sens en rapport avec un sujet complexe.',
    C1: 'Peut traiter le sujet et produire un écrit fluide et convaincant, étayé par des éléments (inter)culturels pertinents.',
    B2: 'Peut traiter le sujet et produire un écrit clair, détaillé et globalement efficace, y compris en prenant appui sur certains éléments (inter)culturels pertinents.',
    B1: 'Peut traiter le sujet et produire un écrit intelligible et relativement développé, y compris en faisant référence à quelques éléments (inter)culturels.',
    A2: 'Peut traiter le sujet, même si la production est courte.',
    A1: 'Peut simplement amorcer une production écrite en lien avec le sujet.'
  },
  coherence: {
    label: 'Cohérence dans la construction du discours',
    C2: 'Peut produire un discours cohérent et construit sur un sujet complexe.',
    C1: 'Peut produire un récit ou une argumentation complexe en démontrant un usage maîtrisé de moyens linguistiques de structuration et d\'articulation.',
    B2: 'Peut produire un récit ou une argumentation en indiquant la relation entre les faits et les idées dans un texte bien structuré.',
    B1: 'Peut rendre compte d\'expériences en décrivant ses sentiments et réactions. Peut exposer et illustrer un point de vue. Peut raconter une histoire de manière cohérente.',
    A2: 'Peut exposer une expérience ou un point de vue en utilisant des connecteurs élémentaires.',
    A1: 'Peut énumérer des informations sur soi-même ou les autres.'
  },
  correction: {
    label: 'Correction de la langue écrite',
    C2: 'Peut rédiger avec un très haut degré de correction grammaticale, y compris en mobilisant des structures complexes sur un sujet complexe.',
    C1: 'Peut maintenir tout au long de sa rédaction un haut degré de correction grammaticale, y compris en mobilisant des structures complexes.',
    B2: 'Peut démontrer une bonne maîtrise des structures simples et courantes. Les erreurs sur les structures complexes ne donnent pas lieu à des malentendus.',
    B1: 'Peut démontrer une bonne maîtrise des structures simples et courantes. Les erreurs sur les structures simples ne gênent pas la lecture.',
    A2: 'Peut produire un texte immédiatement compréhensible malgré des erreurs fréquentes.',
    A1: 'Peut produire un texte globalement compréhensible mais dont la lecture est peu aisée.'
  },
  richesse: {
    label: 'Richesse de la langue',
    C2: 'Peut employer de manière pertinente un très vaste répertoire lexical incluant des expressions idiomatiques, des nuances de formulation et des structures variées même sur un sujet complexe.',
    C1: 'Peut employer de manière pertinente un vaste répertoire lexical incluant des expressions idiomatiques, des nuances de formulation et des structures variées.',
    B2: 'Peut produire un texte dont l\'étendue du lexique et des structures est suffisante pour permettre précision et variété des formulations.',
    B1: 'Peut produire un texte dont l\'étendue lexicale relative nécessite l\'usage de périphrases et de répétitions.',
    A2: 'Peut produire un texte dont les mots sont adaptés à l\'intention de communication, en dépit d\'un répertoire lexical limité.',
    A1: 'Peut produire un texte intelligible malgré un lexique très limité.'
  }
};

// ─── EXPRESSION ORALE — sur 120 pts (4 critères × 30 max)
const EO_DESCRIPTORS = {
  continu: {
    label: 'Expression orale en continu',
    C2: 'Peut rendre de fines nuances de sens en rapport avec un sujet complexe.',
    C1: 'Peut développer une argumentation complexe, fondée sur des aspects (inter)culturels, de manière synthétique et fluide tout en s\'assurant de sa bonne réception.',
    B2: 'Peut développer un point de vue pertinent et étayé, y compris par des reformulations qui ne rompent pas le fil du discours. Peut nuancer un propos en s\'appuyant sur des références (inter)culturelles.',
    B1: 'Peut exposer un point de vue de manière simple en l\'illustrant par des exemples et des références à des aspects (inter)culturels. Le discours est structuré.',
    A2: 'Peut exprimer un avis en termes simples. Le discours est bref et les éléments en sont juxtaposés.',
    A1: 'Peut exprimer un avis en termes très simples. Les énoncés sont ponctués de pauses, d\'hésitations et de faux démarrages.'
  },
  interaction: {
    label: 'Interaction orale',
    C2: 'Peut interagir avec aisance et spontanéité et contribuer habilement à la construction de l\'échange, y compris en exploitant des références (inter)culturelles et sur un sujet complexe.',
    C1: 'Peut interagir avec aisance et contribuer habilement à la construction de l\'échange, y compris en exploitant des références (inter)culturelles.',
    B2: 'Peut argumenter et chercher à convaincre. Peut réagir avec pertinence et relancer la discussion, y compris pour amener l\'échange sur un terrain familier ou sur celui des aspects (inter)culturels.',
    B1: 'Peut engager, soutenir et clore une conversation simple sur des sujets familiers. Peut faire référence à des aspects (inter)culturels.',
    A2: 'Peut répondre et réagir de manière simple.',
    A1: 'Peut intervenir simplement mais la communication repose sur la répétition et la reformulation.'
  },
  correctionO: {
    label: 'Correction de la langue orale',
    C2: 'Peut utiliser avec une bonne maîtrise tout l\'éventail des traits phonologiques de la langue cible, de façon à être toujours intelligible, même sur un sujet complexe.',
    C1: 'Peut utiliser avec une assez bonne maîtrise tout l\'éventail des traits phonologiques de la langue cible. Les rares erreurs de langue ne donnent pas lieu à des malentendus.',
    B2: 'L\'accent peut subir l\'influence d\'autres langues mais n\'entrave pas l\'intelligibilité. Les erreurs de langue ne donnent pas lieu à malentendu.',
    B1: 'Peut s\'exprimer de manière intelligible malgré l\'influence d\'autres langues. Bonne maîtrise des structures simples.',
    A2: 'Peut s\'exprimer de manière suffisamment claire pour être compris, mais la compréhension requiert un effort des interlocuteurs.',
    A1: 'Peut utiliser un répertoire très limité d\'expressions et de mots mémorisés de façon compréhensible.'
  },
  richesseO: {
    label: 'Richesse de la langue',
    C2: 'Peut employer de manière pertinente un vaste répertoire lexical incluant des expressions idiomatiques, des nuances de formulation et des structures variées même sur un sujet complexe.',
    C1: 'Peut employer de manière pertinente un vaste répertoire lexical incluant des expressions idiomatiques, des nuances de formulation et des structures variées.',
    B2: 'Peut produire un discours et des énoncés assez fluides dont l\'étendue du lexique est suffisante pour permettre précision et variété des formulations.',
    B1: 'Peut produire un discours et des énoncés dont l\'étendue lexicale relative nécessite l\'usage de périphrases et répétitions.',
    A2: 'Peut produire un discours et des énoncés dont les mots sont adaptés à l\'intention de communication, en dépit d\'un répertoire lexical limité.',
    A1: 'Peut produire des énoncés intelligibles malgré un lexique très limité.'
  }
};

// ─── LLCER (Spécialité Langues, Littératures et Cultures Étrangères et Régionales)
// 4 grilles distinctes : Expression Orale, Expression Écrite, Version, Transposition
// Source : grilles officielles Première & Terminale Spécialité LLCER (PDF 2026)

// Expression Orale (Première & Terminale)
const POINTS_LLCER = { C2: 35, C1: 30, B2: 20, B1: 10, A2: 5, A1: 1 };

const LLCER_DESCRIPTORS = {
  continu: {
    label: 'Expression orale en continu',
    C2: 'Peut développer une argumentation nuancée et exprimer une pensée subtile en rapport avec un sujet complexe.',
    C1: "Peut développer une argumentation solide, fondée sur des aspects (inter)culturels, de manière synthétique et fluide tout en s'assurant de sa bonne réception.",
    B2: "Peut développer une argumentation pertinente et assez étayée, y compris par des reformulations qui ne rompent pas le fil du discours. Peut nuancer un propos en s'appuyant sur des références (inter)culturelles.",
    B1: "Peut exposer un point de vue de manière simple en l'illustrant par des exemples et des références à des aspects (inter)culturels. Le discours est structuré (relations de causalité, comparaisons, etc.).",
    A2: 'Peut exprimer un avis en termes simples. Le discours est bref et les éléments en sont juxtaposés.',
    A1: "Peut exprimer un avis en termes très simples. Les énoncés sont ponctués de pauses, d'hésitations et de faux démarrages."
  },
  interaction: {
    label: 'Interaction orale',
    C2: "Peut interagir avec aisance et spontanéité et contribuer habilement à la construction de l'échange, y compris en exploitant des références (inter)culturelles et sur un sujet complexe.",
    C1: "Peut interagir avec aisance et contribuer habilement à la construction de l'échange, y compris en exploitant des références (inter)culturelles.",
    B2: "Peut argumenter et chercher à convaincre. Peut réagir avec pertinence et relancer la discussion, y compris pour amener l'échange sur un terrain familier ou sur celui des aspects (inter)culturels.",
    B1: 'Peut engager, soutenir et clore une conversation simple sur des sujets familiers. Peut faire référence à des aspects (inter)culturels.',
    A2: 'Peut répondre et réagir de manière simple.',
    A1: 'Peut intervenir simplement mais la communication repose sur la répétition et la reformulation.'
  },
  correction: {
    label: 'Correction de la langue orale',
    C2: "Peut utiliser avec une bonne maîtrise tout l'éventail des traits phonologiques de la langue cible, de façon à être toujours intelligible, même sur un sujet complexe.",
    C1: "Peut utiliser avec une assez bonne maîtrise tout l'éventail des traits phonologiques de la langue cible, de façon à être toujours intelligible. Les rares erreurs de langue ne donnent pas lieu à des malentendus.",
    B2: "L'accent peut subir l'influence d'autres langues mais n'entrave pas l'intelligibilité. Les erreurs de langue ne donnent pas lieu à malentendu.",
    B1: "Peut s'exprimer de manière intelligible malgré l'influence d'autres langues. Bonne maîtrise des structures simples.",
    A2: "Peut s'exprimer de manière suffisamment claire pour être compris mais la compréhension requiert un effort des interlocuteurs.",
    A1: "Peut utiliser un répertoire très limité d'expressions et de mots mémorisés, de façon compréhensible."
  },
  richesse: {
    label: 'Richesse de la langue',
    C2: 'Peut employer de manière pertinente un vaste répertoire lexical incluant des expressions idiomatiques, des nuances de formulation et des structures variées même sur un sujet complexe.',
    C1: 'Peut employer de manière pertinente un vaste répertoire lexical incluant des expressions idiomatiques, des nuances de formulation et des structures variées.',
    B2: "Peut produire un discours et des énoncés assez fluides dont l'étendue du lexique est suffisante pour permettre précision et variété des formulations.",
    B1: "Peut produire un discours et des énoncés dont l'étendue lexicale relative nécessite l'usage de périphrases et répétitions.",
    A2: "Peut produire un discours et des énoncés dont les mots sont adaptés à l'intention de communication, en dépit d'un répertoire lexical limité.",
    A1: 'Peut produire des énoncés intelligibles malgré un lexique pauvre.'
  }
};

// ─── Expression Écrite LLCER (Terminale)
// Barème : C2=35, C1=30, B2=20, B1=10, A2=5, A1=3 — Max 140 (4 critères × 35)
const POINTS_LLCER_EE = { C2: 35, C1: 30, B2: 20, B1: 10, A2: 5, A1: 3 };

const LLCER_EE_DESCRIPTORS = {
  contenu: {
    label: 'Qualité du contenu',
    C2: "Traite le sujet avec finesse en exploitant les nuances et la complexité des enjeux (inter)culturels du dossier.",
    C1: "Traite le sujet avec pertinence à partir d'une compréhension fine des enjeux (inter)culturels du dossier.",
    B2: "Traite le sujet de manière généralement pertinente à partir d'une compréhension satisfaisante des enjeux (inter)culturels du dossier.",
    B1: "Traite généralement le sujet avec pertinence à partir de la compréhension des principaux enjeux (inter)culturels du dossier.",
    A2: 'Traite certains aspects du sujet, en restant éventuellement superficiel.',
    A1: 'Amorce simplement une production écrite en rapport avec le sujet.'
  },
  coherence: {
    label: 'Cohérence du discours',
    C2: "Produit un texte finement structuré et nuancé montrant une cohérence interne.",
    C1: "Produit un texte nuancé et nettement structuré montrant une cohérence d'ensemble par le recours à des outils linguistiques adaptés.",
    B2: 'Produit un texte structuré qui met en évidence les principaux réseaux sémantiques entre les documents.',
    B1: 'Produit un texte globalement structuré qui met en évidence les principales idées du dossier.',
    A2: 'Produit un texte immédiatement compréhensible malgré des erreurs fréquentes.',
    A1: 'Produit un texte globalement compréhensible mais peu lisible.'
  },
  correction: {
    label: 'Correction de la langue écrite',
    C2: 'Écrit avec un haut degré de correction grammaticale, y compris en utilisant des structures complexes.',
    C1: "Conserve tout au long du texte un haut degré de correction grammaticale, y compris dans l'utilisation de structures complexes.",
    B2: 'Démontre une bonne maîtrise des structures simples et courantes ; des erreurs sur des structures complexes ne nuisent pas à la compréhension.',
    B1: 'Démontre une bonne maîtrise des structures simples et courantes ; des erreurs sur des structures simples ne nuisent pas à la lecture.',
    A2: 'Démontre une bonne maîtrise des structures simples et courantes ; des erreurs sur des structures simples ne nuisent pas à la lecture.',
    A1: 'Produit un texte globalement compréhensible mais difficile à lire.'
  },
  richesse: {
    label: 'Richesse de la langue',
    C2: 'Emploie un vaste répertoire lexical incluant des expressions idiomatiques, des nuances de formulation et des structures variées, même sur un sujet complexe.',
    C1: 'Emploie un vaste répertoire lexical incluant des expressions idiomatiques, des nuances de formulation et des structures variées.',
    B2: "Produit un texte dont l'étendue du lexique est suffisante pour permettre précision et variété des formulations.",
    B1: "Produit un texte dont le vocabulaire et les structures sont suffisants pour permettre précision et variété.",
    A2: "Produit un texte dont l'étendue lexicale nécessite l'usage de périphrases et de répétitions.",
    A1: 'Produit des énoncés dont les mots sont adaptés à l\'intention de communication malgré un répertoire lexical limité.'
  }
};

// ─── Version LLCER (Terminale) — Traduction LV → français, sur 10 pts
// Convertie en /4 à la fin (×0.4). Un seul critère "Qualité de la traduction".
const POINTS_LLCER_VERS = { C2: 10, C1: 8, B2: 6, B1: 4, A2: 2, A1: 1 };
const LLCER_VERS_DESCRIPTORS = {
  traduction: {
    label: 'Qualité de la traduction',
    C2: 'Traduction précise et fine rendant habilement les spécificités stylistiques.',
    C1: "Traduction fidèle, même si l'influence du document d'origine se ressent.",
    B2: 'Traduction claire mais qui colle encore trop au texte source.',
    B1: 'Traduction approximative mais compréhensible malgré quelques imprécisions.',
    A2: 'Langue simple pour une traduction approximative, compréhensible malgré des erreurs.',
    A1: 'Traduction de mots et expressions simples.'
  }
};

// ─── Transposition LLCER (Terminale) — Synthèse / restitution, sur 10 pts → /4
const POINTS_LLCER_TRANS = { C2: 10, C1: 8, B2: 6, B1: 4, A2: 2, A1: 1 };
const LLCER_TRANS_DESCRIPTORS = {
  transposition: {
    label: 'Qualité de la transposition',
    C2: "Transpose avec précision et finesse le contenu (informations, arguments, points de vue, nuances) en attirant l'attention sur l'implicite ou le ton.",
    C1: 'Transpose le contenu (informations, arguments, points de vue) dans une langue appropriée, restituant sa complexité et ses nuances.',
    B2: "Transpose l'essentiel du contenu dans une langue appropriée, restituant les informations, arguments ou points de vue exprimés.",
    B1: 'Transpose les points essentiels (informations, arguments, points de vue) dans une langue globalement appropriée et avec un vocabulaire raisonnablement précis.',
    A2: "Extrait des informations importantes et les exprime dans une langue simple, avec un vocabulaire courant. La transposition est compréhensible malgré des erreurs.",
    A1: "Extrait quelques informations et les exprime dans une langue simple. La transposition n'est que partiellement compréhensible ou exacte."
  }
};

export const GRILLES_OFFICIELLES = {
  COMP:        { id: 'COMP',        label: 'Compréhension (CO/CE)', maxPts: 90, criteres: COMP_DESCRIPTORS, points: POINTS_PAR_NIVEAU },
  EE:          { id: 'EE',          label: 'Expression écrite (EE)', maxPts: 120, criteres: EE_DESCRIPTORS, points: POINTS_PAR_NIVEAU },
  EO:          { id: 'EO',          label: 'Expression orale (EOC/EOI)', maxPts: 120, criteres: EO_DESCRIPTORS, points: POINTS_PAR_NIVEAU },
  LLCER:       { id: 'LLCER',       label: 'LLCER — Expression orale', maxPts: 140, criteres: LLCER_DESCRIPTORS, points: POINTS_LLCER, specialite: true, llcer: true },
  LLCER_EE:    { id: 'LLCER_EE',    label: 'LLCER — Expression écrite', maxPts: 140, criteres: LLCER_EE_DESCRIPTORS, points: POINTS_LLCER_EE, specialite: true, llcer: true },
  LLCER_VERS:  { id: 'LLCER_VERS',  label: 'LLCER — Version (LV → FR)', maxPts: 10, criteres: LLCER_VERS_DESCRIPTORS, points: POINTS_LLCER_VERS, specialite: true, llcer: true, hint: 'Note finale sur 4 (×0.4)' },
  LLCER_TRANS: { id: 'LLCER_TRANS', label: 'LLCER — Transposition', maxPts: 10, criteres: LLCER_TRANS_DESCRIPTORS, points: POINTS_LLCER_TRANS, specialite: true, llcer: true, hint: 'Note finale sur 4 (×0.4)' }
};

export const NIVEAUX_OFF = NIVEAUX;
export const POINTS_OFF = POINTS_PAR_NIVEAU;

// ─── Tables de conversion (extraites de la PDF officielle)
// Chaque entrée : [scoreMax, noteMax, label] — on prend la 1ère où score ≤ scoreMax
// Compréhension Première
const CONV_COMP_PREM_LVA = [[2,1,'A1'],[8,5,'A2'],[14,10,'B1'],[20,14,'B2'],[24,17,'C1'],[29,19,'C2'],[90,20,'C2']];
const CONV_COMP_PREM_LVB = [[1,0,'A1'],[2,2,'A1/A2'],[4,4,'A2'],[6,6,'A2/B1'],[8,8,'B1'],[10,10,'B1+'],[90,11,'B2+']];
const CONV_COMP_TERM_LVA = CONV_COMP_PREM_LVA;
const CONV_COMP_TERM_LVB = [[1,0,'A1'],[3,3,'A1/A2'],[6,6,'A2'],[9,9,'A2/B1'],[11,11,'B1'],[13,13,'B1+'],[90,14,'B2']];
// Expression Première
const CONV_EXPR_PREM_LVA = [[3,1,'A1'],[11,5,'A1/A2'],[14,7,'A2'],[17,9,'A2/B1'],[19,11,'B1'],[29,14,'B1+'],[120,20,'B2']];
const CONV_EXPR_PREM_LVB = [[3,1,'A1'],[7,7,'A1/A2'],[9,9,'A2'],[11,11,'A2'],[15,15,'A2/B1'],[19,19,'A2/B1+'],[120,20,'B1']];
// Expression Terminale
const CONV_EXPR_TERM_LVA = [[8,3,'A1'],[14,6,'A2'],[21,9,'B1'],[27,11,'B1+'],[34,14,'B2'],[39,17,'B2+'],[120,20,'C1/C2']];
const CONV_EXPR_TERM_LVB = [[5,1,'A1'],[8,8,'A2'],[12,12,'A2'],[15,15,'A2+'],[17,17,'A2+/B1'],[19,19,'B1'],[120,20,'B1+']];

// LLCER (Spécialité) — Première & Terminale — table de conversion linéaire
// Score brut /140 → note /20 par paliers de 7 pts (cf. PDF officiel).
// Le niveau visé est indicatif et basé sur l'ensemble des critères.
const CONV_LLCER_PREM = [
  [4,0,'<A1'],[19,1,'A1'],[29,2,'A1'],[39,3,'A1'],[49,4,'A1'],
  [59,5,'A2'],[69,6,'A2'],[79,7,'A2'],[89,8,'B1'],[99,9,'B1'],
  [109,10,'B1'],[119,11,'B1'],[129,12,'B2'],[139,13,'B2'],[149,14,'B2'],
  [159,15,'B2'],[169,16,'C1'],[179,17,'C1'],[189,18,'C1'],[199,19,'C2'],[1000,20,'C2']
];
const CONV_LLCER_TERM = CONV_LLCER_PREM; // même barème pour Terminale

// LLCER Version & Transposition — sur 10 → note /4 (×0.4) selon le niveau atteint global
const CONV_LLCER_FOURFOLD = [
  [1,0.4,'A1'],[2,0.8,'A1/A2'],[3,1.2,'A2'],[4,1.6,'A2/B1'],
  [5,2.0,'B1'],[6,2.4,'B1/B2'],[7,2.8,'B2'],[8,3.2,'B2/C1'],
  [9,3.6,'C1'],[10,4.0,'C2']
];

const CONV_TABLE = {
  COMP:        { Seconde: { LVA: CONV_COMP_PREM_LVA, LVB: CONV_COMP_PREM_LVA }, Première: { LVA: CONV_COMP_PREM_LVA, LVB: CONV_COMP_PREM_LVB }, Terminale: { LVA: CONV_COMP_TERM_LVA, LVB: CONV_COMP_TERM_LVB } },
  EE:          { Seconde: { LVA: CONV_EXPR_PREM_LVA, LVB: CONV_EXPR_PREM_LVA }, Première: { LVA: CONV_EXPR_PREM_LVA, LVB: CONV_EXPR_PREM_LVB }, Terminale: { LVA: CONV_EXPR_TERM_LVA, LVB: CONV_EXPR_TERM_LVB } },
  EO:          { Seconde: { LVA: CONV_EXPR_PREM_LVA, LVB: CONV_EXPR_PREM_LVA }, Première: { LVA: CONV_EXPR_PREM_LVA, LVB: CONV_EXPR_PREM_LVB }, Terminale: { LVA: CONV_EXPR_TERM_LVA, LVB: CONV_EXPR_TERM_LVB } },
  LLCER:       { Seconde: { LVA: CONV_LLCER_PREM, LVB: CONV_LLCER_PREM }, Première: { LVA: CONV_LLCER_PREM, LVB: CONV_LLCER_PREM }, Terminale: { LVA: CONV_LLCER_TERM, LVB: CONV_LLCER_TERM } },
  LLCER_EE:    { Seconde: { LVA: CONV_LLCER_PREM, LVB: CONV_LLCER_PREM }, Première: { LVA: CONV_LLCER_PREM, LVB: CONV_LLCER_PREM }, Terminale: { LVA: CONV_LLCER_TERM, LVB: CONV_LLCER_TERM } },
  LLCER_VERS:  { Seconde: { LVA: CONV_LLCER_FOURFOLD, LVB: CONV_LLCER_FOURFOLD }, Première: { LVA: CONV_LLCER_FOURFOLD, LVB: CONV_LLCER_FOURFOLD }, Terminale: { LVA: CONV_LLCER_FOURFOLD, LVB: CONV_LLCER_FOURFOLD } },
  LLCER_TRANS: { Seconde: { LVA: CONV_LLCER_FOURFOLD, LVB: CONV_LLCER_FOURFOLD }, Première: { LVA: CONV_LLCER_FOURFOLD, LVB: CONV_LLCER_FOURFOLD }, Terminale: { LVA: CONV_LLCER_FOURFOLD, LVB: CONV_LLCER_FOURFOLD } }
};

// Parse une saisie de points : "4", "4-5", "4 ou 5", "4 / 5" → on prend toujours le MAX
// (le prof saisit double valeur quand il hésite entre 2 niveaux ; on retient le plus haut).
// Note : on ne capture PAS le signe '-' en préfixe (sinon "4-5" serait parsé en [4, -5]
// à cause du tiret de plage interprété comme un moins). Les scores sont toujours ≥ 0.
export const parsePoints = (raw) => {
  if (raw == null || raw === '') return null;
  const matches = String(raw).match(/\d+(?:[.,]\d+)?/g);
  if (!matches || matches.length === 0) return null;
  const nums = matches.map(m => parseFloat(m.replace(',', '.'))).filter(n => !isNaN(n));
  if (nums.length === 0) return null;
  return Math.max(...nums);
};

// Score réel = somme des points cochés (max si double valeur)
export const computeScore = (cells) => {
  let sum = 0;
  Object.values(cells || {}).forEach(cell => {
    const p = parsePoints(cell.points);
    if (p != null) sum += p;
  });
  return sum;
};

// Max théorique adaptatif : pour chaque colonne, on prend les points de la cellule la plus haute remplie
// (= le niveau le + élevé que le prof a effectivement intégré dans sa grille).
// `rowsOrdered` est tableau des niveaux dans l'ordre de la grille (ex: ['C2','C1','B2','B1','A2','A1'])
// `nCols` est le nombre de colonnes (critères).
export const computeAdaptiveMax = (cells, rowsOrdered, nCols) => {
  let max = 0;
  for (let c = 0; c < nCols; c++) {
    let colMax = 0;
    for (let r = 0; r < rowsOrdered.length; r++) {
      const cell = cells?.[`${r}_${c}`] || {};
      if (!cell.text || cell.text.trim() === '') continue;
      const p = parsePoints(cell.points);
      if (p != null && p > colMax) colMax = p;
    }
    max += colMax;
  }
  return max;
};

// Niveau visé = le niveau du critère le plus haut effectivement présent
// (parmi ceux ayant du contenu).
export const computeTargetLevel = (cells, rowsOrdered, nCols) => {
  // On cherche la ligne la plus haute (= index le + petit dans rowsOrdered)
  // qui a au moins une cellule remplie sur toutes les colonnes.
  for (let r = 0; r < rowsOrdered.length; r++) {
    let hasContent = false;
    for (let c = 0; c < nCols; c++) {
      const cell = cells?.[`${r}_${c}`] || {};
      if (cell.text && cell.text.trim()) { hasContent = true; break; }
    }
    if (hasContent) return rowsOrdered[r];
  }
  return null;
};

// Convertit un score brut → { note/20, niveau } selon grille + classe + langue.
// Note : la note peut dépasser 20/20 (max(20) n'est PAS appliqué) si le score
// + bonus dépassent le totalPoints (le prof attribue parfois un bonus généreux).
export const convertirNote = (grilleId, points, classe = 'Première', langue = 'LVA', totalPoints = null) => {
  if (points == null || isNaN(points)) return { note: null, niveau: '—' };

  // Si un totalPoints est fourni (= "Total sur" saisi par le prof),
  // la conversion est une simple proportion sur 20 (logique unifiée pour
  // toutes les grilles, officielles ou personnalisées).
  if (totalPoints && totalPoints > 0) {
    const note = Math.round((points / totalPoints) * 20 * 100) / 100;
    return { note, niveau: null, proportional: true };
  }

  // Sinon, fallback sur les tables de conversion BAC officielles (PDF).
  const table = CONV_TABLE[grilleId]?.[classe]?.[langue];
  if (!table) return { note: null, niveau: '—' };
  for (const [max, note, niveau] of table) {
    if (points <= max) return { note, niveau };
  }
  return { note: 20, niveau: 'C2' };
};

// Découpe un descripteur multi-phrases en phrases individuelles "Peut..."
// Garde les points finaux. Robuste aux variations de ponctuation.
export const splitDescriptor = (text) => {
  if (!text) return [];
  // Sépare sur ". " mais réassemble "etc." et abréviations courantes
  const raw = String(text)
    .replace(/etc\./g, 'etc##') // protège
    .replace(/(\bex\.)/gi, 'ex##')
    .split(/(?<=\.)\s+/)
    .map(s => s.replace(/##/g, '.').trim())
    .filter(s => s.length > 0);
  return raw;
};
