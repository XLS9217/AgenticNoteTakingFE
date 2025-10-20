# Agentic Note Taking Frontend

A modern React application for AI-powered meeting note-taking with real-time chat capabilities and a beautiful liquid glass design aesthetic.

```
    ┌─────────────────────────────────────────────────────────────┐
    │                                                             │
    │   ╔═══════════════╗    ╔════════════╗    ╔═══════════╗    │
    │   ║               ║    ║            ║    ║           ║    │
    │   ║  TRANSCRIPT   ║    ║   NOTES    ║    ║   CHAT    ║    │
    │   ║               ║    ║            ║    ║           ║    │
    │   ║   Meeting     ║    ║  Summary   ║    ║   AI      ║    │
    │   ║   Content     ║    ║  & Action  ║    ║  Agent    ║    │
    │   ║               ║    ║   Items    ║    ║           ║    │
    │   ╚═══════════════╝    ╚════════════╝    ╚═══════════╝    │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘
           Liquid Glass Design · Real-time Collaboration
```

![Application Preview](public/img.png)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Interaction Patterns](#-interaction-patterns)
- [Installation](#-installation)
- [API Integration](#-api-integration)
- [Development](#-development)

---

## 🌟 Overview

This application provides an intelligent note-taking experience for meetings, combining:
- **Real-time Transcription** - Import or edit meeting transcripts
- **AI-Powered Chat** - Interact with an AI agent to extract insights
- **Structured Notes** - Organize key points and action items
- **Workspace Management** - Multiple workspaces for different meetings

The backend repository is located at: `E:\Project\_MeetingNoteTaking\AgenticNoteTakingBE`

---

## 🚀 Key Features

### Core Functionality
- **Three-Panel Workspace**: Transcript | Notes | AI Chat
- **Real-time AI Chat**: WebSocket-based streaming responses
- **Workspace Persistence**: Save and load meeting workspaces
- **User Authentication**: Secure login and user management
- **File Import**: Drag-and-drop .txt files for transcripts
- **Editable Content**: Direct editing of transcripts and notes

### Design & UX
- **Liquid Glass Morphism**: Elegant translucent UI containers
- **Context-Aware UtilBar**: Dynamic utility controls
- **Custom Scroll Bars**: Themed scroll components
- **Smooth Animations**: Polished transitions and interactions
- **Responsive Layout**: Optimized for various screen sizes

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 19.1.0 |
| **Build Tool** | Vite 6.3.5 |
| **HTTP Client** | Axios 1.12.2 |
| **Styling** | CSS3 with Custom Properties |
| **Communication** | REST API + WebSocket |
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
  └────┬────┘              │
       │                   │
       │ Success           │ Logout
       ▼                   │
  ┌──────────────┐         │
  │  Workspace   │         │
  │  Selection   │         │
  └──────┬───────┘         │
       │                   │
       │ Select            │
       ▼                   │
  ┌──────────────────────────┐
  │   Active Workspace       │
  │  ┌─────────────────────┐ │
  │  │ Transcript | Notes  │ │
  │  │         +           │ │
  │  │      AI Chat        │ │
  │  └─────────────────────┘ │
  └──────────────────────────┘
       │
       │ Leave
       └─────────────────────┘
```

### Component Hierarchy

```
App
 └─ Background
     └─ Application (Auth Gate)
         ├─ LoginScreen (if not authenticated)
         └─ UtilBarProvider (if authenticated)
             ├─ UtilBar (context-aware controls)
             └─ ApplicationContent
                 ├─ UserPanel (profile view)
                 ├─ WorkspaceSelection (workspace list)
                 └─ WorkSpacePanel (active workspace)
                     ├─ NoteTakingContent
                     │   ├─ TranscriptPanel
                     │   └─ NotePanel
                     └─ ChatPanel
                         ├─ ChatBubble (User/Agent/Running)
                         └─ UserInputArea
```

### Communication Architecture

```
┌────────────────┐
│   FRONTEND     │
│   (React)      │
└────────┬───────┘
         │
         ├─────────────┐
         │             │
         ▼             ▼
    ┌────────┐   ┌──────────┐
    │  REST  │   │ WebSocket│
    │  API   │   │          │
    └────┬───┘   └────┬─────┘
         │             │
         └──────┬──────┘
                ▼
        ┌──────────────┐
        │   BACKEND    │
        │   (Gateway)  │
        └──────────────┘
               │
               ▼
        ┌──────────────┐
        │   Database   │
        │  (Workspaces)│
        └──────────────┘

REST API Endpoints:
• /user/auth          - Authenticate user
• /user/create        - Register new user
• /user/info/:id      - Get user details
• /workspace/create   - Create workspace
• /workspace/:id      - Get workspace data
• /workspace/owner/:id - List user workspaces
• /note-taking/update - Update content

WebSocket Endpoint:
• /agent/chat_session - Real-time AI chat
```

---

## 📂 Project Structure

```
AgenticNoteTakingFE/
│
├── public/                        # Static assets
│   ├── icons/                     # UI icons
│   └── img.png                    # Preview image
│
├── src/
│   ├── Api/                       # Backend communication
│   │   ├── request.js             # Axios instance
│   │   └── gateway.js             # API functions
│   │
│   ├── Components/                # Reusable UI components
│   │   ├── Background.jsx         # App background
│   │   ├── LiquidGlassDiv.jsx     # Glass container
│   │   ├── LiquidGlassButton.jsx  # Glass button
│   │   ├── LiquidGlassScrollBar.jsx # Custom scrollbar
│   │   ├── UtilBar/               # Context utility bar
│   │   │   ├── UtilBar.jsx
│   │   │   └── UtilBarProvider.jsx
│   │   └── Components.css
│   │
│   ├── Modules/                   # Feature modules
│   │   ├── Application.jsx        # Main app container
│   │   ├── UserPanel/             # User management
│   │   │   ├── LoginScreen.jsx
│   │   │   ├── UserPanel.jsx
│   │   │   └── WorkspaceSelection.jsx
│   │   └── WorkSpacePanel/        # Active workspace
│   │       ├── WorkSpacePanel.jsx
│   │       ├── ChatPanel/         # AI chat interface
│   │       │   ├── ChatPanel.jsx
│   │       │   ├── ChatBubble.jsx
│   │       │   └── UserInputArea.jsx
│   │       └── NotetakingContent/ # Content panels
│   │           ├── NoteTakingContent.jsx
│   │           ├── TranscriptPanel.jsx
│   │           └── NotePanel.jsx
│   │
│   ├── App.jsx                    # Root component
│   ├── main.jsx                   # Entry point
│   └── [styles].css               # Styling files
│
├── package.json                   # Dependencies
└── vite.config.js                 # Vite configuration
```

---

## 🔄 Interaction Patterns

### 1. User Authentication Flow

```
┌─────────────┐
│ LoginScreen │
└──────┬──────┘
       │
       ├─ Input: username, password
       │
       ▼
┌────────────────┐
│ authUser(creds)│ ──HTTP POST──► Backend /user/auth
└────────┬───────┘
       │
       ├─ Success: JWT token + user info
       │
       ▼
┌───────────────────┐
│ setIsAuthenticated│
│ setUserInfo       │
└────────┬──────────┘
       │
       ▼
┌────────────────────┐
│ WorkspaceSelection │
└────────────────────┘
```

### 2. Workspace Interaction

```
┌──────────────────────────────────────────────────────────────┐
│                    WORKSPACE LIFECYCLE                       │
└──────────────────────────────────────────────────────────────┘

  ┌─────────────────────┐
  │ Select Workspace    │
  │  (from list)        │
  └──────────┬──────────┘
             │
             ▼
    ┌────────────────┐
    │ getWorkspace() │ ──HTTP GET──► /workspace/:id
    └────────┬───────┘
             │
             ├─ Returns: { note, transcript, chat_history }
             │
             ▼
    ┌──────────────────────────────────────┐
    │  WorkSpacePanel Mounts               │
    │                                      │
    │  ┌────────────┐  ┌──────────────┐   │
    │  │ Transcript │  │    Notes     │   │
    │  │   Panel    │  │    Panel     │   │
    │  └────────────┘  └──────────────┘   │
    │                                      │
    │  ┌──────────────────────────────┐   │
    │  │       Chat Panel             │   │
    │  │  (WebSocket Connection)      │   │
    │  └──────────────────────────────┘   │
    └──────────────────────────────────────┘
             │
             ├─ User edits transcript
             │    └──► updateTranscript() ──PUT──► Backend
             │
             ├─ User edits notes
             │    └──► updateNote() ──PUT──► Backend
             │
             └─ User sends chat message
                  └──► WebSocket send() ──► AI Agent
```

### 3. Real-time Chat Communication

```
┌───────────────────────────────────────────────────────────────┐
│              WEBSOCKET CHAT ARCHITECTURE                      │
└───────────────────────────────────────────────────────────────┘

FRONTEND                        BACKEND
   │                               │
   ├──► connectToChatSession()     │
   │                               │
   │    WebSocket Open             │
   ├──────────────────────────────►│
   │                               │
   │◄──────────────────────────────┤ onopen event
   │                               │
   ├──► Send workspace_switch      │
   │    { type: "workspace_switch",│
   │      workspace_id: "..." }    │
   ├──────────────────────────────►│
   │                               │
   │                               │
   ├──► User types message         │
   │                               │
   ├──► Send user_message          │
   │    { type: "user_message",    │
   │      user: "...",             │
   │      text: "..." }            │
   ├──────────────────────────────►│
   │                               │
   │                               ├─ AI Agent Processing
   │                               │
   │◄──────────────────────────────┤ agent_chunk (streaming)
   │    { type: "agent_chunk",     │
   │      chunk: "...",            │
   │      index: N }               │
   │                               │
   │  RunningMessage Component     │
   │  displays streaming text      │
   │                               │
   │◄──────────────────────────────┤ agent_message (complete)
   │    { type: "agent_message",   │
   │      text: "..." }            │
   │                               │
   │  Message added to history     │
   │                               │
   └───────────────────────────────┘
```

### 4. Context-Aware UtilBar

```
┌──────────────────────────────────────────────────────────────┐
│                    UTILBAR CONTEXT SYSTEM                    │
└──────────────────────────────────────────────────────────────┘

 State: NOT in workspace
 ┌─────────────────────────────────────────────────────────┐
 │  [👤 User] [🖼️ Background] [⚙️ Settings] [🚪 Logout]   │
 └─────────────────────────────────────────────────────────┘
                     DEFAULT Controls

                          │
                          ▼ Enter Workspace
                          │
 State: IN workspace
 ┌─────────────────────────────────────────────────────────┐
 │  [📁 Workspace] [📥 Import] [📤 Export]                 │
 └─────────────────────────────────────────────────────────┘
                    OVERRIDE Controls

Provider Pattern:
• UtilBarProvider wraps authenticated content
• Components call setOverride() to change controls
• clearOverride() restores default controls
• Enables context-specific actions throughout app
```

### 5. State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   STATE FLOW DIAGRAM                        │
└─────────────────────────────────────────────────────────────┘

Application Level (Application.jsx):
├─ isAuthenticated (boolean)
├─ userInfo (object)
├─ activeWorkspace (string)
└─ currentView ('workspace' | 'user')

     │
     └──► Passed to child components
            │
            ├──► WorkSpacePanel receives:
            │    • workspaceId
            │    • onLeave callback
            │         │
            │         └──► Manages:
            │              ├─ workspaceData { note, transcript }
            │              ├─ chatHistory (array)
            │              └─ workspaceName (string)
            │                    │
            │                    ├──► TranscriptPanel
            │                    │    • Editable transcript
            │                    │    • Auto-save on change
            │                    │
            │                    ├──► NotePanel
            │                    │    • Editable notes
            │                    │    • Markdown support
            │                    │
            │                    └──► ChatPanel
            │                         ├─ messages (local state)
            │                         ├─ socket (WebSocket)
            │                         ├─ isConnected (boolean)
            │                         └─ currentChunk (streaming)
            │
            └──► WorkspaceSelection receives:
                 • userInfo
                 • onWorkspaceSelect callback
```

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Backend server running (see `AgenticNoteTakingBE`)

### Setup Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd AgenticNoteTakingFE

# 2. Install dependencies
npm install

# 3. Configure backend endpoint (if needed)
# Edit src/Api/request.js to set base URL

# 4. Start development server
npm run dev

# 5. Open in browser
# Navigate to http://localhost:5173
```

The application will connect to the backend server for authentication and data persistence.

---

## 🔌 API Integration

### REST Endpoints

The application communicates with the backend through `src/Api/gateway.js`:

**User Management**
- `authUser(credentials)` - POST /user/auth
- `createUser(payload)` - POST /user/create
- `getUserInfo(username)` - GET /user/info/:username

**Workspace Operations**
- `createWorkspace(payload)` - POST /workspace/create
- `getWorkspace(id)` - GET /workspace/:id
- `getWorkspacesByOwner(owner)` - GET /workspace/owner/:owner
- `deleteWorkspace(id)` - DELETE /workspace/delete
- `changeWorkspaceName(id, name)` - PUT /workspace/change-name

**Content Updates**
- `updateTranscript(workspaceId, content)` - PUT /note-taking/update-transcript
- `updateNote(workspaceId, content)` - PUT /note-taking/update-note

### WebSocket Protocol

**Connection:** `ws://[host]/agent/chat_session`

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
```

Server → Client:
```json
{
  "type": "agent_chunk",
  "chunk": "streaming text",
  "index": 0
}

{
  "type": "agent_message",
  "text": "complete response"
}

{
  "error": "error message"
}
```

---

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### CSS Architecture

**Design System:**
- CSS Custom Properties for theming
- Component-scoped styles
- Liquid Glass design tokens
- Consistent spacing scale

**Key Variables:**
```css
--glass-background: rgba(255, 255, 255, 0.1)
--glass-blur: 10px
--color-primary: #6366f1
--spacing-md: 1rem
--transition-base: 0.3s ease
```

### Code Organization

**Principles:**
- Component modularity
- Single responsibility
- Props-based communication
- Custom hooks for shared logic
- Context for cross-cutting concerns

---

## 🎨 Design Philosophy

**Liquid Glass Aesthetic:**
- Glassmorphism with backdrop filters
- Subtle shadows and borders
- Smooth animations
- Minimalist interface
- High contrast for readability

**UX Principles:**
- Immediate feedback
- Progressive disclosure
- Context-aware controls
- Keyboard shortcuts support
- Error handling with grace

---

## 📄 License

This project is for educational and development purposes.

---

**Built with ❤️ using React + Vite**