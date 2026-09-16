// Travels in Kodaikanal — page-specific interactions.
// Tabs (.tk-explorer-tabs, role="tablist") and the tour carousel
// (.carousel-wrapper/.carousel-track) are already wired generically by
// js/main.js — this file only covers what's unique to this page: the
// stat counters and the packages duration/category filter.
(function () {
  "use strict";

  function init() {
    initStatCounters();
    initPackageFilter();
  }

  /* ------------------------------------------------------------------ */
  /* Stat counters — count up once when scrolled into view               */
  /* ------------------------------------------------------------------ */
  function initStatCounters() {
    const values = Array.from(document.querySelectorAll("[data-count-to]"));
    if (!values.length) return;

    const animateCount = (el) => {
      const target = Number(el.dataset.countTo) || 0;
      const suffix = el.dataset.suffix || "";
      const duration = 900;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      values.forEach(animateCount);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );

    values.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* Packages filter — duration segmented control (single-select) +      */
  /* category tags (multi-select toggle), combined with AND logic        */
  /* ------------------------------------------------------------------ */
  function initPackageFilter() {
    const segments = Array.from(document.querySelectorAll(".tk-segment"));
    const tags = Array.from(document.querySelectorAll(".tk-tag"));
    const cards = Array.from(document.querySelectorAll(".tk-package-card"));
    if (!segments.length || !cards.length) return;

    let activeDuration = "all";
    const activeTags = new Set();

    function applyFilter() {
      cards.forEach((card) => {
        const matchesDuration = activeDuration === "all" || card.dataset.duration === activeDuration;
        const cardTags = (card.dataset.tags || "").split(" ");
        const matchesTags = activeTags.size === 0 || Array.from(activeTags).every((t) => cardTags.includes(t));
        card.classList.toggle("is-hidden", !(matchesDuration && matchesTags));
      });
    }

    segments.forEach((segment) => {
      segment.addEventListener("click", () => {
        segments.forEach((s) => s.classList.toggle("is-active", s === segment));
        activeDuration = segment.dataset.filter;
        applyFilter();
      });
    });

    tags.forEach((tag) => {
      tag.addEventListener("click", () => {
        const key = tag.dataset.tag;
        if (activeTags.has(key)) {
          activeTags.delete(key);
          tag.classList.remove("is-active");
        } else {
          activeTags.add(key);
          tag.classList.add("is-active");
        }
        applyFilter();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("partials:loaded", init, { once: true });
  } else {
    document.addEventListener("partials:loaded", init, { once: true });
  }
})();
