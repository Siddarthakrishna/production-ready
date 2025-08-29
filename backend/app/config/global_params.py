"""
Global Parameter Configuration

This file defines the standard parameter mappings used across the application.
Each module should reference these constants instead of hardcoding parameter names.
"""
from enum import Enum
from typing import Dict, Type

class ParamType(Enum):
    """Standard parameter types used across the application"""
    # Common parameters (0-99)
    PRICE = "param_0"
    PREV_CLOSE = "param_1"
    PERCENT_CHANGE = "param_2"
    R_FACTOR = "param_3"
    TIMESTAMP = "param_4"
    VOLUME = "param_5"
    SECTOR = "param_6"
    DATE = "param_7"
    SYMBOL_NAME = "param_8"
    RANK = "param_9"
    PRICE_CURRENT = "param_10"
    VWAP = "param_11"
    HIGH = "param_12"
    LOW = "param_13"
    OPEN = "param_14"
    CLOSE = "param_15"
    
    # Technical indicators (100-199)
    RSI = "param_100"
    MACD = "param_101"
    BOLLINGER_UPPER = "param_102"
    BOLLINGER_LOWER = "param_103"
    EMA_SUMMARY = "param_104"
    FIBONACCI_LEVEL = "param_105"
    SUPPORT_LEVEL = "param_106"
    RESISTANCE_LEVEL = "param_107"
    TREND_DIRECTION = "param_108"
    MOMENTUM = "param_109"
    
    # Volume indicators (200-299)
    VOLUME_AVG_20D = "param_200"
    VOLUME_SPIKE = "param_201"
    VOLUME_RATIO = "param_202"
    UNUSUAL_VOLUME = "param_203"
    VOLUME_TREND = "param_204"
    VOLUME_INTENSITY = "param_205"
    
    # Money flow (300-399)
    MONEY_FLOW = "param_300"
    RELATIVE_FLOW = "param_301"
    FII_NET = "param_302"
    DII_NET = "param_303"
    TOTAL_NET = "param_304"
    FLOW_RATIO = "param_305"
    INSTITUTIONAL_FLOW = "param_306"
    ACCUMULATION = "param_307"
    MONEY_FLOW_INDEX = "param_308"
    CASH_FLOW = "param_309"
    
    # Swing analysis (400-499)
    SWING_HIGH = "param_400"
    SWING_LOW = "param_401"
    SWING_STRENGTH = "param_402"
    SWING_TYPE = "param_403"
    SWING_LEVEL = "param_404"
    BREAKOUT_TYPE = "param_405"
    BREAKOUT_DAYS = "param_406"
    TREND_CHANGE = "param_407"
    
    # Heatmap parameters (500-599)
    HEATMAP_VALUE = "param_500"
    HEATMAP_INTENSITY = "param_501"
    HEATMAP_COLOR_VALUE = "param_502"
    HEATMAP_SIZE = "param_503"
    HEATMAP_CATEGORY = "param_504"
    
    # Market depth parameters (600-699)
    ORDER_BOOK_DEPTH = "param_600"
    BID_PRICE = "param_601"
    ASK_PRICE = "param_602"
    BID_SIZE = "param_603"
    ASK_SIZE = "param_604"
    SPREAD = "param_605"
    MARKET_IMPACT = "param_606"
    LIQUIDITY_SCORE = "param_607"
    
    # Pro setup parameters (700-799)
    FIVE_MIN_SPIKE = "param_700"
    TEN_MIN_SPIKE = "param_701"
    BULLISH_DIV_15M = "param_702"
    BEARISH_DIV_15M = "param_703"
    BULLISH_DIV_1H = "param_704"
    BEARISH_DIV_1H = "param_705"
    MULTI_RESISTANCE = "param_706"
    MULTI_SUPPORT = "param_707"
    BO_MULTI_RESISTANCE = "param_708"
    BO_MULTI_SUPPORT = "param_709"
    DAILY_CONTRADICTION = "param_710"
    
    # MoneyFlux specific parameters (800-899)
    SENTIMENT_SCORE = "param_800"
    SENTIMENT_DIRECTION = "param_801"
    PCR_RATIO = "param_802"
    PCR_CHANGE = "param_803"
    PUT_OI = "param_804"
    CALL_OI = "param_805"
    PUT_VOLUME = "param_806"
    CALL_VOLUME = "param_807"
    HEAT_VALUE = "param_808"
    VOLATILITY = "param_809"
    
    # Scanner parameters (900-999)
    SCANNER_SIGNAL = "param_900"
    SIGNAL_STRENGTH = "param_901"
    PATTERN_TYPE = "param_902"
    ENTRY_PRICE = "param_903"
    TARGET_PRICE = "param_904"
    STOP_LOSS = "param_905"
    RISK_REWARD = "param_906"

