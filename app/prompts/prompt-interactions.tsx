"use client";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { suggestPrompt, voteSuggestion } from "./actions";
import { categories } from "@/lib/caption-validation";
import { SubmitButton } from "@/components/submit-button";
function SuggestionVoteButtons() {
  const { pending } = useFormStatus();
  return <div className="vote-buttons"><button type="submit" name="value" value="1" disabled={pending} aria-label="Upvote this suggestion">↑ UPVOTE</button><button type="submit" name="value" value="-1" disabled={pending} aria-label="Downvote this suggestion">↓ DOWNVOTE</button></div>;
}
export function SuggestionVoteForm({ id }: { id: string }) {
  const [state, action] = useActionState(voteSuggestion, {});
  return <form action={action}><input type="hidden" name="suggestion_id" value={id} />{state.success ? <p className="your-vote" role="status">✓ {state.success}</p> : <SuggestionVoteButtons />}{state.error && <p role="alert" className="vote-error">{state.error}</p>}</form>;
}
export function SuggestForm() {
  const [topic, setTopic] = useState("");
  const [state, action] = useActionState(async (previous: Awaited<ReturnType<typeof suggestPrompt>>, form: FormData) => {
    const result = await suggestPrompt(previous, form);
    if (result.success) setTopic("");
    return result;
  }, {});
  return <form action={action} className="profile-form suggest-form">
    <label htmlFor="suggestion">Suggest tomorrow’s moment</label>
    <textarea id="suggestion" name="topic" required minLength={10} maxLength={200} rows={3} value={topic} onChange={e => setTopic(e.target.value)} aria-describedby="suggestion-help" placeholder="Example: The first cold morning when everyone on College Walk suddenly owns a puffer." />
    <p id="suggestion-help" className="account-fineprint">{topic.length}/200 · Keep it about a shared moment or place, not a specific person. AI checks each suggestion before it’s posted. Up to 3 a day.</p>
    <label>Category<select name="category" defaultValue="Campus">{categories.map(c => <option key={c}>{c}</option>)}</select></label>
    {state.error && <p role="alert" className="form-message">{state.error}</p>}
    {state.success && <p role="status" className="form-message success">{state.success}</p>}
    <SubmitButton pendingText="CHECKING & POSTING…">SUGGEST IT ↗</SubmitButton>
  </form>;
}
