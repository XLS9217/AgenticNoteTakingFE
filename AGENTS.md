# Needs

I want to refactor the layout for the note taking workspace panel.
![img.png](img.png)
Currently it looks like this.
What I want is to change,
In a morden IDE, there is a util panel at left and a chatbot panel at right. In the middle is the code panel
I'd like to use this layout in my workspace with the same art style
here is a simple page I made in Figma.
![img_1.png](img_1.png)
of course, learn the big layout not the little details, we are making something different
Use noraml liquid div not  the flexable one for this refactor

For edit, you edit the file in
E:\Project\_MeetingNoteTaking\AgenticNoteTakingFE\src\Modules\WorkSpacePanel
don't touch Legacy folder, you should get learn from legacy folder

# Plan

NEVER USE OR MODIFY THE LEGACY FOLDER

## Phase 1 Big Layout

### Current Architecture Analysis

**Current Structure:**
- WorkSpacePanel.jsx → renders NoteTakingContent
- NoteTakingContent.jsx → renders 3 panels side-by-side:
  - TranscriptPanel (left)
  - NotePanel (middle)
  - ChatPanel (right)
- Uses `.workspace-container` with flexbox row layout
- All panels have equal flex weight except ChatPanel (fixed ~300px width)

**Target Layout (from Figma reference):**
```
┌─────────────────────────────────────────────────────────┐
│                     Top Bar Area                         │
├──────────┬───────────────────────────────┬───────────────┤
│          │                               │               │
│   Left   │                               │     Right     │
│   Util   │        Center Content         │     Chat      │
│   Panel  │       (Main Work Area)        │     Panel     │
│  (~300px)│                               │   (~320px)    │
│          │                               │               │
└──────────┴───────────────────────────────┴───────────────┘
```

**IDE-Style 3-Column Layout:**
- **Left Panel**: Source/Transcript utilities (like project explorer)
- **Center Panel**: Main editing area (Note editing)
- **Right Panel**: AI Assistant/Chat (like copilot panel)

### Step-by-Step Implementation Plan

#### Step 1: Create New Layout Components
**Files to create in `src/Modules/WorkSpacePanel/`:**
1. `LeftUtilPanel.jsx` - Contains TranscriptPanel
2. `CenterContentPanel.jsx` - Contains NotePanel
3. `RightChatPanel.jsx` - Contains ChatPanel
4. `WorkspaceLayout.css` - New layout-specific styles

**Why:** Separate components for better organization and maintainability

#### Step 2: Refactor NoteTakingContent.jsx
**Current:**
```jsx
<div className="workspace-container">
  <TranscriptPanel />
  <NotePanel />
  <ChatPanel />
</div>
```

**New IDE-style layout:**
```jsx
<div className="ide-layout">
  <div className="ide-left-panel">
    <LeftUtilPanel>
      <TranscriptPanel />
    </LeftUtilPanel>
  </div>
  <div className="ide-center-panel">
    <CenterContentPanel>
      <NotePanel />
    </CenterContentPanel>
  </div>
  <div className="ide-right-panel">
    <RightChatPanel>
      <ChatPanel />
    </RightChatPanel>
  </div>
</div>
```

#### Step 3: Create New CSS Layout Classes
**In WorkspaceLayout.css:**
```css
.ide-layout {
  display: flex;
  height: 100%;
  width: 100%;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
}

.ide-left-panel {
  width: 300px;
  flex-shrink: 0;
}

.ide-center-panel {
  flex: 1;
  min-width: 0;
}

.ide-right-panel {
  width: 320px;
  flex-shrink: 0;
}
```

**Why normal LiquidGlassDiv:** Each panel will be wrapped in standard LiquidGlassDiv for consistent glass aesthetic

#### Step 4: Update Panel Components
- Wrap each section in `<LiquidGlassDiv>`
- Ensure proper padding and spacing
- Maintain existing functionality (no logic changes)

#### Step 5: Update Modules.css
- Keep existing styles for chat, transcript, note panels
- Remove old `.workspace-container` flex rules (or mark as legacy)
- Ensure compatibility with new layout classes

### ASCII Visual Preview

