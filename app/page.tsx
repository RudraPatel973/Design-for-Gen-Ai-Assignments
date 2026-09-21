"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";

export default function Home() {
  const [replay, setReplay] = useState(0);

  return (
    <main>
      <header className="masthead">
        <Link className="brand" href="/" aria-label="Hello World home"><span aria-hidden="true">✳</span> THE HELLO PROJECT</Link>
        <span className="edition">A LITTLE LOUD. A LOT OF HELLO.</span>
        <span className="issue">VOL. 001 ↗</span>
      </header>

      <section className="stage" aria-labelledby="greeting">
        <div className="grid" aria-hidden="true" />
        <span className="tiny-note">ONE SMALL PAGE.<br />ONE BIG ENTRANCE.</span>
        <div className="orbit" aria-hidden="true"><span>✦</span></div>
        <div className="sticker" aria-hidden="true">OH,<br />HI THERE!</div>
        <div className="spark spark-one" aria-hidden="true">✳</div>
        <div className="spark spark-two" aria-hidden="true">✦</div>
        <div className="smiley" aria-hidden="true"><span>··</span><i /></div>

        <div className="centerpiece">
          <p className="eyebrow"><span /> YOU MADE IT. LET’S MAKE SOME NOISE.</p>
          <h1 id="greeting" key={replay} aria-label="Hello World!">
            {["HELLO", "WORLD!"].map((word, row) => (
              <span className={`word word-${row}`} key={word} aria-hidden="true">
                {word.split("").map((letter, index) => (
                  <span className="letter" key={index} style={{ "--delay": `${(row * 5 + index) * 65}ms`, "--tilt": `${index % 2 === 0 ? -3 : 3}deg` } as CSSProperties}>{letter}</span>
                ))}
              </span>
            ))}
          </h1>
          <p className="intro">The internet is a big place.<br />Glad you landed in this little corner.</p>
          <button className="replay" onClick={() => setReplay((value) => value + 1)}><span aria-hidden="true">↻</span> ONE MORE HELLO <span aria-hidden="true">↗</span></button>
        </div>
        <div className="side-note">GOOD VIBES / NO SMALL TALK</div>
        <span className="bottom-note">EST. 2026 — MADE TO SAY HI.</span>
        <span className="handwritten" aria-hidden="true">nice to meet you! ↗</span>
      </section>

      <div className="ticker" aria-hidden="true"><div>{Array.from({ length: 8 }, (_, index) => <span key={index}>HELLO WORLD <b>✳</b> BIG HELLO ENERGY <b>✳</b> </span>)}</div></div>
      <footer><span>NOTHING TO SIGN UP FOR. JUST A HELLO.</span><span>MADE WITH A LITTLE EXTRA <span className="heart">♥</span></span></footer>
    </main>
  );
}
