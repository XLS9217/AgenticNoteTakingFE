# Agent Task Plan: Markdown Integration for NotePanel

## Objective
Update NotePanel.jsx to save notes as markdown to the backend and print markdown for selected logs using the RichTextConvertor singleton.

## Current State Analysis
- RichTextConvertor.js provides `slate2md()` and `md2slate()` methods
- RichTextConvertor now exports a singleton instance (default export)
- NotePanel.jsx currently saves Slate JSON format via `updateNote()`
- Need to convert Slate JSON to markdown before saving
- Need to print markdown as plain text (not preview) when logs are selected

## Implementation Plan

### Task 1: Update RichTextConvertor to Singleton
✓ COMPLETED
- Changed export from class to singleton instance
- Now exports: `export default new RichTextConvertor()`

### Task 2: Add Markdown Save Functionality
- Import RichTextConvertor singleton into NotePanel.jsx
- Modify `saveNote()` in SlatePanel to:
  - Convert `editor.children` to markdown using `slate2md()`
  - Save markdown to backend via existing `updateNote()` gateway call
  - Keep backward compatibility with JSON format for loading

### Task 3: Add Print Markdown for Selected Log
- When text is selected in Slate editor, convert the selected JSON fragment to markdown
- Console.log the markdown as plain text (not preview)
- Use existing `handleSelect()` callback to capture selection

### Task 4: Gateway Update (if needed)
- Check if `updateNote()` needs modification for markdown
- Add new gateway function if backend has separate endpoint for markdown
- Follow instruction #4: any new API call should be added to gateway.js

## Files Modified
1. ✓ `E:\Project\_MeetingNoteTaking\AgenticNoteTakingFE\src\Util\RichTextConvertor.js` - Converted to singleton

## Files to Modify
1. `E:\Project\_MeetingNoteTaking\AgenticNoteTakingFE\src\Modules\WorkSpacePanel\NotePanel.jsx`
2. `E:\Project\_MeetingNoteTaking\AgenticNoteTakingFE\src\Api\gateway.js` (if needed)

## Notes
- Follow CLAUDE.md instruction #1: do not run npm commands, only edit code
- Follow CLAUDE.md instruction #2: do minimum work, don't overcomplicate
- Follow CLAUDE.md instruction #6: one task at a time
- Display markdown as plain text in console, not as preview UI