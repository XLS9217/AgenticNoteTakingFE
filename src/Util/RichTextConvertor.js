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
                if (leaf.underline) t = `_${t}_`; // custom underline syntax
                return t;
            }).join('');
        };

        const nodeToMd = (node) => {
            if (!node || !node.type) return '';
            if (node.type === 'paragraph') return childrenToMd(node.children);
            if (node.type === 'heading1') return '# ' + childrenToMd(node.children);
            if (node.type === 'heading2') return '## ' + childrenToMd(node.children);
            return childrenToMd(node.children);
        };

        return nodes.map(node => nodeToMd(node)).join('\n\n');
    }

    // -----------------------------
    // Markdown → Slate JSON
    // -----------------------------
    md2slate(mdText) {
        if (!mdText) return [];

        const lines = mdText.split('\n');
        const nodes = [];

        for (let line of lines) {
            line = line.trim();
            if (!line) {
                nodes.push({ type: 'paragraph', children: [{ text: '' }] });
                continue;
            }

            // heading1
            if (line.startsWith('# ')) {
                nodes.push({ type: 'heading1', children: [{ text: line.slice(2) }] });
                continue;
            }

            // heading2
            if (line.startsWith('## ')) {
                nodes.push({ type: 'heading2', children: [{ text: line.slice(3) }] });
                continue;
            }

            // Inline formatting (bold, italic, underline)
            let children = [];
            let regex = /(\*\*([^\*]+)\*\*|\*([^\*]+)\*|_([^_]+)_|[^*_]+)/g;
            let match;
            while ((match = regex.exec(line)) !== null) {
                if (match[2]) children.push({ text: match[2], bold: true });
                else if (match[3]) children.push({ text: match[3], italic: true });
                else if (match[4]) children.push({ text: match[4], underline: true });
                else if (match[0].trim()) children.push({ text: match[0] });
            }

            nodes.push({ type: 'paragraph', children });
        }

        return nodes;
    }

}

// Export singleton instance
export default new RichTextConvertor();
