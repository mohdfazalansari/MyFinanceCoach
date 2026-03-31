# Prerequisites: 
# pip install pandas numpy

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

class FinancialHealthScorer:
    def __init__(self, transactions_df, monthly_income, budgets, emergency_fund_balance):
        """
        Initializes the scorer.
        :param transactions_df: DataFrame with 'date', 'amount', 'category'
        :param monthly_income: User's declared monthly income
        :param budgets: Dict of category budgets e.g., {'Food & Drink': 5000}
        :param emergency_fund_balance: Current savings specifically set aside for emergencies
        """
        self.df = transactions_df.copy()
        self.df['date'] = pd.to_datetime(self.df['date'], dayfirst=True, format='mixed')
        self.df = self.df[~self.df['category'].isin(['Salary', 'Income', 'Investment'])]
        self.df['year_month'] = self.df['date'].dt.to_period('M')
        
        self.monthly_income = monthly_income
        self.budgets = budgets if budgets else {}
        self.emergency_fund_balance = emergency_fund_balance
        
        # Calculate monthly totals
        self.monthly_totals = self.df.groupby('year_month')['amount'].sum()
        self.avg_monthly_spend = self.monthly_totals.mean() if not self.monthly_totals.empty else 0

    def get_savings_score(self):
        """Max 25 points. Target: Saving 20% or more of income."""
        if self.monthly_income <= 0:
            return 0, "No income reported."
            
        savings = self.monthly_income - self.avg_monthly_spend
        savings_rate = savings / self.monthly_income
        
        # Scale: 20% savings = 25 pts. 0% savings = 0 pts.
        score = min(25, max(0, (savings_rate / 0.20) * 25))
        
        if score == 25: msg = "Excellent savings rate (>= 20%)."
        elif score > 12: msg = f"Moderate savings rate ({savings_rate*100:.1f}%)."
        else: msg = "Low savings rate. You are spending most of your income."
        
        return round(score), msg

    def get_emergency_fund_score(self):
        """Max 25 points. Target: 6 months of average expenses saved."""
        if self.avg_monthly_spend <= 0:
            return 0, "Not enough expense data to calculate."
            
        months_covered = self.emergency_fund_balance / self.avg_monthly_spend
        
        # Scale: 6 months = 25 pts. 0 months = 0 pts.
        score = min(25, max(0, (months_covered / 6.0) * 25))
        
        if score == 25: msg = "Strong emergency fund (6+ months)."
        elif score > 12: msg = f"Decent emergency fund ({months_covered:.1f} months covered)."
        else: msg = f"Vulnerable emergency fund ({months_covered:.1f} months covered). Target is 3-6 months."
        
        return round(score), msg

    def get_budget_discipline_score(self):
        """Max 25 points. Target: Zero overspending across budgeted categories."""
        if not self.budgets:
            return 12, "No budgets set. (Neutral score given)"
            
        # Get the most recent month's data
        latest_month = self.df['year_month'].max()
        recent_df = self.df[self.df['year_month'] == latest_month]
        
        total_overspend = 0
        total_budgeted = sum(self.budgets.values())
        
        for cat, limit in self.budgets.items():
            spent = recent_df[recent_df['category'] == cat]['amount'].sum()
            if spent > limit:
                total_overspend += (spent - limit)
                
        if total_budgeted == 0: return 0, "Invalid budget targets."
        
        overspend_ratio = total_overspend / total_budgeted
        # Scale: 0% overspend = 25 pts. 50% or more overspend = 0 pts.
        score = max(0, 25 - (overspend_ratio / 0.50) * 25)
        
        if score == 25: msg = "Perfect budget discipline."
        elif score > 12: msg = "Slight budget overspending recently."
        else: msg = "Severe budget overspending detected."
        
        return round(score), msg

    def get_expense_consistency_score(self):
        """Max 25 points. Target: Low Month-over-Month volatility."""
        if len(self.monthly_totals) < 2:
            return 12, "Not enough months to check consistency."
            
        # Calculate Coefficient of Variation (Std Dev / Mean)
        std_dev = self.monthly_totals.std()
        cv = std_dev / self.avg_monthly_spend if self.avg_monthly_spend > 0 else 0
        
        # Scale: CV <= 0.05 (very consistent) = 25 pts. CV >= 0.30 (highly volatile) = 0 pts.
        score = max(0, 25 - ((cv - 0.05) / 0.25) * 25)
        score = min(25, score) # Cap at 25
        
        if score > 20: msg = "Highly consistent monthly spending."
        elif score > 10: msg = "Moderate variation in monthly expenses."
        else: msg = "Highly erratic month-to-month spending patterns."
        
        return round(score), msg

    def generate_report(self):
        """Compiles scores and generates actionable insights."""
        s_score, s_msg = self.get_savings_score()
        e_score, e_msg = self.get_emergency_fund_score()
        b_score, b_msg = self.get_budget_discipline_score()
        c_score, c_msg = self.get_expense_consistency_score()
        
        total_score = s_score + e_score + b_score + c_score
        
        # Determine the weakest link to generate the main insight
        scores_dict = {
            "Savings Rate": s_score,
            "Emergency Fund": e_score,
            "Budget Discipline": b_score,
            "Expense Consistency": c_score
        }
        
        weakest_area = min(scores_dict, key=scores_dict.get)
        
        # Generate insight text based on weakest area
        if total_score >= 80:
            health_status = "Excellent"
            insight = f"Your financial health is excellent! To improve even further, focus on your {weakest_area}."
        elif total_score >= 60:
            health_status = "Good"
            insight = f"Your financial health is good, but your score is being dragged down by your {weakest_area}."
        elif total_score >= 40:
            health_status = "Fair"
            insight = f"Your financial health needs attention. Your score decreased primarily due to low {weakest_area}."
        else:
            health_status = "Poor"
            insight = f"Critical financial warning. Urgent improvement needed in {weakest_area}."

        return {
            "Total_Score": total_score,
            "Status": health_status,
            "Main_Insight": insight,
            "Breakdown": {
                "Savings_Score": {"points": s_score, "message": s_msg},
                "Emergency_Fund_Score": {"points": e_score, "message": e_msg},
                "Budget_Discipline": {"points": b_score, "message": b_msg},
                "Expense_Consistency": {"points": c_score, "message": c_msg}
            }
        }

