import { NextRequest, NextResponse } from "next/server";
import { getOrderDetails } from "@/lib/orders/service";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    const rawOrderId = body.orderId || body.order_id || body.id || "";

    const result = getOrderDetails(rawOrderId);
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      ...result,
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
        message: `Failed to process order lookup: ${message}`,
      },
      { status: 500 }
    );
  }
}
