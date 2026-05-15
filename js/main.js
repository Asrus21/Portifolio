/* ========================================================
   PORTFOLIO · MAIN SCRIPT
   ======================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* -------------------- 1. TEMA -------------------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");

  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme", savedTheme || (prefersDark ? "dark" : "light"));

  themeToggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* -------------------- 2. IDIOMA -------------------- */
  const langButton = document.getElementById("langButton");
  const langMenu   = document.getElementById("langMenu");
  const langLabel  = document.getElementById("langLabel");

  function applyLang(lang) {
    if (!translations[lang]) return;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const val = translations[lang][el.dataset.i18n];
      if (val !== undefined) el.textContent = val;
    });
    root.lang = lang === "pt" ? "pt-BR" : "en";
    langLabel.textContent = lang.toUpperCase();
    localStorage.setItem("lang", lang);
  }

  applyLang(localStorage.getItem("lang") || "pt");

  langButton.addEventListener("click", e => {
    e.stopPropagation();
    const open = langButton.getAttribute("aria-expanded") === "true";
    langButton.setAttribute("aria-expanded", String(!open));
    langMenu.hidden = open;
  });

  langMenu.querySelectorAll("li").forEach(li => {
    li.addEventListener("click", () => {
      applyLang(li.dataset.lang);
      langMenu.hidden = true;
      langButton.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", e => {
    if (!langMenu.hidden && !e.target.closest(".lang-switch")) {
      langMenu.hidden = true;
      langButton.setAttribute("aria-expanded", "false");
    }
  });

  /* -------------------- 3. ANO DO RODAPÉ -------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ========================================================
     4. SCROLL SUAVE — abordagem correta com easing + RAF
     
     Como funciona:
     - Não interceptamos o wheel (isso quebra em Chrome/Firefox)
     - Para cliques em âncoras e botão "voltar ao topo", usamos
       uma função animateTo() que faz lerp com easing suave
     - O scroll do mouse permanece nativo (já é suave em todos
       os SOs modernos com inércia de trackpad/mouse)
     - Resultado: click → transição animada; scroll → nativo fluido
     ======================================================== */

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const HEADER_H = 80; // altura do header fixo
  const DURATION = 900; // duração da animação em ms

  // Easing cúbico — começa rápido, desacelera suavemente no final
  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function animateTo(targetY) {
    if (reduceMotion) {
      window.scrollTo({ top: targetY });
      return;
    }

    const startY    = window.scrollY;
    const distance  = targetY - startY;
    const startTime = performance.now();

    function step(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased    = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  /* -------------------- 5. ÂNCORAS DO MENU -------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      const id = link.getAttribute("href");
      if (id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - HEADER_H;
      animateTo(Math.max(0, y));
    });
  });

  /* -------------------- 6. BOTÃO VOLTAR AO TOPO -------------------- */
  const backToTop = document.getElementById("backToTop");

  window.addEventListener("scroll", () => {
    backToTop.classList.toggle("visible", window.scrollY > 500);
  }, { passive: true });

  backToTop.addEventListener("click", () => animateTo(0));

  /* -------------------- 7. REVEAL AO SCROLL -------------------- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });

  document.querySelectorAll(
    ".skill-card, .project-card, .contact-card, .section-head"
  ).forEach(el => {
    el.classList.add("reveal");
    observer.observe(el);
  });

});
