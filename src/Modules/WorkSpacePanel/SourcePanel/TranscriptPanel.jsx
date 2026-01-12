import { useEffect, useState, useCallback, useRef } from "react";
import LiquidGlassScrollBar from "../../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx";
import LiquidGlassInnerTextButton from "../../../Components/LiquidGlassInner/LiquidGlassInnerTextButton.jsx";
import CommendDispatcher, { ChannelEnum } from "../../../Util/CommendDispatcher.js";
import {
    updateSourceRaw,
    getSourceProcessed,
    getSourceMetadata,
    getSpeakerCandidates,
    updateSpeakerName,
    appendSpeakerCandidate,
    deleteSpeakerCandidate
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
function MetadataSection({ topics, speakers, workspaceId, sourceId, onSpeakerUpdate }) {
    const [currentSection, setCurrentSection] = useState('Topics');
    const [editingSpeaker, setEditingSpeaker] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [customInput, setCustomInput] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const scrollRef = useRef(null);
    const editRef = useRef(null);

    useEffect(() => {
        const node = scrollRef.current;
        if (!node) return;
        const handleScroll = () => {
            const speakersTitle = node.querySelector('.metadata-group-title--speakers');
            if (speakersTitle) {
                const rect = speakersTitle.getBoundingClientRect();
                const containerRect = node.getBoundingClientRect();
                setCurrentSection(rect.top <= containerRect.top + 100 ? 'Speakers' : 'Topics');
            }
        };
        node.addEventListener('scroll', handleScroll);
        return () => node.removeEventListener('scroll', handleScroll);
    }, []);

    // Click outside to close - only when clicking outside the speaker card
    useEffect(() => {
        if (!editingSpeaker) return;
        const handleClickOutside = (e) => {
            const speakerCard = editRef.current?.closest('.source-speaker-card');
            if (speakerCard && !speakerCard.contains(e.target)) {
                setEditingSpeaker(null);
                setCandidates([]);
                setShowCustomInput(false);
                setCustomInput('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [editingSpeaker]);

    const handleSpeakerClick = async (speakerName) => {
        if (editingSpeaker === speakerName) {
            setEditingSpeaker(null);
            setCandidates([]);
            return;
        }
        setEditingSpeaker(speakerName);
        setShowCustomInput(false);
        setCustomInput('');
        try {
            const res = await getSpeakerCandidates(workspaceId, sourceId, speakerName);
            setCandidates(res.name_candidate || []);
        } catch (err) {
            console.error('Failed to get candidates:', err);
            setCandidates([]);
        }
    };

    const handleSelectCandidate = async (oldName, newName) => {
        if (oldName === newName) {
            setEditingSpeaker(null);
            setCandidates([]);
            return;
        }
        try {
            await updateSpeakerName(workspaceId, sourceId, oldName, newName);
            setEditingSpeaker(null);
            setCandidates([]);
            onSpeakerUpdate?.();
        } catch (err) {
            console.error('Failed to update speaker name:', err);
        }
    };

    const handleDeleteCandidate = async (speakerName, candidate, e) => {
        e.stopPropagation();
        try {
            await deleteSpeakerCandidate(workspaceId, sourceId, speakerName, candidate);
            setCandidates(prev => prev.filter(c => c !== candidate));
        } catch (err) {
            console.error('Failed to delete candidate:', err);
        }
    };

    const handleAddCandidate = async (speakerName) => {
        if (!customInput.trim()) return;
        try {
            await appendSpeakerCandidate(workspaceId, sourceId, speakerName, customInput.trim());
            setCandidates(prev => [...prev, customInput.trim()]);
            setCustomInput('');
            setShowCustomInput(false);
        } catch (err) {
            console.error('Failed to add candidate:', err);
        }
    };

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
        const speakerElements = document.querySelectorAll('.source-speaker-card .speaker-candidate-tag--main');
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
        <div className="metadata-wrapper">
            <div className="metadata-sticky-header">{currentSection}</div>
            <LiquidGlassScrollBar className="metadata-section" ref={scrollRef}>
                <div className={`metadata-group-title metadata-group-title--topics ${currentSection === 'Topics' ? 'metadata-group-title--hidden' : ''}`}>Topics</div>
                {topics.length > 0 ? topics.map((topic, index) => (
                    <div key={index} className="source-topic-card">
                        <div className="topic-header">
                            <img src="/icons/topics.png" alt="Topic" className="topic-icon" />
                            <div className="topic-title">{topic.title}</div>
                        </div>
                        <div className="topic-summary">{topic.summary}</div>
                    </div>
                )) : <p className="source-empty-state">No topics available...</p>}

                <div className={`metadata-group-title metadata-group-title--speakers ${currentSection === 'Speakers' ? 'metadata-group-title--hidden' : ''}`}>Speakers</div>
                {speakers.length > 0 ? speakers.map((speaker, index) => (
                    <div key={index} className="source-speaker-card">
                        <div className="topic-header">
                            <img src="/icons/user.png" alt="Speaker" className="topic-icon" />
                            <div
                                className="speaker-name-tags"
                                ref={editingSpeaker === speaker.name ? editRef : null}
                            >
                                <span
                                    className={`speaker-candidate-tag speaker-candidate-tag--main ${editingSpeaker === speaker.name ? 'speaker-candidate-tag--active' : ''}`}
                                    onClick={() => handleSpeakerClick(speaker.name)}
                                >
                                    {speaker.name}
                                </span>
                                {editingSpeaker === speaker.name && (
                                    <>
                                        {candidates.map((candidate, i) => (
                                            <span
                                                key={i}
                                                className="speaker-candidate-tag speaker-candidate-tag--candidate"
                                                onClick={(e) => { e.stopPropagation(); handleSelectCandidate(speaker.name, candidate); }}
                                            >
                                                {candidate}
                                                <span
                                                    className="speaker-candidate-tag-delete"
                                                    onClick={(e) => handleDeleteCandidate(speaker.name, candidate, e)}
                                                >
                                                    ×
                                                </span>
                                            </span>
                                        ))}
                                        {showCustomInput ? (
                                            <input
                                                type="text"
                                                className="speaker-candidate-input"
                                                value={customInput}
                                                onChange={(e) => setCustomInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddCandidate(speaker.name)}
                                                onBlur={() => { if (!customInput.trim()) setShowCustomInput(false); }}
                                                onClick={(e) => e.stopPropagation()}
                                                placeholder="Name..."
                                                autoFocus
                                            />
                                        ) : (
                                            <span
                                                className="speaker-candidate-tag speaker-candidate-tag--add"
                                                onClick={(e) => { e.stopPropagation(); setShowCustomInput(true); }}
                                            >
                                                +
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="topic-summary">{speaker.description}</div>
                    </div>
                )) : <p className="source-empty-state">No speakers available...</p>}
            </LiquidGlassScrollBar>
        </div>
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
            <MetadataSection
                topics={topics}
                speakers={speakers}
                workspaceId={workspaceId}
                sourceId={sourceId}
                onSpeakerUpdate={fetchData}
            />
        </>
    );
}
