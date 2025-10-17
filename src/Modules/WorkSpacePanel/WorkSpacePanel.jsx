import { useState, useEffect } from "react";
import NoteTakingContent from "./NotetakingContent/NoteTakingContent.jsx";
import ChatPanel from "./ChatPanel/ChatPanel.jsx";
import { useUtilBar } from "../../Components/UtilBar/UtilBarProvider.jsx";

export default function WorkSpacePanel({ workspaceId, onLeave }) {
    const [workspaceData, setWorkspaceData] = useState({ note: '', transcript: '' });
    const { setOverride, clearOverride } = useUtilBar();

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
                label: 'Import',
                action: () => console.log('Import clicked')
            },
            {
                key: 'export',
                icon: '/icons/icon_export.png',
                label: 'Export',
                action: () => console.log('Export clicked')
            }
        ]);

        return () => clearOverride();
    }, []);

    return (
        <div className="workspace-main">
            {/*Workspace panel*/}
            <div className="layout-panel layout-panel--workspace">
                <NoteTakingContent note={workspaceData.note} transcript={workspaceData.transcript} />
            </div>
            {/*chatbox panel*/}
            <div className="layout-panel layout-panel--chat">
                <ChatPanel workspaceId={workspaceId} onWorkspaceDataReceived={setWorkspaceData} />
            </div>
        </div>
    );
}