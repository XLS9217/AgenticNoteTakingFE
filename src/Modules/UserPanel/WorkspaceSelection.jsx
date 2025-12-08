import { useState, useEffect } from 'react';
import LiquidGlassDiv from "../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx";
import LiquidGlassScrollBar from "../../Components/LiquidGlassGlobal/LiquidGlassScrollBar.jsx";
import { createWorkspace, getMyWorkspaces, deleteWorkspace } from "../../Api/gateway.js";

function NewWorkspaceCard({ onClick }) {
    return (
        <LiquidGlassDiv isButton={true} variant="card">
            <div className="workspace-card workspace-card--new" onClick={onClick}>
                <div className="workspace-card-new-icon">+</div>
                <div className="workspace-card-new-label">Create new</div>
            </div>
        </LiquidGlassDiv>
    );
}

function WorkspaceCard({ workspace, onSelect, onMenuClick, onDelete, isMenuOpen }) {
    return (
        <LiquidGlassDiv isButton={true} variant="card">
            <div className="workspace-card" onClick={() => onSelect(workspace.workspace_id, workspace.workspace_name)}>
                <img src="/icons/icon_note.png" alt="Note" className="workspace-card-icon" />
                <button
                    className="workspace-card-menu"
                    onClick={(e) => onMenuClick(e, workspace.workspace_id)}
                >
                    ⋮
                </button>
                {isMenuOpen && (
                    <div className="workspace-card-dropdown">
                        <button onClick={(e) => onDelete(e, workspace.workspace_id)}>Delete</button>
                    </div>
                )}
                <div className="workspace-card-info">
                    <div className="workspace-card-title">{workspace.workspace_name}</div>
                    <div className="workspace-card-date">{new Date(workspace.updated_at).toLocaleDateString()}</div>
                </div>
            </div>
        </LiquidGlassDiv>
    );
}

export default function WorkspaceSelection({ onWorkspaceSelect, userInfo }) {
    const username = userInfo?.username || 'User';
    const [workspaces, setWorkspaces] = useState([]);
    const [openMenuId, setOpenMenuId] = useState(null);

    const fetchWorkspaces = async () => {
        try {
            const ownerWorkspaces = await getMyWorkspaces();
            setWorkspaces(ownerWorkspaces);
        } catch (error) {
            console.error('Failed to fetch workspaces:', error);
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, [username]);

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        if (openMenuId) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [openMenuId]);

    const handleNewWorkspace = async () => {
        try {
            const response = await createWorkspace({
                workspace_name: "Untitled",
                owner: username,
                note: "",
                transcript: ""
            });
            onWorkspaceSelect(response.workspace_id, "Untitled");
        } catch (error) {
            console.error('Failed to create workspace:', error);
        }
    };

    const handleMenuClick = (e, workspaceId) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === workspaceId ? null : workspaceId);
    };

    const handleDeleteWorkspace = async (e, workspaceId) => {
        e.stopPropagation();
        setOpenMenuId(null);
        try {
            await deleteWorkspace(workspaceId);
            fetchWorkspaces();
        } catch (error) {
            console.error('Failed to delete workspace:', error);
        }
    };

    return (
        <LiquidGlassScrollBar className="workspace-selection-container">
            <div className="workspace-grid">
                <NewWorkspaceCard onClick={handleNewWorkspace} />
                {workspaces.map((workspace) => (
                    <WorkspaceCard
                        key={workspace.workspace_id}
                        workspace={workspace}
                        onSelect={onWorkspaceSelect}
                        onMenuClick={handleMenuClick}
                        onDelete={handleDeleteWorkspace}
                        isMenuOpen={openMenuId === workspace.workspace_id}
                    />
                ))}
            </div>
        </LiquidGlassScrollBar>
    );
}
