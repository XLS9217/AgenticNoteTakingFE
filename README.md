# Agentic Note Taking Frontend

A modern React application for AI-powered meeting note-taking with real-time chat capabilities and a beautiful liquid glass design aesthetic.

```
    ┌─────────────────────────────────────────────────────────────┐
    │                                                             │
    │   ╔═══════════════╗    ╔════════════╗    ╔═══════════╗    │
    │   ║               ║    ║            ║    ║           ║    │
    │   ║    SOURCE     ║    ║   NOTES    ║    ║   CHAT    ║    │
    │   ║               ║    ║            ║    ║           ║    │
    │   ║  Transcript   ║    ║  Slate.js  ║    ║    AI     ║    │
    │   ║  + Metadata   ║    ║   Editor   ║    ║  Agent    ║    │
    │   ║  + Topics     ║    ║  + Smart   ║    ║ Streaming ║    │
    │   ║  + Speakers   ║    ║   Update   ║    ║           ║    │
    │   ╚═══════════════╝    ╚════════════╝    ╚═══════════╝    │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘
           Liquid Glass Design · Real-time AI Collaboration
```

---

## Overview

An intelligent meeting note-taking platform that combines transcript management, rich text editing, and real-time AI collaboration in an elegant IDE-like interface.

**Core Capabilities:**
- **Transcript Management** - Upload, edit, and process meeting transcripts with drag-and-drop support
- **Rich Note Taking** - Slate.js editor with formatting (Bold, Italic, Underline, H1, H2)
- **AI Assistant** - WebSocket-based chat with streaming responses and smart text updates
- **Workspace Management** - Multi-workspace support with persistent storage

**Backend:** `E:\Project\_MeetingNoteTaking\AgenticNoteTakingBE`

---

## Key Features

### Core Functionality
- **Three-Panel IDE Layout**: Source | Notes | AI Chat
- **Real-time AI Chat**: WebSocket streaming with typing indicators
- **Rich Text Editor**: Slate.js with formatting toolbar and keyboard shortcuts
- **Smart Update**: Select text in editor, send to AI for modification, auto-replace result
- **Auto-Save**: Changes auto-save with visual feedback
- **Text Selection Publishing**: Select text in editor to share context with AI chat
- **Transcript Processing**: Upload .txt files and process with AI for speaker identification and topic extraction
- **Topic & Speaker Cards**: Extracted metadata with summaries, clickable navigation
- **Workspace Persistence**: Save and restore complete workspace state

### Design & UX
- **Liquid Glass Morphism**: Elegant translucent UI with dynamic blur effects
- **Slide Transitions**: Smooth animations between workspace selection and workspace view
- **Custom Scrollbars**: Themed scroll components throughout the app
- **Event System**: Pub/Sub pattern via `CommendDispatcher` for cross-component communication

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 19 |
| **Build Tool** | Vite |
| **Rich Text Editor** | Slate.js + slate-react |
| **HTTP Client** | Axios |
| **UI Components** | Custom Liquid Glass components |
| **Styling** | CSS3 with Custom Properties |
| **Communication** | REST API + WebSocket |
| **Markdown** | react-markdown |

---

## Architecture

### Application Flow

```
[Login] → [Workspace Selection] ←slide→ [Active Workspace]
                                              │
                                  ┌───────────┼───────────┐
                                  │           │           │
                              Source       Notes        Chat
                               Panel       Panel         Box
```

### Component Hierarchy

```
App
 └─ Background
     └─ Application (Auth Gate)
         ├─ LoginScreen (if not authenticated)
         │
         └─ (if authenticated)
             ├─ AppHeader
             └─ View Container
                 ├─ WorkspaceSelection (grid of workspaces)
                 └─ WorkSpacePanel (active workspace)
                     └─ NoteTakingContent (three-panel layout)
                         ├─ SourcePanel (transcript + metadata)
                         ├─ NotePanel (Slate.js editor)
                         └─ ChatBox (AI chat)
```

### Communication Architecture

```
┌────────────────┐
│   FRONTEND     │
│   (React)      │
└────────┬───────┘
         │
    ┌────┴────┐
    │  Vite   │
    │  Proxy  │
    └────┬────┘
         │
    ┌────┴────────────────┐
    │      REST           │ WebSocket
    │      /api           │ /agent/chat_session
    └─────────────────────┘
              │
              ▼
        ┌──────────────┐
        │   BACKEND    │
        └──────────────┘
```

### Event System (CommendDispatcher)

