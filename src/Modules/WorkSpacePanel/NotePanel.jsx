import { useState, useEffect, useMemo, useCallback } from "react";
import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import LiquidGlassDiv from "../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx";
import LiquidGlassScrollBar from "../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx";
import { changeWorkspaceName, updateNote } from "../../Api/gateway.js";

function SlatePanel({ workspaceId, note }) {
    const editor = useMemo(() => withReact(createEditor()), []);
    console.log('Note:', note);
    const getInitialValue = () => {
        if (note) {
            try {
                return JSON.parse(note);
            } catch (e) {
                console.error('Error parsing note:', e);
            }
        }
        return [{ type: 'paragraph', children: [{ text: 'Start typing your notes...' }] }];
    };

    const handleChange = useCallback((newValue) => {
        const isAstChange = editor.operations.some(op => op.type !== 'set_selection');
        if (isAstChange) {
            const noteString = JSON.stringify(newValue);
            updateNote(workspaceId, noteString).catch(error => {
                console.error('Error saving note:', error);
            });
        }
    }, [editor, workspaceId]);

    return (
        <LiquidGlassScrollBar className="note-scroll">
            <Slate key={`${workspaceId}-${note}`} editor={editor} initialValue={getInitialValue()} onChange={handleChange}>
                <Editable
                    className="slate-editor"
                    placeholder="Start typing your notes..."
                />
            </Slate>
        </LiquidGlassScrollBar>
    );
}

export default function NotePanel({ workspaceId, note, workspaceName, onWorkspaceNameChange, onNoteChange }) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');

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
                    <SlatePanel workspaceId={workspaceId} note={note} />
                </div>
            </div>
        </LiquidGlassDiv>
    );
}
