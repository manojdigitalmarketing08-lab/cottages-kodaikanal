// Loads shared partials (nav, footer) into their placeholder elements.
// index.html's header/footer markup is the source of truth — both files
// live in partials/ and every page pulls them in by id at runtime.
(function () {
  "use strict";

  function loadPartial(el) {
    var src = el.getAttribute("data-include");
    return fetch(src)
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load " + src + ": " + res.status);
        return res.text();
      })
      .then(function (html) {
        el.outerHTML = html;
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  var includeEls = Array.prototype.slice.call(document.querySelectorAll("[data-include]"));

  Promise.all(includeEls.map(loadPartial)).then(function () {
    document.dispatchEvent(new Event("partials:loaded"));
  });
})();
