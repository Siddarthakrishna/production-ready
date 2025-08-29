/**
 * Parameter System Utilities for Frontend
 * 
 * This utility file provides functions to work with the global parameter system
 * implementing the unified param format as described in SwingCentre documentation.
 * 
 * All backend APIs now return data in this format:
 * {
 *   "data": [
 *     {
 *       "Symbol": "XYZ",
 *       "param_0": <primary metric>,
 *       "param_1": <secondary metric>,
 *       "param_2": <supporting value>,
 *       "param_3": <supporting value>,
 *       "param_4": <date or extra field>
 *     }
 *   ],
 *   "name": "<study or endpoint name>",
 *   "timestamp": "<ISO timestamp>"
 * }
 */

/**
 * Parameter type definitions for different contexts
 */
export const PARAM_CONTEXTS = {
  // Advance/Decline (NIFTY/FO)
  ADVANCE_DECLINE: {
    param_0: 'Advance % growth',
    param_1: 'Decline % growth',
    param_2: 'Net difference',
    param_3: 'Net advancing count',
    param_4: 'Timestamp'
  },
  
  // Weekly Performance (Bar Chart)
  WEEKLY_PERFORMANCE: {
    param_0: 'Weekly % change',
    param_1: 'Current Price',
    param_2: 'Previous Close',
    param_3: 'R-Factor',
    param_4: 'Timestamp'
  },
  
  // 10-Day/50-Day Breakouts (UP/DOWN)
  BREAKOUT: {
    param_0: 'LTP (Last Traded Price)',
    param_1: 'Previous Close',
    param_2: '% Change',
    param_3: 'Sector',
    param_4: 'Date (YYYY-MM-DD)'
  },
  
  // Swing Service Custom
  SWING_SERVICE: {
    param_0: 'Price / EMA / Indicator value',
    param_1: 'Fib level / EMA summary',
    param_2: 'Institutional Flow',
    param_3: 'Volume',
    param_4: 'Accumulation / Date etc.'
  },
  
  // Market Depth
  MARKET_DEPTH: {
    param_0: 'Price',
    param_1: 'Previous Close',
    param_2: '% Change',
    param_3: 'Volume',
    param_4: 'Timestamp'
  },
  
  // Money Flux
  MONEY_FLUX: {
    param_0: 'Heat Value',
    param_1: 'Sentiment Score',
    param_2: 'PCR Ratio',
    param_3: 'Volatility',
    param_4: 'Timestamp'
  },
  
  // Pro Setup
  PRO_SETUP: {
    param_0: 'Price',
    param_1: '% Change',
    param_2: '5-Min Spike',
    param_3: 'Volume',
    param_4: 'Timestamp'
  }
};

/**
 * Extract parameter value from standardized data structure
 * @param {Object} dataItem - Single data item from API response
 * @param {string} paramKey - Parameter key (e.g., 'param_0')
 * @returns {any} Parameter value
 */
export function getParamValue(dataItem, paramKey) {
  if (!dataItem || !paramKey) return null;
  
  // Handle both old format (direct param_X) and new format (params.param_X.value)
  if (dataItem.params && dataItem.params[paramKey]) {
    return dataItem.params[paramKey].value;
  }
  
  // Fallback to direct access for backward compatibility
  return dataItem[paramKey] || null;
}

/**
 * Extract parameter label from standardized data structure
 * @param {Object} dataItem - Single data item from API response
 * @param {string} paramKey - Parameter key (e.g., 'param_0')
 * @returns {string} Parameter label
 */
export function getParamLabel(dataItem, paramKey) {
  if (!dataItem || !paramKey) return paramKey;
  
  if (dataItem.params && dataItem.params[paramKey]) {
    return dataItem.params[paramKey].label || paramKey;
  }
  
  return paramKey;
}

/**
 * Format data for charts using parameter system
 * @param {Array} data - Array of data items
 * @param {string} xParam - Parameter for X-axis (default: Symbol)
 * @param {string} yParam - Parameter for Y-axis (default: param_0)
 * @returns {Array} Formatted chart data
 */
export function formatChartData(data, xParam = 'Symbol', yParam = 'param_0') {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => {
    const xValue = xParam === 'Symbol' ? item.Symbol : getParamValue(item, xParam);
    const yValue = getParamValue(item, yParam);
    
    return {
      x: xValue,
      y: yValue,
      label: getParamLabel(item, yParam),
      original: item
    };
  });
}

