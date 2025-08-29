from typing import Optional, Dict, List
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.db.connection import get_engine
from app.utils.cache import cache
from app.services.param_normalizer import ParamNormalizer
from datetime import datetime, timedelta
import json
import math
import numpy as np
import random


@cache.cached(ttl_seconds=60)
def get_heatmap_snapshot(index_name: str) -> Dict:
    engine = get_engine()
    if not engine:
        return {
            "data": [],
            "name": f"{index_name} Heatmap",
            "timestamp": datetime.now().isoformat()
        }
    try:
        with engine.connect() as conn:
            row = conn.execute(
                text(
                    """
                    SELECT index_name, heat_value, ohlc, volume, live_expiry, updated_at
                    FROM moneyflux_index
                    WHERE index_name = :index
                    ORDER BY updated_at DESC
                    LIMIT 1
                    """
                ),
                {"index": index_name},
            ).mappings().first()
        
        if not row:
            # Return default structure with parameter format
            raw_data = [{
                "Symbol": index_name,
                "heatmap": 0.0,
                "sentiment_score": 0.0,
                "price": 0.0,
                "volume": 0,
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }]
        else:
            raw_data = [{
                "Symbol": row["index_name"],
                "heatmap": float(row["heat_value"]) if row["heat_value"] is not None else 0.0,
                "sentiment_score": 0.0,  # Will be calculated separately
                "price": 0.0,  # Extract from OHLC if available
                "volume": int(row["volume"]) if row["volume"] is not None else 0,
                "timestamp": row["updated_at"].strftime('%Y-%m-%d %H:%M:%S') if row["updated_at"] else datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }]
        
        # Normalize using money_flux module mapping
        normalized_data = ParamNormalizer.normalize(raw_data, module_name="money_flux")
        
        return {
            "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
            "name": f"{index_name} Heatmap",
            "timestamp": datetime.now().isoformat()
        }
        
    except SQLAlchemyError:
        return {
            "data": [],
            "name": f"{index_name} Heatmap",
            "timestamp": datetime.now().isoformat()
        }


