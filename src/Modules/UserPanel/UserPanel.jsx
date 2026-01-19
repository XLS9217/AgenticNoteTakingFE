import './UserPanel.css';

export default function UserPanel({ userInfo }) {
    const username = userInfo?.username || 'User';

    const menuItems = [
        { icon: '/icons/user.png', label: 'Profile' },
        { icon: '/icons/knowledge.png', label: 'Knowledge Base' },
    ];

    return (
        <div className="user-panel">
            <aside className="user-panel-sidebar">
                <div className="user-panel-profile">
                    <div className="user-panel-avatar">
                        <img src="/icons/user.png" alt="User" />
                    </div>
                    <h2 className="user-panel-username">{username}</h2>
                </div>

                <nav className="user-panel-menu">
                    {menuItems.map((item, index) => (
                        <div key={index} className="user-panel-menu-item">
                            <img src={item.icon} alt={item.label} className="user-panel-menu-icon" />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </nav>
            </aside>

            <main className="user-panel-content">
                {/* Right side content will go here */}
            </main>
        </div>
    );
}
