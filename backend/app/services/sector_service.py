from typing import Dict, List, Optional
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.db.connection import get_engine
from app.utils.cache import cache
from app.utils.observability import observe


@cache.cached(ttl_seconds=10)
@observe("SECTOR.get_sector_heatmap")
def get_sector_heatmap() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {"sectors": []}
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT sector_name, sector_heat_score
                    FROM sector_overview
                    ORDER BY sector_name ASC
                    """
                )
            ).mappings().all()
        return {
            "sectors": [
                {
                    "sector": r["sector_name"],
                    "heatScore": float(r["sector_heat_score"]) if r["sector_heat_score"] is not None else None,
                }
                for r in rows
            ]
        }
    except SQLAlchemyError:
        return {"sectors": []}


@cache.cached(ttl_seconds=10)
@observe("SECTOR.get_sector_detail")
def get_sector_detail(sector: str) -> Dict:
    engine = get_engine()
    if not engine:
        return {"sector": sector, "heatScore": None, "stocks": []}
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
                return {"sector": sector, "heatScore": None, "stocks": []}
            sector_id, heat = so[0], so[1]
            stocks = conn.execute(
                text(
                    """
                    SELECT symbol, price, percent_change, relative_factor
                    FROM sector_stocks WHERE sector_id = :sid ORDER BY symbol ASC
                    """
                ),
                {"sid": sector_id},
            ).mappings().all()
        return {
            "sector": sector,
            "heatScore": float(heat) if heat is not None else None,
            "stocks": [
                {
                    "symbol": s["symbol"],
                    "price": float(s["price"]) if s["price"] is not None else None,
                    "percentChange": float(s["percent_change"]) if s["percent_change"] is not None else None,
                    "relativeFactor": float(s["relative_factor"]) if s["relative_factor"] is not None else None,
                }
                for s in stocks
            ],
        }
    except SQLAlchemyError:
        return {"sector": sector, "heatScore": None, "stocks": []}
