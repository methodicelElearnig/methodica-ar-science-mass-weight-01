# Live verification — first Arabic package and Kata drafts, 2026-11-04

Package `../../deployments/2026-11-04` (commit `ee77646`), uploaded by the unit owner on 2026-11-04 to
`https://lomdot.education.gov.il/metodica/720/ar/science/mass-weight/01/`. Same change set as the Hebrew twin's
`2026-11-04` + `2026-11-04b` (resume hardening, lighter media, part 06 true/false, `selected` on every choice and
switch), plus the Arabic identity and the Arabic screen-19 dropdown.

## CDN upload

All **84** package files return HTTP 200 with exactly the package's byte size (cache-busted GETs).
Live part 01 without a registration: `lang="ar"`, `XAPI_ID_PREFIX` `…/720/ar/science/mass-weight/01/`, slug
`methodica-ar-science-mass-weight-01-01`, `20-xapi.js?v=6`, library requested at 218 ms, no images at load;
Continue on video, then text and back on the toggle sent `selected` `video`, `text`, `video` (captured in the page).

## Kata

The six components (25 items, without 06-002) were added to the Hebrew unit `methodica-science-mass-weight-01`
in parent-unit mode and read back clean (`WORK_PROGRESS.md`, `SEND-METADATA.md`). They are **draft**: MOE has
not approved the Arabic version, so they are not published (rule 2026-11-02, `2026/Documentation/KATA/KATA-API.md`).
Kata issues launch links for draft components.

## Live launches

Fresh learner `MW01AR-LIVE-11041934` (pseudonym), links from `Tools/full-kata-link/New-KataLaunchLinks.ps1
-ComponentId <the six Arabic component IRIs>` (`kata-links-methodica-ar-science-mass-weight-01-live-20261104-193457.csv`;
it carries the reporting token — not to be shared). Chrome in the desktop app, normal line.

### Part 01 — first launch

| Check | Result |
|---|---|
| Metadata | loaded; `METADATA.id` = `XAPI_COMP_ID` = `…/720/ar/science/mass-weight/01/methodica-ar-science-mass-weight-01-01/` |
| Library request | **189 ms** after navigation start (head preload) |
| Images fetched at load | **0** |
| State read | `404 absent` → not a failed read; `_resumeReady` true; cover dropped |
| Statements | every POST to `kata.cet.ac.il/api/v1/xapi/statements` → **200** |

### Part 01 — save → relaunch → restore

1. Hook question answered correctly, text path (Continue), on to screen 6, save.
2. Kata's document: `v 5`, component `methodica-ar-science-mass-weight-01-01`, `currentScreen 6`, `path text`,
   `ids 2`, `xq {001/q1: true}`, `doneItems` 001 / 002 / 004. State writes 204, statements 200.
3. Same link again: lands on **screen 6**, path `text`, `001/q1` restored, no failed read.

### Part 01 — the tester's scenario, replayed on the live page

`_resumeReady = false; setUnitCharacter('character-2'); goTo(1); markSent(…)` → `_resumeReady = true;
drainPendingUnitState(); applyExecutionState(_unitState.payload)`. Kata's document said `currentScreen` **6**
before, during the "wait", after the drain (character updated) and after the restore; the page landed on 6.

### Part 06 — true/false statements

Buttons `صحيح` / `غير صحيح`. Section أ right, section ب statement 1 `غير صحيح` and statement 2 `صحيح` (both
right), section ت right:

| Question | Verb | `result.response` | `success` |
|---|---|---|---|
| `001/q1` | answered.last | — | true |
| `001/q2` | answered.last | **`false`** | true |
| `001/q3` | answered.last | **`true`** | true |
| `001/q4` | answered.last | — | true |

Every statement POST → 200, every state PUT → 204. The stored statements cannot be read back with our credentials
(403 for the API key, 401 for the launch token — as for the Hebrew twin).

## Not done here

- Publishing the six components — waits for MOE's written approval of the Arabic version.
- A Slow 4G launch (done for the Hebrew twin: restore behind the cover, no start screen).
- The part 06 end button (component `completed`) was not clicked for this learner.
