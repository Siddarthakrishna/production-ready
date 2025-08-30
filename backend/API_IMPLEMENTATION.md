# Sharada Research API Implementation

This document outlines the implementation of the Sharada Research API endpoints following the specified requirements.

## Base URL

```
https://api.sharadaresearch.in
```

## Response Format

All endpoints return JSON responses with the following standard format:

```json
{
  "status": "success",
  "data": [
    { 
      "Symbol": "TATAPOWER",
      "param_0": 374.45,
      "param_1": 371.1,
      "param_2": 0.9,
      "param_3": 0.15
    }
  ],
  "meta": {
    "columns": [
      { "key": "Symbol", "label": "Symbol", "type": "string" },
      { "key": "param_0", "label": "Last Price", "type": "number", "unit": "₹" },
      { "key": "param_1", "label": "Prev Close", "type": "number", "unit": "₹" },
      { "key": "param_2", "label": "Change %", "type": "percent" },
      { "key": "param_3", "label": "OI Change %", "type": "percent" }
    ]
  }
}
```

## Endpoints

### 1. Market Depth

Get various market depth metrics in a single request.

- **Endpoint**: `GET /api/market-depth`
- **Query Parameters**:
  - `include` (optional): Comma-separated list of sections to include
  - `limit` (optional, default=50): Maximum number of items per section (1-1000)

**Example Request**:
```
GET /api/market-depth?include=highpower,intradayBoost&limit=10
```

**Response**:
```json
{
  "status": "success",
  "highpower": {
    "status": "success",
    "data": [
      {
        "Symbol": "TATAPOWER",
        "param_0": 374.45,
        "param_1": 371.1,
        "param_2": 0.9,
        "param_3": 0.15
      }
    ],
    "meta": {
      "columns": [
        {"key": "Symbol", "label": "Symbol", "type": "string"},
        {"key": "param_0", "label": "Price", "type": "currency", "unit": "₹"},
        {"key": "param_1", "label": "Change %", "type": "percent"},
        {"key": "param_2", "label": "Volume", "type": "number"}
      ]
    }
  },
  "intradayBoost": {
    "status": "success",
    "data": [],
    "meta": {}
  },
  "errors": {}
}
```

### 2. Pro Setup

Get professional trading setup data including technical indicators.

- **Endpoint**: `GET /api/prosetup`
- **Query Parameters**:
  - `include` (optional): Comma-separated list of sections to include
  - `limit` (optional, default=50): Maximum number of items per section (1-1000)

**Example Request**:
```
GET /api/prosetup?include=spike5min,unusualVolume
```

### 3. F&O OI Analysis

Get F&O Open Interest analysis data.

- **Endpoint**: `GET /api/fno-oi-analysis`
- **Query Parameters**:
  - `segment` (optional, default="FO"): Market segment (FO, COMMODITY, CURRENCY, INDEX)
  - `include` (optional): Comma-separated list of sections to include
  - `limit` (optional, default=50): Maximum number of items per section (1-1000)

**Example Request**:
```
GET /api/fno-oi-analysis?segment=FO&include=longBuildUp,shortCovering&limit=20
```

### 4. Index Analysis

Get comprehensive analysis for a specific market index including overview, sector performance, and top constituents.

- **Endpoint**: `GET /api/index-analysis`
- **Query Parameters**:
  - `index` (optional, default="NIFTY 50"): Index name (e.g., 'NIFTY 50', 'BANKNIFTY')
  - `timeframe` (optional, default="1D"): Analysis timeframe ('1D', '1W', '1M', '3M', '1Y')
  - `include_sectors` (optional, default=true): Include sector-wise performance
  - `include_heatmap` (optional, default=true): Include heatmap data (reserved for future use)
  - `include_technical` (optional, default=true): Include technical indicators
  - `limit` (optional, default=20, min=1, max=100): Maximum number of rows per table

