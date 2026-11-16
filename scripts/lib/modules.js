// Builders for every supported iDevice. Each returns a component: a function (id) => {type, html, json}.
const { cfg, PROTO, clone, useAsset, game, link } = require("./core");

const P = t => '<p>' + t + '</p>';
const proto = (type, part, key) => clone(PROTO[type][part][key][0]);

// ---------------------------------------------------------------- JSON types
function trueorfalse(instructions, questions) {
  return (id) => {
    const src = PROTO.trueorfalse;
    const j = clone(src.json);
    Object.assign(j, {
      id, ideviceId: id, eXeGameInstructions: instructions, eXeIdeviceTextAfter: '', questionsRandom: false, percentageQuestions: 100, isTest: false, time: 0,
      questionsGame: questions.map(([q, sol, feedback, suggestion]) => ({ question: P(q), feedback: feedback ? P(feedback) : '', suggestion: suggestion ? P(suggestion) : '', solution: sol ? 1 : 0 })),
      isScorm: 0, textButtonScorm: cfg.S.saveScore, repeatActivity: true, weighted: 100, evaluation: true, evaluationID: cfg.evalId,
    });
    const html = `<div class="exe-trueorfalse-container"><div class="game-evaluation-ids js-hidden" data-id="${id}" data-evaluationb="true" data-evaluationid="${cfg.evalId}"></div><div class="TOFP-instructions">${instructions}</div><div class="TOFP-MainContainer" data-instance="${id}" id="tofPMainContainer-${id}"></div><div class="TOFP-After"></div></div>`;
    return { type: 'trueorfalse', html, json: j, evaluable: true };
  };
}

// questions: {tf:[text, bool]} | {single:[text, [opts], idx]} | {multi:[text, [[bool,opt]..]]} | {fill: html with <u>} | {dropdown:[html with <u>, 'wrong|wrong']}
function form(instructions, questions) {
  return (id) => {
    const j = clone(PROTO.form.json);
    Object.assign(j, {
      ideviceId: id, id, evaluation: true, evaluationID: cfg.evalId, repeatActivity: true, isScorm: 0, textButtonScorm: cfg.S.saveScore, weighted: 100,
      questionsRandom: false, percentageQuestions: '100', time: '0', eXeFormInstructions: instructions, passRate: 5, addBtnAnswers: true, eXeIdeviceTextAfter: '',
      questionsData: questions.map(q => {
        if (q.tf) return { activityType: 'true-false', baseText: P(q.tf[0]), answer: q.tf[1] ? '1' : '0' };
        if (q.single) return { activityType: 'selection', selectionType: 'single', baseText: P(q.single[0]), answers: q.single[1].map((o, i) => [i === q.single[2], o]) };
        if (q.multi) return { activityType: 'selection', selectionType: 'multiple', baseText: P(q.multi[0]), answers: q.multi[1] };
        if (q.fill) return { activityType: 'fill', baseText: P(q.fill), capitalization: false, strict: false, strictQualification: false };
        if (q.dropdown) return { activityType: 'dropdown', baseText: P(q.dropdown[0]), wrongAnswersValue: q.dropdown[1] || '' };
        throw new Error('bad form question');
      }),
    });
    const html = `<div class="exe-form-container"><div class="game-evaluation-ids js-hidden" data-id="${id}" data-evaluationb="true" data-evaluationid="${cfg.evalId}"></div><div id="frmMainContainer-${id}" class="form-IDevice" data-id="${id}"><div class="form-Data js-hidden">{}</div><div class="form-instructions">${instructions}</div></div></div>`;
    return { type: 'form', html, json: j, evaluable: true };
  };
}

// ---------------------------------------------------------------- DataGame types
function crossword(instructions, words) {
  return game('crossword', 'crucigrama', {
    instructions,
    mutate: g => {
      const w0 = clone(g.wordsGame[0]);
      g.wordsGame = words.map(([word, definition]) => ({ ...w0, word, definition, url: '', audio: '', alt: '', author: '', x: 0, y: 0 }));
      Object.assign(g, { hasBack: false, urlBack: '', authorBackImage: '', showSolution: true, caseSensitive: false, time: '0', difficulty: '100', percentajeQuestions: '100' });
    },
  });
}

