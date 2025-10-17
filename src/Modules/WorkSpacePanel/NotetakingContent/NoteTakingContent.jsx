import TranscriptPanel from "./TranscriptPanel.jsx";
import NotePanel from "./NotePanel.jsx";

export default function NoteTakingContent({ workspaceId, note, transcript }) {
    return (
        <div className="workspace-container">
            <div className="workspace-panel workspace-panel--transcript">
                <TranscriptPanel workspaceId={workspaceId} transcript={transcript} />
            </div>
            <div className="workspace-panel workspace-panel--note">
                <NotePanel note={note} />
            </div>
        </div>
    );
}
