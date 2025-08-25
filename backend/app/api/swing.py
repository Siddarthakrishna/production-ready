from fastapi import APIRouter, Query
from typing import Dict, Any
from backend.app.services import swing_service
from backend.app.services.services.study_service import StudyService

router = APIRouter(prefix="/swing", tags=["swing"])
adv_router = APIRouter(prefix="/adv-dec", tags=["swing"])  # mounted separately in main


@router.get("", response_model=Dict[str, Any])
def list_swings(limit: int = Query(200, ge=1, le=500)):
    return swing_service.get_swings(limit)


@router.get("/{symbol}", response_model=Dict[str, Any])
def swings_by_symbol(symbol: str, limit: int = Query(50, ge=1, le=500)):
    return swing_service.get_swings_by_symbol(symbol, limit)


# Real-data endpoints using StudyService
@adv_router.get("/NIFTY", response_model=Dict[str, Any])
async def adv_dec_nifty() -> Dict:
    svc = StudyService()
    return await svc.get_advance_decline_data("NIFTY")


@adv_router.get("/FO", response_model=Dict[str, Any])
async def adv_dec_fo() -> Dict:
    svc = StudyService()
    return await svc.get_advance_decline_data("FO")


@router.get("/highbreak/{days}", response_model=Dict[str, Any])
async def high_break(days: int, count: int = Query(50, ge=1, le=500)) -> Dict:
    svc = StudyService()
    name = f"{days} DAY HIGH BO"
    result = await svc.get_study_symbol(name=name, count=count)
    return {"days": days, "type": "HIGH", "symbols": result.get("symbols", [])}


@router.get("/lowbreak/{days}", response_model=Dict[str, Any])
async def low_break(days: int, count: int = Query(50, ge=1, le=500)) -> Dict:
    svc = StudyService()
    name = f"{days} DAY LOW BO"
    result = await svc.get_study_symbol(name=name, count=count)
    return {"days": days, "type": "LOW", "symbols": result.get("symbols", [])}


@router.get("/nifty500", response_model=Dict[str, Any])
async def nifty500_snapshot() -> Dict:
    svc = StudyService()
    # Use volume rankings as a simple snapshot placeholder powered by StudyService
    data = await svc.get_volume_rankings(market="NIFTY500", period="latest")
    return data
