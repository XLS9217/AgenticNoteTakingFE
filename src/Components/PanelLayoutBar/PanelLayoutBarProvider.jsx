import { createContext, useContext, useState } from "react";

const PanelLayoutBarContext = createContext();

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

export function PresetUnitHolder() {
    return (
        <div
            className="preset-panel"
            style={{
                flex: 1,
                background: 'rgba(128, 128, 128, 0.8)',
                borderRadius: '10%'
            }}
        />
    );
}

export function PanelLayoutBarProvider({ children }) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [layoutPresets, setLayoutPresets] = useState([]);

    const startDragging = (position) => {
        setIsDragging(true);
        setDragPosition(position);
    };

    const updateDragPosition = (position) => {
        setDragPosition(position);
    };

    const stopDragging = () => {
        setIsDragging(false);
    };

    const registerLayoutPresets = (presets) => {
        setLayoutPresets(presets);
    };

    return (
        <PanelLayoutBarContext.Provider value={{
            isDragging,
            dragPosition,
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
