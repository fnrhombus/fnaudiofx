import type { ReverbParams } from "../types.js";

const PROCESSOR_NAME = "fnaudiofx-reverb";

const processorCode = /* js */ `
class DelayLine {
  constructor(maxLength) {
    this.buffer = new Float32Array(maxLength);
    this.writeIndex = 0;
    this.maxLength = maxLength;
  }
  write(sample) {
    this.buffer[this.writeIndex] = sample;
    this.writeIndex = (this.writeIndex + 1) % this.maxLength;
  }
  read(delaySamples) {
    let index = this.writeIndex - delaySamples;
    if (index < 0) index += this.maxLength;
    return this.buffer[index];
  }
}

class CombFilter {
  constructor(delaySamples, feedback, damping) {
    this.delaySamples = delaySamples;
    this.feedback = feedback;
    this.damping = damping;
    this.delay = new DelayLine(delaySamples + 1);
    this.filterState = 0;
  }
  process(input) {
    const delayed = this.delay.read(this.delaySamples);
    this.filterState = delayed * (1 - this.damping) + this.filterState * this.damping;
    const output = this.filterState * this.feedback;
    this.delay.write(input + output);
    return delayed;
  }
}

class AllpassFilter {
  constructor(delaySamples) {
    this.delaySamples = delaySamples;
    this.delay = new DelayLine(delaySamples + 1);
    this.feedback = 0.5;
  }
  process(input) {
    const delayed = this.delay.read(this.delaySamples);
    const output = -this.feedback * input + delayed;
    this.delay.write(input + this.feedback * delayed);
    return output;
  }
}

class ReverbProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: "roomSize", defaultValue: 0.8, minValue: 0, maxValue: 1, automationRate: "k-rate" },
      { name: "damping", defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: "k-rate" },
      { name: "wet", defaultValue: 0.3, minValue: 0, maxValue: 1, automationRate: "k-rate" },
    ];
  }

  constructor() {
    super();
    const combDelays = [1557, 1617, 1491, 1422];
    const allpassDelays = [225, 556];
    this.combs = combDelays.map(d => new CombFilter(d, 0.8, 0.5));
    this.allpasses = allpassDelays.map(d => new AllpassFilter(d));
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || !input[0]) return true;

    const roomSize = parameters.roomSize[0];
    const damping = parameters.damping[0];
    const wet = parameters.wet[0];

    for (const comb of this.combs) {
      comb.feedback = roomSize;
      comb.damping = damping;
    }

    for (let ch = 0; ch < output.length; ch++) {
      const inCh = input[ch] || input[0];
      const outCh = output[ch];

      for (let i = 0; i < outCh.length; i++) {
        const dry = inCh[i];
        let reverbSample = 0;
        for (const comb of this.combs) {
          reverbSample += comb.process(dry);
        }
        reverbSample /= this.combs.length;
        for (const ap of this.allpasses) {
          reverbSample = ap.process(reverbSample);
        }
        outCh[i] = dry * (1 - wet) + reverbSample * wet;
      }
    }
    return true;
  }
}

registerProcessor("${PROCESSOR_NAME}", ReverbProcessor);
`;

export async function createReverb(
  ctx: AudioContext,
  params: ReverbParams = {},
): Promise<AudioWorkletNode> {
  const blob = new Blob([processorCode], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  await ctx.audioWorklet.addModule(url);
  URL.revokeObjectURL(url);

  const node = new AudioWorkletNode(ctx, PROCESSOR_NAME);

  if (params.roomSize !== undefined)
    node.parameters.get("roomSize")!.value = params.roomSize;
  if (params.damping !== undefined)
    node.parameters.get("damping")!.value = params.damping;
  if (params.wet !== undefined)
    node.parameters.get("wet")!.value = params.wet;

  return node;
}

/** The raw processor code string (for testing). */
export { processorCode as reverbProcessorCode };
