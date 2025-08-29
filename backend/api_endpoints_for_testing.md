# API Endpoints for Testing

## Base URL
```
https://api.sharadaresearch.in
```

## Swing Center Module
```
GET https://api.sharadaresearch.in/swing/adv-dec/NIFTY
GET https://api.sharadaresearch.in/swing/adv-dec/FO
GET https://api.sharadaresearch.in/swing/study/data/MAJOR%20INDEX%20WEEKLY%20PERFORMANCE
GET https://api.sharadaresearch.in/swing/study/symbol/short-term-bullish?count=20
GET https://api.sharadaresearch.in/swing/study/symbol/short-term-bearish?count=20
GET https://api.sharadaresearch.in/swing/study/symbol/long-term-bullish?count=20
GET https://api.sharadaresearch.in/swing/study/symbol/long-term-bearish?count=20
```

## Money Flux Module
```
GET https://api.sharadaresearch.in/money_flux/heatmap/NIFTY50
GET https://api.sharadaresearch.in/money_flux/heatmap/BANKNIFTY
GET https://api.sharadaresearch.in/money_flux/heatmap/FINNIFTY
GET https://api.sharadaresearch.in/money_flux/heatmap/MIDCAP
GET https://api.sharadaresearch.in/money_flux/heatmap/SENSEX
GET https://api.sharadaresearch.in/money_flux/get_running_expiry
GET https://api.sharadaresearch.in/money_flux/chart-patterns/NIFTY50
GET https://api.sharadaresearch.in/money_flux/chart-patterns/BANKNIFTY
GET https://api.sharadaresearch.in/money_flux/chart-patterns/FINNIFTY
GET https://api.sharadaresearch.in/money_flux/chart-patterns/MIDCAP
GET https://api.sharadaresearch.in/money_flux/chart-patterns/SENSEX
GET https://api.sharadaresearch.in/money_flux/enhanced-heatmap/NIFTY50
GET https://api.sharadaresearch.in/money_flux/enhanced-heatmap/BANKNIFTY
GET https://api.sharadaresearch.in/money_flux/enhanced-heatmap/FINNIFTY
GET https://api.sharadaresearch.in/money_flux/enhanced-heatmap/MIDCAP
GET https://api.sharadaresearch.in/money_flux/enhanced-heatmap/SENSEX
```

## Index Analysis Module
```
GET https://api.sharadaresearch.in/index_analysis/index_analysis/NIFTY50
GET https://api.sharadaresearch.in/index_analysis/index_analysis/BANKNIFTY
GET https://api.sharadaresearch.in/index_analysis/index_analysis/FINNIFTY
GET https://api.sharadaresearch.in/index_analysis/index_analysis/MIDCAP
GET https://api.sharadaresearch.in/index_analysis/index_analysis/SENSEX
GET https://api.sharadaresearch.in/index_analysis/get_running_expiry
GET https://api.sharadaresearch.in/index_analysis/live_oi?index=NIFTY50
GET https://api.sharadaresearch.in/index_analysis/live_oi?index=BANKNIFTY
GET https://api.sharadaresearch.in/index/NIFTY50/comprehensive-option-analysis
GET https://api.sharadaresearch.in/index/BANKNIFTY/comprehensive-option-analysis
GET https://api.sharadaresearch.in/index/FINNIFTY/comprehensive-option-analysis
GET https://api.sharadaresearch.in/index/MIDCAP/comprehensive-option-analysis
GET https://api.sharadaresearch.in/index/SENSEX/comprehensive-option-analysis
```

## Market Depth Module
```
GET https://api.sharadaresearch.in/market-depth/highpower
GET https://api.sharadaresearch.in/market-depth/intraday-boost
GET https://api.sharadaresearch.in/market-depth/top-level
GET https://api.sharadaresearch.in/market-depth/low-level
GET https://api.sharadaresearch.in/market-depth/gainers
GET https://api.sharadaresearch.in/market-depth/losers
```

## Pro Setup Module
```
GET https://api.sharadaresearch.in/pro/spike/5min
GET https://api.sharadaresearch.in/pro/spike/10min
GET https://api.sharadaresearch.in/pro/bullish-divergence/15
GET https://api.sharadaresearch.in/pro/bearish-divergence/15
GET https://api.sharadaresearch.in/pro/bullish-divergence/1h
GET https://api.sharadaresearch.in/pro/bearish-divergence/1h
GET https://api.sharadaresearch.in/pro/multi-resistance
GET https://api.sharadaresearch.in/pro/multi-support
GET https://api.sharadaresearch.in/pro/unusual-volume
```

## Scanner Module
```
POST https://api.sharadaresearch.in/unified/fetch_hd_data_fno
POST https://api.sharadaresearch.in/unified/fetch_hd_data_n500
POST https://api.sharadaresearch.in/unified/fetch_dsp_data_fno
POST https://api.sharadaresearch.in/unified/fetch_dsp_data_n500
GET https://api.sharadaresearch.in/unified/hd_hist
```

