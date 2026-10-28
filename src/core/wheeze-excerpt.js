/** Seleção acústica de 1,4 s para o modelo; não identifica fases clínicas. */
export function selectWheezeExcerpt(mono, sr, duration = 1.4) {
  if (!mono.length || !Number.isFinite(sr) || sr <= 0) throw new Error('Áudio de sibilos inválido');
  const length = Math.min(mono.length, Math.round(sr * duration));
  // Janela contínua de maior energia: evita escolher só o silêncio inicial.
  let energy = 0;
  for (let i = 0; i < length; i++) energy += mono[i] * mono[i];
  let bestEnergy = energy, start = 0;
  for (let i = length; i < mono.length; i++) {
    energy += mono[i] * mono[i] - mono[i - length] * mono[i - length];
    if (energy > bestEnergy) { bestEnergy = energy; start = i - length + 1; }
  }
  const data = mono.slice(start, start + length);
  const ramp = Math.min(Math.round(sr * .01), Math.floor(length / 2));
  for (let i = 0; i < ramp; i++) {
    data[i] *= i / ramp;
    data[length - 1 - i] *= i / ramp;
  }
  return { data, sr, start: start / sr, end: (start + length) / sr, originalDuration: mono.length / sr };
}