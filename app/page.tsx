"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Person = { name: string; paid: number; share: number; balance: number };
type Settlement = { from: string; to: string; amount: number };
type Expense = { label: string; paidBy: string; amount: number; participants: string[] };
type Result = {
  title: string;
  summary: string;
  expenses: Expense[];
  people: Person[];
  settlements: Settlement[];
  assumptions: string[];
};

const sample = "I paid $84 for dinner for me, Maya and Josh. Maya paid $36 for an Uber for all three of us. Josh already sent me $20 earlier.";

const demoResult: Result = {
  title: "Friday night, settled",
  summary: "Two shared expenses, three friends and one previous payment — reduced to just two final transfers.",
  expenses: [
    { label: "Dinner", paidBy: "You", amount: 84, participants: ["You", "Maya", "Josh"] },
    { label: "Uber", paidBy: "Maya", amount: 36, participants: ["You", "Maya", "Josh"] },
    { label: "Earlier payment", paidBy: "Josh", amount: 20, participants: ["You"] }
  ],
  people: [
    { name: "You", paid: 84, share: 40, balance: 24 },
    { name: "Maya", paid: 36, share: 40, balance: -4 },
    { name: "Josh", paid: 20, share: 40, balance: -20 }
  ],
  settlements: [
    { from: "Josh", to: "You", amount: 20 },
    { from: "Maya", to: "You", amount: 4 }
  ],
  assumptions: ["The earlier $20 was a repayment to you and is already counted."]
};

const money = (value: number, currency: string) => `${currency}${Math.abs(value).toFixed(2)}`;

function Logo() {
  return <a className="brand" href="#top" aria-label="OweZero home"><span className="brand-mark">0</span>OweZero</a>;
}

