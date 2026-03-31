// ─── TOAST ────────────────────────────────────────────────────────────────────
import { useEffect } from "react";
import { C } from "../../utils/theme";
import { Icon } from "./Icon";

export default function ToastNotification({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "success" ? C.successBg : type === "error" ? C.dangerBg : "#F3F4F6";
  const col = type === "success" ? C.successText : type === "error" ? C.dangerText : C.text;
  
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: bg, color: col, padding: "12px 20px", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,.12)", fontSize: 14, fontWeight: 500, animation: "slideIn .2s ease", display: "flex", alignItems: "center", gap: 10 }}>
      {msg}
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: col }}>
        <Icon name="x" size={14}/>
      </button>
    </div>
  );
}
