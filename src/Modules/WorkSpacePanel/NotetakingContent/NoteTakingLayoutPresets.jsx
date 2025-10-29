import { useEffect } from "react";
import { usePanelLayoutBar } from "../../../Components/PanelLayoutBar/PanelLayoutBarProvider.jsx";

export default function NoteTakingLayoutPresets() {
    const { registerLayoutPresets } = usePanelLayoutBar();

    useEffect(() => {
        const presets = [
            // Preset 1 - Three vertical divs (columns)
            <div style={{ width: '100%', height: '100%', padding: '7.5%', display: 'flex', gap: '5%', boxSizing: 'border-box' }}>
                <div className="preset-panel" style={{ flex: 1, background: 'rgba(128, 128, 128, 0.8)', borderRadius: '10%' }} />
                <div className="preset-panel" style={{ flex: 1, background: 'rgba(128, 128, 128, 0.8)', borderRadius: '10%' }} />
                <div className="preset-panel" style={{ flex: 1, background: 'rgba(128, 128, 128, 0.8)', borderRadius: '10%' }} />
            </div>,

            // Preset 2 - Left: up/down boxes, Right: one vertical div
            <div style={{ width: '100%', height: '100%', padding: '7.5%', display: 'flex', gap: '5%', boxSizing: 'border-box' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5%' }}>
                    <div className="preset-panel" style={{ flex: 1, background: 'rgba(128, 128, 128, 0.8)', borderRadius: '10%' }} />
                    <div className="preset-panel" style={{ flex: 1, background: 'rgba(128, 128, 128, 0.8)', borderRadius: '10%' }} />
                </div>
                <div className="preset-panel" style={{ flex: 1, background: 'rgba(128, 128, 128, 0.8)', borderRadius: '10%' }} />
            </div>
        ];

        registerLayoutPresets(presets);
    }, [registerLayoutPresets]);

    return null;
}
