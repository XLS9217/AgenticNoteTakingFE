import LiquidGlassDiv from "../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx";

export default function SourcePanel() {
    return (
        <LiquidGlassDiv blurriness={0.5}>
            <div style={{ padding: '0px', color: 'rgba(255, 255, 255, 0.9)' }}>
                Left Panel - Source
            </div>
        </LiquidGlassDiv>
    );
}
