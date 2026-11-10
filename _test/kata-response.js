/* result.response equals Kata's correctXapiResponsesPattern, character by character
   (MOE runbook checks, 10.11.26: QA/2026-11-10_moe-runbook-checks/REPORT.md, classes A–D, F, G).

   For every question Kata holds (KATA below, read with retrieve-metadata.ps1 -OutDir <scratch> on
   10.11.26, read only), the test boots the part that reports it in jsdom, answers it CORRECTLY
   through the page's own controller (the SCQ engine for every SCQ_QID screen, the part's check
   function for the others, DRIVERS below) and reads result.response the way the library builds it
   (720-common-lib/xapi-720-l.js:616-620: res.response, else student_answer joined by ' | ').
   It asserts:
     - metadata/ carries Kata's pattern for every question (the page reads metadata/, not Kata);
     - exactly one answered statement, on the metadata questionId, with success:true;
     - result.response === Kata's pattern, byte for byte;
     - every SCQ option, right or wrong, reports a metadata answer (wording that differs on screen
       is listed, not failed — those are content items for the producer);
     - no invisible bidi / zero-width characters, no ' | ', no 'id=' syntax in any response;
     - the retired builders are gone (the { response, student_answer } matching helper);
   and on the Arabic twin: no Hebrew letter in a shipped html / js string (comments excluded).

   Mutation check: run against the previous commit's code (with this metadata/) — it must fail.
   Run:
     NODE_PATH=<dir with jsdom>/node_modules node _test/kata-response.js [base path] */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const BASE = process.argv[2] || path.join(__dirname, '..');
const UNIT = 'methodica-ar-science-mass-weight-01';

const KATA = {
  "01/001/q1": ["حنان: وزنْتُ هاتفي المحمول. وزنه 174 غرام بالضبط."],   // choice
  "01/005/q1": [],   // other
  "01/007/q1": ["كمية المادة في الجسم[.]التعريف - الكتلة[,]القوة التي تشغّلها الجاذبية على الجسم[.]التعريف - الوزن[,]لا تعتمد على قوة الجاذبية[.]هل يعتمد على قوة الجاذبية؟ - الكتلة[,]يعتمد على قوة الجاذبية[.]هل يعتمد على قوة الجاذبية؟ - الوزن[,]ميليغرام، غرام، كيلوغرام، طن[.]وحدات القياس - الكتلة[,]نيوتن (N)[.]وحدات القياس - الوزن"],   // matching
  "01/008/q1": ["القوة التي تشغّلها الجاذبية على الجسم، وتتغير بحسب قوة الجاذبية.[.]الوزن[,]كمية المادة في الجسم. متساوية في كل مكان، وتُقاس بالميليغرام، الغرام، الكيلوغرام والطن.[.]الكتلة"],   // matching
  "01/009/q1": ["تبقى الكتلة كما هي"],   // choice
  "02/001/q1": ["تبقى كتلة سمر ثابتة، لكن وزنها يصبح صغيرًا جدًا."],   // choice
  "02/002/q1": ["دعاء"],   // choice
  "02/003/q1": ["سيبقى الميزان متوازنًا."],   // choice
  "02/004/q1": ["ثقيل[.]لغة يومية[,]الكتلة[.]لغة علمية[,]الوزن[.]كلتاهما معًا[,]نيوتن[.]لغة علمية[,]خفيف[.]لغة يومية[,]قوة الجاذبية[.]لغة علمية[,]يَزِن[.]لغة يومية"],   // matching
  "02/005/q1": ["أ. قوة الجاذبية على القمر أضعف[.]تفسير علمي[,]ب. نيل يقفز أعلى على القمر مقارنةً بالكرة الأرضية[.]مشاهدة[,]ت. قوة الجاذبية تؤثر على الوزن[.]تفسير علمي[,]ث. القمر أصغر، ولذلك فإن قوة جاذبيته أضعف[.]تفسير علمي"],   // matching
  "02/007/q1": ["زمن الوصول إلى الأرض لا يعتمد على الكتلة."],   // choice
  "03/001/q1": ["وزنه"],   // choice
  "03/002/q1": ["يعتمد على قوة جاذبية الجرم السماوي[.]الوزن[,]لا تتغير حتى عند الانتقال إلى كوكب آخر[.]الكتلة[,]كمية المادة الموجودة في الجسم[.]الكتلة[,]يتغير عند الابتعاد عن الكرة الأرضية[.]الوزن"],   // matching
  "03/003/q1": ["أمجد رائد الفضاء يقفز أعلى على القمر"],   // choice
  "03/004/q1": ["يمكن فحصها بواسطة القياسات والتجارب"],   // choice
  "05/001/q1": ["على الرغم من أن الكتلة متساوية، فإن زمن سقوط الجسمين مختلف."],   // choice
  "05/001/q2": ["مقاومة الهواء كانت مختلفة بين الأجسام، ولذلك حصلنا على أزمنة سقوط مختلفة، على الرغم من أن الكتلة كانت متساوية."],   // choice
  "05/002/q1": ["قياس عدّة حبات معًا، وقسمة الكتلة الإجمالية على عدد الحبات نفسه."],   // choice
  "05/003/q1": [],   // other
  "06/001/q1": ["تظهر على الملصقات الـ 3 عبارة \"الوزن الصافي\"، لكن الغرام والكيلوغرام وحدتان تصفان الكتلة."],   // choice
  "06/001/q2": ["false"],   // true-false
  "06/001/q3": ["true"],   // true-false
  "06/001/q4": ["لأنه تمّت معايرة الموازين بحيث تعرض الوزن بوحدات قياس الكتلة."],   // choice
};

