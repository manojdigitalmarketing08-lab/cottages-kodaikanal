// Cottages Kodaikanal — vanilla JS, no dependencies
// JS only where CSS/native HTML can't do the job (mobile nav toggle, tab
// switching, sticky CTA bar visibility). FAQ uses native <details>, no JS.

(function () {
  "use strict";

  function initSite() {

  /* ------------------------------------------------------------------ */
  /* Header shadow — appears only once the page has scrolled, keeping    */
  /* the header visually quiet at rest (premium restraint, not a bar     */
  /* with a shadow baked in permanently)                                  */
  /* ------------------------------------------------------------------ */
  const siteHeader = document.querySelector(".site-header");

  if (siteHeader) {
    const toggleHeaderShadow = () => {
      siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    toggleHeaderShadow();
    window.addEventListener("scroll", toggleHeaderShadow, { passive: true });
  }

  /* ------------------------------------------------------------------ */
  /* Mobile nav toggle                                                   */
  /* ------------------------------------------------------------------ */
  const navToggle = document.querySelector(".nav-toggle");
  const primaryNav = document.getElementById("primary-nav");

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = primaryNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    primaryNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        primaryNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Mega menus (Property Types, Services) — click-to-toggle so it works */
  /* the same way on touch and desktop; closes on outside click / Escape */
  /* ------------------------------------------------------------------ */
  const megaItems = Array.from(document.querySelectorAll(".has-mega"));

  if (megaItems.length) {
    const closeAllMega = (except) => {
      megaItems.forEach((item) => {
        if (item === except) return;
        item.classList.remove("is-open");
        item.querySelector(".nav-mega-toggle")?.setAttribute("aria-expanded", "false");
      });
    };

    megaItems.forEach((item) => {
      const toggle = item.querySelector(".nav-mega-toggle");
      if (!toggle) return;

      toggle.addEventListener("click", () => {
        const isOpen = item.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
        closeAllMega(isOpen ? item : null);
      });

      item.querySelectorAll(".mega-menu a").forEach((link) => {
        link.addEventListener("click", () => {
          const tabId = link.getAttribute("data-tab-target");
          if (tabId) document.getElementById(tabId)?.click();
          item.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });

      // Two-pane category/panel switching within this mega menu, only when
      // it actually has switchable panels (Property Types is a flat grid
      // of direct links and has none)
      const catItems = Array.from(item.querySelectorAll(".mega-cat-item"));
      const panels = Array.from(item.querySelectorAll(".mega-panel"));
      if (catItems.length && panels.length) {
        const activateCategory = (cat) => {
          const targetId = cat.getAttribute("data-mega-panel");
          catItems.forEach((c) => c.classList.toggle("is-active", c === cat));
          panels.forEach((p) => p.classList.toggle("is-active", p.id === targetId));
        };

        catItems.forEach((cat) => {
          cat.addEventListener("click", () => activateCategory(cat));
          cat.addEventListener("mouseenter", () => activateCategory(cat));
          cat.addEventListener("focus", () => activateCategory(cat));
        });
      }
    });

    document.addEventListener("click", (event) => {
      // "Outside the dropdown" means outside the trigger and the visible
      // menu card — not just outside the whole nav item, since the
      // full-width glass backdrop bar is technically still inside .has-mega
      if (!event.target.closest(".nav-mega-toggle, .mega-panel-card")) closeAllMega();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeAllMega();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Destinations slider — arrow nav over the native scroll-snap track,  */
  /* buttons disable themselves at the scroll bounds                     */
  /* ------------------------------------------------------------------ */
  const carouselWrapper = document.querySelector(".carousel-wrapper");
  const carouselTrack = document.querySelector(".carousel-track");

  if (carouselWrapper && carouselTrack) {
    const prevBtn = carouselWrapper.querySelector(".carousel-nav.prev");
    const nextBtn = carouselWrapper.querySelector(".carousel-nav.next");
    const scrollAmount = () => carouselTrack.clientWidth * 0.8;

    prevBtn?.addEventListener("click", () => {
      carouselTrack.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
    });

    nextBtn?.addEventListener("click", () => {
      carouselTrack.scrollBy({ left: scrollAmount(), behavior: "smooth" });
    });

    const updateNavState = () => {
      const maxScroll = carouselTrack.scrollWidth - carouselTrack.clientWidth - 1;
      const atStart = carouselTrack.scrollLeft <= 0;
      const atEnd = carouselTrack.scrollLeft >= maxScroll;
      if (prevBtn) prevBtn.disabled = atStart;
      if (nextBtn) nextBtn.disabled = atEnd;
      // Fade overlays only show on the side that still has content to
      // scroll to — the first/last card is never dimmed.
      carouselWrapper.classList.toggle("has-fade-left", !atStart);
      carouselWrapper.classList.toggle("has-fade-right", !atEnd);
    };

    updateNavState();
    carouselTrack.addEventListener("scroll", () => window.requestAnimationFrame(updateNavState), {
      passive: true,
    });
    window.addEventListener("resize", updateNavState);
  }

  /* ------------------------------------------------------------------ */
  /* Testimonials slider — arrow nav + dot pagination over the native    */
  /* scroll-snap track                                                    */
  /* ------------------------------------------------------------------ */
  const testimonialWrapper = document.querySelector(".testimonial-wrapper");
  const testimonialTrack = document.querySelector(".testimonial-track");

  if (testimonialWrapper && testimonialTrack) {
    const prevBtn = testimonialWrapper.querySelector(".testimonial-nav.prev");
    const nextBtn = testimonialWrapper.querySelector(".testimonial-nav.next");
    const dots = Array.from(document.querySelectorAll(".testimonial-dots .dot"));
    const slides = Array.from(testimonialTrack.querySelectorAll(".testimonial-slide"));

    const goToSlide = (index) => {
      slides[index]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    };

    prevBtn?.addEventListener("click", () => {
      const current = slides.findIndex((slide) => Math.abs(slide.getBoundingClientRect().left - testimonialTrack.getBoundingClientRect().left) < 4);
      goToSlide(Math.max(0, current - 1));
    });

    nextBtn?.addEventListener("click", () => {
      const current = slides.findIndex((slide) => Math.abs(slide.getBoundingClientRect().left - testimonialTrack.getBoundingClientRect().left) < 4);
      goToSlide(Math.min(slides.length - 1, current + 1));
    });

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => goToSlide(index));
    });

    const updateTestimonialState = () => {
      const maxScroll = testimonialTrack.scrollWidth - testimonialTrack.clientWidth - 1;
      const activeIndex = Math.round(
        (testimonialTrack.scrollLeft / (testimonialTrack.scrollWidth - testimonialTrack.clientWidth || 1)) *
          (slides.length - 1)
      );

      if (prevBtn) prevBtn.disabled = testimonialTrack.scrollLeft <= 0;
      if (nextBtn) nextBtn.disabled = testimonialTrack.scrollLeft >= maxScroll;

      dots.forEach((dot, index) => {
        dot.setAttribute("aria-selected", String(index === activeIndex));
      });
    };

    updateTestimonialState();
    testimonialTrack.addEventListener(
      "scroll",
      () => window.requestAnimationFrame(updateTestimonialState),
      { passive: true }
    );
    window.addEventListener("resize", updateTestimonialState);
  }

  /* ------------------------------------------------------------------ */
  /* Property type tabs — ARIA tablist pattern, keyboard accessible      */
  /* ------------------------------------------------------------------ */
  const tablist = document.querySelector('[role="tablist"]');

  if (tablist) {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const panels = tabs.map((tab) =>
      document.getElementById(tab.getAttribute("aria-controls"))
    );

    function selectTab(index) {
      tabs.forEach((tab, i) => {
        const selected = i === index;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (panels[i]) panels[i].hidden = !selected;
      });
      tabs[index].focus();
    }

    tablist.addEventListener("click", (event) => {
      const tab = event.target.closest('[role="tab"]');
      if (!tab) return;
      selectTab(tabs.indexOf(tab));
    });

    tablist.addEventListener("keydown", (event) => {
      const currentIndex = tabs.findIndex(
        (tab) => tab.getAttribute("aria-selected") === "true"
      );
      let nextIndex = null;

      if (event.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        selectTab(nextIndex);
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Property type tablist — arrow nav over the scrollable tab strip,    */
  /* buttons disable themselves at the scroll bounds                    */
  /* ------------------------------------------------------------------ */
  const tablistWrapper = document.querySelector(".tablist-wrapper");
  const tablistTrack = tablistWrapper?.querySelector(".tablist");

  if (tablistWrapper && tablistTrack) {
    const prevBtn = tablistWrapper.querySelector(".carousel-nav.prev");
    const nextBtn = tablistWrapper.querySelector(".carousel-nav.next");
    const scrollAmount = () => tablistTrack.clientWidth * 0.8;

    prevBtn?.addEventListener("click", () => {
      tablistTrack.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
    });

    nextBtn?.addEventListener("click", () => {
      tablistTrack.scrollBy({ left: scrollAmount(), behavior: "smooth" });
    });

    const updateTablistNavState = () => {
      const maxScroll = tablistTrack.scrollWidth - tablistTrack.clientWidth - 1;
      const atStart = tablistTrack.scrollLeft <= 0;
      const atEnd = tablistTrack.scrollLeft >= maxScroll;
      if (prevBtn) prevBtn.disabled = atStart;
      if (nextBtn) nextBtn.disabled = atEnd;
    };

    updateTablistNavState();
    tablistTrack.addEventListener("scroll", () => window.requestAnimationFrame(updateTablistNavState), {
      passive: true,
    });
    window.addEventListener("resize", updateTablistNavState);
  }

  /* ------------------------------------------------------------------ */
  /* Hero category tabs + the "All Kodaikanal Properties" filter chips   */
  /* share one active category — picking either updates both, plus the  */
  /* hidden #hero-category input used by the booking hand-off, plus     */
  /* which property cards the slider below shows.                      */
  /* ------------------------------------------------------------------ */
  const heroCategoryTabs = document.querySelector(".hero-category-tabs");
  const heroCategoryInput = document.getElementById("hero-category");
  const propertiesFilter = document.querySelector(".properties-filter");
  const propertiesTrack = document.querySelector(".properties-track");

  function setActiveCategory(category) {
    if (!category) return;

    heroCategoryTabs?.querySelectorAll(".hero-category-btn").forEach((tab) => {
      const active = tab.dataset.category === category;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-pressed", String(active));
    });
    if (heroCategoryInput) heroCategoryInput.value = category;

    propertiesFilter?.querySelectorAll(".properties-filter-btn").forEach((chip) => {
      const active = chip.dataset.propertyCategory === category;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", String(active));
    });

    if (propertiesTrack) {
      propertiesTrack.querySelectorAll(".property-card").forEach((card) => {
        card.hidden = card.dataset.propertyCategory !== category;
      });
      propertiesTrack.scrollTo({ left: 0 });
      propertiesTrack.dispatchEvent(new Event("scroll"));
    }
  }

  heroCategoryTabs?.addEventListener("click", (event) => {
    const btn = event.target.closest(".hero-category-btn");
    if (!btn) return;
    setActiveCategory(btn.dataset.category);
  });

  propertiesFilter?.addEventListener("click", (event) => {
    const chip = event.target.closest(".properties-filter-btn");
    if (!chip) return;
    setActiveCategory(chip.dataset.propertyCategory);
  });

  document.querySelector(".hotels-cta-btn")?.addEventListener("click", (event) => {
    setActiveCategory(event.currentTarget.dataset.category);
  });

  /* ------------------------------------------------------------------ */
  /* All-properties slider — arrow nav over the scrollable property      */
  /* track, buttons disable themselves at the scroll bounds              */
  /* ------------------------------------------------------------------ */
  const propertiesWrapper = document.querySelector(".properties-slider-wrapper");

  if (propertiesWrapper && propertiesTrack) {
    const prevBtn = propertiesWrapper.querySelector(".carousel-nav.prev");
    const nextBtn = propertiesWrapper.querySelector(".carousel-nav.next");
    const scrollAmount = () => propertiesTrack.clientWidth * 0.8;

    prevBtn?.addEventListener("click", () => {
      propertiesTrack.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
    });

    nextBtn?.addEventListener("click", () => {
      propertiesTrack.scrollBy({ left: scrollAmount(), behavior: "smooth" });
    });

    const updatePropertiesNavState = () => {
      const maxScroll = propertiesTrack.scrollWidth - propertiesTrack.clientWidth - 1;
      const atStart = propertiesTrack.scrollLeft <= 0;
      const atEnd = propertiesTrack.scrollLeft >= maxScroll;
      if (prevBtn) prevBtn.disabled = atStart;
      if (nextBtn) nextBtn.disabled = atEnd;
    };

    updatePropertiesNavState();
    propertiesTrack.addEventListener("scroll", () => window.requestAnimationFrame(updatePropertiesNavState), {
      passive: true,
    });
    window.addEventListener("resize", updatePropertiesNavState);
  }

  /* ------------------------------------------------------------------ */
  /* Hero quick-search widget — reveals the matching properties below     */
  /* (already filtered to the selected stay category) instead of jumping  */
  /* straight to the enquiry form; each result's own Book Now button      */
  /* handles the actual hand-off to WhatsApp/call                         */
  /* ------------------------------------------------------------------ */
  const heroSearch = document.getElementById("hero-search");
  const allPropertiesSection = document.getElementById("all-properties");

  if (heroSearch && allPropertiesSection) {
    heroSearch.addEventListener("submit", (event) => {
      event.preventDefault();
      allPropertiesSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Property card "Book Now" — opens WhatsApp with the property name     */
  /* pre-filled into the message, so every card can share one static href */
  /* and still send a distinct message                                    */
  /* ------------------------------------------------------------------ */
  document.addEventListener("click", (event) => {
    const bookBtn = event.target.closest(".property-book-btn");
    if (!bookBtn) return;

    const propertyName = bookBtn.closest(".property-card")?.querySelector("h3")?.textContent.trim();
    if (!propertyName) return;

    const message = `Hi, I'd like to book ${propertyName} in Kodaikanal. Could you share availability and pricing?`;
    bookBtn.href = `https://wa.me/917502345777?text=${encodeURIComponent(message)}`;
  });

  /* ------------------------------------------------------------------ */
  /* Sticky bottom mobile CTA bar — appears once hero scrolls out of view */
  /* ------------------------------------------------------------------ */
  const hero = document.querySelector(".hero");
  const mobileCtaBar = document.querySelector(".mobile-cta-bar");

  if (hero && mobileCtaBar && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          mobileCtaBar.classList.toggle("is-visible", !entry.isIntersecting);
        });
      },
      { rootMargin: "-64px 0px 0px 0px" }
    );
    observer.observe(hero);
  }

  /* ------------------------------------------------------------------ */
  /* Footer copyright year                                               */
  /* ------------------------------------------------------------------ */
  const footerYear = document.getElementById("footer-year");
  if (footerYear) {
    footerYear.textContent = String(new Date().getFullYear());
  }

  }

  document.addEventListener("partials:loaded", initSite, { once: true });
})();
