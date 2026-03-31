import { C } from "../../utils/theme";
import { Icon } from "../shared/Icon";

export default function MetricCard({ label, value, sub, iconName, iconBg, iconColor }) {
  return (
    <div className="metric-card">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>{label}</div>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={iconName} size={16} color={iconColor}/>
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 12, color: C.text }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
