import { ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export type TabId = 'analytics' | 'ask' | 'my-reports';

export default function TopBar() {
  const { username, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = (username || 'U').slice(0, 2).toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-wordmark">KEARNEY</span>
        <div className="topbar-divider" />
        <span className="topbar-product-label">SpendPro</span>
      </div>

      <div className="topbar-center">
        <button className="topbar-dropdown">
          Kearney Default Client <ChevronDown size={14} />
        </button>
        <button className="topbar-dropdown">
          Kearney Default Project <ChevronDown size={14} />
        </button>
      </div>

      <div className="topbar-right">
        <div className="topbar-user" onClick={() => setMenuOpen((o) => !o)}>
          <span className="topbar-avatar">{initials}</span>
          <span className="topbar-username">{username || 'User'}</span>
          <ChevronDown size={14} />
          {menuOpen && (
            <div className="topbar-menu">
              <button className="topbar-menu-item" onClick={logout}>
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
