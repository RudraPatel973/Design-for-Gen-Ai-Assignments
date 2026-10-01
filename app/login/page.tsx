import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInWithGoogle } from "@/app/auth/actions";
import { AccountHeader } from "@/components/account-header";
import { SubmitButton } from "@/components/submit-button";

export const metadata = { title: "Join the Hello Club" };
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/club");
  return <main><AccountHeader /><section className="board account-stage">
    <div className="board-heading"><p className="eyebrow">YOUR INVITATION TO SOMETHING FRIENDLY.</p><h1>COME<br /><span>ON IN.</span></h1><p className="board-intro">A little corner of the internet, just for you.</p></div>
    <div className="account-panel"><span className="account-stamp" aria-hidden="true">✳</span><h2>Good people. Big hellos.</h2><p>Sign in to make your profile and unlock the members-only Hello Club.</p>
      {error && <p className="form-message" role="alert">We couldn’t finish signing you in. Please try again. If this keeps happening, Google sign-in may still be getting set up.</p>}
      <form action={signInWithGoogle}><SubmitButton pendingText="OPENING GOOGLE…">CONTINUE WITH GOOGLE ↗</SubmitButton></form>
      <p className="account-fineprint">Your Google password stays with Google.</p>
    </div>
  </section></main>;
}
