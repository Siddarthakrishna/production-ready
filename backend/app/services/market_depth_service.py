from typing import Dict, List
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from app.db.connection import get_engine
from app.utils.cache import cache
from app.utils.observability import observe
from app.services.param_normalizer import ParamNormalizer


@cache.cached(ttl_seconds=5)
@observe("MD.get_highpower")
def get_highpower() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {
            "data": [],
            "name": "High Power Stocks",
            "timestamp": datetime.now().isoformat()
        }
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol, highpower_flag, ltp, prev_close, change_percent, volume, sector
                    FROM market_depth
                    WHERE highpower_flag = true
                    ORDER BY updated_at DESC
                    LIMIT 200
                    """
                )
            ).mappings().all()
        
        # Convert to parameter format
        raw_data = []
        for r in rows:
            raw_data.append({
                "Symbol": r["symbol"],
                "price": float(r.get("ltp", 0)) if r.get("ltp") else 100.0,
                "prev_close": float(r.get("prev_close", 0)) if r.get("prev_close") else 98.0,
                "change": float(r.get("change_percent", 0)) if r.get("change_percent") else 2.0,
                "volume": int(r.get("volume", 0)) if r.get("volume") else 100000,
                "rank": 1,  # High power rank
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
        
        # Normalize using market_depth module mapping
        normalized_data = ParamNormalizer.normalize(raw_data, module_name="market_depth")
        
        return {
            "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
            "name": "High Power Stocks",
            "timestamp": datetime.now().isoformat()
        }
    except SQLAlchemyError:
        return {
            "data": [],
            "name": "High Power Stocks",
            "timestamp": datetime.now().isoformat()
        }


@cache.cached(ttl_seconds=5)
@observe("MD.get_intraday_boost")
def get_intraday_boost() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {
            "data": [],
            "name": "Intraday Boost Stocks",
            "timestamp": datetime.now().isoformat()
        }
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol, intradayboost_flag, ltp, prev_close, change_percent, volume
                    FROM market_depth
                    WHERE intradayboost_flag = true
                    ORDER BY updated_at DESC
                    LIMIT 200
                    """
                )
            ).mappings().all()
        
        # Convert to parameter format
        raw_data = []
        for r in rows:
            raw_data.append({
                "Symbol": r["symbol"],
                "price": float(r.get("ltp", 0)) if r.get("ltp") else 100.0,
                "prev_close": float(r.get("prev_close", 0)) if r.get("prev_close") else 98.0,
                "change": float(r.get("change_percent", 0)) if r.get("change_percent") else 2.0,
                "volume": int(r.get("volume", 0)) if r.get("volume") else 100000,
                "rank": 1,  # Intraday boost rank
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
        
        # Normalize using market_depth module mapping
        normalized_data = ParamNormalizer.normalize(raw_data, module_name="market_depth")
        
        return {
            "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
            "name": "Intraday Boost Stocks",
            "timestamp": datetime.now().isoformat()
        }
    except SQLAlchemyError:
        return {
            "data": [],
            "name": "Intraday Boost Stocks",
            "timestamp": datetime.now().isoformat()
        }


@cache.cached(ttl_seconds=5)
@observe("MD.get_top_level")
def get_top_level() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {
            "data": [],
            "name": "Near Days High",
            "timestamp": datetime.now().isoformat()
        }
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol, near_days_high, ltp, prev_close, change_percent, volume
                    FROM market_depth
                    WHERE near_days_high = true
                    ORDER BY updated_at DESC
                    LIMIT 200
                    """
                )
            ).mappings().all()
        
        # Convert to parameter format
        raw_data = []
        for r in rows:
            raw_data.append({
                "Symbol": r["symbol"],
                "price": float(r.get("ltp", 0)) if r.get("ltp") else 100.0,
                "prev_close": float(r.get("prev_close", 0)) if r.get("prev_close") else 98.0,
                "change": float(r.get("change_percent", 0)) if r.get("change_percent") else 2.0,
                "volume": int(r.get("volume", 0)) if r.get("volume") else 100000,
                "rank": 1,  # Near high rank
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
        
        # Normalize using market_depth module mapping
        normalized_data = ParamNormalizer.normalize(raw_data, module_name="market_depth")
        
        return {
            "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
            "name": "Near Days High",
            "timestamp": datetime.now().isoformat()
        }
    except SQLAlchemyError:
        return {
            "data": [],
            "name": "Near Days High",
            "timestamp": datetime.now().isoformat()
        }


@cache.cached(ttl_seconds=5)
@observe("MD.get_low_level")
def get_low_level() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {
            "data": [],
            "name": "Near Days Low",
            "timestamp": datetime.now().isoformat()
        }
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol, near_days_low, ltp, prev_close, change_percent, volume
                    FROM market_depth
                    WHERE near_days_low = true
                    ORDER BY updated_at DESC
                    LIMIT 200
                    """
                )
            ).mappings().all()
        
        # Convert to parameter format
        raw_data = []
        for r in rows:
            raw_data.append({
                "Symbol": r["symbol"],
                "price": float(r.get("ltp", 0)) if r.get("ltp") else 100.0,
                "prev_close": float(r.get("prev_close", 0)) if r.get("prev_close") else 102.0,
                "change": float(r.get("change_percent", 0)) if r.get("change_percent") else -2.0,
                "volume": int(r.get("volume", 0)) if r.get("volume") else 100000,
                "rank": 1,  # Near low rank
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
        
        # Normalize using market_depth module mapping
        normalized_data = ParamNormalizer.normalize(raw_data, module_name="market_depth")
        
        return {
            "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
            "name": "Near Days Low",
            "timestamp": datetime.now().isoformat()
        }
    except SQLAlchemyError:
        return {
            "data": [],
            "name": "Near Days Low",
            "timestamp": datetime.now().isoformat()
        }


@cache.cached(ttl_seconds=5)
@observe("MD.get_gainers")
def get_gainers() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {
            "data": [],
            "name": "Top Gainers",
            "timestamp": datetime.now().isoformat()
        }
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol, gainer_rank, ltp, prev_close, change_percent, volume
                    FROM market_depth
                    WHERE gainer_rank IS NOT NULL
                    ORDER BY gainer_rank ASC
                    LIMIT 200
                    """
                )
            ).mappings().all()
        
        # Convert to parameter format
        raw_data = []
        for r in rows:
            change_pct = float(r.get("change_percent", 0)) if r.get("change_percent") else 5.0
            price = float(r.get("ltp", 0)) if r.get("ltp") else 100.0
            prev_close = float(r.get("prev_close", 0)) if r.get("prev_close") else price / 1.05
            
            raw_data.append({
                "Symbol": r["symbol"],
                "price": price,
                "prev_close": prev_close,
                "change": change_pct,
                "volume": int(r.get("volume", 0)) if r.get("volume") else 100000,
                "rank": int(r["gainer_rank"]),
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
        
        # Normalize using market_depth module mapping
        normalized_data = ParamNormalizer.normalize(raw_data, module_name="market_depth")
        
        return {
            "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
            "name": "Top Gainers",
            "timestamp": datetime.now().isoformat()
        }
    except SQLAlchemyError:
        return {
            "data": [],
            "name": "Top Gainers",
            "timestamp": datetime.now().isoformat()
        }


@cache.cached(ttl_seconds=5)
@observe("MD.get_losers")
def get_losers() -> Dict[str, List[Dict]]:
    engine = get_engine()
    if not engine:
        return {
            "data": [],
            "name": "Top Losers",
            "timestamp": datetime.now().isoformat()
        }
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol, loser_rank, ltp, prev_close, change_percent, volume
                    FROM market_depth
                    WHERE loser_rank IS NOT NULL
                    ORDER BY loser_rank ASC
                    LIMIT 200
                    """
                )
            ).mappings().all()
        
        # Convert to parameter format
        raw_data = []
        for r in rows:
            change_pct = float(r.get("change_percent", 0)) if r.get("change_percent") else -5.0
            price = float(r.get("ltp", 0)) if r.get("ltp") else 100.0
            prev_close = float(r.get("prev_close", 0)) if r.get("prev_close") else price / 0.95
            
            raw_data.append({
                "Symbol": r["symbol"],
                "price": price,
                "prev_close": prev_close,
                "change": change_pct,
                "volume": int(r.get("volume", 0)) if r.get("volume") else 100000,
                "rank": int(r["loser_rank"]),
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
        
        # Normalize using market_depth module mapping
        normalized_data = ParamNormalizer.normalize(raw_data, module_name="market_depth")
        
        return {
            "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
            "name": "Top Losers",
            "timestamp": datetime.now().isoformat()
        }
    except SQLAlchemyError:
        return {
            "data": [],
            "name": "Top Losers",
            "timestamp": datetime.now().isoformat()
        }
