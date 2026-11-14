'use strict';

/* ── 1. Navigation Engine ──────────────────────────────────────── */

const TOTAL_SCREENS = 15; // component 01 — local count (bump as screens are added)

let currentScreen = 0; // component 01 — first screen in this component

/* ══════════════════════════════════════════════════════════════
   DEV NAV TOOLBAR — TEMPORARY, FOR QA ONLY
   Flip this to false (or delete this block + the matching HTML block
   in index.html + the matching CSS block in css/style.css) to remove
   the toolbar entirely before publishing.
   ══════════════════════════════════════════════════════════════ */
// Present only in index_dev.html's own dev tooling context — production
// index.html no longer includes the #dev-nav-bar markup (removed so the
// toolbar can't show up inside the real QA shell/interface), so this is
// false there automatically. index_dev.html loads index.html in its own
// iframe and drives navigation via a separate top-level dev bar + the
// legacy totalScreens/screenChanged/devGoTo messages, so it never needed
// this element either — nothing here affects it.
const DEV_NAV_ENABLED = !!document.getElementById('dev-nav-bar');
const DEV_NAV_HEIGHT = 34; // px reserved at the top of the viewport, must match #dev-nav-bar's height

function scaleApp() {
  const app = document.getElementById('app');
  const topReserved = DEV_NAV_ENABLED ? DEV_NAV_HEIGHT : 0;
  const availH = window.innerHeight - topReserved;
  const scaleX = window.innerWidth / 1280;
  const scaleY = availH / 710;
  const scale  = Math.min(scaleX, scaleY);
  const left   = (window.innerWidth - 1280 * scale) / 2;
  const top    = topReserved + (availH - 710 * scale) / 2;
  app.style.transform = `scale(${scale})`;
  app.style.left      = `${left}px`;
  app.style.top       = `${top}px`;
}

window.addEventListener('resize', scaleApp);
scaleApp();

function goTo(n) {
  if (n < 0 || n >= TOTAL_SCREENS) return;

  // Close all hint overlays and popups before screen swap (720 template rule)
  // Note: only style.display is touched here, not classList — the "hidden"
  // utility class uses !important, which permanently defeated every
  // openHint() function's `style.display = ''` afterward (none of them
  // remove the class). style.display alone is sufficient to hide on nav.
  document.querySelectorAll('[id$="-hint-overlay"], [id$="-popup"]').forEach(function(el) {
    el.style.display = 'none';
  });

  // Pause any playing videos before navigating away
  document.querySelectorAll('video').forEach(v => v.pause());

  // Swap active screen (match by data-screen attribute, not DOM position —
  // screens are not guaranteed to be in strict numeric DOM order)
  document.querySelectorAll('.screen').forEach((s) => {
    s.classList.toggle('active', Number(s.dataset.screen) === n);
  });

  // A hidden character clip carries data-src instead of src, so the page does not download it
  // at load, ahead of the resume restore (BOOT-AND-RESUME-HARDENING-2026-11-03.md, C4). Its src
  // is set here, on first entry and before the screen's enter hook (which may call load()).
  document.querySelectorAll('.screen.active [data-src]').forEach(function (el) {
    el.setAttribute('src', el.getAttribute('data-src'));
    el.removeAttribute('data-src');
    var v = el.tagName === 'SOURCE' ? el.parentNode : el;
    if (v && typeof v.load === 'function') v.load();
  });

  currentScreen = n;
  resetScreenState(n);

  // Resume always-on character loops (TransitionScreen gifs) in the screen
  // just entered. goTo() pauses every <video> above before the swap, but not
  // every screen's enter() explicitly resumes its own — only the ones that
  // re-set .src from data do, as a side effect. A screen whose character
  // video is static in the DOM was never resumed, so it froze on return
  // instead of continuing to run. This keeps them running for as long as
  // the slide stays active, with no restart-from-frame-0 jump on return.
  const activeScreen = document.querySelector('.screen.active');
  if (activeScreen) {
    activeScreen.querySelectorAll('video[autoplay]').forEach(v => v.play().catch(() => {}));
  }

  updateDevNavBar();

  // Notify dev tool (postMessage works across file:// frames)
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'screenChanged', screen: n, total: TOTAL_SCREENS }, '*');
  }

  notifyDevHost();


  /* ── 720 platform seams (ADDING-REPORTING-AND-RESUME.md §6.7, §8.4a) ──
     At the very end, after .active and after resetScreenState(n): the order above is untouched.
     Each call is wrapped on its own so one failing cannot silence the others. */
  /* The screen-4 video must not keep playing on a hidden screen; a real pause also closes its open
     xAPI 'played' (ADDING-REPORTING-AND-RESUME.md §6.9.2). */
  try { if (n !== SCREEN_VIDEO && s4YTPlayer && typeof s4YTPlayer.pauseVideo === 'function') s4YTPlayer.pauseVideo(); } catch (e) {}
  try { repaintScreen(n); } catch (e) { console.error('[resume] repaintScreen', e); }
  try { xapiOnScreen(n); } catch (e) {}
  try { scheduleResumeSave(); } catch (e) {}
}

/* ══════════════════════════════════════════════════════════════
   DEV PROTOCOL BRIDGE — for the external QA shell (unit-shell.js)
   Same DEV_READY/DEV_STATE/DEV_GOTO/DEV_RESET contract established by
   methodica-math-percent-06 (see docs/QA-REVIEW-MODE-HOOK.md), adapted for
   this unit's GLOBAL data-screen numbering: `current` and every
   screens[].index are each screen's real data-screen value (this
   component's own slice of the unit's 0-49 range), not a 0-based local
   position — goTo(n) already matches by data-screen value, so DEV_GOTO
   needs no translation here.
   Additive only: does not replace the legacy totalScreens/screenChanged
   messages above, and does not alter goTo()'s learner-facing behavior.
   ══════════════════════════════════════════════════════════════ */
function devScreenList() {
  var list = [];
  document.querySelectorAll('.screen[data-screen]').forEach(function (el) {
    list.push({ index: Number(el.dataset.screen), id: el.id || ('s' + el.dataset.screen) });
  });
  list.sort(function (a, b) { return a.index - b.index; });
  return list;
}

function notifyDevHost() {
  if (window.parent === window) return;
  window.parent.postMessage({
    type: 'DEV_STATE',
    total: document.querySelectorAll('.screen[data-screen]').length,
    current: currentScreen,
    screens: devScreenList()
  }, '*');
}

window.addEventListener('message', function (e) {
  if (!e.data) return;
  if (e.data.type === 'DEV_GOTO') {
    var n = parseInt(e.data.screen, 10);
    if (!isNaN(n)) goTo(n);
  } else if (e.data.type === 'DEV_RESET') {
    resetScreenState(currentScreen);
  }
});

if (window.parent !== window) {
  window.parent.postMessage({
    type: 'DEV_READY',
    total: document.querySelectorAll('.screen[data-screen]').length,
    current: currentScreen,
    screens: devScreenList()
  }, '*');
}

// DEV NAV TOOLBAR — keep the toolbar's screen label / select in sync with goTo().
// No-op (and does nothing) when DEV_NAV_ENABLED is false.
function updateDevNavBar() {
  if (!DEV_NAV_ENABLED) return;
  const label = document.getElementById('dev-nav-label');
  if (label) label.textContent = currentScreen + ' / ' + (TOTAL_SCREENS - 1);
  const select = document.getElementById('dev-nav-select');
  if (select) select.value = String(currentScreen);
}

// DEV NAV TOOLBAR — wire up prev/next/direct-jump controls once at load.
// Reuses goTo()/resetScreenState() as-is, so entering a screen this way
// resets its state and replays its entrance animations exactly like any
// other navigation (keyboard arrows, continue/back buttons, dev iframe).
function initDevNavBar() {
  if (!DEV_NAV_ENABLED) return;
  const bar = document.getElementById('dev-nav-bar');
  if (!bar) return;

  const select = document.getElementById('dev-nav-select');
  // Not every number in 0..TOTAL_SCREENS-1 has a real section (e.g. screen 40
  // was removed without renumbering) — build the list from actual sections in
  // the DOM so prev/next/select never land on a blank screen.
  const validScreens = Array.from(document.querySelectorAll('.screen[data-screen]'))
    .map(s => Number(s.dataset.screen))
    .sort((a, b) => a - b);
  validScreens.forEach(n => {
    const opt = document.createElement('option');
    opt.value = String(n);
    opt.textContent = 'מסך ' + n;
    select.appendChild(opt);
  });

  function stepDevNav(dir) {
    const i = validScreens.indexOf(currentScreen);
    const nextIdx = i === -1 ? 0 : Math.max(0, Math.min(validScreens.length - 1, i + dir));
    goTo(validScreens[nextIdx]);
  }

  document.getElementById('dev-nav-prev').addEventListener('click', () => stepDevNav(-1));
  document.getElementById('dev-nav-next').addEventListener('click', () => stepDevNav(1));
  select.addEventListener('change', () => goTo(Number(select.value)));

  updateDevNavBar();
}
initDevNavBar();

function resetScreenState(n) {
    switch (n) {
    case 0: enterScreen0();  break;
    case 1: hookEnter();       break;
    case 2: enterScreen2();  break;
    case 3: tosEnter();        break;
    case 4: enterScreen4();  break;
    case 5: enterScreen5();  break;
    case 6: enterScreen6();  break;
    case 7: enterScreen7();  break;
    case 8: enterScreen8();  break;
    case 9: enterScreen9();  break;
    case 10: enterScreen10();  break;
    case 11: enterScreen11();  break;
    case 12: enterScreen12();  break;
    case 13: enterScreen13();  break;
    case 14: enterScreen14();  break;
    default: break;
  }
}

// Keyboard navigation — RTL convention: ArrowLeft = next, ArrowRight = prev
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft')  goTo(currentScreen + 1);
  if (e.key === 'ArrowRight') goTo(currentScreen - 1);
});

// Dev tool bridge
window.addEventListener('message', (e) => {
  if (!e.data) return;
  if (e.data.type === 'devGoTo') goTo(e.data.screen);
  if (e.data.type === 'veeConfig') {
    window.LAYOUT_CONFIG = e.data.config;
    applyLayoutConfig(currentScreen);
  }
});

// Apply layout overrides from LAYOUT_CONFIG (set by layout-config.js or VEE dev tool)
/* Semantic mapping: config key → element ID, per screen.
   Change positions in layout-config.js only — never touch this map. */
const LAYOUT_MAP = {};

function applyLayoutConfig(n) {
  const cfg = (window.LAYOUT_CONFIG || {})[String(n)];
  if (!cfg) return;

  const map = LAYOUT_MAP[String(n)];
  if (map) {
    for (const [key, pos] of Object.entries(cfg)) {
      const id = map[key];
      if (!id) continue;
      const el = document.getElementById(id);
      if (!el) continue;
      if (pos.left   !== undefined) el.style.left   = pos.left;
      if (pos.top    !== undefined) el.style.top     = pos.top;
      if (pos.right  !== undefined) el.style.right   = pos.right;
      if (pos.bottom !== undefined) el.style.bottom  = pos.bottom;
      if (pos.width  !== undefined) el.style.width   = pos.width;
      if (pos.height !== undefined) el.style.height  = pos.height;
    }
  }

  // Legacy: screen 1 speech bubbles (.s1-bubble-wrap inside .s1-card)
  const screenEl = document.querySelector('[data-screen="' + n + '"]');
  if (!screenEl) return;
  ['hc1','hc2','hc3','hc4'].forEach(hcId => {
    const k = cfg['bubble-' + hcId];
    if (!k) return;
    const card = screenEl.querySelector('#' + hcId);
    const bw   = card && card.querySelector('.s1-bubble-wrap');
    if (!bw) return;
    if (k.left)   { bw.style.position = 'absolute'; bw.style.left   = k.left; }
    if (k.top)    { bw.style.position = 'absolute'; bw.style.top    = k.top; }
    if (k.width)  bw.style.width  = k.width;
    if (k.height) bw.style.height = k.height;
  });
}

// Announce total screens to dev tool on load
if (window.parent !== window) {
  window.parent.postMessage({ type: 'totalScreens', total: TOTAL_SCREENS }, '*');
}

/* ── 2. Screen Registry ─────────────────────────────────────────── */
const SCREEN_INTRO       = 0;
const SCREEN_HOOK        = 1;
const SCREEN_HOOK_POPUP  = 2;
const SCREEN_METHOD      = 3;
const SCREEN_VIDEO       = 4;
const SCREEN_ACCORDION   = 5;
const SCREEN_HOTSPOT     = 6; // hotspot image — beach family scene
const SCREEN_MOON        = 7; // hotspot image — same family on the moon
const SCREEN_HOQ         = 8; // hook open question — earth vs moon
const SCREEN_SUMMARY     = 9; // knowledge summary — מסה vs משקל
const SCREEN_CAROUSEL    = 10; // carousel — 2 types of scales
const SCREEN_DDQ         = 11; // drag-and-drop table — summary
const SCREEN_WARMUP      = 12; // transition screen before warmup questions
const SCREEN_WARMUP_Q1   = 13; // dropdown question 1 of 2 (warmup)
const SCREEN_WARMUP_Q2   = 14; // single choice question 2 of 2 (warmup)
const SCREEN_PRACTICE     = 15; // transition screen before practice questions
const SCREEN_PRACTICE_Q1  = 16; // practice question 1 of 6
const SCREEN_PRACTICE_Q2  = 17; // practice question 2 of 6
const SCREEN_PRACTICE_Q3  = 18; // practice question 3 of 6
const SCREEN_PRACTICE_Q4  = 19; // practice question 4 of 6
const SCREEN_PRACTICE_Q5  = 20; // practice question 5 of 6
const SCREEN_GALILEO_INTRO = 21; // short text screen — Galileo experiment, before Q6
const SCREEN_MOON_INTRO    = 22; // short text screen — Moon experiment, before Q6
const SCREEN_PRACTICE_Q6  = 23; // practice question 6 of 6
const SCREEN_BASIC        = 24; // transition screen before basic practice questions
const SCREEN_BASIC_Q1     = 25; // basic practice question 1 of 3
const SCREEN_BASIC_Q2     = 26; // basic practice question 2 of 3
const SCREEN_BASIC_Q3     = 27; // basic practice question 3 of 3
const SCREEN_STANDARD_B    = 28; // transition screen before standard-B practice
const SCREEN_STANDARD_B_Q2 = 29; // standard-B question 1 of 2 (Noa's hypothesis — legacy name, kept to avoid a wider rename)
const SCREEN_STANDARD_B_TOMATO = 30; // standard-B question 2 of 2 (tomato/moon scale) — appended index, see screen 46 comment in index.html
const SCREEN_CLASS_TASK      = 31; // transition screen before class task
const SCREEN_CLASS_TASK_INST = 32; // class task instructions
const SCREEN_CLASS_TASK_FORM = 33; // class task reflection form
const SCREEN_CLASS_TASK_WRAPUP = 34; // class task wrap-up (scientific tools) — renumbered into its correct place in the sequence; see screen 47 comment in index.html
const SCREEN_ADVANCED       = 35;
const SCREEN_ADVANCED_GUIDE = 36; // applet instruction screen (script slide 99) — right: instructions text, left: applet placeholder, feeds into Q1
const SCREEN_ADVANCED_Q1   = 37;
const SCREEN_ADVANCED_Q1B  = 38; // Advanced Q1 section ב (שחזור ניסוי גלילאו) — new screen, inserted before Q2
const SCREEN_ADVANCED_Q2A  = 39;
// data-screen 40 removed (2026-07-18): was an orphaned, fabricated question with no script basis — see WORK_PROGRESS.md.
const SCREEN_ADVANCED_Q3   = 41;
const SCREEN_ADVANCED_Q4   = 42;
const SCREEN_ADVANCED_Q5   = 43;
const SCREEN_PEAK          = 44;
const SCREEN_PEAK_Q1       = 45;
const SCREEN_PEAK_Q2       = 46;
const SCREEN_PEAK_Q3       = 47;
const SCREEN_PEAK_FAIL     = 48;
const SCREEN_PEAK_SUCCESS  = 49;

/* ── 3. State Manager ────────────────────────────────────────────── */
window.lomdaState = {
  acquisitionPath: null,  // 'video' | 'text' — set by TwoOptionSelection
  standardScore:   0,
  standardTotal:   6,
  peakSections:    0,
  questionResults: {},    // warm-up question number (1-2) -> true/false, for the progress-bar dots
};

// Warm-up question number (1-2) -> its progress dot. Same pattern as
// components 02/03/05's markQuestionResult/render*ProgressIcons.
function markQuestionResult(qNum, correct) {
  window.lomdaState.questionResults[qNum] = correct;
}

// Reflects each warm-up question's tracked result onto its progress dot:
// green+checkmark if correct, red+X if the final attempt was wrong. The
// dot's own "is-done" look is already set in the markup; this only ever
// adds/removes the "is-wrong"/"is-correct"/"is-incorrect" modifiers.
function renderWarmupProgressIcons(screenEl) {
  if (!screenEl) return;
  const items = Array.from(screenEl.querySelectorAll('.s12-prog-item'));
  items.forEach((item, i) => {
    const dot = item.querySelector('.s12-prog-dot');
    if (!dot || !dot.classList.contains('is-done')) return;
    const qNum = i + 1;
    const result = window.lomdaState.questionResults[qNum];
    dot.classList.toggle('is-wrong', result === false);
    dot.classList.toggle('is-correct', result === true);
    dot.classList.toggle('is-incorrect', result === false);
  });
}

function routeAfterStandard() {
  // Script (slide 38): "צריך לענות נכון על 4 שאלות (80%) לפחות" — pass = 4/6 correct.
  return window.lomdaState.standardScore >= 4;
}

/* ── 4. Modal Engine ────────────────────────────────────────────── */
function openModal(modalId)  { document.getElementById(modalId).classList.remove('hidden'); }
function closeModal(modalId) { document.getElementById(modalId).classList.add('hidden'); }

/* ── 14. Screen-Specific Logic ──────────────────────────────────── */

/* Screen 0: TransitionScreen — Opening */
let s0Timers = [];
let s0Seen = false;
function enterScreen0() {
  s0Timers.forEach(clearTimeout); s0Timers = [];

  const els = [
    document.getElementById('s0-title'),
    document.getElementById('s0-subtitle'),
    document.getElementById('s0-char'),
  ];
  const btn = document.getElementById('s0-continue');

  // Revisiting this screen (e.g. navigating back to it) shouldn't replay the
  // text stagger — only the character (resumed generically in goTo()) stays
  // alive; the text is already in place.
  if (s0Seen) {
    els.forEach(el => el && el.classList.add('is-visible'));
    btn.disabled = false;
    return;
  }
  s0Seen = true;

  // Staged entrance: title → subtitle → gif, then the continue button
  // enables only once the gif has appeared.
  els.forEach(el => el && el.classList.remove('is-visible'));
  btn.disabled = true;

  const delays = [0, 900, 1800];
  delays.forEach((delay, i) => {
    s0Timers.push(setTimeout(() => {
      if (els[i]) els[i].classList.add('is-visible');
    }, delay));
  });
  s0Timers.push(setTimeout(() => { btn.disabled = false; }, 2400));
}

/* ── Screen 1: Hook — 4 Characters ─────────────────────────────── */

// State flags
let hookSelected  = null;  // 1–4 or null
let hookAnswered  = false; // true once "هل إجابتي صحيحة؟" has been pressed (feedback shown)
let hookDone      = false; // true once learner navigates away via "متابعة"

// Reveal order: RTL reading direction — rightmost card first
// RTL reveal: right (952px) → 3rd (666px) → 2nd (356px) → left (79px)
const HOOK_REVEAL_ORDER = ['hc4', 'hc2', 'hc3', 'hc1'];
const HOOK_REVEAL_DELAY = 100; // ms between each character reveal
let hookRevealTimers = [];

function hookEnter() {
  // Clear any pending reveal timers from a previous enter
  hookRevealTimers.forEach(clearTimeout);
  hookRevealTimers = [];

  const btn = document.getElementById('hook-btn');
  const title = document.getElementById('s1-title');
  const instruction = document.getElementById('s1-instruction');

  if (hookAnswered) {
    // Resume post-feedback state — skip animation
    if (title) title.classList.add('is-visible');
    if (instruction) instruction.classList.add('is-visible');
    HOOK_REVEAL_ORDER.forEach(id => {
      document.getElementById(id).classList.add('is-visible');
    });
    hookRestoreFeedback();
    // Restore selected highlight
    if (hookSelected) {
      document.getElementById('hc' + hookSelected).classList.add('is-selected');
    }
    btn.textContent = 'متابعة';
    btn.classList.add('btn-advance');
    btn.disabled = false;
    return;
  }

  // Initial state — hide all groups, reset everything
  if (title) title.classList.remove('is-visible');
  if (instruction) instruction.classList.remove('is-visible');
  HOOK_REVEAL_ORDER.forEach(id => {
    const card = document.getElementById(id);
    card.classList.remove('is-visible', 'is-selected');
  });
  document.querySelectorAll('.s1-bub-body').forEach(b => b.classList.remove('is-correct', 'is-wrong'));
  document.querySelectorAll('.s1-bub-tail img').forEach(img => { img.src = 'assets/img/hook-bubble-tail-blue.svg'; });
  document.querySelectorAll('.s1-bub-badge').forEach(b => { b.classList.remove('is-correct', 'is-wrong'); b.innerHTML = ''; });
  document.getElementById('hook-orange-wrap').classList.add('hidden');
  hookSelected = null;
  btn.textContent = 'هل إجابتي صحيحة؟';
  btn.classList.remove('btn-advance');
  btn.disabled = true;

  // Staged entrance: first sentence → "اضغطوا على الشخصية" → the 4 characters
  // (RTL reveal order), each a shorter stagger since they read as one group.
  if (title) hookRevealTimers.push(setTimeout(() => title.classList.add('is-visible'), 0));
  if (instruction) hookRevealTimers.push(setTimeout(() => instruction.classList.add('is-visible'), 700));

  const CHAR_REVEAL_START = 1400;
  HOOK_REVEAL_ORDER.forEach((id, i) => {
    const t = setTimeout(() => {
      document.getElementById(id).classList.add('is-visible');
    }, CHAR_REVEAL_START + i * HOOK_REVEAL_DELAY);
    hookRevealTimers.push(t);
  });
}

// Approved 720 "Type 2" badge icons (720-design-guidelines →
// components-icons-states.md), same vector as the radio-circle check/cross,
// scaled up for the 28px hook bubble badge.
const HOOK_SVG_CHECK = '<svg width="15" height="11" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4.5L4.5 8L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const HOOK_SVG_CROSS = '<svg width="13" height="13" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L9 9M9 1L1 9" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>';

function hookSelect(id) {
  if (hookAnswered) return; // locked after feedback

  // Deselect previous
  if (hookSelected) {
    document.getElementById('hc' + hookSelected).classList.remove('is-selected');
  }

  // Select new
  hookSelected = id;
  document.getElementById('hc' + id).classList.add('is-selected');

  // Enable submit button
  document.getElementById('hook-btn').disabled = false;
}

function hookCheck() {
  const btn = document.getElementById('hook-btn');

  if (hookAnswered) {
    // "متابعة" pressed — navigate to next screen
    hookDone = true;
    goTo(SCREEN_HOOK + 1);
    return;
  }

  // Show feedback state
  hookAnswered = true;
  /* xAPI: item 001 q1, one attempt only. The question asks which statement is NOT scientifically
     correct, so the right pick is character 2 (see hookRestoreFeedback). */
  const _hb = document.querySelector('#hc' + hookSelected + ' .s1-bub-body');
  const _hn = _hb && _hb.querySelector('.s1-bub-name');
  const _hName = _hn ? _hn.textContent.trim() : '';
  /* the speaker's name sits in its own span; the catalogue writes "name: text" */
  xapiAnswered('001', 'q1', hookSelected === 2, true, xapiChoiceOf('001', 'q1',
    (_hName ? _hName + ': ' : '') + xapiAnswerText(_hb).slice(_hName.length).trim(), hookSelected === 2));
  hookRestoreFeedback();
  btn.textContent = 'متابعة';
  btn.classList.add('btn-advance');
  btn.disabled = false;
  try { flushResumeSave(); } catch (e) {}
}

function hookRestoreFeedback() {
  // Correct characters (1, 3, 4) → green bubble; incorrect (חן = 2) → red bubble.
  // The tail is a separate <img> (external SVG, can't inherit page CSS variables),
  // so it's swapped to a matching-color asset alongside the bubble class —
  // otherwise it stays on the default blue asset and reads as mismatched/mixed
  // with the blue selection outline.
  [1, 3, 4].forEach(id => {
    const group = document.getElementById('hc' + id);
    const body = group.querySelector('.s1-bub-body');
    if (body) body.classList.add('is-correct');
    const tailImg = group.querySelector('.s1-bub-tail img');
    if (tailImg) tailImg.src = 'assets/img/hook-bubble-tail-green.svg';
    const badge = group.querySelector('.s1-bub-badge');
    if (badge) { badge.classList.add('is-correct'); badge.innerHTML = HOOK_SVG_CHECK; }
  });
  const body2 = document.querySelector('#hc2 .s1-bub-body');
  if (body2) body2.classList.add('is-wrong');
  const tail2 = document.getElementById('s1-tail-2');
  if (tail2) tail2.src = 'assets/img/hook-bubble-tail-red.svg';
  const badge2 = document.querySelector('#hc2 .s1-bub-badge');
  if (badge2) { badge2.classList.add('is-wrong'); badge2.innerHTML = HOOK_SVG_CROSS; }
  // Orange mascot + bubble animate in
  document.getElementById('hook-orange-wrap').classList.remove('hidden');
  // goTo() pauses every <video> on the page before any screen swap, so this
  // mascot clip (present in the DOM from screen load, just hidden until
  // feedback) needs an explicit restart each time it's revealed.
  const mascotVideo = document.querySelector('.hook-orange-crop video');
  if (mascotVideo) { mascotVideo.currentTime = 0; mascotVideo.play().catch(() => {}); }
}

/* ── Screen 2: Hook Popup ───────────────────────────────────────── */
let s2Timers = [];
function enterScreen2() {
  s2Timers.forEach(clearTimeout);
  s2Timers = [];
  const els = ['s2-card', 's2-body', 's2-bold'].map(id => document.getElementById(id));
  const btn = document.getElementById('s2-continue');
  els.forEach(el => el && el.classList.remove('is-visible'));
  btn.disabled = true;

  // s2-body's own rise (#s2-body override, css/style.css) is 300ms — shorter
  // than the shared 550ms .s2-anim transition. The closing bold sentence is
  // scheduled 2s after that rise actually finishes, not at a fixed offset
  // from screen entry.
  const BODY_DELAY = 1000, BODY_RISE = 300;
  const BOLD_DELAY = BODY_DELAY + BODY_RISE + 2000;
  const SHARED_RISE = 550;
  const delays = [0, BODY_DELAY, BOLD_DELAY];
  delays.forEach((delay, i) => {
    s2Timers.push(setTimeout(() => { if (els[i]) els[i].classList.add('is-visible'); }, delay));
  });
  s2Timers.push(setTimeout(() => { btn.disabled = false; }, BOLD_DELAY + SHARED_RISE + 50));
}

/* ── Screen 3: TwoOptionSelection — בחירת מסלול הקניה ────────────── */

function tosEnter() {
  const path = window.lomdaState.acquisitionPath;
  const cards = document.querySelectorAll('#s3 .s3-card');
  const btn   = document.getElementById('s3-continue');

  cards.forEach(c => {
    const isSelected = c.dataset.value === path;
    c.classList.toggle('selected', isSelected);
    c.setAttribute('aria-checked', isSelected ? 'true' : 'false');
  });

  btn.disabled = (path === null);

  // Start each card's video playing as soon as the screen is entered, so it's
  // already mid-motion (not frame 1) by the time the learner hovers — the
  // hover/focus CSS only cross-fades to it, never sets/restarts its src.
  document.querySelectorAll('#s3 .s3-card-img-gif').forEach(vid => {
    if (!vid.src && vid.dataset.videoSrc) {
      vid.src = vid.dataset.videoSrc;
      vid.play().catch(() => {});
    }
  });

  // Staged entrance: title/subtitle first, then each option card
  // individually — the screen should visibly build up, not appear at once.
  const head = document.querySelector('#s3 .s3-head');
  const animEls = [head, ...cards].filter(Boolean);
  animEls.forEach(el => el.classList.remove('is-visible'));
  const CARD_REVEAL_START = 300; // delay before first option (unchanged); options then stagger 100ms apart
  animEls.forEach((el, i) => setTimeout(() => el.classList.add('is-visible'), i === 0 ? 0 : CARD_REVEAL_START + (i - 1) * 100));
}

function tosSelect(cardEl) {
  window.lomdaState.acquisitionPath = cardEl.dataset.value;

  document.querySelectorAll('#s3 .s3-card').forEach(c => {
    const isThis = c === cardEl;
    c.classList.toggle('selected', isThis);
    c.setAttribute('aria-checked', isThis ? 'true' : 'false');
  });

  document.getElementById('s3-continue').disabled = false;
  try { flushResumeSave(); } catch (e) {}
}

function tosAdvance() {
  xapiSelectedLearningType(window.lomdaState.acquisitionPath);   // the confirmed choice, not the card click
  if (window.lomdaState.acquisitionPath === 'video') {
    goTo(SCREEN_VIDEO);
  } else {
    goTo(SCREEN_ACCORDION);
  }
}

/* ── Screen 4: VideoScreen ──────────────────────────────────────── */

let videoWatched = false;
let s4Timers = [];
let s4EntranceComplete = false;
let s4YTPlayer = null;
let s4YTReady = false;
let s4PendingPlay = false;
let s4WatchPoll = null;
let s4FallbackTimer = null;

// Real duration (seconds) of the current video (id R1cj6siRMoE), used only as
// a last-resort fallback below if the YouTube iframe API never initializes
// (e.g. blocked by an ad blocker or a restrictive LMS iframe sandbox) — in
// that case there is no other way to know the video finished.
const S4_VIDEO_FALLBACK_SECONDS = 81;

function s4PlayVideo() {
  if (!s4YTPlayer || typeof s4YTPlayer.seekTo !== 'function') return;
  s4YTPlayer.seekTo(0);
  s4YTPlayer.playVideo();
}

// Backup for s4MarkWatched(): polls the player directly instead of relying
// solely on the onStateChange('ended') message, so the button still unlocks
// immediately even if that single event gets missed.
function s4StartWatchPoll() {
  if (s4WatchPoll) clearInterval(s4WatchPoll);
  s4WatchPoll = setInterval(() => {
    if (videoWatched) { clearInterval(s4WatchPoll); s4WatchPoll = null; return; }
    if (!s4YTPlayer || typeof s4YTPlayer.getPlayerState !== 'function') return;
    const state = s4YTPlayer.getPlayerState();
    if (state === YT.PlayerState.ENDED) { s4MarkWatched(); return; }
    if (state === YT.PlayerState.PLAYING && typeof s4YTPlayer.getDuration === 'function') {
      const dur = s4YTPlayer.getDuration();
      const cur = s4YTPlayer.getCurrentTime();
      if (dur > 0 && dur - cur <= 0.4) s4MarkWatched();
    }
  }, 400);
}

function enterScreen4() {
  s4Timers.forEach(clearTimeout); s4Timers = [];

  const title = document.getElementById('s4-title');
  const placeholder = document.getElementById('s4-placeholder');
  const btn = document.getElementById('s4-continue');

  if (videoWatched) {
    // Already completed on a prior visit — skip the entrance, show final state
    if (title) title.classList.add('is-visible');
    if (placeholder) placeholder.classList.add('is-visible');
    s4EntranceComplete = true;
    btn.disabled = false;
    return;
  }

  // Staged entrance: title → video area, continue stays gated on BOTH the
  // entrance finishing and the video actually finishing ('ended' event).
  if (title) title.classList.remove('is-visible');
  if (placeholder) placeholder.classList.remove('is-visible');
  s4EntranceComplete = false;
  btn.disabled = true;

  const els = [title, placeholder];
  const delays = [0, 700];
  delays.forEach((delay, i) => {
    s4Timers.push(setTimeout(() => { if (els[i]) els[i].classList.add('is-visible'); }, delay));
  });
  s4Timers.push(setTimeout(() => {
    s4EntranceComplete = true;
    btn.disabled = !videoWatched;
  }, 1300));

  if (s4YTReady) {
    s4PlayVideo();
    s4StartWatchPoll();
  } else {
    s4PendingPlay = true;
    // Last-resort fallback: if the YouTube API hasn't announced itself
    // within a few seconds (script blocked, restrictive iframe sandbox,
    // etc.) there is no event to listen for at all, so unlock after the
    // video's own real running time instead of leaving המשך dead forever.
    if (s4FallbackTimer) clearTimeout(s4FallbackTimer);
    s4FallbackTimer = setTimeout(() => {
      if (!s4YTReady && !videoWatched) s4MarkWatched();
    }, (S4_VIDEO_FALLBACK_SECONDS + 3) * 1000);
  }
}

/* ── Screen 5: Accordion — Text Path ──────────────────────────── */

const s5Opened = [false, false, false, false]; // ever opened (persists on revisit)
let   s5IsOpen = [false, false, false, false]; // current expanded state

function enterScreen5() {
  document.getElementById('s5-continue').disabled = !s5Opened.every(Boolean);

  s5IsOpen.forEach((isOpen, i) => {
    const item = document.getElementById('s5-item-' + i);
    item.classList.toggle('s5-open', isOpen);
    document.getElementById('s5-icon-' + i).textContent = isOpen ? '−' : '+';
  });

  // Staged entrance: instruction first, then each accordion item
  // individually, so the interactive area builds up rather than appearing
  // all at once.
  const instruction = document.querySelector('[data-screen="5"] .s5-instruction');
  const items = Array.from(document.querySelectorAll('[data-screen="5"] .s5-item'));
  const animEls = [instruction, ...items].filter(Boolean);
  animEls.forEach(el => el.classList.remove('is-visible'));
  animEls.forEach((el, i) => setTimeout(() => el.classList.add('is-visible'), i * 250));
}

