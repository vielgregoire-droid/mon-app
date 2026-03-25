import { NextRequest, NextResponse } from "next/server";
import { fetchOrders } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  try {
    const env = request.nextUrl.searchParams.get("environment") || undefined;
    const dateStart = request.nextUrl.searchParams.get("dateStart") || undefined;
    const dateEnd = request.nextUrl.searchParams.get("dateEnd") || undefined;
    const orders = await fetchOrders(env, dateStart, dateEnd);
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
