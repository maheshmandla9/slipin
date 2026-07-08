import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sendChat, type ChatMode } from '../lib/api';
import { track } from '../lib/analytics';
import { useActivePersona } from '../store/appStore';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  blocked?: boolean;
}

// Two modes share this page (PRD §8): talk to the persona (a real person with
// the chosen qualities) or to Your Personal Guide (a coach for the journey).
// Each keeps its own session-only transcript — nothing is persisted (PRD §9).
const EMPTY: Record<ChatMode, Msg[]> = { persona: [], guide: [] };

export default function Chat() {
  const persona = useActivePersona();
  const [searchParams] = useSearchParams();
  // Deep-linkable so other pages (e.g. Persona) can send the user straight into
  // a specific tab instead of always landing on the persona chat by default.
  const [mode, setMode] = useState<ChatMode>(searchParams.get('mode') === 'guide' ? 'guide' : 'persona');
  const [conversations, setConversations] = useState<Record<ChatMode, Msg[]>>(EMPTY);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const msgs = conversations[mode];
  const setMsgs = (next: Msg[]) => setConversations((c) => ({ ...c, [mode]: next }));

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [msgs, busy]);

  if (!persona) {
    return (
      <main className="p-10 text-center">
        <p className="text-ink/60">Create a persona to chat with it.</p>
        <Link to="/" className="mt-2 inline-block text-accent underline">Start →</Link>
      </main>
    );
  }

  const send = async () => {
    const content = input.trim();
    if (!content || busy) return;
    setInput('');
    setNotice(null);
    const history: Msg[] = [...msgs, { role: 'user', content }];
    setMsgs(history);
    setBusy(true);
    const res = await sendChat(persona, history.map(({ role, content }) => ({ role, content })), mode);
    setBusy(false);
    if (!res.ok) {
      setNotice(res.message ?? 'Chat is unavailable right now.');
      if (res.errorCode === 'llm_error') track('llm_error', { fn: 'chat' });
      setMsgs(msgs); // roll back the unsent message
      setInput(content);
      return;
    }
    track(res.blocked ? 'moderation_blocked' : 'chat_msg', { mode });
    if (typeof res.remaining === 'number') setRemaining(res.remaining);
    setMsgs([...history, { role: 'assistant', content: res.reply ?? '…', blocked: res.blocked }]);
  };

  const isPersona = mode === 'persona';
  const title = isPersona ? `Chat with ${persona.name}` : 'Your Personal Guide';
  const subtitle = isPersona
    ? 'The person you designed — talk to them like they’re real.'
    : 'Your coach for the journey — what to practise, and how.';
  const placeholder = isPersona ? `Say something to ${persona.name}…` : 'Ask your guide anything…';
  const suggestions = isPersona
    ? ['“How do you feel right before a job interview?”', '“What do you do when someone’s rude to you?”', '“Tell me about your morning.”']
    : ['“What should I practise today?”', '“Give me a trick for speaking up in meetings.”', '“Help me debrief how today went.”'];

  const Tab = ({ value, label }: { value: ChatMode; label: string }) => (
    <button
      onClick={() => setMode(value)}
      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
        mode === value ? 'bg-accent text-white' : 'bg-ink/5 text-ink/60 hover:text-ink/80'
      }`}
      aria-pressed={mode === value}
    >
      {label}
    </button>
  );

  return (
    <main className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <Tab value="persona" label={`💬 ${persona.name}`} />
          <Tab value="guide" label="🧭 Your Personal Guide" />
        </div>
        <Link to="/persona" className="text-sm text-ink/50 underline">persona</Link>
      </div>

      <div className="mt-3">
        <h1 className="text-lg font-bold">{title}</h1>
        <p className="text-xs text-ink/50">
          {subtitle}
          {remaining !== null ? ` · ${remaining} messages left today` : ''}
        </p>
      </div>

      <div className="mt-3 flex-1 space-y-3 overflow-y-auto rounded-xl border border-ink/10 bg-white p-4">
        {msgs.length === 0 && (
          <div className="text-sm text-ink/50">
            <p>{isPersona ? `Ask ${persona.name} things like:` : 'Try asking your guide:'}</p>
            <ul className="mt-2 space-y-1">
              {suggestions.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
        {msgs.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
              m.role === 'user' ? 'ml-auto bg-accent text-white' : m.blocked ? 'bg-glow/20 text-ink/80' : 'bg-accent-soft text-ink/90'
            }`}
          >
            {m.content}
          </motion.div>
        ))}
        {busy && <div className="max-w-[85%] rounded-xl bg-accent-soft px-3 py-2 text-sm text-ink/40">…</div>}
        <div ref={endRef} />
      </div>

      {notice && <p className="mt-2 rounded-lg bg-glow/20 px-3 py-2 text-xs text-ink/70">{notice}</p>}

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={1000}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-accent focus:outline-none"
          aria-label="Chat message"
        />
        <button type="submit" disabled={busy || !input.trim()} className="rounded-lg bg-accent px-5 py-2 font-semibold text-white enabled:hover:bg-accent/85 disabled:opacity-40">
          Send
        </button>
      </form>
      <p className="mt-2 text-center text-[11px] text-ink/40">Chat lives only in this tab — nothing is stored. 20 messages/day per persona.</p>
    </main>
  );
}
