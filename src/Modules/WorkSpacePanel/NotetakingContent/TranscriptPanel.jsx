import { useState } from "react";
import LiquidGlassDiv from "../../../Components/LiquidGlassDiv.jsx";
import LiquidGlassScrollBar from "../../../Components/LiquidGlassScrollBar.jsx";

export default function TranscriptPanel({ transcript }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTranscript, setEditedTranscript] = useState(transcript || 'No notes yet...');
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

    return <LiquidGlassDiv isButton={false}>
        <div className="panel-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="panel-title">Transcript</h2>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    style={{
                        background: isEditing ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                        border: 'none',
                        borderRadius: 'var(--border-radius-lg)',
                        cursor: 'pointer',
                        padding: '8px',
                        transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isEditing ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = isEditing ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)'}
                >
                    <img
                        src={isEditing ? '/icons/icon_note.png' : '/icons/icon_transcript.png'}
                        alt="edit"
                        style={{ width: '28px', height: '28px', display: 'block' }}
                    />
                </button>
            </div>
            {isEditing && (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                        padding: 'var(--spacing-sm)',
                        background: isDragging ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        border: isDragging ? '2px dashed rgba(255, 255, 255, 0.5)' : '2px dashed rgba(255, 255, 255, 0.2)',
                        borderRadius: 'var(--border-radius-sm)',
                        textAlign: 'center',
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.85em',
                        transition: 'var(--transition-fast)'
                    }}
                >
                    Drop .txt file here
                </div>
            )}
            {isEditing ? (
                <div className="chat-input-area" style={{ flex: 1 }}>
                    <textarea
                        className="chat-textarea"
                        value={editedTranscript}
                        onChange={(e) => setEditedTranscript(e.target.value)}
                    />
                </div>
            ) : (
                <LiquidGlassScrollBar>
                    <div style={{ flex: 1, padding: 'var(--spacing-xs)' }}>
                        <p className="panel-content">{editedTranscript}</p>
                    </div>
                </LiquidGlassScrollBar>
            )}
        </div>
    </LiquidGlassDiv>

}