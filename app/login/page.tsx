import { authDestination } from "@/lib/auth-destination";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInWithGoogle } from "@/app/auth/actions";
import { AccountHeader } from "@/components/account-header";
import { SubmitButton } from "@/components/submit-button";

export const metadata = { title: "Sign in — Only in NYC" };
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;
  const returnTo = authDestination(next);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect(returnTo);
  return <main><AccountHeader /><section className="board account-stage">
    <div className="board-heading"><p className="eyebrow">YOUR NYC MOMENTS BELONG HERE.</p><h1>COME<br /><span>ON IN.</span></h1><p className="board-intro">Create AI captions. Vote for your favorites.</p></div>
    <div className="account-panel"><span className="account-stamp" aria-hidden="true">✳</span><h2>Join the caption crowd.</h2><p>Sign in to create captions, rate the feed, and keep your profile. Your Google name and picture get you started.</p>
      {error && <p className="form-message" role="alert">We couldn’t finish signing you in. Please try again. If this keeps happening, Google sign-in may still be getting set up.</p>}
      <form action={signInWithGoogle}><input type="hidden" name="next" value={returnTo} /><SubmitButton pendingText="OPENING GOOGLE…">CONTINUE WITH GOOGLE ↗</SubmitButton></form>
      <p className="account-fineprint">Your Google password stays with Google.</p>
    </div>
  </section></main>;
}
