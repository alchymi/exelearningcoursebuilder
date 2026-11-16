#!/usr/bin/env node
// Build an eXeLearning .elpx from a course description file.
//   node build.js <course.js> [--out <file.elpx>] [--container <name>] [--no-export] [--types]
// The course file exports { meta, content(api) }; images and files live in an "assets" folder beside it.
// Pipeline: course.js -> content.xml + resources -> zip -> eXeLearning CLI inside Docker (elp:export) -> full .elpx
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const core = require('./lib/core');
const { zipDir, unzip } = require('./lib/zip');

const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf('--' + name); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, 2); return v; };
const flag = name => { const i = args.indexOf('--' + name); if (i < 0) return false; args.splice(i, 1); return true; };
const outArg = opt('out'), containerArg = opt('container') || process.env.EXE_CONTAINER, langArg = opt('lang'), noExport = flag('no-export'), showTypes = flag('types');
const fail = msg => { console.error('ERROR: ' + msg); process.exit(1); };
if (!args[0]) fail('usage: node build.js <course.js> [--out <file.elpx>] [--container <name>] [--no-export] [--types]');

const courseFile = path.resolve(args[0]);
if (!fs.existsSync(courseFile)) fail('course file not found: ' + courseFile);
const courseDir = path.dirname(courseFile);
const course = require(courseFile);
if (!course.meta || !course.meta.title || typeof course.content !== 'function') fail('the course file must export { meta: { title, ... }, content(api) { ... } }');

const THEMES = ['base', 'cedec', 'educablue', 'etwinning', 'flux', 'intef', 'kids', 'neo', 'nova', 'universal', 'zen'];
const ICONS = 'activity agreement alert arts ask book calculate case chrono collaborative competencies diary diary_alt discuss download draw english experiment explore file gallery geography guide history info interactive letters listen math music nature objectives observe passport perform piece pieces play present reflection roadmap share sport start stop suitcase technology think think_alt video'.split(' ');
const LICENSES = ['public domain', 'creative commons: cc0 1.0', 'propietary license', 'not appropriate', 'gnu/gpl',
  ...['attribution', 'attribution - share alike', 'attribution - non derived work', 'attribution - non commercial', 'attribution - non commercial - share alike', 'attribution - non derived work - non commercial'].map(l => 'creative commons: ' + l + ' 4.0')];

const m = course.meta;
const slug = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'course';
const lang = langArg || m.lang || 'fr';
const warnings = [];
if (m.theme && !THEMES.includes(m.theme)) warnings.push(`unknown theme "${m.theme}" (known: ${THEMES.join(', ')})`);
if (m.license && !LICENSES.includes(m.license)) warnings.push(`license "${m.license}" is not one of the usual values: ${LICENSES.join(' | ')}`);
const props = {
  pp_title: m.title, pp_subtitle: m.subtitle || '', pp_author: m.author || '', pp_description: m.description || '', pp_lang: lang, pp_theme: m.theme || 'base',
  pp_license: m.license || 'creative commons: attribution - share alike 4.0',
  pp_addExeLink: 'true', pp_addPagination: 'true', pp_addSearchBox: 'true', pp_addAccessibilityToolbar: 'true', pp_addMathJax: m.math ? 'true' : 'false', exportSource: 'true',
  ...(m.properties || {}),
};

const assetsDir = path.resolve(courseDir, m.assets || 'assets');
const creditsFile = path.join(courseDir, 'credits.json');
const credits = fs.existsSync(creditsFile) ? JSON.parse(fs.readFileSync(creditsFile, 'utf8')) : {};
const hash = [...m.title].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(36).toUpperCase();
core.init({ lang, evalId: m.evaluationId || (slug(m.title).toUpperCase().slice(0, 12) + hash).replace(/-/g, ''), assetsDir, credits, meta: props });

// ---------- API handed to the course file ----------
const modules = { ...require('./lib/modules'), ...require('./lib/media') };
const P = modules.P; delete modules.P;
const img = (file, alt, width = 480, style = 'display:block;margin:0 auto;max-width:100%;height:auto;') => `<img src="${core.useAsset(file)}" alt="${core.attr(alt || '')}" width="${width}" style="${style}">`;
const fig = (file, alt, caption, width = 480) => `<figure style="text-align:center;margin:1em auto;">${img(file, alt, width)}<figcaption style="font-size:.9em;color:#555;">${caption}</figcaption></figure>`;
const api = { page: core.page, addBlock: core.addBlock, text: core.text, m: modules, asset: core.useAsset, img, fig, P, credits, lang };
try {
  course.content(api);
  core.finalize();
} catch (e) { fail(e.message + '\n' + String(e.stack).split('\n').slice(1, 4).join('\n')); }
if (!core.pages.length) fail('the course has no page');

for (const p of core.pages) for (const b of p.blocks) {
  if (b.icon && !ICONS.includes(b.icon)) warnings.push(`page "${p.title}", block "${b.name}": unknown icon "${b.icon}"`);
  if (!b.comps.length) warnings.push(`page "${p.title}", block "${b.name}" is empty`);
}

