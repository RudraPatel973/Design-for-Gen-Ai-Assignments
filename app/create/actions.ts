"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/profile";
import { captionTone, validateGeneration } from "@/lib/caption-validation";
import { captionMediaExtension, maxCaptionMediaBytes } from "@/lib/caption-media";
import { buildPrompt, generateCaption } from "@/lib/ai";
export type GenerationState = { error?: string; success?: string; caption?: string; id?: string };
export async function createCaption(_state: GenerationState, form: FormData): Promise<GenerationState> {
  const { supabase, user } = await requireUser("/create");
  const input = validateGeneration(form.get("topic"), form.get("category"));
  const tone = captionTone(form.get("tone"));
  if (!input || !tone) return { error: "Describe your moment in 10–400 characters and choose a category and tone." };
  if (!process.env.GROQ_API_KEY) return { error: "The caption studio is still getting ready. Please try again later." };
  const media = form.get("media");
  let attachment: { bytes: Uint8Array; extension: string; type: string } | null = null;
  if (media instanceof File && media.size > 0) {
    if (media.size > maxCaptionMediaBytes) return { error: "Choose an image or GIF smaller than 3 MB." };
    const bytes = new Uint8Array(await media.arrayBuffer());
    const extension = captionMediaExtension(bytes, media.type);
    if (!extension) return { error: "Choose a valid JPEG, PNG, WebP, or GIF file." };
    attachment = { bytes, extension, type: media.type };
  }
  // An atomic database reservation caps concurrent AI requests at 10 per user/day.
  const { data: requestId, error: limitError } = await supabase.rpc("reserve_caption_generation");
  if (limitError || !requestId) return { error: limitError?.message.includes("daily limit") ? "You’ve reached today’s 10-generation limit. Come back tomorrow." : "The studio couldn’t start your generation. Please try again." };
  const prompt = buildPrompt(input.topic, input.category, tone);
  let generated;
  try { generated = await generateCaption(prompt); }
  catch (error) { return { error: error instanceof Error && error.message === "AI_BUSY" ? "The AI is busy. Try again in a moment." : "The AI couldn’t create a caption. Please try another moment. This attempt counts toward today’s limit." }; }
  let mediaPath: string | null = null;
  if (attachment) {
    mediaPath = `${user.id}/${crypto.randomUUID()}.${attachment.extension}`;
    const { error: uploadError } = await supabase.storage.from("caption-media")
      .upload(mediaPath, attachment.bytes, { contentType: attachment.type, upsert: false });
    if (uploadError) return { error: "Your caption was generated, but the attachment couldn’t be uploaded. Please try again." };
  }
  const { data: saved, error } = await supabase.from("captions").insert({ creator_id: user.id, request_id: requestId, topic: input.topic, category: input.category, prompt, caption: generated.caption, model: generated.model, ...(mediaPath ? { media_path: mediaPath } : {}) }).select("id").single();
  if (error || !saved) {
    if (mediaPath) await supabase.storage.from("caption-media").remove([mediaPath]);
    return { error: "Your caption couldn’t be published. Please try again later." };
  }
  revalidatePath("/captions");
  return { success: "Published! Your caption is ready for the crowd to rate.", caption: generated.caption, id: saved.id };
}
