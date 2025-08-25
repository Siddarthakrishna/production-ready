from typing import Dict, List
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from backend.app.db.connection import get_engine
from backend.app.utils.cache import cache
from backend.app.utils.observability import observe


@cache.cached(ttl_seconds=5)
@observe("MD.get_highpower")
def get_highpower() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {"items": []}
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol, highpower_flag FROM market_depth
                    WHERE highpower_flag = true
                    ORDER BY updated_at DESC
                    LIMIT 200
                    """
                )
            ).mappings().all()
        return {"items": [{"symbol": r["symbol"], "highPowerFlag": True} for r in rows]}
    except SQLAlchemyError:
        return {"items": []}


@cache.cached(ttl_seconds=5)
@observe("MD.get_intraday_boost")
def get_intraday_boost() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {"items": []}
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol, intradayboost_flag FROM market_depth
                    WHERE intradayboost_flag = true
                    ORDER BY updated_at DESC
                    LIMIT 200
                    """
                )
            ).mappings().all()
        return {"items": [{"symbol": r["symbol"], "intradayBoostFlag": True} for r in rows]}
    except SQLAlchemyError:
        return {"items": []}


@cache.cached(ttl_seconds=5)
@observe("MD.get_top_level")
def get_top_level() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {"items": []}
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol, near_days_high FROM market_depth
                    WHERE near_days_high = true
                    ORDER BY updated_at DESC
                    LIMIT 200
                    """
                )
            ).mappings().all()
        return {"items": [{"symbol": r["symbol"], "nearDaysHigh": True} for r in rows]}
    except SQLAlchemyError:
        return {"items": []}


@cache.cached(ttl_seconds=5)
@observe("MD.get_low_level")
def get_low_level() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {"items": []}
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol, near_days_low FROM market_depth
                    WHERE near_days_low = true
                    ORDER BY updated_at DESC
                    LIMIT 200
                    """
                )
            ).mappings().all()
        return {"items": [{"symbol": r["symbol"], "nearDaysLow": True} for r in rows]}
    except SQLAlchemyError:
        return {"items": []}


@cache.cached(ttl_seconds=5)
@observe("MD.get_gainers")
def get_gainers() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {"items": []}
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol, gainer_rank FROM market_depth
                    WHERE gainer_rank IS NOT NULL
                    ORDER BY gainer_rank ASC
                    LIMIT 200
                    """
                )
            ).mappings().all()
        return {"items": [{"symbol": r["symbol"], "gainerRank": int(r["gainer_rank"]) } for r in rows]}
    except SQLAlchemyError:
        return {"items": []}


@cache.cached(ttl_seconds=5)
@observe("MD.get_losers")
def get_losers() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {"items": []}
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol, loser_rank FROM market_depth
                    WHERE loser_rank IS NOT NULL
                    ORDER BY loser_rank ASC
                    LIMIT 200
                    """
                )
            ).mappings().all()
        return {"items": [{"symbol": r["symbol"], "loserRank": int(r["loser_rank"]) } for r in rows]}
    except SQLAlchemyError:
        return {"items": []}
