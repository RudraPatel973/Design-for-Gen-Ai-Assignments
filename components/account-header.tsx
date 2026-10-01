import Link from "next/link";
import { signOut } from "@/app/auth/actions";

export function AccountHeader({ signedIn = false }: { signedIn?: boolean }) {
  return <header className="masthead account-header">
    <Link className="brand" href="/"><span aria-hidden="true">✳</span> THE HELLO PROJECT</Link>
    <nav aria-label="Main navigation" className="account-nav">
      <Link href="/greetings">HELLO BOARD</Link>
      <Link href="/club">THE CLUB ↗</Link>
      {signedIn && <><Link href="/profile">PROFILE</Link><form action={signOut}><button type="submit">SIGN OUT</button></form></>}
    </nav>
  </header>;
}
