import { useState } from 'react';
import './Modules.css';
import WorkSpacePanel from "./WorkSpacePanel.jsx";
import ChatPanel from "./ChatPanel/ChatPanel.jsx";
import UserPanel from "./UserPanel/UserPanel.jsx";
import WorkspaceSelection from "./UserPanel/WorkspaceSelection.jsx";
import UtilBar from "../Components/UtilBar.jsx";

export default function Application(){
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeWorkspace, setActiveWorkspace] = useState('');

    if (!isAuthenticated) {
        return <UserPanel onAuthenticated={() => setIsAuthenticated(true)} />;
    }

    return (
        <>
            <UtilBar />
            {activeWorkspace ? (
                <div className="application-container">
                    <div className="layout-panel layout-panel--workspace">
                        <WorkSpacePanel />
                    </div>
                    <div className="layout-panel layout-panel--chat">
                        <ChatPanel />
                    </div>
                </div>
            ) : (
                <div className="auth-container">
                    <WorkspaceSelection onWorkspaceSelect={(workspace) => setActiveWorkspace(workspace)} />
                </div>
            )}
        </>
    );
}
