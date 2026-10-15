import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";
import { CONFIG } from "@/lib/config";

// Simple in-memory sliding rate limiter per IP
const requestHistory = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = requestHistory.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  requestHistory.set(ip, recent);
  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "localhost";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many token requests. Please wait a moment before starting a new call." },
        { status: 429 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "MISSING_GEMINI_API_KEY",
          message: "GEMINI_API_KEY environment variable is missing on the server. Please add it to .env.local.",
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const expireTime = new Date(Date.now() + CONFIG.TOKEN.EXPIRATION_MINUTES * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(
      Date.now() + CONFIG.TOKEN.NEW_SESSION_EXPIRATION_MINUTES * 60 * 1000
    ).toISOString();

    // Create locked ephemeral token for Gemini Live WebSocket session
    const token = await ai.authTokens.create({
      config: {
        uses: CONFIG.TOKEN.MAX_USES,
        expireTime,
        newSessionExpireTime,
        liveConnectConstraints: {
          model: CONFIG.LIVE_MODEL,
        },
        httpOptions: { apiVersion: "v1alpha" },
      },
    });

    if (!token || !token.name) {
      throw new Error("Gemini API did not return a valid token name");
    }

    return NextResponse.json({
      token: token.name,
      model: CONFIG.LIVE_MODEL,
      voice: CONFIG.VOICE_NAME,
      expiresAt: expireTime,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to mint ephemeral token";
    console.error("[/api/token error]:", message);
    return NextResponse.json(
      {
        error: "TOKEN_CREATION_FAILED",
        message,
      },
      { status: 500 }
    );
  }
}
