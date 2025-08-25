from fastapi import APIRouter, Query
from backend.app.services.money_flux_service import (
    get_heatmap_snapshot,
    get_sentiment_analysis,
    get_pcr_calculations,
    get_volume_histogram,
    get_ohlc_chart_data,
    get_expiry_data
)
from backend.app.api.schemas import (
    MoneyfluxHeatmap,
    MoneyfluxSentiment,
    MoneyfluxPCR,
    MoneyfluxVolumeHistogram,
    MoneyfluxOHLC,
    MoneyfluxExpiry
)

router = APIRouter(prefix="/moneyflux", tags=["moneyflux"])


@router.get("/heatmap", response_model=MoneyfluxHeatmap)
async def heatmap(index: str = Query(default="NIFTY50")):
    return get_heatmap_snapshot(index)


@router.get("/sentiment", response_model=MoneyfluxSentiment)
async def sentiment_analysis(index: str = Query(default="NIFTY50"), expiry: str = Query(default=None)):
    """Get sentiment dial calculations with complex mathematical formulas"""
    return get_sentiment_analysis(index, expiry)


@router.get("/pcr", response_model=MoneyfluxPCR)
async def pcr_analysis(index: str = Query(default="NIFTY50"), expiry: str = Query(default=None)):
    """Get Put-Call Ratio calculations and indicators"""
    return get_pcr_calculations(index, expiry)


@router.get("/volume-histogram", response_model=MoneyfluxVolumeHistogram)
async def volume_histogram(index: str = Query(default="NIFTY50"), expiry: str = Query(default=None)):
    """Get volume histogram analysis with sophisticated data processing"""
    return get_volume_histogram(index, expiry)


@router.get("/chart", response_model=MoneyfluxOHLC)
async def chart_data(index: str = Query(default="NIFTY50"), timeframe: str = Query(default="3m")):
    """Get OHLC chart data with professional timestamp alignment"""
    return get_ohlc_chart_data(index, timeframe)


@router.get("/expiry", response_model=MoneyfluxExpiry)
async def expiry_data(index: str = Query(default="NIFTY50")):
    """Get multi-expiry data for dropdown switching"""
    return get_expiry_data(index)
