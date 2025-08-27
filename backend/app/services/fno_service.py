from typing import Dict, Optional
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.db.connection import get_engine
from app.utils.cache import cache
from app.utils.observability import observe


@cache.cached(ttl_seconds=5)
@observe("FNO.get_running_expiry")
def get_running_expiry(symbol: str) -> Dict[str, Optional[str]]:
    engine = get_engine()
    if not engine:
        return {"symbol": symbol, "expiryDate": None}
    try:
        with engine.connect() as conn:
            row = conn.execute(
                text(
                    """
                    SELECT expiry_date FROM fno_data
                    WHERE symbol = :symbol AND expiry_date IS NOT NULL
                    ORDER BY updated_at DESC
                    LIMIT 1
                    """
                ),
                {"symbol": symbol},
            ).first()
        return {"symbol": symbol, "expiryDate": row[0].isoformat() if row and row[0] else None}
    except SQLAlchemyError:
        return {"symbol": symbol, "expiryDate": None}


@cache.cached(ttl_seconds=5)
@observe("FNO.get_oi")
def get_oi(symbol: str, period: Optional[str] = None) -> Dict:
    engine = get_engine()
    if not engine:
        return {"symbol": symbol, "oi": None, "oiChange": None, "expiryDate": None}
    try:
        with engine.connect() as conn:
            row = conn.execute(
                text(
                    """
                    SELECT oi, oi_change, expiry_date FROM fno_data
                    WHERE symbol = :symbol
                    ORDER BY updated_at DESC
                    LIMIT 1
                    """
                ),
                {"symbol": symbol},
            ).first()
        oi = int(row[0]) if row and row[0] is not None else None
        oi_change = int(row[1]) if row and row[1] is not None else None
        expiry = row[2].isoformat() if row and row[2] else None
        return {"symbol": symbol, "oi": oi, "oiChange": oi_change, "expiryDate": expiry}
    except SQLAlchemyError:
        return {"symbol": symbol, "oi": None, "oiChange": None, "expiryDate": None}


@cache.cached(ttl_seconds=5)
@observe("FNO.get_option_chain")
def get_option_chain(symbol: str) -> Dict:
    engine = get_engine()
    if not engine:
        return {"symbol": symbol, "optionChain": None}
    try:
        with engine.connect() as conn:
            row = conn.execute(
                text(
                    """
                    SELECT option_chain FROM fno_data
                    WHERE symbol = :symbol
                    ORDER BY updated_at DESC
                    LIMIT 1
                    """
                ),
                {"symbol": symbol},
            ).first()
        return {"symbol": symbol, "optionChain": row[0] if row else None}
    except SQLAlchemyError:
        return {"symbol": symbol, "optionChain": None}


@cache.cached(ttl_seconds=5)
@observe("FNO.get_relative_factor")
def get_relative_factor(symbol: str) -> Dict:
    engine = get_engine()
    if not engine:
        return {"symbol": symbol, "relativeFactor": None}
    try:
        with engine.connect() as conn:
            row = conn.execute(
                text(
                    """
                    SELECT relative_strength FROM fno_data
                    WHERE symbol = :symbol
                    ORDER BY updated_at DESC
                    LIMIT 1
                    """
                ),
                {"symbol": symbol},
            ).first()
        return {"symbol": symbol, "relativeFactor": float(row[0]) if row and row[0] is not None else None}
    except SQLAlchemyError:
        return {"symbol": symbol, "relativeFactor": None}


@cache.cached(ttl_seconds=5)
@observe("FNO.get_signal")
def get_signal(symbol: str) -> Dict:
    engine = get_engine()
    if not engine:
        return {"symbol": symbol, "signal": None}
    try:
        with engine.connect() as conn:
            row = conn.execute(
                text(
                    """
                    SELECT signal FROM fno_data
                    WHERE symbol = :symbol
                    ORDER BY updated_at DESC
                    LIMIT 1
                    """
                ),
                {"symbol": symbol},
            ).first()
        return {"symbol": symbol, "signal": row[0] if row else None}
    except SQLAlchemyError:
        return {"symbol": symbol, "signal": None}


@cache.cached(ttl_seconds=5)
@observe("FNO.get_heatmap_top")
def get_heatmap_top(limit: int = 20) -> Dict:
    engine = get_engine()
    if not engine:
        return {"items": []}
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol, heatmap_score, relative_strength
                    FROM fno_data
                    WHERE heatmap_score IS NOT NULL
                    ORDER BY heatmap_score DESC
                    LIMIT :limit
                    """
                ),
                {"limit": limit},
            ).mappings().all()
        items = [
            {
                "symbol": r["symbol"],
                "heatmapScore": float(r["heatmap_score"]) if r["heatmap_score"] is not None else None,
                "relativeFactor": float(r["relative_strength"]) if r["relative_strength"] is not None else None,
            }
            for r in rows
        ]
        return {"items": items}
    except SQLAlchemyError:
        return {"items": []}