// questions: [text, [4 options], solutionIndex, imageFile?]
function quickQuestions(instructions, questions) {
  return game('quick-questions', 'quext', {
    instructions,
    mutate: g => {
      const q0 = clone(g.questionsGame[1]);
      g.questionsGame = questions.map(([quextion, options, solution, img]) => ({
        ...q0, type: img ? 1 : 0, time: 1, numberOptions: options.length, url: img ? useAsset(img) : '', audio: '', alt: '', author: '', quextion,
        options: [...options, '', '', '', ''].slice(0, 4), solution, msgHit: '', msgError: '', customScore: 1,
      }));
      Object.assign(g, { idVideo: '', useLives: false, numberLives: 3, showSolution: true, timeShowSolution: 3, optionsRamdon: false, answersRamdon: true, percentajeQuestions: 100, gameMode: 0, customScore: false, customMessages: false });
    },
    links: g => g.questionsGame.map((q, i) => q.url ? link('quext-LinkImages', q.url, i) : '').join(''),
  });
}

// words: [word, definition, imageFile?]
function guess(instructions, words) {
  return game('guess', 'adivina', {
    instructions,
    mutate: g => {
      const w0 = clone(g.wordsGame[0]);
      delete w0.hit; delete w0.error;
      g.wordsGame = words.map(([word, definition, img]) => ({ ...w0, word, definition, type: img ? 1 : 0, time: 1, x: 0, y: 0, url: img ? useAsset(img) : '', audio: '', alt: '', author: '', percentageShow: 30 }));
      Object.assign(g, { useLives: true, numberLives: 3, showSolution: true, timeShowSolution: 3, optionsRamdon: false, percentageShow: 30, caseSensitive: false, gameMode: 0, percentajeQuestions: 100, customMessages: false, modeBoard: false });
    },
    links: g => g.wordsGame.map((q, i) => q.url ? link('adivina-LinkImages', q.url, i) : '').join(''),
  });
}

// puzzles: {img, definition, clue, rows, cols, slide(bool)}
function puzzle(instructions, puzzles) {
  return game('puzzle', 'puzzle', {
    instructions,
    mutate: g => {
      const p0 = clone(g.puzzlesGame[0]);
      g.puzzlesGame = puzzles.map(p => ({ ...p0, type: p.slide ? 0 : 1, rows: p.rows || 3, columns: p.cols || 3, showImage: true, showNumber: !!p.slide, definition: p.definition, audioDefinition: '', audioClue: '', url: useAsset(p.img), alt: p.alt || '', author: p.author || '', clue: p.clue || '', showTime: true, showAttemps: true }));
      Object.assign(g, { randomPuzzles: false, percentajeQuestions: 100 });
    },
    links: g => g.puzzlesGame.map((q, i) => link('puzzle-LinkImagesDef', q.url, i)).join(''),
  });
}

// questions: {img, question, options[4], solution, rows, cols}
function hiddenImage(instructions, questions) {
  return game('hidden-image', 'hiddenimage', {
    instructions,
    mutate: g => {
      const q0 = clone(g.questionsGame[0]);
      g.questionsGame = questions.map(q => ({ ...q0, numberOptions: q.options.length, url: useAsset(q.img), audio: '', alt: '', author: '', question: q.question, options: [...q.options, '', '', '', ''].slice(0, 4), solution: q.solution, msgHit: '', msgError: '', time: 60, rows: q.rows || 4, columns: q.cols || 4, attempts: 3, customScore: 1 }));
      Object.assign(g, { optionsRamdon: false, answersRamdon: false, showSolution: true, revealTime: '1', percentajeQuestions: 100, customScore: false, customMessages: false });
    },
    links: g => g.questionsGame.map((q, i) => link('hiddenimage-LinkImages', q.url, i)).join(''),
  });
}

// words: { A: [word, definition, contains(bool)] , ... }
function azQuiz(instructions, words) {
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return game('az-quiz-game', 'rosco', {
    instructions,
    mutate: g => {
      const w0 = clone(g.wordsGame[0]);
      g.letters = LETTERS;
      g.wordsGame = LETTERS.split('').map(letter => {
        const w = words[letter];
        return w ? { ...w0, letter, word: w[0], definition: w[1], type: w[2] ? 1 : 0 } : { ...w0, letter, word: '', definition: '', type: 0 };
      });
      Object.assign(g, { durationGame: 300, numberTurns: 2, showSolution: true, timeShowSolution: 3, caseSensitive: false, modeBoard: false });
    },
    links: g => g.wordsGame.map((w, i) => link('rosco-LinkImages', '#', i)).join('') + g.wordsGame.map((w, i) => link('rosco-LinkAudios', '#', i)).join(''),
  });
}

