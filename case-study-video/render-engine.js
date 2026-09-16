(function () {
  var isCapture = /[?&]capture=1/.test(location.search);
  if (!isCapture) return;

  document.body.classList.add('capture-mode');

  // ---- generic cubic-bezier evaluator (Newton-Raphson on x, then evaluate y) ----
  function makeBezier(x1, y1, x2, y2) {
    function bezierCoord(t, a1, a2) {
      var cx = 3 * a1, bx = 3 * (a2 - a1) - cx, ax = 1 - cx - bx;
      return ((ax * t + bx) * t + cx) * t;
    }
    function bezierSlope(t, a1, a2) {
      var cx = 3 * a1, bx = 3 * (a2 - a1) - cx, ax = 1 - cx - bx;
      return (3 * ax * t + 2 * bx) * t + cx;
    }
    return function (p) {
      if (p <= 0) return 0;
      if (p >= 1) return 1;
      var t = p;
      for (var i = 0; i < 8; i++) {
        var x = bezierCoord(t, x1, x2) - p;
        var d = bezierSlope(t, x1, x2);
        if (Math.abs(d) < 1e-6) break;
        t -= x / d;
      }
      return bezierCoord(t, y1, y2);
    };
  }

  var EASE_ENTER = makeBezier(0.16, 1, 0.3, 1);      // scene + element entrances
  var EASE_EXIT = makeBezier(0.25, 0.1, 0.25, 1);     // scene exit (native 'ease')
  var EASE_POP = makeBezier(0.34, 1.56, 0.64, 1);     // stat/card pop overshoot

  function lerp(a, b, p) { return a + (b - a) * p; }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

  var DURATIONS = window.__DURATIONS__;
  var starts = window.__STARTS__;
  var SCENE_ENTER_MS = 600;
  var SCENE_EXIT_MS = 380;

  var scenes = [];
  for (var i = 1; i <= 9; i++) scenes.push(document.getElementById('scene' + i));

  // ---- reveal element groups per scene: [selector, {delayBase, delayStep, duration, fromY, fromScale}] ----
  function collect(sceneEl, selector) {
    return Array.prototype.slice.call(sceneEl.querySelectorAll(selector));
  }

  function iOf(el) {
    var v = getComputedStyle(el).getPropertyValue('--i');
    var n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }

  function buildRevealList(sceneEl) {
    var list = [];

    var eyebrow = sceneEl.querySelector('.eyebrow, .section-tag');
    if (eyebrow) list.push({ el: eyebrow, delay: 50, duration: 700, fromY: 16 });

    var headline = sceneEl.querySelector('.headline');
    if (headline) list.push({ el: headline, delay: 220, duration: 850, fromY: 28 });

    var sub = sceneEl.querySelector('.subhead, .body-text');
    if (sub && !sub.classList.contains('pull-quote')) list.push({ el: sub, delay: 420, duration: 800, fromY: 24 });

    var pullQuote = sceneEl.querySelector('.pull-quote');
    if (pullQuote) list.push({ el: pullQuote, delay: 420, duration: 850, fromY: 24 });

    collect(sceneEl, '.pair-row').forEach(function (el) {
      list.push({ el: el, delay: 600 + iOf(el) * 220, duration: 700, fromY: 30 });
    });

    collect(sceneEl, '.card-row .card').forEach(function (el) {
      var isEmph = el.classList.contains('emph');
      list.push({
        el: el, delay: 550 + iOf(el) * 180, duration: 750, fromY: 30,
        fromScale: isEmph ? 1.03 : null, toScale: isEmph ? 1 : null,
      });
    });

    collect(sceneEl, '.col-panel.reveal').forEach(function (el) {
      list.push({ el: el, delay: 550 + iOf(el) * 160, duration: 700, fromY: 30 });
    });

    collect(sceneEl, '.step-card.reveal').forEach(function (el) {
      list.push({ el: el, delay: 550 + iOf(el) * 160, duration: 700, fromY: 30 });
    });

    collect(sceneEl, '.step-arrow').forEach(function (el) {
      list.push({ el: el, delay: 900 + iOf(el) * 220, duration: 500, fromY: 0 });
    });

    collect(sceneEl, '.tool-card.reveal').forEach(function (el) {
      list.push({ el: el, delay: 550 + iOf(el) * 130, duration: 650, fromY: 26 });
    });

    collect(sceneEl, '.panel.reveal').forEach(function (el) {
      list.push({ el: el, delay: 550 + iOf(el) * 160, duration: 700, fromY: 30 });
    });

    collect(sceneEl, '.meta-item').forEach(function (el) {
      list.push({ el: el, delay: 900 + iOf(el) * 140, duration: 650, fromY: 18 });
    });

    collect(sceneEl, '.stat-card').forEach(function (el) {
      list.push({ el: el, delay: 550 + iOf(el) * 160, duration: 700, fromY: 24, fromScale: 0.94, toScale: 1, pop: true });
    });

    collect(sceneEl, '.outcome-card').forEach(function (el) {
      list.push({ el: el, delay: 500 + iOf(el) * 160, duration: 700, fromY: 26 });
    });

    var closingQuote = sceneEl.querySelector('.closing-quote');
    if (closingQuote) list.push({ el: closingQuote, delay: 1350, duration: 800, fromY: 24 });

    var closingCredit = sceneEl.querySelector('.closing-credit');
    if (closingCredit) list.push({ el: closingCredit, delay: 1650, duration: 700, fromY: 16 });

    return list;
  }

  scenes.forEach(function (s) { s._revealList = buildRevealList(s); });

  function setEl(el, opacity, translateY, scale) {
    var tf = '';
    if (scale !== undefined && scale !== null) tf += 'scale(' + scale + ') ';
    tf += 'translateY(' + translateY + 'px)';
    el.style.opacity = opacity;
    el.style.transform = tf;
  }

  function renderReveal(item, localMs) {
    var t = localMs - item.delay;
    var fromY = item.fromY || 0;
    var fromScale = item.fromScale != null ? item.fromScale : null;
    var toScale = item.toScale != null ? item.toScale : null;
    if (t <= 0) {
      setEl(item.el, 0, fromY, fromScale);
      return;
    }
    if (t >= item.duration) {
      setEl(item.el, 1, 0, toScale);
      return;
    }
    var p = t / item.duration;
    var eased = (item.pop ? EASE_POP : EASE_ENTER)(p);
    var y = lerp(fromY, 0, eased);
    var scale = fromScale != null ? lerp(fromScale, toScale, eased) : null;
    setEl(item.el, clamp01(eased), y, scale);
  }

  function renderBgShapes(sceneEl, localMs) {
    var shapes = collect(sceneEl, '.bg-shape');
    shapes.forEach(function (shape) {
      var extraDelay = shape.classList.contains('active-delay') ? 300 : 0;
      var t = localMs - extraDelay;
      var dur = 9500;
      var p = clamp01(t / dur);
      var opacity = t <= 0 ? 0 : (p < 0.15 ? (t / (dur * 0.15)) : 1);
      var eased = EASE_EXIT(p);
      var scale = lerp(0.82, 1.06, eased);
      var tx = lerp(0, -18, eased);
      var ty = lerp(0, 14, eased);
      shape.style.opacity = t <= 0 ? 0 : clamp01(opacity);
      shape.style.transform = 'scale(' + scale + ') translate(' + tx + 'px,' + ty + 'px)';
    });
  }

  window.renderFrame = function (ms) {
    scenes.forEach(function (sceneEl, i) {
      var sceneStart = starts[i];
      var sceneDur = DURATIONS[i];
      var isLast = i === scenes.length - 1;
      var sceneEnd = sceneStart + sceneDur;

      var opacity, scale, ty;

      if (ms < sceneStart) {
        opacity = 0; scale = 0.985; ty = -12;
      } else if (ms < sceneStart + SCENE_ENTER_MS) {
        var p = (ms - sceneStart) / SCENE_ENTER_MS;
        var eased = EASE_ENTER(p);
        opacity = eased; scale = lerp(0.985, 1, eased); ty = lerp(-12, 0, eased);
      } else if (isLast || ms < sceneEnd) {
        opacity = 1; scale = 1; ty = 0;
      } else if (ms < sceneEnd + SCENE_EXIT_MS) {
        var pe = (ms - sceneEnd) / SCENE_EXIT_MS;
        var easedE = EASE_EXIT(pe);
        opacity = 1 - easedE; scale = lerp(1, 0.985, easedE); ty = lerp(0, -12, easedE);
      } else {
        opacity = 0; scale = 0.985; ty = -12;
      }

      sceneEl.style.opacity = opacity;
      sceneEl.style.transform = 'scale(' + scale + ') translateY(' + ty + 'px)';
      sceneEl.style.zIndex = ms >= sceneStart && (isLast || ms < sceneEnd + SCENE_EXIT_MS) ? 2 : 1;

      if (opacity > 0) {
        var localMs = ms - sceneStart;
        renderBgShapes(sceneEl, localMs);
        sceneEl._revealList.forEach(function (item) { renderReveal(item, localMs); });
      }
    });
  };

  window.renderFrame(0);
})();
