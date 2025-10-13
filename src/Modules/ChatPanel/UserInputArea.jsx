export default function UserInputArea() {
    return (
        <div className="chat-input-area">
            <textarea
                className="chat-textarea"
                placeholder="Start with an idea or task."
                rows={2}
            />
            <div className="input-controls">
                <div className="input-buttons">
                    <button className="control-button">+</button>
                    <button className="control-button">🌐</button>
                    <button className="control-button">📦</button>
                </div>
                <button className="send-button">Send</button>
            </div>
        </div>
    );
}
