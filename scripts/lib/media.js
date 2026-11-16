// Builders for content, media, viewers, video, map, quiz and course-wide iDevices.
const fs = require('fs');
const path = require('path');
const { cfg, PROTO, EXTRA_MSGS, clone, attr, esc, useAsset, usedAssets, pages, game, link, text } = require('./core');
const { toHtml } = require('./markdown');

const X = {};
const need = (v, what) => { if (v === undefined || v === null || v === '') throw new Error('missing ' + what); return v; };
const MIME = { '.pdf': 'application/pdf', '.txt': 'text/plain', '.csv': 'text/csv', '.zip': 'application/zip', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.odt': 'application/vnd.oasis.opendocument.text', '.ods': 'application/vnd.oasis.opendocument.spreadsheet', '.odp': 'application/vnd.oasis.opendocument.presentation', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation', '.json': 'application/json', '.html': 'text/html', '.md': 'text/markdown', '.ggb': 'application/vnd.geogebra.file', '.stl': 'model/stl' };
const creditOf = file => {
  const c = cfg.credits[file] || {};
  return { ...c, artist: (c.artist || '').replace(/Unknown (artist|author)Unknown (artist|author)/, '') };
};

// ---------------------------------------------------------------- case study
// o: {history (html), activities: [{activity (html), feedback (html), button?}], duration?, grouping?}
X.casestudy = (o) => (id) => {
  const S = cfg.S;
  const activities = need(o.activities, 'casestudy activities').map(a => ({ activity: a.activity, feedback: a.feedback || '', buttonCaption: a.button || S.showAnswer }));
  const html = `<div class="exe-casestudy-template"><div class="CSP-History">${o.history}</div><div class="CSP-Activities">${activities.map(a => `<div class="CSP-Activity">${a.activity}<div class="feedback js-feedback js-hidden">${a.feedback}</div></div>`).join('')}</div></div>`;
  return { type: 'casestudy', html, json: { id, ideviceId: id, typeGame: 'Case study', history: o.history, textInfoDurationInput: o.duration || '', textInfoDurationTextInput: S.duration, textInfoParticipantsInput: o.grouping || '', textInfoParticipantsTextInput: S.grouping, activities } };
};

// ---------------------------------------------------------------- magnifier
// o: {img, alt, width?=640, zoom?=200 (percent), glass?=2 (1 small .. 3 large)}
X.magnifier = (instructions, o) => (id) => {
  const src = useAsset(need(o.img, 'magnifier img'));
  const width = o.width || 640, zoom = String(o.zoom || 200), glass = String(o.glass || 2);
  const html = `<div class="exe-magnifier-container"><div class="MNF-MainContainer" id="mnfPMainContainer-${id}" style="display:flex; flex-direction:column;"><div class="MNF-instructions" style="flex:1;">${instructions}</div><div class="MNF-image-wrapper" id="image-wrapper-${id}"><div class="ImageMagnifierIdevice"><div class="image-thumbnail" id="image-thumbnail-${id}"><div style="position:relative; display:block; width:${width}; height:auto;"><img id="magnifier-${id}" src="${src}" data-magnifysrc="${src}" width="${width}" data-size="${glass}" data-zoom="${zoom}" alt="${attr(o.alt || '')}"></div></div></div></div></div></div>`;
  return { type: 'magnifier', html, json: { id, typeGame: 'magnifier', textTextarea: instructions, isDefaultImage: '0', imageResource: src, defaultImage: '', height: '', width: String(width), align: 'none', initialZSize: zoom, maxZSize: 600, glassSize: glass, ideviceId: id } };
};

// ---------------------------------------------------------------- external website (iframe; the site must allow embedding)
X.externalWebsite = (url, { height = 500, title = '' } = {}) => () => ({
  type: 'external-website',
  html: `<div id="iframeWebsiteIdevice"><iframe src="${attr(need(url, 'externalWebsite url'))}" size="3" width="800" height="${height}" style="width:100%;" title="${attr(title)}"></iframe><div class="iframe-error-message" style="display:none;">${cfg.S.httpError}</div></div>`,
  json: null,
});

