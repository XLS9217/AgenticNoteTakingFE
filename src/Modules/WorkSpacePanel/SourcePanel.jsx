import { useEffect, useState, useCallback } from "react";
import LiquidGlassDiv from "../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx";
import LiquidGlassScrollBar from "../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx";
import LiquidGlassInnerTextButton from "../../Components/LiquidGlassInner/LiquidGlassInnerTextButton.jsx";
import CommendDispatcher, { ChannelEnum } from "../../Util/CommendDispatcher.js";
import { updateTranscript, getProcessedTranscript, getMetadata } from "../../Api/gateway.js";

// Raw Transcript Upload Component
function RawTranscriptUpload({ rawTranscript, setRawTranscript, onSave }) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setRawTranscript(event.target.result);
                };
                reader.readAsText(file);
            } else {
                alert('Please drop a .txt file');
            }
        }
    };

    return (
        <div className="transcript-edit-container">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`transcript-dropzone ${isDragging ? 'transcript-dropzone--dragging' : ''}`}
            >
                Drop .txt file here
            </div>
            <LiquidGlassScrollBar className="transcript-edit-scrollbar">
                <textarea
                    className="transcript-textarea-edit"
                    value={rawTranscript}
                    onChange={(e) => setRawTranscript(e.target.value)}
                    placeholder="Paste your transcript here..."
                    rows={20}
                />
            </LiquidGlassScrollBar>
            <div className="transcript-header-buttons">
                <LiquidGlassInnerTextButton onClick={onSave}>
                    Save Transcript
                </LiquidGlassInnerTextButton>
            </div>
        </div>
    );
}

