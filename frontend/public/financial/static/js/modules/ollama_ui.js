// Ollama UI Module
// This module handles the UI components for Ollama integration

class OllamaUI {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
    }

    // Add message to chat interface
    addMessageToChat(type, content, category = null) {
        if (!this.container) {
            console.error('Chat container not found');
            return;
        }

        const timestamp = new Date().toLocaleTimeString();
        
        let messageClass = '';
        let icon = '';
        let sender = '';
        
        switch (type) {
            case 'user':
                messageClass = 'user-message';
                icon = '👤';
                sender = 'You';
                break;
            case 'assistant':
                messageClass = 'assistant-message';
                icon = '🤖';
                sender = 'AI Assistant';
                if (category === 'analysis') icon = '📊';
                if (category === 'rationale') icon = '💡';
                if (category === 'portfolio') icon = '📈';
                break;
            case 'error':
                messageClass = 'error-message';
                icon = '❌';
                sender = 'System';
                break;
            case 'system':
                messageClass = 'system-message';
                icon = 'ℹ️';
                sender = 'System';
                break;
        }
        
        const messageHtml = `
            <div class="chat-message ${messageClass}">
                <div class="message-header">
                    <span class="message-sender">${icon} ${sender}</span>
                    <span class="message-time">${timestamp}</span>
                </div>
                <div class="message-content">
                    ${this.formatMessage(content)}
                </div>
            </div>
        `;
        
        this.container.insertAdjacentHTML('beforeend', messageHtml);
        this.container.scrollTop = this.container.scrollHeight;
    }

    // Format message content
    formatMessage(content) {
        // Convert newlines to <br>
        let formatted = content.replace(/\n/g, '<br>');
        
        // Make **bold** text bold
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Make *italic* text italic
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert stock symbols to links (basic pattern)
        formatted = formatted.replace(/\b([A-Z]{2,10})\b/g, '<span class="stock-symbol">$1</span>');
        
        return formatted;
    }

    // Add typing indicator
    addTypingIndicator() {
        if (!this.container) {
            console.error('Chat container not found');
            return;
        }

        const typingHtml = `
            <div class="chat-message typing-indicator" id="typingIndicator">
                <div class="message-header">
                    <span class="message-sender">🤖 AI Assistant</span>
                </div>
                <div class="message-content">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        this.container.insertAdjacentHTML('beforeend', typingHtml);
        this.container.scrollTop = this.container.scrollHeight;
    }

    // Remove typing indicator
    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Update submit button state
    updateSubmitButton(processing, buttonElement) {
        if (!buttonElement) return;
        
        if (processing) {
            buttonElement.disabled = true;
            buttonElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        } else {
            buttonElement.disabled = false;
            buttonElement.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send';
        }
    }

    // Update input state
    updateInputState(processing, inputElement) {
        if (!inputElement) return;
        
        if (processing) {
            inputElement.disabled = true;
        } else {
            inputElement.disabled = false;
            inputElement.focus();
        }
    }

    // Clear chat container
    clearChat() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    // Update health status indicator
    updateHealthStatus(isHealthy, statusElement, textElement) {
        if (!statusElement || !textElement) return;
        
        if (isHealthy) {
            statusElement.className = 'fyers-auth-status status-success';
            textElement.textContent = 'AI Assistant Online';
        } else {
            statusElement.className = 'fyers-auth-status status-error';
            textElement.textContent = 'AI Assistant Offline';
        }
    }

    // Populate model selection dropdown
    populateModelSelect(models, defaultModel, selectElement) {
        if (!selectElement) return;
        
        selectElement.innerHTML = '';
        
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.name;
            option.textContent = model.name;
            if (model.name === defaultModel) {
                option.selected = true;
            }
            selectElement.appendChild(option);
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OllamaUI;
} else if (typeof window !== 'undefined') {
    window.OllamaUI = OllamaUI;
}