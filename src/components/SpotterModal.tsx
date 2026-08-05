// Salesloft AI — a custom two-column Spotter experience (opened from the
// Analytics "SALESLOFT AI" button). Left: the Spotter answer canvas with a
// branded empty-state landing (Salesloft logo + worksheet-specific sample
// questions). Right: a "Salesloft AI" expert pane that tracks the question
// history, takes follow-ups, and — after the first question — shows a trial /
// upgrade banner. Questions drive the Spotter via HostEvent.SpotterSearch.
import { useCallback, useEffect, useRef, useState } from 'react';
import { SpotterEmbed, useEmbedRef } from '@thoughtspot/visual-embed-sdk/react';
import { HostEvent } from '@thoughtspot/visual-embed-sdk';
import { Wand2, X, ArrowUp, ExternalLink, AlertTriangle } from 'lucide-react';
import {
  WORKSHEET_ID,
  SPOTTER_EMBED_FLAGS,
  SALESLOFT_SAMPLE_QUESTIONS,
  SALESLOFT_TRIAL_QUESTIONS,
  SALESLOFT_UPGRADE_URL,
} from '../config';
import { tsCustomizations } from '../lib/thoughtspot';
import { useTheme } from '../context/ThemeContext';
import SalesloftLogo from './SalesloftLogo';

// Cast to allow extra spotter flags not in the published prop types.
const Spotter = SpotterEmbed as unknown as (props: any) => JSX.Element;

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Turn {
  role: 'user' | 'assistant';
  text: string;
}

const WELCOME: Turn = {
  role: 'assistant',
  text: 'Ask me about your revenue, cadences, meetings, and rep performance — I answer straight from your live Salesloft data with an interactive chart you can drill into.',
};

export default function SpotterModal({ open, onClose }: Props) {
  const { theme } = useTheme();
  const spotterRef = useEmbedRef<typeof SpotterEmbed>();
  const bodyRef = useRef<HTMLDivElement>(null);

  const [currentQuery, setCurrentQuery] = useState('');
  const [narrative, setNarrative] = useState<Turn[]>([WELCOME]);
  const [input, setInput] = useState('');

  // Stable no-op onData ref so keystrokes in the input don't re-init the embed.
  const onData = useCallback(() => {}, []);

  // Reset the pane each time the modal opens (the Spotter unmounts on close).
  useEffect(() => {
    if (open) {
      setNarrative([WELCOME]);
      setCurrentQuery('');
      setInput('');
    }
  }, [open]);

  // Keep the pane scrolled to the newest entry.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [narrative]);

  function send(preset?: string) {
    const q = (preset ?? input).trim();
    if (!q) return;
    setInput('');
    setNarrative((n) => [...n, { role: 'user', text: q }]);
    setCurrentQuery(q);
    try {
      spotterRef.current?.trigger(HostEvent.SpotterSearch, { query: q, executeSearch: true });
    } catch (e) {
      console.warn('[salesloft-ai] SpotterSearch failed:', e);
    }
  }

  if (!open) return null;

  const askedCount = narrative.filter((t) => t.role === 'user').length;
  const lastUserIdx = narrative.map((t) => t.role).lastIndexOf('user');
  const remaining = Math.max(0, SALESLOFT_TRIAL_QUESTIONS - askedCount);

  return (
    <div className="sl-ai-overlay" onClick={onClose}>
      <div className="sl-ai-modal" onClick={(e) => e.stopPropagation()}>
        {/* ---- Left: Spotter answer canvas + branded empty state ---- */}
        <div className="sl-ai-left">
          <div className="sl-ai-canvas">
            {!currentQuery && (
              <div className="sl-ai-empty">
                <SalesloftLogo className="sl-ai-empty-logo" />
                <h2 className="sl-ai-empty-title">Ask Salesloft AI</h2>
                <p className="sl-ai-empty-sub">
                  Ask any analytical question about your revenue, cadences, meetings, and
                  rep performance. Answers come straight from your live data with an
                  interactive chart you can drill into.
                </p>
                <div className="sl-ai-empty-chips">
                  {SALESLOFT_SAMPLE_QUESTIONS.map((q) => (
                    <button key={q} className="sl-ai-empty-chip" onClick={() => send(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Spotter
              key={theme}
              ref={spotterRef}
              worksheetId={WORKSHEET_ID}
              hideSampleQuestions
              onData={onData}
              frameParams={{ width: '100%', height: '100%' }}
              customizations={tsCustomizations(theme, true)}
              {...SPOTTER_EMBED_FLAGS}
            />
          </div>
        </div>

        {/* ---- Right: Salesloft AI expert pane ---- */}
        <div className="sl-ai-pane">
          <div className="sl-ai-pane-header">
            <div className="sl-ai-pane-brand">
              <Wand2 size={18} />
              <span>Salesloft AI</span>
            </div>
            <button className="sl-ai-pane-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="sl-ai-pane-body" ref={bodyRef}>
            {narrative.map((t, i) => {
              if (t.role === 'assistant') {
                return <p key={i} className="sl-ai-narrative">{t.text}</p>;
              }
              const version = narrative.slice(0, i + 1).filter((x) => x.role === 'user').length;
              return (
                <div key={i} className="sl-ai-query-card">
                  <span className="sl-ai-query-badge">V{version}</span>
                  <span className="sl-ai-query-text">{t.text}</span>
                  <div className="sl-ai-query-meta">
                    <span>Data session</span>
                    {i === lastUserIdx && <span className="sl-ai-query-viewing">Viewing</span>}
                  </div>
                </div>
              );
            })}

            {askedCount > 0 && (
              <a
                className="sl-ai-trial"
                href={SALESLOFT_UPGRADE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <AlertTriangle size={15} />
                <span>
                  {remaining} more question{remaining === 1 ? '' : 's'} left in your trial —
                  click here to upgrade for more.
                </span>
              </a>
            )}
          </div>

          <div className="sl-ai-pane-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask a follow up…"
            />
            <button onClick={() => send()} disabled={!input.trim()} aria-label="Send">
              <ArrowUp size={17} />
            </button>
          </div>

          <div className="sl-ai-pane-footer">
            <a href="https://www.salesloft.com/legal/privacy-notice" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
            <a href={SALESLOFT_UPGRADE_URL} target="_blank" rel="noopener noreferrer" className="sl-ai-pane-footer-upgrade">
              Upgrade <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
