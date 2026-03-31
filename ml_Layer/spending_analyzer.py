# Prerequisites: 
# pip install pandas numpy

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

class SpendingAnalyzer:
    def __init__(self, transactions_df):
        """
        Initializes the analyzer with a Pandas DataFrame of transactions.
        Expected columns: 'date', 'amount', 'category', 'description'
        """
        self.df = transactions_df.copy()
        
        # Ensure 'date' is a proper datetime object. 
        # Added dayfirst=True and format='mixed' to handle non-US date formats (like DD-MM-YYYY)
        self.df['date'] = pd.to_datetime(self.df['date'], dayfirst=True, format='mixed')
        
        # Only analyze outgoing expenses (assuming negative or positive, we'll use absolute values for expenses)
        # For this example, let's assume all positive values passed are expenses, 
        # but filter out 'Salary' or 'Income' categories
        self.df = self.df[~self.df['category'].isin(['Salary', 'Income', 'Investment'])]

    def analyze_fixed_vs_flexible(self):
        """
        Categorizes spending into Fixed (essential, recurring) and Flexible (discretionary).
        """
        fixed_categories = ['Rent', 'Utilities', 'Subscriptions', 'Insurance', 'EMI']
        
        # Create a new column mapping category to Fixed/Flexible
        self.df['spend_type'] = self.df['category'].apply(
            lambda x: 'Fixed' if x in fixed_categories else 'Flexible'
        )
        
        summary = self.df.groupby('spend_type')['amount'].sum().to_dict()
        
        total = sum(summary.values())
        if total == 0: return {"Fixed": 0, "Flexible": 0, "Fixed_Percent": 0, "Flexible_Percent": 0}

        return {
            "Fixed_Total": round(summary.get('Fixed', 0), 2),
            "Flexible_Total": round(summary.get('Flexible', 0), 2),
            "Fixed_Percent": round((summary.get('Fixed', 0) / total) * 100, 1),
            "Flexible_Percent": round((summary.get('Flexible', 0) / total) * 100, 1)
        }

    def analyze_weekend_vs_weekday(self):
        """
        Compares average daily spending on weekends vs weekdays.
        """
        # Day of week: 0=Monday, 6=Sunday. Weekends are 5 and 6.
        self.df['is_weekend'] = self.df['date'].dt.dayofweek >= 5
        
        # Calculate total spend
        weekend_spend = self.df[self.df['is_weekend']]['amount'].sum()
        weekday_spend = self.df[~self.df['is_weekend']]['amount'].sum()
        
        # Calculate number of unique weekends/weekdays in the dataset to find daily averages
        unique_days = self.df['date'].dt.date.nunique()
        # Rough estimation for averages (assuming active spending days)
        weekend_days_count = self.df[self.df['is_weekend']]['date'].dt.date.nunique()
        weekday_days_count = self.df[~self.df['is_weekend']]['date'].dt.date.nunique()
        
        avg_weekend = weekend_spend / weekend_days_count if weekend_days_count else 0
        avg_weekday = weekday_spend / weekday_days_count if weekday_days_count else 0
        
        return {
            "Total_Weekend_Spend": round(weekend_spend, 2),
            "Total_Weekday_Spend": round(weekday_spend, 2),
            "Avg_Daily_Weekend": round(avg_weekend, 2),
            "Avg_Daily_Weekday": round(avg_weekday, 2)
        }

    def get_high_variability_categories(self):
        """
        Identifies categories where spending fluctuates wildly.
        Uses the Coefficient of Variation (CV = Standard Deviation / Mean).
        High CV means the spending is very unpredictable.
        """
        # Group by category and calculate mean and std deviation
        stats = self.df.groupby('category')['amount'].agg(['mean', 'std', 'count'])
        
        # Filter out categories with less than 3 transactions (not enough data)
        stats = stats[stats['count'] >= 3].copy()
        
        # Calculate CV
        stats['cv'] = stats['std'] / stats['mean']
        
        # Sort by highest variability
        stats = stats.sort_values(by='cv', ascending=False)
        
        # Return top 3 highly variable categories
        high_var = stats.head(3)
        
        results = []
        for index, row in high_var.iterrows():
            results.append({
                "Category": index,
                "Average_Spend": round(row['mean'], 2),
                "Variability_Score": round(row['cv'], 2) # Score > 1 means very high variability
            })
            
        return results

    def detect_spending_spikes(self):
        """
        Detects individual transactions that are abnormally high compared to 
        the user's normal spending in that specific category using Z-Scores.
        """
        spikes = []
        
        # Look at each category individually
        for category, group in self.df.groupby('category'):
            if len(group) < 3:
                continue # Need at least 3 items to find a baseline
                
            mean = group['amount'].mean()
            std = group['amount'].std()
            
            if pd.isna(std) or std == 0:
                continue
                
            # Calculate Z-score: (Value - Mean) / Standard Deviation
            # A Z-score > 2 means the transaction is highly unusually large
            group = group.copy()
            group['z_score'] = (group['amount'] - mean) / std
            
            # Filter anomalies
            anomalies = group[group['z_score'] > 2.0]
            
            for _, row in anomalies.iterrows():
                spikes.append({
                    "Date": row['date'].strftime('%Y-%m-%d'),
                    "Category": category,
                    "Description": row['description'],
                    "Amount": round(row['amount'], 2),
                    "Normal_Average": round(mean, 2)
                })
                
        # Sort spikes by highest amount
        spikes = sorted(spikes, key=lambda x: x['Amount'], reverse=True)
        return spikes

    def generate_full_report(self):
        """
        Combines all analysis into one JSON-ready dictionary.
        """
        return {
            "Fixed_vs_Flexible": self.analyze_fixed_vs_flexible(),
            "Weekend_vs_Weekday": self.analyze_weekend_vs_weekday(),
            "High_Variability_Categories": self.get_high_variability_categories(),
            "Recent_Spikes": self.detect_spending_spikes()
        }

