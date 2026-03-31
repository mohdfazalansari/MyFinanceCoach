import { C } from "../../utils/theme";
import { Icon } from "../shared/Icon";
import { fmt } from "../../utils/formatCurrency";
import StatusBadge from "../shared/StatusBadge";

export default function SubscriptionsTab({ transactions = [] }) {
  
  // 🌟 THE FIX: Smart Grouping Dictionary to merge variations (e.g. RENT/02 and RENT/03)
  const detectSubscriptions = () => {
    const subDictionary = [
      { key: "netflix", name: "Netflix" },
      { key: "prime", name: "Amazon Prime" },
      { key: "spotify", name: "Spotify" },
      { key: "hotstar", name: "Disney+ Hotstar" },
      { key: "youtube", name: "YouTube Premium" },
      { key: "apple", name: "Apple Services" },
      { key: "gym", name: "Gym Membership" },
      { key: "broadband", name: "Broadband/WiFi" },
      { key: "wifi", name: "Broadband/WiFi" },
      { key: "electricity", name: "Electricity Bill" },
      { key: "bescom", name: "BESCOM Electricity" },
      { key: "bses", name: "BSES Electricity" },
      { key: "water", name: "Water Bill" },
      { key: "bill", name: "Utility Bill" },
      { key: "recharge", name: "Mobile Recharge" },
      { key: "jio", name: "Jio Services" },
      { key: "airtel", name: "Airtel Services" },
      { key: "vi", name: "Vi Services" },
      { key: "rent", name: "House Rent" }, // Groups ALL rent transactions together
      { key: "emi", name: "EMI Payment" }
    ];

    const activeSubsMap = {};
    
    // Sort descending to guarantee we process the most recent payment first
    const sortedTxns = [...transactions].sort((a, b) => b.ts - a.ts);

    sortedTxns.forEach(t => {
      if (t.type === "income") return; // Skip income
      
      const descLower = (t.desc || "").toLowerCase();
      const matchedSub = subDictionary.find(k => descLower.includes(k.key));
      
      // A transaction is a subscription if marked recurring OR if it matches our dictionary
      if (t.recurring || matchedSub) {
        // Group by the normalized name (e.g., "House Rent"), or raw desc if marked manually
        const groupKey = matchedSub ? matchedSub.name : t.desc.trim();
        
        if (!activeSubsMap[groupKey]) {
          // Find all historical payments matching this GROUP to calculate Total Paid & Start Date
          const allPayments = transactions.filter(tx => {
            const txDescLower = (tx.desc || "").toLowerCase();
            return matchedSub ? txDescLower.includes(matchedSub.key) : txDescLower === descLower;
          });
          
          const totalPaid = allPayments.reduce((sum, tx) => sum + tx.amount, 0);
          const oldestTxn = allPayments.reduce((oldest, tx) => tx.ts < oldest.ts ? tx : oldest, allPayments[0]);
          
          // Detect Yearly Plans (e.g. Amazon Prime / Gym) so they don't inflate the monthly cost
          let normalizedMonthly = t.amount;
          const isYearly = t.amount > 800 && (groupKey.includes("Prime") || groupKey.includes("Hotstar") || groupKey.includes("Gym"));
          if (isYearly) normalizedMonthly = t.amount / 12;

          activeSubsMap[groupKey] = {
            id: t.id,
            name: groupKey,
            category: t.cat,
            monthly: normalizedMonthly, 
            started: oldestTxn.date || t.date, 
            total: totalPaid,
            isYearly
          };
        }
      }
    });

    return Object.values(activeSubsMap);
  };

  const detectedSubscriptions = detectSubscriptions();
  const monthlyTotal = detectedSubscriptions.reduce((s, sub) => s + sub.monthly, 0);
  const yearlyTotal = monthlyTotal * 12;

  return (
    <div className="card animate-in">
      <div className="section-title">
        <Icon name="calendar" size={20}/> Recurring Subscriptions
      </div>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}>
        Automatically detected recurring payments and active utility plans.
      </p>

      {/* ─── METRICS CARDS ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20, marginBottom: 36 }}>
        <div style={{ background: C.purpleBg, border: `1px solid #DDD6FE`, borderRadius: 16, padding: 24, boxShadow: "0 4px 14px rgba(124, 58, 237, 0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#C4B5FD", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="dollar" size={16} color={C.purple}/>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.purple, letterSpacing: "0.3px" }}>Monthly Commitment</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: C.purple }}>{fmt(monthlyTotal)}</div>
          <div style={{ fontSize: 13, color: C.purple, opacity: 0.8, marginTop: 6, fontWeight: 500 }}>{detectedSubscriptions.length} grouped subscriptions</div>
        </div>

        <div style={{ background: C.blueBg, border: `1px solid #BFDBFE`, borderRadius: 16, padding: 24, boxShadow: "0 4px 14px rgba(29, 78, 216, 0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#93C5FD", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="trending" size={16} color={C.blueText}/>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.blueText, letterSpacing: "0.3px" }}>Yearly Projection</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: C.blueText }}>{fmt(yearlyTotal)}</div>
          <div style={{ fontSize: 13, color: C.blueText, opacity: 0.8, marginTop: 6, fontWeight: 500 }}>Estimated annual cost</div>
        </div>
      </div>

      {/* ─── SUBSCRIPTIONS LIST ─── */}
      <div>
        <h4 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>Active Plans</h4>
        {detectedSubscriptions.length === 0 ? (
           <div style={{ padding: 40, textAlign: "center", color: C.muted, background: "#F9FAFB", borderRadius: 16, border: `1px solid ${C.border}` }}>
             No recurring subscriptions detected yet.
           </div>
        ) : (
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            {detectedSubscriptions.map((sub, index) => (
              <div 
                key={sub.id} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  padding: "20px 24px",
                  borderBottom: index === detectedSubscriptions.length - 1 ? "none" : `1px solid ${C.border}`,
                  background: "#fff",
                  transition: "background 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#F9FAFB"}
                onMouseOut={(e) => e.currentTarget.style.background = "#fff"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name="activity" size={20} color={C.muted}/>
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: C.text, textTransform: "capitalize" }}>{sub.name}</span>
                      <StatusBadge variant="gray">{sub.category}</StatusBadge>
                      {sub.isYearly && <StatusBadge variant="purple" style={{ fontSize: 10 }}>Annual Plan</StatusBadge>}
                    </div>
                    <div style={{ fontSize: 13, color: C.muted, display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="calendar" size={12}/> Started: {sub.started}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>
                    {fmt(sub.monthly)}<span style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>/mo</span>
                  </div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 4, fontWeight: 500 }}>Total paid: {fmt(sub.total)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}