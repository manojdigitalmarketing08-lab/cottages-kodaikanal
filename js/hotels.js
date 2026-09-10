// Hotels in Kodaikanal — page-specific interactions.
// Loaded after include.js + main.js (which handle the shared header/footer).
// Every pattern here only runs if its markup is present, so this file is
// safe even if a section is edited or removed later.

(function () {
  "use strict";

  function initHotelsPage() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ------------------------------------------------------------------ */
    /* Global reveal system (#22) — fade + translateY on scroll, staggered */
    /* ------------------------------------------------------------------ */
    const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
    if (revealEls.length && "IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const group = Array.from(el.parentElement.querySelectorAll("[data-reveal]"));
            const index = group.indexOf(el);
            el.style.transitionDelay = prefersReducedMotion ? "0ms" : `${Math.min(index, 6) * 90}ms`;
            el.classList.add("is-visible");
            revealObserver.unobserve(el);
          });
        },
        { threshold: 0.15 }
      );
      revealEls.forEach((el) => revealObserver.observe(el));

      // Failsafe: if a layout quirk or a testing/crawler tool never fires
      // the observer for an off-screen element, don't leave it hidden.
      window.setTimeout(() => {
        revealEls.forEach((el) => el.classList.add("is-visible"));
      }, 4000);
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    /* ------------------------------------------------------------------ */
    /* Count-up numbers (#2 / #24) — stat strip + review rating           */
    /* ------------------------------------------------------------------ */
    function animateCount(el) {
      const target = parseFloat(el.getAttribute("data-count-to"));
      const decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
      const suffix = el.getAttribute("data-suffix") || "";
      if (prefersReducedMotion) {
        el.textContent = target.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        return;
      }
      const duration = 1300;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = value.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const countEls = Array.from(document.querySelectorAll("[data-count-to]"));
    if (countEls.length && "IntersectionObserver" in window) {
      const countObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              countObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      countEls.forEach((el) => countObserver.observe(el));
    }

    /* ------------------------------------------------------------------ */
    /* Smooth-height <details> accordions (#4 hotel cards + #18 FAQ)      */
    /* ------------------------------------------------------------------ */
    function wireAnimatedDetails(selector, panelSelector) {
      document.querySelectorAll(selector).forEach((details) => {
        const summary = details.querySelector("summary");
        const panel = details.querySelector(panelSelector);
        if (!summary || !panel) return;

        summary.addEventListener("click", (event) => {
          event.preventDefault();
          const isOpen = details.hasAttribute("open");

          if (isOpen) {
            panel.style.height = panel.scrollHeight + "px";
            requestAnimationFrame(() => {
              panel.style.height = "0px";
            });
            panel.addEventListener(
              "transitionend",
              () => {
                details.removeAttribute("open");
              },
              { once: true }
            );
          } else {
            details.setAttribute("open", "");
            panel.style.height = "0px";
            requestAnimationFrame(() => {
              panel.style.height = panel.scrollHeight + "px";
            });
            panel.addEventListener(
              "transitionend",
              () => {
                panel.style.height = "auto";
              },
              { once: true }
            );
          }
        });
      });
    }

    wireAnimatedDetails(".ht-hotel-details", ".ht-hotel-details-panel");

    /* ------------------------------------------------------------------ */
    /* Experience card hover/tap reveal (#5) — tap toggles on touch        */
    /* ------------------------------------------------------------------ */
    document.querySelectorAll(".ht-exp-card").forEach((card) => {
      card.addEventListener("touchstart", () => {
        document.querySelectorAll(".ht-exp-card.is-active").forEach((other) => {
          if (other !== card) other.classList.remove("is-active");
        });
        card.classList.toggle("is-active");
      }, { passive: true });
    });

    /* ------------------------------------------------------------------ */
    /* Flip cards (#7) — tap toggles on touch devices                     */
    /* ------------------------------------------------------------------ */
    document.querySelectorAll(".ht-flip-card").forEach((card) => {
      card.addEventListener("click", () => {
        if (window.matchMedia("(hover: none)").matches) {
          card.classList.toggle("is-flipped");
        }
      });
    });

    /* ------------------------------------------------------------------ */
    /* Tabbed category switcher (#8)                                      */
    /* ------------------------------------------------------------------ */
    const tabBtns = Array.from(document.querySelectorAll(".ht-tab-btn"));
    const tabPanels = Array.from(document.querySelectorAll(".ht-tab-panel"));

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab");
        tabBtns.forEach((b) => {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-selected", String(b === btn));
        });
        tabPanels.forEach((panel) => {
          panel.classList.toggle("is-active", panel.getAttribute("data-tab-panel") === target);
        });
      });
    });

    /* ------------------------------------------------------------------ */
    /* Countdown deal banner (#9) — counts down to the coming Sunday       */
    /* ------------------------------------------------------------------ */
    const countdownEl = document.querySelector("[data-countdown]");
    if (countdownEl) {
      const dEl = countdownEl.querySelector('[data-unit="d"]');
      const hEl = countdownEl.querySelector('[data-unit="h"]');
      const mEl = countdownEl.querySelector('[data-unit="m"]');
      const sEl = countdownEl.querySelector('[data-unit="s"]');

      function nextTarget() {
        const now = new Date();
        const target = new Date(now);
        const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
        target.setDate(now.getDate() + daysUntilSunday);
        target.setHours(23, 59, 59, 0);
        return target;
      }

      let target = nextTarget();

      function pad(n) {
        return String(n).padStart(2, "0");
      }

      function tickCountdown() {
        const now = new Date();
        let diff = target.getTime() - now.getTime();
        if (diff <= 0) {
          target = nextTarget();
          diff = target.getTime() - now.getTime();
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        if (dEl) dEl.textContent = pad(days);
        if (hEl) hEl.textContent = pad(hours);
        if (mEl) mEl.textContent = pad(minutes);
        if (sEl) sEl.textContent = pad(seconds);
      }

      tickCountdown();
      window.setInterval(tickCountdown, 1000);
    }

    /* ------------------------------------------------------------------ */
    /* Guest reviews — drag-to-scroll (#10) + dot indicators               */
    /* ------------------------------------------------------------------ */
    const reviewsTrack = document.querySelector(".ht-reviews-track");
    if (reviewsTrack) {
      let isDown = false;
      let startX = 0;
      let scrollStart = 0;

      reviewsTrack.addEventListener("pointerdown", (e) => {
        isDown = true;
        reviewsTrack.classList.add("is-dragging");
        startX = e.clientX;
        scrollStart = reviewsTrack.scrollLeft;
        reviewsTrack.setPointerCapture(e.pointerId);
      });
      reviewsTrack.addEventListener("pointermove", (e) => {
        if (!isDown) return;
        reviewsTrack.scrollLeft = scrollStart - (e.clientX - startX);
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach((evt) => {
        reviewsTrack.addEventListener(evt, () => {
          isDown = false;
          reviewsTrack.classList.remove("is-dragging");
        });
      });

      const dots = Array.from(document.querySelectorAll(".ht-review-dots button"));
      const cards = Array.from(reviewsTrack.querySelectorAll(".ht-review-card"));

      dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
          cards[i]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        });
      });

      const updateDots = () => {
        const scrollLeft = reviewsTrack.scrollLeft;
        let closest = 0;
        let closestDist = Infinity;
        cards.forEach((card, i) => {
          const dist = Math.abs(card.offsetLeft - scrollLeft);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        dots.forEach((dot, i) => dot.classList.toggle("is-active", i === closest));
      };
      updateDots();
      reviewsTrack.addEventListener("scroll", () => window.requestAnimationFrame(updateDots), { passive: true });
    }

    /* ------------------------------------------------------------------ */
    /* Sticky-scroll travel guides (#11) — highlight active paragraph      */
    /* ------------------------------------------------------------------ */
    const guideItems = Array.from(document.querySelectorAll(".ht-guide-item"));
    const guideImages = document.querySelectorAll(".ht-guides-sticky img");

    if (guideItems.length && "IntersectionObserver" in window) {
      const guideObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const item = entry.target;
            item.classList.toggle("is-active", entry.isIntersecting);
            if (entry.isIntersecting) {
              const imgSrc = item.getAttribute("data-image");
              if (imgSrc && guideImages[0] && guideImages[0].getAttribute("src") !== imgSrc) {
                guideImages[0].setAttribute("src", imgSrc);
              }
            }
          });
        },
        { threshold: 0.5 }
      );
      guideItems.forEach((item) => guideObserver.observe(item));
    }

    /* ------------------------------------------------------------------ */
    /* WhatsApp promo card stack — fan out on scroll into view (#21)       */
    /* ------------------------------------------------------------------ */
    const stack = document.querySelector(".ht-stack");
    if (stack && "IntersectionObserver" in window) {
      const stackObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => stack.classList.toggle("is-fanned", entry.isIntersecting));
        },
        { threshold: 0.4 }
      );
      stackObserver.observe(stack);
    }

    /* ------------------------------------------------------------------ */
    /* Magnetic button hover (#23) — desktop only                         */
    /* ------------------------------------------------------------------ */
    if (window.matchMedia("(hover: hover)").matches && !prefersReducedMotion) {
      document.querySelectorAll(".ht-magnetic").forEach((btn) => {
        btn.addEventListener("mousemove", (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          const clampedX = Math.max(-8, Math.min(8, x * 0.25));
          const clampedY = Math.max(-8, Math.min(8, y * 0.25));
          btn.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
        });
        btn.addEventListener("mouseleave", () => {
          btn.style.transform = "translate(0, 0)";
        });
      });
    }

    /* ------------------------------------------------------------------ */
    /* Sticky mobile CTA bar (#19) — appears once hero scrolls out of view */
    /* ------------------------------------------------------------------ */
    const htHero = document.querySelector(".ht-hero");
    const htMobileCtaBar = document.querySelector(".ht-mobile-cta-bar");

    if (htHero && htMobileCtaBar && "IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => htMobileCtaBar.classList.toggle("is-visible", !entry.isIntersecting));
        },
        { rootMargin: "-64px 0px 0px 0px" }
      );
      heroObserver.observe(htHero);
    }

    /* ------------------------------------------------------------------ */
    /* Progress-linked section dots (#16, desktop only)                    */
    /* ------------------------------------------------------------------ */
    const dotNav = document.querySelector(".ht-section-dots");
    const trackedSections = Array.from(document.querySelectorAll("main > section[id]"));

    if (dotNav && trackedSections.length && "IntersectionObserver" in window) {
      trackedSections.forEach((section) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", section.getAttribute("data-section-label") || section.id);
        dot.addEventListener("click", () => section.scrollIntoView({ behavior: "smooth" }));
        dotNav.appendChild(dot);
      });
      const dotButtons = Array.from(dotNav.children);

      const dotObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const index = trackedSections.indexOf(entry.target);
            if (index === -1) return;
            if (entry.isIntersecting) {
              dotButtons.forEach((d, i) => d.classList.toggle("is-active", i === index));
            }
          });
        },
        { threshold: 0.4 }
      );
      trackedSections.forEach((section) => dotObserver.observe(section));
    }

    /* ------------------------------------------------------------------ */
    /* Hero quick-search — scrolls to Featured Hotels (no backend yet)     */
    /* ------------------------------------------------------------------ */
    const heroSearchForm = document.getElementById("hero-search");
    heroSearchForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      document.getElementById("featured-hotels")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (document.querySelector("[data-include]")) {
    document.addEventListener("partials:loaded", initHotelsPage, { once: true });
  } else {
    initHotelsPage();
  }
})();

