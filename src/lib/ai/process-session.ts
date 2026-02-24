import Anthropic from "@anthropic-ai/sdk";
import { Client } from "@/lib/supabase/types";
import {
  buildSessionSummaryPrompt,
  buildActionItemsPrompt,
  buildFollowUpEmailPrompt,
} from "./prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

async function callClaude(prompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });
  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

export interface ProcessedSession {
  summary: string;
  summary_structured: {
    overview: string;
    key_themes: string[];
    breakthroughs: string[];
    concerns: string[];
    coaching_techniques_used: string[];
  };
  mood_score: number;
  energy_score: number;
  engagement_score: number;
  breakthrough_flagged: boolean;
  action_items: {
    task: string;
    priority: "high" | "medium" | "low";
    due_date_suggestion: string;
  }[];
  followup_email_body: string;
}

export async function processSession(
  transcript: string,
  client: Client,
  sessionNumber: number
): Promise<ProcessedSession> {
  // Step 1: Generate summary + scores
  const summaryRaw = await callClaude(
    buildSessionSummaryPrompt(transcript, client, sessionNumber)
  );
  let summaryData;
  try {
    summaryData = JSON.parse(summaryRaw.replace(/```json\n?|```/g, "").trim());
  } catch {
    summaryData = {
      summary: summaryRaw,
      summary_structured: { overview: summaryRaw, key_themes: [], breakthroughs: [], concerns: [], coaching_techniques_used: [] },
      mood_score: 50,
      energy_score: 50,
      engagement_score: 50,
      breakthrough_flagged: false,
    };
  }

  // Step 2: Extract action items
  const actionsRaw = await callClaude(
    buildActionItemsPrompt(transcript, client)
  );
  let actionItems;
  try {
    actionItems = JSON.parse(actionsRaw.replace(/```json\n?|```/g, "").trim());
  } catch {
    actionItems = [];
  }

  // Step 3: Generate follow-up email
  const followupEmail = await callClaude(
    buildFollowUpEmailPrompt(
      transcript,
      client,
      summaryData.summary,
      actionItems
    )
  );

  return {
    summary: summaryData.summary,
    summary_structured: summaryData.summary_structured,
    mood_score: summaryData.mood_score,
    energy_score: summaryData.energy_score,
    engagement_score: summaryData.engagement_score,
    breakthrough_flagged: summaryData.breakthrough_flagged,
    action_items: actionItems,
    followup_email_body: followupEmail,
  };
}
