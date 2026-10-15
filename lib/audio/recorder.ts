import { CONFIG } from "../config";
import { pcm16ToBase64 } from "./pcm-converter";

export interface AudioRecorderCallbacks {
  onChunk: (base64Pcm: string, rms?: number) => void;
  onVolume: (level: number) => void;
  onError: (error: Error) => void;
  onSpeech?: (text: string) => void;
}

interface BrowserSpeechRecognitionEvent {
  resultIndex: number;
  results: Array<Array<{ transcript: string }> & { isFinal?: boolean }>;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
}

export class AudioRecorder {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private recognition: BrowserSpeechRecognition | null = null;
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
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

      // 7. Optional client-side speech recognition for instant real-time transcription
      if (typeof window !== "undefined") {
        const SpeechRec =
          (window as unknown as { SpeechRecognition?: new () => BrowserSpeechRecognition })
            .SpeechRecognition ||
          (window as unknown as { webkitSpeechRecognition?: new () => BrowserSpeechRecognition })
            .webkitSpeechRecognition;

        if (SpeechRec) {
          try {
            this.recognition = new SpeechRec();
            this.recognition.continuous = true;
            this.recognition.interimResults = false;
            this.recognition.lang = "en-IN";
            this.recognition.onresult = (e: BrowserSpeechRecognitionEvent) => {
              for (let i = e.resultIndex; i < e.results.length; ++i) {
                const phrase = e.results[i][0]?.transcript?.trim();
                if (phrase && this.callbacks.onSpeech) {
                  this.callbacks.onSpeech(phrase);
                }
              }
            };
            this.recognition.onerror = () => {
              // Non-fatal, live speech recognition error
            };
            this.recognition.start();
          } catch (e) {
            console.warn("[AudioRecorder] SpeechRecognition start note:", e);
          }
        }
      }

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

    if (this.recognition) {
      try {
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.stop();
      } catch (e) {
        console.warn("Error stopping SpeechRecognition:", e);
      }
      this.recognition = null;
    }

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
