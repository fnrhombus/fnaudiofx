import type { DelayParams } from "../types.js";

const PROCESSOR_NAME = "fnaudiofx-delay";

const processorCode = /* js */ `
class DelayProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: "time", defaultValue: 0.3, minValue: 0, maxValue: 2, automationRate: "k-rate" },
      { name: "feedback", defaultValue: 0.5, minValue: 0, maxValue: 0.95, automationRate: "k-rate" },
      { name: "wet", defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: "k-rate" },
    ];
  }

  constructor() {
    super();
    // Max 2 seconds at 48kHz
    this.maxDelay = 96000;
    this.buffers = [];
    this.writeIndex = 0;
  }

  ensureBuffers(channelCount) {
    while (this.buffers.length < channelCount) {
      this.buffers.push(new Float32Array(this.maxDelay));
    }
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || !input[0]) return true;

    this.ensureBuffers(output.length);

    const delaySamples = Math.round(parameters.time[0] * sampleRate);
    const feedback = parameters.feedback[0];
    const wet = parameters.wet[0];

    for (let ch = 0; ch < output.length; ch++) {
      const inCh = input[ch] || input[0];
      const outCh = output[ch];
      const buf = this.buffers[ch];

      for (let i = 0; i < outCh.length; i++) {
        const dry = inCh[i];
        let readIndex = this.writeIndex - delaySamples;
        if (readIndex < 0) readIndex += this.maxDelay;
        const delayed = buf[readIndex];
        buf[this.writeIndex] = dry + delayed * feedback;
        this.writeIndex = (this.writeIndex + 1) % this.maxDelay;
        outCh[i] = dry * (1 - wet) + delayed * wet;
      }
    }
    return true;
  }
}

registerProcessor("${PROCESSOR_NAME}", DelayProcessor);
`;

export async function createDelay(
  ctx: AudioContext,
  params: DelayParams = {},
): Promise<AudioWorkletNode> {
  const blob = new Blob([processorCode], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  await ctx.audioWorklet.addModule(url);
  URL.revokeObjectURL(url);

  const node = new AudioWorkletNode(ctx, PROCESSOR_NAME);

  if (params.time !== undefined)
    node.parameters.get("time")!.value = params.time;
  if (params.feedback !== undefined)
    node.parameters.get("feedback")!.value = params.feedback;
  if (params.wet !== undefined)
    node.parameters.get("wet")!.value = params.wet;

  return node;
}

/** The raw processor code string (for testing). */
export { processorCode as delayProcessorCode };
