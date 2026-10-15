import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { categories, type Category } from "./caption-validation";
import { dailyChallenge, utcDay } from "./daily-prompt";

export type TodaysPrompt = { topic: string; category: Category; day: string; source: "crowd" | "starter"; score?: number };
// Yesterday's top crowd suggestion becomes today's prompt; otherwise use the built-in starter rotation.
export async function getTodaysPrompt(supabase: SupabaseClient, date = new Date()): Promise<TodaysPrompt> {
  const day = utcDay(date);
  const { data } = await supabase.rpc("crowd_prompt_for", { for_day: day });
  const winner = Array.isArray(data) ? data[0] : null;
  if (winner && typeof winner.topic === "string" && categories.includes(winner.category)) return { topic: winner.topic, category: winner.category, day, source: "crowd", score: Number(winner.score) };
  const starter = dailyChallenge(date);
  return { topic: starter.topic, category: starter.category as Category, day, source: "starter" };
}
