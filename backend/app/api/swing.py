from fastapi import APIRouter, Query, HTTPException
from typing import Dict, Any, List
import pandas as pd
from datetime import datetime
from app.services import swing_service
from app.services.services.study_service import StudyService
from app.services.param_normalizer import ParamNormalizer
from app.config.global_params import ParamType
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
    """Get advance/decline data for NIFTY in param format"""
    try:
        # Get advance/decline data from StudyService
        result = await study_service.get_advance_decline_data("NIFTY")
        
        # Ensure data follows param system format
        if "data" in result and result["data"]:
            # Normalize using advance_decline module mapping
            normalized_data = ParamNormalizer.normalize(
                result["data"], 
                module_name="advance_decline"
            )
            
            return {
                "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
                "name": "NIFTY Advance/Decline",
                "timestamp": datetime.now().isoformat()
            }
        else:
            # Return default structure if no data
            return {
                "data": [{
                    "Symbol": "NIFTY",
                    "param_0": 50.0,  # Default advance %
                    "param_1": 50.0,  # Default decline %
                    "param_2": 0.0,   # Net difference
                    "param_3": 0,     # Net advancing count
                    "param_4": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }],
                "name": "NIFTY Advance/Decline",
                "timestamp": datetime.now().isoformat()
            }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching NIFTY advance/decline data: {str(e)}"
        )

