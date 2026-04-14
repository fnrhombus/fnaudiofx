import { describe, expect, it } from "vitest";
import { bitcrush } from "fnaudiofx";

describe("bitcrusher", () => {
  it("16-bit is approximately original", () => {
    const samples = [0.0, 0.1, -0.5, 0.999, -0.999];
    for (const s of samples) {
      expect(bitcrush(s, 16)).toBeCloseTo(s, 3);
    }
  });

  it("1-bit produces only -1 and 1 (and 0)", () => {
    const results = new Set<number>();
    for (let s = -1; s <= 1; s += 0.1) {
      results.add(bitcrush(s, 1));
    }
    // With 1 bit: levels=2, half=1. round(s*1)/1 gives {-1, 0, 1}
    for (const r of results) {
      expect([-1, 0, 1]).toContain(r);
    }
  });

  it("reduces precision at lower bit depths", () => {
    const signal = 0.3;
    const high = bitcrush(signal, 16);
    const low = bitcrush(signal, 4);
    // Low bit depth should quantize more aggressively
    expect(Math.abs(high - signal)).toBeLessThanOrEqual(
      Math.abs(low - signal) + 1e-10,
    );
  });
});
