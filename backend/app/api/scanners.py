from fastapi import APIRouter, Query, Depends, HTTPException
from typing import List, Dict, Optional, Literal
from datetime import datetime, timedelta
import random
import logging
from sqlalchemy.orm import Session
from app.models.response_models import TableData, TableResponse, MultiTableResponse
from app.core.dependencies import get_db

router = APIRouter(prefix="/scanners", tags=["Scanners"])
logger = logging.getLogger(__name__)

def generate_scanner_data(
    scanner_type: str = "momentum",
    exchange: str = "NSE",
    min_price: float = 100.0,
    max_price: float = 10000.0,
    min_volume: int = 100000,
    min_rsi: float = 0.0,
    max_rsi: float = 100.0,
    limit: int = 20
) -> MultiTableResponse:
    """
    Generate scanner data based on specified criteria.
    
    Args:
        scanner_type: Type of scanner ('momentum', 'volume', 'breakout', 'oversold', 'overbought')
        exchange: Exchange to scan ('NSE', 'BSE')
        min_price: Minimum stock price filter
        max_price: Maximum stock price filter
        min_volume: Minimum volume filter
        min_rsi: Minimum RSI filter
        max_rsi: Maximum RSI filter
        limit: Maximum number of results to return
        
    Returns:
        MultiTableResponse with scanner results
    """
    try:
        # Generate sample stocks
        stocks = [
            "RELIANCE", "TATAMOTORS", "INFY", "HDFCBANK", "ICICIBANK", 
            "TATASTEEL", "BHARTIARTL", "LT", "HINDUNILVR", "ITC",
            "KOTAKBANK", "ASIANPAINT", "TITAN", "BAJFINANCE", "HCLTECH",
            "WIPRO", "TCS", "ULTRACEMCO", "SUNPHARMA", "NTPC"
        ]
        
        # Generate sectors for scanning
        sectors = ["BANK", "AUTO", "IT", "FMCG", "PHARMA", "METAL", "ENERGY", "REALTY"]
        
        # Generate scanner results based on type
        scanner_results = []
        
        for i, stock in enumerate(stocks[:limit]):
            price = round(random.uniform(min_price, max_price), 2)
            change_pct = round(random.uniform(-10, 20), 2)
            volume = random.randint(min_volume, min_volume * 10)
            rsi = round(random.uniform(min_rsi, max_rsi), 2)
            
            # Adjust values based on scanner type
            if scanner_type == "momentum" and i % 2 == 0:
                change_pct = round(random.uniform(5, 20), 2)  # Higher positive change
                rsi = round(random.uniform(60, 90), 2)  # Strong momentum
            elif scanner_type == "oversold":
                change_pct = round(random.uniform(-15, 0), 2)
                rsi = round(random.uniform(10, 30), 2)  # Oversold
            elif scanner_type == "overbought":
                change_pct = round(random.uniform(0, 15), 2)
                rsi = round(random.uniform(70, 90), 2)  # Overbought
            elif scanner_type == "breakout" and i % 3 == 0:
                volume = random.randint(min_volume * 2, min_volume * 20)  # High volume
                change_pct = round(random.uniform(3, 15), 2)
            
            scanner_results.append({
                "Symbol": stock,
                "LTP": price,
                "Change %": change_pct / 100,  # Convert to decimal for percentage
                "Volume": volume,
                "RSI(14)": rsi,
                "Sector": sectors[i % len(sectors)],
                "52W High %": round(random.uniform(-5, 20), 2),
                "52W Low %": round(random.uniform(-20, 5), 2)
            })
        
        # Define columns for the scanner results
        scanner_columns = [
            {"key": "Symbol", "label": "Symbol", "type": "text"},
            {"key": "LTP", "label": "LTP", "type": "number", "format": ",.2f"},
            {"key": "Change %", "label": "Change %", "type": "percentage", "format": ",.2f"},
            {"key": "Volume", "label": "Volume", "type": "number", "format": ",.0f"},
            {"key": "RSI(14)", "label": "RSI(14)", "type": "number", "format": ",.2f"},
            {"key": "Sector", "label": "Sector", "type": "text"},
            {"key": "52W High %", "label": "52W High %", "type": "percentage", "format": ",.2f"},
            {"key": "52W Low %", "label": "52W Low %", "type": "percentage", "format": ",.2f"}
        ]
        
        # Create tables for different scanner types
        tables = {}
        
        # Main scanner results
        tables["scanner_results"] = TableData(
            columns=scanner_columns,
            rows=sorted(scanner_results, key=lambda x: x["Change %"], reverse=True)[:limit],
            title=f"{scanner_type.capitalize()} Scanner Results",
            description=f"{scanner_type.capitalize()} scanner results for {exchange} stocks"
        )
        
        # Add sector-wise summary if we have enough data
        if len(scanner_results) > 5:
            sector_summary = {}
            for result in scanner_results:
                sector = result["Sector"]
                if sector not in sector_summary:
                    sector_summary[sector] = {"stocks": 0, "avg_change": 0, "total_volume": 0}
                sector_summary[sector]["stocks"] += 1
                sector_summary[sector]["avg_change"] += result["Change %"]
                sector_summary[sector]["total_volume"] += result["Volume"]
            
            # Calculate averages
            sector_data = [{
                "Sector": sector,
                "Stocks": data["stocks"],
                "Avg. Change %": (data["avg_change"] / data["stocks"]) if data["stocks"] > 0 else 0,
                "Total Volume": data["total_volume"],
                "Volume %": round((data["total_volume"] / sum(s["total_volume"] for s in sector_summary.values())) * 100, 2)
            } for sector, data in sector_summary.items()]
            
            sector_columns = [
                {"key": "Sector", "label": "Sector", "type": "text"},
                {"key": "Stocks", "label": "# Stocks", "type": "number", "format": ",.0f"},
                {"key": "Avg. Change %", "label": "Avg. Change %", "type": "percentage", "format": ",.2f"},
                {"key": "Total Volume", "label": "Total Volume", "type": "number", "format": ",.0f"},
                {"key": "Volume %", "label": "Volume %", "type": "percentage", "format": ",.2f"}
            ]
            
            tables["sector_summary"] = TableData(
                columns=sector_columns,
                rows=sorted(sector_data, key=lambda x: x["Avg. Change %"], reverse=True),
                title="Sector-wise Summary",
                description="Performance summary by sector"
            )
        
        return MultiTableResponse(
            success=True,
            message=f"Successfully retrieved {scanner_type} scanner results",
            tables=tables
        )
        
    except Exception as e:
        logger.error(f"Error in generate_scanner_data: {str(e)}", exc_info=True)
        return MultiTableResponse(
            success=False,
            message=f"Error retrieving scanner data: {str(e)}",
            tables={}
        )

