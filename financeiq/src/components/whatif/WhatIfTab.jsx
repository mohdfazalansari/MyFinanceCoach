import { useState } from "react";
import { C } from "../../utils/theme";
import { EXPENSE_CATS } from "../../utils/categoryUtils";
import { fmt } from "../../utils/formatCurrency";
import { Icon } from "../shared/Icon";

export default function WhatIfTab({ transactions = [] }) {
  const [scenario, setScenario] = useState("reduce");
  const [selectedCat, setSelectedCat] = useState("");
  const [amount, setAmount] = useState(""); 
  const [result, setResult] = useState(null);

  // 🌟 NEW FIX: Get ONLY the current/most recent month's data!
  const latestDate = transactions.length > 0 
    ? new Date(Math.max(...transactions.map(t => t.ts))) 
    : new Date();
  
  const currentMonth = latestDate.getMonth();
  const currentYear = latestDate.getFullYear();

  const recentTransactions = transactions.filter(t => {
    const d = new Date(t.ts);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // Calculate totals using ONLY recent transactions
  const currentIncome = recentTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const currentExpense = recentTransactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const currentSavings = currentIncome - currentExpense;

  const simulate = () => {
    if (!amount) return;
    
    let newExpense = currentExpense;
    if (scenario === "reduce") newExpense = Math.max(0, currentExpense - Number(amount));
    else if (scenario === "rent") newExpense = currentExpense + Number(amount); 
    
    const newSavings = (scenario === "income" ? currentIncome + Number(amount) : currentIncome) - newExpense;
    setResult({ newExpense, newSavings, delta: newSavings - currentSavings });
  };

  return (
    <div className="card animate-in">
      <div className="section-title"><Icon name="table" size={18}/> "What If" Simulator</div>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Test financial scenarios based on your <b>most recent month</b> of data.</p>

      {/* ─── PREMIUM CURRENT STATE CARD ─── */}
      <div style={{ 
        background: `linear-gradient(135deg, ${C.primaryDark} 0%, #374151 100%)`, 
        borderRadius: 16, 
        padding: 24, 
        marginBottom: 32,
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
            Current Financial State
            </h4>
            <span style={{ background: "rgba(255,255,255,0.1)", color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                {latestDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
            </span>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 20 }}>
          <div>
            <div style={{ fontSize: 13, color: "#D1D5DB", marginBottom: 4 }}>Monthly Income</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{fmt(currentIncome)}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "#D1D5DB", marginBottom: 4 }}>Monthly Expenses</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{fmt(currentExpense)}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "#D1D5DB", marginBottom: 4 }}>Current Savings</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: currentSavings >= 0 ? "#10B981" : "#EF4444" }}>
              {fmt(currentSavings)}
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Type Dropdown */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 6, color: C.text }}>Scenario Type</label>
        <select 
          value={scenario} 
          onChange={e => { setScenario(e.target.value); setResult(null); }} 
          style={{ width: "100%", padding: "12px 14px", background: "#F9FAFB", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, outline: "none", cursor: "pointer", color: C.text }} 
        >
          <option value="reduce">Reduce category spending</option>
          <option value="income">Income increase</option>
          <option value="rent">Rent/Fixed Expense increase</option>
        </select>
      </div>

      {/* Category Dropdown */}
      {scenario === "reduce" && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 6, color: C.text }}>Select Category</label>
          <select 
            value={selectedCat} 
            onChange={e => setSelectedCat(e.target.value)} 
            style={{ width: "100%", padding: "12px 14px", background: "#F9FAFB", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, outline: "none", cursor: "pointer", color: selectedCat ? C.text : C.muted }} 
          >
            <option value="" disabled>Choose a category</option>
            {EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {/* Amount Input */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 6, color: C.text }}>
          {scenario === "reduce" ? "Reduce by (₹)" : scenario === "income" ? "Amount to change by (₹)" : "Amount to change by (₹)"}
        </label>
        <input 
          type="number" 
          value={amount} 
          onChange={e => setAmount(e.target.value)} 
          placeholder="e.g., 5000" 
          style={{ width: "100%", padding: "12px 14px", background: "#F9FAFB", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, outline: "none", color: C.text }} 
        />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12 }}>
        <button className="primary-btn" onClick={simulate} style={{ flex: 1, justifyContent: "center", fontSize: 15 }}>
          <Icon name="barChart" size={16} color="#fff"/> Run Simulation
        </button>
        <button className="outline-btn" onClick={() => { setResult(null); setAmount(""); setSelectedCat(""); }} style={{ padding: "12px 20px" }}>Reset</button>
      </div>

      {/* Simulation Result */}
      {result && (
        <div style={{ marginTop: 24, background: result.delta >= 0 ? C.successBg : C.dangerBg, borderRadius: 12, padding: 20, animation: "slideIn 0.3s ease" }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: result.delta >= 0 ? C.successText : C.dangerText, marginBottom: 12 }}>Simulation Result:</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: result.delta >= 0 ? C.successText : C.dangerText }}>New Monthly Expenses</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: result.delta >= 0 ? C.successText : C.dangerText }}>{fmt(result.newExpense)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: result.newSavings >= 0 ? C.successText : C.dangerText }}>New Monthly Savings</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: result.newSavings >= 0 ? C.successText : C.dangerText }}>{fmt(result.newSavings)}</div>
            </div>
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${result.delta >= 0 ? "#86EFAC" : "#FCA5A5"}`, fontSize: 14, fontWeight: 600, color: result.delta >= 0 ? C.successText : C.dangerText }}>
            {result.delta >= 0 ? "▲" : "▼"} {result.delta >= 0 ? "+" : ""}{fmt(Math.abs(result.delta))} change in monthly savings
          </div>
        </div>
      )}
    </div>
  );
}