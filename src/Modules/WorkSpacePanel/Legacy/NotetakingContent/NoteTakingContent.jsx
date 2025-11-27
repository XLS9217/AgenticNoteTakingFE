import { useState, useEffect, useRef } from "react";
import SourcePanel from "../SourcePanel.jsx";
import NotePanel from "../NotePanel.jsx";
import ChatBox from "../ChatBox.jsx";
import "../../WorkspaceLayout.css";

export default function NoteTakingContent({ workspaceId, note, transcript, processedTranscript, initialMetadata, socket, isConnected, chatHistory, workspaceName, onWorkspaceNameChange }) {
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
        <div className="ide-layout">
            <div className="ide-left-panel">
                <SourcePanel />
            </div>
            <div className="ide-center-panel">
                <NotePanel />
            </div>
            <div className="ide-right-panel">
                <ChatBox
                    chatHistory={chatHistory}
                    socket={socket}
                    isConnected={isConnected}
                />
            </div>
        </div>
    );
}