# Human-readable labels for each parameter
PARAM_LABELS: Dict[ParamType, str] = {
    # Common parameters
    ParamType.PRICE: "Last Traded Price",
    ParamType.PREV_CLOSE: "Previous Close",
    ParamType.PERCENT_CHANGE: "% Change",
    ParamType.R_FACTOR: "R-Factor",
    ParamType.TIMESTAMP: "Timestamp",
    ParamType.VOLUME: "Volume",
    ParamType.SECTOR: "Sector",
    ParamType.DATE: "Date",
    ParamType.SYMBOL_NAME: "Symbol Name",
    ParamType.RANK: "Rank",
    ParamType.PRICE_CURRENT: "Current Price",
    ParamType.VWAP: "VWAP",
    ParamType.HIGH: "High",
    ParamType.LOW: "Low",
    ParamType.OPEN: "Open",
    ParamType.CLOSE: "Close",
    
    # Technical indicators
    ParamType.RSI: "RSI (14)",
    ParamType.MACD: "MACD",
    ParamType.BOLLINGER_UPPER: "Bollinger Upper",
    ParamType.BOLLINGER_LOWER: "Bollinger Lower",
    ParamType.EMA_SUMMARY: "EMA Summary",
    ParamType.FIBONACCI_LEVEL: "Fibonacci Level",
    ParamType.SUPPORT_LEVEL: "Support Level",
    ParamType.RESISTANCE_LEVEL: "Resistance Level",
    ParamType.TREND_DIRECTION: "Trend Direction",
    ParamType.MOMENTUM: "Momentum",
    
    # Volume indicators
    ParamType.VOLUME_AVG_20D: "20-Day Avg Volume",
    ParamType.VOLUME_SPIKE: "Volume Spike %",
    ParamType.VOLUME_RATIO: "Volume Ratio",
    ParamType.UNUSUAL_VOLUME: "Unusual Volume",
    ParamType.VOLUME_TREND: "Volume Trend",
    ParamType.VOLUME_INTENSITY: "Volume Intensity",
    
    # Money flow
    ParamType.MONEY_FLOW: "Money Flow",
    ParamType.RELATIVE_FLOW: "Relative Flow",
    ParamType.FII_NET: "FII Net (Cr)",
    ParamType.DII_NET: "DII Net (Cr)",
    ParamType.TOTAL_NET: "Total Net (Cr)",
    ParamType.FLOW_RATIO: "Flow Ratio (FII/DII)",
    ParamType.INSTITUTIONAL_FLOW: "Institutional Flow",
    ParamType.ACCUMULATION: "Accumulation",
    ParamType.MONEY_FLOW_INDEX: "Money Flow Index",
    ParamType.CASH_FLOW: "Cash Flow",
    
    # Swing analysis
    ParamType.SWING_HIGH: "Swing High",
    ParamType.SWING_LOW: "Swing Low",
    ParamType.SWING_STRENGTH: "Swing Strength",
    ParamType.SWING_TYPE: "Swing Type",
    ParamType.SWING_LEVEL: "Swing Level",
    ParamType.BREAKOUT_TYPE: "Breakout Type",
    ParamType.BREAKOUT_DAYS: "Breakout Days",
    ParamType.TREND_CHANGE: "Trend Change",
    
    # Heatmap parameters
    ParamType.HEATMAP_VALUE: "Heatmap Value",
    ParamType.HEATMAP_INTENSITY: "Heatmap Intensity",
    ParamType.HEATMAP_COLOR_VALUE: "Color Value",
    ParamType.HEATMAP_SIZE: "Heatmap Size",
    ParamType.HEATMAP_CATEGORY: "Category",
    
    # Market depth parameters
    ParamType.ORDER_BOOK_DEPTH: "Order Book Depth",
    ParamType.BID_PRICE: "Bid Price",
    ParamType.ASK_PRICE: "Ask Price",
    ParamType.BID_SIZE: "Bid Size",
    ParamType.ASK_SIZE: "Ask Size",
    ParamType.SPREAD: "Bid-Ask Spread",
    ParamType.MARKET_IMPACT: "Market Impact",
    ParamType.LIQUIDITY_SCORE: "Liquidity Score",
    
    # Pro setup parameters
    ParamType.FIVE_MIN_SPIKE: "5-Min Spike %",
    ParamType.TEN_MIN_SPIKE: "10-Min Spike %",
    ParamType.BULLISH_DIV_15M: "Bullish Div 15m",
    ParamType.BEARISH_DIV_15M: "Bearish Div 15m",
    ParamType.BULLISH_DIV_1H: "Bullish Div 1h",
    ParamType.BEARISH_DIV_1H: "Bearish Div 1h",
    ParamType.MULTI_RESISTANCE: "Multi Resistance",
    ParamType.MULTI_SUPPORT: "Multi Support",
    ParamType.BO_MULTI_RESISTANCE: "BO Multi Resistance",
    ParamType.BO_MULTI_SUPPORT: "BO Multi Support",
    ParamType.DAILY_CONTRADICTION: "Daily Contradiction",
    
    # MoneyFlux parameters
    ParamType.SENTIMENT_SCORE: "Sentiment Score",
    ParamType.SENTIMENT_DIRECTION: "Sentiment Direction",
    ParamType.PCR_RATIO: "PCR Ratio",
    ParamType.PCR_CHANGE: "PCR Change %",
    ParamType.PUT_OI: "Put Open Interest",
    ParamType.CALL_OI: "Call Open Interest",
    ParamType.PUT_VOLUME: "Put Volume",
    ParamType.CALL_VOLUME: "Call Volume",
    ParamType.HEAT_VALUE: "Heat Value",
    ParamType.VOLATILITY: "Volatility",
    
    # Scanner parameters
    ParamType.SCANNER_SIGNAL: "Scanner Signal",
    ParamType.SIGNAL_STRENGTH: "Signal Strength",
    ParamType.PATTERN_TYPE: "Pattern Type",
    ParamType.ENTRY_PRICE: "Entry Price",
    ParamType.TARGET_PRICE: "Target Price",
    ParamType.STOP_LOSS: "Stop Loss",
    ParamType.RISK_REWARD: "Risk:Reward Ratio"
}

