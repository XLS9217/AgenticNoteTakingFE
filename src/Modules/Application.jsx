import './Modules.css';
import WorkSpacePanel from "./WorkSpacePanel.jsx";
import ChatPanel from "./ChatPanel.jsx";

export default function Application(){
    return (
        <div className="application-container">
            <div className="layout-panel layout-panel--workspace">
                <WorkSpacePanel />
            </div>
            <div className="layout-panel layout-panel--chat">
                <ChatPanel />
            </div>
        </div>
    )
}