@router.get("", response_model=MultiTableResponse)
async def get_scanner_results(
    scanner_type: str = Query(
        "momentum",
        description="Type of scanner to run",
        regex="^(momentum|volume|breakout|oversold|overbought)$"
    ),
    exchange: str = Query(
        "NSE",
        description="Exchange to scan",
        regex="^(NSE|BSE)$"
    ),
    min_price: float = Query(
        100.0,
        description="Minimum stock price",
        ge=1.0
    ),
    max_price: float = Query(
        10000.0,
        description="Maximum stock price",
        le=100000.0
    ),
    min_volume: int = Query(
        100000,
        description="Minimum volume threshold",
        ge=1000
    ),
    min_rsi: float = Query(
        0.0,
        description="Minimum RSI value",
        ge=0.0,
        le=100.0
    ),
    max_rsi: float = Query(
        100.0,
        description="Maximum RSI value",
        ge=0.0,
        le=100.0
    ),
    limit: int = Query(
        20,
        description="Maximum number of results to return",
        ge=1,
        le=100
    ),
    db: Session = Depends(get_db)
):
    """
    Run a market scanner with the specified criteria.
    
    Returns stocks that match the specified scanner criteria, with detailed
    technical analysis metrics for further evaluation.
    """
    # Validate RSI range
    if min_rsi > max_rsi:
        raise HTTPException(
            status_code=400,
            detail="min_rsi cannot be greater than max_rsi"
        )
    
    # Validate price range
    if min_price > max_price:
        raise HTTPException(
            status_code=400,
            detail="min_price cannot be greater than max_price"
        )
    
    return generate_scanner_data(
        scanner_type=scanner_type,
        exchange=exchange,
        min_price=min_price,
        max_price=max_price,
        min_volume=min_volume,
        min_rsi=min_rsi,
        max_rsi=max_rsi,
        limit=limit
    )

