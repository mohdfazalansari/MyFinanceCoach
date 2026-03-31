export const PIE_DATA = [
{ name: "Rent", value: 60, color: "#6366F1" },
{ name: "Other", value: 8, color: "#8B5CF6" },
{ name: "Utilities", value: 6, color: "#F59E0B" },
{ name: "Dining", value: 6, color: "#EC4899" },
{ name: "Entertainment", value: 5, color: "#10B981" },
{ name: "Healthcare", value: 5, color: "#3B82F6" },
{ name: "Travel", value: 5, color: "#EF4444" },
{ name: "Education", value: 5, color: "#6B7280" },
];
export const TREND_DATA = [
{ month: "Dec 25", expenses: 12000 },
{ month: "Jan 26", expenses: 233484 },
{ month: "Feb 26", expenses: 140000 },
{ month: "Mar 26", expenses: 197178 },
];
export const FIXED_FLEX = [
{ name: "Fixed", amount: 380000 },
{ name: "Flexible", amount: 215000 },
];
export const WKND_WKDAY = [
{ name: "Weekend", amount: 460000 },
  { name: "Weekday", amount: 320000 },
];
export const SUBSCRIPTIONS = [
  { id: 1, name: "Uber ride", category: "Transportation", monthly: 56, started: "2/17/2026", total: 56 },
  { id: 2, name: "Entertainment expense", category: "Entertainment", monthly: 1899, started: "1/19/2026"}, 
  { id: 3, name: "Netflix", category: "Entertainment", monthly: 649, started: "1/1/2026", total: 1298 },
  { id: 4, name: "Gym membership", category: "Healthcare", monthly: 1200, started: "12/1/2025", total: 480},
  { id: 5, name: "Water bill", category: "Utilities", monthly: 873, started: "11/1/2025", total: 4365 },
  { id: 6, name: "Electricity", category: "Utilities", monthly: 1450, started: "10/1/2025", total: 7250 },
];
export const MOCK_BUDGETS = [
  { id: 1, category: "Dining", limit: 5000, used: 0 },
  { id: 2, category: "Transportation", limit: 3000, used: 56 },
  { id: 3, category: "Entertainment", limit: 2500, used: 2548 },
  { id: 4, category: "Shopping", limit: 4000, used: 170 },
];
export function genTransactions() {
  const txns = [];
  const now = new Date();
  const entries = [
    { desc: "Monthly salary", cat: "Salary", type: "income", amount: 54491, recurring: true },
    { desc: "Education expense", cat: "Education", type: "expense", amount: 1725, recurring: false },
    { desc: "Water bill", cat: "Utilities", type: "expense", amount: 873, recurring: true },
    { desc: "Shopping expense", cat: "Shopping", type: "expense", amount: 170, recurring: false },
    { desc: "Uber ride", cat: "Transportation", type: "expense", amount: 56, recurring: true },
    { desc: "Netflix subscription", cat: "Entertainment", type: "expense", amount: 649, recurring: true },
    { desc: "Grocery shopping", cat: "Food", type: "expense", amount: 3200, recurring: false },
    { desc: "Electricity bill", cat: "Utilities", type: "expense", amount: 1450, recurring: true },
    { desc: "Restaurant dinner", cat: "Dining", type: "expense", amount: 2800, recurring: false },
    { desc: "Medical checkup", cat: "Healthcare", type: "expense", amount: 1500, recurring: false },
    { desc: "Monthly salary", cat: "Salary", type: "income", amount: 54491, recurring: true },
    { desc: "Rent payment", cat: "Rent", type: "expense", amount: 25000, recurring: true },
    { desc: "Travel booking", cat: "Travel", type: "expense", amount: 8500, recurring: false },
    { desc: "Online course", cat: "Education", type: "expense", amount: 2999, recurring: false },
    { desc: "Gym membership", cat: "Entertainment", type: "expense", amount: 1899, recurring: true },
  ];
  entries.forEach((e, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    txns.push({ id: i + 1, ...e, date: d.toLocaleDateString("en-US"), ts: d.getTime() });
  });
  return txns;
}