// ==========================================================================
// Merged from js/resorts.js — shared script consolidation
// ==========================================================================
// Resorts in Kodaikanal — page-specific interactions.
// Loaded after include.js + main.js (which handle the shared header/footer).
// Every pattern here only runs if its markup is present, so this file is
// safe even if a section is edited or removed later.

(function () {
  "use strict";

  function initRsPage() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ------------------------------------------------------------------ */
    /* Global reveal system (#22) — fade + translateY on scroll, staggered */
    /* ------------------------------------------------------------------ */
    const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
    if (revealEls.length && "IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const group = Array.from(el.parentElement.querySelectorAll("[data-reveal]"));
            const index = group.indexOf(el);
            el.style.transitionDelay = prefersReducedMotion ? "0ms" : `${Math.min(index, 6) * 90}ms`;
            el.classList.add("is-visible");
            revealObserver.unobserve(el);
          });
        },
        { threshold: 0.15 }
      );
      revealEls.forEach((el) => revealObserver.observe(el));

      // Failsafe: if a layout quirk or a testing/crawler tool never fires
      // the observer for an off-screen element, don't leave it hidden.
      window.setTimeout(() => {
        revealEls.forEach((el) => el.classList.add("is-visible"));
      }, 4000);
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    /* ------------------------------------------------------------------ */
    /* Count-up numbers (#2 / #24) — stat strip + review rating           */
    /* ------------------------------------------------------------------ */
    function animateCount(el) {
      const target = parseFloat(el.getAttribute("data-count-to"));
      const decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
      const suffix = el.getAttribute("data-suffix") || "";
      if (prefersReducedMotion) {
        el.textContent = target.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        return;
      }
      const duration = 1300;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = value.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const countEls = Array.from(document.querySelectorAll("[data-count-to]"));
    if (countEls.length && "IntersectionObserver" in window) {
      const countObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              countObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      countEls.forEach((el) => countObserver.observe(el));
    }

    /* ------------------------------------------------------------------ */
    /* Smooth-height <details> accordions (#4 hotel cards + #18 FAQ)      */
    /* ------------------------------------------------------------------ */
    function wireAnimatedDetails(selector, panelSelector) {
      document.querySelectorAll(selector).forEach((details) => {
        const summary = details.querySelector("summary");
        const panel = details.querySelector(panelSelector);
        if (!summary || !panel) return;

        summary.addEventListener("click", (event) => {
          event.preventDefault();
          const isOpen = details.hasAttribute("open");

          if (isOpen) {
            panel.style.height = panel.scrollHeight + "px";
            requestAnimationFrame(() => {
              panel.style.height = "0px";
            });
            panel.addEventListener(
              "transitionend",
              () => {
                details.removeAttribute("open");
              },
              { once: true }
            );
          } else {
            details.setAttribute("open", "");
            panel.style.height = "0px";
            requestAnimationFrame(() => {
              panel.style.height = panel.scrollHeight + "px";
            });
            panel.addEventListener(
              "transitionend",
              () => {
                panel.style.height = "auto";
              },
              { once: true }
            );
          }
        });
      });
    }

    wireAnimatedDetails(".rs-hotel-details", ".rs-hotel-details-panel");

    /* ------------------------------------------------------------------ */
    /* Experience card hover/tap reveal (#5) — tap toggles on touch        */
    /* ------------------------------------------------------------------ */
    document.querySelectorAll(".rs-exp-card").forEach((card) => {
      card.addEventListener("touchstart", () => {
        document.querySelectorAll(".rs-exp-card.is-active").forEach((other) => {
          if (other !== card) other.classList.remove("is-active");
        });
        card.classList.toggle("is-active");
      }, { passive: true });
    });

    /* ------------------------------------------------------------------ */
    /* Flip cards (#7) — tap toggles on touch devices                     */
    /* ------------------------------------------------------------------ */
    document.querySelectorAll(".rs-flip-card").forEach((card) => {
      card.addEventListener("click", () => {
        if (window.matchMedia("(hover: none)").matches) {
          card.classList.toggle("is-flipped");
        }
      });
    });

    /* ------------------------------------------------------------------ */
    /* Tabbed category switcher (#8)                                      */
    /* ------------------------------------------------------------------ */
    const tabBtns = Array.from(document.querySelectorAll(".rs-tab-btn"));
    const tabPanels = Array.from(document.querySelectorAll(".rs-tab-panel"));

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab");
        tabBtns.forEach((b) => {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-selected", String(b === btn));
        });
        tabPanels.forEach((panel) => {
          panel.classList.toggle("is-active", panel.getAttribute("data-tab-panel") === target);
        });
      });
    });

    /* ------------------------------------------------------------------ */
    /* Countdown deal banner (#9) — counts down to the coming Sunday       */
    /* ------------------------------------------------------------------ */
    const countdownEl = document.querySelector("[data-countdown]");
    if (countdownEl) {
      const dEl = countdownEl.querySelector('[data-unit="d"]');
      const hEl = countdownEl.querySelector('[data-unit="h"]');
      const mEl = countdownEl.querySelector('[data-unit="m"]');
      const sEl = countdownEl.querySelector('[data-unit="s"]');

      function nextTarget() {
        const now = new Date();
        const target = new Date(now);
        const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
        target.setDate(now.getDate() + daysUntilSunday);
        target.setHours(23, 59, 59, 0);
        return target;
      }

      let target = nextTarget();

      function pad(n) {
        return String(n).padStart(2, "0");
      }

      function tickCountdown() {
        const now = new Date();
        let diff = target.getTime() - now.getTime();
        if (diff <= 0) {
          target = nextTarget();
          diff = target.getTime() - now.getTime();
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        if (dEl) dEl.textContent = pad(days);
        if (hEl) hEl.textContent = pad(hours);
        if (mEl) mEl.textContent = pad(minutes);
        if (sEl) sEl.textContent = pad(seconds);
      }

      tickCountdown();
      window.setInterval(tickCountdown, 1000);
    }

    /* ------------------------------------------------------------------ */
    /* Guest reviews — drag-to-scroll (#10) + dot indicators               */
    /* ------------------------------------------------------------------ */
    const reviewsTrack = document.querySelector(".rs-reviews-track");
    if (reviewsTrack) {
      let isDown = false;
      let startX = 0;
      let scrollStart = 0;

      reviewsTrack.addEventListener("pointerdown", (e) => {
        isDown = true;
        reviewsTrack.classList.add("is-dragging");
        startX = e.clientX;
        scrollStart = reviewsTrack.scrollLeft;
        reviewsTrack.setPointerCapture(e.pointerId);
      });
      reviewsTrack.addEventListener("pointermove", (e) => {
        if (!isDown) return;
        reviewsTrack.scrollLeft = scrollStart - (e.clientX - startX);
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach((evt) => {
        reviewsTrack.addEventListener(evt, () => {
          isDown = false;
          reviewsTrack.classList.remove("is-dragging");
        });
      });

      const dots = Array.from(document.querySelectorAll(".rs-review-dots button"));
      const cards = Array.from(reviewsTrack.querySelectorAll(".rs-review-card"));

      dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
          cards[i]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        });
      });

      const updateDots = () => {
        const scrollLeft = reviewsTrack.scrollLeft;
        let closest = 0;
        let closestDist = Infinity;
        cards.forEach((card, i) => {
          const dist = Math.abs(card.offsetLeft - scrollLeft);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        dots.forEach((dot, i) => dot.classList.toggle("is-active", i === closest));
      };
      updateDots();
      reviewsTrack.addEventListener("scroll", () => window.requestAnimationFrame(updateDots), { passive: true });
    }

    /* ------------------------------------------------------------------ */
    /* Sticky-scroll travel guides (#11) — highlight active paragraph      */
    /* ------------------------------------------------------------------ */
    const guideItems = Array.from(document.querySelectorAll(".rs-guide-item"));
    const guideImages = document.querySelectorAll(".rs-guides-sticky img");

    if (guideItems.length && "IntersectionObserver" in window) {
      const guideObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const item = entry.target;
            item.classList.toggle("is-active", entry.isIntersecting);
            if (entry.isIntersecting) {
              const imgSrc = item.getAttribute("data-image");
              if (imgSrc && guideImages[0] && guideImages[0].getAttribute("src") !== imgSrc) {
                guideImages[0].setAttribute("src", imgSrc);
              }
            }
          });
        },
        { threshold: 0.5 }
      );
      guideItems.forEach((item) => guideObserver.observe(item));
    }

    /* ------------------------------------------------------------------ */
    /* WhatsApp promo card stack — fan out on scroll into view (#21)       */
    /* ------------------------------------------------------------------ */
    const stack = document.querySelector(".rs-stack");
    if (stack && "IntersectionObserver" in window) {
      const stackObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => stack.classList.toggle("is-fanned", entry.isIntersecting));
        },
        { threshold: 0.4 }
      );
      stackObserver.observe(stack);
    }

    /* ------------------------------------------------------------------ */
    /* Magnetic button hover (#23) — desktop only                         */
    /* ------------------------------------------------------------------ */
    if (window.matchMedia("(hover: hover)").matches && !prefersReducedMotion) {
      document.querySelectorAll(".rs-magnetic").forEach((btn) => {
        btn.addEventListener("mousemove", (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          const clampedX = Math.max(-8, Math.min(8, x * 0.25));
          const clampedY = Math.max(-8, Math.min(8, y * 0.25));
          btn.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
        });
        btn.addEventListener("mouseleave", () => {
          btn.style.transform = "translate(0, 0)";
        });
      });
    }

    /* ------------------------------------------------------------------ */
    /* Sticky mobile CTA bar (#19) — appears once hero scrolls out of view */
    /* ------------------------------------------------------------------ */
    const htHero = document.querySelector(".rs-hero");
    const htMobileCtaBar = document.querySelector(".rs-mobile-cta-bar");

    if (htHero && htMobileCtaBar && "IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => htMobileCtaBar.classList.toggle("is-visible", !entry.isIntersecting));
        },
        { rootMargin: "-64px 0px 0px 0px" }
      );
      heroObserver.observe(htHero);
    }

    /* ------------------------------------------------------------------ */
    /* Progress-linked section dots (#16, desktop only)                    */
    /* ------------------------------------------------------------------ */
    const dotNav = document.querySelector(".rs-section-dots");
    const trackedSections = Array.from(document.querySelectorAll("main > section[id]"));

    if (dotNav && trackedSections.length && "IntersectionObserver" in window) {
      trackedSections.forEach((section) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", section.getAttribute("data-section-label") || section.id);
        dot.addEventListener("click", () => section.scrollIntoView({ behavior: "smooth" }));
        dotNav.appendChild(dot);
      });
      const dotButtons = Array.from(dotNav.children);

      const dotObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const index = trackedSections.indexOf(entry.target);
            if (index === -1) return;
            if (entry.isIntersecting) {
              dotButtons.forEach((d, i) => d.classList.toggle("is-active", i === index));
            }
          });
        },
        { threshold: 0.4 }
      );
      trackedSections.forEach((section) => dotObserver.observe(section));
    }

    /* ------------------------------------------------------------------ */
    /* Hero quick-search — scrolls to Featured Hotels (no backend yet)     */
    /* ------------------------------------------------------------------ */
    const heroSearchForm = document.getElementById("hero-search");
    heroSearchForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      document.getElementById("featured-resorts")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (document.querySelector("[data-include]")) {
    document.addEventListener("partials:loaded", initRsPage, { once: true });
  } else {
    initRsPage();
  }
})();

