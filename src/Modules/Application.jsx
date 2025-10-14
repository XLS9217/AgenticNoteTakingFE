import { useState } from 'react';
import './Modules.css';
import WorkSpacePanel from "./WorkSpacePanel.jsx";
import ChatPanel from "./ChatPanel/ChatPanel.jsx";
import UserPanel from "./UserPanel/UserPanel.jsx";

export default function Application(){
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
        return <UserPanel onComplete={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="application-container">
            <div className="layout-panel layout-panel--workspace">
                <WorkSpacePanel />
            </div>
            <div className="layout-panel layout-panel--chat">
                <ChatPanel />
            </div>
        </div>
    );
}