// questions: [text, [options], 'AC' (letters of the right answers)]
function multipleChoice(instructions, questions) {
  return game('quick-questions-multiple-choice', 'selecciona', {
    instructions,
    mutate: g => {
      const q0 = clone(g.selectsGame[0]);
      g.selectsGame = questions.map(([quextion, options, solution]) => ({ ...q0, type: 0, time: 1, numberOptions: options.length, typeSelect: 0, url: '', audio: '', alt: '', author: '', eText: '', quextion, options: [...options, '', '', '', ''].slice(0, 4), solution, solutionQuestion: '', msgHit: '', msgError: '', hit: -1, error: -1 }));
      Object.assign(g, { idVideo: '', useLives: false, showSolution: true, timeShowSolution: 3, optionsRamdon: false, answersRamdon: false, percentajeQuestions: 100, gameMode: 0, order: 0, customScore: false, customMessages: false, modeBoard: false });
    },
  });
}

// groups: [names]; items: [text, groupIndex]
function classify(instructions, groups, items) {
  return game('classify', 'clasifica', {
    instructions,
    mutate: g => {
      const w0 = clone(g.wordsGame[0]);
      g.wordsGame = items.map(([eText, group]) => ({ ...w0, type: 1, url: '', audio: '', alt: '', author: '', eText, color: '#000000', backcolor: '#ffffff', group, msgHit: '', msgError: '' }));
      Object.assign(g, { groups: [...groups, '', '', '', ''].slice(0, 4), numberGroups: groups.length, gameLevel: 0, time: 0, percentajeQuestions: 100, customMessages: false, imgCard: '' });
    },
  });
}

// phrases: {definition, cards: [text, isCorrect, imageFile?]}
function selectMedia(instructions, phrases) {
  let n = 100000000000;
  return game('select-media-files', 'seleccionamedias', {
    instructions,
    mutate: g => {
      const c0 = clone(g.phrasesGame[0].cards[0]);
      const p0 = clone(g.phrasesGame[0]);
      g.phrasesGame = phrases.map(p => ({ ...p0, definition: p.definition, phrase: '', msgError: '', msgHit: '', audioDefinition: '', audioHit: '', audioError: '', url: '', alt: '', author: '',
        cards: p.cards.map(([eText, state, img]) => ({ ...c0, id: n += 7919, type: 2, url: img ? useAsset(img) : '', audio: '', alt: '', author: '', eText, color: '#000000', backcolor: '#ffffff', state: !!state })) }));
      Object.assign(g, { showSolution: true, timeShowSolution: 5, time: 0, attempsNumber: 2, percentajeQuestions: 100, customMessages: false, modeTable: false });
    },
    links: g => g.phrasesGame.map((p, pi) => p.cards.map((c, ci) => c.url ? link('seleccionamedias-LinkImages-' + pi, c.url, ci) : '').join('')).join(''),
  });
}

// questions: {img, question, solution, clues[]}
function identify(instructions, questions) {
  return game('identify', 'identifica', {
    instructions,
    mutate: g => {
      const q0 = clone(g.questionsGame[0]);
      g.questionsGame = questions.map(q => ({ ...q0, numberClues: q.clues.length, url: q.img ? useAsset(q.img) : '', audio: '', alt: '', author: '', x: 0, y: 0, question: q.question, solution: q.solution, clues: [...q.clues, '', '', '', '', '', '', '', ''].slice(0, 8), msgHit: '', msgError: '', attempts: 3 }));
      Object.assign(g, { questionsRamdon: false, showSolution: true, timeShowSolution: 5, percentajeQuestions: 100, customMessages: false, avancedMode: true });
    },
    links: g => g.questionsGame.map((q, i) => q.url ? link('identifica-LinkImages', q.url, i) : '').join(''),
  });
}

