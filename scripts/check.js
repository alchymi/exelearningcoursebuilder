#!/usr/bin/env node
// Browser check of an exported course: opens every page, starts the games, reports JavaScript errors, saves screenshots.
//   node check.js <course folder or .elpx-build/site folder> [--shots <dir>] [--page <substring>]
// Needs playwright-core (once: "npm install --prefix <skill>/scripts playwright-core") and Edge or Chrome installed.
const http = require('http'), fs = require('fs'), path = require('path');
let chromium;
try { ({ chromium } = require('playwright-core')); } catch (e) {
  console.error('playwright-core is not installed. Run once:\n  npm install --prefix "' + __dirname + '" playwright-core\nthen run this check again.');
  process.exit(3);
}
const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf('--' + n); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, 2); return v; };
const shotsArg = opt('shots'), filter = opt('page');
let site = path.resolve(args[0] || '.');
if (!fs.existsSync(path.join(site, 'index.html')) && fs.existsSync(path.join(site, '.elpx-build', 'site', 'index.html'))) site = path.join(site, '.elpx-build', 'site');
if (!fs.existsSync(path.join(site, 'index.html'))) { console.error('no index.html in ' + site + ' (build the course first)'); process.exit(1); }
const shots = path.resolve(shotsArg || path.join(site, '..', 'shots'));
fs.mkdirSync(shots, { recursive: true });

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.gif': 'image/gif', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.stl': 'model/stl', '.glb': 'model/gltf-binary', '.txt': 'text/plain; charset=utf-8', '.pdf': 'application/pdf', '.xml': 'application/xml' };
const server = http.createServer((q, s) => {
  const p = path.join(site, decodeURIComponent(q.url.split('?')[0]));
  if (!p.startsWith(site) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(s);
});
const NL = String.fromCharCode(10);
const START = /(Cliquer|Cliquez) ici pour (jouer|commencer)|Click here to (play|start)|Hier klicken|Klicken Sie hier|clic aqu[ií] para (jugar|empezar|comenzar)/i;

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port + '/';
  const files = ['index.html', ...(fs.existsSync(path.join(site, 'html')) ? fs.readdirSync(path.join(site, 'html')).map(f => 'html/' + f) : [])].filter(f => !filter || f.includes(filter));
  let browser;
  for (const channel of ['msedge', 'chrome', undefined]) { try { browser = await chromium.launch({ channel, headless: true }); break; } catch (e) { } }
  if (!browser) { console.error('no browser found (Edge or Chrome is required)'); process.exit(3); }
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  let bad = 0;
  for (const f of files) {
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('JS ERROR ' + String(e.message).slice(0, 160) + ' @ ' + String(e.stack || '').split(NL).slice(1, 2).join('').trim().slice(0, 140)));
    page.on('response', r => { if (r.status() >= 400 && r.url().startsWith(base)) errs.push(r.status() + ' ' + r.url().replace(base, '')); });
    page.on('dialog', d => { errs.push('DIALOG ' + d.message().slice(0, 120)); d.dismiss().catch(() => { }); });
    await page.goto(base + f, { waitUntil: 'load' });
    await page.waitForTimeout(2500);
    const starts = page.locator('a:visible, button:visible').filter({ hasText: START });
    const n = await starts.count();
    let clicked = 0;
    for (let i = 0; i < n; i++) { try { await starts.nth(i).click({ timeout: 2000 }); clicked++; await page.waitForTimeout(700); } catch (e) { } }
    await page.waitForTimeout(2000);
    const info = await page.evaluate(() => [...document.querySelectorAll('.idevice_node')].map(n => {
      const r = n.getBoundingClientRect();
      return (n.getAttribute('data-idevice-type') || '?') + ':' + Math.round(r.height) + 'px';
    }));
    const flat = info.filter(i => /:([0-9]|[1-3][0-9])px$/.test(i));
    await page.screenshot({ path: path.join(shots, f.replace(/[\/\\]/g, '_').replace('.html', '.png')), fullPage: true });
    const problem = errs.length || flat.length;
    if (problem) bad++;
    console.log((problem ? 'CHECK ' : 'ok    ') + f + ' games started=' + clicked + '/' + n + ' modules=' + info.length + (flat.length ? NL + '      nearly empty (height < 40px): ' + flat.join(' ') : '') + (errs.length ? NL + '      ' + [...new Set(errs)].slice(0, 6).join(NL + '      ') : ''));
    await page.close();
  }
  await browser.close(); server.close();
  console.log((bad ? bad + ' page(s) to look at. ' : 'All pages loaded without error. ') + 'Screenshots: ' + shots);
})().catch(e => { console.error(e); process.exit(1); });
