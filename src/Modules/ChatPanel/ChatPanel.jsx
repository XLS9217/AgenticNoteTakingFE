import { useState, useEffect } from "react";
import LiquidGlassDiv from "../../Components/LiquidGlassDiv.jsx";
import { UserMessage, AgentMessage } from "./ChatBubble.jsx";
import UserInputArea from "./UserInputArea.jsx";
import { connectToChatSession, sendChatMessage } from "../../Api/gateway.js";


/* Only for testing layout do not use*/
const mock_data = [
    { id: 1, user: "You", text: "Can you help me analyze the meeting transcript?" },
    { id: 2, user: "AI", text: "Of course! I can help you extract key points, action items, and create summaries from your meeting transcript." },
    { id: 3, user: "You", text: "What are the main topics discussed?" },
    { id: 4, user: "AI", text: "Based on the transcript, the main topics include project timeline, budget allocation, team responsibilities, and upcoming milestones." },
    { id: 5, user: "You", text: "Can you create action items?" },
    { id: 6, user: "AI", text: "Sure! I'll extract actionable tasks with assigned owners and deadlines from the discussion." }
];

export default function ChatPanel() {
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Connect to WebSocket session
        const ws = connectToChatSession();
        setSocket(ws);

        // onconnect handler
        ws.onopen = () => {
            console.log('WebSocket connected successfully');
            setIsConnected(true);
        };

        // onmessage handler
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Received message:', data);

                // Handle different message types based on backend session rules
                if (data.type === 'agent_message') {
                    // Add agent response to messages
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        user: 'AI',
                        text: data.text
                    }]);
                } else if (data.error) {
                    console.error('Error from server:', data.error);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        // onerror handler
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setIsConnected(false);
        };

        // onclose handler
        ws.onclose = () => {
            console.log('WebSocket connection closed');
            setIsConnected(false);
        };

        // Cleanup on component unmount
        return () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, []);

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
                    {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                </div>

                <div className="chat-history">
                    {messages.map(message => (
                        message.user === 'You'
                            ? <UserMessage key={message.id} text={message.text} />
                            : <AgentMessage key={message.id} text={message.text} />
                    ))}
                </div>

                <UserInputArea onSendMessage={handleSendMessage} />
            </div>
        </LiquidGlassDiv>
    );
}