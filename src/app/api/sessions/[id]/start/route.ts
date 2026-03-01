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
  const roomName = `cf-${sessionId.slice(0, 8)}-${Date.now().toString(36)}`;
  let roomData: any = null;

  try {
    const dailyRes = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.DAILY_API_KEY}` },
      body: JSON.stringify({ name: roomName, privacy: "public", properties: { enable_chat: true, exp: Math.floor(Date.now() / 1000) + 7200 } }),
    });
    roomData = await dailyRes.json();
    if (roomData.error) { console.error("Daily.co failed:", roomData); roomData = { name: roomName, url: `https://coachforge.daily.co/${roomName}` }; }
  } catch (e) { console.error("Daily.co error:", e); roomData = { name: roomName, url: `https://coachforge.daily.co/${roomName}` }; }

  const { data, error } = await supabase.from("sessions").update({ status: "in_progress", started_at: new Date().toISOString(), room_name: roomData.name, room_url: roomData.url }).eq("id", sessionId).eq("coach_id", user.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    const { data: client } = await supabase.from("clients").select("email, full_name").eq("id", data.client_id).single();
    const { data: coach } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
    if (client?.email) {
      const { Resend } = require("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/join/${roomData.name}`;
      const emailResult = await resend.emails.send({
        from: `${coach?.full_name || "Your Coach"} via CoachForge <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
        to: client.email,
        subject: `${coach?.full_name || "Your Coach"} is ready for your session`,
        html: `<div style="font-family:-apple-system,sans-serif;max-width:500px;margin:0 auto;padding:30px 0;"><p style="font-size:16px;color:#1C1917;">Hi ${client.full_name.split(" ")[0]},</p><p style="font-size:15px;color:#57534E;">Your coaching session is starting now.</p><div style="margin:24px 0;text-align:center;"><a href="${joinUrl}" style="display:inline-block;padding:14px 40px;background:#2563EB;color:white;border-radius:12px;text-decoration:none;font-weight:700;">Join Session Now</a></div></div>`,
      });
      console.log("Join email sent:", emailResult);
    }
  } catch (emailErr) { console.error("Join email failed:", emailErr); }

  return NextResponse.json(data);
}
