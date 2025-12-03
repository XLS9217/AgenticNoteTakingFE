import { useState } from 'react';
import './AppHeader.css';

export default function AppHeader({ title, isEditable, onTitleChange, onMenuClick, onUserClick, username }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(title);

    const handleTitleClick = () => {
        if (isEditable) {
            setEditValue(title);
            setIsEditing(true);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newTitle = editValue.trim();
            if (newTitle && newTitle !== title) {
                onTitleChange?.(newTitle);
            }
            setIsEditing(false);
        } else if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    return (
        <header className="app-header">
            <div className="app-header-left">
                <img
                    src="/icons/icon_venus.png"
                    alt="Notech"
                    className="app-header-logo"
                />
                {isEditing ? (
                    <input
                        type="text"
                        className="app-header-title-input"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        autoFocus
                    />
                ) : (
                    <span
                        className={`app-header-title ${isEditable ? 'app-header-title--editable' : ''}`}
                        onClick={handleTitleClick}
                    >
                        {title}
                    </span>
                )}
            </div>
            <div className="app-header-right">
                {username && <span className="app-header-username" onClick={onUserClick}>{username}</span>}
                <img
                    src="/icons/menu.png"
                    alt="Menu"
                    className="app-header-menu"
                    onClick={onMenuClick}
                />
            </div>
        </header>
    );
}
