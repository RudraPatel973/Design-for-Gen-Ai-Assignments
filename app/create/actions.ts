"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/profile";
import { captionTone, validateGeneration } from "@/lib/caption-validation";
import { buildPrompt, generateCaption } from "@/lib/ai";
export type GenerationState = { error?: string; success?: string; caption?: string; id?: string };
export async function createCaption(_state: GenerationState, form: FormData): Promise<GenerationState> {
  const { supabase, user } = await requireUser("/create");
  const input = validateGeneration(form.get("topic"), form.get("category"));
  const tone = captionTone(form.get("tone"));
  if (!input || !tone) return { error: "Describe your moment in 10–400 characters and choose a category and tone." };
  if (!process.env.GROQ_API_KEY) return { error: "The caption studio is still getting ready. Please try again later." };
  // An atomic database reservation caps concurrent AI requests at 10 per user/day.
  const { data: requestId, error: limitError } = await supabase.rpc("reserve_caption_generation");
  if (limitError || !requestId) return { error: limitError?.message.includes("daily limit") ? "You’ve reached today’s 10-generation limit. Come back tomorrow." : "The studio couldn’t start your generation. Please try again." };
  const prompt = buildPrompt(input.topic, input.category, tone);
  let generated;
  try { generated = await generateCaption(prompt); }
  catch (error) { return { error: error instanceof Error && error.message === "AI_BUSY" ? "The AI is busy. Try again in a moment." : "The AI couldn’t create a caption. Please try another moment. This attempt counts toward today’s limit." }; }
  const { data: saved, error } = await supabase.from("captions").insert({ creator_id: user.id, request_id: requestId, topic: input.topic, category: input.category, prompt, caption: generated.caption, model: generated.model }).select("id").single();
  if (error || !saved) return { error: "Your caption couldn’t be published. Please try again later." };
  revalidatePath("/captions");
  return { success: "Published! Your caption is ready for the crowd to rate.", caption: generated.caption, id: saved.id };
}
