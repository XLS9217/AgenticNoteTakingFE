import { useEffect } from "react";
import LiquidGlassDiv from "../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx";
import LiquidGlassScrollBar from "../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx";
import CommendDispatcher, { ChannelEnum } from "../../Util/CommendDispatcher.js";

// Processed Transcript Section Component
function ProcessedTranscriptSection({ utterances }) {
    const handleUtteranceClick = (topic) => {
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
                    <div
                        key={index}
                        className={`transcript-entry ${item.topic ? 'transcript-entry--clickable' : ''}`}
                        onClick={() => handleUtteranceClick(item.topic)}
                        title={item.topic ? `Click to scroll to topic: ${item.topic}` : ''}
                    >
                        <div className="transcript-entry-header">
                            <img src="/icons/user.png" alt="Speaker" className="speaker-icon-small" />
                            <span className="transcript-speaker">{item.speaker}</span>
                            <span className="transcript-timestamp">{item.timestamp}</span>
                        </div>
                        {item.topic && (
                            <span className="transcript-topic-tag" title={item.topic}>{item.topic}</span>
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

// Topics Section Component
function TopicsSection({ topics }) {
    const handleScrollToTopic = (topicTitle) => {
        const topicElements = document.querySelectorAll('.source-topic-card .topic-title');
        const targetElement = Array.from(topicElements).find(
            el => el.textContent === topicTitle
        );

        if (targetElement) {
            const topicCard = targetElement.closest('.source-topic-card');

            topicCard.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            topicCard.classList.add('topic-card--highlighted');
            setTimeout(() => {
                topicCard.classList.remove('topic-card--highlighted');
            }, 1500);
        }
    };

    useEffect(() => {
        const unsubscribe = CommendDispatcher.Subscribe2Channel(
            ChannelEnum.DISPLAY_CONTROL,
            (payload) => {
                if (payload.action === 'scroll-to-topic' && payload.topic) {
                    handleScrollToTopic(payload.topic);
                }
            }
        );
        return unsubscribe;
    }, [topics]);

    return (
        <LiquidGlassScrollBar className="source-topics-section">
            {topics.length > 0 ? (
                topics.map((topic, index) => (
                    <div key={index} className="source-topic-card">
                        <div className="topic-header">
                            <img src="/icons/topics.png" alt="Topic" className="topic-icon" />
                            <div className="topic-title">{topic.title}</div>
                        </div>
                        <div className="topic-summary">{topic.summary}</div>
                    </div>
                ))
            ) : (
                <p className="source-empty-state">No topics available...</p>
            )}
        </LiquidGlassScrollBar>
    );
}

// Main SourcePanel Component
export default function SourcePanel({ processedTranscript, metadata, fileName }) {
    const utterances = processedTranscript || [];
    const topics = metadata?.topics_list || [];

    return (
        <LiquidGlassDiv blurriness={0.5} variant="workspace">
            <div className="source-panel-container">
                {/* Header Section */}
                <div className="source-header">
                    <h2 className="source-title">Source</h2>
                    <div className="source-filename">{fileName || 'No file'}</div>
                </div>

                {/* Processed Transcript Section */}
                <ProcessedTranscriptSection utterances={utterances} />

                {/* Divider */}
                <div className="source-divider"></div>

                {/* Topics Section */}
                <TopicsSection topics={topics} />
            </div>
        </LiquidGlassDiv>
    );
}
