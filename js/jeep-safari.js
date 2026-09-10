// Page-specific behavior for jeep-safari-kodaikanal.html.
// Runs after partials (header/footer) have loaded.
(function () {
  "use strict";

  function initJeepSafariPage() {
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
    /* Hero: subtle parallax + scroll indicator                         */
    /* ---------------------------------------------------------------- */
    var heroMediaImg = document.querySelector(".jsf-hero-media img");
    if (heroMediaImg && !prefersReducedMotion) {
      var ticking = false;
      window.addEventListener(
        "scroll",
        function () {
          if (!ticking) {
            window.requestAnimationFrame(function () {
              var offset = Math.min(window.scrollY * 0.15, 120);
              heroMediaImg.style.transform = "translateY(" + offset + "px) scale(1.02)";
              ticking = false;
            });
            ticking = true;
          }
        },
        { passive: true }
      );
    }

    var scrollIndicator = document.querySelector(".jsf-scroll-indicator");
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
    /* Why-choose strip — tap-to-toggle for touch devices                */
    /* ---------------------------------------------------------------- */
    var whyItems = Array.prototype.slice.call(document.querySelectorAll(".jsf-why-item"));
    whyItems.forEach(function (item) {
      item.addEventListener("click", function () {
        var wasOpen = item.classList.contains("is-open");
        whyItems.forEach(function (other) {
          other.classList.remove("is-open");
        });
        if (!wasOpen) item.classList.add("is-open");
      });
    });

    /* ---------------------------------------------------------------- */
    /* Route timeline — scroll-linked line fill + active node + image   */
    /* ---------------------------------------------------------------- */
    var routeTimeline = document.querySelector(".jsf-route-timeline");
    var routeLineFill = document.querySelector(".jsf-route-line-fill");
    var routeItems = Array.prototype.slice.call(document.querySelectorAll(".jsf-route-item"));
    var routeImages = Array.prototype.slice.call(document.querySelectorAll("[data-route-image]"));

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
    /* Seasonal timeline                                                 */
    /* ---------------------------------------------------------------- */
    var seasonStops = Array.prototype.slice.call(document.querySelectorAll(".jsf-season-stop"));
    var seasonDetails = Array.prototype.slice.call(document.querySelectorAll("[data-season-detail]"));
    seasonStops.forEach(function (stop) {
      stop.addEventListener("click", function () {
        var season = stop.getAttribute("data-season");
        seasonStops.forEach(function (s) {
          s.classList.toggle("is-active", s === stop);
        });
        seasonDetails.forEach(function (d) {
          d.classList.toggle("is-active", d.getAttribute("data-season-detail") === season);
        });
      });
    });

    /* ---------------------------------------------------------------- */
    /* Safari builder — real selections feeding the WhatsApp CTA         */
    /* ---------------------------------------------------------------- */
    var builderGroups = Array.prototype.slice.call(document.querySelectorAll(".jsf-chip-select"));
    var builderSummaryText = document.getElementById("jsf-builder-summary-text");
    var builderCta = document.getElementById("jsf-builder-cta");

    if (builderGroups.length && builderCta) {
      var selections = {};
      var groupOrder = builderGroups.map(function (group) {
        return group.getAttribute("data-group");
      });
      var serviceName = builderCta.getAttribute("data-service-name") || "jeep safari";

      builderGroups.forEach(function (group) {
        var groupName = group.getAttribute("data-group");
        var activeBtn = group.querySelector(".is-active") || group.querySelector(".jsf-chip-option");
        selections[groupName] = activeBtn ? activeBtn.getAttribute("data-value") : "";

        Array.prototype.slice.call(group.querySelectorAll(".jsf-chip-option")).forEach(function (btn) {
          btn.addEventListener("click", function () {
            Array.prototype.slice.call(group.querySelectorAll(".jsf-chip-option")).forEach(function (b) {
              b.classList.remove("is-active");
            });
            btn.classList.add("is-active");
            selections[groupName] = btn.getAttribute("data-value");
            updateBuilder();
          });
        });
      });

      function updateBuilder() {
        var parts = groupOrder.map(function (key) {
          return selections[key];
        }).filter(Boolean);
        var summary = parts.join(" · ");
        if (builderSummaryText) builderSummaryText.textContent = summary;

        var message = "Hi, I'd like " + serviceName + " — " + parts.join(", ");
        builderCta.href = "https://wa.me/917502345777?text=" + encodeURIComponent(message);
      }

      updateBuilder();
    }

    /* ---------------------------------------------------------------- */
    /* FAQ — single-open accordion + contextual image swap               */
    /* ---------------------------------------------------------------- */
    var faqItems = Array.prototype.slice.call(document.querySelectorAll(".jsf-faq-item"));
    var faqImage = document.getElementById("jsf-faq-image");
    faqItems.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (item.open) {
          faqItems.forEach(function (other) {
            if (other !== item) other.open = false;
          });
          var newSrc = item.getAttribute("data-image");
          if (faqImage && newSrc) faqImage.src = newSrc;
        }
      });
    });

    /* ---------------------------------------------------------------- */
    /* Sticky bottom mobile CTA bar — appears once the hero scrolls out */
    /* ---------------------------------------------------------------- */
    var hero = document.querySelector(".jsf-hero");
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
    document.addEventListener("partials:loaded", initJeepSafariPage, { once: true });
  } else {
    initJeepSafariPage();
  }
})();
