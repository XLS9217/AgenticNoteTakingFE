import { useState } from 'react';
import './Modules.css';
import WorkSpacePanel from "./WorkSpacePanel/WorkSpacePanel.jsx";
import LoginScreen from "./UserPanel/LoginScreen.jsx";
import WorkspaceSelection from "./UserPanel/WorkspaceSelection.jsx";
import UserPanel from "./UserPanel/UserPanel.jsx";
import AppHeader from "./AppHeader.jsx";
import { changeWorkspaceName } from "../Api/gateway.js";
import CommendDispatcher, { ChannelEnum } from "../Util/CommendDispatcher.js";

export default function Application() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeWorkspace, setActiveWorkspace] = useState('');
    const [currentView, setCurrentView] = useState('workspace');
    const [userInfo, setUserInfo] = useState(null);
    const [workspaceName, setWorkspaceName] = useState('');
    const [slideDirection, setSlideDirection] = useState('');
    const [pendingWorkspace, setPendingWorkspace] = useState(null);

    const handleWorkspaceSelect = (workspace, name) => {
        setPendingWorkspace({ id: workspace, name: name || 'Untitled' });
        setSlideDirection('slide-left');
        setTimeout(() => {
            setActiveWorkspace(workspace);
            setWorkspaceName(name || 'Untitled');
            setPendingWorkspace(null);
        }, 300);
    };

    const handleLeaveWorkspace = () => {
        setSlideDirection('slide-right');
        CommendDispatcher.Publish2Channel(ChannelEnum.REFRESH_CONTROL, { target: 'workspaces' });
        setTimeout(() => {
            setActiveWorkspace('');
            setWorkspaceName('');
            setSlideDirection('');
        }, 300);
    };

    const handleMenuClick = () => {
        if (activeWorkspace) {
            handleLeaveWorkspace();
        }
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

    if (currentView === 'user') {
        return (
            <>
                <AppHeader
                    title={headerTitle}
                    isEditable={false}
                    onTitleChange={handleTitleChange}
                    onMenuClick={handleMenuClick}
                    onUserClick={handleUserClick}
                    username={userInfo?.username}
                />
                <div className="application-container application-container--fullscreen">
                    <UserPanel userInfo={userInfo} />
                </div>
            </>
        );
    }

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
                <div className="view-container">
                    <div className={`view-slide view-slide--selection ${slideDirection}`}>
                        <WorkspaceSelection
                            onWorkspaceSelect={handleWorkspaceSelect}
                            userInfo={userInfo}
                        />
                    </div>
                    <div className={`view-slide view-slide--workspace ${slideDirection}`}>
                        {(activeWorkspace || pendingWorkspace) && (
                            <WorkSpacePanel
                                workspaceId={activeWorkspace || pendingWorkspace?.id}
                                onLeave={handleLeaveWorkspace}
                                onWorkspaceNameChange={setWorkspaceName}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
