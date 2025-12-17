import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createEditor, Editor, Transforms, Range, Element as SlateElement } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import LiquidGlassDiv from "../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx";
// Removed custom LiquidGlassScrollBar due to clipping issues in Slate editor
// import LiquidGlassScrollBar from "../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx";
import { updateNote } from "../../Api/gateway.js";
import CommendDispatcher, { ChannelEnum } from "../../Util/CommendDispatcher.js";
import richTextConvertor from "../../Util/RichTextConvertor.js";

function SlatePanel({ workspaceId, note, onSave }) {
    const editor = useMemo(() => withReact(createEditor()), []);
    const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false, heading1: false, heading2: false });
    const [savedSelection, setSavedSelection] = useState(null);
    const [isLocked, setIsLocked] = useState(false);

    // Keep markdown in memory for lock/unlock operations
    const markdownRef = useRef(note || '');
    const lockTextRef = useRef(null);

    // Sync markdownRef when note prop changes
    useEffect(() => {
        markdownRef.current = note || '';
    }, [note]);

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
        markdownRef.current = markdown;
        console.log('Saving to backend - Markdown:', markdown);
        onSave();
        updateNote(workspaceId, markdown).catch(error => {
            console.error('Error saving note:', error);
        });
    }, [editor, workspaceId, onSave]);

    // Helper to replace editor content with new nodes
    const replaceEditorContent = useCallback((newNodes) => {
        // Delete all content and insert new
        Transforms.deselect(editor);
        const totalNodes = editor.children.length;
        for (let i = totalNodes - 1; i >= 0; i--) {
            Transforms.removeNodes(editor, { at: [i] });
        }
        Transforms.insertNodes(editor, newNodes, { at: [0] });
    }, [editor]);

    // Subscribe to SMART_UPDATE_LOCK channel
    useEffect(() => {
        const unsubscribe = CommendDispatcher.Subscribe2Channel(
            ChannelEnum.SMART_UPDATE_LOCK,
            (data) => {
                console.log('Received smart_update_lock:', data.lock_text);

                // Wrap lock text with <smart_lock> tags in markdown
                const lockedMarkdown = richTextConvertor.wrapWithLockTag(markdownRef.current, data.lock_text);

                if (!richTextConvertor.hasLockTag(lockedMarkdown)) {
                    console.error('Failed to find lock text in markdown');
                    return;
                }

                // Store lock text for replacement later
                lockTextRef.current = data.lock_text;

                // Convert to Slate with locked nodes marked
                const { nodes } = richTextConvertor.md2slateWithLock(lockedMarkdown);

                // Replace editor content
                replaceEditorContent(nodes);
                setIsLocked(true);

                console.log('Locked markdown:', lockedMarkdown);
            }
        );
        return unsubscribe;
    }, [replaceEditorContent]);

    // Subscribe to SMART_UPDATE channel
    useEffect(() => {
        const unsubscribe = CommendDispatcher.Subscribe2Channel(
            ChannelEnum.SMART_UPDATE,
            (data) => {
                console.log('Received smart_update_result:', data.result);

                if (!isLocked || !lockTextRef.current) {
                    console.warn('Received update but no lock active');
                    return;
                }

                // Replace lock text in markdown with new content
                const updatedMarkdown = markdownRef.current.replace(lockTextRef.current, data.result);
                markdownRef.current = updatedMarkdown;

                // Convert to clean Slate (no lock tags)
                const newNodes = richTextConvertor.md2slate(updatedMarkdown);

                // Replace editor content
                replaceEditorContent(newNodes);

                // Clear locked state
                setIsLocked(false);
                lockTextRef.current = null;

                // Save to backend
                updateNote(workspaceId, updatedMarkdown).catch(error => {
                    console.error('Error saving note after update:', error);
                });

                console.log('Updated markdown:', updatedMarkdown);
            }
        );
        return unsubscribe;
    }, [isLocked, replaceEditorContent, workspaceId]);

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
            // Collapsed selection (cursor only) - clear selection
            setSavedSelection(null);
            CommendDispatcher.Publish2Channel(ChannelEnum.TEXT_SELECT, null);
        }
    }, [editor]);

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
        // Saved selection highlight (when editor not focused)
        if (savedSelection && !ReactEditor.isFocused(editor)) {
            const intersection = Range.intersection(savedSelection, Editor.range(editor, path));
            if (intersection) {
                ranges.push({ ...intersection, highlight: true });
            }
        }
        return ranges;
    }, [savedSelection, editor]);

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
                    readOnly={isLocked}
                    onKeyDown={handleKeyDown}
                    onSelect={handleSelect}
                    decorate={decorate}
                    renderLeaf={renderLeaf}
                    renderElement={renderElement}
                />
            </Slate>
        </>
    );
}

export default function NotePanel({ workspaceId, note, isLoading }) {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
        }, 1000);
    };

    const dividerClass = `note-divider ${isLoading ? 'loading' : ''} ${isSaving ? 'saving' : ''}`;

    return (
        <LiquidGlassDiv blurriness={0.5} variant="workspace">
            <div className="note-panel-container">
                <div className="note-header">
                    <h2 className="panel-title">Note</h2>
                </div>

                <div className={dividerClass}></div>

                <div className="note-content">
                    <SlatePanel workspaceId={workspaceId} note={note} onSave={handleSave} />
                </div>
            </div>
        </LiquidGlassDiv>
    );
}
