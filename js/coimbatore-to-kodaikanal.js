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
    /* Right-side quote card — name/phone/vehicle/date drive a live     */
    /* price and the WhatsApp link. Its own self-contained widget (not  */
    /* the shared .hero-search component other route pages use).       */
    /* ---------------------------------------------------------------- */
    var quoteName = document.getElementById("ctk-quote-name");
    var quotePhone = document.getElementById("ctk-quote-phone");
    var quoteVehicle = document.getElementById("ctk-quote-vehicle");
    var quoteDate = document.getElementById("ctk-quote-date");
    var quotePriceValue = document.getElementById("ctk-quote-price-value");
    var quoteSubmit = document.getElementById("ctk-quote-submit");
    if (quoteVehicle && quotePriceValue && quoteSubmit) {
      var updateQuote = function () {
        var option = quoteVehicle.options[quoteVehicle.selectedIndex];
        var price = option.getAttribute("data-price");
        quotePriceValue.textContent = "₹" + Number(price).toLocaleString("en-IN");

        var name = quoteName ? quoteName.value.trim() : "";
        var phone = quotePhone ? quotePhone.value.trim() : "";

        var message = "Hi, I'd like to book a " + option.value + " from Coimbatore to Kodaikanal";
        if (quoteDate && quoteDate.value) message += " on " + quoteDate.value;
        if (name) message += ". My name is " + name;
        if (phone) message += " and my number is " + phone;
        quoteSubmit.href = "https://wa.me/917502345777?text=" + encodeURIComponent(message);
      };
      quoteVehicle.addEventListener("change", updateQuote);
      if (quoteDate) quoteDate.addEventListener("change", updateQuote);
      if (quoteName) quoteName.addEventListener("input", updateQuote);
      if (quotePhone) quotePhone.addEventListener("input", updateQuote);
      updateQuote();
    }

    /* ---------------------------------------------------------------- */
    /* Quote card vertical clamp — the card is position:fixed so it     */
    /* already respects the header (docked just below it). This nudges */
    /* it upward with a transform once the footer scrolls close, so it */
    /* respects the footer boundary the same way, without ever          */
    /* switching position modes (which would cause a layout jump).     */
    /* ---------------------------------------------------------------- */
    var quoteCard = document.getElementById("ctk-side-form");
    var siteFooterEl = document.getElementById("site-footer");
    if (quoteCard && siteFooterEl) {
      var QUOTE_GAP = 16;
      var updateQuoteClamp = function () {
        if (window.innerWidth < 1100) {
          quoteCard.style.transform = "";
          return;
        }
        // Read the card's own CSS-defined position (top: header-height +
        // gap) directly off the layout instead of reimplementing that
        // calc() in JS — clearing the transform first gives the true
        // fixed position for this measurement, since getBoundingClientRect
        // on a position:fixed element reflects any transform already
        // applied to it.
        quoteCard.style.transform = "";
        var naturalTop = quoteCard.getBoundingClientRect().top;
        var cardBottom = naturalTop + quoteCard.offsetHeight;
        var footerTop = siteFooterEl.getBoundingClientRect().top;
        var overlap = cardBottom + QUOTE_GAP - footerTop;
        quoteCard.style.transform = overlap > 0 ? "translateY(-" + overlap + "px)" : "";
      };
      var clampTicking = false;
      window.addEventListener(
        "scroll",
        function () {
          if (!clampTicking) {
            window.requestAnimationFrame(function () {
              updateQuoteClamp();
              clampTicking = false;
            });
            clampTicking = true;
          }
        },
        { passive: true }
      );
      window.addEventListener("resize", updateQuoteClamp);
      updateQuoteClamp();
    }

    /* ---------------------------------------------------------------- */
    /* Rotating fare card carousel (Pickup/Drop, 2-Day, 3-Day fares)     */
    /* ---------------------------------------------------------------- */
    var fareCarousels = Array.prototype.slice.call(document.querySelectorAll(".ctk-fare-carousel"));
    fareCarousels.forEach(function (carousel) {
      var track = carousel.querySelector(".ctk-fare-carousel-track");
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".ctk-fare-slide"));
      var tabs = Array.prototype.slice.call(carousel.querySelectorAll(".ctk-fare-tab"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".ctk-fare-dot"));
      var arrows = Array.prototype.slice.call(carousel.querySelectorAll(".ctk-fare-carousel-arrow"));
      if (!track || !slides.length) return;

      var current = 0;
      var autoplayMs = parseInt(carousel.getAttribute("data-autoplay"), 10);
      var autoplayTimer = null;

      function goTo(index) {
        current = (index + slides.length) % slides.length;
        track.style.transform = "translateX(-" + current * 100 + "%)";
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        tabs.forEach(function (tab) {
          var active = parseInt(tab.getAttribute("data-slide"), 10) === current;
          tab.classList.toggle("is-active", active);
          tab.setAttribute("aria-selected", String(active));
        });
        dots.forEach(function (dot) {
          dot.classList.toggle("is-active", parseInt(dot.getAttribute("data-slide"), 10) === current);
        });
      }

      function stopAutoplay() {
        if (autoplayTimer) {
          window.clearInterval(autoplayTimer);
          autoplayTimer = null;
        }
      }

      function startAutoplay() {
        if (!autoplayMs || prefersReducedMotion) return;
        stopAutoplay();
        autoplayTimer = window.setInterval(function () {
          goTo(current + 1);
        }, autoplayMs);
      }

      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          goTo(parseInt(tab.getAttribute("data-slide"), 10));
          startAutoplay();
        });
      });
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          goTo(parseInt(dot.getAttribute("data-slide"), 10));
          startAutoplay();
        });
      });
      arrows.forEach(function (arrow) {
        arrow.addEventListener("click", function () {
          goTo(current + parseInt(arrow.getAttribute("data-dir"), 10));
          startAutoplay();
        });
      });

      carousel.addEventListener("mouseenter", stopAutoplay);
      carousel.addEventListener("mouseleave", startAutoplay);

      goTo(0);
      startAutoplay();
    });

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
    /* Sticky bottom mobile CTA bar + the right-side quote card — both   */
    /* appear once the hero scrolls out, driven by the same observer.   */
    /* The quote card starts hidden (opacity: 0 in CSS) so it never     */
    /* covers any part of the hero photo, then fades in from section 2  */
    /* onward — just an opacity change, no position/slide, so nothing   */
    /* jumps.                                                            */
    /* ---------------------------------------------------------------- */
    var hero = document.querySelector(".ctk-hero");
    var mobileCtaBar = document.querySelector(".mobile-cta-bar");
    var quoteCardVisibility = document.getElementById("ctk-side-form");
    if (hero && "IntersectionObserver" in window && (mobileCtaBar || quoteCardVisibility)) {
      var ctaObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (mobileCtaBar) mobileCtaBar.classList.toggle("is-visible", !entry.isIntersecting);
            if (quoteCardVisibility) quoteCardVisibility.classList.toggle("is-visible", !entry.isIntersecting);
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