// ==========================================================================
// Merged from js/homestay.js — shared script consolidation
// ==========================================================================
// Kodaikanal Homestay — page-specific interactions.
// Loaded after include.js + main.js (which handle the shared header/footer).
// Every pattern here only runs if its markup is present, so this file is
// safe even if a section is edited or removed later. Mirrors the shape of
// initHotelsPage()/initVlPage() above, renamed to the hs- namespace.

(function () {
  "use strict";

  function initHomestayPage() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ------------------------------------------------------------------ */
    /* Global reveal system (#22) — fade + translateY on scroll, staggered */
    /* ------------------------------------------------------------------ */
    const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
    if (revealEls.length && "IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const group = Array.from(el.parentElement.querySelectorAll("[data-reveal]"));
            const index = group.indexOf(el);
            el.style.transitionDelay = prefersReducedMotion ? "0ms" : `${Math.min(index, 6) * 90}ms`;
            el.classList.add("is-visible");
            revealObserver.unobserve(el);
          });
        },
        { threshold: 0.15 }
      );
      revealEls.forEach((el) => revealObserver.observe(el));

      window.setTimeout(() => {
        revealEls.forEach((el) => el.classList.add("is-visible"));
      }, 4000);
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    /* ------------------------------------------------------------------ */
    /* Count-up numbers (#2 / #24) — stat strip                           */
    /* ------------------------------------------------------------------ */
    function animateCount(el) {
      const target = parseFloat(el.getAttribute("data-count-to"));
      const decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
      const suffix = el.getAttribute("data-suffix") || "";
      if (prefersReducedMotion) {
        el.textContent = target.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        return;
      }
      const duration = 1300;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = value.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const countEls = Array.from(document.querySelectorAll("[data-count-to]"));
    if (countEls.length && "IntersectionObserver" in window) {
      const countObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              countObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      countEls.forEach((el) => countObserver.observe(el));
    }

    /* ------------------------------------------------------------------ */
    /* Smooth-height <details> accordions (#4 stay cards + #18 FAQ)       */
    /* ------------------------------------------------------------------ */
    function wireAnimatedDetails(selector, panelSelector) {
      document.querySelectorAll(selector).forEach((details) => {
        const summary = details.querySelector("summary");
        const panel = details.querySelector(panelSelector);
        if (!summary || !panel) return;

        summary.addEventListener("click", (event) => {
          event.preventDefault();
          const isOpen = details.hasAttribute("open");

          if (isOpen) {
            panel.style.height = panel.scrollHeight + "px";
            requestAnimationFrame(() => {
              panel.style.height = "0px";
            });
            panel.addEventListener(
              "transitionend",
              () => {
                details.removeAttribute("open");
              },
              { once: true }
            );
          } else {
            details.setAttribute("open", "");
            panel.style.height = "0px";
            requestAnimationFrame(() => {
              panel.style.height = panel.scrollHeight + "px";
            });
            panel.addEventListener(
              "transitionend",
              () => {
                panel.style.height = "auto";
              },
              { once: true }
            );
          }
        });
      });
    }

    wireAnimatedDetails(".hs-stay-details", ".hs-stay-details-panel");

    /* ------------------------------------------------------------------ */
    /* Experience card hover/tap reveal (#5) — tap toggles on touch        */
    /* ------------------------------------------------------------------ */
    document.querySelectorAll(".hs-exp-card").forEach((card) => {
      card.addEventListener("touchstart", () => {
        document.querySelectorAll(".hs-exp-card.is-active").forEach((other) => {
          if (other !== card) other.classList.remove("is-active");
        });
        card.classList.toggle("is-active");
      }, { passive: true });
    });

    /* ------------------------------------------------------------------ */
    /* Flip cards (#7) — tap toggles on touch devices                     */
    /* ------------------------------------------------------------------ */
    document.querySelectorAll(".hs-flip-card").forEach((card) => {
      card.addEventListener("click", () => {
        if (window.matchMedia("(hover: none)").matches) {
          card.classList.toggle("is-flipped");
        }
      });
    });

    /* ------------------------------------------------------------------ */
    /* Tabbed category switcher (#8)                                      */
    /* ------------------------------------------------------------------ */
    const tabBtns = Array.from(document.querySelectorAll(".hs-tab-btn"));
    const tabPanels = Array.from(document.querySelectorAll(".hs-tab-panel"));

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab");
        tabBtns.forEach((b) => {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-selected", String(b === btn));
        });
        tabPanels.forEach((panel) => {
          panel.classList.toggle("is-active", panel.getAttribute("data-tab-panel") === target);
        });
      });
    });

    /* ------------------------------------------------------------------ */
    /* Countdown deal banner (#9) — counts down to the coming Sunday       */
    /* ------------------------------------------------------------------ */
    const countdownEl = document.querySelector("[data-countdown]");
    if (countdownEl) {
      const dEl = countdownEl.querySelector('[data-unit="d"]');
      const hEl = countdownEl.querySelector('[data-unit="h"]');
      const mEl = countdownEl.querySelector('[data-unit="m"]');
      const sEl = countdownEl.querySelector('[data-unit="s"]');

      function nextTarget() {
        const now = new Date();
        const target = new Date(now);
        const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
        target.setDate(now.getDate() + daysUntilSunday);
        target.setHours(23, 59, 59, 0);
        return target;
      }

      let target = nextTarget();

      function pad(n) {
        return String(n).padStart(2, "0");
      }

      function tickCountdown() {
        const now = new Date();
        let diff = target.getTime() - now.getTime();
        if (diff <= 0) {
          target = nextTarget();
          diff = target.getTime() - now.getTime();
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        if (dEl) dEl.textContent = pad(days);
        if (hEl) hEl.textContent = pad(hours);
        if (mEl) mEl.textContent = pad(minutes);
        if (sEl) sEl.textContent = pad(seconds);
      }

      tickCountdown();
      window.setInterval(tickCountdown, 1000);
    }

    /* ------------------------------------------------------------------ */
    /* Guest reviews — drag-to-scroll (#10) + dot indicators               */
    /* ------------------------------------------------------------------ */
    const reviewsTrack = document.querySelector(".hs-reviews-track");
    if (reviewsTrack) {
      let isDown = false;
      let startX = 0;
      let scrollStart = 0;

      reviewsTrack.addEventListener("pointerdown", (e) => {
        isDown = true;
        reviewsTrack.classList.add("is-dragging");
        startX = e.clientX;
        scrollStart = reviewsTrack.scrollLeft;
        reviewsTrack.setPointerCapture(e.pointerId);
      });
      reviewsTrack.addEventListener("pointermove", (e) => {
        if (!isDown) return;
        reviewsTrack.scrollLeft = scrollStart - (e.clientX - startX);
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach((evt) => {
        reviewsTrack.addEventListener(evt, () => {
          isDown = false;
          reviewsTrack.classList.remove("is-dragging");
        });
      });

      const dots = Array.from(document.querySelectorAll(".hs-review-dots button"));
      const cards = Array.from(reviewsTrack.querySelectorAll(".hs-review-card"));

      dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
          cards[i]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        });
      });

      const updateDots = () => {
        const scrollLeft = reviewsTrack.scrollLeft;
        let closest = 0;
        let closestDist = Infinity;
        cards.forEach((card, i) => {
          const dist = Math.abs(card.offsetLeft - scrollLeft);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        dots.forEach((dot, i) => dot.classList.toggle("is-active", i === closest));
      };
      updateDots();
      reviewsTrack.addEventListener("scroll", () => window.requestAnimationFrame(updateDots), { passive: true });
    }

    /* ------------------------------------------------------------------ */
    /* Sticky-scroll travel guides (#11) — highlight active paragraph      */
    /* ------------------------------------------------------------------ */
    const guideItems = Array.from(document.querySelectorAll(".hs-guide-item"));
    const guideImages = document.querySelectorAll(".hs-guides-sticky img");

    if (guideItems.length && "IntersectionObserver" in window) {
      const guideObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const item = entry.target;
            item.classList.toggle("is-active", entry.isIntersecting);
            if (entry.isIntersecting) {
              const imgSrc = item.getAttribute("data-image");
              if (imgSrc && guideImages[0] && guideImages[0].getAttribute("src") !== imgSrc) {
                guideImages[0].setAttribute("src", imgSrc);
              }
            }
          });
        },
        { threshold: 0.5 }
      );
      guideItems.forEach((item) => guideObserver.observe(item));
    }

    /* ------------------------------------------------------------------ */
    /* WhatsApp promo card stack — fan out on scroll into view (#21)       */
    /* ------------------------------------------------------------------ */
    const stack = document.querySelector(".hs-stack");
    if (stack && "IntersectionObserver" in window) {
      const stackObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => stack.classList.toggle("is-fanned", entry.isIntersecting));
        },
        { threshold: 0.4 }
      );
      stackObserver.observe(stack);
    }

    /* ------------------------------------------------------------------ */
    /* Magnetic button hover (#23) — desktop only                         */
    /* ------------------------------------------------------------------ */
    if (window.matchMedia("(hover: hover)").matches && !prefersReducedMotion) {
      document.querySelectorAll(".hs-magnetic").forEach((btn) => {
        btn.addEventListener("mousemove", (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          const clampedX = Math.max(-8, Math.min(8, x * 0.25));
          const clampedY = Math.max(-8, Math.min(8, y * 0.25));
          btn.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
        });
        btn.addEventListener("mouseleave", () => {
          btn.style.transform = "translate(0, 0)";
        });
      });
    }

    /* ------------------------------------------------------------------ */
    /* Sticky mobile CTA bar (#19) — appears once hero scrolls out of view */
    /* ------------------------------------------------------------------ */
    const hsHero = document.querySelector(".hs-hero");
    const hsMobileCtaBar = document.querySelector(".hs-mobile-cta-bar");

    if (hsHero && hsMobileCtaBar && "IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => hsMobileCtaBar.classList.toggle("is-visible", !entry.isIntersecting));
        },
        { rootMargin: "-64px 0px 0px 0px" }
      );
      heroObserver.observe(hsHero);
    }

    /* ------------------------------------------------------------------ */
    /* Progress-linked section dots (#16, desktop only)                    */
    /* ------------------------------------------------------------------ */
    const dotNav = document.querySelector(".hs-section-dots");
    const trackedSections = Array.from(document.querySelectorAll("main > section[id]"));

    if (dotNav && trackedSections.length && "IntersectionObserver" in window) {
      trackedSections.forEach((section) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", section.getAttribute("data-section-label") || section.id);
        dot.addEventListener("click", () => section.scrollIntoView({ behavior: "smooth" }));
        dotNav.appendChild(dot);
      });
      const dotButtons = Array.from(dotNav.children);

      const dotObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const index = trackedSections.indexOf(entry.target);
            if (index === -1) return;
            if (entry.isIntersecting) {
              dotButtons.forEach((d, i) => d.classList.toggle("is-active", i === index));
            }
          });
        },
        { threshold: 0.4 }
      );
      trackedSections.forEach((section) => dotObserver.observe(section));
    }

    /* ------------------------------------------------------------------ */
    /* Hero quick-search — scrolls to Featured Homestays (no backend yet)  */
    /* ------------------------------------------------------------------ */
    const heroSearchForm = document.getElementById("hero-search");
    heroSearchForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      document.getElementById("featured-homestays")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (document.querySelector("[data-include]")) {
    document.addEventListener("partials:loaded", initHomestayPage, { once: true });
  } else {
    initHomestayPage();
  }
})();

