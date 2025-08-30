from fastapi import APIRouter, Query, Depends, HTTPException
from typing import List, Dict, Optional, Literal
from datetime import datetime, timedelta
import random
import logging
from sqlalchemy.orm import Session
from app.models.response_models import TableData, TableResponse, MultiTableResponse
from app.core.dependencies import get_db

router = APIRouter(prefix="/sector-heatmaps", tags=["Sector Heatmaps"])
logger = logging.getLogger(__name__)

# Define sectors and their weights
SECTORS = {
    "NIFTY 50": {"weight": 100.0, "symbols": ["RELIANCE", "HDFCBANK", "ICICIBANK", "INFY", "HDFC", "TCS"]},
    "BANKING": {"weight": 38.1, "symbols": ["HDFCBANK", "ICICIBANK", "KOTAKBANK", "AXISBANK", "SBIN"]},
    "IT": {"weight": 15.3, "symbols": ["TCS", "INFY", "HCLTECH", "WIPRO", "TECHM"]},
    "AUTO": {"weight": 5.2, "symbols": ["TATAMOTORS", "M&M", "MARUTI", "BAJAJ-AUTO", "EICHERMOT"]},
    "FMCG": {"weight": 15.1, "symbols": ["ITC", "HINDUNILVR", "BRITANNIA", "NESTLEIND", "DABUR"]},
    "PHARMA": {"weight": 3.1, "symbols": ["SUNPHARMA", "DRREDDY", "CIPLA", "DIVISLAB", "BIOCON"]},
    "METAL": {"weight": 2.9, "symbols": ["TATASTEEL", "JSWSTEEL", "HINDALCO", "VEDL", "JINDALSTEL"]},
    "OIL & GAS": {"weight": 12.5, "symbols": ["RELIANCE", "ONGC", "IOC", "BPCL", "GAIL"]},
    "REALTY": {"weight": 2.4, "symbols": ["DLF", "SUNTV", "GODREJPROP", "OBEROIRLTY", "PRESTIGE"]},
    "MEDIA": {"weight": 0.8, "symbols": ["ZEELEARN", "SUNTV", "TV18BRDCST", "ZEEL", "INOXLEISUR"]},
    "FINANCIAL SERVICES": {"weight": 25.4, "symbols": ["HDFC", "BAJFINANCE", "BAJAJFINSV", "SBILIFE", "HDFCLIFE"]}
}

