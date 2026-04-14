/**
 * Circular buffer delay line.
 * write() pushes a sample, read(offset) retrieves a sample `offset` positions back.
 */
export class DelayLine {
  private buffer: Float32Array;
  private writeIndex = 0;

  constructor(public readonly maxLength: number) {
    this.buffer = new Float32Array(maxLength);
  }

  write(sample: number): void {
    this.buffer[this.writeIndex] = sample;
    this.writeIndex = (this.writeIndex + 1) % this.maxLength;
  }

  read(delaySamples: number): number {
    let index = this.writeIndex - delaySamples;
    if (index < 0) index += this.maxLength;
    return this.buffer[index];
  }

  reset(): void {
    this.buffer.fill(0);
    this.writeIndex = 0;
  }
}
