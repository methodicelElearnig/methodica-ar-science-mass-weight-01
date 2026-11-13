/* Structural verification for methodica-ar-science-mass-weight-01 — the reporting / issue-reporting /
   resume layer and the invariants it depends on.

   WHAT THIS COVERS, AND WHY
   Every assertion corresponds to a failure that is SILENT at runtime: the lomda keeps working, the
   learner notices nothing, and the data is wrong or missing. Loud, screen-level behaviour is checked
   in a browser instead. Procedure: 2026/Documentation/reporting-and-resume/ADDING-REPORTING-AND-RESUME.md.

   Written for this unit, not ported: the generic structure follows mass-measure-03's suite, but every
   unit-specific group (global screen numbering, legacy engine keys, js/main.js + css/style.css) is
   this unit's own.

   PHASE GATES
   The integration lands in phases. `EXPECT` below switches each group on when its phase lands, so a
   group is never silently "passing" by finding nothing. Flip a flag in the same commit that adds the
   feature; never flip one back.

   RUN (jsdom must live OUTSIDE this OneDrive tree):
     mkdir -p /tmp/lomda-test && cd /tmp/lomda-test && npm install jsdom
     NODE_PATH=/tmp/lomda-test/node_modules node _test/verify-report.js
   On Windows outside Git Bash use a real path, e.g.
     NODE_PATH=C:/Users/<you>/AppData/Local/Temp/lomda-test/node_modules
   Without jsdom the static groups still run and the runtime group reports SKIPPED.

   Optional argument: a built package to check instead of the repo
     node _test/verify-report.js ../../deployments/2026-10-01
*/
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const BASE = process.argv[2] || path.join(__dirname, '..');
/* The repo this harness lives in. Dev-only inputs (the ownership manifest, the library stub) are
   read from here, so the harness can also check a built package, which rightly has neither. */
const REPO = path.join(__dirname, '..');
const IS_PACKAGE = path.resolve(BASE) !== path.resolve(REPO);
const UNIT_SLUG = 'methodica-ar-science-mass-weight-01';
const COMPONENTS = ['01', '02', '03', '04', '05', '06'];

const EXPECT = {
  versioned: true,    // Phase 1 — ?v= on every code reference (landed)
  reporting: true,    // Phase 2 — shared layer + xAPI config block per part (landed)
  issueReport: true,  // Phase 3 — report dialogs + delegation (landed)
  resume: true,       // Phase 4 — RESUME_ENABLED, hooks, boot cover (landed)
};

/* Catalogue items deliberately left without a screen — see the D-2 check in group 2c.
   Empty since 10.11.26: 06-002 existed only in the repo and the Kata -> repo metadata sync removed it. */
const KNOWN_UNREPORTED = {};

const compSlug = (c) => UNIT_SLUG + '-' + c;
const compDir = (c) => path.join(BASE, compSlug(c));
const read = (p) => fs.readFileSync(p, 'utf8');
const readJson = (p) => JSON.parse(read(p).replace(/^\uFEFF/, ''));
const mainJs = (c) => read(path.join(compDir(c), 'js', 'main.js'));
const indexHtml = (c) => read(path.join(compDir(c), 'index.html'));

let pass = 0;
let skipped = 0;
const failures = [];
function ok(scope, name, cond, detail) {
  if (cond) { pass++; return; }
  failures.push('  [' + scope + '] ' + name + (detail ? '\n      -> ' + detail : ''));
}
function section(title) { console.log('\n' + title); }
function skip(what) { skipped++; console.log('  skipped (phase not landed): ' + what); }

/* Exact-case existence. fs.existsSync is case-insensitive on Windows; the production CDN is not, so a
   wrong-case path passes locally and 404s live (scale-01 9d377ad). Checks each segment against
   readdirSync, and refuses anything that escapes BASE. */
function resolveExact(abs) {
  const rel = path.relative(BASE, abs);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return false;
  let cur = BASE;
  for (const seg of rel.split(path.sep)) {
    let entries;
    try { if (!fs.statSync(cur).isDirectory()) return false; entries = fs.readdirSync(cur); } catch (e) { return false; }
    if (!entries.includes(seg)) return false;
    cur = path.join(cur, seg);
  }
  return true;
}

/* Brace-matched body of `function NAME(` — used by the order checks. */
function fnBody(src, name) {
  const start = src.indexOf('function ' + name + '(');
  if (start < 0) return null;
  let depth = 0, i = src.indexOf('{', start);
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  return null;
}

/* ══════════════════ 0. the ownership manifest ══════════════════
   unit-manifest.js is the single statement of which global data-screen each part owns. The QA
   shell routes by it, SCREEN_TO_SUBCONTENT must cover exactly it, and a disagreement with a part's
   DOM is exactly how part 06 once shipped a screen the manifest no longer knew (52830dd). */
section('0. ownership manifest vs each part');

const manifestCtx = { window: {} };
vm.runInNewContext(read(path.join(REPO, 'unit-manifest.js')), manifestCtx);
const MANIFEST = manifestCtx.window.UNIT_MANIFEST;
ok('manifest', 'unit-manifest.js exposes UNIT_MANIFEST', !!MANIFEST);
const OWN = {};
for (const comp of (MANIFEST && MANIFEST.COMPONENTS) || []) OWN[comp.id] = comp.screens.slice();

