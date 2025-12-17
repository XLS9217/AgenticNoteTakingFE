# Task: Loading Indicators for Workspace

## Goal
Show loading indicators while workspace data loads:
- **Sources**: "Loading..." where "No sources yet" appears
- **Notes**: Moving bar animation (like saving) on the divider
- **ChatBox**: "Loading..." centered in chat history area

---

## 1. SourcePanel.jsx
Add `isLoading` state, show loading text in source list area.

```jsx
const [isLoading, setIsLoading] = useState(true);

// In fetchSources:
setIsLoading(false); // after setSources()

// In JSX (source-slide--list):
{isLoading ? (
    <p className="source-loading">Loading...</p>
) : sources.length > 0 ? (
    // source list
) : (
    <p className="source-empty-state">No sources yet...</p>
)}
```

---

## 2. WorkSpacePanel.jsx + NotePanel
Pass `isLoading` prop to show bar animation on note-divider.

**WorkSpacePanel.jsx:**
```jsx
const [isLoading, setIsLoading] = useState(true);
// set false after loadWorkspace completes

// Pass to NoteTakingContent
<NoteTakingContent ... isLoading={isLoading} />
```

**NotePanel.jsx:**
Add `loading` class to note-divider when `isLoading` is true.
```jsx
<div className={`note-divider ${isLoading ? 'loading' : ''}`}></div>
```

**WorkspaceLayout.css:**
```css
.note-divider.loading::after {
  animation: wave 1.5s ease-in-out infinite;
}
```

---

## 3. ChatBox.jsx
Add `isLoadingHistory` prop, show centered loading when true.

**WorkSpacePanel.jsx:**
```jsx
<ChatBox ... isLoadingHistory={isLoading} />
```

**ChatBox.jsx:**
```jsx
// In chat-history area:
{isLoadingHistory ? (
    <div className="chat-loading">Loading...</div>
) : (
    // messages.map(...)
)}
```

---

## 4. CSS (Modules.css)
```css
.source-loading {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9em;
  text-align: center;
  padding: var(--spacing-md);
}

.chat-loading {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1em;
  text-align: center;
  padding: 40px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## Files to Modify
- `src/Modules/WorkSpacePanel/SourcePanel/SourcePanel.jsx`
- `src/Modules/WorkSpacePanel/WorkSpacePanel.jsx`
- `src/Modules/WorkSpacePanel/NotePanel.jsx`
- `src/Modules/WorkSpacePanel/ChatBox.jsx`
- `src/Modules/WorkSpacePanel/WorkspaceLayout.css`
- `src/Modules/Modules.css`