# ==========================================
# DATA LOADING AND TESTING
# ==========================================
def load_transactions_from_csv(filepath):
    print(f"Loading real data from {filepath}...")
    df = pd.read_csv(filepath)
    df = df.dropna(subset=['date', 'amount', 'category'])
    return df

def generate_mock_history():
    """Generates 4 months of transactions indicating a user who overspends."""
    data = []
    start_date = datetime.now() - timedelta(days=120)
    
    # Month 1 to 4: Gradually increasing spending (bad consistency, low savings)
    for i in range(120):
        date = start_date + timedelta(days=i)
        base_amount = 500 + (i * 10) # Spending increases over time
        
        data.append({"date": date.strftime('%Y-%m-%d'), "amount": base_amount, "category": "Food & Drink"})
        if i % 5 == 0:
            data.append({"date": date.strftime('%Y-%m-%d'), "amount": 2000, "category": "Shopping"})
            
    return pd.DataFrame(data)

if __name__ == "__main__":
    
    # You can link your real dataset here:
    csv_path = r"E:\College\8th Placements Preparation\Project\financeIntelligience\ml_Layer\spending_analysis_dataset.csv" 
    
    if csv_path:
        df = load_transactions_from_csv(csv_path)
    else:
        print("Loading mock transaction history (Simulating an over-spender)...")
        df = generate_mock_history()
    
    # User Profile Data (These would come from your Spring Boot Database)
    user_income = 50000 
    user_emergency_fund = 40000 # Only ~1 month of expenses saved
    user_budgets = {
        "Food & Drink": 15000, # They are likely overspending this in our mock data
        "Shopping": 5000
    }
    
    print("\nCalculating Financial Health Score...\n")
    scorer = FinancialHealthScorer(df, user_income, user_budgets, user_emergency_fund)
    report = scorer.generate_report()
    
    print("========================================")
    print(f"🏥 OVERALL FINANCIAL HEALTH: {report['Total_Score']} / 100 ({report['Status']})")
    print("========================================")
    print(f"💡 AI Insight: {report['Main_Insight']}\n")
    
    print("📊 SCORE BREAKDOWN:")
    for key, data in report['Breakdown'].items():
        name = key.replace('_', ' ')
        print(f"   - {name}: {data['points']}/25 pts")
        print(f"     └─ {data['message']}")