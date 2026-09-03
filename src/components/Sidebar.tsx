import { BarChart3, LayoutGrid, Bot } from 'lucide-react';
import type { TabId } from './TopBar';

const NAV: { id: TabId; icon: typeof BarChart3; label: string }[] = [
  { id: 'analytics',  icon: BarChart3,   label: 'Spend Analytics' },
  { id: 'my-reports', icon: LayoutGrid,  label: 'My Reports' },
  { id: 'ask',        icon: Bot,         label: 'Ask Merlin' },
];

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export default function Sidebar({ active, onChange }: Props) {
  return (
    <aside className="app-sidebar">
      {NAV.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          className={`sidebar-item ${active === id ? 'is-active' : ''}`}
          onClick={() => onChange(id)}
          title={label}
          aria-label={label}
        >
          <Icon size={20} strokeWidth={1.75} />
        </button>
      ))}
    </aside>
  );
}
