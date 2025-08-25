from typing import Dict, List, Optional, TypedDict, Union, Literal
from datetime import datetime
from pydantic import BaseModel

# Type aliases
Symbol = str
Timeframe = str

# Study result types
class StudyResult(BaseModel):
    name: str
    value: float
    timestamp: datetime
    metadata: Optional[Dict] = None

class TCIData(BaseModel):
    symbol: str
    timestamp: datetime
    tci_value: float
    signal: str
    timeframe: Timeframe

# Study data types
class SectorialView(TypedDict):
    sector: str
    value: float
    change: float

class IndexData(TypedDict):
    name: str
    price: float
    change: float
    volume: int

# Study symbol types
class StudySymbol(TypedDict):
    symbol: str
    value: float
    change: Optional[float]
    volume: Optional[int]

# Constants
STUDY_DATA_ALLOW = {
    "sectorial_view",
    "index_data",
    "money_flow",
    "momentum_spikes",
    "breakout_signals",
    "tci_signals",
    "advance_decline",
    "volume_rankings",
    "heatmap"
}

STUDY_SYMBOL_ALLOW = {
    "top_gainers",
    "top_losers",
    "volume_spikes",
    "breakouts",
    "tci_buy_signals",
    "tci_sell_signals"
}
