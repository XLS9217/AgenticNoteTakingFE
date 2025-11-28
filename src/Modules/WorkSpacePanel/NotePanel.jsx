import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import LiquidGlassDiv from "../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx";
import LiquidGlassScrollBar from "../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx";
import { changeWorkspaceName } from "../../Api/gateway.js";

export default function NotePanel({ workspaceId, note, workspaceName, onWorkspaceNameChange, onNoteChange }) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');
    const [isMarkdownMode, setIsMarkdownMode] = useState(true);
    const [editedNote, setEditedNote] = useState(note || '');

    useEffect(() => {
        setEditedNote(note || '');
    }, [note]);

    // Name change handlers
    const handleNameClick = () => {
        setIsEditingName(true);
        setEditNameValue(workspaceName);
    };

    const handleNameChange = (e) => {
        setEditNameValue(e.target.value);
    };

    const handleNameKeyDown = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newName = editNameValue.trim();
            if (newName && newName !== workspaceName) {
                try {
                    await changeWorkspaceName(workspaceId, newName);
                    onWorkspaceNameChange(newName);
                } catch (error) {
                    console.error('Failed to change workspace name:', error);
                }
            }
            setIsEditingName(false);
        } else if (e.key === 'Escape') {
            setIsEditingName(false);
        }
    };

    const handleNameBlur = () => {
        setIsEditingName(false);
    };

    // Note handlers
    const handleNoteChange = (value) => {
        setEditedNote(value);
        if (onNoteChange) {
            onNoteChange(value);
        }
    };

    const handleToggleMode = () => {
        setIsMarkdownMode((prev) => !prev);
    };

    return (
        <LiquidGlassDiv blurriness={0.5} variant="workspace">
            <div className="note-panel-container">
                <div className="note-header">
                    {isEditingName ? (
                        <textarea
                            className="workspace-name-input"
                            value={editNameValue}
                            onChange={handleNameChange}
                            onKeyDown={handleNameKeyDown}
                            onBlur={handleNameBlur}
                            autoFocus
                            rows={1}
                        />
                    ) : (
                        <div className="workspace-name-display" onClick={handleNameClick}>
                            {workspaceName || 'Untitled'}
                        </div>
                    )}
                </div>

                <div className="note-content">
                    <button
                        type="button"
                        onClick={handleToggleMode}
                        title={isMarkdownMode ? 'Switch to edit mode' : 'Switch to markdown view'}
                        className="note-toggle-button"
                    >
                        {'</>'}
                    </button>
                    <LiquidGlassScrollBar className="note-scroll">
                        {isMarkdownMode ? (
                            <div className="note-markdown-display">
                                {editedNote ? <ReactMarkdown>{editedNote}</ReactMarkdown> : 'No notes yet...'}
                            </div>
                        ) : (
                            <textarea
                                className="note-textarea"
                                value={editedNote}
                                onChange={(e) => handleNoteChange(e.target.value)}
                                placeholder="Start typing your notes..."
                            />
                        )}
                    </LiquidGlassScrollBar>
                </div>
            </div>
        </LiquidGlassDiv>
    );
}
