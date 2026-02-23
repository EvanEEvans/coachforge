import { createServiceSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  const supabase = createServiceSupabase();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("portal_token", params.token)
    .single();

  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [sessionsRes, actionsRes, coachRes] = await Promise.all([
    supabase.from("sessions").select("id, session_number, summary, breakthrough_flagged, created_at, mood_score")
      .eq("client_id", client.id).eq("status", "completed").order("created_at", { ascending: false }).limit(10),
    supabase.from("action_items").select("*").eq("client_id", client.id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("full_name, brand_color").eq("id", client.coach_id).single(),
  ]);

  return NextResponse.json({
    client: { ...client, portal_token: undefined },
    sessions: sessionsRes.data || [],
    actions: actionsRes.data || [],
    coach: coachRes.data,
  });
}