function s5Toggle(i) {
  s5IsOpen[i] = !s5IsOpen[i];
  const item = document.getElementById('s5-item-' + i);
  item.classList.toggle('s5-open', s5IsOpen[i]);
  document.getElementById('s5-icon-' + i).textContent = s5IsOpen[i] ? '−' : '+';

  if (s5IsOpen[i]) {
    s5Opened[i] = true;
    if (s5Opened.every(Boolean)) {
      document.getElementById('s5-continue').disabled = false;
    }
  }
}

function s5SwitchMode(mode) {
  if (mode === 'video') {
    window.lomdaState.acquisitionPath = 'video';
    xapiSelectedLearningType('video');   // switching path from the toggle is a choice too
    goTo(SCREEN_VIDEO);
  }
}

// Called when the YouTube player reports the ENDED state (directly, via the
// watch-poll backup, or via the API-unavailable fallback timer).
function s4MarkWatched() {
  videoWatched = true;
  if (s4WatchPoll) { clearInterval(s4WatchPoll); s4WatchPoll = null; }
  if (s4FallbackTimer) { clearTimeout(s4FallbackTimer); s4FallbackTimer = null; }
  document.getElementById('s4-continue').disabled = !s4EntranceComplete;
  try { flushResumeSave(); } catch (e) {}
}

// Clicking the inactive toggle tab navigates away to the text/cards path.
function s4SwitchMode(mode) {
  if (mode === 'text') {
    window.lomdaState.acquisitionPath = 'text';
    xapiSelectedLearningType('text');    // switching path from the toggle is a choice too
    goTo(SCREEN_ACCORDION);
  }
  // mode === 'video': already here, no-op
}

/* ── Screen 7: Astronaut on Earth ───────────────────────────────── */

let s6EarthRevealed = false;
let s6Timers = [];

function enterScreen6() {
  s6Timers.forEach(clearTimeout);
  s6Timers = [];

  const bubble = document.getElementById('s6-earth-bubble');
  if (bubble) bubble.classList.toggle('is-visible', s6EarthRevealed);
  document.getElementById('s6-continue').disabled = !s6EarthRevealed;

  // Staged entrance: instruction text first, then the astronaut image
  // (media/interactive area), matching the unit's canonical text-before-
  // media order.
  const img  = document.getElementById('s6-earth-wrap');
  const text = document.getElementById('s6-instructions');
  if (s6EarthRevealed) {
    // Resume — show immediately, no re-animation.
    if (img)  img.classList.add('is-visible');
    if (text) text.classList.add('is-visible');
    return;
  }
  if (img)  img.classList.remove('is-visible');
  if (text) text.classList.remove('is-visible');
  s6Timers.push(setTimeout(() => { if (text) text.classList.add('is-visible'); }, 0));
  s6Timers.push(setTimeout(() => { if (img)  img.classList.add('is-visible'); }, 1000));
}

function s6RevealEarth() {
  if (s6EarthRevealed) return;
  s6EarthRevealed = true;
  const bubble = document.getElementById('s6-earth-bubble');
  if (bubble) bubble.classList.add('is-visible');
  setTimeout(() => {
    document.getElementById('s6-continue').disabled = false;
  }, 300);
  try { flushResumeSave(); } catch (e) {}
}

/* ── Screen 8: Astronaut on Moon ────────────────────────────────── */

let s7MoonRevealed = false;
let s7Timers = [];

function enterScreen7() {
  const bubble = document.getElementById('s7-moon-bubble');
  if (bubble) bubble.classList.toggle('is-visible', s7MoonRevealed);
  document.getElementById('s7-continue').disabled = !s7MoonRevealed;

  // Earth panel was already revealed on the previous screen — keep it fixed
  // in place and show it immediately, never re-animate it here.
  s7Timers.forEach(clearTimeout);
  s7Timers = [];
  const earthPanel = document.getElementById('s7-earth-panel');
  if (earthPanel) earthPanel.classList.add('is-visible');

  // Staged entrance for the new content only: Moon panel's label, then its
  // clickable image.
  const moonLabel = document.getElementById('s7-moon-label');
  const moonWrap  = document.getElementById('s7-moon-wrap');
  const animEls = [moonLabel, moonWrap].filter(Boolean);
  if (s7MoonRevealed) {
    animEls.forEach(el => el.classList.add('is-visible'));
    return;
  }
  animEls.forEach(el => el.classList.remove('is-visible'));
  animEls.forEach((el, i) => s7Timers.push(setTimeout(() => el.classList.add('is-visible'), i * 500)));
}

function s6RevealMoon() {
  if (s7MoonRevealed) return;
  s7MoonRevealed = true;
  const bubble = document.getElementById('s7-moon-bubble');
  if (bubble) bubble.classList.add('is-visible');
  setTimeout(() => {
    document.getElementById('s7-continue').disabled = false;
  }, 300);
  try { flushResumeSave(); } catch (e) {}
}

/* ── Screen 9: hookOpenQuestion — האסטרונאוט ───────────────────── */

let hoqSubmitted = false;

let s8Timers = [];

function enterScreen8() {
  const masaInput    = document.getElementById('s8-masa-input');
  const mishkalInput = document.getElementById('s8-mishkal-input');
  const submitBtn    = document.getElementById('s8-correct-btn');
  const continueBtn  = document.getElementById('s8-continue');

  s8Timers.forEach(clearTimeout);
  s8Timers = [];
  const animEls = ['s8-row-earth', 's8-row-moon', 's8-title', 's8-fields', 's8-correct-btn']
    .map(id => document.getElementById(id));

  if (hoqSubmitted) {
    const mb = document.getElementById('s8-masa-bubble');
    const wb = document.getElementById('s8-mishkal-bubble');
    if (mb) mb.classList.add('is-visible');
    if (wb) wb.classList.add('is-visible');
    continueBtn.disabled = false;
    submitBtn.disabled = true;
    if (masaInput) masaInput.disabled = true;
    if (mishkalInput) mishkalInput.disabled = true;
    animEls.forEach(el => el && el.classList.add('is-visible'));
    return;
  }

  const mb = document.getElementById('s8-masa-bubble');
  const wb = document.getElementById('s8-mishkal-bubble');
  if (mb) mb.classList.remove('is-visible');
  if (wb) wb.classList.remove('is-visible');
  continueBtn.disabled = true;
  const valid = hoqIsValid(masaInput ? masaInput.value : '') && hoqIsValid(mishkalInput ? mishkalInput.value : '');
  submitBtn.disabled = !valid;

  // Staged entrance: astronaut images/chips → central question → fields/button.
  animEls.forEach(el => el && el.classList.remove('is-visible'));
  const delays = [0, 1000, 2000, 3000, 3000];
  delays.forEach((delay, i) => {
    s8Timers.push(setTimeout(() => { if (animEls[i]) animEls[i].classList.add('is-visible'); }, delay));
  });
}

function hoqIsValid(text) {
  return text.trim().length > 0;
}

function hoqInput() {
  const masa    = document.getElementById('s8-masa-input');
  const mishkal = document.getElementById('s8-mishkal-input');
  const valid   = hoqIsValid(masa ? masa.value : '') && hoqIsValid(mishkal ? mishkal.value : '');
  document.getElementById('s8-correct-btn').disabled = !valid;
}

function hoqSubmit() {
  if (hoqSubmitted) return;
  hoqSubmitted = true;
  /* xAPI: no 'answered' — item 003 q1 is ungraded (questionType "other", no answers/correctAnswers),
     and the spec's answered is an evaluable response (v2.7 p24). D-9 exception, docs/REPORT-XAPI.md. */
  try { flushResumeSave(); } catch (e) {}

  document.getElementById('s8-correct-btn').disabled = true;
  document.getElementById('s8-masa-input').disabled = true;
  document.getElementById('s8-mishkal-input').disabled = true;

  const masaBubble = document.getElementById('s8-masa-bubble');
  const mishkalBubble = document.getElementById('s8-mishkal-bubble');
  if (masaBubble) masaBubble.classList.add('is-visible');
  if (mishkalBubble) mishkalBubble.classList.add('is-visible');

  setTimeout(() => {
    document.getElementById('s8-continue').disabled = false;
  }, 200);
}

/* ── Screen 10: Knowledge Summary ──────────────────────────────── */

let s9Timers = [];

function enterScreen9() {
  s9Timers.forEach(clearTimeout);
  s9Timers = [];

  const animEls = [
    document.getElementById('s9-lamp'),
    document.getElementById('s9-title'),
    document.getElementById('s9-card-masa'),
    document.getElementById('s9-card-mishkal'),
  ];
  const continueBtn = document.getElementById('s9-continue');

  // Reset to hidden
  animEls.forEach(el => el && el.classList.remove('is-visible'));
  continueBtn.disabled = true;

  // Staggered reveal: 0ms, 1000ms, 2000ms, 3000ms
  [0, 1000, 2000, 3000].forEach((delay, i) => {
    const t = setTimeout(() => {
      if (animEls[i]) animEls[i].classList.add('is-visible');
    }, delay);
    s9Timers.push(t);
  });

  // Enable continue after last card finishes animating
  const t = setTimeout(() => {
    continueBtn.disabled = false;
  }, 3600);
  s9Timers.push(t);
}

/* ── Screen 10: Carousel — 2 Types of Scales ───────────────────── */

let carouselIndex    = 0;  // 0 = מאזני כפות, 1 = מאזניים דיגיטליים
let carouselSeenSecond = false;

const CAROUSEL_CARDS = [
  {
    title: 'ميزان الكفّتين',
    img:   'assets/img/cup_scales-opt.png',
    paragraphs: [
      'يُستخدم <strong>لقياس الكتل والمقارنة بين كتلتين‎.</strong>',
      'نضع في إحدى الكفتين الجسم الذي نريد قياسه، وفي الكفة الأخرى ثِقْلًا له كتلة معروفة. عندما تتوازن الكفتان، يمكن القول إن كتلة الجسم مساوية لكتلة الثِقَل‎.',
      'بما أن قوة الجاذبية تؤثر بنفس المقدار على الكفتين، فإن النتيجة في هذا النوع من الموازين <strong>لن تتأثر من قوة الجاذبية</strong><br>، وستكون متساوية على أي جرم سماوي.',
    ],
  },
  {
    title: 'الميزان الرقمي',
    img:   'assets/img/digital-scale-opt.png',
    paragraphs: [
      'يعمل من خلال تشغيل قوة على نابض، وتتم معايرته وفق وحدات قياس الكتلة‎.',
      'في هذا النوع من الموازين، النتيجة <strong>تتأثر من قوة الجاذبية،</strong> ولذلك لا يمكن استخدامه في مكان تختلف فيه قوة الجاذبية عن الكرة الأرضية‎.',
    ],
  },
];

let s10cTimers = [];
function enterScreen10() {
  carouselIndex = 0;
  renderCarousel();
  const btn = document.getElementById('s10-continue');
  if (btn) btn.disabled = !carouselSeenSecond;

  // Gentle staged entrance — title, then the card/arrows, then the dots.
  s10cTimers.forEach(clearTimeout);
  s10cTimers = [];
  const els = ['s10c-title', 's10c-card-wrap', 's10c-dots'].map(id => document.getElementById(id));
  els.forEach(el => el && el.classList.remove('is-visible'));
  const delays = [0, 1000, 2000];
  delays.forEach((delay, i) => {
    s10cTimers.push(setTimeout(() => { if (els[i]) els[i].classList.add('is-visible'); }, delay));
  });
}

function renderCarousel() {
  const card  = CAROUSEL_CARDS[carouselIndex];
  const img   = document.getElementById('s10-card-img');
  const title = document.getElementById('s10-card-title');
  const text  = document.getElementById('s10-card-text');
  const dots  = document.querySelectorAll('.s10c-dot');
  const btnL  = document.getElementById('s10-btn-left');
  const btnR  = document.getElementById('s10-btn-right');

  if (img)   img.src         = card.img;
  if (title) title.textContent = card.title;
  if (text)  text.innerHTML    = card.paragraphs.map(p => '<p>' + p + '</p>').join('');

  dots.forEach((d, i) => d.classList.toggle('active', i === carouselIndex));

  // RTL carousel: left (‹) = forward/next (disabled on last card), right (›) = back/previous (disabled on first card)
  if (btnL) btnL.disabled = (carouselIndex === CAROUSEL_CARDS.length - 1);
  if (btnR) btnR.disabled = (carouselIndex === 0);
}

function carouselLeft() {
  if (carouselIndex < CAROUSEL_CARDS.length - 1) {
    carouselIndex++;
    if (carouselIndex === 1) carouselSeenSecond = true;
    renderCarousel();
    if (carouselSeenSecond) {
      const btn = document.getElementById('s10-continue');
      if (btn) btn.disabled = false;
    }
  }
}

function carouselRight() {
  if (carouselIndex > 0) {
    carouselIndex--;
    renderCarousel();
  }
}

/* ── Screen 11: DragAndDrop Table — Summary ────────────────────── */

const DDQ12 = {
  rows: ['التعريف', 'هل يعتمد على قوة الجاذبية؟', 'وحدات القياس'],
  cols: ['الكتلة', 'الوزن'],
  items: {
    i0: 'كمية المادة في الجسم',
    i1: 'القوة التي تشغّلها الجاذبية على الجسم',
    i2: 'لا تعتمد على قوة الجاذبية',
    i3: 'يعتمد على قوة الجاذبية',
    i4: 'ميليغرام، غرام، كيلوغرام، طن',
    i5: 'نيوتن (N)',
  },
  correct: {
    'r0-c0': 'i0',  // הגדרה / מסה
    'r0-c1': 'i1',  // הגדרה / משקל
    'r1-c0': 'i2',  // תלוי / מסה
    'r1-c1': 'i3',  // תלוי / משקל
    'r2-c0': 'i4',  // יחידות / מסה
    'r2-c1': 'i5',  // יחידות / משקל
  },
  // Only the "לא תלוי" / "כן תלוי" lead-in is bold; "בכוח הכבידה" stays regular.
  boldPrefix: { i2: 'لا تعتمد', i3: 'يعتمد' },
};

function ddq12SetItemContent(div, itemId) {
  const prefix = DDQ12.boldPrefix[itemId];
  if (prefix) {
    const rest = DDQ12.items[itemId].slice(prefix.length).trimStart();
    div.innerHTML = '<strong>' + prefix + '</strong>&nbsp;' + rest;
  } else {
    div.textContent = DDQ12.items[itemId];
  }
}

let ddq12State    = {};   // cellId → itemId
let ddq12Checked  = false;
let ddq12Done     = false;
let ddq12Dragging = null; // { itemId, fromCell: string|null }

// View My Answer Toggle (inline variant — no popup on this screen; see
// 720-templates skill → _global-components.md → "View My Answer Toggle").
let ddq12Answer = null;        // snapshot of the learner's placement, taken in
                                // ddq12ShowSolution() before it overwrote
                                // ddq12State. null = not toggleable (either
                                // the learner's placement was already fully
                                // correct, or the solution hasn't been shown).
let ddq12View   = 'solution';  // 'solution' | 'answer'

let s10ddqTimers = [];
function enterScreen11() {
  s10ddqTimers.forEach(clearTimeout);
  s10ddqTimers = [];
  const animEls = ['s10-text', 's10-table', 's10-bank-area'].map(id => document.getElementById(id)).filter(Boolean);

  if (ddq12Done) {
    // Already solved: show solution (Back-navigation always returns to the
    // solution view first, never whichever view was last open).
    ddq12View    = 'solution';
    ddq12State   = Object.assign({}, DDQ12.correct);
    ddq12Checked = true;
    ddq12RenderAllCells(true);
    document.getElementById('s10-bank').innerHTML = '';
    ddq12SetNav(3);
    ddq12RenderToggle();
    animEls.forEach(el => el.classList.add('is-visible'));
    return;
  }
  ddq12State    = {};
  ddq12Checked  = false;
  ddq12Dragging = null;
  ddq12Answer   = null;
  ddq12View     = 'solution';
  DDQ12.rows.forEach((_, ri) => DDQ12.cols.forEach((_, ci) => ddq12RenderCell('r'+ri+'-c'+ci)));
  ddq12RenderBank(true);
  ddq12SetNav(0);
  ddq12RenderToggle();

  // Staged entrance: title/subtitle -> table -> item bank (interactive area
  // builds in last, instead of the whole screen appearing at once).
  animEls.forEach(el => el.classList.remove('is-visible'));
  animEls.forEach((el, i) => s10ddqTimers.push(setTimeout(() => el.classList.add('is-visible'), i * 400)));
}

/* ─ Nav state machine ─
   0 = צדקתי? disabled  1 = צדקתי? enabled
   2 = למיון הנכון      3 = המשך               */
function ddq12SetNav(state) {
  const check    = document.getElementById('ddq12-check-btn');
  const solution = document.getElementById('ddq12-solution-btn');
  const cont     = document.getElementById('ddq12-continue');
  check.style.display    = state < 2 ? '' : 'none';
  check.disabled         = state < 1;
  solution.style.display = state === 2 ? '' : 'none';
  cont.style.display     = state === 3 ? '' : 'none';
}

/* ─ Render helpers ─ */
function ddq12RenderAll() {
  DDQ12.rows.forEach((_, ri) => DDQ12.cols.forEach((_, ci) => ddq12RenderCell('r'+ri+'-c'+ci)));
  ddq12RenderBank();
  // Gate: enable "هل إجابتي صحيحة؟" when all 8 cells are filled
  const filled = Object.keys(ddq12State).length === Object.keys(DDQ12.correct).length;
  if (!ddq12Checked) ddq12SetNav(filled ? 1 : 0);
}

function ddq12RenderCell(cellId) {
  const cell = document.getElementById('ddq12-' + cellId);
  if (!cell) return;
  const itemId = ddq12State[cellId];
  if (!itemId) {
    cell.innerHTML = '<div class="s10-drop-zone"></div>';
  } else {
    const div = document.createElement('div');
    div.className = 's10-cell-item';
    ddq12SetItemContent(div, itemId);
    if (!ddq12Checked) {
      div.dataset.item = itemId;
      ddq12MakeDraggable(div, itemId, cellId);
    }
    cell.innerHTML = '';
    cell.appendChild(div);
  }
}

function ddq12RenderAllCells(markCorrect) {
  DDQ12.rows.forEach((_, ri) => DDQ12.cols.forEach((_, ci) => {
    const cellId = 'r'+ri+'-c'+ci;
    const cell   = document.getElementById('ddq12-' + cellId);
    if (!cell) return;
    const itemId = ddq12State[cellId];
    if (!itemId) { cell.innerHTML = '<div class="s10-drop-zone"></div>'; return; }
    const div = document.createElement('div');
    div.className = 's10-cell-item' + (markCorrect ? ' is-correct' : '');
    ddq12SetItemContent(div, itemId);
    cell.innerHTML = '';
    cell.appendChild(div);
  }));
}

// animate=true only on initial screen entry (see enterScreen11()) — drag/drop
// re-renders during interaction call this with no argument so re-placed
// items never replay the entrance float (per the unit's "no re-animate on
// state change" convention).
function ddq12RenderBank(animate) {
  const placed = new Set(Object.values(ddq12State));
  const bank   = document.getElementById('s10-bank');
  bank.innerHTML = '';
  const items = Object.keys(DDQ12.items).filter(id => !placed.has(id));
  items.forEach((id, i) => {
    const div = document.createElement('div');
    div.className  = 's10-bank-item' + (animate ? ' s10-item-anim' : '');
    div.dataset.item = id;
    ddq12SetItemContent(div, id);
    ddq12MakeDraggable(div, id, null);
    bank.appendChild(div);
    if (animate) {
      s10ddqTimers.push(setTimeout(() => div.classList.add('is-visible'), 800 + i * 100));
    }
  });
}

/* ─ Drag & Drop — pointer drag (unit-js/30-pointer-drag.js) ─
   The item stays in place, dimmed, while a copy follows the pointer; the drop
   rules below are unchanged. Zones carry data-dnd-zone="r<row>-c<col>" (cells)
   or "bank" in index.html. */
function ddq12MakeDraggable(div, itemId, fromCell) {
  PointerDrag.make(div, {
    zoneSelector: '[data-screen="11"] [data-dnd-zone]',
    overClass:    'pd-over',
    enabled:      () => !ddq12Checked,
    onStart:      () => { ddq12Dragging = { itemId, fromCell }; },
    onDrop:       zone => ddq12PointerDrop(zone)
  });
}

function ddq12PointerDrop(zone) {
  const key = zone ? zone.dataset.dndZone : null;
  if (key === 'bank') ddq12PlaceToBank();
  else if (key) ddq12Place(key);
  ddq12Dragging = null;
  ddq12RenderAll();
}

function ddq12Place(toCellId) {
  if (!ddq12Dragging || ddq12Checked) return;
  const { itemId, fromCell } = ddq12Dragging;
  const existingInTarget = ddq12State[toCellId];

  if (fromCell === toCellId) return; // no-op

  // Clear source
  if (fromCell) {
    if (existingInTarget) {
      ddq12State[fromCell] = existingInTarget; // swap
    } else {
      delete ddq12State[fromCell];
    }
  } else if (existingInTarget) {
    delete ddq12State[toCellId]; // evict existing back to bank
  }

  ddq12State[toCellId] = itemId;
  ddq12Dragging = null;
  ddq12RenderAll();
}

function ddq12PlaceToBank() {
  if (!ddq12Dragging || ddq12Checked) return;
  const { fromCell } = ddq12Dragging;
  if (fromCell) delete ddq12State[fromCell];
  ddq12Dragging = null;
  ddq12RenderAll();
}

/* ─ Check & Solution ─ */
function ddq12Check() {
  if (ddq12Checked) return;
  ddq12Checked = true;

  DDQ12.rows.forEach((_, ri) => DDQ12.cols.forEach((_, ci) => {
    const cellId  = 'r'+ri+'-c'+ci;
    const cell    = document.getElementById('ddq12-' + cellId);
    const itemDiv = cell && cell.querySelector('.s10-cell-item');
    if (!itemDiv) return;
    const correct = DDQ12.correct[cellId] === ddq12State[cellId];
    itemDiv.classList.add(correct ? 'is-correct' : 'is-incorrect');
    itemDiv.classList.remove('pd-draggable');   // PointerDrag's enabled() already refuses once checked
    itemDiv.style.cursor = 'default';
  }));

  /* xAPI: item 005 q1 — one check, all cells or nothing; after the loop, when the verdict is final. */
  const _ddq12Ok = Object.keys(DDQ12.correct).every(function (k) { return DDQ12.correct[k] === ddq12State[k]; });
  /* matching: the card (source) placed in each cell; the cell is "row - column" (target) */
  xapiAnswered('007', 'q1', _ddq12Ok, true, { pairs: Object.keys(DDQ12.correct).map(function (k) {
    const rc = /^r(\d+)-c(\d+)$/.exec(k);
    return { source: DDQ12.items[ddq12State[k]] || null, target: DDQ12.rows[+rc[1]] + ' - ' + DDQ12.cols[+rc[2]] };
  }).filter(function (p) { return p.source; }) });

  ddq12SetNav(2);
  try { flushResumeSave(); } catch (e) {}
}

function ddq12ShowSolution() {
  // Snapshot the learner's own placement BEFORE it gets overwritten below —
  // this is the only point at which it still exists. Only worth keeping
  // (and only then does the toggle appear) if it wasn't already fully
  // correct; a fully-correct reveal is a no-op with nothing to toggle back to.
  const wasFullyCorrect = DDQ12.rows.every((_, ri) => DDQ12.cols.every((_, ci) => {
    const cellId = 'r' + ri + '-c' + ci;
    return ddq12State[cellId] === DDQ12.correct[cellId];
  }));
  ddq12Answer = wasFullyCorrect ? null : Object.assign({}, ddq12State);
  ddq12View   = 'solution';

  ddq12Done  = true;
  ddq12State = Object.assign({}, DDQ12.correct);
  ddq12RenderAllCells(true);
  document.getElementById('s10-bank').innerHTML = '';
  ddq12SetNav(3);
  ddq12RenderToggle();
  try { flushResumeSave(); } catch (e) {}
}

// ── View My Answer Toggle (inline variant) ──────────────────────────────
// Re-renders every cell with the correct/incorrect marks ddq12Check()
// originally showed for the learner's snapshot — never re-runs ddq12Check()
// itself, never touches ddq12Checked/ddq12Done/scoring/navigation.
function ddq12RenderAnswerCells() {
  DDQ12.rows.forEach((_, ri) => DDQ12.cols.forEach((_, ci) => {
    const cellId = 'r' + ri + '-c' + ci;
    const cell   = document.getElementById('ddq12-' + cellId);
    if (!cell) return;
    const itemId = ddq12State[cellId];
    if (!itemId) { cell.innerHTML = '<div class="s10-drop-zone"></div>'; return; }
    const div = document.createElement('div');
    div.className = 's10-cell-item ' + (DDQ12.correct[cellId] === itemId ? 'is-correct' : 'is-incorrect');
    ddq12SetItemContent(div, itemId);
    cell.innerHTML = '';
    cell.appendChild(div);
  }));
}

function ddq12ApplyView() {
  if (ddq12Answer === null) return;
  if (ddq12View === 'answer') {
    ddq12State = Object.assign({}, ddq12Answer);
    ddq12RenderAnswerCells();
  } else {
    ddq12State = Object.assign({}, DDQ12.correct);
    ddq12RenderAllCells(true);
  }
  document.getElementById('s10-bank').innerHTML = '';
  ddq12RenderToggle();
}

// Pure view switch — NEVER calls ddq12Check(), NEVER touches
// attempts/done/scoring/navigation/markQuestionResult/reporting.
function ddq12ToggleView() {
  if (ddq12Answer === null) return;
  ddq12View = (ddq12View === 'solution') ? 'answer' : 'solution';
  ddq12ApplyView();
}

function ddq12RenderToggle() {
  const btn = document.getElementById('ddq12-toggle-btn');
  if (!btn) return;
  if (ddq12Answer === null) { btn.style.display = 'none'; return; }
  btn.style.display = '';
  btn.textContent = (ddq12View === 'solution') ? 'الانتقال إلى إجابتي' : 'الإجابة الصحيحة';
}

/* ── Screen 13: TransitionScreen — חימום ─────────────────────── */
let s10Timers = [];
let s10Seen = false;

function enterScreen12() {
  s10Timers.forEach(clearTimeout); s10Timers = [];
  const els = [
    document.getElementById('s11-title'),
    document.getElementById('s11-subtitle'),
    document.getElementById('s11-char'),
  ];
  const btn = document.getElementById('s11-continue');

  if (s10Seen) {
    els.forEach(el => el && el.classList.add('is-visible'));
    btn.disabled = false;
    return;
  }
  s10Seen = true;

  els.forEach(el => el && el.classList.remove('is-visible'));
  btn.disabled = true;
  [0, 1000, 2000].forEach((delay, i) => {
    const t = setTimeout(() => { if (els[i]) els[i].classList.add('is-visible'); }, delay);
    s10Timers.push(t);
  });
  const done = setTimeout(() => { btn.disabled = false; }, 2600);
  s10Timers.push(done);
}

/* ── Screen 14: DropdownQuestion — חימום שאלה 1 ─────────────── */

const DDROP14 = {
  questionNum:    1,
  totalQuestions: 2,
  items: [
    {
      text:    'القوة التي تشغّلها الجاذبية على الجسم، وتتغير بحسب قوة الجاذبية‎.',
      correct: 'الوزن'
    },
    {
      text:    'كمية المادة في الجسم. متساوية في كل مكان، وتُقاس بالميليغرام، الغرام، الكيلوغرام والطن‎.',
      correct: 'الكتلة'
    }
  ],
  options: ['الكتلة', 'الوزن'],
  hint: 'משקל הוא הכוח שהכבידה מפעילה על גוף — הוא משתנה ממקום למקום.\nמסה היא כמות החומר בגוף — היא זהה בכל מקום.',
  feedbackCorrect: {
    title: 'ممتاز‎!',
    body:  '<strong>الوزن</strong> هو القوة التي تشغّلها الجاذبية على الجسم.<br>يتغير بحسب قوة الجاذبية.<br><br><strong>الكتلة</strong> هي كمية المادة في الجسم.<br>لا تعتمد على قوة الجاذبية، ولذلك تكون متساوية في كل مكان.<br>وتُقاس بالميليغرام، الغرام، الكيلوغرام والطن‎.'
  },
  feedbackIncorrect: {
    title: 'الإجابة غير صحيحة.',
    body:  '<strong>الوزن</strong> هو القوة التي تشغّلها الجاذبية على الجسم.<br>يتغير بحسب قوة الجاذبية.<br><br><strong>الكتلة</strong> هي كمية المادة في الجسم.<br>لا تعتمد على قوة الجاذبية، ولذلك تكون متساوية في كل مكان.<br>وتُقاس بالميليغرام، الغرام، الكيلوغرام والطن‎.'
  }
};

let ddrop14Vals    = ['', ''];
let ddrop14Done    = false;
let ddrop14Correct = false;

// View My Answer Toggle (see 720-templates skill → _global-components.md →
// "View My Answer Toggle"). Single-attempt screen: every wrong outcome is
// the terminal-wrong outcome, so any incorrect Check() is toggleable.
let ddrop14Answer = null;        // snapshot of the learner's submitted values,
                                  // taken BEFORE ddrop14Check() overwrites them
                                  // with the correct ones. null = not
                                  // toggleable (correct on the single attempt).
let ddrop14View   = 'solution';  // 'solution' | 'answer'

let ddrop14Open = -1; // index of currently open custom dropdown (-1 = none)

function ddrop14Toggle(i) {
  if (ddrop14Done) return;
  if (ddrop14Open === i) { ddrop14CloseAll(); return; }
  ddrop14CloseAll();
  ddrop14Open = i;
  document.getElementById('s12-ddl-' + i).classList.add('is-open');
  document.getElementById('s12-dd-'  + i).classList.add('is-open');
}

function ddrop14CloseAll() {
  [0, 1].forEach(i => {
    const list = document.getElementById('s12-ddl-' + i);
    const dd   = document.getElementById('s12-dd-'  + i);
    if (list) list.classList.remove('is-open');
    if (dd)   dd.classList.remove('is-open');
  });
  ddrop14Open = -1;
}

function ddrop14Select(e, i, val) {
  e.stopPropagation();
  ddrop14Vals[i] = val;
  document.getElementById('s12-ddv-' + i).textContent = val;
  ddrop14CloseAll();
  document.getElementById('s12-check-btn').disabled = !ddrop14Vals.every(v => v !== '');
}

let s12dTimers = [];
function enterScreen13() {
  ddrop14CloseAll();
  // Back-navigation onto a resolved question always shows the solution
  // view first, never whichever view the learner last had open.
  ddrop14View = 'solution';
  renderWarmupProgressIcons(document.getElementById('s13'));

  // Staged entrance — "בחרו עבור..." → "התרכזו, יש..." → each dropdown row
  // individually (interactive area builds in one-by-one, not as one block).
  s12dTimers.forEach(clearTimeout);
  s12dTimers = [];
  const leadEls = ['s12-instruction-bold', 's12-instruction-normal'].map(id => document.getElementById(id));
  const rowEls  = Array.from(document.querySelectorAll('#s12-rows .s12-row'));
  if (ddrop14Done) {
    leadEls.forEach(el => el && el.classList.add('is-visible'));
    rowEls.forEach(el => el.classList.add('is-visible'));
  } else {
    leadEls.forEach(el => el && el.classList.remove('is-visible'));
    rowEls.forEach(el => el.classList.remove('is-visible'));
    const delays = [0, 1000];
    delays.forEach((delay, i) => {
      s12dTimers.push(setTimeout(() => { if (leadEls[i]) leadEls[i].classList.add('is-visible'); }, delay));
    });
    rowEls.forEach((el, i) => {
      s12dTimers.push(setTimeout(() => el.classList.add('is-visible'), 2000 + i * 100));
    });
  }

  if (ddrop14Done) {
    // On resolved re-entry, the solution view always wins: if this outcome
    // is toggleable (ddrop14Answer !== null), force ddrop14Vals back to the
    // correct values rather than whatever was last displayed.
    if (ddrop14Answer !== null) {
      ddrop14Vals = DDROP14.items.map(item => item.correct);
    }
    ddrop14RenderDropdowns();
    ddrop14ShowFeedback(ddrop14Correct);
    document.getElementById('s12-check-btn').style.display = 'none';
    document.getElementById('s12-continue').style.display  = '';
    return;
  }

  ddrop14Vals   = ['', ''];
  ddrop14Answer = null;
  [0, 1].forEach(i => {
    document.getElementById('s12-ddv-' + i).textContent = '';
    const dd   = document.getElementById('s12-dd-'  + i);
    const list = document.getElementById('s12-ddl-' + i);
    dd.classList.remove('is-correct', 'is-incorrect', 'is-locked', 'is-open');
    list.classList.remove('is-open');
  });
  document.getElementById('s12-feedback').style.display = 'none';
  document.getElementById('s12-fb-actions').style.display = 'none';
  const checkBtn = document.getElementById('s12-check-btn');
  const contBtn  = document.getElementById('s12-continue');
  checkBtn.style.display = '';
  checkBtn.disabled      = true;
  contBtn.style.display  = 'none';
}

function ddrop14Check() {
  if (ddrop14Done) return;
  ddrop14Done = true;
  ddrop14CloseAll();

  // Snapshot the learner's submitted values BEFORE the loop below overwrites
  // any of them with the correct answer — this is the only point at which
  // the raw submission still exists (see View My Answer Toggle contract).
  const submitted = ddrop14Vals.slice();

  let allCorrect = true;
  DDROP14.items.forEach((item, i) => {
    const ok = ddrop14Vals[i] === item.correct;
    if (!ok) {
      allCorrect = false;
      ddrop14Vals[i] = item.correct;
      document.getElementById('s12-ddv-' + i).textContent = item.correct;
    }
    const dd = document.getElementById('s12-dd-' + i);
    dd.classList.add(ok ? 'is-correct' : 'is-incorrect', 'is-locked');
  });

  ddrop14Correct = allCorrect;
  /* xAPI: item 006 q1 — one check; reports what the learner submitted, not the corrected values. */
  xapiAnswered('008', 'q1', allCorrect, true, { pairs: DDROP14.items.map(function (it, i) {
    return { source: it.text, target: submitted[i] || null };
  }) });
  ddrop14Answer  = allCorrect ? null : submitted;
  markQuestionResult(1, allCorrect);
  ddrop14ShowFeedback(allCorrect);
  document.getElementById('s12-check-btn').style.display = 'none';
  document.getElementById('s12-continue').style.display  = '';
  try { flushResumeSave(); } catch (e) {}
}

