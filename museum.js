/* Музей пивной атрибутики — анимации и мелкие удобства */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  /* --- появление блоков при прокрутке --- */
  var groups = [
    '.keyfacts li', '.story h2', '.story .text p', '.passport', '.pager',
    '.sec-head', '.hall', '.card', '.rules > div', '.ticket > div', '.timeline'
  ];
  var els = [];
  groups.forEach(function (sel) {
    var list = document.querySelectorAll(sel);
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      el.classList.add('reveal');
      var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--d', Math.min(idx % 8, 7) * 70 + 'ms');
      els.push(el);
    }
  });
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    els.forEach(function (el) { io.observe(el); });
    /* страховка: всё, что уже выше нижнего края экрана, — показать */
    var sweep = function () {
      var lim = window.innerHeight;
      for (var i = 0; i < els.length; i++) {
        if (!els[i].classList.contains('in') && els[i].getBoundingClientRect().top < lim) els[i].classList.add('in');
      }
    };
    var st = false;
    window.addEventListener('scroll', function () { if (!st) { st = true; setTimeout(function () { sweep(); st = false; }, 120); } }, { passive: true });
    window.addEventListener('load', sweep);
    window.addEventListener('hashchange', function () { setTimeout(sweep, 60); });
  }
  window.addEventListener('beforeprint', function () { els.forEach(function (el) { el.classList.add('in'); }); });

  /* --- полоса прогресса чтения --- */
  var bar = document.querySelector('.progress');
  if (bar) {
    var tick = false;
    var upd = function () {
      var h = root.scrollHeight - root.clientHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, root.scrollTop / h) : 0) + ')';
      tick = false;
    };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* --- объёмный наклон витрины за курсором (только мышь) --- */
  var photo = document.querySelector('.photo');
  if (photo && !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var art = photo.querySelector('.mugart');
    photo.addEventListener('pointermove', function (e) {
      var r = photo.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      if (art) art.style.setProperty('--tilt', 'perspective(700px) rotateY(' + (x * 16).toFixed(2) + 'deg) rotateX(' + (-y * 12).toFixed(2) + 'deg)');
      photo.style.setProperty('--mx', (x + 0.5) * 100 + '%');
      photo.style.setProperty('--my', (y + 0.5) * 100 + '%');
    });
    photo.addEventListener('pointerleave', function () { if (art) art.style.removeProperty('--tilt'); });
  }

  /* --- счётчики на главной --- */
  var nums = document.querySelectorAll('.ticket b[data-count]');
  if (nums.length && !reduce && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, to = +el.dataset.count, t0 = null;
        var step = function (t) {
          if (!t0) t0 = t;
          var k = Math.min(1, (t - t0) / 1400), v = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(to * v);
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.6 });
    for (var n = 0; n < nums.length; n++) { nums[n].textContent = '0'; cio.observe(nums[n]); }
  }
})();
