import { LiveboardEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { ACR_LIVEBOARD_ID, LIVEBOARD_EMBED_FLAGS } from '../config';

export default function AcrReport() {
  return (
    <div className="acr-report">
      <div className="acr-header">
        <h2 className="acr-title">Annual Case Report (ACR)</h2>
        <p className="acr-subtitle">MIDIS Disease Surveillance Reconciliation Dashboard</p>
      </div>

      <div className="acr-body">
        <LiveboardEmbed
          liveboardId={ACR_LIVEBOARD_ID}
          fullHeight
          frameParams={{ width: '100%' }}
          additionalFlags={LIVEBOARD_EMBED_FLAGS}
        />
      </div>
    </div>
  );
}
