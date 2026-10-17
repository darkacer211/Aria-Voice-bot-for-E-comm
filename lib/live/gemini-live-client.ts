import { GoogleGenAI, Modality } from "@google/genai";
import { CONFIG } from "../config";
import {
  SYSTEM_PROMPT,
  GET_ORDER_DETAILS_TOOL_DECLARATION,
  GET_PRODUCT_DETAILS_TOOL_DECLARATION,
  CANCEL_ORDER_TOOL_DECLARATION,
} from "../prompt";
import {
  GeminiLiveClientCallbacks,
  LiveSessionState,
  LiveToolCallRecord,
  TranscriptTurn,
} from "./types";

interface LiveClientSession {
  sendRealtimeInput: (params: { media: { mimeType: string; data: string } }) => void;
  sendClientContent: (params: { turns: Array<{ role: string; parts: Array<{ text: string }> }>; turnComplete: boolean }) => void;
  sendToolResponse: (params: { functionResponses: Array<{ id: string; name: string; response: Record<string, unknown> }> }) => void;
  close: () => void;
}

interface IncomingLiveFunctionCall {
  id?: string;
  name: string;
  args?: Record<string, unknown>;
}

interface IncomingLiveMessage {
  toolCall?: {
    functionCalls?: IncomingLiveFunctionCall[];
  };
  serverContent?: {
    interrupted?: boolean;
    inputTranscription?: { text?: string };
    interimInputTranscription?: { text?: string };
    outputTranscription?: { text?: string };
    modelTurn?: {
      parts?: Array<{
        text?: string;
        thought?: boolean;
        inlineData?: {
          mimeType?: string;
          data?: string;
        };
      }>;
    };
    turnComplete?: boolean;
  };
}

export class GeminiLiveClient {
  private session: LiveClientSession | null = null;
  private state: LiveSessionState = "idle";
  private callbacks: GeminiLiveClientCallbacks;
  private currentTurnId: string = "";
  private currentUserTurnId: string = "";
  private isModelSpeaking: boolean = false;
  private hasEmittedGreeting: boolean = false;

  constructor(callbacks: GeminiLiveClientCallbacks) {
    this.callbacks = callbacks;
  }

  public getState(): LiveSessionState {
    return this.state;
  }

  private setState(newState: LiveSessionState) {
    if (this.state !== newState) {
      this.state = newState;
      this.callbacks.onStateChange(newState);
    }
  }

