import { useState } from "react";
import LiquidGlassDiv from "../../../Components/LiquidGlassDiv.jsx";
import LiquidGlassInnerTabDiv from "../../../Components/LiquidGlassInnerTabDiv.jsx";
import LiquidGlassScrollBar from "../../../Components/LiquidGlassScrollBar.jsx";
import { updateSpeakerName, getMetadata } from "../../../Api/gateway.js";

export default function NotePanel({ note, metadata, workspaceId, onMetadataUpdate, onRefreshProcessedTranscript }) {
    const [activeTab, setActiveTab] = useState('Note');
    const [editingSpeaker, setEditingSpeaker] = useState(null);
    const [editedName, setEditedName] = useState('');

    const handleSpeakerClick = (speakerName) => {
        setEditingSpeaker(speakerName);
        setEditedName(speakerName);
    };

    const handleSpeakerSave = async (oldName) => {
        if (!editedName || editedName === oldName) {
            setEditingSpeaker(null);
            return;
        }

        try {
            await updateSpeakerName(workspaceId, oldName, editedName);
            const response = await getMetadata(workspaceId);
            if (onMetadataUpdate) {
                onMetadataUpdate(response.metadata);
            }
            if (onRefreshProcessedTranscript) {
                onRefreshProcessedTranscript();
            }
            setEditingSpeaker(null);
        } catch (error) {
            console.error('Failed to update speaker name:', error);
            setEditingSpeaker(null);
        }
    };

    const handleKeyDown = (e, oldName) => {
        if (e.key === 'Enter') {
            handleSpeakerSave(oldName);
        } else if (e.key === 'Escape') {
            setEditingSpeaker(null);
        }
    };

    return <LiquidGlassDiv isButton={false}>
        <div className="panel-container">
            <h2 className="panel-title">Note</h2>
            <div style={{ marginBottom: '12px' }}>
                <LiquidGlassInnerTabDiv
                    tabs={['Note', 'Metadata']}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            </div>
            {activeTab === 'Note' ? (
                <p className="panel-content">{note || 'No notes yet...'}</p>
            ) : (
                metadata && metadata.speaker_list ? (
                    <LiquidGlassScrollBar>
                        <div className="panel-content" style={{ paddingRight: 'var(--spacing-xs)' }}>
                            <h3 style={{ fontSize: '1.2em', marginBottom: '12px', color: 'rgba(255, 255, 255, 0.95)' }}>Speakers</h3>
                            {metadata.speaker_list.map((speaker, index) => (
                                <div
                                    key={index}
                                    className="speaker-card"
                                >
                                    <img
                                        src="/icons/user.png"
                                        alt="Speaker"
                                        className="speaker-icon"
                                    />
                                    <div className="speaker-info">
                                        {editingSpeaker === speaker.name ? (
                                            <input
                                                type="text"
                                                className="speaker-name-input"
                                                value={editedName}
                                                onChange={(e) => setEditedName(e.target.value)}
                                                onBlur={() => handleSpeakerSave(speaker.name)}
                                                onKeyDown={(e) => handleKeyDown(e, speaker.name)}
                                                autoFocus
                                            />
                                        ) : (
                                            <div className="speaker-name" onClick={() => handleSpeakerClick(speaker.name)}>
                                                {speaker.name}
                                            </div>
                                        )}
                                        <div className="speaker-description">
                                            {speaker.description || 'no description...'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </LiquidGlassScrollBar>
                ) : (
                    <p className="panel-content">No metadata yet...</p>
                )
            )}
        </div>
    </LiquidGlassDiv>

}