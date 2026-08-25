# Extensions de Lesson Loom

**Inventaire de ce qui a été conçu et développé par Maïwena Gadegbeku, à partir
du noyau du *Séquenceur LV* de Charlie Rollo (AGPLv3).**

Lesson Loom conserve le noyau du Séquenceur LV. Ce document recense, volet par
volet, ce qui a été ajouté entre le 12 juin et le 24 août 2026.

Chaque ligne correspond à un lot livré, testé et validé. Les mémoires de projet
consignent pour chacun son diagnostic, son banc d'essai et sa variation de taille.

**Fichier de référence :** 5 157 088 octets · cœur compilé React : 32 retouches,
dont deux portant uniquement sur des données · 24 blocs autonomes ajoutés en fin
de fichier.

---

## Ce qui vient du Séquenceur LV

Ce qui préexiste et a été conservé : l'éditeur de séquence et son aperçu A4,
l'éditeur de séance et ses objectifs hérités, le référentiel CECRL et ses
descripteurs officiels, la progression annuelle, le calendrier scolaire avec ses
vacances et ses jours fériés, la sauvegarde et la restauration des données, les
exports PDF, Word et Markdown, le tour guidé, et le principe du fichier HTML
autonome à stockage local.

Tout ce qui suit a été ajouté.

---

## Les grands ensembles

Avant le détail volet par volet, les neuf ensembles principaux.

### Les classes et l'emploi du temps

La notion même de classe : nom, niveau, couleur, créneaux réels, demi-groupes,
semaines A et B. Import de l'emploi du temps depuis Pronote au format `.ics`, ou
saisie à la main. Les créneaux saisis à la main sont protégés au réimport.

### Le placement calculé des séances

Poser les séances d'une séquence sur les créneaux réels d'une classe : vacances
et jours fériés sautés, semaines A et B respectées, demi-groupes pris en compte.
Le calendrier affiche ensuite les séquences d'une classe donnée — nom en tête de
pastille, liseré de sa couleur, infobulle. **La vue Semaine** a été ajoutée à côté
des vues Mois et Année. Et l'impression du calendrier par classe, en grille ou en
liste.

### Les grilles d'évaluation

Un ensemble complet : **création libre d'une grille**, grilles par
critères ou par niveaux CECRL, barème et conversion sur 20, grilles officielles du
baccalauréat, grille LLCER, marqueurs de positionnement, **analyse de cohérence de
la grille**. Et surtout la **distribution aux élèves** — un fichier remis à chacun,
où les notes se remplissent à partir des grilles de la séquence.

### Le suivi et le réemploi des objectifs

La couverture des objectifs au sein d'une séquence. Le bilan des objectifs, sur
deux colonnes au-delà de dix, avec compteur par catégorie, mention « jamais
travaillé », et une fraction **confirmé / prévu** plutôt qu'un simple compte de
coches. Les descripteurs recliquables : un clic inscrit, un second retire, et ce
qui arrive dans une séance remonte dans la fiche de sa séquence.

### La bibliothèque

Neuf comparatifs de manuels d'anglais — collège, lycée, spécialité LLCER, voie
technologique. Une réserve de ce qui se réemploie d'une séquence à l'autre :
**supports et images**, **stratégies**, activités favorites et grilles mises de
côté, avec fenêtre de choix, aperçu et recherche — chacun s'importe directement
dans une séquence. Notes d'avancement par séquence. Statistiques pédagogiques.
Corbeille qui restaure aussi la progression et le calendrier. Archivage par année
scolaire.

### Les séances flash

Un espace pour ce qui ne rentre pas dans une séquence : une idée notée devient une
vraie séance, et peut ensuite être intégrée à une séquence. À côté, la **copie
d'une séance vers une autre séquence**, et un **bloc-notes permanent** dans le
bandeau du haut, qui suit d'un onglet à l'autre.

Les séquences reçoivent également une **couleur personnalisée**, qui les rend
reconnaissables dans le calendrier comme dans la bibliothèque.

### La sauvegarde étendue

La sauvegarde d'origine emportait la réserve principale. Elle emporte désormais
tout ce que les extensions ont ajouté : classes, emploi du temps, coches
d'objectifs, listes d'élèves, corbeille, bloc-notes, vacances saisies à la main.
En fichier `.json` ou en fichier HTML de secours. Avec un filet de sécurité : si
la mémoire du navigateur sature, un bandeau prévient et propose un téléchargement
de secours, au lieu d'échouer en silence.

### Un fichier que l'on possède

Lesson Loom se télécharge : le fichier se garde sur son ordinateur ou sur une clé,
et s'ouvre sans passer par une adresse. Il fonctionne dans un établissement au
réseau filtré, et il reste disponible même si le site qui l'a distribué disparaît.

