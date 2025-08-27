// Refactored Ollama AI Assistant JavaScript Integration
// This version uses modular components for better organization and maintainability

// Import required modules
// Note: In a real implementation, we would use ES6 imports or a module bundler
// For now, we assume the modules are loaded globally

class OllamaAssistant {
    constructor() {
        // Initialize core module
        this.core = new OllamaCore();
        
        // Initialize UI module (assuming a container with ID 'ollamaChatContainer')
        this.ui = new OllamaUI('ollamaChatContainer');
        
        // Initialize analytics module
        this.analytics = new OllamaAnalytics(this.core.apiBaseUrl);
        
        this.init();
    }

    // Initialize the Ollama assistant
    init() {
        this.checkOllamaHealth();
        this.setupEventListeners();
        this.loadConversationHistory();
    }

    // Setup event listeners
    setupEventListeners() {
        // Chat form submission
        const form = document.getElementById('ollamaForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }

        // Stock analysis buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('analyze-stock-btn') || e.target.closest('.analyze-stock-btn')) {
                const button = e.target.classList.contains('analyze-stock-btn') ? e.target : e.target.closest('.analyze-stock-btn');
                const symbol = button.dataset.symbol;
                const price = button.dataset.price;
                const change = button.dataset.change;
                this.analyzeStock(symbol, price, change);
            }
        });

        // Trade rationale buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('trade-rationale-btn') || e.target.closest('.trade-rationale-btn')) {
                const button = e.target.classList.contains('trade-rationale-btn') ? e.target : e.target.closest('.trade-rationale-btn');
                const symbol = button.dataset.symbol;
                const action = button.dataset.action || 'BUY';
                const price = button.dataset.price;
                this.generateTradeRationale(symbol, action, price);
            }
        });

        // Clear chat button
        const clearButton = document.getElementById('clearChat');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.clearChat();
            });
        }

        // Enter key handling in textarea
        const input = document.getElementById('ollamaInput');
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    }

    // Check Ollama service health
    async checkOllamaHealth() {
        try {
            const data = await this.core.checkOllamaHealth();
            
            const statusIndicator = document.getElementById('ollamaStatus');
            const statusText = document.getElementById('ollamaStatusText');
            this.ui.updateHealthStatus(data.success, statusIndicator, statusText);
            
            if (!data.success) {
                this.ui.addMessageToChat('error', 'Ollama AI service is not available. Please check if Ollama is running.');
            } else {
                this.ui.addMessageToChat('system', 'Ollama AI assistant is ready!');
                this.loadAvailableModels();
            }
            
        } catch (error) {
            console.error('Health check failed:', error);
            const statusIndicator = document.getElementById('ollamaStatus');
            const statusText = document.getElementById('ollamaStatusText');
            this.ui.updateHealthStatus(false, statusIndicator, statusText);
            this.ui.addMessageToChat('error', 'Unable to connect to Ollama service.');
        }
    }

    // Load available models
    async loadAvailableModels() {
        try {
            const data = await this.core.loadAvailableModels();
            
            if (data.success) {
                const modelSelect = document.getElementById('ollamaModel');
                this.ui.populateModelSelect(data.data.models, data.data.default_model, modelSelect);
            }
        } catch (error) {
            console.error('Failed to load models:', error);
        }
    }

    // Send message to Ollama
    async sendMessage() {
        const input = document.getElementById('ollamaInput');
        const message = input.value.trim();
        
        if (!message || this.core.getProcessingState()) return;
        
        // Add user message to chat
        this.ui.addMessageToChat('user', message);
        
        // Clear input and show processing
        input.value = '';
        this.core.setProcessingState(true);
        
        // Update UI elements
        const submitBtn = document.getElementById('ollamaSubmit');
        this.ui.updateSubmitButton(true, submitBtn);
        this.ui.updateInputState(true, input);
        this.ui.addTypingIndicator();
        
        try {
            const modelSelect = document.getElementById('ollamaModel');
            const model = modelSelect ? modelSelect.value : 'llama2';
            
            const data = await this.core.sendMessage(message, model);
            
            this.ui.removeTypingIndicator();
            
            if (data.success) {
                this.ui.addMessageToChat('assistant', data.data.response);
                this.core.saveToHistory('user', message);
                this.core.saveToHistory('assistant', data.data.response);
            } else {
                this.ui.addMessageToChat('error', 'Failed to get response from AI assistant.');
            }
            
        } catch (error) {
            console.error('Message send failed:', error);
            this.ui.removeTypingIndicator();
            this.ui.addMessageToChat('error', 'Error communicating with AI assistant.');
        } finally {
            this.core.setProcessingState(false);
            this.ui.updateSubmitButton(false, submitBtn);
            this.ui.updateInputState(false, input);
        }
    }

    // Analyze stock using AI
    async analyzeStock(symbol, currentPrice = null, priceChangePercent = null) {
        if (this.core.getProcessingState()) return;
        
        this.core.setProcessingState(true);
        
        // Update UI elements
        const submitBtn = document.getElementById('ollamaSubmit');
        const input = document.getElementById('ollamaInput');
        this.ui.updateSubmitButton(true, submitBtn);
        this.ui.updateInputState(true, input);
        this.ui.addTypingIndicator();
        
        // Add analysis request to chat
        this.ui.addMessageToChat('user', `Analyze ${symbol}${currentPrice ? ` (₹${currentPrice})` : ''}`);
        
        try {
            const data = await this.analytics.analyzeStock(symbol, currentPrice, priceChangePercent);
            
            this.ui.removeTypingIndicator();
            
            if (data.success) {
                this.ui.addMessageToChat('assistant', data.data.response, 'analysis');
                this.core.saveToHistory('user', `Analyze ${symbol}`);
                this.core.saveToHistory('assistant', data.data.response);
            } else {
                this.ui.addMessageToChat('error', 'Failed to analyze stock.');
            }
            
        } catch (error) {
            console.error('Stock analysis failed:', error);
            this.ui.removeTypingIndicator();
            this.ui.addMessageToChat('error', 'Error analyzing stock.');
        } finally {
            this.core.setProcessingState(false);
            this.ui.updateSubmitButton(false, submitBtn);
            this.ui.updateInputState(false, input);
        }
    }

    // Generate trade rationale
    async generateTradeRationale(symbol, action = 'BUY', currentPrice = null, targetPrice = null) {
        if (this.core.getProcessingState()) return;
        
        this.core.setProcessingState(true);
        
        // Update UI elements
        const submitBtn = document.getElementById('ollamaSubmit');
        const input = document.getElementById('ollamaInput');
        this.ui.updateSubmitButton(true, submitBtn);
        this.ui.updateInputState(true, input);
        this.ui.addTypingIndicator();
        
        // Add rationale request to chat
        this.ui.addMessageToChat('user', `Generate ${action} rationale for ${symbol}`);
        
        try {
            const data = await this.analytics.generateTradeRationale(symbol, action, currentPrice, targetPrice);
            
            this.ui.removeTypingIndicator();
            
            if (data.success) {
                this.ui.addMessageToChat('assistant', data.data.response, 'rationale');
                this.core.saveToHistory('user', `Generate ${action} rationale for ${symbol}`);
                this.core.saveToHistory('assistant', data.data.response);
            } else {
                this.ui.addMessageToChat('error', 'Failed to generate trade rationale.');
            }
            
        } catch (error) {
            console.error('Trade rationale failed:', error);
            this.ui.removeTypingIndicator();
            this.ui.addMessageToChat('error', 'Error generating trade rationale.');
        } finally {
            this.core.setProcessingState(false);
            this.ui.updateSubmitButton(false, submitBtn);
            this.ui.updateInputState(false, input);
        }
    }

    // Load conversation history
    loadConversationHistory() {
        const history = this.core.loadConversationHistory();
        
        // Restore last few messages
        const recentMessages = history.slice(-6);
        recentMessages.forEach(msg => {
            this.ui.addMessageToChat(msg.type, msg.content);
        });
    }

    // Clear chat
    clearChat() {
        this.ui.clearChat();
        this.core.clearConversationHistory();
        this.ui.addMessageToChat('system', 'Chat cleared. How can I help you with your trading analysis?');
    }

    // Quick analysis presets
    quickAnalysis(type) {
        const presets = this.analytics.getQuickAnalysisPresets();
        
        const input = document.getElementById('ollamaInput');
        if (input && presets[type]) {
            input.value = presets[type];
        }
    }
}

// Global variable for Ollama assistant
let ollamaAssistant;

// Initialize Ollama assistant
function initializeOllamaAssistant() {
    ollamaAssistant = new OllamaAssistant();
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if Ollama elements are present on the page
    if (document.getElementById('ollamaContainer') || document.querySelector('.ollama-assistant')) {
        initializeOllamaAssistant();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OllamaAssistant;
}