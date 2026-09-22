/* ============================================================================
   NEXIFING — script.js
   ============================================================================
   Table of Contents:
     01. Utilities (debounce, throttle, storage, escapeHtml)
     02. Toast Notifications
     03. Typing Effect (Hero)
     04. Mouse Glow (Hero)
     05. Feature Card Cursor Glow
     06. Navbar Scroll Effect
     07. Active Nav Link on Scroll
     08. Reading Progress Bar
     09. Mobile Menu
     10. Smooth Anchor Scroll
     11. Multi-Step Builder
     12. FAQ Accordion
     13. Contact Form (Formspree)
     14. Newsletter Form
     15. Scroll Reveal
     16. Back to Top
     17. Footer Year
     18. Counter Animations
     19. Keyboard Shortcuts
     20. Easter Eggs
     21. Console Signature
     22. Initialization
   ============================================================================ */


/* ============================================================================
   01. UTILITIES
============================================================================ */

/**
 * querySelector shortcut.
 */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/**
 * querySelectorAll shortcut returning an array.
 */
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/**
 * Debounce — delays function execution until `wait` ms of silence.
 */
function debounce(fn, wait = 100) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Throttle — fires function at most once every `limit` ms.
 */
function throttle(fn, limit = 100) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Safe localStorage wrapper.
 */
const storage = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

/**
 * Escape HTML to prevent XSS when inserting user content.
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Detect if the user prefers reduced motion.
 */
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Simple unique ID generator.
 */
function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}


/* ============================================================================
   02. TOAST NOTIFICATIONS
============================================================================ */

const Toast = (() => {
  let container = null;

  function ensureContainer() {
    if (container) return container;
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }

  function show(message, type = 'info', duration = 3000) {
    const root = ensureContainer();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
    }[type] || '';

    toast.innerHTML = `
      <span style="font-size:1.1rem;font-weight:700;">${icon}</span>
      <span>${escapeHtml(message)}</span>
    `;

    root.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  return {
    success: (msg, dur) => show(msg, 'success', dur),
    error: (msg, dur) => show(msg, 'error', dur),
    info: (msg, dur) => show(msg, 'info', dur),
  };
})();


/* ============================================================================
   03. TYPING EFFECT (HERO)
============================================================================ */

(function initTypingEffect() {
  const el = $('#typedText');
  if (!el) return;

  const phrases = [
    'with a single prompt.',
    'in under 24 hours.',
    'no code required.',
    'beautifully responsive.',
    'and own it forever.',
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let paused = false;

  const TYPE_SPEED   = 70;
  const DELETE_SPEED = 35;
  const HOLD_TIME    = 1800;

  function tick() {
    if (paused) return;

    const phrase = phrases[phraseIndex];

    if (!deleting) {
      el.textContent = phrase.slice(0, charIndex + 1);
      charIndex++;

      if (charIndex === phrase.length) {
        deleting = true;
        paused = true;
        setTimeout(() => {
          paused = false;
          tick();
        }, HOLD_TIME);
        return;
      }
    } else {
      el.textContent = phrase.slice(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }

    setTimeout(tick, deleting ? DELETE_SPEED : TYPE_SPEED);
  }

  setTimeout(tick, 500);
})();


/* ============================================================================
   04. MOUSE GLOW (HERO)
============================================================================ */

(function initHeroGlow() {
  const hero = $('#hero');
  if (!hero || prefersReducedMotion()) return;

  const update = throttle((e) => {
    const rect = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', e.clientX - rect.left + 'px');
    hero.style.setProperty('--my', e.clientY - rect.top + 'px');
  }, 16);

  hero.addEventListener('mousemove', update);
  hero.addEventListener('mouseleave', () => {
    hero.style.removeProperty('--mx');
    hero.style.removeProperty('--my');
  });
})();


/* ============================================================================
   05. FEATURE CARD CURSOR GLOW
============================================================================ */

(function initFeatureCardGlow() {
  if (prefersReducedMotion()) return;

  const cards = $$('.feature-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    const update = throttle((e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--x', e.clientX - rect.left + 'px');
      card.style.setProperty('--y', e.clientY - rect.top + 'px');
    }, 16);

    card.addEventListener('mousemove', update);
  });
})();


/* ============================================================================
   06. NAVBAR SCROLL EFFECT
============================================================================ */

(function initNavbarScroll() {
  const navbar = $('#navbar');
  if (!navbar) return;

  const handler = throttle(() => {
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }, 50);

  window.addEventListener('scroll', handler);
  handler();
})();


