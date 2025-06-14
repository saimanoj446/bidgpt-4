document.addEventListener('DOMContentLoaded', () => {
    const chatbotIcon = document.getElementById('chatbotIcon');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const closeBtn = document.getElementById('closeBtn');
    const sendBtn = document.getElementById('sendBtn');
    const userInput = document.getElementById('userInput');
    const chatbotMessages = document.getElementById('chatbotMessages');

    // Feedback modal elements
    const feedbackBtn = document.querySelector('.feedback-btn');
    const feedbackModal = document.getElementById('feedbackModal');
    const feedbackOverlay = document.getElementById('feedbackOverlay');
    const feedbackCloseBtn = document.getElementById('feedbackCloseBtn');
    const feedbackCancelBtn = document.getElementById('feedbackCancelBtn');
    const feedbackEmojis = document.getElementById('feedbackEmojis');
    let selectedEmoji = null;

    // Toggle chatbot window
    chatbotIcon.addEventListener('click', () => {
        chatbotWindow.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        chatbotWindow.classList.remove('active');
    });

    // Feedback modal open/close logic
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', () => {
            feedbackModal.style.display = 'block';
            feedbackOverlay.style.display = 'block';
        });
    }
    function closeFeedbackModal() {
        feedbackModal.style.display = 'none';
        feedbackOverlay.style.display = 'none';
        // Reset emoji selection and textarea
        if (selectedEmoji) selectedEmoji.classList.remove('selected');
        selectedEmoji = null;
        document.getElementById('feedbackTextarea').value = '';
    }
    if (feedbackCloseBtn) feedbackCloseBtn.addEventListener('click', closeFeedbackModal);
    if (feedbackCancelBtn) feedbackCancelBtn.addEventListener('click', closeFeedbackModal);
    if (feedbackOverlay) feedbackOverlay.addEventListener('click', closeFeedbackModal);

    // Emoji selection logic
    if (feedbackEmojis) {
        feedbackEmojis.querySelectorAll('.emoji').forEach(emoji => {
            emoji.addEventListener('click', () => {
                if (selectedEmoji) selectedEmoji.classList.remove('selected');
                emoji.classList.add('selected');
                selectedEmoji = emoji;
            });
        });
    }

    // Function to add a message to the chat
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user' : 'bot');

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.innerHTML = markdownToHtml(message);

        messageDiv.appendChild(messageContent);
        chatbotMessages.appendChild(messageDiv);

        // Scroll to bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Handle sending messages
    function handleSendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, true);
            userInput.value = '';

            // Send to backend
            fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            })
            .then(res => res.json())
            .then(data => {
                addMessage(stripMarkdown(data.answer));
            })
            .catch(() => {
                addMessage('Sorry, there was an error connecting to the server.');
            });
        }
    }

    sendBtn.addEventListener('click', handleSendMessage);

    // Handle Enter key
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Close chatbot when clicking outside
    document.addEventListener('click', (e) => {
        if (!chatbotWindow.contains(e.target) && 
            !chatbotIcon.contains(e.target) && 
            chatbotWindow.classList.contains('active')) {
            chatbotWindow.classList.remove('active');
        }
    });

    // Option button definitions
    const tenderDefinitions = {
        'Government Tenders': 'Government Tenders are procurement opportunities issued by government departments or agencies for goods, services, or works. They are open to eligible businesses to ensure transparency and fair competition.',
        'State Tenders': 'State Tenders are procurement notices released by individual state governments or their departments. These tenders pertain to projects, goods, or services required at the state level.',
        'Central Tenders': 'Central Tenders are procurement opportunities announced by the central (national) government or its ministries. They typically involve large-scale projects or services that span across multiple states or the entire country.'
    };

    // Add event listeners to option buttons
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tenderType = btn.textContent.replace(/\s+>/, '');
            const definition = tenderDefinitions[tenderType];
            if (definition) {
                // Add as a bot message (with same style as other bot messages)
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('message', 'bot');
                const messageContent = document.createElement('div');
                messageContent.classList.add('message-content');
                messageContent.innerHTML = markdownToHtml(definition);
                messageDiv.appendChild(messageContent);
                chatbotMessages.appendChild(messageDiv);
                chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            }
        });
    });

    function stripMarkdown(text) {
        // Remove bold (**text** or __text__)
        text = text.replace(/\\*\\*(.*?)\\*\\*/g, '$1');
        text = text.replace(/__(.*?)__/g, '$1');
        // Remove italics (*text* or _text_)
        text = text.replace(/\\*(.*?)\\*/g, '$1');
        text = text.replace(/_(.*?)_/g, '$1');
        // Remove inline code `code`
        text = text.replace(/`([^`]+)`/g, '$1');
        // Remove remaining Markdown (links, etc.) as needed
        return text;
    }

    function markdownToHtml(text) {
        // Bold: **text** or __text__
        text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        text = text.replace(/__(.*?)__/g, '<b>$1</b>');
        // Italics: *text* or _text_
        text = text.replace(/\*(.*?)\*/g, '<i>$1</i>');
        text = text.replace(/_(.*?)_/g, '<i>$1</i>');
        // Inline code: `code`
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        // Links: [text](url)
        text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
        return text;
    }
}); 