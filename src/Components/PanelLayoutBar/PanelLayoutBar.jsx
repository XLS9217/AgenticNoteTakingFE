import { usePanelLayoutBar } from "./PanelLayoutBarProvider.jsx";

export default function PanelLayoutBar() {
    const { isDragging, layoutPresets } = usePanelLayoutBar();

    return (
        <div className={`panel-layout-bar ${isDragging ? 'panel-layout-bar--visible' : ''}`}>
            {layoutPresets.map((preset, index) => (
                <div key={index} className="panel-layout-bubble">
                    {preset}
                </div>
            ))}
        </div>
    );
}
