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
from ..config.global_params import ParamType, get_param_label, get_module_params

logger = logging.getLogger(__name__)

class ParamNormalizer:
    """
    Unified Parameter Normalizer
    
    Converts various data formats into the standardized parameter structure
    using the global parameter configuration.
    """
    
    @classmethod
    def normalize(
        cls,
        data: Union[Dict, List[Dict]],
        module_name: str,
        data_type: Optional[str] = None
    ) -> Union[Dict, List[Dict]]:
        """
        Normalize data to the standard parameter format
        
        Args:
            data: Input data to normalize (single record or list of records)
            module_name: Name of the module (e.g., 'swing_center', 'fii_dii')
            data_type: Optional data type for backward compatibility
            
        Returns:
            Normalized data with standard parameter structure
        """
        if isinstance(data, list):
            return [cls._normalize_record(record, module_name, data_type) for record in data]
        return cls._normalize_record(data, module_name, data_type)
    
    @classmethod
    def _normalize_record(
        cls,
        record: Dict[str, Any],
        module_name: str,
        data_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """Normalize a single record to standard parameter format"""
        # Get module-specific parameter mapping
        param_mapping = get_module_params(module_name)
        
        # Initialize with common fields
        normalized = {
            "Symbol": record.get("Symbol", record.get("symbol", record.get("name", "UNKNOWN"))),
            "params": {}
        }
        
        try:
            # Map each parameter using the module's configuration
            for field, param_type in param_mapping.items():
                param_name = param_type.value
                if field in record:
                    normalized["params"][param_name] = {
                        "value": record[field],
                        "label": get_param_label(param_type),
                        "type": param_type.name.lower()
                    }
            
            # Add timestamp if not already present
            if ParamType.TIMESTAMP.value not in normalized["params"]:
                normalized["params"][ParamType.TIMESTAMP.value] = {
                    "value": datetime.now().isoformat(),
                    "label": get_param_label(ParamType.TIMESTAMP),
                    "type": "timestamp"
                }
                
            return normalized
            
        except Exception as e:
            logger.error(f"Error normalizing record: {e}", exc_info=True)
            return {
                "Symbol": "ERROR",
                "params": {
                    "error": {"value": str(e), "label": "Error", "type": "error"}
                }
            }
    
    @classmethod
    def get_metadata(cls, module_name: str) -> Dict[str, Any]:
        """
        Get metadata about the parameters used by a module
        
        Args:
            module_name: Name of the module
            
        Returns:
            Dictionary with parameter metadata
        """
        param_mapping = get_module_params(module_name)
        return {
            "module": module_name,
            "parameters": [
                {
                    "name": param_type.value,
                    "label": get_param_label(param_type),
                    "type": param_type.name.lower(),
                    "description": f"{param_type.name} parameter"
                }
                for param_type in param_mapping.values()
            ]
        }

# Convenience functions for specific data types
def normalize_scanner_data(data: Union[Dict, List]) -> Union[Dict, List[Dict]]:
    """Normalize scanner data to param format"""
    return ParamNormalizer.normalize(data, "scanner")

def normalize_market_depth_data(data: Union[Dict, List]) -> Union[Dict, List[Dict]]:
    """Normalize market depth data to param format"""
    return ParamNormalizer.normalize(data, "market_depth")

def normalize_fii_dii_data(data: Union[Dict, List]) -> Union[Dict, List[Dict]]:
    """Normalize FII/DII data to param format"""
    return ParamNormalizer.normalize(data, "fii_dii")

def normalize_sectorial_data(data: Union[Dict, List]) -> Union[Dict, List[Dict]]:
    """Normalize sectorial data to param format"""
    return ParamNormalizer.normalize(data, "sectorial")

def normalize_swing_data(data: Union[Dict, List]) -> Union[Dict, List[Dict]]:
    """Normalize swing data to param format"""
    return ParamNormalizer.normalize(data, "swing")

def normalize_money_flux_data(data: Union[Dict, List]) -> Union[Dict, List[Dict]]:
    """Normalize money flux data to param format"""
    return ParamNormalizer.normalize(data, "money_flux")

def normalize_pro_setup_data(data: Union[Dict, List]) -> Union[Dict, List[Dict]]:
    """Normalize pro setup data to param format"""
    return ParamNormalizer.normalize(data, "pro_setup")

def normalize_index_analysis_data(data: Union[Dict, List]) -> Union[Dict, List[Dict]]:
    """Normalize index analysis data to param format"""
    return ParamNormalizer.normalize(data, "index_analysis")