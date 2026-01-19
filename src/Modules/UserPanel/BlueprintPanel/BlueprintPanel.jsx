import LiquidGlassDiv from '../../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx';
import './BlueprintPanel.css';

export default function BlueprintPanel({ blueprint }) {
    if (!blueprint) return null;

    return (
        <div className="blueprint-panel" >
            <LiquidGlassDiv blurriness={0.5}>
                <div className="blueprint-panel-content">
                    <pre className="blueprint-json">
                        {JSON.stringify(blueprint, null, 2)}
                    </pre>
                </div>
            </LiquidGlassDiv>
        </div>
    );
}
