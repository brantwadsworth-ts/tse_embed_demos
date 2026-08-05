// Ask Salesloft — the custom Salesloft AI experience (moved here from the
// Analytics "SALESLOFT AI" modal). Left: the Spotter answer canvas with a
// branded empty-state landing (logo + worksheet sample questions) and its own
// input bar hidden. Right: a "Salesloft AI" expert pane that tracks the
// question history and takes follow-ups. After the 2nd question a pervasive
// trial/upgrade modal appears. Questions drive Spotter via HostEvent.SpotterSearch.
import { useCallback, useEffect, useRef, useState } from 'react';
import { SpotterEmbed, useEmbedRef } from '@thoughtspot/visual-embed-sdk/react';
import { HostEvent } from '@thoughtspot/visual-embed-sdk';
import { Wand2, ArrowUp, PlayCircle, Sparkles } from 'lucide-react';
import {
  WORKSHEET_ID,
  SPOTTER_EMBED_FLAGS,
  SALESLOFT_SAMPLE_QUESTIONS,
  SALESLOFT_TRIAL_QUESTIONS,
  SALESLOFT_VIDEO_URL,
  HIDE_SPOTTER_INPUT_RULES,
} from '../config';
import { tsCustomizations } from '../lib/thoughtspot';
import { useTheme } from '../context/ThemeContext';
import SalesloftLogo from '../components/SalesloftLogo';
import TrialModal from '../components/TrialModal';

const Spotter = SpotterEmbed as unknown as (props: any) => JSX.Element;

interface Turn {
  role: 'user' | 'assistant';
  text: string;
}

const WELCOME: Turn = {
  role: 'assistant',
  text: 'Ask me about your revenue, cadences, meetings, and rep performance — I answer straight from your live Salesloft data with an interactive chart you can drill into.',
};

export default function AskSalesloft() {
  const { theme } = useTheme();
  const spotterRef = useEmbedRef<typeof SpotterEmbed>();
  const bodyRef = useRef<HTMLDivElement>(null);

  const [currentQuery, setCurrentQuery] = useState('');
  const [narrative, setNarrative] = useState<Turn[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [trialOpen, setTrialOpen] = useState(false);

  // Stable no-op onData so keystrokes in the input don't re-init the embed.
  const onData = useCallback(() => {}, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [narrative]);

  function send(preset?: string) {
    const q = (preset ?? input).trim();
    if (!q) return;
    const nextCount = narrative.filter((t) => t.role === 'user').length + 1;
    setInput('');
    setNarrative((n) => [...n, { role: 'user', text: q }]);
    setCurrentQuery(q);
    try {
      spotterRef.current?.trigger(HostEvent.SpotterSearch, { query: q, executeSearch: true });
    } catch (e) {
      console.warn('[salesloft-ai] SpotterSearch failed:', e);
    }
    // Pervasive trial prompt from the 2nd question onward.
    if (nextCount >= 2) setTrialOpen(true);
  }

  const askedCount = narrative.filter((t) => t.role === 'user').length;
  const lastUserIdx = narrative.map((t) => t.role).lastIndexOf('user');
  const remaining = Math.max(0, SALESLOFT_TRIAL_QUESTIONS - askedCount);

  return (
    <div className="tab-ask">
      <div className="sl-ai-page">
        {/* ---- Left: Spotter answer canvas + branded empty state ---- */}
        <div className="sl-ai-left">
          <div className="sl-ai-canvas">
            {!currentQuery && (
              <div className="sl-ai-empty">
                <SalesloftLogo className="sl-ai-empty-logo" size={58} wordmark={false} />
                <span className="sl-ai-empty-eyebrow">
                  <Sparkles size={14} /> Powered by Salesloft AI
                </span>
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
              customizations={tsCustomizations(theme, true, HIDE_SPOTTER_INPUT_RULES)}
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
          </div>

          <div className="sl-ai-pane-body" ref={bodyRef}>
            <a
              className="sl-ai-watch-video"
              href={SALESLOFT_VIDEO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <PlayCircle size={16} /> Watch video
            </a>

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
            <span>Powered by Salesloft</span>
          </div>
        </div>
      </div>

      <TrialModal open={trialOpen} remaining={remaining} onClose={() => setTrialOpen(false)} />
    </div>
  );
}
