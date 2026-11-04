# xAPI reporting — methodica-science-mass-weight-01

Design record for this unit's 720 reporting. The unit-agnostic procedure is
`2026/Documentation/reporting-and-resume/ADDING-REPORTING-AND-RESUME.md` (refreshed 2026-09-23);
this file records only what is specific to this unit.

## 1. Identity

| Level | Id | Source |
|---|---|---|
| Prefix | `https://lomdot.education.gov.il/metodica/720active/science/mass-weight/01/` | `metadata/*.json` |
| Unit | `methodica-science-mass-weight-01` — **bare slug** (MOE v2.5 §2.7) | `metadata/methodica-science-mass-weight-01_unit.json` `id` |
| Component | prefix + `methodica-science-mass-weight-01-0N/` | each component JSON `id` |
| Item | component id + `methodica-science-mass-weight-01-0N-NNN/` | `subContent[].id` |
| Question | item id + `qN` (no trailing slash) | `questions[].questionId` |

Catalogue flags that matter for reporting: component **03** has
`recommendedAfterFail: [component 02]` (the platform sends a learner who failed 02 to 03 — the part
must report 02's result honestly and never route); **05** is `isRequired: false`; **06** is
`isAssessment: true`.

## 2. Screen numbering

This unit numbers `data-screen` **globally** across all six parts (part 02 starts at 15, not 0). Each
part's `TOTAL_SCREENS` is "highest own screen + 1", so `goTo(n)` accepts `n < TOTAL_SCREENS` but only
the part's own screens exist in its DOM. Consequences for reporting:

- `SCREEN_TO_SUBCONTENT` is keyed by the part's **own** `data-screen` values and must cover exactly that
  set (the ownership list in `unit-manifest.js`), not `0..TOTAL_SCREENS-1`. The harness checks this.
- The generic question engines (`scqGen*`, `saqGen*`, `hspGen*`, `ctqGen*`) and `window.GEN_DATA` are
  keyed by the **legacy** screen numbers of the old single-file build. Column "engine key" below is what
  `genScqState[key]` etc. use; `xapiAnswered` call sites inside the generic engines must translate the
  legacy key to the item.
- Screens 30, 39, 40, 42 and 49 do not exist (removed from the curriculum; 49 since `52830dd`).

## 3. Screen → item map

Verified 2026-09-23 against each item's `informationToBot` and the screen content
(`translation/translation-screen-manifest.csv` titles). `null` = no catalogue item (a transition).

### Component 01 — "בואו נלמד משהו חדש" (screens 0–14)

| Screen | Content | Item | Engine / check fn |
|---|---|---|---|
| 0 | Opening transition | `null` | — |
| 1 | Hook — which character's statement is incorrect | `001` (q1 choice) | `hookCheck` |
| 2 | Hook wrap-up card ("מסך 2" in 001's description) | `001` | — |
| 3 | Learning-path choice (video / text) — technical, not graded | `002` | `tosSelect` |
| 4 | Video path — YouTube `R1cj6siRMoE`, watch gate | `003` | `s4MarkWatched` |
| 5 | Text path — accordion | `004` | — |
| 6 | Hotspot — astronaut on Earth | `005` | `s6RevealEarth` |
| 7 | Hotspot — astronaut on the Moon | `005` | `s6RevealMoon` |
| 8 | Open question, 2 fields (min length + Hebrew only) | `005` (q1 other, ungraded — **no** `answered`) | `hoqSubmit` |
| 9 | Knowledge summary | `006` | — |
| 10 | Carousel — two scale types | `006` | — |
| 11 | Drag-and-drop summary table (+ View My Answer) | `007` (q1 matching) | `ddq12Check` |
| 12 | Transition to the warm-ups | `null` | — |
| 13 | Warm-up 1 — dropdowns (+ View My Answer) | `008` (q1 matching) | `ddrop14Check` |
| 14 | Warm-up 2 — single choice | `009` (q1 choice) | `scq15Check` |

Screens 4 and 5 are the two alternative paths. Until 2026-10-27 both were item `002` (D-5); the bot then
answered about the path the learner had not chosen (QA/2026-10-26), so the metadata split them: `002` is
the choice, `003` the video path, `004` the text path, and the old `003`–`007` moved to `005`–`009`.
Resume state saved before the split is translated once on load (`_rsRenumberItems`, `-01/js/main.js?v=9`).

### Component 02 — "זמן תרגול" (screens 15–23)

| Screen | Content | Item | Engine / check fn |
|---|---|---|---|
| 15 | Transition — "6 questions" | `null` | — |
| 16 | Practice Q1 — Leora in deep space | `001` | `scq18Check` (button `#s16-check-btn`; enter fn `enterScreen17`) |
| 17 | Practice Q2 — Shaked & Yam on Jupiter | `002` | `scq17Check` (button `#s15-check-btn`; enter fn `enterScreen16`) |
| 18 | Practice Q3 — rice on a balance scale | `003` | `scq19Check` |
| 19 | Practice Q4 — 7-row dropdown (+ View My Answer) | `004` (q1 matching) | `dq19Check` |
| 20 | Practice Q5 — Armstrong video + 4 dropdowns (+ View My Answer); YouTube `cwZb2mqId0A` | `005` (q1 matching) | `dq20Check` |
| 21 | Galileo info — local `galileo.mp4` | `006` | — |
| 22 | Apollo 15 info — YouTube `oYEgdZ3iEKA` (+ modal) | `006` | — |
| 23 | Practice Q6 — Galileo conclusion | `007` | `scq23Check` |

Note the swapped names (`case 16 → enterScreen17` / `scq18Check`, `case 17 → enterScreen16` /
`scq17Check`, `case 23 → enterScreen21`) — function and element names do **not** follow the screen
number. Anchor every call site on the function that the screen's own button calls (verified from
`index.html` `onclick` per screen), never on the number in a name.

### Component 03 — "זמן תרגול 2" (screens 24–29)

| Screen | Content | Item | Engine key / check fn |
|---|---|---|---|
| 24 | Transition — basic set | `null` | — |
| 25 | Basic Q1 — single choice | `001` | `scqGen` key **24** |
| 26 | Basic Q2 — drag-and-drop (+ View My Answer) | `002` (q1 matching) | `s26dndCheck` |
| 27 | Basic Q3 — single choice | `003` | `scqGen` key **26** |
| 28 | Transition — Standard B | `null` | — |
| 29 | Standard B — Noa's diary (image) | `004` | `scqGen` key **28** |

### Component 04 — "משימה בכיתה" (screens 31–34)

| Screen | Content | Item | Engine key / check fn |
|---|---|---|---|
| 31 | Transition into the class task | `null` | — |
| 32 | Task instructions + "remind me" Galileo popup | `001` | `openGalileoReminder` |
| 33 | Reflection form, 4 free-text fields (not graded) | `001` | `ctqGen` key **31** |
| 34 | Wrap-up — tools list (described inside 001) | `001` | — |

Item `001` declares no questions: the form reports nothing as `answered` (a `project-or-inquiry-task`,
"not collected for grading" per its description). Component result: `{ success: true }` with no score.

### Component 05 — "בואו נאתגר את עצמנו" (screens 35–38, 41, 43)

| Screen | Content | Item | Engine key / check fn |
|---|---|---|---|
| 35 | Transition — 3 advanced questions | `null` | — |
| 36 | Applet guide (`sAdvGuide`, described inside 001) | `001` | — |
| 37 | Advanced Q1 section א (applet) | `001` q1 | `scqGen` key **33** |
| 38 | Advanced Q1 section ב | `001` q2 | `scqGen` key **50** |
| 41 | Advanced Q2 — rice-grain average | `002` | `scqGen` key **36** |
| 43 | Advanced Q3 — roller-coaster graph hotspot | `003` (q1 other) | `hspGen` key **38** |

### Component 06 — "שאלת שיא" (screens 44–47)

| Screen | Content | Item | Engine key / check fn |
|---|---|---|---|
| 44 | Peak intro | `null` | — |
| 45 | Section A — food labels | `001` q1 | `scqGen` key **40** |
| 46 | Section B — space-station true/false statements (1 attempt) | `001` q2 + q3 (one per statement, `statements[].xapiQ`) | `saqGen` key **41** |
| 47 | Section C — digital-scale calibration; its "סיימתי" (`s40-continue-btn`) is the part's end button | `001` q4 | `scqGen` key **42** |

**Item `002` ("סיום היחידה") has no screen** since Noa removed part 06's end screens (`b3b55d1`, merged
2026-09-24). It is published (id frozen), so it stays in the catalogue and is simply never reported, until
the Kata/content team decides (retire it in Kata, or give it a screen back). The harness names it in
`KNOWN_UNREPORTED` and fails once that exception is no longer needed.

