// Vehicle hire + pickup/drop pages (css/rides.css). Everything is driven by
// data attributes so each page can compose its own signature widgets:
//   [data-pick="name"] > .rd-opt[data-value][data-set-KEY]  choice groups
//   [data-tabs] > [role=tab][aria-controls][data-set-KEY]    tab sets
//   [data-bind="KEY"]      receives the chosen value (text, img src, or a
//                          WhatsApp href when the key starts with "wa")
//   [data-when="name:v1|v2"]  shown only while group "name" has that value
//   form[data-waform][data-intro]  builds a WhatsApp message from its fields
(function () {
  "use strict";

  var WA = "https://wa.me/917502345777?text=";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var state = {};

  function all(sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); }

  function applySet(el) {
    Object.keys(el.dataset).forEach(function (k) {
      if (k.indexOf("set") !== 0 || k.length < 4) return;
      var key = k.slice(3).replace(/^[A-Z]/, function (c) { return c.toLowerCase(); })
        .replace(/[A-Z]/g, function (c) { return "-" + c.toLowerCase(); });
      var val = el.dataset[k];
      all('[data-bind="' + key + '"]').forEach(function (t) {
        if (t.tagName === "IMG") { t.src = val; }
        else if (key.indexOf("wa") === 0) { t.href = WA + encodeURIComponent(val); }
        else { t.textContent = val; }
      });
    });
    // data-qf="qf-pickup:Madurai" keeps the shared enquiry form in step.
    if (el.dataset.qf) {
      var i = el.dataset.qf.indexOf(":");
      var sel = document.getElementById(el.dataset.qf.slice(0, i));
      var want = el.dataset.qf.slice(i + 1);
      if (sel && [].some.call(sel.options, function (o) { return o.value === want; })) sel.value = want;
    }
    composeWa();
  }

  // a[data-wa-template="Hi, from {from} in {ride}"] fills each {key} from the
  // current text of [data-bind="key"], so several pickers build one message.
  function composeWa() {
    all("[data-wa-template]").forEach(function (a) {
      var msg = a.getAttribute("data-wa-template").replace(/\{([\w-]+)\}/g, function (m, key) {
        var src = document.querySelector('[data-bind="' + key + '"]');
        return src ? src.textContent.trim() : "";
      });
      a.href = WA + encodeURIComponent(msg);
    });
  }

  function applyWhen() {
    all("[data-when]").forEach(function (el) {
      var parts = el.getAttribute("data-when").split(":");
      var ok = parts[1].split("|").indexOf(state[parts[0]]) !== -1;
      el.hidden = !ok;
    });
  }

  function initPickers() {
    all("[data-pick]").forEach(function (group) {
      var name = group.getAttribute("data-pick");
      var opts = all(".rd-opt", group);
      function choose(opt) {
        opts.forEach(function (o) {
          var on = o === opt;
          o.classList.toggle("is-active", on);
          o.setAttribute("aria-pressed", String(on));
        });
        state[name] = opt.getAttribute("data-value");
        applySet(opt);
        applyWhen();
      }
      opts.forEach(function (o) { o.addEventListener("click", function () { choose(o); }); });
      var start = group.querySelector(".rd-opt.is-active") || opts[0];
      if (start) { state[name] = start.getAttribute("data-value"); opts.forEach(function (o) { o.setAttribute("aria-pressed", String(o === start)); }); }
    });
    applyWhen();
    composeWa();
  }

  function initTabs() {
    all("[data-tabs]").forEach(function (bar) {
      var tabs = all('[role="tab"]', bar);
      function show(i, focus) {
        tabs.forEach(function (t, n) {
          var on = n === i;
          t.setAttribute("aria-selected", String(on));
          t.tabIndex = on ? 0 : -1;
          var p = document.getElementById(t.getAttribute("aria-controls"));
          if (p) { p.hidden = !on; p.classList.toggle("is-in", on); }
        });
        applySet(tabs[i]);
        if (focus) tabs[i].focus();
      }
      tabs.forEach(function (t, n) {
        t.addEventListener("click", function () { show(n); });
        t.addEventListener("keydown", function (e) {
          if (e.key === "ArrowRight") { e.preventDefault(); show((n + 1) % tabs.length, true); }
          if (e.key === "ArrowLeft") { e.preventDefault(); show((n - 1 + tabs.length) % tabs.length, true); }
        });
      });
    });
  }

  function initFaq() {
    all(".rd-faq-item").forEach(function (item) {
      var q = item.querySelector(".rd-faq-q");
      q.addEventListener("click", function () {
        var open = !item.classList.contains("is-open");
        item.classList.toggle("is-open", open);
        q.setAttribute("aria-expanded", String(open));
      });
    });
  }

  function initWaForms() {
    all("form[data-waform]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var lines = [form.getAttribute("data-intro")];
        all("[data-label]", form).forEach(function (f) {
          if (f.value.trim()) lines.push(f.getAttribute("data-label") + ": " + f.value.trim());
        });
        window.open(WA + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
      });
    });
  }

  function initJump() {
    var links = all(".rd-jump a");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-on"); });
        var a = map[e.target.id];
        if (a) {
          a.classList.add("is-on");
          var bar = a.parentNode;
          bar.scrollTo({ left: a.offsetLeft - bar.clientWidth / 2 + a.clientWidth / 2, behavior: reduce ? "auto" : "smooth" });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  function initReveal() {
    var els = all(".rd-lead, .rd-jump, .rd-sec, .rd-book, .qf-card, .rd-final, [data-stagger] > *");
    if (reduce || !("IntersectionObserver" in window)) return;
    els.forEach(function (el) {
      el.classList.add("rd-rv");
      if (el.parentNode.hasAttribute("data-stagger")) {
        el.style.transitionDelay = Math.min([].indexOf.call(el.parentNode.children, el), 6) * 70 + "ms";
      }
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -30px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  function initChrome() {
    var prog = document.querySelector(".rd-progress span");
    var top = document.querySelector(".rd-top");
    var tick = false;
    function onScroll() {
      var h = document.documentElement.scrollHeight - innerHeight;
      if (prog) prog.style.transform = "scaleX(" + (h > 0 ? Math.min(scrollY / h, 1) : 0) + ")";
      if (top) top.classList.toggle("is-show", scrollY > 900);
      tick = false;
    }
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
    if (top) top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });
    onScroll();

    var aside = document.querySelector(".rd-aside");
    function fit() {
      if (!aside) return;
      var cs = getComputedStyle(aside);
      if (cs.position !== "sticky" || cs.display === "contents") { aside.style.top = ""; return; }
      aside.style.top = Math.min(100, innerHeight - aside.offsetHeight - 16) + "px";
    }
    fit();
    window.addEventListener("resize", fit);
    setTimeout(fit, 400);
  }

  function init() {
    initPickers();
    initTabs();
    initFaq();
    initWaForms();
    initJump();
    initReveal();
    initChrome();
  }

  if (document.getElementById("site-header")) document.addEventListener("partials:loaded", init, { once: true });
  else init();
})();