**Response Format**:
```json
{
  "status": "success",
  "message": "Successfully retrieved NIFTY 50 analysis data",
  "tables": {
    "overview": {
      "title": "NIFTY 50 Overview",
      "description": "Key metrics for NIFTY 50 index",
      "columns": [
        {"key": "Index", "label": "Index", "type": "text"},
        {"key": "Current", "label": "Current", "type": "number", "format": ",.2f"},
        {"key": "Change", "label": "Change", "type": "number", "format": ",.2f"},
        {"key": "% Change", "label": "% Change", "type": "percentage", "format": ",.2f"},
        {"key": "Open", "label": "Open", "type": "number", "format": ",.2f"},
        {"key": "High", "label": "High", "type": "number", "format": ",.2f"},
        {"key": "Low", "label": "Low", "type": "number", "format": ",.2f"},
        {"key": "52W High", "label": "52W High", "type": "number", "format": ",.2f"},
        {"key": "52W Low", "label": "52W Low", "type": "number", "format": ",.2f"}
      ],
      "rows": [
        {
          "Index": "NIFTY 50",
          "Current": 19875.45,
          "Change": 125.50,
          "% Change": 0.64,
          "Open": 19750.20,
          "High": 19900.75,
          "Low": 19725.30,
          "52W High": 20204.50,
          "52W Low": 16747.20
        }
      ]
    },
    "sector_performance": {
      "title": "NIFTY 50 Sector Performance",
      "description": "Sector-wise performance for NIFTY 50 index",
      "columns": [
        {"key": "Sector", "label": "Sector", "type": "text"},
        {"key": "Price", "label": "Price", "type": "number", "format": ",.2f"},
        {"key": "Change", "label": "Change", "type": "number", "format": ",.2f"},
        {"key": "% Change", "label": "% Change", "type": "percentage", "format": ",.2f"},
        {"key": "RSI(14)", "label": "RSI(14)", "type": "number", "format": ",.2f"}
      ],
      "rows": [
        {
          "Sector": "BANK",
          "Price": 45678.90,
          "Change": 234.56,
          "% Change": 0.52,
          "RSI(14)": 62.34
        }
      ]
    },
    "constituents": {
      "title": "NIFTY 50 Top Constituents",
      "description": "Top constituents of NIFTY 50 index by weight",
      "columns": [
        {"key": "Symbol", "label": "Symbol", "type": "text"},
        {"key": "LTP", "label": "LTP", "type": "number", "format": ",.2f"},
        {"key": "Change", "label": "Change", "type": "number", "format": ",.2f"},
        {"key": "% Change", "label": "% Change", "type": "percentage", "format": ",.2f"},
        {"key": "Weight %", "label": "Weight %", "type": "percentage", "format": ",.2f"}
      ],
      "rows": [
        {
          "Symbol": "RELIANCE",
          "LTP": 2456.78,
          "Change": 12.34,
          "% Change": 0.51,
          "Weight %": 10.25
        }
      ]
    }
  }
}
```

**Example Request**:
```
GET /api/index-analysis?index=NIFTY%2050&timeframe=1D&limit=10
```

**Notes**:
- The endpoint returns multiple tables with related index analysis data
- All monetary values are in INR
- Percent changes are in decimal format (e.g., 0.05 for 5%)
- The `include_heatmap` parameter is reserved for future implementation
- Technical indicators like RSI are included when `include_technical` is true

## Sectorial View API

### GET /api/sectorial-view

Get a comprehensive view of sector performance and trends.

**Query Parameters:**
- `timeframe` (string, optional): Analysis timeframe. One of: '1D', '1W', '1M', '3M', '1Y'. Default: '1D'.
- `include_technical` (boolean, optional): Whether to include technical indicators. Default: true.
- `include_heatmap` (boolean, optional): Whether to include stock heatmap. Default: true.
- `include_constituents` (boolean, optional): Whether to include top constituents by sector. Default: false.
- `limit` (integer, optional): Maximum number of rows per table. Default: 20, Max: 100.

