import { useEffect, useState, useCallback } from "react";
import LiquidGlassScrollBar from "../../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx";
import LiquidGlassInnerTextButton from "../../../Components/LiquidGlassInner/LiquidGlassInnerTextButton.jsx";
import CommendDispatcher, { ChannelEnum } from "../../../Util/CommendDispatcher.js";
import {
    updateSourceRaw,
    getSourceProcessed,
    getSourceMetadata
} from "../../../Api/gateway.js";

// Raw Content Upload (shown when not processed yet)
function RawContentUpload({ rawContent, onChange, onProcess, isProcessing, processStatus }) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = (event) => onChange(event.target.result);
            reader.readAsText(files[0]);
        }
    };

    return (
        <div className="transcript-edit-container">
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={handleDrop}
                className={`transcript-dropzone ${isDragging ? 'transcript-dropzone--dragging' : ''}`}
            >
                Drop .txt file here
            </div>
            <LiquidGlassScrollBar className="transcript-edit-scrollbar">
                <textarea
                    className="transcript-textarea-edit"
                    value={rawContent}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Paste your transcript here..."
                    rows={20}
                />
            </LiquidGlassScrollBar>
            <div className="transcript-header-buttons">
                <LiquidGlassInnerTextButton onClick={onProcess} disabled={isProcessing}>
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
        </div>
    );
}

// Processed Transcript Section (with clickable speaker/topic)
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

// Metadata Section (Topics + Speakers stacked)
function MetadataSection({ topics, speakers }) {
    const handleScrollToTopic = (topicTitle) => {
        const topicElements = document.querySelectorAll('.source-topic-card .topic-title');
        const targetElement = Array.from(topicElements).find(el => el.textContent === topicTitle);
        if (targetElement) {
            const topicCard = targetElement.closest('.source-topic-card');
            topicCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            topicCard.classList.add('topic-card--highlighted');
            setTimeout(() => topicCard.classList.remove('topic-card--highlighted'), 1500);
        }
    };

    const handleScrollToSpeaker = (speakerName) => {
        const speakerElements = document.querySelectorAll('.source-speaker-card .speaker-title');
        const targetElement = Array.from(speakerElements).find(el => el.textContent === speakerName);
        if (targetElement) {
            const speakerCard = targetElement.closest('.source-speaker-card');
            speakerCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            speakerCard.classList.add('topic-card--highlighted');
            setTimeout(() => speakerCard.classList.remove('topic-card--highlighted'), 1500);
        }
    };

    useEffect(() => {
        const unsubscribe = CommendDispatcher.Subscribe2Channel(ChannelEnum.DISPLAY_CONTROL, (payload) => {
            if (payload.action === 'scroll-to-topic' && payload.topic) {
                handleScrollToTopic(payload.topic);
            } else if (payload.action === 'scroll-to-speaker' && payload.speaker) {
                handleScrollToSpeaker(payload.speaker);
            }
        });
        return unsubscribe;
    }, [topics, speakers]);

    return (
        <LiquidGlassScrollBar className="metadata-section">
            <div className="metadata-group-title">Topics</div>
            {topics.length > 0 ? topics.map((topic, index) => (
                <div key={index} className="source-topic-card">
                    <div className="topic-header">
                        <img src="/icons/topics.png" alt="Topic" className="topic-icon" />
                        <div className="topic-title">{topic.title}</div>
                    </div>
                    <div className="topic-summary">{topic.summary}</div>
                </div>
            )) : <p className="source-empty-state">No topics available...</p>}

            <div className="metadata-group-title">Speakers</div>
            {speakers.length > 0 ? speakers.map((speaker, index) => (
                <div key={index} className="source-speaker-card">
                    <div className="topic-header">
                        <img src="/icons/user.png" alt="Speaker" className="topic-icon" />
                        <div className="speaker-title">{speaker.name}</div>
                    </div>
                    <div className="topic-summary">{speaker.description}</div>
                </div>
            )) : <p className="source-empty-state">No speakers available...</p>}
        </LiquidGlassScrollBar>
    );
}

// Main TranscriptPanel - shows content for a single source
export default function TranscriptPanel({ source, workspaceId }) {
    const [rawContent, setRawContent] = useState(source.raw_content || '');
    const [processed, setProcessed] = useState([]);
    const [speakers, setSpeakers] = useState([]);
    const [topics, setTopics] = useState([]);
    const [status, setStatus] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const sourceId = source.source_id;
    const hasProcessed = processed.length > 0;

    const fetchData = useCallback(async () => {
        try {
            console.log('[TranscriptPanel] Fetching data for source:', sourceId);
            console.log('[TranscriptPanel] Calling getSourceProcessed & getSourceMetadata...');
            const [procRes, metaRes] = await Promise.all([
                getSourceProcessed(workspaceId, sourceId),
                getSourceMetadata(workspaceId, sourceId)
            ]);
            console.log('[TranscriptPanel] getSourceProcessed response:', procRes);
            console.log('[TranscriptPanel] getSourceMetadata response:', metaRes);
            setProcessed(procRes.processed || []);
            setSpeakers(metaRes.speaker_list || []);
            setTopics(metaRes.topics_list || []);
        } catch (err) {
            console.error('Failed to fetch source data:', err);
        }
    }, [workspaceId, sourceId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const unsubscribe = CommendDispatcher.Subscribe2Channel(ChannelEnum.PROCESS_STATUS, (data) => {
            if (data.source_id === sourceId) {
                setStatus(data.status);
                if (data.status === 'Done') {
                    setIsProcessing(false);
                    fetchData();
                } else if (data.status === 'Error' || data.status === 'None') {
                    setIsProcessing(false);
                } else {
                    setIsProcessing(true);
                }
            }
        });
        return unsubscribe;
    }, [sourceId, fetchData]);

    const handleProcess = async () => {
        try {
            // Save first, then process
            await updateSourceRaw(workspaceId, sourceId, rawContent);
            setStatus('Starting');
            setIsProcessing(true);
            CommendDispatcher.Publish2Channel(ChannelEnum.SOCKET_SEND, {
                type: "workspace_message",
                sub_type: "process_transcript",
                source_id: sourceId
            });
        } catch (err) {
            console.error('Failed to save:', err);
        }
    };

    if (!hasProcessed) {
        return (
            <RawContentUpload
                rawContent={rawContent}
                onChange={setRawContent}
                onProcess={handleProcess}
                isProcessing={isProcessing}
                processStatus={status}
            />
        );
    }

    return (
        <>
            <ProcessedTranscriptSection utterances={processed} />
            <div className="source-divider"></div>
            <MetadataSection topics={topics} speakers={speakers} />
        </>
    );
}