// Processed Transcript Section Component
function ProcessedTranscriptSection({ utterances }) {
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

// Metadata Section Component (Topics + Speakers stacked)
function MetadataSection({ topics, speakers }) {
    const handleScrollToTopic = (topicTitle) => {
        const topicElements = document.querySelectorAll('.source-topic-card .topic-title');
        const targetElement = Array.from(topicElements).find(
            el => el.textContent === topicTitle
        );

        if (targetElement) {
            const topicCard = targetElement.closest('.source-topic-card');
            topicCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            topicCard.classList.add('topic-card--highlighted');
            setTimeout(() => {
                topicCard.classList.remove('topic-card--highlighted');
            }, 1500);
        }
    };

    const handleScrollToSpeaker = (speakerName) => {
        const speakerElements = document.querySelectorAll('.source-speaker-card .speaker-title');
        const targetElement = Array.from(speakerElements).find(
            el => el.textContent === speakerName
        );

        if (targetElement) {
            const speakerCard = targetElement.closest('.source-speaker-card');
            speakerCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            speakerCard.classList.add('topic-card--highlighted');
            setTimeout(() => {
                speakerCard.classList.remove('topic-card--highlighted');
            }, 1500);
        }
    };

    useEffect(() => {
        const unsubscribe = CommendDispatcher.Subscribe2Channel(
            ChannelEnum.DISPLAY_CONTROL,
            (payload) => {
                if (payload.action === 'scroll-to-topic' && payload.topic) {
                    handleScrollToTopic(payload.topic);
                } else if (payload.action === 'scroll-to-speaker' && payload.speaker) {
                    handleScrollToSpeaker(payload.speaker);
                }
            }
        );
        return unsubscribe;
    }, [topics, speakers]);

    return (
        <LiquidGlassScrollBar className="metadata-section">
            {/* Topics */}
            <div className="metadata-group-title">Topics</div>
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

            {/* Speakers */}
            <div className="metadata-group-title">Speakers</div>
            {speakers.length > 0 ? (
                speakers.map((speaker, index) => (
                    <div key={index} className="source-speaker-card">
                        <div className="topic-header">
                            <img src="/icons/user.png" alt="Speaker" className="topic-icon" />
                            <div className="speaker-title">{speaker.name}</div>
                        </div>
                        <div className="topic-summary">{speaker.description}</div>
                    </div>
                ))
            ) : (
                <p className="source-empty-state">No speakers available...</p>
            )}
        </LiquidGlassScrollBar>
    );
}

// Main SourcePanel Component
export default function SourcePanel({ workspaceId, processedTranscript, metadata }) {
    const [rawTranscript, setRawTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processStatus, setProcessStatus] = useState(null);
    const [fetchedTranscript, setFetchedTranscript] = useState(null);
    const [fetchedMetadata, setFetchedMetadata] = useState(null);

    const utterances = fetchedTranscript || processedTranscript || [];
    const topics = fetchedMetadata?.topics_list || metadata?.topics_list || [];
    const speakers = fetchedMetadata?.speaker_list || metadata?.speaker_list || [];
    const hasTranscript = utterances && utterances.length > 0;

    const fetchProcessedTranscript = useCallback(async () => {
        try {
            const response = await getProcessedTranscript(workspaceId);
            setFetchedTranscript(response.processed_transcript);
        } catch (error) {
            console.error('Failed to fetch processed transcript:', error);
        }
    }, [workspaceId]);

    const fetchMetadata = useCallback(async () => {
        try {
            const response = await getMetadata(workspaceId);
            setFetchedMetadata(response.metadata);
        } catch (error) {
            console.error('Failed to fetch metadata:', error);
        }
    }, [workspaceId]);

    const handleSaveTranscript = async () => {
        if (!workspaceId) {
            console.error('No workspace ID provided');
            return;
        }
        try {
            await updateTranscript(workspaceId, rawTranscript);
            console.log('Transcript saved successfully');
        } catch (error) {
            console.error('Failed to save transcript:', error);
        }
    };

    const handleProcess = () => {
        setIsProcessing(true);
        setProcessStatus('Starting');
        CommendDispatcher.Publish2Channel(ChannelEnum.SOCKET_SEND, {
            type: "workspace_message",
            sub_type: "process_transcript"
        });
    };

    useEffect(() => {
        if (processedTranscript && processedTranscript.length > 0) {
            setFetchedTranscript(processedTranscript);
        }
    }, [processedTranscript]);

    useEffect(() => {
        if (metadata) {
            setFetchedMetadata(metadata);
        }
    }, [metadata]);

    // Subscribe to PROCESS_STATUS channel
    useEffect(() => {
        const unsubscribe = CommendDispatcher.Subscribe2Channel(
            ChannelEnum.PROCESS_STATUS,
            (data) => {
                const status = data.status;
                setProcessStatus(status);

                if (status === 'Done') {
                    setIsProcessing(false);
                    fetchProcessedTranscript();
                    fetchMetadata();
                } else if (status === 'Error' || status === 'None') {
                    setIsProcessing(false);
                } else {
                    setIsProcessing(true);
                }
            }
        );
        return unsubscribe;
    }, [fetchProcessedTranscript, fetchMetadata]);

    return (
        <LiquidGlassDiv blurriness={0.5} variant="workspace">
            <div className="source-panel-container">
                {/* Header Section */}
                <div className="source-header">
                    <h2 className="source-title">Source</h2>
                </div>

                {!hasTranscript ? (
                    <>
                        <RawTranscriptUpload
                            rawTranscript={rawTranscript}
                            setRawTranscript={setRawTranscript}
                            onSave={handleSaveTranscript}
                        />
                        <div className="transcript-header-buttons" style={{ marginTop: '8px' }}>
                            <LiquidGlassInnerTextButton onClick={handleProcess}>
                                Process
                            </LiquidGlassInnerTextButton>
                        </div>
                        {isProcessing && (
                            <div className="transcript-empty-state">
                                <div className="processing-text-shimmer">
                                    {processStatus || 'Processing'}...
                                </div>
                            </div>
                        )}
                        {processStatus === 'Error' && (
                            <div className="transcript-empty-state">
                                <p className="panel-content">There is an error</p>
                            </div>
                        )}
                        {processStatus === 'None' && (
                            <div className="transcript-empty-state">
                                <p className="panel-content">You need to fill the raw transcript</p>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Processed Transcript Section */}
                        <ProcessedTranscriptSection utterances={utterances} />

                        {/* Divider */}
                        <div className="source-divider"></div>

                        {/* Topics/Speakers Section */}
                        <MetadataSection topics={topics} speakers={speakers} />
                    </>
                )}
            </div>
        </LiquidGlassDiv>
    );
}
