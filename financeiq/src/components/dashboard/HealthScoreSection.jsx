import { C } from "../../utils/theme";
import { Icon } from "../shared/Icon";
import ProgressBar from "../shared/ProgressBar";

const ScoreRing = ({ score }) => {
  const r = 52, cx = 68, cy = 68;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  
  return (
    <svg width="136" height="136" viewBox="0 0 136 136">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth="8"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={score > 60 ? C.success : C.primary} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: "stroke-dashoffset 0.6s ease" }}/>
      <text x={cx} y={cy - 6} textAnchor="middle" fill={score > 60 ? C.successText : C.primary} fontSize="26"
        fontWeight="700">{score}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill={C.muted} fontSize="13">/ 100</text>
    </svg>
  );
};

export default function HealthScoreSection({ transactions }) {
  // 1. Check if we actually have data
  const hasData = transactions && transactions.length > 0;

  // 2. Calculate real totals
  const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  
  // 3. Dynamic Sub-scores
  const savingsRateRaw = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
  const savingsRate = Math.max(0, Math.min(savingsRateRaw, 100)); // Clamp 0-100
  
  const budgetDiscipline = hasData ? (expense > income ? 30 : 90) : 0;
  const expenseConsistency = hasData ? 75 : 0; 
  const emergencyFund = hasData ? (savingsRate > 20 ? 85 : 40) : 0;

  // 4. Overall Dynamic Score
  const overallScore = hasData 
    ? Math.round((savingsRate + budgetDiscipline + expenseConsistency + emergencyFund) / 4) 
    : 0;

  const metrics = [
    { label: "Savings Rate", value: savingsRate, icon: "trending", color: C.success },
    { label: "Budget Discipline", value: budgetDiscipline, icon: "shield", color: C.primary },
    { label: "Expense Consistency", value: expenseConsistency, icon: "activity", color: C.muted },
    { label: "Emergency Fund", value: emergencyFund, icon: "trendingDown", color: C.danger },
  ];

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="section-title"><Icon name="shield" size={18}/> Financial Health Score</div>
      
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
        <ScoreRing score={overallScore}/>
        <p style={{ color: C.muted, fontSize: 14, marginTop: 12, textAlign: "center", padding: "0 16px" }}>
          {!hasData 
            ? "Add your first transaction to calculate your financial health score." 
            : overallScore > 70 
              ? "Good financial health! Keep up the great discipline." 
              : "Your financial health needs attention. Try reducing unnecessary expenses."}
        </p>
      </div>
      
      {metrics.map(m => (
        <div key={m.label} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500 }}>
              <Icon name={m.icon} size={14} color={m.color}/> {m.label}
            </div>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{m.value}%</span>
          </div>
          <ProgressBar value={m.value} color={m.value === 0 ? "#E5E7EB" : m.color} />
        </div>
      ))}

      <div style={{ background: C.blueBg, borderRadius: 10, padding: 14, marginTop: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.blueText, marginBottom: 6 }}>Score Components:</p>
        {[
          "Savings Rate: Target 20%+ of income", 
          "Budget Discipline: Spend less than you earn", 
          "Expense Consistency: Reduce volatility", 
          "Emergency Fund: Maintain 6+ months"
        ].map(s => (
          <p key={s} style={{ fontSize: 13, color: C.blueText, marginBottom: 2 }}>• {s}</p>
        ))}
      </div>
    </div>
  );
}