# Code source — état de juin 2026

Ce dossier contient le code source React de Lesson Loom, dans l'état où il se
trouvait en **juin 2026**, au moment où le fichier HTML autonome a été
fabriqué.

Il est déposé ici conformément à la licence **AGPLv3**, qui demande que le code
source correspondant à un programme compilé soit mis à disposition.

## Ce qu'il faut savoir avant de le lire

**Le fichier HTML fait foi.** Depuis juin 2026, le développement s'est poursuivi
directement dans le fichier HTML unique, sous forme de blocs autonomes ajoutés à
la suite du cœur compilé. Ce dossier ne reflète donc pas l'état actuel de
l'application : il en est le point de départ, conservé à titre de référence.

Pour comprendre ce que fait Lesson Loom aujourd'hui, c'est le fichier HTML qu'il
faut ouvrir.

## Organisation

| Dossier | Contenu |
|---|---|
| `frontend/src/` | Le cœur de l'application : composants, vues, données, utilitaires |
| `frontend/src/data/` | Le référentiel CECRL, les grilles officielles, les comparatifs de manuels |
| `frontend/public/` | Le modèle de page et les icônes |
| `backend/` | Un serveur qui existait en juin et **qui n'est plus utilisé** — l'application actuelle fonctionne sans serveur |

## Ce qui a été retiré avant le dépôt

Par respect de la vie privée et par souci de propreté, quelques éléments ont été
écartés de ce dossier :

- **Deux adresses académiques** — celle de l'autrice et celle de Charlie Rollo.
  L'adresse de contact du projet, `contact@lessonloom.fr`, les remplace.
- **Un compteur d'audience** ajouté par défaut par la plateforme de
  fabrication, ainsi que son badge et ses scripts. Ils n'ont jamais été
  souhaités et ne figurent pas non plus dans le fichier HTML distribué.
- Des documents de travail internes et des rapports de tests automatiques, sans
  intérêt pour la lecture du code.

## Licence

**AGPLv3**, comme l'ensemble de Lesson Loom. Voir le fichier
[LICENSE](../LICENSE) à la racine du dépôt.

Lesson Loom est née du *Séquenceur LV* de Charlie Rollo, publié sous AGPLv3,
dont elle conserve le noyau.

---

© Juin 2026 Maïwena Gadegbeku — [contact@lessonloom.fr](mailto:contact@lessonloom.fr)
