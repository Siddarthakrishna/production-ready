# Global Parameter System

## Overview

This document describes the global parameter system used to standardize parameter naming and handling across the application. The system provides a consistent way to define, access, and document parameters used throughout the backend and frontend.

## Core Concepts

### 1. Parameter Types

Parameters are organized into categories with reserved number ranges:

- **Common Parameters (0-99)**: Basic fields like price, volume, timestamps
- **Technical Indicators (100-199)**: Common technical analysis metrics
- **Volume Indicators (200-299)**: Volume-related metrics
- **Money Flow (300-399)**: Money flow and liquidity metrics
- **Swing Analysis (400-499)**: Swing trading metrics
- **Heatmap Parameters (500-599)**: Parameters for heatmap visualizations

### 2. Parameter Definition

Parameters are defined in `backend/app/config/global_params.py` using the `ParamType` enum:

```python
class ParamType(Enum):
    PRICE = "param_0"
    PREV_CLOSE = "param_1"
    PERCENT_CHANGE = "param_2"
    R_FACTOR = "param_3"
    TIMESTAMP = "param_4"
    VOLUME = "param_5"
    HEATMAP_VALUE = "param_500"
    HEATMAP_INTENSITY = "param_501"
    # ... more parameters
```

### 3. Module-Specific Mappings

Each module defines its own parameter mapping in the `MODULE_PARAMS` dictionary:

```python
MODULE_PARAMS = {
    "swing_center": {
        "primary": ParamType.PERCENT_CHANGE,
        "secondary": ParamType.VOLUME_SPIKE,
        "timestamp": ParamType.TIMESTAMP
    },
    "sectorial_flow": {
        "heatmap": ParamType.HEATMAP_VALUE,  # % change for coloring
        "intensity": ParamType.VOLUME,      # Volume for intensity
        # ... other params
    },
    "market_depth": {
        "heatmap": ParamType.HEATMAP_VALUE,  # Order book depth
        "intensity": ParamType.HEATMAP_INTENSITY,  # Order size
        # ... other params
    }
    # ... more modules
}
```

## Standard Parameter Types

| Parameter Name | Type | Description | Common Use Cases |
|----------------|------|-------------|------------------|
| `PRICE` | float | Last traded price | Price display, calculations |
| `PREV_CLOSE` | float | Previous day's closing price | Change calculations |
| `PERCENT_CHANGE` | float | Percentage change from previous close | Performance metrics, heatmaps |
| `R_FACTOR` | float | Risk/momentum factor | Risk assessment |
| `TIMESTAMP` | datetime | Timestamp of the data point | Time series analysis |
| `VOLUME` | int | Trading volume | Volume analysis |
| `HEATMAP_VALUE` | float | Value for heatmap visualization | Heatmap coloring |
| `HEATMAP_INTENSITY` | float | Intensity value for heatmap | Heatmap opacity/saturation |

### Heatmap Parameters

Heatmap visualizations use the following standard parameters:

1. **HEATMAP_VALUE** (`param_500`):
   - Used for the primary value displayed in heatmap cells
   - Typically mapped to percentage change or other normalized values
   - Color scale: Red (negative) to Green (positive)

2. **HEATMAP_INTENSITY** (`param_501`):
   - Optional parameter for controlling heatmap cell intensity/opacity
   - Can represent volume, confidence, or other intensity metrics
   - Higher values = more intense/opaque coloring

## Usage

### Backend Usage

1. **Import Required Components**

```python
from app.config.global_params import ParamType, get_param_label, get_module_params
from app.services.param_normalizer import ParamNormalizer
```

2. **Normalize Data**

```python
data = {
    "Symbol": "RELIANCE",
    "price": 2500.50,
    "change": 1.5,
    "volume": 1000000
}

# Normalize data
normalized = ParamNormalizer.normalize(data, module_name="swing_center")
```

3. **Access Parameter Metadata**

```python
# Get parameter metadata for a module
metadata = ParamNormalizer.get_metadata("swing_center")
```

### Frontend Usage

The frontend receives data in the following format:

