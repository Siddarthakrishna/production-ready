from fastapi import APIRouter, Query
from backend.app.services import pro_setup_service as svc
from backend.app.api.schemas import ProListResponse

router = APIRouter(prefix="/pro", tags=["pro-setup"])  


@router.get("", response_model=ProListResponse)
def all_setups():
    return svc.get_pro_setups()


@router.get("/spike/5min", response_model=ProListResponse)
def spike_5min(min_value: float = Query(0.0, ge=0)):
    return svc.get_spike_5min(min_value=min_value)


@router.get("/spike/10min", response_model=ProListResponse)
def spike_10min(min_value: float = Query(0.0, ge=0)):
    return svc.get_spike_10min(min_value=min_value)


@router.get("/bullish-divergence/15", response_model=ProListResponse)
def bullish_div_15():
    return svc.get_bullish_divergence_15()


@router.get("/bearish-divergence/15", response_model=ProListResponse)
def bearish_div_15():
    return svc.get_bearish_divergence_15()


@router.get("/bullish-divergence/1h", response_model=ProListResponse)
def bullish_div_1h():
    return svc.get_bullish_divergence_1h()


@router.get("/bearish-divergence/1h", response_model=ProListResponse)
def bearish_div_1h():
    return svc.get_bearish_divergence_1h()


@router.get("/multi-resistance", response_model=ProListResponse)
def multi_resistance():
    return svc.get_multi_resistance()


@router.get("/multi-support", response_model=ProListResponse)
def multi_support():
    return svc.get_multi_support()


@router.get("/multi-resistance/eod", response_model=ProListResponse)
def multi_resistance_eod():
    return svc.get_multi_resistance_eod()


@router.get("/multi-support/eod", response_model=ProListResponse)
def multi_support_eod():
    return svc.get_multi_support_eod()


@router.get("/unusual-volume", response_model=ProListResponse)
def unusual_volume(min_spike: float = Query(0.0, ge=0)):
    return svc.get_unusual_volume(min_spike=min_spike)
