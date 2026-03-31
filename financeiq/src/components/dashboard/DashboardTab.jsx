import { C } from "../../utils/theme";
import { fmt } from "../../utils/formatCurrency";
import { Icon } from "../shared/Icon";
import MetricCard from "./MetricCard";
import HealthScoreSection from "./HealthScoreSection";

export default function DashboardTab({ transactions, onAddTxn, onScanReceipt }) {
  const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button className="primary-btn" onClick={onAddTxn}><Icon name="plus" size={16} color="#fff"/> Add Transaction</button>
        <button className="outline-btn" onClick={onScanReceipt}><Icon name="camera" size={16}/> Scan Receipt</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 0 }}>
        <MetricCard label="Total Income" value={fmt(income)} sub="This month" iconName="trending" iconBg="#DCFCE7" iconColor={C.success}/>
        <MetricCard label="Total Expenses" value={fmt(expense)} sub="+32.1% from last month" iconName="trendingDown" iconBg="#FEE2E2" iconColor={C.danger}/>
        <MetricCard label="Net Balance" value={fmt(balance)} sub={`Savings rate: ${savingsRate}%`} iconName="wallet" iconBg="#DBEAFE" iconColor={C.blueText}/>
        <MetricCard label="Transactions" value={transactions.length} sub="This month" iconName="activity" iconBg="#EDE9FE" iconColor={C.purple}/>
      </div>
      <HealthScoreSection transactions={transactions}/>
    </div>
  );
}