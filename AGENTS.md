# Bug Fix: H1/H2 Not Preserved

## Problem
H1 and H2 headings are not being saved/restored correctly.

## Cause
**Headings are stored as leaf marks, not node types!**

Looking at the Slate children output:
```js
{
  "type": "paragraph",  // <-- Still "paragraph", NOT "heading1" or "heading2"
  "children": [
    {
      "text": "ar",
      "heading2": true   // <-- heading2 is a MARK on the text leaf!
    }
  ]
}
```

The current implementation treats H1/H2 like bold/italic - as **text marks** applied to leaves. But the converter expects them to be **node types**:

**slate2md expects:**
```js
{ type: 'heading1', children: [...] }  // Node type
{ type: 'heading2', children: [...] }  // Node type
```

**But the editor creates:**
```js
{ type: 'paragraph', children: [{ text: 'xxx', heading1: true }] }  // Mark on leaf
```

## Why This Happens

In `NotePanel.jsx`, the `toggleMark` function is used for H1/H2:
```js
<button onMouseDown={() => toggleMark('heading1')}>H1</button>
<button onMouseDown={() => toggleMark('heading2')}>H2</button>
```

`toggleMark` uses `Editor.addMark()` which adds marks to text leaves, not changes the node type.

## Fix Options

### Option 1: Change toggleMark to use Transforms.setNodes for headings
Create separate functions for toggling block types vs inline marks:
```js
const toggleBlock = (format) => {
    const isActive = isBlockActive(editor, format);
    Transforms.setNodes(
        editor,
        { type: isActive ? 'paragraph' : format },
        { match: n => Editor.isBlock(editor, n) }
    );
};
```

### Option 2: Update converter to handle heading marks on leaves
Modify `slate2md` to check for heading marks on children:
```js
const nodeToMd = (node) => {
    const content = childrenToMd(node.children);
    // Check if any child has heading mark
    const hasH1 = node.children.some(c => c.heading1);
    const hasH2 = node.children.some(c => c.heading2);
    if (hasH1) return '# ' + content;
    if (hasH2) return '## ' + content;
    if (node.type === 'heading1') return '# ' + content;
    if (node.type === 'heading2') return '## ' + content;
    return content;
};
```

## Recommended Fix

**Option 1** is the correct approach - headings should be block-level node types, not inline marks. This is how Slate is designed to work. But it requires refactoring the toggle logic.

**Option 2** is a quick fix that works with the current mark-based implementation.

## Files to Modify

**Option 1:**
- `NotePanel.jsx` - Add `toggleBlock` function, update H1/H2 buttons

**Option 2:**
- `RichTextConvertor.js` - Update `slate2md` to check for heading marks on leaves
