import { useState } from "react";
import LiquidGlassDiv from "../../../Components/LiquidGlassDiv.jsx";
import LiquidGlassScrollBar from "../../../Components/LiquidGlassScrollBar.jsx";
import { updateTranscript } from "../../../Api/gateway.js";

export default function TranscriptPanel({ workspaceId, transcript }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTranscript, setEditedTranscript] = useState(transcript || 'No notes yet...');
    const [isDragging, setIsDragging] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

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

    return <LiquidGlassDiv isButton={false}>
        <div className="panel-container">
            <div className="transcript-header">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h2 className="panel-title">Transcript</h2>
                    {isSyncing && <span className="transcript-sync-status">(Syncing...)</span>}
                </div>
                <button
                    onClick={isEditing ? handleFinishEditing : () => setIsEditing(true)}
                    className={`transcript-edit-button ${isEditing ? 'transcript-edit-button--editing' : ''}`}
                >
                    <img
                        src={isEditing ? '/icons/icon_note.png' : '/icons/icon_transcript.png'}
                        alt="edit"
                        className="transcript-edit-icon"
                    />
                </button>
            </div>
            {isEditing && (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`transcript-dropzone ${isDragging ? 'transcript-dropzone--dragging' : ''}`}
                >
                    Drop .txt file here
                </div>
            )}
            {isEditing ? (
                <div className="chat-input-area transcript-edit-area">
                    <textarea
                        className="chat-textarea"
                        value={editedTranscript}
                        onChange={(e) => setEditedTranscript(e.target.value)}
                    />
                </div>
            ) : (
                <LiquidGlassScrollBar>
                    <div className="transcript-content-wrapper">
                        <p className="panel-content">{editedTranscript}</p>
                    </div>
                </LiquidGlassScrollBar>
            )}
        </div>
    </LiquidGlassDiv>

}