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

router = APIRouter(prefix="/market-depth", tags=["market-depth"])
logger = logging.getLogger(__name__)

# Mock data generators
def generate_market_depth_data() -> Dict[str, List[Dict[str, Any]]]:
    """Generate mock market depth data"""
    now = datetime.now()
    sectors = ["BANKING", "IT", "AUTO", "PHARMA", "FMCG", "METAL", "ENERGY", "REALTY"]
    
    def generate_stock_data(prefix: str, count: int) -> List[Dict[str, Any]]:
        return [
            {
                "symbol": f"{prefix}{i+1}",
                "last_price": round(random.uniform(100, 5000), 2),
                "change_pct": round(random.uniform(-5, 5), 2),
                "volume": random.randint(10000, 1000000),
                "value": round(random.uniform(100000, 10000000), 2),
                "oi": random.randint(1000, 100000) if random.random() > 0.3 else None,
                "oi_change_pct": round(random.uniform(-20, 20), 2) if random.random() > 0.3 else None,
                "sector": random.choice(sectors),
                "timestamp": now.isoformat()
            } for i in range(count)
        ]
    
    return {
        "highpower": generate_stock_data("HP", 20),
        "intraday_boost": generate_stock_data("IB", 15),
        "top_level": generate_stock_data("TL", 10),
        "low_level": generate_stock_data("LL", 10),
        "gainers": generate_stock_data("GN", 10),
        "losers": generate_stock_data("LS", 10)
    }

