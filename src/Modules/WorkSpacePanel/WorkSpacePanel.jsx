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
                icon: '/icon_ws.png',
                label: 'Workspace',
                action: () => onLeave?.()
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