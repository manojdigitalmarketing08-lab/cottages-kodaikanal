// Shared trip enquiry form (partials/enquiry-form.html) — builds a WhatsApp
// message from the form fields. Pages customise it with data- attributes on
// <body>: data-enquiry-price, data-enquiry-price-note, data-enquiry-trip,
// data-enquiry-stay and data-enquiry-label (what the quote is "for").
(function () {
  "use strict";

  function init() {
    var form = document.getElementById("qf-form");
    if (!form) return;

    var cfg = document.body.dataset;
    var label = cfg.enquiryLabel || "my Kodaikanal trip";

    function setText(selector, value) {
      var el = document.querySelector(selector);
      if (el && value) el.textContent = value;
    }
    setText("[data-qf-price]", cfg.enquiryPrice);
    setText("[data-qf-price-note]", cfg.enquiryPriceNote);

    function preselect(id, value) {
      var el = document.getElementById(id);
      if (el && value) el.value = value;
    }
    preselect("qf-trip", cfg.enquiryTrip);
    preselect("qf-stay", cfg.enquiryStay);

    var wa = document.querySelector("[data-qf-whatsapp]");
    if (wa && cfg.enquiryLabel) {
      wa.href = "https://wa.me/917502345777?text=" + encodeURIComponent("Hi, I'd like a quote for " + label);
    }

    function val(id) {
      var el = document.getElementById(id);
      return el ? el.value.trim() : "";
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var date = val("qf-date");
      var message = val("qf-message");
      var text =
        "Hi, I'd like a quote for " + label + ".\n" +
        "Name: " + val("qf-name") + "\n" +
        "Phone: " + val("qf-phone") +
        (date ? "\nTravel Date: " + date : "") +
        "\nTrip: " + val("qf-trip") +
        "\nTravellers: " + val("qf-travellers") +
        "\nPickup: " + val("qf-pickup") +
        "\nVehicle: " + val("qf-vehicle") +
        "\nStay: " + val("qf-stay") +
        (message ? "\nMessage: " + message : "");
      window.open("https://wa.me/917502345777?text=" + encodeURIComponent(text), "_blank", "noopener");
    });
  }

  document.addEventListener("partials:loaded", init, { once: true });
})();
