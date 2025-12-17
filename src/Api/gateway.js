import request from "./request.js";

/**
 * Authenticate a user
 * @param {{username: string, password: string}} credentials
 * @returns {Promise<Object>} Response from the backend (e.g., token, user info)
 */
export async function authUser(credentials) {
    try {
        const response = await request.post('/user/auth', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        console.error('Error authenticating user:', error);
        throw error;
    }
}

/**
 * Logout user by clearing token
 */
export function logout() {
    localStorage.removeItem('token');
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
 * Get all workspaces owned by the current user
 * @returns {Promise<Array>} List of workspaces
 */
export async function getMyWorkspaces() {
    try {
        const response = await request.get('/workspace/list');
        return response.data;
    } catch (error) {
        console.error('Error fetching workspaces:', error);
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
 * Update workspace note
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
 * Get chat history for a workspace
 */
export async function getChatHistory(workspaceId) {
    try {
        const response = await request.get(`/note-taking/get-chat-history/${workspaceId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching chat history:', error);
        throw error;
    }
}

// ==============================
// Source API
// ==============================

export async function createSource(workspaceId, sourceName = 'Untitled', rawContent = '') {
    try {
        const response = await request.post(`/note-taking/source/${workspaceId}`, {
            source_type: 'transcript',
            source_name: sourceName,
            raw_content: rawContent
        });
        return response.data;
    } catch (error) {
        console.error('Error creating source:', error);
        throw error;
    }
}

export async function getSources(workspaceId) {
    try {
        const response = await request.get(`/note-taking/source/${workspaceId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching sources:', error);
        throw error;
    }
}

export async function getSourceById(workspaceId, sourceId) {
    try {
        const response = await request.get(`/note-taking/source/${workspaceId}/${sourceId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching source:', error);
        throw error;
    }
}

export async function deleteSource(workspaceId, sourceId) {
    try {
        const response = await request.delete(`/note-taking/source/${workspaceId}/${sourceId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting source:', error);
        throw error;
    }
}

export async function getSourceRaw(workspaceId, sourceId) {
    try {
        const response = await request.get(`/note-taking/source/${workspaceId}/${sourceId}/raw`);
        return response.data;
    } catch (error) {
        console.error('Error fetching raw content:', error);
        throw error;
    }
}

export async function updateSourceRaw(workspaceId, sourceId, rawContent) {
    try {
        const response = await request.put(`/note-taking/source/${workspaceId}/${sourceId}/raw`, {
            raw_content: rawContent
        });
        return response.data;
    } catch (error) {
        console.error('Error updating raw content:', error);
        throw error;
    }
}

export async function getSourceProcessed(workspaceId, sourceId) {
    try {
        const response = await request.get(`/note-taking/source/${workspaceId}/${sourceId}/processed`);
        return response.data;
    } catch (error) {
        console.error('Error fetching processed content:', error);
        throw error;
    }
}

export async function getSourceMetadata(workspaceId, sourceId) {
    try {
        const response = await request.get(`/note-taking/source/${workspaceId}/${sourceId}/metadata`);
        return response.data;
    } catch (error) {
        console.error('Error fetching metadata:', error);
        throw error;
    }
}

export async function updateSpeakerName(workspaceId, sourceId, oldName, newName) {
    try {
        const response = await request.put(`/note-taking/source/${workspaceId}/${sourceId}/speaker-name`, {
            old_name: oldName,
            new_name: newName
        });
        return response.data;
    } catch (error) {
        console.error('Error updating speaker name:', error);
        throw error;
    }
}

export async function updateSourceName(workspaceId, sourceId, sourceName) {
    try {
        const response = await request.put(`/note-taking/source/${workspaceId}/${sourceId}/name`, {
            source_name: sourceName
        });
        return response.data;
    } catch (error) {
        console.error('Error updating source name:', error);
        throw error;
    }
}
