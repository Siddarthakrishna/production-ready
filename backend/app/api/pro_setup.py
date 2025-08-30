from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
import logging
import random
from datetime import datetime, timedelta

from app.core.dependencies import get_db
from app.models.response_models import (
    TableData,
    TableResponse,
    MultiTableResponse
)

router = APIRouter(prefix="/prosetup", tags=["prosetup"])
logger = logging.getLogger(__name__)

# Mock data generators
def generate_pro_setup_data() -> Dict[str, List[Dict[str, Any]]]:
    """Generate mock pro setup data"""
    now = datetime.now()
    sectors = ["BANKING", "IT", "AUTO", "PHARMA", "FMCG", "METAL", "ENERGY", "REALTY"]
    
    def generate_stock_data(prefix: str, count: int, change_range: tuple = (-10, 10)) -> List[Dict[str, Any]]:
        return [
            {
                "symbol": f"{prefix}{i+1}",
                "last_price": round(random.uniform(100, 5000), 2),
                "change_pct": round(random.uniform(*change_range), 2),
                "volume": random.randint(10000, 1000000),
                "value": round(random.uniform(100000, 10000000), 2),
                "oi": random.randint(1000, 100000) if random.random() > 0.3 else None,
                "oi_change_pct": round(random.uniform(-30, 30), 2) if random.random() > 0.3 else None,
                "sector": random.choice(sectors),
                "timestamp": now.isoformat(),
                "signal_strength": random.randint(60, 100),
                "timeframe": random.choice(["5min", "15min", "1H", "4H", "1D"]),
                "setup_type": ""
            } for i in range(count)
        ]
    
    # Generate base data
    spike5min = generate_stock_data("SP5", 15, (2, 15))
    spike10min = generate_stock_data("SP10", 12, (1, 12))
    bullish_div_15 = generate_stock_data("BD15", 10, (1, 8))
    bearish_div_15 = generate_stock_data("BRD15", 10, (-8, -1))
    bullish_div_1h = generate_stock_data("BD1H", 8, (1, 10))
    bearish_div_1h = generate_stock_data("BRD1H", 8, (-10, -1))
    multi_resistance = generate_stock_data("MRES", 10, (-5, 5))
    multi_support = generate_stock_data("MSPT", 10, (-5, 5))
    unusual_volume = generate_stock_data("UVOL", 15, (-15, 15))
    
    # Set setup types
    for item in spike5min: item["setup_type"] = "5min Spike"
    for item in spike10min: item["setup_type"] = "10min Spike"
    for item in bullish_div_15: item["setup_type"] = "15min Bullish Divergence"
    for item in bearish_div_15: item["setup_type"] = "15min Bearish Divergence"
    for item in bullish_div_1h: item["setup_type"] = "1H Bullish Divergence"
    for item in bearish_div_1h: item["setup_type"] = "1H Bearish Divergence"
    for item in multi_resistance: item["setup_type"] = "Multi Resistance"
    for item in multi_support: item["setup_type"] = "Multi Support"
    for item in unusual_volume: item["setup_type"] = "Unusual Volume"
    
    return {
        "spike5min": spike5min,
        "spike10min": spike10min,
        "bullish_divergence_15": bullish_div_15,
        "bearish_divergence_15": bearish_div_15,
        "bullish_divergence_1h": bullish_div_1h,
        "bearish_divergence_1h": bearish_div_1h,
        "multi_resistance": multi_resistance,
        "multi_support": multi_support,
        "unusual_volume": unusual_volume
    }

