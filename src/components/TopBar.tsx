import {
  BarChart3,
  LayoutGrid,
  Activity,
  BellRing,
  Sparkles,
  ChevronDown,
  LogOut,
  ClipboardList,
  LayoutDashboard,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export type TabId = 'my-analytics' | 'analytics' | 'cadences' | 'signals' | 'ask' | 'acr-report';

const TABS: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
  { id: 'my-analytics', label: 'My Reports', icon: LayoutGrid },
  { id: 'analytics', label: 'Surveillance', icon: BarChart3 },
  { id: 'cadences', label: 'Case Tracking', icon: ClipboardList },
  { id: 'signals', label: 'Alerts', icon: BellRing },
  { id: 'ask', label: 'MIDIS AI', icon: Sparkles },
];

const DASHBOARD_ITEMS: { id: TabId; label: string }[] = [
  { id: 'acr-report', label: 'ACR Report' },
];

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export default function TopBar({ active, onChange }: Props) {
  const { username, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashOpen, setDashOpen] = useState(false);
  const initials = (username || 'U').slice(0, 2).toUpperCase();

  const isDashActive = DASHBOARD_ITEMS.some((d) => d.id === active);

  return (
    <header className="topbar dphhs-topbar">
      {/* State / agency utility strip */}
      <div className="dphhs-utility-strip">
        <span className="dphhs-state-label">State of Montana</span>
        <span className="dphhs-divider">|</span>
        <span className="dphhs-agency-label">Department of Public Health &amp; Human Services</span>
      </div>

      {/* Main nav row */}
      <div className="dphhs-nav-row">
        <div className="topbar-left">
          <div className="dphhs-brand">
            <LayoutDashboard size={22} strokeWidth={2} className="dphhs-brand-icon" />
            <div className="dphhs-brand-text">
              <span className="dphhs-portal-name">MIDIS</span>
              <span className="dphhs-portal-sub">Disease Surveillance Portal</span>
            </div>
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

          {/* Data Dashboards dropdown */}
          <div
            className="topbar-dropdown-wrapper"
            onMouseEnter={() => setDashOpen(true)}
            onMouseLeave={() => setDashOpen(false)}
          >
            <button
              className={`topbar-tab ${isDashActive ? 'is-active' : ''}`}
              onClick={() => setDashOpen((o) => !o)}
            >
              <Activity size={17} strokeWidth={2} />
              <span>Data Dashboards</span>
              <ChevronDown size={14} />
            </button>
            {dashOpen && (
              <div className="topbar-dropdown">
                {DASHBOARD_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    className={`topbar-dropdown-item ${active === item.id ? 'is-active' : ''}`}
                    onClick={() => {
                      onChange(item.id);
                      setDashOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="topbar-right">
          <div className="topbar-user" onClick={() => setMenuOpen((o) => !o)}>
            <span className="topbar-avatar dphhs-avatar">{initials}</span>
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
      </div>
    </header>
  );
}
