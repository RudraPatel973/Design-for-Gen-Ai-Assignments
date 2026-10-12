"use client";
import { useActionState } from "react";
import Link from "next/link";
import { createCaption } from "./actions";
import { categories } from "@/lib/caption-validation";
import { SubmitButton } from "@/components/submit-button";
export function GenerationForm({ dailyPrompt }: { dailyPrompt: string }) {
  const [state, action] = useActionState(createCaption, {});
  return <form action={action} className="profile-form">
    <label>The vibe<select name="category" defaultValue="Campus">{categories.map(c => <option key={c}>{c}</option>)}</select></label>
    <label>Your NYC moment<textarea name="topic" required minLength={10} maxLength={400} rows={4} defaultValue={dailyPrompt} /></label>
    <p className="account-fineprint">Your moment, the AI prompt, and the caption will be public. Keep personal information out. Up to 10 attempts per day.</p>
    {state.error && <p role="alert" className="form-message">{state.error}</p>}
    {state.caption && <div className="generated-preview"><p role="status">{state.success}</p><blockquote>{state.caption}</blockquote><Link className="club-link" href="/captions">SEE IT IN THE FEED ↗</Link></div>}
    <SubmitButton pendingText="COOKING UP YOUR CAPTION…">GENERATE & PUBLISH ↗</SubmitButton>
  </form>;
}
