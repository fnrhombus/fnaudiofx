import { describe, expect, it } from "vitest";
import { DelayLine } from "fnaudiofx";

describe("DelayLine", () => {
  it("reads at correct offset after write", () => {
    const dl = new DelayLine(10);
    dl.write(0.5);
    dl.write(0.7);
    dl.write(0.9);

    // Most recent write (offset 0 = current write position, offset 1 = last written)
    expect(dl.read(1)).toBeCloseTo(0.9);
    expect(dl.read(2)).toBeCloseTo(0.7);
    expect(dl.read(3)).toBeCloseTo(0.5);
  });

  it("wraps around circular buffer", () => {
    const dl = new DelayLine(4);
    for (let i = 0; i < 6; i++) {
      dl.write(i * 0.1);
    }
    // After 6 writes into buffer of size 4, oldest surviving values are at indices 2-5
    expect(dl.read(1)).toBeCloseTo(0.5);
    expect(dl.read(2)).toBeCloseTo(0.4);
  });

  it("initializes to zeros", () => {
    const dl = new DelayLine(8);
    expect(dl.read(4)).toBe(0);
  });
});