# Additional scanner-specific endpoints
@router.get("/momentum", response_model=MultiTableResponse)
async def momentum_scanner(
    min_price: float = Query(100.0, description="Minimum stock price"),
    max_price: float = Query(10000.0, description="Maximum stock price"),
    min_volume: int = Query(100000, description="Minimum volume threshold"),
    limit: int = Query(20, description="Maximum number of results to return")
):
    """
    Scan for stocks with strong momentum.
    
    Identifies stocks with significant price movement and volume,
    indicating strong buying or selling pressure.
    """
    return generate_scanner_data(
        scanner_type="momentum",
        min_price=min_price,
        max_price=max_price,
        min_volume=min_volume,
        min_rsi=60.0,  # Focus on strong momentum
        max_rsi=90.0,
        limit=limit
    )

@router.get("/volume-spikes", response_model=MultiTableResponse)
async def volume_spike_scanner(
    min_volume_multiplier: float = Query(2.0, description="Minimum volume vs average multiplier"),
    min_price: float = Query(50.0, description="Minimum stock price"),
    limit: int = Query(20, description="Maximum number of results to return")
):
    """
    Scan for stocks with unusual volume activity.
    
    Identifies stocks with volume significantly higher than their average,
    which may indicate institutional activity or news events.
    """
    # For demo, we'll adjust the min_volume based on the multiplier
    min_volume = int(100000 * min_volume_multiplier)
    
    return generate_scanner_data(
        scanner_type="volume",
        min_price=min_price,
        min_volume=min_volume,
        limit=limit
    )

@router.get("/breakouts", response_model=MultiTableResponse)
async def breakout_scanner(
    min_volume: int = Query(200000, description="Minimum volume threshold"),
    days_low_high: int = Query(20, description="Number of days for high/low calculation"),
    limit: int = Query(20, description="Maximum number of results to return")
):
    """
    Scan for stocks breaking out of key levels.
    
    Identifies stocks breaking above resistance or below support levels
    with significant volume, indicating potential trend continuation.
    """
    # In a real implementation, we would use the days_low_high parameter
    # For the demo, we'll just use the standard scanner with volume focus
    return generate_scanner_data(
        scanner_type="breakout",
        min_volume=min_volume,
        limit=limit
    )

@router.get("/oversold", response_model=MultiTableResponse)
async def oversold_scanner(
    max_rsi: float = Query(30.0, description="Maximum RSI for oversold condition"),
    min_price: float = Query(20.0, description="Minimum stock price"),
    limit: int = Query(20, description="Maximum number of results to return")
):
    """
    Scan for oversold stocks.
    
    Identifies stocks that may be oversold based on RSI,
    potentially indicating a buying opportunity.
    """
    return generate_scanner_data(
        scanner_type="oversold",
        min_price=min_price,
        min_rsi=10.0,
        max_rsi=max_rsi,
        limit=limit
    )

@router.get("/overbought", response_model=MultiTableResponse)
async def overbought_scanner(
    min_rsi: float = Query(70.0, description="Minimum RSI for overbought condition"),
    min_price: float = Query(20.0, description="Minimum stock price"),
    limit: int = Query(20, description="Maximum number of results to return")
):
    """
    Scan for overbought stocks.
    
    Identifies stocks that may be overbought based on RSI,
    potentially indicating a selling or shorting opportunity.
    """
    return generate_scanner_data(
        scanner_type="overbought",
        min_price=min_price,
        min_rsi=min_rsi,
        max_rsi=90.0,
        limit=limit
    )
