# Plan: Send Selected Markdown with Chat Message

## Current Flow
1. User selects text in Slate editor → `handleSelect` in `NotePanel.jsx:58-77`
2. Slate fragment is converted to markdown via `richTextConvertor.slate2md()`
3. Markdown is logged: `console.log('Selected Markdown:', markdown)` at line 67
4. `CommendDispatcher` publishes to `TEXT_SELECT` channel with `{text: previewText, json: selectedFragment}`
5. ChatBox subscribes to `TEXT_SELECT` and stores in `selectionData` state (line 114-124)
6. When user sends message, only the text is sent via WebSocket (line 199-203)

## Problem
The markdown is only logged to console - it's NOT included in the payload published to ChatBox, and NOT sent with the chat message.

## Solution

### Step 1: Include markdown in the TEXT_SELECT payload
**File:** `NotePanel.jsx:69-72`

Change the publish payload to include markdown:
```js
CommendDispatcher.Publish2Channel(ChannelEnum.TEXT_SELECT, {
    text: previewText,
    json: selectedFragment,
    markdown: markdown  // ADD THIS
});
```

### Step 2: Send markdown with the chat message
**File:** `ChatBox.jsx:188-207`

Modify `handleSendMessage` to include the selected markdown in the WebSocket payload:
```js
const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
        id: Date.now(),
        user: 'You',
        text: text
    };
    setMessages(prev => [...prev, userMessage]);

    if (socket && isConnected) {
        socket.send(JSON.stringify({
            type: "user_message",
            user: "default",
            text: text,
            context: selectionData?.markdown || null  // ADD context field with markdown
        }))
        // Clear selection after sending
        setSelectionData(null);
    } else {
        console.error('WebSocket not connected');
    }
};
```

## Files to Modify
1. `src/Modules/WorkSpacePanel/NotePanel.jsx` - Add markdown to publish payload
2. `src/Modules/WorkSpacePanel/ChatBox.jsx` - Send markdown with message, clear selection after send