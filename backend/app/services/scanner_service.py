"""
Scanner Service - Delivery Scanner Implementation

This service provides delivery-based scanner functionality with data
returned in the unified parameter format.

Scanner Parameter Format:
- Symbol: Stock identifier
- param_0: Last Trading Price (LTP)
- param_1: Previous Close Price
- param_2: Volume (HD) / Average Delivery % (DSP)
- param_3: Average Delivery % (HD) / Current Delivery % (DSP)
- param_4: DateTime (YYYY-MM-DD HH:mm:ss)
"""

from typing import Dict, List, Any
from datetime import datetime, timedelta
import random
from app.services.param_normalizer import ParamNormalizer


def generate_highest_delivery_data(segment: str = "fno") -> List[Dict]:
    """
    Generate highest delivery scanner data
    
    Args:
        segment: 'fno' for F&O stocks, 'n500' for Nifty 500
        
    Returns:
        List of stocks with highest delivery percentages in param format
    """
    # Sample symbols based on segment
    if segment == "fno":
        symbols = [
            "RELIANCE", "TCS", "HDFCBANK", "INFY", "HINDUNILVR",
            "ICICIBANK", "SBIN", "BHARTIARTL", "ITC", "KOTAKBANK",
            "LT", "AXISBANK", "ASIANPAINT", "MARUTI", "NESTLEIND",
            "BAJFINANCE", "HCLTECH", "WIPRO", "ULTRACEMCO", "TITAN"
        ]
    else:  # n500
        symbols = [
            "ADANIPORTS", "BAJAJFINSV", "DRREDDY", "GRASIM", "HEROMOTOCO",
            "JSWSTEEL", "NTPC", "ONGC", "POWERGRID", "SUNPHARMA",
            "TATAMOTORS", "TATASTEEL", "TECHM", "VEDL", "COALINDIA",
            "CIPLA", "BPCL", "IOC", "GAIL", "HINDALCO"
        ]
    
    scanner_data = []
    base_time = datetime.now()
    
    for i, symbol in enumerate(symbols):
        # Generate realistic stock data
        base_price = random.uniform(100, 3000)
        ltp = base_price + random.uniform(-50, 50)
        prev_close = ltp + random.uniform(-20, 20)
        volume = random.randint(100000, 10000000)
        delivery_pct = random.uniform(30, 85)  # High delivery percentage
        avg_delivery_pct = delivery_pct - random.uniform(5, 15)  # Average is lower
        
        # Create data in parameter format
        stock_data = {
            "Symbol": symbol,
            "param_0": round(ltp, 2),  # LTP
            "param_1": round(prev_close, 2),  # Previous Close
            "param_2": volume,  # Volume
            "param_3": round(avg_delivery_pct, 2),  # Average Delivery %
            "param_4": (base_time - timedelta(minutes=i*5)).strftime('%Y-%m-%d %H:%M:%S'),  # DateTime
            
            # Additional fields for calculations
            "current_delivery_pct": round(delivery_pct, 2),
            "price_change": round(((ltp - prev_close) / prev_close) * 100, 2)
        }
        
        scanner_data.append(stock_data)
    
    # Sort by delivery percentage (descending)
    scanner_data.sort(key=lambda x: x["current_delivery_pct"], reverse=True)
    
    return scanner_data


