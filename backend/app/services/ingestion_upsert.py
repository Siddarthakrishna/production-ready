from typing import Any, Dict, Optional
from datetime import date
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.db.connection import get_engine


def _exec(conn, sql: str, params: Dict[str, Any]) -> None:
    conn.execute(text(sql), params)


def upsert_fno(symbol: str, expiry_date: Optional[date], payload: Dict[str, Any]) -> bool:
    """Idempotent upsert into fno_data keyed by (symbol, expiry_date)."""
    engine = get_engine()
    if not engine:
        return False
    sql = """
        INSERT INTO fno_data (symbol, expiry_date, oi, oi_change, option_chain, relative_strength, volume, signal, heatmap_score, updated_at)
        VALUES (:symbol, :expiry_date, :oi, :oi_change, CAST(:option_chain AS JSON), :relative_strength, :volume, :signal, :heatmap_score, NOW())
        ON CONFLICT (symbol, expiry_date)
        DO UPDATE SET
            oi = EXCLUDED.oi,
            oi_change = EXCLUDED.oi_change,
            option_chain = EXCLUDED.option_chain,
            relative_strength = EXCLUDED.relative_strength,
            volume = EXCLUDED.volume,
            signal = EXCLUDED.signal,
            heatmap_score = EXCLUDED.heatmap_score,
            updated_at = NOW();
    """
    params = {
        "symbol": symbol,
        "expiry_date": expiry_date,
        "oi": payload.get("oi"),
        "oi_change": payload.get("oi_change"),
        "option_chain": payload.get("option_chain"),
        "relative_strength": payload.get("relative_strength"),
        "volume": payload.get("volume"),
        "signal": payload.get("signal"),
        "heatmap_score": payload.get("heatmap_score"),
    }
    try:
        with engine.begin() as conn:
            _exec(conn, sql, params)
        return True
    except SQLAlchemyError:
        return False


def upsert_sector_overview(sector_name: str, heat_score: Optional[float]) -> bool:
    """Upsert sector overview keyed by sector_name."""
    engine = get_engine()
    if not engine:
        return False
    sql = """
        INSERT INTO sector_overview (sector_name, sector_heat_score, updated_at)
        VALUES (:name, :score, NOW())
        ON CONFLICT (sector_name)
        DO UPDATE SET
            sector_heat_score = EXCLUDED.sector_heat_score,
            updated_at = NOW();
    """
    try:
        with engine.begin() as conn:
            _exec(conn, sql, {"name": sector_name, "score": heat_score})
        return True
    except SQLAlchemyError:
        return False


def upsert_sector_stock(sector_name: str, stock: Dict[str, Any]) -> bool:
    """Ensure sector exists, then upsert sector stock keyed by (sector_id, symbol)."""
    engine = get_engine()
    if not engine:
        return False
    try:
        with engine.begin() as conn:
            # Ensure sector exists and fetch id
            conn.execute(
                text(
                    """
                    INSERT INTO sector_overview (sector_name, updated_at)
                    VALUES (:name, NOW())
                    ON CONFLICT (sector_name) DO UPDATE SET updated_at = NOW();
                    """
                ),
                {"name": sector_name},
            )
            sector_row = conn.execute(
                text("SELECT id FROM sector_overview WHERE sector_name = :name"), {"name": sector_name}
            ).first()
            if not sector_row:
                return False
            sector_id = sector_row[0]
            # Upsert stock
            sql = """
                INSERT INTO sector_stocks (sector_id, symbol, price, percent_change, relative_factor, updated_at)
                VALUES (:sid, :symbol, :price, :pct, :rf, NOW())
                ON CONFLICT (sector_id, symbol)
                DO UPDATE SET
                    price = EXCLUDED.price,
                    percent_change = EXCLUDED.percent_change,
                    relative_factor = EXCLUDED.relative_factor,
                    updated_at = NOW();
            """
            params = {
                "sid": sector_id,
                "symbol": stock.get("symbol"),
                "price": stock.get("price"),
                "pct": stock.get("percent_change"),
                "rf": stock.get("relative_factor"),
            }
            _exec(conn, sql, params)
        return True
    except SQLAlchemyError:
        return False


