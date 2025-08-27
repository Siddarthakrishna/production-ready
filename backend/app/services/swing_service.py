"""
Swing service for handling swing-related operations.
"""
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from sqlalchemy import desc, func, and_
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.app.db.connection import db_session
from backend.app.db.models import SwingCentre
from backend.app.core.logger import get_logger

logger = get_logger(__name__)

def get_swings(limit: int = 200, offset: int = 0) -> Dict[str, Any]:
    """
    Get paginated swing data.
    
    Args:
        limit: Maximum number of records to return (1-500)
        offset: Number of records to skip for pagination
        
    Returns:
        Dictionary containing swing data and pagination info
        
    Raises:
        HTTPException: If there's an error processing the request
    """
    try:
        if not (1 <= limit <= 500):
            raise ValueError("Limit must be between 1 and 500")
            
        with db_session() as db:
            # Get total count
            total = db.query(func.count(SwingCentre.id)).scalar()
            
            # Get paginated results
            swings = (
                db.query(SwingCentre)
                .order_by(desc(SwingCentre.detected_date))
                .offset(offset)
                .limit(limit)
                .all()
            )
            
            swing_data = [{
                "id": swing.id,
                "symbol": swing.symbol,
                "swing_type": swing.swing_type,
                "swing_level": float(swing.swing_level) if swing.swing_level else None,
                "detected_date": swing.detected_date.isoformat() if swing.detected_date else None,
                "direction": swing.direction
            } for swing in swings]
            
            return {
                "data": swing_data,
                "pagination": {
                    "total": total,
                    "limit": limit,
                    "offset": offset,
                    "has_more": (offset + len(swing_data)) < total
                }
            }
            
    except ValueError as ve:
        logger.warning(f"Validation error: {str(ve)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Error fetching swings: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching swing data"
        )

def get_swings_by_symbol(
    symbol: str, 
    limit: int = 50, 
    offset: int = 0,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> Dict[str, Any]:
    """
    Get paginated swing data for a specific symbol with optional date filtering.
    
    Args:
        symbol: Stock symbol to filter by
        limit: Maximum number of records to return (1-500)
        offset: Number of records to skip for pagination
        start_date: Optional start date filter
        end_date: Optional end date filter
        
    Returns:
        Dictionary containing swing data and pagination info
        
    Raises:
        HTTPException: If there's an error processing the request
    """
    try:
        if not symbol:
            raise ValueError("Symbol is required")
            
        if not (1 <= limit <= 500):
            raise ValueError("Limit must be between 1 and 500")
            
        with db_session() as db:
            # Build base query
            query = db.query(SwingCentre).filter(
                SwingCentre.symbol == symbol.upper()
            )
            
            # Apply date filters if provided
            if start_date:
                query = query.filter(SwingCentre.detected_date >= start_date)
            if end_date:
                query = query.filter(SwingCentre.detected_date <= end_date)
            
            # Get total count
            total = query.count()
            
            # Get paginated results
            swings = (
                query.order_by(desc(SwingCentre.detected_date))
                .offset(offset)
                .limit(limit)
                .all()
            )
            
            swing_data = [{
                "id": swing.id,
                "symbol": swing.symbol,
                "swing_type": swing.swing_type,
                "swing_level": float(swing.swing_level) if swing.swing_level else None,
                "detected_date": swing.detected_date.isoformat() if swing.detected_date else None,
                "direction": swing.direction
            } for swing in swings]
            
            return {
                "symbol": symbol.upper(),
                "data": swing_data,
                "pagination": {
                    "total": total,
                    "limit": limit,
                    "offset": offset,
                    "has_more": (offset + len(swing_data)) < total
                }
            }
            
    except ValueError as ve:
        logger.warning(f"Validation error: {str(ve)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Error fetching swings for {symbol}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching swing data for {symbol}"
        )

def get_swing_summary() -> Dict[str, Any]:
    """
    Get summary statistics of swing data.
    
    Returns:
        Dictionary containing swing summary statistics
        
    Raises:
        HTTPException: If there's an error processing the request
    """
    try:
        with db_session() as db:
            # Get total count
            total_swings = db.query(func.count(SwingCentre.id)).scalar()
            
            # Get count by direction
            direction_counts = (
                db.query(
                    SwingCentre.direction,
                    func.count(SwingCentre.id).label('count')
                )
                .group_by(SwingCentre.direction)
                .all()
            )
            
            # Get latest swing date
            latest_date = (
                db.query(func.max(SwingCentre.detected_date))
                .scalar()
            )
            
            # Get top symbols by swing count
            top_symbols = (
                db.query(
                    SwingCentre.symbol,
                    func.count(SwingCentre.id).label('count')
                )
                .group_by(SwingCentre.symbol)
                .order_by(desc('count'))
                .limit(5)
                .all()
            )
            
            return {
                "total_swings": total_swings,
                "direction_counts": {
                    direction: count for direction, count in direction_counts
                },
                "latest_swing_date": latest_date.isoformat() if latest_date else None,
                "top_symbols": [
                    {"symbol": symbol, "count": count} 
                    for symbol, count in top_symbols
                ]
            }
            
    except Exception as e:
        logger.error(f"Error generating swing summary: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while generating swing summary"
        )