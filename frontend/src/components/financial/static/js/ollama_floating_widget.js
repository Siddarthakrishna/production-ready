// Ollama Floating Chat Widget
// This script creates a floating chatbot button that can be included on any page

class OllamaFloatingWidget {
    constructor() {
        this.widgetContainer = null;
        this.chatContainer = null;
        this.isOpen = false;
        this.apiBaseUrl = '/api/ollama';
        this.isProcessing = false;
        this.conversationHistory = [];
        
        this.init();
    }

    init() {
        this.createWidget();
        this.setupEventListeners();
        this.loadConversationHistory();
    }

    createWidget() {
        // Create the floating button
        const floatingButton = document.createElement('div');
        floatingButton.id = 'ollama-floating-button';
        floatingButton.className = 'ollama-floating-button';
        floatingButton.innerHTML = `
            <i class="fa-solid fa-robot"></i>
        `;
        
        // Create the chat container
        const chatContainer = document.createElement('div');
        chatContainer.id = 'ollama-chat-container';
        chatContainer.className = 'ollama-chat-container';
        chatContainer.innerHTML = `
            <div class="ollama-chat-header">
                <h5><i class="fa-solid fa-robot"></i> AI Assistant</h5>
                <button class="ollama-close-button">&times;</button>
            </div>
            <div class="ollama-chat-messages" id="ollama-chat-messages">
                <!-- Messages will be populated here -->
            </div>
            <div class="ollama-chat-input">
                <form id="ollama-floating-form">
                    <div class="input-group">
                        <textarea class="form-control" id="ollama-floating-input" 
                                placeholder="Ask me anything..." 
                                rows="2"></textarea>
                        <button class="btn btn-primary" type="submit" id="ollama-floating-submit">
                            <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(floatingButton);
        document.body.appendChild(chatContainer);
        
        this.widgetContainer = floatingButton;
        this.chatContainer = chatContainer;
    }

    setupEventListeners() {
        // Toggle chat when floating button is clicked
        this.widgetContainer.addEventListener('click', () => {
            this.toggleChat();
        });
        
        // Close chat when close button is clicked
        const closeButton = this.chatContainer.querySelector('.ollama-close-button');
        closeButton.addEventListener('click', () => {
            this.closeChat();
        });
        
        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !this.chatContainer.contains(e.target) && 
                !this.widgetContainer.contains(e.target)) {
                this.closeChat();
            }
        });
        
        // Handle form submission
        const form = this.chatContainer.querySelector('#ollama-floating-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });
        
        // Handle Enter key for sending message
        const input = this.chatContainer.querySelector('#ollama-floating-input');
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        this.isOpen = true;
        this.widgetContainer.classList.add('active');
        this.chatContainer.classList.add('open');
        // Focus on input
        this.chatContainer.querySelector('#ollama-floating-input').focus();
    }

    closeChat() {
        this.isOpen = false;
        this.widgetContainer.classList.remove('active');
        this.chatContainer.classList.remove('open');
    }

    async sendMessage() {
        const input = this.chatContainer.querySelector('#ollama-floating-input');
        const message = input.value.trim();
        
        if (!message || this.isProcessing) return;
        
        // Add user message to chat
        this.addMessageToChat('user', message);
        
        // Clear input and show processing
        input.value = '';
        this.setProcessingState(true);
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: message,
                    model: 'llama2',
                    system: 'You are a helpful financial analysis assistant. Provide concise, practical insights about stocks, trading, and market analysis.'
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.addMessageToChat('assistant', data.data.response);
                this.saveToHistory('user', message);
                this.saveToHistory('assistant', data.data.response);
            } else {
                this.addMessageToChat('error', 'Failed to get response from AI assistant.');
            }
            
        } catch (error) {
            console.error('Message send failed:', error);
            this.addMessageToChat('error', 'Error communicating with AI assistant.');
        } finally {
            this.setProcessingState(false);
        }
    }

    addMessageToChat(type, content) {
        const chatMessages = this.chatContainer.querySelector('#ollama-chat-messages');
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
            <div class="ollama-chat-message ${messageClass}">
                <div class="ollama-message-header">
                    <span class="ollama-message-sender">${icon} ${sender}</span>
                    <span class="ollama-message-time">${timestamp}</span>
                </div>
                <div class="ollama-message-content">
                    ${this.formatMessage(content)}
                </div>
            </div>
        `;
        
        chatMessages.insertAdjacentHTML('beforeend', messageHtml);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    formatMessage(content) {
        // Convert newlines to <br>
        let formatted = content.replace(/\n/g, '<br>');
        
        // Make **bold** text bold
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Make *italic* text italic
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        return formatted;
    }

    setProcessingState(processing) {
        this.isProcessing = processing;
        const submitBtn = this.chatContainer.querySelector('#ollama-floating-submit');
        const input = this.chatContainer.querySelector('#ollama-floating-input');
        
        if (processing) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            input.disabled = true;
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
            input.disabled = false;
        }
    }