  /**
   * Connect to Gemini Live API using an ephemeral token.
   */
  public async connect(
    ephemeralToken: string,
    silenceDurationMs: number = CONFIG.VAD.DEFAULT_SILENCE_DURATION_MS
  ): Promise<void> {
    try {
      this.setState("connecting");
      this.hasEmittedGreeting = false;

      // Initialize the GenAI client with ephemeral token and v1alpha API version
      const ai = new GoogleGenAI({
        apiKey: ephemeralToken,
        httpOptions: { apiVersion: "v1alpha" },
      });

      // Construct live connect configuration
      const config: Record<string, unknown> = {
        responseModalities: [Modality.AUDIO],
        generationConfig: {
          temperature: 0.1,
        },
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: CONFIG.VOICE_NAME,
            },
          },
        },
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        tools: [
          {
            functionDeclarations: [
              GET_ORDER_DETAILS_TOOL_DECLARATION,
              GET_PRODUCT_DETAILS_TOOL_DECLARATION,
              CANCEL_ORDER_TOOL_DECLARATION,
            ],
          },
        ],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        realtimeInputConfig: {
          automaticActivityDetection: {
            disabled: false,
            endOfSpeechSensitivity: CONFIG.VAD.END_OF_SPEECH_SENSITIVITY,
            silenceDurationMs: silenceDurationMs || CONFIG.VAD.DEFAULT_SILENCE_DURATION_MS,
            prefixPaddingMs: CONFIG.VAD.PREFIX_PADDING_MS,
          },
        },
      };

      const connectedSession = await ai.live.connect({
        model: CONFIG.LIVE_MODEL,
        config: config as unknown as Parameters<typeof ai.live.connect>[0]["config"],
        callbacks: {
          onopen: () => {
            console.log("[GeminiLiveClient] WebSocket opened");
          },
          onmessage: async (message: unknown) => {
            await this.handleIncomingMessage(message as IncomingLiveMessage);
          },
          onerror: (err: unknown) => {
            console.error("[GeminiLiveClient] Error:", err);
            this.setState("error");
            const message = err instanceof Error ? err.message : (err as { message?: string })?.message || "Live API error";
            this.callbacks.onError(new Error(message));
          },
          onclose: (event: unknown) => {
            const reason = (event as { reason?: string })?.reason;
            console.log("[GeminiLiveClient] Closed:", reason || event);
            this.setState("idle");
            this.callbacks.onClose(reason);
          },
        },
      });
      this.session = connectedSession as unknown as LiveClientSession;

      this.setState("listening");

      // Send initial trigger so Aria speaks the opening greeting proactively
      setTimeout(() => {
        try {
          if (this.session) {
            this.session.sendClientContent({
              turns: [
                {
                  role: "user",
                  parts: [{ text: "[Customer initiates call. Please greet warm and friendly once as Aria from AURA]" }],
                },
              ],
              turnComplete: true,
            });
            this.setState("thinking");
          }
        } catch (e) {
          console.warn("[GeminiLiveClient] Failed to send initial turn:", e);
        }
      }, 300);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Failed to connect to Live session");
      console.error("[GeminiLiveClient] Connection failed:", error);
      this.setState("error");
      this.callbacks.onError(error);
      throw error;
    }
  }

  /**
   * Handle incoming WebSocket message frames from Gemini.
   */
  private async handleIncomingMessage(message: IncomingLiveMessage) {
    try {
      // 1. Tool Call Execution
      if (message.toolCall?.functionCalls) {
        this.setState("thinking");
        const functionResponses: Array<{ id: string; name: string; response: Record<string, unknown> }> = [];

        for (const fc of message.toolCall.functionCalls) {
          const startTime = Date.now();
          console.log(`[GeminiLiveClient] Executing tool ${fc.name} with args:`, fc.args);

          let result: Record<string, unknown>;
          try {
            if (fc.name === "get_product_details") {
              const query = String(fc.args?.product_name || fc.args?.query || fc.args?.name || "");
              const resp = await fetch("/api/tools/get_product_details", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
              });
              result = await resp.json();
            } else if (fc.name === "cancel_order") {
              const orderId = String(fc.args?.order_id || fc.args?.orderId || fc.args?.id || "");
              const reason = String(fc.args?.reason || "Customer voice request");
              const resp = await fetch("/api/tools/cancel_order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, reason }),
              });
              result = await resp.json();
            } else {
              // Default to get_order_details
              const orderId = String(fc.args?.order_id || fc.args?.orderId || fc.args?.id || "");
              const resp = await fetch("/api/tools/get_order_details", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId }),
              });
              result = await resp.json();
            }
          } catch (e: unknown) {
            console.error(`[GeminiLiveClient] Tool execution network error for ${fc.name}:`, e);
            result = {
              found: false,
              error: "INTERNAL_ERROR",
              message: `Network error executing ${fc.name}`,
            };
          }

          const latencyMs = Date.now() - startTime;

          // Log tool call for UI inspection
          const toolRecord: LiveToolCallRecord = {
            id: fc.id || `call_${Date.now()}`,
            toolName: fc.name,
            args: fc.args || {},
            result,
            latencyMs,
            timestamp: new Date().toLocaleTimeString(),
          };
          this.callbacks.onToolCall(toolRecord);

          functionResponses.push({
            id: fc.id || `call_${Date.now()}`,
            name: fc.name,
            response: {
              ...result,
              result,
              output: result,
            },
          });
        }

        // Send tool results back into the live session
        if (this.session && functionResponses.length > 0) {
          try {
            console.log("[GeminiLiveClient] Sending sendToolResponse:", functionResponses.length, "response(s)");
            this.session.sendToolResponse({ functionResponses });
          } catch (toolSendErr) {
            console.error("[GeminiLiveClient] Error in sendToolResponse:", toolSendErr);
          }
        }
        return;
      }

      // 2. Server Content (Audio, Text Transcripts, Interruption)
      const content = message.serverContent;
      if (!content) return;

      // Handle Barge-in (Interruption)
      if (content.interrupted) {
        console.log("[GeminiLiveClient] Interrupted by user speech (barge-in)");
        this.isModelSpeaking = false;
        this.currentTurnId = "";
        this.currentUserTurnId = "";
        this.callbacks.onInterrupted();
        this.setState("listening");
        return;
      }

      // Handle User Input Transcription
      const userText = content.inputTranscription?.text || content.interimInputTranscription?.text;
      if (userText) {
        if (!this.currentUserTurnId) {
          this.currentUserTurnId = `user_${Date.now()}`;
        }
        const turn: TranscriptTurn = {
          id: this.currentUserTurnId,
          role: "user",
          text: userText,
          timestamp: new Date().toLocaleTimeString(),
        };
        this.callbacks.onTranscriptChunk(turn);
        this.setState("thinking");
      }

      // Handle Model Output Transcription
      if (content.outputTranscription?.text) {
        if (!this.currentTurnId) {
          this.currentTurnId = `model_${Date.now()}`;
        }
        const text = content.outputTranscription.text;
        const turn: TranscriptTurn = {
          id: this.currentTurnId,
          role: "model",
          text,
          timestamp: new Date().toLocaleTimeString(),
        };
        this.callbacks.onTranscriptChunk(turn);
      }

      // Handle Audio Chunks
      if (content.modelTurn?.parts) {
        for (const part of content.modelTurn.parts) {
          if (part.inlineData?.data) {
            this.isModelSpeaking = true;
            this.setState("speaking");
            this.callbacks.onAudioData(part.inlineData.data);
          }
          // Note: We do NOT emit part.text to customer transcript.
          // In Gemini 2.5 Live audio mode, part.text contains internal model thoughts/plans.
          // The authentic spoken output is streamed via outputTranscription above.
        }
      }

      // Handle Turn Completion
      if (content.turnComplete) {
        this.currentTurnId = "";
        this.currentUserTurnId = "";
        // If the model finished generating and playback has also ended, resume listening
        if (!this.isModelSpeaking && this.state !== "idle") {
          this.setState("listening");
        }
      }
    } catch (err) {
      console.error("[GeminiLiveClient] Error handling message:", err);
    }
  }

  /**
   * Called by the audio player when playback queue empties.
   */
  public onPlaybackComplete() {
    this.isModelSpeaking = false;
    if (this.state === "speaking") {
      this.setState("listening");
    }
  }

  private speechHangoverChunks: number = 0;
  private readonly MAX_HANGOVER_CHUNKS: number = 25; // ~500ms trailing silence buffer for server VAD
  private readonly SPEECH_THRESHOLD: number = 0.014;

  /**
   * Stream a raw 16kHz PCM16 audio chunk (base64 string).
   * Implements strict Acoustic Echo & Thinking Gating to prevent speaker output
   * or ambient room noise from interrupting Gemini during tool execution and model speech.
   */
  public sendAudioChunk(base64Pcm: string, rms: number = 0): void {
    if (!this.session || this.state === "idle" || this.state === "connecting") return;

    // 1. TOOL EXECUTION & THINKING GATING:
    // When Aria is thinking or querying backend tools, NEVER forward mic audio to Gemini.
    if (this.state === "thinking") {
      this.speechHangoverChunks = 0;
      return;
    }

    // 2. ACOUSTIC ECHO GATING & BARGE-IN:
    // When Aria is actively speaking, drop speaker audio bleed.
    if (this.isModelSpeaking) {
      const BARGE_IN_THRESHOLD = 0.22;
      if (rms < BARGE_IN_THRESHOLD) {
        this.speechHangoverChunks = 0;
        return; // Suppress speaker echo feedback
      }

      console.log("[GeminiLiveClient] Intentional user barge-in detected, RMS:", rms);
      this.isModelSpeaking = false;
      this.speechHangoverChunks = 0;
      this.callbacks.onInterrupted();
      this.setState("listening");
    }

    // 3. VOICE ACTIVITY DETECTION & TRAILING HANGOVER GATING:
    // Only stream mic chunks when speech is present or during the post-speech trailing buffer.
    // Suppresses room background noise, fan hiss, or empty packets from triggering server barge-in.
    if (rms >= this.SPEECH_THRESHOLD) {
      this.speechHangoverChunks = this.MAX_HANGOVER_CHUNKS;
    } else {
      if (this.speechHangoverChunks > 0) {
        this.speechHangoverChunks--;
      } else {
        // Complete silence or ambient room floor
        return;
      }
    }

    try {
      this.session.sendRealtimeInput({
        media: {
          data: base64Pcm,
          mimeType: "audio/pcm;rate=16000",
        },
      });
    } catch (err) {
      console.warn("[GeminiLiveClient] Failed to send audio chunk:", err);
    }
  }

  /**
   * Send a text message turn (used in Text Test Mode).
   */
  public sendTextMessage(text: string): void {
    if (!this.session) return;

    this.isModelSpeaking = false;
    this.speechHangoverChunks = 0;
    this.currentUserTurnId = `user_${Date.now()}`;
    this.currentTurnId = "";
    this.setState("thinking");

    // Add immediate user turn to transcript
    this.callbacks.onTranscriptChunk({
      id: this.currentUserTurnId,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString(),
    });

    try {
      this.session.sendClientContent({
        turns: [
          {
            role: "user",
            parts: [{ text }],
          },
        ],
        turnComplete: true,
      });
    } catch (err) {
      console.error("[GeminiLiveClient] Failed to send text message:", err);
    }
  }

  /**
   * Disconnect and clean up session.
   */
  public disconnect(): void {
    try {
      if (this.session) {
        this.session.close();
        this.session = null;
      }
    } catch (e) {
      console.warn("[GeminiLiveClient] Error during session close:", e);
    } finally {
      this.setState("idle");
      this.isModelSpeaking = false;
    }
  }
}
