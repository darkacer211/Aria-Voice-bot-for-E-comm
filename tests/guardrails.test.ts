import { describe, it, expect } from "vitest";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { lookupProduct } from "@/lib/products/db";
import { getOrderDetails, cancelOrder } from "@/lib/orders/service";

describe("Strict Out-of-Scope & Company Policy Guardrails", () => {
  describe("Prompt Guardrails Verification", () => {
    it("contains strict zero-tolerance math refusal rule and example", () => {
      expect(SYSTEM_PROMPT).toContain("MATHEMATICS & CALCULATIONS");
      expect(SYSTEM_PROMPT).toContain("1+1");
      expect(SYSTEM_PROMPT).toContain("What is 1+1?");
      expect(SYSTEM_PROMPT).toContain("I can only help with our store, beauty products, and order queries");
    });

    it("contains strict flight and travel booking refusal rule and example", () => {
      expect(SYSTEM_PROMPT).toContain("TRAVEL & BOOKINGS");
      expect(SYSTEM_PROMPT).toContain("book a flight");
      expect(SYSTEM_PROMPT).toContain("flight to Mumbai");
    });

    it("contains strict weather, politics, and trivia refusal rules", () => {
      expect(SYSTEM_PROMPT).toContain("GENERAL TRIVIA, WEATHER & NEWS");
      expect(SYSTEM_PROMPT).toContain("weather in Delhi");
    });

    it("contains strict programming and coding refusal rules", () => {
      expect(SYSTEM_PROMPT).toContain("PROGRAMMING & TECHNICAL QUERIES");
      expect(SYSTEM_PROMPT).toContain("Python script");
    });

    it("explicitly enforces zero in-memory order guessing and tool-first calling", () => {
      expect(SYSTEM_PROMPT).toContain("ZERO order knowledge in memory");
      expect(SYSTEM_PROMPT).toContain("get_order_details");
      expect(SYSTEM_PROMPT).toContain("cancel_order");
    });

    it("enforces authoritative cancellation rules for ORD-101 (denied) and ORD-103 (allowed)", () => {
      expect(SYSTEM_PROMPT).toContain("ORD-101");
      expect(SYSTEM_PROMPT).toContain("STRICTLY CANNOT BE CANCELLED");
      expect(SYSTEM_PROMPT).toContain("doorstep");
      expect(SYSTEM_PROMPT).toContain("ORD-103");
      expect(SYSTEM_PROMPT).toContain("THIS IS THE ONLY ORDER ELIGIBLE FOR CANCELLATION");
    });

    it("enforces strict 7-day return window refusal for ORD-102", () => {
      expect(SYSTEM_PROMPT).toContain("ORD-102");
      expect(SYSTEM_PROMPT).toContain("STRICTLY CANNOT BE RETURNED");
      expect(SYSTEM_PROMPT).toContain("7-day");
    });
  });

  describe("Database Products Resolution", () => {
    it("looks up Vitamin C Serum from database orders", () => {
      const prod = lookupProduct("Vitamin C Serum");
      expect(prod).not.toBeNull();
      expect(prod?.id).toBe("vitamin-c-serum");
      expect(prod?.price).toBe(699);
    });

    it("looks up Hydrating Sunscreen from database orders", () => {
      const prod = lookupProduct("Hydrating Sunscreen");
      expect(prod).not.toBeNull();
      expect(prod?.id).toBe("hydrating-sunscreen");
      expect(prod?.price).toBe(499);
    });

    it("looks up Green Tea Face Wash + Toner from database orders", () => {
      const prod = lookupProduct("Green Tea Face Wash");
      expect(prod).not.toBeNull();
      expect(prod?.id).toBe("green-tea-face-wash-toner");
      expect(prod?.price).toBe(850);
    });
  });

  describe("Order Database Actions Enforcement", () => {
    it("authoritatively refuses cancellation of ORD-101", () => {
      const res = cancelOrder("ORD-101", "Changed my mind");
      expect(res.success).toBe(false);
      expect(res.current_status).toBe("Out for Delivery");
      expect(res.message).toContain("cannot be cancelled");
    });

    it("authoritatively allows cancellation of ORD-103 (Processing status)", () => {
      const res = cancelOrder("ORD-103", "No longer needed");
      expect(res.success).toBe(true);
      expect(res.new_status).toBe("Cancelled");
      expect(res.message).toContain("successfully cancelled");
    });

    it("authoritatively denies return of ORD-102 (Delivered 14 days ago)", () => {
      const res = getOrderDetails("ORD-102");
      expect(res.found).toBe(true);
      if (!res.found) return;
      expect(res.policy.return_window_open).toBe(false);
      expect(res.policy.delivered_days_ago).toBe(14);
      expect(res.policy.return_eligibility_note).toContain("CLOSED");
    });
  });
});