@router.get("", response_model=MultiTableResponse)
async def get_market_depth(
    include: Optional[List[str]] = Query(
        None, 
        description="Sections to include (comma-separated). Options: highpower, intraday_boost, top_level, low_level, gainers, losers"
    ),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of items per section"),
    db: Session = Depends(get_db)
) -> MultiTableResponse:
    """
    Get market depth data including various market scans and metrics
    """
    try:
        # Generate mock data
        all_data = generate_market_depth_data()
        
        # Filter sections if include parameter is provided
        if include:
            all_data = {k: v for k, v in all_data.items() if k in include}
        
        # Prepare response tables
        tables = {}
        
        # High Power Stocks
        if 'highpower' in all_data:
            highpower_data = all_data['highpower'][:limit]
            tables["highpower"] = TableData(
                title="High Power Stocks",
                description="Stocks with highest trading power and momentum",
                columns=[
                    {"key": "symbol", "label": "Symbol", "type": "text"},
                    {"key": "last_price", "label": "LTP", "type": "number", "format": ",.2f"},
                    {"key": "change_pct", "label": "Change %", "type": "percentage", "format": "+,.2f"},
                    {"key": "volume", "label": "Volume", "type": "number", "format": ",.0f"},
                    {"key": "value", "label": "Value (Cr)", "type": "number", "format": ",.2f"},
                    {"key": "sector", "label": "Sector", "type": "text"}
                ],
                rows=highpower_data
            )
        
        # Intraday Boost
        if 'intraday_boost' in all_data:
            intraday_data = all_data['intraday_boost'][:limit]
            tables["intraday_boost"] = TableData(
                title="Intraday Boost",
                description="Stocks with strong intraday momentum",
                columns=[
                    {"key": "symbol", "label": "Symbol", "type": "text"},
                    {"key": "last_price", "label": "LTP", "type": "number", "format": ",.2f"},
                    {"key": "change_pct", "label": "Change %", "type": "percentage", "format": "+,.2f"},
                    {"key": "volume", "label": "Volume", "type": "number", "format": ",.0f"},
                    {"key": "oi_change_pct", "label": "OI Chg %", "type": "percentage", "format": "+,.2f"},
                    {"key": "sector", "label": "Sector", "type": "text"}
                ],
                rows=intraday_data
            )
        
        # Top Level
        if 'top_level' in all_data:
            top_level_data = all_data['top_level'][:limit]
            tables["top_level"] = TableData(
                title="Top Level",
                description="Stocks at key resistance levels",
                columns=[
                    {"key": "symbol", "label": "Symbol", "type": "text"},
                    {"key": "last_price", "label": "LTP", "type": "number", "format": ",.2f"},
                    {"key": "change_pct", "label": "Change %", "type": "percentage", "format": "+,.2f"},
                    {"key": "resistance", "label": "Resistance", "type": "number", "format": ",.2f"},
                    {"key": "distance_pct", "label": "Dist %", "type": "percentage", "format": "+,.2f"},
                    {"key": "sector", "label": "Sector", "type": "text"}
                ],
                rows=[{**d, "resistance": round(d["last_price"] * 1.05, 2), 
                     "distance_pct": 5.0} for d in top_level_data]
            )
        
        # Low Level
        if 'low_level' in all_data:
            low_level_data = all_data['low_level'][:limit]
            tables["low_level"] = TableData(
                title="Low Level",
                description="Stocks at key support levels",
                columns=[
                    {"key": "symbol", "label": "Symbol", "type": "text"},
                    {"key": "last_price", "label": "LTP", "type": "number", "format": ",.2f"},
                    {"key": "change_pct", "label": "Change %", "type": "percentage", "format": "+,.2f"},
                    {"key": "support", "label": "Support", "type": "number", "format": ",.2f"},
                    {"key": "distance_pct", "label": "Dist %", "type": "percentage", "format": "+,.2f"},
                    {"key": "sector", "label": "Sector", "type": "text"}
                ],
                rows=[{**d, "support": round(d["last_price"] * 0.95, 2), 
                     "distance_pct": -5.0} for d in low_level_data]
            )
        
        # Top Gainers
        if 'gainers' in all_data:
            gainers_data = sorted(all_data['gainers'], key=lambda x: x['change_pct'], reverse=True)[:limit]
            tables["gainers"] = TableData(
                title="Top Gainers",
                description="Stocks with highest price appreciation",
                columns=[
                    {"key": "symbol", "label": "Symbol", "type": "text"},
                    {"key": "last_price", "label": "LTP", "type": "number", "format": ",.2f"},
                    {"key": "change_pct", "label": "Change %", "type": "percentage", "format": "+,.2f"},
                    {"key": "volume", "label": "Volume", "type": "number", "format": ",.0f"},
                    {"key": "value", "label": "Value (Cr)", "type": "number", "format": ",.2f"},
                    {"key": "sector", "label": "Sector", "type": "text"}
                ],
                rows=gainers_data
            )
        
        # Top Losers
        if 'losers' in all_data:
            losers_data = sorted(all_data['losers'], key=lambda x: x['change_pct'])[:limit]
            tables["losers"] = TableData(
                title="Top Losers",
                description="Stocks with highest price depreciation",
                columns=[
                    {"key": "symbol", "label": "Symbol", "type": "text"},
                    {"key": "last_price", "label": "LTP", "type": "number", "format": ",.2f"},
                    {"key": "change_pct", "label": "Change %", "type": "percentage", "format": "+,.2f"},
                    {"key": "volume", "label": "Volume", "type": "number", "format": ",.0f"},
                    {"key": "value", "label": "Value (Cr)", "type": "number", "format": ",.2f"},
                    {"key": "sector", "label": "Sector", "type": "text"}
                ],
                rows=losers_data
            )
        
        return MultiTableResponse(
            success=True,
            message="Market depth data retrieved successfully",
            tables=tables
        )
        
    except Exception as e:
        logger.error(f"Error in get_market_depth: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/highpower", response_model=MultiTableResponse)
def highpower():
    return svc.get_highpower()


@router.get("/intraday-boost", response_model=MultiTableResponse)
def intraday_boost():
    return svc.get_intraday_boost()


@router.get("/top-level", response_model=MultiTableResponse)
def top_level():
    return svc.get_top_level()


@router.get("/low-level", response_model=MultiTableResponse)
def low_level():
    return svc.get_low_level()


@router.get("/gainers", response_model=MultiTableResponse)
def gainers():
    return svc.get_gainers()


@router.get("/losers", response_model=MultiTableResponse)
def losers():
    return svc.get_losers()
