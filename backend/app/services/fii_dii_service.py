from __future__ import annotations
from datetime import date, datetime, timedelta
from functools import lru_cache
from typing import Dict, Optional, List
import random
from app.services.param_normalizer import normalize_fii_dii_data


@lru_cache(maxsize=128)
def get_net(on: Optional[date] = None) -> Dict:
    # Placeholder implementation; replace with DB or external source
    d = (on or date.today()).isoformat()
    return {
        "date": d,
        "fiiBuy": 225_300_000,
        "fiiSell": 148_000_000,
        "diiBuy": 102_500_000,
        "diiSell": 98_500_000,
        "fiiNet": 77_300_000,
        "diiNet": 4_000_000,
        "netTotal": 81_300_000,
    }


@lru_cache(maxsize=128)
def get_breakdown(range_: str = "1M") -> Dict:
    # Placeholder time-bucketed breakdown
    buckets = ["W1", "W2", "W3", "W4"] if range_.upper() == "1M" else ["D1", "D2", "D3", "D4", "D5"]
    series = [
        {"bucket": b, "fiiNet": 10_000_000 + i * 1_000_000, "diiNet": -1_000_000 + i * 500_000}
        for i, b in enumerate(buckets)
    ]
    return {"range": range_, "series": series}


def get_fii_dii_data_unified() -> List[Dict]:
    """
    Get FII/DII data in unified param format
    
    Returns data with unified param structure:
    - Symbol: Date identifier
    - param_0: FII Net value  
    - param_1: DII Net value
    - param_2: Total Net (FII + DII)
    - param_3: Flow ratio/momentum
    - param_4: DateTime
    """
    # Mock FII/DII data for demonstration
    # In production, this would fetch from database
    
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
        
        # Create unified param format
        record = {
            "Symbol": current_date.strftime('%d-%m-%Y'),
            "param_0": round(fii_net, 2),  # FII Net
            "param_1": round(dii_net, 2),  # DII Net
            "param_2": round(total_net, 2),  # Total Net
            "param_3": round(flow_ratio, 2),  # Flow ratio
            "param_4": current_date.strftime('%Y-%m-%d %H:%M:%S'),  # DateTime
            # Keep additional fields for compatibility
            "fii_buy": round(fii_buy, 2),
            "fii_sell": round(fii_sell, 2), 
            "dii_buy": round(dii_buy, 2),
            "dii_sell": round(dii_sell, 2)
        }
        
        data.append(record)
    
    # Return most recent data first
    return sorted(data, key=lambda x: x['param_4'], reverse=True)
