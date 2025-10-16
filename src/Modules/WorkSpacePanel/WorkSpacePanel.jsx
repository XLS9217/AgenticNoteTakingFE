import WorkSpaceContent from "./WorkSpaceContent.jsx";
import ChatPanel from "./ChatPanel/ChatPanel.jsx";

export default function WorkSpacePanel({ workspaceId }) {
    return (
        <div className="workspace-main">
            <div className="layout-panel layout-panel--workspace">
                <WorkSpaceContent />
            </div>
            <div className="layout-panel layout-panel--chat">
                <ChatPanel workspaceId={workspaceId} />
            </div>
        </div>
    );
}