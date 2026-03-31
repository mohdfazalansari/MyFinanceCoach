import { useState, useEffect } from "react";
import { normalizeCategory } from "../utils/categoryUtils";

export function useFinanceData(user) {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);

  // Fetch Transactions
  useEffect(() => {
    if (!user || !user.token || user.token === "demo") return;
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/transactions/user/${user.id}`, {
          headers: { "Authorization": `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.map(t => ({
            id: t.id,
            desc: t.merchant || t.description,
            // ✅ Pass BOTH category AND description so keyword overrides work
            cat: normalizeCategory(t.category, t.merchant || t.description),
            type: t.type.toLowerCase(),
            amount: t.amount,
            date: t.transactionDate,
            ts: new Date(t.transactionDate).getTime(),
            recurring: false
          })));
        }
      } catch (e) { console.error(e); }
    };
    fetchTransactions();
  }, [user]);

  // Fetch Budgets
  useEffect(() => {
    if (!user || !user.token || user.token === "demo") return;
    const fetchBudgets = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/budgets/user/${user.id}`, {
          headers: { "Authorization": `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBudgets(data.map(b => ({
            ...b,
            category: normalizeCategory(b.category)
          })));
        }
      } catch (e) { console.error(e); }
    };
    fetchBudgets();
  }, [user]);

  // Add Transaction
  const addTransaction = async (txn) => {
    // ✅ FIX 1: Resolve the correct category on the FRONTEND first,
    // using both the user-selected category AND the description keyword overrides.
    // This ensures "ola" → "Transportation" BEFORE sending to backend,
    // so the backend ML model cannot override it with the wrong category.
    const resolvedCategory = normalizeCategory(txn.cat, txn.desc);

    const payload = {
      amount: txn.amount,
      merchant: txn.desc,
      description: txn.desc,
      category: resolvedCategory, // ✅ FIX 1: Send resolved category to backend
      type: txn.type.toUpperCase(),
      transactionDate: new Date(txn.ts).toISOString().split('T')[0] + "T00:00:00",
      userId: user.id,
      userid: user.id
    };

    try {
      const res = await fetch("http://localhost:8080/api/v1/transactions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${user.token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        setTransactions(prev => [{
          id: saved.id,
          desc: saved.merchant,
          // ✅ FIX 2: Pass description here too, so keyword overrides fire
          // even if the backend somehow returns the wrong category.
          cat: normalizeCategory(saved.category, saved.merchant || saved.description),
          type: saved.type.toLowerCase(),
          amount: saved.amount,
          date: saved.transactionDate,
          ts: new Date(saved.transactionDate).getTime(),
          recurring: false
        }, ...prev]);
      }
    } catch (e) { console.error(e); }
  };

  // DELETE Transaction
  const deleteTransaction = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/transactions/${id}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (res.ok) setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (e) { console.error(e); }
  };

  // DELETE Budget
  const deleteBudget = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/budgets/${id}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (res.ok) setBudgets(prev => prev.filter(b => b.id !== id));
    } catch (e) { console.error(e); }
  };

  // ADD Budget
  const addBudget = async (budgetData) => {
    const currentMonthYear = new Date().toISOString().slice(0, 7);

    const payload = {
      category: normalizeCategory(budgetData.category),
      limitAmount: Number(budgetData.amount || budgetData.limit || 0),
      monthYear: currentMonthYear,
      userId: user.id
    };

    try {
      const res = await fetch("http://localhost:8080/api/v1/budgets", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedBudget = await res.json();
        setBudgets(prev => [...prev, {
          ...savedBudget,
          category: normalizeCategory(savedBudget.category)
        }]);
      } else {
        console.error("Failed to save budget to database");
      }
    } catch (e) {
      console.error("Network error while saving budget", e);
    }
  };

  return { transactions, budgets, addTransaction, addBudget, deleteTransaction, deleteBudget };
}