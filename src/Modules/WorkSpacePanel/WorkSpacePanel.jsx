import { useState, useEffect, useCallback } from "react";
import NoteTakingContent from "./NoteTakingContent.jsx";
import { getWorkspace, getChatHistory, getProcessedTranscript, connectToChatSession } from "../../Api/gateway.js";
import CommendDispatcher, { ChannelEnum } from "../../Util/CommendDispatcher.js";

export default function WorkSpacePanel({ workspaceId, onLeave, onWorkspaceNameChange }) {
    const [workspaceData, setWorkspaceData] = useState({ note: '', transcript: '', processed_transcript: [], meta_data: null });
    const [chatHistory, setChatHistory] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const loadWorkspace = useCallback(async () => {
        try {
            const data = await getWorkspace(workspaceId);
            console.log('Workspace data loaded:', data);

            setWorkspaceData({
                note: data.note || '',
                transcript: data.transcript || '',
                processed_transcript: [],
                meta_data: data.meta_data || null
            });
            onWorkspaceNameChange?.(data.workspace_name || 'Untitled');

            try {
                const chatResp = await getChatHistory(workspaceId);
                const chats = Array.isArray(chatResp) ? chatResp : (chatResp?.chat_history || []);
                setChatHistory(chats);
            } catch (chatErr) {
                console.error('Error loading chat history:', chatErr);
                setChatHistory([]);
            }

            try {
                const procResp = await getProcessedTranscript(workspaceId);
                const processed = Array.isArray(procResp) ? procResp : (procResp?.processed_transcript ?? []);
                setWorkspaceData(prev => ({
                    ...prev,
                    processed_transcript: processed
                }));
            } catch (procErr) {
                console.error('Error loading processed transcript:', procErr);
            }
        } catch (error) {
            console.error('Error loading workspace:', error);
        }
    }, [workspaceId]);

    useEffect(() => {
        loadWorkspace();
    }, [loadWorkspace]);

    useEffect(() => {
        const ws = connectToChatSession();
        setSocket(ws);

        ws.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
            ws.send(JSON.stringify({
                type: "workspace_switch",
                workspace_id: workspaceId
            }));
        };

        ws.onclose = () => {
            console.log('WebSocket closed');
            setIsConnected(false);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setIsConnected(false);
        };

        return () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [workspaceId]);

    // Centralized WebSocket message handling
    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event) => {
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
                    else if (data.sub_type === 'smart_update_result') {
                        CommendDispatcher.Publish2Channel(ChannelEnum.SMART_UPDATE, data);
                    }
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        socket.addEventListener('message', handleMessage);
        return () => socket.removeEventListener('message', handleMessage);
    }, [socket]);

    // Listen for SOCKET_SEND requests from child components
    useEffect(() => {
        const unsubscribe = CommendDispatcher.Subscribe2Channel(
            ChannelEnum.SOCKET_SEND,
            (payload) => {
                if (socket && isConnected) {
                    socket.send(JSON.stringify(payload));
                } else {
                    console.error('WebSocket not connected');
                }
            }
        );
        return unsubscribe;
    }, [socket, isConnected]);

    return (
        <div className="workspace-main">
            <NoteTakingContent
                workspaceId={workspaceId}
                note={workspaceData.note}
                transcript={workspaceData.transcript}
                processedTranscript={workspaceData.processed_transcript}
                initialMetadata={workspaceData.meta_data}
                isConnected={isConnected}
                chatHistory={chatHistory}
            />
        </div>
    );
}
