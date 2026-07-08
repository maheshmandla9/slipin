import { useState } from 'react';
import { Link } from 'react-router-dom';
import { newId, todayStr, useActivePersona, useAppStore } from '../store/appStore';

/** The retention core: a visible "proof I'm changing" timeline (BRD §5). */
export default function Evidence() {
  const persona = useActivePersona();
  const { evidence, addEvidence, streak, logs } = useAppStore();
  const [text, setText] = useState('');

  if (!persona) {
    return (
      <main className="p-10 text-center">
        <p className="text-ink/60">Create a persona first.</p>
        <Link to="/" className="mt-2 inline-block text-accent underline">Start →</Link>
      </main>
    );
  }

  const mine = evidence.filter((e) => e.personaId === persona.id).sort((a, b) => b.date.localeCompare(a.date));

  // last 14 days activity dots
  const days: { date: string; active: boolean }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    days.push({ date: ds, active: logs.some((l) => l.personaId === persona.id && l.date === ds && l.debrief) });
  }

  const submit = () => {
    if (!text.trim()) return;
    addEvidence({ id: newId(), date: todayStr(), personaId: persona.id, text: text.trim().slice(0, 200) });
    setText('');
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-bold">Proof you're becoming {persona.name}</h1>
      <div className="mt-2 flex items-center gap-3 text-sm text-ink/60">
        <span>{streak > 0 ? `🔥 ${streak}-day streak` : 'No streak yet — close today with a debrief'}</span>
        <span className="flex gap-1" aria-label="last 14 days">
          {days.map((d) => (
            <span key={d.date} title={d.date} className={`h-2.5 w-2.5 rounded-full ${d.active ? 'bg-accent' : 'bg-ink/10'}`} />
          ))}
        </span>
      </div>

      <div className="mt-6 rounded-xl border border-ink/10 bg-white p-4">
        <label className="text-sm font-medium">Evidence hunt: log one real moment that matched who you're becoming</label>
        <div className="mt-2 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={200}
            placeholder="e.g. Held eye contact through the whole introduction"
            className="flex-1 rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
          <button onClick={submit} disabled={!text.trim()} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white enabled:hover:bg-accent/85 disabled:opacity-40">
            Log it
          </button>
        </div>
      </div>

      <ol className="mt-6 space-y-3">
        {mine.length === 0 && (
          <p className="text-sm text-ink/50">Nothing here yet. Wins from your evening debriefs land here automatically — or log one above right now.</p>
        )}
        {mine.map((e) => (
          <li key={e.id} className="rounded-xl border border-ink/10 bg-white p-3">
            <p className="text-sm text-ink/85">{e.text}</p>
            <p className="mt-1 text-xs text-ink/40">{e.date}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
