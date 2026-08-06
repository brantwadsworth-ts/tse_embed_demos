import {
  BarChart3,
  LayoutGrid,
  Sparkles,
  Workflow,
  Activity,
  ChevronDown,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SalesloftLogo from './SalesloftLogo';

export type TabId = 'my-analytics' | 'analytics' | 'cadences' | 'signals' | 'ask';

const TABS: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
  { id: 'my-analytics', label: 'My Reports', icon: LayoutGrid },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'cadences', label: 'Cadences', icon: Workflow },
  { id: 'signals', label: 'Signals', icon: Activity },
  { id: 'ask', label: 'Ask Salesloft', icon: Sparkles },
];

// Decorative Salesloft platform nav (sets product context, non-interactive).
const PLATFORM_NAV = ['People', 'Deals', 'Conversations'];

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export default function TopBar({ active, onChange }: Props) {
  const { username, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = (username || 'U').slice(0, 2).toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <SalesloftLogo className="topbar-logo" />
        <nav className="topbar-platform-nav">
          {PLATFORM_NAV.map((item) => (
            <span key={item} className="topbar-platform-link">
              {item}
            </span>
          ))}
        </nav>
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
        <button
          className="topbar-theme-toggle"
          onClick={toggle}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
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
