import { NextRequest, NextResponse } from "next/server";
import { fetchSellers } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  try {
    const env = request.nextUrl.searchParams.get("environment") || undefined;
    const sellers = await fetchSellers(env);
    return NextResponse.json(sellers);
  } catch (error) {
    console.error("Failed to fetch sellers:", error);
    return NextResponse.json({ error: "Failed to fetch sellers" }, { status: 500 });
  }
}
