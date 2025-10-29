import { useState } from 'react';
import LiquidGlassDiv from "../../Components/LiquidGlassOutter/LiquidGlassDiv.jsx";
import { authUser, createUser, getUserInfo } from '../../Api/gateway.js';

export default function LoginScreen({ onAuthenticated, onUserInfoFetched }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const canSubmit = username.trim().length > 0 && password.trim().length > 0 && !loading;

    const handleAuthSuccess = async (payload) => {
        try {
            localStorage.setItem('auth', JSON.stringify(payload));
        } catch (_) {
            /* ignore storage errors */
        }

        // Fetch user info
        let userInfo = null;
        try {
            userInfo = await getUserInfo(username);
            console.log('User Info:', userInfo);
        } catch (e) {
            console.error('Failed to fetch user info:', e);
        }

        // Call callbacks with userInfo
        if (typeof onUserInfoFetched === 'function') {
            onUserInfoFetched(userInfo);
        }
        if (typeof onAuthenticated === 'function') {
            onAuthenticated(payload, userInfo);
        }
    };

    const handleLoginClick = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setError('');
        setLoading(true);
        try {
            const res = await authUser({ username, password });
            await handleAuthSuccess(res);
        } catch (e) {
            const message = e?.response?.data?.message || e?.message || 'Login failed';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterClick = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setError('');
        setLoading(true);
        try {
            const res = await createUser({ username, password });
            await handleAuthSuccess(res);
        } catch (e) {
            const message = e?.response?.data?.message || e?.message || 'Registration failed';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LiquidGlassDiv blurriness={0.5}>
            <form className="login-form">
                <h1 className="auth-title">Login</h1>
                <input
                    type="text"
                    placeholder="Username"
                    className="auth-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                />
                <div className="auth-actions" style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button type="button" className="auth-button" onClick={handleLoginClick} disabled={!canSubmit}>
                        {loading ? 'Signing in...' : 'Login'}
                    </button>
                    <button type="button" className="auth-button" onClick={handleRegisterClick} disabled={!canSubmit}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </div>
                {error ? (
                    <div className="auth-error" style={{ color: '#ff6666', marginTop: '8px' }}>
                        {error}
                    </div>
                ) : null}
            </form>
        </LiquidGlassDiv>
    );
}
