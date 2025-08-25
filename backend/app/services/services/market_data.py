import  as yf
import  as pd
from . import 
from . import , TCIData
from . import 

class MarketDataService:
    def __init__(self):
        self.db = next(get_db())

    async def fetch_and_store_data(self, symbols: list, period: str = "1d"):
        """Fetch market data and store in database"""
        for symbol in symbols:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period)
            
            for index, row in hist.iterrows():
                market_data = MarketData(
                    symbol=symbol,
                    timestamp=index,
                    open=row['Open'],
                    high=row['High'],
                    low=row['Low'],
                    close=row['Close'],
                    volume=row['Volume']
                )
                self.db.add(market_data)
        
        self.db.commit()

    async def update_tci_data(self, symbol: str, timeframe: str, tci_value: float, signal: str):
        """Store TCI indicator data"""
        tci_data = TCIData(
            symbol=symbol,
            timestamp=datetime.utcnow(),
            tci_value=tci_value,
            signal=signal,
            timeframe=timeframe
        )
        self.db.add(tci_data)
        self.db.commit()