/* ============================================================================
   07. ACTIVE NAV LINK ON SCROLL
============================================================================ */

(function initActiveNavLink() {
  const navLinks = $$('.nav-links a[href^="#"]');
  if (!navLinks.length) return;

  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute('href').slice(1);
      const section = document.getElementById(id);
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  const handler = throttle(() => {
    const scrollY = window.scrollY + 120;
    let current = null;

    sections.forEach(({ section }) => {
      if (section.offsetTop <= scrollY) current = section;
    });

    sections.forEach(({ link, section }) => {
      if (section === current) {
        link.style.color = 'var(--purple)';
      } else {
        link.style.color = '';
      }
    });
  }, 100);

  window.addEventListener('scroll', handler);
})();


/* ============================================================================
   08. READING PROGRESS BAR
============================================================================ */

(function initReadingProgress() {
  const bar = document.createElement('div');
  bar.id = 'reading-progress';
  bar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #7c3aed, #0891b2);
    z-index: 9999;
    width: 0%;
    transition: width 0.1s linear;
    pointer-events: none;
  `;
  document.body.appendChild(bar);

  const update = throttle(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }, 20);

  window.addEventListener('scroll', update);
  window.addEventListener('resize', update);
  update();
})();


/* ============================================================================
   09. MOBILE MENU
============================================================================ */

(function initMobileMenu() {
  const btn = $('#menuBtn');
  const menu = $('#mobileMenu');
  if (!btn || !menu) return;

  function toggle() {
    const isOpen = menu.classList.toggle('open');
    btn.textContent = isOpen ? '✕' : '☰';
    btn.setAttribute('aria-expanded', String(isOpen));
  }

  function close() {
    menu.classList.remove('open');
    btn.textContent = '☰';
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', toggle);

  // Close on link click
  menu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', close);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('open')) return;
    if (menu.contains(e.target) || btn.contains(e.target)) return;
    close();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
})();


/* ============================================================================
   10. SMOOTH ANCHOR SCROLL
============================================================================ */

(function initSmoothScroll() {
  const anchors = $$('a[href^="#"]');
  if (!anchors.length) return;

  anchors.forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const offset = 90;
      const y = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top: y, behavior: 'smooth' });

      if (history.pushState) {
        history.pushState(null, '', href);
      }
    });
  });
})();


/* ============================================================================
   11. MULTI-STEP BUILDER
============================================================================ */

(function initBuilder() {
  const questionEl   = $('#question');
  const optionsEl    = $('#optionsContainer');
  const stepLabel    = $('#stepLabel');
  const progressFill = $('#progressFill');
  const backBtn      = $('#backBtn');
  const nextBtn      = $('#nextBtn');
  const answersList  = $('#answersList');

  if (!questionEl || !optionsEl || !nextBtn) return;

  const steps = [
    {
      id: 'type',
      q: 'What kind of website?',
      opts: [
        'Landing Page',
        'Business Site',
        'Portfolio',
        'E-commerce',
        'Web App',
        'Blog',
        'Portfolio + Blog',
        'SaaS Platform',
      ],
    },
    {
      id: 'style',
      q: 'What vibe should it have?',
      opts: [
        'Minimal',
        'Brutalist',
        'Dark & Futuristic',
        'Warm & Friendly',
        'Corporate',
        'Playful',
        'Editorial',
        'Retro',
      ],
    },
    {
      id: 'features',
      q: 'Must-have features?',
      opts: [
        'Contact Form',
        'Blog',
        'Payments',
        'User Login',
        'Dashboard',
        'Animations',
        'SEO',
        'Multi-language',
        'Dark Mode',
        'Analytics',
      ],
      multi: true,
    },
  ];

  let step = 0;
  const STORAGE_KEY = 'nexifing_answers_v2';

  const saved = storage.get(STORAGE_KEY, {});
  const answers = Object.assign({}, saved);

  function render() {
    const s = steps[step];

    if (stepLabel) stepLabel.textContent = `STEP ${step + 1} / ${steps.length}`;
    questionEl.textContent = s.q;

    if (progressFill) {
      const pct = ((step + 1) / steps.length) * 100;
      progressFill.style.width = pct + '%';
    }

    optionsEl.innerHTML = '';

    s.opts.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.textContent = opt;

      const selected = s.multi
        ? (answers[s.id] || []).includes(opt)
        : answers[s.id] === opt;

      if (selected) btn.classList.add('selected');

      btn.addEventListener('click', () => selectOption(opt));
      optionsEl.appendChild(btn);
    });

    if (backBtn) {
      backBtn.style.display = step > 0 ? 'inline-flex' : 'none';
    }

    nextBtn.textContent =
      step === steps.length - 1 ? 'Finish ✓' : 'Next →';

    const hasAnswer = s.multi
      ? (answers[s.id] || []).length > 0
      : Boolean(answers[s.id]);

    nextBtn.disabled = !hasAnswer;
    nextBtn.style.opacity = hasAnswer ? '1' : '0.4';
    nextBtn.style.cursor = hasAnswer ? 'pointer' : 'not-allowed';
  }

  function selectOption(val) {
    const s = steps[step];

    if (s.multi) {
      const prev = answers[s.id] || [];
      answers[s.id] = prev.includes(val)
        ? prev.filter((v) => v !== val)
        : [...prev, val];
    } else {
      answers[s.id] = val;
    }

    storage.set(STORAGE_KEY, answers);
    render();
    updatePreview();
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (step > 0) {
        step--;
        render();
      }
    });
  }

  nextBtn.addEventListener('click', () => {
    const s = steps[step];
    const hasAnswer = s.multi
      ? (answers[s.id] || []).length > 0
      : Boolean(answers[s.id]);

    if (!hasAnswer) return;

    if (step < steps.length - 1) {
      step++;
      render();
    } else {
      const contact = $('#contact');
      if (contact) {
        const y = contact.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
      Toast.success('Great! Now send your request below.', 3500);
    }
  });

  function updatePreview() {
    if (!answersList) return;
    answersList.innerHTML = '';

    steps.forEach((s) => {
      const val = Array.isArray(answers[s.id])
        ? answers[s.id].join(', ') || '—'
        : answers[s.id] || '—';

      const row = document.createElement('div');
      const k = document.createElement('span');
      const v = document.createElement('span');
      k.textContent = s.q;
      v.textContent = val;
      row.appendChild(k);
      row.appendChild(v);
      answersList.appendChild(row);
    });
  }

  render();
  updatePreview();
})();


/* ============================================================================
   12. FAQ ACCORDION
============================================================================ */

(function initFaq() {
  const items = $$('.faq-item');
  if (!items.length) return;

  items.forEach((item) => {
    const q = $('.faq-question', item);
    if (!q) return;

    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      items.forEach((i) => i.classList.remove('open'));

      if (!isOpen) item.classList.add('open');
    });
  });

  // Open the first FAQ by default
  if (items[0]) items[0].classList.add('open');
})();


/* ============================================================================
   13. CONTACT FORM (Formspree)
============================================================================ */

(function initContactForm() {
  const form = $('#contactForm');
  const statusMsg = $('#statusMsg');
  if (!form) return;

  // ⚠️ Replace with your real Formspree ID
  const FORMSPREE_ID = 'YOUR_FORM_ID';
  const FORMSPREE_URL = `https://formspree.io/f/${FORMSPREE_ID}`;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (statusMsg) {
      statusMsg.textContent = 'Sending...';
      statusMsg.className = 'status-msg';
    }

    const payload = {
      name: $('#name')?.value || '',
      email: $('#email')?.value || '',
      idea: $('#idea')?.value || '',
      answers: {},
      submittedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    // Collect builder answers
    $$('#answersList > div').forEach((row) => {
      const spans = row.querySelectorAll('span');
      if (spans.length === 2) {
        payload.answers[spans[0].textContent] = spans[1].textContent;
      }
    });

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Request failed');

      if (statusMsg) {
        statusMsg.textContent =
          "✅ Got it! We'll email you within 24 hours.";
        statusMsg.className = 'status-msg success';
      }

      Toast.success('Request sent successfully!', 4000);
      form.reset();

      // Clear saved builder answers
      storage.remove('nexifing_answers_v2');

      // Reset builder preview
      const answersList = $('#answersList');
      if (answersList) answersList.innerHTML = '';
    } catch (err) {
      if (statusMsg) {
        statusMsg.textContent =
          '⚠️ Something went wrong. Please try again.';
        statusMsg.className = 'status-msg error';
      }
      Toast.error('Failed to send. Please try again.', 4000);
    }
  });
})();


