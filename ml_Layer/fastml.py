"""
fastml.py  —  Finance Intelligence ML Engine
Handles all field-name variants that Spring Boot may send,
regardless of which version of analyzeRequestDto.java is deployed.
"""
from fastapi import FastAPI, Request, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import pandas as pd
import joblib, json

from spending_analyzer import SpendingAnalyzer
from expense_predictor import ExpensePredictor
from insight_generator import InsightGenerator
from financial_score_generator import FinancialHealthScorer
from transaction_categorizer import predict_transaction

from ocr_processor import ReceiptOCR

app = FastAPI(title="Finance Intelligence Engine")

# --- 🌟 ADD CORS SO REACT CAN UPLOAD DIRECTLY 🌟 ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"], # React ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Load ML model ─────────────────────────────────────────────────────────────
try:
    print("Loading ML Categorisation model...")
    ml_model = joblib.load("transaction_categorizer.joblib")
    print("Model loaded successfully!")
except FileNotFoundError:
    print("WARNING: Model file not found. Run transaction_categorizer.py first.")
    ml_model = None

# Initialize OCR Engine
ocr_engine = ReceiptOCR()

# ══════════════════════════════════════════════════════════════════════════════
# PYDANTIC MODELS
# ══════════════════════════════════════════════════════════════════════════════

class TransactionData(BaseModel):
    """
    For POST /api/predict-category — sent by mlPredictionSerivce.java
    Both fields are Optional so a null value from Java never causes a 422.
    """
    description: Optional[str] = ""
    merchant:    Optional[str] = ""
    amount:      Optional[float] = 0.0


class TransactionItem(BaseModel):
    date:        str
    amount:      float
    category:    Optional[str] = "Uncategorized"
    description: Optional[str] = ""


class AnalysisRequest(BaseModel):
    monthly_income:          float = 0.0
    emergency_fund_balance:  float = 0.0
    budgets:                 Dict[str, float] = {}
    transactions:            List[TransactionItem] = []


# ══════════════════════════════════════════════════════════════════════════════
# HELPER — parse raw body accepting ALL income field name variants
# ══════════════════════════════════════════════════════════════════════════════

async def parse_analysis_body(request: Request) -> AnalysisRequest:
    """
    Spring Boot's analyzeRequestDto may send the monthly income field as:
        "Monthly Income"   original @JsonProperty("Monthly Income")  — has a space
        "monthly_income"   snake_case alias added in the fix
        "monthlyIncome"    plain camelCase fallback

    Rather than relying on Pydantic aliases (which only accept ONE alias),
    we read the raw JSON dict and resolve the key ourselves.
    This works regardless of which version of analyzeRequestDto.java is deployed.
    """
    raw = await request.body()
    try:
        data: dict = json.loads(raw)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    # Resolve income — try every known variant, first non-None wins
    income = (
        data.get("monthly_income") or
        data.get("Monthly Income") or
        data.get("monthlyIncome") or
        0.0
    )

    emergency = (
        data.get("emergency_fund_balance") or
        data.get("emergencyFundBalance") or
        0.0
    )

    budgets   = data.get("budgets") or {}
    raw_txns  = data.get("transactions") or []

    transactions = [
        TransactionItem(
            date        = str(t.get("date", "")),
            amount      = float(t.get("amount", 0)),
            category    = t.get("category") or "Uncategorized",
            description = t.get("description") or ""
        )
        for t in raw_txns
    ]

    return AnalysisRequest(
        monthly_income         = float(income),
        emergency_fund_balance = float(emergency),
        budgets                = {k: float(v) for k, v in budgets.items()},
        transactions           = transactions
    )


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/api/predict-category")
async def predict_category(data: TransactionData):
    """Predicts category for a single transaction."""
    merchant    = data.merchant    or ""
    description = data.description or ""
    combined    = f"{merchant} {description}".strip()

    if not combined:
        return {"category": "Others", "confidenceScore": 1.0}

    try:
        if ml_model:
            prediction = predict_transaction(ml_model, combined)
            return {"category": str(prediction), "confidenceScore": 0.85}
        return {"category": "Uncategorized", "confidenceScore": 0.0}
    except Exception as e:
        print(f"ML Prediction failed: {e}")
        return {"category": "Uncategorized", "confidenceScore": 0.0}


@app.post("/api/analyze-spending")
async def analyze_spending(request: Request):
    req = await parse_analysis_body(request)
    if not req.transactions:
        return SpendingAnalyzer(pd.DataFrame()).generate_full_report()
    df = pd.DataFrame([t.model_dump() for t in req.transactions])
    return SpendingAnalyzer(df).generate_full_report()


@app.post("/api/predict-expenses")
async def predict_expenses(request: Request):
    req = await parse_analysis_body(request)
    if not req.transactions:
        return ExpensePredictor(pd.DataFrame()).generate_prediction_report()
    df = pd.DataFrame([t.model_dump() for t in req.transactions])
    return ExpensePredictor(df, req.monthly_income, req.budgets).generate_prediction_report()


@app.post("/api/generate-insights")
async def generate_insights(request: Request):
    req = await parse_analysis_body(request)
    if not req.transactions:
        return {"insights": []}
    df = pd.DataFrame([t.model_dump() for t in req.transactions])
    return {"insights": InsightGenerator(df).generate_insights()}


@app.post("/api/financial-health")
async def financial_health(request: Request):
    req = await parse_analysis_body(request)
    if not req.transactions:
        return FinancialHealthScorer(pd.DataFrame(), req.monthly_income, req.budgets, req.emergency_fund_balance).generate_report()
    
    df = pd.DataFrame([t.model_dump() for t in req.transactions])
    scorer = FinancialHealthScorer(
        transactions_df        = df,
        monthly_income         = req.monthly_income,
        budgets                = req.budgets,
        emergency_fund_balance = req.emergency_fund_balance
    )
    return scorer.generate_report()

@app.post("/api/ocr/scan")
async def scan_receipt(receipt: UploadFile = File(...)):
    """Accepts an image or PDF, extracts text, and predicts categories for 1 or more transactions."""
    
    contents = await receipt.read()
    extracted_data = ocr_engine.extract_data(contents)
    
    # Check if we actually got transactions back
    if not extracted_data.get("transactions"):
        raise HTTPException(status_code=400, detail="Could not extract data from document")
    
    results = []
    
    # 🌟 CRITICAL FIX: Loop through ALL transactions (restored array logic)
    for txn in extracted_data.get("transactions", []):
        category = "Uncategorized"
        merchant = txn.get("merchant", "Unknown Merchant")
        raw_text = txn.get("raw_text", "")
        
        if ml_model and raw_text:
            combined_text = f"{merchant} {raw_text[:100]}"
            try:
                category = str(predict_transaction(ml_model, combined_text))
            except Exception as e:
                print(f"ML Prediction on OCR failed: {e}")

        results.append({
            "desc": str(merchant),
            "amount": float(txn.get("amount", 0.0)),
            "cat": category,
            "date": str(txn.get("date", ""))
        })

    return {
        "is_bulk": bool(extracted_data.get("is_bulk", False)),
        "transactions": results # 🌟 Returns the full array for the React UI!
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)