/**
 * Speech-to-Order-ID Normalizer.
 * Handles messy spoken phrases like "o r d one zero one", "order 101",
 * "ord-102", "103", "o r d dash one zero three", etc.
 */

const DIGIT_WORDS: Record<string, string> = {
  zero: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
};

export type NormalizeResult =
  | { success: true; canonicalId: string }
  | { success: false; error: "MISSING_ORDER_ID" | "INVALID_FORMAT"; message: string };

/**
 * Normalizes any spoken or typed order ID string into canonical format "ORD-XXX".
 */
export function normalizeOrderId(rawInput: string | null | undefined): NormalizeResult {
  if (!rawInput || typeof rawInput !== "string" || !rawInput.trim()) {
    return {
      success: false,
      error: "MISSING_ORDER_ID",
      message: "No order ID was provided.",
    };
  }

  const trimmed = rawInput.trim();

  // Convert to lowercase for parsing
  let text = trimmed.toLowerCase();

  // Remove punctuation that isn't hyphens (e.g. periods, commas, quotes)
  text = text.replace(/[,.:;'"]/g, " ");

  // Map spoken words "dash" / "hyphen" to empty space
  text = text.replace(/\b(dash|hyphen)\b/g, " ");

  // Map spoken words "number", "id", "order", "o r d"
  // First, convert spoken digit words: "one" -> "1", "zero" -> "0"
  const tokens = text.split(/\s+/).filter(Boolean);
  const convertedTokens: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (DIGIT_WORDS[token]) {
      convertedTokens.push(DIGIT_WORDS[token]);
    } else if (token === "hundred" && convertedTokens.length > 0) {
      // e.g. "one hundred one" -> "1" "0" "1" if preceding is 1
      const prev = convertedTokens.pop();
      if (prev === "1") {
        convertedTokens.push("1", "0");
      } else {
        convertedTokens.push(prev || "1", "0", "0");
      }
    } else if (token === "and") {
      // ignore "and" in "one hundred and one"
      continue;
    } else {
      convertedTokens.push(token);
    }
  }

  const processedString = convertedTokens.join(" ");

  // Remove spaces between single letters/digits: "o r d 1 0 1" -> "ord101"
  // Match patterns like "ord", "o r d", or just digits
  // First, try to extract consecutive digits
  const compact = processedString.replace(/\s+/g, "");

  // Match canonical or semi-canonical ORD-(\d+), AUR-(\d+), or AURA-(\d+)
  const ordMatch = compact.match(/(?:ord|aur|aura)-?(\d+)/i);
  if (ordMatch && ordMatch[1]) {
    return {
      success: true,
      canonicalId: `ORD-${ordMatch[1]}`,
    };
  }

  // Match standalone number sequence like "101" or "order 101"
  const digitsMatch = compact.match(/(\d{3,})/);
  if (digitsMatch && digitsMatch[1]) {
    return {
      success: true,
      canonicalId: `ORD-${digitsMatch[1]}`,
    };
  }

  // If digits exist but fewer than 3 digits, e.g. "1" or "10", check if preceded by order
  const shortDigitsMatch = compact.match(/(?:order|ord)?(\d+)/i);
  if (shortDigitsMatch && shortDigitsMatch[1] && /\d/.test(shortDigitsMatch[1])) {
    return {
      success: true,
      canonicalId: `ORD-${shortDigitsMatch[1]}`,
    };
  }

  return {
    success: false,
    error: "INVALID_FORMAT",
    message: `Could not parse a valid order ID from "${trimmed}". Expected format is like ORD-101.`,
  };
}
