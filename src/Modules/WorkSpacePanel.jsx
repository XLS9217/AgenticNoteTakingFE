import TranscriptPanel from "./TranscriptPanel.jsx";
import NotePanel from "./NotePanel.jsx";

export default function WorkSpacePanel() {
    return (
        <div className="workspace-container">
            <div className="workspace-panel workspace-panel--transcript">
                <TranscriptPanel />
            </div>
            <div className="workspace-panel workspace-panel--note">
                <NotePanel />
            </div>
        </div>
    )
}