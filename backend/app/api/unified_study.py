"""
Unified Study API - Returns all study data in unified param format

This module provides endpoints that return financial data in the standardized
param_0 to param_4 format for consistent frontend consumption.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional, Dict, List
from app.services.services.study_service import StudyService
from app.services.fii_dii_service import get_fii_dii_data_unified

router = APIRouter(prefix="/unified", tags=["unified-study"])

# Initialize study service
study_service = StudyService()


@router.get("/study-data")
async def get_unified_study_data(
    name: str = Query(..., description="Study name (e.g., 'SECTORIAL VIEW', 'NIFTY 50', 'MONEYFLOW ABS B')")
) -> Dict:
    """
    Get study data in unified param format
    
    Returns data with standardized structure:
    - Symbol: Identifier
    - param_0: LTP/price value
    - param_1: Previous close
    - param_2: % change (for heatmaps)
    - param_3: R-Factor/momentum
    - param_4: DateTime
    """
    try:
        result = await study_service.get_study_data(name)
        return {
            "success": True,
            "data": result.get("data", []),
            "name": name,
            "timestamp": result.get("timestamp"),
            "format": "unified_param"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/study-symbol")
async def get_unified_study_symbol(
    name: str = Query(..., description="Study name"),
    count: int = Query(5, ge=1, le=50, description="Number of symbols to return")
) -> Dict:
    """
    Get study symbols in unified param format
    """
    try:
        result = await study_service.get_study_symbol(name, count)
        return {
            "success": True,
            "data": result.get("data", []),
            "name": name,
            "count": len(result.get("data", [])),
            "timestamp": result.get("timestamp"),
            "format": "unified_param"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/adv-dec/{index}")
async def get_unified_advance_decline(index: str) -> Dict:
    """
    Get advance/decline data in unified param format
    """
    try:
        result = await study_service.get_advance_decline_data(index)
        return {
            "success": True,
            "data": result.get("data", []),
            "index": index,
            "timestamp": result.get("timestamp"),
            "format": "unified_param"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fetch_fii_dii_data")
async def fetch_unified_fii_dii_data() -> List[Dict]:
    """
    Fetch FII/DII data in unified param format
    Compatible with frontend expectations
    """
    try:
        return get_fii_dii_data_unified()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fetch_hd_data_fno")
async def fetch_hd_data_fno() -> List[Dict]:
    """
    Fetch high delivery F&O data in unified param format
    """
    try:
        # Mock data in param format for F&O scanner
        result = await study_service.get_study_data("NIFTY 50")
        return result.get("data", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fetch_hd_data_n500")
async def fetch_hd_data_n500() -> List[Dict]:
    """
    Fetch high delivery NIFTY 500 data in unified param format
    """
    try:
        result = await study_service.get_study_data("NIFTY 500")
        return result.get("data", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fetch_dsp_data_fno")
async def fetch_dsp_data_fno() -> List[Dict]:
    """
    Fetch delivery spike F&O data in unified param format
    """
    try:
        result = await study_service.get_study_data("GAINER")
        return result.get("data", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fetch_dsp_data_n500")
async def fetch_dsp_data_n500() -> List[Dict]:
    """
    Fetch delivery spike NIFTY 500 data in unified param format
    """
    try:
        result = await study_service.get_study_data("LOSSER")
        return result.get("data", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Legacy compatibility endpoints
@router.get("/current")
async def get_server_time() -> Dict:
    """Get current server time"""
    from datetime import datetime
    return {
        "success": True,
        "time": datetime.now().isoformat(),
        "format": "ISO"
    }


# Summary endpoint for data format verification
@router.get("/format-info")
async def get_format_info() -> Dict:
    """
    Get information about the unified param format
    """
    return {
        "format": "unified_param",
        "description": "Standardized data format for all financial visualizations",
        "structure": {
            "Symbol": "Stock/Index identifier",
            "param_0": "Last Trading Price (LTP) - used for bar charts",
            "param_1": "Previous Close Price", 
            "param_2": "% Change from previous close - used for heatmap colors",
            "param_3": "R-Factor (momentum/relative factor)",
            "param_4": "DateTime (YYYY-MM-DD HH:mm:ss)"
        },
        "usage": {
            "bar_charts": "Use param_0 for Y-axis values",
            "heatmaps": "Use param_2 for color scaling",
            "tables": "Display all params with proper column mapping",
            "momentum": "Use param_3 for momentum visualization"
        }
    }