// ---------------------------------------------------------------- rubric
// o: {caption, levels: ['4 Excellent', ...] (best first), rows: [[criterion, descriptor per level...]], scores?: [4,3,2,1]}
X.rubric = (o) => () => {
  const levels = need(o.levels, 'rubric levels'), n = levels.length;
  const scores = o.scores || levels.map((_, i) => n - i);
  for (const r of o.rows) if (r.length !== n + 1) throw new Error(`rubric row "${r[0]}": expected ${n} descriptors`);
  const keys = ['activity', 'name', 'date', 'score', 'notes', 'reset', 'print'];
  const html = `<table class="exe-table"><caption>${o.caption || ''}</caption><thead><tr><th>&nbsp;</th>${levels.map(l => `<th>${l}</th>`).join('')}</tr></thead><tbody>${o.rows.map(r => `<tr><th>${r[0]}</th>${r.slice(1).map((c, i) => `<td>${c} <span>(${scores[i]})</span></td>`).join('')}</tr>`).join('')}</tbody></table><ul class="exe-rubrics-strings">${keys.map((k, i) => `<li class="${k}">${cfg.S.rubric[i]}</li>`).join('')}</ul>`;
  return { type: 'rubric', html, json: null };
};

// ---------------------------------------------------------------- image gallery
// items: [file, title, {author?, link?, license?}?]  (author/licence default to credits.json)
X.gallery = (items) => (id) => {
  const json = { ideviceId: id };
  let body = '';
  items.forEach(([file, title, o = {}], i) => {
    const c = creditOf(file);
    const author = o.author || c.artist || '', page = o.link || c.page || '', license = o.license || c.license || '';
    const src = useAsset(file);
    json['img_' + i] = { img: src, thumbnail: src, title, linktitle: '', author, linkauthor: page, license };
    body += `<div id="imageContainer_${i}" class="imageContainer"><a idevice-id="${id}" title="${attr(title)}" href="${src}" class="imageLink"><div class="imageElement"><img src="${src}" height="128" width="128" title="${attr(title)}" alt="${attr(title)}" author="${attr(author)}" authorlink="${attr(page)}" license="${attr(license)}" licenselink=""/></div></a></div>`;
  });
  return { type: 'image-gallery', html: `<div class="exe-image-gallery-template"><div class="imageGallery-IDevice"><div class="imageGallery-body">${body}</div></div></div>`, json };
};

// ---------------------------------------------------------------- UDL content (main text + alternative versions)
// o: {heading, main (html), simplified? (html), visual? (html), kind?: 'representation'|'engagement'|'expression'}
X.udl = (o) => (id) => {
  const S = cfg.S;
  const hide = `<button class="exe-udlContent-alt-content-hide">${S.hide}</button>`;
  const alt = (cls, title, body) => body ? `<article class="exe-udlContent-content-${cls} js-hidden"><header class='exe-udlContent-alt-content-title'><h2>${title}</h2></header>${body}${hide}</article>` : '';
  const html = `<div class="exe-udlContent exe-udlContent-${o.kind || 'representation'}"><section class="exe-udlContent-block"><header class="exe-udlContent-header exe-udlContent-character-1"><h2 style="display:none;">${o.heading || ''}</h2></header><div class="exe-udlContent-content"><div class="exe-udlContent-content-main">${need(o.main, 'udl main')}</div>${alt('simplified', S.easyReading, o.simplified)}${alt('visual', S.visualAid, o.visual)}</div></section></div>`;
  return { type: 'udl-content', html, json: { ideviceId: id, textInfoDurationInput: '', textInfoParticipantsInput: '', textInfoDurationTextInput: '', textInfoParticipantsTextInput: '', textTextarea: html, textFeedbackInput: '', textFeedbackTextarea: '' } };
};

