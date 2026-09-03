import {
  AlignJustify,
  BarChart3,
  LayoutGrid,
  Bot,
  Network,
  Search,
  Users,
  DollarSign,
  Cloud,
  TrendingUp,
  FileOutput,
  Map,
} from 'lucide-react';
import type { TabId } from './TopBar';

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const ACTIVE_NAV: { id: TabId; icon: typeof BarChart3; label: string }[] = [
  { id: 'analytics',  icon: BarChart3,  label: 'Spend Analytics' },
  { id: 'my-reports', icon: LayoutGrid, label: 'My Reports' },
  { id: 'ask',        icon: Bot,        label: 'Ask Merlin' },
];

const STATIC_ICONS: { icon: typeof BarChart3; label: string }[] = [
  { icon: Network,    label: 'Supplier Network' },
  { icon: Search,     label: 'Search' },
  { icon: Users,      label: 'Stakeholders' },
  { icon: DollarSign, label: 'Savings' },
  { icon: Cloud,      label: 'Data Sources' },
  { icon: TrendingUp, label: 'Benchmarks' },
  { icon: FileOutput, label: 'Reports Export' },
  { icon: Map,        label: 'Regional View' },
];

export default function Sidebar({ active, onChange }: Props) {
  return (
    <aside className="app-sidebar">
      <button className="sidebar-item sidebar-hamburger" title="Menu" aria-label="Menu">
        <AlignJustify size={20} strokeWidth={1.75} />
      </button>

      <div className="sidebar-divider" />

      {ACTIVE_NAV.map(({ id, icon: Icon, label }) => (
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

      <div className="sidebar-divider" />

      {STATIC_ICONS.map(({ icon: Icon, label }) => (
        <button
          key={label}
          className="sidebar-item sidebar-static"
          title={label}
          aria-label={label}
          disabled
        >
          <Icon size={20} strokeWidth={1.75} />
        </button>
      ))}
    </aside>
  );
}
