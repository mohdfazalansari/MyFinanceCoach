"""
Run this standalone to see the exact 422 validation errors from FastAPI.
Place in ml_Layer/ and run: python debug_422.py
"""
import requests, json

BASE = "http://localhost:8000"

# ── 1. What Spring Boot actually sends for predict-category ──────────────────
# mlRequestDto fields: description, merchant, amount
predict_category_payload = {
    "description": "Swiggy order",
    "merchant": "Swiggy",
    "amount": 450.0
}

# ── 2. What Spring Boot actually sends for analysis endpoints ────────────────
# analyzeRequestDto fields (with @JsonProperty):
#   @JsonProperty("Monthly Income")  -> key is "Monthly Income" (with space!)
#   emergency_fund_balance           -> snake_case
#   budgets                          -> Map<String, BigDecimal>
#   transactions                     -> List<transactionItemDto>
# transactionItemDto fields: date, amount, category, description

analysis_payload_spring = {
    "Monthly Income": 50000.0,          # <-- Spring sends THIS (has a space, capital M)
    "emergency_fund_balance": 20000.0,
    "budgets": {"Food & Drink": 5000.0},
    "transactions": [
        {"date": "2026-03-01T00:00:00", "amount": 500.0, "category": "Food & Drink", "description": "Swiggy"}
    ]
}

# ── 3. What FastAPI's AnalysisRequest Pydantic model expects ─────────────────
# class TransactionItem(BaseModel):
#     date: str
#     amount: float
#     category: str
#     description: str
#
# class AnalysisRequest(BaseModel):
#     transactions: List[TransactionItem]
#     monthly_income: Optional[float] = 0.0          # <-- snake_case, no space
#     emergency_fund_balance: Optional[float] = 0.0
#     budgets: Optional[Dict[str, float]] = {}

print("=" * 60)
print("TEST 1: /api/predict-category")
print("Sending:", json.dumps(predict_category_payload, indent=2))
r = requests.post(f"{BASE}/api/predict-category", json=predict_category_payload)
print(f"Status: {r.status_code}")
print("Response:", r.json())

print("\n" + "=" * 60)
print("TEST 2: /api/generate-insights  (with Spring's 'Monthly Income' key)")
print("Sending:", json.dumps(analysis_payload_spring, indent=2))
r = requests.post(f"{BASE}/api/generate-insights", json=analysis_payload_spring)
print(f"Status: {r.status_code}")
print("Response:", r.json())

# ── 4. What FastAPI actually needs ───────────────────────────────────────────
analysis_payload_fixed = {
    "monthly_income": 50000.0,          # <-- snake_case, what Pydantic expects
    "emergency_fund_balance": 20000.0,
    "budgets": {"Food & Drink": 5000.0},
    "transactions": [
        {"date": "2026-03-01T00:00:00", "amount": 500.0, "category": "Food & Drink", "description": "Swiggy"}
    ]
}

print("\n" + "=" * 60)
print("TEST 3: /api/generate-insights  (with fixed 'monthly_income' key)")
print("Sending:", json.dumps(analysis_payload_fixed, indent=2))
r = requests.post(f"{BASE}/api/generate-insights", json=analysis_payload_fixed)
print(f"Status: {r.status_code}")
print("Response:", r.json())