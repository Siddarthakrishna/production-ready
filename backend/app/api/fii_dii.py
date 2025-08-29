from datetime import date
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query, HTTPException
from app.services import fii_dii_service as svc
from app.api.schemas import FiiDiiNet, FiiDiiBreakdown
from app.services.param_normalizer import ParamNormalizer

router = APIRouter(prefix="/fii-dii", tags=["fii-dii"])

@router.get("/net", response_model=Dict[str, Any])
async def fii_dii_net(on: Optional[date] = Query(default=None)) -> Dict[str, Any]:
    """
    Get FII/DII net values for a specific date
    
    Args:
        on: Date for which to get FII/DII data. Defaults to today if not specified.
        
    Returns:
        Dictionary containing FII/DII net values with metadata in unified parameter format
    """
    try:
        # Get raw data
        raw_data = svc.get_net(on)
        
        # Normalize the data using ParamNormalizer
        normalized_data = {
            "date": raw_data["date"],
            "params": {
                "fii_net": raw_data["fii_net"],
                "dii_net": raw_data["dii_net"],
                "total_net": raw_data["total_net"],
                "fii_buy": raw_data["fii_buy"],
                "fii_sell": raw_data["fii_sell"],
                "dii_buy": raw_data["dii_buy"],
                "dii_sell": raw_data["dii_sell"],
                "timestamp": date.today().isoformat()
            }
        }
        
        # Apply parameter normalization
        return ParamNormalizer.normalize(normalized_data["params"], "fii_dii")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/breakdown", response_model=Dict[str, Any])
async def fii_dii_breakdown(range_: str = Query("1M", alias="range", pattern=r"^(1W|1M|3M|6M|1Y)$")) -> Dict[str, Any]:
    """
    Get time-bucketed breakdown of FII/DII data
    
    Args:
        range_: Time range for breakdown (1W, 1M, 3M, 6M, 1Y)
        
    Returns:
        Dictionary containing time-bucketed FII/DII data in unified parameter format
    """
    try:
        return svc.get_breakdown(range_)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/fetch_fii_dii_data", response_model=List[Dict[str, Any]])
async def fetch_fii_dii_data() -> List[Dict[str, Any]]:
    """
    Fetch FII/DII data in unified param format
    
    Returns:
        List of FII/DII data points in unified parameter format
    """
    try:
        return svc.get_fii_dii_data_unified()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
