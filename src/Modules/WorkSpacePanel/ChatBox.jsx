import LiquidGlassDiv from "../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx";
import LiquidGlassScrollBar from "../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx";
import {useEffect, useState, useRef} from "react";
import CommendDispatcher, { ChannelEnum } from "../../Util/CommendDispatcher.js";
import ReactMarkdown from "react-markdown";


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
            <div className="message-content message-markdown">
                <ReactMarkdown>{text}</ReactMarkdown>
            </div>
        </div>
    );
}

export function RunningMessage({ chunkData, onMessageComplete, isWaiting, onStreamStart }) {
    const [displayText, setDisplayText] = useState('');
    const [dots, setDots] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const bufferRef = useRef('');
    const displayTextRef = useRef('');
    const isFinishedRef = useRef(false);

    // Animate dots: . .. ... ....
    useEffect(() => {
        if (!isWaiting && !displayText) return;
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 4 ? '' : prev + '.');
        }, 400);
        return () => clearInterval(interval);
    }, [isWaiting, displayText]);

    // Handle incoming chunks - add to buffer
    useEffect(() => {
        if (!chunkData) return;

        if (chunkData.finished) {
            isFinishedRef.current = true;
        } else {
            // First chunk received - notify stream started
            if (!bufferRef.current && !displayTextRef.current && onStreamStart) {
                onStreamStart();
            }
            // Add to buffer and start typing
            bufferRef.current += chunkData.text;
            if (!isTyping) {
                setIsTyping(true);
            }
        }
    }, [chunkData]);

    // Typewriter effect - consume buffer char by char
    useEffect(() => {
        if (!isTyping) return;

        const typeNextChar = () => {
            if (bufferRef.current.length > 0) {
                // Consume one character from buffer
                const nextChar = bufferRef.current[0];
                bufferRef.current = bufferRef.current.slice(1);
                displayTextRef.current += nextChar;
                setDisplayText(displayTextRef.current);

                // Adaptive speed: faster if buffer is long, slower if short
                const bufferLen = bufferRef.current.length;
                let delay;
                if (bufferLen > 50) {
                    delay = 5;  // Very fast
                } else if (bufferLen > 20) {
                    delay = 15; // Fast
                } else if (bufferLen > 5) {
                    delay = 30; // Medium
                } else {
                    delay = 50; // Slow, but limited
                }

                setTimeout(typeNextChar, delay);
            } else if (isFinishedRef.current) {
                // Buffer empty and finished - complete message
                onMessageComplete(displayTextRef.current);
                displayTextRef.current = '';
                setDisplayText('');
                setIsTyping(false);
                isFinishedRef.current = false;
                bufferRef.current = '';
            } else {
                // Buffer empty but not finished - wait and check again
                setTimeout(typeNextChar, 50);
            }
        };

        typeNextChar();
    }, [isTyping]);

    // Don't show anything if not waiting and no text
    if (!isWaiting && !displayText) return null;

    const showCursor = displayText && !isFinishedRef.current;

    // Show thinking indicator as standalone when waiting but no text yet
    if (isWaiting && !displayText) {
        return (
            <div className="thinking-indicator thinking-indicator--standalone">
                <span className="processing-text-shimmer">thinking{dots}</span>
            </div>
        );
    }

    return (
        <div className="message ai-message ai-message--streaming">
            <div className="thinking-indicator">
                <span className="processing-text-shimmer">typing{dots}</span>
            </div>
            <div className="message-content message-markdown">
                <ReactMarkdown>{displayText}</ReactMarkdown>
                {showCursor && <span className="typewriter-cursor">_</span>}
            </div>
        </div>
    );
}

function UserInputArea({ onSendMessage, selectionData, onPreviewClick }) {
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
        <>
            {selectionData && (
                <div className="selection-preview" onClick={onPreviewClick}>
                    {selectionData.text}
                </div>
            )}
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
        </>
    );
}

export default function ChatBox({ chatHistory, isConnected }) {
    const [messages, setMessages] = useState([]);
    const [currentChunk, setCurrentChunk] = useState(null);
    const [selectionData, setSelectionData] = useState(null);
    const [isWaiting, setIsWaiting] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, currentChunk, isWaiting]);

    // Subscribe to TEXT_SELECT channel
    useEffect(() => {
        const unsubscribe = CommendDispatcher.Subscribe2Channel(
            ChannelEnum.TEXT_SELECT,
            (payload) => {
                setSelectionData(payload);
            }
        );
        return unsubscribe;
    }, []);

    // Subscribe to CHAT_MESSAGE channel for agent messages
    useEffect(() => {
        const unsubscribe = CommendDispatcher.Subscribe2Channel(
            ChannelEnum.CHAT_MESSAGE,
            (data) => {
                if (data.type === 'agent_message') {
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        user: 'AI',
                        text: data.text
                    }]);
                } else if (data.type === 'agent_chunk') {
                    setCurrentChunk(data);
                }
            }
        );
        return unsubscribe;
    }, []);

    const handlePreviewClick = () => {
        if (selectionData?.json) {
            console.log('Selection JSON:', JSON.stringify(selectionData.json, null, 2));
        }
    };

    const getConnectionStatus = () => {
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

    const handleMessageComplete = (completeText) => {
        setIsWaiting(false);
        setCurrentChunk(null);  // Clear chunk to prevent re-triggering
        setMessages(prev => [...prev, {
            id: Date.now(),
            user: 'AI',
            text: completeText
        }]);
    };

    const handleStreamStart = () => {
        // First chunk received, no longer in "thinking" state
        // (streaming text will show instead)
    };

    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        const userMessage = {
            id: Date.now(),
            user: 'You',
            text: text
        };
        setMessages(prev => [...prev, userMessage]);
        setIsWaiting(true);  // Show "Thinking..." immediately

        const payload = {
            type: "user_message",
            user: "default",
            text: text,
        };
        if (selectionData?.markdown) {
            payload.extra = { selected: selectionData.markdown };
        }
        CommendDispatcher.Publish2Channel(ChannelEnum.SOCKET_SEND, payload);
        setSelectionData(null);
    };

    const status = getConnectionStatus();

    return (
        <LiquidGlassDiv blurriness={0.5} variant="workspace">
            <div className="chat-panel-container">
                <div className="chat-header">
                    <h2 className="panel-title">Assistant</h2>
                    <div className="connection-status">
                        {status.color} {status.text}
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
                        isWaiting={isWaiting}
                        onStreamStart={handleStreamStart}
                    />
                    <div ref={messagesEndRef} />
                </LiquidGlassScrollBar>

                <UserInputArea
                    onSendMessage={handleSendMessage}
                    selectionData={selectionData}
                    onPreviewClick={handlePreviewClick}
                />
            </div>
        </LiquidGlassDiv>
    );
}
