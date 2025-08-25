from typing import Optional, Dict, List
from sqlalchemy import text, desc
from sqlalchemy.exc import SQLAlchemyError
from backend.app.db.connection import get_engine
from backend.app.utils.cache import cache
from datetime import datetime, timedelta
import json


@cache.cached(ttl_seconds=5)
def get_index_expiry(name: str) -> Dict[str, Optional[str]]:
    engine = get_engine()
    if not engine:
        return {"index": name, "expiryDate": None}
    try:
        with engine.connect() as conn:
            row = conn.execute(
                text(
                    """
                    SELECT expiry_date FROM index_analysis
                    WHERE index_name = :name
                    ORDER BY updated_at DESC
                    LIMIT 1
                    """
                ),
                {"name": name},
            ).first()
        return {"index": name, "expiryDate": row[0].isoformat() if row and row[0] else None}
    except SQLAlchemyError:
        return {"index": name, "expiryDate": None}


@cache.cached(ttl_seconds=5)
def get_index_oi(name: str) -> Dict:
    engine = get_engine()
    if not engine:
        return {"index": name, "oi": None, "expiryDate": None}
    try:
        with engine.connect() as conn:
            row = conn.execute(
                text(
                    """
                    SELECT oi, expiry_date FROM index_analysis
                    WHERE index_name = :name
                    ORDER BY updated_at DESC
                    LIMIT 1
                    """
                ),
                {"name": name},
            ).first()
        oi = int(row[0]) if row and row[0] is not None else None
        expiry = row[1].isoformat() if row and row[1] else None
        return {"index": name, "oi": oi, "expiryDate": expiry}
    except SQLAlchemyError:
        return {"index": name, "oi": None, "expiryDate": None}


@cache.cached(ttl_seconds=5)
def get_index_pcr(name: str) -> Dict:
    engine = get_engine()
    if not engine:
        return {"index": name, "pcr": None}
    try:
        with engine.connect() as conn:
            row = conn.execute(
                text(
                    """
                    SELECT pcr FROM index_analysis
                    WHERE index_name = :name
                    ORDER BY updated_at DESC
                    LIMIT 1
                    """
                ),
                {"name": name},
            ).first()
        return {"index": name, "pcr": float(row[0]) if row and row[0] is not None else None}
    except SQLAlchemyError:
        return {"index": name, "pcr": None}


@cache.cached(ttl_seconds=5)
def get_index_contracts(name: str) -> Dict:
    engine = get_engine()
    if not engine:
        return {"index": name, "ceContracts": None, "peContracts": None}
    try:
        with engine.connect() as conn:
            row = conn.execute(
                text(
                    """
                    SELECT ce_contracts, pe_contracts FROM index_analysis
                    WHERE index_name = :name
                    ORDER BY updated_at DESC
                    LIMIT 1
                    """
                ),
                {"name": name},
            ).first()
        ce = int(row[0]) if row and row[0] is not None else None
        pe = int(row[1]) if row and row[1] is not None else None
        return {"index": name, "ceContracts": ce, "peContracts": pe}
    except SQLAlchemyError:
        return {"index": name, "ceContracts": None, "peContracts": None}


@cache.cached(ttl_seconds=5)
def get_index_option_chain(name: str) -> Dict:
    engine = get_engine()
    if not engine:
        return {"index": name, "optionChain": None}
    try:
        with engine.connect() as conn:
            row = conn.execute(
                text(
                    """
                    SELECT option_chain FROM index_analysis
                    WHERE index_name = :name
                    ORDER BY updated_at DESC
                    LIMIT 1
                    """
                ),
                {"name": name},
            ).first()
        return {"index": name, "optionChain": row[0] if row else None}
    except SQLAlchemyError:
        return {"index": name, "optionChain": None}


# Enhanced Index Analysis Functions

