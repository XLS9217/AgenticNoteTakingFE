import { createContext, useContext, useState } from "react";

const PanelLayoutBarContext = createContext();

export function PanelLayoutBarProvider({ children }) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

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

    return (
        <PanelLayoutBarContext.Provider value={{
            isDragging,
            dragPosition,
            startDragging,
            updateDragPosition,
            stopDragging
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
