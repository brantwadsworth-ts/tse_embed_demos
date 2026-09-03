import { useEffect, useRef, useState } from 'react';
import { X, ArrowUp } from 'lucide-react';
import { BodylessConversation } from '@thoughtspot/visual-embed-sdk';
import { routeMessage, ChatTurn } from '../lib/chatbot';

interface ChatBotProps {
  worksheetId: string;
  greeting: string;
}

interface Msg {
  id: number;
  role: 'user' | 'assistant';
  text?: string;
  container?: HTMLElement;
  loading?: boolean;
  error?: boolean;
}

let idSeq = 1;

function MerlinIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* Wizard hat */}
      <path
        d="M12 2L7 16h10L12 2z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Hat brim */}
      <ellipse cx="12" cy="16" rx="6" ry="2" fill="currentColor" opacity="0.7" />
      {/* Stars */}
      <circle cx="9" cy="8" r="0.8" fill="white" opacity="0.85" />
      <circle cx="14" cy="11" r="0.65" fill="white" opacity="0.75" />
      <circle cx="11" cy="5.5" r="0.5" fill="white" opacity="0.9" />
    </svg>
  );
}

function AnswerEmbed({ container }: { container: HTMLElement }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (node && container) node.appendChild(container);
    return () => {
      if (node && container && node.contains(container)) node.removeChild(container);
    };
  }, [container]);
  return <div className="chat-answer" ref={ref} />;
}

export default function ChatBot({ worksheetId, greeting }: ChatBotProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 0, role: 'assistant', text: greeting },
  ]);
  const convRef = useRef<BodylessConversation | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 1e9, behavior: 'smooth' });
  }, [msgs, open]);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    convRef.current = null;
    setMsgs([{ id: idSeq++, role: 'assistant', text: greeting }]);
  }, [worksheetId, greeting]);

  function getConversation() {
    if (!convRef.current) {
      convRef.current = new BodylessConversation({ worksheetId });
    }
    return convRef.current;
  }

  const update = (id: number, patch: Partial<Msg>) =>
    setMsgs((m) => m.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setInput('');
    setBusy(true);

    const history: ChatTurn[] = msgs
      .filter((m) => m.text)
      .map((m) => ({ role: m.role, content: m.text as string }));

    const userMsg: Msg = { id: idSeq++, role: 'user', text: q };
    const reply: Msg = { id: idSeq++, role: 'assistant', loading: true };
    setMsgs((m) => [...m, userMsg, reply]);

    try {
      const result = await routeMessage(history, q);
      if (result.kind === 'text') {
        update(reply.id, { text: result.text, loading: false });
      } else {
        update(reply.id, { text: result.preamble, loading: true });
        const { container, error } = await getConversation().sendMessage(result.query);
        if (error || !container) {
          update(reply.id, {
            loading: false,
            error: true,
            text:
              (result.preamble ? result.preamble + '\n\n' : '') +
              'I couldn\'t load that analytics result. Make sure you\'re signed in to ThoughtSpot and the data model is reachable.',
          });
        } else {
          update(reply.id, { text: result.preamble, container, loading: false });
        }
      }
    } catch {
      update(reply.id, {
        loading: false,
        error: true,
        text: 'Something went wrong. Please try again.',
      });
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  if (!open) {
    return (
      <button
        className="chat-fab"
        onClick={() => setOpen(true)}
        aria-label="Open Merlin AI"
      >
        <MerlinIcon size={24} />
      </button>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-title">
          <MerlinIcon size={20} />
          <span>Merlin</span>
        </div>
        <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {msgs.map((m) => (
          <div key={m.id} className={`chat-msg ${m.role}`}>
            <div className={`chat-bubble ${m.error ? 'is-error' : ''}`}>
              {m.text && <p className="chat-text">{m.text}</p>}
              {m.loading && (
                <span className="chat-typing">
                  <i /> <i /> <i />
                </span>
              )}
              {m.container && <AnswerEmbed container={m.container} />}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input-row">
        <textarea
          className="chat-input"
          rows={1}
          placeholder="Ask Merlin…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          className="chat-send"
          onClick={send}
          disabled={!input.trim() || busy}
          aria-label="Send"
        >
          <ArrowUp size={18} />
        </button>
      </div>
    </div>
  );
}
