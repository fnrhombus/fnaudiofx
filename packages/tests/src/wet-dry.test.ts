import { describe, expect, it } from "vitest";
import { wetDryMix } from "fnaudiofx";

describe("wet/dry mix", () => {
  it("wet=0 is passthrough (fully dry)", () => {
    expect(wetDryMix(0.7, 0.3, 0)).toBeCloseTo(0.7);
    expect(wetDryMix(-0.5, 1.0, 0)).toBeCloseTo(-0.5);
  });

  it("wet=1 is fully wet", () => {
    expect(wetDryMix(0.7, 0.3, 1)).toBeCloseTo(0.3);
    expect(wetDryMix(-0.5, 1.0, 1)).toBeCloseTo(1.0);
  });

  it("wet=0.5 is equal blend", () => {
    expect(wetDryMix(1.0, 0.0, 0.5)).toBeCloseTo(0.5);
    expect(wetDryMix(0.0, 1.0, 0.5)).toBeCloseTo(0.5);
  });
});
