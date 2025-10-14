import LiquidGlassDiv from "../../Components/LiquidGlassDiv.jsx";

export default function WorkspaceSelection({ onWorkspaceSelect }) {
    const workspaces = ['Alpha', 'Beta', 'Theta'];

    return (
        <LiquidGlassDiv blurriness={0.5}>
            <div className="workspace-selection">
                <h1 className="auth-title">Choose Workspace</h1>
                <div className="workspace-list">
                    {workspaces.map((workspace) => (
                        <LiquidGlassDiv key={workspace} isButton={true}>
                            <button
                                className="workspace-item"
                                onClick={() => onWorkspaceSelect(workspace)}
                            >
                                {workspace}
                            </button>
                        </LiquidGlassDiv>
                    ))}
                </div>
            </div>
        </LiquidGlassDiv>
    );
}
