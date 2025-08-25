from datetime import date
from typing import Optional
from fastapi import APIRouter, Query
from backend.app.services import fii_dii_service as svc
from backend.app.api.schemas import FiiDiiNet, FiiDiiBreakdown

router = APIRouter(prefix="/fii-dii", tags=["fii-dii"]) 


@router.get("/net", response_model=FiiDiiNet)
def fii_dii_net(on: Optional[date] = Query(default=None)):
    return svc.get_net(on)


@router.get("/breakdown", response_model=FiiDiiBreakdown)
def fii_dii_breakdown(range_: str = Query("1M", alias="range", pattern=r"^(1W|1M|3M|6M|1Y)$")):
    return svc.get_breakdown(range_)
