// Ollama Analytics Module
// This module contains specialized functions for stock analysis and trading insights

class OllamaAnalytics {
    constructor(apiBaseUrl = '/api/ollama') {
        this.apiBaseUrl = apiBaseUrl;
    }

    // Analyze stock using AI
    async analyzeStock(symbol, currentPrice = null, priceChangePercent = null) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/stock-analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    symbol: symbol,
                    current_price: currentPrice,
                    price_change_percent: priceChangePercent,
                    analysis_type: 'summary'
                })
            });

            return await response.json();
        } catch (error) {
            console.error('Stock analysis failed:', error);
            throw error;
        }
    }

    // Generate trade rationale
    async generateTradeRationale(symbol, action = 'BUY', currentPrice = null, targetPrice = null, timeframe = 'Medium term') {
        try {
            const response = await fetch(`${this.apiBaseUrl}/trade-rationale`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    symbol: symbol,
                    action: action,
                    current_price: currentPrice || 0,
                    target_price: targetPrice,
                    timeframe: timeframe
                })
            });

            return await response.json();
        } catch (error) {
            console.error('Trade rationale failed:', error);
            throw error;
        }
    }

    // Enhance notes using AI
    async enhanceNotes(symbol, originalNotes) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/summarize-notes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    symbol: symbol,
                    notes: originalNotes
                })
            });

            const data = await response.json();
            
            if (data.success) {
                return data.data.response;
            } else {
                throw new Error('Failed to enhance notes');
            }
        } catch (error) {
            console.error('Notes enhancement failed:', error);
            throw error;
        }
    }

    // Generate portfolio insights
    async generatePortfolioInsights(watchlistData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/portfolio-insights`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(watchlistData)
            });

            return await response.json();
        } catch (error) {
            console.error('Portfolio analysis failed:', error);
            throw error;
        }
    }

    // Quick analysis presets
    getQuickAnalysisPresets() {
        return {
            market_overview: "What's the current market sentiment? Any key trends I should watch?",
            sector_analysis: "Which sectors are showing strength today? Any rotation patterns?",
            risk_assessment: "What are the major risks in the current market environment?",
            opportunities: "What trading opportunities do you see in the current market?"
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OllamaAnalytics;
} else if (typeof window !== 'undefined') {
    window.OllamaAnalytics = OllamaAnalytics;
}