import Link from "next/link";
import { requireUser } from "@/lib/profile";
import { AccountHeader } from "@/components/account-header";
export const metadata = { title: "My Captions — Only in NYC" };
type MyCaption = { id: string; topic: string; category: string; caption: string; created_at: string; prompt_date: string | null; upvotes: number; downvotes: number };
const percent = (up: number, total: number) => total ? `${Math.round(up / total * 100)}%` : "—";
export default async function MyCaptions() {
  const { supabase } = await requireUser("/mine");
  const { data, error } = await supabase.rpc("my_caption_stats");
  const captions = ((data ?? []) as MyCaption[]).map(c => ({ ...c, upvotes: Number(c.upvotes), downvotes: Number(c.downvotes) }));
  const up = captions.reduce((sum, c) => sum + c.upvotes, 0);
  const down = captions.reduce((sum, c) => sum + c.downvotes, 0);
  const best = [...captions].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes) || b.upvotes - a.upvotes)[0];
  return <main><AccountHeader signedIn /><section className="board caption-board">
    <div className="board-heading"><p className="eyebrow">HOW THE CROWD RATED YOU.</p><h1>MY<br /><span>CAPTIONS.</span></h1></div>
    {error ? <div className="board-message" role="alert"><h2>Your stats couldn’t load.</h2><p>Please try again in a moment.</p><Link className="replay" href="/mine">RETRY ↻</Link></div> : !captions.length ? <div className="board-message"><h2>No captions yet.</h2><p>Publish one and come back to see how the crowd votes.</p><Link className="replay" href="/create">CREATE A CAPTION ↗</Link></div> : <>
      <dl className="stats-row">
        <div><dt>Captions</dt><dd>{captions.length}</dd></div>
        <div><dt>Upvotes</dt><dd>↑ {up}</dd></div>
        <div><dt>Downvotes</dt><dd>↓ {down}</dd></div>
        <div><dt>Approval</dt><dd>{percent(up, up + down)}</dd></div>
      </dl>
      {best && best.upvotes > 0 && <div className="daily-challenge best-caption"><span className="card-top">YOUR BEST SO FAR · ↑ {best.upvotes} / ↓ {best.downvotes}</span><p>{best.caption}</p><Link href={`/captions#caption-${best.id}`}>VIEW IN FEED ↗</Link></div>}
      <div className="feed-section-heading"><div><p className="eyebrow">NEWEST FIRST</p><h2>Everything you’ve posted</h2></div></div>
      <ul className="greeting-list caption-list mine-list">{captions.map(c => {
        const total = c.upvotes + c.downvotes;
        return <li className="greeting-card caption-card" key={c.id}>
          <div className="card-top"><span className="category-badge">{c.category}</span><span>{c.prompt_date ? `DAILY PROMPT · ${c.prompt_date}` : "YOUR OWN MOMENT"}</span></div>
          <p className="caption-topic"><span>The moment</span>{c.topic}</p><blockquote>{c.caption}</blockquote>
          <div className="caption-score"><strong>{total ? `${percent(c.upvotes, total)} upvotes` : "No votes yet"}</strong><span>{total} {total === 1 ? "vote" : "votes"} · ↑ {c.upvotes} / ↓ {c.downvotes}</span></div>
          <div className="caption-card-footer"><Link className="club-link" href={c.prompt_date ? `/captions?day=${c.prompt_date}#caption-${c.id}` : `/captions#caption-${c.id}`}>{c.prompt_date ? "COMPARE WITH OTHERS’ TAKES ↗" : "VIEW IN FEED ↗"}</Link><time dateTime={c.created_at}>{new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}</time></div>
        </li>;
      })}</ul>
    </>}
  </section></main>;
}
