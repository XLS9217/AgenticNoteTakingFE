import { useEffect } from "react";
import {
    usePanelLayoutBar,
    PresetGroupBox,
    PresetHorizontalHolder,
    PresetVerticalHolder,
    PresetUnitHolder
} from "../../../Components/PanelLayoutBar/PanelLayoutBarProvider.jsx";

export default function NoteTakingLayoutPresets() {
    const { registerLayoutPresets } = usePanelLayoutBar();

    useEffect(() => {
        const presets = [
            // Preset 1 - Three columns
            <PresetGroupBox>
                <PresetHorizontalHolder>
                    <PresetUnitHolder />
                    <PresetUnitHolder />
                    <PresetUnitHolder />
                </PresetHorizontalHolder>
            </PresetGroupBox>,

            // Preset 2 - Left: two stacked boxes, Right: one column
            <PresetGroupBox>
                <PresetHorizontalHolder>
                    <PresetVerticalHolder>
                        <PresetUnitHolder />
                        <PresetUnitHolder />
                    </PresetVerticalHolder>
                    <PresetUnitHolder />
                </PresetHorizontalHolder>
            </PresetGroupBox>
        ];

        registerLayoutPresets(presets);
    }, [registerLayoutPresets]);

    return null;
}