// Re-renders the two dropdowns' displayed value + correct/incorrect mark
// from the current ddrop14Vals — shared by the toggle and by re-entry.
function ddrop14RenderDropdowns() {
  DDROP14.items.forEach((item, i) => {
    document.getElementById('s12-ddv-' + i).textContent = ddrop14Vals[i];
    const dd = document.getElementById('s12-dd-' + i);
    dd.classList.remove('is-correct', 'is-incorrect');
    dd.classList.add(ddrop14Vals[i] === item.correct ? 'is-correct' : 'is-incorrect', 'is-locked');
  });
}

// ── View My Answer Toggle ────────────────────────────────────────────────
function ddrop14ApplyView() {
  if (ddrop14Answer === null) return;
  ddrop14Vals = (ddrop14View === 'answer'
    ? ddrop14Answer
    : DDROP14.items.map(item => item.correct)
  ).slice();
  ddrop14RenderDropdowns();
  ddrop14ShowFeedback(ddrop14Correct);
}

// Pure view switch — NEVER calls ddrop14Check(), NEVER touches
// attempts/done/scoring/navigation/markQuestionResult/reporting.
function ddrop14ToggleView() {
  if (ddrop14Answer === null) return;
  ddrop14View = (ddrop14View === 'solution') ? 'answer' : 'solution';
  ddrop14ApplyView();
}

function ddrop14RenderAction(label) {
  const wrap = document.getElementById('s12-fb-actions');
  const btn  = document.getElementById('s12-fb-action-btn');
  if (!label) { wrap.style.display = 'none'; return; }
  btn.textContent = label;
  btn.onclick = ddrop14ToggleView;
  wrap.style.display = '';
}

function ddrop14ShowFeedback(isCorrect) {
  const fbEl    = document.getElementById('s12-feedback');
  const titleEl = document.getElementById('s12-fb-title');
  const bodyEl  = document.getElementById('s12-fb-body');
  const showToggle = !isCorrect && ddrop14Answer !== null;

  if (showToggle && ddrop14View === 'answer') {
    // Fixed canonical View My Answer copy — never this screen's own
    // pedagogical explanation body.
    fbEl.className = 'feedback is-incorrect';
    titleEl.innerHTML = 'الإجابة غير صحيحة.';
    bodyEl.innerHTML   = 'يمكن مشاهدة الحل الصحيح مرة أخرى‎.';
    ddrop14RenderAction('الإجابة الصحيحة');
    fbEl.style.display = '';
    return;
  }

  const cfg = DDROP14[isCorrect ? 'feedbackCorrect' : 'feedbackIncorrect'];
  fbEl.className = 'feedback ' + (isCorrect ? 'is-correct' : 'is-incorrect');
  // Terminal-incorrect solution view carries a fixed second bold title line,
  // appended to (never replacing) the authored title.
  titleEl.innerHTML = isCorrect ? cfg.title : (cfg.title + '<br>الإجابة الصحيحة تَظهَر الآن.');
  bodyEl.innerHTML  = cfg.body;
  ddrop14RenderAction(showToggle ? 'الانتقال إلى إجابتي' : null);
  fbEl.style.display = '';
}

/* position editor moved to index_dev.html */

/* ── Screen 15: Single Choice Question – חימום שאלה 2 ─────────────── */

const SCQ15 = {
  options: ['تصغر الكتلة', 'تكبر الكتلة', 'تبقى الكتلة كما هي', 'تصبح الكتلة صفرًا'],
  correctAnswer: 'تبقى الكتلة كما هي',
  maxAttempts: 2,
  feedbackCorrect: {
    title: 'ممتاز‎!',
    body:  'تعكس الكتلة كمية المادة الموجودة في جسم معين.\nوهي لا تعتمد على قوة الجاذبية وتبقى متساوية في كل&nbsp;مكان.'
  },
  feedbackIncorrectFirst: {
    title: 'الإجابة غير صحيحة.',
    body:  'هل نحاول مرة أخرى؟'
  },
  feedbackIncorrectFinal: {
    title: 'الإجابة غير صحيحة.',
    body:  'تعكس الكتلة كمية المادة الموجودة في جسم معين.\nوهي لا تعتمد على قوة الجاذبية وتبقى متساوية في كل&nbsp;مكان.'
  }
};

const SCQ15_SVG_CHECK = '<svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4.5L4.5 8L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SCQ15_SVG_CROSS = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L9 9M9 1L1 9" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>';

let scq15Selected = -1;   // index of currently selected option (-1 = none)
let scq15Attempts = 0;    // number of check attempts so far
let scq15Done     = false; // screen completed (no more attempts)
let scq15Correct  = false; // was final answer correct
/* Retry gate (720 spec, QA D-14): the option index submitted in the last non-final wrong attempt.
   "هل إجابتي صحيحة؟" stays disabled while that same option is selected again. */
let scq15LastWrong = -1;
let s12Timers     = [];   // entrance animation timeouts

function enterScreen14() {
  s12Timers.forEach(clearTimeout);
  s12Timers = [];
  renderWarmupProgressIcons(document.getElementById('s14'));

  document.getElementById('s13-feedback').style.display     = 'none';

  const qEl  = document.getElementById('s13-question');
  const opts = Array.from(document.querySelectorAll('#s13-options .s13-option'));

  if (scq15Done) {
    // Restore completed state immediately (no animation)
    qEl.classList.add('is-visible');
    opts.forEach(el => el.classList.add('is-visible'));
    scq15RestoreOptionStates(opts);
    document.getElementById('s13-check-btn').style.display    = 'none';
    document.getElementById('s13-continue-btn').style.display = '';
    return;
  }

  // Fresh or mid-state (after first incorrect, user returned)
  opts.forEach(el => {
    el.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    const radio = el.querySelector('.s13-radio');
    radio.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    radio.querySelector('.s13-radio-icon').innerHTML = '';
  });
  scq15Selected = -1;
  document.getElementById('s13-check-btn').style.display    = '';
  document.getElementById('s13-check-btn').disabled         = true;
  document.getElementById('s13-continue-btn').style.display = 'none';

  // Stagger entrance animation — question, then the 4 options as one distractor cluster
  const staggerDelays = [0, 1000, 1100, 1200, 1300]; // question, opt0, opt1, opt2, opt3
  qEl.classList.remove('is-visible');
  opts.forEach(el => el.classList.remove('is-visible'));
  s12Timers.push(setTimeout(() => qEl.classList.add('is-visible'), staggerDelays[0]));
  opts.forEach((el, i) => {
    s12Timers.push(setTimeout(() => el.classList.add('is-visible'), staggerDelays[i + 1]));
  });
}

function scq15RestoreOptionStates(opts) {
  const correctIdx = SCQ15.options.indexOf(SCQ15.correctAnswer);
  opts.forEach((el, i) => {
    el.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    const radio = el.querySelector('.s13-radio');
    radio.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    radio.querySelector('.s13-radio-icon').innerHTML = '';
  });
  if (scq15Correct) {
    const el = opts[scq15Selected];
    el.classList.add('is-correct');
    const radio = el.querySelector('.s13-radio');
    radio.classList.add('is-correct');
    radio.querySelector('.s13-radio-icon').innerHTML = SCQ15_SVG_CHECK;
  } else {
    const selEl = opts[scq15Selected];
    selEl.classList.add('is-incorrect');
    const selRadio = selEl.querySelector('.s13-radio');
    selRadio.classList.add('is-incorrect');
    selRadio.querySelector('.s13-radio-icon').innerHTML = SCQ15_SVG_CROSS;
    if (correctIdx >= 0 && correctIdx !== scq15Selected) {
      const corrEl = opts[correctIdx];
      corrEl.classList.add('is-correct');
      const corrRadio = corrEl.querySelector('.s13-radio');
      corrRadio.classList.add('is-correct');
      corrRadio.querySelector('.s13-radio-icon').innerHTML = SCQ15_SVG_CHECK;
    }
  }
}

function scq15Select(idx) {
  if (scq15Done) return;
  // Auto-close feedback if open (first-attempt incorrect state) so check btn is restored
  const fb = document.getElementById('s13-feedback');
  if (fb.style.display !== 'none') {
    fb.style.display = 'none';
    document.getElementById('s13-check-btn').style.display = '';
  }
  scq15Selected = idx;
  const opts = Array.from(document.querySelectorAll('#s13-options .s13-option'));
  opts.forEach((el, i) => {
    el.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    const radio = el.querySelector('.s13-radio');
    radio.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    radio.querySelector('.s13-radio-icon').innerHTML = '';
    if (i === idx) {
      el.classList.add('is-selected');
      radio.classList.add('is-selected');
    }
  });
  document.getElementById('s13-check-btn').style.display = '';
  /* Retry gate: the answer that was just marked wrong cannot be submitted again as is. */
  document.getElementById('s13-check-btn').disabled = (idx === scq15LastWrong);
}

function scq15Check() {
  if (scq15Selected < 0 || scq15Done) return;
  scq15Attempts++;
  const isCorrect = SCQ15.options[scq15Selected] === SCQ15.correctAnswer;
  xapiAnswered('009', 'q1', isCorrect, isCorrect || scq15Attempts >= SCQ15.maxAttempts,
    xapiChoiceOf('009', 'q1', SCQ15.options[scq15Selected], isCorrect));
  const opts = Array.from(document.querySelectorAll('#s13-options .s13-option'));

  if (isCorrect) {
    scq15Done    = true;
    scq15Correct = true;
    markQuestionResult(2, true);
    const el    = opts[scq15Selected];
    el.classList.remove('is-selected');
    el.classList.add('is-correct');
    const radio = el.querySelector('.s13-radio');
    radio.classList.remove('is-selected');
    radio.classList.add('is-correct');
    radio.querySelector('.s13-radio-icon').innerHTML = SCQ15_SVG_CHECK;
    scq15ShowFeedback(SCQ15.feedbackCorrect, true);
    document.getElementById('s13-check-btn').style.display    = 'none';
    document.getElementById('s13-continue-btn').style.display = '';

  } else if (scq15Attempts >= SCQ15.maxAttempts) {
    scq15Done    = true;
    scq15Correct = false;
    markQuestionResult(2, false);
    const selEl   = opts[scq15Selected];
    selEl.classList.remove('is-selected');
    selEl.classList.add('is-incorrect');
    const selRadio = selEl.querySelector('.s13-radio');
    selRadio.classList.remove('is-selected');
    selRadio.classList.add('is-incorrect');
    selRadio.querySelector('.s13-radio-icon').innerHTML = SCQ15_SVG_CROSS;
    const correctIdx = SCQ15.options.indexOf(SCQ15.correctAnswer);
    if (correctIdx >= 0 && correctIdx !== scq15Selected) {
      const corrEl = opts[correctIdx];
      corrEl.classList.add('is-correct');
      const corrRadio = corrEl.querySelector('.s13-radio');
      corrRadio.classList.add('is-correct');
      corrRadio.querySelector('.s13-radio-icon').innerHTML = SCQ15_SVG_CHECK;
    }
    scq15ShowFeedback(SCQ15.feedbackIncorrectFinal, false);
    document.getElementById('s13-check-btn').style.display    = 'none';
    document.getElementById('s13-continue-btn').style.display = '';

  } else {
    // First incorrect — mark red, show feedback, allow retry after closing
    scq15LastWrong = scq15Selected;   // Retry gate
    const selEl = opts[scq15Selected];
    selEl.classList.remove('is-selected');
    selEl.classList.add('is-incorrect');
    const selRadio = selEl.querySelector('.s13-radio');
    selRadio.classList.remove('is-selected');
    selRadio.classList.add('is-incorrect');
    selRadio.querySelector('.s13-radio-icon').innerHTML = SCQ15_SVG_CROSS;
    scq15ShowFeedback(SCQ15.feedbackIncorrectFirst, false);
    document.getElementById('s13-check-btn').disabled = true;
  }
  try { flushResumeSave(); } catch (e) {}
}

function scq15ShowFeedback(cfg, isCorrect) {
  const fb = document.getElementById('s13-feedback');
  const isRetry = cfg === SCQ15.feedbackIncorrectFirst;
  fb.className = 'feedback ' + (isCorrect ? 'is-correct' : 'is-incorrect') + (isRetry ? ' is-retry' : '');
  document.getElementById('s13-fb-title').textContent = cfg.title;
  document.getElementById('s13-fb-body').innerHTML    = cfg.body.replace(/\n/g, '<br>');
  fb.style.display = '';
}

function scq15CloseFeedback() {
  document.getElementById('s13-feedback').style.display = 'none';
  if (!scq15Done) {
    // After first incorrect: reset options, allow re-selection
    const opts = Array.from(document.querySelectorAll('#s13-options .s13-option'));
    opts.forEach(el => {
      el.classList.remove('is-selected', 'is-incorrect', 'is-correct');
      const radio = el.querySelector('.s13-radio');
      radio.classList.remove('is-selected', 'is-incorrect', 'is-correct');
      radio.querySelector('.s13-radio-icon').innerHTML = '';
    });
    scq15Selected = -1;
    document.getElementById('s13-check-btn').style.display = '';
    document.getElementById('s13-check-btn').disabled      = true;
  }
}

/* ── End screen 15 ─────────────────────────────────────────────────── */

/* ── Screen 16: TransitionScreen — הזנקה לתרגול ────────────────────── */
let s13Timers = [];
let s13Seen = false;

function enterScreen15() {
  s13Timers.forEach(clearTimeout); s13Timers = [];

  const els = [
    document.getElementById('s14-suptitle'),
    document.getElementById('s14-bigtitle'),
    document.getElementById('s14-subtitle'),
    document.getElementById('s14-char'),
  ];
  const btn = document.getElementById('s14-continue');

  if (s13Seen) {
    els.forEach(el => el && el.classList.add('is-visible'));
    btn.disabled = false;
    return;
  }
  s13Seen = true;

  els.forEach(el => el && el.classList.remove('is-visible'));
  btn.disabled = true;

  // Staggered entrance: suptitle → bigtitle → subtitle → char → button
  const delays = [0, 1000, 2000, 3000];
  delays.forEach((delay, i) => {
    s13Timers.push(setTimeout(() => {
      if (els[i]) els[i].classList.add('is-visible');
    }, delay));
  });
  s13Timers.push(setTimeout(() => { btn.disabled = false; }, 3600));
}
/* ── End screen 16 ─────────────────────────────────────────────────── */

/* ── Screen 23: TransitionScreen — תרגול בסיסי ──────────────────── */
let s20Timers = [];
let s20Seen = false;

function enterScreen22() {
  s20Timers.forEach(clearTimeout); s20Timers = [];

  const els = [
    document.getElementById('s21-suptitle'),
    document.getElementById('s21-bigtitle'),
    document.getElementById('s21-subtitle'),
    document.getElementById('s21-char'),
  ];
  const btn = document.getElementById('s24-continue');

  if (s20Seen) {
    els.forEach(el => el && el.classList.add('is-visible'));
    btn.disabled = false;
    return;
  }
  s20Seen = true;

  // Staged entrance, in order: "אין כמו תרגול" sentence → the "3 أسئلة"
  // group → the hint sentence → character last (canonical text-before-
  // character order, matching every sibling transition screen). Continue
  // only enables once the whole sequence has played.
  els.forEach(el => el && el.classList.remove('is-visible'));
  btn.disabled = true;

  const delays = [0, 900, 1800, 2700];
  delays.forEach((delay, i) => {
    s20Timers.push(setTimeout(() => {
      if (els[i]) els[i].classList.add('is-visible');
    }, delay));
  });
  s20Timers.push(setTimeout(() => { btn.disabled = false; }, 3300));
}
/* ── End screen 23 ─────────────────────────────────────────────────── */

/* ── Screen 17: Practice Q1 of 6 — Single Choice Question ──────────── */

const SCQ17 = {
  options: ['ماهر', 'دعاء'],
  correctAnswer: 'دعاء',
  maxAttempts: 1,
  feedbackCorrect: {
    title: 'ممتاز‎!',
    body: 'دعاء على صواب. الكتلة هي كمية المادة في الجسم. وهي لا تعتمد على قوة الجاذبية ولا تتغير من مكان إلى آخر.\n\nأما الوزن، فهو القوة التي تشغّلها الجاذبية على الجسم، ويتغير وفقًا لتغيُّر قوة الجاذبية. لذلك، على كوكب المشتري سيتغير وزن ماهر فقط، وليس كتلته..'
  },
  feedbackIncorrectFirst: null,
  feedbackIncorrectFinal: {
    title: 'الإجابة غير صحيحة.',
    body: 'دعاء على صواب. الكتلة هي كمية المادة في الجسم. وهي لا تعتمد على قوة الجاذبية ولا تتغير من مكان إلى آخر.\n\nأما الوزن، فهو القوة التي تشغّلها الجاذبية على الجسم، ويتغير وفقًا لتغيُّر قوة الجاذبية. لذلك، على كوكب المشتري سيتغير وزن ماهر فقط، وليس كتلته..'
  }
};

const SCQ17_SVG_CHECK = '<svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4.5L4.5 8L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SCQ17_SVG_CROSS = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L9 9M9 1L1 9" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>';

let scq17Selected    = -1;   // index of currently selected option (-1 = none)
let scq17Attempts    = 0;    // number of check attempts so far
let scq17Done        = false; // screen completed (no more attempts)
let scq17Correct     = false; // was final answer correct
let scq17HintEnabled = true;  // hint always available from the start
let s14Timers        = [];   // entrance animation timeouts

function enterScreen16() {
  s14Timers.forEach(clearTimeout);
  s14Timers = [];

  document.getElementById('s15-hint-overlay').style.display = 'none';
  document.getElementById('s15-feedback').style.display     = 'none';

  const storyFirstEl = document.getElementById('s15-story-first');
  const imageWrapEl  = document.getElementById('s15-image-wrap');
  const storyEl = document.getElementById('s15-story');
  const qEl     = document.getElementById('s15-question');
  const opts    = Array.from(document.querySelectorAll('#s15-options .s11-option'));

  if (scq17Done) {
    if (storyFirstEl) storyFirstEl.classList.add('is-visible');
    if (imageWrapEl) imageWrapEl.classList.add('is-visible');
    if (storyEl) storyEl.classList.add('is-visible');
    qEl.classList.add('is-visible');
    opts.forEach(el => el.classList.add('is-visible'));
    scq17RestoreOptionStates(opts);
    if (scq17Correct) {
      scq17ShowFeedback(SCQ17.feedbackCorrect, true);
    } else {
      scq17ShowFeedback(SCQ17.feedbackIncorrectFinal, false);
    }
    document.getElementById('s15-check-btn').style.display    = 'none';
    document.getElementById('s15-hint-btn').style.display     = 'none';
    document.getElementById('s15-continue-btn').style.display = '';
    return;
  }

  opts.forEach(el => {
    el.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    const radio = el.querySelector('.s11-radio');
    radio.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    radio.querySelector('.s11-radio-icon').innerHTML = '';
  });
  scq17Selected = -1;
  document.getElementById('s15-check-btn').style.display    = '';
  document.getElementById('s15-check-btn').disabled         = true;
  document.getElementById('s15-hint-btn').style.display     = '';
  document.getElementById('s15-hint-btn').disabled          = false;
  document.getElementById('s15-continue-btn').style.display = 'none';

  // Entrance order: blue first sentence → explanation → question → image
  // (media) → options (canonical text-before-media-before-interactive order).
  const delays = [0, 1000, 2000, 3000, 4000];
  if (storyFirstEl) storyFirstEl.classList.remove('is-visible');
  if (imageWrapEl)  imageWrapEl.classList.remove('is-visible');
  if (storyEl) { storyEl.classList.remove('is-visible'); }
  qEl.classList.remove('is-visible');
  opts.forEach(el => el.classList.remove('is-visible'));
  if (storyFirstEl) s14Timers.push(setTimeout(() => storyFirstEl.classList.add('is-visible'), delays[0]));
  if (storyEl) s14Timers.push(setTimeout(() => storyEl.classList.add('is-visible'), delays[1]));
  s14Timers.push(setTimeout(() => qEl.classList.add('is-visible'), delays[2]));
  if (imageWrapEl)  s14Timers.push(setTimeout(() => imageWrapEl.classList.add('is-visible'), delays[3]));
  opts.forEach((el, i) => {
    s14Timers.push(setTimeout(() => el.classList.add('is-visible'), delays[4] + i * 200));
  });
}

function scq17RestoreOptionStates(opts) {
  const correctIdx = SCQ17.options.indexOf(SCQ17.correctAnswer);
  opts.forEach(el => {
    el.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    const radio = el.querySelector('.s11-radio');
    radio.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    radio.querySelector('.s11-radio-icon').innerHTML = '';
  });
  if (scq17Correct) {
    const el = opts[scq17Selected];
    el.classList.add('is-correct');
    const radio = el.querySelector('.s11-radio');
    radio.classList.add('is-correct');
    radio.querySelector('.s11-radio-icon').innerHTML = SCQ17_SVG_CHECK;
  } else {
    const selEl = opts[scq17Selected];
    selEl.classList.add('is-incorrect');
    const selRadio = selEl.querySelector('.s11-radio');
    selRadio.classList.add('is-incorrect');
    selRadio.querySelector('.s11-radio-icon').innerHTML = SCQ17_SVG_CROSS;
    if (correctIdx >= 0 && correctIdx !== scq17Selected) {
      const corrEl = opts[correctIdx];
      corrEl.classList.add('is-correct');
      const corrRadio = corrEl.querySelector('.s11-radio');
      corrRadio.classList.add('is-correct');
      corrRadio.querySelector('.s11-radio-icon').innerHTML = SCQ17_SVG_CHECK;
    }
  }
}

function scq17Select(idx) {
  if (scq17Done) return;
  const fb = document.getElementById('s15-feedback');
  if (fb.style.display !== 'none') {
    fb.style.display = 'none';
    document.getElementById('s15-check-btn').style.display = '';
  }
  scq17Selected = idx;
  const opts = Array.from(document.querySelectorAll('#s15-options .s11-option'));
  opts.forEach((el, i) => {
    el.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    const radio = el.querySelector('.s11-radio');
    radio.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    radio.querySelector('.s11-radio-icon').innerHTML = '';
    if (i === idx) {
      el.classList.add('is-selected');
      radio.classList.add('is-selected');
    }
  });
  document.getElementById('s15-check-btn').style.display = '';
  document.getElementById('s15-check-btn').disabled = false;
}

function scq17Check() {
  if (scq17Selected < 0 || scq17Done) return;
  scq17Attempts++;
  const isCorrect = SCQ17.options[scq17Selected] === SCQ17.correctAnswer;
  const opts = Array.from(document.querySelectorAll('#s15-options .s11-option'));

  if (isCorrect) {
    scq17Done    = true;
    scq17Correct = true;
    window.lomdaState.standardScore++;
    const el    = opts[scq17Selected];
    el.classList.remove('is-selected');
    el.classList.add('is-correct');
    const radio = el.querySelector('.s11-radio');
    radio.classList.remove('is-selected');
    radio.classList.add('is-correct');
    radio.querySelector('.s11-radio-icon').innerHTML = SCQ17_SVG_CHECK;
    scq17ShowFeedback(SCQ17.feedbackCorrect, true);
    document.getElementById('s15-check-btn').style.display    = 'none';
    document.getElementById('s15-hint-btn').style.display     = 'none';
    document.getElementById('s15-continue-btn').style.display = '';

  } else if (scq17Attempts >= SCQ17.maxAttempts) {
    scq17Done    = true;
    scq17Correct = false;
    const selEl   = opts[scq17Selected];
    selEl.classList.remove('is-selected');
    selEl.classList.add('is-incorrect');
    const selRadio = selEl.querySelector('.s11-radio');
    selRadio.classList.remove('is-selected');
    selRadio.classList.add('is-incorrect');
    selRadio.querySelector('.s11-radio-icon').innerHTML = SCQ17_SVG_CROSS;
    const correctIdx = SCQ17.options.indexOf(SCQ17.correctAnswer);
    if (correctIdx >= 0 && correctIdx !== scq17Selected) {
      const corrEl = opts[correctIdx];
      corrEl.classList.add('is-correct');
      const corrRadio = corrEl.querySelector('.s11-radio');
      corrRadio.classList.add('is-correct');
      corrRadio.querySelector('.s11-radio-icon').innerHTML = SCQ17_SVG_CHECK;
    }
    scq17ShowFeedback(SCQ17.feedbackIncorrectFinal, false);
    document.getElementById('s15-check-btn').style.display    = 'none';
    document.getElementById('s15-hint-btn').style.display     = 'none';
    document.getElementById('s15-continue-btn').style.display = '';

  }
}

function scq17ShowFeedback(cfg, isCorrect) {
  const fb = document.getElementById('s15-feedback');
  fb.className = 's17q-feedback ' + (isCorrect ? 'is-correct' : 'is-incorrect');
  document.getElementById('s15-fb-title').textContent = cfg.title;
  document.getElementById('s15-fb-body').innerHTML    = cfg.body.replace(/\n/g, '<br>');
  fb.style.display = '';
}

function scq17CloseFeedback() {
  document.getElementById('s15-feedback').style.display = 'none';
  if (!scq17Done) {
    const opts = Array.from(document.querySelectorAll('#s15-options .s11-option'));
    opts.forEach(el => {
      el.classList.remove('is-selected', 'is-incorrect', 'is-correct');
      const radio = el.querySelector('.s11-radio');
      radio.classList.remove('is-selected', 'is-incorrect', 'is-correct');
      radio.querySelector('.s11-radio-icon').innerHTML = '';
    });
    scq17Selected = -1;
    document.getElementById('s15-check-btn').style.display = '';
    document.getElementById('s15-check-btn').disabled      = true;
  }
}

function scq17OpenHint() {
  document.getElementById('s15-hint-overlay').style.display = '';
}

function scq17CloseHint() {
  document.getElementById('s15-hint-overlay').style.display = 'none';
}
/* ── End screen 17 ─────────────────────────────────────────────────── */

/* ── Screen 18: Practice Q2 of 6 — ליאורה בחלל ─────────────────────── */

const SCQ18 = {
  options: [
    'تبقى كتلة سمر ثابتة، لكن وزنها يصبح صغيرًا جدًا‎.',
    'تصغر كتلة سمر، لأنه لا توجد قوة جاذبية‎ تقريبًا.',
    'يبقى وزن سمر ثابتًا، لأن جسمها ما زال مكوّنًا من نفس كمية المادة.',
    'كتلة سمر ووزنها أيضًا يختفيان تقريبًا.'
  ],
  correctAnswer: 'تبقى كتلة سمر ثابتة، لكن وزنها يصبح صغيرًا جدًا‎.',
  maxAttempts: 2,
  feedbackCorrect: {
    title: 'ممتاز‎!',
    body: '<strong>الكتلة</strong> هي كمية المادة الموجودة في الجسم. وهي لا تعتمد على \nقوة الجاذبية، ولذلك تبقى ثابتة حتى في الفضاء البعيد.\n\nأما <strong>الوزن</strong>، فهو القوة التي تشغّلها الجاذبية على الجسم. لذلك، في المكان الذي تكون فيه قوة الجاذبية صغيرة، يصبح الوزن أيضًا صغيرًا جدًا‎.'
  },
  feedbackIncorrectFirst: {
    title: 'الإجابة غير صحيحة.',
    body: 'هل نحاول مرة أخرى؟'
  },
  feedbackIncorrectFinal: {
    title: 'الإجابة غير صحيحة.',
    body: '<strong>الكتلة</strong> هي كمية المادة الموجودة في الجسم. وهي لا تعتمد على \nقوة الجاذبية، ولذلك تبقى ثابتة حتى في الفضاء البعيد.\n\nأما <strong>الوزن</strong>، فهو القوة التي تشغّلها الجاذبية على الجسم. لذلك، في المكان الذي تكون فيه قوة الجاذبية صغيرة، يصبح الوزن أيضًا صغيرًا جدًا‎.'
  }
};

const SCQ18_SVG_CHECK = '<svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4.5L4.5 8L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SCQ18_SVG_CROSS = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L9 9M9 1L1 9" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>';

let scq18Selected = -1, scq18Attempts = 0, scq18Done = false, scq18Correct = false, scq18HintEnabled = false;
let s15Timers = [];

function enterScreen17() {
  s15Timers.forEach(clearTimeout); s15Timers = [];
  document.getElementById('s16-hint-overlay').style.display = 'none';
  document.getElementById('s16-feedback').style.display     = 'none';
  const qEl  = document.getElementById('s16-question');
  const opts = Array.from(document.querySelectorAll('#s16-options .s11-option'));
  if (scq18Done) {
    qEl.classList.add('is-visible');
    opts.forEach(el => el.classList.add('is-visible'));
    scq18RestoreOptionStates(opts);
    document.getElementById('s16-check-btn').style.display    = 'none';
    document.getElementById('s16-hint-btn').style.display     = 'none';
    document.getElementById('s16-continue-btn').style.display = '';
    return;
  }
  opts.forEach(el => {
    el.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    const radio = el.querySelector('.s11-radio');
    radio.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    radio.querySelector('.s11-radio-icon').innerHTML = '';
  });
  scq18Selected = -1;
  document.getElementById('s16-check-btn').style.display    = '';
  document.getElementById('s16-check-btn').disabled         = true;
  document.getElementById('s16-hint-btn').style.display     = '';
  document.getElementById('s16-hint-btn').disabled          = !scq18HintEnabled;
  document.getElementById('s16-continue-btn').style.display = 'none';
  const staggerDelays = [0, 1000, 1200, 1400, 1600];
  qEl.classList.remove('is-visible');
  opts.forEach(el => el.classList.remove('is-visible'));
  s15Timers.push(setTimeout(() => qEl.classList.add('is-visible'), staggerDelays[0]));
  opts.forEach((el, i) => {
    s15Timers.push(setTimeout(() => el.classList.add('is-visible'), staggerDelays[i + 1]));
  });
}

function scq18RestoreOptionStates(opts) {
  const correctIdx = SCQ18.options.indexOf(SCQ18.correctAnswer);
  opts.forEach(el => {
    el.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    const radio = el.querySelector('.s11-radio');
    radio.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    radio.querySelector('.s11-radio-icon').innerHTML = '';
  });
  if (scq18Correct) {
    const el = opts[scq18Selected]; el.classList.add('is-correct');
    const radio = el.querySelector('.s11-radio'); radio.classList.add('is-correct');
    radio.querySelector('.s11-radio-icon').innerHTML = SCQ18_SVG_CHECK;
  } else {
    const selEl = opts[scq18Selected]; selEl.classList.add('is-incorrect');
    const selRadio = selEl.querySelector('.s11-radio'); selRadio.classList.add('is-incorrect');
    selRadio.querySelector('.s11-radio-icon').innerHTML = SCQ18_SVG_CROSS;
    if (correctIdx >= 0 && correctIdx !== scq18Selected) {
      const corrEl = opts[correctIdx]; corrEl.classList.add('is-correct');
      const corrRadio = corrEl.querySelector('.s11-radio'); corrRadio.classList.add('is-correct');
      corrRadio.querySelector('.s11-radio-icon').innerHTML = SCQ18_SVG_CHECK;
    }
  }
}

function scq18Select(idx) {
  if (scq18Done) return;
  const fb = document.getElementById('s16-feedback');
  if (fb.style.display !== 'none') { fb.style.display = 'none'; document.getElementById('s16-check-btn').style.display = ''; }
  scq18Selected = idx;
  const opts = Array.from(document.querySelectorAll('#s16-options .s11-option'));
  opts.forEach((el, i) => {
    el.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    const radio = el.querySelector('.s11-radio');
    radio.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    radio.querySelector('.s11-radio-icon').innerHTML = '';
    if (i === idx) { el.classList.add('is-selected'); radio.classList.add('is-selected'); }
  });
  document.getElementById('s16-check-btn').style.display = '';
  document.getElementById('s16-check-btn').disabled = false;
}

function scq18Check() {
  if (scq18Selected < 0 || scq18Done) return;
  scq18Attempts++;
  const isCorrect = SCQ18.options[scq18Selected] === SCQ18.correctAnswer;
  const opts = Array.from(document.querySelectorAll('#s16-options .s11-option'));
  if (isCorrect) {
    scq18Done = true; scq18Correct = true;
    window.lomdaState.standardScore++;
    const el = opts[scq18Selected]; el.classList.remove('is-selected'); el.classList.add('is-correct');
    const radio = el.querySelector('.s11-radio'); radio.classList.remove('is-selected'); radio.classList.add('is-correct');
    radio.querySelector('.s11-radio-icon').innerHTML = SCQ18_SVG_CHECK;
    scq18ShowFeedback(SCQ18.feedbackCorrect, true);
    document.getElementById('s16-check-btn').style.display    = 'none';
    document.getElementById('s16-hint-btn').style.display     = 'none';
    document.getElementById('s16-continue-btn').style.display = '';
  } else if (scq18Attempts >= SCQ18.maxAttempts) {
    scq18Done = true; scq18Correct = false;
    const selEl = opts[scq18Selected]; selEl.classList.remove('is-selected'); selEl.classList.add('is-incorrect');
    const selRadio = selEl.querySelector('.s11-radio'); selRadio.classList.remove('is-selected'); selRadio.classList.add('is-incorrect');
    selRadio.querySelector('.s11-radio-icon').innerHTML = SCQ18_SVG_CROSS;
    const correctIdx = SCQ18.options.indexOf(SCQ18.correctAnswer);
    if (correctIdx >= 0 && correctIdx !== scq18Selected) {
      const corrEl = opts[correctIdx]; corrEl.classList.add('is-correct');
      const corrRadio = corrEl.querySelector('.s11-radio'); corrRadio.classList.add('is-correct');
      corrRadio.querySelector('.s11-radio-icon').innerHTML = SCQ18_SVG_CHECK;
    }
    scq18ShowFeedback(SCQ18.feedbackIncorrectFinal, false);
    document.getElementById('s16-check-btn').style.display    = 'none';
    document.getElementById('s16-hint-btn').style.display     = 'none';
    document.getElementById('s16-continue-btn').style.display = '';
  } else {
    scq18HintEnabled = true;
    const selEl = opts[scq18Selected]; selEl.classList.remove('is-selected'); selEl.classList.add('is-incorrect');
    const selRadio = selEl.querySelector('.s11-radio'); selRadio.classList.remove('is-selected'); selRadio.classList.add('is-incorrect');
    selRadio.querySelector('.s11-radio-icon').innerHTML = SCQ18_SVG_CROSS;
    scq18ShowFeedback(SCQ18.feedbackIncorrectFirst, false);
    document.getElementById('s16-check-btn').disabled = true;
    document.getElementById('s16-hint-btn').disabled       = false;
  }
}

