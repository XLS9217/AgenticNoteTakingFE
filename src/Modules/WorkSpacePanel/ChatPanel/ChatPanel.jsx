import { useState, useEffect } from "react";
import LiquidGlassFlexibleDiv from "../../../Components/LiquidGlassOutter/LiquidGlassFlexibleDiv.jsx";
import LiquidGlassScrollBar from "../../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx";
import { UserMessage, AgentMessage, RunningMessage } from "./ChatBubble.jsx";
import UserInputArea from "./UserInputArea.jsx";
import { changeWorkspaceName } from "../../../Api/gateway.js";


/* Only for testing layout do not use*/
const mock_data = [
    { id: 1, user: "You", text: "Can you help me analyze the meeting transcript?" },
    { id: 2, user: "AI", text: "Of course! I can help you extract key points, action items, and create summaries from your meeting transcript." },
    { id: 3, user: "You", text: "What are the main topics discussed?" },
    { id: 4, user: "AI", text: "Based on the transcript, the main topics include project timeline, budget allocation, team responsibilities, and upcoming milestones." },
    { id: 5, user: "You", text: "Can you create action items?" },
    { id: 6, user: "AI", text: "Sure! I'll extract actionable tasks with assigned owners and deadlines from the discussion." }
];

const STATUS_DISPLAY = {
    loading: '🟡 Loading...',
    connected: '🟢 Connected',
    disconnected: '🔴 Disconnected'
};

export default function ChatPanel({ workspaceId, chatHistory, workspaceName, onWorkspaceNameChange, socket, isConnected }) {
    const [messages, setMessages] = useState([]);
    const [currentChunk, setCurrentChunk] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('loading');
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');

    useEffect(() => {
        // Load chat history from props
        if (chatHistory && Array.isArray(chatHistory)) {
            const loadedMessages = chatHistory.map((msg, index) => ({
                id: Date.now() + index,
                user: msg.role === 'user' ? 'You' : 'AI',
                text: msg.content
            }));
            setMessages(loadedMessages);
        }
    }, [chatHistory]);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Received message:', data);

                if (data.type === 'agent_message') {
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        user: 'AI',
                        text: data.text
                    }]);
                }
                else if(data.type === "agent_chunk"){
                    setCurrentChunk(data);
                }
                else if (data.error) {
                    console.error('Error from server:', data.error);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        socket.addEventListener('message', handleMessage);
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');

        return () => {
            socket.removeEventListener('message', handleMessage);
        };
    }, [socket, isConnected]);

    // Callback for when RunningMessage completes
    const handleMessageComplete = (completeText) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            user: 'AI',
            text: completeText
        }]);
    };

    // Function to send user message
    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        // Add user message to local state
        const userMessage = {
            id: Date.now(),
            user: 'You',
            text: text
        };
        setMessages(prev => [...prev, userMessage]);

        // Send message via WebSocket
        if (socket && isConnected) {
            socket.send(JSON.stringify({
                type: "user_message",
                user: "default",
                text: text,
            }))
        } else {
            console.error('WebSocket not connected');
        }
    };

    // Handler for clicking workspace name to edit
    const handleNameClick = () => {
        setIsEditingName(true);
        setEditNameValue(workspaceName);
    };

    // Handler for name change
    const handleNameChange = (e) => {
        setEditNameValue(e.target.value);
    };

    // Handler for pressing Enter to save name
    const handleNameKeyDown = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newName = editNameValue.trim();
            if (newName && newName !== workspaceName) {
                try {
                    await changeWorkspaceName(workspaceId, newName);
                    onWorkspaceNameChange(newName);
                } catch (error) {
                    console.error('Failed to change workspace name:', error);
                }
            }
            setIsEditingName(false);
        } else if (e.key === 'Escape') {
            setIsEditingName(false);
        }
    };

    // Handler for blur to cancel editing
    const handleNameBlur = () => {
        setIsEditingName(false);
    };

    return (
        <LiquidGlassFlexibleDiv blurriness={0.75} isButton={false}>
            <div className="chat-panel-container">
                <div className="chat-header">
                    {isEditingName ? (
                        <textarea
                            className="workspace-name-input"
                            value={editNameValue}
                            onChange={handleNameChange}
                            onKeyDown={handleNameKeyDown}
                            onBlur={handleNameBlur}
                            autoFocus
                            rows={1}
                        />
                    ) : (
                        <div className="workspace-name-display" onClick={handleNameClick}>
                            {workspaceName}
                        </div>
                    )}
                    <div className="connection-status">
                        {STATUS_DISPLAY[connectionStatus]}
                    </div>
                </div>

                <LiquidGlassScrollBar className="chat-history">
                    {messages.map(message => (
                        message.user === 'You'
                            ? <UserMessage key={message.id} text={message.text} />
                            : <AgentMessage key={message.id} text={message.text} />
                    ))}
                    <RunningMessage
                        chunkData={currentChunk}
                        onMessageComplete={handleMessageComplete}
                        debugForceShow={false }
                    />
                </LiquidGlassScrollBar>

                <UserInputArea onSendMessage={handleSendMessage} />
            </div>
        </LiquidGlassFlexibleDiv>
    );
}