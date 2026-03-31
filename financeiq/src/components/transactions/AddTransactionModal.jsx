import { useState, useEffect } from "react";
import { C } from "../../utils/theme";
import { Icon } from "../shared/Icon";

export default function AddTransactionModal({ onClose, onAdd }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  
  // New states for Live AI Prediction
  const [predictedCategory, setPredictedCategory] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);

  // 🌟 THE FIX: Connects live typing directly to the Python ML Engine!
  useEffect(() => {
    if (!desc || desc.trim().length < 2) {
      setPredictedCategory("");
      return;
    }

    setIsPredicting(true);
    
    // 600ms debounce so we don't spam the API on every single keystroke
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("http://localhost:8000/api/predict-category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: desc,
            merchant: desc,
            amount: parseFloat(amount) || 0
          })
        });

        if (res.ok) {
          const data = await res.json();
          // Use the real ML Prediction!
          setPredictedCategory(data.category);
        } else {
          throw new Error("API fallback");
        }
      } catch (error) {
        // Fallback just in case the Python server is turned off
        const lowerDesc = desc.toLowerCase();
        let cat = "Other";

        if (lowerDesc.includes("swiggy") || lowerDesc.includes("zomato") || lowerDesc.includes("food") || lowerDesc.includes("dinner")) cat = "Food & Drink";
        else if (lowerDesc.includes("uber") || lowerDesc.includes("ola") || lowerDesc.includes("auto")) cat = "Transportation";
        else if (lowerDesc.includes("amazon") || lowerDesc.includes("flipkart") || lowerDesc.includes("shopping")) cat = "Shopping";
        else if (lowerDesc.includes("netflix") || lowerDesc.includes("movie") || lowerDesc.includes("spotify") || lowerDesc.includes("bookmyshow")) cat = "Entertainment";
        else if (lowerDesc.includes("salary") || lowerDesc.includes("freelance")) cat = "Salary";
        else if (lowerDesc.includes("rent")) cat = "Rent";
        else if (lowerDesc.includes("water") || lowerDesc.includes("electricity") || lowerDesc.includes("bill")) cat = "Utilities";
        else if (lowerDesc.includes("medical") || lowerDesc.includes("doctor") || lowerDesc.includes("pharmacy") || lowerDesc.includes("apollo")) cat = "Health & Fitness";

        setPredictedCategory(cat);
      } finally {
        setIsPredicting(false);
      }
    }, 600); 

    return () => clearTimeout(timer);
  }, [desc, amount]);

  const handleAdd = () => {
    if (!desc || !amount) return; 
    
    onAdd({
      id: Date.now(),
      type,
      desc,
      amount: parseFloat(amount),
      cat: predictedCategory || "Other",
      date: new Date(date).toLocaleDateString("en-US"),
      ts: new Date(date).getTime(),
      recurring: false 
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,.15)", animation: "slideIn .2s ease" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Add New Transaction</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}>
            <Icon name="x" size={20}/>
          </button>
        </div>

        {/* Expense / Income Toggle */}
        <div style={{ display: "flex", border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 24 }}>
          <button 
            onClick={() => setType("expense")} 
            style={{ flex: 1, padding: "10px", background: type === "expense" ? C.primaryDark : "#fff", color: type === "expense" ? "#fff" : C.text, fontWeight: 600, border: "none", fontSize: 14, transition: "all 0.2s" }}
          >
            Expense
          </button>
          <button 
            onClick={() => setType("income")} 
            style={{ flex: 1, padding: "10px", background: type === "income" ? C.primaryDark : "#fff", color: type === "income" ? "#fff" : C.text, fontWeight: 600, border: "none", fontSize: 14, transition: "all 0.2s" }}
          >
            Income
          </button>
        </div>

        {/* Amount Field */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6, color: C.text }}>Amount (₹)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" style={{ width: "100%", padding: "12px 14px", background: "#F9FAFB", border: "none", borderRadius: 8, fontSize: 14, outline: "none", color: C.text }}/>
        </div>

        {/* Description Field */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6, color: C.text }}>Description</label>
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g., Swiggy order, Salary, etc." style={{ width: "100%", padding: "12px 14px", background: "#F9FAFB", border: "none", borderRadius: 8, fontSize: 14, outline: "none", color: C.text }}/>
        </div>

        {/* 🌟 DYNAMIC: AI Auto-Categorization Indicator 🌟 */}
        <div style={{ 
          marginBottom: 24, 
          background: "linear-gradient(to right, #F3E8FF, #EDE9FE)", 
          border: `1px solid ${C.purple}30`, 
          borderRadius: 10, 
          padding: "16px", 
          display: "flex", 
          alignItems: "center", 
          gap: 14 
        }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.purple, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(124, 58, 237, 0.3)" }}>
            <span style={{ fontSize: 16 }}>✨</span>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.purple, marginBottom: 2 }}>AI Predicted Category</div>
            {isPredicting ? (
              <div style={{ fontSize: 14, color: C.purple, fontWeight: 600, opacity: 0.7 }}>Analyzing description...</div>
            ) : predictedCategory ? (
              <div style={{ fontSize: 16, color: C.primaryDark, fontWeight: 800 }}>{predictedCategory}</div>
            ) : (
              <div style={{ fontSize: 13, color: C.purple, opacity: 0.85 }}>Type a description to auto-categorize</div>
            )}
          </div>
        </div>

        {/* Date Field */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6, color: C.text }}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: "100%", padding: "12px 14px", background: "#F9FAFB", border: "none", borderRadius: 8, fontSize: 14, outline: "none", color: C.text, cursor: "pointer", fontFamily: "inherit" }}/>
        </div>

        {/* Submit Button */}
        <button onClick={handleAdd} style={{ width: "100%", padding: "14px", background: C.primaryDark, color: "#fff", fontSize: 15, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", transition: "opacity 0.2s" }} onMouseOver={e => e.currentTarget.style.opacity = 0.9} onMouseOut={e => e.currentTarget.style.opacity = 1}>
          Add Transaction
        </button>

      </div>
    </div>
  );
}