// ==========================================================================
// Merged from js/dormitory.js — shared script consolidation
// ==========================================================================
// Dormitory Stays in Kodaikanal — page-specific interactions.
// Loaded after include.js + main.js (which handle the shared header/footer).
// Every pattern here only runs if its markup is present, so this file is
// safe even if a section is edited or removed later.

(function () {
  "use strict";

  function initDmPage() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ------------------------------------------------------------------ */
    /* Global reveal system (#22) — fade + translateY on scroll, staggered */
    /* ------------------------------------------------------------------ */
    const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
    if (revealEls.length && "IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const group = Array.from(el.parentElement.querySelectorAll("[data-reveal]"));
            const index = group.indexOf(el);
            el.style.transitionDelay = prefersReducedMotion ? "0ms" : `${Math.min(index, 6) * 90}ms`;
            el.classList.add("is-visible");
            revealObserver.unobserve(el);
          });
        },
        { threshold: 0.15 }
      );
      revealEls.forEach((el) => revealObserver.observe(el));

      // Failsafe: if a layout quirk or a testing/crawler tool never fires
      // the observer for an off-screen element, don't leave it hidden.
      window.setTimeout(() => {
        revealEls.forEach((el) => el.classList.add("is-visible"));
      }, 4000);
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    /* ------------------------------------------------------------------ */
    /* Count-up numbers (#2 / #24) — stat strip + review rating           */
    /* ------------------------------------------------------------------ */
    function animateCount(el) {
      const target = parseFloat(el.getAttribute("data-count-to"));
      const decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
      const suffix = el.getAttribute("data-suffix") || "";
      if (prefersReducedMotion) {
        el.textContent = target.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        return;
      }
      const duration = 1300;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = value.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const countEls = Array.from(document.querySelectorAll("[data-count-to]"));
    if (countEls.length && "IntersectionObserver" in window) {
      const countObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              countObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      countEls.forEach((el) => countObserver.observe(el));
    }

    /* ------------------------------------------------------------------ */
    /* Smooth-height <details> accordions (#4 hotel cards + #18 FAQ)      */
    /* ------------------------------------------------------------------ */
    function wireAnimatedDetails(selector, panelSelector) {
      document.querySelectorAll(selector).forEach((details) => {
        const summary = details.querySelector("summary");
        const panel = details.querySelector(panelSelector);
        if (!summary || !panel) return;

        summary.addEventListener("click", (event) => {
          event.preventDefault();
          const isOpen = details.hasAttribute("open");

          if (isOpen) {
            panel.style.height = panel.scrollHeight + "px";
            requestAnimationFrame(() => {
              panel.style.height = "0px";
            });
            panel.addEventListener(
              "transitionend",
              () => {
                details.removeAttribute("open");
              },
              { once: true }
            );
          } else {
            details.setAttribute("open", "");
            panel.style.height = "0px";
            requestAnimationFrame(() => {
              panel.style.height = panel.scrollHeight + "px";
            });
            panel.addEventListener(
              "transitionend",
              () => {
                panel.style.height = "auto";
              },
              { once: true }
            );
          }
        });
      });
    }

    wireAnimatedDetails(".dm-hotel-details", ".dm-hotel-details-panel");

    /* ------------------------------------------------------------------ */
    /* Experience card hover/tap reveal (#5) — tap toggles on touch        */
    /* ------------------------------------------------------------------ */
    document.querySelectorAll(".dm-exp-card").forEach((card) => {
      card.addEventListener("touchstart", () => {
        document.querySelectorAll(".dm-exp-card.is-active").forEach((other) => {
          if (other !== card) other.classList.remove("is-active");
        });
        card.classList.toggle("is-active");
      }, { passive: true });
    });

    /* ------------------------------------------------------------------ */
    /* Flip cards (#7) — tap toggles on touch devices                     */
    /* ------------------------------------------------------------------ */
    document.querySelectorAll(".dm-flip-card").forEach((card) => {
      card.addEventListener("click", () => {
        if (window.matchMedia("(hover: none)").matches) {
          card.classList.toggle("is-flipped");
        }
      });
    });

    /* ------------------------------------------------------------------ */
    /* Tabbed category switcher (#8)                                      */
    /* ------------------------------------------------------------------ */
    const tabBtns = Array.from(document.querySelectorAll(".dm-tab-btn"));
    const tabPanels = Array.from(document.querySelectorAll(".dm-tab-panel"));

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab");
        tabBtns.forEach((b) => {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-selected", String(b === btn));
        });
        tabPanels.forEach((panel) => {
          panel.classList.toggle("is-active", panel.getAttribute("data-tab-panel") === target);
        });
      });
    });

    /* ------------------------------------------------------------------ */
    /* Countdown deal banner (#9) — counts down to the coming Sunday       */
    /* ------------------------------------------------------------------ */
    const countdownEl = document.querySelector("[data-countdown]");
    if (countdownEl) {
      const dEl = countdownEl.querySelector('[data-unit="d"]');
      const hEl = countdownEl.querySelector('[data-unit="h"]');
      const mEl = countdownEl.querySelector('[data-unit="m"]');
      const sEl = countdownEl.querySelector('[data-unit="s"]');

      function nextTarget() {
        const now = new Date();
        const target = new Date(now);
        const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
        target.setDate(now.getDate() + daysUntilSunday);
        target.setHours(23, 59, 59, 0);
        return target;
      }

      let target = nextTarget();

      function pad(n) {
        return String(n).padStart(2, "0");
      }

      function tickCountdown() {
        const now = new Date();
        let diff = target.getTime() - now.getTime();
        if (diff <= 0) {
          target = nextTarget();
          diff = target.getTime() - now.getTime();
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        if (dEl) dEl.textContent = pad(days);
        if (hEl) hEl.textContent = pad(hours);
        if (mEl) mEl.textContent = pad(minutes);
        if (sEl) sEl.textContent = pad(seconds);
      }

      tickCountdown();
      window.setInterval(tickCountdown, 1000);
    }

    /* ------------------------------------------------------------------ */
    /* Guest reviews — drag-to-scroll (#10) + dot indicators               */
    /* ------------------------------------------------------------------ */
    const reviewsTrack = document.querySelector(".dm-reviews-track");
    if (reviewsTrack) {
      let isDown = false;
      let startX = 0;
      let scrollStart = 0;

      reviewsTrack.addEventListener("pointerdown", (e) => {
        isDown = true;
        reviewsTrack.classList.add("is-dragging");
        startX = e.clientX;
        scrollStart = reviewsTrack.scrollLeft;
        reviewsTrack.setPointerCapture(e.pointerId);
      });
      reviewsTrack.addEventListener("pointermove", (e) => {
        if (!isDown) return;
        reviewsTrack.scrollLeft = scrollStart - (e.clientX - startX);
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach((evt) => {
        reviewsTrack.addEventListener(evt, () => {
          isDown = false;
          reviewsTrack.classList.remove("is-dragging");
        });
      });

      const dots = Array.from(document.querySelectorAll(".dm-review-dots button"));
      const cards = Array.from(reviewsTrack.querySelectorAll(".dm-review-card"));

      dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
          cards[i]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        });
      });

      const updateDots = () => {
        const scrollLeft = reviewsTrack.scrollLeft;
        let closest = 0;
        let closestDist = Infinity;
        cards.forEach((card, i) => {
          const dist = Math.abs(card.offsetLeft - scrollLeft);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        dots.forEach((dot, i) => dot.classList.toggle("is-active", i === closest));
      };
      updateDots();
      reviewsTrack.addEventListener("scroll", () => window.requestAnimationFrame(updateDots), { passive: true });
    }

    /* ------------------------------------------------------------------ */
    /* Sticky-scroll travel guides (#11) — highlight active paragraph      */
    /* ------------------------------------------------------------------ */
    const guideItems = Array.from(document.querySelectorAll(".dm-guide-item"));
    const guideImages = document.querySelectorAll(".dm-guides-sticky img");

    if (guideItems.length && "IntersectionObserver" in window) {
      const guideObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const item = entry.target;
            item.classList.toggle("is-active", entry.isIntersecting);
            if (entry.isIntersecting) {
              const imgSrc = item.getAttribute("data-image");
              if (imgSrc && guideImages[0] && guideImages[0].getAttribute("src") !== imgSrc) {
                guideImages[0].setAttribute("src", imgSrc);
              }
            }
          });
        },
        { threshold: 0.5 }
      );
      guideItems.forEach((item) => guideObserver.observe(item));
    }

    /* ------------------------------------------------------------------ */
    /* WhatsApp promo card stack — fan out on scroll into view (#21)       */
    /* ------------------------------------------------------------------ */
    const stack = document.querySelector(".dm-stack");
    if (stack && "IntersectionObserver" in window) {
      const stackObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => stack.classList.toggle("is-fanned", entry.isIntersecting));
        },
        { threshold: 0.4 }
      );
      stackObserver.observe(stack);
    }

    /* ------------------------------------------------------------------ */
    /* Magnetic button hover (#23) — desktop only                         */
    /* ------------------------------------------------------------------ */
    if (window.matchMedia("(hover: hover)").matches && !prefersReducedMotion) {
      document.querySelectorAll(".dm-magnetic").forEach((btn) => {
        btn.addEventListener("mousemove", (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          const clampedX = Math.max(-8, Math.min(8, x * 0.25));
          const clampedY = Math.max(-8, Math.min(8, y * 0.25));
          btn.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
        });
        btn.addEventListener("mouseleave", () => {
          btn.style.transform = "translate(0, 0)";
        });
      });
    }

    /* ------------------------------------------------------------------ */
    /* Sticky mobile CTA bar (#19) — appears once hero scrolls out of view */
    /* ------------------------------------------------------------------ */
    const htHero = document.querySelector(".dm-hero");
    const htMobileCtaBar = document.querySelector(".dm-mobile-cta-bar");

    if (htHero && htMobileCtaBar && "IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => htMobileCtaBar.classList.toggle("is-visible", !entry.isIntersecting));
        },
        { rootMargin: "-64px 0px 0px 0px" }
      );
      heroObserver.observe(htHero);
    }

    /* ------------------------------------------------------------------ */
    /* Progress-linked section dots (#16, desktop only)                    */
    /* ------------------------------------------------------------------ */
    const dotNav = document.querySelector(".dm-section-dots");
    const trackedSections = Array.from(document.querySelectorAll("main > section[id]"));

    if (dotNav && trackedSections.length && "IntersectionObserver" in window) {
      trackedSections.forEach((section) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", section.getAttribute("data-section-label") || section.id);
        dot.addEventListener("click", () => section.scrollIntoView({ behavior: "smooth" }));
        dotNav.appendChild(dot);
      });
      const dotButtons = Array.from(dotNav.children);

      const dotObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const index = trackedSections.indexOf(entry.target);
            if (index === -1) return;
            if (entry.isIntersecting) {
              dotButtons.forEach((d, i) => d.classList.toggle("is-active", i === index));
            }
          });
        },
        { threshold: 0.4 }
      );
      trackedSections.forEach((section) => dotObserver.observe(section));
    }

    /* ------------------------------------------------------------------ */
    /* Hero quick-search — scrolls to Featured Hotels (no backend yet)     */
    /* ------------------------------------------------------------------ */
    const heroSearchForm = document.getElementById("hero-search");
    heroSearchForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      document.getElementById("featured-dorms")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (document.querySelector("[data-include]")) {
    document.addEventListener("partials:loaded", initDmPage, { once: true });
  } else {
    initDmPage();
  }
})();

