/* ============================================================================
   NEXIFING — script.js (ULTIMATE EDITION)
   ============================================================================
   Features:
     ✓ WhatsApp form with full brief (always visible)
     ✓ 6-question builder with auto-save + progress
     ✓ Live WhatsApp preview
     ✓ Confetti on success
     ✓ Sound effects
     ✓ Custom cursor trail
     ✓ Page loader
     ✓ Copy-to-clipboard
     ✓ Share button
     ✓ Scroll spy
     ✓ Testimonial auto-rotate
     ✓ Toast system with actions
     ✓ Theme toggle (light/dark)
     ✓ Keyboard navigation
     ✓ Auto-scroll to next section
     ✓ And much more...
   ============================================================================ */

/* ============================================================================
   01. CONFIG & UTILITIES
============================================================================ */

const NEXIFING = {
  phone: '+20 12 02000210',
  phoneTel: '+201202000210',
  whatsapp: '201202000210',
  email: 'hello@nexifing.com',
  storageKeys: {
    answers: 'nexifing_answers_v4',
    theme: 'nexifing_theme',
    lastVisit: 'nexifing_last_visit',
    draftMessage: 'nexifing_draft_msg',
  },
};

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const debounce = (fn, wait = 100) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
};

const throttle = (fn, limit = 100) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

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

const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isMobile = () =>
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const uid = (prefix = 'id') =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

/* ============================================================================
   02. SOUND EFFECTS (Web Audio API — no files needed)
============================================================================ */

const Sound = (() => {
  let ctx = null;
  let enabled = true;

  function getCtx() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        enabled = false;
      }
    }
    return ctx;
  }

  function play(freq, duration = 0.1, type = 'sine', volume = 0.05) {
    if (!enabled || prefersReducedMotion()) return;
    const c = getCtx();
    if (!c) return;

    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);

    osc.connect(gain);
    gain.connect(c.destination);

    osc.start();
    osc.stop(c.currentTime + duration);
  }

  return {
    click: () => play(600, 0.05, 'sine', 0.03),
    success: () => {
      play(523, 0.1, 'sine', 0.05);
      setTimeout(() => play(784, 0.15, 'sine', 0.05), 100);
    },
    error: () => play(200, 0.2, 'sawtooth', 0.04),
    toggle: () => play(440, 0.08, 'square', 0.02),
  };
})();

/* ============================================================================
   03. TOAST NOTIFICATIONS (with actions)
============================================================================ */