// html: text where @@word@@ marks the gaps; distractors: 'a, b'
function complete(instructions, html, distractors = '') {
  return game('complete', 'completa', {
    instructions, bnsClass: 'cmpt-bns',
    mutate: g => Object.assign(g, { textText: escape(html), caseSensitive: false, estrictCheck: false, wordsSize: false, time: 0, type: 2, wordsErrors: distractors, attempsNumber: 2, percentajeError: 20, showSolution: true, wordsLimit: false }),
    extra: () => `<div class="completa-text-game js-hidden">${html}</div>`,
  });
}

// pairs: [textA, textB]
function discover(instructions, pairs) {
  const colors = ['#1d3557', '#9d0208', '#386641', '#6a4c93', '#bc6c25', '#005f73', '#7f5539', '#3d405b'];
  return game('discover', 'descubre', {
    instructions,
    mutate: g => {
      const c0 = clone(g.wordsGame[1].data[1]);
      const card = (eText, color, backcolor) => ({ ...c0, type: 1, url: '', audio: '', alt: '', author: '', eText, color, backcolor, length: 0 });
      g.wordsGame = pairs.map(([a, b], i) => ({ data: [card(a, '#ffffff', colors[i % colors.length]), card(b, '#000000', '#f1faee'), card('', '#000000', '#ffffff'), card('', '#000000', '#ffffff')], msgHit: '' }));
      Object.assign(g, { showSolution: true, timeShowSolution: 3, time: 0, attempts: 0, gameMode: 0, gameLevels: 1, showCards: false, percentajeQuestions: 100, customMessages: false, caseSensitive: false });
    },
  });
}

// phrases: {definition, cards: [texts in the right order]}
function sort(instructions, phrases) {
  let n = 300000000000;
  return game('sort', 'ordena', {
    instructions,
    mutate: g => {
      const c0 = clone(g.phrasesGame[0].cards[0]);
      const p0 = clone(g.phrasesGame[0]);
      g.phrasesGame = phrases.map(p => ({ ...p0, definition: p.definition, phrase: '', msgError: '', msgHit: '', audioDefinition: '', audioHit: '', audioError: '',
        cards: p.cards.map(eText => ({ ...c0, id: n += 104729, type: 2, url: '', audio: '', alt: '', author: '', eText, color: '#000000', backcolor: '#ffffff' })) }));
      Object.assign(g, { showSolution: true, timeShowSolution: 3, time: 0, percentajeQuestions: 100, customMessages: false, maxWidth: false, cardHeight: 110, startAutomatically: false, orderedColumns: false, gameColumns: 0, wordBorder: true, type: 1 });
    },
  });
}

function wordSearch(instructions, words) {
  return game('word-search', 'sopa', {
    instructions,
    mutate: g => {
      const w0 = clone(g.wordsGame[0]);
      g.wordsGame = words.map(([word, definition]) => ({ ...w0, word, definition, url: '', audio: '', alt: '', author: '' }));
      Object.assign(g, { time: 0, diagonals: false, reverses: false, showResolve: true, percentajeQuestions: 100 });
    },
  });
}

// problems: {wording (html, variables as {a}), formula, min, max, decimals}
function mathProblems(instructions, problems) {
  return game('mathproblems', 'mathproblems', {
    instructions,
    mutate: g => {
      g.questions = problems.map(p => ({ min: p.min ?? 1, max: p.max ?? 10, decimals: p.decimals ?? 0, time: 180, definedVariables: false, wording: p.wording, textFeedBack: p.feedback || '', formula: p.formula, domains: false }));
      Object.assign(g, { optionsRamdon: false, showSolution: true, timeShowSolution: 3, percentajeQuestions: 100, modeBoard: false, errorAbsolute: p => 0, errorRelative: 0, errorType: 0 });
      g.errorAbsolute = problems.some(p => p.tolerance) ? Math.max(...problems.map(p => p.tolerance || 0)) : 0;
      if (g.errorAbsolute) g.errorType = 2;
    },
    extra: g => g.questions.map((q, i) => `<div class="js-hidden mathproblems-LinkWordings" data-id="${i}">${q.wording}</div>`).join(''),
  });
}

function mathOperations(instructions, o = {}) {
  return game('mathematicaloperations', 'mathoperations', {
    instructions,
    mutate: g => Object.assign(g, { type: 'result', number: '6', operations: '1110', min: '1', max: '20', decimalsInOperands: 0, decimalsInResults: false, negative: false, zero: false, time: 0, mode: 0, solution: true }, o),
  });
}

