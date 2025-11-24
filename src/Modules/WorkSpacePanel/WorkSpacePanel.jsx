import { useState, useEffect, useCallback } from "react";
import NoteTakingContent from "./NotetakingContent/NoteTakingContent.jsx";
import { useUtilBar } from "../../Components/UtilBar/UtilBarProvider.jsx";
import { getWorkspace, getChatHistory, getProcessedTranscript, connectToChatSession } from "../../Api/gateway.js";
import PanelLayoutBar from "../../Components/PanelLayoutBar/PanelLayoutBar.jsx";
import { PanelLayoutBarProvider } from "../../Components/PanelLayoutBar/PanelLayoutBarProvider.jsx";



export default function WorkSpacePanel({ workspaceId, onLeave }) {
    const [workspaceData, setWorkspaceData] = useState({ note: '', transcript: '', processed_transcript: [], meta_data: null });
    const [chatHistory, setChatHistory] = useState([]);
    const [workspaceName, setWorkspaceName] = useState('');
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { setOverride, clearOverride } = useUtilBar();

    const loadWorkspace = useCallback(async () => {
        try {
            // 1) Load basic workspace info
            const data = await getWorkspace(workspaceId);
            console.log('Workspace data loaded:', data);

            setWorkspaceData({
                note: data.note || '',
                transcript: data.transcript || '',
                processed_transcript: [], // will be loaded separately
                meta_data: data.meta_data || null
            });
            setWorkspaceName(data.workspace_name || 'Untitled Workspace');

            // 2) Load chat history
            try {
                const chatResp = await getChatHistory(workspaceId);
                const chats = Array.isArray(chatResp) ? chatResp : (chatResp?.chat_history || []);
                setChatHistory(chats);
            } catch (chatErr) {
                console.error('Error loading chat history:', chatErr);
                setChatHistory([]);
            }

            // 3) Load processed transcript (process script)
            try {
                const procResp = await getProcessedTranscript(workspaceId);
                const processed = Array.isArray(procResp) ? procResp : (procResp?.processed_transcript ?? []);
                setWorkspaceData(prev => ({
                    ...prev,
                    processed_transcript: processed
                }));
            } catch (procErr) {
                console.error('Error loading processed transcript:', procErr);
                // keep processed_transcript as empty array
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

    useEffect(() => {
        setOverride([
            {
                key: 'workspace',
                icon: '/icons/icon_ws.png',
                label: 'Workspace',
                action: () => onLeave?.()
            },
            {
                key: 'refresh',
                icon: '/icons/icon_refresh.png',
                label: 'Refresh Workspace',
                action: loadWorkspace,
                hoverClass: 'util-bar-icon-circle--rotate'
            },
            {
                key: 'import',
                icon: '/icons/icon_import.png',
                label: 'Import Workspace',
                action: () => console.log('Import clicked')
            },
            {
                key: 'export',
                icon: '/icons/icon_export.png',
                label: 'Export Workspace',
                action: () => console.log('Export clicked')
            }
        ]);

        return () => clearOverride();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <PanelLayoutBarProvider>
            <div className="workspace-main">
                <PanelLayoutBar />
                <NoteTakingContent
                    workspaceId={workspaceId}
                    note={workspaceData.note}
                    transcript={workspaceData.transcript}
                    processedTranscript={workspaceData.processed_transcript}
                    initialMetadata={workspaceData.meta_data}
                    socket={socket}
                    isConnected={isConnected}
                    chatHistory={chatHistory}
                    workspaceName={workspaceName}
                    onWorkspaceNameChange={setWorkspaceName}
                />
            </div>
        </PanelLayoutBarProvider>
    );
}
