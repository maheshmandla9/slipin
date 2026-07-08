import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sendChat } from '../lib/api';
import { track } from '../lib/analytics';
import { useActivePersona } from '../store/appStore';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  blocked?: boolean;
}

// Session-only transcript — chat is never persisted, server- or client-side (PRD §9).
export default function Chat() {
  const persona = useActivePersona();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

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
    const res = await sendChat(persona, history.map(({ role, content }) => ({ role, content })));
    setBusy(false);
    if (!res.ok) {
      setNotice(res.message ?? 'Chat is unavailable right now.');
      if (res.errorCode === 'llm_error') track('llm_error', { fn: 'chat' });
      setMsgs(msgs); // roll back the unsent message
      setInput(content);
      return;
    }
    track(res.blocked ? 'moderation_blocked' : 'chat_msg');
    if (typeof res.remaining === 'number') setRemaining(res.remaining);
    setMsgs([...history, { role: 'assistant', content: res.reply ?? '…', blocked: res.blocked }]);
  };

  return (
    <main className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col px-4 py-4">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-lg font-bold">Talking with {persona.name}</h1>
          <p className="text-xs text-ink/50">
            A rehearsal mirror — feel the persona, then live it.{remaining !== null ? ` · ${remaining} messages left today` : ''}
          </p>
        </div>
        <Link to="/persona" className="text-sm text-ink/50 underline">persona</Link>
      </div>

      <div className="mt-3 flex-1 space-y-3 overflow-y-auto rounded-xl border border-ink/10 bg-white p-4">
        {msgs.length === 0 && (
          <div className="text-sm text-ink/50">
            <p>Ask {persona.name} things like:</p>
            <ul className="mt-2 space-y-1">
              <li>“How do you feel right before a job interview?”</li>
              <li>“How would you handle what happened to me today?”</li>
              <li>“Walk me into tomorrow morning as you.”</li>
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
          placeholder={`Say something to ${persona.name}…`}
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
