import { NextRequest, NextResponse } from "next/server";
import { fetchOrders } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  try {
    const env = request.nextUrl.searchParams.get("environment") || undefined;
    const orders = await fetchOrders(env);
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
