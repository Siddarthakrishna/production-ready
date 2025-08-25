from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/mock", tags=["mock-data"])

# Resolve project root by traversing up from this file to the repo root
PROJECT_ROOT = Path(__file__).resolve().parents[3]
MOCK_DIR = PROJECT_ROOT / "mock_data"

# Whitelisted mapping: endpoint name -> filename
MOCK_FILES: Dict[str, str] = {
    "fii-dii/net": "fii_dii.json",
    "fno/option-chain": "fno_option_chain.json",
    "sector/heatmap": "sector_heatmap.json",
    "moneyflux/heatmap": "moneyflux.json",
    "market-depth/highpower": "market_depth.json",
    "pro/spike/5min": "pro_setup.json",
    "swing/nifty500": "swing.json",
    "index/pcr": "index_analysis.json",
    "journal/summary": "journal.json",
}


def _read_json_file(p: Path) -> Dict:
    try:
        with p.open("r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Mock file not found: {p.name}")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON in {p.name}: {e}")


@router.get("/list")
def list_available() -> Dict[str, List[str]]:
    """List available mock endpoints and files."""
    existing = [k for k, v in MOCK_FILES.items() if (MOCK_DIR / v).exists()]
    missing = [k for k, v in MOCK_FILES.items() if not (MOCK_DIR / v).exists()]
    return {
        "basePath": "/api/mock",
        "available": existing,
        "missing": missing,
    }


@router.get("/{category}/{name}")
def get_mock(category: str, name: str) -> Dict:
    """Fetch mock JSON by logical name, e.g. GET /api/mock/fii-dii/net"""
    key = f"{category}/{name}"
    if key not in MOCK_FILES:
        raise HTTPException(status_code=404, detail=f"Unknown mock key '{key}'")
    file_path = MOCK_DIR / MOCK_FILES[key]
    return _read_json_file(file_path)
