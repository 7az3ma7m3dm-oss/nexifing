(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* LOADER */
  (function () {
    var loaderEl = $('#loader'), fillEl = $('#loaderFill'), textEl = $('#loaderText');
    if (!loaderEl || !fillEl) return;
    var progress = 0, msgs = ['LOADING', 'ALMOST READY', 'DONE'], i = 0;
    var tick = setInterval(function () {
      progress += Math.random() * 8 + 3;
      if (progress > 90) progress = 90;
      fillEl.style.width = progress + '%';
      var n = Math.min(msgs.length - 1, Math.floor((progress / 100) * msgs.length));
      if (n !== i && textEl) { i = n; textEl.textContent = msgs[i]; }
    }, 90);
    var done = false;
    function finish() {
      if (done) return; done = true;
      clearInterval(tick);
      fillEl.style.width = '100%';
      if (textEl) textEl.textContent = msgs[msgs.length - 1];
      setTimeout(function () { loaderEl.classList.add('hidden'); }, 320);
    }
    if (document.readyState === 'complete') setTimeout(finish, 500);
    else window.addEventListener('load', function () { setTimeout(finish, 500); });
    setTimeout(finish, 4500);
  })();

    /* CURSOR — upgraded with glow, trail, states */
  (function () {
    if (isTouch || reducedMotion) return;

    var dot   = $('#cursorDot');
    var ring  = $('#cursorRing');
    var glow  = $('#cursorGlow');
    var trail = $('#cursorTrail');

    if (!dot || !ring || !glow || !trail) return;

    var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    var dotPos   = { x: mouse.x, y: mouse.y };
    var ringPos  = { x: mouse.x, y: mouse.y };
    var glowPos  = { x: mouse.x, y: mouse.y };
    var trailPos = { x: mouse.x, y: mouse.y };
    var lastTrail = 0;

    document.body.classList.add('cursor-active');

    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Spawn trail dots as the cursor moves
      var now = Date.now();
      if (now - lastTrail > 55) {
        lastTrail = now;
        spawnTrail(mouse.x, mouse.y);
      }
    }, { passive: true });

    // Track hover targets — links, buttons, inputs
    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      if (!t.closest) return;

      if (t.closest('a, button, .btn, summary, [role="button"], .work-card, .service')) {
        document.body.classList.add('cursor-hovering');
      } else if (t.closest('input, textarea, [contenteditable]')) {
        document.body.classList.add('cursor-text');
      }
    });

    document.addEventListener('mouseout', function (e) {
      var t = e.target;
      if (!t.closest) return;

      if (t.closest('a, button, .btn, summary, [role="button"], .work-card, .service')) {
        document.body.classList.remove('cursor-hovering');
      } else if (t.closest('input, textarea, [contenteditable]')) {
        document.body.classList.remove('cursor-text');
      }
    });

    // Press state
    window.addEventListener('mousedown', function () {
      document.body.classList.add('cursor-pressing');
    });
    window.addEventListener('mouseup', function () {
      document.body.classList.remove('cursor-pressing');
    });

    // Window enter / leave
    document.addEventListener('mouseleave', function () {
      document.body.classList.add('cursor-hidden');
    });
    document.addEventListener('mouseenter', function () {
      document.body.classList.remove('cursor-hidden');
    });

    // Trail spawning
    function spawnTrail(x, y) {
      var t = document.createElement('div');
      t.className = 'cursor-trail-particle';
      t.style.cssText =
        'position:fixed;top:0;left:0;width:8px;height:8px;' +
        'border-radius:50%;pointer-events:none;z-index:9996;' +
        'background:radial-gradient(circle,rgba(56,189,248,.7) 0%,rgba(56,189,248,0) 70%);' +
        'transform:translate(' + (x - 4) + 'px,' + (y - 4) + 'px);' +
        'transition:opacity .6s ease,transform .6s ease;' +
        'opacity:1;';
      document.body.appendChild(t);

      // Fade + drift
      requestAnimationFrame(function () {
        t.style.opacity = '0';
        t.style.transform = 'translate(' + (x - 4) + 'px,' + (y + 8) + 'px) scale(.4)';
      });

      setTimeout(function () {
        if (t.parentNode) t.parentNode.removeChild(t);
      }, 700);
    }

    // Smooth animation loop
    function loop() {
      dotPos.x   += (mouse.x - dotPos.x)   * 0.5;
      dotPos.y   += (mouse.y - dotPos.y)   * 0.5;
      ringPos.x  += (mouse.x - ringPos.x)  * 0.16;
      ringPos.y  += (mouse.y - ringPos.y)  * 0.16;
      glowPos.x  += (mouse.x - glowPos.x)  * 0.08;
      glowPos.y  += (mouse.y - glowPos.y)  * 0.08;
      trailPos.x += (mouse.x - trailPos.x) * 0.3;
      trailPos.y += (mouse.y - trailPos.y) * 0.3;

      dot.style.transform   = 'translate(' + dotPos.x   + 'px,' + dotPos.y   + 'px) translate(-50%,-50%)';
      ring.style.transform  = 'translate(' + ringPos.x  + 'px,' + ringPos.y  + 'px) translate(-50%,-50%)';
      glow.style.transform  = 'translate(' + glowPos.x  + 'px,' + glowPos.y  + 'px) translate(-50%,-50%)';
      trail.style.transform = 'translate(' + trailPos.x + 'px,' + trailPos.y + 'px) translate(-50%,-50%)';

      requestAnimationFrame(loop);
    }
    loop();
  })();

  /* THEME */
  (function () {
    var root = document.documentElement, btn = $('#themeToggle'), KEY = 'nexifing-theme';
    var saved = null; try { saved = localStorage.getItem(KEY); } catch (e) {}
    var initial = (saved === 'light' || saved === 'dark') ? saved
      : (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    root.setAttribute('data-theme', initial);
    if (btn) btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
  })();

  /* SCROLL PROGRESS */
  (function () {
    var bar = $('#scrollProgress');
    if (!bar) return;
    function u() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
      bar.style.transform = 'scaleX(' + p + ')';
    }
    addEventListener('scroll', u, { passive: true });
    addEventListener('resize', u);
    u();
  })();

  /* HEADER */
  (function () {
    var header = $('#header');
    if (!header) return;
    function u() {
      var y = scrollY || document.documentElement.scrollTop;
      header.classList.toggle('scrolled', y > 8);
    }
    addEventListener('scroll', u, { passive: true });
    u();
  })();

  /* MOBILE MENU */
  (function () {
    var t = $('#menuToggle'), n = $('#nav');
    if (!t || !n) return;
    function open() {
      n.classList.add('open'); t.classList.add('active');
      t.setAttribute('aria-expanded', 'true');
      document.body.classList.add('scroll-locked');
    }
    function close() {
      n.classList.remove('open'); t.classList.remove('active');
      t.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('scroll-locked');
    }
    t.addEventListener('click', function () { n.classList.contains('open') ? close() : open(); });
    $$('a', n).forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    addEventListener('resize', function () { if (innerWidth > 900) close(); });
  })();

  /* SMOOTH ANCHORS */
  (function () {
    if (reducedMotion) return;
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id === '#' || id.length < 2) return;
        var target = document.getElementById(id.slice(1));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - 72, behavior: 'smooth' });
      });
    });
  })();

  /* REVEAL */
  (function () {
    var els = $$('[data-reveal]');
    if (!els.length) return;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('revealed'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var parent = el.parentElement;
        var sib = parent ? $$('[data-reveal]', parent) : [];
        var idx = sib.indexOf(el);
        var delay = idx > 0 ? Math.min(idx * 80, 320) : 0;
        setTimeout(function () { el.classList.add('revealed'); }, delay);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* FOOTER YEAR */
  (function () {
    var els = $$('[data-year]');
    if (!els.length) return;
    var y = new Date().getFullYear();
    els.forEach(function (e) { e.textContent = y; });
  })();

  /* FAQ ACCORDION */
  (function () {
    var all = $$('.faq details');
    if (!all.length) return;
    all.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        all.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  })();

  /* CONTACT FORM */
  (function () {
    var form = $('.contact-form'), note = $('.form-note');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = form.querySelector('[name="name"]');
      var em = form.querySelector('[name="email"]');
      var m = form.querySelector('[name="message"]');
      if (!n || !n.value.trim() || !em || !em.value.trim() || !m || !m.value.trim()) {
        if (note) { note.textContent = 'Please fill in name, email and message.'; note.style.color = 'var(--danger)'; }
        return;
      }
      if (note) { note.textContent = 'Message ready — we will be in touch within 24h.'; note.style.color = 'var(--success)'; }
    });
  })();

  /* EXTERNAL LINKS */
  (function () {
    $$('a[target="_blank"]').forEach(function (a) {
      var rel = a.getAttribute('rel') || '';
      if (rel.indexOf('noopener') === -1) a.setAttribute('rel', (rel + ' noopener noreferrer').trim());
    });
  })();

  /* KEYBOARD SHORTCUTS */
  (function () {
    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
      if (e.key === 'g') {
        var next = function (ev) {
          document.removeEventListener('keydown', next);
          if (ev.key === 'h') location.href = 'index.html';
          if (ev.key === 'w') location.href = 'work.html';
          if (ev.key === 'c') location.href = 'contact.html';
        };
        document.addEventListener('keydown', next);
        setTimeout(function () { document.removeEventListener('keydown', next); }, 1500);
      }
    });
  })();

})();
