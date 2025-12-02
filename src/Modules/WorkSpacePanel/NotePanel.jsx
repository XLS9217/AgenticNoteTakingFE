import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { createEditor, Editor, Transforms, Text, Range, Element as SlateElement } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import LiquidGlassDiv from "../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx";
// Removed custom LiquidGlassScrollBar due to clipping issues in Slate editor
// import LiquidGlassScrollBar from "../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx";
import { changeWorkspaceName, updateNote } from "../../Api/gateway.js";
import CommendDispatcher, { ChannelEnum } from "../../Util/CommendDispatcher.js";
import richTextConvertor from "../../Util/RichTextConvertor.js";

function SelectionPopup({ position, onUpdate, onCancel }) {
    const [instruction, setInstruction] = useState('');
    const [isClosing, setIsClosing] = useState(false);
    const popupRef = useRef(null);

    const handleClose = (callback) => {
        setIsClosing(true);
        setTimeout(() => {
            callback();
        }, 150);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                handleClose(onCancel);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleClose(onCancel);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onCancel]);

    return (
        <div
            ref={popupRef}
            className={`selection-popup ${isClosing ? 'closing' : ''}`}
            style={{ top: position.top, left: position.left }}
        >
            <textarea
                className="selection-popup-input"
                placeholder="Enter instruction for LLM..."
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                rows={3}
            />
            <div className="selection-popup-buttons">
                <button onClick={() => handleClose(() => onUpdate(instruction))}>Update</button>
                <button onClick={() => handleClose(onCancel)}>Cancel</button>
            </div>
        </div>
    );
}