/* Proposed Kata entries, written into repo metadata/ for Vadim's OK (not in Kata yet). The page and
   this test follow metadata/; KATA above stays the read of Kata. */
const PROPOSED = { "05/003/q1": ["نقطة تكون فيها قراءة الوزن أعلى من المعتاد[,]نقطة تكون فيها قراءة الوزن أقل من المعتاد"] };
const EXPECT = Object.assign({}, KATA, PROPOSED);

/* Non-SCQ questions: the screen and the code that puts the right answer in and checks it. */
const DRIVERS = {
  '01/001/q1': { screen: 1,  code: "hookSelect(2); hookCheck();" },
  '01/007/q1': { screen: 11, code: "ddq12State = Object.assign({}, DDQ12.correct); ddq12Check();" },
  '01/008/q1': { screen: 13, code: "ddrop14Vals = DDROP14.items.map(function (it) { return it.correct; }); ddrop14Check();" },
  '01/009/q1': { screen: 14, code: "scq15Select(SCQ15.options.indexOf(SCQ15.correctAnswer)); scq15Check();" },
  '02/001/q1': { screen: 16, code: "scq18Select(SCQ18.options.indexOf(SCQ18.correctAnswer)); scq18Check();" },
  '02/002/q1': { screen: 17, code: "scq17Select(SCQ17.options.indexOf(SCQ17.correctAnswer)); scq17Check();" },
  '02/003/q1': { screen: 18, code: "scq19Select(SCQ19.options.indexOf(SCQ19.correctAnswer)); scq19Check();" },
  '02/004/q1': { screen: 19, code: "DQ19_ITEMS.forEach(function (it) { dq19GetDD(it.id).dataset.value = it.correct; }); dq19Check();" },
  '02/005/q1': { screen: 20, code: "DQ20_ITEMS.forEach(function (it) { dq20GetDD(it.id).dataset.value = it.correct; }); dq20Check();" },
  '02/007/q1': { screen: 23, code: "scq23Select(SCQ23.correctId); scq23Check();" },
  '03/001/q1': { screen: null, code: GEN(24) },
  '03/002/q1': { screen: 26, code: "window.GEN_DATA[25].items.forEach(function (it) { s26dndPlacement[it.id] = Object.keys(S26DND_TARGET_VALUE).filter(function (k) { return S26DND_TARGET_VALUE[k] === it.correct; })[0]; }); s26dndCheck();" },
  '03/003/q1': { screen: null, code: GEN(26) },
  '03/004/q1': { screen: null, code: GEN(28) },
  '05/001/q1': { screen: null, code: GEN(33) },
  '05/001/q2': { screen: null, code: GEN(50) },
  '05/002/q1': { screen: null, code: GEN(36) },
  '05/003/q1': { screen: 43, code: "hspGenToggleZone(38, 'g2'); hspGenToggleZone(38, 'o1'); hspGenCheck(38);" },
  '06/001/q1': { screen: null, code: GEN(40) },
  '06/001/q2': { screen: 46, code: "window.GEN_DATA[41].statements.forEach(function (s) { saqState[41].answers[s.id] = s.correct; }); saqGenCheck(41);" },
  '06/001/q3': { screen: 46, code: "window.GEN_DATA[41].statements.forEach(function (s) { saqState[41].answers[s.id] = s.correct; }); saqGenCheck(41);" },
  '06/001/q4': { screen: null, code: GEN(42) },
};
/* The generic single-choice engine: go to the screen that holds the sid's options, pick the right one, check. */
function GEN(sid) {
  return "var c = window.GEN_DATA[" + sid + "]; goTo(+document.getElementById(c.optionsContainerId).closest('[data-screen]').dataset.screen);" +
         " scqGenSelect(" + sid + ", c.options.indexOf(c.correctAnswer)); scqGenCheck(" + sid + ");";
};