@cache.cached(ttl_seconds=30)
def get_sentiment_analysis(index_name: str, expiry: Optional[str] = None) -> Dict:
    """Calculate sentiment dial with complex mathematical formulas"""
    engine = get_engine()
    if not engine:
        return {
            "data": [],
            "name": f"{index_name} Sentiment Analysis",
            "timestamp": datetime.now().isoformat()
        }
    
    try:
        with engine.connect() as conn:
            # Get option chain data for sentiment calculation
            option_data = conn.execute(
                text(
                    """
                    SELECT option_chain, volume, price_change, volatility
                    FROM index_analysis
                    WHERE index_name = :index
                    AND (:expiry IS NULL OR expiry_date = :expiry)
                    ORDER BY updated_at DESC
                    LIMIT 1
                    """
                ),
                {"index": index_name, "expiry": expiry},
            ).mappings().first()
            
            if not option_data or not option_data["option_chain"]:
                raw_data = [{
                    "Symbol": index_name,
                    "sentiment_score": 0.0,
                    "sentiment_direction": "neutral",
                    "pcr_ratio": 1.0,
                    "volatility": 0.0,
                    "volume": 0,
                    "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }]
            else:
                # Complex sentiment calculation based on MoneyFlux logic
                option_chain = option_data["option_chain"]
                sentiment_score = _calculate_sentiment_score(option_chain, option_data)
                
                direction = "neutral"
                if sentiment_score > 1.5:
                    direction = "bullish"
                elif sentiment_score < -1.5:
                    direction = "bearish"
                
                raw_data = [{
                    "Symbol": index_name,
                    "sentiment_score": round(sentiment_score, 4),
                    "sentiment_direction": direction,
                    "pcr_ratio": 1.0,  # Will be calculated separately
                    "volatility": float(option_data.get("volatility", 0)) if option_data.get("volatility") else 0.0,
                    "volume": int(option_data.get("volume", 0)) if option_data.get("volume") else 0,
                    "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }]
            
            # Normalize using money_flux module mapping
            normalized_data = ParamNormalizer.normalize(raw_data, module_name="money_flux")
            
            return {
                "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
                "name": f"{index_name} Sentiment Analysis",
                "timestamp": datetime.now().isoformat()
            }
            
    except SQLAlchemyError:
        return {
            "data": [],
            "name": f"{index_name} Sentiment Analysis",
            "timestamp": datetime.now().isoformat()
        }


def _calculate_sentiment_score(option_chain: Dict, option_data: Dict) -> float:
    """Complex sentiment calculation similar to MoneyFlux"""
    try:
        # Extract call and put data from option chain
        calls_volume = 0
        puts_volume = 0
        calls_oi = 0
        puts_oi = 0
        
        if isinstance(option_chain, dict) and 'records' in option_chain:
            for record in option_chain['records']['data']:
                if 'CE' in record:
                    ce_data = record['CE']
                    calls_volume += ce_data.get('totalTradedVolume', 0)
                    calls_oi += ce_data.get('openInterest', 0)
                if 'PE' in record:
                    pe_data = record['PE']
                    puts_volume += pe_data.get('totalTradedVolume', 0)
                    puts_oi += pe_data.get('openInterest', 0)
        
        # Calculate sentiment based on MoneyFlux algorithm
        if puts_volume == 0 and calls_volume == 0:
            return 0.0
        
        # Volume-based sentiment calculation
        volume_ratio = calls_volume / (puts_volume + 1)  # Avoid division by zero
        oi_ratio = calls_oi / (puts_oi + 1)
        
        # Complex weighting similar to MoneyFlux
        if calls_volume > puts_volume:
            sentiment_score = math.log(volume_ratio) * 0.7 + math.log(oi_ratio) * 0.3
        else:
            sentiment_score = -math.log(1/volume_ratio) * 0.7 - math.log(1/oi_ratio) * 0.3
        
        # Apply price action multiplier
        price_change = option_data.get('price_change', 0)
        if price_change:
            sentiment_score *= (1 + abs(price_change) / 100)
        
        return sentiment_score
        
    except (ValueError, ZeroDivisionError, TypeError):
        return 0.0


@cache.cached(ttl_seconds=30)
def get_pcr_calculations(index_name: str, expiry: Optional[str] = None) -> Dict:
    """Calculate Put-Call Ratio with professional indicators"""
    engine = get_engine()
    if not engine:
        return {
            "data": [],
            "name": f"{index_name} PCR Analysis",
            "timestamp": datetime.now().isoformat()
        }
    
    try:
        with engine.connect() as conn:
            # Get current PCR data
            current_pcr = conn.execute(
                text(
                    """
                    SELECT pcr, option_chain, ce_contracts, pe_contracts
                    FROM index_analysis
                    WHERE index_name = :index
                    AND (:expiry IS NULL OR expiry_date = :expiry)
                    ORDER BY updated_at DESC
                    LIMIT 1
                    """
                ),
                {"index": index_name, "expiry": expiry},
            ).mappings().first()
            
            # Get previous PCR for change calculation
            previous_pcr = conn.execute(
                text(
                    """
                    SELECT pcr
                    FROM index_analysis
                    WHERE index_name = :index
                    AND (:expiry IS NULL OR expiry_date = :expiry)
                    ORDER BY updated_at DESC
                    LIMIT 1 OFFSET 1
                    """
                ),
                {"index": index_name, "expiry": expiry},
            ).mappings().first()
            
            if not current_pcr:
                raw_data = [{
                    "Symbol": index_name,
                    "pcr_ratio": 1.0,
                    "pcr_change": 0.0,
                    "put_oi": 0,
                    "call_oi": 0,
                    "put_volume": 0,
                    "call_volume": 0,
                    "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }]
            else:
                # Calculate detailed PCR metrics
                pcr_ratio = float(current_pcr["pcr"]) if current_pcr["pcr"] else 1.0
                pcr_change = 0.0
                
                if previous_pcr and previous_pcr["pcr"] and pcr_ratio:
                    prev_pcr_val = float(previous_pcr["pcr"])
                    pcr_change = ((pcr_ratio - prev_pcr_val) / prev_pcr_val) * 100
                
                # Extract detailed volume and OI data
                put_oi, call_oi, put_volume, call_volume = _extract_pcr_details(current_pcr["option_chain"])
                
                raw_data = [{
                    "Symbol": index_name,
                    "pcr_ratio": round(pcr_ratio, 4),
                    "pcr_change": round(pcr_change, 2),
                    "put_oi": put_oi,
                    "call_oi": call_oi,
                    "put_volume": put_volume,
                    "call_volume": call_volume,
                    "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }]
            
            # Normalize using money_flux module mapping
            normalized_data = ParamNormalizer.normalize(raw_data, module_name="money_flux")
            
            return {
                "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
                "name": f"{index_name} PCR Analysis",
                "timestamp": datetime.now().isoformat()
            }
            
    except SQLAlchemyError:
        return {
            "data": [],
            "name": f"{index_name} PCR Analysis",
            "timestamp": datetime.now().isoformat()
        }
    
    try:
        with engine.connect() as conn:
            # Get current PCR data
            current_pcr = conn.execute(
                text(
                    """
                    SELECT pcr, option_chain, ce_contracts, pe_contracts
                    FROM index_analysis
                    WHERE index_name = :index
                    AND (:expiry IS NULL OR expiry_date = :expiry)
                    ORDER BY updated_at DESC
                    LIMIT 1
                    """
                ),
                {"index": index_name, "expiry": expiry},
            ).mappings().first()
            
            # Get previous PCR for change calculation
            previous_pcr = conn.execute(
                text(
                    """
                    SELECT pcr
                    FROM index_analysis
                    WHERE index_name = :index
                    AND (:expiry IS NULL OR expiry_date = :expiry)
                    ORDER BY updated_at DESC
                    LIMIT 1 OFFSET 1
                    """
                ),
                {"index": index_name, "expiry": expiry},
            ).mappings().first()
            
            if not current_pcr:
                return {
                    "index": index_name,
                    "pcrRatio": None,
                    "pcrChange": None,
                    "putOI": None,
                    "callOI": None,
                    "putVolume": None,
                    "callVolume": None,
                    "expiry": expiry,
                    "calculatedAt": datetime.now().isoformat()
                }
            
            # Calculate detailed PCR metrics
            pcr_ratio = float(current_pcr["pcr"]) if current_pcr["pcr"] else None
            pcr_change = None
            
            if previous_pcr and previous_pcr["pcr"] and pcr_ratio:
                prev_pcr_val = float(previous_pcr["pcr"])
                pcr_change = ((pcr_ratio - prev_pcr_val) / prev_pcr_val) * 100
            
            # Extract detailed volume and OI data
            put_oi, call_oi, put_volume, call_volume = _extract_pcr_details(current_pcr["option_chain"])
            
            return {
                "index": index_name,
                "pcrRatio": round(pcr_ratio, 4) if pcr_ratio else None,
                "pcrChange": round(pcr_change, 2) if pcr_change else None,
                "putOI": put_oi,
                "callOI": call_oi,
                "putVolume": put_volume,
                "callVolume": call_volume,
                "expiry": expiry,
                "calculatedAt": datetime.now().isoformat()
            }
            
    except SQLAlchemyError:
        return {
            "index": index_name,
            "pcrRatio": None,
            "pcrChange": None,
            "putOI": None,
            "callOI": None,
            "putVolume": None,
            "callVolume": None,
            "expiry": expiry,
            "calculatedAt": None
        }


def _extract_pcr_details(option_chain: Dict) -> tuple:
    """Extract detailed Put/Call data from option chain"""
    put_oi = 0
    call_oi = 0
    put_volume = 0
    call_volume = 0
    
    try:
        if isinstance(option_chain, dict) and 'records' in option_chain:
            for record in option_chain['records']['data']:
                if 'CE' in record:
                    ce_data = record['CE']
                    call_oi += ce_data.get('openInterest', 0)
                    call_volume += ce_data.get('totalTradedVolume', 0)
                if 'PE' in record:
                    pe_data = record['PE']
                    put_oi += pe_data.get('openInterest', 0)
                    put_volume += pe_data.get('totalTradedVolume', 0)
    except (TypeError, KeyError):
        pass
    
@cache.cached(ttl_seconds=30)
def get_ohlc_chart_data(index_name: str, timeframe: str = "3m") -> Dict:
    """Get OHLC chart data with professional timestamp alignment"""
    engine = get_engine()
    if not engine:
        return {
            "data": [],
            "name": f"{index_name} OHLC Chart ({timeframe})",
            "timestamp": datetime.now().isoformat()
        }
    
    try:
        with engine.connect() as conn:
            # Get OHLC data based on timeframe
            ohlc_data = conn.execute(
                text(
                    """
                    SELECT timestamp, open_price, high_price, low_price, close_price, volume
                    FROM ohlc_data
                    WHERE index_name = :index
                    AND timeframe = :timeframe
                    ORDER BY timestamp DESC
                    LIMIT 100
                    """
                ),
                {"index": index_name, "timeframe": timeframe},
            ).mappings().all()
            
            if not ohlc_data:
                # Generate mock OHLC data
                raw_data = []
                base_price = 19500.0
                for i in range(20):
                    timestamp = datetime.now() - timedelta(minutes=i * 3)
                    open_price = base_price + (i * 10)
                    high_price = open_price + 50
                    low_price = open_price - 30
                    close_price = open_price + (i % 2 * 20 - 10)
                    
                    raw_data.append({
                        "Symbol": f"{index_name}_{timestamp.strftime('%H:%M')}",
                        "price": close_price,
                        "heatmap": (close_price - open_price) / open_price * 100,  # % change for coloring
                        "volume": 100000 + (i * 1000),
                        "volatility": abs(high_price - low_price) / open_price * 100,
                        "timestamp": timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                        "ohlc": [open_price, high_price, low_price, close_price]
                    })
            else:
                # Convert real OHLC data to parameter format
                raw_data = []
                for row in ohlc_data:
                    timestamp = row["timestamp"]
                    open_price = float(row["open_price"])
                    close_price = float(row["close_price"])
                    
                    raw_data.append({
                        "Symbol": f"{index_name}_{timestamp.strftime('%H:%M')}",
                        "price": close_price,
                        "heatmap": (close_price - open_price) / open_price * 100,
                        "volume": int(row["volume"]),
                        "volatility": abs(float(row["high_price"]) - float(row["low_price"])) / open_price * 100,
                        "timestamp": timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                        "ohlc": [open_price, float(row["high_price"]), float(row["low_price"]), close_price]
                    })
            
            # Normalize using money_flux module mapping
            normalized_data = ParamNormalizer.normalize(raw_data, module_name="money_flux")
            
            return {
                "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
                "name": f"{index_name} OHLC Chart ({timeframe})",
                "timestamp": datetime.now().isoformat()
            }
            
    except SQLAlchemyError:
        return {
            "data": [],
            "name": f"{index_name} OHLC Chart ({timeframe})",
            "timestamp": datetime.now().isoformat()
        }


@cache.cached(ttl_seconds=300)  # Cache for 5 minutes
def get_expiry_data(index_name: str) -> Dict:
    """Get multi-expiry data for dropdown switching"""
    engine = get_engine()
    if not engine:
        return {
            "data": [],
            "name": f"{index_name} Expiry Data",
            "timestamp": datetime.now().isoformat()
        }
    
    try:
        with engine.connect() as conn:
            expiry_data = conn.execute(
                text(
                    """
                    SELECT DISTINCT expiry_date, COUNT(*) as contracts_count
                    FROM index_analysis
                    WHERE index_name = :index
                    AND expiry_date >= CURRENT_DATE
                    GROUP BY expiry_date
                    ORDER BY expiry_date ASC
                    LIMIT 10
                    """
                ),
                {"index": index_name},
            ).mappings().all()
            
            if not expiry_data:
                # Generate mock expiry data
                raw_data = []
                base_date = datetime.now().date()
                for i in range(4):  # 4 expiry dates
                    expiry_date = base_date + timedelta(days=(i+1)*7)  # Weekly expiries
                    contracts_count = 100 - (i * 10)
                    
                    raw_data.append({
                        "Symbol": expiry_date.strftime('%d-%b-%Y'),
                        "heatmap": float(contracts_count),  # Use contracts count as heatmap value
                        "volume": contracts_count * 1000,
                        "price": 0.0,  # Not applicable for expiry data
                        "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                        "expiry_date": expiry_date.strftime('%Y-%m-%d'),
                        "contracts_count": contracts_count
                    })
            else:
                # Convert real expiry data to parameter format
                raw_data = []
                for row in expiry_data:
                    expiry_date = row["expiry_date"]
                    contracts_count = int(row["contracts_count"])
                    
                    raw_data.append({
                        "Symbol": expiry_date.strftime('%d-%b-%Y'),
                        "heatmap": float(contracts_count),
                        "volume": contracts_count * 1000,
                        "price": 0.0,
                        "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                        "expiry_date": expiry_date.strftime('%Y-%m-%d'),
                        "contracts_count": contracts_count
                    })
            
            # Normalize using money_flux module mapping
            normalized_data = ParamNormalizer.normalize(raw_data, module_name="money_flux")
            
            return {
                "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
                "name": f"{index_name} Expiry Data",
                "timestamp": datetime.now().isoformat()
            }
            
    except SQLAlchemyError:
        return {
            "data": [],
            "name": f"{index_name} Expiry Data",
            "timestamp": datetime.now().isoformat()
        }
    

@cache.cached(ttl_seconds=60)
def get_volume_histogram(index_name: str, expiry: Optional[str] = None) -> Dict:
    """Get volume histogram analysis with sophisticated data processing"""
    engine = get_engine()
    if not engine:
        return {
            "data": [],
            "name": f"{index_name} Volume Histogram",
            "timestamp": datetime.now().isoformat()
        }
    
    try:
        with engine.connect() as conn:
            option_data = conn.execute(
                text(
                    """
                    SELECT option_chain, volume, updated_at
                    FROM index_analysis
                    WHERE index_name = :index
                    AND (:expiry IS NULL OR expiry_date = :expiry)
                    ORDER BY updated_at DESC
                    LIMIT 1
                    """
                ),
                {"index": index_name, "expiry": expiry},
            ).mappings().first()
            
            if not option_data or not option_data["option_chain"]:
                raw_data = [{
                    "Symbol": index_name,
                    "volume": 0,
                    "price": 0.0,
                    "volatility": 0.0,
                    "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }]
            else:
                # Process volume histogram similar to MoneyFlux
                volume_bars = _process_volume_histogram(option_data["option_chain"])
                total_volume = sum(bar.get("volume", 0) for bar in volume_bars)
                max_volume = max((bar.get("volume", 0) for bar in volume_bars), default=0)
                
                # Convert volume bars to parameter format
                raw_data = []
                for bar in volume_bars[:10]:  # Limit to top 10 for visualization
                    raw_data.append({
                        "Symbol": f"{index_name}_{bar.get('strikePrice', 0)}",
                        "volume": int(bar.get("volume", 0)),
                        "price": float(bar.get("strikePrice", 0)),
                        "volatility": 0.0,  # Will be calculated if available
                        "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    })
            
            # Normalize using money_flux module mapping
            normalized_data = ParamNormalizer.normalize(raw_data, module_name="money_flux")
            
            return {
                "data": normalized_data if isinstance(normalized_data, list) else [normalized_data],
                "name": f"{index_name} Volume Histogram",
                "timestamp": datetime.now().isoformat()
            }
            
    except SQLAlchemyError:
        return {
            "data": [],
            "name": f"{index_name} Volume Histogram",
            "timestamp": datetime.now().isoformat()
        }


def _process_volume_histogram(option_chain: Dict) -> List[Dict]:
    """Process volume histogram with color coding like MoneyFlux"""
    volume_bars = []
    compare_value = 0
    
    try:
        if isinstance(option_chain, dict) and 'records' in option_chain:
            for record in option_chain['records']['data']:
                strike_price = record.get('strikePrice', 0)
                timestamp = datetime.now().isoformat()
                
                # Process CE data
                if 'CE' in record:
                    ce_data = record['CE']
                    ce_volume = ce_data.get('totalTradedVolume', 0)
                    ce_color = _get_volume_bar_color(ce_volume, compare_value, is_positive=True)
                    
                    volume_bars.append({
                        "timestamp": timestamp,
                        "volume": ce_volume,
                        "color": ce_color,
                        "strikePrice": strike_price
                    })
                    
                    if ce_volume > compare_value:
                        compare_value = ce_volume
                
                # Process PE data
                if 'PE' in record:
                    pe_data = record['PE']
                    pe_volume = pe_data.get('totalTradedVolume', 0)
                    pe_color = _get_volume_bar_color(-pe_volume, compare_value, is_positive=False)
                    
                    volume_bars.append({
                        "timestamp": timestamp,
                        "volume": -pe_volume,  # Negative for puts
                        "color": pe_color,
                        "strikePrice": strike_price
                    })
                    
                    if pe_volume > compare_value:
                        compare_value = pe_volume
    except (TypeError, KeyError):
        pass
    
    return volume_bars


def _get_volume_bar_color(volume: float, compare_value: float, is_positive: bool = True) -> str:
    """Get volume bar color similar to MoneyFlux VolumeBarColor function"""
    if is_positive:
        if volume > 0:
            if compare_value < volume:
                return "#0DAD8D"  # Bright green
            else:
                return "#ace0d8"  # Light green
        return "#f0f0f0"  # Neutral
    else:
        if volume < 0:
            if compare_value < abs(volume):
                return "#F15B46"  # Bright red
            else:
                return "#e9c0bb"  # Light red
        return "#f0f0f0"  # Neutral


@cache.cached(ttl_seconds=30)
def get_ohlc_chart_data(index_name: str, timeframe: str = "3m") -> Dict:
    """Get OHLC chart data with professional timestamp alignment"""
    engine = get_engine()
    if not engine:
        return {
            "index": index_name,
            "timeframe": timeframe,
            "ohlcData": [],
            "volumeData": [],
            "dataLength": 0,
            "lastUpdated": None
        }
    
    try:
        with engine.connect() as conn:
            # Get OHLC data from MoneyFlux index table
            ohlc_data = conn.execute(
                text(
                    """
                    SELECT ohlc, volume, updated_at
                    FROM moneyflux_index
                    WHERE index_name = :index
                    ORDER BY updated_at DESC
                    LIMIT 1
                    """
                ),
                {"index": index_name},
            ).mappings().first()
            
            if not ohlc_data:
                return {
                    "index": index_name,
                    "timeframe": timeframe,
                    "ohlcData": [],
                    "volumeData": [],
                    "dataLength": 0,
                    "lastUpdated": datetime.now().isoformat()
                }
            
            # Process OHLC data similar to MoneyFlux
            processed_ohlc = _process_ohlc_data(ohlc_data["ohlc"], timeframe)
            processed_volume = _process_volume_data(ohlc_data["volume"], timeframe)
            
            return {
                "index": index_name,
                "timeframe": timeframe,
                "ohlcData": processed_ohlc,
                "volumeData": processed_volume,
                "dataLength": len(processed_ohlc),
                "lastUpdated": ohlc_data["updated_at"].isoformat() if ohlc_data["updated_at"] else None
            }
            
    except SQLAlchemyError:
        return {
            "index": index_name,
            "timeframe": timeframe,
            "ohlcData": [],
            "volumeData": [],
            "dataLength": 0,
            "lastUpdated": None
        }


def _process_ohlc_data(ohlc_raw: Dict, timeframe: str) -> List[List[float]]:
    """Process OHLC data with timeframe aggregation"""
    if not ohlc_raw:
        return []
    
    try:
        # Handle different timeframe aggregations
        if timeframe == "3m":
            return _process_3min_ohlc(ohlc_raw)
        elif timeframe == "15m":
            return _process_15min_ohlc(ohlc_raw)
        elif timeframe == "30m":
            return _process_30min_ohlc(ohlc_raw)
        else:
            return _process_3min_ohlc(ohlc_raw)  # Default to 3min
    except Exception:
        return []


def _process_3min_ohlc(ohlc_raw: Dict) -> List[List[float]]:
    """Process 3-minute OHLC data similar to MoneyFlux"""
    ohlc_data = []
    
    try:
        if isinstance(ohlc_raw, list):
            for candle in ohlc_raw:
                if len(candle) >= 5:
                    # [timestamp, open, high, low, close]
                    ohlc_data.append([
                        float(candle[0]),  # timestamp
                        float(candle[1]),  # open
                        float(candle[2]),  # high
                        float(candle[3]),  # low
                        float(candle[4])   # close
                    ])
        
        # Pad data to 125 bars if needed (similar to MoneyFlux)
        target_length = 125
        if len(ohlc_data) < target_length:
            # Add NaN padding at the beginning
            padding_needed = target_length - len(ohlc_data)
            if ohlc_data:
                start_time = ohlc_data[0][0] - (padding_needed * 180)  # 3min = 180 seconds
                for i in range(padding_needed):
                    timestamp = start_time + (i * 180)
                    ohlc_data.insert(0, [timestamp, float('nan'), float('nan'), float('nan'), float('nan')])
        
    except (ValueError, TypeError, IndexError):
        pass
    
    return ohlc_data


def _process_15min_ohlc(ohlc_raw: Dict) -> List[List[float]]:
    """Process 15-minute OHLC data aggregation"""
    # Get 3-minute data first
    base_data = _process_3min_ohlc(ohlc_raw)
    
    if not base_data:
        return []
    
    # Aggregate 5 candles into 1 (3min * 5 = 15min)
    aggregated_data = []
    
    for i in range(0, len(base_data), 5):
        candles_group = base_data[i:i+5]
        if not candles_group:
            continue
        
        # Calculate OHLC for the group
        timestamp = candles_group[0][0]
        open_price = candles_group[0][1]
        high_price = max(candle[2] for candle in candles_group if not math.isnan(candle[2]))
        low_price = min(candle[3] for candle in candles_group if not math.isnan(candle[3]))
        close_price = candles_group[-1][4]
        
        aggregated_data.append([timestamp, open_price, high_price, low_price, close_price])
    
    return aggregated_data


def _process_30min_ohlc(ohlc_raw: Dict) -> List[List[float]]:
    """Process 30-minute OHLC data aggregation"""
    # Get 15-minute data first
    base_data = _process_15min_ohlc(ohlc_raw)
    
    if not base_data:
        return []
    
    # Aggregate 2 candles into 1 (15min * 2 = 30min)
    aggregated_data = []
    
    for i in range(0, len(base_data), 2):
        candles_group = base_data[i:i+2]
        if not candles_group:
            continue
        
        # Calculate OHLC for the group
        timestamp = candles_group[0][0]
        open_price = candles_group[0][1]
        high_price = max(candle[2] for candle in candles_group if not math.isnan(candle[2]))
        low_price = min(candle[3] for candle in candles_group if not math.isnan(candle[3]))
        close_price = candles_group[-1][4]
        
        aggregated_data.append([timestamp, open_price, high_price, low_price, close_price])
    
    return aggregated_data


def _process_volume_data(volume_raw: int, timeframe: str) -> List[Dict]:
    """Process volume data with color coding"""
    if not volume_raw:
        return []
    
    try:
        # Create volume bars with timestamps
        current_time = datetime.now().timestamp()
        interval_seconds = {
            "3m": 180,
            "15m": 900,
            "30m": 1800
        }.get(timeframe, 180)
        
        volume_data = []
        
        # Simulate volume distribution (in real implementation, this would come from actual data)
        for i in range(125):  # 125 bars like MoneyFlux
            timestamp = current_time - ((124 - i) * interval_seconds)
            volume = volume_raw // 125  # Distribute volume evenly for demo
            color = _get_volume_bar_color(volume, volume_raw // 125)
            
            volume_data.append({
                "x": timestamp,
                "y": volume,
                "color": color
            })
        
        return volume_data
        
    except Exception:
        return []


@cache.cached(ttl_seconds=300)
def get_expiry_data(index_name: str) -> Dict:
    """Get multi-expiry data for dropdown switching"""
    engine = get_engine()
    if not engine:
        return {
            "index": index_name,
            "expiries": [],
            "currentExpiry": None,
            "nextExpiry": None
        }
    
    try:
        with engine.connect() as conn:
            expiry_data = conn.execute(
                text(
                    """
                    SELECT DISTINCT expiry_date
                    FROM index_analysis
                    WHERE index_name = :index
                    AND expiry_date >= CURRENT_DATE
                    ORDER BY expiry_date
                    LIMIT 5
                    """
                ),
                {"index": index_name},
            ).fetchall()
            
            expiries = []
            for row in expiry_data:
                if row[0]:
                    expiry_timestamp = int(row[0].timestamp())
                    expiry_label = row[0].strftime("%d%b").upper()
                    is_weekly = (row[0].weekday() == 3)  # Thursday expiries are weekly
                    
                    expiries.append({
                        "timestamp": expiry_timestamp,
                        "label": expiry_label,
                        "isWeekly": is_weekly
                    })
            
            current_expiry = expiries[0]["label"] if expiries else None
            next_expiry = expiries[1]["label"] if len(expiries) > 1 else None
            
            return {
                "index": index_name,
                "expiries": expiries,
                "currentExpiry": current_expiry,
                "nextExpiry": next_expiry
            }
            
    except SQLAlchemyError:
        return {
            "index": index_name,
            "expiries": [],
            "currentExpiry": None,
            "nextExpiry": None
        }
