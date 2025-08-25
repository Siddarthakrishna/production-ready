from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
from typing import List, Dict, Optional


@dataclass
class TradeLog:
    id: int
    user_id: int
    ts: datetime
    symbol: str
    side: str  # BUY/SELL
    qty: int
    price: float
    gross_profit: float = 0.0
    stt: float = 0.0
    gst: float = 0.0
    stamp_duty: float = 0.0
    brokerage: float = 0.0


class JournalStore:
    _logs: List[TradeLog] = []
    _next_id: int = 1

    @classmethod
    def add_log(
        cls,
        user_id: int,
        symbol: str,
        side: str,
        qty: int,
        price: float,
        gross_profit: float = 0.0,
        stt: float = 0.0,
        gst: float = 0.0,
        stamp_duty: float = 0.0,
        brokerage: float = 0.0,
        ts: Optional[datetime] = None,
    ) -> Dict:
        log = TradeLog(
            id=cls._next_id,
            user_id=user_id,
            ts=ts or datetime.utcnow(),
            symbol=symbol.upper(),
            side=side.upper(),
            qty=qty,
            price=price,
            gross_profit=gross_profit,
            stt=stt,
            gst=gst,
            stamp_duty=stamp_duty,
            brokerage=brokerage,
        )
        cls._next_id += 1
        cls._logs.append(log)
        return cls._to_dict(log)

    @classmethod
    def summary(cls, user_id: int) -> Dict:
        logs = [l for l in cls._logs if l.user_id == user_id]
        total_trades = len(logs)
        gross = sum(l.gross_profit for l in logs)
        stt = sum(l.stt for l in logs)
        gst = sum(l.gst for l in logs)
        stamp = sum(l.stamp_duty for l in logs)
        brokerage = sum(l.brokerage for l in logs)
        net = gross - (stt + gst + stamp + brokerage)
        return {
            "totalTrades": total_trades,
            "grossProfit": round(gross, 2),
            "stt": round(stt, 2),
            "gst": round(gst, 2),
            "stampDuty": round(stamp, 2),
            "brokerage": round(brokerage, 2),
            "netProfit": round(net, 2),
        }

    @classmethod
    def chart(cls, user_id: int) -> Dict:
        # simple cumulative net over time
        logs = sorted([l for l in cls._logs if l.user_id == user_id], key=lambda x: x.ts)
        points = []
        cum = 0.0
        for l in logs:
            net = l.gross_profit - (l.stt + l.gst + l.stamp_duty + l.brokerage)
            cum += net
            points.append({"ts": l.ts.isoformat(), "cumNet": round(cum, 2)})
        return {"series": points}

    @staticmethod
    def _to_dict(l: TradeLog) -> Dict:
        return {
            "id": l.id,
            "userId": l.user_id,
            "ts": l.ts.isoformat(),
            "symbol": l.symbol,
            "side": l.side,
            "qty": l.qty,
            "price": l.price,
            "grossProfit": l.gross_profit,
            "stt": l.stt,
            "gst": l.gst,
            "stampDuty": l.stamp_duty,
            "brokerage": l.brokerage,
        }
