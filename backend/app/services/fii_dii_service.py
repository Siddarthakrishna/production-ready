from __future__ import annotations
from datetime import date
from functools import lru_cache
from typing import Dict, Optional


@lru_cache(maxsize=128)
def get_net(on: Optional[date] = None) -> Dict:
    # Placeholder implementation; replace with DB or external source
    d = (on or date.today()).isoformat()
    return {
        "date": d,
        "fiiBuy": 225_300_000,
        "fiiSell": 148_000_000,
        "diiBuy": 102_500_000,
        "diiSell": 98_500_000,
        "fiiNet": 77_300_000,
        "diiNet": 4_000_000,
        "netTotal": 81_300_000,
    }


@lru_cache(maxsize=128)
def get_breakdown(range_: str = "1M") -> Dict:
    # Placeholder time-bucketed breakdown
    buckets = ["W1", "W2", "W3", "W4"] if range_.upper() == "1M" else ["D1", "D2", "D3", "D4", "D5"]
    series = [
        {"bucket": b, "fiiNet": 10_000_000 + i * 1_000_000, "diiNet": -1_000_000 + i * 500_000}
        for i, b in enumerate(buckets)
    ]
    return {"range": range_, "series": series}
