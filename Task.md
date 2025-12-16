# Task: Redesign Source Panel (NotebookLM style)

## My Understanding (ASCII)

```
=== STATE 1: Sources List ===
+--------------------------------------------------+
|  Sources                              [+ Add]    |
+--------------------------------------------------+
|  :  Transcript65942d36...                        |  <-- click row to expand
|  :  Transcript2e9217ca...                        |
|  :  TranscriptABC123...                          |
+--------------------------------------------------+
   ^
   three-dot menu (click = dropdown with Delete)
   hover title = tooltip with full ID


=== STATE 2: Source Expanded (takes over whole panel) ===
+--------------------------------------------------+
|  Transcript65942d36...                [< Collapse]|
+--------------------------------------------------+
|                                                  |
|  (source content here - transcript/metadata)     |
|                                                  |
+--------------------------------------------------+

Header transforms:
  "Sources"  -->  "Transcript{id}..."
  "+ Add"    -->  "< Collapse"
```

## Files

```
SourcePanel/
  ├── SourcePanel.jsx      <-- main panel with state switching
  └── TranscriptPanel.jsx  <-- content when source is expanded
```

## Plan

### 1. SourcePanel.jsx - Add view state switching

```jsx
export default function SourcePanel({ workspaceId }) {
    const [selectedSource, setSelectedSource] = useState(null);  // null = list view

    // When source is selected, show TranscriptPanel
    if (selectedSource) {
        return (
            <LiquidGlassDiv>
                <div className="source-header">
                    <h2 className="source-title" title={`Transcript${selectedSource.source_id}`}>
                        Transcript{selectedSource.source_id.slice(0,8)}...
                    </h2>
                    <LiquidGlassInnerTextButton onClick={() => setSelectedSource(null)}>
                        &lt; Collapse
                    </LiquidGlassInnerTextButton>
                </div>
                <TranscriptPanel source={selectedSource} workspaceId={workspaceId} />
            </LiquidGlassDiv>
        );
    }

    // Otherwise show sources list
    return (/* sources list with three-dot menu items */);
}
```

### 2. Source list item (NotebookLM style)

```jsx
<div className="source-item" onClick={() => setSelectedSource(source)}>
    <button className="source-item-menu" onClick={e => { e.stopPropagation(); toggleMenu(); }}>
        ⋮
    </button>
    <span className="source-item-title" title={`Transcript${sourceId}`}>
        Transcript{sourceId.slice(0,8)}...
    </span>
    {menuOpen && (
        <div className="source-item-dropdown">
            <button onClick={handleDelete}>Delete</button>
        </div>
    )}
</div>
```

### 3. TranscriptPanel.jsx - Source content

Move `RawContentUpload`, `ProcessedTranscriptSection`, `MetadataSection` here.

### 4. CSS additions

```css
.source-item { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.source-item-menu { /* three-dot button */ }
.source-item-title { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.source-item-dropdown { /* absolute positioned menu */ }
```

## Files to modify
1. `SourcePanel/SourcePanel.jsx` - State switching + NotebookLM list items
2. `SourcePanel/TranscriptPanel.jsx` - Expanded source content
3. `Modules.css` - New styles