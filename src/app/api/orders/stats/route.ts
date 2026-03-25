import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const env = request.nextUrl.searchParams.get("environment") || undefined;
    const dateStart = request.nextUrl.searchParams.get("dateStart") || undefined;
    const dateEnd = request.nextUrl.searchParams.get("dateEnd") || undefined;

    const supabase = await createClient();

    // Fetch all matching rows (only lightweight columns) with pagination
    const pageSize = 1000;
    const allRows: { status: string; total_amount_incl_tax: number; total_paid_incl_tax: number; is_web_order: boolean }[] = [];
    let from = 0;
    while (true) {
      let query = supabase.from("orders").select("status, total_amount_incl_tax, total_paid_incl_tax, is_web_order").range(from, from + pageSize - 1);
      if (env && env !== "ALL") query = query.eq("environment", env);
      if (dateStart) query = query.gte("date", dateStart);
      if (dateEnd) query = query.lte("date", dateEnd);
      const { data, error: err } = await query;
      if (err) throw err;
      if (!data || data.length === 0) break;
      allRows.push(...data);
      if (data.length < pageSize) break;
      from += pageSize;
    }

    const totalOrders = allRows.length;
    const totalCA = allRows.reduce((s, r) => s + Number(r.total_amount_incl_tax), 0);
    const totalPaid = allRows.reduce((s, r) => s + Number(r.total_paid_incl_tax), 0);
    const webOrders = allRows.filter((r) => r.is_web_order).length;
    const canceledOrders = allRows.filter((r) => r.status === "Canceled" || r.status === "PartiallyCancelled").length;

    // Status counts
    const statusCounts: Record<string, number> = {};
    for (const r of allRows) {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    }

    return NextResponse.json({
      totalOrders,
      totalCA: Math.round(totalCA),
      totalPaid: Math.round(totalPaid),
      avgBasket: totalOrders > 0 ? Math.round(totalPaid / totalOrders) : 0,
      webPct: totalOrders > 0 ? ((webOrders / totalOrders) * 100).toFixed(1) : "0",
      cancelRate: totalOrders > 0 ? ((canceledOrders / totalOrders) * 100).toFixed(1) : "0",
      statusCounts,
    });
  } catch (error) {
    console.error("Failed to fetch order stats:", error);
    return NextResponse.json({ error: "Failed to fetch order stats" }, { status: 500 });
  }
}
