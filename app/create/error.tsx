"use client";
import Link from "next/link";
export default function StudioError({ reset }: { reset: () => void }) {
  return <main className="board"><div className="board-message" role="alert"><h2>The studio hit a snag.</h2><p>Please reload to try again.</p><button className="replay" onClick={reset}>TRY AGAIN ↻</button><p><Link href="/captions">Browse captions instead</Link></p></div></main>;
}
