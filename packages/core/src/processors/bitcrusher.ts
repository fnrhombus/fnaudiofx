import type { BitcrusherParams } from "../types.js";

const PROCESSOR_NAME = "fnaudiofx-bitcrusher";

const processorCode = /* js */ `
class BitcrusherProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: "bits", defaultValue: 8, minValue: 1, maxValue: 16, automationRate: "k-rate" },
      { name: "wet", defaultValue: 1, minValue: 0, maxValue: 1, automationRate: "k-rate" },
    ];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || !input[0]) return true;

    const bits = parameters.bits[0];
    const wet = parameters.wet[0];
    const levels = Math.pow(2, bits);
    const half = levels / 2;

    for (let ch = 0; ch < output.length; ch++) {
      const inCh = input[ch] || input[0];
      const outCh = output[ch];

      for (let i = 0; i < outCh.length; i++) {
        const dry = inCh[i];
        const crushed = Math.round(dry * half) / half;
        outCh[i] = dry * (1 - wet) + crushed * wet;
      }
    }
    return true;
  }
}

registerProcessor("${PROCESSOR_NAME}", BitcrusherProcessor);
`;

export async function createBitcrusher(
  ctx: AudioContext,
  params: BitcrusherParams = {},
): Promise<AudioWorkletNode> {
  const blob = new Blob([processorCode], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  await ctx.audioWorklet.addModule(url);
  URL.revokeObjectURL(url);

  const node = new AudioWorkletNode(ctx, PROCESSOR_NAME);

  if (params.bits !== undefined)
    node.parameters.get("bits")!.value = params.bits;
  if (params.wet !== undefined)
    node.parameters.get("wet")!.value = params.wet;

  return node;
}

/** The raw processor code string (for testing). */
export { processorCode as bitcrusherProcessorCode };
