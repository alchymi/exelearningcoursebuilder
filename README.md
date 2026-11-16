# exelearningcoursebuilder

Une *skill* pour [Claude Code](https://claude.com/claude-code) qui crée des cours [eXeLearning](https://exelearning.net/) au format `.elpx` : pages, textes, images, quiz et jeux interactifs, à partir d'un simple sujet ou d'un plan de cours.

*A Claude Code skill that builds eXeLearning courses (`.elpx`) from a topic or lesson plan.*

## Ce que fait la skill

Vous demandez par exemple « fais-moi un cours eXeLearning sur la Révolution française pour des élèves de 4e ». Claude rédige le cours, cherche des images libres sur Wikimedia Commons, génère le fichier `.elpx` et le contrôle dans un navigateur. Le fichier s'ouvre ensuite dans eXeLearning (Fichier > Ouvrir) pour être relu et modifié.

- **48 types de modules (iDevices)** : texte, vrai/faux, QCM, mots croisés, mots mêlés, glisser-déposer, carte interactive, vidéo interactive, cadenas, défi, quiz adaptatif, rapport de progression, etc. La liste complète est dans [references/modules.md](references/modules.md).
- **12 langues d'interface** pour les boutons et messages des jeux : français, allemand, anglais, espagnol, italien, portugais, catalan, basque, galicien, roumain, valencien, espéranto.
- **Un cours d'exemple** avec un appel de chaque module : [examples/course.js](examples/course.js).

## Prérequis

- [Claude Code](https://claude.com/claude-code)
- Node.js 18 ou plus récent
- Docker avec un conteneur eXeLearning v4 démarré, par exemple :
  ```bash
  docker run -d -p 8080:8080 --name exelearning ghcr.io/exelearning/exelearning:latest
  ```
  La skill utilise l'exporteur de ce conteneur pour produire le fichier final. Sans Docker, elle peut produire un fichier « source seule » qui s'ouvre dans l'éditeur mais ne contient pas l'aperçu HTML.

## Installation

Clonez ce dépôt dans le dossier des skills de Claude Code, sous le nom `elpx-course` :

```bash
# Linux / macOS
git clone https://github.com/alchymi/exelearningcoursebuilder.git ~/.claude/skills/elpx-course

# Windows (PowerShell)
git clone https://github.com/alchymi/exelearningcoursebuilder.git "$env:USERPROFILE\.claude\skills\elpx-course"
```

Pour activer le contrôle automatique dans un navigateur (facultatif, utilise Edge ou Chrome déjà installé) :

```bash
npm install --prefix ~/.claude/skills/elpx-course/scripts
```

Redémarrez Claude Code : la skill `elpx-course` apparaît dans la liste et se déclenche quand vous demandez un cours eXeLearning. Vous pouvez aussi taper `/elpx-course`.

## Utilisation sans Claude

Le générateur fonctionne aussi seul. Décrivez le cours dans un fichier JavaScript (voir [examples/course.js](examples/course.js)), puis :

```bash
node scripts/build.js examples/course.js --out demo.elpx   # génère le .elpx
node scripts/check.js examples                             # ouvre chaque page et signale les erreurs
```

## Limites connues

- Les modules `3dmol`, `electrical-circuits`, `lomloe` et `example` ne sont pas pris en charge.
- Les questions placées dans une vidéo YouTube le sont à des instants estimés : il faut les recaler après avoir regardé la vidéo.
- Quelques libellés ne sont pas traduits (boutons de la grille d'évaluation, « joueurs » du Trivial, tableau DigCompEdu en anglais).
- Le contenu des cours est rédigé par une IA : une relecture reste nécessaire avant usage en classe.

## Organisation du dépôt

| Dossier | Contenu |
|---|---|
| [SKILL.md](SKILL.md) | Instructions lues par Claude |
| [scripts/](scripts/) | Générateur (`build.js`), contrôle navigateur (`check.js`), téléchargement d'images libres (`commons.js`) |
| [references/](references/) | Paramètres de chaque module, fonctionnement du format `.elpx` |
| [examples/](examples/) | Cours de démonstration et ses fichiers |

## Crédits

- Les données de `scripts/data/` (modèles de modules et traductions de l'interface) sont dérivées d'[eXeLearning](https://github.com/exelearning/exelearning), logiciel libre sous licence AGPL.
- Les photographies de `examples/assets/` viennent de Wikimedia Commons ; auteurs et licences sont listés dans [examples/credits.json](examples/credits.json).
