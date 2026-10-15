import { MockOrder } from "./types";

/**
 * Authoritative Mock Order Database for Aria.
 * Strictly contains the 3 canonical evaluation test orders.
 */
export const MOCK_ORDERS_DB: Record<string, MockOrder> = {
  "ORD-101": {
    id: "ORD-101",
    customerName: "Priya Sharma",
    items: ["Vitamin C Serum (30ml)"],
    totalAmount: 699,
    status: "Out for Delivery",
    carrier: "BlueDart",
    trackingNumber: "BD-982103",
    estimatedDelivery: "Expected by 6 PM today",
    deliveredDaysAgo: undefined,
  },
  "ORD-102": {
    id: "ORD-102",
    customerName: "Rahul Verma",
    items: ["Hydrating Sunscreen SPF 50"],
    totalAmount: 499,
    status: "Delivered",
    carrier: "Delhivery",
    trackingNumber: "DL-441029",
    estimatedDelivery: "Delivered 14 days ago",
    deliveredDaysAgo: 14,
  },
  "ORD-103": {
    id: "ORD-103",
    customerName: "Ananya Patel",
    items: ["Green Tea Face Wash + Toner"],
    totalAmount: 850,
    status: "Processing",
    estimatedDelivery: "Ordered 3 hours ago",
    deliveredDaysAgo: undefined,
    orderedHoursAgo: 3,
  },
};

/**
 * Helper to fetch a clone of the mock database.
 */
export function getAllMockOrders(): MockOrder[] {
  return Object.values(MOCK_ORDERS_DB);
}

/**
 * Reset mock database to canonical pristine state (used by test suites and resets).
 */
export function resetMockDb(): void {
  MOCK_ORDERS_DB["ORD-101"] = {
    id: "ORD-101",
    customerName: "Priya Sharma",
    items: ["Vitamin C Serum (30ml)"],
    totalAmount: 699,
    status: "Out for Delivery",
    carrier: "BlueDart",
    trackingNumber: "BD-982103",
    estimatedDelivery: "Expected by 6 PM today",
    deliveredDaysAgo: undefined,
  };
  MOCK_ORDERS_DB["ORD-102"] = {
    id: "ORD-102",
    customerName: "Rahul Verma",
    items: ["Hydrating Sunscreen SPF 50"],
    totalAmount: 499,
    status: "Delivered",
    carrier: "Delhivery",
    trackingNumber: "DL-441029",
    estimatedDelivery: "Delivered 14 days ago",
    deliveredDaysAgo: 14,
  };
  MOCK_ORDERS_DB["ORD-103"] = {
    id: "ORD-103",
    customerName: "Ananya Patel",
    items: ["Green Tea Face Wash + Toner"],
    totalAmount: 850,
    status: "Processing",
    estimatedDelivery: "Ordered 3 hours ago",
    deliveredDaysAgo: undefined,
    orderedHoursAgo: 3,
  };
}

