import { useState } from 'react';
import { LiveboardEmbed } from '@thoughtspot/visual-embed-sdk/react';
import {
  Action,
  CustomActionsPosition,
  CustomActionTarget,
} from '@thoughtspot/visual-embed-sdk';
import {
  ANALYTICS_LIVEBOARD_ID,
  SIGNALS_VIZ_ID,
  LIVEBOARD_EMBED_FLAGS,
  REENGAGE_ACTION_ID,
  REENGAGE_ACTION_NAME,
} from '../config';
import { tsCustomizations } from '../lib/thoughtspot';
import { useTheme } from '../context/ThemeContext';
import { buildSignalContext, SignalContext } from '../lib/signalContext';
import WinBackModal from '../components/WinBackModal';

const Liveboard = LiveboardEmbed as unknown as (props: any) => JSX.Element;

// Strip the answer chrome so only the table shows. forceTable + hideDataSources
// remove the chart/data panels; hiddenActions removes the toolbar + context-menu
// built-ins (Pin, Share, Download, etc.) while leaving our custom action.
const HIDDEN_ACTIONS = [
  Action.Pin,
  Action.Share,
  Action.ShareViz,
  Action.AddToFavorites,
  Action.Edit,
  Action.EditTML,
  Action.EditDetails,
  Action.Present,
  Action.SpotIQAnalyze,
  Action.SpotIQFollow,
  Action.Schedule,
  Action.Subscription,
  Action.Save,
  Action.SaveAsView,
  Action.MakeACopy,
  Action.EditACopy,
  Action.CopyLink,
  Action.Download,
  Action.DownloadAsPng,
  Action.DownloadAsPdf,
  Action.DownloadAsCsv,
  Action.DownloadAsXlsx,
  Action.ShowUnderlyingData,
  Action.Explore,
  Action.DrillDown,
  Action.AnswerChartSwitcher,
  Action.LiveboardInfo,
  Action.SyncToSheets,
  Action.SyncToOtherApps,
];

// CSS injected into the answer iframe to remove the right-side visualization
// toolbar/rail and the applied-filter chips, leaving only the table.
// (These ThoughtSpot class names are version-dependent — adjust via Inspect if
// a new release renames them.)
const H = { display: 'none !important' };
const HIDE_CHROME_RULES: Record<string, Record<string, string>> = {
  // right-side viz toolbar / chart switcher / config rail
  '[data-tour-id="chart-switcher-id"]': H,
  '[class*="chart-switcher" i]': H,
  '[class*="ChartSwitcher" i]': H,
  '[class*="vizSwitcher" i]': H,
  '[class*="visualizationProperties" i]': H,
  '[class*="vizPropertiesPanel" i]': H,
  '[class*="visualization-editor" i]': H,
  '[class*="answerActions" i]': H,
  '[class*="answer-actions" i]': H,
  '[class*="vizActions" i]': H,
  '[class*="answerToolbar" i]': H,
  '[class*="rightPanel" i]': H,
  '[class*="sidePanel" i]': H,
  '[class*="editPanel" i]': H,
  // applied filter chips
  '[class*="chip" i]': H,
  '[class*="appliedFilter" i]': H,
  '[class*="filterChips" i]': H,
  '[data-testid*="filter-chip" i]': H,
  '[data-testid*="answer-filter" i]': H,
  '[class*="pinboard-filter" i]': H,
};

export default function Signals() {
  const { theme } = useTheme();
  const [ctx, setCtx] = useState<SignalContext | null>(null);

  // ThoughtSpot fires this when the rep clicks "Re-engage cadence" on a row.
  function onCustomAction(payload: any) {
    const data = payload?.data ?? payload;
    // Logged so the exact payload shape is inspectable in DevTools.
    console.log('[Re-engage cadence] custom action payload', payload);
    if (data?.id !== REENGAGE_ACTION_ID) return;
    const context = buildSignalContext(data);
    console.log('[Re-engage cadence] extracted context', context);
    setCtx(context);
  }

  return (
    <div className="tab-signals">
      <div className="signals-header">
        <h1 className="page-title">Signals</h1>
        <p className="page-subtitle">
          At-risk accounts and re-engagement opportunities. Right-click a row and
          choose <strong>{REENGAGE_ACTION_NAME}</strong> to launch a Win-Back
          Cadence.
        </p>
      </div>

      <div className="signals-embed">
        <Liveboard
          key={theme}
          liveboardId={ANALYTICS_LIVEBOARD_ID}
          vizId={SIGNALS_VIZ_ID}
          hideLiveboardHeader
          hiddenActions={HIDDEN_ACTIONS}
          frameParams={{ width: '100%', height: '100%' }}
          customizations={tsCustomizations(theme, false, HIDE_CHROME_RULES)}
          customActions={[
            {
              id: REENGAGE_ACTION_ID,
              name: REENGAGE_ACTION_NAME,
              position: CustomActionsPosition.CONTEXTMENU,
              // Now a viz-level action, scoped to this one visualization.
              target: CustomActionTarget.VIZ,
              metadataIds: {
                liveboardIds: [ANALYTICS_LIVEBOARD_ID],
                vizIds: [SIGNALS_VIZ_ID],
              },
            },
          ]}
          onCustomAction={onCustomAction}
          {...LIVEBOARD_EMBED_FLAGS}
        />
      </div>

      <WinBackModal open={!!ctx} context={ctx} onClose={() => setCtx(null)} />
    </div>
  );
}
