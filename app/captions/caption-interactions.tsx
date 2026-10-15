"use client";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { vote } from "./actions";
function VoteButtons() {
  const { pending } = useFormStatus();
  return <><div className="vote-buttons"><button type="submit" name="value" value="1" disabled={pending} aria-label="Rate this caption: I would post it">↑ POST IT</button><button type="submit" name="value" value="-1" disabled={pending} aria-label="Rate this caption: I would skip it">↓ SKIP IT</button></div>{pending && <p role="status" className="vote-pending">Saving your vote…</p>}</>;
}
export function VoteForm({ id }: { id: string }) {
  const [state, action] = useActionState(vote, {});
  return <form action={action}><input type="hidden" name="caption_id" value={id} />{state.success ? <p className="your-vote" role="status">✓ {state.success}</p> : <VoteButtons />}{state.error && <p role="alert" className="vote-error">{state.error}</p>}</form>;
}
export function CopyCaption({ text }: { text: string }) {
  const [message, setMessage] = useState("COPY CAPTION ↗");
  return <button type="button" className="copy-caption" onClick={async () => {try {await navigator.clipboard.writeText(text);setMessage("COPIED ✓");}catch {setMessage("SELECT TEXT TO COPY");}}} aria-live="polite">{message}</button>;
}