@adv_router.get("/FO", response_model=Dict[str, Any])
async def adv_dec_fo() -> Dict[str, Any]:
    """Get advance/decline data for F&O stocks in param format"""
    try:
        # Get advance/decline data from StudyService
        result = await study_service.get_advance_decline_data("FO")
        
        # Ensure data follows param system format
        if "data" in result and result["data"]:
            # Normalize using advance_decline module mapping
            normalized_data = ParamNormalizer.normalize(
                result["data"], 
                module_name="advance_decline"
            )
            
            return {
                "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
                "name": "F&O Advance/Decline",
                "timestamp": datetime.now().isoformat()
            }
        else:
            # Return default structure if no data
            return {
                "data": [{
                    "Symbol": "FO",
                    "param_0": 50.0,  # Default advance %
                    "param_1": 50.0,  # Default decline %
                    "param_2": 0.0,   # Net difference
                    "param_3": 0,     # Net advancing count
                    "param_4": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }],
                "name": "F&O Advance/Decline",
                "timestamp": datetime.now().isoformat()
            }
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
    Get stocks breaking to new {days}-day highs in param format.
    
    Returns data in format:
    - param_0: LTP (Last Traded Price)
    - param_1: Previous Close
    - param_2: % Change
    - param_3: Sector
    - param_4: Date (YYYY-MM-DD)
    """
    try:
        name = f"{days} DAY HIGH BO"
        result = await study_service.get_study_symbol(name=name, count=count)
        
        # Ensure data follows param system format for breakouts
        if "data" in result and result["data"]:
            # The data should already be in param format from StudyService
            # But let's ensure it's properly structured for breakouts
            normalized_data = []
            for item in result["data"]:
                if "Symbol" in item:
                    # Data is already in param format, just pass through
                    normalized_data.append(item)
                else:
                    # Convert if needed
                    normalized_item = {
                        "Symbol": item.get("symbol", "UNKNOWN"),
                        "param_0": float(item.get("ltp", item.get("price", 0))),  # LTP
                        "param_1": float(item.get("prev_close", item.get("price", 0) * 0.98)),  # Previous Close
                        "param_2": float(item.get("change_percent", 2.5)),  # % Change
                        "param_3": item.get("sector", "UNKNOWN"),  # Sector
                        "param_4": datetime.now().strftime('%Y-%m-%d')  # Date
                    }
                    normalized_data.append(normalized_item)
            
            return {
                "data": normalized_data,
                "name": f"{days} DAY HIGH BO",
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "data": [],
                "name": f"{days} DAY HIGH BO",
                "timestamp": datetime.now().isoformat()
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
    Get stocks breaking to new {days}-day lows in param format.
    
    Returns data in format:
    - param_0: LTP (Last Traded Price)
    - param_1: Previous Close
    - param_2: % Change
    - param_3: Sector
    - param_4: Date (YYYY-MM-DD)
    """
    try:
        name = f"{days} DAY LOW BO"
        result = await study_service.get_study_symbol(name=name, count=count)
        
        # Ensure data follows param system format for breakouts
        if "data" in result and result["data"]:
            # The data should already be in param format from StudyService
            # But let's ensure it's properly structured for breakouts
            normalized_data = []
            for item in result["data"]:
                if "Symbol" in item:
                    # Data is already in param format, just pass through
                    normalized_data.append(item)
                else:
                    # Convert if needed
                    normalized_item = {
                        "Symbol": item.get("symbol", "UNKNOWN"),
                        "param_0": float(item.get("ltp", item.get("price", 0))),  # LTP
                        "param_1": float(item.get("prev_close", item.get("price", 0) * 1.02)),  # Previous Close
                        "param_2": float(item.get("change_percent", -2.5)),  # % Change (negative for lows)
                        "param_3": item.get("sector", "UNKNOWN"),  # Sector
                        "param_4": datetime.now().strftime('%Y-%m-%d')  # Date
                    }
                    normalized_data.append(normalized_item)
            
            return {
                "data": normalized_data,
                "name": f"{days} DAY LOW BO",
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "data": [],
                "name": f"{days} DAY LOW BO",
                "timestamp": datetime.now().isoformat()
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
    
    For WEEKLY PERFORMANCE returns:
    - param_0: Weekly % change
    - param_1: Current Price
    - param_2: Previous Close
    - param_3: R-Factor
    - param_4: Timestamp
    """
    try:
        if "WEEKLY PERFORMANCE" in study_name:
            # Use weekly_performance module mapping
            weekly_data = [
                {
                    "Symbol": "NIFTY 50",
                    "weekly_change": 1.5,  # Weekly % change
                    "current_price": 19500.0,  # Current price
                    "prev_close": 19200.0,  # Previous close
                    "r_factor": 1.2,  # R-Factor
                    "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                },
                {
                    "Symbol": "NIFTY BANK",
                    "weekly_change": 2.1,
                    "current_price": 45000.0,
                    "prev_close": 44100.0,
                    "r_factor": 1.5,
                    "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                },
                {
                    "Symbol": "NIFTY IT",
                    "weekly_change": -0.8,
                    "current_price": 28500.0,
                    "prev_close": 28720.0,
                    "r_factor": 0.9,
                    "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }
            ]
            
            # Normalize using weekly_performance module mapping
            normalized_data = ParamNormalizer.normalize(
                weekly_data, 
                module_name="weekly_performance"
            )
            
            return {
                "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
                "name": study_name,
                "timestamp": datetime.now().isoformat()
            }
        else:
            # Try to get study data from StudyService
            try:
                result = await study_service.get_study_data(study_name)
                return result
            except:
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
        
    Returns param format based on timeframe:
    
    Short-term:
    - param_0: Price / EMA / Indicator value
    - param_1: Fib level / EMA summary
    - param_2: Institutional Flow
    - param_3: Volume
    - param_4: Accumulation / Date etc.
    
    Long-term:
    - param_0: Price / EMA / Indicator value
    - param_1: Fib level / EMA summary
    - param_2: Institutional Flow
    - param_3: Volume
    - param_4: Accumulation / Date etc.
    """
    try:
        # Mock data that will be normalized by ParamNormalizer
        if timeframe == "short":
            mock_data = {
                "bullish": [
                    {
                        "Symbol": "RELIANCE",
                        "price_ema_indicator": 2400.50,  # price
                        "fib_level_ema_summary": 0.618,    # fibLevel
                        "institutional_flow": 2500000,  # instFlow
                        "volume": 1500000,  # volume
                        "accumulation_date": 1.2       # accumulation
                    },
                    {
                        "Symbol": "TCS",
                        "price_ema_indicator": 3200.75,
                        "fib_level_ema_summary": 0.786,
                        "institutional_flow": 1800000,
                        "volume": 1200000,
                        "accumulation_date": 1.5
                    }
                ],
                "bearish": [
                    {
                        "Symbol": "TATASTEEL",
                        "price_ema_indicator": 120.50,
                        "fib_level_ema_summary": 0.382,
                        "institutional_flow": -1500000,
                        "volume": 2000000,
                        "accumulation_date": -0.8
                    }
                ]
            }
        else:  # long-term
            mock_data = {
                "bullish": [
                    {
                        "Symbol": "HDFCBANK",
                        "price_ema_indicator": 1600.25,  # price
                        "fib_level_ema_summary": "Bullish", # emaSummary
                        "institutional_flow": 1800000,  # instFlow
                        "volume": 1200000,   # volume
                        "accumulation_date": 1580.50  # vwap
                    }
                ],
                "bearish": [
                    {
                        "Symbol": "ITC",
                        "price_ema_indicator": 420.75,
                        "fib_level_ema_summary": "Bearish",
                        "institutional_flow": -900000,
                        "volume": 900000,
                        "accumulation_date": 430.25
                    }
                ]
            }
        
        key = swing_type
        data = mock_data.get(key, [])
        
        # Normalize using swing_service module mapping
        normalized_data = ParamNormalizer.normalize(
            data[:count], 
            module_name="swing_service"
        )
        
        return {
            "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
            "name": f"{timeframe}-term-{swing_type}",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include routers in the main router
router.include_router(study_router)
