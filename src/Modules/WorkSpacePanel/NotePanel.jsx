import { useState, useEffect, useMemo, useCallback } from "react";
import { createEditor, Editor, Transforms, Text } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import LiquidGlassDiv from "../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx";
// Removed custom LiquidGlassScrollBar due to clipping issues in Slate editor
// import LiquidGlassScrollBar from "../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx";
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

    const saveNote = useCallback(() => {
        const noteString = JSON.stringify(editor.children);
        updateNote(workspaceId, noteString).catch(error => {
            console.error('Error saving note:', error);
        });
    }, [editor, workspaceId]);

    const handleChange = useCallback((newValue) => {
        const isAstChange = editor.operations.some(op => op.type !== 'set_selection');
        if (isAstChange) {
            saveNote();
        }
    }, [editor, saveNote]);

    const handleKeyDown = useCallback((event) => {
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            saveNote();
        }
    }, [saveNote]);

    const toggleMark = (format) => {
        const isActive = isMarkActive(editor, format);
        if (isActive) {
            Editor.removeMark(editor, format);
        } else {
            Editor.addMark(editor, format, true);
        }
    };

    const isMarkActive = (editor, format) => {
        const marks = Editor.marks(editor);
        return marks ? marks[format] === true : false;
    };

    const renderLeaf = useCallback((props) => {
        let { attributes, children, leaf } = props;
        if (leaf.bold) {
            children = <strong>{children}</strong>;
        }
        if (leaf.italic) {
            children = <em>{children}</em>;
        }
        if (leaf.underline) {
            children = <u>{children}</u>;
        }
        return <span {...attributes}>{children}</span>;
    }, []);

    return (
        <>
            <div className="note-toolbar">
                <button
                    className="format-button"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        toggleMark('bold');
                    }}
                >
                    B
                </button>
                <button
                    className="format-button"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        toggleMark('italic');
                    }}
                >
                    I
                </button>
                <button
                    className="format-button"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        toggleMark('underline');
                    }}
                >
                    U
                </button>
            </div>
            <Slate key={`${workspaceId}-${note}`} editor={editor} initialValue={getInitialValue()} onChange={handleChange}>
                <Editable
                    className="slate-editor native-scrollbar"
                    placeholder="Start typing your notes..."
                    onKeyDown={handleKeyDown}
                    renderLeaf={renderLeaf}
                />
            </Slate>
        </>
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

                <div className="note-divider"></div>

                <div className="note-content">
                    <SlatePanel workspaceId={workspaceId} note={note} />
                </div>
            </div>
        </LiquidGlassDiv>
    );
}