function SlatePanel({ workspaceId, note, onSave }) {
    const editor = useMemo(() => withReact(createEditor()), []);
    const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false, heading1: false, heading2: false });
    const [popupState, setPopupState] = useState({
        show: false,
        text: '',
        position: { top: 0, left: 0 },
        selection: null
    });
    // console.log('Note:', note);
    const getInitialValue = () => {
        if (note) {
            const slateNodes = richTextConvertor.md2slate(note);
            if (slateNodes.length > 0) {
                return slateNodes;
            }
        }
        return [{ type: 'paragraph', children: [{ text: 'Start typing your notes...' }] }];
    };

    const saveNote = useCallback(() => {
        const markdown = richTextConvertor.slate2md(editor.children);
        console.log('Saving to backend - Slate children:', JSON.stringify(editor.children, null, 2));
        console.log('Saving to backend - Markdown:', markdown);
        onSave();
        updateNote(workspaceId, markdown).catch(error => {
            console.error('Error saving note:', error);
        });
    }, [editor, workspaceId, onSave]);

    const handleChange = useCallback((newValue) => {
        const isAstChange = editor.operations.some(op => op.type !== 'set_selection');
        if (isAstChange) {
            saveNote();
        }

        // Update active formats based on cursor position
        const marks = Editor.marks(editor);
        setActiveFormats({
            bold: marks?.bold === true,
            italic: marks?.italic === true,
            underline: marks?.underline === true,
            heading1: marks?.heading1 === true,
            heading2: marks?.heading2 === true
        });
    }, [editor, saveNote]);

    const handleKeyDown = useCallback((event) => {
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            saveNote();
        }
    }, [saveNote]);

    const handleSelect = useCallback(() => {
        const { selection } = editor;
        if (selection && !Range.isCollapsed(selection)) {
            const selectedText = Editor.string(editor, selection);
            if (selectedText.trim()) {
                const selectedFragment = Editor.fragment(editor, selection);
                const previewText = selectedText.slice(0, 30) + (selectedText.length > 30 ? '...' : '');
                const markdown = richTextConvertor.slate2md(selectedFragment);

                console.log('Selected Markdown:', markdown);
                console.log('Selection Range:', { from: selection.anchor, to: selection.focus });

                CommendDispatcher.Publish2Channel(ChannelEnum.TEXT_SELECT, {
                    text: previewText,
                    json: selectedFragment,
                    markdown: markdown
                });
            } else {
                CommendDispatcher.Publish2Channel(ChannelEnum.TEXT_SELECT, null);
            }
        } else {
            // Collapsed selection (cursor only)
            CommendDispatcher.Publish2Channel(ChannelEnum.TEXT_SELECT, null);
            setPopupState({ show: false, text: '', position: { top: 0, left: 0 }, selection: null });
        }
    }, [editor]);

    const handleMouseUp = useCallback(() => {
        const { selection } = editor;
        if (selection && !Range.isCollapsed(selection)) {
            const selectedText = Editor.string(editor, selection);
            if (selectedText.trim()) {
                // Get DOM position for popup
                const domSelection = window.getSelection();
                if (domSelection.rangeCount > 0) {
                    const range = domSelection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    setPopupState({
                        show: true,
                        text: selectedText,
                        position: { top: rect.bottom + 8, left: rect.left },
                        selection: selection
                    });
                }
            }
        }
    }, [editor]);

    const handlePopupUpdate = (instruction) => {
        if (popupState.selection && instruction.trim()) {
            Transforms.select(editor, popupState.selection);
            Transforms.delete(editor);
            Transforms.insertText(editor, instruction); // For now, just insert the instruction - LLM integration later
        }
        setPopupState({ show: false, text: '', position: { top: 0, left: 0 }, selection: null });
    };

    const handlePopupCancel = () => {
        setPopupState({ show: false, text: '', position: { top: 0, left: 0 }, selection: null });
    };

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

    const toggleBlock = (format) => {
        const isActive = isBlockActive(editor, format);
        Transforms.setNodes(
            editor,
            { type: isActive ? 'paragraph' : format },
            { match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
        );
    };

    const isBlockActive = (editor, format) => {
        const { selection } = editor;
        if (!selection) return false;
        const [match] = Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: n => SlateElement.isElement(n) && n.type === format,
        });
        return !!match;
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

    const renderElement = useCallback((props) => {
        const { attributes, children, element } = props;
        switch (element.type) {
            case 'heading1':
                return <h1 {...attributes} style={{ fontSize: '2em', fontWeight: 'bold', margin: '0.5em 0' }}>{children}</h1>;
            case 'heading2':
                return <h2 {...attributes} style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '0.4em 0' }}>{children}</h2>;
            default:
                return <p {...attributes} style={{ margin: 0 }}>{children}</p>;
        }
    }, []);

    return (
        <>
            <div className="note-toolbar">
                <button
                    className={`format-button ${isBlockActive(editor, 'heading1') ? 'active' : ''}`}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        toggleBlock('heading1');
                    }}
                >
                    H1
                </button>
                <button
                    className={`format-button ${isBlockActive(editor, 'heading2') ? 'active' : ''}`}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        toggleBlock('heading2');
                    }}
                >
                    H2
                </button>
                <button
                    className={`format-button ${activeFormats.bold ? 'active' : ''}`}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        toggleMark('bold');
                    }}
                >
                    B
                </button>
                <button
                    className={`format-button ${activeFormats.italic ? 'active' : ''}`}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        toggleMark('italic');
                    }}
                >
                    I
                </button>
                <button
                    className={`format-button ${activeFormats.underline ? 'active' : ''}`}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        toggleMark('underline');
                    }}
                >
                    U
                </button>
                <button
                    className="format-button save-button"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        saveNote();
                    }}
                    title="Save (Ctrl+S)"
                >
                    SAVE
                </button>
            </div>
            <Slate key={`${workspaceId}-${note}`} editor={editor} initialValue={getInitialValue()} onChange={handleChange}>
                <Editable
                    className="slate-editor native-scrollbar"
                    placeholder="Start typing your notes..."
                    onKeyDown={handleKeyDown}
                    onSelect={handleSelect}
                    onMouseUp={handleMouseUp}
                    renderLeaf={renderLeaf}
                    renderElement={renderElement}
                />
            </Slate>
            {popupState.show && createPortal(
                <SelectionPopup
                    position={popupState.position}
                    onUpdate={handlePopupUpdate}
                    onCancel={handlePopupCancel}
                />,
                document.body
            )}
        </>
    );
}

export default function NotePanel({ workspaceId, note, workspaceName, onWorkspaceNameChange, onNoteChange }) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

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

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
        }, 1000);
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

                <div className={`note-divider ${isSaving ? 'saving' : ''}`}></div>

                <div className="note-content">
                    <SlatePanel workspaceId={workspaceId} note={note} onSave={handleSave} />
                </div>
            </div>
        </LiquidGlassDiv>
    );
}
