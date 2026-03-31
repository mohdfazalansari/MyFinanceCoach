import pandas as pd
from datetime import datetime
import random

class InsightGenerator:
    def __init__(self, transactions_df):
        """
        Initializes the insight generator with transaction data.
        Expected columns: 'date', 'amount', 'category', 'description'
        """
        self.df = transactions_df.copy()
        self.df['date'] = pd.to_datetime(self.df['date'], dayfirst=True, format='mixed')
        
        # Filter out income
        self.df = self.df[~self.df['category'].isin(['Salary', 'Income', 'Investment'])]
        
        # Add helper columns for analysis
        self.df['year_month'] = self.df['date'].dt.to_period('M')
        self.df['is_weekend'] = self.df['date'].dt.dayofweek >= 5

    def generate_insights(self):
        """
        Analyzes the data to generate human-readable, actionable insights.
        """
        insights = []
        
        # Get the two most recent months in the dataset
        months_available = sorted(self.df['year_month'].unique())
        if len(months_available) < 2:
            return ["We need at least two months of data to generate comparison insights."]
            
        current_month = months_available[-1]
        previous_month = months_available[-2]
        
        df_current = self.df[self.df['year_month'] == current_month]
        df_prev = self.df[self.df['year_month'] == previous_month]
        
        # 1. Overall Spending Change Insight
        total_current = df_current['amount'].sum()
        total_prev = df_prev['amount'].sum()
        
        if total_current > total_prev:
            diff = total_current - total_prev
            percent_increase = round((diff / total_prev) * 100) if total_prev > 0 else 100
            
            # Find the "Culprit" (the category that increased the most)
            cat_current = df_current.groupby('category')['amount'].sum()
            cat_prev = df_prev.groupby('category')['amount'].sum()
            
            # Combine and find difference
            cat_diff = cat_current.subtract(cat_prev, fill_value=0)
            if not cat_diff.empty:
                top_culprit = cat_diff.idxmax()
                top_culprit_amount = cat_diff.max()
                
                if top_culprit_amount > 0:
                    # Drill down further: Was it due to weekends?
                    weekend_insight = self._check_weekend_surge(df_current, df_prev, top_culprit)
                    
                    base_insight = f"Your expenses increased by {percent_increase}% (₹{diff:,.0f}) this month. "
                    if weekend_insight:
                        insights.append(base_insight + f"This was primarily driven by {top_culprit}, where {weekend_insight}.")
                    else:
                        insights.append(base_insight + f"The biggest driver was {top_culprit}, which rose by ₹{top_culprit_amount:,.0f}.")

        elif total_current < total_prev:
            diff = total_prev - total_current
            percent_decrease = round((diff / total_prev) * 100) if total_prev > 0 else 100
            
            # Find the "Hero" (the category where they saved the most)
            cat_current = df_current.groupby('category')['amount'].sum()
            cat_prev = df_prev.groupby('category')['amount'].sum()
            cat_diff = cat_prev.subtract(cat_current, fill_value=0)
            if not cat_diff.empty:
                top_hero = cat_diff.idxmax()
                
                insights.append(f"Great job! Your expenses dropped by {percent_decrease}% (₹{diff:,.0f}) this month. You saved the most on {top_hero}.")

        # 2. Merchant Specific Insight (e.g., "Swiggy orders rose")
        merchant_insight = self._analyze_top_merchants(df_current, df_prev)
        if merchant_insight:
            insights.append(merchant_insight)
            
        return insights

    def _check_weekend_surge(self, df_current, df_prev, category):
        """
        Helper method to check if a category's increase was driven by weekend spending.
        """
        curr_cat = df_current[df_current['category'] == category]
        prev_cat = df_prev[df_prev['category'] == category]
        
        curr_weekend_spend = curr_cat[curr_cat['is_weekend']]['amount'].sum()
        prev_weekend_spend = prev_cat[prev_cat['is_weekend']]['amount'].sum()
        
        if prev_weekend_spend > 0 and curr_weekend_spend > prev_weekend_spend:
            increase_pct = round(((curr_weekend_spend - prev_weekend_spend) / prev_weekend_spend) * 100)
            if increase_pct > 20: # Only report if it's a significant surge
                return f"weekend spending rose by {increase_pct}%"
        return None

    def _analyze_top_merchants(self, df_current, df_prev):
        """
        Identifies if a specific merchant (e.g., Zomato, Amazon) saw a massive spike.
        """
        # A simple heuristic: grab the first word of the description as the 'Merchant'
        df_current_copy = df_current.copy()
        df_prev_copy = df_prev.copy()
        
        # 🌟 THE FIX: Safe parsing for empty descriptions
        def get_merchant_name(desc):
            parts = str(desc).split()
            return parts[0].upper() if parts else "UNKNOWN"

        df_current_copy['merchant'] = df_current_copy['description'].apply(get_merchant_name)
        df_prev_copy['merchant'] = df_prev_copy['description'].apply(get_merchant_name)
        
        curr_merchants = df_current_copy.groupby('merchant')['amount'].sum()
        prev_merchants = df_prev_copy.groupby('merchant')['amount'].sum()
        
        merch_diff = curr_merchants.subtract(prev_merchants, fill_value=0)
        
        # Filter out common non-merchants (like UPI, NEFT) AND the new "UNKNOWN" fallback
        ignore_list = ['UPI', 'UPI/CR', 'NEFT', 'RTGS', 'POS', 'UNKNOWN']
        merch_diff = merch_diff[~merch_diff.index.isin(ignore_list)]
        
        if not merch_diff.empty:
            top_merch = merch_diff.idxmax()
            top_diff = merch_diff.max()
            
            if top_diff > 1000: # Only alert if they spent at least 1000 more on this merchant
                return f"Watch out for {top_merch}: You spent ₹{top_diff:,.0f} more there this month compared to last month."
                
        return None

# ==========================================
# DATA LOADING AND TESTING
# ==========================================
def load_transactions_from_csv(filepath):
    """
    Loads real transaction data from a CSV file.
    The CSV must have: 'date', 'amount', 'category', 'description'
    """
    print(f"Loading real data from {filepath}...")
    df = pd.read_csv(filepath)
    
    # Check if all required columns exist
    required_cols = {'date', 'amount', 'category', 'description'}
    if not required_cols.issubset(df.columns):
        raise ValueError(f"CSV must contain these exact column names: {required_cols}")
        
    # Drop rows missing crucial analysis data
    df = df.dropna(subset=['date', 'amount', 'category', 'description'])
    return df

if __name__ == "__main__":
    # To use a real dataset, change 'None' to your file path string.
    csv_path = r"E:\College\8th Placements Preparation\Project\financeIntelligience\ml_Layer\OCR_Training_BankStatement.csv" 
    
    try:
        df = load_transactions_from_csv(csv_path)
        
        print("Generating Intelligent Insights...\n")
        generator = InsightGenerator(df)
        insights = generator.generate_insights()
        
        print("=== YOUR FINANCIAL INSIGHTS ===")
        if not insights:
            print("💡 No significant insights generated for this period.")
        else:
            for idx, insight in enumerate(insights, 1):
                print(f"💡 Insight {idx}: {insight}")
    except Exception as e:
        print(f"Failed to load testing data: {e}")