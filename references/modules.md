# Module reference

Every call returns a component to put in a block's `comps: [...]`. `instructions` is always HTML (use `P('…')`). `file` / `img` parameters are file names in the course's `assets/` folder. A working call of each module is in `examples/course.js`.

Modules marked **scored** appear in `progressReport`.

## Contents
1. [Text and documents](#text-and-documents) — text, markdown, udl, casestudy, slide
2. [Images, viewers, embeds](#images-viewers-embeds) — gallery, magnifier, beforeAfter, map, panorama, viewer3d, externalWebsite, attachment, geogebra
3. [Video](#video) — interactiveVideo, videoQuiz
4. [Quizzes](#quizzes) — trueorfalse, form, quickQuestions, multipleChoice, adaptiveQuiz, trivial
5. [Word games](#word-games) — crossword, wordSearch, guess, azQuiz, complete
6. [Sorting and matching](#sorting-and-matching) — classify, sort, scrambledList, discover, relate, flipcards, dragdrop, selectMedia, identify
7. [Image games](#image-games) — puzzle, hiddenImage
8. [Maths and science](#maths-and-science) — mathProblems, mathOperations, periodicTable
9. [Challenges](#challenges) — challenge, padlock
10. [Assessment and course-wide](#assessment-and-course-wide) — checklist, rubric, progressReport, digcompedu, credits, downloadSource

## Text and documents

```js
text(html, { feedback: '<p>…</p>', feedbackButton: 'Voir la réponse', duration: '10 min', grouping: 'Par deux' })
```
All options optional. `feedback` is hidden behind a button — good for "think first, then reveal".

```js
m.markdown(`## Titre\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n- point\n\n> citation`, { feedback: 'markdown revealed by a button' })
```
Supports headings, paragraphs, bold/italic, code, links, images, lists, tables, block quotes. For anything richer use `text` with HTML.

```js
m.udl({ heading: 'Objectifs', main: html, simplified: html, visual: html, kind: 'representation' })
```
Universal Design for Learning block: the main text plus buttons revealing an easy-to-read version and/or a visual version. `simplified` and `visual` optional (give at least one, otherwise use `text`).

```js
m.casestudy({ history: html, activities: [{ activity: html, feedback: html, button: 'Voir la réponse' }], duration: '20 min', grouping: 'Par deux' })
```
A situation followed by questions, each with a hidden answer.

```js
m.slide({ title: 'La Grèce antique', subtitle: '…', background: '#12355b', band: '#0b2545', color: '#ffffff', accent: '#e0b84a' })
```
A 16:9 title slide. Keep the title under ~40 characters.

## Images, viewers, embeds

```js
m.gallery([[file, 'Caption'], [file, 'Caption', { author, link, license }]])
```
Thumbnails opening a lightbox. Author/licence default to `credits.json`.

```js
m.magnifier(instructions, { img: file, alt: '…', width: 640, zoom: 200, glass: 2 })
```
Magnifying glass over a detailed image (maps, paintings). Use an image at least ~1500 px wide or the zoom shows nothing more.

```js
m.beforeAfter(instructions, [{ before: file, after: file, description: '…', altBefore, altAfter, vertical: false }])
```
Slider comparing two images of the **same size and framing**.

```js
m.map(instructions, { img: file, alt: '…', author: 'credit line', points: [
  { title: 'Athènes', x: 0.39, y: 0.53, img: file, footer: 'caption under the image' },   // point opening an image
  { title: 'Delphes', x: 0.28, y: 0.47, html: '<p>…</p>' },                                // point opening a text
] })
```
**Scored.** `x`, `y` are fractions (0–1) of the image width/height from the top-left corner. The image need not be a map (labelled diagram, painting, machine…).

```js
m.panorama([{ title, img: file, alt, description, projection: 'flat', hotspots: [{ label, x: 50, y: 60, html }] }])
```
Explorable image with hotspots. `projection: 'flat'` for an ordinary photo (hotspot `x`, `y` in percent); `'equirectangular'` for a real 360° photo (hotspot `yaw`, `pitch` in degrees — untested).

```js
m.viewer3d(file, { alt: '…', color: '#e9e2d0', background: '#dcecf7', autoRotate: true })
```
Rotatable 3D model. `.stl` is tested (Y axis is "up").

```js
m.externalWebsite(url, { height: 500, title: '…' })
```
An iframe. Only sites that allow embedding work (many sites forbid it — check the result in a browser); the URL must be https.

```js
m.attachment(introHtml, [{ file, title: '…', description: '…' }])
```
Downloadable files (PDF, worksheet, data…).

```js
m.geogebra('vJhKETCm', { width: 800, height: 520, author: '…', title: '…' })
```
A public GeoGebra material; the id is the last part of `https://www.geogebra.org/m/<id>`. Check the material exists before using it.

## Video

Both need a real YouTube URL (`https://www.youtube.com/watch?v=…`) that allows embedding, and the timings must be re-checked by a human.

```js
m.interactiveVideo({ url, intro: html, slides: [
  { at: 40, text: '<p>Note shown at 0:40</p>' },
  { at: 90, question: '<p>…?</p>', answers: [['Option A', false], ['Option B', true]] },
] })
```
**Scored.**

```js
m.videoQuiz(instructions, { url, start: 0, end: 214, author: 'channel', questions: [
  [45, 'Question at 0:45 ?', ['A', 'B', 'C', 'D'], 1],      // [second, text, 2–4 options, index of the right one]
] })
```
**Scored.** `end` = length of the video in seconds (required).

## Quizzes

All **scored**.

```js
m.trueorfalse(instructions, [[statement, true|false, 'feedback (optional)', 'hint (optional)']])
```

```js
m.form(instructions, [
  { tf: ['Statement', true] },
  { single: ['Question ?', ['A', 'B', 'C'], 1] },                       // index of the right option
  { multi: ['Question ?', [[true, 'A'], [false, 'B'], [true, 'C']]] },
  { fill: 'La bataille de <u>Marathon</u> a lieu en <u>490</u>.' },      // <u>…</u> = gap to type
  { dropdown: ['Les citoyens votent à l\'<u>Ecclésia</u>.', 'Héliée|Boulè'] },  // gaps as drop-downs + extra wrong choices
])
```
One questionnaire mixing types, corrected at the end.

```js
m.quickQuestions(instructions, [['Question ?', ['A', 'B', 'C', 'D'], 2, 'image.jpg'/*optional*/]])
```
One question at a time, exactly one right answer (2–4 options).

```js
m.multipleChoice(instructions, [['Question ?', ['A', 'B', 'C', 'D'], 'AC']])
```
Several right answers: the solution is the letters of the correct options.

```js
m.adaptiveQuiz(instructions, [[1, 'Easy question ?', ['A', 'B', 'C', 'D'], 0], [2, …], [3, …]], { rounds: 10, levelNames: ['Facile', 'Moyen', 'Difficile'] })
```
Difficulty (1–3) rises after a right answer and drops after a mistake. Provide at least `rounds` questions, ideally 5 per level.

```js
m.trivial(instructions, [{ name: 'Theme', questions: [['Question ?', ['A', 'B', 'C', 'D'], 0]] }])
```
Board game for several players; 2–6 themes, a few questions each.

## Word games

All **scored**. Words for `crossword` and `wordSearch`: capitals, no accents, no spaces or hyphens.

```js
m.crossword(instructions, [['AGORA', 'Definition']])          // 4–12 words that share letters
m.wordSearch(instructions, [['ATHENES', 'Definition']])
m.guess(instructions, [['Olympie', 'Definition', 'image.jpg'/*optional*/]])   // type the word from its definition
m.azQuiz(instructions, { A: ['Agora', 'Definition'], T: ['Stratège', 'Contains T: …', true] })
```
`azQuiz`: one entry per letter you want to use; the third item `true` means the word *contains* the letter instead of starting with it. Unused letters are skipped.

```js
m.complete(instructions, '<p>Les citoyens votent à l\'@@Ecclésia@@.</p>', 'Boulè, Héliée')
```
Gap-fill: `@@word@@` marks the gaps; the last argument adds distractors to the word bank.

## Sorting and matching

All **scored**.

```js
m.classify(instructions, ['Group A', 'Group B'], [['item', 0], ['item', 1]])         // 2–4 groups
m.sort(instructions, [{ definition: 'What to order', cards: ['first', 'second', 'third'] }])   // cards given in the right order
m.scrambledList(instructions, ['first', 'second', 'third'])                           // simple list to reorder
m.discover(instructions, [['Zeus', 'La foudre']])                                     // memory game: find the pairs
m.relate(instructions, [['Homère', "L'Odyssée", 'image.jpg'/*optional*/]])            // draw lines between two columns
m.flipcards(instructions, [['Front', 'Back', 'frontImage.jpg'/*optional*/]])          // revision cards
m.dragdrop(instructions, [['Label', 'image.jpg']])                                    // drag each label onto its image (3+ cards)
m.selectMedia(instructions, [{ definition: 'Which are …?', cards: [['text', true], ['text', false, 'image.jpg']] }])
m.identify(instructions, [{ img: 'x.jpg', question: 'Who is it ?', solution: 'Périclès', clues: ['clue 1', 'clue 2'] }])
```
`identify`: clues are revealed one by one (up to 8); fewer clues used = more points. `img` optional.

## Image games

**Scored.**

```js
m.puzzle(instructions, [{ img, definition: 'What it shows', clue: '…', rows: 3, cols: 3, slide: false }])
m.hiddenImage(instructions, [{ img, question: '…?', options: ['A', 'B', 'C', 'D'], solution: 0, rows: 4, cols: 4 }])
```
`puzzle`: `slide: true` makes a sliding-tile puzzle instead of swapping pieces. `hiddenImage`: the image is uncovered tile by tile while the learner answers.

## Maths and science

**Scored.**

```js
m.mathProblems(instructions, [{ wording: '<p>Une trière compte 170 rameurs. Combien pour {n} trières ?</p>', formula: '170*{n}', min: 2, max: 12, decimals: 0, feedback: '', tolerance: 0 }])
```
Variables `{a}` get random integers between `min` and `max` on each attempt; `formula` uses `+ - * / ( )` and the same variables. Make sure the result is a clean number (or set `decimals`).

```js
m.mathOperations(instructions, { number: '6', operations: '1110', min: '1', max: '20', negative: false })
```
Mental arithmetic drill. `operations` is four flags for + − × ÷ (`'1100'` = additions and subtractions). Values are strings.

```js
m.periodicTable(instructions, { number: '5', attempts: '2' })
```
Find elements in the periodic table.

## Challenges

**Scored.**

```js
m.challenge(instructions, { title, time: 20 /*minutes*/, solution: 'Alexandrie', description: html /*final riddle*/, challenges: [
  { title: 'Step 1', solution: 'Macédoine', description: html },
] })
```
Escape-game: solve the steps in order, then the final riddle. Answers are typed exactly — choose unambiguous single words and say in the question what form is expected.

```js
m.padlock(introHtml, { solution: '323', reward: html, minutes: 10, attempts: 5, errorMessage: '…' })
```
A code lock: `introHtml` gives the riddle, `reward` is the content revealed by the right code.

## Assessment and course-wide

```js
m.checklist(instructions, { title, subtitle, footer: '', levels: [
  [3, 0, '<strong>Section heading</strong>'],
  [0, 1, 'Je sais situer Athènes sur une carte.', 1],        // [type, indent, text, points]
] })
```
Self-assessment the learner ticks. Type `3` = heading, `0` = checkbox, `1` = checkbox + free text, `2` = selector.

```js
m.rubric({ caption: 'Grille d\'évaluation', levels: ['4 Excellent', '3 Bien', '2 Moyen', '1 Insuffisant'], rows: [
  ['Criterion', 'descriptor for level 4', 'for 3', 'for 2', 'for 1'],
] })
```
Assessment grid; best level first, one descriptor per level in each row.

```js
m.progressReport()
```
Summary of every scored activity with the learner's results. Put it once, on the last page.

```js
m.digcompedu({ '2.1': 'B1', '3.1': 'B2' })
```
For teachers: DigCompEdu competences (1.1–1.5, 2.1–2.3, 3.1–3.4, 4.1–4.3, 5.1–5.3, 6.1–6.5) with levels A1–C2. English labels only — use it only when the user asks.

```js
m.credits('<p>Optional intro</p>')
```
Table (file, author, licence) of the credited images actually used, from `credits.json`.

```js
m.downloadSource()
```
Button letting visitors of the exported site download the editable `.elpx`.
