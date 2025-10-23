import { useState, useEffect } from "react";
import TranscriptPanel from "./TranscriptPanel.jsx";
import NotePanel from "./NotePanel.jsx";

export default function NoteTakingContent({ workspaceId, note, transcript, processedTranscript, initialMetadata, socket, isConnected }) {
    const [metadata, setMetadata] = useState(initialMetadata);

    useEffect(() => {
        setMetadata(initialMetadata);
    }, [initialMetadata]);

    const handleMetadataUpdate = (newMetadata) => {
        setMetadata(newMetadata);
    };

    return (
        <div className="workspace-container">
            <div className="workspace-panel workspace-panel--transcript">
                <TranscriptPanel
                    workspaceId={workspaceId}
                    transcript={transcript}
                    processedTranscript={processedTranscript}
                    socket={socket}
                    isConnected={isConnected}
                    onMetadataUpdate={handleMetadataUpdate}
                />
            </div>
            <div className="workspace-panel workspace-panel--note">
                <NotePanel note={note} metadata={metadata} />
            </div>
        </div>
    );
}
