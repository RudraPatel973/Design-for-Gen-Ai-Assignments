import Link from "next/link";
import { MainNavigation } from "./main-navigation";
export function AccountHeader({ signedIn = false }: { signedIn?: boolean }) {
  return <header className="masthead account-header">
    <Link className="brand" href="/captions" aria-label="Only in NYC caption feed"><span aria-hidden="true">✳</span> ONLY IN NYC</Link>
    <MainNavigation signedIn={signedIn} />
  </header>;
}
