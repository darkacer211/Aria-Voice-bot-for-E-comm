import { NextResponse } from "next/server";
import { MOCK_ORDERS_DB, getAllMockOrders, resetMockDb } from "@/lib/orders/db";

export async function GET() {
  return NextResponse.json({
    orders: MOCK_ORDERS_DB,
    list: getAllMockOrders(),
    timestamp: new Date().toISOString(),
  });
}

export async function POST() {
  resetMockDb();
  return NextResponse.json({
    success: true,
    message: "Orders database reset to canonical pristine state.",
    orders: MOCK_ORDERS_DB,
  });
}
