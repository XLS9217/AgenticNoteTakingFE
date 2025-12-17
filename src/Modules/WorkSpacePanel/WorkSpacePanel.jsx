import { useState, useEffect, useCallback } from "react";
import NoteTakingContent from "./NoteTakingContent.jsx";
import { getWorkspace, getChatHistory } from "../../Api/gateway.js";
import { connectSocket, disconnectSocket } from "../../Api/socket_gateway.js";
import CommendDispatcher, { ChannelEnum } from "../../Util/CommendDispatcher.js";

export default function WorkSpacePanel({ workspaceId, onLeave, onWorkspaceNameChange }) {
    const [note, setNote] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const loadWorkspace = useCallback(async () => {
        try {
            const data = await getWorkspace(workspaceId);
            setNote(data.note || '');
            onWorkspaceNameChange?.(data.workspace_name || 'Untitled');

            try {
                const chatResp = await getChatHistory(workspaceId);
                const chats = Array.isArray(chatResp) ? chatResp : (chatResp?.chat_history || []);
                setChatHistory(chats);
            } catch (chatErr) {
                console.error('Error loading chat history:', chatErr);
                setChatHistory([]);
            }
        } catch (error) {
            console.error('Error loading workspace:', error);
        } finally {
            setIsLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        loadWorkspace();
    }, [loadWorkspace]);

    useEffect(() => {
        connectSocket(workspaceId);
        return () => disconnectSocket();
    }, [workspaceId]);

    useEffect(() => {
        const unsubscribe = CommendDispatcher.Subscribe2Channel(
            ChannelEnum.SOCKET_STATUS,
            (data) => setIsConnected(data.connected)
        );
        return unsubscribe;
    }, []);

    return (
        <div className="workspace-main">
            <NoteTakingContent
                workspaceId={workspaceId}
                note={note}
                isConnected={isConnected}
                chatHistory={chatHistory}
                isLoading={isLoading}
            />
        </div>
    );
}
