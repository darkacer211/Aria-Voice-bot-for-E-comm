import { describe, it, expect } from "vitest";
import { normalizeOrderId } from "@/lib/orders/normalizer";

describe("Order ID Normalizer", () => {
  it("normalizes canonical and standard string formats", () => {
    expect(normalizeOrderId("ORD-101")).toEqual({ success: true, canonicalId: "ORD-101" });
    expect(normalizeOrderId("ord-101")).toEqual({ success: true, canonicalId: "ORD-101" });
    expect(normalizeOrderId("ord101")).toEqual({ success: true, canonicalId: "ORD-101" });
    expect(normalizeOrderId("ORD 101")).toEqual({ success: true, canonicalId: "ORD-101" });
    expect(normalizeOrderId("101")).toEqual({ success: true, canonicalId: "ORD-101" });
    expect(normalizeOrderId("order 101")).toEqual({ success: true, canonicalId: "ORD-101" });
  });

  it("normalizes spaced phonetic speech inputs", () => {
    expect(normalizeOrderId("o r d one zero one")).toEqual({ success: true, canonicalId: "ORD-101" });
    expect(normalizeOrderId("O R D 1 0 2")).toEqual({ success: true, canonicalId: "ORD-102" });
    expect(normalizeOrderId("o r d dash one zero three")).toEqual({ success: true, canonicalId: "ORD-103" });
    expect(normalizeOrderId("order one zero one")).toEqual({ success: true, canonicalId: "ORD-101" });
  });

  it("handles word numbers like 'hundred'", () => {
    expect(normalizeOrderId("order one hundred and one")).toEqual({ success: true, canonicalId: "ORD-101" });
    expect(normalizeOrderId("o r d one zero two")).toEqual({ success: true, canonicalId: "ORD-102" });
  });

  it("handles missing or empty inputs gracefully", () => {
    expect(normalizeOrderId("")).toEqual({
      success: false,
      error: "MISSING_ORDER_ID",
      message: "No order ID was provided.",
    });
    expect(normalizeOrderId("   ")).toEqual({
      success: false,
      error: "MISSING_ORDER_ID",
      message: "No order ID was provided.",
    });
    expect(normalizeOrderId(null)).toEqual({
      success: false,
      error: "MISSING_ORDER_ID",
      message: "No order ID was provided.",
    });
  });

  it("handles malformed inputs with no recognizable numbers", () => {
    const res = normalizeOrderId("hello world");
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBe("INVALID_FORMAT");
    }
  });
});
