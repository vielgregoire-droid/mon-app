import { NextResponse } from "next/server";
import { fetchTopProducts } from "@/lib/supabase/queries";

export async function GET() {
  try {
    const products = await fetchTopProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch top products:", error);
    return NextResponse.json({ error: "Failed to fetch top products" }, { status: 500 });
  }
}
