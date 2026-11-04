// ============================================================
//  UNIT SHELL — yaad4-science-mass-weight-01 production root
//
//  Learner-facing: loads component 01 in a single full-viewport iframe
//  with no chrome. To a learner this is indistinguishable from opening
//  methodica-ar-science-mass-weight-01-01/index.html directly.
//
//  QA-facing: if this shell is itself embedded in a QA tool's iframe, it
//  bridges the SAME DEV_READY/DEV_STATE/DEV_GOTO/DEV_RESET postMessage
//  protocol every component already speaks (see each component's own
//  js/main.js, "DEV PROTOCOL BRIDGE" section) — in the SAME global screen
//  numbers (0..48, minus the missing 40) the components already use
//  internally. Unlike methodica-math-percent-06's unit-shell.js, there is
//  no local<->global offset translation here: unit-manifest.js is a pure
//  "which component owns global screen N" ownership lookup, so DEV_GOTO
//  is forwarded to a component with the SAME screen number the QA parent
//  sent, unchanged.
//
//  This file does not alter any component's own navigation — components
//  still do their own goToPrevComponent()/goToNextComponent()/
//  advanceToComponent03()/restartToComponent01() sibling-folder page
//  loads; the shell only observes the resulting iframe navigation and
//  re-syncs.
// ============================================================
(function () {
  'use strict';

  var MANIFEST = window.UNIT_MANIFEST;
  var COMPONENTS = MANIFEST.COMPONENTS;
  var TOTAL = MANIFEST.TOTAL_UNIT_SCREENS;

  var frame = document.getElementById('unit-frame');

  var currentComponentIndex = 0;   // which COMPONENTS[] entry the iframe currently shows
  var currentGlobal = COMPONENTS[0].screens[0]; // that component's own last-reported `current` (already global)
  var pendingGoto = null;          // global screen to send once the newly-loaded component's DEV_READY arrives
  var haveSeenReadyFor = -1;       // componentIndex we've received at least one DEV_READY/DEV_STATE for
  var componentScreenCache = {};   // componentIndex -> real {index,id}[] once known, for a richer global screen list

  var embeddedInParent = (window.parent !== window);

  // ---- component (child) -> shell ----------------------------------

  function isFromCurrentFrame(e) {
    return frame.contentWindow && e.source === frame.contentWindow;
  }

  window.addEventListener('message', function (e) {
    if (!e.data || !e.data.type) return;

    if (isFromCurrentFrame(e)) {
      handleComponentMessage(e.data);
      return;
    }

    if (embeddedInParent && e.source === window.parent) {
      handleParentMessage(e.data);
    }
  });

  var pathDetectionUnavailableWarned = false;

  // Ground truth for "which component is actually loaded": the iframe's own
  // location.pathname, read at message time (same-origin sibling folders,
  // so this is available). Falls back to reported-screen-membership
  // matching only if the read throws (unexpected origin restriction) or
  // matches no known component path.
  function detectComponentFromLocation() {
    var win = frame.contentWindow;
    if (!win) return -1;
    var path;
    try {
      path = win.location.pathname;
    } catch (err) {
      if (!pathDetectionUnavailableWarned) {
        pathDetectionUnavailableWarned = true;
        console.warn('[unit-shell] cannot read iframe location (origin-restricted); ' +
          'falling back to reported-screen membership to detect the active component.', err);
      }
      return -1;
    }
    for (var i = 0; i < COMPONENTS.length; i++) {
      var dir = COMPONENTS[i].path.split('/')[0];
      if (path.indexOf('/' + dir + '/') !== -1 || path.indexOf(dir + '/') === 0) return i;
    }
    return -1;
  }

  // Fallback identity check when the URL can't be read or matched. Percent-06
  // uses a {total, firstScreenId} fingerprint here, but Mass & Weight's
  // component 01 has no `id` on its first screen element, and its global
  // numbering makes a much simpler and more robust check available anyway:
  // does the reported `current` global screen actually belong to the
  // component we think is loaded?
  function componentMatches(componentIndex, data) {
    var c = COMPONENTS[componentIndex];
    if (!c) return false;
    if (typeof data.current !== 'number') return true; // nothing to contradict the assumption
    return c.screens.indexOf(data.current) !== -1;
  }

  function recoverComponentIndex(data) {
    if (typeof data.current !== 'number') return -1;
    var owner = MANIFEST.ownerOf(data.current);
    return owner; // -1 if the reported screen isn't a real screen of any component
  }

  function handleComponentMessage(data) {
    if (data.type !== 'DEV_READY' && data.type !== 'DEV_STATE') return;

    // Reconcile which component this actually is. Normally it's whatever
    // the shell itself last set as iframe.src (currentComponentIndex is
    // already correct) — but a component's OWN internal handoff
    // (goToNextComponent()/goToPrevComponent()/etc. doing
    // window.location.href on its own window) navigates the iframe without
    // the shell calling loadComponent(), so the DEV_READY that follows may
    // belong to a different component than the shell thinks. Resolve this
    // from the iframe's real URL first; only fall back to reported-screen
    // membership if the URL can't be read or doesn't match any known
    // component path.
    var detected = detectComponentFromLocation();
    if (detected !== -1) {
      currentComponentIndex = detected;
    } else if (!componentMatches(currentComponentIndex, data)) {
      var recovered = recoverComponentIndex(data);
      if (recovered !== -1) {
        currentComponentIndex = recovered;
      } else {
        console.warn('[unit-shell] could not identify active component from URL or reported screen; ' +
          'keeping previous component index (' + currentComponentIndex + ').', data);
      }
    }

    haveSeenReadyFor = currentComponentIndex;
    if (typeof data.current === 'number') currentGlobal = data.current;
    if (Array.isArray(data.screens)) componentScreenCache[currentComponentIndex] = data.screens;

    emitToParent(data.type, currentGlobal);

    if (data.type === 'DEV_READY' && pendingGoto !== null) {
      var n = pendingGoto;
      pendingGoto = null;
      frame.contentWindow.postMessage({ type: 'DEV_GOTO', screen: n }, '*');
    }
  }

  // ---- shell -> parent (QA) ------------------------------------------

  function buildGlobalScreenList() {
    var list = [];
    MANIFEST.ALL_SCREENS.forEach(function (n) {
      var ownerIndex = MANIFEST.ownerOf(n);
      var cached = componentScreenCache[ownerIndex];
      var found = cached && cached.filter(function (s) { return s.index === n; })[0];
      var id = found ? found.id : (COMPONENTS[ownerIndex].id + ':' + n);
      list.push({ index: n, id: id });
    });
    return list;
  }

  function emitToParent(type, globalCurrent) {
    if (!embeddedInParent) return;
    window.parent.postMessage({
      type: type,
      total: TOTAL,
      current: globalCurrent,
      screens: buildGlobalScreenList()
    }, '*');
  }

  // ---- parent (QA) -> shell -------------------------------------------

  function handleParentMessage(data) {
    if (data.type === 'DEV_GOTO') {
      var n = parseInt(data.screen, 10);
      if (isNaN(n)) return;
      if (!MANIFEST.isRealScreen(n)) {
        // Screen 40 (and any other non-existent global number) has no
        // owning component — forwarding it would either be silently
        // dropped by a component's own bounds check or, worse, pass that
        // check and then match no `data-screen` element, leaving nothing
        // `.active` (the same blank-screen failure the Component 06
        // restart-button bug produced). Refusing here keeps the currently
        // displayed screen on screen rather than going blank.
        console.warn('[unit-shell] DEV_GOTO requested non-existent screen ' + n + '; ignoring.');
        return;
      }
      gotoGlobal(MANIFEST.ownerOf(n), n);
    } else if (data.type === 'DEV_RESET') {
      // Reset is scoped to "the current screen/component" in the existing
      // protocol (see each component's resetScreenState(currentScreen)) —
      // no global reset concept exists or is asked for, so just forward.
      frame.contentWindow.postMessage({ type: 'DEV_RESET' }, '*');
    }
  }

  function gotoGlobal(componentIndex, globalScreen) {
    if (componentIndex === currentComponentIndex && haveSeenReadyFor === currentComponentIndex) {
      frame.contentWindow.postMessage({ type: 'DEV_GOTO', screen: globalScreen }, '*');
    } else {
      pendingGoto = globalScreen;
      loadComponent(componentIndex);
    }
  }

  function loadComponent(index) {
    currentComponentIndex = index;
    haveSeenReadyFor = -1; // wait for a fresh DEV_READY from the newly-loaded document
    /* ?dev=1: since 2026-09-16 a part hops to its neighbour only under DEV_NAV (the platform owns
       routing in production — unit-js/10-identity.js), so this QA shell opts every part in. */
    frame.src = COMPONENTS[index].path + '?dev=1';
  }

  // ---- initial state ---------------------------------------------------
  // No optimistic DEV_READY here. The manifest's total (48) is known
  // immediately, but the global `screens` list is only trustworthy once
  // component 01 itself has reported in — before that, its 15-entry
  // segment would be nothing but 'id:n' placeholders with no real ids.
  // Every component fires its own DEV_READY unconditionally as soon as it
  // loads inside a frame (see each component's own js/main.js, "DEV
  // PROTOCOL BRIDGE" section) — that arrives at handleComponentMessage()
  // above, which is the FIRST point this shell emits anything to its own
  // parent. No timeout — purely event-driven on component 01's real
  // DEV_READY.
  loadComponent(0);
})();