// ==========================================================================
// Merged from js/tent-stay.js — shared script consolidation
// ==========================================================================
// Tent Stays in Kodaikanal — page-specific interactions.
// Loaded after include.js + main.js (which handle the shared header/footer).
// Every pattern here only runs if its markup is present, so this file is
// safe even if a section is edited or removed later.

(function () {
  "use strict";

  function initTsPage() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ------------------------------------------------------------------ */
    /* Global reveal system (#22) — fade + translateY on scroll, staggered */
    /* ------------------------------------------------------------------ */
    const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
    if (revealEls.length && "IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const group = Array.from(el.parentElement.querySelectorAll("[data-reveal]"));
            const index = group.indexOf(el);
            el.style.transitionDelay = prefersReducedMotion ? "0ms" : `${Math.min(index, 6) * 90}ms`;
            el.classList.add("is-visible");
            revealObserver.unobserve(el);
          });
        },
        { threshold: 0.15 }
      );
      revealEls.forEach((el) => revealObserver.observe(el));

      // Failsafe: if a layout quirk or a testing/crawler tool never fires
      // the observer for an off-screen element, don't leave it hidden.
      window.setTimeout(() => {
        revealEls.forEach((el) => el.classList.add("is-visible"));
      }, 4000);
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    /* ------------------------------------------------------------------ */
    /* Count-up numbers (#2 / #24) — stat strip + review rating           */
    /* ------------------------------------------------------------------ */
    function animateCount(el) {
      const target = parseFloat(el.getAttribute("data-count-to"));
      const decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
      const suffix = el.getAttribute("data-suffix") || "";
      if (prefersReducedMotion) {
        el.textContent = target.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        return;
      }
      const duration = 1300;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = value.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const countEls = Array.from(document.querySelectorAll("[data-count-to]"));
    if (countEls.length && "IntersectionObserver" in window) {
      const countObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              countObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      countEls.forEach((el) => countObserver.observe(el));
    }

    /* ------------------------------------------------------------------ */
    /* Smooth-height <details> accordions (#4 hotel cards + #18 FAQ)      */
    /* ------------------------------------------------------------------ */
    function wireAnimatedDetails(selector, panelSelector) {
      document.querySelectorAll(selector).forEach((details) => {
        const summary = details.querySelector("summary");
        const panel = details.querySelector(panelSelector);
        if (!summary || !panel) return;

        summary.addEventListener("click", (event) => {
          event.preventDefault();
          const isOpen = details.hasAttribute("open");

          if (isOpen) {
            panel.style.height = panel.scrollHeight + "px";
            requestAnimationFrame(() => {
              panel.style.height = "0px";
            });
            panel.addEventListener(
              "transitionend",
              () => {
                details.removeAttribute("open");
              },
              { once: true }
            );
          } else {
            details.setAttribute("open", "");
            panel.style.height = "0px";
            requestAnimationFrame(() => {
              panel.style.height = panel.scrollHeight + "px";
            });
            panel.addEventListener(
              "transitionend",
              () => {
                panel.style.height = "auto";
              },
              { once: true }
            );
          }
        });
      });
    }

    wireAnimatedDetails(".ts-hotel-details", ".ts-hotel-details-panel");

    /* ------------------------------------------------------------------ */
    /* Experience card hover/tap reveal (#5) — tap toggles on touch        */
    /* ------------------------------------------------------------------ */
    document.querySelectorAll(".ts-exp-card").forEach((card) => {
      card.addEventListener("touchstart", () => {
        document.querySelectorAll(".ts-exp-card.is-active").forEach((other) => {
          if (other !== card) other.classList.remove("is-active");
        });
        card.classList.toggle("is-active");
      }, { passive: true });
    });

    /* ------------------------------------------------------------------ */
    /* Flip cards (#7) — tap toggles on touch devices                     */
    /* ------------------------------------------------------------------ */
    document.querySelectorAll(".ts-flip-card").forEach((card) => {
      card.addEventListener("click", () => {
        if (window.matchMedia("(hover: none)").matches) {
          card.classList.toggle("is-flipped");
        }
      });
    });

    /* ------------------------------------------------------------------ */
    /* Tabbed category switcher (#8)                                      */
    /* ------------------------------------------------------------------ */
    const tabBtns = Array.from(document.querySelectorAll(".ts-tab-btn"));
    const tabPanels = Array.from(document.querySelectorAll(".ts-tab-panel"));

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab");
        tabBtns.forEach((b) => {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-selected", String(b === btn));
        });
        tabPanels.forEach((panel) => {
          panel.classList.toggle("is-active", panel.getAttribute("data-tab-panel") === target);
        });
      });
    });

    /* ------------------------------------------------------------------ */
    /* Countdown deal banner (#9) — counts down to the coming Sunday       */
    /* ------------------------------------------------------------------ */
    const countdownEl = document.querySelector("[data-countdown]");
    if (countdownEl) {
      const dEl = countdownEl.querySelector('[data-unit="d"]');
      const hEl = countdownEl.querySelector('[data-unit="h"]');
      const mEl = countdownEl.querySelector('[data-unit="m"]');
      const sEl = countdownEl.querySelector('[data-unit="s"]');

      function nextTarget() {
        const now = new Date();
        const target = new Date(now);
        const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
        target.setDate(now.getDate() + daysUntilSunday);
        target.setHours(23, 59, 59, 0);
        return target;
      }

      let target = nextTarget();

      function pad(n) {
        return String(n).padStart(2, "0");
      }

      function tickCountdown() {
        const now = new Date();
        let diff = target.getTime() - now.getTime();
        if (diff <= 0) {
          target = nextTarget();
          diff = target.getTime() - now.getTime();
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        if (dEl) dEl.textContent = pad(days);
        if (hEl) hEl.textContent = pad(hours);
        if (mEl) mEl.textContent = pad(minutes);
        if (sEl) sEl.textContent = pad(seconds);
      }

      tickCountdown();
      window.setInterval(tickCountdown, 1000);
    }

    /* ------------------------------------------------------------------ */
    /* Guest reviews — drag-to-scroll (#10) + dot indicators               */
    /* ------------------------------------------------------------------ */
    const reviewsTrack = document.querySelector(".ts-reviews-track");
    if (reviewsTrack) {
      let isDown = false;
      let startX = 0;
      let scrollStart = 0;

      reviewsTrack.addEventListener("pointerdown", (e) => {
        isDown = true;
        reviewsTrack.classList.add("is-dragging");
        startX = e.clientX;
        scrollStart = reviewsTrack.scrollLeft;
        reviewsTrack.setPointerCapture(e.pointerId);
      });
      reviewsTrack.addEventListener("pointermove", (e) => {
        if (!isDown) return;
        reviewsTrack.scrollLeft = scrollStart - (e.clientX - startX);
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach((evt) => {
        reviewsTrack.addEventListener(evt, () => {
          isDown = false;
          reviewsTrack.classList.remove("is-dragging");
        });
      });

      const dots = Array.from(document.querySelectorAll(".ts-review-dots button"));
      const cards = Array.from(reviewsTrack.querySelectorAll(".ts-review-card"));

      dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
          cards[i]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        });
      });

      const updateDots = () => {
        const scrollLeft = reviewsTrack.scrollLeft;
        let closest = 0;
        let closestDist = Infinity;
        cards.forEach((card, i) => {
          const dist = Math.abs(card.offsetLeft - scrollLeft);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        dots.forEach((dot, i) => dot.classList.toggle("is-active", i === closest));
      };
      updateDots();
      reviewsTrack.addEventListener("scroll", () => window.requestAnimationFrame(updateDots), { passive: true });
    }

    /* ------------------------------------------------------------------ */
    /* Sticky-scroll travel guides (#11) — highlight active paragraph      */
    /* ------------------------------------------------------------------ */
    const guideItems = Array.from(document.querySelectorAll(".ts-guide-item"));
    const guideImages = document.querySelectorAll(".ts-guides-sticky img");

    if (guideItems.length && "IntersectionObserver" in window) {
      const guideObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const item = entry.target;
            item.classList.toggle("is-active", entry.isIntersecting);
            if (entry.isIntersecting) {
              const imgSrc = item.getAttribute("data-image");
              if (imgSrc && guideImages[0] && guideImages[0].getAttribute("src") !== imgSrc) {
                guideImages[0].setAttribute("src", imgSrc);
              }
            }
          });
        },
        { threshold: 0.5 }
      );
      guideItems.forEach((item) => guideObserver.observe(item));
    }

    /* ------------------------------------------------------------------ */
    /* WhatsApp promo card stack — fan out on scroll into view (#21)       */
    /* ------------------------------------------------------------------ */
    const stack = document.querySelector(".ts-stack");
    if (stack && "IntersectionObserver" in window) {
      const stackObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => stack.classList.toggle("is-fanned", entry.isIntersecting));
        },
        { threshold: 0.4 }
      );
      stackObserver.observe(stack);
    }

    /* ------------------------------------------------------------------ */
    /* Magnetic button hover (#23) — desktop only                         */
    /* ------------------------------------------------------------------ */
    if (window.matchMedia("(hover: hover)").matches && !prefersReducedMotion) {
      document.querySelectorAll(".ts-magnetic").forEach((btn) => {
        btn.addEventListener("mousemove", (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          const clampedX = Math.max(-8, Math.min(8, x * 0.25));
          const clampedY = Math.max(-8, Math.min(8, y * 0.25));
          btn.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
        });
        btn.addEventListener("mouseleave", () => {
          btn.style.transform = "translate(0, 0)";
        });
      });
    }

    /* ------------------------------------------------------------------ */
    /* Sticky mobile CTA bar (#19) — appears once hero scrolls out of view */
    /* ------------------------------------------------------------------ */
    const htHero = document.querySelector(".ts-hero");
    const htMobileCtaBar = document.querySelector(".ts-mobile-cta-bar");

    if (htHero && htMobileCtaBar && "IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => htMobileCtaBar.classList.toggle("is-visible", !entry.isIntersecting));
        },
        { rootMargin: "-64px 0px 0px 0px" }
      );
      heroObserver.observe(htHero);
    }

    /* ------------------------------------------------------------------ */
    /* Progress-linked section dots (#16, desktop only)                    */
    /* ------------------------------------------------------------------ */
    const dotNav = document.querySelector(".ts-section-dots");
    const trackedSections = Array.from(document.querySelectorAll("main > section[id]"));

    if (dotNav && trackedSections.length && "IntersectionObserver" in window) {
      trackedSections.forEach((section) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", section.getAttribute("data-section-label") || section.id);
        dot.addEventListener("click", () => section.scrollIntoView({ behavior: "smooth" }));
        dotNav.appendChild(dot);
      });
      const dotButtons = Array.from(dotNav.children);

      const dotObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const index = trackedSections.indexOf(entry.target);
            if (index === -1) return;
            if (entry.isIntersecting) {
              dotButtons.forEach((d, i) => d.classList.toggle("is-active", i === index));
            }
          });
        },
        { threshold: 0.4 }
      );
      trackedSections.forEach((section) => dotObserver.observe(section));
    }

    /* ------------------------------------------------------------------ */
    /* Hero quick-search — scrolls to Featured Hotels (no backend yet)     */
    /* ------------------------------------------------------------------ */
    const heroSearchForm = document.getElementById("hero-search");
    heroSearchForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      document.getElementById("featured-tents")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (document.querySelector("[data-include]")) {
    document.addEventListener("partials:loaded", initTsPage, { once: true });
  } else {
    initTsPage();
  }
})();

