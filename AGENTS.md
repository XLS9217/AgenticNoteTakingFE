# Smart Approach: Structure-Aware Text Matching

## The Problem
Backend sends markdown `lock_text`, but Slate stores structured nodes. Simple text search fails because `#` markers don't exist in editor.

## Better Solution: Match Structure + Content

Instead of stripping markdown, **parse it and match node types**.

### Algorithm

1. Parse `lock_text` markdown into expected structure:
   ```
   "# Hello\nWorld" → [
     { type: 'heading1', text: 'Hello' },
     { type: 'paragraph', text: 'World' }
   ]
   ```

2. Find matching sequence in Slate editor by **type + text**:
   ```javascript
   editor.children = [
     { type: 'paragraph', children: [{ text: 'Intro' }] },      // skip
     { type: 'heading1', children: [{ text: 'Hello' }] },       // ✓ match start
     { type: 'paragraph', children: [{ text: 'World' }] },      // ✓ match end
     { type: 'paragraph', children: [{ text: 'Footer' }] }      // skip
   ]
   ```

3. Return range from first matched block to last matched block

### Implementation

```javascript
const findTextRangeStructured = (searchMarkdown) => {
    // Step 1: Parse markdown to expected structure
    const expectedBlocks = parseMarkdownToBlocks(searchMarkdown);
    // Result: [{ type: 'heading1', text: 'Hello' }, { type: 'paragraph', text: 'World' }]

    // Step 2: Find matching sequence in editor
    const editorBlocks = editor.children.map((node, idx) => ({
        idx,
        type: node.type,
        text: node.children?.map(c => c.text || '').join('') || ''
    })).filter(b => b.text.trim() !== '');

    // Step 3: Search for matching subsequence
    for (let startIdx = 0; startIdx <= editorBlocks.length - expectedBlocks.length; startIdx++) {
        let match = true;
        for (let j = 0; j < expectedBlocks.length; j++) {
            const expected = expectedBlocks[j];
            const actual = editorBlocks[startIdx + j];

            // Match both type AND text
            if (expected.type !== actual.type || expected.text !== actual.text) {
                match = false;
                break;
            }
        }

        if (match) {
            // Found! Return range covering all matched blocks
            const firstBlock = editorBlocks[startIdx];
            const lastBlock = editorBlocks[startIdx + expectedBlocks.length - 1];

            return {
                anchor: { path: [firstBlock.idx, 0], offset: 0 },
                focus: { path: [lastBlock.idx, 0], offset: lastBlock.text.length }
            };
        }
    }

    return null;
};

// Helper: Parse markdown line to block structure
const parseMarkdownToBlocks = (md) => {
    return md.trim().split('\n').filter(line => line.trim()).map(line => {
        if (line.startsWith('## ')) {
            return { type: 'heading2', text: stripInlineMarkdown(line.slice(3)) };
        }
        if (line.startsWith('# ')) {
            return { type: 'heading1', text: stripInlineMarkdown(line.slice(2)) };
        }
        return { type: 'paragraph', text: stripInlineMarkdown(line) };
    });
};

// Helper: Remove inline markdown (**bold**, *italic*, _underline_)
const stripInlineMarkdown = (text) => {
    return text
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/_(.+?)_/g, '$1');
};
```

### Benefits

1. **More accurate** - `# Hello` only matches heading1, not paragraph
2. **Handles multi-block selections** - Matches sequence of blocks
3. **Type-safe** - Won't accidentally match wrong node types
4. **Preserves structure** - Knows exactly which blocks to lock/replace

### Edge Cases to Handle

- Empty lines between blocks (filter them out)
- Inline formatting within blocks (strip for comparison)
- Partial block matches (not supported - match full blocks only)
