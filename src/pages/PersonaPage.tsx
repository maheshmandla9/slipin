import { Link } from 'react-router-dom';
import Avatar, { ZONES } from '../components/avatar/Avatar';
import { emotionById, moduleMeta, traitById } from '../content';
import { useActivePersona, useAppStore } from '../store/appStore';
import type { Zone } from '../types';

export default function PersonaPage() {
  const persona = useActivePersona();
  const personas = useAppStore((s) => s.personas);
  const setActive = useAppStore((s) => s.setActivePersona);

  if (!persona) {
    return (
      <main className="p-10 text-center">
        <p className="text-ink/60">No persona yet.</p>
        <Link to="/" className="mt-2 inline-block text-accent underline">Create one →</Link>
      </main>
    );
  }

  const meta = moduleMeta(persona.module);
  const zoneCounts: Partial<Record<Zone, number>> = {};
  for (const id of persona.traitIds) {
    const t = traitById(id);
    if (t) zoneCounts[t.zone] = (zoneCounts[t.zone] ?? 0) + 1;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">{persona.name}</h1>
          <p className="text-sm text-ink/60">{meta.emoji} {meta.name} persona</p>
        </div>
        <div className="flex gap-2">
          {personas.length > 1 && (
            <select
              value={persona.id}
              onChange={(e) => setActive(e.target.value)}
              className="rounded-lg border border-ink/20 bg-white px-2 py-1.5 text-sm"
              aria-label="Switch persona"
            >
              {personas.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <Link to="/" className="rounded-lg border border-ink/20 px-3 py-1.5 text-sm hover:border-accent">+ New</Link>
        </div>
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(220px,1fr)_1.5fr]">
        <div className="flex justify-center">
          <Avatar
            className="w-full max-w-[260px]"
            zoneCounts={zoneCounts}
            emotionEnergy={Math.min(1, persona.emotions.reduce((a, e) => a + e.intensity, 0) / 30)}
          />
        </div>

        <div className="space-y-5">
          <blockquote className="rounded-xl border-l-4 border-accent bg-accent-soft/60 p-4 text-sm italic">
            “{persona.identityScript}”
          </blockquote>

          {ZONES.map((z) => {
            const traits = persona.traitIds.map(traitById).filter((t) => t && t.zone === z.id);
            if (!traits.length && z.id !== 'chest') return null;
            return (
              <div key={z.id}>
                <h3 className="text-xs font-bold uppercase tracking-wide text-ink/50">{z.label}</h3>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {traits.map((t) => (
                    <span key={t!.id} className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-ink/80">
                      {t!.name}
                    </span>
                  ))}
                  {z.id === 'chest' &&
                    persona.emotions.map((e) => {
                      const em = emotionById(e.id);
                      return em ? (
                        <span key={e.id} className="rounded-full bg-glow/25 px-3 py-1 text-xs font-medium text-ink/80">
                          {em.name} {e.intensity}/10
                        </span>
                      ) : null;
                    })}
                </div>
              </div>
            );
          })}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-ink/50">Signature gesture</h3>
            <p className="mt-1 text-sm text-ink/80">{persona.gesture}</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Link to="/today" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/85">
              📅 Start today's practice
            </Link>
            <span className="rounded-lg bg-ink/5 px-4 py-2 text-sm text-ink/40" title="Coming in Phase 3">
              💬 Chat — next phase
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
