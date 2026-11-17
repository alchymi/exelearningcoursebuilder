# Course illustrations with fal.ai

The agent using this skill makes the pedagogical decision and writes the visual brief.
`scripts/illustrate.js` is a deterministic prompt composer and API executor, not a second language model.
Use Node.js 18+; no extra packages are required.

## Decide and art-direct

Generate when a concrete scenario or visual analogy helps explain the learning objective.
Use a documentary source for real historical objects, artworks, identifiable places or evidence.
Use SVG/HTML for exact diagrams, charts, equations and labels; do not trust raster generation
for scientific accuracy. Skip illustrations that merely decorate or reveal an assessment answer.

Choose one visual identity for the course (palette, composition, character treatment) and reuse it.
Choose `purpose`: `concept` (editorial DESIGN), `process` (flat DESIGN), `scenario` (REALISTIC),
or `children` (storybook GENERAL). Override `visual_direction` for the actual topic and audience.
Describe the subject, action, setting, viewpoint and meaningful relationships in `scene`.
Write the scene/direction in English for the model, and `alt` in the course language.
Keep labels and teaching text in HTML. Generated scenes are illustrations, not factual evidence.

Save a brief beside `course.js`, for example `illustration-brief.json`:

```json
{
  "decision": "generate",
  "reason": "A concrete workplace scene helps learners identify where to pause before opening a suspicious attachment.",
  "objective": "Recognize an unexpected email attachment as a reason to verify the sender",
  "audience": "French-speaking adults beginning workplace cybersecurity training",
  "purpose": "concept",
  "scene": "An office worker pauses with their hand above the mouse, looking at a laptop showing an envelope icon with an attachment symbol. A colleague offers a separate phone to verify the message. Three-quarter view, two people, no readable screen text.",
  "visual_identity": "Navy blue, teal, warm ivory, a restrained coral accent; clean editorial illustration",
  "composition": "Landscape, laptop at left, verification phone at right, clear contrast between the two actions",
  "constraints": "Do not depict a successful hack or imply that opening the attachment is safe",
  "alt": "Une personne suspend l’ouverture d’une pièce jointe et vérifie le message par téléphone.",
  "image_size": "landscape_16_9"
}
```

Other decisions are `source`, `diagram` and `skip`, with a `reason`; they never call fal.

## Run

From `F:\exelearning` (paths can also be absolute):

```powershell
node .agents/skills/exelearning-course-builder/scripts/illustrate.js plan cours-test/illustration-brief.json
node .agents/skills/exelearning-course-builder/scripts/illustrate.js generate cours-test/illustration-brief.json --out cours-test/assets/email-verification.png --key-file tocken.git
```

Planning is offline and does not read the credential. Generation submits one billable image
to `fal-ai/ideogram/v3`. Use `FAL_KEY` from the environment in preference to a file;
the local `tocken.git` file can contain `apikeyfal: KEY`, `FAL_KEY=KEY`, or the raw key.
Never copy credentials into briefs, courses, manifests, logs or published skill files.

The script saves the actual image format and a `.generation.json` sidecar containing the prompt,
request ID, queue URLs and provenance. Use the filename printed by the script.
Existing output/manifest files prevent accidental duplicate submissions. On a failure or timeout,
inspect the saved request in the fal dashboard before starting another generation; a queued request
may still incur a charge. Do not automatically retry submission.

Inspect the image before teaching with it. Correct the alt text to describe the actual result,
then integrate using `fig('email-verification.png', alt, 'Illustration générée par IA — Ideogram v3 via fal.ai', 720)`
(adjust the extension). Keep provenance beside the course; do not claim a Wikimedia/CC license
for generated images. All required information must also be available as text.

API references (checked 2026-11-16):
- https://fal.ai/models/fal-ai/ideogram/v3/api
- https://docs.fal.ai/model-apis/model-endpoints/queue
