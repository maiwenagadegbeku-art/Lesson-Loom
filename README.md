# 🪄 Lesson Loom

**Lesson Loom — Conçue et développée par Maïwena Gadegbeku pour les enseignants
d'anglais LV1 du secondaire français.**

Lesson Loom est une refonte et une extension du Séquenceur LV de Charlie Rollo (AGPLv3), 
dont elle conserve le noyau. Le détail de ce qui a été ajouté figure dans [EXTENSIONS.md](EXTENSIONS.md).

© Juin 2026 Maïwena Gadegbeku

---

## Ce que c'est

Un **fichier HTML unique**, à télécharger et à ouvrir dans un navigateur. Pas
d'installation, pas de compte, pas de serveur. Vos données restent sur votre
ordinateur.

Lesson Loom accompagne la préparation d'une année : concevoir des séquences,
détailler des séances, s'appuyer sur le référentiel CECRL officiel, construire
des grilles d'évaluation, placer les séances sur le calendrier scolaire, et
imprimer ce qu'il faut pour la classe.

## Ce qu'elle fait

**Séquences et séances**
Fiches de séquence complètes — niveau, classe, année scolaire, axes du
programme, problématique, tâche finale. Séances détaillées avec objectifs,
supports, activités langagières et déroulé. Séances flash pour ce qui ne rentre
pas dans une séquence. Une séance se copie vers une autre séquence ou vers les
séances flash, et ses objectifs remontent dans la fiche de la séquence d'arrivée.

**Le référentiel CECRL officiel**
Les 292 descripteurs du Volume complémentaire, neuf compétences, avec le texte
officiel intégral. Les descripteurs qui contiennent plusieurs capacités se
découpent en objectifs distincts, à cocher un par un. La compétence pragmatique
et ses 34 descripteurs sont incluses.

**Grilles d'évaluation**
Grilles par critères ou par niveaux CECRL, barème et conversion sur 20, grilles
officielles du baccalauréat, grille LLCER, marqueurs de positionnement, analyse
de cohérence, et distribution aux élèves.

**Calendrier et placement sur l'année**
Import de l'emploi du temps depuis Pronote, ou saisie à la main ; les cours qui
réunissent plusieurs classes — DNL, section européenne, option — sont importés
sous le nom de leur groupe. Placement calculé des séances sur les créneaux réels
d'une classe : vacances, jours fériés, absences et sorties sautés, semaines A et
B justes toute l'année, demi-groupes. Une absence ajoutée, déplacée ou supprimée
après coup signale les séances touchées et propose de recalculer, en montrant ce
qui change. Une séance flash peut être rattachée à une classe et remplacer un
cours : la séquence de cette classe se décale d'autant, et le calendrier propose
de recalculer. Impression du calendrier par classe, en grille ou en liste.

**Bibliothèque**
Comparatifs des manuels d'anglais du collège, du lycée, de la spécialité LLCER
et de la voie technologique. Grilles mises de côté, séquences favorites, notes
d'avancement, corbeille et archivage par année scolaire.

**Impressions**
Fiches de séquence et de séance, progressions, calendriers, grilles vierges ou
remplies. Tout est pensé pour tenir sur une page et rester lisible en noir et
blanc. Les fiches sont organisées par composantes du CECRL, ce qui les rend directement
présentables en inspection. L'export de la séquence complète s'imprime aussi
proprement sous Firefox que sous Chrome, avec un pied de page sur chaque page ;
le PDF d'une séance porte le nom de sa séquence et son numéro. Une séquence
partagée s'imprime comme une fiche.

**Guide**
Un guide en dix diapositives et un tour guidé de vingt-deux étapes, qui
parcourt l'application elle-même. Tous deux accessibles à tout moment depuis
le bouton d'aide du bandeau.

## Comment l'utiliser

