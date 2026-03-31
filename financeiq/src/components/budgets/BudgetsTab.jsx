import { useState, useEffect } from "react";
import { CreditCard, Trash2 } from "lucide-react";
import { C } from "../../utils/theme";
import { fmt } from "../../utils/formatCurrency";
import { Icon } from "../shared/Icon";

// 🚀 Accept 'transactions' and 'onDelete' as props!
export default function BudgetsTab({ budgets, transactions = [], onAdd, onDelete }) {
  const [apiBudgets, setApiBudgets] = useState(budgets || []);

  useEffect(() => {
    const fetchBudgets = async () => {
      const user = JSON.parse(localStorage.getItem("financeiq_user"));
      if (!user || user.token === "demo") return;

      try {
        const res = await fetch(`http://localhost:8080/api/v1/budgets/user/${user.id}`, {
          headers: { "Authorization": `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setApiBudgets(data);
        }
      } catch (e) { console.error("Failed to fetch budgets", e); }
    };
    fetchBudgets();
  }, [budgets]); 

  // 🚀 CALCULATE REAL SPENT AMOUNT: Filter expenses for the current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const expensesThisMonth = transactions.filter(t => {
    const d = new Date(t.ts || t.date);
    const typeStr = typeof t.type === 'string' ? t.type.toLowerCase() : "expense";
    return typeStr === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  return (
    <div className="card animate-in" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          {/* 🚀 FIX: Forced text color to C.text */}
          <div className="section-title" style={{ marginBottom: 4, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
            <CreditCard size={20} color={C.text} />
            <h2 style={{ fontSize: 20, margin: 0, color: C.text }}>Budget Monitoring</h2>
          </div>
          <p style={{ fontSize: 14, color: C.textSm, marginBottom: 0, fontWeight: 500 }}>
            Track your spending against monthly limits
          </p>
        </div>
        
        <button className="primary-btn" onClick={onAdd} style={{ fontSize: 13, padding: "10px 16px" }}>
          <Icon name="plus" size={14} color="#fff"/> Add Budget
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {apiBudgets.length === 0 && <p style={{ color: C.muted }}>No active budgets.</p>}
        {apiBudgets.map((b, i) => {
          const limit = b.limit || b.limitAmount || 1;
          
          // 🚀 REAL CALCULATION: Sum up the transactions matching this category
          const spent = expensesThisMonth
            .filter(t => (t.cat || t.category) === b.category)
            .reduce((sum, t) => sum + (t.amount || 0), 0);
          
          const left = Math.max(0, limit - spent);
          const pct = Math.min((spent / limit) * 100, 100);
          const over = pct >= 100;
          const warn = pct >= 80;
          const barColor = over ? C.danger : warn ? C.warning : C.success;
          
          return (
            <div key={b.id || i} style={{ border: `1px solid ${C.border}`, padding: 20, borderRadius: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                {/* 🚀 FIX: Forced text color to C.text */}
                <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{b.category}</span>
                
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: barColor, fontWeight: 700, fontSize: 14 }}>{pct.toFixed(0)}%</span>
                  {/* Delete Button */}
                  {onDelete && (
                    <button onClick={() => onDelete(b.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* 🚀 FIX: High visibility gray/black text */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.textSm, fontWeight: 600, marginBottom: 10 }}>
                <span>₹{fmt(spent)} of ₹{fmt(limit)}</span>
                <span style={{ color: over ? C.danger : C.textSm }}>
                  {over ? "Over budget!" : `₹${fmt(left)} left`}
                </span>
              </div>

              <div style={{ width: "100%", height: 8, background: C.bg, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 4, transition: "width 0.5s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}