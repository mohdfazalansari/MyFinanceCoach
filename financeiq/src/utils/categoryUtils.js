export const CATEGORIES = [
  "Salary",
  "Rent",
  "Food & Drink",
  "Shopping",
  "Transportation",
  "Utilities",
  "Health & Fitness",
  "Entertainment",
  "Education",
  "Travel",
  "Investment",
  "Other"
];

export const EXPENSE_CATS = [
  "Rent",
  "Food & Drink",
  "Shopping",
  "Transportation",
  "Utilities",
  "Health & Fitness",
  "Entertainment",
  "Education",
  "Travel",
  "Other"
];

// 🌟 UPGRADED: Now accepts the description to catch ML mistakes!
export const normalizeCategory = (cat, desc = "") => {
    const d = (desc || "").toLowerCase();

    // 1. SMART OVERRIDES: Force correct categories based on description keywords
    if (d.includes("ola") || d.includes("uber") || d.includes("rapido") || d.includes("auto") || d.includes("metro") || d.includes("cab")) return "Transportation";
    if (d.includes("flight") || d.includes("hotel") || d.includes("airbnb") || d.includes("makemytrip") || d.includes("irctc")) return "Travel";
    if (d.includes("swiggy") || d.includes("zomato") || d.includes("mcdonald") || d.includes("kfc")) return "Food & Drink";
    if (d.includes("amazon") || d.includes("flipkart") || d.includes("myntra") || d.includes("meesho")) return "Shopping";
    if (d.includes("pharmacy") || d.includes("apollo") || d.includes("clinic") || d.includes("hospital")) return "Health & Fitness";

    // 2. STANDARD NORMALIZATION: Fix spelling mismatches from the ML Model
    if (!cat) return "Other";
    const c = cat.toLowerCase();
    
    if (c.includes("food") || c.includes("drink") || c.includes("dining")) return "Food & Drink";
    if (c.includes("health") || c.includes("fitness") || c.includes("medical")) return "Health & Fitness";
    if (c.includes("transport") || c.includes("transit")) return "Transportation";
    if (c.includes("shop") || c.includes("retail")) return "Shopping";
    if (c.includes("utilit") || c.includes("bill")) return "Utilities";
    if (c.includes("travel") || c.includes("trip")) return "Travel";
    if (c.includes("educat")) return "Education";
    if (c.includes("enter") || c.includes("movie")) return "Entertainment";
    if (c.includes("rent")) return "Rent";
    if (c.includes("salary") || c.includes("income")) return "Salary";
    if (c.includes("invest")) return "Investment";
    
    // Capitalize first letter of each word if it's an unexpected category
    return cat.replace(/\b\w/g, l => l.toUpperCase()); 
};