**Response Format:**
```json
{
  "success": true,
  "message": "Successfully retrieved sectorial view data",
  "tables": {
    "sector_performance": {
      "title": "Sector Performance Overview",
      "description": "Performance of major market sectors (1D view)",
      "columns": [
        {"key": "Sector", "label": "Sector", "type": "text"},
        {"key": "Weight %", "label": "Weight %", "type": "percentage", "format": ",.2f"},
        {"key": "Price", "label": "Price", "type": "number", "format": ",.2f"},
        {"key": "Change", "label": "Change", "type": "number", "format": ",.2f"},
        {"key": "% Change", "label": "% Change", "type": "percentage", "format": ",.2f"},
        {"key": "Volume", "label": "Volume", "type": "number", "format": ",.0f"},
        {"key": "RSI(14)", "label": "RSI(14)", "type": "number", "format": ",.2f"},
        {"key": "52W High %", "label": "52W High %", "type": "percentage", "format": ",.2f"},
        {"key": "52W Low %", "label": "52W Low %", "type": "percentage", "format": ",.2f"},
        {"key": "Description", "label": "Description", "type": "text"}
      ],
      "rows": [
        {
          "Sector": "BANK",
          "Weight %": 35.5,
          "Price": 1850.25,
          "Change": 12.5,
          "% Change": 0.68,
          "Volume": 45000000,
          "RSI(14)": 62.3,
          "52W High %": 15.2,
          "52W Low %": -8.7,
          "Description": "Banking and Financial Services"
        },
        ...
      ]
    },
    "stock_heatmap": {
      "title": "Stock Heatmap by Sector",
      "description": "Heatmap of top stocks across all sectors",
      "columns": [
        {"key": "Symbol", "label": "Symbol", "type": "text"},
        {"key": "Sector", "label": "Sector", "type": "text"},
        {"key": "LTP", "label": "LTP", "type": "number", "format": ",.2f"},
        {"key": "Change %", "label": "Change %", "type": "percentage", "format": ",.2f"},
        {"key": "RSI(14)", "label": "RSI(14)", "type": "number", "format": ",.2f"},
        {"key": "Volume", "label": "Volume", "type": "number", "format": ",.0f"},
        {"key": "Mkt Cap", "label": "Mkt Cap", "type": "text"}
      ],
      "rows": [
        {
          "Symbol": "RELIANCE",
          "Sector": "OILGAS",
          "LTP": 2450.75,
          "Change %": 1.25,
          "RSI(14)": 58.7,
          "Volume": 5200000,
          "Mkt Cap": "₹15.8T"
        },
        ...
      ]
    },
    "sector_constituents": {
      "title": "Top Constituents by Sector",
      "description": "Key stocks driving sector performance",
      "columns": [
        {"key": "Sector", "label": "Sector", "type": "text"},
        {"key": "Symbol", "label": "Symbol", "type": "text"},
        {"key": "Weight %", "label": "Weight %", "type": "percentage", "format": ",.2f"},
        {"key": "LTP", "label": "LTP", "type": "number", "format": ",.2f"},
        {"key": "Change %", "label": "Change %", "type": "percentage", "format": ",.2f"},
        {"key": "Volume", "label": "Volume", "type": "number", "format": ",.0f"},
        {"key": "RSI(14)", "label": "RSI(14)", "type": "number", "format": ",.2f"}
      ],
      "rows": [
        {
          "Sector": "BANK",
          "Symbol": "HDFCBANK",
          "Weight %": 28.5,
          "LTP": 1650.25,
          "Change %": 0.85,
          "Volume": 3200000,
          "RSI(14)": 61.2
        },
        ...
      ]
    }
  }
}
```

### GET /api/sectorial-view/performance

Get performance metrics for all sectors.

**Query Parameters:**
- `timeframe` (string, optional): Analysis timeframe. One of: '1D', '1W', '1M', '3M', '1Y'. Default: '1D'.
- `sort_by` (string, optional): Column to sort by. Default: 'Weight %'.
- `sort_order` (string, optional): Sort order. One of: 'asc', 'desc'. Default: 'desc'.

**Response Format:**
Same as the sector_performance table in the main endpoint.

### GET /api/sectorial-view/heatmap

Get a heatmap of sector performance.

**Query Parameters:**
- `timeframe` (string, optional): Analysis timeframe. One of: '1D', '1W', '1M', '3M', '1Y'. Default: '1D'.
- `min_weight` (number, optional): Minimum sector weight percentage to include. Default: 1.0.

**Response Format:**
Same as the stock_heatmap table in the main endpoint.

### Example Request

```http
GET /api/sectorial-view?timeframe=1D&include_technical=true&include_heatmap=true&limit=10
```

### Notes
- The sector performance table shows key metrics for each sector including price, change, volume, and technical indicators.
- The stock heatmap provides a visual representation of stock performance within each sector.
- The sector constituents table lists the top stocks driving each sector's performance.
- All monetary values are in INR (₹).
- Volume is represented in whole numbers.
- Percentage values are in decimal format (e.g., 0.05 = 5%).
- The API currently returns mock data. Integration with real market data sources is pending.

### Error Responses

```json
{
  "success": false,
  "message": "Error retrieving sectorial view data: [error details]",
  "tables": {}
}
```