## Sectorial Flow Module
```
# Legacy Endpoints
GET https://api.sharadaresearch.in/sector/heatmap
GET https://api.sharadaresearch.in/sector/IT
GET https://api.sharadaresearch.in/sector/Banking
GET https://api.sharadaresearch.in/sector/Pharma
GET https://api.sharadaresearch.in/sector/Auto
GET https://api.sharadaresearch.in/sector/FMCG

# Enhanced Heatmap Endpoints
GET https://api.sharadaresearch.in/sector/heatmap/sectors
GET https://api.sharadaresearch.in/sector/heatmap/sectors?sector_filter=NIFTY50
GET https://api.sharadaresearch.in/sector/heatmap/sectors?sector_filter=BANKNIFTY
GET https://api.sharadaresearch.in/sector/heatmap/sectors?sector_filter=NIFTYAUTO
GET https://api.sharadaresearch.in/sector/heatmap/sectors?sector_filter=NIFTYFINSERVICE
GET https://api.sharadaresearch.in/sector/heatmap/sectors?sector_filter=NIFTYFMCG
GET https://api.sharadaresearch.in/sector/heatmap/sectors?sector_filter=CNXIT
GET https://api.sharadaresearch.in/sector/heatmap/sectors?sector_filter=NIFTYMEDIA
GET https://api.sharadaresearch.in/sector/heatmap/sectors?sector_filter=NIFTYMETAL
GET https://api.sharadaresearch.in/sector/heatmap/sectors?sector_filter=CNXPHARMA
GET https://api.sharadaresearch.in/sector/heatmap/sectors?sector_filter=NIFTYPSUBANK
GET https://api.sharadaresearch.in/sector/heatmap/sectors?sector_filter=NIFTYPVTBANK
GET https://api.sharadaresearch.in/sector/heatmap/sectors?sector_filter=CNXREALTY
GET https://api.sharadaresearch.in/sector/heatmap/sectors?sector_filter=CNXENERGY
GET https://api.sharadaresearch.in/sector/heatmap/stocks/NIFTY50
GET https://api.sharadaresearch.in/sector/heatmap/stocks/BANKNIFTY
GET https://api.sharadaresearch.in/sector/heatmap/stocks/NIFTYAUTO
GET https://api.sharadaresearch.in/sector/heatmap/stocks/NIFTYFINSERVICE
GET https://api.sharadaresearch.in/sector/heatmap/stocks/NIFTYFMCG
GET https://api.sharadaresearch.in/sector/heatmap/stocks/CNXIT
GET https://api.sharadaresearch.in/sector/heatmap/stocks/NIFTYMEDIA
GET https://api.sharadaresearch.in/sector/heatmap/stocks/NIFTYMETAL
GET https://api.sharadaresearch.in/sector/heatmap/stocks/CNXPHARMA
GET https://api.sharadaresearch.in/sector/heatmap/stocks/NIFTYPSUBANK
GET https://api.sharadaresearch.in/sector/heatmap/stocks/NIFTYPVTBANK
GET https://api.sharadaresearch.in/sector/heatmap/stocks/CNXREALTY
GET https://api.sharadaresearch.in/sector/heatmap/stocks/CNXENERGY
GET https://api.sharadaresearch.in/sector/heatmap/stocks
GET https://api.sharadaresearch.in/sector/summary
```

## FII/DII Module
```
GET https://api.sharadaresearch.in/fii-dii/net
GET https://api.sharadaresearch.in/fii-dii/breakdown
```

## F&O Module
```
GET https://api.sharadaresearch.in/fno/RELIANCE/expiry
GET https://api.sharadaresearch.in/fno/RELIANCE/oi
GET https://api.sharadaresearch.in/fno/RELIANCE/option-chain
GET https://api.sharadaresearch.in/fno/RELIANCE/relative-factor
GET https://api.sharadaresearch.in/fno/RELIANCE/signal
GET https://api.sharadaresearch.in/fno/heatmap
```

## Authentication & Utility Endpoints
```
GET https://api.sharadaresearch.in/current?type=servertime
POST https://api.sharadaresearch.in/api/admin/auth/login
POST https://api.sharadaresearch.in/api/admin/auth/logout
GET https://api.sharadaresearch.in/api/admin/auth/verify
```

## Testing Commands (using curl)

### Test Swing Center
```bash
curl -X GET "https://api.sharadaresearch.in/swing/adv-dec/NIFTY" -H "Content-Type: application/json"
curl -X GET "https://api.sharadaresearch.in/swing/study/data/MAJOR%20INDEX%20WEEKLY%20PERFORMANCE" -H "Content-Type: application/json"
```