1. Téléchargez le fichier HTML depuis la page **Obtenir** de
   [lessonloom.fr](https://lessonloom.fr).
2. Ouvrez-le dans votre navigateur — Chrome ou Firefox de préférence.
3. Enregistrez régulièrement vos données avec le bouton de sauvegarde.

Un mode d'emploi détaillé — où trouver quoi, et dans quel ordre s'y prendre —
figure dans [GUIDE.md](GUIDE.md).

La zone de téléchargement est protégée par un mot de passe. Écrivez à
[contact@lessonloom.fr](mailto:contact@lessonloom.fr) pour l'obtenir.

## Vos données

Elles sont enregistrées **dans votre navigateur**, sur votre ordinateur. Rien
n'est envoyé nulle part, aucun compte n'est nécessaire, aucune mesure d'audience
n'est effectuée.

L'application fonctionne sans connexion. Seuls les dessins des caractères de la
police sont chargés à l'ouverture : hors connexion, l'apparence est légèrement
différente, et tout le reste fonctionne à l'identique.

Cela implique une contrepartie : **pensez à faire des sauvegardes.** Le bouton
de sauvegarde produit un fichier que vous conservez où vous voulez, et qui se
recharge dans l'application.

## Licence

Lesson Loom est publiée sous licence **GNU Affero General Public License v3
(AGPLv3)**.

Vous êtes libre de l'utiliser, de l'étudier, de la modifier et de la
redistribuer, à condition de conserver cette licence et de publier vos
modifications sous les mêmes termes.

**Crédit obligatoire.** Le fichier [LICENSE](LICENSE) porte une condition
supplémentaire, au titre de l'article 7(b) de l'AGPLv3 : toute version modifiée
diffusée publiquement ou mise à disposition sur un serveur doit créditer
visiblement les deux auteurs, dans son interface ou dans sa documentation. Ce
crédit ne peut être ni retiré, ni dissimulé aux utilisateurs.

Le texte complet de la licence figure dans le fichier [LICENSE](LICENSE).

**Attribution.** Lesson Loom est née du *Séquenceur LV* de Charlie Rollo,
publié sous AGPLv3, dont elle conserve le noyau. Cette mention figure également
dans la page « Licence et crédits » de l'application, accessible depuis son pied
de page.

**Dépôt public :**
[github.com/maiwenagadegbeku-art/Lesson-Loom](https://github.com/maiwenagadegbeku-art/Lesson-Loom)
— l'adresse figure également dans le pied de page de l'application.

## Code source

Le fichier HTML livré contient un cœur React **compilé**. Conformément à
l'AGPLv3, le code source correspondant est mis à disposition sur ce dépôt, dans
le dossier [`source/`](source/).

Ce dossier conserve l'état du code de juin 2026, à titre de référence. Le
développement s'est poursuivi ensuite directement dans le fichier HTML unique :
**c'est ce fichier qui fait foi.**

## État du projet

**Version de référence :** volet 11 (21 octobre 2026) — séances flash par classe dans le placement calculé, copie de séances, impressions soignées sous Firefox, fichier de séquence partagée corrigé.

**Versions précédentes :** volet 10 (20 octobre 2026), absences et sorties dans le placement calculé, cours à plusieurs classes, semaines A et B · volet 9 (13 septembre 2026) · volet 8 (17 août 2026) · campagne de publication (21 août 2026) · revue finale avant mise en ligne (24 août 2026).

Fichier unique de 5 242 548 octets. Cœur compilé React : 38 retouches,
dont deux portant uniquement sur des données. 30 blocs autonomes.

Le développement suit une méthode stricte : un lot à la fois, diagnostic avant
tout code, banc d'essai passé sur la version défectueuse avant d'être cru sur
la version corrigée, et retour arrière immédiat en cas d'échec. Les mémoires de
projet consignent chaque décision, y compris celles qui ont été écartées et
pourquoi.

## Autres outils

Lesson Loom fait partie de la **Lesson Loom Suite**. Tous les outils se
téléchargent depuis la page **Obtenir** de
[lessonloom.fr](https://lessonloom.fr).

| Outil | Ce qu'il fait | Licence |
|---|---|---|
| **Lesson Loom** | Planification des séquences et des séances | AGPLv3 |
| **QuizLoom** | Générateur de QCM, export Pronote | AGPLv3 |
| **CorrectForme Loom** | Correction assistée des devoirs | AGPLv3 |
| **The Loom Arcade** | Salle de jeux de vocabulaire pour les élèves | AGPLv3 |
| **WordSmith Profs** | Générateur d'appréciations de bulletins | Tous droits réservés |

**Important.** La licence déposée sur ce dépôt ne couvre que **Lesson Loom**.
**WordSmith Profs n'est pas sous AGPLv3** : c'est une création originale, tous
droits réservés.

## Contact

[contact@lessonloom.fr](mailto:contact@lessonloom.fr)

Pour obtenir le mot de passe de téléchargement, signaler un défaut, proposer une
amélioration, ou simplement dire que l'outil vous sert.

---

*Conçue par une enseignante, pour des enseignants.*
