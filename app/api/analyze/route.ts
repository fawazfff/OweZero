import { NextResponse } from "next/server";

const schema = {
  name: "expense_settlement",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["title", "summary", "expenses", "people", "settlements", "assumptions"],
    properties: {
      title: { type: "string" },
      summary: { type: "string" },
      expenses: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["label", "paidBy", "amount", "participants"],
          properties: {
            label: { type: "string" },
            paidBy: { type: "string" },
            amount: { type: "number" },
            participants: { type: "array", items: { type: "string" } }
          }
        }
      },
      people: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "paid", "share", "balance"],
          properties: {
            name: { type: "string" },
            paid: { type: "number" },
            share: { type: "number" },
            balance: { type: "number" }
          }
        }
      },
      settlements: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["from", "to", "amount"],
          properties: {
            from: { type: "string" },
            to: { type: "string" },
            amount: { type: "number" }
          }
        }
      },
      assumptions: { type: "array", items: { type: "string" } }
    }
  }
};

export async function POST(request: Request) {
  const { text, currency = "$" } = await request.json();
  if (typeof text !== "string" || text.trim().length < 10) {
    return NextResponse.json({ error: "Tell us a little more about the expenses." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ demo: true });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.1,
      response_format: { type: "json_schema", json_schema: schema },
      messages: [
        {
          role: "system",
          content: `You turn informal group-expense notes into exact settlement plans. Currency symbol: ${currency}. Calculate each participant's fair share per expense, respect exclusions and previous repayments, then minimize the number of transfers. Never invent people or expenses. Put uncertainty in assumptions.`
        },
        { role: "user", content: text }
      ]
    })
  });

  if (!response.ok) return NextResponse.json({ demo: true });
  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content) return NextResponse.json({ demo: true });
  return NextResponse.json(JSON.parse(content));
}