/* ============================================================================
   14. NEWSLETTER FORM
============================================================================ */

(function initNewsletter() {
  const form = $('#newsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('button');
    if (!btn) return;

    const original = btn.textContent;
    btn.textContent = '✓ Subscribed!';
    btn.disabled = true;

    Toast.success('Thanks for subscribing!', 3000);

    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      form.reset();
    }, 2500);
  });
})();


/* ============================================================================
   15. SCROLL REVEAL
============================================================================ */

(function initScrollReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -80px 0px' }
  );

  els.forEach((el) => io.observe(el));
})();


/* ============================================================================
   16. BACK TO TOP
============================================================================ */

(function initBackToTop() {
  const btn = $('#backTop');
  if (!btn) return;

  const update = throttle(() => {
    if (window.scrollY > 500) btn.classList.add('show');
    else btn.classList.remove('show');
  }, 100);

  window.addEventListener('scroll', update);
  update();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================================
   17. FOOTER YEAR
============================================================================ */

(function initFooterYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ============================================================================
   18. COUNTER ANIMATIONS
============================================================================ */

(function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseFloat(el.dataset.count);
    const duration = 1500;
    const start = performance.now();
    const suffix = el.dataset.suffix || '';

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(target * eased);

      el.textContent = value + suffix;

      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }

    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => io.observe(el));
})();


