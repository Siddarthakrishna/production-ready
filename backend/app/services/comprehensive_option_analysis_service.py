"""
Comprehensive Index Option Chain Analysis Service
Provides detailed option chain analysis for all supported indices
"""

from typing import Dict, List, Optional
import random
import math
from datetime import datetime, timedelta
from app.services.param_normalizer import ParamNormalizer


def get_comprehensive_option_chain_analysis(index_name: str, expiry: Optional[str] = None) -> Dict:
    """Generate comprehensive option chain analysis for all supported indices"""
    
    # Generate realistic option chain data
    option_chain_data = _generate_option_chain_data(index_name)
    
    # Perform comprehensive analysis
    analysis_results = _analyze_option_chain(option_chain_data, index_name)
    
    # Normalize results using parameter system
    normalized_data = ParamNormalizer.normalize(analysis_results, module_name="index_analysis")
    
    return {
        "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
        "name": f"{index_name} Option Chain Analysis",
        "timestamp": datetime.now().isoformat(),
        "index": index_name,
        "expiry": expiry or "Current",
        "analysis_type": "comprehensive"
    }


def _generate_option_chain_data(index_name: str) -> Dict:
    """Generate realistic option chain data for analysis"""
    
    # Base index prices for different indices
    index_prices = {
        "NIFTY50": 19500,
        "BANKNIFTY": 44000,
        "FINNIFTY": 19800,
        "MIDCAP": 9500,
        "SENSEX": 65000
    }
    
    base_price = index_prices.get(index_name, 19500)
    
    # Generate option strikes around current price
    strikes = []
    strike_gap = 50 if index_name in ["NIFTY50", "FINNIFTY"] else 100
    start_strike = base_price - (10 * strike_gap)
    
    for i in range(21):  # 21 strikes
        strike = start_strike + (i * strike_gap)
        
        # Calculate option prices (simplified Black-Scholes approximation)
        call_price = max(0, base_price - strike) + random.uniform(0, 50)
        put_price = max(0, strike - base_price) + random.uniform(0, 50)
        
        # Generate volume and OI data
        call_volume = random.randint(0, 100000)
        put_volume = random.randint(0, 100000)
        call_oi = random.randint(0, 500000)
        put_oi = random.randint(0, 500000)
        
        strikes.append({
            "strike": strike,
            "call_price": round(call_price, 2),
            "put_price": round(put_price, 2),
            "call_volume": call_volume,
            "put_volume": put_volume,
            "call_oi": call_oi,
            "put_oi": put_oi,
            "call_iv": random.uniform(15, 45),  # Implied Volatility
            "put_iv": random.uniform(15, 45)
        })
    
    return {
        "current_price": base_price,
        "strikes": strikes,
        "total_call_volume": sum(s["call_volume"] for s in strikes),
        "total_put_volume": sum(s["put_volume"] for s in strikes),
        "total_call_oi": sum(s["call_oi"] for s in strikes),
        "total_put_oi": sum(s["put_oi"] for s in strikes)
    }