def upsert_market_depth(symbol: str, flags: Dict[str, Any]) -> bool:
    """Upsert latest market depth snapshot keyed by symbol."""
    engine = get_engine()
    if not engine:
        return False
    sql = """
        INSERT INTO market_depth (
            symbol, highpower_flag, intradayboost_flag, near_days_high, near_days_low, gainer_rank, loser_rank, updated_at
        ) VALUES (
            :symbol, :highpower, :intraday, :ndh, :ndl, :gainer_rank, :loser_rank, NOW()
        )
        ON CONFLICT (symbol)
        DO UPDATE SET
            highpower_flag = EXCLUDED.highpower_flag,
            intradayboost_flag = EXCLUDED.intradayboost_flag,
            near_days_high = EXCLUDED.near_days_high,
            near_days_low = EXCLUDED.near_days_low,
            gainer_rank = EXCLUDED.gainer_rank,
            loser_rank = EXCLUDED.loser_rank,
            updated_at = NOW();
    """
    params = {
        "symbol": symbol,
        "highpower": flags.get("highpower_flag"),
        "intraday": flags.get("intradayboost_flag"),
        "ndh": flags.get("near_days_high"),
        "ndl": flags.get("near_days_low"),
        "gainer_rank": flags.get("gainer_rank"),
        "loser_rank": flags.get("loser_rank"),
    }
    try:
        with engine.begin() as conn:
            _exec(conn, sql, params)
        return True
    except SQLAlchemyError:
        return False


def upsert_pro_setup(symbol: str, setup: Dict[str, Any]) -> bool:
    """Upsert latest pro setup snapshot. Uses symbol as key (latest wins)."""
    engine = get_engine()
    if not engine:
        return False
    sql = """
        INSERT INTO pro_setup (
            symbol, five_min_spike, ten_min_spike, bullish_div_15m, bearish_div_1h,
            multi_resistance, multi_support, bo_multi_resistance, bo_multi_support,
            daily_contradiction, updated_at
        ) VALUES (
            :symbol, :s5, :s10, :b15, :b1h, :mr, :ms, :bomr, :boms, :dc, NOW()
        )
        ON CONFLICT (symbol)
        DO UPDATE SET
            five_min_spike = EXCLUDED.five_min_spike,
            ten_min_spike = EXCLUDED.ten_min_spike,
            bullish_div_15m = EXCLUDED.bullish_div_15m,
            bearish_div_1h = EXCLUDED.bearish_div_1h,
            multi_resistance = EXCLUDED.multi_resistance,
            multi_support = EXCLUDED.multi_support,
            bo_multi_resistance = EXCLUDED.bo_multi_resistance,
            bo_multi_support = EXCLUDED.bo_multi_support,
            daily_contradiction = EXCLUDED.daily_contradiction,
            updated_at = NOW();
    """
    params = {
        "symbol": symbol,
        "s5": setup.get("five_min_spike"),
        "s10": setup.get("ten_min_spike"),
        "b15": setup.get("bullish_div_15m"),
        "b1h": setup.get("bearish_div_1h"),
        "mr": setup.get("multi_resistance"),
        "ms": setup.get("multi_support"),
        "bomr": setup.get("bo_multi_resistance"),
        "boms": setup.get("bo_multi_support"),
        "dc": setup.get("daily_contradiction"),
    }
    try:
        with engine.begin() as conn:
            _exec(conn, sql, params)
        return True
    except SQLAlchemyError:
        return False


def upsert_swing(symbol: str, swing: Dict[str, Any]) -> bool:
    """Upsert swing centre keyed by (symbol, detected_date, swing_type)."""
    engine = get_engine()
    if not engine:
        return False
    sql = """
        INSERT INTO swing_centre (symbol, swing_type, swing_level, detected_date, direction)
        VALUES (:symbol, :stype, :level, :d_date, :dir)
        ON CONFLICT (symbol, detected_date, swing_type)
        DO UPDATE SET
            swing_level = EXCLUDED.swing_level,
            direction = EXCLUDED.direction;
    """
    params = {
        "symbol": symbol,
        "stype": swing.get("swing_type"),
        "level": swing.get("swing_level"),
        "d_date": swing.get("detected_date"),
        "dir": swing.get("direction"),
    }
    try:
        with engine.begin() as conn:
            _exec(conn, sql, params)
        return True
    except SQLAlchemyError:
        return False
