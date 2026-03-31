// ─── CURRENCY FORMATTER ───────────────────────────────────────────────────────
export const fmt = (n) => {
  const num = Number(n) || 0;
  return (num < 0 ? "-₹" : "₹") + Math.abs(num).toLocaleString("en-IN");
};