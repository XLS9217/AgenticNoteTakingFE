import LiquidGlassDiv from "../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx";

export default function NotePanel() {
    return (
        <LiquidGlassDiv blurriness={0.5} variant="workspace">
            <div style={{ padding: '0px', color: 'rgba(255, 255, 255, 0.9)' }}>
                Center Panel - Note
            </div>
        </LiquidGlassDiv>
    );
}
