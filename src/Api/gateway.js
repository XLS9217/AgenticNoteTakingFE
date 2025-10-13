import request from "./request.js";

let socket = null;

/**
 * Sends a chat message to the agent via HTTP POST
 * @param {Object} message - The message to send
 * @param {string} message.user - User identifier
 * @param {string} message.text - Message text
 * @returns {Promise<Object>} Response from the agent
 */
export async function sendChatMessage(message) {
    try {
        const response = await request.post('/agent/chat', message);
        return response.data;
    } catch (error) {
        console.error('Error sending chat message:', error);
        throw error;
    }
}

/**
 * Establishes a WebSocket connection to the chat session endpoint
 * @returns {WebSocket} The WebSocket instance
 */
export function connectToChatSession() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        return socket;
    }

    socket = new WebSocket('ws://localhost:7008/agent/chat_session');

    return socket;
}
