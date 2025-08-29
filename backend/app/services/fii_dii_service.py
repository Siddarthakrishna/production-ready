from __future__ import annotations
from datetime import date, datetime, timedelta
from functools import lru_cache
from typing import Dict, Optional, List, Any
import random
from app.services.param_normalizer import ParamNormalizer

@lru_cache(maxsize=128)
def get_net(on: Optional[date] = None) -> Dict:
    """
    Get FII/DII net values for a specific date
    
    Returns:
        Dictionary containing FII/DII net values with metadata
    """
    # Placeholder implementation; replace with DB or external source
    d = (on or date.today()).isoformat()
    return {
        "date": d,
        "fii_buy": 225_300_000,
        "fii_sell": 148_000_000,
        "dii_buy": 102_500_000,
        "dii_sell": 98_500_000,
        "fii_net": 77_300_000,
        "dii_net": 4_000_000,
        "total_net": 81_300_000,
    }

@lru_cache(maxsize=128)
def get_breakdown(range_: str = "1M") -> Dict:
    """
    Get time-bucketed breakdown of FII/DII data
    
    Args:
        range_: Time range for breakdown (1W, 1M, 3M, 6M, 1Y)
        
    Returns:
        Dictionary containing time-bucketed FII/DII data
    """
    # Placeholder time-bucketed breakdown
    buckets = ["W1", "W2", "W3", "W4"] if range_.upper() == "1M" else ["D1", "D2", "D3", "D4", "D5"]
    series = [
        {
            "bucket": b, 
            "fii_net": 10_000_000 + i * 1_000_000, 
            "dii_net": -1_000_000 + i * 500_000,
            "total_net": 9_000_000 + i * 1_500_000,
            "flow_ratio": abs(10.0 + i) / max(abs(-1.0 + i * 0.5), 1)
        }
        for i, b in enumerate(buckets)
    ]
    
    # Normalize the data using ParamNormalizer
    normalized_series = []
    for item in series:
        normalized = ParamNormalizer.normalize(item, "fii_dii")
        normalized_series.append({
            **normalized,
            "bucket": item["bucket"]  # Keep the bucket identifier
        })
    
    return {"range": range_, "series": normalized_series}

def get_fii_dii_data_unified() -> List[Dict]:
    """
    Get FII/DII data in unified param format
    
    Returns:
        List of dictionaries containing FII/DII data in unified parameter format
    """
    data = []
    base_date = datetime.now() - timedelta(days=30)
    
    for i in range(30):  # 30 days of data
        current_date = base_date + timedelta(days=i)
        
        # Generate mock FII/DII values
        fii_buy = random.uniform(2000, 8000)
        fii_sell = random.uniform(1500, 7500) 
        fii_net = fii_buy - fii_sell
        
        dii_buy = random.uniform(1000, 5000)
        dii_sell = random.uniform(1200, 4800)
        dii_net = dii_buy - dii_sell
        
        total_net = fii_net + dii_net
        flow_ratio = abs(fii_net) / max(abs(dii_net), 1) if dii_net != 0 else 1.0
        
        # Create record with raw values
        record = {
            "Symbol": current_date.strftime('%d-%m-%Y'),
            "fii_net": round(fii_net, 2),
            "dii_net": round(dii_net, 2),
            "total_net": round(total_net, 2),
            "flow_ratio": round(flow_ratio, 2),
            "fii_buy": round(fii_buy, 2),
            "fii_sell": round(fii_sell, 2),
            "dii_buy": round(dii_buy, 2),
            "dii_sell": round(dii_sell, 2),
            "timestamp": current_date.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Normalize the record using ParamNormalizer
        normalized_record = ParamNormalizer.normalize(record, "fii_dii")
        
        # Keep the Symbol in the normalized record
        normalized_record["Symbol"] = record["Symbol"]
        
        data.append(normalized_record)
    
    # Return most recent data first
    return sorted(data, key=lambda x: x['params']['param_4']['value'], reverse=True)
