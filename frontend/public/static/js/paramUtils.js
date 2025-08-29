/**
 * Parameter System Utilities for Scanner Module
 * 
 * This file provides utilities to work with the global parameter system
 * in a format compatible with legacy jQuery-based code.
 * 
 * Scanner Parameter Format:
 * - Symbol: Stock identifier
 * - param_0: Last Trading Price (LTP)
 * - param_1: Previous Close (calculated/mocked)
 * - param_2: Volume (HD) / Avg Delivery % (DSP)
 * - param_3: Avg Delivery % (HD) / Delivery % (DSP)
 * - param_4: DateTime (YYYY-MM-DD HH:mm:ss)
 */

(function(window) {
    'use strict';

    // Parameter context definitions for scanners
    const SCANNER_CONTEXTS = {
        HIGHEST_DELIVERY: {
            param_0: 'Last Trading Price',
            param_1: 'Previous Close',
            param_2: 'Volume',
            param_3: 'Average Delivery %',
            param_4: 'DateTime'
        },
        DELIVERY_SPIKE: {
            param_0: 'Last Trading Price',
            param_1: 'Previous Close',
            param_2: 'Average Delivery %',
            param_3: 'Current Delivery %',
            param_4: 'DateTime'
        }
    };

    /**
     * Extract parameter value from data item
     * @param {Object} dataItem - Single data item
     * @param {string} paramKey - Parameter key (e.g., 'param_0')
     * @returns {any} Parameter value
     */
    function getParamValue(dataItem, paramKey) {
        if (!dataItem || !paramKey) return null;
        
        // Handle nested params structure
        if (dataItem.params && dataItem.params[paramKey]) {
            return dataItem.params[paramKey].value;
        }
        
        // Direct access for flat structure
        return dataItem[paramKey] || null;
    }

    /**
     * Format volume values for display
     * @param {number} value - Volume value
     * @returns {string} Formatted volume string
     */
    function formatVolume(value) {
        if (typeof value !== 'number' || isNaN(value)) return 'N/A';
        
        if (value >= 10000000) {
            return `${(value / 10000000).toFixed(2)}Cr`;
        } else if (value >= 100000) {
            return `${(value / 100000).toFixed(2)}L`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(2)}K`;
        } else {
            return value.toLocaleString();
        }
    }

    /**
     * Format percentage values for display
     * @param {number} value - Numeric value
     * @param {number} decimals - Number of decimal places (default: 2)
     * @returns {string} Formatted percentage string
     */
    function formatPercentage(value, decimals = 2) {
        if (typeof value !== 'number' || isNaN(value)) return 'N/A';
        return `${value.toFixed(decimals)}%`;
    }

    /**
     * Format currency values for display
     * @param {number} value - Numeric value
     * @param {string} currency - Currency symbol (default: '₹')
     * @returns {string} Formatted currency string
     */
    function formatCurrency(value, currency = '₹') {
        if (typeof value !== 'number' || isNaN(value)) return 'N/A';
        
        if (value >= 10000000) {
            return `${currency}${(value / 10000000).toFixed(2)}Cr`;
        } else if (value >= 100000) {
            return `${currency}${(value / 100000).toFixed(2)}L`;
        } else if (value >= 1000) {
            return `${currency}${(value / 1000).toFixed(2)}K`;
        } else {
            return `${currency}${value.toFixed(2)}`;
        }
    }

    /**
     * Validate scanner data format
     * @param {Array} data - Scanner data array
     * @returns {boolean} True if valid format
     */
    function validateScannerData(data) {
        if (!Array.isArray(data)) return false;
        
        return data.every(item => 
            item && 
            typeof item === 'object' && 
            typeof item.Symbol === 'string' &&
            typeof item.param_0 !== 'undefined'
        );
    }

    /**
     * Create progress bar HTML for delivery percentage
     * @param {number} value - Percentage value (0-100)
     * @param {string} displayValue - Optional display value override
     * @returns {string} HTML string for progress bar
     */
    function createProgressBar(value, displayValue = null) {
        const safeValue = Math.max(0, Math.min(100, parseFloat(value) || 0));
        const display = displayValue || `${safeValue.toFixed(1)}%`;
        
        return `${display} <progress max="100" value="${safeValue}" style="width: 60px; height: 16px; margin-left: 5px;"></progress>`;
    }

    /**
     * Get color based on percentage change
     * @param {number} changePercent - Percentage change value
     * @returns {string} CSS color class or style
     */
    function getChangeColor(changePercent) {
        if (typeof changePercent !== 'number') return '';
        
        if (changePercent > 0) {
            return 'color: #28a745;'; // Green for positive
        } else if (changePercent < 0) {
            return 'color: #dc3545;'; // Red for negative
        } else {
            return 'color: #6c757d;'; // Gray for neutral
        }
    }

    /**
     * Calculate delivery percentage increase
     * @param {number} current - Current delivery percentage
     * @param {number} average - Average delivery percentage
     * @returns {number} Percentage point increase
     */
    function calculateDeliveryIncrease(current, average) {
        if (typeof current !== 'number' || typeof average !== 'number') return 0;
        return Math.max(0, current - average);
    }

    /**
     * Format timestamp for display
     * @param {string} timestamp - ISO timestamp or moment-compatible string
     * @returns {string} Formatted timestamp
     */
    function formatTimestamp(timestamp) {
        if (!timestamp) return 'N/A';
        
        try {
            // Use moment.js if available
            if (typeof moment !== 'undefined') {
                return moment(timestamp).format('DD MMM YYYY, HH:mm');
            }
            
            // Fallback to native Date
            const date = new Date(timestamp);
            return date.toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return timestamp;
        }
    }

    // Export functions to global window object for legacy compatibility
    window.paramUtils = {
        SCANNER_CONTEXTS,
        getParamValue,
        formatVolume,
        formatPercentage,
        formatCurrency,
        validateScannerData,
        createProgressBar,
        getChangeColor,
        calculateDeliveryIncrease,
        formatTimestamp
    };

    // Also attach individual functions for direct access
    window.getParamValue = getParamValue;
    window.formatVolume = formatVolume;
    window.formatPercentage = formatPercentage;

})(window);