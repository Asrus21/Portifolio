/* ========================================================
   PORTFOLIO · MAIN SCRIPT
   ======================================================== */

(function () {
  "use strict";

  console.log("[Portfolio] main.js carregado ✓");

  function init() {
    console.log("[Portfolio] inicializando…");

    const root = document.documentElement;

    /* ---------- 1. TEMA ---------- */
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", savedTheme || (prefersDark ? "dark" : "light"));

      themeToggle.addEventListener("click", function () {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
      });
    }

    /* ---------- 2. IDIOMA ---------- */
    const langButton = document.getElementById("langButton");
    const langMenu   = document.getElementById("langMenu");
    const langLabel  = document.getElementById("langLabel");

    function applyLang(lang) {
      if (typeof translations === "undefined" || !translations[lang]) return;
      document.querySelectorAll("[data-i18n]").forEach(function (el) {
        const val = translations[lang][el.dataset.i18n];
        if (val !== undefined) el.textContent = val;
      });
      root.lang = lang === "pt" ? "pt-BR" : "en";
      if (langLabel) langLabel.textContent = lang.toUpperCase();
      localStorage.setItem("lang", lang);
    }

    applyLang(localStorage.getItem("lang") || "pt");

    if (langButton && langMenu) {
      langButton.addEventListener("click", function (e) {
        e.stopPropagation();
        const open = langButton.getAttribute("aria-expanded") === "true";
        langButton.setAttribute("aria-expanded", String(!open));
        langMenu.hidden = open;
      });

      langMenu.querySelectorAll("li").forEach(function (li) {
        li.addEventListener("click", function () {
          applyLang(li.dataset.lang);
          langMenu.hidden = true;
          langButton.setAttribute("aria-expanded", "false");
        });
      });

      document.addEventListener("click", function (e) {
        if (!langMenu.hidden && !e.target.closest(".lang-switch")) {
          langMenu.hidden = true;
          langButton.setAttribute("aria-expanded", "false");
        }
      });
    }

    /* ---------- 3. ANO DO RODAPÉ ---------- */
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ========================================================
       4. SCROLL SUAVE — ANIMAÇÃO MANUAL (RAF + EASING)
       ======================================================== */
    const HEADER_H = 80;
    const DURATION = 1000; // 1 segundo

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function smoothScrollTo(targetY) {
      targetY = Math.max(0, targetY);
      const startY = window.pageYOffset || document.documentElement.scrollTop;
      const distance = targetY - startY;

      console.log("[Portfolio] scroll: " + startY + " → " + targetY);

      if (Math.abs(distance) < 1) return;

      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / DURATION, 1);
        const eased = easeInOutCubic(progress);
        const newY = startY + distance * eased;

        window.scrollTo(0, newY);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          console.log("[Portfolio] scroll concluído");
        }
      }

      requestAnimationFrame(step);
    }

    /* ---------- 5. INTERCEPTA LINKS DE ÂNCORA ---------- */
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    console.log("[Portfolio] " + anchorLinks.length + " links de âncora encontrados");

    anchorLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        const id = link.getAttribute("href");
        if (!id || id === "#") return;

        const target = document.querySelector(id);
        if (!target) {
          console.warn("[Portfolio] alvo não encontrado: " + id);
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        const rect = target.getBoundingClientRect();
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + currentScroll - HEADER_H;

        smoothScrollTo(targetY);
      });
    });

    /* ---------- 6. BOTÃO VOLTAR AO TOPO ---------- */
    const backToTop = document.getElementById("backToTop");
    if (backToTop) {
      window.addEventListener("scroll", function () {
        if (window.pageYOffset > 500) {
          backToTop.classList.add("visible");
        } else {
          backToTop.classList.remove("visible");
        }
      }, { passive: true });

      backToTop.addEventListener("click", function () {
        smoothScrollTo(0);
      });
    }

    /* ---------- 7. REVEAL AO SCROLL ---------- */
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });

      document.querySelectorAll(
        ".skill-card, .project-card, .contact-card, .section-head"
      ).forEach(function (el) {
        el.classList.add("reveal");
        observer.observe(el);
      });
    }

    console.log("[Portfolio] tudo pronto ✓");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
