// ─── INPUT FIELD ──────────────────────────────────────────────────────────────
import { C } from "../../utils/theme";
import { Icon } from "./Icon";

export default function InputField({ icon, type = "text", placeholder, value, onChange, label }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: C.text }}>{label}</label>}
      <div className="input-wrap">
        <span className="input-icon"><Icon name={icon} size={15} color="#9CA3AF"/></span>
        <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}/>
      </div>
    </div>
  );
}
