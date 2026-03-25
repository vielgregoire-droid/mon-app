import { NextResponse } from "next/server";
import { fetchBpRows } from "@/lib/supabase/queries";

export async function GET() {
  try {
    const rows = await fetchBpRows();
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch BP rows:", error);
    return NextResponse.json({ error: "Failed to fetch BP rows" }, { status: 500 });
  }
}
