import { useState } from "react";
import NoteTakingContent from "./NotetakingContent/NoteTakingContent.jsx";
import ChatPanel from "./ChatPanel/ChatPanel.jsx";

export default function WorkSpacePanel({ workspaceId }) {
    const [workspaceData, setWorkspaceData] = useState({ note: '', transcript: '' });

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