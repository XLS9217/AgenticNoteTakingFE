# Centralized WebSocket Message Handling Plan

## Goal
Move all WebSocket message handling to WorkSpacePanel.jsx and use CommendDispatcher to route messages to the appropriate components via channels.

## Current State
- Socket created in `WorkSpacePanel.jsx`
- Each component adds its own `socket.addEventListener('message', ...)`:
  - `ChatBox.jsx` - handles `agent_message`, `agent_chunk`
  - `SourcePanel.jsx` - handles `workspace_message` with `sub_type: 'process_status'`
  - `NotePanel.jsx` - handles `workspace_message` with `sub_type: 'smart_update_result'`

## New Architecture

### Step 1: Add new channels to CommendDispatcher
```javascript
export const ChannelEnum = Object.freeze({
    DISPLAY_CONTROL: 'DISPLAY_CONTROL',
    REFRESH_CONTROL: 'REFRESH_CONTROL',
    TEXT_SELECT: 'TEXT_SELECT',
    // New channels for WebSocket messages
    CHAT_MESSAGE: 'CHAT_MESSAGE',         // agent_message, agent_chunk
    PROCESS_STATUS: 'PROCESS_STATUS',     // process_status updates
    SMART_UPDATE: 'SMART_UPDATE',         // smart_update_result
});
```

### Step 2: Centralize message handling in WorkSpacePanel.jsx
```javascript
useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            // Route to appropriate channel based on message type
            if (data.type === 'agent_message' || data.type === 'agent_chunk') {
                CommendDispatcher.Publish2Channel(ChannelEnum.CHAT_MESSAGE, data);
            }
            else if (data.type === 'workspace_message') {
                if (data.sub_type === 'process_status') {
                    CommendDispatcher.Publish2Channel(ChannelEnum.PROCESS_STATUS, data);
                }
                else if (data.sub_type === 'smart_update_result') {
                    CommendDispatcher.Publish2Channel(ChannelEnum.SMART_UPDATE, data);
                }
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
}, [socket]);
```

### Step 3: Update child components to subscribe via CommendDispatcher

**ChatBox.jsx:**
- Remove: `socket` prop, `socket.addEventListener`
- Add: Subscribe to `CHAT_MESSAGE` channel
```javascript
useEffect(() => {
    const unsubscribe = CommendDispatcher.Subscribe2Channel(
        ChannelEnum.CHAT_MESSAGE,
        (data) => {
            if (data.type === 'agent_message') {
                setMessages(prev => [...prev, { id: Date.now(), user: 'AI', text: data.text }]);
            } else if (data.type === 'agent_chunk') {
                setCurrentChunk(data);
            }
        }
    );
    return unsubscribe;
}, []);
```

**SourcePanel.jsx:**
- Remove: `socket` prop, `socket.addEventListener`
- Add: Subscribe to `PROCESS_STATUS` channel
```javascript
useEffect(() => {
    const unsubscribe = CommendDispatcher.Subscribe2Channel(
        ChannelEnum.PROCESS_STATUS,
        (data) => {
            const status = data.status;
            setProcessStatus(status);
            // ... rest of logic
        }
    );
    return unsubscribe;
}, []);
```

**NotePanel.jsx:**
- Remove: `socket` prop, `socket.addEventListener`
- Add: Subscribe to `SMART_UPDATE` channel
```javascript
useEffect(() => {
    const unsubscribe = CommendDispatcher.Subscribe2Channel(
        ChannelEnum.SMART_UPDATE,
        (data) => {
            // Handle smart_update_result
        }
    );
    return unsubscribe;
}, []);
```

### Step 4: Update props

**Remove socket prop from:**
- `NoteTakingContent.jsx` - no longer passes socket to children
- `ChatBox.jsx`
- `SourcePanel.jsx`
- `NotePanel.jsx`

**Keep socket in WorkSpacePanel for:**
- Sending messages (still needed for `socket.send()`)
- Could expose a `sendMessage` function via context or dispatcher if needed

### Files to modify:
1. `src/Util/CommendDispatcher.js` - Add new channels
2. `src/Modules/WorkSpacePanel/WorkSpacePanel.jsx` - Centralize message handling
3. `src/Modules/WorkSpacePanel/NoteTakingContent.jsx` - Remove socket props
4. `src/Modules/WorkSpacePanel/ChatBox.jsx` - Subscribe to CHAT_MESSAGE
5. `src/Modules/WorkSpacePanel/SourcePanel.jsx` - Subscribe to PROCESS_STATUS
6. `src/Modules/WorkSpacePanel/NotePanel.jsx` - Subscribe to SMART_UPDATE

## Benefits
- Single point of WebSocket message parsing
- Clear separation of concerns
- Components don't need socket prop drilling
- Easier to add new message types
- Easier to debug (single place to log all messages)
