import LiquidGlassScrollBar from "../../../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx";
import CommendDispatcher, { ChannelEnum } from "../../../../Util/CommendDispatcher.js";

export default function ProcessedTranscriptPanel({ utterances }) {
    const handleSpeakerClick = (e, speaker) => {
        e.stopPropagation();
        if (!speaker) return;
        CommendDispatcher.Publish2Channel(ChannelEnum.DISPLAY_CONTROL, {
            action: 'scroll-to-speaker',
            speaker: speaker
        });
    };

    const handleTopicClick = (e, topic) => {
        e.stopPropagation();
        if (!topic) return;
        CommendDispatcher.Publish2Channel(ChannelEnum.DISPLAY_CONTROL, {
            action: 'scroll-to-topic',
            topic: topic
        });
    };

    return (
        <LiquidGlassScrollBar className="source-transcript-section">
            {utterances.length > 0 ? (
                utterances.map((item, index) => (
                    <div key={index} className="transcript-entry">
                        <div className="transcript-entry-header">
                            <img src="/icons/user.png" alt="Speaker" className="speaker-icon-small" />
                            <span
                                className="transcript-speaker transcript-speaker--clickable"
                                onClick={(e) => handleSpeakerClick(e, item.speaker)}
                                title={`Click to view ${item.speaker}'s info`}
                            >
                                {item.speaker}
                            </span>
                            <span className="transcript-timestamp">{item.timestamp}</span>
                        </div>
                        {item.topic && (
                            <span
                                className="transcript-topic-tag transcript-topic-tag--clickable"
                                onClick={(e) => handleTopicClick(e, item.topic)}
                                title={`Click to view topic: ${item.topic}`}
                            >
                                {item.topic}
                            </span>
                        )}
                        <div className="transcript-utterance">{item.utterance}</div>
                    </div>
                ))
            ) : (
                <p className="source-empty-state">No transcript available...</p>
            )}
        </LiquidGlassScrollBar>
    );
}
