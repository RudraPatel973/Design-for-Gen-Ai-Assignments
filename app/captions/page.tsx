import Image from "next/image";
import { validMediaPath } from "@/lib/caption-media";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AccountHeader } from "@/components/account-header";
import { categories } from "@/lib/caption-validation";
import { validDay } from "@/lib/daily-prompt";
import { getTodaysPrompt } from "@/lib/todays-prompt";
import { VoteForm, CopyCaption, CaptionAnchor } from "./caption-interactions";
export const metadata = { title: "Only in NYC — AI Captions, Human Taste" };
type Caption = { id: string; topic: string; category: string; caption: string; prompt: string; model: string; created_at: string; media_path?: string | null; prompt_date?: string | null; upvotes: number; downvotes: number };
export default async function Captions({ searchParams }: { searchParams: Promise<{ category?: string; sort?: string; day?: string }> }) {
  const params = await searchParams;
  const category = categories.includes(params.category as typeof categories[number]) ? params.category : null;
  const sort = params.sort === "top" ? "top" : "new";
  const day = validDay(params.day);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const today = await getTodaysPrompt(supabase);
  const { data, error } = await supabase.rpc("caption_prompt_feed", { chosen_category: category, chosen_sort: sort, chosen_day: day });
  const captions = (data ?? []) as Caption[];
  const { data: votes, error: votesError } = user && captions.length ? await supabase.from("caption_votes").select("caption_id, value").eq("user_id", user.id).in("caption_id", captions.map(c => c.id)) : { data: [], error: null };
  const personalVotes = new Map((votes ?? []).map(v => [v.caption_id, v.value]));
  return <main><AccountHeader signedIn={Boolean(user)} /><section className="board caption-board">
    <div className="feed-intro">
      <div className="board-heading"><p className="eyebrow">NYC MOMENTS → AI CAPTIONS → YOUR VOTE.</p><h1>ONLY IN<br /><span>NEW YORK.</span></h1><p className="board-intro">An AI caption playground for everyday New York life.<br />Describe a moment or attach a photo or GIF, and AI writes a caption. Browse the feed, then upvote captions you like or downvote ones that miss.</p><Link className="replay feed-create" href={user ? "/create" : "/login?next=%2Fcreate"}>CREATE A CAPTION ↗</Link><p className="account-fineprint">Browse freely. Sign in with Google to create captions and vote.</p></div>
      <aside className="daily-challenge"><span className="challenge-mark" aria-hidden="true">✳</span><span className="card-top">TODAY’S PROMPT · {today.source === "crowd" ? "PICKED BY THE CROWD" : "STARTER PROMPT"}</span><p>{today.topic}</p><div className="challenge-links"><Link href={user ? "/create" : "/login?next=%2Fcreate"}>CAPTION IT ↗</Link><Link href={`/captions?day=${today.day}`}>SEE EVERYONE’S TAKES ↗</Link><Link href="/prompts">PICK TOMORROW’S ↗</Link></div><small>Everyone captions the same moment each day. Tomorrow’s is chosen by your votes and changes at 8 PM ET.</small></aside>
    </div>
    <div className="feed-section-heading"><div><p className="eyebrow">THE COMMUNITY FEED</p><h2>{day ? (day === today.day ? "Everyone’s take on today’s prompt" : `Everyone’s take on the ${day} prompt`) : sort === "top" ? "The crowd’s favorites" : "Fresh from the city"}</h2>{day === today.day && <p className="feed-day-prompt">“{today.topic}”</p>}</div><span>{captions.length}{captions.length === 60 ? "+" : ""} captions{category ? ` · ${category}` : ""}</span></div>
    <form className="feed-filters" action="/captions"><label>Category<select name="category" defaultValue={category ?? ""}><option value="">All moments</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label>Sort by<select name="sort" defaultValue={sort}><option value="new">Newest first</option><option value="top">Top rated</option></select></label>{day && <input type="hidden" name="day" value={day} />}<button type="submit">APPLY FILTERS ↗</button>{(category || day) && <Link href="/captions">Show all captions</Link>}<p>Upvote what you like. Downvote what misses. One final vote per caption.</p></form>
    {votesError && <div className="board-message" role="alert"><p>We couldn’t load your ratings. <Link href="/captions">Refresh the feed</Link> before voting again.</p></div>}
    {error ? <div className="board-message" role="alert"><h2>The feed couldn’t load.</h2><p>Please try again in a moment.</p><Link className="replay" href="/captions">RETRY ↻</Link></div> : !captions.length ? <div className="board-message"><h2>{day ? "No takes on this prompt yet." : category ? `No ${category.toLowerCase()} moments yet.` : "Be the first to start something."}</h2><p>Turn a NYC moment into a caption for the crowd to rate.</p><Link className="replay" href={user ? "/create" : "/login?next=%2Fcreate"}>CREATE A CAPTION ↗</Link>{(category || day) && <p><Link href="/captions">Browse all captions</Link></p>}</div> : <ul className="greeting-list caption-list">{captions.map(c => {
      const count = Number(c.upvotes) + Number(c.downvotes);
      const rating = personalVotes.get(c.id);
      const mediaUrl = validMediaPath(c.media_path) ? supabase.storage.from("caption-media").getPublicUrl(c.media_path).data.publicUrl : null;
      return <li className="greeting-card caption-card" key={c.id} id={`caption-${c.id}`} tabIndex={-1}>
        <div className="card-top"><span className="category-badge">{c.category}</span>{c.prompt_date ? <Link href={`/captions?day=${c.prompt_date}`} className="prompt-day-link">DAILY PROMPT · {c.prompt_date} ↗</Link> : <span>AI CAPTION</span>}</div>
        {mediaUrl && <a className="caption-media" href={mediaUrl} target="_blank" rel="noopener noreferrer" aria-label="Open attached image or GIF at full size"><Image src={mediaUrl} alt={`Image attached to: ${c.topic}`} width={640} height={480} unoptimized /><span>View full image ↗</span></a>}
        <p className="caption-topic"><span>The moment</span>{c.topic}</p><blockquote>{c.caption}</blockquote>
        <div className="caption-score"><strong>{count ? `${Math.round(Number(c.upvotes) / count * 100)}% upvotes` : "Be the first to rate"}</strong><span>{count} {count === 1 ? "vote" : "votes"} · ↑ {c.upvotes} / ↓ {c.downvotes}</span></div>
        {!user ? <Link className="vote-login" href="/login?next=%2Fcaptions">SIGN IN TO VOTE ↗</Link> : votesError ? <p className="your-vote">Ratings temporarily unavailable.</p> : rating ? <div className="your-vote" role="status">✓ YOUR VOTE: {rating === 1 ? "UPVOTE ↑" : "DOWNVOTE ↓"}<span>Saved to your account</span></div> : <VoteForm id={c.id} />}
        <div className="caption-card-footer"><CopyCaption text={c.caption} /><time dateTime={c.created_at}>{new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}</time></div>
        <details className="prompt-details"><summary>See the AI prompt</summary><p>{c.prompt}</p><p>Generated with {c.model}</p></details>
      </li>;
    })}</ul>}
    <CaptionAnchor /><p className="board-signoff">The city writes the setup. You pick the punchline. ↗</p>
  </section></main>;
}
