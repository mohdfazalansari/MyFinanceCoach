import { C } from "../../utils/theme";
import { Icon } from "../shared/Icon";

const TABS = [
  { id: "transactions", label: "Transactions", icon: "table" },
  { id: "budgets", label: "Budgets", icon: "credit" },
  { id: "analysis", label: "Analysis", icon: "barChart" },
  { id: "insights", label: "Insights", icon: "lightbulb" },
  { id: "predictions", label: "Predictions", icon: "trending" },
  { id: "whatif", label: "What-If", icon: "table" },
  { id: "subscriptions", label: "Subscriptions", icon: "calendar" },
];

export default function TabBar({ active, onChange }) {
  return (
    <div className="tab-bar">
      {TABS.map(t => (
        <button key={t.id} className={`tab-btn${active === t.id ? " active" : ""}`} onClick={() => onChange(t.id)}>
          <Icon name={t.icon} size={14}/> {t.label}
        </button>
      ))}
    </div>
  );
}