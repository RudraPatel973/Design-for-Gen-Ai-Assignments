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
  const { data: votes } = user ? await supabase.from("caption_votes").select("caption_id, value").eq("user_id", user.id).in("caption_id", captions.map(c => c.id)) : { data: [] };
  const personalVotes = new Map((votes ?? []).map(v => [v.caption_id, v.value]));
  return <main><AccountHeader signedIn={Boolean(user)} /><section className="board caption-board">
    <div className="board-heading"><p className="eyebrow">AI CAPTIONS. HUMAN TASTE. VERY NYC.</p><h1>ONLY IN<br /><span>NEW YORK.</span></h1><p className="board-intro">For the campus chaos and weekend side quests.<br />Find a caption worth posting. Tell the crowd what hits.</p></div>
    <div className="daily-challenge"><div><span className="card-top">TODAY’S MOMENT · {new Date().toISOString().slice(0, 10)} UTC</span><p>{dailyPrompt()}</p></div><Link className="replay" href={user ? "/create" : "/login"}>MAKE YOUR VERSION ↗</Link></div>
    <form className="feed-filters" action="/captions"><label>Category<select name="category" defaultValue={category ?? ""}><option value="">All moments</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label>Show<select name="sort" defaultValue={sort}><option value="new">Freshest</option><option value="top">Most postable</option></select></label><button type="submit">FILTER ↗</button><span>One final vote per caption. Make it count.</span></form>
    {error ? <div className="board-message" role="status"><h2>The feed is getting ready.</h2><p>We couldn’t load captions. Please check back in a moment.</p></div> : !captions.length ? <div className="board-message"><h2>No captions here yet.</h2><p>Be the first to turn a NYC moment into something postable.</p><Link className="replay" href={user ? "/create" : "/login"}>CREATE A CAPTION ↗</Link></div> : <ul className="greeting-list caption-list">{captions.map(c => <li className="greeting-card caption-card" key={c.id}><div className="card-top"><span>{c.category}</span><span>AI GENERATED</span></div><p className="caption-topic">{c.topic}</p><blockquote>{c.caption}</blockquote><div className="caption-score">↑ {c.upvotes} post it · ↓ {c.downvotes} skip it</div>{!user ? <Link className="club-link" href="/login">SIGN IN TO RATE ↗</Link> : personalVotes.has(c.id) ? <p className="your-vote">YOUR VOTE: {personalVotes.get(c.id) === 1 ? "POST IT ↑" : "SKIP IT ↓"}</p> : <VoteForm id={c.id} />}<CopyCaption text={c.caption} /><details className="prompt-details"><summary>Behind the caption</summary><p>Model: {c.model}</p><p>{c.prompt}</p></details></li>)}</ul>}
    <p className="board-signoff">The city writes the setup. You pick the punchline. ↗</p>
  </section></main>;
}
