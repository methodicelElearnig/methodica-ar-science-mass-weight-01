# WORK PROGRESS

## Completed

- [x] Verified & confirmed the in-progress renumbering of Standard-B Q2 ("אצן", runner question) into its correct sequential position (data-screen 30) immediately before משימת כיתה — content matches script slides 90-93, navigation/switch-case mapping consistent, no gaps.
- [x] Added the missing "הזכירו לי את הניסוי של גלילאו" reminder button + popup on the Class Task Instructions screen (data-screen=32) — required explicitly by script slide 93/94, was entirely missing.
- [x] Fixed Class Task Transition screen (data-screen=31) — had zero scoped CSS, character gif/bubble rendered at native size and overflowed the canvas.
- [x] **Advanced Q1 fully rebuilt with real content** (the question immediately following the Class Task flow). It was showing a stale/unrelated "astronaut" question; replaced with the real script content (slides 99-107): "שחזור ניסוי גלילאו" (Galileo free-fall reconstruction), implemented as two full sections — א (data-screen=35, existing screen, content replaced) and ב (data-screen=36, **new screen**, inserted into the flow). Both sections use the existing generic SCQImage engine (same one used elsewhere in the project) with real question text, all 4 answer options, correct answer, 2-attempt logic, and correct/incorrect feedback taken verbatim from the PPTX (including grouped-shape option text the shallow text extraction had missed). No hint button on either section, matching the script's explicit note. The interactive Galileo-experiment widget itself is intentionally left as a labeled placeholder (see Known Issues) since the script flags it as needing direct producer coordination — but the question mechanics (select → check → feedback → attempts → continue, and back-navigation with state restore) are fully implemented and tested working end-to-end in Preview.
- [x] Renumbered data-screen 36→48 up by one throughout index.html/css/style.css/js/main.js to make room for the new section-ב screen (36-46→37-47; 47 gap→48 wrap-up unchanged) — same careful process as the earlier Standard-B renumbering, verified screen-by-screen afterward (Advanced Q2-Q5, Peak transition/Q1-Q3, End Fail/Success all re-checked in Preview post-shift).
- [x] **Fixed Galileo reminder popup card (data-screen=32)** — enlarged `.s28-reminder-card` (760px→900px), and removed hardcoded `<br>` line breaks in the popup copy that had been copied verbatim from Screen 21's narrower two-column layout (`.s-galileo-right`, `flex:1`) — those breaks produced short, uneven "ladder" lines once reused in the wider popup card. Text now reflows naturally (`text-wrap: balance` added, matching the pattern already used on the data-screen=23 hint card). Wording/paragraph order/button text unchanged. Increased spacing between last paragraph and the "חזרה למשימה" button. No overflow (verified: card content height < max-height at 900px width).
- [x] **Fixed Class Task Reflection Form (data-screen=33)** — found and fixed another instance of the project's known "CSS scoped to a stale data-screen number" bug: the entire `.s29-*` block (title/fields/inputs/textareas/feedback) was scoped to `[data-screen="31"]`, but the actual reflection-form section's `data-screen` is `33` (31 is now the Class Task Transition screen). The block had silently never applied — the form was rendering on raw browser defaults (content jammed top-right, native-size inputs, huge unused white space), matching exactly what was reported. Rescoped to `[data-screen="33"]` and redesigned the layout adapting general/typography/spacing/input patterns from the 720 Templates Figma reference (node 1460-38333, "Fill_In_The_Blank_Table_Question"): title using the `--t-h7`/`--subject-500` tokens, fields wrapped in a bordered/shadowed `.s29-card` panel using the canvas width properly, the 2 short questions side-by-side via CSS grid with the 2 long questions spanning full width below, styled inputs/textareas per the reference's rounded/bordered look. No content, field order, or JS state logic changed. Continue-button disable/enable and feedback-reveal logic verified still working end-to-end (fresh entry → disabled+hidden; all 4 filled → enabled+feedback visible, no scroll needed).
- [x] **Rebuilt Class Task wrap-up screen (data-screen=48)** — was a `.s28-*` blue instructions card (title/subtitle/numbered-steps). First pass replaced it with the stacked bubble-over-character TransitionScreen layout (like screens 29/32/34); user corrected this — the screen is an "explanation" screen, not a transition, and needed the character-explains-something visual language instead: title centered on top, then a large speech bubble on the physical LEFT with its tail rotated to point RIGHT into the glasses character standing just outside the bubble on the right, read as one component. Implemented as a CSS-only change (no new HTML/JS): `.s12-char-area` switched from a centered column to a `direction:ltr` row (same physical-positioning trick already used by `.nav-inner`, so bubble stays physically left / character physically right regardless of the page's RTL direction); the bubble reuses the existing `hook-orange-bubble.svg` asset (no new asset) with `rotate(-90deg)` on a pre-rotation-swapped box turning its native downward tail into a rightward one; character overlaps the tail slightly via negative margin so they read as one piece. Bubble text repositioned/widened to clear the tail notch (now on the right edge instead of the bottom). Content wording unchanged. Character is `assets/gif/orange-monster-glasses.gif` (the glasses-wearing monster the script calls for). Verified in Preview on the actual `index.html` (not just the dev wrapper): text fits with no overflow, GIF loads and animates, navigation unchanged (continue → Advanced transition data-screen=34, back → Reflection Form data-screen=33), holds up at multiple viewport sizes.

---

## In Progress

- Broader Advanced/Peak screen-by-screen content audit (partial pass done; see Known Issues).

---

## Remaining

- Advanced Q1 (data-screen=35) needs real content — currently shows an unrelated legacy question. Blocked on an interactive widget (see Known Issues / Local TODO).
- Knowledge Summary section (per PROJECT_BRIEF.md screen-type table) — appears entirely absent from the build; needs scoping decision.
- Full content-fidelity pass for Advanced Q2b (currently skipped/orphaned per existing in-code note), and a real Figma-based QA pass once Unit Figma is provided (layout choices in this session were based on sibling-screen precedent, not Figma).

---

## Decisions

- Feedback overlays image instead of replacing it (pre-existing convention, screens 29/30).
- Class Task wrap-up screen and Advanced Q1 fallback: reused the existing `.s28-*` instructions-card template rather than inventing new layout, per "prefer existing template" rule — see 720-templates skill.
- Galileo reminder popup (new, this session): modeled on the `.s28-card` blue/white instructional-card look (not the `.s11-hint-*` "רמז" styling), since it's a content recap, not a hint — kept visually distinct from hint popups by design choice, documented in index.html.

---

## Known Issues

Issue: Advanced Q1 (data-screen=35 section א, data-screen=36 section ב) needs a real interactive Galileo free-fall experiment widget on its image side — currently a labeled placeholder ("יישומון ניסוי גלילאו — יתווסף בהמשך"). The script explicitly flags this as needing direct producer coordination ("דברו איתי בעפ בנושא — רוני"), not something to build from guesswork.
Status: Question content/mechanics fully implemented and working (see Completed); only the widget itself is pending.
Priority: Medium (the question is playable and correct without it; the widget is a visual/interactive enhancement, not a content blocker anymore).

Issue: Two CSS-orphaned screens found and fixed this session (Class Task Transition data-screen=31, End Fail/Success data-screen=45/46) — both had ZERO scoped CSS and rendered on raw browser defaults (character gif overflowing the canvas). Root cause: `data-screen` numbers drift out of sync with CSS selectors across repeated renumbering sessions, and these screens were apparently never visually verified in Preview before now.
Status: Fixed this session.
Priority: N/A (resolved) — but this class of bug (silent CSS/data-screen drift) may recur; recommend a full grep-based audit (`grep -c 'data-screen="N"'` per N across both files) before the next major renumbering.

Issue: Advanced Q3 (data-screen=38) image placeholder text reads "גרף — יתווסף בהמשך" (graph) but should describe a rice-farmer photo per script slide 113.
Status: Not fixed (cosmetic placeholder label only, not blocking).
Priority: Low.

Issue: Knowledge Summary screen type (required per PROJECT_BRIEF.md) not found anywhere in index.html/main.js. Script slides 146-156 (מסה/משקל definitions) look like this content, positioned after the End screens.
Status: Not investigated further — needs a scoping decision (is it in-scope for this unit build at all?).
Priority: Medium — flag to PM.

Issue: Class Task Reflection Form (data-screen=33) has a large empty white area below the four short fields.
Status: FIXED — root cause was the orphaned-CSS bug (`.s29-*` scoped to the wrong data-screen), not a spacing choice; see Completed. Layout adapted from 720 Templates Figma reference per this session's scoped instructions; still not verified against a Unit Figma frame (not yet provided).
Priority: Resolved.

---

## Local TODO

Things that still need manual work — see LOCAL_SETUP.md for full detail.

- Real image/gif for Standard-B Q2 ("אצן רץ עד קו הסיום").
- Interactive Galileo free-fall simulator widget for Advanced Q1 (both sections א and ב use the same placeholder) — needs producer coordination first (see Known Issues). Question content/logic does not depend on it.
- `assets/gif/char-orange-medal.gif` for the End-Success screen (referenced in code, file does not exist).
- Character gif placement for Class Task wrap-up screen (asset exists — `orange-monster-glasses.gif` — but exact position needs Figma reference; intentionally omitted rather than guessed, per an earlier session's note).

---

## QA Remaining

- Full click-through + state-resume QA for Advanced Q1-Q5 / Peak Q1-Q3 (this session only verified static content/layout via screenshots, not full interaction — SCQ select/check/feedback/hint cycles, attempts logic).
- RTL/overflow/responsive check specifically for the newly-added Galileo reminder popup at non-default zoom levels.
- Once Advanced Q1 content is resolved, re-run the ≥80%/<80% Standard routing and Peak 3-section routing end-to-end.

---

## Last Session

Date: 2026-07-16 (two continuations, same day)

Files Changed: index.html, css/style.css, js/main.js, PROJECT_BRIEF.md, SESSION_TASK.md, WORK_PROGRESS.md, LOCAL_SETUP.md

Preview Tested: Yes — `lomda-preview` dev server (index_dev.html) via Browser pane. First pass: screens 29-46 walked screen-by-screen with screenshots; Standard-B Q2 full select→check→feedback→continue cycle tested; Galileo reminder popup open/close/auto-close-on-nav tested. Second pass (continuation): full real-click flow from Class Task Instructions → popup open/close → Reflection Form (fields fill, continue unlocks) → Wrap-up → Advanced Transition → Advanced Q1 section א (select→check→feedback→continue) → Advanced Q1 section ב (select→check→feedback→continue) → Advanced Q2, plus back-navigation through both new/changed screens confirming state-restore works; re-verified Peak Q1 and End Fail/Success still render correctly after the renumbering shift.

Notes: First pass started from an existing uncommitted diff (mid-flight renumbering of Standard-B Q2) — verified it first, then found and fixed 3 previously-undiscovered "orphaned CSS" screens. Second pass (this continuation) was scoped narrowly by the user to just the question after the Class Task flow: rebuilt Advanced Q1 with its real two-section content (script slides 99-107, discovered via grouped-shape PPTX extraction — the shallow text-frame-only extraction had missed all the answer options, which is why the earlier pass thought the content was simply "missing/blocked"). This required inserting a new screen (section ב) and re-running the same careful data-screen renumbering process as before (36→48 shifted by one), fixing two subtle double-open-brace bugs the shift's line-duplication script introduced (caught by a brace-balance check before considering the work done).

## Session Handoff

### Summary

The משימת כיתה area and the question immediately after it (Advanced Q1) are now both content-correct and fully working, including a previously-missing required popup and a previously-stale/wrong question that's now rebuilt from the real script content across two sections. The interactive Galileo widget the script calls for is still pending (needs producer input) but no longer blocks the question itself — it's a placeholder-in-place-of-a-widget situation, not a missing-content situation.

### Next Recommended Task

Get the interactive Galileo free-fall widget (or its spec) from the producer to drop into Advanced Q1's placeholder image area. After that, a full interaction QA pass (attempts/hint/state-resume) across Advanced Q2-Q5 and Peak Q1-Q3 is the next natural scope (only static content/layout was spot-checked, not full interaction, for those).

### Files to Open First

index.html (search "Screen 33: Advanced Q1" and "Screen 33b"), the script `~/Downloads/yaad4-science-mass-weight-01.pptx` slides 99-107, this file's Known Issues section.

### Known Risks

The `data-screen`-vs-CSS-selector drift bug class found in the first pass (screens with CSS scoped to a stale/wrong number) may still exist elsewhere in the file beyond what was checked — no full project-wide audit has been done, only the screens actually visited across both passes. Additionally: when duplicating a CSS selector block programmatically for a renumbered/inserted screen (as done twice now for this kind of shift), watch for selector lines that end in `{` without a matching `}` on the same line (multi-line rule bodies) — naive line-duplication turns those into a double-open-brace syntax error that doesn't show up until you check brace balance or actually render the screen. Always re-check brace balance (`{` count == `}` count) after this kind of scripted CSS edit.

### Blockers

Interactive Galileo widget for Advanced Q1 (needs producer input — not a blocker for the question itself anymore, just for the richer interactive experience).
Knowledge Summary scope decision (needs PM/producer input, unrelated to this session's work).

---

## Session 2026-07-16 (continuation 3): Applet Guide screen + Advanced Q1–Q5 CSS fixes

### Completed

- [x] **Deep-read script slides 99–122** (text, notes, comments, nested/grouped shapes) before any change, per this session's scope. Found the slide brief's assumed 5-question mapping doesn't match the actual deck: slides 100–107 are ONE question (Q1, two sub-sections א/ב, already correctly built in a prior session), slides 108–112/113–117/118–122 are the real Q2 (VIQ, sugar)/Q3 (SCQImage, rice)/Q4 (SCQ, moon) — also already correctly built. The real Q5 (ImageHotspotQuestion, roller-coaster graph) lives at slide 123+, outside the requested range, and was also already built (data-screen 42 pre-shift). Found two production comment threads (slides 108, 118) reading "נעה - השאלה הזו יורדת!" (question being cut) — flagged to the user; she confirmed to treat the current deck content as authoritative and keep both questions.
- [x] **Built the missing Applet Guide screen** (new `data-screen="36"`, between the Advanced transition and Advanced Q1) per script slide 99: right column = instructional text verbatim from the script (all 3 required phrases — "מסה שונה", "מסה זהה", "האם גם הם יגיעו באותו זמן לקרקע?" — present and bolded exactly as written, no new wording), left column = a dedicated, final placeholder container `#galileo-applet-container` (class `applet-placeholder`) sized/positioned via the existing `.sadv-layout` two-column grid (no new layout invented). Dev-only label "יישומון יוטמע כאן" inside the placeholder. Continue → Advanced Q1, Back → Advanced transition.
- [x] **Renumbered data-screen 36→48 up by one** (to 37→49) across index.html/css/style.css/js/main.js (SCREEN_* consts, `resetScreenState` switch, TOTAL_SCREENS 49→50) to make room for the new guide screen, using the same careful descending-shift process as prior renumbering sessions. Verified via brace-balance check and `node --check` after every CSS/JS edit.
- [x] **Fixed a cluster of real, previously-undiscovered CSS scoping bugs** across all 6 Advanced-practice screens (found by actually walking each screen in Preview, not just reading code) — same "data-screen drift" bug family flagged as a risk in the last session's Known Issues, confirmed to still exist beyond what was previously found:
  - `.s15-progress` (the 5-question progress-dot bar) had **zero CSS** for any Advanced-practice screen (Q1a, Q1b, Q2/VIQ, Q3, Q4, Q5) — added, modeled on the already-working Standard-B (29/30) progress bar.
  - `.sadv-layout`/`.sadv-qa-area`/`.sadv-img-area`/`.sadv-img-placeholder` (two-column question+image layout) missing for Advanced Q1a/Q1b (new data-screen 37/38) — added.
  - `.viq-*` (the whole ValueInputQuestion screen: context box, sentence, inputs) was scoped to data-screen `35` (the Advanced transition screen, which isn't a VIQ at all) instead of the real VIQ screen (now `39`) — corrected.
  - `.s11-col`/`.s11-options`/`.s11-option`/`.s11-radio` (single-column question+options layout) missing for Advanced Q4/moon (new data-screen `42`) — added, joining the same block screen 33/37/38 already use.
  - `.s11-feedback`/`.s11-hint-overlay` and all their sub-parts (fb-head/title/close/body, hint-card/blur/body/back-btn) were scoped to `41,42,43` with `43` accidentally duplicated in place of `41` (Advanced Q3/rice had literally zero feedback-panel or hint-overlay CSS) — fixed to the correct `41,42,43`.
  - `.hsp-*` (hotspot graph question, Q5) was scoped only to a stale/dead `data-screen="41"` that predates this session's renumbering and never matched the real Q5 screen — added `43` (the real Q5 screen) alongside it.
  - Advanced Q4 (moon): the context box + question + 4 options exceeded the available vertical space by ~17px, causing the last option to visually collide with the nav bar — fixed with a screen-scoped `top`/`gap` reduction (139px→115px, 20px→14px gap), not a change to the shared rule other screens rely on.
  - Advanced Q1a/Q1b: the empty placeholder `<img alt="יישומון ניסוי גלילאו">` was rendering its alt text overlapping the adjacent `<span>` placeholder label (broken-image alt-text fallback stacking on top of visible text). Fixed by emptying `alt=""`, matching the existing pattern already used on Q3's placeholder image.
  - Advanced Q3 (rice): placeholder label said "גרף — יתווסף בהמשך" (graph) but the real asset is a photo — corrected to "תמונה — יתווסף בהמשך", per a Known Issue already flagged in the last session.
  - Advanced Q4 (moon): the "correct answer" feedback text said "משפט ג' הוא המשפט היחיד..." but the actual correct option is the script's "ד'" (the answer-matching logic itself works correctly by comparing option text, not letter, so this was a wording-only bug, not a scoring bug) — corrected the letter in both the correct and final-incorrect feedback bodies to "ד'", matching the script's real feedback text.
- [x] **Full interactive Preview QA**, real clicks (not just screenshots): Applet Guide screen (visual check, continue, back-to-transition) → Advanced Q1a (select→check→feedback→continue) → Q1b (select→check→feedback→continue) → Q2/VIQ (fill both numeric fields→check→feedback→continue) → Q3/rice (wrong-first-attempt→hint open/close→correct→feedback→continue) → Q4/moon (select→check→feedback, including re-verifying the overflow and letter-typo fixes) → Q5/hotspot (visual layout check post-CSS-fix) → confirmed Peak transition screen still reachable and renders with no console errors.

### Known Issues / Not Fixed (out of this session's scope)

- Advanced Q5 (hotspot/roller-coaster graph): the graph image itself is still a placeholder (pre-existing, unrelated asset gap) — the hotspot click-zone interaction couldn't be meaningfully click-tested without the real image, since zones are defined as proportions of the real image's dimensions. Layout/CSS is now fixed and confirmed rendering correctly; only the asset + zone-click depth test remain.
- Peak Q1/Q2/Q3 (now data-screen 45/46/47) and the two End screens: spot-checked only that navigation still reaches the Peak transition without errors post-renumbering. A similar "missing `.sadv-layout`/`.s15-progress`/`.s11-options` CSS" pattern was noticed there too during this session's investigation (pre-existing, NOT touched — explicitly out of this session's scope per the brief's screen-range boundary). Flagging for a future session.
- Advanced Q1a/Q1b's real interactive Galileo-experiment applet is still pending producer coordination (unchanged from last session — see Known Issues above and LOCAL_SETUP.md).

### Files Changed

index.html, css/style.css, js/main.js, SESSION_TASK.md, WORK_PROGRESS.md, LOCAL_SETUP.md.

### Preview Tested

Yes — `lomda-preview` dev server via the Browser pane, real clicks/fills, not just static screenshots. See "Full interactive Preview QA" above for the exact click sequence covered.

---

## Session 2026-07-16 (continuation 4): Applet Guide screen (data-screen=36) — text/alignment-only pass

Scope for this session was narrowed explicitly to only this screen: text line breaks, heading/emphasis color, an arrow after "משמאל", and vertical centering of the text block. No audit, no logic/nav/footer/applet-placeholder changes, no other screens touched.

### Completed

- [x] Rewrote the 4 body paragraphs to match the exact required line breaks: split the first sentence ("בהתנסות הזו תשחזרו ותרחיבו את הניסוי של גלילאו.") into its own paragraph, and added explicit `<br>` breaks inside the 2nd and 3rd paragraphs ("...מסה שונה,⏎שהגיעו..." and "...מסה זהה,⏎אך שונים בצורתם.⏎האם גם הם..."). No wording changed.
- [x] Fixed the "שחזור הניסוי של גלילאו:" heading — was colored `var(--subject-500)` (blue), read as a mismatched separate title. Changed color to the body text color (`#303030`) only; font-size/weight left untouched. Also changed `.guide-body strong` from blue to the same `#303030` — the 3 existing bold emphases ("מסה שונה", "מסה זהה", "האם גם הם יגיעו באותו זמן לקרקע?") stay bold, no longer blue.
- [x] Added a left-pointing arrow after "משמאל" ("משמאל ←"), inline, same line/style. Wrapped in `<span class="guide-arrow" direction:ltr>` to force the glyph to render pointing left regardless of the surrounding RTL bidi context (Unicode arrow mirroring in RTL runs would otherwise flip it) — verified visually in Preview that it points toward the applet placeholder on the left.
- [x] Vertically centered the text block: added `[data-screen="36"] .guide-text-area { justify-content: center; }` (screen-scoped only — `.guide-text-area` class exists only on this screen's wrapper, so no sibling screens sharing `.sadv-qa-area`/`.sadv-layout` are affected). Verified in Preview via computed rects: text block now sits with equal ~73px gaps top/bottom within the 489px content area, matching the applet placeholder's height.
- [x] No changes to: font size/weight, text-area width, applet placeholder position/size, footer, nav buttons, navigation logic, or any other screen.

### Preview Tested

Yes — own `lomda-preview` instance (port 5555 was occupied by another chat's server; enabled `autoPort` in `.claude/launch.json` and removed the hardcoded `-p 5555` arg so this session could get its own port without touching the other session's server). Verified via screenshot + computed-style checks: line breaks exact, no blue text in body, arrow renders pointing left, text vertically centered, no overflow, sibling screens' `.sadv-qa-area` unaffected.

### Files Changed

index.html, css/style.css, .claude/launch.json (dev-server port config only), WORK_PROGRESS.md.

---

## Session 2026-07-17: Screen 7 (Astronaut Earth/Moon comparison) — layout fixes per Figma

Scope narrowed explicitly to `data-screen="7"` (the two-astronaut Earth/Moon comparison screen, HTML id `s7`, JS constant `SCREEN_MOON`). Five specific Figma-vs-code discrepancies reported by the user; no other screen touched.

### Completed

- [x] **Verified top text alignment** — `.s7-panel-label` was already `text-align: right` for both panels (confirmed via computed style, not just source reading); no change needed, left as-is.
- [x] **Increased spacing between the top text and the images**: `.s7-panel-label` margin-bottom 10px → 24px, and `.s7-astro-wrap` gained a new 8px margin-top. To compensate and keep the composition balanced within the fixed 630px column height (canvas 710px − 80px nav bar), shrank both astronaut images by 7.5% (`.s7-astro-wrap`/`.s7-astro-img` height 400px → 370px, same reduction applied identically to both so their relative size ratio is unchanged) — matches the brief's "shrink ~5–10%, then nudge down for balance" instruction.
- [x] **Fixed the info-bubble text wrap bug**: the Moon panel's revealed bubble ("...בירח (קטנה מכדור הארץ).") was breaking as "...מכדור" / "הארץ)." across two lines — confirmed live in Preview by triggering the reveal. Fixed by widening `.s7-info-bubble` from `width: 82%` → `92%` (per the brief's stated preference: widen the bubble before touching font-size). Verified both panels' full sentence now renders on one line at 1280px canvas width.
- [x] **Replaced the report-problem flag icon with per-image magnifying-glass zoom overlays**: the screen was showing the global `#report-btn`/`.flag-btn` (top:32/left:32, present on every screen in the project, declared once outside all `.screen` sections) in the header area, which per the brief is wrong for this screen — Figma calls for a magnifying-glass zoom affordance instead, positioned as an overlay on each image's own top corner, not near the title. Implemented: (1) added the project's existing `.img-zoom-btn` component (already used on ~10 other screens, e.g. data-screen 22/23/26/29/30/31/34/etc. — reused as-is, no new CSS component invented) inside both `.s7-astro-wrap` elements, wired to `data-zoom-src`/`data-zoom-alt` for `astro-moon.png` and `astro-earth.png` respectively; (2) added `position: relative` to `.s7-astro-wrap` and changed its `width: 100%` → `width: fit-content; max-width: 100%` so the wrap hugs the actual rendered image box instead of the full column width — otherwise the zoom icon floated in empty space beside the (narrower) photo instead of overlaying its corner; (3) added a screen-scoped `#app:has(> [data-screen="7"].active) #report-btn { display: none; }` rule to hide the global flag button only while this screen is active — a deliberately narrow, easily-reversible override; the global button is untouched and still renders normally on all other 49 screens (regression-checked screens 6 and 8 in Preview — flag icon still present there).
- [x] Confirmed via real-click (not just JS calls) in Preview: clicking a zoom button opens the shared `#img-zoom-modal` with the correct image/alt; since the zoom button sits inside the Moon panel's existing click-to-reveal wrapper, clicking it also triggers the reveal as a natural side effect (harmless — same outcome as clicking the photo directly) — no JS changes were made or needed.

### Preview Tested

Yes — `lomda-preview` dev server, both via the index_dev.html wrapper and directly against index.html (used index.html directly for real mouse-coordinate clicks, since the dev wrapper's nested canvas-zoom transform made raw pixel-coordinate clicks unreliable; ref-based clicks worked in both). Checked: fresh-load state (Moon bubble hidden, Earth bubble visible, continue disabled), real click on Moon zoom button (modal opens with correct image, bubble reveals, continue enables), bubble text line-wrap on both panels, no overflow (bubble bottom at 582px vs nav bar top at 641px, 59px clear), no console errors, screens 6/8 regression check (flag icon still present/unaffected).

### Files Changed

index.html, css/style.css, WORK_PROGRESS.md.

---

## Session 2026-07-18: Full-unit animation/text audit, screen-by-screen from the start

Scope: user asked to go through the whole unit in order starting from screen 0 (the first screen, with the orange character), verifying animations and text against the script (`yaad4-science-mass-weight-01.pptx`, the most recently modified copy in Downloads) and against actual behavior in Preview — not just reading code. Working screen-by-screen, in progress; this entry covers screens 0–11 (Intro through the Drag&Drop summary table), audited and confirmed/fixed in this pass.

### Screens verified correct, no changes needed (0–9, plus most of 10–11)

Screens 0 (Intro/TransitionScreen), 1 (Hook/4-characters), 2 (Hook popup), 3 (TwoOptionSelection/method choice), 4 (VideoScreen), 5 (Accordion), 6 (Astronaut/Earth hotspot), 7 (Astronaut/Moon hotspot — already fixed in the 2026-07-17 session, regression-checked here), 8 (hookOpenQuestion), 9 (Knowledge Summary) — all texts verified word-for-word against script slides 5–23, all interactions exercised live in Preview (real clicks/typed input, not just static screenshots): staggered entrance animations, hover/selected states, correct/incorrect feedback coloring, accordion unlock-after-all-4-opened gating, hotspot reveal-then-enable-continue gating, open-question textarea-fill-then-check-then-answer-reveal flow, knowledge-summary staggered card reveal with continue enabling last. No discrepancies found.

Also confirmed (via the script's own slide notes, not just guesswork) that the Video-path screen correctly continues into the same Accordion → Hotspot → Hotspot → OpenQuestion → Knowledge-Summary sequence as the Text path — slide 23's production note explicitly says this is the convergence screen "regardless of which [acquisition] option was chosen." This matches the current code (`goTo(SCREEN_VIDEO + 1)` lands on the Accordion) and confirms it is correct, not a bug — the early planning ASCII diagram in PROJECT_BRIEF.md undersells this (it predates the full script read, per that file's own "open questions" section) and should not be read as contradicting it.

### Real bug found and fixed: Screen 10 (scales carousel) — arrow directions were reversed

The physically-left arrow (‹) was wired as "previous" (disabled on the first card) and the physically-right arrow (›) as "next" (enabled on the first card, the one that reveals the 2nd card and unlocks continue). This is backwards from both:
1. The script's explicit production note (slide 24): "לחיצה על החץ **משמאל** מעבירה לרכיב **השני**. לחיצה על חץ **ימין** מחזירה לרכיב **הראשון**" (left arrow → forward to item 2; right arrow → back to item 1).
2. This project's own established RTL navigation convention used on every other screen: "המשך"/continue always sits bottom-left, "חזרה"/back always sits bottom-right — i.e. forward = left, backward = right, consistently.

Fixed in [index.html](index.html) (swapped the `aria-label` text and moved the static `disabled` attribute from the left button to the right button) and [js/main.js](js/main.js) (swapped the `disabled`-toggle conditions in `renderCarousel()`, and swapped the increment/decrement bodies of `carouselLeft()`/`carouselRight()` so each still matches its own physical button, but now `carouselLeft()` = advance/reveal-2nd-card and `carouselRight()` = retreat). Verified in Preview after the fix: left arrow starts enabled (labeled "הבא"), advances to the digital-scale card and enables continue; right arrow then becomes enabled (labeled "הקודם") and returns to the first card. No other carousel behavior changed (dots, card content, continue-unlock-once-seen logic all untouched and still correct).

### Screen 11 (Drag&Drop summary table) — verified correct

Text matches script slide 27 exactly (title, instruction, all 3 row labels, both column headers, all 6 draggable item texts). Native HTML5 drag-and-drop can't be driven through the browser-automation click/drag tool, so the actual drop handlers (`ddq12DragStart`/`ddq12Drop`/`ddq12Check`/`ddq12ShowSolution`) were exercised directly via console calls with a stub event object — this runs the exact same application code a real drag would trigger, just without simulating the OS-level drag gesture. Confirmed: cells accept drops, swap/evict logic when re-dropping onto an occupied cell works, "צדקתי?" enables only once all 6 cells are filled, checking colors each cell correctly (green/red) per-cell against the answer key, "למיון הנכון" reveals the fully-correct sort afterward and enables continue. Matches the script's "ניסיון מיון אחד" (one sort attempt) rule.

### Preview Tested

Yes — `lomda-preview` dev server via the Browser pane, real clicks/typed input throughout (ref-based clicks; raw pixel-coordinate clicks were unreliable against the scaled-down screenshot, consistent with prior sessions' notes — always use ref-based clicks or JS-level state assertions to verify, not screenshot pixel coordinates).

### Screens 12–14 (Warmup transition + Q1 dropdown + Q2 SCQ) — verified correct

Text matches script slides 29–33 exactly. Entrance stagger, dropdown select/check/one-attempt-lock/feedback flow (Q1), and 2-attempt select/wrong/hint/retry/correct flow (Q2, astronaut-on-moon mass question) all exercised live in Preview and work correctly. No changes needed.

### Real bug found and fixed: Screen 15 (Standard Practice transition) had fabricated content

A speech bubble read "לא הכל ברור? אפשר לפנות אל הצ'אט או אל המורה לחיזוק!" — searched the full script (all slides + notes, exact-phrase match) and this sentence does not exist anywhere in it, and the bubble markup was not a reused template element (appeared nowhere else in the codebase). Flagged to the user, who confirmed removal. Removed the bubble `<div>` from [index.html](index.html), its now-dead CSS rules (`.s14-bubble-wrap`/`.s14-bubble-img`/`.s14-bubble-text`) from [css/style.css](css/style.css), and its reference from the entrance-stagger array/delays in `enterScreen15()` in [js/main.js](js/main.js). Verified in Preview: character GIF now centers cleanly with no leftover gap, entrance animation still staggers correctly (suptitle → bigtitle → subtitle → char → button).

### Real bugs found and fixed: Screen 16 (Standard Practice Q1, ליאורה/space-gravity) — continue AND back both misrouted

- **Continue button skipped Q2 entirely**: `onclick="goTo(SCREEN_PRACTICE_Q2 + 1)"` evaluates to `goTo(18)` (Q3) instead of `goTo(17)` (Q2) — clicking continue after answering Q1 correctly jumped straight to Q3, silently skipping Q2 (שקד/ים Jupiter question) for every learner. Root cause: this exact expression was correct on screen 17's own continue button (`SCREEN_PRACTICE_Q2 + 1` = 18 = Q3, correct from *that* screen) and was copy-pasted onto screen 16 without updating the reference. Fixed to `goTo(SCREEN_PRACTICE_Q2)`.
- **Back button looped to itself**: `onclick="goTo(SCREEN_PRACTICE_Q1)"` on screen 16 (which *is* `SCREEN_PRACTICE_Q1`, i.e. screen 16) — clicking back on Q1 just reset Q1 instead of returning to the Practice transition screen (15). Same copy-paste-from-screen-17 root cause (17's back button correctly points to 16 = Q1; 16's own back button needs to point to 15 = the transition). Fixed to `goTo(SCREEN_PRACTICE)`.

Both fixed in [index.html](index.html) (`s16-continue-btn` and the screen-16 `.btn-back`). Verified in Preview: back from Q1 now lands on the transition screen; answering Q1 and continuing now correctly lands on Q2 (confirmed via `currentScreen` after each click, not just visually). Cross-checked every other `goTo()` nav target across screens 12–24 (warmup + all of standard practice + the basic-path transition) for the same copy-paste-off-by-one pattern — no further instances found; all other continue/back targets in this range are correct.

### Screens 17–23 (Standard Practice Q2–Q6, plus the two Galileo/Moon-experiment intro screens) — verified correct

All text matches script slides 44, 48–65 word-for-word. Exercised live in Preview (real selects/checks, plus direct console calls into the actual drop-down handler functions for the multi-field questions — same code path a real click hits, just bypassing the mouse gesture):
- Q2 (שקד/ים, Jupiter mass/weight, 1 attempt, hint always on) — correct/feedback verified.
- Q3 (rice/scale, 2 attempts, hint after first wrong) — correct/feedback verified.
- Q4 (7-word DropdownQuestion, כוח כבידה) — verified the script's more complex rule "2 attempts, but the 2nd attempt is only for the words that were wrong" works exactly as specified: checking with one deliberately-wrong word locks the 6 correct dropdowns (green, no longer editable) and reopens only the wrong one for retry.
- Q5 (Neil Armstrong video, DropdownQuestion, 1 attempt, no hint button per script, "?" info-tooltips on תצפית/הסבר מדעי) — tooltip content matches the script's parenthetical definitions exactly; real embedded YouTube video loads (not a placeholder).
- Galileo intro (21) and Moon-experiment intro (22) — text matches exactly; screen 22 also has a real embedded YouTube video (NASA "Hammer-Feather Drop"), continue correctly gated by a short delay.
- Q6 (Pisa tower conclusion, 2 attempts, hint always on) — correct/feedback verified.

Also confirmed the `routeAfterStandard()` ≥4/6 threshold (already implemented and code-commented from an earlier session, matching the script's literal "4 שאלות (80%)" instruction despite the numbers not being mathematically consistent) is wired correctly to Q6's continue button.

### Screens 24–27 (Basic practice transition + Q1-Q3, the <80% branch) — verified correct

Text matches script slides 69, 70, 75, 79 word-for-word. All 3 questions exercised live (select/check/hint/feedback): Q1 (astronaut Earth/Moon "what changed", 2 attempts, hint always on), Q2 (מסה/משקל DropdownQuestion matching, 1 attempt, hint always on), Q3 (observation vs. inference, 2 attempts, hint always on). Continue from Q3 correctly routes to screen 28 (Standard-B transition). No bugs found.

### Real bug found and fixed: Screen 29 (Standard-B Q1, נועה/hypothesis question) — progress bar showed the wrong current question

Verified by walking the actual flow (transition screen 28 → continue) that screen 29 is genuinely experienced as the *first* Standard-B question, not the second — confirmed both by live click-through and by the code comment on `SCREEN_STANDARD_B_Q2` ("standard-B question 1 of 2 ... legacy name, kept to avoid a wider rename"). But its progress-bar markup in [index.html](index.html) hardcoded `שאלה 1` as `is-done` and `שאלה 2` as `is-current` — i.e. it always displayed as if Q1 were already finished and Q2 were in progress, even on a learner's very first visit. Root cause: this markup is identical to screen 30's (the genuine Q2) progress bar, copy-pasted without flipping the state. Fixed by setting `שאלה 1` to `is-current` and `שאלה 2` to the plain/upcoming state (no extra class), matching the convention used by every other multi-question progress bar in the project (e.g. screen 16's Q1-of-6 bar). Verified in Preview: screen 29 now shows Q1 as current/blue with Q2 upcoming/gray; screen 30 (the real Q2, reached via its own continue button) still correctly shows Q1 done + Q2 current, unaffected by this fix.

### Screen 30 (Standard-B Q2, אצן/runner mass-loss question) — verified correct

Text matches script slide 90 exactly, including the "no hint button on this question" detail. 2-attempt select/check/feedback flow verified live. Continue correctly routes to screen 31 (Class Task transition).

### Screens 31–43 (Class Task + Advanced) — re-verified, no regressions

Quick re-verification pass (these were deeply audited/fixed in prior sessions): class task transition/instructions/Galileo popup/reflection form/wrap-up (31-34) and all advanced screens (35-43, applet guide + Q1a/Q1b + Q2 + Q3 + Q4 + Q5) all still render and behave correctly. No new issues found, no regressions from this session's earlier fixes.

### Real bugs found and fixed: Screens 44–47 (Peak transition + all 3 Peak questions) — severe, previously-undiscovered layout failures

This is the area WORK_PROGRESS itself had already flagged as suspect ("peak screens spot-checked only for navigation, not for the missing/orphaned-CSS bug class") — and live testing found the worst instance of that bug class in the whole project:

- **Screen 44 (Peak-question intro transition)**: was sharing a stale CSS block literally titled "Screens 43 & 44: End screens" — a leftover from an *earlier* renumbering, before the real end screens moved to their current position (48/49, which already have their own correct dedicated block elsewhere). Because screen 44 was swept into that old block by coincidence of its current number, it got END-SCREEN styling (bigtitle/subtitle/char only) instead of its own needed TRANSITION-WITH-BUBBLE styling (suptitle + bubble were completely unstyled). Symptom in Preview: the suptitle text rendered unpositioned above the visible canvas (overflowing into the letterboxed area), the reminder speech-bubble rendered as an empty outlined box with its text flowing below it instead of inside it, and — separately — the screen was also missing from the master shared `[data-screen] .s0-content/.s0-text` layout list entirely, so its content block wasn't even flex-centered. Fixed in [css/style.css](css/style.css): removed the stale 44/45-scoped end-screen block, added a complete dedicated block for screen 44 modeled on screen 35's identical suptitle+bigtitle+subtitle+bubble+char structure, and added "44" to the shared `.s0-content`/`.s0-text` layout lists. Character gif still doesn't render (`char-orange-medal.gif` genuinely missing from assets — pre-existing, documented in LOCAL_SETUP.md, not fixable here) but everything else — text position, bubble shape and text, entrance stagger, continue-button enable — now works correctly.
- **Screens 45, 46, 47 (Peak Q1/Q2/Q3, the three sections of the single peak question)**: had **zero CSS scoped to them anywhere in the file** — a complete version of the same orphaned-screen bug found repeatedly in past sessions, just never caught here because these three screens hadn't been through a real Preview click-through before. Symptom: progress-bar labels rendered as plain stacked text overflowing above the canvas; all 4 (or 2, for the true/false screen) answer options rendered crushed onto a single overlapping line; no visible image-placeholder box despite a zoom button floating with nothing to zoom. Root cause confirmed by checking the shared engine classes (`.s15-progress` family, `.s11-context/-question/-options/-option/-radio/-feedback/-hint-*`, `.sadv-layout/-qa-area/-img-area/-img-placeholder/-img`) that Advanced Q1a/Q1b (screens 37/38) already use correctly and successfully — every one of those ~55 shared selector groups listed 37 and 38 but never 45/46/47. Fixed by programmatically adding "45", "46", "47" to every selector group that already covered "37"/"38" (55 insertion points across [css/style.css](css/style.css)) — after catching and correcting one self-introduced bug from the bulk edit (3 duplicated selector lines each opening their own unmatched `{`, the same "brace-balance" trap flagged in an earlier session's notes; caught via a brace-count script before considering the change done, `node --check` and a `<section>`/`</section>` tag-count check on index.html also run clean). Screen 46 additionally uses a `.saq-statements`/`.saq-stmt` true/false component that turned out to already be globally/unscoped-styled, so it needed no screen-specific addition. Verified all three screens end-to-end in Preview: full text match against script slides 130-143, real click-throughs (select → check → feedback → continue) with an intentionally-correct answer on each of the 3 sections, confirmed `routeAfterPeak()` correctly sends a 3/3 learner to the success screen.
- Re-verified screens 37/38/42 (which share many of the same selector lists that got the bulk edit) still render correctly — no regression from the mass CSS insertion.

### Screens 48–49 (End Fail/Success) — verified correct, no changes needed

Both already had their own correct, complete CSS (from an earlier session) and were unaffected by anything in this pass. Text matches script slides 144-145 exactly; End-Fail's character gif (`char-orange-scales.gif`) renders correctly; End-Success's character gif is the same missing `char-orange-medal.gif` asset noted above (pre-existing gap, not new).

### Documentation touched this session

Updated [LOCAL_SETUP.md](LOCAL_SETUP.md)'s note on the missing medal gif to reflect that it's referenced from *two* places now (screen 44's `GEN_DATA[39]` and screen 49's `GEN_DATA[44]`) and fixed a stale screen-number reference in that note (was "data-screen=46", corrected to 49).

---

## Session 2026-07-18 (continuation): Removed the orphaned data-screen="40" question

User flagged that a question ("ב. אחרי שמערבבים את 300 גרם הסוכר בתוך הקנקן עם המים, שערו — מה יקרה למסה?") was loading on data-screen="40" and asked to verify it against the script/Figma.

Checked script slides 108-112 (the real Advanced Q2, sugar question) in full: it's a single-part ValueInputQuestion ("סך מסת הסוכר הנדרשת לקנקן היא ___ גרם, שהם ___ ק"ג"), already correctly and fully implemented on data-screen="39". No section ב exists for this question anywhere in the script — the "sugar dissolving in water" scenario on screen 40 has no basis in the script at all. This matched an existing code comment on that screen already calling it "ORPHANED ... has no basis anywhere in the production script." Confirmed unreachable before touching anything: grepped for `SCREEN_ADVANCED_Q2B` (the constant equal to 40) and `goTo(40)` across the whole codebase — zero call sites, meaning no screen's navigation ever pointed at it.

Removed per the user's explicit instruction:
- Deleted the `<section data-screen="40">` block from [index.html](index.html) (was `id="s36"`, the fabricated SCQ question + its feedback/hint markup).
- Removed the now-orphaned `case 40: enterScreen34();` switch entry and the `enterScreen34()` function (its only caller) from [js/main.js](js/main.js).
- Removed `GEN_DATA[35]` (the fabricated question's text/options/feedback) and `genScqState[35]` — confirmed nothing else referenced `sid=35` anywhere first.
- Removed the now-meaningless `SCREEN_ADVANCED_Q2B` constant, replaced with an explanatory comment.
- Left `TOTAL_SCREENS` at 50 unchanged (still correct — it's an exclusive upper bound and screen 49 still exists) and did not renumber or touch any other screen's `data-screen` value, nav target, or content, per the user's explicit "don't touch other screens / no refactor" instruction.

Verified in Preview: `<section>`/`</section>` count balanced (49, was 50), `node --check` clean, no `data-screen="40"` references remain outside an explanatory comment. Walked the real flow: screen 39 (sugar) → fill both fields → check → correct feedback → continue lands directly on screen 41 (rice), no console errors; back from 41 correctly returns to 39. Behavior is identical to before the fix (39→41 was already the live path) — the only change is that the dead, fabricated content is no longer sitting in the DOM where a direct/dev-tool navigation to screen 40 could have surfaced it.

### Files Changed

index.html, js/main.js, WORK_PROGRESS.md.

### Next Recommended Task

This full-unit pass (screens 0-49) is now complete for this session — every screen has been either freshly audited or re-verified with real Preview interaction, and 6 real bugs plus 1 fabricated-content issue were found and fixed along the way (carousel arrow direction, transition-screen fabricated bubble text, Standard Practice Q1's continue/back mis-navigation, Standard-B Q1's progress-bar state, and the Peak transition + all 3 Peak questions' missing CSS). Suggested next steps for a future session: (1) get the real interactive Galileo-experiment applet spec from the producer (still the only remaining true content blocker, on Advanced Q1a/Q1b); (2) resolve the "Knowledge Summary" scope question (PROJECT_BRIEF.md lists it as a required screen type, but no such screen exists anywhere in the build — flag to PM/producer, not something to guess at); (3) a pass once a Unit Figma link is actually provided, since every layout choice made across all these sessions (including this one) was based on sibling-screen precedent and script-note instructions, never against a real Figma frame.

---

## Session 2026-07-18 (continuation 2): Full-unit content-only QA against the PPTX

Scope: user asked for a content-only QA pass (no design/CSS/layout/UX changes) of the entire unit against the PPTX script, treating the script as the sole content source of truth and the existing code as untrustworthy. Extracted the full PPTX (157 slides, all text + speaker notes + modern reviewer comments/replies) to a text dump via `python-pptx`, then fanned out 6 parallel research agents to independently cross-check every screen (data-screen 0–49) against every corresponding slide, each producing a structured discrepancy report (screen id / slide # / current vs. expected text / defect type / file / location) without making any edits. Synthesized their findings into a single gap report, independently re-verified the trickiest items (slide 58, 99, 134, 142) directly against the PPTX dump myself before touching anything, then applied only the confirmed, unambiguous text-only fixes.

### Confirmed content fixes applied

- **Screen 11 (Drag&Drop summary table)**: removed an invented corner-header-cell label ("שאלה / קריטריון") that has no basis in the script — slide 27's table leaves that cell blank. `index.html`.
- **Screen 14 (Warmup Q2)**: fixed a spelling error ("שמימי" → "שמיימי", slide 35); fixed both incorrect-feedback titles to drop an extra "ה" ("התשובה לא נכונה." → "תשובה לא נכונה.", slides 34/37) and removed an inserted "ולכן" from the final-incorrect feedback body (slide 37). `js/main.js`.
- **Screen 20 (Neil Armstrong / תצפית vs הסבר מדעי)**: the "?" tooltips were showing short abbreviated glosses instead of the full definitions the script's production note specifies verbatim; replaced with the exact required text. Also added the missing inline parentheticals "(מה שרואים)" / "(הסבר של תופעה)" to the question sentence itself (slide 58 has them inline, not just in the tooltip). `index.html`.
- **Screen 36 (Applet Guide)**: added a missing 5th sentence from slide 99 ("תוצאות זמני הנחיתה הן לצורך המחשה בלבד.") that had been dropped entirely. `index.html`.
- **Screen 39 (Advanced Q2, sugar)**: added a missing parenthetical to the intro line ("(כי בלי מתמטיקה אין מדע)", slide 108); removed a fabricated "א." prefix on the sub-question (this question has no sub-parts, unlike the Peak question that legitimately uses א/ב/ג); completed a truncated hint that was missing its final clause (slide 110); added a missing comma (slide 108). `js/main.js`.
- **Screen 42 (Advanced Q4, moon)**: fixed a paraphrased/expanded hint back to the script's simpler original wording (slide 120). `js/main.js`.
- **Screen 45 (Peak Q1 / section א)**: fixed the final-incorrect-feedback title to include "ה" ("תשובה לא נכונה." → "התשובה לא נכונה."), matching both slide 134 and this screen's own first-attempt title. `js/main.js`.
- **Screen 47 (Peak Q3 / section ג, digital scale)**: fixed the correct-feedback body's closing clause to match slide 142 verbatim ("...ולכן הצג מציג ערך בגרם שזהה למסה של הגוף." → "...ולכן הצג מציג את הערך ביחידת מידה של גרם."). `js/main.js`.
- **Screen 4 (VideoScreen)**: replaced a leftover English dev label ("Video Placeholder") with the script's own Hebrew placeholder wording ("מקום לוידאו"). `index.html`.

### A near-miss caught before it shipped: screen 1 character-image "fix" was itself wrong

One research agent flagged that screen 1's two character images (`hook-char-phone.png` / `hook-char-book.png`) were assigned backwards relative to the script's description of who holds what (אוריאל = science magazine, חן = phone) — based on the filenames and the code's own inline comments. I applied that swap, then opened the actual PNG assets directly before considering it done (per this project's "always verify in Preview" rule) and discovered the **filenames themselves are misleading**: `hook-char-phone.png` visually depicts the glasses-wearing boy holding a science magazine, and `hook-char-book.png` visually depicts a girl holding a phone. The original code was already correct; the swap would have introduced a real regression. Reverted immediately and re-verified visually in Preview. Lesson for future sessions: when an asset's filename contradicts a script description, open the actual image before trusting the filename or a comment — don't reason from names alone.

### Flagged but intentionally NOT touched — genuine decision points, not text fixes

- **Screens 39 (sugar) / 42 (moon) / 47 (Peak-ג, digital scale)**: each source slide (108, 118, 139) carries an explicit reviewer thread approving the question's removal to shorten the unit ("מאשר" / "השאלה הזו יורדת/מבוטלת"). Screens 39/42 were already raised in an earlier session and the user confirmed keeping the current deck content as authoritative — so left in and only content-corrected. Screen 47 is the same pattern but hadn't been flagged before; still open, and it currently gates Peak success/fail routing (`routeAfterPeak()` requires all 3 sections correct).
- **"Knowledge Summary" screen (PPTX slides 146–157)**: independently re-confirmed via full-deck grep that this content (the "מסה תמיד נשארת קבועה" / "משקל יכול להשתנות" closing recap + suitcase/phone examples) does not exist anywhere in the build under any data-screen number. This is a new-screen build, not a text fix — still an open scoping question from prior sessions.
- **Screen 33 fabricated feedback line** ("תודה על החשיבה והשיתוף!") has no PPTX source — harmless generic text, not factually wrong, so flagged for a decision rather than silently deleted (consistent with how this project has handled fabricated-content removal before, e.g. the screen 15 bubble and the orphaned screen 40 question).
- Informational only, no action taken: screen 41 "אורז" vs. the script's own "חול" typo and screen 34 "שני" vs. the script's own "השני" typo — the code already reads better than the script's own error in both cases; reverting would reintroduce the script's mistake.

### Preview Tested

Yes — `lomda-preview` dev server via the Browser pane (`index_dev.html`), using `goTo()` calls into the iframe's content window to jump directly to specific screens (the dev sidebar's virtualized screen list resisted scripted scrolling this session). Visually verified: screen 1 (character/bubble pairing correct after revert), screen 4 (Hebrew placeholder renders), screen 11 (blank header cell, no overflow), screen 20 (inline parentheticals + tooltip layout, video still loads), screen 36 (new 5th paragraph fits without collision), screen 45 (layout unaffected by feedback-string edit). `node --check js/main.js` clean; `<section>` tag count and `data-screen` set (0–49, all 50 present) confirmed balanced after all edits.

### Files Changed

index.html, js/main.js, WORK_PROGRESS.md.

### Next Recommended Task

Get a decision on the three flagged items above (Peak-ג cut-or-keep, Knowledge Summary scope, screen 33's fabricated thank-you line) — none of them are text corrections, they're scope/content decisions. Otherwise the same three long-standing blockers carry over: Galileo applet spec from the producer, missing character gifs (runner, medal), and a real Unit Figma pass once provided.

---

## Session 2026-07-20: Targeted QA fixes across Class Task / Advanced / Peak screens

Scope: a fixed list of point fixes across data-screen 32, 34, 37, 38, 39, 41, 42, 43, 45, 46, 47 (the user's slide numbers for the post-sugar Advanced screens ran one behind the live `data-screen` values — confirmed by matching each requested fix to its actual content, e.g. "farmer.png / rice grain" text is on `data-screen="41"` not 40, "ולא עובדה מדעית" is on `data-screen="42"` not 41 — mapped explicitly before touching anything, no screen was guessed).

### Fixed

- **Screen 32** (Class Task Instructions, `s28-anim` stagger): per-element delay increased 220ms → 380ms (`enterScreen29()` in [js/main.js](js/main.js)) — same order, same animation type, just slower and clearer.
- **Screen 34** (Class Task wrap-up, `s47-*`): entrance order was title→(body+char together); changed to character → card → title → body, each its own 400ms step (`enterScreen46()`). Continue button now starts `disabled` (was missing entirely) and only enables after the full sequence, per spec.
- **Screens 37/38** (Advanced Q1 sections א/ב): the "שחזור הניסוי של גלילאו:" line was plain text inside the question paragraph — split into its own `.q-galileo-recap` element (bold, brand blue via `var(--subject-500)`), animated as its own staggered step before the question line (`scqGenEnter()`'s lead/heading handling, driven by new `recapId`/`recap` GEN_DATA fields on sids 33/50). Feedback panel's stray `overflow-y: auto` (showed a scrollbar track with nothing to scroll) changed to `hidden`.
- **Screen 39** (Advanced Q2, sugar VIQ): rebuilt from a single full-width column into the project's existing `sadv-layout` two-column pattern — question/data now sit in a right-hand `sadv-qa-area` that stays visible at all times; the fill-in sentence (and, once checked, the feedback that replaces it) sit in a left-hand box, so feedback never covers the question again. Removed the light-blue background rectangle behind the context text (now plain, right-aligned). The "על פי נתונים אלו..." line changed from blue/semibold to bold black.
- **Screen 41** (Advanced Q3, rice/farmer): added an explicit line break so "כחלק מתהליך הפיתוח..." always starts on its own line after the bold blue lead sentence, instead of sometimes flowing onto the same line depending on wrap width.
- **Screen 42** (Advanced Q4, moon): widened `.s11-col` (792px → 900px) so "...ולא עובדה מדעית?" no longer splits across two lines. This pushed the fixed-position feedback panel (`left:16, width:426`) into overlapping the options column, so `.s11-options` was independently narrowed (760px, right-anchored) to restore clearance — feedback no longer covers the options.
- **Screen 43** (Advanced Q5, roller-coaster graph): investigated the "image not showing" report — `assets/img/graph_q5.png` already exists and loads correctly (verified via `naturalWidth`/`naturalHeight`, `object-fit: contain`, no distortion). No code change needed; likely already fixed by an earlier session or a stale local cache on the reporter's end.
- **Screens 45/46/47** (Peak sections א/ב/ג): same stray `overflow-y: auto` → `hidden` fix as screens 37/38 on the feedback panel (scrollbar track with nothing to scroll). Screen 46's long blue context sentence ("דמיינו שלקחו את שלוש האריזות...") now fits on one line — narrowed `.sadv-img-area` (360px → 270px) and the layout gap (24px → 16px) specifically for this screen so the text column gained the ~95px it needed, instead of shrinking the font. Screen 47's hint text now breaks intentionally before "מה מיוחד..." so that clause reads as its own line.
- **All of the above + general rule**: the shared `.s11-hint-back-btn` rule (two blocks, covering screens 31/32/33/35/37/38/39/45/46/47 and 41/42/43) had a hardcoded `width: 196px` too narrow for "חזרה לשאלה" at 24px bold, causing it to wrap to two lines on every one of those screens. Changed to `width: auto; white-space: nowrap` in both blocks — verified one-line on 39/41/42/45/46/47 (the only ones that actually render a hint button among that set).

### Investigated, not reproduced

- "'סעיף א׳' / 'סעיף ב׳' / 'סעיף ג׳' shown oversized in a mismatched/browser-default font" — checked screens 45/46/47 directly (computed style + DOM inspection): the only visible instances of this text are the `.s15-prog-label` progress-bar spans, already styled at 20px/Assistant, matching every other progress bar in the unit. No `<h1>`–`<h6>` or unstyled heading exists anywhere in these three screens. Could not reproduce — likely already fixed in this session's uncommitted baseline before this pass started, or the report was based on a stale screenshot. Flagging rather than inventing a fix with no bug to anchor it to.

### Verified in Preview

All ten target screens (32, 34, 37, 38, 39, 41, 42, 43, 45, 46, 47) walked in Preview via `goTo()` + direct engine calls (`scqGenSelect`/`scqGenCheck`, `viqGenCheck`, `saqGenSelect`/`saqGenCheck`, hint open/close) — real state transitions, not just static screenshots: entrance animation/timing (32, 34), correct/incorrect feedback panels (37, 38, 39, 42, 45, 46), hint panels (39, 42, 45, 46, 47), image loading (41, 42/graph, 45, 46, 47). No horizontal overflow on any of the ten screens (`scrollWidth === clientWidth === 1280` checked programmatically for all). `node --check js/main.js` clean; CSS brace balance (1140/1140) and HTML `<section>` tag balance (49/49) confirmed after all edits.

### Files Changed

index.html, css/style.css, js/main.js, WORK_PROGRESS.md.

### Next Recommended Task

None of this session's ten target screens have open follow-ups. The longstanding blockers from prior sessions are unchanged: Galileo applet spec from the producer, missing character gifs (runner, medal), Knowledge Summary scope decision, and a real Unit Figma pass once provided.

---

## Session 2026-07-20 (continuation): PPTX/Figma-driven point fixes, screens 39/40(41)/41(42)/43/45

Scope: a second, more targeted round of fixes on data-screen 39, 41, 42, 43, 45 (the request's own "40"/"41" labels again ran one behind the live `data-screen` values for the post-sugar Advanced screens, exactly as in the prior session — matched by content, not number, before touching anything). PPTX = content source of truth, Unit Figma = design source of truth (no Figma link was actually reachable this session; fixes were derived from the PPTX production notes plus the asset files themselves — notably measuring `graph_q5.png` pixel-by-pixel — rather than guessed).

### Screen 39 (VIQ, sugar)

- Fixed two orphaned single words ("מדע):" and "המתכון.") each stranded alone on their own line — added `text-wrap: balance` to `.viq-question`/`.viq-context`, matching the project's existing convention for this exact problem (already used on multiple hint cards elsewhere). No width hacks needed.
- The two-column layout (question/data always visible on the right, fill-in/feedback on the left, feedback never covering the question) was already fixed in the prior session and re-verified correct here.

### Screen 41 (Advanced Q3, rice/farmer photo) — image fit

- `farmer.png` (1448×1086) was rendering with visible top/bottom letterbox gaps inside the shared 360×300 placeholder (object-fit:contain, ratio mismatch: 1.333 vs 1.2) — added a screen-scoped `[data-screen="41"] .sadv-img-placeholder { height:auto; aspect-ratio:1448/1086 }` so the placeholder matches the photo's own ratio exactly; contain now fills edge-to-edge with zero letterboxing and no distortion/cropping (safest option — didn't switch to `cover` here since the requirement explicitly prioritized "no cropping of important areas").

### Screen 42 (Advanced Q4, moon question) — feedback shape

- The feedback panel (this screen has no image/media area at all) was using a generic fallback rule shared with screens 41/43 (`top:260, left:16, width:426` — a short wide bar). Added a screen-42-only override sizing it to a 300×300 square (matching the sibling image-placeholder boxes' footprint) with `display:flex; justify-content:center` for real vertical+horizontal text centering. Verified both the short "wrong" feedback and the longer "correct" feedback body fit inside without overflow.
- Checked line-wrap and vertical spacing (progress-bar-to-content and content-to-nav-bar gaps): both already reasonable (35px/72px) — no change needed there.

### Screen 43 (Advanced Q5, roller-coaster graph) — full ImageHotspotQuestion rebuild

This was the largest fix. The existing "hotspot" implementation used 4 large rectangular click zones and colored markers (green/orange) immediately on placement — both wrong per the new spec:

- **Graph sizing**: `.hsp-graph-wrap` had no defined aspect ratio, so `object-fit:contain` was letterboxing the 2469×1278 graph inside a mismatched box, leaving large empty side-bars — AND (more seriously) making the click-overlay's coordinate space not match the image's actual visible content, so hotspots would have landed in the wrong place. Fixed with `aspect-ratio: 2469/1278; align-self:center; max-width:100%` — the graph now fills its box edge-to-edge with the overlay's percentage-space exactly matching the image's.
- **Point hotspots**: measured the exact pixel/percentage position of all 7 relevant data points directly from `graph_q5.png` via a Python/PIL color-blob analysis (4 green "weight increased" points, 3 orange "weight decreased" points — the asset itself already color-codes them; the 6 remaining points are plain blue distractors). Replaced the old 4 big rectangles with 7 small point-hotspots centered exactly on those measured coordinates.
- **Neutral pre-selection color**: all 7 candidate points now render as identical neutral accent-blue dots from screen-entry (covering the asset's own green/orange baked-in colors) — per spec, nothing should hint which group a point belongs to before checking. A selected point gets a white ring only. Correct/incorrect colors are applied only after Check, and the full solution (all 7 in their true colors) is revealed only after the final wrong attempt or on state-restore.
- **Selection logic rewrite**: replaced the old "one green slot + one orange slot" model with a generic max-2/toggle-off model (`state.selected` array of zone ids) — matches the spec exactly ("click a selected point again to deselect", "at most 2 selectable", Check enabled only once 2 are picked, order doesn't matter, correct = one pick from each group). First wrong attempt resets the picks (same convention as the SCQ engine elsewhere) and enables the hint button; final wrong attempt reveals the full solution.
- **Feedback panel**: only had a stray `overflow-y:auto` bug (scrollbar track with nothing to scroll) — fixed to `hidden`; its positioning/sizing (overlay exactly on the graph box, X top-left, centered text, doesn't reach the nav bar) was already correct.
- Verified end-to-end in Preview with **real mouse clicks** (not just direct function calls): correct pair → green markers + correct feedback; wrong pair (two greens) → red markers, feedback, hint unlocked, picks reset; second wrong attempt → full 7-point solution reveal with the learner's own (wrong) picks ringed; state-restore on back/forward navigation reproduces the same terminal state exactly.

### Screen 45 (Peak Q1, section א, ingredients.png) — image fit

- Changed from `object-fit:contain` to `cover` (screen-scoped override, `[data-screen="45"] .sadv-img` only — screens 46/47 sharing the same base rule are untouched) since `ingredients.png` is a square photo with no important content near its edges; a centered cover-crop now fills the placeholder completely with no white margins and no distortion.

### Verified in Preview

Real interaction (not just screenshots) on all five screens: 39 (line-wrap, layout unchanged/re-verified), 41 (image fit, question flow unaffected), 42 (feedback square shape, correct + incorrect feedback body text fit-tested), 43 (full click→select→toggle→check→feedback→hint→second-attempt→solution-reveal→state-restore cycle via real mouse clicks), 45 (image fit). Regression-checked sibling screens 37/38/46/47 (share CSS blocks with the ones touched) — all unaffected, screenshots confirm no visual change where none was requested. `node --check js/main.js` clean; CSS brace balance (1144/1144) and HTML `<section>` tag balance (49/49) confirmed; no horizontal overflow on any of the nine screens checked (`scrollWidth === clientWidth === 1280`).

### Files Changed

index.html (screen 39 markup unchanged from prior session, no new markup needed this round), css/style.css, js/main.js, WORK_PROGRESS.md.

### Known limitation

No Unit Figma link was available this session (PROJECT_BRIEF.md still lists it as "—, יסופק לפני פיתוח"), so screen 43's point-hotspot positions were derived from measuring the shipped `graph_q5.png` asset directly (its own baked-in green/orange dot colors) rather than from a Figma frame or an annotated production screenshot — both of which the request referenced but neither was actually reachable/attached. If a real annotated screenshot or Figma frame surfaces later, re-verify the 7 measured coordinates against it.

### Next Recommended Task

Get the real Unit Figma link (still outstanding across every session so far) to re-verify screen 43's hotspot point positions and general layout/spacing choices against an authoritative visual source instead of asset-measurement + sibling-screen precedent.

---

## Session 2026-07-20 (continuation 3): Screens 39/41/42/43 layout fixes + real video on screen 4

Scope: five specific point fixes given by the user with their own screen numbers, mapped to the live `data-screen` values by content match before touching anything (same "off by one for post-sugar Advanced screens" drift already documented in the two prior 2026-07-20 sessions): user's "39" = data-screen 39 (sugar VIQ, no offset), "40" = data-screen 41 (rice/farmer — confirmed by the farmer image), "41" = data-screen 42 (moon question — confirmed by content), "43" = data-screen 43 (hotspot graph, direct match), "4" = data-screen 4 (VideoScreen, direct match, `SCREEN_VIDEO`).

### Screen 4 (VideoScreen) — real video wired in

- Replaced the click-to-simulate placeholder with a real `<video>` element (`assets/video/video1_massmeasure.mp4`, already present in `assets/video/`). Autoplays on entry (`video.play()`, autoplay-rejection ignored — `controls` attribute lets the learner start it manually if the browser blocks autoplay); "המשך" stays disabled until the real `ended` event fires (`s4MarkWatched()`, now bound via `addEventListener('ended', …)` instead of an `onclick` simulation). The existing "לקרוא טקסט" toggle already bypassed the video immediately (unchanged) — verified this still jumps straight to the Accordion without waiting. `goTo()`'s existing global `document.querySelectorAll('video').forEach(v => v.pause())` already pauses it on navigating away, no change needed there. [index.html](index.html), [css/style.css](css/style.css), [js/main.js](js/main.js).
- Verified in Preview: video autoplays (`paused:false`, real duration 76.8s, no decode error), continue stays disabled mid-playback, dispatching a real `ended` event enables continue, and the text-path button still bypasses immediately.

### Screen 39 (Advanced Q2, sugar VIQ) — two-column split corrected

- Moved the fill-in-sentence (`.viq-sentence`, the answer inputs) from the left column into `.sadv-qa-area` (right column), alongside the intro/context/question text — previously the right column was text-only and the left column held both the inputs AND the feedback overlay stacked on it. Left column (`.sadv-img-area`) now holds only the feedback panel, which is `display:none` (empty) until Check.
- Feedback panel changed from an absolute overlay (`inset:0` over the old `.viq-fill-wrap`) to a normal top-aligned static box (`position:static`, `.sadv-img-area` given `align-items:stretch; justify-content:flex-start`) so its top edge lines up with the top of the question text on the right, instead of being vertically centered mid-column. [index.html](index.html), [css/style.css](css/style.css).
- Verified in Preview: right column shows intro+question+both number inputs at all times (never covered); wrong answer → red feedback box appears top-aligned on the left, inputs stay visible/editable on the right; closing feedback and re-submitting the correct values → green feedback, continue enabled.

### Screen 41 (Advanced Q3, rice/farmer) — animation order fixed

- The shared `scqGenEnter()` faded the whole question paragraph (blue heading + plain text + bold question, all three inner spans) in as one block, and the farmer photo had no entrance gating at all (visible immediately on screen load, before the answers appeared). Added a screen-local addition on top of the generic engine (not a change to `scqGenEnter()` itself, which other screens rely on for single-block question fades): `enterScreen35()` now staggers `.q41-lead`/`.q41-body`/`.q41-question` individually (0/400/800ms) and holds the farmer image (`#s34-img`) hidden until after the last answer option finishes revealing. Restore-on-done path shows everything instantly (no animation replay), matching the convention used elsewhere. [js/main.js](js/main.js), [css/style.css](css/style.css — `display:block` added to the three `q41-*` spans so `transform`/`opacity` animate reliably on inline elements).
- Verified in Preview (real elapsed-time polling, not just static state checks): heading appears alone first; body+bold+options follow; the farmer photo is provably still hidden at the moment all 4 options are visible, and only appears after.

### Screen 42 (Advanced Q4, moon question) — real two-column layout

- This screen previously used a single full-width `.s11-col` (900px, context+question+options all in one column) with feedback as a separately-floating fixed 300×300 square on the far left — not a real two-column split, which read as unbalanced. Restructured to the same `.sadv-layout`/`.sadv-qa-area`/`.sadv-img-area` pattern already used by sibling Advanced screens (this CSS already existed, scoped to "42", but was dormant/unused since the HTML didn't have those classes — now wired up for real). Right column: context+question+4 options (now filling the column's full width instead of a narrowed 760px). Left column: feedback only, top-aligned with the right column's content, `min-height:420px` so it reads as roughly balanced against the tall context+question+4-option block. Removed the now-dead `.s11-col`/`.s11-options` width overrides scoped to "42". [index.html](index.html), [css/style.css](css/style.css).
- Verified in Preview: right column shows the full question and all 4 options unobstructed; after Check, feedback appears as a tall box on the left, top-aligned with the question, roughly matching the answer column's height.

### Screen 43 (Advanced Q5, hotspot roller-coaster graph)

- **Investigated the reported "only 2 hotspot points are clickable" bug — not reproducible in the current code.** Tested thoroughly before changing anything: `elementFromPoint` on all 7 marker centers resolves to the marker itself (no CSS stacking/overlap issue), and real `.click()` dispatches on arbitrary pairs of the 7 zones (not just one fixed pair) correctly toggle selection, enforce the max-2 cap, allow deselect-and-reselect of any point, and validate the green+orange pairing rule on Check. This matches the full `hspGen*` engine rebuild already completed earlier the same day (see the "PPTX/Figma-driven point fixes" session above) — the reported bug was very likely from before that rebuild landed. No code change was needed for the click logic itself; verified rather than assumed.
- **Legend + graph layout — genuinely fixed.** The legend was a horizontal row *above* the graph; now restructured into a `.hsp-graph-row` (graph first in DOM, legend second — under RTL this alone puts the legend physically left of the graph with no row-reverse trick needed) with the legend as a vertical stack (`flex-direction:column`, even `gap:20px`, vertically centered against the graph's height). This also naturally shifts the graph rightward, since it now shares the row's width with the legend column instead of spanning the full width — satisfying the "move the graph slightly right" ask as a side effect of the same change, not a separate nudge.
  - First attempt at this made the graph overflow `.hsp-col`'s fixed vertical space: giving `.hsp-graph-wrap` `flex:1` on the row's main axis let its *width* drive the aspect-ratio calculation, and since the row is much wider than tall, that produced an oversized height. Fixed by flipping which dimension is constrained: the row now stretches the graph box to the full available height (`align-items:stretch`), and the graph's width is derived FROM that height via `aspect-ratio: 2469/1278` (not the reverse) — this is what keeps `graph_q5.png` filling its box with no letterboxing/distortion while also not overflowing the screen.
  - Zoom button (`.img-zoom-btn` / `data-zoom-from="s36-img"`) was already fully wired to the shared `#img-zoom-modal` — verified it opens with the correct image; no change needed, it just wasn't visually obvious next to the horizontal legend before.
  - [index.html](index.html), [css/style.css](css/style.css).
- Verified in Preview: legend renders as two vertically-stacked, evenly-spaced items to the graph's left; graph fits with no overflow/scrollbars and no distortion; zoom modal opens with the graph image; full click→select→toggle→check→correct-feedback cycle re-tested end-to-end with a fresh pair of points (g4+o3) after the layout change, still works.

### Verified in Preview (all five screens)

`node --check js/main.js` clean; CSS brace balance (1144/1144) and HTML `<section>` (49/49) / `<div>` (915/915) tag balance confirmed after all edits. Regression-checked sibling screens 37 (shares `.s11-col`/`.s11-anim`/etc. with 42's old block) and 45 (shares `.sadv-layout`/`.sadv-img` with 39/41/42) — both render unaffected.

### Files Changed

index.html, css/style.css, js/main.js, WORK_PROGRESS.md.

### Next Recommended Task

Same long-standing blockers as before: Galileo applet spec from the producer, missing character gifs (runner, medal), Knowledge Summary scope decision, and a real Unit Figma pass once provided (every layout choice across all sessions, including this one, was made from sibling-screen precedent and the user's own explicit descriptions — never against a real Figma frame).

---

## Session 2026-07-21: Four targeted point fixes — screens 39, 41, 42, 43 (user's "39/40/41/42")

Scope: a fixed list of 4 point fixes given with the user's own screen numbers, mapped to live `data-screen` values by content match before touching anything (same "off by one for post-sugar Advanced screens" drift documented in prior 2026-07-20 sessions): user's "39"→data-screen 39 (sugar VIQ, no offset), "40"→41 (rice/farmer), "41"→42 (moon Q4, confirmed by "no image on this screen" in the request), "42"→43 (ImageHotspotQuestion, direct match).

### Screen 39 (Advanced Q2, sugar VIQ)

- **One-line completion sentence**: widened `.sadv-qa-area` from an even 50/50 split to a fixed `flex: 0 0 700px` (freeing the rest for the feedback column) and switched `.viq-sentence` from `flex-wrap: wrap` to `nowrap`. Kept font-size unchanged (22px). Verified natural content width (~640px) now fits inside 700px with margin.
- **Regular weight**: `.viq-prefix`/`.viq-unit` were `font-weight: 600` — changed to 400 (Regular), matching the rest of the sentence body.
- **Layout**: feedback column (`.sadv-img-area`) changed from `justify-content: flex-start` to `center` so the feedback card is vertically centered in the left column (verified via computed rects: card center = column center). Nudged `.sadv-layout` top 139px → 165px for visual balance now that the sentence no longer wraps to 2 lines.
- Files: `css/style.css`.

### Screen 41 (Advanced Q3, rice/farmer)

- **Reduced line-height** in the question text block (`.q41-lead`/`.q41-body`/`.q41-question`, all children of `[data-screen="41"] .s11-question`) from 1.5 to 1.4, matching the line-height convention used by every other question-text block in the unit (`.s11-question` elsewhere, `.s17-question`, etc. all use 1.4). Font-size untouched. Split the previously-shared `[data-screen="41"], [data-screen="42"], [data-screen="43"] .s11-question` line-height rule so 42/43 keep their original 1.5 — this screen's fix does not affect its siblings (regression-checked both).
- Files: `css/style.css`.

### Screen 42 (Advanced Q4, moon question)

- **Orphan word fix**: added `text-wrap: balance` to `[data-screen="42"] .s11-question` — the question now wraps as two naturally-balanced lines instead of stranding "מדעית" alone on its own line. Scoped to this screen only.
- **Feedback resize**: the feedback card (`.s11-feedback`) previously had `min-height: 420px` — stretching it nearly the full column height regardless of the actual options block. Replaced with `position: absolute; top: 194px; height: 276px` relative to `.sadv-img-area` (itself given `position: relative`), measured to exactly match the live top/bottom of the 4-option block (`#s35-options`, top 338px/bottom 614px in canvas coordinates — confirmed via `getBoundingClientRect()` before and after). Feedback card is now left of the options, top-aligned to the first option, and roughly the height of the 4 options — not stretched to the column's full height. Verified both the short "wrong" feedback and the longer "correct" feedback body fit with no overflow (`scrollHeight === clientHeight`).
- Files: `css/style.css`.

### Screen 43 (Advanced Q5, ImageHotspotQuestion — roller-coaster graph)

- **Root cause of "only the correct points are clickable"**: `GEN_DATA[38].zones` only ever defined 7 hotspot zones (4 green "weight increased" + 3 orange "weight decreased" points) — but `graph_q5.png` actually bakes in **13** colored data points (confirmed via a Python/PIL connected-component color-blob scan of the asset: 4 green, 3 orange, and **6 additional blue "neutral/baseline" points** the code had never defined a zone for at all). The 6 blue points were therefore inert — not a selective-enable bug, just missing zone data.
- **Fix**: added 6 new zones (`b1`–`b6`, `color: 'blue'`) at the exact measured coordinates, same click-radius convention as the existing zones. The hotspot engine (`hspGen*` in `js/main.js`) is fully generic over `cfg.zones` — rendering, hit-testing, toggling, and max-2 selection all already looped over every zone with no special-casing, so adding the 6 entries was sufficient to make every one of the 13 points clickable/selectable/deselectable with no other JS changes. Correctness logic (`groupsPicked` must be exactly one `green` + one `orange`) already naturally rejects any pair involving a `blue` point.
- Added a matching `.hsp-marker--reveal-blue` CSS rule (same neutral accent-blue as the pre-check dot color) so the 6 baseline points render consistently — not implying correctness — during the full-solution reveal (final wrong attempt / state-restore).
- Verified with real mouse clicks (not just function calls) via the Browser pane: a previously-dead blue point is now selectable and deselectable; selecting 2 already-selected + a 3rd point is correctly ignored (max-2 cap still holds); a green+orange pair correctly passes Check; a blue+blue pair correctly fails on attempt 1, and a second wrong attempt (blue+green) correctly reveals the full 13-point solution with the right colors and the learner's own picks ringed; state-restore (navigate away and back) reproduces the identical reveal state.
- Files: `js/main.js`, `css/style.css`.

### Verified in Preview

All 4 screens walked with real interaction (not just static screenshots): 39 (fill both fields → check → correct feedback, continue → lands on 41 as before), 41 (visual line-height comparison, no content/logic change), 42 (select → check → feedback shape/position, orphan-word wrap), 43 (full click→toggle→max-2→check→feedback→second-attempt→reveal→state-restore cycle with real mouse clicks on both old and newly-added points). Regression-checked sibling screens sharing touched CSS blocks (37, 38, 45, 46, 47, 29, 30) — all render with unchanged font-weight/line-height, confirming the screen-41/42 splits didn't leak. `node --check js/main.js` clean; CSS brace balance (1147/1147) and HTML `<section>` (49/49) / `<div>` (915/915) tag balance confirmed. No horizontal overflow on any of the 4 screens (`scrollWidth === clientWidth === 1280`).

### Files Changed

css/style.css, js/main.js, WORK_PROGRESS.md.

### Next Recommended Task

Same long-standing blockers as before: Galileo applet spec from the producer, missing character gifs (runner, medal), Knowledge Summary scope decision, and a real Unit Figma pass once provided.

---

## Session 2026-07-21 (continuation): Second round of point fixes on the same 4 screens

Scope: 4 more point fixes on screens 39/41/42/43 (same mapping as the prior entry above), given right after that round shipped.

### Screen 39 (sugar VIQ) — feedback text not centered

- Root cause: `.s11-fb-title` is `flex:1` sitting next to the fixed-width close button inside a flex row (`.s11-fb-head`), so `text-align:center` only centered the title within the space left over after the button — visibly offset ~31px from the card's true center (measured via `getBoundingClientRect`: title center 305px vs card center 274px before the fix; body happened to already read as centered by coincidence of its own width).
- Fix: took the close button out of flow (`position:absolute; left:0`) and let `.s11-fb-title` span the card's full width (`flex:none; width:100%`), scoped to `[data-screen="39"]` only. Verified after the fix: title/body/card centers all equal 274px, for both the short "wrong" feedback and the longer "correct" feedback body.
- Files: `css/style.css`.

### Screen 41 (rice/farmer) — image loads with the placeholder instead of after it, extra line-gap above the body text

- **Image timing**: the code already delayed the photo's fade-in until after the last answer option finished revealing, but the gap was razor-thin (~50ms after the last option's own 350ms transition completed) — easy to perceive as simultaneous. Widened the buffer in `enterScreen35()`'s `imgDelay` calculation from `+400` to `+700` (2000ms → 2300ms total for this screen's 4 options), giving a clearly perceptible pause. Verified the exact scheduled delay via a `setTimeout` instrumentation wrapper (not just visual inspection, which is unreliable at this timescale over a remote browser): `[0,1000,1200,1400,1600, 0,400,800, 2300]`.
- **Extra line-gap**: found a real bug — `GEN_DATA[36].question` had a literal `<br>` between the `q41-lead` (blue heading) and `q41-body` (regular text) spans, but both are `display:block` (already start on their own line without help) — the `<br>` therefore inserted one whole *extra* blank line (measured gap = 30.8px = exactly one line-height, before the fix). Removed the redundant `<br>`; gap is now 0 (natural single line-break between the two blocks, no overlap).
- Files: `js/main.js`.

### Screen 42 (moon Q4) — inconsistent text size

- Root cause: `[data-screen="42"] .s11-question` was accidentally caught in a *second*, later-declared CSS block meant only for screens 41/43 (`font-size:22px`), silently overriding the correct 24px it should inherit from the shared family it actually belongs to (33/37/38/45/46/47/42, all at 24px/1.4 line-height) — the same "screen swept into the wrong shared selector list" bug class flagged repeatedly elsewhere in this project's history. Context text (20px) and options (22px) were already correct/consistent with siblings; only the question line was off.
- Fix: removed "42" from the 41/43-only 22px+1.5-line-height block; screen 42 now correctly falls through to the earlier 24px/1.4-line-height block (confirmed via computed style: 24px, 33.6px line-height, matching screen 37/45/46/47). Kept the `text-wrap:balance` addition from the prior round (still needed, re-verified the two-line wrap stays balanced at the larger size, no overflow).
- Files: `css/style.css`.

### Screen 43 (ImageHotspotQuestion) — markers should show the image's real dot colors, not neutral blue

- The prior round's fix made all 13 points clickable, but kept the *pre-existing* design choice of rendering every candidate dot as neutral blue before Check (to avoid hinting the answer). The user flagged this as wrong: the markers should match the color already baked into the graph (green/orange/blue), not paint over it with a uniform blue.
- Fix: `hspGenRenderMarkers()` now sets each dot's class to `hsp-marker--` + its true `zone.color` (green/orange/blue) instead of a hardcoded `--neutral`. Added CSS `.hsp-marker--green`/`--orange`/`--blue` using the exact RGB values measured from `graph_q5.png` itself (140,200,80 / 250,190,0 / 0,150,220) so the overlay sits seamlessly on the image's own dots. Updated `hspGenColorMarkers()` (the post-Check colorer) to strip all three color classes (previously only stripped the now-removed `--neutral`) before applying `--correct`/`--incorrect`. Removed the now-dead `.hsp-marker--neutral` CSS rule (confirmed zero remaining references first).
- Verified: full click→toggle→max-2→check(correct pair)→feedback cycle still works with the new coloring; no other logic (selection, correctness, reveal) changed.
- Files: `js/main.js`, `css/style.css`.

### Verified in Preview

All 4 screens re-checked with real interaction after the changes: 39 (feedback centering measured via `getBoundingClientRect`, both feedback variants), 41 (line-gap measurement before/after, image-delay instrumentation), 42 (computed font-size/line-height before/after), 43 (visual color check + full interaction cycle). `node --check js/main.js` clean; CSS brace balance (1151/1151) and HTML `<section>`/`<div>` tag balance (49/49, 915/915) confirmed. No horizontal overflow on any of the 4 screens.

Note: mid-session the Browser pane tab entered a stale state where `window.innerWidth/innerHeight` read 0 despite the page rendering correctly on screen (confirmed via screenshot) — cost significant back-and-forth before being traced to the tool's tab context, not the app. Resolved by opening a fresh tab. Flagging in case it recurs in a future session — a fresh tab is the fix, not a code change.

### Files Changed

css/style.css, js/main.js, WORK_PROGRESS.md.

### Next Recommended Task

Same long-standing blockers as before: Galileo applet spec from the producer, missing character gifs (runner, medal), Knowledge Summary scope decision, and a real Unit Figma pass once provided.

---

## Session 2026-07-21 (continuation 2): Three more point fixes — screens 41, 42, 43

Scope: 3 targeted point fixes given directly with live `data-screen` numbers this time (no off-by-one — confirmed each against its actual content before touching anything): 41 (rice/farmer photo entrance), 42 (feedback centering), 43 (hotspot marker color).

### Screen 41 (rice/farmer) — investigated, already correct, no change made

The ask: the image placeholder must exist as part of the layout from the very start (fixed size, no shifting of other elements), with only the photo itself fading in last. Verified this empirically (not just by reading code) using `getBoundingClientRect()` at the moment of screen entry in a fresh Preview tab (avoiding the known stale-`window.innerWidth` tab bug — see note below): at t=0 `.sadv-img-placeholder` already renders at its full fixed size (360×270px, positioned edge-to-edge with the question column, which already sits at its final 816px width) with the photo at `opacity:0`; the photo fades to `opacity:1` only after all 4 answer options finish revealing (~2.3s), with no change to either column's size/position at any point. This was already implemented correctly (from an earlier round the same day — see the "Screen 41 (rice/farmer) — image loads with the placeholder instead of after it" entry above); confirmed no regression and made no changes.

### Screen 42 (moon question) — feedback now genuinely centered

Root cause: the feedback card was absolutely positioned at a hardcoded `top:194px; height:276px` (from an earlier round that aligned it to the 4-option block's own top/bottom) inside a column with `align-items:stretch; justify-content:flex-start`. Measured via `getBoundingClientRect()`: column spans y144–633 (center 388.5), but the card spanned y338–614 (center 476) — offset ~87px low, with 194px of empty space above it and only 19px below. Not centered, and inconsistent with how every other feedback card in the unit is positioned (a compact card centered in its column via flexbox, not pinned to a fixed pixel offset).

Fix: removed the screen-42-specific `.sadv-img-area` override entirely (so it falls back to the shared base rule's `align-items:center; justify-content:center`), and changed `.s11-feedback` for this screen from `position:absolute` with a fixed height to `position:static; width:100%` — letting the card size to its own content and be centered by the parent flex container. `css/style.css`.

Verified in Preview (fresh tab, real `scqGenSelect`/`scqGenCheck` calls): both the short "wrong" feedback and the long "correct" feedback body now measure with an exactly-equal gap above and below (column center = card center = 388.5px in both cases, confirmed via `getBoundingClientRect`), and neither variant overflows the column.

### Screen 43 (roller-coaster hotspot graph) — marker orange corrected to match the legend

Root cause: `.hsp-marker--orange` (the color used for all "weight decreased" points before Check) was set to `rgb(250,190,0)` — a color measured directly from the raw graph asset's baked-in pixels in an earlier session — which reads as yellow/gold, not orange. This didn't match `.hsp-legend-dot--orange` (`#e67e22`, a true orange) or even the hotspot engine's own post-reveal color `.hsp-marker--reveal-orange` (already `#e67e22`) — i.e. the live/selectable dots and the legend/reveal-state dots were already inconsistent with each other before this fix.

Fix: changed `.hsp-marker--orange` from `rgb(250,190,0)` to `#e67e22`, exactly matching the legend swatch and the reveal-state color. Did not touch `.hsp-marker--green`/`--blue` (not reported, and green already reads as green — only orange was flagged as wrong). `css/style.css`.

Verified in Preview (real clicks — `.click()` on the actual marker buttons, not just direct function calls): selected a green + orange pair, confirmed via computed `background-color` that the orange marker now renders `#e67e22` identically to the legend dot; full select→toggle→max-2→check→correct-feedback cycle re-tested end-to-end and still works (feedback overlay, "המשך" enabling).

### Note: recurring stale-tab bug

Hit the same `window.innerWidth`/`innerHeight` reading `0` issue documented in the prior 2026-07-21 session (all `getBoundingClientRect()` calls return all-zero rects when this happens, even though the page renders correctly on screen and `getComputedStyle` still returns real values) — again traced to the Browser-pane tab, not the app. Fix each time was opening a fresh tab via `tabs_create`. Flagging again since it's now recurred across two consecutive sessions — worth being aware of from the start rather than re-diagnosing it each time a `getBoundingClientRect()` call unexpectedly returns zeros.

### Verified in Preview

All 3 screens checked with real interaction in freshly-opened tabs (not the possibly-stale seed tab): 41 (rect measurements at multiple points in the entrance timeline, confirmed no layout shift), 42 (both feedback variants, `getBoundingClientRect` centering math), 43 (real `.click()` on marker buttons, computed-style color check, full check/feedback cycle). `node --check js/main.js` clean; CSS brace balance (1150/1150, down by 1 from removing the screen-42 `.sadv-img-area` override rule — expected, not a bug) confirmed after edits.

### Files Changed

css/style.css, WORK_PROGRESS.md.

### Next Recommended Task

Same long-standing blockers as before: Galileo applet spec from the producer, missing character gifs (runner, medal), Knowledge Summary scope decision, and a real Unit Figma pass once provided.

---

## Session 2026-07-21 (continuation 2): Full-unit polish pass — animation consistency, progress-bar active indicator, typography (24px default)

Scope: user asked for a unit-wide polish pass across all 50 screens on three axes: (1) consistent entrance-animation ordering per template (title → body → emphasis → media → interactive, with answer options staggering in one-by-one instead of appearing at once), (2) a stronger visual indicator for the active/current step in every question-series progress bar, (3) unifying body/question/paragraph text to a 24px default unless a screen has a real reason to deviate. No content changes, no unrelated refactor. Started with 3 parallel read-only audit agents (animation, progress-bar, typography) covering the full `index.html`/`css/style.css`/`js/main.js`, then applied fixes directly, verified via `node --check`, brace/tag-balance counts, and live Preview click-throughs across a representative sample of every affected screen family.

### 1. Progress-bar active-step halo

Added one consolidated, unscoped CSS rule (`css/style.css`, end of the progress-engine section) giving `.s12-prog-dot.is-current` / `.s13-prog-dot.is-current` / `.s15-prog-dot.is-current` a soft `box-shadow: 0 0 0 4px rgba(1,157,229,0.28)` halo — `--subject-500` at 28% opacity, matching the existing precedent on `.hsp-marker.is-selected`. This is a single addition covering every progress-bar family and all ~22 screens that use one (13,14,16-20,23,25-27,29,30,37-39,41-43,45-47), rather than editing each duplicated per-screen block. Verified visually in Preview (screens 13, 19, 39, 45) — the current step now reads as a clearly distinct halo ring at a glance, done/upcoming steps unchanged, no other visual change.

### 2. Typography — 24px default for body/question/paragraph text

Fixed the two true non-token stray values (`.hook-orange-text` 17px, two `.s12-bubble-text` instances at 16px on screens 28/31) up to the already-established 20px sibling convention. Bumped every clear-cut body/paragraph/question/feedback text block identified by the audit from 20px/22px to 24px — `.viq-question`/`.viq-context` (39), peak/advanced `.s11-context` (33,37,38,41,42,43,45,46,47), `.s11-question` overrides on 18/31/35/41/43, `.hsp-question` (41,43), `.s5-body p`/`.s5-instruction` (5), `.s9-card-body p` (9), `.guide-body` (36), `.s28-subtitle`/`.s28-step-text`/`.s28-body`/`.s28-reminder-title/body` (32,34), `.s-galileo-body` (21,22), `.s6-instructions`/`.s6-info-bubble`/`.s7-panel-label`/`.s7-info-bubble`/`.s8-info-chip`/`.s8-answer-bubble` (6,7,8), `.s10c-card-text` (10), the whole `.s11-fb-body`/`.s12-fb-body`/`.s13-fb-body`/`.s17q-fb-body`/`.s18q-fb-body`/`#s20q-fb-body`/`.s23-fb-body` feedback-body family (nearly every question screen), and the screen-20/21/22 dropdown-value/cell-label instances that were a genuine inconsistency (same component sat at 24px on siblings 18/19/26 but 20-22px here — unified to 24px). ~40 individual declarations touched across the file; verified in Preview (screens 5, 6, 7, 39, 45) that none of these wrap/overflow at the larger size.

**Left as documented exceptions (24px not used), with reason:**
- Speech-bubble dialogue text — `.hook-orange-text`, `.s1-bub-body` (screen 1), `.s12-bubble-text` family (screens 22,26,28,31,35,42,44) — kept at 20px. Reason: fixed-size speech-bubble SVG/PNG asset constrains the text area; a prior session already tuned the bubble width specifically for a 2-line wrap at this size, and bumping risks breaking that fit or wrapping into 3+ lines inside a fixed graphic.
- Answer-option/pill text — `.s11-option-text` (shared across ~20 screens), `.s3-card-label` (3), `.s13-option-text` (14), `.s23-opt-text` (23), `.s12-dd-value`/`.s12-dd-option` (13) — kept at 22px. Reason: this is the 720 design system's own approved **Question** typography category (token `--t-q` = 22px), a deliberate systemic choice applied identically across nearly every SCQ/pill/dropdown screen in the unit — not an accidental slip. The one genuine outlier (screens 41/43 sitting at 20px instead of the 22px every sibling uses) was fixed for internal consistency, but the category itself was left at 22px rather than reopening ~8 shared CSS blocks and every answer-pill width in the unit on a judgment call with no Unit Figma to verify against.
- VIQ fill-in sentence — `.viq-subq`/`.viq-sentence`/`.viq-input` (screen 39) — kept at 22px. Reason: this is a `white-space:nowrap` fill-in-the-blank sentence inside a column already measured/tuned (a prior session's own note: "verified natural content width ~640px fits inside 700px") — bumping the font risks pushing it past that tuned width and wrapping.
- Short feedback/hint titles — `.s11-fb-title`, `.s12-fb-title`, `.s13-fb-title`, `.s17q-fb-title`, `.s18q-fb-title`, etc. (dozens of screens) — kept at 20-22px. Reason: these are short headline labels ("נכון!" / "לא נכון"), a heading role, not running body prose.
- Compact form-field labels/inputs — `.s29-label`/`.s29-input`/`.s29-textarea` (33, Class Task reflection form), `.s8-field-label`/`.s8-textarea` (8) — kept at 20px. Reason: field labels/inputs, not paragraph text.
- Table/drag-drop cell text — `.s10-cell`/`.s10-header`/`.s10-cell-item`/`.s10-bank-item` (11), `.saq-stmt-text` (46) — kept at 20px. Reason: fixed-height table/pill cells; genuine space constraint, not verified against overflow but flagged as a real (not just cosmetic) exemption per the brief's own guidance to report rather than silently change.
- `.s20-video-caption` (20) — kept at 20px. Reason: a caption/label under a video, not body prose.
- Progress-bar step-number labels, tooltip "i" glyphs, dev-only placeholder labels — untouched, per the brief's own explicit exemption for compact labels.

### 3. Animation consistency — canonical order (title → body → emphasis → media → interactive, options stagger one-by-one)

**Generic engines (highest leverage — one fix covers many screens):**
- `scqGenEnter` (js/main.js) — now stages `[heading/recap → context → question] → image (media) → options` instead of only `[heading, question] → options` with the image appearing instantly/unanimated. Added the `s11-anim` class to the 4 previously-unanimated context elements (screens 42,45,46,47) and 6 previously-unanimated images (screens 30,37,38,45,46,47). Affects every SCQ/SCQImage screen in the Advanced/Peak/Standard-B families.
- `ddqGenEnter` had zero entrance animation; its one live screen (26, Basic Q2 matching) now stages "התאימו בין..." → each of the 4 matching rows individually (250ms apart) instead of the whole grid as one block.
- `viqGenEnter` (screen 39, sugar VIQ) had zero animation; now stages question → context → sub-question → the fill-in sentence/inputs last.
- `hspGenEnter` (screen 43, hotspot graph) had zero animation; now stages the question's inner lead/body/question spans individually, then the graph+legend (media) fades in last.
- `saqGenEnter` (screen 46, true/false statements) had zero animation; now stages context → question → image → each statement row individually.

**Zero-animation screens fixed directly:** 3 (TwoOptionSelection — title then each option card staggers in), 5 (Accordion — instruction then each of the 4 accordion items staggers in), 7 (Earth/Moon comparison — Earth panel first, then Moon panel's label, then its clickable image last; used an opacity-only fade on the image wrap specifically to avoid giving it a transform-induced stacking context, since that element is also the `.img-zoom-btn`'s direct positioning parent), 11 (DragAndDrop table — title/subtitle → table → item bank).

**TransitionScreen bespoke order unified:** fixed screen 24 (character was animating first; now text-then-character like every sibling transition) and screens 31/35/44 (bubble was animating after the character; now bubble-before-character like the majority). Screen 34 (Class Task wrap-up) was deliberately left character-first — a prior session's explicit, documented design choice where the bubble and character are meant to read as one merged visual component (bubble tail overlapping the character via negative margin), not a copy-paste inconsistency.

**Media-before-text screens fixed:** 6 (astronaut/Earth — instruction text now appears before the clickable image, was reversed), 17 and 18 (Practice Q1/Q3 story+image questions — explanation/question text now precedes the image; previously the image interrupted the text mid-sequence).

**Non-staggered "answer area as one block" screens fixed:** 13 (Warmup Q1, 2 dropdown rows), 19 (7-word DropdownQuestion, 7 rows), 20 (Neil Armstrong dropdown, also reordered so text precedes the video) — all now stagger each row individually instead of fading in the whole grid at once.

Removed the dead, never-referenced `@keyframes floatIn` (css/style.css).

### Verified in Preview

`lomda-preview` dev server, real `goTo()` navigation + live screenshots + console-error checks across every touched screen family: 0 (regression, transition screens still correct), 3, 5, 6, 7, 11, 13, 17, 19, 20, 24, 26, 35, 37 (regression check on a scqGenEnter-shared screen), 39, 43, 44, 45, 46. Confirmed via computed `box-shadow` that the progress-bar halo renders (`rgba(1, 157, 229, 0.28) 0px 0px 0px 4px`). Confirmed via class-state checks at t=0 that staggered elements start hidden (not simply always-visible) on screens 3, 45. `node --check js/main.js` clean; CSS brace balance and HTML `<section>`/`<div>` tag balance confirmed after every edit batch. No console errors, no visual overflow on any checked screen.

Not exhaustively re-verified: full click-through interaction (select→check→feedback) on every one of the ~40 screens whose CSS/JS was touched — the sample above covers at least one screen from every affected family/engine, but a future session should do a complete pass if time allows, especially for the Peak/Advanced screens' full attempt/hint cycles post-animation-change (the animation changes don't touch selection/check/feedback logic, only entrance timing, so risk is low).

### Files Changed

index.html, css/style.css, js/main.js, SESSION_TASK.md, WORK_PROGRESS.md.

### Next Recommended Task

Same long-standing blockers as before (Galileo applet spec, missing character gifs, Knowledge Summary scope decision, real Unit Figma pass). New from this session: if a real Unit Figma ever arrives, re-verify the 22px "Question" answer-pill category and the handful of documented 20px exceptions above against it — every judgment call in this pass was made from the 720 design-system tokens and internal consistency, not a Figma frame.

---

## Session 2026-07-21 (continuation 3): Second QA round — screens 6/10, SCQ animation unification, GIF→MP4 migration

Scope: a fixed list of point fixes (screen 6 image size, screen 10 carousel width + arrow direction, unify SCQ entrance animation unit-wide, replace GIF character media with the newly-delivered MP4 files on 10 named screens).

### Screen 6 (Earth-only astronaut) — image oversized, caused real overflow

Measured via `getBoundingClientRect()` before touching anything: the panel's content (instructions + 400×400 image + info-bubble) summed to 688px including bottom padding, but the content area is only 630px tall — a genuine 53px overflow into the nav-bar zone, not just a proportion complaint. Fixed by reducing `.s6-astro-wrap`/`.s6-astro-img` from 400px → 330px (both height and the wrap that centers it), removing the overflow with a comfortable margin. `css/style.css`.

### Screen 10 (scales carousel) — widened + a real physical-position arrow bug found and fixed

- **Widened**: card `max-width` 800px → 980px (wrap is 1160px wide minus 96px of arrows/gaps — was leaving ~230px of dead space split on both sides). `css/style.css`.
- **Arrow direction bug**: confirmed via `getBoundingClientRect()` (not just visual guess) that the button semantically named/id'd "left" (`#s10-btn-left`, glyph ‹, `carouselLeft()` = advance/"הבא") was actually rendering at the physical **right** edge (x=1056 of 1280), and `#s10-btn-right` (›, back/"הקודם") was rendering at the physical **left** (x=176) — backwards from the script's explicit instruction (slide 24: left arrow → advance) and from the project's own forward=left convention. Root cause: the wrap is `direction:rtl; flex-direction:row` with no `order`/direction override, so first-DOM-child renders at the RTL main-start (right), not left as the naming implied. A prior 2026-07-18 session's fix corrected the *function bindings and labels* to match the semantic story but never verified actual physical position — this is the same bug resurfacing. Fixed by reordering the two `<button>` elements in the DOM (right-button first, left-button last; ids/onclick/glyphs/aria-labels all unchanged) with an explanatory comment. Verified after the fix via `getBoundingClientRect()`: `#s10-btn-left` now at x=86 (physical left), `#s10-btn-right` at x=1146 (physical right); real `.click()` on each confirms advance/retreat still work and continue still unlocks after seeing both cards. `index.html`.

### SCQ entrance animation — unified across the whole unit

Audited every Single-Choice screen's option-entrance CSS (`.s11-anim`/`.s13-anim` etc.) by sampling computed `opacity` at t=0 across ~20 screens after `goTo()` — confirmed the stagger/timer logic itself (`scqGenEnter` and the bespoke per-screen `enterScreenNN()` functions) was already correct everywhere (options fade in individually, never as one block; canonical order title→context→question→media→options already in place from the 2026-07-21 continuation-2 polish pass). The actual remaining inconsistency was the *visual character* of the fade: the plain-SCQ family (warmup/practice/basic/standard-B, screens 14/16/17/18/25/27/29/30 etc.) uses `translateY(14px)` over `0.55s ease` everywhere, but the SCQImage variant used on Advanced/Peak (`.s11-anim` blocks scoped to screens 33/37/38/41/42/43/45/46/47) had been added in a later session at a different, faster `translateY(10px)`/`0.35s ease` — a real "doesn't match the unit's established effect" bug, just not the one a first read of the JS would suggest. Unified both blocks to the dominant convention (`14px`/`0.55s ease`). `css/style.css`. Verified in Preview: screens 37, 41, 45, 47 all render with the corrected timing, no layout regression on any of them (screenshots taken ~4s after `goTo()`, all 4 options fully visible in each case).

### GIF → MP4 migration (10 requested screens + case-sensitivity fix)

Mapped each requested screen number to its live `data-screen`/GEN_DATA identity by content match (not by assuming the number is literal), same discipline as every prior renumbering session — confirmed via the actual gif filename each screen currently uses, since several screens legitimately share the same source gif (e.g. `lifting.gif` used by both data-screen 24 and 35; `scretching.gif` used by both 12 and 31; `char-orange-scales.gif` used by both 0 and 48) which is exactly what the requested mapping table expected. Converted each `<img>` to `<video autoplay loop muted playsinline>` (or, for the two JS/GEN_DATA-driven and the two lazy-loaded screen-3 cards, added an explicit `.play()` call after the JS sets `.src`, since a video's `autoplay` attribute doesn't retrigger on a later `src` assignment). Same id/class/wrapper/position/size preserved everywhere — no layout changes.

- Screen "1" (data-screen 0, Intro): `char-orange-scales.gif` → `scales.mp4`.
- Screen 3 (TwoOptionSelection cards): `popcorn.gif`/`reading.gif` → `popcorn.mp4`/`reading.mp4`; adapted the existing lazy-load-on-entry JS (`data-gif-src` → `data-video-src`, now also calls `.play()`).
- Screen 12 (Warmup transition): `scretching.gif` → `moving.mp4`.
- Screen 15 (Practice transition): `before-ques.gif` → `running.mp4` (file didn't exist yet at the start of this session — asked the user, who supplied it mid-session; confirmed present and wired it in).
- Screen 24 (Basic transition): `lifting.gif` → `lifting.mp4`.
- Screen 31 (Class Task transition): `scretching.gif` → `moving.mp4` (GEN_DATA[29], element `#s27-char`).
- Screen 34 (Class Task wrap-up): `orange-monster-glasses.gif` → `glasses.mp4` (GEN_DATA[46], `#s47-char`).
- Screen 35 (Advanced transition): `lifting.gif` → `lifting.mp4` (GEN_DATA[32], `#s30-char`).
- Screen 44 (Peak transition): `char-orange-medal.gif` → `medal.mp4` (GEN_DATA[39], `#s37-char`) — this **resolves a known issue from an earlier session**: `char-orange-medal.gif` was never actually present as an asset, so this screen's character was always invisible before now.
- Screen 48 (End-Fail): `char-orange-scales.gif` → `scales.mp4` (GEN_DATA[43], `#s41-char`) — the request said `scale.mp4` (singular), which doesn't exist; asked the user, confirmed it was a typo and `scales.mp4` (the same file already used on screen "1") is correct.
- Renamed `assets/video/Lifting.mp4` → `lifting.mp4` (lowercase) for cross-platform portability — macOS resolves the case-insensitively but a case-sensitive Linux host would 404 on the lowercase reference every screen/GEN_DATA entry actually uses.

**Deliberately left untouched (out of the requested scope, flagged not fixed):** screen 33 (Class Task Reflection Form) still uses `char-orange-scales.gif`; screen 49 (End-Success) still uses `char-orange-medal.gif` (the same asset that was missing until this session — now that `medal.mp4` exists, screen 49 could get the same fix screen 44 just got, but wasn't in the requested list).

### Verified in Preview

All 10 GIF→MP4 screens + screens 6/10 walked via `goTo()` with real screenshots (not just static code reads): confirmed each video renders at the same size/position the gif occupied, and that `readyState`/`play()` work (a few showed `paused:true` after autoplay when checked immediately after a host-side `wait`, consistent with this project's previously-documented backgrounded-tab throttling quirk — manually nudging `.play()` confirmed the element and file are both fine, not a real bug). `node --check js/main.js` clean; CSS brace balance (1165/1165) and HTML `<section>` tag balance (49/49) confirmed after all edits.

### Files Changed

index.html, css/style.css, js/main.js, assets/video/ (renamed one file), WORK_PROGRESS.md.

### Next Recommended Task

Consider applying the same medal.mp4 fix to screen 49 (End-Success) since it shares the exact missing-asset problem screen 44 had — not done here since it wasn't in the requested list. Otherwise the same long-standing blockers as before: Galileo applet spec, Knowledge Summary scope decision, missing runner-question asset (now resolved — running.mp4 supplied this session), real Unit Figma pass once provided.

---

## Session 2026-07-23: QA round — screens 1, 2, 3, 5, 6, 9, 10 (user's "יעד 4" list, mapped 1:1 to data-screen, no offset)

Scope: a fixed list of 7 point fixes across data-screen 1/2/3/5/6/9/10. No Unit Figma link available this session either (still "—" in PROJECT_BRIEF.md) — fixes derived from the PPTX (slides 5–26, re-extracted via python-pptx to confirm content/notes) plus internal precedent and the 720-design-guidelines/720-templates skills. No refactor beyond the listed items.

### Screen 1 (Hook — 4 characters)
- Title "אחד מהמשפטים הבאים אינו נכון מדעית, מהו?" (`.s1-title`) was `color: var(--subject-500)` (blue) — changed to `#303030`, matching `.s1-instruction` and the rest of the screen's text. `css/style.css`.
- Replaced the orange-mascot feedback image (`hook-orange-mascot.png`) with the newly-supplied `assets/video/point.mp4` (autoplay/loop/muted/no controls), same crop box/position (`.hook-orange-crop`). Since `goTo()` globally pauses every `<video>` before any screen swap, added an explicit `currentTime=0; .play()` restart in `hookRestoreFeedback()` so the clip actually plays each time the feedback state is (re)shown, not just once. `index.html`, `css/style.css`, `js/main.js`.
- Speech bubble ("למה המשפט של חן לא נכון מדעית? המשיכו ותגלו") was wrapping to 3 lines with a lone orphan word ("ותגלו") stranded on the last line — widened `.hook-orange-bubble` 195px→235px (same trick as an earlier pass on this exact bubble); now wraps cleanly to 2 lines, verified live in Preview.

### Screen 2 (Hook Popup)
- Shortened the first paragraph's (`#s2-body`) own rise transition 0.55s→0.3s (id-scoped override, doesn't touch the shared `.s2-anim` duration other elements on this screen still use).
- Rescheduled the closing bold sentence (`#s2-bold`) to appear 2s after the first paragraph's rise actually *finishes* (`bodyDelay(1000) + bodyRise(300) + 2000 = 3300ms`) instead of a fixed 2000ms-from-entry offset; continue-button enable rescheduled to follow it (`+550+50`). `js/main.js`, `css/style.css`.

### Screen 3 (TwoOptionSelection — method choice)
- Root-caused the "hover still shows white placeholder" report: `.s3-card-img img` sized the static `<img>` via a bare `img` **tag** selector, which never matched the `<video class="s3-card-img-gif">` sibling — so the video had no `width`/`height`/`object-fit` and rendered at its native intrinsic size (1080×1080, confirmed via `getComputedStyle`), clipped by the card's `overflow:hidden` to a small, off-scale, mostly-blank-looking fragment instead of the properly-fit clip. Fixed by adding `.s3-card-img-gif` to that sizing rule. Verified via computed style (width/height now 238×223.5, matching the container) and a forced-visible render (both cards) showing the video correctly contained, not cropped/oversized. `css/style.css`.
- Note: the automation tool's synthetic `hover` didn't register a real `:hover` state in this environment (`card.matches(':hover')` → false even after a hover action) — verified the fix via computed style + forced opacity instead; real mouse hover from an actual user is unaffected by this tooling limitation.

### Screen 5 (Accordion)
- Scrollbar was appearing on the left — root cause: `.s5-content` inherits `direction:rtl` from `html/body`, and browsers place a vertical scrollbar on the LEFT for an RTL-direction scroll container. Fixed with the project's established scrollbar-flip trick (already documented for the scroll-gated feedback popup pattern): `.s5-content { direction: ltr }`, with every child text block keeping its own explicit `direction: rtl; text-align: right` (`.s5-instruction` already had it implicitly via inheritance — added it explicitly now that the ancestor is ltr; `.s5-header`/`.s5-body` already declared it explicitly, unaffected). Verified: scrollbar renders on the physical right with all 4 items open (content overflows 1036px vs 556px visible), Hebrew text still right-aligned throughout.
- Typography hierarchy: the accordion header label (`.s5-label`, e.g. "מהי מסה?") was 22px — smaller than its own body text (`.s5-body p`, the מיליגרם/גרם/קילוגרם list etc.) at 24px, backwards hierarchy. Bumped `.s5-label` to 28px (Body/B-2 token, matching the precedent already set by `.s9-card-title`'s 32px-title/24px-body pattern one screen later) so the header now reads as clearly more prominent than the body text under it. `css/style.css`.

### Screen 6 (Astronaut — Earth hotspot)
- "אסטרונאוט מתכונן לטיסה לירח" instruction text (`.s6-instructions`) was 20px, smaller than the revealed mass/weight text (`.s6-info-bubble`, 24px) — per the brief, screen 7's equivalent pair (`.s7-panel-label`/`.s7-info-bubble`) is already correct at 24px/24px. Bumped `.s6-instructions` to 24px to match. Verified in Preview: no overflow/wrap regression, text fits the 640px right panel comfortably. `css/style.css`.

### Screen 9 (Knowledge Summary — מסה/משקל cards)
- מסה card: word "ולא" was stranded on the second-to-last line, leaving `"מתווספת".` alone as the final line. משקל card: word "הגוף" was on the first line, leaving `נמצא.` alone as the final line. Fixed both via `text-wrap: balance` on `.s9-card-body p` (applies to all 4 paragraphs in both cards) rather than a hard `<br>`, per the brief's explicit preference — this is the same convention already used elsewhere in the unit for exactly this orphan-word problem. Verified live: both target words now land on their paragraph's last line, no other paragraph in either card regressed to an awkward break. `css/style.css`.

### Screen 10 (Scales carousel) — arrow direction
- Confirmed empirically (not by guessing) that the arrows were genuinely rendering **inward**-pointing despite the raw markup looking correct at a glance: `‹`/`›` (U+2039/U+203A) are Unicode "Bidi_Mirrored" characters, and this project's `html` is `dir="rtl"` — so the browser auto-mirrors them, flipping the *visual* glyph relative to the literal character (confirmed by a 6×-scaled live-DOM screenshot: the physically-left button showed a rendered `>` and the physically-right button a rendered `<`, i.e. both pointing into the card). Fixed by adding `direction: ltr` to `.s10c-arrow` — this stops the bidi-mirroring for that leaf element (which holds nothing but the glyph, so no Hebrew text is affected), making both glyphs render as literally authored: pointing outward, away from the card. `carouselLeft()`/`carouselRight()` and the physical left/right button positions are completely unchanged — verified click-through still advances/retreats correctly and still enables continue after seeing both cards. `css/style.css`.

### Verified in Preview

All 7 screens walked via `goTo()` + real interaction in the `lomda-preview` dev server (not just static code reads): screen 1 (select→check→feedback, mascot video plays after an explicit restart, bubble 2-line wrap), screen 2 (transition-duration + timer-schedule computed-style checks), screen 3 (computed sizing before/after, forced-visible render), screen 5 (scrollbar side + overflow measurement, header/body font-size computed check), screen 6 (reveal + computed font-size, screenshot), screen 9 (natural full-stagger screenshot, both cards), screen 10 (computed `direction`, full carousel click-through). Regression-checked sibling screens 4, 7, 8, 11 (share some of the touched CSS families) — all render unaffected. `node --check js/main.js` clean; CSS brace balance (1166/1166) and HTML `<section>` tag balance (49/49) confirmed after all edits. No console errors walking screens 0–11.

### Files Changed

index.html, css/style.css, js/main.js, WORK_PROGRESS.md.

### Next Recommended Task

Same long-standing blockers as before: Galileo applet spec from the producer, Knowledge Summary scope decision (already resolved as in-scope — see 2026-07-18 session, disregard the older "appears absent" note), a real Unit Figma pass once provided (this session's judgment calls — bubble width, accordion header size, scrollbar-flip — were made from PPTX notes + 720 design-system precedent, never against a real Figma frame).

---

## Session 2026-07-27: Temporary DEV nav toolbar for QA (not the complex `index_dev.html` tool)

User asked for a lightweight, temporary navigation bar to speed up screen-by-screen QA across the unit — explicitly *not* a request to restore the existing complex `index_dev.html`/VEE dev tool (zoom, element editor, properties panel), which stays untouched. Checked first per the "don't build a duplicate mechanism" rule: no lightweight nav bar existed inside `index.html` itself before this session (only the heavyweight iframe-based tool did) — the existing `goTo()`/`resetScreenState()`/`TOTAL_SCREENS` machinery in `js/main.js` was already dev-tool-aware (it already posts `screenChanged`/`totalScreens` to a parent frame and listens for a `devGoTo` message), so the new bar is built entirely on top of that, no navigation logic duplicated.

### What was added
- A fixed top bar (`#dev-nav-bar`, 34px tall, dark/minimal styling deliberately unrelated to the lomda's own design system) added directly to `index.html`, right after `<body>`: prev (◀) / next (▶) buttons, a live "current / total" label, and a `<select>` dropdown for direct jump-to-screen (mirrors the `◀`/`▶`/label convention already used by `index_dev.html`'s own bar, for consistency).
- `js/main.js`: a single `const DEV_NAV_ENABLED = true` flag gates the whole feature — set it to `false` (or delete the three clearly-marked "DEV NAV TOOLBAR" blocks in `index.html` / `css/style.css` / `js/main.js`) to remove it before publishing, with zero effect on the lomda otherwise. `scaleApp()` now reserves `DEV_NAV_HEIGHT` (34px) at the top of the viewport when the flag is on, so the bar never overlaps the canvas, the unit's own progress bar, or any buttons — confirmed at both desktop and narrow/tall (834×1194) viewports.
- Navigating via the new bar calls the existing `goTo(n)` unchanged, so it gets `resetScreenState()` (re-triggers entrance animations) and the hint/popup-closing + video-pause logic for free — no separate reset path to maintain.
- Prev/next and the dropdown are built from the actual `.screen[data-screen]` elements in the DOM (not a naive 0..49 loop), so they correctly skip screen 40 (removed in an earlier session, not renumbered) instead of landing on a blank canvas.

### Verified in Preview
`lomda-preview` dev server via the Browser pane, loading `index.html` directly (not through `index_dev.html`). Confirmed: bar renders correctly on load and after resize without covering the canvas/progress bar/buttons; direct jump via the dropdown to screen 20 (mid-unit question) re-plays its entrance animation; next-button from screen 39 correctly skips to 41 (screen 40 absent from both dropdown and step-nav); picked a wrong answer on screen 41, got feedback, navigated away and back via the bar — selection and feedback panel were fully cleared on return (no stale state), matching requirement 4. No console errors. `node --check js/main.js` clean.

### Files Changed
index.html, css/style.css, js/main.js, WORK_PROGRESS.md.

### How to remove/hide before publishing
Fastest: set `DEV_NAV_ENABLED = false` near the top of `js/main.js` (hides it completely, `scaleApp()` reverts to using the full viewport height, nothing else changes). To remove entirely: delete the `#dev-nav-bar` HTML block right after `<body>` in `index.html`, the "DEV NAV TOOLBAR" CSS block in `css/style.css`, and the "DEV NAV TOOLBAR" JS block (flag + `updateDevNavBar`/`initDevNavBar` + the `topReserved` line in `scaleApp()`) in `js/main.js`. The unit works identically either way — this was verified by the flag's ternaries collapsing to the pre-existing behavior when off.

---

## Session 2026-07-27 (continuation): Galileo applet (`assets/widgets/galileo-applet/`) — images not rendering + "חפצים לבחירה" column layout

The real interactive Galileo free-fall applet (previously the long-standing blocker noted throughout this file as "needs producer coordination") now exists on disk (`assets/widgets/galileo-applet/index.html` + `images/`), embedded via `<iframe>` on Advanced Q1 sections א/ב (data-screen 37/38) and the zoom modal — appears to have been dropped in since the last documented session, not built here. User reported two problems: the object-card images weren't showing at all, and the "חפצים לבחירה" (objects bank) column was too wide relative to its content.

### Real bug found and fixed: object images 404'd due to relative-path + clean-URL redirect interaction
Confirmed live in Preview (network tab): the widget's own `OBJECTS` data used relative `images/<name>.png` paths, and the `<iframe src="assets/widgets/galileo-applet/index.html">` reference gets 301-redirected by the dev server's clean-URL rewriting (`.../galileo-applet/index.html` → `.../galileo-applet/index` → `.../galileo-applet`, no trailing slash) — the resulting document URL resolves one directory too shallow, so every relative `images/...` request 404'd as `assets/widgets/images/...` (missing the `galileo-applet` segment). Same root cause would silently break the `@font-face` reference (`../../fonts/...`). Fixed by making both root-relative (`/assets/widgets/galileo-applet/images/...`, `/assets/fonts/...`) — immune to this class of URL-resolution quirk regardless of how the static host rewrites clean URLs. `assets/widgets/galileo-applet/index.html`.

### Layout: object cards rebuilt image-first, bank column narrowed, arena widened
- `.obj-card` switched from a horizontal (small 56×52 icon + text alongside) to a vertical layout: image on top at ~full card width (`.obj-icon` width:100%, `aspect-ratio: 4/3`, `img { object-fit: cover }`), name/details/mass-pill centered below with tightened gap (14px→4px) and reduced card padding (12px 14px → 8px 8px 10px), mass-pill's own top margin trimmed 6px→2px.
- `.main` grid ratio changed from `1.8fr : minmax(280px,1fr)` (~64/36) to `2.5fr : minmax(210px,1fr)` (~72/28) — narrows the bank column (less dead space now that cards are dense) and widens the arena/fall-experiment side correspondingly.
- Removed now-redundant mobile (`max-width:700px`) overrides for `.obj-card`/`.obj-info`/`.mass-pill` that duplicated what's already the (now vertical) desktop default.
- No JS/interaction logic touched — drag-and-drop, click-to-load, mass-mismatch bounce/toast, release/fall/timer physics, and "try another pair" reset are all byte-for-byte unchanged.

### Verified in Preview
`lomda-preview` dev server, both data-screen 37 and 38 (same shared widget file, both embeds affected identically). Confirmed via network tab: all 6 object images now 200 OK (previously 404). Visual: images render large at the top of each card, cards read as dense/scannable, arena has more room. Full interaction cycle exercised via real DOM calls into the iframe's own document (not just visual): click-to-load two same-mass objects (tennis ball + steel marble, both 57g) → both claws show "loaded" state, release button enables → release → fall animation runs → both objects land at their physically-verified times (01.53s / 01.43s, matching `OBJECTS.tennis.T`/`OBJECTS.steel.T`) → `state-landed` reached, "try another pair" enables. No console errors on either screen.

### Files Changed
`assets/widgets/galileo-applet/index.html`, `WORK_PROGRESS.md`.

### Next Recommended Task
Since the applet itself now exists and works, the long-standing "Galileo applet spec/producer coordination" blocker noted repeatedly throughout this file (and in `LOCAL_SETUP.md`'s Local TODO list) should be considered resolved — worth a pass through `LOCAL_SETUP.md` to update that stale entry. Otherwise unchanged: Knowledge Summary scope (already resolved per the 2026-07-18 session note), a real Unit Figma pass once provided.

---

## Session 2026-07-27 (continuation 2): Galileo applet — object bank cards too tall, internal scroll

Follow-up to the immediately preceding session. That session's fix (image-first cards, large `aspect-ratio:4/3` images) accidentally broke the widget's fit: the outer embed (`.applet-embed-wrap` in `css/style.css`, screens 37/38 + the zoom modal) hardcodes the widget's natural size at 880×787.7px — calibrated, per that CSS block's own comment, against the widget's actual natural content height. The taller image-first cards pushed the bank's natural content past that 787.7px budget, which (since `.bank` had `overflow-y:auto` with no explicit height — grid-stretch sizing means the row grows to fit the tallest column) grew the whole page past the fixed-size outer iframe, so only some objects were visible and a scrollbar appeared. User reported this directly: cards too tall, images "ridiculous," only some objects visible, unwanted scroll.

### Fix: reverted to a compact horizontal per-card layout, recalibrated to the embed's real height budget
- `.obj-card`: back to a horizontal row (icon one side, name/details/mass-pill the other — same DOM order as before, so icon still lands on the visually-right side under RTL), `min-height: 74px` (fixed, so all 6 cards render at identical height regardless of whether that item has a details/diameter line), padding tightened to `6px 10px`.
- `.obj-icon`: fixed `44×44px` box (was `width:100%; aspect-ratio:4/3`), `img { object-fit: contain }` (was `cover`) — whole image always visible, never cropped, and every icon now sits in the same-size bounding box regardless of each source image's own portrait 2:3 ratio, which is the closest "visually balanced" sizing achievable without cropping.
- Text sizes reduced to the requested compact range: `.obj-name` 16px→15px, `.obj-details` 13px→12px, `.mass-pill` 14px→12px (padding 3px 10px→2px 8px). Hierarchy preserved (name heaviest/darkest, details muted/secondary, mass-pill compact but distinct).
- `.bank`: `overflow-y: auto` → `overflow: hidden` (per explicit instruction — nothing is meant to overflow now that content fits), gap 10px→6px, top/bottom padding 14/12px→10/10px.
- Removed the `aspect-ratio`/`cover` treatment entirely — no more image cropping.
- No changes to object order, images, masses, drag-and-drop, click-to-load, mass-mismatch logic, fall-time physics, or the experiment arena (right side) — confirmed by re-running the same interaction test as the prior session.

### Verified in Preview
Measured directly (not just visually): opened the widget standalone at its natural, unconstrained size — total page height came out to **637px**, comfortably under the outer embed's 787.7px calibrated budget (150px of slack). All 6 `.obj-card` elements measured exactly **74px** each (uniform). Re-checked inside the actual embedded context (data-screen 37, scaled 0.5966× inside the fixed 880×787.7 `.applet-embed-wrap`): `bank.scrollHeight === bank.clientHeight` (574/574, zero overflow), `.wrap.scrollWidth === .wrap.clientWidth` (no horizontal overflow either), all 6 cards visible, "לנסות זוג נוסף" button fully visible at the bottom with its own ~10px clearance to the bank's bottom edge — nothing clipped. Screenshot confirms all 6 objects readable, compact, evenly sized. Re-ran the full interaction cycle (click-load tennis ball + steel marble → release → fall → land at 01.53s/01.43s, matching each object's verified `T` value → "try another pair" enables) — identical to the prior session's result, confirming the layout-only changes didn't touch any logic.

### Files Changed
`assets/widgets/galileo-applet/index.html`, `WORK_PROGRESS.md`.

### Next Recommended Task
Same as previous entry — `LOCAL_SETUP.md`'s Galileo-widget notes are already updated (this session's continuation), Knowledge Summary scope and a real Unit Figma pass remain the standing open items.

---

## Session 2026-07-27 (continuation 3): Galileo applet — further vertical compaction (cards, arena, timers) + `min-height:100vh` fix

Third round on this same widget. User reported the interface was still too tall with dead space: too much vertical space inside each object card, fall-section taller than needed, timer strip padding excessive, and — most specifically — asked to check whether the widget's own `body`/parent container had an oversized `min-height`/`height`/padding causing empty space below the widget within its host container (explicitly named `min-height:100vh` as a suspect).

### Fix: tightened every vertical dimension inside the widget, removed `body{min-height:100vh}`
- `body`: padding `1.5rem 1rem` → `1rem 0.75rem`; **removed `min-height:100vh` entirely** (was confirmed live to be the exact cause of ~150px of dead space — `body.getBoundingClientRect().height` was 787.5px, matching the host iframe's fixed viewport, while actual content (`.wrap`) was only 637px; after removing it, `body`'s own box now sizes to content, `getComputedStyle(body).minHeight` → `0px`). Documented via an inline comment why this must never be re-added while the widget lives inside a fixed-size iframe.
- `.hdr` padding `18px 22px`→`12px 20px`; `.claw-row` padding `16px 10px 12px`→`10px 10px 8px`; `.fall-section` `min-height:280px`→`190px` (still flex:1, so it grows to fill whatever the bank column's height ends up being — ruler/floor/lanes all use percentage-based positioning so they stayed correctly laid out at the smaller size); `.timer-box` padding `10px 0 9px`→`6px 0` (font-size unchanged, 27px).
- `.bank` padding `10px`→`8px`, gap `6px`→`4px`. `.obj-card` padding `6px 10px`→`4px 8px`, `min-height` `74px`→`64px` (recalibrated down after also shrinking the icon, re-verified uniform across all 6 — the 2 objects with a diameter/details line still came out exactly matching the other 4 after the height adjustment). `.obj-icon` `44×44px`→`34×34px` (still `object-fit:contain`, no crop/distortion). `.obj-details` margin-top `1px`→`0`; `.mass-pill` margin-top `3px`→`1px`, padding `2px 8px`→`1px 8px`. Object name/details/mass-pill font-sizes left untouched (15px/12px/12px) per explicit instruction not to shrink already-fixed typography further.

### Verified in Preview
Measured directly: standalone natural page height dropped from 637px (end of the previous round) to **~578px**, with all 6 `.obj-card` elements still uniform at exactly 64px, `bank.scrollHeight === bank.clientHeight` (no overflow), no horizontal overflow, "לנסות זוג נוסף" fully visible. Re-ran the same interaction test as the prior two rounds (load tennis ball + steel marble, both 57g → release → fall → land at 01.53s/01.43s matching their verified `T` values → "try another pair" enables) — identical result, confirming zero logic drift across all three rounds of layout-only changes.

### Found but NOT fixed — flagged for the user, needs a scope decision
Even after this round, the **docked view on data-screen 37/38 still shows a residual gray strip** below the widget's visible frame. Root cause is NOT inside the widget file — it's `css/style.css`'s `.applet-embed-wrap`/`.applet-embed-wrap iframe` (used by screens 36/37/38 and the zoom modal), which hardcodes the widget's box at a fixed **880×787.7px** and scales it down (`transform: scale(0.5966)` docked / `scale(0.787)` modal) to fit the `.sadv-img-placeholder` slot (470px tall docked, 620px modal) — a snapshot calibration from when the widget's natural content really was ~787.7px tall. Now that three rounds of shrinking have brought the real content down to ~578px, the fixed 787.7px box is taller than the actual widget, and the leftover gap shows as flat gray (the widget's own `body` background, painted across the iframe's full fixed viewport per the browser's canvas-background-fill behavior — confirmed this persists even with `min-height:100vh` removed, since it's driven by the outer iframe's fixed size, not the widget's own box model).
Fixing this fully requires editing `css/style.css` (outside the widget's own file) to shrink the `787.7` constant to match the new content height, which is **not a drop-in change**: `.applet-expand-btn` (the zoom/magnify icon) is positioned `bottom:10px` relative to the full 470px placeholder box via `.applet-embed-outer{inset:0}`, so simply shrinking the embed box without also repositioning that button would leave it floating disconnected below the widget's new, shorter visible frame. This also affects 3 embed sites at once (screen 36 Applet Guide, screens 37/38, and the zoom modal), not just the widget. Treated as out of scope for "a targeted CSS fix to the applet" per this round's explicit instructions — left as-is, flagged to the user with the exact file/selectors to touch if they want it addressed next.

### Files Changed
`assets/widgets/galileo-applet/index.html`, `WORK_PROGRESS.md`.

### Next Recommended Task
If the user wants the docked-view gray strip fully closed: update `css/style.css`'s `.applet-embed-wrap`/`.applet-embed-wrap iframe` height (787.7px → the widget's current real natural height, ~578px) and reposition/resize `.applet-embed-outer` (or the `.applet-expand-btn` position specifically) so the zoom button tracks the new, shorter visible frame instead of the full 470px/620px placeholder slot — needs verification across all 3 embed sites (screen 36, 37/38, zoom modal). Otherwise: Knowledge Summary scope and a real Unit Figma pass remain the standing open items.

---

## Session 2026-07-28: Galileo applet — closed the gray gap by growing the widget back to fill its placeholder, screen 36 layout raise, item-card proportions

This is the exact follow-up flagged at the end of the previous session (the gray dead-space strip under the docked applet on screens 36/37/38). This round's brief was different from the prior three (which had been *shrinking* the widget): raise screen 36's text block a bit and center it against the applet, grow the applet to fill nearly all of its placeholder's height, narrow the item warehouse a bit (~25–28% of the applet width), make the item cards taller/narrower (closer to square, not fully square), and put the newly-available height to use rather than leaving it empty — without regressing screens 37/38, the zoom modal, drag/drop, or the verified fall-time physics.

### Root cause confirmed
Measured the standalone widget live (`getBoundingClientRect`, correct-viewport, not the earlier broken 0-width reading): natural content height was **546.3px**, while the shared `.applet-embed-wrap`/iframe box in `css/style.css` was still fixed at the stale **787.7px** from the very first (pre-shrinking-sessions) calibration — exactly the gap the previous session's note predicted, just from the opposite direction (widget too *short* for the box, not too tall).

### Changes
- `assets/widgets/galileo-applet/index.html`: `.main` grid ratio `2.5fr:1fr` (~28.5%) → `2.8fr:1fr` (~26%) — narrows the item warehouse column per spec. `.obj-card` `min-height` 64px→102px, padding 4px 8px→6px 10px (narrower, taller, closer to square without being a full square, per instruction). `.obj-icon` 34×34→50×50 (bigger image area, `object-fit:contain` kept, no distortion). `.bank` gap 4px→6px. `.fall-section` `min-height` 190px→230px (the arena's fall zone is `flex:1` so it also absorbs the extra height the taller bank column now needs, matching the "put the extra height to use" instruction without a separate fall-height hack). Net effect, measured live: natural content height grew back to **~788.3px / ~820.3px including body's own padding** — no `.wrap` change needed, this restores almost exactly the original 787.7px calibration, just built from taller/narrower cards instead of the old dimensions.
- `css/style.css`:
  - `[data-screen="36"] .sadv-layout` gained its own `top:95px` (previously piggybacked on the shared 139px block meant for screens *with* a progress bar — screen 36 has none, so that left a large unused gap above the content; 95px matches the existing no-progress-bar precedent already used by screens 31/35). `.guide-text-area`/`.sadv-img-area` height 470→490px; `.guide-text-area`'s `align-self` changed `flex-start`→`center` so the text block centers within the taller available row exactly like the applet box already does — this is what visibly raises/balances the title+paragraphs against the applet, not a transform/margin hack.
  - `.applet-embed-wrap`/iframe height `787.7px`→`820.3px` (matches the widget's new real full-body height, measured live — not guessed). Screen 36's placeholder grew 470→490px so the applet (at the unchanged 0.5966 width-bound scale) fills it almost exactly (measured 489.4px actual vs 490px box — under 1px of slack).
  - Screens 37/38 deliberately did **not** get the height bump (their layout has zero vertical slack — top:158px is already tuned tight against the progress bar, unlike 36) — kept their placeholder at the original 470px and added a screen-scoped `transform: scale(0.5730)` override (height-bound instead of width-bound) so the taller shared widget still fits fully inside their unchanged box. Trade-off: a small (~21px) empty margin on one side instead of either cropping the widget or touching screen 37/38's layout — deliberately chosen to honor "don't touch other screens."
  - `.galileo-modal-box` height 620px→646px (686.787.7 → 820.3 × the modal's existing 0.787 scale) — otherwise the shared height bump would have cropped the bottom of the modal's full-size view. Not explicitly requested, but a direct, unavoidable consequence of the shared iframe/wrap height change (same iframe file is reused by the modal); left unfixed it would have been a new, real regression.
  - `.applet-expand-btn` moved from `bottom:10px;left:10px` to `bottom:10px;right:10px`. Discovered live: with the dead space gone, the old bottom-left corner (over the item bank) now sits directly on top of the bank's full-width "לנסות זוג נוסף" button. Bottom-right (over the arena/timer strip) lands on that strip's own empty corner — the timer digits/labels are centered, well clear of the corner — verified via rect math and a screenshot.

### Bonus fix found while verifying (small, in-scope for the screens already being touched)
While testing the relocated expand button on screen 37, found it was `display:none` on a screen's very first load regardless of feedback state — traced to `[style*="display: none"]` (with a space) in the `:has()` selectors that hide it while feedback shows: the feedback element's hand-authored markup is `style="display:none"` (no space), so the substring match silently never fired until the *first* JS-driven toggle re-serialized the attribute with a space. Fixed for screens 37/38 only (`[style*="none"]`, verified safe — grepped `js/main.js` to confirm this element's `style.display` is only ever toggled between `'none'`/`''`) and verified live: button now shows on fresh load, correctly hides when feedback opens, correctly reappears when feedback closes. The identical bug still exists, unfixed, on screens 29/30/41/43/45/46/47 (same pattern, other screens) — out of scope for this session, flagged as a separate background task rather than touched here.

### Verified in Preview
`lomda-preview` dev server, real clicks (not just screenshots), `goTo()` console calls to jump screens: screen 36 (visual: text raised/centered against applet, applet fills placeholder height with <1px slack, no overflow, drag-to-claw + release + fall + land verified via direct iframe function calls — steel/tennis landed at 01.43s/01.53s, matching their already-verified `T` values, confirming zero physics drift; expand button opens the modal with no cropping; continue → screen 37, nav intact); screens 37/38 (visual: no cropping, small side margin instead, expand button correctly hidden/shown across the select→check→feedback→close cycle, 2-attempt option flow unaffected). No console errors. No horizontal/vertical page overflow (`scrollWidth`/`scrollHeight` match `clientWidth`/`clientHeight`).

### Files Changed
`assets/widgets/galileo-applet/index.html`, `css/style.css`, `WORK_PROGRESS.md`.

### Next Recommended Task
Apply the same one-word `[style*="display: none"]`→`[style*="none"]` fix to screens 29/30/41/43/45/46/47 (flagged as a background task this session, not done here). Otherwise: Knowledge Summary scope and a real Unit Figma pass remain the standing open items.

---

## Session 2026-08-18: Screen 4 (VideoScreen, video-acquisition path) — hardened continue-unlock against YouTube API failure

User reported that on the video page of the acquisition stage, המשך stays disabled after watching the video and only becomes reachable by switching to the text-reading method instead — expected: unlock immediately when the video ends.

### Investigation
Tested the existing mechanism directly in Preview (`js/main.js` `enterScreen4()`/`onYouTubeIframeAPIReady()`/`s4MarkWatched()`): seeking the real embedded video to its end and letting it play out naturally fires the YouTube IFrame API's `onStateChange('ended')` event correctly and unlocks המשך immediately — could not reproduce the reported failure under normal conditions. The one gap found: there was **zero fallback** if the YouTube IFrame API script itself never initializes (blocked by an ad blocker, a restrictive LMS iframe sandbox stripping cross-origin postMessage, etc.) — in that case `onStateChange` never fires at all and המשך would stay disabled forever, with switching to the text path as the only way to progress. This matches the reported symptom exactly and is a plausible real-world cause on a delivery platform different from this local dev preview.

### Fix
Added two independent backups alongside the existing (kept, still primary) `onStateChange('ended')` listener, both converging on the same `s4MarkWatched()`:
- **Watch-poll** (`s4StartWatchPoll()`): polls the player every 400ms once the API is ready; unlocks on `ENDED` state or when current time is within 0.4s of duration. Catches any single missed state-change event without changing behavior when the API works normally.
- **API-unavailable fallback**: if `s4YTReady` is still false a few seconds after entering the screen (API blocked/never loaded), a `setTimeout` keyed to the video's real known duration (81s + 3s buffer, documented in code as specific to this video id) unlocks המשך regardless — guarantees progress is always possible without the video ever silently soft-locking the screen.

No layout, content, or navigation changed — JS-only, screen 4 (`data-screen="4"`).

### Verified in Preview
Real seek-to-end playback (not a direct `s4MarkWatched()` call) confirmed the existing ended-event path still unlocks המשך immediately, unchanged. Separately simulated the API-unavailable path (forced `s4YTReady=false`, short-circuited fallback delay) and confirmed it also unlocks correctly and independently.

### Files Changed
`js/main.js`, `WORK_PROGRESS.md`.

### Next Recommended Task
If the user can reproduce the original failure again on the actual delivery platform (not this local preview), capture the browser console there — would confirm whether it really was the YouTube-API-unavailable case (this fix) or a different cause still to find.

---

## Session 2026-08-24: Hint-card title — removed "רמז" label, fixed icon to match Figma

User reported a width problem with the hint popups across components and asked to drop the visible word "רמז" from the hint card's title row, keeping only the lamp icon + the caption text below it, and to double-check the icon itself matches Figma (720 UI Templates, node 196-6063 — "idea" icon, blue/gray variants).

### Investigated

- Confirmed via Figma (`get_screenshot`/`get_design_context` on node 196:6063 and its children 196:6070/196:6100) that the correct hint icon is a filled bulb with a shine highlight and radiating rays (`idea\blue` #019DE5 / `idea\gray` #AEAEAE) — visually distinct from both icons actually in the codebase: the big 40×35 title-row icon (a plain filled bulb + base bars, no rays) and the smaller 28×28 header icon (a stroked bulb outline, no rays, no shine).
- Found the visible "רמז" label existed as `<span>רמז</span>` (or `<span id="sXX-hint-title">רמז</span>` for JS-driven hint content) directly beside the icon in `.s11-hint-card-title`/`.s17q-hint-header`/`.s18q-hint-header` blocks, across [methodica-science-mass-weight-01-02](methodica-science-mass-weight-01-02/index.html), [-03](methodica-science-mass-weight-01-03/index.html), [-05](methodica-science-mass-weight-01-05/index.html), [-06](methodica-science-mass-weight-01-06/index.html) — 4/4/5/3 occurrences respectively (component -01's two hint cards, screens 12/13, already used the target icon-only pattern with an sr-only "רמז:" prefix on the caption, no visible label — used as the reference for what "correct" should look like).
- Confirmed the JS renderer that fills dynamic hint titles (`if (htEl) htEl.textContent = cfg.hint.title` at 4 call sites in each component's `js/main.js`) is already null-guarded — removing the `<span id="...">` from HTML makes `getElementById` return null and the assignment becomes a safe no-op, so no JS changes were needed. Left the `hint.title: 'רמז'` data fields untouched (harmless now-unused metadata, not worth a wide data-shape edit for a display-only fix).

### Fixed

Across all 5 component folders' `index.html` (01, 02, 03, 05, 06):
- Removed every visible `<span>רמז</span>` / `<span id="...">רמז</span>` label from hint-card title/header blocks (17 total): 0/4/4/5/3 per component. The hint popup now shows just the icon centered above the caption text, matching component-01's already-correct pattern — and resolving the width issue, since the icon+label flex row was what pushed the row's content wider than intended.
- Replaced every instance of both incorrect icons (2/2/4/5/3 big 40×35 icons, plus 2 small 28×28 header icons in component -02) with the correct Figma "idea" icon (bulb + shine + rays), kept white-filled to match the existing blue `.s11-hint-card`/`.s17q-hint-card` backgrounds, sized proportionally (36×31 for the big title icon, 26×22 for the header icon) to preserve the source's aspect ratio (26×22.29).
- Left the nav bar's "אפשר רמז?" CTA button and its icon untouched — that's a distinct functional call-to-action label (not a decorative title), and wasn't part of the reported problem.

Mechanical, regex-driven edit (exact literal path-data match per icon variant, verified via a dry run against copies of all 5 files before touching the real ones) — no hand-per-screen editing, so no risk of drift between the ~17 occurrences.

### Verified in Preview

`lomda-preview` dev server, component -02, real function calls (`scq18OpenHint()`, `scq17OpenHint()`) — confirmed: hint card title text content is empty, single `<svg>` child present, card `scrollWidth === clientWidth` (542px, no overflow), icon markup in the live DOM matches the Figma path data exactly. Tag-balance check (`<section>`/`</section>`, `<svg>`/`</svg>`) clean across all 5 files after the edit.

### Files Changed

`methodica-science-mass-weight-01-01/index.html`, `-02/index.html`, `-03/index.html`, `-05/index.html`, `-06/index.html`, `WORK_PROGRESS.md`.

---

## Session 2026-08-24 (continuation): Hint-card icon wasn't actually right-aligned — layout, not just the label

User followed up: in components -02 and onward, the hint icon still wasn't arranged to the right the way component -01 already does it, and flagged the icon height too. Re-checked component -01's already-correct hint (`.s12-hint-head`/`.s13-hint-head`, screens 12/13) against what the previous pass had left in -02/-03/-05/-06, and found the real gap was structural, not cosmetic: removing the "רמז" label text in the earlier pass left the icon alone in its own `.s11-hint-card-title` row, and that row's parent (`.s11-hint-card`, `align-items: center`) centers it horizontally as a block — so with no visible text left to anchor it, the icon just floated in the middle of the 542px-wide card instead of sitting at the right edge beside the caption, which is what -01's reference layout actually does (icon + caption **in one row**, icon fixed at the right/`flex-start` in RTL, caption `flex:1` and `text-align:right` filling the rest, `align-items:flex-start` so the icon top-aligns with the first line of text instead of centering against the whole paragraph block).

### Fixed

Across -02/-03/-05/-06 `index.html` + `css/style.css` (17 hint blocks total: 4/4/5/3 per WORK_PROGRESS entry above), for all 4 hint-card variants (`.s11-hint-card-title`+`.s11-hint-body`, `.s17q-hint-header`+`.s17q-hint-text`, `.s18q-hint-header`+`.s18q-hint-text`, `.s23-hint-card-title`+`.s23-hint-body`):
- **HTML**: moved the caption `<p>` from being a sibling after the icon's title/header `<div>` to being its child, right after the `<svg>` — matching -01's `.s12-hint-head` structure exactly (icon + caption in one row).
- **CSS**: on the title/header row — `align-items: center` → `align-items: flex-start`, added `align-self: stretch` (so the row spans the card's full width instead of shrinking to the icon's width and getting centered by the parent). On the caption — `text-align: center` → `text-align: right`, added `flex: 1` (so it fills the remaining row width next to the fixed-size icon).
- One screen per file (component -02's screen 19, DropdownQuestion) has a text-only hint with no icon at all — correctly left untouched, nothing to align.
- Icon pixel size (36×31 / 26×22, set in the prior pass) was already correct and unchanged this pass — the "wrong height" read was actually the centering/floating symptom, not a separate sizing bug.

Same mechanical regex approach as the prior pass (dry run against copies of all 4 files first, verified match counts before touching the real files).

### Verified in Preview

Caught a real trap while verifying: navigating the dev server to `.../methodica-science-mass-weight-01-02` (no trailing slash) makes the browser resolve the page's relative `css/style.css` against the server root instead of the component folder (confirmed via `window.location.href` and the actual network request going to `/css/style.css`) — so an early check appeared to show the fix hadn't applied, when actually the wrong stylesheet was loaded. Re-verified with a trailing-slash URL and got real results: for one hint instance per variant, per component (-02's screens 16/17/23 covering all 4 variants, plus -05's screen 32) — icon's right edge flush with the card's right edge (`0`–`43.75px` gap, matching the row's own right edge exactly), caption `text-align: right` computed, caption is a DOM child of the icon's row, `align-items: flex-start` / `align-self: stretch` computed on the row. Visually confirmed via a temporarily-scaled screenshot (screen 16): icon sits at the top-right corner of the blue card with the caption text beside/below it, right-aligned — matching -01's reference look. Tag-balance (`<section>`, `<div>`, `<p>`, `<svg>`) and CSS brace-balance clean across all 4 files after the edit.

### Files Changed

`methodica-science-mass-weight-01-02/index.html`, `-02/css/style.css`, `-03/index.html`, `-03/css/style.css`, `-05/index.html`, `-05/css/style.css`, `-06/index.html`, `-06/css/style.css`, `WORK_PROGRESS.md`.

---

## Session 2026-08-24 (continuation 2): Screen 19's hint had no icon at all

User flagged "no lamp in the hint itself" on screen 19. Re-audited: earlier in this session I'd scanned every `-hint-card` in all 5 components and found exactly one (`methodica-science-mass-weight-01-02`, `data-screen="19"`, the DropdownQuestion/כוח כבידה hint, overlay `#s19q-hint-overlay`) with no `<svg>` at all — a bare `<p class="s11-hint-body">` + back button, no icon, no title row. I'd wrongly assumed this was intentional (a text-only hint by original design, distinct from the "no hint button" cases documented elsewhere in this file) and left it untouched in both earlier passes this session. It wasn't intentional — every other hint in the unit has the lamp icon, and this one should too.

### Fixed

`methodica-science-mass-weight-01-02/index.html`: wrapped the existing caption in a new `.s11-hint-card-title` row and added the same icon markup (idea/bulb-with-rays, white fill, 36×31, matching the Figma reference and every other hint in the unit) before it — same structure as the 17 hint cards fixed earlier this session.
`methodica-science-mass-weight-01-02/css/style.css`: added the missing `[data-screen="19"] .s11-hint-card-title` rule (row layout, `align-items: flex-start`, `align-self: stretch`, matching every sibling rule) plus `svg { flex-shrink: 0; }` — this screen never had one before since it never had a title row.

### Verified in Preview

`data-screen="19"` (`goTo(19)`) with the overlay forced visible: icon present with real width/height (39.4×33.9 scaled, non-zero), flush against the card's right edge (same gap as the row's own right edge, `43.75px` in this canvas scale), caption `text-align: right` and confirmed as a DOM child of the icon's row. Screenshot (temporarily scaled 2.5× for visibility) confirms the icon renders at the top-right with the caption beside it, matching every other hint card in the unit.

Re-confirmed by re-scanning all 5 components' hint cards for "no `<svg>` present" — this was the only instance; no other screen in any component has this gap.

### Files Changed

`methodica-science-mass-weight-01-02/index.html`, `-02/css/style.css`, `WORK_PROGRESS.md`.

---

## Session 2026-08-24 (continuation 3): Zoom button overlapping feedback text + feedback box too short (screen 17)

User sent a screenshot of Standard Practice Q2 (שקד/ים, Jupiter, data-screen="17", component -02): the magnifying-glass zoom button sat on top of the incorrect-feedback panel that replaces the image, and the feedback text was cut off with a scrollbar (per this project's own rule: feedback replaces the image element, same container, no popup — [CLAUDE.md](CLAUDE.md) "Feedback Panels" section). User asked to (1) remove the zoom icon wherever a feedback panel sits on an image, and (2) make the feedback box taller instead of scrolling, if possible.

### Investigated

Grepped every `.img-zoom-btn` across all 5 components and checked which ones share a parent with a feedback element (i.e., the zoom button is genuinely pointless once feedback covers the image) versus standalone image viewers with no feedback (screen 7's astronaut hotspots, screen 14's before/after comparison — correctly left untouched, not part of this bug). Found 9 real instances across `-02` (screens 17, 18, 23), `-03` (screen 29), `-05` (screens 41, 43), `-06` (screens 45, 46, 47) — all sharing the same "image + zoom button + feedback overlay" DOM shape (`.img-zoom-btn` and a `*-feedback` element as siblings under one wrap).

While testing, found that 6 of those 9 (`-03`/`-05`/`-06`'s screens 29/41/43/45/46/47) already had an **existing but broken** fix for this exact problem: `[data-screen="N"] .sadv-img-placeholder:has(.s11-feedback:not([style*="display: none"])) .img-zoom-btn { display: none; }`. A code comment already on screens 37/38 (which got the corrected version) explains why: the hand-authored initial markup is `style="display:none"` (no space), which never matches the space-containing substring `"display: none"` in the `:not()` — so on first load the `:not()` is always true and the rule wrongly fires immediately, hiding the zoom button **before the learner ever answers**, not after. Screens 37/38 were fixed to match plain `"none"` instead; 29/41/43/45/46/47 were never retroactively fixed. `-02`'s 3 screens (17/18/23) never had any such mechanism at all — the button simply always showed, feedback or not, which is the bug the user actually saw.

### Fixed

**Zoom button vs. feedback**, `-02`/`-03`/`-05`/`-06` `js/main.js`: added one small self-contained script (after the existing "Image Zoom" component) that watches for `style` attribute mutations anywhere in the document and, on every change, re-syncs every `.img-zoom-btn`'s visibility against its sibling feedback element(s) — hidden (`display:none`) whenever any of them is visibly shown, restored to `display:flex` otherwise. Using a real `MutationObserver` instead of patching every individual `Check()`/`ShowFeedback()`/`CloseFeedback()` function (there are many, spread across screen-specific and generic-engine code) means one small addition covers all current and future instances of this pattern, and — because it always writes an explicit inline `flex`/`none` — it wins over any stylesheet rule regardless of specificity, which is what actually fixed the pre-existing 29/41/43/45/46/47 bug (their old buggy `:has()` rule is now fully overridden, left in place but inert — not removed, since two of its siblings' equivalent rules on screens 37/38 also hide an unrelated `.applet-expand-btn` and bare `span`s that are out of this fix's scope, and blanket-removing risked losing that).

**Feedback box height**, `-02` `css/style.css`, `[data-screen="17"] .s17q-image-wrap`: measured the actual feedback content in the live DOM (`scrollHeight` 467px against a `clientHeight` of only 368px — the box was ~100px too short, hence the scrollbar) and increased the wrap's fixed height from 368px to 480px (leaving ~17px clearance above the nav bar, confirmed via the nav bar's own offset). Width, padding, font-size, and line-height all left untouched — same container, same look, just tall enough for both the correct- and incorrect-feedback text (which are identical length here) to render in full with no scrollbar. Screens 18/23/29/41/43/45/46/47 were not touched for height — the screenshot and complaint were specific to screen 17, and none of the others showed a similar overflow when checked.

### Verified in Preview

For all 9 zoom-button instances across all 4 files: confirmed `flex` (visible) on initial load, confirmed `none` when the sibling feedback is shown (tested by directly toggling each feedback's `style.display`, in separate calls to avoid a `MutationObserver` microtask-timing false negative), confirmed `flex` again after hiding the feedback. This incidentally re-confirmed the 29/41/43/45/46/47 fix: those buttons now correctly show on first load (previously wrongly hidden from the start). For screen 17 specifically: real click-through (`scq17Select`/`scq17Check`) showing the incorrect-feedback panel — `scrollHeight === clientHeight` (480/480, no overflow), zoom button hidden, confirmed visually via a temporarily-scaled screenshot (full text renders, no scrollbar, no icon overlapping). `node --check` clean on all 4 `main.js` files; CSS brace-balance clean.

### Files Changed

`methodica-science-mass-weight-01-02/js/main.js`, `-02/css/style.css`, `-03/js/main.js`, `-05/js/main.js`, `-06/js/main.js`, `WORK_PROGRESS.md`.

---

## Session 2026-08-24 (continuation 4): Screen 18 (rice/moon) intro sentence — wrong color/weight, extra gap

User flagged the rice-on-scales question's opening sentence ("מדדתם את מסתו של קילו אורז...", data-screen="18", component -02): it should be plain black, not bold, and without the gap before the sentence that follows it.

### Fixed

`-02/index.html`: wrapped `#s18-story-first` + `#s18-story` (previously two bare sibling `<p>`s directly under `.s18q-content`) in a new `.s18q-story-block` div — same structure screen 17 (שקד/ים) already uses correctly for the identical "two-sentence intro" shape. Confirmed safe first: both paragraphs are looked up by `id` everywhere in `js/main.js` (`enterScreen18`'s entrance-stagger code), never by DOM position/parent, so wrapping them changes nothing behaviorally.

`-02/css/style.css`: added `[data-screen="18"] .s18q-story-block { display:flex; flex-direction:column; gap:0; }` (same as screen 17's block) so the two sentences sit flush with no gap, instead of inheriting the outer `.s18q-content` flex column's 16px `gap` meant for spacing before the question/options. Changed `.s18q-story-first`'s `font-weight: 700` → `400` and `color: var(--subject-500)` → `#303030`, matching `.s18q-story`'s (and screen 17's) plain black body-text styling exactly — it had been bold+blue for no documented reason, unlike every sibling screen's intro sentence.

### Verified in Preview

`goTo(18)`: `getComputedStyle` on both paragraphs confirms identical `rgb(48, 48, 48)` color, first sentence `font-weight: 400`, and zero gap between the two paragraphs' bounding boxes (`secondRect.top - firstRect.bottom === 0`). Screenshot confirms the two sentences now read as one continuous black paragraph, matching screen 17's look. `<div>` tag-balance and CSS brace-balance clean.

### Files Changed

`methodica-science-mass-weight-01-02/index.html`, `-02/css/style.css`, `WORK_PROGRESS.md`.

---

## Session 2026-08-24 (continuation 5): Screen 20 (Neil Armstrong) feedback — title too small, line breaks

User sent a screenshot of the DropdownQuestion feedback on data-screen="20" (component -02, "תצפית" vs. "הסבר מדעי" definitions after the video): the title ("התשובה לא נכונה." / "מצוין!") was noticeably smaller than the body text, and asked for it to match the rest of the feedback's size. Separately, gave the exact desired line-break layout for the body text (currently wrapping naturally at different points than requested).

### Fixed

`-02/css/style.css`: `[data-screen="20"] #s20q-fb-title` font-size `20px` → `24px`, matching `#s20q-fb-body`'s font-size exactly (both title and body now render at the same size — previously the title was noticeably smaller for no documented reason, unlike its bold weight suggesting emphasis).

`-02/js/main.js`: added 3 explicit `<br>` tags into the shared `DQ20_FB_CORRECT`/`DQ20_FB_WRONG` `body` string (both are identical text, `replace_all` caught both in one edit) at the exact points the user specified — after "בפועל, " (before "ללא"), after "הנובעת " (before "מתוך"), and after "של " (before "ניסוי") — so the text now always breaks into the requested 5 lines instead of wrapping wherever the container's width happens to land.

### Verified in Preview

`goTo(20)`, feedback panel forced visible with the real body markup: `getComputedStyle` confirms title and body both compute to `24px`. Screenshot (temporarily 2×-scaled) confirms the 5-line break pattern matches exactly what was requested. Checked the panel itself for the overflow/scrollbar bug class found earlier this session on other feedback panels — `scrollWidth === clientWidth` and `scrollHeight === clientHeight` (363×275, no overflow), so no width/scroll fix was needed here. `node --check` clean; CSS brace-balance clean.

### Files Changed

`methodica-science-mass-weight-01-02/js/main.js`, `-02/css/style.css`, `WORK_PROGRESS.md`.

---

## Session 2026-08-25: Screen 26 (component -03, DnD מסה/משקל sentence match) — 2-attempt logic + layout rebalance

User flagged two problems on `data-screen="26"` in `methodica-science-mass-weight-01-03` (the drag-and-drop "match the sentence to מסה/משקל" question): (1) the question only had 1 attempt — any wrong answer immediately revealed the full correct sort and let the learner continue, instead of giving a first-try generic "wrong, try again" and only revealing on a second wrong attempt; (2) the layout wasted most of the canvas width, with the two drop-zone targets squeezed into a narrow 320px column (causing sentence-card text to wrap once cards landed there) while the "מסה"/"משקל" labels sat below their boxes instead of reading as headers.

Confirmed this screen's `maxAttempts: 1` is a deliberate cross-component convention (identical dropdown-based version exists in all 5 sibling components, all also `maxAttempts: 1`) — so this was a scoped content/behavior change for -03 only, not a bug shared with the siblings, and the other components were intentionally left untouched.

### Fixed

**2-attempt logic** (`-03/js/main.js`), ported from `scqGenCheck` — the same first-wrong/final-wrong pattern already used by every other 2-attempt question in this unit (e.g. `GEN_DATA[24]`/`[26]`/`[28]`), rather than inventing a new mechanism: `GEN_DATA[25].maxAttempts` `1`→`2`; split the single `feedbackIncorrect` into `feedbackIncorrectFirst` (generic "שננסה שוב?", reused verbatim from the sibling SCQ screens) and `feedbackIncorrectFinal` (the original explanatory body, unchanged wording). Rewrote `s26dndCheck()`: first wrong attempt shows only the generic feedback, does **not** reveal the correct mapping, does **not** lock the cards (`s26dndChecked` stays `false`), and hides just the check button (matching `scqGenSelect`'s hide-until-you-touch-it-again convention) — the target columns keep whatever the learner dropped, so they can rearrange and retry. Only the second wrong attempt reveals the correct mapping and locks, same as the screen's previous single-attempt behavior. Added a small addition to `s26dndDragStart()`: starting a new drag (the DnD equivalent of "re-selecting an option") now dismisses a visible first-wrong feedback panel and re-shows the check button, mirroring `ddqGenToggle`'s existing feedback-dismiss-on-reinteraction pattern.

**Layout** (`-03/css/style.css` + `-03/index.html`): the drop-zone labels ("מסה"/"משקל") were markup-ordered *after* their target boxes, reading as captions floating beneath the boxes rather than headers — swapped the DOM order (label first) in both `.s26dnd-target-col` blocks in `index.html`, no text/content change. Widened `[data-screen="26"] .s17-col` from `960px`→`1200px` (right-margin unchanged at 40px, so the column now uses nearly the full 1280px canvas symmetrically instead of leaving a ~280px dead margin). Widened `.s26dnd-targets` from `320px`→`470px` — measured the actual longest sentence card text at the live 24px Assistant font (max ~369px) to confirm 470px leaves comfortable no-wrap margin once both cards land in one target column (previously wrapped, since 320px was narrower than a single card's own natural width). `.s26dnd-target-col` gap `4px`→`8px` for clearer label-to-box separation now that the label acts as a header. Updated the feedback-overlay position/size (`[data-screen="26"] .s11-feedback`) to match the new source-column geometry (`left:280px;width:600px` → `left:40px;width:690px`) — the overlay is intentionally positioned over the source tray (always empty at check-time, since the check button only enables once all 4 cards have left it), so the sorted target column stays fully visible and un-squeezed beside it in every state, including the new first-wrong state where nothing gets moved/revealed.

### Verified in Preview

`lomda-preview` dev server, `-03/index.html` directly (not the dev-shell wrapper) via the Browser pane. Caught and worked around the same "no trailing slash → relative `js/main.js` resolves against the server root instead of the component folder" trap noted in the 2026-08-24 entry above — first attempt silently loaded the *other*, unrelated root-level legacy `js/main.js` (confirmed via `window.s26dndEnter === undefined` at global scope, and the console error's URL not containing `/methodica-science-mass-weight-01-03/`); re-verified with a trailing-slash URL and got real results this time.

Exercised the actual `s26dndCheck()`/`s26dndDragStart()` code paths directly via console calls (native HTML5 drag-and-drop can't be driven through the browser-automation click tool — same limitation noted for `ddq12` in the 2026-07-18 entry) across all 6 states requested: (1) fresh/before-answer — 4 cards in a comfortably wide left column, both targets clear headers on the right, no wrap, no dead space; (2) all 4 cards placed (wrong combo), pre-check — same, check button enabled; (3) after first wrong attempt — generic "התשובה לא נכונה. שננסה שוב?" feedback overlays the empty source area only, no reveal, cards stay exactly as dropped, check button hidden, hint/back still available, target column fully visible at full width; (4) mid-second-attempt (dragging a card re-closes the feedback and re-shows the check button, confirmed via `fb.style.display`/`checkBtn.style.display` before/after); (5) correct answer — green success feedback + all cards shown correct/green in their targets + "המשך" enabled; (6) second wrong attempt — red final feedback with the full explanation, correct mapping revealed and locked, "המשך" enabled. No overflow or wrapping in any state at the 1280×710 canvas. Regression-checked sibling screens 24/25/27 (`goTo` through each) — render and console-error-free, unaffected by the screen-26-scoped CSS/JS changes. `node --check` clean on `-03/js/main.js`.

### Files Changed

`methodica-science-mass-weight-01-03/index.html`, `-03/css/style.css`, `-03/js/main.js`, `WORK_PROGRESS.md`.

---

## Session 2026-08-25 (continuation): Screen 26 follow-up — per-item lock, fixed slot count, feedback centering

User reviewed the above fix live and asked for three refinements, all still scoped to `data-screen="26"` in `-03`: (1) make it visually obvious each target expects exactly 2 sentences — the single flexible dashed box that silently grows/shrinks with content read as "odd"; (2) a card that was correctly placed on the first attempt should never need to be dragged again on the retry; (3) the feedback panel's text was pinned to the top of its box instead of sitting centered in the middle.

### Fixed

**Fixed 2-slot display** (`-03/js/main.js` `s26dndRender()`, `-03/css/style.css`): each target now always renders exactly `S26DND_SLOTS_PER_TARGET` (2) child slots — a filled card for each placed item, padded out with a new `.s26dnd-slot-empty` dashed placeholder (same Figma 1444-37398 drop-zone look previously carried by the outer `.s26dnd-target` box) for whatever's left empty. Moved that dashed/gray chrome from the outer target container down onto the individual slots themselves (the outer `.s26dnd-target` is now a plain flex column) — a single big dashed box around 1-2 already-boxed white cards was the "weird" look the user flagged; nesting a dashed box only around the genuinely-empty slots reads cleanly instead.

**Per-item lock on first-wrong attempt** (`-03/js/main.js`): added `s26dndLocked` (itemId → true), reset on screen entry. Reworked `s26dndCheck()`'s first-wrong branch: any item already correctly placed gets `s26dndLocked[id] = true` and is left exactly where it is; only the actually-wrong items get sent back to the source tray. `s26dndBuildCard()` now renders a locked card pre-styled `is-correct` (green) and without a `dragstart` listener (can't be picked up), so it visually reads as "confirmed" and is structurally non-draggable, not just conventionally left alone.

**Real bug caught while implementing the above**: the feedback-overlay-covers-the-source-column trick (added in the earlier fix in this same session, valid *only* because source was previously guaranteed fully empty at every check) broke the moment wrong items could land back in source while feedback is showing — they rendered, but directly underneath the opaque feedback panel, invisible and undraggable. Fixed by measuring the feedback panel's real rendered height (`fbEl.offsetHeight`) right after showing first-wrong feedback and pushing `#s26dnd-source` down by that amount (`marginTop`), so the returned cards sit visibly below the message instead of hidden under it; the margin resets to `''` the moment the learner starts a new drag (same spot that already dismisses the feedback panel) and on fresh screen entry. Not an issue for the correct/final-wrong paths — those still force every item out of source, so the overlay covers genuinely empty space there, unchanged.

**Feedback vertical centering** (`-03/css/style.css` `[data-screen="26"] .s11-feedback`): added `display:flex; flex-direction:column; justify-content:center` so the title+body block centers vertically inside the (auto-height, `max-height:417px`) panel instead of sitting flush at the top. Horizontal alignment (`text-align:right`, matching every sibling feedback panel's RTL convention) left unchanged — only vertical position was in scope.

### Verified in Preview

Same `lomda-preview` setup as the prior entry (trailing-slash URL, direct console calls into the real `s26dndCheck`/`s26dndDragStart`/`s26dndEnter` functions — native HTML5 drag can't be driven by the browser-automation click tool). Confirmed: fresh state shows 2 dashed empty slots per target; a first-wrong attempt with 2 of 4 correct locks those 2 green in place and returns only the 2 wrong ones to source, fully visible and draggable below the (now vertically-centered) feedback message (`fb.bottom` computed as 356.67px, returned cards starting at 362.8px — no overlap); starting a drag on a returned card dismisses the feedback and resets the source's margin back to `0`; completing the retry correctly (all 4 correct) shows the normal green success state; a retry where the remaining wrong items stay wrong correctly falls through to the final-reveal branch (all 4 forced into their correct target, shown green, locked, final feedback shown, continue enabled) — this pass also caught and worked around a test-script-only race (calling `s26dndDragStart`'s deferred `setTimeout(0)` callback out of order against a synchronous follow-up call in the console test itself, not a product bug — a real browser drag can't complete out of that order). Regression-checked screens 24/25/27 via `goTo` — no console errors. `node --check` clean on `-03/js/main.js`.

### Files Changed

`methodica-science-mass-weight-01-03/css/style.css`, `-03/js/main.js`, `WORK_PROGRESS.md`.

---
## Session 2026-08-25 (continuation 2): Screen 26 follow-up 2 — column alignment/width match, simplified first-wrong handling

User reviewed the locked-card fix live and flagged three more things, all on the same `data-screen="26"`: (1) the 4 sentence cards on the left started noticeably higher than the target box row on the right — wanted them in line; (2) the draggable sentence cards were much wider than the boxes they get dropped into, so they visibly resized on drop — "looks weird"; (3) the returned-wrong-cards-below-the-feedback-panel arrangement from the previous fix looked odd and the user asked whether a different approach would read better.

### Fixed

**Column alignment**: measured the real cause — each `.s26dnd-target-col` starts with a `.s26dnd-target-label` heading (24px/700, 32px rendered tall) + 8px gap before its box, while `#s26dnd-source` had no equivalent heading, so its cards rendered ~40px higher than the box row beside them. Added `padding-top: 40px` to `[data-screen="26"] .s26dnd-source` to match exactly (verified: card top 334.60px vs. box top 334.49px post-fix, sub-pixel).

**Width match**: `.s26dnd-targets` and `.s26dnd-source` are now both a fixed `540px` (previously 470px vs. a stretchy ~690px `flex:1`) — cards are the same width wherever they sit, so nothing visibly resizes on drop. `.s26dnd-layout`'s gap widened `40px`→`80px` and `justify-content: center` added, since the two fixed 540px columns (1160px total) no longer sum to the full 1200px content width — centers them with a small, even margin on each side instead of packing them to one edge.

**Simplified first-wrong handling** (`-03/js/main.js` `s26dndCheck()`): dropped the "send wrong items back to the source tray" behavior added in the prior fix — that was the actual source of the "weird" look, and required a compensating margin-push hack to keep the feedback panel from hiding the returned cards. Wrong items now simply stay exactly where the learner dropped them (still draggable, undecorated — no reveal), and only correct items get locked. Since nothing returns to source anymore, the source column is *always* genuinely empty at check-time (not just usually), so the feedback-overlay-on-source trick from the original fix is valid again unconditionally — removed the now-unnecessary `marginTop` measure/reset code from `s26dndCheck()`, `s26dndDragStart()`, and `s26dndEnter()`. Net effect: a learner now literally just picks the wrong card up from wherever it landed and drags it to the right target — no cards disappearing into a tray, no feedback-panel collision to work around.

Updated the `[data-screen="26"] .s11-feedback` overlay position/comment to match the new (centered, narrower) source column geometry: `left:40px;width:690px` → `left:60px;width:540px`.

### Verified in Preview

Same setup as the two prior entries. Confirmed: first card's top edge and width now match the target box's top edge and width exactly (rect comparison, not just visual). Re-ran the full partial-correct-first-attempt → drag-to-dismiss-feedback → correct-retry flow: 2 correct cards lock green in place immediately, the 2 wrong ones stay visible and draggable in their (wrong) target the whole time feedback is showing, dragging one dismisses the feedback with no leftover margin/positioning artifacts, completing the retry correctly reaches the normal green success state. Regression-checked screens 24/25/27 via `goTo` — no console errors. `node --check` clean on `-03/js/main.js`.

### Files Changed

`methodica-science-mass-weight-01-03/css/style.css`, `-03/js/main.js`, `WORK_PROGRESS.md`.

---

## Session 2026-08-25 (continuation 3): Screen 26 — orphaned-word line break, dropped the א./ב./ג./ד. letter prefixes

User flagged two small items on the same `data-screen="26"`: (1) in the success/final feedback body, the clause "...גם שככוח הכבידה משתנה." was wrapping so "משתנה." landed alone on its own line; (2) the 4 sentence cards' "א./ב./ג./ד." letter prefixes are unnecessary and should come off.

### Fixed

**Orphaned word**: measured the actual text at the panel's real 24px Assistant font before touching anything — the full clause "היא לא תלויה בכוח הכבידה, ולכן נשארת אותו הדבר גם שככוח הכבידה משתנה." is 687px wide against ~492px of usable panel width (540px panel − 48px padding), so it was always going to wrap into at least 2 lines; the previous break point just happened to leave a lone trailing word. Split it at a real clause boundary instead: `היא לא תלויה בכוח הכבידה, ולכן נשארת אותו הדבר` (measured 448px, fits) then `גם שככוח הכבידה משתנה.` (measured 235px, fits) — added one `\n` (→ `<br>`) in `GEN_DATA[25].feedbackCorrect.body` and the identical `feedbackIncorrectFinal.body` in `-03/js/main.js`. Verified via `Range.getBoundingClientRect()` on the actual text node post-render (height 31.5px, i.e. genuinely one line, not an estimate).

**Letter prefixes**: removed the leading `א. `/`ב. `/`ג. `/`ד. ` from all 4 `GEN_DATA[25].items[].label` strings — sentence wording otherwise unchanged. Confirmed nothing else in `-03/index.html` or `-03/js/main.js` referenced those letters (e.g. in feedback text or hint copy) before removing them, so no follow-on wording depended on the lettering.

### Verified in Preview

Same `lomda-preview` setup as the prior three entries in this thread. Confirmed via the live DOM: the flagged clause renders as one unmarked line with no orphaned word; source-tray cards and their target-column counterparts (fresh state and post-check states alike) show only the plain sentence text, no letters. Regression-checked screens 24/25/27 via `goTo` — no console errors. `node --check` clean on `-03/js/main.js`.

### Files Changed

`methodica-science-mass-weight-01-03/js/main.js`, `WORK_PROGRESS.md`.

---

## Session 2026-08-25 (continuation 4): Screen 32 (Class Task Instructions) — step numbering didn't match the script

User pasted the script slide for "משימת כיתה" (Galileo free-fall task) and flagged that the live screen's numbered steps don't match it. Confirmed: the live rendering is `data-screen="32"` in `methodica-science-mass-weight-01-04` (id `s31`, `GEN_DATA[30]`, rendered by `enterScreen29()` — internal numbering kept from an earlier renumbering, unrelated to the `data-screen`/`SCREEN_CLASS_TASK_INST=32` value actually used by navigation). Identical-looking `GEN_DATA[30]`/`enterScreen29()` blocks exist in the other 5 components and the root `js/main.js`, but none of them have matching HTML ids (`s28-title`/`s28-steps`/etc.) — dead leftovers from copying the full monolith during the component split, never reachable from any `goTo()`. Left those untouched (out of scope, and the git status already shows unrelated pending edits across those files).

### Bug found

Two mismatches against the script (PPTX slide, "במשימה הזו תשחזרו את הניסוי של גלילאו:"):
1. The script numbers "מצאו 2 חפצים בסביבתכם..." as step **1**; the live code rendered that line as an unnumbered `subtitle` above the numbered list, so the visible steps started at "עמדו על כסא..." = 1.
2. The script's א./ב. sub-questions live *under* step 3 ("כתבו במחברת:") as lettered sub-items; the code was numbering them as top-level steps 3 and 4, continuing the same counter, so "כתבו במחברת:" itself became step... 2, and the sub-questions became steps 3/4 instead of א/ב under 3.

### Fixed

`methodica-science-mass-weight-01-04/js/main.js`: moved "מצאו 2 חפצים..." into `GEN_DATA[30].steps` as the first entry (removed the now-unused `subtitleId`/`subtitle` fields); rewrote `enterScreen29()`'s step-rendering loop to detect a leading Hebrew-letter-plus-period (`/^[א-ת]\./`) and render those as `.s28-substep` items (indented, no number circle) without incrementing the main step counter — so the list now reads 1/2/3 with א/ב nested under 3, matching the slide exactly. Removed the subtitle element from the staged-entrance array accordingly.

`methodica-science-mass-weight-01-04/index.html`: removed the now-empty `<p id="s28-subtitle">` element.

`methodica-science-mass-weight-01-04/css/style.css`: removed the orphaned `[data-screen="32"] .s28-subtitle` rule; added `.s28-substep` (right-padding to align under the parent step's text, small negative top margin to sit close under its parent).

### Verified in Preview

`lomda-preview` dev server, opened `methodica-science-mass-weight-01-04/` directly (not the root shell) with a trailing slash (the bare `/index.html` path resolves the script's relative `src="js/main.js"` against the wrong directory once `serve` redirects it — a preview-tooling quirk, not a code bug). `goTo(32)` then screenshotted: steps render 1/2/3 with א/ב indented under 3 with no number badge, no overflow, no console errors from the component's own script, continue button enables after the entrance stagger completes.

### Files Changed

`methodica-science-mass-weight-01-04/index.html`, `methodica-science-mass-weight-01-04/css/style.css`, `methodica-science-mass-weight-01-04/js/main.js`, `WORK_PROGRESS.md`.

---

## Session 2026-08-25 (continuation 5): Screen 33 (Class Task Reflection Form) — field order, button text, character in feedback

User flagged 3 issues on `data-screen="33"` (`GEN_DATA[31]`, `id="s32"`, same component-04 as the previous entry) by comparing a reference layout against the live one: the two long textarea questions were in the wrong order, the continue button said more than "המשך", and the feedback state showed a character video that shouldn't be there.

### Fixed

`methodica-science-mass-weight-01-04/js/main.js`:
- Swapped the `why` ("האם הצלחתם לזהות בדיוק אם שני החפצים פגעו יחד בקרקע?") and `diff` ("איך ניתן להפוך את הניסוי למדויק...") entries in `GEN_DATA[31].fields` — the CSS grid places field 3 and 4 as full-width rows in array order (`.s29-field:nth-child(3)`/`(4)`, no other layout logic involved), so this alone fixes the row order to match the reference (heavy/light short row → "האם הצלחתם" → "איך ניתן להפוך").
- Changed `continueBtnText` from `'אפשר להמשיך'` to `'המשך'`.
- Removed the `charId`/`char` config fields and the two lines in `enterScreen30()` that set/played the character video (`assets/video/scales.mp4`) — nothing else in the file referenced `s29-char` afterward.

`methodica-science-mass-weight-01-04/index.html`: removed the `<video class="s29-char" id="s29-char">` element from inside `#s29-feedback`, leaving only the feedback text paragraph.

`methodica-science-mass-weight-01-04/css/style.css`: removed the now-dead `[data-screen="33"] .s29-char` rule and the `gap: 16px` on `.s29-feedback` (was only needed to space the text from the character).

Did not touch the `scales.mp4` asset file itself or the identical/leftover `GEN_DATA[31]`/`enterScreen30()` copies in the other components — same reasoning as the previous entry (those are dead, unreachable from any real HTML in their respective components).

### Verified in Preview

Same `lomda-preview` setup, `methodica-science-mass-weight-01-04/` with trailing slash, `goTo(33)`. Screenshotted fresh (all fields empty, button disabled+gray, correct row order) and after programmatically filling all 4 fields via `input`/`dispatchEvent` (continue button turns blue and reads "המשך", feedback row shows only "תודה על החשיבה והשיתוף!" with no character, no layout gap or overflow). No console errors.

### Files Changed

`methodica-science-mass-weight-01-04/index.html`, `methodica-science-mass-weight-01-04/css/style.css`, `methodica-science-mass-weight-01-04/js/main.js`, `WORK_PROGRESS.md`.

---

## Session 2026-08-25 (continuation 6): Screen 34 (Class Task wrap-up — scientific tools) — drop title, bold "למשל", fix an orphaned word

User flagged two items on `data-screen="34"` (`id="s47"`, `GEN_DATA[46]`, `enterScreen46()`, same component-04): remove the "משימת כיתה" heading from the blue card, and bold the word "למשל" in the body text. Immediately after, flagged a third: the 3rd bullet's last word ("האנושי.") was wrapping alone onto its own line.

### Fixed

`methodica-science-mass-weight-01-04/index.html`: removed the `<div class="s28-card-header" id="s47-card-header"><h2 id="s47-bigtitle">` block from inside `#s47-card`, leaving only the body paragraph.

`methodica-science-mass-weight-01-04/js/main.js`: removed the now-unused `suptitle`/`bigtitle`/`subtitle` fields from `GEN_DATA[46]`; wrapped "למשל" in `<strong>` inside the `bubble` string; dropped `s47-card-header`/`s47-bigtitle` from `enterScreen46()`'s staged-entrance array and text-setting lines; switched the body's render from `.textContent` to `.innerHTML` (needed to let the `<strong>` tag through — the string is static/authored content, not user input, so this is safe).

`methodica-science-mass-weight-01-04/css/style.css`: removed the now-dead `[data-screen="34"] .s28-card-header`/`.s28-title` rules; added `[data-screen="34"] .s28-body strong { font-weight: 700; }`.

**Orphaned word**: per this project's "widen the container before shrinking the font" text-wrapping rule — measured the actual 3rd bullet ("• מכשיר שמשחרר ביחד את שני החפצים, כדי לשלול את ההשפעה של הגורם האנושי.") at the card's real 24px Assistant font via a hidden DOM span (not an estimate): 725.7px against the card's then-704px usable content width (800px card − 96px horizontal padding). Widened `[data-screen="34"] .s28-card` from `800px` → `850px` (usable width → 754px, comfortable margin over the measured 725.7px). Verified via `getBoundingClientRect()` that the card still clears the character gif by 66px with no overlap and stays well clear of the canvas edges/nav bar at the new width.

### Verified in Preview

Same `lomda-preview` setup, `goTo(34)`. Confirmed via computed styles: `#s47-bigtitle` no longer exists in the DOM, the `<strong>` around "למשל" computes to `font-weight: 700`, the "האנושי" line now reads as part of the line above (no lone trailing word), card layout has no leftover gap where the title used to be, no overlap with the character, no console errors.

### Files Changed

`methodica-science-mass-weight-01-04/index.html`, `methodica-science-mass-weight-01-04/css/style.css`, `methodica-science-mass-weight-01-04/js/main.js`, `WORK_PROGRESS.md`.

---

## Session 2026-08-25 (continuation 7): Screen 36 (Applet Guide) — line-break moved

User asked to move the clause "גלילאו זרק שני חפצים בעלי" down to the second line of the guide's first paragraph (`data-screen="36"`, `#sAdvGuide-p1`, component-05).

### Fixed

`methodica-science-mass-weight-01-05/index.html`: moved the `<br>` in `#sAdvGuide-p1` earlier — was after "...גלילאו זרק שני חפצים בעלי", now right after "...הניסוי של גלילאו." (the end of the intro sentence). Added a space before `<strong>מסה שונה</strong>` since it now continues the same line as "בעלי" instead of starting a fresh line after the break. Result: line 1 = "בהתנסות הזו תשחזרו ותרחיבו את הניסוי של גלילאו." alone; line 2 = "גלילאו זרק שני חפצים בעלי **מסה שונה**, שהגיעו באותו זמן לקרקע." — wording unchanged, only the break point moved.

### Verified in Preview

`lomda-preview`, `methodica-science-mass-weight-01-05/`, `goTo(36)`: confirmed the two lines split as intended with no overflow. Network/console check showed only pre-existing 404s from missing images inside the third-party Galileo applet widget (unrelated to this edit, not newly introduced).

### Files Changed

`methodica-science-mass-weight-01-05/index.html`, `WORK_PROGRESS.md`.

---

## Session 2026-08-25 (continuation 8): Screen 37 (Advanced Q1 section א) — missing question clause + applet too small on both 37/38

User flagged two issues, giving the intended question structure for `data-screen="37"` verbatim: (1) the question was missing its trailing parenthetical pointing learners back to the applet; (2) the docked Galileo applet (shared by screens 37 and 38, `GEN_DATA[33]`/`GEN_DATA[50]`) is "really small" — its internal item-list text becomes too small to read at the current scale.

### Fixed

**Missing clause**: `methodica-science-mass-weight-01-05/js/main.js` — `GEN_DATA[33].question` was `'א. לאחר שהתנסתם בהשלכת זוג גופים בעלי אותה מסה, מהי תוצאת הניסוי?'`; added the missing `(אפשר להמשיך להתנסות בניסוי בפעילות משמאל)` per the user's exact wording. Verified live it still fits on 2 lines in the question column with no wrap/overflow change.

**Applet too small**: measured the real available vertical budget live (not guessed) before changing anything — progress-bar bottom to nav-bar top is 532px total; the existing 470px-tall docked box (`.sadv-img-area`/`.sadv-img-placeholder`, screens 37/38) already used the bottom's full slack (only 8px clear of the nav bar) but had 54px unused above it (`.sadv-layout { top: 158px }`, well past the 24px that later testing showed was still visually clear of the progress bar with no crowding). Reclaimed height from there instead of the nav-bar side:
- `[data-screen="37"/"38"] .sadv-layout { top: 158px → 128px }` (still a clean 24px gap above, confirmed via screenshot + `getBoundingClientRect()` measurement, not just arithmetic).
- `.sadv-img-area` width `525px → 536px`, `.sadv-img-placeholder` height `470px → 500px` (536×500 is the exact aspect-matched box for the new scale below, so the applet fills it edge-to-edge with neither letterboxing nor cropping — the old 525×470 box was height-bound and actually left ~20px of unused width as letterbox, which is fixed as a side effect).
- `.applet-embed-wrap` scale `0.5730 → 0.6095` (500/820.3) for both screens.

Net effect: ~6.4% linear / ~13% area increase in the applet's rendered size, with the internal item-list cards and their gram-weight labels now meaningfully more legible, verified both docked instances (37 and 38) individually.

### Verified in Preview

`lomda-preview`, `methodica-science-mass-weight-01-05/`. Iterated live in the browser first (temporary inline-style overrides + `getBoundingClientRect()` measurements) before writing the final CSS, to confirm exact pixel numbers rather than estimate them. Final CSS re-checked cold (fresh navigation, no leftover overrides) on both `goTo(37)` and `goTo(38)`: applet fills its box with no letterbox/crop, 24px clear of the progress bar, 8–71px clear of the nav bar (37/38 respectively — 38's longer wrapped 4th option leaves more slack), question text renders the added clause on 2 lines with no overflow. Console/network check showed only pre-existing 404s from missing images inside the third-party applet widget itself (same as noted in the previous entry, not new).

### Files Changed

`methodica-science-mass-weight-01-05/css/style.css`, `methodica-science-mass-weight-01-05/js/main.js`, `WORK_PROGRESS.md`.

---

## Session 2026-08-25 (continuation 9): Galileo applet — item images weren't loading, root-caused to a redirect-order bug

User reported the item-list images inside the Galileo applet (screens 36/37/38, `assets/widgets/galileo-applet/`) weren't showing at all.

### Root cause

Not a missing-asset problem — the 6 PNGs exist exactly where the widget's own code expects them (`galileo-applet/images/*.png`, referenced as plain relative paths like `images/A4.png`). The bug is in how the iframe's URL resolves: the local `serve` dev server 301-redirects an explicit `.../galileo-applet/index.html` request in two hops, ending at `.../galileo-applet` with **no trailing slash and no filename**. Confirmed directly: `iframe.contentWindow.location.href` was `.../assets/widgets/galileo-applet` (missing `/index.html`). Because the resolved document URL's last path segment doesn't end in `/`, the browser's relative-URL algorithm treats `galileo-applet` itself as a filename and resolves `images/X.png` against its parent directory instead — producing `.../assets/widgets/images/X.png`, which 404s (confirmed via `curl -sIL`, which showed the exact two-hop redirect chain, and via the network log, which showed the wrong resolved path). The same relative-path pattern is used for the widget's own `@font-face` src (`../../fonts/...`), so it was silently exposed to the identical risk, just not yet visibly broken.

This is a preview-tooling-class issue this project has hit before (see the `index.html` shell's own comment about `serve` redirecting bare paths) — but unlike the earlier trailing-slash cases (fixed by remembering to type the slash when navigating manually), this one is triggered by the *iframe's own* `src` attribute, which the embedding page has no control over once `serve` intercepts it. Fixing it in the widget itself makes it robust regardless of what any given host does with `.html` extensions or trailing slashes.

### Fixed

`methodica-science-mass-weight-01-05/assets/widgets/galileo-applet/index.html`: added a small synchronous inline `<script>` at the very top of `<head>` (before the `<style>` block, so it runs before any `@font-face`/`img` resource resolution) that computes the document's true containing-directory path from `location.pathname` — stripping the trailing segment only if it looks like a filename (contains a dot), otherwise treating it as a redirect-truncated directory name and appending `/` — then `document.write`s an explicit `<base href="...">` with that path. This makes every relative path in the widget (images, the local font) resolve correctly regardless of whether the host serves the literal `/index.html` request as-is or redirects it away.

Left the unreferenced root-level duplicate (`assets/widgets/galileo-applet/index.html` at the project root, outside any component folder) untouched — confirmed via grep that neither `unit-shell.js` nor `unit-manifest.js` ever references it, consistent with this session's other findings of dead pre-split leftovers.

### Verified in Preview

`lomda-preview`, `methodica-science-mass-weight-01-05/`. Before the fix: `iframe.contentWindow.location.href` resolved to `.../assets/widgets/galileo-applet` (no filename) and all 6 item images 404'd on every one of the widget's 3 instances (screens 36/37/38). After the fix, freshly reloaded (not just re-using a cached iframe): confirmed via the network log that every `images/*.png` request now hits `.../galileo-applet/images/*.png` with a 200, and screenshotted all three screens (36 guide, 37 section א, 38 section ב) showing the item thumbnails rendering correctly next to each object's name/weight in the selection list.

### Files Changed

`methodica-science-mass-weight-01-05/assets/widgets/galileo-applet/index.html`, `WORK_PROGRESS.md`.

---

## Session 2026-08-25 (continuation 10): Screen 39 (Advanced Q2, sugar VIQ) — bold the two unit words in the hint

User asked to bold "בגרמים" and "בק"ג" in the hint text for `data-screen="39"` (`GEN_DATA[34]`, the sugar ValueInputQuestion).

### Fixed

`methodica-science-mass-weight-01-05/js/main.js`: wrapped both words in `<strong>` inside `GEN_DATA[34].hint.body`. No CSS change needed — the hint body is already rendered via `.innerHTML` (with `\n`→`<br>`, same pattern used by every other hint/feedback body in the file), so the tag renders directly, and `.s11-hint-body` has no rule overriding `<strong>`'s default bold weight.

### Verified in Preview

`lomda-preview`, `goTo(39)`, opened the hint via `viqGenOpenHint(34)`. Both words render bold, text still fits the card with no overflow, no console errors.

### Files Changed

`methodica-science-mass-weight-01-05/js/main.js`, `WORK_PROGRESS.md`.

---

## Session 2026-08-25 (continuation 11): Screen 41 (Advanced Q3, farmer/rice) — lead-sentence color, question line-break, unnecessary scrollbar

User flagged three issues on `data-screen="41"` (`GEN_DATA[36]`, id `s37`, `q41-*` classes, component-05), giving a screenshot: the intro sentence rendered bold+blue when it should be plain black; the question's final phrase "גרגר אורז אחד?" was splitting awkwardly across the wrap point; and a visible (but pointless) vertical scrollbar sat on the question/options column.

### Fixed

**Lead sentence color**: `methodica-science-mass-weight-01-05/css/style.css` — `.q41-lead` was `color: var(--subject-500); font-weight: 700;` (bold blue); changed to `color: #303030; font-weight: 400;`, matching `.q41-body`'s plain styling exactly.

**Question line-break**: `methodica-science-mass-weight-01-05/js/main.js` — added a `<br>` inside `GEN_DATA[36].question`'s `.q41-question` span, right before "גרגר אורז אחד?", so that phrase now always starts its own line as a unit instead of being split by the container's natural wrap point (previously "...של גרגר אורז" / "אחד?").

**Unnecessary scrollbar**: root-caused before touching anything — measured `.sadv-qa-area`'s `scrollHeight` (494px) against its fixed `clientHeight` (489px): a 5px overflow, invisible to the eye but enough to trip the shared `overflow-y: auto` rule (applies to 11 different screens) into showing a full scrollbar. Added a screen-scoped override reducing `.sadv-qa-area`'s gap from the shared 16px to 10px — reclaims 6px per gap (only one gap on this screen, between the question paragraph and the options list), enough to bring `scrollHeight` down to exactly 489px (verified live, not estimated) with the scrollbar gone. This is also the "raise the distractors" effect the user asked for — the options list sits closer to the question now.

### Verified in Preview

`lomda-preview`, `goTo(41)`, fresh reload (not leftover live-DOM edits) after writing the final CSS/JS: screenshotted and confirmed all three fixes together — lead sentence plain black, question breaks before "גרגר אורז אחד?", `scrollHeight === clientHeight` (489 = 489, `getComputedStyle`/`getBoundingClientRect` measured) with no scrollbar reserving layout width. No console errors.

### Files Changed

`methodica-science-mass-weight-01-05/css/style.css`, `methodica-science-mass-weight-01-05/js/main.js`, `WORK_PROGRESS.md`.

---

## Session 2026-08-25 (continuation 12): Screen 41 (Advanced Q3, farmer/rice) — auto-width options, enlarged image

User flagged two more items on `data-screen="41"`: the 4 answer options were stretched to the full column width regardless of their own text length (per the project's own "no dead space / no excessive width" answer-pill rule — short options like "אי אפשר למדוד מסה כה קטנה." sat in the same full-width pill as a much longer sentence, mostly empty space), and asked to enlarge the image afterward so it reaches roughly the height of the (now more compact) options block.

### Investigated first

Tried the obvious approach — shrink `.sadv-qa-area`'s width (currently 816px) to free up width for a wider `.sadv-img-area` (currently 360px, aspect-ratio-locked to the 1448×1086 photo, giving ~270px height). Measured live: the question paragraph (`.q41-body`/`.q41-question`) is already sitting at the exact width where it wraps to 2 lines each — any reduction at all (even 20px) immediately pushes both to 3 lines, growing total content height and reintroducing the scrollbar just fixed in continuation 11. There's no safe slack to reclaim from that side without also editing the question text's wrap points. Abandoned that path rather than force it.

### Fixed

**Auto-width options** (`methodica-science-mass-weight-01-05/css/style.css`): added a screen-41-only override after the shared `.s11-options`/`.s11-option` block (which screen 41 shares with screen 43 — left 43 untouched, confirmed via Preview it has no `.s11-option` elements at all, it's a hotspot/graph question): `.s11-options { align-items: flex-start }` + `.s11-option { width: fit-content; max-width: 100% }`. Options now hug their own text width and right-align (matching RTL reading direction and the question's own alignment) instead of stretching full-width.

**Enlarged image**: since the qa-area column has zero spare width (see above), grew the image via height instead of width — changed `.sadv-img-placeholder` from `height:auto; aspect-ratio:1448/1086` (a ~270px-tall box that never used the fixed 360px width fully) to a fixed `height:420px`, and switched `.sadv-img` to `object-fit:cover; width:100%; height:100%` (screen-41-specific — removed "41" from the shared `.sadv-img{object-fit:contain}` selector list to avoid a same-specificity cascade fight, since that shared rule came later in the file and would otherwise have silently overridden the new `cover` back to `contain`). This crops a small amount off the sides of the photo rather than the farmer himself (he's centered in frame) — verified visually, no awkward cropping. Image grew from 270px to 420px tall (top position recentered within its column), closing most (not all — deliberately not chasing every last pixel) of the previous ~108px gap to the options' bottom edge, down to ~33px.

### Verified in Preview

`lomda-preview`, `goTo(41)`, fresh reload after writing the final CSS (not leftover live-DOM test values). Confirmed via `getBoundingClientRect()`/`getComputedStyle()`: all 4 options render at their natural content widths (591/598/331/466px, right-aligned) instead of the uniform 816px; image is 420px tall with `object-fit:cover` applied; `.sadv-qa-area` still shows zero overflow (scrollHeight === clientHeight, 489=489 — the earlier scrollbar fix from continuation 11 holds). Exercised `scqGenSelect(36,1)` to confirm option click/selection still works correctly post-resize. Re-checked screen 43 (the other screen sharing the base `.s11-option` rule) renders unaffected. No console errors.

### Files Changed

`methodica-science-mass-weight-01-05/css/style.css`, `WORK_PROGRESS.md`.

---

## Session 2026-08-25 (continuation 13): Screen 41 (Advanced Q3, farmer/rice) — equal-width options, orphaned word in feedback

Follow-up on continuation 12's work, same `data-screen="41"` / `GEN_DATA[36]`. User's screenshot showed the per-option auto-width from continuation 12 read as jagged (each option a different width), and asked to make them equal width instead; separately flagged the correct/final-incorrect feedback text ending with a lone "אחד." on its own last line.

### Fixed

**Equal-width options**: `methodica-science-mass-weight-01-05/css/style.css` — replaced continuation 12's per-option `width: fit-content` (each option sized to its own text) with a CSS-Grid approach: `[data-screen="41"] .s11-options { display: grid; grid-template-columns: max-content; justify-content: flex-start; gap: 12px; }` + `.s11-option { width: 100%; max-width: 100%; box-sizing: border-box; }`. The single grid column auto-sizes to the widest option's content, and `width:100%` makes every option fill that column — so all 4 pills now share one uniform width (the longest option's, ~598px) instead of each hugging its own text independently. Still right-aligned, still no full-container-width dead space. `display:flex` on `.s11-options` for screen 43 (which shares the earlier base rule) is untouched.

**Orphaned word in feedback**: `methodica-science-mass-weight-01-05/js/main.js` — `GEN_DATA[36].feedbackCorrect.body` and `.feedbackIncorrectFinal.body` (identical text) ended "...ונגיע למסה הממוצעת של גרגר אורז אחד." — simulated the feedback panel's actual greedy line-wrap in Preview (311px-wide panel, 24px Assistant) word-by-word rather than guessing, confirming the natural wrap left "אחד." alone on the last line. Tested candidate break points the same way (simulating each candidate as two independently-wrapped chunks) before picking one: inserting `\n` before "אורז" (i.e. after "...של גרגר") gives a clean last line "אורז אחד." (2 words) with no knock-on orphan on the line above — an earlier candidate break (before "הממוצעת") looked plausible on paper but was verified live to just move the problem, leaving "למסה" orphaned instead. Added the `\n` in both `feedbackCorrect.body` and `feedbackIncorrectFinal.body` (existing render path already converts `\n`→`<br>` for this field, consistent with the sentence break already in the string).

### Verified in Preview

`lomda-preview`, fresh reload (not leftover live-DOM test values), `goTo(41)`. Confirmed via `getBoundingClientRect()`: all 4 options render at the same width (598px). Triggered the correct-answer feedback (`scqGenSelect(36,1)` → `scqGenCheck(36)`) and screenshotted: feedback body's last line is "אורז אחד." (2 words), matches the simulated wrap exactly, no orphan. Confirmed via `#s34-fb-body.innerHTML` that the `<br>` is present regardless of the panel's momentary display state. No console errors.

### Files Changed

`methodica-science-mass-weight-01-05/css/style.css`, `methodica-science-mass-weight-01-05/js/main.js`, `WORK_PROGRESS.md`.

---

## Session 2026-08-25 (continuation 14): Screen 41 (Advanced Q3, farmer/rice) — scrollbar flashed during load, gone once settled

User reported a scrollbar visible while the question is loading, which disappears once loading finishes.

### Root-caused

Measured `.sadv-qa-area`'s `scrollHeight` right after `goTo(41)` vs 2.5s later: **502px at both points** — not actually transient/settling on its own, but the *visible scrollbar* was. The gap here: `scrollHeight` reflects scrollable content size regardless of `overflow-y`; what the user sees is whether a scrollbar renders, which depends on `overflow-y: auto` actually needing one. Checked the entrance animation (`enterScreen35()`, `.s11-anim` class): every question span and option starts at `opacity:0; transform:translateY(14px)` and is staggered to `translateY(0)` one at a time via `setTimeout`. A transformed box's *shifted* position is counted in its ancestor's scrollable-overflow region per the CSS spec — so while the last element is still sitting at its pre-reveal `translateY(14px)`, the qa-area's scrollable content is ~13px taller (502 vs the settled 489), tripping `overflow-y:auto` into showing a scrollbar for that whole staggered-reveal window. Once every element's timer fires and it settles to `translateY(0)`, the real content height (confirmed 489 = clientHeight, zero overflow) removes the need for a scrollbar — matching exactly "scrollbar during load, gone once it's done."

### Fixed

`methodica-science-mass-weight-01-05/css/style.css`: changed `[data-screen="41"] .sadv-qa-area` from `gap: 10px;` to `gap: 10px; overflow-y: hidden;`. Since the settled state already has zero real overflow (confirmed in continuation 11), `hidden` can't clip anything permanent — it only silently absorbs the transient animation-only overflow so the scrollbar never gets a chance to render in the first place, for the whole duration of the stagger, not just at rest.

### Verified in Preview

`lomda-preview`, `goTo(41)`, sampled `qa.clientWidth` vs `qa.offsetWidth` (a scrollbar reserves width, making these differ) every 300ms across the full ~1.5s entrance animation: identical (816=816) at every sample point, confirming no scrollbar renders at any point during loading, not just after. No console errors.

### Files Changed

`methodica-science-mass-weight-01-05/css/style.css`, `WORK_PROGRESS.md`.

---

## Session 2026-08-25 (continuation 15): Removed Advanced Q2 (sugar) and Advanced Q4 (moon) from the unit

User shared two screenshots (Advanced Q4/moon and Advanced Q2/sugar) and asked to cut both questions from the unit, with the advanced-questions progress stepper updated to reflect the new total. These are exactly the two questions flagged back in the 2026-07-18 continuation-2 QA pass as carrying an explicit PPTX reviewer thread approving removal ("מאשר" / "השאלה הזו יורדת/מבוטלת", slides 108/118) — at that time the user chose to keep them; this session reverses that decision.

### Removed

- **`data-screen="39"` (Advanced Q2, sugar-cube ValueInputQuestion, id `s35`)** — deleted the `<section>` from [methodica-science-mass-weight-01-05/index.html](methodica-science-mass-weight-01-05/index.html), replaced with a removed-screen doc comment (same convention as the existing screen-40 note). Removed `GEN_DATA[34]` and the `enterScreen33()`/`viqGenEnter(34)` handler from [methodica-science-mass-weight-01-05/js/main.js](methodica-science-mass-weight-01-05/js/main.js), plus its `case 39:` dispatch entry and the `SCREEN_ADVANCED_Q2A` constant (replaced with a comment, same pattern as `SCREEN_ADVANCED_Q2B`).
- **`data-screen="42"` (Advanced Q4, moon interpretation-vs-fact SingleChoiceQuestion, id `s38`)** — same treatment: section removed with a doc comment, `GEN_DATA[37]`/`genScqState[37]`/`enterScreen36()` removed, `case 42:` dispatch entry removed, `SCREEN_ADVANCED_Q4` constant replaced with a comment.

### Rewired navigation and stepper

Advanced Q1 section ב (38) → Advanced Q3/rice (41) → Advanced Q5/hotspot (43) is now the live path; every `goTo()` target that previously pointed at the removed screens 39/42 was updated (screen 38's continue, screen 41's back+continue, screen 43's back). The `.s15-progress` stepper (previously 5 dots: Q1/Q2-sugar/Q3-rice/Q4-moon/Q5-hotspot) was cut to 3 dots (Q1/Q2-rice/Q3-hotspot) on all 4 remaining advanced screens (37, 38, 41, 43), with `is-done`/`is-current` states renumbered accordingly (rice is now "שאלה 2", hotspot is now "שאלה 3").

### Also updated

[unit-manifest.js](unit-manifest.js): component 05's `screens` array changed from `[35,36,37,38,39,41,42,43]` to `[35,36,37,38,41,43]`; `TOTAL_UNIT_SCREENS` comment updated from "49 real screens (minus 40)" to "47 real screens (minus 40, 39, 42)"; header comment extended to document all three removed screens, not just 40.

Did not touch the vestigial duplicate `GEN_DATA[34]`/`GEN_DATA[37]` blocks still present in the other 5 components' own `js/main.js` copies (01-04, 06) or the root-level `js/main.js`/`index-monolith-backup.html` — those files have no matching DOM for screens 39/42 in their own `index.html`, so that code was already unreachable dead weight before this session; only component 05 (the one whose `index.html` actually rendered these screens) needed real edits.

### Files Changed

`methodica-science-mass-weight-01-05/index.html`, `methodica-science-mass-weight-01-05/js/main.js`, `unit-manifest.js`, `WORK_PROGRESS.md`.

### Next Recommended Task

Preview-verify the new flow end-to-end (Q1a → Q1b → Q3/rice → Q5/hotspot, both directions) and confirm no console errors from the removed `sid`s. The third previously-flagged-for-removal question (Peak-ג / digital-scale, `data-screen="47"`) is still open — same reviewer-approval pattern, not yet acted on.

---

## Session 2026-08-25: Screen 1 mascot video transparency + unit-wide bubble color fix

Scope: two point fixes flagged by the user off screen 1 (component 01) — the pointing-mascot video's visible studio backdrop, and the character speech-bubble color across the whole unit.

### Fixed: Screen 1 mascot video background + size

`pointing.mp4` (the feedback-state mascot clip) is a 1080×1080 H.264 clip with no alpha channel — the character was shot against a near-uniform (253,253,253) studio backdrop, which a plain crop could shrink but never fully hide (the character's silhouette isn't rectangular, so corners always showed the backdrop as a faint box against the page's pure white). Verified the backdrop's uniformity by sampling pixel values across a full extracted frame (all 8 edge/corner points read exactly (253,253,253)) before choosing an approach.

Keyed the backdrop out with `ffmpeg`'s `colorkey` filter (`colorkey=0xFDFDFD:0.14:0.10`) and re-encoded to VP9/WebM with an alpha channel (`assets/video/pointing-alpha.webm`, yuva420p, ~724KB vs. the original 512KB mp4) — this is a genuine transparent-background video, not a tighter crop. Verified correctness by extracting frames back out (via the `libvpx-vp9` decoder explicitly — ffmpeg's default native VP9 decoder silently drops the alpha plane on readback, which produced a false "still opaque" result on the first check; had to catch that before trusting the output) and compositing over both magenta and white test backgrounds — clean edges, no background box, at three different points in the animation (arms in different positions).

`index.html`: video element now carries two `<source>`s — the new alpha WebM first, the original `pointing.mp4` second as a fallback for browsers that can't decode alpha WebM (e.g. Safari), so behavior only degrades, never breaks.

`css/style.css` (`.hook-orange-crop`): computed the character's true bounding box as a *union across every frame of the loop* (not just one frame) from the keyed alpha channel — 7.22%/7.96%/7.31%/2.13% margins (left/top/right/bottom) of the 1080×1080 frame — and used that to zero-margin-fill the crop box instead of the old approximate percentages that had been deliberately loose to hide backdrop edges. Enlarged the box 129×138 → 171×180 (same ~0.95 aspect as the measured crop) per the user's request, anchored to the same bottom-left corner (2px clear of the opaque nav bar below) — it now grows up into the speech bubble's box and right into the first student's photo, both harmless now that the video has no visible rectangular edge of its own.

Verified live in Preview (`lomda-preview` dev server, real `goTo(1)`/`hookSelect(2)`/`hookCheck()` calls to reach the feedback state, not just a static screenshot): character renders larger with a clean transparent background, no visible box, no overlap issues with the bubble or nav bar.

### Fixed: Character speech-bubble color, unit-wide

The mascot's bubble on screen 1 (component 01) was already blue-fill/white-text (`hook-orange-bubble.svg`, `fill="var(--fill-0, #019DE5)"` — apparently fixed in an earlier uncommitted edit this session inherited). The same SVG shape is reused as a generic "character explains something" bubble template (`.s12-bubble-wrap`/`.s12-bubble-img`/`.s12-bubble-text`) on one transition screen in each of the other 4 components — but those 4 copies of the SVG were still `fill="var(--fill-0, white)"` with a light-blue stroke (white bubble, blue outline) and dark text (`#222`), not matching. Fixed all 4 to the same solid blue fill/stroke (`#019DE5`) and white text (`#fff`), matching screen 1 exactly:

- `methodica-science-mass-weight-01-03/assets/img/hook-orange-bubble.svg` + `[data-screen="28"] .s12-bubble-text` (component 03's transition screen, "יופי של עבודה!")
- `methodica-science-mass-weight-01-04/assets/img/hook-orange-bubble.svg` + `[data-screen="31"] .s12-bubble-text` (component 04's Class Task wrap-up screen)
- `methodica-science-mass-weight-01-05/assets/img/hook-orange-bubble.svg` + `[data-screen="35"] .s12-bubble-text` (component 05's Advanced-questions transition — this screen's bubble text is empty by design (`GEN_DATA[32].bubble = ''`, element stays `display:none`), so the color fix is currently inert there, but correct/consistent for if content is ever added)
- `methodica-science-mass-weight-01-06/assets/img/hook-orange-bubble.svg` + `[data-screen="44"] .s12-bubble-text` (component 06's Peak-question transition, "עכשיו מגיעה שאלת השיא")

Before touching anything, surveyed every component for other bubble-shaped elements to make sure the fix was scoped correctly: confirmed `.s6-info-bubble`/`.s7-info-bubble` (astronaut mass/weight fact tooltips) and `.s8-answer-bubble` (open-question answer-reveal hint) in component 01 are a different UI pattern — info/reveal tooltips, not character dialogue — and left them untouched. Also confirmed component 02 has the same `.s12-bubble-text` CSS rules present but genuinely unused (no matching `.s12-bubble-wrap` anywhere in its `index.html`, no SVG asset even present) — pre-existing dead template CSS from the 6-way split, not something this fix needed to touch.

Verified all 3 screens that actually render visible bubble text (03/28, 04/31, 06/44) live in Preview — real `goTo()` calls into each component's own dev server, waited out the entrance-animation stagger, screenshotted: all three now show solid blue bubbles with white text, matching screen 1's reference style.

### Files Changed

`methodica-science-mass-weight-01-01/index.html`, `methodica-science-mass-weight-01-01/css/style.css`, `methodica-science-mass-weight-01-01/assets/video/pointing-alpha.webm` (new), `methodica-science-mass-weight-01-03/assets/img/hook-orange-bubble.svg`, `methodica-science-mass-weight-01-03/css/style.css`, `methodica-science-mass-weight-01-04/assets/img/hook-orange-bubble.svg`, `methodica-science-mass-weight-01-04/css/style.css`, `methodica-science-mass-weight-01-05/assets/img/hook-orange-bubble.svg`, `methodica-science-mass-weight-01-05/css/style.css`, `methodica-science-mass-weight-01-06/assets/img/hook-orange-bubble.svg`, `methodica-science-mass-weight-01-06/css/style.css`, `WORK_PROGRESS.md`.

### Preview Tested

Yes — own `lomda-preview` dev server instance via the Browser pane (autoPort-assigned, since another chat's server already held 5555), real navigation/interaction calls (not just static screenshots) into each of components 01, 03, 04, 05, 06.

### Not touched / out of scope

`methodica-science-mass-weight-01-01/assets/img/point.png` and the pre-existing `assets/video/point.mp4` are unused legacy assets (superseded by `pointing.mp4`/`pointing.png` per an existing code comment) — left in place per the "never delete assets automatically, show the list first" rule; flagging here rather than deleting silently.

## Session 2026-08-25 (later): Screen 1 mascot eye transparency + bubble/character overlap

Scope: two follow-up point fixes flagged by the user on screen 1 (component 01), off a screenshot of the mascot feedback state — (1) the character's eyes were rendering as transparent holes instead of solid white, (2) the speech bubble sat on top of the character instead of clearing it.

### Fixed: Eyes keyed out as transparent

Root cause: the previous session's `pointing-alpha.webm` (see the "Session 2026-08-25" entry above) was keyed with ffmpeg's `colorkey=0xFDFDFD:0.14:0.10` — a *global* near-white color threshold with no notion of position. The character's eye whites are close enough in color to the (253,253,253) studio backdrop that they fell within the same threshold and got punched transparent too, even though they're fully enclosed by orange fur and nowhere near the frame's actual background. Confirmed by extracting a frame from the existing webm and compositing over magenta — both eyes showed magenta bleeding straight through the sclera.

Re-keyed all 73 frames from the original `pointing.mp4` in Python (numpy + scipy, no ffmpeg colorkey this time): for each frame, built a loose near-white candidate mask, ran 8-connected `scipy.ndimage.label` on it, and kept only the connected components that actually touch the frame border as "background" — everything else (including any near-white pixel enclosed by fur, like the eyes) stays fully opaque regardless of how close its color is to the backdrop. A tighter inner threshold gets alpha=0, the band between the two thresholds gets a linear alpha ramp for anti-aliased edges. Re-encoded the resulting RGBA frame sequence back to `assets/video/pointing-alpha.webm` (VP9/yuva420p) at the source's native 30fps, replacing the file in place — no HTML/JS changes needed since the filename didn't change.

Verified by decoding the new webm back out (explicitly via the `libvpx-vp9` decoder, same gotcha as last session — the default decoder drops alpha on readback) and compositing frames 1/20/40/60/73 over both magenta and green test backgrounds: eyes solid white with the pupil detail intact on every sampled frame, background cleanly transparent, no regression on the arm-raised poses (checked for accidentally-enclosed background pockets between the arm and body — none).

### Fixed: Speech bubble overlapping the character

With the transparency bug fixed, the enlarged mascot (171×180, from the prior session's enlarge pass) turned out to genuinely reach up into the `.hook-orange-bubble` box above it — not a keying artifact, a real layout overlap. Measured precisely rather than eyeballing it: injected a debug marker line in Preview at the character's true topmost opaque pixel (7.685% into the crop box, remeasured from the new alpha frames) and screenshotted it against the bubble's `getBoundingClientRect()` — confirmed the bubble's bottom edge sat ~24px below where the character's hair actually starts (worst case across the loop).

Vertical room here is genuinely tight: the bubble can't move up more than ~4px without colliding with the first student's own speech bubble directly above it (`.s1-bub-1`, fixed position, not part of this fix), so raising the bubble alone couldn't close a 24px gap. Split the fix two ways: raised the bubble the 4px that were actually available (375px→371px, gap to the student bubble now 6px instead of 10px), and pulled the mascot box back from the prior enlarge — 171×180 → 142×149 (same ~0.95 aspect, same bottom-left anchor, still noticeably bigger than the pre-enlarge 129×138) — enough that its hair clears the bubble by ~8-9px even at the loop's worst frame.

Verified live in Preview (`lomda-preview`, real `goTo(1)`/`hookSelect(1)`/`hookCheck()` into the actual feedback state, not a static mock): screenshotted the resting frame and re-checked ~1s and ~2.5s into the loop — clean gap between bubble and character at every sampled point, eyes solid, no other screen or component touched (confirmed `.hook-orange-crop`/`.hook-orange-wrap` only exist as dead template CSS copied into the other 5 components' stylesheets — none of their `index.html` files reference this markup).

### Files Changed

`methodica-science-mass-weight-01-01/assets/video/pointing-alpha.webm` (re-encoded in place), `methodica-science-mass-weight-01-01/css/style.css`, `WORK_PROGRESS.md`.

### Preview Tested

Yes — same `lomda-preview` dev server via the Browser pane, real interaction calls into component 01's screen 1 feedback state at multiple points in the mascot's animation loop.

---

## Session 2026-08-25 (later still): Galileo experiment video replaces static image (Screen 21 + Class Task reminder popup)

User supplied `galileo.mp4` (a real reenactment clip of the Pisa tower drop, dropped into component 02's `assets/video/`) with two explicit instructions: replace the static image on Screen 21 with it, and make it appear in a popup when the Class Task's "הזכירו לי את הניסוי של גלילאו" button is clicked.

### Fixed: Screen 21 (component 02) — image → video

Swapped the `<img src="assets/img/galileo.png">` in `.s-galileo-media#s21-media` for a `<video controls playsinline preload="metadata">` pointing at the new `assets/video/galileo.mp4`, keeping the same `id`/class (`s-galileo-img`) so the existing container sizing (`aspect-ratio:16/9`, `object-fit:cover`, `border-radius:16px`) and the screen's staged-entrance animation (`s21AnimEls` in `enterGalileoIntro()`) applied with zero JS changes. Did not touch `assets/img/galileo.png` — it's still used by Screen 23's zoom-lightbox.

### Added: video in the Class Task reminder popup (component 04)

The "הזכירו לי את הניסוי של גלילאו" button (data-screen=32) already opened a text-only recap popup (`.s28-reminder-card`) of the Screen 21 story. Copied `galileo.mp4` into component 04's own `assets/video/` (each component ships its assets independently) and added a `<video controls playsinline preload="metadata">` to the popup.

First attempt stacked the video below the existing paragraphs — measured live in the browser (`card.scrollHeight` 898 vs. `card.clientHeight` 630) and confirmed this pushed the "חזרה למשימה" button below the fold, requiring an extra scroll to reach the primary action. Rebuilt as a two-column layout instead (text right / video left, `.s28-reminder-layout`), mirroring Screen 21's own side-by-side pattern per the project's "reuse an existing template before inventing a layout" rule — card widened 900px→1120px, video fixed at 380px wide (16:9). Re-measured after the fix: `scrollHeight === clientHeight` (504px, no scroll needed), button fully visible.

`closeGalileoReminder()` (`js/main.js`) now also pauses the video and resets `currentTime` to 0 on close, so it doesn't keep playing silently behind the popup next time it's reopened — matching the existing reset pattern used by `s22CloseModal()` in component 02 for the Moon video modal.

Confirmed the other 5 components' `js/main.js` copies of `openGalileoReminder`/`closeGalileoReminder` are pre-existing dead code (no matching `#s31-reminder-popup` markup in their own `index.html`) — left untouched, only component 04's live copy needed the fix.

### A note on Preview testing methodology

Testing here needed care: this project's `serve` static server returns a plain 200 (no redirect) for a component path requested *without* a trailing slash (e.g. `/methodica-science-mass-weight-01-04`), which leaves the page's effective base URL missing that last segment — every relative asset path then resolves one directory too high (against the *unit root's* `assets/`, not the component's own). The unit root happens to already contain its own unrelated same-named `assets/video/galileo.mp4` (an older, differently-sized file, pre-existing from an earlier session, unused by any live screen), so an initial test against a no-trailing-slash URL "worked" by silently loading the wrong file instead of erroring. Caught this via `document.URL` / `video.currentSrc` inspection, not just a visual check, and re-tested every component URL with a trailing slash (`/methodica-science-mass-weight-01-0N/`) to confirm the *component's own* copy was actually the one loading (verified via `video.currentSrc` + `video.videoWidth/Height` + `readyState`).

### Follow-up: enlarged the video on both

User asked to size the video up slightly in both places. Screen 21 (`[data-screen="21"] .s-galileo-left`): 460px→540px — split off from the shared `[data-screen="21"], [data-screen="22"]` selector so the Moon-video screen (22) stays untouched at 460px. Popup (`[data-screen="32"] .s28-reminder-media`): 380px→460px. Re-measured both live in the browser after the change (not just eyeballed): Screen 21's text column (`.s-galileo-right`) still has `scrollWidth === clientWidth` (no wrap overflow) at the narrower 632px width; the popup card's `scrollHeight === clientHeight` (541px, under the 630px cap) with the "חזרה למשימה" button's rect still fully inside the card bounds — no internal scroll needed at the larger size either.

### Files Changed

`methodica-science-mass-weight-01-02/index.html`, `methodica-science-mass-weight-01-02/css/style.css`, `methodica-science-mass-weight-01-02/assets/video/galileo.mp4` (new), `methodica-science-mass-weight-01-04/index.html`, `methodica-science-mass-weight-01-04/css/style.css`, `methodica-science-mass-weight-01-04/js/main.js`, `methodica-science-mass-weight-01-04/assets/video/galileo.mp4` (new), `WORK_PROGRESS.md`.

### Preview Tested

Yes — `lomda-preview` (`serve .`) via the Browser pane, real `goTo()`/`openGalileoReminder()`/`closeGalileoReminder()` calls (not static screenshots) against each component's own trailing-slash URL. Verified: Screen 21 video plays with controls, no overflow; reminder popup's two-column layout fits with no internal scroll, button reachable and functional, video pauses/resets on close; no console errors from either component's actual `main.js`. Re-verified after the follow-up size increase with live `getBoundingClientRect()`/`scrollWidth`/`scrollHeight` measurements on both screens.

---

## Session 2026-08-26: Unit-wide answer-option entrance animation audit + fix

User reported the answer-option/distractor entrance animation felt inconsistent and too aggressive across the unit, and asked for a widescale audit + fix (not a per-screen patch). Scope was clarified with the user up front: component 04 (screens 31-34, Class Task) has no answer-option screens at all — confirmed via `unit-manifest.js` and its own `index.html` — so the request actually meant all 6 components.

### Audit (read-only, 6 parallel agents — one per component)

Each component's `css/style.css`/`js/main.js` was audited independently (they diverged since the 2026-08-23 split — no longer byte-identical copies). Headline finding: the target "Float In" spec (translateY 12px, fade in parallel, no scale, no bounce, `ease-out`, 500ms, ~100ms stagger between options) is **already** the dominant convention across nearly every SCQ/SCQ-image/2-option/dropdown-row/true-false-statement screen in the unit — that part needed no widescale rewrite. The actual "aggressive/jarring" symptom traced to a handful of screens where individual option-like elements have **zero** entrance transition and pop in instantly the moment their (correctly-animating) parent container fades in:

- Component 01, screen 11 (Drag&Drop summary table): `.s10-bank-item` tiles — no entrance CSS at all; container `.s10-anim` also used an off-spec 10px/`ease` instead of 12px/`ease-out`.
- Component 03, screen 26 (Drag&Drop מסה/משקל matching): `.s26dnd-card` — no entrance CSS at all; `s26dndRender()` rebuilds cards on every drag/drop with no fade logic.
- Component 05, screen 43 (Hotspot/graph question): `.hsp-marker` — the clickable data-point dots had no opacity/transform/transition rule; `hspGenRenderMarkers()` created them via `document.createElement` with no `is-visible` handling.

Also found (component 05, screen 41, farmer/rice question): a genuine timing bug, not a style one — `scqGenEnter()`'s own generic image-gating and the screen's local override (`enterScreen35()`) both scheduled `is-visible` on the same `#s34-img`, with the generic engine's timer firing first (~600ms) and pre-empting the local override's intended ~2300ms reveal. The farmer image was popping in before the answer options finished, breaking the screen's documented intended order (text → options → image).

Full audit detail (per-screen CSS/JS line citations, `@keyframes` inventory, every question type) is preserved in this session's own transcript, not duplicated here.

### Fixed

- **Component 01** (`css/style.css`, `js/main.js`): `.s10-bank-item` now gets a dedicated `.s10-item-anim` class (translateY 12px → 0, 500ms ease-out) applied only on a genuine first entry; `ddq12RenderBank(animate)` takes an explicit flag so drag/drop re-renders during interaction never replay it. `.s10-anim` base rule normalized to 12px/`ease-out` (was 10px/`ease`) to match the rest of the unit.
- **Component 03** (`css/style.css`, `js/main.js`): same pattern — `.s26dnd-card.s26dnd-item-anim`, threaded through `s26dndBuildCard(itemId, showResult, animate)` / `s26dndRender(showResult, animate)` / `s26dndEnter()`, with the per-card stagger scheduled in `enterScreen24()` (after its own timer-reset, so the container-fade reset doesn't wipe the card timers).
- **Component 05** (`css/style.css`, `js/main.js`): `.hsp-marker.hsp-marker-anim` (translateY combined with the marker's existing `translate(-50%,-50%)` centering transform, so the entrance doesn't reposition the dot); `hspGenRenderMarkers(sid, animate, startDelay)` staggers markers ~100ms apart once the graph itself starts revealing. Screen 41's image-timing conflict fixed with a narrow `GEN_DATA[36].skipImageEntranceGate` flag that tells `scqGenEnter()` not to also schedule its own (pre-empting) image reveal — a 2-line, additive change that doesn't affect any other screen using the shared engine.
- Stale code comment fixed in passing (component 05: said `translateY(14px)`, actual value is `12px`).

Deliberately **not** changed: component 02's screens 17/18/20 have a much longer pre-option lead-in (3-4s) than sibling SCQ-image screens like 23 (1s) — flagged during the audit as a real inconsistency, but it's about how long the *supporting text/image* takes before options start, not the options' own float treatment, so left out of this pass pending a decision on scope. Dropdown-menu-item reveals (screens 13/19/20, opened by click, not on screen entry) were also left untouched — out of scope per the user's own "only the initial entrance state" instruction.

### Verified

Live in `lomda-preview` (Browser pane), each component's own trailing-slash URL (the unit's static server drops relative asset paths one directory too high on a no-trailing-slash request — see the note in the 2026-08-25 session above; caught this again this session before trusting any test result).

- Screen 11: fresh entry → tiles start `opacity:0`/`translateY(12px)`, settle to visible staggered ~100ms apart; drag/drop re-render → tiles appear instantly, no `s10-item-anim` class; `ddq12ShowSolution()` + revisit → bank cleared, no animation.
- Screen 26: fresh entry → same float-in confirmed; full check→correct→feedback cycle → cards re-render instantly (`is-correct`, no animation class); revisit of a solved question → instant, no replay.
- Screen 43: fresh entry → markers tagged `.hsp-marker-anim`, fade in staggered after the graph; toggling a marker (`hspGenToggleZone`) → re-renders instantly, no animation class, no replay.
- Screen 41: `#s34-img`'s `is-visible` transition now measured firing at ~2.3-2.8s after entry (previously ~0.6s, ahead of the options) via a `MutationObserver` timestamp capture — confirmed the image now appears after the options, not before; visual screenshot confirmed no layout regression (image, question spans, all 4 options rendering correctly).
- `node --check` clean on all 3 touched `js/main.js` files; brace-balance (`{`/`}` count) confirmed on all 3 touched `css/style.css` files.

### Files Changed

`methodica-science-mass-weight-01-01/css/style.css`, `methodica-science-mass-weight-01-01/js/main.js`, `methodica-science-mass-weight-01-03/css/style.css`, `methodica-science-mass-weight-01-03/js/main.js`, `methodica-science-mass-weight-01-05/css/style.css`, `methodica-science-mass-weight-01-05/js/main.js`, `WORK_PROGRESS.md`.

### Next Recommended Task

Decide whether to also normalize component 02's 3-4s pre-option lead-in on screens 17/18/20 down to match sibling SCQ-image screens (~1s) — flagged this session but deliberately left out as a separate scope question (timing-of-lead-in vs. the option-float-in itself).

---

## Session 2026-08-26 (continuation): Fixed each component's own `index_dev.html` — navigation loaded but screen content stayed blank

User reported the dev interface with navigation wasn't loading. Reproduced: `methodica-science-mass-weight-01-05/index_dev.html` (and, by inspection, all 6 components' own copies — identical markup) opened directly showed the screen-list sidebar fine, but the iframe content area was blank white, with a console error `Cannot set properties of null (setting 'disabled') at http://localhost:5555/js/main.js:5190`. The root-level `index_dev.html` / `index.html` (the QA shell) was unaffected — this only hit a component's *own* dev tool opened directly.

### Root cause

Each component's `index_dev.html` had `<iframe id="dev-iframe" src="index.html">`. The local `serve` dev server has clean-URL redirects on by default: a request for `.../methodica-science-mass-weight-01-05/index.html` gets 301'd, and the redirect chain collapses down to the **bare directory path with no trailing slash** (`.../methodica-science-mass-weight-01-05`, confirmed via `curl -sL -w '%{url_effective}'`). Once the iframe's document sits at that slash-less URL, every one of its own relative requests (`css/style.css`, `js/main.js`, `assets/...`) resolves one directory too high — landing on the **unit root's** stale pre-split `js/main.js`/`css/style.css` instead of the component's own files. This is the exact failure mode `unit-manifest.js`'s own comments already document ("some static hosts 301-redirect a request for '.../index.html' to the bare directory path WITHOUT a trailing slash … loading the wrong files entirely") — just not yet applied to the per-component dev tool's iframe.

The root dev tool doesn't hit this: `unit-shell.js` already sets `frame.src = COMPONENTS[i].path`, and every entry in `unit-manifest.js`'s `COMPONENTS[]` array is a trailing-slash directory path (`'methodica-science-mass-weight-01-05/'`), not a literal `index.html` request — so it never enters the redirect chain that causes the bug.

### Fixed

Changed all 6 components' `index_dev.html` from `src="index.html"` to `src="./"` (trailing-slash self-reference), with a comment explaining why, matching the same pattern the root shell already uses. Verified live (fresh tab, cold navigation, not just a patched `iframe.src`): `methodica-science-mass-weight-01-05/index_dev.html` now loads content correctly on first navigation, no console errors, `js/main.js`/`css/style.css` requests correctly resolve to the component's own path (confirmed via network log). Spot-checked screens 43 (hotspot) and the sidebar's default screen 35 render correctly. Root's own `index_dev.html` still has the same superficial `src="index.html"` pattern but is provably unaffected (confirmed working both before and after this fix) since it sits at the server root with no sub-path to lose — left untouched rather than changed without a demonstrated bug.

### Files Changed

`methodica-science-mass-weight-01-01/index_dev.html`, `methodica-science-mass-weight-01-02/index_dev.html`, `methodica-science-mass-weight-01-03/index_dev.html`, `methodica-science-mass-weight-01-04/index_dev.html`, `methodica-science-mass-weight-01-05/index_dev.html`, `methodica-science-mass-weight-01-06/index_dev.html`, `WORK_PROGRESS.md`.

### Preview Tested

Yes — `lomda-preview` via the Browser pane. Diagnosed with `curl -sD`/`curl -sL -w '%{url_effective}'` against the running dev server to confirm the exact redirect chain before touching any code, then verified the fix with a fresh browser tab (to rule out stale console/cache carryover) doing a cold navigation to a component's `index_dev.html`, confirming zero console errors and correct network resolution.

---

## Session 2026-08-27: Unit-wide draggable feedback panels

User asked, for the whole unit (not just one component): make every feedback panel draggable by the learner, reusing any existing draggable pattern if one exists, without changing visual design/content/logic.

### Investigation

Grepped every component's `index.html`/`js/main.js`/`css/style.css` for any prior draggable-feedback implementation first — none existed (the only `draggable` hits in the codebase are the unrelated HTML5 native drag-and-drop question type, screen 11/26). Then did a full inventory of every feedback container across all 6 components by grepping `id="*feedback*"` / `id="*-fb*"` div tags (not just the generic `.s11-feedback` engine — several bespoke ones use different naming): 22 feedback panels total across 6 components (01: 2, 02: 8, 03: 4, 04: 1, 05: 4, 06: 3). Confirmed none contain interactive children (no buttons/inputs inside any feedback body — all title+body text only), so drag-vs-click never needs to dodge a nested control. One panel (`s36-feedback`, component 05, Advanced Q1a hotspot) has its own `onclick="hspGenFeedbackClick(38)"` — the whole panel is a "click anywhere to dismiss" surface — flagged as needing special drag-vs-click handling.

### Implementation

Built one shared, non-invasive module — `js/feedback-drag.js` — byte-identical across all 6 components (no shared build system exists between components, so this is copy-identical rather than a single imported file, matching how the rest of the project already duplicates its per-component `main.js`/`style.css`). Included via one `<script src="js/feedback-drag.js"></script>` tag added right after `js/main.js` in each component's `index.html` (not `index_dev.html` — that file only iframes the component's own `index.html`, confirmed via the previous session's trailing-slash writeup above, so nothing there needed touching). Every existing feedback container div got one new `data-fb-draggable` marker attribute (22 total edits, one per panel, via `id="..."` anchor matching — no other markup touched).

Behavior: panels render exactly as designed (same container/size/position/colors, per this project's existing "feedback replaces the visual element" convention) until a learner actually starts dragging one (6px movement threshold distinguishes a drag from a plain click/tap). Only then does the panel get locked into free-floating positioning within its own screen's 1280x710 canvas, clamped so it can never leave the visible area. The instant the panel goes hidden→visible again (a retry, a new question, a fresh attempt — detected via a `MutationObserver` on `style`/`class`, not by touching any of the ~30 existing show/hide call sites scattered through `main.js`), it resets fully back to its designed default position, so a dragged offset never carries into a new feedback state.

Two non-obvious technical problems found and fixed during implementation, both same root cause (an assumption about the containing block for the panel's new positioning that turned out wrong for real screens in this project):
- Some panels sit inside an entrance-animation wrapper (e.g. `.hsp-graph-row.hsp-anim.is-visible`) that ends up with a computed `transform: matrix(1,0,0,1,0,0)` — an *identity* transform, but CSS still treats any non-`none` transform value as establishing a new containing block for `position:fixed`/`position:absolute` descendants. The first implementation positioned dragged panels relative to `#app` assuming it was always the containing block; this silently hijacked the coordinate math on any panel nested under such a wrapper (confirmed on component 05's hotspot feedback — the panel would drag but land ~160px off from the cursor). Fixed by reparenting the panel to be a **direct child of its own `[data-screen]` .screen element** at drag-lock time (`.screen` is `position:absolute`/`transform:none` unconditionally in this project's base CSS, confirmed across all 6 components' stylesheets — a guaranteed-stable anchor), switching to `position:absolute` relative to it instead of `position:fixed` relative to `#app`. A comment-node placeholder marks the panel's original DOM spot so the reset restores it exactly (same parent, same sibling position) rather than leaving it parked under `.screen`.
- The click-vs-drag suppression (needed so the hotspot panel's own "click to dismiss" doesn't fire from the drag's own release) was first built as a single global "swallow the next click" boolean. Testing found this browser/tool's synthetic drag gesture doesn't always dispatch a following `click` event at all after `pointerup` — which would leave the flag stuck true forever, silently eating whatever unrelated real click happened to land next. Replaced with a self-expiring, panel-scoped listener (removes itself on the first matching click, or after 300ms with no click at all) so a missing click event can never leak into swallowing a later, unrelated one.

### Verified in Preview (real interactions, not static screenshots)

Per component, using the actual `index.html` (not the dev wrapper) via the `lomda-preview` server: forced each feedback variant visible via its own real show-function path, then dragged with a real mouse gesture and confirmed numerically (not just visually) — final position, canvas-bounds clamping (dragged fully into a corner, panel stopped exactly at `1280-width`/`710-height`, never exceeded), no console errors. Confirmed across every structural variant found: plain `left`-positioned panels (component 03), a `right`-positioned RTL panel (component 02, screen 19's `s19q-fb`), a `position:static` normal-flow "replaces the video in place" panel (component 02, screen 20's `s20-fb-panel`), and the click-to-dismiss hotspot panel (component 05, `s36-feedback`) — confirmed a plain click still dismisses it normally, and a drag no longer triggers an accidental dismiss. Confirmed the hidden→visible reset: dragged a panel, triggered a **new** feedback state (retry with a different answer), confirmed the panel reappeared at its original designed position with no stale offset. Component 01 and 06 spot-checked with one drag each, zero console errors. All 22 panels carry `data-fb-draggable`; `feedback-drag.js` is byte-identical (`md5`-verified) across all 6 copies.

### Not touched / out of scope

Hint overlays (`*-hint-overlay`) and the two non-feedback popups (Class Task Galileo reminder popup, video/image zoom modals) were deliberately left out — the ask was specifically feedback panels, and this project's own QA checklist already lists "Feedback" and "Popup" as separate categories. Flagged to the user as an easy follow-up (same `data-fb-draggable` pattern) if they want those draggable too.

### Files Changed

New: `js/feedback-drag.js` in each of the 6 components (identical). Modified: each component's `index.html` only (one script tag + one `data-fb-draggable` attribute per existing feedback div — no other markup, CSS, or `main.js` logic touched anywhere). `WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Session 2026-08-27 (continuation): D&D retry UX (נסה שוב) + storage/bank scrollbar-flash fix

User asked for two fixes across every D&D (drag-and-drop) implementation in the unit: (1) after an incorrect check, give the learner an explicit "נסה שוב" action that returns only the wrong items to the bank while keeping correct ones locked; (2) stop a scrollbar from briefly flashing inside the draggable-item bank during screen load.

### Investigation — only two live D&D implementations exist in the whole unit

Grepped `draggable="true"`/`dragstart` across all 6 components' `main.js`/`index.html` (not just function-name matches, since `ddq12*` function *definitions* turned out to exist as dead leftover code in all 6 components' `main.js` from before the unit was split, but are only ever wired into a real screen in component 01). Confirmed exactly two live drag-and-drop-with-storage screens exist:
- **Component 01, screen 11** (`ddq12*`, summary table): single-attempt only — `ddq12Check()` goes straight from check to a "למיון הנכון" (show solution) button, no retry concept at all, no feedback popup with attempt-retry text. Per the task's explicit "do not accidentally create unlimited attempts if the template does not allow them," this screen was **left untouched** — it has no attempts budget to add a retry into.
- **Component 03, screen 26** (`s26dnd*`, sentence-to-מסה/משקל matching): already a `maxAttempts:2` engine (`GEN_DATA[25]`) whose `feedbackIncorrectFirst` text is `{ title: 'התשובה לא נכונה.', body: 'שננסה שוב?' }` — an exact match for the task's quoted screenshot text. This confirmed the scope: only this one screen needed both fixes. (Its bank, `.s26dnd-source`, was also the only D&D bank anywhere in the unit with `overflow-y: auto` — component 01's bank has no overflow rule at all, so it was never at risk of the scrollbar-flash bug.)

### Fix 1 — נסה שוב retry button (`methodica-science-mass-weight-01-03/js/main.js`)

Previously, a first-wrong check locked correctly-placed cards, left wrong cards exactly where dropped, showed the "נסה שוב?" feedback text, and **hid the check button entirely** — the only way to retry was to intuit that dragging a card again would dismiss the feedback and silently bring the button back (with its original "צדקתי?" label, never actually saying "try again"). This was the actual UX gap.

Reused the existing check button (`bq2-check-btn`) instead of adding a new element, per the task's explicit instruction. New `s26dndAwaitingRetry` flag: on a first-wrong `s26dndCheck()`, the board (including still-wrong cards, not just locked-correct ones) becomes fully non-draggable, the feedback panel shows as before, and the check button is relabeled `נסה שוב` (kept visible/enabled) instead of hidden. Clicking it — same button, same `onclick="s26dndCheck()"` — now routes through a new `s26dndRetry()` (an early-return dispatch inside `s26dndCheck()` when `s26dndAwaitingRetry` is true, so it never increments `state.attempts`): only the incorrectly-placed items move back to `s26dnd-source`; correctly-placed/locked items stay put; feedback hides; the button relabels back to `צדקתי?`; disabled-state is recomputed by the existing `s26dndUpdateCheckBtn()` (naturally disabled again since the just-vacated targets are empty). The old implicit "dragging dismisses feedback and reshows the button" shortcut in `s26dndDragStart` was removed — it's unreachable now that cards are non-draggable while awaiting retry, and it contradicted the new explicit-button flow.

Attempts/final-answer behavior is untouched: `state.attempts` still increments only inside a real `s26dndCheck()` call (never on the נסה שוב click itself), so the existing `maxAttempts: 2` cap and the final-wrong reveal-and-lock path work exactly as before — verified a learner still gets exactly 2 real tries, not unlimited.

### Fix 2 — bank scrollbar flash (`methodica-science-mass-weight-01-03/css/style.css` + `js/main.js`)

Root cause confirmed empirically (not guessed): `.s26dnd-source` has `overflow-y: auto; max-height: 417px`, and its cards' entrance Float-In (`.s26dnd-item-anim`, `transform: translateY(12px)→0`) counts toward the container's *scrollable* overflow per the CSS Overflow spec while the transform is mid-transition — instrumented the real page (`scrollHeight` vs `clientHeight` sampled every 100ms through a real entrance) and measured exactly `276` vs `264` (the 12px transform amount) during the animation window, dropping to `264`/`264` (zero overflow) the instant the transform settles. So the container was briefly, genuinely overflowing during the animation, which is what `overflow-y: auto` was correctly reacting to — not a hidden/inexplicable browser quirk.

Fix: `.s26dnd-source` now defaults to `overflow-y: hidden` and only gets `overflow-y: auto` once a `.dnd-scroll-ready` class is added — not via a guessed timeout, but via a `transitionend` listener on the actually-last-entering card (falls back to a scheduled add, computed from the real card count and stagger timing rather than a magic number, for the edge case where a mid-entrance drag interaction rebuilds the card DOM nodes and orphans the listener). The "already solved / resumed" entry path (no animation plays at all) sets `.dnd-scroll-ready` immediately. Legitimate future overflow (more cards than fit) still scrolls normally once the class is applied — confirmed via the same instrumentation that zero samples ever had `scrollHeight > clientHeight` while `overflow-y: auto` was active.

### Verified in Preview (real interactions, not static screenshots)

`lomda-preview` server, component 03's real `index.html` directly (not `index_dev.html`, and navigated with a trailing slash — a bare `.../methodica-science-mass-weight-01-03` URL without one resolves `js/main.js` against the wrong base and silently loads the *repo-root* legacy monolith script instead, which doesn't define any `s26dnd*` function — worth remembering for any future component-03 Preview session). Confirmed via instrumented sampling that the bank's `overflowY` stays `hidden` through the entire entrance and only flips to `auto` after settling, with zero overflowing samples once live. Ran the full retry flow twice: once via direct state calls, once via real synthetic `DragEvent` sequences (`dragstart`→`dragover`→`drop`→`dragend`, with a real ~20ms gap so the app's own deferred vacate-timeout fires in the same order a real drag produces) dispatched at real click coordinates through the actual button — 2 correct + 2 wrong placed, check → red feedback + `נסה שוב` button + 2 wrong cards visibly still in place uncolored + 2 correct cards green/locked, click נסה שוב → wrong cards visibly back in the bank and re-draggable, correct cards still green/locked, button back to disabled `צדקתי?`, re-dragged the 2 returned cards to their correct spots → check → `מצוין!` success feedback + `המשך` button. Also verified the final-wrong path independently (both attempts wrong): attempts capped at exactly 2, correct mapping revealed, no retry offered after the final attempt. Confirmed via `read_console_messages` that no new console errors appeared at any step (the 4 stale errors present are pre-existing and unrelated, from `js/main.js:5190` — the root-level legacy monolith file, not this component, left over from the trailing-slash mistake before it was diagnosed).

### Files Changed

`methodica-science-mass-weight-01-03/js/main.js`, `methodica-science-mass-weight-01-03/css/style.css`, `WORK_PROGRESS.md`. No other component touched — confirmed neither `ddq12` (component 01) nor any other component has a live D&D screen needing either fix.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Session: Screen 20 (component 02, Q5 — Neil Armstrong dropdown) feedback panel corrected to match 720 Templates Figma

User flagged that screen 20's feedback (after checking the תצפית/הסבר מדעי dropdown rows) didn't match the Figma template. No Unit Figma exists for this project (confirmed again in `SESSION_TASK.md`), so the user supplied the actual reference: the 720 Templates Figma's "Question Templates" frame (`https://www.figma.com/design/eSbp4bKHgBky0rakDb8l9N/720---UI-Templates?node-id=1284-23642`).

Pulled `get_design_context` on multiple `media=image`/`media=none` states in that frame (`SingleChoiceQuestion` `media=image, state=incorrect-attempt-1` node `962:23385`, `DropdownQuestion-SingleParagraph` `state=correct` node `984:10974`) and found the real "Popup Feedback" component is **not** what this project's own `CLAUDE.md` described: it's a fixed-size card (`426px` wide, `border-radius:12px`, `padding:24px`, `gap:24px` between title/body, `text-right`) anchored at a corner (`bottom:87px; left:16px` in the Figma mock) that overlaps only the **lower portion** of the media — the media itself stays visible, it is never hidden or replaced. Confirmed visually via rendered screenshots of both nodes (downloaded to scratchpad), not just the generated markup.

This directly contradicted `CLAUDE.md`'s "Feedback Panels" section (which said the feedback fully replaces the visual element, using the exact same container/width/height, text centered) — a rule that had been deliberately, consistently applied across ~20 other screens in this component already (every sibling `.s11-fb-title`/`.s11-fb-body` pair uses `text-align:center`). Flagged the conflict to the user explicitly rather than guessing; user chose to update both the project rule and this screen (not a unit-wide rewrite of every other screen's feedback — out of scope for this session).

**`CLAUDE.md`**: rewrote the "Feedback Panels" section to describe the verified Figma behavior (media stays visible; feedback is a fixed-size corner popup covering only the media's lower portion; `426px`/`12px radius`/`24px padding` tokens; text right-aligned not centered; no manual X close button — also cross-referencing the `720-templates` skill's "No manual close" note). Updated the matching line in the "Before Finishing Every Screen" checklist.

**Screen 20 only** (`methodica-science-mass-weight-01-02/css/style.css`, `.s20-left`/`.s20-fb-panel`/`#s20q-fb-title`/`#s20q-fb-body`): `.s20-left` now `position:relative` with the video/caption anchored at the top (no longer vertically centered as a pair with the popup). `.s20-fb-panel` changed from a `display:flex` block that took over the whole column (causing dead white space below it, since the column height was set by the taller right-hand dropdown rows) to `position:absolute; left:0; right:0; bottom:0`, `border-radius:12px` (was 16), `align-items:stretch` (was `center`), `max-height:80%` so the video's top stays visible above it. Title/body `text-align` changed from `center` to `right`. Kept the existing 24px font-size (a separate, already-confirmed project-wide typography override — not part of this fix, not reverted).

`methodica-science-mass-weight-01-02/js/main.js` (`dq20ShowFeedback`): removed the `vw.style.display = 'none'` line that hid the video-wrap when feedback shows — the video now keeps playing behind the popup, matching Figma.

### Verified in Preview

`lomda-preview` server, component 02's `index_dev.html`, jumped straight to screen 20. Filled all 4 dropdown rows with answers verified against `DQ20_ITEMS` in `main.js` to be genuinely wrong (not just visually-guessed-wrong from the screenshot — first attempt at reproducing accidentally picked all 4 correct answers because the wrong/correct mapping isn't obvious from the row text; re-checked the actual `correct:` values in code before the second attempt), clicked צדקתי?. Confirmed: video keeps playing/visible above the popup, popup anchored to the bottom of the left column with no dead space below it, all four rows show the correct-answer text with red ✗/green ✓ marks per the existing per-row logic (untouched), feedback title/body text right-aligned, no console errors (`read_console_messages`).

### Files Changed

`CLAUDE.md`, `methodica-science-mass-weight-01-02/css/style.css`, `methodica-science-mass-weight-01-02/js/main.js`, `WORK_PROGRESS.md`. Deliberately did not touch any other screen's feedback panel in this or any other component — the CLAUDE.md rule change is documented but not yet propagated project-wide.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Session (continuation): CLAUDE.md wording precision pass + screen 20 feedback font-size fix

User asked for the new "Feedback Panels" rule wording in `CLAUDE.md` to be tightened to three explicit points (media stays visible per the verified Figma "Popup Feedback" pattern; never hide/replace media unless that screen's own specific Figma frame explicitly shows it; Figma template is the source of truth) plus an explicit non-retroactive scope note (fix only screens actually found to contradict the template, don't audit everything, screen 20 stays as already fixed). Rewrote the section accordingly — no code changes from that part.

Then the user sent a screenshot of screen 20's feedback showing the title/body font visibly larger than other feedback panels and asked for it to match. Investigated by computed style (not guesswork): `#s20q-fb-title`/`#s20q-fb-body` were `24px` (a font-size bump the user explicitly asked for in an isolated request on 2026-08-24 to make the title match the body — but that session never checked it against *other* screens' feedback panels, only against itself). Found the actual "SHARED FEEDBACK COMPONENT (canonical)" in `style.css` (`.feedback`/`.feedback-title`/`.feedback-body`, used e.g. by screen 19's `#s19q-fb`) is `426px` wide, `border-radius:12px`, `padding:24px`, anchored `bottom:87px;left:16px` — an exact match for the Figma "Popup Feedback" tokens already cited in the rewritten CLAUDE.md rule — and its title/body font-size is `20px`, matching Figma's own `Body/B-8`(bold 20)/`Body/B-6`(regular 20) type styles pulled via `get_design_context` in the prior session. So the true, Figma-verified, "canonical" size is 20px; the 24px on screen 20 was the outlier, not the standard.

### Fixed

`methodica-science-mass-weight-01-02/css/style.css`: `[data-screen="20"] #s20q-fb-title` / `#s20q-fb-body` font-size `24px` → `20px`.

### Verified in Preview

`lomda-preview`, component 02 `index_dev.html`, screen 20, forced the incorrect state via `dq20Pick`/`dq20Check` in the live page (function declarations are on `iframe.contentWindow`; the `DQ20_ITEMS`/`DQ20_FB_*` `const`s are not, since `const` doesn't attach to `window` — used known-wrong values cross-checked against `DQ20_ITEMS` in source instead of guessing from the UI). `getComputedStyle` confirms both title and body now render at `20px`. No console errors.

### Files Changed

`methodica-science-mass-weight-01-02/css/style.css`, `CLAUDE.md`, `WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Session: Galileo Advanced Q1 (screens 37/38) — answer-option dead space + applet item-list text size

User reported two issues on a screenshot of Advanced Q1 section א (data-screen=37, "שחזור הניסוי של גלילאו"): the answer options had a lot of unused empty space, and the text on the applet's draggable-item list ("אלמנטים") still looked very small.

**Answer options (screens 37/38 only):** the shared `.s11-option` rule (used by screens 33/37/38/45/46/47/42) leaves width unset inside a `display:flex; flex-direction:column` `.s11-options` container, so every option stretches (default `align-items:stretch`) to the full ~1200px-wide `.sadv-qa-area` column regardless of its own text length — directly against the CLAUDE.md Question Layout rule ("maximize width to the text, no large dead space, no excessive width"). Added a screen-scoped override (`[data-screen="37"/"38"] .s11-options { align-items: flex-start }` + `.s11-option { width: fit-content; max-width: 100% }`) so each pill sizes to its own text and stays anchored to the RTL-start (right) edge of the column. Only screens 37/38 touched — 33/45/46/47/42 share the base rule but weren't reported and weren't re-verified, so left as-is per the project's non-retroactive-fix convention.

**Applet item-list text:** traced the "still small" complaint to `assets/widgets/galileo-applet/index.html`, an embedded HTML widget built at a natural 880×820.3px and scaled down via CSS `transform` to fit its docked box (0.6095 on screens 37/38, 0.5966 on screen 36, 0.8363 in the fullscreen modal) — so its own internal font-sizes end up much smaller on screen than the rest of the lomda's 20-24px text. Bumped the smallest internal sizes by 1-2px: `.obj-name` 15→17px, `.obj-details`/`.mass-pill` 12→13px, `.claw-sublabel` 14→15px, `.floor-txt`/`.ruler-tick span` 12→13px, `.timer-lbl` 13→14px, `.bank-hdr` 16→17px. Verified live (temporary injected `<style>` override, then measured) that none of the 6 item names wrap to a 2nd line and the card min-height (102px) and overall natural body height (~820px) are unchanged, so the existing scale/box math for all three embed sites (36, 37/38, modal) still holds — no box/aspect-ratio changes needed anywhere.

Also noted, not fixed (out of scope / dev-server-only artifact): requesting the unit's `index.html` without a trailing slash through `npx serve` causes a 301 that drops the filename without adding a slash back, which breaks every relative asset's resolved base (CSS, JS, the applet iframe itself) — the applet's own `index.html` already defends against this with an inline `<base href>`-fixing script; the outer unit `index.html` does not. Did not touch this since it never surfaced with a trailing-slash URL and wasn't part of what was reported.

### Fixed

`methodica-science-mass-weight-01-05/css/style.css`: added `[data-screen="37"/"38"] .s11-options`/`.s11-option` width-to-content override (see above).
`methodica-science-mass-weight-01-05/assets/widgets/galileo-applet/index.html`: bumped 8 font-size declarations (see above).

### Verified in Preview

`lomda-preview`, unit 05's own `index.html` (loaded with a trailing slash so it resolves its own `css/style.css`, not the root project's stale copy of the same file), `goTo(37)` / `goTo(38)`. Confirmed via `getBoundingClientRect`: all 4 options on both screens now size to their own text with zero dead space, right-anchored, none clipped. Confirmed via the applet iframe's own `document`: none of the 6 item names wrap, card heights stay at the 102px minimum, natural body height unchanged (~820px, matching the pre-existing 820.3 the embed scale math assumes). Clicked an option on both screens to confirm selection/is-selected styling and the `hover`/`is-correct` states still work post-resize. No console errors.

### Files Changed

`methodica-science-mass-weight-01-05/css/style.css`, `methodica-science-mass-weight-01-05/assets/widgets/galileo-applet/index.html`, `WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Session 2026-09-08: Screen 37/38 (Galileo Advanced Q1) — uniform option width, applet expand icon, applet font/size bump

User sent a screenshot of screen 37 (section א) with four fresh complaints: (1) the four answer options were visibly different widths — should all match the widest (3rd) one; (2) the applet's "enlarge" button doesn't use the same magnifying-glass icon used everywhere else for image zoom; (3) the applet's own internal fonts are still too small to read; (4) the whole applet needs to be bigger.

### 1. Uniform option width (screens 37/38)

The previous session's fix (`width: fit-content` per option, see above) actually regressed to "all options full-width" under real content, not "each fits its own text" as originally verified — investigated and found the *root cause* was unrelated to that CSS at all: loading the component via `.../methodica-science-mass-weight-01-05/index.html` (or the bare directory) without a trailing slash makes this dev server silently redirect to a URL one level up, so the page's relative `css/style.css` link resolved to the **root project's** stale copy instead of the component's own — reproducing the exact trailing-slash bug already documented in this file from a previous session, just not yet hit for *this* screen. Confirmed via `getComputedStyle`/`document.styleSheets`: with the wrong stylesheet loaded, `[data-screen="37"] .sadv-img-area` computed to the *screen-36* rule's `525px` instead of `536px`, and the fit-content rule for `.s11-option` never applied at all (computed `width` resolved to a plain stretched `651px`, `max-width: none`). Reloading with the correct trailing-slash URL (`.../methodica-science-mass-weight-01-05/`) showed the *actual* current behavior: fit-content **was** working (options measured 477/448/505/461px), which is exactly the "different lengths" the user is objecting to — so the real fix needed was a genuine design change, not a bug fix.

Replaced the fit-content approach with a one-column CSS Grid on `[data-screen="37"/"38"] .s11-options` (`grid-template-columns: minmax(0, max-content); justify-content: start`) with no explicit `width` on `.s11-option` (default `justify-self: stretch` fills the grid column). A single-column `max-content` track sizes itself to the widest item's own natural width, and every row then stretches to match — so all four options end up uniformly at the 3rd option's width on screen 37, anchored right (RTL start), with zero dead space past what the longest text needs. `minmax(0, ...)` lets the column still wrap/shrink instead of overflowing if a future translation makes an option longer than the qa-area itself (confirmed this already happens correctly on screen 38, where the 4th option is genuinely too long for one line — all four options there compute to the full clamped `620px`/`556px` qa-area width with wrapped multi-line heights, still uniform, still no overflow).

### 2. Applet expand-icon consistency (screens 21/37/38 — all 3 `.applet-expand-btn` instances)

The applet's own expand button used a bespoke "circle + crosshair" SVG (a magnifying glass with a `+` inside), different from the plain magnifying-glass icon (`circle` + one diagonal handle line) used by every other in-unit zoom affordance (`.img-zoom-btn`, screens 23/34/etc.). Replaced the SVG markup in all 3 occurrences (screen 21's guide intro, 37, 38) with the same circle+handle glyph as `.img-zoom-btn` (white stroke, sized for the existing 22×22 box) — button chrome (dark rounded-square, bottom-right, 48×48) intentionally left unchanged, since that sizing/contrast was itself a deliberate fix from an earlier session for legibility at the small docked scale; only the icon glyph itself needed to match.

### 3. Applet internal font sizes (assets/widgets/galileo-applet/index.html)

A previous session already bumped several of these once (15→17, 12→13, etc.) but the user still found them too small. Re-verified per-element slack this time by measuring real `scrollWidth`/`scrollHeight` vs `clientWidth`/`clientHeight` inside the applet's own live iframe document (not guessed from CSS) before committing to new sizes, since several elements (bank header, timer label/number, buttons) looked "tight" from raw box widths but were actually just flex/block-stretched (not glyph-constrained) — confirmed via injected temporary `<style>` overrides tested live, then reverted before writing the real values:
- `.hdr p` 18→20px (confirmed 1-line fit, was using only ~95% of its width at 18px, comfortable at 20px)
- `.obj-name` 17→18px (19px made "דיסקית פלסטלינה" wrap to a 2nd line while the other 5 names stayed 1-line — backed off to 18px, confirmed all 6 stay 1-line and consistent)
- `.obj-details`/`.mass-pill` 13→15px, `.claw-sublabel` 15→17px, `.floor-txt`/`.ruler-tick span` 13→15px, `.timer-lbl` 14→16px, `.timer-num` 27→29px, `.bank-hdr` 17→18px, `.btn-release`/`.btn-next` 16→17px — all confirmed no wrap/clip via live scrollHeight/scrollWidth checks against their real content (all 6 bank items, both claw labels, both timer boxes).

### 4. Enlarging the docked applet box itself (screens 37/38 only)

Investigated whether the docked box could just be made bigger outright. Found the box height was already maxed against the layout's own vertical budget (128px top offset to the nav bar's 636px top edge = exactly 500px, matching the then-current placeholder height with **zero** internal slack) — the box was already exactly aspect-matched (536×500 for the 880×820.3 natural applet at 0.6095 scale), so extra *width* alone (e.g. narrowing the question/options column) would not enlarge the applet's rendered content at all — it would only add empty side margin, since height is what determines the uniform scale factor. Flagged this precisely to the user (via AskUserQuestion) rather than silently doing a cosmetic-only widen or skipping the request; user chose to combine both levers — a modest, deliberate trim of standard vertical spacing plus narrowing the text column — to unlock a real, verified size increase.

Implemented for screens 37/38 only:
- `.s15-progress` top: 48px → 42px (screen-scoped override, added after the large shared block so it doesn't affect the other ~10 screens sharing that rule).
- `.sadv-layout` top: 128px → 116px, `bottom`: 82px → 76px (stepper-to-layout gap 24px→18px; layout-to-nav-bar clearance 8px→2px — still a real, non-zero gap, just tighter).
- `.sadv-img-area` width 536px→556px, `.sadv-img-placeholder` height 500px→518px, `.applet-embed-wrap`/`iframe` scale 0.6095→0.6315 (new aspect-matched values: 880×0.6315≈556, 820.3×0.6315≈518) — a real ~3.6% size increase, edge-to-edge, no new letterboxing.
- qa-area consequently narrows from 640px→620px (automatic, `flex:1`) — well clear of the 590px minimum found by binary-searching where `#s31-question`/`#s34b-question` would wrap to a 3rd line (verified both screens' heading/question stay at their original line count post-change).

### Verified in Preview

`lomda-preview`, unit 05's own `index.html` loaded **with the trailing slash** (`.../methodica-science-mass-weight-01-05/` — confirmed via `document.querySelectorAll('link[rel=stylesheet]')`/`script[src]` that both resolve under the component's own path, not root), `goTo(37)`/`goTo(38)`. Confirmed via `getComputedStyle`: `.s15-progress` top 42px, `.sadv-layout` top 116px/bottom 76px, `.sadv-img-placeholder` height 518px, `.sadv-img-area` width 556px, `.applet-embed-wrap` transform matrix matches scale 0.6315, nav-bar top 636px vs layout's computed bottom edge 634px (2px clear, no overlap). Confirmed all 4 options on both screens compute to identical `width` (504px stretched on 37, clamped 620px on 38). Confirmed `#s31-question`/`#s34b-heading`/`#s34b-question` all unchanged at their original line-wrap count (`scrollHeight === clientHeight` at the new narrower qa-area width). Clicked an option and the check button on screen 37 to confirm selection styling, disabled→enabled check-button state, and the incorrect-feedback popup all still render correctly positioned over the (now bigger) applet box's lower-left corner, matching the project's fixed-corner-popup convention — media stays visible above it. Opened the full-size modal (`galileoOpenModal()`) and confirmed the new font sizes read clearly there too. No new console errors (the 4 errors present in the console buffer are stale leftovers from this session's own earlier no-trailing-slash reproduction step, from `js/main.js:5190` — the root-level legacy monolith, matching the exact pre-existing artifact already documented above from a prior session).

### Files Changed

`methodica-science-mass-weight-01-05/css/style.css`, `methodica-science-mass-weight-01-05/index.html` (3× expand-button SVG), `methodica-science-mass-weight-01-05/assets/widgets/galileo-applet/index.html`, `WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Session 2026-09-08 (continuation): applet internal scrollbar + real font-size increase via internal spacing compaction

Same day, follow-up to the session above. User sent a new screenshot of screen 37 with two more complaints: a scrollbar had appeared inside the applet ("להוריד את הגלילה ביישומון"), and the internal fonts still looked very small despite the just-applied bumps.

### Root cause of the scrollbar

The font-size bumps from the prior session made the applet's own natural content height grow from 820.3px to 827px, but `.applet-embed-wrap`/its `<iframe>` were still hardcoded to the old 820.3px height. An iframe shows its own native scrollbar when its content overflows its own fixed height, regardless of the *outer* page's `overflow:hidden` on the placeholder around it (that only clips the outer box; the scrollbar is rendered inside the iframe's own document, at a corner still within the outer box's bounds, so it stayed fully visible instead of being cropped away) — exactly the "scroll in the widget" the user was seeing. This is a structural risk of this embed pattern worth remembering: **any font/spacing change inside `galileo-applet/index.html` requires re-measuring `doc.body.getBoundingClientRect().height` live and propagating that number to every `.applet-embed-wrap`/`iframe` height and every screen's aspect-matched scale/box-size constant (screens 36, 37/38, and the modal all share the same natural-size constant).**

### The "still too small" problem — and the real architectural fix

Investigated why the previous session's font bump barely felt bigger on screen: screens 37/38's docked box height was capped at a fixed value (518px, chosen to fit the available layout space), and the applied scale is always `boxHeight / appletNaturalHeight`. Increasing an internal font makes the applet's own page taller, which — with box height fixed — *shrinks the scale factor* to compensate, cancelling out most of the visual gain (verified numerically: 17px→18px should be +5.9%, but the actual on-screen size only grew ~5% net after the scale correction, because natural height also grew). Flagged this to the user: real, felt improvement requires the applet's own internal spacing to shrink at the same time fonts grow, so the natural height doesn't just keep pace with (or outgrow) the font increase. User chose exactly this (option: "לצמצם מרווחים פנימיים כדי לאפשר פונט משמעותי יותר גדול").

**Applied inside `galileo-applet/index.html`:**
- Compacted vertical spacing: `body` padding `1rem 0.75rem`→`0.6rem 0.75rem`; `.hdr` padding `12px 20px`→`9px 20px`; `.claw-row` padding `10px 10px 8px`→`7px 10px 6px` and `.claw-col` gap `6px`→`4px`; `.bank` padding `8px 8px`→`6px 8px` and gap `6px`→`5px`; `.obj-card` `min-height` `102px`→`84px` and padding `6px 10px`→`5px 10px` (checked live first: real card content — icon 50px, or text up to 62px for cards with a details line — never exceeded ~66px, so 102px had ~36px of pure unused headroom per card, ×6 cards); `.btn-release`/`.btn-next` padding/`min-height` trimmed slightly (`11px 22px`/`44px`→`9px 22px`/`42px` and similarly for `.btn-next`).
- With that headroom freed, pushed font-sizes up a second, much larger time (not the previous session's timid +1/+2px): `.obj-name` 18→21px, `.obj-details`/`.mass-pill` 15→17px, `.claw-sublabel` 17→18px, `.floor-txt`/`.ruler-tick span` 15→17px, `.timer-lbl` 16→18px, `.timer-num` 29→32px, `.bank-hdr` 18→20px, `.btn-release`/`.btn-next` 17→19px, `.hdr p` 20→22px.
- Net result, measured live: natural body height actually *dropped* from 827px to 691.58px (the spacing cuts outweighed the font growth) — meaning the scale factor now *increases* instead of shrinking, so the font bump is fully felt on screen rather than being partly cancelled out. Confirmed via live `scrollHeight`/`clientHeight` checks that no card clips and the bank needs no internal scroll (only "דיסקית פלסטלינה" wraps to a 2nd line at the new 21px, growing that one card by <1px via its own `min-height`, not a real regression).

**Propagated the new 880×691.58 natural size everywhere** (previously 880×820.3, briefly 880×827):
- `.applet-embed-wrap`/`iframe`: height 827px→691.58px (eliminates the scrollbar).
- Screen 36 (width-bound, scale unchanged at 0.5966): box height 493px→412.6px (aspect-matched to the new, now-shorter-and-wider natural size); `.guide-text-area` height matched to stay vertically aligned with the image box — confirmed via live `scrollHeight`/`clientHeight` its own text content still fits with no overflow.
- Modal (height-bound, target height unchanged at 686px — still "fill the canvas, thin margin"): scale 0.8296→0.9919, box width 730px→873px — now very close to the applet's true native resolution, confirmed comfortably clear of the close button's side margin.
- Screens 37/38: since the applet's aspect ratio flipped from tall (820.3-ish) to wide (691.58 vs still-880 width), it became genuinely **width-bound** in this two-column layout rather than height-bound — so there was no longer any reason to keep the vertical-margin trims (stepper 48→42px, layout top 128→116px, bottom 82→76px) from the prior same-day session; **reverted all three back to their original, more generous values**, per this project's own "prefer more space, not less" rule, now that the internal compaction did the real work. Re-derived the box from the width side instead: kept the qa-area (question/options column) at the same 600px width used for the prior fix's safety margin (10px clear of the ~590px point where the question wraps a 3rd line), giving the applet box 576×452.76 at scale 0.6545 — vertically centered in its (now taller-than-needed) 500px-tall column via the shared `align-items:center`, same as any other `sadv-layout` screen with a smaller media box.

### Verified in Preview

`lomda-preview`, unit 05's own `index.html` with the trailing slash, `goTo(36)`/`goTo(37)`/`goTo(38)`, `galileoOpenModal()`. Confirmed via `getComputedStyle`: `.s15-progress` top back to 48px, `.sadv-layout` top/bottom back to 128px/82px (no override needed anymore), `.sadv-img-area` width 576px, `.sadv-img-placeholder` height 452.76px, `.applet-embed-wrap` scale 0.6545, `.applet-embed-wrap iframe` height 691.578px === live `body.getBoundingClientRect().height` (691.578px) — exact match, confirming the scrollbar cause is fully resolved (no iframe-content/iframe-box mismatch left anywhere). Confirmed via the bank's own `scrollHeight`/`clientHeight` (623px/623px, equal) that all 6 items plus the "לנסות זוג נוסף" button fit with zero internal scroll needed. Confirmed screen 36's `.guide-text-area` content (`scrollHeight`/`clientHeight`, 413px/413px) still fits at its new shorter height. Confirmed `#s31-question`/`#s34b-question` still wrap at exactly their original line count (`scrollHeight === clientHeight`, unchanged) despite the qa-area math being rebuilt from scratch. Confirmed all 4 options on both screens 37 and 38 still compute to identical widths. Read the modal visually — item text, timers, and header are now clearly legible at near-native resolution. No console errors on a fully fresh reload of any of the three screens.

### Files Changed

`methodica-science-mass-weight-01-05/css/style.css`, `methodica-science-mass-weight-01-05/assets/widgets/galileo-applet/index.html`, `WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Session 2026-09-08 (continuation 2): applet arm/floor labels bigger + expand button matched to 720 Templates Figma "Zoom" component

Same day, second follow-up. User asked to also enlarge "זרוע ימין"/"זרוע שמאל"/"רצפה" (arm/floor labels) inside the applet, and pointed at a specific Figma reference for the expand ("magnifying glass") icon: `https://www.figma.com/design/eSbp4bKHgBky0rakDb8l9N/720---UI-Templates?node-id=1589-17043` (720 Templates file, node "Zoom", State=Default/Hover).

### Arm/floor labels

`galileo-applet/index.html`: `.claw-sublabel` (זרוע ימין/שמאל) 18→22px, `.floor-txt` (רצפה) 17→20px. Checked live first (both have wide, mostly-empty parent containers — claw-sublabel's parent is ~245px vs a ~70-91px text need; floor-txt's parent is ~627px vs a 56px text need), then confirmed after the change via `scrollWidth`/`scrollHeight` vs `clientWidth`/`clientHeight` that neither wraps or clips. Unlike every previous font change in this applet, this one did **not** change the widget's own natural body height at all (still exactly 691.578125px) — the claw-row's height is governed by the fixed 72px claw-wrap graphic, not these labels, and the row was already shorter than the bank column that actually drives the page's overall height — so none of the screen 36/37/38/modal box-size or scale constants needed to change this time.

### Expand button → matched to Figma "Zoom" component

Pulled `get_screenshot` + `get_design_context` on the referenced node (720 Templates file, "Zoom" frame, node `1589:17042` State=Default / `1589:17044` State=Hover): a 44×44 circle, white background, 2px `--subject-500` (`#019de5`) border, blue magnifying-glass icon by default; solid `--subject-500` fill with a white icon on hover. This is the exact same component already used project-wide as `.img-zoom-btn` (confirmed via its existing CSS) — so `.applet-expand-btn`'s previous bespoke treatment (48×48 dark rounded-square, opaque black background, white icon) was actually the outlier, not a deliberate one-off; it dated from an earlier session's "make the icon more noticeable at small scale" fix, before this Figma reference was available.

Replaced `.applet-expand-btn`'s CSS to match exactly (44×44, white bg, `2px solid var(--subject-500)` border, `color: var(--subject-500)`, hover inverts to filled `--subject-500` bg + white icon) and updated all 3 SVG instances in `index.html` (screens 21/37/38) to use `stroke="currentColor"` instead of a hardcoded white stroke, so the CSS `color` swap on hover drives the icon color automatically — same technique `.img-zoom-btn`'s own SVG already uses. Kept the button's position (bottom-right, over the dark timer strip's empty corner) since that placement reasoning is unrelated to its visual style.

### Verified in Preview

`lomda-preview`, unit 05's own `index.html` with the trailing slash, `goTo(36)`/`goTo(37)`, `galileoOpenModal()`. Confirmed via `getComputedStyle` the button now renders exactly per spec (white bg, `rgb(1,157,229)` 2px border, matching icon color, 44×44, 50% radius). Confirmed via the iframe's own document that `.claw-sublabel`/`.floor-txt` neither wrap nor clip and that `body.getBoundingClientRect().height` is unchanged. Visually confirmed the button reads clearly (white circle) against the dark timer-strip background on both docked screens, and that the modal (which has no expand button of its own) still renders correctly with the enlarged labels. No console errors.

### Files Changed

`methodica-science-mass-weight-01-05/css/style.css`, `methodica-science-mass-weight-01-05/index.html` (3× expand-button SVG), `methodica-science-mass-weight-01-05/assets/widgets/galileo-applet/index.html`, `WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Session 2026-09-08 (continuation 3): expand button moved to top-right

Same day, immediate follow-up. User looked at the just-matched Figma "Zoom" button and asked to move it to the top-right corner ("בימין למעלה"), matching where `.img-zoom-btn` sits everywhere else in the unit — the previous same-day fix had kept it bottom-right (a leftover position choice from before the Figma reference, when the button was still the bespoke dark-square treatment).

`methodica-science-mass-weight-01-05/css/style.css`: `.applet-expand-btn` position `bottom:10px`→`top:10px` (kept `right:10px`), comment rewritten to match. Note for later: at the docked scale, the 44px button is taller than the applet's own header bar (~30px rendered at this scale), so it now straddles the header/content boundary rather than sitting fully inside either zone — computed geometrically (iframe scale × native header height) rather than guessed, since the Browser pane's screenshot resolution wasn't sharp enough at this element's size to eyeball it reliably. The button's own opaque white fill + box-shadow keep it reading as a clean floating circle regardless, but flagged here in case it should be nudged down slightly once the user sees it live.

### Verified in Preview

`lomda-preview`, unit 05, `goTo(37)`. No console errors. Position confirmed via `getBoundingClientRect` math (iframe scale applied to the header's native height) rather than a visual screenshot, since the pane's rendered resolution at this small element size wasn't reliable for a by-eye check.

### Files Changed

`methodica-science-mass-weight-01-05/css/style.css`, `WORK_PROGRESS.md`.

### Preview Tested

Partially — position verified numerically; visual confirmation still pending user feedback (see note above).

---

## Session 2026-09-08 (continuation 4): screen 36 (Applet Guide) — text raised up + applet box enlarged

Same day, next screenshot from the user showed screen 36 (the Galileo applet guide/intro screen, before screens 37/38) with a lot of dead white space above the guide text, and asked to raise the text up a bit and enlarge the applet a bit on this screen specifically.

### Text raised

`.guide-text-area` (screen 36 only) had two compounding sources of empty space above the heading: it was already `align-self: center` inside its row (a deliberate, still-correct choice — keeps it vertically paired with the applet box), *and* its own children were `justify-content: center`, centering the actual ~328px of text content inside a much taller 412.6px box — about 80px of pure internal empty space on top of the row-centering gap. Changed `justify-content` from `center` to `flex-start`: the text now starts right at its own box's top edge, which lines up with the applet box's top edge (both boxes are still centered as a matched pair within the row).

### Applet enlarged

Checked live first whether the text column had room to give up width: cloned each paragraph/heading with `width: max-content` to find the natural width of each manually-`<br>`-broken half-line (this screen's guide text uses hardcoded `<br>`s, not automatic wrapping) — the widest was `sAdvGuide-p1` at ~380px, against a then-651px-wide `.guide-text-area`. Confirmed ~270px of slack. Grew `[data-screen="36"] .sadv-img-area` from 525×412.6 to 585×460 (aspect-matched to the applet's current 880×691.58 natural size — scale 585/880=0.6648, updated the shared default `.applet-embed-wrap` scale from 0.5966 accordingly, since screen 36 is the only screen using that default rather than a screen-scoped override), leaving the text column at 591px — still far above its ~380px real need. `.guide-text-area` height matched to 460px to stay paired with the image box.

### Verified in Preview

`lomda-preview`, unit 05, `goTo(36)`. Confirmed via `getComputedStyle`: image box 585×460, text-area height 460/justify-content flex-start, `.applet-embed-wrap` scale 0.6648, iframe height still exactly matches the live `body.getBoundingClientRect()` (691.578px, no scrollbar risk introduced). Confirmed via `scrollHeight`/`clientHeight` that the heading and all 4 paragraphs render at their original line counts (no new wraps from the unchanged-in-practice column width). Visually confirmed: heading now sits at the same height as the applet box's top edge, applet box is visibly bigger. No console errors.

### Files Changed

`methodica-science-mass-weight-01-05/css/style.css`, `WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Screen 44 (Peak-question intro transition) — character legs clipped by nav bar (2026-09-08)

User reported screen 44 didn't match the script/PPT and asked for the character gif to be raised so its legs are visible. Compared the live `lomda-preview` render (unit 06, loaded directly since the shell routes screens 44-49 to that component) against the PPT reference: title/subtitle/reminder-bubble text and the medal.mp4 character already matched correctly — this had already been fixed in an earlier session (commit `5309f54` + the `WORK_PROGRESS.md` entry around line 269 about the stale end-screen CSS block). The screenshot the user attached showing plain unstyled text and a different, medal-less character was from before that earlier fix (likely a stale cached tab on their end), not the current code.

However, live `getBoundingClientRect()` checks found a real, still-present bug: `[data-screen="44"] .s12-char-gif` rendered the (square, 1080×1080) `medal.mp4` at 260×260, and the character column's computed bottom edge (680.79px, native canvas coords) extended ~40px past the opaque `.nav-bar`'s top edge (641px, `background:#fff`, `z-index:10`) — meaning the bottom slice of the video (where the character's legs/feet sit) was rendered behind and hidden by the nav bar. This is exactly the "raise the gif so we see the legs" symptom.

Fixed in [methodica-science-mass-weight-01-06/css/style.css](methodica-science-mass-weight-01-06/css/style.css): shrank `[data-screen="44"] .s12-char-gif` from 260px to 230px and added `margin-top: -30px` so the video overlaps up under the bubble's tail (matching the PPT reference, where the tail nearly touches the character's head) instead of shifting the whole `.s12-char-area` block (which would have pushed the bubble up into the subtitle text — tried first, reverted). Left `.s12-char-area`'s `margin-top: 8px` and the bubble untouched.

### Verified in Preview

`lomda-preview`, loaded `methodica-science-mass-weight-01-06/` directly (screen 44 is that component's initial screen). Confirmed via `getBoundingClientRect()`: video bottom now 620.79px vs nav-bar top 641px — 20px clearance, full character (including legs) now clears the nav bar. Confirmed bubble/subtitle gap unchanged (8px, no new overlap). Screenshot matches the PPT reference closely: title, subtitle, reminder bubble, and full medal-holding character all visible with no clipping.

### Files Changed

`methodica-science-mass-weight-01-06/css/style.css`, `WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Screen 44 — correction: the bubble+medal design above was wrong (2026-09-08)

**The entry immediately above this one was based on a wrong assumption and is superseded.** The user came back with the actual production-script file (`מדעים_יעד 4_מסה ומשקל_תסריט להפקה_120726.pptx`, in Downloads — newer than the `תסריט לתיקוף_270626` named in `PROJECT_BRIEF.md`) and pointed at its slide 130 as the real reference, saying the site still didn't match it.

Extracted slide130.xml directly (unzipped the pptx) and found:
- **No speech-bubble shape exists on this slide at all.** All six lines of copy — "כל הכבוד! הסתיים שלב התרגול." → "אם לא הצלחת לענות נכון על חלק מהשאלות, חשוב להבין מה עדיין לא ברור ולפנות לצ'אט או למורה להסבר נוסף." → "עכשיו מגיעה שאלת השיא" (40pt bold) → "יש בה 3 סעיפים. עליכם להצליח בכולם." — live in one plain, centered, no-fill text box (`TextBox 10`). The reminder sentence comes *before* the big title, not after the subtitle.
- **The character has no medal.** The slide's embedded picture (`image61.png`, cropped via the shape's `srcRect` to the character only) is a plain standing orange creature with no ribbon/medal — a completely different asset from `medal.mp4`. The medal pose belongs to the real end-of-unit success screen (49), not this intro screen — makes sense pedagogically, since you haven't earned anything yet at this point.

So the previous fix (shrinking/repositioning `medal.mp4` under a speech bubble) was solving the wrong problem: it fixed the nav-bar clipping symptom correctly, but on a screen design that shouldn't have existed. Reverted that design and rebuilt this screen to match slide 130:

- [methodica-science-mass-weight-01-06/index.html](methodica-science-mass-weight-01-06/index.html): removed the `.s12-bubble-wrap` markup entirely; added a plain `<p id="s37-reminder">` between the suptitle and the bigtitle (matching the pptx's paragraph order); changed `#s37-char` from `<video autoplay loop muted>` to a plain `<img>` (the new asset is a static image, not a loop).
- [methodica-science-mass-weight-01-06/js/main.js](methodica-science-mass-weight-01-06/js/main.js): `GEN_DATA[39]` — renamed `bubble` → `reminder` (also corrected its wording to match the pptx exactly: "לענות נכון" not "לענות", "עד כה" removed), changed `char` from `assets/video/medal.mp4` to `assets/img/char-orange-reminder.png`. `enterScreen38()` — swapped the `s37-bubble`/`s37-bubble-text` DOM refs for `s37-reminder`, dropped the `.play()` call (no longer a video).
- [methodica-science-mass-weight-01-06/css/style.css](methodica-science-mass-weight-01-06/css/style.css): replaced the whole screen-44 bubble block with a plain `.s12-reminder` text rule (same 24px style as suptitle/subtitle) and simplified `.s12-char-area`/`.s12-char-gif` back to a plain centered image, no overlap hacks needed now that there's no bubble to clip against.
- **New asset added**: `methodica-science-mass-weight-01-06/assets/img/char-orange-reminder.png` — cropped from the pptx's own embedded `image61.png` using the exact `srcRect` crop box the slide itself applies (214,59 → 545,385 px of the raw 761×425 embed), so it's pixel-faithful to what the script shows, not a guess.

**Left `medal.mp4` in place, untouched** — did not delete it per the asset rule (never delete automatically, show the list first). It's now unused by screen 44; `WORK_PROGRESS.md` line ~715 already notes screen 49 (End-Success) still has a *broken* `char-orange-medal.gif` reference and could legitimately use `medal.mp4` instead — that's a real candidate follow-up but wasn't requested here, so not touched.

### Verified in Preview

`lomda-preview`, loaded `methodica-science-mass-weight-01-06/` directly. Screenshot matches slide 130's structure: plain flowing text (caption → reminder → big title → subtitle), no bubble box, plain no-medal character. No console errors. `getBoundingClientRect()`: character bottom 597.66px vs nav-bar top 641px — 43px clearance (legs fully visible, more breathing room than strictly needed). Clicked "אפשר להתחיל!" — advances correctly to Peak Q1 (סעיף א), confirming `goTo(SCREEN_PEAK_Q1)` still fires with the simplified markup.

### Files Changed

`methodica-science-mass-weight-01-06/index.html`, `methodica-science-mass-weight-01-06/js/main.js`, `methodica-science-mass-weight-01-06/css/style.css`, `methodica-science-mass-weight-01-06/assets/img/char-orange-reminder.png` (new), `WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Screen 18 (Practice Q3, rice-on-the-moon) — correct feedback: orphaned "בדיוק." line (2026-09-08)

User pointed at the correct-answer feedback card on screen 18 and asked to move the word "בדיוק" up a line — it was wrapping alone onto its own third line, split off from "אבל באותה מידה".

First confirmed which component actually owns this screen: `SCREEN_PRACTICE_Q3 = 18` and the matching `GEN_DATA`/feedback body text exist verbatim in **all six** components' `js/main.js` (01–06), but only `methodica-science-mass-weight-01-02/index.html` actually contains a `data-screen="18"` element — components 01/03/04/05/06 carry the constant/string as dead leftover scaffolding (01's own `TOTAL_SCREENS` is only 15, so `goTo(18)` there is a no-op). So the fix belongs to component 02 only.

Measured the actual overflow live (canvas `measureText` against the rendered `Assistant 400 20px` font, 377px available text width inside the canonical fixed 426px/24px-padding `.feedback` card): the line "המשקולת נעשים קלים יותר, אבל באותה מידה בדיוק." needs ~384.7px — only ~7.7px over budget. Since the card's 426px width and 24px padding are the mandated canonical Figma values (not to be widened) and the shared `.feedback-body` font-size (20px) is used by every screen's feedback card (not to be changed globally), used the smallest lever that closes exactly this gap without touching either: a scoped `letter-spacing: -0.3px` on `#s18-feedback .feedback-body` only (this element's id, not the shared `.feedback-body` class) — confirmed via the same canvas measurement that -0.3px brings the line to ~369.9px, comfortably under 377px.

Added in [methodica-science-mass-weight-01-02/css/style.css](methodica-science-mass-weight-01-02/css/style.css) right after the existing `#s18-feedback-first`/`#s19q-fb-first` narrow-card override.

### Verified in Preview

`lomda-preview`, unit 02, `goTo(18)`, selected the correct answer ("המאזניים יישארו מאוזנים") and submitted. Screenshot confirms the first paragraph now reads on 3 lines ending "...אבל באותה מידה בדיוק." — "בדיוק" no longer orphaned. No other text in the card reflowed or overflowed; second paragraph unaffected.

### Files Changed

`methodica-science-mass-weight-01-02/css/style.css`, `WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Screen 19 (Practice Q4, matching dropdowns) — orphaned "מדעית." line in feedback card (2026-09-08)

User pointed at the wrong-answer feedback card on screen 19 and asked to move the word "מדעית" up a line, then shrink the height that frees up — same symptom class as screen 18's "בדיוק" fix above.

Reproduced live (`goTo(19)`, filled all 7 dropdowns wrong, `dq19Check()` twice to reach the final feedback state — `DQ19_FB_WRONG_BODY`/`DQ19_FB_CORRECT_BODY` are the same string, so both feedback states share this exact text). At the canonical 20px/377px `.feedback-body` width, the second bullet ("ניוטון", "מסה", "כוח כבידה": ...) wrapped to 3 lines with its last word, "מדעית.", orphaned alone on the 3rd line (`li.scrollHeight` 96px = 3×32px). Measured via a cloned test node (same markup/width) that `letter-spacing: -0.2px` collapses it to 2 lines (64px) without clipping or otherwise changing where any other line breaks.

Since `.feedback` has no fixed/min height (only `max-height:420px` + `overflow-y:auto`), the card is a plain auto-height flow container — confirmed no JS sets an inline height on `#s19q-fb` anywhere. So the "shrink the freed height" half of the request needs no separate work: the card's live height dropped from 331px to 299px automatically the moment the extra line was removed.

Added in [methodica-science-mass-weight-01-02/css/style.css](methodica-science-mass-weight-01-02/css/style.css) right after the existing `#s18-feedback .feedback-body` rule: `#s19q-fb .feedback-body { letter-spacing: -0.2px; }`. Scoped to `#s19q-fb` (not the shared `.feedback-body` class) so no other screen is affected; applies to both the correct- and incorrect-answer renders since they share the same element and text.

### Verified in Preview

`lomda-preview`, unit 02, `goTo(19)`, filled all 7 dropdowns incorrectly and called `dq19Check()` twice to reach the final (non-dismissible) feedback card. Screenshot confirms the second bullet now reads on 2 lines ending "...ולכן הן מילים בשפה מדעית." — "מדעית" no longer orphaned, card visibly shorter with no leftover gap. First and third bullets unaffected (no reflow).

### Files Changed

`methodica-science-mass-weight-01-02/css/style.css`, `WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Screen 20 (Observation vs. Scientific Explanation) — feedback body reformatted into two clean paragraphs (2026-09-08)

User gave an explicit target wording/layout for the wrong-answer feedback card: title on its own, then the תצפית definition and the הסבר מדעי definition as two separate readable sentences, no mid-sentence line breaks.

The existing `DQ20_FB_CORRECT`/`DQ20_FB_WRONG` body strings (identical content, `js/main.js`) already carried this exact text but forced into 5 fragments via hardcoded `<br>` tags splitting mid-sentence (e.g. "לראות בפועל," then `<br>` then "ללא פרשנות..."), rendering as 5 rigid lines instead of natural wrapping — directly against this project's own "avoid line breaks; let text wrap naturally" rule.

Replaced both with a single shared `DQ20_FB_BODY` constant: two `<p>` elements (each holding one full definition sentence, `<strong>` around the defined term, 12px margin between them), letting the browser wrap each sentence naturally instead of dictating line breaks. `DQ20_FB_CORRECT.body`/`DQ20_FB_WRONG.body` both now just reference this shared constant (content is identical between them, as it already was).

The `.s20-fb-panel`/`#s20q-fb-body` are auto-height (`s20-fb-panel` uses `max-height:80%`/`overflow-y:auto`, no fixed height), so the shorter natural wrap (2+2 lines vs. the old forced 5 lines) shrank the panel automatically — 238px→218px in the wrong-answer state — with no separate height fix needed.

### Verified in Preview

`lomda-preview`, unit 02, `goTo(20)`. Tested both outcomes: all-wrong (`dq20Pick` all 4 rows to incorrect values, `dq20Check()`) and all-correct. Both render the same clean two-paragraph body (`תצפית` sentence, then `הסבר מדעי` sentence). Confirmed via `scrollHeight === clientHeight` (140px/140px) that neither paragraph clips or overflows its 412px content width. Screenshots confirm correct RTL layout, term bolding preserved, no orphaned words.

### Files Changed

`methodica-science-mass-weight-01-02/js/main.js`, `WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Screen 20 feedback — follow-up: orphaned "הסבר." in the first paragraph (2026-09-08)

Same day, immediate follow-up to the reformat above. User sent a screenshot showing the new first paragraph ("תצפית היא מה שניתן לראות בפועל, ללא פרשנות או הסבר.") wrapping to 2 lines with "הסבר." left alone on the 2nd line, and asked to raise it up so it isn't orphaned.

Measured live (cloned test node, same 412px content width/20px Assistant font): natural width of the full sentence is 426.8px, ~15px over the 412px budget — default renders 2 lines (64px). Same lever as the screens 18/19 fixes: negative `letter-spacing` on just this text. Tested increasing amounts; `-0.3px` brings the sentence to 411.5px (fits, but only ~0.5px of margin — too tight to trust across font-rendering variance), `-0.35px` brings it to 409px (~3px of comfortable margin), collapsing it to a single line entirely (not just rebalancing the 2 lines) since the whole sentence is short enough to fit in one line once tightened.

Added directly as an inline style on that specific `<p>` in `DQ20_FB_BODY` (`js/main.js`): `letter-spacing:-0.35px` alongside its existing `margin:0 0 12px 0`. Scoped to only the first paragraph — the second paragraph already wraps evenly across its 2 lines with no orphan and didn't need touching.

### Verified in Preview

`lomda-preview`, unit 02, `goTo(20)`. Tested both outcomes again. First paragraph now renders as a single line (`p.scrollHeight === p.clientHeight === 32px`, was 64px/2 lines) in both the wrong-answer and correct-answer cards. No clipping. Panel auto-shrank further (218px→186px in the wrong-answer state) with the freed line, no separate height fix needed.

### Files Changed

`methodica-science-mass-weight-01-02/js/main.js`, `WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Screen 38 (Unit 05, Galileo Advanced Q1 section ב) — last option: orphaned "שונים," line (2026-09-08)

User pointed at screen 38's last answer option (the correct one, with a manual `\n` break: "...ולכן התקבלו זמני נפילה שונים,\nלמרות שהמסה היתה זהה.") and asked to make it read as 2 lines, raising back up the piece that fell to its own line after the comma.

Reproduced live (`goTo(38)`, first attempt wrong, second attempt correct, matching the screenshot's revealed red/green state). First attempt at diagnosis navigated to the unit through a bare `http://.../methodica-science-mass-weight-01-05/index.html#screen-38` URL, whose reported tab context showed no path — that silently loaded the **root-level** `index.html`/`css/style.css` (a different, unrelated monolith) instead of the unit's own files, giving a false "already fine" reading. Re-navigated to the directory URL (`.../methodica-science-mass-weight-01-05/`) and confirmed via `document.querySelectorAll('link[rel=stylesheet]')`/`script[src]` that both resolved under the component's own path before trusting any measurement — same gotcha already flagged in the screen 37/38 session above.

With the correct file confirmed: `#s34b-options .s11-option-text`'s available width is 551.25px (grid column clamped by today's earlier 600px qa-area fix, not by this text's own max-content). The manual line 1 ("התנגדות האוויר הייתה שונה בין הגופים, ולכן התקבלו זמני נפילה שונים,") renders at ~559px unconstrained, so `שונים,` alone wrapped to an orphaned 3rd line, pushing `למרות שהמסה היתה זהה.` to a 4th. Same fix family as screens 18/19/20 above: negative `letter-spacing`, scoped to just this one option's text (`.s11-option:nth-child(4) .s11-option-text`) so the shared 4-option grid width and the other three options are untouched. Canvas `measureText` estimated `-0.2px` would be enough, but that undershot in the real layout (still 3 lines) — binary-searched live in the browser instead (this project's own established method): `-0.85px` is the exact tipping point to 2 lines; used `-1px` for a ~13px safety margin (538px vs 551px available).

Added in [methodica-science-mass-weight-01-05/css/style.css](methodica-science-mass-weight-01-05/css/style.css), right after the existing `[data-screen="38"] .s11-option-text` rule.

### Verified in Preview

`lomda-preview`, unit 05's own directory URL (not root), `goTo(38)`, selected option 1 (wrong) → checked → selected option 3 (correct) → checked, matching the screenshot's revealed state. Measured `Range.getClientRects()` on the option's text: exactly 2 line-rects (538px + 205px), ending "...זמני נפילה שונים," / "למרות שהמסה היתה זהה." Screenshot confirms visually. The other three options (1 line, 2 lines, 2 lines) are unchanged.

### Files Changed

`methodica-science-mass-weight-01-05/css/style.css`, `WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Screen 14 (Warmup Q2 — astronaut Earth→Moon mass) — removed the hint feature (2026-09-14)

User asked to remove the hint ("להוריד את הרמז") on "screen 15". Resolving which screen they meant took some digging, since this project has at least three different screen-numbering schemes floating around (the current, navigable `data-screen` attribute; legacy `<section id>`/internal element-id prefixes from a pre-renumbering pass; and stale HTML comment labels) — none of which agree with each other. `data-screen="15"` (module 02's "6 שאלות" practice intro) has no hint at all; a hint internally id'd `s15-hint-btn` turned out to live on `data-screen="17"` instead. Asked the user to confirm via `AskUserQuestion` rather than guess; they replied with a screenshot instead, which pinned it down precisely: the astronaut Earth→Moon mass question (Warmup Q2, `data-screen="14"` in `methodica-science-mass-weight-01-01`, internal id prefix `s13`, JS function prefix `scq15` — a *third*, different legacy number).

Removed the whole hint feature from that screen rather than just hiding it, since nothing suggested this was meant to be conditional:
- [methodica-science-mass-weight-01-01/index.html](methodica-science-mass-weight-01-01/index.html): removed the `#s13-hint-btn` nav button and the `#s13-hint-overlay` popup markup (title icon, hint body text, "חזרה לשאלה" back button).
- [methodica-science-mass-weight-01-01/js/main.js](methodica-science-mass-weight-01-01/js/main.js): removed the now-dangling `s13-hint-overlay`/`s13-hint-btn` `getElementById` calls in `enterScreen14()` and both branches of `scq15Check()` (correct and final-incorrect), and deleted `scq15OpenHint()`/`scq15CloseHint()` entirely (nothing calls them anymore).
- [methodica-science-mass-weight-01-01/css/style.css](methodica-science-mass-weight-01-01/css/style.css): removed the now-dead `[data-screen="14"] .s13-hint-*` rule block (overlay/blur/card/head/body/back-btn).

### Verified in Preview

`lomda-preview`, unit 01's own directory URL, `goTo(14)`. Confirmed visually: no hint button in the nav bar. Selected the wrong option, clicked "צדקתי?" — first-incorrect feedback ("שננסה שוב?") renders correctly, no console errors. Selected the correct option, checked again — correct feedback + "המשך" button appear correctly, no console errors. Also called `scq15Select(2)` + `scq15Check()` then `goTo(13)` → `goTo(14)` to re-exercise the `scq15Done` (already-completed, revisited) branch of `enterScreen14()` — restores correctly (`check-btn` hidden, `continue-btn` shown), no errors from the removed `s13-hint-btn` reference there either.

### Files Changed

`methodica-science-mass-weight-01-01/index.html`, `methodica-science-mass-weight-01-01/js/main.js`, `methodica-science-mass-weight-01-01/css/style.css`, `WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Screen 47 (Component 06, Peak Q section ג — digital scales hint) — bad line-wrap breaks (2026-09-14)

User sent a screenshot of the hint popup on `data-screen="47"` in `methodica-science-mass-weight-01-06` (internal id prefix `s40`, `GEN_DATA[42]`, section title "רכיב 6 סעיף ג׳" / "שאלת שיא סעיף ג׳") showing the auto-wrap breaking mid-clause — line 2 mixed the tail of the first sentence with the start of the second ("משקל (כוח), מה מאפשר להם להציג"), and the closing sentence left a single orphaned word ("לעבוד?") alone on its own line. They typed out the three sentence-boundary break points they wanted instead.

Locating the right file took two rounds of clarification: the same hint text (and the internal `GEN_DATA[42]`/`data-screen="42"` object it lives in) exists as leftover dead code in all 6 component folders plus the root `js/main.js` — per [unit-manifest.js](unit-manifest.js) comments, this exact question (39/42) was later cut from the live unit's screen list entirely in component 05, so none of the 6 `COMPONENTS[]` entries currently claim global screen 42. The user's "רכיב 6 סעיף ג׳" turned out to be script-chapter terminology (matches the section label "סעיף ג׳" already in the code), not itself sufficient to pick a folder — resolved by asking which file they had open, which pinned it to `data-screen="47"` in component 06 specifically (owned by component 06 per the manifest, `id="s43"` wrapping the reused `s40-*` internal ids).

Added the missing sentence-boundary `\n` (matching the user's 3 break points — after "...(כוח)," was the only one missing; one already existed before "מה מיוחד..."). That alone made total line count worse (5→6), since the middle clause ("מה מאפשר להם להציג את המשקל באותו יחס כמו המסה?") measured 502px against this hint card's fixed 414px text column (`.s11-hint-card` width 542px, a shared template used by ~13 hint screens in this component — not touched, per this unit's precedent of not widening shared per-screen-family CSS without Figma authority). The other two segments were close (430px and 426px vs 414px available) — used this project's established fix for exactly this situation (see screens 18/19/20/38 in WORK_PROGRESS): live-measured negative `letter-spacing` scoped to just those two `<span>`s inside the hint body string itself (`-0.45px` on the first sentence, `-0.35px` on the third), leaving the untouched middle sentence to wrap on its own into 2 even lines (no orphan, it's a natural multi-word split). Net result: 5 lines → 4 lines, each break now falling on a real clause/sentence boundary, no single-word orphan.

### Verified in Preview

`lomda-preview`, component 06's own directory URL (`methodica-science-mass-weight-01-06/`, trailing slash — confirmed via `document.querySelectorAll('link[rel=stylesheet]')`/`script[src]` that the component's own files loaded, not the root monolith), `goTo(47)` then `scqGenOpenHint(42)`. Screenshot confirms 4 clean lines, no orphaned single word, RTL intact. `body.scrollWidth === body.clientWidth` (414/414, no overflow). Closed via `scqGenCloseHint(42)` — overlay hides correctly. No console errors at any point.

### Files Changed

`methodica-science-mass-weight-01-06/js/main.js`, `WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Unit-wide hint popup fix — wider cards, breaks only at sentence ends (2026-09-17)

User request: across the whole unit, hint ("רמז") popups should wrap so line
breaks land at sentence boundaries (not mid-sentence), and popups should be
wider / shorter overall while still looking normal-sized. Root cause of the
old behavior: `.s11-hint-card` (and its `.s17q-`/`.s18q-`/`.s23-` siblings)
was a fixed 542px (560px for `.s23-`), and hint bodies used
`text-wrap: balance`, which picks its own break points and ignores sentence
boundaries — the two combined were producing 3-4 line hints with a sentence
split mid-clause across lines, sometimes leaving a lone orphan word.

Used the browser preview (`lomda-preview`) to measure every live hint's
actual sentence pixel-widths at 24px/22px Assistant before choosing a fix,
rather than guessing — this surfaced that the hint body text sits *inside*
`.s11-hint-card-title` beside the bulb icon (a row layout, not a separate
title+body stack), so available text width is `cardWidth - 80 (padding) -
~48 (icon+gap)`, not `cardWidth - 80`.

**Fix applied everywhere a hint is actually live:**
- `.s11-hint-card` / `.s17q-hint-card` / `.s18q-hint-card` / `.s23-hint-card`
  base width raised from 542/560px → **720px** (only in the folders that
  actually render the affected screens — dead copies of this shared rule in
  other folders' `style.css` were left untouched, matching this project's
  existing precedent of not propagating screen-specific fixes to folders
  that can't render that screen).
- Removed `text-wrap: balance` from hint bodies project-wide (it fights
  manual sentence breaks) **except** on two screens whose hint is a single
  unbroken sentence with no sentence boundary to break on at all — there
  `balance` is the correct tool to avoid a short orphan tail (folder 03
  screens 26/27).
- Added `align-self: stretch` to hint-body rules for consistency (this
  screen family's actual bottleneck was the icon+gap offset, not the
  shrink-wrap gotcha `_global-components.md` warns about, but stretch is
  harmless and correct either way).
- Inserted a manual `\n`/`<br>` at the **true sentence boundary** (after
  `.`/`?`) for every hint with 2+ sentences that didn't already have one:
  folder 02 screen 18, folder 03 screen 29 (28→29 mislabel — see below),
  folder 06 screens 45 and 46. Hints that were already a single sentence
  were left to wrap naturally (no boundary to insert).
- Folder 06 screen 47: removed the old hack (two `<span
  style="letter-spacing:...">` wraps forcing a break mid-sentence at a
  comma) and replaced it with one `\n` at the real sentence boundary — the
  internal comma now just wraps naturally.
- Folder 05 screen 41: removed the two mid-sentence `\n`s that were forced
  at commas inside its one long question sentence, keeping only the
  sentence-boundary break before it. That sentence alone measures ~1185px
  and cannot fit on one line at any reasonable width; gave this screen a
  wider, screen-scoped card (`860px`, up from its previous 660px override)
  so it wraps into two evenly-sized lines instead of three with a short
  orphan tail — `text-wrap: balance` was tried first here and made no
  difference (confirms the prior WORK_PROGRESS note that balance fights
  this screen's manual break), so extra width was used instead.

**Sub-agent inventory correction:** a background inventory agent initially
reported folder 03's live hints as screens 24/25/26/28. Live-DOM
verification in the browser (`document.querySelectorAll('section.screen')`
cross-referenced against each `[id$="-hint-overlay"]`'s actual parent
section) showed the agent had been fooled by the same legacy
internal-id-≠-data-screen pitfall `_common-pitfalls.md` warns about: the
real live hints are on data-screen **25, 26, 27, 29** — screens 24 and 28
have no hint at all. An initial edit that added dead
`[data-screen="24"]`/`[data-screen="28"]` selectors was reverted once this
was caught. Re-verified folder 05 and 06's screen↔hint mapping the same way
before editing those folders, this time matching the agent's report.

### Verified in Preview

`lomda-preview`, each folder's own directory URL. For every live hint (02:
16,17,18,19,23 · 03: 25,26,27,29 · 05: 41,43 · 06: 45,46,47) — opened via
its real `goTo(screen)` + open-hint function, measured each rendered line's
pixel width with `Range.getClientRects()` (scaled back through `#app`'s
transform matrix) to confirm every break falls at a sentence boundary (or,
for single-sentence hints, that no short orphan word is left alone on the
last line), then screenshotted a sample from each folder (02 screens 16 &
18, 03 screens 26 & 27, 05 screens 41 & 43, 06 screens 45 & 47) to confirm
the wider cards still look proportionate and don't overflow the canvas. No
console errors. Folder 01 and 04 have no live "רמז" hints (04's screen 32
popup is an explicitly-non-hint content-recap reminder) — left untouched.

### Files Changed

`methodica-science-mass-weight-01-02/css/style.css`,
`methodica-science-mass-weight-01-02/index.html`,
`methodica-science-mass-weight-01-03/css/style.css`,
`methodica-science-mass-weight-01-03/index.html`,
`methodica-science-mass-weight-01-05/css/style.css`,
`methodica-science-mass-weight-01-05/js/main.js`,
`methodica-science-mass-weight-01-06/css/style.css`,
`methodica-science-mass-weight-01-06/js/main.js`,
`WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Component 06 — added correct/incorrect indicator to the Peak Question nav (2026-09-17)

User flagged: component 06's top nav bar has no נכון/לא נכון (correct/
incorrect) indicator, and pointed at `methodica-math-percent-04-03` (the
"4.3 מתמטיקה" unit) as the reference for what it should look like — with
science's blue instead of math's purple.

**Investigation:** no folder in this unit (01–06) had ever implemented the
skill's canonical "Progress Question" component (`_global-components.md`).
The math reference's `.vq-nav` (dots: off/active/done✓/wrong✕, purple
`#E0BFF5`/`#CE82FF`) is exactly that component. Confirmed with the user this
should apply only to the Peak Question's 3 lettered sub-part screens
(data-screen 45/46/47 = internal s39/s40/s41 = sub-parts א/ב/ג of the single
peak question — `routeAfterPeak()` in main.js already tracks all three),
not the intro (44) or outcome (48/49) screens, matching the math reference's
own scope pattern.

**Correction to the initial color plan:** rather than deriving the correct/
incorrect colors from the Science subject-blue ramp (the approach agreed on
before digging into the actual markup), found that component 06 already has
a `.s15-progress`/`.s15-prog-dot` nav bar on these exact screens — it just
only tracks position (`is-current`/`is-done`, both rendered in the existing
science blue `#019de5`), never correctness. Per
`720-design-guidelines/colors-and-gradients.md`, correct/incorrect feedback
colors are theme-independent — and this project's own screens 45/46/47
already use a real green/red pair for their SCQ options
(`.s11-option.is-correct` → `#609e12`, `.is-incorrect` → `#b20010`). Reused
that exact pair for the dots instead of a subject-ramp color, so the nav now
matches every other correct/incorrect surface already on these same screens.

**Implementation:**
- `js/main.js`: added `syncPeakProgressNav(sectionEl)` — one shared
  renderer (per skill's "one renderer, not one per screen" rule) that reads
  `genScqState[40]/[42].correct` and `saqState[41].correct` (the SCQ/SAQ
  engines' own existing state — no duplicate state introduced) and sets
  `is-correct`/`is-incorrect` + the shared `BASIC_SVG_CHECK`/
  `BASIC_SVG_CROSS` icon on each already-resolved `.s15-prog-dot`, skipping
  the current item (which stays the plain current-ring, matching the math
  reference's behavior of never showing a verdict on the screen still being
  answered). Wired into `enterScreen39/40/41` so it re-syncs on every entry,
  including backward navigation.
- `css/style.css`: new `[data-screen="45"/"46"/"47"] .s15-prog-dot.is-correct`
  (green `#609e12`) and `.is-incorrect` (red `#b20010`) rules, flex-centered
  to hold the injected checkmark/✕ SVG. Scoped to these 3 screens only —
  every other screen's `.s15-prog-dot.is-done` (plain blue, no correctness)
  is untouched.

### Verified in Preview

`lomda-preview` (own instance, port auto-assigned since another session's
server already held 5555), via `index_dev.html`'s free-navigation sidebar +
`javascript_tool` calls into the iframe's exposed `scqGenSelect`/
`scqGenCheck`/`saqGenSelect`/`saqGenCheck` (the real per-screen answer
flow, not direct state mutation — `genScqState`/`saqState` are `const`,
not exposed on `window`, only the functions are). Answered sub-part א wrong
(2 attempts, exhausting `maxAttempts`) and sub-part ב correct, then screen
47 showed א as a red ✕ dot and ב as a green ✓ dot, with ג as the current
blue ring — screenshotted and confirmed. No console errors.

### Files Changed

`methodica-science-mass-weight-01-06/js/main.js`,
`methodica-science-mass-weight-01-06/css/style.css`,
`WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Rolled out the correct/incorrect nav-dot color to components 01, 02, 03, 05 (2026-09-17)

User asked to bring the rest of the unit up to the same "colors for the
feedback" fix just applied to component 06's Peak Question nav. Component
04 has no `.s15-progress`/`.s12-progress` nav bar at all — nothing to do
there.

**Investigation (4 parallel Explore agents, one per folder) found each
folder's nav bar in a different state:**

- **02, 03, 05 already had a real, working sync mechanism** —
  `window.lomdaState.questionResults` (qNum → true/false), a
  `markQuestionResult(qNum, correct)` setter called from every question
  engine, and a `render*ProgressIcons(screenEl)` function (named
  `renderPracticeProgressIcons` in 02/03, `renderAdvancedProgressIcons` in
  05) already wired into `resetScreenState()`. It only ever swapped the
  dot's **icon** (✓ vs ✕ via `.is-wrong`) — the dot itself stayed the same
  blue (`#019de5`) whether right or wrong. Fix was additive and low-risk:
  extended each render function to also toggle `is-correct`/`is-incorrect`
  alongside the existing `is-wrong`, then added
  `.s15-prog-dot.is-done.is-correct` (green)/`.is-incorrect` (red) CSS next
  to the existing icon rules. Left `is-wrong` and its icon CSS completely
  untouched.
  - Folder 05's `markQuestionResult` already AND-combines multi-screen
    items (item 1 spans screens 37+38 — a wrong part ב keeps the combined
    dot red even though part א was correct) — verified this still works
    correctly, no change needed to that logic.
  - Folder 03's own drag-and-drop screen (26) uses a different, one-off
    green/red pair (`#43a047`/`#e53935`) for its card feedback than its SCQ
    screens do (`#609e12`/`#b20010`); used the dominant SCQ pair for the
    dot anyway, consistent with every other folder, rather than making the
    shared nav bar match one screen's local variant.
- **01 had no sync mechanism at all** — its 2-item warm-up series (screens
  13/14, dropdown + SCQ) used two separate flat globals per screen
  (`ddrop14Done`/`ddrop14Correct`, `scq15Done`/`scq15Correct`) with no
  progress-bar hookup. Built the same `questionResults`/`markQuestionResult`
  pattern from scratch (`renderWarmupProgressIcons`, mirroring 02/03/05's
  shape for consistency across the unit), called from `ddrop14Check()` /
  `scq15Check()`, rendered from `enterScreen13()`/`enterScreen14()`. Also
  had no `.is-wrong` X-icon CSS yet (only ever showed a checkmark) — added
  it alongside the new color rules rather than leaving color-only.

**Colors:** every folder already uses the identical green `#609e12`/red
`#b20010` pair for its own SCQ correct/incorrect states (confirmed
independently per folder, not assumed) — the same pair used for
component 06's fix. Used it uniformly; no subject-color derivation needed
anywhere in this rollout.

**Why `.is-done.is-correct`/`.is-done.is-incorrect` (3 classes) and not a
plain `.is-correct`:** this project's `style.css` duplicates
`.s15-prog-dot` rules per sibling-component screen ranges (leftover/dead
selectors for screens that don't exist in a given folder's `index.html` —
confirmed independently in every folder's report). The 3-class selector
outranks the existing 2-class `.is-done` rule by specificity regardless of
which duplicated block happens to come first in the cascade, so the color
applies reliably even inside this file's copy-pasted structure.

### Verified in Preview

`lomda-preview`, via each folder's own `index_dev.html` + `javascript_tool`
calls into the real per-question functions (`ddrop14Select`/`ddrop14Check`,
`scq15Select`/`scq15Check`, `scq18Select`/`scq18Check`, `scqGenSelect`/
`scqGenCheck`) — never direct state mutation. Confirmed: 01 screen 13→14
(wrong dropdown → red ✕ dot), 02 screens 16→17 (correct SCQ → green ✓
dot), 03 screens 25→26 (wrong SCQ → red ✕ dot), 05 screens 37+38→41 (part
א correct + part ב wrong, AND-combined → red ✕ on the single item-1 dot,
confirming the multi-screen aggregation still works). No console errors in
any folder.

### Files Changed

`methodica-science-mass-weight-01-01/js/main.js`,
`methodica-science-mass-weight-01-01/css/style.css`,
`methodica-science-mass-weight-01-02/js/main.js`,
`methodica-science-mass-weight-01-02/css/style.css`,
`methodica-science-mass-weight-01-03/js/main.js`,
`methodica-science-mass-weight-01-03/css/style.css`,
`methodica-science-mass-weight-01-05/js/main.js`,
`methodica-science-mass-weight-01-05/css/style.css`,
`WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Continuation: Removed the Peak "End — Failure" screen (global data-screen 48)

Stakeholder request: remove the unit's End — Failure closing screen
("פחות הצלחת בשאלת השיא. קורה, העיקר שניסית והתאמצת!", global data-screen
48, owned by component 06) entirely — every learner should now land on the
single End — Success screen after the 3 Peak questions regardless of score.

**Scope confirmed with the user before touching anything** (destructive,
cross-file operation): full removal + renumbering (not just hiding), and
`routeAfterPeak()` now always routes to the Success screen.

**`methodica-science-mass-weight-01-06/index.html`**: deleted the entire
End — Failure `<section data-screen="48" id="s44">` block (markup, nav,
back button). Renumbered the End — Success section from
`data-screen="49"` down to `48` to fill the gap (id `s45` and its internal
`s42-*` element ids left unchanged — only `data-screen` values are part of
the unit's numbering contract). Adjusted the surrounding `<!-- Screen NN -->`
label comments to match (43 instead of 44).

**`methodica-science-mass-weight-01-06/css/style.css`**: removed
`[data-screen="48"]` from every shared selector list it appeared in
(`.s0-content`/`.s0-text`/`.s0-slot1`), and collapsed the dedicated
`[data-screen="48"], [data-screen="49"]` end-screen block (bigtitle/
subtitle/char-area/char-gif/anim) down to just `[data-screen="48"]` (now
the renumbered Success screen).

**`methodica-science-mass-weight-01-06/js/main.js`**:
- Removed `SCREEN_PEAK_FAIL` constant; `SCREEN_PEAK_SUCCESS` changed
  49 → 48.
- `routeAfterPeak()`: still tallies the 3 Peak sub-part results into
  `window.lomdaState.peakSections` (kept — used elsewhere/for analytics),
  but now unconditionally `goTo(SCREEN_PEAK_SUCCESS)` instead of branching
  on the count.
- Removed the now-dead `enterScreen42()` function (the Failure screen's
  entrance/stagger logic) and its `s40Timers`/`s40Seen` state, and the
  `GEN_DATA[43]` (Failure copy) entry. `resetScreenState()`'s `case 48`
  now calls `enterScreen43()` (the Success entrance fn, unchanged) instead
  of `case 49`.
- `TOTAL_SCREENS` 50 → 49.

**`unit-manifest.js`** (root, production ownership registry): component
06's `screens` array `[44,45,46,47,48,49]` → `[44,45,46,47,48]`; added a
comment explaining the removal/renumbering for future maintainers;
`TOTAL_UNIT_SCREENS` comment updated (47 → 46 real screens).

**`unit-shell.js`** (root, production QA bridge): updated two comments
referencing the old `0..49` global range / `49` total to `48`/`46` — no
functional change, `unit-shell.js` reads the total from the manifest
programmatically.

**Deliberately left untouched**: root `index.html`/`css/style.css`/
`js/main.js` and `index-monolith-backup.html` — these are the frozen
legacy monolith build (explicitly documented as "preserved, unmodified"),
not the production path, and still contain the old Fail/Success pair.
Also left untouched: the identical dead `GEN_DATA[43]`/`[44]` Fail/Success
copy entries that exist unused in components 01-05's own `main.js` copies
(same shared-monolith-copy pattern documented elsewhere in this file) —
those screens never render outside component 06, so the entries are inert;
removing them from 5 more files was out of scope for this request.
Translation export artifacts under `translation/` still reference the old
Fail-screen text/screen numbers and were not touched (downstream exports,
not live production code) — flagged to the user, not silently edited.

### Verified in Preview

`lomda-preview`, component 06's own `index.html` (trailing-slash URL).
`node --check` clean on `js/main.js`, `unit-manifest.js`, `unit-shell.js`.
HTML `<section>` tag count and CSS brace count both balanced. Confirmed
live via `javascript_tool`: `document.querySelector('[data-screen="49"]')`
is now `null` (screen gone); `goTo(48)` renders the Success copy ("כל
הכבוד! השלמת את היחידה בהצלחה!") with no overflow (screenshotted); calling
`routeAfterPeak()` with all 3 Peak sub-parts unanswered/incorrect still
lands on `data-screen="48"` (Success) — confirming the "always succeed"
routing works even in the worst-case score. No console errors.

### Files Changed

`methodica-science-mass-weight-01-06/index.html`,
`methodica-science-mass-weight-01-06/css/style.css`,
`methodica-science-mass-weight-01-06/js/main.js`,
`unit-manifest.js`, `unit-shell.js`, `WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## View My Answer Toggle — screen 26 DragAndDropQuestion (2026-09-17)

Component 03 only. Screen 26 (`s26dnd`, `bq2-*` DOM ids, config
`window.GEN_DATA[25]`, state `genDdqState[25]`) is a "one slot, two possible
values" question: on the final wrong attempt, `s26dndCheck()` overwrote
every card's placement with the correct מסה/משקל mapping, permanently
destroying the learner's own final answer. Per `720-templates` →
`_global-components.md` → "View My Answer Toggle" (the current standard for
any destructive final-wrong reveal), this now gets the toggle so the
learner can flip back to see exactly what they submitted.

**Implementation:**
- Added module state `s26dndAnswer` (snapshot of the learner's final
  placement, `null` when not toggleable) and `s26dndView`
  (`'solution' | 'answer'`, runtime-only) in `js/main.js`.
- `s26dndCheck()`'s final-wrong branch (`state.attempts >= cfg.maxAttempts`)
  now snapshots `s26dndAnswer = { ...s26dndPlacement }` **before** the
  existing `cfg.items.forEach` overwrite that reveals the correct mapping —
  the only point the raw answer still exists.
- Added a new screen-26-only `s26dndShowFeedback(fbCfg, isCorrect)`, called
  instead of `ddqGenShowFeedback(25, ...)` only from this branch (the
  correct and first-wrong/retry branches keep calling the shared
  `ddqGenShowFeedback` unchanged, so the generic engine other dead code
  paths reference is untouched). It reuses the same `cfg.feedbackId`/
  `fbTitleId`/`fbBodyId` DOM ids, renders the fixed second bold title line
  (`התשובה הנכונה מוצגת.`, appended via `<br>` to the authored title) on the
  solution view, the fixed canonical answer-view copy
  (`התשובה אינה נכונה.` / `אפשר לצפות שוב בפתרון הנכון.`) on the answer view,
  and shows/hides the toggle button (`#bq2-fb-actions` /
  `#bq2-fb-toggle-btn`) only when `s26dndAnswer !== null`.
- Added `s26dndApplyView()` (single owner of the resolved-wrong board state:
  restores either the snapshot or the correct mapping into
  `s26dndPlacement`, re-renders via the existing `s26dndRender(true)` —
  which already derives each card's correct/incorrect mark from
  `S26DND_TARGET_VALUE[s26dndPlacement[id]]` vs `item.correct`, so the
  learner's original per-card marks reappear exactly as first shown — then
  refreshes the popup) and `s26dndToggleView()` (pure view flip; never
  calls `s26dndCheck()` and never touches `state.attempts`/`state.done`/
  scoring/navigation/`markQuestionResult`).
- `s26dndEnter()` now resets `s26dndView = 'solution'` on every entry
  (fresh or a Back-navigation revisit of an already-resolved question) and
  clears `s26dndAnswer = null` only on a genuinely fresh (not-yet-done)
  attempt, so a revisit after a final-wrong resolution still shows the
  solution first with the learner's answer one click away.
- Markup: added `#bq2-fb-actions`/`#bq2-fb-toggle-btn` inside the existing
  `#bq2-feedback` panel in `index.html`, wired to `s26dndToggleView()`.
- CSS: neutral Figma `ShowAnswer` button style (`#fff` background, `#222`
  text, `1px solid #484848` border unchanged on hover, `39px` height,
  `20px` horizontal padding, `1000px` radius, Assistant `20px`, weight
  `400`→`600` on hover only — never border-width/box-shadow/color). Body→
  button gap is `24px` via `margin-top: 24px` on `.bq2-fb-actions` — this
  project's global reset zeroes all margins (`* { margin: 0 }`), so unlike
  the generic contract's "20px + an existing 4px paragraph gap" this is a
  single margin achieving the same 24px net result. Title→body gap
  (`.feedback-head { margin-bottom: 24px }`) was left unchanged per the
  rule to never touch an already-correct existing gap.
- Did not touch `ddqGenShowFeedback`, any other `window.GEN_DATA[...]`
  entry, or any other folder (01/02/04-06) or the root-level frozen
  monolith.

### Verified in Preview

`lomda-preview`, this folder's own `index_dev.html`, driven entirely through
the real exposed functions (`s26dndDrop`/`s26dndDragEnd`/`s26dndCheck`/
`s26dndToggleView`), never direct state mutation. Confirmed: attempt 1 all
wrong → generic "נסה שוב" retry (no toggle, unchanged); attempt 2 (final,
2 of 4 cards still wrong) → solution shown immediately, title's fixed
second line present, toggle button reads `מעבר לתשובה שלי`; toggling to the
answer view restores the learner's exact final placement with the same
per-card correct/incorrect marks originally shown (2 green, 2 red matching
what was actually submitted), fixed canonical copy, button relabeled
`התשובה הנכונה`; toggled 8+ times back and forth with no degradation or
console errors; `state.attempts`/`state.done` confirmed unchanged by every
toggle. Back-navigation test (`goTo` away and back) confirmed the view
always resets to `'solution'` on re-entry while `s26dndAnswer` persists.
Screenshotted both the solution view and the answer view. No console
errors traceable to this folder's code (`js/main.js`/`index.html` under
`methodica-science-mass-weight-01-03`); an unrelated pre-existing error
from the root-level frozen legacy `js/main.js` (out of scope) appeared
intermittently in the browser console during testing, caused by another
concurrent session's own preview server sharing this browser profile — not
this change.

### Files Changed

`methodica-science-mass-weight-01-03/js/main.js`,
`methodica-science-mass-weight-01-03/css/style.css`,
`methodica-science-mass-weight-01-03/index.html`,
`WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## View My Answer Toggle added to component 02 screens 19 and 20 (2026-09-17)

Both screens 19 (`dq19`, vocabulary DropdownQuestion) and 20 (`dq20`,
Neil Armstrong DropdownQuestion + video) reveal the correct solution on
their final-wrong outcome by overwriting the same dropdown slots that held
the learner's own picks — a destructive same-slot reveal, the exact case
the 720 Templates skill's **View My Answer Toggle** (`_global-components.md`
→ "View My Answer Toggle") exists for. Neither screen had it; added per the
skill's canonical contract (confirmed against the skill file directly
before implementing, not from memory/precedent).

**Implementation:**

- **Screen 19** (`dq19Attempts >= 2`, the final-wrong branch of
  `dq19Check()`): added a snapshot step — `dq19Answer` — that captures every
  item's currently-displayed value (`dq19GetVal(item.id)` per `DQ19_ITEMS`
  item) immediately **before** the existing `forEach` loop overwrites wrong
  slots with `item.correct`. This is the learner's true final submitted
  state (round-1-correct-locked items + round-2 fresh picks together).
  Added `dq19View` (`'solution' | 'answer'`, reset to `'solution'` at the
  top of every `enterScreen19()` call — both the fresh-entry and the
  already-`dq19Done` re-entry path share that one reset line), plus
  `dq19ApplyView()`/`dq19ToggleView()`. `dq19ShowFeedback(isCorrect)` now
  branches: correct → unchanged; final-wrong + `dq19View==='solution'` →
  existing wrong copy with the mandated fixed second bold title line
  (`התשובה הנכונה מוצגת.`, via a real `<br>`, appended not replacing the
  authored title) and the `מעבר לתשובה שלי` button; final-wrong +
  `dq19View==='answer'` → the toggle's own fixed canonical copy
  (`התשובה אינה נכונה.` / `אפשר לצפות שוב בפתרון הנכון.`, never this
  screen's pedagogical body) and the `התשובה הנכונה` button. The toggle
  button only renders when `dq19Answer !== null` (never on the first-wrong
  retry card or on correct feedback). `dq19ToggleView()` is a pure view
  swap — never calls `dq19Check()`, never touches attempts/done/scoring/
  `markQuestionResult`.
- **Screen 20** (`dq20Check()`, single-attempt): same snapshot pattern —
  `dq20Answer = allCorrect ? null : snapshot`, taken before the existing
  per-item overwrite loop. `dq20View` reset to `'solution'` in
  `enterScreen20()` alongside its existing full per-entry reset (this
  screen already unconditionally re-blanks all state on every entry,
  unlike screen 19, which preserves state across Back-navigation via its
  `dq20Done`/`dq19Done` gate — pre-existing asymmetry, not something this
  task changed). `dq20ApplyView()`'s `'solution'` branch reproduces exactly
  what `dq20Check()` already renders (per-slot `is-correct`/`is-incorrect`
  matching each slot's own original correctness, displayed value always
  `item.correct`) rather than forcing every slot green — preserving the
  screen's existing, already-approved solution visual instead of inventing
  a new one. The `'answer'` branch restores the learner's snapshot with
  per-slot correctness marks against `item.correct`. Same fixed toggle
  copy/button contract as screen 19.
- **Button** (`.view-answer-btn`, shared by both screens — a neutral,
  theme-independent global component, not scoped per screen): Figma
  `ShowAnswer` component spec exactly — white bg, `#222` text, `1px solid
  #484848` border unchanged between default/hover, `39px` height, `20px`
  horizontal padding, `1000px` radius, Assistant `20px`, weight `400`→`600`
  on hover only (no border/box-shadow/width change on hover).
- **Spacing:** title→body gap left untouched on both screens (screen 19:
  `0px` — confirmed via computed style that `.feedback-title`'s
  margin-bottom is actually `0` project-wide, not the ~20px a default `<p>`
  margin would suggest; screen 20: unchanged `12px` flex gap). Body→button
  is `24px` on both, achieved differently per screen's own layout: screen
  19 (plain block flow, nothing between body and the new actions row
  before now) gets `margin-top: 24px` directly on `#s19q-fb-actions`;
  screen 20 (`.s20-fb-panel` is a flex column with its own `gap: 12px`
  applying automatically between every visible child) gets `margin-top:
  12px` on `#s20q-fb-actions`, adding to the panel's existing 12px gap for
  24px total — confirmed both numerically via `getBoundingClientRect()`
  divided by the canvas's actual `scaleApp()` factor, not just visually.
- No dragging/re-anchoring logic added — both feedback panels in this
  codebase are simple `position: absolute`/flex panels with no drag
  handlers, so the skill's drag-reanchor clauses don't apply here (per
  explicit task scoping); toggling just swaps content in place.
- No manual close control added to either panel (none existed before,
  none added now) — toggling never hides/removes the popup.

### Verified in Preview

`lomda-preview` (`.claude/launch.json`, `npx serve .`), component 02's real
`index.html` (not just the dev harness), driving the actual learner-facing
functions (`dq19Pick`/`dq19Check`/`dq19DismissFirst`/`dq19ToggleView`,
`dq20Pick`/`dq20Check`/`dq20ToggleView`) — never direct state mutation.
Screen 19: attempt 1 wrong on "כבד", dismissed the retry card, attempt 2
still wrong on "כבד" (picked "גם וגם") → confirmed the final-wrong branch's
snapshot captured the learner's true submission (`kavad: 'גם וגם'`, every
other slot correct), the fixed second title line rendered, and the button
appeared only then. Toggled to the answer view: "כבד" shown red/"גם וגם"
(exactly as submitted), every other slot green with the learner's own
correct picks, fixed canonical copy, button relabeled. Toggled back and
forth 7 times: fully lossless, `dq19Attempts`/`dq19Done`/`dq19Correct`/
`standardScore` never changed. Screen 20: picked "בת" wrong (הסבר מדעי
instead of תצפית) → same fixed-title-line + snapshot + toggle behavior
confirmed, answer view showed the learner's actual wrong pick in red with
the others green, solution view reproduced the screen's existing
green/red-marked-but-correct-text look unchanged. Numeric spacing
(`getBoundingClientRect`, canvas-unscaled) confirmed exactly `24px`
body→button on both screens, and unchanged title→body gaps (`0px`/`12px`).
Screenshotted all four states (both screens × both views). Zero console
errors in every check performed. (One environment note, not a code issue:
directly navigating to a screen's bare `index.html` URL without a trailing
slash caused the static preview server to serve resources one directory
level too high, i.e. the frozen root-level legacy monolith instead of this
folder's own files — worth remembering for future preview sessions in this
project; using the folder URL with a trailing slash, or `index_dev.html`,
avoided it. Not a change made to any shipped file.)

### Files Changed

`methodica-science-mass-weight-01-02/index.html`,
`methodica-science-mass-weight-01-02/css/style.css`,
`methodica-science-mass-weight-01-02/js/main.js`,
`WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## View My Answer Toggle added to component 01 screens 11 and 13 (2026-09-17)

Same standing product requirement as the component 02 entry directly above
(confirmed against the 720 Templates skill's `_global-components.md` →
"View My Answer Toggle" and `_question-template-defaults.md` → "Terminal-
incorrect title carries a fixed second line" before implementing). Two
screens in component 01 have a destructive final-wrong reveal that
overwrites the same slot(s) that held the learner's own answer: screen 13
(`ddrop14`, DropdownQuestion, single attempt) and screen 11 (`ddq12`,
DragAndDropQuestion — a confirmed special case, see below). Neither had the
toggle; both now do, per the skill's canonical contract.

**Implementation:**

- **Screen 13** (`ddrop14Check()`, single-attempt — every wrong outcome is
  the terminal outcome, there is no retry state to exclude): added a
  snapshot taken at the top of the function, `const submitted =
  ddrop14Vals.slice()`, before the existing per-item loop overwrites any
  wrong slot with `item.correct`. `ddrop14Answer = allCorrect ? null :
  submitted`. Added `ddrop14View` (`'solution' | 'answer'`, reset to
  `'solution'` at the top of every `enterScreen13()` call — one line covers
  both the fresh-entry and the already-`ddrop14Done` re-entry branch).
  `ddrop14RenderDropdowns()` factors out the shared "paint `#s12-ddv-{i}` +
  the dropdown's correct/incorrect class from the current `ddrop14Vals`"
  logic that both the toggle and re-entry now share.
  `ddrop14ApplyView()`/`ddrop14ToggleView()` follow the standard contract —
  a pure view swap, never calling `ddrop14Check()` or touching
  attempts/done/scoring/`markQuestionResult`. `ddrop14ShowFeedback(isCorrect)`
  now branches: correct → unchanged (`מצוין!` + shared body, no action row);
  final-wrong + `ddrop14View==='solution'` → existing wrong copy with the
  mandated fixed second bold title line (`התשובה הנכונה מוצגת.`, real
  `<br>`, appended not replacing the authored title) and the `מעבר לתשובה
  שלי` button; final-wrong + `ddrop14View==='answer'` → the toggle's own
  fixed canonical copy (`התשובה אינה נכונה.` / `אפשר לצפות שוב בפתרון
  הנכון.`, never this screen's pedagogical body) and the `התשובה הנכונה`
  button. The action row (`#s12-fb-actions`) only renders when
  `ddrop14Answer !== null`.
- **Screen 11 — confirmed special case** (`ddq12`, DragAndDropQuestion):
  this screen has no popup (feedback is inline red/green on the grid cells)
  and no attempt limit — `ddq12Check()` marks every cell in place
  (non-destructive, both right and wrong stay visible), followed by the
  existing mandatory `#ddq12-solution-btn` ("למיון הנכון") whose handler
  `ddq12ShowSolution()` overwrites `ddq12State` with the fully-correct
  arrangement, losing the learner's own wrong placements — the destructive
  step this feature exists for. Per explicit confirmed scope: the one-shot
  check and the mandatory "למיון הנכון" button are unchanged (no attempt
  limit added, no popup added) — only an inline toggle was added, appearing
  once the solution has been revealed. In `ddq12ShowSolution()`, added a
  snapshot **before** the existing overwrite: `ddq12Answer` is set to a copy
  of `ddq12State` only if the learner's placement was not already fully
  correct (compared cell-by-cell against `DDQ12.correct`); if it already
  matched, `ddq12Answer` stays `null` and no toggle appears (a reveal on an
  already-fully-correct board is a no-op, nothing to toggle back to).
  `ddq12ApplyView()`/`ddq12ToggleView()` follow the same pure-view-swap
  contract; the `'answer'` branch (`ddq12RenderAnswerCells()`) reproduces
  each cell's original correct/incorrect mark by comparing the snapshot
  against `DDQ12.correct` — exactly what `ddq12Check()` originally showed —
  the `'solution'` branch reuses the existing `ddq12RenderAllCells(true)`.
  `ddq12View` resets to `'solution'` in `enterScreen11()` (both branches),
  so Back-navigation onto a resolved question always shows the solution
  first. Since there is no popup here, there is no title/body copy — the
  toggle is a single inline button (`#ddq12-toggle-btn`) placed beside the
  existing nav buttons in `.nav-continue-area`, hidden until
  `ddq12ShowSolution()` runs and `ddq12Answer !== null`, showing `מעבר
  לתשובה שלי` on the solution view and `התשובה הנכונה` on the answer view.
- **Button** (`.view-answer-btn`): same class name deliberately reused from
  the component 02 implementation above (component 01 had no prior
  precedent to follow, so the name was aligned to component 02's for
  cross-component consistency within this unit — each component keeps its
  own `css/style.css`, so this is a naming convention match, not a shared
  file). Figma `ShowAnswer` spec exactly: white bg, `#222` text, `1px solid
  #484848` border unchanged between default/hover, `39px` height, `20px`
  horizontal padding, `1000px` radius, Assistant `20px`, weight `400`→`600`
  on hover only (no border/box-shadow/width change on hover) — verified via
  `getComputedStyle` in the preview, not just read from the stylesheet.
- **Spacing:** screen 13's title→body gap is left untouched (measured `0px`
  under this project's global `* { margin: 0 }` reset — not the ~4px the
  skill's general contract assumes elsewhere, so `margin-top: 24px` was set
  directly on `.feedback-actions` rather than a `+20px` addition, to land on
  the mandated `24px` exactly). No `gap: 24px` was added to `.feedback`'s
  own flow (would have wrongly pushed title away from body too). Screen 11
  has no popup, so this spacing rule doesn't apply there — the inline
  button reuses `.nav-continue-area`'s existing `12px` flex gap.
- No dragging/re-anchoring logic added — this codebase's `.feedback` panels
  and screen 11's nav bar are simple fixed-position elements with no drag
  handlers anywhere (`data-fb-draggable` is present in the markup but
  unused/unwired — confirmed by grep, not assumed), so the skill's
  drag-reanchor clauses don't apply here.
- No manual close control added (none existed before, none added now) —
  toggling never hides/removes anything, only swaps content/state in place.

### Verified in Preview

`lomda-preview` (`.claude/launch.json`, `npx serve .`), this folder's
`index_dev.html`, driving the real learner-facing functions
(`ddrop14Select`/`ddrop14Check`/`ddrop14ToggleView`,
`ddq12DragStart`/`ddq12Drop`/`ddq12Check`/`ddq12ShowSolution`/
`ddq12ToggleView`) — never direct state mutation. (Native HTML5
drag-and-drop can't be driven by synthetic mouse coordinates in this
environment, so screen 11's placements were made by calling
`ddq12DragStart`/`ddq12Drop` directly with a minimal fake event object —
the same functions a real drag interaction calls — rather than by
mutating `ddq12State`.)

Screen 13: picked both dropdowns wrong (`מסה`/`משקל` swapped) → confirmed
the snapshot captured the exact wrong picks, the fixed second title line
rendered (`התשובה לא נכונה.<br>התשובה הנכונה מוצגת.`), correct values shown
in the dropdowns, and the toggle button appeared only then. Toggled to the
answer view: both dropdowns reverted to the learner's original wrong picks
(marked incorrect, matching the original `ddrop14Check()` marks), fixed
canonical copy (`התשובה אינה נכונה.` / `אפשר לצפות שוב בפתרון הנכון.`),
button relabeled to `התשובה הנכונה`. Toggled back and forth repeatedly:
fully lossless every time. Re-entering the screen (`enterScreen13()`) while
the answer view was open confirmed it always snaps back to the solution
view. A fully-correct submission showed `מצוין!` with no second title line
and no toggle button. Patched `markQuestionResult` to count calls: exactly
one call (`[1, false]`) from `ddrop14Check()`, zero additional calls across
four toggles.

Screen 11: placed row 0 ("הגדרה") swapped/wrong, rows 1–2 correct, ran the
check (confirmed `is-incorrect` only on the swapped row), clicked "למיון
הנכון" → confirmed the snapshot captured the learner's actual wrong
placement, all cells turned green/correct, and the new inline toggle
appeared reading `מעבר לתשובה שלי`. Toggled to the answer view: row 0
reverted to the learner's swapped items marked `is-incorrect`, rows 1–2
stayed marked `is-correct` — exactly reproducing the original check.
Toggled back to the solution view repeatedly: lossless every time.
Re-entering the screen while the answer view was open confirmed it always
resets to the solution view. Placing every card correctly, checking, then
clicking "למיון הנכון" confirmed no toggle button appears (the reveal was a
no-op, nothing to toggle back to).

Screenshotted all four states (both screens × solution/answer view).
Console checked after every interaction — zero errors from this
component's own code in every case (an unrelated 404 and a thrown error
were observed from the frozen root-level legacy `js/main.js`/index, out of
scope for this task and pre-existing).

One environment note, not a code issue: this session's shared Browser pane
had other tabs/preview-server ports appearing and disappearing during
testing (the underlying `npx serve` process was restarted at least twice
mid-session, each time on a new port) — work was re-verified from scratch
on a fresh, explicitly-tracked tab/port after each occurrence, with the
iframe's `src` asserted to stay on this component's own folder before and
after every state-changing call. No project file was affected by this;
it only affected how testing was sequenced.

### Files Changed

`methodica-science-mass-weight-01-01/index.html`,
`methodica-science-mass-weight-01-01/css/style.css`,
`methodica-science-mass-weight-01-01/js/main.js`,
`WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## Launch-screen ("מסך הזנקה") wording audit against approved reference unit 4.2 (2026-09-17)

User reported unspecified QA feedback on the unit's "launch/kickoff" screens
(TransitionScreen instances that launch into a practice/question set) and
was told to use an existing approved unit, "4.2", as the reference — later
identified (with the user, via GitHub search) as
`methodicelElearnig/methodica-math-percent-02`, whose own launch screens are
sourced from `math-target-4.2-script.pptx` (hence "4.2"). Confirmed against
both that live reference project and the `720-templates` skill's own
`TransitionScreen.md` contract.

**Scope narrowed with the user across two rounds of clarification:**
animation timing/Continue-button gating stays exactly as-is (it's a
deliberate, documented decision from an earlier session, even though it
technically deviates from the `system-animation` skill's DECISIONS.md
standard) — only the headline/instruction **wording** on the true
"launch into N questions" screens should be brought in line with 4.2's
phrasing style. Component 04's data-screen=31 was explicitly excluded
(it's a "class task" launch, not a question-count launch, and its current
blue-card layout was itself an explicit prior revert — not this template).

**Audit result — most were already aligned, since they'd evidently been
built from the same 4.2 reference originally:**
- Component 03/screen 24 ("אין כמו תרגול לחיזוק הלמידה") — opening line is
  verbatim identical to 4.2's own kickoff copy. No change.
- Component 06/screen 44 ("שאלת השיא") — suptitle + reminder line are
  verbatim identical to 4.2's Peak-question kickoff (`"כל הכבוד!"` / "אם
  לא הצלחת..."). No change (the "3 סעיפים"/"בכולם" vs 4.2's "4 סעיפים"/"3
  לפחות" difference reflects this unit's own actual sub-part count/pass
  rule, not a wording gap).
- Component 03/screen 28, component 05/screen 35 — reviewed; no confident
  verifiable gap found (component 05 lacks 4.2's explicit "צריך להצליח על
  X" closing line, but no evidence of a real numeric pass-threshold exists
  for that question set to phrase such a line accurately, so nothing was
  invented).

**Two concrete wording fixes applied** (content/facts unchanged, only
phrasing style aligned to 4.2):
- Component 01/screen 12 ("מה נשאר לנו בראש?"): subtitle reworded
  "שתי שאלות חימום קלילות לפני שנתקדם" → "שתי שאלות קלילות לחימום לפני
  שנתקדם" — matches 4.2's own word order for the equivalent screen
  exactly (`methodica-math-percent-02-01`'s S20, same "מה נשאר לנו בראש?"
  headline).
- Component 02/screen 15 ("הזנקה לתרגול"): suptitle line was missing 4.2's
  opening transition clause. Changed "נעבור לתרגול הראשון ונענה על" →
  "סיימנו את שלב הלימוד, נעבור לתרגול הראשון ונענה על" — matches 4.2's own
  S0 (`methodica-math-percent-02-02`) opening line for the identical
  "just finished the learning stage" moment verbatim.

### Verified in Preview

`lomda-preview` (autoPort), both edited screens loaded via each
component's own trailing-slash directory URL (avoids the documented
`serve` 301-redirect/relative-path bug — see `unit-manifest.js`'s own
comment on this). Screenshotted both: component 01 screen 12's new
subtitle renders on one line, no wrap; component 02 screen 15's longer
suptitle (now 3 lines total: suptitle/"6 שאלות"/pass-instruction) also
renders cleanly with no overflow or wrap.

### Files Changed

`methodica-science-mass-weight-01-01/index.html`,
`methodica-science-mass-weight-01-02/index.html`,
`WORK_PROGRESS.md`.

### Preview Tested

Yes — see "Verified in Preview" above.

---

## 2026-09-24 — Screen 21 (component 02, screen 7): Galileo video replaced

User supplied a new clip (`galileo1.mp4`, 4.0s, H.264/AAC) for the Galileo experiment screen. The source was 3840×2160 (5.2MB); re-encoded to 1920×1080 (x264 CRF 18, faststart, 2.9MB, SSIM 0.994 vs source, visually lossless) and saved it to `methodica-science-mass-weight-01-02/assets/video/galileo1.mp4` and pointed `#s21-img`'s `<source>` at it. Updated `S21_VIDEO_FALLBACK_MS` in `js/main.js` to the new clip length (4000 ms instead of 5643 ms). The old `assets/video/galileo.mp4` was left in place (not deleted, per asset rules). It is now unused in component 02 but still used by component 04's Galileo reminder popup, which was not changed. Verified in preview: `currentSrc` resolves to the component's own `galileo1.mp4`, `readyState 4`, duration 4s, frames decode.

**Status: ✅ Done** — committed and pushed to `main` (2026-09-24).

## 720 platform integration — reporting, issue report, resume, optimization (2026-09-23 … 09-24)

Branch `vadimr/feat/reporting-resume`. Procedure: `2026/Documentation/reporting-and-resume/
ADDING-REPORTING-AND-RESUME.md` (refreshed first on 2026-09-23 against every sibling fix and the QA
campaigns D-1 … D-15). Design records: `docs/REPORT-XAPI.md`, `docs/REPORT-ISSUE.md`, `docs/RESUME.md`,
`docs-and-tools/PACKAGING.md`; structure: `ARCHITECTURE.md` → "Current structure".

- **Phase 0** — catalogue `metadata/` committed; `.gitattributes` pins LF; part 06's documented
  End-Failure removal actually applied (it had never reached a commit); screen → item map recorded;
  `_test/verify-report.js` added.
- **Phase 1** — fonts, two bubbles, four videos and `feedback-drag.js` hoisted to `unit-assets/` /
  `unit-js/` (byte-identical copies only); `?v=` on every code reference; asset-contract guard. Shipped
  size 69.6 → 60.3 MB.
- **Phase 2** — shared layer from mass-measure-03 + ports (video state machine, persisted hints ledger,
  per-unit character key, ratio-01 stub); root `index.html` is now the redirect and the iframe shell is
  `qa-shell.html` (dev only, opens parts with `?dev=1`); every check reports `answered`, every hint
  `requested`, every part's last click reports the component with the decided result (02 at 4/6, 03/05
  score only, 04 no score, 06 at 3/3); the Retry gate on every two-attempt question; YouTube reports
  played/paused, no page data reaches YouTube.
- **Phase 3** — the "מצאתם בעיה?" dialogs in every part; the existing flag button now opens them.
- **Phase 4** — resume: one state document per component, the four hooks per part, boot cover, D-8
  (finished button stays disabled). Two pre-existing re-entry bugs fixed: part 02 screen 20 could be
  answered again on revisit (second score increment); part 05's hotspot regained attempts on revisit.
- **Phase 5** — allowlist packaging (`docs-and-tools/`), docs, first package, live Kata run.
- **Live Kata run (2026-09-24)** — all six components walked live (`2026/QA/2026-09-24/REPORT.md`):
  PASS, plus one real bug **B-1** (an item `completed` lost after Back through an unanswered question).
  Fixed in `unit-js/20-xapi.js` (`_xapiCloseItem`, `?v=2`), five harness checks, package `2026-09-24b`.
- **Merged Noa's finished `main` (2026-09-24, `d9d4417`)** — `b3b55d1` + `2d5b25e` merged into the branch.
  Conflicts: 02 screens 21/22 (her `galileo1.mp4` + `autoplay=0`, our report attribute + `enablejsapi=1`),
  02 `dq19UpdateCheck` (her visible button + our Retry gate), 06 end screens (hers: removed). Part 06 now
  ends on Peak Q3's "סיימתי"; item 06-002 has no screen and is not reported (Kata/content team to
  decide). `js/main.js` / `css/style.css` → `?v=2`.
- **`medal.mp4` removed (2026-09-24, owner's request)** — it belonged only to part 06's removed end screen.
  Parts 01–05 lose their dead copies of that screen's config (`GEN_DATA[43]`/`[44]`, `enterScreen42/43`, as
  `b3b55d1` did in 06); their dead Peak-intro copy now names 06's real character. `js/main.js?v=3`.
- **Screen 21 autoplay on a hidden screen fixed (2026-09-24)** — the staged-entrance timer started the Galileo clip
  4 s after entry even if the learner had already left (`goTo()` pauses videos, but the timer outlived the screen).
  It now plays only while screen 21 is active. Part 02 `main.js`; `js/main.js?v=4`. Not yet packaged (waiting
  for the screen-22 video decision).
- **Open question no longer reports `answered` (2026-10-01, MOE QA on part 01)** — screen 8 (item 003 q1,
  free text) sent `answered.last` with no success/score; spec v2.7 p24 reserves `answered` for an evaluable
  response. D-9 refined: an ungraded question (`"other"`, empty `answers` and `correctAnswers`) sends no
  `answered`; metadata unchanged. `xapiSubmittedOpen` removed; `20-xapi.js?v=3`, `-01/js/main.js?v=6`.
  See `docs/REPORT-XAPI.md` → "D-9, refined". Not yet packaged.

Harness: 1067 checks (D-9 ungraded exception + screen-8 runtime check added); restoring an `answered` on
screen 8 fails 2.

## MOE monday.com QA — branch `vadimr/qa-fixes/monday` (2026-10-06)

Board `720_מתודיקה_תוכן_תשפ"ז`, 9 mass-weight items. Issue 1 (screen 8 `answered`) is f967f1a above.
Open with MOE / script owner, not changed: 01-01 matching table scores 0/1 by design (partial credit?),
01-01 "video smaller than frame" (not reproducible from code), 03 "ענו נכון על כל השאלות" text vs no gate.

- **YouTube player attach race (01-01 "אין דיווחי played/paused")** — `onYouTubeIframeAPIReady` fires once
  and could run before `main.js` defined it; now `ytInitPlayers()` also runs at load when `YT.loaded`.
  Parts 01 and 02; each creates only its own player. Preview: player attached after warm reloads; play/pause
  reach `xapiYouTubeState(…,'002')`. See `docs/REPORT-XAPI.md`. `-01 main.js?v=7`, `-02 main.js?v=6`.
- **Part 02 YouTube embeds (02 "הסרטון … לא נטען", Error 153 ×2)** — `#s20-yt-iframe`, `#s22-iframe`,
  `#s22-modal-iframe` get part 01's embed attributes: `referrerpolicy="strict-origin-when-cross-origin"`,
  YouTube's full `allow` list, a Hebrew `title`. Error 153 = YouTube got no Referer; the explicit policy is the
  one thing on our side that guarantees one. Not provable locally (plays on localhost before and after) —
  confirm in a Kata run. "Doesn't fill the frame" was YouTube's small error panel, not our CSS.
- **Screen 26 holds 2 cards per concept (03 "ניתן לגרור 3 פריטים למקום אחד")** — `S26DND_SLOTS_PER_TARGET`
  only drew placeholders; nothing limited a drop. `s26dndPlace()` now swaps on a full target: its last
  unlocked card goes where the dragged card came from (`s26dndDragFrom`); a target full of locked cards
  refuses. Locked (correct after attempt 1) cards are never evicted. Scoring/xAPI/resume unchanged. Preview:
  3rd card on מסה swaps one back to the tray; weight→full mass swaps across; locked `bet` stays. `-03 main.js?v=6`.
- **Pointer drag with a visible card (unit "הגרירה הויזואלית לא קורית")** — native HTML5 DnD showed only the
  browser's faint snapshot inside the scaled canvas and does not run on touch. New shared
  `unit-js/30-pointer-drag.js` (`PointerDrag.make`): a clone follows the pointer (mouse/pen/touch), the original
  stays dimmed, the zone under the pointer is highlighted; clicks pass through. Wired on 01 s11 (`ddq12`, zones
  `data-dnd-zone="r<r>-c<c>|bank"`) and 03 s26 (`s26dnd`, zones `mass|weight|source`); drop rules unchanged
  (03 capacity/swap included). Loaded in all six parts; harness `SHARED` updated (1075 checks). No keyboard path
  (none before either). Separate branch/commit for an easy revert. `-01 main.js?v=8`, `-03 main.js?v=7`.

## Upgrade to the Hebrew twin + resume hardening + true/false + Arabic identity — branch `vadimr/upgrade-from-he-2026-11` (2026-11-04)

Base: this build came from Hebrew `b8817fd` (2026-10-08). Same change as the Hebrew twin's branch
`vadimr/fix/resume-tf-2026-11`, plus what only the Arabic build needs.

- **Metadata** (commit `57e1b01`): the Arabic files supplied by the unit owner. Part 06 q2/q3 `answers` /
  `correctAnswers` set to `true`/`false` with `correctXapiResponsesPattern` (guide §6.3b: never translated).
- **From Hebrew `3294fe3` + `0f1d657`** (part 01): the learning-path item split (002 choice / 003 video /
  004 text, old 003–007 → 005–009, resume renumbering) and the `selected` / learning-type statement.
- **Lost state, boot markup, media, part 06 true/false**: the Hebrew twin's change set (see its WORK_PROGRESS);
  `20-xapi.js`, `40-resume.js`, `50-loader.js` and `_test/verify-report.js` are copies of the Hebrew files.
  Arabic `SAQ_LABELS = ['صحيح', 'غير صحيح']`. Images 29.9 MB → 6.6 MB, landing clips 4.1 MB → 0.96 MB.
- **Hebrew a learner could see** (part 02 screen 19): the dropdown values were `יומיומית` / `מדעית`, shown
  after a pick and in the solution. Values and labels are now the Arabic targets / sources of metadata
  02-004; a state saved with the Hebrew ones is translated on restore (`_rsDq19Ar`). Dead-code yes/no
  fallback `['نعم','لا']`.
- **Arabic identity** (the ar-mass-measure-01 `9263ef0` pattern): folders, slugs, metadata file names and ids
  `methodica-ar-science-mass-weight-01-0N`, prefix `https://lomdot.education.gov.il/metodica/720/ar/science/mass-weight/01/`,
  `UI_CHARACTER_KEY`, `NAV_EDGE_KEY`, the cross-part pass flag `lomda_mw01_ar_standardPass` (no longer shared
  with the Hebrew unit on the same origin), tools (`$ContentBaseUrl`, `$IdBase`, `$TitleLangKey 'Arabic'`).
  **Kata: not sent.** ar-mass-measure-01 added its Arabic components to the existing Hebrew unit
  (`a840a64`, `-ParentUnitKey`, KATA binds a learning objective to one unit); that port is part of the Kata step.
- Harness: 1142 checks; the asset-sweep floor is 120 here (the 18 Hebrew font url()s are gone with Calibri).
