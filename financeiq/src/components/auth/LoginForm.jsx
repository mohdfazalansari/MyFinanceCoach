import { useState } from "react";
import { C } from "../../utils/theme";
import InputField from "../shared/InputField";

export default function LoginForm({ onSubmit, onDemo }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <>
      <InputField icon="mail" type="email" placeholder="your@email.com" value={email} onChange={setEmail} label="Email" />
      <InputField icon="lock" type="password" placeholder="••••••••" value={pass} onChange={setPass} label="Password" />

      <button 
        className="primary-btn" 
        // 🚀 Updated: Now passes the actual email and password to the Auth Hook!
        onClick={() => onSubmit({ email: email, password: pass })} 
        style={{ width: "100%", justifyContent: "center", marginTop: 4, fontSize: 16 }}
      >
        Login
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
        <div style={{ flex: 1, height: 1, background: C.border }} />
        <span style={{ color: C.muted, fontSize: 13 }}>Or</span>
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>

      <button 
        className="outline-btn" 
        onClick={() => onDemo({ name: "Demo User", email: "demo@example.com" })} 
        style={{ width: "100%", justifyContent: "center", fontSize: 15, fontWeight: 600 }}
      >
        Continue with Demo Account
      </button>
    </>
  );
}