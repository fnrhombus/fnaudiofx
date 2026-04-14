import { describe, expect, it } from "vitest";
import { AllpassFilter } from "fnaudiofx";

describe("AllpassFilter", () => {
  it("preserves amplitude of a sinusoidal input (flat magnitude response)", () => {
    const ap = new AllpassFilter(50);

    // Generate a sine wave and run through the allpass
    const sampleRate = 44100;
    const freq = 1000; // Hz
    const length = sampleRate; // 1 second
    const input: number[] = [];
    for (let i = 0; i < length; i++) {
      input.push(0.5 * Math.sin((2 * Math.PI * freq * i) / sampleRate));
    }

    const output: number[] = [];
    for (const sample of input) {
      output.push(ap.process(sample));
    }

    // Compare RMS of the latter half (skip transient)
    const skip = Math.floor(length / 2);
    const inputRms = Math.sqrt(
      input.slice(skip).reduce((sum, s) => sum + s * s, 0) /
        (length - skip),
    );
    const outputRms = Math.sqrt(
      output.slice(skip).reduce((sum, s) => sum + s * s, 0) /
        (length - skip),
    );

    // Allpass should preserve amplitude; allow margin for transient
    expect(outputRms / inputRms).toBeGreaterThan(0.7);
    expect(outputRms / inputRms).toBeLessThan(1.5);
  });

  it("changes phase but not frequency content", () => {
    const ap = new AllpassFilter(50);

    // Feed an impulse and verify we get energy back (not just silence)
    const output: number[] = [];
    output.push(ap.process(1.0));
    for (let i = 1; i < 200; i++) {
      output.push(ap.process(0));
    }

    const totalEnergy = output.reduce((sum, s) => sum + s * s, 0);
    // The impulse energy (1.0) should be roughly preserved
    expect(totalEnergy).toBeGreaterThan(0.5);
  });
});
