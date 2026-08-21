import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import GaugeChart from './GaugeChart';
import { THOUGHTSPOT_HOST, WORKSHEET_ID } from '../config';

type SubTab = 'investigation' | 'std';

interface Metric {
  label: string;
  column: string;
  tab: SubTab;
}

const METRICS: Metric[] = [
  { label: '% DOB Provided', column: '% DOB Provided', tab: 'investigation' },
  { label: '% Race Provided', column: '% Race Provided', tab: 'investigation' },
  { label: '% Ethnicity Provided', column: '% Ethnicity Provided', tab: 'investigation' },
  { label: '% ZIP Provided', column: '% ZIP Provided', tab: 'investigation' },
  { label: '% Diagnosis Date', column: '% Diagnosis Date Provided', tab: 'investigation' },
  { label: '% Onset Date', column: '% Onset Date Provided', tab: 'investigation' },
  { label: '% Hospitalization', column: '% Hospitalization Provided', tab: 'std' },
  { label: '% CMI Complete', column: '% CMI Complete', tab: 'std' },
  { label: '% Interviewed', column: '% Interviewed', tab: 'std' },
  { label: '% HIV Referred', column: '% HIV Referred', tab: 'std' },
  { label: '% Appropriate Treatment', column: '% Appropriate Treatment', tab: 'std' },
  { label: '% Cases Closed', column: '% Cases Closed', tab: 'std' },
];

export default function DeliverableGauges() {
  const { username, password } = useAuth();
  const [values, setValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('investigation');

  useEffect(() => {
    if (!username || !password) return;

    const columns = METRICS.map((m) => m.column);
    const query = columns.join(', ');

    const url = `${THOUGHTSPOT_HOST}/api/rest/2.0/searchdata`;
    const body = {
      query_string: query,
      logical_table_identifier: WORKSHEET_ID,
      data_format: 'COMPACT',
      record_size: 1,
    };

    const creds = btoa(`${username}:${password}`);

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${creds}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((data) => {
        const columnNames: string[] = data?.contents?.[0]?.column_names ?? [];
        const rows: (number | null)[][] = data?.contents?.[0]?.data_rows ?? [];
        const row = rows[0] ?? [];
        const map: Record<string, number> = {};
        columnNames.forEach((col, i) => {
          const raw = row[i];
          if (typeof raw === 'number') {
            map[col] = raw * (raw <= 1 ? 100 : 1);
          }
        });
        setValues(map);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [username, password]);

  const displayed = METRICS.filter((m) => m.tab === activeSubTab);

  return (
    <div className="deliverable-gauges">
      <div className="gauge-subtabs">
        <button
          className={`gauge-subtab ${activeSubTab === 'investigation' ? 'is-active' : ''}`}
          onClick={() => setActiveSubTab('investigation')}
        >
          Investigation Page
        </button>
        <button
          className={`gauge-subtab ${activeSubTab === 'std' ? 'is-active' : ''}`}
          onClick={() => setActiveSubTab('std')}
        >
          STD Page
        </button>
      </div>

      {loading && (
        <div className="gauge-loading">Loading completeness metrics…</div>
      )}
      {error && (
        <div className="gauge-error">Unable to load metrics: {error}</div>
      )}
      {!loading && !error && (
        <div className="gauge-grid">
          {displayed.map((m) => (
            <GaugeChart
              key={m.column}
              label={m.label}
              value={values[m.column] ?? 0}
              target={95}
              size={148}
            />
          ))}
        </div>
      )}
    </div>
  );
}
