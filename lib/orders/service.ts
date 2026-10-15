import { CONFIG } from "../config";
import { MOCK_ORDERS_DB } from "./db";
import { normalizeOrderId } from "./normalizer";
import { ComputedPolicyFlags, OrderLookupResult } from "./types";

/**
 * Calculates authoritative, server-computed business policy flags for an order.
 * Ensures the LLM NEVER performs date math, refund eligibility judgments, or fee calculations.
 */
export function computePolicyFlags(
  totalAmount: number,
  status: string,
  deliveredDaysAgo?: number
): ComputedPolicyFlags {
  // 1. Cancellation Policy: Only 'Processing' orders can be cancelled
  const canCancel = status === CONFIG.POLICIES.CANCELLATIONS.ALLOWED_STATUS;
  let cancelNote: string;
  if (canCancel) {
    cancelNote = "Eligible for cancellation. The customer may request cancellation before the order is dispatched.";
  } else if (status === "Out for Delivery" || status === "Shipped") {
    cancelNote = CONFIG.POLICIES.CANCELLATIONS.NON_CANCELLABLE_NOTE;
  } else if (status === "Delivered") {
    cancelNote = "Cannot be cancelled because the order has already been delivered.";
  } else {
    cancelNote = "This order is not eligible for cancellation.";
  }

  // 2. Return Policy: Within 7 days of delivery, UNOPENED & UNUSED only
  const isDelivered = status === "Delivered";
  const daysSinceDelivery = isDelivered && typeof deliveredDaysAgo === "number" ? deliveredDaysAgo : null;
  const returnWindowOpen = isDelivered && daysSinceDelivery !== null && daysSinceDelivery <= CONFIG.POLICIES.RETURNS.WINDOW_DAYS;

  let returnEligibilityNote: string;
  if (!isDelivered) {
    returnEligibilityNote = "Returns are not applicable because the order has not been delivered yet. Customer may cancel if still processing.";
  } else if (returnWindowOpen) {
    returnEligibilityNote = `The 7-day return window is OPEN (delivered ${daysSinceDelivery} day${daysSinceDelivery === 1 ? "" : "s"} ago). Remind the customer that the product must be ${CONFIG.POLICIES.RETURNS.REQUIREMENTS}. You must ask if the product is opened or used before confirming eligibility.`;
  } else {
    returnEligibilityNote = `The 7-day return window is CLOSED. This order was delivered ${daysSinceDelivery} days ago. Aria policy strictly permits returns only within 7 days of delivery. Politely deny the return request.`;
  }

  // 3. Damaged/Defective Reporting: Within 48 hours (2 days) of delivery, for replacement
  const damageReportWindowOpen = isDelivered && daysSinceDelivery !== null && daysSinceDelivery <= 2;
  const damageReportNote = damageReportWindowOpen
    ? "Eligible to report damage/defect (within 48 hours of delivery). Must provide photos for a REPLACEMENT."
    : "Damage reporting window (48 hours) has passed.";

  // 4. Shipping Fee: Free only strictly ABOVE 499. (₹499 incurs ₹50 fee)
  const shippingFeeApplied = totalAmount <= CONFIG.POLICIES.SHIPPING.FREE_SHIPPING_MIN_VALUE;
  const shippingFeeAmount = shippingFeeApplied ? CONFIG.POLICIES.SHIPPING.STANDARD_FEE : 0;

  // 5. Cash on Delivery: Available up to ₹2,500
  const codEligible = totalAmount <= CONFIG.POLICIES.COD.MAX_ORDER_VALUE;

  return {
    can_cancel: canCancel,
    cancel_note: cancelNote,
    delivered_days_ago: daysSinceDelivery,
    return_window_open: returnWindowOpen,
    return_eligibility_note: returnEligibilityNote,
    damage_report_window_open: damageReportWindowOpen,
    damage_report_note: damageReportNote,
    shipping_fee_applied: shippingFeeApplied,
    shipping_fee_amount: shippingFeeAmount,
    cod_eligible: codEligible,
    customer_display_name: "", // injected in lookup
  };
}

/**
 * Main lookup service for the get_order_details tool.
 */
export function getOrderDetails(rawOrderId: string | null | undefined): OrderLookupResult {
  const normResult = normalizeOrderId(rawOrderId);

  if (!normResult.success) {
    return {
      found: false,
      error: normResult.error,
      message: normResult.message,
      raw_input: rawOrderId || "",
    };
  }

  const canonicalId = normResult.canonicalId;
  const order = MOCK_ORDERS_DB[canonicalId];

  if (!order) {
    return {
      found: false,
      error: "ORDER_NOT_FOUND",
      message: `No order found matching ${canonicalId}. Please check the order confirmation SMS or email.`,
      raw_input: rawOrderId || "",
    };
  }

  const policy = computePolicyFlags(order.totalAmount, order.status, order.deliveredDaysAgo);
  const firstName = order.customerName.split(" ")[0];
  policy.customer_display_name = firstName;

  return {
    found: true,
    canonical_id: canonicalId,
    order: {
      id: order.id,
      customer_name: order.customerName,
      items: order.items,
      total_amount: order.totalAmount,
      status: order.status,
      carrier: order.carrier || null,
      tracking_number: order.trackingNumber || null,
      delivery_info: order.estimatedDelivery || "Status updated in system",
    },
    policy,
  };
}

/**
 * Authoritative cancellation service for the cancel_order tool.
 * Updates order status in database if policy permits ('Processing' only).
 */
export function cancelOrder(rawOrderId: string | null | undefined, reason?: string) {
  const normResult = normalizeOrderId(rawOrderId);
  if (!normResult.success) {
    return {
      success: false,
      error: normResult.error,
      message: normResult.message,
    };
  }

  const canonicalId = normResult.canonicalId;
  const order = MOCK_ORDERS_DB[canonicalId];

  if (!order) {
    return {
      success: false,
      error: "ORDER_NOT_FOUND",
      message: `No order found matching ${canonicalId} in the Aria database.`,
    };
  }

  if (order.status !== CONFIG.POLICIES.CANCELLATIONS.ALLOWED_STATUS) {
    return {
      success: false,
      order_id: canonicalId,
      current_status: order.status,
      message: `Order ${canonicalId} cannot be cancelled because its current status is '${order.status}'. ${CONFIG.POLICIES.CANCELLATIONS.NON_CANCELLABLE_NOTE}`,
    };
  }

  // Authoritatively cancel order in mock database
  order.status = "Cancelled";
  order.estimatedDelivery = "Cancelled by customer request";

  return {
    success: true,
    order_id: canonicalId,
    new_status: "Cancelled",
    message: `Order ${canonicalId} has been successfully cancelled in the Aria database.`,
    customer_name: order.customerName,
    items: order.items,
    reason: reason || "Customer voice request",
  };
}
