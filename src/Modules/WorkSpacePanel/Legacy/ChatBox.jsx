import LiquidGlassDiv from "../../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx";

export default function ChatBox({ chatHistory, socket, isConnected }) {
    const getConnectionStatus = () => {
        if (!socket) return { color: '🟡', text: 'Loading...' };
        if (!isConnected) return { color: '🔴', text: 'Disconnected' };
        return { color: '🟢', text: 'Connected' };
    };

    const status = getConnectionStatus();

    return (
        <LiquidGlassDiv blurriness={0.5}>
            <div style={{ padding: '0px', color: 'rgba(255, 255, 255, 0.9)' }}>
                <div>{status.color} {status.text}</div>
            </div>
        </LiquidGlassDiv>
    );
}