### Les documents produits

La fiche de séquence est organisée en tableaux par **composantes du CECRL** —
linguistique, pragmatique, sociolinguistique, culturelle —, avec les étapes du
projet en cartes distinguant tâche intermédiaire et tâche finale, et une ligne de
synthèse en pied de page.

La fiche de séance porte les activités en cartes numérotées, avec leur durée et le
total en en-tête.

La progression annuelle s'ouvre sur un tableau de synthèse — axe, compétences et
leur palier, tâches, nombre de séances —, suivi de la **couverture annuelle
chiffrée** par catégorie d'objectifs, du détail de chaque séquence, et du **bilan
de réemploi** : chaque objectif, son nombre de réemplois, et les séances où il est
prévu ou effectivement traité.

Les impressions PDF, ainsi que les exports Word et RTF, reprennent cette
organisation plutôt qu'un texte au fil.

---

## Volet 1 — fondations et sécurité des données

| Lot | Objet |
|---|---|
| 1 | Filet de sécurité du stockage : bandeau rouge et sauvegarde de secours |
| 2 | Plus rien n'est calculé deux fois |
| 3 | Import de séquence partagée : liens tâche ↔ grille réécrits |
| 4 | Jauge d'espace complète ; corbeille qui restaure progression et calendrier |
| 6A | Barre de mise en forme : les boutons ne volent plus le focus |
| 6B | Anti-débordement de l'aperçu A4 |
| 7 | Le contenu de l'éditeur ne disparaît plus au retour sur la page |
| 8 | Puces et numéros rendus aux listes |
| 10 | Gardes de contexte sur les badges de tâche et la grille de l'aperçu |
| 11 | Inventaire du nettoyage immédiat ; distinction des deux éditeurs |

## Volet 2 — cohérence et propreté

Cinq blocs de code mort retirés. Panneau « ✅ Cocher les objectifs » mis à jour
dans la même séance. Couverture et Cohérence sans plafond. Quarante-quatre boîtes
système remplacées par un bandeau. Quarante-quatre couleurs remises à leur nom
officiel. Vouvoiement unifié. Tour guidé : étape fantôme supprimée, sortie propre,
cadre qui suit sa cible. Calendrier qui ne déborde plus, sélecteur de couleur sans
saut, vue Semaine et vue Année corrigées — dont **un décalage d'un jour**.

## Volet 3 — pédagogie et réemploi

| Lot | Objet |
|---|---|
| 24 · 24 bis | Grille favorite : la bonne destination, sans écraser une copie périmée |
| 25 · 26 | Activités favorites : insertion réelle, fenêtre de choix avec aperçu et recherche |
| **29** | **Neuf comparatifs de manuels** en trois rangées nommées |
| 31 v2 · 32 | 🌱 **Développer en séance** : une idée flash devient une vraie séance |
| 34b | Carte ⚡ Séances Flash retirée du nettoyage ; niveaux inconnus lisibles |
| 39 | Flèches ↑ ↓ sur les blocs d'activité |
| 40 · 43 · 44 | **Le bilan des objectifs** : deux colonnes, compteur, « jamais travaillé », fraction confirmé / prévu |
| 41 · 42 | Le bouton 📋 Liste remonte à la séquence mère |
| **48** | **📌 À faire** : note d'avancement par séquence, dans la Bibliothèque |
| 49–51 | 🪄 Lesson Loom sur les documents imprimés |

## Volet 4 — les groupes de lexique

| Lot | Objet |
|---|---|
| 52 | Un seul bloc « Couleur de la séquence », au bon endroit |
| **53 · 53 bis** | **Les groupes de lexique** : créer, nommer, renommer, ranger, supprimer ; un mot peut appartenir à deux groupes |
| 54 · 55 | Les groupes s'affichent partout de la même façon : écran, A4, Word/RTF, Markdown, sauvegarde |
| 56 | Groupes cliquables dans l'éditeur de séance : un clic verse le groupe dans le lexique |
| 57 bis · 58 | 📌 Notes dans l'éditeur ; « À faire » réduit aux séquences annotées |

## Volet 5 — les classes, l'emploi du temps, la sauvegarde

