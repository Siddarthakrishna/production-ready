from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
import logging
import random
import json

from app.core.dependencies import get_db
from app.models.response_models import (
    TableData,
    TableResponse,
    MultiTableResponse
)

router = APIRouter(prefix="/fno-oi-analysis", tags=["fno-oi-analysis"])
logger = logging.getLogger(__name__)

# Mock data generators
def generate_fno_oi_data() -> Dict[str, List[Dict[str, Any]]]:
    """Generate mock F&O OI analysis data"""
    now = datetime.now()
    
    def generate_stock_data(prefix: str, count: int, change_range: tuple = (-15, 15)) -> List[Dict[str, Any]]:
        return [
            {
                "symbol": f"{prefix}{i+1}",
                "last_price": round(random.uniform(100, 5000), 2),
                "change_pct": round(random.uniform(*change_range), 2),
                "oi": random.randint(10000, 1000000),
                "oi_change_pct": round(random.uniform(-50, 100), 2),
                "volume": random.randint(10000, 1000000),
                "value": round(random.uniform(100000, 10000000), 2),
                "strike_price": round(random.uniform(100, 5000) / 50) * 50,
                "expiry": (now + timedelta(days=random.randint(1, 30))).strftime("%d-%b-%Y"),
                "option_type": random.choice(["CE", "PE"]),
                "iv": round(random.uniform(10, 80), 2),
                "premium": round(random.uniform(1, 500), 2),
                "underlying_value": round(random.uniform(100, 5000), 2),
                "timestamp": now.isoformat()
            } for i in range(count)
        ]
    
    # Generate base data for different sections
    oi_gainers = generate_stock_data("OIG", 20, (5, 15))
    oi_losers = generate_stock_data("OIL", 20, (-15, -5))
    long_buildup = generate_stock_data("LBU", 15, (1, 10))
    short_buildup = generate_stock_data("SBU", 15, (-10, -1))
    long_unwinding = generate_stock_data("LUN", 15, (-10, -1))
    short_covering = generate_stock_data("SCO", 15, (1, 10))
    
    # Set specific OI change patterns for each section
    for item in oi_gainers: 
        item["oi_change_pct"] = random.uniform(20, 100)
    for item in oi_losers: 
        item["oi_change_pct"] = random.uniform(-50, -20)
    for item in long_buildup: 
        item["oi_change_pct"] = random.uniform(10, 50)
        item["change_pct"] = random.uniform(1, 5)
    for item in short_buildup: 
        item["oi_change_pct"] = random.uniform(10, 50)
        item["change_pct"] = random.uniform(-5, -1)
    for item in long_unwinding: 
        item["oi_change_pct"] = random.uniform(-50, -10)
        item["change_pct"] = random.uniform(-5, -1)
    for item in short_covering: 
        item["oi_change_pct"] = random.uniform(-50, -10)
        item["change_pct"] = random.uniform(1, 5)
    
    return {
        "oi_gainers": oi_gainers,
        "oi_losers": oi_losers,
        "long_buildup": long_buildup,
        "short_buildup": short_buildup,
        "long_unwinding": long_unwinding,
        "short_covering": short_covering
    }