const Toast = (() => {
  let container = null;

  function ensure() {
    if (container) return container;
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }

  function show(message, type = 'info', duration = 3000, action = null) {
    const root = ensure();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
    const icon = icons[type] || '';

    let html = `
      <span style="font-size:1.1rem;font-weight:700;">${icon}</span>
      <span style="flex:1;">${escapeHtml(message)}</span>
    `;

    if (action && action.label && action.onClick) {
      html += `<button class="toast-action" style="
        background:rgba(76,29,149,0.1);
        border:none;
        color:var(--purple);
        font-weight:700;
        padding:4px 12px;
        border-radius:999px;
        font-size:0.8rem;
        cursor:pointer;
        margin-left:8px;
      ">${escapeHtml(action.label)}</button>`;
    }

    toast.innerHTML = html;
    root.appendChild(toast);

    if (action && action.onClick) {
      const btn = toast.querySelector('.toast-action');
      btn?.addEventListener('click', () => {
        action.onClick();
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
      });
    }

    if (duration > 0) {
      setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
  }

  return {
    success: (msg, dur = 3000, action) => show(msg, 'success', dur, action),
    error: (msg, dur = 3000, action) => show(msg, 'error', dur, action),
    info: (msg, dur = 3000, action) => show(msg, 'info', dur, action),
    warning: (msg, dur = 3000, action) => show(msg, 'warning', dur, action),
  };
})();

/* ============================================================================
   04. CONFETTI
============================================================================ */

const Confetti = (() => {
  function burst(count = 80) {
    if (prefersReducedMotion()) return;

    const colors = ['#4c1d95', '#831843', '#1e3a8a', '#06b6d4', '#10b981', '#f59e0b'];

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      const size = Math.random() * 8 + 4;
      piece.style.cssText = `
        position: fixed;
        top: ${-20 - Math.random() * 100}px;
        left: ${Math.random() * 100}vw;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        z-index: 99999;
        pointer-events: none;
        opacity: 1;
        transform: rotate(${Math.random() * 360}deg);
        animation: confettiFall ${3 + Math.random() * 2}s linear forwards;
      `;

      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 6000);
    }
  }

  // Inject keyframes once
  if (!document.getElementById('confetti-keyframes')) {
    const style = document.createElement('style');
    style.id = 'confetti-keyframes';
    style.textContent = `
      @keyframes confettiFall {
        to {
          transform: translateY(105vh) rotate(${Math.random() * 720}deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  return { burst };
})();

/* ============================================================================
   05. TYPING EFFECT (HERO)
============================================================================ */

(function initTyping() {
  const el = $('#typedText');
  if (!el) return;

  const phrases = [
    'with a single prompt.',
    'in under 24 hours.',
    'no code required.',
    'beautifully responsive.',
    'and own it forever.',
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let paused = false;

  const TYPE = 70;
  const DEL = 35;
  const HOLD = 1800;

  function tick() {
    if (paused) return;
    const phrase = phrases[phraseIdx];

    if (!deleting) {
      el.textContent = phrase.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === phrase.length) {
        deleting = true;
        paused = true;
        setTimeout(() => {
          paused = false;
          tick();
        }, HOLD);
        return;
      }
    } else {
      el.textContent = phrase.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
    }

    setTimeout(tick, deleting ? DEL : TYPE);
  }

  setTimeout(tick, 500);
})();

/* ============================================================================
   06. MOUSE GLOW (HERO)
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
   07. FEATURE CARD GLOW
============================================================================ */

(function initCardGlow() {
  if (prefersReducedMotion()) return;

  $$('.feature-card').forEach((card) => {
    const update = throttle((e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--x', e.clientX - rect.left + 'px');
      card.style.setProperty('--y', e.clientY - rect.top + 'px');
    }, 16);

    card.addEventListener('mousemove', update);
  });
})();

/* ============================================================================
   08. CUSTOM CURSOR TRAIL
============================================================================ */

(function initCursorTrail() {
  if (prefersReducedMotion() || isMobile()) return;
  if (window.innerWidth < 1024) return;

  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position: fixed;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(76,29,149,0.7), transparent 70%);
    pointer-events: none;
    z-index: 9999;
    transition: transform 0.15s ease-out, opacity 0.3s;
    transform: translate(-50%, -50%);
    mix-blend-mode: multiply;
  `;
  document.body.appendChild(cursor);

  let mx = 0,
    my = 0,
    cx = 0,
    cy = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  function loop() {
    cx += (mx - cx) * 0.15;
    cy += (my - cy) * 0.15;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
    requestAnimationFrame(loop);
  }

  loop();

  // Grow on hover over interactive elements
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .option-btn, .feature-card')) {
      cursor.style.transform = 'translate(-50%, -50%) scale(2.5)';
      cursor.style.opacity = '0.5';
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, .option-btn, .feature-card')) {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursor.style.opacity = '1';
    }
  });
})();

/* ============================================================================
   09. PAGE LOADER
============================================================================ */

(function initPageLoader() {
  // Add fade-in to body
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s ease';
  window.addEventListener('load', () => {
    document.body.style.opacity = '1';
  });
  // Fallback
  setTimeout(() => {
    document.body.style.opacity = '1';
  }, 300);
})();

/* ============================================================================
   10. NAVBAR SCROLL EFFECT
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
   11. ACTIVE NAV LINK (SCROLL SPY)
============================================================================ */

(function initScrollSpy() {
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
      const active = section === current;
      link.style.color = active ? 'var(--purple)' : '';
      link.style.fontWeight = active ? '600' : '';
    });
  }, 100);

  window.addEventListener('scroll', handler);
  handler();
})();

/* ============================================================================
   12. READING PROGRESS BAR
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
   13. MOBILE MENU
============================================================================ */