// c: {title, solution, description, time, challenges: [{title, solution, description}]}
function challenge(instructions, c) {
  return game('challenge', 'desafio', {
    instructions,
    mutate: g => Object.assign(g, {
      desafioTitle: c.title, desafioTime: c.time || 30, desafioType: 0, desafioSolution: c.solution, desafioSolved: false, desafioDescription: c.description, title: '', desafioID: 1794830400000,
      challengesGame: c.challenges.map(ch => ({ description: ch.description, title: ch.title, solution: ch.solution, timeShow: -1, clues: [{ clue: '', time: 5 }, { clue: '', time: 10 }, { clue: '', time: 15 }] })),
    }),
    extra: g => `<div class="desafio-EDescription">${c.description}</div>` + c.challenges.map(ch => `<div class="desafio-ChallengeDescription">${ch.description}</div>`).join(''),
  });
}

// intro shown before, reward shown once the code is found
function padlock(intro, { solution, reward, minutes = 10, attempts = 5, errorMessage = '' }) {
  return game('padlock', 'candado', {
    instructions: intro,
    mutate: g => Object.assign(g, { candadoTime: minutes, candadoSolution: solution, candadoInstructions: '', candadoRetro: '', candadoShowMinimize: false, candadoReboot: true, candadoAttemps: String(attempts), candadoErrorMessage: errorMessage }),
    extra: () => `<div class="candado-retro js-hidden">${reward}</div>`,
  });
}

// levels: [type ('3' heading, '0' checkbox, '1' checkbox+text, '2' select), nivel ('0'|'1'), text, points]
function checklist(instructions, { title, subtitle, levels, footer = '' }) {
  return game('checklist', 'listacotejo', {
    instructions, noEval: true,
    mutate: g => Object.assign(g, { title, subtitle, levels: levels.map(([type, nivel, item, points]) => ({ type: String(type), nivel: String(nivel), item, points: points == null ? '' : String(points) })), hasLogo: false, urlLogo: '', hasCommunity: false, urlCommunity: '', hasDecorative: false, urlDecorative: '', saveData: true, userData: false, footer, useScore: true }),
  });
}

// ---- plain-JSON games (texts are URI-encoded) ----
const enc = encodeURIComponent;

// cards: [label, imageFile]
function dragdrop(instructions, cards) {
  return game('dragdrop', 'dragdrop', {
    instructions,
    mutate: g => {
      g.cardsGame = cards.map(([definition, img]) => ({ definition, url: useAsset(img), author: '', alt: '', audio: '' }));
      Object.assign(g, { randomCards: true, percentajeCards: 100, type: 1, mode: 1, typeDrag: 0, showSolution: true, timeShowSolution: 3, time: 0 });
    },
    links: g => g.cardsGame.map((c, i) => link('dragdrop-LinkImages', c.url, i)).join(''),
  });
}

// cards: {after, before, description, vertical}
function beforeAfter(instructions, cards) {
  return game('beforeafter', 'beforeafter', {
    instructions,
    mutate: g => { g.cardsGame = cards.map(c => ({ url: useAsset(c.after), author: '', alt: c.altAfter || '', eText: '', urlBk: useAsset(c.before), authorBk: '', altBk: c.altBefore || '', eTextBk: '', description: c.description, position: '50', vertical: !!c.vertical })); },
    links: g => g.cardsGame.map((c, i) => link('beforeafter-LinkImages', c.url, i) + link('beforeafter-LinkImagesBack', c.urlBk, i)).join(''),
  });
}

const CARD_COLORS = ['#264653', '#2a9d8f', '#8a5a00', '#9c3d1b', '#6d597a', '#355070', '#386641', '#7f5539'];
// pairs: [front text, back text, imageFile?]
function relate(instructions, pairs) {
  return game('relate', 'relaciona', {
    instructions,
    mutate: g => {
      const c0 = clone(g.cardsGame[0]);
      g.cardsGame = pairs.map(([a, b, img], i) => ({ ...c0, url: img ? useAsset(img) : '', audio: '', alt: '', author: '', color: '#ffffff', backcolor: CARD_COLORS[i % 8], eText: enc(a), urlBk: '', audioBk: '', altBk: '', authorBk: '', colorBk: '#ffffff', backcolorBk: CARD_COLORS[i % 8], eTextBk: enc(b) }));
      Object.assign(g, { randomCards: true, percentajeCards: 100, type: 1, showSolution: true, timeShowSolution: 3, time: 0 });
    },
    links: g => g.cardsGame.map((c, i) => c.url ? link('relaciona-LinkImages', c.url, i) : '').join(''),
  });
}

