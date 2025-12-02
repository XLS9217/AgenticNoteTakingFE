# Bug Fix: Note Panel Layout Issues

## Issue 1: Note Title Height Mismatch

### Cause
The note panel has different header structure than Source and Assistant panels:
- **Source/Assistant:** Uses consistent header padding via `.source-header` and `.chat-header` with `padding: var(--spacing-xs)` and `flex-shrink: 0`
- **Note Panel:** Uses `.note-header` with only `margin-bottom: var(--spacing-xs)` - no padding, no consistent height

Also, `.note-panel-container` has `padding: var(--spacing-sm)` while others use `padding: 0px`.

### Fix
**File:** `WorkspaceLayout.css`

1. Change `.note-panel-container` padding to `0px` to match others
2. Update `.note-header` to match `.source-header` / `.chat-header`:
```css
.note-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: var(--spacing-xs);
}
```

---

## Issue 2: Slate Editor Bottom Cut Off

### Cause
The `.slate-editor` has `height: 100%` but:
1. It sits inside `.note-content` which is `flex: 1` with `min-height: 0`
2. The padding from `.note-panel-container` and `.slate-editor` itself adds to the total height
3. The flex container doesn't account for the toolbar height properly
4. `box-sizing: border-box` is set but the parent chain doesn't properly constrain

The real issue: `.slate-editor` needs to be a flex child that grows to fill remaining space, not `height: 100%` which calculates based on parent before siblings are accounted for.

### Fix
**File:** `WorkspaceLayout.css`

1. Make `.slate-editor` a flex child instead of using `height: 100%`:
```css
.slate-editor {
  flex: 1;
  min-height: 0;  /* Critical for flex overflow */
  /* Remove height: 100% */
}
```

2. Ensure `.note-content` is a proper flex container:
```css
.note-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;  /* Already set, good */
}
```

---

## Files to Modify
1. `src/Modules/WorkSpacePanel/WorkspaceLayout.css`
   - `.note-panel-container` - change padding
   - `.note-header` - add flex-shrink, padding, align-items
   - `.slate-editor` - use `flex: 1` instead of `height: 100%`
