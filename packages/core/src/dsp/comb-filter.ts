import { DelayLine } from "./delay-line.js";

/**
 * Lowpass feedback comb filter (Schroeder reverb building block).
 *
 * y[n] = x[n - delay] + feedback * filterState
 * filterState = y[n] * (1 - damp) + prevFilterState * damp
 */
export class CombFilter {
  private delay: DelayLine;
  private filterState = 0;

  constructor(
    public readonly delaySamples: number,
    public feedback: number,
    public damping: number,
  ) {
    this.delay = new DelayLine(delaySamples + 1);
  }

  process(input: number): number {
    const delayed = this.delay.read(this.delaySamples);
    this.filterState =
      delayed * (1 - this.damping) + this.filterState * this.damping;
    const output = this.filterState * this.feedback;
    this.delay.write(input + output);
    return delayed;
  }

  reset(): void {
    this.delay.reset();
    this.filterState = 0;
  }
}
