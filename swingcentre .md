wing Center – README.md
1. Overview

This module powers the Swing Center dashboard, which shows:

Advance/Decline growth (NIFTY & FO)

Swing Breakouts (10-day & 50-day, both UP/DOWN)

Weekly index performance (bar charts)

It follows a param system to ensure frontend & backend always communicate with a unified JSON format.

2. Unified Param System

Every dataset returned by the backend must follow this format:

{
  "data": [
    {
      "Symbol": "XYZ",
      "param_0": <primary metric>,
      "param_1": <secondary metric>,
      "param_2": <supporting value>,
      "param_3": <supporting value>,
      "param_4": <date or extra field>
    }
  ],
  "name": "<study or endpoint name>",
  "timestamp": "<ISO timestamp>"
}

| Context / Table/Chart              | param\_0                      | param\_1                | param\_2           | param\_3 | param\_4                 |
| ---------------------------------- | ----------------------------- | ----------------------- | ------------------ | -------- | ------------------------ |
| **Advance/Decline (NIFTY/FO)**     | Advance % growth              | Decline % growth        | —                  | —        | —                        |
| **Weekly Performance (Bar Chart)** | Weekly % change               | Current Price           | Previous Close     | R-Factor | Timestamp                |
| **10-Day BO (Short-term UP/DOWN)** | LTP (Last Traded Price)       | Previous Close          | % Change           | Sector   | Date (YYYY-MM-DD)        |
| **50-Day BO (Long-term UP/DOWN)**  | LTP (Last Traded Price)       | Previous Close          | % Change           | Sector   | Date (YYYY-MM-DD)        |
| **Swing Service (Custom)**         | Price / EMA / Indicator value | Fib level / EMA summary | Institutional Flow | Volume   | Accumulation / Date etc. |

3. Backend Responsibilities (Python swing.py)
a) Always Return in Param Format

Every FastAPI endpoint must return a data array of objects using the above schema.

Example for /swing/highbreak/10:

{
  "data": [
    {
      "Symbol": "RELIANCE",
      "param_0": 2480.50,   // LTP
      "param_1": 2450.00,   // Prev Close
      "param_2": 1.2,       // % Change
      "param_3": "Energy",  // Sector
      "param_4": "2025-08-27" // Date
    }
  ],
  "name": "10 DAY HIGH BO",
  "timestamp": "2025-08-27T10:00:00"
}

b) Perform Calculations in Backend

The backend must calculate values and map them into params:

% Change = (LTP - PrevClose) / PrevClose * 100 → param_2

Advance % Growth = (Advancing Stocks / Total) * 100 → param_0

Decline % Growth = (Declining Stocks / Total) * 100 → param_1

R-Factor / Accumulation / Fib levels → computed by StudyService → placed in respective params.

👉 The frontend does not calculate – it only reads param_* and displays.

c) Endpoint Rules

/adv-dec/NIFTY → must return {data: [{param_0, param_1}]}

/adv-dec/FO → same as above

/study/data/MAJOR INDEX WEEKLY PERFORMANCE → must return param_0–4 (weekly change, price, prev close, R-factor, date)

/swing/highbreak/{days} → must return breakout stocks in param format

/swing/lowbreak/{days} → same

4. Frontend Responsibilities (swing_center.js)

Call backend routes via AJAX.

Expect consistent response.data with param_0 … param_4.

No calculations in frontend – only renders what backend sends.

Example:

dataSet[i] = { x: value.Symbol, y: value.param_0 }; // already calculated

5. Example Workflow (NIFTY A/D Growth)

Frontend → calls /adv-dec/NIFTY.

Backend → queries data source, computes:

param_0 = % Advance

param_1 = % Decline

JSON returned:

{
  "data": [{ "param_0": 55.0, "param_1": 45.0 }],
  "name": "NIFTY Advance/Decline",
  "timestamp": "2025-08-27T10:30:00"
}


Frontend → updates chart with param_0.

6. Action Items for Dev Team

Backend Team
Update all swing.py endpoints to output in unified param format.
Ensure calculations (advance/decline, % change, breakout detection) happen in Python, not JS.
Add timestamps consistently.
Frontend Team
Remove any redundant calculations.
Only use param_* values as provided.
Standardize UI mappings:
Tables → Symbol + param_0..4
Carts → param_0 (main Y value)

QA
Verify every endpoint responds with {data: [...]}.
Validate param mappings across all contexts.
✅ With this setup:
Python does all calculations
Frontend just visualizes params
Both are always aligned via unified param schema

