# Plan: Markdown-First NotePanel Refactor

## Problem
Current `findMatchingBlocks` approach fails when `lock_text` from backend doesn't include block type info (e.g., "项目" fails to match because it's parsed as paragraph but exists as heading1 in editor).

## Solution
Keep markdown string as source of truth. Use `<lock>` tags in markdown and split-then-parse approach.

## Constraint: Block-Level Locks Only
- Locks operate on **whole lines/blocks**, not partial inline text
- If user selects partial text within a line, frontend expands selection to full line(s) before sending to backend
- This avoids inline lock complexity while keeping the parser simple

## Architecture

```
┌─────────────────────┐
│  markdownRef (str)  │  ← source of truth (with <lock> tags when locked)
└──────────┬──────────┘
           │ md2slate() with lock-aware parsing
           ▼
┌─────────────────────┐
│    Slate Editor     │  ← view layer
└─────────────────────┘
```

## Core Logic: Split-Then-Parse

```js
// Input:
"hello\n<lock># Title\n- first\n- second</lock>\nother"

// Step 1: Split by lock boundaries
before = "hello"
locked = "# Title\n- first\n- second"
after  = "other"

// Step 2: Parse each separately (existing md2slate logic, untouched)
nodesBefore = md2slate(before)
nodesLocked = md2slate(locked)
nodesAfter  = md2slate(after)

// Step 3: Mark locked nodes
nodesLocked.forEach(n => n.locked = true)

// Step 4: Combine
allNodes = [...nodesBefore, ...nodesLocked, ...nodesAfter]
```

## Implementation Steps

### Step 1: Add markdownRef to SlatePanel
- `const markdownRef = useRef(note || '')`
- Initialize from `note` prop

### Step 2: Create `md2slateWithLock` function in RichTextConvertor
```js
md2slateWithLock(mdText) {
    // Check for <lock> tags
    const lockMatch = mdText.match(/^([\s\S]*?)<lock>([\s\S]*?)<\/lock>([\s\S]*)$/);

    if (!lockMatch) {
        return this.md2slate(mdText);  // no lock, parse normally
    }

    // Trim \n at boundaries to avoid extra empty paragraphs
    const before = lockMatch[1].replace(/\n$/, '');
    const locked = lockMatch[2];
    const after = lockMatch[3].replace(/^\n/, '');

    const nodesBefore = before ? this.md2slate(before) : [];
    const nodesLocked = this.md2slate(locked);
    const nodesAfter = after ? this.md2slate(after) : [];

    // Mark locked nodes
    nodesLocked.forEach(n => n.locked = true);

    return [...nodesBefore, ...nodesLocked, ...nodesAfter];
}
```

### Step 3: Update renderElement to handle locked blocks
```js
const renderElement = ({ attributes, children, element }) => {
    const lockedClass = element.locked ? 'locked-block' : '';
    switch (element.type) {
        case 'heading1':
            return <h1 {...attributes} className={lockedClass}>{children}</h1>;
        // ... etc
    }
};
```

### Step 4: Expand selection to full lines before sending
When user selects text and triggers smart_update:
```js
// Get selected blocks from Slate
const selectedFragment = Editor.fragment(editor, selection);
const markdown = richTextConvertor.slate2md(selectedFragment);

// markdown is already full lines because Slate selection is block-based
// Send to backend
CommendDispatcher.Publish2Channel(ChannelEnum.SOCKET_SEND, {
    type: "workspace_message",
    sub_type: "smart_update",
    message_original: markdown,  // full line(s), not partial
    query: instruction
});
```

### Step 5: Refactor lock mechanism in NotePanel
When `smart_update_lock` received:
```js
const lockText = data.lock_text;
markdownRef.current = markdownRef.current.replace(
    lockText,
    `<lock>${lockText}</lock>`
);
// Trigger re-render with new markdown
```

### Step 6: Refactor update mechanism
When `smart_update` received:
```js
markdownRef.current = markdownRef.current.replace(
    /<lock>[\s\S]*?<\/lock>/,
    data.result
);
// Trigger re-render with new markdown
```

### Step 7: Update save flow
On editor change:
```js
const newMarkdown = slate2md(editor.children);
markdownRef.current = newMarkdown;  // keep in sync
saveToBackend(newMarkdown);
```

### Step 8: Cleanup
- Remove `lockedSelection` state
- Remove `findTextRange` callback
- Remove lock logic from `decorate` function
- Remove `findMatchingBlocks` from RichTextConvertor (or keep for other uses)

## Files to Modify
- `src/Util/RichTextConvertor.js` - add `md2slateWithLock`
- `src/Modules/WorkSpacePanel/NotePanel.jsx` - refactor to use markdownRef + new parsing

## Benefits
- Single source of truth (markdown with `<lock>` tags)
- No complex offset calculations
- Existing parseInline logic untouched
- Multi-line locks work naturally
- Simple string operations for lock/unlock
