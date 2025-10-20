import { useState, useEffect } from "react";
import LiquidGlassDiv from "../../../Components/LiquidGlassDiv.jsx";
import LiquidGlassScrollBar from "../../../Components/LiquidGlassScrollBar.jsx";
import { updateTranscript } from "../../../Api/gateway.js";

export default function TranscriptPanel({ workspaceId, transcript, processedTranscript }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTranscript, setEditedTranscript] = useState(transcript || 'No notes yet...');
    const [isDragging, setIsDragging] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showProcessed, setShowProcessed] = useState(true);

    useEffect(() => {
        setEditedTranscript(transcript || 'No notes yet...');
    }, [transcript]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setEditedTranscript(event.target.result);
                };
                reader.readAsText(file);
            } else {
                alert('Please drop a .txt file');
            }
        }
    };

    const handleFinishEditing = async () => {
        setIsEditing(false);
        setIsSyncing(true);
        try {
            await updateTranscript(workspaceId, editedTranscript);
        } catch (error) {
            console.error('Failed to sync transcript:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const formatProcessedTranscript = () => {
        return JSON.stringify(processedTranscript, null, 2);
    };

    const displayContent = showProcessed ? formatProcessedTranscript() : editedTranscript;

    return <LiquidGlassDiv isButton={false}>
        <div className="panel-container">
            <div className="transcript-header">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h2
                        className="panel-title transcript-title-clickable"
                        onClick={() => {
                            setShowProcessed(!showProcessed);
                            setIsEditing(false);
                        }}
                        title={showProcessed ? 'Click to view Raw Transcript' : 'Click to view Processed Transcript'}
                    >
                        {showProcessed ? 'Processed Transcript' : 'Raw Transcript'}
                    </h2>
                    <div className="transcript-edit-indicator">
                        {showProcessed
                            ? 'viewing processed (Click Title to View Raw Transcript)'
                            : isEditing
                                ? 'editing'
                                : 'viewing raw (Click Title to View Processed Transcript)'
                        }
                        {isSyncing && <span className="transcript-sync-status"> (Syncing...)</span>}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {!showProcessed && isEditing && (
                        <button
                            onClick={handleFinishEditing}
                            className="transcript-toggle-button"
                            title="Save changes and exit edit mode"
                        >
                            Finish
                        </button>
                    )}
                </div>
            </div>
            {isEditing ? (
                <div className="transcript-edit-container">
                    {!showProcessed && (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`transcript-dropzone ${isDragging ? 'transcript-dropzone--dragging' : ''}`}
                        >
                            Drop .txt file here
                        </div>
                    )}
                    <LiquidGlassScrollBar className="transcript-edit-scrollbar">
                        <textarea
                            className="transcript-textarea-edit"
                            value={editedTranscript}
                            onChange={(e) => setEditedTranscript(e.target.value)}
                            rows={20}
                        />
                    </LiquidGlassScrollBar>
                </div>
            ) : (
                <LiquidGlassScrollBar>
                    <div className="transcript-content-wrapper">
                        <p
                            className={`panel-content ${!showProcessed ? 'transcript-content-editable' : ''}`}
                            style={{ whiteSpace: 'pre-wrap' }}
                            onClick={() => !showProcessed && setIsEditing(true)}
                            title={!showProcessed ? 'Click to edit transcript' : ''}
                        >
                            {displayContent}
                        </p>
                    </div>
                </LiquidGlassScrollBar>
            )}
        </div>
    </LiquidGlassDiv>

}