import { useState } from "react";
import LiquidGlassDiv from "../../../Components/LiquidGlassDiv.jsx";
import LiquidGlassInnerTextButton from "../../../Components/LiquidGlassInnerTextButton.jsx";

export default function NotePanel({ note, metadata }) {
    const [showMetadata, setShowMetadata] = useState(true);

    return <LiquidGlassDiv isButton={false}>
        <div className="panel-container">
            <h2 className="panel-title">Note</h2>
            <div className="transcript-header-buttons" style={{ marginBottom: '8px' }}>
                <LiquidGlassInnerTextButton onClick={() => setShowMetadata(!showMetadata)}>
                    {showMetadata ? 'Show Empty' : 'Show Metadata'}
                </LiquidGlassInnerTextButton>
            </div>
            {showMetadata ? (
                metadata ? (
                    <div className="panel-content" style={{ marginBottom: '16px' }}>
                        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9em', marginTop: '8px' }}>
                            {JSON.stringify(metadata, null, 2)}
                        </pre>
                    </div>
                ) : (
                    <p className="panel-content">No metadata yet...</p>
                )
            ) : (
                <div className="panel-content">
                    <p>it's empty</p>
                </div>
            )}
            <p className="panel-content">{note || 'No notes yet...'}</p>
        </div>
    </LiquidGlassDiv>

}