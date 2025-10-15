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

    const { protocol, host } = window.location;
    const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${wsProtocol}//${host}/agent/chat_session`;

    socket = new WebSocket(url);

    return socket;
}


/**
 * Authenticate a user
 * @param {{username: string, password: string}} credentials
 * @returns {Promise<Object>} Response from the backend (e.g., token, user info)
 */
export async function authUser(credentials) {
    try {
        const response = await request.post('/user/auth', credentials);
        return response.data;
    } catch (error) {
        console.error('Error authenticating user:', error);
        throw error;
    }
}

/**
 * Create/register a new user
 * @param {{username: string, password: string}} payload
 * @returns {Promise<Object>} Response from the backend (e.g., created user)
 */
export async function createUser(payload) {
    try {
        const response = await request.post('/user/create', payload);
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

/**
 * Get user information by username
 * @param {string} username - The username to fetch info for
 * @returns {Promise<Object>} User information
 */
export async function getUserInfo(username) {
    try {
        const response = await request.get(`/user/info/${username}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
}

/**
 * Create a new workspace
 * @param {{workspace_name: string, owner: string, note: string, transcript: string}} payload
 * @returns {Promise<Object>} Response from the backend
 */
export async function createWorkspace(payload) {
    try {
        const response = await request.post('/workspace/create', payload);
        return response.data;
    } catch (error) {
        console.error('Error creating workspace:', error);
        throw error;
    }
}

/**
 * Get workspace by ID
 * @param {string} workspaceId - The workspace ID to fetch
 * @returns {Promise<Object>} Workspace data
 */
export async function getWorkspace(workspaceId) {
    try {
        const response = await request.get(`/workspace/${workspaceId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching workspace:', error);
        throw error;
    }
}

/**
 * Get all workspaces by owner
 * @param {string} owner - The owner username
 * @returns {Promise<Array>} List of workspaces
 */
export async function getWorkspacesByOwner(owner) {
    try {
        const response = await request.get(`/workspace/owner/${owner}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching workspaces by owner:', error);
        throw error;
    }
}

/**
 * Delete a workspace by ID
 * @param {string} workspaceId - The workspace ID to delete
 * @returns {Promise<Object>} Response from the backend
 */
export async function deleteWorkspace(workspaceId) {
    try {
        const response = await request.delete('/workspace/delete', { data: { workspace_id: workspaceId } });
        return response.data;
    } catch (error) {
        console.error('Error deleting workspace:', error);
        throw error;
    }
}
