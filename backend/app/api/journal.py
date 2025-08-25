from enum import Enum
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator
from backend.app.db.connection import get_engine, db_session
from backend.app.db.models import TradingJournal

router = APIRouter(prefix="/journal", tags=["journal"]) 

# Choose service backend dynamically
USE_DB = get_engine() is not None
if USE_DB:
    from backend.app.services import journal_db_service as journal
else:
    from backend.app.services import journal_service as journal


class TradeSide(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


class JournalLogIn(BaseModel):
    userId: int = Field(..., ge=1)
    symbol: str
    side: TradeSide  # Now uses TradeSide enum for validation
    qty: int = Field(..., ge=1)
    price: float = Field(..., gt=0)
    grossProfit: float = 0.0
    stt: float = 0.0
    gst: float = 0.0
    stampDuty: float = 0.0
    brokerage: float = 0.0

    @validator('symbol')
    def symbol_uppercase(cls, v):
        return v.upper() if v else v


@router.post("/logs", response_model=Dict[str, Any])
def add_log(payload: JournalLogIn):
    try:
        if USE_DB:
            return journal.add_log(
                user_id=payload.userId,
                symbol=payload.symbol,
                side=payload.side.value,  # Get string value from enum
                qty=payload.qty,
                price=payload.price,
                gross_profit=payload.grossProfit,
                stt=payload.stt,
                gst=payload.gst,
                stamp_duty=payload.stampDuty,
                brokerage=payload.brokerage,
            )
        else:
            return journal.JournalStore.add_log(
                user_id=payload.userId,
                symbol=payload.symbol,
                side=payload.side.value,  # Get string value from enum
                qty=payload.qty,
                price=payload.price,
                gross_profit=payload.grossProfit,
                stt=payload.stt,
                gst=payload.gst,
                stamp_duty=payload.stampDuty,
                brokerage=payload.brokerage,
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/summary", response_model=Dict[str, Any])
def summary(userId: int):
    return journal.summary(userId) if USE_DB else journal.JournalStore.summary(userId)


@router.get("/chart", response_model=Dict[str, Any])
def chart(userId: int):
    return journal.chart(userId) if USE_DB else journal.JournalStore.chart(userId)


# Global journal endpoints using TradingJournal (no user scoping)
class GlobalJournalIn(BaseModel):
    tradeId: str
    symbol: str
    side: TradeSide
    entryPrice: Optional[float] = None
    exitPrice: Optional[float] = None
    profit: Optional[float] = None
    stt: float = 0.0
    gst: float = 0.0
    stampDuty: float = 0.0
    brokerage: float = 0.0
    netProfit: Optional[float] = None
    notes: Optional[str] = None

    @validator('symbol')
    def symbol_uppercase(cls, v):
        return v.upper() if v else v


@router.post("/global/logs", response_model=Dict[str, Any])
def add_global_log(payload: GlobalJournalIn):
    try:
        with db_session() as db:
            row = TradingJournal(
                trade_id=payload.tradeId,
                symbol=payload.symbol,
                side=payload.side.value,
                entry_price=payload.entryPrice,
                exit_price=payload.exitPrice,
                profit=payload.profit,
                stt=payload.stt,
                gst=payload.gst,
                stamp_duty=payload.stampDuty,
                brokerage=payload.brokerage,
                net_profit=payload.netProfit,
                notes=payload.notes,
            )
            db.add(row)
            db.flush()
            return {
                "id": row.id,
                "tradeId": row.trade_id,
                "symbol": row.symbol,
                "side": row.side,
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/global", response_model=Dict[str, Any])
def list_global_logs():
    try:
        with db_session() as db:
            rows = db.query(TradingJournal).order_by(TradingJournal.traded_at.desc().nullslast()).all()
            items = [
                {
                    "id": r.id,
                    "tradeId": r.trade_id,
                    "symbol": r.symbol,
                    "side": r.side,
                    "entryPrice": float(r.entry_price) if r.entry_price is not None else None,
                    "exitPrice": float(r.exit_price) if r.exit_price is not None else None,
                    "profit": float(r.profit) if r.profit is not None else None,
                    "netProfit": float(r.net_profit) if r.net_profit is not None else None,
                    "tradedAt": r.traded_at.isoformat() if r.traded_at else None,
                }
                for r in rows
            ]
            return {"items": items, "total": len(items)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
