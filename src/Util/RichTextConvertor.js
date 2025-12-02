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

}

// Export singleton instance
export default new RichTextConvertor();
