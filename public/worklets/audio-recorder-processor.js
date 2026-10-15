/**
 * AudioWorkletProcessor for recording and downsampling microphone audio to 16kHz PCM16.
 * Runs on the dedicated audio rendering thread for ultra-low latency and zero UI thread stutter.
 */

class AudioRecorderProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.targetSampleRate = options?.processorOptions?.targetSampleRate || 16000;
    // Buffer for 20ms at 16kHz (320 samples) for lower streaming packet latency
    this.bufferSize = Math.floor(this.targetSampleRate * 0.02);
    this.outputBuffer = new Float32Array(this.bufferSize);
    this.outputIndex = 0;

    // Resampling ratio
    this.sourceSampleRate = sampleRate; // global audio context sample rate
    this.resampleRatio = this.sourceSampleRate / this.targetSampleRate;
    this.resampleAccumulator = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0] || input[0].length === 0) {
      return true;
    }

    const channelData = input[0]; // mono channel

    // 1. Direct pass-through if browser natively created AudioContext at 16kHz
    if (Math.abs(this.resampleRatio - 1) < 0.005) {
      for (let i = 0; i < channelData.length; i++) {
        this.outputBuffer[this.outputIndex++] = channelData[i];
        if (this.outputIndex >= this.bufferSize) {
          this.flushBuffer();
        }
      }
      return true;
    }

    // 2. High-fidelity interpolation downsampler fallback
    for (let i = 0; i < channelData.length; i++) {
      this.resampleAccumulator += 1;
      if (this.resampleAccumulator >= this.resampleRatio) {
        this.resampleAccumulator -= this.resampleRatio;

        const prev = i > 0 ? channelData[i - 1] : channelData[i];
        const curr = channelData[i];
        const interpolated = prev + (curr - prev) * 0.5;

        this.outputBuffer[this.outputIndex++] = interpolated;

        if (this.outputIndex >= this.bufferSize) {
          this.flushBuffer();
        }
      }
    }

    return true;
  }

  flushBuffer() {
    // 1. Convert to 16-bit signed PCM
    const pcm16 = new Int16Array(this.outputIndex);
    let sumSquares = 0;

    for (let i = 0; i < this.outputIndex; i++) {
      const s = Math.max(-1, Math.min(1, this.outputBuffer[i]));
      sumSquares += s * s;
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    const rms = Math.sqrt(sumSquares / this.outputIndex);

    // 2. Post transferable buffer to main thread
    this.port.postMessage(
      {
        pcmBuffer: pcm16.buffer,
        rms: Math.min(1, rms * 4),
      },
      [pcm16.buffer]
    );

    this.outputIndex = 0;
  }
}

registerProcessor("audio-recorder-processor", AudioRecorderProcessor);
