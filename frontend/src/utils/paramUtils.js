/**
 * Parameter Utilities
 * 
 * Helper functions for working with the global parameter system
 */

// Default heatmap color scheme
const DEFAULT_HEATMAP_COLORS = {
  negative: '#ff4444',  // Red for negative values
  neutral: '#f8f9fa',   // Light gray for neutral/zero
  positive: '#00c851'   // Green for positive values
};

/**
 * Get a parameter value from the normalized params object
 * @param {Object} params - The params object from the API response
 * @param {string} paramName - The parameter name (e.g., 'param_0')
 * @returns {*} The parameter value, or undefined if not found
 */
export const getParam = (params, paramName) => {
  if (!params || !params[paramName]) return undefined;
  return params[paramName].value;
};

/**
 * Get a parameter's metadata (label, type, etc.)
 * @param {Object} params - The params object from the API response
 * @param {string} paramName - The parameter name (e.g., 'param_0')
 * @returns {Object} The parameter metadata, or undefined if not found
 */
export const getParamMeta = (params, paramName) => {
  if (!params || !params[paramName]) return undefined;
  const { value, ...meta } = params[paramName];
  return meta;
};

/**
 * Convert legacy data format to the new parameter format
 * This is a migration helper and should be removed once all APIs are updated
 * @param {Object} legacyData - The legacy data object
 * @param {Object} paramMap - Mapping of legacy fields to param names
 * @returns {Object} The normalized data structure
 */
export const normalizeLegacyData = (legacyData, paramMap) => {
  if (!legacyData) return null;
  
  // If already in the new format, return as-is
  if (legacyData.params) return legacyData;
  
  const result = {
    ...legacyData,
    params: {}
  };
  
  // Map legacy fields to the new param structure
  Object.entries(paramMap).forEach(([legacyField, paramName]) => {
    if (legacyField in legacyData) {
      result.params[paramName] = {
        value: legacyData[legacyField],
        label: legacyField,
        type: typeof legacyData[legacyField]
      };
      
      // Remove the legacy field
      delete result[legacyField];
    }
  });
  
  return result;
};

/**
 * Get a human-readable label for a parameter
 * @param {Object} params - The params object
 * @param {string} paramName - The parameter name
 * @returns {string} The parameter label or the parameter name if not found
 */
export const getParamLabel = (params, paramName) => {
  const meta = getParamMeta(params, paramName);
  return meta?.label || paramName;
};

/**
 * Format a parameter value with its appropriate units
 * @param {Object} params - The params object
 * @param {string} paramName - The parameter name
 * @returns {string} The formatted value with units
 */
export const formatParamValue = (params, paramName) => {
  const value = getParam(params, paramName);
  if (value === undefined || value === null) return 'N/A';
  
  const meta = getParamMeta(params, paramName);
  
  // Handle different parameter types
  switch (meta?.type) {
    case 'percent':
    case 'percent_change':
      return `${value.toFixed(2)}%`;
    case 'price':
      return `₹${value.toLocaleString('en-IN')}`;
    case 'volume':
      // Format large numbers with K, M, B suffixes
      if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
      if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
      if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
      return value.toString();
    case 'timestamp':
      return new Date(value).toLocaleString();
    default:
      return value.toString();
  }
};

/**
 * Get heatmap color for a value
 * @param {number} value - The value to get color for
 * @param {Object} options - Configuration options
 * @param {number} [options.maxValue=1] - Maximum absolute value for scaling
 * @param {Object} [options.colors] - Custom color scheme
 * @returns {string} CSS color string
 */
export const getHeatmapColor = (value, { 
  maxValue = 1, 
  colors = DEFAULT_HEATMAP_COLORS 
} = {}) => {
  if (value === null || value === undefined) return colors.neutral;
  
  const absValue = Math.min(Math.abs(value), maxValue);
  const ratio = absValue / maxValue;
  
  if (value > 0) {
    const opacity = Math.min(0.2 + ratio * 0.8, 1); // 20-100% opacity
    return `${colors.positive}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  } else if (value < 0) {
    const opacity = Math.min(0.2 + ratio * 0.8, 1); // 20-100% opacity
    return `${colors.negative}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  }
  
  return colors.neutral;
};

/**
 * Get heatmap cell style for a value
 * @param {Object} params - The params object
 * @param {string} valueParam - Parameter name for the value
 * @param {string} [intensityParam] - Optional parameter for intensity
 * @param {Object} [options] - Additional options
 * @returns {Object} React/CSS style object
 */
export const getHeatmapCellStyle = (params, valueParam, intensityParam, options = {}) => {
  const value = getParam(params, valueParam);
  const intensity = intensityParam ? getParam(params, intensityParam) : 1;
  
  return {
    backgroundColor: getHeatmapColor(value, options),
    opacity: Math.min(0.3 + (intensity || 0) * 0.7, 1), // 30-100% opacity based on intensity
    transition: 'background-color 0.3s ease, opacity 0.3s ease',
    textAlign: 'center',
    ...options.additionalStyles
  };
};

/**
 * Format a heatmap value for display
 * @param {Object} params - The params object
 * @param {string} paramName - The parameter name
 * @param {Object} [options] - Formatting options
 * @returns {string} Formatted value
 */
export const formatHeatmapValue = (params, paramName, options = {}) => {
  const value = getParam(params, paramName);
  if (value === null || value === undefined) return '—';
  
  const {
    decimals = 2,
    withSign = true,
    withSymbol = false,
    symbol = '%'
  } = options;
  
  const formatted = value.toFixed(decimals);
  const prefix = withSign && value > 0 ? '+' : '';
  const suffix = withSymbol ? symbol : '';
  
  return `${prefix}${formatted}${suffix}`;
};

// Export the default color scheme for external use
export { DEFAULT_HEATMAP_COLORS };
