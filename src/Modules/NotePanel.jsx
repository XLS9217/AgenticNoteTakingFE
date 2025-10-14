import LiquidGlassDiv from "../Components/LiquidGlassDiv.jsx";

export default function NotePanel() {

    return <LiquidGlassDiv isButton={false}>
        <div className="panel-container">
            <h2 className="panel-title">Note</h2>
            <p className="panel-content">this is the note</p>
        </div>
    </LiquidGlassDiv>

}