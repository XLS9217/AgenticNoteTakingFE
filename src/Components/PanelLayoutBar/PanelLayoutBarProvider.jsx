import { createContext, useContext, useState } from "react";

const PanelLayoutBarContext = createContext();

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
