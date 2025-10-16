import { useState, useEffect } from 'react';
import LiquidGlassDiv from "../../Components/LiquidGlassDiv.jsx";
import LiquidGlassScrollBar from "../../Components/LiquidGlassScrollBar.jsx";
import { createWorkspace, getWorkspacesByOwner, deleteWorkspace } from "../../Api/gateway.js";

export default function WorkspaceSelection({ onWorkspaceSelect, userInfo }) {
    const username = userInfo?.username || 'User';
    const [workspaces, setWorkspaces] = useState([]);

    const fetchWorkspaces = async () => {
        try {
            const ownerWorkspaces = await getWorkspacesByOwner(username);
            console.log('Workspaces by owner:', ownerWorkspaces);
            setWorkspaces(ownerWorkspaces);
        } catch (error) {
            console.error('Failed to fetch workspaces:', error);
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, [username]);

    const handleNewWorkspace = async () => {
        try {
            const response = await createWorkspace({
                workspace_name: "Untitled",
                owner: username,
                note: "",
                transcript: ""
            });
            console.log('Create workspace response:', response);

            // Enter the newly created workspace
            onWorkspaceSelect(response.workspace_id);
        } catch (error) {
            console.error('Failed to create workspace:', error);
        }
    };

    const handleDeleteWorkspace = async (e, workspaceId) => {
        e.stopPropagation(); // Prevent card click event
        try {
            await deleteWorkspace(workspaceId);
            // Refresh workspace list after deletion
            fetchWorkspaces();
        } catch (error) {
            console.error('Failed to delete workspace:', error);
        }
    };

    return (
        <div className="workspace-selection-container">
            <div className="workspace-header">
                <h1 className="workspace-main-title">Workspace for {username}</h1>
            </div>
            <LiquidGlassScrollBar className="workspace-grid-wrapper">
                <div className="workspace-grid">
                    <LiquidGlassDiv isButton={true}>
                        <button className="workspace-card workspace-card--new" onClick={handleNewWorkspace}>
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
                        <div key={workspace.workspace_id} className="workspace-card-container">
                            <button
                                className="workspace-delete-btn"
                                onClick={(e) => handleDeleteWorkspace(e, workspace.workspace_id)}
                                aria-label="Delete workspace"
                            >
                                <img src="/icon_trash.png" alt="Delete" />
                            </button>
                            <LiquidGlassDiv isButton={true}>
                                <button
                                    className="workspace-card"
                                    onClick={() => onWorkspaceSelect(workspace.workspace_id)}
                                >
                                    <div className="workspace-thumbnail">
                                        <span className="workspace-placeholder">{workspace.workspace_name}</span>
                                    </div>
                                    <div className="workspace-info">
                                        <h3 className="workspace-name">{workspace.workspace_name}</h3>
                                        <p className="workspace-meta">Last updated: {new Date(workspace.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </button>
                            </LiquidGlassDiv>
                        </div>
                    ))}
                </div>
            </LiquidGlassScrollBar>
        </div>
    );
}
