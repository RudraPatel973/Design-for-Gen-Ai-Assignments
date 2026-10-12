"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/profile";
import { validateVote } from "@/lib/caption-validation";
export type VoteState = { error?: string; success?: string };
export async function vote(_state: VoteState, form: FormData): Promise<VoteState> {
  const { supabase, user } = await requireUser();
  const id = form.get("caption_id");
  const value = form.get("value");
  if (!validateVote(id, value)) return { error: "Please choose a valid caption and vote." };
  const { error } = await supabase.from("caption_votes").insert({ caption_id: id, user_id: user.id, value: Number(value) });
  if (error) return { error: error.code === "23505" ? "You’ve already rated this caption." : "Your vote couldn’t be saved. Please try again." };
  revalidatePath("/captions");
  return { success: "Vote saved. Thanks for shaping the feed!" };
}
