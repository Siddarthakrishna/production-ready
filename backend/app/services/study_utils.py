import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from .types import STUDY_DATA_ALLOW, STUDY_SYMBOL_ALLOW

# Constants
DEFAULT_LOOKBACK_DAYS = 30
DEFAULT_TOP_N = 10

def calculate_sectorial_view(df: pd.DataFrame) -> List[Dict]:
    """Calculate sector performance metrics."""
    if df.empty or 'sector' not in df.columns or 'close' not in df.columns:
        return []
        
    sector_perf = df.groupby('sector')['close'].agg(
        current=('close', 'last'),
        prev_close=('close', lambda x: x.iloc[-2] if len(x) > 1 else x.iloc[0]),
        volume=('volume', 'sum')
    ).reset_index()
    
    sector_perf['change'] = ((sector_perf['current'] - sector_perf['prev_close']) / 
                           sector_perf['prev_close'] * 100)
    
    return sector_perf.sort_values('change', ascending=False).to_dict('records')

def calculate_index_data(df: pd.DataFrame, index_name: str) -> Dict:
    """Calculate index performance metrics."""
    if df.empty or 'close' not in df.columns:
        return {}
        
    return {
        'name': index_name,
        'price': df['close'].iloc[-1],
        'change': ((df['close'].iloc[-1] - df['close'].iloc[-2]) / df['close'].iloc[-2] * 100 
                  if len(df) > 1 else 0),
        'volume': int(df['volume'].sum())
    }

def calculate_moneyflow(df: pd.DataFrame) -> Dict[str, float]:
    """Calculate money flow indicators."""
    if df.empty or any(col not in df.columns for col in ['close', 'high', 'low', 'volume']):
        return {}
        
    mf_multiplier = ((df['close'] - df['low']) - (df['high'] - df['close'])) / (df['high'] - df['low'])
    mf_volume = mf_multiplier * df['volume']
    
    return {
        'money_flow': float(mf_volume.sum() / df['volume'].sum() if df['volume'].sum() > 0 else 0),
        'money_flow_ratio': float(mf_volume[mf_volume > 0].sum() / 
                                abs(mf_volume[mf_volume < 0].sum()) 
                                if (mf_volume < 0).any() else 0)
    }

def find_near_price_levels(price_series: pd.Series, threshold_pct: float = 0.02) -> List[float]:
    """Find significant price levels using clustering."""
    if len(price_series) < 2:
        return []
        
    from sklearn.cluster import KMeans
    
    prices = price_series.values.reshape(-1, 1)
    threshold = price_series.std() * threshold_pct
    n_clusters = min(5, len(price_series) // 2)
    
    if n_clusters < 2:
        return []
        
    kmeans = KMeans(n_clusters=n_clusters, random_state=42).fit(prices)
    centers = sorted([c[0] for c in kmeans.cluster_centers_ if c[0] > 0])
    
    # Filter nearby levels
    filtered_levels = []
    for level in centers:
        if not filtered_levels or abs(level - filtered_levels[-1]) > threshold:
            filtered_levels.append(level)
    
    return filtered_levels

def calculate_momentum_spikes(df: pd.DataFrame, lookback: int = 14) -> Dict:
    """Calculate momentum indicators and detect spikes."""
    if len(df) < lookback or 'close' not in df.columns:
        return {}
        
    returns = df['close'].pct_change()
    momentum = df['close'] - df['close'].shift(lookback)
    rsi = 100 - (100 / (1 + (returns[returns > 0].mean() / abs(returns[returns < 0].mean()))))
    
    return {
        'momentum': float(momentum.iloc[-1]),
        'rsi': float(rsi),
        'spike_detected': abs(returns.iloc[-1]) > (2 * returns.std())
    }

def calculate_breakout_signals(df: pd.DataFrame, window: int = 20) -> Dict:
    """Detect breakout signals using volatility and volume."""
    if len(df) < window or any(col not in df.columns for col in ['high', 'low', 'close', 'volume']):
        return {}
        
    df['atr'] = df['high'] - df['low']
    atr = df['atr'].rolling(window=window).mean().iloc[-1]
    
    return {
        'breakout': df['close'].iloc[-1] > (df['high'].rolling(window).max().iloc[-2]),
        'breakdown': df['close'].iloc[-1] < (df['low'].rolling(window).min().iloc[-2]),
        'volume_spike': df['volume'].iloc[-1] > (2 * df['volume'].rolling(window).mean().iloc[-2]),
        'volatility': float(atr / df['close'].iloc[-1] * 100)  # ATR as % of price
    }

def calculate_tci_signals(df: pd.DataFrame, fast_period: int = 10, slow_period: int = 21) -> Dict:
    """Calculate Trend Continuation Index signals."""
    if len(df) < slow_period or 'close' not in df.columns:
        return {}
        
    # Simple moving averages for trend
    fast_ma = df['close'].rolling(window=fast_period).mean()
    slow_ma = df['close'].rolling(window=slow_period).mean()
    
    # TCI: Fast MA above Slow MA indicates uptrend
    tci = (fast_ma > slow_ma).astype(int)
    
    return {
        'tci': int(tci.iloc[-1]),
        'signal': 'BUY' if tci.iloc[-1] == 1 else 'SELL',
        'crossover': tci.iloc[-1] > tci.iloc[-2] if len(tci) > 1 else False
    }

def calculate_advance_decline(df: pd.DataFrame) -> Dict:
    """Calculate advance/decline metrics."""
    if df.empty or 'advances' not in df.columns or 'declines' not in df.columns:
        return {}
        
    return {
        'advances': int(df['advances'].iloc[-1]),
        'declines': int(df['declines'].iloc[-1]),
        'net_advancing': int(df['advances'].iloc[-1] - df['declines'].iloc[-1]),
        'advance_volume': int(df.get('advance_volume', 0).iloc[-1] if 'advance_volume' in df.columns else 0),
        'decline_volume': int(df.get('decline_volume', 0).iloc[-1] if 'decline_volume' in df.columns else 0)
    }

def calculate_volume_rankings(df: pd.DataFrame, top_n: int = 10) -> List[Dict]:
    """Rank symbols by volume and volume change."""
    if df.empty or 'volume' not in df.columns or 'symbol' not in df.columns:
        return []
        
    df['volume_change'] = df.groupby('symbol')['volume'].pct_change()
    df = df.sort_values('volume', ascending=False).head(top_n)
    
    return df[['symbol', 'volume', 'volume_change']].to_dict('records')

def calculate_heatmap_data(df: pd.DataFrame, metric: str = 'change') -> List[Dict]:
    """Prepare data for heatmap visualization."""
    if df.empty or 'sector' not in df.columns or metric not in df.columns:
        return []
        
    return df.groupby('sector')[metric].mean().reset_index().to_dict('records')
