import { useState } from 'react';
import LoginScreen from './LoginScreen.jsx';
import { authUser, createUser } from '../../Api/gateway.js';

export default function UserPanel({ onAuthenticated }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAuthSuccess = (payload) => {
        try {
            localStorage.setItem('auth', JSON.stringify(payload));
        } catch (_) {
            /* ignore storage errors */
        }
        if (typeof onAuthenticated === 'function') {
            onAuthenticated(payload);
        }
    };

    const handleLogin = async ({ username, password }) => {
        setError('');
        setLoading(true);
        try {
            const res = await authUser({ username, password });
            handleAuthSuccess(res);
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
            handleAuthSuccess(res);
        } catch (e) {
            const message = e?.response?.data?.message || e?.message || 'Registration failed';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <LoginScreen
                onLogin={handleLogin}
                onRegister={handleRegister}
                loading={loading}
                errorMessage={error}
            />
        </div>
    );
}
