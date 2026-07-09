export type PanelName = 'hero' | 'step1' | 'step2' | 'result';

export type AppState = {
  pxPorMM: number | null;
  lastAro: number;
  lastDiameterMM: number;
};

export type DomElements = {
  panels: Record<PanelName, HTMLElement>;
  heroActionsFresh: HTMLElement;
  heroActionsReturning: HTMLElement;
  btnStart: HTMLButtonElement;
  btnContinue: HTMLButtonElement;
  btnRecalibrateFromHero: HTMLButtonElement;
  cardStageFrame: HTMLElement;
  cardObject: HTMLElement;
  cardSlider: HTMLInputElement;
  cardDec: HTMLButtonElement;
  cardInc: HTMLButtonElement;
  cardPxReadout: HTMLElement;
  btnBackToHero: HTMLButtonElement;
  btnCalibrateDone: HTMLButtonElement;
  ringStageFrame: HTMLElement;
  ringObject: HTMLElement;
  ringLiveAro: HTMLElement;
  ringSlider: HTMLInputElement;
  ringDec: HTMLButtonElement;
  ringInc: HTMLButtonElement;
  diameterReadout: HTMLElement;
  aroReadout: HTMLElement;
  btnRecalibrateFromStep2: HTMLButtonElement;
  btnSeeResult: HTMLButtonElement;
  resultAro: HTMLElement;
  resultDiameter: HTMLElement;
  btnWhatsapp: HTMLAnchorElement;
  btnRemeasure: HTMLButtonElement;
};
