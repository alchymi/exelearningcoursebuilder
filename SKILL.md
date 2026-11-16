---
name: elpx-course
description: Create eXeLearning courses as .elpx files (interactive e-learning packages with pages, texts, images, quizzes and games) from a topic, a lesson plan or existing documents. Use this skill whenever the user asks for a course, lesson, module, learning sequence, quiz set or revision activity "in eXeLearning", "en elpx", "au format .elpx/.elp", "pour eXe", or wants to generate, extend or rebuild an eXeLearning project or its iDevices (modules) — even when they only say "fais-moi un cours sur…" in a workspace that contains eXeLearning or .elpx files. Also use it to add activities (crossword, true/false, drag and drop, interactive video, map, escape-game padlock…) to a course built with this skill.
---

# Building eXeLearning courses (.elpx)

An `.elpx` file is a ZIP holding `content.xml` (the editable project: pages → blocks → modules, called iDevices), the media files, and a ready-to-view HTML export. Each iDevice type stores its data in its own undocumented format, so writing `content.xml` by hand fails in subtle ways. This skill bundles a generator that already knows 48 iDevice formats: you describe the course in a small JavaScript file, and `scripts/build.js` produces the `.elpx`, using the user's own eXeLearning (in Docker) to render the final package.

## Workflow

1. **Agree on the course** — topic, audience and level, language, approximate size. If the user gave only a topic, choose sensible defaults (6–10 pages, the course language = the language they write in) and say what you chose rather than interviewing them. Only ask when something essential cannot be guessed.
2. **Create a course folder** in the user's workspace, e.g. `cours-<sujet>/` with `course.js` and an `assets/` subfolder.
3. **Collect media** (optional but it makes the course far better) — see *Images* below.
4. **Write `course.js`** — start from `examples/course.js` (one call of every module) and read `references/modules.md` for the parameters of the modules you use.
5. **Build**: `node <skill>/scripts/build.js <folder>/course.js --out <where>/<Name>.elpx`
6. **Check** in a browser: `node <skill>/scripts/check.js <folder>` and look at a few screenshots it saves (Read the PNG files), at least the pages with images, maps or videos.
7. **Report** to the user: where the file is, how to open it (eXeLearning → File → Open), what the course contains, and honestly what you could not verify (see *Limits to state*).

`<skill>` is the folder containing this file. Requirements: Node.js 18+, and Docker with a running eXeLearning container (the build finds it by name or image; `--container <name>` to force one).

## The course file

```js
module.exports = {
  meta: {
    title: 'La Révolution française',       // required
    subtitle: '1789-1799', author: '…', description: '…',
    lang: 'fr',        // course language AND language of the games' buttons/messages
    theme: 'base',     // base, cedec, educablue, etwinning, flux, intef, kids, neo, nova, universal, zen
    license: 'creative commons: attribution - share alike 4.0',
    math: false,       // true to enable MathJax (LaTeX formulas)
  },
  content({ page, text, m, img, fig, P }) {
    const intro = page('Introduction', null, [            // page(title, parentPage|null, blocks)
      { name: 'Bienvenue', icon: 'start', comps: [          // a block = titled box holding 1+ modules
        text(`${fig('bastille.jpg', 'Prise de la Bastille', 'La prise de la Bastille, 14 juillet 1789', 560)}<p>…</p>`),
      ] },
      { name: 'Vrai ou faux', icon: 'ask', comps: [
        m.trueorfalse(P('Vrai ou faux ?'), [['La Bastille est prise en 1789.', true]]),
      ] },
    ]);
    page('Une sous-page', intro, [ /* … */ ]);             // nested under "Introduction"
  },
};
```

- `text(html, {feedback, feedbackButton, duration, grouping})` is the workhorse for explanations. Plain HTML: `<p>`, `<ul>`, `<strong>`, `<table class="exe-table">`, `<blockquote>`…
- `m.<module>(…)` are the other 47 modules — list below, details in `references/modules.md`.
- `img(file, alt, width)` and `fig(file, alt, caption, width)` return HTML for an image stored in `assets/`. Every media file must go through `img`, `fig`, `asset(file)` or a module parameter: that is what packages it. File names: letters, digits, `.`, `-`, `_` only.
- `P('text')` wraps in `<p>`; most modules take their instructions as HTML.
- Block icons: activity agreement alert arts ask book calculate case chrono collaborative competencies diary discuss download draw english experiment explore file gallery geography guide history info interactive letters listen math music nature objectives observe passport perform piece pieces play present reflection roadmap share sport start stop suitcase technology think video.
- The first page is the home page (`index.html`).

## Modules at a glance

