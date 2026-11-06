# Live verification — `methodica-ar-science-mass-weight-01`, package `2026-11-06` (leave save via `xapi-720-l.js`)

Run 06.11.26 ~11:50 from the Claude desktop browser (Chromium) on the production CDN, after the owner uploaded the
package. Launch links from `Tools/full-kata-link/New-KataLaunchLinks.ps1`, learner `VADIM-LEAVE-1106`, registration
`a3471731…` for part 01 (test data; registrations cut to 8 characters, no token in this file). Links CSV:
`Tools/full-kata-link/kata-links-methodica-ar-science-mass-weight-01-leave-20261106.csv`.

## CDN

The nine files of `deployments/2026-11-06/DEPLOY.md` (six `index.html`, `unit-js/10-identity.js` 3,668 B,
`40-resume.js` 48,664 B, `50-loader.js` 22,346 B) answer with exactly the package byte sizes.

## Part 01, first launch (empty document)

- `xapiwrapper.min.js` and `xapi-720-l.js` requested at 196 ms from the `<head>` preload, before any image;
  `saveState720OnLeave` present; `XAPI_USING_G` true; state read 404 `absent`; 988 KB in 22 requests; no 4xx/5xx.

## Leave scenarios (part 01)

| Scenario | Done | Result |
|---|---|---|
| **nav** — `setUnitCharacter('character-1')`, `goTo(1)`, 1.5 s, `goTo(2)`, `location.reload()` in the same tick (the debounced write had not fired) | ✔ | relaunch landed on **screen 2**, Kata's document: `payload.currentScreen 2`, `ui.character character-1` — the leave save reached Kata through the keepalive path (on `-k` this landed one screen back) |
| **hidden** — `goTo(3)`, `visibilityState` faked to `hidden`, `visibilitychange` dispatched | ✔ | `stateLastResult720()` = `{op: 'leave', status: 204, ok: true, reason: 'ok'}` — one synchronous PUT, no fetch; the document read back 1.5 s later holds screen 3 |
| **answer** — answer an item and leave at once | not run | the answer commit path (`flushResumeSave`, page alive) is unchanged by this package; percent-03's live run covers it |
| **close** — close the tab | not run | inconclusive by construction (percent-03: a headless tab outlives the debounce) |

Firefox and Safari/iPad: not checked by hand (as for percent-03).
