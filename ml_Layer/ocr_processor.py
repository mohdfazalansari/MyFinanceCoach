import re
import pytesseract
from PIL import Image, ImageFilter, ImageEnhance
import io
from datetime import datetime
import fitz  # PyMuPDF

# ⚠️ IMPORTANT FOR WINDOWS USERS ⚠️
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

class ReceiptOCR:
    def __init__(self):
        pass

    def extract_data(self, file_bytes):
        """
        Extracts Merchant, Amount, and Date from Indian UPI Receipts AND Bank Statement PDFs.
        """
        try:
            text = ""
            
            # --- 🌟 CHECK IF FILE IS A PDF 🌟 ---
            if file_bytes.startswith(b'%PDF'):
                doc = fitz.open(stream=file_bytes, filetype="pdf")
                for page in doc:
                    text += page.get_text("text") + "\n"
                
                if len(text.strip()) < 50:
                    text = ""
                    for page in doc:
                        pix = page.get_pixmap(dpi=200) 
                        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                        img = img.convert('L').filter(ImageFilter.SHARPEN)
                        img = ImageEnhance.Contrast(img).enhance(2.0)
                        text += pytesseract.image_to_string(img, config='--psm 4') + "\n"
            else:
                # --- 🌟 STANDARD IMAGE OCR 🌟 ---
                img = Image.open(io.BytesIO(file_bytes))
                img = img.resize((img.width * 2, img.height * 2), Image.LANCZOS)
                img = img.convert('L').filter(ImageFilter.SHARPEN)
                img = ImageEnhance.Contrast(img).enhance(2.0)
                text += pytesseract.image_to_string(img, config='--psm 4')

            lines = [line.strip() for line in text.split('\n') if line.strip()]
            if not lines:
                raise ValueError("No text detected in file")

            # ====================================================================
            # 🌟 MODE 1: BULK BANK STATEMENT DETECTION (DATE-SPLIT) 🌟
            # ====================================================================
            # Bank statements are perfectly divided by Dates. Let's split chunks safely by dates!
            date_pattern = r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b'
            date_matches = list(re.finditer(date_pattern, text))

            if len(date_matches) >= 3:
                transactions = []
                keywords = ['UPI', 'NEFT', 'IMPS', 'RTGS', 'POS', 'NACH', 'AUTO DEBI', 'SALARY']
                keyword_pattern = r'(?i)\b(?:' + '|'.join(keywords) + r')[^\n]{0,40}'
                
                for i, d_match in enumerate(date_matches):
                    chunk_start = d_match.start()
                    chunk_end = date_matches[i+1].start() if i + 1 < len(date_matches) else len(text)
                    chunk = text[chunk_start:chunk_end]
                    
                    k_match = re.search(keyword_pattern, chunk)
                    
                    if k_match:
                        desc_raw = k_match.group(0).strip()
                        merchant = re.sub(r'(?i)\b(debit|credit|dr|cr)\b', '', desc_raw).strip()
                        merchant = re.sub(r'[^a-zA-Z0-9\s/]', '', merchant)[:40].strip()
                        if "swiq" in merchant.lower(): merchant = "Swiggy"

                        date_str = d_match.group(1)

                        # Extract Amount strictly within this isolated date-chunk
                        safe_chunk = re.sub(date_pattern, '', chunk) 
                        safe_chunk = re.sub(r'(?i)(?:a/c|account|ref|txn|id)\s*[-:]*\s*\d+', '', safe_chunk)
                        all_numbers = re.findall(r'(?<![\d\w])(\d{1,7}(?:,\d{2,3})*(?:\.\d{1,2})?)(?![\d\w])', safe_chunk)

                        amount = 0.0
                        valid_amounts = []
                        for num_str in all_numbers:
                            try:
                                val = float(num_str.replace(',', ''))
                                if val > 0 and val not in [2024, 2025, 2026, 2027]:
                                    valid_amounts.append(val)
                            except ValueError:
                                pass

                        if valid_amounts:
                            amount = float(max(valid_amounts))

                        if amount > 0:
                            transactions.append({
                                "merchant": merchant,
                                "amount": amount,
                                "date": date_str,
                                "raw_text": chunk.replace('\n', ' ')
                            })

                if transactions:
                    return {"is_bulk": True, "transactions": transactions}

            # ====================================================================
            # 🌟 MODE 2: SINGLE RECEIPT OCR (Fallback) 🌟
            # ====================================================================
            merchant = "Unknown Merchant"
            merchant_match = re.search(r'(?:to|paid to)\s*:\s*([a-zA-Z0-9 ]+)|\bto\s+([a-zA-Z0-9 ]+)', text, re.IGNORECASE)
            
            if merchant_match:
                raw_merch = merchant_match.group(1) if merchant_match.group(1) else merchant_match.group(2)
                if raw_merch: merchant = raw_merch.strip()
            else:
                for line in lines:
                    lower_line = line.lower()
                    if "payment successful" not in lower_line and "receipt" not in lower_line and "statement" not in lower_line:
                        merchant = line
                        break

            merchant = re.sub(r'[^a-zA-Z0-9\s]', '', merchant)[:40].strip()
            if "swiq" in merchant.lower(): merchant = "Swiggy"

            total_amount = 0.0
            currency_patterns = [
                r'(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)',
                r'(?<![a-zA-Z\d])[zZEF\?=]\s*([\d,]+(?:\.\d{1,2})?)',
                r'(?<!\d)7(\d{2,4}(?:\.\d{1,2})?)(?!\d)',
            ]

            for pattern in currency_patterns:
                m = re.search(pattern, text, re.IGNORECASE)
                if m:
                    amt_str = m.group(1).replace(',', '')
                    try:
                        val = float(amt_str)
                        if val > 0:
                            total_amount = val
                            break
                    except ValueError:
                        continue

            if total_amount == 0.0:
                safe_text = re.sub(r'(?i)(?:bank|a/c|ac|ref|txn|id|no|card|mobile|ending\s*in)\s*[-:]*\s*\d+', '', text)
                all_numbers = re.findall(r'(?<![\d\w])(\d{1,5}(?:,\d{2,3})*(?:\.\d{1,2})?)(?![\d\w])', safe_text)
                valid_amounts = []
                months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
                for num_str in all_numbers:
                    try:
                        val = float(num_str.replace(',', ''))
                    except ValueError: continue
                    if val <= 0 or (2000 <= val <= 2050 and val == int(val)): continue
                    if 1 <= val <= 31:
                        is_date = False
                        for month in months:
                            if re.search(rf'\b{int(val)}\s+{month}', safe_text, re.IGNORECASE):
                                is_date = True
                                break
                        if is_date: continue
                    valid_amounts.append(val)
                if valid_amounts:
                    total_amount = float(max(valid_amounts))

            date_str = datetime.now().strftime("%m/%d/%Y")
            date_match = re.search(r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+[a-zA-Z]{3,9}\s+\d{4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b', text)
            if date_match:
                date_str = date_match.group(1)

            return {
                "is_bulk": False,
                "transactions": [{
                    "merchant": merchant,
                    "amount": total_amount,
                    "date": date_str,
                    "raw_text": text
                }]
            }

        except Exception as e:
            print(f"--- OCR/PDF ERROR ---: {e}")
            return {"is_bulk": False, "transactions": []}