def generate_heatmap_data(
    heatmap_type: str = "sector-performance",
    timeframe: str = "1D",
    sort_by: str = "weight",
    include_technical: bool = True,
    limit: int = 20
) -> MultiTableResponse:
    """
    Generate heatmap data based on the specified type and parameters.
    
    Args:
        heatmap_type: Type of heatmap to generate. Options: 'sector-performance', 'stocks', 'sector-rotation'
        timeframe: Timeframe for analysis. Options: '1D', '1W', '1M', '3M', '1Y'
        sort_by: Field to sort by. Options: 'weight', 'change', 'volume'
        include_technical: Whether to include technical indicators
        limit: Maximum number of rows per table
        
    Returns:
        MultiTableResponse with heatmap data
    """
    try:
        tables = {}
        
        # 1. Sector Performance Heatmap
        if heatmap_type == "sector-performance":
            sector_data = []
            for sector, info in SECTORS.items():
                change = round(random.uniform(-5, 5), 2)
                sector_data.append({
                    "Sector": sector,
                    "Weight %": info["weight"],
                    "Change %": round(change / 100, 2),
                    "Volume": random.randint(10, 100) * 1000000,
                    "RSI(14)": round(30 + random.uniform(0, 40), 2) if include_technical else None,
                    "Top Gainer": random.choice(info["symbols"]),
                    "Top Loser": random.choice(info["symbols"]),
                    "Advance/Decline": f"{random.randint(30, 70)} / {random.randint(30, 70)}",
                    "52W High/Low": f"{random.randint(1, 10)} / {random.randint(1, 10)}"
                })
            
            # Sort based on the specified field
            if sort_by == "change":
                sector_data.sort(key=lambda x: x["Change %"], reverse=True)
            elif sort_by == "volume":
                sector_data.sort(key=lambda x: x["Volume"], reverse=True)
            else:  # Default sort by weight
                sector_data.sort(key=lambda x: x["Weight %"], reverse=True)
            
            columns = [
                {"key": "Sector", "label": "Sector", "type": "text"},
                {"key": "Weight %", "label": "Weight %", "type": "percentage", "format": ",.2f"},
                {"key": "Change %", "label": "Change %", "type": "percentage", "format": ",.2f"},
                {"key": "Volume", "label": "Volume", "type": "number", "format": ",.0f"},
                {"key": "Top Gainer", "label": "Top Gainer", "type": "text"},
                {"key": "Top Loser", "label": "Top Loser", "type": "text"},
                {"key": "Advance/Decline", "label": "Advance/Decline", "type": "text"},
                {"key": "52W High/Low", "label": "52W High/Low", "type": "text"}
            ]
            
            if include_technical:
                columns.insert(4, {"key": "RSI(14)", "label": "RSI(14)", "type": "number", "format": ",.2f"})
            
            tables["sector_performance"] = TableData(
                columns=columns,
                rows=sector_data[:limit],
                title=f"Sector Performance Heatmap ({timeframe})",
                description="Color-coded heatmap showing sector performance metrics"
            )
        
        # 2. Stock Heatmap by Sector
        elif heatmap_type == "stocks":
            stock_data = []
            for sector, info in SECTORS.items():
                for symbol in info["symbols"][:5]:  # Limit to top 5 stocks per sector
                    change = round(random.uniform(-10, 10), 2)
                    stock_data.append({
                        "Symbol": symbol,
                        "Sector": sector,
                        "LTP": round(100 + random.uniform(50, 2000), 2),
                        "Change %": round(change / 100, 2),
                        "Volume": random.randint(100, 1000) * 1000,
                        "RSI(14)": round(30 + random.uniform(0, 40), 2) if include_technical else None,
                        "Mkt Cap (Cr)": f"₹{random.randint(1000, 1000000):,}",
                        "1M Change %": round(random.uniform(-15, 15) / 100, 2),
                        "1Y Change %": round(random.uniform(-30, 50) / 100, 2)
                    })
            
            # Sort based on the specified field
            if sort_by == "change":
                stock_data.sort(key=lambda x: x["Change %"], reverse=True)
            elif sort_by == "volume":
                stock_data.sort(key=lambda x: x["Volume"], reverse=True)
            else:  # Default sort by sector
                stock_data.sort(key=lambda x: (x["Sector"], -x["Change %"]))
            
            columns = [
                {"key": "Symbol", "label": "Symbol", "type": "text"},
                {"key": "Sector", "label": "Sector", "type": "text"},
                {"key": "LTP", "label": "LTP", "type": "number", "format": ",.2f"},
                {"key": "Change %", "label": "Change %", "type": "percentage", "format": ",.2f"},
                {"key": "Volume", "label": "Volume", "type": "number", "format": ",.0f"},
                {"key": "1M Change %", "label": "1M %", "type": "percentage", "format": ",.2f"},
                {"key": "1Y Change %", "label": "1Y %", "type": "percentage", "format": ",.2f"},
                {"key": "Mkt Cap (Cr)", "label": "Mkt Cap (Cr)", "type": "text"}
            ]
            
            if include_technical:
                columns.insert(5, {"key": "RSI(14)", "label": "RSI(14)", "type": "number", "format": ",.2f"})
            
            tables["stock_heatmap"] = TableData(
                columns=columns,
                rows=stock_data[:limit * 3],  # Show more rows for stocks
                title=f"Stock Heatmap by Sector ({timeframe})",
                description="Color-coded heatmap showing stock performance by sector"
            )
        
        # 3. Sector Rotation Heatmap
        elif heatmap_type == "sector-rotation":
            rotation_data = []
            time_periods = ["1W", "1M", "3M", "6M", "YTD", "1Y"]
            
            for sector, info in SECTORS.items():
                row = {"Sector": sector, "Weight %": info["weight"]}
                for period in time_periods:
                    row[period] = round(random.uniform(-15, 15), 2)
                
                # Add relative strength
                row["RS 1M"] = round(random.uniform(0.5, 1.5), 2)
                row["RS 3M"] = round(random.uniform(0.5, 1.5), 2)
                row["Trend"] = random.choice(["Strong Up", "Up", "Neutral", "Down", "Strong Down"])
                
                rotation_data.append(row)
            
            # Sort by weight by default
            rotation_data.sort(key=lambda x: x["Weight %"], reverse=True)
            
            columns = [
                {"key": "Sector", "label": "Sector", "type": "text"},
                {"key": "Weight %", "label": "Weight %", "type": "percentage", "format": ",.2f"}
            ]
            
            # Add time period columns
            for period in time_periods:
                columns.append({
                    "key": period,
                    "label": period,
                    "type": "percentage",
                    "format": "+,.2f"
                })
            
            # Add relative strength and trend
            columns.extend([
                {"key": "RS 1M", "label": "RS 1M", "type": "number", "format": ",.2f"},
                {"key": "RS 3M", "label": "RS 3M", "type": "number", "format": ",.2f"},
                {"key": "Trend", "label": "Trend", "type": "text"}
            ])
            
            tables["sector_rotation"] = TableData(
                columns=columns,
                rows=rotation_data[:limit],
                title="Sector Rotation Heatmap",
                description="Heatmap showing sector performance across different timeframes"
            )
        
        return MultiTableResponse(
            success=True,
            message=f"Successfully generated {heatmap_type} heatmap data",
            tables=tables
        )
        
    except Exception as e:
        logger.error(f"Error in generate_heatmap_data: {str(e)}", exc_info=True)
        return MultiTableResponse(
            success=False,
            message=f"Error generating heatmap data: {str(e)}",
            tables={}
        )

