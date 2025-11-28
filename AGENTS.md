# Text Selection Feature Plan

## Goal
When user selects text in the Slate editor:
1. Show a subtle preview above the editor (few words from selection)
2. Console log the selected text as JSON

## Implementation Plan

### 1. Capture Text Selection in SlatePanel
- Add `onSelect` handler to Slate `<Editable>` component
- Extract selected text from editor using Slate's Editor API
- Get the JSON fragment of the selected nodes

### 2. Publish Selection via CommendDispatcher
- Use existing `TEXT_SELECT` channel (already defined in CommendDispatcher.js:64)
- Publish payload with:
  - `text`: plain text preview (first few words)
  - `json`: full JSON structure of selection
- Console.log the JSON in the publish handler

### 3. Subscribe to Selection in NotePanel
- Add subscription to `TEXT_SELECT` channel in parent NotePanel component
- Store selected text preview in state
- Display above the editor area

### 4. UI for Selection Preview
- Add subtle text element above slate editor (inside `.note-content`)
- Style: small, low opacity, liquid glass aesthetic
- Show only when there's a selection
- Clear when selection is removed
- Make it clickable - onClick console.log the full JSON selection

### 5. CSS Updates in WorkspaceLayout.css
- Add `.selection-preview` class
- Subtle styling: small font, low opacity (0.5-0.6)
- Position above editor with minimal spacing
