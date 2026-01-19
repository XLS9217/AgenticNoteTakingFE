import { useState } from 'react';
import './UserPanel.css';
import { listBlueprints, getBlueprint } from '../../Api/gateway.js';
import BlueprintPanel from './BlueprintPanel/BlueprintPanel.jsx';

export default function UserPanel({ userInfo }) {
    const username = userInfo?.username || 'User';
    const [blueprints, setBlueprints] = useState([]);
    const [knowledgeExpanded, setKnowledgeExpanded] = useState(false);
    const [selectedBlueprint, setSelectedBlueprint] = useState(null);

    const handleKnowledgeClick = async () => {
        if (!knowledgeExpanded) {
            const data = await listBlueprints();
            setBlueprints(data);
        }
        setKnowledgeExpanded(!knowledgeExpanded);
    };

    const handleBlueprintClick = async (bpId) => {
        const blueprint = await getBlueprint(bpId);
        setSelectedBlueprint(blueprint);
    };

    return (
        <div className="user-panel">
            <aside className="user-panel-sidebar">
                <div className="user-panel-profile">
                    <div className="user-panel-avatar">
                        <img src="/icons/user.png" alt="User" />
                    </div>
                    <h2 className="user-panel-username">{username}</h2>
                </div>

                <nav className="user-panel-menu">
                    <div className="user-panel-menu-item" onClick={() => {}}>
                        <img src="/icons/user.png" alt="Profile" className="user-panel-menu-icon" />
                        <span>Profile</span>
                    </div>

                    <div className="user-panel-menu-item" onClick={handleKnowledgeClick}>
                        <img src="/icons/knowledge.png" alt="Knowledge Base" className="user-panel-menu-icon" />
                        <span>Blueprint Base</span>
                    </div>

                    {knowledgeExpanded && blueprints.map((bp) => (
                        <div key={bp.bp_id} className="user-panel-menu-item user-panel-menu-item--child" onClick={() => handleBlueprintClick(bp.bp_id)}>
                            <span>{bp.bp_name}</span>
                        </div>
                    ))}
                </nav>
            </aside>

            <main className="user-panel-content">
                <BlueprintPanel blueprint={selectedBlueprint} />
            </main>
        </div>
    );
}
