"""
Enhanced Money Flux Heatmap Service
Provides constituent stock heatmaps for all supported indices with proper parameter format
"""

from typing import Dict, List
import random
from datetime import datetime
from app.services.param_normalizer import ParamNormalizer


def get_enhanced_index_heatmap(index_name: str) -> Dict:
    """Generate enhanced heatmap data with constituent stocks for all supported indices"""
    
    # Index constituent mappings
    index_constituents = {
        "NIFTY50": [
            "RELIANCE", "TCS", "HDFCBANK", "INFY", "HINDUNILVR", "ICICIBANK", "SBIN", "BHARTIARTL",
            "ITC", "KOTAKBANK", "LT", "AXISBANK", "ASIANPAINT", "MARUTI", "NESTLEIND", "BAJFINANCE",
            "HCLTECH", "WIPRO", "ULTRACEMCO", "TITAN", "ADANIPORTS", "BAJAJFINSV", "DRREDDY",
            "GRASIM", "HEROMOTOCO", "JSWSTEEL", "NTPC", "ONGC", "POWERGRID", "SUNPHARMA"
        ],
        "BANKNIFTY": [
            "HDFCBANK", "ICICIBANK", "SBIN", "KOTAKBANK", "AXISBANK", "INDUSINDBK", "FEDERALBNK",
            "BANKBARODA", "PNB", "IDFCFIRSTB", "AUBANK", "BANDHANBNK"
        ],
        "FINNIFTY": [
            "BAJFINANCE", "BAJAJFINSV", "HDFCLIFE", "SBILIFE", "ICICIGI", "ICICIPRULI", "HDFCAMC",
            "LICHSGFIN", "MUTHOOTFIN", "PNBHOUSING", "M&MFIN", "RECLTD", "CHOLAFIN", "PFC",
            "MANAPPURAM", "SRTRANSFIN", "SHRIRAMFIN", "BAJAJHLDNG"
        ],
        "MIDCAP": [
            "GODREJCP", "MCDOWELL-N", "PIDILITIND", "VOLTAS", "TORNTPHARM", "CONCOR", "LUPIN",
            "GLENMARK", "CADILAHC", "IPCALAB", "FLUOROCHEM", "CUMMINSIND", "L&TFH", "MOTHERSUMI",
            "ESCORTS", "ASHOKLEY", "BALKRISIND", "TVSMOTORS", "MARICO", "DABUR", "COLPAL"
        ],
        "SENSEX": [
            "RELIANCE", "TCS", "HDFCBANK", "INFY", "HINDUNILVR", "ICICIBANK", "SBIN", "BHARTIARTL",
            "ITC", "KOTAKBANK", "LT", "AXISBANK", "ASIANPAINT", "MARUTI", "NESTLEIND", "BAJFINANCE",
            "M&M", "SUNPHARMA", "NTPC", "POWERGRID", "ULTRACEMCO", "TITAN", "TATASTEEL", "TECHM"
        ]
    }
    
    constituents = index_constituents.get(index_name, ["SAMPLE1", "SAMPLE2", "SAMPLE3"])
    
    # Generate realistic stock data for each constituent
    raw_data = []
    for symbol in constituents:
        # Generate realistic price movements
        base_price = random.uniform(100, 3000)
        price_change = random.uniform(-8, 8)  # -8% to +8% change
        volume = random.randint(100000, 50000000)
        heat_value = price_change + random.uniform(-2, 2)  # Heat based on price change + noise
        
        raw_data.append({
            "Symbol": symbol,
            "heatmap": round(heat_value, 2),
            "price": round(base_price, 2),
            "price_change": round(price_change, 2),
            "volume": volume,
            "sentiment_score": random.uniform(-5, 5),
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
    
    # Normalize using money_flux module mapping
    normalized_data = ParamNormalizer.normalize(raw_data, module_name="money_flux")
    
    return {
        "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
        "name": f"{index_name} Constituent Heatmap",
        "timestamp": datetime.now().isoformat(),
        "total_constituents": len(constituents),
        "index": index_name
    }


def get_index_chart_patterns(index_name: str) -> Dict:
    """Generate chart pattern analysis for indices"""
    
    # Common chart patterns for financial analysis
    patterns = [
        "Head and Shoulders", "Double Top", "Double Bottom", "Triangle", "Flag", "Pennant",
        "Cup and Handle", "Wedge", "Channel", "Support/Resistance", "Breakout", "Reversal"
    ]
    
    # Generate pattern analysis for the index
    detected_patterns = []
    for i in range(random.randint(3, 7)):  # 3-7 patterns detected
        pattern = random.choice(patterns)
        confidence = random.uniform(65, 95)  # 65-95% confidence
        timeframe = random.choice(["1D", "4H", "1H", "15M"])
        direction = random.choice(["Bullish", "Bearish", "Neutral"])
        
        raw_pattern = {
            "Symbol": f"{index_name}_{pattern.replace(' ', '_')}",
            "pattern_name": pattern,
            "confidence": round(confidence, 1),
            "timeframe": timeframe,
            "direction": direction,
            "strength": random.uniform(1, 10),
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        detected_patterns.append(raw_pattern)
    
    # Normalize using money_flux module mapping
    normalized_data = ParamNormalizer.normalize(detected_patterns, module_name="money_flux")
    
    return {
        "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
        "name": f"{index_name} Chart Patterns",
        "timestamp": datetime.now().isoformat(),
        "total_patterns": len(detected_patterns),
        "index": index_name
    }