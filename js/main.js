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
       4. NAVEGAÇÃO ENTRE SLIDES (estilo React Navigation push)
       ======================================================== */
    const slides = Array.from(document.querySelectorAll(".slides-container > .hero, .slides-container > .section"));
    let currentIndex = 0;
    let isTransitioning = false;
    const TRANSITION_MS = 850;

    function updateSlideClasses() {
      slides.forEach(function (slide, i) {
        slide.classList.remove("slide-active", "slide-prev", "slide-next");
        if (i === currentIndex) {
          slide.classList.add("slide-active");
        } else if (i < currentIndex) {
          slide.classList.add("slide-prev");
        } else {
          slide.classList.add("slide-next");
        }
      });
    }

    function goToSlide(index) {
      if (isTransitioning) return;
      if (index < 0 || index >= slides.length) return;
      if (index === currentIndex) return;

      isTransitioning = true;
      currentIndex = index;
      updateSlideClasses();

      // Atualiza hash da URL para refletir a seção atual (sem disparar scroll)
      const slideId = slides[currentIndex].id;
      if (slideId && history.replaceState) {
        history.replaceState(null, "", "#" + slideId);
      }

      setTimeout(function () {
        isTransitioning = false;
      }, TRANSITION_MS);
    }

    // Função para inicializar slide sem animação (para carregamento direto)
function initSlideWithoutAnimation(index) {
  // Remove temporariamente as transições
  slides.forEach(slide => {
    slide.style.transition = 'none';
    // Também remove transições dos filhos
    const children = slide.querySelectorAll('.section-head, .about-grid, .skills-grid, .projects-grid, .contact-lead, .contact-grid, .hero-inner');
    children.forEach(child => {
      child.style.transition = 'none';
    });
  });
  
  // Força um reflow
  slides[0].offsetHeight;
  
  // Aplica as classes sem animação
  currentIndex = index;
  updateSlideClasses();
  
  // Reaplica as transições depois de um frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      slides.forEach(slide => {
        slide.style.transition = '';
        const children = slide.querySelectorAll('.section-head, .about-grid, .skills-grid, .projects-grid, .contact-lead, .contact-grid, .hero-inner');
        children.forEach(child => {
          child.style.transition = '';
        });
      });
    });
  });
}

// Estado inicial
updateSlideClasses();

// Se a URL tem um hash ao abrir, vai direto pro slide certo SEM ANIMAÇÃO
if (window.location.hash) {
  const targetId = window.location.hash.slice(1);
  const targetIndex = slides.findIndex(function (s) { return s.id === targetId; });
  if (targetIndex !== -1 && targetIndex !== 0) {
    initSlideWithoutAnimation(targetIndex);
  }
}

    /* ---------- 5. CONTROLES DE NAVEGAÇÃO ---------- */

    // Roda do mouse — avança ou volta um slide
    let wheelLock = false;
    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey) return; // permite zoom

      // Se a seção atual tem rolagem interna (conteúdo maior que a tela),
      // deixa o scroll nativo funcionar dentro dela
      const active = slides[currentIndex];
      const hasInnerScroll = active.scrollHeight > active.clientHeight;
      if (hasInnerScroll) {
        const atTop    = active.scrollTop === 0;
        const atBottom = Math.abs(active.scrollHeight - active.clientHeight - active.scrollTop) < 2;
        if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) {
          return; // permite scroll interno
        }
      }

      e.preventDefault();
      if (wheelLock || isTransitioning) return;
      wheelLock = true;
      setTimeout(function () { wheelLock = false; }, TRANSITION_MS);

      if (e.deltaY > 0) {
        goToSlide(currentIndex + 1);
      } else if (e.deltaY < 0) {
        goToSlide(currentIndex - 1);
      }
    }, { passive: false });

    // Teclado — setas e PageUp/PageDown
    window.addEventListener("keydown", function (e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        goToSlide(currentIndex + 1);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        goToSlide(currentIndex - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goToSlide(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goToSlide(slides.length - 1);
      }
    });

    // Touch (mobile) — swipe vertical
    let touchStartY = 0;
    window.addEventListener("touchstart", function (e) {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener("touchend", function (e) {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      if (Math.abs(diff) < 50) return; // ignora toques pequenos
      if (diff > 0) goToSlide(currentIndex + 1);
      else goToSlide(currentIndex - 1);
    }, { passive: true });

    /* ---------- 6. LINKS DE ÂNCORA NAVEGAM PARA O SLIDE CORRETO ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        const id = link.getAttribute("href");
        if (!id || id === "#") return;
        const targetIndex = slides.findIndex(function (s) { return s.id === id.slice(1); });
        if (targetIndex === -1) return;
        e.preventDefault();
        goToSlide(targetIndex);
      });
    });

    /* ---------- 7. BOTÃO VOLTAR AO TOPO (fade gradual baseado no slide) ---------- */
    const backToTop = document.getElementById("backToTop");
    if (backToTop) {
      function updateBackToTop() {
        // Esmaece conforme avança pelos slides
        let opacity;
        if (currentIndex === 0) {
          opacity = 0;
        } else {
          // 1 slide = 0.4, 2 = 0.7, 3+ = 1
          opacity = Math.min(1, currentIndex * 0.35 + 0.05);
        }
        backToTop.style.opacity = opacity;
        backToTop.style.transform = "translateY(" + ((1 - opacity) * 20) + "px)";
        backToTop.style.pointerEvents = opacity > 0.1 ? "auto" : "none";
      }

      // Atualiza sempre que o slide muda — observamos via MutationObserver
      const moBack = new MutationObserver(updateBackToTop);
      slides.forEach(function (s) {
        moBack.observe(s, { attributes: true, attributeFilter: ["class"] });
      });
      updateBackToTop();

      backToTop.addEventListener("click", function () {
        goToSlide(0);
      });
    }

    /* ---------- 8. REVEAL DOS CARDS QUANDO SLIDE FICA ATIVO ---------- */
    document.querySelectorAll(
      ".skill-card, .project-card, .contact-card"
    ).forEach(function (el) {
      el.classList.add("reveal");
    });

    // Observa mudança de classe nos slides para disparar reveal dos cards
    function revealCardsOfSlide(slide) {
      const cards = slide.querySelectorAll(".reveal");
      cards.forEach(function (card, idx) {
        setTimeout(function () {
          card.classList.add("in-view");
        }, 300 + idx * 60); // espera o push + cascata
      });
    }
    function hideCardsOfSlide(slide) {
      slide.querySelectorAll(".reveal").forEach(function (card) {
        card.classList.remove("in-view");
      });
    }

    const slideStateObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        const slide = m.target;
        if (slide.classList.contains("slide-active")) {
          revealCardsOfSlide(slide);
        } else {
          hideCardsOfSlide(slide);
        }
      });
    });

    slides.forEach(function (slide) {
      slideStateObserver.observe(slide, { attributes: true, attributeFilter: ["class"] });
      // Dispara para o slide inicial
      if (slide.classList.contains("slide-active")) {
        revealCardsOfSlide(slide);
      }
    });

    console.log("[Portfolio] tudo pronto ✓");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
