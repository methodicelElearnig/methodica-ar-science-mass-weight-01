/* Part 03 — the stop after basic Q3: «ענו נכון על כל השאלות כדי להתקדם» (screen 24, script slide 70).
 *
 * MOE 24.09 ("רשום שצריך לענות על כל השאלות נכון כדי להתקדם אבל גם אם לא עונים על כולן נכון אפשר
 * להתקדם לשאלה הקשה"). Decided 07.10.26: all three basic questions right -> screen 28 as before;
 * any of them wrong -> Q3's "המשך" ends the component on screen 27 (completed success:false once,
 * button disabled), and it stays ended after a reload.
 *
 * Real Chrome (puppeteer-core), the part served locally, answers through the real option clicks and
 * check buttons. Q2's board is set through s26dndPlace (the drop rule itself), not a pointer drag —
 * the drag is covered by the drag tests; this one is about the stop.
 *
 *   NODE_PATH=/tmp/lomda-test/node_modules node _test/basic-stop.js
 *
 * Needs puppeteer-core and a local Chrome (CHROME env var, or the default Windows path).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..');
const PART = 'methodica-ar-science-mass-weight-01-03';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

let pass = 0; const failures = [];
function ok(scope, name, cond, detail) {
  if (cond) { pass++; return; }
  failures.push('  [' + scope + '] ' + name + (detail ? '\n      -> ' + detail : ''));
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webp': 'image/webp', '.gif': 'image/gif' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0].split('#')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* A recorder in place of the library's sender, installed once the page (and its loader) has run —
   the same seam _test/verify-report.js records at. */
const RECORDER = () => {
  window.__log = [];
  window.XAPI_USING_G = true;
  window.sendStatement720 = function (verb, objType, result, ctx) {
    window.__log.push({ verb: verb, objectId: (ctx && (ctx.objectId || ctx.questionId)) || null, result: result || null });
  };
};

/* Each page in its own context: the off-platform resume store is browser storage, and a page
   sharing it would start from the previous scenario's saved state. */
async function open(browser, base) {
  const ctx = await (browser.createBrowserContext ? browser.createBrowserContext() : browser.createIncognitoBrowserContext());
  const page = await ctx.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  page.__errors = [];
  page.on('pageerror', (e) => page.__errors.push(e.message));
  await page.goto(base + PART + '/index.html', { waitUntil: 'networkidle0' });
  await sleep(300);
  await page.evaluate(RECORDER);
  return page;
}

/* SCQ (sid 24 = Q1, 26 = Q3): right = the option whose text is GEN_DATA[sid].correctAnswer;
   wrong = two different wrong options (the Retry gate refuses the same one twice). */
async function answerScq(page, sid, right) {
  await page.evaluate(async (sid, right) => {
    const cfg = window.GEN_DATA[sid];
    const opts = [...document.querySelectorAll('.screen.active [onclick^="scqGenSelect(' + sid + ',"]')];
    const idx = opts.map((o, i) => [i, o.textContent.trim()]);
    const good = idx.find(([, t]) => t === cfg.correctAnswer.trim())[0];
    const bad = idx.filter(([i]) => i !== good).map(([i]) => i);
    const pick = async (i) => { opts[i].click(); await new Promise((r) => setTimeout(r, 50)); document.getElementById(cfg.checkBtnId).click(); await new Promise((r) => setTimeout(r, 80)); };
    if (right) await pick(good); else { await pick(bad[0]); await pick(bad[1]); }
  }, sid, right);
}

/* Q2 board (sid 25): right = the correct mapping; wrong = two different wrong boards. */
async function answerDnd(page, right) {
  await page.evaluate(async (right) => {
    const cfg = window.GEN_DATA[25];
    const set = (m) => { Object.keys(m).forEach((k) => { s26dndPlacement[k] = m[k]; }); s26dndRender(false); s26dndUpdateCheckBtn(); };
    const check = async () => { document.getElementById(cfg.checkBtnId).click(); await new Promise((r) => setTimeout(r, 80)); };
    if (right) { set({ alef: 'weight', bet: 'mass', gimel: 'mass', dalet: 'weight' }); await check(); return; }
    set({ alef: 'mass', dalet: 'mass', bet: 'weight', gimel: 'weight' }); await check();   // all four wrong
    await check();                                                                        // נסה שוב
    set({ alef: 'mass', gimel: 'mass', bet: 'weight', dalet: 'weight' }); await check();   // two wrong, a different board
  }, right);
}

const clickId = (page, id) => page.evaluate((id) => document.getElementById(id).click(), id);
const state = (page) => page.evaluate(() => ({
  screen: currentScreen,
  qr: Object.assign({}, window.lomdaState.questionResults),
  btnDisabled: document.getElementById('s24-continue-btn').disabled,
  completed: window.__log.filter((s) => s.verb === 'completed' && !s.objectId),
}));