```json
{
  "Symbol": "RELIANCE",
  "params": {
    "param_0": {
      "value": 2500.50,
      "label": "Last Traded Price",
      "type": "price"
    },
    "param_1": {
      "value": 1.5,
      "label": "% Change",
      "type": "percent_change"
    }
  }
}
```

Access parameters using the standard names:

```javascript
// Accessing parameter values
const price = data.params.param_0.value;
const priceLabel = data.params.param_0.label;

// Or using destructuring
const { param_0: { value: price, label: priceLabel } } = data.params;
```

When working with heatmap data in the frontend:

```javascript
// Accessing heatmap values
const heatmapValue = data.params.heatmap.value;
const intensity = data.params.intensity?.value || 1.0; // Default to full intensity

// Example: Apply heatmap color based on value
function getHeatmapColor(value) {
  // Red for negative, Green for positive
  const intensity = Math.min(Math.abs(value) * 2, 1); // Scale intensity
  return value >= 0 
    ? `rgba(0, 200, 0, ${intensity})`  // Green
    : `rgba(200, 0, 0, ${intensity})`;  // Red
}
```

## Example: Before and After

### Before (Old Way)

```javascript
// Inconsistent parameter usage
const price = data.param_0;  // What does param_0 mean?
const change = data.param_2; // What does param_2 mean?
```

### After (New Way)

```javascript
// Clear parameter usage with metadata
const price = data.params.param_0.value;  // param_0 is defined as PRICE
const priceLabel = data.params.param_0.label; // "Last Traded Price"

// Or using destructuring
const { 
  param_0: { value: price, label: priceLabel },
  param_2: { value: change, label: changeLabel }
} = data.params;
```

## Adding New Parameters

1. Add the new parameter to the appropriate category in `ParamType`
2. Add a human-readable label in `PARAM_LABELS`
3. Update the relevant module's parameter mapping in `MODULE_PARAMS`
4. Document the new parameter in this file

## Best Practices

1. **Always use the parameter types** from `global_params.py` instead of hardcoding param_X
2. **Keep parameter usage consistent** across modules
3. **Document new parameters** in this file
4. **Use descriptive names** in module mappings
5. **Handle missing parameters** gracefully in the frontend

## Migration Guide

1. Update backend services to use `ParamNormalizer`
2. Update frontend components to use the new parameter structure
3. Test all modules to ensure parameter consistency
4. Update any documentation referencing old parameter names


Global Parameter System Migration Plan
Here's a structured plan to update all the remaining modules to use the new global parameter system:

Phase 1: Backend Updates
1. Market Depth Module
 Add Market Depth parameters to global_params.py
 Update 
market_depth.py
 service to use ParamNormalizer
 Update API endpoints in 
market_depth.py
2. Money Flux Module
 Add Money Flux parameters to global_params.py
 Update 
money_flux.py
 service to use ParamNormalizer
 Update API endpoints in 
money_flux.py
3. Pro Setup Module
 Add Pro Setup parameters to global_params.py
 Update 
pro_setup.py
 service to use ParamNormalizer
 Update API endpoints in 
pro_setup.py
4. Scanners
 Add Scanner parameters to global_params.py
 Update scanner services to use ParamNormalizer
 Update scanner API endpoints
5. Swing Center
 Add Swing Center parameters to global_params.py
 Update 
swing.py
 service to use ParamNormalizer
 Update API endpoints in 
swing.py
6. Sectorial Flow
 Add Sectorial Flow parameters to global_params.py
 Update sectorial flow services to use ParamNormalizer
 Update sectorial flow API endpoints
Phase 2: Frontend Updates
For each module, we'll need to:

Create or update utility files (e.g., marketDepthUtils.js, moneyFluxUtils.js)
Update component JavaScript files to use paramUtils
Update any related CSS for consistent styling
Phase 3: Testing
Unit tests for each module's parameter handling
Integration tests for API endpoints
End-to-end tests for complete workflows
Phase 4: Documentation
Update API documentation
Create developer guide for the parameter system
Document any breaking changes
Implementation Order
I recommend we proceed in this order:

