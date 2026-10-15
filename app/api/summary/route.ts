import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { CONFIG } from "@/lib/config";
import { PostCallSummary, SummaryRequestBody } from "@/lib/summary/types";

// Schema for structured JSON summary
const summaryResponseSchema = {
  type: Type.OBJECT,
  properties: {
    customer_intent: {
      type: Type.STRING,
      enum: [
        "ORDER_TRACKING",
        "CANCELLATION_REQUEST",
        "RETURN_REFUND_REQUEST",
        "SHIPPING_QUERY",
        "COD_QUERY",
        "POLICY_QUERY",
        "PRODUCT_QUERY",
        "OUT_OF_SCOPE",
        "OTHER",
      ],
      description: "Primary intent of the customer during the call.",
    },
    order_id: {
      type: Type.STRING,
      nullable: true,
      description: "The validated canonical Order ID discussed (e.g. ORD-101), or null if none.",
    },
    resolution_status: {
      type: Type.STRING,
      enum: [
        "RESOLVED",
        "PARTIALLY_RESOLVED",
        "UNRESOLVED",
        "OUT_OF_POLICY",
        "OUT_OF_SCOPE",
        "NEEDS_FOLLOW_UP",
      ],
      description: "Outcome of the call based on policies and tool results.",
    },
    call_summary: {
      type: Type.STRING,
      description: "1 to 3 sentence concise summary of the conversation.",
    },
    policy_applied: {
      type: Type.STRING,
      nullable: true,
      description: "Short description of the brand policy referenced (e.g. 7-day return window, ₹499 shipping), or null.",
    },
    tools_used: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Array of tool names invoked during the session.",
    },
    customer_sentiment: {
      type: Type.STRING,
      enum: ["positive", "neutral", "negative"],
      description: "Overall sentiment of the customer.",
    },
    follow_up_needed: {
      type: Type.BOOLEAN,
      description: "True if human support or customer follow-up is required.",
    },
  },
  required: [
    "customer_intent",
    "order_id",
    "resolution_status",
    "call_summary",
    "policy_applied",
    "tools_used",
    "customer_sentiment",
    "follow_up_needed",
  ],
};

/**
 * Fallback summary generator if the LLM API fails or rate limits.
 */
function buildFallbackSummary(body: SummaryRequestBody): PostCallSummary {
  const toolsUsed = (body.toolCalls || []).map((t) => t.toolName);
  let orderId: string | null = null;
  let intent: PostCallSummary["customer_intent"] = "OTHER";
  let resolution: PostCallSummary["resolution_status"] = "RESOLVED";

  // Check tool calls
  const orderTool = (body.toolCalls || []).find((t) => t.toolName === "get_order_details");
  if (orderTool?.result?.canonical_id) {
    orderId = orderTool.result.canonical_id;
    intent = "ORDER_TRACKING";
  }

  const allText = (body.transcript || []).map((t) => t.text.toLowerCase()).join(" ");

  let followUpNeeded = false;

  if (allText.includes("cancel")) {
    intent = "CANCELLATION_REQUEST";
    resolution = orderTool?.result?.policy?.can_cancel ? "RESOLVED" : "OUT_OF_POLICY";
  } else if (allText.includes("return") || allText.includes("refund")) {
    intent = "RETURN_REFUND_REQUEST";
    resolution = orderTool?.result?.policy?.return_window_open ? "RESOLVED" : "OUT_OF_POLICY";
  } else if (allText.includes("shipping") || allText.includes("delivery fee")) {
    intent = "SHIPPING_QUERY";
  } else if (allText.includes("cod") || allText.includes("cash on delivery")) {
    intent = "COD_QUERY";
  } else if (allText.includes("flight") || allText.includes("weather")) {
    intent = "OUT_OF_SCOPE";
    resolution = "OUT_OF_SCOPE";
  } else if (allText.includes("human") || allText.includes("agent") || allText.includes("escalate")) {
    resolution = "NEEDS_FOLLOW_UP";
    followUpNeeded = true;
  }

  return {
    customer_intent: intent,
    order_id: orderId,
    resolution_status: resolution,
    call_summary:
      body.transcript.length > 0
        ? `Customer called regarding ${intent.toLowerCase().replace(/_/g, " ")}. Interaction concluded with status ${resolution}.`
        : "Call ended immediately with no interaction.",
    policy_applied: orderId ? "Aura Skincare order policy" : null,
    tools_used: toolsUsed,
    customer_sentiment: "neutral",
    follow_up_needed: followUpNeeded,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: SummaryRequestBody = await req.json();

    const userTurns = (body.transcript || []).filter((t) => t.role === "user");

    // Handle zero-turn immediate hangup
    if (userTurns.length === 0) {
      const emptySummary: PostCallSummary = {
        customer_intent: "OTHER",
        order_id: null,
        resolution_status: "UNRESOLVED",
        call_summary: "The call ended immediately after opening with no customer speech.",
        policy_applied: null,
        tools_used: [],
        customer_sentiment: "neutral",
        follow_up_needed: false,
      };
      return NextResponse.json({ summary: emptySummary, isFallback: false });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return structured fallback if no API key is configured
      return NextResponse.json({ summary: buildFallbackSummary(body), isFallback: true });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format conversation history for summary prompt
    const formattedTranscript = body.transcript
      .map((t) => `[${t.role.toUpperCase()}]: ${t.text}`)
      .join("\n");

    const formattedTools = (body.toolCalls || [])
      .map(
        (t) =>
          `Tool: ${t.toolName}\nArgs: ${JSON.stringify(t.args)}\nResult: ${JSON.stringify(
            t.result
          )}`
      )
      .join("\n\n");

    const prompt = `
You are the post-call quality assurance system for Aura Skincare customer calls handled by voice agent Aria.
Analyze the following completed customer call transcript and tool execution log.
Produce a strictly validated JSON summary according to the required schema.

CONVERSATION TRANSCRIPT:
${formattedTranscript}

TOOL CALL LOG:
${formattedTools || "No tools were invoked during this call."}

INSTRUCTIONS:
1. Identify the primary customer_intent.
2. Only set order_id if a valid order ID was identified or looked up (e.g., "ORD-101"). Otherwise set to null.
3. resolution_status must reflect the outcome:
   - RESOLVED: Question answered, policy explained, or eligible request confirmed.
   - OUT_OF_POLICY: Customer requested something outside policy (e.g. return after 14 days, cancel shipped order) and was politely denied.
   - OUT_OF_SCOPE: Inquiries unrelated to Aura Skincare (flights, general trivia).
   - NEEDS_FOLLOW_UP: Unresolved issue or technical failure.
4. Keep call_summary to 1-3 concise sentences.
5. Identify customer_sentiment (positive, neutral, negative).
`.trim();

    const response = await ai.models.generateContent({
      model: CONFIG.SUMMARY_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: summaryResponseSchema as any,
        temperature: 0.1,
      },
    });

    const text = response.text?.trim() || "";
    let summary: PostCallSummary;
    try {
      summary = JSON.parse(text);
    } catch {
      summary = buildFallbackSummary(body);
    }

    return NextResponse.json({ summary, isFallback: false });
  } catch (err: unknown) {
    console.error("[/api/summary error]:", err);
    // Even if Gemini API errors out, return clean fallback JSON
    const body: SummaryRequestBody = await req.json().catch(() => ({ transcript: [] }));
    return NextResponse.json({ summary: buildFallbackSummary(body), isFallback: true });
  }
}
