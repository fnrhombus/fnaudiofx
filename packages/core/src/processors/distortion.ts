import type { DistortionParams } from "../types.js";

const PROCESSOR_NAME = "fnaudiofx-distortion";

const processorCode = /* js */ `
class DistortionProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: "gain", defaultValue: 10, minValue: 1, maxValue: 100, automationRate: "k-rate" },
      { name: "wet", defaultValue: 1, minValue: 0, maxValue: 1, automationRate: "k-rate" },
    ];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || !input[0]) return true;

    const gain = parameters.gain[0];
    const wet = parameters.wet[0];

    for (let ch = 0; ch < output.length; ch++) {
      const inCh = input[ch] || input[0];
      const outCh = output[ch];

      for (let i = 0; i < outCh.length; i++) {
        const dry = inCh[i];
        const distorted = Math.tanh(dry * gain);
        outCh[i] = dry * (1 - wet) + distorted * wet;
      }
    }
    return true;
  }
}

registerProcessor("${PROCESSOR_NAME}", DistortionProcessor);
`;

export async function createDistortion(
  ctx: AudioContext,
  params: DistortionParams = {},
): Promise<AudioWorkletNode> {
  const blob = new Blob([processorCode], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  await ctx.audioWorklet.addModule(url);
  URL.revokeObjectURL(url);

  const node = new AudioWorkletNode(ctx, PROCESSOR_NAME);

  if (params.gain !== undefined)
    node.parameters.get("gain")!.value = params.gain;
  if (params.wet !== undefined)
    node.parameters.get("wet")!.value = params.wet;

  return node;
}

/** The raw processor code string (for testing). */
export { processorCode as distortionProcessorCode };
