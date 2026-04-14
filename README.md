# fnaudiofx

**Audio effects that run in your browser. No plugins. No WASM. Just AudioWorklets.**

```typescript
import { createReverb } from "fnaudiofx";

const ctx = new AudioContext();
const reverb = await createReverb(ctx, { roomSize: 0.8, damping: 0.5, wet: 0.3 });

source.connect(reverb).connect(ctx.destination);

// Real-time parameter control
reverb.parameters.get("roomSize")!.value = 0.6;
```

## The problem

The Web Audio API ships with a handful of built-in nodes -- gain, biquad filter, dynamics compressor -- but nothing for common effects like reverb or distortion. Building custom effects means writing AudioWorklet processors, managing Blob URLs, wiring up parameter descriptors, and dealing with the ceremony of `addModule()`. That's a lot of plumbing for a delay line.

fnaudiofx handles all of it. Each effect is a single async call that returns a standard `AudioWorkletNode` you can connect like any other node.

## Effects

| Effect | Factory | Parameters |
|---|---|---|
| **Reverb** | `createReverb(ctx, opts?)` | `roomSize` (0-1), `damping` (0-1), `wet` (0-1) |
| **Delay** | `createDelay(ctx, opts?)` | `time` (0-2s), `feedback` (0-0.95), `wet` (0-1) |
| **Distortion** | `createDistortion(ctx, opts?)` | `gain` (1-100), `wet` (0-1) |
| **Bitcrusher** | `createBitcrusher(ctx, opts?)` | `bits` (1-16), `wet` (0-1) |

All parameters are exposed as `AudioParam` objects on the returned node, so you can automate them with `linearRampToValueAtTime()` and friends.

## Install

```bash
npm install fnaudiofx
```

## Usage

```typescript
import { createReverb, createDelay, createDistortion, createBitcrusher } from "fnaudiofx";

const ctx = new AudioContext();

// Chain effects
const reverb = await createReverb(ctx, { roomSize: 0.7, wet: 0.3 });
const delay = await createDelay(ctx, { time: 0.4, feedback: 0.6, wet: 0.5 });

source.connect(reverb).connect(delay).connect(ctx.destination);
```

## How it works

Each factory function:

1. Inlines the AudioWorkletProcessor code as a JavaScript string
2. Creates a Blob URL and registers it with `audioWorklet.addModule()`
3. Returns a configured `AudioWorkletNode`

No external files to serve. No build step required for the processor code. Works with any bundler.

## Requirements

AudioWorklet requires a **secure context** (HTTPS or `localhost`). This is a browser platform requirement, not a limitation of this library.

## Support

If you find this useful:

- [GitHub Sponsors](https://github.com/sponsors/fnrhombus)
- [Buy Me a Coffee](https://buymeacoffee.com/fnrhombus)

## License

MIT
