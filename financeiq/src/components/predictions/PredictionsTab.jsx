import { useState, useEffect } from "react";
import { LineChart, Loader2 } from "lucide-react";
import { C } from "../../utils/theme";
import { fmt } from "../../utils/formatCurrency";

export default function PredictionsTab() {
  const [predictionData, setPredictionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      const user = JSON.parse(localStorage.getItem("financeiq_user"));
      
      // If no user or demo user, skip fetching
      if (!user || user.token === "demo") {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8080/api/v1/intelligence/${user.id}/predictions`, {
          headers: { "Authorization": `Bearer ${user.token}` }
        });
        
        if (res.ok) {
            const data = await res.json();
            setPredictionData(data);
        }
      } catch (e) {
        console.error("Failed to fetch Predictions", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPredictions();
  }, []);

  if (isLoading) {
    return (
        <div style={{ padding: 60, textAlign: "center", color: C.text }}>
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spinner { animation: spin 1s linear infinite; display: inline-block; margin-bottom: 12px; }
            `}</style>
            <Loader2 className="spinner" size={32} color={C.primary} />
            <h3 style={{ marginTop: 10, color: C.text }}>Running ML Prediction Models...</h3>
            <p style={{ color: C.muted, fontSize: 14 }}>Analyzing your transaction history</p>
        </div>
    );
  }

  // Handle both possible JSON keys (Depending on how Spring Boot maps the Python response)
  const predictedTotal = predictionData?.Total_Predicted_Expenses || predictionData?.predicted_total || 0;

  return (
    <div className="card animate-in" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, color: C.text }}>
        <LineChart color={C.primary} size={24} />
        <h2 style={{ fontSize: 20, margin: 0, color: C.text, fontWeight: 700 }}>Expense Predictions</h2>
      </div>
      
      {predictionData && predictedTotal > 0 ? (
        <div>
            <div style={{ padding: 24, background: C.blueBg, borderRadius: 16, border: `1px solid #BFDBFE`, marginBottom: 24 }}>
                <h3 style={{ margin: "0 0 8px 0", color: C.blueText, fontSize: 15 }}>Predicted Expenses (Next 30 Days)</h3>
                
                <p style={{ fontSize: 36, fontWeight: 800, color: C.blueText, margin: 0 }}>
                    {fmt(predictedTotal)} 
                </p>
                
                <p style={{ fontSize: 13, color: C.blueText, marginTop: 8, fontWeight: 500, opacity: 0.8 }}>
                    Based on rolling averages and ML trend analysis.
                </p>
            </div>

            {/* Render Category Breakdown if it exists */}
            {predictionData.Category_Predictions && Object.keys(predictionData.Category_Predictions).length > 0 && (
                <div>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>Category Forecasts</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
                        {Object.entries(predictionData.Category_Predictions).map(([cat, details]) => (
                            <div key={cat} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, background: "#F9FAFB" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                    <span style={{ fontWeight: 600, color: C.text, fontSize: 15 }}>{cat}</span>
                                    <span style={{ fontWeight: 800, color: C.primaryDark, fontSize: 16 }}>{fmt(details.Predicted_Amount || 0)}</span>
                                </div>
                                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, margin: 0 }}>
                                    {details.Explanation}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      ) : (
        <div style={{ padding: 40, textAlign: "center", background: "#F9FAFB", borderRadius: 16, border: `1px dashed ${C.border}` }}>
            <p style={{ color: C.textSm, fontWeight: 600, fontSize: 15, margin: 0 }}>Not enough data to run predictions.</p>
            <p style={{ color: C.muted, fontSize: 14, marginTop: 8 }}>Please add more transactions so the AI can analyze your spending trends.</p>
        </div>
      )}
    </div>
  );
}