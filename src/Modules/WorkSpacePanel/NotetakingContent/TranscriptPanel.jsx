import { useState, useEffect } from "react";
import LiquidGlassDiv from "../../../Components/LiquidGlassDiv.jsx";
import LiquidGlassScrollBar from "../../../Components/LiquidGlassScrollBar.jsx";
import LiquidGlassInnerTextButton from "../../../Components/LiquidGlassInnerTextButton.jsx";
import { updateTranscript, getProcessedTranscript } from "../../../Api/gateway.js";

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


function ProcessedTranscriptPanel({ workspaceId, processedTranscript, socket, isConnected }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processStatus, setProcessStatus] = useState(null);
    const [fetchedTranscript, setFetchedTranscript] = useState(null);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'workspace_message' && data.sub_type === 'process_status') {
                    const status = data.status;
                    setProcessStatus(status);

                    if (status === 'Done') {
                        setIsProcessing(false);
                        fetchProcessedTranscript();
                    } else if (status === 'Error' || status === 'None') {
                        setIsProcessing(false);
                    } else {
                        setIsProcessing(true);
                    }
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        socket.addEventListener('message', handleMessage);

        return () => {
            socket.removeEventListener('message', handleMessage);
        };
    }, [socket, workspaceId]);

    const fetchProcessedTranscript = async () => {
        try {
            const response = await getProcessedTranscript(workspaceId);
            setFetchedTranscript(response.processed_transcript);
        } catch (error) {
            console.error('Failed to fetch processed transcript:', error);
        }
    };

    const formatProcessedTranscript = (transcript) => {
        return JSON.stringify(transcript, null, 2);
    };

    const handleProcess = () => {
        setIsProcessing(true);
        setProcessStatus('Starting');

        if (socket && isConnected) {
            socket.send(JSON.stringify({
                type: "workspace_message",
                sub_type: "process_transcript"
            }));
            console.log('Sent process_transcript message for workspace:', workspaceId);
        } else {
            console.error('WebSocket not connected');
            setIsProcessing(false);
            setProcessStatus(null);
        }
    };

    // Show error state
    if (processStatus === 'Error') {
        return (
            <LiquidGlassScrollBar>
                <div className="transcript-content-wrapper">
                    <div className="transcript-empty-state">
                        <p className="panel-content">There is an error</p>
                        <LiquidGlassInnerTextButton onClick={handleProcess}>
                            Process
                        </LiquidGlassInnerTextButton>
                    </div>
                </div>
            </LiquidGlassScrollBar>
        );
    }

    // Show none state (empty transcript)
    if (processStatus === 'None') {
        return (
            <LiquidGlassScrollBar>
                <div className="transcript-content-wrapper">
                    <div className="transcript-empty-state">
                        <p className="panel-content">You need to fill the raw transcript</p>
                        <LiquidGlassInnerTextButton onClick={handleProcess}>
                            Process
                        </LiquidGlassInnerTextButton>
                    </div>
                </div>
            </LiquidGlassScrollBar>
        );
    }

    // Show processing state
    if (isProcessing) {
        return (
            <LiquidGlassScrollBar>
                <div className="transcript-content-wrapper">
                    <div className="transcript-empty-state">
                        <div className="processing-text-shimmer">
                            {processStatus || 'Processing'}...
                        </div>
                    </div>
                </div>
            </LiquidGlassScrollBar>
        );
    }

    // Show completed transcript with Re-process button
    if (fetchedTranscript) {
        return (
            <LiquidGlassScrollBar>
                <div className="transcript-content-wrapper">
                    <div className="transcript-header-buttons" style={{ marginBottom: '10px' }}>
                        <LiquidGlassInnerTextButton onClick={handleProcess}>
                            Re-process
                        </LiquidGlassInnerTextButton>
                    </div>
                    <p className="panel-content transcript-content-display">
                        {formatProcessedTranscript(fetchedTranscript)}
                    </p>
                </div>
            </LiquidGlassScrollBar>
        );
    }

    // Default: show initial process button
    return (
        <LiquidGlassScrollBar>
            <div className="transcript-content-wrapper">
                <div className="transcript-empty-state">
                    <LiquidGlassInnerTextButton onClick={handleProcess}>
                        Process
                    </LiquidGlassInnerTextButton>
                </div>
            </div>
        </LiquidGlassScrollBar>
    );
}

export default function TranscriptPanel({ workspaceId, transcript, processedTranscript, socket, isConnected }) {
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
                            <LiquidGlassInnerTextButton
                                onClick={handleFinishEditing}
                                title="Save changes and exit edit mode"
                            >
                                Finish
                            </LiquidGlassInnerTextButton>
                        )}
                    </div>
                </div>
                {showProcessed ? (
                    <ProcessedTranscriptPanel
                        workspaceId={workspaceId}
                        processedTranscript={processedTranscript}
                        socket={socket}
                        isConnected={isConnected}
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