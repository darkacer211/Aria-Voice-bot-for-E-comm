import { CONFIG } from "../config";
import { pcm16ToBase64 } from "./pcm-converter";

export interface AudioRecorderCallbacks {
  onChunk: (base64Pcm: string, rms?: number) => void;
  onVolume: (level: number) => void;
  onError: (error: Error) => void;
}

export class AudioRecorder {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private callbacks: AudioRecorderCallbacks;
  private isRecording: boolean = false;

  constructor(callbacks: AudioRecorderCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Request microphone access and begin streaming 16kHz PCM chunks.
   */
  public async start(): Promise<void> {
    if (this.isRecording) return;

    try {
      // 1. Request microphone with echo cancellation and noise suppression
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: CONFIG.AUDIO.INPUT_SAMPLE_RATE,
        },
      });

      // 2. Initialize AudioContext with 16kHz target sample rate
      // Modern browsers natively perform anti-aliased sinc downsampling in C++
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      try {
        this.audioContext = new AudioCtx({ sampleRate: CONFIG.AUDIO.INPUT_SAMPLE_RATE });
      } catch {
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      // 3. Load AudioWorklet downsampler processor
      await this.audioContext.audioWorklet.addModule("/worklets/audio-recorder-processor.js");

      // 4. Create Worklet Node
      this.workletNode = new AudioWorkletNode(this.audioContext, "audio-recorder-processor", {
        processorOptions: {
          targetSampleRate: CONFIG.AUDIO.INPUT_SAMPLE_RATE,
        },
      });

      // 5. Connect Microphone Source -> Worklet
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.sourceNode.connect(this.workletNode);
      // Connect to destination to keep pipeline active (zero volume / dummy)
      // Note: Do not connect worklet output to destination or user hears their own mic!

      // 6. Handle messages from worklet
      this.workletNode.port.onmessage = (event) => {
        if (!this.isRecording) return;

        const { pcmBuffer, rms } = event.data;
        if (pcmBuffer) {
          const int16Array = new Int16Array(pcmBuffer);
          const base64 = pcm16ToBase64(int16Array);
          this.callbacks.onChunk(base64, typeof rms === "number" ? rms : 0);
        }
        if (typeof rms === "number") {
          this.callbacks.onVolume(rms);
        }
      };

      this.isRecording = true;
    } catch (err: unknown) {
      this.stop();
      const error = err instanceof Error ? err : new Error("Failed to start audio recording");
      this.callbacks.onError(error);
      throw error;
    }
  }

  /**
   * Stop recording, disconnect audio graph, and release microphone hardware.
   */
  public stop(): void {
    this.isRecording = false;

    if (this.workletNode) {
      try {
        this.workletNode.port.onmessage = null;
        this.workletNode.disconnect();
      } catch (e) {
        console.warn("Error disconnecting workletNode:", e);
      }
      this.workletNode = null;
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch (e) {
        console.warn("Error disconnecting sourceNode:", e);
      }
      this.sourceNode = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        this.audioContext.close();
      } catch (e) {
        console.warn("Error closing audioContext:", e);
      }
      this.audioContext = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    this.callbacks.onVolume(0);
  }

  public isActive(): boolean {
    return this.isRecording;
  }
}
