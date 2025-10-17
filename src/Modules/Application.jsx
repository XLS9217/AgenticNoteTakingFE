import { useState, useEffect } from 'react';
import './Modules.css';
import WorkSpacePanel from "./WorkSpacePanel/WorkSpacePanel.jsx";
import LoginScreen from "./UserPanel/LoginScreen.jsx";
import WorkspaceSelection from "./UserPanel/WorkspaceSelection.jsx";
import UserPanel from "./UserPanel/UserPanel.jsx";
import UtilBar from "../Components/UtilBar/UtilBar.jsx";
import { UtilBarProvider, useUtilBar } from "../Components/UtilBar/UtilBarProvider.jsx";

function ApplicationContent({ activeWorkspace, setActiveWorkspace, currentView, setCurrentView, setIsAuthenticated, userInfo }) {
    const { setDefault } = useUtilBar();

    useEffect(() => {
        setDefault([
            {
                key: 'user',
                icon: '/icons/icon_user.png',
                label: 'User',
                action: () => setCurrentView('user')
            },
            {
                key: 'background',
                icon: '/icons/icon_bg.png',
                label: 'Change Background',
                action: () => console.log('Background clicked')
            },
            {
                key: 'settings',
                icon: '/icons/icon_setting.png',
                label: 'Setting',
                action: () => console.log('Settings clicked')
            },
            {
                key: 'logout',
                icon: '/icons/icon_logout.png',
                label: 'Logout',
                action: () => setIsAuthenticated(false)
            }
        ]);
    }, [setDefault, setCurrentView, setIsAuthenticated]);

    const handleLeaveWorkspace = () => {
        setActiveWorkspace('');
        setCurrentView('workspace');
    };

    return (
        <>
            <UtilBar />
            <div className="application-container">
                {currentView === 'user' ? (
                    <UserPanel userInfo={userInfo} />
                ) : activeWorkspace ? (
                    <WorkSpacePanel workspaceId={activeWorkspace} onLeave={handleLeaveWorkspace} />
                ) : (
                    <WorkspaceSelection onWorkspaceSelect={(workspace) => setActiveWorkspace(workspace)} userInfo={userInfo} />
                )}
            </div>
        </>
    );
}

export default function Application(){
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeWorkspace, setActiveWorkspace] = useState('');
    const [currentView, setCurrentView] = useState('workspace');
    const [userInfo, setUserInfo] = useState(null);

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
        <UtilBarProvider>
            <ApplicationContent
                activeWorkspace={activeWorkspace}
                setActiveWorkspace={setActiveWorkspace}
                currentView={currentView}
                setCurrentView={setCurrentView}
                setIsAuthenticated={setIsAuthenticated}
                userInfo={userInfo}
            />
        </UtilBarProvider>
    );
}
