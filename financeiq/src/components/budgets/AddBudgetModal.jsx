import { useState } from "react";
import { C } from "../../utils/theme";
import { EXPENSE_CATS } from "../../utils/categoryUtils";
import { Icon } from "../shared/Icon";

export default function AddBudgetModal({ onClose, onAdd }) {
  const [cat, setCat] = useState("Dining");
  const [limit, setLimit] = useState("");

  const handleAdd = () => {
    if (!cat || !limit) return; // Basic validation
    onAdd({
      id: Date.now(),
      category: cat,
      limit: parseFloat(limit),
      used: 0 // New budgets start with 0 usage
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,.15)", animation: "slideIn .2s ease" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Create New Budget</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}>
            <Icon name="x" size={20}/>
          </button>
        </div>

        {/* Category Field */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6, color: C.text }}>Category</label>
          <div style={{ position: "relative" }}>
            <select value={cat} onChange={e => setCat(e.target.value)} style={{ width: "100%", padding: "12px 14px", background: "#F9FAFB", border: "none", borderRadius: 8, fontSize: 14, outline: "none", color: cat ? C.text : C.muted, cursor: "pointer", appearance: "none" }}>
              {EXPENSE_CATS.map(c => <option key={c} value={c} style={{ color: C.text }}>{c}</option>)}
            </select>
            <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: C.muted }}>
              <Icon name="chevronDown" size={16}/>
            </div>
          </div>
        </div>

        {/* Limit Field */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6, color: C.text }}>Monthly Limit (₹)</label>
          <input type="number" value={limit} onChange={e => setLimit(e.target.value)} placeholder="e.g., 5000" style={{ width: "100%", padding: "12px 14px", background: "#F9FAFB", border: "none", borderRadius: 8, fontSize: 14, outline: "none", color: C.text }}/>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <button 
            onClick={onClose} 
            style={{ flex: 1, padding: "14px", background: "#fff", color: C.text, border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "border-color 0.2s" }}
          >
            Cancel
          </button>
          <button 
            onClick={handleAdd} 
            style={{ flex: 1, padding: "14px", background: C.primaryDark, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s" }}
          >
            Create Budget
          </button>
        </div>

      </div>
    </div>
  );
}