import LiquidGlassDiv from "../../../Components/LiquidGlassDiv.jsx";

export default function NotePanel({ note }) {

    return <LiquidGlassDiv isButton={false}>
        <div className="panel-container">
            <h2 className="panel-title">Note</h2>
            <p className="panel-content">{note || 'No notes yet...'}</p>
        </div>
    </LiquidGlassDiv>

}