async function walk(page, pattern) {
  await page.waitForFunction(() => !document.getElementById('s24-continue').disabled, { timeout: 15000 });   // after the entrance staging
  await clickId(page, 's24-continue'); await sleep(150);
  await answerScq(page, 24, pattern[0] === 'R'); await clickId(page, 's22-continue-btn'); await sleep(100);
  await answerDnd(page, pattern[1] === 'R'); await clickId(page, 'bq2-continue-btn'); await sleep(100);
  await answerScq(page, 26, pattern[2] === 'R'); await sleep(100);
}

(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  try {
    for (const pattern of ['WWW', 'RRW', 'RWR', 'WRR']) {
      const scope = pattern;
      const page = await open(browser, base);
      await walk(page, pattern);
      let s = await state(page);
      ok(scope, 'on screen 27 with all three resolved', s.screen === 27 && [1, 2, 3].every((q) => typeof s.qr[q] === 'boolean'), JSON.stringify(s));
      ok(scope, 'before "המשך": live, nothing completed', s.btnDisabled === false && s.completed.length === 0, JSON.stringify(s));
      await clickId(page, 's24-continue-btn'); await sleep(150);
      s = await state(page);
      ok(scope, '"המשך" stays on 27 (no "יופי של עבודה")', s.screen === 27, 'screen=' + s.screen);
      ok(scope, 'one component completed, success:false', s.completed.length === 1 && s.completed[0].result && s.completed[0].result.success === false, JSON.stringify(s.completed));
      ok(scope, 'button disabled', s.btnDisabled === true);
      await page.evaluate(() => { document.getElementById('s24-continue-btn').disabled = false; document.getElementById('s24-continue-btn').click(); });
      await page.keyboard.press('ArrowLeft'); await sleep(100);
      s = await state(page);
      ok(scope, 'a second click / the arrow key: no second completed, still on 27', s.completed.length === 1 && s.screen === 27, JSON.stringify(s));

      const payload = await page.evaluate(() => JSON.stringify(capturePartPayload()));
      ok(scope, 'the resume payload carries bs', JSON.parse(payload).bs === true);
      const fresh = await open(browser, base);
      await fresh.evaluate((st) => applyExecutionState(JSON.parse(st), 27), payload); await sleep(200);
      s = await state(fresh);
      ok(scope, 'reload (no ledger): on 27, button still disabled', s.screen === 27 && s.btnDisabled === true, JSON.stringify(s));
      await fresh.evaluate(() => { goTo(26); goTo(27); }); await sleep(150);
      s = await state(fresh);
      ok(scope, 'reload + back and forward: still disabled, nothing sent', s.btnDisabled === true && s.completed.length === 0, JSON.stringify(s));
      ok(scope, 'no page errors', page.__errors.length === 0 && fresh.__errors.length === 0, page.__errors.concat(fresh.__errors).join(' | '));
      await page.close(); await fresh.close();
    }

    {   // answered, not clicked, reload: the button is live and ends it
      const scope = 'WWW reload before the click';
      const page = await open(browser, base);
      await walk(page, 'WWW');
      const payload = await page.evaluate(() => JSON.stringify(capturePartPayload()));
      const fresh = await open(browser, base);
      await fresh.evaluate((st) => applyExecutionState(JSON.parse(st), 27), payload); await sleep(200);
      let s = await state(fresh);
      ok(scope, 'button live after the reload', s.btnDisabled === false, JSON.stringify(s));
      await clickId(fresh, 's24-continue-btn'); await sleep(150);
      s = await state(fresh);
      ok(scope, 'its click ends the component on 27', s.screen === 27 && s.completed.length === 1 && s.completed[0].result.success === false && s.btnDisabled, JSON.stringify(s));
      await page.close(); await fresh.close();
    }

    {   // all three right: through to 28, nothing completed
      const scope = 'RRR';
      const page = await open(browser, base);
      await walk(page, 'RRR');
      await clickId(page, 's24-continue-btn'); await sleep(150);
      const s = await state(page);
      ok(scope, '"המשך" goes to screen 28', s.screen === 28, 'screen=' + s.screen);
      ok(scope, 'nothing completed at the stop', s.completed.length === 0, JSON.stringify(s.completed));
      ok(scope, 'no page errors', page.__errors.length === 0, page.__errors.join(' | '));
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
  console.log(failures.length ? failures.join('\n') + '\n' : '');
  console.log(failures.length ? `=== basic stop: ${pass} passed, ${failures.length} failed ===` : `All ${pass} basic-stop checks passed.`);
  process.exit(failures.length ? 1 : 0);
})().catch((e) => { console.error(e); server.close(); process.exit(2); });
