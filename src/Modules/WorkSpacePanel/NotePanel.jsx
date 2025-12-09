import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { createEditor, Editor, Transforms, Text, Range, Element as SlateElement } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import LiquidGlassDiv from "../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx";
// Removed custom LiquidGlassScrollBar due to clipping issues in Slate editor
// import LiquidGlassScrollBar from "../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx";
import { updateNote } from "../../Api/gateway.js";
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
    const [savedSelection, setSavedSelection] = useState(null);
    const [lockedSelection, setLockedSelection] = useState(null);
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
        // console.log('Saving to backend - Slate children:', JSON.stringify(editor.children, null, 2));
        console.log('Saving to backend - Markdown:', markdown);
        onSave();
        updateNote(workspaceId, markdown).catch(error => {
            console.error('Error saving note:', error);
        });
    }, [editor, workspaceId, onSave]);

    // Find text in Slate editor and return Range
    const findTextRange = useCallback((searchMarkdown) => {
        // Use raw markdown text directly for search (trim whitespace)
        const searchText = searchMarkdown.trim();

        // Get editor content as plain text with newlines between blocks
        const editorText = editor.children.map(node =>
            node.children?.map(child => child.text || '').join('') || ''
        ).join('\n');

        const index = editorText.indexOf(searchText);

        if (index === -1) {
            console.warn('Could not find text in editor:', searchText, 'Editor text:', editorText);
            return null;
        }

        // Convert character index to Slate path/offset
        // Account for newlines between blocks
        let charCount = 0;
        let startPoint = null;
        let endPoint = null;
        const endIndex = index + searchText.length;

        for (let blockIdx = 0; blockIdx < editor.children.length; blockIdx++) {
            const block = editor.children[blockIdx];
            const blockChildren = block.children || [];

            for (let childIdx = 0; childIdx < blockChildren.length; childIdx++) {
                const child = blockChildren[childIdx];
                if (!Text.isText(child)) continue;

                const nodeText = child.text;
                const nodeStart = charCount;
                const nodeEnd = charCount + nodeText.length;

                // Find start point
                if (!startPoint && index >= nodeStart && index < nodeEnd) {
                    startPoint = { path: [blockIdx, childIdx], offset: index - nodeStart };
                }

                // Find end point
                if (!endPoint && endIndex > nodeStart && endIndex <= nodeEnd) {
                    endPoint = { path: [blockIdx, childIdx], offset: endIndex - nodeStart };
                }

                if (startPoint && endPoint) {
                    return { anchor: startPoint, focus: endPoint };
                }

                charCount = nodeEnd;
            }

            // Add newline between blocks
            charCount += 1;
        }

        if (startPoint && endPoint) {
            return { anchor: startPoint, focus: endPoint };
        }
        return null;
    }, [editor]);

    // Subscribe to SMART_UPDATE_LOCK channel
    useEffect(() => {
        const unsubscribe = CommendDispatcher.Subscribe2Channel(
            ChannelEnum.SMART_UPDATE_LOCK,
            (data) => {
                console.log('Received smart_update_lock:', data.lock_text);
                const range = findTextRange(data.lock_text);
                if (range) {
                    setLockedSelection(range);
                } else {
                    console.error('Failed to find and lock text');
                }
            }
        );
        return unsubscribe;
    }, [findTextRange]);

    // Subscribe to SMART_UPDATE channel
    useEffect(() => {
        const unsubscribe = CommendDispatcher.Subscribe2Channel(
            ChannelEnum.SMART_UPDATE,
            (data) => {
                console.log('Received smart_update_result:', data.result);
                // Replace locked selection with result
                if (lockedSelection) {
                    Transforms.select(editor, lockedSelection);
                    Transforms.delete(editor);

                    // Convert result markdown to Slate nodes and insert
                    const newNodes = richTextConvertor.md2slate(data.result);
                    Transforms.insertNodes(editor, newNodes);

                    // Clear locked state
                    setLockedSelection(null);
                }
            }
        );
        return unsubscribe;
    }, [lockedSelection, editor]);

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
        // Only process selection changes when editor is focused
        if (!ReactEditor.isFocused(editor)) return;

        const { selection } = editor;
        if (selection && !Range.isCollapsed(selection)) {
            const selectedText = Editor.string(editor, selection);
            if (selectedText.trim()) {
                const selectedFragment = Editor.fragment(editor, selection);
                const previewText = selectedText.slice(0, 30) + (selectedText.length > 30 ? '...' : '');
                const markdown = richTextConvertor.slate2md(selectedFragment);

                console.log('Selected Markdown:', markdown);
                console.log('Selection Range:', { from: selection.anchor, to: selection.focus });

                // Save selection for highlight persistence
                setSavedSelection(selection);

                CommendDispatcher.Publish2Channel(ChannelEnum.TEXT_SELECT, {
                    text: previewText,
                    json: selectedFragment,
                    markdown: markdown
                });
            } else {
                CommendDispatcher.Publish2Channel(ChannelEnum.TEXT_SELECT, null);
                setSavedSelection(null);
            }
        } else {
            // Collapsed selection (cursor only) - clear everything
            setPopupState({ show: false, text: '', position: { top: 0, left: 0 }, selection: null });
            setSavedSelection(null);
            CommendDispatcher.Publish2Channel(ChannelEnum.TEXT_SELECT, null);
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
            // Get the selected text as markdown
            const selectedFragment = Editor.fragment(editor, popupState.selection);
            const originalMarkdown = richTextConvertor.slate2md(selectedFragment);

            // Send smart_update message via SOCKET_SEND channel
            // Lock will come from backend via SMART_UPDATE_LOCK channel
            CommendDispatcher.Publish2Channel(ChannelEnum.SOCKET_SEND, {
                type: "workspace_message",
                sub_type: "smart_update",
                message_original: originalMarkdown,
                query: instruction
            });
            console.log('Sent smart_update:', { original: originalMarkdown, query: instruction });
        }
        setPopupState({ show: false, text: '', position: { top: 0, left: 0 }, selection: null });
        setSavedSelection(null);
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

    const decorate = useCallback(([node, path]) => {
        const ranges = [];
        // Locked selection - always show (takes priority)
        if (lockedSelection) {
            const intersection = Range.intersection(lockedSelection, Editor.range(editor, path));
            if (intersection) {
                ranges.push({ ...intersection, locked: true });
            }
        }
        // Saved selection highlight (when popup is open or editor not focused)
        else if (savedSelection && (popupState.show || !ReactEditor.isFocused(editor))) {
            const intersection = Range.intersection(savedSelection, Editor.range(editor, path));
            if (intersection) {
                ranges.push({ ...intersection, highlight: true });
            }
        }
        return ranges;
    }, [lockedSelection, savedSelection, editor, popupState.show]);

    const renderLeaf = useCallback((props) => {
        let { attributes, children, leaf } = props;
        if (leaf.locked) {
            children = <span className="locked-text">{children}</span>;
        }
        if (leaf.highlight) {
            children = <span style={{ backgroundColor: 'rgba(128, 128, 128, 0.4)' }}>{children}</span>;
        }
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
                    readOnly={!!lockedSelection}
                    onKeyDown={handleKeyDown}
                    onSelect={handleSelect}
                    onMouseUp={handleMouseUp}
                    decorate={decorate}
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

export default function NotePanel({ workspaceId, note }) {
    const [isSaving, setIsSaving] = useState(false);

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
                    <h2 className="panel-title">Note</h2>
                </div>

                <div className={`note-divider ${isSaving ? 'saving' : ''}`}></div>

                <div className="note-content">
                    <SlatePanel workspaceId={workspaceId} note={note} onSave={handleSave} />
                </div>
            </div>
        </LiquidGlassDiv>
    );
}
