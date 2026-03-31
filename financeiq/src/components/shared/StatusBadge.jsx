import { C } from "../../utils/theme";

export default function StatusBadge({ children, variant = "gray", style }) {
  const bg = variant === "danger" ? C.dangerBg : variant === "success" ? C.successBg : variant === "purple" ? C.purpleBg : "#F3F4F6";
  const color = variant === "danger" ? C.dangerText : variant === "success" ? C.successText : variant === "purple" ? C.purple : "#374151";
  return (
    <span className="pill" style={{ background: bg, color: color, ...style }}>
      {children}
    </span>
  );
}