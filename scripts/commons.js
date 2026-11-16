// node commons.js info "File:A.jpg|File:B.jpg"   -> existence + license
// node commons.js search "query"                  -> top file hits with license
// node commons.js get <outDir> <width> name=File:A.jpg ... -> download thumbs + write credits.json
const fs = require('fs'), path = require('path');
const UA = 'elpx-course-builder/1.0 (educational; node fetch)';
const api = async params => {
  const u = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', origin: '*', ...params });
  const r = await fetch(u, { headers: { 'User-Agent': UA } });
  return r.json();
};
const strip = s => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const infoOf = p => {
  const ii = p.imageinfo && p.imageinfo[0]; if (!ii) return null;
  const m = ii.extmetadata || {};
  return { title: p.title, w: ii.width, h: ii.height, mime: ii.mime, thumb: ii.thumburl, url: ii.url, page: ii.descriptionurl,
    license: strip(m.LicenseShortName && m.LicenseShortName.value), artist: strip(m.Artist && m.Artist.value).slice(0, 120), licenseUrl: m.LicenseUrl && m.LicenseUrl.value };
};
const info = async (titles, width) => {
  const j = await api({ action: 'query', titles, prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: width || 1000 });
  return Object.values(j.query.pages).map(p => infoOf(p) || { title: p.title, missing: true });
};
(async () => {
  const [, , cmd, ...a] = process.argv;
  if (cmd === 'info') { for (const i of await info(a[0])) console.log(i.missing ? 'MISSING ' + i.title : `${i.title} | ${i.w}x${i.h} | ${i.license} | ${i.artist}`); }
  else if (cmd === 'search') {
    const j = await api({ action: 'query', generator: 'search', gsrsearch: a[0] + ' filetype:bitmap|drawing', gsrnamespace: 6, gsrlimit: a[1] || 8, prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: 1000 });
    for (const p of Object.values((j.query || {}).pages || {}).sort((x, y) => x.index - y.index)) { const i = infoOf(p); console.log(`${i.title} | ${i.w}x${i.h} | ${i.license} | ${i.artist}`); }
  } else if (cmd === 'get') {
    const [outDir, width, ...pairs] = a; fs.mkdirSync(outDir, { recursive: true });
    const credFile = path.join(outDir, '..', 'credits.json');
    const credits = fs.existsSync(credFile) ? JSON.parse(fs.readFileSync(credFile, 'utf8')) : {};
    for (const pr of pairs) {
      const k = pr.indexOf('='); const name = pr.slice(0, k), title = pr.slice(k + 1);
      let i;
      for (let t = 0; t < 5; t++) { try { [i] = await info(title, width); break; } catch (e) { await new Promise(res => setTimeout(res, 8000 * (t + 1))); } }
      if (!i) { console.log('FAILED ' + title); continue; }
      if (i.missing) { console.log('MISSING ' + title); continue; }
      const have = fs.readdirSync(outDir).find(f => f.replace(/\.[^.]+$/, '') === name);
      if (have && !process.env.FORCE) { credits[have] = { title: i.title.replace(/^File:/, ''), artist: i.artist, license: i.license, licenseUrl: i.licenseUrl || '', page: i.page }; fs.writeFileSync(credFile, JSON.stringify(credits, null, 1)); console.log('have ' + have); await new Promise(res => setTimeout(res, 1500)); continue; }
      const src = i.w <= +width && !/svg/.test(i.mime) ? i.url : i.thumb;
      const r = await fetch(src, { headers: { 'User-Agent': UA } });
      if (!r.ok) { console.log('HTTP ' + r.status + ' ' + title); continue; }
      const ext = /svg/.test(i.mime) ? '.png' : path.extname(new URL(src).pathname).toLowerCase().replace('jpeg', 'jpg');
      const buf = Buffer.from(await r.arrayBuffer());
      fs.writeFileSync(path.join(outDir, name + ext), buf);
      credits[name + ext] = { title: i.title.replace(/^File:/, ''), artist: i.artist, license: i.license, licenseUrl: i.licenseUrl || '', page: i.page };
      console.log(`${name}${ext} ${buf.length}B | ${i.license} | ${i.artist}`);
      fs.writeFileSync(credFile, JSON.stringify(credits, null, 1));
      await new Promise(res => setTimeout(res, 3000));
    }
    fs.writeFileSync(credFile, JSON.stringify(credits, null, 1));
  }
})().catch(e => { console.error(e); process.exit(1); });
