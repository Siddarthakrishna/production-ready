from fastapi import APIRouter, Query, HTTPException, Depends
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import random
import logging
from sqlalchemy.orm import Session
from app.models.response_models import TableData, TableResponse, MultiTableResponse
from app.core.dependencies import get_db

router = APIRouter(prefix="/money-flux", tags=["Money Flux"])
logger = logging.getLogger(__name__)

def generate_money_flux_data(
    index: str = "NIFTY50",
    timeframe: str = "1D",
    include: List[str] = None,
    limit: int = 20
) -> MultiTableResponse:
    """
    Generate money flux analysis data with the specified filters.
    
    Args:
        index: Index name (e.g., 'NIFTY50', 'BANKNIFTY')
        timeframe: Analysis timeframe ('1D', '1W', '1M', '3M', '1Y')
        include: List of sections to include
        limit: Maximum number of rows to return per table
    
    Returns:
        MultiTableResponse with money flux analysis data
    """
    try:
        tables = {}
        
        # Default sections to include if none specified
        if not include:
            include = ["heatmap", "sentiment", "pcr", "volume", "patterns"]
        
        # 1. Heatmap Data
        if "heatmap" in include:
            heatmap_data = []
            sectors = ["BANK", "AUTO", "IT", "FMCG", "PHARMA", "METAL", "ENERGY", "REALTY"]
            
            for sector in sectors:
                change = round(random.uniform(-5, 5), 2)
                heatmap_data.append({
                    "Sector": sector,
                    "Price": round(1000 + random.uniform(-200, 200), 2),
                    "Change": change,
                    "% Change": round(change / 100, 2),
                    "Volume": random.randint(10, 100) * 1000000,
                    "RSI(14)": round(30 + random.uniform(0, 40), 2),
                    "52W High %": round(random.uniform(0, 20), 2),
                    "52W Low %": round(random.uniform(-20, 0), 2)
                })
            
            heatmap_columns = [
                {"key": "Sector", "label": "Sector", "type": "text"},
                {"key": "Price", "label": "Price", "type": "number", "format": ",.2f"},
                {"key": "Change", "label": "Change", "type": "number", "format": ",.2f"},
                {"key": "% Change", "label": "% Change", "type": "percentage", "format": ",.2f"},
                {"key": "Volume", "label": "Volume", "type": "number", "format": ",.0f"},
                {"key": "RSI(14)", "label": "RSI(14)", "type": "number", "format": ",.2f"},
                {"key": "52W High %", "label": "52W High %", "type": "percentage", "format": ",.2f"},
                {"key": "52W Low %", "label": "52W Low %", "type": "percentage", "format": ",.2f"}
            ]
            
            tables["heatmap"] = TableData(
                columns=heatmap_columns,
                rows=sorted(heatmap_data, key=lambda x: x["% Change"], reverse=True)[:limit],
                title=f"{index} Money Flow Heatmap",
                description=f"Sector-wise money flow analysis for {index}"
            )
        
        # 2. Sentiment Analysis
        if "sentiment" in include:
            sentiment_data = [{
                "Sentiment": "Bullish",
                "Score": round(random.uniform(40, 100), 2),
                "Change %": round(random.uniform(-5, 5), 2),
                "Stocks": random.randint(100, 500),
                "Volume %": round(random.uniform(30, 80), 2),
                "OI %": round(random.uniform(20, 70), 2)
            }, {
                "Sentiment": "Bearish",
                "Score": round(random.uniform(10, 60), 2),
                "Change %": round(random.uniform(-5, 5), 2),
                "Stocks": random.randint(50, 300),
                "Volume %": round(random.uniform(20, 70), 2),
                "OI %": round(random.uniform(10, 60), 2)
            }]
            
            sentiment_columns = [
                {"key": "Sentiment", "label": "Sentiment", "type": "text"},
                {"key": "Score", "label": "Score", "type": "number", "format": ",.2f"},
                {"key": "Change %", "label": "Change %", "type": "percentage", "format": ",.2f"},
                {"key": "Stocks", "label": "Stocks", "type": "number", "format": ",.0f"},
                {"key": "Volume %", "label": "Volume %", "type": "percentage", "format": ",.2f"},
                {"key": "OI %", "label": "OI %", "type": "percentage", "format": ",.2f"}
            ]
            
            tables["sentiment"] = TableData(
                columns=sentiment_columns,
                rows=sentiment_data,
                title=f"{index} Market Sentiment",
                description=f"Market sentiment analysis for {index}"
            )
        
        # 3. PCR Analysis
        if "pcr" in include:
            pcr_data = [{
                "Expiry": (datetime.now() + timedelta(days=i*7)).strftime('%d-%b-%Y'),
                "PCR": round(random.uniform(0.5, 1.8), 2),
                "Change %": round(random.uniform(-10, 10), 2),
                "Call OI": random.randint(50000, 200000),
                "Put OI": random.randint(50000, 200000),
                "PCR Trend": "Bullish" if random.random() > 0.5 else "Bearish"
            } for i in range(1, 5)]
            
            pcr_columns = [
                {"key": "Expiry", "label": "Expiry", "type": "text"},
                {"key": "PCR", "label": "PCR", "type": "number", "format": ",.2f"},
                {"key": "Change %", "label": "Change %", "type": "percentage", "format": ",.2f"},
                {"key": "Call OI", "label": "Call OI", "type": "number", "format": ",.0f"},
                {"key": "Put OI", "label": "Put OI", "type": "number", "format": ",.0f"},
                {"key": "PCR Trend", "label": "PCR Trend", "type": "text"}
            ]
            
            tables["pcr"] = TableData(
                columns=pcr_columns,
                rows=pcr_data,
                title=f"{index} Put-Call Ratio Analysis",
                description=f"PCR analysis for {index} across different expiries"
            )
        
        # 4. Volume Analysis
        if "volume" in include:
            volume_data = []
            stocks = ["RELIANCE", "HDFCBANK", "ICICIBANK", "INFY", "TCS", "HDFC", "ITC", "KOTAKBANK"]
            
            for stock in stocks:
                change = round(random.uniform(-5, 5), 2)
                volume_data.append({
                    "Symbol": stock,
                    "Price": round(1000 + random.uniform(-500, 2000), 2),
                    "Change %": round(change / 100, 2),
                    "Volume": random.randint(100, 1000) * 1000,
                    "Volume vs 20D Avg": round(random.uniform(0.5, 2.0), 2),
                    "Delivery %": round(random.uniform(30, 80), 2),
                    "OI Change %": round(random.uniform(-10, 10), 2)
                })
            
            volume_columns = [
                {"key": "Symbol", "label": "Symbol", "type": "text"},
                {"key": "Price", "label": "Price", "type": "number", "format": ",.2f"},
                {"key": "Change %", "label": "Change %", "type": "percentage", "format": ",.2f"},
                {"key": "Volume", "label": "Volume", "type": "number", "format": ",.0f"},
                {"key": "Volume vs 20D Avg", "label": "Volume vs 20D Avg", "type": "number", "format": ",.2f"},
                {"key": "Delivery %", "label": "Delivery %", "type": "percentage", "format": ",.2f"},
                {"key": "OI Change %", "label": "OI Change %", "type": "percentage", "format": ",.2f"}
            ]
            
            tables["volume"] = TableData(
                columns=volume_columns,
                rows=sorted(volume_data, key=lambda x: x["Volume vs 20D Avg"], reverse=True)[:limit],
                title=f"{index} Volume Analysis",
                description=f"Volume and delivery analysis for {index} stocks"
            )
        
        # 5. Chart Patterns
        if "patterns" in include:
            patterns = ["Double Top", "Head & Shoulders", "Cup & Handle", "Triangle", "Flag", "Pennant"]
            timeframes = ["1D", "1W", "1M", "3M"]
            
            patterns_data = []
            for pattern in patterns:
                for tf in timeframes:
                    if random.random() > 0.7:  # 30% chance of pattern being detected
                        patterns_data.append({
                            "Pattern": pattern,
                            "Timeframe": tf,
                            "Symbols": random.randint(5, 50),
                            "Reliability %": round(random.uniform(60, 95), 2),
                            "Avg. Target %": round(random.uniform(2, 15), 2),
                            "Stop Loss %": round(random.uniform(1, 8), 2)
                        })
            
            patterns_columns = [
                {"key": "Pattern", "label": "Pattern", "type": "text"},
                {"key": "Timeframe", "label": "Timeframe", "type": "text"},
                {"key": "Symbols", "label": "# Symbols", "type": "number", "format": ",.0f"},
                {"key": "Reliability %", "label": "Reliability %", "type": "percentage", "format": ",.2f"},
                {"key": "Avg. Target %", "label": "Avg. Target %", "type": "percentage", "format": ",.2f"},
                {"key": "Stop Loss %", "label": "Stop Loss %", "type": "percentage", "format": ",.2f"}
            ]
            
            if patterns_data:
                tables["patterns"] = TableData(
                    columns=patterns_columns,
                    rows=patterns_data,
                    title=f"{index} Chart Patterns",
                    description=f"Detected chart patterns for {index} stocks"
                )
        
        return MultiTableResponse(
            success=True,
            message=f"Successfully retrieved money flux data for {index}",
            tables=tables
        )
        
    except Exception as e:
        logger.error(f"Error in generate_money_flux_data: {str(e)}", exc_info=True)
        return MultiTableResponse(
            success=False,
            message=f"Error retrieving money flux data: {str(e)}",
            tables={}
        )

@router.get("", response_model=MultiTableResponse)
async def get_money_flux(
    index: str = Query("NIFTY50", description="Index name (e.g., 'NIFTY50', 'BANKNIFTY')"),
    timeframe: str = Query("1D", description="Analysis timeframe ('1D', '1W', '1M', '3M', '1Y')"),
    include: List[str] = Query(None, description="Sections to include (heatmap, sentiment, pcr, volume, patterns)"),
    limit: int = Query(20, description="Maximum number of rows per table", ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get money flow analysis for the specified index.
    
    Returns multiple tables with money flow metrics including heatmap, sentiment,
    PCR, volume analysis, and chart patterns.
    """
    return generate_money_flux_data(
        index=index,
        timeframe=timeframe,
        include=include,
        limit=limit
    )