@router.get("", response_model=MultiTableResponse)
async def get_sector_heatmaps(
    heatmap_type: str = Query(
        "sector-performance",
        description="Type of heatmap to generate",
        regex="^(sector-performance|stocks|sector-rotation)$"
    ),
    timeframe: str = Query(
        "1D",
        description="Analysis timeframe",
        regex="^(1D|1W|1M|3M|1Y|YTD)$"
    ),
    sort_by: str = Query(
        "weight",
        description="Field to sort by",
        regex="^(weight|change|volume)$"
    ),
    include_technical: bool = Query(
        True,
        description="Include technical indicators"
    ),
    limit: int = Query(
        20,
        description="Maximum number of rows per table",
        ge=1,
        le=100
    ),
    db: Session = Depends(get_db)
):
    """
    Get sector heatmap data for visualization.
    
    Returns color-coded heatmap data for various sector-based analyses.
    """
    return generate_heatmap_data(
        heatmap_type=heatmap_type,
        timeframe=timeframe,
        sort_by=sort_by,
        include_technical=include_technical,
        limit=limit
    )

# Additional endpoints for specific heatmap types
@router.get("/sector-performance", response_model=MultiTableResponse)
async def get_sector_performance_heatmap(
    timeframe: str = Query("1D", description="Analysis timeframe"),
    sort_by: str = Query("weight", description="Sort by field")
):
    """Get sector performance heatmap data"""
    return generate_heatmap_data(
        heatmap_type="sector-performance",
        timeframe=timeframe,
        sort_by=sort_by,
        include_technical=True,
        limit=50
    )

@router.get("/stocks", response_model=MultiTableResponse)
async def get_stock_heatmap(
    timeframe: str = Query("1D", description="Analysis timeframe"),
    sort_by: str = Query("sector", description="Sort by field")
):
    """Get stock heatmap data by sector"""
    return generate_heatmap_data(
        heatmap_type="stocks",
        timeframe=timeframe,
        sort_by=sort_by,
        include_technical=True,
        limit=100  # Show more stocks by default
    )

@router.get("/sector-rotation", response_model=MultiTableResponse)
async def get_sector_rotation_heatmap():
    """Get sector rotation heatmap data"""
    return generate_heatmap_data(
        heatmap_type="sector-rotation",
        timeframe="1Y",  # Not used for rotation heatmap
        sort_by="weight",
        include_technical=False,
        limit=50
    )
