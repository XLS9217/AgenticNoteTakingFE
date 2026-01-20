import LiquidGlassDiv from '../../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx';
import LiquidGlassScrollBar from '../../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx';
import './BlueprintPanel.css';

const ATTR_CN = {
    field_desc: '字段描述',
    inbound_rule: '录入规则',
    inbound_once: '单次录入',
    identifier: '标识字段',
    list_rule: '分组规则',
    nested_fields: '嵌套字段'
};

export default function BlueprintPanel({ blueprint }) {
    if (!blueprint) return null;

    return (
        <div className="blueprint-panel">
            <LiquidGlassDiv blurriness={0.5}>
                <div className="blueprint-panel-content">
                    <div className="blueprint-info">
                        <h2 className="blueprint-name">{blueprint.bp_name}</h2>
                        <p className="blueprint-description">
                            {blueprint.bp_description || 'No description'}
                        </p>
                    </div>
                    <div className="blueprint-divider" />
                    <div className="blueprint-fields">
                        <LiquidGlassScrollBar>
                            <pre className="blueprint-json">
                                {JSON.stringify(blueprint.bp_fields, null, 2)}
                            </pre>
                        </LiquidGlassScrollBar>
                    </div>
                </div>
            </LiquidGlassDiv>
        </div>
    );
}
