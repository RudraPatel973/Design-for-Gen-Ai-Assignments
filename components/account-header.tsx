import Link from "next/link";
import { MainNavigation } from "./main-navigation";
export function AccountHeader({ signedIn = false }: { signedIn?: boolean }) {
  return <header className="masthead account-header">
    <Link className="brand" href="/" aria-label="The Hello Project home"><span aria-hidden="true">✳</span> THE HELLO PROJECT</Link>
    <MainNavigation signedIn={signedIn} />
  </header>;
}
