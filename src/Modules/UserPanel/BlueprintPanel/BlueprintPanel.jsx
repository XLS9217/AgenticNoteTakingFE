import { useState } from 'react';
import LiquidGlassDiv from '../../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx';
import LiquidGlassScrollBar from '../../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx';
import { listBlueprintInstances } from '../../../Api/gateway.js';
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

function getIdentifierField(bpFields) {
    for (const [name, field] of Object.entries(bpFields)) {
        if (field.identifier) return name;
    }
    return null;
}

function InstanceCard({ instance, identifierField, onClick }) {
    const identifier = identifierField ? instance.payload[identifierField] : instance.instance_id;
    return (
        <div className="bp-instance-card" onClick={onClick}>
            <span className="bp-instance-name">{identifier}</span>
        </div>
    );
}

function InstanceDetailPanel({ instance, onBack }) {
    return (
        <div className="bp-detail-panel">
            <div className="bp-detail-back" onClick={onBack}>
                <img src="/icons/chevron-double-up.svg" alt="Back" className="bp-back-icon" />
            </div>
            <LiquidGlassDiv blurriness={0.5}>
                <div className="bp-detail-content">
                    <div className="bp-detail-fields-full">
                        <LiquidGlassScrollBar>
                            <div className="bp-tree-list">
                                {Object.entries(instance.payload).map(([key, value]) => (
                                    <PayloadTree key={key} name={key} value={value} />
                                ))}
                            </div>
                        </LiquidGlassScrollBar>
                    </div>
                </div>
            </LiquidGlassDiv>
        </div>
    );
}

function PayloadTree({ name, value }) {
    const isArray = Array.isArray(value);
    const isObject = typeof value === 'object' && value !== null && !isArray;

    // Skip empty arrays or empty strings
    if (isArray && value.length === 0) return null;
    if (value === '' || value === null || value === undefined) return null;

    const renderBranchItems = (items) => {
        return items.map((item, idx) => (
            <div key={idx} className="bp-tree-branch">
                <span className="bp-tree-connector" />
                <div className="bp-tree-card">
                    {typeof item === 'object' ? (
                        <>
                            {item.title && <div className="bp-tree-title">{item.title}</div>}
                            {item.content && <div className="bp-tree-content">{item.content}</div>}
                        </>
                    ) : (
                        <span>{String(item)}</span>
                    )}
                </div>
            </div>
        ));
    };

    const renderNestedBranches = (obj) => {
        const entries = Object.entries(obj);
        return entries.map(([k, v], idx) => (
            <div key={k} className="bp-tree-branch">
                <span className="bp-tree-connector" />
                <div className="bp-tree-card">
                    <span className="bp-tree-key">{k}:</span> {String(v)}
                </div>
            </div>
        ));
    };

    return (
        <div className="bp-tree-node">
            <div className="bp-tree-label">{name}</div>
            <div className="bp-tree-children">
                {isArray ? (
                    renderBranchItems(value)
                ) : isObject ? (
                    renderNestedBranches(value)
                ) : (
                    <div className="bp-tree-branch">
                        <span className="bp-tree-connector" />
                        <div className="bp-tree-card">{String(value)}</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function BlueprintPanel({ blueprint }) {
    const [viewMode, setViewMode] = useState('blueprint');
    const [instances, setInstances] = useState([]);
    const [selectedInstance, setSelectedInstance] = useState(null);

    if (!blueprint) return null;

    const identifierField = getIdentifierField(blueprint.bp_fields);

    const handleToggle = async () => {
        if (viewMode === 'blueprint') {
            const data = await listBlueprintInstances(blueprint.bp_id);
            setInstances(data);
            setViewMode('instances');
        } else {
            setViewMode('blueprint');
        }
    };

    const handleInstanceClick = (instance) => {
        setSelectedInstance(instance);
    };

    const handleBack = () => {
        setSelectedInstance(null);
    };

    return (
        <div className="blueprint-panel">
            <div className={`bp-slide-container ${selectedInstance ? 'bp-slide-up' : ''}`}>
                <LiquidGlassDiv blurriness={0.5}>
                    <div className="blueprint-panel-content">
                        <div className="blueprint-info">
                            <h2 className="blueprint-name">{blueprint.bp_name}</h2>
                            <p className="blueprint-description">
                                {blueprint.bp_description || 'No description'}
                            </p>
                            <button className="bp-instances-btn" onClick={handleToggle}>
                                {viewMode === 'blueprint' ? 'View Instances' : 'View Blueprint'}
                            </button>
                        </div>
                        <div className="blueprint-divider" />
                        <div className="blueprint-fields">
                            <LiquidGlassScrollBar>
                                {viewMode === 'blueprint' ? (
                                    <div className="bp-field-list">
                                        {Object.entries(blueprint.bp_fields).map(([name, field]) => (
                                            <FieldCard key={name} name={name} field={field} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bp-instance-list">
                                        {instances.map((instance) => (
                                            <InstanceCard
                                                key={instance.instance_id}
                                                instance={instance}
                                                identifierField={identifierField}
                                                onClick={() => handleInstanceClick(instance)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </LiquidGlassScrollBar>
                        </div>
                    </div>
                </LiquidGlassDiv>

                {selectedInstance && (
                    <InstanceDetailPanel
                        instance={selectedInstance}
                        onBack={handleBack}
                    />
                )}
            </div>
        </div>
    );
}
