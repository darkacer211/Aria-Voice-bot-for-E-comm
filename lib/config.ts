/**
 * Central configuration file for Aria Voice CX Agent.
 * Defines confirmed Gemini Live API model strings, voice names, audio specs,
 * and business policy constants.
 */

export const CONFIG = {
  // Brand & Persona
  BRAND_NAME: "AURA",
  AGENT_NAME: "Aria",

  // Gemini Live Model Configuration
  // Latest recommended native audio speech-to-speech models
  LIVE_MODEL: process.env.NEXT_PUBLIC_GEMINI_LIVE_MODEL || "gemini-2.5-flash-native-audio-preview-12-2025",
  LIVE_MODEL_FALLBACK: "gemini-2.0-flash",

  // Model used strictly for post-call structured JSON summary
  SUMMARY_MODEL: "gemini-3.5-flash-lite",

  // Voice Configuration
  // 'Aoede' offers a breezy, warm, natural tone that suits a friendly Indian-English CX specialist
  VOICE_NAME: (process.env.NEXT_PUBLIC_GEMINI_VOICE as "Aoede" | "Kore" | "Puck") || "Aoede",

  // Audio Specifications (Strict Live API requirements)
  AUDIO: {
    INPUT_SAMPLE_RATE: 16000, // 16kHz PCM16 Mono
    INPUT_CHANNELS: 1,
    OUTPUT_SAMPLE_RATE: 24000, // 24kHz PCM16 Mono
    OUTPUT_CHANNELS: 1,
    BUFFER_SIZE_MS: 20, // 20ms streaming chunks (approx. 320 samples at 16kHz)
  },

  // Voice Activity Detection & Turn-Taking Latency Tuning
  // Default Gemini Live API silence wait is ~2000ms. Setting this to 500ms + HIGH sensitivity
  // eliminates the conversational lag so Aria responds immediately when the customer stops speaking.
  VAD: {
    DEFAULT_SILENCE_DURATION_MS: 700, // 700ms balanced: snappy turn-taking without mid-sentence false cutoffs
    END_OF_SPEECH_SENSITIVITY: "END_SENSITIVITY_HIGH" as const,
    PREFIX_PADDING_MS: 20,
  },

  // Ephemeral Token Constraints
  TOKEN: {
    EXPIRATION_MINUTES: 30,
    NEW_SESSION_EXPIRATION_MINUTES: 1,
    MAX_USES: 1,
  },

  // Aria Business Policies (Authoritative Source of Truth)
  POLICIES: {
    SHIPPING: {
      FREE_SHIPPING_MIN_VALUE: 499, // Strictly ABOVE 499 (i.e. >= 500) qualifies for free shipping
      STANDARD_FEE: 50, // Exactly ₹499 or below incurs ₹50 fee
      DELIVERY_DAYS_MIN: 3,
      DELIVERY_DAYS_MAX: 5,
    },
    RETURNS: {
      WINDOW_DAYS: 7, // 7 days from delivery date
      REQUIREMENTS: "unopened, unused, in original packaging",
      DAMAGE_REPORT_WINDOW_HOURS: 48, // Must report damage within 48 hours for replacement
    },
    CANCELLATIONS: {
      ALLOWED_STATUS: "Processing", // Only Processing orders can be cancelled
      NON_CANCELLABLE_NOTE: "Once Shipped or Out for Delivery, the order cannot be cancelled. The customer may refuse delivery at the doorstep.",
    },
    COD: {
      MAX_ORDER_VALUE: 2500, // Cash on Delivery available up to ₹2,500
      PAYMENT_METHODS: "Cash or UPI at doorstep",
    },
  },
} as const;

export type AppConfig = typeof CONFIG;
