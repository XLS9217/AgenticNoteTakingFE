# Backend Markdown Insertion Plan

## Goal
Backend sends markdown content to FE, FE determines where to insert it in the Slate editor.

## Challenge
Slate uses a tree structure with paths (e.g., `[0, 1, 2]`) and offsets. We need a way for the backend to specify "where" without knowing Slate's internal structure.

## Possible Approaches

### Approach 1: Anchor Text Matching
Backend sends:
```json
{
  "sub_type": "insert_content",
  "anchor_text": "some existing text to find",
  "position": "after",  // "before", "after", "replace"
  "content": "# New markdown content\n\nWith paragraphs..."
}
```

**FE Logic:**
1. Search for `anchor_text` in editor using `Editor.string()` or iterate nodes
2. Find the Slate path of that text
3. Insert new nodes before/after that path

**Pros:** Simple, works without knowing Slate structure
**Cons:** Anchor text must be unique, might not find if text was edited

---

### Approach 2: Section/Block ID System
Add IDs to each block in Slate:
```javascript
// Slate node with ID
{ type: 'paragraph', id: 'block_123', children: [{ text: '...' }] }
```

Backend sends:
```json
{
  "sub_type": "insert_content",
  "target_block_id": "block_123",
  "position": "after",
  "content": "# New content..."
}
```

**FE Logic:**
1. Find node by ID using `Editor.nodes()` with matcher
2. Get its path
3. Insert at calculated position

**Pros:** Reliable, survives text edits
**Cons:** Need to generate/sync IDs, more complex

---

### Approach 3: Cursor Position
Use current cursor position as insertion point.

Backend sends:
```json
{
  "sub_type": "insert_at_cursor",
  "content": "# New content..."
}
```

**FE Logic:**
1. Get current `editor.selection`
2. Insert nodes at selection point
3. Or append at end if no selection

**Pros:** Simplest, natural UX
**Cons:** User must position cursor first

---

### Approach 4: Line Number Based
Backend specifies line number.

Backend sends:
```json
{
  "sub_type": "insert_content",
  "after_line": 5,
  "content": "# New content..."
}
```

**FE Logic:**
1. Count block-level nodes to find line 5
2. Insert after that node

**Pros:** Simple concept
**Cons:** Line numbers change as content changes

---

## Recommended Approach: Hybrid (Anchor + Cursor Fallback)

Combine Approach 1 and 3:

```json
{
  "sub_type": "insert_content",
  "anchor_text": "optional text to find",  // nullable
  "position": "after",  // "before", "after", "append", "prepend"
  "content": "# Markdown to insert..."
}
```

**Logic:**
1. If `anchor_text` provided → find it, insert relative to it
2. If not found or not provided → use current cursor position
3. If no cursor → append to end

**Implementation in NotePanel.jsx:**
```javascript
const handleInsertContent = (data) => {
  const { anchor_text, position, content } = data;
  const newNodes = richTextConvertor.md2slate(content);

  let targetPath = null;

  // Try to find anchor text
  if (anchor_text) {
    const range = findTextRange(anchor_text);
    if (range) {
      targetPath = range.anchor.path.slice(0, 1); // Get block path
    }
  }

  // Fallback to cursor
  if (!targetPath && editor.selection) {
    targetPath = editor.selection.anchor.path.slice(0, 1);
  }

  // Fallback to end
  if (!targetPath) {
    targetPath = [editor.children.length - 1];
  }

  // Calculate insert position
  const insertPath = position === 'before'
    ? targetPath
    : [targetPath[0] + 1];

  Transforms.insertNodes(editor, newNodes, { at: insertPath });
};
```

## New Channel Needed
Add to CommendDispatcher:
```javascript
INSERT_CONTENT: 'INSERT_CONTENT'
```

## Backend Message Format
```python
class NotetakingInsertContent(SubWorkspaceMessageBase):
    sub_type: Literal["insert_content"]
    anchor_text: str | None = None
    position: Literal["before", "after", "append", "prepend"] = "after"
    content: str  # markdown
```

## Questions to Consider
1. Should we support replacing a range of text (not just single anchor)?
2. Do we need undo/redo support for these insertions?
3. Should the insertion trigger auto-save?
