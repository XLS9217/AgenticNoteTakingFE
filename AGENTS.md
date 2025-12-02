# Plan: Handle Smart Update Response

## Current Flow
1. User selects text → popup appears
2. User types instruction → clicks "Update"
3. Frontend sends `workspace_message` with `sub_type: "smart_update"`
4. Backend processes and returns `workspace_message` with `sub_type: "smart_update_result"` containing the new text

## Requirements
1. **Lock selected text** - Make selected section uneditable and visually distinct while waiting for response
2. **Replace on receive** - When `smart_update_result` arrives, replace the locked section with the new text

## Implementation Plan

### Step 1: Add "locked" state for selection
**File:** `NotePanel.jsx`

Add state to track locked selection:
```js
const [lockedSelection, setLockedSelection] = useState(null);
```

### Step 2: Update handlePopupUpdate to lock selection
**File:** `NotePanel.jsx`

After sending `smart_update`, store the selection to lock it:
```js
const handlePopupUpdate = (instruction) => {
    if (popupState.selection && instruction.trim()) {
        // Store selection for locking
        setLockedSelection(popupState.selection);

        // Send smart_update message...
        // (existing code)
    }
    // Close popup but keep lockedSelection
};
```

### Step 3: Update decorate to show locked style
**File:** `NotePanel.jsx`

Modify `decorate` to add `locked: true` decoration for the locked range:
```js
const decorate = useCallback(([node, path]) => {
    const ranges = [];

    // Locked selection - always show (takes priority)
    if (lockedSelection) {
        const intersection = Range.intersection(lockedSelection, Editor.range(editor, path));
        if (intersection) {
            ranges.push({ ...intersection, locked: true });
        }
    }
    // Saved selection highlight (only when not focused and not locked)
    else if (savedSelection && !ReactEditor.isFocused(editor)) {
        const intersection = Range.intersection(savedSelection, Editor.range(editor, path));
        if (intersection) {
            ranges.push({ ...intersection, highlight: true });
        }
    }
    return ranges;
}, [lockedSelection, savedSelection, editor]);
```

### Step 4: Update renderLeaf for locked style
**File:** `NotePanel.jsx`

Add locked styling (e.g., pulsing/loading animation, different background):
```js
if (leaf.locked) {
    children = <span className="locked-text">{children}</span>;
}
```

### Step 5: Make editor read-only for locked range
**File:** `NotePanel.jsx`

Make entire editor read-only while locked:
```jsx
<Editable
    readOnly={!!lockedSelection}
    // ...other props
/>
```

### Step 6: Listen for smart_update_result via WebSocket
**File:** `NotePanel.jsx`

Add useEffect to listen for WebSocket messages:
```js
useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'workspace_message' && data.sub_type === 'smart_update_result') {
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
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
}, [socket, lockedSelection, editor]);
```

### Step 7: Add CSS for locked animation
**File:** `WorkspaceLayout.css`

```css
.locked-text {
    background-color: rgba(100, 149, 237, 0.3);
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}
```

## Files to Modify
1. `src/Modules/WorkSpacePanel/NotePanel.jsx`
   - Add `lockedSelection` state
   - Update `handlePopupUpdate` to set locked state
   - Update `decorate` to handle locked range
   - Update `renderLeaf` for locked style
   - Add WebSocket listener for `smart_update_result`
   - Make editor readOnly while locked

2. `src/Modules/WorkSpacePanel/WorkspaceLayout.css`
   - Add pulse animation for locked text

## Flow Summary
1. User selects text → popup appears
2. User clicks "Update" → selection becomes locked (pulsing blue), editor becomes read-only
3. Backend processes → returns result
4. Frontend receives `smart_update_result` → replaces locked text with new content
5. Editor unlocks, normal editing resumes
