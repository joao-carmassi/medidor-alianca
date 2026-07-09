import type { DomElements } from './types';

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Element #${id} was not found.`);
  }

  return element as T;
}

export function getDomElements(): DomElements {
  return {
    panels: {
      hero: getElement('panel-hero'),
      step1: getElement('panel-step1'),
      step2: getElement('panel-step2'),
      result: getElement('panel-result'),
    },
    heroActionsFresh: getElement('hero-actions-fresh'),
    heroActionsReturning: getElement('hero-actions-returning'),
    btnStart: getElement<HTMLButtonElement>('btn-start'),
    btnContinue: getElement<HTMLButtonElement>('btn-continue'),
    btnRecalibrateFromHero: getElement<HTMLButtonElement>(
      'btn-recalibrate-from-hero',
    ),
    cardStageFrame: getElement('card-stage-frame'),
    cardObject: getElement('card-object'),
    cardSlider: getElement<HTMLInputElement>('card-slider'),
    cardDec: getElement<HTMLButtonElement>('card-dec'),
    cardInc: getElement<HTMLButtonElement>('card-inc'),
    cardPxReadout: getElement('card-px-readout'),
    btnBackToHero: getElement<HTMLButtonElement>('btn-back-to-hero'),
    btnCalibrateDone: getElement<HTMLButtonElement>('btn-calibrate-done'),
    ringStageFrame: getElement('ring-stage-frame'),
    ringObject: getElement('ring-object'),
    ringLiveAro: getElement('ring-live-aro'),
    ringSlider: getElement<HTMLInputElement>('ring-slider'),
    ringDec: getElement<HTMLButtonElement>('ring-dec'),
    ringInc: getElement<HTMLButtonElement>('ring-inc'),
    diameterReadout: getElement('diameter-readout'),
    aroReadout: getElement('aro-readout'),
    btnRecalibrateFromStep2: getElement<HTMLButtonElement>(
      'btn-recalibrate-from-step2',
    ),
    btnSeeResult: getElement<HTMLButtonElement>('btn-see-result'),
    resultAro: getElement('result-aro'),
    resultDiameter: getElement('result-diameter'),
    btnWhatsapp: getElement<HTMLAnchorElement>('btn-whatsapp'),
    btnRemeasure: getElement<HTMLButtonElement>('btn-remeasure'),
  };
}
