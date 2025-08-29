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

# Add root endpoint for server verification
@app.get("/")
async def root():
    return {"message": "Welcome to Sharada Research API - Server is running!", "status": "active"}

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

# Import and include financial application routers with error-resilient startup
routers_to_include = [
    ('app.api.index', 'index_router'),
    ('app.api.fii_dii', 'fii_dii_router'),
    ('app.api.money_flux', 'money_flux_router'),
    ('app.api.fno', 'fno_router'),
    ('app.api.sector', 'sector_router'),
    ('app.api.market_depth', 'market_depth_router'),
    ('app.api.pro_setup', 'pro_setup_router'),
    ('app.api.swing', 'swing_router'),
    ('app.api.journal', 'journal_router'),
    ('app.api.watchlist', 'watchlist_router'),
    ('app.api.mock_data', 'mock_data_router'),
    ('app.api.ollama', 'ollama_router'),
    ('app.api.fyers', 'fyers_router'),
    ('app.api.unified_study', 'unified_study_router'),
]

successful_routers = []
failed_routers = []

for module_path, router_name in routers_to_include:
    try:
        module = __import__(module_path, fromlist=[router_name])
        router = getattr(module, 'router')
        
        # Validate router has required attributes
        if hasattr(router, 'routes') and hasattr(router, 'prefix'):
            api.include_router(router)
            successful_routers.append(router_name)
            logger.info(f"Successfully included router: {router_name}")
        else:
            logger.warning(f"Router {router_name} missing required attributes, skipping")
            failed_routers.append(router_name)
    except Exception as e:
        logger.error(f"Error importing router {router_name}: {e}")
        failed_routers.append(router_name)

logger.info(f"Router inclusion summary: {len(successful_routers)} successful, {len(failed_routers)} failed")
if successful_routers:
    logger.info(f"Successful routers: {', '.join(successful_routers)}")
if failed_routers:
    logger.warning(f"Failed routers: {', '.join(failed_routers)}")

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