// cards: [front text, back text, front image?]
function flipcards(instructions, cards) {
  return game('flipcards', 'flipcards', {
    instructions,
    mutate: g => {
      const c0 = clone(g.cardsGame[0]);
      g.cardsGame = cards.map(([a, b, img], i) => ({ ...c0, url: img ? useAsset(img) : '', audio: '', alt: '', author: '', color: '#ffffff', backcolor: CARD_COLORS[i % 8], eText: enc(a), urlBk: '', audioBk: '', altBk: '', authorBk: '', colorBk: '#1b1b1b', backcolorBk: '#f4f1de', eTextBk: enc(b) }));
      Object.assign(g, { randomCards: false, percentajeCards: 100, type: 0, showSolution: true, timeShowSolution: 3, time: 0, imgCard: '' });
    },
    links: g => g.cardsGame.map((c, i) => c.url ? link('flipcards-LinkImages', c.url, i) : '').join(''),
  });
}

function periodicTable(instructions, o = {}) {
  return game('periodic-table', 'periodic-table', { instructions, mutate: g => Object.assign(g, { number: '5', attempts: '2', showSolution: true }, o) });
}

// themes: [{name, questions: [text, [4 options], solutionIndex]}]  (2 to 6 themes)
function trivial(instructions, themes) {
  const b64 = s => Buffer.from(escape(s), 'latin1').toString('base64');
  return game('trivial', 'trivial', {
    instructions,
    mutate: g => {
      const q0 = clone(g.temas[0][0]);
      g.numeroTemas = themes.length;
      g.nombresTemas = [...themes.map(t => t.name), '', '', '', '', '', ''].slice(0, 6);
      g.temas = themes.map(t => t.questions.map(([q, o, sol]) => ({ ...q0, a: '', b: 0, c: 0, d: 0, f: 0, g: 35, h: '', i: 1, j: 1, m: 1, n: o.length, o: [...o, '', '', '', ''].slice(0, 4), p: 0, q, r: '', s: b64(String(q.length) + 'ABCD'[sol]), t: '', u: '', x: 0, y: 0, z: 0, ad: '' })));
      Object.assign(g, { idVideo: '', optionsRamdon: true, answersRamdon: false, showSolution: true, timeShowSolution: 3, useLives: false, weighted: 100, trivialID: 1794830400001, modeBoard: false, customScore: false });
    },
  });
}

// ---- JSON type ----
function scrambledList(instructions, options) {
  return (id) => {
    const j = clone(PROTO['scrambled-list'].json);
    Object.assign(j, { instructions, textAfter: '', afterElement: '', options, time: 0, buttonText: cfg.S.check, rightText: cfg.S.right, wrongText: cfg.S.wrong, isScorm: 0, textButtonScorm: cfg.S.saveScore, repeatActivity: true, weighted: 100, evaluation: true, evaluationID: cfg.evalId, main: 'sl' + id, scorerp: 0, id });
    const html = `<div class="exe-sortableList" id="sl${id}" scorm=false><div class="game-evaluation-ids js-hidden" data-id="${id}" data-evaluationb="true" data-evaluationid="${cfg.evalId}"></div><div class="exe-sortableList-instructions">${instructions}</div><ul class="exe-sortableList-list">${options.map(o => `<li>${o}</li>`).join('')}</ul><div style="display:none"><p class="exe-sortableList-buttonText">${j.buttonText}</p><p class="exe-sortableList-rightText">${j.rightText}</p><p class="exe-sortableList-wrongText">${j.wrongText}</p></div><div class="exe-scorm-message"></div></div>`;
    return { type: 'scrambled-list', html, json: j, evaluable: true };
  };
}

module.exports = { P, trueorfalse, form, crossword, quickQuestions, guess, puzzle, hiddenImage, azQuiz, multipleChoice, classify, selectMedia, identify, complete, discover, sort, wordSearch, mathProblems, mathOperations, challenge, padlock, checklist, dragdrop, beforeAfter, relate, flipcards, periodicTable, trivial, scrambledList };
