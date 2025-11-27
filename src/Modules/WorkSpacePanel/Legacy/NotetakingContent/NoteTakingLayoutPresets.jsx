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
                    <PresetVerticalHolder width="30%">
                        <PresetUnitHolder canSourcePanel canNotePanel />
                    </PresetVerticalHolder>
                    <PresetVerticalHolder width="30%">
                        <PresetUnitHolder canSourcePanel canNotePanel canChatBox />
                    </PresetVerticalHolder>
                    <PresetVerticalHolder width="30%">
                        <PresetUnitHolder canSourcePanel canNotePanel canChatBox />
                    </PresetVerticalHolder>
                </PresetHorizontalHolder>
            </PresetGroupBox>,

            // Preset 2 - Left: two stacked boxes, Right: one column
            <PresetGroupBox>
                <PresetHorizontalHolder>
                    <PresetVerticalHolder width="47.5%">
                        <PresetUnitHolder canSourcePanel canNotePanel />
                        <PresetUnitHolder canSourcePanel canNotePanel />
                    </PresetVerticalHolder>
                    <PresetVerticalHolder width="47.5%">
                        <PresetUnitHolder canSourcePanel canNotePanel canChatBox />
                    </PresetVerticalHolder>
                </PresetHorizontalHolder>
            </PresetGroupBox>
        ];

        registerLayoutPresets(presets);
    }, [registerLayoutPresets]);

    return null;
}
