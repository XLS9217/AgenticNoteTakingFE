# Slide Transition Animation Plan

## Goal
When clicking a workspace card, workspace selection slides left out while note-taking view slides left in. When clicking back button (menu icon), the reverse happens.

## Files to modify
- `src/Modules/Application.jsx` - Add transition state and wrapper
- `src/Modules/Modules.css` - Add slide animation CSS

## Implementation Steps

### Step 1: Add transition state to Application.jsx
- Add `transitionDirection` state: `'none' | 'slide-left' | 'slide-right'`
- Wrap workspace selection and workspace panel in a transition container
- When selecting workspace: set direction to `'slide-left'`, after animation set view
- When going back: set direction to `'slide-right'`, after animation set view

### Step 2: Create CSS animations
```css
.view-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.view-slide {
  position: absolute;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease-in-out;
}

/* Workspace selection - slides out left when entering workspace */
.view-slide--selection.slide-left-exit {
  transform: translateX(-100%);
}

/* Workspace panel - slides in from right when entering */
.view-slide--workspace.slide-left-enter {
  transform: translateX(0);
}

.view-slide--workspace.slide-left-enter-from {
  transform: translateX(100%);
}

/* Reverse for going back */
.view-slide--selection.slide-right-enter {
  transform: translateX(0);
}

.view-slide--selection.slide-right-enter-from {
  transform: translateX(-100%);
}

.view-slide--workspace.slide-right-exit {
  transform: translateX(100%);
}
```

### Step 3: Update Application.jsx logic
1. When `onWorkspaceSelect` is called:
   - Start slide-left animation
   - After 300ms, update `activeWorkspace` state

2. When `handleMenuClick` (back) is called:
   - Start slide-right animation
   - After 300ms, clear `activeWorkspace` state

### Step 4: Structure
```jsx
<div className="view-container">
  {/* Workspace Selection */}
  <div className={`view-slide view-slide--selection ${transitionClass}`}>
    <WorkspaceSelection ... />
  </div>

  {/* Workspace Panel */}
  <div className={`view-slide view-slide--workspace ${transitionClass}`}>
    <WorkSpacePanel ... />
  </div>
</div>
```

## Animation Flow

### Entering workspace (slide left):
1. Selection is visible at translateX(0)
2. Workspace is hidden at translateX(100%)
3. Trigger animation
4. Selection moves to translateX(-100%)
5. Workspace moves to translateX(0)

### Leaving workspace (slide right):
1. Workspace is visible at translateX(0)
2. Selection is hidden at translateX(-100%)
3. Trigger animation
4. Workspace moves to translateX(100%)
5. Selection moves to translateX(0)
