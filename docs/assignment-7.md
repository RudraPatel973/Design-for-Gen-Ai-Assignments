# Week 7: Admin panel with more observability

Everything stays in the caption app's own Supabase project. `supabase/migrations/202611020001_ai_system.sql` (applied Nov 2, 2026) moves the app's AI setup into the database so the admin panel can manage and observe it.

| Assignment item | In Only in NYC | Admin access |
|---|---|---|
| Users | `profiles` | Read |
| Prompt chains / steps | `prompt_chains` (one per tone), `prompt_chain_steps` (find details → write caption) | Read |
| Prompt chain mix | `prompt_chain_mix`: weights for the studio's new “Surprise me” tone | Read, update |
| Terms | `terms`: NYC glossary injected into step 1 | CRUD |
| AI-generated media | `captions` + `images` | Read/view |
| Generation requests | `caption_generation_requests` | Read |
| Generation examples | `caption_examples`: style examples injected into the caption step | CRUD |
| LLM models / providers | `llm_models`, `llm_providers` (keys stay in env vars) | CRUD |
| LLM responses | `llm_responses`: every AI call with prompts, output, timing, status | Read |
| Signup domains / whitelist | `allowed_signup_domains`, `whitelisted_emails`: enforced at caption-app sign-in | CRUD |
| Images | `images` library over the `caption-media` bucket, including uploads | CRUD + upload |

How generation works now: the studio loads the chosen tone's chain, runs each step through its model, and logs every call. If a chain is missing, misconfigured, or fails, it falls back to the original built-in prompt (logged as `fallback`), so an admin edit can't take the studio down.

Sign-in: `columbia.edu` and `barnard.edu` are allowed; other addresses need the whitelist. Superadmins always pass, and empty lists allow everyone.

Checks: `npm run lint`, `npm test`, `npm run build`. Database policies were verified in a rolled-back transaction, and the seeded chain was run against Groq.
