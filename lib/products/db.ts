/**
 * Authoritative Product Catalog & Dataset for Aura Skincare.
 * Real-time product specifications, shade matrices, bio-actives, and pricing.
 */

export interface ProductRecord {
  id: string;
  name: string;
  category: "Lips" | "Face" | "Eyes" | "Skincare";
  price: number;
  originalPrice: number;
  discountNote?: string;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  keyActives: string[];
  description: string;
  shades?: Array<{
    code: string;
    name: string;
    undertone: string;
    bestFor: string;
  }>;
}

export const PRODUCT_CATALOG_DB: Record<string, ProductRecord> = {
  "ace-of-face": {
    id: "ace-of-face",
    name: "Ace of Face Foundation Stick",
    category: "Face",
    price: 899,
    originalPrice: 1099,
    discountNote: "18% off",
    inStock: true,
    rating: 4.8,
    reviewsCount: 1240,
    keyActives: ["Vitamin E", "Hyaluronic Acid Spheres", "Jojoba Esters"],
    description:
      "Weightless medium-to-full buildable coverage foundation stick with 12-hour wear and a radiant dewy finish that prevents camera flashback.",
    shades: [
      {
        code: "17",
        name: "Raf",
        undertone: "Fair with warm golden/yellow undertones",
        bestFor: "Fair complexions wanting natural golden warmth",
      },
      {
        code: "20",
        name: "Galão",
        undertone: "Light-medium with warm golden/olive undertones",
        bestFor: "Best-seller for warm Indian and olive skin tones; seamless radiance without flashback",
      },
      {
        code: "24",
        name: "Macchiato",
        undertone: "Medium with neutral-to-warm golden undertones",
        bestFor: "Medium wheatish complexions",
      },
      {
        code: "30",
        name: "Cortado",
        undertone: "Medium-deep with rich warm undertones",
        bestFor: "Tan to medium-deep skin tones",
      },
      {
        code: "37",
        name: "Freddo",
        undertone: "Deep with neutral undertones",
        bestFor: "Deep, rich complexions",
      },
    ],
  },
  "glide-peptide-lipstick": {
    id: "glide-peptide-lipstick",
    name: "Glide Peptide Serum Lipstick",
    category: "Lips",
    price: 412,
    originalPrice: 549,
    discountNote: "25% off",
    inStock: true,
    rating: 4.8,
    reviewsCount: 792,
    keyActives: [
      "Plumping Bio-Peptides",
      "Hyaluronic Acid",
      "Plant Squalane",
      "Bakuchiol (botanical retinol)",
      "Organic Jojoba Oil",
    ],
    description:
      "Luxurious cloud-matte finish with 8+ hours wear, infused with 5 bio-actives to soothe lip lines and restore moisture barrier.",
    shades: [
      { code: "01", name: "Mulberry Silk", undertone: "Cool Berry", bestFor: "Evening statement wear" },
      { code: "04", name: "Spiced Chai", undertone: "Warm Terracotta Nude", bestFor: "Daily everyday wear for Indian undertones" },
      { code: "08", name: "Rose Petal", undertone: "Soft Mauve Pink", bestFor: "Fresh morning glow" },
    ],
  },
  "glide-peptide-gloss": {
    id: "glide-peptide-gloss",
    name: "Glide Peptide Plumping Gloss Stick",
    category: "Lips",
    price: 594,
    originalPrice: 699,
    discountNote: "15% off",
    inStock: true,
    rating: 4.9,
    reviewsCount: 701,
    keyActives: ["Botanical Squalane", "Palmitoyl Tripeptide-38", "Cold-Pressed Coconut Oil"],
    description:
      "Non-sticky high-shine glass finish that visibly plumps lips within 5 minutes while locking in hydration for 6 hours.",
  },
  "bling-leader-strobe": {
    id: "bling-leader-strobe",
    name: "Bling Leader Illuminating Strobe",
    category: "Face",
    price: 499,
    originalPrice: 499,
    discountNote: "Radiance Elixir",
    inStock: true,
    rating: 4.7,
    reviewsCount: 310,
    keyActives: ["Green Tea Extract", "Shea Butter", "Prismatic Light-Reflecting Micro-Pearls"],
    description:
      "Hydrating strobe cream that imparts an ethereal lit-from-within glow. Available in Peach Poppin, Gold Glaze, and Pink Trippin.",
  },
  "partner-in-shine-gloss": {
    id: "partner-in-shine-gloss",
    name: "Partner In Shine Lip Gloss",
    category: "Lips",
    price: 454,
    originalPrice: 699,
    discountNote: "35% off",
    inStock: true,
    rating: 4.8,
    reviewsCount: 641,
    keyActives: ["Vitamin E", "Golden Jojoba", "Avocado Oil"],
    description:
      "Cushiony crystal glass shine with zero stickiness. Shields lips against environmental stress with Vitamin E.",
  },
};

/**
 * Fuzzy search/lookup product in catalog by keyword.
 */
export function lookupProduct(query: string | null | undefined): ProductRecord | null {
  if (!query || typeof query !== "string") return null;
  const q = query.toLowerCase().trim();

  // Direct ID check
  if (PRODUCT_CATALOG_DB[q]) return PRODUCT_CATALOG_DB[q];

  // Match by keyword
  for (const prod of Object.values(PRODUCT_CATALOG_DB)) {
    if (prod.name.toLowerCase().includes(q) || prod.id.includes(q)) {
      return prod;
    }
  }

  // Token fuzzy search
  if (q.includes("foundation") || q.includes("ace of face") || q.includes("shade") || q.includes("galao") || q.includes("galão")) {
    return PRODUCT_CATALOG_DB["ace-of-face"];
  }
  if (q.includes("serum lipstick") || q.includes("peptide lipstick") || q.includes("glide peptide")) {
    return PRODUCT_CATALOG_DB["glide-peptide-lipstick"];
  }
  if (q.includes("plumping gloss") || q.includes("gloss stick")) {
    return PRODUCT_CATALOG_DB["glide-peptide-gloss"];
  }
  if (q.includes("strobe") || q.includes("bling leader") || q.includes("illuminat")) {
    return PRODUCT_CATALOG_DB["bling-leader-strobe"];
  }
  if (q.includes("partner in shine") || q.includes("lip gloss")) {
    return PRODUCT_CATALOG_DB["partner-in-shine-gloss"];
  }

  return null;
}
