import { requireUser } from "@/lib/profile";
import { AccountHeader } from "@/components/account-header";
import { GenerationForm } from "./generation-form";
import { dailyPrompt } from "@/lib/daily-prompt";
export const metadata = { title: "Caption Studio — Only in NYC" };
export default async function Create() {
  await requireUser();
  return <main><AccountHeader signedIn /><section className="board account-stage"><div className="board-heading"><p className="eyebrow">YOUR MOMENT. AI’S PUNCHLINE.</p><h1>MAKE IT<br /><span>POSTABLE.</span></h1><p className="board-intro">Campus chaos. Subway lore. Weekend side quests.<br />Turn your everyday NYC moment into a caption.</p></div><div className="account-panel"><h2>The caption studio</h2><p>Start with today’s prompt or write your own moment.</p><GenerationForm dailyPrompt={dailyPrompt()} /></div></section></main>;
}
