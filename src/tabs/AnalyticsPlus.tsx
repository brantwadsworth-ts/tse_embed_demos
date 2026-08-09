// Analytics Plus — a liveboard on a self-contained Amazon theme (Squid-Ink
// navy + Amazon orange), deliberately different from the rest of the app. The
// theme is fixed (ignores the app's light/dark toggle): the host chrome is
// styled by the scoped .tab-analytics-plus / .apx-* CSS, and the embed gets the
// Amazon CSS-variable set via amazonCustomizations().
import { LiveboardEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { ANALYTICS_PLUS_LIVEBOARD_ID, LIVEBOARD_EMBED_FLAGS } from '../config';
import { amazonCustomizations } from '../lib/thoughtspot';

const Liveboard = LiveboardEmbed as unknown as (props: any) => JSX.Element;

export default function AnalyticsPlus() {
  return (
    <div className="tab-analytics-plus">
      <header className="apx-header">
        <div className="apx-brandmark" aria-hidden>
          <svg width="30" height="30" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7" fill="#ff9900" />
            <path
              d="M7 21.2c3 2 8 3 12 1.4 1.3-.5 2.6-1.2 3.7-2.2"
              stroke="#232f3e"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M22 18.2c1.4-.5 3 .1 3.4.8.4.7-.3 2.2-1.2 3" stroke="#232f3e" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <div className="apx-brandtext">
          <h1 className="apx-title">
            Analytics <span className="apx-plus">Plus</span>
          </h1>
          <p className="apx-sub">Amazon-themed analytics workspace</p>
        </div>
        <span className="apx-badge">Powered by ThoughtSpot</span>
      </header>

      <div className="apx-liveboard-wrapper">
        <Liveboard
          liveboardId={ANALYTICS_PLUS_LIVEBOARD_ID}
          fullHeight
          isLiveboardMasterpiecesEnabled
          frameParams={{ width: '100%' }}
          customizations={amazonCustomizations()}
          {...LIVEBOARD_EMBED_FLAGS}
        />
      </div>
    </div>
  );
}
