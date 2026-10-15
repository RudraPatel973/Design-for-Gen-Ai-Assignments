"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth/actions";
const links = [["/", "Home"], ["/greetings", "Hello Board"], ["/captions", "Only in NYC"], ["/create", "Create ↗"], ["/club", "The Club"], ["/profile", "Profile"]];
export function MainNavigation({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  return <nav aria-label="Main navigation" className="account-nav">
    {links.map(([href, label]) => <Link href={href} key={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}
    {signedIn ? <form action={signOut}><button type="submit">Sign out</button></form> : <Link href="/login" aria-current={pathname === "/login" ? "page" : undefined}>Sign in</Link>}
  </nav>;
}