function scq18ShowFeedback(cfg, isCorrect) {
  const fb = document.getElementById('s16-feedback');
  fb.className = 's11-feedback ' + (isCorrect ? 'is-correct' : 'is-incorrect');
  document.getElementById('s16-fb-title').textContent = cfg.title;
  document.getElementById('s16-fb-body').innerHTML    = cfg.body.replace(/\n/g, '<br>');
  fb.style.display = '';
}

function scq18CloseFeedback() {
  document.getElementById('s16-feedback').style.display = 'none';
  if (!scq18Done) {
    const opts = Array.from(document.querySelectorAll('#s16-options .s11-option'));
    opts.forEach(el => {
      el.classList.remove('is-selected', 'is-incorrect', 'is-correct');
      const radio = el.querySelector('.s11-radio');
      radio.classList.remove('is-selected', 'is-incorrect', 'is-correct');
      radio.querySelector('.s11-radio-icon').innerHTML = '';
    });
    scq18Selected = -1;
    document.getElementById('s16-check-btn').style.display = '';
    document.getElementById('s16-check-btn').disabled      = true;
  }
}

function scq18OpenHint()  { document.getElementById('s16-hint-overlay').style.display = ''; }
function scq18CloseHint() { document.getElementById('s16-hint-overlay').style.display = 'none'; }
/* ── End screen 18 ─────────────────────────────────────────────────── */

/* ── Screen 18: Practice Q3 of 6 — אורז על מאזניים ──────────────────── */

const SCQ19 = {
  options: [
    'لن يبقى الميزان متوازنًا لأن الوزن يصغر.',
    'سيبقى الميزان متوازنًا‎.',
    'سيكون الأرزّ أثقل من الثِقَل‎.',
    'لا يمكن المعرفة.'
  ],
  correctAnswer: 'سيبقى الميزان متوازنًا‎.',
  maxAttempts: 2,
  feedbackCorrect: {
    title: 'ممتاز‎!',
    body: 'قوة الجاذبية أضعف على القمر، ولذلك يصبح الأرزّ والثِقَل أيضًا أخفّ، ولكن بنفس المقدار بالضبط.\n\nبما أن الجانبين تغيّرا بنفس النسبة، سيبقى ميزان الكفّتين متوازنًا أيضًا على القمر‎.'
  },
  feedbackIncorrectFinal: {
    title: 'الإجابة غير صحيحة. الإجابة الصحيحة مُشار إليها.',
    body: 'قوة الجاذبية أضعف على القمر، ولذلك يصبح الأرزّ والثِقَل أيضًا أخفّ، ولكن بنفس المقدار بالضبط.\n\nبما أن الجانبين تغيّرا بنفس النسبة، سيبقى ميزان الكفّتين متوازنًا أيضًا على القمر‎.'
  }
};

const SCQ19_SVG_CHECK = '<svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4.5L4.5 8L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SCQ19_SVG_CROSS = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L9 9M9 1L1 9" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>';

let scq19Selected = -1, scq19Attempts = 0, scq19Done = false, scq19Correct = false, scq19HintEnabled = false;
let s16Timers = [];

function enterScreen18() {
  s16Timers.forEach(clearTimeout); s16Timers = [];
  document.getElementById('s18-hint-overlay').style.display    = 'none';
  document.getElementById('s18-feedback').style.display        = 'none';
  document.getElementById('s18-feedback-first').style.display  = 'none';
  document.getElementById('s18-zoom-btn').style.display        = '';

  const storyFirstEl = document.getElementById('s18-story-first');
  const imageWrapEl  = document.getElementById('s18-image-wrap');
  const storyEl = document.getElementById('s18-story');
  const qEl     = document.getElementById('s18-question');
  const opts    = Array.from(document.querySelectorAll('#s18-options .s11-option'));

  if (scq19Done) {
    if (storyFirstEl) storyFirstEl.classList.add('is-visible');
    if (imageWrapEl) imageWrapEl.classList.add('is-visible');
    if (storyEl) storyEl.classList.add('is-visible');
    qEl.classList.add('is-visible');
    opts.forEach(el => el.classList.add('is-visible'));
    scq19RestoreOptionStates(opts);
    if (scq19Correct) {
      scq19ShowFeedback(SCQ19.feedbackCorrect, true);
    } else {
      scq19ShowFeedback(SCQ19.feedbackIncorrectFinal, false);
    }
    document.getElementById('s18-check-btn').style.display    = 'none';
    document.getElementById('s18-hint-btn').style.display     = 'none';
    document.getElementById('s18-continue-btn').style.display = '';
    return;
  }

  opts.forEach(el => {
    el.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    const radio = el.querySelector('.s11-radio');
    radio.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    radio.querySelector('.s11-radio-icon').innerHTML = '';
  });
  scq19Selected = -1;
  document.getElementById('s18-check-btn').style.display    = '';
  document.getElementById('s18-check-btn').disabled         = true;
  document.getElementById('s18-hint-btn').style.display     = '';
  document.getElementById('s18-hint-btn').disabled          = !scq19HintEnabled;
  document.getElementById('s18-continue-btn').style.display = 'none';

  // Entrance order: blue first sentence → explanation → question → image
  // (media) → options (canonical text-before-media-before-interactive order).
  const delays = [0, 1000, 2000, 3000, 4000];
  if (storyFirstEl) storyFirstEl.classList.remove('is-visible');
  if (imageWrapEl)  imageWrapEl.classList.remove('is-visible');
  if (storyEl) storyEl.classList.remove('is-visible');
  qEl.classList.remove('is-visible');
  opts.forEach(el => el.classList.remove('is-visible'));
  if (storyFirstEl) s16Timers.push(setTimeout(() => storyFirstEl.classList.add('is-visible'), delays[0]));
  if (storyEl) s16Timers.push(setTimeout(() => storyEl.classList.add('is-visible'), delays[1]));
  s16Timers.push(setTimeout(() => qEl.classList.add('is-visible'), delays[2]));
  if (imageWrapEl)  s16Timers.push(setTimeout(() => imageWrapEl.classList.add('is-visible'), delays[3]));
  opts.forEach((el, i) => {
    s16Timers.push(setTimeout(() => el.classList.add('is-visible'), delays[4] + i * 200));
  });
}

function scq19RestoreOptionStates(opts) {
  const correctIdx = SCQ19.options.indexOf(SCQ19.correctAnswer);
  opts.forEach(el => {
    el.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    const radio = el.querySelector('.s11-radio');
    radio.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    radio.querySelector('.s11-radio-icon').innerHTML = '';
  });
  if (scq19Correct) {
    const el = opts[scq19Selected]; el.classList.add('is-correct');
    const radio = el.querySelector('.s11-radio'); radio.classList.add('is-correct');
    radio.querySelector('.s11-radio-icon').innerHTML = SCQ19_SVG_CHECK;
  } else {
    const selEl = opts[scq19Selected]; selEl.classList.add('is-incorrect');
    const selRadio = selEl.querySelector('.s11-radio'); selRadio.classList.add('is-incorrect');
    selRadio.querySelector('.s11-radio-icon').innerHTML = SCQ19_SVG_CROSS;
    if (correctIdx >= 0 && correctIdx !== scq19Selected) {
      const corrEl = opts[correctIdx]; corrEl.classList.add('is-correct');
      const corrRadio = corrEl.querySelector('.s11-radio'); corrRadio.classList.add('is-correct');
      corrRadio.querySelector('.s11-radio-icon').innerHTML = SCQ19_SVG_CHECK;
    }
  }
}

function scq19Select(idx) {
  if (scq19Done) return;
  scq19Selected = idx;
  const opts = Array.from(document.querySelectorAll('#s18-options .s11-option'));
  opts.forEach((el, i) => {
    el.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    const radio = el.querySelector('.s11-radio');
    radio.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    radio.querySelector('.s11-radio-icon').innerHTML = '';
    if (i === idx) { el.classList.add('is-selected'); radio.classList.add('is-selected'); }
  });
  document.getElementById('s18-check-btn').style.display = '';
  document.getElementById('s18-check-btn').disabled = false;
}

function scq19Check() {
  if (scq19Selected < 0 || scq19Done) return;
  scq19Attempts++;
  const isCorrect = SCQ19.options[scq19Selected] === SCQ19.correctAnswer;
  const opts = Array.from(document.querySelectorAll('#s18-options .s11-option'));
  if (isCorrect) {
    scq19Done = true; scq19Correct = true;
    window.lomdaState.standardScore++;
    const el = opts[scq19Selected]; el.classList.remove('is-selected'); el.classList.add('is-correct');
    const radio = el.querySelector('.s11-radio'); radio.classList.remove('is-selected'); radio.classList.add('is-correct');
    radio.querySelector('.s11-radio-icon').innerHTML = SCQ19_SVG_CHECK;
    scq19ShowFeedback(SCQ19.feedbackCorrect, true);
    document.getElementById('s18-check-btn').style.display    = 'none';
    document.getElementById('s18-hint-btn').style.display     = 'none';
    document.getElementById('s18-continue-btn').style.display = '';
  } else if (scq19Attempts >= SCQ19.maxAttempts) {
    scq19Done = true; scq19Correct = false;
    const selEl = opts[scq19Selected]; selEl.classList.remove('is-selected'); selEl.classList.add('is-incorrect');
    const selRadio = selEl.querySelector('.s11-radio'); selRadio.classList.remove('is-selected'); selRadio.classList.add('is-incorrect');
    selRadio.querySelector('.s11-radio-icon').innerHTML = SCQ19_SVG_CROSS;
    const correctIdx = SCQ19.options.indexOf(SCQ19.correctAnswer);
    if (correctIdx >= 0 && correctIdx !== scq19Selected) {
      const corrEl = opts[correctIdx]; corrEl.classList.add('is-correct');
      const corrRadio = corrEl.querySelector('.s11-radio'); corrRadio.classList.add('is-correct');
      corrRadio.querySelector('.s11-radio-icon').innerHTML = SCQ19_SVG_CHECK;
    }
    scq19ShowFeedback(SCQ19.feedbackIncorrectFinal, false);
    document.getElementById('s18-check-btn').style.display    = 'none';
    document.getElementById('s18-hint-btn').style.display     = 'none';
    document.getElementById('s18-continue-btn').style.display = '';
  } else {
    /* first wrong attempt — show dismissible overlay, enable hint, clear option state */
    scq19HintEnabled = true;
    const selEl = opts[scq19Selected]; selEl.classList.remove('is-selected');
    const selRadio = selEl.querySelector('.s11-radio'); selRadio.classList.remove('is-selected');
    selRadio.querySelector('.s11-radio-icon').innerHTML = '';
    selEl.classList.remove('is-selected');
    scq19Selected = -1;
    document.getElementById('s18-feedback-first').style.display = '';
    document.getElementById('s18-zoom-btn').style.display       = 'none';
    document.getElementById('s18-check-btn').disabled           = true;
    document.getElementById('s18-hint-btn').disabled            = false;
  }
}

function scq19ShowFeedback(cfg, isCorrect) {
  const fb = document.getElementById('s18-feedback');
  fb.className = 's18q-feedback ' + (isCorrect ? 'is-correct' : 'is-incorrect');
  document.getElementById('s18-fb-title').textContent = cfg.title;
  document.getElementById('s18-fb-body').innerHTML    = cfg.body.replace(/\n/g, '<br>');
  fb.style.display = '';
  document.getElementById('s18-zoom-btn').style.display = 'none';
}

function scq19CloseFeedback() {
  document.getElementById('s18-feedback').style.display = 'none';
  document.getElementById('s18-zoom-btn').style.display = '';
}

function scq19DismissFirst() {
  document.getElementById('s18-feedback-first').style.display = 'none';
  document.getElementById('s18-zoom-btn').style.display       = '';
  document.getElementById('s18-check-btn').style.display      = '';
  document.getElementById('s18-check-btn').disabled           = true;
}

function scq19OpenHint()  { document.getElementById('s18-hint-overlay').style.display = ''; }
function scq19CloseHint() { document.getElementById('s18-hint-overlay').style.display = 'none'; }
/* ── End screen 18 ─────────────────────────────────────────────────── */

/* ── Screen 19: Practice Q4 — DropdownQuestion (vocabulary) ─────────── */

const DQ19_ITEMS = [
  { id: 'kavad',   label: 'כבד',       correct: 'יומיומית' },
  { id: 'shokeil', label: 'שוקל',      correct: 'יומיומית' },
  { id: 'kal',     label: 'קל',        correct: 'יומיומית' },
  { id: 'newton',  label: 'ניוטון',    correct: 'מדעית'    },
  { id: 'kochkv',  label: 'כוח כבידה', correct: 'מדעית'    },
  { id: 'masa',    label: 'الكتلة',       correct: 'מדעית'    },
  { id: 'mishkal', label: 'الوزن',      correct: 'كلتاهما معًا'   },
];

const DQ19_FB_CORRECT_TITLE = 'ممتاز‎!';
const DQ19_FB_CORRECT_BODY  =
  '<ul dir="rtl" style="margin:0;padding-right:20px;line-height:1.6">' +
  '<li><strong>"כבד", "שוקל", "קל":</strong> מילים שמתארות תחושה, ולכן הן מילים בשפת היומיום.</li>' +
  '<li><strong>"ניוטון", "الكتلة", "כוח כבידה":</strong> מושגים שיש להם הגדרה מדעית ברורה, ולכן הן מילים בשפה מדעית.</li>' +
  '<li><strong>"الوزن":</strong> שייך לשתי הקטגוריות. מילה שמשתמשים בה גם בשפה יומיומית, וגם יש לה הגדרה מדעית מדויקת.</li>' +
  '</ul>';
const DQ19_FB_WRONG_TITLE   = 'الإجابة غير صحيحة.';
const DQ19_FB_WRONG_BODY    = DQ19_FB_CORRECT_BODY;

let dq19Attempts = 0, dq19Done = false, dq19Correct = false, dq19HintEnabled = false;

function dq19GetDD(id)  { return document.getElementById('dd19-' + id); }
function dq19GetVal(id) { const d = dq19GetDD(id); return d ? (d.dataset.value || '') : ''; }

function dq19CloseAll() {
  DQ19_ITEMS.forEach(item => {
    const d = dq19GetDD(item.id);
    if (!d) return;
    d.classList.remove('is-open');
    const p = document.getElementById('dd19-' + item.id + '-panel');
    if (p) p.style.display = 'none';
  });
}

function dq19Toggle(id) {
  const dd = dq19GetDD(id);
  if (!dd || dd.classList.contains('is-done')) return;
  const wasOpen = dd.classList.contains('is-open');
  dq19CloseAll();
  if (!wasOpen) {
    dd.classList.add('is-open');
    const panel = document.getElementById('dd19-' + id + '-panel');
    if (panel) {
      const headVal = panel.querySelector('.s17-dd-val');
      if (headVal) headVal.textContent = dd.dataset.value || '';
      panel.style.display = 'flex';
    }
  }
}

function dq19Pick(id, value) {
  const dd = dq19GetDD(id);
  if (!dd) return;
  dd.dataset.value = value;
  const trigVal = document.getElementById('dd19-' + id + '-val');
  if (trigVal) trigVal.textContent = value;
  dd.classList.remove('is-open');
  const panel = document.getElementById('dd19-' + id + '-panel');
  if (panel) panel.style.display = 'none';
  /* auto-dismiss first-wrong card on any answer change */
  const fbFirst = document.getElementById('s19q-fb-first');
  if (fbFirst && fbFirst.style.display !== 'none') {
    fbFirst.style.display = 'none';
  }
  dq19UpdateCheck();
}

function dq19UpdateCheck() {
  const allFilled = DQ19_ITEMS.every(item => dq19GetVal(item.id) !== '');
  const btn = document.getElementById('s19q-check');
  if (!btn) return;
  btn.disabled = !allFilled;
}

let s19Timers = [];
function enterScreen19() {
  document.getElementById('s19q-fb-first').style.display    = 'none';
  document.getElementById('s19q-fb').style.display          = 'none';
  document.getElementById('s19q-hint-overlay').style.display = 'none';

  DQ19_ITEMS.forEach(item => {
    const dd = dq19GetDD(item.id);
    if (!dd) return;
    dd.classList.remove('is-correct', 'is-incorrect', 'is-open', 'is-done');
    const panel = document.getElementById('dd19-' + item.id + '-panel');
    if (panel) panel.style.display = 'none';
    const trigVal = document.getElementById('dd19-' + item.id + '-val');
    if (dq19Done) {
      dd.dataset.value = item.correct;
      if (trigVal) trigVal.textContent = item.correct;
      dd.classList.add('is-correct', 'is-done');
    } else {
      dd.dataset.value = '';
      if (trigVal) trigVal.textContent = '';
    }
  });

  document.getElementById('s19q-check').style.display       = '';
  document.getElementById('s19q-check').disabled            = true;
  document.getElementById('s19q-hint-overlay').style.display = 'none';
  document.getElementById('s19q-hint-btn').style.display    = '';
  document.getElementById('s19q-hint-btn').disabled        = !dq19HintEnabled;
  document.getElementById('s19q-continue').style.display = 'none';

  // Staged entrance — bold question first, then each fill-in row
  // individually (interactive area builds in one-by-one, not as one block).
  s19Timers.forEach(clearTimeout);
  s19Timers = [];
  const s19qQuestionEl = document.getElementById('s19q-question');
  const s19qRowEls     = Array.from(document.querySelectorAll('#s19q-rows .s17-cell'));
  if (dq19Done) {
    if (s19qQuestionEl) s19qQuestionEl.classList.add('is-visible');
    s19qRowEls.forEach(el => el.classList.add('is-visible'));
    document.getElementById('s19q-check').style.display    = 'none';
    document.getElementById('s19q-hint-btn').style.display   = 'none';
    document.getElementById('s19q-continue').style.display = '';
    dq19ShowFeedback(dq19Correct);
    return;
  }
  if (s19qQuestionEl) s19qQuestionEl.classList.remove('is-visible');
  s19qRowEls.forEach(el => el.classList.remove('is-visible'));
  if (s19qQuestionEl) s19Timers.push(setTimeout(() => s19qQuestionEl.classList.add('is-visible'), 0));
  s19qRowEls.forEach((el, i) => {
    s19Timers.push(setTimeout(() => el.classList.add('is-visible'), 1000 + i * 200));
  });
  if (!dq19Done) dq19UpdateCheck();
}

function dq19Check() {
  if (dq19Done) return;
  dq19CloseAll();
  dq19Attempts++;

  let allCorrect = true;
  DQ19_ITEMS.forEach(item => {
    const dd = dq19GetDD(item.id);
    if (!dd) return;
    const isCorrect = dq19GetVal(item.id) === item.correct;
    dd.classList.remove('is-correct', 'is-incorrect');
    if (isCorrect) {
      dd.classList.add('is-correct', 'is-done');
    } else {
      dd.classList.add('is-incorrect');
      allCorrect = false;
    }
  });

  if (allCorrect) {
    dq19Done = true; dq19Correct = true;
    window.lomdaState.standardScore++;
    DQ19_ITEMS.forEach(item => { const d = dq19GetDD(item.id); if (d) d.classList.add('is-done'); });
    dq19ShowFeedback(true);
    document.getElementById('s19q-check').style.display    = 'none';
    document.getElementById('s19q-hint-btn').style.display   = 'none';
    document.getElementById('s19q-continue').style.display = '';
  } else if (dq19Attempts >= 2) {
    dq19Done = true; dq19Correct = false;
    DQ19_ITEMS.forEach(item => {
      const dd = dq19GetDD(item.id);
      if (!dd) return;
      dd.dataset.value = item.correct;
      const tv = document.getElementById('dd19-' + item.id + '-val');
      if (tv) tv.textContent = item.correct;
      dd.classList.remove('is-incorrect');
      dd.classList.add('is-correct', 'is-done');
    });
    dq19ShowFeedback(false);
    document.getElementById('s19q-check').style.display      = 'none';
    document.getElementById('s19q-hint-btn').style.display   = 'none';
    document.getElementById('s19q-continue').style.display   = '';
  } else {
    /* First wrong: lock correct, reset wrong, enable hint, show dismissible card */
    dq19HintEnabled = true;
    DQ19_ITEMS.forEach(item => {
      const dd = dq19GetDD(item.id);
      if (!dd || dd.classList.contains('is-done')) return;
      dd.dataset.value = '';
      const tv = document.getElementById('dd19-' + item.id + '-val');
      if (tv) tv.textContent = '';
      dd.classList.remove('is-incorrect');
    });
    document.getElementById('s19q-fb-first').style.display = '';
    document.getElementById('s19q-check').disabled    = true;
    document.getElementById('s19q-hint-btn').disabled        = false;
  }
}

function dq19ShowFeedback(isCorrect) {
  const fb = document.getElementById('s19q-fb');
  fb.className = 's19q-fb ' + (isCorrect ? 'is-correct' : 'is-incorrect');
  document.getElementById('s19q-fb-title').textContent  = isCorrect ? DQ19_FB_CORRECT_TITLE : DQ19_FB_WRONG_TITLE;
  document.getElementById('s19q-fb-body').innerHTML     = isCorrect ? DQ19_FB_CORRECT_BODY  : DQ19_FB_WRONG_BODY;
  fb.style.display = '';
}

function dq19DismissFirst() {
  document.getElementById('s19q-fb-first').style.display = 'none';
  dq19UpdateCheck(); /* shows check btn only if all items now filled */
}

function dq19DismissFeedback() {
  document.getElementById('s19q-fb').style.display = 'none';
  if (dq19Done) {
    document.getElementById('s19q-continue').style.display = '';
  }
}

function dq19OpenHint()  { document.getElementById('s19q-hint-overlay').style.display = ''; }
function dq19CloseHint() { document.getElementById('s19q-hint-overlay').style.display = 'none'; }
/* ── End screen 19 ─────────────────────────────────────────────────── */

/* ── Screen 20: Practice Q5 — DropdownQuestion + Video ──────────────── */

const DQ20_ITEMS = [
  { id: 'alef',   correct: 'تفسير علمي' },
  { id: 'bet',    correct: 'مشاهدة'     },
  { id: 'gimel',  correct: 'تفسير علمي' },
  { id: 'dalet',  correct: 'تفسير علمي' },
];

const DQ20_FB_CORRECT = {
  title: 'ممتاز‎!',
  body:  '<strong>مشاهدة</strong> היא מה שניתן לראות בפועל, ללא פרשנות או הסבר.<br><strong>تفسير علمي</strong>, הוא פרשנות הנובעת מתוך תצפית או מתוך תוצאה של ניסוי, ולא תמיד ניתנת לצפייה ישירה.',
  ok: true,
};
const DQ20_FB_WRONG = {
  title: 'الإجابة غير صحيحة.',
  body:  '<strong>مشاهدة</strong> היא מה שניתן לראות בפועל, ללא פרשנות או הסבר.<br><strong>تفسير علمي</strong>, הוא פרשנות הנובעת מתוך תצפית או מתוך תוצאה של ניסוי, ולא תמיד ניתנת לצפייה ישירה.',
  ok: false,
};

var dq20Done = false;
var s20YTPlayer = null;
var s20LoopTimer = null;
const S20_YT_START = 107;
const S20_YT_END   = 113;

/* YouTube calls onYouTubeIframeAPIReady once, when www-widgetapi.js runs. That script is
   async and can beat this file (warm cache), so the callback alone may never fire: no
   player, no played/paused (MOE QA 01-01). ytInitPlayers() runs from whichever comes
   last — the callback, or the YT.loaded check right after it — and only once. Part 01
   owns only #s4-video; the s20 player belongs to part 02. */
let ytPlayersInited = false;
function onYouTubeIframeAPIReady() { ytInitPlayers(); }

function ytInitPlayers() {
  if (ytPlayersInited || !window.YT || typeof YT.Player !== 'function') return;
  if (!document.getElementById('s4-video')) return;
  ytPlayersInited = true;
  s4YTPlayer = new YT.Player('s4-video', {
    events: {
      onReady: function() {
        s4YTReady = true;
        if (s4FallbackTimer) { clearTimeout(s4FallbackTimer); s4FallbackTimer = null; }
        if (s4PendingPlay) { s4PendingPlay = false; s4PlayVideo(); }
        s4StartWatchPoll();
      },
      onStateChange: function(e) {
        try { xapiYouTubeState(e, '003'); } catch (err) {}   // xAPI played/paused, item 003 (video path)
        if (e.data === YT.PlayerState.ENDED) s4MarkWatched();
      }
    }
  });
}
if (window.YT && YT.loaded) ytInitPlayers();   // the API won the race — its callback already ran

function s20StartLoop() {
  if (s20LoopTimer) clearInterval(s20LoopTimer);
  s20LoopTimer = setInterval(function() {
    if (!s20YTPlayer || typeof s20YTPlayer.getCurrentTime !== 'function') return;
    var t = s20YTPlayer.getCurrentTime();
    if (t >= S20_YT_END || t < S20_YT_START - 2) {
      s20YTPlayer.seekTo(S20_YT_START, true);
    }
  }, 500);
}

function s20StopLoop() {
  if (s20LoopTimer) { clearInterval(s20LoopTimer); s20LoopTimer = null; }
}

function dq20GetDD(id)  { return document.getElementById('s20dd-' + id); }
function dq20GetVal(id) { var d = dq20GetDD(id); return d ? (d.dataset.value || '') : ''; }

function dq20CloseAll() {
  document.querySelectorAll('[data-screen="20"] .s17-dd.is-open').forEach(function(d) {
    d.classList.remove('is-open');
    d.querySelector('.s17-dd-panel').style.display = 'none';
  });
}

function dq20Toggle(id) {
  var dd = dq20GetDD(id);
  if (!dd || dd.classList.contains('is-done')) return;
  var wasOpen = dd.classList.contains('is-open');
  dq20CloseAll();
  if (!wasOpen) {
    dd.classList.add('is-open');
    var panel = dd.querySelector('.s17-dd-panel');
    var headVal = panel.querySelector('.s17-dd-panel-head .s17-dd-val');
    if (headVal) headVal.textContent = dd.dataset.value || '';
    panel.style.display = 'flex';
  }
}

function dq20Pick(id, value) {
  var dd = dq20GetDD(id);
  if (!dd) return;
  dd.dataset.value = value;
  var trigVal = dd.querySelector('.s17-dd-trigger .s17-dd-val');
  if (trigVal) trigVal.textContent = value;
  dd.classList.remove('is-open');
  dd.querySelector('.s17-dd-panel').style.display = 'none';
  dq20UpdateCheck();
}

function dq20UpdateCheck() {
  var allFilled = DQ20_ITEMS.every(function(item) { return dq20GetVal(item.id) !== ''; });
  document.getElementById('s20q-check-btn').disabled = !allFilled;
}

function dq20Check() {
  if (dq20Done) return;
  dq20CloseAll();
  dq20Done = true;

  var allCorrect = true;
  DQ20_ITEMS.forEach(function(item) {
    var dd = dq20GetDD(item.id);
    if (!dd) return;
    var ok = dq20GetVal(item.id) === item.correct;
    dd.classList.remove('is-correct', 'is-incorrect');
    if (ok) {
      dd.classList.add('is-correct', 'is-done');
    } else {
      // Show correct answer
      dd.dataset.value = item.correct;
      var tv = dd.querySelector('.s17-dd-trigger .s17-dd-val');
      if (tv) tv.textContent = item.correct;
      dd.classList.add('is-incorrect', 'is-done');
      allCorrect = false;
    }
  });

  if (allCorrect) window.lomdaState.standardScore++;
  var cfg = allCorrect ? DQ20_FB_CORRECT : DQ20_FB_WRONG;
  dq20ShowFeedback(cfg);
  document.getElementById('s20q-check-btn').style.display    = 'none';
  document.getElementById('s20q-continue-btn').style.display = '';
  s20StopLoop();
}

function dq20ShowFeedback(cfg) {
  var vw = document.getElementById('s20-video-wrap');
  var fb = document.getElementById('s20q-feedback');
  if (vw) vw.style.display = 'none';
  fb.className = 's20-fb-panel ' + (cfg.ok ? 'is-correct' : 'is-incorrect');
  document.getElementById('s20q-fb-title').textContent = cfg.title;
  document.getElementById('s20q-fb-body').innerHTML    = cfg.body;
  fb.style.display = '';
}

var dq20TipTimer = null;
var dq20TipsInited = false;

function dq20InitTips() {
  if (dq20TipsInited) return;
  dq20TipsInited = true;

  ['tzfiya', 'hasbar'].forEach(function(which) {
    var btn = document.getElementById('s20-btn-' + which);
    var tip = document.getElementById('s20-tip-' + which);
    if (!btn || !tip) return;

    function positionAndShow() {
      // Close the other tip
      var other = which === 'tzfiya' ? 'hasbar' : 'tzfiya';
      var otherTip = document.getElementById('s20-tip-' + other);
      if (otherTip) otherTip.style.display = 'none';

      // Measure while hidden to get height
      tip.style.visibility = 'hidden';
      tip.style.display = 'block';
      var tipH = tip.offsetHeight;
      var tipW = tip.offsetWidth;

      var appEl = document.getElementById('app');
      var rect = btn.getBoundingClientRect();
      var appRect = appEl.getBoundingClientRect();
      var scale = parseFloat(appEl.style.transform.replace(/[^0-9.]/g,'')) || 1;

      var appX = (rect.left - appRect.left) / scale;
      var appY = (rect.top  - appRect.top)  / scale;

      // Place tooltip to the LEFT of the button; right edge at button centre
      var btnH = 16;
      tip.style.left  = (appX + 8 - tipW) + 'px';
      tip.style.top   = (appY + (btnH - tipH) / 2) + 'px';
      tip.style.right = '';
      tip.style.visibility = '';
    }

    function hideTip() {
      tip.style.display = 'none';
    }

    btn.addEventListener('mouseenter', function() {
      clearTimeout(dq20TipTimer);
      positionAndShow();
    });
    btn.addEventListener('mouseleave', function() {
      dq20TipTimer = setTimeout(hideTip, 150);
    });

    tip.addEventListener('mouseenter', function() {
      clearTimeout(dq20TipTimer);
    });
    tip.addEventListener('mouseleave', function() {
      hideTip();
    });

    btn.addEventListener('focus', function() {
      clearTimeout(dq20TipTimer);
      positionAndShow();
    });
    btn.addEventListener('blur', function() {
      dq20TipTimer = setTimeout(hideTip, 100);
    });

    // Touch/click toggle
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (tip.style.display !== 'block') {
        positionAndShow();
      } else {
        hideTip();
      }
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      ['tzfiya','hasbar'].forEach(function(w) {
        var t = document.getElementById('s20-tip-' + w);
        if (t) t.style.display = 'none';
      });
    }
  });

  document.addEventListener('click', function() {
    ['tzfiya','hasbar'].forEach(function(w) {
      var t = document.getElementById('s20-tip-' + w);
      if (t) t.style.display = 'none';
    });
  });
}

let s20qTimers = [];
function enterScreen20() {
  dq20InitTips();
  dq20Done = false;
  dq20CloseAll();

  DQ20_ITEMS.forEach(function(item) {
    var dd = dq20GetDD(item.id);
    if (!dd) return;
    dd.classList.remove('is-correct', 'is-incorrect', 'is-open', 'is-done');
    dd.dataset.value = '';
    var tv = dd.querySelector('.s17-dd-trigger .s17-dd-val');
    if (tv) tv.textContent = '';
    var panel = dd.querySelector('.s17-dd-panel');
    if (panel) panel.style.display = 'none';
  });

  var fb = document.getElementById('s20q-feedback');
  if (fb) fb.style.display = 'none';
  var vw = document.getElementById('s20-video-wrap');
  if (vw) vw.style.display = '';
  var checkBtn = document.getElementById('s20q-check-btn');
  if (checkBtn) { checkBtn.style.display = ''; checkBtn.disabled = true; }
  var contBtn = document.getElementById('s20q-continue-btn');
  if (contBtn) contBtn.style.display = 'none';

  if (s20YTPlayer && typeof s20YTPlayer.seekTo === 'function') {
    s20YTPlayer.seekTo(S20_YT_START, true);
    s20YTPlayer.playVideo();
    s20StartLoop();
  }

  // Staged entrance: intro → instruction sentence → video+caption (media) →
  // each dropdown row individually (interactive area builds in last).
  s20qTimers.forEach(clearTimeout);
  s20qTimers = [];
  const s20LeadEls = ['s20-intro', 's20-choose', 's20-left'].map(id => document.getElementById(id));
  const s20RowEls  = Array.from(document.querySelectorAll('#s20-rows .s20-row'));
  s20LeadEls.forEach(el => el && el.classList.remove('is-visible'));
  s20RowEls.forEach(el => el.classList.remove('is-visible'));
  const s20LeadDelays = [0, 1000, 2000];
  s20LeadDelays.forEach((delay, i) => {
    s20qTimers.push(setTimeout(() => { if (s20LeadEls[i]) s20LeadEls[i].classList.add('is-visible'); }, delay));
  });
  s20RowEls.forEach((el, i) => {
    s20qTimers.push(setTimeout(() => el.classList.add('is-visible'), 3000 + i * 250));
  });
}
/* ── End screen 20 ─────────────────────────────────────────────────── */

