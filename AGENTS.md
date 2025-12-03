# My needs
1. focus on the overall layout, keep my three panel structure. Use my aesthetic, but learn from notebookLM
2. What I want most is a header section in E:\Project\_MeetingNoteTaking\AgenticNoteTakingFE\src\Modules\AppHeader.jsx Use in application.
    - in header section, I want a Veuns Logo with Notech title. On most left
    - a user icon on most right
    - this header should always be there after logging in.
3. for workspace selection, thumbnail should turn into icon_note.png in my public folder and I want a three dot on top right
4. while im in note taking, if I click the logo in header, go back to selection page

# new look in ascii graph

in workspace selection:
```
+------------------------------------------------------------------+
| [Venus] Notech                                   [User Icon]     |  <- transparent header, no bar
+------------------------------------------------------------------+
|                                                                  |
|   Workspace for {username}                                       |
|                                                                  |
|   +-------------+  +-------------+  +-------------+              |
|   |   [icon]    |  |   [icon]  ⋮ |  |   [icon]  ⋮ |              |
|   |     +       |  |   note.png  |  |   note.png  |              |
|   |             |  |             |  |             |              |
|   | New Workspace| | Workspace 1 |  | Workspace 2 |              |
|   | Create new   | | Last updated|  | Last updated|              |
|   +-------------+  +-------------+  +-------------+              |
|                                                                  |
+------------------------------------------------------------------+
```

in note taking:
```
+------------------------------------------------------------------+
| [Venus] {NoteName} (clickable to edit)           [User Icon]     |  <- transparent header
+------------------------------------------------------------------+
|                                                                  |
| +----------------+ +----------------------+ +------------------+ |
| |    Source      | |        Note          | |    Assistant     | |
| |                | |                      | |                  | |
| |  (transcript)  | |   (slate editor)     | |   (chat box)     | |
| |                | |                      | |                  | |
| +----------------+ +----------------------+ +------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

# plan

## phase 1: Header

**Files to create/modify:**
- Create: `src/Modules/AppHeader.jsx`
- Create: `src/Modules/AppHeader.css`
- Modify: `src/Modules/Application.jsx`

**Steps:**
1. Create `AppHeader.jsx` component with:
   - Left side: Venus logo (`/icons/icon_venus.png`) clickable -> go back to workspace selection
   - Center/Left: Title text
     - In workspace selection: "Notech"
     - In note taking: `{noteName}` (clickable to edit, from prop)
   - Right side: User icon (`/icons/icon_user.png`) clickable -> toggle user panel
   - Props: `title`, `isEditable`, `onTitleChange`, `onLogoClick`, `onUserClick`

2. Create `AppHeader.css`:
   - Transparent background (NO visible bar)
   - Flexbox layout (space-between)
   - Logo + title on left
   - User icon on right
   - Proper spacing

3. Modify `Application.jsx`:
   - Import and render `AppHeader` after authentication
   - Pass appropriate title ("Notech" or workspace name)
   - Pass `onLogoClick` to go back to workspace selection
   - Pass `onUserClick` to toggle user panel
   - Handle title editing for workspace name change

## phase 2: Workspace Selection

**Files to modify:**
- `src/Modules/UserPanel/WorkspaceSelection.jsx`
- `src/Modules/Modules.css`

**Steps:**
1. Update workspace card thumbnail:
   - Replace text placeholder with `icon_note.png` image
   - Keep "+" for new workspace card

2. Replace delete button with three-dot menu:
   - Move to top-right corner inside the card
   - Use vertical three-dot icon (⋮)
   - On click, show dropdown with "Delete" option
   - Style dropdown with liquid glass aesthetic

3. Clean up workspace card layout:
   - Remove redundant name from thumbnail area
   - Keep name and meta in info section only

## phase 3: Panel Headers

**Files to modify:**
- `src/Modules/WorkSpacePanel/SourcePanel.jsx`
- `src/Modules/WorkSpacePanel/NotePanel.jsx`
- `src/Modules/WorkSpacePanel/ChatBox.jsx`

**Steps:**
1. Update SourcePanel header: just "Source" title
2. Update NotePanel header: just "Note" title (remove workspace name, moved to AppHeader)
3. Update ChatBox header: just "Assistant" title