### Implementation Status
- [x] Endpoint implementation
- [x] Mock data generation
- [ ] Integration with real market data
- [ ] Authentication and rate limiting
- [ ] Caching layer

## Sector Heatmaps API

The Sector Heatmaps API provides visual heatmap representations of market data, allowing for quick identification of trends and patterns across different sectors and stocks.

### GET /api/sector-heatmaps

Get sector heatmap data for visualization.

**Query Parameters:**
- `heatmap_type` (string, optional): Type of heatmap to generate. Options: 'sector-performance', 'stocks', 'sector-rotation'. Default: 'sector-performance'.
- `timeframe` (string, optional): Analysis timeframe. Options: '1D', '1W', '1M', '3M', '1Y', 'YTD'. Default: '1D'.
- `sort_by` (string, optional): Field to sort by. Options: 'weight', 'change', 'volume'. Default: 'weight'.
- `include_technical` (boolean, optional): Whether to include technical indicators. Default: true.
- `limit` (integer, optional): Maximum number of rows per table. Default: 20, Max: 100.

### GET /api/sector-heatmaps/sector-performance

Get sector performance heatmap data.

**Query Parameters:**
- `timeframe` (string, optional): Analysis timeframe. Default: '1D'.
- `sort_by` (string, optional): Sort by 'weight', 'change', or 'volume'. Default: 'weight'.

### GET /api/sector-heatmaps/stocks

Get stock heatmap data by sector.

**Query Parameters:**
- `timeframe` (string, optional): Analysis timeframe. Default: '1D'.
- `sort_by` (string, optional): Sort by 'sector', 'change', or 'volume'. Default: 'sector'.

### GET /api/sector-heatmaps/sector-rotation

Get sector rotation heatmap data showing performance across different timeframes.

### Response Format (MultiTableResponse)

All endpoints return a MultiTableResponse with the following structure:

