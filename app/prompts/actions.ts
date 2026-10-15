"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/profile";
import { validateSuggestion, validateVote } from "@/lib/caption-validation";
import { screenSuggestion } from "@/lib/ai";
export type SuggestState = { error?: string; success?: string };
export async function suggestPrompt(_state: SuggestState, form: FormData): Promise<SuggestState> {
  const { supabase, user } = await requireUser("/prompts");
  const input = validateSuggestion(form.get("topic"), form.get("category"));
  if (!input) return { error: "Describe a moment in 10–200 characters and choose a category." };
  if (!process.env.GROQ_API_KEY) return { error: "Suggestions are still getting ready. Please try again later." };
  let allowed;
  try { allowed = await screenSuggestion(input.topic); }
  catch { return { error: "We couldn’t check your suggestion right now. Please try again in a moment." }; }
  if (!allowed) return { error: "This one can’t become a daily prompt. Keep it about a shared moment or place, not a specific person, incident, or rumor." };
  const { error } = await supabase.from("prompt_suggestions").insert({ author_id: user.id, topic: input.topic, category: input.category });
  if (error) return { error: error.code === "42501" ? "You’ve made today’s 3 suggestions. Vote on the others!" : "Your suggestion couldn’t be saved. Please try again." };
  revalidatePath("/prompts");
  return { success: "Suggested! If it’s the crowd’s top pick at 8 PM ET, it becomes tomorrow’s prompt." };
}
export type SuggestionVoteState = { error?: string; success?: string };
export async function voteSuggestion(_state: SuggestionVoteState, form: FormData): Promise<SuggestionVoteState> {
  const { supabase, user } = await requireUser("/prompts");
  const id = form.get("suggestion_id");
  const value = form.get("value");
  if (!validateVote(id, value)) return { error: "Please choose a valid suggestion and vote." };
  const { error } = await supabase.from("prompt_suggestion_votes").insert({ suggestion_id: id, user_id: user.id, value: Number(value) });
  if (error) return { error: error.code === "23505" ? "You’ve already voted on this one." : error.code === "42501" ? "Voting on this suggestion has closed." : "Your vote couldn’t be saved. Please try again." };
  revalidatePath("/prompts");
  return { success: "Vote counted." };
}
