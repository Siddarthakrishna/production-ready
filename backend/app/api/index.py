from fastapi import APIRouter, Query
from app.services import index_service
from app.api.schemas import (
    IndexExpiry,
    IndexOI,
    IndexPCR,
    IndexContracts,
    IndexOptionChain,
    IndexOHLCResponse,
    IndexVolumeAnalysis,
    IndexHeatmapResponse,
    IndexComprehensiveAnalysis,
)
from typing import Optional

router = APIRouter(prefix="/index", tags=["index"])


@router.get("/{name}/expiry", response_model=IndexExpiry)
def get_expiry(name: str):
    return index_service.get_index_expiry(name)


@router.get("/{name}/oi", response_model=IndexOI)
def get_oi(name: str):
    return index_service.get_index_oi(name)


@router.get("/{name}/pcr", response_model=IndexPCR)
def get_pcr(name: str):
    return index_service.get_index_pcr(name)


@router.get("/{name}/contracts", response_model=IndexContracts)
def get_contracts(name: str):
    return index_service.get_index_contracts(name)


@router.get("/{name}/option-chain", response_model=IndexOptionChain)
def get_option_chain(name: str):
    return index_service.get_index_option_chain(name)


# Enhanced Index Analysis Endpoints
@router.get("/{name}/ohlc", response_model=IndexOHLCResponse)
def get_ohlc_data(
    name: str, 
    timeframe: str = Query(default="1d", description="Timeframe: 1m, 5m, 15m, 1h, 1d"),
    limit: int = Query(default=100, description="Number of candles to return")
):
    """Get OHLC data for index with specified timeframe"""
    return index_service.get_index_ohlc(name, timeframe, limit)


@router.get("/{name}/volume", response_model=IndexVolumeAnalysis)
def get_volume_analysis(name: str):
    """Get volume analysis for the index"""
    return index_service.get_index_volume_analysis(name)


@router.get("/{name}/heatmap", response_model=IndexHeatmapResponse)
def get_index_heatmap(name: str):
    """Get heatmap of all constituent stocks in the index"""
    return index_service.get_index_heatmap(name)


@router.get("/{name}/comprehensive", response_model=IndexComprehensiveAnalysis)
def get_comprehensive_analysis(name: str):
    """Get comprehensive analysis including all metrics, OHLC, volume, and top movers"""
    return index_service.get_comprehensive_analysis(name)


@router.get("/supported", response_model=dict)
def get_supported_indices():
    """Get list of all supported indices"""
    return {
        "indices": [
            {"name": "NIFTY50", "display_name": "NIFTY 50", "description": "NSE NIFTY 50 Index"},
            {"name": "BANKNIFTY", "display_name": "BANK NIFTY", "description": "NSE BANK NIFTY Index"},
            {"name": "FINNIFTY", "display_name": "FIN NIFTY", "description": "NSE FIN NIFTY Index"},
            {"name": "MIDCAP", "display_name": "NIFTY MIDCAP 50", "description": "NSE NIFTY MIDCAP 50 Index"},
            {"name": "SENSEX", "display_name": "BSE SENSEX", "description": "BSE SENSEX Index"}
        ]
    }