// ==========================================================================
// Merged from js/group-stay.js — shared script consolidation
// ==========================================================================
// Group Stay Cottages in Kodaikanal — page-specific interactions.
// Loaded after include.js + main.js (which handle the shared header/footer).
// Every pattern here only runs if its markup is present, so this file is
// safe even if a section is edited or removed later.

(function () {
  "use strict";

  function initGsPage() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ------------------------------------------------------------------ */
    /* Global reveal system (#22) — fade + translateY on scroll, staggered */
    /* ------------------------------------------------------------------ */
    const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
    if (revealEls.length && "IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const group = Array.from(el.parentElement.querySelectorAll("[data-reveal]"));
            const index = group.indexOf(el);
            el.style.transitionDelay = prefersReducedMotion ? "0ms" : `${Math.min(index, 6) * 90}ms`;
            el.classList.add("is-visible");
            revealObserver.unobserve(el);
          });
        },
        { threshold: 0.15 }
      );
      revealEls.forEach((el) => revealObserver.observe(el));

      // Failsafe: if a layout quirk or a testing/crawler tool never fires
      // the observer for an off-screen element, don't leave it hidden.
      window.setTimeout(() => {
        revealEls.forEach((el) => el.classList.add("is-visible"));
      }, 4000);
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    /* ------------------------------------------------------------------ */
    /* Count-up numbers (#2 / #24) — stat strip + review rating           */
    /* ------------------------------------------------------------------ */
    function animateCount(el) {
      const target = parseFloat(el.getAttribute("data-count-to"));
      const decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
      const suffix = el.getAttribute("data-suffix") || "";
      if (prefersReducedMotion) {
        el.textContent = target.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        return;
      }
      const duration = 1300;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = value.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const countEls = Array.from(document.querySelectorAll("[data-count-to]"));
    if (countEls.length && "IntersectionObserver" in window) {
      const countObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              countObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      countEls.forEach((el) => countObserver.observe(el));
    }

    /* ------------------------------------------------------------------ */
    /* Smooth-height <details> accordions (#4 hotel cards + #18 FAQ)      */
    /* ------------------------------------------------------------------ */
    function wireAnimatedDetails(selector, panelSelector) {
      document.querySelectorAll(selector).forEach((details) => {
        const summary = details.querySelector("summary");
        const panel = details.querySelector(panelSelector);
        if (!summary || !panel) return;

        summary.addEventListener("click", (event) => {
          event.preventDefault();
          const isOpen = details.hasAttribute("open");

          if (isOpen) {
            panel.style.height = panel.scrollHeight + "px";
            requestAnimationFrame(() => {
              panel.style.height = "0px";
            });
            panel.addEventListener(
              "transitionend",
              () => {
                details.removeAttribute("open");
              },
              { once: true }
            );
          } else {
            details.setAttribute("open", "");
            panel.style.height = "0px";
            requestAnimationFrame(() => {
              panel.style.height = panel.scrollHeight + "px";
            });
            panel.addEventListener(
              "transitionend",
              () => {
                panel.style.height = "auto";
              },
              { once: true }
            );
          }
        });
      });
    }

    wireAnimatedDetails(".gs-hotel-details", ".gs-hotel-details-panel");

    /* ------------------------------------------------------------------ */
    /* Experience card hover/tap reveal (#5) — tap toggles on touch        */
    /* ------------------------------------------------------------------ */
    document.querySelectorAll(".gs-exp-card").forEach((card) => {
      card.addEventListener("touchstart", () => {
        document.querySelectorAll(".gs-exp-card.is-active").forEach((other) => {
          if (other !== card) other.classList.remove("is-active");
        });
        card.classList.toggle("is-active");
      }, { passive: true });
    });

    /* ------------------------------------------------------------------ */
    /* Flip cards (#7) — tap toggles on touch devices                     */
    /* ------------------------------------------------------------------ */
    document.querySelectorAll(".gs-flip-card").forEach((card) => {
      card.addEventListener("click", () => {
        if (window.matchMedia("(hover: none)").matches) {
          card.classList.toggle("is-flipped");
        }
      });
    });

    /* ------------------------------------------------------------------ */
    /* Tabbed category switcher (#8)                                      */
    /* ------------------------------------------------------------------ */
    const tabBtns = Array.from(document.querySelectorAll(".gs-tab-btn"));
    const tabPanels = Array.from(document.querySelectorAll(".gs-tab-panel"));

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab");
        tabBtns.forEach((b) => {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-selected", String(b === btn));
        });
        tabPanels.forEach((panel) => {
          panel.classList.toggle("is-active", panel.getAttribute("data-tab-panel") === target);
        });
      });
    });

    /* ------------------------------------------------------------------ */
    /* Countdown deal banner (#9) — counts down to the coming Sunday       */
    /* ------------------------------------------------------------------ */
    const countdownEl = document.querySelector("[data-countdown]");
    if (countdownEl) {
      const dEl = countdownEl.querySelector('[data-unit="d"]');
      const hEl = countdownEl.querySelector('[data-unit="h"]');
      const mEl = countdownEl.querySelector('[data-unit="m"]');
      const sEl = countdownEl.querySelector('[data-unit="s"]');

      function nextTarget() {
        const now = new Date();
        const target = new Date(now);
        const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
        target.setDate(now.getDate() + daysUntilSunday);
        target.setHours(23, 59, 59, 0);
        return target;
      }

      let target = nextTarget();

      function pad(n) {
        return String(n).padStart(2, "0");
      }

      function tickCountdown() {
        const now = new Date();
        let diff = target.getTime() - now.getTime();
        if (diff <= 0) {
          target = nextTarget();
          diff = target.getTime() - now.getTime();
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        if (dEl) dEl.textContent = pad(days);
        if (hEl) hEl.textContent = pad(hours);
        if (mEl) mEl.textContent = pad(minutes);
        if (sEl) sEl.textContent = pad(seconds);
      }

      tickCountdown();
      window.setInterval(tickCountdown, 1000);
    }

    /* ------------------------------------------------------------------ */
    /* Guest reviews — drag-to-scroll (#10) + dot indicators               */
    /* ------------------------------------------------------------------ */
    const reviewsTrack = document.querySelector(".gs-reviews-track");
    if (reviewsTrack) {
      let isDown = false;
      let startX = 0;
      let scrollStart = 0;

      reviewsTrack.addEventListener("pointerdown", (e) => {
        isDown = true;
        reviewsTrack.classList.add("is-dragging");
        startX = e.clientX;
        scrollStart = reviewsTrack.scrollLeft;
        reviewsTrack.setPointerCapture(e.pointerId);
      });
      reviewsTrack.addEventListener("pointermove", (e) => {
        if (!isDown) return;
        reviewsTrack.scrollLeft = scrollStart - (e.clientX - startX);
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach((evt) => {
        reviewsTrack.addEventListener(evt, () => {
          isDown = false;
          reviewsTrack.classList.remove("is-dragging");
        });
      });

      const dots = Array.from(document.querySelectorAll(".gs-review-dots button"));
      const cards = Array.from(reviewsTrack.querySelectorAll(".gs-review-card"));

      dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
          cards[i]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        });
      });

      const updateDots = () => {
        const scrollLeft = reviewsTrack.scrollLeft;
        let closest = 0;
        let closestDist = Infinity;
        cards.forEach((card, i) => {
          const dist = Math.abs(card.offsetLeft - scrollLeft);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        dots.forEach((dot, i) => dot.classList.toggle("is-active", i === closest));
      };
      updateDots();
      reviewsTrack.addEventListener("scroll", () => window.requestAnimationFrame(updateDots), { passive: true });
    }

    /* ------------------------------------------------------------------ */
    /* Sticky-scroll travel guides (#11) — highlight active paragraph      */
    /* ------------------------------------------------------------------ */
    const guideItems = Array.from(document.querySelectorAll(".gs-guide-item"));
    const guideImages = document.querySelectorAll(".gs-guides-sticky img");

    if (guideItems.length && "IntersectionObserver" in window) {
      const guideObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const item = entry.target;
            item.classList.toggle("is-active", entry.isIntersecting);
            if (entry.isIntersecting) {
              const imgSrc = item.getAttribute("data-image");
              if (imgSrc && guideImages[0] && guideImages[0].getAttribute("src") !== imgSrc) {
                guideImages[0].setAttribute("src", imgSrc);
              }
            }
          });
        },
        { threshold: 0.5 }
      );
      guideItems.forEach((item) => guideObserver.observe(item));
    }

    /* ------------------------------------------------------------------ */
    /* WhatsApp promo card stack — fan out on scroll into view (#21)       */
    /* ------------------------------------------------------------------ */
    const stack = document.querySelector(".gs-stack");
    if (stack && "IntersectionObserver" in window) {
      const stackObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => stack.classList.toggle("is-fanned", entry.isIntersecting));
        },
        { threshold: 0.4 }
      );
      stackObserver.observe(stack);
    }

    /* ------------------------------------------------------------------ */
    /* Magnetic button hover (#23) — desktop only                         */
    /* ------------------------------------------------------------------ */
    if (window.matchMedia("(hover: hover)").matches && !prefersReducedMotion) {
      document.querySelectorAll(".gs-magnetic").forEach((btn) => {
        btn.addEventListener("mousemove", (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          const clampedX = Math.max(-8, Math.min(8, x * 0.25));
          const clampedY = Math.max(-8, Math.min(8, y * 0.25));
          btn.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
        });
        btn.addEventListener("mouseleave", () => {
          btn.style.transform = "translate(0, 0)";
        });
      });
    }

    /* ------------------------------------------------------------------ */
    /* Sticky mobile CTA bar (#19) — appears once hero scrolls out of view */
    /* ------------------------------------------------------------------ */
    const htHero = document.querySelector(".gs-hero");
    const htMobileCtaBar = document.querySelector(".gs-mobile-cta-bar");

    if (htHero && htMobileCtaBar && "IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => htMobileCtaBar.classList.toggle("is-visible", !entry.isIntersecting));
        },
        { rootMargin: "-64px 0px 0px 0px" }
      );
      heroObserver.observe(htHero);
    }

    /* ------------------------------------------------------------------ */
    /* Progress-linked section dots (#16, desktop only)                    */
    /* ------------------------------------------------------------------ */
    const dotNav = document.querySelector(".gs-section-dots");
    const trackedSections = Array.from(document.querySelectorAll("main > section[id]"));

    if (dotNav && trackedSections.length && "IntersectionObserver" in window) {
      trackedSections.forEach((section) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", section.getAttribute("data-section-label") || section.id);
        dot.addEventListener("click", () => section.scrollIntoView({ behavior: "smooth" }));
        dotNav.appendChild(dot);
      });
      const dotButtons = Array.from(dotNav.children);

      const dotObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const index = trackedSections.indexOf(entry.target);
            if (index === -1) return;
            if (entry.isIntersecting) {
              dotButtons.forEach((d, i) => d.classList.toggle("is-active", i === index));
            }
          });
        },
        { threshold: 0.4 }
      );
      trackedSections.forEach((section) => dotObserver.observe(section));
    }

    /* ------------------------------------------------------------------ */
    /* Hero quick-search — scrolls to Featured Hotels (no backend yet)     */
    /* ------------------------------------------------------------------ */
    const heroSearchForm = document.getElementById("hero-search");
    heroSearchForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      document.getElementById("featured-group-stays")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (document.querySelector("[data-include]")) {
    document.addEventListener("partials:loaded", initGsPage, { once: true });
  } else {
    initGsPage();
  }
})();