// ---------------------------------------------------------------- markdown text
X.markdown = (md, { feedback = '', feedbackButton = '' } = {}) => (id) => {
  const htmlMd = toHtml(md);
  const fbHtml = feedback ? toHtml(feedback) : '';
  return {
    type: 'markdown-text',
    html: `<div class="exe-markdown-template"><div class="exe-markdown-activity">${htmlMd}</div></div>`,
    json: { ideviceId: id, markdownTextarea: md, markdownTextareaHtml: htmlMd, markdownFeedbackInput: feedback ? (feedbackButton || cfg.S.showFeedback) : '', markdownFeedbackTextarea: feedback, markdownFeedbackTextareaHtml: fbHtml, markdownInfoDurationInput: '', markdownInfoDurationTextInput: cfg.S.duration, markdownInfoParticipantsInput: '', markdownInfoParticipantsTextInput: cfg.S.grouping },
  };
};

// ---------------------------------------------------------------- slide (title slide: coloured background, title, subtitle)
// o: {title, subtitle?, background?, band?, color?, accent?}
X.slide = (o) => (id) => {
  const W = 1280, H = 720;
  const bg = o.background || '#12355b', band = o.band || '#0b2545', color = o.color || '#ffffff', accent = o.accent || '#e0b84a';
  const size = o.title.length > 34 ? 52 : 68;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${bg}"/><rect x="0" y="470" width="${W}" height="250" fill="${band}"/><rect x="140" y="250" width="160" height="10" fill="${accent}"/>` +
    `<text x="140" y="370" font-family="Georgia, 'Times New Roman', serif" font-size="${size}" font-weight="bold" fill="${color}">${esc(o.title)}</text>` +
    (o.subtitle ? `<text x="140" y="560" font-family="Georgia, 'Times New Roman', serif" font-size="32" fill="${accent}">${esc(o.subtitle)}</text>` : '') + `</svg>`;
  const obj = (type, p) => ({ type, version: '6.6.1', originX: 'left', originY: 'top', scaleX: 1, scaleY: 1, angle: 0, opacity: 1, visible: true, stroke: null, strokeWidth: 0, ...p });
  const objects = [
    obj('Rect', { left: 0, top: 470, width: W, height: 250, fill: band }),
    obj('Rect', { left: 140, top: 250, width: 160, height: 10, fill: accent }),
    obj('Textbox', { left: 140, top: 300, width: 1000, height: size + 10, text: o.title, fontSize: size, fontWeight: 'bold', fontFamily: 'Georgia', fill: color, textAlign: 'left' }),
  ];
  if (o.subtitle) objects.push(obj('Textbox', { left: 140, top: 528, width: 1000, height: 40, text: o.subtitle, fontSize: 32, fontFamily: 'Georgia', fill: accent, textAlign: 'left' }));
  return { type: 'slide', html: `<section class="slide-export"><div class="slide-export-fabric" style="max-width:${W}px;aspect-ratio:${W}/${H}">${svg}</div></section>`, json: { ideviceId: id, version: 3, engine: 'fabric', width: W, height: H, background: bg, fabric: { version: '6.6.1', background: bg, objects }, svg } };
};

