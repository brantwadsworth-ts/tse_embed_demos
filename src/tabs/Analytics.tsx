import { useCallback, useEffect, useRef, useState } from 'react';
import { LiveboardEmbed, useEmbedRef } from '@thoughtspot/visual-embed-sdk/react';
import { HostEvent, RuntimeFilterOp } from '@thoughtspot/visual-embed-sdk';
import { Wand2 } from 'lucide-react';
import {
  ANALYTICS_LIVEBOARD_ID,
  LIVEBOARD_EMBED_FLAGS,
  CADENCE_NAME_COLUMN,
  DATE_COLUMN,
} from '../config';
import { liveboardCustomizations } from '../lib/thoughtspot';
import SpotterModal from '../components/SpotterModal';
import OwnerCadenceFilter from '../components/OwnerCadenceFilter';
import DateRangeFilter, { DateSelection } from '../components/DateRangeFilter';

const Liveboard = LiveboardEmbed as unknown as (props: any) => JSX.Element;

export default function Analytics() {
  const [spotterOpen, setSpotterOpen] = useState(false);
  const liveboardRef = useEmbedRef<typeof LiveboardEmbed>();

  // Current host-side filter selections (kept in refs so applyFilters always
  // reads the latest values without re-creating callbacks).
  const cadencesRef = useRef<string[]>([]);
  const dateRef = useRef<DateSelection | null>(null);
  const filtersRef = useRef<any[]>([]);

  function buildFilters(): any[] {
    const f: any[] = [];
    if (cadencesRef.current.length)
      f.push({ columnName: CADENCE_NAME_COLUMN, operator: RuntimeFilterOp.IN, values: cadencesRef.current });
    const d = dateRef.current;
    if (d) {
      if (d.start != null && d.end != null)
        f.push({ columnName: DATE_COLUMN, operator: RuntimeFilterOp.BW_INC, values: [d.start, d.end] });
      else if (d.start != null)
        f.push({ columnName: DATE_COLUMN, operator: RuntimeFilterOp.GE, values: [d.start] });
      else if (d.end != null)
        f.push({ columnName: DATE_COLUMN, operator: RuntimeFilterOp.LE, values: [d.end] });
    }
    return f;
  }
  function applyFilters() {
    filtersRef.current = buildFilters();
    try {
      liveboardRef.current?.trigger(HostEvent.UpdateRuntimeFilters, filtersRef.current);
    } catch {
      /* readiness effect re-applies */
    }
  }
  const onCadenceApply = useCallback((cadences: string[]) => {
    cadencesRef.current = cadences;
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onDateApply = useCallback((sel: DateSelection | null) => {
    dateRef.current = sel;
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-apply any pending filters once the liveboard is ready to receive them.
  useEffect(() => {
    const embed = liveboardRef.current as any;
    if (!embed) return;
    let sub: any;
    try {
      sub = embed.subscribedEvent(HostEvent.UpdateRuntimeFilters);
    } catch {
      return;
    }
    const onReady = () => {
      if (filtersRef.current.length) {
        try {
          embed.trigger(HostEvent.UpdateRuntimeFilters, filtersRef.current);
        } catch {
          /* ignore */
        }
      }
    };
    embed.on(sub, onReady);
    return () => {
      try {
        embed.off(sub, onReady);
      } catch {
        /* ignore */
      }
    };
  }, [liveboardRef]);

  return (
    <div className="tab-analytics">
      <div className="analytics-toolbar">
        <div className="analytics-toolbar-left">
          <div>
            <h1 className="page-title">Analytics</h1>
            <p className="page-subtitle">Your live revenue performance dashboard</p>
          </div>
          <div className="analytics-filters">
            <OwnerCadenceFilter onApply={onCadenceApply} />
            <DateRangeFilter onApply={onDateApply} />
          </div>
        </div>
        <button
          className="salesloft-ai-btn"
          onClick={() => setSpotterOpen(true)}
        >
          <Wand2 size={18} strokeWidth={2.2} />
          <span>SALESLOFT AI</span>
        </button>
      </div>

      <div className="liveboard-wrapper">
        <Liveboard
          ref={liveboardRef}
          liveboardId={ANALYTICS_LIVEBOARD_ID}
          fullHeight
          isLiveboardMasterpiecesEnabled
          customizations={liveboardCustomizations()}
          {...LIVEBOARD_EMBED_FLAGS}
        />
      </div>

      <SpotterModal open={spotterOpen} onClose={() => setSpotterOpen(false)} />
    </div>
  );
}
