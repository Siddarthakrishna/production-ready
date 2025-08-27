// Ollama Core Module
// This module contains the core functionality for Ollama integration

class OllamaCore {
    constructor() {
        this.apiBaseUrl = '/api/ollama';
        this.isProcessing = false;
        this.conversationHistory = [];
        this.maxHistoryLength = 10;
    }

    // Check Ollama service health
    async checkOllamaHealth() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Health check failed:', error);
            return { success: false, status: 'unavailable' };
        }
    }

    // Load available models
    async loadAvailableModels() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/models`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to load models:', error);
            return { success: false, data: { models: [], default_model: 'llama2' } };
        }
    }

    // Send message to Ollama
    async sendMessage(prompt, model = 'llama2', systemMessage = 'You are a helpful financial analysis assistant. Provide concise, practical insights about stocks, trading, and market analysis.') {
        try {
            const response = await fetch(`${this.apiBaseUrl}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    model: model,
                    system: systemMessage
                })
            });

            return await response.json();
        } catch (error) {
            console.error('Message send failed:', error);
            throw error;
        }
    }

    // Save to conversation history
    saveToHistory(type, content) {
        this.conversationHistory.push({
            type: type,
            content: content,
            timestamp: new Date().toISOString()
        });
        
        // Limit history length
        if (this.conversationHistory.length > this.maxHistoryLength * 2) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
        }
        
        // Save to localStorage
        localStorage.setItem('ollama_conversation_history', JSON.stringify(this.conversationHistory));
    }

    // Load conversation history
    loadConversationHistory() {
        try {
            const stored = localStorage.getItem('ollama_conversation_history');
            if (stored) {
                this.conversationHistory = JSON.parse(stored);
            }
            return this.conversationHistory;
        } catch (error) {
            console.error('Failed to load conversation history:', error);
            return [];
        }
    }

    // Clear conversation history
    clearConversationHistory() {
        this.conversationHistory = [];
        localStorage.removeItem('ollama_conversation_history');
    }

    // Set processing state
    setProcessingState(processing) {
        this.isProcessing = processing;
    }

    // Get processing state
    getProcessingState() {
        return this.isProcessing;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OllamaCore;
} else if (typeof window !== 'undefined') {
    window.OllamaCore = OllamaCore;
}