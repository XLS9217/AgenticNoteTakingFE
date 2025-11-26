# Implementation Plan: Click-to-Scroll Between Transcript and Note Metadata

## Task Overview
Implement click-to-scroll functionality where:
- Clicking an utterance in the processed transcript scrolls to the corresponding topic in the note metadata section
- Clicking a topic in the note metadata section scrolls to the corresponding utterance in the transcript

## Current Code Structure
- **TranscriptPanel**: `src/Modules/WorkSpacePanel/NotetakingContent/TranscriptPanel.jsx`
  - `ProcessedTranscriptPanel` component (lines 79-235)
  - `renderProcessedTranscript` function (lines 156-171)
  - Each entry has: `speaker`, `utterance`, `timestamp`, `id`, `topic`

- **NotePanel**: `src/Modules/WorkSpacePanel/NotetakingContent/NotePanel.jsx`
  - Displays metadata topics
  - Renders topic cards

- **Parent Component**: `src/Modules/WorkSpacePanel/NotetakingContent/NoteTakingContent.jsx`
  - Manages both panels
  - Handles WebSocket and data loading

## Implementation Plan

### Step 1: Add State Management in Parent Component
**File**: `NoteTakingContent.jsx`

Add state to track selected items:
```jsx
const [selectedTopicId, setSelectedTopicId] = useState(null);
const [selectedUtteranceId, setSelectedUtteranceId] = useState(null);
```

### Step 2: Make Transcript Entries Clickable
**File**: `TranscriptPanel.jsx` - `renderProcessedTranscript` function

1. Add `onClick` handler to transcript entries
2. Pass callback prop `onUtteranceClick` from parent
3. Store utterance topic for matching

```jsx
const renderProcessedTranscript = (transcript) => {
    if (!Array.isArray(transcript)) return null;

    return transcript.map((item, index) => (
        <div
            key={index}
            className="transcript-entry transcript-entry-clickable"
            onClick={() => onUtteranceClick?.(item.topic, item.id)}
            title="Click to view in notes"
        >
            <div className="transcript-entry-header">
                <span className="transcript-speaker">{item.speaker}</span>
                <span className="transcript-timestamp">[{item.timestamp}]</span>
            </div>
            {item.topic && (
                <span className="transcript-topic-tag" title={item.topic}>{item.topic}</span>
            )}
            <div className="transcript-utterance">{item.utterance}</div>
        </div>
    ));
};
```

Add prop to `ProcessedTranscriptPanel`:
```jsx
function ProcessedTranscriptPanel({
    workspaceId,
    processedTranscript,
    socket,
    isConnected,
    onMetadataUpdate,
    refreshTrigger,
    onUtteranceClick // new prop
})
```

### Step 3: Add Refs to Note Metadata Topics
**File**: `NotePanel.jsx`

1. Create refs for each topic section
2. Use `useRef` and `useEffect` to scroll when topic is selected
3. Add `scrollIntoView` logic

```jsx
const topicRefs = useRef({});

useEffect(() => {
    if (selectedTopic && topicRefs.current[selectedTopic]) {
        topicRefs.current[selectedTopic].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}, [selectedTopic]);

// In render, add ref to each topic
<div
    ref={(el) => topicRefs.current[topic] = el}
    className="topic-card"
    onClick={() => onTopicClick?.(topic)}
>
    {/* topic content */}
</div>
```

### Step 4: Add Refs to Transcript Entries
**File**: `TranscriptPanel.jsx`

1. Create refs for each transcript entry
2. Scroll to entry when utterance ID is selected

```jsx
const transcriptRefs = useRef({});

useEffect(() => {
    if (selectedUtteranceId && transcriptRefs.current[selectedUtteranceId]) {
        transcriptRefs.current[selectedUtteranceId].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}, [selectedUtteranceId]);

// In renderProcessedTranscript
<div
    key={index}
    ref={(el) => transcriptRefs.current[item.id] = el}
    className="transcript-entry transcript-entry-clickable"
    onClick={() => onUtteranceClick?.(item.topic, item.id)}
>
```

### Step 5: Connect Parent Component Callbacks
**File**: `NoteTakingContent.jsx`

```jsx
const handleUtteranceClick = (topic, utteranceId) => {
    setSelectedTopicId(topic);
    // Notify NotePanel to scroll to this topic
};

const handleTopicClick = (topic) => {
    // Find first utterance with this topic and scroll to it
    const firstUtterance = processedTranscript?.find(item => item.topic === topic);
    if (firstUtterance) {
        setSelectedUtteranceId(firstUtterance.id);
    }
};

// Pass props to panels
<TranscriptPanel
    onUtteranceClick={handleUtteranceClick}
    selectedUtteranceId={selectedUtteranceId}
    // ... other props
/>

<NotePanel
    onTopicClick={handleTopicClick}
    selectedTopic={selectedTopicId}
    // ... other props
/>
```

### Step 6: Add CSS for Clickable States
**File**: `Modules.css`

```css
.transcript-entry-clickable {
    cursor: pointer;
    transition: var(--transition-fast);
}

.transcript-entry-clickable:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(2px);
}

.topic-card-clickable {
    cursor: pointer;
    transition: var(--transition-fast);
}

.topic-card-clickable:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
}
```

## Design Decisions

1. **Bidirectional scrolling**: Both transcript → notes and notes → transcript
2. **Topic-based matching**: Use the `topic` field to link utterances to metadata
3. **Smooth scrolling**: Use `scrollIntoView({ behavior: 'smooth', block: 'center' })`
4. **Visual feedback**: Hover effects to show items are clickable
5. **Refs management**: Use object-based refs to handle dynamic lists
6. **First match for topic-to-transcript**: When clicking a topic, scroll to the first utterance with that topic

## Files to Modify

1. `NoteTakingContent.jsx` - Add state and coordination logic
2. `TranscriptPanel.jsx` - Add clickable entries and refs
3. `NotePanel.jsx` - Add clickable topics and refs
4. `Modules.css` - Add hover styles for clickable elements

## Props to Add

**TranscriptPanel**:
- `onUtteranceClick?: (topic: string, utteranceId: string) => void`
- `selectedUtteranceId?: string`

**NotePanel**:
- `onTopicClick?: (topic: string) => void`
- `selectedTopic?: string`

## Testing Considerations

- Verify smooth scrolling works in both directions
- Test with long transcripts and many topics
- Ensure refs are properly set for all items
- Check that scrolling positions items in center of viewport
- Verify hover states provide clear visual feedback
