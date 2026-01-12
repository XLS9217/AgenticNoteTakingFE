import { useEffect, useState, useCallback } from "react";
import LiquidGlassScrollBar from "../../../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx";
import LiquidGlassInnerTextButton from "../../../../Components/LiquidGlassInner/LiquidGlassInnerTextButton.jsx";
import CommendDispatcher, { ChannelEnum } from "../../../../Util/CommendDispatcher.js";
import {
    updateSourceRaw,
    getSourceProcessed,
    getSourceMetadata
} from "../../../../Api/gateway.js";
import ProcessedTranscriptPanel from "./ProcessedTranscriptPanel.jsx";
import MetadataPanel from "./MetadataPanel.jsx";

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
            <ProcessedTranscriptPanel utterances={processed} />
            <div className="source-divider"></div>
            <MetadataPanel
                topics={topics}
                speakers={speakers}
                workspaceId={workspaceId}
                sourceId={sourceId}
                onSpeakerUpdate={fetchData}
            />
        </>
    );
}