/**
 * Format data for tables using parameter system
 * @param {Array} data - Array of data items
 * @param {Array} columns - Column configuration
 * @returns {Array} Formatted table data
 */
export function formatTableData(data, columns) {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => {
    const formattedItem = { Symbol: item.Symbol };
    
    columns.forEach(col => {
      if (col.param) {
        formattedItem[col.key] = getParamValue(item, col.param);
        formattedItem[`${col.key}_label`] = getParamLabel(item, col.param);
      }
    });
    
    return formattedItem;
  });
}

/**
 * Get heatmap color based on parameter value
 * @param {number} value - Parameter value
 * @param {number} intensity - Intensity multiplier (default: 1.0)
 * @returns {string} CSS color string
 */
export function getHeatmapColor(value, intensity = 1.0) {
  if (typeof value !== 'number') return 'rgba(128, 128, 128, 0.3)';
  
  const absValue = Math.abs(value);
  const alpha = Math.min(absValue * intensity * 0.1, 0.8);
  
  if (value >= 0) {
    return `rgba(0, 200, 0, ${alpha})`; // Green for positive
  } else {
    return `rgba(200, 0, 0, ${alpha})`; // Red for negative
  }
}

/**
 * Format percentage values
 * @param {number} value - Numeric value
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 2) {
  if (typeof value !== 'number') return 'N/A';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format currency values
 * @param {number} value - Numeric value
 * @param {string} currency - Currency symbol (default: '₹')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, currency = '₹') {
  if (typeof value !== 'number') return 'N/A';
  
  if (value >= 10000000) { // 1 crore
    return `${currency}${(value / 10000000).toFixed(2)}Cr`;
  } else if (value >= 100000) { // 1 lakh
    return `${currency}${(value / 100000).toFixed(2)}L`;
  } else if (value >= 1000) { // 1 thousand
    return `${currency}${(value / 1000).toFixed(2)}K`;
  } else {
    return `${currency}${value.toFixed(2)}`;
  }
}

/**
 * Format volume values
 * @param {number} value - Volume value
 * @returns {string} Formatted volume string
 */
export function formatVolume(value) {
  if (typeof value !== 'number') return 'N/A';
  
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(2)}Cr`;
  } else if (value >= 100000) {
    return `${(value / 100000).toFixed(2)}L`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  } else {
    return value.toString();
  }
}

/**
 * Validate API response structure
 * @param {Object} response - API response
 * @returns {boolean} True if valid structure
 */
export function validateApiResponse(response) {
  if (!response || typeof response !== 'object') return false;
  
  // Check required fields
  if (!response.data || !Array.isArray(response.data)) return false;
  if (!response.name || typeof response.name !== 'string') return false;
  if (!response.timestamp || typeof response.timestamp !== 'string') return false;
  
  // Check data items structure
  return response.data.every(item => 
    item && 
    typeof item === 'object' && 
    typeof item.Symbol === 'string'
  );
}

/**
 * Helper to get context-specific parameter labels
 * @param {string} context - Context name from PARAM_CONTEXTS
 * @param {string} paramKey - Parameter key
 * @returns {string} Context-specific label
 */
export function getContextLabel(context, paramKey) {
  const contextDef = PARAM_CONTEXTS[context];
  if (contextDef && contextDef[paramKey]) {
    return contextDef[paramKey];
  }
  return paramKey;
}

/**
 * Create table columns for a specific context
 * @param {string} context - Context name from PARAM_CONTEXTS
 * @param {Array} visibleParams - Array of param keys to show (default: all)
 * @returns {Array} Column configuration
 */
export function createContextColumns(context, visibleParams = null) {
  const contextDef = PARAM_CONTEXTS[context];
  if (!contextDef) return [];
  
  const params = visibleParams || Object.keys(contextDef);
  
  const columns = [
    { key: 'symbol', title: 'Symbol', param: null }
  ];
  
  params.forEach(param => {
    columns.push({
      key: param.replace('param_', 'value_'),
      title: contextDef[param],
      param: param
    });
  });
  
  return columns;
}

export default {
  PARAM_CONTEXTS,
  getParamValue,
  getParamLabel,
  formatChartData,
  formatTableData,
  getHeatmapColor,
  formatPercentage,
  formatCurrency,
  formatVolume,
  validateApiResponse,
  getContextLabel,
  createContextColumns
};
