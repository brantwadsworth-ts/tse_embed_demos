import { BarChart3, LayoutGrid, Sparkles, ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export type TabId = 'analytics' | 'ask' | 'my-reports';

const TABS: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
  { id: 'analytics', label: 'Spend Analytics', icon: BarChart3 },
  { id: 'ask', label: 'Ask Merlin', icon: Sparkles },
  { id: 'my-reports', label: 'My Reports', icon: LayoutGrid },
];

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

function KearneyLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 140 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Kearney"
    >
      <text
        x="0"
        y="24"
        fontFamily="Inter, Helvetica Neue, sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="#ffffff"
        letterSpacing="-0.5"
      >
        Kearney
      </text>
    </svg>
  );
}

export default function TopBar({ active, onChange }: Props) {
  const { username, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = (username || 'U').slice(0, 2).toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-brand">
          <KearneyLogo className="topbar-logo" />
          <span className="topbar-product">SpendPro</span>
        </div>
      </div>

      <nav className="topbar-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`topbar-tab ${active === tab.id ? 'is-active' : ''}`}
              onClick={() => onChange(tab.id)}
            >
              <Icon size={17} strokeWidth={2} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="topbar-right">
        <div className="topbar-user" onClick={() => setMenuOpen((o) => !o)}>
          <span className="topbar-avatar">{initials}</span>
          <span className="topbar-username">{username || 'User'}</span>
          <ChevronDown size={16} />
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
