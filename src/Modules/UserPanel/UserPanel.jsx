import LiquidGlassDiv from "../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx";

export default function UserPanel({ userInfo }) {
    const username = userInfo?.username || 'User';
    const workspacesCount = userInfo?.workspaces?.length || 0;

    return (
        <div className="user-panel-container">
            <LiquidGlassDiv blurriness={0.5}>
                <div className="user-panel-content">
                    <h2 className="user-panel-username">{username}</h2>
                    <p>Workspaces: {workspacesCount}</p>
                </div>
            </LiquidGlassDiv>
        </div>
    );
}
