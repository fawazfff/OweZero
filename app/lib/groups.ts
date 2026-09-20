export type GroupType = "trip" | "home" | "dinner" | "event" | "couple" | "team";
export type Member = { id: string; name: string; color: string };
export type Expense = { id: string; title: string; amount: number; paidBy: string; participants: string[]; date: string; category: string };
export type Group = { id: string; name: string; type: GroupType; currency: string; members: Member[]; expenses: Expense[]; paidSettlements: string[]; createdAt: string };

export const groupTypes: { id: GroupType; icon: string; title: string; copy: string }[] = [
  { id: "trip", icon: "✈", title: "Group trip", copy: "Hotels, taxis, food and everything between." },
  { id: "home", icon: "⌂", title: "Roommates", copy: "Rent, utilities, groceries and shared supplies." },
  { id: "dinner", icon: "♨", title: "Dinner", copy: "One table, different orders, zero awkward math." },
  { id: "event", icon: "◇", title: "Event", copy: "Tickets, supplies and reimbursements in one place." },
  { id: "couple", icon: "♡", title: "Couple", copy: "Keep shared spending clear without keeping score." },
  { id: "team", icon: "◎", title: "Team", copy: "Lunches, travel and project costs for a small team." }
];

const colors = ["#6255e7", "#ff6e62", "#1c9a70", "#e79a35", "#3f7ae0", "#b05ad8"];
export const makeMember = (name: string, index = 0): Member => ({ id: `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}-${index}`, name, color: colors[index % colors.length] });

export const demoGroup: Group = {
  id: "demo",
  name: "Lisbon weekend",
  type: "trip",
  currency: "$",
  createdAt: "2026-09-20T08:00:00.000Z",
  paidSettlements: [],
  members: [
    { id: "you", name: "You", color: colors[0] },
    { id: "maya", name: "Maya", color: colors[1] },
    { id: "josh", name: "Josh", color: colors[2] },
    { id: "david", name: "David", color: colors[3] }
  ],
  expenses: [
    { id: "villa", title: "Apartment", amount: 480, paidBy: "you", participants: ["you", "maya", "josh", "david"], date: "Sep 18", category: "Stay" },
    { id: "food", title: "Groceries", amount: 96, paidBy: "maya", participants: ["you", "maya", "josh", "david"], date: "Sep 18", category: "Food" },
    { id: "taxi", title: "Airport taxi", amount: 42, paidBy: "josh", participants: ["you", "maya", "josh"], date: "Sep 19", category: "Travel" },
    { id: "dinner", title: "Rooftop dinner", amount: 132, paidBy: "david", participants: ["you", "maya", "david"], date: "Sep 19", category: "Food" }
  ]
};

const KEY = "owezero:groups:v1";
export function readGroups(): Group[] {
  if (typeof window === "undefined") return [demoGroup];
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "[]") as Group[];
    return [demoGroup, ...saved.filter((item) => item.id !== "demo")];
  } catch { return [demoGroup]; }
}
export function saveGroup(group: Group) {
  if (typeof window === "undefined" || group.id === "demo") return;
  const saved = readGroups().filter((item) => item.id !== "demo" && item.id !== group.id);
  localStorage.setItem(KEY, JSON.stringify([group, ...saved]));
}
export function getGroup(id: string) { return readGroups().find((group) => group.id === id) || demoGroup; }

export function calculate(group: Group) {
  const balances: Record<string, number> = Object.fromEntries(group.members.map((member) => [member.id, 0]));
  group.expenses.forEach((expense) => {
    balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;
    const share = expense.amount / Math.max(1, expense.participants.length);
    expense.participants.forEach((id) => { balances[id] = (balances[id] || 0) - share; });
  });
  const debtors = Object.entries(balances).filter(([, value]) => value < -0.005).map(([id, value]) => ({ id, amount: -value })).sort((a,b) => b.amount-a.amount);
  const creditors = Object.entries(balances).filter(([, value]) => value > 0.005).map(([id, value]) => ({ id, amount: value })).sort((a,b) => b.amount-a.amount);
  const settlements: { id: string; from: string; to: string; amount: number }[] = [];
  let d = 0, c = 0;
  while (d < debtors.length && c < creditors.length) {
    const amount = Math.min(debtors[d].amount, creditors[c].amount);
    const id = `${debtors[d].id}-${creditors[c].id}`;
    settlements.push({ id, from: debtors[d].id, to: creditors[c].id, amount: Math.round(amount * 100) / 100 });
    debtors[d].amount -= amount; creditors[c].amount -= amount;
    if (debtors[d].amount < .005) d++;
    if (creditors[c].amount < .005) c++;
  }
  return { balances, settlements, total: group.expenses.reduce((sum, expense) => sum + expense.amount, 0) };
}