// ==========================================================================
// Merged from js/lodge.js — shared script consolidation
// ==========================================================================
// Lodges in Kodaikanal — page-specific interactions.
// Loaded after include.js + main.js (which handle the shared header/footer).
// Every pattern here only runs if its markup is present, so this file is
// safe even if a section is edited or removed later.

(function () {
  "use strict";

  function initLgPage() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ------------------------------------------------------------------ */
    /* Global reveal system (#22) — fade + translateY on scroll, staggered */
    /* ------------------------------------------------------------------ */
    const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
    if (revealEls.length && "IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const group = Array.from(el.parentElement.querySelectorAll("[data-reveal]"));
            const index = group.indexOf(el);
            el.style.transitionDelay = prefersReducedMotion ? "0ms" : `${Math.min(index, 6) * 90}ms`;
            el.classList.add("is-visible");
            revealObserver.unobserve(el);
          });
        },
        { threshold: 0.15 }
      );
      revealEls.forEach((el) => revealObserver.observe(el));

      // Failsafe: if a layout quirk or a testing/crawler tool never fires
      // the observer for an off-screen element, don't leave it hidden.
      window.setTimeout(() => {
        revealEls.forEach((el) => el.classList.add("is-visible"));
      }, 4000);
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    /* ------------------------------------------------------------------ */
    /* Count-up numbers (#2 / #24) — stat strip + review rating           */
    /* ------------------------------------------------------------------ */
    function animateCount(el) {
      const target = parseFloat(el.getAttribute("data-count-to"));
      const decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
      const suffix = el.getAttribute("data-suffix") || "";
      if (prefersReducedMotion) {
        el.textContent = target.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        return;
      }
      const duration = 1300;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = value.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const countEls = Array.from(document.querySelectorAll("[data-count-to]"));
    if (countEls.length && "IntersectionObserver" in window) {
      const countObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              countObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      countEls.forEach((el) => countObserver.observe(el));
    }

    /* ------------------------------------------------------------------ */
    /* Smooth-height <details> accordions (#4 hotel cards + #18 FAQ)      */
    /* ------------------------------------------------------------------ */
    function wireAnimatedDetails(selector, panelSelector) {
      document.querySelectorAll(selector).forEach((details) => {
        const summary = details.querySelector("summary");
        const panel = details.querySelector(panelSelector);
        if (!summary || !panel) return;

        summary.addEventListener("click", (event) => {
          event.preventDefault();
          const isOpen = details.hasAttribute("open");

          if (isOpen) {
            panel.style.height = panel.scrollHeight + "px";
            requestAnimationFrame(() => {
              panel.style.height = "0px";
            });
            panel.addEventListener(
              "transitionend",
              () => {
                details.removeAttribute("open");
              },
              { once: true }
            );
          } else {
            details.setAttribute("open", "");
            panel.style.height = "0px";
            requestAnimationFrame(() => {
              panel.style.height = panel.scrollHeight + "px";
            });
            panel.addEventListener(
              "transitionend",
              () => {
                panel.style.height = "auto";
              },
              { once: true }
            );
          }
        });
      });
    }

    wireAnimatedDetails(".lg-hotel-details", ".lg-hotel-details-panel");

    /* ------------------------------------------------------------------ */
    /* Experience card hover/tap reveal (#5) — tap toggles on touch        */
    /* ------------------------------------------------------------------ */
    document.querySelectorAll(".lg-exp-card").forEach((card) => {
      card.addEventListener("touchstart", () => {
        document.querySelectorAll(".lg-exp-card.is-active").forEach((other) => {
          if (other !== card) other.classList.remove("is-active");
        });
        card.classList.toggle("is-active");
      }, { passive: true });
    });

    /* ------------------------------------------------------------------ */
    /* Flip cards (#7) — tap toggles on touch devices                     */
    /* ------------------------------------------------------------------ */
    document.querySelectorAll(".lg-flip-card").forEach((card) => {
      card.addEventListener("click", () => {
        if (window.matchMedia("(hover: none)").matches) {
          card.classList.toggle("is-flipped");
        }
      });
    });

    /* ------------------------------------------------------------------ */
    /* Tabbed category switcher (#8)                                      */
    /* ------------------------------------------------------------------ */
    const tabBtns = Array.from(document.querySelectorAll(".lg-tab-btn"));
    const tabPanels = Array.from(document.querySelectorAll(".lg-tab-panel"));

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab");
        tabBtns.forEach((b) => {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-selected", String(b === btn));
        });
        tabPanels.forEach((panel) => {
          panel.classList.toggle("is-active", panel.getAttribute("data-tab-panel") === target);
        });
      });
    });

    /* ------------------------------------------------------------------ */
    /* Countdown deal banner (#9) — counts down to the coming Sunday       */
    /* ------------------------------------------------------------------ */
    const countdownEl = document.querySelector("[data-countdown]");
    if (countdownEl) {
      const dEl = countdownEl.querySelector('[data-unit="d"]');
      const hEl = countdownEl.querySelector('[data-unit="h"]');
      const mEl = countdownEl.querySelector('[data-unit="m"]');
      const sEl = countdownEl.querySelector('[data-unit="s"]');

      function nextTarget() {
        const now = new Date();
        const target = new Date(now);
        const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
        target.setDate(now.getDate() + daysUntilSunday);
        target.setHours(23, 59, 59, 0);
        return target;
      }

      let target = nextTarget();

      function pad(n) {
        return String(n).padStart(2, "0");
      }

      function tickCountdown() {
        const now = new Date();
        let diff = target.getTime() - now.getTime();
        if (diff <= 0) {
          target = nextTarget();
          diff = target.getTime() - now.getTime();
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        if (dEl) dEl.textContent = pad(days);
        if (hEl) hEl.textContent = pad(hours);
        if (mEl) mEl.textContent = pad(minutes);
        if (sEl) sEl.textContent = pad(seconds);
      }

      tickCountdown();
      window.setInterval(tickCountdown, 1000);
    }

    /* ------------------------------------------------------------------ */
    /* Guest reviews — drag-to-scroll (#10) + dot indicators               */
    /* ------------------------------------------------------------------ */
    const reviewsTrack = document.querySelector(".lg-reviews-track");
    if (reviewsTrack) {
      let isDown = false;
      let startX = 0;
      let scrollStart = 0;

      reviewsTrack.addEventListener("pointerdown", (e) => {
        isDown = true;
        reviewsTrack.classList.add("is-dragging");
        startX = e.clientX;
        scrollStart = reviewsTrack.scrollLeft;
        reviewsTrack.setPointerCapture(e.pointerId);
      });
      reviewsTrack.addEventListener("pointermove", (e) => {
        if (!isDown) return;
        reviewsTrack.scrollLeft = scrollStart - (e.clientX - startX);
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach((evt) => {
        reviewsTrack.addEventListener(evt, () => {
          isDown = false;
          reviewsTrack.classList.remove("is-dragging");
        });
      });

      const dots = Array.from(document.querySelectorAll(".lg-review-dots button"));
      const cards = Array.from(reviewsTrack.querySelectorAll(".lg-review-card"));

      dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
          cards[i]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        });
      });

      const updateDots = () => {
        const scrollLeft = reviewsTrack.scrollLeft;
        let closest = 0;
        let closestDist = Infinity;
        cards.forEach((card, i) => {
          const dist = Math.abs(card.offsetLeft - scrollLeft);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        dots.forEach((dot, i) => dot.classList.toggle("is-active", i === closest));
      };
      updateDots();
      reviewsTrack.addEventListener("scroll", () => window.requestAnimationFrame(updateDots), { passive: true });
    }

    /* ------------------------------------------------------------------ */
    /* Sticky-scroll travel guides (#11) — highlight active paragraph      */
    /* ------------------------------------------------------------------ */
    const guideItems = Array.from(document.querySelectorAll(".lg-guide-item"));
    const guideImages = document.querySelectorAll(".lg-guides-sticky img");

    if (guideItems.length && "IntersectionObserver" in window) {
      const guideObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const item = entry.target;
            item.classList.toggle("is-active", entry.isIntersecting);
            if (entry.isIntersecting) {
              const imgSrc = item.getAttribute("data-image");
              if (imgSrc && guideImages[0] && guideImages[0].getAttribute("src") !== imgSrc) {
                guideImages[0].setAttribute("src", imgSrc);
              }
            }
          });
        },
        { threshold: 0.5 }
      );
      guideItems.forEach((item) => guideObserver.observe(item));
    }

    /* ------------------------------------------------------------------ */
    /* WhatsApp promo card stack — fan out on scroll into view (#21)       */
    /* ------------------------------------------------------------------ */
    const stack = document.querySelector(".lg-stack");
    if (stack && "IntersectionObserver" in window) {
      const stackObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => stack.classList.toggle("is-fanned", entry.isIntersecting));
        },
        { threshold: 0.4 }
      );
      stackObserver.observe(stack);
    }

    /* ------------------------------------------------------------------ */
    /* Magnetic button hover (#23) — desktop only                         */
    /* ------------------------------------------------------------------ */
    if (window.matchMedia("(hover: hover)").matches && !prefersReducedMotion) {
      document.querySelectorAll(".lg-magnetic").forEach((btn) => {
        btn.addEventListener("mousemove", (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          const clampedX = Math.max(-8, Math.min(8, x * 0.25));
          const clampedY = Math.max(-8, Math.min(8, y * 0.25));
          btn.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
        });
        btn.addEventListener("mouseleave", () => {
          btn.style.transform = "translate(0, 0)";
        });
      });
    }

    /* ------------------------------------------------------------------ */
    /* Sticky mobile CTA bar (#19) — appears once hero scrolls out of view */
    /* ------------------------------------------------------------------ */
    const htHero = document.querySelector(".lg-hero");
    const htMobileCtaBar = document.querySelector(".lg-mobile-cta-bar");

    if (htHero && htMobileCtaBar && "IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => htMobileCtaBar.classList.toggle("is-visible", !entry.isIntersecting));
        },
        { rootMargin: "-64px 0px 0px 0px" }
      );
      heroObserver.observe(htHero);
    }

    /* ------------------------------------------------------------------ */
    /* Progress-linked section dots (#16, desktop only)                    */
    /* ------------------------------------------------------------------ */
    const dotNav = document.querySelector(".lg-section-dots");
    const trackedSections = Array.from(document.querySelectorAll("main > section[id]"));

    if (dotNav && trackedSections.length && "IntersectionObserver" in window) {
      trackedSections.forEach((section) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", section.getAttribute("data-section-label") || section.id);
        dot.addEventListener("click", () => section.scrollIntoView({ behavior: "smooth" }));
        dotNav.appendChild(dot);
      });
      const dotButtons = Array.from(dotNav.children);

      const dotObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const index = trackedSections.indexOf(entry.target);
            if (index === -1) return;
            if (entry.isIntersecting) {
              dotButtons.forEach((d, i) => d.classList.toggle("is-active", i === index));
            }
          });
        },
        { threshold: 0.4 }
      );
      trackedSections.forEach((section) => dotObserver.observe(section));
    }

    /* ------------------------------------------------------------------ */
    /* Hero quick-search — scrolls to Featured Hotels (no backend yet)     */
    /* ------------------------------------------------------------------ */
    const heroSearchForm = document.getElementById("hero-search");
    heroSearchForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      document.getElementById("featured-lodges")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (document.querySelector("[data-include]")) {
    document.addEventListener("partials:loaded", initLgPage, { once: true });
  } else {
    initLgPage();
  }
})();

