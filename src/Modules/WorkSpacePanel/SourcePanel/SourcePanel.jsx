import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import LiquidGlassDiv from "../../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx";
import LiquidGlassScrollBar from "../../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx";
import LiquidGlassInnerTextButton from "../../../Components/LiquidGlassInner/LiquidGlassInnerTextButton.jsx";
import TranscriptPanel from "./TranscriptPanel.jsx";
import {
    getSources,
    createSource,
    deleteSource
} from "../../../Api/gateway.js";

// Source list item with three-dot menu (NotebookLM style)
function SourceListItem({ source, onSelect, onDelete }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const menuBtnRef = useRef(null);
    const sourceId = source.source_id;

    const handleMenuClick = (e) => {
        e.stopPropagation();
        if (!menuOpen && menuBtnRef.current) {
            const rect = menuBtnRef.current.getBoundingClientRect();
            setMenuPos({ top: rect.bottom + 4, left: rect.left });
        }
        setMenuOpen(!menuOpen);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setMenuOpen(false);
        onDelete();
    };

    // Close menu when clicking outside
    useEffect(() => {
        if (!menuOpen) return;
        const handleClickOutside = () => setMenuOpen(false);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [menuOpen]);

    return (
        <div className="source-item" onClick={onSelect}>
            <button ref={menuBtnRef} className="source-item-menu" onClick={handleMenuClick}>
                ⋮
            </button>
            <span className="source-item-title" title={`Transcript${sourceId}`}>
                Transcript{sourceId.slice(0, 8)}...
            </span>
            {menuOpen && createPortal(
                <div
                    className="source-item-dropdown"
                    style={{ top: menuPos.top, left: menuPos.left }}
                >
                    <button onClick={handleDelete}>Delete</button>
                </div>,
                document.body
            )}
        </div>
    );
}

// Main SourcePanel
export default function SourcePanel({ workspaceId }) {
    const [sources, setSources] = useState([]);
    const [selectedSource, setSelectedSource] = useState(null);

    const fetchSources = useCallback(async () => {
        if (!workspaceId) return;
        try {
            const res = await getSources(workspaceId);
            setSources(res.sources || []);
        } catch (err) {
            console.error('Failed to fetch sources:', err);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchSources();
    }, [fetchSources]);

    const handleAddSource = async () => {
        try {
            const res = await createSource(workspaceId);
            if (res.source_id) {
                await fetchSources();
            }
        } catch (err) {
            console.error('Failed to create source:', err);
        }
    };

    const handleDeleteSource = async (sourceId) => {
        try {
            await deleteSource(workspaceId, sourceId);
            setSources(sources.filter(s => s.source_id !== sourceId));
            if (selectedSource?.source_id === sourceId) {
                setSelectedSource(null);
            }
        } catch (err) {
            console.error('Failed to delete source:', err);
        }
    };

    // Expanded view - show TranscriptPanel
    if (selectedSource) {
        return (
            <LiquidGlassDiv blurriness={0.5} variant="workspace">
                <div className="source-panel-container">
                    <div className="source-header">
                        <h2 className="source-title" title={`Transcript${selectedSource.source_id}`}>
                            Transcript{selectedSource.source_id.slice(0, 8)}...
                        </h2>
                        <LiquidGlassInnerTextButton onClick={() => setSelectedSource(null)}>
                            &lt; Collapse
                        </LiquidGlassInnerTextButton>
                    </div>
                    <TranscriptPanel
                        source={selectedSource}
                        workspaceId={workspaceId}
                    />
                </div>
            </LiquidGlassDiv>
        );
    }

    // List view - show sources list
    return (
        <LiquidGlassDiv blurriness={0.5} variant="workspace">
            <div className="source-panel-container">
                <div className="source-header">
                    <h2 className="source-title">Sources</h2>
                    <LiquidGlassInnerTextButton onClick={handleAddSource}>+ Add</LiquidGlassInnerTextButton>
                </div>

                <LiquidGlassScrollBar className="source-list">
                    {sources.length > 0 ? sources.map(source => (
                        <SourceListItem
                            key={source.source_id}
                            source={source}
                            onSelect={() => setSelectedSource(source)}
                            onDelete={() => handleDeleteSource(source.source_id)}
                        />
                    )) : (
                        <p className="source-empty-state">No sources yet. Click "+ Add" to create one.</p>
                    )}
                </LiquidGlassScrollBar>
            </div>
        </LiquidGlassDiv>
    );
}
