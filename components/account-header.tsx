import Link from "next/link";
import { signOut } from "@/app/auth/actions";

export function AccountHeader({ signedIn = false }: { signedIn?: boolean }) {
  return <header className="masthead account-header">
    <Link className="brand" href="/"><span aria-hidden="true">✳</span> THE HELLO PROJECT</Link>
    <nav aria-label="Main navigation" className="account-nav">
      <Link href="/">HOME</Link>
      <Link href="/greetings">HELLO BOARD</Link>
      <Link href="/captions">ONLY IN NYC</Link><Link href="/create">CREATE ↗</Link>
      <Link href="/club">THE CLUB ↗</Link>
      <Link href="/profile">PROFILE</Link>
      {signedIn ? <form action={signOut}><button type="submit">SIGN OUT</button></form> : <Link href="/login">SIGN IN</Link>}
    </nav>
  </header>;
}