// ==========================================================================
// Merged from js/villas.js — shared script consolidation
// ==========================================================================
// Villas in Kodaikanal — page-specific interactions.
// Loaded after include.js + main.js (which handle the shared header/footer).
// Every pattern here only runs if its markup is present, so this file is
// safe even if a section is edited or removed later.

(function () {
  "use strict";

  function initVlPage() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ------------------------------------------------------------------ */
    /* Global reveal system (#22) — fade + translateY on scroll, staggered */
    /* ------------------------------------------------------------------ */
    const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
    if (revealEls.length && "IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const group = Array.from(el.parentElement.querySelectorAll("[data-reveal]"));
            const index = group.indexOf(el);
            el.style.transitionDelay = prefersReducedMotion ? "0ms" : `${Math.min(index, 6) * 90}ms`;
            el.classList.add("is-visible");
            revealObserver.unobserve(el);
          });
        },
        { threshold: 0.15 }
      );
      revealEls.forEach((el) => revealObserver.observe(el));

      // Failsafe: if a layout quirk or a testing/crawler tool never fires
      // the observer for an off-screen element, don't leave it hidden.
      window.setTimeout(() => {
        revealEls.forEach((el) => el.classList.add("is-visible"));
      }, 4000);
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    /* ------------------------------------------------------------------ */
    /* Count-up numbers (#2 / #24) — stat strip + review rating           */
    /* ------------------------------------------------------------------ */
    function animateCount(el) {
      const target = parseFloat(el.getAttribute("data-count-to"));
      const decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
      const suffix = el.getAttribute("data-suffix") || "";
      if (prefersReducedMotion) {
        el.textContent = target.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        return;
      }
      const duration = 1300;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = value.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const countEls = Array.from(document.querySelectorAll("[data-count-to]"));
    if (countEls.length && "IntersectionObserver" in window) {
      const countObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              countObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      countEls.forEach((el) => countObserver.observe(el));
    }

    /* ------------------------------------------------------------------ */
    /* Smooth-height <details> accordions (#4 hotel cards + #18 FAQ)      */
    /* ------------------------------------------------------------------ */
    function wireAnimatedDetails(selector, panelSelector) {
      document.querySelectorAll(selector).forEach((details) => {
        const summary = details.querySelector("summary");
        const panel = details.querySelector(panelSelector);
        if (!summary || !panel) return;

        summary.addEventListener("click", (event) => {
          event.preventDefault();
          const isOpen = details.hasAttribute("open");

          if (isOpen) {
            panel.style.height = panel.scrollHeight + "px";
            requestAnimationFrame(() => {
              panel.style.height = "0px";
            });
            panel.addEventListener(
              "transitionend",
              () => {
                details.removeAttribute("open");
              },
              { once: true }
            );
          } else {
            details.setAttribute("open", "");
            panel.style.height = "0px";
            requestAnimationFrame(() => {
              panel.style.height = panel.scrollHeight + "px";
            });
            panel.addEventListener(
              "transitionend",
              () => {
                panel.style.height = "auto";
              },
              { once: true }
            );
          }
        });
      });
    }

    wireAnimatedDetails(".vl-hotel-details", ".vl-hotel-details-panel");

    /* ------------------------------------------------------------------ */
    /* Experience card hover/tap reveal (#5) — tap toggles on touch        */
    /* ------------------------------------------------------------------ */
    document.querySelectorAll(".vl-exp-card").forEach((card) => {
      card.addEventListener("touchstart", () => {
        document.querySelectorAll(".vl-exp-card.is-active").forEach((other) => {
          if (other !== card) other.classList.remove("is-active");
        });
        card.classList.toggle("is-active");
      }, { passive: true });
    });

    /* ------------------------------------------------------------------ */
    /* Flip cards (#7) — tap toggles on touch devices                     */
    /* ------------------------------------------------------------------ */
    document.querySelectorAll(".vl-flip-card").forEach((card) => {
      card.addEventListener("click", () => {
        if (window.matchMedia("(hover: none)").matches) {
          card.classList.toggle("is-flipped");
        }
      });
    });

    /* ------------------------------------------------------------------ */
    /* Tabbed category switcher (#8)                                      */
    /* ------------------------------------------------------------------ */
    const tabBtns = Array.from(document.querySelectorAll(".vl-tab-btn"));
    const tabPanels = Array.from(document.querySelectorAll(".vl-tab-panel"));

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab");
        tabBtns.forEach((b) => {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-selected", String(b === btn));
        });
        tabPanels.forEach((panel) => {
          panel.classList.toggle("is-active", panel.getAttribute("data-tab-panel") === target);
        });
      });
    });

    /* ------------------------------------------------------------------ */
    /* Countdown deal banner (#9) — counts down to the coming Sunday       */
    /* ------------------------------------------------------------------ */
    const countdownEl = document.querySelector("[data-countdown]");
    if (countdownEl) {
      const dEl = countdownEl.querySelector('[data-unit="d"]');
      const hEl = countdownEl.querySelector('[data-unit="h"]');
      const mEl = countdownEl.querySelector('[data-unit="m"]');
      const sEl = countdownEl.querySelector('[data-unit="s"]');

      function nextTarget() {
        const now = new Date();
        const target = new Date(now);
        const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
        target.setDate(now.getDate() + daysUntilSunday);
        target.setHours(23, 59, 59, 0);
        return target;
      }

      let target = nextTarget();

      function pad(n) {
        return String(n).padStart(2, "0");
      }

      function tickCountdown() {
        const now = new Date();
        let diff = target.getTime() - now.getTime();
        if (diff <= 0) {
          target = nextTarget();
          diff = target.getTime() - now.getTime();
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        if (dEl) dEl.textContent = pad(days);
        if (hEl) hEl.textContent = pad(hours);
        if (mEl) mEl.textContent = pad(minutes);
        if (sEl) sEl.textContent = pad(seconds);
      }

      tickCountdown();
      window.setInterval(tickCountdown, 1000);
    }

    /* ------------------------------------------------------------------ */
    /* Guest reviews — drag-to-scroll (#10) + dot indicators               */
    /* ------------------------------------------------------------------ */
    const reviewsTrack = document.querySelector(".vl-reviews-track");
    if (reviewsTrack) {
      let isDown = false;
      let startX = 0;
      let scrollStart = 0;

      reviewsTrack.addEventListener("pointerdown", (e) => {
        isDown = true;
        reviewsTrack.classList.add("is-dragging");
        startX = e.clientX;
        scrollStart = reviewsTrack.scrollLeft;
        reviewsTrack.setPointerCapture(e.pointerId);
      });
      reviewsTrack.addEventListener("pointermove", (e) => {
        if (!isDown) return;
        reviewsTrack.scrollLeft = scrollStart - (e.clientX - startX);
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach((evt) => {
        reviewsTrack.addEventListener(evt, () => {
          isDown = false;
          reviewsTrack.classList.remove("is-dragging");
        });
      });

      const dots = Array.from(document.querySelectorAll(".vl-review-dots button"));
      const cards = Array.from(reviewsTrack.querySelectorAll(".vl-review-card"));

      dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
          cards[i]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        });
      });

      const updateDots = () => {
        const scrollLeft = reviewsTrack.scrollLeft;
        let closest = 0;
        let closestDist = Infinity;
        cards.forEach((card, i) => {
          const dist = Math.abs(card.offsetLeft - scrollLeft);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        dots.forEach((dot, i) => dot.classList.toggle("is-active", i === closest));
      };
      updateDots();
      reviewsTrack.addEventListener("scroll", () => window.requestAnimationFrame(updateDots), { passive: true });
    }

    /* ------------------------------------------------------------------ */
    /* Sticky-scroll travel guides (#11) — highlight active paragraph      */
    /* ------------------------------------------------------------------ */
    const guideItems = Array.from(document.querySelectorAll(".vl-guide-item"));
    const guideImages = document.querySelectorAll(".vl-guides-sticky img");

    if (guideItems.length && "IntersectionObserver" in window) {
      const guideObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const item = entry.target;
            item.classList.toggle("is-active", entry.isIntersecting);
            if (entry.isIntersecting) {
              const imgSrc = item.getAttribute("data-image");
              if (imgSrc && guideImages[0] && guideImages[0].getAttribute("src") !== imgSrc) {
                guideImages[0].setAttribute("src", imgSrc);
              }
            }
          });
        },
        { threshold: 0.5 }
      );
      guideItems.forEach((item) => guideObserver.observe(item));
    }

    /* ------------------------------------------------------------------ */
    /* WhatsApp promo card stack — fan out on scroll into view (#21)       */
    /* ------------------------------------------------------------------ */
    const stack = document.querySelector(".vl-stack");
    if (stack && "IntersectionObserver" in window) {
      const stackObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => stack.classList.toggle("is-fanned", entry.isIntersecting));
        },
        { threshold: 0.4 }
      );
      stackObserver.observe(stack);
    }

    /* ------------------------------------------------------------------ */
    /* Magnetic button hover (#23) — desktop only                         */
    /* ------------------------------------------------------------------ */
    if (window.matchMedia("(hover: hover)").matches && !prefersReducedMotion) {
      document.querySelectorAll(".vl-magnetic").forEach((btn) => {
        btn.addEventListener("mousemove", (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          const clampedX = Math.max(-8, Math.min(8, x * 0.25));
          const clampedY = Math.max(-8, Math.min(8, y * 0.25));
          btn.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
        });
        btn.addEventListener("mouseleave", () => {
          btn.style.transform = "translate(0, 0)";
        });
      });
    }

    /* ------------------------------------------------------------------ */
    /* Sticky mobile CTA bar (#19) — appears once hero scrolls out of view */
    /* ------------------------------------------------------------------ */
    const htHero = document.querySelector(".vl-hero");
    const htMobileCtaBar = document.querySelector(".vl-mobile-cta-bar");

    if (htHero && htMobileCtaBar && "IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => htMobileCtaBar.classList.toggle("is-visible", !entry.isIntersecting));
        },
        { rootMargin: "-64px 0px 0px 0px" }
      );
      heroObserver.observe(htHero);
    }

    /* ------------------------------------------------------------------ */
    /* Progress-linked section dots (#16, desktop only)                    */
    /* ------------------------------------------------------------------ */
    const dotNav = document.querySelector(".vl-section-dots");
    const trackedSections = Array.from(document.querySelectorAll("main > section[id]"));

    if (dotNav && trackedSections.length && "IntersectionObserver" in window) {
      trackedSections.forEach((section) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", section.getAttribute("data-section-label") || section.id);
        dot.addEventListener("click", () => section.scrollIntoView({ behavior: "smooth" }));
        dotNav.appendChild(dot);
      });
      const dotButtons = Array.from(dotNav.children);

      const dotObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const index = trackedSections.indexOf(entry.target);
            if (index === -1) return;
            if (entry.isIntersecting) {
              dotButtons.forEach((d, i) => d.classList.toggle("is-active", i === index));
            }
          });
        },
        { threshold: 0.4 }
      );
      trackedSections.forEach((section) => dotObserver.observe(section));
    }

    /* ------------------------------------------------------------------ */
    /* Hero quick-search — scrolls to Featured Hotels (no backend yet)     */
    /* ------------------------------------------------------------------ */
    const heroSearchForm = document.getElementById("hero-search");
    heroSearchForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      document.getElementById("featured-villas")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (document.querySelector("[data-include]")) {
    document.addEventListener("partials:loaded", initVlPage, { once: true });
  } else {
    initVlPage();
  }
})();