const seenGlobal = new Set();
for (const c of COMPONENTS) {
  const own = OWN[c] || [];
  ok(c, 'manifest lists this part', own.length > 0);
  const html = indexHtml(c);
  const js = mainJs(c);
  const dom = [...html.matchAll(/<section class="screen[^"]*" data-screen="(\d+)"/g)].map((m) => Number(m[1]));
  ok(c, 'DOM screens === manifest screens', dom.join(',') === own.join(','),
     'dom=' + dom.join(',') + '  manifest=' + own.join(','));
  for (const n of dom) {
    ok(c, 'screen ' + n + ' is owned by one part only', !seenGlobal.has(n));
    seenGlobal.add(n);
  }
  const total = Number((/const TOTAL_SCREENS = (\d+)/.exec(js) || [])[1]);
  ok(c, 'TOTAL_SCREENS === last own screen + 1', total === own[own.length - 1] + 1,
     'TOTAL_SCREENS=' + total + ' last=' + own[own.length - 1]);
  const first = Number((/^let currentScreen = (\d+)/m.exec(js) || [])[1]);
  ok(c, 'initial currentScreen === first own screen', first === own[0], 'currentScreen=' + first);
  const rss = fnBody(js, 'resetScreenState') || '';
  const cases = [...rss.matchAll(/case (\d+):/g)].map((m) => Number(m[1]));
  ok(c, 'resetScreenState has exactly one case per own screen',
     cases.slice().sort((a, b) => a - b).join(',') === own.join(','), 'cases=' + cases.join(','));
}

/* ══════════════════ 1. catalogue identity (metadata) ══════════════════
   A wrong id is accepted by Kata without error and filed against an object that does not exist. */
section('1. catalogue identity');

const unitMeta = readJson(path.join(BASE, 'metadata', UNIT_SLUG + '_unit.json'));
ok('identity', 'unit metadata id is the bare unit slug', unitMeta.id === UNIT_SLUG, unitMeta.id);
const PREFIX = 'https://lomdot.education.gov.il/metodica/720/ar/science/mass-weight/01/';
const META = {};
for (const c of COMPONENTS) {
  const meta = readJson(path.join(BASE, 'metadata', compSlug(c) + '.json'));
  META[c] = meta;
  ok(c, 'component id === PREFIX + slug + "/"', meta.id === PREFIX + compSlug(c) + '/', meta.id);
  ok(c, 'learningUnitId === unit id', meta.learningUnitId === unitMeta.id, meta.learningUnitId);
  for (const sc of meta.subContent || []) {
    ok(c, 'item id is <comp id><comp slug>-NNN/', new RegExp('^' + meta.id.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&') +
       compSlug(c) + '-\\d{3}/$').test(sc.id), sc.id);
    for (const q of sc.questions || []) {
      ok(c, 'question id nested under item id', String(q.questionId).startsWith(sc.id), q.questionId);
      ok(c, 'question id is <item id>qN (no slash)', /\/q\d+$/.test(q.questionId), q.questionId);
    }
  }
}

/* ══════════════════ 2. per-part page wiring ══════════════════ */
section('2. page wiring');

const versions = {};
for (const c of COMPONENTS) {
  const html = indexHtml(c);
  /* A capital letter in a cross-part path 404s on a case-sensitive host and splits a learner's
     resume document across two keys. */
  const badPaths = [...html.matchAll(/\.\.\/[A-Za-z0-9-]*[A-Z][A-Za-z0-9-]*\//g)].map((m) => m[0]);
  ok(c, 'cross-part paths in index.html are lowercase', badPaths.length === 0, badPaths.join(', '));
  const badJs = [...mainJs(c).matchAll(/methodica-ar-science-mass-weight-01-0\d/gi)]
    .map((m) => m[0]).filter((s) => s !== s.toLowerCase());
  ok(c, 'part slugs in main.js are lowercase', badJs.length === 0, badJs.join(', '));

  const codeRefs = [...html.matchAll(/(?:src|href)="((?:\.\.\/)?(?:js|css|unit-js|unit-css)\/[\w./-]+\.(?:js|css))(\?v=(\d+))?"/g)];
  ok(c, 'page references its main.js and style.css',
     codeRefs.some((m) => /js\/main\.js$/.test(m[1])) && codeRefs.some((m) => /css\/style\.css$/.test(m[1])));
  if (EXPECT.versioned) {
    for (const m of codeRefs) {
      ok(c, m[1] + ' carries ?v=', !!m[2], 'an unversioned code file serves stale code after a release');
      if (m[1].startsWith('../')) (versions[m[1]] = versions[m[1]] || new Set()).add(m[3]);
    }
  }
}
if (EXPECT.versioned) {
  for (const [file, seen] of Object.entries(versions)) {
    ok('versions', '?v= identical across parts for ' + file, seen.size === 1, 'saw: ' + [...seen].join(', '));
  }
} else skip('?v= on every code reference (Phase 1)');

/* ══════════════════ 2b. asset contract (Phase 1) ══════════════════
   Rule (ratio-02 ab23af5): shared files live in unit-assets/ and are referenced as ../unit-assets/;
   a part's own files live in its assets/. HTML attributes and JS strings resolve against the part's
   document, a stylesheet's url() against css/. Every reference is resolved with exact case. */
section('2b. asset contract');

const ASSET_RE = /(?:url\(\s*['"]?|src\s*=\s*["']|href\s*=\s*["']|['"`])((?:\.\.\/)*(?:unit-)?assets\/[^'"`)\s?#]+)/g;
let assetRefs = 0;
const hoisted = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else hoisted.push(path.relative(path.join(BASE, 'unit-assets'), p).split(path.sep).join('/')); } })(path.join(BASE, 'unit-assets'));
ok('assets', 'unit-assets/ holds the hoisted fonts, images and videos', hoisted.length >= 8, hoisted.join(', '));

for (const c of COMPONENTS) {
  const dir = compDir(c);
  const files = [[path.join(dir, 'index.html'), dir, 'html'], [path.join(dir, 'css', 'style.css'), path.join(dir, 'css'), 'css']];
  for (const f of fs.readdirSync(path.join(dir, 'js'))) files.push([path.join(dir, 'js', f), dir, 'js']);
  for (const [file, baseDir, kind] of files) {
    const src = read(file);
    for (const m of src.matchAll(ASSET_RE)) {
      assetRefs++;
      const ref = m[1];
      const where = path.relative(BASE, file) + ':' + src.slice(0, m.index).split('\n').length;
      if (resolveExact(path.resolve(baseDir, ref))) { pass++; continue; }
      /* Known category: each main.js is a copy of the old single-file build and carries GEN_DATA
         entries for OTHER parts' screens. Those name a file that exactly one other part ships; they
         are never reached (the runtime walk below proves what IS reached resolves). Anything else is
         a real phantom. */
      const owners = COMPONENTS.filter((o) => o !== c && resolveExact(path.join(compDir(o), ref)));
      ok(c, 'asset reference resolves: ' + ref, kind === 'js' && owners.length === 1,
         where + (kind === 'js' ? ' (not a dead cross-part copy either: owners=' + owners.join(',') + ')' : ''));
    }
  }
  /* A hoisted file must not grow back as a local copy (percent-02 checkNoStaleCopies). */
  for (const h of hoisted) {
    ok(c, 'no local copy of hoisted ' + h, !fs.existsSync(path.join(dir, 'assets', h)));
  }
  /* The shared script must not grow back either. */
  ok(c, 'no local js/feedback-drag.js', !fs.existsSync(path.join(dir, 'js', 'feedback-drag.js')));
}
/* A regex that silently matches nothing would pass every check above. Arabic build: 137 — the 18 font
   url()s of the Hebrew twin (3 per part) are gone with the switch to Calibri, so the floor is 120. */
ok('assets', 'the sweep saw a realistic number of references (>120)', assetRefs > 120, String(assetRefs));

/* ══════════════════ 2c. xAPI reporting (Phase 2) ══════════════════
   Everything here fails SILENTLY in production: Kata accepts a wrong id, a missing map key is a
   screen that never reports, a colliding name keeps old code running, a letter missing from the
   regex mutes every item statement. Guide: ADDING-REPORTING-AND-RESUME.md §3, §5, §6. */
const SHARED = ['10-identity', '20-xapi', '30-pointer-drag', '40-resume', '50-loader'];
const topNames = (src) => new Set([...src.matchAll(/^(?:async\s+)?function\s+([\w$]+)|^(?:var|let|const)\s+([\w$]+)/gm)].map((m) => m[1] || m[2]));
if (EXPECT.reporting) {
  section('2c. xAPI reporting');
  /* MOE runbook checks 10.11.26: the string builders that produced 'id=value | …' / 'zone: a, b | …' are gone;
     every site hands xapiAnswered a structured answer that 20-xapi.js formats from the metadata. */
  ok('xapi', 'retired builders xapiZoneAnswer / xapiFieldsAnswer / xapiMultiAnswer are gone',
     ![read(path.join(BASE, 'unit-js', '20-xapi.js'))].concat(COMPONENTS.map(mainJs)).some((t) => /xapi(Zone|Fields|Multi)Answer\(/.test(t)));
  ok('xapi', 'xapiAnswered takes (item, qKey, correct, isLast, answer) and builds result.response',
     /function xapiAnswered\(item, qKey, correct, isLast, answer\) \{\n  XAPI_Q_RESULTS\[item \+ '\/' \+ qKey\] = !!correct;/.test(read(path.join(BASE, 'unit-js', '20-xapi.js'))));
  const identitySrc = read(path.join(BASE, 'unit-js', '10-identity.js'));
  ok('identity', "XAPI_ID_PREFIX === the catalogue prefix", identitySrc.includes("var XAPI_ID_PREFIX = '" + PREFIX + "';"));
  ok('identity', 'window.XAPI_UNIT_ID === metadata unit id (bare slug)', identitySrc.includes("window.XAPI_UNIT_ID = '" + unitMeta.id + "';"));
  ok('identity', 'RESUME_ENABLED matches the phase', identitySrc.includes('var RESUME_ENABLED = ' + EXPECT.resume + ';'));
  ok('identity', 'DEV_NAV requires ?dev=1 AND no ?registration',
     /DEV_NAV = _devQ\.get\('dev'\) === '1' && !_devQ\.has\('registration'\);/.test(identitySrc));

  /* §3.5 — a letter the regex does not know silences every item and video statement. */
  const loaderSrc = read(path.join(BASE, 'unit-js', '50-loader.js'));
  const letters = [...loaderSrc.matchAll(/'xapi-720-([a-z])\.js'/g)].map((m) => m[1]);
  const gate = (/XAPI_USING_G = \/xapi-720-\[([a-z]+)\]\\\.js\//.exec(loaderSrc) || [])[1] || '';
  ok('loader', 'both library letters are named', letters.length === 2, letters.join(','));
  ok('loader', 'every named letter is inside the XAPI_USING_G regex', letters.every((l) => gate.includes(l)), 'regex [' + gate + ']');
  ok('loader', 'both local stubs pass the regex (-l, and -k for the fallback)', gate.includes('k') && gate.includes('l')
     && fs.existsSync(path.join(__dirname, 'xapi-720-k.js')) && fs.existsSync(path.join(__dirname, 'xapi-720-l.js')));
  /* Leave save through xapi-720-l.js (2026-11-06; methodica-science-volume-liquid-01 82bddb8, methodica-math-percent-03
     8b63a4f): Chrome refuses saveState720's synchronous PUT during page dismissal, so on -k the last change before a
     refresh was lost (Kata 06.11.26). -l adds saveState720OnLeave (sync PUT, keepalive fetch when it throws). */
  const letterPair = /'xapi-720-([a-z])\.js'\s*:\s*'xapi-720-([a-z])\.js'/.exec(loaderSrc);
  ok('loader', 'resume loads xapi-720-l.js (the leave save)', letterPair && letterPair[1] === 'l', letterPair && letterPair[1]);
  const resumeLeaveSrc = read(path.join(BASE, 'unit-js', '40-resume.js'));
  ok('resume', 'the leave handler goes through saveState720OnLeave, typeof-guarded, with flushResumeSave\'s guards',
    /function flushResumeSaveOnLeave\(\) \{\s*if \(_leavingToNextPart\) return;\s*flushResumeSaveLeaving\(\);/.test(resumeLeaveSrc)
    && /function flushResumeSaveLeaving\(\) \{\s*if \(!RESUME_ENABLED \|\| !_resumeReady \|\| _restoring \|\| _resumeReadFailed\) return;\s*var save = \(typeof window\.saveState720OnLeave === 'function'\) \? window\.saveState720OnLeave : window\.saveState720;/.test(resumeLeaveSrc));

  /* §3.3 — a var/function declared in both layers is a silent last-wins overwrite. */
  const sharedNames = new Set();
  for (const f of fs.readdirSync(path.join(BASE, 'unit-js'))) for (const n of topNames(read(path.join(BASE, 'unit-js', f)))) sharedNames.add(n);
  const HOOKS = new Set(['capturePartPayload', 'applyResumeVars', 'applyResumeDom', 'restoreScreenUI']);

  /* Root: in the repo, a redirect for local browsing that carries the query string (§5.2). A package
     ships no root index.html (b809674, 720 rule of 28.09.26) — platforms launch each component directly. */
  if (!IS_PACKAGE) {
    const rootHtml = read(path.join(BASE, 'index.html'));
    ok('root', 'index.html redirects to part 01 carrying location.search',
       rootHtml.includes("window.location.replace('./" + compSlug('01') + "/index.html' + window.location.search)"));
    ok('root', 'index.html loads no shell script', !/unit-shell\.js|unit-manifest\.js|<iframe/.test(rootHtml));
  } else {
    ok('package', 'no root index.html in the package', !fs.existsSync(path.join(BASE, 'index.html')));
  }
  if (!IS_PACKAGE) {
    ok('root', 'the QA shell lives on as qa-shell.html', fs.existsSync(path.join(BASE, 'qa-shell.html')));
    ok('root', 'the QA shell opens parts with ?dev=1', /COMPONENTS\[index\]\.path \+ '\?dev=1'/.test(read(path.join(BASE, 'unit-shell.js'))));
  } else {
    /* A package must carry none of the dev/QA entry points (docs-and-tools/package-allowlist.ps1). */
    for (const dev of ['qa-shell.html', 'unit-shell.js', 'unit-manifest.js', 'index_dev.html', 'index-monolith-backup.html',
      '_test', 'docs-and-tools', 'docs', 'translation', 'css', 'js', 'assets']) {
      ok('package', dev + ' is not in the package', !fs.existsSync(path.join(BASE, dev)));
    }
    for (const c of COMPONENTS) ok('package', c + '/index_dev.html is not in the package', !fs.existsSync(path.join(compDir(c), 'index_dev.html')));
  }

  const versionsShared = {};
  for (const c of COMPONENTS) {
    const html = indexHtml(c);
    const js = mainJs(c);
    const meta = META[c];

    /* Tag order: shared layer, [layout-config], main.js, feedback-drag, 90-boot last before </body>. */
    const order = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]).filter((s) => !/^https?:/.test(s))
      .map((s) => s.replace(/^.*\//, '').replace(/\.js(\?.*)?$/, ''));
    const expected = [...SHARED, ...(EXPECT.issueReport ? [] : [])];
    if (EXPECT.issueReport) expected.splice(2, 0, '25-report');
    expected.push(...(c === '01' ? ['layout-config'] : []), 'main', '28-feedback-drag', '90-boot');
    ok(c, 'script tags in the required order', order.join(',') === expected.join(','), order.join(','));
    ok(c, '90-boot.js is last, in its own tag, right before </body>', /90-boot\.js\?v=\d+"><\/script>\s*<\/body>/.test(html));
    if (!EXPECT.issueReport) ok(c, '25-report.js not wired before its dialogs exist (Phase 3)', !html.includes('25-report'));
    for (const m of html.matchAll(/\.\.\/unit-(?:js|css)\/([\w-]+\.(?:js|css))\?v=(\d+)/g)) (versionsShared[m[1]] = versionsShared[m[1]] || new Set()).add(m[2]);

    /* §3.3 collisions. */
    const clash = [...topNames(js)].filter((n) => sharedNames.has(n) && !HOOKS.has(n));
    ok(c, 'no top-level name declared in both main.js and unit-js/', clash.length === 0, clash.join(', '));

    /* Config block: literal, identity, ownership, both-way coverage. */
    const block = (/var SCREEN_TO_SUBCONTENT = \{([\s\S]*?)\n\};/.exec(js) || [])[1];
    ok(c, 'SCREEN_TO_SUBCONTENT is a literal ending in "\\n};"', !!block);
    ok(c, "XAPI_COMP_SLUG === folder", js.includes("var XAPI_COMP_SLUG = '" + compSlug(c) + "';"));
    ok(c, 'XAPI_COMP_ID = XAPI_ID_PREFIX + slug + "/"', js.includes("var XAPI_COMP_ID   = XAPI_ID_PREFIX + XAPI_COMP_SLUG + '/';"));
    ok(c, 'catalogue component id === PREFIX + slug + "/"', meta.id === PREFIX + compSlug(c) + '/');
    ok(c, 'XAPI_METADATA_FILE points at this part', js.includes("var XAPI_METADATA_FILE = '../metadata/" + compSlug(c) + ".json';")
       && fs.existsSync(path.join(BASE, 'metadata', compSlug(c) + '.json')));
    const metaItems = (meta.subContent || []).map((sc) => /-(\d{3})\/$/.exec(sc.id)[1]);
    const metaQ = {};
    const ungradedQ = new Set(); // D-9 exception: "other" with no answers AND no correctAnswers (free text)
    for (const sc of meta.subContent || []) {
      const it = /-(\d{3})\/$/.exec(sc.id)[1];
      metaQ[it] = (sc.questions || []).map((q) => q.questionId.split('/').pop());
      for (const q of sc.questions || []) if (q.questionType === 'other' && !(q.answers || []).length && !(q.correctAnswers || []).length) ungradedQ.add(it + '/' + q.questionId.split('/').pop());
    }
    if (block) {
      const keys = [...block.matchAll(/^\s*(\d+)\s*:/gm)].map((m) => Number(m[1]));
      ok(c, 'map keys === exactly this part\'s own screens', keys.join(',') === OWN[c].join(','), 'keys=' + keys.join(','));
      ok(c, 'item suffixes are quoted 3-digit strings', ![...block.matchAll(/\[\s*(\d+)\s*,/g)].length);
      const mapItems = [...new Set([...block.matchAll(/\['(\d{3})',\s*\d+\]/g)].map((m) => m[1]))];
      ok(c, 'every mapped item exists in metadata', mapItems.every((i) => metaItems.includes(i)), mapItems.join(','));
      /* The ONE known exception, named rather than loosened: 06-002 ("סיום היחידה", published, id frozen)
         lost its screen when Noa removed part 06's end screens (b3b55d1, merged 2026-09-24). It stays
         unreported until the Kata/content team decides (retire it in Kata, or give it a screen back).
         The second check fails as soon as the exception is no longer needed, so it cannot go stale. */
      const unreported = KNOWN_UNREPORTED[c] || [];
      ok(c, 'every catalogue item is reachable from a screen (D-2)', metaItems.every((i) => mapItems.includes(i) || unreported.includes(i)), 'metadata=' + metaItems.join(','));
      ok(c, 'every KNOWN_UNREPORTED item is in the catalogue and still unmapped', unreported.every((i) => metaItems.includes(i) && !mapItems.includes(i)), unreported.join(','));
    }
    const evalItems = [...((/var XAPI_EVAL_ITEMS = \{([^}]*)\}/.exec(js) || [])[1] || '').matchAll(/'(\d{3})'/g)].map((m) => m[1]);
    ok(c, 'XAPI_EVAL_ITEMS is a subset of the catalogue', evalItems.every((i) => metaItems.includes(i)), evalItems.join(','));

    /* Every literal call names a real (item, question), and every declared question is reported (D-9). */
    const genQ = {};
    for (const m of ((/var XAPI_GEN_Q = \{([^}]*)\}/.exec(js) || [])[1] || '').matchAll(/(\d+):\s*\['(\d{3})',\s*'(q\d+)'\]/g)) genQ[m[1]] = [m[2], m[3]];
    const calls = [...js.matchAll(/xapi(Answered|RequestedHint)\('(\d{3})',\s*'(q\d+)'/g)].map((m) => [m[1], m[2], m[3]]);
    for (const [kind, it, q] of calls) ok(c, 'xapi' + kind + "('" + it + "','" + q + "') names a catalogue question", (metaQ[it] || []).includes(q));
    for (const k of Object.keys(genQ)) ok(c, 'XAPI_GEN_Q[' + k + '] names a catalogue question', (metaQ[genQ[k][0]] || []).includes(genQ[k][1]), genQ[k].join('/'));
    /* A true/false set (saq engine) reports one question per statement, named by statements[].xapiQ under the
       item of its XAPI_GEN_Q entry (part 06 key 41 since the 2026-11-04 split, guide §6.3b). */
    const stmtQ = [];
    for (const m of js.matchAll(/\n {2}(\d+): \{\s*\n\s*type: 'saq'[\s\S]*?statements: \[([\s\S]*?)\n\s*\],/g)) {
      if (!genQ[m[1]]) continue;
      for (const q of m[2].matchAll(/xapiQ: '(q\d+)'/g)) stmtQ.push([genQ[m[1]][0], q[1]]);
    }
    for (const [it, q] of stmtQ) ok(c, 'statement xapiQ ' + it + '/' + q + ' names a catalogue question', (metaQ[it] || []).includes(q));
    const reported = new Set([...calls.filter((x) => x[0] !== 'RequestedHint').map((x) => x[1] + '/' + x[2]), ...Object.values(genQ).map((x) => x.join('/')), ...stmtQ.map((x) => x.join('/'))]);
    for (const [it, qs] of Object.entries(metaQ)) for (const q of qs) {
      if (ungradedQ.has(it + '/' + q)) {
        /* Spec v2.7 p24: answered is an evaluable response with success/score — an ungraded question sends none. */
        ok(c, 'ungraded question ' + it + '/' + q + ' is NOT reported as answered (D-9 exception)', !reported.has(it + '/' + q));
        ok(c, 'item of ungraded question ' + it + '/' + q + ' is not in XAPI_EVAL_ITEMS', !evalItems.includes(it));
      } else ok(c, 'declared question ' + it + '/' + q + ' is reported somewhere (D-9)', reported.has(it + '/' + q));
    }
    ok(c, 'no call to the removed xapiSubmittedOpen', !/xapiSubmittedOpen\(/.test(js));
    for (const it of evalItems) ok(c, 'eval item ' + it + ' has a graded answered call', calls.some((x) => x[0] === 'Answered' && x[1] === it) || Object.values(genQ).some((x) => x[0] === it));

    /* goTo seams: after resetScreenState(n), each in its own try (§6.7, §8.4a). */
    const goTo = fnBody(js, 'goTo') || '';
    const iReset = goTo.indexOf('resetScreenState(n)');
    ok(c, 'goTo: repaintScreen / xapiOnScreen / scheduleResumeSave after resetScreenState, each wrapped',
       iReset > -1 && goTo.indexOf('try { repaintScreen(n); }') > iReset && goTo.indexOf('try { xapiOnScreen(n); }') > iReset
       && goTo.indexOf('try { scheduleResumeSave(); }') > iReset);

    /* Flush after the answer is committed, and before every later return (§8.3, D-13). */
    const committing = [...js.matchAll(/^function ([\w$]+)\s*\(/gm)].map((m) => m[1])
      .filter((n) => /xapiAnswered\(/.test(fnBody(js, n) || ''));
    for (const n of committing) {
      const b = fnBody(js, n);
      const lastCall = b.lastIndexOf('xapiAnswered(');
      ok(c, n + '() flushes after its answered call', b.lastIndexOf('flushResumeSave') > lastCall);
      for (const r of b.slice(lastCall).matchAll(/\n\s*return;/g)) {
        const upto = b.slice(0, lastCall + r.index);
        ok(c, n + '() flushes before a return that follows the answer', /flushResumeSave\(\);\s*\}\s*catch \(e\) \{\}\s*$/.test(upto), 'return at +' + r.index);
      }
    }

    /* The part's last click: exactly one xapiEndComponent, on a button that exists and calls it. */
    const ends = [...js.matchAll(/function ([\w$]+)\(\) \{\n[^]*?xapiEndComponent\(([^;]*?), document\.getElementById\('([\w-]+)'\)\);/g)]
      .filter((m) => (fnBody(js, m[1]) || '').includes("getElementById('" + m[3] + "')"));
    const endCount = (js.match(/xapiEndComponent\(/g) || []).length;
    /* A text-promised stop is a second, deliberate end (03: «ענו נכון על כל השאלות כדי להתקדם»,
       MOE 24.09 / 07.10.26). Named here, so any other extra end still fails. */
    const STOP_END_FNS = { '03': 'endAtBasicStop' };
    const stopFn = STOP_END_FNS[c];
    const stopN = stopFn ? ((fnBody(js, stopFn) || '').match(/xapiEndComponent\(/g) || []).length : 0;
    if (stopFn) ok(c, 'the stop ' + stopFn + '() has exactly one xapiEndComponent', stopN === 1, String(stopN));
    ok(c, 'exactly one xapiEndComponent call site' + (stopFn ? ' besides ' + stopFn + '()' : ''),
      endCount - stopN === 1, String(endCount));
    if (ends[0]) ok(c, 'the end button #' + ends[0][3] + ' exists and calls ' + ends[0][1] + '()',
      new RegExp('id="' + ends[0][3] + '"[^>]*onclick="' + ends[0][1] + '\\(\\)"').test(html));

    /* No navigation between parts outside DEV_NAV (§8.12). */
    for (const m of js.matchAll(/window\.location\.(href\s*=|replace\()/g)) {
      const line = js.slice(js.lastIndexOf('\n', m.index) + 1, js.indexOf('\n', m.index));
      const fnStart = js.lastIndexOf('\nfunction ', m.index);
      const fnHead = js.slice(fnStart, fnStart + 400);
      ok(c, 'cross-part navigation is DEV_NAV-only: ' + line.trim().slice(0, 70),
         /if \(DEV_NAV\)/.test(line) || /\{ if \(!DEV_NAV\) return;/.test(fnHead));
    }

    /* D-1: nothing derived from location.href reaches YouTube; players attach to existing iframes. */
    ok(c, 'no widget_referrer / location.href in any YouTube URL', !/widget_referrer|youtube[^'"\n]*location\.href/.test(js + html));
    /* The options object holds event handlers (with semicolons), so scan each call's own text up to
       its `events` key rather than trying to match the whole object — a first version of this check
       did, matched nothing, and passed a planted videoId (negative test, 2026-09-24). */
    const ytCalls = [...js.matchAll(/new YT\.Player\(/g)].map((m) => {
      const t = js.slice(m.index, m.index + 400); const e = t.indexOf('events');
      return e > -1 ? t.slice(0, e) : t;
    });
    ok(c, 'the scan found every YT.Player call', ytCalls.length === (js.match(/new YT\.Player\(/g) || []).length);
    ok(c, 'YT.Player is never given videoId/playerVars/host (it would build the iframe and add forigin)',
       !ytCalls.some((t) => /videoId|playerVars|host\s*:/.test(t)), ytCalls.filter((t) => /videoId|playerVars|host\s*:/.test(t)).join(' || '));
  }
  for (const [file, seen] of Object.entries(versionsShared)) {
    ok('versions', '?v= identical across parts for ' + file, seen.size === 1, [...seen].join(','));
  }
} else skip('shared layer, SCREEN_TO_SUBCONTENT, identity in code (Phase 2)');
/* ══════════════════ 2d. issue reporting (Phase 3) ══════════════════
   The nine markup constraints 25-report.js depends on (ADDING-REPORTING-AND-RESUME.md §7.1). Each
   one, broken, leaves the dialog dead or permanently visible without any error. */
if (EXPECT.issueReport) {
  section('2d. issue reporting');
  const reportCss = read(path.join(BASE, 'unit-css', '25-report.css'));
  ok('report', '.report-modal-overlay[hidden] { display:none } exists (constraint 2)',
     /\.report-modal-overlay\[hidden\][^}]*display:\s*none/.test(reportCss));
  const reportJs = read(path.join(BASE, 'unit-js', '25-report.js'));
  ok('report', 'the shared 720 form endpoint has the expected shape',
     /REPORT_FORM_ACTION\s*=\s*\n?\s*'https:\/\/docs\.google\.com\/forms\/d\/e\/[\w-]+\/formResponse'/.test(reportJs));
  ok('report', 'the flag button is wired by delegation, not by id',
     /addEventListener\('click'[\s\S]{0,200}closest\('\.flag-btn'\)/.test(reportJs));
  for (const c of COMPONENTS) {
    const html = indexHtml(c);
    const cut = (id) => { const i = html.indexOf('<div id="' + id + '"'); if (i < 0) return ''; const j = html.indexOf('\n  </div>\n', i); return html.slice(i, j + 9); };
    const modal = cut('report-modal'), thanks = cut('report-thanks-modal'), confirm = cut('report-confirm-modal');
    for (const [id, block] of [['report-modal', modal], ['report-thanks-modal', thanks], ['report-confirm-modal', confirm]]) {
      ok(c, '#' + id + ' exists and carries hidden in source (constraint 1)', /^<div id="[\w-]+"\s+class="report-modal-overlay"\s+hidden\b/.test(block));
    }
    const firstField = (modal.match(/<div class="report-field">[\s\S]*?<\/div>\s*\n\s*<span class="report-field-error"/) || [''])[0];
    ok(c, 'the problem-type field is the first .report-field (constraint 3)', firstField.includes('id="report-type-wrapper"'));
    ok(c, 'exactly one .report-submit-btn and one .report-cancel-btn in #report-modal (constraint 4)',
       (modal.match(/class="report-submit-btn"/g) || []).length === 1 && (modal.match(/class="report-cancel-btn"/g) || []).length === 1);
    ok(c, 'the thanks dialog holds a .report-submit-btn (focus target, constraint 5)', /class="report-submit-btn"/.test(thanks));
    ok(c, 'problem types are technical / unclear / other (constraint 6)',
       ['technical', 'unclear', 'other'].every((v) => modal.includes('data-value="' + v + '"')));
    const wrapper = (modal.match(/<div class="report-custom-select" id="report-type-wrapper">[\s\S]*?<\/div>/) || [''])[0];
    ok(c, 'select button, list and hidden input sit inside #report-type-wrapper (constraint 7)',
       /report-select-btn/.test(wrapper) && /report-select-list/.test(wrapper) && /id="report-type"/.test(wrapper));
    for (const id of ['report-modal', 'report-thanks-modal', 'report-confirm-modal', 'report-type-wrapper', 'report-type',
      'report-type-error', 'report-text', 'report-text-error', 'report-char-count']) {
      ok(c, 'id #' + id + ' exists once (constraint 8)', (html.match(new RegExp('id="' + id + '"', 'g')) || []).length === 1);
    }
    ok(c, 'the report stylesheet is linked after style.css (constraint 9)',
       html.indexOf('css/style.css') > -1 && html.indexOf('../unit-css/25-report.css') > html.indexOf('css/style.css'));
    const appAt = html.indexOf('<div id="app">'), modalAt = html.indexOf('id="report-modal"');
    ok(c, 'dialogs sit inside #app and after every .screen', appAt > -1 && modalAt > html.lastIndexOf('</section>') && modalAt < html.indexOf('</div><!-- /#app -->'));
    ok(c, 'a .flag-btn exists', /class="flag-btn"/.test(html));
  }
} else skip('issue-report dialogs and delegation (Phase 3)');
/* ══════════════════ 2e. resume (Phase 4) ══════════════════
   ADDING-REPORTING-AND-RESUME.md §8. Each check below would have caught a defect that shipped in a
   sibling unit (the D-numbers). */
if (EXPECT.resume) {
  section('2e. resume');
  const resumeSrc = read(path.join(BASE, 'unit-js', '40-resume.js'));
  const xapiSrc = read(path.join(BASE, 'unit-js', '20-xapi.js'));
  ok('resume', 'state document v5, one per component (RESUME_STATE_ID carries the part slug)',
     /var RESUME_STATE_VERSION = 5;/.test(resumeSrc) && /RESUME_STATE_ID\s*=\s*'execution-state::' \+ currentPartSlug\(\)/.test(resumeSrc));
  ok('resume', 'hints and picks ledgers live in the document (D-7)',
     (resumeSrc.match(/hints: (?:\{\}|old\.hints)/g) || []).length >= 2 && /doc\.hints\s*=\s*doc\.hints/.test(resumeSrc));
  ok('resume', 'sendStatementOnce exists and sendCompletedOnce delegates to it', /function sendStatementOnce\(/.test(resumeSrc)
     && /function sendCompletedOnce\([^)]*\) \{\s*sendStatementOnce\(/.test(resumeSrc));
  ok('resume', "the character key is namespaced per unit (D-6)", resumeSrc.includes("var UI_CHARACTER_KEY = 'methodica_ar_science_mass_weight_01_selectedCharacter';"));
  ok('resume', 'NAV_EDGE_KEY carries the unit slug', resumeSrc.includes("'lomda_nav_edges::" + UNIT_SLUG + "'"));
  ok('resume', 'RESULT_KEYS lists the cross-part pass flag', /var RESULT_KEYS = \[\s*'lomda_mw01_ar_standardPass'\s*\]/.test(resumeSrc));
  ok('resume', 'restoreEndedButton runs after every repaint and after the restore (D-8)',
     /function repaintScreen[\s\S]*?finally \{ _repainting = false; \}\s*try \{ restoreEndedButton\(\); \}/.test(resumeSrc)
     && /restoreScreenUI\(currentScreen\);\s*try \{ restoreEndedButton\(\); \}/.test(resumeSrc));
  ok('resume', 'restoreEndedButton reads the ledger, not the screen', /function xapiComponentEnded\(\)[\s\S]*?alreadySent\('done', currentPartSlug\(\)\)/.test(xapiSrc));
  /* 2026-11-03 (BOOT-AND-RESUME-HARDENING §2.1–2.2): the three write guards, on the source; behaviour in 3b. */
  const loaderSrc = read(path.join(BASE, 'unit-js', '50-loader.js'));
  const drain = fnBody(resumeSrc, 'drainPendingUnitState') || '';
  ok('shape', '40-resume.js: drainPendingUnitState persists the document as read, never a capture',
     !/captureUnitState\(/.test(drain) && /persistUnitState\(_unitState\)/.test(drain));
  ok('shape', '40-resume.js: markSent does not persist before _resumeReady',
     /if \(!_resumeReady\) return;[\s\S]*persistUnitState\(captureUnitState\(\)\)/.test(fnBody(resumeSrc, 'markSent') || ''));
  ok('shape', '40-resume.js: persistUnitState refuses to write after a failed read',
     /function persistUnitState\(doc\)\s*\{[\s\S]{0,300}if \(_resumeReadFailed\)[\s\S]{0,160}return false;/.test(resumeSrc));
  ok('shape', '40-resume.js: the direct library saves (schedule/flush) are closed after a failed read too',
     /function scheduleResumeSave\(\) \{\s*if \(!RESUME_ENABLED \|\| !_resumeReady \|\| _restoring \|\| _resumeReadFailed\) return;/.test(resumeSrc)
     && /function flushResumeSave\(\) \{\s*if \(!RESUME_ENABLED \|\| !_resumeReady \|\| _restoring \|\| _resumeReadFailed\) return;/.test(resumeSrc));
  ok('shape', '50-loader.js: stage A keeps the cover after a failed read; stage B retries once and keeps the writes closed otherwise',
     /if \(!_payload && !_resumeReadFailed\) dropBootCover\(\);/.test(loaderSrc) && /if \(_resumeReadFailed\) \{\s*_saved = readUnitState\(\);/.test(loaderSrc)
     && /_resumeReady = !_resumeReadFailed;/.test(loaderSrc));
  ok('shape', '50-loader.js: a screen reached during the boot window is saved once stage B is done',
     /if \(!_resumed && currentScreen !== 0\) \{ try \{ scheduleResumeSave\(\); \}/.test(loaderSrc));
  /* Guide §6.3b (2026-11-04): a true-false question is answered 'true' / 'false' in metadata and on the wire. */
  for (const c of COMPONENTS) {
    for (const s of (META[c].subContent || [])) for (const q of (s.questions || [])) {
      if (q.questionType !== 'true-false') continue;
      const qn = q.questionId.split('/').slice(-2).join('/');
      ok(c, 'true-false ' + qn + ': answers ["true","false"], correctAnswers and correctXapiResponsesPattern the same boolean',
         JSON.stringify(q.answers) === '["true","false"]' && Array.isArray(q.correctXapiResponsesPattern) && q.correctXapiResponsesPattern.length === 1
         && /^(true|false)$/.test(q.correctXapiResponsesPattern[0]) && JSON.stringify(q.correctAnswers) === JSON.stringify(q.correctXapiResponsesPattern),
         JSON.stringify({ a: q.answers, c: q.correctAnswers, p: q.correctXapiResponsesPattern }));
    }
  }
  for (const c of COMPONENTS) {
    const html = indexHtml(c), js = mainJs(c);
    for (const hook of ['capturePartPayload', 'applyResumeVars', 'applyResumeDom', 'restoreScreenUI']) {
      ok(c, 'defines ' + hook + '()', new RegExp('^function ' + hook + '\\s*\\(', 'm').test(js));
    }
    const cap = fnBody(js, 'capturePartPayload') || '';
    ok(c, 'the payload carries currentScreen', /currentScreen: currentScreen/.test(cap));
    const endBtn = (/var XAPI_END_BTN = '([\w-]+)';/.exec(js) || [])[1];
    ok(c, 'XAPI_END_BTN names the button xapiEndComponent disables', !!endBtn && js.includes("xapiEndComponent(") && js.includes("getElementById('" + endBtn + "')"));
    /* Every Retry-gate variable must survive a reload (D-14) — or the gate reopens after it. */
    for (const m of js.matchAll(/^(?:let|var) (\w+LastWrong)\b/gm)) {
      const owned = (fnBody(js, m[1].replace('LastWrong', 'Check')) || fnBody(js, 'dq19Check') || '').includes(m[1]);
      if (owned) ok(c, m[1] + ' is captured and restored', cap.includes(m[1]) && (fnBody(js, 'applyResumeVars') || '').includes(m[1]));
    }
    /* The boot cover: a sibling BEFORE #app, with the inline 800 ms / 6 s net (§8.11). */
    const coverAt = html.indexOf('<div id="boot-cover"'), appAt = html.indexOf('<div id="app">');
    ok(c, 'the boot cover sits before #app, as its sibling', coverAt > -1 && coverAt < appAt && !/<div id="app">[\s\S]*id="boot-cover"/.test(html));
    ok(c, 'the boot cover has its inline safety net (800 ms, waits for __resumeInFlight up to 6 s)',
       /setTimeout\(tick, 800\)/.test(html) && /__resumeInFlight && Date\.now\(\) - t0 < 6000/.test(html));
    /* BOOT-AND-RESUME-HARDENING-2026-11-03.md §2.3 (C1–C4). The markup raises the flag on a Kata launch
       (bootXAPI runs from the last script tag, after the 800 ms net on a cold cache); the library is
       preloaded from the head, byte-equal to what 50-loader.js requests; hidden media waits for its screen. */
    ok(c, 'the inline net raises __resumeInFlight itself on a Kata launch (C1)',
       /if \(\/\[\?&\]registration=\/\.test\(location\.search\)\) window\.__resumeInFlight = true;\s*var t0 = Date\.now\(\);/.test(html));
    const CDN720 = (/var CDN = '([^']+)'/.exec(read(path.join(BASE, 'unit-js', '50-loader.js'))) || [])[1];
    const libLetter = (/RESUME_ENABLED \? '(xapi-720-[a-z]\.js)'/.exec(read(path.join(BASE, 'unit-js', '50-loader.js'))) || [])[1];
    const preHrefs = [...html.matchAll(/<link rel="preload" as="script" fetchpriority="high" href="([^"]+)">/g)].map((m) => m[1]);
    ok(c, 'head preloads xapiwrapper.min.js and the loader\'s resume library, no ?v=, no crossorigin (C2)',
       !!CDN720 && preHrefs.join() === [CDN720 + 'xapiwrapper.min.js', CDN720 + libLetter].join()
       && !/<link rel="preload"[^>]*crossorigin/.test(html) && html.indexOf('rel="preload"') < html.indexOf('</head>'), JSON.stringify(preHrefs));
    ok(c, 'head preconnects to Kata (C2)', /<link rel="preconnect" href="https:\/\/kata\.cet\.ac\.il">/.test(html.slice(0, html.indexOf('</head>'))));
    const landAt = html.indexOf('<section class="screen active"'), landEnd = html.indexOf('</section>', landAt);
    const heavyImgs = [...html.matchAll(/<img\b[^>]*>/g)].filter((m) => /\ssrc="(assets\/|\.\.\/unit-assets\/img\/[^"]+\.png")/.test(m[0]));
    const eagerOff = heavyImgs.filter((m) => !(m.index > landAt && m.index < landEnd) && !/loading="lazy"/.test(m[0]));
    ok(c, 'every assets/ (and unit-assets png) image off the landing screen is loading="lazy" (C3)', eagerOff.length === 0,
       eagerOff.map((m) => m[0].slice(0, 80)).join(' | '));
    ok(c, 'no landing-screen image is lazy (it is on the first paint)',
       !heavyImgs.some((m) => m.index > landAt && m.index < landEnd && /loading="lazy"/.test(m[0])));
    const offVideos = [...html.matchAll(/<video\b[^>]*\bautoplay\b[^>]*>[\s\S]*?<\/video>/g)].filter((m) => !(m.index > landAt && m.index < landEnd));
    ok(c, 'no hidden autoplay <video> carries an inline src (C4: data-src, set by goTo on entry)',
       offVideos.every((m) => !/<(video|source)\b[^>]*\ssrc="/.test(m[0])), offVideos.filter((m) => /\ssrc="/.test(m[0])).map((m) => m[0].slice(0, 80)).join(' | '));
    ok(c, 'goTo turns data-src into src before the enter hook runs (C4)',
       /\.screen\.active \[data-src\]'[\s\S]{0,400}currentScreen = n;\s*resetScreenState\(n\);/.test(fnBody(js, 'goTo') || ''));
    /* An end button re-enabled by an entrance timer must ask the ledger (D-8). */
    for (const fn of ['enterScreen46', 'enterScreen43']) {
      const b = fnBody(js, fn);
      if (b && b.includes("'" + endBtn + "'")) ok(c, fn + '() re-enables the end button only via xapiComponentEnded()', !/btn\.disabled = false/.test(b));
    }
  }
  /* The two re-entry bugs resume would otherwise inherit stay fixed. */
  ok('02', 'enterScreen20 repaints an answered screen instead of resetting it', /if \(dq20Done\) \{ dq20PaintDone\(\); return; \}/.test(mainJs('02'))
     && !/function enterScreen20\(\) \{[^}]*dq20Done = false;/.test(mainJs('02')));
  ok('05', 'hspGenEnter keeps the attempt count on re-entry', !/state\.attempts = 0;/.test(fnBody(mainJs('05'), 'hspGenEnter') || 'state.attempts = 0;'));
} else skip('resume hooks, flush order, boot cover (Phase 4)');

/* ══════════════════ 3. runtime (jsdom) ══════════════════
   Load each part with its real scripts in document order and walk every own screen. Catches a
   top-level throw, a missing enter function, or a screen the walk cannot reach. */
section('3. runtime (jsdom)');

(async function runtimeAndSummary() {
let JSDOM = null;
try { ({ JSDOM } = require('jsdom')); } catch (e) { /* reported below */ }

if (!JSDOM) {
  console.log('  SKIPPED - jsdom not resolvable (see the header for NODE_PATH).');
} else {
  /* Load one part the way a browser would: the real index.html, inline scripts, then every local
     <script src> injected in document order. Returns { w, run, pageErrors, dir, html } or null. */
  function loadPart(c) {
    const dir = compDir(c);
    const html = indexHtml(c);
    const pageErrors = [];
    let dom;
    try {
      dom = new JSDOM(html, {
        url: 'http://localhost:5555/' + compSlug(c) + '/',
        runScripts: 'dangerously',   // inline <script>s in the page run too, as in a browser
        pretendToBeVisual: true,
        beforeParse(w) {
          /* Only what a real browser provides and jsdom does not. */
          w.fetch = () => new Promise(() => {});
          w.HTMLMediaElement.prototype.play = () => Promise.resolve();
          w.HTMLMediaElement.prototype.pause = () => {};
          w.HTMLMediaElement.prototype.load = () => {};
          w.requestAnimationFrame = (cb) => { cb(0); return 0; };
          w.cancelAnimationFrame = () => {};
          w.scrollTo = () => {};
          w.Element.prototype.scrollIntoView = () => {};
          const zeroRect = () => ({ x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON() { return this; } });
          w.Range.prototype.getBoundingClientRect = zeroRect;
          w.Range.prototype.getClientRects = () => Object.assign([], { item: () => null });
          w.addEventListener('error', (e) => pageErrors.push(e.message || String(e.error)));
        },
      });
    } catch (e) { ok(c, 'index.html parses in jsdom', false, e.message); return null; }

    const w = dom.window;
    /* jsdom does not fetch <script src>; run the local ones in document order (the YouTube API is
       external and deliberately absent — the parts must survive without it, as they do offline). */
    const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1].replace(/\?.*$/, ''))
      .filter((s) => !/^https?:/.test(s));
    /* Inject as real <script> elements: a strict-mode file run through eval() would keep its
       top-level declarations out of the global scope, which is not what a page does. */
    const before = pageErrors.length;
    for (const s of srcs) {
      const el = w.document.createElement('script');
      el.textContent = read(path.join(dir, s));
      w.document.body.appendChild(el);
    }
    const loadErrors = pageErrors.splice(before);
    ok(c, 'every local script executes without throwing', loadErrors.length === 0, loadErrors.join(' | '));
    if (loadErrors.length) { w.close(); return null; }

    const run = (expr) => { const el = w.document.createElement('script');
      el.textContent = 'window.__V = ' + expr + ';'; w.document.body.appendChild(el); return w.__V; };
    return { w, run, pageErrors, dir, html };
  }

  for (const c of COMPONENTS) {
    const P = loadPart(c);
    if (!P) continue;
    const { w, run, pageErrors, dir } = P;
    const walk = run(
      '(function(){ var errs=[], visited=[];' +
      ' var real=console.error; console.error=function(){ errs.push([].join.call(arguments," ")); };' +
      ' try { ' + JSON.stringify(OWN[c]) + '.forEach(function(n){ goTo(n); visited.push(currentScreen); }); }' +
      ' catch(e){ errs.push("THREW: "+e.message); }' +
      ' console.error=real;' +
      ' return JSON.stringify({ errs: errs, visited: visited }); })()');
    let walked = {};
    try { walked = JSON.parse(walk); } catch (e) { walked = { errs: [String(walk)] }; }
    ok(c, 'goTo reaches every own screen in order', (walked.visited || []).join(',') === OWN[c].join(','),
       'visited=' + (walked.visited || []).join(','));
    ok(c, 'walking every screen logs no console.error', (walked.errs || []).length === 0,
       (walked.errs || []).slice(0, 3).join(' | '));
    /* Let queued observer / timer callbacks run while the document is still alive, so an error in
       one is counted below instead of surfacing after the window is closed. */
    await new Promise((r) => setTimeout(r, 50));
    ok(c, 'no uncaught page error', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
    /* What the walk actually put in the DOM must exist — the dead-copy allowance above never applies
       to a reached screen. getAttribute, not .src (which is absolute): ratio-02 b4fa198. */
    const media = [...w.document.querySelectorAll('img[src], video[src], source[src], iframe[src]')]
      .map((el) => el.getAttribute('src')).filter((u) => u && !/^(https?:|data:|about:)/.test(u));
    const missing = media.filter((u) => !resolveExact(path.resolve(dir, u.replace(/[?#].*$/, ''))));
    ok(c, 'every media URL in the walked DOM exists (' + media.length + ')', missing.length === 0, missing.join(', '));
    const active = w.document.querySelectorAll('section.screen.active');
    ok(c, 'exactly one screen is .active after the walk', active.length === 1, String(active.length));

    if (EXPECT.reporting) {
      /* ── The regression gate (guide §6.8). Off-platform no library loads (jsdom fetches no CDN
         script): nothing may be sent, nothing may throw, and scoring must still record. ── */
      ok(c, 'sendStatement720 is absent off-platform', run('typeof sendStatement720') === 'undefined');
      ok(c, 'xapiOnScreen is a silent no-op without the library',
         run('(function(){ try { xapiOnScreen(' + OWN[c][1] + '); return "ok"; } catch (e) { return e.message; } })()') === 'ok');
      ok(c, 'xapiAnswered still records the score with reporting off',
         run("(function(){ xapiAnswered('999','q1',true,true,'x'); var v = XAPI_Q_RESULTS['999/q1']; delete XAPI_Q_RESULTS['999/q1']; return v; })()") === true);

      /* ── Statement flow: an inline recorder in place of the library. Walk every own screen and
         compare the item open/close sequence with what SCREEN_TO_SUBCONTENT says (guide §6.2). It
         proves the code implements the map, not that the map is right — 2c checks the map. ── */
      const meta = META[c];
      run('(function(){ window.__log = []; window.XAPI_USING_G = true; window.METADATA = ' + JSON.stringify(meta) + ';' +
          ' window.sendStatement720 = function (v, t, r, o) { window.__log.push({ v: v, t: t, id: o && o.objectId || null, r: r || null }); };' +
          ' xapiCurrentItem = null; return 1; })()');
      const mapJson = run('JSON.stringify(SCREEN_TO_SUBCONTENT)');
      const map = JSON.parse(mapJson);
      const seq = [...OWN[c]].reverse().concat(OWN[c]);   // start on the last screen, then walk forward
      const expectLog = [];
      let cur = null;
      for (const n of seq.slice(OWN[c].length)) {          // expectations for the forward walk only
        const it = map[n] ? map[n][0] : null;
        if (it === cur) continue;
        if (cur) expectLog.push('completed ' + cur);
        if (it) expectLog.push('initialized ' + it);
        cur = it;
      }
      /* The library's answered map, as after every eval item was answered: this check is about the
         map, not about B-1's drop guard (checked separately below). */
      run('(function(){ window.xapiItemAnswered = {}; Object.keys(XAPI_EVAL_ITEMS).forEach(function (i) { window.xapiItemAnswered[xapiItemId(i)] = true; }); return 1; })()');
      run('(function(){ ' + JSON.stringify(OWN[c]) + '.slice().reverse().forEach(function(n){ goTo(n); }); xapiCurrentItem = null; window.__log = []; return 1; })()');
      const got = JSON.parse(run('(function(){ ' + JSON.stringify(OWN[c]) + '.forEach(function(n){ goTo(n); });' +
        ' return JSON.stringify(window.__log.map(function (s) { return s.v + " " + (s.id ? s.id.replace(/\\/$/, "").split("-").pop() : ""); })); })()'));
      /* Every eval item counts as answered here (map above), so every completed is expected. */
      ok(c, 'the forward walk opens and closes exactly the mapped items, in order',
         got.join(' | ') === expectLog.join(' | '), 'got: ' + got.join(' | ') + '\n         want: ' + expectLog.join(' | '));
      ok(c, 'item statements carry this part\'s item ids', JSON.parse(run('JSON.stringify(window.__log.map(function(s){return s.id;}))'))
        .every((id) => !id || id.startsWith(meta.id + compSlug(c) + '-')));

      /* ── Ungraded free text (01 item 003 q1, MOE QA 2026-10-01): submitting it sends no answered. ── */
      if (c === '01') {
        const hoq = JSON.parse(run('(function(){ goTo(8); hoqSubmitted = false; window.__log = [];' +
          " document.getElementById('s8-masa-input').value = 'אין הבדל'; document.getElementById('s8-mishkal-input').value = 'יש הבדל';" +
          ' hoqSubmit(); return JSON.stringify({ submitted: hoqSubmitted, verbs: window.__log.map(function (s) { return s.v; }) }); })()'));
        ok(c, 'screen 8 open question: submit works and sends no answered', hoq.submitted && !hoq.verbs.some((v) => /^answered/.test(v)), hoq.verbs.join(','));

        /* ── The s3 learning-path choice (monday.com 28.10.26, guide §6.3a): 'selected', category
           learning-type, object = the component, response = the chosen path item's catalogue mediaFormat;
           EVERY confirmed choice and every path switch (2026-11-04: the once-per-path ledger hid the path the
           learner ended on); never on a card click or on the already-active tab; silent while a restore paints. ── */
        const paths = JSON.parse(run('JSON.stringify(XAPI_LEARNING_PATHS)'));
        const sub = Object.fromEntries((meta.subContent || []).map((s) => [s.id.replace(/\/$/, '').split('-').pop(), s]));
        ok(c, 'XAPI_LEARNING_PATHS: every path item exists and its mediaFormat equals the catalogue',
           Object.keys(paths).length === 2 && Object.values(paths).every((p) => sub[p.item] && sub[p.item].mediaFormat === p.mediaFormat),
           JSON.stringify(paths));
        ok(c, 'XAPI_LEARNING_PATHS: each path item is the item its screen reports (video s4, text s5)',
           map[4] && map[4][0] === paths.video.item && map[5] && map[5][0] === paths.text.item);
        const sel = JSON.parse(run('(function(){ var keepS = window.sendStatement720, keepU = _unitState, log = [], out = {};' +
          ' window.sendStatement720 = function (v, t, r, o) { if (v === "selected") log.push({ t: t, r: r, cat: o && o.category, obj: o && (o.objectId || o.questionId) || null }); };' +
          ' var card = function (v) { return document.querySelector("#s3 .s3-card[data-value=\\"" + v + "\\"]"); };' +
          ' _unitState = emptyUnitState();' +
          ' goTo(3); tosSelect(card("text")); tosSelect(card("video")); out.onClick = log.length;' +
          ' tosAdvance(); out.first = log.slice();' +
          ' goTo(3); tosSelect(card("video")); tosAdvance(); out.repick = log.slice(1);' +
          ' s4SwitchMode("text"); out.toText = log.slice(2);' +
          ' s5SwitchMode("video"); out.back = log.slice(3);' +
          ' s4SwitchMode("video"); out.activeTab = log.length;' +
          ' _unitState = emptyUnitState(); log.length = 0; _restoring = true; goTo(3); tosAdvance(); _restoring = false; out.restoring = log.length;' +
          ' window.sendStatement720 = keepS; _unitState = keepU; goTo(' + OWN[c][OWN[c].length - 1] + '); return JSON.stringify(out); })()'));
        const one = (l, f) => l.length === 1 && l[0].t === 'onlinelesson' && l[0].cat === 'learning-type' && !l[0].obj
          && l[0].r && l[0].r.response === f;
        ok(c, 'choice: a card click sends nothing (only the confirmed choice reports)', sel.onClick === 0, JSON.stringify(sel));
        ok(c, 'choice: Continue on video sends one selected — learning-type, component object, response "' + paths.video.mediaFormat + '"',
           one(sel.first, paths.video.mediaFormat), JSON.stringify(sel.first));
        ok(c, 'choice: Continue on the same path again sends one more selected (every confirmed choice reports)',
           one(sel.repick, paths.video.mediaFormat), JSON.stringify(sel.repick));
        ok(c, 'choice: switching to text from the toggle sends one selected, response "' + paths.text.mediaFormat + '"',
           one(sel.toText, paths.text.mediaFormat), JSON.stringify(sel.toText));
        ok(c, 'choice: switching back to an already-reported path sends one selected again, response "' + paths.video.mediaFormat + '"',
           one(sel.back, paths.video.mediaFormat), JSON.stringify(sel.back));
        ok(c, 'choice: a click on the already-active tab sends nothing (no switch, no choice)', sel.activeTab === 4, JSON.stringify(sel));
        ok(c, 'choice: nothing is sent while a restore paints', sel.restoring === 0, JSON.stringify(sel));
      }

      /* ── B-1 (live 2026-09-24): leaving an UNANSWERED eval item must neither send its 'completed'
         (the library would drop it) nor mark the ledger — otherwise the real one, after the learner
         comes back and answers, is suppressed forever. ── */
      const evalItems = Object.keys(JSON.parse(run('JSON.stringify(XAPI_EVAL_ITEMS)')));
      if (evalItems.length) {
        const E = evalItems[0];
        const sE = OWN[c].find((n) => map[n] && map[n][0] === E);
        /* the other screen comes AFTER E: leaving E closes it only on a forward move (B-2, monday 13454123722 —
           a move to an earlier screen is a Back and never closes); the first screen outside E was screen 0 */
        const sO = OWN[c].find((n) => n > sE && (!map[n] || map[n][0] !== E));
        const b1 = JSON.parse(run('(function(){ var E = ' + JSON.stringify(E) + ';' +
          ' var nE = function () { return window.__log.filter(function (s) { return s.v === "completed" && s.id === xapiItemId(E); }).length; };' +
          ' var keep = _unitState; window.xapiItemAnswered = {}; _unitState = emptyUnitState(); xapiCurrentItem = null; window.__log = [];' +
          ' goTo(' + sE + '); xapiFinishItems();' +   /* the component-end close takes the same guard */
          ' var fin = { sent: nE(), marked: alreadySent("doneItems", itemLedgerKey(E)), cleared: xapiCurrentItem === null };' +
          ' xapiCurrentItem = null; goTo(' + sO + '); goTo(' + sE + '); goTo(' + sO + ');' +
          ' var out = { fin: fin, sentUnanswered: nE(), markedUnanswered: alreadySent("doneItems", itemLedgerKey(E)) };' +
          ' goTo(' + sE + '); window.xapiItemAnswered[xapiItemId(E)] = true; goTo(' + sO + ');' +
          ' out.sentAnswered = nE(); out.markedAnswered = alreadySent("doneItems", itemLedgerKey(E));' +
          ' _unitState = keep; goTo(' + OWN[c][OWN[c].length - 1] + '); return JSON.stringify(out); })()'));
        ok(c, 'B-1: xapiFinishItems on unanswered eval item ' + E + ' sends nothing, leaves the ledger clean, clears the open item',
           b1.fin.sent === 0 && b1.fin.marked === false && b1.fin.cleared === true, JSON.stringify(b1));
        ok(c, 'B-1: leaving unanswered eval item ' + E + ' sends no completed and leaves the ledger clean',
           b1.sentUnanswered === 0 && b1.markedUnanswered === false, JSON.stringify(b1));
        ok(c, 'B-1: answering ' + E + ' later still sends its completed once, then marks the ledger',
           b1.sentAnswered === 1 && b1.markedAnswered === true, JSON.stringify(b1));
        /* Fallback when the library's map is unreachable: the recorded answers decide. */
        const fb = JSON.parse(run('(function(){ var E = ' + JSON.stringify(E) + ', keepQ = JSON.stringify(XAPI_Q_RESULTS), keep = _unitState;' +
          ' var nE = function () { return window.__log.filter(function (s) { return s.v === "completed" && s.id === xapiItemId(E); }).length; };' +
          ' delete window.xapiItemAnswered; Object.keys(XAPI_Q_RESULTS).forEach(function (k) { delete XAPI_Q_RESULTS[k]; });' +
          ' _unitState = emptyUnitState(); xapiCurrentItem = null; window.__log = [];' +
          ' goTo(' + sE + '); goTo(' + sO + '); var out = { unanswered: nE() };' +
          ' XAPI_Q_RESULTS[E + "/q1"] = false; goTo(' + sE + '); goTo(' + sO + '); out.answered = nE();' +
          ' Object.keys(XAPI_Q_RESULTS).forEach(function (k) { delete XAPI_Q_RESULTS[k]; }); Object.assign(XAPI_Q_RESULTS, JSON.parse(keepQ));' +
          ' _unitState = keep; goTo(' + OWN[c][OWN[c].length - 1] + '); return JSON.stringify(out); })()'));
        ok(c, 'B-1: without the library map, XAPI_Q_RESULTS decides (drop unanswered, send answered — even a wrong answer)',
           fb.unanswered === 0 && fb.answered === 1, JSON.stringify(fb));
      }

      /* ── The last click: exactly one component 'completed', the button disabled, no navigation. ── */
      const endFn = { '01': 'goToNextComponent', '02': 'advanceToComponent03', '03': 'goToNextComponent',
        '04': 'goToNextComponent', '05': 'goToNextComponent', '06': 'restartToComponent01' }[c];
      const endRes = JSON.parse(run('(function(){ window.__log = []; var before = location.href; ' + endFn + '();' +
        ' var comps = window.__log.filter(function(s){ return s.t === "onlinelesson" && s.v === "completed"; });' +
        ' var btn = [].slice.call(document.querySelectorAll("button[onclick]")).filter(function(b){ return b.getAttribute("onclick") === "' + endFn + '()"; })[0];' +
        ' return JSON.stringify({ n: comps.length, result: comps[0] && comps[0].r, disabled: !!(btn && btn.disabled), stayed: location.href === before }); })()'));
      ok(c, endFn + '() sends exactly one component completed', endRes.n === 1, JSON.stringify(endRes));
      ok(c, endFn + '() sends an explicit result with success', !!(endRes.result && typeof endRes.result.success === 'boolean'), JSON.stringify(endRes.result));
      ok(c, endFn + '() disables its button', endRes.disabled);
      ok(c, endFn + '() does not navigate (platform owns routing)', endRes.stayed);
      if (c === '05') {
        /* MOE 2026-10-08: the challenge reports its real score; success only at >= 60% (of 4 declared questions). */
        const thr = JSON.parse(run('(function(){ var orig = xapiEndComponent, keep = JSON.stringify(XAPI_Q_RESULTS), out = [];' +
          ' xapiEndComponent = function (r) { out.push(r); };' +
          ' var set = function (n) { Object.keys(XAPI_Q_RESULTS).forEach(function (k) { delete XAPI_Q_RESULTS[k]; });' +
          '   ["001/q1", "001/q2", "002/q1", "003/q1"].forEach(function (k, i) { XAPI_Q_RESULTS[k] = i < n; }); };' +
          ' [0, 2, 3, 4].forEach(function (n) { set(n); goToNextComponent(); });' +
          ' xapiEndComponent = orig; Object.keys(XAPI_Q_RESULTS).forEach(function (k) { delete XAPI_Q_RESULTS[k]; }); Object.assign(XAPI_Q_RESULTS, JSON.parse(keep));' +
          ' return JSON.stringify(out); })()'));
        ok(c, 'challenge: success only at >= 60%, real score (0/4, 2/4 fail; 3/4, 4/4 pass)',
           thr.length === 4 && thr.map(function (r) { return r.success + ':' + r.score.scaled; }).join(',') === 'false:0,false:0.5,true:0.75,true:1',
           JSON.stringify(thr));
      }
      if (c === '03') {
        /* Score contract (MOE QA runbook §4 "ציון ומעבר"; 2026-11-09, 08.11 sheet fixes 1, 2, pilot
           body-matter-01 75559c9). Screen 24 promises 3 questions, all of them right. success and
           score.scaled come from one count of the three basic questions (questionResults); Standard B
           (004) never enters; success <=> scaled >= 3/3. The stop after Q3 and the last click report
           the same result. A learner who skipped the basic set (passed part 02) keeps the old result:
           success:true, scaled over what was asked (Vadim 09.11). */
        let sc = {};
        try { sc = JSON.parse(run('(function(){ var orig = xapiEndComponent, keepQ = JSON.stringify(XAPI_Q_RESULTS),' +
          ' keepR = JSON.stringify(window.lomdaState.questionResults), keepS = basicStopEnded, keepScr = currentScreen, out = { res: [], stop: [], end: [], skip: [] };' +
          ' xapiEndComponent = function (r) { out.cur.push(r); };' +
          ' var set = function (k, c, skip) { Object.keys(XAPI_Q_RESULTS).forEach(function (q) { delete XAPI_Q_RESULTS[q]; });' +
          '   window.lomdaState.questionResults = {};' +
          '   if (!skip) [1, 2, 3].forEach(function (n) { window.lomdaState.questionResults[n] = n <= k; XAPI_Q_RESULTS["00" + n + "/q1"] = n <= k; });' +
          '   if (c !== null) XAPI_Q_RESULTS["004/q1"] = c; };' +
          ' [0, 1, 2, 3].forEach(function (k) { [false, true].forEach(function (c) { set(k, c); var r = typeof xapiPartResult === "function" ? xapiPartResult() : { missing: true }; r.k = k; r.c = c; out.res.push(r); }); });' +
          ' out.cur = out.stop; [2, 3].forEach(function (k) { set(k, null); basicStopEnded = false; basicContinue(); });' +
          ' out.cur = out.end; set(3, false); goToNextComponent();' +
          ' out.cur = out.skip; [true, false].forEach(function (c) { set(0, c, true); goToNextComponent(); });' +
          ' xapiEndComponent = orig; Object.keys(XAPI_Q_RESULTS).forEach(function (q) { delete XAPI_Q_RESULTS[q]; }); Object.assign(XAPI_Q_RESULTS, JSON.parse(keepQ));' +
          ' window.lomdaState.questionResults = JSON.parse(keepR); basicStopEnded = keepS; if (currentScreen !== keepScr) goTo(keepScr); delete out.cur;' +
          ' return JSON.stringify(out); })()')); } catch (e) { sc = {}; }
        sc.stop = sc.stop || []; sc.end = sc.end || []; sc.skip = sc.skip || [];
        for (const r of sc.res || []) {
          const tag = 'score contract ' + r.k + '/3 + Standard B ' + (r.c ? 'right' : 'wrong');
          ok(c, tag + ': success = correct >= 3', r.success === (r.k >= 3), JSON.stringify(r));
          ok(c, tag + ': scaled = correct / 3 (004 not counted)', !!r.score && Math.abs(r.score.scaled - r.k / 3) < 1e-9, JSON.stringify(r));
          ok(c, tag + ': success <=> scaled >= 3/3', !!r.score && r.success === (r.score.scaled >= 1 - 1e-9), JSON.stringify(r));
        }
        ok(c, 'score contract: 8 result cases ran', (sc.res || []).length === 8, JSON.stringify(sc).slice(0, 200));
        ok(c, 'score contract: the stop at 2/3 sends success:false, scaled 2/3; at 3/3 nothing',
           sc.stop.length === 1 && sc.stop[0].success === false && Math.abs(sc.stop[0].score.scaled - 2 / 3) < 1e-9, JSON.stringify(sc.stop));
        ok(c, 'score contract: the last click at 3/3 + Standard B wrong sends success:true, scaled 1 (004 not counted)',
           sc.end.length === 1 && sc.end[0].success === true && sc.end[0].score.scaled === 1, JSON.stringify(sc.end));
        ok(c, 'skip path (passed part 02, only 004 asked) keeps success:true, scaled = 004 (1, then 0)',
           sc.skip.length === 2 && sc.skip.every(function (r) { return r.success === true; }) && sc.skip[0].score.scaled === 1 && sc.skip[1].score.scaled === 0,
           JSON.stringify(sc.skip));
      }
    }
    if (EXPECT.issueReport) {
      /* ── §7.6: the learner's path through the dialog, with a fetch spy (nothing leaves). ── */
      const rep = JSON.parse(run('(function(){ var sent = [], rejectNext = false;' +
        ' window.fetch = function (u, o) { sent.push({ u: u, mode: o && o.mode, method: o && o.method, body: o && o.body ? Object.fromEntries(o.body) : null });' +
        '   return rejectNext ? Promise.reject(new Error("net")) : Promise.resolve({}); };' +
        ' var vis = function (id) { var e = document.getElementById(id); return !!e && !e.hidden; };' +
        ' var out = { start: !vis("report-modal") && !vis("report-thanks-modal") && !vis("report-confirm-modal") };' +
        ' document.querySelector(".flag-btn .flag-label, .flag-btn").click(); out.opened = vis("report-modal");' +
        ' var sub = document.querySelector("#report-modal .report-submit-btn"); out.emptyDisabled = sub.disabled;' +
        ' var t = document.getElementById("report-text"); t.value = "x"; t.dispatchEvent(new Event("input", { bubbles: true }));' +
        ' tryCloseReportModal(); out.confirm = vis("report-confirm-modal"); backToReportForm();' +
        ' document.querySelector("#report-type-wrapper .report-select-btn").click();' +
        ' document.querySelector("#report-type-wrapper [data-value=\\"unclear\\"]").click();' +
        ' t.value = "QA harness"; t.dispatchEvent(new Event("input", { bubbles: true })); out.filledEnabled = !sub.disabled;' +
        ' rejectNext = true; sub.click(); out.thanksEvenIfRejected = vis("report-thanks-modal") && !vis("report-modal");' +
        ' out.post = sent[0] || null; return JSON.stringify(out); })()'));
      ok(c, 'dialogs start hidden', rep.start);
      ok(c, 'clicking the flag\'s inner label opens the dialog (delegation)', rep.opened);
      ok(c, 'submit is disabled while the form is empty', rep.emptyDisabled);
      ok(c, 'closing with unsent text asks for confirmation', rep.confirm);
      ok(c, 'submit enables once type and text are filled', rep.filledEnabled);
      ok(c, 'a rejected POST still shows the thank-you (never branch on the response)', rep.thanksEvenIfRejected);
      const p = rep.post || {};
      ok(c, 'the POST goes to the shared form, no-cors', /docs\.google\.com\/forms\/.*\/formResponse$/.test(p.u || '') && p.mode === 'no-cors' && p.method === 'POST', JSON.stringify(p).slice(0, 160));
      const body = p.body || {};
      ok(c, 'the report names the unit, this part and the item on screen',
         body['entry.1933069481'] === UNIT_SLUG && body['entry.2070680092'] === compSlug(c)
         && String(body['entry.1555704258'] || '').startsWith(compSlug(c) + '-'), JSON.stringify(body).slice(0, 200));
    }
    if (EXPECT.resume) {
      /* ── Resume round trip (§8.4): answer something, capture, restore into a FRESH page, capture
         again. The two payloads must be identical — a field the capture writes but the restore
         drops is progress that silently disappears on the next launch. ── */
      const SCEN = {
        '01': `goTo(11); ddq12State = Object.assign({}, DDQ12.correct, { 'r0-c0': 'i1', 'r0-c1': 'i0' }); ddq12Check();
               goTo(1); hookSelect(2); hookCheck(); goTo(4); s4MarkWatched(); goTo(6); s6RevealEarth(); goTo(7); s6RevealMoon(); goTo(8);
               document.getElementById('s8-masa-input').value = 'אין הבדל'; document.getElementById('s8-mishkal-input').value = 'יש הבדל'; hoqSubmit();
               goTo(13); ddrop14Vals = ['מסה', 'מסה']; ddrop14Check(); goTo(14); scq15Select(SCQ15.options.findIndex(function (o) { return o !== SCQ15.correctAnswer; })); scq15Check();`,
        '02': `goTo(16); scq18Select(SCQ18.options.findIndex(function (o) { return o !== SCQ18.correctAnswer; })); scq18Check();
               goTo(20); DQ20_ITEMS.forEach(function (it) { dq20GetDD(it.id).dataset.value = it.correct; }); dq20Check(); goTo(22); s22Watched = true;
               goTo(23); scq23Select(SCQ23.correctId); scq23Check();`,
        '03': `goTo(25); var c = window.GEN_DATA[24]; scqGenSelect(24, c.options.findIndex(function (o) { return o !== c.correctAnswer; })); scqGenCheck(24);
               goTo(26); window.GEN_DATA[25].items.forEach(function (it) { s26dndPlacement[it.id] = 'mass'; }); s26dndCheck();`,
        '04': `goTo(33);`,
        '05': `goTo(37); var c = window.GEN_DATA[33]; scqGenSelect(33, c.options.indexOf(c.correctAnswer)); scqGenCheck(33);
               goTo(43); var z = window.GEN_DATA[38].zones.filter(function (x) { return x.color === 'blue'; }); hspGenToggleZone(38, z[0].id); hspGenToggleZone(38, z[1].id); hspGenCheck(38);`,
        '06': `goTo(46); window.GEN_DATA[41].statements.forEach(function (s) { saqState[41].answers[s.id] = s.correct; }); saqGenCheck(41);
               goTo(47); var c = window.GEN_DATA[42]; scqGenSelect(42, c.options.findIndex(function (o) { return o !== c.correctAnswer; })); scqGenCheck(42);`,
      };
      const P1 = run('(function(){ window.sendStatement720 = function(){}; ' + SCEN[c] + ' return JSON.stringify(capturePartPayload()); })()');
      const F = loadPart(c);
      if (F) {
        const res = JSON.parse(F.run('(function(){ var errs = []; var real = console.error; console.error = function(){ errs.push([].join.call(arguments, " ")); };' +
          ' window.sendStatement720 = function(){}; window.xapiItemAnswered = {}; _resumeReady = true; _unitState = emptyUnitState();' +
          ' applyExecutionState(' + P1 + '); console.error = real;' +
          ' return JSON.stringify({ errs: errs, p2: JSON.stringify(capturePartPayload()), screen: currentScreen }); })()'));
        ok(c, 'restore into a fresh page logs no error', res.errs.length === 0, res.errs.slice(0, 2).join(' | '));
        ok(c, 'restore lands on the saved screen', res.screen === JSON.parse(P1).currentScreen, 'landed ' + res.screen);
        ok(c, 'capture -> restore -> capture is lossless', res.p2 === P1, '\n         P1 ' + P1.slice(0, 300) + '\n         P2 ' + res.p2.slice(0, 300));
        /* Per-part: what the learner sees after the restore. */
        const SEE = {
          '01': `(function(){ goTo(14); scq15Select(scq15LastWrong); var ok = document.getElementById('s13-check-btn').disabled && hoqSubmitted && document.getElementById('s8-masa-input').value === 'אין הבדל';
                   goTo(11); return ok && ddq12Done && ddq12Answer && ddq12Answer['r0-c0'] === 'i1' && document.getElementById('ddq12-continue').style.display === ''; })()`,
          '02': `(function(){ goTo(20); return document.getElementById('s20q-check-btn').style.display === 'none' && dq20Done && window.lomdaState.standardScore === 2; })()`,
          '03': `(function(){ goTo(25); scqGenSelect(24, genScqState[24].lastWrong); return document.getElementById(window.GEN_DATA[24].checkBtnId).disabled; })()`,
          '04': `true`,
          '05': `(function(){ goTo(43); return hspState[38].attempts === 1 && hspState[38].lastWrong === 'blue+blue'; })()`,
          '06': `(function(){ goTo(46); return saqState[41].done && document.getElementById(window.GEN_DATA[41].continueBtnId).style.display === ''; })()`,
        };
        ok(c, 'the restored screens show the committed state (Retry gate, answered view, attempts)', F.run(SEE[c]) === true);
        await new Promise((r) => setTimeout(r, 50));
        F.w.close();
      }
    }
    await new Promise((r) => setTimeout(r, 50));   // drain observers before the document goes away
    w.close();
  }

  if (EXPECT.resume) {
    /* ── 3b. write-guard (BOOT-AND-RESUME-HARDENING-2026-11-03.md §2.6): NO write may replace the saved
       payload before the restore. Kata's reproduction (mass-measure-01, 03.11.26): saved screen 2; the
       learner acted before the restore arrived; the stage-B drain persisted a live capture over the saved
       payload. Three doors: the drain, markSent, a failed read. The first check fails on the pre-fix tree. ── */
    section('3b. write-guard');
    const guardPart = () => {
      const G = loadPart('01');
      if (!G) return null;
      G.run('(function(){ window.__store = null; window.__debounced = null;' +
        ' window.loadState720 = function () { return window.__store ? JSON.parse(JSON.stringify(window.__store)) : null; };' +
        ' window.saveState720 = function (id, doc) { window.__store = JSON.parse(JSON.stringify(doc)); return true; };' +
        ' window.saveState720Debounced = function (id, doc) { window.__debounced = doc; };' +   // by reference, as the library holds it
        ' window.stateLastResult720 = function () { return { op: "load", status: 200, ok: true, reason: "ok" }; };' +
        ' window.sendStatement720 = function () {}; _resumeReady = false; _unitState = null; return 1; })()');
      G.seed = () => G.run('(function(){ window.__store = { v: 5, component: currentPartSlug(), payload: { currentScreen: 2 }, done: {}, doneItems: {},' +
        ' hints: {}, picks: {}, ui: { character: "character-1" }, results: {} }; return 1; })()');
      G.stored = () => JSON.parse(G.run('JSON.stringify(window.__store)'));
      G.end = async () => { await new Promise((r) => setTimeout(r, 50)); G.w.close(); };
      return G;
    };
    let G = guardPart();
    if (G) {
      G.seed();
      G.run('(function(){ readUnitState(); setUnitCharacter("character-2"); goTo(1); return 1; })()');
      ok('write-guard', 'a pick + navigation before stage B writes nothing',
         G.stored().payload.currentScreen === 2 && G.run('_pendingProfile && _pendingProfile.character') === 'character-2', JSON.stringify(G.stored()));
      G.run('(function(){ _resumeReady = true; drainPendingUnitState(); return 1; })()');
      ok('write-guard', 'the drain persists the document AS READ: saved payload intact, character updated',
         G.stored().payload.currentScreen === 2 && G.stored().ui.character === 'character-2', JSON.stringify(G.stored()));
      G.run('(function(){ applyExecutionState(_unitState.payload); return 1; })()');
      ok('write-guard', 'the restore lands on the saved screen after the drain', G.run('currentScreen') === 2, 'currentScreen=' + G.run('currentScreen'));
      ok('write-guard', 'the debounced document (held by reference) still carries the saved payload after the restore',
         G.run('window.__debounced && window.__debounced.payload && window.__debounced.payload.currentScreen') === 2);
      await G.end();
    }
    G = guardPart();
    if (G) {
      G.seed();
      G.run('(function(){ readUnitState(); goTo(1); markSent("doneItems", "x"); return 1; })()');
      ok('write-guard', 'markSent before stage B marks in memory but writes nothing',
         G.stored().payload.currentScreen === 2 && !G.stored().doneItems.x && G.run('_unitState.doneItems.x') === true, JSON.stringify(G.stored()));
      G.run('(function(){ _resumeReady = true; flushResumeSave(); return 1; })()');
      ok('write-guard', 'the key marked in memory rides the next save', G.stored().doneItems.x === true, JSON.stringify(G.stored()));
      await G.end();
    }
    /* The leave save (xapi-720-l.js, 2026-11-06): pagehide / beforeunload go through saveState720OnLeave when the
       library has it (-l), and fall back on saveState720 without it (-k). Neither touches the debounced path. */
    G = guardPart();
    if (G) {
      G.seed();
      G.run('(function(){ window.__leave = null; window.saveState720OnLeave = function (id, doc) { window.__leave = JSON.parse(JSON.stringify(doc)); return true; };' +
        ' readUnitState(); _resumeReady = true; goTo(3); flushResumeSaveOnLeave(); return 1; })()');
      ok('write-guard', 'the leave handler saves the current screen through saveState720OnLeave, and saveState720 is not called',
         G.run('window.__leave && window.__leave.payload.currentScreen') === 3 && G.stored().payload.currentScreen === 2,
         'leave=' + G.run('JSON.stringify(window.__leave)') + ' store=' + JSON.stringify(G.stored()));
      G.run('(function(){ delete window.saveState720OnLeave; goTo(4); flushResumeSaveOnLeave(); return 1; })()');
      ok('write-guard', 'without saveState720OnLeave (-k) the leave handler falls back on saveState720 with the current screen',
         G.stored().payload.currentScreen === 4 && G.run('window.__leave.payload.currentScreen') === 3, JSON.stringify(G.stored()));
      await G.end();
    }
    G = guardPart();
    if (G) {
      G.seed();
      G.run('(function(){ window.__realLoad = window.loadState720; window.loadState720 = function () { return null; };' +
        ' window.stateLastResult720 = function () { return { op: "load", status: 500, ok: false, reason: "rejected" }; }; readUnitState(); return 1; })()');
      ok('write-guard', 'a read that fails (not a 404) is flagged, not taken as a fresh document',
         G.run('_resumeReadFailed') === true && G.run('_unitState.payload') === null);
      G.run('(function(){ window.__leave = null; window.saveState720OnLeave = function (id, doc) { window.__leave = doc; return true; };' +
        ' _resumeReady = true; window.__p = persistUnitState(_unitState); flushResumeSave(); markSent("done", "y"); goTo(1); scheduleResumeSave(); flushResumeSaveOnLeave(); return 1; })()');
      ok('write-guard', 'after a failed read every write is refused (the leave save too) and the stored document is untouched',
         G.run('window.__p') === false && G.stored().payload.currentScreen === 2 && G.stored().done.y === undefined && G.run('window.__debounced') === null && G.run('window.__leave') === null,
         JSON.stringify(G.stored()));
      G.run('(function(){ window.loadState720 = window.__realLoad; window.stateLastResult720 = function () { return { op: "load", status: 200, ok: true, reason: "ok" }; }; readUnitState(); return 1; })()');
      ok('write-guard', 'a read that succeeds afterwards clears the flag and brings the payload back',
         G.run('_resumeReadFailed') === false && G.run('_unitState.payload.currentScreen') === 2);
      G.run('(function(){ window.loadState720 = function () { return null; }; window.stateLastResult720 = function () { return { op: "load", status: 404, ok: true, reason: "absent" }; }; readUnitState(); return 1; })()');
      ok('write-guard', 'a 404 ("nothing saved yet") is NOT a failed read', G.run('_resumeReadFailed') === false && G.run('_unitState.payload') === null);
      await G.end();
    }
  }

  if (EXPECT.reporting) {
    /* ── 3c. true/false (guide §6.3b, 2026-11-04): each statement of part 06's set is its own question,
       answered with result.response 'true' / 'false' — the learner's boolean, never the label. ── */
    section('3c. true/false statements');
    let T = loadPart('06');
    if (T && T.run('typeof SAQ_LABELS') !== 'object') {
      ok('06', 'the true/false engine declares SAQ_LABELS (true label first)', false, 'pre-split code');
      T.w.close(); T = null;
    }
    if (T) {
      const tf = (META['06'].subContent || []).flatMap((s) => s.questions || []).filter((q) => q.questionType === 'true-false');
      const log = JSON.parse(T.run('(function(){ var log = []; window.XAPI_USING_G = true; window.METADATA = ' + JSON.stringify(META['06']) + ';' +
        ' window.sendStatement720 = function (v, t, r, o) { if (/^answered/.test(v)) log.push({ v: v, q: o && (o.questionId || o.objectId), r: r }); };' +
        ' goTo(46); var cfg = window.GEN_DATA[41];' +
        ' cfg.statements.forEach(function (s, i) { saqState[41].answers[s.id] = i === 0 ? s.correct : SAQ_LABELS.filter(function (l) { return l !== s.correct; })[0]; });' +
        ' saqGenCheck(41); return JSON.stringify(log); })()'));
      ok('06', 'the set sends one answered.last per true-false question (' + tf.length + ')',
         tf.length === 2 && log.length === tf.length && log.every((s) => s.v === 'answered.last'), JSON.stringify(log).slice(0, 300));
      tf.forEach((q, i) => {
        const s = log.find((x) => x.q && x.q.replace(/\/$/, '').endsWith(q.questionId.split('/').pop()) && x.q.includes('-001/'));
        const want = i === 0 ? q.correctXapiResponsesPattern[0] : String(q.correctXapiResponsesPattern[0] !== 'true');
        ok('06', q.questionId.split('/').slice(-2).join('/') + ': response is the literal boolean, success matches the pattern',
           !!s && s.r && s.r.response === want && s.r.success === (i === 0), JSON.stringify(s));
      });
      /* State saved before the split (one q2 for the set, section C as q3) is translated once. */
      const tr = JSON.parse(T.run('(function(){ var cfg = window.GEN_DATA[41], ans = {};' +
        ' cfg.statements.forEach(function (s) { ans[s.id] = s.correct; });' +
        ' Object.keys(XAPI_Q_RESULTS).forEach(function (k) { delete XAPI_Q_RESULTS[k]; });' +
        ' _unitState = emptyUnitState(); _unitState.hints = { "001/q2": true, "001/q3": true };' +
        ' applyResumeVars({ currentScreen: 47, xq: { "001/q1": true, "001/q2": true, "001/q3": false }, saq: { 41: { answers: ans, attempts: 1, done: true, correct: true } } });' +
        ' return JSON.stringify({ xq: XAPI_Q_RESULTS, hints: _unitState.hints, ids: capturePartPayload().ids }); })()'));
      ok('06', 'an old payload is translated: q2 -> q2 + q3 from the saved answers, q3 -> q4, hints too',
         tr.xq['001/q1'] === true && tr.xq['001/q2'] === true && tr.xq['001/q3'] === true && tr.xq['001/q4'] === false
         && tr.hints['001/q2'] && tr.hints['001/q3'] && tr.hints['001/q4'] && tr.ids === 2, JSON.stringify(tr));
      await new Promise((r) => setTimeout(r, 50));
      T.w.close();
    }
  }
}

/* ═══════════════════ 4. Kata's correctXapiResponsesPattern (MOE runbook checks 10.11.26) ═══════════════════
   _test/kata-response.js answers every Kata question right through the page's own check functions and
   asserts result.response === Kata's pattern, byte for byte. Run here so this suite stays the one gate. */
section('4. Kata patterns (_test/kata-response.js)');
{
  const kr = path.join(REPO, '_test', 'kata-response.js');
  if (fs.existsSync(kr)) {
    const out = require('child_process').spawnSync(process.execPath, [kr, BASE], { env: process.env, encoding: 'utf8' });
    const m = /pass=(\d+)\s+fail=(\d+)/.exec(out.stdout || '');
    ok('kata', 'kata-response.js: every Kata question sends Kata\'s pattern', !!m && m[2] === '0',
       m ? 'pass=' + m[1] + ' fail=' + m[2] + '\n' + (out.stdout || '').split('\n').filter((l) => /FAIL/.test(l)).slice(0, 8).join('\n') : (out.stderr || '').slice(0, 300));
  } else skip('kata-response.js');
}

/* ═══════════════════════════════ summary ═══════════════════════════════ */
console.log('\n' + '='.repeat(64));
if (failures.length) {
  console.log(failures.length + ' FAILED, ' + pass + ' passed, ' + skipped + ' group(s) skipped\n');
  failures.forEach((f) => console.log(f));
  console.log('');
  process.exit(1);
}
console.log('All ' + pass + ' checks passed (' + skipped + ' group(s) skipped until their phase lands).');
})();