/* ── Screen 21: Galileo Intro ───────────────────────────────────────── */

var galileoIntroTimer = null;

var s21IntroTimers = [];
function enterGalileoIntro() {
  var btn = document.getElementById('s21-continue');
  if (btn) {
    btn.disabled = true;
    clearTimeout(galileoIntroTimer);
    galileoIntroTimer = setTimeout(function() {
      if (btn) btn.disabled = false;
    }, 4700);
  }

  // Staged entrance: title → Aristotle paragraph → Galileo paragraph → bold result → image
  s21IntroTimers.forEach(clearTimeout);
  s21IntroTimers = [];
  var s21AnimEls = ['s21-title', 's21-body1', 's21-body2', 's21-result', 's21-media'].map(function(id) { return document.getElementById(id); });
  s21AnimEls.forEach(function(el) { if (el) el.classList.remove('is-visible'); });
  var s21AnimDelays = [0, 1000, 2000, 3000, 4000];
  s21AnimDelays.forEach(function(delay, i) {
    s21IntroTimers.push(setTimeout(function() { if (s21AnimEls[i]) s21AnimEls[i].classList.add('is-visible'); }, delay));
  });
}

/* ── End screen 21 ─────────────────────────────────────────────────── */

/* ── Screen 22: Moon Intro ─────────────────────────────────────────── */

var moonIntroTimer = null;

var s22IntroTimers = [];
function enterMoonIntro() {
  var btn = document.getElementById('s22moon-continue');
  var iframe = document.getElementById('s22-iframe');
  if (btn) {
    btn.disabled = true;
    clearTimeout(moonIntroTimer);
    moonIntroTimer = setTimeout(function() {
      if (btn) btn.disabled = false;
    }, 5000);
  }
  if (iframe && iframe.src === 'about:blank') {
    iframe.src = iframe.getAttribute('data-src');
  }

  // Staged entrance: title → historians paragraph → David Scott paragraph → bold result → video
  s22IntroTimers.forEach(clearTimeout);
  s22IntroTimers = [];
  var s22AnimEls = ['s22-title', 's22-body1', 's22-body2', 's22-result', 's22-media'].map(function(id) { return document.getElementById(id); });
  s22AnimEls.forEach(function(el) { if (el) el.classList.remove('is-visible'); });
  var s22AnimDelays = [0, 1000, 2000, 3000, 4000];
  s22AnimDelays.forEach(function(delay, i) {
    s22IntroTimers.push(setTimeout(function() { if (s22AnimEls[i]) s22AnimEls[i].classList.add('is-visible'); }, delay));
  });
}

function s22OpenModal() {
  var modal = document.getElementById('s22-modal');
  var mIframe = document.getElementById('s22-modal-iframe');
  if (!modal) return;
  modal.style.display = 'flex';
  if (mIframe && mIframe.src === 'about:blank') {
    mIframe.src = mIframe.getAttribute('data-src');
  }
}

function s22CloseModal() {
  var modal = document.getElementById('s22-modal');
  var mIframe = document.getElementById('s22-modal-iframe');
  if (modal) modal.style.display = 'none';
  if (mIframe) { mIframe.src = 'about:blank'; }
}

/* ── Galileo applet — shared full-size modal (screens 36/37/38) ──────
   The docked in-row preview (assets/widgets/galileo-applet/) is scaled
   down to fit beside the question text and reads small; this modal
   shows the same widget at its natural, fully-readable size. One shared
   modal/iframe for all three screens, same lazy-load-on-open /
   reset-on-close pattern as the screen 22 video modal above. */
function galileoOpenModal() {
  var modal  = document.getElementById('galileo-modal');
  var iframe = document.getElementById('galileo-modal-iframe');
  if (!modal) return;
  modal.style.display = 'flex';
  if (iframe && iframe.src === 'about:blank') {
    iframe.src = iframe.getAttribute('data-src');
  }
}

function galileoCloseModal() {
  var modal  = document.getElementById('galileo-modal');
  var iframe = document.getElementById('galileo-modal-iframe');
  if (modal) modal.style.display = 'none';
  if (iframe) { iframe.src = 'about:blank'; }
}

/* ── End screen 22 ─────────────────────────────────────────────────── */

/* ── Screen 23: Practice Q6 — SingleChoiceQuestionImage ─────────────── */

const SCQ23 = {
  correctId: 'bet',
  maxAttempts: 2,
  feedbackCorrect: {
    title: '<strong>ممتاز‎!</strong>',
    body:  'למרות ההבדל במסה, שני החפצים נחתו על הקרקע באותו זמן.<br><br>לכן מסקנת הניסוי היא:<br><strong>زمن الوصول إلى الأرض لا يعتمد على الكتلة‎.</strong>'
  },
  feedbackIncorrectFirst: {
    title: '<strong>الإجابة غير صحيحة‎.</strong>',
    body:  'هل نحاول مرة أخرى؟'
  },
  feedbackIncorrectFinal: {
    title: '<strong>الإجابة غير صحيحة‎.</strong>',
    body:  'למרות ההבדל במסה, שני החפצים נחתו על הקרקע באותו זמן.<br><br>לכן מסקנת הניסוי היא:<br><strong>زمن الوصول إلى الأرض لا يعتمد على الكتلة‎.</strong>'
  }
};

const SCQ23_SVG_CHECK = '<svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4.5L4.5 8L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SCQ23_SVG_CROSS = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L9 9M9 1L1 9" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>';

let scq23SelectedId = null;
let scq23Attempts   = 0;
let scq23Done       = false;
let scq23Correct    = false;
let scq23AnimTimers = [];

function enterScreen21() {
  scq23AnimTimers.forEach(clearTimeout);
  scq23AnimTimers = [];

  document.getElementById('s23-hint-overlay').style.display = 'none';
  document.getElementById('s23-feedback').style.display     = 'none';

  var opts = Array.from(document.querySelectorAll('#s23-options .s23-opt'));
  var imgWrapEl = document.getElementById('s23-img-wrap');

  if (scq23Done) {
    document.getElementById('s23-question').classList.add('is-visible');
    opts.forEach(function(el) { el.classList.add('is-visible'); });
    if (imgWrapEl) imgWrapEl.classList.add('is-visible');
    scq23RestoreStates(opts);
    document.getElementById('s23-check-btn').style.display    = 'none';
    document.getElementById('s23-hint-btn').style.display     = 'none';
    document.getElementById('s23-continue-btn').style.display = '';
    return;
  }

  opts.forEach(function(el) {
    el.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    var radio = el.querySelector('.s23-radio');
    radio.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    radio.querySelector('.s23-radio-icon').innerHTML = '';
    el.setAttribute('aria-checked', 'false');
  });
  scq23SelectedId = null;
  document.getElementById('s23-check-btn').style.display    = '';
  document.getElementById('s23-check-btn').disabled         = true;
  document.getElementById('s23-hint-btn').style.display     = '';
  document.getElementById('s23-continue-btn').style.display = 'none';

  var qEl = document.getElementById('s23-question');
  qEl.classList.remove('is-visible');
  opts.forEach(function(el) { el.classList.remove('is-visible'); });
  if (imgWrapEl) imgWrapEl.classList.remove('is-visible');
  var delays = [0, 1000, 1200, 1400, 1600];
  scq23AnimTimers.push(setTimeout(function() { qEl.classList.add('is-visible'); }, delays[0]));
  opts.forEach(function(el, i) {
    scq23AnimTimers.push(setTimeout(function() { el.classList.add('is-visible'); }, delays[i + 1]));
  });
  // Image comes up last, one full group-gap after the options cluster starts.
  if (imgWrapEl) scq23AnimTimers.push(setTimeout(function() { imgWrapEl.classList.add('is-visible'); }, 2000));
}

function scq23RestoreStates(opts) {
  opts.forEach(function(el) {
    el.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    var radio = el.querySelector('.s23-radio');
    radio.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    radio.querySelector('.s23-radio-icon').innerHTML = '';
  });
  var selEl = opts.find ? opts.find(function(el) { return el.dataset.id === scq23SelectedId; })
            : Array.prototype.filter.call(opts, function(el) { return el.dataset.id === scq23SelectedId; })[0];
  if (!selEl) return;
  if (scq23Correct) {
    selEl.classList.add('is-correct');
    var r = selEl.querySelector('.s23-radio');
    r.classList.add('is-correct');
    r.querySelector('.s23-radio-icon').innerHTML = SCQ23_SVG_CHECK;
  } else {
    selEl.classList.add('is-incorrect');
    var r = selEl.querySelector('.s23-radio');
    r.classList.add('is-incorrect');
    r.querySelector('.s23-radio-icon').innerHTML = SCQ23_SVG_CROSS;
    var corrEl = Array.prototype.filter.call(opts, function(el) { return el.dataset.id === SCQ23.correctId; })[0];
    if (corrEl && corrEl !== selEl) {
      corrEl.classList.add('is-correct');
      var cr = corrEl.querySelector('.s23-radio');
      cr.classList.add('is-correct');
      cr.querySelector('.s23-radio-icon').innerHTML = SCQ23_SVG_CHECK;
    }
  }
}

function scq23Select(id) {
  if (scq23Done) return;
  var fb = document.getElementById('s23-feedback');
  if (fb.style.display !== 'none') {
    fb.style.display = 'none';
    document.getElementById('s23-check-btn').style.display = '';
  }
  scq23SelectedId = id;
  var opts = Array.from(document.querySelectorAll('#s23-options .s23-opt'));
  opts.forEach(function(el) {
    el.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    var radio = el.querySelector('.s23-radio');
    radio.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    radio.querySelector('.s23-radio-icon').innerHTML = '';
    el.setAttribute('aria-checked', 'false');
    if (el.dataset.id === id) {
      el.classList.add('is-selected');
      radio.classList.add('is-selected');
      el.setAttribute('aria-checked', 'true');
    }
  });
  document.getElementById('s23-check-btn').style.display = '';
  document.getElementById('s23-check-btn').disabled = false;
}

function scq23Check() {
  if (!scq23SelectedId || scq23Done) return;
  scq23Attempts++;
  var isCorrect = scq23SelectedId === SCQ23.correctId;
  var opts = Array.from(document.querySelectorAll('#s23-options .s23-opt'));
  var selEl = opts.filter(function(el) { return el.dataset.id === scq23SelectedId; })[0];

  if (isCorrect) {
    scq23Done    = true;
    scq23Correct = true;
    window.lomdaState.standardScore++;
    selEl.classList.remove('is-selected');
    selEl.classList.add('is-correct');
    var r = selEl.querySelector('.s23-radio');
    r.classList.remove('is-selected');
    r.classList.add('is-correct');
    r.querySelector('.s23-radio-icon').innerHTML = SCQ23_SVG_CHECK;
    scq23ShowFeedback(SCQ23.feedbackCorrect, true);
    document.getElementById('s23-check-btn').style.display    = 'none';
    document.getElementById('s23-hint-btn').style.display     = 'none';
    document.getElementById('s23-continue-btn').style.display = '';

  } else if (scq23Attempts >= SCQ23.maxAttempts) {
    scq23Done    = true;
    scq23Correct = false;
    selEl.classList.remove('is-selected');
    selEl.classList.add('is-incorrect');
    var sr = selEl.querySelector('.s23-radio');
    sr.classList.remove('is-selected');
    sr.classList.add('is-incorrect');
    sr.querySelector('.s23-radio-icon').innerHTML = SCQ23_SVG_CROSS;
    var corrEl = opts.filter(function(el) { return el.dataset.id === SCQ23.correctId; })[0];
    if (corrEl && corrEl !== selEl) {
      corrEl.classList.add('is-correct');
      var cr = corrEl.querySelector('.s23-radio');
      cr.classList.add('is-correct');
      cr.querySelector('.s23-radio-icon').innerHTML = SCQ23_SVG_CHECK;
    }
    scq23ShowFeedback(SCQ23.feedbackIncorrectFinal, false);
    document.getElementById('s23-check-btn').style.display    = 'none';
    document.getElementById('s23-hint-btn').style.display     = 'none';
    document.getElementById('s23-continue-btn').style.display = '';

  } else {
    selEl.classList.remove('is-selected');
    selEl.classList.add('is-incorrect');
    var r = selEl.querySelector('.s23-radio');
    r.classList.remove('is-selected');
    r.classList.add('is-incorrect');
    r.querySelector('.s23-radio-icon').innerHTML = SCQ23_SVG_CROSS;
    scq23ShowFeedback(SCQ23.feedbackIncorrectFirst, false);
    document.getElementById('s23-check-btn').disabled = true;
  }
}

function scq23ShowFeedback(cfg, isCorrect) {
  var zoomBtn = document.querySelector('[data-screen="23"] .img-zoom-btn');
  if (zoomBtn) zoomBtn.style.visibility = 'hidden';
  var fb = document.getElementById('s23-feedback');
  fb.className = 's23-feedback ' + (isCorrect ? 'is-correct' : 'is-incorrect');
  document.getElementById('s23-fb-title').innerHTML = cfg.title;
  document.getElementById('s23-fb-body').innerHTML  = cfg.body;
  fb.style.display = 'flex';
}

function scq23CloseFeedback() {
  var zoomBtn = document.querySelector('[data-screen="23"] .img-zoom-btn');
  if (zoomBtn) zoomBtn.style.visibility = '';
  document.getElementById('s23-feedback').style.display = 'none';
  if (!scq23Done) {
    var opts = Array.from(document.querySelectorAll('#s23-options .s23-opt'));
    opts.forEach(function(el) {
      el.classList.remove('is-selected', 'is-incorrect', 'is-correct');
      var radio = el.querySelector('.s23-radio');
      radio.classList.remove('is-selected', 'is-incorrect', 'is-correct');
      radio.querySelector('.s23-radio-icon').innerHTML = '';
      el.setAttribute('aria-checked', 'false');
    });
    scq23SelectedId = null;
    document.getElementById('s23-check-btn').style.display = '';
    document.getElementById('s23-check-btn').disabled = true;
  }
}

function scq23OpenHint() {
  document.getElementById('s23-hint-overlay').style.display = '';
}

function scq23CloseHint() {
  document.getElementById('s23-hint-overlay').style.display = 'none';
}

/* ── End screen 23 ─────────────────────────────────────────────────── */

/* ════════════════════════════════════════════════════════════════════
   BASIC PRACTICE — Data Store & Generic Engines (screens 24–26)
   All learner-facing texts live here. Logic is shared via generic
   scqGen* / ddqGen* functions — zero duplication between questions.
   ════════════════════════════════════════════════════════════════════ */

