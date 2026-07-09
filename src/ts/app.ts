import { ARO_MAX, ARO_MIN, CARD_ASPECT, CARD_WIDTH_MM } from './constants';
import { getDomElements } from './dom';
import { aroToDiameterMM, clamp, diameterMMToAro, formatMM } from './math';
import { loadPxPorMM, savePxPorMMValue } from './storage';
import { createWhatsappUrl } from './whatsapp';
import type { AppState, PanelName } from './types';

const {
  panels,
  heroActionsFresh,
  heroActionsReturning,
  btnStart,
  btnContinue,
  btnRecalibrateFromHero,
  cardStageFrame,
  cardObject,
  cardSlider,
  cardDec,
  cardInc,
  cardPxReadout,
  btnBackToHero,
  btnCalibrateDone,
  ringStageFrame,
  ringObject,
  ringLiveAro,
  ringSlider,
  ringDec,
  ringInc,
  diameterReadout,
  aroReadout,
  btnRecalibrateFromStep2,
  btnSeeResult,
  resultAro,
  resultDiameter,
  btnWhatsapp,
  btnRemeasure,
} = getDomElements();

const state: AppState = {
  pxPorMM: loadPxPorMM(),
  lastAro: 16,
  lastDiameterMM: aroToDiameterMM(16),
};

function savePxPorMM(value: number): void {
  state.pxPorMM = value;
  savePxPorMMValue(value);
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
  btnWhatsapp.href = createWhatsappUrl(
    `Olá, meu aro é ${state.lastAro} e o diâmetro interno medido foi ${formatMM(
      state.lastDiameterMM,
    )}.`,
  );
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
