// Site behaviour: theme, nav, reveal-on-scroll, counters,
// lightbox, testimonial carousel, copy-email and the ⌘K command palette.
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  root.classList.add("js");
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Theme ---------- */
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const currentTheme = () => root.dataset.theme || (systemDark.matches ? "dark" : "light");

  function setTheme(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem("theme", theme); } catch (e) { /* storage unavailable */ }
  }
  function toggleTheme() { setTheme(currentTheme() === "dark" ? "light" : "dark"); }
  $("#theme-toggle")?.addEventListener("click", toggleTheme);

  /* ---------- Nav: scrolled state, mobile menu, active section ---------- */
  const nav = $("#nav");
  const navLinks = $$(".nav__links a");
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
    // Nothing is "active" while the hero is on screen.
    if (window.scrollY < window.innerHeight * 0.5) navLinks.forEach(a => a.classList.remove("is-active"));
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const menuBtn = $("#menu-toggle");
  const mobileMenu = $("#mobile-menu");
  function setMenu(open) {
    mobileMenu.hidden = !open;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  menuBtn?.addEventListener("click", () => setMenu(mobileMenu.hidden));
  $$("a", mobileMenu).forEach(a => a.addEventListener("click", () => setMenu(false)));

  const sections = navLinks.map(a => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || window.scrollY < window.innerHeight * 0.5) return;
        navLinks.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(el => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------- Stat counters ---------- */
  const counters = $$("[data-count]");
  const formatCount = n => String(Math.round(n));
  if (!reduceMotion && "IntersectionObserver" in window) {
    const co = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count);
        const start = performance.now();
        const dur = 1200;
        const tick = now => {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = formatCount(target * eased);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => co.observe(el));
  }

  /* ---------- Lightbox ---------- */
  const lightbox = $("#lightbox");
  const lbImg = $("img", lightbox);
  const lbCap = $("figcaption", lightbox);
  let lbReturnFocus = null;

  function openLightbox(src, caption, alt) {
    lbReturnFocus = document.activeElement;
    lbImg.src = src;
    lbImg.alt = alt || "";
    lbCap.textContent = caption || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    $(".lightbox__close", lightbox).focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    lbReturnFocus?.focus();
  }
  $$("[data-lightbox]").forEach(btn => {
    btn.addEventListener("click", () => openLightbox(btn.dataset.lightbox, btn.dataset.caption, $("img", btn)?.alt));
  });
  lightbox.addEventListener("click", closeLightbox);

  /* ---------- Testimonials carousel ---------- */
  const quotes = $("#quotes");
  const updateQuoteEdge = () =>
    quotes.classList.toggle("at-end", quotes.scrollLeft + quotes.clientWidth >= quotes.scrollWidth - 8);
  quotes.addEventListener("scroll", updateQuoteEdge, { passive: true });
  updateQuoteEdge();
  $$("[data-scroll]").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = $(".quote", quotes);
      const step = card ? card.getBoundingClientRect().width + 16 : 400;
      quotes.scrollBy({ left: step * Number(btn.dataset.scroll), behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  /* ---------- Copy email ---------- */
  const EMAIL = "vemulasaiharsha@gmail.com";
  const copyBtn = $("#copy-email");

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      return true;
    } catch (e) {
      window.location.href = "mailto:" + EMAIL;
      return false;
    }
  }
  copyBtn?.addEventListener("click", async () => {
    const hint = $(".email-copy__hint", copyBtn);
    if (await copyEmail()) {
      copyBtn.classList.add("is-copied");
      hint.textContent = "Copied!";
      setTimeout(() => { copyBtn.classList.remove("is-copied"); hint.textContent = "Copy"; }, 1800);
    }
  });

  /* ---------- Command palette ---------- */
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  if (!isMac) $$(".kbd-btn kbd").forEach(k => { k.textContent = "Ctrl K"; });

  const palette = $("#palette");
  const pInput = $("#palette-input");
  const pList = $("#palette-list");
  let pIndex = 0;
  let pItems = [];
  let pReturnFocus = null;

  const go = id => () => $(id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  const open = url => () => window.open(url, "_blank", "noopener");
  const COMMANDS = [
    { label: "About", hint: "section", run: go("#about") },
    { label: "Experience", hint: "section", run: go("#experience") },
    { label: "Projects: NGEN-Datastream", hint: "section", run: go("#projects") },
    { label: "NRDS live run dashboard", hint: "link", run: open("https://ciroh-community-ngen-datastream.s3.amazonaws.com/status/dashboard.html") },
    { label: "NRDS output data explorer", hint: "link", run: open("https://datastream.ciroh.org/index.html") },
    { label: "NRDS on GitHub", hint: "link", run: open("https://github.com/CIROH-UA/ngen-datastream") },
    { label: "How this site is built", hint: "section", run: go("#stack") },
    { label: "Talks & posters", hint: "section", run: go("#talks") },
    { label: "Certifications", hint: "section", run: go("#certs") },
    { label: "Testimonials", hint: "section", run: go("#testimonials") },
    { label: "Contact", hint: "section", run: go("#contact") },
    { label: "Ask the AI assistant", hint: "action", run: () => window.openChat?.() },
    { label: "Copy email address", hint: "action", run: copyEmail },
    { label: "Toggle light / dark theme", hint: "action", run: toggleTheme },
    { label: "Download resume (PDF)", hint: "link", run: open("resume/Sai_Harsha_Vemula_Resume.pdf") },
    { label: "Book a 30-minute call", hint: "link", run: open("https://calendly.com/vemulasaiharsha/30min") },
    { label: "LinkedIn", hint: "link", run: open("https://www.linkedin.com/in/saiharshavemula/") },
    { label: "GitHub", hint: "link", run: open("https://github.com/harshavemula-ua") },
    { label: "Medium blog", hint: "link", run: open("https://medium.com/@harshaharshuharsha") },
  ];

  function renderPalette() {
    const q = pInput.value.trim().toLowerCase();
    pItems = COMMANDS.filter(c => c.label.toLowerCase().includes(q));
    pIndex = Math.min(pIndex, Math.max(0, pItems.length - 1));
    pList.replaceChildren();
    if (!pItems.length) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "No matches";
      pList.append(li);
      return;
    }
    pItems.forEach((c, i) => {
      const li = document.createElement("li");
      li.id = "pal-" + i;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(i === pIndex));
      const label = document.createElement("span");
      label.textContent = c.label;
      const hint = document.createElement("small");
      hint.textContent = c.hint;
      li.append(label, hint);
      li.addEventListener("mousemove", () => { if (pIndex !== i) { pIndex = i; renderPalette(); } });
      li.addEventListener("click", () => runCommand(i));
      pList.append(li);
    });
    pInput.setAttribute("aria-activedescendant", "pal-" + pIndex);
    $("#pal-" + pIndex)?.scrollIntoView({ block: "nearest" });
  }
  function openPalette() {
    pReturnFocus = document.activeElement;
    palette.hidden = false;
    pInput.value = "";
    pIndex = 0;
    renderPalette();
    pInput.focus();
  }
  function closePalette() {
    palette.hidden = true;
    pReturnFocus?.focus?.();
  }
  function runCommand(i) {
    const cmd = pItems[i];
    if (!cmd) return;
    closePalette();
    cmd.run();
  }

  $$("[data-open-palette]").forEach(b => b.addEventListener("click", openPalette));
  $$("[data-close-palette]").forEach(b => b.addEventListener("click", closePalette));
  pInput.addEventListener("input", () => { pIndex = 0; renderPalette(); });
  pInput.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); pIndex = (pIndex + 1) % Math.max(1, pItems.length); renderPalette(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); pIndex = (pIndex - 1 + pItems.length) % Math.max(1, pItems.length); renderPalette(); }
    else if (e.key === "Enter") { e.preventDefault(); runCommand(pIndex); }
  });

  /* ---------- Global keys ---------- */
  document.addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      palette.hidden ? openPalette() : closePalette();
      return;
    }
    if (e.key === "Escape") {
      if (!palette.hidden) closePalette();
      else if (!lightbox.hidden) closeLightbox();
      else if (!mobileMenu.hidden) setMenu(false);
    }
  });
})();