/* ── Data Store ───────────────────────────────────────────────────── */
window.GEN_DATA = {

  24: {
    type:               'scq',
    optionsContainerId: 's22-options',
    questionId:         's22-question',
    checkBtnId:         's22-check-btn',
    continueBtnId:      's22-continue-btn',
    hintBtnId:          's22-hint-btn',
    hintOverlayId:      's22-hint-overlay',
    feedbackId:         's22-feedback',
    fbTitleId:          's22-fb-title',
    fbBodyId:           's22-fb-body',
    options:            ['كتلته', 'وزنه', 'كتلته ووزنه أيضًا', 'لم يتغير شيء'],
    correctAnswer:      'وزنه',
    maxAttempts:        2,
    hintAlwaysEnabled:  true,
    hint: { title: 'تلميح', body: 'ما الذي يعتمد على قوة الجاذبية، كتلة رائد الفضاء أم وزنه؟' },
    feedbackCorrect:        { title: 'ممتاز‎!',           body: 'يعتمد الوزن على قوة الجاذبية، ولذلك يتغير بين الكرة الأرضية والقمر.\nأما الكتلة، وهي كمية المادة في الجسم، فتبقى ثابتة‎.' },
    feedbackIncorrectFirst: { title: 'الإجابة غير صحيحة.', body: 'هل نحاول مرة أخرى؟' },
    feedbackIncorrectFinal: { title: 'الإجابة غير صحيحة.',  body: 'يعتمد الوزن على قوة الجاذبية، ولذلك يتغير بين الكرة الأرضية والقمر.\nأما الكتلة، وهي كمية المادة في الجسم، فتبقى ثابتة‎.' }
  },

  25: {
    type:              'ddq',
    ddIdPrefix:        'b2',
    checkBtnId:        'bq2-check-btn',
    continueBtnId:     'bq2-continue-btn',
    hintBtnId:         'bq2-hint-btn',
    hintOverlayId:     'bq2-hint-overlay',
    feedbackId:        'bq2-feedback',
    fbTitleId:         'bq2-fb-title',
    fbBodyId:          'bq2-fb-body',
    options:           ['الكتلة', 'الوزن'],
    maxAttempts:       1,
    hintAlwaysEnabled: true,
    items: [
      { id: 'alef',  correct: 'الوزن' },
      { id: 'bet',   correct: 'الكتلة'  },
      { id: 'gimel', correct: 'الكتلة'  },
      { id: 'dalet', correct: 'الوزن' }
    ],
    feedbackCorrect:  { title: 'ممتاز‎!',           body: 'מסה היא כמות החומר שיש בגוף. היא לא תלויה בכוח הכבידה, ולכן נשארת אותו הדבר גם שככוח הכבידה משתנה.\nמשקל הוא הכוח שהכבידה מושכת בו את הגוף כלפי מטה, הוא תלוי בעוצמת כוח הכבידה, ולכן משתנה במעבר למקום עם כוח כבידה אחר.' },
    feedbackIncorrect: { title: 'الإجابة غير صحيحة.', body: 'מסה היא כמות החומר שיש בגוף. היא לא תלויה בכוח הכבידה, ולכן נשארת אותו הדבר גם שככוח הכבידה משתנה.\nמשקל הוא הכוח שהכבידה מושכת בו את הגוף כלפי מטה, הוא תלוי בעוצמת כוח הכבידה, ולכן משתנה במעבר למקום עם כוח כבידה אחר.' }
  },

  26: {
    type:               'scq',
    optionsContainerId: 's24-options',
    questionId:         's24-question',
    checkBtnId:         's24-check-btn',
    continueBtnId:      's24-continue-btn',
    hintBtnId:          's24-hint-btn',
    hintOverlayId:      's24-hint-overlay',
    feedbackId:         's24-feedback',
    fbTitleId:          's24-fb-title',
    fbBodyId:           's24-fb-body',
    options:            ['قوة الجاذبية على القمر أضعف', 'الكتلة لا تعتمد على قوة الجاذبية', 'الوزن يعتمد على قوة الجاذبية', 'أمجد رائد الفضاء يقفز أعلى على القمر'],
    correctAnswer:      'أمجد رائد الفضاء يقفز أعلى على القمر',
    maxAttempts:        2,
    hintAlwaysEnabled:  true,
    feedbackCorrect:        { title: 'ممتاز‎!',           body: 'المشاهدة هي شيء يمكن رؤيته أو قياسه فعليًا.\nعندما يقفز أمجد أعلى على القمر، فهذا شيء يمكن رؤيته، ولذلك فهو مشاهدة‎.' },
    feedbackIncorrectFirst: { title: 'الإجابة غير صحيحة.', body: 'هل نحاول مرة أخرى؟' },
    feedbackIncorrectFinal: { title: 'الإجابة غير صحيحة.', body: 'الإجابة الصحيحة مُشار إليها.\nالمشاهدة هي شيء يمكن رؤيته أو قياسه فعليًا.\nعندما يقفز أمجد أعلى على القمر، فهذا شيء يمكن رؤيته، ولذلك فهو مشاهدة‎.' }
  },

  28: {
    type:               'scq',
    optionsContainerId: 's26-options',
    questionId:         's26-question',
    checkBtnId:         's26-check-btn',
    continueBtnId:      's26-continue-btn',
    hintBtnId:          's26-hint-btn',
    hintOverlayId:      's26-hint-overlay',
    feedbackId:         's26-feedback',
    fbTitleId:          's26-fb-title',
    fbBodyId:           's26-fb-body',
    options: [
      'يمكن فحصها بواسطة القياسات والتجارب',
      'الكثير من العلماء يعتقدون أنها صحيحة',
      'تعتمد على ما يشعر به رواد الفضاء في الفضاء',
      'تبدو منطقية ومتوافقة مع الحدس'
    ],
    correctAnswer:      'يمكن فحصها بواسطة القياسات والتجارب',
    maxAttempts:        2,
    hintAlwaysEnabled:  false,
    feedbackCorrect:        { title: 'ممتاز‎!',           body: 'השערה מדעית היא רעיון שניתן לבדוק באמצעות מדידות וניסויים.\nהבדיקה והמדידה הן מה מבדילות בין דעה להשערה מדעית.' },
    feedbackIncorrectFirst: { title: 'الإجابة غير صحيحة.', body: 'هل نحاول مرة أخرى؟' },
    feedbackIncorrectFinal: { title: 'الإجابة غير صحيحة.',  body: 'השערה מדעית היא רעיון שניתן לבדוק באמצעות מדידות וניסויים.\nהבדיקה והמדידה הן מה מבדילות בין דעה להשערה מדעית.' }
  },

  /* ── Screen 46: Standard-B שאלה 2 — SCQImage (tomato/moon scale) ──
     Script (slides 90-93): "ללא רמז בשאלה זו" (no hint for this question).
     The shared scq engine still requires a hint button/overlay to exist
     structurally, so one is present in the HTML; its content here is kept
     minimal and drawn only from the scripted feedback, since it should
     rarely if ever be seen (maxAttempts lets most learners never trigger it). */
  45: {
    type: 'scqImg',
    optionsContainerId: 's46-options', questionId: 's46-question',
    contextId: null, context: null,
    checkBtnId: 's46-check-btn', continueBtnId: 's46-continue-btn',
    hintBtnId: null, hintOverlayId: null,
    imageId: 's46-img', imageSrc: null,
    feedbackId: 's46-feedback', fbTitleId: 's46-fb-title', fbBodyId: 's46-fb-body',
    question: 'מסתו של אצן עם הבגדים, לפני יציאתו לריצה, הייתה 76 קילוגרם.\n<span class="s46-second">בסוף הריצה מסתו הייתה 73 קילוגרם. מהו ההסבר לכך, לדעתכם?</span>',
    options: [
      'חלק מהמסה של האצן נעלמה והפכה לאנרגיית תנועה (אנרגיה קינטית) במהלך הריצה.',
      'הריצה המהירה גרמה לכוח הכבידה להשפיע פחות על האצן, ולכן מסתו פחתה.',
      'המסה פחתה עקב אובדן מים (כזיעה שהתאדתה) ופחמן דו חמצני.',
      'המסה של הבגדים בלבד היא שהשתנתה והתכווצה בגלל המאמץ והרוח.'
    ],
    correctAnswer: 'המסה פחתה עקב אובדן מים (כזיעה שהתאדתה) ופחמן דו חמצני.',
    maxAttempts: 2, hintAlwaysEnabled: false,
    feedbackCorrect:        { title: 'ممتاز‎!',           body: 'במהלך הריצה נפלטה מגוף האצן מסה עקב הזעה ופליטת פחמן דו חמצני בתהליך הנשימה.\nלכן, מסתו פחתה.' },
    feedbackIncorrectFirst: { title: 'الإجابة غير صحيحة.', body: 'هل نحاول مرة أخرى؟' },
    feedbackIncorrectFinal: { title: 'الإجابة غير صحيحة.', body: 'במהלך הריצה נפלטה מגוף האצן מסה עקב הזעה ופליטת פחמן דו חמצני בתהליך הנשימה.\nלכן, מסתו פחתה.' }
  },

  /* ── Screen 29: TransitionScreen — משימת כיתה ──────────────────── */
  29: {
    type:            'transition',
    suptitle:        'أنهيت التمرين بنجاح - كل الاحترام!',
    bigtitle:        'مهمّة صفيّة',
    subtitle:        'هذا وقت مناسب للتعلم بطريقة مختلفة أيضًا، لأن التعلم يتم بعدّة طرق.',
    bubble:          'هذا فرصة جيدة لتمديد العضلات!',
    char:            '../unit-assets/video/moving-opt.mp4',
    continueBtnText: 'يمكن البدء!'
  },

  /* ── Screen 30: Class Task Instructions ─────────────────────────── */
  30: {
    type:            'classTaskInst',
    titleId:         's28-title',
    subtitleId:      's28-subtitle',
    stepsId:         's28-steps',
    continueBtnId:   's28-continue',
    title:           'في هذه المهمة ستُعيدون تنفيذ تجربة غاليليو‎:',
    subtitle:        'מצאו 2 חפצים בסביבתכם בעלי מסות שונות משמעותית, אחד קל והשני כבד.',
    steps: [
      'قفوا على كرسي وأسقطوا الغرضين إلى الأسفل في نفس الوقت (يمكن تكرار التجربة عدة مرات)‎.',
      'اكتبوا في الدفتر‎:',
      'أ. هل استطعتم التحديد بدقّة أي غرض وصل أولًا إلى الأسفل؟ هل كان هناك فرق واضح في زمن الهبوط؟',
      'ب. كيف يمكنكم أن تجعلوا التجربة أدقّ من الناحية العلمية، وكذلك أن تشاهدوا وتقيسوا ما إذا كان هناك فرق فعلًا في زمن الهبوط بين الغرضين؟'
    ],
    continueBtnText: 'عُدتُ. يمكن المتابعة'
  },

  /* ── Screen 47: Class Task wrap-up — scientific tools (script slide 99) ──
     Rebuilt on the TransitionScreen template — tools text now lives in
     the speech bubble (previously a title/subtitle/numbered-steps card).
     Content unchanged, just merged into one bubble string with the
     4 tool items on their own lines. */
  46: {
    type:            'transition',
    suptitle:        '',
    bigtitle:        'مهمّة صفيّة',
    subtitle:        '',
    bubble:          'כדי להפוך את הניסוי למדויק מבחינה מדעית, וגם להצליח לצפות ולמדוד האם באמת יש הבדל בזמן הנחיתה בין שני הגופים, אפשר להשתמש בכל מיני כלים. למשל:\n• מצלמה שמצלמת בהילוך איטי את הנחיתה.\n• חיישני מגע על הרצפה.\n• מכשיר שמשחרר ביחד את שני החפצים, כדי לשלול את ההשפעה של הגורם האנושי.\n• וגם – לעלות גבוה יותר, הרבה יותר גבוה.',
    char:            'assets/video/glasses.mp4',
    continueBtnText: 'متابعة'
  },

  /* ── Screen 31: Class Task Reflection Form ───────────────────────── */
  31: {
    type:            'classTask',
    titleId:         's29-title',
    fieldsId:        's29-fields',
    feedbackId:      's29-feedback',
    feedbackTextId:  's29-feedback-text',
    charId:          's29-char',
    continueBtnId:   's29-continue',
    title:           'مهمّة صفيّة',
    fields: [
      { id: 'light', label: 'ما هو الغرض الخفيف الذي اخترتموه؟',        type: 'text',     placeholder: 'اكتبوا الإجابة هنا' },
      { id: 'heavy', label: 'ما هو الغرض الثقيل الذي اخترتموه؟',       type: 'text',     placeholder: 'اكتبوا الإجابة هنا' },
      { id: 'diff',  label: 'كيف يمكنكم أن تجعلوا التجربة أدقّ من الناحية العلمية، وأن تنجحوا في مشاهدة وقياس ما إذا كان هناك فرق فعلًا في زمن الهبوط بين الغرضين؟', type: 'textarea', placeholder: 'اكتبوا الإجابة هنا' },
      { id: 'why',   label: 'هل استطعتم التحديد بدقة ما إذا كان الغرضان قد اصطدما بالأرض معًا؟', type: 'textarea', placeholder: 'اكتبوا الإجابة هنا' }
    ],
    feedbackText:    'شكرًا على التفكير والمشاركة‎!',
    char:            '../unit-assets/video/scales-opt.mp4',
    continueBtnText: 'يمكن المتابعة'
  },

  /* ── Screen 32: TransitionScreen — שאלות מתקדמות ──────────────────── */
  32: {
    type: 'transition',
    suptitle: '',
    bigtitle: 'זמן ל-5 שאלות מתקדמות',
    subtitle: '(هذا يعني أننا تقدّمنا في المستوى)',
    bubble: '',
    char: '../unit-assets/video/lifting-opt.mp4',
    continueBtnText: 'يمكن البدء!'
  },

  33: {
    type: 'scqImg',
    optionsContainerId: 's31-options', questionId: 's31-question',
    contextId: null, context: null,
    checkBtnId: 's31-check-btn', continueBtnId: 's31-continue-btn',
    hintBtnId: null, hintOverlayId: null,
    feedbackId: 's31-feedback', fbTitleId: 's31-fb-title', fbBodyId: 's31-fb-body',
    imageId: 's31-img', imageSrc: null,
    recapId: 's31-heading', recap: 'إعادة تنفيذ تجربة غاليليو‎:',
    question: 'א. לאחר שהתנסתם בהשלכת זוג גופים בעלי אותה מסה, מהי תוצאת הניסוי?',
    options: [
      'الجسمان اللذان لهما نفس الكتلة سقطا في نفس الوقت بالضبط.',
      'سقط الجسمان في أوقات مختلفة، لأن كتلتيهما مختلفتان‎.',
      'على الرغم من أن الكتلة متساوية، فإن زمن سقوط الجسمين مختلف‎.',
      'الجسم الذي له مساحة سطح أكبر، سقط أسرع‎.'
    ],
    correctAnswer: 'على الرغم من أن الكتلة متساوية، فإن زمن سقوط الجسمين مختلف‎.',
    maxAttempts: 2, hintAlwaysEnabled: false,
    feedbackCorrect:        { title: 'ممتاز‎!',           body: 'على الرغم من أنه في كل زوج، كانت كتلة الجسمين متساوية تمامًا،\nإلّا أن أزمنة السقوط كانت مختلفة.\nوالسبب مثير للاهتمام:\nكلما كانت مساحة سطح الجسم أكبر،\nكانت مقاومة الهواء أثناء السقوط أكبر (مقارنةً بجسم آخر له نفس الكتلة)،\nولذلك يكون زمن السقوط أبطأ.' },
    feedbackIncorrectFirst: { title: 'الإجابة غير صحيحة.', body: 'هل نحاول مرة أخرى؟' },
    feedbackIncorrectFinal: { title: 'الإجابة غير صحيحة.', body: 'على الرغم من أنه في كل زوج، كانت كتلة الجسمين متساوية تمامًا،\nإلّا أن أزمنة السقوط كانت مختلفة.\nوالسبب مثير للاهتمام:\nكلما كانت مساحة سطح الجسم أكبر،\nكانت مقاومة الهواء أثناء السقوط أكبر (مقارنةً بجسم آخر له نفس الكتلة)،\nولذلك يكون زمن السقوط أبطأ.' }
  },

  /* ── Screen 33b: Advanced Q1 section ב (script slides 104-107) ────── */
  50: {
    type: 'scqImg',
    optionsContainerId: 's34b-options', questionId: 's34b-question',
    contextId: null, context: null,
    checkBtnId: 's34b-check-btn', continueBtnId: 's34b-continue-btn',
    hintBtnId: null, hintOverlayId: null,
    feedbackId: 's34b-feedback', fbTitleId: 's34b-fb-title', fbBodyId: 's34b-fb-body',
    imageId: 's34b-img', imageSrc: null,
    recapId: 's34b-heading', recap: 'إعادة تنفيذ تجربة غاليليو‎:',
    question: 'ب. أي استنتاج ناجم عن نتائج التجربة التي أجريتموها؟',
    options: [
      'غاليليو كان مخطئًا. سرعة السقوط تُحدَّد بحسب الكتلة‎.',
      "الأجسام التي لها كتلة صغيرة \"تلتقط\" هواءً أقل، ولذلك تصل إلى الأرض أولًا‎.",
      'لم تكن ظروف التجربة متطابقة بين جميع الأجسام، ولذلك لا يمكن استخلاص استنتاج‎.',
      'مقاومة الهواء كانت مختلفة بين الأجسام، ولذلك حصلنا على أزمنة سقوط مختلفة،\nعلى الرغم من أن الكتلة كانت متساوية‎.'
    ],
    correctAnswer: 'مقاومة الهواء كانت مختلفة بين الأجسام، ولذلك حصلنا على أزمنة سقوط مختلفة،\nعلى الرغم من أن الكتلة كانت متساوية‎.',
    maxAttempts: 2, hintAlwaysEnabled: false,
    feedbackCorrect:        { title: 'ممتاز‎!',           body: 'בהתנסות שערכנו גילינו שלהתנגדות האויר יש השפעה על זמן הנפילה של הגוף, גם כששתי המסות זהות.\nככל שלגוף שטח פנים גדול יותר, כך התנגדות האויר בנפילה גדולה יותר (ביחס לגוף אחר עם אותה מסה), ולכן זמן הנפילה איטי יותר.' },
    feedbackIncorrectFirst: { title: 'الإجابة غير صحيحة.', body: 'هل نحاول مرة أخرى؟' },
    feedbackIncorrectFinal: { title: 'الإجابة غير صحيحة.', body: 'בהתנסות שערכנו גילינו שלהתנגדות האויר יש השפעה על זמן הנפילה של הגוף, גם כששתי המסות זהות.\nככל שלגוף שטח פנים גדול יותר, כך התנגדות האויר בנפילה גדולה יותר (ביחס לגוף אחר עם אותה מסה), ולכן זמן הנפילה איטי יותר.' }
  },

  34: {
    type: 'viq',
    questionId: 's32-question', contextId: 's32-context', subqId: 's32-subq', sentenceId: 's32-sentence',
    checkBtnId: 's32-check-btn', continueBtnId: 's32-continue-btn',
    hintBtnId: 's32-hint-btn', hintOverlayId: 's32-hint-overlay',
    hintTitleId: 's32-hint-title', hintBodyId: 's32-hint-body',
    feedbackId: 's32-feedback', fbTitleId: 's32-fb-title', fbBodyId: 's32-fb-body',
    question: 'לפניכם שאלה מדעית שמתבססת על נתונים מספריים (כי בלי מתמטיקה אין מדע):',
    context: 'כדי להכין קנקן תה קר גדול למסיבת השכבה, יש להוסיף 30 כפות סוכר לפי המתכון.\nידוע ש: מסת כף סוכר אחת היא 10 גרם. ו-1 ק"ג סוכר, הם 1000 גרם.',
    subquestion: 'על פי נתונים אלו, השלימו את המשפט הבא:',
    sentencePrefix: 'סך מסת הסוכר הנדרשת לקנקן היא',
    fields: [
      { id: 'grams', inputId: 's32-f1', unit: 'גרם',  correctValue: 300,  tolerance: 0.5 },
      { id: 'kg',    inputId: 's32-f2', unit: 'ק"ג',  separator: ', שהם', correctValue: 0.3, tolerance: 0.001 }
    ],
    maxAttempts: 2, hintAlwaysEnabled: false,
    hint: { title: 'تلميح', body: 'על מנת להשלים את המשפט בצורה נכונה, יש לבצע 2 חישובים:\n1. מדידת סך מסת הסוכר בגרמים.\n2. מדידת סך מסת הסוכר בק"ג.\nהחליטו מהו התרגיל המתאים לכל אחד מהם, בצעו את החישובים במחברת, ותמצאו את התשובה הנכונה.' },
    feedbackCorrect:        { title: 'ممتاز‎!',           body: 'כל כף סוכר מכילה 10 גרם, ולכן סך מסת הסוכר בגרמים היא 300 גרם (30 × 10).\nמכיוון שבכל 1 ק"ג יש 1000 גרמים: 300 ÷ 1000 = 0.300 ק"ג.' },
    feedbackIncorrectFirst: { title: 'الإجابة غير صحيحة.', body: 'هل نحاول مرة أخرى؟' },
    feedbackIncorrectFinal: { title: 'الإجابة غير صحيحة.',  body: 'כל כף סוכר מכילה 10 גרם, ולכן סך מסת הסוכר בגרמים היא 300 גרם (30 × 10).\nמכיוון שבכל 1 ק"ג יש 1000 גרמים: 300 ÷ 1000 = 0.300 ק"ג.' }
  },

  36: {
    type: 'scqImg',
    optionsContainerId: 's34-options', questionId: 's34-question',
    contextId: null, context: null,
    checkBtnId: 's34-check-btn', continueBtnId: 's34-continue-btn',
    hintBtnId: 's34-hint-btn', hintOverlayId: 's34-hint-overlay',
    hintTitleId: 's34-hint-title', hintBodyId: 's34-hint-body',
    feedbackId: 's34-feedback', fbTitleId: 's34-fb-title', fbBodyId: 's34-fb-body',
    imageId: 's34-img', imageSrc: 'assets/img/farmer-opt.png',
    question: '<span class="q41-lead s11-anim">חקלאי פיתח זן אורז ייחודי של גרגרי אורז עבים ועסיסיים.</span><span class="q41-body s11-anim">כחלק מתהליך הפיתוח, עליו להעריך מהי מסתו של גרגר אורז ממוצע.\nלצורך כך, הניח גרגר אורז על מאזניים דיגיטליים, אבל המאזניים הראו 0 (לא רגישים מספיק).</span>\n<span class="q41-question s11-anim">מהי הדרך המדעית הטובה ביותר לעזור לחקלאי לחשב מסתו הממוצעת של גרגר אורז אחד?</span>',
    options: [
      'قياس عدة حبات أرزّ مختلفة، حتى يظهر رقم على شاشة الميزان‎.',
      'قياس عدّة حبات معًا، وقسمة الكتلة الإجمالية على عدد الحبات نفسه‎.',
      'لا يمكن قياس كتلة صغيرة إلى هذا الحد‎.',
      'اختيار أكبر حبة وقياس كتلتها‎.'
    ],
    correctAnswer: 'قياس عدّة حبات معًا، وقسمة الكتلة الإجمالية على عدد الحبات نفسه‎.',
    maxAttempts: 2, hintAlwaysEnabled: false,
    hint: { title: 'تلميح', body: 'كتلة الحبة الواحدة صغيرة جدًا ولذلك لن يُظهرها الميزان.\nماذا يجب أن نفعل لكي تظهر على الميزان قيمة مختلف عن الصفر،\nوكيف يمكننا الوصول من هذه القيمة، ومعرفة عدد الحبات،\nإلى كتلة حبة واحدة؟' },
    feedbackCorrect:        { title: 'ممتاز‎!',           body: 'قياس كتلة عدد عدّة حبات الأرزّ معًا سيُظهر الكتلة الإجمالية على شاشة الميزان.\nنقسم الكتلة الإجمالية التي حصلنا عليها على عدد الحبات التي قسنا وزنها،\nفنصل إلى معدل كتلة حبة أرزّ واحدة‎.' },
    feedbackIncorrectFirst: { title: 'الإجابة غير صحيحة.', body: 'هل نحاول مرة أخرى؟' },
    feedbackIncorrectFinal: { title: 'الإجابة غير صحيحة.', body: 'قياس كتلة عدد عدّة حبات الأرزّ معًا سيُظهر الكتلة الإجمالية على شاشة الميزان.\nنقسم الكتلة الإجمالية التي حصلنا عليها على عدد الحبات التي قسنا وزنها،\nفنصل إلى معدل كتلة حبة أرزّ واحدة‎.' }
  },

  37: {
    type: 'scq',
    optionsContainerId: 's35-options', questionId: 's35-question',
    contextId: 's35-context', context: '<span class="s11-context-lead">בשיעור מדעים למדו התלמידים את הנתונים הבאים:</span>\n<span class="s11-context-body">נפחו של הירח קטן בערך פי 50 מנפח כדור הארץ.\nהמשקל של הגופים על הירח קטן בערך פי 6 לעומת כדור הארץ.</span>',
    checkBtnId: 's35-check-btn', continueBtnId: 's35-continue-btn',
    hintBtnId: 's35-hint-btn', hintOverlayId: 's35-hint-overlay',
    hintTitleId: 's35-hint-title', hintBodyId: 's35-hint-body',
    feedbackId: 's35-feedback', fbTitleId: 's35-fb-title', fbBodyId: 's35-fb-body',
    question: 'איזה מהמשפטים הבאים הוא פרשנות או תחזית מדעית המבוססת על הנתונים, ולא עובדה מדעית?',
    options: [
      'משקלו של אדם על הירח קטן בערך פי 6 ממשקלו על כדור הארץ',
      'נפחו של הירח קטן בערך פי 50 מנפח כדור הארץ',
      'לחללית יהיה קל יותר להמריא מהירח מאשר מכדור הארץ',
      'קוטרו של הירח הוא בערך 3,474 קילומטרים'
    ],
    correctAnswer: 'לחללית יהיה קל יותר להמריא מהירח מאשר מכדור הארץ',
    maxAttempts: 2, hintAlwaysEnabled: false,
    hint: { title: 'تلميح', body: 'שלושה מהמשפטים מציגים נתון שנמדד או נצפה, אבל רק אחד מהם מסביר מדוע משהו קורה. באיזה משפט מדובר?' },
    feedbackCorrect:        { title: 'ممتاز‎!',           body: 'משפט ד\' הוא המשפט היחיד שמשתמש בנתון מסוים (משקל הגופים על הירח קטן פי 6) כדי לחזות תופעה חדשה.\nשאר המשפטים הם עובדות מדעיות.' },
    feedbackIncorrectFirst: { title: 'الإجابة غير صحيحة.', body: 'هل نحاول مرة أخرى؟' },
    feedbackIncorrectFinal: { title: 'الإجابة غير صحيحة.',  body: 'משפט ד\' הוא המשפט היחיד שמשתמש בנתון מסוים (משקל הגופים על הירח קטן פי 6) כדי לחזות תופעה חדשה.\nשאר המשפטים הם עובדות מדעיות.' }
  },

  38: {
    type: 'hotspot',
    questionId: 's36-question', overlayId: 's36-overlay', imageId: 's36-img',
    legendId: 's36-legend',
    checkBtnId: 's36-check-btn', continueBtnId: 's36-continue-btn',
    hintBtnId: 's36-hint-btn', hintOverlayId: 's36-hint-overlay',
    hintTitleId: 's36-hint-title', hintBodyId: 's36-hint-body',
    feedbackId: 's36-feedback', fbTitleId: 's36-fb-title', fbBodyId: 's36-fb-body',
    imageSrc: 'assets/img/graph_q5-opt.png',
    question: '<span class="hsp-lead">לאחר נסיעה ברכבת הרים התפתחה שיחה בין יואב לנועה:</span>\n<span class="hsp-body">יואב: "בחלקים מסוימים בנסיעה הרגשתי כאילו המשקל שלי גדל".\nנועה: "בחלקים מסוימים בנסיעה הרגשתי כאילו המשקל שלי קטן".\n\nלפניכם גרף המתאר את קריאת המשקל הממוצעת של יואב ונועה, שנעשתה במהלך הנסיעה.</span>\n<span class="hsp-q">סמנו על הגרף נקודה אחת בה הנתונים מחזקים את הטענה של יואב, ונקודה אחת בה הנתונים מחזקים את הטענה של נועה.</span>',
    markers: [
      { color: 'green',  label: 'יואב — משקל גדל' },
      { color: 'orange', label: 'נועה — משקל קטן'  }
    ],
    /* Point hotspots, centered exactly on the 13 data points baked into
       graph_q5.png (measured from the asset itself via color-blob analysis):
       4 "weight increased" points (top group, green), 3 "weight decreased"
       points (bottom group, orange), and 6 neutral baseline points (blue,
       neither group) — all 13 must be clickable/selectable so the learner
       distinguishes the correct pair themselves; only a green+orange pair
       is correct (see hspGenCheck). cx/cy are fractions of the image. */
    zones: [
      { id: 'g1', color: 'green',  cx: 0.285, cy: 0.095, x1: 0.255, y1: 0.055, x2: 0.315, y2: 0.135 },
      { id: 'g2', color: 'green',  cx: 0.364, cy: 0.186, x1: 0.334, y1: 0.146, x2: 0.394, y2: 0.226 },
      { id: 'g3', color: 'green',  cx: 0.545, cy: 0.141, x1: 0.515, y1: 0.101, x2: 0.575, y2: 0.181 },
      { id: 'g4', color: 'green',  cx: 0.621, cy: 0.190, x1: 0.591, y1: 0.150, x2: 0.651, y2: 0.230 },
      { id: 'o1', color: 'orange', cx: 0.416, cy: 0.731, x1: 0.386, y1: 0.691, x2: 0.446, y2: 0.771 },
      { id: 'o2', color: 'orange', cx: 0.488, cy: 0.712, x1: 0.458, y1: 0.672, x2: 0.518, y2: 0.752 },
      { id: 'o3', color: 'orange', cx: 0.683, cy: 0.740, x1: 0.653, y1: 0.700, x2: 0.713, y2: 0.780 },
      { id: 'b1', color: 'blue',   cx: 0.153, cy: 0.464, x1: 0.123, y1: 0.424, x2: 0.183, y2: 0.504 },
      { id: 'b2', color: 'blue',   cx: 0.226, cy: 0.576, x1: 0.196, y1: 0.536, x2: 0.256, y2: 0.616 },
      { id: 'b3', color: 'blue',   cx: 0.746, cy: 0.461, x1: 0.716, y1: 0.421, x2: 0.776, y2: 0.501 },
      { id: 'b4', color: 'blue',   cx: 0.812, cy: 0.475, x1: 0.782, y1: 0.435, x2: 0.842, y2: 0.515 },
      { id: 'b5', color: 'blue',   cx: 0.875, cy: 0.461, x1: 0.845, y1: 0.421, x2: 0.905, y2: 0.501 },
      { id: 'b6', color: 'blue',   cx: 0.944, cy: 0.481, x1: 0.914, y1: 0.441, x2: 0.974, y2: 0.521 }
    ],
    correctZones: { green: ['g1','g2','g3','g4'], orange: ['o1','o2','o3'] },
    maxAttempts: 2, hintAlwaysEnabled: false,
    hint: { title: 'تلميح', body: 'ابحثوا عن النقاط التي تكون فيها قراءة الوزن أعلى من المعتاد، وعن النقاط التي تكون فيها أقل من المعتاد‎.' },
    feedbackCorrect:        { title: 'ممتاز‎!',           body: 'عندما يتسارع قطار الملاهي، تتغير القوة التي تعمل على الجسم، ولذلك يشعر الجسم أحيانًا بأنه "أثقل" وأحيانًا بأنه "أخف". يقيس الوزن هذه القوة، ولذلك تتغير قراءة الوزن أيضًا أثناء الطريق.' },
    feedbackIncorrectFirst: { title: 'الإجابة غير صحيحة.', body: 'هل نحاول مرة أخرى؟' },
    feedbackIncorrectFinal: { title: 'الإجابة غير صحيحة.',  body: 'عندما يتسارع قطار الملاهي، تتغير القوة التي تعمل على الجسم، ولذلك يشعر الجسم أحيانًا بأنه "أثقل" وأحيانًا بأنه "أخف". يقيس الوزن هذه القوة، ولذلك تتغير قراءة الوزن أيضًا أثناء الطريق.' }
  },

  /* ── Screen 39: TransitionScreen — שאלת השיא ────────────────────── */
  39: {
    type: 'transition',
    suptitle: 'كل الاحترام! انتهت مرحلة التمرين‎.',
    bigtitle: 'والآن يأتي السؤال الأكبر',
    subtitle: 'يحتوي السؤال على 3 بنود. عليكم الإجابة عنها جميعًا بشكل صحيح.',
    bubble: 'إذا لم تنجحوا في الإجابة عن بعض الأسئلة، فمن المهم أن تفهموا ما الذي لا يزال غير واضح، وأن تتوجهوا إلى الدردشة أو إلى المعلّم للحصول على شرح إضافي.',
    char: 'assets/img/char-orange-reminder-opt.png',
    continueBtnText: 'يمكن البدء!'
  },

  /* ── Screen 40: SCQImage — שאלת שיא סעיף א׳ ─────────────────────── */
  40: {
    type: 'scqImg',
    optionsContainerId: 's38-options', questionId: 's38-question',
    contextId: 's38-context', context: 'في درس العلوم، أحضرت المعلمة إلى الصف بعض عبوات الغذاء من السوبرماركت‎.',
    checkBtnId: 's38-check-btn', continueBtnId: 's38-continue-btn',
    hintBtnId: 's38-hint-btn', hintOverlayId: 's38-hint-overlay',
    hintTitleId: 's38-hint-title', hintBodyId: 's38-hint-body',
    feedbackId: 's38-feedback', fbTitleId: 's38-fb-title', fbBodyId: 's38-fb-body',
    imageId: 's38-img', imageSrc: 'assets/img/ingredients-opt.png',
    question: 'أ. أي معلومة غير دقيقة من الناحية العلمية تظهر على ملصقات المنتجات؟',
    options: [
      'الأرقام غير صحيحة. المنتجات لا تزن المقدار المكتوب عليها‎ فعلًا.',
      'الوحدات غير موحّدة. يجب كتابة جميعها بالغرام أو جميعها بالكيلوغرام‎.',
      'تظهر على الملصقات الـ 3 عبارة "الوزن الصافي"، لكن الغرام والكيلوغرام وحدتان تصفان الكتلة‎.',
      'ينقص ملصق إضافي يعرض الكتلة‎.'
    ],
    correctAnswer: 'تظهر على الملصقات الـ 3 عبارة "الوزن الصافي"، لكن الغرام والكيلوغرام وحدتان تصفان الكتلة‎.',
    maxAttempts: 2, hintAlwaysEnabled: false,
    hint: { title: 'تلميح', body: 'فكروا في الفرق بين ما هو متّبع وشائع في الكلام وما هو دقيق علميًا. هل الغرام والكيلوغرام وحدتان تصفان الوزن؟' },
    feedbackCorrect:        { title: 'ممتاز‎!',           body: 'גרם וק"ג הן יחידות של מסה. לכן, הניסוח המדעי המדויק על כל שלוש התוויות צריך להיות "מסה נקיה" ולא "משקל נקי".\nבשפת היומיום אומרים "الوزن", אך מתכוונים ל"الكتلة", לכן הניסוח הזה מופיע על כל אריזה בסופרמרקט. אבל מבחינה מדעית, זה לא מדויק.' },
    feedbackIncorrectFirst: { title: 'الإجابة غير صحيحة.', body: 'هل نحاول مرة أخرى؟' },
    feedbackIncorrectFinal: { title: 'الإجابة غير صحيحة.', body: 'גרם וק"ג הן יחידות של מסה. לכן, הניסוח המדעי המדויק על כל שלוש התוויות צריך להיות "מסה נקיה" ולא "משקל נקי".\nבשפת היומיום אומרים "الوزن", אך מתכוונים ל"الكتلة", לכן הניסוח הזה מופיע על כל אריזה בסופרמרקט. אבל מבחינה מדעית, זה לא מדויק.' }
  },

  /* ── Screen 41: SAQ — שאלת שיא סעיף ב׳ ──────────────────────────── */
  41: {
    type: 'saq',
    contextId: 's39-context', context: 'تخيّلوا أنه تم أخذ العبوات الثلاث وإرسالها إلى محطة فضاء في الفضاء البعيد، حيث قوة الجاذبية هناك هي صفر (معلومة لغرض السؤال)‎.',
    questionId: 's39-question', question: 'ب. اختاروا لكل ادّعاء: صحيح أم غير صحيح‎.',
    statementsId: 's39-statements',
    imageId: 's39-img', imageSrc: 'assets/img/ingredients-opt.png',
    checkBtnId: 's39-check-btn', continueBtnId: 's39-continue-btn',
    hintBtnId: 's39-hint-btn', hintOverlayId: 's39-hint-overlay',
    hintTitleId: 's39-hint-title', hintBodyId: 's39-hint-body',
    feedbackId: 's39-feedback', fbTitleId: 's39-fb-title', fbBodyId: 's39-fb-body',
    statements: [
      { id: 'stmt1', text: 'في محطة الفضاء، ستكون كتلة لوح الشوكولاتة أقل من 45 غرام.', correct: 'غير صحيح' },
      { id: 'stmt2', text: 'في محطة الفضاء، سينخفض وزن المنتجات.', correct: 'صحيح' }
    ],
    maxAttempts: 1, hintAlwaysEnabled: true,
    hint: { title: 'تلميح', body: 'فكروا في كل بند: هل ستحدّث عن الكتلة أم الوزن؟ وبناءً على ذلك حدّدوا ما إذا كانت الجملة صحيحة أم غير صحيحة‎.' },
    feedbackCorrect:        { title: 'ممتاز‎!',           body: '1. לא נכון - מסה היא כמות החומר, ולא תלויה בכבידה. 45 גרם ישארו 45 גרם בכל מקום ביקום.\n2. נכון – המשקל משתנה כתלות בכוח הכבידה, לכן בתחנת החלל הוא יקטן.' },
    feedbackIncorrectFirst: { title: 'الإجابة غير صحيحة.',  body: '1. לא נכון - מסה היא כמות החומר, ולא תלויה בכבידה. 45 גרם ישארו 45 גרם בכל מקום ביקום.\n2. נכון - המשקל משתנה כתלות בכוח הכבידה, לכן בתחנת החלל הוא יקטן.' },
    feedbackIncorrectFinal: { title: 'الإجابة غير صحيحة.',  body: '1. לא נכון - מסה היא כמות החומר, ולא תלויה בכבידה. 45 גרם ישארו 45 גרם בכל מקום ביקום.\n2. נכון - המשקל משתנה כתלות בכוח הכבידה, לכן בתחנת החלל הוא יקטן.' }
  },

  /* ── Screen 42: SCQImage — שאלת שיא סעיף ג׳ ─────────────────────── */
  42: {
    type: 'scqImg',
    optionsContainerId: 's40-options', questionId: 's40-question',
    contextId: 's40-context', context: 'تعلمنا أن الموازين الرقمية تقيس الوزن (القوة)، وليس الكتلة‎.',
    checkBtnId: 's40-check-btn', continueBtnId: 's40-continue-btn',
    hintBtnId: 's40-hint-btn', hintOverlayId: 's40-hint-overlay',
    hintTitleId: 's40-hint-title', hintBodyId: 's40-hint-body',
    feedbackId: 's40-feedback', fbTitleId: 's40-fb-title', fbBodyId: 's40-fb-body',
    imageId: 's40-img', imageSrc: 'assets/img/flour-opt.png',
    question: 'ت. إذا كان الأمر كذلك، فلماذا يكون الرقم الظاهر على الشاشة مساويًا لكتلة المنتج؟',
    options: [
      'لأن الموازين الرقمية تقيس القوة والكتلة في نفس الوقت‎.',
      'لأنه تمّت معايرة الموازين بحيث تعرض الوزن بوحدات قياس الكتلة‎.',
      'لأن الغرام وحدة قياس مناسبة للكتلة والوزن أيضًا.',
      'لأن الشركة المصنعة تضبط الميزان مسبقًا لعرض الكتلة‎.'
    ],
    correctAnswer: 'لأنه تمّت معايرة الموازين بحيث تعرض الوزن بوحدات قياس الكتلة‎.',
    maxAttempts: 2, hintAlwaysEnabled: false,
    hint: { title: 'تلميح', body: 'فكروا: إذا كانت الموازين الرقمية تقيس الوزن (القوة)، فما الذي يمكّنها من عرض الوزن بنفس القيمة التي تمثل الكتلة؟\nما الذي يميّز الموازين الرقمية بحيث يجعل ذلك ممكنًا؟' },
    feedbackCorrect:        { title: 'ممتاز‎!',           body: 'الموازين الرقمية تقيس الوزن (القوة)\nوتتم معايرتها بحيث تقسم القوة\nعلى قيمة الجاذبية على الكرة الأرضية (9.8).\nوالنتيجة هي الكتلة،\nلذلك تعرض الشاشة القيمة بوحدة الغرام‎.' },
    feedbackIncorrectFirst: { title: 'الإجابة غير صحيحة.', body: 'هل نحاول مرة أخرى؟' },
    feedbackIncorrectFinal: { title: 'الإجابة غير صحيحة.',  body: 'الموازين الرقمية تقيس الوزن (القوة)\nوتتم معايرتها بحيث تقسم القوة\nعلى قيمة الجاذبية على الكرة الأرضية (9.8).\nوالنتيجة هي الكتلة،\nلذلك تعرض الشاشة القيمة بوحدة الغرام‎.' }
  },


};

/* ── Runtime state (per screen) ───────────────────────────────────── */
const genScqState = {
  24: { selected: -1, attempts: 0, done: false, correct: false, hintEnabled: true },
  26: { selected: -1, attempts: 0, done: false, correct: false, hintEnabled: true },
  28: { selected: -1, attempts: 0, done: false, correct: false, hintEnabled: false },
  33: { selected: -1, attempts: 0, done: false, correct: false, hintEnabled: false },
  36: { selected: -1, attempts: 0, done: false, correct: false, hintEnabled: false },
  37: { selected: -1, attempts: 0, done: false, correct: false, hintEnabled: false },
  40: { selected: -1, attempts: 0, done: false, correct: false, hintEnabled: false },
  42: { selected: -1, attempts: 0, done: false, correct: false, hintEnabled: false },
  45: { selected: -1, attempts: 0, done: false, correct: false, hintEnabled: false },
  50: { selected: -1, attempts: 0, done: false, correct: false, hintEnabled: false }
};
const genDdqState = {
  25: { attempts: 0, done: false }
};
const saqState = {
  41: { answers: {}, attempts: 0, done: false, correct: false }
};

/* ── Shared SVG icons ─────────────────────────────────────────────── */
const BASIC_SVG_CHECK = '<svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4.5L4.5 8L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const BASIC_SVG_CROSS = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L9 9M9 1L1 9" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>';

/* ── Generic SCQ Engine ───────────────────────────────────────────── */

function scqGenEnter(sid) {
  // Inject text from config (for dynamically-configured screens)
  const cfg = window.GEN_DATA[sid];
  if (cfg) {
    if (cfg.question) {
      const qEl = document.getElementById(cfg.questionId);
      if (qEl) qEl.innerHTML = cfg.question.replace(/\n/g, '<br>');
    }
    if (cfg.recapId && cfg.recap) {
      const rEl = document.getElementById(cfg.recapId);
      if (rEl) rEl.textContent = cfg.recap;
    }
    if (cfg.options) {
      const optContainer = document.getElementById(cfg.optionsContainerId);
      if (optContainer) {
        const optBtns = optContainer.querySelectorAll('.s11-option');
        cfg.options.forEach((txt, i) => {
          if (optBtns[i]) {
            const textEl = optBtns[i].querySelector('.s11-option-text');
            if (textEl) textEl.textContent = txt;
          }
        });
      }
    }
    if (cfg.hint) {
      const htEl = cfg.hintTitleId ? document.getElementById(cfg.hintTitleId) : null;
      const hbEl = cfg.hintBodyId  ? document.getElementById(cfg.hintBodyId)  : null;
      if (htEl) htEl.textContent = cfg.hint.title;
      if (hbEl) hbEl.innerHTML   = cfg.hint.body.replace(/\n/g, '<br>');
    }
    if (cfg.contextId && cfg.context) {
      const ctxEl = document.getElementById(cfg.contextId);
      if (ctxEl) ctxEl.innerHTML = cfg.context.replace(/\n/g, '<br>');
    }
    if (cfg.imageId && cfg.imageSrc) {
      const imgEl = document.getElementById(cfg.imageId);
      if (imgEl) imgEl.src = cfg.imageSrc;
    }
  }

  const state = genScqState[sid];
  if (cfg.hintOverlayId) document.getElementById(cfg.hintOverlayId).style.display = 'none';
  document.getElementById(cfg.feedbackId).style.display    = 'none';
  const qEl  = document.getElementById(cfg.questionId);
  const opts = Array.from(document.querySelectorAll('#' + cfg.optionsContainerId + ' .s11-option'));
  if (state.done) {
    scqGenRestoreStates(sid, opts);
    document.getElementById(cfg.checkBtnId).style.display    = 'none';
    if (cfg.hintBtnId) document.getElementById(cfg.hintBtnId).style.display = 'none';
    document.getElementById(cfg.continueBtnId).style.display = '';
    return;
  }
  state.selected = -1;
  document.getElementById(cfg.checkBtnId).style.display    = '';
  document.getElementById(cfg.checkBtnId).disabled         = true;
  if (cfg.hintBtnId) {
    document.getElementById(cfg.hintBtnId).style.display = '';
    document.getElementById(cfg.hintBtnId).disabled      = !state.hintEnabled;
  }
  document.getElementById(cfg.continueBtnId).style.display = 'none';
  opts.forEach(el => {
    el.classList.remove('is-selected', 'is-correct', 'is-incorrect', 'is-visible');
    const radio = el.querySelector('.s11-radio');
    if (radio) radio.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    const icon  = el.querySelector('.s11-radio-icon');
    if (icon)  icon.innerHTML = '';
  });
  qEl && qEl.classList.remove('is-visible');
  const headingEl = cfg.recapId ? document.getElementById(cfg.recapId) : null;
  if (headingEl) headingEl.classList.remove('is-visible');
  const contextEl = cfg.contextId ? document.getElementById(cfg.contextId) : null;
  if (contextEl) contextEl.classList.remove('is-visible');
  const imgEl = cfg.imageId ? document.getElementById(cfg.imageId) : null;
  if (imgEl) imgEl.classList.remove('is-visible');
  // Canonical entrance order: heading/recap -> context -> question -> image
  // -> answer options (staggered one-by-one, always last, never before the
  // supporting text/media it belongs to).
  const leadEls = [headingEl, contextEl, qEl].filter(Boolean);
  leadEls.forEach((el, i) => setTimeout(() => el.classList.add('is-visible'), i * 400));
  const imgDelay = leadEls.length * 400 + 200;
  if (imgEl) setTimeout(() => imgEl.classList.add('is-visible'), imgDelay);
  const optsStart = imgEl ? imgDelay + 500 : Math.max(1000, leadEls.length * 400 + 200);
  opts.forEach((el, i) => setTimeout(() => el.classList.add('is-visible'), optsStart + i * 200));
}

function scqGenRestoreStates(sid, opts) {
  const cfg   = window.GEN_DATA[sid];
  const state = genScqState[sid];
  opts.forEach(el => {
    el.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    el.classList.add('is-visible');
    const radio = el.querySelector('.s11-radio');
    if (radio) radio.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    const icon  = el.querySelector('.s11-radio-icon');
    if (icon)  icon.innerHTML = '';
  });
  if (state.correct) {
    const el    = opts[state.selected];
    const radio = el && el.querySelector('.s11-radio');
    const icon  = el && el.querySelector('.s11-radio-icon');
    if (el)    el.classList.add('is-correct');
    if (radio) radio.classList.add('is-correct');
    if (icon)  icon.innerHTML = BASIC_SVG_CHECK;
  } else {
    const selEl    = opts[state.selected];
    const selRadio = selEl && selEl.querySelector('.s11-radio');
    const selIcon  = selEl && selEl.querySelector('.s11-radio-icon');
    if (selEl)    selEl.classList.add('is-incorrect');
    if (selRadio) selRadio.classList.add('is-incorrect');
    if (selIcon)  selIcon.innerHTML = BASIC_SVG_CROSS;
    const correctIdx = cfg.options.indexOf(cfg.correctAnswer);
    if (correctIdx >= 0 && correctIdx !== state.selected) {
      const cEl    = opts[correctIdx];
      const cRadio = cEl && cEl.querySelector('.s11-radio');
      const cIcon  = cEl && cEl.querySelector('.s11-radio-icon');
      if (cEl)    cEl.classList.add('is-correct');
      if (cRadio) cRadio.classList.add('is-correct');
      if (cIcon)  cIcon.innerHTML = BASIC_SVG_CHECK;
    }
  }
}

function scqGenSelect(sid, idx) {
  const cfg   = window.GEN_DATA[sid];
  const state = genScqState[sid];
  if (!state || state.done) return;
  document.getElementById(cfg.feedbackId).style.display = 'none';
  state.selected = idx;
  const opts = Array.from(document.querySelectorAll('#' + cfg.optionsContainerId + ' .s11-option'));
  opts.forEach((el, i) => {
    const isThis = (i === idx);
    el.classList.toggle('is-selected', isThis);
    const radio = el.querySelector('.s11-radio');
    if (radio) radio.classList.toggle('is-selected', isThis);
    const icon  = el.querySelector('.s11-radio-icon');
    if (icon)  icon.innerHTML = '';
  });
  document.getElementById(cfg.checkBtnId).style.display = '';
  document.getElementById(cfg.checkBtnId).disabled = false;
}

function scqGenCheck(sid) {
  const cfg   = window.GEN_DATA[sid];
  const state = genScqState[sid];
  if (!state || state.selected < 0 || state.done) return;
  state.attempts++;
  const isCorrect = cfg.options[state.selected] === cfg.correctAnswer;
  const opts      = Array.from(document.querySelectorAll('#' + cfg.optionsContainerId + ' .s11-option'));

  if (isCorrect) {
    state.done = true; state.correct = true;
    const el    = opts[state.selected];
    const radio = el && el.querySelector('.s11-radio');
    const icon  = el && el.querySelector('.s11-radio-icon');
    el.classList.remove('is-selected'); el.classList.add('is-correct');
    if (radio) { radio.classList.remove('is-selected'); radio.classList.add('is-correct'); }
    if (icon)  icon.innerHTML = BASIC_SVG_CHECK;
    scqGenShowFeedback(sid, cfg.feedbackCorrect, true);
    document.getElementById(cfg.checkBtnId).style.display    = 'none';
    if (cfg.hintBtnId) document.getElementById(cfg.hintBtnId).style.display = 'none';
    document.getElementById(cfg.continueBtnId).style.display = '';

  } else if (state.attempts >= cfg.maxAttempts) {
    state.done = true; state.correct = false;
    const selEl    = opts[state.selected];
    const selRadio = selEl && selEl.querySelector('.s11-radio');
    const selIcon  = selEl && selEl.querySelector('.s11-radio-icon');
    selEl.classList.remove('is-selected'); selEl.classList.add('is-incorrect');
    if (selRadio) { selRadio.classList.remove('is-selected'); selRadio.classList.add('is-incorrect'); }
    if (selIcon)  selIcon.innerHTML = BASIC_SVG_CROSS;
    const correctIdx = cfg.options.indexOf(cfg.correctAnswer);
    if (correctIdx >= 0 && correctIdx !== state.selected) {
      const cEl    = opts[correctIdx];
      const cRadio = cEl && cEl.querySelector('.s11-radio');
      const cIcon  = cEl && cEl.querySelector('.s11-radio-icon');
      if (cEl)    cEl.classList.add('is-correct');
      if (cRadio) cRadio.classList.add('is-correct');
      if (cIcon)  cIcon.innerHTML = BASIC_SVG_CHECK;
    }
    scqGenShowFeedback(sid, cfg.feedbackIncorrectFinal, false);
    document.getElementById(cfg.checkBtnId).style.display    = 'none';
    if (cfg.hintBtnId) document.getElementById(cfg.hintBtnId).style.display = 'none';
    document.getElementById(cfg.continueBtnId).style.display = '';

  } else {
    state.hintEnabled = true;
    const selEl    = opts[state.selected];
    const selRadio = selEl && selEl.querySelector('.s11-radio');
    selEl.classList.remove('is-selected');
    if (selRadio) selRadio.classList.remove('is-selected');
    scqGenShowFeedback(sid, cfg.feedbackIncorrectFirst, false);
    document.getElementById(cfg.checkBtnId).disabled = true;
    if (cfg.hintBtnId) document.getElementById(cfg.hintBtnId).disabled = false;
  }
}

