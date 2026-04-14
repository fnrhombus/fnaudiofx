import { describe, expect, it } from "vitest";
import { distort } from "fnaudiofx";

describe("distortion (tanh waveshaping)", () => {
  it("tanh(0) = 0", () => {
    expect(distort(0, 10)).toBe(0);
    expect(distort(0, 100)).toBe(0);
  });

  it("clips large values toward +/-1", () => {
    expect(distort(1, 100)).toBeCloseTo(1, 5);
    expect(distort(-1, 100)).toBeCloseTo(-1, 5);
  });

  it("gain=1 is approximately passthrough for small signals", () => {
    const small = 0.01;
    expect(distort(small, 1)).toBeCloseTo(small, 3);
    expect(distort(-small, 1)).toBeCloseTo(-small, 3);
  });

  it("is an odd function (symmetric around zero)", () => {
    expect(distort(0.5, 10)).toBeCloseTo(-distort(-0.5, 10));
  });
});
