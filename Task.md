# Task: Speaker Name Selection Dropdown

## Goal
When clicking a speaker name in the metadata section, show a tag-based dropdown list of name candidates that the user can select from.

## Backend APIs (Already Exist)

| API | Purpose |
|-----|---------|
| `GET /note-taking/source/{ws}/{src}/speaker-candidate/{speaker_name}` | Get name candidates for a speaker |
| `PUT /note-taking/source/{ws}/{src}/speaker-name` | Update speaker name (old_name → new_name) |

## Frontend Implementation Plan

### 1. Add Gateway Function
```javascript
// gateway.js
export async function getSpeakerCandidates(workspaceId, sourceId, speakerName) {
    const response = await request.get(
        `/note-taking/source/${workspaceId}/${sourceId}/speaker-candidate/${speakerName}`
    );
    return response.data;
}
```

### 2. Modify MetadataSection in TranscriptPanel.jsx
- Add state: `editingSpeaker` (name of speaker being edited), `candidates` (list)
- Add click handler to `.speaker-title`
- On click: fetch candidates, show dropdown
- On select: call `updateSpeakerName`, refresh data

### 3. Inline Tags UI
- Tags appear **inline** next to the current name
- **Darker tag** = current/selected name
- **Lighter tags** = candidates
- **"+" button** at the end = add custom name
- Click candidate tag → call API, becomes the new name
- Click outside → collapse tags

Example:
```
👤 [spk-4 (dark)] [张三 (light)] [李四 (light)] [+]
```

### 4. CSS (in Modules.css)
- `.speaker-candidate-tags` - inline flex-wrap container
- `.speaker-candidate-tag` - pill style tag
- `.speaker-candidate-tag--active` - darker (current name)
- `.speaker-candidate-tag--candidate` - lighter (suggestions)
- `.speaker-candidate-tag--add` - the "+" button

## Status
Ready to implement - no backend changes needed.
