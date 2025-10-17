import { useState } from "react";

export default function UserInputArea({ onSendMessage }) {
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
                className="chat-textarea"
                placeholder="Start with an idea or task."
                rows={2}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
            />
            <div className="input-controls">
                <div className="input-buttons">
                    <button className="control-button">+</button>
                    <button className="control-button">
                        <img src="/icons/icon_globe.png" alt="globe" style={{ width: '16px', height: '16px' }} />
                    </button>
                    <button className="control-button">
                        <img src="/icons/icon_suitcase.png" alt="suitcase" style={{ width: '16px', height: '16px' }} />
                    </button>
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
