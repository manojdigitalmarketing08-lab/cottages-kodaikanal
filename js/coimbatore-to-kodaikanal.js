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
