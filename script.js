/* ==========================================================================
   NEXIFING — script.js
   Loader · Cursor · Theme · Progress · Reveal · Nav · Forms
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ========================================================================
     1. LOADER
     ======================================================================== */
  (function loader() {
    var loaderEl = $('#loader');
    var fillEl   = $('#loaderFill');
    var textEl   = $('#loaderText');
    if (!loaderEl || !fillEl) return;

    var progress = 0;
    var messages = ['LOADING', 'ALMOST READY', 'DONE'];
    var msgIdx = 0;

    var tick = setInterval(function () {
      progress += Math.random() * 8 + 3;
      if (progress > 90) progress = 90;
      fillEl.style.width = progress + '%';
      var newIdx = Math.min(messages.length - 1, Math.floor((progress / 100) * messages.length));
      if (newIdx !== msgIdx && textEl) {
        msgIdx = newIdx;
        textEl.textContent = messages[msgIdx];
      }
    }, 90);

    function finish() {
      clearInterval(tick);
      fillEl.style.width = '100%';
      if (textEl) textEl.textContent = messages[messages.length - 1];
      setTimeout(function () { loaderEl.classList.add('hidden'); }, 320);
    }

    if (document.readyState === 'complete') setTimeout(finish, 500);
    else window.addEventListener('load', function () { setTimeout(finish, 500); });

    setTimeout(finish, 4500);
  })();

  /* ========================================================================
     2. CUSTOM CURSOR
     ======================================================================== */
  (function cursor() {
    if (isTouch || reducedMotion) return;
    var dot  = $('#cursorDot');
    var ring = $('#cursorRing');
    if (!dot || !ring) return;

    var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    var dotPos = { x: mouse.x, y: mouse.y };
    var ringPos = { x: mouse.x, y: mouse.y };

    document.body.classList.add('cursor-active');

    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest('a, button, .btn, summary, input, textarea, select, [role="button"]')) {
        ring.classList.add('hovering');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest('a, button, .btn, summary, input, textarea, select, [role="button"]')) {
        ring.classList.remove('hovering');
      }
    });
    document.addEventListener('mouseleave', function () {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    });

    function loop() {
      dotPos.x += (mouse.x - dotPos.x) * 0.55;
      dotPos.y += (mouse.y - dotPos.y) * 0.55;
      ringPos.x += (mouse.x - ringPos.x) * 0.18;
      ringPos.y += (mouse.y - ringPos.y) * 0.18;
      dot.style.transform  = 'translate(' + dotPos.x + 'px,' + dotPos.y + 'px) translate(-50%,-50%)';
      ring.style.transform = 'translate(' + ringPos.x + 'px,' + ringPos.y + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    }
    loop();
  })();

  /* ========================================================================
     3. THEME
     ======================================================================== */
  (function theme() {
    var root = document.documentElement;
    var btn  = $('#themeToggle');
    var KEY  = 'nexifing-theme';

    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}

    var initial;
    if (saved === 'light' || saved === 'dark') {
      initial = saved;
    } else {
      initial = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    root.setAttribute('data-theme', initial);
    updateThemeColor(initial);

    if (btn) {
      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem(KEY, next); } catch (e) {}
        updateThemeColor(next);
      });
    }
    function updateThemeColor(mode) {
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', mode === 'light' ? '#f7f8fc' : '#080a14');
    }
  })();

  /* ========================================================================
     4. SCROLL PROGRESS
     ======================================================================== */
  (function scrollProgress() {
    var bar = $('#scrollProgress');
    if (!bar) return;
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
      bar.style.transform = 'scaleX(' + pct + ')';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* ========================================================================
     5. HEADER SCROLL
     ======================================================================== */
  (function headerState() {
    var header = $('#header');
    if (!header) return;
    function update() {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (y > 8) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  })();

  /* ========================================================================
     6. MOBILE MENU
     ======================================================================== */
  (function mobileMenu() {
    var toggle = $('#menuToggle');
    var nav    = $('#nav');
    if (!toggle || !nav) return;

    function open() {
      nav.classList.add('open');
      toggle.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('scroll-locked');
    }
    function close() {
      nav.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('scroll-locked');
    }
    toggle.addEventListener('click', function () {
      nav.classList.contains('open') ? close() : open();
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) close(); });
  })();

  /* ========================================================================
     7. SMOOTH ANCHORS
     ======================================================================== */
  (function smoothAnchors() {
    if (reducedMotion) return;
    var headerH = 64;
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id === '#' || id.length < 2) return;
        var target = document.getElementById(id.slice(1));
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
        window.scrollTo({ top: top, behavior: 'smooth' });
        if (history.replaceState) history.replaceState(null, '', id);
      });
    });
  })();

  /* ========================================================================
     8. REVEAL
     ======================================================================== */
  (function reveal() {
    var els = $$('[data-reveal]');
    if (!els.length) return;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var parent = el.parentElement;
        var siblings = parent ? $$('[data-reveal]', parent) : [];
        var idx = siblings.indexOf(el);
        var delay = idx > 0 ? Math.min(idx * 80, 320) : 0;
        setTimeout(function () { el.classList.add('revealed'); }, delay);
        observer.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { observer.observe(el); });
  })();

  /* ========================================================================
     9. FOOTER YEAR
     ======================================================================== */
  (function footerYear() {
    var els = $$('[data-year]');
    if (!els.length) return;
    var y = new Date().getFullYear();
    els.forEach(function (el) { el.textContent = y; });
  })();

  /* ========================================================================
     10. FAQ — one open
     ======================================================================== */
  (function faq() {
    var all = $$('.faq details');
    if (!all.length) return;
    all.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        all.forEach(function (other) { if (other !== d) other.open = false; });
      });
    });
  })();

  /* ========================================================================
     11. NEWSLETTER
     ======================================================================== */
  (function newsletter() {
    var form = $('.newsletter-form');
    var note = $('.newsletter-note');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('input', form);
      if (!input || !input.value.trim()) return;
      if (note) {
        note.textContent = 'Thanks — you will hear from us.';
        note.style.color = 'var(--success)';
      }
      input.value = '';
    });
  })();

  /* ========================================================================
     12. CONTACT FORM
     ======================================================================== */
  (function contactForm() {
    var form = $('.contact-form');
    var note = $('.form-note');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name    = form.querySelector('[name="name"]');
      var email   = form.querySelector('[name="email"]');
      var message = form.querySelector('[name="message"]');
      if (!name || !name.value.trim() || !email || !email.value.trim() || !message || !message.value.trim()) {
        if (note) {
          note.textContent = 'Please fill in name, email and message.';
          note.style.color = 'var(--danger)';
        }
        return;
      }
      if (note) {
        note.textContent = 'Message ready — we will be in touch within 24h.';
        note.style.color = 'var(--success)';
      }
    });
  })();

  /* ========================================================================
     13. EXTERNAL LINKS
     ======================================================================== */
  (function externalLinks() {
    $$('a[target="_blank"]').forEach(function (a) {
      var rel = a.getAttribute('rel') || '';
      if (rel.indexOf('noopener') === -1) {
        a.setAttribute('rel', (rel + ' noopener noreferrer').trim());
      }
    });
  })();

})();
