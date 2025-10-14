import { useState } from 'react';
import LoginScreen from './LoginScreen.jsx';
import WorkspaceSelection from './WorkspaceSelection.jsx';
import { authUser, createUser } from '../../Api/gateway.js';

export default function UserPanel({ onComplete }) {
    const [stage, setStage] = useState('login'); // 'login' | 'workspace'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async ({ username, password }) => {
        setError('');
        setLoading(true);
        try {
            const res = await authUser({ username, password });
            // Persist auth info if provided
            try {
                localStorage.setItem('auth', JSON.stringify(res));
            } catch (_) { /* ignore storage errors */ }
            setStage('workspace');
        } catch (e) {
            const message = e?.response?.data?.message || e?.message || 'Login failed';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async ({ username, password }) => {
        setError('');
        setLoading(true);
        try {
            const res = await createUser({ username, password });
            // Optionally auto-login after registration using response
            try {
                localStorage.setItem('auth', JSON.stringify(res));
            } catch (_) { /* ignore storage errors */ }
            setStage('workspace');
        } catch (e) {
            const message = e?.response?.data?.message || e?.message || 'Registration failed';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleWorkspaceSelect = (workspace) => {
        onComplete();
    };

    return (
        <div className="auth-container">
            {stage === 'login' ? (
                <LoginScreen onLogin={handleLogin} onRegister={handleRegister} loading={loading} errorMessage={error} />
            ) : (
                <WorkspaceSelection onWorkspaceSelect={handleWorkspaceSelect} />
            )}
        </div>
    );
}
