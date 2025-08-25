from typing import Dict, List
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from backend.app.db.connection import get_engine
from backend.app.utils.cache import cache
from backend.app.utils.observability import observe


@cache.cached(ttl_seconds=10)
@observe("PRO.get_pro_setups")
def get_pro_setups() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {"items": []}
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol, five_min_spike, ten_min_spike, bullish_div_15m, bearish_div_1h,
                           multi_resistance, multi_support, bo_multi_resistance, bo_multi_support,
                           daily_contradiction
                    FROM pro_setup
                    ORDER BY updated_at DESC
                    LIMIT 500
                    """
                )
            ).mappings().all()
        items = []
        for r in rows:
            items.append(
                {
                    "symbol": r["symbol"],
                    "fiveMinSpike": float(r["five_min_spike"]) if r["five_min_spike"] is not None else None,
                    "tenMinSpike": float(r["ten_min_spike"]) if r["ten_min_spike"] is not None else None,
                    "bullishDiv15m": bool(r["bullish_div_15m"]) if r["bullish_div_15m"] is not None else None,
                    "bearishDiv1h": bool(r["bearish_div_1h"]) if r["bearish_div_1h"] is not None else None,
                    "multiResistance": bool(r["multi_resistance"]) if r["multi_resistance"] is not None else None,
                    "multiSupport": bool(r["multi_support"]) if r["multi_support"] is not None else None,
                    "boMultiResistance": bool(r["bo_multi_resistance"]) if r["bo_multi_resistance"] is not None else None,
                    "boMultiSupport": bool(r["bo_multi_support"]) if r["bo_multi_support"] is not None else None,
                    "dailyContradiction": bool(r["daily_contradiction"]) if r["daily_contradiction"] is not None else None,
                }
            )
        return {"items": items}
    except SQLAlchemyError:
        return {"items": []}


# Granular filters below

@cache.cached(ttl_seconds=10)
@observe("PRO.get_spike_5min")
def get_spike_5min(min_value: float = 0.0) -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {"items": []}
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol, five_min_spike FROM pro_setup
                    WHERE five_min_spike IS NOT NULL AND five_min_spike > :minv
                    ORDER BY five_min_spike DESC
                    LIMIT 500
                    """
                ),
                {"minv": min_value},
            ).mappings().all()
        return {"items": [{"symbol": r["symbol"], "fiveMinSpike": float(r["five_min_spike"]) } for r in rows]}
    except SQLAlchemyError:
        return {"items": []}


@cache.cached(ttl_seconds=10)
@observe("PRO.get_spike_10min")
def get_spike_10min(min_value: float = 0.0) -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {"items": []}
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol, ten_min_spike FROM pro_setup
                    WHERE ten_min_spike IS NOT NULL AND ten_min_spike > :minv
                    ORDER BY ten_min_spike DESC
                    LIMIT 500
                    """
                ),
                {"minv": min_value},
            ).mappings().all()
        return {"items": [{"symbol": r["symbol"], "tenMinSpike": float(r["ten_min_spike"]) } for r in rows]}
    except SQLAlchemyError:
        return {"items": []}


@cache.cached(ttl_seconds=10)
@observe("PRO.get_bullish_divergence_15")
def get_bullish_divergence_15() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {"items": []}
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol FROM pro_setup
                    WHERE bullish_div_15m = true
                    ORDER BY updated_at DESC
                    LIMIT 500
                    """
                )
            ).mappings().all()
        return {"items": [{"symbol": r["symbol"], "bullishDiv15m": True} for r in rows]}
    except SQLAlchemyError:
        return {"items": []}


