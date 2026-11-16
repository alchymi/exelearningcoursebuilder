# How the .elpx format and the generator work

Read this when a module misbehaves, when you need an option the builders don't expose, or when adding a module type.

## Package layout

```
course.elpx (zip)
├── content.xml            the editable project (ODE 2.0) — the only thing the editor reads
├── content.dtd
├── content/resources/     media files, flat
├── index.html, html/*.html, idevices/, libs/, theme/    the exported website (added by eXeLearning's exporter)
```

`build.js` writes the first three itself, zips them, and runs `bun cli elp:export in.elpx out.elpx elpx` inside the eXeLearning container to add the website. That way the HTML, scripts and theme always match the user's eXeLearning version.

## content.xml

`odeProperties` (title, language, theme, licence…) then `odeNavStructures`: one `odeNavStructure` per page (`odePageId`, `odeParentPageId` for nesting, order), each holding `odePagStructure` blocks (name, icon), each holding `odeComponent` modules with:

- `odeIdeviceTypeName` — the module type (`text`, `crossword`, `quick-questions`…)
- `htmlView` — HTML stored in CDATA
- `jsonProperties` — JSON in CDATA (may be empty)

Ids are 14 digits + 6 characters. Media are referenced as `{{context_path}}/<file>`.

## Three storage patterns

1. **JSON modules** (`text`, `trueorfalse`, `form`, `scrambled-list`, `casestudy`, `magnifier`, `image-gallery`, `adaptative-quiz`, viewers…): the data is in `jsonProperties`; `htmlView` is a container the runtime fills.
2. **"DataGame" modules** (most games): `jsonProperties` is empty; `htmlView` holds a hidden `<div class="<prefix>-DataGame">` with the whole game as JSON, either raw or obfuscated (`escape()` of each character XOR 146 — see `scripts/lib/codec.js`). Media are additionally listed as hidden anchors (`<a class="js-hidden <prefix>-LinkImages">index</a>`) so the exporter rewrites their paths.
3. **Plain HTML modules** (`rubric`, `external-website`, `geogebra-activity`, `download-source-file`, `interactive-video`): everything is in `htmlView` with conventional class names.

Field encodings differ per module (some texts are `encodeURIComponent`-encoded, e.g. `relate` and `flipcards` card texts; `dragdrop` is plain). When in doubt, look at the prototype.

## Prototypes

`scripts/data/prototypes.json` holds one decoded real example per DataGame type, taken from an official eXeLearning test project. Builders clone the prototype and overwrite fields (`game()` in `scripts/lib/core.js`), which keeps every field the runtime expects, including the `msgs` interface strings. `scripts/data/i18n/<lang>.json` replaces those strings per language (generated from eXeLearning's own translation files).

Inspect a prototype:

```bash
node scripts/proto.js crossword game            # the game payload (strings truncated)
node scripts/proto.js crossword game wordsGame  # one field
node scripts/proto.js crossword html            # the htmlView skeleton
node scripts/proto.js form json                 # jsonProperties of a JSON module
```

## Tuning an option the builder doesn't expose

Every game builder funnels through `game(type, cssPrefix, { instructions, mutate(g) {...}, links, extra })`. In the course file you can wrap a component to adjust it — simplest is to add an option to the builder in `scripts/lib/modules.js` / `media.js` (they are short, one function per module) rather than post-processing HTML. Typical fields: `time`, `showSolution`, `percentajeQuestions` (share of questions drawn), `useLives`/`numberLives`, `optionsRamdon`, `answersRamdon` (spelling as in eXeLearning).

## Adding or repairing a module type

1. In the eXeLearning editor, create a small project using the module, save it, unzip the `.elpx`, and read its `odeComponent` in `content.xml` (decode a DataGame payload with `extractGame` from `scripts/lib/codec.js`).
2. Write a builder that reproduces that structure. Compare its output with the editor's for the same content.
3. Build, run `check.js`, and open the result in the editor (File → Open), including the module's edit form.

The module's runtime code is in the container under `/app/public/files/perm/idevices/base/<type>/export/` (how the page reads the data) and `…/edition/` (how the editor writes it) — the authoritative reference when a field's meaning is unclear.

## Scoring

Scored modules carry `evaluation: true` and a shared `evaluationID` (derived from the course title) plus a hidden `game-evaluation-ids` div. `progress-report` lists them by id; results are stored in the learner's browser (localStorage), so they are per device, not sent to a server. SCORM export (for an LMS such as Moodle) is done from the eXeLearning editor: File → Export.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `asset not found` at build | file missing from `assets/`, or name with spaces/accents |
| `"{{context_path}}/x" … not registered` | an `<img src>` written by hand: use `img()`, `fig()` or `asset()` |
| export fails with a container error | container stopped; `docker ps`, start it, or `--container <name>` |
| module area empty in the browser | data shape wrong for that type — compare with `proto.js`; check the browser console via `check.js` |
| `%20` or `%C3%A9` visible in a game | a text was URI-encoded for a module that expects plain text (or the reverse) |
| image broken inside a game only | the hidden `…-LinkImages` anchor for that image is missing |
| iframe blank | the site forbids embedding (X-Frame-Options) or is http |
