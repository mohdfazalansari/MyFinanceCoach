# Prerequisites: 
# pip install pandas numpy scikit-learn

import pandas as pd
import numpy as np
from datetime import datetime
import random
from sklearn.linear_model import LinearRegression

class ExpensePredictor:
    def __init__(self, transactions_df, monthly_income=50000, budgets=None):
        """
        Initializes the predictor.
        :param transactions_df: DataFrame with 'date', 'amount', 'category'
        :param monthly_income: Expected monthly income (for savings calculation)
        :param budgets: Dictionary of category limits e.g., {'Food & Drink': 5000, 'Shopping': 3000}
        """
        self.df = transactions_df.copy()
        self.df['date'] = pd.to_datetime(self.df['date'], dayfirst=True, format='mixed')
        
        # Filter out income so we only predict expenses
        self.df = self.df[~self.df['category'].isin(['Salary', 'Income', 'Investment'])]
        
        self.monthly_income = monthly_income
        self.budgets = budgets if budgets else {}
        
        # Create a 'YearMonth' column (e.g., '2025-01') for grouping
        self.df['year_month'] = self.df['date'].dt.to_period('M')

    def predict_next_month_expenses(self):
        """
        Predicts next month's expense for each category using Linear Regression 
        (Trend Analysis) and Moving Averages.
        """
        predictions = {}
        total_predicted_spend = 0
        
        # Group by category and month, then sum the amounts
        monthly_category_spend = self.df.groupby(['category', 'year_month'])['amount'].sum().reset_index()
        
        categories = monthly_category_spend['category'].unique()
        
        for category in categories:
            cat_data = monthly_category_spend[monthly_category_spend['category'] == category].copy()
            cat_data = cat_data.sort_values('year_month')
            
            # If we only have 1 month of data, just use that as the prediction
            if len(cat_data) == 1:
                predicted_amount = cat_data['amount'].iloc[0]
                reason = "Based on your only month of data."
            
            # If we have 2 or more months, use Linear Regression to find the trend
            else:
                # Convert dates to numeric values (0, 1, 2...) for regression
                X = np.arange(len(cat_data)).reshape(-1, 1) 
                y = cat_data['amount'].values
                
                model = LinearRegression()
                model.fit(X, y)
                
                # Predict the next month (index = len(cat_data))
                next_month_index = np.array([[len(cat_data)]])
                predicted_amount = model.predict(next_month_index)[0]
                
                # A fallback: If the regression predicts a negative number, use a 3-month moving average
                if predicted_amount < 0:
                    predicted_amount = cat_data['amount'].tail(3).mean()
                    reason = "Based on a moving average."
                else:
                    trend = "increasing" if model.coef_[0] > 0 else "decreasing"
                    reason = f"Based on a {trend} trend over {len(cat_data)} months."

            # Round off and store
            predicted_amount = round(predicted_amount, 2)
            total_predicted_spend += predicted_amount
            
            predictions[category] = {
                "Predicted_Amount": predicted_amount,
                "Explanation": reason
            }
            
        return predictions, round(total_predicted_spend, 2)

    def analyze_budget_risks(self, predictions):
        """
        Compares predicted expenses against user-defined budgets to warn of overspending.
        """
        warnings = []
        safe_categories = []
        
        for category, data in predictions.items():
            predicted = data['Predicted_Amount']
            budget = self.budgets.get(category)
            
            if budget:
                if predicted > budget:
                    over_amount = round(predicted - budget, 2)
                    warnings.append({
                        "Category": category,
                        "Budget": budget,
                        "Predicted": predicted,
                        "Risk": "HIGH",
                        "Message": f"Risk of overspending by ₹{over_amount} based on current trends."
                    })
                else:
                    safe_categories.append(category)
                    
        return {"High_Risk_Categories": warnings, "On_Track_Categories": safe_categories}

    def generate_prediction_report(self):
        """
        Combines predictions, savings estimates, and budget risks into one JSON-ready report.
        """
        predictions, total_predicted = self.predict_next_month_expenses()
        expected_savings = round(self.monthly_income - total_predicted, 2)
        budget_risks = self.analyze_budget_risks(predictions)
        
        # Calculate savings rate (Percentage of income saved)
        savings_rate = round((expected_savings / self.monthly_income) * 100, 1) if self.monthly_income > 0 else 0
        
        return {
            "Total_Predicted_Expenses": total_predicted,
            "Expected_Income": self.monthly_income,
            "Expected_Savings": expected_savings,
            "Projected_Savings_Rate": f"{savings_rate}%",
            "Category_Predictions": predictions,
            "Budget_Analysis": budget_risks
        }

# ==========================================
# DATA LOADING AND TESTING
# ==========================================
def load_transactions_from_csv(filepath):
    print(f"Loading data from {filepath}...")
    df = pd.read_csv(filepath)
    df = df.dropna(subset=['date', 'amount', 'category'])
    return df

if __name__ == "__main__":
    
    # You can link your real dataset here just like the previous module!
    # e.g., csv_path = r"E:\College\...\spending_analysis_dataset.csv"
    csv_path =r"E:\College\8th Placements Preparation\Project\financeIntelligience\ml_Layer\OCR_Training_BankStatement.csv" 
    
    if csv_path:
        df = load_transactions_from_csv(csv_path)
    else:
        # Mocking 4 months of data showing a trend where Food & Drink is increasing
        print("Generating mock data to test Regression trends...")
        dates = pd.date_range(start="2025-11-01", end="2026-02-28", freq='D')
        data = []
        for d in dates:
            # Gradually increasing food spend every month
            food_spend = 500 + (d.month * 50) + random.randint(-50, 50) 
            data.append({"date": d, "amount": food_spend, "category": "Food & Drink"})
            
            # Stable utilities
            if d.day == 5:
                data.append({"date": d, "amount": 2000 + random.randint(-100, 100), "category": "Utilities"})
                
        df = pd.DataFrame(data)
        
    # User's defined budgets for next month
    user_budgets = {
        "Food & Drink": 18000, 
        "Utilities": 2500,
        "Shopping": 5000
    }
    
    print("\nInitializing Future Expense Predictor...")
    predictor = ExpensePredictor(df, monthly_income=60000, budgets=user_budgets)
    report = predictor.generate_prediction_report()
    
    print("\n=== FUTURE FINANCIAL PREDICTION REPORT ===")
    print(f"\n💰 Expected Income: ₹{report['Expected_Income']}")
    print(f"📉 Predicted Total Expenses: ₹{report['Total_Predicted_Expenses']}")
    print(f"🏦 Expected Savings: ₹{report['Expected_Savings']} ({report['Projected_Savings_Rate']})")
    
    print("\n📊 CATEGORY PREDICTIONS FOR NEXT MONTH:")
    for cat, details in report['Category_Predictions'].items():
        print(f"   - {cat}: ₹{details['Predicted_Amount']} ({details['Explanation']})")
        
    print("\n⚠️ BUDGET OVERSPENDING RISKS:")
    if not report['Budget_Analysis']['High_Risk_Categories']:
        print("   ✅ You are on track for all budgeted categories!")
    else:
        for warning in report['Budget_Analysis']['High_Risk_Categories']:
            print(f"   - {warning['Category']}: {warning['Message']} (Limit: ₹{warning['Budget']})")