Pub/Sub pattern for cross-component communication:

```javascript
// Available Channels
DISPLAY_CONTROL    // UI navigation (scroll to topic/speaker)
REFRESH_CONTROL    // Trigger data refresh
TEXT_SELECT        // Selected text from Slate editor
CHAT_MESSAGE       // Agent messages from WebSocket
PROCESS_STATUS     // Transcript processing status
SMART_UPDATE_LOCK  // Lock text for smart update
SMART_UPDATE       // Smart update result
SOCKET_SEND        // Send message via WebSocket
SOCKET_STATUS      // WebSocket connection status

// Usage
CommendDispatcher.Subscribe2Channel(channel, callback)
CommendDispatcher.Publish2Channel(channel, payload)
```

---

## Project Structure

```
AgenticNoteTakingFE/
│
├── public/icons/              # UI icons
│
├── src/
│   ├── Api/                   # Backend communication
│   │   ├── request.js         # Axios instance
│   │   ├── gateway.js         # REST API functions
│   │   └── socket_gateway.js  # WebSocket management
│   │
│   ├── Components/            # Reusable UI components
│   │   ├── Background.jsx
│   │   ├── LiquidGlassOutter/   # Outer glass containers
│   │   ├── LiquidGlassInner/    # Interactive glass components
│   │   └── LiquidGlassGlobal/   # Scrollbars, floating elements
│   │
│   ├── Modules/               # Feature modules
│   │   ├── Application.jsx    # Main app + auth gate
│   │   ├── AppHeader.jsx      # Header with navigation
│   │   │
│   │   ├── UserPanel/
│   │   │   ├── LoginScreen.jsx
│   │   │   ├── UserPanel.jsx
│   │   │   └── WorkspaceSelection.jsx
│   │   │
│   │   └── WorkSpacePanel/
│   │       ├── WorkSpacePanel.jsx    # Workspace orchestrator
│   │       ├── NoteTakingContent.jsx # Three-panel layout
│   │       ├── SourcePanel.jsx       # Transcript + metadata
│   │       ├── NotePanel.jsx         # Slate.js editor
│   │       └── ChatBox.jsx           # AI chat interface
│   │
│   ├── Util/
│   │   ├── CommendDispatcher.js  # Pub/Sub event system
│   │   └── RichTextConvertor.js  # Markdown <-> Slate conversion
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── vite.config.js             # Vite + proxy config
├── CLAUDE.md                  # Dev guidelines
└── README.md
```

---

## Installation

### Prerequisites
- Node.js 18+
- Backend server running (see `AgenticNoteTakingBE`)

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:7007
```

---

## API Integration

### REST Endpoints (gateway.js)

```javascript
// Auth
authUser(credentials)
createUser(payload)
getUserInfo(username)
logout()

// Workspaces
createWorkspace(payload)
getWorkspace(id)
getMyWorkspaces()
deleteWorkspace(id)
changeWorkspaceName(id, name)

// Content
updateTranscript(workspaceId, content)
updateNote(workspaceId, content)
getProcessedTranscript(workspaceId)
getMetadata(workspaceId)
getChatHistory(workspaceId)
```

### WebSocket (socket_gateway.js)

```javascript
connectSocket(workspaceId)   // Connect with token auth
disconnectSocket()           // Close connection
getConnectionStatus()        // Check if connected
```

**Message Types:**

Client → Server:
```json
{ "type": "workspace_switch", "workspace_id": "..." }
{ "type": "user_message", "text": "...", "extra": { "selected": "..." } }
{ "type": "workspace_message", "sub_type": "process_transcript" }
{ "type": "workspace_message", "sub_type": "smart_update", "message_original": "...", "query": "..." }
```

Server → Client:
```json
{ "type": "agent_chunk", "text": "...", "finished": false }
{ "type": "agent_message", "text": "..." }
{ "type": "workspace_message", "sub_type": "process_status", "status": "..." }
{ "type": "workspace_message", "sub_type": "smart_update_lock", "lock_text": "..." }
{ "type": "workspace_message", "sub_type": "smart_update_result", "result": "..." }
```

---

## Development

### Scripts

```bash
npm run dev      # Start dev server (port 7007)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Guidelines (CLAUDE.md)

1. No npm commands - just edit code
2. Minimum work, don't overcomplicate
3. CSS in organized sections
4. API calls go through gateway.js
5. Follow liquid glass aesthetic
6. One task at a time

---

## License

This project is for educational and development purposes.

---

**Built with React 19 + Vite + Slate.js**
