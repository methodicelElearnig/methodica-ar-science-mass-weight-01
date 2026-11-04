// ============================================================
//  UNIT MANIFEST — yaad4-science-mass-weight-01
//  Single source of truth for "how many components, which global screen
//  numbers each one owns" — read by the production root shell (index.html +
//  unit-shell.js) to know which component folder to load for a given
//  global screen, WITHOUT ever needing to load all 6 component iframes
//  simultaneously just to sum their live DEV_READY totals.
//
//  Unlike methodica-math-percent-06 (whose components each restart their
//  own screen numbering at 0, requiring a local<->global offset
//  conversion), Mass & Weight's components already carry GLOBAL
//  `data-screen` values baked into their own HTML/JS (see each
//  component's js/main.js — `goTo(n)` matches by `data-screen` value, not
//  DOM position). So this manifest does no offset arithmetic at all — it
//  is purely an ownership lookup: "which component owns global screen N".
//
//  `screens` is an EXPLICIT array of the real global screen numbers each
//  component renders — not a [start, end] range — because component 05's
//  real screens are 35,36,37,38,41,43: screen 40 was removed as an
//  orphaned/fabricated screen, and screens 39 and 42 (the sugar-cube and
//  moon advanced questions) were later cut from the unit — none of the
//  three must ever be treated as if they exist (see
//  methodica-ar-science-mass-weight-01-05/index.html, the removed-screen
//  comments near data-screen="40"/"39"/"42"). Expanding a numeric range
//  would silently invent these phantom screens; an explicit array cannot.
// ============================================================
(function (global) {
  'use strict';

  // Trailing-slash directory form, not an explicit '.../index.html' filename:
  // some static hosts (e.g. the local `serve` dev server) 301-redirect a
  // request for '.../index.html' to the bare directory path WITHOUT a
  // trailing slash ('.../methodica-ar-science-mass-weight-01-01', no slash) —
  // the browser then resolves that component's own relative <script>/<link>
  // tags one directory too shallow, loading the wrong files entirely. A
  // trailing-slash request is never subject to that redirect (there's no
  // '.html' to strip) and every static host already auto-serves index.html
  // for a directory request, so this is strictly safer with no downside.
  var COMPONENTS = [
    { id: '01', path: 'methodica-ar-science-mass-weight-01-01/', screens: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14] },
    { id: '02', path: 'methodica-ar-science-mass-weight-01-02/', screens: [15,16,17,18,19,20,21,22,23] },
    { id: '03', path: 'methodica-ar-science-mass-weight-01-03/', screens: [24,25,26,27,28,29] },
    { id: '04', path: 'methodica-ar-science-mass-weight-01-04/', screens: [31,32,33,34] },
    { id: '05', path: 'methodica-ar-science-mass-weight-01-05/', screens: [35,36,37,38,41,43] },
    // Component 06 ends on Peak Q3 (47): both Peak end screens
    // ("End — Failure" 48 / "End — Success" 49) were removed per stakeholder
    // request. Peak Q3's continue button ("סיימתי") now finishes the unit
    // directly (restartToComponent01()).
    { id: '06', path: 'methodica-ar-science-mass-weight-01-06/', screens: [44,45,46,47] }
  ];

  // Flat "which component owns this global screen" lookup — built once,
  // never recomputed. No offset field: a global screen number IS the
  // number every component already uses internally, so there is nothing
  // to translate.
  var screenOwner = {};
  COMPONENTS.forEach(function (c, i) {
    c.screens.forEach(function (n) { screenOwner[n] = i; });
  });

  var ALL_SCREENS = Object.keys(screenOwner).map(Number).sort(function (a, b) { return a - b; });
  var TOTAL_UNIT_SCREENS = ALL_SCREENS.length; // real screens 0-47 minus the missing 30, 39, 40, 42 (Peak end screens 48/49 removed)

  function ownerOf(globalScreen) {
    return Object.prototype.hasOwnProperty.call(screenOwner, globalScreen) ? screenOwner[globalScreen] : -1;
  }

  function isRealScreen(globalScreen) {
    return ownerOf(globalScreen) !== -1;
  }

  global.UNIT_MANIFEST = {
    COMPONENTS: COMPONENTS,
    ALL_SCREENS: ALL_SCREENS,
    TOTAL_UNIT_SCREENS: TOTAL_UNIT_SCREENS,
    ownerOf: ownerOf,
    isRealScreen: isRealScreen
  };
})(window);
