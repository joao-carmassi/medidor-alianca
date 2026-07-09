export const goldGradient =
  'bg-[linear-gradient(135deg,#f3dfa4_0%,#d4af37_38%,#c9a24b_65%,#b8860b_100%)]';

export const displayFont = "font-['Cormorant_Garamond']";
export const uiFont = "font-['Inter']";

export const panelClass = 'flex flex-col';
export const eyebrowClass = 'mb-3 text-xs font-semibold uppercase text-[#d4af37]';
export const sectionTitleClass = `${displayFont} mb-3 text-3xl font-medium leading-tight text-[#f3efe6] sm:text-4xl`;
export const instructionClass =
  'mb-6 max-w-[54ch] text-[15px] leading-relaxed text-[#d8d2c4]';

const buttonBase =
  'relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-transparent px-8 py-4 text-sm font-semibold uppercase text-inherit no-underline transition duration-200 active:translate-y-px active:scale-[.99]';

export const buttonClasses = {
  primary: `${buttonBase} ${goldGradient} !text-black shadow-[0_10px_28px_-10px_rgba(212,175,55,.55)] hover:shadow-[0_14px_34px_-10px_rgba(212,175,55,.7)]`,
  ghost: `${buttonBase} border-[#d4af37]/45 bg-transparent text-[#f3dfa4] hover:border-[#d4af37] hover:bg-[#d4af37]/10`,
  link: 'inline-flex cursor-pointer items-center justify-center rounded-none border-0 bg-transparent px-1 py-2 text-[13.5px] font-medium text-[#9c9587] transition hover:text-[#d4af37]',
} as const;

const stepNumBase = `${displayFont} inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/25 text-sm text-[#9c9587]`;

export const stepperClasses = {
  item: 'flex items-center gap-2 text-[#9c9587]',
  number: stepNumBase,
  currentNumber: `${stepNumBase} ${goldGradient} border-[#d4af37] text-[#0a0a09] shadow-[0_0_0_4px_rgba(212,175,55,.14)]`,
  doneNumber: `${stepNumBase} border-[#c9a24b] text-[#c9a24b]`,
  label: 'hidden text-[11px] uppercase text-inherit min-[480px]:inline',
  separator: 'h-px w-7 bg-[#d4af37]/25',
} as const;

export const stageClasses = {
  card: 'relative mb-5 flex min-h-48 items-center justify-center overflow-hidden rounded-[26px] border border-[#d4af37]/20 bg-[#141210] bg-[linear-gradient(180deg,rgba(255,255,255,.03),rgba(212,175,55,.04))] px-5 py-8',
  ring: 'relative mb-5 flex min-h-56 items-center justify-center overflow-visible px-5 py-8',
  guides: 'pointer-events-none absolute inset-5',
  guideHorizontal:
    'absolute left-0 right-0 top-0 h-px bg-[repeating-linear-gradient(to_right,rgba(212,175,55,.45)_0_4px,transparent_4px_9px)]',
  guideVertical:
    'absolute bottom-0 left-0 top-0 w-px bg-[repeating-linear-gradient(to_bottom,rgba(212,175,55,.45)_0_4px,transparent_4px_9px)]',
} as const;

export const formClasses = {
  label: 'text-xs font-semibold uppercase text-[#9c9587]',
  row: 'flex items-center gap-3.5',
  fineButton:
    'flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#d4af37]/45 bg-[#1b1815] text-lg leading-none text-[#f3dfa4] transition hover:border-[#d4af37] hover:bg-[#221d15] active:scale-95',
  slider:
    'h-6 w-full flex-1 cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:rotate-45 [&::-moz-range-thumb]:rounded-[3px] [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-white/20 [&::-moz-range-thumb]:bg-[linear-gradient(135deg,#f3dfa4_0%,#d4af37_38%,#c9a24b_65%,#b8860b_100%)] [&::-moz-range-thumb]:shadow-[0_4px_12px_-2px_rgba(212,175,55,.7)] [&::-moz-range-track]:h-0.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[linear-gradient(90deg,rgba(212,175,55,.45),rgba(212,175,55,.22))] [&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[linear-gradient(90deg,rgba(212,175,55,.45),rgba(212,175,55,.22))] [&::-webkit-slider-thumb]:mt-[-8px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:rotate-45 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-[3px] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/20 [&::-webkit-slider-thumb]:bg-[linear-gradient(135deg,#f3dfa4_0%,#d4af37_38%,#c9a24b_65%,#b8860b_100%)] [&::-webkit-slider-thumb]:shadow-[0_4px_12px_-2px_rgba(212,175,55,.7)] active:[&::-webkit-slider-thumb]:scale-110',
} as const;

export const readoutClasses = {
  base: 'flex flex-1 flex-col gap-1 rounded-[14px] border border-[#d4af37]/20 bg-[#141210] px-4 py-3.5',
  accent:
    'flex flex-1 flex-col gap-1 rounded-[14px] border border-[#d4af37]/45 bg-[linear-gradient(180deg,rgba(212,175,55,.08),transparent)] px-4 py-3.5',
  label: 'text-[11px] uppercase text-[#9c9587]',
  value: `${displayFont} text-2xl font-medium text-[#f3efe6] tabular-nums`,
} as const;
