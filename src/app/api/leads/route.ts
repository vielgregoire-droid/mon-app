import { NextResponse } from "next/server";
import { fetchLeads } from "@/lib/supabase/queries";

export async function GET() {
  try {
    const leads = await fetchLeads();
    return NextResponse.json(leads);
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
