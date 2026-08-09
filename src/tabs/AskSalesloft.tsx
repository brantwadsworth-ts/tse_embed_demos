// Ask Salesloft — the custom Salesloft AI experience (moved here from the
// Analytics "SALESLOFT AI" modal). Left: the Spotter answer canvas with a
// branded empty-state landing (logo + worksheet sample questions) and its own
// input bar hidden. Right: a "Salesloft AI" expert pane that tracks the
// question history and takes follow-ups.
//
// Each question is routed (via routeMessage): general Salesloft questions
// (what/how/docs/business) are answered as text with documentation links here
// in the pane; data/analytics questions drive the Spotter canvas via
// HostEvent.SpotterSearch. After the 2nd question a pervasive trial modal appears.
import { useCallback, useEffect, useRef, useState } from 'react';
import { SpotterEmbed, useEmbedRef } from '@thoughtspot/visual-embed-sdk/react';
import { HostEvent } from '@thoughtspot/visual-embed-sdk';
import { Wand2, ArrowUp, PlayCircle, Sparkles, ExternalLink } from 'lucide-react';
import {
  WORKSHEET_ID,
  SPOTTER_EMBED_FLAGS,
  SALESLOFT_SAMPLE_QUESTIONS,
  SALESLOFT_TRIAL_QUESTIONS,
  SALESLOFT_VIDEO_URL,
  HIDE_SPOTTER_INPUT_RULES,
} from '../config';
import { tsCustomizations } from '../lib/thoughtspot';
import { routeMessage, ChatTurn, DocLink } from '../lib/chatbot';
import { useTheme } from '../context/ThemeContext';
import SalesloftLogo from '../components/SalesloftLogo';
import TrialModal from '../components/TrialModal';

const Spotter = SpotterEmbed as unknown as (props: any) => JSX.Element;

interface Turn {
  role: 'user' | 'assistant';
  text: string;
  links?: DocLink[];
}

const WELCOME: Turn = {
  role: 'assistant',
  text: 'Ask me anything about Salesloft — what it does, cadences, docs, best practices — or ask about your own data (“revenue by week”, “top cadences by influenced pipeline”) and I’ll chart it live.',
};

/** Render assistant text with any raw URLs turned into clickable links. */
function renderText(text: string) {
  // Split on URLs, keeping them as their own parts (capturing group).
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer">
        {part.replace(/^https?:\/\//, '')}
      </a>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export default function AskSalesloft() {
  const { theme } = useTheme();
  const spotterRef = useEmbedRef<typeof SpotterEmbed>();
  const bodyRef = useRef<HTMLDivElement>(null);

  const [currentQuery, setCurrentQuery] = useState('');
  const [narrative, setNarrative] = useState<Turn[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [trialOpen, setTrialOpen] = useState(false);

  // Stable no-op onData so keystrokes in the input don't re-init the embed.
  const onData = useCallback(() => {}, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [narrative, loading]);

  async function send(preset?: string) {
    const q = (preset ?? input).trim();
    if (!q || loading) return;
    const history: ChatTurn[] = narrative.map((t) => ({ role: t.role, content: t.text }));
    const nextCount = narrative.filter((t) => t.role === 'user').length + 1;
    setInput('');
    setNarrative((n) => [...n, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const result = await routeMessage(history, q);
      if (result.kind === 'analytics') {
        // Data question → drive the Spotter canvas, note the preamble in the pane.
        setCurrentQuery(result.query);
        try {
          spotterRef.current?.trigger(HostEvent.SpotterSearch, {
            query: result.query,
            executeSearch: true,
          });
        } catch (e) {
          console.warn('[salesloft-ai] SpotterSearch failed:', e);
        }
        if (result.preamble.trim()) {
          setNarrative((n) => [...n, { role: 'assistant', text: result.preamble }]);
        }
      } else {
        // General Salesloft question → answer as text (with doc links) in the pane.
        setNarrative((n) => [...n, { role: 'assistant', text: result.text, links: result.links }]);
      }
    } finally {
      setLoading(false);
    }
    // Show the trial prompt exactly once — on the 3rd question, never again.
    if (nextCount === 3) setTrialOpen(true);
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
                return (
                  <div key={i} className="sl-ai-narrative">
                    <p>{renderText(t.text)}</p>
                    {t.links && t.links.length > 0 && (
                      <div className="sl-ai-doclinks">
                        {t.links.map((l) => (
                          <a
                            key={l.url}
                            className="sl-ai-doclink"
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {l.label} <ExternalLink size={12} />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
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

            {loading && (
              <span className="sl-ai-typing" aria-label="Thinking">
                <i /> <i /> <i />
              </span>
            )}
          </div>

          <div className="sl-ai-pane-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask a follow up…"
            />
            <button onClick={() => send()} disabled={!input.trim() || loading} aria-label="Send">
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
