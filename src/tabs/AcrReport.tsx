import { useState } from 'react';
import { LiveboardEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { ACR_LIVEBOARD_ID, LIVEBOARD_EMBED_FLAGS } from '../config';
import { liveboardCustomizations } from '../lib/thoughtspot';
import { useTheme } from '../context/ThemeContext';
import DeliverableGauges from '../components/DeliverableGauges';

type AcrTab = 'deliverables' | 'linelist' | 'jurisdiction-completeness' | 'jurisdiction-counts' | 'timeliness';

const TABS: { id: AcrTab; label: string }[] = [
  { id: 'deliverables', label: 'Deliverables Snapshot' },
  { id: 'linelist', label: 'Reconciliation Line List' },
  { id: 'jurisdiction-completeness', label: 'Jurisdiction Completeness' },
  { id: 'jurisdiction-counts', label: 'Jurisdiction Case Counts' },
  { id: 'timeliness', label: 'Timeliness Metrics' },
];

export default function AcrReport() {
  const [activeTab, setActiveTab] = useState<AcrTab>('deliverables');
  const { theme } = useTheme();
  const customizations = liveboardCustomizations(theme);

  return (
    <div className="acr-report">
      <div className="acr-header">
        <h2 className="acr-title">Annual Case Report (ACR)</h2>
        <p className="acr-subtitle">MIDIS Disease Surveillance Reconciliation Dashboard</p>
      </div>

      <div className="acr-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`acr-tab ${activeTab === t.id ? 'is-active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="acr-body">
        {activeTab === 'deliverables' && <DeliverableGauges />}

        {activeTab !== 'deliverables' && (
          <LiveboardEmbed
            liveboardId={ACR_LIVEBOARD_ID}
            customizations={customizations}
            frameParams={{ height: '100%', width: '100%' }}
            additionalFlags={LIVEBOARD_EMBED_FLAGS}
          />
        )}
      </div>
    </div>
  );
}