@cache.cached(ttl_seconds=60)
def get_index_ohlc(name: str, timeframe: str = "1d", limit: int = 100) -> Dict:
    """Get OHLC data for an index"""
    engine = get_engine()
    if not engine:
        return {"index": name, "timeframe": timeframe, "data": []}
    
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT timestamp, open_price, high_price, low_price, close_price, volume
                    FROM index_ohlc
                    WHERE index_name = :name AND timeframe = :timeframe
                    ORDER BY timestamp DESC
                    LIMIT :limit
                    """
                ),
                {"name": name, "timeframe": timeframe, "limit": limit},
            ).fetchall()
        
        data = []
        for row in rows:
            data.append({
                "timestamp": row[0].isoformat() if row[0] else None,
                "open": float(row[1]) if row[1] is not None else None,
                "high": float(row[2]) if row[2] is not None else None,
                "low": float(row[3]) if row[3] is not None else None,
                "close": float(row[4]) if row[4] is not None else None,
                "volume": int(row[5]) if row[5] is not None else None
            })
        
        return {"index": name, "timeframe": timeframe, "data": data}
    except SQLAlchemyError:
        return {"index": name, "timeframe": timeframe, "data": []}


@cache.cached(ttl_seconds=30)
def get_index_volume_analysis(name: str) -> Dict:
    """Get volume analysis for an index"""
    engine = get_engine()
    if not engine:
        return {
            "index": name,
            "currentVolume": None,
            "averageVolume": None,
            "volumeChange": None,
            "volumeRatio": None
        }
    
    try:
        with engine.connect() as conn:
            # Get current volume
            current_row = conn.execute(
                text(
                    """
                    SELECT volume, volume_change FROM index_analysis
                    WHERE index_name = :name
                    ORDER BY updated_at DESC
                    LIMIT 1
                    """
                ),
                {"name": name},
            ).first()
            
            # Get average volume from OHLC data (last 20 days)
            avg_row = conn.execute(
                text(
                    """
                    SELECT AVG(volume) as avg_volume
                    FROM index_ohlc
                    WHERE index_name = :name AND timeframe = '1d'
                    AND timestamp >= :start_date
                    """
                ),
                {"name": name, "start_date": datetime.now() - timedelta(days=20)},
            ).first()
        
        current_volume = int(current_row[0]) if current_row and current_row[0] else None
        average_volume = int(avg_row[0]) if avg_row and avg_row[0] else None
        volume_change = float(current_row[1]) if current_row and current_row[1] else None
        volume_ratio = (current_volume / average_volume) if current_volume and average_volume else None
        
        return {
            "index": name,
            "currentVolume": current_volume,
            "averageVolume": average_volume,
            "volumeChange": volume_change,
            "volumeRatio": volume_ratio
        }
    except SQLAlchemyError:
        return {
            "index": name,
            "currentVolume": None,
            "averageVolume": None,
            "volumeChange": None,
            "volumeRatio": None
        }


@cache.cached(ttl_seconds=60)
def get_index_heatmap(name: str) -> Dict:
    """Get heatmap of constituent stocks for an index"""
    engine = get_engine()
    if not engine:
        return {"index": name, "constituents": [], "lastUpdated": None}
    
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT symbol, price, price_change, price_change_percent, 
                           volume, volume_change_percent, market_cap, weightage,
                           high_52w, low_52w, updated_at
                    FROM index_constituents
                    WHERE index_name = :name
                    ORDER BY weightage DESC, price_change_percent DESC
                    """
                ),
                {"name": name},
            ).fetchall()
        
        constituents = []
        last_updated = None
        
        for row in rows:
            # Calculate heat score based on price change and volume
            price_change_pct = float(row[3]) if row[3] is not None else 0
            volume_change_pct = float(row[5]) if row[5] is not None else 0
            heat_score = (price_change_pct * 0.7) + (volume_change_pct * 0.3)
            
            constituents.append({
                "symbol": row[0],
                "price": float(row[1]) if row[1] is not None else None,
                "priceChange": float(row[2]) if row[2] is not None else None,
                "priceChangePercent": price_change_pct,
                "volume": int(row[4]) if row[4] is not None else None,
                "volumeChangePercent": volume_change_pct,
                "marketCap": int(row[6]) if row[6] is not None else None,
                "weightage": float(row[7]) if row[7] is not None else None,
                "high52w": float(row[8]) if row[8] is not None else None,
                "low52w": float(row[9]) if row[9] is not None else None,
                "heatScore": heat_score
            })
            
            if not last_updated and row[10]:
                last_updated = row[10].isoformat()
        
        return {
            "index": name,
            "constituents": constituents,
            "lastUpdated": last_updated
        }
    except SQLAlchemyError:
        return {"index": name, "constituents": [], "lastUpdated": None}


@cache.cached(ttl_seconds=60)
def get_comprehensive_analysis(name: str) -> Dict:
    """Get comprehensive analysis for an index"""
    # Combine all the analysis functions
    basic_metrics = get_index_oi(name)
    pcr = get_index_pcr(name)
    contracts = get_index_contracts(name)
    volume_analysis = get_index_volume_analysis(name)
    recent_ohlc = get_index_ohlc(name, "1d", 10)
    heatmap = get_index_heatmap(name)
    
    # Extract top gainers and losers from constituents
    constituents = heatmap.get("constituents", [])
    top_gainers = sorted(
        [c for c in constituents if c.get("priceChangePercent", 0) > 0],
        key=lambda x: x.get("priceChangePercent", 0),
        reverse=True
    )[:5]
    
    top_losers = sorted(
        [c for c in constituents if c.get("priceChangePercent", 0) < 0],
        key=lambda x: x.get("priceChangePercent", 0)
    )[:5]
    
    return {
        "index": name,
        "basicMetrics": basic_metrics,
        "pcr": pcr,
        "contracts": contracts,
        "volumeAnalysis": volume_analysis,
        "recentOHLC": recent_ohlc.get("data", []),
        "topGainers": top_gainers,
        "topLosers": top_losers,
        "lastUpdated": datetime.now().isoformat()
    }
