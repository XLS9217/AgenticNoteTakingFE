import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import LiquidGlassDiv from "../../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx";
import LiquidGlassScrollBar from "../../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx";
import LiquidGlassInnerTextButton from "../../../Components/LiquidGlassInner/LiquidGlassInnerTextButton.jsx";
import TranscriptPanel from "./TranscriptPanel/TranscriptPanel.jsx";
import {
    getSources,
    createSource,
    deleteSource,
    updateSourceName
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

    const displayName = source.source_name || source.name || '(no name)';

    return (
        <div className="source-item" onClick={onSelect}>
            <button ref={menuBtnRef} className="source-item-menu" onClick={handleMenuClick}>
                ⋮
            </button>
            <span className="source-item-title" title={displayName}>
                {displayName}
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
    const [isAnimating, setIsAnimating] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitleValue, setEditTitleValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchSources = useCallback(async () => {
        if (!workspaceId) return;
        try {
            console.log('[SourcePanel] Fetching sources for workspace:', workspaceId);
            const res = await getSources(workspaceId);
            console.log('[SourcePanel] Got sources:', res);
            setSources(res.sources || []);
        } catch (err) {
            console.error('Failed to fetch sources:', err);
        } finally {
            setIsLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchSources();
    }, [fetchSources]);

    const handleAddSource = async () => {
        try {
            const res = await createSource(workspaceId);
            if (res.source_id) {
                const updatedSources = await getSources(workspaceId);
                setSources(updatedSources.sources || []);
                const newSource = updatedSources.sources?.find(s => s.source_id === res.source_id);
                if (newSource) {
                    handleSelectSource(newSource);
                }
            }
        } catch (err) {
            console.error('Failed to create source:', err);
        }
    };

    const handleSelectSource = (source) => {
        console.log('[SourcePanel] Selected source:', source);
        setIsAnimating(true);
        setSelectedSource(source);
    };

    const handleCollapse = () => {
        setIsAnimating(true);
        setSelectedSource(null);
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

    const handleTitleClick = () => {
        setEditTitleValue(selectedSource?.source_name || '');
        setIsEditingTitle(true);
    };

    const handleTitleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newName = editTitleValue.trim();
            if (newName && newName !== selectedSource?.source_name) {
                try {
                    await updateSourceName(workspaceId, selectedSource.source_id, newName);
                    setSelectedSource({ ...selectedSource, source_name: newName });
                    setSources(sources.map(s =>
                        s.source_id === selectedSource.source_id ? { ...s, source_name: newName } : s
                    ));
                } catch (err) {
                    console.error('Failed to update source name:', err);
                }
            }
            setIsEditingTitle(false);
        } else if (e.key === 'Escape') {
            setIsEditingTitle(false);
        }
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
    };

    const isExpanded = selectedSource !== null;

    return (
        <LiquidGlassDiv blurriness={0.5} variant="workspace">
            <div className="source-panel-container">
                {/* Header */}
                <div className="source-header">
                    {isExpanded ? (
                        <>
                            {isEditingTitle ? (
                                <input
                                    type="text"
                                    className="source-title-input"
                                    value={editTitleValue}
                                    onChange={(e) => setEditTitleValue(e.target.value)}
                                    onKeyDown={handleTitleKeyDown}
                                    onBlur={handleTitleBlur}
                                    autoFocus
                                />
                            ) : (
                                <h2
                                    className="source-title source-title--editable"
                                    title={selectedSource.source_name || '(no name)'}
                                    onClick={handleTitleClick}
                                >
                                    {selectedSource.source_name || '(no name)'}
                                </h2>
                            )}
                            <button className="source-header-icon-btn" onClick={handleCollapse}>
                                <img src="/icons/back.png" alt="Collapse" className="source-header-icon" />
                            </button>
                        </>
                    ) : (
                        <>
                            <h2 className="source-title">Sources</h2>
                            <button className="source-header-icon-btn" onClick={handleAddSource}>
                                <img src="/icons/add.png" alt="Add" className="source-header-icon" />
                            </button>
                        </>
                    )}
                </div>

                {/* Sliding content area */}
                <div className="source-slide-container">
                    {/* List view */}
                    <div className={`source-slide source-slide--list ${isExpanded ? 'source-slide--left' : ''}`}>
                        <LiquidGlassScrollBar className="source-list">
                            {isLoading ? (
                                <p className="source-loading">Loading...</p>
                            ) : sources.length > 0 ? sources.map(source => (
                                <SourceListItem
                                    key={source.source_id}
                                    source={source}
                                    onSelect={() => handleSelectSource(source)}
                                    onDelete={() => handleDeleteSource(source.source_id)}
                                />
                            )) : (
                                <p className="source-empty-state">No sources yet. Click "+ Add" to create one.</p>
                            )}
                        </LiquidGlassScrollBar>
                    </div>

                    {/* Content view */}
                    <div className={`source-slide source-slide--content ${isExpanded ? '' : 'source-slide--right'}`}>
                        {selectedSource && (
                            <TranscriptPanel
                                source={selectedSource}
                                workspaceId={workspaceId}
                            />
                        )}
                    </div>
                </div>
            </div>
        </LiquidGlassDiv>
    );
}
