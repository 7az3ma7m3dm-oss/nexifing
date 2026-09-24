/* ==========================================================================
   NEXIFING — script.js v4.0
   Interactive layer for the entire NEXIFING site.
   Handles: nav, animations, forms, utilities, UX polish, analytics hooks.
   Vanilla JS — zero dependencies.
   ========================================================================== */

(() => {
  "use strict";

  /* ==========================================================================
     01. GLOBAL CONFIG
     ========================================================================== */
  const CONFIG = {
    /* Timing */
    headerScrollThreshold: 20,
    backToTopThreshold: 600,
    revealThreshold: 0.08,
    revealRootMargin: "0px 0px -40px 0px",
    revealStagger: 0.03,
    revealMaxDelay: 0.3,

    /* Animation durations */
    countUpDuration: 1400,
    toastDuration: 3000,

    /* Storage keys */
    storageKeys: {
      contactDraft: "nexifing_contact_draft",
      newsletterEmail: "nexifing_newsletter_email",
      theme: "nexifing_theme",
      cookieConsent: "nexifing_cookie_consent"
    },

    /* Endpoints (replace with real ones when ready) */
    endpoints: {
      contact: null,
      newsletter: null
    },

    /* Debug mode */
    debug: false
  };

  /* ==========================================================================
     02. UTILITIES
     ========================================================================== */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const isElement = (el) => el instanceof Element;
  const isString = (v) => typeof v === "string";
  const isFunction = (v) => typeof v === "function";
  const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  const isEmpty = (v) => v === null || v === undefined || v === "" || (Array.isArray(v) && v.length === 0);

  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const escapeHtml = (str) => {
    if (!isString(str)) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  };

  const throttle = (fn, wait = 100) => {
    let last = 0;
    let timer = null;
    return function throttled(...args) {
      const now = Date.now();
      const remaining = wait - (now - last);
      if (remaining <= 0) {
        if (timer) { clearTimeout(timer); timer = null; }
        last = now;
        fn.apply(this, args);
      } else if (!timer) {
        timer = setTimeout(() => {
          last = Date.now();
          timer = null;
          fn.apply(this, args);
        }, remaining);
      }
    };
  };

  const debounce = (fn, wait = 100) => {
    let timer = null;
    return function debounced(...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  };

  const rafThrottle = (fn) => {
    let ticking = false;
    return function rafThrottled(...args) {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        fn.apply(this, args);
        ticking = false;
      });
    };
  };

  const log = (...args) => {
    if (CONFIG.debug) console.log("[NEXIFING]", ...args);
  };

  const warn = (...args) => {
    if (CONFIG.debug) console.warn("[NEXIFING]", ...args);
  };

  const safe = (fn, fallback = null) => {
    try { return fn(); }
    catch (err) { warn("safe() error:", err); return fallback; }
  };

  /* ==========================================================================
     03. STORAGE HELPERS
     ========================================================================== */
  const storage = {
    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        try { return JSON.parse(raw); }
        catch { return raw; }
      } catch { return fallback; }
    },
    set(key, value) {
      try {
        const raw = isString(value) ? value : JSON.stringify(value);
        localStorage.setItem(key, raw);
        return true;
      } catch { return false; }
    },
    remove(key) {
      try { localStorage.removeItem(key); return true; }
      catch { return false; }
    },
    clear() {
      try { localStorage.clear(); return true; }
      catch { return false; }
    }
  };

  /* ==========================================================================
     04. MEDIA QUERIES
     ========================================================================== */
  const mq = {
    mobile: () => window.innerWidth <= 640,
    tablet: () => window.innerWidth <= 900 && window.innerWidth > 640,
    desktop: () => window.innerWidth > 900,
    reducedMotion: () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    darkMode: () => window.matchMedia("(prefers-color-scheme: dark)").matches
  };

  /* ==========================================================================
     05. DATE / TIME HELPERS
     ========================================================================== */
  const time = {
    now: () => new Date(),
    year: () => new Date().getFullYear(),
    format: (date, locale = "en-GB") => {
      const d = date instanceof Date ? date : new Date(date);
      return d.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
    },
    relative: (date) => {
      const d = date instanceof Date ? date : new Date(date);
      const diff = Date.now() - d.getTime();
      const sec = Math.floor(diff / 1000);
      if (sec < 60) return "just now";
      const min = Math.floor(sec / 60);
      if (min < 60) return `${min}m ago`;
      const hrs = Math.floor(min / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      if (days < 30) return `${days}d ago`;
      return time.format(d);
    }
  };

  /* ==========================================================================
     06. TOAST NOTIFICATIONS
     ========================================================================== */
  const Toast = (() => {
    const container = () => {
      let el = document.getElementById("nexifing-toast-container");
      if (!el) {
        el = document.createElement("div");
        el.id = "nexifing-toast-container";
        el.setAttribute("aria-live", "polite");
        el.setAttribute("aria-atomic", "true");
        document.body.appendChild(el);
      }
      return el;
    };

    const icons = {
      success: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
      error: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      warning: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };

    const show = (message, type = "info", duration = CONFIG.toastDuration) => {
      const el = document.createElement("div");
      el.className = `nx-toast nx-toast-${type}`;
      el.setAttribute("role", "status");
      el.innerHTML = `
        <span class="nx-toast-icon">${icons[type] || icons.info}</span>
        <span class="nx-toast-message">${escapeHtml(message)}</span>
        <button class="nx-toast-close" aria-label="Dismiss">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      `;

      container().appendChild(el);
      requestAnimationFrame(() => el.classList.add("nx-toast-visible"));

      const close = () => {
        el.classList.remove("nx-toast-visible");
        setTimeout(() => el.remove(), 300);
      };

      el.querySelector(".nx-toast-close").addEventListener("click", close);

      if (duration > 0) setTimeout(close, duration);
      return { close };
    };

    return {
      success: (msg, dur) => show(msg, "success", dur),
      error: (msg, dur) => show(msg, "error", dur),
      info: (msg, dur) => show(msg, "info", dur),
      warning: (msg, dur) => show(msg, "warning", dur),
      show
    };
  })();

  /* ==========================================================================
     07. MOBILE MENU
     ========================================================================== */
  const MobileMenu = (() => {
    const toggle = $("#menuToggle");
    const nav = $("#nav");
    if (!toggle || !nav) return { open: () => {}, close: () => {}, toggle: () => {} };

    const open = () => {
      toggle.classList.add("active");
      nav.classList.add("open");
      document.body.classList.add("scroll-locked");
      toggle.setAttribute("aria-expanded", "true");
      log("Menu opened");
    };

    const close = () => {
      toggle.classList.remove("active");
      nav.classList.remove("open");
      document.body.classList.remove("scroll-locked");
      toggle.setAttribute("aria-expanded", "false");
      log("Menu closed");
    };

    const flip = () => nav.classList.contains("open") ? close() : open();

    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", flip);

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", close);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) close();
    });

    window.addEventListener("resize", debounce(() => {
      if (mq.desktop() && nav.classList.contains("open")) close();
    }, 150));

    /* Close on outside click */
    document.addEventListener("click", (e) => {
      if (!nav.classList.contains("open")) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      close();
    });

    return { open, close, toggle: flip };
  })();

  /* ==========================================================================
     08. HEADER SCROLL EFFECT
     ========================================================================== */
  const HeaderScroll = (() => {
    const header = $(".header");
    if (!header) return;

    const update = rafThrottle(() => {
      const scrolled = window.pageYOffset > CONFIG.headerScrollThreshold;
      if (scrolled) {
        header.style.boxShadow = "0 1px 0 rgba(255,255,255,.02), 0 8px 24px rgba(0,0,0,.4)";
        header.style.background = "rgba(9,10,12,.92)";
      } else {
        header.style.boxShadow = "none";
        header.style.background = "rgba(9,10,12,.82)";
      }
    });

    window.addEventListener("scroll", update, { passive: true });
    update();
  })();

  /* ==========================================================================
     09. READING PROGRESS BAR
     ========================================================================== */
  const ReadingProgress = (() => {
    const bar = document.createElement("div");
    bar.className = "nx-read-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    const update = rafThrottle(() => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? scrollTop / docHeight : 0;
      bar.style.transform = `scaleX(${clamp(pct, 0, 1)})`;
    });

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", debounce(update, 200));
    update();
  })();

  /* ==========================================================================
     10. SCROLL REVEAL
     ========================================================================== */
  const ScrollReveal = (() => {
    const selectors = [
      ".service",
      ".process-step",
      ".work-card",
      ".industry",
      ".tech-group",
      ".why-item",
      ".faq details",
      ".section-head",
      ".testimonial",
      ".value-card",
      ".team-card",
      ".number-card",
      ".press-item",
      ".blog-card",
      ".intro-p",
      ".intro-left",
      ".newsletter-box",
      ".team-cta"
    ];

    const targets = $$(selectors.join(", "));
    if (!targets.length) return;

    if (mq.reducedMotion()) {
      targets.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: CONFIG.revealThreshold,
        rootMargin: CONFIG.revealRootMargin
      }
    );

    targets.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      const delay = Math.min(i * CONFIG.revealStagger, CONFIG.revealMaxDelay);
      el.style.transition = [
        `opacity .7s cubic-bezier(.22,1,.36,1) ${delay}s`,
        `transform .7s cubic-bezier(.22,1,.36,1) ${delay}s`
      ].join(", ");
      observer.observe(el);
    });
  })();

  /* ==========================================================================
     11. SMOOTH SCROLL FOR ANCHOR LINKS
     ========================================================================== */
  const SmoothScroll = (() => {
    const offset = 80;

    const scrollToTarget = (target) => {
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top,
        behavior: mq.reducedMotion() ? "auto" : "smooth"
      });
    };

    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (!href || href === "#" || href.length < 2) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        scrollToTarget(target);
        if (history.pushState) history.pushState(null, "", href);
      });
    });

    return { scrollToTarget };
  })();

  /* ==========================================================================
     12. FAQ ACCORDION
     ========================================================================== */
  const FAQ = (() => {
    const items = $$(".faq details");
    if (!items.length) return;

    items.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        items.forEach((other) => {
          if (other !== item && other.open) other.open = false;
        });
      });
    });
  })();

  /* ==========================================================================
     13. ACTIVE NAV HIGHLIGHT
     ========================================================================== */
  const ActiveNav = (() => {
    if (!("IntersectionObserver" in window)) return;

    const sections = $$("section[id]");
    const navLinks = $$(".nav a[href^='#']");
    if (!sections.length || !navLinks.length) return;

    const linkMap = new Map();
    navLinks.forEach((link) => {
      const id = link.getAttribute("href").slice(1);
      const section = document.getElementById(id);
      if (section) linkMap.set(section, link);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = linkMap.get(entry.target);
          if (!link || !entry.isIntersecting) return;
          navLinks.forEach((l) => { l.style.color = ""; });
          link.style.color = "var(--text)";
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    linkMap.forEach((_, section) => observer.observe(section));
  })();

  /* ==========================================================================
     14. COUNT-UP ANIMATION
     ========================================================================== */
  const CountUp = (() => {
    const elements = $$(".hero-stats .stat-n");
    if (!elements.length) return;

    if (mq.reducedMotion()) return;

    const animate = (el) => {
      const original = el.textContent.trim();
      const suffixMatch = original.match(/([%+a-zA-Z<>\s]+)$/);
      const suffix = suffixMatch ? suffixMatch[1] : "";
      const numericPart = original.replace(suffix, "").trim();
      const isDecimal = numericPart.includes(".");
      const target = parseFloat(numericPart);

      if (isNaN(target)) return;

      const startTime = performance.now();

      const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / CONFIG.countUpDuration, 1);
        /* easeOutExpo */
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = target * eased;

        el.textContent = isDecimal
          ? current.toFixed(1) + suffix
          : Math.round(current).toLocaleString("en-US") + suffix;

        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    if ("IntersectionObserver" in window) {
      const heroStats = $(".hero-stats");
      if (!heroStats) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          elements.forEach(animate);
          observer.disconnect();
        });
      }, { threshold: 0.4 });

      observer.observe(heroStats);
    }
  })();

  /* ==========================================================================
     15. BACK TO TOP
     ========================================================================== */
  const BackToTop = (() => {
    const btn = document.createElement("button");
    btn.className = "nx-back-to-top";
    btn.setAttribute("aria-label", "Back to top");
    btn.setAttribute("type", "button");
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
    document.body.appendChild(btn);

    btn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: mq.reducedMotion() ? "auto" : "smooth"
      });
    });

    const toggle = rafThrottle(() => {
      btn.classList.toggle("nx-back-to-top-visible", window.pageYOffset > CONFIG.backToTopThreshold);
    });

    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
  })();

  /* ==========================================================================
     16. EXTERNAL LINK SAFETY
     ========================================================================== */
  const ExternalLinks = (() => {
    const hostname = window.location.hostname;

    $$("a[href^='http']").forEach((link) => {
      try {
        const url = new URL(link.href);
        const isExternal = url.hostname !== hostname;
        if (isExternal) {
          link.setAttribute("target", "_blank");
          link.setAttribute("rel", "noopener noreferrer");
        }
      } catch (e) {
        /* ignore invalid URLs */
      }
    });
  })();

  /* ==========================================================================
     17. COPY TO CLIPBOARD
     ========================================================================== */
  const CopyToClipboard = (() => {
    const buttons = $$("[data-copy]");
    if (!buttons.length) return;

    const copy = async (text) => {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch (e) {
          /* fall through to legacy */
        }
      }

      /* Legacy fallback */
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();

      let ok = false;
      try { ok = document.execCommand("copy"); }
      catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const text = btn.dataset.copy;
        if (!text) return;

        const ok = await copy(text);
        if (ok) {
          Toast.success("Copied to clipboard", 1800);
          btn.classList.add("nx-copied");
          setTimeout(() => btn.classList.remove("nx-copied"), 1500);
        } else {
          Toast.error("Copy failed", 1800);
        }
      });
    });
  })();

  /* ==========================================================================
     18. FORM VALIDATION
     ========================================================================== */
  const Form = (() => {
    const validators = {
      required: (v) => (isString(v) && v.trim().length > 0) || "This field is required",
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Please enter a valid email",
      minLength: (n) => (v) => v.trim().length >= n || `Must be at least ${n} characters`,
      maxLength: (n) => (v) => v.trim().length <= n || `Must be under ${n} characters`,
      phone: (v) => /^[\d\s+()-]{7,}$/.test(v.trim()) || "Please enter a valid phone number",
      url: (v) => /^https?:\/\/.+\..+/.test(v.trim()) || "Please enter a valid URL"
    };

    const validateField = (input, rules) => {
      const value = input.value;
      for (const rule of rules) {
        const result = rule(value);
        if (result !== true) return { valid: false, message: result };
      }
      return { valid: true };
    };

    const showError = (input, message) => {
      if (!input) return;
      input.classList.add("nx-error");
      input.setAttribute("aria-invalid", "true");
      let err = input.parentElement.querySelector(".nx-form-error");
      if (!err) {
        err = document.createElement("span");
        err.className = "nx-form-error";
        input.parentElement.appendChild(err);
      }
      err.textContent = message;
      err.style.display = "block";
    };

    const clearError = (input) => {
      if (!input) return;
      input.classList.remove("nx-error");
      input.removeAttribute("aria-invalid");
      const err = input.parentElement.querySelector(".nx-form-error");
      if (err) {
        err.textContent = "";
        err.style.display = "none";
      }
    };

    /* Auto-clear errors on input */
    const attachAutoClear = (input) => {
      if (!input) return;
      const handler = () => clearError(input);
      input.addEventListener("input", handler);
      input.addEventListener("change", handler);
    };

    return { validators, validateField, showError, clearError, attachAutoClear };
  })();

  /* ==========================================================================
     19. CONTACT FORM
     ========================================================================== */
  const ContactForm = (() => {
    const form = $("#contactForm");
    if (!form) return;

    const nameInput = $("#cfName");
    const emailInput = $("#cfEmail");
    const projectInput = $("#cfProject");
    const messageInput = $("#cfMessage");
    const submitBtn = $("#cfSubmit");
    const noteEl = $("#cfNote");

    [nameInput, emailInput, messageInput].forEach(Form.attachAutoClear);

    /* Restore draft */
    const restoreDraft = () => {
      const draft = storage.get(CONFIG.storageKeys.contactDraft);
      if (!draft || !isObject(draft)) return;

      if (draft.name && nameInput) nameInput.value = draft.name;
      if (draft.email && emailInput) emailInput.value = draft.email;
      if (draft.project && projectInput) projectInput.value = draft.project;
      if (draft.message && messageInput) messageInput.value = draft.message;
    };

    /* Save draft */
    const saveDraft = () => {
      const draft = {
        name: nameInput?.value || "",
        email: emailInput?.value || "",
        project: projectInput?.value || "",
        message: messageInput?.value || ""
      };
      storage.set(CONFIG.storageKeys.contactDraft, draft);
    };

    /* Autosave every few seconds while typing */
    let draftTimer = null;
    form.addEventListener("input", () => {
      if (draftTimer) clearTimeout(draftTimer);
      draftTimer = setTimeout(saveDraft, 2500);
    });

    /* Handle submit */
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      let valid = true;

      const nameCheck = Form.validateField(nameInput, [
        Form.validators.required,
        Form.validators.minLength(2),
        Form.validators.maxLength(60)
      ]);
      if (!nameCheck.valid) { Form.showError(nameInput, nameCheck.message); valid = false; }

      const emailCheck = Form.validateField(emailInput, [
        Form.validators.required,
        Form.validators.email
      ]);
      if (!emailCheck.valid) { Form.showError(emailInput, emailCheck.message); valid = false; }

      const messageCheck = Form.validateField(messageInput, [
        Form.validators.required,
        Form.validators.minLength(10),
        Form.validators.maxLength(2000)
      ]);
      if (!messageCheck.valid) { Form.showError(messageInput, messageCheck.message); valid = false; }

      if (!valid) {
        if (noteEl) {
          noteEl.textContent = "Please fix the errors above.";
          noteEl.style.color = "var(--danger)";
        }
        Toast.error("Please check the form");
        return;
      }

      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      if (noteEl) noteEl.textContent = "";

      /* Simulated submit — replace with real endpoint */
      const send = async () => {
        if (CONFIG.endpoints.contact) {
          const res = await fetch(CONFIG.endpoints.contact, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: nameInput.value.trim(),
              email: emailInput.value.trim(),
              project: projectInput?.value.trim() || "",
              message: messageInput.value.trim()
            })
          });
          if (!res.ok) throw new Error("Network error");
          return;
        }
        /* Fallback: pretend to send */
        await new Promise((resolve) => setTimeout(resolve, 1200));
      };

      try {
        await send();
        if (noteEl) {
          noteEl.textContent = "✓ Message sent — we'll reply within 24 hours.";
          noteEl.style.color = "var(--success)";
        }
        Toast.success("Message sent — we'll reply within 24 hours");
        form.reset();
        storage.remove(CONFIG.storageKeys.contactDraft);
      } catch (err) {
        if (noteEl) {
          noteEl.textContent = "! Something went wrong. Please try again or message us on Discord.";
          noteEl.style.color = "var(--danger)";
        }
        Toast.error("Could not send message");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });

    restoreDraft();
  })();

  /* ==========================================================================
     20. NEWSLETTER FORM
     ========================================================================== */
  const NewsletterForm = (() => {
    const form = $("#newsletterForm");
    if (!form) return;

    const emailInput = $("#nlEmail");
    const noteEl = $("#nlNote");

    Form.attachAutoClear(emailInput);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const check = Form.validateField(emailInput, [
        Form.validators.required,
        Form.validators.email
      ]);

      if (!check.valid) {
        Form.showError(emailInput, check.message);
        if (noteEl) {
          noteEl.textContent = check.message;
          noteEl.style.color = "var(--danger)";
        }
        return;
      }

      const email = emailInput.value.trim();
      const submitBtn = form.querySelector("button[type='submit']");
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Subscribing...";

      try {
        /* Simulated — replace with endpoint */
        await new Promise((resolve) => setTimeout(resolve, 900));

        storage.set(CONFIG.storageKeys.newsletterEmail, email);
        if (noteEl) {
          noteEl.textContent = "✓ You're subscribed. Check your inbox.";
          noteEl.style.color = "var(--success)";
        }
        Toast.success("Subscribed");
        form.reset();
      } catch (err) {
        if (noteEl) {
          noteEl.textContent = "Something went wrong. Try again.";
          noteEl.style.color = "var(--danger)";
        }
        Toast.error("Subscription failed");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  })();

  /* ==========================================================================
     21. HERO PARALLAX
     ========================================================================== */
  const HeroParallax = (() => {
    if (mq.reducedMotion()) return;

    const beam = $(".aurora-beam");
    const glows = $$(".aurora-glow");
    if (!beam && !glows.length) return;

    const update = rafThrottle(() => {
      const y = window.pageYOffset;
      if (y > 1200) return;

      if (beam) {
        beam.style.transform = `translateX(-50%) translateY(${y * 0.15}px) scale(${1 + y * 0.00008})`;
      }

      glows.forEach((glow, i) => {
        const factor = 0.15 + i * 0.1;
        glow.style.transform = `translateY(${y * factor}px)`;
      });
    });

    window.addEventListener("scroll", update, { passive: true });
  })();

  /* ==========================================================================
     22. IMAGE PREFETCH
     ========================================================================== */
  const Prefetch = (() => {
    const images = ["nexifing-logo.png", "favicon.png"];

    const load = () => {
      images.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(load, { timeout: 3000 });
    } else {
      setTimeout(load, 2000);
    }
  })();

  /* ==========================================================================
     23. LAZY LOAD IMAGES
     ========================================================================== */
  const LazyImages = (() => {
    const images = $$('img[loading="lazy"]');
    if (!images.length) return;

    images.forEach((img) => {
      const handleLoad = () => img.classList.add("loaded");
      if (img.complete) handleLoad();
      else img.addEventListener("load", handleLoad, { once: true });
    });
  })();

  /* ==========================================================================
     24. KEYBOARD SHORTCUTS
     ========================================================================== */
  const Shortcuts = (() => {
    const isTyping = (el) => {
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        el.isContentEditable
      );
    };

    let lastKey = "";
    let lastTime = 0;

    document.addEventListener("keydown", (e) => {
      if (isTyping(e.target)) return;

      /* Single-key shortcuts */
      if (e.key === "/") {
        const searchInput = $("#searchInput");
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
          return;
        }
      }

      if (e.key === "Escape") {
        const openModal = $(".nx-modal-open");
        if (openModal) {
          openModal.classList.remove("nx-modal-open");
        }
      }

      /* Two-key sequences */
      const now = Date.now();
      if (now - lastTime > 1200) lastKey = "";
      lastTime = now;

      /* "g h" → home */
      if (lastKey === "g" && e.key === "h") {
        window.location.href = "/";
        lastKey = "";
        return;
      }

      /* "g w" → work */
      if (lastKey === "g" && e.key === "w") {
        window.location.href = "/work.html";
        lastKey = "";
        return;
      }

      /* "g c" → contact */
      if (lastKey === "g" && e.key === "c") {
        window.location.href = "/contact.html";
        lastKey = "";
        return;
      }

      lastKey = e.key;
    });
  })();

  /* ==========================================================================
     25. AUTO YEAR
     ========================================================================== */
  const AutoYear = (() => {
    const els = $$("[data-year]");
    const year = time.year();
    els.forEach((el) => { el.textContent = year; });
  })();

  /* ==========================================================================
     26. SMOOTH SCROLL TO HASH ON LOAD
     ========================================================================== */
  const HashScrollOnLoad = (() => {
    if (!window.location.hash) return;

    const target = document.querySelector(window.location.hash);
    if (!target) return;

    /* Wait for layout to settle */
    setTimeout(() => {
      SmoothScroll.scrollToTarget(target);
    }, 200);
  })();

  /* ==========================================================================
     27. NUMBER ANIMATION ON SCROLL (Numbers section)
     ========================================================================== */
  const NumbersCount = (() => {
    if (mq.reducedMotion()) return;
    if (!("IntersectionObserver" in window)) return;

    const bigNumbers = $$(".number-big");
    if (!bigNumbers.length) return;

    const animate = (el) => {
      const original = el.textContent.trim();
      const suffixMatch = original.match(/([%+a-zA-Z<>\s]+)$/);
      const suffix = suffixMatch ? suffixMatch[1] : "";
      const numericPart = original.replace(suffix, "").trim();
      const target = parseFloat(numericPart);
      if (isNaN(target)) return;

      const duration = 1600;
      const startTime = performance.now();

      const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        el.textContent = Math.round(target * eased).toLocaleString("en-US") + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    bigNumbers.forEach((el) => observer.observe(el));
  })();

  /* ==========================================================================
     28. TEAM CARD HOVER EFFECT
     ========================================================================== */
  const TeamHover = (() => {
    const cards = $$(".team-card");
    if (!cards.length) return;

    cards.forEach((card) => {
      const avatar = card.querySelector(".team-avatar");
      if (!avatar) return;

      card.addEventListener("mouseenter", () => {
        avatar.style.transform = "scale(1.08) rotate(-3deg)";
      });

      card.addEventListener("mouseleave", () => {
        avatar.style.transform = "";
      });
    });
  })();

  /* ==========================================================================
     29. BLOG CARD CLICK (stub)
     ========================================================================== */
  const BlogCards = (() => {
    const cards = $$(".blog-card");
    if (!cards.length) return;

    cards.forEach((card) => {
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");

      const handle = () => {
        Toast.info("Full article coming soon", 2000);
      };

      card.addEventListener("click", handle);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handle();
        }
      });
    });
  })();

  /* ==========================================================================
     30. WORK CARD HOVER IMAGE
     ========================================================================== */
  const WorkHover = (() => {
    const cards = $$(".work-card");
    if (!cards.length) return;

    cards.forEach((card) => {
      const visual = card.querySelector(".work-visual");
      if (!visual) return;

      card.addEventListener("mouseenter", () => {
        visual.style.transform = "scale(1.02)";
      });

      card.addEventListener("mouseleave", () => {
        visual.style.transform = "";
      });
    });
  })();

  /* ==========================================================================
     31. SCROLL TO REVEAL (with cleanup)
     ========================================================================== */
  const CleanupOnUnload = (() => {
    window.addEventListener("beforeunload", () => {
      /* Clear any dangling timers */
      log("Page unloading — cleanup done");
    });
  })();

  /* ==========================================================================
     32. VIEWPORT HEIGHT FIX (mobile)
     ========================================================================== */
  const ViewportFix = (() => {
    const setVH = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };

    setVH();
    window.addEventListener("resize", debounce(setVH, 200));
    window.addEventListener("orientationchange", () => setTimeout(setVH, 200));
  })();

  /* ==========================================================================
     33. DEBUG INFO
     ========================================================================== */
  const DebugInfo = (() => {
    if (!CONFIG.debug) return;

    log("Version: 4.0");
    log("Viewport:", `${window.innerWidth}×${window.innerHeight}`);
    log("Reduced motion:", mq.reducedMotion());
    log("Dark mode:", mq.darkMode());
    log("Storage support:", (() => {
      try { localStorage.setItem("__test__", "1"); localStorage.removeItem("__test__"); return true; }
      catch { return false; }
    })());
  })();

  /* ==========================================================================
     34. INJECTED STYLES (toast, back-to-top, progress, forms)
     ========================================================================== */
  const Styles = (() => {
    const style = document.createElement("style");
    style.setAttribute("data-nexifing", "styles");
    style.textContent = `
      /* Reading progress */
      .nx-read-progress{
        position:fixed;
        top:0;
        left:0;
        right:0;
        height:2px;
        background:linear-gradient(90deg,#5683da,#ff8964,#ffffff);
        transform:scaleX(0);
        transform-origin:left;
        z-index:200;
        pointer-events:none;
        transition:transform .1s linear;
      }

      /* Back to top */
      .nx-back-to-top{
        position:fixed;
        bottom:24px;
        right:24px;
        width:48px;
        height:48px;
        border-radius:50%;
        background:#131316;
        border:1px solid #26262b;
        color:#a9a9aa;
        display:flex;
        align-items:center;
        justify-content:center;
        cursor:pointer;
        z-index:90;
        opacity:0;
        pointer-events:none;
        transform:translateY(12px);
        transition:all .3s cubic-bezier(.22,1,.36,1);
        box-shadow:0 8px 24px rgba(0,0,0,.5);
      }
      .nx-back-to-top-visible{
        opacity:1;
        pointer-events:auto;
        transform:translateY(0);
      }
      .nx-back-to-top:hover{
        background:#3d7eff;
        border-color:transparent;
        color:#fff;
        transform:translateY(-2px);
        box-shadow:0 12px 32px rgba(61,126,255,.45);
      }
      .nx-back-to-top svg{display:block}

      /* Toast */
      #nexifing-toast-container{
        position:fixed;
        bottom:32px;
        left:50%;
        transform:translateX(-50%);
        z-index:250;
        display:flex;
        flex-direction:column;
        gap:10px;
        pointer-events:none;
        max-width:calc(100vw - 40px);
      }
      .nx-toast{
        display:flex;
        align-items:center;
        gap:12px;
        padding:14px 20px;
        border-radius:9999px;
        background:#131316;
        border:1px solid #26262b;
        color:#e4e4e6;
        font-family:'Inter',system-ui,sans-serif;
        font-size:14px;
        font-weight:500;
        box-shadow:0 20px 60px rgba(0,0,0,.5);
        pointer-events:auto;
        opacity:0;
        transform:translateY(16px);
        transition:opacity .25s cubic-bezier(.22,1,.36,1),transform .25s cubic-bezier(.22,1,.36,1);
        min-width:220px;
      }
      .nx-toast-visible{opacity:1;transform:translateY(0)}
      .nx-toast-icon{display:flex;flex-shrink:0}
      .nx-toast-icon svg{display:block}
      .nx-toast-message{flex:1;letter-spacing:-.005em}
      .nx-toast-close{
        display:flex;
        align-items:center;
        justify-content:center;
        width:20px;
        height:20px;
        border-radius:50%;
        color:#6a6a6e;
        transition:color .2s ease;
        flex-shrink:0;
      }
      .nx-toast-close:hover{color:#fff}
      .nx-toast-success{border-color:rgba(71,209,140,.4)}
      .nx-toast-success .nx-toast-icon{color:#47d18c}
      .nx-toast-error{border-color:rgba(255,77,77,.4)}
      .nx-toast-error .nx-toast-icon{color:#ff4d4d}
      .nx-toast-info{border-color:rgba(86,131,218,.4)}
      .nx-toast-info .nx-toast-icon{color:#5683da}
      .nx-toast-warning{border-color:rgba(251,191,36,.4)}
      .nx-toast-warning .nx-toast-icon{color:#fbbf24}

      /* Form error */
      .nx-form-error{
        display:block;
        margin-top:6px;
        font-family:'JetBrains Mono',monospace;
        font-size:12px;
        color:#ff4d4d;
        letter-spacing:.02em;
      }
      .nx-error,
      input.nx-error,
      textarea.nx-error{
        border-color:#ff4d4d !important;
      }

      /* Copied state */
      .nx-copied{
        background:rgba(71,209,140,.15) !important;
        border-color:rgba(71,209,140,.5) !important;
        color:#47d18c !important;
      }

      /* Mobile tweaks */
      @media(max-width:640px){
        .nx-back-to-top{bottom:16px;right:16px;width:42px;height:42px}
        .nx-toast{font-size:13px;padding:12px 16px;min-width:auto}
        #nexifing-toast-container{bottom:20px}
      }

      @media(prefers-reduced-motion:reduce){
        .nx-back-to-top,
        .nx-toast,
        .nx-read-progress{transition:none}
      }
    `;
    document.head.appendChild(style);
  })();

  /* ==========================================================================
     35. CONSOLE BANNER
     ========================================================================== */
  const ConsoleBanner = (() => {
    const styles = {
      banner: "background:linear-gradient(135deg,#5683da,#ff8964);color:#fff;font-weight:800;padding:6px 12px;border-radius:6px;letter-spacing:.14em;font-size:12px",
      info: "color:#a9a9aa;font-size:11px",
      tip: "color:#5683da;font-size:11px;font-style:italic"
    };

    try {
      console.log("%c NEXIFING ", styles.banner);
      console.log("%c Web Development Studio · https://7az3ma7m3dm-oss.github.io/nexifing/", styles.info);
      console.log("%c Tip: press '/' to focus search · type 'g h' for home · 'g w' for work · 'g c' for contact", styles.tip);
    } catch (e) {
      /* ignore */
    }
  })();

  /* ==========================================================================
     36. READY FLAG
     ========================================================================== */
  const Ready = (() => {
    document.documentElement.setAttribute("data-nexifing-ready", "true");
    document.documentElement.setAttribute("data-nexifing-version", "4.0");
    log("Ready");
  })();

  /* ==========================================================================
     37. EXPOSE PUBLIC API
     ========================================================================== */
  window.NEXIFING = window.NEXIFING || {};
  Object.assign(window.NEXIFING, {
    version: "4.0",
    config: CONFIG,
    toast: Toast,
    storage,
    time,
    media: mq,
    scrollTo: SmoothScroll.scrollToTarget,
    debug: (on = true) => { CONFIG.debug = on; log("Debug:", on); }
  });

})();
