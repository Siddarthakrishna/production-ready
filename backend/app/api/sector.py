from fastapi import APIRouter, Query
from typing import Optional
from app.services import sector_service as svc
from app.services import sectorial_heatmap_service as heatmap_svc
from app.api.schemas import SectorHeatmapResponse, SectorDetailResponse

router = APIRouter(prefix="/sector", tags=["sector"])  


@router.get("/heatmap", response_model=SectorHeatmapResponse)
def sector_heatmap():
    """Get sector-level heatmap data (legacy endpoint)"""
    return svc.get_sector_heatmap()


@router.get("/{sectorName}", response_model=SectorDetailResponse)
def sector_detail(sectorName: str):
    """Get detailed stock data for a specific sector (legacy endpoint)"""
    return svc.get_sector_detail(sectorName.upper())


# Enhanced Heatmap Endpoints
@router.get("/heatmap/sectors")
def get_sector_overview_heatmap(sector_filter: Optional[str] = Query(None, description="Filter by specific sector code")):
    """Get sector-level overview heatmap with enhanced data"""
    return heatmap_svc.get_sector_heatmap(sector_filter)


@router.get("/heatmap/stocks/{sector_code}")
def get_sector_stocks_heatmap(sector_code: str):
    """Get stock-level heatmap for a specific sector"""
    return heatmap_svc.get_sector_stock_heatmap(sector_code.upper())


@router.get("/heatmap/stocks")
def get_all_stocks_heatmap():
    """Get comprehensive heatmap showing all stocks across all sectors"""
    return heatmap_svc.get_all_sectors_stock_heatmap()


@router.get("/summary")
def get_sectors_summary():
    """Get sector summary with key performance metrics"""
    return heatmap_svc.get_sector_summary()
