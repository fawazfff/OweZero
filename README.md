# OweZero

**Paste the chaos. Settle the math.**

OweZero turns informal group-expense messages into a transparent settlement plan with the fewest necessary payments.

## Why it exists

Group expenses rarely begin in spreadsheets. They begin in messages: “I covered dinner,” “David didn’t eat,” or “Josh already paid me back.” OweZero understands that human context, calculates each person’s fair share, and explains the shortest route back to zero.

## Features

- Natural-language expense parsing with OpenAI
- Transparent per-person paid/share/balance breakdown
- Minimum-transfer settlement plan
- Multiple currency symbols
- Built-in example and reliable demo fallback
- Responsive, animated product experience

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add `OPENAI_API_KEY` to `.env.local` for live AI parsing. Without it, the curated demo remains fully usable.

## Stack

Next.js 16, React 19, TypeScript, OpenAI structured outputs, CSS motion.

Built for BUILD//ANYTHING 2026.
