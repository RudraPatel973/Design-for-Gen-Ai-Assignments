import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AccountHeader } from "@/components/account-header";
import { categories } from "@/lib/caption-validation";
import { dailyPrompt } from "@/lib/daily-prompt";
import { VoteForm, CopyCaption } from "./caption-interactions";
export const metadata = { title: "Only in NYC — AI Captions, Human Taste" };
type Caption = { id: string; topic: string; category: string; caption: string; prompt: string; model: string; created_at: string; upvotes: number; downvotes: number };
export default async function Captions({ searchParams }: { searchParams: Promise<{ category?: string; sort?: string }> }) {
  const params = await searchParams;
  const category = categories.includes(params.category as typeof categories[number]) ? params.category : null;
  const sort = params.sort === "top" ? "top" : "new";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.rpc("caption_feed", { chosen_category: category, chosen_sort: sort });
  const captions = (data ?? []) as Caption[];
  const { data: votes, error: votesError } = user && captions.length ? await supabase.from("caption_votes").select("caption_id, value").eq("user_id", user.id).in("caption_id", captions.map(c => c.id)) : { data: [], error: null };
  const personalVotes = new Map((votes ?? []).map(v => [v.caption_id, v.value]));
  return <main><AccountHeader signedIn={Boolean(user)} /><section className="board caption-board">
    <div className="feed-intro">
      <div className="board-heading"><p className="eyebrow">AI CAPTIONS. HUMAN TASTE. VERY NYC.</p><h1>ONLY IN<br /><span>NEW YORK.</span></h1><p className="board-intro">Find your next caption. Vote on what hits.<br />Make a moment of your own.</p><Link className="replay feed-create" href={user ? "/create" : "/login?next=%2Fcreate"}>CREATE A CAPTION ↗</Link></div>
      <aside className="daily-challenge"><span className="challenge-mark" aria-hidden="true">✳</span><span className="card-top">TODAY’S MOMENT · {new Date().toISOString().slice(0, 10)}</span><p>{dailyPrompt()}</p><Link href={user ? "/create" : "/login?next=%2Fcreate"}>TRY TODAY’S PROMPT ↗</Link><small>A fresh starting point every day, at midnight UTC.</small></aside>
    </div>
    <div className="feed-section-heading"><div><p className="eyebrow">THE COMMUNITY FEED</p><h2>{sort === "top" ? "The crowd’s favorites" : "Fresh from the city"}</h2></div><span>{captions.length}{captions.length === 60 ? "+" : ""} captions{category ? ` · ${category}` : ""}</span></div>
    <form className="feed-filters" action="/captions"><label>Category<select name="category" defaultValue={category ?? ""}><option value="">All moments</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label>Sort by<select name="sort" defaultValue={sort}><option value="new">Newest first</option><option value="top">Most postable</option></select></label><button type="submit">APPLY FILTERS ↗</button>{category && <Link href="/captions">Clear filters</Link>}<p>Would you post it? One final vote per caption.</p></form>
    {votesError && <div className="board-message" role="alert"><p>We couldn’t load your ratings. <Link href="/captions">Refresh the feed</Link> before voting again.</p></div>}
    {error ? <div className="board-message" role="alert"><h2>The feed couldn’t load.</h2><p>Please try again in a moment.</p><Link className="replay" href="/captions">RETRY ↻</Link></div> : !captions.length ? <div className="board-message"><h2>{category ? `No ${category.toLowerCase()} moments yet.` : "Be the first to start something."}</h2><p>Turn a NYC moment into a caption for the crowd to rate.</p><Link className="replay" href={user ? "/create" : "/login?next=%2Fcreate"}>CREATE A CAPTION ↗</Link>{category && <p><Link href="/captions">Browse all categories</Link></p>}</div> : <ul className="greeting-list caption-list">{captions.map(c => {
      const count = Number(c.upvotes) + Number(c.downvotes);
      const rating = personalVotes.get(c.id);
      return <li className="greeting-card caption-card" key={c.id} id={`caption-${c.id}`} tabIndex={-1}>
        <div className="card-top"><span className="category-badge">{c.category}</span><span>AI GENERATED</span></div>
        <p className="caption-topic"><span>The moment</span>{c.topic}</p><blockquote>{c.caption}</blockquote>
        <div className="caption-score"><strong>{count ? `${Math.round(Number(c.upvotes) / count * 100)}% would post` : "Be the first to rate"}</strong><span>{count} {count === 1 ? "vote" : "votes"} · ↑ {c.upvotes} / ↓ {c.downvotes}</span></div>
        {!user ? <Link className="vote-login" href="/login?next=%2Fcaptions">SIGN IN TO RATE ↗</Link> : votesError ? <p className="your-vote">Ratings temporarily unavailable.</p> : rating ? <div className="your-vote" role="status">✓ YOUR VOTE: {rating === 1 ? "POST IT ↑" : "SKIP IT ↓"}<span>Saved to your account</span></div> : <VoteForm id={c.id} />}
        <div className="caption-card-footer"><CopyCaption text={c.caption} /><time dateTime={c.created_at}>{new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}</time></div>
        <details className="prompt-details"><summary>See the AI prompt</summary><p>{c.prompt}</p><p>Generated with {c.model}</p></details>
      </li>;
    })}</ul>}
    <p className="board-signoff">The city writes the setup. You pick the punchline. ↗</p>
  </section></main>;
}
