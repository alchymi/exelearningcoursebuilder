#!/usr/bin/env node
// Node 18+, no dependencies. Planning is offline; generation uses the fal queue.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const MODEL = 'fal-ai/ideogram/v3';
const STYLES = {
  concept: ['DESIGN', 'Clean editorial illustration, simplified shapes, clear visual hierarchy'],
  process: ['DESIGN', 'Flat educational illustration, distinct sequential actions, uncluttered composition'],
  scenario: ['REALISTIC', 'Natural documentary-style training photograph, plausible workplace and equipment'],
  children: ['GENERAL', 'Warm illustrated storybook scene, rounded shapes, welcoming age-appropriate characters'],
};
function required(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing ${name}`);
  return value.trim();
}
function plan(brief) {
  if (!['generate', 'source', 'diagram', 'skip'].includes(brief.decision)) throw new Error('decision must be generate, source, diagram or skip');
  required(brief.reason, 'reason');
  if (brief.decision !== 'generate') return { decision: brief.decision, reason: brief.reason };
  const purpose = brief.purpose || 'concept';
  if (!STYLES[purpose]) throw new Error('purpose must be concept, process, scenario or children');
  const [style, direction] = STYLES[purpose];
  const imageSize = brief.image_size || 'landscape_16_9';
  if (!['square_hd', 'square', 'portrait_4_3', 'portrait_16_9', 'landscape_4_3', 'landscape_16_9'].includes(imageSize)) throw new Error('Invalid image_size');
  const prompt = [
    'Create one educational course illustration.',
    `Learning objective: ${required(brief.objective, 'objective')}.`,
    `Audience: ${required(brief.audience, 'audience')}.`,
    `Depict this concrete scene: ${required(brief.scene, 'scene')}.`,
    `Visual direction: ${brief.visual_direction || direction}.`,
    `Course visual identity: ${brief.visual_identity || 'navy blue, teal and warm off-white; restrained palette; consistent natural proportions'}.`,
    `Composition: ${brief.composition || 'one clear focal point, readable at small screen sizes, generous breathing room'}.`,
    brief.constraints ? `Required details: ${brief.constraints}.` : '',
    'No text, letters, captions, logos or watermarks. Put explanatory labels in the course HTML instead.',
    'Show only the requested educational idea; avoid irrelevant decorative objects.',
  ].filter(Boolean).join('\n');
  return { decision: 'generate', reason: brief.reason, alt: required(brief.alt, 'alt'), model: MODEL,
    input: { prompt, style, image_size: imageSize, num_images: 1, rendering_speed: 'BALANCED', enable_prompt_expansion: false,
      negative_prompt: 'illegible text, watermark, logo, clutter, misleading scientific details' } };
}
function loadKey(file) {
  if (process.env.FAL_KEY) return process.env.FAL_KEY.trim();
  if (!file) throw new Error('Set FAL_KEY or pass --key-file <path>');
  const raw = fs.readFileSync(path.resolve(file), 'utf8').trim();
  const match = raw.match(/^\s*(?:apikeyfal|FAL_KEY)\s*[:=]\s*["']?([^\s"']+)["']?\s*$/im);
  if (match) return match[1];
  if (/^\S+$/.test(raw)) return raw;
  throw new Error('Credential file must contain FAL_KEY=..., apikeyfal: ..., or a raw key');
}
async function api(url, key, input) {
  const parsed = new URL(url);
  if (parsed.origin !== 'https://queue.fal.run') throw new Error('Unexpected queue URL');
  const res = await fetch(url, { method: input ? 'POST' : 'GET', redirect: 'error',
    headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
    body: input ? JSON.stringify(input) : undefined, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`fal API HTTP ${res.status}; no automatic resubmission`);
  return res.json();
}
async function generate(prepared, out, key, apiCall = api, download = fetch) {
  if (prepared.decision !== 'generate') throw new Error(`Decision is ${prepared.decision}; generation skipped`);
  if (!/\.(png|jpg|jpeg|webp)$/i.test(out)) throw new Error('Output must end in .png, .jpg or .webp');
  const manifest = out + '.generation.json';
  fs.mkdirSync(path.dirname(out), { recursive: true });
  // Reserve the filename before submission to avoid duplicate billed requests on rerun.
  if (fs.existsSync(out)) throw new Error('Output already exists');
  fs.writeFileSync(manifest, JSON.stringify({ ...prepared, state: 'submitting' }, null, 2), { flag: 'wx' });
  const queued = await apiCall(`https://queue.fal.run/${MODEL}`, key, prepared.input);
  fs.writeFileSync(manifest, JSON.stringify({ ...prepared, state: 'queued', queue: queued }, null, 2));
  console.log(`Request ${queued.request_id}; tracking saved in ${manifest}`);
  const deadline = Date.now() + 240000;
  while (true) {
    const status = await apiCall(queued.status_url, key);
    if (status.error) throw new Error('fal request failed; inspect the request in your fal dashboard');
    if (status.status === 'COMPLETED') break;
    if (!['IN_QUEUE', 'IN_PROGRESS'].includes(status.status)) throw new Error('Unexpected queue status');
    if (Date.now() > deadline) throw new Error('Polling timed out; request may still run. Do not resubmit; use saved queue URLs');
    await new Promise(resolve => setTimeout(resolve, 2500));
  }
  const result = await apiCall(queued.response_url, key);
  const image = result.images?.[0];
  if (!image?.url) throw new Error('No image returned (possibly filtered)');
  const url = new URL(image.url);
  if (url.protocol !== 'https:') throw new Error('Expected HTTPS image');
  const response = await download(url, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`Image download HTTP ${response.status}`);
  const mime = response.headers.get('content-type')?.split(';')[0];
  const extensions = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' };
  if (!extensions[mime]) throw new Error('Unsupported image content type');
  // Match the file extension to the actual downloaded format.
  const actualOut = out.replace(/\.(png|jpe?g|webp)$/i, extensions[mime]);
  fs.writeFileSync(actualOut, Buffer.from(await response.arrayBuffer()), { flag: 'wx' });
  fs.writeFileSync(manifest, JSON.stringify({ ...prepared, state: 'completed', queue: queued,
    file: path.basename(actualOut), generated_at: new Date().toISOString(), result }, null, 2));
  console.log(`Saved ${actualOut}\nAlt: ${prepared.alt}\nCredit: AI-generated illustration, Ideogram v3 via fal.ai (not a documentary source).`);
  return actualOut;
}
async function main(args) {
  const [command, briefFile, ...rest] = args;
  if (!['plan', 'generate'].includes(command) || !briefFile) throw new Error('Usage: node illustrate.js plan|generate brief.json [--out assets/name.png] [--key-file path]');
  const options = {};
  for (let i = 0; i < rest.length; i += 2) {
    if (!['--out', '--key-file'].includes(rest[i]) || !rest[i + 1]) throw new Error('Invalid option');
    options[rest[i]] = rest[i + 1];
  }
  const prepared = plan(JSON.parse(fs.readFileSync(briefFile, 'utf8').replace(/^\uFEFF/, '')));
  if (command === 'plan') return console.log(JSON.stringify(prepared, null, 2));
  if (prepared.decision !== 'generate') return console.log(`No API call: ${prepared.decision}. ${prepared.reason}`);
  const out = path.resolve(required(options['--out'], '--out'));
  await generate(prepared, out, loadKey(options['--key-file']));
}
if (require.main === module) main(process.argv.slice(2)).catch(error => { console.error(`ERROR: ${error.message}`); process.exitCode = 1; });
module.exports = { plan, loadKey, generate };