let pass = 0, fail = 0;
const failures = [], notes = [];
function ok(name, cond, extra) {
  if (cond) { pass++; return; }
  fail++; failures.push(name + (extra ? '  -> ' + extra : ''));
}

function boot(c) {
  const slug = UNIT + '-' + c;
  const dir = path.join(BASE, slug);
  const dom = new JSDOM(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), {
    url: 'http://localhost:8777/' + slug + '/index.html?slxapi=1',
    runScripts: 'dangerously', pretendToBeVisual: true,
  });
  const w = dom.window;
  const exec = (code) => { const s = w.document.createElement('script'); s.textContent = code; w.document.head.appendChild(s); s.remove(); };
  const val = (expr) => { exec('window.__v = (function(){ try { return (' + expr + '); } catch (e) { return "__throw:" + e.message; } })();'); return w.__v; };
  w.__warn = [];
  w.console.log = function () {};
  w.console.warn = function () { w.__warn.push([].slice.call(arguments).join(' ')); };
  w.console.error = function () { w.__warn.push('ERROR ' + [].slice.call(arguments).join(' ')); };
  w.fetch = function () { return Promise.resolve({ ok: true, json: () => Promise.resolve({}) }); };
  w.HTMLMediaElement.prototype.load = function () {};
  w.HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
  w.HTMLMediaElement.prototype.pause = function () {};
  for (const src of [...w.document.querySelectorAll('script[src]')].map(s => s.getAttribute('src'))) {
    if (/^[a-z]+:\/\//i.test(src) || src.startsWith('//')) continue;
    const p = path.resolve(dir, src.split('?')[0]);
    if (fs.existsSync(p)) { try { exec(fs.readFileSync(p, 'utf8')); } catch (e) {} }
  }
  w.METADATA = JSON.parse(fs.readFileSync(path.join(BASE, 'metadata', slug + '.json'), 'utf8'));
  w.XAPI_USING_G = true;
  w.__stmts = [];
  w.sendStatement720 = function (v, t, res, o) { w.__stmts.push({ v, t, res, o }); return true; };
  return { w, exec, val, close: () => w.close() };
}

function wireResponse(res) {
  if (!res) return undefined;
  if (res.response != null) return String(res.response);
  if (res.extensions && res.extensions.student_answer) return res.extensions.student_answer.join(' | ');
  return undefined;
}
const BAD = /[\u200B\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069]|\s\|\s|\b(target|drag|s\d+)-[\w-]*\s*=/;

/* metadata/ vs KATA */
const MD = {};
for (const f of fs.readdirSync(path.join(BASE, 'metadata')).filter(f => /-\d\d\.json$/.test(f))) {
  const c = /-(\d\d)\.json$/.exec(f)[1];
  const md = JSON.parse(fs.readFileSync(path.join(BASE, 'metadata', f), 'utf8'));
  for (const item of md.subContent || []) for (const q of item.questions || []) {
    const m = /-(\d{3})\/(q\d+)\/?$/.exec(q.questionId);
    MD[c + '/' + m[1] + '/' + m[2]] = q;
  }
}
ok('metadata/ declares exactly the questions Kata holds', Object.keys(MD).sort().join() === Object.keys(KATA).sort().join(),
  Object.keys(MD).sort().join());
