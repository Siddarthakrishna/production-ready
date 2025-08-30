from datetime import date, datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.orm import Session
import logging
import random

from app.core.dependencies import get_db
from app.services import fii_dii_service as svc
from app.services.param_normalizer import ParamNormalizer
from app.models.response_models import MultiTableResponse, TableData

router = APIRouter(prefix="/fii-dii", tags=["fii-dii"])
logger = logging.getLogger(__name__)

@router.get("/net", response_model=Dict[str, Any])
async def get_fii_dii_net(
    on: Optional[date] = Query(
        None, 
        description="Date for FII/DII data in YYYY-MM-DD format. Defaults to latest available data."
    ),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get FII/DII net values for a specific date with detailed breakdown
    
    Returns:
        Dictionary containing:
        - net: FII/DII net values with buy/sell breakdown
        - metadata: Additional information about the data
    """
    try:
        # Get raw data from service
        raw_data = svc.get_net(on)
        
        # Normalize the data using ParamNormalizer
        normalized_data = ParamNormalizer.normalize(
            {
                "Symbol": "FII_DII_NET",
                "fii_net": raw_data["fii_net"],
                "dii_net": raw_data["dii_net"],
                "total_net": raw_data["total_net"],
                "fii_buy": raw_data["fii_buy"],
                "fii_sell": raw_data["fii_sell"],
                "dii_buy": raw_data["dii_buy"],
                "dii_sell": raw_data["dii_sell"],
                "flow_ratio": abs(raw_data["fii_net"]) / max(abs(raw_data["dii_net"]), 1),
                "timestamp": raw_data.get("timestamp", datetime.now().isoformat())
            },
            "fii_dii"
        )
        
        return {
            "success": True,
            "message": "FII/DII net data retrieved successfully",
            "data": normalized_data,
            "metadata": {
                "date": raw_data["date"],
                "last_updated": raw_data.get("timestamp", datetime.now().isoformat())
            }
        }
    except Exception as e:
        logger.error(f"Error in get_fii_dii_net: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Error retrieving FII/DII net data: {str(e)}"
        )

@router.get("/breakdown", response_model=Dict[str, Any])
async def get_fii_dii_breakdown(
    range_: str = Query(
        "1M", 
        alias="range", 
        regex=r"^(1W|1M|3M|6M|1Y)$",
        description="Time range for breakdown (1W, 1M, 3M, 6M, 1Y)"
    ),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get time-bucketed breakdown of FII/DII data
    
    Args:
        range_: Time range for the breakdown (1W, 1M, 3M, 6M, 1Y)
        
    Returns:
        Dictionary containing time-bucketed FII/DII data with metadata
    """
    try:
        # Get raw data from service
        breakdown = svc.get_breakdown(range_)
        
        # Prepare response with normalized data
        normalized_series = []
        for item in breakdown["series"]:
            normalized = ParamNormalizer.normalize(
                {
                    "Symbol": f"FII_DII_{item['bucket']}",
                    "fii_net": item["fii_net"],
                    "dii_net": item["dii_net"],
                    "total_net": item.get("total_net", item["fii_net"] + item["dii_net"]),
                    "flow_ratio": abs(item["fii_net"]) / max(abs(item["dii_net"]), 1),
                    "bucket": item["bucket"],
                    "timestamp": item.get("timestamp", datetime.now().isoformat())
                },
                "fii_dii"
            )
            normalized_series.append(normalized)
        
        return {
            "success": True,
            "message": f"FII/DII breakdown for {range_} retrieved successfully",
            "data": {
                "range": breakdown["range"],
                "series": normalized_series
            },
            "metadata": {
                "last_updated": datetime.now().isoformat(),
                "bucket_count": len(normalized_series)
            }
        }
    except Exception as e:
        logger.error(f"Error in get_fii_dii_breakdown: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Error retrieving FII/DII breakdown: {str(e)}"
        )

@router.get("/unified", response_model=MultiTableResponse)
async def get_fii_dii_unified(
    days: int = Query(
        30, 
        ge=1, 
        le=365,
        description="Number of days of historical data to return (max 365)"
    ),
    db: Session = Depends(get_db)
) -> MultiTableResponse:
    """
    Get FII/DII data in unified parameter format with multiple tables
    
    Returns:
        MultiTableResponse containing:
        - net_values: Daily net FII/DII values
        - summary: Summary statistics
    """
    try:
        # Get unified data from service
        unified_data = svc.get_fii_dii_data_unified(days)
        
        if not unified_data:
            return MultiTableResponse(
                success=False,
                message="No FII/DII data available",
                tables={}
            )
        
        # Prepare net values table
        net_values = []
        for item in unified_data:
            normalized = ParamNormalizer.normalize(item, "fii_dii")
            net_values.append(normalized)
        
        # Calculate summary statistics
        total_fii_net = sum(item["fii_net"] for item in unified_data)
        total_dii_net = sum(item["dii_net"] for item in unified_data)
        
        summary = [{
            "metric": "Total FII Net",
            "value": total_fii_net,
            "type": "currency"
        }, {
            "metric": "Total DII Net",
            "value": total_dii_net,
            "type": "currency"
        }, {
            "metric": "Net Flow Ratio",
            "value": abs(total_fii_net) / max(abs(total_dii_net), 1),
            "type": "number"
        }, {
            "metric": "Days Analyzed",
            "value": len(unified_data),
            "type": "number"
        }]
        
        # Create response with multiple tables
        return MultiTableResponse(
            success=True,
            message=f"FII/DII data for last {days} days retrieved successfully",
            tables={
                "net_values": TableData(
                    title="Daily FII/DII Net Values",
                    description=f"Daily net FII/DII values for the last {days} days",
                    columns=[
                        {"key": "Symbol", "label": "Date", "type": "text"},
                        {"key": "fii_net", "label": "FII Net", "type": "currency"},
                        {"key": "dii_net", "label": "DII Net", "type": "currency"},
                        {"key": "total_net", "label": "Total Net", "type": "currency"},
                        {"key": "fii_buy", "label": "FII Buy", "type": "currency"},
                        {"key": "fii_sell", "label": "FII Sell", "type": "currency"},
                        {"key": "dii_buy", "label": "DII Buy", "type": "currency"},
                        {"key": "dii_sell", "label": "DII Sell", "type": "currency"},
                        {"key": "flow_ratio", "label": "Flow Ratio", "type": "number", "format": ".2f"}
                    ],
                    rows=net_values
                ),
                "summary": TableData(
                    title="Summary Statistics",
                    description="Aggregated FII/DII statistics",
                    columns=[
                        {"key": "metric", "label": "Metric", "type": "text"},
                        {"key": "value", "label": "Value", "type": "dynamic"},
                        {"key": "type", "label": "Type", "type": "text"}
                    ],
                    rows=summary
                )
            },
            metadata={
                "start_date": unified_data[-1]["Symbol"],  # Oldest date
                "end_date": unified_data[0]["Symbol"],     # Newest date
                "total_records": len(unified_data),
                "last_updated": datetime.now().isoformat()
            }
        )
        
    except Exception as e:
        logger.error(f"Error in get_fii_dii_unified: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Error retrieving unified FII/DII data: {str(e)}"
        )
