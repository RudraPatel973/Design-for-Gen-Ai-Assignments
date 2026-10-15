"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth/actions";
const links = [["/captions", "Caption feed"], ["/create", "Create ↗"]];
export function MainNavigation({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  return <nav aria-label="Main navigation" className="account-nav">
    {links.map(([href, label]) => <Link href={href} key={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}
    {signedIn ? <details className="account-menu"><summary>Account</summary><div className="account-menu-panel"><Link href="/profile" aria-current={pathname === "/profile" ? "page" : undefined}>Edit profile</Link><form action={signOut}><button type="submit">Sign out</button></form></div></details> : <Link href="/login" aria-current={pathname === "/login" ? "page" : undefined}>Sign in</Link>}
  </nav>;
}
