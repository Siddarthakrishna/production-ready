# Global Parameter System API Documentation

## Overview

This document describes the Global Parameter System implementation that provides a unified data format across all API endpoints in the Sharada Research application. All endpoints now return data in a consistent parameter-based structure.

## Unified Response Format

All API endpoints now return data in this standardized format:

```json
{
  \"data\": [
    {
      \"Symbol\": \"RELIANCE\",
      \"param_0\": 2500.50,
      \"param_1\": 2450.00,
      \"param_2\": 1.2,
      \"param_3\": \"Energy\",
      \"param_4\": \"2025-08-29T10:00:00\"
    }
  ],
  \"name\": \"Endpoint Name\",
  \"timestamp\": \"2025-08-29T10:00:00Z\"
}
```

## Parameter Mapping by Context

### Advance/Decline Data (`/adv-dec/NIFTY`, `/adv-dec/FO`)
- `param_0`: Advance % growth
- `param_1`: Decline % growth
- `param_2`: Net difference
- `param_3`: Net advancing count
- `param_4`: Timestamp

### Weekly Performance (`/study/data/MAJOR INDEX WEEKLY PERFORMANCE`)
- `param_0`: Weekly % change
- `param_1`: Current Price
- `param_2`: Previous Close
- `param_3`: R-Factor
- `param_4`: Timestamp

### Breakout Data (`/swing/highbreak/{days}`, `/swing/lowbreak/{days}`)
- `param_0`: LTP (Last Traded Price)
- `param_1`: Previous Close
- `param_2`: % Change
- `param_3`: Sector
- `param_4`: Date (YYYY-MM-DD)

### Swing Service Data (`/study/symbol/{timeframe}-term-{swing_type}`)
- `param_0`: Price / EMA / Indicator value
- `param_1`: Fib level / EMA summary
- `param_2`: Institutional Flow
- `param_3`: Volume
- `param_4`: Accumulation / Date etc.

### Market Depth Data
- `param_0`: Price
- `param_1`: Previous Close
- `param_2`: % Change
- `param_3`: Volume
- `param_4`: Timestamp

### Money Flux Data
- `param_0`: Heat Value
- `param_1`: Sentiment Score
- `param_2`: PCR Ratio
- `param_3`: Volatility
- `param_4`: Timestamp

### Pro Setup Data
- `param_0`: Price
- `param_1`: % Change
- `param_2`: 5-Min Spike %
- `param_3`: Volume
- `param_4`: Timestamp

## Updated API Endpoints

### Swing Center Module

#### GET `/adv-dec/NIFTY`
Returns advance/decline data for NIFTY in parameter format.

**Response Example:**
```json
{
  \"data\": [
    {
      \"Symbol\": \"NIFTY\",
      \"param_0\": 55.0,
      \"param_1\": 45.0,
      \"param_2\": 10.0,
      \"param_3\": 25,
      \"param_4\": \"2025-08-29T10:30:00\"
    }
  ],
  \"name\": \"NIFTY Advance/Decline\",
  \"timestamp\": \"2025-08-29T10:30:00Z\"
}
```

#### GET `/adv-dec/FO`
Returns advance/decline data for F&O stocks in parameter format.

#### GET `/swing/highbreak/{days}`
Returns stocks breaking to new {days}-day highs.

**Parameters:**
- `days` (path): Number of days for high break calculation
- `count` (query): Maximum number of symbols to return (1-500)

**Response Example:**
```json
{
  \"data\": [
    {
      \"Symbol\": \"RELIANCE\",
      \"param_0\": 2480.50,
      \"param_1\": 2450.00,
      \"param_2\": 1.2,
      \"param_3\": \"Energy\",
      \"param_4\": \"2025-08-29\"
    }
  ],
  \"name\": \"10 DAY HIGH BO\",
  \"timestamp\": \"2025-08-29T10:00:00Z\"
}
```

#### GET `/swing/lowbreak/{days}`
Returns stocks breaking to new {days}-day lows.

#### GET `/study/data/{study_name}`
Returns study data in parameter format.

**Example for Weekly Performance:**
```json
{
  \"data\": [
    {
      \"Symbol\": \"NIFTY 50\",
      \"param_0\": 1.5,
      \"param_1\": 19500.0,
      \"param_2\": 19200.0,
      \"param_3\": 1.2,
      \"param_4\": \"2025-08-29T10:00:00\"
    }
  ],
  \"name\": \"MAJOR INDEX WEEKLY PERFORMANCE\",
  \"timestamp\": \"2025-08-29T10:00:00Z\"
}
```

