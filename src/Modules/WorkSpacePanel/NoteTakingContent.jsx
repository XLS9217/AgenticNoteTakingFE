import SourcePanel from "./SourcePanel/SourcePanel.jsx";
import NotePanel from "./NotePanel.jsx";
import ChatBox from "./ChatBox.jsx";
import "./WorkspaceLayout.css";

export default function NoteTakingContent({ workspaceId, note, isConnected, chatHistory, isLoading }) {
    return (
        <div className="ide-layout">
            <div className="ide-left-panel">
                <SourcePanel workspaceId={workspaceId} />
            </div>
            <div className="ide-center-panel">
                <NotePanel workspaceId={workspaceId} note={note} isLoading={isLoading} />
            </div>
            <div className="ide-right-panel">
                <ChatBox chatHistory={chatHistory} isConnected={isConnected} isLoading={isLoading} />
            </div>
        </div>
    );
}
