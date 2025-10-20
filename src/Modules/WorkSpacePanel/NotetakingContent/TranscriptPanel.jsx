import { useState, useEffect } from "react";
import LiquidGlassDiv from "../../../Components/LiquidGlassDiv.jsx";
import LiquidGlassScrollBar from "../../../Components/LiquidGlassScrollBar.jsx";
import { updateTranscript } from "../../../Api/gateway.js";

function RawTranscriptPanel({ editedTranscript, setEditedTranscript, isEditing, setIsEditing }) {
    const [isDragging, setIsDragging] = useState(false);

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

    if (isEditing) {
        return (
            <div className="transcript-edit-container">
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`transcript-dropzone ${isDragging ? 'transcript-dropzone--dragging' : ''}`}
                >
                    Drop .txt file here
                </div>
                <LiquidGlassScrollBar className="transcript-edit-scrollbar">
                    <textarea
                        className="transcript-textarea-edit"
                        value={editedTranscript}
                        onChange={(e) => setEditedTranscript(e.target.value)}
                        rows={20}
                    />
                </LiquidGlassScrollBar>
            </div>
        );
    }

    return (
        <LiquidGlassScrollBar>
            <div className="transcript-content-wrapper">
                <p
                    className="panel-content transcript-content-display transcript-content-editable"
                    onClick={() => setIsEditing(true)}
                    title="Click to edit transcript"
                >
                    {editedTranscript}
                </p>
            </div>
        </LiquidGlassScrollBar>
    );
}


function ProcessedTranscriptPanel({ workspaceId, processedTranscript }) {
    const formatProcessedTranscript = () => {
        return JSON.stringify(processedTranscript, null, 2);
    };

    const isProcessedEmpty = () => {
        return !processedTranscript ||
               processedTranscript === '' ||
               (Array.isArray(processedTranscript) && processedTranscript.length === 0);
    };

    const handleStartInitialProcess = () => {
        // TODO: Call API to start initial processing
        console.log('Start initial process for workspace:', workspaceId);
    };

    if (isProcessedEmpty()) {
        return (
            <LiquidGlassScrollBar>
                <div className="transcript-content-wrapper">
                    <div className="transcript-empty-state">
                        <button
                            onClick={handleStartInitialProcess}
                            className="transcript-toggle-button"
                        >
                            Start Initial Process
                        </button>
                    </div>
                </div>
            </LiquidGlassScrollBar>
        );
    }

    return (
        <LiquidGlassScrollBar>
            <div className="transcript-content-wrapper">
                <p className="panel-content transcript-content-display">
                    {formatProcessedTranscript()}
                </p>
            </div>
        </LiquidGlassScrollBar>
    );
}

export default function TranscriptPanel({ workspaceId, transcript, processedTranscript }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTranscript, setEditedTranscript] = useState(transcript || 'No notes yet...');
    const [isSyncing, setIsSyncing] = useState(false);
    const [showProcessed, setShowProcessed] = useState(true);

    useEffect(() => {
        setEditedTranscript(transcript || 'No notes yet...');
    }, [transcript]);

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

    return (
        <LiquidGlassDiv isButton={false}>
            <div className="panel-container">
                <div className="transcript-header">
                    <div className="transcript-header-column">
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
                                ? 'viewing processed (Click Title)'
                                : isEditing
                                    ? 'editing'
                                    : 'viewing raw (Click Title)'
                            }
                            {isSyncing && <span className="transcript-sync-status"> (Syncing...)</span>}
                        </div>
                    </div>
                    <div className="transcript-header-buttons">
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
                {showProcessed ? (
                    <ProcessedTranscriptPanel
                        workspaceId={workspaceId}
                        processedTranscript={processedTranscript}
                    />
                ) : (
                    <RawTranscriptPanel
                        editedTranscript={editedTranscript}
                        setEditedTranscript={setEditedTranscript}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                    />
                )}
            </div>
        </LiquidGlassDiv>
    );
}