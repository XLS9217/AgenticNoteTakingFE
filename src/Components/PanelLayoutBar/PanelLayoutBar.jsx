import { usePanelLayoutBar } from "./PanelLayoutBarProvider.jsx";

export default function PanelLayoutBar() {
    const { isDragging } = usePanelLayoutBar();

    return (
        <div className={`panel-layout-bar ${isDragging ? 'panel-layout-bar--visible' : ''}`}>
            {/* Placeholder content for layout options */}
        </div>
    );
}
