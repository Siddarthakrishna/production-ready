from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
import uuid
from datetime import datetime

from ..db.models import Watchlist, WatchlistItem, User, Alert, PriceHistory
from ..db.connection import db_session


class WatchlistService:
    """Service layer for watchlist operations"""
    
    @staticmethod
    def get_user_watchlists(user_id: str) -> List[Dict[str, Any]]:
        """Get all watchlists for a user"""
        with db_session() as db:
            watchlists = db.query(Watchlist).filter(
                Watchlist.user_id == user_id
            ).order_by(Watchlist.is_default.desc(), Watchlist.created_at).all()
            
            result = []
            for watchlist in watchlists:
                # Get items count for each watchlist
                items_count = db.query(WatchlistItem).filter(
                    WatchlistItem.watchlist_id == watchlist.id
                ).count()
                
                # Get sample items for preview
                items = db.query(WatchlistItem).filter(
                    WatchlistItem.watchlist_id == watchlist.id
                ).limit(10).all()
                
                result.append({
                    "id": str(watchlist.id),
                    "user_id": str(watchlist.user_id),
                    "name": watchlist.name,
                    "description": watchlist.description,
                    "is_default": watchlist.is_default,
                    "created_at": watchlist.created_at.isoformat() if watchlist.created_at else None,
                    "updated_at": watchlist.updated_at.isoformat() if watchlist.updated_at else None,
                    "items_count": items_count,
                    "stocks": [WatchlistService._format_watchlist_item(item) for item in items]
                })
            
            return result
    
    @staticmethod
    def get_watchlist_details(watchlist_id: str, user_id: str) -> Dict[str, Any]:
        """Get detailed watchlist with all items"""
        with db_session() as db:
            watchlist = db.query(Watchlist).filter(
                Watchlist.id == watchlist_id,
                Watchlist.user_id == user_id
            ).first()
            
            if not watchlist:
                raise HTTPException(status_code=404, detail="Watchlist not found")
            
            items = db.query(WatchlistItem).filter(
                WatchlistItem.watchlist_id == watchlist_id
            ).order_by(WatchlistItem.created_at.desc()).all()
            
            return {
                "id": str(watchlist.id),
                "user_id": str(watchlist.user_id),
                "name": watchlist.name,
                "description": watchlist.description,
                "is_default": watchlist.is_default,
                "created_at": watchlist.created_at.isoformat() if watchlist.created_at else None,
                "updated_at": watchlist.updated_at.isoformat() if watchlist.updated_at else None,
                "stocks": [WatchlistService._format_watchlist_item(item) for item in items]
            }
    
    @staticmethod
    def create_watchlist(user_id: str, name: str, description: str = None, is_default: bool = False) -> Dict[str, Any]:
        """Create a new watchlist"""
        with db_session() as db:
            # If setting as default, unset other defaults first
            if is_default:
                db.query(Watchlist).filter(
                    Watchlist.user_id == user_id,
                    Watchlist.is_default == True
                ).update({"is_default": False})
            
            watchlist = Watchlist(
                id=uuid.uuid4(),
                user_id=user_id,
                name=name,
                description=description,
                is_default=is_default,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            try:
                db.add(watchlist)
                db.commit()
                db.refresh(watchlist)
                
                return {
                    "id": str(watchlist.id),
                    "user_id": str(watchlist.user_id),
                    "name": watchlist.name,
                    "description": watchlist.description,
                    "is_default": watchlist.is_default,
                    "created_at": watchlist.created_at.isoformat(),
                    "updated_at": watchlist.updated_at.isoformat(),
                    "stocks": []
                }
            except IntegrityError:
                db.rollback()
                raise HTTPException(status_code=400, detail="Watchlist name already exists")
    
    @staticmethod
    def update_watchlist(watchlist_id: str, user_id: str, name: str = None, description: str = None, is_default: bool = None) -> Dict[str, Any]:
        """Update watchlist details"""
        with db_session() as db:
            watchlist = db.query(Watchlist).filter(
                Watchlist.id == watchlist_id,
                Watchlist.user_id == user_id
            ).first()
            
            if not watchlist:
                raise HTTPException(status_code=404, detail="Watchlist not found")
            
            # If setting as default, unset other defaults first
            if is_default:
                db.query(Watchlist).filter(
                    Watchlist.user_id == user_id,
                    Watchlist.is_default == True,
                    Watchlist.id != watchlist_id
                ).update({"is_default": False})
            
            if name is not None:
                watchlist.name = name
            if description is not None:
                watchlist.description = description
            if is_default is not None:
                watchlist.is_default = is_default
            
            watchlist.updated_at = datetime.utcnow()
            
            try:
                db.commit()
                db.refresh(watchlist)
                
                return {
                    "id": str(watchlist.id),
                    "user_id": str(watchlist.user_id),
                    "name": watchlist.name,
                    "description": watchlist.description,
                    "is_default": watchlist.is_default,
                    "created_at": watchlist.created_at.isoformat(),
                    "updated_at": watchlist.updated_at.isoformat()
                }
            except IntegrityError:
                db.rollback()
                raise HTTPException(status_code=400, detail="Watchlist name already exists")
    
    @staticmethod
    def delete_watchlist(watchlist_id: str, user_id: str) -> bool:
        """Delete a watchlist and all its items"""
        with db_session() as db:
            watchlist = db.query(Watchlist).filter(
                Watchlist.id == watchlist_id,
                Watchlist.user_id == user_id
            ).first()
            
            if not watchlist:
                raise HTTPException(status_code=404, detail="Watchlist not found")
            
            # Delete will cascade to watchlist_items and alerts due to foreign key constraints
            db.delete(watchlist)
            db.commit()
            
            return True
    
    @staticmethod
    def add_stock_to_watchlist(watchlist_id: str, user_id: str, ticker: str, exchange: str = None, 
                              display_name: str = None, note: str = None, target_price: float = None,
                              alert_enabled: bool = True) -> Dict[str, Any]:
        """Add a stock to watchlist"""
        with db_session() as db:
            # Verify watchlist belongs to user
            watchlist = db.query(Watchlist).filter(
                Watchlist.id == watchlist_id,
                Watchlist.user_id == user_id
            ).first()
            
            if not watchlist:
                raise HTTPException(status_code=404, detail="Watchlist not found")
            
            # Check if stock already exists in this watchlist
            existing_item = db.query(WatchlistItem).filter(
                WatchlistItem.watchlist_id == watchlist_id,
                WatchlistItem.ticker == ticker.upper()
            ).first()
            
            if existing_item:
                raise HTTPException(status_code=400, detail="Stock already exists in this watchlist")
            
            # Get latest price if available
            latest_price = db.query(PriceHistory).filter(
                PriceHistory.ticker == ticker.upper()
            ).order_by(PriceHistory.fetched_at.desc()).first()
            
            item = WatchlistItem(
                id=uuid.uuid4(),
                watchlist_id=watchlist_id,
                ticker=ticker.upper(),
                exchange=exchange or "NSE",
                display_name=display_name,
                note=note,
                last_price=latest_price.price if latest_price else None,
                last_price_at=latest_price.fetched_at if latest_price else None,
                target_price=target_price,
                alert_enabled=alert_enabled,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            db.add(item)
            db.commit()
            db.refresh(item)
            
            return WatchlistService._format_watchlist_item(item)
    
    @staticmethod
    def update_watchlist_item(item_id: str, user_id: str, target_price: float = None,
                             note: str = None, alert_enabled: bool = None) -> Dict[str, Any]:
        """Update watchlist item"""
        with db_session() as db:
            # Verify item belongs to user through watchlist
            item = db.query(WatchlistItem).join(Watchlist).filter(
                WatchlistItem.id == item_id,
                Watchlist.user_id == user_id
            ).first()
            
            if not item:
                raise HTTPException(status_code=404, detail="Watchlist item not found")
            
            if target_price is not None:
                item.target_price = target_price
            if note is not None:
                item.note = note
            if alert_enabled is not None:
                item.alert_enabled = alert_enabled
            
            item.updated_at = datetime.utcnow()
            
            db.commit()
            db.refresh(item)
            
            return WatchlistService._format_watchlist_item(item)
    
    @staticmethod
    def remove_stock_from_watchlist(item_id: str, user_id: str) -> bool:
        """Remove stock from watchlist"""
        with db_session() as db:
            # Verify item belongs to user through watchlist
            item = db.query(WatchlistItem).join(Watchlist).filter(
                WatchlistItem.id == item_id,
                Watchlist.user_id == user_id
            ).first()
            
            if not item:
                raise HTTPException(status_code=404, detail="Watchlist item not found")
            
            db.delete(item)
            db.commit()
            
            return True
    
    @staticmethod
    def search_stocks(query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Search for stocks (placeholder - integrate with actual stock data source)"""
        # TODO: Integrate with actual stock database or API
        # For now, return mock data based on query
        mock_stocks = [
            {"symbol": "RELIANCE", "company_name": "Reliance Industries Limited", "exchange": "NSE", "sector": "Energy"},
            {"symbol": "TCS", "company_name": "Tata Consultancy Services Limited", "exchange": "NSE", "sector": "IT"},
            {"symbol": "HDFCBANK", "company_name": "HDFC Bank Limited", "exchange": "NSE", "sector": "Banking"},
            {"symbol": "INFY", "company_name": "Infosys Limited", "exchange": "NSE", "sector": "IT"},
            {"symbol": "ICICIBANK", "company_name": "ICICI Bank Limited", "exchange": "NSE", "sector": "Banking"},
            {"symbol": "HINDUNILVR", "company_name": "Hindustan Unilever Limited", "exchange": "NSE", "sector": "FMCG"},
            {"symbol": "ITC", "company_name": "ITC Limited", "exchange": "NSE", "sector": "FMCG"},
            {"symbol": "SBIN", "company_name": "State Bank of India", "exchange": "NSE", "sector": "Banking"},
            {"symbol": "BHARTIARTL", "company_name": "Bharti Airtel Limited", "exchange": "NSE", "sector": "Telecom"},
            {"symbol": "KOTAKBANK", "company_name": "Kotak Mahindra Bank Limited", "exchange": "NSE", "sector": "Banking"}
        ]
        
        query_upper = query.upper()
        filtered_stocks = [
            stock for stock in mock_stocks 
            if query_upper in stock["symbol"] or query_upper in stock["company_name"].upper()
        ]
        
        return filtered_stocks[:limit]
    
    @staticmethod
    def update_stock_prices(ticker_prices: Dict[str, float]) -> int:
        """Update stock prices in watchlist items and price history"""
        with db_session() as db:
            updated_count = 0
            current_time = datetime.utcnow()
            
            for ticker, price in ticker_prices.items():
                # Add to price history
                price_history = PriceHistory(
                    ticker=ticker.upper(),
                    price=price,
                    fetched_at=current_time
                )
                db.add(price_history)
                
                # Update watchlist items
                items = db.query(WatchlistItem).filter(
                    WatchlistItem.ticker == ticker.upper()
                ).all()
                
                for item in items:
                    old_price = item.last_price
                    item.last_price = price
                    item.last_price_at = current_time
                    
                    # Calculate percentage change
                    if old_price and old_price > 0:
                        item.percent_change = ((price - old_price) / old_price) * 100
                    
                    updated_count += 1
            
            db.commit()
            return updated_count
    
    @staticmethod
    def check_price_alerts(ticker: str, price: float) -> List[Dict[str, Any]]:
        """Check and trigger price alerts"""
        with db_session() as db:
            # Get all active alerts for this ticker
            alerts = db.query(Alert).join(WatchlistItem).filter(
                WatchlistItem.ticker == ticker.upper(),
                Alert.is_active == True,
                WatchlistItem.alert_enabled == True
            ).all()
            
            triggered_alerts = []
            
            for alert in alerts:
                should_trigger = False
                
                if alert.alert_type == "price_above" and alert.comparison == "gte" and price >= alert.threshold:
                    should_trigger = True
                elif alert.alert_type == "price_below" and alert.comparison == "lte" and price <= alert.threshold:
                    should_trigger = True
                
                if should_trigger:
                    alert.last_triggered_at = datetime.utcnow()
                    alert.is_active = False  # Deactivate after triggering
                    
                    triggered_alerts.append({
                        "alert_id": str(alert.id),
                        "ticker": ticker,
                        "alert_type": alert.alert_type,
                        "threshold": float(alert.threshold),
                        "current_price": price,
                        "triggered_at": alert.last_triggered_at.isoformat()
                    })
            
            if triggered_alerts:
                db.commit()
            
            return triggered_alerts
    
    @staticmethod
    def _format_watchlist_item(item: WatchlistItem) -> Dict[str, Any]:
        """Format watchlist item for API response"""
        return {
            "id": str(item.id),
            "symbol": item.ticker,
            "company_name": item.display_name or item.ticker,
            "exchange": item.exchange,
            "current_price": float(item.last_price) if item.last_price else None,
            "price_change": 0.0,  # Calculate based on previous price
            "price_change_percent": float(item.percent_change) if item.percent_change else 0.0,
            "volume": 0,  # Placeholder - integrate with market data
            "fifty_two_week_high": 0.0,  # Placeholder
            "fifty_two_week_low": 0.0,  # Placeholder
            "target_price": float(item.target_price) if item.target_price else None,
            "alert_price": float(item.target_price) if item.target_price else None,  # Using target as alert for now
            "is_alert_enabled": item.alert_enabled,
            "notes": item.note,
            "last_updated": item.last_price_at.isoformat() if item.last_price_at else None,
            "created_at": item.created_at.isoformat() if item.created_at else None
        }