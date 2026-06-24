# 🌟 Lesson Loom

**Outil de planification pédagogique pour les enseignants d'anglais LV1 — collège & lycée**

Application standalone (un seul fichier HTML) qui fonctionne directement dans le navigateur, sans installation, sans serveur, sans compte. Toutes les données restent sur votre ordinateur.

---

## Prérequis

- Un navigateur moderne (Chrome, Firefox, Edge)
- Aucune installation — double-clic sur `lesson-loom-modified.html` pour ouvrir

---

## Découvrir l'application

Au premier lancement, le **guide de démarrage** s'affiche automatiquement (5 slides). Il reste accessible à tout moment via le bouton ✨ dans le bandeau.

Le bouton **✨ Démo** lance un **tour guidé interactif en 19 étapes** avec spotlight sur chaque fonctionnalité, et ouvre automatiquement une séquence de démonstration (*Fairy Tales Revisited*, 2NDE B1+) pour les étapes nécessitant un exemple concret.

---

## Navigation

Six onglets principaux dans la barre de navigation :

| Onglet | Contenu |
|--------|---------|
| 📝 Séquences | Liste et éditeur de séquences didactiques |
| 🎓 Séances | Éditeur de séance avec aperçu A4 en temps réel |
| 📈 Progression | Plan annuel par niveau de classe |
| 📅 Calendrier | Calendrier scolaire annuel |
| 📊 Évaluations | Toutes les grilles, toutes séquences confondues |
| 📚 Bibliothèque | Séances flash, sorties, grilles favorites, statistiques |

---

## Fonctionnalités détaillées

### 📝 Séquences

Chaque séquence contient :
- Titre, niveau, année scolaire, couleur personnalisée
- Axe culturel et problématique
- Objectif culturel
- Compétences langagières CECRL ciblées (tags lexique, grammaire, phonologie, tâche…)
- Liste de séances (réordonnables, duplicables, copiables vers une autre séquence)
- Grilles d'évaluation associées

**Niveaux disponibles** : 6ème à 3ème, Seconde LV A/B/C, Première LV A/B/C, Terminale LV A/B/C, AMC, LLCER, Seconde/Première/Terminale génériques.

---

### 🎓 Séances

L'éditeur de séance comprend :
- Titre, durée, objectif principal
- Supports avec liens cliquables (Drive, YouTube, etc.)
- Objectifs lexicaux, grammaticaux et phonologiques (tags CECRL)
- Activités langagières (compétences visées)
- Activités chronométrées (le total se calcule automatiquement)
- Trace écrite (éditeur riche)
- Devoirs
- Champ Classe (affiché sur l'aperçu A4)

**Aperçu A4 en temps réel** — mis à jour à chaque modification, imprimable directement depuis le navigateur.

**Ticks de réemploi** — marquez les objectifs hérités d'une séance précédente pour suivre leur réemploi au fil de la séquence.

**Modèles d'activités** — sauvegardez vos activités récurrentes en favoris ⭐ pour les réutiliser rapidement.

#### Export d'une séance

Depuis le menu **Exporter** d'une séance :
- 🖨️ **PDF** — via l'impression navigateur
- 📄 **RTF** — compatible Word ET LibreOffice
- ⚡ **Copier pour QuizLoom** — ouvre un sélecteur pour choisir 1, plusieurs ou toutes les séances de la séquence. Le texte est copié dans le presse-papier, prêt à être collé dans QuizLoom.

---

### 📋 Grilles d'évaluation

Deux types de grilles par séquence :

**Grilles CECRL** — descripteurs *"I can…"* par compétence et niveau. Pré-remplissage automatique des cellules vides selon le niveau de chaque ligne.

**Grilles critères/points** — critères libres avec points par critère et par niveau.

- Marquez vos grilles ⭐ pour les retrouver dans vos favoris
- Ouvrez une grille en HTML dans un nouvel onglet (distribution aux élèves ou impression)
- Créez des grilles indépendantes (sans séquence) depuis la Bibliothèque

---

### 📈 Progression

Regroupez vos séquences dans un plan annuel par niveau de classe. Visualisez l'équilibre de votre programme sur l'année scolaire.

---

### 📅 Calendrier

- Visualisation hebdomadaire de l'année scolaire
- Vacances scolaires et jours fériés intégrés
- Placement de séquences sur des semaines
- Ajout de sorties et voyages scolaires (depuis le calendrier ou la Bibliothèque)
- Cliquez un événement pour le modifier ou le supprimer

---

### 📊 Évaluations

Centralisez toutes vos grilles, toutes séquences confondues. Distribuez-les directement sous forme de fichier HTML aux élèves ou pour impression.

---

### 📚 Bibliothèque

- **⚡ Séances flash** — idées de séances réutilisables, indépendantes de toute séquence. Importez-les dans une séquence avec 📥.
- **🚌 Sorties & voyages scolaires** — listez et gérez vos sorties
- **⭐ Grilles favorites** — retrouvez les grilles marquées d'une étoile
- **📊 Statistiques CECRL** — vue globale de vos objectifs langagiers
- **Comparatif manuels** — notes et comparatifs de manuels

---

### 📖 Programmes EN

Bouton dans le bandeau — accès au référentiel anglais complet, consultable et téléchargeable sans quitter l'application :
- **Grammaire** — par niveau (6ème → Terminale LLCER)
- **Phonologie** — par niveau (6ème → Terminale LLCER)
- **Programmes officiels** — axes et thèmes par niveau

---

### 📅 EDT (Emploi du Temps)

Bouton **📅 EDT** dans le bandeau — grille hebdomadaire personnalisable :
- Créneaux libres sur la plage 8h–18h
- Nom de classe et couleur par créneau
- Stocké localement, accessible à tout moment

---

### 💾 Sauvegarde & Restauration

Bouton **💾** dans le bandeau — deux formats :

| Format | Usage |
|--------|-------|
| **JSON** | Fichier léger contenant uniquement les données (séquences, séances, grilles, etc.) |
| **HTML complet** | L'application entière avec toutes les données — ouvrable sur n'importe quel ordinateur |

> ⚠️ Les données sont stockées dans le navigateur (localStorage). Sauvegardez régulièrement, notamment avant de vider le cache ou changer de navigateur.

---

## Intégration avec QuizLoom

**QuizLoom** est l'outil compagnon pour générer des QCM Pronote à partir des séances Lesson Loom.

Depuis Lesson Loom : **Exporter → ⚡ Copier pour QuizLoom** → sélectionnez les séances → collez dans QuizLoom → générez le prompt → collez dans Claude.ai → récupérez le XML → importez dans Pronote.

---

## Données & vie privée

- Toutes les données sont stockées **localement** dans votre navigateur (localStorage)
- Aucune donnée n'est envoyée à un serveur
- Aucun compte requis
- Fonctionne hors ligne (après premier chargement)

---

## Licence et auteure

Outil pédagogique personnel — usage non commercial.

🌟 **Lesson Loom** — Développé pour les enseignants d'anglais LV1 dans le secondaire français.
Dérivé de [Le Séquenceur LV](https://github.com/charlirollo/sequenceur-lv) par Charlie Rollo (AGPLv3).

© Juin 2026 [Maïwena Gadegbeku](mailto:maiwena.gadegbeku@ac-rennes.fr)
