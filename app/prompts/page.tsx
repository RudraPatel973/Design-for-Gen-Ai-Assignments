import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AccountHeader } from "@/components/account-header";
import { getTodaysPrompt } from "@/lib/todays-prompt";
import { SuggestForm, SuggestionVoteForm } from "./prompt-interactions";
export const metadata = { title: "Pick Tomorrow’s Prompt — Only in NYC" };
type Suggestion = { id: string; topic: string; category: string; created_at: string; upvotes: number; downvotes: number; mine: boolean };
export default async function Prompts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const today = await getTodaysPrompt(supabase);
  const { data, error } = await supabase.rpc("todays_prompt_suggestions");
  const suggestions = (data ?? []) as Suggestion[];
  const { data: votes, error: votesError } = user && suggestions.length ? await supabase.from("prompt_suggestion_votes").select("suggestion_id, value").eq("user_id", user.id).in("suggestion_id", suggestions.map(s => s.id)) : { data: [], error: null };
  const personalVotes = new Map((votes ?? []).map(v => [v.suggestion_id, v.value]));
  const leader = suggestions.find(s => Number(s.upvotes) - Number(s.downvotes) >= 1);
  return <main><AccountHeader signedIn={Boolean(user)} /><section className="board caption-board">
    <div className="feed-intro">
      <div className="board-heading"><p className="eyebrow">YOU SUGGEST → THE CROWD VOTES → EVERYONE CAPTIONS IT.</p><h1>PICK<br /><span>TOMORROW.</span></h1><p className="board-intro">Suggest a campus or city moment. The top-voted suggestion at 8 PM ET (midnight UTC) becomes tomorrow’s prompt for everyone.</p></div>
      <aside className="daily-challenge"><span className="card-top">TODAY’S PROMPT · {today.source === "crowd" ? "PICKED BY THE CROWD" : "STARTER PROMPT"}</span><p>{today.topic}</p><Link href={user ? "/create" : "/login?next=%2Fcreate"}>CAPTION IT ↗</Link><Link href={`/captions?day=${today.day}`}>SEE EVERYONE’S TAKES ↗</Link></aside>
    </div>
    <div className="prompts-layout">
      <div className="account-panel">{user ? <SuggestForm /> : <><h2>Got a moment everyone gets?</h2><p>Sign in with Google to suggest tomorrow’s prompt and vote on others.</p><Link className="replay" href="/login?next=%2Fprompts">SIGN IN TO SUGGEST ↗</Link></>}</div>
      <div>
        <div className="feed-section-heading"><div><p className="eyebrow">VOTING CLOSES AT 8 PM ET</p><h2>Tomorrow’s contenders</h2></div><span>{suggestions.length} {suggestions.length === 1 ? "suggestion" : "suggestions"}</span></div>
        {suggestions.length > 0 && <p className="prompts-leader">{leader ? <>Leading: “{leader.topic}”</> : "No leader yet. A suggestion needs a net score of +1 to win; otherwise tomorrow uses a starter prompt."}</p>}
        {votesError && <div className="board-message" role="alert"><p>We couldn’t load your votes. <Link href="/prompts">Refresh</Link> before voting again.</p></div>}
        {error ? <div className="board-message" role="alert"><h2>Suggestions couldn’t load.</h2><p>Please try again in a moment.</p><Link className="replay" href="/prompts">RETRY ↻</Link></div> : !suggestions.length ? <div className="board-message"><h2>No suggestions yet today.</h2><p>Be first. One upvote from someone else could make it tomorrow’s prompt.</p></div> : <ol className="suggestion-list">{suggestions.map((s, index) => {
          const score = Number(s.upvotes) - Number(s.downvotes);
          const rating = personalVotes.get(s.id);
          return <li className="greeting-card caption-card suggestion-card" key={s.id}>
            <div className="card-top"><span className="category-badge">{s.category}</span><span>#{index + 1} · {score > 0 ? `+${score}` : score}</span></div>
            <blockquote>{s.topic}</blockquote>
            {s.mine ? <p className="your-vote">Your suggestion · ↑ {s.upvotes} / ↓ {s.downvotes}</p> : !user ? <Link className="vote-login" href="/login?next=%2Fprompts">SIGN IN TO VOTE ↗</Link> : votesError ? <p className="your-vote">Votes temporarily unavailable.</p> : rating ? <p className="your-vote" role="status">✓ YOUR VOTE: {rating === 1 ? "UPVOTE ↑" : "DOWNVOTE ↓"}</p> : <SuggestionVoteForm id={s.id} />}
          </li>;
        })}</ol>}
      </div>
    </div>
  </section></main>;
}
