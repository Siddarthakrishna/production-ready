from fastapi import APIRouter, Query, HTTPException
from typing import Dict, Any, List
import pandas as pd
from datetime import datetime
from app.services import swing_service
from app.services.services.study_service import StudyService
from pydantic import BaseModel, Field

router = APIRouter(prefix="/swing", tags=["swing"])
adv_router = APIRouter(prefix="/adv-dec", tags=["swing"])  # mounted separately in main
study_router = APIRouter(prefix="/study", tags=["study"])

# Response Models
class SwingResponse(BaseModel):
    id: int
    symbol: str
    swing_type: str
    swing_level: float = Field(None, description="Swing level")
    detected_date: str = Field(None, description="Detected date")
    direction: str

class PaginatedSwingResponse(BaseModel):
    data: List[SwingResponse]
    pagination: Dict[str, Any]

class SwingSummaryResponse(BaseModel):
    total_swings: int
    direction_counts: Dict[str, int]
    latest_swing_date: str = Field(None, description="Latest swing date")
    top_symbols: List[Dict[str, Any]]

# Initialize services
study_service = StudyService()

@router.get("", response_model=PaginatedSwingResponse)
async def list_swings(
    limit: int = Query(200, ge=1, le=500, description="Number of records per page"),
    offset: int = Query(0, ge=0, description="Pagination offset")
) -> Dict[str, Any]:
    """
    Get paginated list of all swing points.
    
    - **limit**: Number of records per page (1-500)
    - **offset**: Number of records to skip for pagination
    """
    return swing_service.get_swings(limit=limit, offset=offset)

@router.get("/{symbol}", response_model=PaginatedSwingResponse)
async def swings_by_symbol(
    symbol: str,
    limit: int = Query(50, ge=1, le=500, description="Number of records per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    start_date: datetime = Query(None, description="Filter by start date"),
    end_date: datetime = Query(None, description="Filter by end date")
) -> Dict[str, Any]:
    """
    Get swing points for a specific symbol with optional date filtering.
    
    - **symbol**: Stock symbol to filter by (case-insensitive)
    - **limit**: Number of records per page (1-500)
    - **offset**: Number of records to skip for pagination
    - **start_date**: Optional start date filter (inclusive)
    - **end_date**: Optional end date filter (inclusive)
    """
    return swing_service.get_swings_by_symbol(
        symbol=symbol.upper(),
        limit=limit,
        offset=offset,
        start_date=start_date,
        end_date=end_date
    )

@router.get("/summary", response_model=SwingSummaryResponse)
async def get_swing_summary() -> Dict[str, Any]:
    """
    Get summary statistics of swing data.
    
    Returns:
        - Total number of swings
        - Count by direction (up/down)
        - Latest swing date
        - Top symbols by swing count
    """
    return swing_service.get_swing_summary()

# Real-data endpoints using StudyService
@adv_router.get("/NIFTY", response_model=Dict[str, Any])
async def adv_dec_nifty() -> Dict[str, Any]:
    """Get advance/decline data for NIFTY"""
    try:
        return await study_service.get_advance_decline_data("NIFTY")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching NIFTY advance/decline data: {str(e)}"
        )

@adv_router.get("/FO", response_model=Dict[str, Any])
async def adv_dec_fo() -> Dict[str, Any]:
    """Get advance/decline data for F&O stocks"""
    try:
        return await study_service.get_advance_decline_data("FO")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching F&O advance/decline data: {str(e)}"
        )

@router.get("/highbreak/{days}", response_model=Dict[str, Any])
async def high_break(
    days: int, 
    count: int = Query(50, ge=1, le=500, description="Number of symbols to return")
) -> Dict[str, Any]:
    """
    Get stocks breaking to new {days}-day highs.
    
    - **days**: Number of days for high break calculation
    - **count**: Maximum number of symbols to return (1-500)
    """
    try:
        name = f"{days} DAY HIGH BO"
        result = await study_service.get_study_symbol(name=name, count=count)
        return {
            "days": days,
            "type": "HIGH",
            "symbols": result.get("symbols", [])
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching high break data: {str(e)}"
        )

