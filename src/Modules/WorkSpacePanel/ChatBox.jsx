import LiquidGlassDiv from "../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx";
import {useEffect, useState} from "react";


export function UserMessage({ text }) {
    return (
        <div className="message user-message">
            <div className="message-content">
                <span className="message-text">{text}</span>
            </div>
        </div>
    );
}

export function AgentMessage({ text }) {
    return (
        <div className="message ai-message">
            <div className="message-content">
                <span className="message-text">{text}</span>
            </div>
        </div>
    );
}

export function RunningMessage({ chunkData, onMessageComplete, debugForceShow = false }) {
    const [runningText, setRunningText] = useState('');

    useEffect(() => {
        if (!chunkData) return;

        if (chunkData.finished) {
            // Message complete - notify parent and reset
            if (runningText) {
                onMessageComplete(runningText);
                setRunningText('');
            }
        } else {
            // Append chunk to running text
            setRunningText(prev => prev + chunkData.text);
        }
    }, [chunkData]);

    if (!runningText && !debugForceShow) return null;

    return (
        <div className="message ai-message ai-message--streaming">
            <div className="streaming-indicator">
                <span className="liquid-dot liquid-dot--1"></span>
                <span className="liquid-dot liquid-dot--2"></span>
                <span className="liquid-dot liquid-dot--3"></span>
            </div>
            <div className="message-content">
                <span className="message-text">{runningText || 'Debug: Streaming animation preview'}</span>
            </div>
        </div>
    );
}

function UserInputArea({ onSendMessage }) {
    const [messageText, setMessageText] = useState('');

    const handleSend = () => {
        if (messageText.trim() && onSendMessage) {
            onSendMessage(messageText);
            setMessageText('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-input-area">
            <textarea
                className="chat-textarea liquid-glass-scrollbar"
                placeholder="Start with an idea or task."
                rows={2}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
            />
            <div className="input-controls">
                <div className="input-buttons">
                    <button className="control-button">+</button>
                </div>
                <button
                    className="send-button"
                    onClick={handleSend}
                    disabled={!messageText.trim()}
                >
                    ↑
                </button>
            </div>
        </div>
    );
}

export default function ChatBox({ chatHistory, socket, isConnected }) {
    const [messages, setMessages] = useState([]);
    const [currentChunk, setCurrentChunk] = useState(null);

    const getConnectionStatus = () => {
        if (!socket) return { color: '🟡', text: 'Loading...' };
        if (!isConnected) return { color: '🔴', text: 'Disconnected' };
        return { color: '🟢', text: 'Connected' };
    };

    useEffect(() => {
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
                } else if (data.type === "agent_chunk") {
                    setCurrentChunk(data);
                } else if (data.error) {
                    console.error('Error from server:', data.error);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        socket.addEventListener('message', handleMessage);

        return () => {
            socket.removeEventListener('message', handleMessage);
        };
    }, [socket]);

    const handleMessageComplete = (completeText) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            user: 'AI',
            text: completeText
        }]);
    };

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
            }))
        } else {
            console.error('WebSocket not connected');
        }
    };

    const status = getConnectionStatus();

    return (
        <LiquidGlassDiv blurriness={0.5}>
            <div className="chat-panel-container">
                <div className="chat-header">
                    <div className="workspace-name-display">
                        Assistant
                    </div>
                    <div className="connection-status">
                        {status.color} {status.text}
                    </div>
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
                        debugForceShow={false}
                    />
                </div>

                <UserInputArea onSendMessage={handleSendMessage} />
            </div>
        </LiquidGlassDiv>
    );
}