// ---------------------------------------------------------------- DigCompEdu (teacher digital competences; labels exist in English only)
// chosen: {'2.1': 'B1', '3.4': 'A2', ...}  competence code -> level (A1..C2)
X.digcompedu = (chosen) => (id) => {
  const areas = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'digcompedu_en.json'), 'utf8')).digcompedu;
  const known = new Set(areas.flatMap(a => a.competences.map(c => String(c.competence))));
  for (const k of Object.keys(chosen)) if (!known.has(k)) throw new Error('digcompedu: unknown competence ' + k + ' (valid: ' + [...known].join(', ') + ')');
  let r1 = '', r2 = '', r3 = '';
  for (const a of areas) {
    r1 += `<th scope="col" colspan="${a.competences.length}" class="area${a.area}">${a.area}. ${a.title}</th>`;
    for (const c of a.competences) {
      const code = String(c.competence);
      r2 += `<th class="area${a.area}">${code}</th>`;
      r3 += `<td class="a${a.area}c${code.split('.')[1]} cell-level">${chosen[code] || ''}</td>`;
    }
  }
  const table = `<table class="digcompedu-summary-table"><thead><tr>${r1}</tr><tr>${r2}</tr></thead><tbody><tr>${r3}</tr></tbody></table>`;
  const selected = Object.entries(chosen).map(([c, l]) => `C${c.replace('.', '')}.${l}`);
  const html = `<div class="digcompeduIdeviceContent"><h3>DigCompEdu summary</h3><p>Selected indicators: ${selected.length}</p><div class="digcompedu-summary-wrapper" data-lang="en" data-display="table">${table}</div></div>`;
  return { type: 'digcompedu', html, json: { ideviceId: id, digcompeduSelected: selected, digcompeduGranularity: 'indicator', digcompeduDataLang: 'en', digcompeduDisplayMode: 'table', digcompeduSummaryTableHtml: table, digcompeduSummaryTextHtml: '' } };
};

// ---------------------------------------------------------------- file attachment
// files: [{file, title, description?}]
X.attachment = (intro, files) => (id) => ({
  type: 'file-attachment', html: '',
  json: { ideviceId: id, intro, showDescriptions: true, attachments: files.map(f => ({ url: useAsset(f.file), filename: f.file, mimeType: MIME[path.extname(f.file).toLowerCase()] || 'application/octet-stream', size: fs.statSync(path.join(cfg.assetsDir, f.file)).size, title: f.title || f.file, description: f.description || '' })) },
});

// ---------------------------------------------------------------- 3D viewer (.stl tested; Y axis up)
X.viewer3d = (file, { alt = '', color = '#e9e2d0', background = '#dcecf7', autoRotate = true } = {}) => (id) => ({
  type: 'three-d-viewer', html: '',
  json: { ideviceId: id, src: useAsset(file), alt, modelColor: color, backgroundColor: background, cameraControls: true, autoRotate, autoRotateSpeed: 20, showNavControls: false, animation: { enabled: false, name: '', speed: 1 } },
});

// ---------------------------------------------------------------- 360° viewer
// scenes: [{title, img, alt?, description?, projection?: 'flat' (ordinary photo, default) | 'equirectangular' (real 360° photo),
//           hotspots?: [{label, html, x, y (percent, flat) | yaw, pitch (degrees, equirectangular)}]}]
X.panorama = (scenes) => (id) => ({
  type: 'three-sixty-viewer', html: '',
  json: {
    version: 2, ideviceId: id, startSceneId: 'scene-1',
    scenes: scenes.map((s, si) => ({
      id: 'scene-' + (si + 1), title: s.title || '', src: useAsset(s.img), alt: s.alt || '', description: s.description || '', projection: s.projection || 'flat', initialView: { yaw: 0, pitch: 0, fov: 75 },
      hotspots: (s.hotspots || []).map((h, hi) => ({ id: `hs-${si + 1}-${hi + 1}`, label: h.label, icon: 'circle', yaw: h.yaw || 0, pitch: h.pitch || 0, x: h.x ?? 50, y: h.y ?? 50, action: { type: 'text', payload: { html: h.html || '' } } })),
    })),
    behaviour: { autorotate: { enabled: false, speed: 1 }, zoomEnabled: true, fullscreenEnabled: true, showNavControls: true },
  },
});