# Module-specific parameter mappings
MODULE_PARAMS = {
    # Swing Center Module
    "swing_center": {
        "primary": ParamType.PERCENT_CHANGE,
        "secondary": ParamType.VOLUME_SPIKE,
        "timestamp": ParamType.TIMESTAMP,
        "price": ParamType.PRICE,
        "prev_close": ParamType.PREV_CLOSE,
        "change": ParamType.PERCENT_CHANGE,
        "sector": ParamType.SECTOR,
        "date": ParamType.DATE,
        "r_factor": ParamType.R_FACTOR
    },
    
    # FII/DII Module
    "fii_dii": {
        "fii_net": ParamType.FII_NET,
        "dii_net": ParamType.DII_NET,
        "total_net": ParamType.TOTAL_NET,
        "flow_ratio": ParamType.FLOW_RATIO,
        "timestamp": ParamType.TIMESTAMP,
        "fii_buy": ParamType.MONEY_FLOW,
        "fii_sell": ParamType.MONEY_FLOW,
        "dii_buy": ParamType.MONEY_FLOW,
        "dii_sell": ParamType.MONEY_FLOW,
        "advance_percent": ParamType.PERCENT_CHANGE,
        "decline_percent": ParamType.HEATMAP_VALUE
    },
    
    # Sectorial Flow Module
    "sectorial_flow": {
        "heatmap": ParamType.HEATMAP_VALUE,
        "intensity": ParamType.VOLUME,
        "price": ParamType.PRICE,
        "change": ParamType.PERCENT_CHANGE,
        "volume": ParamType.VOLUME,
        "r_factor": ParamType.R_FACTOR,
        "timestamp": ParamType.TIMESTAMP,
        "sector": ParamType.SECTOR
    },
    
    # Market Depth Module
    "market_depth": {
        "heatmap": ParamType.HEATMAP_VALUE,
        "intensity": ParamType.HEATMAP_INTENSITY,
        "price": ParamType.PRICE,
        "change": ParamType.PERCENT_CHANGE,
        "volume": ParamType.VOLUME,
        "rank": ParamType.RANK,
        "timestamp": ParamType.TIMESTAMP,
        "bid_price": ParamType.BID_PRICE,
        "ask_price": ParamType.ASK_PRICE,
        "spread": ParamType.SPREAD,
        "depth": ParamType.ORDER_BOOK_DEPTH
    },
    
    # Money Flux Module
    "money_flux": {
        "heatmap": ParamType.HEAT_VALUE,
        "sentiment_score": ParamType.SENTIMENT_SCORE,
        "sentiment_direction": ParamType.SENTIMENT_DIRECTION,
        "pcr_ratio": ParamType.PCR_RATIO,
        "pcr_change": ParamType.PCR_CHANGE,
        "put_oi": ParamType.PUT_OI,
        "call_oi": ParamType.CALL_OI,
        "put_volume": ParamType.PUT_VOLUME,
        "call_volume": ParamType.CALL_VOLUME,
        "volatility": ParamType.VOLATILITY,
        "price": ParamType.PRICE,
        "volume": ParamType.VOLUME,
        "timestamp": ParamType.TIMESTAMP
    },
    
    # Pro Setup Module
    "pro_setup": {
        "price": ParamType.PRICE,
        "change": ParamType.PERCENT_CHANGE,
        "five_min_spike": ParamType.FIVE_MIN_SPIKE,
        "ten_min_spike": ParamType.TEN_MIN_SPIKE,
        "bullish_div_15m": ParamType.BULLISH_DIV_15M,
        "bearish_div_15m": ParamType.BEARISH_DIV_15M,
        "bullish_div_1h": ParamType.BULLISH_DIV_1H,
        "bearish_div_1h": ParamType.BEARISH_DIV_1H,
        "multi_resistance": ParamType.MULTI_RESISTANCE,
        "multi_support": ParamType.MULTI_SUPPORT,
        "bo_multi_resistance": ParamType.BO_MULTI_RESISTANCE,
        "bo_multi_support": ParamType.BO_MULTI_SUPPORT,
        "daily_contradiction": ParamType.DAILY_CONTRADICTION,
        "volume": ParamType.VOLUME,
        "timestamp": ParamType.TIMESTAMP
    },
    
    # Scanner Module
    "scanner": {
        "signal": ParamType.SCANNER_SIGNAL,
        "strength": ParamType.SIGNAL_STRENGTH,
        "pattern": ParamType.PATTERN_TYPE,
        "entry_price": ParamType.ENTRY_PRICE,
        "target_price": ParamType.TARGET_PRICE,
        "stop_loss": ParamType.STOP_LOSS,
        "risk_reward": ParamType.RISK_REWARD,
        "price": ParamType.PRICE,
        "change": ParamType.PERCENT_CHANGE,
        "volume": ParamType.VOLUME,
        "timestamp": ParamType.TIMESTAMP
    },
    
    # Index Analysis Module
    "index_analysis": {
        "price": ParamType.PRICE,
        "change": ParamType.PERCENT_CHANGE,
        "prev_close": ParamType.PREV_CLOSE,
        "r_factor": ParamType.R_FACTOR,
        "timestamp": ParamType.TIMESTAMP,
        "volume": ParamType.VOLUME,
        "high": ParamType.HIGH,
        "low": ParamType.LOW,
        "open": ParamType.OPEN
    },
    
    # Advance/Decline specific mappings
    "advance_decline": {
        "advance_percent": ParamType.PERCENT_CHANGE,  # param_0
        "decline_percent": ParamType.HEATMAP_VALUE,   # param_1
        "timestamp": ParamType.TIMESTAMP,
        "total_stocks": ParamType.VOLUME
    },
    
    # Weekly Performance specific mappings
    "weekly_performance": {
        "weekly_change": ParamType.PERCENT_CHANGE,  # param_0
        "current_price": ParamType.PRICE,           # param_1
        "prev_close": ParamType.PREV_CLOSE,         # param_2
        "r_factor": ParamType.R_FACTOR,             # param_3
        "timestamp": ParamType.TIMESTAMP            # param_4
    },
    
    # Breakout specific mappings (10-day/50-day)
    "breakout": {
        "ltp": ParamType.PRICE,           # param_0 - Last Traded Price
        "prev_close": ParamType.PREV_CLOSE,   # param_1 - Previous Close
        "change_percent": ParamType.PERCENT_CHANGE,  # param_2 - % Change
        "sector": ParamType.SECTOR,       # param_3 - Sector
        "date": ParamType.DATE             # param_4 - Date (YYYY-MM-DD)
    },
    
    # Swing Service Custom mappings
    "swing_service": {
        "price_ema_indicator": ParamType.PRICE,           # param_0
        "fib_level_ema_summary": ParamType.FIBONACCI_LEVEL, # param_1
        "institutional_flow": ParamType.INSTITUTIONAL_FLOW, # param_2
        "volume": ParamType.VOLUME,                       # param_3
        "accumulation_date": ParamType.ACCUMULATION       # param_4
    }
}

def get_param_label(param_type: ParamType) -> str:
    """Get human-readable label for a parameter type"""
    return PARAM_LABELS.get(param_type, str(param_type.value))

def get_module_params(module_name: str) -> Dict[str, ParamType]:
    """Get parameter mapping for a specific module"""
    return MODULE_PARAMS.get(module_name, {})
