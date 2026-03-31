import { useState, useRef } from "react";
import { C } from "../../utils/theme";
import { fmt } from "../../utils/formatCurrency";
import { Icon } from "../shared/Icon";

export default function ScanReceiptModal({ onClose, onAdd }) {
  const [step, setStep] = useState("prompt"); // "prompt", "processing", "result"
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extractedData, setExtractedData] = useState([]); // 🌟 THE FIX: Now an empty Array, not 'null'
  const fileInputRef = useRef(null);

  // Handle Drag & Drop / File Selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  // 🌟 NEW: Parses dates to ensure Jan/Feb/Mar aren't all forced into the current month
  const parseDocumentDate = (dateStr) => {
    if (!dateStr) return null;
    const match = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
    if (match) {
        let p1 = parseInt(match[1], 10);
        let p2 = parseInt(match[2], 10);
        let year = parseInt(match[3], 10);
        year = year < 100 ? 2000 + year : year;
        
        let day = p1;
        let month = p2 - 1;
        if (month > 11) { day = p2; month = p1 - 1; }
        return new Date(year, month, day, 12, 0, 0);
    }
    const fallbackDate = new Date(dateStr);
    if (!isNaN(fallbackDate.getTime())) {
        fallbackDate.setHours(12, 0, 0, 0);
        return fallbackDate;
    }
    return null;
  };

  const processFile = (selectedFile) => {
    setFile(selectedFile);
    
    // Create a preview URL if it's an image
    if (selectedFile.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview("pdf"); // Flag for PDF UI
    }

    setStep("processing");

    const formData = new FormData();
    formData.append("receipt", selectedFile);
    
    // Call Python directly on Port 8000!
    fetch("http://localhost:8000/api/ocr/scan", {
      method: "POST",
      body: formData
    })
    .then(res => {
      if (!res.ok) throw new Error("Backend OCR failed");
      return res.json();
    })
    .then(data => {
       // 🌟 THE FIX: Map over the array instead of grabbing a single object
       const txnsList = data.transactions ? data.transactions : [];
       
       const formattedTxns = txnsList.map((t, idx) => {
         const isIncome = (t.desc || t.merchant || "").toLowerCase().includes("salary") || (t.cat || "").toLowerCase().includes("salary");
         
         const realDateObj = parseDocumentDate(t.date);
         const finalTs = realDateObj ? realDateObj.getTime() + idx : Date.now() + idx;
         const finalDateStr = realDateObj ? realDateObj.toLocaleDateString("en-US") : new Date().toLocaleDateString("en-US");

         return {
            id: Date.now() + idx, // Unique ID
            type: isIncome ? "income" : "expense",
            desc: t.desc || t.merchant || "Unknown Merchant",
            amount: parseFloat(t.amount) || 0,
            cat: t.cat || "Uncategorized",
            date: finalDateStr,
            ts: finalTs, 
            recurring: false
         };
       });
       
       setExtractedData(formattedTxns);
       setStep("result");
    })
    .catch(err => {
       console.error("OCR API Error:", err);
       alert("OCR Analysis Failed. Please ensure your Python backend is running.");
       setStep("prompt"); // Go back to prompt if it fails
    });
    
  };

  const handleSave = () => {
    // 🌟 THE FIX: Loop through the array and save all transactions!
    extractedData.forEach(txn => onAdd(txn));
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
      {/* CSS for Scanner Animation */}
      <style>{`
        @keyframes scanline {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(124, 58, 237, 0); }
          100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); }
        }
      `}</style>

      <div style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", width: "100%", maxWidth: 500, boxShadow: "0 20px 60px rgba(0,0,0,.15)", animation: "slideIn .2s ease" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Smart Document Scanner</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}>
            <Icon name="x" size={20}/>
          </button>
        </div>

        {/* STEP 1: Upload Prompt */}
        {step === "prompt" && (
          <div 
            onDragOver={(e) => e.preventDefault()} 
            onDrop={handleDrop}
            style={{ textAlign: "center" }}
          >
            <div 
              onClick={() => fileInputRef.current.click()}
              style={{ 
                border: `2px dashed ${C.primary}50`, 
                borderRadius: 16, 
                padding: "48px 20px", 
                background: C.purpleBg,
                marginBottom: 24,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
                cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseOver={e => e.currentTarget.style.background = "#E9D5FF"}
              onMouseOut={e => e.currentTarget.style.background = C.purpleBg}
            >
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulseGlow 2s infinite", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <Icon name="camera" size={28} color={C.primary}/>
              </div>
              <div>
                <p style={{ fontWeight: 700, color: C.primaryDark, fontSize: 16, marginBottom: 6 }}>Click to upload or drag & drop</p>
                <p style={{ color: C.textSm, fontSize: 13, lineHeight: 1.5, maxWidth: 280, margin: "0 auto" }}>
                  Supports PNG, JPG, and <b>Bank Statement PDFs</b>.
                </p>
              </div>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/png, image/jpeg, application/pdf" 
              style={{ display: "none" }} 
            />

            <button 
              onClick={() => fileInputRef.current.click()} 
              style={{ width: "100%", padding: "14px", background: C.primaryDark, color: "#fff", fontSize: 15, fontWeight: 600, borderRadius: 10, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity 0.2s" }}
            >
              <Icon name="camera" size={18}/> Browse Files
            </button>
          </div>
        )}

        {/* STEP 2: Processing state */}
        {step === "processing" && (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            
            {/* Image Preview with Laser Scanner */}
            <div style={{ position: "relative", width: "100%", height: 180, background: "#F3F4F6", borderRadius: 12, overflow: "hidden", marginBottom: 24, border: `1px solid ${C.border}` }}>
              {preview === "pdf" ? (
                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.muted }}>
                   <Icon name="table" size={40} color={C.muted}/>
                   <span style={{ marginTop: 10, fontSize: 14, fontWeight: 600 }}>Analyzing PDF Document...</span>
                </div>
              ) : (
                <img src={preview} alt="Receipt" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              )}
              
              {/* Laser Line */}
              <div style={{ 
                position: "absolute", left: 0, right: 0, height: 3, 
                background: "#10B981", boxShadow: "0 0 12px 2px #10B981", 
                animation: "scanline 2.5s infinite linear" 
              }}/>
            </div>

            <h4 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>Extracting Data...</h4>
            <p style={{ color: C.muted, fontSize: 14 }}>Running Document Analysis</p>
          </div>
        )}

        {/* STEP 3: Result state */}
        {step === "result" && extractedData && extractedData.length > 0 && (
          <div>
            <div style={{ background: C.successBg, borderRadius: 12, padding: "16px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.success, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="check" size={16} color="#fff"/>
              </div>
              <div>
                <p style={{ fontWeight: 700, color: C.successText, fontSize: 15, marginBottom: 2 }}>Scan Successful!</p>
                <p style={{ color: C.successText, fontSize: 13, opacity: 0.9 }}>Found <b>{extractedData.length}</b> transaction(s).</p>
              </div>
            </div>

            {/* 🌟 THE FIX: Replaced Single Card with Scrollable List 🌟 */}
            <div style={{ maxHeight: 280, overflowY: "auto", border: `1px solid ${C.border}`, borderRadius: 12, background: "#F9FAFB", marginBottom: 24 }}>
              {extractedData.map((txn, index) => (
                <div key={txn.id} style={{ padding: "16px", borderBottom: index === extractedData.length - 1 ? "none" : `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, color: C.text, fontSize: 14, textTransform: "capitalize" }}>{txn.desc}</span>
                    <span style={{ fontWeight: 800, color: txn.type === "income" ? C.success : C.text, fontSize: 15 }}>
                      {txn.type === "income" ? "+" : ""}{fmt(txn.amount)}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: C.muted }}>{txn.date}</span>
                    <span style={{ fontWeight: 600, color: C.purple, fontSize: 12, background: C.purpleBg, padding: "4px 8px", borderRadius: 6 }}>{txn.cat}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button 
                onClick={onClose} 
                style={{ flex: 1, padding: "14px", background: "#fff", color: C.text, border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "border-color 0.2s" }}
              >
                Discard
              </button>
              <button 
                onClick={handleSave} 
                style={{ flex: 2, padding: "14px", background: C.primaryDark, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s" }}
              >
                Save {extractedData.length} Transaction(s)
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}