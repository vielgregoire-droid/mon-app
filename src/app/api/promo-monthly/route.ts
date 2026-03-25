import { NextResponse } from "next/server";
import { fetchPromoMonthly } from "@/lib/supabase/queries";

export async function GET() {
  try {
    const data = await fetchPromoMonthly();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch promo monthly:", error);
    return NextResponse.json({ error: "Failed to fetch promo monthly" }, { status: 500 });
  }
}
