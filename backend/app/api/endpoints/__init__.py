from fastapi import APIRouter

# Import all routers
from .studies import router as studies_router
from .market import router as market_router
from .fno import router as fno_router
from .system import router as system_router
from .swing_api import router as swing_router
from .fno_signals import router as fno_signals_router

# Create a list of all routers
routers = [
    studies_router,
    market_router,
    fno_router,
    system_router,
    swing_router,
    fno_signals_router
]

# Export the routers list
__all__ = [
    'studies_router',
    'market_router',
    'fno_router',
    'system_router',
    'swing_router',
    'fno_signals_router',
    'routers'
]