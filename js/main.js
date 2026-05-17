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
       4. NAVEGAÇÃO ENTRE SLIDES
       ======================================================== */
    const slides = Array.from(document.querySelectorAll(".slides-container > .hero, .slides-container > .section"));
    let currentIndex = 0;
    let isTransitioning = false;
    const TRANSITION_MS = 850;

    console.log("[Portfolio] Slides encontrados:", slides.length, slides.map(s => s.id));

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

      // Quando troca de slide, leva o scroll interno do novo slide para o topo
      const newSlide = slides[currentIndex];
      if (newSlide) newSlide.scrollTop = 0;

      // Atualiza hash da URL
      const slideId = slides[currentIndex].id;
      if (slideId && history.replaceState) {
        history.replaceState(null, "", "#" + slideId);
      }

      setTimeout(function () {
        isTransitioning = false;
      }, TRANSITION_MS);
    }

    // Inicialização sem animação
    function forceShowSlide(index) {
      const allElements = document.querySelectorAll('*');
      const originalTransitions = [];

      allElements.forEach(el => {
        originalTransitions.push(el.style.transition);
        el.style.transition = 'none';
      });

      document.body.offsetHeight; // força reflow

      currentIndex = index;
      updateSlideClasses();

      requestAnimationFrame(() => {
        allElements.forEach((el, i) => {
          el.style.transition = originalTransitions[i];
        });
        revealCardsOfSlide(slides[currentIndex]);
        console.log("[Portfolio] Slide exibido:", slides[currentIndex].id);
      });
    }

    updateSlideClasses();

    if (window.location.hash) {
      const hash = window.location.hash.slice(1);
      console.log("[Portfolio] Hash detectado:", hash);

      const targetIndex = slides.findIndex(function (s) {
        return s.id === hash;
      });

      console.log("[Portfolio] Target index:", targetIndex);

      if (targetIndex !== -1) {
        setTimeout(() => {
          forceShowSlide(targetIndex);
        }, 50);
      }
    }

    /* ---------- 5. CONTROLES DE NAVEGAÇÃO ---------- */

    // Verifica se o slide atual ainda tem conteúdo pra rolar internamente
    function canScrollInside(slide, direction) {
      const hasInnerScroll = slide.scrollHeight > slide.clientHeight + 2;
      if (!hasInnerScroll) return false;
      const atTop    = slide.scrollTop <= 1;
      const atBottom = Math.abs(slide.scrollHeight - slide.clientHeight - slide.scrollTop) < 2;
      if (direction > 0 && !atBottom) return true;  // descendo e ainda há conteúdo abaixo
      if (direction < 0 && !atTop) return true;     // subindo e ainda há conteúdo acima
      return false;
    }

    // --- Mouse / trackpad ---
    let wheelLock = false;
    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey) return;

      const active = slides[currentIndex];
      if (canScrollInside(active, e.deltaY)) return;

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

    // --- Teclado ---
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

    /* ---------- 5b. TOUCH / SWIPE (CELULAR) ---------- */
    // Exige um deslize longo e rápido pra trocar de seção.
    // Se a seção tem conteúdo interno, deixa rolar primeiro.
    const SWIPE_MIN_DISTANCE = 110;  // px — deslize mínimo pra trocar de slide
    const SWIPE_MAX_TIME     = 800;  // ms — gesto precisa ser razoavelmente rápido
    const SWIPE_MAX_OFFAXIS  = 80;   // px — ignora se for mais horizontal que vertical

    let touchStartY = 0;
    let touchStartX = 0;
    let touchStartTime = 0;

    window.addEventListener("touchstart", function (e) {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      touchStartTime = Date.now();
    }, { passive: true });

    window.addEventListener("touchend", function (e) {
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const diffY = touchStartY - touchEndY;          // positivo = deslizou pra cima
      const diffX = touchStartX - touchEndX;
      const elapsed = Date.now() - touchStartTime;

      // Ignora gestos lentos demais (provavelmente é leitura/scroll, não swipe)
      if (elapsed > SWIPE_MAX_TIME) return;

      // Ignora se o movimento foi mais horizontal que vertical
      if (Math.abs(diffX) > SWIPE_MAX_OFFAXIS && Math.abs(diffX) > Math.abs(diffY)) return;

      // Exige deslize vertical longo o suficiente
      if (Math.abs(diffY) < SWIPE_MIN_DISTANCE) return;

      // Se a seção atual ainda pode rolar internamente nessa direção, não troca de slide
      const active = slides[currentIndex];
      if (canScrollInside(active, diffY)) return;

      if (diffY > 0) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(currentIndex - 1);
      }
    }, { passive: true });

    /* ---------- 6. LINKS DE ÂNCORA ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;

        const id = href.split('#').pop();
        const targetIndex = slides.findIndex(function (s) { return s.id === id; });

        if (targetIndex === -1) return;
        e.preventDefault();
        goToSlide(targetIndex);
      });
    });

    /* ---------- 7. BOTÃO VOLTAR AO TOPO ---------- */
    const backToTop = document.getElementById("backToTop");
    if (backToTop) {
      function updateBackToTop() {
        let opacity;
        if (currentIndex === 0) {
          opacity = 0;
        } else {
          opacity = Math.min(1, currentIndex * 0.35 + 0.05);
        }
        backToTop.style.opacity = opacity;
        backToTop.style.transform = "translateY(" + ((1 - opacity) * 20) + "px)";
        backToTop.style.pointerEvents = opacity > 0.1 ? "auto" : "none";
      }

      const moBack = new MutationObserver(updateBackToTop);
      slides.forEach(function (s) {
        moBack.observe(s, { attributes: true, attributeFilter: ["class"] });
      });
      updateBackToTop();

      backToTop.addEventListener("click", function () {
        goToSlide(0);
      });
    }

    /* ---------- 8. REVEAL DOS CARDS ---------- */
    document.querySelectorAll(".skill-card, .project-card, .contact-card").forEach(function (el) {
      el.classList.add("reveal");
    });

    function revealCardsOfSlide(slide) {
      const cards = slide.querySelectorAll(".reveal");
      cards.forEach(function (card, idx) {
        setTimeout(function () {
          card.classList.add("in-view");
        }, 300 + idx * 60);
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
