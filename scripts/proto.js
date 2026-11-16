// Inspect a prototype: node proto.js <type> [game|json|html] [path.to.field]   (env SL=string limit, AN=array items)
const P = require('./data/prototypes.json').protos;
const [, , type, part = 'game', pth] = process.argv;
const SL = +process.env.SL || 160, AN = +process.env.AN || 2;
let o = P[type][part];
if (pth) for (const k of pth.split('.')) o = o[k];
const t = v => {
  if (typeof v === 'string') return v.length > SL ? v.slice(0, SL) + '…[' + v.length + ']' : v;
  if (Array.isArray(v)) { const a = v.slice(0, AN).map(t); if (v.length > AN) a.push('…(' + v.length + ')'); return a; }
  if (v && typeof v === 'object') { const r = {}; for (const k in v) r[k] = (k === 'msgs' || k === 'i18n') && !pth ? '{' + Object.keys(v[k]).length + ' keys}' : t(v[k]); return r; }
  return v;
};
console.log(typeof o === 'string' ? o.slice(0, +process.env.HN || 3000) : JSON.stringify(t(o)));
