import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionId = params.id;

  // Create Daily.co room
  let roomData = null;
  try {
    const dailyRes = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: `cf-${sessionId.slice(0, 8)}`,
        privacy: "private",
        properties: {
          enable_recording: "cloud",
          enable_chat: true,
          exp: Math.floor(Date.now() / 1000) + 7200, // 2hr expiry
        },
      }),
    });
    roomData = await dailyRes.json();
  } catch (e) {
    // If Daily.co is not configured, create a mock room for development
    roomData = {
      name: `cf-${sessionId.slice(0, 8)}`,
      url: `https://${process.env.NEXT_PUBLIC_DAILY_DOMAIN || "mock"}.daily.co/cf-${sessionId.slice(0, 8)}`,
    };
  }

  // Update session
  const { data, error } = await supabase
    .from("sessions")
    .update({
      status: "in_progress",
      started_at: new Date().toISOString(),
      room_name: roomData.name,
      room_url: roomData.url,
    })
    .eq("id", sessionId)
    .eq("coach_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
