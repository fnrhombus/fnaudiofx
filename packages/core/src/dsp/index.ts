export { DelayLine } from "./delay-line.js";
export { CombFilter } from "./comb-filter.js";
export { AllpassFilter } from "./allpass-filter.js";

/** tanh waveshaping distortion. */
export function distort(sample: number, gain: number): number {
  return Math.tanh(sample * gain);
}

/** Quantize a [-1, 1] sample to the given bit depth. */
export function bitcrush(sample: number, bits: number): number {
  const levels = Math.pow(2, bits);
  const half = levels / 2;
  return Math.round(sample * half) / half;
}

/** Wet/dry mix: wet=0 is fully dry, wet=1 is fully wet. */
export function wetDryMix(
  dry: number,
  wet: number,
  amount: number,
): number {
  return dry * (1 - amount) + wet * amount;
}
