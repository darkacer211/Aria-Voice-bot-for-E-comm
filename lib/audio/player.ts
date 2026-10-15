import { CONFIG } from "../config";
import { base64ToFloat32 } from "./pcm-converter";

export interface AudioPlayerCallbacks {
  onPlaybackStarted?: () => void;
  onPlaybackComplete?: () => void;
}

export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private nextStartTime: number = 0;
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private callbacks: AudioPlayerCallbacks;
  private isPrewarmed: boolean = false;
  private completeTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(callbacks: AudioPlayerCallbacks = {}) {
    this.callbacks = callbacks;
  }

  /**
   * Pre-warms the AudioContext during a user gesture (Start Call click)
   * to comply with browser autoplay security policies.
   */
  public async prewarm(): Promise<void> {
    if (!this.audioContext) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx({
        sampleRate: CONFIG.AUDIO.OUTPUT_SAMPLE_RATE, // 24,000 Hz
      });
    }

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
    this.isPrewarmed = true;
  }

  /**
   * Enqueues and plays a 24kHz PCM16 audio chunk with seamless, gapless scheduling.
   */
  public playChunk(base64Pcm: string): void {
    if (!base64Pcm) return;

    if (!this.audioContext) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx({
        sampleRate: CONFIG.AUDIO.OUTPUT_SAMPLE_RATE,
      });
    }

    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    try {
      // 1. Convert base64 to Float32 audio samples
      const float32Samples = base64ToFloat32(base64Pcm);
      if (float32Samples.length === 0) return;

      // 2. Create Web Audio AudioBuffer
      const audioBuffer = this.audioContext.createBuffer(
        CONFIG.AUDIO.OUTPUT_CHANNELS,
        float32Samples.length,
        CONFIG.AUDIO.OUTPUT_SAMPLE_RATE
      );
      audioBuffer.getChannelData(0).set(float32Samples);

      // 3. Create Source Node
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      // Clear any pending turn-completion debounce
      if (this.completeTimeout) {
        clearTimeout(this.completeTimeout);
        this.completeTimeout = null;
      }

      // 4. Gapless Time Scheduling
      const currentTime = this.audioContext.currentTime;
      // If nextStartTime is in the past, reset to currentTime to avoid lag
      const startTime = Math.max(currentTime, this.nextStartTime);
      source.start(startTime);
      this.nextStartTime = startTime + audioBuffer.duration;

      this.activeSources.add(source);
      this.callbacks.onPlaybackStarted?.();

      source.onended = () => {
        this.activeSources.delete(source);
        if (this.activeSources.size === 0) {
          if (this.completeTimeout) {
            clearTimeout(this.completeTimeout);
          }
          // Debounce 60ms to bridge tiny chunk arrivals without gap
          this.completeTimeout = setTimeout(() => {
            if (this.activeSources.size === 0) {
              this.callbacks.onPlaybackComplete?.();
            }
          }, 60);
        }
      };
    } catch (err) {
      console.error("[AudioPlayer] Error scheduling audio chunk:", err);
    }
  }

  /**
   * INSTANT BARGE-IN CANCELLATION.
   * Stops all currently playing and scheduled audio buffers immediately.
   */
  public stopAll(): void {
    if (this.completeTimeout) {
      clearTimeout(this.completeTimeout);
      this.completeTimeout = null;
    }
    for (const source of this.activeSources) {
      try {
        source.onended = null;
        source.stop(0);
        source.disconnect();
      } catch {
        // Source may already have completed
      }
    }
    this.activeSources.clear();

    if (this.audioContext) {
      this.nextStartTime = this.audioContext.currentTime;
    } else {
      this.nextStartTime = 0;
    }

    this.callbacks.onPlaybackComplete?.();
  }

  /**
   * Closes and cleans up the AudioContext on call end.
   */
  public close(): void {
    this.stopAll();
    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        this.audioContext.close();
      } catch (e) {
        console.warn("Error closing AudioContext:", e);
      }
      this.audioContext = null;
    }
    this.isPrewarmed = false;
  }

  public isPlaying(): boolean {
    return this.activeSources.size > 0;
  }
}
