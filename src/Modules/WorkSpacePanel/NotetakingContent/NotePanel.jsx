import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import LiquidGlassFlexibleDiv from '../../../Components/LiquidGlassOutter/LiquidGlassFlexibleDiv.jsx';
import LiquidGlassInnerTabDiv from '../../../Components/LiquidGlassInner/LiquidGlassInnerTabDiv.jsx';
import LiquidGlassScrollBar from '../../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx';
import { getMetadata, updateSpeakerName } from '../../../Api/gateway.js';
import { PanelType } from '../../../Components/PanelLayoutBar/PanelLayoutBarProvider.jsx';

const NOTE_TAB = 'Note';
const METADATA_TAB = 'Metadata';
const TABS = [NOTE_TAB, METADATA_TAB];

export default function NotePanel({
  note,
  metadata,
  workspaceId,
  onMetadataUpdate,
  onRefreshProcessedTranscript,
  onNoteChange
}) {
  const [activeTab, setActiveTab] = useState(NOTE_TAB);
  const [isMarkdownMode, setIsMarkdownMode] = useState(true);
  const [editedNote, setEditedNote] = useState(note || '');
  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [editedSpeakerName, setEditedSpeakerName] = useState('');

  useEffect(() => {
    setEditedNote(note || '');
  }, [note]);

  const handleNoteChange = (value) => {
    setEditedNote(value);
    if (onNoteChange) {
      onNoteChange(value);
    }
  };

  const handleToggleMode = () => {
    setIsMarkdownMode((prev) => !prev);
  };

  const handleSpeakerClick = (name) => {
    setEditingSpeaker(name);
    setEditedSpeakerName(name);
  };

  const handleSpeakerNameChange = (value) => {
    setEditedSpeakerName(value);
  };

  const resetSpeakerEditing = () => {
    setEditingSpeaker(null);
    setEditedSpeakerName('');
  };

  const handleSpeakerSave = async (originalName) => {
    const nextName = editedSpeakerName.trim();

    if (!nextName || nextName === originalName) {
      resetSpeakerEditing();
      return;
    }

    try {
      await updateSpeakerName(workspaceId, originalName, nextName);
      const response = await getMetadata(workspaceId);
      if (onMetadataUpdate) {
        onMetadataUpdate(response.metadata);
      }
      if (onRefreshProcessedTranscript) {
        onRefreshProcessedTranscript();
      }
    } catch (error) {
      console.error('Failed to update speaker name:', error);
    } finally {
      resetSpeakerEditing();
    }
  };

  const handleSpeakerKeyDown = (event, originalName) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSpeakerSave(originalName);
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      resetSpeakerEditing();
    }
  };
  return (
    <LiquidGlassFlexibleDiv isButton={false} variant={PanelType.NOTE_PANEL}>
      <div className="panel-container note-panel">
        <h2 className="panel-title">Note</h2>
        <div className="note-tabs">
          <LiquidGlassInnerTabDiv
            tabs={TABS}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        {activeTab === NOTE_TAB ? (
          <NoteTab
            note={editedNote}
            isMarkdownMode={isMarkdownMode}
            onToggleMode={handleToggleMode}
            onChange={handleNoteChange}
          />
        ) : (
          <MetadataTab
            metadata={metadata}
            editingSpeaker={editingSpeaker}
            editedName={editedSpeakerName}
            onSpeakerClick={handleSpeakerClick}
            onSpeakerChange={handleSpeakerNameChange}
            onSpeakerSave={handleSpeakerSave}
            onSpeakerKeyDown={handleSpeakerKeyDown}
          />
        )}
      </div>
    </LiquidGlassFlexibleDiv>
  );
}

function NoteTab({ note, isMarkdownMode, onToggleMode, onChange }) {
  const scrollClassName = isMarkdownMode
    ? 'note-panel-scroll note-panel-scroll--markdown'
    : 'note-panel-scroll note-panel-scroll--editor';

  return (
    <div className={`note-container ${!isMarkdownMode ? 'note-container--editing' : ''}`}>
      <button
        type="button"
        onClick={onToggleMode}
        title={isMarkdownMode ? 'Switch to plain text edit' : 'Switch to markdown'}
        className="note-toggle-button"
      >
        {'</>'}
      </button>
      <LiquidGlassScrollBar className={scrollClassName}>
        {isMarkdownMode ? (
          <div className="panel-content note-markdown-display">
            {note ? <ReactMarkdown>{note}</ReactMarkdown> : 'No notes yet...'}
          </div>
        ) : (
          <textarea
            className="note-textarea"
            value={note}
            onChange={(event) => onChange(event.target.value)}
            placeholder="No notes yet..."
          />
        )}
      </LiquidGlassScrollBar>
    </div>
  );
}

function MetadataTab({
  metadata,
  editingSpeaker,
  editedName,
  onSpeakerClick,
  onSpeakerChange,
  onSpeakerSave,
  onSpeakerKeyDown
}) {
    console.log("metadata", metadata);
  const topicList = metadata?.topics_list || [];
  console.log("topicList", topicList);
  const speakerList = metadata?.speaker_list || [];
  const hasTopics = Array.isArray(topicList) && topicList.length > 0;
  const hasSpeakers = Array.isArray(speakerList) && speakerList.length > 0;

  return (
    <LiquidGlassScrollBar className="note-panel-scroll note-panel-scroll--metadata">
      <div className="panel-content note-metadata">
        <h3 className="note-metadata-heading">Topics</h3>
        {hasTopics ? (
          <div className="topic-list">
            {topicList.map((topic, index) => (
            <div key={index} className="topic-card">
              <div className="topic-header">
                <img src="/icons/topics.png" alt="Topic" className="topic-icon" />
                <div className="topic-title">{topic.title}</div>
              </div>
              <div className="topic-summary">{topic.summary}</div>
            </div>
            ))}
          </div>
        ) : (
          <p className="panel-content">No topics yet...</p>
        )}

        <h3 className="note-metadata-heading">Speakers</h3>
        {hasSpeakers ? (
          speakerList.map((speaker) => (
            <SpeakerRow
              key={speaker.name}
              speaker={speaker}
              isEditing={editingSpeaker === speaker.name}
              editedName={editedName}
              onSpeakerClick={onSpeakerClick}
              onSpeakerChange={onSpeakerChange}
              onSpeakerSave={onSpeakerSave}
              onSpeakerKeyDown={onSpeakerKeyDown}
            />
          ))
        ) : (
          <p className="panel-content">No speakers yet...</p>
        )}
      </div>
    </LiquidGlassScrollBar>
  );
}

function SpeakerRow({
  speaker,
  isEditing,
  editedName,
  onSpeakerClick,
  onSpeakerChange,
  onSpeakerSave,
  onSpeakerKeyDown
}) {
  const handleClick = () => {
    onSpeakerClick(speaker.name);
  };

  const handleChange = (event) => {
    onSpeakerChange(event.target.value);
  };

  const handleBlur = () => {
    onSpeakerSave(speaker.name);
  };

  const handleKeyDown = (event) => {
    onSpeakerKeyDown(event, speaker.name);
  };

  return (
    <div className="speaker-card">
      <img src="/icons/user.png" alt="Speaker" className="speaker-icon" />
      <div className="speaker-info">
        {isEditing ? (
          <input
            type="text"
            className="speaker-name-input"
            value={editedName}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <div
            className="speaker-name"
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleClick();
              }
            }}
          >
            {speaker.name}
          </div>
        )}
        <div className="speaker-description">
          {speaker.description || 'no description...'}
        </div>
      </div>
    </div>
  );
}