// ---------------------------------------------------------------- interactive map (image + clickable points)
// o: {img, alt?, author?, points: [{title, x, y (fractions 0..1 of the image, from top-left), img? + footer? | html?}]}
X.map = (instructions, o) => {
  let extra = '';
  return game('map', 'mapa', {
    instructions,
    mutate: g => {
      const p0 = clone(g.points[0]);
      g.url = useAsset(need(o.img, 'map img'));
      g.authorImage = o.author || (creditOf(o.img).artist ? creditOf(o.img).artist + ' — ' + (creditOf(o.img).license || '') : '');
      g.altImage = o.alt || '';
      const htmls = [];
      g.points = o.points.map((p, i) => {
        if (!(p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1)) throw new Error(`map point "${p.title}": x and y must be fractions between 0 and 1`);
        const n = 500000000000 + i * 7127;
        htmls.push(p.html || (p.img ? '' : `<p><strong>${p.title}</strong></p>`));
        return { ...p0, title: p.title, type: p.img ? 0 : 2, x: p.x, y: p.y, x1: 0, y1: 0, footer: p.footer || '', author: '', alt: p.img ? p.title : '', url: p.img ? useAsset(p.img) : '', video: '', iVideo: 0, fVideo: 0, audio: '', iconType: 0, question: cfg.S.whereIs.replace('%s', p.title), id: 'p' + n, eText: '', map: { id: 'a' + n, url: '', alt: '', author: '', pts: [], active: 0 }, question_audio: '', color: '#000000', fontSize: '14', link: '', toolTip: '', slides: [{ id: 's' + n, title: '', url: '', author: '', alt: '', footer: '' }], activeSlide: 0, tests: [], activeTest: 0 };
      });
      Object.assign(g, { evaluationG: 0, isNavigable: true, showSolution: true, timeShowSolution: 3, showActiveAreas: false, autoShow: false, autoAudio: false, optionsNumber: 0, order: '', hideScoreBar: false, hideAreas: false, percentajeIdentify: 100, percentajeShowQ: 100, percentajeQuestions: 100 });
      extra = `<img src="${g.url}" class="js-hidden mapa-ImageMap" data-id="0" />` + g.points.map((p, i) => p.type === 0 ? `<img src="${p.url}" class="js-hidden mapa-LinkImagesPoints" data-id="${p.id}" />` : `<div class="js-hidden mapa-LinkTextsPoints" data-id="${p.id}">${htmls[i]}</div>`).join('');
    },
    extra: () => extra,
  });
};

// ---------------------------------------------------------------- interactive video (YouTube + timed stops)
// o: {url (YouTube watch URL), intro (html), slides: [{at (seconds), text (html)} | {at, question (html), answers: [[text, isCorrect]]}]}
X.interactiveVideo = (o) => {
  const make = (id) => {
    const url = need(o.url, 'interactiveVideo url');
    const data = clone(PROTO['interactive-video'].game);
    data.slides = o.slides.map(s => s.question
      ? { type: 'singleChoice', question: s.question, answers: s.answers.map(([t, ok]) => [t, ok ? 1 : 0]), startTime: s.at }
      : { type: 'text', text: s.text, startTime: s.at });
    data.scorm = { isScorm: 0, textButtonScorm: cfg.S.saveScore, repeatActivity: true, weighted: 100 };
    Object.assign(data, { scoreNIA: false, evaluation: true, evaluationID: cfg.evalId, ideviceID: id });
    const html = `<div class="exe-interactive-video-content-before">${o.intro || ''}</div><div class="game-evaluation-ids js-hidden" data-id="${id}" data-evaluationb="true" data-evaluationid="${cfg.evalId}"></div><div class="exe-interactive-video"><p id="exe-interactive-video-file" class="js-hidden"><a href="${url}">${url.replace('https://www.youtube.', '')}</a></p><div id="exe-interactive-video-contents" style="display: none">${JSON.stringify(data)}</div></div>`;
    return { type: 'interactive-video', html, json: null, evaluable: true };
  };
  make.evaluable = true;
  return make;
};

