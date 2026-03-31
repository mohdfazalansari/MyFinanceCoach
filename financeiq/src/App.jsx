import { useState, useCallback } from "react";
import "./App.css"; // The global styles
import { useAuth } from "./hooks/useAuth";
import { useFinanceData } from "./hooks/useFinanceData";

// Components
import AuthPage from "./components/auth/AuthPage";
import Navbar from "./components/layout/Navbar";
import TabBar from "./components/layout/TabBar";
import DashboardTab from "./components/dashboard/DashboardTab";
import TransactionsTab from "./components/transactions/TransactionsTab";
import BudgetsTab from "./components/budgets/BudgetsTab";
import AnalysisTab from "./components/analysis/AnalysisTab";
import InsightsTab from "./components/insights/InsightsTab";
import PredictionsTab from "./components/predictions/PredictionsTab";
import WhatIfTab from "./components/whatif/WhatIfTab";
import SubscriptionsTab from "./components/subscriptions/SubscriptionsTab";
import ToastNotification from "./components/shared/ToastNotification";

// Import modals (Note: Put these in components/shared or components/transactions in a real project)
import AddTransactionModal from "./components/transactions/AddTransactionModal";
import AddBudgetModal from "./components/budgets/AddBudgetModal";
import ScanReceiptModal from "./components/transactions/ScanReceiptModal";

export default function App() {
  const { user, login, signup, logout } = useAuth();
  const { transactions, budgets, addTransaction, addBudget, deleteTransaction, deleteBudget } = useFinanceData(user);
  
  const [tab, setTab] = useState("transactions");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
  }, []);

  if (!user) return <AuthPage onLogin={login} onSignup={signup}/>;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar user={user} onLogout={logout}/>
      <div style={{ maxWidth: "100%", padding: "24px 32px" }}>
        <DashboardTab 
          transactions={transactions} 
          onAddTxn={() => setModal("addTxn")} 
          onScanReceipt={() => setModal("scan")}
        />

        <div style={{ marginTop: 28 }}>
          <TabBar active={tab} onChange={setTab}/>
          {tab === "transactions" && <TransactionsTab transactions={transactions} onDelete={deleteTransaction} />}
          {tab === "budgets" && <BudgetsTab budgets={budgets} transactions={transactions} onDelete={deleteBudget} onAdd={() => setModal("addBudget")}/>}
          {tab === "analysis" && <AnalysisTab transactions={transactions}/>}
          
          {/* 🌟 THE FIX: Pass live transactions to Insights & Predictions so they are never 0! 🌟 */}
          {tab === "insights" && <InsightsTab transactions={transactions} />}
          {tab === "predictions" && <PredictionsTab transactions={transactions} />}
          
          {tab === "whatif" && <WhatIfTab transactions={transactions}/>}
          {tab === "subscriptions" && <SubscriptionsTab transactions={transactions}/>}
        </div>
      </div>

      {modal === "addTxn" && (
        <AddTransactionModal 
          onClose={() => setModal(null)} 
          onAdd={(txn) => {
            // 1. Add it to your global state
            addTransaction(txn);
            // 2. Show a success popup
            showToast("Transaction added successfully!");
            // 3. Close the modal
            setModal(null);
          }}
        />
      )}
      
      {modal === "scan" && (
        <ScanReceiptModal 
          onClose={() => setModal(null)} 
          onAdd={(txn) => {
            addTransaction(txn);
            showToast("Scanned receipt saved!");
            setModal(null);
          }}
        />
      )}
      
      {modal === "addBudget" && (
        <AddBudgetModal 
          onClose={() => setModal(null)} 
          onAdd={(budget) => {
            addBudget(budget);
            showToast("Budget created successfully!");
            setModal(null);
          }}
        />
      )}

      {toast && <ToastNotification msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
    </div>
  );
}