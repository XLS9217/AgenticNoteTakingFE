import { useState, useEffect } from "react";
import NoteTakingContent from "./NotetakingContent/NoteTakingContent.jsx";
import ChatPanel from "./ChatPanel/ChatPanel.jsx";
import { useUtilBar } from "../../Components/UtilBar/UtilBarProvider.jsx";
import { getWorkspace } from "../../Api/gateway.js";

export default function WorkSpacePanel({ workspaceId, onLeave }) {
    const [workspaceData, setWorkspaceData] = useState({ note: '', transcript: '', processed_transcript: [] });
    const [chatHistory, setChatHistory] = useState([]);
    const [workspaceName, setWorkspaceName] = useState('');
    const { setOverride, clearOverride } = useUtilBar();

    useEffect(() => {
        const loadWorkspace = async () => {
            try {
                const data = await getWorkspace(workspaceId);
                console.log('Workspace data loaded:', data);

                setWorkspaceData({
                    note: data.note || '',
                    transcript: data.transcript || '',
                    processed_transcript: data.processed_transcript || []
                });
                setChatHistory(data.chat_history || []);
                setWorkspaceName(data.workspace_name || 'Untitled Workspace');
            } catch (error) {
                console.error('Error loading workspace:', error);
            }
        };

        loadWorkspace();
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
    }, []);

    return (
        <div className="workspace-main">
            {/*Workspace panel*/}
            <div className="layout-panel layout-panel--workspace">
                <NoteTakingContent workspaceId={workspaceId} note={workspaceData.note} transcript={workspaceData.transcript} processedTranscript={workspaceData.processed_transcript} />
            </div>
            {/*chatbox panel*/}
            <div className="layout-panel layout-panel--chat">
                <ChatPanel workspaceId={workspaceId} chatHistory={chatHistory} workspaceName={workspaceName} onWorkspaceNameChange={setWorkspaceName} />
            </div>
        </div>
    );
}
