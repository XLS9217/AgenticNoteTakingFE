import LiquidGlassDiv from "../../Components/LiquidGlassDiv.jsx";

export default function WorkspaceSelection({ onWorkspaceSelect, userInfo }) {
    const workspaces = [
        { name: 'Alpha', thumbnail: null, lastRefined: 'October 14, 2025' },
        { name: 'Beta', thumbnail: null, lastRefined: 'October 11, 2025' },
        { name: 'Theta', thumbnail: null, lastRefined: 'October 10, 2025' },
        { name: 'Delta', thumbnail: null, lastRefined: 'September 22, 2025' }
    ];

    const username = userInfo?.username || 'User';

    return (
        <div className="workspace-selection-container">
            <div className="workspace-header">
                <h1 className="workspace-main-title">Workspace for {username}</h1>
            </div>
            <div className="workspace-grid-wrapper">
                <div className="workspace-grid">
                    <LiquidGlassDiv isButton={true}>
                        <button className="workspace-card workspace-card--new">
                            <div className="workspace-thumbnail">
                                <span className="workspace-placeholder workspace-placeholder--new">+</span>
                            </div>
                            <div className="workspace-info">
                                <h3 className="workspace-name">New Workspace</h3>
                                <p className="workspace-meta">Create a new workspace</p>
                            </div>
                        </button>
                    </LiquidGlassDiv>
                    {workspaces.map((workspace) => (
                        <LiquidGlassDiv key={workspace.name} isButton={true}>
                            <button
                                className="workspace-card"
                                onClick={() => onWorkspaceSelect(workspace.name)}
                            >
                                <div className="workspace-thumbnail">
                                    {workspace.thumbnail || <span className="workspace-placeholder">{workspace.name}</span>}
                                </div>
                                <div className="workspace-info">
                                    <h3 className="workspace-name">{workspace.name}</h3>
                                    <p className="workspace-meta">Last refined on {workspace.lastRefined}</p>
                                </div>
                            </button>
                        </LiquidGlassDiv>
                    ))}
                </div>
            </div>
        </div>
    );
}
