import { useState } from 'react';
import LiquidGlassDiv from "../../Components/LiquidGlassDiv.jsx";

export default function LoginScreen({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin();
    };

    return (
        <LiquidGlassDiv blurriness={0.5}>
            <form className="login-form" onSubmit={handleSubmit}>
                <h1 className="auth-title">Login</h1>
                <input
                    type="text"
                    placeholder="Username"
                    className="auth-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" className="auth-button">
                    Continue
                </button>
            </form>
        </LiquidGlassDiv>
    );
}