### Market Depth Module

#### GET `/market-depth/highpower`
Returns high power stocks in parameter format.

#### GET `/market-depth/gainers`
Returns top gainers with ranking in parameter format.

#### GET `/market-depth/losers`
Returns top losers with ranking in parameter format.

### Money Flux Module

#### GET `/moneyflux/heatmap`
Returns heatmap snapshot in parameter format.

**Parameters:**
- `index` (query): Index name (default: \"NIFTY50\")

#### GET `/moneyflux/sentiment`
Returns sentiment analysis in parameter format.

#### GET `/moneyflux/pcr`
Returns PCR calculations in parameter format.

### Pro Setup Module

#### GET `/pro`
Returns all pro setups in parameter format.

#### GET `/pro/spike/5min`
Returns 5-minute spike data in parameter format.

**Parameters:**
- `min_value` (query): Minimum spike value (default: 0.0)

## Frontend Integration

### Using the Parameter System

```javascript
import { getParamValue, formatChartData, PARAM_CONTEXTS } from '../utils/paramUtils';

// Extract parameter values
const price = getParamValue(dataItem, 'param_0');
const change = getParamValue(dataItem, 'param_2');

// Format for charts
const chartData = formatChartData(apiResponse.data, 'Symbol', 'param_0');

// Get context-specific labels
const priceLabel = getContextLabel('BREAKOUT', 'param_0'); // \"LTP (Last Traded Price)\"
```

### Chart Integration Example

```javascript
// For advance/decline visualization
fetch('/adv-dec/NIFTY')
  .then(response => response.json())
  .then(data => {
    const chartData = data.data.map(item => ({
      name: item.Symbol,
      advance: getParamValue(item, 'param_0'),
      decline: getParamValue(item, 'param_1')
    }));
    
    updateChart(chartData);
  });
```

## Migration Guidelines

### For Backend Developers

1. **Update Service Functions:**
   - Import `ParamNormalizer` from `app.services.param_normalizer`
   - Use `ParamNormalizer.normalize(data, module_name=\"your_module\")` to convert data
   - Return the standardized `{data, name, timestamp}` format

2. **Example Service Update:**
```python
from app.services.param_normalizer import ParamNormalizer

def get_your_data():
    # Your existing data retrieval logic
    raw_data = fetch_from_database()
    
    # Normalize to parameter format
    normalized_data = ParamNormalizer.normalize(raw_data, module_name=\"your_module\")
    
    return {
        \"data\": normalized_data,
        \"name\": \"Your Data Name\",
        \"timestamp\": datetime.now().isoformat()
    }
```

### For Frontend Developers

1. **Update Components:**
   - Import utilities from `utils/paramUtils.js`
   - Use `getParamValue()` instead of direct property access
   - Use context-specific labels from `PARAM_CONTEXTS`

2. **Example Component Update:**
```javascript
// Before
const price = data.param_0;

// After
import { getParamValue, getContextLabel } from '../utils/paramUtils';
const price = getParamValue(data, 'param_0');
const priceLabel = getContextLabel('BREAKOUT', 'param_0');
```

## Testing

Run the comprehensive test suite:

```bash
cd backend
python test_parameter_system.py
```

This will validate:
- Global parameter configuration
- Parameter normalizer functionality
- All module implementations
- Format consistency across endpoints

## Benefits

1. **Consistency:** All endpoints return data in the same format
2. **Maintainability:** Centralized parameter definitions
3. **Documentation:** Self-documenting parameter labels
4. **Frontend Efficiency:** Standardized data processing
5. **Type Safety:** Consistent data structures

## Migration Status

✅ **Completed Modules:**
- Swing Center
- Market Depth
- Money Flux
- Pro Setup
- Global Parameter Configuration
- Parameter Normalizer
- Frontend Utilities
- Test Suite

## Support

For questions or issues with the Global Parameter System:
1. Check the test suite output for validation errors
2. Review the parameter mappings in `global_params.py`
3. Ensure proper use of `ParamNormalizer` in backend services
4. Use `paramUtils.js` utilities in frontend components