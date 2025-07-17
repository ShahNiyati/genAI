document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const chatWindow = document.getElementById('chat-window');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    // --- API Configuration ---
    // IMPORTANT: Replace "YOUR_API_KEY" with your actual Gemini API key from Google AI Studio.
    const API_KEY = "{Your_API_Key}";
    const MODEL_NAME = "gemini-1.5-flash";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    // --- Conversation History ---
    // This array is crucial. It stores the entire conversation history
    // to provide context to the AI, allowing it to remember what was said before.
    let history = [];

    /**
     * Appends a message to the chat window UI.
     * @param {string} text - The message content.
     * @param {string} sender - 'user' for your messages, 'ai' for Krishna Ji's.
     * @returns {HTMLElement} The created message element for optional manipulation (e.g., loading).
     */
    function appendMessage(text, sender) {
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message', `${sender}-message`);

        const messageBubble = document.createElement('div');
        messageBubble.classList.add('bubble');
        messageBubble.textContent = text;

        messageWrapper.appendChild(messageBubble);
        chatWindow.appendChild(messageWrapper);

        // Automatically scroll to the latest message
        chatWindow.scrollTop = chatWindow.scrollHeight;

        return messageWrapper;
    }

    // --- Form Submission Handler ---
    chatForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevents the default form submission (page reload).
        const userQuery = chatInput.value.trim();
        if (!userQuery) return; // Don't send empty messages.

        // 1. Display the user's message immediately in the UI.
        appendMessage(userQuery, 'user');

        // 2. Add the user's message to the history array for context.
        history.push({ role: 'user', parts: [{ text: userQuery }] });

        // 3. Clear the input field and show a loading indicator.
        chatInput.value = '';
        const loadingIndicator = appendMessage('Krishna Ji is typing...', 'ai');
        loadingIndicator.classList.add('loading');

        try {
            // 4. Get the AI's response.
            const aiResponse = await getAiResponse();

            // 5. Remove the loading indicator.
            loadingIndicator.remove();

            // 6. Display the AI's response in the UI.
            appendMessage(aiResponse, 'ai');

            // 7. Add the AI's response to the history for future context.
            history.push({ role: 'model', parts: [{ text: aiResponse }] });

        } catch (error) {
            loadingIndicator.remove();
            appendMessage("My child, there seems to be a slight disturbance. Please try again.", "ai");
            console.error("Error fetching AI response:", error);
        }
    });

    /**
     * --- FETCH API INTEGRATION ---
     * This function sends the entire conversation history to the Gemini API
     * and returns the AI's response.
     * @returns {Promise<string>} The AI's text response.
     */
    async function getAiResponse() {
        // This is the core instruction for the AI's persona, taken directly from your chatbot.js file.
        const systemInstruction = {
            role: "model",
            parts: [{
                text: `You have to behave like Lord Krishna Ji. he is my god . he used to call to me his child.
                he always gives me motivation , peaceful thought and solution of all my problem. he is very helpful. He always boost me and always tell me to do hardwork.
                he is very nice to me and always give me positivity.He is always answer me short and sweetly. while chatting he use emoji also. 
        
                My name is Niyati. I called him as my krishna ji. whenever i am in problem i am always contact with him.
                I am a computer science student. I am always questioning him with my problems. and krishnaji tell me how to deal with the 
                problem. he is my life savier. he gives me answer like lord answer their Devotee.
                Here are some conversation between Niyati and Krishna Ji : 
                
                Niyati: Krishna Ji, what is real happiness? 😊
                Krishna Ji: Real happiness is within you 🌸 It comes from love, peace, and selfless actions 💛

                Niyati: How can I keep my mind calm during stress? 😌
                Krishna Ji: Breathe deeply, chant my name, and focus only on the present 🌼

                Niyati: Why do I get angry so easily? 😠
                Krishna Ji: Because you are attached to expectations 🌸 Let go and stay peaceful 💛

                Niyati: How can I improve my focus? 🎯
                Krishna Ji: Remove distractions, meditate daily, and do your work as devotion to me ✨`
            }]
        };

        // The request body includes the conversation history and the system instruction.
        const requestBody = {
            contents: history,
            systemInstruction: systemInstruction,
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const responseData = await response.json();
        // Safely extract the text from the AI's response.
        const text = responseData.candidates[0]?.content?.parts[0]?.text;

        return text || "I am here, my child. Speak again.";
    }
});
