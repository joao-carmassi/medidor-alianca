/* =====================================================================
   DANIEL CARMASSI — Medidor de Alianca
   app.ts — TypeScript module bundled by Astro/Vite.
   ---------------------------------------------------------------------
   Flow:
     hero -> step1 (calibrar cartao) -> step2 (medir alianca) -> result
   Calibration (px per mm) is persisted in localStorage so returning
   visitors can skip straight to step 2.
   ===================================================================== */

type PanelName = 'hero' | 'step1' | 'step2' | 'result';

type AppState = {
  pxPorMM: number | null;
  lastAro: number;
  lastDiameterMM: number;
};

const CARD_WIDTH_MM = 85.6; // ISO/IEC 7810 ID-1 width
const CARD_HEIGHT_MM = 53.98; // ISO/IEC 7810 ID-1 height
const CARD_ASPECT = CARD_HEIGHT_MM / CARD_WIDTH_MM; // height / width

const ARO_MIN = 8;
const ARO_MAX = 34;

const STORAGE_KEY = 'dc_pxPorMM';

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Element #${id} was not found.`);
  }

  return element as T;
}

function aroToDiameterMM(aro: number): number {
  return (aro + 40) / Math.PI;
}

function diameterMMToAro(diameterMM: number): number {
  return Math.round(Math.PI * diameterMM - 40);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatMM(value: number): string {
  return (
    value.toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + ' mm'
  );
}

function loadPxPorMM(): number | null {
  let raw: string | null = null;

  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }

  const value = raw === null ? Number.NaN : Number.parseFloat(raw);
  return Number.isFinite(value) && value > 0 ? value : null;
}

const panels: Record<PanelName, HTMLElement> = {
  hero: getElement('panel-hero'),
  step1: getElement('panel-step1'),
  step2: getElement('panel-step2'),
  result: getElement('panel-result'),
};

const heroActionsFresh = getElement('hero-actions-fresh');
const heroActionsReturning = getElement('hero-actions-returning');

const btnStart = getElement<HTMLButtonElement>('btn-start');
const btnContinue = getElement<HTMLButtonElement>('btn-continue');
const btnRecalibrateFromHero = getElement<HTMLButtonElement>(
  'btn-recalibrate-from-hero',
);

const cardStageFrame = getElement('card-stage-frame');
const cardObject = getElement('card-object');
const cardSlider = getElement<HTMLInputElement>('card-slider');
const cardDec = getElement<HTMLButtonElement>('card-dec');
const cardInc = getElement<HTMLButtonElement>('card-inc');
const cardPxReadout = getElement('card-px-readout');
const btnBackToHero = getElement<HTMLButtonElement>('btn-back-to-hero');
const btnCalibrateDone = getElement<HTMLButtonElement>('btn-calibrate-done');

const ringStageFrame = getElement('ring-stage-frame');
const ringObject = getElement('ring-object');
const ringLiveAro = getElement('ring-live-aro');
const ringSlider = getElement<HTMLInputElement>('ring-slider');
const ringDec = getElement<HTMLButtonElement>('ring-dec');
const ringInc = getElement<HTMLButtonElement>('ring-inc');
const diameterReadout = getElement('diameter-readout');
const aroReadout = getElement('aro-readout');
const btnRecalibrateFromStep2 = getElement<HTMLButtonElement>(
  'btn-recalibrate-from-step2',
);
const btnSeeResult = getElement<HTMLButtonElement>('btn-see-result');

const resultAro = getElement('result-aro');
const resultDiameter = getElement('result-diameter');
const btnWhatsapp = getElement<HTMLAnchorElement>('btn-whatsapp');
const btnRemeasure = getElement<HTMLButtonElement>('btn-remeasure');

const state: AppState = {
  pxPorMM: loadPxPorMM(),
  lastAro: 16,
  lastDiameterMM: aroToDiameterMM(16),
};

function savePxPorMM(value: number): void {
  state.pxPorMM = value;

  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // The app still works for the current session when storage is unavailable.
  }
}

function showPanel(name: PanelName): void {
  (Object.keys(panels) as PanelName[]).forEach((key) => {
    const panel = panels[key];

    if (key === name) {
      panel.hidden = false;
      panel.removeAttribute('aria-hidden');
      panel.classList.add('is-active');
    } else {
      panel.hidden = true;
      panel.classList.remove('is-active');
      panel.setAttribute('aria-hidden', 'true');
    }
  });

  const heading = panels[name].querySelector<HTMLElement>('h1, h2');

  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }

  window.scrollTo({ top: 0, behavior: 'auto' });
}

function refreshHeroActions(): void {
  const hasCalibration = state.pxPorMM !== null;
  heroActionsFresh.hidden = hasCalibration;
  heroActionsReturning.hidden = !hasCalibration;
}

function goToHero(): void {
  refreshHeroActions();
  showPanel('hero');
}

function goToStep1(): void {
  showPanel('step1');
  requestAnimationFrame(setupCardSlider);
}

