import { useState } from 'react';
import LiquidGlassDiv from "../../Components/LiquidGlassDiv.jsx";

export default function LoginScreen({ onLogin, onRegister, loading = false, errorMessage = '' }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const canSubmit = username.trim().length > 0 && password.trim().length > 0 && !loading;

    const handleLoginClick = (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        if (typeof onLogin === 'function') {
            onLogin({ username, password });
        }
    };

    const handleRegisterClick = (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        if (typeof onRegister === 'function') {
            onRegister({ username, password });
        } else if (typeof onLogin === 'function') {
            // Fallback: proceed like login if register handler not provided
            onLogin({ username, password });
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
                {errorMessage ? (
                    <div className="auth-error" style={{ color: '#ff6666', marginTop: '8px' }}>
                        {errorMessage}
                    </div>
                ) : null}
            </form>
        </LiquidGlassDiv>
    );
}
