from fastapi import APIRouter
from backend.app.services import market_depth_service as svc
from backend.app.api.schemas import MarketDepthListResponse

router = APIRouter(prefix="/market-depth", tags=["market-depth"])  


@router.get("/highpower", response_model=MarketDepthListResponse)
def highpower():
    return svc.get_highpower()


@router.get("/intraday-boost", response_model=MarketDepthListResponse)
def intraday_boost():
    return svc.get_intraday_boost()


@router.get("/top-level", response_model=MarketDepthListResponse)
def top_level():
    return svc.get_top_level()


@router.get("/low-level", response_model=MarketDepthListResponse)
def low_level():
    return svc.get_low_level()


@router.get("/gainers", response_model=MarketDepthListResponse)
def gainers():
    return svc.get_gainers()


@router.get("/losers", response_model=MarketDepthListResponse)
def losers():
    return svc.get_losers()
