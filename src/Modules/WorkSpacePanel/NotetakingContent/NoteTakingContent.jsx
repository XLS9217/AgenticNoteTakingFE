import { useState, useEffect, useRef } from "react";
import TranscriptPanel from "./TranscriptPanel.jsx";
import NotePanel from "./NotePanel.jsx";

export default function NoteTakingContent({ workspaceId, note, transcript, processedTranscript, initialMetadata, socket, isConnected }) {
    const [metadata, setMetadata] = useState(initialMetadata);
    const transcriptPanelRef = useRef(null);

    useEffect(() => {
        setMetadata(initialMetadata);
    }, [initialMetadata]);

    const handleMetadataUpdate = (newMetadata) => {
        setMetadata(newMetadata);
    };

    const handleRefreshProcessedTranscript = () => {
        if (transcriptPanelRef.current && transcriptPanelRef.current.refetchProcessedTranscript) {
            transcriptPanelRef.current.refetchProcessedTranscript();
        }
    };

    return (
        <div className="workspace-container">
            <div className="workspace-panel workspace-panel--transcript">
                <TranscriptPanel
                    ref={transcriptPanelRef}
                    workspaceId={workspaceId}
                    transcript={transcript}
                    processedTranscript={processedTranscript}
                    socket={socket}
                    isConnected={isConnected}
                    onMetadataUpdate={handleMetadataUpdate}
                />
            </div>
            <div className="workspace-panel workspace-panel--note">
                <NotePanel
                    note={note}
                    metadata={metadata}
                    workspaceId={workspaceId}
                    onMetadataUpdate={handleMetadataUpdate}
                    onRefreshProcessedTranscript={handleRefreshProcessedTranscript}
                />
            </div>
        </div>
    );
}
