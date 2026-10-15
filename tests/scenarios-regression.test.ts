import { describe, it, expect } from "vitest";
import { getOrderDetails } from "@/lib/orders/service";
import { normalizeOrderId } from "@/lib/orders/normalizer";

describe("Evaluation Regression Suite - 11 Core Customer Scenarios", () => {
  // Scenario 1: ORD-101 Status Lookup
  it("Scenario 1: ORD-101 tracking & status lookup", () => {
    const res = getOrderDetails("ORD-101");
    expect(res.found).toBe(true);
    if (!res.found) return;

    expect(res.order.status).toBe("Out for Delivery");
    expect(res.order.carrier).toBe("BlueDart");
    expect(res.order.tracking_number).toBe("BD-982103");
    expect(res.order.delivery_info).toContain("6 PM today");
    expect(res.policy.can_cancel).toBe(false);
  });

  // Scenario 2: ORD-102 Return Request (Outside 7-day window)
  it("Scenario 2: ORD-102 return request (delivered 14 days ago -> return window closed)", () => {
    const res = getOrderDetails("ORD-102");
    expect(res.found).toBe(true);
    if (!res.found) return;

    expect(res.order.status).toBe("Delivered");
    expect(res.policy.delivered_days_ago).toBe(14);
    expect(res.policy.return_window_open).toBe(false);
    expect(res.policy.return_eligibility_note).toContain("CLOSED");
  });

  // Scenario 3: ORD-103 Cancellation (Processing order -> eligible)
  it("Scenario 3: ORD-103 cancellation request (status is Processing -> eligible)", () => {
    const res = getOrderDetails("ORD-103");
    expect(res.found).toBe(true);
    if (!res.found) return;

    expect(res.order.status).toBe("Processing");
    expect(res.policy.can_cancel).toBe(true);
    expect(res.policy.cancel_note).toContain("Eligible for cancellation");
  });

  // Scenario 4: ORD-101 Cancellation (Out for Delivery -> doorstep refusal)
  it("Scenario 4: ORD-101 cancellation attempt (Out for Delivery -> cannot cancel, doorstep refusal)", () => {
    const res = getOrderDetails("ORD-101");
    expect(res.found).toBe(true);
    if (!res.found) return;

    expect(res.policy.can_cancel).toBe(false);
    expect(res.policy.cancel_note).toContain("refuse delivery at the doorstep");
  });

  // Scenario 5: Fake Order ID (ORD-999 -> Not Found)
  it("Scenario 5: Unknown order ID ORD-999 -> ORDER_NOT_FOUND error", () => {
    const res = getOrderDetails("ORD-999");
    expect(res.found).toBe(false);
    if (res.found) return;

    expect(res.error).toBe("ORDER_NOT_FOUND");
    expect(res.message).toContain("No order found matching ORD-999");
  });

  // Scenario 6: Missing Order ID -> Prompt for ID
  it("Scenario 6: Missing order ID -> MISSING_ORDER_ID error", () => {
    const res = getOrderDetails("");
    expect(res.found).toBe(false);
    if (res.found) return;

    expect(res.error).toBe("MISSING_ORDER_ID");
  });

  // Scenario 7: Malformed / No Numbers
  it("Scenario 7: Malformed order input -> INVALID_FORMAT error", () => {
    const res = getOrderDetails("some random words");
    expect(res.found).toBe(false);
    if (res.found) return;

    expect(res.error).toBe("INVALID_FORMAT");
  });

  // Scenario 8: Spoken Digits Normalization ("o r d one zero one" -> ORD-101)
  it("Scenario 8: Spoken order ID normalization", () => {
    const norm = normalizeOrderId("o r d one zero one");
    expect(norm.success).toBe(true);
    if (!norm.success) return;
    expect(norm.canonicalId).toBe("ORD-101");

    const lookup = getOrderDetails(norm.canonicalId);
    expect(lookup.found).toBe(true);
  });

  // Scenario 9: Exact ₹499 Boundary Condition (Shipping fee applies)
  it("Scenario 9: Exact ₹499 order boundary condition -> shipping fee applied", () => {
    const res = getOrderDetails("ORD-102"); // ORD-102 total is exactly ₹499
    expect(res.found).toBe(true);
    if (!res.found) return;

    expect(res.order.total_amount).toBe(499);
    expect(res.policy.shipping_fee_applied).toBe(true);
    expect(res.policy.shipping_fee_amount).toBe(50);
  });

  // Scenario 10: High value COD boundary
  it("Scenario 10: COD order limits (ORD-101 is ₹699, COD eligible)", () => {
    const res = getOrderDetails("ORD-101");
    expect(res.found).toBe(true);
    if (!res.found) return;

    expect(res.policy.cod_eligible).toBe(true);
  });

  // Scenario 11: Damage report window for delivered orders
  it("Scenario 11: Damage reporting window for ORD-102 (delivered 14 days ago)", () => {
    const res = getOrderDetails("ORD-102");
    expect(res.found).toBe(true);
    if (!res.found) return;

    expect(res.policy.damage_report_window_open).toBe(false); // 14 days > 48 hours
  });
});
