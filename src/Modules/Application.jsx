import { useState } from 'react';
import './Modules.css';
import WorkSpacePanel from "./WorkSpacePanel/WorkSpacePanel.jsx";
import LoginScreen from "./UserPanel/LoginScreen.jsx";
import WorkspaceSelection from "./UserPanel/WorkspaceSelection.jsx";
import UserPanel from "./UserPanel/UserPanel.jsx";
import AppHeader from "./AppHeader.jsx";
import { changeWorkspaceName } from "../Api/gateway.js";

export default function Application() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeWorkspace, setActiveWorkspace] = useState('');
    const [currentView, setCurrentView] = useState('workspace');
    const [userInfo, setUserInfo] = useState(null);
    const [workspaceName, setWorkspaceName] = useState('');

    const handleLeaveWorkspace = () => {
        setActiveWorkspace('');
        setWorkspaceName('');
        setCurrentView('workspace');
    };

    const handleMenuClick = () => {
        handleLeaveWorkspace();
    };

    const handleUserClick = () => {
        setCurrentView(currentView === 'user' ? 'workspace' : 'user');
    };

    const handleTitleChange = async (newName) => {
        if (activeWorkspace && newName) {
            try {
                await changeWorkspaceName(activeWorkspace, newName);
                setWorkspaceName(newName);
            } catch (error) {
                console.error('Failed to change workspace name:', error);
            }
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="auth-container">
                <LoginScreen
                    onAuthenticated={(payload, userInfo) => {
                        setUserInfo(userInfo);
                        setIsAuthenticated(true);
                    }}
                    onUserInfoFetched={setUserInfo}
                />
            </div>
        );
    }

    const isInWorkspace = !!activeWorkspace;
    const headerTitle = isInWorkspace ? (workspaceName || 'Untitled') : 'Notech';

    return (
        <>
            <AppHeader
                title={headerTitle}
                isEditable={isInWorkspace}
                onTitleChange={handleTitleChange}
                onMenuClick={handleMenuClick}
                onUserClick={handleUserClick}
                username={userInfo?.username}
            />
            <div className="application-container application-container--fullscreen">
                {currentView === 'user' ? (
                    <UserPanel userInfo={userInfo} />
                ) : activeWorkspace ? (
                    <WorkSpacePanel
                        workspaceId={activeWorkspace}
                        onLeave={handleLeaveWorkspace}
                        onWorkspaceNameChange={setWorkspaceName}
                    />
                ) : (
                    <WorkspaceSelection onWorkspaceSelect={(workspace, name) => {
                        setActiveWorkspace(workspace);
                        setWorkspaceName(name || 'Untitled');
                    }} userInfo={userInfo} />
                )}
            </div>
        </>
    );
}
