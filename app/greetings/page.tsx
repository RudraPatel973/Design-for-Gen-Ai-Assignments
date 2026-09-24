import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { getGreetings } from "@/lib/greetings";

export const metadata: Metadata = {
  title: "Hello Board — The Hello Project",
  description: "A whole world of ways to say hello. Explore greetings from different languages.",
};

export default async function GreetingsPage() {
  await connection();
  const result = await getGreetings();

  return (
    <main className="board-page">
      <header className="masthead">
        <Link className="brand" href="/" aria-label="Hello World home"><span aria-hidden="true">✳</span> THE HELLO PROJECT</Link>
        <span className="edition">MANY LANGUAGES. ONE BIG HELLO.</span>
        <Link className="issue board-home" href="/">← HOME</Link>
      </header>
      <section className="board" aria-labelledby="board-title">
        <div className="board-heading">
          <p className="eyebrow">SMALL WORDS. WORLDWIDE CONNECTIONS.</p>
          <h1 id="board-title">HELLO<br /><span>BOARD<span aria-hidden="true">✳</span></span></h1>
          <p className="board-intro">Different languages. The same warm welcome.<br />Find your next favorite way to say hi.</p>
        </div>
        <div className="board-toolbar">
          <span>{result.status === "ready" ? `${result.greetings.length} WAYS TO SAY HELLO` : "A WORLD OF HELLOS"}</span>
          <form action="/greetings" method="get"><button className="board-refresh" type="submit">REFRESH ↻</button></form>
        </div>
        {result.status === "ready" && result.greetings.length > 0 ? (
          <ul className="greeting-list" aria-label="Greetings from around the world">
            {result.greetings.map((greeting, index) => (
              <li className="greeting-card" key={greeting.id}>
                <div className="card-top"><span>{String(index + 1).padStart(2, "0")}</span><span>{greeting.language}</span></div>
                <h2>{greeting.phrase}</h2>
                <p>{greeting.description}</p>
                <span className="card-star" aria-hidden="true">✳</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="board-message" role="status">
            <span aria-hidden="true">✳</span>
            <h2>{result.status === "ready" ? "The first hello is on its way." : result.status === "unconfigured" ? "The board is getting ready." : "Our hellos are taking a little break."}</h2>
            <p>{result.status === "ready" ? "No greetings have been added yet. Check back soon." : result.status === "unconfigured" ? "Our collection of greetings will be here soon." : "We couldn’t load the greetings. Please try refreshing in a moment."}</p>
          </div>
        )}
        <p className="board-signoff">A little hello goes a long way. ↗</p>
      </section>
      <footer><span>ONE WORLD. SO MANY WAYS TO SAY HI.</span><span>MADE WITH A LITTLE EXTRA <span className="heart">♥</span></span></footer>
    </main>
  );
}
