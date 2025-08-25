"""
Swing service for handling swing-related operations.
Provides functionality for swing center data retrieval and analysis.
"""
from typing import Dict, List, Any, Optional
from backend.app.db.connection import db_session
from backend.app.db.models import SwingCentre
from sqlalchemy import desc, func


def get_swings(limit: int = 200) -> Dict[str, Any]:
    """
    Get swing data with limit.
    
    Args:
        limit: Maximum number of records to return
        
    Returns:
        Dictionary containing swing data
    """
    try:
        with db_session() as db:
            swings = (
                db.query(SwingCentre)
                .order_by(desc(SwingCentre.detected_date))
                .limit(limit)
                .all()
            )
            
            swing_data = []
            for swing in swings:
                swing_data.append({
                    "id": swing.id,
                    "symbol": swing.symbol,
                    "swing_type": swing.swing_type,
                    "swing_level": float(swing.swing_level) if swing.swing_level else None,
                    "detected_date": swing.detected_date.isoformat() if swing.detected_date else None,
                    "direction": swing.direction
                })
                
            return {
                "count": len(swing_data),
                "limit": limit,
                "swings": swing_data
            }
    except Exception as e:
        return {
            "error": str(e),
            "count": 0,
            "limit": limit,
            "swings": []
        }


def get_swings_by_symbol(symbol: str, limit: int = 50) -> Dict[str, Any]:
    """
    Get swing data for a specific symbol.
    
    Args:
        symbol: Stock symbol to filter by
        limit: Maximum number of records to return
        
    Returns:
        Dictionary containing swing data for the symbol
    """
    try:
        with db_session() as db:
            swings = (
                db.query(SwingCentre)
                .filter(SwingCentre.symbol == symbol.upper())
                .order_by(desc(SwingCentre.detected_date))
                .limit(limit)
                .all()
            )
            
            swing_data = []
            for swing in swings:
                swing_data.append({
                    "id": swing.id,
                    "symbol": swing.symbol,
                    "swing_type": swing.swing_type,
                    "swing_level": float(swing.swing_level) if swing.swing_level else None,
                    "detected_date": swing.detected_date.isoformat() if swing.detected_date else None,
                    "direction": swing.direction
                })
                
            return {
                "symbol": symbol.upper(),
                "count": len(swing_data),
                "limit": limit,
                "swings": swing_data
            }
    except Exception as e:
        return {
            "error": str(e),
            "symbol": symbol.upper(),
            "count": 0,
            "limit": limit,
            "swings": []
        }


def get_swing_summary() -> Dict[str, Any]:
    """
    Get summary statistics of swing data.
    
    Returns:
        Dictionary containing swing summary statistics
    """
    try:
        with db_session() as db:
            total_swings = db.query(func.count(SwingCentre.id)).scalar() or 0
            unique_symbols = db.query(func.count(func.distinct(SwingCentre.symbol))).scalar() or 0
            
            # Get swing type distribution
            swing_types = (
                db.query(SwingCentre.swing_type, func.count(SwingCentre.id))
                .group_by(SwingCentre.swing_type)
                .all()
            )
            
            type_distribution = {}
            for swing_type, count in swing_types:
                type_distribution[swing_type or "unknown"] = count
                
            return {
                "total_swings": total_swings,
                "unique_symbols": unique_symbols,
                "type_distribution": type_distribution
            }
    except Exception as e:
        return {
            "error": str(e),
            "total_swings": 0,
            "unique_symbols": 0,
            "type_distribution": {}
        }