@router.get("", response_model=MultiTableResponse)
async def get_fno_oi_analysis(
    segment: str = Query("FO", description="Market segment (FO for F&O, COMMODITY, etc.)"),
    include: Optional[List[str]] = Query(
        None, 
        description="Sections to include (comma-separated). Options: oi_gainers, oi_losers, "
                    "long_buildup, short_buildup, long_unwinding, short_covering"
    ),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of items per section"),
    expiry: Optional[str] = Query(None, description="Expiry date in DD-MMM-YYYY format"),
    min_oi_change: float = Query(0, description="Minimum OI change percentage to filter"),
    db: Session = Depends(get_db)
) -> MultiTableResponse:
    """
    Get F&O Open Interest analysis data including OI gainers/losers and build-up patterns
    """
    try:
        # Generate mock data
        all_data = generate_fno_oi_data()
        
        # Filter sections if include parameter is provided
        if include:
            all_data = {k: v for k, v in all_data.items() if k in include}
        
        # Prepare response tables
        tables = {}
        
        # Common columns for all tables
        common_columns = [
            {"key": "symbol", "label": "Symbol", "type": "text"},
            {"key": "last_price", "label": "LTP", "type": "number", "format": ",.2f"},
            {"key": "change_pct", "label": "Chg %", "type": "percentage", "format": "+,.2f"},
            {"key": "oi", "label": "OI", "type": "number", "format": ",.0f"},
            {"key": "oi_change_pct", "label": "OI Chg %", "type": "percentage", "format": "+,.2f"},
            {"key": "volume", "label": "Volume", "type": "number", "format": ",.0f"},
            {"key": "expiry", "label": "Expiry", "type": "text"},
            {"key": "strike_price", "label": "Strike", "type": "number", "format": ",.0f"},
            {"key": "option_type", "label": "Type", "type": "text"}
        ]
        
        # OI Gainers
        if 'oi_gainers' in all_data:
            oi_gainers_data = [d for d in all_data['oi_gainers'] 
                              if abs(d['oi_change_pct']) >= min_oi_change][:limit]
            tables["oi_gainers"] = TableData(
                title="Open Interest Gainers",
                description="Contracts with highest increase in Open Interest",
                columns=common_columns + [
                    {"key": "iv", "label": "IV %", "type": "number", "format": ",.2f"},
                    {"key": "premium", "label": "Premium", "type": "number", "format": ",.2f"}
                ],
                rows=sorted(oi_gainers_data, key=lambda x: x["oi_change_pct"], reverse=True)
            )
        
        # OI Losers
        if 'oi_losers' in all_data:
            oi_losers_data = [d for d in all_data['oi_losers'] 
                             if abs(d['oi_change_pct']) >= min_oi_change][:limit]
            tables["oi_losers"] = TableData(
                title="Open Interest Losers",
                description="Contracts with highest decrease in Open Interest",
                columns=common_columns + [
                    {"key": "iv", "label": "IV %", "type": "number", "format": ",.2f"},
                    {"key": "premium", "label": "Premium", "type": "number", "format": ",.2f"}
                ],
                rows=sorted(oi_losers_data, key=lambda x: x["oi_change_pct"])
            )
        
        # Long Buildup
        if 'long_buildup' in all_data:
            long_buildup_data = [d for d in all_data['long_buildup'] 
                               if abs(d['oi_change_pct']) >= min_oi_change][:limit]
            tables["long_buildup"] = TableData(
                title="Long Buildup",
                description="Price up with OI up - Indicates long positions being built",
                columns=common_columns + [
                    {"key": "iv", "label": "IV %", "type": "number", "format": ",.2f"},
                    {"key": "premium", "label": "Premium", "type": "number", "format": ",.2f"}
                ],
                rows=sorted(long_buildup_data, key=lambda x: x["oi_change_pct"], reverse=True)
            )
        
        # Short Buildup
        if 'short_buildup' in all_data:
            short_buildup_data = [d for d in all_data['short_buildup'] 
                                if abs(d['oi_change_pct']) >= min_oi_change][:limit]
            tables["short_buildup"] = TableData(
                title="Short Buildup",
                description="Price down with OI up - Indicates short positions being built",
                columns=common_columns + [
                    {"key": "iv", "label": "IV %", "type": "number", "format": ",.2f"},
                    {"key": "premium", "label": "Premium", "type": "number", "format": ",.2f"}
                ],
                rows=sorted(short_buildup_data, key=lambda x: x["oi_change_pct"], reverse=True)
            )
        
        # Long Unwinding
        if 'long_unwinding' in all_data:
            long_unwinding_data = [d for d in all_data['long_unwinding'] 
                                 if abs(d['oi_change_pct']) >= min_oi_change][:limit]
            tables["long_unwinding"] = TableData(
                title="Long Unwinding",
                description="Price down with OI down - Indicates long positions being unwound",
                columns=common_columns + [
                    {"key": "iv", "label": "IV %", "type": "number", "format": ",.2f"},
                    {"key": "premium", "label": "Premium", "type": "number", "format": ",.2f"}
                ],
                rows=sorted(long_unwinding_data, key=lambda x: x["oi_change_pct"])
            )
        
        # Short Covering
        if 'short_covering' in all_data:
            short_covering_data = [d for d in all_data['short_covering'] 
                                 if abs(d['oi_change_pct']) >= min_oi_change][:limit]
            tables["short_covering"] = TableData(
                title="Short Covering",
                description="Price up with OI down - Indicates short positions being covered",
                columns=common_columns + [
                    {"key": "iv", "label": "IV %", "type": "number", "format": ",.2f"},
                    {"key": "premium", "label": "Premium", "type": "number", "format": ",.2f"}
                ],
                rows=sorted(short_covering_data, key=lambda x: x["oi_change_pct"])
            )
        
        # Add summary statistics
        summary = {
            "total_oi": sum(d["oi"] for section in all_data.values() for d in section),
            "total_volume": sum(d["volume"] for section in all_data.values() for d in section),
            "timestamp": now.isoformat(),
            "segment": segment,
            "expiry_filter": expiry
        }
        
        return MultiTableResponse(
            success=True,
            message="F&O OI analysis data retrieved successfully",
            tables=tables,
            metadata={"summary": summary}
        )
        
    except Exception as e:
        logger.error(f"Error in get_fno_oi_analysis: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
