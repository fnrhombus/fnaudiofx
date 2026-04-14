import { describe, expect, it } from "vitest";
import {
  reverbProcessorCode,
  delayProcessorCode,
  distortionProcessorCode,
  bitcrusherProcessorCode,
} from "fnaudiofx";

/**
 * Verify that processor code strings are parseable JavaScript.
 * We can't run them (they depend on AudioWorkletProcessor + registerProcessor)
 * but we can check for syntax errors.
 */
describe("processor code strings are parseable JavaScript", () => {
  const processors = [
    ["reverb", reverbProcessorCode],
    ["delay", delayProcessorCode],
    ["distortion", distortionProcessorCode],
    ["bitcrusher", bitcrusherProcessorCode],
  ] as const;

  for (const [name, code] of processors) {
    it(`${name} processor code has no syntax errors`, () => {
      expect(() => new Function(code)).not.toThrow();
    });
  }
});
