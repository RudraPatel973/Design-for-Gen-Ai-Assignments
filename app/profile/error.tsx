"use client";
export default function ProfileError({ reset }: { reset: () => void }) {
  return <main className="board account-stage"><div className="account-panel"><h2>A little trouble saying hello.</h2><p>We couldn’t load your profile. Please try again.</p><button className="replay" onClick={reset}>TRY AGAIN ↻</button></div></main>;
}