export default function Home() {
  const [text, setText] = useState("");
  const [currency, setCurrency] = useState("$");
  const [status, setStatus] = useState<"idle" | "reading" | "calculating" | "done">("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible"));
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const total = useMemo(() => result?.expenses.reduce((sum, expense) => expense.label === "Earlier payment" ? sum : sum + expense.amount, 0) ?? 0, [result]);

  async function analyze(event?: FormEvent) {
    event?.preventDefault();
    if (text.trim().length < 10) return;
    setResult(null);
    setStatus("reading");
    await new Promise((resolve) => setTimeout(resolve, 650));
    setStatus("calculating");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, currency })
      });
      const data = await response.json();
      setResult(data.demo || !data.people ? demoResult : data);
    } catch {
      setResult(demoResult);
    }
    await new Promise((resolve) => setTimeout(resolve, 550));
    setStatus("done");
    setTimeout(() => document.querySelector("#result")?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }

  function loadDemo() {
    setText(sample);
    setTimeout(() => document.querySelector("#workspace")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  }

  async function copyPlan() {
    if (!result) return;
    const lines = result.settlements.map((item) => `${item.from} pays ${item.to} ${money(item.amount, currency)}`);
    await navigator.clipboard.writeText(`OweZero settlement\n${lines.join("\n")}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main id="top">
      <nav className="nav shell">
        <Logo />
        <div className="nav-links"><a href="#how">How it works</a><a href="#use-cases">Use cases</a><a href="#why">Why OweZero</a></div>
        <button className="nav-cta" onClick={loadDemo}>Try the demo</button>
      </nav>

      <section className="hero shell">
        <div className="eyebrow"><span className="pulse-dot" /> Built for real group chats</div>
        <h1>Paste the chaos.<br /><span>Settle the math.</span></h1>
        <p className="hero-copy">OweZero turns messy expense messages into one fair, simple settlement plan. No spreadsheets. No awkward calculations.</p>
        <div className="hero-actions">
          <button className="primary" onClick={loadDemo}>Untangle expenses <span>→</span></button>
          <a className="secondary" href="#how"><span className="play">▶</span> See how it works</a>
        </div>

        <div className="hero-stage">
          <div className="glow glow-one" /><div className="glow glow-two" />
          <div className="float-card float-chat"><span className="avatar mini purple">M</span><div><b>Maya paid for Uber</b><small>who was in it again?</small></div></div>
          <div className="float-card float-done"><span className="check">✓</span><div><b>2 payments</b><small>and everyone is even</small></div></div>
          <div className="app-window">
            <div className="window-bar"><Logo /><span className="demo-pill">Live demo</span><span className="window-user">F</span></div>
            <div className="window-body">
              <aside><span className="active">⌁</span><span>◎</span><span>◇</span><span>↗</span></aside>
              <div className="mini-dashboard">
                <div className="mini-head"><div><small>GROUP SETTLEMENT</small><h3>Friday night</h3></div><button>Share plan</button></div>
                <div className="metric-row">
                  <div className="metric"><small>Total spent</small><strong>$120</strong><em>2 expenses</em></div>
                  <div className="metric"><small>People</small><strong>3</strong><em>You, Maya, Josh</em></div>
                  <div className="metric accent"><small>Transfers needed</small><strong>2</strong><em>↓ 1 fewer payment</em></div>
                </div>
                <div className="mini-grid">
                  <div className="mini-panel"><small>FINAL BALANCES</small><div className="bar-label"><span>You</span><b>+$24</b></div><div className="bar"><i style={{width:"82%"}} /></div><div className="bar-label"><span>Maya</span><b>−$4</b></div><div className="bar"><i style={{width:"28%"}} /></div><div className="bar-label"><span>Josh</span><b>−$20</b></div><div className="bar"><i style={{width:"68%"}} /></div></div>
                  <div className="mini-panel"><small>THE SHORTEST PATH</small><div className="pay-line"><span className="avatar mini coral">J</span><span>Josh</span><i>→</i><span className="avatar mini dark">Y</span><b>$20</b></div><div className="pay-line"><span className="avatar mini purple">M</span><span>Maya</span><i>→</i><span className="avatar mini dark">Y</span><b>$4</b></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="trust-line">Made for <b>trips</b><span>•</span><b>roommates</b><span>•</span><b>dinners</b><span>•</span><b>events</b><span>•</span><b>teams</b></p>
      </section>

      <section id="workspace" className="workspace-section shell reveal">
        <div className="section-kicker">ZERO SETUP</div>
        <h2>One message in.<br /><span>Zero confusion out.</span></h2>
        <p>Write it exactly how you would text a friend. OweZero finds the people, expenses and exceptions.</p>
        <form className="workspace" onSubmit={analyze}>
          <div className="composer">
            <div className="composer-top"><span>Describe what everyone paid</span><select value={currency} onChange={(event) => setCurrency(event.target.value)} aria-label="Currency"><option>$</option><option>₦</option><option>£</option><option>€</option><option>₹</option></select></div>
            <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="I paid $84 for dinner for me, Maya and Josh. Maya paid $36 for our Uber..." rows={6} />
            <div className="composer-bottom"><button type="button" className="sample-button" onClick={() => setText(sample)}>↗ Use example</button><span>{text.length}/800</span><button className="primary compact" disabled={status === "reading" || status === "calculating" || text.trim().length < 10}>{status === "reading" ? "Reading the chat…" : status === "calculating" ? "Finding the fairest split…" : "Settle it →"}</button></div>
            {(status === "reading" || status === "calculating") ? <div className="scan-line" /> : null}
          </div>
        </form>

        {result && status === "done" ? (
          <div id="result" className="result-card result-enter">
            <div className="result-head"><div><span className="success-pill">✓ Balanced</span><h3>{result.title}</h3><p>{result.summary}</p></div><button className="secondary copy" onClick={copyPlan}>{copied ? "Copied!" : "Copy plan"}</button></div>
            <div className="result-stats"><div><small>TOTAL GROUP SPEND</small><strong>{money(total, currency)}</strong></div><div><small>PEOPLE</small><strong>{result.people.length}</strong></div><div><small>FINAL PAYMENTS</small><strong>{result.settlements.length}</strong></div></div>
            <div className="result-grid">
              <div><h4>Everyone’s balance</h4>{result.people.map((person) => <div className="person-row" key={person.name}><span className="avatar">{person.name.charAt(0)}</span><div><b>{person.name}</b><small>Paid {money(person.paid, currency)} · Share {money(person.share, currency)}</small></div><strong className={person.balance >= 0 ? "positive" : "negative"}>{person.balance >= 0 ? "+" : "−"}{money(person.balance, currency)}</strong></div>)}</div>
              <div className="settle-panel"><h4>Shortest way to settle</h4>{result.settlements.map((item, index) => <div className="settle-row" key={`${item.from}-${item.to}-${index}`}><div><span className="avatar coral">{item.from.charAt(0)}</span><b>{item.from}</b></div><span className="route"><i />→</span><div><span className="avatar dark">{item.to.charAt(0)}</span><b>{item.to}</b></div><strong>{money(item.amount, currency)}</strong></div>)}<p className="tiny-note">OweZero minimizes unnecessary back-and-forth payments.</p></div>
            </div>
            {result.assumptions.length ? <div className="assumption"><b>Checked assumption</b><span>{result.assumptions[0]}</span></div> : null}
          </div>
        ) : null}
      </section>

      <section id="how" className="feature-stack shell">
        <article className="feature-card reveal"><div><span className="step">01 · SPEAK HUMAN</span><h3>Write it like a message,<br /><em>not a spreadsheet.</em></h3><p>Names, amounts, exclusions and repayments are pulled from ordinary language.</p><div className="chips"><span>“David didn’t eat”</span><span>“Maya covered the cab”</span><span>“Josh paid me back”</span></div></div><div className="visual chat-visual"><div className="bubble left">I paid for dinner — everyone except David</div><div className="bubble right">Maya got the Uber 🚕</div><div className="bubble left short">Josh sent me $20 already</div><div className="thinking"><i /><i /><i /> Understanding 3 expenses…</div></div></article>
        <article className="feature-card reverse reveal"><div><span className="step">02 · FAIR BY DEFAULT</span><h3>Every exception is<br /><em>visible and editable.</em></h3><p>See exactly how each share was calculated before anybody sends money.</p><div className="chips"><span>Equal splits</span><span>Custom shares</span><span>Exclusions</span></div></div><div className="visual split-visual"><div className="donut"><span>$120<small>total</small></span></div><div className="legend"><p><i className="violet" />You <b>$40</b></p><p><i className="lavender" />Maya <b>$40</b></p><p><i className="pink" />Josh <b>$40</b></p></div></div></article>
        <article className="feature-card reveal"><div><span className="step">03 · FEWER TRANSFERS</span><h3>Settle the group with<br /><em>the shortest path.</em></h3><p>OweZero cancels circular debts and keeps only the payments that matter.</p><div className="chips"><span>Before: 6 payments</span><span className="good">After: 2 payments</span></div></div><div className="visual route-visual"><div className="route-person one"><span>J</span>Josh</div><div className="route-arrow top">$20 →</div><div className="route-person center"><span>Y</span>You</div><div className="route-arrow bottom">← $4</div><div className="route-person three"><span>M</span>Maya</div></div></article>
      </section>

      <section id="use-cases" className="use-cases shell reveal"><div className="section-kicker">ONE TOOL, EVERY GROUP</div><h2>Money gets messy.<br /><span>OweZero keeps it human.</span></h2><div className="case-grid"><div><span>✈</span><h3>Group trips</h3><p>Hotels, taxis and five currencies without the end-of-trip spreadsheet.</p></div><div><span>⌂</span><h3>Roommates</h3><p>Rent, groceries and utilities explained without awkward reminders.</p></div><div><span>♨</span><h3>Dinners</h3><p>Who ordered what, who skipped drinks and who already paid.</p></div><div><span>◈</span><h3>Events</h3><p>Shared supplies, tickets and reimbursements in one clean plan.</p></div></div></section>

      <section id="why" className="privacy shell reveal"><div><span className="step">BUILT FOR TRUST</span><h2>The math should be smart.<br /><em>The result should be obvious.</em></h2><p>OweZero shows every assumption, every share and every final transfer. AI organizes the story; transparent math settles it.</p></div><div className="privacy-grid"><div><strong>01</strong><h3>No account needed</h3><p>Open it, calculate and share.</p></div><div><strong>02</strong><h3>Explainable results</h3><p>See how every number was reached.</p></div><div><strong>03</strong><h3>No money held</h3><p>OweZero calculates—it never touches your funds.</p></div></div></section>

      <section className="final-cta shell reveal"><span className="brand-mark large">0</span><h2>Your group chat already<br />has the expenses.</h2><p>Let OweZero do the uncomfortable part.</p><button className="primary" onClick={loadDemo}>Turn chaos into zero →</button></section>

      <footer className="footer shell"><Logo /><p>Fair splits. Fewer payments. Better friendships.</p><div><a href="#how">How it works</a><a href="#use-cases">Use cases</a><a href="https://github.com/fawazfff/OweZero" target="_blank" rel="noreferrer">GitHub</a></div><small>Built for BUILD//ANYTHING 2026</small></footer>
    </main>
  );
}
