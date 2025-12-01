# Agentic Note Taking Frontend

A modern React application for AI-powered meeting note-taking with real-time chat capabilities and a beautiful liquid glass design aesthetic.

```
    ┌─────────────────────────────────────────────────────────────┐
    │                                                             │
    │   ╔═══════════════╗    ╔════════════╗    ╔═══════════╗    │
    │   ║               ║    ║            ║    ║           ║    │
    │   ║  TRANSCRIPT   ║    ║   NOTES    ║    ║   CHAT    ║    │
    │   ║               ║    ║            ║    ║           ║    │
    │   ║   Upload &    ║    ║  Slate.js  ║    ║   AI      ║    │
    │   ║   Process     ║    ║   Editor   ║    ║  Agent    ║    │
    │   ║   Meetings    ║    ║   + Rich   ║    ║ Streaming ║    │
    │   ║               ║    ║  Formatting║    ║           ║    │
    │   ╚═══════════════╝    ╚════════════╝    ╚═══════════╝    │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘
           Liquid Glass Design · Real-time AI Collaboration
```

![Application Preview](public/img.png)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [API Integration](#-api-integration)
- [Development](#-development)

---

## 🌟 Overview

An intelligent meeting note-taking platform that combines transcript management, rich text editing, and real-time AI collaboration in an elegant IDE-like interface.

**Core Capabilities:**
- **Transcript Management** - Upload, edit, and process meeting transcripts with drag-and-drop support
- **Rich Note Taking** - Slate.js editor with formatting (Bold, Italic, Underline, H1, H2)
- **AI Assistant** - WebSocket-based chat with streaming responses
- **Workspace Management** - Multi-workspace support with persistent storage

**Backend:** `E:\Project\_MeetingNoteTaking\AgenticNoteTakingBE`

---

## 🚀 Key Features

### Core Functionality
- **Three-Panel IDE Layout**: Transcript | Notes | AI Chat
- **Real-time AI Chat**: WebSocket streaming with typing indicators
- **Rich Text Editor**: Slate.js with formatting toolbar and keyboard shortcuts
- **Auto-Save**: Ctrl+S to save notes with visual feedback
- **Text Selection Publishing**: Select text in editor to share with AI chat
- **Transcript Processing**: Upload .txt files and process with AI for speaker identification and topic extraction
- **Speaker Management**: Identify and rename speakers in transcripts
- **Topic Cards**: Extracted topics with summaries and metadata
- **Chat History**: Persistent conversation history with playback
- **Workspace Persistence**: Save and restore complete workspace state

### Design & UX
- **Liquid Glass Morphism**: Elegant translucent UI with dynamic blur effects
- **Context-Aware UtilBar**: Dynamic utility controls that adapt to current context
- **Custom Scrollbars**: Themed scroll components throughout the app
- **Smooth Animations**: Polished transitions, liquid pulse indicators, and highlight effects
- **Event System**: Pub/Sub pattern via `CommendDispatcher` for cross-component communication
- **Responsive Layout**: Flexible panel system with IDE-style organization

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 19.1.0 |
| **Build Tool** | Vite 6.3.5 |
| **Rich Text Editor** | Slate.js 0.118.1 + slate-react 0.119.0 |
| **HTTP Client** | Axios 1.12.2 |
| **UI Components** | Custom Liquid Glass components (no external UI library) |
| **Styling** | CSS3 with Custom Properties (CSS Variables) |
| **Communication** | REST API + WebSocket Protocol |
| **Tooltips** | react-tooltip 5.30.0 |
| **Markdown** | react-markdown 10.1.0 |
| **Linting** | ESLint 9.25.0 |

---

## 🏛️ Architecture

### Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

    [Start]
       │
       ▼
  ┌─────────┐          Authentication
  │  Login  │◄─────────────┐
  │ Register│              │
  └────┬────┘              │
       │                   │
       │ Success           │ Logout
       ▼                   │
  ┌──────────────┐         │
  │  Workspace   │         │
  │  Selection   │─────────┘
  │  Grid View   │
  └──────┬───────┘
       │
       │ Select/Create
       ▼
  ┌──────────────────────────────────────┐
  │      Active Workspace (IDE Layout)   │
  │  ┌────────────────────────────────┐  │
  │  │  ┌────────┐ ┌────────┐ ┌─────┐│  │
  │  │  │ Source │ │  Note  │ │Chat ││  │
  │  │  │ Panel  │ │ Panel  │ │Box  ││  │
  │  │  │        │ │        │ │     ││  │
  │  │  │ - Drag │ │ Slate  │ │ AI  ││  │
  │  │  │  Drop  │ │ Editor │ │ Msg ││  │
  │  │  │ - Edit │ │ - H1/H2│ │     ││  │
  │  │  │ - Meta │ │ - B/I/U│ │     ││  │
  │  │  │ - Topic│ │ - Auto │ │     ││  │
  │  │  └────────┘ └────────┘ └─────┘│  │
  │  └────────────────────────────────┘  │
  └──────────────────────────────────────┘
```

### Component Hierarchy

```
App
 └─ Background
     └─ Application (Auth Gate)
         ├─ LoginScreen (if not authenticated)
         │   ├─ Login form
         │   └─ Register form
         │
         └─ UtilBarProvider (if authenticated)
             ├─ UtilBar (context-aware controls)
             └─ ApplicationContent
                 ├─ UserPanel (profile view)
                 ├─ WorkspaceSelection (workspace grid + create)
                 └─ WorkSpacePanel (active workspace orchestrator)
                     └─ NoteTakingContent (three-panel layout)
                         ├─ SourcePanel
                         │   ├─ Transcript upload/edit
                         │   ├─ Speaker cards
                         │   └─ Topic metadata
                         │
                         ├─ NotePanel
                         │   ├─ Slate.js editor
                         │   ├─ Formatting toolbar
                         │   └─ Auto-save indicator
                         │
                         └─ ChatBox
                             ├─ UserMessage
                             ├─ AgentMessage
                             ├─ RunningMessage (streaming)
                             └─ UserInputArea
```

### Communication Architecture

```
┌────────────────┐
│   FRONTEND     │
│   (React)      │
│   Port: 7007   │
└────────┬───────┘
         │
         ├─────────────┐
         │             │
         ▼             ▼
    ┌────────┐   ┌──────────┐
    │  REST  │   │ WebSocket│
    │  /api  │   │  /agent  │
    └────┬───┘   └────┬─────┘
         │             │
         │  Vite Proxy │
         │  (Dev Mode) │
         └──────┬──────┘
                ▼
        ┌──────────────┐
        │   BACKEND    │
        │ Port: 7008   │
        │172.16.16.202 │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │   Database   │
        │  (Workspaces)│
        └──────────────┘

REST API Endpoints:
• /user/auth                    - Authenticate user
• /user/create                  - Register new user
• /user/info/:username          - Get user details
• /workspace/create             - Create workspace
• /workspace/:id                - Get workspace data
• /workspace/owner/:owner       - List user workspaces
• /workspace/delete             - Delete workspace
• /workspace/change-name        - Rename workspace
• /note-taking/update-transcript      - Update raw transcript
• /note-taking/update-note            - Update notes
• /note-taking/get-processed-transcript/:id - Get processed transcript
• /note-taking/get-metadata/:id       - Get topics/speakers
• /note-taking/get-chat-history/:id   - Get chat history
• /note-taking/update-speaker-name    - Update speaker names

WebSocket Endpoint:
• /agent/chat_session - Real-time AI chat with streaming
```

### Event System (CommendDispatcher)

The app uses a Pub/Sub pattern to reduce prop drilling:

```javascript
// Channels
ChannelEnum.TEXT_SELECT      // Publishes selected text from Slate editor
ChannelEnum.DISPLAY_CONTROL  // UI display actions (scroll to topic)
ChannelEnum.REFRESH_CONTROL  // Trigger data refresh operations

// Usage
CommendDispatcher.Subscribe2Channel(channel, callback)
CommendDispatcher.Publish2Channel(channel, payload)
```

---

## 📂 Project Structure

```
AgenticNoteTakingFE/
│
├── public/                             # Static assets
│   ├── icons/                          # UI icons
│   ├── img.png                         # Preview image
│   └── [additional assets]
│
├── src/
│   ├── Api/                            # Backend communication
│   │   ├── request.js                  # Axios instance (baseURL: '/api')
│   │   └── gateway.js                  # All API functions
│   │
│   ├── Components/                     # Reusable UI components
│   │   ├── Background.jsx              # App background container
│   │   ├── LiquidGlassOutter/          # Outer glass containers
│   │   │   ├── LiquidGlassDiv.jsx
│   │   │   └── LiquidGlassFlexibleDiv.jsx
│   │   ├── LiquidGlassInner/           # Interactive glass components
│   │   │   ├── LiquidGlassButton.jsx
│   │   │   ├── LiquidGlassInnerTabDiv.jsx
│   │   │   ├── LiquidGlassInnerTextarea.jsx
│   │   │   └── LiquidGlassInnerTextButton.jsx
│   │   ├── LiquidGlassGlobal/          # Global glass components
│   │   │   ├── LiquidGlassScrollBar.jsx
│   │   │   ├── LiquidGlassFloating.jsx
│   │   │   └── InjectableTooltip.jsx
│   │   ├── UtilBar/                    # Context-aware utility bar
│   │   │   ├── UtilBar.jsx
│   │   │   └── UtilBarProvider.jsx
│   │   ├── RightClickMenu/             # Context menus
│   │   └── Components.css
│   │
│   ├── Modules/                        # Feature modules
│   │   ├── Application.jsx             # Main app container + auth gate
│   │   │
│   │   ├── UserPanel/                  # Authentication & user management
│   │   │   ├── LoginScreen.jsx         # Login/register form
│   │   │   ├── UserPanel.jsx           # User profile view
│   │   │   └── WorkspaceSelection.jsx  # Workspace grid + create
│   │   │
│   │   └── WorkSpacePanel/             # Active workspace
│   │       ├── WorkSpacePanel.jsx      # Workspace orchestrator
│   │       ├── NoteTakingContent.jsx   # Three-panel IDE layout
│   │       ├── SourcePanel.jsx         # Transcript management
│   │       ├── NotePanel.jsx           # Slate.js editor wrapper
│   │       ├── ChatBox.jsx             # Chat interface
│   │       ├── WorkspaceLayout.css
│   │       └── Legacy/                 # Old components (archived)
│   │
│   ├── Util/
│   │   └── CommendDispatcher.js        # Pub/Sub event system
│   │
│   ├── App.jsx                         # Root component
│   ├── main.jsx                        # Entry point
│   ├── index.css                       # Global styles
│   ├── App.css                         # App-level styles
│   └── Modules.css                     # Module styles
│
├── package.json                        # Dependencies & scripts
├── vite.config.js                      # Vite configuration + proxy
├── CLAUDE.md                           # Project guidelines
└── README.md                           # This file
```

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Backend server running at `172.16.16.202:7008` (see `AgenticNoteTakingBE`)

### Setup Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd AgenticNoteTakingFE

# 2. Install dependencies
npm install

# 3. Configure backend endpoint (if needed)
# Edit vite.config.js proxy settings if backend location changes

# 4. Start development server
npm run dev

# 5. Open in browser
# Navigate to http://localhost:7007
```

The application will connect to the backend server for authentication, data persistence, and AI processing.

---

## 🔌 API Integration

### REST Endpoints

All API calls are centralized in `src/Api/gateway.js`:

**User Management**
```javascript
authUser(credentials)              // POST /user/auth
createUser(payload)                // POST /user/create
getUserInfo(username)              // GET /user/info/:username
```

**Workspace Operations**
```javascript
createWorkspace(payload)           // POST /workspace/create
getWorkspace(id)                   // GET /workspace/:id
getWorkspacesByOwner(owner)        // GET /workspace/owner/:owner
deleteWorkspace(id)                // DELETE /workspace/delete
changeWorkspaceName(id, name)      // PUT /workspace/change-name
```

**Content Updates**
```javascript
updateTranscript(workspaceId, content)    // PUT /note-taking/update-transcript
updateNote(workspaceId, content)          // PUT /note-taking/update-note
getProcessedTranscript(workspaceId)       // GET /note-taking/get-processed-transcript/:id
getMetadata(workspaceId)                  // GET /note-taking/get-metadata/:id
getChatHistory(workspaceId)               // GET /note-taking/get-chat-history/:id
updateSpeakerName(workspaceId, payload)   // PUT /note-taking/update-speaker-name
```

**WebSocket Management**
```javascript
connectToChatSession(onMessage, onOpen, onError)
```

### WebSocket Protocol

**Connection:** `ws://172.16.16.202:7008/agent/chat_session`

**Message Types:**

Client → Server:
```json
{
  "type": "workspace_switch",
  "workspace_id": "workspace-id"
}

{
  "type": "user_message",
  "user": "username",
  "text": "message content"
}

{
  "type": "workspace_message",
  "sub_type": "process_transcript"
}
```

Server → Client:
```json
{
  "type": "agent_chunk",
  "text": "streaming text",
  "finished": false
}

{
  "type": "agent_chunk",
  "text": "",
  "finished": true
}

{
  "type": "agent_message",
  "text": "complete response"
}

{
  "type": "workspace_message",
  "sub_type": "process_status",
  "status": "processing" | "completed" | "failed"
}

{
  "error": "error message"
}
```

---

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server (http://localhost:7007)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Vite Configuration

**Dev Server:**
```javascript
server: {
  port: 7007,
  proxy: {
    '/api': {
      target: 'http://172.16.16.202:7008',
      changeOrigin: true
    },
    '/agent': {
      target: 'http://172.16.16.202:7008',
      ws: true
    }
  }
}
```

### CSS Architecture

**Design System:**
- CSS Custom Properties for theming
- Component-scoped styles with modular organization
- Liquid Glass design tokens
- Consistent spacing scale

**Key CSS Variables (index.css):**
```css
/* Colors */
--color-primary-rgb: 100, 150, 255;
--color-background: #1a1a2e;

/* Spacing */
--spacing-xs: 8px;
--spacing-sm: 12px;
--spacing-md: 16px;
--spacing-lg: 24px;

/* Border Radius */
--border-radius-sm: 8px;
--border-radius-md: 12px;
--border-radius-lg: 16px;

/* Transitions */
--transition-fast: all 0.2s ease;
--transition-base: all 0.3s ease;

/* Z-index */
--z-index-base: 1;
--z-index-content: 2;
--z-index-elevated: 10;
--z-index-floating: 100;
```

### Liquid Glass Components

**Three-tier System:**

1. **LiquidGlassOutter/** - Container components
   - `LiquidGlassDiv` - Main panel containers with blur effects
   - `LiquidGlassFlexibleDiv` - Flexible layout containers

2. **LiquidGlassInner/** - Interactive components
   - `LiquidGlassButton` - Buttons with glass styling
   - `LiquidGlassInnerTabDiv` - Tab components
   - `LiquidGlassInnerTextarea` - Textarea with glass effects
   - `LiquidGlassInnerTextButton` - Text-style buttons

3. **LiquidGlassGlobal/** - Global utilities
   - `LiquidGlassScrollBar` - Custom scrollbars
   - `LiquidGlassFloating` - Floating elements
   - `InjectableTooltip` - Tooltip component

### Code Organization Principles

**From CLAUDE.md:**
1. Do minimum work, don't overcomplicate
2. CSS belongs in organized sections (split like existing code)
3. All API calls go through `gateway.js`
4. Follow the liquid glass aesthetic pattern
5. One task at a time, no parallel execution

**Component Patterns:**
- Functional components with hooks
- Props-based communication
- Context for cross-cutting concerns (UtilBar)
- Pub/Sub for event-driven communication (CommendDispatcher)
- Single responsibility principle

---

## 🎨 Design Philosophy

**Liquid Glass Aesthetic:**
- Glassmorphism with `backdrop-filter: blur(20px) saturate(180%)`
- Subtle inset/outset shadows for depth
- Smooth animations and transitions
- Minimalist interface with high contrast
- Dynamic blur effects based on variant

**UX Principles:**
- Immediate feedback (auto-save indicators, streaming messages)
- Progressive disclosure (context-aware controls)
- Keyboard shortcuts (Ctrl+S for save)
- Drag-and-drop support
- Error handling with graceful degradation

**Interaction Design:**
- Liquid pulse animation for streaming messages
- Light grey flash for topic highlights (not blue glow)
- Text selection preview in chat
- Hover states with subtle transitions
- Custom scrollbars matching theme

---

## 📄 License

This project is for educational and development purposes.

---

**Built with ❤️ using React 19 + Vite + Slate.js**
