import sys
import os

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRouter
import logging
from typing import List, Dict, Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Unified Sharada Research API",
    description="API for both landing page and financial application",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/v1/openapi.json"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3510"],  # Allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a top-level API router with global /api prefix
api = APIRouter(prefix="/api")

# Landing page endpoints
@api.get("/")
async def root():
    return {"message": "Welcome to Sharada Research API"}

# Health check
@api.get("/healthz")
async def healthz():
    return {"status": "ok"}

# Include routers from both projects
# Landing page APIs
@api.get("/landing/portfolio")
async def get_portfolio_data():
    return {"message": "Portfolio data for landing page"}

@api.get("/landing/skills")
async def get_skills():
    return {"skills": ["Python", "JavaScript", "React", "Node.js", "FastAPI", "MongoDB"]}

# Import and include financial application routers
try:
    # Import routers from the financial application
    from app.api.index import router as index_router
    from app.api.fii_dii import router as fii_dii_router
    from app.api.money_flux import router as money_flux_router
    from app.api.fno import router as fno_router
    from app.api.sector import router as sector_router
    from app.api.market_depth import router as market_depth_router
    from app.api.pro_setup import router as pro_setup_router
    from app.api.swing import router as swing_router
    from app.api.journal import router as journal_router
    from app.api.watchlist import router as watchlist_router
    from app.api.mock_data import router as mock_data_router
    from app.api.ollama import router as ollama_router
    from app.api.fyers import router as fyers_router
    # Import the new unified study API
    from app.api.unified_study import router as unified_study_router

    # Include the routers
    api.include_router(index_router)
    api.include_router(fii_dii_router)
    api.include_router(money_flux_router)
    api.include_router(fno_router)
    api.include_router(sector_router)
    api.include_router(market_depth_router)
    api.include_router(pro_setup_router)
    api.include_router(swing_router)
    api.include_router(journal_router)
    api.include_router(watchlist_router)
    api.include_router(mock_data_router)
    api.include_router(ollama_router)
    api.include_router(fyers_router)
    # Include the unified study API for param format
    api.include_router(unified_study_router)

    logger.info("Financial application routers successfully included")
except Exception as e:
    logger.error(f"Error importing financial application routers: {e}")

# Auth endpoints
@api.post("/auth/login")
async def auth_login():
    from fastapi import Response
    resp = Response(content='{"ok": true, "user": {"email": "demo@example.com"}}', media_type="application/json")
    resp.set_cookie(key="session", value="demo-session", httponly=True)
    return resp

@api.post("/auth/logout")
async def auth_logout():
    from fastapi import Response
    resp = Response(content='{"ok": true}', media_type="application/json")
    resp.delete_cookie(key="session")
    return resp

@api.post("/auth/refresh")
async def auth_refresh():
    return {"ok": True}

# Finally mount the /api router
app.include_router(api)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8001, reload=True)