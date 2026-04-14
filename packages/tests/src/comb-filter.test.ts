import { describe, expect, it } from "vitest";
import { CombFilter } from "fnaudiofx";

describe("CombFilter", () => {
  it("produces delayed output at correct offset", () => {
    const delay = 5;
    const comb = new CombFilter(delay, 0, 0); // no feedback, no damping
    const output: number[] = [];

    // Send an impulse
    output.push(comb.process(1.0));
    for (let i = 1; i < 10; i++) {
      output.push(comb.process(0));
    }

    // First `delay` samples should be 0 (the buffer was empty)
    for (let i = 0; i < delay; i++) {
      expect(output[i]).toBeCloseTo(0);
    }
    // At sample index `delay`, we should see the impulse come through
    expect(output[delay]).toBeCloseTo(1.0);
  });

  it("feedback produces decaying repeats", () => {
    const delay = 4;
    const feedback = 0.5;
    const comb = new CombFilter(delay, feedback, 0); // no damping
    const output: number[] = [];

    // Send impulse
    output.push(comb.process(1.0));
    for (let i = 1; i < 20; i++) {
      output.push(comb.process(0));
    }

    // We should see the impulse at index `delay`
    const firstEcho = output[delay];
    expect(firstEcho).toBeCloseTo(1.0);

    // Subsequent echoes should be present and decaying
    // With feedback the energy gets fed back through the comb
    const laterEnergy = output
      .slice(delay + 1)
      .reduce((sum, s) => sum + s * s, 0);
    expect(laterEnergy).toBeGreaterThan(0);

    // Energy should decay: later portion should have less energy than earlier
    const midpoint = delay + Math.floor((20 - delay) / 2);
    const earlyEnergy = output
      .slice(delay + 1, midpoint)
      .reduce((sum, s) => sum + s * s, 0);
    const lateEnergy = output
      .slice(midpoint)
      .reduce((sum, s) => sum + s * s, 0);
    expect(earlyEnergy).toBeGreaterThan(lateEnergy);
  });
});
