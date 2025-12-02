# Plan: Floating Selection Editor Popup

## Goal
Show a floating popup beside selected text with:
- Plain text input box (empty, for user to type LLM instructions)
- Update button (sends instruction + selected text to LLM, replaces selection with response)
- Cancel button (closes popup)
- Liquid glass aesthetic

**Note:** This is NOT a text editor - it's an instruction box for the LLM. User types instructions like "summarize this" or "make this formal".

## Implementation Steps

### Step 1: Create SelectionPopup Component
**File:** `NotePanel.jsx` (inline component or separate file) <-- make it a component in the file

```jsx
function SelectionPopup({ position, onUpdate, onCancel }) {
    const [instruction, setInstruction] = useState('');

    return (
        <div
            className="selection-popup"
            style={{ top: position.top, left: position.left }}
        >
            <input
                placeholder="Enter instruction for LLM..."
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
            />
            <button onClick={() => onUpdate(instruction)}>Update</button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    );
}
```

### Step 2: Track Selection Position in DOM
**File:** `NotePanel.jsx` - modify `handleSelect`

Use `window.getSelection().getRangeAt(0).getBoundingClientRect()` to get pixel coordinates of selection:

```js
const handleSelect = useCallback(() => {
    const { selection } = editor;
    if (selection && selection.anchor && selection.focus) {
        const selectedText = Editor.string(editor, selection);
        if (selectedText.trim()) {
            // Get DOM position
            const domSelection = window.getSelection();
            const range = domSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            setPopupState({
                show: true,
                text: selectedText,
                position: { top: rect.bottom + 8, left: rect.left },
                selection: selection  // Store for later use
            });
        }
    }
}, [editor]);
```

### Step 3: Add State for Popup
**File:** `NotePanel.jsx` - in SlatePanel component

```js
const [popupState, setPopupState] = useState({
    show: false,
    text: '',
    position: { top: 0, left: 0 },
    selection: null
});
```

### Step 4: Handle Update Action
**File:** `NotePanel.jsx`

```js
const handleUpdate = (newText) => {
    if (popupState.selection) {
        Transforms.select(editor, popupState.selection);
        Transforms.delete(editor);
        Transforms.insertText(editor, newText);
    }
    setPopupState({ show: false, text: '', position: { top: 0, left: 0 }, selection: null });
};

const handleCancel = () => {
    setPopupState({ show: false, text: '', position: { top: 0, left: 0 }, selection: null });
};
```

### Step 5: Render Popup in SlatePanel
**File:** `NotePanel.jsx`

```jsx
return (
    <>
        <div className="note-toolbar">...</div>
        <Slate ...>
            <Editable ... />
        </Slate>
        {popupState.show && (
            <SelectionPopup
                position={popupState.position}
                onUpdate={handleUpdate}
                onCancel={handleCancel}
            />
        )}
    </>
);
```

### Step 6: CSS Styling (Liquid Glass)
**File:** `WorkspaceLayout.css`

```css
.selection-popup {
    position: fixed;
    display: flex;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    z-index: 1000;
}

.selection-popup input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    padding: 4px 8px;
    color: inherit;
    outline: none;
}

.selection-popup button {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    padding: 4px 12px;
    color: inherit;
    cursor: pointer;
}

.selection-popup button:hover {
    background: rgba(255, 255, 255, 0.25);
}
```

## Files to Modify
1. `src/Modules/WorkSpacePanel/NotePanel.jsx` - Add popup state, component, and handlers
2. `src/Modules/WorkSpacePanel/WorkspaceLayout.css` - Add liquid glass popup styles

## Notes
- Position is `fixed` so it stays in viewport coordinates
- Popup appears 8px below the selection
- Need to handle clicking outside to close (optional enhancement)
