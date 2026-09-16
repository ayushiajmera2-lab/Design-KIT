(function () {
  var DURATIONS = [6000, 6200, 6200, 5600, 6800, 6800, 6200, 5600, 6800];

  var scenes = [];
  for (var i = 1; i <= 9; i++) {
    scenes.push(document.getElementById('scene' + i));
  }

  var starts = [];
  var t = 0;
  DURATIONS.forEach(function (d) {
    starts.push(t);
    t += d;
  });
  var totalMs = t + 500;
  window.__TOTAL_MS__ = totalMs;
  window.__DURATIONS__ = DURATIONS;
  window.__STARTS__ = starts;

  window.startTimeline = function () {
    if (window.__STARTED__) return;
    window.__STARTED__ = true;
    scenes.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add('active');
      }, starts[i]);
      setTimeout(function () {
        el.classList.remove('active');
      }, starts[i] + DURATIONS[i]);
    });
    setTimeout(function () {
      window.__VIDEO_DONE__ = true;
      document.title = 'DONE';
    }, totalMs);
  };

  // Live-preview mode (opened directly in a browser): auto-play using real-time CSS animation.
  // Capture mode (?capture=1) is driven frame-by-frame by render-engine.js instead.
  var isCapture = /[?&]capture=1/.test(location.search);
  if (!isCapture) {
    window.startTimeline();
  }
})();
