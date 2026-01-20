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

function FieldCard({ name, field }) {
    return (
        <div className="bp-field-card">
            <div className="bp-field-header">
                <span className="bp-field-name">{name}</span>
                {field.identifier && <span className="bp-field-tag">{ATTR_CN.identifier}</span>}
                {field.inbound_once && <span className="bp-field-tag">{ATTR_CN.inbound_once}</span>}
            </div>
            {field.field_desc && (
                <div className="bp-field-desc">{field.field_desc}</div>
            )}
            {field.inbound_rule && (
                <div className="bp-field-rule">
                    <span className="bp-field-label">{ATTR_CN.inbound_rule}:</span> {field.inbound_rule}
                </div>
            )}
            {field.list_rule && (
                <div className="bp-field-rule">
                    <span className="bp-field-label">{ATTR_CN.list_rule}:</span> {field.list_rule}
                </div>
            )}
            {field.nested_fields && (
                <div className="bp-field-nested">
                    <span className="bp-field-label">{ATTR_CN.nested_fields}:</span>
                    <div className="bp-field-nested-list">
                        {Object.entries(field.nested_fields).map(([nestedName, nestedField]) => (
                            <FieldCard key={nestedName} name={nestedName} field={nestedField} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

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
                            <div className="bp-field-list">
                                {Object.entries(blueprint.bp_fields).map(([name, field]) => (
                                    <FieldCard key={name} name={name} field={field} />
                                ))}
                            </div>
                        </LiquidGlassScrollBar>
                    </div>
                </div>
            </LiquidGlassDiv>
        </div>
    );
}
