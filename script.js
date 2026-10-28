/* ==========================================================
   Our First Month Together — behaviour (no audio anywhere)
   ========================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Intro: open the letter ---------- */
  var intro = document.getElementById('intro');
  var openBtn = document.getElementById('openBtn');
  openBtn.addEventListener('click', function () {
    intro.classList.add('open');
    document.body.classList.remove('locked');
    window.scrollTo(0, 0);
    setTimeout(function () { intro.style.display = 'none'; }, 1800);
  });

  /* ---------- Starry sky with soft glowing particles ---------- */
  var canvas = document.getElementById('sky');
  var ctx = canvas.getContext('2d');
  var stars = [];

  function resize() {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = Math.min(140, Math.floor(window.innerWidth * window.innerHeight / 9000));
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.2 + .2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * .0008 + .0003,
        glow: Math.random() < .12,           // a few soft glowing particles
        drift: Math.random() * .08 + .02
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    stars.forEach(function (s) {
      var a = .35 + .55 * Math.abs(Math.sin(t * s.speed + s.phase));
      if (!reduceMotion) { s.y -= s.drift * .15; if (s.y < -5) s.y = window.innerHeight + 5; }
      ctx.beginPath();
      if (s.glow) {
        var g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 9);
        g.addColorStop(0, 'rgba(217,163,184,' + (a * .35) + ')');
        g.addColorStop(1, 'rgba(217,163,184,0)');
        ctx.fillStyle = g;
        ctx.arc(s.x, s.y, s.r * 9, 0, Math.PI * 2);
      } else {
        ctx.fillStyle = 'rgba(232,237,246,' + a + ')';
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      }
      ctx.fill();
    });
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);

  /* ---------- Slow floating hearts ---------- */
  var heartLayer = document.getElementById('hearts');
  function spawnHeart() {
    if (reduceMotion || document.hidden) return;
    var h = document.createElement('span');
    h.textContent = Math.random() < .7 ? '♡' : '♥';
    h.className = 'float-heart';
    h.style.left = (Math.random() * 100) + 'vw';
    h.style.fontSize = (10 + Math.random() * 14) + 'px';
    h.style.setProperty('--sway', ((Math.random() - .5) * 120) + 'px');
    h.style.animationDuration = (14 + Math.random() * 10) + 's';
    heartLayer.appendChild(h);
    setTimeout(function () { h.remove(); }, 25000);
  }
  setInterval(spawnHeart, 2200);

  /* ---------- Scroll reveals (timeline and finale appear one by one) ---------- */
  function stagger(list, step) {
    list.forEach(function (el, i) { el.style.transitionDelay = (i * step) + 's'; });
  }
  stagger(Array.prototype.slice.call(document.querySelectorAll('.memory')), 0);

  // Finale: each line arrives in its own time, building to the last words.
  var seq = Array.prototype.slice.call(document.querySelectorAll('.seq'));
  var seqDelays = [0, .8, 2.2, 3.8, 5.6, 7.6];
  seq.forEach(function (el, i) { el.style.transitionDuration = '2.2s'; el.style.transitionDelay = (seqDelays[i] || 0) + 's'; });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      if (e.target.id === 'finale') {
        seq.forEach(function (el) { el.classList.add('in'); });
      } else {
        e.target.classList.add('in');
      }
      io.unobserve(e.target);
    });
  }, { threshold: .25 });

  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  io.observe(document.getElementById('finale'));

  /* ---------- Live counter since October 1st, 2026 ---------- */
  var start = new Date(2026, 9, 1, 0, 0, 0).getTime(); // months are 0-indexed
  var cD = document.getElementById('cDays');
  var cH = document.getElementById('cHours');
  var cM = document.getElementById('cMinutes');
  var cS = document.getElementById('cSeconds');

  function tick() {
    var diff = Math.max(0, Math.floor((Date.now() - start) / 1000));
    cD.textContent = Math.floor(diff / 86400);
    cH.textContent = Math.floor(diff % 86400 / 3600);
    cM.textContent = Math.floor(diff % 3600 / 60);
    cS.textContent = diff % 60;
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Fullscreen photo viewer ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = lb.querySelector('img');
  var lbList = [], lbIndex = 0;

  function showLb(i) {
    lbIndex = (i + lbList.length) % lbList.length;
    lbImg.src = lbList[lbIndex];
  }
  function closeLb() { lb.hidden = true; if (document.getElementById('galleryView').hidden) document.body.classList.remove('locked'); }
  lb.querySelector('.lb-close').addEventListener('click', closeLb);
  lb.querySelector('.lb-prev').addEventListener('click', function () { showLb(lbIndex - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { showLb(lbIndex + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
    if (e.key === 'ArrowRight') showLb(lbIndex + 1);
  });

  function checkImage(src) {
    return new Promise(function (resolve) {
      var im = new Image();
      im.onload = function () { resolve(src); };
      im.onerror = function () { resolve(null); };
      im.src = src;
    });
  }

  /* ---------- Heart bouquet gallery ----------
     Photos: photos/bouquet-1.jpg ... bouquet-7.jpg. Missing ones show a
     midnight-blue heart, so the bouquet shape is always complete.
     Each slot is [centre x, centre y, size] in a 100 x 120 box. */
  var BOUQUET = [
    'photos/bouquet-1.jpg', 'photos/bouquet-2.jpg', 'photos/bouquet-3.jpg', 'photos/bouquet-4.jpg',
    'photos/bouquet-5.jpg', 'photos/bouquet-6.jpg', 'photos/bouquet-7.jpg'
  ];
  var SLOTS = [[50, 20, 36], [25, 32, 28], [75, 32, 28], [12, 56, 22], [88, 56, 22], [34, 58, 26], [66, 58, 26]];

  var bBox = document.getElementById('bouquetBox');
  if (bBox) {
    // Stems curve down to one point, tied with a little bow
    var svg = '<svg class="stems" viewBox="0 0 100 120" aria-hidden="true" fill="none" stroke="#9fb0cc" stroke-opacity=".5" stroke-width=".5">';
    SLOTS.forEach(function (p) {
      var by = p[1] + p[2] * .47;
      svg += '<path d="M50 104 C50 ' + ((104 + by) / 2 + 8) + ' ' + p[0] + ' ' + (by + 16) + ' ' + p[0] + ' ' + by + '"/>';
    });
    svg += '<g fill="#d9a3b8" stroke="#d9a3b8" stroke-opacity=".9"><path d="M50 104 C40 96 38 108 50 106 C62 108 60 96 50 104Z" stroke-width=".3"/>' +
           '<path d="M48 106 L43 117 M52 106 L57 117" stroke-width=".8" fill="none"/></g></svg>';
    bBox.innerHTML = svg;

    Promise.all(BOUQUET.map(checkImage)).then(function (list) {
      var loaded = list.filter(Boolean);
      SLOTS.forEach(function (p, i) {
        var btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'hp';
        btn.style.width = p[2] + '%';
        btn.style.left = (p[0] - p[2] / 2) + '%';
        btn.style.top = ((p[1] - p[2] / 2) / 1.2) + '%';
        btn.style.animationDelay = (-i * 1.3) + 's';
        if (list[i]) {
          var img = document.createElement('img');
          img.src = list[i]; img.alt = 'Our memory ' + (i + 1);
          btn.appendChild(img);
          btn.setAttribute('aria-label', 'Open photo ' + (i + 1));
          btn.addEventListener('click', function () {
            lbList = loaded; showLb(loaded.indexOf(list[i])); lb.hidden = false; document.body.classList.add('locked');
          });
        } else {
          var ph = document.createElement('span');
          ph.className = 'ph'; ph.textContent = '\u2661';
          btn.appendChild(ph);
          btn.setAttribute('aria-label', 'Photo coming soon');
          btn.disabled = true; btn.style.cursor = 'default';
        }
        bBox.appendChild(btn);
      });
    });
  }

  /* ---------- Open / close the gallery ---------- */
  var gView = document.getElementById('galleryView');
  var gBtn = document.getElementById('galleryBtn');
  function openGallery() {
    gView.hidden = false; document.body.classList.add('locked');
    gView.scrollTop = 0; document.getElementById('galleryClose').focus();
  }
  function closeGallery() {
    gView.hidden = true; document.body.classList.remove('locked'); gBtn.focus();
  }
  gBtn.addEventListener('click', openGallery);
  document.getElementById('galleryClose').addEventListener('click', closeGallery);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !gView.hidden && lb.hidden) closeGallery();
  });
})();