**New Layout Structure:**
```
┌────────────────────────────────────────────────────────────────┐
│  WorkSpacePanel.jsx                                            │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ NoteTakingContent.jsx                                    │ │
│  │ ┌─────────────────────────────────────────────────────┐ │ │
│  │ │ .ide-layout (flex row)                              │ │ │
│  │ │ ┌───────┬─────────────────────┬─────────────────┐  │ │ │
│  │ │ │ Left  │      Center         │     Right       │  │ │ │
│  │ │ │ 300px │      flex: 1        │     320px       │  │ │ │
│  │ │ │       │                     │                 │  │ │ │
│  │ │ │ Liquid│   LiquidGlassDiv    │  LiquidGlassDiv │  │ │ │
│  │ │ │ Glass │                     │                 │  │ │ │
│  │ │ │ Div   │   ┌──────────────┐  │  ┌───────────┐ │  │ │ │
│  │ │ │       │   │              │  │  │           │ │  │ │ │
│  │ │ │┌─────┐│   │  NotePanel   │  │  │ChatPanel  │ │  │ │ │
│  │ │ ││Trans││   │              │  │  │           │ │  │ │ │
│  │ │ ││cript││   │  - Tabs      │  │  │- Messages │ │  │ │ │
│  │ │ ││Panel││   │  - Editor    │  │  │- Input    │ │  │ │ │
│  │ │ │└─────┘│   │  - Markdown  │  │  │           │ │  │ │ │
│  │ │ │       │   │              │  │  │           │ │  │ │ │
│  │ │ └───────┴─────────────────────┴─────────────────┘  │ │ │
│  │ └─────────────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Fixed Left/Right, Flexible Center**
   - Left: 300px (easy access to transcript)
   - Center: flex: 1 (main focus area)
   - Right: 320px (persistent AI helper)

2. **Use Normal LiquidGlassDiv** (not FlexibleLiquidGlassDiv)
   - Each panel wrapper gets standard glass effect
   - Consistent with current aesthetic
   - Fixed dimensions per your requirement

3. **Minimal Changes to Existing Components**
   - TranscriptPanel, NotePanel, ChatPanel stay mostly unchanged
   - Only their wrapper/container structure changes
   - All existing logic, state, and functionality preserved

4. **CSS Organization**
   - New file: `WorkspaceLayout.css` for layout-specific styles
   - Keep `Modules.css` for component-specific styles
   - Clean separation of concerns

### Files to Modify (ONLY THESE THREE + CSS)

**Primary modifications (CREATE these wrapper components):**
1. `src/Modules/WorkSpacePanel/Legacy/SourcePanel.jsx` - CREATE Left Panel wrapper (uses TranscriptPanel)
2. `src/Modules/WorkSpacePanel/Legacy/NotePanel.jsx` - CREATE Center Panel wrapper (uses NotetakingContent/NotePanel.jsx)
3. `src/Modules/WorkSpacePanel/Legacy/ChatBox.jsx` - CREATE Right Panel wrapper (uses ChatPanel)

**Secondary modifications (minimum changes only):**
4. Create `src/Modules/WorkSpacePanel/WorkspaceLayout.css` - New IDE layout styles
5. `src/Modules/WorkSpacePanel/Legacy/NotetakingContent/NoteTakingContent.jsx` - Update to use new 3-column layout
6. `src/Modules/Modules.css` - Add `.ide-layout` classes (keep existing unchanged)

### Component Separation Strategy

**Each of the 3 files will:**
- Wrap content in `<LiquidGlassDiv>`
- Have clear, single responsibility
- Keep all existing functionality intact
- Export as default component

**SourcePanel.jsx (Left):**
- Contains TranscriptPanel
- Fixed width: 300px (set in parent)
- Glass container for transcript utilities

**NotePanel.jsx (Center):**
- Contains note editing/display
- Flexible width: flex: 1
- Main content area

**ChatBox.jsx (Right):**
- Contains ChatPanel
- Fixed width: 320px (set in parent)
- AI assistant sidebar

### Files to Keep Unchanged
- `Legacy/NotetakingContent/TranscriptPanel.jsx` - No changes
- `Legacy/ChatPanel/ChatPanel.jsx` - No changes
- All other existing files - No changes

