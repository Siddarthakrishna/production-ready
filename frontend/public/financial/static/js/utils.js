// Format currency with 2 decimal places
function formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Format percentage with 2 decimal places
function formatPercent(value, decimals = 2) {
    return `${value > 0 ? '+' : ''}${Number(value).toFixed(decimals)}%`;
}

// Format large numbers with K, M, B suffixes
function formatNumber(value, decimals = 2) {
    if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(decimals)}B`;
    } else if (value >= 1000000) {
        return `${(value / 1000000).toFixed(decimals)}M`;
    } else if (value >= 1000) {
        return `${(value / 1000).toFixed(decimals)}K`;
    }
    return value.toFixed(decimals);
}

// Format date to relative time (e.g., "2 hours ago")
function formatRelativeTime(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };
    
    for (const [unit, seconds] of Object.entries(intervals)) {
        const interval = Math.floor(diffInSeconds / seconds);
        if (interval >= 1) {
            return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
        }
    }
    
    return 'just now';
}

// Format date to a readable string
function formatDate(date, options = {}) {
    const defaultOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return new Date(date).toLocaleString('en-US', { ...defaultOptions, ...options });
}

// Get color based on value (positive/negative/neutral)
function getValueColor(value, neutralValue = 0) {
    const { COLORS } = (window.APP_CONFIG && window.APP_CONFIG.CHART) || { COLORS: { UP: '#00C853', DOWN: '#D50000', NEUTRAL: '#9E9E9E' } };
    
    if (value > neutralValue) {
        return COLORS.UP;
    } else if (value < neutralValue) {
        return COLORS.DOWN;
    } else {
        return COLORS.NEUTRAL;
    }
}

// Generate a unique ID
function generateId(prefix = '') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Debounce function to limit the rate of function calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function to limit the rate of function calls
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Deep clone an object
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Check if a value is empty
function isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    return false;
}

// Validate email format
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Show loading spinner
function showLoading(element) {
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border spinner-border-sm';
    spinner.setAttribute('role', 'status');
    
    if (element) {
        element.disabled = true;
        element.innerHTML = '';
        element.appendChild(spinner);
    }
    
    return spinner;
}

// Hide loading spinner
function hideLoading(element, originalContent) {
    if (element) {
        element.disabled = false;
        if (originalContent !== undefined) {
            element.innerHTML = originalContent;
        }
    }
}

// Show toast notification
function showToast(message, type = 'info', duration = 5000) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    const toastBody = document.createElement('div');
    toastBody.className = 'd-flex';
    
    const toastContent = document.createElement('div');
    toastContent.className = 'toast-body';
    toastContent.textContent = message;
    
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close btn-close-white me-2 m-auto';
    closeButton.setAttribute('data-bs-dismiss', 'toast');
    closeButton.setAttribute('aria-label', 'Close');
    
    toastBody.appendChild(toastContent);
    toastBody.appendChild(closeButton);
    toast.appendChild(toastBody);
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast, { delay: duration });
    bsToast.show();
    
    // Remove toast from DOM after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
    
    return bsToast;
}

// Export utility functions
window.utils = {
    formatCurrency,
    formatPercent,
    formatNumber,
    formatRelativeTime,
    formatDate,
    getValueColor,
    generateId,
    debounce,
    throttle,
    deepClone,
    isEmpty,
    isValidEmail,
    showLoading,
    hideLoading,
    showToast
};

export {
    formatCurrency,
    formatPercent,
    formatNumber,
    formatRelativeTime,
    formatDate,
    getValueColor,
    generateId,
    debounce,
    throttle,
    deepClone,
    isEmpty,
    isValidEmail,
    showLoading,
    hideLoading,
    showToast
};
