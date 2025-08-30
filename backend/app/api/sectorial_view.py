from fastapi import APIRouter, Query, Depends, HTTPException
from typing import List, Dict, Optional, Literal
from datetime import datetime, timedelta
import random
import logging
from sqlalchemy.orm import Session
from app.models.response_models import TableData, TableResponse, MultiTableResponse
from app.core.dependencies import get_db

router = APIRouter(prefix="/sectorial-view", tags=["Sectorial View"])
logger = logging.getLogger(__name__)

# Define sector data with weights and descriptions
SECTORS = {
    "BANK": {"weight": 35.5, "description": "Banking and Financial Services"},
    "IT": {"weight": 15.2, "description": "Information Technology"},
    "OILGAS": {"weight": 12.8, "description": "Oil and Gas"},
    "AUTO": {"weight": 8.4, "description": "Automobile"},
    "PHARMA": {"weight": 7.1, "description": "Pharmaceuticals"},
    "FMCG": {"weight": 6.8, "description": "Fast Moving Consumer Goods"},
    "METAL": {"weight": 4.5, "description": "Metals and Mining"},
    "ENERGY": {"weight": 3.9, "description": "Energy"},
    "REALTY": {"weight": 2.8, "description": "Real Estate"},
    "MEDIA": {"weight": 2.0, "description": "Media and Entertainment"},
    "CEMENT": {"weight": 1.7, "description": "Cement"},
    "OTHERS": {"weight": 3.5, "description": "Other Sectors"}
}

def generate_sectorial_data(
    timeframe: str = "1D",
    include_technical: bool = True,
    include_heatmap: bool = True,
    include_constituents: bool = False,
    limit: int = 20
) -> MultiTableResponse:
    """
    Generate sectorial view data with the specified parameters.
    
    Args:
        timeframe: Analysis timeframe ('1D', '1W', '1M', '3M', '1Y')
        include_technical: Whether to include technical indicators
        include_heatmap: Whether to include heatmap data
        include_constituents: Whether to include top constituents
        limit: Maximum number of rows per table
        
    Returns:
        MultiTableResponse with sectorial view data
    """
    try:
        tables = {}
        
        # 1. Sector Performance Table
        sector_data = []
        
        for sector, info in SECTORS.items():
            change = round(random.uniform(-5, 5), 2)
            sector_data.append({
                "Sector": sector,
                "Weight %": info["weight"],
                "Price": round(1000 + random.uniform(-200, 200), 2),
                "Change": change,
                "% Change": round(change / 100, 2),
                "Volume": random.randint(10, 100) * 1000000,
                "RSI(14)": round(30 + random.uniform(0, 40), 2) if include_technical else None,
                "52W High %": round(random.uniform(0, 20), 2),
                "52W Low %": round(random.uniform(-20, 0), 2),
                "Description": info["description"]
            })
        
        # Define columns for sector performance
        sector_columns = [
            {"key": "Sector", "label": "Sector", "type": "text"},
            {"key": "Weight %", "label": "Weight %", "type": "percentage", "format": ",.2f"},
            {"key": "Price", "label": "Price", "type": "number", "format": ",.2f"},
            {"key": "Change", "label": "Change", "type": "number", "format": ",.2f"},
            {"key": "% Change", "label": "% Change", "type": "percentage", "format": ",.2f"},
            {"key": "Volume", "label": "Volume", "type": "number", "format": ",.0f"}
        ]
        
        if include_technical:
            sector_columns.extend([
                {"key": "RSI(14)", "label": "RSI(14)", "type": "number", "format": ",.2f"},
                {"key": "52W High %", "label": "52W High %", "type": "percentage", "format": ",.2f"},
                {"key": "52W Low %", "label": "52W Low %", "type": "percentage", "format": ",.2f"}
            ])
        
        sector_columns.append({"key": "Description", "label": "Description", "type": "text"})
        
        tables["sector_performance"] = TableData(
            columns=sector_columns,
            rows=sorted(sector_data, key=lambda x: x["Weight %"], reverse=True)[:limit],
            title="Sector Performance Overview",
            description=f"Performance of major market sectors ({timeframe} view)"
        )
        
        # 2. Heatmap Data
        if include_heatmap:
            heatmap_data = []
            
            # Generate some sample stocks for the heatmap
            stocks = [
                "RELIANCE", "HDFCBANK", "INFY", "ICICIBANK", "TCS", 
                "HDFC", "ITC", "KOTAKBANK", "BHARTIARTL", "LT"
            ]
            
            for stock in stocks:
                change = round(random.uniform(-10, 10), 2)
                heatmap_data.append({
                    "Symbol": stock,
                    "Sector": random.choice(list(SECTORS.keys())),
                    "LTP": round(1000 + random.uniform(-500, 2000), 2),
                    "Change %": round(change / 100, 2),
                    "Volume": random.randint(100, 1000) * 1000,
                    "RSI(14)": round(30 + random.uniform(0, 40), 2) if include_technical else None,
                    "Mkt Cap": f"₹{random.randint(1, 20)}T"
                })
            
            heatmap_columns = [
                {"key": "Symbol", "label": "Symbol", "type": "text"},
                {"key": "Sector", "label": "Sector", "type": "text"},
                {"key": "LTP", "label": "LTP", "type": "number", "format": ",.2f"},
                {"key": "Change %", "label": "Change %", "type": "percentage", "format": ",.2f"},
                {"key": "Volume", "label": "Volume", "type": "number", "format": ",.0f"},
                {"key": "Mkt Cap", "label": "Mkt Cap", "type": "text"}
            ]
            
            if include_technical:
                heatmap_columns.insert(5, {"key": "RSI(14)", "label": "RSI(14)", "type": "number", "format": ",.2f"})
            
            tables["stock_heatmap"] = TableData(
                columns=heatmap_columns,
                rows=sorted(heatmap_data, key=lambda x: x["Change %"], reverse=True)[:limit],
                title="Stock Heatmap by Sector",
                description="Heatmap of top stocks across all sectors"
            )
        
        # 3. Top Constituents by Sector
        if include_constituents:
            constituents_data = []
            
            for sector in SECTORS.keys():
                # Generate 2-5 stocks per sector
                for i in range(random.randint(2, 5)):
                    change = round(random.uniform(-5, 5), 2)
                    constituents_data.append({
                        "Sector": sector,
                        "Symbol": f"{sector[:3]}{i+1}",  # Generate a mock symbol
                        "Weight %": round(random.uniform(5, 30), 2),
                        "LTP": round(1000 + random.uniform(-500, 2000), 2),
                        "Change %": round(change / 100, 2),
                        "Volume": random.randint(10, 100) * 100000,
                        "RSI(14)": round(30 + random.uniform(0, 40), 2) if include_technical else None
                    })
            
            constituents_columns = [
                {"key": "Sector", "label": "Sector", "type": "text"},
                {"key": "Symbol", "label": "Symbol", "type": "text"},
                {"key": "Weight %", "label": "Weight %", "type": "percentage", "format": ",.2f"},
                {"key": "LTP", "label": "LTP", "type": "number", "format": ",.2f"},
                {"key": "Change %", "label": "Change %", "type": "percentage", "format": ",.2f"},
                {"key": "Volume", "label": "Volume", "type": "number", "format": ",.0f"}
            ]
            
            if include_technical:
                constituents_columns.append({"key": "RSI(14)", "label": "RSI(14)", "type": "number", "format": ",.2f"})
            
            tables["sector_constituents"] = TableData(
                columns=constituents_columns,
                rows=constituents_data[:limit * 3],  # Show more rows for constituents
                title="Top Constituents by Sector",
                description="Key stocks driving sector performance"
            )
        
        return MultiTableResponse(
            success=True,
            message="Successfully retrieved sectorial view data",
            tables=tables
        )
        
    except Exception as e:
        logger.error(f"Error in generate_sectorial_data: {str(e)}", exc_info=True)
        return MultiTableResponse(
            success=False,
            message=f"Error retrieving sectorial view data: {str(e)}",
            tables={}
        )

