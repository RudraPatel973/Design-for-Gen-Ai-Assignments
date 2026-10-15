"use client";
import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { createCaption } from "./actions";
import { captionMediaTypes, maxCaptionMediaBytes } from "@/lib/caption-media";
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
  const mediaInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState("");
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  return <form action={action} onReset={event => event.preventDefault()} className="profile-form generation-form">
    <div className="name-fields"><label>The vibe<select name="category" value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
    <label>Your tone<select name="tone" value={tone} onChange={e => setTone(e.target.value)}>{tones.map(t => <option key={t}>{t}</option>)}</select></label></div>
    <div className="media-upload">
      <label htmlFor="caption-media">Add a photo, meme, or GIF <span className="optional">(optional)</span></label>
      <input id="caption-media" name="media" ref={mediaInput} type="file" accept={captionMediaTypes.join(",")} aria-describedby="media-help" onChange={event => {
        const file = event.target.files?.[0];
        setMediaError("");
        if (file && (file.size > maxCaptionMediaBytes || !captionMediaTypes.includes(file.type))) {
          setMediaError("Choose a JPEG, PNG, WebP, or GIF smaller than 3 MB.");
          event.target.value = ""; setPreview(null); return;
        }
        setPreview(file ? URL.createObjectURL(file) : null);
      }} />
      <p id="media-help" className="account-fineprint">JPEG, PNG, WebP, or animated GIF · up to 3 MB. Published attachments are public.</p>
      {mediaError && <p role="alert" className="form-message">{mediaError}</p>}
      {preview && <div className="media-preview"><Image src={preview} alt="Your selected attachment" width={640} height={480} unoptimized /><button type="button" onClick={() => {if (mediaInput.current) mediaInput.current.value = "";setPreview(null);}}>Remove attachment ×</button></div>}
    </div>
    <label htmlFor="moment">Describe the image or your NYC moment</label><textarea id="moment" name="topic" required minLength={10} maxLength={400} rows={4} value={topic} onChange={e => setTopic(e.target.value)} aria-describedby="moment-help" />
    <div className="moment-tools"><span id="moment-help">{topic.length}/400 characters · at least 10</span><button type="button" onClick={() => {setTopic(dailyPrompt);setCategory(dailyCategory);}}>Use today’s moment</button><button type="button" onClick={() => setTopic("")}>Write my own</button></div>
    <p className="account-fineprint">Generates and publishes one caption. AI writes from your description, so describe what’s in the attachment. Your moment, prompt, and attachment will be public. Up to 10 attempts per UTC day.</p>
    {state.error && <p role="alert" className="form-message">{state.error} Your moment is kept here so you can retry.</p>}
    {state.caption && <div className="generated-preview"><p role="status">{state.success}</p><blockquote>{state.caption}</blockquote><CopyCaption text={state.caption} /><Link className="club-link" href={`/captions#caption-${state.id}`}>VIEW YOUR CAPTION & RATINGS ↗</Link></div>}
    <GenerationProgress /><SubmitButton pendingText="GENERATING & PUBLISHING…">GENERATE & PUBLISH ↗</SubmitButton>
  </form>;
}