for (const k of Object.keys(EXPECT)) {
  ok(k + ': metadata/ correctXapiResponsesPattern is Kata\'s' + (PROPOSED[k] ? ' (PROPOSED entry)' : ''),
    MD[k] && JSON.stringify(MD[k].correctXapiResponsesPattern) === JSON.stringify(EXPECT[k]),
    MD[k] && JSON.stringify(MD[k].correctXapiResponsesPattern));
  if (PROPOSED[k]) notes.push(k + ': expects the PROPOSED entry ' + JSON.stringify(PROPOSED[k][0]) + ' (Kata today: ' + JSON.stringify(KATA[k]) + ')');
}

/* the answered statements of THIS question (one check can report several, e.g. a statement table) */
function answeredOf(b, k) { return b.w.__stmts.filter(s => /^answered/.test(s.v) && (!MD[k] || (s.o && s.o.questionId === MD[k].questionId))); }

function checkOne(k, b, label) {
  const a = answeredOf(b, k);
  ok(k + label + ': exactly one answered statement', a.length === 1, String(a.length));
  if (a.length !== 1) return null;
  const s = a[0], r = wireResponse(s.res);
  ok(k + label + ': object is the metadata questionId', s.o && MD[k] && s.o.questionId === MD[k].questionId, JSON.stringify(s.o));
  ok(k + label + ': no bidi marks / " | " / id= in the response', !BAD.test(r || ''), JSON.stringify(r));
  return { s, r };
}

/* SCQ screens per part */
const parts = [...new Set(Object.keys(KATA).map(k => k.slice(0, 2)))];
const covered = {};
for (const c of parts) {
  let b = boot(c);
  const qid = b.val('JSON.stringify(typeof SCQ_QID === "undefined" ? {} : SCQ_QID)');
  const scqs = JSON.parse(qid || '{}');
  const info = {};
  for (const scr of Object.keys(scqs)) {
    info[scr] = {
      key: c + '/' + scqs[scr][0] + '/' + scqs[scr][1],
      ids: [...b.w.document.querySelectorAll('#' + scr + ' .scq-opt')].map(o => o.dataset.id),
      correctId: b.val('SCQ[' + JSON.stringify(scr) + '].correctId'),
      screen: Number(b.w.document.getElementById(scr).dataset.screen),
    };
  }
  b.close();
  for (const scr of Object.keys(info)) {
    const { key, ids, correctId, screen } = info[scr];
    if (!EXPECT[key]) { notes.push(key + ' (' + scr + '): reported by the page, not in Kata'); continue; }
    covered[key] = true;
    for (const id of ids) {
      b = boot(c);
      b.exec('goTo(' + screen + '); scqSelect(' + JSON.stringify(scr) + ', document.querySelector(' +
             JSON.stringify('#' + scr + ' .scq-opt[data-id="' + id + '"]') + ')); scqCheck(' + JSON.stringify(scr) + ');');
      const label = b.w.document.querySelector('#' + scr + ' .scq-opt[data-id="' + id + '"] .scq-opt-text').textContent.replace(/\s+/g, ' ').trim();
      const got = checkOne(key, b, ' option ' + id);
      b.close();
      if (!got) continue;
      const answers = MD[key].answers || [];
      if (id === correctId) {
        ok(key + ' (' + scr + ') correct option: success true', got.s.res.success === true);
        ok(key + ' (' + scr + ') correct option: response is Kata\'s pattern', got.r === EXPECT[key][0], JSON.stringify(got.r) + ' vs ' + JSON.stringify(EXPECT[key][0]));
      } else {
        ok(key + ' (' + scr + ') option ' + id + ': success false', got.s.res.success === false);
        ok(key + ' (' + scr + ') option ' + id + ': not the Kata pattern', got.r !== EXPECT[key][0]);
        if (MD[key].questionType === 'choice' && answers.indexOf(got.r) < 0)
          notes.push(key + ' option ' + id + ': screen wording not in Kata answers: ' + JSON.stringify(label));
      }
    }
  }
}

