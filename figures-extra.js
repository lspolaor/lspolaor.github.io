/* Extra figures for research.html, drawn when a paper summary opens.
   New figure keys go in FIG below; figures.js handles all the others. */
(function () {
  'use strict';

  var W = 360, H = 225;
  var C = { ink: '#1f2430', mute: '#6f7684', faint: '#c3c8d0', blue: '#2f5f9e', blueL: '#d6e3f3',
    orange: '#c4622d', purple: '#6a4ea0', purpleL: '#e5def2', goldL: '#f2e6c2', red: '#c0392b', paper: '#ffffff' };
  var SERIF = 'Source Serif 4, Georgia, serif';

  function n1(v) { return Math.round(v * 10) / 10; }
  function D(pts) {
    var s = '', i;
    for (i = 0; i < pts.length; i++) { s += (i ? 'L' : 'M') + n1(pts[i][0]) + ' ' + n1(pts[i][1]); }
    return s;
  }
  function path(d, stroke, sw, fill, dash) {
    return '<path d="' + d + '" fill="' + (fill || 'none') + '" stroke="' + (stroke || 'none') + '" stroke-width="' + (sw || 1) +
      '" stroke-linejoin="round" stroke-linecap="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
  }
  function dot(x, y, r, fill) { return '<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + r + '" fill="' + fill + '" stroke="' + C.paper + '" stroke-width="1.3"/>'; }
  function txt(x, y, s, fill, anchor) {
    return '<text x="' + n1(x) + '" y="' + n1(y) + '" font-family="' + SERIF + '" font-size="12" fill="' + (fill || C.mute) + '" text-anchor="' + (anchor || 'start') + '">' + s + '</text>';
  }
  function sample(a, b, n, f) { var out = [], i; for (i = 0; i <= n; i++) { out.push(f(a + (b - a) * i / n)); } return out; }

  /* Two sheets close to a plane counted twice, joined by catenoidal necks (or with floating
     disks between them) accumulating at a flat singular point. */
  function necks(v) {
    var X = function (x) { return 180 + 100 * x; }, Y = function (y) { return 112 - 100 * y; };
    function gap(x) { return 0.01 + 0.09 * Math.pow(Math.abs(x), 1.2); }
    var items = [], k, s = '';
    for (k = 0; k < 9; k++) {
      var xk = 1.4 * Math.pow(0.5, k);
      items.push({ x: -xk, kind: 'neck' });
      items.push({ x: xk, kind: v === 'mixed' ? 'disk' : 'neck' });
    }
    items.forEach(function (it) {
      it.h = gap(it.x); it.a = it.h / 2.2; it.w = it.kind === 'neck' ? it.a * Math.cosh(2.2) : 0;
    });
    function inHole(x) { return items.some(function (it) { return it.w && Math.abs(x - it.x) < it.w; }); }
    function sheet(sign) {
      var d = '', on = false, x;
      for (x = -1.75; x <= 1.7501; x += 0.004) {
        if (inHole(x)) { on = false; continue; }
        d += (on ? 'L' : 'M') + n1(X(x)) + ' ' + n1(Y(sign * gap(x)));
        on = true;
      }
      return d;
    }
    var up = sample(-1.75, 1.75, 240, function (x) { return [X(x), Y(gap(x))]; });
    var lo = sample(1.75, -1.75, 240, function (x) { return [X(x), Y(-gap(x))]; });
    s += path(D(up.concat(lo)) + 'Z', 'none', 0, C.goldL);
    s += path('M' + X(-1.75) + ' ' + Y(0) + 'L' + X(1.75) + ' ' + Y(0), C.faint, 1, 'none', '4 4');
    items.forEach(function (it) {
      if (it.kind === 'neck') {
        var left = sample(-it.h, it.h, 24, function (y) { return [X(it.x - it.a * Math.cosh(y / it.a)), Y(y)]; });
        var right = sample(-it.h, it.h, 24, function (y) { return [X(it.x + it.a * Math.cosh(y / it.a)), Y(y)]; });
        s += path(D(left.concat(right.slice().reverse())) + 'Z', 'none', 0, C.purpleL);
        s += path(D(left), C.purple, 1.6) + path(D(right), C.purple, 1.6);
      } else {
        s += path('M' + X(it.x - 1.6 * it.h) + ' ' + Y(0) + 'L' + X(it.x + 1.6 * it.h) + ' ' + Y(0), C.orange, 2.2);
      }
    });
    s += path(sheet(1), C.blue, 2) + path(sheet(-1), C.blue, 2);
    s += dot(X(0), Y(0), 3.6, C.red);
    if (v === 'mixed') {
      s += txt(X(-0.95), Y(0.36), 'catenoidal necks', C.purple, 'middle');
      s += txt(X(0.95), Y(0.36), 'floating disks', C.orange, 'middle');
    } else {
      s += txt(X(0), Y(0.4), 'infinitely many necks', C.purple, 'middle');
    }
    s += txt(X(1.72), Y(0) + 40, 'plane counted twice', C.mute, 'end');
    return s;
  }

  var FIG = {
    'necks-disks': function () { return necks('mixed'); },
    'necks': function () { return necks('both'); }
  };

  function draw(fig) {
    var key = fig.getAttribute('data-fig'), art = fig.querySelector('.pf-art'), cap = fig.querySelector('figcaption');
    if (!key || !art || fig.getAttribute('data-drawn') || !FIG[key]) { return; }
    var label = cap ? cap.textContent.replace(/"/g, '') : '';
    art.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + label + '" xmlns="http://www.w3.org/2000/svg">' + FIG[key]() + '</svg>';
    fig.setAttribute('data-drawn', '1');
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('details.pub-more'), function (d) {
      var f = d.querySelector('figure[data-fig]');
      if (!f || !FIG[f.getAttribute('data-fig')]) { return; }
      d.addEventListener('toggle', function () { if (d.open) { draw(f); } });
      if (d.open) { draw(f); }
    });
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
