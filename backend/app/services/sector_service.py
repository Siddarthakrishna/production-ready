from typing import Dict, List, Optional
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from app.db.connection import get_engine
from app.utils.cache import cache
from app.utils.observability import observe
from app.services.param_normalizer import ParamNormalizer


@cache.cached(ttl_seconds=10)
@observe("SECTOR.get_sector_heatmap")
def get_sector_heatmap() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {
            "data": [],
            "name": "Sector Heatmap",
            "timestamp": datetime.now().isoformat()
        }
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT sector_name, sector_heat_score, avg_price, avg_change, total_volume
                    FROM sector_overview
                    ORDER BY sector_name ASC
                    """
                )
            ).mappings().all()
        
        # Convert to parameter format for heatmap
        raw_data = []
        for r in rows:
            raw_data.append({
                "Symbol": r["sector_name"],
                "heatmap": float(r["sector_heat_score"]) if r["sector_heat_score"] is not None else 0.0,
                "price": float(r.get("avg_price", 0)) if r.get("avg_price") else 100.0,
                "change": float(r.get("avg_change", 0)) if r.get("avg_change") else 0.0,
                "volume": int(r.get("total_volume", 0)) if r.get("total_volume") else 100000,
                "sector": r["sector_name"],
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
        
        # Normalize using sectorial_flow module mapping
        normalized_data = ParamNormalizer.normalize(raw_data, module_name="sectorial_flow")
        
        return {
            "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
            "name": "Sector Heatmap",
            "timestamp": datetime.now().isoformat()
        }
    except SQLAlchemyError:
        return {
            "data": [],
            "name": "Sector Heatmap",
            "timestamp": datetime.now().isoformat()
        }


@cache.cached(ttl_seconds=10)
@observe("SECTOR.get_sector_detail")
def get_sector_detail(sector: str) -> Dict:
    engine = get_engine()
    if not engine:
        return {
            "data": [],
            "name": f"{sector} Sector Detail",
            "timestamp": datetime.now().isoformat()
        }
    try:
        with engine.connect() as conn:
            so = conn.execute(
                text(
                    """
                    SELECT id, sector_heat_score FROM sector_overview WHERE sector_name = :name
                    """
                ),
                {"name": sector},
            ).first()
            if not so:
                return {
                    "data": [],
                    "name": f"{sector} Sector Detail",
                    "timestamp": datetime.now().isoformat()
                }
            sector_id, heat = so[0], so[1]
            stocks = conn.execute(
                text(
                    """
                    SELECT symbol, price, percent_change, relative_factor, volume
                    FROM sector_stocks WHERE sector_id = :sid ORDER BY symbol ASC
                    """
                ),
                {"sid": sector_id},
            ).mappings().all()
        
        # Convert stocks to parameter format
        raw_data = []
        for s in stocks:
            raw_data.append({
                "Symbol": s["symbol"],
                "price": float(s["price"]) if s["price"] is not None else 100.0,
                "change": float(s["percent_change"]) if s["percent_change"] is not None else 0.0,
                "volume": int(s.get("volume", 0)) if s.get("volume") else 100000,
                "r_factor": float(s["relative_factor"]) if s["relative_factor"] is not None else 1.0,
                "sector": sector,
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
        
        # Normalize using sectorial_flow module mapping
        normalized_data = ParamNormalizer.normalize(raw_data, module_name="sectorial_flow")
        
        return {
            "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
            "name": f"{sector} Sector Detail",
            "timestamp": datetime.now().isoformat(),
            "sector_heat_score": float(heat) if heat is not None else 0.0
        }
    except SQLAlchemyError:
        return {
            "data": [],
            "name": f"{sector} Sector Detail",
            "timestamp": datetime.now().isoformat()
        }
