/* ============================================
   NEXIFING — JavaScript
   ============================================ */

/* ---------- Typing Effect (Hero) ---------- */
(function () {
  const phrases = [
    'with a single prompt.',
    'in under 24 hours.',
    'no code required.',
    'beautifully responsive.'
  ];
  const el = document.getElementById('typedText');
  if (!el) return;

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const phrase = phrases[phraseIndex];
    if (!deleting) {
      el.textContent = phrase.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === phrase.length) {
        deleting = true;
        setTimeout(tick, 2000);
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
    setTimeout(tick, deleting ? 30 : 70);
  }
  tick();
})();

/* ---------- Mouse Glow on Hero ---------- */
(function () {
  const hero = document.getElementById('hero');
  if (!hero) return;
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
    hero.style.setProperty('--my', (e.clientY - rect.top) + 'px');
  });
})();

/* ---------- Feature Card Cursor Glow ---------- */
(function () {
  document.querySelectorAll('.feature-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--x', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--y', (e.clientY - rect.top) + 'px');
    });
  });
})();

/* ---------- Navbar Scroll Effect ---------- */
(function () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });
})();

/* ---------- Mobile Menu Toggle ---------- */
(function () {
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => menu.classList.remove('open'));
  });
})();

/* ---------- Multi-Step Builder ---------- */
(function () {
  const steps = [
    {
      id: 'type',
      q: 'What kind of website?',
      opts: ['Landing Page', 'Business Site', 'Portfolio', 'E-commerce', 'Web App', 'Blog']
    },
    {
      id: 'style',
      q: 'What vibe should it have?',
      opts: ['Minimal', 'Brutalist', 'Dark & Futuristic', 'Warm & Friendly', 'Corporate', 'Playful']
    },
    {
      id: 'features',
      q: 'Must-have features?',
      opts: ['Contact Form', 'Blog', 'Payments', 'User Login', 'Dashboard', 'Animations', 'SEO', 'Multi-language'],
      multi: true
    }
  ];

  let step = 0;
  const answers = {};

  const questionEl = document.getElementById('question');
  const optionsEl = document.getElementById('optionsContainer');
  const stepLabel = document.getElementById('stepLabel');
  const progressFill = document.getElementById('progressFill');
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');
  const answersList = document.getElementById('answersList');

  if (!questionEl || !optionsEl) return;

  function render() {
    const s = steps[step];
    stepLabel.textContent = `STEP ${step + 1} / ${steps.length}`;
    questionEl.textContent = s.q;
    progressFill.style.width = ((step + 1) / steps.length) * 100 + '%';

    optionsEl.innerHTML = '';
    s.opts.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      const selected = s.multi
        ? (answers[s.id] || []).includes(opt)
        : answers[s.id] === opt;
      if (selected) btn.classList.add('selected');
      btn.onclick = () => selectOption(opt);
      optionsEl.appendChild(btn);
    });

    backBtn.style.display = step > 0 ? 'inline-flex' : 'none';
    nextBtn.textContent = step === steps.length - 1 ? 'Finish ✓' : 'Next →';
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
    render();
    updatePreview();
  }

  backBtn.addEventListener('click', () => {
    if (step > 0) {
      step--;
      render();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (step < steps.length - 1) {
      step++;
      render();
    } else {
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    }
  });

  function updatePreview() {
    if (!answersList) return;
    answersList.innerHTML = '';
    steps.forEach((s) => {
      const val = Array.isArray(answers[s.id])
        ? (answers[s.id].join(', ') || '—')
        : (answers[s.id] || '—');
      const row = document.createElement('div');
      row.innerHTML = `<span>${s.q}</span><span>${val}</span>`;
      answersList.appendChild(row);
    });
  }

  render();
  updatePreview();
})();

/* ---------- FAQ Accordion ---------- */
(function () {
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-question');
    if (!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
})();

/* ---------- Pricing Monthly/Yearly Toggle ---------- */
(function () {
  const toggle = document.getElementById('pricingToggle');
  const labelM = document.getElementById('labelMonthly');
  const labelY = document.getElementById('labelYearly');
  const prices = document.querySelectorAll('.pricing-price');
  let yearly = false;

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    yearly = !yearly;
    toggle.classList.toggle('active', yearly);
    labelM.classList.toggle('active', !yearly);
    labelY.classList.toggle('active', yearly);
    prices.forEach((p) => {
      const price = yearly ? p.dataset.yearly : p.dataset.monthly;
      p.innerHTML = `${price}<span>/mo</span>`;
    });
  });
})();

/* ---------- Contact Form (Formspree) ---------- */
(function () {
  const form = document.getElementById('contactForm');
  const statusMsg = document.getElementById('statusMsg');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusMsg.textContent = 'Sending...';
    statusMsg.style.color = 'var(--text-dim)';

    const payload = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      idea: document.getElementById('idea').value,
      answers: {}
    };

    document.querySelectorAll('#answersList > div').forEach((row) => {
      const spans = row.querySelectorAll('span');
      if (spans.length === 2) {
        payload.answers[spans[0].textContent] = spans[1].textContent;
      }
    });

    try {
      // ⚠️ Replace YOUR_FORM_ID with your real Formspree ID
      const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('fail');

      statusMsg.textContent = "✅ Got it! We'll email you within 24 hours.";
      statusMsg.style.color = 'var(--green)';
      form.reset();
    } catch {
      statusMsg.textContent = '⚠️ Something went wrong. Please try again.';
      statusMsg.style.color = 'var(--pink)';
    }
  });
})();

/* ---------- Newsletter Form ---------- */
(function () {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const original = btn.textContent;
    btn.textContent = '✓ Subscribed!';
    setTimeout(() => {
      btn.textContent = original;
      form.reset();
    }, 2500);
  });
})();

/* ---------- Scroll Reveal ---------- */
(function () {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

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
  revealEls.forEach((el) => io.observe(el));
})();

/* ---------- Back to Top Button ---------- */
(function () {
  const btn = document.getElementById('backTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) btn.classList.add('show');
    else btn.classList.remove('show');
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ---------- Auto Year in Footer ---------- */
(function () {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

/* ---------- Smooth Anchor Scroll (with navbar offset) ---------- */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });
})();

/* ---------- Console Signature ---------- */
console.log(
  '%cNexifing ✓ Loaded',
  'color:#a855f7;font-weight:bold;font-size:14px;'
);