(function initMobileMenu() {
  const btn = $('#menuBtn');
  const menu = $('#mobileMenu');
  if (!btn || !menu) return;

  function toggle() {
    const isOpen = menu.classList.toggle('open');
    btn.textContent = isOpen ? '✕' : '☰';
    btn.setAttribute('aria-expanded', String(isOpen));
    Sound.click();
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
   14. SMOOTH ANCHOR SCROLL
============================================================================ */

(function initSmoothScroll() {
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const y = target.getBoundingClientRect().top + window.scrollY - 200;

      window.scrollTo({ top: y, behavior: 'smooth' });

      if (history.pushState) history.pushState(null, '', href);
    });
  });
})();

/* ============================================================================
   15. MULTI-STEP BUILDER (6 QUESTIONS)
============================================================================ */

const Builder = (() => {
  const questionEl = $('#question');
  const optionsEl = $('#optionsContainer');
  const stepLabel = $('#stepLabel');
  const progressFill = $('#progressFill');
  const backBtn = $('#backBtn');
  const nextBtn = $('#nextBtn');
  const answersList = $('#answersList');

  if (!questionEl || !optionsEl || !nextBtn) return null;

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
  const KEY = NEXIFING.storageKeys.answers;
  const saved = storage.get(KEY, {});
  const answers = { ...saved };

  function render() {
    const s = steps[step];

    if (stepLabel) stepLabel.textContent = `STEP ${step + 1} / ${steps.length}`;
    questionEl.textContent = s.q;

    if (progressFill) {
      progressFill.style.width = ((step + 1) / steps.length) * 100 + '%';
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

      btn.addEventListener('click', () => {
        Sound.click();
        selectOption(opt);
      });
      optionsEl.appendChild(btn);
    });

    if (backBtn) backBtn.style.display = step > 0 ? 'inline-flex' : 'none';

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

    storage.set(KEY, answers);
    render();
    updatePreview();
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (step > 0) {
        step--;
        Sound.click();
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

    Sound.click();

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

  return { steps, answers };
})();

/* ============================================================================
   16. FAQ ACCORDION
============================================================================ */

(function initFaq() {
  const items = $$('.faq-item');
  if (!items.length) return;

  items.forEach((item) => {
    const q = $('.faq-question', item);
    if (!q) return;

    q.addEventListener('click', () => {
      Sound.click();
      const isOpen = item.classList.contains('open');
      items.forEach((i) => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  if (items[0]) items[0].classList.add('open');
})();

/* ============================================================================
   17. CONTACT FORM → WHATSAPP (WITH FULL BRIEF)
============================================================================ */

(function initContactForm() {
  const form = $('#contactForm');
  const statusMsg = $('#statusMsg');
  if (!form) return;

  // Auto-save draft
  const autoSave = debounce(() => {
    storage.set(NEXIFING.storageKeys.draftMessage, {
      name: $('#name')?.value || '',
      email: $('#email')?.value || '',
      idea: $('#idea')?.value || '',
    });
  }, 500);

  ['name', 'email', 'idea'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', autoSave);
  });

  // Restore draft
  const draft = storage.get(NEXIFING.storageKeys.draftMessage, {});
  if (draft.name && $('#name')) $('#name').value = draft.name;
  if (draft.email && $('#email')) $('#email').value = draft.email;
  if (draft.idea && $('#idea')) $('#idea').value = draft.idea;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (statusMsg) {
      statusMsg.textContent = 'Opening WhatsApp...';
      statusMsg.className = 'status-msg';
    }

    const name = $('#name')?.value.trim() || '';
    const email = $('#email')?.value.trim() || '';
    const idea = $('#idea')?.value.trim() || '';

    // Validate
    if (!name || !email) {
      Toast.error('Please fill in your name and email.');
      Sound.error();
      return;
    }

    // Build message
    let message = `Hi Nexifing! 👋\n\n`;
    message += `*Name:* ${name}\n`;
    message += `*Email:* ${email}\n\n`;

    // ALWAYS show brief with all 6 questions
    message += `*My Website Brief:*\n`;

    const saved = storage.get(NEXIFING.storageKeys.answers, {});
    const questions = [
      ['What kind of website?', saved.type],
      ['What vibe?', saved.style],
      ['How many pages?', saved.pages],
      [
        'Must-have features?',
        Array.isArray(saved.features)
          ? saved.features.join(', ')
          : saved.features,
      ],
      ['Who is the site for?', saved.audience],
      ['Timeline?', saved.budget],
    ];

    questions.forEach(([label, value]) => {
      const v = value && value !== '—' ? value : '_(not answered)_';
      message += `• ${label} → ${v}\n`;
    });

    message += `\n`;

    if (idea) {
      message += `*Extra notes:*\n${idea}\n`;
    }

    const encoded = encodeURIComponent(message);
    const waURL = `https://wa.me/${NEXIFING.whatsapp}?text=${encoded}`;

    window.open(waURL, '_blank');

    if (statusMsg) {
      statusMsg.textContent = `✅ Opening WhatsApp... Or call us at ${NEXIFING.phone}`;
      statusMsg.className = 'status-msg success';
    }

    Toast.success('Opening WhatsApp!', 4000);
    Sound.success();
    Confetti.burst(60);

    storage.remove(NEXIFING.storageKeys.draftMessage);
  });
})();

/* ============================================================================
   18. NEWSLETTER FORM
============================================================================ */

(function initNewsletter() {
  const form = $('#newsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const input = form.querySelector('input');
    const email = input?.value.trim();
    if (!email) return;

    const message = `Hi Nexifing! 👋\n\nI want to subscribe to your newsletter.\n\n*Email:* ${email}`;
    const encoded = encodeURIComponent(message);
    const waURL = `https://wa.me/${NEXIFING.whatsapp}?text=${encoded}`;

    window.open(waURL, '_blank');

    Toast.success('Opening WhatsApp to subscribe!', 4000);
    Sound.success();

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
   19. SCROLL REVEAL
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
   20. BACK TO TOP
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
    Sound.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================================
   21. FLOATING WHATSAPP BUTTON
============================================================================ */

(function initCallButton() {
  const btn = $('.call-float');
  if (!btn) return;

  btn.setAttribute('href', `https://wa.me/${NEXIFING.whatsapp}`);
  btn.setAttribute('target', '_blank');
  btn.setAttribute('rel', 'noopener');
  btn.setAttribute('aria-label', `Chat on WhatsApp: ${NEXIFING.phone}`);
  btn.setAttribute('title', `Chat on WhatsApp: ${NEXIFING.phone}`);
})();

/* ============================================================================
   22. FOOTER YEAR
============================================================================ */

(function initFooterYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ============================================================================
   23. COUNTER ANIMATIONS
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
   24. COPY PHONE TO CLIPBOARD
============================================================================ */

(function initCopyPhone() {
  $$('[data-copy-phone]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();

      navigator.clipboard
        .writeText(NEXIFING.phone)
        .then(() => {
          Toast.success('Phone number copied!', 2500);
          Sound.success();
        })
        .catch(() => {
          Toast.error('Could not copy. Call us: ' + NEXIFING.phone);
        });
    });
  });
})();

/* ============================================================================
   25. KEYBOARD SHORTCUTS
============================================================================ */

(function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document
        .querySelectorAll('.toast')
        .forEach((t) => t.classList.add('hiding'));
    }

    // Ctrl+K → focus name
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const nameInput = $('#name');
      if (nameInput) {
        nameInput.focus();
        nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Ctrl+W → WhatsApp
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
      e.preventDefault();
      window.open(`https://wa.me/${NEXIFING.whatsapp}`, '_blank');
    }
  });
})();

/* ============================================================================
   26. EASTER EGGS
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
        setTimeout(() => (document.body.style.transform = ''), 700);
        Toast.success('🎉 You found the secret!', 4000);
        Confetti.burst(120);
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
        Confetti.burst(40);
        clicks = 0;
      }
    });
  }
})();

/* ============================================================================
   27. CONSOLE SIGNATURE
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
  console.log(
    '%cBuilt with HTML, CSS & JavaScript',
    'color: #1e3a8a; font-size: 12px;'
  );
  console.log(
    `%cWhatsApp us → ${NEXIFING.phone}`,
    'color: #27272a; font-size: 12px;'
  );
})();

/* ============================================================================
   28. INITIALIZATION
============================================================================ */

(function init() {
  console.log(
    '%cNexifing ✓ Loaded successfully',
    'color: #064e3b; font-weight: bold; font-size: 13px;'
  );
})();
