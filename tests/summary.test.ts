import { describe, it, expect } from "vitest";
import { PostCallSummary } from "@/lib/summary/types";

describe("Post-Call Summary Schema & Logic", () => {
  it("validates that all required fields are present in a sample summary", () => {
    const sampleSummary: PostCallSummary = {
      customer_intent: "ORDER_TRACKING",
      order_id: "ORD-101",
      resolution_status: "RESOLVED",
      call_summary:
        "Customer inquired about the status of order ORD-101. Aria confirmed it is out for delivery with BlueDart and expected by 6 PM today.",
      policy_applied: null,
      tools_used: ["get_order_details"],
      customer_sentiment: "positive",
      follow_up_needed: false,
    };

    expect(sampleSummary.customer_intent).toBe("ORDER_TRACKING");
    expect(sampleSummary.order_id).toBe("ORD-101");
    expect(sampleSummary.resolution_status).toBe("RESOLVED");
    expect(sampleSummary.tools_used).toContain("get_order_details");
    expect(sampleSummary.follow_up_needed).toBe(false);
  });

  it("handles zero-turn summary correctly", () => {
    const emptySummary: PostCallSummary = {
      customer_intent: "OTHER",
      order_id: null,
      resolution_status: "UNRESOLVED",
      call_summary: "The call ended immediately with no customer interaction.",
      policy_applied: null,
      tools_used: [],
      customer_sentiment: "neutral",
      follow_up_needed: false,
    };

    expect(emptySummary.order_id).toBeNull();
    expect(emptySummary.resolution_status).toBe("UNRESOLVED");
    expect(emptySummary.tools_used).toHaveLength(0);
  });

  it("accurately classifies cancellation outcomes: OUT_OF_POLICY for denied orders and RESOLVED for cancellable orders", () => {
    const deniedSummary: PostCallSummary = {
      customer_intent: "CANCELLATION_REQUEST",
      order_id: "ORD-101",
      resolution_status: "OUT_OF_POLICY",
      call_summary:
        "Customer requested cancellation for order ORD-101. Cancellation was denied because the order is out for delivery. Doorstep refusal recommended.",
      policy_applied: "Cancellation Policy: Shipped or Out for Delivery orders cannot be cancelled online.",
      tools_used: ["cancel_order"],
      customer_sentiment: "neutral",
      follow_up_needed: false,
    };

    expect(deniedSummary.resolution_status).toBe("OUT_OF_POLICY");
    expect(deniedSummary.order_id).toBe("ORD-101");
    expect(deniedSummary.call_summary).toContain("denied");

    const approvedSummary: PostCallSummary = {
      customer_intent: "CANCELLATION_REQUEST",
      order_id: "ORD-103",
      resolution_status: "RESOLVED",
      call_summary: "Order ORD-103 was successfully cancelled in the database. Full refund initiated.",
      policy_applied: "Cancellation Policy: Processing orders eligible for full refund.",
      tools_used: ["cancel_order"],
      customer_sentiment: "positive",
      follow_up_needed: false,
    };

    expect(approvedSummary.resolution_status).toBe("RESOLVED");
    expect(approvedSummary.order_id).toBe("ORD-103");
  });
});

