"use client";
import { useActionState } from "react";
import { saveProfile } from "./actions";
import { SubmitButton } from "@/components/submit-button";

export function ProfileForm({ firstName, lastName }: { firstName: string; lastName: string }) {
  const [state, action] = useActionState(saveProfile, {});
  return <form action={action} className="profile-form">
    <div className="name-fields"><label>First name<input name="first_name" autoComplete="given-name" defaultValue={firstName} required maxLength={80} /></label><label>Last name<input name="last_name" autoComplete="family-name" defaultValue={lastName} required maxLength={80} /></label></div>
    <label>Profile photo <span className="optional">(optional)</span><input name="photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="photo-help" /></label>
    <p id="photo-help" className="account-fineprint">JPEG, PNG, or WebP. Maximum 2 MB. Leave blank to keep your current photo.</p>
    {state.error && <p className="form-message" role="alert">{state.error}</p>}
    {state.success && <p className="form-message success" role="status">{state.success}</p>}
    <SubmitButton pendingText="SAVING YOUR PROFILE…">SAVE MY PROFILE ↗</SubmitButton>
  </form>;
}