// ---------- stage: content.xml + content.dtd + content/resources ----------
const WORK = path.join(courseDir, '.elpx-build');
const STAGE = path.join(WORK, 'stage'), SITE = path.join(WORK, 'site');
for (const d of [STAGE, SITE]) { fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true }); }
const xml = core.buildXml(props);
fs.writeFileSync(path.join(STAGE, 'content.xml'), xml);
fs.copyFileSync(path.join(__dirname, 'data', 'content.dtd'), path.join(STAGE, 'content.dtd'));
const resDir = path.join(STAGE, 'content', 'resources');
fs.mkdirSync(resDir, { recursive: true });
for (const f of core.usedAssets) fs.copyFileSync(path.join(assetsDir, f), path.join(resDir, f));
const refs = new Set([...xml.matchAll(/\{\{context_path\}\}\/([^"'<>\s)\\]+)/g)].map(r => r[1]));
for (const r of refs) if (!core.usedAssets.has(r)) fail(`"{{context_path}}/${r}" is written in the content but the file was not registered: use asset('${r}') / img() / fig() so it gets packaged`);

const comps = core.pages.flatMap(p => p.blocks.flatMap(b => b.comps));
const types = [...new Set(comps.map(c => c.type))].sort();
console.log(`pages=${core.pages.length} modules=${comps.length} types=${types.length} scored=${comps.filter(c => c.evaluable).length} assets=${core.usedAssets.size} lang=${lang}`);
if (showTypes) console.log('types: ' + types.join(' '));
for (const w of warnings) console.log('WARNING: ' + w);

const FINAL = path.resolve(outArg || path.join(courseDir, slug(m.title) + '.elpx'));
const stub = path.join(WORK, 'source.zip');
fs.rmSync(stub, { force: true });
zipDir(STAGE, stub);

if (noExport) {
  fs.copyFileSync(stub, FINAL);
  console.log('OK (source only, not exported: no HTML preview inside) ' + FINAL + ' ' + fs.statSync(FINAL).size + 'B');
  process.exit(0);
}

// ---------- export through the eXeLearning CLI running in Docker ----------
const docker = (...a) => execFileSync('docker', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, MSYS_NO_PATHCONV: '1' } });
let container = containerArg;
if (!container) {
  let ps;
  try { ps = docker('ps', '--format', '{{.Names}}\t{{.Image}}'); } catch (e) { fail('Docker is not reachable (is Docker Desktop running?). Start it, or pass --no-export to get a source-only .elpx.\n' + String(e.stderr || e.message).trim()); }
  const hit = ps.split('\n').map(l => l.split('\t')).find(([name, image]) => /exelearning/i.test(image || '') || /exelearning/i.test(name || ''));
  if (!hit) fail('no running eXeLearning container found. Start one (e.g. "docker run -d -p 8080:8080 --name exelearning ghcr.io/exelearning/exelearning:latest"), pass --container <name>, or use --no-export.');
  container = hit[0];
}
const tag = 'elpx-' + process.pid;
try {
  docker('exec', container, 'sh', '-c', `mkdir -p /tmp/${tag}`);
  docker('cp', stub, `${container}:/tmp/${tag}/in.elpx`);
  const log = docker('exec', container, 'sh', '-c', `cd /app && bun cli elp:export /tmp/${tag}/in.elpx /tmp/${tag}/out.elpx elpx 2>&1 | tail -15`);
  if (!/SUCCESS/.test(log)) fail('eXeLearning export failed:\n' + log);
  fs.mkdirSync(path.dirname(FINAL), { recursive: true });
  docker('cp', `${container}:/tmp/${tag}/out.elpx`, FINAL);
} catch (e) { fail('export through container "' + container + '" failed: ' + String(e.stderr || e.message).trim()); }
finally { try { docker('exec', container, 'rm', '-rf', `/tmp/${tag}`); } catch (e) { } }

// ---------- verify the exported package ----------
unzip(FINAL, SITE);
const problems = [];
if (!fs.existsSync(path.join(SITE, 'index.html'))) problems.push('index.html missing from the export');
if (!fs.existsSync(path.join(SITE, 'content.xml'))) problems.push('content.xml missing from the export');
const htmlFiles = ['index.html', ...(fs.existsSync(path.join(SITE, 'html')) ? fs.readdirSync(path.join(SITE, 'html')).map(f => 'html/' + f) : [])].filter(f => fs.existsSync(path.join(SITE, f)));
if (htmlFiles.length !== core.pages.length) problems.push(`expected ${core.pages.length} html pages, found ${htmlFiles.length}`);
const allHtml = htmlFiles.map(f => fs.readFileSync(path.join(SITE, f), 'utf8')).join('\n');
for (const c of comps) if (!allHtml.includes(c.id)) problems.push(`module ${c.type} (${c.id}) is absent from the exported pages`);
for (const f of core.usedAssets) if (!fs.existsSync(path.join(SITE, 'content', 'resources', f))) problems.push('asset missing from the export: ' + f);
for (const p of problems) console.log('PROBLEM: ' + p);
console.log((problems.length ? 'BUILT WITH PROBLEMS ' : 'OK ') + FINAL + ' ' + fs.statSync(FINAL).size + 'B');
console.log('exported site (for checking in a browser): ' + SITE);
process.exit(problems.length ? 2 : 0);