    saveToHistory(type, content) {
        this.conversationHistory.push({
            type: type,
            content: content,
            timestamp: new Date().toISOString()
        });
        
        // Limit history length
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }
        
        // Save to localStorage
        localStorage.setItem('ollama_floating_history', JSON.stringify(this.conversationHistory));
    }

    loadConversationHistory() {
        try {
            const stored = localStorage.getItem('ollama_floating_history');
            if (stored) {
                this.conversationHistory = JSON.parse(stored);
                
                // Restore last few messages
                const recentMessages = this.conversationHistory.slice(-6);
                recentMessages.forEach(msg => {
                    this.addMessageToChat(msg.type, msg.content);
                });
            }
        } catch (error) {
            console.error('Failed to load conversation history:', error);
        }
    }
}

// Initialize widget when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're not on the dedicated Ollama assistant page
    if (!window.location.pathname.includes('ollama_assistant.html')) {
        window.ollamaWidget = new OllamaFloatingWidget();
    }
});

// Add CSS for the widget
const widgetStyles = `
    .ollama-floating-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background-color: #8e44ad;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        z-index: 10000;
        transition: all 0.3s ease;
    }
    
    .ollama-floating-button:hover {
        background-color: #7d3c98;
        transform: scale(1.1);
    }
    
    .ollama-floating-button.active {
        transform: scale(0.9);
    }
    
    .ollama-chat-container {
        position: fixed;
        bottom: 100px;
        right: 20px;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
        z-index: 10000;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        visibility: hidden;
    }
    
    .ollama-chat-container.open {
        opacity: 1;
        transform: translateY(0);
        visibility: visible;
    }
    
    .ollama-chat-header {
        background: linear-gradient(135deg, #8e44ad 0%, #3498db 100%);
        color: white;
        padding: 15px;
        border-radius: 10px 10px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .ollama-close-button {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .ollama-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
        background-color: #f8f9fa;
    }
    
    .ollama-chat-message {
        margin-bottom: 15px;
    }
    
    .ollama-message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
        font-size: 0.8em;
    }
    
    .ollama-message-sender {
        font-weight: 600;
    }
    
    .ollama-message-time {
        color: #6c757d;
    }
    
    .ollama-message-content {
        padding: 10px;
        border-radius: 8px;
        line-height: 1.4;
    }
    
    .user-message .ollama-message-content {
        background-color: #007bff;
        color: white;
        margin-left: 20%;
    }
    
    .assistant-message .ollama-message-content {
        background-color: white;
        border: 1px solid #dee2e6;
        margin-right: 20%;
    }
    
    .system-message .ollama-message-content {
        background-color: #e9ecef;
        color: #495057;
        text-align: center;
        font-style: italic;
    }
    
    .error-message .ollama-message-content {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    
    .ollama-chat-input {
        padding: 15px;
        border-top: 1px solid #dee2e6;
        background: white;
        border-radius: 0 0 10px 10px;
    }
    
    @media (max-width: 768px) {
        .ollama-chat-container {
            width: calc(100% - 40px);
            height: 70vh;
            bottom: 90px;
        }
    }
`;

// Add styles to the document
const styleElement = document.createElement('style');
styleElement.textContent = widgetStyles;
document.head.appendChild(styleElement);