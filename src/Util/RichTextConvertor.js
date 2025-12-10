class RichTextConvertor {
    constructor() {}

    // -----------------------------
    // Slate JSON → Markdown
    // -----------------------------
    slate2md(nodes) {
        if (!Array.isArray(nodes)) return '';

        const childrenToMd = (children) => {
            return children.map(leaf => {
                let t = leaf.text || '';
                if (leaf.bold) t = `**${t}**`;
                if (leaf.italic) t = `*${t}*`;
                if (leaf.underline) t = `_${t}_`;
                return t;
            }).join('');
        };

        const nodeToMd = (node) => {
            if (!node || !node.type) return '';
            if (node.type === 'heading1') return '# ' + childrenToMd(node.children);
            if (node.type === 'heading2') return '## ' + childrenToMd(node.children);
            return childrenToMd(node.children);
        };

        return nodes.map(node => nodeToMd(node)).join('\n');
    }

    // -----------------------------
    // Slate JSON → Plain Text (for comparison)
    // -----------------------------
    slate2plain(nodes) {
        if (!Array.isArray(nodes)) return '';
        return nodes.map(node => {
            if (!node.children) return '';
            return node.children.map(c => c.text || '').join('');
        }).join('\n');
    }

    // -----------------------------
    // Get block type from Slate node
    // -----------------------------
    getBlockType(node) {
        return node?.type || 'paragraph';
    }

    // -----------------------------
    // Get plain text from Slate node
    // -----------------------------
    getBlockText(node) {
        if (!node?.children) return '';
        return node.children.map(c => c.text || '').join('');
    }

    // -----------------------------
    // Markdown → Slate JSON
    // -----------------------------
    md2slate(mdText) {
        if (!mdText) return [];

        const lines = mdText.split('\n');
        const nodes = [];

        // Parse inline formatting with nested style support
        const parseInline = (text) => {
            const children = [];
            let i = 0;

            while (i < text.length) {
                // Check for bold **...**
                if (text.slice(i, i + 2) === '**') {
                    const endIdx = text.indexOf('**', i + 2);
                    if (endIdx !== -1) {
                        const innerText = text.slice(i + 2, endIdx);
                        const innerChildren = parseInline(innerText);
                        // Add bold to all inner children
                        innerChildren.forEach(child => {
                            children.push({ ...child, bold: true });
                        });
                        i = endIdx + 2;
                        continue;
                    }
                }

                // Check for italic *...*  (but not **)
                if (text[i] === '*' && text[i + 1] !== '*') {
                    const endIdx = text.indexOf('*', i + 1);
                    if (endIdx !== -1 && text[endIdx - 1] !== '*') {
                        const innerText = text.slice(i + 1, endIdx);
                        const innerChildren = parseInline(innerText);
                        innerChildren.forEach(child => {
                            children.push({ ...child, italic: true });
                        });
                        i = endIdx + 1;
                        continue;
                    }
                }

                // Check for underline _..._
                if (text[i] === '_') {
                    const endIdx = text.indexOf('_', i + 1);
                    if (endIdx !== -1) {
                        const innerText = text.slice(i + 1, endIdx);
                        const innerChildren = parseInline(innerText);
                        innerChildren.forEach(child => {
                            children.push({ ...child, underline: true });
                        });
                        i = endIdx + 1;
                        continue;
                    }
                }

                // Plain text - collect until next marker
                let endPlain = i;
                while (endPlain < text.length) {
                    const rest = text.slice(endPlain);
                    if (rest.startsWith('**') || rest.startsWith('*') || rest.startsWith('_')) {
                        break;
                    }
                    endPlain++;
                }
                if (endPlain > i) {
                    children.push({ text: text.slice(i, endPlain) });
                    i = endPlain;
                } else {
                    // Safety: move forward if stuck
                    children.push({ text: text[i] });
                    i++;
                }
            }

            return children.length > 0 ? children : [{ text: '' }];
        };

        for (let line of lines) {
            // Empty line = empty paragraph
            if (line.trim() === '') {
                nodes.push({ type: 'paragraph', children: [{ text: '' }] });
                continue;
            }

            // heading1
            if (line.startsWith('# ')) {
                const content = line.slice(2);
                nodes.push({ type: 'heading1', children: parseInline(content) });
                continue;
            }

            // heading2
            if (line.startsWith('## ')) {
                const content = line.slice(3);
                nodes.push({ type: 'heading2', children: parseInline(content) });
                continue;
            }

            // Regular paragraph with inline formatting
            nodes.push({ type: 'paragraph', children: parseInline(line) });
        }

        return nodes;
    }

    // -----------------------------
    // Strip inline markdown formatting
    // -----------------------------
    stripInlineMarkdown(text) {
        return text
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/\*(.+?)\*/g, '$1')
            .replace(/_(.+?)_/g, '$1');
    }

    // -----------------------------
    // Parse markdown to block structure [{type, text}, ...]
    // -----------------------------
    md2blocks(mdText) {
        if (!mdText) return [];
        return mdText.trim().split('\n').filter(line => line.trim()).map(line => {
            if (line.startsWith('## ')) {
                return { type: 'heading2', text: this.stripInlineMarkdown(line.slice(3)) };
            }
            if (line.startsWith('# ')) {
                return { type: 'heading1', text: this.stripInlineMarkdown(line.slice(2)) };
            }
            return { type: 'paragraph', text: this.stripInlineMarkdown(line) };
        });
    }

    // -----------------------------
    // Find matching blocks in Slate editor
    // Returns { startIdx, endIdx } of matched block indices, or null
    // -----------------------------
    findMatchingBlocks(searchMarkdown, slateNodes) {
        if (!searchMarkdown || !Array.isArray(slateNodes)) return null;

        // Step 1: Parse markdown to expected block structure
        const expectedBlocks = this.md2blocks(searchMarkdown);
        if (expectedBlocks.length === 0) return null;

        // Step 2: Get editor blocks (skip empty ones, but track original index)
        const editorBlocks = slateNodes
            .map((node, idx) => ({
                idx,
                type: this.getBlockType(node),
                text: this.getBlockText(node)
            }))
            .filter(b => b.text.trim() !== '');

        // Step 3: Find matching consecutive sequence
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
                // Found matching sequence
                const firstBlock = editorBlocks[startIdx];
                const lastBlock = editorBlocks[startIdx + expectedBlocks.length - 1];
                return {
                    startIdx: firstBlock.idx,
                    endIdx: lastBlock.idx,
                    matchedBlocks: editorBlocks.slice(startIdx, startIdx + expectedBlocks.length)
                };
            }
        }

        return null;
    }

}

// Export singleton instance
export default new RichTextConvertor();
