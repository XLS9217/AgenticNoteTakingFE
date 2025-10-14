import { useState } from 'react';
import LoginScreen from './LoginScreen.jsx';
import WorkspaceSelection from './WorkspaceSelection.jsx';

export default function UserPanel({ onComplete }) {
    const [stage, setStage] = useState('login'); // 'login' | 'workspace'

    const handleLogin = () => {
        setStage('workspace');
    };

    const handleWorkspaceSelect = (workspace) => {
        onComplete();
    };

    return (
        <div className="auth-container">
            {stage === 'login' ? (
                <LoginScreen onLogin={handleLogin} />
            ) : (
                <WorkspaceSelection onWorkspaceSelect={handleWorkspaceSelect} />
            )}
        </div>
    );
}
