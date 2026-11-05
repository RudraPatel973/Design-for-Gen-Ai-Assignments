import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildPrompt, callChatJson, callChatText } from "./ai";
import { parseCaption } from "./caption-validation";
import { fillTemplate, pickWeighted } from "./chain-template";

type Step = { id: number; step_order: number; description: string; system_prompt: string; user_prompt: string; temperature: number; output_type: "text" | "caption"; input_image: boolean;
  model: { provider_model_id: string; is_active: boolean; provider: { name: string; base_url: string; api_key_env: string } } };
type Chain = { id: number; name: string; description: string; steps: Step[] };
export type ChainResult = { caption: string; model: string; prompt: string; chainId: number | null; tone: string };
type Context = { supabase: SupabaseClient; userId: string; requestId: string; topic: string; category: string; tone: string; image?: string };

// "Surprise me" picks a chain using the admin-managed mix weights.
async function resolveTone(supabase: SupabaseClient, tone: string) {
  if (tone !== "Surprise me") return tone;
  const { data } = await supabase.from("prompt_chain_mix").select("weight, chain:prompt_chains(name, is_active)");
  const options = (data ?? []).flatMap(row => {
    const chain = (Array.isArray(row.chain) ? row.chain[0] : row.chain) as { name: string; is_active: boolean } | null;
    return chain?.is_active ? [{ value: chain.name, weight: row.weight }] : [];
  });
  return pickWeighted(options, Math.random()) ?? "Dry wit";
}

async function loadChain(supabase: SupabaseClient, tone: string): Promise<Chain | null> {
  const { data } = await supabase.from("prompt_chains")
    .select("id, name, description, steps:prompt_chain_steps(id, step_order, description, system_prompt, user_prompt, temperature, output_type, input_image, model:llm_models(provider_model_id, is_active, provider:llm_providers(name, base_url, api_key_env)))")
    .eq("name", tone).eq("is_active", true).maybeSingle();
  if (!data) return null;
  const one = <T,>(value: T | T[]) => (Array.isArray(value) ? value[0] : value);
  const steps = ((data.steps ?? []) as unknown as Step[]).map(s => {
    const model = one(s.model as unknown as Step["model"] | Step["model"][]);
    return { ...s, temperature: Number(s.temperature), model: model ? { ...model, provider: one(model.provider as unknown as Step["model"]["provider"] | Step["model"]["provider"][]) } : model };
  }).sort((a, b) => a.step_order - b.step_order);
  // A usable chain ends in a caption step and every step has an active model with a provider.
  if (!steps.length || steps.at(-1)?.output_type !== "caption" || steps.some(s => !s.model?.is_active || !s.model.provider)) return null;
  return { id: data.id, name: data.name, description: data.description, steps };
}

async function promptContext(supabase: SupabaseClient, category: string) {
  const [{ data: terms }, { data: examples }] = await Promise.all([
    supabase.from("terms").select("term, definition").order("priority", { ascending: false }).limit(12),
    supabase.from("caption_examples").select("moment, category, caption").order("priority", { ascending: false }).limit(12),
  ]);
  const picked = [...(examples ?? [])].sort((a, b) => Number(b.category === category) - Number(a.category === category)).slice(0, 4);
  return {
    terms: (terms ?? []).map(t => `- ${t.term}: ${t.definition}`).join("\n") || "(none)",
    examples: picked.map(e => `- Moment: ${e.moment}\n  Caption: ${e.caption}`).join("\n") || "(none)",
  };
}

async function log(ctx: Context, row: Record<string, unknown>) {
  // Logging must never break caption generation.
  await ctx.supabase.from("llm_responses").insert({ user_id: ctx.userId, request_id: ctx.requestId, ...row }).then(() => undefined, () => undefined);
}
const cut = (text: string, max: number) => text.length > max ? text.slice(0, max) : text;

export async function runCaptionChain(ctx: Context): Promise<ChainResult> {
  const tone = await resolveTone(ctx.supabase, ctx.tone);
  const chain = await loadChain(ctx.supabase, tone);
  if (chain) {
    const context = await promptContext(ctx.supabase, ctx.category);
    let previous = "";
    try {
      for (const step of chain.steps) {
        const values = { moment: JSON.stringify(ctx.topic), category: ctx.category, tone, previous_output: previous || "(none)", terms: context.terms, examples: context.examples };
        const system = fillTemplate(step.system_prompt, values), user = fillTemplate(step.user_prompt, values);
        const provider = step.model.provider;
        const started = Date.now();
        try {
          const call = { baseUrl: provider.base_url, apiKey: process.env[provider.api_key_env], model: step.model.provider_model_id, system, user, temperature: step.temperature, image: step.input_image ? ctx.image : undefined };
          const output = step.output_type === "caption" ? parseCaption(await callChatJson(call)) : await callChatText(call);
          await log(ctx, { chain_id: chain.id, step_id: step.id, step_order: step.step_order, model: `${provider.name}/${step.model.provider_model_id}`, temperature: step.temperature, system_prompt: cut(system, 8000), user_prompt: cut(user, 12000), response: cut(output, 12000), status: "ok", duration_ms: Date.now() - started });
          previous = output;
          if (step.output_type === "caption") return { caption: output, model: `${provider.name.toLowerCase()}/${step.model.provider_model_id}`, prompt: cut(`[${chain.name} chain, step ${step.step_order}]\n${user}`, 4000), chainId: chain.id, tone };
        } catch (error) {
          await log(ctx, { chain_id: chain.id, step_id: step.id, step_order: step.step_order, model: `${provider.name}/${step.model.provider_model_id}`, temperature: step.temperature, system_prompt: cut(system, 8000), user_prompt: cut(user, 12000), response: error instanceof Error ? error.message : "Unknown error", status: "error", duration_ms: Date.now() - started });
          throw error;
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message === "AI_BUSY") throw error;
    }
  }
  // Missing, misconfigured, or failing chain: use the original single prompt so the studio keeps working.
  const prompt = buildPrompt(ctx.topic, ctx.category, tone);
  const started = Date.now();
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
  try {
    const caption = parseCaption(await callChatJson({ baseUrl: "https://api.groq.com/openai/v1", apiKey: process.env.GROQ_API_KEY, model, system: "", user: prompt, temperature: 0.8 }));
    await log(ctx, { model: `Groq/${model}`, temperature: 0.8, user_prompt: cut(prompt, 12000), response: caption, status: "fallback", duration_ms: Date.now() - started });
    return { caption, model: `groq/${model}`, prompt, chainId: null, tone };
  } catch (error) {
    await log(ctx, { model: `Groq/${model}`, temperature: 0.8, user_prompt: cut(prompt, 12000), response: error instanceof Error ? error.message : "Unknown error", status: "error", duration_ms: Date.now() - started });
    throw error;
  }
}
