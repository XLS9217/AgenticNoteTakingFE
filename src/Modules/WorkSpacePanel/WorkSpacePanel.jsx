import { useState } from "react";
import WorkSpaceContent from "./WorkSpaceContent.jsx";
import ChatPanel from "./ChatPanel/ChatPanel.jsx";

export default function WorkSpacePanel({ workspaceId }) {
    const [workspaceData, setWorkspaceData] = useState({ note: '', transcript: '' });

    return (
        <div className="workspace-main">
            <div className="layout-panel layout-panel--workspace">
                <WorkSpaceContent note={workspaceData.note} transcript={workspaceData.transcript} />
            </div>
            <div className="layout-panel layout-panel--chat">
                <ChatPanel workspaceId={workspaceId} onWorkspaceDataReceived={setWorkspaceData} />
            </div>
        </div>
    );
}