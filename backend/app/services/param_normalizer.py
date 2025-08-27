"""
Unified Param System Normalizer for Sharada Research

This module provides utilities to normalize all data formats into the unified param structure:
- param_0: Last Trading Price (LTP) 
- param_1: Previous Close Price
- param_2: % Change from previous close
- param_3: R-Factor (momentum / relative factor)
- param_4: DateTime (YYYY-MM-DD HH:mm:ss)

All financial data across the application should be normalized to this format
before being sent to frontend for consistent visualization.
"""

import logging
from datetime import datetime
from typing import Dict, List, Any, Optional, Union
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

class ParamNormalizer:
    """
    Unified Parameter Normalizer for Sharada Research
    
    Converts various data formats into the standardized param_0 to param_4 structure
    for consistent frontend consumption across all financial visualizations.
    """
    
    @staticmethod
    def normalize_to_params(raw_data: Union[Dict, List[Dict]], data_type: str = "default") -> Union[Dict, List[Dict]]:
        """
        Convert raw data to unified param format
        
        Args:
            raw_data: Raw data from various sources
            data_type: Type of data being normalized (scanner, market_depth, fii_dii, etc.)
            
        Returns:
            Normalized data with param_0 to param_4 structure
        """
        if isinstance(raw_data, list):
            return [ParamNormalizer._normalize_single_record(record, data_type) for record in raw_data]
        else:
            return ParamNormalizer._normalize_single_record(raw_data, data_type)
    
    @staticmethod
    def _normalize_single_record(record: Dict, data_type: str) -> Dict:
        """Normalize a single data record to param format"""
        try:
            normalized = {
                "Symbol": record.get("Symbol", record.get("symbol", record.get("name", "UNKNOWN"))),
                "param_0": 0.0,  # LTP
                "param_1": 0.0,  # Previous Close
                "param_2": 0.0,  # % Change
                "param_3": 0.0,  # R-Factor
                "param_4": datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # DateTime
            }
            
            # Handle different data source formats
            if data_type == "scanner":
                normalized.update(ParamNormalizer._normalize_scanner_data(record))
            elif data_type == "market_depth":
                normalized.update(ParamNormalizer._normalize_market_depth_data(record))
            elif data_type == "fii_dii":
                normalized.update(ParamNormalizer._normalize_fii_dii_data(record))
            elif data_type == "sectorial":
                normalized.update(ParamNormalizer._normalize_sectorial_data(record))
            elif data_type == "swing":
                normalized.update(ParamNormalizer._normalize_swing_data(record))
            elif data_type == "money_flux":
                normalized.update(ParamNormalizer._normalize_money_flux_data(record))
            elif data_type == "pro_setup":
                normalized.update(ParamNormalizer._normalize_pro_setup_data(record))
            elif data_type == "index_analysis":
                normalized.update(ParamNormalizer._normalize_index_analysis_data(record))
            else:
                # Default normalization for unknown types
                normalized.update(ParamNormalizer._normalize_default_data(record))
            
            return normalized
            
        except Exception as e:
            logger.error(f"Error normalizing record {record}: {e}")
            return ParamNormalizer._get_default_record()
    
    @staticmethod
    def _normalize_scanner_data(record: Dict) -> Dict:
        """Normalize scanner data format"""
        return {
            "param_0": float(record.get("ltp", record.get("LTP", record.get("price", 0)))),
            "param_1": float(record.get("prev_close", record.get("previousClose", record.get("param_1", 0)))),
            "param_2": float(record.get("change_pct", record.get("pctChange", record.get("param_2", 0)))),
            "param_3": float(record.get("r_factor", record.get("momentum", record.get("param_3", 0)))),
            "param_4": ParamNormalizer._normalize_timestamp(record.get("timestamp", record.get("param_4")))
        }
    
    @staticmethod
    def _normalize_market_depth_data(record: Dict) -> Dict:
        """Normalize market depth data format"""
        return {
            "param_0": float(record.get("ltp", record.get("price", record.get("param_0", 0)))),
            "param_1": float(record.get("prev_close", record.get("param_1", 0))),
            "param_2": float(record.get("pct_change", record.get("param_2", 0))),
            "param_3": float(record.get("depth_ratio", record.get("param_3", 0))),
            "param_4": ParamNormalizer._normalize_timestamp(record.get("timestamp", record.get("param_4")))
        }
    
    @staticmethod
    def _normalize_fii_dii_data(record: Dict) -> Dict:
        """Normalize FII/DII data format"""
        return {
            "param_0": float(record.get("fii_net", record.get("param_0", 0))),
            "param_1": float(record.get("dii_net", record.get("param_1", 0))),
            "param_2": float(record.get("total_net", record.get("param_2", 0))),
            "param_3": float(record.get("flow_ratio", record.get("param_3", 0))),
            "param_4": ParamNormalizer._normalize_timestamp(record.get("date", record.get("param_4")))
        }
    
    @staticmethod
    def _normalize_sectorial_data(record: Dict) -> Dict:
        """Normalize sectorial flow data format"""
        return {
            "param_0": float(record.get("sector_price", record.get("param_0", 0))),
            "param_1": float(record.get("prev_close", record.get("param_1", 0))),
            "param_2": float(record.get("sector_change", record.get("param_2", 0))),
            "param_3": float(record.get("sector_momentum", record.get("param_3", 0))),
            "param_4": ParamNormalizer._normalize_timestamp(record.get("timestamp", record.get("param_4")))
        }
    
    @staticmethod
    def _normalize_swing_data(record: Dict) -> Dict:
        """Normalize swing analysis data format"""
        return {
            "param_0": float(record.get("swing_price", record.get("param_0", 0))),
            "param_1": float(record.get("prev_close", record.get("param_1", 0))),
            "param_2": float(record.get("swing_change", record.get("param_2", 0))),
            "param_3": float(record.get("swing_strength", record.get("param_3", 0))),
            "param_4": ParamNormalizer._normalize_timestamp(record.get("timestamp", record.get("param_4")))
        }
    
    @staticmethod
    def _normalize_money_flux_data(record: Dict) -> Dict:
        """Normalize money flux data format"""
        return {
            "param_0": float(record.get("flux_value", record.get("param_0", 0))),
            "param_1": float(record.get("prev_flux", record.get("param_1", 0))),
            "param_2": float(record.get("flux_change", record.get("param_2", 0))),
            "param_3": float(record.get("flux_intensity", record.get("param_3", 0))),
            "param_4": ParamNormalizer._normalize_timestamp(record.get("timestamp", record.get("param_4")))
        }
    
    @staticmethod
    def _normalize_pro_setup_data(record: Dict) -> Dict:
        """Normalize pro setup data format"""
        return {
            "param_0": float(record.get("setup_price", record.get("param_0", 0))),
            "param_1": float(record.get("prev_close", record.get("param_1", 0))),
            "param_2": float(record.get("momentum_change", record.get("param_2", 0))),
            "param_3": float(record.get("setup_strength", record.get("param_3", 0))),
            "param_4": ParamNormalizer._normalize_timestamp(record.get("timestamp", record.get("param_4")))
        }
    
    @staticmethod
    def _normalize_index_analysis_data(record: Dict) -> Dict:
        """Normalize index analysis data format"""
        return {
            "param_0": float(record.get("index_value", record.get("param_0", 0))),
            "param_1": float(record.get("prev_close", record.get("param_1", 0))),
            "param_2": float(record.get("index_change", record.get("param_2", 0))),
            "param_3": float(record.get("volatility", record.get("param_3", 0))),
            "param_4": ParamNormalizer._normalize_timestamp(record.get("timestamp", record.get("param_4")))
        }
    
    @staticmethod
    def _normalize_default_data(record: Dict) -> Dict:
        """Default normalization for unknown data types"""
        return {
            "param_0": float(record.get("param_0", record.get("value", record.get("price", 0)))),
            "param_1": float(record.get("param_1", 0)),
            "param_2": float(record.get("param_2", record.get("change", 0))),
            "param_3": float(record.get("param_3", 0)),
            "param_4": ParamNormalizer._normalize_timestamp(record.get("param_4", record.get("timestamp")))
        }
    
    @staticmethod
    def _normalize_timestamp(timestamp: Any) -> str:
        """Normalize various timestamp formats to YYYY-MM-DD HH:mm:ss"""
        if not timestamp:
            return datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        if isinstance(timestamp, (int, float)):
            # Unix timestamp
            return datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(timestamp, str):
            # Try to parse string timestamp
            try:
                if '-' in timestamp or '/' in timestamp:
                    # Already formatted string
                    dt = datetime.strptime(timestamp.split('.')[0], '%Y-%m-%d %H:%M:%S')
                    return dt.strftime('%Y-%m-%d %H:%M:%S')
                else:
                    # Unix timestamp as string
                    return datetime.fromtimestamp(float(timestamp)).strftime('%Y-%m-%d %H:%M:%S')
            except:
                return datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        return datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    @staticmethod
    def _get_default_record() -> Dict:
        """Return a default param record when normalization fails"""
        return {
            "Symbol": "ERROR",
            "param_0": 0.0,
            "param_1": 0.0,
            "param_2": 0.0,
            "param_3": 0.0,
            "param_4": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    
    @staticmethod
    def normalize_array_to_params(array_data: List[List], field_mapping: Dict[int, str]) -> List[Dict]:
        """
        Convert array-based data (like scanner arrays) to param format
        
        Args:
            array_data: List of arrays where each inner array contains values
            field_mapping: Mapping of array index to field name
                          e.g., {0: 'Symbol', 1: 'LTP', 2: 'Volume', 3: 'DeliveryPct', 4: 'timestamp'}
        
        Returns:
            List of normalized param dictionaries
        """
        normalized_data = []
        
        for row in array_data:
            if not isinstance(row, (list, tuple)) or len(row) == 0:
                continue
                
            record = {}
            for index, field_name in field_mapping.items():
                if index < len(row):
                    record[field_name] = row[index]
            
            # Convert to param format based on field names
            param_record = {
                "Symbol": record.get("Symbol", record.get("Name", "UNKNOWN")),
                "param_0": float(record.get("LTP", record.get("Price", 0))),
                "param_1": float(record.get("PrevClose", 0)),
                "param_2": float(record.get("PctChange", record.get("DeliveryPct", 0))),
                "param_3": float(record.get("Volume", record.get("RFactor", 0))),
                "param_4": ParamNormalizer._normalize_timestamp(record.get("timestamp"))
            }
            
            normalized_data.append(param_record)
        
        return normalized_data

# Convenience functions for specific data types
def normalize_scanner_data(data: Union[Dict, List]) -> Union[Dict, List[Dict]]:
    """Normalize scanner data to param format"""
    return ParamNormalizer.normalize_to_params(data, "scanner")

def normalize_market_depth_data(data: Union[Dict, List]) -> Union[Dict, List[Dict]]:
    """Normalize market depth data to param format"""
    return ParamNormalizer.normalize_to_params(data, "market_depth")

def normalize_fii_dii_data(data: Union[Dict, List]) -> Union[Dict, List[Dict]]:
    """Normalize FII/DII data to param format"""
    return ParamNormalizer.normalize_to_params(data, "fii_dii")

def normalize_sectorial_data(data: Union[Dict, List]) -> Union[Dict, List[Dict]]:
    """Normalize sectorial data to param format"""
    return ParamNormalizer.normalize_to_params(data, "sectorial")

def normalize_swing_data(data: Union[Dict, List]) -> Union[Dict, List[Dict]]:
    """Normalize swing data to param format"""
    return ParamNormalizer.normalize_to_params(data, "swing")

def normalize_money_flux_data(data: Union[Dict, List]) -> Union[Dict, List[Dict]]:
    """Normalize money flux data to param format"""
    return ParamNormalizer.normalize_to_params(data, "money_flux")

def normalize_pro_setup_data(data: Union[Dict, List]) -> Union[Dict, List[Dict]]:
    """Normalize pro setup data to param format"""
    return ParamNormalizer.normalize_to_params(data, "pro_setup")

def normalize_index_analysis_data(data: Union[Dict, List]) -> Union[Dict, List[Dict]]:
    """Normalize index analysis data to param format"""
    return ParamNormalizer.normalize_to_params(data, "index_analysis")