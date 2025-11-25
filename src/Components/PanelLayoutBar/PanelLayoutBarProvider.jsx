import { createContext, useContext, useState, useCallback } from "react";

const PanelLayoutBarContext = createContext();

// Panel type enum
export const PanelType = {
    CHAT_BOX: 'chat',
    NOTE_PANEL: 'note',
    SOURCE: 'source'
};

// Preset holder components
export function PresetGroupBox({ children }) {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            padding: '7.5%',
            boxSizing: 'border-box'
        }}>
            {children}
        </div>
    );
}

export function PresetVerticalHolder({ width, children }) {
    return (
        <div style={{
            width: width || '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '5%'
        }}>
            {children}
        </div>
    );
}

export function PresetHorizontalHolder({ height, children }) {
    return (
        <div style={{
            width: '100%',
            height: height || '100%',
            display: 'flex',
            flexDirection: 'row',
            gap: '5%'
        }}>
            {children}
        </div>
    );
}

export function PresetUnitHolder({ canChatBox, canNotePanel, canSourcePanel }) {
    const { draggedPanelType } = usePanelLayoutBar();

    const canAcceptDrag = !draggedPanelType ||
        (draggedPanelType === PanelType.CHAT_BOX && canChatBox) ||
        (draggedPanelType === PanelType.NOTE_PANEL && canNotePanel) ||
        (draggedPanelType === PanelType.SOURCE && canSourcePanel);

    return (
        <div
            className="preset-panel"
            style={{
                flex: 1,
                background: canAcceptDrag ? 'rgba(128, 128, 128, 0.8)' : 'rgba(64, 64, 64, 0.6)',
                borderRadius: '10%',
                transform: canAcceptDrag ? 'scale(1)' : 'scale(0.9)',
                opacity: canAcceptDrag ? 1 : 0.5,
                transition: 'all 0.2s ease'
            }}
        />
    );
}

export function PanelLayoutBarProvider({ children }) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [draggedPanelType, setDraggedPanelType] = useState(null);
    const [layoutPresets, setLayoutPresets] = useState([]);

    const startDragging = useCallback((position, panelType) => {
        setIsDragging(true);
        setDragPosition(position);
        setDraggedPanelType(panelType);
    }, []);

    const updateDragPosition = useCallback((position) => {
        setDragPosition(position);
    }, []);

    const stopDragging = useCallback(() => {
        setIsDragging(false);
        setDraggedPanelType(null);
    }, []);

    const registerLayoutPresets = useCallback((presets) => {
        setLayoutPresets(presets);
    }, []);

    return (
        <PanelLayoutBarContext.Provider value={{
            isDragging,
            dragPosition,
            draggedPanelType,
            layoutPresets,
            startDragging,
            updateDragPosition,
            stopDragging,
            registerLayoutPresets
        }}>
            {children}
        </PanelLayoutBarContext.Provider>
    );
}

export function usePanelLayoutBar() {
    const context = useContext(PanelLayoutBarContext);
    if (!context) {
        throw new Error('usePanelLayoutBar must be used within PanelLayoutBarProvider');
    }
    return context;
}
