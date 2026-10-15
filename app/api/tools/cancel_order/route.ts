import { NextRequest, NextResponse } from "next/server";
import { cancelOrder } from "@/lib/orders/service";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    const rawOrderId = body.orderId || body.order_id || body.id || "";
    const reason = body.reason || "";

    const result = cancelOrder(rawOrderId, reason);
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
        success: false,
        error: "INTERNAL_ERROR",
        message: `Failed to cancel order: ${message}`,
      },
      { status: 500 }
    );
  }
}
