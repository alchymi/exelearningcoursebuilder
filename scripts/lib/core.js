// Core: project tree, ids, content.xml (ODE 2.0) writer, generic "DataGame" builder, text iDevice.
const fs = require('fs');
const path = require('path');
const { encodeGame } = require('./codec');
const strings = require('./strings');

const DATA = path.join(__dirname, '..', 'data');
const clone = o => JSON.parse(JSON.stringify(o));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const cdata = s => '<![CDATA[' + String(s).split(']]>').join(']]]]><![CDATA[>') + ']]>';

// ---------- state of the current build (one course per process) ----------
const cfg = { lang: 'fr', evalId: 'COURSE', assetsDir: '', credits: {}, meta: {}, S: strings('fr'), stamp: '' };
const PROTO = {};
const EXTRA_MSGS = {};
const pages = [];
const usedAssets = new Set();
let counter = 0;

const I18N_LANGS = fs.readdirSync(path.join(DATA, 'i18n')).map(f => f.replace('.json', ''));

function init({ lang = 'fr', evalId, assetsDir, credits = {}, meta = {} }) {
  const base = lang.toLowerCase().split(/[-_]/)[0];
  const uiLang = I18N_LANGS.includes(base) ? base : 'en';
  const protos = JSON.parse(fs.readFileSync(path.join(DATA, 'prototypes.json'), 'utf8')).protos;
  const i18n = JSON.parse(fs.readFileSync(path.join(DATA, 'i18n', uiLang + '.json'), 'utf8'));
  for (const [type, parts] of Object.entries(i18n.types)) for (const [part, over] of Object.entries(parts)) if (protos[type] && protos[type][part]) Object.assign(protos[type][part], over);
  for (const k of Object.keys(PROTO)) delete PROTO[k];
  Object.assign(PROTO, protos);
  Object.assign(EXTRA_MSGS, i18n.extra || {});
  const d = new Date(), p2 = n => String(n).padStart(2, '0');
  Object.assign(cfg, { lang: base, uiLang, evalId, assetsDir, credits, meta, S: strings(base), stamp: '' + d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + p2(d.getHours()) + p2(d.getMinutes()) + p2(d.getSeconds()) });
  pages.length = 0; usedAssets.clear(); counter = 0;
}

// identifiers: 14 digits + 6 chars [A-Z0-9]
function newId(kind = 'X') { counter++; return cfg.stamp + kind + counter.toString(36).toUpperCase().padStart(5, '0'); }

