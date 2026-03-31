import { C } from "../../utils/theme";
import { Trash2 } from "lucide-react";
import { fmt } from "../../utils/formatCurrency";
import { Icon } from "../shared/Icon";
import StatusBadge from "../shared/StatusBadge";

export default function TransactionRow({ txn, item, transaction, onEdit, onDelete, ...rest }) {
  const isIncome = txn.type === "income";
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "20px 0", borderBottom: `1px solid ${C.border}` }}>
      
      {/* LEFT: Icon, Category, Recurring, Date */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: isIncome ? "#DCFCE7" : "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={isIncome ? "trending" : "trendingDown"} size={18} color={isIncome ? C.success : C.danger}/>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <StatusBadge variant="gray">{txn.cat}</StatusBadge>
          {txn.recurring && <StatusBadge variant="gray">Recurring</StatusBadge>}
          <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{txn.date}</span>
        </div>
      </div>

      {/* CENTER: Description */}
      <div style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", padding: "0 16px" }}>
        {txn.desc}
      </div>

      {/* RIGHT: Amount & Edit */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16, flex: 1, flexShrink: 0 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: isIncome ? C.success : C.danger }}>
          {isIncome ? "+" : "-"}₹{fmt(txn.amount)}
        </span>
        {/* 🚀 Delete Button */}
        <button onClick={() => onDelete(txn.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.danger, padding: 4 }}>
          <Trash2 size={16} />
        </button>
      </div>

    </div>
  );
}