```json
{
  "success": true,
  "message": "Successfully generated heatmap data",
  "tables": {
    "sector_performance": {
      "title": "Sector Performance Heatmap (1D)",
      "description": "Color-coded heatmap showing sector performance metrics",
      "columns": [
        {"key": "Sector", "label": "Sector", "type": "text"},
        {"key": "Weight %", "label": "Weight %", "type": "percentage", "format": ",.2f"},
        {"key": "Change %", "label": "Change %", "type": "percentage", "format": "+,.2f"},
        {"key": "RSI(14)", "label": "RSI(14)", "type": "number", "format": ",.2f"},
        {"key": "Volume", "label": "Volume", "type": "number", "format": ",.0f"},
        {"key": "Top Gainer", "label": "Top Gainer", "type": "text"},
        {"key": "Top Loser", "label": "Top Loser", "type": "text"},
        {"key": "Advance/Decline", "label": "Advance/Decline", "type": "text"},
        {"key": "52W High/Low", "label": "52W High/Low", "type": "text"}
      ],
      "rows": [
        {
          "Sector": "BANKING",
          "Weight %": 38.1,
          "Change %": 0.78,
          "RSI(14)": 62.5,
          "Volume": 45000000,
          "Top Gainer": "HDFCBANK",
          "Top Loser": "SBIN",
          "Advance/Decline": "12/3",
          "52W High/Low": "8/2"
        },
        {
          "Sector": "IT",
          "Weight %": 15.3,
          "Change %": -0.32,
          "RSI(14)": 58.2,
          "Volume": 32000000,
          "Top Gainer": "TCS",
          "Top Loser": "WIPRO",
          "Advance/Decline": "8/7",
          "52W High/Low": "5/5"
        }
      ]
    },
    "stock_heatmap": {
      "title": "Stock Heatmap by Sector (1D)",
      "description": "Color-coded heatmap showing stock performance by sector",
      "columns": [
        {"key": "Symbol", "label": "Symbol", "type": "text"},
        {"key": "Sector", "label": "Sector", "type": "text"},
        {"key": "LTP", "label": "LTP", "type": "number", "format": ",.2f"},
        {"key": "Change %", "label": "Change %", "type": "percentage", "format": "+,.2f"},
        {"key": "RSI(14)", "label": "RSI(14)", "type": "number", "format": ",.2f"},
        {"key": "Volume", "label": "Volume", "type": "number", "format": ",.0f"},
        {"key": "1M Change %", "label": "1M %", "type": "percentage", "format": "+,.2f"},
        {"key": "1Y Change %", "label": "1Y %", "type": "percentage", "format": "+,.2f"},
        {"key": "Mkt Cap (Cr)", "label": "Mkt Cap (Cr)", "type": "text"}
      ],
      "rows": [
        {
          "Symbol": "HDFCBANK",
          "Sector": "BANKING",
          "LTP": 1650.25,
          "Change %": 1.25,
          "RSI(14)": 62.5,
          "Volume": 4500000,
          "1M Change %": 3.2,
          "1Y Change %": 18.7,
          "Mkt Cap (Cr)": "₹9,50,000"
        },
        {
          "Symbol": "TCS",
          "Sector": "IT",
          "LTP": 3250.75,
          "Change %": -0.85,
          "RSI(14)": 58.2,
          "Volume": 3200000,
          "1M Change %": -2.1,
          "1Y Change %": 12.4,
          "Mkt Cap (Cr)": "₹11,75,000"
        }
      ]
    },
    "sector_rotation": {
      "title": "Sector Rotation Heatmap",
      "description": "Heatmap showing sector performance across different timeframes",
      "columns": [
        {"key": "Sector", "label": "Sector", "type": "text"},
        {"key": "Weight %", "label": "Weight %", "type": "percentage", "format": ",.2f"},
        {"key": "1W", "label": "1W", "type": "percentage", "format": "+,.2f"},
        {"key": "1M", "label": "1M", "type": "percentage", "format": "+,.2f"},
        {"key": "3M", "label": "3M", "type": "percentage", "format": "+,.2f"},
        {"key": "6M", "label": "6M", "type": "percentage", "format": "+,.2f"},
        {"key": "YTD", "label": "YTD", "type": "percentage", "format": "+,.2f"},
        {"key": "1Y", "label": "1Y", "type": "percentage", "format": "+,.2f"},
        {"key": "RS 1M", "label": "RS 1M", "type": "number", "format": ",.2f"},
        {"key": "RS 3M", "label": "RS 3M", "type": "number", "format": ",.2f"},
        {"key": "Trend", "label": "Trend", "type": "text"}
      ],
      "rows": [
        {
          "Sector": "BANKING",
          "Weight %": 38.1,
          "1W": 1.25,
          "1M": 3.2,
          "3M": 8.7,
          "6M": 12.4,
          "YTD": 15.8,
          "1Y": 18.7,
          "RS 1M": 1.15,
          "RS 3M": 1.25,
          "Trend": "Strong Up"
        },
        {
          "Sector": "IT",
          "Weight %": 15.3,
          "1W": -0.85,
          "1M": -2.1,
          "3M": 1.5,
          "6M": 5.2,
          "YTD": 8.3,
          "1Y": 12.4,
          "RS 1M": 0.92,
          "RS 3M": 0.85,
          "Trend": "Neutral"
        }
      ]
    }
  }
}
```

### Example Requests

1. Get sector performance heatmap for 1 month:
   ```http
   GET /api/sector-heatmaps/sector-performance?timeframe=1M&sort_by=change
   ```

2. Get stock heatmap sorted by volume:
   ```http
   GET /api/sector-heatmaps/stocks?sort_by=volume&limit=50
   ```

3. Get sector rotation heatmap:
   ```http
   GET /api/sector-heatmaps/sector-rotation
   ```

### Implementation Status
- [x] Endpoint implementation
- [x] Mock data generation
- [ ] Integration with real market data
- [ ] Authentication and rate limiting
- [ ] Caching layer

### Notes
- All percentage values are in decimal format (e.g., 0.05 = 5%)
- Positive values are shown in green, negative in red in the frontend
- Volume is represented in whole numbers
- Market cap is formatted as a string with Indian numbering system (lakhs/crores)
- The API currently returns mock data. Integration with real market data sources is pending.

## Error Handling

All endpoints return appropriate HTTP status codes and error messages in the following format:

```json
{
  "status": "error",
  "error": "Error message",
  "details": {
    "key": "Additional error details"
  }
}
```

## Rate Limiting

API rate limiting is implemented with the following limits:
- 100 requests per minute per IP address
- 1000 requests per hour per API key (when implemented)

## Authentication

Authentication is not required for the current endpoints but will be implemented in future releases using API keys or OAuth2.

## Response Codes

- `200 OK`: Request was successful
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Versioning

API versioning is handled through the URL path (e.g., `/api/v1/...`). The current version is v1.