/* ============================================================================
   19. KEYBOARD SHORTCUTS
============================================================================ */

(function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Press "/" to focus search (if there was one)
    // Press "g" then "h" to go home
    if (e.key === 'Escape') {
      // Close any open toast
      document
        .querySelectorAll('.toast')
        .forEach((t) => t.classList.add('hiding'));
    }

    // Ctrl/Cmd + K to focus contact form
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const nameInput = $('#name');
      if (nameInput) {
        nameInput.focus();
        nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });
})();


/* ============================================================================
   20. EASTER EGGS
============================================================================ */

(function initEasterEggs() {
  // Konami code: ↑↑↓↓←→←→BA
  const konami = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a',
  ];
  let idx = 0;

  document.addEventListener('keydown', (e) => {
    if (e.key === konami[idx]) {
      idx++;
      if (idx === konami.length) {
        idx = 0;
        document.body.style.transition = 'transform 0.6s';
        document.body.style.transform = 'rotate(360deg)';
        setTimeout(() => {
          document.body.style.transform = '';
        }, 700);
        Toast.success('🎉 You found the secret!', 4000);
      }
    } else {
      idx = 0;
    }
  });

  // Triple click on logo = confetti
  const logo = $('.logo');
  if (logo) {
    let clicks = 0;
    let timer;
    logo.addEventListener('click', (e) => {
      clicks++;
      clearTimeout(timer);
      timer = setTimeout(() => (clicks = 0), 500);
      if (clicks === 3) {
        e.preventDefault();
        Toast.info('🥳 Thanks for loving Nexifing!', 3000);
        clicks = 0;
      }
    });
  }
})();


/* ============================================================================
   21. CONSOLE SIGNATURE
============================================================================ */

(function consoleSignature() {
  const styles = [
    'color: #7c3aed',
    'font-weight: bold',
    'font-size: 20px',
    'padding: 8px 12px',
    'background: #f8f9fc',
    'border-radius: 4px',
  ].join(';');

  console.log('%cNexifing', styles);
  console.log(
    '%cBuilt with React, HTML, CSS & JavaScript',
    'color: #0891b2; font-size: 12px;'
  );
  console.log(
    '%cWant to build a site with us? → https://7az3ma7m3dm-oss.github.io/nexifing/',
    'color: #4a4a55; font-size: 12px;'
  );
})();


/* ============================================================================
   22. INITIALIZATION
============================================================================ */

(function init() {
  // Attach a smooth scroll polyfill warning
  if (!('scrollBehavior' in document.documentElement.style)) {
    console.warn('Smooth scrolling not supported in this browser.');
  }

  // Log DOM ready
  console.log(
    '%cNexifing ✓ Loaded successfully',
    'color: #16a34a; font-weight: bold; font-size: 13px;'
  );

  // Handle page visibility change (pause animations when hidden)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      document.body.style.animationPlayState = 'paused';
    } else {
      document.body.style.animationPlayState = 'running';
    }
  });

  // Warn before leaving with unsent form data
  const form = $('#contactForm');
  if (form) {
    let isDirty = false;
    form.addEventListener('input', () => (isDirty = true));
    form.addEventListener('submit', () => (isDirty = false));

    window.addEventListener('beforeunload', (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }
})();


/* ============================================================================
   END OF SCRIPT
============================================================================ */
