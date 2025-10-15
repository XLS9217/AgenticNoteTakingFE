import LiquidGlassDiv from "../../Components/LiquidGlassDiv.jsx";

export default function TranscriptPanel() {

    return <LiquidGlassDiv isButton={false}>
        <div className="panel-container">
            <h2 className="panel-title">Transcription</h2>
            <textarea
                className="transcription-textarea"
                placeholder="Transcription will appear here..."
            />
        </div>
    </LiquidGlassDiv>

}