from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import httpx
import os
import hashlib
import secrets
import time
from datetime import datetime, timedelta
import logging
from urllib.parse import urlencode

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/fyers", tags=["fyers"])

# Configuration from environment variables
FYERS_CLIENT_ID = os.getenv("FYERS_CLIENT_ID", "")
FYERS_SECRET_KEY = os.getenv("FYERS_SECRET_KEY", "")
FYERS_REDIRECT_URI = os.getenv("FYERS_REDIRECT_URI", "http://localhost:8000/api/fyers/callback")
FYERS_BASE_URL = "https://api.fyers.in/api/v2"
FYERS_AUTH_URL = "https://api.fyers.in/api/v2/generate-authcode"

# Rate limiting configuration
RATE_LIMIT_REQUESTS = 60  # 60 requests per minute
RATE_LIMIT_WINDOW = 60    # 60 seconds window

# In-memory storage for demo (use Redis in production)
fyers_tokens = {}
rate_limit_store = {}
auth_states = {}


class FyersManager:
    """Centralized Fyers API management class"""
    
    def __init__(self):
        self.client_id = FYERS_CLIENT_ID
        self.secret_key = FYERS_SECRET_KEY
        self.base_url = FYERS_BASE_URL
        
    def is_configured(self) -> bool:
        """Check if Fyers API is properly configured"""
        return bool(self.client_id and self.secret_key)
    
    def get_user_token(self, user_id: str = "default") -> Optional[str]:
        """Get valid access token for user"""
        return get_fyers_access_token(user_id)
    
    def is_authenticated(self, user_id: str = "default") -> bool:
        """Check if user has valid authentication"""
        return self.get_user_token(user_id) is not None
    
    async def get_quotes(self, symbols: list, user_id: str = "default") -> dict:
        """Get real-time quotes for symbols"""
        access_token = self.get_user_token(user_id)
        if not access_token:
            raise HTTPException(status_code=401, detail="Not authenticated with Fyers")
        
        # Format symbols for Fyers API
        formatted_symbols = [sym if ":" in sym else f"NSE:{sym}-EQ" for sym in symbols]
        
        return await make_fyers_request(
            endpoint="data/quotes",
            method="POST",
            data={"symbols": formatted_symbols},
            access_token=access_token
        )
    
    def get_chart_url(self, symbol: str, exchange: str = "NSE") -> str:
        """Generate Fyers chart URL for symbol"""
        # Format symbol for Fyers
        if ":" not in symbol:
            fyers_symbol = f"{exchange}:{symbol}-EQ"
        else:
            fyers_symbol = symbol
            
        return f"https://web.fyers.in/chart/?symbol={fyers_symbol}&interval=1D"
    
    def check_rate_limit(self, client_ip: str = "default") -> bool:
        """Check if request is within rate limits"""
        return check_rate_limit(client_ip)


# Global FyersManager instance
fyers_manager = FyersManager()


class FyersTokenRequest(BaseModel):
    auth_code: str
    client_id: str


class FyersQuoteRequest(BaseModel):
    symbols: list  # ["NSE:SBIN-EQ", "NSE:RELIANCE-EQ"]


class FyersOrderRequest(BaseModel):
    symbol: str
    qty: int
    type: str  # "MARKET", "LIMIT"
    side: str  # "BUY", "SELL"
    price: Optional[float] = None
    product_type: str = "CNC"  # "CNC", "INTRADAY", "MARGIN"


# Rate limiter middleware
def check_rate_limit(client_ip: str = "default") -> bool:
    """Check if request is within rate limits"""
    current_time = time.time()
    
    if client_ip not in rate_limit_store:
        rate_limit_store[client_ip] = []
    
    # Clean old requests outside the window
    rate_limit_store[client_ip] = [
        req_time for req_time in rate_limit_store[client_ip]
        if current_time - req_time < RATE_LIMIT_WINDOW
    ]
    
    # Check if under limit
    if len(rate_limit_store[client_ip]) >= RATE_LIMIT_REQUESTS:
        return False
    
    # Add current request
    rate_limit_store[client_ip].append(current_time)
    return True


def get_fyers_access_token(user_id: str = "default") -> Optional[str]:
    """Get stored Fyers access token"""
    token_data = fyers_tokens.get(user_id)
    if not token_data:
        return None
    
    # Check if token is expired
    if datetime.now() > token_data.get("expires_at", datetime.min):
        return None
    
    return token_data.get("access_token")


