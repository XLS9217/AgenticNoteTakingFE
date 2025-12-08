import CommendDispatcher, { ChannelEnum } from "../Util/CommendDispatcher.js";

let socket = null;
let isConnected = false;
let currentWorkspaceId = null;
let sendSubscription = null;

/**
 * Get current connection status
 * @returns {boolean}
 */
export function getConnectionStatus() {
    return isConnected;
}

/**
 * Establishes a WebSocket connection and sets up message routing
 * @param {string} workspaceId - The workspace to connect to
 * @returns {void}
 */
export function connectSocket(workspaceId) {
    // Close existing connection if switching workspaces
    if (socket && socket.readyState === WebSocket.OPEN) {
        if (currentWorkspaceId === workspaceId) {
            return; // Already connected to this workspace
        }
        socket.close();
    }

    currentWorkspaceId = workspaceId;

    const token = localStorage.getItem('token');
    if (!token) {
        console.error('[WS] No token found, cannot connect');
        return;
    }

    const { protocol, host } = window.location;
    const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${wsProtocol}//${host}/agent/chat_session?token=${token}`;

    socket = new WebSocket(url);

    socket.onopen = () => {
        console.log('WebSocket connected');
        isConnected = true;

        // Send workspace switch message first, before notifying subscribers
        socket.send(JSON.stringify({
            type: "workspace_switch",
            workspace_id: workspaceId
        }));

        CommendDispatcher.Publish2Channel(ChannelEnum.SOCKET_STATUS, { connected: true });
    };

    socket.onclose = () => {
        console.log('WebSocket closed');
        isConnected = false;
        CommendDispatcher.Publish2Channel(ChannelEnum.SOCKET_STATUS, { connected: false });
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnected = false;
        CommendDispatcher.Publish2Channel(ChannelEnum.SOCKET_STATUS, { connected: false });
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('WebSocket received:', data);

            if (data.type === 'agent_message' || data.type === 'agent_chunk') {
                CommendDispatcher.Publish2Channel(ChannelEnum.CHAT_MESSAGE, data);
            }
            else if (data.type === 'workspace_message') {
                if (data.sub_type === 'process_status') {
                    CommendDispatcher.Publish2Channel(ChannelEnum.PROCESS_STATUS, data);
                }
                else if (data.sub_type === 'smart_update_lock') {
                    CommendDispatcher.Publish2Channel(ChannelEnum.SMART_UPDATE_LOCK, data);
                }
                else if (data.sub_type === 'smart_update_result') {
                    CommendDispatcher.Publish2Channel(ChannelEnum.SMART_UPDATE, data);
                }
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    };

    // Subscribe to SOCKET_SEND channel for outgoing messages
    if (sendSubscription) {
        sendSubscription(); // Unsubscribe previous
    }
    sendSubscription = CommendDispatcher.Subscribe2Channel(
        ChannelEnum.SOCKET_SEND,
        (payload) => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(payload));
            } else {
                console.error('WebSocket not connected');
            }
        }
    );
}

/**
 * Closes the WebSocket connection
 */
export function disconnectSocket() {
    if (sendSubscription) {
        sendSubscription();
        sendSubscription = null;
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
    }
    socket = null;
    isConnected = false;
    currentWorkspaceId = null;
}
