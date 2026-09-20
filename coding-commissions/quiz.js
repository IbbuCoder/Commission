/* =========================================================
   Instant Estimate Quiz (quiz.html)
   Vanilla JavaScript — no build step, no dependencies
   ========================================================= */


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  WEB3FORMS ACCESS KEY — PASTE YOUR KEY HERE                   ║
   ║                                                               ║
   ║  1. Create a free access key at https://web3forms.com using   ║
   ║     the email ibrahim.asim.contact@gmail.com                  ║
   ║     (Web3Forms delivers every submission to the email the     ║
   ║     key was created with.)                                    ║
   ║  2. Replace the text between the quotes below with your key.  ║
   ║     Keep the quotes. Example:                                 ║
   ║     const WEB3FORMS_ACCESS_KEY = "a1b2c3d4-....";             ║
   ╚═══════════════════════════════════════════════════════════════╝ */
const WEB3FORMS_ACCESS_KEY = "07b0f59f-629d-4588-a65b-9a3ef614c6f2";
/* ═══════════════════ END OF THE PART YOU EDIT ═══════════════════ */


(function () {
  "use strict";

  var KEY_PLACEHOLDER = "PASTE_YOUR_WEB3FORMS_ACCESS_KEY_HERE";
  var WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
  var EMAIL_SUBJECT = "New Coding Commission — Instant Estimate";
  var RANGES = ["$5–25", "$25–75", "$75–200", "$200–400", "$400–700", "$700–1,000+"];
  var STORAGE_KEY = "ibr_estimate_quiz_v1";
  var SENT_KEY = "ibr_estimate_quiz_last_sent";
  var TOTAL = 8;

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var form = $("#quiz");
  if (!form) return;

  var current = 1;
  var steps = $$(".q-step", form);
  var stepsWrap = $("#quiz-steps-wrap");
  var backBtn = $("#quiz-back");
  var nextBtn = $("#quiz-next");
  var progressFill = $("#progress-fill");
  var progressBar = $("#progress-bar");
  var progressLabel = $("#progress-label");
  var progressName = $("#progress-name");
  var dots = $$("#progress-dots li");
  var resultEl = $("#quiz-result");
  var successEl = $("#state-success");
  var errorEl = $("#state-error");
  var errorDetail = $("#error-detail");
  var customField = $("#custom-type-field");
  var customInput = $("#custom_project_type");
  var descInput = $("#project_description");
  var descCount = $("#desc-count");
  var submitBtn = $("#submit-request");
  var retryBtn = $("#retry-submit");
  var submitStatus = $("#submit-status");
  var lastEstimate = "";
  var submitting = false;

  var RADIO_NAMES = ["project_type", "project_size", "feature_count", "existing_code", "timeline", "budget"];
  var TEXT_IDS = ["custom_project_type", "main_features", "project_description", "name", "email", "discord"];

  /* ---------------- Helpers ---------------- */
  function val(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }
  function text(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }
  function setRadio(name, value) {
    $$('input[name="' + name + '"]', form).forEach(function (r) { r.checked = r.value === value; });
  }
  function firstRadio(name) { return form.querySelector('input[name="' + name + '"]'); }

  /* ---------------- Answer persistence (localStorage) ---------------- */
  var storageOk = (function () {
    try { localStorage.setItem("__t", "1"); localStorage.removeItem("__t"); return true; } catch (e) { return false; }
  })();

  function saveState(view) {
    if (!storageOk) return;
    var data = { step: current, view: view || currentView(), answers: {} };
    RADIO_NAMES.forEach(function (n) { data.answers[n] = val(n); });
    TEXT_IDS.forEach(function (id) { data.answers[id] = document.getElementById(id).value; });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* storage full or blocked */ }
  }
  function loadState() {
    if (!storageOk) return null;
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (e) { return null; }
  }
  function clearState() {
    if (!storageOk) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  }
  function currentView() {
    if (!resultEl.hidden || !errorEl.hidden) return "result";
    return "steps";
  }
  // Saving is tiny and synchronous, so answers are stored on every change.
  function saveSoon() { saveState(); }

  /* ---------------- Custom project type reveal ---------------- */
  function syncCustomField(focus) {
    var other = val("project_type") === "Something Else";
    customField.hidden = !other;
    if (other && focus) setTimeout(function () { customInput.focus(); }, 30);
  }
  $$('input[name="project_type"]', form).forEach(function (r) {
    r.addEventListener("change", function () { syncCustomField(true); });
  });

  /* ---------------- Errors ---------------- */
  function showError(step, msg, focusEl) {
    var el = $("#err-" + step);
    if (el) el.textContent = msg;
    if (focusEl) {
      if ((focusEl.tagName === "INPUT" && focusEl.type !== "radio") || focusEl.tagName === "TEXTAREA") {
        focusEl.setAttribute("aria-invalid", "true");
      }
      focusEl.focus();
    }
  }
  function clearError(step) {
    var el = $("#err-" + step);
    if (el) el.textContent = "";
  }

  steps.forEach(function (s) {
    // Radios clear the error on selection; text fields clear it while typing
    // (not on blur, which would shift the layout right as someone clicks Next).
    s.addEventListener("change", function (e) {
      if (e.target.type === "radio") clearError(+s.getAttribute("data-step"));
      saveSoon();
    });
    s.addEventListener("input", function (e) {
      if (e.target.getAttribute("aria-invalid") === "true") {
        e.target.removeAttribute("aria-invalid");
        clearError(+s.getAttribute("data-step"));
      }
      saveSoon();
    });
  });

  function updateCount() { if (descCount) descCount.textContent = descInput.value.length + " / 5000"; }
  descInput.addEventListener("input", updateCount);

  /* ---------------- Validation ---------------- */
  function validate(step, quiet) {
    var fail = function (msg, el) { if (!quiet) showError(step, msg, el); return false; };
    if (!quiet) clearError(step);
    switch (step) {
      case 1:
        if (!val("project_type")) return fail("Choose what you're building to continue.", firstRadio("project_type"));
        if (val("project_type") === "Something Else" && !text("custom_project_type")) return fail("Describe your project type in a few words.", customInput);
        return true;
      case 2:
        if (!val("project_size")) return fail("Choose a project size to continue.", firstRadio("project_size"));
        return true;
      case 3:
        if (!val("feature_count")) return fail("Choose how many features you need.", firstRadio("feature_count"));
        return true;
      case 4:
        if (!val("existing_code")) return fail("Choose an option about existing code.", firstRadio("existing_code"));
        return true;
      case 5:
        if (!val("timeline")) return fail("Choose a timeline to continue.", firstRadio("timeline"));
        return true;
      case 6:
        if (!val("budget")) return fail("Choose a budget range, or pick \"I'm not sure\".", firstRadio("budget"));
        return true;
      case 7:
        var d = text("project_description");
        if (!d) return fail("Describe your project so I know what to quote.", descInput);
        if (d.length < 15) return fail("Add a bit more detail (at least 15 characters).", descInput);
        return true;
      case 8:
        if (!text("name")) return fail("Enter your name.", $("#name"));
        if (!text("email")) return fail("Enter your email so I can send your quote.", $("#email"));
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text("email"))) return fail("Enter a valid email address, like you@example.com.", $("#email"));
        return true;
    }
    return true;
  }
  function firstInvalidStep() {
    for (var s = 1; s <= TOTAL; s++) if (!validate(s, true)) return s;
    return 0;
  }

  /* ---------------- Step navigation ---------------- */
  function goTo(step, direction, focus) {
    current = step;
    steps.forEach(function (s) {
      var on = +s.getAttribute("data-step") === step;
      s.hidden = !on;
      s.classList.remove("enter", "enter-back");
      if (on && !reduceMotion && direction) {
        void s.offsetWidth;
        s.classList.add(direction === "back" ? "enter-back" : "enter");
      }
    });
    progressFill.style.width = (step / TOTAL) * 100 + "%";
    progressBar.setAttribute("aria-valuenow", String(step));
    progressBar.setAttribute("aria-valuetext", "Step " + step + " of " + TOTAL);
    progressLabel.innerHTML = "<strong>Step " + step + "</strong> of " + TOTAL;
    progressName.textContent = steps[step - 1].getAttribute("data-name");
    dots.forEach(function (d, i) {
      d.classList.toggle("done", i + 1 < step);
      d.classList.toggle("current", i + 1 === step);
    });
    backBtn.hidden = step === 1;
    nextBtn.textContent = step === TOTAL ? "See My Estimate" : "Next";
    if (focus !== false) {
      var legend = $(".q-title", steps[step - 1]);
      if (legend) legend.focus({ preventScroll: true });
    }
  }

  function scrollQuizIntoView() {
    var shell = $(".quiz-shell");
    if (!shell) return;
    var top = shell.getBoundingClientRect().top;
    if (top < 60 || top > window.innerHeight * 0.5) {
      var y = window.scrollY + top - 84;
      window.scrollTo({ top: Math.max(0, y), behavior: reduceMotion ? "auto" : "smooth" });
    }
  }

  function next() {
    if (!validate(current)) return;
    if (current < TOTAL) { goTo(current + 1, "forward"); saveState("steps"); scrollQuizIntoView(); }
    else showResult(true);
  }
  function back() {
    if (current > 1) { goTo(current - 1, "back"); saveState("steps"); scrollQuizIntoView(); }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!stepsWrap.hidden) next();
  });
  backBtn.addEventListener("click", back);

  /* ---------------- Estimate calculation ----------------
     Project size sets the base tier; features, project type,
     existing code and timeline adjust it. Budget is recorded
     but never lowers or raises the estimate. */
  function calculateEstimate() {
    var score = { "Tiny": 0, "Small": 1, "Medium": 2, "Large": 3, "Major": 4 }[val("project_size")] || 0;
    score += { "1–2": 0, "3–5": 0.2, "6–10": 0.9, "10+": 1.4 }[val("feature_count")] || 0;
    score += {
      "Website": 0,
      "Web App": 0.5,
      "Discord Bot": 0,
      "Python Project": 0,
      "Automation / Script": -0.1,
      "Rust / C++ / Other Software": 0.5,
      "Minecraft / Game Server": 0.1,
      "AI / API Project": 0.5,
      "Bug Fix / Existing Project": -0.5,
      "Something Else": 0.2
    }[val("project_type")] || 0;
    score += {
      "No, start from scratch": 0,
      "Yes, I have an existing project": -0.3,
      "I have code but it needs major changes": 0.3,
      "I'm not sure": 0.1
    }[val("existing_code")] || 0;
    score += {
      "No rush": 0,
      "Within a week": 0.05,
      "3–7 days": 0.1,
      "1–3 days": 0.5,
      "As soon as possible": 0.6
    }[val("timeline")] || 0;
    var idx = Math.max(0, Math.min(RANGES.length - 1, Math.round(score)));
    return RANGES[idx];
  }

  function projectTypeLabel() {
    var t = val("project_type");
    if (t === "Something Else" && text("custom_project_type")) return "Something Else: " + text("custom_project_type");
    return t;
  }

  /* ---------------- Result screen ---------------- */
  function showResult(animate) {
    lastEstimate = calculateEstimate();
    var amount = $("#estimate-amount");
    amount.textContent = lastEstimate;
    amount.classList.remove("pop");
    if (animate && !reduceMotion) { void amount.offsetWidth; amount.classList.add("pop"); }

    var rows = [
      ["Project", projectTypeLabel()],
      ["Size", val("project_size")],
      ["Features", val("feature_count")],
      ["Existing Code", val("existing_code")],
      ["Timeline", val("timeline")],
      ["Budget", val("budget")]
    ];
    var dl = $("#summary");
    dl.innerHTML = "";
    rows.forEach(function (r) {
      var wrap = document.createElement("div");
      var dt = document.createElement("dt"); dt.textContent = r[0];
      var dd = document.createElement("dd"); dd.textContent = r[1];
      wrap.appendChild(dt); wrap.appendChild(dd);
      dl.appendChild(wrap);
    });
    var d = text("project_description");
    $("#summary-desc").textContent = d.length > 320 ? d.slice(0, 320).trim() + "…" : d;

    setStatus("");
    stepsWrap.hidden = true;
    successEl.hidden = true;
    errorEl.hidden = true;
    resultEl.hidden = false;
    saveState("result");
    if (animate !== "restore") {
      scrollQuizIntoView();
      $("#result-title").focus({ preventScroll: true });
    }
  }

  function showSteps(step) {
    resultEl.hidden = true;
    successEl.hidden = true;
    errorEl.hidden = true;
    stepsWrap.hidden = false;
    goTo(step, "back");
    saveState("steps");
    scrollQuizIntoView();
  }

  function resetQuiz() {
    if (submitting) return;
    form.reset();
    customField.hidden = true;
    for (var i = 1; i <= TOTAL; i++) clearError(i);
    $$("[aria-invalid]", form).forEach(function (el) { el.removeAttribute("aria-invalid"); });
    updateCount();
    lastEstimate = "";
    clearState();
    showSteps(1);
  }

  $("#change-answers").addEventListener("click", function () { showSteps(1); });
  $("#start-over").addEventListener("click", function () {
    if (window.confirm("Start over? This clears all of your answers.")) resetQuiz();
  });
  $("#reset-quiz").addEventListener("click", function () {
    if (window.confirm("Reset the quiz? This clears all of your answers.")) resetQuiz();
  });
  $("#new-request").addEventListener("click", resetQuiz);
  $("#back-to-result").addEventListener("click", function () {
    errorEl.hidden = true;
    resultEl.hidden = false;
    $("#result-title").focus({ preventScroll: true });
  });

  /* ---------------- Web3Forms submission ---------------- */
  function buildPayload() {
    var submittedAt = new Date();
    var when = submittedAt.toLocaleString("en-US", {
      weekday: "short", year: "numeric", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit", timeZoneName: "short"
    });
    var customType = val("project_type") === "Something Else" ? (text("custom_project_type") || "Not provided") : "Not applicable";

    return {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: EMAIL_SUBJECT,
      from_name: "Instant Estimate Quiz",
      replyto: text("email"),
      botcheck: $("#botcheck").checked,

      "Name": text("name"),
      "Email": text("email"),
      "Discord": text("discord") || "Not provided",
      "Project Type": val("project_type"),
      "Custom Project Type": customType,
      "Project Size": val("project_size"),
      "Feature Count": val("feature_count"),
      "Main Features": text("main_features") || "Not provided",
      "Existing Code": val("existing_code"),
      "Timeline": val("timeline"),
      "Budget": val("budget"),
      "Project Description": text("project_description"),
      "Estimated Price Range": lastEstimate + " (automated preliminary estimate, not a final quote)",
      "Submitted At": when,
      "Submitted At (ISO)": submittedAt.toISOString()
    };
  }

  // Fingerprint of the request content (ignores the timestamp) to block accidental re-sends.
  function fingerprint(p) {
    var keys = ["Name", "Email", "Discord", "Project Type", "Custom Project Type", "Project Size", "Feature Count",
      "Main Features", "Existing Code", "Timeline", "Budget", "Project Description"];
    var s = keys.map(function (k) { return p[k]; }).join("\u241E");
    var h = 0;
    for (var i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
    return String(h);
  }
  function recentlySent(fp) {
    if (!storageOk) return false;
    try {
      var rec = JSON.parse(localStorage.getItem(SENT_KEY) || "null");
      return !!(rec && rec.fp === fp && Date.now() - rec.t < 30 * 60 * 1000);
    } catch (e) { return false; }
  }
  function rememberSent(fp) {
    if (!storageOk) return;
    try { localStorage.setItem(SENT_KEY, JSON.stringify({ fp: fp, t: Date.now() })); } catch (e) { /* ignore */ }
  }

  function setStatus(msg, warn) {
    submitStatus.textContent = msg;
    submitStatus.classList.toggle("warn", !!warn);
  }

  function setSubmitting(on) {
    submitting = on;
    submitBtn.disabled = on;
    retryBtn.disabled = on;
    submitBtn.setAttribute("aria-busy", on ? "true" : "false");
    retryBtn.setAttribute("aria-busy", on ? "true" : "false");
    submitBtn.innerHTML = on
      ? '<span class="spinner" aria-hidden="true"></span> Sending your request…'
      : 'Send My Request <span class="arrow" aria-hidden="true">→</span>';
    retryBtn.innerHTML = on
      ? '<span class="spinner" aria-hidden="true"></span> Sending…'
      : "Try Again";
  }

  function showFailure(detail) {
    resultEl.hidden = true;
    successEl.hidden = true;
    errorEl.hidden = false;
    if (detail) { errorDetail.textContent = detail; errorDetail.hidden = false; }
    else { errorDetail.textContent = ""; errorDetail.hidden = true; }
    scrollQuizIntoView();
    $("#error-title").focus({ preventScroll: true });
  }

  function showSuccess() {
    $("#success-range").textContent = lastEstimate;
    resultEl.hidden = true;
    errorEl.hidden = true;
    successEl.hidden = false;
    // The request is delivered, so clear the saved answers from this device.
    form.reset();
    customField.hidden = true;
    updateCount();
    clearState();
    goTo(1, null, false);
    scrollQuizIntoView();
    $("#success-title").focus({ preventScroll: true });
  }

  function submitRequest() {
    if (submitting) return; // blocks double clicks while a request is in flight

    var bad = firstInvalidStep();
    if (bad) { showSteps(bad); validate(bad); return; }
    lastEstimate = calculateEstimate();

    var keyMissing = !WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === KEY_PLACEHOLDER || WEB3FORMS_ACCESS_KEY.trim() === "";
    if (keyMissing) {
      if (window.console) console.error("Web3Forms access key is missing. Paste it into WEB3FORMS_ACCESS_KEY at the top of quiz.js.");
      showFailure("Setup note: the Web3Forms access key hasn't been added to this site yet, so the request was not sent.");
      return;
    }

    var payload = buildPayload();
    var fp = fingerprint(payload);
    if (recentlySent(fp)) {
      setStatus("This exact request was already sent in the last 30 minutes, so it wasn't sent again. Change your answers if you need to send an updated request.", true);
      return;
    }

    setSubmitting(true);
    setStatus("Sending your request…");

    var controller = "AbortController" in window ? new AbortController() : null;
    var timeout = setTimeout(function () { if (controller) controller.abort(); }, 20000);

    fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          // Success ONLY when Web3Forms explicitly confirms it.
          if (!(res.ok && data && data.success === true)) {
            throw new Error((data && data.message) || ("The form service responded with status " + res.status + "."));
          }
          return data;
        });
      })
      .then(function () {
        clearTimeout(timeout);
        rememberSent(fp);
        setSubmitting(false);
        setStatus("");
        showSuccess();
      })
      .catch(function (err) {
        clearTimeout(timeout);
        setSubmitting(false);
        setStatus("");
        var msg = err && err.name === "AbortError"
          ? "The request timed out. Check your connection and try again."
          : (err && err.message && err.message !== "Failed to fetch" ? err.message : "Couldn't reach the form service. Check your connection and try again.");
        if (window.console) console.warn("Estimate submission failed:", err);
        showFailure(msg);
      });
  }

  submitBtn.addEventListener("click", submitRequest);
  retryBtn.addEventListener("click", submitRequest);

  /* ---------------- Restore saved answers + ?budget= from pricing ---------------- */
  (function init() {
    var saved = loadState();
    if (saved && saved.answers) {
      RADIO_NAMES.forEach(function (n) { if (saved.answers[n]) setRadio(n, saved.answers[n]); });
      TEXT_IDS.forEach(function (id) {
        if (typeof saved.answers[id] === "string") document.getElementById(id).value = saved.answers[id];
      });
    }

    var params = new URLSearchParams(window.location.search);
    var b = parseInt(params.get("budget"), 10);
    if (b >= 1 && b <= RANGES.length) {
      setRadio("budget", RANGES[b - 1]);
      if (history.replaceState) history.replaceState(null, "", window.location.pathname + window.location.hash);
    }

    syncCustomField(false);
    updateCount();

    var step = saved && saved.step >= 1 && saved.step <= TOTAL ? saved.step : 1;
    // Never let a restored step skip past an unanswered earlier step.
    var bad = firstInvalidStep();
    if (bad && bad < step) step = bad;

    goTo(step, null, false);
    if (saved && saved.view === "result" && !bad) showResult("restore");
    else saveState("steps");
  })();
})();