@router.get("/lowbreak/{days}", response_model=Dict[str, Any])
async def low_break(
    days: int, 
    count: int = Query(50, ge=1, le=500, description="Number of symbols to return")
) -> Dict[str, Any]:
    """
    Get stocks breaking to new {days}-day lows.
    
    - **days**: Number of days for low break calculation
    - **count**: Maximum number of symbols to return (1-500)
    """
    try:
        name = f"{days} DAY LOW BO"
        result = await study_service.get_study_symbol(name=name, count=count)
        return {
            "days": days,
            "type": "LOW",
            "symbols": result.get("symbols", [])
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching low break data: {str(e)}"
        )

@router.get("/nifty500", response_model=Dict[str, Any])
async def nifty500_snapshot() -> Dict[str, Any]:
    """Get snapshot of NIFTY 500 stocks with volume rankings"""
    try:
        return await study_service.get_volume_rankings(
            market="NIFTY500", 
            period="latest"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching NIFTY 500 snapshot: {str(e)}"
        )

@study_router.get("/data/{study_name}", response_model=Dict[str, Any])
async def get_study_data(study_name: str):
    """
    Get study data in param system format
    
    Example: /study/data/MAJOR INDEX WEEKLY PERFORMANCE
    """
    try:
        if "WEEKLY PERFORMANCE" in study_name:
            # Mock data for weekly performance
            return {
                "data": [
                    {
                        "Symbol": "NIFTY 50",
                        "param_0": 1.5,  # Weekly % change
                        "param_1": 19500.0,  # Current price
                        "param_2": 19200.0,  # Previous close
                        "param_3": 1.2,  # R-Factor
                        "param_4": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    },
                    # Add more indices as needed
                ],
                "name": study_name,
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=404, detail="Study not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@study_router.get("/symbol/{timeframe}-term-{swing_type}", response_model=Dict[str, Any])
async def get_swing_data(
    timeframe: str,
    swing_type: str,
    count: int = Query(20, ge=1, le=100)
):
    """
    Get swing data in param system format
    
    Args:
        timeframe: 'short' or 'long'
        swing_type: 'bullish' or 'bearish'
        count: Number of symbols to return
    """
    try:
        # This would come from your data source
        mock_data = {
            "short-term-bullish": [
                {
                    "Symbol": "RELIANCE",
                    "param_0": 2400.50,  # price
                    "param_1": 0.618,    # fibLevel
                    "param_2": 2500000,  # instFlow
                    "param_3": 1500000,  # volume
                    "param_4": 1.2       # accumulation
                },
                # Add more symbols as needed
            ],
            "short-term-bearish": [
                {
                    "Symbol": "TATASTEEL",
                    "param_0": 120.50,
                    "param_1": 0.382,
                    "param_2": -1500000,
                    "param_3": 2000000,
                    "param_4": -0.8
                },
            ],
            "long-term-bullish": [
                {
                    "Symbol": "HDFCBANK",
                    "param_0": 1600.25,  # price
                    "param_1": "Bullish", # emaSummary
                    "param_2": 1580.50,  # vwap
                    "param_3": 1800000,  # instFlow
                    "param_4": 1200000   # volume
                },
            ],
            "long-term-bearish": [
                {
                    "Symbol": "ITC",
                    "param_0": 420.75,
                    "param_1": "Bearish",
                    "param_2": 430.25,
                    "param_3": -900000,
                    "param_4": 900000
                },
            ]
        }
        
        key = f"{timeframe}-term-{swing_type}"
        data = mock_data.get(key, [])
        
        return {
            "data": data[:count],
            "name": key,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include routers in the main router
router.include_router(study_router)
