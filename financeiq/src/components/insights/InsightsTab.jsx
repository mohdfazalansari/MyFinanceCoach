import { useState, useEffect } from "react";
import { Lightbulb, AlertCircle, Loader2 } from "lucide-react";
import { C } from "../../utils/theme";

export default function InsightsTab() {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      const user = JSON.parse(localStorage.getItem("financeiq_user"));
      if (!user || user.token === "demo") {
        setInsights([{ tag: "info", desc: "Demo Mode: Add real transactions to see AI insights." }]);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8080/api/v1/intelligence/${user.id}/insights`, {
          headers: { "Authorization": `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const formatted = data.insights?.map((str, i) => ({
            id: i,
            title: "AI Analysis",
            tag: str.toLowerCase().includes('watch out') ? 'warning' : 'info',
            desc: str
          })) || [];
          setInsights(formatted);
        }
      } catch (e) {
        console.error("Failed to fetch AI Insights", e);
        setInsights([{ tag: "warning", desc: "AI Engine is currently offline." }]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (isLoading) return <div style={{ padding: 40, textAlign: "center", color: C.text }}><Loader2 className="spinner" /> Loading AI Insights...</div>;

  return (
    <div className="card animate-in" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, color: C.text }}>
        <Lightbulb color={C.text} size={24} />
        <h2 style={{ fontSize: 20, margin: 0, color: C.text }}>Python AI Insights</h2>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {insights.map((insight, idx) => (
          <div key={idx} style={{ padding: 16, border: `1px solid ${C.border}`, borderRadius: 12, borderLeft: `4px solid ${insight.tag === 'warning' ? C.danger : C.primary}`, background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              {insight.tag === 'warning' ? <AlertCircle size={16} color={C.danger} /> : <Lightbulb size={16} color={C.primary} />}
              <h3 style={{ margin: 0, fontSize: 16, color: insight.tag === 'warning' ? C.danger : C.text }}>
                {insight.title || "Observation"}
              </h3>
            </div>
            <p style={{ margin: 0, color: C.textSm, fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>
              {insight.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}