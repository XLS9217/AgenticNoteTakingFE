import { useState, useEffect, useCallback } from "react";
import NoteTakingContent from "./NoteTakingContent.jsx";
import { getWorkspace, getChatHistory, getProcessedTranscript, connectToChatSession } from "../../Api/gateway.js";

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

    return (
        <div className="workspace-main">
            <NoteTakingContent
                workspaceId={workspaceId}
                note={workspaceData.note}
                transcript={workspaceData.transcript}
                processedTranscript={workspaceData.processed_transcript}
                initialMetadata={workspaceData.meta_data}
                socket={socket}
                isConnected={isConnected}
                chatHistory={chatHistory}
            />
        </div>
    );
}
