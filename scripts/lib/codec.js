// Shared helpers: parse content.xml components, decode/encode game payloads.
const fs = require('fs');

const xor = s => { let o = ''; for (let i = 0; i < s.length; i++) o += String.fromCharCode(s.charCodeAt(i) ^ 146); return o; };
const encrypt = s => escape(xor(s));
const decrypt = s => xor(unescape(s));

function field(c, t) {
  const m = c.match(new RegExp('<' + t + '>([^]*?)</' + t + '>'));
  if (!m) return null;
  const cd = m[1].match(/^\s*<!\[CDATA\[([^]*)\]\]>\s*$/);
  return cd ? cd[1].split(']]]]><![CDATA[>').join(']]>') : m[1];
}

function parseComponents(xmlPath) {
  const xml = fs.readFileSync(xmlPath, 'utf8');
  const out = [];
  for (const m of xml.matchAll(/<odeComponent>([^]*?)<\/odeComponent>/g)) {
    const c = m[1];
    out.push({ type: field(c, 'odeIdeviceTypeName'), id: field(c, 'odeIdeviceId'), html: field(c, 'htmlView') || '', json: field(c, 'jsonProperties') });
  }
  return out;
}

// Find the payload of the first element whose class contains `marker` (e.g. "DataGame").
function extractGame(html, marker = 'DataGame') {
  const re = new RegExp('<div[^>]*(?:class|id)="[^"]*' + marker + '[^"]*"[^>]*>');
  const m = html.match(re);
  if (!m) return null;
  const start = m.index + m[0].length;
  let i = start;
  while (/\s/.test(html[i])) i++;
  let end, enc, obj;
  if (html[i] === '{') {
    // raw JSON: brace matching, string aware
    let depth = 0, inStr = false, j = i;
    for (; j < html.length; j++) {
      const ch = html[j];
      if (inStr) { if (ch === '\\') j++; else if (ch === '"') inStr = false; continue; }
      if (ch === '"') inStr = true;
      else if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) { j++; break; } }
    }
    end = j; enc = 'raw'; obj = JSON.parse(html.slice(i, end));
  } else {
    end = html.indexOf('<', start);
    const b = html.slice(start, end).trim();
    try { obj = JSON.parse(decodeURIComponent(b)); enc = 'uri'; } catch (e) { obj = JSON.parse(decrypt(b)); enc = 'xor'; }
  }
  return { enc, obj, start, end };
}

function encodeGame(obj, enc) {
  const s = JSON.stringify(obj);
  if (enc === 'xor') return encrypt(s);
  if (enc === 'uri') return encodeURIComponent(s);
  return s;
}

module.exports = { xor, encrypt, decrypt, field, parseComponents, extractGame, encodeGame };
