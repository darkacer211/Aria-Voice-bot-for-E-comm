import { describe, it, expect, afterEach } from "vitest";
import { getOrderDetails, computePolicyFlags, cancelOrder } from "@/lib/orders/service";
import { resetMockDb } from "@/lib/orders/db";

describe("Order Lookup and Policy Calculation Service", () => {
  it("correctly looks up and computes policy for ORD-101 (Out for Delivery)", () => {
    const res = getOrderDetails("o r d one zero one");
    expect(res.found).toBe(true);
    if (!res.found) return;

    expect(res.canonical_id).toBe("ORD-101");
    expect(res.order.customer_name).toBe("Priya Sharma");
    expect(res.order.status).toBe("Out for Delivery");
    expect(res.order.carrier).toBe("BlueDart");
    expect(res.order.tracking_number).toBe("BD-982103");

    // Policy flags
    expect(res.policy.can_cancel).toBe(false);
    expect(res.policy.cancel_note).toContain("refuse delivery at the doorstep");
    expect(res.policy.return_window_open).toBe(false); // not delivered yet
    expect(res.policy.shipping_fee_applied).toBe(false); // ₹699 > ₹499
    expect(res.policy.cod_eligible).toBe(true); // ₹699 <= ₹2500
    expect(res.policy.customer_display_name).toBe("Priya");
  });

  it("correctly looks up and computes policy for ORD-102 (Delivered 14 days ago, ₹499 boundary)", () => {
    const res = getOrderDetails("ORD-102");
    expect(res.found).toBe(true);
    if (!res.found) return;

    expect(res.canonical_id).toBe("ORD-102");
    expect(res.order.customer_name).toBe("Rahul Verma");
    expect(res.order.status).toBe("Delivered");

    // Policy flags
    expect(res.policy.can_cancel).toBe(false); // delivered already
    expect(res.policy.delivered_days_ago).toBe(14);
    expect(res.policy.return_window_open).toBe(false); // 14 > 7 days
    expect(res.policy.return_eligibility_note).toContain("CLOSED");
    expect(res.policy.damage_report_window_open).toBe(false); // 14 > 2 days

    // Boundary: exactly ₹499 is NOT "above 499", so shipping fee applies!
    expect(res.policy.shipping_fee_applied).toBe(true);
    expect(res.policy.shipping_fee_amount).toBe(50);
    expect(res.policy.customer_display_name).toBe("Rahul");
  });

  it("correctly looks up and computes policy for ORD-103 (Processing, cancel eligible)", () => {
    const res = getOrderDetails("103");
    expect(res.found).toBe(true);
    if (!res.found) return;

    expect(res.canonical_id).toBe("ORD-103");
    expect(res.order.customer_name).toBe("Ananya Patel");
    expect(res.order.status).toBe("Processing");

    // Policy flags
    expect(res.policy.can_cancel).toBe(true); // processing order is cancellable
    expect(res.policy.cancel_note).toContain("Eligible for cancellation");
    expect(res.policy.return_window_open).toBe(false); // not delivered
    expect(res.policy.shipping_fee_applied).toBe(false); // ₹850 > ₹499
    expect(res.policy.customer_display_name).toBe("Ananya");
  });

  it("handles non-existent order gracefully", () => {
    const res = getOrderDetails("ORD-999");
    expect(res.found).toBe(false);
    if (res.found) return;

    expect(res.error).toBe("ORDER_NOT_FOUND");
    expect(res.message).toContain("No order found matching ORD-999");
  });

  it("handles boundary conditions for shipping and COD correctly", () => {
    // ₹499 -> shipping fee applies
    const policy499 = computePolicyFlags(499, "Processing");
    expect(policy499.shipping_fee_applied).toBe(true);
    expect(policy499.shipping_fee_amount).toBe(50);

    // ₹500 -> free shipping
    const policy500 = computePolicyFlags(500, "Processing");
    expect(policy500.shipping_fee_applied).toBe(false);
    expect(policy500.shipping_fee_amount).toBe(0);

    // ₹2,500 -> COD eligible
    const policy2500 = computePolicyFlags(2500, "Processing");
    expect(policy2500.cod_eligible).toBe(true);

    // ₹2,501 -> COD not eligible
    const policy2501 = computePolicyFlags(2501, "Processing");
    expect(policy2501.cod_eligible).toBe(false);
  });

  describe("cancelOrder tool service", () => {
    afterEach(() => {
      resetMockDb();
    });

    it("successfully cancels ORD-103 (Processing status) and updates database", () => {
      const res = cancelOrder("ORD-103", "Customer voice cancellation");
      expect(res.success).toBe(true);
      expect(res.new_status).toBe("Cancelled");

      // Verify database updated
      const lookup = getOrderDetails("ORD-103");
      expect(lookup.found).toBe(true);
      if (!lookup.found) return;
      expect(lookup.order.status).toBe("Cancelled");
    });

    it("authoritatively rejects cancellation for ORD-101 (Out for Delivery)", () => {
      const res = cancelOrder("ORD-101");
      expect(res.success).toBe(false);
      expect(res.message).toContain("cannot be cancelled");
      expect(res.message).toContain("Out for Delivery");

      // Verify database unchanged
      const lookup = getOrderDetails("ORD-101");
      expect(lookup.found).toBe(true);
      if (!lookup.found) return;
      expect(lookup.order.status).toBe("Out for Delivery");
    });

    it("returns error when trying to cancel unknown order ORD-999", () => {
      const res = cancelOrder("ORD-999");
      expect(res.success).toBe(false);
      expect(res.error).toBe("ORDER_NOT_FOUND");
    });
  });
});

