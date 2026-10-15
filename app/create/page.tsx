import { requireUser } from "@/lib/profile";
import { getTodaysPrompt } from "@/lib/todays-prompt";
import { AccountHeader } from "@/components/account-header";
import { GenerationForm } from "./generation-form";
export const metadata = { title: "Caption Studio — Only in NYC" };
export default async function Create() {
  const { supabase } = await requireUser("/create");
  const today = await getTodaysPrompt(supabase);
  return <main><AccountHeader signedIn /><section className="board account-stage"><div className="board-heading"><p className="eyebrow">YOUR MOMENT. AI’S PUNCHLINE.</p><h1>MAKE IT<br /><span>POSTABLE.</span></h1><p className="board-intro">Campus chaos. Subway lore. Weekend side quests.<br />Turn your everyday NYC moment into a caption.</p></div><div className="account-panel"><h2>The caption studio</h2><p>Choose a moment below. AI will write a caption, then publish it to the feed for people to vote on.</p><GenerationForm dailyPrompt={today.topic} dailyCategory={today.category} promptDay={today.day} crowdPicked={today.source === "crowd"} /></div></section></main>;
}
