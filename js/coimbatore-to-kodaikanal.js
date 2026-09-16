// Page-specific behavior for coimbatore-to-kodaikanal.html.
// Runs after partials (header/footer) have loaded.
(function () {
  "use strict";

  function initPage() {
    var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------------------------------------------------------------- */
    /* Reveal-on-scroll for [data-reveal] elements                      */
    /* ---------------------------------------------------------------- */
    var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    if (revealEls.length && "IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach(function (el) {
        revealObserver.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }

    /* ---------------------------------------------------------------- */
    /* Route timeline — scroll-linked line fill + active node + image   */
    /* ---------------------------------------------------------------- */
    var routeTimeline = document.querySelector(".ctk-route-timeline");
    var routeLineFill = document.querySelector(".ctk-route-line-fill");
    var routeItems = Array.prototype.slice.call(document.querySelectorAll(".ctk-route-item"));
    var routeImages = Array.prototype.slice.call(document.querySelectorAll("[data-route-image]"));
    var routeLabel = document.getElementById("ctk-route-sticky-label");

    if (routeTimeline && routeLineFill) {
      var updateRouteLine = function () {
        var rect = routeTimeline.getBoundingClientRect();
        var viewportH = window.innerHeight;
        var total = rect.height;
        var visibleTop = viewportH * 0.5 - rect.top;
        var progress = Math.max(0, Math.min(1, visibleTop / total));
        routeLineFill.style.height = (progress * 100).toFixed(1) + "%";
      };
      var lineTicking = false;
      window.addEventListener(
        "scroll",
        function () {
          if (!lineTicking) {
            window.requestAnimationFrame(function () {
              updateRouteLine();
              lineTicking = false;
            });
            lineTicking = true;
          }
        },
        { passive: true }
      );
      updateRouteLine();
    }

    if (routeItems.length && "IntersectionObserver" in window) {
      var routeObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var routeId = entry.target.getAttribute("data-route");
            if (entry.isIntersecting) {
              routeItems.forEach(function (el) {
                el.classList.toggle("is-active", el === entry.target);
              });
              routeImages.forEach(function (img) {
                img.classList.toggle("is-active", img.getAttribute("data-route-image") === routeId);
              });
              if (routeLabel) {
                routeLabel.textContent = entry.target.getAttribute("data-route-label") || "";
              }
            }
          });
        },
        { threshold: 0.5, rootMargin: "-20% 0px -20% 0px" }
      );
      routeItems.forEach(function (item) {
        routeObserver.observe(item);
      });
    }

    /* ---------------------------------------------------------------- */
    /* FAQ index — scrollspy highlighting the active question group     */
    /* ---------------------------------------------------------------- */
    var faqIndexItems = Array.prototype.slice.call(document.querySelectorAll(".ctk-faq-index-item"));
    var faqGroups = Array.prototype.slice.call(document.querySelectorAll(".ctk-faq-group"));

    if (faqIndexItems.length && faqGroups.length && "IntersectionObserver" in window) {
      var faqObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var groupId = entry.target.id;
              faqIndexItems.forEach(function (item) {
                item.classList.toggle("is-active", item.getAttribute("href") === "#" + groupId);
              });
            }
          });
        },
        { threshold: 0.2, rootMargin: "-15% 0px -60% 0px" }
      );
      faqGroups.forEach(function (group) {
        faqObserver.observe(group);
      });
    }

    /* ---------------------------------------------------------------- */
    /* Hero quick-booking widget — vehicle-type tabs + pickup/drop/date, */
    /* duplicated from the home page hero search and wired to WhatsApp   */
    /* ---------------------------------------------------------------- */
    var heroTravelSearch = document.getElementById("hero-travel-search");
    if (heroTravelSearch) {
      var heroBookingCard = heroTravelSearch.closest(".hero-booking-card");
      var heroVehicleTabs = heroBookingCard ? heroBookingCard.querySelector(".hero-category-tabs") : null;
      var heroVehicleInput = document.getElementById("hero-vehicle-type");

      if (heroVehicleTabs) {
        heroVehicleTabs.addEventListener("click", function (event) {
          var btn = event.target.closest(".hero-category-btn");
          if (!btn) return;
          Array.prototype.slice.call(heroVehicleTabs.querySelectorAll(".hero-category-btn")).forEach(function (tab) {
            var active = tab === btn;
            tab.classList.toggle("is-active", active);
            tab.setAttribute("aria-pressed", String(active));
          });
          if (heroVehicleInput) heroVehicleInput.value = btn.getAttribute("data-category") || "";
        });
      }

      heroTravelSearch.addEventListener("submit", function (event) {
        event.preventDefault();

        var vehicle = heroVehicleInput ? heroVehicleInput.value : "";
        var pickupField = document.getElementById("hero-pickup");
        var dropField = document.getElementById("hero-drop");
        var daysField = document.getElementById("hero-days");
        var dateField = document.getElementById("hero-date");

        var pickup = pickupField ? pickupField.value.trim() : "";
        var drop = dropField ? dropField.value.trim() : "";
        var days = daysField ? daysField.value.trim() : "";
        var date = dateField ? dateField.value.trim() : "";

        var parts = [];
        if (vehicle) parts.push(vehicle);
        if (pickup) parts.push("pickup from " + pickup);
        if (drop) parts.push("drop at " + drop);
        if (days) parts.push(days + (days === "1" ? " day" : " days"));
        if (date) parts.push("on " + date);

        var message = "Hi, I'd like to book " + (parts.length ? parts.join(", ") : "a cab in Kodaikanal");
        window.open("https://wa.me/917502345777?text=" + encodeURIComponent(message), "_blank", "noopener");
      });
    }

    /* ---------------------------------------------------------------- */
    /* Scroll indicator on the hero                                     */
    /* ---------------------------------------------------------------- */
    var scrollIndicator = document.querySelector(".ctk-scroll-indicator");
    if (scrollIndicator) {
      scrollIndicator.addEventListener("click", function () {
        var targetId = scrollIndicator.getAttribute("data-scroll-to");
        var target = targetId && document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
        }
      });
    }

    /* ---------------------------------------------------------------- */
    /* Sticky bottom mobile CTA bar — appears once the hero scrolls out */
    /* ---------------------------------------------------------------- */
    var hero = document.querySelector(".ctk-hero");
    var mobileCtaBar = document.querySelector(".mobile-cta-bar");
    if (hero && mobileCtaBar && "IntersectionObserver" in window) {
      var ctaObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            mobileCtaBar.classList.toggle("is-visible", !entry.isIntersecting);
          });
        },
        { rootMargin: "-64px 0px 0px 0px" }
      );
      ctaObserver.observe(hero);
    }
  }

  if (document.getElementById("site-header")) {
    document.addEventListener("partials:loaded", initPage, { once: true });
  } else {
    initPage();
  }
})();
