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
    
    # Technical indicators (100-199)
    RSI = "param_100"
    MACD = "param_101"
    BOLLINGER_UPPER = "param_102"
    BOLLINGER_LOWER = "param_103"
    
    # Volume indicators (200-299)
    VOLUME_AVG_20D = "param_200"
    VOLUME_SPIKE = "param_201"
    
    # Money flow (300-399)
    MONEY_FLOW = "param_300"
    RELATIVE_FLOW = "param_301"
    FII_NET = "param_302"
    DII_NET = "param_303"
    TOTAL_NET = "param_304"
    FLOW_RATIO = "param_305"
    
    # Swing analysis (400-499)
    SWING_HIGH = "param_400"
    SWING_LOW = "param_401"
    SWING_STRENGTH = "param_402"

# Human-readable labels for each parameter
PARAM_LABELS: Dict[ParamType, str] = {
    # Common parameters
    ParamType.PRICE: "Last Traded Price",
    ParamType.PREV_CLOSE: "Previous Close",
    ParamType.PERCENT_CHANGE: "% Change",
    ParamType.R_FACTOR: "R-Factor",
    ParamType.TIMESTAMP: "Timestamp",
    ParamType.VOLUME: "Volume",
    
    # Technical indicators
    ParamType.RSI: "RSI (14)",
    ParamType.MACD: "MACD",
    ParamType.BOLLINGER_UPPER: "Bollinger Upper",
    ParamType.BOLLINGER_LOWER: "Bollinger Lower",
    
    # Volume indicators
    ParamType.VOLUME_AVG_20D: "20-Day Avg Volume",
    ParamType.VOLUME_SPIKE: "Volume Spike %",
    
    # Money flow
    ParamType.MONEY_FLOW: "Money Flow",
    ParamType.RELATIVE_FLOW: "Relative Flow",
    ParamType.FII_NET: "FII Net (Cr)",
    ParamType.DII_NET: "DII Net (Cr)",
    ParamType.TOTAL_NET: "Total Net (Cr)",
    ParamType.FLOW_RATIO: "Flow Ratio (FII/DII)",
    
    # Swing analysis
    ParamType.SWING_HIGH: "Swing High",
    ParamType.SWING_LOW: "Swing Low",
    ParamType.SWING_STRENGTH: "Swing Strength"
}

# Module-specific parameter mappings
MODULE_PARAMS = {
    "swing_center": {
        "primary": ParamType.PERCENT_CHANGE,
        "secondary": ParamType.VOLUME_SPIKE,
        "timestamp": ParamType.TIMESTAMP
    },
    "fii_dii": {
        "fii_net": ParamType.FII_NET,
        "dii_net": ParamType.DII_NET,
        "total_net": ParamType.TOTAL_NET,
        "flow_ratio": ParamType.FLOW_RATIO,
        "timestamp": ParamType.TIMESTAMP,
        "fii_buy": ParamType.MONEY_FLOW,
        "fii_sell": ParamType.MONEY_FLOW,
        "dii_buy": ParamType.MONEY_FLOW,
        "dii_sell": ParamType.MONEY_FLOW
    },
    "sectorial_flow": {
        "price": ParamType.PRICE,
        "change": ParamType.PERCENT_CHANGE,
        "volume": ParamType.VOLUME,
        "r_factor": ParamType.R_FACTOR,
        "timestamp": ParamType.TIMESTAMP
    }
}

def get_param_label(param_type: ParamType) -> str:
    """Get human-readable label for a parameter type"""
    return PARAM_LABELS.get(param_type, str(param_type.value))

def get_module_params(module_name: str) -> Dict[str, ParamType]:
    """Get parameter mapping for a specific module"""
    return MODULE_PARAMS.get(module_name, {})
