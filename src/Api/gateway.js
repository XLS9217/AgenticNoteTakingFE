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
 * @returns {WebSocket} The WebSocket instances
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

/**
 * Change workspace name
 * @param {string} workspaceId - The workspace ID
 * @param {string} newName - The new workspace name
 * @returns {Promise<Object>} Response from the backend
 */
export async function changeWorkspaceName(workspaceId, newName) {
    try {
        const response = await request.put('/workspace/change-name', {
            workspace_id: workspaceId,
            new_name: newName
        });
        return response.data;
    } catch (error) {
        console.error('Error changing workspace name:', error);
        throw error;
    }
}

/**
 * Update workspace transcript
 * @param {string} workspaceId - The workspace ID
 * @param {string} transcript - The new transcript content
 * @returns {Promise<Object>} Response from the backend
 */
export async function updateTranscript(workspaceId, transcript) {
    try {
        const response = await request.put('/note-taking/update-transcript', {
            workspace_id: workspaceId,
            transcript: transcript
        });
        return response.data;
    } catch (error) {
        console.error('Error updating transcript:', error);
        throw error;
    }
}

/**
 * Update workspace note
 * @param {string} workspaceId - The workspace ID
 * @param {string} note - The new note content
 * @returns {Promise<Object>} Response from the backend
 */
export async function updateNote(workspaceId, note) {
    try {
        const response = await request.put('/note-taking/update-note', {
            workspace_id: workspaceId,
            note: note
        });
        return response.data;
    } catch (error) {
        console.error('Error updating note:', error);
        throw error;
    }
}

/**
 * Get processed transcript for a workspace
 * @param {string} workspaceId - The workspace ID
 * @returns {Promise<Object>} Response from the backend containing processed_transcript
 */
export async function getProcessedTranscript(workspaceId) {
    try {
        const response = await request.get(`/note-taking/get-processed-transcript/${workspaceId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching processed transcript:', error);
        throw error;
    }
}

/**
 * Get metadata for a workspace
 * @param {string} workspaceId - The workspace ID
 * @returns {Promise<Object>} Response from the backend containing metadata
 */
export async function getMetadata(workspaceId) {
    try {
        const response = await request.get(`/note-taking/get-metadata/${workspaceId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching metadata:', error);
        throw error;
    }
}

/**
 * Update speaker name in metadata and processed transcript
 * @param {string} workspaceId - The workspace ID
 * @param {string} oldSpeakerName - The old speaker name
 * @param {string} newSpeakerName - The new speaker name
 * @returns {Promise<Object>} Response from the backend
 */
export async function updateSpeakerName(workspaceId, oldSpeakerName, newSpeakerName) {
    try {
        const response = await request.put('/note-taking/update-speaker-name', {
            workspace_id: workspaceId,
            old_speaker_name: oldSpeakerName,
            new_speaker_name: newSpeakerName
        });
        return response.data;
    } catch (error) {
        console.error('Error updating speaker name:', error);
        throw error;
    }
}
