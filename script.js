/* ============================================================================
   NEXIFING — script.js
   Contact form now sends directly to WhatsApp (+20 12 02000210)
   ============================================================================ */

/* ============================================================================
   01. GLOBAL CONFIG & UTILITIES
============================================================================ */

const NEXIFING_PHONE = '+20 12 02000210';
const NEXIFING_PHONE_TEL = '+201202000210';
const NEXIFING_WHATSAPP = '201202000210'; // WhatsApp needs country code + number, no +

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function debounce(fn, wait = 100) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    const icon = { success: '✓', error: '✕', info: 'ℹ' }[type] || '';

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

  const TYPE_SPEED = 70;
  const DELETE_SPEED = 35;
  const HOLD_TIME = 1800;

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
    const scrollY = window.scrollY + 220;
    let current = null;

    sections.forEach(({ section }) => {
      if (section.offsetTop <= scrollY) current = section;
    });

    sections.forEach(({ link, section }) => {
      if (section === current) link.style.color = 'var(--purple)';
      else link.style.color = '';
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
    background: linear-gradient(90deg, #4c1d95, #831843, #1e3a8a);
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

  menu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', close);
  });

  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('open')) return;
    if (menu.contains(e.target) || btn.contains(e.target)) return;
    close();
  });

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

      const offset = 200;
      const y = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top: y, behavior: 'smooth' });

      if (history.pushState) {
        history.pushState(null, '', href);
      }
    });
  });
})();

/* ============================================================================
   11. MULTI-STEP BUILDER — MORE QUESTIONS ADDED
============================================================================ */

(function initBuilder() {
  const questionEl = $('#question');
  const optionsEl = $('#optionsContainer');
  const stepLabel = $('#stepLabel');
  const progressFill = $('#progressFill');
  const backBtn = $('#backBtn');
  const nextBtn = $('#nextBtn');
  const answersList = $('#answersList');

  if (!questionEl || !optionsEl || !nextBtn) return;

  // 6 STEPS now (was 3)
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
      id: 'pages',
      q: 'How many pages do you need?',
      opts: ['1 (Single page)', '2–5 pages', '6–10 pages', '10+ pages'],
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
        'Chat / WhatsApp',
        'Booking System',
      ],
      multi: true,
    },
    {
      id: 'audience',
      q: 'Who is the site for?',
      opts: [
        'Local customers',
        'Global audience',
        'Businesses (B2B)',
        'Consumers (B2C)',
        'Mixed',
      ],
    },
    {
      id: 'budget',
      q: 'What is your timeline?',
      opts: ['ASAP (24h)', 'This week', 'This month', 'Just exploring'],
    },
  ];

  let step = 0;
  const STORAGE_KEY = 'nexifing_answers_v3';

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

    nextBtn.textContent = step === steps.length - 1 ? 'Finish ✓' : 'Next →';

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
        const y = contact.getBoundingClientRect().top + window.scrollY - 200;
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

  if (items[0]) items[0].classList.add('open');
})();

/* ============================================================================
   13. CONTACT FORM → SENDS TO WHATSAPP
============================================================================ */

(function initContactForm() {
  const form = $('#contactForm');
  const statusMsg = $('#statusMsg');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (statusMsg) {
      statusMsg.textContent = 'Opening WhatsApp...';
      statusMsg.className = 'status-msg';
    }

    const name = $('#name')?.value.trim() || '';
    const email = $('#email')?.value.trim() || '';
    const idea = $('#idea')?.value.trim() || '';

    // Build the message
    let message = `Hi Nexifing! 👋\n\n`;
    message += `*Name:* ${name}\n`;
    message += `*Email:* ${email}\n\n`;

    // Add builder answers
    const answerRows = $$('#answersList > div');
    if (answerRows.length) {
      message += `*My Website Brief:*\n`;
      answerRows.forEach((row) => {
        const spans = row.querySelectorAll('span');
        if (spans.length === 2) {
          const q = spans[0].textContent.trim();
          const a = spans[1].textContent.trim();
          if (a && a !== '—') {
            message += `• ${q} → ${a}\n`;
          }
        }
      });
      message += `\n`;
    }

    if (idea) {
      message += `*Extra notes:*\n${idea}\n`;
    }

    const encoded = encodeURIComponent(message);
    const waURL = `https://wa.me/${NEXIFING_WHATSAPP}?text=${encoded}`;

    // Open WhatsApp in new tab
    window.open(waURL, '_blank');

    if (statusMsg) {
      statusMsg.textContent = `✅ Opening WhatsApp... If it didn't open, call us at ${NEXIFING_PHONE}`;
      statusMsg.className = 'status-msg success';
    }

    Toast.success('Opening WhatsApp with your request!', 5000);

    // Optionally clear the form
    // form.reset();
    // storage.remove('nexifing_answers_v3');
    // const answersList = $('#answersList');
    // if (answersList) answersList.innerHTML = '';
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

    const input = form.querySelector('input');
    const email = input?.value.trim();

    if (!email) return;

    // Send newsletter subscription to WhatsApp too
    const message = `Hi Nexifing! 👋\n\nI want to subscribe to your newsletter.\n\n*Email:* ${email}`;
    const encoded = encodeURIComponent(message);
    const waURL = `https://wa.me/${NEXIFING_WHATSAPP}?text=${encoded}`;

    window.open(waURL, '_blank');

    Toast.success('Opening WhatsApp to subscribe!', 4000);

    const btn = form.querySelector('button');
    if (btn) {
      const original = btn.textContent;
      btn.textContent = '✓ Opening...';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
        form.reset();
      }, 2500);
    }
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
   17. FLOATING CALL BUTTON
============================================================================ */

(function initCallButton() {
  const btn = $('.call-float');
  if (!btn) return;

  btn.setAttribute('href', `https://wa.me/${NEXIFING_WHATSAPP}`);
  btn.setAttribute('target', '_blank');
  btn.setAttribute('rel', 'noopener');
  btn.setAttribute('aria-label', `Chat on WhatsApp: ${NEXIFING_PHONE}`);
  btn.setAttribute('title', `Chat on WhatsApp: ${NEXIFING_PHONE}`);
})();

/* ============================================================================
   18. FOOTER YEAR
============================================================================ */

(function initFooterYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ============================================================================
   19. COUNTER ANIMATIONS
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
   20. KEYBOARD SHORTCUTS
============================================================================ */

(function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.toast').forEach((t) => t.classList.add('hiding'));
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
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
   21. EASTER EGGS
============================================================================ */

(function initEasterEggs() {
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
   22. CONSOLE SIGNATURE
============================================================================ */

(function consoleSignature() {
  const styles = [
    'color: #4c1d95',
    'font-weight: bold',
    'font-size: 20px',
    'padding: 8px 12px',
    'background: #ececf2',
    'border-radius: 4px',
  ].join(';');

  console.log('%cNexifing', styles);
  console.log('%cBuilt with HTML, CSS & JavaScript', 'color: #1e3a8a; font-size: 12px;');
  console.log(`%cWhatsApp us → ${NEXIFING_PHONE}`, 'color: #27272a; font-size: 12px;');
})();

/* ============================================================================
   23. INITIALIZATION
============================================================================ */

(function init() {
  if (!('scrollBehavior' in document.documentElement.style)) {
    console.warn('Smooth scrolling not supported in this browser.');
  }

  console.log(
    '%cNexifing ✓ Loaded successfully',
    'color: #064e3b; font-weight: bold; font-size: 13px;'
  );
})();
