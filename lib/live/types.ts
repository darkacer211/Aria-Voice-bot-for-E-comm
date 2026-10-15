import { OrderLookupResult } from "../orders/types";

export type LiveSessionState =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "error"
  | "reconnecting";

export interface TranscriptTurn {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  isPartial?: boolean;
}

export interface LiveToolCallRecord {
  id: string;
  toolName: string;
  args: Record<string, unknown>;
  result: OrderLookupResult;
  latencyMs: number;
  timestamp: string;
}

export interface GeminiLiveClientCallbacks {
  onStateChange: (state: LiveSessionState) => void;
  onAudioData: (base64Pcm24k: string) => void;
  onTranscriptChunk: (turn: TranscriptTurn) => void;
  onToolCall: (record: LiveToolCallRecord) => void;
  onInterrupted: () => void;
  onError: (error: Error) => void;
  onClose: (reason?: string) => void;
}
