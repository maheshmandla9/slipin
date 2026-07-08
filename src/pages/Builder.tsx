import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Avatar, { ZONES } from '../components/avatar/Avatar';
import { EMOTIONS, MODULES, PACKS, TRAITS, moduleMeta, packsForModule } from '../content';
import { newId, useAppStore } from '../store/appStore';
import { track } from '../lib/analytics';
import type { EmotionSetting, ModuleId, Pack, Persona, Zone } from '../types';

// Curated gesture options (safety: no free-text persona content at MVP beyond the name)
const GESTURES = [
  ...new Set([
    ...PACKS.map((p) => p.gesture),
    'Slow exhale with both feet planted, shoulders rolling back',
    'One fist pressed briefly into the opposite palm — ready',
    'Hand over heart, one nod — decided',
  ]),
];

const MAX_EMOTIONS = 4;

// Modules where personas are typically inspired by a real or fictional figure —
// these get the optional "inspired by" field and the request-a-persona form (ADR-001).
const INSPIRATION_MODULES: ModuleId[] = ['icons', 'screen', 'anime', 'mimicry'];

export default function Builder() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const addPersona = useAppStore((s) => s.addPersona);

  const module = MODULES.find((m) => m.id === moduleId)?.id as ModuleId | undefined;
  const packs = module ? packsForModule(module) : [];

  const [pack, setPack] = useState<Pack | null>(null);
  const [picked, setPicked] = useState(false); // true once user chose pack OR free-hand start
  const [traitIds, setTraitIds] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<EmotionSetting[]>([]);
  const [name, setName] = useState('');
  const [gesture, setGesture] = useState(GESTURES[0]);
  const [zone, setZone] = useState<Zone>('head');
  const [inspiration, setInspiration] = useState('');
  const [requestText, setRequestText] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const zoneCounts = useMemo(() => {
    const counts: Partial<Record<Zone, number>> = {};
    for (const id of traitIds) {
      const t = TRAITS.find((x) => x.id === id);
      if (t) counts[t.zone] = (counts[t.zone] ?? 0) + 1;
    }
    return counts;
  }, [traitIds]);

  if (!module) {
    return (
      <main className="p-10 text-center">
        Unknown module. <Link className="text-accent underline" to="/">Go home</Link>.
      </main>
    );
  }
  const meta = moduleMeta(module);

  const applyPack = (p: Pack) => {
    setPack(p);
    setTraitIds(p.traitIds);
    setEmotions(p.emotions);
    setGesture(p.gesture);
    if (p.inspiration) setInspiration(p.inspiration.label);
    setPicked(true);
  };

  const toggleTrait = (id: string) =>
    setTraitIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const toggleEmotion = (id: string) =>
    setEmotions((cur) =>
      cur.some((e) => e.id === id)
        ? cur.filter((e) => e.id !== id)
        : cur.length >= MAX_EMOTIONS
          ? cur
          : [...cur, { id, intensity: 5 }],
    );

  const setIntensity = (id: string, intensity: number) =>
    setEmotions((cur) => cur.map((e) => (e.id === id ? { ...e, intensity } : e)));

  const canSave = name.trim().length > 0 && traitIds.length > 0;

  const save = () => {
    if (!canSave) return;
    const identityScript =
      pack?.identityScript ??
      `I am someone who embodies ${traitIds
        .map((id) => TRAITS.find((t) => t.id === id)?.name.toLowerCase())
        .filter(Boolean)
        .slice(0, 4)
        .join(', ')} — and I practice it daily.`;
    const persona: Persona = {
      id: newId(),
      name: name.trim().slice(0, 30),
      module,
      traitIds,
      emotions,
      gesture,
      identityScript,
      createdAt: new Date().toISOString(),
      inspiration: inspiration.trim().slice(0, 60) || undefined,
    };
    addPersona(persona);
    track('persona_created', { module, traits: traitIds.length, fromPack: !!pack });
    navigate('/persona');
  };

  const sendRequest = () => {
    const text = requestText.trim();
    if (!text) return;
    track('persona_requested', { text: text.slice(0, 80), module });
    setRequestSent(true);
    setRequestText('');
  };

  // ---- Step 1: pick a pack (skipped for free-hand / modules without packs) ----
  if (!picked && packs.length > 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold">{meta.emoji} {meta.name}</h1>
        <p className="mt-1 text-ink/60">Start from a ready-made persona, or build free-hand.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {packs.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPack(p)}
              className="rounded-xl border border-ink/10 bg-white p-5 text-left shadow-sm transition hover:border-accent hover:shadow-md"
            >
              <div className="text-lg font-semibold">
                {p.animalMeta?.emoji ? `${p.animalMeta.emoji} ` : ''}{p.name}
              </div>
              <p className="mt-1 text-sm text-ink/60">{p.description}</p>
              <p className="mt-3 text-xs text-accent">{p.traitIds.length} traits · {p.emotions.length} emotions →</p>
            </button>
          ))}
          <button
            onClick={() => setPicked(true)}
            className="rounded-xl border border-dashed border-ink/20 p-5 text-left text-ink/60 transition hover:border-accent hover:text-accent"
          >
            <div className="text-lg font-semibold">🎨 Free-hand</div>
            <p className="mt-1 text-sm">Start empty and pick every trait yourself.</p>
          </button>
        </div>

        {INSPIRATION_MODULES.includes(module) && (
          <div className="mt-8 rounded-xl border border-ink/10 bg-accent-soft/40 p-4">
            <p className="text-sm font-semibold">Don't see who you're looking for?</p>
            {requestSent ? (
              <p className="mt-1 text-sm text-ink/60">Got it — thanks! Requests guide what we add next.</p>
            ) : (
              <form
                className="mt-2 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendRequest();
                }}
              >
                <input
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  maxLength={80}
                  placeholder="Request a persona — who inspires you?"
                  className="flex-1 rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-accent focus:outline-none"
                  aria-label="Request a persona"
                />
                <button type="submit" disabled={!requestText.trim()} className="rounded-lg border border-accent px-4 py-2 text-sm font-semibold text-accent enabled:hover:bg-accent-soft disabled:opacity-40">
                  Request
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    );
  }

  // ---- Step 2: dress the avatar ----
  const zoneTraits = TRAITS.filter((t) => t.zone === zone);
  const zoneMeta = ZONES.find((z) => z.id === zone)!;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-baseline justify-between gap-2">
        <h1 className="text-xl font-bold">{meta.emoji} {pack ? pack.name : `${meta.name} — free-hand`}</h1>
        <Link to="/" className="text-sm text-ink/50 underline">start over</Link>
      </div>

      <div className="mt-4 grid gap-6 md:grid-cols-[minmax(240px,1fr)_1.4fr]">
        {/* Avatar column */}
        <div className="flex flex-col items-center">
          <Avatar
            className="w-full max-w-[280px]"
            zoneCounts={zoneCounts}
            emotionEnergy={Math.min(1, emotions.reduce((a, e) => a + e.intensity, 0) / 30)}
            selectedZone={zone}
            onZoneClick={setZone}
          />
          <div className="mt-2 flex flex-wrap justify-center gap-1">
            {ZONES.map((z) => (
              <button
                key={z.id}
                onClick={() => setZone(z.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  zone === z.id ? 'bg-accent text-white' : 'bg-accent-soft text-ink/70 hover:bg-accent/20'
                }`}
              >
                {z.hint}{zoneCounts[z.id] ? ` · ${zoneCounts[z.id]}` : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Editor column */}
        <div>
          <h2 className="font-semibold">{zoneMeta.label}</h2>
          <div className="mt-3 space-y-2">
            {zoneTraits.map((t) => {
              const on = traitIds.includes(t.id);
              return (
                <motion.button
                  key={t.id}
                  layout
                  onClick={() => toggleTrait(t.id)}
                  aria-pressed={on}
                  className={`block w-full rounded-lg border p-3 text-left text-sm transition ${
                    on ? 'border-accent bg-accent-soft' : 'border-ink/10 bg-white hover:border-accent/50'
                  }`}
                >
                  <span className="font-medium">{on ? '✓ ' : ''}{t.name}</span>
                  <span className="mt-0.5 block text-xs text-ink/60">{t.description}</span>
                </motion.button>
              );
            })}
          </div>

          {zone === 'chest' && (
            <div className="mt-6">
              <h3 className="font-semibold">Emotional qualities <span className="text-xs font-normal text-ink/50">(up to {MAX_EMOTIONS}, with intensity)</span></h3>
              <div className="mt-2 space-y-2">
                {EMOTIONS.map((e) => {
                  const setting = emotions.find((x) => x.id === e.id);
                  return (
                    <div key={e.id} className={`rounded-lg border p-3 ${setting ? 'border-glow bg-glow/10' : 'border-ink/10 bg-white'}`}>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={!!setting} onChange={() => toggleEmotion(e.id)} className="accent-accent" />
                        <span className="font-medium">{e.name}</span>
                        <span className="text-xs text-ink/50">· level {e.hawkinsLevel} · {e.description}</span>
                      </label>
                      {setting && (
                        <div className="mt-2 flex items-center gap-3 pl-6">
                          <input
                            type="range"
                            min={e.intensityRange[0]}
                            max={e.intensityRange[1]}
                            value={setting.intensity}
                            onChange={(ev) => setIntensity(e.id, Number(ev.target.value))}
                            className="w-full accent-accent"
                            aria-label={`${e.name} intensity`}
                          />
                          <span className="w-8 text-right text-sm font-semibold text-accent">{setting.intensity}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Name + save bar */}
      <div className="sticky bottom-0 mt-8 rounded-t-xl border border-ink/10 bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-sm">
            <span className="font-medium">Persona name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              placeholder="e.g. Captain Nova, The Calm One, Marcus…"
              className="mt-1 w-full rounded-lg border border-ink/20 px-3 py-2 focus:border-accent focus:outline-none"
            />
          </label>
          {INSPIRATION_MODULES.includes(module) && (
            <label className="flex-1 text-sm">
              <span className="font-medium">Inspired by <span className="font-normal text-ink/50">(optional)</span></span>
              <input
                value={inspiration}
                onChange={(e) => setInspiration(e.target.value)}
                maxLength={60}
                placeholder="Who inspires this persona for you?"
                className="mt-1 w-full rounded-lg border border-ink/20 px-3 py-2 focus:border-accent focus:outline-none"
              />
            </label>
          )}
          <label className="flex-1 text-sm">
            <span className="font-medium">Signature gesture</span>
            <select
              value={gesture}
              onChange={(e) => setGesture(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-accent focus:outline-none"
            >
              {GESTURES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>
          <button
            onClick={save}
            disabled={!canSave}
            className="rounded-lg bg-accent px-6 py-2.5 font-semibold text-white transition enabled:hover:bg-accent/85 disabled:opacity-40"
          >
            Save persona
          </button>
        </div>
        {!canSave && (
          <p className="mt-2 text-xs text-ink/50">Pick at least one trait and give your persona a name.</p>
        )}
      </div>
    </main>
  );
}