@router.get("", response_model=MultiTableResponse)
async def get_sectorial_view(
    timeframe: str = Query(
        "1D",
        description="Analysis timeframe",
        regex="^(1D|1W|1M|3M|1Y)$"
    ),
    include_technical: bool = Query(
        True,
        description="Include technical indicators"
    ),
    include_heatmap: bool = Query(
        True,
        description="Include stock heatmap"
    ),
    include_constituents: bool = Query(
        False,
        description="Include top constituents by sector"
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
    Get a comprehensive view of sector performance and trends.
    
    Returns multiple tables with sector performance metrics, stock heatmap,
    and top constituents by sector.
    """
    return generate_sectorial_data(
        timeframe=timeframe,
        include_technical=include_technical,
        include_heatmap=include_heatmap,
        include_constituents=include_constituents,
        limit=limit
    )

# Additional sector-specific endpoints
@router.get("/performance", response_model=MultiTableResponse)
async def get_sector_performance(
    timeframe: str = Query("1D", description="Analysis timeframe"),
    sort_by: str = Query("Weight %", description="Sort column"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)")
):
    """
    Get performance metrics for all sectors.
    
    Returns a table with key performance indicators for each sector,
    sorted by the specified column and order.
    """
    result = generate_sectorial_data(
        timeframe=timeframe,
        include_technical=True,
        include_heatmap=False,
        include_constituents=False,
        limit=50
    )
    
    # Return just the sector performance table
    if "sector_performance" in result.tables:
        return MultiTableResponse(
            success=True,
            message="Successfully retrieved sector performance",
            tables={"sector_performance": result.tables["sector_performance"]}
        )
    return result

@router.get("/heatmap", response_model=MultiTableResponse)
async def get_sector_heatmap(
    timeframe: str = Query("1D", description="Analysis timeframe"),
    min_weight: float = Query(1.0, description="Minimum sector weight %")
):
    """
    Get a heatmap of sector performance.
    
    Returns a visual representation of sector performance,
    with color coding based on percentage change.
    """
    result = generate_sectorial_data(
        timeframe=timeframe,
        include_technical=False,
        include_heatmap=True,
        include_constituents=False,
        limit=50
    )
    
    # Filter by minimum weight if needed
    if "sector_performance" in result.tables and min_weight > 0:
        filtered_rows = [
            row for row in result.tables["sector_performance"].rows 
            if row["Weight %"] >= min_weight
        ]
        result.tables["sector_performance"].rows = filtered_rows
    
    return result
