import { DelayLine } from "./delay-line.js";

/**
 * Schroeder allpass filter (reverb building block).
 *
 * y[n] = -g * x[n] + x[n-M] + g * y[n-M]
 *
 * Has unity gain at all frequencies. Diffuses the signal by altering phase.
 */
export class AllpassFilter {
  private delay: DelayLine;
  private readonly feedback = 0.5;

  constructor(public readonly delaySamples: number) {
    this.delay = new DelayLine(delaySamples + 1);
  }

  process(input: number): number {
    const delayed = this.delay.read(this.delaySamples);
    const output = -this.feedback * input + delayed;
    this.delay.write(input + this.feedback * delayed);
    return output;
  }

  reset(): void {
    this.delay.reset();
  }
}
