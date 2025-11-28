# Introduction of slate

## How Slate.js Saves and Loads Data

Slate.js uses **plain JSON** for its data structure, making serialization and deserialization straightforward.

### Basic Approach

**Saving (Serialization):**
- Use `JSON.stringify(value)` to convert the editor value to JSON string
- Store it in localStorage, database, or any storage solution

**Loading (Deserialization):**
- Use `JSON.parse()` to retrieve and parse the saved JSON
- Pass it as `initialValue` to the Slate component

### Example Implementation

```javascript
const initialValue = useMemo(
  () => JSON.parse(localStorage.getItem('content')) || [
    { type: 'paragraph', children: [{ text: 'A line of text in a paragraph.' }] }
  ],
  []
)

return (
  <Slate
    editor={editor}
    initialValue={initialValue}
    onChange={value => {
      const isAstChange = editor.operations.some(
        op => 'set_selection' !== op.type
      )
      if (isAstChange) {
        const content = JSON.stringify(value)
        localStorage.setItem('content', content)
      }
    }}
  >
    <Editable />
  </Slate>
)
```

### Key Points

- **JSON Format**: Slate's native format is JSON, no special serialization library needed
- **onChange Optimization**: Check if operations are actual content changes (not just selection changes) before saving
- **Other Formats**: You can serialize to HTML, Markdown, or plain text if needed, but JSON is recommended for preserving full document structure

### Sources
- [Serializing | Slate](https://docs.slatejs.org/concepts/10-serializing)
- [Saving to a Database | Slate](https://docs.slatejs.org/walkthroughs/06-saving-to-a-database)