import { C } from "../../utils/theme";
import ProgressBar from "../shared/ProgressBar";

export default function BudgetCard({ budget, transactions = [], onDelete }) {
  // Get the current month and year to dynamically filter expenses
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // 🌟 THE FIX: Calculate total spent for this specific category in the current month ONLY
  const currentMonthUsed = transactions
    .filter(t => {
      const d = new Date(t.ts);
      return t.type === "expense" &&
             t.cat === budget.category &&
             d.getMonth() === currentMonth &&
             d.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Safely handle backend naming differences (limit vs limitAmount)
  const limit = budget.limit || budget.limitAmount || 0; 
  
  const pct = limit > 0 ? Math.round((currentMonthUsed / limit) * 100) : 0;
  const displayPct = Math.min(pct, 100); // Caps the progress bar visually at 100%
  const over = pct > 100;
  const warn = pct >= 80;
  
  const barColor = over ? C.danger : warn ? C.warning : C.success;
  
  const left = Math.max(0, limit - currentMonthUsed);

  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
      
      {/* Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{budget.category}</span>
        
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: barColor, fontWeight: 700, fontSize: 14 }}>{pct}%</span>
          {onDelete && (
            <button 
              onClick={onDelete} 
              style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", display: "flex", padding: 0 }} 
              title="Delete Budget"
              onMouseOver={(e) => e.currentTarget.style.color = C.danger}
              onMouseOut={(e) => e.currentTarget.style.color = C.muted}
            >
              {/* Trash Icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Amount Row */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.muted, marginBottom: 12 }}>
        <span>₹{currentMonthUsed.toLocaleString("en-IN", { maximumFractionDigits: 2 })} of ₹{limit.toLocaleString("en-IN")}</span>
        <span style={{ color: over ? C.danger : C.muted }}>
            {over ? "Over budget!" : `₹${left.toLocaleString("en-IN", { maximumFractionDigits: 2 })} left`}
        </span>
      </div>
      
      {/* Progress Bar */}
      <ProgressBar value={displayPct} color={barColor} />
    </div>
  );
}