| Purpose | Modules (`m.` prefix, except `text`) |
|---|---|
| Explain | `text`, `markdown`, `udl` (main text + easy-read / visual alternatives), `casestudy`, `slide` (title slide) |
| Show | `gallery`, `magnifier`, `beforeAfter`, `map` (image with clickable points), `panorama`, `viewer3d` (.stl), `externalWebsite`, `attachment`, `geogebra` |
| Video | `interactiveVideo` (YouTube + timed questions/notes), `videoQuiz` |
| Quiz | `trueorfalse`, `form` (mixed question types), `quickQuestions` (one answer), `multipleChoice` (several answers), `adaptiveQuiz` (3 difficulty levels), `trivial` (board game) |
| Words | `crossword`, `wordSearch`, `guess`, `azQuiz` (one word per letter), `complete` (fill the gaps) |
| Sort & match | `classify`, `sort`, `scrambledList`, `discover` (memory pairs), `relate`, `flipcards`, `dragdrop`, `selectMedia`, `identify` |
| Image games | `puzzle`, `hiddenImage` |
| Maths & science | `mathProblems` (random numbers), `mathOperations`, `periodicTable` |
| Challenges | `challenge` (chained riddles), `padlock` (code lock that reveals a reward) |
| Assessment | `checklist`, `rubric`, `progressReport` (results of all scored activities), `digcompedu` (teacher competences) |
| Course-wide | `credits` (table of image credits), `downloadSource` |

Not supported: `3dmol`, `electrical-circuits`, `lomloe` (Spanish curriculum), `example`. If the user needs one, say so; they can add it by hand in the editor.

## Writing a good course

The generator makes it easy to produce a lot of modules; the quality comes from the content.

- **Teach first, then test.** Each chapter page: one or two `text` blocks that actually explain (with an image when one helps), then 2–4 activities on *that* content. A learner must be able to answer every question from the page they just read.
- **Pick the module that fits the knowledge**: chronology → `sort`/`scrambledList`; vocabulary → `crossword`, `flipcards`, `guess`; two categories to tell apart → `classify`; a labelled image → `map` or `dragdrop`; facts → `quickQuestions`/`trueorfalse`. Don't use every module because it exists — unless the user asks for a showcase.
- **Accuracy matters more than volume.** Write facts you are sure of; this goes in front of pupils. Give the correct answer a justification in feedback where the module has a feedback field.
- **Finish with a synthesis page**: a recap, `checklist` or `adaptiveQuiz`, and `progressReport`. Add a last "Sources et crédits" page with `m.credits()` when you used downloaded images.
- Game answers are typed by learners: prefer single words without ambiguity for `crossword`, `guess`, `padlock`, `challenge`; `wordSearch`/`crossword` words in capitals without accents or spaces.

## Images

`scripts/commons.js` searches Wikimedia Commons and downloads images with their licence, writing `credits.json` beside the course file (used by `m.credits()`, `m.gallery`, `m.map`):

```bash
node <skill>/scripts/commons.js search "Bastille 1789 painting"          # titles + size + licence
node <skill>/scripts/commons.js get <folder>/assets 1000 bastille=File:Prise_de_la_Bastille.jpg sermont=File:…
```

`get` takes `localname=File:Title` pairs, saves `assets/localname.jpg|png` at most 1000 px wide, and waits between downloads (Commons rate-limits; if it fails, retry later rather than hammering). Look at what you downloaded (Read the image) before building a lesson around it — titles can mislead. Images the user provides just go in `assets/`. You can also generate SVG diagrams yourself and save them in `assets/`.

For `map` points you need coordinates as fractions of the image (x from the left, y from the top): Read the image and estimate, then verify on the screenshot from `check.js` and adjust.

## Build output and checks

`build.js` prints a summary line, warnings (unknown icon, empty block…), then `OK <file>`; exit code 2 with `PROBLEM:` lines if a module or asset is missing from the export. It leaves the exported website in `<folder>/.elpx-build/site` for checking.

`check.js` opens every page headlessly, clicks the games' start buttons, and reports JavaScript errors and modules that rendered almost empty. It needs `playwright-core` once: `npm install --prefix <skill>/scripts playwright-core` (uses the installed Edge or Chrome). Known harmless report: `THREE is not defined` on a page with `panorama` (the viewer still works). In headless mode `externalWebsite` iframes and YouTube players may stay blank; that is not a build error.

Options: `--lang de` overrides the language; `--no-export` skips Docker and writes a source-only `.elpx` (it opens in the eXeLearning editor, but contains no HTML preview) — use it only when Docker is unavailable, and tell the user.

If no container is running: the user's install is usually a compose project (`docker compose up -d` in its folder), or `docker run -d -p 8080:8080 ghcr.io/exelearning/exelearning:latest`.

## Limits to state in your report

Be straightforward about these; a teacher will rely on the file.

- **Videos**: you cannot watch a YouTube video. Timed questions are placed at guessed seconds and must be re-timed by the user; say so every time you use `interactiveVideo` or `videoQuiz`. Never invent a video URL: search for a real one and confirm it exists, or leave the module out.
- **Interface language**: game buttons and messages exist in fr, en, de, es, it, pt, ca, eu, gl, ro, va, eo. A few labels stay in another language regardless (rubric buttons, Trivial "players", the DigCompEdu table is English-only).
- **Internet needed** at viewing time for videos, GeoGebra and external websites.
- **`slide`** renders correctly, but re-editing it in the eXeLearning slide editor is untested. **`panorama`** was tested with ordinary photos (`projection: 'flat'`) only.
- The content is AI-written: recommend a read-through before classroom use.

## Going further

- Parameters of every module: `references/modules.md`.
- How the format works, how to tune options the builders don't expose, and how to add or repair a module type: `references/format.md`.