function scqGenShowFeedback(sid, fbCfg, isCorrect) {
  const cfg = window.GEN_DATA[sid];
  const fb  = document.getElementById(cfg.feedbackId);
  fb.className = 's11-feedback ' + (isCorrect ? 'is-correct' : 'is-incorrect');
  document.getElementById(cfg.fbTitleId).textContent = fbCfg.title;
  document.getElementById(cfg.fbBodyId).innerHTML    = fbCfg.body.replace(/\n/g, '<br>');
  fb.style.display = '';
}

function scqGenCloseFeedback(sid) {
  const cfg   = window.GEN_DATA[sid];
  const state = genScqState[sid];
  document.getElementById(cfg.feedbackId).style.display = 'none';
  if (!state.done) {
    const opts = Array.from(document.querySelectorAll('#' + cfg.optionsContainerId + ' .s11-option'));
    opts.forEach(el => {
      el.classList.remove('is-selected');
      const radio = el.querySelector('.s11-radio');
      if (radio) radio.classList.remove('is-selected');
      const icon  = el.querySelector('.s11-radio-icon');
      if (icon)  icon.innerHTML = '';
    });
    state.selected = -1;
    document.getElementById(cfg.checkBtnId).style.display = '';
    document.getElementById(cfg.checkBtnId).disabled      = true;
  }
}

function scqGenOpenHint(sid)  { document.getElementById(window.GEN_DATA[sid].hintOverlayId).style.display = '';     }
function scqGenCloseHint(sid) { document.getElementById(window.GEN_DATA[sid].hintOverlayId).style.display = 'none'; }

/* ── Generic DDQ Engine ───────────────────────────────────────────── */

function ddqGenGetDD(cfg, itemId)  { return document.getElementById('dd-' + cfg.ddIdPrefix + '-' + itemId); }
function ddqGenGetVal(cfg, itemId) { const d = ddqGenGetDD(cfg, itemId); return d ? (d.dataset.value || '') : ''; }

function ddqGenCloseAll(sid) {
  const cfg = window.GEN_DATA[sid];
  cfg.items.forEach(item => {
    const dd = ddqGenGetDD(cfg, item.id);
    if (!dd) return;
    dd.classList.remove('is-open');
    const panel = dd.querySelector('.s17-dd-panel');
    if (panel) panel.style.display = 'none';
  });
}

function ddqGenToggle(sid, itemId) {
  const cfg    = window.GEN_DATA[sid];
  const dd     = ddqGenGetDD(cfg, itemId);
  if (!dd || dd.classList.contains('is-done')) return;
  const wasOpen = dd.classList.contains('is-open');
  ddqGenCloseAll(sid);
  if (!wasOpen) {
    dd.classList.add('is-open');
    const panel   = dd.querySelector('.s17-dd-panel');
    const headVal = panel && panel.querySelector('.s17-dd-panel-head .s17-dd-val');
    if (headVal) headVal.textContent = dd.dataset.value || '';
    if (panel)   panel.style.display = 'flex';
  }
}

function ddqGenPick(sid, itemId, value) {
  const cfg    = window.GEN_DATA[sid];
  const dd     = ddqGenGetDD(cfg, itemId);
  if (!dd) return;
  dd.dataset.value = value;
  const trigVal = dd.querySelector('.s17-dd-trigger .s17-dd-val');
  if (trigVal) trigVal.textContent = value;
  dd.classList.remove('is-open');
  const panel = dd.querySelector('.s17-dd-panel');
  if (panel) panel.style.display = 'none';
  ddqGenUpdateCheckBtn(sid);
}

function ddqGenUpdateCheckBtn(sid) {
  const cfg       = window.GEN_DATA[sid];
  const allFilled = cfg.items.every(item => ddqGenGetVal(cfg, item.id) !== '');
  document.getElementById(cfg.checkBtnId).style.display = '';
  document.getElementById(cfg.checkBtnId).disabled = !allFilled;
}

function ddqGenEnter(sid) {
  const cfg   = window.GEN_DATA[sid];
  const state = genDdqState[sid];
  document.getElementById(cfg.hintOverlayId).style.display = 'none';
  document.getElementById(cfg.feedbackId).style.display    = 'none';

  cfg.items.forEach(item => {
    const dd = ddqGenGetDD(cfg, item.id);
    if (!dd) return;
    dd.classList.remove('is-correct', 'is-incorrect', 'is-open', 'is-done');
    const panel   = dd.querySelector('.s17-dd-panel');
    const trigVal = dd.querySelector('.s17-dd-trigger .s17-dd-val');
    if (panel) panel.style.display = 'none';
    if (state.done) {
      dd.dataset.value = item.correct;
      if (trigVal) trigVal.textContent = item.correct;
      dd.classList.add('is-correct', 'is-done');
    } else {
      dd.dataset.value = '';
      if (trigVal) trigVal.textContent = '';
    }
  });

  if (state.done) {
    document.getElementById(cfg.checkBtnId).style.display    = 'none';
    document.getElementById(cfg.hintBtnId).style.display     = 'none';
    document.getElementById(cfg.continueBtnId).style.display = '';
  } else {
    document.getElementById(cfg.checkBtnId).style.display    = '';
    document.getElementById(cfg.checkBtnId).disabled         = true;
    document.getElementById(cfg.continueBtnId).style.display = 'none';
    document.getElementById(cfg.hintBtnId).disabled          = !cfg.hintAlwaysEnabled;
    ddqGenUpdateCheckBtn(sid);
  }
}

function ddqGenCheck(sid) {
  const cfg   = window.GEN_DATA[sid];
  const state = genDdqState[sid];
  if (state.done) return;
  ddqGenCloseAll(sid);
  state.attempts++;

  let allCorrect = true;
  cfg.items.forEach(item => {
    const dd = ddqGenGetDD(cfg, item.id);
    if (!dd) return;
    const isCorrect = ddqGenGetVal(cfg, item.id) === item.correct;
    dd.classList.remove('is-correct', 'is-incorrect');
    if (isCorrect) { dd.classList.add('is-correct', 'is-done'); }
    else           { dd.classList.add('is-incorrect'); allCorrect = false; }
  });

  if (allCorrect) {
    state.done = true;
    cfg.items.forEach(item => { const dd = ddqGenGetDD(cfg, item.id); if (dd) dd.classList.add('is-done'); });
    ddqGenShowFeedback(sid, cfg.feedbackCorrect, true);
    document.getElementById(cfg.checkBtnId).style.display    = 'none';
    document.getElementById(cfg.hintBtnId).style.display     = 'none';
    document.getElementById(cfg.continueBtnId).style.display = '';
  } else if (state.attempts >= cfg.maxAttempts) {
    state.done = true;
    cfg.items.forEach(item => {
      const dd = ddqGenGetDD(cfg, item.id);
      if (!dd) return;
      dd.dataset.value = item.correct;
      const trigVal = dd.querySelector('.s17-dd-trigger .s17-dd-val');
      if (trigVal) trigVal.textContent = item.correct;
      dd.classList.remove('is-incorrect');
      dd.classList.add('is-correct', 'is-done');
    });
    ddqGenShowFeedback(sid, cfg.feedbackIncorrect, false);
    document.getElementById(cfg.checkBtnId).style.display    = 'none';
    document.getElementById(cfg.hintBtnId).style.display     = 'none';
    document.getElementById(cfg.continueBtnId).style.display = '';
  } else {
    cfg.items.forEach(item => {
      const dd = ddqGenGetDD(cfg, item.id);
      if (dd && !dd.classList.contains('is-done')) {
        dd.dataset.value = '';
        const trigVal = dd.querySelector('.s17-dd-trigger .s17-dd-val');
        if (trigVal) trigVal.textContent = '';
        dd.classList.remove('is-incorrect');
      }
    });
    ddqGenShowFeedback(sid, cfg.feedbackIncorrect, false);
    document.getElementById(cfg.checkBtnId).disabled      = true;
  }
}

function ddqGenShowFeedback(sid, fbCfg, isCorrect) {
  const cfg = window.GEN_DATA[sid];
  const fb  = document.getElementById(cfg.feedbackId);
  fb.className = 's11-feedback ' + (isCorrect ? 'is-correct' : 'is-incorrect');
  document.getElementById(cfg.fbTitleId).textContent = fbCfg.title;
  document.getElementById(cfg.fbBodyId).innerHTML    = fbCfg.body.replace(/\n/g, '<br>');
  fb.style.display = '';
}

function ddqGenCloseFeedback(sid) {
  const cfg   = window.GEN_DATA[sid];
  const state = genDdqState[sid];
  document.getElementById(cfg.feedbackId).style.display = 'none';
  if (!state.done) {
    document.getElementById(cfg.checkBtnId).style.display = '';
    ddqGenUpdateCheckBtn(sid);
  }
}

function ddqGenOpenHint(sid)  { document.getElementById(window.GEN_DATA[sid].hintOverlayId).style.display = '';     }
function ddqGenCloseHint(sid) { document.getElementById(window.GEN_DATA[sid].hintOverlayId).style.display = 'none'; }

/* ── Generic VIQ Engine (fill-in-the-sentence) ────────────────────── */

const viqState = {};

function viqGenEnter(sid) {
  const cfg = window.GEN_DATA[sid];
  if (!viqState[sid]) viqState[sid] = { values: {}, attempts: 0, done: false };
  const state = viqState[sid];

  const qEl = document.getElementById(cfg.questionId);
  if (qEl && cfg.question) qEl.textContent = cfg.question;
  const ctxEl = cfg.contextId ? document.getElementById(cfg.contextId) : null;
  if (ctxEl && cfg.context) ctxEl.innerHTML = cfg.context.replace(/\n/g, '<br>');
  const subqEl = cfg.subqId ? document.getElementById(cfg.subqId) : null;
  if (subqEl && cfg.subquestion) subqEl.textContent = cfg.subquestion;
  const htEl = cfg.hintTitleId ? document.getElementById(cfg.hintTitleId) : null;
  const hbEl = cfg.hintBodyId  ? document.getElementById(cfg.hintBodyId)  : null;
  if (htEl && cfg.hint) htEl.textContent = cfg.hint.title;
  if (hbEl && cfg.hint) hbEl.innerHTML   = cfg.hint.body.replace(/\n/g, '<br>');

  viqGenRenderSentence(sid);

  const sentenceEl = document.getElementById(cfg.sentenceId);
  const animEls = [qEl, ctxEl, subqEl, sentenceEl].filter(Boolean);

  if (state.done) {
    animEls.forEach(el => el.classList.add('is-visible'));
    viqGenRestoreDone(sid);
    return;
  }

  state.values = {};
  state.attempts = 0;

  document.getElementById(cfg.checkBtnId).style.display    = '';
  document.getElementById(cfg.checkBtnId).disabled         = true;
  document.getElementById(cfg.continueBtnId).style.display = 'none';
  document.getElementById(cfg.feedbackId).style.display    = 'none';
  document.getElementById(cfg.hintOverlayId).style.display = 'none';
  const hintBtn = document.getElementById(cfg.hintBtnId);
  if (hintBtn) { hintBtn.style.display = ''; hintBtn.disabled = !cfg.hintAlwaysEnabled; }

  // Staged entrance: question -> context -> sub-question, each 400ms apart,
  // then the fill-in sentence/inputs (the interactive area) fades in last.
  animEls.forEach(el => el.classList.remove('is-visible'));
  const textEls = [qEl, ctxEl, subqEl].filter(Boolean);
  textEls.forEach((el, i) => setTimeout(() => el.classList.add('is-visible'), i * 400));
  if (sentenceEl) setTimeout(() => sentenceEl.classList.add('is-visible'), textEls.length * 400 + 200);
}

function viqGenRenderSentence(sid) {
  const cfg = window.GEN_DATA[sid];
  const container = document.getElementById(cfg.sentenceId);
  if (!container) return;
  container.innerHTML = '';

  const prefix = document.createElement('span');
  prefix.className = 'viq-prefix';
  prefix.textContent = cfg.sentencePrefix + ' ';
  container.appendChild(prefix);

  cfg.fields.forEach((field, i) => {
    if (i > 0 && field.separator) {
      const sep = document.createElement('span');
      sep.className = 'viq-sep';
      sep.textContent = ' ' + field.separator + ' ';
      container.appendChild(sep);
    }
    const input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
    input.id = field.inputId;
    input.className = 'viq-input';
    input.dir = 'ltr';
    input.placeholder = '?';
    input.oninput = () => {
      viqState[sid].values[field.id] = input.value.trim();
      viqGenUpdateCheckBtn(sid);
    };
    container.appendChild(input);

    const unit = document.createElement('span');
    unit.className = 'viq-unit';
    unit.textContent = ' ' + field.unit;
    container.appendChild(unit);
  });
}

function viqGenUpdateCheckBtn(sid) {
  const cfg = window.GEN_DATA[sid];
  const state = viqState[sid];
  const allFilled = cfg.fields.every(f => {
    const v = state.values[f.id];
    return v !== undefined && v !== '';
  });
  document.getElementById(cfg.checkBtnId).disabled = !allFilled;
}

function viqGenCheck(sid) {
  const cfg = window.GEN_DATA[sid];
  const state = viqState[sid];
  state.attempts++;

  const allCorrect = cfg.fields.every(f => {
    const userVal = parseFloat((state.values[f.id] || '').replace(',', '.'));
    const correctVal = parseFloat(String(f.correctValue));
    const tol = f.tolerance !== undefined ? f.tolerance : 0;
    return !isNaN(userVal) && Math.abs(userVal - correctVal) <= tol;
  });

  const fb = { title: '', body: '' };
  if (allCorrect) {
    state.done = true; state.correct = true;
    Object.assign(fb, cfg.feedbackCorrect);
    viqGenStyleInputs(sid, true);
    document.getElementById(cfg.checkBtnId).style.display    = 'none';
    document.getElementById(cfg.hintBtnId).style.display     = 'none';
    document.getElementById(cfg.continueBtnId).style.display = '';
  } else if (state.attempts >= cfg.maxAttempts) {
    state.done = true; state.correct = false;
    Object.assign(fb, cfg.feedbackIncorrectFinal);
    viqGenStyleInputsFinal(sid);
    document.getElementById(cfg.checkBtnId).style.display    = 'none';
    document.getElementById(cfg.hintBtnId).style.display     = 'none';
    document.getElementById(cfg.continueBtnId).style.display = '';
  } else {
    Object.assign(fb, cfg.feedbackIncorrectFirst);
    document.getElementById(cfg.checkBtnId).disabled = true;
    const hintBtn = document.getElementById(cfg.hintBtnId);
    if (hintBtn && !cfg.hintAlwaysEnabled) hintBtn.disabled = false;
  }

  const feedbackEl = document.getElementById(cfg.feedbackId);
  feedbackEl.className = 's11-feedback ' + (allCorrect ? 'is-correct' : 'is-incorrect');
  document.getElementById(cfg.fbTitleId).textContent = fb.title;
  document.getElementById(cfg.fbBodyId).innerHTML    = fb.body.replace(/\n/g, '<br>');
  feedbackEl.style.display = '';
}

function viqGenStyleInputs(sid, allCorrect) {
  const cfg = window.GEN_DATA[sid];
  cfg.fields.forEach(f => {
    const el = document.getElementById(f.inputId);
    if (!el) return;
    el.disabled = true;
    el.classList.add('is-correct');
  });
}

function viqGenStyleInputsFinal(sid) {
  const cfg = window.GEN_DATA[sid];
  const state = viqState[sid];
  cfg.fields.forEach(f => {
    const el = document.getElementById(f.inputId);
    if (!el) return;
    el.disabled = true;
    const userVal = parseFloat((state.values[f.id] || '').replace(',', '.'));
    const correctVal = parseFloat(String(f.correctValue));
    const tol = f.tolerance !== undefined ? f.tolerance : 0;
    if (!isNaN(userVal) && Math.abs(userVal - correctVal) <= tol) {
      el.classList.add('is-correct');
    } else {
      el.classList.add('is-incorrect');
      el.value = String(f.correctValue);
    }
  });
}

function viqGenRestoreDone(sid) {
  const cfg = window.GEN_DATA[sid];
  const state = viqState[sid];
  if (state.correct) {
    viqGenStyleInputs(sid, true);
  } else {
    viqGenStyleInputsFinal(sid);
  }
  document.getElementById(cfg.checkBtnId).style.display    = 'none';
  document.getElementById(cfg.hintBtnId).style.display     = 'none';
  document.getElementById(cfg.continueBtnId).style.display = '';
}

function viqGenCloseFeedback(sid) {
  const cfg = window.GEN_DATA[sid];
  const state = viqState[sid];
  document.getElementById(cfg.feedbackId).style.display = 'none';
  if (!state.done) {
    document.getElementById(cfg.checkBtnId).style.display = '';
    viqGenUpdateCheckBtn(sid);
  }
}

function viqGenOpenHint(sid)  { document.getElementById(window.GEN_DATA[sid].hintOverlayId).style.display = '';     }
function viqGenCloseHint(sid) { document.getElementById(window.GEN_DATA[sid].hintOverlayId).style.display = 'none'; }

/* ── Generic HSP Engine (hotspot / zone-click) ────────────────────── */

const hspState = {};

function hspGenEnter(sid) {
  const cfg = window.GEN_DATA[sid];
  if (!hspState[sid]) hspState[sid] = { selected: [], attempts: 0, done: false };
  const state = hspState[sid];

  const qEl = document.getElementById(cfg.questionId);
  if (qEl && cfg.question) qEl.innerHTML = cfg.question.replace(/\n/g, '<br>');
  const imgEl = document.getElementById(cfg.imageId);
  if (imgEl && cfg.imageSrc) imgEl.src = cfg.imageSrc;
  const htEl = cfg.hintTitleId ? document.getElementById(cfg.hintTitleId) : null;
  const hbEl = cfg.hintBodyId  ? document.getElementById(cfg.hintBodyId)  : null;
  if (htEl && cfg.hint) htEl.textContent = cfg.hint.title;
  if (hbEl && cfg.hint) hbEl.innerHTML   = cfg.hint.body.replace(/\n/g, '<br>');

  hspGenRenderLegend(sid);

  const graphRowEl = qEl ? qEl.parentElement.querySelector('.hsp-graph-row') : null;
  const textEls = qEl ? Array.from(qEl.querySelectorAll('.hsp-lead, .hsp-body, .hsp-q')) : [];

  if (state.done) {
    textEls.forEach(el => el.classList.add('is-visible'));
    if (graphRowEl) graphRowEl.classList.add('is-visible');
    hspGenRestoreDone(sid);
    return;
  }

  state.selected = [];
  state.attempts = 0;

  const overlay = document.getElementById(cfg.overlayId);
  overlay.innerHTML = '';
  overlay.onclick = (e) => hspGenClickOverlay(sid, e);
  hspGenRenderMarkers(sid);

  document.getElementById(cfg.checkBtnId).style.display    = '';
  document.getElementById(cfg.checkBtnId).disabled         = true;
  document.getElementById(cfg.continueBtnId).style.display = 'none';
  document.getElementById(cfg.feedbackId).style.display    = 'none';
  document.getElementById(cfg.hintOverlayId).style.display = 'none';
  const hintBtn = document.getElementById(cfg.hintBtnId);
  if (hintBtn) { hintBtn.style.display = ''; hintBtn.disabled = !cfg.hintAlwaysEnabled; }

  // Staged entrance: lead -> body -> question text, then the graph+legend
  // (media) fades in last, only after the text has finished.
  textEls.forEach(el => el.classList.remove('is-visible'));
  if (graphRowEl) graphRowEl.classList.remove('is-visible');
  textEls.forEach((el, i) => setTimeout(() => el.classList.add('is-visible'), i * 400));
  if (graphRowEl) setTimeout(() => graphRowEl.classList.add('is-visible'), textEls.length * 400 + 300);
}

function hspGenRenderLegend(sid) {
  const cfg = window.GEN_DATA[sid];
  const legendEl = document.getElementById(cfg.legendId);
  if (!legendEl) return;
  legendEl.innerHTML = '';
  cfg.markers.forEach(m => {
    const item = document.createElement('div');
    item.className = 'hsp-legend-item';
    const dot = document.createElement('span');
    dot.className = 'hsp-legend-dot hsp-legend-dot--' + m.color;
    const lbl = document.createElement('span');
    lbl.className = 'hsp-legend-label';
    lbl.textContent = m.label;
    item.appendChild(dot);
    item.appendChild(lbl);
    legendEl.appendChild(item);
  });
}

function hspGenClickOverlay(sid, e) {
  const cfg = window.GEN_DATA[sid];
  const state = hspState[sid];
  if (state.done) return;

  const overlay = document.getElementById(cfg.overlayId);
  const rect = overlay.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  const zone = hspGenFindZone(cfg, x, y);
  if (!zone) return;
  hspGenToggleZone(sid, zone.id);
}

function hspGenToggleZone(sid, zoneId) {
  const cfg = window.GEN_DATA[sid];
  const state = hspState[sid];
  if (state.done) return;
  if (state.selected.includes(zoneId)) {
    state.selected = state.selected.filter(id => id !== zoneId);
  } else if (state.selected.length < 2) {
    state.selected.push(zoneId);
  }
  hspGenRenderMarkers(sid);
  document.getElementById(cfg.checkBtnId).disabled = state.selected.length !== 2;
}

function hspGenFindZone(cfg, x, y) {
  for (const zone of cfg.zones) {
    if (x >= zone.x1 && x <= zone.x2 && y >= zone.y1 && y <= zone.y2) return zone;
  }
  return null;
}

/* Every candidate data point is rendered in its true color, matching the
   dot already baked into the graph image (green/orange/blue) — the overlay
   is a click target sitting exactly on top of the image's own dot, not a
   disguise. A selected dot gets a white ring; correct/incorrect colors are
   only applied after Check (hspGenColorMarkers), or as the full solution
   reveal on the final wrong attempt (hspGenShowCorrectZones). */
function hspGenRenderMarkers(sid) {
  const cfg = window.GEN_DATA[sid];
  const state = hspState[sid];
  const overlay = document.getElementById(cfg.overlayId);
  overlay.querySelectorAll('.hsp-marker').forEach(m => m.remove());

  cfg.zones.forEach(zone => {
    const isSelected = state.selected.includes(zone.id);
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hsp-marker hsp-marker--' + zone.color + (isSelected ? ' is-selected' : '');
    dot.style.left = (zone.cx * 100) + '%';
    dot.style.top  = (zone.cy * 100) + '%';
    dot.setAttribute('aria-label', isSelected ? 'إلغاء الاختيار' : 'اختيار هذه النقطة');
    dot.onclick = (e) => { e.stopPropagation(); hspGenToggleZone(sid, zone.id); };
    overlay.appendChild(dot);
  });
}

function hspGenCheck(sid) {
  const cfg = window.GEN_DATA[sid];
  const state = hspState[sid];
  if (state.selected.length !== 2) return;
  state.attempts++;

  const groupsPicked = state.selected.map(id => cfg.zones.find(z => z.id === id).color).sort();
  const allCorrect = groupsPicked[0] === 'green' && groupsPicked[1] === 'orange';

  const fb = { title: '', body: '' };
  if (allCorrect) {
    state.done = true; state.correct = true;
    hspGenColorMarkers(sid, true);
    Object.assign(fb, cfg.feedbackCorrect);
    document.getElementById(cfg.checkBtnId).style.display    = 'none';
    document.getElementById(cfg.hintBtnId).style.display     = 'none';
    document.getElementById(cfg.continueBtnId).style.display = '';
    document.getElementById(cfg.overlayId).onclick = null;
  } else if (state.attempts >= cfg.maxAttempts) {
    state.done = true; state.correct = false;
    Object.assign(fb, cfg.feedbackIncorrectFinal);
    document.getElementById(cfg.checkBtnId).style.display    = 'none';
    document.getElementById(cfg.hintBtnId).style.display     = 'none';
    document.getElementById(cfg.continueBtnId).style.display = '';
    document.getElementById(cfg.overlayId).onclick = null;
    hspGenShowCorrectZones(sid);
  } else {
    hspGenColorMarkers(sid, false);
    Object.assign(fb, cfg.feedbackIncorrectFirst);
    const hintBtn = document.getElementById(cfg.hintBtnId);
    if (hintBtn && !cfg.hintAlwaysEnabled) hintBtn.disabled = false;
  }

  const feedbackEl = document.getElementById(cfg.feedbackId);
  feedbackEl.className = 's11-feedback ' + (allCorrect ? 'is-correct' : 'is-incorrect');
  document.getElementById(cfg.fbTitleId).textContent = fb.title;
  document.getElementById(cfg.fbBodyId).innerHTML    = fb.body.replace(/\n/g, '<br>');
  feedbackEl.style.display = '';

  if (!allCorrect && state.attempts < cfg.maxAttempts) {
    // First wrong attempt: reset the picks so the learner can try again,
    // matching the SCQ engine's "clear selection on first wrong" convention.
    state.selected = [];
    hspGenRenderMarkers(sid);
    document.getElementById(cfg.checkBtnId).disabled = true;
  }
}

/* Colors just the two selected dots (green = correct pick, red = wrong
   pick) — the other candidate dots stay in their true (green/orange/blue)
   color. */
function hspGenColorMarkers(sid, correct) {
  const overlay = document.getElementById(window.GEN_DATA[sid].overlayId);
  overlay.querySelectorAll('.hsp-marker.is-selected').forEach(el => {
    el.classList.remove('hsp-marker--green', 'hsp-marker--orange', 'hsp-marker--blue');
    el.classList.add(correct ? 'hsp-marker--correct' : 'hsp-marker--incorrect');
  });
}

/* Full solution reveal (after the final wrong attempt / on restore): every
   candidate dot is colored by its true group; the two the learner actually
   picked get a ring so they can see what they chose relative to the
   solution. */
function hspGenShowCorrectZones(sid) {
  const cfg = window.GEN_DATA[sid];
  const state = hspState[sid];
  const overlay = document.getElementById(cfg.overlayId);
  overlay.querySelectorAll('.hsp-marker').forEach(m => m.remove());
  cfg.zones.forEach(zone => {
    const wasPicked = state.selected.includes(zone.id);
    const dot = document.createElement('div');
    dot.className = 'hsp-marker hsp-marker--reveal-' + zone.color + (wasPicked ? ' is-selected' : '');
    dot.style.left = (zone.cx * 100) + '%';
    dot.style.top  = (zone.cy * 100) + '%';
    overlay.appendChild(dot);
  });
}

function hspGenRestoreDone(sid) {
  const cfg = window.GEN_DATA[sid];
  const state = hspState[sid];
  document.getElementById(cfg.overlayId).onclick = null;
  if (state.correct) {
    hspGenRenderMarkers(sid);
    hspGenColorMarkers(sid, true);
  } else {
    hspGenShowCorrectZones(sid);
  }
  document.getElementById(cfg.checkBtnId).style.display    = 'none';
  document.getElementById(cfg.hintBtnId).style.display     = 'none';
  document.getElementById(cfg.continueBtnId).style.display = '';
}

function hspGenCloseFeedback(sid) {
  const cfg = window.GEN_DATA[sid];
  const state = hspState[sid];
  document.getElementById(cfg.feedbackId).style.display = 'none';
  if (!state.done) {
    document.getElementById(cfg.checkBtnId).style.display = '';
  }
}

function hspGenOpenHint(sid)  { document.getElementById(window.GEN_DATA[sid].hintOverlayId).style.display = '';     }
function hspGenCloseHint(sid) { document.getElementById(window.GEN_DATA[sid].hintOverlayId).style.display = 'none'; }

/* ── Thin enter wrappers ──────────────────────────────────────────── */
function enterScreen23() { scqGenEnter(24); }
let s26qTimers = [];
function enterScreen24() {
  ddqGenEnter(25);
  // Staged entrance: "התאימו בין..." first, then each matching row
  // individually (one-by-one), so the interactive area visibly builds up
  // instead of appearing as one block.
  s26qTimers.forEach(clearTimeout);
  s26qTimers = [];
  const s26qQuestionEl = document.getElementById('s26q-question');
  const s26qRowEls     = Array.from(document.querySelectorAll('#s26q-rows .s17-cell'));
  if (genDdqState[25].done) {
    if (s26qQuestionEl) s26qQuestionEl.classList.add('is-visible');
    s26qRowEls.forEach(el => el.classList.add('is-visible'));
    return;
  }
  if (s26qQuestionEl) s26qQuestionEl.classList.remove('is-visible');
  s26qRowEls.forEach(el => el.classList.remove('is-visible'));
  if (s26qQuestionEl) s26qTimers.push(setTimeout(() => s26qQuestionEl.classList.add('is-visible'), 0));
  s26qRowEls.forEach((el, i) => s26qTimers.push(setTimeout(() => el.classList.add('is-visible'), 1000 + i * 250)));
}
function enterScreen25() { scqGenEnter(26); }
/* ── End Basic Practice ───────────────────────────────────────────── */

/* ════════════════════════════════════════════════════════════════════
   STANDARD B — Transition + SCQ Q2 of 2 (screens 27–28)
   All texts live in window.GEN_DATA above.
   Logic reuses generic scqGen* engine — zero duplication.
   ════════════════════════════════════════════════════════════════════ */

/* ── Screen 27: TransitionScreen — תרגול סטנדרטי ב' ─────────────── */
let s24Timers = [];
let s24Seen = false;

function enterScreen26() {
  s24Timers.forEach(clearTimeout); s24Timers = [];

  const els = [
    document.getElementById('s25-suptitle'),
    document.getElementById('s25-bigtitle'),
    document.getElementById('s25-bubble'),
    document.getElementById('s25-char'),
  ];
  const btn = document.getElementById('s25-continue');

  if (s24Seen) {
    els.forEach(el => el && el.classList.add('is-visible'));
    btn.disabled = false;
    return;
  }
  s24Seen = true;

  els.forEach(el => el && el.classList.remove('is-visible'));
  btn.disabled = true;

  const delays = [0, 1000, 2000, 3000];
  delays.forEach((delay, i) => {
    s24Timers.push(setTimeout(() => {
      if (els[i]) els[i].classList.add('is-visible');
    }, delay));
  });
  s24Timers.push(setTimeout(() => { btn.disabled = false; }, 3600));
}

/* ── Screen 28: Standard B Q2/2 ──────────────────────────────────── */
let s29qTimers = [];
function enterScreen27() {
  scqGenEnter(28);
  s29qTimers.forEach(clearTimeout);
  s29qTimers = [];
  const quoteEl    = document.getElementById('s26-quote');
  const followupEl = document.getElementById('s26-followup');
  const imgEl      = document.getElementById('s26-img');
  if (genScqState[28].done) {
    if (quoteEl)    quoteEl.classList.add('is-visible');
    if (followupEl) followupEl.classList.add('is-visible');
    if (imgEl)      imgEl.classList.add('is-visible');
    return;
  }
  // scqGenEnter already staggers the question slot (0ms) then the 4 options
  // (120/220/320/420ms) via its own uncancelable timers; the question slot is
  // now split into these two spans, and the image is layered on top so the
  // full order reads: blue quote -> black question -> options -> image last.
  if (quoteEl)    quoteEl.classList.remove('is-visible');
  if (followupEl) followupEl.classList.remove('is-visible');
  if (imgEl)      imgEl.classList.remove('is-visible');
  s29qTimers.push(setTimeout(() => quoteEl    && quoteEl.classList.add('is-visible'), 0));
  s29qTimers.push(setTimeout(() => followupEl && followupEl.classList.add('is-visible'), 500));
  s29qTimers.push(setTimeout(() => imgEl && imgEl.classList.add('is-visible'), 2000));
}
function enterScreen45() {
  scqGenEnter(45);
  // Scoped post-process: insert the required line breaks into each distractor
  // without touching scqGenEnter's shared (textContent-based) option renderer.
  var optTextEls = document.querySelectorAll('#s46-options .s11-option-text');
  var breaks = [
    ['לאנרגיית תנועה (אנרגיה קינטית)', 'לאנרגיית תנועה<br>(אנרגיה קינטית)'],
    ['על האצן, ולכן מסתו',              'על האצן,<br>ולכן מסתו'],
    ['מים (כזיעה שהתאדתה) ופחמן',        'מים (כזיעה שהתאדתה)<br>ופחמן'],
    ['והתכווצה בגלל המאמץ',              'והתכווצה<br>בגלל המאמץ']
  ];
  optTextEls.forEach(function(el, i) {
    var pair = breaks[i];
    if (pair) el.innerHTML = el.textContent.replace(pair[0], pair[1]);
  });
}
/* ── End Standard B ───────────────────────────────────────────────── */

/* ════════════════════════════════════════════════════════════════════
   CLASS TASK — Transition + Instructions + Reflection Form (29–31)
   All texts live in window.GEN_DATA above.
   ════════════════════════════════════════════════════════════════════ */

/* ── Screen 29: TransitionScreen — משימת כיתה ──────────────────── */
let s26Timers = [];
let s26Seen = false;

function enterScreen28() {
  s26Timers.forEach(clearTimeout); s26Timers = [];
  const cfg = window.GEN_DATA[29];

  const els = [
    document.getElementById('s27-suptitle'),
    document.getElementById('s27-bigtitle'),
    document.getElementById('s27-subtitle'),
    document.getElementById('s27-bubble'),
    document.getElementById('s27-char'),
  ];
  const btn = document.getElementById('s27-continue');

  if (s26Seen) {
    // Text stays put; the character keeps running via goTo()'s video resume
    // instead of reloading .src (which would restart it from frame 0).
    els.forEach(el => el && el.classList.add('is-visible'));
    btn.disabled = false;
    return;
  }
  s26Seen = true;

  document.getElementById('s27-suptitle').textContent    = cfg.suptitle;
  document.getElementById('s27-bigtitle').textContent    = cfg.bigtitle;
  document.getElementById('s27-subtitle').textContent    = cfg.subtitle;
  document.getElementById('s27-bubble-text').textContent = cfg.bubble;
  document.getElementById('s27-char').src                = cfg.char;
  document.getElementById('s27-char').play().catch(() => {});
  document.getElementById('s27-continue').textContent    = cfg.continueBtnText;

  els.forEach(el => el && el.classList.remove('is-visible'));
  btn.disabled = true;

  const delays = [0, 220, 420, 650, 950];
  delays.forEach((delay, i) => {
    s26Timers.push(setTimeout(() => { if (els[i]) els[i].classList.add('is-visible'); }, delay));
  });
  s26Timers.push(setTimeout(() => { btn.disabled = false; }, 1250));
}