Coverage: every catalogue item (01: 7, 02: 7, 03: 4, 04: 1, 05: 3, 06: 2) appears in the map except
06-002 (above), and no suffix appears that the catalogue lacks.

## 4. Component results — decided 2026-09-23

Reported once, from the part's last click, by `xapiEndComponent(result, btn)` (guide §6.5). Always an
explicit `result` — the library's default is an AND over all answers.

| Component | `result` | Why |
|---|---|---|
| 01 | `{ success: true }` — no score | Teaching component; the two warm-ups (`006`, `007`) are not graded into anything |
| 02 | `success = standardScore >= 4`, `score.scaled = standardScore / 6` | **4 of 6, as coded** (`-02/js/main.js:365`). PROJECT_BRIEF says "≥80%" but lists the threshold as an open question; the implemented and QA'd line is 4/6 — kept. This result is what Kata's `recommendedAfterFail` on 03 acts on |
| 03 | `{ success: true, score: { scaled: correct / 4 } }` | No gate on screen — every learner continues; report the score, invent no threshold |
| 04 | `{ success: true }` — no score | Off-computer class task; a score would invent a number nobody measured (guide §6.4) |
| 05 | `success = correct / 4 >= 0.6`, `score.scaled = correct / 4` | **Changed 2026-10-08 (MOE, with Maya):** challenge ("בואו נאתגר") reports its real score, success only at ≥60%. Still no gate on screen — every learner continues, nothing is shown. 4 declared questions (001 q1+q2, 002, 003); unanswered counts as wrong |
| 06 | `success = peakSections === 3`, `score.scaled = peakSections / 3` | Assessment; **3 of 3** — the line the removed Success/Failure split used. Reported from Peak Q3's "סיימתי" (screen 47) |

