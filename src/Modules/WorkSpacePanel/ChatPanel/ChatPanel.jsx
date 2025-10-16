import { useState, useEffect } from "react";
import LiquidGlassDiv from "../../../Components/LiquidGlassDiv.jsx";
import { UserMessage, AgentMessage, RunningMessage } from "./ChatBubble.jsx";
import UserInputArea from "./UserInputArea.jsx";
import { connectToChatSession, getWorkspace } from "../../../Api/gateway.js";


/* Only for testing layout do not use*/
const mock_data = [
    { id: 1, user: "You", text: "Can you help me analyze the meeting transcript?" },
    { id: 2, user: "AI", text: "Of course! I can help you extract key points, action items, and create summaries from your meeting transcript." },
    { id: 3, user: "You", text: "What are the main topics discussed?" },
    { id: 4, user: "AI", text: "Based on the transcript, the main topics include project timeline, budget allocation, team responsibilities, and upcoming milestones." },
    { id: 5, user: "You", text: "Can you create action items?" },
    { id: 6, user: "AI", text: "Sure! I'll extract actionable tasks with assigned owners and deadlines from the discussion." }
];

export default function ChatPanel({ workspaceId, onWorkspaceDataReceived }) {
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentChunk, setCurrentChunk] = useState(null);

    useEffect(() => {
        let ws = null;

        const loadWorkspace = async () => {
            setIsLoading(true);

            try {
                // Step 1: Fetch workspace data via HTTP API
                const workspaceData = await getWorkspace(workspaceId);
                console.log('Workspace data loaded:', workspaceData);

                // Step 2: Load chat history
                if (workspaceData.chat_history && Array.isArray(workspaceData.chat_history)) {
                    const loadedMessages = workspaceData.chat_history.map((msg, index) => ({
                        id: Date.now() + index,
                        user: msg.role === 'user' ? 'You' : 'AI',
                        text: msg.content
                    }));
                    setMessages(loadedMessages);
                }

                // Step 3: Pass note and transcript to parent
                if (onWorkspaceDataReceived) {
                    onWorkspaceDataReceived({
                        note: workspaceData.note || '',
                        transcript: workspaceData.transcript || ''
                    });
                }

                setIsLoading(false);

                // Step 4: Connect to WebSocket after data is loaded
                ws = connectToChatSession();
                setSocket(ws);

                ws.onopen = () => {
                    console.log('WebSocket connected successfully');
                    setIsConnected(true);

                    // Send workspace_id to WebSocket for conversation
                    ws.send(JSON.stringify({
                        type: "workspace_switch",
                        workspace_id: workspaceId
                    }));
                    console.log('Sent workspace_switch message:', workspaceId);
                };

                ws.onmessage = (event) => {
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

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setIsConnected(false);
                };

                ws.onclose = () => {
                    console.log('WebSocket connection closed');
                    setIsConnected(false);
                };

            } catch (error) {
                console.error('Error loading workspace:', error);
                setIsLoading(false);
            }
        };

        loadWorkspace();

        // Cleanup on component unmount
        return () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [workspaceId]);

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

    return (
        <LiquidGlassDiv blurriness={0.75} isButton={false} variant="chat">
            <div className="chat-panel-container">
                <div className="connection-status">
                    {isLoading ? '🟡 Loading...' : (isConnected ? '🟢 Connected' : '🔴 Disconnected')}
                </div>

                <div className="chat-history">
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
                </div>

                <UserInputArea onSendMessage={handleSendMessage} />
            </div>
        </LiquidGlassDiv>
    );
}