/* ── Screen 30: Class Task Instructions ─────────────────────────── */
let s28Timers = [];
function enterScreen29() {
  s28Timers.forEach(clearTimeout); s28Timers = [];
  const cfg = window.GEN_DATA[30];

  document.getElementById(cfg.titleId).textContent    = cfg.title;
  document.getElementById(cfg.subtitleId).textContent = cfg.subtitle;
  document.getElementById(cfg.continueBtnId).textContent = cfg.continueBtnText;

  const stepsEl = document.getElementById(cfg.stepsId);
  stepsEl.innerHTML = '';
  cfg.steps.forEach((text, i) => {
    const li = document.createElement('li');
    li.className = 's28-step s28-anim';
    li.innerHTML =
      `<span class="s28-step-num">${i + 1}</span>` +
      `<span class="s28-step-text">${text}</span>`;
    stepsEl.appendChild(li);
  });

  // Staged entrance: title -> subtitle -> each step individually.
  const titleEl    = document.getElementById(cfg.titleId);
  const subtitleEl = document.getElementById(cfg.subtitleId);
  const stepEls    = Array.from(stepsEl.children);
  const els        = [titleEl, subtitleEl, ...stepEls];
  const btn        = document.getElementById(cfg.continueBtnId);

  els.forEach(el => el && el.classList.remove('is-visible'));
  btn.disabled = true;

  const delays = els.map((_, i) => i * 380);
  delays.forEach((delay, i) => {
    s28Timers.push(setTimeout(() => { if (els[i]) els[i].classList.add('is-visible'); }, delay));
  });
  s28Timers.push(setTimeout(() => { btn.disabled = false; }, delays[delays.length - 1] + 400));
}

// Script slide 93: "ذكّروني بتجربة غاليليو" — always-on popup button,
// recaps the Screen 21 Galileo story (slide 94 content).
function openGalileoReminder()  { document.getElementById('s31-reminder-popup').style.display = ''; }
function closeGalileoReminder() { document.getElementById('s31-reminder-popup').style.display = 'none'; }

/* ── Screen 47: Class Task wrap-up — scientific tools (script slide 99) ──
   Reverted to the blue instructions-card render pattern (same as
   enterScreen29() for screen 30) — populates title/body text inside the
   card plus the character gif, instead of a speech bubble. suptitle and
   subtitle are unused here (always empty strings in GEN_DATA[46]). */
let s47Timers = [];
let s47Seen = false;
function enterScreen46() {
  s47Timers.forEach(clearTimeout); s47Timers = [];
  const cfg = window.GEN_DATA[46];

  // Staged entrance, in order: character -> card -> "مهمّة صفيّة" title -> task content.
  const els = [
    document.getElementById('s47-char'),
    document.getElementById('s47-card'),
    document.getElementById('s47-card-header'),
    document.getElementById('s47-bubble-text'),
  ];
  const btn = document.getElementById('s47-continue');

  if (s47Seen) {
    els.forEach(el => el && el.classList.add('is-visible'));
    btn.disabled = false;
    return;
  }
  s47Seen = true;

  document.getElementById('s47-bigtitle').textContent    = cfg.bigtitle;
  document.getElementById('s47-bubble-text').textContent = cfg.bubble;
  document.getElementById('s47-char').src                = cfg.char;
  document.getElementById('s47-char').play().catch(() => {});
  document.getElementById('s47-continue').textContent    = cfg.continueBtnText;

  btn.disabled = true;
  els.forEach(el => el && el.classList.remove('is-visible'));
  const delays = els.map((_, i) => i * 400);
  delays.forEach((delay, i) => {
    s47Timers.push(setTimeout(() => { if (els[i]) els[i].classList.add('is-visible'); }, delay));
  });
  s47Timers.push(setTimeout(() => { btn.disabled = false; }, delays[delays.length - 1] + 400));
}

/* ── Screen 31: Class Task Reflection Form ───────────────────────── */
/* Generic ctqGen engine — reusable for any future class task form.
   Supports field types: text | textarea | yesNo                      */

const ctqState = {};

let s29FormTimers = [];
function enterScreen30() {
  s29FormTimers.forEach(clearTimeout); s29FormTimers = [];
  const sid = 31;
  const cfg = window.GEN_DATA[sid];

  ctqState[sid] = { values: {} };

  document.getElementById(cfg.titleId).textContent       = cfg.title;
  document.getElementById(cfg.feedbackTextId).textContent = cfg.feedbackText;
  document.getElementById(cfg.charId).src                 = cfg.char;
  document.getElementById(cfg.charId).play().catch(() => {});
  document.getElementById(cfg.continueBtnId).textContent  = cfg.continueBtnText;

  const fieldsEl = document.getElementById(cfg.fieldsId);
  fieldsEl.innerHTML = '';
  cfg.fields.forEach(f => fieldsEl.appendChild(ctqGenRenderField(sid, f)));

  document.getElementById(cfg.feedbackId).style.display = 'none';
  document.getElementById(cfg.continueBtnId).disabled   = true;

  // Staged entrance: title first, then all field cards together as one group.
  const titleEl = document.getElementById(cfg.titleId);
  titleEl.classList.remove('is-visible');
  fieldsEl.classList.remove('is-visible');
  s29FormTimers.push(setTimeout(() => titleEl.classList.add('is-visible'), 0));
  s29FormTimers.push(setTimeout(() => fieldsEl.classList.add('is-visible'), 420));
}

function ctqGenRenderField(sid, field) {
  const cfg = window.GEN_DATA[sid];
  const div = document.createElement('div');
  div.className = 's29-field';

  const label = document.createElement('p');
  label.className = 's29-label';
  label.textContent = field.label;
  div.appendChild(label);

  if (field.type === 'text') {
    const input = document.createElement('input');
    input.type        = 'text';
    input.className   = 's29-input';
    input.placeholder = field.placeholder || '';
    input.dir         = 'rtl';
    input.oninput = () => {
      ctqState[sid].values[field.id] = input.value.trim();
      ctqGenUpdateState(sid);
    };
    div.appendChild(input);

  } else if (field.type === 'textarea') {
    const ta = document.createElement('textarea');
    ta.className   = 's29-textarea';
    ta.placeholder = field.placeholder || '';
    ta.rows        = 3;
    ta.dir         = 'rtl';
    ta.oninput = () => {
      ctqState[sid].values[field.id] = ta.value.trim();
      ctqGenUpdateState(sid);
    };
    div.appendChild(ta);

  } else if (field.type === 'yesNo') {
    const wrap = document.createElement('div');
    wrap.className = 's29-yesno';
    (field.options || ['نعم', 'لا']).forEach(opt => {
      const btn = document.createElement('button');
      btn.className   = 's29-yesno-btn';
      btn.textContent = opt;
      btn.type        = 'button';
      btn.onclick = () => {
        wrap.querySelectorAll('.s29-yesno-btn').forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        ctqState[sid].values[field.id] = opt;
        ctqGenUpdateState(sid);
      };
      wrap.appendChild(btn);
    });
    div.appendChild(wrap);
  }

  return div;
}

function ctqGenUpdateState(sid) {
  const cfg      = window.GEN_DATA[sid];
  const state    = ctqState[sid];
  const allFilled = cfg.fields.every(f => {
    const v = state.values[f.id];
    return v !== undefined && v !== '';
  });

  document.getElementById(cfg.feedbackId).style.display = allFilled ? '' : 'none';
  document.getElementById(cfg.continueBtnId).disabled   = !allFilled;
}
/* ── End Class Task ───────────────────────────────────────────────── */

/* ════════════════════════════════════════════════════════════════════
   ADVANCED QUESTIONS — Screens 32–38
   ════════════════════════════════════════════════════════════════════ */

let s29Timers = [];
let s29Seen = false;
function enterScreen31() {
  s29Timers.forEach(clearTimeout); s29Timers = [];
  const cfg = window.GEN_DATA[32];
  const els = ['s30-suptitle','s30-bigtitle','s30-subtitle','s30-bubble','s30-char'].map(id => document.getElementById(id));
  const btn = document.getElementById('s30-continue');

  if (s29Seen) {
    els.forEach(el => el && el.classList.add('is-visible'));
    btn.disabled = false;
    return;
  }
  s29Seen = true;

  document.getElementById('s30-suptitle').textContent    = cfg.suptitle;
  document.getElementById('s30-bigtitle').textContent    = cfg.bigtitle;
  document.getElementById('s30-subtitle').textContent    = cfg.subtitle;
  document.getElementById('s30-bubble-text').textContent = cfg.bubble;
  document.getElementById('s30-char').src                = cfg.char;
  document.getElementById('s30-char').play().catch(() => {});
  document.getElementById('s30-continue').textContent    = cfg.continueBtnText;
  document.getElementById('s30-bubble').style.display    = cfg.bubble ? '' : 'none';
  els.forEach(el => el && el.classList.remove('is-visible'));
  btn.disabled = true;
  const delays = [0, 220, 420, 650, 950];
  delays.forEach((delay, i) => s29Timers.push(setTimeout(() => els[i] && els[i].classList.add('is-visible'), delay)));
  s29Timers.push(setTimeout(() => { btn.disabled = false; }, 1250));
}
let sAdvGuideTimers = [];
function enterScreenAdvGuide() {
  sAdvGuideTimers.forEach(clearTimeout); sAdvGuideTimers = [];
  // Staged entrance: heading -> para1 -> para2 -> para3 -> applet -> para4.
  const els = [
    document.getElementById('sAdvGuide-heading'),
    document.getElementById('sAdvGuide-p1'),
    document.getElementById('sAdvGuide-p2'),
    document.getElementById('sAdvGuide-p3'),
    document.getElementById('galileo-applet-container'),
    document.getElementById('sAdvGuide-p4'),
  ];
  const btn = document.getElementById('sAdvGuide-continue');
  els.forEach(el => el && el.classList.remove('is-visible'));
  btn.disabled = true;
  const delays = els.map((_, i) => i * 220);
  delays.forEach((delay, i) => {
    sAdvGuideTimers.push(setTimeout(() => { if (els[i]) els[i].classList.add('is-visible'); }, delay));
  });
  sAdvGuideTimers.push(setTimeout(() => { btn.disabled = false; }, delays[delays.length - 1] + 400));
}
function enterScreen32() { scqGenEnter(33); }
function enterScreen33b() { scqGenEnter(50); }
function enterScreen33() { viqGenEnter(34); }
// Screen 41 (Advanced Q3, farmer/rice): the shared scqGenEnter() fades the
// whole question paragraph in as one block, and the image has no entrance
// gating at all. This screen's required reveal order — blue heading, plain
// text, bold question, THEN answers, THEN the farmer image — needs each
// part staggered individually and the image held back until the last
// option is visible. Handled here as a screen-local addition on top of the
// generic engine (not a change to scqGenEnter itself, which other screens
// rely on for a single-block question fade).
let s37ExtraTimers = [];
function enterScreen35() {
  scqGenEnter(36);
  s37ExtraTimers.forEach(clearTimeout);
  s37ExtraTimers = [];

  const spans = ['.q41-lead', '.q41-body', '.q41-question']
    .map(sel => document.querySelector('[data-screen="41"] ' + sel))
    .filter(Boolean);
  const img = document.getElementById('s34-img');

  if (genScqState[36].done) {
    spans.forEach(el => el.classList.add('is-visible'));
    if (img) img.classList.add('is-visible');
    return;
  }

  spans.forEach(el => el.classList.remove('is-visible'));
  if (img) img.classList.remove('is-visible');

  spans.forEach((el, i) => {
    s37ExtraTimers.push(setTimeout(() => el.classList.add('is-visible'), i * 400));
  });
  if (img) {
    const optCount = window.GEN_DATA[36].options.length;
    const imgDelay = 1000 + (optCount - 1) * 200 + 700; // a clear pause after the last option finishes revealing, so the image doesn't read as simultaneous with the placeholder
    s37ExtraTimers.push(setTimeout(() => img.classList.add('is-visible'), imgDelay));
  }
}
function enterScreen36() { scqGenEnter(37); }
function enterScreen37() { hspGenEnter(38); }
/* ── End Advanced Questions ────────────────────────────────────────── */

/* ════════════════════════════════════════════════════════════════════
   SAQ ENGINE — StatementAssessmentQuestion (שאלת נכון/לא נכון)
   ════════════════════════════════════════════════════════════════════ */

function saqGenEnter(sid) {
  const cfg   = window.GEN_DATA[sid];
  const state = saqState[sid];

  // Inject text from config
  if (cfg.contextId && cfg.context) {
    const el = document.getElementById(cfg.contextId);
    if (el) el.innerHTML = cfg.context.replace(/\n/g, '<br>');
  }
  if (cfg.questionId && cfg.question) {
    const el = document.getElementById(cfg.questionId);
    if (el) el.textContent = cfg.question;
  }
  if (cfg.hint) {
    const htEl = cfg.hintTitleId ? document.getElementById(cfg.hintTitleId) : null;
    const hbEl = cfg.hintBodyId  ? document.getElementById(cfg.hintBodyId)  : null;
    if (htEl) htEl.textContent = cfg.hint.title;
    if (hbEl) hbEl.innerHTML   = cfg.hint.body.replace(/\n/g, '<br>');
  }
  if (cfg.imageId && cfg.imageSrc) {
    const imgEl = document.getElementById(cfg.imageId);
    if (imgEl) imgEl.src = cfg.imageSrc;
  }

  document.getElementById(cfg.hintOverlayId).style.display = 'none';
  document.getElementById(cfg.feedbackId).style.display    = 'none';

  const ctxEl = cfg.contextId  ? document.getElementById(cfg.contextId)  : null;
  const qEl   = cfg.questionId ? document.getElementById(cfg.questionId) : null;
  const imgEl = cfg.imageId    ? document.getElementById(cfg.imageId)    : null;
  const leadEls = [ctxEl, qEl].filter(Boolean);

  if (state.done) {
    saqGenRenderStatements(sid, true);
    leadEls.forEach(el => el.classList.add('is-visible'));
    if (imgEl) imgEl.classList.add('is-visible');
    Array.from(document.getElementById(cfg.statementsId).children).forEach(el => el.classList.add('is-visible'));
    document.getElementById(cfg.checkBtnId).style.display    = 'none';
    document.getElementById(cfg.hintBtnId).style.display     = 'none';
    document.getElementById(cfg.continueBtnId).style.display = '';
    return;
  }

  state.answers = {};
  saqGenRenderStatements(sid, false);

  document.getElementById(cfg.checkBtnId).style.display    = '';
  document.getElementById(cfg.checkBtnId).disabled         = true;
  document.getElementById(cfg.hintBtnId).style.display     = '';
  document.getElementById(cfg.hintBtnId).disabled          = !cfg.hintAlwaysEnabled;
  document.getElementById(cfg.continueBtnId).style.display = 'none';

  // Staged entrance: context -> question, then the image (media), then each
  // true/false statement row staggered one-by-one (interactive area last).
  leadEls.forEach(el => el.classList.remove('is-visible'));
  if (imgEl) imgEl.classList.remove('is-visible');
  leadEls.forEach((el, i) => setTimeout(() => el.classList.add('is-visible'), i * 400));
  const imgDelay = leadEls.length * 400 + 200;
  if (imgEl) setTimeout(() => imgEl.classList.add('is-visible'), imgDelay);
  const stmtEls = Array.from(document.getElementById(cfg.statementsId).children);
  const stmtStart = imgEl ? imgDelay + 500 : leadEls.length * 400 + 200;
  stmtEls.forEach((el, i) => setTimeout(() => el.classList.add('is-visible'), stmtStart + i * 250));
}

function saqGenRenderStatements(sid, restoreDone) {
  const cfg       = window.GEN_DATA[sid];
  const state     = saqState[sid];
  const container = document.getElementById(cfg.statementsId);
  if (!container) return;
  container.innerHTML = '';
  cfg.statements.forEach(stmt => {
    const row = document.createElement('div');
    row.className = 'saq-stmt';
    row.id = 's' + sid + '-' + stmt.id;

    const textEl = document.createElement('div');
    textEl.className = 'saq-stmt-text';
    textEl.textContent = stmt.text;

    const btns = document.createElement('div');
    btns.className = 'saq-stmt-btns';

    ['صحيح', 'غير صحيح'].forEach(val => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'saq-btn';
      btn.dataset.val = val;
      btn.textContent = val;
      if (!restoreDone) {
        btn.onclick = () => saqGenSelect(sid, stmt.id, val);
      } else {
        btn.disabled = true;
        const given = state.answers[stmt.id];
        const isStmtCorrect = given === stmt.correct;
        if (btn.dataset.val === given) {
          btn.classList.add(isStmtCorrect ? 'is-correct' : 'is-incorrect');
        }
        if (btn.dataset.val === stmt.correct && !isStmtCorrect) {
          btn.classList.add('is-correct');
        }
      }
      btns.appendChild(btn);
    });

    row.appendChild(textEl);
    row.appendChild(btns);
    container.appendChild(row);
  });
}

function saqGenSelect(sid, stmtId, val) {
  const cfg   = window.GEN_DATA[sid];
  const state = saqState[sid];
  if (state.done) return;
  document.getElementById(cfg.feedbackId).style.display = 'none';
  state.answers[stmtId] = val;

  const stmtEl = document.getElementById('s' + sid + '-' + stmtId);
  if (stmtEl) {
    stmtEl.querySelectorAll('.saq-btn').forEach(btn => {
      btn.classList.toggle('is-selected', btn.dataset.val === val);
    });
  }

  const allAnswered = cfg.statements.every(s => state.answers[s.id] !== undefined);
  document.getElementById(cfg.checkBtnId).disabled = !allAnswered;
}

function saqGenCheck(sid) {
  const cfg   = window.GEN_DATA[sid];
  const state = saqState[sid];
  if (state.done) return;
  state.attempts++;

  const isCorrect = cfg.statements.every(s => state.answers[s.id] === s.correct);
  state.done    = true;
  state.correct = isCorrect;

  cfg.statements.forEach(stmt => {
    const stmtEl = document.getElementById('s' + sid + '-' + stmt.id);
    if (!stmtEl) return;
    const given         = state.answers[stmt.id];
    const isStmtCorrect = given === stmt.correct;
    stmtEl.querySelectorAll('.saq-btn').forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.val === given) {
        btn.classList.remove('is-selected');
        btn.classList.add(isStmtCorrect ? 'is-correct' : 'is-incorrect');
      }
      if (btn.dataset.val === stmt.correct && !isStmtCorrect) {
        btn.classList.add('is-correct');
      }
    });
  });

  const fbCfg = isCorrect ? cfg.feedbackCorrect : cfg.feedbackIncorrectFinal;
  const fb    = document.getElementById(cfg.feedbackId);
  fb.className = 's11-feedback ' + (isCorrect ? 'is-correct' : 'is-incorrect');
  document.getElementById(cfg.fbTitleId).textContent = fbCfg.title;
  document.getElementById(cfg.fbBodyId).innerHTML    = fbCfg.body.replace(/\n/g, '<br>');
  fb.style.display = '';

  document.getElementById(cfg.checkBtnId).style.display    = 'none';
  document.getElementById(cfg.hintBtnId).style.display     = 'none';
  document.getElementById(cfg.continueBtnId).style.display = '';
}

function saqGenOpenHint(sid) {
  document.getElementById(window.GEN_DATA[sid].hintOverlayId).style.display = '';
}
function saqGenCloseHint(sid) {
  document.getElementById(window.GEN_DATA[sid].hintOverlayId).style.display = 'none';
}
/* ── End SAQ Engine ────────────────────────────────────────────────── */

/* ════════════════════════════════════════════════════════════════════
   PEAK QUESTION — Screens 39–44
   ════════════════════════════════════════════════════════════════════ */

function routeAfterPeak() {
  const c1 = genScqState[40] && genScqState[40].correct;
  const c2 = saqState[41]    && saqState[41].correct;
  const c3 = genScqState[42] && genScqState[42].correct;
  const count = (c1 ? 1 : 0) + (c2 ? 1 : 0) + (c3 ? 1 : 0);
  window.lomdaState.peakSections = count;
  goTo(count === 3 ? SCREEN_PEAK_SUCCESS : SCREEN_PEAK_FAIL);
}

let s36Timers = [];
let s36Seen = false;
function enterScreen38() {
  s36Timers.forEach(clearTimeout); s36Timers = [];
  const cfg = window.GEN_DATA[39];
  const els = ['s37-suptitle','s37-bigtitle','s37-subtitle','s37-bubble','s37-char'].map(id => document.getElementById(id));
  const btn = document.getElementById('s37-continue');

  if (s36Seen) {
    els.forEach(el => el && el.classList.add('is-visible'));
    btn.disabled = false;
    return;
  }
  s36Seen = true;

  document.getElementById('s37-suptitle').textContent    = cfg.suptitle;
  document.getElementById('s37-bigtitle').textContent    = cfg.bigtitle;
  document.getElementById('s37-subtitle').textContent    = cfg.subtitle;
  document.getElementById('s37-bubble-text').textContent = cfg.bubble;
  document.getElementById('s37-char').src                = cfg.char;
  document.getElementById('s37-char').play().catch(() => {});
  document.getElementById('s37-continue').textContent    = cfg.continueBtnText;
  els.forEach(el => el && el.classList.remove('is-visible'));
  btn.disabled = true;
  const delays = [0, 220, 420, 650, 950];
  delays.forEach((delay, i) => s36Timers.push(setTimeout(() => els[i] && els[i].classList.add('is-visible'), delay)));
  s36Timers.push(setTimeout(() => { btn.disabled = false; }, 1250));
}

function enterScreen39() { scqGenEnter(40); }
function enterScreen40() { saqGenEnter(41); }
function enterScreen41() { scqGenEnter(42); }

/* ── End Peak Question ─────────────────────────────────────────────── */

/* ── IMAGE ZOOM MODAL — global shared component ─────────────────── */
/* Spec: _global-components.md → "Image zoom"                        */
(function() {
  var modal = null;
  var stage = null;

  function openZoom(src, alt) {
    if (!modal) {
      modal = document.getElementById('img-zoom-modal');
      stage = modal.querySelector('.img-zoom-stage');
    }
    stage.innerHTML = '';
    var img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    stage.appendChild(img);
    modal.classList.remove('hidden');
  }

  function closeZoom() {
    if (!modal) modal = document.getElementById('img-zoom-modal');
    modal.classList.add('hidden');
    if (stage) stage.innerHTML = '';
  }

  // Delegated click handler — any [data-zoom-src] or [data-zoom-from] opens, any [data-zoom-close] closes
  document.addEventListener('click', function(e) {
    var zoomBtn = e.target.closest('[data-zoom-src], [data-zoom-from]');
    if (zoomBtn) {
      var src = zoomBtn.dataset.zoomSrc || '';
      var alt = zoomBtn.dataset.zoomAlt || '';
      // data-zoom-from: read src from a sibling/nearby img by ID at click time
      if (zoomBtn.dataset.zoomFrom) {
        var refImg = document.getElementById(zoomBtn.dataset.zoomFrom);
        if (refImg) { src = refImg.src; alt = refImg.alt || alt; }
      }
      if (src) openZoom(src, alt);
      return;
    }
    if (e.target.closest('[data-zoom-close]')) { closeZoom(); return; }
  });

  // Escape key closes
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeZoom();
  });
})();
/* ── End Image Zoom ─────────────────────────────────────────────── */

/* ── Initial screen state ─────────────────────────────────────────
   goTo() calls resetScreenState() on every navigation, but the first
   screen is never navigated to — it's already .active in the HTML.
   Without this, screen 0's entrance staging (added for the "מסה, משקל"
   intro) would never run and its button would stay disabled forever. */
resetScreenState(currentScreen);


/* ── COMPONENT NAVIGATION — added during 6-component split ── */
/* The part's LAST click (screen 14, #s13-continue-btn). It reports the component and stops: the
   platform opens the next component (ADDING-REPORTING-AND-RESUME.md §6.5, §8.12). The hop to
   part 02 survives only for a local walkthrough under ?dev=1 (DEV_NAV, unit-js/10-identity.js).
   Result: teaching component, no score (docs/REPORT-XAPI.md §4). */
function goToNextComponent() {
  xapiEndComponent({ success: true }, document.getElementById('s13-continue-btn'));
  if (DEV_NAV) window.location.href = '../methodica-ar-science-mass-weight-01-02/index.html' + window.location.search;
}

/* Deep-link support: #screen=N (or legacy #screen-N) jumps to screen N on load, if present in this component. */
(function () {
  var m = /^#screen[=-](\d+)$/.exec(window.location.hash);   // '#screen=N' (720 guide) or legacy '#screen-N'
  if (m) {
    var target = Number(m[1]);
    if (document.querySelector('[data-screen="' + target + '"]')) goTo(target);
  }
})();

/* ═══════════════════ xAPI (720) — per-part configuration ═══════════════════
   Data only, read by the shared layer at CALL time (unit-js/20-xapi.js, 50-loader.js).
   SCREEN_TO_SUBCONTENT: own data-screen -> ['NNN' item suffix, page within the item]; null = no
   catalogue item. Keys are this part's GLOBAL data-screen numbers — exactly the set unit-manifest.js
   gives this part (asserted by _test/verify-report.js). Verified against metadata/ and each screen:
   docs/REPORT-XAPI.md §3. Keep it a literal with numeric keys and quoted suffixes, ending "\n};". */
var SCREEN_TO_SUBCONTENT = {
   0: null,         /* opening transition */
   1: ['001', 1],   /* hook question */
   2: ['001', 2],   /* hook wrap-up card */
   3: ['002', 1],   /* learning-path choice */
   4: ['003', 1],   /* video path (YouTube) — own item since the split (2026-10-27) */
   5: ['004', 1],   /* text path (accordion) — own item since the split (2026-10-27) */
   6: ['005', 1],   /* hotspot: Earth */
   7: ['005', 2],   /* hotspot: Moon */
   8: ['005', 3],   /* open question (ungraded) */
   9: ['006', 1],   /* knowledge summary */
  10: ['006', 2],   /* carousel: two scale types */
  11: ['007', 1],   /* drag-and-drop table */
  12: null,         /* transition to warm-ups */
  13: ['008', 1],   /* warm-up 1: dropdowns */
  14: ['009', 1]    /* warm-up 2: single choice */
};
var XAPI_COMP_SLUG = 'methodica-ar-science-mass-weight-01-01';
var XAPI_COMP_ID   = XAPI_ID_PREFIX + XAPI_COMP_SLUG + '/';
/* Items whose questions are graded in code (their item 'completed' waits for an 'answered'). */
var XAPI_EVAL_ITEMS = { '001': 1, '007': 1, '008': 1, '009': 1 };
/* The s3 learning-path choice ('selected', learning-type — unit-js/20-xapi.js xapiSelectedLearningType):
   lomdaState.acquisitionPath -> the path's item and its catalogue mediaFormat (the statement's response). */
var XAPI_LEARNING_PATHS = { video: { item: '003', mediaFormat: 'video' }, text: { item: '004', mediaFormat: 'text' } };
/* B-2 hub (monday 13454123722, 2026-11-13): the text screen's toggle to the video (s5SwitchMode, 5 -> 4) is a path
   switch, not a Back, so it still closes the text item 004 (unit-js/20-xapi.js _xapiIsBackward). No Back button leads
   to screen 4 (both paths go back to the choice, screen 3). */
var XAPI_HUB_SCREENS = { 4: 1 };
var XAPI_METADATA_FILE = '../metadata/methodica-ar-science-mass-weight-01-01.json';
/* The part's last button (D-8: restoreEndedButton keeps it disabled once the ledger says done). */
var XAPI_END_BTN = 's13-continue-btn';

/* ═══════════════════ Resume (720) — the four per-part hooks ═══════════════════
   ADDING-REPORTING-AND-RESUME.md §8.7. Design for this unit (docs/RESUME.md):
   the screens' own enter functions already repaint an answered screen from its variables — that
   is how returning to a screen within one visit works — and reset only the PENDING selection of
   an unanswered one. So the payload carries the COMMITTED state (done, correct, attempts, the last
   wrong answer for the Retry gate, the "View My Answer" snapshot, gates, scores), never pending
   picks; applyResumeVars puts it back; goTo() -> resetScreenState() paints; and restoreScreenUI
   re-runs the landing screen's enter only during a restore, after applyResumeDom has put back the
   values that live in the DOM. A resumed screen therefore looks exactly like returning to it.
   Rules kept: idempotent, no side effects beyond the variables, never report (guide §8.8). */
function _rsClone(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }
function _rsRestoreXq(st) { if (st && st.xq) Object.keys(st.xq).forEach(function (k) { XAPI_Q_RESULTS[k] = st.xq[k]; }); }
/* Only during applyExecutionState: normal navigation already ran the enter function in goTo(). */
function restoreScreenUI(n) {
  if (typeof _restoring === 'undefined' || !_restoring) return;
  resetScreenState(n);
}
/* The drag table is committed at "هل إجابتي صحيحة؟" (reported then), but only marked done at "הצג פתרון".
   A reload between the two clicks must not reopen the question (that would send a second answered),
   so the payload records the committed form — exactly what ddq12ShowSolution would store. */
function _rsDdq12Committed() {
  if (ddq12Checked && !ddq12Done) {
    var full = Object.keys(DDQ12.correct).every(function (k) { return ddq12State[k] === DDQ12.correct[k]; });
    return { done: true, answer: full ? null : _rsClone(ddq12State) };
  }
  return { done: ddq12Done, answer: _rsClone(ddq12Answer) };
}
/* Item split (2026-10-27, QA/2026-10-26): old item 002 (choice + both paths) became 002 choice /
   003 video / 004 text, and old 003–007 moved to 005–009. State saved before that carries the old
   suffixes, in the payload (xq) and in the document's ledgers (hints '<item>/<qKey>', doneItems
   '<slug>#<item>'). _rsRenumberItems translates them once; `ids` marks a payload as already current.
   Old 002 stays 002 — the learner did pass the choice. */
var RS_ITEM_IDS = 2;
var RS_ITEM_RENUMBER = { '003': '005', '004': '006', '005': '007', '006': '008', '007': '009' };
function _rsRenumberKeys(map, re) {
  if (!map) return map;
  var out = {};
  Object.keys(map).forEach(function (k) {
    out[k.replace(re, function (all, pre, item, post) { return pre + (RS_ITEM_RENUMBER[item] || item) + post; })] = map[k];
  });
  return out;
}
function _rsRenumberItems(st) {
  if (st.ids === RS_ITEM_IDS) return;
  st.xq = _rsRenumberKeys(st.xq, /^()(\d{3})(\/.*)$/);
  if (typeof _unitState !== 'undefined' && _unitState) {
    _unitState.hints = _rsRenumberKeys(_unitState.hints, /^()(\d{3})(\/.*)$/);
    _unitState.doneItems = _rsRenumberKeys(_unitState.doneItems, /^(.*#)(\d{3})()$/);
  }
  st.ids = RS_ITEM_IDS;
}
function capturePartPayload() {
  function v(id) { var e = document.getElementById(id); return e ? e.value : ''; }
  return {
    ids: RS_ITEM_IDS,
    currentScreen: currentScreen,
    xq: _rsClone(XAPI_Q_RESULTS),
    path: window.lomdaState.acquisitionPath,
    qr: _rsClone(window.lomdaState.questionResults),
    hook: { sel: hookSelected, answered: hookAnswered, done: hookDone },
    gates: { video: videoWatched, earth: s6EarthRevealed, moon: s7MoonRevealed },
    hoq: { submitted: hoqSubmitted, masa: v('s8-masa-input'), mishkal: v('s8-mishkal-input') },
    ddq12: _rsDdq12Committed(),
    ddrop14: { done: ddrop14Done, correct: ddrop14Correct, vals: _rsClone(ddrop14Vals), answer: _rsClone(ddrop14Answer) },
    scq15: { sel: scq15Done ? scq15Selected : -1, att: scq15Attempts, done: scq15Done, correct: scq15Correct, lw: scq15LastWrong }
  };
}
function applyResumeVars(st) {
  if (!st) return;
  _rsRenumberItems(st);
  _rsRestoreXq(st);
  if ('path' in st) window.lomdaState.acquisitionPath = st.path;
  if (st.qr) window.lomdaState.questionResults = Object.assign({}, st.qr);
  if (st.hook) { hookAnswered = !!st.hook.answered; hookDone = !!st.hook.done; hookSelected = st.hook.answered ? st.hook.sel : null; }
  if (st.gates) { videoWatched = !!st.gates.video; s6EarthRevealed = !!st.gates.earth; s7MoonRevealed = !!st.gates.moon; }
  if (st.hoq) hoqSubmitted = !!st.hoq.submitted;
  if (st.ddq12) {
    ddq12Done = !!st.ddq12.done;
    ddq12Answer = _rsClone(st.ddq12.answer);
    ddq12Checked = ddq12Done;
    if (ddq12Done) ddq12State = Object.assign({}, DDQ12.correct);
  }
  if (st.ddrop14) {
    ddrop14Done = !!st.ddrop14.done; ddrop14Correct = !!st.ddrop14.correct; ddrop14Answer = _rsClone(st.ddrop14.answer);
    if (ddrop14Done && st.ddrop14.vals) ddrop14Vals = st.ddrop14.vals.slice();
  }
  if (st.scq15) {
    var q = st.scq15;
    scq15Attempts = q.att || 0; scq15Done = !!q.done; scq15Correct = !!q.correct; scq15LastWrong = (q.lw == null ? -1 : q.lw);
    scq15Selected = q.done ? q.sel : -1;
  }
}
function applyResumeDom(st) {
  if (st && st.hoq) {
    var m = document.getElementById('s8-masa-input'), w = document.getElementById('s8-mishkal-input');
    if (m) m.value = st.hoq.masa || '';
    if (w) w.value = st.hoq.mishkal || '';
  }
}

