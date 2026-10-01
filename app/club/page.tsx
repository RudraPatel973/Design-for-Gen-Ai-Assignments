import Link from "next/link";
import { getProfile, isComplete } from "@/lib/profile";
import { redirect } from "next/navigation";
import { AccountHeader } from "@/components/account-header";

export const metadata = { title: "Hello Club — Members Only" };
export default async function Club() {
  const { profile, error } = await getProfile();
  if (error || !isComplete(profile)) redirect("/profile");
  return <main><AccountHeader signedIn /><section className="board account-stage">
    <div className="board-heading"><p className="eyebrow">MEMBERS ONLY. YOU’RE ONE OF US.</p><h1>HELLO,<br /><span>FRIEND!</span></h1><p className="board-intro">Welcome to the club, {profile!.first_name}.</p></div>
    <div className="account-panel club-panel"><span className="account-stamp" aria-hidden="true">✳</span><p className="card-top">YOUR MEMBERSHIP: OFFICIALLY HELLO-WORTHY</p><h2>A little kindness. A big ripple.</h2><p>Your mission today: say hello to someone new. A neighbor, a classmate, or the person making your coffee. Small connections make the world a friendlier place.</p><Link className="replay" href="/profile">MAKE YOURSELF AT HOME ↗</Link></div>
  </section></main>;
}
