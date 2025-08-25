from typing import List, Dict, Optional
from datetime import datetime, timedelta
import json
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from backend.app.db.connection import get_engine

def get_intraday_ohlcv(
    symbol: str, 
    interval: str = '5m', 
    start_time: Optional[datetime] = None, 
    end_time: Optional[datetime] = None,
    limit: int = 1000
) -> List[Dict]:
    """
    Retrieve intraday OHLCV data for a given symbol and time interval.
    
    Args:
        symbol: The trading symbol (e.g., 'NIFTY', 'BANKNIFTY')
        interval: Time interval for candles (3m, 5m, 15m, etc.)
        start_time: Optional start time for the data range
        end_time: Optional end time for the data range
        limit: Maximum number of candles to return
        
    Returns:
        List of OHLCV data points
    """
    engine = get_engine()
    if not engine:
        return []
    
    # Validate interval
    valid_intervals = {'1m', '3m', '5m', '15m', '30m', '1h', '1d'}
    if interval not in valid_intervals:
        raise ValueError(f"Invalid interval. Must be one of: {', '.join(valid_intervals)}")
    
    # Set default time range if not provided
    if not end_time:
        end_time = datetime.utcnow()
    if not start_time:
        if interval.endswith('m'):
            minutes = int(interval[:-1])
            start_time = end_time - timedelta(hours=24)  # Default to 24 hours for minute intervals
        else:
            start_time = end_time - timedelta(days=30)  # Default to 30 days for daily intervals
    
    try:
        with engine.connect() as conn:
            query = """
                SELECT 
                    timestamp,
                    open,
                    high,
                    low,
                    close,
                    volume
                FROM intraday_ohlcv
                WHERE symbol = :symbol
                AND interval = :interval
                AND timestamp BETWEEN :start_time AND :end_time
                ORDER BY timestamp DESC
                LIMIT :limit
            """
            
            result = conn.execute(
                text(query),
                {
                    'symbol': symbol.upper(),
                    'interval': interval,
                    'start_time': start_time,
                    'end_time': end_time,
                    'limit': limit
                }
            )
            
            # Convert to list of dicts
            data = [
                {
                    'time': row[0].isoformat(),
                    'open': float(row[1]),
                    'high': float(row[2]),
                    'low': float(row[3]),
                    'close': float(row[4]),
                    'volume': int(row[5])
                }
                for row in result
            ]
            
            return data
            
    except SQLAlchemyError as e:
        print(f"Error fetching intraday data: {str(e)}")
        return []

def get_available_intervals(symbol: str) -> List[str]:
    """Get available time intervals for a given symbol"""
    engine = get_engine()
    if not engine:
        return []
        
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    SELECT DISTINCT interval 
                    FROM intraday_ohlcv 
                    WHERE symbol = :symbol
                    ORDER BY interval
                """),
                {'symbol': symbol.upper()}
            )
            return [row[0] for row in result]
    except SQLAlchemyError:
        return []

def get_available_symbols() -> List[str]:
    """Get list of available symbols with intraday data"""
    engine = get_engine()
    if not engine:
        return []
        
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    SELECT DISTINCT symbol 
                    FROM intraday_ohlcv 
                    ORDER BY symbol
                """)
            )
            return [row[0] for row in result]
    except SQLAlchemyError:
        return []