function goToStep2(): void {
  if (state.pxPorMM === null) {
    goToStep1();
    return;
  }

  showPanel('step2');
  requestAnimationFrame(setupRingSlider);
}

function goToResult(): void {
  resultAro.textContent = String(state.lastAro);
  resultDiameter.textContent = formatMM(state.lastDiameterMM);
  updateWhatsappLink();
  showPanel('result');
}

function setupCardSlider(): void {
  const frameWidth = cardStageFrame.clientWidth - 40;
  const maxPx = Math.max(180, Math.min(600, frameWidth));
  const minPx = 120;

  cardSlider.min = String(minPx);
  cardSlider.max = String(maxPx);

  let current = Number.parseInt(cardSlider.value, 10);

  if (!current || current < minPx || current > maxPx) {
    current = clamp(320, minPx, maxPx);
  }

  cardSlider.value = String(current);
  renderCard(current);
}

function renderCard(widthPx: number): void {
  const heightPx = widthPx * CARD_ASPECT;
  cardObject.style.width = `${widthPx}px`;
  cardObject.style.height = `${heightPx}px`;
  cardPxReadout.textContent = `${Math.round(widthPx)} px`;
}

function stepCardSlider(delta: number): void {
  const min = Number.parseInt(cardSlider.min, 10);
  const max = Number.parseInt(cardSlider.max, 10);
  const next = clamp(Number.parseInt(cardSlider.value, 10) + delta, min, max);

  cardSlider.value = String(next);
  renderCard(next);
}

function confirmCalibration(): void {
  const cardWidthPx = Number.parseInt(cardSlider.value, 10);
  savePxPorMM(cardWidthPx / CARD_WIDTH_MM);
  goToStep2();
}

function setupRingSlider(): void {
  const pxPorMM = state.pxPorMM;

  if (pxPorMM === null) {
    return;
  }

  const minPx = aroToDiameterMM(ARO_MIN) * pxPorMM;
  const maxPx = aroToDiameterMM(ARO_MAX) * pxPorMM;

  ringStageFrame.style.minHeight = `${Math.ceil(maxPx + 56)}px`;
  ringSlider.min = String(Math.round(minPx));
  ringSlider.max = String(Math.round(maxPx));
  ringSlider.step = '1';

  let current = Number.parseInt(ringSlider.value, 10);
  const defaultPx = Math.round(aroToDiameterMM(16) * pxPorMM);

  if (!current || current < minPx || current > maxPx) {
    current = clamp(defaultPx, Math.round(minPx), Math.round(maxPx));
  }

  ringSlider.value = String(current);
  renderRing(current);
}

function renderRing(diameterPx: number): void {
  const pxPorMM = state.pxPorMM;

  if (pxPorMM === null) {
    return;
  }

  ringObject.style.width = `${diameterPx}px`;
  ringObject.style.height = `${diameterPx}px`;

  const diameterMM = diameterPx / pxPorMM;
  const aro = clamp(diameterMMToAro(diameterMM), ARO_MIN, ARO_MAX);

  state.lastDiameterMM = diameterMM;
  state.lastAro = aro;

  diameterReadout.textContent = formatMM(diameterMM);
  aroReadout.textContent = String(aro);
  ringLiveAro.textContent = String(aro);
}

function stepRingSlider(delta: number): void {
  const min = Number.parseInt(ringSlider.min, 10);
  const max = Number.parseInt(ringSlider.max, 10);
  const next = clamp(Number.parseInt(ringSlider.value, 10) + delta, min, max);

  ringSlider.value = String(next);
  renderRing(next);
}

function updateWhatsappLink(): void {
  const whatsappUrl = '#';
  btnWhatsapp.href = whatsappUrl;
}

cardSlider.addEventListener('input', () => {
  renderCard(Number.parseInt(cardSlider.value, 10));
});
cardDec.addEventListener('click', () => stepCardSlider(-1));
cardInc.addEventListener('click', () => stepCardSlider(1));

ringSlider.addEventListener('input', () => {
  renderRing(Number.parseInt(ringSlider.value, 10));
});
ringDec.addEventListener('click', () => stepRingSlider(-1));
ringInc.addEventListener('click', () => stepRingSlider(1));

btnStart.addEventListener('click', goToStep1);
btnContinue.addEventListener('click', goToStep2);
btnRecalibrateFromHero.addEventListener('click', goToStep1);

btnBackToHero.addEventListener('click', goToHero);
btnCalibrateDone.addEventListener('click', confirmCalibration);

btnRecalibrateFromStep2.addEventListener('click', goToStep1);
btnSeeResult.addEventListener('click', goToResult);

btnRemeasure.addEventListener('click', goToStep2);

let resizeTimer: number | undefined;

window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    if (panels.step1.classList.contains('is-active')) setupCardSlider();
    if (panels.step2.classList.contains('is-active')) setupRingSlider();
  }, 120);
});

refreshHeroActions();
showPanel('hero');

export {};
