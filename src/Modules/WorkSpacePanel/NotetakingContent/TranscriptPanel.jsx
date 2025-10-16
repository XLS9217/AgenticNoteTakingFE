import LiquidGlassDiv from "../../../Components/LiquidGlassDiv.jsx";

export default function TranscriptPanel({ transcript }) {

    return <LiquidGlassDiv isButton={false}>
        <div className="panel-container">
            <h2 className="panel-title">Transcript</h2>
            <p className="panel-content"> 'No notes yet...'</p>
        </div>
    </LiquidGlassDiv>

}