import Image from "next/image";
import Link from "next/link";
import { getProfile, isComplete } from "@/lib/profile";
import { AccountHeader } from "@/components/account-header";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Your Profile — The Hello Project" };
export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error: actionError } = await searchParams;
  const { supabase, user, profile, error } = await getProfile();
  let photoUrl: string | undefined;
  if (profile?.avatar_path?.startsWith(`${user.id}/`)) {
    const { data } = await supabase.storage.from("avatars").createSignedUrl(profile.avatar_path, 3600);
    photoUrl = data?.signedUrl;
  }
  return <main><AccountHeader signedIn /><section className="board account-stage">
    <div className="board-heading"><p className="eyebrow">A FACE. A NAME. A FRIENDLIER INTERNET.</p><h1>HEY,<br /><span>THAT’S YOU.</span></h1><p className="board-intro">Your little introduction to the world.</p></div>
    <div className="account-panel profile-panel">
      <div className="profile-identity">{photoUrl ? <Image src={photoUrl} alt="Your profile photo" width={96} height={96} unoptimized className="profile-avatar" /> : <div className="profile-avatar avatar-placeholder" aria-label="No profile photo">✳</div>}<div><h2>{profile?.first_name || "Nice to meet you!"}</h2><p className="profile-email">{user.email}</p></div></div>
      {actionError && <p role="alert" className="form-message">We couldn’t sign you out. Please try again.</p>}
      {error || !profile ? <p role="alert" className="form-message">Your profile isn’t available yet. Please try again shortly.</p> : <>
        {!isComplete(profile) && <p className="onboarding-note">First, let’s make this personal. Add your first and last name to unlock the Hello Club.</p>}
        <ProfileForm firstName={profile.first_name ?? ""} lastName={profile.last_name ?? ""} />
        {isComplete(profile) && <Link href="/club" className="club-link">YOU’RE ALL SET. ENTER THE CLUB ↗</Link>}
      </>}
    </div>
  </section></main>;
}
