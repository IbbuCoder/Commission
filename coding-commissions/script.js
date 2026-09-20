/* =========================================================
   Ibrahim Mohammed Ahmed | Coding & Technology
   Shared site JavaScript (homepage + quiz page)
   Vanilla JavaScript — no build step, no dependencies
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------------- Footer year ---------------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------- Toast ---------------- */
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------------- Header / navigation ---------------- */
  var header = $("#site-header");
  var navToggle = $("#nav-toggle");
  var navMenu = $("#nav-menu");

  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navMenu.classList.toggle("open", open);
    header.classList.toggle("menu-open", open);
  }
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      setMenu(navToggle.getAttribute("aria-expanded") !== "true");
    });
  }
  if (navMenu) {
    navMenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navToggle && navToggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      navToggle.focus();
    }
  });
  document.addEventListener("click", function (e) {
    if (!navMenu || !navMenu.classList.contains("open")) return;
    if (!e.target.closest("#nav-menu") && !e.target.closest("#nav-toggle")) setMenu(false);
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 960) setMenu(false);
  });

  /* Active nav state */
  var navLinks = $$(".nav-links a[data-nav]");
  var navMap = {
    home: "home", anything: "home",
    services: "services", work: "work", technologies: "technologies",
    how: "pricing", pricing: "pricing", estimate: "pricing",
    faq: "faq", contact: "contact"
  };
  function setActive(key) {
    navLinks.forEach(function (a) {
      var on = a.getAttribute("data-nav") === key;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  }
  var sections = $$("main > section[id]");
  function updateActive() {
    if (!sections.length || !document.getElementById("home")) return; // other pages (e.g. quiz.html)
    var line = window.innerHeight * 0.35;
    var current = "home";
    sections.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.top <= line) current = s.id;
    });
    if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 4) current = "contact";
    setActive(navMap[current] || "home");
  }
  var activeTick = false;
  window.addEventListener("scroll", function () {
    if (activeTick) return;
    activeTick = true;
    requestAnimationFrame(function () { updateActive(); activeTick = false; });
  }, { passive: true });
  updateActive();

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = $$(".reveal, .reveal-stagger");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------------- Hero background canvas ---------------- */
  (function heroCanvas() {
    var canvas = $("#hero-canvas");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var glyphs = ["{", "}", "<", ">", "/", ";", "()", "=>", "[]", "0", "1", "#", "&&", "::", "fn", "def", "let", "$"];
    var cols = [], w = 0, h = 0, dpr = 1, running = false, visible = true, raf;
    var cell = 34;

    function setup() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = w < 600 ? 30 : 36;
      cols = [];
      var n = Math.ceil(w / cell);
      for (var i = 0; i < n; i++) {
        var items = [];
        var count = Math.ceil(h / (cell * 1.4)) + 2;
        for (var j = 0; j < count; j++) {
          items.push({
            g: Math.random() < 0.3 ? glyphs[(Math.random() * glyphs.length) | 0] : "",
            y: j * cell * 1.4 + Math.random() * cell,
            a: Math.random() < 0.08 ? 0.3 : 0.04 + Math.random() * 0.07,
            hot: Math.random() < 0.06
          });
        }
        cols.push({ x: i * cell + cell / 2, speed: 0.08 + Math.random() * 0.22, items: items });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.font = "500 13px 'JetBrains Mono', ui-monospace, monospace";
      ctx.textAlign = "center";
      for (var i = 0; i < cols.length; i++) {
        var c = cols[i];
        for (var j = 0; j < c.items.length; j++) {
          var it = c.items[j];
          if (!it.g) continue;
          // fade glyphs near the left text column so the headline stays readable
          var fade = Math.min(1, Math.max(0.25, (c.x / w) * 1.6));
          var edge = Math.min(1, it.y / 80, (h - it.y) / 120);
          var alpha = Math.max(0, it.a * fade * edge);
          ctx.fillStyle = it.hot ? "rgba(242,169,59," + (alpha * 1.4).toFixed(3) + ")" : "rgba(236,238,242," + alpha.toFixed(3) + ")";
          ctx.fillText(it.g, c.x, it.y);
        }
      }
    }

    function step() {
      for (var i = 0; i < cols.length; i++) {
        var c = cols[i];
        var span = c.items.length * cell * 1.4;
        for (var j = 0; j < c.items.length; j++) {
          var it = c.items[j];
          it.y -= c.speed;
          if (it.y < -20) {
            it.y += span;
            it.g = Math.random() < 0.3 ? glyphs[(Math.random() * glyphs.length) | 0] : "";
            it.hot = Math.random() < 0.06;
          }
        }
      }
      draw();
      if (running) raf = requestAnimationFrame(step);
    }

    function start() {
      if (running || reduceMotion || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(step);
    }
    function stop() { running = false; cancelAnimationFrame(raf); }

    setup(); draw();
    var resizeT;
    window.addEventListener("resize", function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(function () { setup(); draw(); }, 150);
    });
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        visible ? start() : stop();
      }).observe(canvas);
    }
    start();
  })();

  /* ---------------- Hero terminal typing ---------------- */
  (function terminal() {
    var el = $("#terminal-text");
    if (!el) return;
    var lines = [
      [["t-prompt", "$ "], ["t-cmd", "estimate --type \"discord bot\""]],
      [["", "  size ........... "], ["t-cmd", "medium"]],
      [["", "  features ....... "], ["t-cmd", "3–5"]],
      [["", "  existing code .. "], ["t-cmd", "no"]],
      [["", "  timeline ....... "], ["t-cmd", "3–7 days"]],
      [["", "  "], ["t-ok", "✓ "], ["", "scope analyzed"]],
      [["", ""]],
      [["", "  estimated range: "], ["t-hl", "$75–200"]],
      [["", "  status: "], ["t-cmd", "sent for personal review"]]
    ];
    function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    function render(lineIdx, segIdx, charIdx) {
      var out = "";
      for (var i = 0; i <= lineIdx && i < lines.length; i++) {
        var segs = lines[i];
        for (var s = 0; s < segs.length; s++) {
          var cls = segs[s][0], txt = segs[s][1];
          if (i === lineIdx && s > segIdx) break;
          if (i === lineIdx && s === segIdx) txt = txt.slice(0, charIdx);
          out += cls ? '<span class="' + cls + '">' + esc(txt) + "</span>" : esc(txt);
        }
        if (i < lineIdx) out += "\n";
      }
      el.innerHTML = out + '<span class="caret"></span>';
    }
    if (reduceMotion) { render(lines.length - 1, 99, 999); return; }

    var li = 0, si = 0, ci = 0;
    function tick() {
      var seg = lines[li][si];
      var typed = si === 0 && li === 0 ? 38 : 16;
      if (seg && ci < seg[1].length) {
        ci++;
        render(li, si, ci);
        setTimeout(tick, li === 0 ? typed + Math.random() * 40 : typed);
        return;
      }
      if (si < lines[li].length - 1) { si++; ci = 0; tick(); return; }
      if (li < lines.length - 1) {
        li++; si = 0; ci = 0;
        render(li, 0, 0);
        setTimeout(tick, li === 7 ? 500 : li === 1 ? 420 : 140);
        return;
      }
      render(li, si, ci);
      setTimeout(function () { li = 0; si = 0; ci = 0; render(0, 0, 0); setTimeout(tick, 600); }, 7000);
    }
    render(0, 0, 0);
    setTimeout(tick, 700);
  })();

  /* ---------------- Copy Discord handle ---------------- */
  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () { toast("Copied " + text); };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
      } else { fallbackCopy(text); done(); }
    });
  });
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", "");
    ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  /* ---------------- Technology search ---------------- */
  (function techSearch() {
    var input = $("#tech-search");
    var grid = $("#tech-grid");
    if (!input || !grid) return;
    var groups = $$(".tech-group", grid);
    var countEl = $("#tech-count");
    var resetBtn = $("#tech-reset");
    var empty = $("#tech-empty");
    var emptyTerm = $("#tech-empty-term");
    var total = $$("li", grid).length;

    function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

    function apply() {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        groups.forEach(function (g) {
          g.hidden = false;
          $$("li", g).forEach(function (li) { li.hidden = false; li.classList.remove("match"); });
        });
        countEl.textContent = total + " technologies";
        resetBtn.hidden = true;
        empty.hidden = true;
        return;
      }
      var re = new RegExp("(^|[^a-z0-9])" + escRe(q));
      var shown = 0, shownGroups = 0;
      groups.forEach(function (g) {
        var title = $("h3", g).firstChild.textContent.toLowerCase();
        var kw = (g.getAttribute("data-keywords") || "").toLowerCase();
        var groupMatch = re.test(title) || re.test(kw);
        var visibleInGroup = 0;
        $$("li", g).forEach(function (li) {
          var m = re.test(li.textContent.toLowerCase());
          li.classList.toggle("match", m);
          li.hidden = !(m || groupMatch);
          if (!li.hidden) visibleInGroup++;
        });
        g.hidden = visibleInGroup === 0;
        if (!g.hidden) { shownGroups++; shown += visibleInGroup; }
      });
      countEl.textContent = shown
        ? shown + (shown === 1 ? " result" : " results") + " in " + shownGroups + (shownGroups === 1 ? " category" : " categories")
        : "No results";
      resetBtn.hidden = false;
      empty.hidden = shown !== 0;
      if (emptyTerm) emptyTerm.textContent = input.value.trim();
    }

    input.addEventListener("input", apply);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && input.value) { e.preventDefault(); input.value = ""; apply(); }
    });
    resetBtn.addEventListener("click", function () { input.value = ""; apply(); input.focus(); });
    apply();
  })();

})();
