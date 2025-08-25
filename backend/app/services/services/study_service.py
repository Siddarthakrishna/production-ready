# src/services/study_service.py

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

import pandas as pd
import numpy as np
from fastapi import HTTPException, status

# Local imports
from backend.app.services.study_utils import (
    STUDY_DATA_ALLOW, 
    STUDY_SYMBOL_ALLOW,
    calculate_sectorial_view, 
    calculate_index_data, 
    calculate_moneyflow,
    find_near_price_levels, 
    calculate_momentum_spikes, 
    calculate_breakout_signals,
    calculate_tci_signals, 
    calculate_advance_decline, 
    calculate_volume_rankings,
    calculate_heatmap_data
)

logger = logging.getLogger(__name__)

class StudyService:
    def __init__(self):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.data_source = None  # Placeholder for future external data source

    async def _placeholder_get_study_data(self, name: str) -> Dict[str, Any]:
        """
        Get study data by name
        """
        if name not in STUDY_DATA_ALLOW:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Study '{name}' not found. Available studies: {list(STUDY_DATA_ALLOW)}"
            )
            
        try:
            # Get data from database or external source
            # This is a placeholder - implement actual data retrieval
            data = {
                'study_name': name,
                'data': [],  # Replace with actual data
                'timestamp': datetime.utcnow().isoformat()
            }
            return data
            
        except Exception as e:
            logger.error(f"Error getting study data for {name}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving study data: {str(e)}"
            )

    async def _placeholder_get_study_symbol(self, name: str, count: int = 5) -> Dict[str, Any]:
        """
        Get symbols for a specific study
        """
        if name not in STUDY_SYMBOL_ALLOW:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Study '{name}' not found. Available symbol studies: {list(STUDY_SYMBOL_ALLOW)}"
            )
            
        try:
            # Get symbols from database or external source
            # This is a placeholder - implement actual data retrieval
            symbols = [
                {"symbol": f"SYMBOL{i}", "value": np.random.random() * 100}
                for i in range(1, count + 1)
            ]
            
            return {
                'study_name': name,
                'symbols': symbols,
                'count': len(symbols),
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting symbols for study {name}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving study symbols: {str(e)}"
            )

    async def get_market_data(self, symbol: str = None, timeframe: str = '1d', 
                            start_date: datetime = None, limit: int = 1000) -> pd.DataFrame:
        """
        Get market data. For now, return mock data; replace with DB/external later.
        """
        try:
            # In future: try DB or external source via self.data_source
            return self._get_mock_market_data(symbol)
        except Exception as e:
            logger.error(f"Error getting market data: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving market data: {str(e)}"
            )

    def _get_mock_market_data(self, symbol: str = None) -> pd.DataFrame:
        """
        Generate mock market data for testing
        """
        import numpy as np
        
        symbols = [symbol] if symbol else ['RELIANCE', 'TCS', 'HDFC', 'INFY', 'ICICIBANK']
        data = []
        
        for sym in symbols:
            base_price = np.random.uniform(100, 1000)
            for i in range(20):  # 20 days of data
                open_price = base_price + np.random.uniform(-10, 10)
                high_price = open_price + np.random.uniform(0, 20)
                low_price = open_price - np.random.uniform(0, 15)
                close_price = np.random.uniform(low_price, high_price)
                volume = np.random.randint(100000, 5000000)
                
                data.append({
                    'symbol': sym,
                    'timestamp': datetime.now() - timedelta(days=20-i),
                    'open': open_price,
                    'high': high_price,
                    'low': low_price,
                    'close': close_price,
                    'volume': volume,
                    'sector': self._get_sector_for_symbol(sym)
                })
        
        return pd.DataFrame(data)

    def _get_sector_for_symbol(self, symbol: str) -> str:
        """Get sector for a given symbol"""
        sector_map = {
            'RELIANCE': 'ENERGY',
            'TCS': 'IT',
            'HDFC': 'BANKING',
            'INFY': 'IT',
            'ICICIBANK': 'BANKING',
            'HINDUNILVR': 'FMCG',
            'ITC': 'FMCG',
            'SBIN': 'BANKING',
            'BHARTIARTL': 'TELECOM',
            'AXISBANK': 'BANKING'
        }
        return sector_map.get(symbol, 'UNKNOWN')

    async def save_study_result(self, name: str, result: dict):
        """Cache study result in-memory (temporary)."""
        self.cache[name] = {"result": result, "ts": datetime.utcnow()}
        return result

    async def get_cached_study(self, name: str, max_age_minutes: int = 5):
        """Get cached study result from in-memory cache."""
        item = self.cache.get(name)
        if not item:
            return None
        if item["ts"] < datetime.utcnow() - timedelta(minutes=max_age_minutes):
            return None
        class _Obj:
            def __init__(self, result):
                self.result = result
        return _Obj(item["result"])

    async def get_study_data(self, name: str) -> Dict:
        """Get study data with real calculations"""
        if name not in STUDY_DATA_ALLOW:
            raise HTTPException(status_code=400, detail="Study name not allowed")

        # Check cache first
        cached_result = await self.get_cached_study(name)
        if cached_result:
            return cached_result.result

        # Get market data
        df = await self.get_market_data()
        
        result = {
            "name": name,
            "timestamp": datetime.now().isoformat(),
            "data": []
        }

        try:
            if name == "SECTORIAL VIEW":
                result["data"] = calculate_sectorial_view(df)
            
            elif name in ["NIFTY 50", "NIFTY BANK", "NIFTY AUTO", "NIFTY FIN SERV",
                         "NIFTY FMCG", "NIFTY IT", "NIFTY MEDIA", "NIFTY METAL",
                         "NIFTY PHARMA", "NIFTY PSU BANK", "NIFTY PVT BANK",
                         "NIFTY REALITY", "NIFTY ENERGY"]:
                # Filter data for specific index
                index_df = df[df['symbol'].str.contains(name.split()[-1], case=False)]
                result["data"] = [calculate_index_data(index_df, name)]
            
            elif "MONEYFLOW" in name:
                flow_type = name.replace("MONEYFLOW ", "")
                result["data"] = calculate_moneyflow(df, flow_type)
            
            elif name in ["NEAR DAYS HIGH", "NEAR DAYS LOW"]:
                level_type = name.split()[-1]
                result["data"] = find_near_price_levels(df, level_type)
            
            elif "MOMENTUM SPIKE" in name:
                minutes = 5 if "5" in name else 10
                result["data"] = calculate_momentum_spikes(df, minutes)
            
            elif name in ["GAINER", "LOSSER"]:
                # Calculate top gainers/losers
                df['change_percent'] = ((df['close'] - df['open']) / df['open']) * 100
                if name == "GAINER":
                    top_stocks = df.nlargest(10, 'change_percent')
                else:
                    top_stocks = df.nsmallest(10, 'change_percent')
                
                result["data"] = [{
                    'symbol': row['symbol'],
                    'change_percent': float(row['change_percent']),
                    'price': float(row['close']),
                    'volume': int(row['volume'])
                } for _, row in top_stocks.iterrows()]
            
            else:
                # Default to index data calculation
                result["data"] = [calculate_index_data(df, name)]
            
            # Cache the result
            await self.save_study_result(name, result)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        
        return result

    async def get_study_symbol(self, name: str, count: int = 5) -> Dict:
        """Get study symbols with real calculations"""
        if name not in STUDY_SYMBOL_ALLOW:
            raise HTTPException(status_code=400, detail="Study name not allowed")

        # Check cache first
        cached_result = await self.get_cached_study(name)
        if cached_result:
            return cached_result.result

        # Get market data
        df = await self.get_market_data()
        
        result = {
            "name": name,
            "timestamp": datetime.now().isoformat(),
            "symbols": [],
            "count": count
        }

        try:
            if "DAY HIGH BO" in name:
                days = int(name.split()[0])
                breakouts = calculate_breakout_signals(df, days, 'HIGH')
                result["symbols"] = [b['symbol'] for b in breakouts[:count]]
            
            elif "DAY LOW BO" in name:
                days = int(name.split()[0])
                breakouts = calculate_breakout_signals(df, days, 'LOW')
                result["symbols"] = [b['symbol'] for b in breakouts[:count]]
            
            elif "TCI" in name:
                tci_signals = calculate_tci_signals(df, name)
                result["symbols"] = [s['symbol'] for s in tci_signals[:count]]
            
            elif "BREAK LIVE" in name:
                days = int(name.split()[0])
                if "HIGH" in name:
                    breakouts = calculate_breakout_signals(df, days, 'HIGH')
                else:
                    breakouts = calculate_breakout_signals(df, days, 'LOW')
                result["symbols"] = [b['symbol'] for b in breakouts[:count]]
            
            else:
                # Default to volume-based ranking
                volume_rankings = calculate_volume_rankings(df, count)
                result["symbols"] = [r['symbol'] for r in volume_rankings]
            
            # Cache the result
            await self.save_study_result(name, result)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        
        return result

    async def get_advance_decline_data(self, index: str) -> Dict:
        """Get advance/decline data for an index"""
        try:
            df = await self.get_market_data(symbol=index)
            return calculate_advance_decline(df)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def get_volume_rankings(self, market: str, period: str = 'latest') -> Dict:
        """Get volume-based rankings"""
        try:
            df = await self.get_market_data(symbol=market)
            rankings = calculate_volume_rankings(df, 10)
            return {
                "market": market,
                "period": period,
                "data": rankings
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def get_heatmap_data(self) -> Dict:
        """Get heatmap data"""
        try:
            df = await self.get_market_data()
            heatmap_data = calculate_heatmap_data(df)
            return {
                "data": heatmap_data,
                "ts": datetime.now().isoformat()
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))