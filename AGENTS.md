# Plan: Scroll-to-Topic Feature

## Goal
Click an utterance in the processed transcript → emit `DISPLAY_CONTROL` event → scroll to corresponding topic in metadata panel (if open)

---

## Architecture Analysis

### Current Structure

**TranscriptPanel.jsx** (Lines 156-171)
- Renders processed transcript as array of entries
- Each entry has: `speaker`, `timestamp`, `topic`, `utterance`
- Topic tag rendered at line 165-167: `<span className="transcript-topic-tag">`
- Utterance at line 168: `<div className="transcript-utterance">`

**NotePanel.jsx** (Lines 158-212)
- Has two tabs: Note and Metadata
- Metadata tab shows topics at lines 177-187
- Topics rendered as `<div className="topic-card">` with `topic.title`
- Scrollable container: `LiquidGlassScrollBar` with class `note-panel-scroll--metadata`

**CommendDispatcher.js**
- Already has `ChannelEnum.DISPLAY_CONTROL`
- Pub/sub ready to use

---

## Implementation Plan

### Step 1: Add Click Handler to Utterances
**File**: `TranscriptPanel.jsx`
**Location**: Lines 156-171 (`renderProcessedTranscript` function)

**Changes**:
1. Import `CommendDispatcher` and `ChannelEnum`
2. Add `onClick` handler to `.transcript-entry` div (or `.transcript-utterance`)
3. Emit event with topic from `item.topic`

**Code**:
```javascript
import CommendDispatcher, { ChannelEnum } from '../../../Util/CommendDispatcher';

const handleUtteranceClick = (topic) => {
  if (!topic) return; // Only emit if topic exists
  CommendDispatcher.Publish2Channel(ChannelEnum.DISPLAY_CONTROL, {
    action: 'scroll-to-topic',
    topic: topic
  });
};

// Update renderProcessedTranscript
return transcript.map((item, index) => (
  <div
    key={index}
    className="transcript-entry transcript-entry--clickable"
    onClick={() => handleUtteranceClick(item.topic)}
    title={item.topic ? `Click to scroll to topic: ${item.topic}` : ''}
  >
    {/* rest of the content */}
  </div>
));
```

---

### Step 2: Subscribe to Events in NotePanel
**File**: `NotePanel.jsx`
**Location**: Main component (lines 13-123)

**Changes**:
1. Import `CommendDispatcher` and `ChannelEnum`
2. Add `useEffect` to subscribe to `DISPLAY_CONTROL`
3. Check if metadata tab is active (`activeTab === METADATA_TAB`)
4. Find matching topic element by title
5. Scroll to it with smooth animation

**Code**:
```javascript
import { useEffect, useState, useRef } from 'react';
import CommendDispatcher, { ChannelEnum } from '../../../Util/CommendDispatcher';

export default function NotePanel({ ... }) {
  const [activeTab, setActiveTab] = useState(NOTE_TAB);
  const metadataScrollRef = useRef(null);

  // Subscribe to scroll events
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
  }, [activeTab, metadata]);

  const handleScrollToTopic = (topicTitle) => {
    // Only scroll if metadata tab is active
    if (activeTab !== METADATA_TAB) return;

    // Find the topic element
    const topicElements = document.querySelectorAll('.topic-card .topic-title');
    const targetElement = Array.from(topicElements).find(
      el => el.textContent === topicTitle
    );

    if (targetElement) {
      targetElement.closest('.topic-card').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // ... rest of component
}
```

---

### Step 3: Add CSS for Visual Feedback
**File**: `Modules.css`
**Location**: Transcript section

**Changes**:
1. Add hover cursor for clickable utterances
2. Add highlight animation for scrolled-to topic

**Code**:
```css
/* Transcript clickable entries */
.transcript-entry--clickable {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.transcript-entry--clickable:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Topic scroll highlight */
@keyframes topic-highlight {
  0% { background-color: rgba(100, 200, 255, 0.2); }
  100% { background-color: transparent; }
}

.topic-card--highlighted {
  animation: topic-highlight 1.5s ease-out;
}
```

---

### Step 4: Enhanced Scroll with Highlight (Optional)
**Improvement**: Add temporary highlight to scrolled-to topic

**Update `handleScrollToTopic`**:
```javascript
const handleScrollToTopic = (topicTitle) => {
  if (activeTab !== METADATA_TAB) return;

  const topicElements = document.querySelectorAll('.topic-card .topic-title');
  const targetElement = Array.from(topicElements).find(
    el => el.textContent === topicTitle
  );

  if (targetElement) {
    const topicCard = targetElement.closest('.topic-card');

    // Scroll to element
    topicCard.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    // Add highlight class
    topicCard.classList.add('topic-card--highlighted');
    setTimeout(() => {
      topicCard.classList.remove('topic-card--highlighted');
    }, 1500);
  }
};
```

---

## Files to Modify

1. **TranscriptPanel.jsx** (src/Modules/WorkSpacePanel/NotetakingContent/)
   - Import CommendDispatcher
   - Add click handler to utterances
   - Publish scroll-to-topic event

2. **NotePanel.jsx** (src/Modules/WorkSpacePanel/NotetakingContent/)
   - Import CommendDispatcher
   - Subscribe to DISPLAY_CONTROL events
   - Implement scroll animation logic
   - Check metadata tab visibility

3. **Modules.css** (src/Modules/)
   - Add hover styles for clickable utterances
   - Add highlight animation for topics

---

## Event Contract

**Channel**: `ChannelEnum.DISPLAY_CONTROL`

**Payload**:
```javascript
{
  action: 'scroll-to-topic',
  topic: 'Topic Title String'  // matches metadata.topics_list[].title
}
```

---

## Edge Cases Handled

1. **No topic on utterance**: Don't emit event (check `if (!topic) return`)
2. **Metadata tab not active**: Don't scroll (check `activeTab !== METADATA_TAB`)
3. **Topic not found**: Silently fail (no error)
4. **Multiple clicks**: Animation will restart naturally

---

## Testing Steps

1. Open workspace with processed transcript
2. Ensure metadata tab has topics
3. Click an utterance in processed transcript
4. Verify:
   - If metadata tab is open → smooth scroll to topic
   - If note tab is open → no action (expected)
   - Hover shows cursor pointer on utterances
   - Scrolled topic briefly highlights

---

## Summary

**Minimal changes**:
- 1 function in TranscriptPanel (publish event)
- 1 useEffect + 1 function in NotePanel (subscribe + scroll)
- 3-4 CSS rules for visual polish

**Follows project guidelines**:
- ✅ No npm commands
- ✅ Minimal work, no overcomplication
- ✅ Uses existing CommendDispatcher
- ✅ CSS in Modules.css
- ✅ Liquid glass aesthetic preserved