async def make_fyers_request(endpoint: str, method: str = "GET", data: dict = None, access_token: str = None) -> dict:
    """Make authenticated request to Fyers API"""
    if not access_token:
        raise HTTPException(status_code=401, detail="Fyers access token required")
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    url = f"{FYERS_BASE_URL}/{endpoint}"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            if method == "GET":
                response = await client.get(url, headers=headers, params=data)
            else:
                response = await client.post(url, headers=headers, json=data)
            
            response.raise_for_status()
            return response.json()
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Fyers API request timed out")
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Fyers API unavailable")
    except httpx.HTTPStatusError as e:
        logger.error(f"Fyers API error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=e.response.status_code, detail=f"Fyers API error: {e.response.text}")


@router.get("/auth/login")
async def fyers_login():
    """Initiate Fyers OAuth login"""
    if not FYERS_CLIENT_ID or not FYERS_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Fyers API credentials not configured")
    
    # Generate state for CSRF protection
    state = secrets.token_urlsafe(32)
    auth_states[state] = {
        "created_at": datetime.now(),
        "used": False
    }
    
    # Clean old states (older than 10 minutes)
    current_time = datetime.now()
    auth_states = {
        k: v for k, v in auth_states.items()
        if current_time - v["created_at"] < timedelta(minutes=10)
    }
    
    # Build authorization URL
    auth_params = {
        "client_id": FYERS_CLIENT_ID,
        "redirect_uri": FYERS_REDIRECT_URI,
        "response_type": "code",
        "state": state
    }
    
    auth_url = f"{FYERS_AUTH_URL}?{urlencode(auth_params)}"
    
    return {
        "success": True,
        "auth_url": auth_url,
        "state": state,
        "message": "Redirect to auth_url to complete Fyers authentication"
    }


@router.get("/auth/callback")
async def fyers_callback(code: str, state: str):
    """Handle Fyers OAuth callback"""
    try:
        # Verify state
        if state not in auth_states or auth_states[state]["used"]:
            raise HTTPException(status_code=400, detail="Invalid or expired state parameter")
        
        # Mark state as used
        auth_states[state]["used"] = True
        
        # Exchange code for access token
        token_data = await exchange_code_for_token(code)
        
        # Store token (in production, use secure storage)
        user_id = "default"  # In production, get from session
        fyers_tokens[user_id] = {
            "access_token": token_data["access_token"],
            "expires_at": datetime.now() + timedelta(hours=8),  # Fyers tokens typically last 8 hours
            "token_type": token_data.get("token_type", "Bearer")
        }
        
        return {
            "success": True,
            "message": "Fyers authentication successful",
            "expires_in": "8 hours"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fyers callback error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


async def exchange_code_for_token(auth_code: str) -> dict:
    """Exchange authorization code for access token"""
    # Generate hash as per Fyers API documentation
    hash_string = f"{FYERS_CLIENT_ID}:{auth_code}:{FYERS_SECRET_KEY}"
    app_secret = hashlib.sha256(hash_string.encode()).hexdigest()
    
    token_data = {
        "grant_type": "authorization_code",
        "appIdHash": app_secret,
        "code": auth_code
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.fyers.in/api/v2/validate-authcode",
                json=token_data
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Token exchange error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to exchange auth code for token")


@router.post("/auth/refresh")
async def refresh_fyers_token():
    """Refresh Fyers access token"""
    # Fyers doesn't support refresh tokens, users need to re-authenticate
    return {
        "success": False,
        "message": "Fyers requires re-authentication. Please login again.",
        "action_required": "login"
    }


@router.get("/auth/status")
async def fyers_auth_status(user_id: str = "default"):
    """Check Fyers authentication status"""
    token_data = fyers_tokens.get(user_id)
    
    if not token_data:
        return {
            "authenticated": False,
            "message": "Not authenticated with Fyers"
        }
    
    is_valid = datetime.now() < token_data.get("expires_at", datetime.min)
    
    return {
        "authenticated": is_valid,
        "expires_at": token_data.get("expires_at").isoformat() if token_data.get("expires_at") else None,
        "message": "Authenticated" if is_valid else "Token expired"
    }


@router.get("/quotes")
async def get_quotes(symbols: str, user_id: str = "default"):
    """Get real-time quotes for symbols"""
    if not check_rate_limit(user_id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Max 60 requests per minute.")
    
    access_token = get_fyers_access_token(user_id)
    if not access_token:
        raise HTTPException(status_code=401, detail="Fyers authentication required")
    
    try:
        # Parse symbols (comma-separated)
        symbol_list = [s.strip() for s in symbols.split(",")]
        
        # Fyers API expects symbols in specific format: NSE:SBIN-EQ
        formatted_symbols = []
        for symbol in symbol_list:
            if ":" not in symbol:
                formatted_symbols.append(f"NSE:{symbol}-EQ")  # Default to NSE equity
            else:
                formatted_symbols.append(symbol)
        
        response = await make_fyers_request(
            "quotes",
            method="GET",
            data={"symbols": ",".join(formatted_symbols)},
            access_token=access_token
        )
        
        return {
            "success": True,
            "data": response
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Quotes fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch quotes: {str(e)}")


@router.get("/market-status")
async def get_market_status(user_id: str = "default"):
    """Get market status"""
    if not check_rate_limit(user_id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    access_token = get_fyers_access_token(user_id)
    if not access_token:
        raise HTTPException(status_code=401, detail="Fyers authentication required")
    
    try:
        response = await make_fyers_request(
            "market-status",
            access_token=access_token
        )
        
        return {
            "success": True,
            "data": response
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Market status error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch market status: {str(e)}")


@router.get("/profile")
async def get_profile(user_id: str = "default"):
    """Get user profile information"""
    if not check_rate_limit(user_id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    access_token = get_fyers_access_token(user_id)
    if not access_token:
        raise HTTPException(status_code=401, detail="Fyers authentication required")
    
    try:
        response = await make_fyers_request(
            "profile",
            access_token=access_token
        )
        
        return {
            "success": True,
            "data": response
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(e)}")


@router.get("/holdings")
async def get_holdings(user_id: str = "default"):
    """Get user holdings"""
    if not check_rate_limit(user_id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    access_token = get_fyers_access_token(user_id)
    if not access_token:
        raise HTTPException(status_code=401, detail="Fyers authentication required")
    
    try:
        response = await make_fyers_request(
            "holdings",
            access_token=access_token
        )
        
        return {
            "success": True,
            "data": response
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Holdings fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch holdings: {str(e)}")


@router.get("/positions")
async def get_positions(user_id: str = "default"):
    """Get user positions"""
    if not check_rate_limit(user_id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    access_token = get_fyers_access_token(user_id)
    if not access_token:
        raise HTTPException(status_code=401, detail="Fyers authentication required")
    
    try:
        response = await make_fyers_request(
            "positions",
            access_token=access_token
        )
        
        return {
            "success": True,
            "data": response
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Positions fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch positions: {str(e)}")


@router.get("/rate-limit-status")
async def get_rate_limit_status(user_id: str = "default"):
    """Get current rate limit status"""
    current_time = time.time()
    user_requests = rate_limit_store.get(user_id, [])
    
    # Count requests in current window
    recent_requests = [
        req_time for req_time in user_requests
        if current_time - req_time < RATE_LIMIT_WINDOW
    ]
    
    remaining = max(0, RATE_LIMIT_REQUESTS - len(recent_requests))
    
    return {
        "success": True,
        "data": {
            "requests_made": len(recent_requests),
            "requests_remaining": remaining,
            "rate_limit": RATE_LIMIT_REQUESTS,
            "window_seconds": RATE_LIMIT_WINDOW,
            "reset_time": current_time + RATE_LIMIT_WINDOW
        }
    }


# Chart redirection helpers
def build_fyers_chart_url(exchange: str, symbol: str) -> str:
    """Build Fyers chart URL for symbol"""
    # Clean up symbol format
    clean_symbol = symbol.replace("-EQ", "").replace("-FUT", "")
    exchange = exchange.upper() if exchange else "NSE"
    
    # Fyers chart URL format
    return f"https://trade.fyers.in/charts/{exchange}:{clean_symbol}"


@router.get("/chart-url/{symbol}")
async def get_chart_url(symbol: str, exchange: str = "NSE"):
    """Get Fyers chart URL for a symbol"""
    try:
        chart_url = build_fyers_chart_url(exchange, symbol)
        return {
            "success": True,
            "data": {
                "symbol": symbol,
                "exchange": exchange,
                "chart_url": chart_url
            }
        }
    except Exception as e:
        logger.error(f"Chart URL generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate chart URL: {str(e)}")


# Background task for price updates
async def fetch_watchlist_prices(symbols: list, user_id: str):
    """Background task to fetch prices for watchlist symbols"""
    try:
        access_token = get_fyers_access_token(user_id)
        if not access_token:
            logger.warning(f"No Fyers token for user {user_id}, skipping price update")
            return
        
        # Batch symbols into groups of 50 (Fyers API limit)
        batch_size = 50
        for i in range(0, len(symbols), batch_size):
            batch = symbols[i:i + batch_size]
            
            try:
                response = await make_fyers_request(
                    "quotes",
                    method="GET",
                    data={"symbols": ",".join(batch)},
                    access_token=access_token
                )
                
                # Process response and update watchlist prices
                # This would integrate with WatchlistService.update_stock_prices()
                logger.info(f"Updated prices for {len(batch)} symbols")
                
            except Exception as e:
                logger.error(f"Failed to fetch prices for batch: {str(e)}")
                
            # Rate limiting - wait between batches
            await asyncio.sleep(1)
            
    except Exception as e:
        logger.error(f"Background price fetch failed: {str(e)}")


@router.post("/sync-watchlist-prices")
async def sync_watchlist_prices(background_tasks: BackgroundTasks, watchlist_id: str, user_id: str = "default"):
    """Start background sync of watchlist prices with Fyers"""
    try:
        # This would integrate with WatchlistService to get symbols
        # For now, use demo symbols
        demo_symbols = ["NSE:RELIANCE-EQ", "NSE:TCS-EQ", "NSE:HDFCBANK-EQ"]
        
        background_tasks.add_task(fetch_watchlist_prices, demo_symbols, user_id)
        
        return {
            "success": True,
            "message": "Price sync started",
            "watchlist_id": watchlist_id
        }
        
    except Exception as e:
        logger.error(f"Price sync start error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start price sync: {str(e)}")