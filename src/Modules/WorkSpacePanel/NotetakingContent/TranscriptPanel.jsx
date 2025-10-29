import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import LiquidGlassFlexibleDiv from "../../../Components/LiquidGlassOutter/LiquidGlassFlexibleDiv.jsx";
import LiquidGlassScrollBar from "../../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx";
import LiquidGlassInnerTextButton from "../../../Components/LiquidGlassInner/LiquidGlassInnerTextButton.jsx";
import { updateTranscript, getProcessedTranscript, getMetadata } from "../../../Api/gateway.js";

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


function ProcessedTranscriptPanel({ workspaceId, processedTranscript, socket, isConnected, onMetadataUpdate, refreshTrigger }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processStatus, setProcessStatus] = useState(null);
    const [fetchedTranscript, setFetchedTranscript] = useState(null);
    const [showRawJSON, setShowRawJSON] = useState(false);

    const fetchProcessedTranscript = useCallback(async () => {
        try {
            const response = await getProcessedTranscript(workspaceId);
            setFetchedTranscript(response.processed_transcript);
        } catch (error) {
            console.error('Failed to fetch processed transcript:', error);
        }
    }, [workspaceId]);

    const fetchMetadata = useCallback(async () => {
        try {
            const response = await getMetadata(workspaceId);
            if (onMetadataUpdate) {
                onMetadataUpdate(response.metadata);
            }
        } catch (error) {
            console.error('Failed to fetch metadata:', error);
        }
    }, [workspaceId, onMetadataUpdate]);

    useEffect(() => {
        // Initialize with the processedTranscript prop
        if (processedTranscript && processedTranscript !== '' &&
            (!Array.isArray(processedTranscript) || processedTranscript.length > 0)) {
            setFetchedTranscript(processedTranscript);
        } else {
            setFetchedTranscript(null);
        }
    }, [processedTranscript, workspaceId]);

    useEffect(() => {
        // Refetch when refreshTrigger changes
        if (refreshTrigger > 0) {
            fetchProcessedTranscript();
        }
    }, [refreshTrigger, fetchProcessedTranscript]);

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
                        fetchMetadata();
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
    }, [socket, workspaceId, fetchProcessedTranscript, fetchMetadata]);

    const renderProcessedTranscript = (transcript) => {
        if (!Array.isArray(transcript)) return null;

        return transcript.map((item, index) => (
            <div key={index} className="transcript-entry">
                <div className="transcript-entry-header">
                    <span className="transcript-speaker">{item.speaker}</span>
                    <span className="transcript-timestamp">[{item.timestamp}]</span>
                </div>
                <div className="transcript-utterance">{item.utterance}</div>
            </div>
        ));
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

    return (
        <>
            <div className="transcript-header-buttons" style={{ marginBottom: '0px' }}>
                <LiquidGlassInnerTextButton onClick={handleProcess}>
                    Process
                </LiquidGlassInnerTextButton>
                <LiquidGlassInnerTextButton onClick={() => setShowRawJSON(!showRawJSON)}>
                    {showRawJSON ? 'Show List' : 'Show Raw JSON'}
                </LiquidGlassInnerTextButton>
            </div>
            <LiquidGlassScrollBar>
                <div className="transcript-content-wrapper">
                    {processStatus === 'Error' ? (
                        <div className="transcript-empty-state">
                            <p className="panel-content">There is an error</p>
                        </div>
                    ) : processStatus === 'None' ? (
                        <div className="transcript-empty-state">
                            <p className="panel-content">You need to fill the raw transcript</p>
                        </div>
                    ) : isProcessing ? (
                        <div className="transcript-empty-state">
                            <div className="processing-text-shimmer">
                                {processStatus || 'Processing'}...
                            </div>
                        </div>
                    ) : fetchedTranscript ? (
                        showRawJSON ? (
                            <p className="panel-content transcript-content-display">
                                {JSON.stringify(fetchedTranscript, null, 2)}
                            </p>
                        ) : (
                            <div className="transcript-list">
                                {renderProcessedTranscript(fetchedTranscript)}
                            </div>
                        )
                    ) : (
                        <div className="transcript-empty-state">
                            <p className="panel-content transcript-empty-hint">(Click Process)</p>
                        </div>
                    )}
                </div>
            </LiquidGlassScrollBar>
        </>
    );
}

const TranscriptPanel = forwardRef(function TranscriptPanel({ workspaceId, transcript, processedTranscript, socket, isConnected, onMetadataUpdate }, ref) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTranscript, setEditedTranscript] = useState(transcript || 'No notes yet...');
    const [isSyncing, setIsSyncing] = useState(false);
    const [showProcessed, setShowProcessed] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useImperativeHandle(ref, () => ({
        refetchProcessedTranscript: () => {
            setRefreshTrigger(prev => prev + 1);
        }
    }));

    useEffect(() => {
        const hasNoTranscript = !transcript || transcript === '' || transcript === 'No notes yet...';
        setEditedTranscript(transcript || 'No notes yet...');
        setIsEditing(hasNoTranscript);
        setShowProcessed(!hasNoTranscript);
    }, [transcript, workspaceId]);

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
        <LiquidGlassFlexibleDiv isButton={false}>
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
                            <img
                                src="/icons/swap.png"
                                alt="Swap view"
                                className="transcript-swap-icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowProcessed(!showProcessed);
                                    setIsEditing(false);
                                }}
                                title={showProcessed ? 'Switch to Raw Transcript' : 'Switch to Processed Transcript'}
                            />
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
                        onMetadataUpdate={onMetadataUpdate}
                        refreshTrigger={refreshTrigger}
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
        </LiquidGlassFlexibleDiv>
    );
});

export default TranscriptPanel;