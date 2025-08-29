import { getParamValue, formatParamValue } from './paramUtils';

/**
 * Get formatted FII/DII data for display
 * @param {Object} item - The FII/DII data item with params
 * @returns {Object} Formatted data for display
 */
export const formatFiiDiiData = (item) => {
  if (!item) return {};
  
  // Get values using paramUtils
  const fiiNet = getParamValue(item, 'fii_net');
  const diiNet = getParamValue(item, 'dii_net');
  const totalNet = getParamValue(item, 'total_net');
  const flowRatio = getParamValue(item, 'flow_ratio');
  const timestamp = getParamValue(item, 'timestamp');
  
  // Format values for display
  return {
    symbol: item.Symbol || formatDate(timestamp),
    fii_buy: formatParamValue(getParamValue(item, 'fii_buy'), { format: 'number', decimals: 2 }),
    fii_sell: formatParamValue(getParamValue(item, 'fii_sell'), { format: 'number', decimals: 2 }),
    fii_net: formatParamValue(fiiNet, { format: 'number', decimals: 2 }),
    dii_buy: formatParamValue(getParamValue(item, 'dii_buy'), { format: 'number', decimals: 2 }),
    dii_sell: formatParamValue(getParamValue(item, 'dii_sell'), { format: 'number', decimals: 2 }),
    dii_net: formatParamValue(diiNet, { format: 'number', decimals: 2 }),
    total_net: formatParamValue(totalNet, { format: 'number', decimals: 2 }),
    flow_ratio: formatParamValue(flowRatio, { format: 'number', decimals: 2 }),
    timestamp: timestamp
  };
};

/**
 * Format date from timestamp
 * @param {string|number} timestamp - The timestamp to format
 * @returns {string} Formatted date string
 */
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Get CSS class for value styling
 * @param {number} value - The numeric value
 * @returns {string} CSS class name
 */
export const getValueClass = (value) => {
  if (value > 0) return 'positive-value';
  if (value < 0) return 'negative-value';
  return 'neutral-value';
};

/**
 * Process FII/DII API response to ensure consistent format
 * @param {Array|Object} response - The API response
 * @returns {Array} Processed data array
 */
export const processFiiDiiResponse = (response) => {
  if (!response) return [];
  
  // If response is already an array, return as is
  if (Array.isArray(response)) {
    return response.map(item => ({
      ...item,
      // Ensure params exists for backward compatibility
      params: item.params || {}
    }));
  }
  
  // Handle single object response
  return [{
    ...response,
    params: response.params || {}
  }];
};
