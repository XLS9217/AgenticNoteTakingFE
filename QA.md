# Note Panel Input Overflow Issue

## Problem
The Slate editor in the Note panel overflows beyond the visible container area, causing the input area to extend past the bottom of the panel.

## Why It Happens
The layout structure is:
```
.note-panel-container (height: 100%, padding: var(--spacing-sm))
  └── .note-header (margin-bottom: var(--spacing-sm))
  └── .note-content (flex: 1, min-height: 0)
      └── .note-scroll (flex: 1, overflow-y: auto)
          └── .slate-editor (height: 100%, padding: var(--spacing-sm))
```

The issue is that `.note-scroll` is missing `min-height: 0` which is critical for proper flexbox overflow handling in nested flex containers.

## Fix
Add `min-height: 0` to `.note-scroll` in `WorkspaceLayout.css`:

```css
.note-scroll {
  flex: 1;
  min-height: 0;  /* ADD THIS LINE */
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
}
```

This ensures the scroll container properly constrains its height within the flex layout and enables scrolling when content overflows.