import { NextRequest, NextResponse } from "next/server";
import { lookupProduct, PRODUCT_CATALOG_DB } from "@/lib/products/db";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    const query = body.query || body.product_name || body.name || body.id || "";

    const product = lookupProduct(query);
    const latencyMs = Date.now() - startTime;

    if (product) {
      return NextResponse.json({
        found: true,
        product,
        _meta: {
          latency_ms: latencyMs,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      found: false,
      message: `No specific product found for '${query}'. Available products include Ace of Face Foundation, Glide Peptide Serum Lipstick, Glide Peptide Plumping Gloss, Bling Leader Illuminating Strobe, and Partner In Shine Gloss.`,
      catalog: Object.values(PRODUCT_CATALOG_DB).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
      })),
      _meta: {
        latency_ms: latencyMs,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        found: false,
        error: "INTERNAL_ERROR",
        message: `Failed to process product lookup: ${message}`,
      },
      { status: 500 }
    );
  }
}