/* the other controllers */
for (const k of Object.keys(DRIVERS)) {
  const d = DRIVERS[k];
  covered[k] = true;
  const b = boot(k.slice(0, 2));
  if (d.screen != null) b.exec('goTo(' + d.screen + ');');
  b.w.__stmts.length = 0;
  b.exec(d.code);
  const got = checkOne(k, b, '');
  const warns = b.w.__warn.filter(x => /\[xAPI\]/.test(x));
  b.close();
  if (!got) continue;
  ok(k + ': success true', got.s.res.success === true, JSON.stringify(got.s.res));
  ok(k + ': response is Kata\'s pattern', got.r === (EXPECT[k] || [])[0], JSON.stringify(got.r) + ' vs ' + JSON.stringify((EXPECT[k] || [])[0]));
  ok(k + ': no [xAPI] warning on the right answer', warns.length === 0, warns.join(' / '));
}
for (const k of Object.keys(EXPECT)) {
  if (EXPECT[k].length) ok(k + ': answered by a driver or an SCQ screen', covered[k]);
  else notes.push(k + ': no pattern in Kata (ungraded question) — not driven');
}

/* the retired helper must not come back */
const js = fs.readFileSync(path.join(BASE, 'unit-js', '20-xapi.js'), 'utf8');
ok('20-xapi.js: xapiAnswered builds result.response', /function xapiAnswered\(/.test(js) && /response: r\.response/.test(js));
ok('20-xapi.js: no student_answer-pair matching helper', !/student_answer: readable/.test(js));
for (const c of parts) {
  const mj = fs.readFileSync(path.join(BASE, UNIT + '-' + c, 'js', 'main.js'), 'utf8');
  ok(c + ' main.js: no answered statement built by hand', !/sendStatement720\((?:_row|'answered)/.test(mj));
}

/* Arabic twin: no Hebrew letter in shipped strings */
if (/^methodica-ar-/.test(UNIT)) {
  const HE = /[\u05D0-\u05EA]/;
  const strip = (t, html) => html ? t.replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, ' '))
    : t.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:'"\\])\/\/.*$/gm, (m, p) => p + ' '.repeat(m.length - p.length));
  const files = [];
  for (const c of parts) {
    files.push(path.join(UNIT + '-' + c, 'index.html'));
    for (const f of fs.readdirSync(path.join(BASE, UNIT + '-' + c, 'js'))) if (/\.js$/.test(f)) files.push(path.join(UNIT + '-' + c, 'js', f));
  }
  for (const f of fs.readdirSync(path.join(BASE, 'unit-js'))) if (/\.js$/.test(f)) files.push(path.join('unit-js', f));
  /* HEBREW_SCOPE: 'all' = every line; otherwise a RegExp — in a part's js only the lines it matches (the
     reporting lines this change touched) are checked, every index.html and 20-xapi.js in full. */
  const HEBREW_SCOPE = /xapi|XAPI|dq19Shown|_hb|_hn|_hName/;
  for (const f of files) {
    const partJs = /[\\/]js[\\/]/.test(f) || (/^unit-js/.test(f) && !/20-xapi\.js$/.test(f));
    if (HEBREW_SCOPE !== 'all' && /^unit-js/.test(f) && !/20-xapi\.js$/.test(f)) continue;
    const lines = strip(fs.readFileSync(path.join(BASE, f), 'utf8'), /\.html$/.test(f)).split('\n');
    const hits = lines.map((l, i) => HE.test(l) && (HEBREW_SCOPE === 'all' || !partJs || HEBREW_SCOPE.test(l)) ? (i + 1) + ': ' + l.trim().slice(0, 80) : null).filter(Boolean);
    ok('no Hebrew in ' + f.replace(/\\/g, '/') + (HEBREW_SCOPE !== 'all' && partJs ? ' (reporting lines)' : ''), hits.length === 0, hits.join(' || '));
  }
}

console.log('kata-response — ' + UNIT + '  (' + Object.keys(KATA).length + ' questions)');
for (const f of failures) console.log('  FAIL  ' + f);
for (const n of notes) console.log('  NOTE  ' + n);
console.log('pass=' + pass + '  fail=' + fail);
console.log('VERDICT: ' + (fail ? 'FAIL' : 'PASS'));
process.exit(fail ? 1 : 0);