# ==========================================
# DATA LOADING UTILITIES
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
    df = df.dropna(subset=['date', 'amount', 'category'])
    return df

def generate_mock_transactions():
    """Generates 3 months of realistic user data to test the analyzer."""
    categories = ['Food & Drink', 'Shopping', 'Travel', 'Utilities', 'Rent', 'Entertainment']
    data = []
    start_date = datetime.now() - timedelta(days=90)
    
    for i in range(150):
        date = start_date + timedelta(days=random.randint(0, 90))
        cat = random.choice(categories)
        
        # Base amounts
        if cat == 'Rent': amt = 15000 + random.randint(-500, 500)
        elif cat == 'Utilities': amt = 2000 + random.randint(-200, 500)
        elif cat == 'Food & Drink': amt = random.randint(200, 1500)
        else: amt = random.randint(300, 3000)
        
        # Inject a few intentional "Spikes"
        if random.random() < 0.02: # 2% chance of a massive spike
            amt = amt * random.randint(3, 5)
            
        data.append({
            "date": date.strftime('%Y-%m-%d'),
            "amount": amt,
            "category": cat,
            "description": f"Test Transaction {i}"
        })
        
    return pd.DataFrame(data)

if __name__ == "__main__":
    
    # Fixed the file path by adding 'r' before the string to treat it as a raw string
    csv_path = r"E:\College\8th Placements Preparation\Project\financeIntelligience\ml_Layer\OCR_Training_BankStatement.csv"
    
    if csv_path:
        df = load_transactions_from_csv(csv_path)
    else:
        print("Generating mock user transaction history...")
        df = generate_mock_transactions()
    
    print("\nInitializing Spending Analyzer...")
    analyzer = SpendingAnalyzer(df)
    
    report = analyzer.generate_full_report()
    
    print("\n=== FINANCIAL BEHAVIOR REPORT ===")
    
    print("\n1. Fixed vs Flexible Spending:")
    print(f"   Fixed: ₹{report['Fixed_vs_Flexible']['Fixed_Total']} ({report['Fixed_vs_Flexible']['Fixed_Percent']}%)")
    print(f"   Flexible: ₹{report['Fixed_vs_Flexible']['Flexible_Total']} ({report['Fixed_vs_Flexible']['Flexible_Percent']}%)")
    
    print("\n2. Weekend vs Weekday Patterns:")
    print(f"   Avg Weekend Spend/Day: ₹{report['Weekend_vs_Weekday']['Avg_Daily_Weekend']}")
    print(f"   Avg Weekday Spend/Day: ₹{report['Weekend_vs_Weekday']['Avg_Daily_Weekday']}")
    
    print("\n3. Unpredictable Spending Categories (High Variability):")
    for cat in report['High_Variability_Categories']:
        print(f"   - {cat['Category']}: Avg ₹{cat['Average_Spend']} (Volatility Score: {cat['Variability_Score']})")
        
    print("\n4. Abnormal Spending Spikes Detected:")
    if not report['Recent_Spikes']:
        print("   No abnormal spikes detected.")
    for spike in report['Recent_Spikes']:
        print(f"   - ₹{spike['Amount']} on {spike['Category']} ({spike['Date']}). Usually you only spend ₹{spike['Normal_Average']}!")