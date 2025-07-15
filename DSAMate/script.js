
document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatContainer = document.getElementById('chat-container');

    const API_KEY = "{Your_API_Key}"; 
    const MODEL_NAME = "gemini-1.5-flash";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    /**
     * --- *** NEW & IMPROVED appendMessage Function *** ---
     * Appends a message to the chat container.
     * It now intelligently parses the AI's response to find code blocks
     * (wrapped in ```) and applies special styling to them.
     * @param {string} text - The message text.
     * @param {string} sender - The sender ('user' or 'ai').
     */
    function appendMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);

        if (sender === 'user') {
            messageDiv.textContent = text;
        } else {
            const parts = text.split(/(```[\s\S]*?```)/g);

            for (const part of parts) {
                if (part.startsWith('```') && part.endsWith('```')) {
                    // Extract the code content, removing the delimiters and trimming whitespace.
                    const codeContent = part.slice(3, -3).trim();
                    
                    const pre = document.createElement('pre');
                    pre.classList.add('code-block');
                    
                    const code = document.createElement('code');
                    code.textContent = codeContent;
                    
                    pre.appendChild(code);
                    messageDiv.appendChild(pre);
                } else if (part.trim() !== '') {
                    const p = document.createElement('p');
                    p.textContent = part;
                    messageDiv.appendChild(p);
                }
            }
        }

        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function showLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'loading');
        loadingDiv.textContent = '● ● ●';
        chatContainer.appendChild(loadingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return loadingDiv;
    }
    chatForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const userQuery = chatInput.value.trim();
        if (!userQuery) return;
        appendMessage(userQuery, 'user');
        chatInput.value = '';
        const loadingIndicator = showLoadingIndicator();
        try {
            const aiResponse = await getAiResponse(userQuery);
            loadingIndicator.remove();
            appendMessage(aiResponse, 'ai');
        } catch (error) {
            loadingIndicator.remove();
            appendMessage("Sorry, something went wrong. Please try again.", "ai");
            console.error("Error fetching AI response:", error);
        }
    });

    /**
     * Fetches a response from the Gemini API.
     * @param {string} query - The user's question.
     * @returns {Promise<string>} The AI's text response.
     */
    async function getAiResponse(query) {
        const systemInstruction = {
            role: "model",
            parts: [{
                text: `You are a Data Structure and Algorithm instructor. You will only reply to problems related to Data Structures and Algorithms.
                       You must solve the user's query in the simplest way possible.
                       
                       *** VERY IMPORTANT RULE ***
                       When you provide a code example, you MUST wrap it in triple backticks.
                       For example:
                       \`\`\`javascript
                       function example() {
                         console.log("This is a code block");
                       }
                       \`\`\`
                       This is crucial for the code to be displayed correctly. Do not forget to do this.
                       
                       If the user asks a question not related to DSA, reply nicely: "Sorry, I can only answer questions related to Data Structures and Algorithms."`
            }]
        };

        const requestBody = {
            contents: [{ role: "user", parts: [{ text: query }] }],
            systemInstruction: systemInstruction
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const responseData = await response.json();
        const text = responseData.candidates[0]?.content?.parts[0]?.text;
        if (!text) {
            return "I couldn't generate a response.";
        }
        
        // Clean AI response formatting
        let cleanText = text;
        
        // Remove all '**' markdown bold markers
        cleanText = cleanText.replace(/\*\*/g, '');
        
        // Insert a newline before headings like Key characteristics, Example (Python), Example (C++)
        cleanText = cleanText.replace(/(Key characteristics[^\n]*)/gi, '\n$1\n');
        cleanText = cleanText.replace(/(Example \(Python\)[^\n]*)/gi, '\n$1\n');
        cleanText = cleanText.replace(/(Example \(C\+\+\)[^\n]*)/gi, '\n$1\n');
        
        // You can add similar patterns for other headings if needed
        
        return cleanText;
    }
    const topicsCovered = 12; 
const totalTopics = 20;  

const progressPercent = Math.round((topicsCovered / totalTopics) * 100);

document.getElementById("topics-covered").innerText = topicsCovered;
document.getElementById("total-topics").innerText = totalTopics;
document.getElementById("progress-percent").innerText = progressPercent + "%";
document.getElementById("progress-bar").style.width = progressPercent + "%";

});