@cache.cached(ttl_seconds=10)
@observe("PRO.get_bearish_divergence_15")
def get_bearish_divergence_15() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {"items": []}
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol FROM pro_setup
                    WHERE bearish_div_1h = false AND bullish_div_15m = false
                    """
                )
            ).mappings().all()
        return {"items": [{"symbol": r["symbol"], "bearishDiv15m": True} for r in rows]}
    except SQLAlchemyError:
        return {"items": []}


@cache.cached(ttl_seconds=10)
@observe("PRO.get_bullish_divergence_1h")
def get_bullish_divergence_1h() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {"items": []}
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol FROM pro_setup
                    WHERE bearish_div_1h = false
                    """
                )
            ).mappings().all()
        return {"items": [{"symbol": r["symbol"], "bullishDiv1h": True} for r in rows]}
    except SQLAlchemyError:
        return {"items": []}


@cache.cached(ttl_seconds=10)
@observe("PRO.get_bearish_divergence_1h")
def get_bearish_divergence_1h() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {"items": []}
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol FROM pro_setup
                    WHERE bearish_div_1h = true
                    ORDER BY updated_at DESC
                    LIMIT 500
                    """
                )
            ).mappings().all()
        return {"items": [{"symbol": r["symbol"], "bearishDiv1h": True} for r in rows]}
    except SQLAlchemyError:
        return {"items": []}


@cache.cached(ttl_seconds=10)
@observe("PRO.get_multi_resistance")
def get_multi_resistance() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {"items": []}
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol FROM pro_setup
                    WHERE multi_resistance = true
                    ORDER BY updated_at DESC
                    LIMIT 500
                    """
                )
            ).mappings().all()
        return {"items": [{"symbol": r["symbol"], "multiResistance": True} for r in rows]}
    except SQLAlchemyError:
        return {"items": []}


@cache.cached(ttl_seconds=10)
@observe("PRO.get_multi_support")
def get_multi_support() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {"items": []}
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol FROM pro_setup
                    WHERE multi_support = true
                    ORDER BY updated_at DESC
                    LIMIT 500
                    """
                )
            ).mappings().all()
        return {"items": [{"symbol": r["symbol"], "multiSupport": True} for r in rows]}
    except SQLAlchemyError:
        return {"items": []}


@cache.cached(ttl_seconds=10)
@observe("PRO.get_multi_resistance_eod")
def get_multi_resistance_eod() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {"items": []}
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol FROM pro_setup
                    WHERE bo_multi_resistance = true
                    ORDER BY updated_at DESC
                    LIMIT 500
                    """
                )
            ).mappings().all()
        return {"items": [{"symbol": r["symbol"], "boMultiResistance": True} for r in rows]}
    except SQLAlchemyError:
        return {"items": []}


@cache.cached(ttl_seconds=10)
@observe("PRO.get_multi_support_eod")
def get_multi_support_eod() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {"items": []}
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol FROM pro_setup
                    WHERE bo_multi_support = true
                    ORDER BY updated_at DESC
                    LIMIT 500
                    """
                )
            ).mappings().all()
        return {"items": [{"symbol": r["symbol"], "boMultiSupport": True} for r in rows]}
    except SQLAlchemyError:
        return {"items": []}


@cache.cached(ttl_seconds=10)
@observe("PRO.get_unusual_volume")
def get_unusual_volume(min_spike: float = 0.0) -> Dict[str, List[Dict]]:
    """Alias for unusual volume combining 5m and 10m spikes over threshold."""
    engine = get_engine()
    if not engine:
        return {"items": []}
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol, COALESCE(five_min_spike, 0) AS s5, COALESCE(ten_min_spike, 0) AS s10
                    FROM pro_setup
                    WHERE (five_min_spike IS NOT NULL AND five_min_spike > :t)
                       OR (ten_min_spike IS NOT NULL AND ten_min_spike > :t)
                    ORDER BY GREATEST(COALESCE(five_min_spike,0), COALESCE(ten_min_spike,0)) DESC
                    LIMIT 500
                    """
                ),
                {"t": min_spike},
            ).mappings().all()
        return {"items": [{"symbol": r["symbol"], "maxSpike": float(max(r["s5"], r["s10"]))} for r in rows]}
    except SQLAlchemyError:
        return {"items": []}
