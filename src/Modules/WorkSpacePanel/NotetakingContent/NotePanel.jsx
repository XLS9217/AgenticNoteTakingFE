import LiquidGlassDiv from "../../../Components/LiquidGlassDiv.jsx";

export default function NotePanel({ note, metadata }) {

    return <LiquidGlassDiv isButton={false}>
        <div className="panel-container">
            <h2 className="panel-title">Note</h2>
            {metadata && (
                <div className="panel-content" style={{ marginBottom: '16px' }}>
                    <strong>Metadata:</strong>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9em', marginTop: '8px' }}>
                        {JSON.stringify(metadata, null, 2)}
                    </pre>
                </div>
            )}
            <p className="panel-content">{note || 'No notes yet...'}</p>
        </div>
    </LiquidGlassDiv>

}