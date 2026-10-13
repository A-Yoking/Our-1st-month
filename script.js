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
  stagger(Array.prototype.slice.call(document.querySelectorAll('.card')), .25);

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
})();