### Test Money Flux
```bash
curl -X GET "https://api.sharadaresearch.in/money_flux/heatmap/NIFTY50" -H "Content-Type: application/json"
curl -X GET "https://api.sharadaresearch.in/money_flux/heatmap/BANKNIFTY" -H "Content-Type: application/json"
curl -X GET "https://api.sharadaresearch.in/money_flux/heatmap/FINNIFTY" -H "Content-Type: application/json"
curl -X GET "https://api.sharadaresearch.in/money_flux/heatmap/MIDCAP" -H "Content-Type: application/json"
curl -X GET "https://api.sharadaresearch.in/money_flux/heatmap/SENSEX" -H "Content-Type: application/json"
curl -X GET "https://api.sharadaresearch.in/money_flux/enhanced-heatmap/NIFTY50" -H "Content-Type: application/json"
curl -X GET "https://api.sharadaresearch.in/money_flux/chart-patterns/NIFTY50" -H "Content-Type: application/json"
```

### Test Index Analysis
```bash
curl -X GET "https://api.sharadaresearch.in/index_analysis/index_analysis/NIFTY50" -H "Content-Type: application/json"
curl -X GET "https://api.sharadaresearch.in/index/NIFTY50/comprehensive-option-analysis" -H "Content-Type: application/json"
```

### Test Sectorial Flow Heatmap
```bash
# Test legacy endpoints
curl -X GET "https://api.sharadaresearch.in/sector/heatmap" -H "Content-Type: application/json"
curl -X GET "https://api.sharadaresearch.in/sector/IT" -H "Content-Type: application/json"

# Test enhanced sector overview heatmap
curl -X GET "https://api.sharadaresearch.in/sector/heatmap/sectors" -H "Content-Type: application/json"
curl -X GET "https://api.sharadaresearch.in/sector/heatmap/sectors?sector_filter=NIFTY50" -H "Content-Type: application/json"
curl -X GET "https://api.sharadaresearch.in/sector/heatmap/sectors?sector_filter=BANKNIFTY" -H "Content-Type: application/json"

# Test sector stock-level heatmaps
curl -X GET "https://api.sharadaresearch.in/sector/heatmap/stocks/NIFTYAUTO" -H "Content-Type: application/json"
curl -X GET "https://api.sharadaresearch.in/sector/heatmap/stocks/NIFTYFMCG" -H "Content-Type: application/json"
curl -X GET "https://api.sharadaresearch.in/sector/heatmap/stocks/CNXIT" -H "Content-Type: application/json"
curl -X GET "https://api.sharadaresearch.in/sector/heatmap/stocks/BANKNIFTY" -H "Content-Type: application/json"

# Test all stocks heatmap
curl -X GET "https://api.sharadaresearch.in/sector/heatmap/stocks" -H "Content-Type: application/json"

# Test sector summary
curl -X GET "https://api.sharadaresearch.in/sector/summary" -H "Content-Type: application/json"
```

### Test Scanner (POST requests)
```bash
curl -X POST "https://api.sharadaresearch.in/unified/fetch_hd_data_fno" -H "Content-Type: application/json" -d "{}"
curl -X POST "https://api.sharadaresearch.in/unified/fetch_dsp_data_fno" -H "Content-Type: application/json" -d "{}"
```

## Expected Response Format
All endpoints return data in this standardized format:
```json
{
  "data": [
    {
      "Symbol": "STOCK_NAME",
      "param_0": "Primary metric value",
      "param_1": "Secondary metric value", 
      "param_2": "Supporting value",
      "param_3": "Supporting value",
      "param_4": "Date/Timestamp"
    }
  ],
  "name": "Endpoint or study name",
  "timestamp": "2025-08-29T10:30:00Z"
}
```

## Notes for Testing
1. Replace `STOCK_NAME` with actual stock symbols like RELIANCE, TCS, etc.
2. Some endpoints may require authentication (JWT token in Authorization header)
3. POST endpoints for scanner may require empty JSON body `{}`
4. Index names supported: NIFTY50, BANKNIFTY, FINNIFTY, MIDCAP, SENSEX
5. All endpoints follow the global parameter system (param_0 to param_4)
6. **Sectorial Flow Heatmap Features:**
   - Legacy endpoints maintain backward compatibility
   - Enhanced endpoints provide interactive heatmap data
   - Sector codes supported: NIFTY50, BANKNIFTY, NIFTYAUTO, NIFTYFINSERVICE, NIFTYFMCG, CNXIT, NIFTYMEDIA, NIFTYMETAL, CNXPHARMA, NIFTYPSUBANK, NIFTYPVTBANK, CNXREALTY, CNXENERGY
   - `/sector/heatmap/sectors` returns sector-level overview
   - `/sector/heatmap/stocks/{sector_code}` returns constituent stocks for specific sector
   - `/sector/heatmap/stocks` returns all stocks across all sectors
   - `/sector/summary` returns sector performance summary with advance/decline ratios
   - sector_filter parameter allows filtering sector overview by specific sector
7. **Heatmap Data Format:**
   - param_500 (or param_2): Heatmap value/% change for color coding
   - param_0: Last traded price
   - param_5: Volume for size representation
   - param_3: R-Factor for momentum analysis
   - Additional fields: sector, sector_code, market_cap, volume_ratio