// ---------------------------------------------------------------- video quiz (YouTube pauses at given seconds)
// o: {url, start?=0, end (seconds), author?, questions: [second, text, [options], solutionIndex]}
X.videoQuiz = (instructions, o) => game('quick-questions-video', 'vquext', {
  instructions,
  mutate: g => {
    const q0 = clone(g.questionsGame[0]);
    Object.assign(g, { idVideoQuExt: need(o.url, 'videoQuiz url'), startVideoQuExt: o.start || 0, endVideoQuExt: need(o.end, 'videoQuiz end (video length in seconds)'), useLives: false, numberLives: 3, showSolution: true, timeShowSolution: 3, optionsRamdon: false, answersRamdon: false, reloadQuestion: true, previewQuestions: false, pauseVideo: true, gameMode: 0, videoType: 0, isNavigable: false, repeatQuestion: false, percentajeQuestions: 100, modeBoard: false, customMessages: false, authorVideo: o.author || '', title: '' });
    g.questionsGame = o.questions.map(([pointVideo, quextion, options, solution], i) => ({ ...q0, id: 'vq' + (i + 1) + 'x7k2', type: 3, pointVideo, time: 1, numberOptions: options.length, url: '', author: '', alt: '', msgHit: '', msgError: '', eText: '', typeQuestion: 0, quextion, options: [...options, '', '', '', ''].slice(0, 4), solution, solutionQuestion: '' }));
  },
  extra: () => link('vquext-LinkLocalVideo', '#', 0),
});

// ---------------------------------------------------------------- GeoGebra (public material id from geogebra.org/m/<id>)
X.geogebra = (materialId, { width = 800, height = 520, author = '', title = '' } = {}) => (id) => {
  const url = 'https://www.geogebra.org/m/' + materialId;
  const html = `<div class="auto-geogebra auto-geogebra-${materialId} auto-geogebra-width-${width} auto-geogebra-height-${height} auto-geogebra-scale-100 auto-geogebra-ideviceid-${id}"><p><a href="${url}" target="_blank">${url} (${cfg.S.newWindow})</a></p><div class="auto-geogebra-author js-hidden">${[escape(author), escape(url), escape(title), author ? '1' : '0', escape(cfg.S.srcRows[2]), title ? '1' : '0', escape(cfg.S.srcRows[0])].join(',')}</div><div class="auto-geogebra-messages-evaluation">${cfg.S.ggb.split(',').map(escape).join(',')}</div></div>`;
  return { type: 'geogebra-activity', html, json: null };
};

// ---------------------------------------------------------------- adaptive quiz
// questions: [difficulty 1..3, text, [options], correctIndex]; give at least `rounds` questions spread over the 3 levels
X.adaptiveQuiz = (instructions, questions, { rounds = 10, levelNames } = {}) => {
  const make = (id) => {
    const opt = t => ({ text: t, audio: '' });
    const questionsGame = questions.map(([difficulty, question, options, sol]) => ({
      type: 0, typeSelect: 0, url: '', author: '', alt: '', audio: '', question, numberOptions: options.length,
      options: [...options.map(opt), opt(''), opt(''), opt(''), opt('')].slice(0, 6), solutionMulti: [sol], solutionOrder: [], solutionWord: '', solutionWordAudio: '', percentageShow: 35, difficulty, msgHit: '', msgHitAudio: '', msgError: '', msgErrorAudio: '',
    }));
    const json = {
      id, ideviceId: id, typeGame: 'Adaptative Quiz', version: 2, eXeFormInstructions: instructions, eXeIdeviceTextAfter: '', questionsGame, numRound: Math.min(rounds, questions.length), time: 0,
      shuffle: true, caseSensitive: false, accentSensitive: false, showSolution: true, timeShowSolution: 3, customMessages: false, numLevels: 3, initialLevel: 2, levelNames: levelNames || cfg.S.levels, minQuestionsShown: Math.min(5, questions.length),
      evaluation: true, evaluationID: cfg.evalId, passScoreMode: 'default', passScoreCustom: 5,
      itinerary: { showClue: false, clueGame: '', percentageClue: 40, showCodeAccess: false, codeAccess: '', messageCodeAccess: '' },
      isScorm: 0, textButtonScorm: cfg.S.saveScore, repeatActivity: true, weighted: 100, msgs: EXTRA_MSGS['adaptative-quiz'] || {},
    };
    const html = `<div class="exe-adaptative-quiz-template"><div class="game-evaluation-ids js-hidden" data-id="${id}" data-evaluationb="true" data-evaluationid="${cfg.evalId}"></div><div class="adaptative-quiz-instructions">${instructions}</div></div>`;
    return { type: 'adaptative-quiz', html, json, evaluable: true };
  };
  make.evaluable = true;
  return make;
};

