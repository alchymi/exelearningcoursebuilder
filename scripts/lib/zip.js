// Minimal ZIP writer/reader (deflate), so the build needs no external zip/tar tool.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }

function walk(dir, base = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? base + '/' + e.name : e.name;
    if (e.isDirectory()) out.push(...walk(path.join(dir, e.name), rel)); else out.push(rel);
  }
  return out;
}

// Zip every file under `dir` (paths relative to dir, forward slashes) into `zipFile`.
function zipDir(dir, zipFile) {
  const parts = [], central = [];
  let offset = 0;
  for (const rel of walk(dir)) {
    const data = fs.readFileSync(path.join(dir, rel));
    const name = Buffer.from(rel, 'utf8');
    const comp = zlib.deflateRawSync(data, { level: 6 });
    const stored = comp.length >= data.length;
    const body = stored ? data : comp;
    const crc = crc32(data);
    const h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(0x0800, 6); h.writeUInt16LE(stored ? 0 : 8, 8);
    h.writeUInt16LE(0, 10); h.writeUInt16LE(0x21, 12); h.writeUInt32LE(crc, 14); h.writeUInt32LE(body.length, 18); h.writeUInt32LE(data.length, 22);
    h.writeUInt16LE(name.length, 26); h.writeUInt16LE(0, 28);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0x0800, 8); c.writeUInt16LE(stored ? 0 : 8, 10);
    c.writeUInt16LE(0, 12); c.writeUInt16LE(0x21, 14); c.writeUInt32LE(crc, 16); c.writeUInt32LE(body.length, 20); c.writeUInt32LE(data.length, 24);
    c.writeUInt16LE(name.length, 28); c.writeUInt32LE(offset, 42);
    parts.push(h, name, body); central.push(c, name);
    offset += 30 + name.length + body.length;
  }
  const cd = Buffer.concat(central);
  const end = Buffer.alloc(22);
  const n = central.length / 2;
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(n, 8); end.writeUInt16LE(n, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  fs.writeFileSync(zipFile, Buffer.concat([...parts, cd, end]));
}

// List entries of a zip: [{name, read()}]
function readZip(zipFile) {
  const b = fs.readFileSync(zipFile);
  let e = b.length - 22;
  while (e >= 0 && b.readUInt32LE(e) !== 0x06054b50) e--;
  if (e < 0) throw new Error('not a zip file: ' + zipFile);
  const n = b.readUInt16LE(e + 10);
  let p = b.readUInt32LE(e + 16);
  const out = [];
  for (let i = 0; i < n; i++) {
    const method = b.readUInt16LE(p + 10), csize = b.readUInt32LE(p + 20), nl = b.readUInt16LE(p + 28), el = b.readUInt16LE(p + 30), cl = b.readUInt16LE(p + 32), lo = b.readUInt32LE(p + 42);
    const name = b.slice(p + 46, p + 46 + nl).toString('utf8');
    out.push({ name, read: () => { const s = lo + 30 + b.readUInt16LE(lo + 26) + b.readUInt16LE(lo + 28); const raw = b.slice(s, s + csize); return method === 0 ? raw : zlib.inflateRawSync(raw); } });
    p += 46 + nl + el + cl;
  }
  return out;
}

function unzip(zipFile, dir) {
  for (const f of readZip(zipFile)) {
    if (f.name.endsWith('/')) continue;
    const dest = path.join(dir, f.name);
    if (!path.resolve(dest).startsWith(path.resolve(dir))) continue;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, f.read());
  }
}

module.exports = { zipDir, readZip, unzip };
