import { STORAGE_KEY } from './constants';

export function loadPxPorMM(): number | null {
  let raw: string | null = null;

  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }

  const value = raw === null ? Number.NaN : Number.parseFloat(raw);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function savePxPorMMValue(value: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // The app still works for the current session when storage is unavailable.
  }
}
