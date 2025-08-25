from fastapi import APIRouter, HTTPException, Depends, Header, Query
from typing import List, Optional
from pydantic import BaseModel
import uuid

from ..services.watchlist_service import WatchlistService

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


# Pydantic models for request/response
class WatchlistCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    is_default: bool = False


class WatchlistUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_default: Optional[bool] = None


class WatchlistItemCreateRequest(BaseModel):
    symbol: str
    target_price: Optional[float] = None
    alert_price: Optional[float] = None
    notes: Optional[str] = None


class WatchlistItemUpdateRequest(BaseModel):
    target_price: Optional[float] = None
    notes: Optional[str] = None
    is_alert_enabled: Optional[bool] = None


# Dependency to get user ID from header
def get_user_id(user_id: Optional[str] = Header(None, alias="user-id")):
    if not user_id:
        # For demo purposes, use default user ID
        return "550e8400-e29b-41d4-a716-446655440000"
    return user_id


@router.get("/watchlists")
async def get_watchlists(user_id: str = Depends(get_user_id)):
    """Get all watchlists for the current user"""
    try:
        watchlists = WatchlistService.get_user_watchlists(user_id)
        return {
            "success": True,
            "data": watchlists
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/watchlists/{watchlist_id}")
async def get_watchlist_details(watchlist_id: str, user_id: str = Depends(get_user_id)):
    """Get detailed watchlist with all items"""
    try:
        watchlist = WatchlistService.get_watchlist_details(watchlist_id, user_id)
        return {
            "success": True,
            "data": watchlist
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/watchlists")
async def create_watchlist(request: WatchlistCreateRequest, user_id: str = Depends(get_user_id)):
    """Create a new watchlist"""
    try:
        watchlist = WatchlistService.create_watchlist(
            user_id=user_id,
            name=request.name,
            description=request.description,
            is_default=request.is_default
        )
        return {
            "success": True,
            "data": watchlist
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/watchlists/{watchlist_id}")
async def update_watchlist(watchlist_id: str, request: WatchlistUpdateRequest, user_id: str = Depends(get_user_id)):
    """Update watchlist details"""
    try:
        watchlist = WatchlistService.update_watchlist(
            watchlist_id=watchlist_id,
            user_id=user_id,
            name=request.name,
            description=request.description,
            is_default=request.is_default
        )
        return {
            "success": True,
            "data": watchlist
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/watchlists/{watchlist_id}")
async def delete_watchlist(watchlist_id: str, user_id: str = Depends(get_user_id)):
    """Delete a watchlist"""
    try:
        success = WatchlistService.delete_watchlist(watchlist_id, user_id)
        return {
            "success": success,
            "message": "Watchlist deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/watchlists/{watchlist_id}/stocks")
async def add_stock_to_watchlist(watchlist_id: str, request: WatchlistItemCreateRequest, user_id: str = Depends(get_user_id)):
    """Add a stock to watchlist"""
    try:
        stock = WatchlistService.add_stock_to_watchlist(
            watchlist_id=watchlist_id,
            user_id=user_id,
            ticker=request.symbol,
            target_price=request.target_price,
            note=request.notes,
            alert_enabled=True
        )
        return {
            "success": True,
            "data": stock
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/stocks/{stock_id}")
async def update_watchlist_item(stock_id: str, request: WatchlistItemUpdateRequest, user_id: str = Depends(get_user_id)):
    """Update a watchlist item"""
    try:
        stock = WatchlistService.update_watchlist_item(
            item_id=stock_id,
            user_id=user_id,
            target_price=request.target_price,
            note=request.notes,
            alert_enabled=request.is_alert_enabled
        )
        return {
            "success": True,
            "data": stock
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/stocks/{stock_id}")
async def remove_stock_from_watchlist(stock_id: str, user_id: str = Depends(get_user_id)):
    """Remove a stock from watchlist"""
    try:
        success = WatchlistService.remove_stock_from_watchlist(stock_id, user_id)
        return {
            "success": success,
            "message": "Stock removed from watchlist successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stocks/search")
async def search_stocks(query: str = Query(..., min_length=2), limit: int = Query(20, le=50)):
    """Search for stocks"""
    try:
        stocks = WatchlistService.search_stocks(query, limit)
        return {
            "success": True,
            "data": stocks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/internal/update-prices")
async def update_stock_prices(ticker_prices: dict):
    """Internal endpoint to update stock prices (for background jobs)"""
    try:
        updated_count = WatchlistService.update_stock_prices(ticker_prices)
        
        # Check for triggered alerts
        triggered_alerts = []
        for ticker, price in ticker_prices.items():
            alerts = WatchlistService.check_price_alerts(ticker, price)
            triggered_alerts.extend(alerts)
        
        return {
            "success": True,
            "updated_count": updated_count,
            "triggered_alerts": triggered_alerts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/alerts/check/{ticker}")
async def check_alerts_for_ticker(ticker: str, price: float = Query(...)):
    """Check alerts for a specific ticker and price"""
    try:
        alerts = WatchlistService.check_price_alerts(ticker, price)
        return {
            "success": True,
            "data": alerts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))