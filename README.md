# exelearningcoursebuilder

Deux skills pour Codex et [Claude Code](https://claude.com/claude-code) : créer des cours [eXeLearning](https://exelearning.net/) au format `.elpx` et concevoir leurs thèmes graphiques.

| Skill | Emplacement | Usage |
|---|---|---|
| `exelearning-course-builder` | [Racine du dépôt](SKILL.md) | Cours, activités et illustrations |
| `exelearning-theme-builder` | [exelearning-theme-builder/](exelearning-theme-builder/SKILL.md) | Charte graphique, navigation mobile et thèmes ZIP |

*A Claude Code skill that builds eXeLearning courses (`.elpx`) from a topic or lesson plan.*

## Ce que fait la skill

Vous demandez par exemple « fais-moi un cours eXeLearning sur la Révolution française pour des élèves de 4e ». Claude rédige le cours, cherche des images libres sur Wikimedia Commons, génère le fichier `.elpx` et le contrôle dans un navigateur. Le fichier s'ouvre ensuite dans eXeLearning (Fichier > Ouvrir) pour être relu et modifié.

- **48 types de modules (iDevices)** : texte, vrai/faux, QCM, mots croisés, mots mêlés, glisser-déposer, carte interactive, vidéo interactive, cadenas, défi, quiz adaptatif, rapport de progression, etc. La liste complète est dans [references/modules.md](references/modules.md).
- **12 langues d'interface** pour les boutons et messages des jeux : français, allemand, anglais, espagnol, italien, portugais, catalan, basque, galicien, roumain, valencien, espéranto.
- **Un cours d'exemple** avec un appel de chaque module : [examples/course.js](examples/course.js).
- **Illustrations Ideogram v3 via fal.ai** : décision pédagogique, direction artistique et génération depuis un brief, avec provenance. La planification est hors ligne ; la génération nécessite une clé personnelle et est facturée par fal.ai. Voir [references/illustrations.md](references/illustrations.md).

La skill de thèmes contient un thème de départ **Skilltech — Chapters** : police locale Plus Jakarta Sans, palette jaune/bleu nuit, menu hamburger fermé par défaut sur mobile et ordinateur, recherche et sous-chapitres repliables. Elle fournit un générateur de ZIP portable et explique comment vérifier le rendu dans l'éditeur, l'export et le lecteur public. Les licences des ressources sont incluses ; les projets privés et clés API ne font pas partie du dépôt.

## Prérequis

- Codex ou [Claude Code](https://claude.com/claude-code)
- Node.js 18 ou plus récent
- Docker avec un conteneur eXeLearning v4 démarré, par exemple :
  ```bash
  docker run -d -p 8080:8080 --name exelearning ghcr.io/exelearning/exelearning:latest
  ```
  La skill utilise l'exporteur de ce conteneur pour produire le fichier final. Sans Docker, elle peut produire un fichier « source seule » qui s'ouvre dans l'éditeur mais ne contient pas l'aperçu HTML.

## Installation

Le dépôt conserve la skill de cours à sa racine. Clonez-le sous le nom `exelearning-course-builder`, puis copiez la skill de thèmes dans un dossier voisin.

Pour Codex dans un projet (PowerShell) :

```powershell
git clone https://github.com/alchymi/exelearningcoursebuilder.git .agents/skills/exelearning-course-builder
Copy-Item .agents/skills/exelearning-course-builder/exelearning-theme-builder .agents/skills/exelearning-theme-builder -Recurse
npm install --prefix .agents/skills/exelearning-course-builder/scripts
```

Pour Claude Code :

```bash
# Linux / macOS
git clone https://github.com/alchymi/exelearningcoursebuilder.git ~/.claude/skills/exelearning-course-builder
cp -R ~/.claude/skills/exelearning-course-builder/exelearning-theme-builder ~/.claude/skills/exelearning-theme-builder

# Windows (PowerShell)
git clone https://github.com/alchymi/exelearningcoursebuilder.git "$env:USERPROFILE\.claude\skills\exelearning-course-builder"
Copy-Item "$env:USERPROFILE\.claude\skills\exelearning-course-builder\exelearning-theme-builder" "$env:USERPROFILE\.claude\skills\exelearning-theme-builder" -Recurse
```

Pour activer le contrôle automatique dans un navigateur (facultatif, utilise Edge ou Chrome déjà installé) :

```bash
npm install --prefix ~/.claude/skills/exelearning-course-builder/scripts
```

Rouvrez une session de votre agent si nécessaire pour actualiser la découverte des skills. Demandez un cours ou un thème eXeLearning ; dans Codex, vous pouvez invoquer `$exelearning-course-builder` ou `$exelearning-theme-builder`.

Le générateur de ZIP de thèmes fourni est un script PowerShell ; les thèmes eux-mêmes sont des fichiers CSS/JS portables. Sur un autre système, créez un ZIP sans dossier parent et avec des chemins `/`. Ne stockez jamais vos clés API dans le dépôt : utilisez `FAL_KEY` ou un fichier privé passé à `--key-file`.

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
| [exelearning-theme-builder/](exelearning-theme-builder/) | Skill de thèmes, thème de départ et script ZIP |

## Crédits

- Les données de `scripts/data/` (modèles de modules et traductions de l'interface) sont dérivées d'[eXeLearning](https://github.com/exelearning/exelearning), logiciel libre sous licence AGPL.
- Les photographies de `examples/assets/` viennent de Wikimedia Commons ; auteurs et licences sont listés dans [examples/credits.json](examples/credits.json).
