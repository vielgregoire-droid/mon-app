import { NextResponse } from "next/server";
import { fetchSellers } from "@/lib/supabase/queries";

export async function GET() {
  try {
    const sellers = await fetchSellers();
    return NextResponse.json(sellers);
  } catch (error) {
    console.error("Failed to fetch sellers:", error);
    return NextResponse.json({ error: "Failed to fetch sellers" }, { status: 500 });
  }
}
