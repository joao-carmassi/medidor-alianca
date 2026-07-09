/* =====================================================================
   DANIEL CARMASSI — Medidor de Aliança
   app.js — vanilla JS, no dependencies, no build step.
   ---------------------------------------------------------------------
   Flow:
     hero -> step1 (calibrar cartão) -> step2 (medir aliança) -> result
   Calibration (px per mm) is persisted in localStorage so returning
   visitors can skip straight to step 2.
   ===================================================================== */
(function () {
  "use strict";

  /* -------------------------------------------------------------------
     1. Constants (ABNT / ISO reference values — do not change casually)
     ------------------------------------------------------------------- */
  var CARD_WIDTH_MM = 85.60;   // ISO/IEC 7810 ID-1 width
  var CARD_HEIGHT_MM = 53.98;  // ISO/IEC 7810 ID-1 height
  var CARD_ASPECT = CARD_HEIGHT_MM / CARD_WIDTH_MM; // height / width

  var ARO_MIN = 8;
  var ARO_MAX = 34;

  var STORAGE_KEY = "dc_pxPorMM";

  /* -------------------------------------------------------------------
     2. Math helpers (validated against the Brazilian "aro" standard)
        circumference(mm) = aro + 40
        diameter(mm)      = circumference / PI
        aro               = round(PI * diameter - 40)
     ------------------------------------------------------------------- */
  function aroToDiameterMM(aro) {
    return (aro + 40) / Math.PI;
  }
  function diameterMMToAro(diameterMM) {
    return Math.round(Math.PI * diameterMM - 40);
  }
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
  // pt-BR number formatting: comma as decimal separator, 1 decimal place.
  function formatMM(value) {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " mm";
  }

  /* -------------------------------------------------------------------
     3. DOM references
     ------------------------------------------------------------------- */
  var panels = {
    hero: document.getElementById("panel-hero"),
    step1: document.getElementById("panel-step1"),
    step2: document.getElementById("panel-step2"),
    result: document.getElementById("panel-result")
  };

  var heroActionsFresh = document.getElementById("hero-actions-fresh");
  var heroActionsReturning = document.getElementById("hero-actions-returning");

  var btnStart = document.getElementById("btn-start");
  var btnContinue = document.getElementById("btn-continue");
  var btnRecalibrateFromHero = document.getElementById("btn-recalibrate-from-hero");

  var cardStageFrame = document.getElementById("card-stage-frame");
  var cardObject = document.getElementById("card-object");
  var cardSlider = document.getElementById("card-slider");
  var cardDec = document.getElementById("card-dec");
  var cardInc = document.getElementById("card-inc");
  var cardPxReadout = document.getElementById("card-px-readout");
  var btnBackToHero = document.getElementById("btn-back-to-hero");
  var btnCalibrateDone = document.getElementById("btn-calibrate-done");

  var ringStageFrame = document.getElementById("ring-stage-frame");
  var ringObject = document.getElementById("ring-object");
  var ringLiveAro = document.getElementById("ring-live-aro");
  var ringSlider = document.getElementById("ring-slider");
  var ringDec = document.getElementById("ring-dec");
  var ringInc = document.getElementById("ring-inc");
  var diameterReadout = document.getElementById("diameter-readout");
  var aroReadout = document.getElementById("aro-readout");
  var btnRecalibrateFromStep2 = document.getElementById("btn-recalibrate-from-step2");
  var btnSeeResult = document.getElementById("btn-see-result");

  var resultAro = document.getElementById("result-aro");
  var resultDiameter = document.getElementById("result-diameter");
  var btnWhatsapp = document.getElementById("btn-whatsapp");
  var btnRemeasure = document.getElementById("btn-remeasure");

  /* -------------------------------------------------------------------
     4. State
     ------------------------------------------------------------------- */
  var state = {
    pxPorMM: loadPxPorMM(),
    lastAro: 16,
    lastDiameterMM: aroToDiameterMM(16)
  };

  function loadPxPorMM() {
    var raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage may be unavailable (privacy mode, file:// restrictions, etc.)
      raw = null;
    }
    var value = parseFloat(raw);
    return isFinite(value) && value > 0 ? value : null;
  }

  function savePxPorMM(value) {
    state.pxPorMM = value;
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // Fail silently — the app still works within this session.
    }
  }

  /* -------------------------------------------------------------------
     5. Panel navigation
     ------------------------------------------------------------------- */
  function showPanel(name) {
    Object.keys(panels).forEach(function (key) {
      var el = panels[key];
      if (!el) return;
      if (key === name) {
        el.hidden = false;
        el.removeAttribute("aria-hidden");
        el.classList.add("is-active");
      } else {
        el.classList.remove("is-active");
        el.setAttribute("aria-hidden", "true");
      }
    });
    // Move focus to the new panel's heading for keyboard/screen-reader users.
    var heading = panels[name] && panels[name].querySelector("h1, h2");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  function goToHero() {
    refreshHeroActions();
    showPanel("hero");
  }

  function goToStep1() {
    showPanel("step1");
    // Recompute available sizing whenever the calibration stage is shown.
    requestAnimationFrame(setupCardSlider);
  }

  function goToStep2() {
    // Guard: step 2 requires a calibration. If none exists, send the
    // user back to step 1 instead of showing a broken/meaningless ring.
    if (!state.pxPorMM) {
      goToStep1();
      return;
    }
    showPanel("step2");
    requestAnimationFrame(setupRingSlider);
  }

  function goToResult() {
    resultAro.textContent = String(state.lastAro);
    resultDiameter.textContent = formatMM(state.lastDiameterMM);
    updateWhatsappLink();
    showPanel("result");
  }

  function refreshHeroActions() {
    var hasCalibration = !!state.pxPorMM;
    heroActionsFresh.hidden = hasCalibration;
    heroActionsReturning.hidden = !hasCalibration;
  }

  /* -------------------------------------------------------------------
     6. Step 1 — card calibration
     ------------------------------------------------------------------- */
  function setupCardSlider() {
    var frameWidth = cardStageFrame.clientWidth - 40; // leave breathing room inside the stage
    var maxPx = Math.max(180, Math.min(600, frameWidth));
    var minPx = 120;

    cardSlider.min = String(minPx);
    cardSlider.max = String(maxPx);

    var current = parseInt(cardSlider.value, 10);
    if (!current || current < minPx || current > maxPx) {
      // Reasonable default assuming a common ~96dpi display; the user
      // will correct this manually against their real card anyway.
      current = clamp(320, minPx, maxPx);
    }
    cardSlider.value = String(current);
    renderCard(current);
  }

  function renderCard(widthPx) {
    var heightPx = widthPx * CARD_ASPECT;
    cardObject.style.width = widthPx + "px";
    cardObject.style.height = heightPx + "px";
    cardPxReadout.textContent = Math.round(widthPx) + " px";
  }

  function stepCardSlider(delta) {
    var min = parseInt(cardSlider.min, 10);
    var max = parseInt(cardSlider.max, 10);
    var next = clamp(parseInt(cardSlider.value, 10) + delta, min, max);
    cardSlider.value = String(next);
    renderCard(next);
  }

  cardSlider.addEventListener("input", function () {
    renderCard(parseInt(cardSlider.value, 10));
  });
  cardDec.addEventListener("click", function () { stepCardSlider(-1); });
  cardInc.addEventListener("click", function () { stepCardSlider(1); });

  function confirmCalibration() {
    var cardWidthPx = parseInt(cardSlider.value, 10);
    var pxPorMM = cardWidthPx / CARD_WIDTH_MM;
    savePxPorMM(pxPorMM);
    goToStep2();
  }

  /* -------------------------------------------------------------------
     7. Step 2 — ring measurement
     ------------------------------------------------------------------- */
  function setupRingSlider() {
    if (!state.pxPorMM) return;

    // The slider must always span the FULL Brazilian range (aro 8–34),
    // independent of the stage box size. We reserve enough vertical room
    // for the largest circle so it never gets clipped or capped early.
    var minPx = aroToDiameterMM(ARO_MIN) * state.pxPorMM;
    var maxPx = aroToDiameterMM(ARO_MAX) * state.pxPorMM;

    // Grow the measurement stage so the biggest ring (aro 34) always fits.
    ringStageFrame.style.minHeight = Math.ceil(maxPx + 56) + "px";

    ringSlider.min = String(Math.round(minPx));
    ringSlider.max = String(Math.round(maxPx));
    ringSlider.step = "1";

    var current = parseInt(ringSlider.value, 10);
    var defaultPx = Math.round(aroToDiameterMM(16) * state.pxPorMM);
    if (!current || current < minPx || current > maxPx) {
      current = clamp(defaultPx, Math.round(minPx), Math.round(maxPx));
    }
    ringSlider.value = String(current);
    renderRing(current);
  }

  function renderRing(diameterPx) {
    ringObject.style.width = diameterPx + "px";
    ringObject.style.height = diameterPx + "px";

    var diameterMM = diameterPx / state.pxPorMM;
    var aro = clamp(diameterMMToAro(diameterMM), ARO_MIN, ARO_MAX);

    state.lastDiameterMM = diameterMM;
    state.lastAro = aro;

    diameterReadout.textContent = formatMM(diameterMM);
    aroReadout.textContent = String(aro);
    ringLiveAro.textContent = String(aro);
  }

  function stepRingSlider(delta) {
    var min = parseInt(ringSlider.min, 10);
    var max = parseInt(ringSlider.max, 10);
    var next = clamp(parseInt(ringSlider.value, 10) + delta, min, max);
    ringSlider.value = String(next);
    renderRing(next);
  }

  ringSlider.addEventListener("input", function () {
    renderRing(parseInt(ringSlider.value, 10));
  });
  ringDec.addEventListener("click", function () { stepRingSlider(-1); });
  ringInc.addEventListener("click", function () { stepRingSlider(1); });

  /* -------------------------------------------------------------------
     8. WhatsApp CTA
        Replace the URL below with the real WhatsApp deep link.
        See README.md for details.
     ------------------------------------------------------------------- */
  function updateWhatsappLink() {
    // TODO(daniel-carmassi): set the real WhatsApp number/link here.
    var WHATSAPP_URL = "#";
    btnWhatsapp.setAttribute("href", WHATSAPP_URL);
  }

  /* -------------------------------------------------------------------
     9. Wiring
     ------------------------------------------------------------------- */
  btnStart.addEventListener("click", goToStep1);
  btnContinue.addEventListener("click", goToStep2);
  btnRecalibrateFromHero.addEventListener("click", goToStep1);

  btnBackToHero.addEventListener("click", goToHero);
  btnCalibrateDone.addEventListener("click", confirmCalibration);

  btnRecalibrateFromStep2.addEventListener("click", goToStep1);
  btnSeeResult.addEventListener("click", goToResult);

  btnRemeasure.addEventListener("click", function () {
    // Keeps the saved calibration; only resets the ring measurement.
    goToStep2();
  });

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (panels.step1.classList.contains("is-active")) setupCardSlider();
      if (panels.step2.classList.contains("is-active")) setupRingSlider();
    }, 120);
  });

  /* -------------------------------------------------------------------
     10. Init
     ------------------------------------------------------------------- */
  refreshHeroActions();
  showPanel("hero");
})();

