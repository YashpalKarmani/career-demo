document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const API_BASE = 'http://localhost:8000';

    let currentSessionId = sessionStorage.getItem('careerly_session_id');
    let chatHistory = JSON.parse(sessionStorage.getItem('careerly_chat_history') || '[]');

    // Initialize session if not present
    async function initSession() {
        // Clear 'undefined' or 'null' strings that might have been saved
        if (currentSessionId === 'undefined' || currentSessionId === 'null') {
            currentSessionId = null;
            sessionStorage.removeItem('careerly_session_id');
        }

        if (!currentSessionId) {
            try {
                const response = await fetch(`${API_BASE}/session`, { method: 'POST' });
                const data = await response.json();
                currentSessionId = data.session_id;
                sessionStorage.setItem('careerly_session_id', currentSessionId);
                console.log('Session initialized:', currentSessionId);
            } catch (error) {
                console.error('Failed to init session:', error);
                addMessage('assistant', 'Sorry, I failed to connect to the server. Please make sure the backend is running.');
            }
        }
        renderHistory();
    }

    function addMessage(role, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = role === 'user' ? 'flex justify-end' : 'flex gap-3';

        if (role === 'user') {
            msgDiv.innerHTML = `
                <div class="max-w-[80%] bg-[#2563eb] rounded-2xl rounded-tr-md px-4 py-3 shadow-sm">
                    <p class="text-white text-sm">${text}</p>
                </div>
            `;
        } else {
            msgDiv.innerHTML = `
                <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563eb] to-[#10b981] flex items-center justify-center shadow-md">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div class="max-w-[80%] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                    <p class="text-slate-800 dark:text-slate-200 text-sm whitespace-pre-wrap">${text}</p>
                </div>
            `;
        }

        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function renderHistory() {
        chatHistory.forEach(msg => {
            if (msg.role === 'user' || msg.role === 'assistant') {
                addMessage(msg.role, msg.content);
            }
        });
    }

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text || !currentSessionId || currentSessionId === 'undefined') {
            if (!currentSessionId || currentSessionId === 'undefined') {
                addMessage('assistant', 'Your session expired or is invalid. Please refresh the page.');
            }
            return;
        }

        chatInput.value = '';
        addMessage('user', text);

        // Add a temporary typing indicator
        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = typingId;
        typingDiv.className = 'flex gap-3';
        typingDiv.innerHTML = `
            <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563eb] to-[#10b981] flex items-center justify-center opacity-50">
                <svg class="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <div class="bg-slate-100 rounded-2xl px-4 py-3">
                <div class="flex gap-1">
                    <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                    <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: currentSessionId,
                    message: text,
                    history: chatHistory
                })
            });

            const data = await response.json();
            document.getElementById(typingId).remove();

            if (data.response) {
                addMessage('assistant', data.response);
                chatHistory = data.history;
                sessionStorage.setItem('careerly_chat_history', JSON.stringify(chatHistory));
            }
        } catch (error) {
            console.error('Chat error:', error);
            document.getElementById(typingId).remove();
            addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    initSession();
});
