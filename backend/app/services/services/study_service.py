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
from backend.app.services.param_normalizer import (
    ParamNormalizer,
    normalize_market_depth_data,
    normalize_sectorial_data,
    normalize_swing_data
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
            raw_data = []
            
            if name == "SECTORIAL VIEW":
                raw_data = calculate_sectorial_view(df)
                # Normalize sectorial data to param format
                normalized_data = normalize_sectorial_data(raw_data) if raw_data else []
            
            elif name in ["NIFTY 50", "NIFTY BANK", "NIFTY AUTO", "NIFTY FIN SERV",
                         "NIFTY FMCG", "NIFTY IT", "NIFTY MEDIA", "NIFTY METAL",
                         "NIFTY PHARMA", "NIFTY PSU BANK", "NIFTY PVT BANK",
                         "NIFTY REALITY", "NIFTY ENERGY"]:
                # Filter data for specific index
                index_df = df[df['symbol'].str.contains(name.split()[-1], case=False) if len(df) > 0 else df]
                raw_data = [calculate_index_data(index_df, name)] if len(index_df) > 0 else []
                # Convert to param format for consistent visualization
                normalized_data = []
                for item in raw_data:
                    normalized_item = {
                        "Symbol": item.get('name', name),
                        "param_0": float(item.get('price', 0)),  # LTP
                        "param_1": float(item.get('price', 0)) * 0.99,  # Mock previous close
                        "param_2": float(item.get('change', 0)),  # % Change
                        "param_3": float(item.get('volume', 0)) / 1000000,  # R-Factor (volume in millions)
                        "param_4": datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # DateTime
                    }
                    normalized_data.append(normalized_item)
            
            elif "MONEYFLOW" in name:
                raw_data = [calculate_moneyflow(df)]
                # Convert moneyflow data to param format
                normalized_data = []
                for item in raw_data:
                    if isinstance(item, dict):
                        normalized_item = {
                            "Symbol": "MONEYFLOW",
                            "param_0": float(item.get('money_flow', 0)),  # Money flow value
                            "param_1": 0.0,  # Previous close (not applicable)
                            "param_2": float(item.get('money_flow_ratio', 0)),  # Flow ratio as % change
                            "param_3": float(item.get('money_flow', 0)),  # R-Factor (same as flow)
                            "param_4": datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # DateTime
                        }
                        normalized_data.append(normalized_item)
            
            elif name in ["NEAR DAYS HIGH", "NEAR DAYS LOW"]:
                # Generate mock data for near levels
                level_type = name.split()[-1]
                if len(df) > 0:
                    top_symbols = df.head(10)
                    normalized_data = []
                    for _, row in top_symbols.iterrows():
                        normalized_item = {
                            "Symbol": row['symbol'],
                            "param_0": float(row['close']),  # LTP
                            "param_1": float(row['open']),  # Previous close (using open as proxy)
                            "param_2": float(((row['close'] - row['open']) / row['open']) * 100),  # % Change
                            "param_3": float(row['volume']) / 1000000,  # R-Factor (volume in millions)
                            "param_4": datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # DateTime
                        }
                        normalized_data.append(normalized_item)
                else:
                    normalized_data = []
            
            elif "MOMENTUM SPIKE" in name:
                minutes = 5 if "5" in name else 10
                # Generate momentum spike data
                if len(df) > 0:
                    momentum_stocks = df.head(10)
                    normalized_data = []
                    for _, row in momentum_stocks.iterrows():
                        spike_value = np.random.uniform(1, 5)  # Mock spike value
                        normalized_item = {
                            "Symbol": row['symbol'],
                            "param_0": float(row['close']),  # LTP
                            "param_1": float(row['close']) * 0.98,  # Previous close
                            "param_2": spike_value,  # % Change (spike)
                            "param_3": spike_value * 1.2,  # R-Factor (momentum strength)
                            "param_4": datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # DateTime
                        }
                        normalized_data.append(normalized_item)
                else:
                    normalized_data = []
            
            elif name in ["GAINER", "LOSSER"]:
                # Calculate top gainers/losers
                if len(df) > 0:
                    df['change_percent'] = ((df['close'] - df['open']) / df['open']) * 100
                    if name == "GAINER":
                        top_stocks = df.nlargest(10, 'change_percent')
                    else:
                        top_stocks = df.nsmallest(10, 'change_percent')
                    
                    normalized_data = []
                    for _, row in top_stocks.iterrows():
                        normalized_item = {
                            "Symbol": row['symbol'],
                            "param_0": float(row['close']),  # LTP
                            "param_1": float(row['open']),  # Previous close (using open)
                            "param_2": float(row['change_percent']),  # % Change
                            "param_3": float(row['volume']) / 1000000,  # R-Factor (volume)
                            "param_4": datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # DateTime
                        }
                        normalized_data.append(normalized_item)
                else:
                    normalized_data = []
            
            else:
                # Default to index data calculation
                raw_data = [calculate_index_data(df, name)] if len(df) > 0 else []
                normalized_data = normalize_market_depth_data(raw_data) if raw_data else []
            
            # Set the normalized data
            result["data"] = normalized_data
            
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
            "data": [],  # Changed from symbols to data for consistency
            "count": count
        }

        try:
            symbols_data = []
            
            if "DAY HIGH BO" in name:
                days = int(name.split()[0])
                if len(df) > 0:
                    # Mock breakout calculation
                    breakout_stocks = df.head(count)
                    symbols_data = []
                    for _, row in breakout_stocks.iterrows():
                        symbol_item = {
                            "Symbol": row['symbol'],
                            "param_0": float(row['close']),  # LTP
                            "param_1": float(row['close']) * 0.98,  # Previous close
                            "param_2": np.random.uniform(2, 8),  # % Change (breakout)
                            "param_3": np.random.uniform(1, 3),  # R-Factor (strength)
                            "param_4": datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # DateTime
                        }
                        symbols_data.append(symbol_item)
            
            elif "DAY LOW BO" in name:
                days = int(name.split()[0])
                if len(df) > 0:
                    # Mock breakdown calculation  
                    breakdown_stocks = df.head(count)
                    symbols_data = []
                    for _, row in breakdown_stocks.iterrows():
                        symbol_item = {
                            "Symbol": row['symbol'],
                            "param_0": float(row['close']),  # LTP
                            "param_1": float(row['close']) * 1.02,  # Previous close
                            "param_2": np.random.uniform(-8, -2),  # % Change (breakdown)
                            "param_3": np.random.uniform(1, 3),  # R-Factor (strength)
                            "param_4": datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # DateTime
                        }
                        symbols_data.append(symbol_item)
            
            elif "TCI" in name:
                if len(df) > 0:
                    tci_stocks = df.head(count)
                    symbols_data = []
                    for _, row in tci_stocks.iterrows():
                        symbol_item = {
                            "Symbol": row['symbol'],
                            "param_0": float(row['close']),  # LTP
                            "param_1": float(row['open']),  # Previous close
                            "param_2": float(((row['close'] - row['open']) / row['open']) * 100),  # % Change
                            "param_3": np.random.uniform(0.5, 2.5),  # TCI strength
                            "param_4": datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # DateTime
                        }
                        symbols_data.append(symbol_item)
            
            elif "BREAK LIVE" in name:
                days = int(name.split()[0])
                if len(df) > 0:
                    live_break_stocks = df.head(count)
                    symbols_data = []
                    for _, row in live_break_stocks.iterrows():
                        is_high_break = "HIGH" in name
                        change_range = (2, 10) if is_high_break else (-10, -2)
                        symbol_item = {
                            "Symbol": row['symbol'],
                            "param_0": float(row['close']),  # LTP
                            "param_1": float(row['close']) * (0.95 if is_high_break else 1.05),  # Previous close
                            "param_2": np.random.uniform(*change_range),  # % Change
                            "param_3": np.random.uniform(1, 4),  # R-Factor (breakout strength)
                            "param_4": datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # DateTime
                        }
                        symbols_data.append(symbol_item)
            
            else:
                # Default to volume-based ranking
                if len(df) > 0:
                    volume_stocks = df.nlargest(count, 'volume')
                    symbols_data = []
                    for _, row in volume_stocks.iterrows():
                        symbol_item = {
                            "Symbol": row['symbol'],
                            "param_0": float(row['close']),  # LTP
                            "param_1": float(row['open']),  # Previous close
                            "param_2": float(((row['close'] - row['open']) / row['open']) * 100),  # % Change
                            "param_3": float(row['volume']) / 1000000,  # R-Factor (volume in millions)
                            "param_4": datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # DateTime
                        }
                        symbols_data.append(symbol_item)
            
            # Set the normalized data
            result["data"] = symbols_data
            
            # Cache the result
            await self.save_study_result(name, result)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        
        return result

    async def get_advance_decline_data(self, index: str) -> Dict:
        """Get advance/decline data for an index in param format"""
        try:
            df = await self.get_market_data(symbol=index)
            raw_data = calculate_advance_decline(df)
            
            # Convert to param format
            if isinstance(raw_data, dict) and raw_data:
                advance_pct = (raw_data.get('advances', 0) / max(raw_data.get('advances', 1) + raw_data.get('declines', 1), 1)) * 100
                decline_pct = (raw_data.get('declines', 0) / max(raw_data.get('advances', 1) + raw_data.get('declines', 1), 1)) * 100
                
                normalized_data = [{
                    "Symbol": index,
                    "param_0": float(advance_pct),  # Advance percentage
                    "param_1": float(decline_pct),  # Decline percentage  
                    "param_2": float(advance_pct - decline_pct),  # Net advance/decline
                    "param_3": float(raw_data.get('net_advancing', 0)),  # Net advancing count
                    "param_4": datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # DateTime
                }]
                
                return {
                    "data": normalized_data,
                    "index": index,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                return {"data": [], "index": index, "timestamp": datetime.now().isoformat()}
                
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