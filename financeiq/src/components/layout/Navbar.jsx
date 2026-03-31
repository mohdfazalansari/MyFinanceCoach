import { C } from "../../utils/theme";
import { Icon } from "../shared/Icon";

export default function Navbar({ user, onLogout }) {
  // Generate user initials for the avatar (e.g., "Demo User" -> "DU")
  const initials = user?.name 
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) 
    : "U";

  return (
    <div style={{ 
      background: "rgba(255, 255, 255, 0.85)", 
      backdropFilter: "blur(12px)", 
      WebkitBackdropFilter: "blur(12px)", 
      padding: "0 32px", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between", 
      height: 72, 
      position: "sticky", 
      top: 0, 
      zIndex: 100,
      borderBottom: `1px solid ${C.border}`,
      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.02)"
    }}>
      
      {/* ─── LEFT: BRANDING ─── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${C.primary}40` }}>
          <Icon name="wallet" size={20} color="#fff"/>
        </div>
        <div>
          <div style={{ color: C.text, fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>MyFinanceCoach</div>
          <div style={{ color: C.muted, fontSize: 12, fontWeight: 500 }}>Intelligent Financial Analytics</div>
        </div>
      </div>

      {/* ─── RIGHT: USER DETAILS & ACTIONS ─── */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        
        {/* Decorative Action Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ width: 36, height: 36, borderRadius: "50%", background: "#F3F4F6", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.textSm, transition: "background 0.2s" }} title="Messages">
            <Icon name="mail" size={16}/>
          </button>
          <button style={{ width: 36, height: 36, borderRadius: "50%", background: "#F3F4F6", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.textSm, transition: "background 0.2s" }} title="Settings">
            <Icon name="edit" size={16}/>
          </button>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 32, background: C.border }}></div>

        {/* User Profile Area */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ color: C.text, fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{user.name}</div>
              <div style={{ color: C.muted, fontSize: 12 }}>{user.email}</div>
            </div>
            {/* User Avatar Pill */}
            <div style={{ 
              width: 42, height: 42, 
              borderRadius: "50%", 
              background: C.blueBg, 
              color: C.blueText, 
              display: "flex", alignItems: "center", justifyContent: "center", 
              fontWeight: 700, fontSize: 15, 
              border: `2px solid #fff`, 
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)" 
            }}>
              {initials}
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={onLogout} 
            className="outline-btn"
            style={{ 
              display: "flex", alignItems: "center", gap: 6, 
              padding: "8px 14px", borderRadius: 10, 
              fontSize: 13, fontWeight: 600, 
              color: C.dangerText, background: C.dangerBg, 
              borderColor: "transparent", cursor: "pointer",
            }}
          >
            <Icon name="logout" size={14} color={C.dangerText}/> Logout
          </button>
        </div>
      </div>

    </div>
  );
}