from fastapi import APIRouter
from app.services import sector_service as svc
from app.api.schemas import SectorHeatmapResponse, SectorDetailResponse

router = APIRouter(prefix="/sector", tags=["sector"])  


@router.get("/heatmap", response_model=SectorHeatmapResponse)
def sector_heatmap():
    return svc.get_sector_heatmap()


@router.get("/{sectorName}", response_model=SectorDetailResponse)
def sector_detail(sectorName: str):
    return svc.get_sector_detail(sectorName.upper())