## 5. Implementation (Phase 2, 2026-09-24)

### Shared layer — `unit-js/`, `unit-css/`

Copied from `methodica-science-mass-measure-03` (the reference since the guide's 2026-09-23 refresh),
then changed only where this unit differs:

| File | This unit's changes |
|---|---|
| `10-identity.js` | prefix, bare-slug unit id, `RESUME_ENABLED = false` (until Phase 4), `DEV_NAV` |
| `20-xapi.js` | `xapiAnswerText` drop list for this markup; **port 1** video state machine (scale-01); **port 2** persisted hints ledger (`xapiSubmittedOpen` removed 2026-10-01, below) |
| `40-resume.js` | `RESULT_KEYS = ['lomda_mw01_standardPass']`, `NAV_EDGE_KEY`, per-unit `UI_CHARACTER_KEY` (**port 4**, D-6), `hints`/`picks` ledgers + `sendStatementOnce` (**port 2**) |
| `50-loader.js` | none (`-i` while resume is off, `-k` after) |
| `90-boot.js` | `hideCrossPartBack()` finds `.btn-back[onclick^="goToPrevComponent"]` (no ids here) |
| `25-report.js`, `unit-css/25-report.css` | copied; **wired in Phase 3** together with the dialogs |
| `_test/xapi-720-k.js` | ratio-01's stub (**port 5**), keys retargeted |

`restoreEndedButton` (**port 3**, D-8) landed with resume in Phase 4 — see `docs/RESUME.md`.

Tag order in every part: `10-identity, 20-xapi, 40-resume, 50-loader, [layout-config], main,
28-feedback-drag, 90-boot` (the part's own scripts keep their relative order; `25-report` joins after
`20-xapi` in Phase 3). Same `?v=` everywhere.

### Root

`index.html` is the guide's redirect (carries `location.search`). Noa's iframe shell is
`qa-shell.html` — dev/QA only, never packaged; it opens every part with `?dev=1` so the in-unit hops
still work there, and the root `index_dev.html` and each part's `index_dev.html` do the same.

### Per part (`js/main.js`)

- **`goTo`** ends with three separately wrapped seams — `repaintScreen(n)`, `xapiOnScreen(n)`,
  `scheduleResumeSave()` — after `.active` and `resetScreenState(n)`; nothing reordered.
- **Config block** at the bottom (map, slug, id, eval items, metadata file; `XAPI_GEN_Q` in parts
  03/05/06 maps the generic engines' legacy keys to catalogue questions).
- **Landing**: `#screen=N` (guide) and legacy `#screen-N` both accepted.
- **`answered`** at every check, `isLast = correct || attempts >= max`; one-attempt questions pass
  `true`. Answer text is what the learner submitted (snapshots are taken before the solution overwrites
  the fields).
- **Retry gate (D-14)** on every two-attempt question: `scq15` (01); `scq18`, `scq19`, `scq23`, `dq19`
  (02); the `scqGen` engine (03/05/06, `state.lastWrong`); `s26dnd` (03, by label); `hspGen` (05, by
  colour group, as graded).
- **Hints** report once per item/question (`xapiRequestedHint`, persisted ledger).
- **Flush** after every answer, and immediately before each `return` that follows one (`s26dndCheck`).
- **Last click → `xapiEndComponent(result, btn)`**, then nothing (the platform routes). The old hops
  run only under `DEV_NAV` and carry `location.search`; every `goToPrevComponent` is DEV_NAV-only and
  its button hidden.

### Decisions recorded here

- **Open question, screen 8 (01 item 003 q1, "other")** — sends **no** `answered` (since 2026-10-01;
  see "D-9, refined" below). Item 003 reports `initialized`/`completed` only and is not in
  `XAPI_EVAL_ITEMS`.
- **Statement set, screen 46 (06 q2 + q3)** — since 2026-11-04 (guide §6.3b) each statement is its own
  `true-false` question: one `answered.last` per statement, `result.response` the literal `true` /
  `false` (the learner's boolean, never the label), `success` per statement. Section C moved from q3 to q4.
  The section score is unchanged (3 of 3). State saved before the split is translated once
  (`_rsSplitQuestions`, payload `ids: 2`).
- **Part 03's skip to Standard B stays in production.** It is a screen choice inside part 03, not
  routing between parts. The pass flag crosses components, which the per-component state document
  cannot carry, so part 02 writes it with `setUnitResult` (which also writes `localStorage`) and part 03
  reads `localStorage`; on another device the learner simply sees the basic set.
- **Videos.** Screen 4 (01) and screens 20/22 (02) are static iframes with `YT.Player` attached — no
  `forigin` possible (guide §6.9.1), verified with a canary (no launch-query bytes in any `src`).
  Screen 4 reports `played`/`paused` for item 003 (002 before the 2026-10-27 split) and is paused when the learner leaves the screen;
  screen 22 (inline and modal) gets a player once its `src` is set (`enablejsapi=1` added to the
  constant `data-src`) and reports for item 006. Screen 20's muted 6-second loop is décor and is not
  reported (never opt in a loop). Local `galileo.mp4` on screen 21 (02) and in the part-04 reminder
  opt in with `data-xapi-report`.

### Verified

- `_test/verify-report.js`: 771 checks (groups 2c + runtime statement flow), 12 mutations each caught.
- Browser, with the local stub (`?xapiLib=../_test/xapi-720-k.js`): every part's item pairs, answers,
  Retry gates, hints (one `requested` for two opens), and the component `completed` with the decided
  result; off-platform the library loads, reports `XAPI_DISABLED`, and nothing is sent.
- Live Kata run 2026-09-24 (`2026/QA/2026-09-24/REPORT.md`): 6/6 components PASS on the happy paths.

### B-1 — guarded item close (2026-09-24)

Found in the live run: leaving an **unanswered** evaluated item (Back) made the library drop its
`completed` (`item left unanswered — deferring`, no queue) while `sendStatementOnce` marked `doneItems`,
so the real `completed` after the learner came back and answered was never sent (part 03 lost 002 and
003). `xapiOnScreen` and `xapiFinishItems` now close through `_xapiCloseItem`, which sends nothing and
leaves the ledger untouched when `_xapiLibWouldDrop(item)` — eval item with no entry in the library's
`xapiItemAnswered` (fallback: no `XAPI_Q_RESULTS` key). Harness: five B-1 checks (1068 total), five
mutations each caught. `20-xapi.js?v=2`.

### D-9, refined — ungraded questions send no `answered` (2026-10-01)

MOE QA on part 01: *"יש דיווח answered וזו שאלה של טקסט חופשי"*. Correct — spec v2.7 p24 defines
`Answered` as a response measured by the content (*"מהווה מענה הניתן להערכה"*), carrying `response`,
`success` and `score`; the 2026-09-23 `xapiSubmittedOpen` sent `answered.last` with neither.

**Rule.** Every question the metadata declares is reported by `answered` — **except an ungraded
question**: `questionType: "other"` with `answers` **and** `correctAnswers` both empty. It sends nothing;
its item reports `initialized`/`completed` only and stays out of `XAPI_EVAL_ITEMS`. The metadata is not
changed (not ours to edit); the reporting reads the rule from it. In this unit only 01/003/q1 matches —
05/003 (hotspot) and 06/001 q2 are `"other"` with `correctAnswers`, graded, and keep their `answered`.

`xapiSubmittedOpen` is deleted. Harness: D-9 loop skips ungraded questions and asserts they are **not**
reported and their item is not evaluated; a runtime check submits screen 8 and asserts no `answered`
(1067 checks; restoring an `answered` call there fails 2). `20-xapi.js?v=3`, `-01/js/main.js?v=6`.

Open for MOE: the platform now sees a declared question (003/q1) with no `answered`. If Kata expects one
per declared question, that is a metadata question for the metadata owner, not a reporting change.

### YouTube player attach race (2026-10-06)

MOE QA on part 01: *"אין דיווחי played/paused"*. `played`/`paused` on screen 4 come from the `YT.Player`
attached to `#s4-video` (`onStateChange` → `xapiYouTubeState(e,'003')`, `'002'` before the 2026-10-27 split). That player was created only in
`onYouTubeIframeAPIReady`, defined in `main.js` at the end of `<body>`. YouTube's `www-widgetapi.js` is
async and calls that callback **once**, when it runs; with a warm cache it can run before `main.js`, find
no callback, and never call it again — no player, no statements, and Continue only via the 84 s fallback.

**Rule.** Players are created by an idempotent `ytInitPlayers()`, called from the callback **and** once
at load when `YT.loaded` is already set. Each part creates only the players whose iframe it owns (01:
`#s4-video`; 02: `#s20-yt-iframe`; screen 22 keeps `s22WireYT`). Statements still go to the item (003 since the 2026-10-27 split), not to
the component. `-01/js/main.js?v=7`, `-02/js/main.js?v=6`.
