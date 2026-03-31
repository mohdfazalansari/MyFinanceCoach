import { C } from "../../utils/theme";
import { Icon } from "../shared/Icon";

export default function InsightCard({ category, type, description, reason, actionable }) {
  // Determine styling based on the insight type
  let theme = { bg: C.blueBg, text: C.blueText, border: "#93C5FD", icon: "lightbulb" };
  
  if (type === "warning") {
    theme = { bg: C.dangerBg, text: C.dangerText, border: "#FCA5A5", icon: "trendingDown" };
  } else if (type === "success") {
    theme = { bg: C.successBg, text: C.successText, border: "#86EFAC", icon: "trending" };
  }

  return (
    <div style={{ 
      background: "#fff", 
      border: `1px solid ${C.border}`, 
      borderRadius: 16, 
      padding: 24, 
      marginBottom: 16, 
      boxShadow: "0 2px 8px rgba(0,0,0,0.02)", 
      textAlign: "left" // Forces left alignment overriding any global CSS
    }}>
      
      {/* ─── CARD HEADER ─── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name={theme.icon} size={20} color={theme.text}/>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>{category}</h4>
              <span style={{ background: theme.bg, color: theme.text, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase" }}>
                {type}
              </span>
            </div>
            <p style={{ fontSize: 15, color: C.text, fontWeight: 500, marginTop: 4 }}>{description}</p>
          </div>
        </div>

        {/* Actionable Badge */}
        {actionable && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: C.primary, background: C.purpleBg, padding: "6px 12px", borderRadius: 999 }}>
            <Icon name="target" size={14}/> Actionable
          </div>
        )}
      </div>
      
      {/* ─── CONTEXT BOX ─── */}
      <div style={{ 
        background: "#F9FAFB", 
        borderLeft: `4px solid ${theme.border}`, 
        borderRadius: "0 8px 8px 0", 
        padding: "16px 20px" 
      }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="search" size={14} color={C.muted}/> Why this insight exists:
        </p>
        <p style={{ fontSize: 14, color: C.textSm, lineHeight: 1.6 }}>{reason}</p>
      </div>

    </div>
  );
}