import { useRef } from 'react';
import { LiveboardEmbed, useEmbedRef } from '@thoughtspot/visual-embed-sdk/react';
import { ANALYTICS_LIVEBOARD_ID, LIVEBOARD_EMBED_FLAGS } from '../config';
import { liveboardCustomizations } from '../lib/thoughtspot';

const Liveboard = LiveboardEmbed as unknown as (props: any) => JSX.Element;

export default function SpendAnalytics() {
  const liveboardRef = useEmbedRef<typeof LiveboardEmbed>();
  const boardColRef = useRef<HTMLDivElement>(null);

  return (
    <div className="tab-analytics">
      <div className="analytics-toolbar">
        <div className="analytics-toolbar-left">
          <div>
            <h1 className="page-title">Spend Analytics</h1>
            <p className="page-subtitle">Procurement spend by category, supplier, and region</p>
          </div>
        </div>
      </div>

      <div className="analytics-split">
        <div className="analytics-board-col" ref={boardColRef}>
          <div className="liveboard-wrapper">
            <Liveboard
              ref={liveboardRef}
              liveboardId={ANALYTICS_LIVEBOARD_ID}
              fullHeight
              isLiveboardMasterpiecesEnabled
              frameParams={{ width: '100%' }}
              customizations={liveboardCustomizations()}
              {...LIVEBOARD_EMBED_FLAGS}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
