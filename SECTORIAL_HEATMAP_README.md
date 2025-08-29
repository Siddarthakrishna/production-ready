# Sectorial Flow Heatmap Implementation

## Overview

This implementation adds an interactive heatmap visualization to the Sectorial Flow page, providing an enhanced view of sector and stock performance with drill-down capabilities.

## Architecture

### Backend Components

1. **Enhanced Sectorial Heatmap Service** (`backend/app/services/sectorial_heatmap_service.py`)
   - `SectorialHeatmapService` class with comprehensive sector and stock data generation
   - Real constituent stock mappings for all major indices
   - Parameter system integration for consistent data format

2. **Updated Sector API** (`backend/app/api/sector.py`)
   - New enhanced heatmap endpoints
   - Backward compatibility with existing endpoints
   - Support for filtering and drill-down functionality

3. **Global Parameter Configuration** (`backend/app/config/global_params.py`)
   - Enhanced sectorial_flow module configuration
   - Standardized parameter mappings for heatmap data

### Frontend Components

1. **Sectorial Heatmap Component** (`frontend/src/components/financial/static/js/sectorial_heatmap.js`)
   - Full-featured interactive heatmap using ApexCharts treemap
   - Drill-down from sectors to individual stocks
   - Real-time updates and filtering capabilities
   - Responsive design with dark theme integration

2. **Updated Sectorial Flow Page** (`frontend/src/components/financial/sectorial_flow.html`)
   - New heatmap section integrated seamlessly
   - Maintains existing functionality
   - Progressive enhancement approach

## API Endpoints

### Enhanced Heatmap Endpoints

```
GET /api/sector/heatmap/sectors
- Returns sector-level heatmap data
- Optional sector_filter parameter

GET /api/sector/heatmap/stocks/{sector_code}
- Returns stock-level heatmap for specific sector
- Example: /api/sector/heatmap/stocks/NIFTYAUTO

GET /api/sector/heatmap/stocks
- Returns all stocks heatmap across all sectors

GET /api/sector/summary
- Returns sector summary with key metrics
```

### Legacy Endpoints (Maintained)

```
GET /api/sector/heatmap
- Original sector heatmap endpoint

GET /api/sector/{sectorName}
- Original sector detail endpoint
```

## Data Format

All endpoints return data in the unified parameter format:

```json
{
  "data": [
    {
      "Symbol": "SECTOR_NAME",
      "params": {
        "param_500": {
          "value": 2.5,
          "label": "Heatmap Value",
          "type": "heatmap_value"
        },
        "param_0": {
          "value": 1250.50,
          "label": "Last Traded Price",
          "type": "price"
        },
        "param_2": {
          "value": 2.5,
          "label": "% Change",
          "type": "percent_change"
        }
      }
    }
  ],
  "name": "Sector Heatmap Overview",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Features

### Interactive Heatmap Features

1. **Multiple View Modes**
   - Sectors Overview: High-level sector performance
   - All Stocks: Comprehensive stock-level view
   - Sector Drill-down: Individual sector stock analysis

2. **Visual Encoding**
   - **Color**: Represents % change (Green=Positive, Red=Negative, Yellow=Neutral)
   - **Size**: Represents volume/market cap
   - **Intensity**: Color intensity based on magnitude of change

3. **Interactive Elements**
   - Click sectors to drill down to constituent stocks
   - Click stocks to open detailed charts
   - Hover tooltips with comprehensive metrics
   - Real-time data updates every 30 seconds

4. **Filtering and Controls**
   - Sector filter dropdown
   - View toggle buttons
   - Manual refresh button
   - Auto-refresh configuration

5. **Responsive Design**
   - Dark theme integration
   - Mobile-friendly layout
   - Consistent styling with existing pages

## Usage

### For Developers

1. **Starting the Application**
   ```bash
   # Backend (from project root)
   cd backend
   python server.py
   
   # Frontend (from project root)
   cd frontend
   npm start
   ```

2. **Testing the Implementation**
   ```bash
   # Run the test suite
   python test_sectorial_heatmap.py
   ```

3. **Accessing the Heatmap**
   - Navigate to the Sectorial Flow page
   - Look for the "Sectorial Heatmap" section below the bar chart
   - The heatmap will automatically initialize and load data

### For Users

1. **Viewing Sector Performance**
   - The default view shows all sectors as a heatmap
   - Green tiles indicate positive performance
   - Red tiles indicate negative performance
   - Larger tiles represent higher volume/market cap

2. **Drilling Down to Stocks**
   - Click on any sector tile to see individual stocks
   - Use the sector filter dropdown for quick navigation
   - Toggle between "Sectors Overview" and "All Stocks" views

3. **Getting Detailed Information**
   - Hover over any tile to see detailed metrics
   - Click on stock tiles to open trading charts
   - View real-time updates as data refreshes

## Configuration

### API Base URL

The heatmap component uses the global API configuration:

```javascript
window.DATA_API_BASE = 'http://localhost:8001/api';
```

### Customization Options

```javascript
const heatmap = new SectorialHeatmap('container_id', {
  apiBase: 'http://localhost:8001/api',
  updateInterval: 30000,  // 30 seconds
  enableDrillDown: true,
  showTooltips: true,
  colorScheme: {
    positive: '#00E676',
    negative: '#FF5252', 
    neutral: '#FFC107'
  }
});
```

## Browser Compatibility

- Modern browsers with ES6+ support
- ApexCharts compatibility requirements
- Responsive design for mobile and desktop

## Troubleshooting

### Common Issues

1. **Heatmap Not Loading**
   - Check browser console for JavaScript errors
   - Verify API server is running on correct port
   - Ensure sectorial_heatmap.js is loaded

2. **API Errors**
   - Check backend server logs
   - Verify database connections
   - Test endpoints manually using the test script

3. **Styling Issues**
   - Verify CSS dependencies are loaded
   - Check for conflicting styles
   - Ensure ApexCharts CSS is included

### Debug Mode

Enable debug logging:

```javascript
// In browser console
window.sectorialHeatmap.config.debug = true;
```

## Performance Considerations

- Heatmap data is cached for 30 seconds
- Large datasets (500+ stocks) may impact rendering performance
- Auto-refresh can be disabled for better performance on slower devices

## Future Enhancements

1. **Data Export**: CSV/Excel export functionality
2. **Historical View**: Time-based heatmap analysis
3. **Custom Metrics**: User-defined heatmap parameters
4. **Advanced Filtering**: Multi-criteria filtering options
5. **Performance Optimization**: Virtual rendering for large datasets

## Support

For issues or questions:
1. Check the troubleshooting section
2. Run the test suite to identify problems
3. Review browser console for error messages
4. Verify all dependencies are properly installed