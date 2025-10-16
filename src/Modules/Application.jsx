import { useState } from 'react';
import './Modules.css';
import WorkSpacePanel from "./WorkSpacePanel/WorkSpacePanel.jsx";
import LoginScreen from "./UserPanel/LoginScreen.jsx";
import WorkspaceSelection from "./UserPanel/WorkspaceSelection.jsx";
import UserPanel from "./UserPanel/UserPanel.jsx";
import UtilBar from "../Components/UtilBar.jsx";

export default function Application(){
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeWorkspace, setActiveWorkspace] = useState('');
    const [currentView, setCurrentView] = useState('workspace');
    const [userInfo, setUserInfo] = useState(null);

    const handleUtilBarAction = (action) => {
        if (action === 'workspace') {
            setActiveWorkspace('');
            setCurrentView('workspace');
        } else if (action === 'user') {
            setCurrentView('user');
        } else if (action === 'logout') {
            setIsAuthenticated(false);
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

    return (
        <>
            <UtilBar onAction={handleUtilBarAction} />
            <div className="application-container">
                {currentView === 'user' ? (
                    <UserPanel userInfo={userInfo} />
                ) : activeWorkspace ? (
                    <WorkSpacePanel workspaceId={activeWorkspace} />
                ) : (
                    <WorkspaceSelection onWorkspaceSelect={(workspace) => setActiveWorkspace(workspace)} userInfo={userInfo} />
                )}
            </div>
        </>
    );
}
