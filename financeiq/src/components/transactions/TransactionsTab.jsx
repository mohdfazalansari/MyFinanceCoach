import { useState } from "react";
import { C } from "../../utils/theme";
import { CATEGORIES } from "../../utils/categoryUtils";
import { Icon } from "../shared/Icon";
import TransactionRow from "./TransactionRow";

// 🚀 Added onDelete to the props
export default function TransactionsTab({ transactions, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [type, setType] = useState("all");

  const filtered = transactions.filter(t => {
    // Failsafe added for t.desc to prevent crashes if description is missing
    const description = t.desc || t.description || t.merchant || "";
    const matchSearch = description.toLowerCase().includes(search.toLowerCase());
    
    // Check against standard backend categories
    const category = t.cat || t.category || "Other";
    const matchCat = cat === "all" || category === cat;
    
    const txnType = typeof t.type === 'string' ? t.type.toLowerCase() : "expense";
    const matchType = type === "all" || txnType === type;
    
    return matchSearch && matchCat && matchType;
  });

  return (
    <div className="card animate-in" style={{ padding: 32 }}>
      
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0 }}>Transaction History</h3>
      </div>

      {/* Filters Area */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        
        {/* Search */}
        <div style={{ flex: 2, minWidth: 250, position: "relative" }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none", display: "flex" }}>
            <Icon name="search" size={16}/>
          </span>
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ width: "100%", padding: "14px 16px 14px 44px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, outline: "none", color: C.text, transition: "border-color 0.2s" }}
            onFocus={e => e.target.style.borderColor = C.primary}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>
        
        {/* Category Filter */}
        <div style={{ flex: 1, minWidth: 160, position: "relative" }}>
          <select 
            value={cat} 
            onChange={e => setCat(e.target.value)} 
            style={{ width: "100%", padding: "14px 36px 14px 16px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, cursor: "pointer", outline: "none", color: cat === "all" ? "#9CA3AF" : C.text, appearance: "none", transition: "border-color 0.2s" }}
            onFocus={e => e.target.style.borderColor = C.primary}
            onBlur={e => e.target.style.borderColor = C.border}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c} style={{ color: C.text }}>{c}</option>)}
          </select>
          <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: C.muted, display: "flex" }}>
            <Icon name="chevronDown" size={16}/>
          </div>
        </div>

        {/* Type Filter */}
        <div style={{ flex: 1, minWidth: 140, position: "relative" }}>
          <select 
            value={type} 
            onChange={e => setType(e.target.value)} 
            style={{ width: "100%", padding: "14px 36px 14px 16px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, cursor: "pointer", outline: "none", color: type === "all" ? "#9CA3AF" : C.text, appearance: "none", transition: "border-color 0.2s" }}
            onFocus={e => e.target.style.borderColor = C.primary}
            onBlur={e => e.target.style.borderColor = C.border}
          >
            <option value="all">All Types</option>
            <option value="income" style={{ color: C.text }}>Income</option>
            <option value="expense" style={{ color: C.text }}>Expense</option>
          </select>
          <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: C.muted, display: "flex" }}>
            <Icon name="chevronDown" size={16}/>
          </div>
        </div>

      </div>

      {/* Transaction List */}
      <div style={{ maxHeight: 600, overflowY: "auto", paddingRight: 8 }}>
        {filtered.length === 0
          ? <div style={{ textAlign: "center", color: C.muted, padding: 60 }}>No transactions found</div>
          : filtered.map((t, i) => (
              <TransactionRow 
                key={t.id || i} 
                txn={t} 
                onEdit={onEdit}
                onDelete={onDelete} // 🚀 Passed down to the row component!
              />
            ))}
      </div>
    </div>
  );
}