// ---------- assets ----------
// Register a file of the assets folder and return the URL to write in HTML/JSON.
function useAsset(file) {
  if (/[\s#?%&'"()]/.test(file)) throw new Error(`asset file name "${file}": use only letters, digits, dot, dash and underscore`);
  if (!fs.existsSync(path.join(cfg.assetsDir, file))) throw new Error(`asset not found: ${file} (expected in ${cfg.assetsDir})`);
  usedAssets.add(file);
  return '{{context_path}}/' + file;
}

// ---------- project tree ----------
// A component is a function (id, page, block) => {type, html, json, evaluable?}; it runs at finalize time.
function page(title, parent, blocks) {
  const p = { id: newId('P'), title, parentId: parent ? parent.id : '', blocks: [] };
  pages.push(p);
  for (const b of blocks || []) addBlock(p, b);
  return p;
}
function addBlock(p, b) {
  if (!b || !Array.isArray(b.comps)) throw new Error(`page "${p.title}": a block needs {name, icon?, comps: [...]}`);
  const blk = { id: newId('B'), name: b.name || '', icon: b.icon || '', comps: [] };
  for (const make of b.comps) {
    if (typeof make !== 'function') throw new Error(`page "${p.title}", block "${blk.name}": every item of comps must be a module call such as text(...) or m.crossword(...)`);
    blk.comps.push({ id: newId('I'), make, type: make.type, evaluable: !!make.evaluable });
  }
  p.blocks.push(blk);
  return blk;
}
// Run every component builder; those flagged `late` (progress report, credits) run last because they read the whole tree.
function finalize() {
  for (const late of [false, true]) for (const p of pages) for (const b of p.blocks) for (const c of b.comps) {
    if (!!c.make.late !== late || c.done) continue;
    const r = c.make(c.id, p, b);
    Object.assign(c, { type: r.type, html: r.html, json: r.json, evaluable: !!r.evaluable, done: true });
  }
}

// ---------- XML ----------
const kv = (tag, o) => Object.entries(o).map(([k, v]) => `<${tag}><key>${k}</key><value>${esc(v)}</value></${tag}>`).join('\n');

function buildXml(props) {
  const out = [];
  out.push('<?xml version="1.0" encoding="UTF-8"?>', '<!DOCTYPE ode SYSTEM "content.dtd">', '<ode xmlns="http://www.intef.es/xsd/ode" version="2.0">');
  out.push('<userPreferences>', kv('userPreference', { theme: props.pp_theme || 'base' }), '</userPreferences>');
  out.push('<odeResources>', kv('odeResource', { odeId: newId('O'), odeVersionId: newId('V'), exe_version: '3.0' }), '</odeResources>');
  out.push('<odeProperties>', kv('odeProperty', props), '</odeProperties>');
  out.push('<odeNavStructures>');
  const order = {};
  for (const p of pages) {
    order[p.parentId] = (order[p.parentId] || 0) + 1;
    out.push('<odeNavStructure>', `<odePageId>${p.id}</odePageId>`, `<odeParentPageId>${p.parentId}</odeParentPageId>`, `<pageName>${esc(p.title)}</pageName>`, `<odeNavStructureOrder>${order[p.parentId]}</odeNavStructureOrder>`);
    out.push('<odeNavStructureProperties>', kv('odeNavStructureProperty', { titlePage: p.title, visibility: 'true', highlight: 'false', hidePageTitle: 'false', editableInPage: 'false', titleNode: p.title, titleHtml: '' }), '</odeNavStructureProperties>');
    out.push('<odePagStructures>');
    p.blocks.forEach((b, bi) => {
      out.push('<odePagStructure>', `<odePageId>${p.id}</odePageId>`, `<odeBlockId>${b.id}</odeBlockId>`, `<blockName>${esc(b.name)}</blockName>`, `<iconName>${esc(b.icon)}</iconName>`, `<odePagStructureOrder>${bi + 1}</odePagStructureOrder>`);
      out.push('<odePagStructureProperties>', kv('odePagStructureProperty', { visibility: 'true', teacherOnly: 'false', allowToggle: 'true', minimized: 'false', identifier: '', cssClass: '' }), '</odePagStructureProperties>');
      out.push('<odeComponents>');
      b.comps.forEach((c, ci) => {
        out.push('<odeComponent>', `<odePageId>${p.id}</odePageId>`, `<odeBlockId>${b.id}</odeBlockId>`, `<odeIdeviceId>${c.id}</odeIdeviceId>`, `<odeIdeviceTypeName>${c.type}</odeIdeviceTypeName>`);
        out.push(`<htmlView>${cdata(c.html || '')}</htmlView>`);
        out.push(c.json == null ? '<jsonProperties></jsonProperties>' : `<jsonProperties>${cdata(typeof c.json === 'string' ? c.json : JSON.stringify(c.json))}</jsonProperties>`);
        out.push(`<odeComponentsOrder>${ci + 1}</odeComponentsOrder>`);
        out.push('<odeComponentsProperties>', kv('odeComponentsProperty', { visibility: 'true', teacherOnly: 'false', identifier: '', cssClass: '' }), '</odeComponentsProperties>');
        out.push('</odeComponent>');
      });
      out.push('</odeComponents>', '</odePagStructure>');
    });
    out.push('</odePagStructures>', '</odeNavStructure>');
  }
  out.push('</odeNavStructures>', '</ode>');
  return out.join('\n');
}

// ---------- generic "DataGame" iDevice ----------
// px: css prefix; mutate(g, proto): edit the cloned prototype payload; links: hidden asset anchors; extra: extra html
function game(type, px, { instructions = '', feedback = '', mutate, links = () => '', extra = () => '', bnsClass, noEval = false, late = false } = {}) {
  const make = (id) => {
    const proto = PROTO[type];
    if (!proto || !proto.game) throw new Error('no prototype for ' + type);
    const S = cfg.S;
    const g = clone(proto.game);
    g.id = id;
    if ('evaluation' in g) g.evaluation = true;
    if ('evaluationID' in g) g.evaluationID = cfg.evalId;
    if ('isScorm' in g) g.isScorm = 0;
    if ('textButtonScorm' in g) g.textButtonScorm = S.saveScore;
    if (g.scorm) { g.scorm.isScorm = 0; g.scorm.textButtonScorm = S.saveScore; }
    if ('repeatActivity' in g) g.repeatActivity = true;
    if ('textFeedBack' in g) g.textFeedBack = '';
    if ('textAfter' in g) g.textAfter = '';
    if ('author' in g) g.author = '';
    if (g.itinerary) g.itinerary = { showClue: false, clueGame: '', percentageClue: 40, showCodeAccess: false, codeAccess: '', messageCodeAccess: '' };
    if ('instructions' in g) g.instructions = /^</.test(proto.game.instructions || '<') ? instructions : instructions.replace(/<[^>]+>/g, '') + ' ';
    if ('instruccions' in g) g.instruccions = instructions;
    if ('instructionsExe' in g) g.instructionsExe = /^%3C/.test(proto.game.instructionsExe) ? escape(instructions) : instructions;
    if (mutate) mutate(g, proto);
    const m = proto.html.match(new RegExp('<div class="(' + px + '-instructions[^"]*)"'));
    const instrClass = m ? m[1] : px + '-instructions';
    const v = proto.html.match(new RegExp('<div class="' + px + '-version js-hidden">([^<]*)<'));
    const html =
      `<div class="${px}-IDevice">` +
      (noEval ? '' : `<div class="game-evaluation-ids js-hidden" data-id="${id}" data-evaluationb="true" data-evaluationid="${cfg.evalId}"></div>`) +
      (v ? `<div class="${px}-version js-hidden">${v[1]}</div>` : '') +
      `<div class="${px}-feedback-game">${feedback}</div>` +
      `<div class="${instrClass}">${instructions}</div>` +
      `<div class="${px}-DataGame js-hidden">${encodeGame(g, proto.enc)}</div>` +
      links(g, id) + extra(g, id) +
      `<div class="${bnsClass || px + '-bns'} js-hidden">${S.bns}</div>` +
      `</div>`;
    return { type, html, json: null, evaluable: !noEval };
  };
  make.type = type; make.evaluable = !noEval; make.late = late;
  return make;
}
const link = (cls, href, text) => `<a href="${attr(href)}" class="js-hidden ${cls}">${text}</a>`;

// ---------- text iDevice ----------
// content: html. options: feedback (html revealed by a button), feedbackButton, duration, grouping
function text(content, { feedback = '', feedbackButton, duration = '', grouping = '' } = {}) {
  const make = (id) => {
    const S = cfg.S;
    const btn = feedbackButton || S.showFeedback;
    const body = `<div class="exe-text">${content}</div>`;
    const fb = feedback
      ? `<div class="iDevice_buttons feedback-button js-required"><input type="button" class="feedbacktooglebutton" value="${attr(btn)}" data-text-a="${attr(btn)}" data-text-b="${attr(btn)}"></div><div class="feedback js-feedback js-hidden">${feedback}</div>`
      : '';
    return {
      type: 'text',
      html: `<div class="exe-text-template"><div class="textIdeviceContent"><div class="exe-text-activity"><div>${body}${fb}<p class="clearfix"></p></div></div></div></div>`,
      json: {
        ideviceId: id, textInfoDurationInput: duration, textInfoDurationTextInput: S.duration, textInfoParticipantsInput: grouping, textInfoParticipantsTextInput: S.grouping,
        textTextarea: body, textFeedbackInput: btn, textFeedbackTextarea: feedback,
      },
    };
  };
  make.type = 'text';
  return make;
}

module.exports = { cfg, PROTO, EXTRA_MSGS, init, finalize, newId, clone, esc, attr, cdata, useAsset, usedAssets, pages, page, addBlock, buildXml, game, link, text };
