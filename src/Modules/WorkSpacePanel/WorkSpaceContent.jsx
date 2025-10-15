import TranscriptPanel from "./TranscriptPanel.jsx";
import NotePanel from "./NotePanel.jsx";

export default function WorkSpaceContent() {
    return (
        <div className="workspace-container">
            <div className="workspace-panel workspace-panel--transcript">
                <TranscriptPanel />
            </div>
            <div className="workspace-panel workspace-panel--note">
                <NotePanel />
            </div>
        </div>
    );
}
