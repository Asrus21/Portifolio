/* ========================================================
   PORTFOLIO · MAIN SCRIPT
   - Tema claro/escuro (persistente)
   - Troca de idioma PT/EN (persistente)
   - Scroll suave aprimorado (lerp)
   - Botão voltar ao topo
   ======================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* -------------------- 1. TEMA -------------------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");

  // Prioridade: localStorage > preferência do sistema > claro
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
  root.setAttribute("data-theme", initialTheme);

  themeToggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* -------------------- 2. IDIOMA -------------------- */
  const langButton = document.getElementById("langButton");
  const langMenu = document.getElementById("langMenu");
  const langLabel = document.getElementById("langLabel");

  function applyLang(lang) {
    if (!translations[lang]) return;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const value = translations[lang][key];
      if (value !== undefined) el.textContent = value;
    });
    document.documentElement.setAttribute("lang", lang === "pt" ? "pt-BR" : "en");
    langLabel.textContent = lang.toUpperCase();
    localStorage.setItem("lang", lang);
  }

  // Aplica idioma salvo ou padrão (pt)
  const savedLang = localStorage.getItem("lang") || "pt";
  applyLang(savedLang);

  langButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const expanded = langButton.getAttribute("aria-expanded") === "true";
    langButton.setAttribute("aria-expanded", String(!expanded));
    langMenu.hidden = expanded;
  });

  langMenu.querySelectorAll("li").forEach(li => {
    li.addEventListener("click", () => {
      applyLang(li.dataset.lang);
      langMenu.hidden = true;
      langButton.setAttribute("aria-expanded", "false");
    });
  });

  // Fecha o menu de idioma ao clicar fora
  document.addEventListener("click", (e) => {
    if (!langMenu.hidden && !e.target.closest(".lang-switch")) {
      langMenu.hidden = true;
      langButton.setAttribute("aria-expanded", "false");
    }
  });

  /* -------------------- 3. BOTÃO VOLTAR AO TOPO -------------------- */
  const backToTop = document.getElementById("backToTop");

  function toggleBackToTop() {
    if (window.scrollY > 500) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  }
  window.addEventListener("scroll", toggleBackToTop, { passive: true });
  toggleBackToTop();

  backToTop.addEventListener("click", () => {
    smoothScrollTo(0);
  });

  /* -------------------- 4. ANO DO RODAPÉ -------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------------------- 5. SCROLL SUAVE PARA LINKS DE ÂNCORA -------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = 80; // altura aproximada do header
      const targetY = target.getBoundingClientRect().top + window.scrollY - offset;
      smoothScrollTo(targetY);
    });
  });

  /* -------------------- 6. SCROLL SUAVE GLOBAL (LERP) --------------------
     Cria uma sensação mais "macia" no scroll da página, similar à experiência
     de bibliotecas como Lenis, mas em vanilla JS — sem dependências externas.
     Respeita preferências de movimento reduzido.
  ------------------------------------------------------------------------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Detecção: dispositivos touch tendem a ter scroll nativo já bem suave,
  // e interferir nele pode quebrar a experiência. Aplicamos apenas em desktop.
  const isTouch = window.matchMedia("(pointer: coarse)").matches;

  let targetScroll = window.scrollY;
  let currentScroll = window.scrollY;
  const ease = 0.1; // quanto menor, mais suave (e mais lento)
  let rafId = null;
  let isProgrammatic = false;

  function rafLoop() {
    currentScroll += (targetScroll - currentScroll) * ease;
    if (Math.abs(targetScroll - currentScroll) < 0.5) {
      currentScroll = targetScroll;
      window.scrollTo(0, currentScroll);
      rafId = null;
      isProgrammatic = false;
      return;
    }
    window.scrollTo(0, currentScroll);
    rafId = requestAnimationFrame(rafLoop);
  }

  function smoothScrollTo(y) {
    targetScroll = Math.max(0, y);
    if (reduceMotion) {
      window.scrollTo(0, targetScroll);
      return;
    }
    isProgrammatic = true;
    if (!rafId) rafId = requestAnimationFrame(rafLoop);
  }

  if (!reduceMotion && !isTouch) {
    // Intercepta o wheel para suavizar progressivamente
    window.addEventListener("wheel", (e) => {
      e.preventDefault();
      // Ajuste do delta: ctrlKey indica zoom, deixa o nativo cuidar
      if (e.ctrlKey) return;
      targetScroll += e.deltaY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
      if (!rafId) rafId = requestAnimationFrame(rafLoop);
    }, { passive: false });

    // Sincroniza targetScroll quando o usuário usa teclado, barra de rolagem ou outros meios
    window.addEventListener("scroll", () => {
      if (!isProgrammatic && !rafId) {
        targetScroll = window.scrollY;
        currentScroll = window.scrollY;
      }
    }, { passive: true });
  }

  /* -------------------- 7. ANIMAÇÃO DE ENTRADA AO SCROLL -------------------- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });

  document.querySelectorAll(".skill-card, .project-card, .contact-card, .section-head").forEach(el => {
    el.classList.add("reveal");
    observer.observe(el);
  });
});
