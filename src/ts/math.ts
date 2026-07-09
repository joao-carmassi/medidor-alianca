export function aroToDiameterMM(aro: number): number {
  return (aro + 40) / Math.PI;
}

export function diameterMMToAro(diameterMM: number): number {
  return Math.round(Math.PI * diameterMM - 40);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function formatMM(value: number): string {
  return (
    value.toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + ' mm'
  );
}
