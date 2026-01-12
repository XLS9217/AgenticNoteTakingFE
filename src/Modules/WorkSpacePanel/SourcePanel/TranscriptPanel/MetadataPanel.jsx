import { useEffect, useState, useRef } from "react";
import LiquidGlassScrollBar from "../../../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx";
import CommendDispatcher, { ChannelEnum } from "../../../../Util/CommendDispatcher.js";
import {
    getSpeakerCandidates,
    updateSpeakerName,
    appendSpeakerCandidate,
    deleteSpeakerCandidate
} from "../../../../Api/gateway.js";

// Topic List Component
function TopicList({ topics }) {
    return (
        <>
            {topics.length > 0 ? topics.map((topic, index) => (
                <div key={index} className="source-topic-card">
                    <div className="topic-header">
                        <img src="/icons/topics.png" alt="Topic" className="topic-icon" />
                        <div className="topic-title">{topic.title}</div>
                    </div>
                    <div className="topic-summary">{topic.summary}</div>
                </div>
            )) : <p className="source-empty-state">No topics available...</p>}
        </>
    );
}

// Speaker List Component
function SpeakerList({ speakers, workspaceId, sourceId, onSpeakerUpdate }) {
    const [editingSpeaker, setEditingSpeaker] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [customInput, setCustomInput] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [error, setError] = useState(null);
    const editRef = useRef(null);

    // Click outside to close - only when clicking outside the speaker card
    useEffect(() => {
        if (!editingSpeaker) return;
        const handleClickOutside = (e) => {
            // Check if click is on any speaker-related element
            const isOnSpeakerElement = e.target.closest('.speaker-name-tags') ||
                e.target.closest('.speaker-candidate-tag') ||
                e.target.closest('.speaker-candidate-input');
            if (isOnSpeakerElement) return;

            setEditingSpeaker(null);
            setCandidates([]);
            setShowCustomInput(false);
            setCustomInput('');
            setError(null);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [editingSpeaker]);

    const handleSpeakerClick = async (speakerName) => {
        if (editingSpeaker === speakerName) {
            setEditingSpeaker(null);
            setCandidates([]);
            setError(null);
            return;
        }
        setEditingSpeaker(speakerName);
        setShowCustomInput(false);
        setCustomInput('');
        setError(null);
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
            setError(null);
        } catch (err) {
            console.error('Failed to add candidate:', err);
            setError(err.response?.data?.detail || err.message || 'Failed to add candidate');
        }
    };

    return (
        <>
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
                                            className={`speaker-candidate-input ${error && editingSpeaker === speaker.name ? 'speaker-candidate-input--error' : ''}`}
                                            value={customInput}
                                            onChange={(e) => { setCustomInput(e.target.value); setError(null); }}
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
                    {error && editingSpeaker === speaker.name && (
                        <div className="speaker-error-message">{error}</div>
                    )}
                    <div className="topic-summary">{speaker.description}</div>
                </div>
            )) : <p className="source-empty-state">No speakers available...</p>}
        </>
    );
}

// Main Metadata Panel
export default function MetadataPanel({ topics, speakers, workspaceId, sourceId, onSpeakerUpdate }) {
    const [currentSection, setCurrentSection] = useState('Topics');
    const scrollRef = useRef(null);

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
                <TopicList topics={topics} />

                <div className={`metadata-group-title metadata-group-title--speakers ${currentSection === 'Speakers' ? 'metadata-group-title--hidden' : ''}`}>Speakers</div>
                <SpeakerList
                    speakers={speakers}
                    workspaceId={workspaceId}
                    sourceId={sourceId}
                    onSpeakerUpdate={onSpeakerUpdate}
                />
            </LiquidGlassScrollBar>
        </div>
    );
}
