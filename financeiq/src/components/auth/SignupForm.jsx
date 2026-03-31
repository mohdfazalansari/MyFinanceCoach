import { useState } from "react";
import { C } from "../../utils/theme";
import InputField from "../shared/InputField";

export default function SignupForm({ onSubmit, onSwitch }) {
  // Added state to capture user input
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <>
      <InputField icon="user" type="text" placeholder="John Doe" value={name} onChange={setName} label="Full Name" />
      <InputField icon="mail" type="email" placeholder="your@email.com" value={email} onChange={setEmail} label="Email Address" />
      <InputField icon="lock" type="password" placeholder="••••••••" value={pass} onChange={setPass} label="Create Password" />

      <button 
        className="primary-btn" 
        // 🚀 Pass the captured data back to the parent component
        onClick={() => onSubmit({ name: name, email: email, password: pass })} 
        style={{ width: "100%", justifyContent: "center", marginTop: 4, fontSize: 16 }}
      >
        Create Account
      </button>

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <span style={{ color: C.muted, fontSize: 14 }}>Already have an account? </span>
        <button 
          onClick={onSwitch} 
          style={{ background: "none", border: "none", color: C.primary, fontWeight: 600, cursor: "pointer", fontSize: 14 }}
        >
          Sign In
        </button>
      </div>
    </>
  );
}