// ---------------------------------------------------------------- course-wide modules (run last: they read the whole tree)
// Table of the credited files actually used in the course (from credits.json), preceded by optional html.
X.credits = (intro = '') => {
  const inner = (id) => {
    const S = cfg.S;
    const rows = Object.keys(cfg.credits).filter(f => usedAssets.has(f)).sort().map(f => {
      const c = creditOf(f);
      const name = c.page ? `<a href="${attr(c.page)}" target="_blank" rel="noopener">${esc(c.title || f)}</a>` : esc(c.title || f);
      const lic = c.licenseUrl ? `<a href="${attr(c.licenseUrl)}" target="_blank" rel="noopener">${esc(c.license || '')}</a>` : esc(c.license || '');
      return `<tr><td>${name}</td><td>${esc(c.artist || S.unknownAuthor)}</td><td>${lic}</td></tr>`;
    }).join('');
    const table = rows ? `<table class="exe-table" style="width:100%;"><thead><tr>${S.creditsCols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>` : '';
    return text(intro + table)(id);
  };
  inner.late = true; inner.type = 'text';
  return inner;
};

// Button to download the editable .elpx from the exported site.
X.downloadSource = () => () => {
  const S = cfg.S, m = cfg.meta;
  const vals = [m.pp_title, m.pp_description, m.pp_author, m.pp_license];
  return {
    type: 'download-source-file',
    html: `<div class="exe-download-package-instructions"><table class="exe-table"><caption>${S.srcCaption}</caption><tbody>${S.srcRows.map((r, i) => `<tr><th>${r}</th><td>${esc(vals[i] || '')}</td></tr>`).join('')}</tbody></table><p>${S.srcText}</p></div><p class="exe-download-package-link"><a download="exe-package:elp-name" href="exe-package:elp" style="background-color:#0ca1a1;color:#ffffff;">${S.srcButton}</a></p>`,
    json: null,
  };
};

// Progress report: lists every scored activity of the course, page by page, with the learner's results.
const slug = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
X.progressReport = () => game('progress-report', 'informe', {
  noEval: true, late: true,
  mutate: g => {
    let nav = 0, comp = 0, total = 0;
    g.sessionIdevices = pages.map((p, pi) => ({
      id: p.id, parentId: p.parentId || null, title: p.title, navId: ++nav, ode_nav_structure_sync_id: null, ode_session_id: 'COURSE', ode_nav_structure_sync_order: pi + 1, navIsActive: 1,
      components: p.blocks.flatMap((b, bi) => b.comps.filter(c => c.evaluable).map((c, ci) => (total++, {
        ideviceID: c.id, evaluationID: cfg.evalId, evaluation: true, componentId: ++comp, ode_pag_structure_sync_id: comp, componentSessionId: 'COURSE', componentPageId: p.id, ode_block_id: b.id, blockName: b.name, blockOrder: bi + 1, ode_idevice_id: c.id, odeIdeviceTypeName: c.type, ode_components_sync_order: ci + 1, componentIsActive: 1,
      }))),
      children: [], url: pi === 0 ? 'index' : slug(p.title),
    }));
    Object.assign(g, { typeshow: 0, evaluationID: cfg.evalId, number: total, showDate: true, showTypeGame: true, activeLinks: true, userData: false });
  },
});

module.exports = X;
