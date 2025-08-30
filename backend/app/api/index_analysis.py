from fastapi import APIRouter, Depends, Query
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import random
import logging
from ...models.response_models import TableData, TableResponse, MultiTableResponse

router = APIRouter(prefix="/index-analysis", tags=["Index Analysis"])
logger = logging.getLogger(__name__)

def get_index_analysis_data(
    index: str = "NIFTY 50",
    timeframe: str = "1D",
    include_sectors: bool = True,
    include_heatmap: bool = True,
    include_technical: bool = True,
    limit: int = 20
) -> MultiTableResponse:
    """
    Get index analysis data with the specified filters.
    
    Args:
        index: Index name (e.g., 'NIFTY 50', 'BANKNIFTY', 'NIFTY FINANCIAL SERVICES')
        timeframe: Analysis timeframe ('1D', '1W', '1M', '3M', '1Y')
        include_sectors: Whether to include sector-wise performance
        include_heatmap: Whether to include heatmap data
        include_technical: Whether to include technical indicators
        limit: Maximum number of rows to return per table
    
    Returns:
        MultiTableResponse with index analysis data
    """
    try:
        # Index Overview Table
        overview_data = [{
            "Index": index,
            "Current": round(10000 + random.uniform(-200, 200), 2),
            "Change": round(random.uniform(-100, 100), 2),
            "% Change": round(random.uniform(-2, 2), 2),
            "Open": round(10000 + random.uniform(-200, 200), 2),
            "High": round(10100 + random.uniform(-100, 100), 2),
            "Low": round(9900 + random.uniform(-100, 100), 2),
            "Prev. Close": round(10000 + random.uniform(-200, 200), 2),
            "52W High": round(10500 + random.uniform(-200, 200), 2),
            "52W Low": round(9500 + random.uniform(-200, 200), 2),
            "Volume": f"{random.randint(100, 500)}M"
        }]
        
        overview_columns = [
            {"key": "Index", "label": "Index", "type": "text"},
            {"key": "Current", "label": "Current", "type": "number", "format": ",.2f"},
            {"key": "Change", "label": "Change", "type": "number", "format": ",.2f"},
            {"key": "% Change", "label": "% Change", "type": "percentage", "format": ",.2f"},
            {"key": "Open", "label": "Open", "type": "number", "format": ",.2f"},
            {"key": "High", "label": "High", "type": "number", "format": ",.2f"},
            {"key": "Low", "label": "Low", "type": "number", "format": ",.2f"},
            {"key": "Prev. Close", "label": "Prev. Close", "type": "number", "format": ",.2f"},
            {"key": "52W High", "label": "52W High", "type": "number", "format": ",.2f"},
            {"key": "52W Low", "label": "52W Low", "type": "number", "format": ",.2f"},
            {"key": "Volume", "label": "Volume", "type": "text"}
        ]
        
        tables = {
            "overview": TableData(
                columns=overview_columns,
                rows=overview_data,
                title=f"{index} Overview",
                description=f"Key metrics for {index} index"
            )
        }
        
        # Sector Performance Table
        if include_sectors:
            sectors = ["AUTO", "BANK", "ENERGY", "FINANCIAL SERVICES", "FMCG", 
                      "IT", "MEDIA", "METAL", "PHARMA", "PVT BANK", "REALTY"]
            sector_data = []
            
            for sector in sectors:
                change = round(random.uniform(-3, 3), 2)
                sector_data.append({
                    "Sector": sector,
                    "Price": round(1000 + random.uniform(-200, 200), 2),
                    "Change": change,
                    "% Change": round(change / 100, 2),
                    "Volume": random.randint(10, 100) * 1000000,
                    "Advance/Decline": f"{random.randint(5, 15)}/{random.randint(1, 5)}",
                    "RSI(14)": round(30 + random.uniform(0, 40), 2),
                    "52W High": round(1200 + random.uniform(-200, 200), 2),
                    "52W Low": round(800 + random.uniform(-200, 200), 2)
                })
            
            sector_columns = [
                {"key": "Sector", "label": "Sector", "type": "text"},
                {"key": "Price", "label": "Price", "type": "number", "format": ",.2f"},
                {"key": "Change", "label": "Change", "type": "number", "format": ",.2f"},
                {"key": "% Change", "label": "% Change", "type": "percentage", "format": ",.2f"},
                {"key": "Volume", "label": "Volume", "type": "number", "format": ",.0f"},
                {"key": "Advance/Decline", "label": "Advance/Decline", "type": "text"},
                {"key": "RSI(14)", "label": "RSI(14)", "type": "number", "format": ",.2f"},
                {"key": "52W High", "label": "52W High", "type": "number", "format": ",.2f"},
                {"key": "52W Low", "label": "52W Low", "type": "number", "format": ",.2f"}
            ]
            
            tables["sector_performance"] = TableData(
                columns=sector_columns,
                rows=sorted(sector_data, key=lambda x: x["% Change"], reverse=True)[:limit],
                title=f"{index} Sector Performance",
                description=f"Sector-wise performance for {index} index"
            )
        
        # Index Constituents Table
        stocks = ["RELIANCE", "HDFCBANK", "ICICIBANK", "INFY", "TCS", "HINDUNILVR", 
                 "ITC", "KOTAKBANK", "HDFC", "BHARTIARTL", "LT", "SBIN", "BAJFINANCE", 
                 "ASIANPAINT", "HCLTECH", "AXISBANK", "TITAN", "MARUTI", "ULTRACEMCO", "SUNPHARMA"]
        
        constituents_data = []
        for stock in stocks[:limit]:
            change = round(random.uniform(-5, 5), 2)
            constituents_data.append({
                "Symbol": stock,
                "LTP": round(1000 + random.uniform(-500, 2000), 2),
                "Change": change,
                "% Change": round(change / 100, 2),
                "Volume": random.randint(1, 50) * 100000,
                "Weight %": round(random.uniform(0.5, 15), 2),
                "Beta": round(0.5 + random.random(), 2),
                "RSI(14)": round(30 + random.uniform(0, 40), 2),
                "52W High": round(1500 + random.uniform(-200, 500), 2),
                "52W Low": round(800 + random.uniform(-200, 200), 2)
            })
        
        constituents_columns = [
            {"key": "Symbol", "label": "Symbol", "type": "text"},
            {"key": "LTP", "label": "LTP", "type": "number", "format": ",.2f"},
            {"key": "Change", "label": "Change", "type": "number", "format": ",.2f"},
            {"key": "% Change", "label": "% Change", "type": "percentage", "format": ",.2f"},
            {"key": "Volume", "label": "Volume", "type": "number", "format": ",.0f"},
            {"key": "Weight %", "label": "Weight %", "type": "percentage", "format": ",.2f"},
            {"key": "Beta", "label": "Beta", "type": "number", "format": ",.2f"},
            {"key": "RSI(14)", "label": "RSI(14)", "type": "number", "format": ",.2f"},
            {"key": "52W High", "label": "52W High", "type": "number", "format": ",.2f"},
            {"key": "52W Low", "label": "52W Low", "type": "number", "format": ",.2f"}
        ]
        
        tables["constituents"] = TableData(
            columns=constituents_columns,
            rows=sorted(constituents_data, key=lambda x: x["Weight %"], reverse=True)[:limit],
            title=f"{index} Top Constituents",
            description=f"Top constituents of {index} index by weight"
        )
        
        return MultiTableResponse(
            success=True,
            message=f"Successfully retrieved {index} analysis data",
            tables=tables
        )
        
    except Exception as e:
        logger.error(f"Error in get_index_analysis_data: {str(e)}", exc_info=True)
        return MultiTableResponse(
            success=False,
            message=f"Error retrieving index analysis data: {str(e)}",
            tables={}
        )

@router.get("", response_model=MultiTableResponse)
async def get_index_analysis(
    index: str = Query("NIFTY 50", description="Index name (e.g., 'NIFTY 50', 'BANKNIFTY')"),
    timeframe: str = Query("1D", description="Analysis timeframe ('1D', '1W', '1M', '3M', '1Y')"),
    include_sectors: bool = Query(True, description="Include sector-wise performance"),
    include_heatmap: bool = Query(True, description="Include heatmap data"),
    include_technical: bool = Query(True, description="Include technical indicators"),
    limit: int = Query(20, description="Maximum number of rows to return per table", ge=1, le=100)
):
    """
    Get comprehensive analysis for a specific market index.
    
    Returns multiple tables with index overview, sector performance, and constituent data.
    """
    return get_index_analysis_data(
        index=index,
        timeframe=timeframe,
        include_sectors=include_sectors,
        include_heatmap=include_heatmap,
        include_technical=include_technical,
        limit=limit
    )
