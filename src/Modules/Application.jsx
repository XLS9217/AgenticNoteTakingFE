import { useState } from 'react';
import './Modules.css';
import WorkSpacePanel from "./WorkSpacePanel/WorkSpacePanel.jsx";
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
            <div className="application-container">
                {activeWorkspace ? (
                    <WorkSpacePanel />
                ) : (
                    <WorkspaceSelection onWorkspaceSelect={(workspace) => setActiveWorkspace(workspace)} />
                )}
            </div>
        </>
    );
}
