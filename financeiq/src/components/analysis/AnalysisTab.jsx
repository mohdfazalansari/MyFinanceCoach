import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { C } from "../../utils/theme";
import { fmt } from "../../utils/formatCurrency";
import { Icon } from "../shared/Icon";

export default function AnalysisTab({ transactions = [] }) {
  // 1. DYNAMIC DATA CALCULATIONS
  const expenses = transactions.filter(t => t.type === "expense");

  // Pie Chart: Spending by Category
  const catMap = {};
  expenses.forEach(t => { catMap[t.cat] = (catMap[t.cat] || 0) + t.amount; });
  const COLORS = ["#6366F1", "#8B5CF6", "#F59E0B", "#EC4899", "#10B981", "#3B82F6", "#EF4444", "#6B7280"];
  const pieData = Object.entries(catMap).map(([name, value], i) => ({ 
    name, value, color: COLORS[i % COLORS.length] 
  }));

  // Line Chart: Monthly Trend
  const monthMap = {};
  expenses.forEach(t => {
    const d = new Date(t.ts || t.date);
    const monthYear = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    monthMap[monthYear] = (monthMap[monthYear] || 0) + t.amount;
  });
  const trendData = Object.entries(monthMap).map(([month, expenses]) => ({ month, expenses })).reverse();

  // Fixed vs Flexible
  const fixedCats = ["Rent", "Utilities", "Healthcare", "Education", "Insurance"];
  let fixed = 0, flexible = 0;
  expenses.forEach(t => {
    if (fixedCats.includes(t.cat)) fixed += t.amount;
    else flexible += t.amount;
  });
  const fixedFlexData = [
    { name: "Fixed", amount: fixed }, 
    { name: "Flexible", amount: flexible }
  ];

  // Weekend vs Weekday
  let weekend = 0, weekday = 0;
  expenses.forEach(t => {
    const day = new Date(t.ts || t.date).getDay();
    if (day === 0 || day === 6) weekend += t.amount; 
    else weekday += t.amount;
  });
  const wkndData = [
    { name: "Weekend", amount: weekend }, 
    { name: "Weekday", amount: weekday }
  ];

  if (transactions.length === 0) {
    return <div style={{ padding: 40, textAlign: "center", color: C.muted }}>No data available. Add transactions to see analysis.</div>;
  }

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card">
        <div className="section-title"><Icon name="trending" size={18}/> Spending by Category</div>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={110} dataKey="value" label={({ name, value }) => `${name} (₹${fmt(value)})`} labelLine>
              {pieData.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
            </Pie>
            <Tooltip formatter={(v) => `₹${fmt(v)}`}/>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div className="section-title"><Icon name="calendar" size={18}/> Monthly Spending Trend</div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false}/>
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.muted }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize: 12, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}/>
            <Tooltip formatter={v => `₹${fmt(v)}`} contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,.08)" }}/>
            <Legend iconType="circle" iconSize={8}/>
            <Line type="monotone" dataKey="expenses" stroke={C.primary} strokeWidth={2} dot={{ fill: C.primary, r: 4 }} activeDot={{ r: 6 }}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Fixed vs Flexible</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fixedFlexData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: C.muted }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 12, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={v => `₹${fmt(v)}`} cursor={{fill: 'transparent'}}/>
              <Bar dataKey="amount" fill={C.primary} radius={[6, 6, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Weekend vs Weekday</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={wkndData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: C.muted }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 12, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={v => `₹${fmt(v)}`} cursor={{fill: 'transparent'}}/>
              <Bar dataKey="amount" fill={C.purple} radius={[6, 6, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}