use my aesthetic design


E:\Project\_MeetingNoteTaking\AgenticNoteTakingFE\src\Modules\WorkSpacePanel\SourcePanel.jsx
for source panel, look at Legacy folder (you are not allow to edit it or import from it, just learn from it)

In my old user interaction flow, I have somewhere to import a raw transcript file and send to backend for processing.
And there are processing status

now I want this also. For source panel. if there are no transcript. Put two area inside, one for drop txt one for copy and paste in transcript.
Just like the old one

# Plan in short steps

## Step 1: Add transcript upload state management
- Add useState for transcript text, isDragging, isProcessing, processStatus
- Add state to track if we're in upload mode vs viewing mode

## Step 2: Create RawTranscriptUpload component
- Drag and drop zone for .txt files
- Textarea for copy-paste
- Similar to Legacy TranscriptPanel RawTranscriptPanel (lines 8-76)

## Step 3: Add process button and websocket integration
- Add Process button (using LiquidGlassInnerTextButton)
- Listen to websocket for process_status messages
- Send process_transcript message when button clicked
- Display processing status (Starting, Processing, Done, Error, None)

## Step 4: Conditional rendering in SourcePanel
- If no transcript: show RawTranscriptUpload component
- If has transcript: show current ProcessedTranscriptSection and TopicsSection

## Step 5: Add API calls
- Import updateTranscript, getProcessedTranscript, getMetadata from gateway.js
- Call updateTranscript when user finishes inputting raw transcript
- Fetch processed transcript after processing completes

# Files to change

## E:\Project\_MeetingNoteTaking\AgenticNoteTakingFE\src\Modules\WorkSpacePanel\SourcePanel.jsx
- Add imports: useState, useCallback, LiquidGlassInnerTextButton, API functions
- Add RawTranscriptUpload component with drag-drop and textarea
- Add state management for upload, processing, and status
- Add websocket message listener for process_status
- Add conditional rendering based on transcript existence
- Add Process button functionality