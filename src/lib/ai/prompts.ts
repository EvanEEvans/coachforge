import { Client, Session } from "@/lib/supabase/types";

export function buildSessionSummaryPrompt(
  transcript: string,
  client: Client,
  sessionNumber: number
): string {
  return `You are an expert coaching assistant. Analyze this coaching session transcript and generate a comprehensive yet concise session summary.

CLIENT CONTEXT:
- Name: ${client.full_name}
- Coaching Type: ${client.coaching_type || "general"}
- Goals: ${client.goals?.join(", ") || "Not specified"}
- Session Number: ${sessionNumber}

TRANSCRIPT:
${transcript}

Generate a JSON response with this exact structure:
{
  "summary": "A 150-250 word narrative summary of the session in warm, professional language. Written in third person.",
  "summary_structured": {
    "overview": "2-3 sentence high-level summary",
    "key_themes": ["theme1", "theme2", "theme3"],
    "breakthroughs": ["any breakthrough moments or realizations"],
    "concerns": ["any concerns or risk flags noticed"],
    "coaching_techniques_used": ["techniques the coach employed"]
  },
  "mood_score": 75,
  "energy_score": 80,
  "engagement_score": 85,
  "breakthrough_flagged": false
}

Score guidelines:
- mood_score: 1-100, client's emotional state (50=neutral, 80+=positive, 30-=concerning)
- energy_score: 1-100, client's energy/motivation level
- engagement_score: 1-100, how engaged/participatory the client was
- breakthrough_flagged: true only if a genuine "aha moment" or significant shift occurred

Respond ONLY with valid JSON, no markdown or explanation.`;
}

export function buildActionItemsPrompt(
  transcript: string,
  client: Client
): string {
  return `You are an expert coaching assistant. Extract all action items, commitments, and homework from this coaching session transcript.

CLIENT: ${client.full_name}
GOALS: ${client.goals?.join(", ") || "Not specified"}

TRANSCRIPT:
${transcript}

Generate a JSON array of action items:
[
  {
    "task": "Clear, specific description of what the client committed to",
    "priority": "high|medium|low",
    "due_date_suggestion": "relative timeframe like 'within 1 week' or 'by next session' or 'ongoing'"
  }
]

Rules:
- Extract ONLY commitments the client actually made or the coach explicitly assigned
- Be specific — "Journal daily" not "Do journaling"
- Include any exercises, reflections, or practices discussed
- Typically 2-6 action items per session
- high = directly tied to primary goal, medium = supportive, low = nice-to-have

Respond ONLY with a valid JSON array.`;
}

export function buildFollowUpEmailPrompt(
  transcript: string,
  client: Client,
  summary: string,
  actionItems: { task: string; priority: string }[]
): string {
  const actionList = actionItems.map((a, i) => `${i + 1}. ${a.task}`).join("\n");

  return `You are writing a follow-up email on behalf of a coach to their client after a coaching session. The email should sound like it's coming from the coach personally — warm, encouraging, and referencing specific moments from the session.

CLIENT: ${client.full_name} (first name: ${client.full_name.split(" ")[0]})

SESSION SUMMARY:
${summary}

ACTION ITEMS:
${actionList}

Write the email body (no subject line, no greeting — those are handled separately). The email should:
1. Open with a warm acknowledgment of a specific moment or achievement from the session
2. Briefly recap 1-2 key insights (don't repeat the whole summary)
3. List the action items naturally in the flow
4. End with encouragement and a forward-looking statement
5. Be 150-300 words
6. Sound human, warm, and personal — NOT like AI
7. Reference at least one specific thing the client said or felt

Respond with ONLY the email body text. No subject line, no "Dear X", no signature.`;
}

export function buildPrepBriefPrompt(
  client: Client,
  recentSessions: { summary: string; action_items: string[]; date: string }[],
  openActionItems: { task: string; completed: boolean; due_date: string | null }[]
): string {
  const sessionsContext = recentSessions.map((s, i) =>
    `Session ${i + 1} (${s.date}): ${s.summary}\nAction items: ${s.action_items.join(", ")}`
  ).join("\n\n");

  const actionsContext = openActionItems.map(a =>
    `- ${a.task} [${a.completed ? "✓ DONE" : "⬜ OPEN"}] ${a.due_date ? `(due: ${a.due_date})` : ""}`
  ).join("\n");

  return `You are preparing a pre-session brief for a coach. This brief helps them walk into the session fully prepared.

CLIENT: ${client.full_name}
COACHING TYPE: ${client.coaching_type || "general"}
GOALS: ${client.goals?.join(", ") || "Not specified"}

RECENT SESSIONS:
${sessionsContext || "No previous sessions"}

OPEN ACTION ITEMS:
${actionsContext || "None"}

Generate a concise prep brief (150-200 words) that includes:
1. Where you left off (last session recap in 1-2 sentences)
2. What to follow up on (open action items, especially overdue ones)
3. Suggested talking points or questions
4. Any patterns or trends you notice
5. Risk flags (if any — missed actions, declining mood, etc.)

Write in direct second person ("Your client...", "Consider asking...").
Keep it scannable and actionable — the coach will read this 10 minutes before the session.

Respond with ONLY the brief text.`;
}

export function buildNudgePrompt(
  client: Client,
  actionItem: { task: string; due_date: string | null },
  daysSinceSession: number
): string {
  return `Write a brief, encouraging nudge message to a coaching client about an action item they committed to.

CLIENT FIRST NAME: ${client.full_name.split(" ")[0]}
ACTION ITEM: ${actionItem.task}
DUE: ${actionItem.due_date || "no specific date"}
DAYS SINCE SESSION: ${daysSinceSession}

Write a 2-3 sentence message that:
- Feels personal and encouraging (not nagging)
- References the specific action item
- Ends with a light, motivating note
- Sounds like a supportive text from their coach

Respond with ONLY the message text.`;
}
