export type OrderStatus = "Processing" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled";

export interface MockOrder {
  id: string; // e.g. "ORD-101"
  customerName: string;
  items: string[];
  totalAmount: number; // in INR
  status: OrderStatus;
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredDaysAgo?: number; // null if not delivered
  orderedHoursAgo?: number;
}

export interface ComputedPolicyFlags {
  // Cancellation policy
  can_cancel: boolean;
  cancel_note: string;

  // Return policy
  delivered_days_ago: number | null;
  return_window_open: boolean;
  return_eligibility_note: string;

  // Damage reporting policy
  damage_report_window_open: boolean;
  damage_report_note: string;

  // Pricing policies
  shipping_fee_applied: boolean; // True if <= ₹499 (exact ₹499 incurs fee)
  shipping_fee_amount: number;
  cod_eligible: boolean; // True if <= ₹2,500

  // Display details
  customer_display_name: string;
}

export type OrderLookupSuccess = {
  found: true;
  canonical_id: string;
  order: {
    id: string;
    customer_name: string;
    items: string[];
    total_amount: number;
    status: OrderStatus;
    carrier: string | null;
    tracking_number: string | null;
    delivery_info: string;
  };
  policy: ComputedPolicyFlags;
};

export type OrderLookupError = {
  found: false;
  error: "ORDER_NOT_FOUND" | "MISSING_ORDER_ID" | "INVALID_FORMAT";
  message: string;
  raw_input?: string;
};

export type OrderLookupResult = OrderLookupSuccess | OrderLookupError;

export interface ToolCallLogEntry {
  id: string;
  tool_name: string;
  arguments: Record<string, unknown>;
  result: OrderLookupResult;
  timestamp: string;
  latency_ms: number;
}
