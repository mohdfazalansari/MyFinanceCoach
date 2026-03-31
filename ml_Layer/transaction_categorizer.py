

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
import joblib
import re

def clean_text(text):
    """
    Cleans the transaction description by making it lowercase 
    and removing special characters/numbers.
    """
    text = str(text).lower()
    # Remove numbers and special characters, keep only letters and spaces
    text = re.sub(r'[^a-z\s]', ' ', text)
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text
    
    # Duplicate and slightly modify data to simulate a larger dataset
    expanded_data = data * 5 
    return pd.DataFrame(expanded_data)

def load_data_from_csv(filepath):
    """
    Loads transaction data from a CSV file.
    The CSV must have at least two columns: 'description' and 'category'.
    """
    print(f"Loading data from {filepath}...")
    df = pd.read_csv(filepath)
    
    # Ensure the required columns exist
    if not {'description', 'category'}.issubset(df.columns):
        raise ValueError("CSV must contain 'description' and 'category' columns.")
        
    # Drop rows with missing values in our target columns
    df = df.dropna(subset=['description', 'category'])
    return df

def train_model(csv_filepath=None):
    print("1. Loading and cleaning data...")
    
    df = load_data_from_csv(csv_filepath)
    
        
    df['clean_desc'] = df['description'].apply(clean_text)
    
    # Split data: 80% for training, 20% for testing
    X_train, X_test, y_train, y_test = train_test_split(
        df['clean_desc'], df['category'], test_size=0.2, random_state=42
    )
    
    print("2. Building the ML Pipeline...")
    # Pipeline: Convert text to vectors -> Train LinearSVC model
    # LinearSVC works great for sparse text data
    model = Pipeline([
        ('vectorizer', TfidfVectorizer(ngram_range=(1, 2))), # Captures single words and word pairs (e.g., "amazon", "amazon retail")
        ('classifier', LinearSVC(random_state=42, dual=False))
    ])
    
    print("3. Training the model...")
    model.fit(X_train, y_train)
    
    print("4. Evaluating the model...")
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    print(f"\nModel Accuracy: {accuracy * 100:.2f}%\n")
    print("Classification Report:")
    print(classification_report(y_test, predictions, zero_division=0))
    
    print("5. Saving the model to disk...")
    joblib.dump(model, 'transaction_categorizer.joblib')
    print("Model saved successfully as 'transaction_categorizer.joblib'")
    
    return model

def predict_transaction(model, text):
    """
    Helper function to test the model with new, unseen data.
    """
    cleaned_text = clean_text(text)
    prediction = model.predict([cleaned_text])[0]
    return prediction

if __name__ == "__main__":
    # 1. Train and save the model
    # To use a real dataset, pass the file path here:
    trained_model = train_model(r"E:\College\8th Placements Preparation\Project\financeIntelligience\ml_Layer\India_Combined_Dataset_3000.csv")
    
    # 2. Test with some unseen dummy transactions
    print("\n--- Testing with Live Transactions ---")
    test_transactions = [
      "flipkart",
      "McDonald's",
      "Myntra",
      "dominos",
      "OLA"    ]
    
    for txn in test_transactions:
        category = predict_transaction(trained_model, txn)
        print(f"Transaction: '{txn}'  -->  Predicted Category: [{category}]")