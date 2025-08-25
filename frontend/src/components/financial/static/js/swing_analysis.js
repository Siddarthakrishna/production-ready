// Configuration
const API_BASE_URL = 'http://localhost:8000'; // Update with your API URL

// Format number with 2 decimal places
const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return parseFloat(num).toFixed(2);
};

// Format percentage
const formatPercent = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return (parseFloat(num) * 100).toFixed(2) + '%';
};

// Get color based on value (green for positive, red for negative)
const getColorClass = (value) => {
    if (value === null || value === undefined) return '';
    return parseFloat(value) > 0 ? 'text-success' : 'text-danger';
};

// Format institutional flow score
const formatInstitutionalFlow = (score) => {
    if (score === null || score === undefined) return 'N/A';
    const formatted = (parseFloat(score) * 100).toFixed(2);
    return `<span class="${getColorClass(score)}">${formatted}%</span>`;
};

// Format volume ratio
const formatVolumeRatio = (ratio) => {
    if (ratio === null || ratio === undefined) return 'N/A';
    return `${parseFloat(ratio).toFixed(2)}x`;
};

// Format Fibonacci level
const formatFibLevel = (level) => {
    if (level === null || level === undefined) return 'N/A';
    return `61.8%`; // Simplified for demo
};

// Format EMA values
const formatEMAs = (ema25, ema50, ema100) => {
    if (!ema25 || !ema50 || !ema100) return 'N/A';
    return `${formatNumber(ema25)} / ${formatNumber(ema50)} / ${formatNumber(ema100)}`;
};

// Load short term bullish swings
const loadShortTermBullish = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/swing/short-term/bullish`);
        const data = await response.json();
        
        const tbody = document.getElementById('shortTermBullishBody');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No bullish signals found</td></tr>';
            return;
        }
        
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${item.symbol}</strong></td>
                <td>${formatNumber(item.current_price)}</td>
                <td>${formatFibLevel(item.fib_level)}</td>
                <td>${formatInstitutionalFlow(item.institutional_flow)}</td>
                <td>${formatVolumeRatio(item.unusual_volume_ratio)}</td>
                <td>${item.accumulation_detected ? '✅' : '❌'}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading short term bullish:', error);
        document.getElementById('shortTermBullishBody').innerHTML = 
            '<tr><td colspan="6" class="text-center text-danger">Error loading data</td></tr>';
    }
};

// Load short term bearish swings
const loadShortTermBearish = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/swing/short-term/bearish`);
        const data = await response.json();
        
        const tbody = document.getElementById('shortTermBearishBody');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No bearish signals found</td></tr>';
            return;
        }
        
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${item.symbol}</strong></td>
                <td>${formatNumber(item.current_price)}</td>
                <td>${formatFibLevel(item.fib_level)}</td>
                <td>${formatInstitutionalFlow(item.institutional_flow)}</td>
                <td>${formatVolumeRatio(item.unusual_volume_ratio)}</td>
                <td>${item.accumulation_detected ? '✅' : '❌'}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading short term bearish:', error);
        document.getElementById('shortTermBearishBody').innerHTML = 
            '<tr><td colspan="6" class="text-center text-danger">Error loading data</td></tr>';
    }
};

// Load long term bullish swings
const loadLongTermBullish = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/swing/long-term/bullish`);
        const data = await response.json();
        
        const tbody = document.getElementById('longTermBullishBody');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No bullish signals found</td></tr>';
            return;
        }
        
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${item.symbol}</strong></td>
                <td>${formatNumber(item.current_price)}</td>
                <td>${formatEMAs(item.ema_25, item.ema_50, item.ema_100)}</td>
                <td>${formatNumber(item.vwap)}</td>
                <td>${formatInstitutionalFlow(item.institutional_flow_score)}</td>
                <td>${formatVolumeRatio(item.unusual_volume_ratio)}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading long term bullish:', error);
        document.getElementById('longTermBullishBody').innerHTML = 
            '<tr><td colspan="6" class="text-center text-danger">Error loading data</td></tr>';
    }
};

// Load long term bearish swings
const loadLongTermBearish = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/swing/long-term/bearish`);
        const data = await response.json();
        
        const tbody = document.getElementById('longTermBearishBody');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No bearish signals found</td></tr>';
            return;
        }
        
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${item.symbol}</strong></td>
                <td>${formatNumber(item.current_price)}</td>
                <td>${formatEMAs(item.ema_25, item.ema_50, item.ema_100)}</td>
                <td>${formatNumber(item.vwap)}</td>
                <td>${formatInstitutionalFlow(item.institutional_flow_score)}</td>
                <td>${formatVolumeRatio(item.unusual_volume_ratio)}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading long term bearish:', error);
        document.getElementById('longTermBearishBody').innerHTML = 
            '<tr><td colspan="6" class="text-center text-danger">Error loading data</td></tr>';
    }
};

// Initialize data tables with search functionality
const initDataTables = () => {
    // Initialize DataTables for each table
    const tables = {
        'shortTermBullishFilter': 'shortTermBullishTable',
        'shortTermBearishFilter': 'shortTermBearishTable',
        'longTermBullishFilter': 'longTermBullishTable',
        'longTermBearishFilter': 'longTermBearishTable'
    };

    Object.entries(tables).forEach(([filterId, tableId]) => {
        const filterInput = document.getElementById(filterId);
        if (filterInput) {
            filterInput.addEventListener('keyup', () => {
                const filter = filterInput.value.toLowerCase();
                const table = document.getElementById(tableId);
                const rows = table.getElementsByTagName('tr');

                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    const cells = row.getElementsByTagName('td');
                    let shouldShow = false;

                    for (let j = 0; j < cells.length; j++) {
                        const cell = cells[j];
                        if (cell.textContent.toLowerCase().indexOf(filter) > -1) {
                            shouldShow = true;
                            break;
                        }
                    }

                    row.style.display = shouldShow ? '' : 'none';
                }
            });
        }
    });
};

// Load all data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadShortTermBullish();
    loadShortTermBearish();
    loadLongTermBullish();
    loadLongTermBearish();
    
    // Initialize data tables
    initDataTables();
    
    // Refresh data every 5 minutes
    setInterval(() => {
        loadShortTermBullish();
        loadShortTermBearish();
        loadLongTermBullish();
        loadLongTermBearish();
    }, 5 * 60 * 1000);
});