def generate_delivery_spike_data(segment: str = "fno") -> List[Dict]:
    """
    Generate delivery spike scanner data
    
    Args:
        segment: 'fno' for F&O stocks, 'n500' for Nifty 500
        
    Returns:
        List of stocks with delivery spikes in param format
    """
    # Sample symbols based on segment
    if segment == "fno":
        symbols = [
            "ADANIGREEN", "ADANITRANS", "APOLLOHOSP", "BAJAJ-AUTO", "BRITANNIA",
            "DIVISLAB", "EICHERMOT", "GRASIM", "HINDALCO", "INDUSINDBK",
            "JSWSTEEL", "M&M", "NTPC", "ONGC", "POWERGRID",
            "SHREECEM", "TATAMOTORS", "TATASTEEL", "UPL", "VEDL"
        ]
    else:  # n500
        symbols = [
            "ACC", "ADANIPORTS", "AMARAJABAT", "AMBUJACEM", "APOLLOTYRE",
            "ASHOKLEY", "AUROPHARMA", "BAJAJHLDNG", "BALKRISIND", "BANDHANBNK",
            "BATAINDIA", "BEL", "BERGEPAINT", "BIOCON", "BOSCHLTD",
            "BPCL", "CADILAHC", "CANBK", "CHOLAFIN", "COLPAL"
        ]
    
    scanner_data = []
    base_time = datetime.now()
    
    for i, symbol in enumerate(symbols):
        # Generate data showing delivery spike
        base_price = random.uniform(50, 2000)
        ltp = base_price + random.uniform(-30, 30)
        prev_close = ltp + random.uniform(-15, 15)
        
        # Delivery spike characteristics
        avg_delivery_pct = random.uniform(20, 40)  # Normal average
        current_delivery_pct = avg_delivery_pct + random.uniform(15, 45)  # Significant spike
        increase_in_delivery = current_delivery_pct - avg_delivery_pct
        
        # Create data in parameter format
        stock_data = {
            "Symbol": symbol,
            "param_0": round(ltp, 2),  # LTP
            "param_1": round(prev_close, 2),  # Previous Close
            "param_2": round(avg_delivery_pct, 2),  # Average Delivery %
            "param_3": round(current_delivery_pct, 2),  # Current Delivery %
            "param_4": (base_time - timedelta(minutes=i*3)).strftime('%Y-%m-%d %H:%M:%S'),  # DateTime
            
            # Additional fields for calculations
            "delivery_increase": round(increase_in_delivery, 2),
            "price_change": round(((ltp - prev_close) / prev_close) * 100, 2)
        }
        
        scanner_data.append(stock_data)
    
    # Sort by delivery increase (descending)
    scanner_data.sort(key=lambda x: x["delivery_increase"], reverse=True)
    
    return scanner_data


async def get_scanner_data(scan_type: str, segment: str) -> List[Dict]:
    """
    Get scanner data based on type and segment
    
    Args:
        scan_type: 'hd' for highest delivery, 'dsp' for delivery spike
        segment: 'fno' for F&O, 'n500' for Nifty 500
        
    Returns:
        List of scanner data in parameter format
    """
    try:
        if scan_type == "hd":
            return generate_highest_delivery_data(segment)
        elif scan_type == "dsp":
            return generate_delivery_spike_data(segment)
        else:
            raise ValueError(f"Unknown scan type: {scan_type}")
            
    except Exception as e:
        print(f"Error generating scanner data: {e}")
        return []


# Service functions for API endpoints
async def get_hd_data_fno() -> List[Dict]:
    """Get highest delivery data for F&O segment"""
    return await get_scanner_data("hd", "fno")


async def get_hd_data_n500() -> List[Dict]:
    """Get highest delivery data for Nifty 500 segment"""
    return await get_scanner_data("hd", "n500")


async def get_dsp_data_fno() -> List[Dict]:
    """Get delivery spike data for F&O segment"""
    return await get_scanner_data("dsp", "fno")


async def get_dsp_data_n500() -> List[Dict]:
    """Get delivery spike data for Nifty 500 segment"""
    return await get_scanner_data("dsp", "n500")


async def get_hd_hist() -> List[Dict]:
    """
    Get historical high delivery data
    
    Returns:
        List of historical delivery data in parameter format
    """
    try:
        # Generate sample historical data for demonstration
        historical_data = []
        base_time = datetime.now()
        
        symbols = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK"]
        
        for i, symbol in enumerate(symbols):
            # Generate historical data for last 5 days
            for days_back in range(5):
                date_str = (base_time - timedelta(days=days_back)).strftime('%Y-%m-%d')
                base_price = random.uniform(100, 3000)
                ltp = base_price + random.uniform(-50, 50)
                prev_close = ltp + random.uniform(-20, 20)
                delivery_pct = random.uniform(25, 80)
                
                hist_data = {
                    "Symbol": symbol,
                    "param_0": round(ltp, 2),  # LTP
                    "param_1": round(prev_close, 2),  # Previous Close
                    "param_2": random.randint(50000, 5000000),  # Volume
                    "param_3": round(delivery_pct, 2),  # Delivery %
                    "param_4": date_str,  # Date
                }
                
                historical_data.append(hist_data)
        
        # Sort by date (most recent first)
        historical_data.sort(key=lambda x: x["param_4"], reverse=True)
        
        return historical_data
        
    except Exception as e:
        print(f"Error generating historical delivery data: {e}")
        return []