import { createServiceSupabase } from "@/lib/supabase/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { processSession } from "@/lib/ai/process-session";
import { sendFollowUpEmail } from "@/lib/email/client";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabase();
  const serviceSupabase = createServiceSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionId = params.id;

  // Get session with client data
  const { data: session } = await supabase
    .from("sessions")
    .select("*, client:clients(*)")
    .eq("id", sessionId)
    .eq("coach_id", user.id)
    .single();

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  // Update to processing
  await supabase.from("sessions").update({
    status: "processing",
    ended_at: new Date().toISOString(),
    duration_seconds: session.started_at
      ? Math.round((Date.now() - new Date(session.started_at).getTime()) / 1000)
      : null,
  }).eq("id", sessionId);

  // Get transcript - in production this comes from Deepgram
  // For now, use any transcript stored or a placeholder
  const transcript = session.transcript_text || "No transcript available. This session was not recorded.";

  try {
    // Run AI pipeline
    const result = await processSession(
      transcript,
      session.client,
      session.session_number
    );

    // Save results to session
    await serviceSupabase.from("sessions").update({
      status: "completed",
      summary: result.summary,
      summary_structured: result.summary_structured,
      mood_score: result.mood_score,
      energy_score: result.energy_score,
      engagement_score: result.engagement_score,
      breakthrough_flagged: result.breakthrough_flagged,
      followup_email_body: result.followup_email_body,
    }).eq("id", sessionId);

    // Save action items
    if (result.action_items.length > 0) {
      const actionRows = result.action_items.map(item => ({
        session_id: sessionId,
        client_id: session.client_id,
        coach_id: user.id,
        task: item.task,
        priority: item.priority,
        due_date: item.due_date_suggestion, // Will need parsing in production
      }));
      await serviceSupabase.from("action_items").insert(actionRows);
    }

    // Save progress data
    await serviceSupabase.from("client_progress").insert([
      { client_id: session.client_id, session_id: sessionId, date: new Date().toISOString().split("T")[0], type: "mood", value: result.mood_score },
      { client_id: session.client_id, session_id: sessionId, date: new Date().toISOString().split("T")[0], type: "energy", value: result.energy_score },
    ]);

    // Update client stats
    await serviceSupabase.from("clients").update({
      session_count: session.client.session_count + 1,
      last_session_at: new Date().toISOString(),
      current_streak: session.client.current_streak + 1,
    }).eq("id", session.client_id);

    // Update coach session count
    const { data: profile } = await serviceSupabase.from("profiles").select("session_count_this_month").eq("id", user.id).single();
    await serviceSupabase.from("profiles").update({
      session_count_this_month: (profile?.session_count_this_month || 0) + 1,
    }).eq("id", user.id);

    // Send follow-up email
    try {
      const { data: coachProfile } = await serviceSupabase.from("profiles").select("full_name").eq("id", user.id).single();
      const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/${session.client.portal_token}`;

      await sendFollowUpEmail(
        session.client.email,
        session.client.full_name.split(" ")[0],
        coachProfile?.full_name || "Your Coach",
        result.followup_email_body,
        portalUrl
      );

      await serviceSupabase.from("sessions").update({
        followup_email_sent: true,
        followup_email_sent_at: new Date().toISOString(),
      }).eq("id", sessionId);
    } catch (emailError) {
      console.error("Failed to send follow-up email:", emailError);
    }

    return NextResponse.json({ success: true, status: "completed" });
  } catch (error) {
    console.error("AI pipeline error:", error);
    // Mark as completed with error
    await serviceSupabase.from("sessions").update({
      status: "completed",
      summary: "Session processing encountered an error. Please contact support.",
    }).eq("id", sessionId);

    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
