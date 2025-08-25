from fastapi import APIRouter, Query
from typing import Optional
from backend.app.api.schemas import (
    FnoExpiry,
    FnoOI,
    FnoOptionChain,
    FnoRelativeFactor,
    FnoHeatmapResponse,
)
from backend.app.services import fno_service as svc

router = APIRouter(prefix="/fno", tags=["fno"])  # mounted at /api


@router.get("/{symbol}/expiry", response_model=FnoExpiry)
def get_expiry(symbol: str):
    return svc.get_running_expiry(symbol.upper())


@router.get("/{symbol}/oi", response_model=FnoOI)
def get_oi(symbol: str, period: Optional[str] = Query(default=None)):
    return svc.get_oi(symbol.upper(), period=period)


@router.get("/{symbol}/option-chain", response_model=FnoOptionChain)
def get_option_chain(symbol: str):
    return svc.get_option_chain(symbol.upper())


@router.get("/{symbol}/relative-factor", response_model=FnoRelativeFactor)
def get_relative_factor(symbol: str):
    return svc.get_relative_factor(symbol.upper())


@router.get("/heatmap", response_model=FnoHeatmapResponse)
def get_heatmap(limit: int = Query(20, ge=1, le=200)):
    return svc.get_heatmap_top(limit=limit)
