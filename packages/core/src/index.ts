export { createReverb, reverbProcessorCode } from "./processors/reverb.js";
export { createDelay, delayProcessorCode } from "./processors/delay.js";
export {
  createDistortion,
  distortionProcessorCode,
} from "./processors/distortion.js";
export {
  createBitcrusher,
  bitcrusherProcessorCode,
} from "./processors/bitcrusher.js";

export type {
  ReverbParams,
  DelayParams,
  DistortionParams,
  BitcrusherParams,
} from "./types.js";

// DSP primitives (for advanced users / testing)
export {
  DelayLine,
  CombFilter,
  AllpassFilter,
  distort,
  bitcrush,
  wetDryMix,
} from "./dsp/index.js";
