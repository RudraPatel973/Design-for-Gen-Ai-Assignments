"use client";
import Link from "next/link";
export default function FeedError({ reset }: { reset: () => void }) {
  return <main className="board"><div className="board-message" role="alert"><h2>A small detour.</h2><p>We couldn’t load this page. Please try reloading the feed.</p><button className="replay" onClick={reset}>TRY AGAIN ↻</button><p><Link href="/">Back home</Link></p></div></main>;
}
