# Frontend Tasks - Source System Migration

## New Source API Endpoints

```javascript
// Source CRUD
POST   /note-taking/source/{workspace_id}                      // create source
GET    /note-taking/source/{workspace_id}                      // get all sources
GET    /note-taking/source/{workspace_id}/{source_id}          // get source by id
PUT    /note-taking/source/{workspace_id}/{source_id}          // update source
DELETE /note-taking/source/{workspace_id}/{source_id}          // delete source

// Source content
GET    /note-taking/source/{workspace_id}/{source_id}/raw      // get raw_content
PUT    /note-taking/source/{workspace_id}/{source_id}/raw      // update raw_content
GET    /note-taking/source/{workspace_id}/{source_id}/processed  // get processed
GET    /note-taking/source/{workspace_id}/{source_id}/metadata   // get metadata

// Source processing
POST   /note-taking/source/{workspace_id}/{source_id}/process  // trigger processing

// Note management (unchanged)
PUT  /note-taking/update-note
GET  /note-taking/get-chat-history/{workspace_id}
```

## WebSocket Message Changes

### process_status (updated)
```javascript
// Before
{ type: "workspace_message", sub_type: "process_status", status: "Evaluating" }

// After - includes source_id
{ type: "workspace_message", sub_type: "process_status", source_id: "uuid", status: "Evaluating" }
```

## Files to Change (Frontend)

| File | Changes |
|------|---------|
| `src/Api/gateway.js` | Replace `updateTranscript`, `getProcessedTranscript`, `getMetadata` with source API calls |
| `src/Api/socket_gateway.js` | Handle `source_id` in `process_status` message |
| `src/Modules/WorkSpacePanel/*` | Update to work with sources array instead of single transcript |

## gateway.js Changes

### Remove
```javascript
// Remove these functions
updateTranscript(workspaceId, transcript)
getProcessedTranscript(workspaceId)
getMetadata(workspaceId)
updateSpeakerName(workspaceId, oldName, newName)
```

### Add
```javascript
// Add these functions
createSource(workspaceId, sourceType, rawContent)
getSources(workspaceId)
getSourceById(workspaceId, sourceId)
updateSource(workspaceId, sourceId, updates)
deleteSource(workspaceId, sourceId)
getSourceRaw(workspaceId, sourceId)
updateSourceRaw(workspaceId, sourceId, rawContent)
getSourceProcessed(workspaceId, sourceId)
getSourceMetadata(workspaceId, sourceId)
processSource(workspaceId, sourceId)
```

## socket_gateway.js Changes

```javascript
// Update onmessage handler
if (data.sub_type === 'process_status') {
    // data now includes source_id
    CommendDispatcher.Publish2Channel(ChannelEnum.PROCESS_STATUS, {
        source_id: data.source_id,  // NEW
        status: data.status
    });
}
```

## UI Changes Needed

### Source Panel Tree Structure

```
Sources Panel
├── [+] Add Source Button
│
├── ▼ Transcript: "Meeting 2024-12-16" (source_id)     <- expandable header
│   ├── Raw Content                                    <- tab/section
│   │   └── [textarea: raw transcript text]
│   ├── Speakers                                       <- tab/section
│   │   ├── Alice - Engineering Manager
│   │   └── Bob - QA Lead
│   ├── Topics                                         <- tab/section
│   │   ├── Product Release
│   │   └── Sprint Planning
│   └── Processed                                      <- tab/section
│       ├── [00:01:23] Alice: "We shipped v1.2..."
│       └── [00:02:45] Bob: "Next sprint focuses..."
│
├── ▶ Transcript: "Standup Notes" (source_id)          <- collapsed
│
└── ▶ Transcript: "Design Review" (source_id)          <- collapsed
```

### Tree Behavior

- **Expand/Collapse**: Click header to toggle source content visibility
- **Only one expanded**: When expanding a source, collapse others (optional)
- **Selected state**: Highlight currently selected source
- **Process button**: Per-source button to trigger processing
- **Delete button**: Per-source button to delete source

### Component Structure

```
src/Modules/WorkSpacePanel/
├── SourcePanel/
│   ├── SourcePanel.jsx           <- main container
│   ├── SourceHeader.jsx          <- expandable header with title, process/delete buttons
│   ├── SourceContent.jsx         <- container for tabs when expanded
│   ├── RawContentTab.jsx         <- raw transcript textarea
│   ├── SpeakersTab.jsx           <- speaker list with edit
│   ├── TopicsTab.jsx             <- topics list
│   └── ProcessedTab.jsx          <- processed transcript display
```

### State Management

```javascript
// Source panel state
const [sources, setSources] = useState([]);           // all sources
const [expandedSourceId, setExpandedSourceId] = useState(null);  // which is expanded
const [activeTab, setActiveTab] = useState('raw');    // raw | speakers | topics | processed
```