| Lot | Objet |
|---|---|
| **61 → ter** | 👥 **Mes classes** et l'import Pronote `.ics` : nom, niveau, couleur, créneaux, demi-groupes, semaines A/B |
| 62 | L'emploi du temps connaît les classes ; un créneau déplacé garde son rattachement |
| 63 · 63 bis | Placer une séquence **pour une classe** ; niveaux masqués écartés |
| 64 → ter | **La classe se voit sur le calendrier**, en vue Mois et en vue Semaine |
| **65 → 68 v7** | **La sauvegarde emporte aussi les classes et l'emploi du temps** ; fenêtre 💾 repensée |
| 69 | 📋 Liste réparé dans les séquences |
| 70 | Écran d'accueil dans les fichiers de sauvegarde |
| **71 → quinquies** | La ligne de tri du calendrier et le panneau de placement |
| **72 A → B bis** | **Le placement calculé** : la fenêtre, le calcul, puis l'écriture |
| **73 → ter** | **Imprimer mon calendrier par classe** |

## Volet 6 — fluidité, supports, emploi du temps

Bandeau des niveaux masqués, repliable et qui se souvient. Boutons 📥 Importer,
📊 Statistiques et 🔎 Afficher posés au bon moment. Bouton d'accueil « 📥 Importer
une séquence partagée ». Flèches ↑ ↓ sur les lignes de Supports & documents.
Protection des créneaux saisis à la main au réimport. Rythme — chaque semaine,
semaine A, semaine B — et demi-groupe dans le formulaire d'emploi du temps, avec
une vue qui sépare les deux semaines. Couleurs des tâches finale et intermédiaire.

## Volet 7 — bandeau, guide, classes, descripteurs

| Lot | Objet |
|---|---|
| R5 → ter | Le bandeau du haut tient en fenêtre étroite ; infobulle sur chacun des six onglets |
| **R4 a · R4 b** | **Le guide en diapositives** et la démo enrichis |
| 74 D · E · F | Les créneaux saisis à la main arrivent à la fiche de classe ; couleur du placement calculé |
| **D1 · D2 · D3** | **Les descripteurs à plusieurs capacités se découpent en objectifs distincts**, côté séance et côté séquence — et la banque officielle complète remplace la banque abrégée |

## Volet 8 — descripteurs recliquables, grilles, archivage

| Lot | Objet |
|---|---|
| **R11 A · B · C** | **Encadré « Descripteurs de la séquence »** dans l'éditeur de séance : un clic inscrit, un second retire ; ce qui arrive dans une séance remonte dans la fiche de sa séquence ; les familles se replient |
| R9 · R9 ter | Une case exclut les niveaux masqués de toutes les statistiques |
| V1 A | Les étiquettes ne clignotent plus dans l'éditeur de séquence |
| **R13** | **Le comparatif des manuels de la voie technologique** |
| **PRAG A · B · C · R12** | **Les 34 descripteurs de pragmatique au texte officiel**, et leurs deux fenêtres de découpage |
| **H1** | Le bouton d'aide ouvre les diapositives **ou** le tour guidé |
| **Série G** | **Les lots grilles G1, G2, G4**, développés en parallèle |
| H3 · H4 · H5 | Échap et clic extérieur ferment les fenêtres de grilles |
| **H6 · H6 bis · H7 · H7 bis · H8** | **Le dossier Archives et l'archivage par année scolaire** |
| H9 · H10 · H11 | La carte de niveau annonce ce que la liste montre ; le champ « Classe » retrouve sa séquence |

## Revue finale

| Lot | Objet |
|---|---|
| F | Lien « Code source de Lesson Loom » au pied de page |
| **ZL1a** | **Les vacances scolaires entrent dans la sauvegarde complète** — sans elles, un placement refait après restauration posait des séances en plein congé |

---

## La liaison avec les outils compagnons

Lesson Loom ne travaille pas seul. Deux passerelles ont été construites, et les
outils qui les reçoivent le sont aussi :

**Vers QuizLoom** — le menu Exporter d'une séance propose « ⚡ Copier pour
QuizLoom », avec un sélecteur qui permet de cocher une, plusieurs ou toutes les
séances d'une séquence. QuizLoom en fabrique un QCM importable dans Pronote, ou un
quiz web autonome.

**Vers CorrectForme Loom** — le fichier de distribution d'une grille, avec ses
paliers, son barème et ses élèves, est relu par CorrectForme, qui aide à la
correction des copies et renvoie la grille pré-remplie.

---

## Méthode

Le développement a suivi une règle constante : un lot à la fois, diagnostic avant
tout code, banc d'essai passé sur la version défectueuse **avant** d'être cru sur
la version corrigée, et retour arrière immédiat en cas d'échec. Chaque version est
conservée à côté de la précédente.

Les mémoires de projet consignent chaque décision, y compris celles qui ont été
écartées et pourquoi — pour que la question ne soit pas reposée deux fois.

---

*Lesson Loom — © Juin 2026 Maïwena Gadegbeku — lessonloom.fr*
*Refonte et extension du Séquenceur LV de Charlie Rollo (AGPLv3).*
