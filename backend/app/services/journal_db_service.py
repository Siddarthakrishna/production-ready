from __future__ import annotations
from datetime import datetime
from typing import Dict
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError

from backend.app.db.connection import db_session
from backend.app.db.models import TradingJournal


def add_log(
    trade_id: str,
    symbol: str,
    side: str,
    entry_price: float = None,
    exit_price: float = None,
    profit: float = 0.0,
    stt: float = 0.0,
    gst: float = 0.0,
    stamp_duty: float = 0.0,
    brokerage: float = 0.0,
    net_profit: float = None,
    notes: str = None,
) -> Dict:
    with db_session() as db:
        row = TradingJournal(
            trade_id=trade_id,
            symbol=symbol.upper(),
            side=side.upper(),
            entry_price=entry_price,
            exit_price=exit_price,
            profit=profit,
            stt=stt,
            gst=gst,
            stamp_duty=stamp_duty,
            brokerage=brokerage,
            net_profit=net_profit,
            notes=notes,
            traded_at=datetime.utcnow(),
        )
        db.add(row)
        db.flush()
        return _to_dict(row)


def summary(user_id: int) -> Dict:
    with db_session() as db:
        # Aggregate in DB for performance
        totals = db.query(
            func.count(TradingJournal.id),
            func.coalesce(func.sum(TradingJournal.profit), 0),
            func.coalesce(func.sum(TradingJournal.stt), 0),
            func.coalesce(func.sum(TradingJournal.gst), 0),
            func.coalesce(func.sum(TradingJournal.stamp_duty), 0),
            func.coalesce(func.sum(TradingJournal.brokerage), 0),
            func.coalesce(func.sum(TradingJournal.net_profit), 0),
        ).one()

        total_trades, gross, stt, gst, stamp, brokerage, net_profit = totals
        return {
            "totalTrades": int(total_trades),
            "grossProfit": float(gross),
            "stt": float(stt),
            "gst": float(gst),
            "stampDuty": float(stamp),
            "brokerage": float(brokerage),
            "netProfit": round(float(net_profit), 2),
        }


def chart(user_id: int) -> Dict:
    with db_session() as db:
        rows = (
            db.query(TradingJournal)
            .order_by(TradingJournal.traded_at.asc())
            .all()
        )
        points = []
        cum = 0.0
        for r in rows:
            net_profit = float(r.net_profit) if r.net_profit else 0.0
            cum += net_profit
            points.append({"ts": r.traded_at.isoformat() if r.traded_at else datetime.utcnow().isoformat(), "cumNet": round(cum, 2)})
        return {"series": points}


def _to_dict(r: TradingJournal) -> Dict:
    return {
        "id": r.id,
        "tradeId": r.trade_id,
        "symbol": r.symbol,
        "side": r.side,
        "entryPrice": float(r.entry_price) if r.entry_price else None,
        "exitPrice": float(r.exit_price) if r.exit_price else None,
        "profit": float(r.profit) if r.profit else None,
        "stt": float(r.stt) if r.stt else 0.0,
        "gst": float(r.gst) if r.gst else 0.0,
        "stampDuty": float(r.stamp_duty) if r.stamp_duty else 0.0,
        "brokerage": float(r.brokerage) if r.brokerage else 0.0,
        "netProfit": float(r.net_profit) if r.net_profit else None,
        "tradedAt": r.traded_at.isoformat() if r.traded_at else None,
        "notes": r.notes,
    }