@router.get("", response_model=MultiTableResponse)
async def get_pro_setup(
    include: Optional[List[str]] = Query(
        None, 
        description="Sections to include (comma-separated). Options: spike5min, spike10min, bullish_divergence_15, "
                    "bearish_divergence_15, bullish_divergence_1h, bearish_divergence_1h, multi_resistance, "
                    "multi_support, unusual_volume"
    ),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of items per section"),
    min_strength: int = Query(0, ge=0, le=100, description="Minimum signal strength (0-100)"),
    db: Session = Depends(get_db)
) -> MultiTableResponse:
    """
    Get professional trading setups including spikes, divergences, and key levels
    """
    try:
        # Generate mock data
        all_data = generate_pro_setup_data()
        
        # Filter sections if include parameter is provided
        if include:
            all_data = {k: v for k, v in all_data.items() if k in include}
        
        # Prepare response tables
        tables = {}
        
        # Common columns for all tables
        common_columns = [
            {"key": "symbol", "label": "Symbol", "type": "text"},
            {"key": "last_price", "label": "LTP", "type": "number", "format": ",.2f"},
            {"key": "change_pct", "label": "Change %", "type": "percentage", "format": "+,.2f"},
            {"key": "signal_strength", "label": "Strength", "type": "number", "format": ",.0f"},
            {"key": "timeframe", "label": "TF", "type": "text"},
            {"key": "sector", "label": "Sector", "type": "text"}
        ]
        
        # 5min Spike
        if 'spike5min' in all_data:
            spike5min_data = [d for d in all_data['spike5min'] if d['signal_strength'] >= min_strength][:limit]
            tables["spike5min"] = TableData(
                title="5-Minute Spike",
                description="Stocks with significant 5-minute price spikes",
                columns=common_columns + [
                    {"key": "volume", "label": "Volume", "type": "number", "format": ",.0f"},
                    {"key": "value", "label": "Value (Cr)", "type": "number", "format": ",.2f"}
                ],
                rows=spike5min_data
            )
        
        # 10min Spike
        if 'spike10min' in all_data:
            spike10min_data = [d for d in all_data['spike10min'] if d['signal_strength'] >= min_strength][:limit]
            tables["spike10min"] = TableData(
                title="10-Minute Spike",
                description="Stocks with significant 10-minute price spikes",
                columns=common_columns + [
                    {"key": "volume", "label": "Volume", "type": "number", "format": ",.0f"},
                    {"key": "value", "label": "Value (Cr)", "type": "number", "format": ",.2f"}
                ],
                rows=spike10min_data
            )
        
        # 15min Bullish Divergence
        if 'bullish_divergence_15' in all_data:
            bull_div_15_data = [d for d in all_data['bullish_divergence_15'] if d['signal_strength'] >= min_strength][:limit]
            tables["bullish_divergence_15"] = TableData(
                title="15-Min Bullish Divergence",
                description="Stocks showing bullish RSI/MACD divergence on 15min chart",
                columns=common_columns + [
                    {"key": "rsi", "label": "RSI", "type": "number", "format": ",.1f"},
                    {"key": "macd_hist", "label": "MACD Hist", "type": "number", "format": "+,.2f"}
                ],
                rows=[{**d, "rsi": random.uniform(25, 40), "macd_hist": random.uniform(-2, 0)} 
                     for d in bull_div_15_data]
            )
        
        # 15min Bearish Divergence
        if 'bearish_divergence_15' in all_data:
            bear_div_15_data = [d for d in all_data['bearish_divergence_15'] if d['signal_strength'] >= min_strength][:limit]
            tables["bearish_divergence_15"] = TableData(
                title="15-Min Bearish Divergence",
                description="Stocks showing bearish RSI/MACD divergence on 15min chart",
                columns=common_columns + [
                    {"key": "rsi", "label": "RSI", "type": "number", "format": ",.1f"},
                    {"key": "macd_hist", "label": "MACD Hist", "type": "number", "format": "+,.2f"}
                ],
                rows=[{**d, "rsi": random.uniform(60, 75), "macd_hist": random.uniform(0, 2)} 
                     for d in bear_div_15_data]
            )
        
        # 1H Bullish Divergence
        if 'bullish_divergence_1h' in all_data:
            bull_div_1h_data = [d for d in all_data['bullish_divergence_1h'] if d['signal_strength'] >= min_strength][:limit]
            tables["bullish_divergence_1h"] = TableData(
                title="1-Hour Bullish Divergence",
                description="Stocks showing bullish RSI/MACD divergence on 1H chart",
                columns=common_columns + [
                    {"key": "rsi", "label": "RSI", "type": "number", "format": ",.1f"},
                    {"key": "macd_hist", "label": "MACD Hist", "type": "number", "format": "+,.2f"}
                ],
                rows=[{**d, "rsi": random.uniform(25, 40), "macd_hist": random.uniform(-2, 0)} 
                     for d in bull_div_1h_data]
            )
        
        # 1H Bearish Divergence
        if 'bearish_divergence_1h' in all_data:
            bear_div_1h_data = [d for d in all_data['bearish_divergence_1h'] if d['signal_strength'] >= min_strength][:limit]
            tables["bearish_divergence_1h"] = TableData(
                title="1-Hour Bearish Divergence",
                description="Stocks showing bearish RSI/MACD divergence on 1H chart",
                columns=common_columns + [
                    {"key": "rsi", "label": "RSI", "type": "number", "format": ",.1f"},
                    {"key": "macd_hist", "label": "MACD Hist", "type": "number", "format": "+,.2f"}
                ],
                rows=[{**d, "rsi": random.uniform(60, 75), "macd_hist": random.uniform(0, 2)} 
                     for d in bear_div_1h_data]
            )
        
        # Multi Resistance
        if 'multi_resistance' in all_data:
            res_data = [d for d in all_data['multi_resistance'] if d['signal_strength'] >= min_strength][:limit]
            tables["multi_resistance"] = TableData(
                title="Multi Resistance",
                description="Stocks approaching key resistance levels",
                columns=common_columns + [
                    {"key": "resistance", "label": "Resistance", "type": "number", "format": ",.2f"},
                    {"key": "distance_pct", "label": "Dist %", "type": "percentage", "format": "+,.2f"},
                    {"key": "attempts", "label": "Attempts", "type": "number", "format": ",.0f"}
                ],
                rows=[{**d, 
                     "resistance": round(d["last_price"] * 1.05, 2),
                     "distance_pct": round((d["last_price"] * 1.05 - d["last_price"]) / d["last_price"] * 100, 2),
                     "attempts": random.randint(2, 5)} 
                     for d in res_data]
            )
        
        # Multi Support
        if 'multi_support' in all_data:
            sup_data = [d for d in all_data['multi_support'] if d['signal_strength'] >= min_strength][:limit]
            tables["multi_support"] = TableData(
                title="Multi Support",
                description="Stocks approaching key support levels",
                columns=common_columns + [
                    {"key": "support", "label": "Support", "type": "number", "format": ",.2f"},
                    {"key": "distance_pct", "label": "Dist %", "type": "percentage", "format": "+,.2f"},
                    {"key": "bounces", "label": "Bounces", "type": "number", "format": ",.0f"}
                ],
                rows=[{**d, 
                     "support": round(d["last_price"] * 0.95, 2),
                     "distance_pct": round((d["last_price"] * 0.95 - d["last_price"]) / d["last_price"] * 100, 2),
                     "bounces": random.randint(2, 5)} 
                     for d in sup_data]
            )
        
        # Unusual Volume
        if 'unusual_volume' in all_data:
            vol_data = [d for d in all_data['unusual_volume'] if d['signal_strength'] >= min_strength][:limit]
            tables["unusual_volume"] = TableData(
                title="Unusual Volume",
                description="Stocks with unusual trading volume",
                columns=common_columns + [
                    {"key": "volume", "label": "Volume", "type": "number", "format": ",.0f"},
                    {"key": "avg_volume", "label": "Avg Volume", "type": "number", "format": ",.0f"},
                    {"key": "volume_ratio", "label": "Vol Ratio", "type": "number", "format": ",.1f"},
                    {"key": "oi_change_pct", "label": "OI Chg %", "type": "percentage", "format": "+,.2f"}
                ],
                rows=[{**d, 
                     "avg_volume": int(d["volume"] / random.uniform(2, 5)),
                     "volume_ratio": round(random.uniform(2, 10), 1)} 
                     for d in vol_data]
            )
        
        return MultiTableResponse(
            success=True,
            message="Pro setup data retrieved successfully",
            tables=tables
        )
        
    except Exception as e:
        logger.error(f"Error in get_pro_setup: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
