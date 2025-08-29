from typing import Dict, List
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from app.db.connection import get_engine
from app.utils.cache import cache
from app.utils.observability import observe
from app.services.param_normalizer import ParamNormalizer


@cache.cached(ttl_seconds=10)
@observe("PRO.get_pro_setups")
def get_pro_setups() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {
            "data": [],
            "name": "Pro Setups",
            "timestamp": datetime.now().isoformat()
        }
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol, five_min_spike, ten_min_spike, bullish_div_15m, bearish_div_1h,
                           multi_resistance, multi_support, bo_multi_resistance, bo_multi_support,
                           daily_contradiction, ltp, prev_close, change_percent, volume
                    FROM pro_setup
                    ORDER BY updated_at DESC
                    LIMIT 500
                    """
                )
            ).mappings().all()
        
        # Convert to parameter format
        raw_data = []
        for r in rows:
            raw_data.append({
                "Symbol": r["symbol"],
                "price": float(r.get("ltp", 0)) if r.get("ltp") else 100.0,
                "change": float(r.get("change_percent", 0)) if r.get("change_percent") else 1.0,
                "five_min_spike": float(r["five_min_spike"]) if r["five_min_spike"] is not None else 0.0,
                "ten_min_spike": float(r["ten_min_spike"]) if r["ten_min_spike"] is not None else 0.0,
                "bullish_div_15m": bool(r["bullish_div_15m"]) if r["bullish_div_15m"] is not None else False,
                "bearish_div_15m": False,  # Derived from logic
                "bullish_div_1h": not bool(r["bearish_div_1h"]) if r["bearish_div_1h"] is not None else False,
                "bearish_div_1h": bool(r["bearish_div_1h"]) if r["bearish_div_1h"] is not None else False,
                "multi_resistance": bool(r["multi_resistance"]) if r["multi_resistance"] is not None else False,
                "multi_support": bool(r["multi_support"]) if r["multi_support"] is not None else False,
                "bo_multi_resistance": bool(r["bo_multi_resistance"]) if r["bo_multi_resistance"] is not None else False,
                "bo_multi_support": bool(r["bo_multi_support"]) if r["bo_multi_support"] is not None else False,
                "daily_contradiction": bool(r["daily_contradiction"]) if r["daily_contradiction"] is not None else False,
                "volume": int(r.get("volume", 0)) if r.get("volume") else 100000,
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
        
        # Normalize using pro_setup module mapping
        normalized_data = ParamNormalizer.normalize(raw_data, module_name="pro_setup")
        
        return {
            "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
            "name": "Pro Setups",
            "timestamp": datetime.now().isoformat()
        }
    except SQLAlchemyError:
        return {
            "data": [],
            "name": "Pro Setups",
            "timestamp": datetime.now().isoformat()
        }


# Granular filters below

@cache.cached(ttl_seconds=10)
@observe("PRO.get_spike_5min")
def get_spike_5min(min_value: float = 0.0) -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {
            "data": [],
            "name": "5-Min Spikes",
            "timestamp": datetime.now().isoformat()
        }
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol, five_min_spike, ltp, prev_close, change_percent, volume
                    FROM pro_setup
                    WHERE five_min_spike IS NOT NULL AND five_min_spike > :minv
                    ORDER BY five_min_spike DESC
                    LIMIT 500
                    """
                ),
                {"minv": min_value},
            ).mappings().all()
        
        # Convert to parameter format
        raw_data = []
        for r in rows:
            raw_data.append({
                "Symbol": r["symbol"],
                "price": float(r.get("ltp", 0)) if r.get("ltp") else 100.0,
                "change": float(r.get("change_percent", 0)) if r.get("change_percent") else 1.0,
                "five_min_spike": float(r["five_min_spike"]),
                "volume": int(r.get("volume", 0)) if r.get("volume") else 100000,
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
        
        # Normalize using pro_setup module mapping
        normalized_data = ParamNormalizer.normalize(raw_data, module_name="pro_setup")
        
        return {
            "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
            "name": "5-Min Spikes",
            "timestamp": datetime.now().isoformat()
        }
    except SQLAlchemyError:
        return {
            "data": [],
            "name": "5-Min Spikes",
            "timestamp": datetime.now().isoformat()
        }


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
