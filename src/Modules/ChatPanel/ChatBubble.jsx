import { useState, useEffect } from "react";

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

export function RunningMessage({ chunkData, onMessageComplete }) {
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

    if (!runningText) return null;

    return (
        <div className="message ai-message">
            <div className="message-content">
                <span className="message-text">{runningText}</span>
            </div>
        </div>
    );
}
