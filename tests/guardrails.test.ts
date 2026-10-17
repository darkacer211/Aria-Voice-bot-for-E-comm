import { describe, it, expect } from "vitest";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { lookupProduct } from "@/lib/products/db";
import { CONFIG } from "@/lib/config";

describe("Datastraw Assignment & Brand Guardrails Verification", () => {
  it("enforces brand name as AURA and persona as Aria", () => {
    expect(CONFIG.BRAND_NAME).toBe("AURA");
    expect(CONFIG.AGENT_NAME).toBe("Aria");
    expect(SYSTEM_PROMPT).toContain("AURA");
    expect(SYSTEM_PROMPT).toContain("Aria");
  });

  it("places Rule #1 Absolute Domain Restriction at the top of the prompt", () => {
    const domainRestrictionIndex = SYSTEM_PROMPT.indexOf(
      "ABSOLUTE DOMAIN RESTRICTION & OUT-OF-SCOPE GUARDRAILS (RULE #1 - HIGHEST PRIORITY)"
    );
    const voiceRulesIndex = SYSTEM_PROMPT.indexOf("VOICE STYLE RULES");

    expect(domainRestrictionIndex).toBeGreaterThan(-1);
    expect(voiceRulesIndex).toBeGreaterThan(-1);
    // Absolute domain restriction must appear BEFORE voice style rules and knowledge base
    expect(domainRestrictionIndex).toBeLessThan(voiceRulesIndex);
  });

  it("strictly forbids answering out-of-scope topics", () => {
    expect(SYSTEM_PROMPT).toContain("STRICTLY FORBIDDEN FROM ANSWERING ANY GENERAL KNOWLEDGE OR OUT-OF-SCOPE QUESTIONS");
    expect(SYSTEM_PROMPT).toContain("Can you book me a flight to Goa?");
    expect(SYSTEM_PROMPT).toContain("capital of France");
    expect(SYSTEM_PROMPT).toContain("Python script");
    expect(SYSTEM_PROMPT).toContain("weather");
  });

  it("contains Datastraw policy enforcement example for 20-day opened returns", () => {
    expect(SYSTEM_PROMPT).toContain("I bought this 20 days ago and have opened it. Can I return it?");
    expect(SYSTEM_PROMPT).toContain("our return policy only allows returns for unopened products within 7 days");
  });

  it("contains graceful degradation instructions for unknown order IDs and mumbles", () => {
    expect(SYSTEM_PROMPT).toContain("I couldn't locate an order with that number, could you please repeat or verify the ID?");
    expect(SYSTEM_PROMPT).toContain("I'm sorry, I couldn't hear that clearly. Could you please repeat that?");
  });

  it("authoritatively resolves AURA catalog products", () => {
    const vitC = lookupProduct("vitamin c");
    expect(vitC).not.toBeNull();
    expect(vitC?.name).toBe("Vitamin C Serum (30ml)");
    expect(vitC?.price).toBe(699);

    const sunscreen = lookupProduct("sunscreen");
    expect(sunscreen).not.toBeNull();
    expect(sunscreen?.name).toBe("Hydrating Sunscreen SPF 50");
    expect(sunscreen?.price).toBe(499);

    const faceWash = lookupProduct("green tea face wash");
    expect(faceWash).not.toBeNull();
    expect(faceWash?.name).toBe("Green Tea Face Wash + Toner");
    expect(faceWash?.price).toBe(850);
  });

  it("strictly forbids agreeing to cancel ORD-101 in SYSTEM_PROMPT", () => {
    expect(SYSTEM_PROMPT).toContain("ORD-101");
    expect(SYSTEM_PROMPT).toContain("CANNOT BE CANCELLED UNDER ANY CIRCUMSTANCES");
    expect(SYSTEM_PROMPT).toContain("ABSOLUTE PROHIBITION: You must NEVER agree to cancel");
    expect(SYSTEM_PROMPT).toContain("refuse the delivery at your doorstep for a full refund");
  });
});
