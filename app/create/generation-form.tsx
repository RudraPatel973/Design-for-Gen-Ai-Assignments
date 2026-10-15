"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { createCaption } from "./actions";
import { categories, tones } from "@/lib/caption-validation";
import { CopyCaption } from "@/app/captions/caption-interactions";
import { SubmitButton } from "@/components/submit-button";
function GenerationProgress() {
  const { pending } = useFormStatus();
  return pending ? <p className="generation-progress" role="status">Writing your caption… This may take a few seconds.</p> : null;
}
export function GenerationForm({ dailyPrompt, dailyCategory }: { dailyPrompt: string; dailyCategory: string }) {
  const [state, action] = useActionState(createCaption, {});
  const [topic, setTopic] = useState(dailyPrompt);
  const [category, setCategory] = useState(dailyCategory);
  const [tone, setTone] = useState("Dry wit");
  return <form action={action} onReset={event => event.preventDefault()} className="profile-form generation-form">
    <div className="name-fields"><label>The vibe<select name="category" value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
    <label>Your tone<select name="tone" value={tone} onChange={e => setTone(e.target.value)}>{tones.map(t => <option key={t}>{t}</option>)}</select></label></div>
    <label htmlFor="moment">Your NYC moment</label><textarea id="moment" name="topic" required minLength={10} maxLength={400} rows={4} value={topic} onChange={e => setTopic(e.target.value)} aria-describedby="moment-help" />
    <div className="moment-tools"><span id="moment-help">{topic.length}/400 characters · at least 10</span><button type="button" onClick={() => {setTopic(dailyPrompt);setCategory(dailyCategory);}}>Use today’s moment</button><button type="button" onClick={() => setTopic("")}>Write my own</button></div>
    <p className="account-fineprint">Generates and publishes one caption. Your moment and prompt will be public. Up to 10 attempts per UTC day.</p>
    {state.error && <p role="alert" className="form-message">{state.error} Your moment is kept here so you can retry.</p>}
    {state.caption && <div className="generated-preview"><p role="status">{state.success}</p><blockquote>{state.caption}</blockquote><CopyCaption text={state.caption} /><Link className="club-link" href={`/captions#caption-${state.id}`}>VIEW YOUR CAPTION & RATINGS ↗</Link></div>}
    <GenerationProgress /><SubmitButton pendingText="GENERATING & PUBLISHING…">GENERATE & PUBLISH ↗</SubmitButton>
  </form>;
}