def _analyze_option_chain(chain_data: Dict, index_name: str) -> List[Dict]:
    """Perform comprehensive analysis on option chain data"""
    
    analysis_results = []
    current_price = chain_data["current_price"]
    strikes = chain_data["strikes"]
    
    # 1. PCR Analysis
    total_put_oi = chain_data["total_put_oi"]
    total_call_oi = chain_data["total_call_oi"]
    pcr_oi = total_put_oi / max(1, total_call_oi)
    
    total_put_volume = chain_data["total_put_volume"]
    total_call_volume = chain_data["total_call_volume"]
    pcr_volume = total_put_volume / max(1, total_call_volume)
    
    analysis_results.append({
        "Symbol": f"{index_name}_PCR_ANALYSIS",
        "analysis_type": "PCR",
        "oi_pcr": round(pcr_oi, 4),
        "volume_pcr": round(pcr_volume, 4),
        "interpretation": _interpret_pcr(pcr_oi),
        "strength": abs(pcr_oi - 1.0) * 10,  # Strength of signal
        "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })
    
    # 2. Max Pain Analysis
    max_pain_strike = _calculate_max_pain(strikes, current_price)
    distance_from_max_pain = ((current_price - max_pain_strike) / current_price) * 100
    
    analysis_results.append({
        "Symbol": f"{index_name}_MAX_PAIN",
        "analysis_type": "MAX_PAIN",
        "max_pain_strike": max_pain_strike,
        "current_price": current_price,
        "distance_percent": round(distance_from_max_pain, 2),
        "direction_bias": "Bearish" if distance_from_max_pain > 2 else "Bullish" if distance_from_max_pain < -2 else "Neutral",
        "strength": abs(distance_from_max_pain),
        "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })
    
    # 3. Support/Resistance Analysis
    support_levels, resistance_levels = _find_support_resistance(strikes, current_price)
    
    analysis_results.append({
        "Symbol": f"{index_name}_SUPPORT_RESISTANCE",
        "analysis_type": "SUPPORT_RESISTANCE",
        "immediate_support": support_levels[0] if support_levels else current_price * 0.98,
        "immediate_resistance": resistance_levels[0] if resistance_levels else current_price * 1.02,
        "strong_support": support_levels[1] if len(support_levels) > 1 else current_price * 0.95,
        "strong_resistance": resistance_levels[1] if len(resistance_levels) > 1 else current_price * 1.05,
        "strength": random.uniform(6, 9),
        "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })
    
    # 4. Volatility Analysis
    avg_iv_call = sum(s["call_iv"] for s in strikes) / len(strikes)
    avg_iv_put = sum(s["put_iv"] for s in strikes) / len(strikes)
    
    analysis_results.append({
        "Symbol": f"{index_name}_VOLATILITY",
        "analysis_type": "VOLATILITY",
        "avg_call_iv": round(avg_iv_call, 2),
        "avg_put_iv": round(avg_iv_put, 2),
        "iv_skew": round(avg_put_iv - avg_iv_call, 2),
        "volatility_regime": "High" if avg_iv_call > 25 else "Medium" if avg_iv_call > 18 else "Low",
        "strength": avg_iv_call / 5,  # Normalize to 0-10 scale
        "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })
    
    # 5. Greeks Analysis (simplified)
    gamma_exposure = _calculate_gamma_exposure(strikes, current_price)
    delta_analysis = _calculate_delta_analysis(strikes, current_price)
    
    analysis_results.append({
        "Symbol": f"{index_name}_GREEKS",
        "analysis_type": "GREEKS",
        "total_gamma_exposure": round(gamma_exposure, 2),
        "net_delta": round(delta_analysis["net_delta"], 2),
        "call_delta_weighted": round(delta_analysis["call_delta_weighted"], 2),
        "put_delta_weighted": round(delta_analysis["put_delta_weighted"], 2),
        "gamma_level": "High" if abs(gamma_exposure) > 1000 else "Medium" if abs(gamma_exposure) > 500 else "Low",
        "strength": min(10, abs(gamma_exposure) / 100),
        "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })
    
    return analysis_results


def _interpret_pcr(pcr_value: float) -> str:
    """Interpret PCR ratio for market sentiment"""
    if pcr_value > 1.2:
        return "Bearish (High Put Activity)"
    elif pcr_value < 0.8:
        return "Bullish (High Call Activity)"
    else:
        return "Neutral (Balanced Activity)"


def _calculate_max_pain(strikes: List[Dict], current_price: float) -> float:
    """Calculate max pain point"""
    max_pain_data = []
    
    for strike_data in strikes:
        strike = strike_data["strike"]
        total_pain = 0
        
        # Calculate pain for this strike price
        for other_strike in strikes:
            other_price = other_strike["strike"]
            call_oi = other_strike["call_oi"]
            put_oi = other_strike["put_oi"]
            
            # ITM calls lose money
            if other_price < strike:
                total_pain += call_oi * (strike - other_price)
            
            # ITM puts lose money  
            if other_price > strike:
                total_pain += put_oi * (other_price - strike)
        
        max_pain_data.append({"strike": strike, "total_pain": total_pain})
    
    # Find strike with minimum total pain
    min_pain_strike = min(max_pain_data, key=lambda x: x["total_pain"])
    return min_pain_strike["strike"]


def _find_support_resistance(strikes: List[Dict], current_price: float) -> tuple:
    """Find support and resistance levels based on OI"""
    
    # Sort strikes by total OI (call + put)
    strikes_by_oi = sorted(strikes, key=lambda x: x["call_oi"] + x["put_oi"], reverse=True)
    
    supports = []
    resistances = []
    
    for strike_data in strikes_by_oi[:10]:  # Top 10 OI strikes
        strike = strike_data["strike"]
        if strike < current_price:
            supports.append(strike)
        elif strike > current_price:
            resistances.append(strike)
    
    return sorted(supports, reverse=True)[:3], sorted(resistances)[:3]


def _calculate_gamma_exposure(strikes: List[Dict], current_price: float) -> float:
    """Calculate simplified gamma exposure"""
    total_gamma = 0
    
    for strike_data in strikes:
        strike = strike_data["strike"]
        call_oi = strike_data["call_oi"]
        put_oi = strike_data["put_oi"]
        
        # Simplified gamma calculation
        moneyness = abs(strike - current_price) / current_price
        gamma = math.exp(-moneyness * 5) * 0.01  # Simplified gamma curve
        
        # Net gamma exposure
        net_oi = call_oi - put_oi  # Calls positive, puts negative
        total_gamma += net_oi * gamma
    
    return total_gamma


def _calculate_delta_analysis(strikes: List[Dict], current_price: float) -> Dict:
    """Calculate delta-weighted analysis"""
    call_delta_weighted = 0
    put_delta_weighted = 0
    
    for strike_data in strikes:
        strike = strike_data["strike"]
        call_oi = strike_data["call_oi"]
        put_oi = strike_data["put_oi"]
        
        # Simplified delta calculation
        if strike <= current_price:
            call_delta = 0.5 + ((current_price - strike) / current_price) * 0.4
            put_delta = -0.5 - ((current_price - strike) / current_price) * 0.4
        else:
            call_delta = 0.5 - ((strike - current_price) / current_price) * 0.4
            put_delta = -0.5 + ((strike - current_price) / current_price) * 0.4
        
        call_delta_weighted += call_oi * max(0, min(1, call_delta))
        put_delta_weighted += put_oi * min(0, max(-1, put_delta))
    
    return {
        "call_delta_weighted": call_delta_weighted,
        "put_delta_weighted": put_delta_weighted,
        "net_delta": call_delta_weighted + put_delta_weighted
    }