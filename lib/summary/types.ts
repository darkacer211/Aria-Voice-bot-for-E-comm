export type CustomerIntent =
  | "ORDER_TRACKING"
  | "CANCELLATION_REQUEST"
  | "RETURN_REFUND_REQUEST"
  | "SHIPPING_QUERY"
  | "COD_QUERY"
  | "POLICY_QUERY"
  | "PRODUCT_QUERY"
  | "OUT_OF_SCOPE"
  | "OTHER";

export type ResolutionStatus =
  | "RESOLVED"
  | "PARTIALLY_RESOLVED"
  | "UNRESOLVED"
  | "OUT_OF_POLICY"
  | "OUT_OF_SCOPE"
  | "NEEDS_FOLLOW_UP";

export type CustomerSentiment = "positive" | "neutral" | "negative";

export interface PostCallSummary {
  customer_intent: CustomerIntent;
  order_id: string | null;
  resolution_status: ResolutionStatus;
  call_summary: string;
  policy_applied: string | null;
  tools_used: string[];
  customer_sentiment: CustomerSentiment;
  follow_up_needed: boolean;
}

export interface SummaryRequestBody {
  transcript: Array<{ role: "user" | "model"; text: string; timestamp?: string }>;
  toolCalls?: Array<{ toolName: string; args: Record<string, unknown>; result: any }>;
}
