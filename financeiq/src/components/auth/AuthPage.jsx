import { useState } from "react";
import { C } from "../../utils/theme";
import { Icon } from "../shared/Icon";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function AuthPage({ onLogin, onSignup }) {
  const [mode, setMode] = useState("login");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Icon name="trending" size={26} color="#fff"/>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text }}>MyFinanceCoach</h1>
        <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>Intelligent Expense Tracking &amp; Financial Analytics</p>
      </div>

      <div style={{ background: C.surface, borderRadius: 20, padding: 32, width: "100%", maxWidth: 440, boxShadow: "0 4px 24px rgba(66, 14, 14, 0.06)" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color : C.text}}>Welcome</h2>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>Sign in to your account or create a new one</p>

        <div style={{ display: "flex", background: "#F3F4F6", borderRadius: 999, padding: 4, marginBottom: 24 }}>
          {["login", "signup"].map(m => (
            <button 
              key={m} 
              onClick={() => setMode(m)} 
              style={{ 
                flex: 1, padding: "10px 0", borderRadius: 999, fontSize: 14, fontWeight: 600, 
                background: mode === m ? "#fff" : "transparent", color: mode === m ? C.text : C.muted, 
                boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,.1)" : "none", transition: "all .2s", border: "none" 
              }}
            >
              {m === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* 🚀 Route the correct API function to the correct form! */}
        {mode === "login" ? (
          <LoginForm onSubmit={onLogin} onDemo={onLogin} />
        ) : (
          <SignupForm onSubmit={onSignup} onSwitch={() => setMode("login")} />
        )}

        <div style={{ marginTop: 24, display: "flex", gap: 6, fontSize: 12, color: C.muted }}>
          <span>🔒</span>
          <div>
            Connected to Spring Boot API & PostgreSQL.
            <br/><span style={{ color: C.successText, fontWeight: 600 }}>Secure JWT session active.</span>
          </div>
        </div>
      </div>
    </div>
  );
}